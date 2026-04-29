import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { brand } from "@/lib/brand";

export const metadata = { title: "Admin sign in" };

export default function LoginPage() {
  return (
    <div className="bg-[var(--color-bg)] flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-[var(--color-fg-subtle)] mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
            Admin
          </p>
          <h1 className="font-[var(--font-display)] text-3xl font-medium tracking-tight">
            {brand.name}
          </h1>
          <p className="text-[var(--color-fg-muted)] mt-2 text-sm">
            Sign in to manage the catalog.
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
