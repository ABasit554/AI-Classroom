import { Link } from "react-router-dom";
import "./enrolled.css";

type ClassCardT = {
  id: string;
  title: string;
  section?: string;
  teacher?: string;
  color?: string;     // header color
  cover?: string;     // optional image
};

const classes: ClassCardT[] = [
  { id: "math101", title: "Mathematics 101", section: "A", teacher: "Ms. Rivera", color: "#173a8a" },
  { id: "phy201", title: "Physics 201", section: "B", teacher: "Dr. Chen", color: "#0b8457" },
  { id: "eng150", title: "English Literature", section: "C", teacher: "Mr. Malik", color: "#8a173a" },
  { id: "cs110",  title: "Intro to CS", section: "D", teacher: "Prof. Kaur", color: "#2e7da8" },
];

export default function Enrolled() {
  return (
    <section className="enr-wrap">
      <header className="enr-head">
        <h1>Enrolled classes</h1>
        <p>Pick a class to see its lectures and assignments.</p>
      </header>

      <div className="class-grid">
        {classes.map((c) => (
          <Link key={c.id} to={`/class/${c.id}`} className="class-card" style={{ borderTopColor: c.color }}>
            <div className="card-top" style={{ background: c.color }}>
              <div className="card-title">{c.title}</div>
              {c.section && <div className="card-sec">Section {c.section}</div>}
            </div>
            <div className="card-body">
              <div className="teacher">Teacher: {c.teacher ?? "—"}</div>
              <div className="chips">
                <span className="chip">Lectures</span>
                <span className="chip">Assignments</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
