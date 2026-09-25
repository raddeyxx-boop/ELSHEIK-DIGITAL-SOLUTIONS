import { notFound } from "next/navigation";
import { AdminScreen } from "@/components/admin/admin-screen";
import {
  addConnection,
  deleteRecord,
  moveRecord,
  saveArchitectureNode,
  saveJourneyStep,
  saveResult,
} from "@/app/admin/cms/actions";
import { RecordActions } from "@/components/admin/record-actions";
import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";
import { createClient } from "@/lib/supabase/server";
import type { ArchitectureNodeData } from "@/components/architecture/types";
import styles from "@/components/admin/project-form.module.css";
type Row = Record<string, unknown>;
const value = (r: Row | undefined, k: string) => String(r?.[k] ?? "");
const Field = ({
  name,
  label,
  row,
  dir,
  type = "text",
}: {
  name: string;
  label: string;
  row?: Row;
  dir?: "rtl";
  type?: string;
}) => (
  <label>
    {label}
    <input
      name={name}
      defaultValue={value(row, name)}
      dir={dir}
      type={type}
        required={!name.startsWith("description")&&!(["value","source_note","step_type"].includes(name))}
    />
  </label>
);
const Area = ({
  name,
  label,
  row,
  dir,
}: {
  name: string;
  label: string;
  row?: Row;
  dir?: "rtl";
}) => (
  <label>
    {label}
    <textarea name={name} defaultValue={value(row, name)} dir={dir} rows={3} />
  </label>
);
function JourneyForm({
  row,
  id,
  studyId,
}: {
  row?: Row;
  id: string;
  studyId: string;
}) {
  return (
    <form action={saveJourneyStep} className={styles.form}>
      {row && <input type="hidden" name="id" value={value(row, "id")} />}
      <input type="hidden" name="project_id" value={id} />
      <input type="hidden" name="case_study_id" value={studyId} />
      <div className={styles.grid}>
        <Field name="title_en" label="English title" row={row} />
        <Field name="title_ar" label="Arabic title" row={row} dir="rtl" />
        <Area name="description_en" label="English description" row={row} />
        <Area
          name="description_ar"
          label="Arabic description"
          row={row}
          dir="rtl"
        />
        <Field name="step_type" label="Step type/icon key" row={row} />
        <Field name="sort_order" label="Order" row={row} type="number" />
      </div>
      <button className="button button-primary">
        {row ? "Save step" : "Add step"}
      </button>
    </form>
  );
}
function NodeForm({
  row,
  id,
  studyId,
}: {
  row?: Row;
  id: string;
  studyId: string;
}) {
  return (
    <form action={saveArchitectureNode} className={styles.form}>
      {row && <input type="hidden" name="id" value={value(row, "id")} />}
      <input type="hidden" name="project_id" value={id} />
      <input type="hidden" name="case_study_id" value={studyId} />
      <div className={styles.grid}>
        <Field name="node_key" label="Unique node key" row={row} />
        <Field name="label_en" label="English label" row={row} />
        <Field name="label_ar" label="Arabic label" row={row} dir="rtl" />
        <Area name="description_en" label="English description" row={row} />
        <Area
          name="description_ar"
          label="Arabic description"
          row={row}
          dir="rtl"
        />
        <label>
          Node role
          <select
            name="node_type"
            defaultValue={value(row, "node_type") || "service"}
          >
            {[
              "channel",
              "integration",
              "automation",
              "logic",
              "service",
              "output",
              "custom",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <Field name="layer" label="Layer" row={row} type="number" />
        <Field name="sort_order" label="Order" row={row} type="number" />
      </div>
      <button className="button button-primary">
        {row ? "Save node" : "Add node"}
      </button>
    </form>
  );
}
function ResultForm({ row, id }: { row?: Row; id: string }) {
  return (
    <form action={saveResult} className={styles.form}>
      {row && <input type="hidden" name="id" value={value(row, "id")} />}
      <input type="hidden" name="project_id" value={id} />
      <div className={styles.grid}>
        <Field name="label_en" label="English label" row={row} />
        <Field name="label_ar" label="Arabic label" row={row} dir="rtl" />
        <Field name="value" label="Value" row={row} />
        <Area name="context_en" label="English context" row={row} />
        <Area name="context_ar" label="Arabic context" row={row} dir="rtl" />
        <Area
          name="source_note"
          label="Internal source note (never public)"
          row={row}
        />
        <Field name="sort_order" label="Order" row={row} type="number" />
        <label>
          <input
            type="checkbox"
            name="verified"
            defaultChecked={Boolean(row?.verified)}
          />{" "}
          Verified
        </label>
        <label>
          <input
            type="checkbox"
            name="publishable"
            defaultChecked={Boolean(row?.publishable)}
          />{" "}
          Publishable
        </label>
      </div>
      <button className="button button-primary">
        {row ? "Save result" : "Add result"}
      </button>
    </form>
  );
}
export default async function StructurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    db = await createClient();
  if (!db) notFound();
  const { data: study } = await db
    .from("case_studies")
    .select("id")
    .eq("project_id", id)
    .maybeSingle();
  if (!study) notFound();
  const [journey, nodes, connections, results] = await Promise.all([
      db
        .from("customer_journey_steps")
        .select("*")
        .eq("case_study_id", study.id)
        .order("sort_order"),
      db
        .from("architecture_nodes")
        .select("*")
        .eq("case_study_id", study.id)
        .order("layer")
        .order("sort_order"),
      db
        .from("architecture_connections")
        .select("*")
        .eq("case_study_id", study.id)
        .order("sort_order"),
      db
        .from("project_results")
        .select("*")
        .eq("project_id", id)
        .order("sort_order"),
    ]),
    returnPath = `/admin/projects/${id}/structure`,
    diagramNodes: ArchitectureNodeData[] = (nodes.data || []).map((n) => ({
      id: n.id,
      label: n.label_en,
      description: n.description_en || n.label_en,
      type: n.node_type,
      layer: n.layer,
    })),
    diagramEdges = (connections.data || []).map((c) => ({
      source: c.source_node_id,
      target: c.target_node_id,
    }));
  return (
    <AdminScreen title="Case study structure">
      <h2>Customer journey</h2>
      {(journey.data || []).map((step) => (
        <section key={step.id}>
          <JourneyForm row={step} id={id} studyId={study.id} />
          <RecordActions
            id={step.id}
            table="customer_journey_steps"
            returnPath={returnPath}
            moveAction={moveRecord}
            deleteAction={deleteRecord}
            scope={{ case_study_id: study.id }}
          />
        </section>
      ))}
      <h3>Add journey step</h3>
      <JourneyForm id={id} studyId={study.id} />
      <h2>Architecture nodes</h2>
      {diagramNodes.length > 1 && diagramEdges.length > 0 && (
        <ArchitectureDiagram
          nodes={diagramNodes}
          connections={diagramEdges}
          locale="en"
        />
      )}
      {(nodes.data || []).map((node) => (
        <section key={node.id}>
          <NodeForm row={node} id={id} studyId={study.id} />
          <RecordActions
            id={node.id}
            table="architecture_nodes"
            returnPath={returnPath}
            moveAction={moveRecord}
            deleteAction={deleteRecord}
            scope={{ case_study_id: study.id }}
          />
        </section>
      ))}
      <h3>Add architecture node</h3>
      <NodeForm id={id} studyId={study.id} />
      {(nodes.data || []).length > 1 && (
        <form action={addConnection} className={styles.form}>
          <input type="hidden" name="project_id" value={id} />
          <input type="hidden" name="case_study_id" value={study.id} />
          <h3>Create connection</h3>
          <div className={styles.grid}>
            {["source_node_id", "target_node_id"].map((name) => (
              <label key={name}>
                {name.startsWith("source") ? "Source" : "Target"}
                <select name={name}>
                  {(nodes.data || []).map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label_en}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <button className="button button-primary">Add connection</button>
        </form>
      )}
      {(connections.data || []).map((edge) => (
        <article key={edge.id}>
          <p>
            {diagramNodes.find((n) => n.id === edge.source_node_id)?.label} →{" "}
            {diagramNodes.find((n) => n.id === edge.target_node_id)?.label}
          </p>
          <RecordActions
            id={edge.id}
            table="architecture_connections"
            returnPath={returnPath}
            moveAction={moveRecord}
            deleteAction={deleteRecord}
          />
        </article>
      ))}
      <h2>Results</h2>
      {(results.data || []).map((result) => (
        <section key={result.id}>
          <ResultForm row={result} id={id} />
          <RecordActions
            id={result.id}
            table="project_results"
            returnPath={returnPath}
            moveAction={moveRecord}
            deleteAction={deleteRecord}
            scope={{ project_id: id }}
          />
        </section>
      ))}
      <h3>Add result</h3>
      <ResultForm id={id} />
    </AdminScreen>
  );
}
