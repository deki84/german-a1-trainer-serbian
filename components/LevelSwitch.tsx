import Link from "next/link";
import type { Level } from "@/data/content";

const LEVELS: { level: Level; label: string; href: string }[] = [
  { level: "a1", label: "A1", href: "/lessons" },
  { level: "a2", label: "A2", href: "/lessons/a2" },
];

/** Umschalter zwischen den Niveaus. Wird nur gezeigt, wenn A2 eingeschaltet ist. */
export function LevelSwitch({ current }: { current: Level }) {
  return (
    <nav aria-label="Nivo" className="mt-6 flex gap-3">
      {LEVELS.map(({ level, label, href }) => (
        <Link
          key={level}
          href={href}
          aria-current={level === current ? "page" : undefined}
          className={`inline-flex h-12 items-center rounded-full border-2 px-6 text-lg font-bold ${
            level === current ? "border-river bg-river-soft" : "border-line"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
