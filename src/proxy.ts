import type { NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request:NextRequest){return refreshSupabaseSession(request);}
// Only routes that read the signed-in session need it refreshed: the admin, and
// insight articles (editors may preview records that are not public yet). Public
// pages read the CMS without cookies, so their requests and prefetches skip this.
export const config={matcher:["/admin/:path*","/:locale(en|ar)/insights/:slug"]};
