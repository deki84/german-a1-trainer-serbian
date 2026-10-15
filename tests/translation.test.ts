import { describe, expect, it } from "vitest";
import { filterTranslationReply } from "@/lib/translation";

describe("filterTranslationReply", () => {
  it("schneidet einen zweiten deutschen Satz ab", () => {
    const raw =
      "**Morgen muss ich zum Arzt gehen.** (morgen mus ih cum arct gehen)\n**Kannst du das wiederholen?** (kanst du das viderholen) Odlično.";
    const result = filterTranslationReply(raw, true);
    expect(result.text).toBe("**Morgen muss ich zum Arzt gehen.** (morgen mus ih cum arct gehen)");
    expect(result.done).toBe(true);
  });

  it("behält eine kurze serbische Pohvala nach der Aussprache", () => {
    const raw = "**Ich gehe nach München.** (ih gehe nah minhen) Odlično!";
    expect(filterTranslationReply(raw, true).text).toBe(raw);
  });

  it("entfernt Doppelpunkte und Striche aus der Aussprache", () => {
    const raw = "**Ich gehe nach München.** (ih ge:he nah min-hen)";
    expect(filterTranslationReply(raw, true).text).toBe(
      "**Ich gehe nach München.** (ih gehe nah minhen)",
    );
  });

  it("lässt Erklärungen und einzelne Wörter unverändert", () => {
    const explain =
      "Reč znači voda. **das Wasser** (das vaser) i **Ich trinke Wasser.** (ih trinke vaser)";
    expect(filterTranslationReply(explain, true).text).toBe(explain);
    const word = "**das Wasser** (das vaser) je voda. Probaj **das Wasser** naglas.";
    expect(filterTranslationReply(word, true).text).toBe(word);
  });

  it("wächst beim Streaming nur nach hinten", () => {
    const full = "**Wie spät ist es?** (vi špet ist es)\n**Kannst du das?** (x) Odlično";
    let previous = "";
    for (let end = 1; end <= full.length; end++) {
      const { text } = filterTranslationReply(full.slice(0, end));
      expect(text.startsWith(previous)).toBe(true);
      previous = text;
    }
    expect(previous).toBe("**Wie spät ist es?** (vi špet ist es)");
  });

  it('macht aus "Wie viele" immer "Wie viel" (Text und Aussprache)', () => {
    const raw =
      "**Wie viele Kilometer sind es bis nach München?** (vi file kilometer zind es bis nah minhen)";
    expect(filterTranslationReply(raw, true).text).toBe(
      "**Wie viel Kilometer sind es bis nach München?** (vi fil kilometer zind es bis nah minhen)",
    );
  });

  it('bleibt beim Streaming von "Wie viele" stabil (nur nach hinten)', () => {
    const full = "**Wie viele Kilometer sind es?** (vi file kilometer zind es)";
    let previous = "";
    for (let end = 1; end <= full.length; end++) {
      const { text } = filterTranslationReply(full.slice(0, end));
      expect(text.startsWith(previous)).toBe(true);
      previous = text;
    }
    expect(previous).toBe("**Wie viel Kilometer sind es?** (vi fil kilometer zind es)");
  });

  it("gibt nichts aus, solange noch kein Zeichen da ist", () => {
    expect(filterTranslationReply("  ").text).toBe("");
    expect(filterTranslationReply("*").text).toBe("");
  });
});
