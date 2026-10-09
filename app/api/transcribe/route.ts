import Groq from "groq-sdk";
import { toLatin } from "@/lib/latin";
import { isRateLimited } from "@/lib/rateLimit";
import { isLikelyHallucination, type WhisperSegment } from "@/lib/transcript";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // ca. 2–3 Minuten Sprache

function textResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return textResponse("Mikrofon trenutno ne radi.", 500);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (isRateLimited(`transcribe:${ip}`)) {
    return textResponse("Mnogo poruka za kratko vreme. Odmori malo pa probaj ponovo. 🙂", 429);
  }

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof File) || audio.size === 0)
    return textResponse("Snimak nije ispravan.", 400);
  if (audio.size > MAX_BYTES) return textResponse("Snimak je predugačak.", 413);

  try {
    const groq = new Groq({ apiKey });
    const result = await groq.audio.transcriptions.create({
      file: audio,
      model: "whisper-large-v3",
      language: "sr",
      temperature: 0,
      response_format: "verbose_json",
      // Hinweis an Whisper: es geht um Deutschlernen, deutsche Wörter kommen vor
      prompt: "Pitanje učitelju nemačkog jezika.",
    });

    // Die Typen kennen „segments“ nicht, zur Laufzeit ist es vorhanden
    const segments = (result as unknown as { segments?: WhisperSegment[] }).segments ?? [];
    if (isLikelyHallucination(result.text, segments)) {
      return textResponse("Nisam te čuo. Probaj ponovo, malo glasnije. 🙂", 422);
    }

    return Response.json({ text: toLatin(result.text.trim()) });
  } catch {
    return textResponse("Nisam razumeo snimak. Probaj ponovo.", 502);
  }
}
