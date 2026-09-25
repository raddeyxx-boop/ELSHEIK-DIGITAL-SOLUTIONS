import fs from 'node:fs';
const p='tests/e2e/services-preview.spec.ts';
let s=fs.readFileSync(p,'utf8');
s=s.replace('body header,.skip-link','body > header,.skip-link');
const a=s.indexOf('            for (let n = 0; n < positions.length; n++) {');
const b=s.indexOf('\n          }\n          const box',a);
s=s.slice(0,a)+`            for (const position of positions) {
              expect(position.width).toBeGreaterThan(65);
              expect(position.height).toBeGreaterThan(65);
            }`+s.slice(b);
s=s.replace('const initial = await signal.getAttribute("cx");','const initial = await signal.boundingBox();');
s=s.replace('expect(await signal.getAttribute("cx")).not.toBe(initial);','expect((await signal.boundingBox())!.x).not.toBe(initial!.x);');
s=s.replace(`.locator('[data-node="1"]')\n              .evaluate`,`.locator('[data-node="1"] > div')\n              .evaluate`);
s=s.replace('row.locator("[data-node] > svg")','row.locator("[data-node] svg")');
s=s.replace('await row.getByRole("link").tap();','await row.getByRole("link").locator("svg").tap();');
s=s.replace('          const box = await preview.boundingBox();',`          const box = await preview.boundingBox();
          expect(box!.width).toBeGreaterThan(width <= 900 ? 230 : 290);
          expect(box!.height).toBeGreaterThan(350);
          expect((await row.boundingBox())!.height).toBeGreaterThan(rest!.height + 80);
          if (kinds[i] === "mobile") {
            const phone = await preview.locator('[data-device="phone"]').boundingBox();
            expect(phone!.height).toBeGreaterThan(300);
          }`);
s=s.replace('[1440, 390, 320].includes(width)','[1440, 430, 390, 375, 320].includes(width)');
fs.writeFileSync(p,s);
