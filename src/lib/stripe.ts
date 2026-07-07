import Stripe from "stripe";
import type { Plan } from "@/generated/prisma/enums";

/** Stripe client singleton. Falls back to a placeholder key so the app still boots without Stripe configured. */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia",
});

interface PlanLimit {
  chats: number;
  bots: number;
  members: number;
  price: string;
  priceId?: string;
}

/** Per-plan usage caps and Stripe price IDs, enforced when checking chat/bot/member limits. */
export const PLAN_LIMITS: Record<Plan, PlanLimit> = {
  STARTER: { chats: 500, bots: 1, members: 1, price: "$0/mo", priceId: process.env.STRIPE_STARTER_PRICE_ID },
  GROWTH: { chats: 2000, bots: 3, members: 5, price: "$49/mo", priceId: process.env.STRIPE_GROWTH_PRICE_ID },
  PRO: { chats: 10000, bots: 10, members: 20, price: "$149/mo", priceId: process.env.STRIPE_PRO_PRICE_ID },
};

/** Marketing copy for plan comparison UI (pricing page, billing page). */
export const PLAN_FEATURES: Record<Plan, string[]> = {
  STARTER: ["500 chats/month", "1 chatbot", "Basic analytics", "Email support"],
  GROWTH: ["2,000 chats/month", "3 chatbots", "Advanced analytics", "Priority support", "Custom domains"],
  PRO: ["10,000 chats/month", "10 chatbots", "Full analytics", "Dedicated support", "Custom domains", "API access"],
};
