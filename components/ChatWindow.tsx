"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessageText } from "@/components/ChatMessageText";
import { useRecorder } from "@/hooks/useRecorder";
import { audioFileName } from "@/lib/audio";
import type { ChatMessage } from "@/lib/chat";
import { speakMixed, stopSpeaking } from "@/lib/speech";

const SUGGESTIONS = [
  "Kako se kaže „hvala“?",
  "Kako da se predstavim?",
  "Kako kupim kartu za autobus?",
  "Šta da kažem kod lekara?",
];

type Status = "idle" | "recording" | "transcribing" | "answering";

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const recorder = useRecorder();
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const busy = status === "transcribing" || status === "answering";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      stopSpeaking();
    },
    [],
  );

  // speakAnswer: Wer gesprochen hat, bekommt die Antwort auch gesprochen
  async function send(text: string, speakAnswer = false) {
    const question = text.trim();
    if (!question || busy) return;

    const history: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setStatus("answering");
    stopSpeaking();

    const controller = new AbortController();
    abortRef.current = controller;
    let answer = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) throw new Error(await response.text());

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // stream: true, sonst gehen č, ć, š und Emojis kaputt, wenn ein Zeichen auf zwei Stücke verteilt ist
        const chunk = decoder.decode(value, { stream: true });
        answer += chunk;
        setMessages((previous) => {
          const updated = [...previous];
          const last = updated.at(-1);
          if (last) updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
      }
      if (speakAnswer && answer) speakMixed(answer);
    } catch (caught) {
      if ((caught as Error).name === "AbortError") return;
      const message = (caught as Error).message || "Nešto nije uspelo. Probaj ponovo. 😕";
      setMessages((previous) => [
        ...previous.slice(0, -1),
        { role: "assistant", content: message },
      ]);
    } finally {
      setStatus("idle");
    }
  }

  const pressingRef = useRef(false);

  // Gedrückt halten: Aufnahme startet
  async function startRecording() {
    if (busy || recorder.isRecording()) return;
    pressingRef.current = true;
    setError(null);
    stopSpeaking(); // nicht gleichzeitig vorlesen und aufnehmen
    try {
      await recorder.start();
      setStatus("recording");
      // Schon losgelassen, während der Browser nach dem Mikrofon gefragt hat
      if (!pressingRef.current) await finishRecording();
    } catch {
      pressingRef.current = false;
      setError("Dozvoli mikrofon u podešavanjima telefona. 🎤");
    }
  }

  // Loslassen: Aufnahme wird geschickt
  async function finishRecording() {
    pressingRef.current = false;
    if (!recorder.isRecording()) return;

    const recording = await recorder.stop();
    if (!recording || recording.durationMs < 600) {
      setStatus("idle");
      setError("Drži 🎤 dok govoriš, pa pusti. 🙂");
      return;
    }

    setStatus("transcribing");
    try {
      const form = new FormData();
      form.append("audio", recording.blob, audioFileName(recording.blob.type));
      const response = await fetch("/api/transcribe", { method: "POST", body: form });
      if (!response.ok) throw new Error(await response.text());
      const { text } = (await response.json()) as { text: string };
      setStatus("idle");
      if (text) await send(text, true);
      else setError("Nisam čuo ništa. Probaj ponovo. 🙂");
    } catch (caught) {
      setStatus("idle");
      setError((caught as Error).message || "Nisam razumeo. Probaj ponovo.");
    }
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-3" aria-live="polite">
        <Bubble role="assistant">
          Zdravo! 👋 Ja sam tvoj učitelj nemačkog. Piši, ili drži 🎤 i pričaj sa mnom.
        </Bubble>

        {messages.map((message, index) => {
          const streaming = status === "answering" && index === messages.length - 1;
          return (
            <Bubble key={index} role={message.role}>
              {message.role === "assistant" ? (
                message.content ? (
                  <>
                    <ChatMessageText text={message.content} />
                    {!streaming && (
                      <button
                        type="button"
                        onClick={() => speakMixed(message.content)}
                        className="text-river mt-2 flex min-h-11 cursor-pointer items-center gap-2 font-bold"
                      >
                        <span aria-hidden="true">🔊</span> Poslušaj
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-muted">Razmišljam… 💭</span>
                )
              ) : (
                message.content
              )}
            </Bubble>
          );
        })}

        {messages.length === 0 && status === "idle" && (
          <div className="grid grid-cols-1 gap-2 pt-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                className="border-mustard bg-mustard-soft min-h-14 cursor-pointer rounded-2xl border-2 px-4 text-left font-bold"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {status === "transcribing" && (
          <p className="text-muted text-center">Slušam šta si rekao… 👂</p>
        )}
        {error && (
          <p role="alert" className="bg-gentle-soft rounded-2xl p-3 text-center">
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        // klebt über der Tab-Leiste
        className="bg-bg sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-4 flex gap-2 py-3"
      >
        {status === "recording" ? (
          <p className="border-gentle bg-gentle-soft flex min-h-14 flex-1 items-center gap-2 rounded-2xl border-2 px-4 font-bold">
            <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
            Snimam… pusti 🎤 da pošalješ
          </p>
        ) : (
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Napiši pitanje…"
            aria-label="Pitanje"
            maxLength={500}
            enterKeyHint="send"
            disabled={busy}
            className="border-line bg-surface focus-visible:outline-river min-h-14 min-w-0 flex-1 rounded-2xl border-2 px-4 text-lg focus-visible:outline-2"
          />
        )}

        {recorder.supported && (
          <button
            type="button"
            disabled={busy}
            aria-label="Drži i govori"
            onPointerDown={(event) => {
              event.preventDefault();
              // Loslassen kommt auch an, wenn der Finger leicht vom Knopf rutscht
              event.currentTarget.setPointerCapture(event.pointerId);
              void startRecording();
            }}
            onPointerUp={() => void finishRecording()}
            onPointerCancel={() => void finishRecording()}
            onKeyDown={(event) => {
              if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                event.preventDefault();
                void startRecording();
              }
            }}
            onKeyUp={(event) => {
              if (event.key === " " || event.key === "Enter") void finishRecording();
            }}
            onContextMenu={(event) => event.preventDefault()}
            className={`flex h-14 w-14 flex-none cursor-pointer touch-none items-center justify-center rounded-full text-2xl transition-transform select-none disabled:opacity-40 ${
              status === "recording"
                ? "bg-gentle text-bg scale-125"
                : "border-river bg-surface border-2"
            }`}
          >
            🎤
          </button>
        )}

        {status !== "recording" && (
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Pošalji"
            className="bg-river text-bg flex h-14 w-14 flex-none cursor-pointer items-center justify-center rounded-full text-2xl disabled:cursor-default disabled:opacity-40"
          >
            ➤
          </button>
        )}
      </form>
    </div>
  );
}

function Bubble({ role, children }: { role: ChatMessage["role"]; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div
      className={`max-w-[88%] rounded-2xl px-4 py-3 text-lg [overflow-wrap:anywhere] whitespace-pre-wrap ${
        isUser
          ? "bg-river text-bg ml-auto rounded-br-md"
          : "border-line bg-surface mr-auto rounded-bl-md border-2"
      }`}
    >
      {children}
    </div>
  );
}
