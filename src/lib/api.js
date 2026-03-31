const RAW_API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5000";

const API_BASE_URL = RAW_API_BASE.replace(/\/+$/, "");

function buildUrl(path) {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Fetch JSON helper
 */
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
  const isJson = contentType.includes("application/json");

  const payload = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      payload?.detail ||
      payload?.error ||
      payload?.message ||
      (typeof payload === "string" ? payload : "") ||
      `HTTP ${res.status}`;

    const err = new Error(msg);
    err.status = res.status;
    err.payload = payload;
    err.url = url;
    throw err;
  }

  return { data: payload };
}

/**
 * Export `api` sesuai yang dipakai UserMapPage.jsx
 */
export const api = {
  get: (path, options) => request("GET", path, undefined, options),
  post: (path, body, options) => request("POST", path, body, options),
  put: (path, body, options) => request("PUT", path, body, options),
  delete: (path, options) => request("DELETE", path, undefined, options),
  baseUrl: API_BASE_URL,
};

export default api;