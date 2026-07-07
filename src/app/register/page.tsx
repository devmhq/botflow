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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Zap className="h-6 w-6 text-indigo-600" />
          <span className="text-lg font-bold text-neutral-900 dark:text-white">BotFlow</span>
        </Link>

        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Start your free trial</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            No credit card required. Set up your chatbot in minutes.
          </p>

          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
