import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseEnv } from "./env";

export async function refreshSupabaseSession(request:NextRequest){
  const env=getPublicSupabaseEnv();
  let response=NextResponse.next({request});
  if(!env)return response;
  const client=createServerClient(env.url,env.anonKey,{cookies:{getAll:()=>request.cookies.getAll(),setAll(values){values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
  await client.auth.getClaims();
  return response;
}

