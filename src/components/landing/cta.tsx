"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = email ? `?email=${encodeURIComponent(email)}` : "";
    router.push(`/register${params}`);
  }

  return (
    <section className="bg-gradient-to-r from-indigo-600 to-indigo-500 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to stop losing customers to voicemail?
        </h2>
        <p className="mt-4 text-lg text-indigo-100">
          Start your free trial today — no credit card required.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            required
            placeholder="you@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 border-transparent bg-white text-neutral-900 placeholder:text-neutral-400"
          />
          <Button type="submit" size="lg" className="h-11 gap-2 bg-neutral-900 px-5 text-white hover:bg-neutral-800">
            Start free trial
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </section>
  );
}
