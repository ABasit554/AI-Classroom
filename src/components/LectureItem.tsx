import { useState, type FC } from "react";

export type Lecture = {
  id: string;
  title: string;
  date: string;     
  fileUrl: string;  
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

type Props = {
  lecture: Lecture;

  allowDelete?: boolean;
  onDelete?: (id: string) => void;
  deleteUrlBase?: string;

  onSummarize?: (lecture: Lecture) => void;

  
  summarizeUrlBase?: string;
};

const LectureItem: FC<Props> = ({
  lecture,
  allowDelete,
  onDelete,
  deleteUrlBase,
  onSummarize,
  summarizeUrlBase,
}) => {
  const absoluteFileUrl =
    lecture.fileUrl.startsWith("http")
      ? lecture.fileUrl
      : `${import.meta.env.VITE_API_BASE || "http://localhost:4000"}${lecture.fileUrl}`;

  const [sumBusy, setSumBusy] = useState(false);
  const [sumErr, setSumErr] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");

  async function handleDelete() {
    if (!allowDelete || !deleteUrlBase) return;
    const yes = window.confirm(`Delete “${lecture.title}”? This cannot be undone.`);
    if (!yes) return;

    const resp = await fetch(`${deleteUrlBase}/${lecture.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!resp.ok) {
      const msg =
        (resp.headers.get("content-type") || "").includes("application/json")
          ? (await resp.json())?.error || "Delete failed"
          : (await resp.text()) || "Delete failed";
      alert(msg);
      return;
    }
    onDelete?.(lecture.id);
  }

  async function handleSummarize() {
    if (onSummarize) {
      onSummarize(lecture);
      return;
    }
    if (!summarizeUrlBase) return;
    try {
      setSumBusy(true);
      setSumErr(null);
      setSummary("");

      const resp = await fetch(`${summarizeUrlBase}/${lecture.id}/summarize`, {
        method: "POST",
        credentials: "include",
      });
      if (!resp.ok) {
        const msg =
          (resp.headers.get("content-type") || "").includes("application/json")
            ? (await resp.json())?.error || "Summarization failed"
            : (await resp.text()) || "Summarization failed";
        throw new Error(msg);
      }
      const data = (await resp.json()) as { summary: string };
      setSummary(data.summary || "");
    } catch (e: any) {
      setSumErr(e?.message || "Summarization failed");
    } finally {
      setSumBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: "14px 16px",
        borderRadius: 12,
        border: "1px solid #e8e8e8",
        background: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontWeight: 600 }}>{lecture.title}</div>
          <div style={{ color: "#666", fontSize: 13 }}>{formatDate(lecture.date)}</div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a
            href={absoluteFileUrl}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "underline" }}
          >
            View
          </a>

          <a href={absoluteFileUrl} download style={{ textDecoration: "underline" }}>
            Download
          </a>

          <button
            onClick={handleSummarize}
            style={{
              background: "transparent",
              border: "1px solid #0a5",
              color: "#0a5",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
            }}
            disabled={sumBusy}
            title={onSummarize ? "Open summarizer" : "Summarize inline"}
          >
            {sumBusy ? "Summarizing…" : "Summarize"}
          </button>

          {allowDelete && (
            <button
              onClick={handleDelete}
              style={{
                background: "transparent",
                border: "1px solid #e33",
                color: "#e33",
                borderRadius: 8,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {!onSummarize && (summary || sumErr) && (
        <div
          style={{
            borderTop: "1px solid #f0f0f0",
            paddingTop: 10,
            color: sumErr ? "#b00020" : "#111",
            whiteSpace: "pre-wrap",
            lineHeight: 1.5,
          }}
        >
          {sumErr ? sumErr : summary}
        </div>
      )}
    </div>
  );
};

export default LectureItem;
