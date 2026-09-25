import { AdminScreen } from "@/components/admin/admin-screen";
import { ServiceForm } from "@/components/admin/cms-forms";
import { RecordActions } from "@/components/admin/record-actions";
import { deleteRecord, moveRecord } from "@/app/admin/cms/actions";
import { createClient } from "@/lib/supabase/server";
export default async function ServicesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const p = await searchParams,
    db = await createClient();
  let request = db
    ?.from("services")
    .select("*,service_technologies(technology_id)")
    .order("sort_order");
  if (p.q)
    request = request?.ilike("title_en", `%${p.q.replaceAll(/[%,]/g, "")}%`);
  if (p.status) request = request?.eq("status", p.status);
  const [services, technologies] = await Promise.all([
    request ? request : { then: () => ({ data: [] }) },
    db
      ? db
          .from("technologies")
          .select("id,name")
          .eq("active", true)
          .order("sort_order")
      : { data: [] },
  ]);
  return (
    <AdminScreen title="Services">
      {services.error && <p role="alert">{services.error.message}</p>}
      <form>
        <input name="q" placeholder="Search services" defaultValue={p.q} />
        <select name="status" defaultValue={p.status}>
          <option value="">All statuses</option>
          {["draft", "published", "archived"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <button>Filter</button>
      </form>
      {(services.data || []).map((row) => (
        <section key={row.id}>
          <ServiceForm
            row={row}
            technologies={technologies.data || []}
            assigned={(row.service_technologies || []).map(
              (x: { technology_id: string }) => x.technology_id,
            )}
          />
          <RecordActions
            id={row.id}
            table="services"
            returnPath="/admin/services"
            moveAction={moveRecord}
            deleteAction={deleteRecord}
          />
        </section>
      ))}
      <h2>New service</h2>
      <ServiceForm technologies={technologies.data || []} />
    </AdminScreen>
  );
}
