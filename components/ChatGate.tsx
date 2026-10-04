import { SignInButton } from "@clerk/nextjs";


// Wird statt des Chats gezeigt, solange man nicht angemeldet ist
export function ChatGate() {
  return (
    <main className="mx-auto max-w-md px-6 pt-8 md:max-w-2xl">
      <section className="border-line bg-surface rounded-3xl border-2 p-6 text-center md:p-10">
        <div className="text-7xl" aria-hidden="true">
          💬
        </div>
        <h1 className="mt-4 text-3xl font-bold md:text-4xl">Učitelj</h1>
        <p className="text-muted mt-2 text-lg">
          Prijavi se da pričaš sa učiteljem. Prijaviš se samo jednom.
        </p>

        <div className="mt-8 space-y-3">
          <SignInButton mode="modal" forceRedirectUrl="/chat">
            <button
              type="button"
              className="bg-river text-bg flex min-h-16 w-full cursor-pointer items-center justify-center rounded-2xl text-xl font-bold"
            >
              Prijavi se
            </button>
          </SignInButton>
        </div>

        <p className="text-muted mt-6 text-sm">
          Lekcije i trening su besplatni i rade bez prijave.
        </p>
      </section>
    </main>
  );
}
