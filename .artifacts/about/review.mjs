import sharp from 'sharp';
import fs from 'node:fs/promises';
const widths=[1920,1440,1366,1024,768,430,390];
for(const locale of ['en','ar'])for(const width of widths){
 const path=`.artifacts/about/after-${locale}-${width}.png`,{height}=await sharp(path).metadata();
 const segment=width<=430?1800:1600;
 for(let top=0,i=0;top<height;top+=segment,i++)await sharp(path).extract({left:0,top,width,height:Math.min(segment,height-top)}).toFile(`.artifacts/about/review-${locale}-${width}-${i}.png`);
}
await fs.writeFile('.artifacts/about/index.html',`<!doctype html><html lang="en"><meta charset="utf-8"><title>About page verification</title><style>body{background:#09090c;color:#eee;font:16px system-ui;margin:32px}a{color:#caff4a}img{display:block;width:100%;max-width:1000px;margin-top:16px}section{margin-block:48px}</style><h1>About page — English and Arabic</h1>${widths.map(w=>`<section><h2>${w}px</h2>${['en','ar'].map(l=>`<a href="after-${l}-${w}.png">${l.toUpperCase()} full page</a> · `).join('')}</section>`).join('')}<h2>Before</h2><a href="before-en-1920.png">English desktop</a> · <a href="before-ar-1920.png">Arabic desktop</a></html>`);
