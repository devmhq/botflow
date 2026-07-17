import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bot, TrendingUp, Clock } from "lucide-react";

async function getAnalytics(tenantId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    totalConversations,
    openConversations,
    resolvedConversations,
    totalBots,
    recentConversations,
  ] = await Promise.all([
    prisma.conversation.count({ where: { tenantId } }),
    prisma.conversation.count({ where: { tenantId, status: "OPEN" } }),
    prisma.conversation.count({ where: { tenantId, status: "RESOLVED" } }),
    prisma.chatbot.count({ where: { tenantId } }),
    prisma.conversation.count({ where: { tenantId, createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  // Daily counts for last 14 days
  const daily: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(day.setHours(23, 59, 59, 999));
    const count = await prisma.conversation.count({
      where: { tenantId, createdAt: { gte: start, lte: end } },
    });
    daily.push({
      date: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
    });
  }

  // Conversations per bot
  const bots = await prisma.chatbot.findMany({
    where: { tenantId },
    include: { _count: { select: { conversations: true } } },
    orderBy: { createdAt: "asc" },
  });

  return {
    totalConversations,
    openConversations,
    resolvedConversations,
    totalBots,
    recentConversations,
    daily,
    bots,
  };
}

export default async function DashboardAnalyticsPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return null;

  const {
    totalConversations,
    openConversations,
    resolvedConversations,
    recentConversations,
    daily,
    bots,
  } = await getAnalytics(tenantId);

  const maxDaily = Math.max(...daily.map((d) => d.count), 1);
  const maxBotConvos = Math.max(...bots.map((b) => b._count.conversations), 1);

  return (
    <>
      <DashboardHeader title="Analytics" userName={session.user?.name ?? undefined} />
      <main className="p-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Conversations", value: totalConversations, icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
            { label: "Open", value: openConversations, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
            { label: "Resolved", value: resolvedConversations, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Last 30 Days", value: recentConversations, icon: Bot, color: "text-fuchsia-600 dark:text-fuchsia-400", bg: "bg-fuchsia-500/10" },
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
          {/* Daily chart */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Daily Conversations (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-end gap-1">
                {daily.map(({ date, count }) => (
                  <div key={date} className="group flex flex-1 flex-col items-center gap-1">
                    <div className="relative w-full">
                      <div
                        className="w-full rounded-t bg-primary transition-all"
                        style={{ height: `${(count / maxDaily) * 160}px`, minHeight: count > 0 ? "4px" : "0" }}
                      />
                      {count > 0 && (
                        <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-xs text-background group-hover:block">
                          {count}
                        </div>
                      )}
                    </div>
                    <span className="rotate-45 origin-left text-[9px] text-muted-foreground">{date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversations per bot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conversations per Bot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bots.length === 0 && (
                <p className="text-sm text-muted-foreground">No bots yet.</p>
              )}
              {bots.map((bot) => (
                <div key={bot.id}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="truncate font-medium text-foreground">{bot.name}</span>
                    <span className="ml-2 text-muted-foreground">{bot._count.conversations}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(bot._count.conversations / maxBotConvos) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
