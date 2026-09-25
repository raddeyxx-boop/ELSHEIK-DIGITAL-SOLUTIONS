import fs from 'node:fs/promises';
import sharp from 'sharp';
import assert from 'node:assert/strict';
const root='.artifacts/typography';
const before=JSON.parse(await fs.readFile(`${root}/before.json`,'utf8'));
const after=JSON.parse(await fs.readFile(`${root}/after.json`,'utf8'));
const changed=[];
for(const b of before){const a=after.find(x=>x.locale===b.locale&&x.route===b.route&&x.width===b.width);assert(a);assert.deepEqual(a.body,b.body,`Normal text changed: ${b.locale}/${b.route}/${b.width}`);if(['','about','insights'].includes(b.route))assert.deepEqual(a.headings,b.headings,`Protected headings changed: ${b.route}`);if(a.headings[0]?.font!==b.headings[0]?.font)changed.push({locale:a.locale,route:a.route,width:a.width,before:b.headings[0].font,after:a.headings[0].font});}
const issues=after.flatMap(a=>a.headings.filter(h=>h.x< -1||h.right>a.width+1||h.scroll>h.client+1).map(h=>({locale:a.locale,route:a.route,width:a.width,text:h.text})));
await fs.writeFile(`${root}/comparison.json`,JSON.stringify({states:after.length,pageOverflow:after.filter(a=>a.overflow),headingIssues:issues,changed,normalTextUnchanged:true,protectedHeadingsUnchanged:true},null,2));
for(const width of [1920,1600,1440,1366,1280,1024,768,430,390,375]){
 const routes=['work','services','contact','work-relax-moon-spa-automation'];const w=Math.min(width,720);let y=0,composite=[];
 for(const route of routes){let rowHeight=0;for(const [i,locale] of ['en','ar'].entries()){const input=await sharp(`${root}/after-${locale}-${route}-${width}.png`).resize({width:w}).toBuffer();const meta=await sharp(input).metadata();composite.push({input,left:i*w,top:y});rowHeight=Math.max(rowHeight,meta.height);}y+=rowHeight;}
 await sharp({create:{width:w*2,height:y,channels:3,background:'#09090c'}}).composite(composite).png().toFile(`${root}/review-${width}.png`);
}
await fs.writeFile(`${root}/index.html`,`<!doctype html><html><meta charset="utf-8"><title>Public typography verification</title><style>body{background:#09090c;color:#eee;font:16px system-ui;margin:32px}a{color:#caff4a}img{max-width:100%;display:block}.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px}</style><h1>Public display scale: before / after</h1>${before.map(b=>{const key=b.route.replaceAll('/','-')||'home';return `<h2>${b.locale.toUpperCase()} / ${key} / ${b.width}px</h2><div class="pair"><a href="before-${b.locale}-${key}-${b.width}.png"><img src="before-${b.locale}-${key}-${b.width}.png">Before</a><a href="after-${b.locale}-${key}-${b.width}.png"><img src="after-${b.locale}-${key}-${b.width}.png">After</a></div>`}).join('')}</html>`);
console.log(JSON.stringify({states:after.length,headingIssues:issues,pageOverflow:after.filter(a=>a.overflow).length,normalTextUnchanged:true,protectedHeadingsUnchanged:true}));
