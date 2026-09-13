/**
 * Baut Favicon, Apple-Touch-Icon und die Open-Graph-Karten.
 *
 *   node scripts/build-images.mjs
 *
 * Alles darin kommt aus der Marke des Betriebs: das EK-Zeichen aus der
 * Vektorfassung des Logos (`scripts/brand/logo-source.svg`, von kasel.lu),
 * die Hausfarbe #0077B3, und ein Foto aus der eigenen Halle.
 *
 * Die Schrift für die Rasterung liegt unter `scripts/fonts/Archivo.ttf` (OFL)
 * und wird über eine eigene fontconfig-Datei eingebunden. Der Rasterer
 * erreicht bei einer Variable-Schrift nur die Instanzen Regular und Bold.
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const PUB = join(ROOT, 'public');
const IMG = join(PUB, 'img');

const C = {
  blue: '#0077B3',
  blueLight: '#4DA6D4',
  ink: '#1C2126',
  paper: '#FFFFFF',
  greyLight: '#9BA3A9',
};

/* ── Fontconfig ─────────────────────────────────────────────────────────── */
const FCDIR = join(HERE, '.fontcache');
mkdirSync(FCDIR, { recursive: true });
writeFileSync(
  join(FCDIR, 'fonts.conf'),
  `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig><dir>${join(HERE, 'fonts')}</dir><cachedir>${join(FCDIR, 'cache')}</cachedir></fontconfig>`,
);
process.env.FONTCONFIG_FILE = join(FCDIR, 'fonts.conf');
const FF = 'Archivo, Helvetica, Arial, sans-serif';

/* ── Logo ───────────────────────────────────────────────────────────────────
   Die blauen Bestandteile trugen im Original die Klasse `st0`.
   Blöcke (gemessen): EK 0–137 · kasel.lu 152–195 · Tagline 204–218. */
const logoSrc = readFileSync(join(HERE, 'brand', 'logo-source.svg'), 'utf8');
const logoBody = logoSrc
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .replace(/<style[\s\S]*?<\/style>/, '');

/** @param {{h:number, fg:string, accent:string, variant?:'full'|'wordmark'|'mark'}} o */
function logo({ h, fg, accent, variant = 'full' }) {
  const boxH = { full: 218.15, wordmark: 196, mark: 138 }[variant];
  const w = (172.372 / boxH) * h;
  return {
    w: Math.round(w),
    h,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(w)}" height="${h}" viewBox="0 0 172.372 ${boxH}"><g fill="${fg}">${logoBody.replace(/class="st0"/g, `fill="${accent}"`)}</g></svg>`,
  };
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Grobe Zeilenumbrüche. Archivo Bold ≈ 0.53 em mittlere Laufweite. */
function wrap(text, fontSize, maxWidth, maxLines = 4) {
  const max = Math.floor(maxWidth / (fontSize * 0.53));
  const lines = [];
  let cur = '';
  for (const word of text.split(' ')) {
    const next = cur ? `${cur} ${word}` : word;
    if (next.length > max && cur) { lines.push(cur); cur = word; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

/* ── ICO mit PNG-Inhalt (von jedem modernen Browser unterstützt) ────────── */
function ico(png) {
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
  head.writeUInt8(32, 6); head.writeUInt8(32, 7);
  head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
  head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
  return Buffer.concat([head, png]);
}

async function main() {
  mkdirSync(IMG, { recursive: true });

  /* ── Favicon: das EK-Zeichen, weiß auf der Hausfarbe ───────────────────
     Weiß auf Blau, weil das Zeichen im Tab bei 16 px sonst in der weißen
     Browserleiste verschwindet. Die Wortmarke ist bei der Größe ohnehin
     nicht lesbar und bleibt weg. */
  /* Ein verschachteltes <svg> beschneidet auf seinen eigenen viewPort — nur so
     bleibt wirklich das EK-Zeichen übrig. Ein scale() allein würde die
     Wortmarke mitziehen und sie als Schmiererei unter dem Zeichen abbilden. */
  const MARK_H = 138, MARK_W = 172.372;
  const h = 34, w = (MARK_W / MARK_H) * h;
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="10" fill="${C.blue}"/>
  <svg x="${((64 - w) / 2).toFixed(2)}" y="${((64 - h) / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${h}" viewBox="0 0 ${MARK_W} ${MARK_H}">
    <g fill="${C.paper}">${logoBody.replace(/class="st0"/g, `fill="${C.paper}"`)}</g>
  </svg>
</svg>`;
  writeFileSync(join(PUB, 'favicon.svg'), faviconSvg);

  const fav = Buffer.from(faviconSvg);
  writeFileSync(join(PUB, 'favicon.ico'), ico(await sharp(fav).resize(32, 32).png().toBuffer()));
  await sharp(fav).resize(180, 180).png().toFile(join(PUB, 'apple-touch-icon.png'));

  /* ── Open-Graph-Karten: Foto links, Aussage rechts ─────────────────────── */
  const W = 1200, H = 630;
  const photo = join(ROOT, 'src', 'content', 'photos', 'produkte_6.jpg');
  const hasPhoto = existsSync(photo);
  const PHOTO_W = 470;

  const claims = {
    lb: 'Dräi Betriber a Lëtzebuerg stinn als Produzent am ISPM-15-Register. Mir sinn een dovun.',
    de: 'Drei Betriebe in Luxemburg stehen als Hersteller im ISPM-15-Register. Wir sind einer davon.',
    fr: 'Trois entreprises au Luxembourg figurent comme producteurs au registre NIMP 15. Nous en sommes une.',
    en: 'Three companies in Luxembourg are listed as producers in the ISPM 15 register. We are one of them.',
  };
  const country = { lb: 'Lëtzebuerg', de: 'Luxemburg', fr: 'Luxembourg', en: 'Luxembourg' };

  for (const [lang, claim] of Object.entries(claims)) {
    const PAD = 56;
    const textX = PHOTO_W + PAD;
    const colW = W - textX - PAD;
    const lines = wrap(claim, 40, colW, 4);
    const startY = 300 - (lines.length - 1) * 25;
    const lock = logo({ h: 116, fg: C.ink, accent: C.blue, variant: 'wordmark' });

    const card = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.paper}"/>
  <rect x="${PHOTO_W}" y="0" width="6" height="${H}" fill="${C.blue}"/>
  <g transform="translate(${textX} ${PAD})">${lock.svg}</g>
  <g font-family="${FF}" fill="${C.ink}">
    ${lines.map((l, i) => `<text x="${textX}" y="${startY + i * 50}" font-size="40" font-weight="700">${esc(l)}</text>`).join('')}
    <text x="${textX}" y="${H - PAD}" font-size="23" font-weight="400" fill="#6B7379">12, Zone Industrielle · L-9166 Mertzig · ${esc(country[lang])}</text>
  </g>
</svg>`;

    let img = sharp(Buffer.from(card));
    if (hasPhoto) {
      const strip = await sharp(photo).resize(PHOTO_W, H, { fit: 'cover', position: 'centre' }).toBuffer();
      img = sharp(await img.png().toBuffer()).composite([{ input: strip, left: 0, top: 0 }]);
    }
    // JPEG statt PNG: die Karte enthält ein Foto, als PNG wären es 680 KB.
    await img.jpeg({ quality: 84, mozjpeg: true }).toFile(join(IMG, `og-${lang}.jpg`));
  }

  console.log(`Favicon, Apple-Touch-Icon und vier OG-Karten gebaut${hasPhoto ? ' (mit Hallenfoto)' : ' (ohne Foto)'}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
