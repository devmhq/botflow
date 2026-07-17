import { Wand2, BookOpen, Code2 } from "lucide-react";

const STEPS = [
  {
    number: "1",
    icon: Wand2,
    title: "Set up your bot in minutes",
    description:
      "Pick your business type, personality, and appearance in a guided 3-step wizard — no technical skills needed.",
  },
  {
    number: "2",
    icon: BookOpen,
    title: "Train it on your business",
    description:
      "Paste in your FAQs or upload a PDF. BotFlow builds a knowledge base so your bot always gives accurate answers.",
  },
  {
    number: "3",
    icon: Code2,
    title: "Embed & start chatting",
    description:
      "Copy one line of code onto your site. Your bot goes live instantly, capturing leads while you sleep.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From signup to live chatbot in under five minutes.
          </p>
        </div>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="relative flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg shadow-primary/25">
                <Icon className="h-6 w-6" />
              </div>
              <span className="mt-4 text-xs font-semibold tracking-widest text-primary">
                STEP {number}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
