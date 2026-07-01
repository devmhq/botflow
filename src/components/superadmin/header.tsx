"use client";

import { signOut } from "next-auth/react";
import { LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SuperadminHeaderProps {
  title: string;
}

export function SuperadminHeader({ title }: SuperadminHeaderProps) {
  return (
    <header className="fixed left-60 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-100 outline-none">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-indigo-100 text-xs text-indigo-700">
                SA
              </AvatarFallback>
            </Avatar>
            <span>Superadmin</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
