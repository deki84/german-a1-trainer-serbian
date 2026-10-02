import type { Metadata } from "next";
import { ChatWindow } from "@/components/ChatWindow";

export const metadata: Metadata = {
  title: "Učitelj · Nemački",
};

export default function ChatPage() {
  return (
    <main className="mx-auto max-w-md px-6 pt-8 md:max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold md:text-4xl">
        <span aria-hidden="true">💬</span> Učitelj
      </h1>
      <ChatWindow />
    </main>
  );
}
