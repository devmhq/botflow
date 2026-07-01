import { SuperadminHeader } from "@/components/superadmin/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlanLimitsEditor } from "@/components/superadmin/plan-limits-editor";

export default function SettingsPage() {
  return (
    <>
      <SuperadminHeader title="Settings" />
      <main className="p-6 space-y-6 max-w-3xl">
        {/* API Key management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Anthropic API Key</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  defaultValue={process.env.ANTHROPIC_API_KEY ? "sk-ant-••••••••" : ""}
                  placeholder="sk-ant-…"
                  readOnly
                  className="font-mono"
                />
                <Button variant="outline">Update</Button>
              </div>
              <p className="text-xs text-neutral-400">
                Used for all AI responses. Set via ANTHROPIC_API_KEY environment variable.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Stripe Secret Key</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  defaultValue={process.env.STRIPE_SECRET_KEY ? "sk_••••••••" : ""}
                  placeholder="sk_live_…"
                  readOnly
                  className="font-mono"
                />
                <Button variant="outline">Update</Button>
              </div>
              <p className="text-xs text-neutral-400">
                Used for billing. Set via STRIPE_SECRET_KEY environment variable.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email template editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Welcome Email Subject</Label>
              <Input defaultValue="Welcome to BotFlow! 🤖" />
            </div>
            <div className="space-y-2">
              <Label>Welcome Email Body</Label>
              <textarea
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={5}
                defaultValue={`Hi {{name}},

Welcome to BotFlow! Your account is ready. Log in to create your first chatbot.

Team BotFlow`}
              />
              <p className="text-xs text-neutral-400">
                Use {"{{name}}"}, {"{{email}}"}, {"{{company}}"} as placeholders.
              </p>
            </div>
            <Button>Save Template</Button>
          </CardContent>
        </Card>

        {/* Plan limits editor */}
        <PlanLimitsEditor />
      </main>
    </>
  );
}
