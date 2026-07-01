import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bots = await prisma.chatbot.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { conversations: true, knowledgeItems: true } } },
  });

  return NextResponse.json(bots);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, businessType, personality, widgetColor, widgetPosition, welcomeMessage, allowedDomains } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const bot = await prisma.chatbot.create({
    data: {
      name,
      businessType: businessType ?? null,
      personality: personality ?? null,
      widgetColor: widgetColor ?? "#4F46E5",
      widgetPosition: widgetPosition ?? "bottom-right",
      welcomeMessage: welcomeMessage ?? "Hi! How can I help you today?",
      allowedDomains: allowedDomains ?? [],
      tenantId: session.user.tenantId,
      status: "DRAFT",
    },
  });

  return NextResponse.json(bot, { status: 201 });
}
