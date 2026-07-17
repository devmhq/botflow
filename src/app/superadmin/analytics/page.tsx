import { prisma } from "@/lib/prisma";
import { SuperadminHeader } from "@/components/superadmin/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, MessageSquare, Building2, Bot } from "lucide-react";

async function getAnalyticsData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    totalConversations,
    recentConversations,
    tenantsByPlan,
    chatbotsByStatus,
    totalTenants,
    totalChatbots,
  ] = await Promise.all([
    prisma.conversation.count(),
    prisma.conversation.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.tenant.groupBy({ by: ["plan"], _count: { _all: true } }),
    prisma.chatbot.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.tenant.count(),
    prisma.chatbot.count(),
  ]);

  // Daily chat counts for last 14 days
  const dailyData: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(day.setHours(23, 59, 59, 999));
    const count = await prisma.conversation.count({
      where: { createdAt: { gte: start, lte: end } },
    });
    dailyData.push({
      date: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
    });
  }

  return {
    totalConversations,
    recentConversations,
    tenantsByPlan,
    chatbotsByStatus,
    totalTenants,
    totalChatbots,
    dailyData,
  };
}

const planColors: Record<string, string> = {
  STARTER: "bg-muted-foreground/40",
  GROWTH: "bg-primary",
  PRO: "bg-fuchsia-500",
};

const planTextColors: Record<string, string> = {
  STARTER: "text-muted-foreground",
  GROWTH: "text-primary",
  PRO: "text-fuchsia-600 dark:text-fuchsia-400",
};

export default async function AnalyticsPage() {
  const {
    totalConversations,
    recentConversations,
    tenantsByPlan,
    chatbotsByStatus,
    totalTenants,
    totalChatbots,
    dailyData,
  } = await getAnalyticsData();

  const maxDaily = Math.max(...dailyData.map((d) => d.count), 1);

  const planMap = Object.fromEntries(
    tenantsByPlan.map((g) => [g.plan, g._count._all])
  );

  const statusMap = Object.fromEntries(
    chatbotsByStatus.map((g) => [g.status, g._count._all])
  );

  return (
    <>
      <SuperadminHeader title="Analytics" />
      <main className="p-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Conversations", value: totalConversations, icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
            { label: "Last 30 Days", value: recentConversations, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Total Tenants", value: totalTenants, icon: Building2, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10" },
            { label: "Total Chatbots", value: totalChatbots, icon: Bot, color: "text-fuchsia-600 dark:text-fuchsia-400", bg: "bg-fuchsia-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 text-3xl font-bold">{value}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Daily chats bar chart */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Daily Conversations (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-end gap-1">
                {dailyData.map(({ date, count }) => (
                  <div key={date} className="group flex flex-1 flex-col items-center gap-1">
                    <div className="relative w-full">
                      <div
                        className="w-full rounded-t bg-primary transition-all"
                        style={{ height: `${(count / maxDaily) * 160}px`, minHeight: count > 0 ? "4px" : "0" }}
                      />
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-xs text-background group-hover:block">
                        {count}
                      </div>
                    </div>
                    <span className="rotate-45 text-[9px] text-muted-foreground origin-left">{date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tenants by plan donut */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tenants by Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["STARTER", "GROWTH", "PRO"].map((plan) => {
                const count = planMap[plan] ?? 0;
                const pct = totalTenants > 0 ? Math.round((count / totalTenants) * 100) : 0;
                return (
                  <div key={plan}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className={`font-medium ${planTextColors[plan]}`}>{plan}</span>
                      <span className="text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${planColors[plan]} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-3 text-sm font-medium text-foreground">Chatbots by Status</p>
                {["ACTIVE", "INACTIVE", "DRAFT"].map((status) => {
                  const count = statusMap[status] ?? 0;
                  const pct = totalChatbots > 0 ? Math.round((count / totalChatbots) * 100) : 0;
                  const colors: Record<string, string> = {
                    ACTIVE: "bg-emerald-500",
                    INACTIVE: "bg-muted-foreground/30",
                    DRAFT: "bg-amber-400",
                  };
                  return (
                    <div key={status} className="mb-2">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">{status}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${colors[status]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
