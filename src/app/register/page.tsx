import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Zap } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Start free trial — BotFlow",
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[500px] bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--gradient-from),transparent_82%),transparent_60%)]"
      />
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-white shadow-sm shadow-primary/30">
            <Zap className="h-4 w-4" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">BotFlow</span>
        </Link>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Start your free trial</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            No credit card required. Set up your chatbot in minutes.
          </p>

          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
