import { writeFile } from 'node:fs/promises';
const samples=[];
for(let run=0;run<4;run++){
 const start=performance.now();
 const response=await fetch('http://127.0.0.1:3140/en/work/navigation-diagnostic');
 const html=await response.text();
 samples.push({ms:performance.now()-start,status:response.status,hasTitle:html.includes('Relax Moon Spa Automation')});
}
await writeFile(`.artifacts/performance/cms-${process.argv[2]}.json`,JSON.stringify({latencyPerReadMs:150,samples},null,2));
console.log(samples);
