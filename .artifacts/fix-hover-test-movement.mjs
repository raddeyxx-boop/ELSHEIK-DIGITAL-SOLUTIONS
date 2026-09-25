import fs from 'node:fs';
const p='tests/e2e/services-preview.spec.ts';let s=fs.readFileSync(p,'utf8');s=s.replace('await rows.nth(1).hover();','await rows.nth(1).hover({ position: { x: 220, y: 100 } });');
const b=s.indexOf('hover, keyboard');
s=s.slice(0,b)+s.slice(b).replace('await row.hover();','await row.hover({ position: { x: 180 + i * 25, y: 80 } });');
fs.writeFileSync(p,s);
const q='tests/e2e/services-recovery.spec.ts';s=fs.readFileSync(q,'utf8').replace('await rows.nth(i).hover();','await rows.nth(i).hover({position:{x:180+i*25,y:80}});');fs.writeFileSync(q,s);

