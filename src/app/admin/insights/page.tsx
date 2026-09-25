import Link from "next/link";
import { AdminScreen } from "@/components/admin/admin-screen";
import { RecordActions } from "@/components/admin/record-actions";
import { deleteRecord, moveRecord } from "@/app/admin/cms/actions";
import { createClient } from "@/lib/supabase/server";
export default async function InsightsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const p = await searchParams,
    db = await createClient();
  let request = db
    ?.from("insights")
    .select("id,slug,title_en,title_ar,status,published_at")
    .order("updated_at", { ascending: false });
  if (p.q)
    request = request?.or(
      `title_en.ilike.%${p.q.replaceAll(/[%,]/g, "")}%,title_ar.ilike.%${p.q.replaceAll(/[%,]/g, "")}%`,
    );
  if (p.status) request = request?.eq("status", p.status);
  const { data } = request ? await request : { data: [] };
  return (
    <AdminScreen title="Insights">
      <p>
        <Link className="button button-primary" href="/admin/insights/new">
          New insight
        </Link>
      </p>
      <form>
        <input name="q" placeholder="Search insights" defaultValue={p.q} />
        <select name="status" defaultValue={p.status}>
          <option value="">All statuses</option>
          {["draft", "published", "archived"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <button>Filter</button>
      </form>
      {(data || []).map((row) => (
        <article key={row.id}>
          <Link href={`/admin/insights/${row.id}`}>
            <strong>{row.title_en}</strong>
          </Link>
          <p>
            {row.title_ar} · {row.status}
          </p>
          <RecordActions
            id={row.id}
            table="insights"
            returnPath="/admin/insights"
            moveAction={moveRecord}
            deleteAction={deleteRecord}
            canMove={false}
          />
        </article>
      ))}
    </AdminScreen>
  );
}
