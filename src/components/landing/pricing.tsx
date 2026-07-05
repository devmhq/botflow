import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLAN_LIMITS, PLAN_FEATURES } from "@/lib/stripe";
import type { Plan } from "@/generated/prisma/enums";

const PLANS: { key: Plan; description: string; highlighted?: boolean }[] = [
  { key: "STARTER", description: "Try BotFlow with no risk." },
  { key: "GROWTH", description: "For growing businesses ready to scale.", highlighted: true },
  { key: "PRO", description: "For high-volume businesses and multi-location brands." },
];

const COMPARISON_ROWS: { label: string; values: Record<Plan, string> }[] = [
  { label: "Chats / month", values: { STARTER: "500", GROWTH: "2,000", PRO: "10,000" } },
  { label: "Chatbots", values: { STARTER: "1", GROWTH: "3", PRO: "10" } },
  { label: "Team members", values: { STARTER: "1", GROWTH: "5", PRO: "20" } },
  { label: "Analytics", values: { STARTER: "Basic", GROWTH: "Advanced", PRO: "Full" } },
  { label: "Support", values: { STARTER: "Email", GROWTH: "Priority", PRO: "Dedicated" } },
  { label: "Custom domains", values: { STARTER: "—", GROWTH: "✓", PRO: "✓" } },
  { label: "API access", values: { STARTER: "—", GROWTH: "—", PRO: "✓" } },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-neutral-50 py-24 dark:bg-neutral-900/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
            Start free. Upgrade as your conversation volume grows.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PLANS.map(({ key, description, highlighted }) => (
            <Card
              key={key}
              className={cn(
                "border-neutral-200 dark:border-neutral-800",
                highlighted && "border-indigo-300 ring-2 ring-indigo-600 dark:border-indigo-800"
              )}
            >
              <CardContent className="flex flex-col gap-5 p-6">
                {highlighted && (
                  <span className="w-fit rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-medium text-white">
                    Most popular
                  </span>
                )}
                <div>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">{key.charAt(0) + key.slice(1).toLowerCase()}</p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
                </div>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                  {PLAN_LIMITS[key].price}
                </p>
                <ul className="space-y-2.5">
                  {PLAN_FEATURES[key].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-auto",
                    highlighted ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
                  )}
                >
                  {key === "STARTER" ? "Start for free" : `Choose ${key.charAt(0) + key.slice(1).toLowerCase()}`}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Compare plans</TableHead>
                <TableHead className="text-center">Starter</TableHead>
                <TableHead className="text-center">Growth</TableHead>
                <TableHead className="text-center">Pro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPARISON_ROWS.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">{row.label}</TableCell>
                  <TableCell className="text-center text-neutral-600 dark:text-neutral-400">{row.values.STARTER}</TableCell>
                  <TableCell className="text-center text-neutral-600 dark:text-neutral-400">{row.values.GROWTH}</TableCell>
                  <TableCell className="text-center text-neutral-600 dark:text-neutral-400">{row.values.PRO}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
