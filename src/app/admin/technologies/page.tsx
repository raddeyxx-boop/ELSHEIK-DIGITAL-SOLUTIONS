import { AdminScreen } from "@/components/admin/admin-screen";
import { TechnologyForm } from "@/components/admin/cms-forms";
import { RecordActions } from "@/components/admin/record-actions";
import { deleteRecord, moveRecord } from "@/app/admin/cms/actions";
import { createClient } from "@/lib/supabase/server";
export default async function TechnologiesAdmin() {
  const db = await createClient();
  const [items, media] = db
    ? await Promise.all([
        db.from("technologies").select("*").order("sort_order"),
        db
          .from("media")
          .select("id,original_filename,storage_path")
          .eq("status", "published"),
      ])
    : [{ data: [] }, { data: [] }];
  return (
    <AdminScreen title="Technologies">
      {(items.data || []).map((row) => (
        <section key={row.id}>
          <TechnologyForm row={row} media={media.data || []} />
          <RecordActions
            id={row.id}
            table="technologies"
            returnPath="/admin/technologies"
            moveAction={moveRecord}
            deleteAction={deleteRecord}
          />
        </section>
      ))}
      <h2>New technology</h2>
      <TechnologyForm media={media.data || []} />
    </AdminScreen>
  );
}
