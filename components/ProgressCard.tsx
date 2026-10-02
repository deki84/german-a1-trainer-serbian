"use client";

import { ResetProgress } from "@/components/ResetProgress";
import { useSrs } from "@/hooks/useSrs";
import { countProgress, countStages, nextMilestone } from "@/lib/srs";

export function ProgressCard({ allWords }: { allWords: string[] }) {
  const srs = useSrs();
  const { known, total } = countProgress(srs, allWords);
  const stages = countStages(srs, allWords);
  const goal = nextMilestone(known, total);
  const percent = Math.min(100, Math.round((known / goal) * 100));

  return (
    <section className="border-line bg-surface mt-6 rounded-3xl border-2 p-6 md:p-8">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xl font-bold md:text-2xl">
          Sledeći cilj: {goal} reči <span aria-hidden="true">🎯</span>
        </p>
        <ResetProgress />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div
          className="bg-line h-4 flex-1 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={known}
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-label="Napredak do sledećeg cilja"
        >
          {/* min-w: auch bei 0 soll man den Anfang sehen */}
          <div
            className="bg-good h-full min-w-2 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="font-bold">
          {known}/{goal}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
        <Stat value={stages.learning} label="Učim" />
        <Stat value={stages.known} label="Znam" />
        <Stat value={stages.mastered} label="🏆" ariaLabel="Naučeno" />
      </dl>

      <p className="text-muted mt-4">
        Ukupno: {known} od {total} reči
      </p>
    </section>
  );
}

function Stat({ value, label, ariaLabel }: { value: number; label: string; ariaLabel?: string }) {
  return (
    <div className="bg-bg flex flex-col-reverse rounded-2xl px-2 py-3">
      <dt className="text-muted text-sm font-bold" aria-label={ariaLabel}>
        {label}
      </dt>
      <dd className="text-2xl font-bold">{value}</dd>
    </div>
  );
}
