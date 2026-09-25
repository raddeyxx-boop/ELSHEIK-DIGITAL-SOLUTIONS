"use client";
import { useParams } from "next/navigation";
import { statesFor } from "@/content/system-states";

// Geometry is load-bearing: a full viewport keeps the footer out of view while a
// route streams in (CLS). Only the accessible label varies by locale.
export default function Loading(){const {locale}=useParams<{locale:string}>();return <div className="shell" aria-label={statesFor(locale).loading} style={{minHeight:"100svh",paddingBlock:"8rem"}}><div style={{width:"9rem",height:".7rem",background:"var(--surface)",marginBottom:"2rem"}}/><div style={{width:"80%",height:"clamp(4rem,12vw,10rem)",background:"var(--surface)",borderRadius:"var(--radius-md)"}}/></div>}
