import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Bot, MessageSquare, TrendingUp, Plus, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

async function getDashboardData(tenantId: string) {
  const [totalBots, activeBots, totalConversations, recentConversations] =
    await Promise.all([
      prisma.chatbot.count({ where: { tenantId } }),
      prisma.chatbot.count({ where: { tenantId, status: "ACTIVE" } }),
      prisma.conversation.count({ where: { tenantId } }),
      prisma.conversation.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { chatbot: { select: { name: true } } },
      }),
    ]);

  return { totalBots, activeBots, totalConversations, recentConversations };
}

export default async function DashboardHomePage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return null;

  const { totalBots, activeBots, totalConversations, recentConversations } =
    await getDashboardData(tenantId);

  const kpis = [
    { label: "Total Chatbots", value: totalBots, sub: `${activeBots} active`, icon: Bot, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Conversations", value: totalConversations, sub: "all time", icon: MessageSquare, color: "text-green-600", bg: "bg-green-50" },
    { label: "Active Bots", value: activeBots, sub: "live on your site", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <>
      <DashboardHeader title="Home" userName={session.user?.name ?? undefined} />
      <main className="p-6 space-y-6">
        {/* Welcome banner */}
        <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white">
          <p className="text-sm font-medium opacity-80">Welcome back,</p>
          <h2 className="mt-1 text-2xl font-bold">{session.user?.name ?? "Admin"}</h2>
          <p className="mt-1 text-sm opacity-75">
            {totalBots === 0
              ? "You haven't created a chatbot yet. Get started below."
              : `You have ${totalBots} chatbot${totalBots !== 1 ? "s" : ""} running.`}
          </p>
          {totalBots === 0 && (
            <Link
              href="/dashboard/bots/new"
              className={cn(buttonVariants(), "mt-4 bg-white text-indigo-600 hover:bg-indigo-50")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first bot
            </Link>
          )}
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-3 gap-4">
          {kpis.map(({ label, value, sub, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">{value}</p>
                    <p className="mt-1 text-xs text-neutral-400">{sub}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { href: "/dashboard/bots/new", label: "Create new chatbot", icon: Plus },
                { href: "/dashboard/bots", label: "Manage chatbots", icon: Bot },
                { href: "/dashboard/conversations", label: "View conversations", icon: MessageSquare },
                { href: "/dashboard/analytics", label: "View analytics", icon: TrendingUp },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-indigo-500" />
                    {label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent conversations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentConversations.length === 0 && (
                <p className="text-sm text-neutral-400">No conversations yet.</p>
              )}
              {recentConversations.map((convo) => (
                <div key={convo.id} className="flex items-center gap-3">
                  {convo.status === "RESOLVED" ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                      {convo.visitorName ?? convo.visitorId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-neutral-400">via {convo.chatbot.name}</p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(convo.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
