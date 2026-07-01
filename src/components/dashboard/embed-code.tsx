"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Copy } from "lucide-react";

interface EmbedCodeProps {
  botId: string;
  botName: string;
}

export function EmbedCode({ botId, botName }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);

  const scriptTag = `<script
  src="${process.env.NEXT_PUBLIC_APP_URL ?? "https://yourdomain.com"}/widget/botflow-widget.js"
  data-bot-id="${botId}"
  async
></script>`;

  async function copy() {
    await navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Embed {botName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-500">
            Copy the script below and paste it before the closing{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">&lt;/body&gt;</code>{" "}
            tag of your website.
          </p>

          <div className="relative rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <pre className="overflow-x-auto text-xs text-neutral-700 dark:text-neutral-300">
              {scriptTag}
            </pre>
            <Button
              size="icon-sm"
              variant="outline"
              className="absolute right-2 top-2"
              onClick={copy}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>

          <Button onClick={copy} className="w-full gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Script Tag"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Install Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
          <ol className="list-decimal space-y-3 pl-5">
            <li>Copy the script tag above.</li>
            <li>
              Open your website&apos;s HTML source or CMS template editor.
            </li>
            <li>
              Paste the script just before the closing{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">&lt;/body&gt;</code>{" "}
              tag on every page you want the chat widget to appear.
            </li>
            <li>Save and publish your changes.</li>
            <li>
              Visit your website — the chat bubble will appear in the corner within a few seconds.
            </li>
          </ol>

          <Separator />

          <div>
            <p className="font-medium text-neutral-700 dark:text-neutral-200">WordPress</p>
            <p className="mt-1">
              Use a plugin like <em>Insert Headers and Footers</em> and paste the script in the footer section.
            </p>
          </div>

          <div>
            <p className="font-medium text-neutral-700 dark:text-neutral-200">Shopify</p>
            <p className="mt-1">
              Go to <em>Online Store → Themes → Edit Code</em> and paste the script in{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">theme.liquid</code>{" "}
              before <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">&lt;/body&gt;</code>.
            </p>
          </div>

          <div>
            <p className="font-medium text-neutral-700 dark:text-neutral-200">Webflow</p>
            <p className="mt-1">
              Go to <em>Project Settings → Custom Code → Footer Code</em> and paste the script there.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
