import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  product_id: z.uuid().nullable().optional(),
  source: z.enum(["pdp", "card", "floating", "hero", "footer"]),
  referrer: z.string().max(500).nullable().optional(),
});

/**
 * Logs an "Enquire on WhatsApp" click for analytics.
 * Fire-and-forget from the client — we never block their navigation.
 *
 * Uses the service-role client so RLS doesn't get in the way of an
 * unauthenticated insert. No personal data is stored — just IP / UA /
 * referrer for aggregate stats.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const { product_id, source, referrer } = parsed.data;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const userAgent = request.headers.get("user-agent") ?? null;

  const { error } = await supabase.from("enquiry_clicks").insert({
    product_id: product_id ?? null,
    source,
    ip_address: ip,
    user_agent: userAgent,
    referrer: referrer ?? null,
  });

  if (error) {
    console.error("track-click insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
