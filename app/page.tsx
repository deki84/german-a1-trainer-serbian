/**
 * Startseite (Server Component, deshalb kein "use client").
 * Mobile-first: zentriert, schmale Spalte, große Schrift.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="text-7xl" aria-hidden="true">
        👋
      </span>
      <h1 className="text-4xl font-bold">Zdravo!</h1>
      <p className="text-lg text-slate-600">Zajedno učimo nemački. Korak po korak.</p>
    </main>
  );
}