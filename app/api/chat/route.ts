import Groq from "groq-sdk";
import { parseMessages } from "@/lib/chat";
import { isRateLimited } from "@/lib/rateLimit";
import { TUTOR_PROMPT } from "@/lib/tutorPrompt";

export const runtime = "nodejs";

const MODEL = process.env.LLM_MODEL ?? "openai/gpt-oss-120b";

function textResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  // Der Key existiert NUR hier auf dem Server, nie im Browser (kein NEXT_PUBLIC_)
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return textResponse("Učitelj trenutno nije dostupan.", 500);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (isRateLimited(ip)) {
    return textResponse("Mnogo pitanja za kratko vreme. Odmori malo pa probaj ponovo. 🙂", 429);
  }

  const messages = parseMessages(await request.json().catch(() => null));
  if (!messages) return textResponse("Poruka nije ispravna.", 400);

  const groq = new Groq({ apiKey });

  try {
    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: TUTOR_PROMPT }, ...messages],
      temperature: 0.3,
      max_completion_tokens: 800,
      reasoning_effort: "low", // schneller, für einfache Erklärungen reicht das
      stream: true,
    });

    // Groq-Stückchen in einen einfachen Text-Stream für den Browser umwandeln
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
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
