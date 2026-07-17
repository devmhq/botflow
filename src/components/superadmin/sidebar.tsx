"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/superadmin", label: "Overview", icon: LayoutDashboard },
  { href: "/superadmin/tenants", label: "Tenants", icon: Building2 },
  { href: "/superadmin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/superadmin/settings", label: "Settings", icon: Settings },
];

export function SuperadminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fuchsia-600 text-white">
          <Zap className="h-4 w-4" />
        </span>
        <span className="text-lg font-bold tracking-tight text-sidebar-foreground">BotFlow</span>
        <span className="ml-auto rounded bg-fuchsia-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/superadmin"
              ? pathname === "/superadmin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/40">Superadmin Panel</p>
      </div>
    </aside>
  );
}
