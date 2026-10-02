import { describe, expect, it } from "vitest";
import { audioFileName } from "@/lib/audio";

describe("audioFileName", () => {
  it("Chrome und Android nehmen webm auf", () => {
    expect(audioFileName("audio/webm;codecs=opus")).toBe("frage.webm");
  });

  it("iPhone nimmt mp4 auf", () => {
    expect(audioFileName("audio/mp4")).toBe("frage.mp4");
  });

  it("unbekannt fällt auf webm zurück", () => {
    expect(audioFileName("")).toBe("frage.webm");
  });
});
