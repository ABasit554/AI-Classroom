import { type FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./auth.css";

type Role = "STUDENT" | "TEACHER";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: Role;
  }>({ name: "", email: "", password: "", role: "STUDENT" });

  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      nav("/helpwise");
    } catch (e: any) {
      setErr(e.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <header className="auth-header">
          <h2>Create your account</h2>
          <p>Join Class Connect to learn, share and grow together.</p>
        </header>

        <div className="auth-body">
          {err && <div className="auth-error">{err}</div>}

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="auth-label">
              Name
              <input
                className="auth-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
                required
              />
            </label>

            <label className="auth-label">
              Email
              <input
                type="email"
                className="auth-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@email.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-label">
              Role
              <select
                className="auth-input"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as Role })
                }
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </label>

            <label className="auth-label pw-row">
              Password
              <input
                type={showPw ? "text" : "password"}
                className="auth-input"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="At least 6 characters"
                minLength={6}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((s) => !s)}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </label>

            <div className="auth-actions">
              <button className="btn-primary" disabled={busy}>
                {busy ? "Creating account…" : "Sign Up"}
              </button>
              <Link to="/login" className="btn-ghost" aria-label="Go to login">
                I already have an account
              </Link>
            </div>
          </form>

          <div className="auth-foot">
            By continuing, you agree to our Terms and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
