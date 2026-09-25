import {
  saveInsight,
  saveService,
  saveSetting,
  saveTechnology,
  saveTestimonial,
  updateLeadStatus,
  uploadMedia,
} from "@/app/admin/cms/actions";
import styles from "./project-form.module.css";
type Row = Record<string, unknown>;
const val = (row: Row | undefined, key: string) => String(row?.[key] ?? "");
const Field = ({
  name,
  label,
  row,
  required = false,
  dir,
  type = "text",
}: {
  name: string;
  label: string;
  row?: Row;
  required?: boolean;
  dir?: "rtl";
  type?: string;
}) => (
  <label>
    {label}
    <input
      name={name}
      defaultValue={val(row, name)}
      required={required}
      dir={dir}
      type={type}
    />
  </label>
);
const Area = ({
  name,
  label,
  row,
  required = false,
  dir,
  rows = 4,
}: {
  name: string;
  label: string;
  row?: Row;
  required?: boolean;
  dir?: "rtl";
  rows?: number;
}) => (
  <label>
    {label}
    <textarea
      name={name}
      defaultValue={val(row, name)}
      required={required}
      dir={dir}
      rows={rows}
    />
  </label>
);
const Status = ({ row }: { row?: Row }) => (
  <label>
    Status
    <select name="status" defaultValue={val(row, "status") || "draft"}>
      <option value="draft">Draft</option>
      <option value="published">Published</option>
      <option value="archived">Archived</option>
    </select>
  </label>
);
export function ServiceForm({
  row,
  technologies = [],
  assigned = [],
}: {
  row?: Row;
  technologies?: Row[];
  assigned?: string[];
}) {
  return (
    <form action={saveService} className={styles.form}>
      {row && <input type="hidden" name="id" value={val(row, "id")} />}
      <div className={styles.grid}>
        <Field name="slug" label="Slug" row={row} required />
        <Field name="sort_order" label="Sort order" row={row} type="number" />
        <Field name="title_en" label="English title" row={row} required />
        <Field
          name="title_ar"
          label="Arabic title"
          row={row}
          required
          dir="rtl"
        />
        {[
          "summary",
          "body",
          "audience",
          "problems",
          "deliverables",
          "approach",
        ].flatMap((key) =>
          (["en", "ar"] as const).map((lang) => (
            <Area
              key={`${key}_${lang}`}
              name={`${key}_${lang}`}
              label={`${key} (${lang})`}
              row={row}
              required={key === "summary"}
              dir={lang === "ar" ? "rtl" : undefined}
            />
          )),
        )}
        {["seo_title", "seo_description"].flatMap((key) =>
          (["en", "ar"] as const).map((lang) => (
            <Field
              key={`${key}_${lang}`}
              name={`${key}_${lang}`}
              label={`${key.replaceAll("_", " ")} (${lang})`}
              row={row}
              dir={lang === "ar" ? "rtl" : undefined}
            />
          )),
        )}
        <fieldset>
          <legend>Technologies</legend>
          {technologies.map((item) => (
            <label key={val(item, "id")} className={styles.check}>
              <input
                type="checkbox"
                name="technology_ids"
                value={val(item, "id")}
                defaultChecked={assigned.includes(val(item, "id"))}
              />
              {val(item, "name")}
            </label>
          ))}
        </fieldset>
      </div>
      <div className={styles.controls}>
        <Status row={row} />
        <button className="button button-primary">Save service</button>
      </div>
    </form>
  );
}
export function TechnologyForm({
  row,
  media = [],
}: {
  row?: Row;
  media?: Row[];
}) {
  return (
    <form action={saveTechnology} className={styles.form}>
      {row && <input type="hidden" name="id" value={val(row, "id")} />}
      <div className={styles.grid}>
        <Field name="name" label="Name" row={row} required />
        <Field name="slug" label="Slug" row={row} required />
        <Field name="category" label="Category" row={row} required />
        <Field name="sort_order" label="Sort order" row={row} type="number" />
        <Area name="description_en" label="English description" row={row} />
        <Area
          name="description_ar"
          label="Arabic description"
          row={row}
          dir="rtl"
        />
        <label>
          Icon/media
          <select name="media_id" defaultValue={val(row, "media_id")}>
            <option value="">None</option>
            {media.map((item) => (
              <option key={val(item, "id")} value={val(item, "id")}>
                {val(item, "original_filename") || val(item, "storage_path")}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.controls}>
        <label className={styles.check}>
          <input
            type="checkbox"
            name="active"
            defaultChecked={row ? Boolean(row.active) : true}
          />{" "}
          Active
        </label>
        <button className="button button-primary">Save technology</button>
      </div>
    </form>
  );
}
export function TestimonialForm({
  row,
  projects,
}: {
  row?: Row;
  projects: Row[];
}) {
  return (
    <form action={saveTestimonial} className={styles.form}>
      {row && <input type="hidden" name="id" value={val(row, "id")} />}
      <div className={styles.grid}>
        <Field name="client_name" label="Client name" row={row} required />
        <Field name="organization" label="Organization" row={row} />
        <Field name="role" label="Role" row={row} />
        <Field name="sort_order" label="Sort order" row={row} type="number" />
        <Area name="quote_en" label="English quote" row={row} required />
        <Area name="quote_ar" label="Arabic quote" row={row} dir="rtl" />
        <label>
          Related project
          <select name="project_id" defaultValue={val(row, "project_id")}>
            <option value="">None</option>
            {projects.map((p) => (
              <option key={val(p, "id")} value={val(p, "id")}>
                {val(p, "title_en")}
              </option>
            ))}
          </select>
        </label>
        <Status row={row} />
      </div>
      <div className={styles.controls}>
        <label className={styles.check}>
          <input
            type="checkbox"
            name="approved"
            defaultChecked={Boolean(row?.approved)}
          />{" "}
          Approved for publication
        </label>
        <button className="button button-primary">Save testimonial</button>
      </div>
    </form>
  );
}
export function InsightForm({ row, media = [] }: { row?: Row; media?: Row[] }) {
  return (
    <form action={saveInsight} className={styles.form}>
      {row && <input type="hidden" name="id" value={val(row, "id")} />}
      <div className={styles.grid}>
        <Field name="slug" label="Slug" row={row} required />
        <Field name="category" label="Category" row={row} required />
        <Field name="author" label="Author" row={row} />
        <Status row={row} />
        <label>
          Cover media
          <select
            name="cover_media_id"
            defaultValue={val(row, "cover_media_id")}
          >
            <option value="">None</option>
            {media.map((item) => (
              <option key={val(item, "id")} value={val(item, "id")}>
                {val(item, "original_filename") || val(item, "storage_path")}
              </option>
            ))}
          </select>
        </label>
        <Field name="title_en" label="English title" row={row} required />
        <Field
          name="title_ar"
          label="Arabic title"
          row={row}
          required
          dir="rtl"
        />
        <Area name="excerpt_en" label="English excerpt" row={row} required />
        <Area
          name="excerpt_ar"
          label="Arabic excerpt"
          row={row}
          required
          dir="rtl"
        />
        <Area
          name="content_en"
          label="English body (plain structured text)"
          row={row}
          required
          rows={12}
        />
        <Area
          name="content_ar"
          label="Arabic body (plain structured text)"
          row={row}
          required
          dir="rtl"
          rows={12}
        />
        {["seo_title", "seo_description"].flatMap((key) =>
          (["en", "ar"] as const).map((lang) => (
            <Field
              key={`${key}_${lang}`}
              name={`${key}_${lang}`}
              label={`${key.replaceAll("_", " ")} (${lang})`}
              row={row}
              dir={lang === "ar" ? "rtl" : undefined}
            />
          )),
        )}
      </div>
      <div className={styles.controls}>
        <button className="button button-primary">Save insight</button>
      </div>
    </form>
  );
}
export function LeadStatusForm({ row }: { row: Row }) {
  return (
    <form action={updateLeadStatus} className={styles.controls}>
      <input type="hidden" name="id" value={val(row, "id")} />
      <label>
        Status
        <select name="status" defaultValue={val(row, "status")}>
          {[
            "new",
            "reviewing",
            "contacted",
            "qualified",
            "won",
            "lost",
            "archived",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <button className="button">Update</button>
    </form>
  );
}
export function MediaForm() {
  return (
    <form action={uploadMedia} className={styles.form}>
      <div className={styles.grid}>
        <label>
          Image
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required
          />
        </label>
        <Field name="alt_en" label="English alt text" />
        <Field name="alt_ar" label="Arabic alt text" dir="rtl" />
      </div>
      <div className={styles.controls}>
        <button className="button button-primary">
          Upload private original
        </button>
      </div>
    </form>
  );
}
export function SettingForm({
  row,
  keyName,
  label,
}: {
  row?: Row;
  keyName: string;
  label: string;
}) {
  return (
    <form action={saveSetting} className={styles.form}>
      <input type="hidden" name="key" value={keyName} />
      <h2>{label}</h2>
      <div className={styles.grid}>
        <Area name="value_en" label="English value" row={row} />
        <Area name="value_ar" label="Arabic value" row={row} dir="rtl" />
      </div>
      <button className="button button-primary">Save setting</button>
    </form>
  );
}
