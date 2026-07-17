import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — BotFlow",
  description: "The terms that govern your use of BotFlow.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: "By creating an account or using BotFlow, you agree to these Terms of Service. If you do not agree, please do not use the service.",
  },
  {
    title: "2. The service",
    body: "BotFlow provides an AI-powered chatbot platform that businesses can configure, embed on their own websites, and use to communicate with their visitors. Features and limits vary by subscription plan.",
  },
  {
    title: "3. Accounts",
    body: "You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use.",
  },
  {
    title: "4. Acceptable use",
    body: "You may not use BotFlow to send unlawful, deceptive, or harmful content, to impersonate others, or to violate the rights of any third party. We reserve the right to suspend accounts that violate these terms.",
  },
  {
    title: "5. Subscription & billing",
    body: "Paid plans are billed on a recurring basis through our payment processor. You can upgrade, downgrade, or cancel your subscription at any time; changes take effect as described at checkout or in your billing settings.",
  },
  {
    title: "6. Your content",
    body: "You retain ownership of the knowledge base content, branding, and conversation data you upload or generate through BotFlow. You grant us a limited license to process that content solely to provide the service to you.",
  },
  {
    title: "7. Availability & changes",
    body: "We aim for high availability but do not guarantee the service will be uninterrupted or error-free. We may modify or discontinue features with reasonable notice.",
  },
  {
    title: "8. Limitation of liability",
    body: "To the maximum extent permitted by law, BotFlow is not liable for indirect, incidental, or consequential damages arising from your use of the service.",
  },
  {
    title: "9. Termination",
    body: "You may cancel your account at any time. We may suspend or terminate accounts that violate these terms or pose a risk to the platform or other users.",
  },
  {
    title: "10. Contact us",
    body: "Questions about these terms can be sent to hello@botflow.app.",
  },
];

export default function TermsPage() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: January 2026</p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map(({ title, body }) => (
            <div key={title}>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
