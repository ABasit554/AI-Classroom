import { useEffect, useState } from "react";
import { api } from "../lib/http";

export function useSession() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api("/api/auth/me");
        if (r.ok) setUser(await r.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { loading, user, setUser };
}
