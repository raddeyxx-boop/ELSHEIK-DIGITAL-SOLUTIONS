import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminPageHeader, AdminSidebar } from "@/components/admin/sidebar";
import { ProjectForm } from "@/components/admin/project-form";
import { saveCaseStudy } from "../actions";
import {
  saveProjectMedia,
  saveProjectRelations,
} from "@/app/admin/cms/actions";
import styles from "@/components/admin/admin.module.css";
import formStyles from "@/components/admin/project-form.module.css";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { CaseStudyRecord, ProjectRecord } from "@/types/cms";
export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session.user || !session.role) redirect("/admin/login");
  const { id } = await params;
  const client = await createClient();
  if (!client) redirect("/admin/login");
  const [
    { data: project },
    { data: caseStudy },
    technologies,
    assigned,
    testimonials,
    media,
    projectMedia,
  ] = await Promise.all([
    client.from("projects").select("*").eq("id", id).single(),
    client.from("case_studies").select("*").eq("project_id", id).maybeSingle(),
    client
      .from("technologies")
      .select("id,name")
      .eq("active", true)
      .order("sort_order"),
    client
      .from("project_technologies")
      .select("technology_id")
      .eq("project_id", id),
    client
      .from("testimonials")
      .select("id,client_name,project_id")
      .order("client_name"),
    client
      .from("media")
      .select("id,original_filename,storage_path")
      .order("created_at", { ascending: false }),
    client.from("project_media").select("media_id").eq("project_id", id),
  ]);
  if (!project) notFound();
  const p = project as ProjectRecord;
  const c = caseStudy as CaseStudyRecord | null;
  return (
    <main className={styles.adminShell}>
      <AdminSidebar />
      <div className={styles.adminMain}>
        <AdminPageHeader title={p.title_en} role={session.role} />
        <p>
          <Link href={`/admin/projects/${id}/preview`}>Secure preview</Link>
          {c && (
            <>
              {" "}
              ·{" "}
              <Link href={`/admin/projects/${id}/structure`}>
                Journey, architecture and results
              </Link>
            </>
          )}
        </p>
        <ProjectForm project={p} media={media.data || []} />
        <form className={formStyles.form} action={saveProjectRelations}>
          <input type="hidden" name="project_id" value={id} />
          <h2>Relations</h2>
          <fieldset>
            <legend>Technologies</legend>
            {(technologies.data || []).map((item) => (
              <label key={item.id} className={formStyles.check}>
                <input
                  type="checkbox"
                  name="technology_ids"
                  value={item.id}
                  defaultChecked={(assigned.data || []).some(
                    (row) => row.technology_id === item.id,
                  )}
                />
                {item.name}
              </label>
            ))}
          </fieldset>
          <label>
            Featured testimonial
            <select
              name="testimonial_id"
              defaultValue={
                (testimonials.data || []).find((row) => row.project_id === id)
                  ?.id || ""
              }
            >
              <option value="">None</option>
              {(testimonials.data || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.client_name}
                </option>
              ))}
            </select>
          </label>
          <button className="button button-primary">Save relations</button>
        </form>
        <form className={formStyles.form} action={saveProjectMedia}>
          <input type="hidden" name="project_id" value={id} />
          <h2>Project gallery</h2>
          {(media.data || []).map((item) => (
            <label key={item.id} className={formStyles.check}>
              <input
                type="checkbox"
                name="media_ids"
                value={item.id}
                defaultChecked={(projectMedia.data || []).some(
                  (row) => row.media_id === item.id,
                )}
              />
              {item.original_filename || item.storage_path}
            </label>
          ))}
          <button className="button button-primary">Save gallery</button>
        </form>
        <form className={formStyles.form} action={saveCaseStudy}>
          <input type="hidden" name="project_id" value={id} />
          <h2>Related case study</h2>
          <div className={formStyles.grid}>
            {[
              "overview",
              "challenge",
              "objectives",
              "solution",
              "security",
            ].flatMap((field) =>
              (["en", "ar"] as const).map((lang) => (
                <label key={`${field}_${lang}`}>
                  {`${field} (${lang})`}
                  <textarea
                    name={`${field}_${lang}`}
                    defaultValue={
                      c?.[
                        `${field}_${lang}` as keyof CaseStudyRecord
                      ]?.toString() || ""
                    }
                    dir={lang === "ar" ? "rtl" : undefined}
                    rows={5}
                  />
                </label>
              )),
            )}
          </div>
          <div className={formStyles.controls}>
            <label>
              Status
              <select name="status" defaultValue={c?.status || "draft"}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <button className="button button-primary">Save case study</button>
          </div>
        </form>
      </div>
    </main>
  );
}
