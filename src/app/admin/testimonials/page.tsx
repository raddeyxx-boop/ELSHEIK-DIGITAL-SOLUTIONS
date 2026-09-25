import { AdminScreen } from "@/components/admin/admin-screen";
import { TestimonialForm } from "@/components/admin/cms-forms";
import { RecordActions } from "@/components/admin/record-actions";
import { deleteRecord, moveRecord } from "@/app/admin/cms/actions";
import { createClient } from "@/lib/supabase/server";
export default async function TestimonialsAdmin() {
  const db = await createClient();
  const [items, projects] = db
    ? await Promise.all([
        db.from("testimonials").select("*").order("sort_order"),
        db.from("projects").select("id,title_en").order("title_en"),
      ])
    : [{ data: [] }, { data: [] }];
  return (
    <AdminScreen title="Testimonials">
      <p>Public visibility requires both approval and published status.</p>
      {(items.data || []).map((row) => (
        <section key={row.id}>
          <TestimonialForm row={row} projects={projects.data || []} />
          <RecordActions
            id={row.id}
            table="testimonials"
            returnPath="/admin/testimonials"
            moveAction={moveRecord}
            deleteAction={deleteRecord}
          />
        </section>
      ))}
      <h2>New testimonial</h2>
      <TestimonialForm projects={projects.data || []} />
    </AdminScreen>
  );
}
