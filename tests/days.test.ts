import { describe, expect, it } from "vitest";
import { addSession, lastSevenDays, newWordsOn, parseDayLog, streak } from "@/lib/days";

const today = "2026-10-01";

describe("parseDayLog", () => {
  it("liest gültige Tage und ignoriert kaputte", () => {
    const raw = JSON.stringify({
      "2026-10-01": { newWords: 5, reviews: 3 },
      "2026-09-30": { newWords: "fünf" },
    });
    expect(parseDayLog(raw)).toEqual({ "2026-10-01": { newWords: 5, reviews: 3 } });
  });

  it("stürzt bei kaputtem JSON nicht ab", () => {
    expect(parseDayLog("{kaputt")).toEqual({});
    expect(parseDayLog(null)).toEqual({});
  });
});

describe("addSession", () => {
  it("zählt mehrere Trainings am selben Tag zusammen", () => {
    const once = addSession({}, today, { newWords: 5, reviews: 2 });
    const twice = addSession(once, today, { newWords: 0, reviews: 4 });
    expect(twice[today]).toEqual({ newWords: 5, reviews: 6 });
  });

  it("verändert das alte Objekt nicht", () => {
    const log = {};
    addSession(log, today, { newWords: 5, reviews: 0 });
    expect(log).toEqual({});
  });

  it("newWordsOn liefert 0 für Tage ohne Training", () => {
    expect(newWordsOn({}, today)).toBe(0);
  });
});

describe("streak", () => {
  const day = (date: string) => ({ [date]: { newWords: 1, reviews: 0 } });

  it("0 ohne Training", () => {
    expect(streak({}, today)).toBe(0);
  });

  it("zählt Tage in Folge bis heute", () => {
    const log = { ...day("2026-09-29"), ...day("2026-09-30"), ...day(today) };
    expect(streak(log, today)).toBe(3);
  });

  it("heute noch nicht trainiert: Serie bis gestern bleibt bestehen", () => {
    const log = { ...day("2026-09-29"), ...day("2026-09-30") };
    expect(streak(log, today)).toBe(2);
  });

  it("eine Lücke beendet die Serie", () => {
    const log = { ...day("2026-09-28"), ...day(today) };
    expect(streak(log, today)).toBe(1);
  });

  it("klappt über den Monatswechsel", () => {
    const log = { ...day("2026-09-30"), ...day(today) };
    expect(streak(log, today)).toBe(2);
  });
});

describe("lastSevenDays", () => {
  it("liefert 7 Tage bis heute, der älteste zuerst", () => {
    const week = lastSevenDays({}, today);
    expect(week).toHaveLength(7);
    expect(week[0]?.day).toBe("2026-09-25");
    expect(week[6]?.day).toBe(today);
    expect(week[6]?.isToday).toBe(true);
  });

  it("markiert Tage mit Training", () => {
    const week = lastSevenDays({ "2026-09-30": { newWords: 5, reviews: 0 } }, today);
    expect(week.filter((day) => day.trained).map((day) => day.day)).toEqual(["2026-09-30"]);
  });

  it("hat serbische Wochentage", () => {
    // 2026-10-01 ist ein Donnerstag
    expect(lastSevenDays({}, today)[6]?.label).toBe("Če");
  });
});
