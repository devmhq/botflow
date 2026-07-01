import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/header";
import { ConversationsTable } from "@/components/dashboard/conversations-table";

async function getConversations(tenantId: string, status?: string) {
  return prisma.conversation.findMany({
    where: {
      tenantId,
      ...(status && status !== "ALL" ? { status: status as "OPEN" | "RESOLVED" } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      chatbot: { select: { name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return null;

  const conversations = await getConversations(tenantId, searchParams.status);

  return (
    <>
      <DashboardHeader title="Conversations" userName={session.user?.name ?? undefined} />
      <main className="p-6">
        <ConversationsTable conversations={conversations} />
      </main>
    </>
  );
}
