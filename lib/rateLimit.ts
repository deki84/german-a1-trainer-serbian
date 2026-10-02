const WINDOW_MS = 10 * 60 * 1000; // 10 Minuten
const MAX_REQUESTS = 20;

const hits = new Map<string, number[]>();

// Einfache Kostenbremse. Gilt pro Server-Instanz, für Produktion z. B. Upstash Redis nehmen.
export function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_REQUESTS;
}