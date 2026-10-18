// Usage: node scripts/i18n.mjs <extract|check|build> [slug...]
// public/projects/<slug>/*.html (한국어 원본) <-> i18n/strings.csv -> public/projects/<slug>/<lang>/*.html
import { chromium } from 'playwright-core';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectsDir = path.join(root, 'public', 'projects');
const csvPath = path.join(root, 'i18n', 'strings.csv');
const jsonPath = path.join(root, 'app', 'strings.generated.json');
const COLS = ['key', 'page', 'ko', 'en', 'ja', 'zh', 'note'];
const LANGS = { en: 'en', ja: 'ja', zh: 'zh-CN' }; // 폴더 -> <html lang>
const SVG_NOTE = '도식 라벨 — 짧게';

// ---- CSV (RFC 4180) ----
export function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c !== '"') f += c;
      else if (text[i + 1] === '"') { f += '"'; i++; }
      else if (i + 1 < text.length && !',\r\n'.includes(text[i + 1])) throw new Error(`CSV: text after closing quote near: ${f.slice(-40)}`);
      else q = false;
    } else if (c === '"') {
      if (f) throw new Error(`CSV: quote inside unquoted field near: ${f.slice(-40)}`);
      q = true;
    }
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(f); rows.push(row); row = []; f = '';
    } else f += c;
  }
  if (q) throw new Error('CSV: unclosed quote');
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}
export function writeCsv(rows) {
  const cell = (v = '') => (/[",\r\n]|^\s|\s$/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}

const sha = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const pageSlug = (p) => p.split('/')[0];
// 태그는 속성까지 원문과 완전히 같아야 한다 (번역문이 innerHTML로 들어가므로 on*= / javascript: 주입 차단)
const tags = (s) => (s.match(/<[^>]*>/g) || []).sort().join(' ');

function readCsv() {
  if (!fs.existsSync(csvPath)) return { bom: false, raw: [], rows: [] };
  const text = fs.readFileSync(csvPath, 'utf8');
  const [header, ...raw] = parseCsv(text);
  if (header.length !== COLS.length || header.some((h, i) => h !== COLS[i])) throw new Error(`CSV header must be: ${COLS.join(',')}`);
  const rows = raw.filter((r) => r.length === COLS.length).map((r) => Object.fromEntries(COLS.map((c, i) => [c, r[i]])));
  return { bom: text.charCodeAt(0) === 0xfeff, raw, rows };
}

// 원본 파일 목록: { slug, file, page }
function sources(slugs) {
  const all = fs.existsSync(projectsDir) ? fs.readdirSync(projectsDir) : [];
  for (const s of slugs) if (!all.includes(s)) throw new Error(`unknown slug: ${s}`);
  return (slugs.length ? slugs : all).flatMap((slug) => {
    const dir = path.join(projectsDir, slug);
    if (!fs.statSync(dir).isDirectory()) return [];
    return fs.readdirSync(dir).filter((f) => f.endsWith('.html')).sort()
      .map((file) => ({ slug, file, page: `${slug}/${file.slice(0, -5)}` }));
  });
}

// 브라우저 안에서 실행: 문구 수집 (opts.map 이 있으면 번역 치환 + 경로/lang 처리까지)
function pageFn(opts) {
  const H = /[가-힣]/, out = [], map = opts && opts.map;
  const seg = (ko, svg, set) => {
    out.push({ ko, svg });
    if (!map) return;
    if (!(ko in map)) throw new Error(`no translation for: ${ko.slice(0, 60)}`);
    set(map[ko]);
  };
  const walk = (el) => {
    const name = el.localName;
    if (name === 'script' || name === 'style' || name === 'template') return;
    const svg = !!el.closest('svg');
    const attrs = ['alt', 'title', 'aria-label', 'placeholder', 'data-label']; // data-label: CSS attr()로 화면에 표시됨
    if (name === 'meta' && el.getAttribute('name') === 'description') attrs.push('content');
    for (const a of attrs) {
      const v = el.getAttribute(a);
      if (v && H.test(v)) seg(v.trim(), svg, (t) => el.setAttribute(a, t));
    }
    if ([...el.childNodes].some((n) => n.nodeType === 3 && H.test(n.data))) {
      return seg(el.innerHTML.trim(), svg, (t) => (el.innerHTML = t));
    }
    for (const c of el.children) walk(c);
  };
  walk(document.documentElement);
  if (!map) return out;

  document.documentElement.lang = opts.lang;
  // 상대경로 -> ../ (같은 slug의 형제 페이지 링크는 번역본끼리 연결되도록 유지)
  for (const el of document.querySelectorAll('[src], [href], [*|href]')) {
    for (const a of ['src', 'href', 'xlink:href']) {
      const v = el.getAttribute(a);
      if (!v || /^(#|\/|data:|mailto:|[a-z][a-z0-9+.-]*:)/i.test(v)) continue;
      const file = v.split('#')[0];
      const sibling = file === './' || opts.siblings.includes(file);
      if (sibling && !el.hasAttribute('hreflang')) continue;
      el.setAttribute(a, v === '../../' ? `../../../${opts.folder}/` : `../${v}`);
    }
  }
  for (const a of document.querySelectorAll('a[hreflang]')) {
    a.removeAttribute('aria-current');
    if (a.getAttribute('hreflang') === opts.folder) a.setAttribute('aria-current', 'page');
  }
  return '<!doctype html>\n' + document.documentElement.outerHTML;
}

async function withBrowser(fn) {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome' });
  } catch (e) {
    console.warn(`Chrome launch failed (${e.message.split('\n')[0]}), trying msedge`);
    browser = await chromium.launch({ channel: 'msedge' });
  }
  try {
    const ctx = await browser.newContext({ javaScriptEnabled: false }); // 인라인 스크립트가 DOM을 바꾸지 않게
    return await fn(async (src, opts) => {
      const page = await ctx.newPage();
      try {
        await page.goto(pathToFileURL(path.join(projectsDir, src.slug, src.file)).href, { waitUntil: 'domcontentloaded' });
        return await page.evaluate(pageFn, opts);
      } finally {
        await page.close();
      }
    });
  } finally {
    await browser.close();
  }
}

// 원본에서 문구 수집: Map key -> { ko, svg, pages: Map page -> 등장 순서 }
async function collect(srcs) {
  const segs = new Map();
  await withBrowser(async (run) => {
    for (const src of srcs) {
      (await run(src)).forEach(({ ko, svg }, i) => {
        const key = sha(ko);
        const s = segs.get(key) || segs.set(key, { ko, svg, pages: new Map() }).get(key);
        if (!s.pages.has(src.page)) s.pages.set(src.page, i);
      });
    }
  });
  return segs;
}

async function extract(slugs) {
  const srcs = sources(slugs);
  const segs = await collect(srcs);
  const mine = (p) => p !== 'home' && (!slugs.length || slugs.includes(pageSlug(p)));
  const { raw, rows } = readCsv();
  // 깨진 행이 있으면 다시 쓰지 않는다 (번역 유실 방지)
  const bad = raw.findIndex((r) => r.length !== COLS.length);
  if (bad >= 0) return fail([`line ${bad + 2}: ${raw[bad].length} columns, expected ${COLS.length} — fix the CSV first (nothing written)`]);
  let removed = 0, added = 0;
  const out = [];
  rows.forEach((r, idx) => {
    if (r.page === 'home') return out.push({ r, page: '', idx: -1 });
    const s = segs.get(r.key);
    const pages = [...new Set([...r.page.split('; ').filter((p) => p && !mine(p)), ...(s ? s.pages.keys() : [])])].sort();
    if (!pages.length) return removed++;
    r.page = pages.join('; ');
    out.push({ r, page: pages[0], idx: s?.pages.get(pages[0]) ?? 1e6 + idx });
  });
  const known = new Set(rows.map((r) => r.key));
  for (const [key, s] of segs) {
    if (known.has(key)) continue;
    added++;
    const pages = [...s.pages.keys()].sort();
    out.push({ r: { key, page: pages.join('; '), ko: s.ko, en: '', ja: '', zh: '', note: s.svg ? SVG_NOTE : '' }, page: pages[0], idx: s.pages.get(pages[0]) });
  }
  // home 먼저(기존 순서), 그다음 page 알파벳 -> 문서 순서
  out.sort((a, b) => (a.page === b.page ? a.idx - b.idx : a.page < b.page ? -1 : 1));
  const final = out.map((o) => o.r);
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, writeCsv([COLS, ...final.map((r) => COLS.map((c) => r[c]))]));
  const untranslated = final.filter((r) => !r.en || !r.ja || !r.zh).length;
  console.log(`extract: added ${added}, removed ${removed}, total ${final.length}, untranslated ${untranslated} -> ${path.relative(root, csvPath)}`);
}

async function check() {
  if (!fs.existsSync(csvPath)) return fail([`missing ${path.relative(root, csvPath)} — run: npm run i18n -- extract`]);
  const { bom, raw, rows } = readCsv();
  const errs = [];
  if (!bom) errs.push('file: missing UTF-8 BOM');
  raw.forEach((r, i) => r.length !== COLS.length && errs.push(`line ${i + 2} (${r[0]}): ${r.length} columns, expected ${COLS.length}`));
  const seen = new Set();
  for (const r of rows) {
    if (seen.has(r.key)) errs.push(`${r.key} [${r.page}]: duplicate key`);
    seen.add(r.key);
    if (r.page !== 'home' && r.key !== sha(r.ko)) errs.push(`${r.key} [${r.page}]: ko was edited in the CSV — edit the HTML source and run extract instead`);
    for (const l of Object.keys(LANGS)) {
      if (!r[l]) errs.push(`${r.key} [${r.page}]: empty ${l}`);
      else if (tags(r[l]) !== tags(r.ko)) errs.push(`${r.key} [${r.page}]: ${l} tags differ (ko: ${tags(r.ko) || '-'} / ${l}: ${tags(r[l]) || '-'})`);
    }
  }
  const segs = await collect(sources([]));
  const keys = new Set(rows.map((r) => r.key));
  let stale = 0;
  for (const [key, s] of segs) if (!keys.has(key)) stale++, errs.push(`${key} [${[...s.pages.keys()].join('; ')}]: stale — not in CSV`);
  for (const r of rows) if (r.page !== 'home' && !segs.has(r.key)) stale++, errs.push(`${r.key} [${r.page}]: stale — not in sources`);
  if (stale) errs.push('CSV is out of sync with sources — run: npm run i18n -- extract');
  if (errs.length) return fail(errs);
  console.log(`check: OK — ${rows.length} rows, ${Object.keys(LANGS).join('/')} complete`);
  return rows;
}

function fail(errs) {
  console.error(errs.join('\n'));
  console.error(`check: FAILED (${errs.length} issue(s))`);
  process.exit(1);
}

async function build(slugs) {
  const rows = await check();
  const home = Object.fromEntries(rows.filter((r) => r.page === 'home').map((r) => [r.key, { ko: r.ko, en: r.en, ja: r.ja, zh: r.zh }]));
  fs.writeFileSync(jsonPath, JSON.stringify(home, null, 2) + '\n');
  const maps = Object.fromEntries(Object.keys(LANGS).map((l) => [l, Object.fromEntries(rows.map((r) => [r.ko, r[l]]))]));
  const srcs = sources(slugs);
  await withBrowser(async (run) => {
    for (const slug of [...new Set(srcs.map((s) => s.slug))]) {
      const mineSrcs = srcs.filter((s) => s.slug === slug);
      const siblings = mineSrcs.map((s) => s.file);
      for (const [folder, lang] of Object.entries(LANGS)) {
        const dir = path.join(projectsDir, slug, folder);
        fs.rmSync(dir, { recursive: true, force: true });
        fs.mkdirSync(dir);
        for (const src of mineSrcs) fs.writeFileSync(path.join(dir, src.file), await run(src, { map: maps[folder], lang, folder, siblings }));
      }
      console.log(`${slug}: ${siblings.length} page(s) x ${Object.keys(LANGS).join('/')}`);
    }
  });
}

const [cmd, ...slugs] = process.argv.slice(2);
const cmds = { extract, check, build };
if (!cmds[cmd]) {
  console.error('Usage: node scripts/i18n.mjs <extract|check|build> [slug...]');
  process.exit(1);
}
await cmds[cmd](slugs);
