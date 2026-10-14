// Usage: node scripts/export.mjs [slug...]
// public/projects/<slug>/index.html -> exports/<slug>/<slug>.pdf + <slug>-<n>.png (one per PDF page)
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectsDir = path.join(root, 'public', 'projects');
const pdfjsDir = path.join(root, 'node_modules', 'pdfjs-dist');
const SCALE = 2.5; // 72pt * 2.5 = 180 DPI
const ORIGIN = 'http://export.local'; // fake origin so pdf.js can load as ES module + worker

let slugs = process.argv.slice(2);
if (!slugs.length) {
  slugs = fs.existsSync(projectsDir)
    ? fs.readdirSync(projectsDir).filter((d) => fs.existsSync(path.join(projectsDir, d, 'index.html')))
    : [];
}
if (!slugs.length) {
  console.log('No projects found under public/projects.');
  process.exit(0);
}

let browser;
try {
  browser = await chromium.launch({ channel: 'chrome' });
} catch (e) {
  console.warn(`Chrome launch failed (${e.message.split('\n')[0]}), trying msedge`);
  browser = await chromium.launch({ channel: 'msedge' });
}

let failed = 0;
try {
  for (const slug of slugs) {
    try {
      await exportSlug(slug);
    } catch (e) {
      failed++;
      console.error(`${slug}: FAILED - ${e.message}`);
    }
  }
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);

async function exportSlug(slug) {
  const html = path.join(projectsDir, slug, 'index.html');
  if (!fs.existsSync(html)) throw new Error(`missing ${html}`);
  const outDir = path.join(root, 'exports', slug);
  fs.mkdirSync(outDir, { recursive: true });
  const pdfPath = path.join(outDir, `${slug}.pdf`);

  // 1. HTML -> PDF
  const page = await browser.newPage();
  try {
    await page.goto(pathToFileURL(html).href, { waitUntil: 'load' });
    const broken = await page.evaluate(async () => {
      await document.fonts.ready;
      // src 없는 img(확대용 <dialog> 안의 빈 img)는 제외
      const imgs = [...document.images].filter((img) => img.getAttribute('src'));
      const results = await Promise.all(imgs.map((img) => img.decode().then(() => null, () => img.getAttribute('src'))));
      return results.filter(Boolean);
    });
    if (broken.length) throw new Error(`broken images: ${broken.join(', ')}`);
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, preferCSSPageSize: true });
  } finally {
    await page.close();
  }

  // 2. PDF -> PNG per page, rendered by pdf.js inside the browser
  const pdfBytes = fs.readFileSync(pdfPath);
  const ctx = await browser.newContext();
  await ctx.route(`${ORIGIN}/**`, (route) => {
    const p = decodeURIComponent(new URL(route.request().url()).pathname);
    if (p === '/') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><body></body>' });
    if (p === '/doc.pdf') return route.fulfill({ contentType: 'application/pdf', body: pdfBytes });
    const file = path.join(pdfjsDir, p);
    if (!file.startsWith(pdfjsDir) || !fs.existsSync(file)) return route.fulfill({ status: 404 });
    const type = file.endsWith('.mjs') ? 'text/javascript' : 'application/octet-stream';
    return route.fulfill({ contentType: type, body: fs.readFileSync(file) });
  });
  const viewer = await ctx.newPage();
  await viewer.goto(`${ORIGIN}/`);
  const dataUrls = await viewer.evaluate(async (scale) => {
    const pdfjs = await import('/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = '/legacy/build/pdf.worker.mjs';
    const doc = await pdfjs.getDocument({
      url: '/doc.pdf',
      cMapUrl: '/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: '/standard_fonts/',
    }).promise;
    const out = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const pg = await doc.getPage(i);
      const vp = pg.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(vp.width);
      canvas.height = Math.ceil(vp.height);
      const c = canvas.getContext('2d');
      c.fillStyle = '#fff';
      c.fillRect(0, 0, canvas.width, canvas.height);
      await pg.render({ canvas, canvasContext: c, viewport: vp }).promise;
      out.push(canvas.toDataURL('image/png'));
    }
    return out;
  }, SCALE);
  await ctx.close();

  for (const f of fs.readdirSync(outDir)) {
    if (new RegExp(`^${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d+\\.png$`).test(f)) fs.unlinkSync(path.join(outDir, f));
  }
  const pngs = dataUrls.map((d, i) => {
    const p = path.join(outDir, `${slug}-${i + 1}.png`);
    fs.writeFileSync(p, Buffer.from(d.split(',')[1], 'base64'));
    return path.relative(root, p);
  });
  console.log(`${slug}: ${pngs.length} page(s) -> ${path.relative(root, pdfPath)}, ${pngs.join(', ')}`);
}
