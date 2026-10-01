import { describe, expect, it } from "vitest";
import {
  MAX_BOX,
  addDays,
  dateKey,
  getDueWords,
  isDue,
  isLearned,
  modeForBox,
  reviewCard,
} from "@/lib/srs";

const today = "2026-10-01";

describe("dateKey", () => {
  it("nutzt das lokale Datum, auch kurz nach Mitternacht", () => {
    expect(dateKey(new Date(2026, 9, 1, 0, 30))).toBe("2026-10-01");
  });

  it("füllt Monat und Tag mit führender Null auf", () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("addDays", () => {
  it("zählt Tage dazu", () => {
    expect(addDays("2026-10-01", 4)).toBe("2026-10-05");
  });

  it("klappt über Monats- und Jahresgrenzen", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("klappt über die Zeitumstellung", () => {
    expect(addDays("2026-10-24", 2)).toBe("2026-10-26");
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30");
  });
});

describe("reviewCard", () => {
  it("neues Wort, richtig: Box 1, morgen wieder", () => {
    expect(reviewCard(undefined, true, today)).toEqual({ box: 1, due: "2026-10-02" });
  });

  it("richtig: eine Box weiter, Abstand verdoppelt sich", () => {
    expect(reviewCard({ box: 1, due: today }, true, today)).toEqual({ box: 2, due: "2026-10-03" });
    expect(reviewCard({ box: 2, due: today }, true, today)).toEqual({ box: 3, due: "2026-10-05" });
    expect(reviewCard({ box: 3, due: today }, true, today)).toEqual({ box: 4, due: "2026-10-09" });
  });

  it("falsch: zurück in Box 1, egal wie weit es war", () => {
    expect(reviewCard({ box: 5, due: today }, false, today)).toEqual({ box: 1, due: "2026-10-02" });
  });

  it("bleibt in der letzten Box, Abstand 32 Tage", () => {
    expect(reviewCard({ box: MAX_BOX, due: today }, true, today)).toEqual({
      box: MAX_BOX,
      due: "2026-11-02",
    });
  });
});

describe("isDue und getDueWords", () => {
  const state = {
    Hallo: { box: 1, due: "2026-09-30" },
    danke: { box: 2, due: "2026-10-01" },
    bitte: { box: 3, due: "2026-10-05" },
  };

  it("fällig ist, was heute oder früher dran war", () => {
    expect(isDue({ box: 1, due: "2026-09-30" }, today)).toBe(true);
    expect(isDue({ box: 1, due: today }, today)).toBe(true);
    expect(isDue({ box: 1, due: "2026-10-02" }, today)).toBe(false);
  });

  it("liefert fällige Wörter, die ältesten zuerst", () => {
    expect(getDueWords(state, today)).toEqual(["Hallo", "danke"]);
  });

  it("leerer Zustand ergibt keine fälligen Wörter", () => {
    expect(getDueWords({}, today)).toEqual([]);
  });
});

describe("isLearned und modeForBox", () => {
  it("gelernt erst in der letzten Box", () => {
    expect(isLearned({ box: MAX_BOX, due: today })).toBe(true);
    expect(isLearned({ box: MAX_BOX - 1, due: today })).toBe(false);
    expect(isLearned(undefined)).toBe(false);
  });

  it("Fragetyp wird mit der Box schwerer", () => {
    expect(modeForBox(1)).toBe("meaning");
    expect(modeForBox(2)).toBe("translate");
    expect(modeForBox(3)).toBe("listen");
    expect(modeForBox(6)).toBe("listen");
  });
});