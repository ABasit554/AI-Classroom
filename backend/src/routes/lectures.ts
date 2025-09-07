import { Router, type Request, type Response } from "express";
import prisma from "../db";
import multer from "multer";
import path from "path";
import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const router = Router();


const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});
const upload = multer({ storage });


async function extractTextFromFile(absPath: string, mimeHint?: string): Promise<string> {
  const ext = path.extname(absPath).toLowerCase();
  const buf = await fs.promises.readFile(absPath);

  if (ext === ".pdf" || mimeHint?.includes("pdf")) {
    const res = await pdfParse(buf);
    return res.text || "";
  }
  if (ext === ".docx" || mimeHint?.includes("wordprocessingml.document")) {
    const res = await mammoth.extractRawText({ buffer: buf });
    return res.value || "";
  }
  return buf.toString("utf8");
}

function clampText(t: string, maxChars = 12000) {
  if (!t) return "";
  if (t.length <= maxChars) return t;
  const head = t.slice(0, Math.floor(maxChars * 0.7));
  const tail = t.slice(-Math.floor(maxChars * 0.2));
  return `${head}\n\n[…truncated…]\n\n${tail}`;
}

function splitIntoChunks(text: string, chunkSize = 2800): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = i + chunkSize;
    const slice = text.slice(i, Math.min(end + 400, text.length));
    const lastStop = Math.max(
      slice.lastIndexOf(". "),
      slice.lastIndexOf("! "),
      slice.lastIndexOf("? ")
    );
    const cut = lastStop > 0 ? i + lastStop + 1 : Math.min(end, text.length);
    chunks.push(text.slice(i, cut));
    i = cut;
  }
  return chunks.filter((c) => c.trim().length > 0);
}


type LenPreset = "short" | "medium" | "long";

function lengthParams(preset: LenPreset) {
  if (preset === "long")   return { min: 280, max: 900 };
  if (preset === "medium") return { min: 160, max: 600 };
  return { min: 80, max: 250 };
}

async function hfSummarizeOnce(text: string, preset: LenPreset): Promise<string> {
  const token = process.env.HF_API_KEY;
  if (!token) throw new Error("HF_MISSING_KEY");
  const model = process.env.HF_MODEL || "facebook/bart-large-cnn";
  const { min, max } = lengthParams(preset);

  const resp = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text,
      parameters: {
        min_length: min,
        max_length: max,
        do_sample: false,
        repetition_penalty: 1.05,
      },
      options: { wait_for_model: true },
    }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`HF ${resp.status} ${body || ""}`.trim());
  }
  const data = await resp.json();
  const s = Array.isArray(data) ? data[0]?.summary_text : data?.summary_text || data;
  return (typeof s === "string" ? s : "").trim() || "No summary.";
}

async function hfSummarize(text: string, preset: LenPreset): Promise<string> {
  const chunks = splitIntoChunks(text, 2800);
  if (chunks.length <= 1) return hfSummarizeOnce(chunks[0] || text, preset);

  const chunkPreset: LenPreset = preset === "long" ? "medium" : preset;
  const partials: string[] = [];
  for (const c of chunks) partials.push(await hfSummarizeOnce(c, chunkPreset));
  const combined = partials.join("\n\n");
  return hfSummarizeOnce(combined.slice(0, 6000), preset);
}

function fallbackSummarize(raw: string, preset: LenPreset = "medium"): string {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return "No readable text.\n";

  const base = preset === "long" ? 18 : preset === "medium" ? 12 : 6;

  const sentences = text
    .split(/(?<=[\.!\?])\s+(?=[A-Z0-9])/)
    .filter((s) => s.length > 20)
    .slice(0, 900);

  const stop = new Set([
    "the","a","an","and","or","but","if","then","else","for","to","of","in","on","at","by","with",
    "is","are","was","were","be","been","it","its","as","that","this","these","those","from","we",
    "you","your","they","their","he","she","his","her","our","us"
  ]);
  const freq = new Map<string, number>();
  for (const s of sentences) {
    for (const w of s.toLowerCase().match(/[a-z][a-z0-9'-]*/g) || []) {
      if (!stop.has(w) && w.length > 2) freq.set(w, (freq.get(w) || 0) + 1);
    }
  }
  const scored = sentences
    .map((s, i) => {
      const score = (s.toLowerCase().match(/[a-z][a-z0-9'-]*/g) || [])
        .reduce((sum, w) => sum + (freq.get(w) || 0), 0);
      return { i, s, score };
    })
    .sort((a, b) => b.score - a.score);

  const take = Math.min(sentences.length, base);
  const top = scored.slice(0, take).sort((a, b) => a.i - b.i).map((x) => x.s.trim());

  const third = Math.max(1, Math.floor(top.length / 3));
  const tldr = top.slice(0, third);
  const keypts = top.slice(third, third * 2);
  const details = top.slice(third * 2);

  return [
    "TL;DR:",
    ...tldr.map((s) => `• ${s}`),
    "",
    "Key Points:",
    ...keypts.map((s) => `• ${s}`),
    "",
    "Details:",
    ...details.map((s) => `• ${s}`),
  ].join("\n");
}


router.get("/:code/lectures", async (req: Request<{ code: string }>, res: Response) => {
  try {
    const code = String(req.params.code || "").trim().toLowerCase();
    const course = await prisma.course.findUnique({
      where: { code },
      include: { lectures: { orderBy: { date: "desc" } } },
    });
    if (!course) return res.json({ items: [] });
    return res.json({ items: course.lectures });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/:code/lectures", upload.single("file"), async (req: Request<{ code: string }>, res: Response) => {
  try {
    const code = String(req.params.code || "").trim().toLowerCase();
    const { title, date, classTitle, section } = (req.body ?? {}) as {
      title?: string;
      date?: string;
      classTitle?: string; 
      section?: string;
    };

    if (!code) return res.status(400).json({ error: "Missing class code" });
    if (!title) return res.status(400).json({ error: "title is required" });
    if (!req.file) return res.status(400).json({ error: "file is required" });

    const course = await prisma.course.upsert({
      where: { code },
      update: {},
      create: {
        code,
        title: (classTitle || code.toUpperCase()).trim(),
        section: section?.trim() || null,
      },
    });

    const data: Parameters<typeof prisma.lecture.create>[0]["data"] = {
      title: title.trim(),
      fileUrl: `/uploads/${req.file.filename}`,
      courseId: course.id,
    };
    if (date) data.date = new Date(date);

    const lecture = await prisma.lecture.create({ data });
    return res.status(201).json({ item: lecture });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:code/lectures/:id", async (req: Request<{ code: string; id: string }>, res: Response) => {
  try {
    const code = String(req.params.code || "").trim().toLowerCase();
    const { id } = req.params;

    const course = await prisma.course.findUnique({ where: { code } });
    if (!course) return res.status(404).json({ error: "Class not found" });

    const lecture = await prisma.lecture.findFirst({ where: { id, courseId: course.id } });
    if (!lecture) return res.status(404).json({ error: "Lecture not found" });

    await prisma.lecture.delete({ where: { id: lecture.id } });

    if (lecture.fileUrl?.startsWith("/uploads/")) {
      const abs = path.join(process.cwd(), lecture.fileUrl.replace(/^\//, ""));
      fs.promises.unlink(abs).catch(() => void 0);
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/:code/lectures/:id/summarize", async (req: Request<{ code: string; id: string }>, res: Response) => {
  try {
    const code = String(req.params.code || "").trim().toLowerCase();
    const { id } = req.params;

    const q = String((req.query as any)?.length || "medium").toLowerCase();
    const preset: LenPreset = (["short", "medium", "long"] as const).includes(q as LenPreset)
      ? (q as LenPreset)
      : "medium";

    const course = await prisma.course.findUnique({ where: { code } });
    if (!course) return res.status(404).json({ error: "Class not found" });

    const lecture = await prisma.lecture.findFirst({ where: { id, courseId: course.id } });
    if (!lecture) return res.status(404).json({ error: "Lecture not found" });

    if (!lecture.fileUrl || !lecture.fileUrl.startsWith("/uploads/")) {
      return res.status(400).json({ error: "Lecture file not found" });
    }

    const abs = path.join(process.cwd(), lecture.fileUrl.replace(/^\//, ""));
    if (!fs.existsSync(abs)) return res.status(404).json({ error: "File missing on server" });

    const textRaw = await extractTextFromFile(abs);
    const text = clampText(textRaw, 12000);
    if (!text.trim()) return res.status(400).json({ error: "No readable text in file" });

    if (process.env.HF_API_KEY) {
      try {
        const summary = await hfSummarize(text, preset);
        return res.json({ summary, provider: "huggingface", length: preset });
      } catch (err: any) {
        console.error("HF summarize error:", String(err?.message || err));
      }
    }

    const summary = fallbackSummarize(textRaw, preset);
    return res.json({
      summary:
        summary + (process.env.HF_API_KEY ? "\n\n(Note: HF unavailable; used local fallback.)" : ""),
      provider: "fallback",
      length: preset,
    });
  } catch (e: any) {
    console.error("Summarize route error:", e?.message || e);
    return res.status(500).json({ error: "Summarization failed", detail: String(e?.message || e) });
  }
});

export default router;
