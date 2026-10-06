import Link from "next/link";
export default function NotFound(){return <html lang="en"><body><main style={{minHeight:"100vh",display:"grid",placeContent:"center",textAlign:"center",padding:"2rem"}}><span className="eyebrow">404 / Not found</span><h1 className="heading">This route is outside the system.</h1><p className="lead">The page may have moved or never existed.</p><Link className="button button-primary" href="/en">Return home</Link></main></body></html>}

