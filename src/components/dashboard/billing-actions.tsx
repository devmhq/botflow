"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

async function redirectToUrl(endpoint: string, body?: Record<string, unknown>) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new Error(data?.error ?? "Something went wrong. Please try again.");
  }
  window.location.href = data.url;
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await redirectToUrl("/api/billing/portal");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleClick} disabled={loading}>
      <ExternalLink className="h-3.5 w-3.5" />
      {loading ? "Redirecting…" : "Manage billing"}
    </Button>
  );
}

export function ManageBillingLink() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await redirectToUrl("/api/billing/portal");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <button className="text-indigo-600 underline disabled:opacity-50" onClick={handleClick} disabled={loading}>
      {loading ? "Redirecting…" : "Stripe portal"}
    </button>
  );
}

export function UpgradeButton({ plan }: { plan: "GROWTH" | "PRO" }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await redirectToUrl("/api/billing/checkout", { plan });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <Button className="w-full" size="sm" onClick={handleClick} disabled={loading}>
      {loading ? "Redirecting…" : `Upgrade to ${plan}`}
    </Button>
  );
}
