import { prisma } from "@/lib/prisma";
import { corsHeaders, isOriginAllowed } from "@/lib/utils";

export const runtime = "nodejs";

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  const botId = new URL(req.url).searchParams.get("botId");
  if (!botId) {
    return Response.json({ error: "botId is required" }, { status: 400, headers });
  }

  try {
    const bot = await prisma.chatbot.findUnique({
      where: { id: botId },
      select: {
        id: true,
        name: true,
        status: true,
        widgetColor: true,
        widgetPosition: true,
        welcomeMessage: true,
        avatarUrl: true,
        allowedDomains: true,
      },
    });

    if (!bot || bot.status !== "ACTIVE") {
      return Response.json({ error: "Chatbot not found or inactive" }, { status: 404, headers });
    }

    if (!isOriginAllowed(origin, bot.allowedDomains)) {
      return Response.json({ error: "Domain not allowed for this chatbot" }, { status: 403, headers });
    }

    return Response.json(
      {
        botId: bot.id,
        name: bot.name,
        widgetColor: bot.widgetColor,
        widgetPosition: bot.widgetPosition,
        welcomeMessage: bot.welcomeMessage,
        avatarUrl: bot.avatarUrl,
      },
      { headers }
    );
  } catch (err) {
    console.error("GET /api/widget-config failed:", err);
    return Response.json({ error: "Failed to load widget config" }, { status: 500, headers });
  }
}
