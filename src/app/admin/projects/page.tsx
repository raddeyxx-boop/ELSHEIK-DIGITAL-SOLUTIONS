import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPageHeader, AdminSidebar } from "@/components/admin/sidebar";
import { RecordActions } from "@/components/admin/record-actions";
import { deleteRecord, moveRecord } from "@/app/admin/cms/actions";
import styles from "@/components/admin/admin.module.css";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    featured?: string;
    sort?: string;
  }>;
}) {
  const session = await getAdminSession();
  if (!session.user || !session.role) redirect("/admin/login");
  const p = await searchParams,
    db = await createClient();
  let query = db?.from("projects").select("*");
  if (p.q)
    query = query?.or(
      `title_en.ilike.%${p.q.replaceAll(/[%,]/g, "")}%,title_ar.ilike.%${p.q.replaceAll(/[%,]/g, "")}%,slug.ilike.%${p.q.replaceAll(/[%,]/g, "")}%`,
    );
  if (p.status) query = query?.eq("status", p.status);
  if (p.featured) query = query?.eq("featured", p.featured === "yes");
  query =
    p.sort === "updated"
      ? query?.order("updated_at", { ascending: false })
      : query?.order("sort_order").order("featured", { ascending: false });
  const { data } = query ? await query : { data: [] };
  return (
    <main className={styles.adminShell}>
      <AdminSidebar />
      <div className={styles.adminMain}>
        <AdminPageHeader title="Projects" role={session.role} />
        <p>
          <Link className="button button-primary" href="/admin/projects/new">
            New project
          </Link>
        </p>
        <form>
          <input name="q" placeholder="Search projects" defaultValue={p.q} />
          <select name="status" defaultValue={p.status}>
            <option value="">All statuses</option>
            {["draft", "published", "archived"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select name="featured" defaultValue={p.featured}>
            <option value="">Featured or not</option>
            <option value="yes">Featured</option>
            <option value="no">Not featured</option>
          </select>
          <select name="sort" defaultValue={p.sort}>
            <option value="order">Manual order</option>
            <option value="updated">Recently updated</option>
          </select>
          <button>Filter</button>
        </form>
        <section className={styles.empty}>
          {(data || []).length === 0 ? (
            <p>No matching projects.</p>
          ) : (
            (data || []).map((project) => (
              <article key={project.id}>
                <Link href={`/admin/projects/${project.id}`}>
                  <strong>{project.title_en}</strong>
                </Link>
                <p>
                  {project.slug} · {project.status}
                  {project.featured ? " · featured" : ""}
                </p>
                <RecordActions
                  id={project.id}
                  table="projects"
                  returnPath="/admin/projects"
                  moveAction={moveRecord}
                  deleteAction={deleteRecord}
                />
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
