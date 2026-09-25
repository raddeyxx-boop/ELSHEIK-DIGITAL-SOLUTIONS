import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(request: Request) {
  const client = await createClient();
  if (client) await client.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
