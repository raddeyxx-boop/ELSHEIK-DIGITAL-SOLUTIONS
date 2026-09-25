import "server-only";
import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "./env";

// Published content is identical for every visitor, so public reads use the
// publishable key without the visitor's cookies. Reading cookies would make every
// public route render per request (a CMS round trip on each navigation) and would
// stop Next.js from prerendering and fully prefetching them. RLS is unchanged:
// this is the same anonymous role a signed-out visitor already reads as.
export function createPublicClient(options: Pick<SupabaseClientOptions<"public">, "db" | "global"> = {}) {
  const env = getPublicSupabaseEnv();
  if (!env) return null;
  return createClient(env.url, env.anonKey, { ...options, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
