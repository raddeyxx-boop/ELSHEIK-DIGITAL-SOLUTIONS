export function getPublicSupabaseEnv(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const anonKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return url&&anonKey?{url,anonKey}:null;}
export function isSupabaseConfigured(){return Boolean(getPublicSupabaseEnv());}
export function getSecretSupabaseEnv(){const publicEnv=getPublicSupabaseEnv();const secretKey=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;return publicEnv&&secretKey?{url:publicEnv.url,secretKey}:null;}
