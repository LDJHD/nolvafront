const LOCAL_API_URL = "http://localhost:3333/api";
const PRODUCTION_API_URL = "https://darkgrey-koala-546309.hostingersite.com/api";
const LOCAL_BACKEND_URL = "http://localhost:3333";
const PRODUCTION_BACKEND_URL = "https://darkgrey-koala-546309.hostingersite.com";

function isLocalBrowser() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

export function getApiUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return isLocalBrowser() ? LOCAL_API_URL : PRODUCTION_API_URL;
}

export function getServerApiUrl() {
  const configured =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    (process.env.BACKEND_URL?.trim()
      ? `${process.env.BACKEND_URL.trim().replace(/\/$/, "")}/api`
      : "");

  return (configured || PRODUCTION_API_URL).replace(/\/$/, "");
}

export function getBackendUrl() {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return isLocalBrowser() ? LOCAL_BACKEND_URL : PRODUCTION_BACKEND_URL;
}

export function toBackendAssetUrl(path: string | null | undefined) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${getBackendUrl()}/${path.replace(/^\//, "")}`;
}
