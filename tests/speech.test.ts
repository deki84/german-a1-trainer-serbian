import { describe, expect, it } from "vitest";
import { splitForSpeech } from "@/lib/speech";

describe("splitForSpeech", () => {
  it("trennt deutsche und serbische Teile", () => {
    expect(splitForSpeech("Kažeš **Danke**. Odlično!")).toEqual([
      { lang: "sr", text: "Kažeš" },
      { lang: "de", text: "Danke" },
      { lang: "sr", text: ". Odlično!" },
    ]);
  });

  it("lässt Lautschrift in Klammern und Emojis weg", () => {
    expect(splitForSpeech("**Tschüss** (čis) 👋 znači ćao.")).toEqual([
      { lang: "de", text: "Tschüss" },
      { lang: "sr", text: "znači ćao." },
    ]);
  });

  it("überspringt Teile ohne Buchstaben", () => {
    expect(splitForSpeech("**Hallo** 🙂")).toEqual([{ lang: "de", text: "Hallo" }]);
  });

  it("Text ohne deutsche Wörter ist ein serbischer Teil", () => {
    expect(splitForSpeech("Zdravo! Kako si?")).toEqual([{ lang: "sr", text: "Zdravo! Kako si?" }]);
  });
});
