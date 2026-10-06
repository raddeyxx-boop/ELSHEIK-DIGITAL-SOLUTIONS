import { AdminScreen } from "@/components/admin/admin-screen";
import { InsightForm } from "@/components/admin/cms-forms";
import { createClient } from "@/lib/supabase/server";
export default async function NewInsight() {
  const db = await createClient();
  const { data } = db
    ? await db
        .from("media")
        .select("id,original_filename,storage_path")
        .eq("status", "published")
    : { data: [] };
  return (
    <AdminScreen title="New insight">
      <InsightForm media={data || []} />
    </AdminScreen>
  );
}
