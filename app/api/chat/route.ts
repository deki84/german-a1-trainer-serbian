import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { LESSONS } from "@/data/lessons";
import { parseMessages } from "@/lib/chat";
import { toLatin } from "@/lib/latin";
import { isRateLimited } from "@/lib/rateLimit";
import { findRelevantWords } from "@/lib/retrieve";
import { buildTutorPrompt } from "@/lib/tutorPrompt";

export const runtime = "nodejs";

const MODEL = process.env.LLM_MODEL ?? "openai/gpt-oss-120b";

function textResponse(message: string, status: number) {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function POST(request: Request) {
  // Der Key existiert NUR hier auf dem Server, nie im Browser (kein NEXT_PUBLIC_)
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return textResponse("Učitelj trenutno nije dostupan.", 500);

  // Zweite Sicherung neben proxy.ts: ohne Login keine Kosten
  const { userId } = await auth();
  if (!userId) return textResponse("Prijavi se da bi pričao sa učiteljem.", 401);

  // Limit pro Konto statt pro IP: genauer und nicht über VPN umgehbar
  if (isRateLimited(`chat:${userId}`)) {
    return textResponse("Mnogo pitanja za kratko vreme. Odmori malo pa probaj ponovo. 🙂", 429);
  }

  const messages = parseMessages(await request.json().catch(() => null));
  if (!messages) return textResponse("Poruka nije ispravna.", 400);

  // RAG: passende geprüfte Wörter zur letzten Frage heraussuchen
  const question = messages.at(-1)?.content ?? "";
  const systemPrompt = buildTutorPrompt(findRelevantWords(question, LESSONS));

  const groq = new Groq({ apiKey });

  try {
    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.3,
      max_completion_tokens: 800,
      reasoning_effort: "medium", // etwas mehr Nachdenken: versteht Tippfehler besser
      stream: true,
    });

    // Groq-Stückchen in einen einfachen Text-Stream für den Browser umwandeln
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            // Sicherheitsnetz: falls das Modell doch Kyrillisch schreibt
            if (text) controller.enqueue(encoder.encode(toLatin(text)));
          }
        } catch {
          controller.enqueue(encoder.encode("\n\nNešto nije uspelo. Probaj ponovo."));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return textResponse("Učitelj trenutno nije dostupan. Probaj kasnije.", 502);
  }
}