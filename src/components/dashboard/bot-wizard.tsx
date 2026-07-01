"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Basic Info", "Knowledge Base", "Appearance"];

const POSITIONS = [
  { value: "bottom-right", label: "Bottom Right" },
  { value: "bottom-left", label: "Bottom Left" },
];

const BUSINESS_TYPES = [
  "Salon", "Restaurant", "Dental", "Auto Dealership", "E-commerce",
  "Real Estate", "Healthcare", "Education", "Legal", "Other",
];

const COLORS = [
  "#4F46E5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#1f2937",
];

interface FormData {
  name: string;
  businessType: string;
  personality: string;
  faqContent: string;
  widgetColor: string;
  widgetPosition: string;
  welcomeMessage: string;
}

export function BotWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    name: "",
    businessType: "",
    personality: "You are a helpful, friendly assistant.",
    faqContent: "",
    widgetColor: "#4F46E5",
    widgetPosition: "bottom-right",
    welcomeMessage: "Hi! How can I help you today?",
  });

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          businessType: form.businessType || null,
          personality: form.personality,
          widgetColor: form.widgetColor,
          widgetPosition: form.widgetPosition,
          welcomeMessage: form.welcomeMessage,
        }),
      });

      if (!res.ok) throw new Error("Failed to create bot");
      const bot = await res.json();

      // If FAQ content entered, ingest it
      if (form.faqContent.trim()) {
        await fetch("/api/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ botId: bot.id, content: form.faqContent, sourceType: "text" }),
        });
      }

      router.push(`/dashboard/bots/${bot.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const canNext =
    step === 0 ? form.name.trim().length > 0 :
    step === 1 ? true :
    true;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicators */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
              i < step ? "bg-indigo-600 text-white" :
              i === step ? "border-2 border-indigo-600 text-indigo-600" :
              "border-2 border-neutral-200 text-neutral-400"
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn(
              "text-sm font-medium",
              i === step ? "text-neutral-900 dark:text-white" : "text-neutral-400"
            )}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "mx-2 h-px w-12 flex-shrink-0",
                i < step ? "bg-indigo-600" : "bg-neutral-200"
              )} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Step 1: Basic Info */}
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Bot Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Bella — Salon Assistant"
                />
              </div>

              <div className="space-y-2">
                <Label>Business Type</Label>
                <Select
                  value={form.businessType}
                  onValueChange={(v) => { if (v) update("businessType", v); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry…" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="personality">Personality / System Prompt</Label>
                <Textarea
                  id="personality"
                  value={form.personality}
                  onChange={(e) => update("personality", e.target.value)}
                  rows={4}
                  placeholder="Describe how the bot should behave…"
                />
                <p className="text-xs text-neutral-400">
                  This becomes the system prompt for every conversation.
                </p>
              </div>
            </>
          )}

          {/* Step 2: Knowledge Base */}
          {step === 1 && (
            <>
              <p className="text-sm text-neutral-500">
                Paste your FAQs, product info, or any text your bot should know. You can also add more later.
              </p>
              <div className="space-y-2">
                <Label htmlFor="faq">FAQ / Knowledge Content</Label>
                <Textarea
                  id="faq"
                  value={form.faqContent}
                  onChange={(e) => update("faqContent", e.target.value)}
                  rows={10}
                  placeholder="Q: What are your opening hours?&#10;A: We're open Mon–Fri 9am–6pm.&#10;&#10;Q: Do you offer free consultations?&#10;A: Yes, book one at our website."
                />
                <p className="text-xs text-neutral-400">
                  Optional — you can skip and add knowledge later from bot settings.
                </p>
              </div>
            </>
          )}

          {/* Step 3: Appearance */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Widget Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => update("widgetColor", color)}
                      className={cn(
                        "h-8 w-8 rounded-full ring-offset-2 transition-all",
                        form.widgetColor === color ? "ring-2 ring-neutral-900 dark:ring-white" : ""
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={color}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Widget Position</Label>
                <Select
                  value={form.widgetPosition}
                  onValueChange={(v) => { if (v) update("widgetPosition", v); }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome">Welcome Message</Label>
                <Input
                  id="welcome"
                  value={form.welcomeMessage}
                  onChange={(e) => update("welcomeMessage", e.target.value)}
                  placeholder="Hi! How can I help you today?"
                />
              </div>

              {/* Live preview */}
              <div className="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">Preview</p>
                <div className="flex items-end gap-2">
                  <div
                    className="rounded-full p-3 shadow-lg"
                    style={{ backgroundColor: form.widgetColor }}
                  >
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="max-w-xs rounded-2xl rounded-bl-none bg-neutral-100 px-4 py-2 text-sm dark:bg-neutral-800">
                    {form.welcomeMessage}
                  </div>
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
            Next
            <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating…" : "Create Chatbot"}
          </Button>
        )}
      </div>
    </div>
  );
}
