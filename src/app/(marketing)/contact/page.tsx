import type { Metadata } from "next";
import { Mail, MessageCircle, Clock } from "lucide-react";
import { ContactForm } from "@/components/landing/contact-form";

export const metadata: Metadata = {
  title: "Contact — BotFlow",
  description: "Get in touch with the BotFlow team.",
};

const CONTACT_CARDS = [
  {
    icon: Mail,
    title: "Email us",
    description: "hello@botflow.app",
  },
  {
    icon: MessageCircle,
    title: "Live chat",
    description: "Chat with us right on this site — bottom right corner.",
  },
  {
    icon: Clock,
    title: "Response time",
    description: "We reply within one business day, usually much sooner.",
  },
];

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden bg-background py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[400px] bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--gradient-from),transparent_82%),transparent_60%)]"
      />
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Get in <span className="text-gradient-brand">touch</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Questions about pricing, a demo, or need help getting set up? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            {CONTACT_CARDS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
