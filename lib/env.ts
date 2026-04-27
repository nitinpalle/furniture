import { z } from "zod";

/**
 * Server-only env (never exposed to the client).
 * Validated at module-load time — server crashes immediately
 * if any required var is missing.
 */
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

/**
 * Client-side env (must be NEXT_PUBLIC_*). Safe to import in components.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z
    .string()
    .regex(/^\d{10,15}$/, "WhatsApp number must be 10-15 digits, no '+' or spaces")
    .optional(),
});

/**
 * Hand-pick the public vars (Next.js inlines NEXT_PUBLIC_* at build time
 * via static replacement — process.env.X works at runtime too).
 */
const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
};

const parsedClient = clientSchema.safeParse(clientEnv);
if (!parsedClient.success) {
  console.error("❌ Invalid client env:", z.treeifyError(parsedClient.error));
  throw new Error("Invalid client environment variables");
}

export const env = parsedClient.data;

/**
 * Server-only env. Call this from server components, server actions,
 * or API routes. NEVER import the result on the client.
 */
export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() must not be called on the client");
  }
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid server env:", z.treeifyError(parsed.error));
    throw new Error("Invalid server environment variables");
  }
  return parsed.data;
}
