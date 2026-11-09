const LOCAL_API_URL = "http://localhost:3333/api";
const PRODUCTION_API_URL = "https://darkgrey-koala-546309.hostingersite.com/api";
const LOCAL_BACKEND_URL = "http://localhost:3333";
const PRODUCTION_BACKEND_URL = "https://darkgrey-koala-546309.hostingersite.com";

function isLocalHostname(hostname: string) {
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname);
}

function isLocalBrowser() {
  if (typeof window === "undefined") return false;
  return isLocalHostname(window.location.hostname);
}

function normalize(url?: string | null) {
  return (url || "").trim().replace(/\/+$/, "");
}

function pointsToLocalhost(url: string) {
  return /localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0/.test(url);
}

/**
 * Resolves the URL to use for a given environment.
 *
 * Next.js inlines `NEXT_PUBLIC_*` variables at build time, and `.env.local`
 * overrides `.env.production`. That means a build produced on a developer
 * machine can leak `http://localhost:3333` into a production bundle. To avoid
 * that, the runtime hostname always wins in the browser: a localhost value is
 * ignored when the app is served from a real domain.
 */
function resolveUrl(
  configured: string | undefined,
  localUrl: string,
  productionUrl: string
) {
  const cfg = normalize(configured);

  if (typeof window !== "undefined") {
    if (isLocalBrowser()) return localUrl;
    if (cfg && !pointsToLocalhost(cfg)) return cfg;
    return productionUrl;
  }

  // Server-side rendering / API routes.
  if (process.env.NODE_ENV === "production") {
    if (cfg && !pointsToLocalhost(cfg)) return cfg;
    return productionUrl;
  }

  return cfg || localUrl;
}

export function getApiUrl() {
  return resolveUrl(process.env.NEXT_PUBLIC_API_URL, LOCAL_API_URL, PRODUCTION_API_URL);
}

export function getServerApiUrl() {
  const backend = normalize(process.env.BACKEND_URL);
  const configured =
    normalize(process.env.NEXT_PUBLIC_API_URL) ||
    (backend ? `${backend}/api` : "");

  if (process.env.NODE_ENV === "production") {
    if (configured && !pointsToLocalhost(configured)) return configured;
    return PRODUCTION_API_URL;
  }

  return normalize(configured) || PRODUCTION_API_URL;
}

export function getBackendUrl() {
  return resolveUrl(process.env.NEXT_PUBLIC_BACKEND_URL, LOCAL_BACKEND_URL, PRODUCTION_BACKEND_URL);
}

export function toBackendAssetUrl(path: string | null | undefined) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${getBackendUrl()}/${path.replace(/^\//, "")}`;
}
