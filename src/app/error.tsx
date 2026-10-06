"use client";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main style={{minHeight:"70vh",display:"grid",placeContent:"center",padding:"2rem"}}><div><span className="eyebrow">System interruption</span><h1 className="heading">Something did not load correctly.</h1><p className="lead">No technical details have been exposed. You can safely try again.</p><button className="button button-primary" onClick={reset}>Try again</button></div></main>}

