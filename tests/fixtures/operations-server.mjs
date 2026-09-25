// Test-only public CMS substitute. Never reads credentials or writes remote data.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
const project = { id: 'demo-project', slug: 'relax-moon-spa-automation', title_en: 'Relax Moon Spa Automation', title_ar: 'أتمتة ريلاكس مون سبا', summary_en: 'Sanitized demonstration of conversational booking and operational coordination.', summary_ar: 'نموذج مبسّط للحجز بالمحادثة وتنسيق العمليات.', industry_en: 'Service operations', industry_ar: 'عمليات الخدمات', year: 'Example', is_demo: true };
// CMS_FIXTURE_LATENCY_MS (diagnostics only): delay each read like a remote CMS round trip.
const latency=Number(process.env.CMS_FIXTURE_LATENCY_MS||0);
const server=createServer((request,response)=>setTimeout(()=>{
  if(request.method!=='GET'){response.writeHead(405);response.end();return;}
  const path=new URL(request.url,'http://localhost').pathname;
  const single=request.headers.accept?.includes('vnd.pgrst.object');
  response.setHeader('Content-Type','application/json');
  response.end(JSON.stringify(path==='/rest/v1/projects' ? (single?project:[project]) : single?null:[]));
},latency));
// --cms-unreachable: production server on 3110 whose CMS reads fail like ENOTFOUND.
const unreachable=process.argv.includes('--cms-unreachable');
const start=()=>{
  const child=spawn(process.execPath,[...(unreachable?['--import','./tests/fixtures/cms-unreachable-fetch.mjs']:process.argv.includes('--production')?['--import','./tests/fixtures/production-cms-fetch.mjs']:[]),'node_modules/next/dist/bin/next',process.argv.includes('--production')?'start':'dev','--port',unreachable?'3110':'3100'],{stdio:'inherit',env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:3101',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'demo-only',NEXT_PUBLIC_SUPABASE_ANON_KEY:'demo-only',SUPABASE_SECRET_KEY:'',SUPABASE_SERVICE_ROLE_KEY:''}});
  child.on('exit',code=>{server.close();process.exitCode=code??1;});
  for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>{child.kill();server.close();});
};
if(unreachable) start(); else server.listen(3101,'127.0.0.1',start);
