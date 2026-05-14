import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side guard for admin pages.
 * Redirects to /admin/login if no session — call at the top of every
 * admin route's server component (defence in depth alongside proxy.ts).
 *
 * Returns the authenticated user so the page can attribute writes
 * (e.g. set updated_by = user.id).
 */
export async function requireAdmin(redirectTo = "/admin/login") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(redirectTo);
  }
  return user;
}
