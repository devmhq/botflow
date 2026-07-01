import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { plan, status } = body;

  const tenant = await prisma.tenant.update({
    where: { id: params.id },
    data: {
      ...(plan && { plan }),
      ...(status && { status }),
    },
  });

  return NextResponse.json(tenant);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.tenant.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
