"use client";
export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){return <html lang="en"><body><main style={{minHeight:"100vh",display:"grid",placeContent:"center",padding:"2rem"}}><h1 className="heading">The application needs another attempt.</h1><button className="button button-primary" onClick={reset}>Reload interface</button></main></body></html>}

