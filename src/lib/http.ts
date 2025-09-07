const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

function buildURL(path: string) {
  return /^https?:\/\//i.test(path) ? path : `${API_BASE}${path}`;
}

async function errorFromResponse(res: Response) {
  let msg = `HTTP ${res.status} ${res.statusText}`;
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json();
      msg = j?.error || j?.message || JSON.stringify(j);
    } else {
      const t = await res.text();
      if (t) msg = t;
    }
  } catch {}
  const err = new Error(msg);
  (err as any).status = res.status;
  return err;
}

export async function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(buildURL(path), {
    credentials: "include",          
    ...init,
    headers,
  });
  if (!res.ok) throw await errorFromResponse(res);
  return res;
}

export async function getJSON<T = any>(path: string): Promise<T> {
  return (await api(path)).json();
}
export async function postJSON<T = any>(path: string, data?: unknown): Promise<T> {
  const res = await api(path, { method: "POST", body: data ? JSON.stringify(data) : undefined });
  return res.status === 204 ? (undefined as unknown as T) : res.json();
}
export async function postForm<T = any>(path: string, form: FormData): Promise<T> {
  const res = await api(path, { method: "POST", body: form });
  return res.json();
}
