"use client";
import { createBrowserClient } from "@supabase/ssr";import { getPublicSupabaseEnv } from "./env";
export function createClient(){const env=getPublicSupabaseEnv();if(!env)throw new Error("Supabase is not configured.");return createBrowserClient(env.url,env.anonKey);}

