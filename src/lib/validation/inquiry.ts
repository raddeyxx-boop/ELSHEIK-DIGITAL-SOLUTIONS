import { object, string, email, literal, enum as enumeration, type infer as Infer } from "zod";
export const inquirySchema=object({name:string().trim().min(2).max(80),company:string().trim().max(120).optional().or(literal("")),email:email().max(160),phone:string().trim().max(40).optional().or(literal("")),country:string().trim().max(80).optional().or(literal("")),service:enumeration(["website","web-application","mobile-application","automation","ai","custom-software","unsure"]),budget:string().trim().max(80).optional().or(literal("")),timeline:string().trim().max(80).optional().or(literal("")),description:string().trim().min(20).max(3000),website:string().max(0).optional()});
export type InquiryInput=Infer<typeof inquirySchema>;

