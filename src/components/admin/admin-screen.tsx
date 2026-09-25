import { redirect } from "next/navigation";
import { AdminPageHeader, AdminSidebar } from "./sidebar";
import styles from "./admin.module.css";
import { getAdminSession } from "@/lib/auth/admin";
export async function AdminScreen({
  title,
  children,
  adminOnly = false,
}: {
  title: string;
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const session = await getAdminSession();
  if (!session.user || !session.role || (adminOnly && session.role !== "admin"))
    redirect("/admin/login");
  return (
    <main className={styles.adminShell}>
      <AdminSidebar />
      <div className={styles.adminMain}>
        <AdminPageHeader title={title} role={session.role} />
        {children}
      </div>
    </main>
  );
}
