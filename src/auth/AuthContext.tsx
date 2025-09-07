import { createContext, useContext, useEffect, useState } from "react";
import { getJSON, postJSON } from "../lib/http";

type Role = "STUDENT" | "TEACHER";
type User = { id: string; name: string; email: string; role: Role };

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (p: { email: string; password: string }) => Promise<void>;
  signup: (p: { name: string; email: string; password: string; role?: Role }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<Ctx>({
  user: null,
  loading: true,
  async login() {},
  async signup() {},
  async logout() {},
  setUser() {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await getJSON<User>("/api/auth/me");
        if (active) setUser(me);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  async function login(p: { email: string; password: string }) {
    await postJSON<User>("/api/auth/login", p);
    const me = await getJSON<User>("/api/auth/me");  // hydrate immediately
    setUser(me);
  }

  async function signup(p: { name: string; email: string; password: string; role?: Role }) {
    await postJSON<User>("/api/auth/signup", p);
    const me = await getJSON<User>("/api/auth/me");
    setUser(me);
  }

  async function logout() {
    await postJSON("/api/auth/logout");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
