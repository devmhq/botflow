import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/header";
import { AccountSettingsForm } from "@/components/dashboard/account-settings-form";

export default async function SettingsPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return null;

  const [user, tenant] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { users: { where: { role: { in: ["ADMIN", "MEMBER"] } }, select: { id: true, name: true, email: true, role: true } } },
    }),
  ]);

  return (
    <>
      <DashboardHeader title="Settings" userName={session.user?.name ?? undefined} />
      <main className="p-6">
        <AccountSettingsForm user={user} tenant={tenant} />
      </main>
    </>
  );
}
