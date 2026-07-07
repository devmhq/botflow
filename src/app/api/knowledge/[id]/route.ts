import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify ownership via chatbot → tenant
    const item = await prisma.knowledgeItem.findFirst({
      where: { id: params.id, chatbot: { tenantId: session.user.tenantId } },
    });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.knowledgeItem.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/knowledge/[id] failed:", err);
    return NextResponse.json({ error: "Failed to delete knowledge item" }, { status: 500 });
  }
}
