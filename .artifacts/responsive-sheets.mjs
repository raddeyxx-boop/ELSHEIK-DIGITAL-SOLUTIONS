import sharp from 'sharp';
import {readdir} from 'node:fs/promises';
for(const f of await readdir('.artifacts/responsive')) {
  if(!f.endsWith('.png')||f.includes('sheet')) continue;
  const path='.artifacts/responsive/'+f;
  const {width,height}=await sharp(path).metadata();
  const n=Math.ceil(height/1800), overlays=[];
  for(let i=0;i<n;i++) overlays.push({input:await sharp(path).extract({left:0,top:i*1800,width,height:Math.min(1800,height-i*1800)}).toBuffer(),left:i*width,top:0});
  await sharp({create:{width:width*n,height:1800,channels:3,background:'#09090c'}}).composite(overlays).png().toFile(path.replace('.png','-sheet.png'));
  console.log(f,width,height);
  if(n>6) for(let start=0;start<n;start+=4) {
    const count=Math.min(4,n-start);
    await sharp({create:{width:width*count,height:1800,channels:3,background:'#09090c'}}).composite(overlays.slice(start,start+count).map((o,i)=>({...o,left:i*width}))).png().toFile(path.replace('.png',`-sheet-${start}.png`));
  }
}
