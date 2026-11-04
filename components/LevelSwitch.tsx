import Link from "next/link";
import { ENABLED_LEVELS, type Level } from "@/data/content";

const LEVELS: { level: Level; label: string; href: string }[] = [
  { level: "a1", label: "A1", href: "/lessons" },
  { level: "a2", label: "A2", href: "/lessons/a2" },
  { level: "b1", label: "B1", href: "/lessons/b1" },
];

/** Umschalter zwischen den Niveaus. Zeigt nur eingeschaltete Niveaus, und nur wenn es mehr als A1 gibt. */
export function LevelSwitch({ current }: { current: Level }) {
  if (ENABLED_LEVELS.length < 2) return null;

  return (
    <nav aria-label="Nivo" className="mt-6 flex gap-3">
      {LEVELS.filter(({ level }) => ENABLED_LEVELS.includes(level)).map(
        ({ level, label, href }) => (
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
        ),
      )}
    </nav>
  );
}
