import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, businessName } = body;

  if (!name || !email || !password || !businessName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let uniqueSlug = slug;
  let suffix = 1;
  while (await prisma.tenant.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${++suffix}`;
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.tenant.create({
    data: {
      name: businessName,
      slug: uniqueSlug,
      plan: "STARTER",
      users: {
        create: {
          name,
          email,
          password: hashed,
          role: "ADMIN",
        },
      },
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
