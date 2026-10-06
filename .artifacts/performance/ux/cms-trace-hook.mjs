// Diagnostic only: preload into `next start` to log every CMS REST attempt.
// Usage: CMS_TRACE=path.jsonl node --import ./.artifacts/performance/ux/cms-trace-hook.mjs node_modules/next/dist/bin/next start
import fs from 'node:fs';
const file = process.env.CMS_TRACE || '.artifacts/performance/ux/cms-trace.jsonl';
const original = globalThis.fetch;
const log = entry => fs.appendFileSync(file, JSON.stringify({ ...entry, time: Date.now() }) + '\n');
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (!url.pathname.startsWith('/rest/v1/')) return original(input, init);
  const start = Date.now(), headers = new Headers(init?.headers);
  log({ event: 'start', path: url.pathname, retry: headers.get('x-retry-count') || '0' });
  try { const res = await original(input, init); log({ event: 'end', path: url.pathname, status: res.status, ms: Date.now() - start }); return res; }
  catch (error) { log({ event: 'error', path: url.pathname, code: error.cause?.code || error.name, ms: Date.now() - start }); throw error; }
};
