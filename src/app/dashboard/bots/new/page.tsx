import { DashboardHeader } from "@/components/dashboard/header";
import { auth } from "@/auth";
import { BotWizard } from "@/components/dashboard/bot-wizard";

export default async function NewBotPage() {
  const session = await auth();
  return (
    <>
      <DashboardHeader title="Create Chatbot" userName={session?.user?.name ?? undefined} />
      <main className="p-6">
        <BotWizard />
      </main>
    </>
  );
}
