"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
    try {
      const nextStatus = isActive ? "INACTIVE" : "ACTIVE";
      const res = await fetch(`/api/bots/${botId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update chatbot status");
      toast.success(nextStatus === "ACTIVE" ? "Chatbot activated" : "Chatbot deactivated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
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
