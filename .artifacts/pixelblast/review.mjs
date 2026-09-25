import fs from 'node:fs/promises';
import sharp from 'sharp';
const root='.artifacts/pixelblast';const pages=['home','services','work','about','insights','contact','caseStudy'];
for(const width of [1440,390,1920,1600,1366,1280,1024,768,430,375]) {
 const w=Math.min(width,600);let y=0;const composite=[];
 for(const preset of pages){let h=0;for(const [i,locale] of ['en','ar'].entries()){const input=await sharp(`${root}/${locale}-${preset}-${width}.png`).resize({width:w}).toBuffer();h=(await sharp(input).metadata()).height;composite.push({input,left:i*w,top:y});}y+=h;}
 await sharp({create:{width:w*2,height:y,channels:3,background:'#09090c'}}).composite(composite).png().toFile(`${root}/review-${width}.png`);
}
await fs.writeFile(`${root}/index.html`,`<!doctype html><meta charset="utf-8"><title>ELSHEIK PixelBlast verification</title><style>body{background:#09090c;color:#f0eee7;font:16px system-ui;margin:30px}img{width:100%}section{display:grid;grid-template-columns:1fr 1fr;gap:20px}a{color:#caff4a}</style><h1>ELSHEIK hero background system</h1><p>English / Arabic. Final desktop, mobile, tablet and large-screen captures.</p>${[1440,390,1920,1600,1366,1280,1024,768,430,375].map(width=>`<h2>${width}px</h2>${pages.map(p=>`<h3>${p}</h3><section>${['en','ar'].map(l=>`<a href="${l}-${p}-${width}.png"><img loading="lazy" src="${l}-${p}-${width}.png">${l.toUpperCase()}</a>`).join('')}</section>`).join('')}`).join('')}`);
console.log('Gallery and seven bilingual contact sheets created.');
