export const API_ORIGIN = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

// En cross-domaine (frontend et backend sur des domaines differents), le JS
// ne peut pas lire le cookie csrftoken pose par le backend via document.cookie
// (il appartient au domaine du backend). Le backend renvoie donc le jeton
// dans le corps JSON de /api/accounts/csrf/, qu'on garde en memoire ici.
let csrfTokenCache = null;

export async function ensureCsrfCookie() {
  if (csrfTokenCache || getCookie("csrftoken")) return;
  const response = await fetch(`${API_ORIGIN}/api/accounts/csrf/`, { credentials: "include" });
  const data = await response.json().catch(() => ({}));
  if (data.csrfToken) csrfTokenCache = data.csrfToken;
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});

  if (MUTATING_METHODS.has(method)) {
    // Le token peut avoir change (Django le fait tourner a la connexion) :
    // on rafraichit systematiquement avant une mutation plutot que de se
    // fier a un cache qui pourrait etre perime.
    csrfTokenCache = null;
    await ensureCsrfCookie();
    const csrfToken = csrfTokenCache || getCookie("csrftoken");
    if (csrfToken) headers.set("X-CSRFToken", csrfToken);
  }

  return fetch(url, { ...options, method, credentials: "include", headers });
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || data.detail || "Erreur de communication");
    err.data = data;
    err.status = response.status;
    throw err;
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
