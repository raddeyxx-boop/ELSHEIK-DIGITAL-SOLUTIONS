"use client";
import { useRef } from "react";
import { deleteMedia, updateMedia } from "@/app/admin/cms/actions";
import styles from "./project-form.module.css";
export function MediaItemActions({
  item,
}: {
  item: {
    id: string;
    storage_path: string;
    mime_type: string;
    alt_en: string | null;
    alt_ar: string | null;
    status: string;
  };
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <form action={updateMedia} className={styles.form}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="storage_path" value={item.storage_path} />
        <input type="hidden" name="mime_type" value={item.mime_type} />
        <div className={styles.grid}>
          <label>
            English alt text
            <input name="alt_en" defaultValue={item.alt_en || ""} />
          </label>
          <label>
            Arabic alt text
            <input name="alt_ar" dir="rtl" defaultValue={item.alt_ar || ""} />
          </label>
          <label>
            Visibility
            <select name="status" defaultValue={item.status}>
              <option value="draft">Private draft</option>
              <option value="published">Public/published</option>
              <option value="archived">Private archived</option>
            </select>
          </label>
        </div>
        <button className="button button-primary">Save media</button>
      </form>
      <button type="button" onClick={() => dialog.current?.showModal()}>
        Delete media
      </button>
      <dialog ref={dialog}>
        <form action={deleteMedia}>
          <h2>Delete media?</h2>
          <p>Deletion is blocked while this asset is referenced.</p>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="storage_path" value={item.storage_path} />
          <input type="hidden" name="confirmation" value="DELETE" />
          <button type="button" onClick={() => dialog.current?.close()}>
            Cancel
          </button>{" "}
          <button>Delete permanently</button>
        </form>
      </dialog>
    </>
  );
}
