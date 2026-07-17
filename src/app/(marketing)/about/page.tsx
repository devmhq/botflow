import type { Metadata } from "next";
import { Target, Users, Zap, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About — BotFlow",
  description: "BotFlow's mission is to help local businesses never miss another customer.",
};

const VALUES = [
  {
    icon: Target,
    title: "Built for local businesses",
    description:
      "Not enterprise call centers — salons, restaurants, dental practices, and dealerships who need simple tools that just work.",
  },
  {
    icon: Zap,
    title: "Live in minutes, not weeks",
    description:
      "Every product decision we make optimizes for how fast a busy owner can go from signup to a working chatbot.",
  },
  {
    icon: Users,
    title: "Support that picks up the phone",
    description:
      "We build software for people who don't have an IT department, so real humans are always one message away.",
  },
  {
    icon: Heart,
    title: "Honest, transparent pricing",
    description:
      "No hidden fees, no surprise overages without warning, no long-term contracts required to get started.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-background py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[400px] bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--gradient-from),transparent_82%),transparent_60%)]"
        />
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            We help small businesses <span className="text-gradient-brand">never miss a customer</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            BotFlow started with a simple observation: local businesses lose customers every day to
            missed calls and after-hours messages. We built the AI chatbot we wished existed —
            one that&apos;s easy enough for any business owner to set up themselves.
          </p>
        </div>
      </section>

      <section className="bg-muted/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What we believe
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our story
          </h2>
          <p className="mt-4 text-muted-foreground">
            BotFlow was built by a small team who spent years building software for local businesses
            and kept hearing the same complaint: &ldquo;We can&apos;t answer the phone every time it rings.&rdquo;
            Off-the-shelf chatbots were built for enterprises with dedicated ops teams, and required
            hiring a developer just to install. So we built a chatbot platform that any business
            owner can set up themselves in minutes — trained on their own knowledge base, embeddable
            with a single line of code, and priced for a small business budget.
          </p>
        </div>
      </section>
    </>
  );
}
