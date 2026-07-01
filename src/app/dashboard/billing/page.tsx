import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Check, ExternalLink } from "lucide-react";

const PLAN_LIMITS: Record<string, { chats: number; bots: number; members: number; price: string }> = {
  STARTER: { chats: 500, bots: 1, members: 1, price: "$0/mo" },
  GROWTH: { chats: 2000, bots: 3, members: 5, price: "$49/mo" },
  PRO: { chats: 10000, bots: 10, members: 20, price: "$149/mo" },
};

const PLAN_FEATURES: Record<string, string[]> = {
  STARTER: ["500 chats/month", "1 chatbot", "Basic analytics", "Email support"],
  GROWTH: ["2,000 chats/month", "3 chatbots", "Advanced analytics", "Priority support", "Custom domains"],
  PRO: ["10,000 chats/month", "10 chatbots", "Full analytics", "Dedicated support", "Custom domains", "API access"],
};

export default async function BillingPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return null;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return null;

  const limits = PLAN_LIMITS[tenant.plan];
  const chatUsagePct = Math.min(
    Math.round((tenant.monthlyChatsUsed / limits.chats) * 100),
    100
  );

  return (
    <>
      <DashboardHeader title="Billing" userName={session.user?.name ?? undefined} />
      <main className="p-6 space-y-6 max-w-3xl">
        {/* Current plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{tenant.plan}</p>
                <p className="text-sm text-neutral-500">{limits.price}</p>
              </div>
              {tenant.stripeSubscriptionId && (
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Manage billing
                </Button>
              )}
            </div>
            <Separator />
            <ul className="space-y-2">
              {PLAN_FEATURES[tenant.plan].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Usage meter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Chats used</span>
              <span className="font-medium">
                {tenant.monthlyChatsUsed} / {limits.chats}
              </span>
            </div>
            <Progress value={chatUsagePct} className="h-2" />
            <p className="text-xs text-neutral-400">
              {chatUsagePct}% used · resets on the 1st of each month
            </p>
            {chatUsagePct >= 80 && (
              <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
                You&apos;re approaching your chat limit. Consider upgrading.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upgrade options */}
        {tenant.plan !== "PRO" && (
          <div>
            <h2 className="mb-4 text-base font-semibold">Upgrade Plan</h2>
            <div className="grid grid-cols-2 gap-4">
              {(["GROWTH", "PRO"] as const)
                .filter((p) => p !== tenant.plan)
                .map((plan) => (
                  <Card key={plan} className={plan === "PRO" ? "border-indigo-200 ring-1 ring-indigo-200" : ""}>
                    <CardContent className="p-5 space-y-3">
                      <div>
                        <p className="font-bold text-lg">{plan}</p>
                        <p className="text-sm text-neutral-500">{PLAN_LIMITS[plan].price}</p>
                      </div>
                      <ul className="space-y-1.5">
                        {PLAN_FEATURES[plan].map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                            <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" size="sm">
                        Upgrade to {plan}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Billing history placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            {!tenant.stripeSubscriptionId ? (
              <p className="text-sm text-neutral-400">No billing history. You&apos;re on the free plan.</p>
            ) : (
              <p className="text-sm text-neutral-400">
                View your full billing history in the{" "}
                <button className="text-indigo-600 underline">Stripe portal</button>.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
