import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { botId, content, sourceType } = body;

  if (!botId || !content) {
    return NextResponse.json({ error: "botId and content are required" }, { status: 400 });
  }

  // Verify the bot belongs to this tenant
  const bot = await prisma.chatbot.findFirst({
    where: { id: botId, tenantId: session.user.tenantId },
  });
  if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const item = await prisma.knowledgeItem.create({
    data: {
      content,
      sourceType: sourceType ?? "text",
      chatbotId: botId,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
