"use client";

import { speakGerman } from "@/lib/speech";

type ListenButtonProps = {
  /** Der deutsche Text, der vorgelesen wird */
  text: string;
};

/**
 * 🔊-Knopf: liest das deutsche Wort vor.
 */
export function ListenButton({ text }: ListenButtonProps) {
  return (
    <button
      type="button"
      onClick={() => speakGerman(text)}
      className="bg-river-soft focus-visible:outline-river mt-6 inline-flex h-14 cursor-pointer items-center gap-3 rounded-full px-6 text-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className="text-2xl" aria-hidden="true">
        🔊
      </span>
      Slušaj
    </button>
  );
}