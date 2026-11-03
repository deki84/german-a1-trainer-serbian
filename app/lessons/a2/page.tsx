import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonList } from "@/components/LessonList";
import { LevelSwitch } from "@/components/LevelSwitch";
import { A2_ENABLED } from "@/data/content";

export const metadata: Metadata = {
  title: "Lekcije A2 · Nemački",
};

export default function LessonsA2Page() {
  // Ohne Schalter gibt es diese Seite nicht
  if (!A2_ENABLED) notFound();

  return (
    <main className="mx-auto max-w-md px-6 py-10 md:max-w-3xl lg:max-w-5xl">
      <h1 className="text-3xl font-bold md:text-4xl">
        <span aria-hidden="true">📚</span> Lekcije
      </h1>

      <LevelSwitch current="a2" />
      <LessonList level="a2" />
    </main>
  );
}
