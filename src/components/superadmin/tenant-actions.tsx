"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export function TenantPlanSelect({ tenantId, currentPlan }: { tenantId: string; currentPlan: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(plan: string | null) {
    if (!plan) return;
    setLoading(true);
    await fetch(`/api/tenants/${tenantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Select defaultValue={currentPlan} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="STARTER">Starter</SelectItem>
        <SelectItem value="GROWTH">Growth</SelectItem>
        <SelectItem value="PRO">Pro</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function TenantStatusToggle({ tenantId, currentStatus }: { tenantId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await fetch(`/api/tenants/${tenantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant={currentStatus === "ACTIVE" ? "outline" : "default"}
      onClick={toggle}
      disabled={loading}
      className={currentStatus === "ACTIVE" ? "text-yellow-600 border-yellow-300 hover:bg-yellow-50" : ""}
    >
      {loading ? "Updating…" : currentStatus === "ACTIVE" ? "Suspend" : "Reactivate"}
    </Button>
  );
}

export function DeleteTenantButton({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/tenants/${tenantId}`, { method: "DELETE" });
    setLoading(false);
    setOpen(false);
    router.push("/superadmin/tenants");
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Tenant
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tenant</DialogTitle>
            <DialogDescription>
              This will permanently delete the tenant and all associated data (chatbots, conversations, knowledge items). This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
