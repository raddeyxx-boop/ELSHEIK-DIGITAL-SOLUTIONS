import Link from "next/link";
import styles from "./admin.module.css";
const links = [
  "Dashboard",
  "Projects",
  "Case Studies",
  "Services",
  "Technologies",
  "Testimonials",
  "Insights",
  "Leads",
  "Media",
  "Settings",
];
export function AdminSidebar() {
  return (
    <aside className={styles.sidebar}>
      <strong>ALSHEIKH / ADMIN</strong>
      <nav aria-label="Admin navigation">
        {links.map((label, i) => (
          <Link
            key={label}
            href={
              i === 0
                ? "/admin"
                : `/admin/${label.toLowerCase().replaceAll(" ", "-")}`
            }
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
export function AdminPageHeader({
  title,
  role,
}: {
  title: string;
  role: string;
}) {
  return (
    <header className={styles.adminHeader}>
      <div>
        <span>Content management</span>
        <h1>{title}</h1>
      </div>
      <div>
        <span className={styles.badge}>{role}</span>
        <form action="/admin/logout" method="post">
          <button type="submit">Sign out</button>
        </form>
      </div>
    </header>
  );
}
export function AdminEmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section className={styles.empty}>
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}
