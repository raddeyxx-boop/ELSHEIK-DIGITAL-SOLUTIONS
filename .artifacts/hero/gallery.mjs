import fs from 'node:fs/promises';
import sharp from 'sharp';
const sizes=[1920,1728,1536,1440,1366,1280,1024,768,390,375];
for(const width of sizes){
 const w=Math.min(width,960),imgs=[];let height=0;
 for(const locale of ['en','ar']){const data=await sharp(`.artifacts/hero/after-${locale}-${width}-hero.png`).resize({width:w}).toBuffer();const m=await sharp(data).metadata();height=Math.max(height,m.height);imgs.push(data)}
 await sharp({create:{width:w*2,height,channels:3,background:'#09090c'}}).composite(imgs.map((input,i)=>({input,left:i*w,top:0}))).png().toFile(`.artifacts/hero/review-${width}.png`);
}
await fs.writeFile('.artifacts/hero/index.html',`<!doctype html><html lang="en"><meta charset="utf-8"><title>Hero composition verification</title><style>body{background:#09090c;color:#f0eee7;font:16px system-ui;margin:32px}a{color:#caff4a}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}img{width:100%}h2{margin-top:48px}</style><h1>Hero composition — before / after</h1><p>English and Arabic at all ten requested viewports. Before captures retain the original sticky header overlay from element screenshots.</p>${sizes.map(w=>['en','ar'].map(l=>`<h2>${l.toUpperCase()} · ${w}px</h2><div class="pair"><div>Before<a href="before-${l}-${w}-hero.png"><img src="before-${l}-${w}-hero.png"></a></div><div>After<a href="after-${l}-${w}-hero.png"><img src="after-${l}-${w}-hero.png"></a></div></div><a href="after-${l}-${w}.png">Initial viewport</a>`).join('')).join('')}</html>`);
