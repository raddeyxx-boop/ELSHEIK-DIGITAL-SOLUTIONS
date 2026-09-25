import fs from 'node:fs';
import postcss from 'postcss';
const file='src/components/services/service-preview.module.css';
const root=postcss.parse(fs.readFileSync(file,'utf8'));
root.walkRules(rule=>{if(rule.selector.includes('.deviceNote'))rule.remove();});
fs.writeFileSync(file,root.toString());
