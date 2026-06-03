/** Resolve Laravel `/storage/...` paths to absolute URLs for `<img src>`. */
export function resolveOlympxMediaUrl(raw: string): string {
  const path = raw.trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  const base =
    process.env.NEXT_PUBLIC_OLYMPX_API_URL?.trim().replace(/\/+$/, "") ??
    "http://127.0.0.1:8000";

  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
