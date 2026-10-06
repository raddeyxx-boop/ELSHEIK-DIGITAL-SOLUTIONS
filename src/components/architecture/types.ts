import { object, string, number, array, enum as enumeration, type infer as Infer } from "zod";

export const architectureNodeSchema = object({ id: string().min(1), label: string().min(1), description: string().min(1), type: enumeration(["channel", "integration", "automation", "logic", "service", "output", "custom"]), layer: number().int().nonnegative() });
export const architectureConnectionSchema = object({ source: string().min(1), target: string().min(1) });
export const architectureSchema = object({ nodes: array(architectureNodeSchema).min(2), connections: array(architectureConnectionSchema).min(1) }).superRefine((data, context) => { const ids = new Set(data.nodes.map((node) => node.id)); for (const edge of data.connections) if (!ids.has(edge.source) || !ids.has(edge.target)) context.addIssue({ code: "custom", message: "Connection references an unknown node" }); });
export type ArchitectureNodeData = Infer<typeof architectureNodeSchema>;
export type ArchitectureConnectionData = Infer<typeof architectureConnectionSchema>;
