import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SuperadminHeader } from "@/components/superadmin/header";
import {
  TenantPlanSelect,
  TenantStatusToggle,
  DeleteTenantButton,
} from "@/components/superadmin/tenant-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bot, MessageSquare, Users, Calendar } from "lucide-react";

async function getTenant(id: string) {
  return prisma.tenant.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
      chatbots: {
        select: { id: true, name: true, status: true, businessType: true, createdAt: true },
      },
      _count: { select: { conversations: true, chatbots: true, users: true } },
    },
  });
}

const planStyles: Record<string, string> = {
  STARTER: "bg-neutral-100 text-neutral-700",
  GROWTH: "bg-blue-100 text-blue-700",
  PRO: "bg-purple-100 text-purple-700",
};

const chatbotStatusStyles: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-neutral-100 text-neutral-500",
  DRAFT: "bg-yellow-100 text-yellow-700",
};

export default async function TenantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const tenant = await getTenant(params.id);
  if (!tenant) notFound();

  return (
    <>
      <SuperadminHeader title={tenant.name} />
      <main className="p-6 space-y-6">
        {/* Info card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tenant Info</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide">Company</p>
              <p className="mt-1 font-medium">{tenant.name}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide">Slug</p>
              <p className="mt-1 font-medium">{tenant.slug}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide">Plan</p>
              <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${planStyles[tenant.plan]}`}>
                {tenant.plan}
              </span>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide">Joined</p>
              <p className="mt-1 font-medium">{new Date(tenant.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Usage stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Bot, label: "Chatbots", value: tenant._count.chatbots },
            { icon: MessageSquare, label: "Conversations", value: tenant._count.conversations },
            { icon: Users, label: "Team Members", value: tenant._count.users },
            { icon: Calendar, label: "Monthly Chats Used", value: tenant.monthlyChatsUsed },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-4 p-5">
                <Icon className="h-8 w-8 text-neutral-300" />
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-neutral-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chatbot list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chatbots</CardTitle>
          </CardHeader>
          <CardContent>
            {tenant.chatbots.length === 0 ? (
              <p className="text-sm text-neutral-400">No chatbots yet.</p>
            ) : (
              <div className="space-y-2">
                {tenant.chatbots.map((bot) => (
                  <div key={bot.id} className="flex items-center justify-between rounded-lg border border-neutral-100 px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{bot.name}</p>
                      <p className="text-xs text-neutral-400">{bot.businessType ?? "General"}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${chatbotStatusStyles[bot.status]}`}>
                      {bot.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            {tenant.users.length === 0 ? (
              <p className="text-sm text-neutral-400">No users.</p>
            ) : (
              <div className="space-y-2">
                {tenant.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border border-neutral-100 px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-neutral-400">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Plan</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <TenantPlanSelect tenantId={tenant.id} currentPlan={tenant.plan} />
            <p className="text-sm text-neutral-500">Current: {tenant.plan}</p>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Suspend / Reactivate</p>
                <p className="text-xs text-neutral-400">
                  Suspended tenants cannot access the dashboard or use the widget.
                </p>
              </div>
              <TenantStatusToggle tenantId={tenant.id} currentStatus={tenant.status} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Delete Tenant</p>
                <p className="text-xs text-neutral-400">
                  Permanently remove this tenant and all their data.
                </p>
              </div>
              <DeleteTenantButton tenantId={tenant.id} />
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
