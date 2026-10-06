import type { ComponentProps } from "react";
import { architectureSchema } from "./types";
import { ArchitectureDiagram as Diagram } from "./architecture-diagram-client";

// Validate at the server boundary, rather than on every browser hover/render.
export function ArchitectureDiagram(props: ComponentProps<typeof Diagram>) {
  architectureSchema.parse({
    nodes: props.nodes,
    connections: props.connections,
  });
  return <Diagram {...props} />;
}
