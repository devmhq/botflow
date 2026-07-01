"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  users: TeamMember[];
}

interface Props {
  user: User | null;
  tenant: Tenant | null;
}

export function AccountSettingsForm({ user, tenant }: Props) {
  const [name, setName] = useState(user?.name ?? "");
  const [businessName, setBusinessName] = useState(tenant?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function saveSection(section: string, payload: object, endpoint: string) {
    setSaving(section);
    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(null);
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Business Info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Business Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Your Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={tenant?.slug ?? ""} readOnly className="text-neutral-400" />
            <p className="text-xs text-neutral-400">Contact support to change your slug.</p>
          </div>
          <Button
            onClick={() => saveSection("business", { name, businessName }, "/api/settings/profile")}
            disabled={saving === "business"}
          >
            {saved === "business" ? "Saved!" : saving === "business" ? "Saving…" : "Save"}
          </Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
          </div>
          <Button
            onClick={() => saveSection("password", { currentPassword, newPassword }, "/api/settings/password")}
            disabled={saving === "password" || !currentPassword || newPassword.length < 8}
          >
            {saved === "password" ? "Saved!" : saving === "password" ? "Saving…" : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader><CardTitle className="text-base">Team Members</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(tenant?.users ?? []).map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-lg border border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-neutral-400">{member.email}</p>
              </div>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                {member.role}
              </span>
            </div>
          ))}
          {(tenant?.users ?? []).length === 0 && (
            <p className="text-sm text-neutral-400">No team members yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email notifications</p>
              <p className="text-xs text-neutral-400">Get notified about new conversations.</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Weekly digest</p>
              <p className="text-xs text-neutral-400">Weekly summary of your chatbot activity.</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
