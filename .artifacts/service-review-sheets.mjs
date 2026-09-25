import sharp from 'sharp';
import fs from 'node:fs/promises';
const rows=JSON.parse(await fs.readFile('.artifacts/services/cinematic-geometry.json','utf8'));
for(const width of [1440,1920,1280,1024,768,430,390,375]){
 const items=rows.filter(r=>r.width===width);
 const panels=[];
 for(let i=0;i<items.length;i++){
  const r=items[i];const src=`.artifacts/services/cinematic-${r.locale}-${width}-${r.kind}.png`;
  const meta=await sharp(src).metadata();
  const left=Math.max(0,Math.floor(r.preview.x-r.row.x));
  const top=Math.max(0,Math.floor(r.preview.y-r.row.y));
  const img=await sharp(src).extract({left,top,width:Math.min(Math.floor(r.preview.width),meta.width-left),height:Math.min(Math.floor(r.preview.height),meta.height-top)}).resize({width:580,height:450,fit:'contain',background:'#111216'}).toBuffer();
  panels.push({input:img,left:(i%3)*600+10,top:Math.floor(i/3)*490+30});
  const label=Buffer.from(`<svg width="580" height="24"><text x="5" y="18" font-family="Arial" font-size="16" fill="white">${r.locale} / ${width} / ${r.kind}</text></svg>`);
  panels.push({input:label,left:(i%3)*600+10,top:Math.floor(i/3)*490+4});
 }
 await sharp({create:{width:1800,height:1960,channels:3,background:'#111216'}}).composite(panels).png().toFile(`.artifacts/services/review-sheet-${width}.png`);
}
console.log('7 review sheets; '+rows.length+' inspected scene geometries; page overflow: '+rows.filter(r=>r.overflow).length);

