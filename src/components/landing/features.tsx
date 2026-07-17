import { Sparkles, BookOpen, UserPlus, BarChart3, Code2, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Conversations",
    description: "Natural, on-brand conversations powered by Claude — not rigid decision trees.",
  },
  {
    icon: BookOpen,
    title: "Custom Knowledge Base",
    description: "Upload FAQs or PDFs and your bot instantly learns your business, prices, and policies.",
  },
  {
    icon: UserPlus,
    title: "Automatic Lead Capture",
    description: "Every conversation captures a name and email before it starts, so no lead slips away.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track conversations, resolution rates, and trends from a live dashboard.",
  },
  {
    icon: Code2,
    title: "One-Line Embed",
    description: "Add a single script tag to your site and your chatbot is live — no developer required.",
  },
  {
    icon: Palette,
    title: "Fully Customizable",
    description: "Match your brand with custom colors, avatar, welcome message, and widget position.",
  },
];

const CHIP_STYLES = [
  "bg-primary/10 text-primary",
  "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
];

export function Features() {
  return (
    <section id="features" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything your business needs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built for small businesses that want an AI chatbot without the complexity.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <Card key={title} className="border-border transition-shadow hover:shadow-md">
              <CardContent className="space-y-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${CHIP_STYLES[i % 2]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
