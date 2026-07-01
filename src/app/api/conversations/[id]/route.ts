import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const conversation = await prisma.conversation.updateMany({
    where: { id: params.id, tenantId: session.user.tenantId },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.visitorName !== undefined && { visitorName: body.visitorName }),
      ...(body.visitorEmail !== undefined && { visitorEmail: body.visitorEmail }),
    },
  });

  return NextResponse.json(conversation);
}
