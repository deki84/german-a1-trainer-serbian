import type { Metadata } from "next";
import { LessonList } from "@/components/LessonList";
import { LevelSwitch } from "@/components/LevelSwitch";

export const metadata: Metadata = {
  title: "Lekcije · Nemački",
};

export default function LessonsPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-10 md:max-w-3xl lg:max-w-5xl">
      <h1 className="text-3xl font-bold md:text-4xl">
        <span aria-hidden="true">📚</span> Lekcije
      </h1>

      <LevelSwitch current="a1" />
      <LessonList level="a1" />
    </main>
  );
}
