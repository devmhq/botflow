"use client";

import { useState } from "react";
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
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      await redirectToUrl("/api/billing/portal");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" className="gap-2" onClick={handleClick} disabled={loading}>
        <ExternalLink className="h-3.5 w-3.5" />
        {loading ? "Redirecting…" : "Manage billing"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ManageBillingLink() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await redirectToUrl("/api/billing/portal");
    } catch {
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
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      await redirectToUrl("/api/billing/checkout", { plan });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button className="w-full" size="sm" onClick={handleClick} disabled={loading}>
        {loading ? "Redirecting…" : `Upgrade to ${plan}`}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
