// Whisper erkennt das Format an der Dateiendung
export function audioFileName(mimeType: string): string {
  const type = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (type.includes("mp4") || type.includes("m4a") || type.includes("aac")) return "frage.mp4";
  if (type.includes("ogg")) return "frage.ogg";
  if (type.includes("wav")) return "frage.wav";
  if (type.includes("mpeg") || type.includes("mp3")) return "frage.mp3";
  return "frage.webm"; // Standard in Chrome und Android
}
