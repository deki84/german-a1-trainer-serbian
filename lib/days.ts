import { addDays } from "./srs";

export type DayStats = {
  newWords: number;
  reviews: number;
};

// Schlüssel ist das Datum "YYYY-MM-DD"
export type DayLog = Record<string, DayStats>;

function isDayStats(value: unknown): value is DayStats {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as DayStats).newWords === "number" &&
    typeof (value as DayStats).reviews === "number"
  );
}

export function parseDayLog(raw: string | null): DayLog {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null || Array.isArray(data)) return {};
    const log: DayLog = {};
    for (const [day, stats] of Object.entries(data)) {
      if (isDayStats(stats)) log[day] = { newWords: stats.newWords, reviews: stats.reviews };
    }
    return log;
  } catch {
    return {};
  }
}

// Gibt ein NEUES Objekt zurück, das alte bleibt unverändert
export function addSession(log: DayLog, day: string, stats: DayStats): DayLog {
  const before = log[day] ?? { newWords: 0, reviews: 0 };
  return {
    ...log,
    [day]: { newWords: before.newWords + stats.newWords, reviews: before.reviews + stats.reviews },
  };
}

export function newWordsOn(log: DayLog, day: string): number {
  return log[day]?.newWords ?? 0;
}

// Tage in Folge mit Training. Heute noch nicht trainiert? Dann zählt die Serie bis gestern.
export function streak(log: DayLog, today: string): number {
  let day = log[today] ? today : addDays(today, -1);
  let count = 0;
  while (log[day]) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}
