import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe, PLAN_LIMITS } from "@/lib/stripe";
import type { Plan } from "@/generated/prisma/enums";

export const runtime = "nodejs";

function planForPriceId(priceId: string | undefined): Plan | null {
  if (!priceId) return null;
  const entry = Object.entries(PLAN_LIMITS).find(([, limits]) => limits.priceId === priceId);
  return (entry?.[0] as Plan) ?? null;
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook signature or secret" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const tenantId = checkoutSession.client_reference_id ?? checkoutSession.metadata?.tenantId;
      if (!tenantId || !checkoutSession.customer || !checkoutSession.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string);
      const plan = planForPriceId(subscription.items.data[0]?.price.id);

      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          stripeCustomerId: checkoutSession.customer as string,
          stripeSubscriptionId: subscription.id,
          ...(plan && { plan }),
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const plan = planForPriceId(subscription.items.data[0]?.price.id);
      const tenant = await prisma.tenant.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (!tenant) break;

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          ...(plan && { plan }),
          status: subscription.status === "active" || subscription.status === "trialing" ? "ACTIVE" : "SUSPENDED",
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const tenant = await prisma.tenant.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (!tenant) break;

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { plan: "STARTER", status: "CANCELLED", stripeSubscriptionId: null },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
