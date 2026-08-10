export const API_ORIGIN = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function ensureCsrfCookie() {
  if (getCookie("csrftoken")) return;
  await fetch(`${API_ORIGIN}/api/accounts/csrf/`, { credentials: "include" });
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});

  if (MUTATING_METHODS.has(method)) {
    await ensureCsrfCookie();
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) headers.set("X-CSRFToken", csrfToken);
  }

  return fetch(url, { ...options, method, credentials: "include", headers });
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.detail || "Erreur de communication");
  }
  return data;
}

export async function apiJSON(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  const response = await apiFetch(path, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  return parseResponse(response);
}

export async function apiForm(path, formData, options = {}) {
  const response = await apiFetch(path, { ...options, body: formData });
  return parseResponse(response);
}

export async function apiGetJSON(path, options = {}) {
  const response = await apiFetch(path, { ...options, method: "GET" });
  return parseResponse(response);
}
