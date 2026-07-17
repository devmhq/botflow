import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DemoWidgetPreview } from "@/components/landing/demo-widget-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[600px] bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--gradient-from),transparent_78%)_0%,transparent_55%),radial-gradient(circle_at_80%_10%,color-mix(in_oklch,var(--gradient-to),transparent_82%)_0%,transparent_55%)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Trusted by 500+ local businesses
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Turn website visitors into booked customers,{" "}
            <span className="text-gradient-brand">automatically.</span>
          </h1>

          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            BotFlow gives your business an AI chatbot trained on your own knowledge base —
            answering questions, capturing leads, and booking customers 24/7, with a single
            line of embed code.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "gradient", size: "lg" }), "h-11 gap-2 px-6 text-base")}
            >
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 gap-2 px-6 text-base")}
            >
              <PlayCircle className="h-4 w-4" />
              See how it works
            </a>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · 5 minute setup · Cancel anytime
          </p>
        </div>

        <div>
          <DemoWidgetPreview />
        </div>
      </div>
    </section>
  );
}
