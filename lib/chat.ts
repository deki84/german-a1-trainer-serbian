export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export const MAX_MESSAGES = 12; // nur die letzten Nachrichten mitschicken (Kosten)
export const MAX_CHARS = 500; // pro Nachricht

function isChatMessage(value: unknown): value is ChatMessage {
  const message = value as ChatMessage;
  return (
    typeof value === "object" &&
    value !== null &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

// Eingaben vom Browser NIE ungeprüft an die KI weitergeben
export function parseMessages(body: unknown): ChatMessage[] | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw)) return null;

  const messages = raw
    .filter(isChatMessage)
    .map((message) => ({ role: message.role, content: message.content.trim().slice(0, MAX_CHARS) }))
    .filter((message) => message.content.length > 0)
    .slice(-MAX_MESSAGES);

  // Die letzte Nachricht muss vom Nutzer sein, sonst gibt es nichts zu beantworten
  if (messages.at(-1)?.role !== "user") return null;
  return messages;
}