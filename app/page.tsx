export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center md:max-w-2xl md:gap-6 lg:max-w-4xl">
      <span className="text-7xl md:text-8xl lg:text-9xl" aria-hidden="true">
        👋
      </span>
      <h1 className="text-4xl font-bold md:text-6xl lg:text-7xl">Zdravo!</h1>
      <p className="text-lg text-slate-600 md:text-2xl">Zajedno učimo nemački. Korak po korak.</p>
    </main>
  );
}
