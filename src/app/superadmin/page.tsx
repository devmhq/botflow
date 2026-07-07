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
  STARTER: "bg-neutral-100 text-neutral-700",
  GROWTH: "bg-blue-100 text-blue-700",
  PRO: "bg-purple-100 text-purple-700",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
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
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Chatbots",
      value: totalChatbots,
      icon: Bot,
      sub: "across all tenants",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Conversations",
      value: totalConversations,
      icon: MessageSquare,
      sub: "all time",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Platform Health",
      value: activeTenants === totalTenants ? "Healthy" : `${activeTenants}/${totalTenants}`,
      icon: TrendingUp,
      sub: "active tenants",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
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
                    <p className="text-sm text-neutral-500">{kpi.title}</p>
                    <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">
                      {kpi.value}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">{kpi.sub}</p>
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
                <p className="text-sm text-neutral-400">No tenants yet.</p>
              )}
              {recentTenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                      {tenant.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{tenant.name}</p>
                      <p className="text-xs text-neutral-400">
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
                <p className="text-sm text-neutral-400">No conversations yet.</p>
              )}
              {recentConversations.map((convo) => (
                <div key={convo.id} className="flex items-center gap-3">
                  {convo.status === "RESOLVED" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                      {convo.tenant.name}
                    </p>
                    <p className="truncate text-xs text-neutral-400">
                      via {convo.chatbot.name}
                    </p>
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
