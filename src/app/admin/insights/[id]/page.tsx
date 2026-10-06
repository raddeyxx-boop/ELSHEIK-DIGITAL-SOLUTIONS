import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminScreen } from "@/components/admin/admin-screen";
import { InsightForm } from "@/components/admin/cms-forms";
import { createClient } from "@/lib/supabase/server";
export default async function EditInsight({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    db = await createClient();
  const [item, media] = db
    ? await Promise.all([
        db.from("insights").select("*").eq("id", id).maybeSingle(),
        db
          .from("media")
          .select("id,original_filename,storage_path")
          .eq("status", "published"),
      ])
    : [{ data: null }, { data: [] }];
  if (!item.data) notFound();
  return (
    <AdminScreen title={item.data.title_en}>
      <p>
        <Link href={`/en/insights/${item.data.slug}`} target="_blank">
          Open public preview (published only)
        </Link>
      </p>
      <InsightForm row={item.data} media={media.data || []} />
    </AdminScreen>
  );
}
