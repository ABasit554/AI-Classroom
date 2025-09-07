import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./auth.css";

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/helpwise";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(from, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="auth-wrap"><div className="auth-card">Loading…</div></div>;
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <header className="auth-header">
          <h2>Welcome back</h2>
          <p>Log in to access your classes, assignments, and Helpwise tools.</p>
        </header>

        <div className="auth-body">
          {err && <div className="auth-error">{err}</div>}

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="auth-label">
              Email
              <input
                type="email"
                className="auth-input"
                placeholder="jane@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-label pw-row">
              Password
              <input
                type={showPw ? "text" : "password"}
                className="auth-input"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                minLength={6}
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
                {busy ? "Logging in…" : "Log In"}
              </button>
              <Link to="/signup" className="btn-ghost" aria-label="Go to sign up">
                I’m new — create an account
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
