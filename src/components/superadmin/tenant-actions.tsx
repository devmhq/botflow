"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
    try {
      const res = await fetch(`/api/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("Failed to update plan");
      toast.success(`Plan changed to ${plan}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
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
    try {
      const res = await fetch(`/api/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed to update tenant status");
      toast.success(next === "ACTIVE" ? "Tenant reactivated" : "Tenant suspended");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={currentStatus === "ACTIVE" ? "outline" : "default"}
      onClick={toggle}
      disabled={loading}
      className={
        currentStatus === "ACTIVE"
          ? "text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-500/10"
          : ""
      }
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
    try {
      const res = await fetch(`/api/tenants/${tenantId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete tenant");
      toast.success("Tenant deleted");
      setOpen(false);
      router.push("/superadmin/tenants");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
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
