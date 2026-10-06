// Records when the hero markup arrives in the streamed HTML versus stream completion.
import fs from 'node:fs/promises';
const results = [];
for (const route of ['/en', '/ar']) {
  const start = performance.now();
  const response = await fetch('http://localhost:3200' + route);
  const decoder = new TextDecoder(); let html = '', heroAt = null, lowerAt = null;
  for await (const chunk of response.body) {
    html += decoder.decode(chunk, { stream: true });
    if (heroAt === null && html.includes('data-testid="homepage-hero"')) heroAt = performance.now() - start;
    if (lowerAt === null && heroAt !== null && /data-testid="homepage-hero"[\s\S]*<footer/.test(html) && html.split('data-pixel-hero').length > 1 && html.includes('hidden id="S:')) lowerAt = performance.now() - start;
  }
  results.push({ route, status: response.status, heroAt: Math.round(heroAt), lowerContentStreamedAt: lowerAt && Math.round(lowerAt), streamEnd: Math.round(performance.now() - start) });
}
await fs.writeFile('.artifacts/performance/hero-stream-final.json', JSON.stringify(results, null, 2));
console.log(results);
