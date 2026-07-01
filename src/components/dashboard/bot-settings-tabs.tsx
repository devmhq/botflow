"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#4F46E5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#1f2937",
];

interface KnowledgeItem {
  id: string;
  content: string;
  sourceType: string;
  createdAt: Date;
}

interface Bot {
  id: string;
  name: string;
  businessType: string | null;
  personality: string | null;
  widgetColor: string;
  widgetPosition: string;
  welcomeMessage: string;
  allowedDomains: string[];
  status: string;
  knowledgeItems: KnowledgeItem[];
}

export function BotSettingsTabs({ bot }: { bot: Bot }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  // General
  const [name, setName] = useState(bot.name);
  const [businessType, setBusinessType] = useState(bot.businessType ?? "");
  const [personality, setPersonality] = useState(bot.personality ?? "");

  // Appearance
  const [widgetColor, setWidgetColor] = useState(bot.widgetColor);
  const [widgetPosition, setWidgetPosition] = useState(bot.widgetPosition);
  const [welcomeMessage, setWelcomeMessage] = useState(bot.welcomeMessage);

  // Domains
  const [domains, setDomains] = useState<string[]>(bot.allowedDomains);
  const [newDomain, setNewDomain] = useState("");

  // Knowledge
  const [newKnowledge, setNewKnowledge] = useState("");
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(bot.knowledgeItems);
  const [kLoading, setKLoading] = useState(false);

  async function save(payload: object, section: string) {
    setSaving(true);
    await fetch(`/api/bots/${bot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
    router.refresh();
  }

  async function addKnowledge() {
    if (!newKnowledge.trim()) return;
    setKLoading(true);
    const res = await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botId: bot.id, content: newKnowledge, sourceType: "text" }),
    });
    if (res.ok) {
      const item = await res.json();
      setKnowledgeItems((prev) => [item, ...prev]);
      setNewKnowledge("");
    }
    setKLoading(false);
  }

  async function deleteKnowledge(id: string) {
    await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    setKnowledgeItems((prev) => prev.filter((k) => k.id !== id));
  }

  function addDomain() {
    const d = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "");
    if (d && !domains.includes(d)) {
      setDomains((prev) => [...prev, d]);
      setNewDomain("");
    }
  }

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="domains">Domains</TabsTrigger>
      </TabsList>

      {/* General */}
      <TabsContent value="general">
        <Card>
          <CardHeader><CardTitle className="text-base">General Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bot Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Input value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="e.g. Salon, Restaurant…" />
            </div>
            <div className="space-y-2">
              <Label>Personality / System Prompt</Label>
              <Textarea value={personality} onChange={(e) => setPersonality(e.target.value)} rows={5} />
            </div>
            <Button
              onClick={() => save({ name, businessType, personality }, "general")}
              disabled={saving}
            >
              {saved === "general" ? "Saved!" : saving ? "Saving…" : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Knowledge Base */}
      <TabsContent value="knowledge">
        <Card>
          <CardHeader><CardTitle className="text-base">Knowledge Base</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Add New Knowledge</Label>
              <Textarea
                value={newKnowledge}
                onChange={(e) => setNewKnowledge(e.target.value)}
                rows={4}
                placeholder="Paste FAQ text, product info, or any content…"
              />
              <Button onClick={addKnowledge} disabled={kLoading || !newKnowledge.trim()} size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {kLoading ? "Adding…" : "Add Knowledge"}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">{knowledgeItems.length} item{knowledgeItems.length !== 1 ? "s" : ""}</p>
              {knowledgeItems.length === 0 && (
                <p className="text-sm text-neutral-400">No knowledge items yet.</p>
              )}
              {knowledgeItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border border-neutral-100 p-3 dark:border-neutral-800">
                  <p className="flex-1 text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">
                    {item.content}
                  </p>
                  <button
                    onClick={() => deleteKnowledge(item.id)}
                    className="flex-shrink-0 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Appearance */}
      <TabsContent value="appearance">
        <Card>
          <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Widget Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setWidgetColor(color)}
                    className={cn(
                      "h-8 w-8 rounded-full ring-offset-2 transition-all",
                      widgetColor === color ? "ring-2 ring-neutral-900 dark:ring-white" : ""
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Widget Position</Label>
              <Select value={widgetPosition} onValueChange={(v) => { if (v) setWidgetPosition(v); }}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Welcome Message</Label>
              <Input value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} />
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">Preview</p>
              <div className="flex items-end gap-2">
                <div className="rounded-full p-3 shadow-lg" style={{ backgroundColor: widgetColor }}>
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="max-w-xs rounded-2xl rounded-bl-none bg-neutral-100 px-4 py-2 text-sm dark:bg-neutral-800">
                  {welcomeMessage}
                </div>
              </div>
            </div>

            <Button
              onClick={() => save({ widgetColor, widgetPosition, welcomeMessage }, "appearance")}
              disabled={saving}
            >
              {saved === "appearance" ? "Saved!" : saving ? "Saving…" : "Save Appearance"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Domains */}
      <TabsContent value="domains">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Allowed Domains</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-500">
              Restrict your widget to specific domains. Leave empty to allow all.
            </p>

            <div className="flex gap-2">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                onKeyDown={(e) => e.key === "Enter" && addDomain()}
              />
              <Button onClick={addDomain} variant="outline">Add</Button>
            </div>

            {domains.length === 0 ? (
              <p className="text-sm text-neutral-400">No domain restrictions.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {domains.map((d) => (
                  <span key={d} className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm dark:border-neutral-800 dark:bg-neutral-900">
                    {d}
                    <button onClick={() => setDomains((prev) => prev.filter((x) => x !== d))}>
                      <X className="h-3 w-3 text-neutral-400 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <Button
              onClick={() => save({ allowedDomains: domains }, "domains")}
              disabled={saving}
            >
              {saved === "domains" ? "Saved!" : saving ? "Saving…" : "Save Domains"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
