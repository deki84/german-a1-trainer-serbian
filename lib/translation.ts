// Sicherheitsnetz für den Übersetzer-Modus des KI-Lehrers.
//
// Wenn die Antwort mit einem deutschen SATZ im Chip beginnt (**Wie spät ist es?**),
// ist es eine Übersetzung. Dann behalten wir den Chip, die Aussprache in der Klammer
// und serbischen Text danach, schneiden aber alles ab dem nächsten Chip ab
// (zum Beispiel einen erfundenen zweiten Satz wie **Kannst du das wiederholen?**).
// Antworten, die anders beginnen (Erklärungen, einzelne Wörter), bleiben unverändert.

export type FilteredReply = { text: string; done: boolean };

const SENTENCE_END = /[.?!]\s*$/;

// In der Aussprache sind nur Buchstaben und Leerzeichen erlaubt (kein ":" "-" "/" …)
function cleanPronunciation(tail: string): string {
  let depth = 0;
  let out = "";
  for (const char of tail) {
    if (char === "(") {
      depth += 1;
      out += char;
    } else if (char === ")") {
      depth = Math.max(0, depth - 1);
      out += char;
    } else if (depth > 0) {
      if (/[\p{L} ]/u.test(char)) out += char;
    } else {
      out += char;
    }
  }
  return out;
}

// Bei "koliko" sagt man im Deutschen "Wie viel" (Wie viel Kilometer, Wie viel Geld),
// nicht "Wie viele". Die Aussprache dazu ist "vi fil", nicht "vi file".
function fixViel(s: string): string {
  return s.replace(/\bWie viele\b/g, "Wie viel").replace(/\bvi file\b/gi, "vi fil");
}

/**
 * Filtert die bisher empfangene Antwort. Das Ergebnis wächst nur nach hinten,
 * deshalb lässt es sich beim Streaming stückweise senden.
 * `final: true` erst am Ende des Streams, dann wird nichts mehr zurückgehalten.
 */
export function filterTranslationReply(raw: string, final = false): FilteredReply {
  const text = raw.trimStart();
  if (text === "" || (!final && text === "*")) return { text: "", done: false };
  if (!text.startsWith("**")) return { text, done: false };

  const chipEnd = text.indexOf("**", 2);
  if (chipEnd === -1) return { text: fixViel(text), done: false }; // Chip noch nicht fertig

  const chip = fixViel(text.slice(2, chipEnd));
  if (!SENTENCE_END.test(chip)) return { text, done: false }; // einzelnes Wort: keine Übersetzung

  const rest = text.slice(chipEnd + 2);
  const nextChip = rest.indexOf("**");
  const done = nextChip !== -1;
  let tail = fixViel(cleanPronunciation(done ? rest.slice(0, nextChip) : rest));

  tail = tail.trimEnd();
  if (!done && !final && tail.endsWith("*")) tail = tail.slice(0, -1).trimEnd(); // halbes "**"
  return { text: `**${chip}**${tail}`, done };
}
