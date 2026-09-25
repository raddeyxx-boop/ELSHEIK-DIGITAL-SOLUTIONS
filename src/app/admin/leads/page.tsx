import { AdminScreen } from "@/components/admin/admin-screen";
import { LeadStatusForm } from "@/components/admin/cms-forms";
import { createClient } from "@/lib/supabase/server";
export default async function LeadsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const query = await searchParams;
  const db = await createClient();
  let request = db
    ?.from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (query.status) request = request?.eq("status", query.status);
  if (query.q)
    request = request?.or(
      `name.ilike.%${query.q.replaceAll(/[%,]/g, "")}%,email.ilike.%${query.q.replaceAll(/[%,]/g, "")}%`,
    );
  const { data } = request ? await request : { data: [] };
  return (
    <AdminScreen title="Leads">
      <form>
        <input
          name="q"
          placeholder="Search name or email"
          defaultValue={query.q}
        />
        <select name="status" defaultValue={query.status}>
          <option value="">All statuses</option>
          {[
            "new",
            "reviewing",
            "contacted",
            "qualified",
            "won",
            "lost",
            "archived",
            "spam",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="button">Filter</button>
      </form>
      {(data || []).map((row) => (
        <article
          key={row.id}
          style={{
            background: "white",
            padding: "1.5rem",
            marginBlock: "1rem",
          }}
        >
          <h2>{row.name}</h2>
          <p>
            {row.company} · {row.email}
          </p>
          <p>{row.description}</p>
          <LeadStatusForm row={row} />
        </article>
      ))}
    </AdminScreen>
  );
}
