"use client";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDownRight, Braces, Database, Sparkles, Workflow } from "lucide-react";
import styles from "./system-field.module.css";
const modules=[["01","EXPERIENCE","Interface systems",Braces],["02","AUTOMATION","Operational logic",Workflow],["03","DATA","Structured memory",Database],["04","INTELLIGENCE","Decision layer",Sparkles]] as const;
const arabicModules = [["التجربة", "أنظمة الواجهات"], ["الأتمتة", "منطق التشغيل"], ["البيانات", "ذاكرة منظمة"], ["الذكاء", "طبقة القرار"]] as const;
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const getReducedMotion = () => window.matchMedia(motionQuery).matches;
const getServerReducedMotion = () => true;
// The route is a constant path, so its 121 sample points (SVG user units) are
// computed once per visit; each layout only maps them through the current matrix.
let routePoints: { x: number; y: number }[] | undefined;
export function SystemField({locale}:{locale:"en"|"ar"}){const reduce=useSyncExternalStore(subscribeMotion,getReducedMotion,getServerReducedMotion);const[active,setActive]=useState(0);const[onScreen,setOnScreen]=useState(true);const svg=useRef<SVGSVGElement>(null);
  // The highlighted module advances only while the field is on screen.
  useEffect(()=>{if(reduce||!onScreen)return;const timer=setInterval(()=>setActive(v=>(v+1)%modules.length),1700);return()=>clearInterval(timer)},[reduce,onScreen]);
  // The packet travels the upper route at constant speed (like SMIL animateMotion's
  // paced mode) as a transform animation, which runs on the compositor instead of
  // repainting the SVG every frame. It pauses while offscreen.
  const field=useRef<HTMLDivElement>(null),route=useRef<SVGPathElement>(null),packet=useRef<HTMLElement>(null);
  useLayoutEffect(()=>{const box=field.current,path=route.current,dot=packet.current,element=svg.current;if(reduce||!box||!path||!dot||!element)return;let animation:Animation|undefined;
    let measured="";
    const layout=()=>{const matrix=element.getScreenCTM();if(!matrix)return;const origin=box.getBoundingClientRect(),time=animation?.currentTime??0,playing=animation?.playState!=="paused";
      // The observer's first callback repeats the mount measurement; skip identical layouts.
      const key=[matrix.a,matrix.d,matrix.e-origin.left,matrix.f-origin.top].join();if(key===measured)return;measured=key;
      if(!routePoints){const length=path.getTotalLength();routePoints=Array.from({length:121},(_,step)=>{const point=path.getPointAtLength(length*step/120);return{x:point.x,y:point.y}})}
      const frames=routePoints.map(point=>{return{transform:`translate(${matrix.a*point.x+matrix.e-origin.left-box.clientLeft}px,${matrix.d*point.y+matrix.f-origin.top-box.clientTop}px)`}});
      animation?.cancel();dot.style.setProperty("--packet-scale",String(matrix.a));animation=dot.animate(frames,{duration:4600,iterations:Infinity});animation.currentTime=time;if(!playing)animation.pause()};
    layout();const resize=new ResizeObserver(layout);resize.observe(box);const visibility=new IntersectionObserver(([entry])=>{setOnScreen(entry.isIntersecting);if(entry.isIntersecting)animation?.play();else animation?.pause()});visibility.observe(box);
    return()=>{resize.disconnect();visibility.disconnect();animation?.cancel()}},[reduce]);
  return <div ref={field} className={styles.field} aria-label={locale==="ar"?"نظام أعمال رقمي متصل":"Connected digital business system"}><div className={styles.axis}><span>INPUT</span><span>SYSTEM</span><span>IMPACT</span></div><svg ref={svg} viewBox="0 0 720 520" aria-hidden="true"><path ref={route} d="M30 260H170C225 260 212 96 285 96H440C500 96 495 260 548 260H690"/><path d="M30 260H170C225 260 212 424 285 424H440C500 424 495 260 548 260H690"/><path d="M360 40V480"/></svg>{!reduce && <i ref={packet} className={styles.packet} aria-hidden="true"/>}<div className={styles.core} lang={locale}><small>ALS / OPERATING CORE</small><strong>{locale==="ar"?"من الفكرة إلى الأثر":"IDEA INTO IMPACT"}</strong><ArrowDownRight aria-hidden="true"/></div>{modules.map(([index,title,meta,Icon],item)=><button type="button" lang={locale} key={title} className={`${styles.module} ${styles[`module${item}`]} ${active===item?styles.active:""}`} onFocus={()=>setActive(item)} onMouseEnter={()=>setActive(item)}><span>{index}</span><Icon aria-hidden="true"/><strong>{locale==="ar"?arabicModules[item][0]:title}</strong><small>{locale==="ar"?arabicModules[item][1]:meta}</small></button>)}<div className={styles.readout}><span>STATUS</span><b>CONNECTED</b><i/></div></div>}
