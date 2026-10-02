import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { ChatGate } from "@/components/ChatGate";
import { ChatWindow } from "@/components/ChatWindow";

export const metadata: Metadata = {
  title: "Učitelj · Nemački",
};

export default async function ChatPage() {
  const { userId } = await auth();
  if (!userId) return <ChatGate />;

  return (
    <main className="mx-auto max-w-md px-6 pt-8 md:max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold md:text-4xl">
          <span aria-hidden="true">💬</span> Učitelj
        </h1>
        <UserButton />
      </div>
      <ChatWindow />
    </main>
  );
}