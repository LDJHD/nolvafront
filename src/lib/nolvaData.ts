/** Normalise une réponse API (tableau direct ou pagination Lucid { data, meta }). */
export function normalizeList<T = any>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object" && "data" in raw) {
    const d = (raw as { data?: unknown }).data;
    return Array.isArray(d) ? (d as T[]) : [];
  }
  return [];
}

/**
 * Retourne true si l'événement est passé (date antérieure à aujourd'hui, heure locale).
 * Accepte les deux formats renvoyés par l'API : `eventDate` (camelCase) ou `event_date`.
 */
export function isPastEvent(event: any): boolean {
  const dateStr = event?.eventDate || event?.event_date;
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}
