import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secretKey=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!anonKey||!secretKey)throw new Error("Live Supabase environment is incomplete");
const client=(key)=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const service=client(secretKey);const anon=client(anonKey);const results=[];
const verify=(name,condition,detail="")=>{results.push({name,pass:Boolean(condition),detail});if(!condition)throw new Error(`${name} failed: ${detail}`)};
const suffix=Date.now();const editorEmail=`phase3-editor-${suffix}@example.invalid`;const editorPassword=`Verify-${suffix}-Aa1!`;let editorUserId;let projectId;let caseStudyId;
try{
  const published=await anon.from("services").select("id").eq("status","published");verify("anonymous published reads",!published.error&&published.data.length>=6,`rows=${published.data?.length||0}`);
  const seededProjects=await anon.from("projects").select("id,slug").eq("status","published");verify("seed applied",!seededProjects.error&&seededProjects.data.some(row=>row.slug==="relax-moon-spa-automation"));
  const hiddenInquiries=await anon.from("inquiries").select("id");verify("anonymous inquiry denial",!hiddenInquiries.error&&hiddenInquiries.data.length===0,`rows=${hiddenInquiries.data?.length||0}`);
  const anonWrite=await anon.from("projects").insert({slug:`anon-${suffix}`,title_en:"Denied",title_ar:"مرفوض",summary_en:"This anonymous write must be denied by row level security.",summary_ar:"يجب رفض هذه الكتابة المجهولة بواسطة سياسات أمان الصفوف."});verify("anonymous CMS write denial",Boolean(anonWrite.error),anonWrite.error?.code||"");

  const adminAuth=client(anonKey);const adminSignIn=await adminAuth.auth.signInWithPassword({email:process.env.SUPABASE_ADMIN_EMAIL,password:process.env.SUPABASE_ADMIN_PASSWORD});verify("admin authentication",!adminSignIn.error&&Boolean(adminSignIn.data.session));
  const adminRole=await adminAuth.from("user_roles").select("role").eq("user_id",adminSignIn.data.user.id).single();verify("admin role",!adminRole.error&&adminRole.data.role==="admin");

  const editorCreated=await service.auth.admin.createUser({email:editorEmail,password:editorPassword,email_confirm:true});if(editorCreated.error)throw editorCreated.error;editorUserId=editorCreated.data.user.id;const editorRoleSet=await service.from("user_roles").insert({user_id:editorUserId,role:"editor"});if(editorRoleSet.error)throw editorRoleSet.error;
  const editor=client(anonKey);const editorSignIn=await editor.auth.signInWithPassword({email:editorEmail,password:editorPassword});verify("editor authentication",!editorSignIn.error&&Boolean(editorSignIn.data.session));
  const editorDraft=await editor.from("projects").insert({slug:`editor-draft-${suffix}`,title_en:"Editor verification draft",title_ar:"مسودة تحقق للمحرر",summary_en:"Temporary bilingual project used to verify editor content permissions.",summary_ar:"مشروع ثنائي اللغة مؤقت للتحقق من صلاحيات محتوى المحرر.",status:"draft",created_by:editorUserId,updated_by:editorUserId}).select("id").single();verify("editor content permission",!editorDraft.error&&Boolean(editorDraft.data?.id),editorDraft.error?.message||"");
  const editorRoleWrite=await editor.from("user_roles").insert({user_id:editorUserId,role:"admin"});verify("editor role-management denial",Boolean(editorRoleWrite.error),editorRoleWrite.error?.code||"");
  await service.from("projects").delete().eq("id",editorDraft.data.id);

  const draft=await adminAuth.from("projects").insert({slug:`phase3-verification-${suffix}`,title_en:"Phase 3 verification",title_ar:"التحقق من المرحلة الثالثة",summary_en:"Temporary project used to verify the complete administration lifecycle.",summary_ar:"مشروع مؤقت للتحقق من دورة الإدارة الكاملة في المرحلة الثالثة.",industry_en:"Verification",industry_ar:"التحقق",year:"2026",status:"draft",created_by:adminSignIn.data.user.id,updated_by:adminSignIn.data.user.id}).select("id").single();verify("project create",!draft.error&&Boolean(draft.data?.id),draft.error?.message||"");projectId=draft.data.id;
  const update=await adminAuth.from("projects").update({summary_en:"Updated temporary project used to verify the complete administration lifecycle."}).eq("id",projectId).select("id").single();verify("project edit",!update.error);
  const hiddenDraft=await anon.from("projects").select("id").eq("id",projectId);verify("anonymous draft denial",!hiddenDraft.error&&hiddenDraft.data.length===0);
  const publish=await adminAuth.from("projects").update({status:"published",published_at:new Date().toISOString()}).eq("id",projectId).select("id").single();verify("project publish",!publish.error);
  const publicPublished=await anon.from("projects").select("id").eq("id",projectId);verify("published project public",!publicPublished.error&&publicPublished.data.length===1);
  const unpublish=await adminAuth.from("projects").update({status:"draft",published_at:null}).eq("id",projectId);verify("project unpublish",!unpublish.error);
  const archive=await adminAuth.from("projects").update({status:"archived"}).eq("id",projectId);verify("project archive",!archive.error);

  const study=await adminAuth.from("case_studies").insert({project_id:projectId,overview_en:"Verified overview",overview_ar:"نظرة عامة موثقة",challenge_en:"Verified challenge",challenge_ar:"تحد موثق",objectives_en:"Verified objectives",objectives_ar:"أهداف موثقة",solution_en:"Verified solution",solution_ar:"حل موثق",security_en:"Verified security notes",security_ar:"ملاحظات أمان موثقة",status:"draft"}).select("id").single();verify("case study create",!study.error&&Boolean(study.data?.id),study.error?.message||"");caseStudyId=study.data.id;
  const studyUpdate=await adminAuth.from("case_studies").update({overview_en:"Updated verified overview"}).eq("id",caseStudyId).select("id").single();verify("case study edit",!studyUpdate.error);
  const publicStudy=await anon.from("case_studies").select("id").eq("id",caseStudyId);verify("draft case study denial",!publicStudy.error&&publicStudy.data.length===0);

  const png=Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=","base64"));const storagePath=`${adminSignIn.data.user.id}/phase3-${suffix}.png`;const upload=await adminAuth.storage.from("private-media").upload(storagePath,png,{contentType:"image/png"});verify("private storage upload",!upload.error,upload.error?.message||"");const publicPrivate=service.storage.from("private-media").getPublicUrl(storagePath);const unauthenticatedFetch=await fetch(publicPrivate.data.publicUrl);verify("private storage public denial",unauthenticatedFetch.status>=400,`status=${unauthenticatedFetch.status}`);const remove=await adminAuth.storage.from("private-media").remove([storagePath]);verify("admin storage delete",!remove.error,remove.error?.message||"");

  const audits=await adminAuth.from("audit_logs").select("action").eq("resource_id",projectId);const actions=new Set((audits.data||[]).map(row=>row.action));verify("audit logging",!audits.error&&["project.created","project.updated","project.published","project.unpublished","project.archived"].every(action=>actions.has(action)),[...actions].join(","));
  const adminInquiries=await adminAuth.from("inquiries").select("id").limit(1);verify("admin inquiry permission",!adminInquiries.error);
  const editorInquiries=await editor.from("inquiries").select("id").limit(1);verify("editor inquiry permission",!editorInquiries.error);
  console.log(JSON.stringify({passed:results.length,failed:0,results},null,2));
}finally{
  if(projectId)await service.from("projects").delete().eq("id",projectId);
  if(editorUserId)await service.auth.admin.deleteUser(editorUserId);
}
