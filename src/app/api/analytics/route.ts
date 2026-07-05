import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = Math.min(Math.max(Number(searchParams.get("days")) || 14, 1), 90);

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [totalConversations, openConversations, resolvedConversations, totalBots, recentConversations] =
    await Promise.all([
      prisma.conversation.count({ where: { tenantId } }),
      prisma.conversation.count({ where: { tenantId, status: "OPEN" } }),
      prisma.conversation.count({ where: { tenantId, status: "RESOLVED" } }),
      prisma.chatbot.count({ where: { tenantId } }),
      prisma.conversation.count({ where: { tenantId, createdAt: { gte: thirtyDaysAgo } } }),
    ]);

  const daily: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(new Date(day).setHours(23, 59, 59, 999));
    const count = await prisma.conversation.count({
      where: { tenantId, createdAt: { gte: start, lte: end } },
    });
    daily.push({ date: start.toISOString().slice(0, 10), count });
  }

  const bots = await prisma.chatbot.findMany({
    where: { tenantId },
    select: { id: true, name: true, _count: { select: { conversations: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    totalConversations,
    openConversations,
    resolvedConversations,
    totalBots,
    recentConversations,
    daily,
    bots,
  });
}
