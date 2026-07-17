import { prisma } from "@/lib/prisma";
import { SuperadminHeader } from "@/components/superadmin/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  MessageSquare,
  Bot,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

async function getOverviewData() {
  const [
    totalTenants,
    activeTenants,
    totalChatbots,
    totalConversations,
    recentTenants,
    recentConversations,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: "ACTIVE" } }),
    prisma.chatbot.count(),
    prisma.conversation.count(),
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { chatbots: true } } },
    }),
    prisma.conversation.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { chatbot: { select: { name: true } }, tenant: { select: { name: true } } },
    }),
  ]);

  return {
    totalTenants,
    activeTenants,
    totalChatbots,
    totalConversations,
    recentTenants,
    recentConversations,
  };
}

const planColors: Record<string, string> = {
  STARTER: "bg-muted text-muted-foreground",
  GROWTH: "bg-primary/10 text-primary",
  PRO: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  SUSPENDED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export default async function SuperadminOverviewPage() {
  const {
    totalTenants,
    activeTenants,
    totalChatbots,
    totalConversations,
    recentTenants,
    recentConversations,
  } = await getOverviewData();

  const kpis = [
    {
      title: "Total Tenants",
      value: totalTenants,
      icon: Building2,
      sub: `${activeTenants} active`,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Chatbots",
      value: totalChatbots,
      icon: Bot,
      sub: "across all tenants",
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      title: "Total Conversations",
      value: totalConversations,
      icon: MessageSquare,
      sub: "all time",
      color: "text-fuchsia-600 dark:text-fuchsia-400",
      bg: "bg-fuchsia-500/10",
    },
    {
      title: "Platform Health",
      value: activeTenants === totalTenants ? "Healthy" : `${activeTenants}/${totalTenants}`,
      icon: TrendingUp,
      sub: "active tenants",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <>
      <SuperadminHeader title="Overview" />
      <main className="p-6 space-y-6">
        {/* KPI tiles */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">
                      {kpi.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">{kpi.sub}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${kpi.bg}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Recent signups */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recent Signups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTenants.length === 0 && (
                <p className="text-sm text-muted-foreground">No tenants yet.</p>
              )}
              {recentTenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-500/10 text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400">
                      {tenant.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tenant._count.chatbots} bot{tenant._count.chatbots !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${planColors[tenant.plan]}`}>
                      {tenant.plan}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[tenant.status]}`}>
                      {tenant.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Platform health / recent activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentConversations.length === 0 && (
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
              )}
              {recentConversations.map((convo) => (
                <div key={convo.id} className="flex items-center gap-3">
                  {convo.status === "RESOLVED" ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                  ) : (
                    <Clock className="h-4 w-4 flex-shrink-0 text-amber-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {convo.tenant.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      via {convo.chatbot.name}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
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
