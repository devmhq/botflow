import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SuperadminHeader } from "@/components/superadmin/header";
import { CreateTenantDialog } from "@/components/superadmin/create-tenant-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

async function getTenants() {
  return prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { chatbots: true, conversations: true, users: true } },
    },
  });
}

const planStyles: Record<string, string> = {
  STARTER: "bg-muted text-muted-foreground",
  GROWTH: "bg-primary/10 text-primary",
  PRO: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
};

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  SUSPENDED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export default async function TenantsPage() {
  const tenants = await getTenants();

  return (
    <>
      <SuperadminHeader title="Tenants" />
      <main className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {tenants.length} tenant{tenants.length !== 1 ? "s" : ""} registered
          </p>
          <CreateTenantDialog />
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Bots</TableHead>
                <TableHead className="text-center">Users</TableHead>
                <TableHead className="text-center">Conversations</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    No tenants yet. Create your first one.
                  </TableCell>
                </TableRow>
              )}
              {tenants.map((tenant) => (
                <TableRow key={tenant.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-500/10 text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400">
                        {tenant.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tenant.name}</p>
                        <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${planStyles[tenant.plan]}`}>
                      {tenant.plan}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[tenant.status]}`}>
                      {tenant.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm">{tenant._count.chatbots}</TableCell>
                  <TableCell className="text-center text-sm">{tenant._count.users}</TableCell>
                  <TableCell className="text-center text-sm">{tenant._count.conversations}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/superadmin/tenants/${tenant.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  );
}
