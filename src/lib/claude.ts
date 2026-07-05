import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Starts a streaming Claude completion for the chat widget.
 */
export function streamChatCompletion({
  system,
  messages,
}: {
  system: string;
  messages: ChatMessage[];
}) {
  return anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system,
    messages,
  });
}

/**
 * Converts an in-flight Claude stream into an SSE ReadableStream suitable for
 * a Next.js Response. Calls `onComplete` with the full assembled text once
 * the model finishes, so callers can persist the assistant message.
 */
export function toSSEStream(
  claudeStream: ReturnType<typeof anthropic.messages.stream>,
  onComplete?: (fullText: string) => void | Promise<void>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let fullText = "";

      claudeStream.on("text", (delta: string) => {
        fullText += delta;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
      });

      try {
        await claudeStream.finalMessage();
        if (onComplete) await onComplete(fullText);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } catch {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "stream_failed" })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });
}
