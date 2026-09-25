// Scripts referenced by the server HTML of each route (the page's own JS, before any
// prefetching), gzip-transferred size.
import zlib from 'node:zlib';
const base = process.argv[2] || 'http://localhost:3200';
const cache = new Map();
for (const route of ['/en', '/en/work', '/en/work/relax-moon-spa-automation', '/en/services', '/en/insights', '/en/about', '/en/process', '/en/technologies', '/en/contact']) {
  const html = await (await fetch(base + route)).text();
  const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]))];
  let total = 0;
  for (const src of srcs) {
    if (!cache.has(src)) cache.set(src, zlib.gzipSync(Buffer.from(await (await fetch(new URL(src, base))).arrayBuffer())).length);
    total += cache.get(src);
  }
  console.log(route.padEnd(38), 'scripts', srcs.length, 'gzip', total);
}
