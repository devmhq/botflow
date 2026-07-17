export const dynamic = "force-dynamic";

import { SuperadminSidebar } from "@/components/superadmin/sidebar";

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <SuperadminSidebar />
      <div className="ml-60 pt-16">{children}</div>
    </div>
  );
}
