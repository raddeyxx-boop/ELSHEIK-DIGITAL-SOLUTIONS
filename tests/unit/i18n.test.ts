import { describe,expect,it } from "vitest";import { isLocale,localeDirection,switchLocalePath } from "@/lib/i18n/config";
describe("locale utilities",()=>{it("recognizes supported locales",()=>{expect(isLocale("en")).toBe(true);expect(isLocale("ar")).toBe(true);expect(isLocale("fr")).toBe(false)});it("maps writing direction",()=>{expect(localeDirection("en")).toBe("ltr");expect(localeDirection("ar")).toBe("rtl")});it("preserves route while switching",()=>{expect(switchLocalePath("/en/services","ar")).toBe("/ar/services");expect(switchLocalePath("/work","ar")).toBe("/ar/work")})});

