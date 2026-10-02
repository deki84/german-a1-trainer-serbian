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

const WEEKDAYS = ["Ne", "Po", "Ut", "Sr", "Če", "Pe", "Su"]; // Index = Date.getDay(), 0 = Sonntag

export type WeekDay = {
  day: string;
  label: string;
  trained: boolean;
  isToday: boolean;
};

// Die letzten 7 Tage bis heute, der älteste zuerst
export function lastSevenDays(log: DayLog, today: string): WeekDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(today, index - 6);
    const [y, m, d] = day.split("-").map(Number);
    const weekday = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1).getDay();
    return {
      day,
      label: WEEKDAYS[weekday] ?? "",
      trained: Boolean(log[day]),
      isToday: day === today,
    };
  });
}
