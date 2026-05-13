// Port backend — ubah VITE_API_PORT di .env jika perlu (default: 5000)
const BACKEND_PORT = import.meta.env.VITE_API_PORT || "5000";

function detectApiBase() {
  // Prioritas 1: eksplisit dari .env
  if (import.meta.env.VITE_API_BASE)     return import.meta.env.VITE_API_BASE;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;

  const { protocol, hostname } = window.location;

  // Prioritas 2: dev tunnel (format: name-PORT.region.devtunnels.ms)
  const tunnelMatch = hostname.match(
    /^(.+-)(\d+)(\.asse\.devtunnels\.ms|\.eus\.devtunnels\.ms|\.weu\.devtunnels\.ms|\.devtunnels\.ms)$/
  );
  if (tunnelMatch) {
    // Ganti port frontend (tunnelMatch[2]) dengan port backend
    return `${protocol}//${tunnelMatch[1]}${BACKEND_PORT}${tunnelMatch[3]}`;
  }

  // Prioritas 3: localhost / IP biasa
  return `${protocol}//${hostname}:${BACKEND_PORT}`;
}

const RAW_API_BASE  = detectApiBase();
const API_BASE_URL  = RAW_API_BASE.replace(/\/+$/, "");

function buildUrl(path) {
  if (!path)                    return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request(method, path, body, options = {}) {
  const url = buildUrl(path);

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options.signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson      = contentType.includes("application/json");

  const payload = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      payload?.detail ||
      payload?.error  ||
      payload?.message ||
      (typeof payload === "string" ? payload : "") ||
      `HTTP ${res.status}`;

    const err   = new Error(msg);
    err.status  = res.status;
    err.payload = payload;
    err.url     = url;
    throw err;
  }

  return { data: payload };
}

export const api = {
  get:     (path, options)       => request("GET",    path, undefined, options),
  post:    (path, body, options) => request("POST",   path, body,      options),
  put:     (path, body, options) => request("PUT",    path, body,      options),
  delete:  (path, options)       => request("DELETE", path, undefined, options),
  baseUrl: API_BASE_URL,
};

export default api;