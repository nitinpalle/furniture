"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    // Push to the requested redirect; refresh so the proxy re-runs and
    // server components see the new session cookies.
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-[var(--color-border)] bg-[var(--color-bg-elevated)] space-y-4 rounded-lg border p-6 shadow-sm"
    >
      <div>
        <label
          htmlFor="email"
          className="text-[var(--color-fg-subtle)] mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            "w-full rounded-md border bg-transparent px-3 py-2 text-sm",
            "border-[var(--color-border-strong)] focus:border-[var(--color-fg)] focus:outline-none",
          )}
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="text-[var(--color-fg-subtle)] mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={cn(
            "w-full rounded-md border bg-transparent px-3 py-2 text-sm",
            "border-[var(--color-border-strong)] focus:border-[var(--color-fg)] focus:outline-none",
          )}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-md border p-3 text-xs"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "w-full inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium",
          "bg-[var(--color-fg)] text-[var(--color-bg)] hover:bg-[var(--color-fg-muted)]",
          "transition-colors disabled:opacity-50 disabled:pointer-events-none",
        )}
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {submitting ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-[var(--color-fg-subtle)] text-center text-[11px]">
        Forgot your password? Reset it from your Supabase dashboard.
      </p>
    </form>
  );
}
