import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSecretSupabaseEnv } from "./env";

export function createAdminClient(){
  const env=getSecretSupabaseEnv();
  if(!env)return null;
  return createClient(env.url,env.secretKey,{auth:{autoRefreshToken:false,persistSession:false}});
}

