import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
const results=[];
for(const locale of ['en','ar']) for(const width of [1440,390]) {
  const root='.artifacts/featured-localization/';
  const before=JSON.parse(await readFile(`${root}before-${locale}-${width}.json`,'utf8'));
  const after=JSON.parse(await readFile(`${root}after-${locale}-${width}.json`,'utf8'));
  const geometry=['panels','stages','cta'].every(key=>JSON.stringify(before[key])===JSON.stringify(after[key]));
  const row={locale,width,geometryUnchanged:geometry,overflow:after.overflow};
  if(locale==='en') {
    const a=await sharp(`${root}before-${locale}-${width}.png`).raw().toBuffer();
    const b=await sharp(`${root}after-${locale}-${width}.png`).raw().toBuffer();
    row.identicalPixels=a.equals(b);row.identicalText=before.text===after.text;
  }
  results.push(row);
}
console.log(JSON.stringify(results,null,2));
await writeFile('.artifacts/featured-localization/comparison.json',JSON.stringify(results,null,2));
