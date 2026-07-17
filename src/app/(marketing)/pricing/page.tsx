import type { Metadata } from "next";
import Link from "next/link";
import { Pricing } from "@/components/landing/pricing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing — BotFlow",
  description: "Simple, transparent pricing for BotFlow's AI chatbot platform.",
};

const FAQS = [
  {
    q: "Can I switch plans later?",
    a: "Yes — upgrade or downgrade anytime from your billing settings. Changes apply immediately and are prorated.",
  },
  {
    q: "What happens if I go over my chat limit?",
    a: "We'll notify you as you approach your limit. If you exceed it, new conversations pause until the next billing cycle or you upgrade.",
  },
  {
    q: "Do you offer a free trial?",
    a: "The Starter plan is free to use with no credit card required, so you can try BotFlow risk-free before upgrading.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, there are no long-term contracts. Cancel anytime from the Stripe customer portal in your billing settings.",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-background py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[400px] bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--gradient-from),transparent_82%),transparent_60%)]"
        />
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, transparent <span className="text-gradient-brand">pricing</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade as your conversation volume grows. No hidden fees, ever.
          </p>
        </div>
      </section>

      <Pricing showHeading={false} />

      <section className="bg-background py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-6">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-border bg-card p-6">
                <p className="font-semibold text-foreground">{q}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <p className="text-muted-foreground">Still have questions?</p>
            <Link href="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-4")}>
              Contact sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
