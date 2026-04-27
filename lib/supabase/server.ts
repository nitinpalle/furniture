import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

/**
 * Server-side Supabase client (RSC, route handlers, server actions).
 *
 * Uses the request's cookie jar to maintain auth session continuity.
 * Reads the anon key — RLS gates access just like the browser client.
 *
 * For privileged operations (bypassing RLS), use createServiceClient() below.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components cannot set cookies — the middleware refreshes
            // sessions instead, so this is a safe no-op there.
          }
        },
      },
    },
  );
}

/**
 * Service-role Supabase client. Bypasses RLS entirely.
 *
 * NEVER expose to the client. Only call from:
 *   - API route handlers (e.g. /api/track-click)
 *   - Server actions
 *   - Background scripts (catalog importer)
 *
 * Required env: SUPABASE_SERVICE_ROLE_KEY
 */
export function createServiceClient() {
  if (typeof window !== "undefined") {
    throw new Error("createServiceClient() must not be called in the browser");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Required for privileged server operations.",
    );
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
