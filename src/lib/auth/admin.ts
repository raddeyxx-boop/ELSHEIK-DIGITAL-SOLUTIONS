import "server-only";import { createClient } from "@/lib/supabase/server";
export async function getAdminSession(){const supabase=await createClient();if(!supabase)return {configured:false,user:null,role:null};const {data:{user}}=await supabase.auth.getUser();if(!user)return {configured:true,user:null,role:null};const {data}=await supabase.from("user_roles").select("role").eq("user_id",user.id).in("role",["admin","editor"]).maybeSingle();return {configured:true,user,role:data?.role??null};}

