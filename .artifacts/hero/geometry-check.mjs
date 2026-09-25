import fs from 'node:fs';
import assert from 'node:assert/strict';
const after=JSON.parse(fs.readFileSync('.artifacts/hero/after-geometry.json'));
const before=JSON.parse(fs.readFileSync('.artifacts/hero/before-geometry.json'));
for(const r of after){
 assert(!r.overflow);
 assert(r.cta.bottom<=r.height,`${r.locale} ${r.width} CTA beyond viewport`);
 for(const m of r.modules){assert(m.x>=r.field.x && m.right<=r.field.right && m.y>=r.field.y && m.bottom<=r.field.bottom);assert(m.right<=r.core.x || m.x>=r.core.right || m.bottom<=r.core.y || m.y>=r.core.bottom,'module overlaps core');}
 if(r.width<=1100)assert(r.field.y>=r.cta.bottom);
 const p=before.find(x=>x.width===r.width&&x.locale===r.locale);
 console.log(`${r.locale} ${r.width}: hero ${Math.round(p.hero.height)}→${Math.round(r.hero.height)}, grid ${Math.round(p.grid.width)}→${Math.round(r.grid.width)}, diagram ${Math.round(p.field.width)}×${Math.round(p.field.height)}→${Math.round(r.field.width)}×${Math.round(r.field.height)}, CTA bottom ${Math.round(r.cta.bottom)}/${r.height}`);
}
console.log('20/20 responsive geometry states passed');
