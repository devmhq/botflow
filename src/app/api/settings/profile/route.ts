import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, businessName } = body;

    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (businessName !== undefined && !businessName.trim()) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    if (name !== undefined) {
      await prisma.user.update({ where: { id: session.user.id }, data: { name } });
    }
    if (businessName !== undefined && session.user.tenantId) {
      await prisma.tenant.update({
        where: { id: session.user.tenantId },
        data: { name: businessName },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/settings/profile failed:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
