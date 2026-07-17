import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — BotFlow",
  description: "How BotFlow collects, uses, and protects your data.",
};

const SECTIONS = [
  {
    title: "1. Information we collect",
    body: "We collect information you provide directly, such as your name, email, and business details when you create an account, along with conversation data processed by chatbots you configure. We also collect usage data (pages visited, features used) to improve the product.",
  },
  {
    title: "2. How we use your information",
    body: "We use collected information to provide and improve the BotFlow service, respond to support requests, send account-related communications, and secure our platform against abuse.",
  },
  {
    title: "3. Visitor conversation data",
    body: "Conversations handled by your chatbot (including any lead information visitors provide) are stored on your behalf so you can review them in your dashboard. You are responsible for how you use this data and for complying with applicable privacy laws toward your own customers.",
  },
  {
    title: "4. Data sharing",
    body: "We do not sell your data. We share data only with service providers who help us operate BotFlow (such as hosting and payment processing) under confidentiality obligations, or when required by law.",
  },
  {
    title: "5. Data retention & deletion",
    body: "We retain account and conversation data for as long as your account is active. You can request deletion of your account and associated data at any time by contacting support.",
  },
  {
    title: "6. Security",
    body: "We use industry-standard measures to protect your data, including encryption in transit and access controls. No system is perfectly secure, and we encourage strong, unique passwords for your account.",
  },
  {
    title: "7. Changes to this policy",
    body: "We may update this policy from time to time. Material changes will be communicated via email or an in-app notice before they take effect.",
  },
  {
    title: "8. Contact us",
    body: "Questions about this policy can be sent to hello@botflow.app.",
  },
];

export default function PrivacyPage() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
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
