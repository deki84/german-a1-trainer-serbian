import { describe, expect, it } from "vitest";
import { LESSONS } from "@/data/lessons";
import { MAX_REVIEWS, NEW_WORDS, buildDailySession, newWordCount } from "@/lib/session";
import type { SrsState } from "@/lib/srs";

const today = "2026-10-01";
const firstWords = LESSONS.flatMap((lesson) => lesson.words).map((word) => word.de);

describe("newWordCount", () => {
  it("volle Anzahl bei wenigen Wiederholungen", () => {
    expect(newWordCount(0, 15)).toBe(5);
  });

  it("halb so viele ab der Hälfte der maximalen Wiederholungen", () => {
    expect(newWordCount(15, 15)).toBe(3);
  });

  it("keine neuen, wenn das Maximum erreicht ist", () => {
    expect(newWordCount(30, 15)).toBe(0);
  });
});

describe("buildDailySession", () => {
  it("erster Tag: nur neue Wörter aus der ersten Lektion, plus Wiederholung am Ende", () => {
    const session = buildDailySession({}, LESSONS, today, 15);
    const news = session.filter((item) => item.kind === "new");
    const rechecks = session.filter((item) => item.kind === "recheck");

    expect(news.map((item) => item.word.de)).toEqual(firstWords.slice(0, NEW_WORDS[15]));
    expect(news.every((item) => item.mode === "meaning")).toBe(true);
    expect(rechecks).toHaveLength(NEW_WORDS[15]);
    expect(rechecks.every((item) => item.mode === "translate")).toBe(true);
  });

  it("schon geübte Wörter sind nicht mehr neu", () => {
    const srs: SrsState = { [firstWords[0]!]: { box: 1, due: "2026-10-05" } };
    const news = buildDailySession(srs, LESSONS, today, 15).filter((item) => item.kind === "new");
    expect(news.map((item) => item.word.de)).not.toContain(firstWords[0]);
    expect(news[0]?.word.de).toBe(firstWords[1]);
  });

  it("fällige Wörter kommen zuerst, mit Fragetyp passend zur Box", () => {
    const srs: SrsState = {
      [firstWords[0]!]: { box: 1, due: "2026-09-30" },
      [firstWords[1]!]: { box: 2, due: "2026-10-01" },
      [firstWords[2]!]: { box: 3, due: "2026-10-05" },
    };
    const session = buildDailySession(srs, LESSONS, today, 15);
    const reviews = session.filter((item) => item.kind === "review");

    expect(reviews.map((item) => item.word.de).sort()).toEqual(
      [firstWords[0], firstWords[1]].sort(),
    );
    expect(session.slice(0, 2).every((item) => item.kind === "review")).toBe(true);
    expect(reviews.find((item) => item.word.de === firstWords[1])?.mode).toBe("translate");
  });

  it("bei sehr vielen fälligen Wörtern: begrenzt und keine neuen", () => {
    const srs: SrsState = {};
    for (const de of firstWords.slice(0, 100)) srs[de] = { box: 1, due: "2026-09-01" };

    const session = buildDailySession(srs, LESSONS, today, 15);
    expect(session.filter((item) => item.kind === "review")).toHaveLength(MAX_REVIEWS[15]);
    expect(session.filter((item) => item.kind === "new")).toHaveLength(0);
  });

  it("ignoriert gespeicherte Wörter, die es in den Daten nicht mehr gibt", () => {
    const srs: SrsState = { "gibt es nicht": { box: 1, due: "2026-09-30" } };
    const reviews = buildDailySession(srs, LESSONS, today, 15).filter(
      (item) => item.kind === "review",
    );
    expect(reviews).toHaveLength(0);
  });

  it("jedes Wort hat einen Pool mit mindestens 2 Wörtern für die A/B-Frage", () => {
    const session = buildDailySession({}, LESSONS, today, 15);
    expect(session.every((item) => item.pool.length >= 2)).toBe(true);
  });

  it("heute schon gelernte neue Wörter zählen gegen das Tageslimit", () => {
    const news = (already: number) =>
      buildDailySession({}, LESSONS, today, 15, already).filter((item) => item.kind === "new");
    expect(news(2)).toHaveLength(NEW_WORDS[15] - 2);
    expect(news(NEW_WORDS[15])).toHaveLength(0);
    expect(news(99)).toHaveLength(0);
  });
});
