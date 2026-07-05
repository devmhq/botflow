"use client";

import { Scissors, UtensilsCrossed, Stethoscope, Car, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const INDUSTRIES = [
  {
    key: "salon",
    label: "Salon",
    icon: Scissors,
    title: "Fill your chairs, not your inbox",
    description:
      "Let clients check availability, book appointments, and ask about services without calling during a haircut.",
    useCases: [
      "Answer questions about services & pricing",
      "Book and reschedule appointments",
      "Capture new client contact info",
      "Share hours and location instantly",
    ],
    sample: { q: "Do you do balayage?", a: "Yes! Balayage starts at $150 and takes about 2.5 hours. Want to see this week's openings?" },
  },
  {
    key: "restaurant",
    label: "Restaurant",
    icon: UtensilsCrossed,
    title: "Turn late-night browsers into reservations",
    description:
      "Handle menu questions, reservation requests, and dietary restrictions automatically, any time of day.",
    useCases: [
      "Share menu, hours, and specials",
      "Take reservation requests",
      "Answer dietary & allergy questions",
      "Promote catering and private events",
    ],
    sample: { q: "Do you have gluten-free options?", a: "We do! About a third of our menu is gluten-free, including our wood-fired pizzas. Want me to send the full menu?" },
  },
  {
    key: "dental",
    label: "Dental",
    icon: Stethoscope,
    title: "Reduce no-shows, answer FAQs instantly",
    description:
      "Give patients instant answers about insurance, procedures, and appointment scheduling.",
    useCases: [
      "Answer insurance & coverage questions",
      "Help patients request appointments",
      "Explain common procedures",
      "Send new patient intake forms",
    ],
    sample: { q: "Do you accept Delta Dental?", a: "Yes, we're in-network with Delta Dental PPO. Would you like to book a new patient exam?" },
  },
  {
    key: "auto",
    label: "Auto Dealership",
    icon: Car,
    title: "Qualify buyers before they set foot on the lot",
    description:
      "Answer inventory and financing questions and schedule test drives while your sales team focuses on closing.",
    useCases: [
      "Check current inventory & pricing",
      "Schedule test drives",
      "Answer financing & trade-in questions",
      "Route service requests",
    ],
    sample: { q: "Do you have any SUVs under $30k?", a: "We have 4 in stock right now, starting at $27,900. Want me to set up a test drive this week?" },
  },
];

export function Industries() {
  return (
    <section className="bg-white py-24 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Built for your industry
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
            BotFlow adapts to how your customers actually ask questions.
          </p>
        </div>

        <Tabs defaultValue="salon" className="mt-12">
          <TabsList className="mx-auto flex h-auto w-fit flex-wrap justify-center gap-1 bg-neutral-100 p-1.5 dark:bg-neutral-900">
            {INDUSTRIES.map(({ key, label, icon: Icon }) => (
              <TabsTrigger key={key} value={key} className="gap-1.5 px-3.5 py-2">
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {INDUSTRIES.map(({ key, title, description, useCases, sample }) => (
            <TabsContent key={key} value={key} className="mt-10">
              <div className="grid gap-10 md:grid-cols-2 md:items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">{title}</h3>
                  <p className="mt-3 text-neutral-600 dark:text-neutral-400">{description}</p>
                  <ul className="mt-6 space-y-3">
                    {useCases.map((useCase) => (
                      <li key={useCase} className="flex items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
                        {useCase}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
                    {sample.q}
                  </div>
                  <div className="mt-3 max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-neutral-800 shadow-sm dark:bg-neutral-800 dark:text-neutral-100">
                    {sample.a}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
