import { afterEach,describe,expect,it } from "vitest";import { getPublicSupabaseEnv,getSecretSupabaseEnv } from "@/lib/supabase/env";
const original={...process.env};afterEach(()=>{process.env={...original}});
describe("Supabase environment compatibility",()=>{it("supports publishable and secret keys",()=>{process.env.NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co";process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_test";process.env.SUPABASE_SECRET_KEY="sb_secret_test";expect(getPublicSupabaseEnv()?.anonKey).toBe("sb_publishable_test");expect(getSecretSupabaseEnv()?.secretKey).toBe("sb_secret_test")});it("returns null when configuration is incomplete",()=>{delete process.env.NEXT_PUBLIC_SUPABASE_URL;expect(getPublicSupabaseEnv()).toBeNull()})});

