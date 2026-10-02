"use client";

import Link from "next/link";
import { useSrs } from "@/hooks/useSrs";
import { useStore } from "@/hooks/useStore";
import { newWordsOn, streak, lastSevenDays } from "@/lib/days";
import { dayStore } from "@/lib/progressStorage";
import { DAILY_GOAL, countToday } from "@/lib/session";
import { dateKey } from "@/lib/srs";
import { WeekStrip } from "@/components/WeekStrip";

// Serbische Mehrzahl: 1 reč, 2–4 reči, 5+ reči (auch 21 reč, 22 reči, 25 reči …)
function plural(n: number, one: string, few: string, many: string): string {
  const lastTwo = n % 100;
  const last = n % 10;
  if (last === 1 && lastTwo !== 11) return one;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
  return many;
}

function summary(reviews: number, fresh: number): string {
  const parts: string[] = [];
  if (fresh > 0) parts.push(`${fresh} ${plural(fresh, "nova reč", "nove reči", "novih reči")}`);
  if (reviews > 0) parts.push(`${reviews} za ponavljanje`);
  return parts.join(" · ");
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 translate-x-0.5" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}

export function TodayButton({ allWords }: { allWords: string[] }) {
  const srs = useSrs();
  const days = useStore(dayStore);
  const today = dateKey();
  const { reviews, fresh } = countToday(srs, allWords, today, DAILY_GOAL, newWordsOn(days, today));
  const currentStreak = streak(days, today);
  const week = lastSevenDays(days, today);
  const done = reviews + fresh === 0;

  const streakText =
    currentStreak === 0
      ? "Počni niz danas"
      : `${currentStreak} ${plural(currentStreak, "dan", "dana", "dana")} zaredom`;

  if (done) {
    return (
      <div className="border-good bg-good-soft mt-8 rounded-3xl border-2 p-6 md:p-8">
        <p className="text-2xl font-bold md:text-3xl">Danas urađeno ✅</p>
        <p className="text-muted mt-1 text-lg">Vidimo se sutra.</p>
        <div className="mt-5">
          <WeekStrip days={week} />
        </div>
        <p className="mt-3 text-lg font-bold">🔥 {streakText}</p>
      </div>
    );
  }

  return (
    <Link
      href="/today"
      className="bg-river text-bg mt-8 block rounded-3xl p-6 transition-transform active:scale-[0.98] md:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-wide uppercase opacity-80">
            Danas · {DAILY_GOAL} min
          </p>
          <p className="mt-1 text-3xl font-bold md:text-4xl">Današnji trening</p>
          <p className="mt-2 text-lg opacity-90">{summary(reviews, fresh)}</p>
        </div>
        <span className="bg-bg text-river flex h-16 w-16 flex-none items-center justify-center rounded-full md:h-20 md:w-20">
          <PlayIcon />
        </span>
      </div>
      <div className="mt-5">
        <WeekStrip days={week} />
      </div>
      <p className="mt-3 text-lg font-bold">🔥 {streakText}</p>
    </Link>
  );
}
