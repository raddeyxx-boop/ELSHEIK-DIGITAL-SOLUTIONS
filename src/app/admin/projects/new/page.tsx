import { redirect } from "next/navigation";
import { AdminPageHeader, AdminSidebar } from "@/components/admin/sidebar";
import { ProjectForm } from "@/components/admin/project-form";
import styles from "@/components/admin/admin.module.css";
import { getAdminSession } from "@/lib/auth/admin";
export default async function NewProjectPage() {
  const session = await getAdminSession();
  if (!session.user || !session.role) redirect("/admin/login");
  return (
    <main className={styles.adminShell}>
      <AdminSidebar />
      <div className={styles.adminMain}>
        <AdminPageHeader title="New project" role={session.role} />
        <ProjectForm />
      </div>
    </main>
  );
}
