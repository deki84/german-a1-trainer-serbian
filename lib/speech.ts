/**
 * Liest einen deutschen Text laut vor (Web Speech API).
 * Läuft komplett im Browser, keine Kosten, kein API-Key.
 *
 * Nur im Browser aufrufen, z. B. in einem onClick-Handler.
 */

/** Die gefundene deutsche Stimme wird zwischengespeichert. */
let germanVoice: SpeechSynthesisVoice | null = null;

/**
 * Die aktuell laufende Ausgabe.
 * Chrome-Fehler: Ohne eine Referenz räumt der Browser das Objekt vorzeitig weg.
 * Dann gilt die Ausgabe intern als "läuft noch", und jedes weitere speak() bleibt stumm.
 */
let currentUtterance: SpeechSynthesisUtterance | null = null;

/** Sucht eine deutsche Stimme, lokale (auf dem Gerät installierte) zuerst. */
function findGermanVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("de"));
  return voices.find((voice) => voice.localService) ?? voices[0] ?? null;
}

// Chrome lädt die Stimmen erst nach und nach. Sobald sie da sind, merken wir uns die deutsche.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    germanVoice = findGermanVoice();
  });
}

export function speakGerman(text: string, rate = 0.65): void {
  // Schutz: auf dem Server oder in alten Browsern gibt es keine Sprachausgabe
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;
  germanVoice ??= findGermanVoice();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = rate; // 1 = normal, 0.65 = deutlich langsamer für Anfänger
  if (germanVoice) utterance.voice = germanVoice;

  // Referenz halten, bis die Ausgabe fertig ist (siehe Kommentar oben)
  currentUtterance = utterance;
  utterance.onend = () => {
    if (currentUtterance === utterance) currentUtterance = null;
  };

  // Immer sauber zurücksetzen: laufende Ausgabe stoppen und einen
  // "hängenden" Pause-Zustand aufheben, in dem Chrome manchmal festsitzt.
  synth.cancel();
  synth.resume();

  // Chrome-Fehler: speak() direkt nach cancel() wird manchmal verschluckt → kurz warten
  window.setTimeout(() => synth.speak(utterance), 60);
}
