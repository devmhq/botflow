import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/header";
import { BotSettingsTabs } from "@/components/dashboard/bot-settings-tabs";

async function getBot(id: string, tenantId: string) {
  return prisma.chatbot.findFirst({
    where: { id, tenantId },
    include: { knowledgeItems: { orderBy: { createdAt: "desc" } } },
  });
}

export default async function BotDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return null;

  const bot = await getBot(params.id, tenantId);
  if (!bot) notFound();

  return (
    <>
      <DashboardHeader title={bot.name} userName={session.user?.name ?? undefined} />
      <main className="p-6">
        <BotSettingsTabs bot={bot} />
      </main>
    </>
  );
}
