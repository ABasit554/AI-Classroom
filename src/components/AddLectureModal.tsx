import { useMemo, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import "./AddLectureModal.css";

type Props = {
  open: boolean;
  classCode?: string;               
  onClose: () => void;
  onCreated: (lecture: any) => void;
  classTitle?: string;
  section?: string;
};

export default function AddLectureModal({
  open,
  classCode,
  onClose,
  onCreated,
  classTitle,
  section,
}: Props) {
  const { pathname } = useLocation();

  const effectiveCode = useMemo(() => {
    if (classCode && classCode.trim()) return classCode.trim();
    const segs = pathname.split("/").filter(Boolean);
    const last = segs[segs.length - 1] || "";
    return last;
  }, [classCode, pathname]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  function apiUrl(code: string) {
    return `/api/classes/${code.trim().toLowerCase()}/lectures`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!effectiveCode) {
      setErr("Missing class code for this page.");
      return;
    }
    if (!title.trim()) { setErr("Please enter a title"); return; }
    if (!file) { setErr("Please select a file"); return; }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      if (date) fd.append("date", date);
      fd.append("file", file);
      if (classTitle) fd.append("classTitle", classTitle);
      if (section) fd.append("section", section);

      const resp = await fetch(apiUrl(effectiveCode), {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      if (!resp.ok) {
        const ct = resp.headers.get("content-type") || "";
        const msg = ct.includes("application/json")
          ? (await resp.json())?.error ?? "Upload failed"
          : (await resp.text()) || "Upload failed";
        throw new Error(msg);
      }

      const { item } = await resp.json();
      onCreated(item);

      setTitle("");
      setDate(new Date().toISOString().slice(0, 10));
      setFile(null);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="al-overlay" onClick={onClose}>
      <div className="al-panel" onClick={(e) => e.stopPropagation()}>
        <div className="al-head">
          <h3>Add a lecture</h3>
          <button className="al-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        {err && <div className="al-error">{err}</div>}

        <form className="al-form" onSubmit={handleSubmit}>
          <label className="al-label">
            Title
            <input
              className="al-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lecture title"
              required
            />
          </label>

          <label className="al-label">
            Date
            <input
              type="date"
              className="al-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label className="al-label">
            File
            <input
              type="file"
              className="al-input"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </label>

          <div className="al-actions">
            <button type="button" className="al-btn ghost" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="al-btn primary" disabled={busy}>
              {busy ? "Uploading…" : "Add Lecture"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
