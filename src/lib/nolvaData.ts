/** Normalise une réponse API (tableau direct ou pagination Lucid { data, meta }). */
export function normalizeList<T = any>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object" && "data" in raw) {
    const d = (raw as { data?: unknown }).data;
    return Array.isArray(d) ? (d as T[]) : [];
  }
  return [];
}
