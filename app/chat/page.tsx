import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Učitelj · Nemački",
};

export default function ChatPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-10 text-center md:max-w-2xl">
      <div className="text-7xl" aria-hidden="true">
        💬
      </div>
      <h1 className="mt-4 text-3xl font-bold md:text-4xl">Učitelj</h1>
      <p className="text-muted mt-2 text-lg">Uskoro možeš ovde da postaviš pitanje. 🙂</p>
    </main>
  );
}
