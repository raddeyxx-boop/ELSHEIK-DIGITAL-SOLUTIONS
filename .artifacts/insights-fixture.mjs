import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const server = await createServer({ configFile: 'vitest.config.ts', server: { middlewareMode: true }, plugins: [{ name: 'private-reader-fixture', enforce: 'pre', load(id) { if (id.replaceAll(String.fromCharCode(92), '/').endsWith('/src/server/queries/public-content.ts')) return 'export async function getPublishedInsight() { return globalThis.__privateInsight; } export async function getPublishedInsights() { return []; }'; } }] });
try {
  const { InsightsIndex } = await server.ssrLoadModule('/src/components/insights/insights-index.tsx');
  const React = await import('react'); const { default: Detail } = await server.ssrLoadModule('/src/app/[locale]/insights/[slug]/page.tsx');
  const journalStyles = (await server.ssrLoadModule("/src/components/insights/journal.module.css")).default;
  let css = (await readFile('src/app/globals.css', 'utf8')).replace('@import "tailwindcss";', '');
  for (const name of ['insights-index', 'journal']) {
    const path = `/src/components/insights/${name}.module.css`;
    const classes = (await server.ssrLoadModule(path)).default;
    let source = await readFile(`.${path}`, 'utf8');
    source = source.replace(/\.([a-zA-Z][\w-]*)/g, (match, key) => classes[key] ? `.${classes[key]}` : match).replace(/:global\(([^)]+)\)/g, '$1');
    css += source;
  }
  css += '.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}body{padding:24px}';
  await mkdir('.artifacts/insights', { recursive: true });
  for (const locale of ['en','ar']) {
    const items = Array.from({length:5},(_,i)=>({slug:`isolated-fixture-${i}`,title:locale==='ar'?`مقال للاختبار فقط: تصميم الأنظمة الرقمية ${i+1}`:`Isolated QA fixture: designing digital systems ${i+1}`,excerpt:locale==='ar'?'نص مخصص لاختبار قابلية القراءة وتنسيق المقالات. لا يُنشر هذا المحتوى في الموقع.':'Private visual fixture for checking article hierarchy and reading measure. This content is never published to the website.',category:locale==='ar'?'اختبار التخطيط':'Layout QA',publishedAt:null}));
    globalThis.__privateInsight = { ...items[0], author: "", content: (locale === "ar" ? "## عنوان لاختبار القراءة\n\nهذا نص خاص لفحص عرض المقال وتباعد الفقرات في اللغة العربية. لا يظهر هذا النص في الموقع العام.\n\n### تفاصيل النظام\n\nوضوح النص وتسلسل العناوين يساعدان على القراءة.\n\n" : "## Reading layout check\n\nThis private fixture checks paragraph width and spacing in the article reader. It is never published to the website.\n\n### System details\n\nA calm reading experience uses clear headings and deliberate spacing.\n\n") + String.fromCharCode(96).repeat(3) + "js\nconst layout = true;\n" + String.fromCharCode(96).repeat(3) };
    const detail = renderToStaticMarkup(await Detail({ params: Promise.resolve({ locale, slug: items[0].slug }) }));
    await writeFile(`.artifacts/insights/${locale}-detail-fixture.html`, `<!doctype html><html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${css}</style><body><p>PRIVATE READER QA — NOT PUBLISHED CONTENT</p>${detail}</body></html>`);
    const html = renderToStaticMarkup(React.createElement(InsightsIndex,{items,locale}));
    await writeFile(`.artifacts/insights/${locale}-populated-fixture.html`,`<!doctype html><html lang="${locale}" dir="${locale==='ar'?'rtl':'ltr'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${css}</style><body><p>PRIVATE LAYOUT QA — NOT PUBLISHED CONTENT</p><main class="shell ${journalStyles.journal}" dir="${locale === "ar" ? "rtl" : "ltr"}">${html}</main></body></html>`);
  }
} finally { await server.close(); }



