import { useEffect, useMemo, useState } from "react";
import type { Lecture } from "./LectureItem";
import "./SummarizeModal.css";

const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

type Props = {
  open: boolean;
  classCode: string;
  lecture: Lecture | null;
  onClose: () => void;
};

export default function SummarizeModal({ open, classCode, lecture, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [provider, setProvider] = useState<"huggingface" | "fallback" | undefined>();
  const [length, setLength] = useState<"short" | "medium" | "long">("long"); // default to long

  useEffect(() => {
    if (!open) {
      setBusy(false);
      setErr(null);
      setSummary("");
      setProvider(undefined);
      setLength("long");
    }
  }, [open]);

  const title = useMemo(() => lecture?.title || "Lecture", [lecture]);

  async function handleSummarize() {
    if (!lecture) return;
    setBusy(true);
    setErr(null);
    setSummary("");
    setProvider(undefined);
    try {
      const url = `${API_BASE}/api/classes/${classCode}/lectures/${lecture.id}/summarize?length=${length}`;
      const res = await fetch(url, { method: "POST", credentials: "include" });
      if (!res.ok) {
        let msg = "Summarization failed";
        try {
          const j = await res.json();
          msg = j.detail || j.error || msg;
        } catch {
          msg = (await res.text().catch(() => "")) || msg;
        }
        throw new Error(msg);
      }
      const data = (await res.json()) as { summary: string; provider?: "huggingface" | "fallback"; length?: string };
      setSummary(data.summary || "");
      setProvider(data.provider);
    } catch (e: any) {
      setErr(e?.message || "Summarization failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summary);
      alert("Summary copied!");
    } catch {
      alert("Could not copy to clipboard.");
    }
  }

  function handleDownload() {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(title || "summary").replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  if (!open || !lecture) return null;

  return (
    <div className="sum-overlay" onClick={onClose}>
      <div
        className="sum-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sum-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sum-head">
          <h3 id="sum-title" className="sum-title">
            Summarize: <span className="sum-title-em">{title}</span>
          </h3>
          <button className="sum-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        {err && <div className="sum-error">{err}</div>}

        <div className="sum-actions">
          <button className="sum-btn primary" onClick={handleSummarize} disabled={busy}>
            {busy ? "Summarizing…" : "Generate Summary"}
          </button>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#555", fontSize: 13 }}>Length:</span>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value as "short" | "medium" | "long")}
              style={{ height: 32, borderRadius: 8, padding: "0 8px" }}
              disabled={busy}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </label>

          <div className="sum-hint">Uses AI to condense the lecture file.</div>
        </div>

        <div className="sum-body">
          {!busy && !err && !summary && (
            <div className="sum-empty">No summary yet. Click “Generate Summary”.</div>
          )}

          {!!summary && (
            <>
              <div className="sum-provider">
                {provider === "huggingface" && <span>Provider: Hugging Face</span>}
                {provider === "fallback" && <span>Provider: Local fallback</span>}
              </div>

              <pre className="sum-content">{summary}</pre>

              <div className="sum-actions-bottom">
                <button className="sum-btn" onClick={handleCopy}>Copy</button>
                <button className="sum-btn" onClick={handleDownload}>Download .txt</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
