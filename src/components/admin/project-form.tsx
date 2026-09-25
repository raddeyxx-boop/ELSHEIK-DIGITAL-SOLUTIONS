import type { ProjectRecord } from "@/types/cms";
import { saveProject } from "@/app/admin/projects/actions";
import styles from "./project-form.module.css";
export function ProjectForm({
  project,
  media = [],
}: {
  project?: ProjectRecord;
  media?: Array<{
    id: string;
    original_filename: string | null;
    storage_path: string;
  }>;
}) {
  return (
    <form className={styles.form} action={saveProject}>
      {project && <input type="hidden" name="id" value={project.id} />}
      <div className={styles.grid}>
        <Field name="slug" label="Slug" value={project?.slug} required />
        <Field name="year" label="Year" value={project?.year || ""} />
        <Field
          name="title_en"
          label="English title"
          value={project?.title_en}
          required
        />
        <Field
          name="title_ar"
          label="Arabic title"
          value={project?.title_ar}
          required
          dir="rtl"
        />
        <Area
          name="summary_en"
          label="English summary"
          value={project?.summary_en}
          required
        />
        <Area
          name="summary_ar"
          label="Arabic summary"
          value={project?.summary_ar}
          required
          dir="rtl"
        />
        <Field
          name="industry_en"
          label="English industry"
          value={project?.industry_en || ""}
        />
        <Field
          name="industry_ar"
          label="Arabic industry"
          value={project?.industry_ar || ""}
          dir="rtl"
        />
        <Field
          name="seo_title_en"
          label="English SEO title"
          value={project?.seo_title_en || ""}
        />
        <Field
          name="seo_title_ar"
          label="Arabic SEO title"
          value={project?.seo_title_ar || ""}
          dir="rtl"
        />
        <Area
          name="seo_description_en"
          label="English SEO description"
          value={project?.seo_description_en || ""}
        />
        <Area
          name="seo_description_ar"
          label="Arabic SEO description"
          value={project?.seo_description_ar || ""}
          dir="rtl"
        />
        <Field
          name="canonical_url"
          label="Canonical URL"
          value={project?.canonical_url || ""}
        />
        <label>
          Cover image
          <select
            name="cover_media_id"
            defaultValue={project?.cover_media_id || ""}
          >
            <option value="">None</option>
            {media.map((item) => (
              <option key={item.id} value={item.id}>
                {item.original_filename || item.storage_path}
              </option>
            ))}
          </select>
        </label>
        <Field
          name="sort_order"
          label="Sort order"
          value={String(project?.sort_order || 0)}
          type="number"
        />
      </div>
      <div className={styles.controls}>
        <label>
          Status
          <select name="status" defaultValue={project?.status || "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className={styles.check}>
          <input
            type="checkbox"
            name="featured"
            defaultChecked={project?.featured}
          />{" "}
          Featured
        </label>
        <button className="button button-primary">Save project</button>
      </div>
    </form>
  );
}
function Field({
  name,
  label,
  value = "",
  required = false,
  dir,
  type = "text",
}: {
  name: string;
  label: string;
  value?: string;
  required?: boolean;
  dir?: "rtl";
  type?: string;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        defaultValue={value}
        required={required}
        dir={dir}
        type={type}
      />
    </label>
  );
}
function Area({
  name,
  label,
  value = "",
  required = false,
  dir,
}: {
  name: string;
  label: string;
  value?: string;
  required?: boolean;
  dir?: "rtl";
}) {
  return (
    <label>
      {label}
      <textarea
        name={name}
        defaultValue={value}
        required={required}
        dir={dir}
        rows={5}
      />
    </label>
  );
}
