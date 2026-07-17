import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { BotStatusToggle } from "@/components/dashboard/bot-status-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Settings, Code, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

async function getBots(tenantId: string) {
  return prisma.chatbot.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { conversations: true } } },
  });
}

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  INACTIVE: "bg-muted text-muted-foreground",
  DRAFT: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export default async function BotsPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return null;

  const bots = await getBots(tenantId);

  return (
    <>
      <DashboardHeader title="Chatbots" userName={session.user?.name ?? undefined} />
      <main className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {bots.length} bot{bots.length !== 1 ? "s" : ""}
          </p>
          <Link href="/dashboard/bots/new" className={buttonVariants()}>
            <Plus className="mr-2 h-4 w-4" />
            New Chatbot
          </Link>
        </div>

        {bots.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No chatbots yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first chatbot to start engaging visitors.
              </p>
              <Link href="/dashboard/bots/new" className={cn(buttonVariants(), "mt-4")}>
                Create chatbot
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bots.map((bot) => (
            <Card key={bot.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: bot.widgetColor }}
                    />
                    <div>
                      <p className="font-semibold text-foreground">{bot.name}</p>
                      <p className="text-xs text-muted-foreground">{bot.businessType ?? "General"}</p>
                    </div>
                  </div>
                  <BotStatusToggle botId={bot.id} status={bot.status} />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[bot.status]}`}>
                    {bot.status}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {bot._count.conversations} conversations
                  </span>
                </div>

                <div className="mt-auto flex gap-2 pt-4">
                  <Link
                    href={`/dashboard/bots/${bot.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
                  >
                    <Settings className="mr-1.5 h-3.5 w-3.5" />
                    Settings
                  </Link>
                  <Link
                    href={`/dashboard/bots/${bot.id}/embed`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
                  >
                    <Code className="mr-1.5 h-3.5 w-3.5" />
                    Embed
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
