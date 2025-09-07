import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AddLectureModal from "../components/AddLectureModal";
import SummarizeModal from "../components/SummarizeModal";
import LectureItem, { type Lecture } from "../components/LectureItem";
import "./classDetail.css";

const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

export default function ClassDetail() {
  const { code = "" } = useParams<{ code: string }>();
  const normalized = useMemo(() => (code || "").trim().toLowerCase(), [code]);

  const { user } = useAuth();
  const isTeacher = useMemo(
    () => String(user?.role || "").toUpperCase() === "TEACHER",
    [user]
  );

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [openSumm, setOpenSumm] = useState(false);
  const [summLecture, setSummLecture] = useState<Lecture | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setErr(null);

      if (!normalized) {
        if (active) {
          setErr("Missing class code in URL.");
          setLectures([]);
          setLoading(false);
        }
        return;
      }

      try {
        const url = `${API_BASE}/api/classes/${normalized}/lectures`;
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          const msg =
            (res.headers.get("content-type") || "").includes("application/json")
              ? (await res.json())?.error || "Failed to load lectures"
              : (await res.text()) || "Failed to load lectures";
          throw new Error(msg);
        }
        const { items } = (await res.json()) as { items: Lecture[] };
        if (active) setLectures(items || []);
      } catch (e: any) {
        if (active) {
          setErr(e?.message || "Failed to load lectures");
          setLectures([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [normalized]);

  function onCreated(newItem: Lecture) {
    setLectures((prev) => [newItem, ...prev]);
  }
  function onDeleted(id: string) {
    setLectures((prev) => prev.filter((lec) => lec.id !== id));
  }
  function onSummarize(lec: Lecture) {
    setSummLecture(lec);
    setOpenSumm(true);
  }

  return (
    <div className="cd-wrap">
      {/* Banner */}
      <div className="cd-banner">
        <div className="cd-crumbs">
          <Link to="/enrolled" className="cd-crumb">Enrolled</Link>
          <span className="cd-sep">›</span>
          <span className="cd-crumb current">{normalized || code}</span>
        </div>
        <h1 className="cd-title">Class</h1>
        <div className="cd-sub">Section C</div>
      </div>

      {/* Lectures card */}
      <div className="cd-card">
        <div className="cd-card-head">
          <div className="cd-card-title">Lectures</div>
          {isTeacher && (
            <button className="cd-btn primary" onClick={() => setOpenAdd(true)}>
              + Add Lecture
            </button>
          )}
        </div>

        {loading && <div className="cd-empty">Loading…</div>}
        {!loading && err && <div className="cd-error">{err}</div>}
        {!loading && !err && lectures.length === 0 && (
          <div className="cd-empty">No materials yet.</div>
        )}

        {!loading && !err && lectures.length > 0 && (
          <div className="cd-list" style={{ display: "grid", gap: 12 }}>
            {lectures.map((lec) => (
              <LectureItem
                key={lec.id}
                lecture={lec}
                allowDelete={isTeacher}
                onDelete={onDeleted}
                onSummarize={(l) => { setSummLecture(l); setOpenSumm(true); }}
                deleteUrlBase={`${API_BASE}/api/classes/${normalized}/lectures`}
              />
            ))}
          </div>
        )}
      </div>

      <AddLectureModal
        open={openAdd}
        classCode={normalized}
        onClose={() => setOpenAdd(false)}
        onCreated={onCreated}
        classTitle="English"
        section="C"
      />

      <SummarizeModal
        open={openSumm}
        classCode={normalized}
        lecture={summLecture}
        onClose={() => setOpenSumm(false)}
      />
    </div>
  );
}
