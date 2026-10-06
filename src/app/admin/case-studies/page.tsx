import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminScreen } from "@/components/admin/admin-screen";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
export default async function CaseStudiesPage() {
  const session = await getAdminSession();
  if (!session.user || !session.role) redirect("/admin/login");
  const db = await createClient();
  const { data } = db
    ? await db
        .from("case_studies")
        .select("id,status,updated_at,projects(id,slug,title_en,title_ar)")
        .order("updated_at", { ascending: false })
    : { data: [] };
  return (
    <AdminScreen title="Case studies">
      <p>
        Case studies are attached to projects and use the same controlled
        publishing workflow.
      </p>
      {(data || []).length === 0 ? (
        <p>No case studies yet.</p>
      ) : (
        (data || []).map((item) => {
          const project = Array.isArray(item.projects)
            ? item.projects[0]
            : item.projects;
          return project ? (
            <article key={item.id}>
              <h2>{project.title_en}</h2>
              <p>
                {project.title_ar} · {item.status}
              </p>
              <Link href={`/admin/projects/${project.id}`}>Edit narrative</Link>{" "}
              ·{" "}
              <Link href={`/admin/projects/${project.id}/structure`}>
                Journey, architecture and results
              </Link>{" "}
              ·{" "}
              <Link href={`/admin/projects/${project.id}/preview`}>
                Preview
              </Link>
            </article>
          ) : null;
        })
      )}
    </AdminScreen>
  );
}
