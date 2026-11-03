import Link from "next/link";
import { LessonBadge } from "@/components/LessonBadge";
import { lessonsBySection, type Level } from "@/data/content";
import { SECTIONS } from "@/data/lessons";

/** Alle Rubriken mit ihren Lektionen für ein Niveau. Rubriken ohne Lektionen werden ausgeblendet. */
export function LessonList({ level }: { level: Level }) {
  return (
    <>
      {SECTIONS.map((section) => {
        const lessons = lessonsBySection(section.id, level);
        if (lessons.length === 0) return null;

        return (
          <section key={section.id} className="mt-10" aria-labelledby={`section-${section.id}`}>
            <h2 id={`section-${section.id}`} className="text-xl font-bold md:text-2xl">
              <span aria-hidden="true">{section.emoji}</span> {section.title}
            </h2>

            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/lesson/${lesson.id}`}
                    className="border-line bg-surface hover:border-river flex items-center gap-4 rounded-2xl border-2 p-4 transition-colors"
                  >
                    <span className="w-12 flex-none text-center text-4xl" aria-hidden="true">
                      {lesson.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-lg font-bold">{lesson.title}</p>
                      <p className="text-muted truncate">
                        {lesson.subtitle} · {lesson.words.length} reči
                      </p>
                    </div>
                    <LessonBadge words={lesson.words.map((word) => word.de)} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
