import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { ProjectRecord } from "@/types/cms";
export default async function ProjectPreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session.user || !session.role) redirect("/admin/login");
  const client = await createClient();
  const { id } = await params;
  if (!client) redirect("/admin/login");
  const { data } = await client
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (!data) notFound();
  const p = data as ProjectRecord;
  return (
    <main className="shell" style={{ paddingBlock: "6rem" }}>
      <span className="eyebrow">Authorized draft preview / {p.status}</span>
      <h1 className="display">{p.title_en}</h1>
      <p className="lead">{p.summary_en}</p>
      <hr style={{ borderColor: "var(--border)", marginBlock: "4rem" }} />
      <div dir="rtl">
        <h2 className="heading">{p.title_ar}</h2>
        <p className="lead">{p.summary_ar}</p>
      </div>
    </main>
  );
}
