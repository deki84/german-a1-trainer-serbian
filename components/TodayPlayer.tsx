"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { WordCard } from "@/components/WordCard";
import { useSrs } from "@/hooks/useSrs";
import { useStore } from "@/hooks/useStore";
import { newWordsOn, streak } from "@/lib/days";
import { dayStore, recordSession } from "@/lib/progressStorage";
import { buildQuestion, calculateStars } from "@/lib/quiz";
import { buildDailySession, DAILY_GOAL, type DailyGoal, type SessionItem } from "@/lib/session";
import { speakGerman } from "@/lib/speech";
import { dateKey } from "@/lib/srs";
import { saveAnswer } from "@/lib/srsStorage";
import type { Lesson, Question } from "@/lib/types";

type Phase = "start" | "learn" | "quiz" | "finish";

export function TodayPlayer({ lessons }: { lessons: Lesson[] }) {
  const srs = useSrs();
  const days = useStore(dayStore);
  const GOAL: DailyGoal = DAILY_GOAL;
  const [phase, setPhase] = useState<Phase>("start");
  const [items, setItems] = useState<SessionItem[]>([]);
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [hadMistake, setHadMistake] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);

  const item = items[index];

  useEffect(() => {
    if (phase === "learn" && item) speakGerman(item.word.de);
  }, [phase, item]);

  const today = dateKey();
  const newToday = newWordsOn(days, today);
  const currentStreak = streak(days, today);

  // Nur zum Zählen: Reihenfolge egal, deshalb fester statt echter Zufall
  const preview = buildDailySession(srs, lessons, today, GOAL, newToday, () => 0);
  const reviewCount = preview.filter((entry) => entry.kind === "review").length;
  const newCount = preview.filter((entry) => entry.kind === "new").length;

  function ask(next: SessionItem) {
    setQuestion(buildQuestion(next.word, next.pool, next.mode));
    setAttempt((count) => count + 1);
    setPhase("quiz");
  }

  // Neue Wörter zuerst als Wortkarte zeigen, alles andere direkt abfragen
  function open(next: SessionItem) {
    if (next.kind === "new") setPhase("learn");
    else ask(next);
  }

  function handleStart() {
    const session = buildDailySession(srs, lessons, dateKey(), GOAL, newToday);
    const first = session[0];
    if (!first) return;
    setItems(session);
    setIndex(0);
    setFirstTryCorrect(0);
    setHadMistake(false);
    open(first);
  }

  function handleRetry() {
    if (!item) return;
    setHadMistake(true);
    ask(item);
  }

  function handleCorrect() {
    if (!item) return;
    if (item.kind !== "recheck") saveAnswer(item.word.de, !hadMistake);
    if (!hadMistake) setFirstTryCorrect((count) => count + 1);
    setHadMistake(false);

    const next = items[index + 1];
    if (!next) {
      recordSession({
        newWords: items.filter((entry) => entry.kind === "new").length,
        reviews: items.filter((entry) => entry.kind === "review").length,
      });
      setPhase("finish");
      return;
    }
    setIndex(index + 1);
    open(next);
  }

  if (phase === "start") {
    if (reviewCount + newCount === 0) {
      return (
        <section className="mt-10 text-center">
          <div className="text-7xl" aria-hidden="true">
            🎉
          </div>
          <p className="mt-4 text-2xl font-bold">Za danas je sve urađeno!</p>
          <div className="mt-4">
            <StreakBadge days={currentStreak} />
          </div>
          <p className="text-muted mt-2 text-lg">Vidimo se sutra. 👋</p>
        </section>
      );
    }

    return (
      <section className="mt-8 space-y-6">
        <StreakBadge days={currentStreak} />

        <div className="border-line bg-surface rounded-2xl border-2 p-5 text-lg">
          <p>
            <span aria-hidden="true">🔁</span> Ponavljanje: <b>{reviewCount}</b> reči
          </p>
          <p className="mt-2">
            <span aria-hidden="true">✨</span> Nove reči: <b>{newCount}</b>
          </p>
        </div>
        <button
          type="button"
          onClick={handleStart}
          className="bg-river text-bg flex min-h-20 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl text-2xl font-bold"
        >
          <span aria-hidden="true">▶️</span> Počni
        </button>
      </section>
    );
  }

  if (phase === "finish") {
    const total = items.length;
    const stars = calculateStars(firstTryCorrect, total);
    const reviewed = items.filter((entry) => entry.kind === "review").length;
    const learned = items.filter((entry) => entry.kind === "new").length;

    return (
      <section className="mt-8 text-center">
        <div className="text-6xl tracking-widest" role="img" aria-label={`${stars} od 3 zvezdice`}>
          {"⭐".repeat(stars)}
        </div>
        <h2 className="mt-4 text-3xl font-bold md:text-4xl">Bravo! 🎉</h2>
        <p className="text-muted mt-2 text-lg">
          Ponovio si {reviewed} reči i naučio {learned} novih.
          <br />
          Iz prvog pokušaja: {firstTryCorrect} od {total}.
        </p>
        <div className="mt-6">
          <StreakBadge days={currentStreak} />
        </div>
        <p className="mt-2 text-2xl font-bold">Vidimo se sutra! 👋</p>
        <Link
          href="/"
          className="border-line bg-surface mt-8 flex min-h-14 items-center justify-center rounded-2xl border-2 text-lg font-bold"
        >
          Početna 🏠
        </Link>
      </section>
    );
  }

  if (!item) return null;

  const progress = Math.round((index / items.length) * 100);

  return (
    <section className="mt-6">
      <div
        className="bg-line h-3 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="bg-good h-full rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-muted mt-2 text-sm">
        {index + 1} / {items.length}
      </p>

      <div className="mt-4">
        {phase === "learn" && (
          <>
            <WordCard key={item.word.de} word={item.word} />
            <button
              type="button"
              onClick={() => ask(item)}
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

function StreakBadge({ days }: { days: number }) {
  return (
    <p className="text-xl font-bold">
      <span aria-hidden="true">🔥</span>{" "}
      {days === 0 ? "Počni niz danas" : `${days} ${days === 1 ? "dan" : "dana"} zaredom`}
    </p>
  );
}
