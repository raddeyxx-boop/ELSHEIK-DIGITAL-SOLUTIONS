"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { architectureSchema, type ArchitectureConnectionData, type ArchitectureNodeData } from "./types";
import styles from "./architecture.module.css";

export function ArchitectureDiagram({ nodes, connections, locale }: { nodes: ArchitectureNodeData[]; connections: ArchitectureConnectionData[]; locale: Locale }) {
  architectureSchema.parse({ nodes, connections });
  const [active, setActive] = useState<string | null>(null);
  const related = useMemo(() => new Set(connections.filter((edge) => edge.source === active || edge.target === active).flatMap((edge) => [edge.source, edge.target])), [active, connections]);
  const layers = [...new Set(nodes.map((node) => node.layer))].map((layer) => nodes.filter((node) => node.layer === layer));
  return <div className={styles.diagram} aria-label={locale === "ar" ? "مخطط بنية النظام" : "System architecture diagram"}>
    {layers.map((layer, index) => <div className={styles.layer} key={index}>{layer.map((node) => <button key={node.id} className={`${styles.node} ${active === node.id ? styles.active : ""} ${active && !related.has(node.id) ? styles.dim : ""}`} onPointerEnter={() => setActive(node.id)} onPointerLeave={() => setActive(null)} onFocus={() => setActive(node.id)} onBlur={() => setActive(null)} type="button"><small>{node.type}</small><strong>{node.label}</strong><span>{node.description}</span></button>)}{index < layers.length - 1 && <span className={styles.connector} aria-hidden="true"><i /></span>}</div>)}
  </div>;
}

