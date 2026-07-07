import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getBot(id: string, tenantId: string) {
  return prisma.chatbot.findFirst({ where: { id, tenantId } });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bot = await getBot(params.id, session.user.tenantId);
    if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(bot);
  } catch (err) {
    console.error("GET /api/bots/[id] failed:", err);
    return NextResponse.json({ error: "Failed to load chatbot" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await getBot(params.id, session.user.tenantId);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    const bot = await prisma.chatbot.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.businessType !== undefined && { businessType: body.businessType }),
        ...(body.personality !== undefined && { personality: body.personality }),
        ...(body.widgetColor !== undefined && { widgetColor: body.widgetColor }),
        ...(body.widgetPosition !== undefined && { widgetPosition: body.widgetPosition }),
        ...(body.welcomeMessage !== undefined && { welcomeMessage: body.welcomeMessage }),
        ...(body.allowedDomains !== undefined && { allowedDomains: body.allowedDomains }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
      },
    });

    return NextResponse.json(bot);
  } catch (err) {
    console.error("PATCH /api/bots/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update chatbot" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await getBot(params.id, session.user.tenantId);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.chatbot.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/bots/[id] failed:", err);
    return NextResponse.json({ error: "Failed to delete chatbot" }, { status: 500 });
  }
}
