"use client";

import { speakGerman } from "@/lib/speech";

// **Wort** aus der KI-Antwort wird zu einem Knopf, der das deutsche Wort vorliest.
// Kein dangerouslySetInnerHTML: KI-Text ist fremder Inhalt, React escaped ihn so sicher.
export function ChatMessageText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g); // ungerade Indizes = Text zwischen **

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <button
            key={index}
            type="button"
            lang="de"
            onClick={() => speakGerman(part)}
            className="bg-river-soft text-river mx-0.5 inline cursor-pointer rounded-lg px-1.5 font-bold"
          >
            {part} <span aria-hidden="true">🔊</span>
          </button>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}
