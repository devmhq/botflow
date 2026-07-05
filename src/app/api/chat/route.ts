import { prisma } from "@/lib/prisma";
import { streamChatCompletion, toSSEStream, type ChatMessage } from "@/lib/claude";
import { searchKnowledge } from "@/lib/embeddings";
import { PLAN_LIMITS } from "@/lib/stripe";
import { corsHeaders, isOriginAllowed } from "@/lib/utils";

export const runtime = "nodejs";

const HISTORY_LIMIT = 20;

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  const body = await req.json().catch(() => null);
  const { botId, message, conversationId, visitorId, visitorName, visitorEmail } = body ?? {};

  if (!botId || !message || !visitorId) {
    return Response.json(
      { error: "botId, message, and visitorId are required" },
      { status: 400, headers }
    );
  }

  const bot = await prisma.chatbot.findUnique({
    where: { id: botId },
    include: { tenant: true },
  });

  if (!bot || bot.status !== "ACTIVE") {
    return Response.json({ error: "Chatbot not found or inactive" }, { status: 404, headers });
  }

  if (!isOriginAllowed(origin, bot.allowedDomains)) {
    return Response.json({ error: "Domain not allowed for this chatbot" }, { status: 403, headers });
  }

  const limit = PLAN_LIMITS[bot.tenant.plan].chats;
  if (bot.tenant.monthlyChatsUsed >= limit) {
    return Response.json(
      {
        error: "chat_limit_reached",
        message: "This business has reached its monthly chat limit. Please try again later.",
      },
      { status: 429, headers }
    );
  }

  let conversation = conversationId
    ? await prisma.conversation.findFirst({ where: { id: conversationId, chatbotId: bot.id } })
    : null;

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        visitorId,
        visitorName: visitorName ?? null,
        visitorEmail: visitorEmail ?? null,
        chatbotId: bot.id,
        tenantId: bot.tenantId,
      },
    });
  } else if (visitorName || visitorEmail) {
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        ...(visitorName && { visitorName }),
        ...(visitorEmail && { visitorEmail }),
      },
    });
  }

  await prisma.message.create({
    data: { role: "USER", content: message, conversationId: conversation.id },
  });

  const history = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: HISTORY_LIMIT,
  });

  const messages: ChatMessage[] = history.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  let knowledgeContext = "";
  try {
    const chunks = await searchKnowledge(bot.id, message, 5);
    if (chunks.length > 0) {
      knowledgeContext = `\n\nRelevant knowledge base context:\n${chunks
        .map((c) => `- ${c.content}`)
        .join("\n")}`;
    }
  } catch {
    // Knowledge search is best-effort — fall back to no context (e.g. embeddings not configured yet).
  }

  const system = `${bot.personality ?? "You are a helpful, friendly assistant."}${
    bot.businessType ? ` You work for a ${bot.businessType} business.` : ""
  }${knowledgeContext}\n\nKeep responses concise and conversational, as this is a live chat widget.`;

  const claudeStream = streamChatCompletion({ system, messages });

  const sseStream = toSSEStream(claudeStream, async (fullText) => {
    await prisma.$transaction([
      prisma.message.create({
        data: { role: "ASSISTANT", content: fullText, conversationId: conversation!.id },
      }),
      prisma.conversation.update({
        where: { id: conversation!.id },
        data: { updatedAt: new Date() },
      }),
      prisma.tenant.update({
        where: { id: bot.tenantId },
        data: { monthlyChatsUsed: { increment: 1 } },
      }),
    ]);
  });

  return new Response(sseStream, {
    headers: {
      ...headers,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Conversation-Id": conversation.id,
      "Access-Control-Expose-Headers": "X-Conversation-Id",
    },
  });
}
