import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import styles from "@/components/admin/admin.module.css";
import { getAdminSession } from "@/lib/auth/admin";
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getAdminSession();
  if (session.user && session.role) redirect("/admin");
  const query = await searchParams;
  return (
    <main className={styles.loginPage}>
      <section className={styles.brand}>
        <strong>ALSHEIKH DIGITAL SOLUTIONS</strong>
        <h1>Secure content operations.</h1>
        <small>Private administration</small>
      </section>
      <section className={styles.panel}>
        <div>
          <span className="eyebrow">Authorized access</span>
          <h2>Sign in</h2>
          <LoginForm
            configured={session.configured}
            error={Boolean(query.error)}
          />
        </div>
      </section>
    </main>
  );
}
