import { redirect } from "next/navigation";
import { AdminPageHeader, AdminSidebar } from "@/components/admin/sidebar";
import styles from "@/components/admin/admin.module.css";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session.user || !session.role) redirect("/admin/login");
  const db = await createClient();
  if (!db) redirect("/admin/login");
  const [published, drafts, leads, audit] = await Promise.all([
    db
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    db
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    db
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .in("status", ["new", "reviewing", "qualified"]),
    db
      .from("audit_logs")
      .select("id,action,resource,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  return (
    <main className={styles.adminShell}>
      <AdminSidebar />
      <div className={styles.adminMain}>
        <AdminPageHeader title="Dashboard" role={session.role} />
        <section className={styles.stats}>
          <article className={styles.stat}>
            <span>Published projects</span>
            <strong>{published.count || 0}</strong>
          </article>
          <article className={styles.stat}>
            <span>Project drafts</span>
            <strong>{drafts.count || 0}</strong>
          </article>
          <article className={styles.stat}>
            <span>Open leads</span>
            <strong>{leads.count || 0}</strong>
          </article>
        </section>
        <section className={styles.empty}>
          <h2>Recent content activity</h2>
          {(audit.data || []).length === 0 ? (
            <p>No recorded activity.</p>
          ) : (
            (audit.data || []).map((row) => (
              <p key={row.id}>
                <strong>{row.action}</strong> · {row.resource} ·{" "}
                <time>{new Date(row.created_at).toLocaleString()}</time>
              </p>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
