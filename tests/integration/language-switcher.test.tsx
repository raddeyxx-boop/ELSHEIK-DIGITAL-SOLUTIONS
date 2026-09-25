import { render,screen } from "@testing-library/react";import { vi,describe,it,expect } from "vitest";import { LanguageSwitcher } from "@/components/layout/language-switcher";
vi.mock("next/navigation",()=>({usePathname:()=>"/en/services"}));
describe("LanguageSwitcher",()=>{it("preserves the current route",()=>{render(<LanguageSwitcher locale="en" label="العربية"/>);expect(screen.getByRole("link")).toHaveAttribute("href","/ar/services")})});

