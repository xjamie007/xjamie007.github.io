/**
 * Préift déi gebaute Säit géint d'Regelen, déi fir dëst Projet gëllen.
 *
 *   npm run build && npm run verify
 *
 * Dat hei ass d'Iwwergabsgeriicht. Wat hei duerchfält, geet net live.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

let fails = 0, warns = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { fails++; console.log(`  ✗ ${m}`); };
const warn = (m) => { warns++; console.log(`  ! ${m}`); };
const head = (m) => console.log(`\n${m}\n${'─'.repeat(76)}`);

if (!existsSync(DIST)) {
  console.error('Kee dist/ — fir d\'éischt `npm run build`.');
  process.exit(1);
}

function walk(dir, ext, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, ext, out);
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}
const pages = walk(DIST, '.html');
const rel = (p) => relative(DIST, p);

/* ── 1 · Keng rout a keng orange Faarf ─────────────────────────────────────
   ISPM 15 reservéiert Rout an Orange fir d'Kennzeechnung vu Gefaargutt.
   Dës Säit hält sech un hir eege Norm — an dat gëtt gemooss, net behaapt. */
head('1 · Faarwen: kee Rout, keen Orange');
const toHsl = (hex) => {
  const n = hex.length === 4
    ? [1, 2, 3].map((i) => parseInt(hex[i] + hex[i], 16))
    : [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [r, g, b] = n.map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (mx + mn) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s, l };
};
const cssFiles = [...walk(DIST, '.css'), ...pages];
const offenders = new Set();
for (const f of cssFiles) {
  const text = readFileSync(f, 'utf8');
  for (const hex of text.match(/#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g) ?? []) {
    const { h, s, l } = toHsl(hex);
    // Rout a Orange: 0–42° an 345–360°, mat genuch Sättegung an Hellegkeet.
    if (s >= 0.2 && l > 0.12 && l < 0.9 && (h <= 42 || h >= 345)) offenders.add(`${hex} (${Math.round(h)}°) — ${rel(f)}`);
  }
}
if (offenders.size === 0) ok('keng rout oder orange Faarfwäerter am CSS an HTML');
else for (const o of offenders) bad(`rout/orange: ${o}`);
ok('Hausfarbe #0077B3 = 200° (Blau) — weit außerhalb des Rot-/Orangebereichs');

/* ── 1b · Kontrast der dokumentierten Paare ──────────────────────────────── */
head('1b · Kontrast (WCAG 2.2 AA: 4.5:1 Text, 3:1 groß/UI)');
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const PAIRS = [
  ['Fließtext auf Weiß', '#1C2126', '#FFFFFF', 4.5],
  ['Fließtext auf Mist', '#1C2126', '#F4F7F9', 4.5],
  ['Weiß auf Ink', '#FFFFFF', '#1C2126', 4.5],
  ['Sekundärtext auf Weiß', '#6B7379', '#FFFFFF', 4.5],
  ['Sekundärtext auf Ink', '#9BA3A9', '#1C2126', 4.5],
  ['Link/Akzent auf Weiß', '#00598A', '#FFFFFF', 4.5],
  ['Akzent auf Ink', '#4DA6D4', '#1C2126', 4.5],
  ['Button: Weiß auf Blau', '#FFFFFF', '#0077B3', 4.5],
  ['Fokusring auf Weiß', '#0077B3', '#FFFFFF', 3],
  ['Fokusring auf Ink', '#4DA6D4', '#1C2126', 3],
  // Der blaue Schimmer im dunklen Band: Ink, zu 24 % mit der Hausfarbe
  // gemischt — der dunkelste Punkt, auf dem noch weißer Text steht.
  ['Weiß auf Ink + Schimmer', '#FFFFFF', '#153648', 4.5],
];
for (const [name, fg, bg, min] of PAIRS) {
  const r = ratio(fg, bg);
  r >= min ? ok(`${name}: ${r.toFixed(2)}:1`) : bad(`${name}: ${r.toFixed(2)}:1 — unter ${min}:1`);
}

/* ── 2 · Iwwersetzungen ─────────────────────────────────────────────────── */
head('2 · Iwwersetzungen: véier Sproochen, deckungsgläich');
const dicts = ['lb', 'de', 'fr', 'en'].map((l) => [l, JSON.parse(readFileSync(join(ROOT, `src/i18n/${l}.json`), 'utf8'))]);
const keysOf = (o, p = '', out = []) => {
  for (const [k, v] of Object.entries(o)) {
    const kk = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v) && !('value' in v && 'reviewed' in v)) keysOf(v, kk, out);
    else out.push(kk);
  }
  return out;
};
const base = new Set(keysOf(dicts[0][1]));
let drift = 0;
for (const [l, d] of dicts) {
  const s = new Set(keysOf(d));
  const missing = [...base].filter((k) => !s.has(k));
  const extra = [...s].filter((k) => !base.has(k));
  if (missing.length || extra.length) { drift++; bad(`${l}: ${missing.length} feelen, ${extra.length} ze vill — ${[...missing, ...extra].slice(0, 3).join(', ')}`); }
}
if (!drift) ok(`all véier Sproochen hunn déiselwecht ${base.size} Schlësselen`);

const unreviewed = (() => {
  let n = 0;
  const w = (x) => {
    if (x && typeof x === 'object' && 'reviewed' in x) { if (!x.reviewed) n++; return; }
    if (x && typeof x === 'object') Object.values(x).forEach(w);
  };
  w(dicts[0][1]);
  return n;
})();
if (unreviewed) warn(`${unreviewed} lëtzebuergesch Anträg nach net vun engem Mammesproochler gelies (npm run lb:review)`);
else ok('all lëtzebuergesch Anträg gepréift');

/* ── 3 · Meta-Längten ───────────────────────────────────────────────────── */
head('3 · Title 50–60, Description 150–160 (ausser noindex)');
let metaBad = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  if (/name="robots" content="noindex/.test(html)) continue;
  if (rel(p) === 'index.html') continue; // Wuerzel leet nëmmen ëm
  const title = (html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? '';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) ?? [])[1] ?? '';
  const tl = [...title].length, dl = [...desc].length;
  if (tl < 50 || tl > 60 || dl < 150 || dl > 160) { metaBad++; bad(`${rel(p)}: title ${tl}, description ${dl}`); }
}
if (!metaBad) ok(`${pages.length} Säiten am Zilberäich`);

/* ── 4 · hreflang, canonical, eng eenzeg h1 ─────────────────────────────── */
head('4 · hreflang, canonical, Iwwerschrëftenhierarchie');
let seoBad = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  const r = rel(p);
  if (r === '404.html') continue;
  const alts = (html.match(/rel="alternate" hreflang="/g) ?? []).length;
  if (alts !== 5) { seoBad++; bad(`${r}: ${alts} hreflang-Linken (erwaart 5 mat x-default)`); }
  if (!/rel="canonical"/.test(html)) { seoBad++; bad(`${r}: kee canonical`); }
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) { seoBad++; bad(`${r}: ${h1} <h1> (erwaart genee 1)`); }
}
if (!seoBad) ok(`${pages.length - 1} Säiten mat 5 hreflang, canonical an enger <h1>`);

/* ── 5 · Alt-Texter a Formularlabelen ───────────────────────────────────── */
head('5 · Barrierefräiheet: alt, label, lang');
let a11yBad = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  const r = rel(p);
  for (const img of html.match(/<img\b[^>]*>/g) ?? []) {
    if (!/\balt=/.test(img)) { a11yBad++; bad(`${r}: <img> ouni alt — ${img.slice(0, 70)}`); }
  }
  if (!/<html lang="(lb|de|fr|en)"/.test(html)) { a11yBad++; bad(`${r}: <html lang> feelt oder ass falsch`); }
  // All SVG, dat Informatioun dréit, brauch role="img" plus Numm
  for (const svg of html.match(/<svg\b[^>]*>/g) ?? []) {
    if (/role="img"/.test(svg) && !/aria-label|aria-labelledby|aria-hidden/.test(svg)) {
      a11yBad++; bad(`${r}: <svg role="img"> ouni Numm`);
    }
  }
}
if (!a11yBad) ok('all Biller mat alt, all lang gesat, all SVG benannt');

/* ── 6 · Kaputt intern Linken an Anker ──────────────────────────────────── */
head('6 · Keng dout Linken, keng dout Anker');
const hrefs = new Map();
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"#]*)(#[^"]*)?"/g)) {
    const path = m[1];
    if (/^\/(fonts|img|favicon|apple-touch)/.test(path)) continue;
    const target = join(DIST, path.endsWith('/') ? path + 'index.html' : path);
    if (!existsSync(target)) hrefs.set(`${rel(p)} → ${path}`, true);
  }
  for (const m of html.matchAll(/href="#([A-Za-z0-9_-]+)"/g)) {
    if (!new RegExp(`id="${m[1]}"`).test(html)) hrefs.set(`${rel(p)} → #${m[1]} (Anker net op der Säit)`, true);
  }
}
if (hrefs.size === 0) ok('all intern Linken an Anker fannen hiert Zil');
else for (const h of hrefs.keys()) bad(`dout: ${h}`);

/* ── 7 · JavaScript-Budget ──────────────────────────────────────────────── */
head('7 · JavaScript < 100 KB komprimiert');
const js = walk(DIST, '.js');
const total = js.reduce((n, f) => n + gzipSync(readFileSync(f)).length, 0);
const kb = (total / 1024).toFixed(1);
if (total < 100 * 1024) ok(`${kb} KB gzip iwwer ${js.length} Dateien`);
else bad(`${kb} KB gzip — iwwer dem Budget`);

/* ── 8 · Formular-Endpunkt ─────────────────────────────────────────────────
   Sucht den Platzhalter selbst, nicht eine bestimmte Formular-ID. Die ID kann
   sich ändern — dann meldete der Test stillschweigend „alles gut", und genau
   das ist einmal passiert. */
head('8 · Formular schickt irgendwohin');
const PLACEHOLDER = 'CHANGE-ME.supabase.co';
const withForm = pages.filter((p) => /<form[^>]+method="post"/.test(readFileSync(p, 'utf8')));
const placeholder = pages.filter((p) => readFileSync(p, 'utf8').includes(PLACEHOLDER));
if (!withForm.length) bad('keine einzige Seite enthält ein Formular — das kann nicht stimmen');
else if (placeholder.length) bad(`${placeholder.length} Seiten tragen noch den Platzhalter-Endpunkt — PUBLIC_INQUIRY_ENDPOINT setzen`);
else ok(`${withForm.length} Seiten mit Formular, Endpunkt gesetzt`);

/* ── 9 · Keng Schlësselen am Build ──────────────────────────────────────── */
head('9 · Keng Zougangsdaten am Build');
// Op WÄERTER préiwen, net op Wierder: e React-Bundel enthält „password" als
// Attributnumm, an dat ass kee Geheimnis.
const secrets = [
  /(?:api[_-]?key|secret|service[_-]?role|access[_-]?token|client[_-]?secret)["']?\s*[:=]\s*["'][A-Za-z0-9_\-.]{16,}["']/i,
  /BEGIN [A-Z ]*PRIVATE KEY/,
  /\bsk_live_[A-Za-z0-9]{10,}/,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./,
];
let leaked = 0;
for (const p of [...pages, ...js]) {
  const t = readFileSync(p, 'utf8');
  const hit = secrets.find((re) => re.test(t));
  if (hit) { leaked++; bad(`méiglech Geheimnis am Build: ${rel(p)} — ${String(hit).slice(0, 40)}`); }
}
if (!leaked) ok('keng Schlësselen oder Passwierder am ausgeliwwerten Code');

/* ── 10 · Sitemap a robots ──────────────────────────────────────────────── */
head('10 · Sitemap, robots.txt, Favicon, OG-Biller');
for (const f of ['sitemap-index.xml', 'sitemap-0.xml', 'robots.txt', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) {
  existsSync(join(DIST, f)) ? ok(f) : bad(`${f} feelt`);
}
for (const l of ['lb', 'de', 'fr', 'en']) {
  existsSync(join(DIST, `img/og-${l}.jpg`)) ? ok(`img/og-${l}.jpg`) : bad(`img/og-${l}.jpg feelt`);
}
const locs = (readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8').match(/<loc>/g) ?? []).length;
locs === 40 ? ok(`${locs} URLen an der Sitemap (10 Säiten × 4 Sproochen)`) : warn(`${locs} URLen an der Sitemap — erwaart 40`);

/* ── Ofschloss ──────────────────────────────────────────────────────────── */
console.log(`\n${'═'.repeat(76)}`);
if (fails === 0) console.log(`Alles duerch. ${warns} Hiweis${warns === 1 ? '' : 'er'}.\n`);
else console.log(`${fails} Feeler, ${warns} Hiweiser.\n`);
process.exit(fails ? 1 : 0);
