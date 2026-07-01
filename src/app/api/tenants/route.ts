import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, slug, adminName, adminEmail, adminPassword, plan } = body;

  if (!name || !slug || !adminName || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (adminPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existingSlug = await prisma.tenant.findUnique({ where: { slug } });
  if (existingSlug) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingEmail) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(adminPassword, 12);

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      plan: plan ?? "STARTER",
      users: {
        create: {
          name: adminName,
          email: adminEmail,
          password: hashed,
          role: "ADMIN",
        },
      },
    },
  });

  return NextResponse.json(tenant, { status: 201 });
}
