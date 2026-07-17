import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, PLAN_FEATURES } from "@/lib/stripe";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ManageBillingButton, ManageBillingLink, UpgradeButton } from "@/components/dashboard/billing-actions";
import { Check } from "lucide-react";

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
                <p className="text-sm text-muted-foreground">{limits.price}</p>
              </div>
              {tenant.stripeSubscriptionId && <ManageBillingButton />}
            </div>
            <Separator />
            <ul className="space-y-2">
              {PLAN_FEATURES[tenant.plan].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" />
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
              <span className="text-muted-foreground">Chats used</span>
              <span className="font-medium">
                {tenant.monthlyChatsUsed} / {limits.chats}
              </span>
            </div>
            <Progress value={chatUsagePct} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {chatUsagePct}% used · resets on the 1st of each month
            </p>
            {chatUsagePct >= 80 && (
              <p className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
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
                  <Card key={plan} className={plan === "PRO" ? "border-primary/30 ring-1 ring-primary/30" : ""}>
                    <CardContent className="p-5 space-y-3">
                      <div>
                        <p className="font-bold text-lg">{plan}</p>
                        <p className="text-sm text-muted-foreground">{PLAN_LIMITS[plan].price}</p>
                      </div>
                      <ul className="space-y-1.5">
                        {PLAN_FEATURES[plan].map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <UpgradeButton plan={plan} />
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
              <p className="text-sm text-muted-foreground">No billing history. You&apos;re on the free plan.</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                View your full billing history in the <ManageBillingLink />.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
