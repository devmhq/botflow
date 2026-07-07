import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { corsHeaders, isOriginAllowed } from "@/lib/utils";

export const runtime = "nodejs";

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

/** Dashboard-facing: list conversations for the authenticated tenant. */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const botId = searchParams.get("botId");

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(status && status !== "ALL" ? { status: status as "OPEN" | "RESOLVED" } : {}),
        ...(botId ? { chatbotId: botId } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        chatbot: { select: { name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json(conversations);
  } catch (err) {
    console.error("GET /api/conversations failed:", err);
    return NextResponse.json({ error: "Failed to load conversations" }, { status: 500 });
  }
}

/** Widget-facing: start a new conversation for a chatbot (e.g. after lead capture). */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  const body = await req.json().catch(() => null);
  const { botId, visitorId, visitorName, visitorEmail } = body ?? {};

  if (!botId || !visitorId) {
    return NextResponse.json({ error: "botId and visitorId are required" }, { status: 400, headers });
  }

  try {
    const bot = await prisma.chatbot.findUnique({ where: { id: botId } });
    if (!bot || bot.status !== "ACTIVE") {
      return NextResponse.json({ error: "Chatbot not found or inactive" }, { status: 404, headers });
    }

    if (!isOriginAllowed(origin, bot.allowedDomains)) {
      return NextResponse.json({ error: "Domain not allowed for this chatbot" }, { status: 403, headers });
    }

    const conversation = await prisma.conversation.create({
      data: {
        visitorId,
        visitorName: visitorName ?? null,
        visitorEmail: visitorEmail ?? null,
        chatbotId: bot.id,
        tenantId: bot.tenantId,
      },
    });

    return NextResponse.json(conversation, { status: 201, headers });
  } catch (err) {
    console.error("POST /api/conversations failed:", err);
    return NextResponse.json({ error: "Failed to start conversation" }, { status: 500, headers });
  }
}
