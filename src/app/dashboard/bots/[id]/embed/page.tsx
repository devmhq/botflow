import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/header";
import { EmbedCode } from "@/components/dashboard/embed-code";

export default async function EmbedPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return null;

  const bot = await prisma.chatbot.findFirst({ where: { id: params.id, tenantId } });
  if (!bot) notFound();

  return (
    <>
      <DashboardHeader title="Embed Code" userName={session.user?.name ?? undefined} />
      <main className="p-6">
        <EmbedCode botId={bot.id} botName={bot.name} />
      </main>
    </>
  );
}
