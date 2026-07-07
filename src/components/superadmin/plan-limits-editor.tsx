"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const defaultLimits = {
  STARTER: { chats: 500, bots: 1, members: 1 },
  GROWTH: { chats: 2000, bots: 3, members: 5 },
  PRO: { chats: 10000, bots: 10, members: 20 },
};

type PlanKey = keyof typeof defaultLimits;

export function PlanLimitsEditor() {
  const [limits, setLimits] = useState(defaultLimits);
  const [saved, setSaved] = useState(false);

  function handleChange(plan: PlanKey, field: "chats" | "bots" | "members", value: string) {
    setLimits((prev) => ({
      ...prev,
      [plan]: { ...prev[plan], [field]: parseInt(value) || 0 },
    }));
    setSaved(false);
  }

  function handleSave() {
    // In production, this would POST to an API endpoint / update env config
    setSaved(true);
    toast.success("Plan limits saved");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Plan Limits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {(["STARTER", "GROWTH", "PRO"] as PlanKey[]).map((plan) => (
          <div key={plan}>
            <p className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">{plan}</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Monthly Chats</Label>
                <Input
                  type="number"
                  value={limits[plan].chats}
                  onChange={(e) => handleChange(plan, "chats", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max Chatbots</Label>
                <Input
                  type="number"
                  value={limits[plan].bots}
                  onChange={(e) => handleChange(plan, "bots", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Team Members</Label>
                <Input
                  type="number"
                  value={limits[plan].members}
                  onChange={(e) => handleChange(plan, "members", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        <Button onClick={handleSave}>
          {saved ? "Saved!" : "Save Limits"}
        </Button>
      </CardContent>
    </Card>
  );
}
