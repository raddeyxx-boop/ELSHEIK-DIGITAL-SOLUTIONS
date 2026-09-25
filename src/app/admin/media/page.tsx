import Image from "next/image";
import { AdminScreen } from "@/components/admin/admin-screen";
import { MediaForm } from "@/components/admin/cms-forms";
import { MediaItemActions } from "@/components/admin/media-item-actions";
import { createClient } from "@/lib/supabase/server";
export default async function MediaAdmin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const p = await searchParams,
    db = await createClient();
  let request = db
    ?.from("media")
    .select(
      "id,storage_path,original_filename,mime_type,byte_size,width,height,alt_en,alt_ar,status",
    )
    .order("created_at", { ascending: false });
  if (p.q)
    request = request?.or(
      `original_filename.ilike.%${p.q.replaceAll(/[%,]/g, "")}%,alt_en.ilike.%${p.q.replaceAll(/[%,]/g, "")}%`,
    );
  if (p.status) request = request?.eq("status", p.status);
  const { data } = request ? await request : { data: [] };
  const rows = await Promise.all(
    (data || []).map(async (row) => ({
      ...row,
      preview: (
        await db!.storage
          .from("private-media")
          .createSignedUrl(row.storage_path, 300)
      ).data?.signedUrl,
    })),
  );
  return (
    <AdminScreen title="Media">
      <MediaForm />
      <form>
        <input
          name="q"
          placeholder="Search filename or alt text"
          defaultValue={p.q}
        />
        <select name="status" defaultValue={p.status}>
          <option value="">All visibility</option>
          {["draft", "published", "archived"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <button>Filter</button>
      </form>
      {rows.map((row) => (
        <article
          key={row.id}
          style={{
            background: "white",
            padding: "1rem",
            marginBlock: ".75rem",
          }}
        >
          {row.preview && (
            <Image
              src={row.preview}
              alt={row.alt_en || "Media preview"}
              width={Math.min(row.width || 300, 300)}
              height={Math.min(row.height || 200, 200)}
              unoptimized
            />
          )}
          <h2>{row.original_filename || "Unnamed upload"}</h2>
          <p>
            {row.mime_type} · {row.width}×{row.height} · {row.byte_size} bytes ·{" "}
            {row.status}
          </p>
          <MediaItemActions item={row} />
        </article>
      ))}
    </AdminScreen>
  );
}
