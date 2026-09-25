import { render,screen } from "@testing-library/react";import { describe,it,expect } from "vitest";import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";import { getRelaxMoonArchitecture } from "@/components/architecture/data";
describe("ArchitectureDiagram",()=>{it("renders accessible structured nodes",()=>{render(<ArchitectureDiagram {...getRelaxMoonArchitecture("en")} locale="en"/>);expect(screen.getByRole("button",{name:/Customer/})).toBeInTheDocument();expect(screen.getByRole("button",{name:/Automation orchestration/})).toBeInTheDocument()})});

