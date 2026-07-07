export const dynamic = "force-dynamic";

import { SuperadminSidebar } from "@/components/superadmin/sidebar";

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <SuperadminSidebar />
      <div className="ml-60 pt-16">{children}</div>
    </div>
  );
}
