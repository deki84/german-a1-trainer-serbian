import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonList } from "@/components/LessonList";
import { LevelSwitch } from "@/components/LevelSwitch";
import { B1_ENABLED, lessonsOf } from "@/data/content";

export const metadata: Metadata = {
  title: "Lekcije B1 · Nemački",
};

export default function LessonsB1Page() {
  // Ohne Schalter gibt es diese Seite nicht
  if (!B1_ENABLED) notFound();

  return (
    <main className="mx-auto max-w-md px-6 py-10 md:max-w-3xl lg:max-w-5xl">
      <h1 className="text-3xl font-bold md:text-4xl">
        <span aria-hidden="true">📚</span> Lekcije
      </h1>

      <LevelSwitch current="b1" />
      {lessonsOf("b1").length === 0 ? (
        <p className="text-muted mt-10 text-lg">Uskoro. 🙂</p>
      ) : (
        <LessonList level="b1" />
      )}
    </main>
  );
}
