"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { WordCard } from "@/components/WordCard";
import { buildQuestion, calculateStars } from "@/lib/quiz";
import { speakGerman } from "@/lib/speech";
import type { Lesson, Question, QuestionMode } from "@/lib/types";
import { saveAnswer } from "@/lib/srsStorage";


type LessonPlayerProps = {
  lesson: Lesson;
  nextLesson?: Lesson;
};

type Phase = "learn" | "quiz" | "finish";

const MODES: QuestionMode[] = ["meaning", "translate", "listen"];

export function LessonPlayer({ lesson, nextLesson }: LessonPlayerProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("learn");
  const [question, setQuestion] = useState<Question | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [hadMistake, setHadMistake] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);

  const total = lesson.words.length;
  const word = lesson.words[index] ?? lesson.words[0];
  const isLast = index === total - 1;

  useEffect(() => {
    if (phase === "learn" && word) speakGerman(word.de);
  }, [phase, word]);

  if (!word) return null;

  // Frage erst beim Klick bauen: Zufall während des Renderns führt zu Hydration-Fehlern
  function startQuiz() {
    if (!word) return;
    const mode = MODES[index % MODES.length] ?? "meaning";
    setQuestion(buildQuestion(word, lesson.words, mode));
    setAttempt((count) => count + 1);
    setPhase("quiz");
  }

  function handleRetry() {
    setHadMistake(true);
    startQuiz();
  }

  function handleCorrect() {
    // Gespeichert wird, ob das Wort beim ERSTEN Versuch richtig war
    if (word) saveAnswer(word.de, !hadMistake);
    if (!hadMistake) setFirstTryCorrect((count) => count + 1);
    setHadMistake(false);

    if (isLast) {
      setPhase("finish");
    } else {
      setIndex(index + 1);
      setPhase("learn");
    }
  }

  function handleRestart() {
    setIndex(0);
    setQuestion(null);
    setHadMistake(false);
    setFirstTryCorrect(0);
    setPhase("learn");
  }

  if (phase === "finish") {
    const stars = calculateStars(firstTryCorrect, total);

    return (
      <section className="mt-8 text-center">
        <div className="text-6xl tracking-widest" role="img" aria-label={`${stars} od 3 zvezdice`}>
          {"⭐".repeat(stars)}
        </div>
        <h2 className="mt-4 text-3xl font-bold md:text-4xl">Bravo! 🎉</h2>
        <p className="text-muted mt-2 text-lg">
          Naučio si {total} novih reči.
          <br />
          Iz prvog pokušaja: {firstTryCorrect} od {total}.
        </p>

        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {lesson.words.map((w) => (
            <li
              key={w.de}
              lang="de"
              className="border-line bg-surface rounded-full border-2 px-3 py-1"
            >
              <span aria-hidden="true">{w.emoji}</span> {w.de}
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-3">
          {nextLesson && (
            <Link
              href={`/lesson/${nextLesson.id}`}
              className="bg-river text-bg flex min-h-16 items-center justify-center rounded-2xl px-4 text-xl font-bold"
            >
              Sledeća lekcija: {nextLesson.title} ➜
            </Link>
          )}
          <button
            type="button"
            onClick={handleRestart}
            className="border-line bg-surface flex min-h-14 w-full cursor-pointer items-center justify-center rounded-2xl border-2 text-lg font-bold"
          >
            Ponovi lekciju 🔁
          </button>
          <Link
            href="/"
            className="border-line bg-surface flex min-h-14 items-center justify-center rounded-2xl border-2 text-lg font-bold"
          >
            Sve teme 🏠
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="flex flex-wrap gap-2" aria-label={`Reč ${index + 1} od ${total}`}>
        {lesson.words.map((w, i) => (
          <span
            key={w.de}
            className={`h-3 w-3 rounded-full ${
              i < index ? "bg-good" : i === index ? "bg-river scale-125" : "bg-line"
            }`}
          />
        ))}
      </div>

      <div className="mt-6">
        {phase === "learn" && (
          <>
            <WordCard key={word.de} word={word} />
            <button
              type="button"
              onClick={startQuiz}
              className="bg-river text-bg mt-6 flex min-h-16 w-full cursor-pointer items-center justify-center rounded-2xl text-xl font-bold"
            >
              Dalje ➜
            </button>
          </>
        )}

        {phase === "quiz" && question && (
          <QuestionCard
            key={attempt}
            question={question}
            onCorrect={handleCorrect}
            onRetry={handleRetry}
          />
        )}
      </div>
    </section>
  );
}
