import type { Metadata } from "next";
import Link from "next/link";
import { TodayPlayer } from "@/components/TodayPlayer";
import { LESSONS } from "@/data/lessons";

export const metadata: Metadata = {
  title: "Današnji trening · Nemački",
};

export default function TodayPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 py-6 md:max-w-2xl">
      <Link
        href="/"
        className="border-line inline-flex h-12 items-center gap-2 rounded-full border-2 px-4 font-bold"
      >
        <span aria-hidden="true">⬅</span> Nazad
      </Link>

      <h1 className="mt-6 text-3xl font-bold md:text-4xl">
        <span aria-hidden="true">📅</span> Današnji trening
      </h1>

      <TodayPlayer lessons={LESSONS} />
    </main>
  );
}
