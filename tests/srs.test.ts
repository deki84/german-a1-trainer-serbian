import { describe, expect, it } from "vitest";
import {
  KNOWN_FROM_BOX,
  MAX_BOX,
  addDays,
  countProgress,
  countStages,
  dateKey,
  getDueWords,
  isDue,
  isLearned,
  modeForBox,
  nextMilestone,
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

  it("Fragetyp wird mit der Box schwerer, ab Box 4 Lückentext", () => {
    expect(modeForBox(1)).toBe("meaning");
    expect(modeForBox(2)).toBe("translate");
    expect(modeForBox(3)).toBe("listen");
    expect(modeForBox(4)).toBe("gap");
    expect(modeForBox(5)).toBe("translate");
    expect(modeForBox(6)).toBe("gap");
  });

  describe("countProgress", () => {
    const words = ["Hallo", "danke", "bitte", "ja"];

    it("ohne Training ist alles 0", () => {
      expect(countProgress({}, words)).toEqual({ practiced: 0, known: 0, total: 4 });
    });

    it("zählt geübte Wörter und gelernte ab Box 3", () => {
      const state = {
        Hallo: { box: 1, due: today },
        danke: { box: KNOWN_FROM_BOX, due: today },
        bitte: { box: MAX_BOX, due: today },
      };
      expect(countProgress(state, words)).toEqual({ practiced: 3, known: 2, total: 4 });
    });

    it("ignoriert gespeicherte Wörter, die es nicht mehr gibt", () => {
      const state = { "gibt es nicht": { box: 5, due: today } };
      expect(countProgress(state, words)).toEqual({ practiced: 0, known: 0, total: 4 });
    });
  });

  describe("nextMilestone", () => {
    it("am Anfang ist das Ziel 10", () => {
      expect(nextMilestone(0, 794)).toBe(10);
      expect(nextMilestone(9, 794)).toBe(10);
    });

    it("ist das Ziel erreicht, kommt das nächste", () => {
      expect(nextMilestone(10, 794)).toBe(25);
      expect(nextMilestone(150, 794)).toBe(200);
    });

    it("am Ende ist das Ziel die Gesamtzahl", () => {
      expect(nextMilestone(400, 794)).toBe(794);
      expect(nextMilestone(794, 794)).toBe(794);
    });
  });

  describe("countStages", () => {
    it("teilt geübte Wörter in drei Stufen", () => {
      const state = {
        a: { box: 1, due: today },
        b: { box: 2, due: today },
        c: { box: KNOWN_FROM_BOX, due: today },
        d: { box: MAX_BOX - 1, due: today },
        e: { box: MAX_BOX, due: today },
      };
      expect(countStages(state, ["a", "b", "c", "d", "e", "f"])).toEqual({
        learning: 2,
        known: 2,
        mastered: 1,
      });
    });

    it("passt zu countProgress: known dort = Znam + 🏆 hier", () => {
      const state = {
        a: { box: 1, due: today },
        b: { box: 4, due: today },
        c: { box: 6, due: today },
      };
      const words = ["a", "b", "c"];
      const stages = countStages(state, words);
      expect(stages.known + stages.mastered).toBe(countProgress(state, words).known);
    });
  });
});
