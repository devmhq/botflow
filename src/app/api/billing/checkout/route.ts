import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLAN_LIMITS } from "@/lib/stripe";
import type { Plan } from "@/generated/prisma/enums";

export async function POST(req: Request) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const plan = body?.plan as Plan | undefined;
  const priceId = plan ? PLAN_LIMITS[plan]?.priceId : undefined;
  if (!plan || plan === "STARTER" || !priceId) {
    return NextResponse.json({ error: "Invalid or unconfigured plan" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    ...(tenant.stripeCustomerId
      ? { customer: tenant.stripeCustomerId }
      : { customer_email: session.user?.email ?? undefined }),
    client_reference_id: tenant.id,
    metadata: { tenantId: tenant.id },
    subscription_data: { metadata: { tenantId: tenant.id } },
    success_url: `${appUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${appUrl}/dashboard/billing?checkout=cancelled`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
