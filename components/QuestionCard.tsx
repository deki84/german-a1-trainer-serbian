"use client";

import { useEffect, useState } from "react";
import { ListenButton } from "@/components/ListenButton";
import { BLANK, fillBlank } from "@/lib/gap";
import { pickPraise } from "@/lib/quiz";
import { speakGerman } from "@/lib/speech";
import type { Question } from "@/lib/types";

type QuestionCardProps = {
  question: Question;
  onCorrect: () => void;
  onRetry: () => void;
};

const LETTERS = ["A", "B"] as const;

const ANSWER_COLORS = [
  { bg: "bg-river-soft", letter: "bg-river text-bg" },
  // feste dunkle Schrift, weil Senfgelb in beiden Modi hell ist
  { bg: "bg-mustard-soft", letter: "bg-mustard text-[#13242e]" },
] as const;

export function QuestionCard({ question, onCorrect, onRetry }: QuestionCardProps) {
  const { mode, word, options } = question;
  const sentence = mode === "gap" ? question.sentence : undefined;
  const fullSentence = sentence ? fillBlank(sentence.text, sentence.answer) : null;

  const [selected, setSelected] = useState<number | null>(null);
  const [praise] = useState(() => pickPraise());

  const answered = selected !== null;
  const isCorrect = answered && options[selected]?.correct === true;

  useEffect(() => {
    if (mode === "listen") speakGerman(word.de);
  }, [mode, word.de]);

  function handleSelect(index: number) {
    if (answered) return;
    setSelected(index);
    // Beim Lückentext wird der ganze Satz vorgelesen, sonst das Wort
    if (options[index]?.correct) speakGerman(fullSentence ?? word.de);
  }

  return (
    <section>
      <div className="text-center">
        {mode === "meaning" && (
          <>
            <p className="text-xl font-bold">Šta znači</p>
            <p lang="de" className="mt-1 text-4xl font-bold [overflow-wrap:anywhere] md:text-5xl">
              „{word.de}“
            </p>
            <ListenButton text={word.de} />
          </>
        )}

        {mode === "translate" && (
          <>
            <p className="text-xl font-bold">Kako se kaže na nemačkom</p>
            <p lang="sr" className="mt-1 text-4xl font-bold [overflow-wrap:anywhere] md:text-5xl">
              „{word.sr}“
            </p>
          </>
        )}

        {mode === "listen" && (
          <>
            <p className="text-xl font-bold">Šta si čuo?</p>
            <button
              type="button"
              onClick={() => speakGerman(word.de)}
              aria-label="Slušaj ponovo"
              className="bg-river-soft mt-4 inline-flex h-24 w-24 cursor-pointer items-center justify-center rounded-full text-5xl"
            >
              🔊
            </button>
          </>
        )}

        {sentence && (
          <>
            <p className="text-xl font-bold">Dopuni rečenicu</p>
            <p lang="de" className="mt-2 text-3xl font-bold [overflow-wrap:anywhere] md:text-4xl">
              <GapText text={sentence.text} fill={answered ? sentence.answer : null} />
            </p>
            <p lang="sr" className="text-muted mt-3 text-lg">
              {sentence.sr}
            </p>
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {options.map((option, index) => {
          const colors = ANSWER_COLORS[index] ?? ANSWER_COLORS[0];

          let state = `${colors.bg} border-transparent`;
          if (answered && option.correct) state = "bg-good-soft border-good";
          else if (answered && index === selected) state = `${colors.bg} border-gentle opacity-70`;
          else if (answered) state = `${colors.bg} border-transparent opacity-50`;

          return (
            <button
              key={option.text}
              type="button"
              disabled={answered}
              onClick={() => handleSelect(index)}
              className={`flex min-h-20 w-full items-center gap-4 rounded-2xl border-[3px] p-3 text-left text-2xl font-bold enabled:cursor-pointer md:min-h-24 md:text-3xl ${state}`}
            >
              <span
                className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl ${colors.letter}`}
              >
                {LETTERS[index]}
              </span>
              <span lang={option.lang} className="min-w-0 [overflow-wrap:anywhere]">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          role="status"
          className={`mt-6 rounded-2xl p-4 text-center text-xl ${isCorrect ? "bg-good-soft" : "bg-gentle-soft"}`}
        >
          <p className="text-2xl font-bold">{isCorrect ? praise : "Skoro! 🙂"}</p>
          {fullSentence && sentence ? (
            <>
              <p lang="de" className="mt-1 font-bold [overflow-wrap:anywhere]">
                {fullSentence}
              </p>
              <p lang="sr" className="mt-1">
                {sentence.sr}
              </p>
              <ListenButton text={fullSentence} />
            </>
          ) : (
            <p className="mt-1">
              <span lang="de">{word.de}</span> = <span lang="sr">{word.sr}</span>
            </p>
          )}
          {!isCorrect && <p className="mt-1">Nema problema, probaj još jednom.</p>}
        </div>
      )}

      {answered && (
        <button
          type="button"
          onClick={isCorrect ? onCorrect : onRetry}
          className="bg-river text-bg mt-6 flex min-h-16 w-full cursor-pointer items-center justify-center rounded-2xl text-xl font-bold"
        >
          {isCorrect ? "Dalje ➜" : "Probaj ponovo 🔁"}
        </button>
      )}
    </section>
  );
}

// Zeigt den Satz mit Lücke. Nach der Antwort steht die Lösung in der Lücke.
function GapText({ text, fill }: { text: string; fill: string | null }) {
  const [before = "", after = ""] = text.split(BLANK);
  return (
    <>
      {before}
      <span
        className={`mx-1 inline-block min-w-20 border-b-4 px-1 text-center ${
          fill ? "border-good text-good" : "border-river"
        }`}
      >
        {fill ?? "\u00A0"}
      </span>
      {after}
    </>
  );
}
