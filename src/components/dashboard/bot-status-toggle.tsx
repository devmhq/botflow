"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

interface BotStatusToggleProps {
  botId: string;
  status: string;
}

export function BotStatusToggle({ botId, status }: BotStatusToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isActive = status === "ACTIVE";

  async function toggle() {
    setLoading(true);
    await fetch(`/api/bots/${botId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: isActive ? "INACTIVE" : "ACTIVE" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Switch
      checked={isActive}
      onCheckedChange={toggle}
      disabled={loading}
      aria-label="Toggle bot status"
    />
  );
}
