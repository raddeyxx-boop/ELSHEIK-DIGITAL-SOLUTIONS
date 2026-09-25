"use client";
import { useRef } from "react";
type Action = (formData: FormData) => void | Promise<void>;
export function RecordActions({
  id,
  table,
  returnPath,
  moveAction,
  deleteAction,
  scope,
  canMove = true,
}: {
  id: string;
  table: string;
  returnPath: string;
  moveAction: Action;
  deleteAction: Action;
  scope?: { project_id?: string; case_study_id?: string };
  canMove?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <div style={{ display: "flex", gap: ".5rem", marginBlock: ".75rem" }}>
      {canMove && (
        <form action={moveAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="table" value={table} />
          <input type="hidden" name="return_path" value={returnPath} />
          {Object.entries(scope || {}).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <button name="direction" value="up" aria-label="Move up">
            ↑
          </button>
          <button name="direction" value="down" aria-label="Move down">
            ↓
          </button>
        </form>
      )}
      <button type="button" onClick={() => dialog.current?.showModal()}>
        Delete
      </button>
      <dialog ref={dialog}>
        <form action={deleteAction}>
          <h2>Confirm deletion</h2>
          <p>This operation may affect related content and cannot be undone.</p>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="table" value={table} />
          <input type="hidden" name="return_path" value={returnPath} />
          <input type="hidden" name="confirmation" value="DELETE" />
          <button type="button" onClick={() => dialog.current?.close()}>
            Cancel
          </button>{" "}
          <button>Delete permanently</button>
        </form>
      </dialog>
    </div>
  );
}
