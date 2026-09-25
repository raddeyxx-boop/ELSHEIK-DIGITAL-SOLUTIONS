import { describe,expect,it } from "vitest";import { architectureSchema } from "@/components/architecture/types";import { getRelaxMoonArchitecture } from "@/components/architecture/data";
describe("architecture data",()=>{it("validates the sanitized demonstration",()=>expect(architectureSchema.safeParse(getRelaxMoonArchitecture("en")).success).toBe(true));it("rejects edges to unknown nodes",()=>{const data=getRelaxMoonArchitecture("en");data.connections.push({source:"missing",target:"customer"});expect(architectureSchema.safeParse(data).success).toBe(false)})});

