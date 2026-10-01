import { describe, expect, it } from "vitest";
import { parseSrs } from "@/lib/srsStorage";

describe("parseSrs", () => {
  it("nichts gespeichert ergibt leeren Zustand", () => {
    expect(parseSrs(null)).toEqual({});
    expect(parseSrs("")).toEqual({});
  });

  it("liest gültige Daten", () => {
    const raw = JSON.stringify({ Hallo: { box: 2, due: "2026-10-03" } });
    expect(parseSrs(raw)).toEqual({ Hallo: { box: 2, due: "2026-10-03" } });
  });

  it("kaputtes JSON führt nicht zum Absturz", () => {
    expect(parseSrs("{kaputt")).toEqual({});
  });

  it("ignoriert falsche Formen", () => {
    expect(parseSrs("[1,2,3]")).toEqual({});
    expect(parseSrs('"text"')).toEqual({});
    expect(parseSrs("null")).toEqual({});
  });

  it("übernimmt nur gültige Einträge", () => {
    const raw = JSON.stringify({
      Hallo: { box: 2, due: "2026-10-03" },
      danke: { box: "zwei" },
      bitte: null,
    });
    expect(parseSrs(raw)).toEqual({ Hallo: { box: 2, due: "2026-10-03" } });
  });
});
