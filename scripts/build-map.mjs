/**
 * Baut d'statesch Kaart fir d'Säit „Liwwerung & Ofholung" an d'Kontaktsäit.
 *
 * Firwat en eegent Bild an net e Google-Maps-Embed: e stëlle Embed lued
 * Schrëften, Skripter a Cookien vun engem Drëttland, ier de Besucher
 * iergendeppes zougestëmmt huet. D'Kaart hei läit als Datei am Projet — beim
 * Opruff geet keng eenzeg Ufro no baussen.
 *
 * D'Kacheln koumen eemol vun tile.openstreetmap.org (Zoom 17) a leien ënner
 * `scripts/tiles/`. D'Bild gëtt duerno an d'Projektpalette gelueden: dat ass
 * net nëmme Gestaltung — d'OSM-Standardstil molt Haaptstroossen a Rout an
 * Orange, an dës Faarwe komme laut ISPM 15 op dëser Säit net vir.
 *
 * Nei bauen:  node scripts/build-map.mjs
 * Attributioun „© OpenStreetMap contributors" steet an der Bildënnerschrëft
 * an ass verflicht.
 */
import sharp from 'sharp';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TILES = join(HERE, 'tiles');
const OUT = join(HERE, '..', 'public', 'img');

const Z = 17;
const X0 = 67724, Y0 = 44543, COLS = 4, ROWS = 3;
const LAT = 49.8374458, LON = 6.0153778; // OSM, Hausnummer-Niveau

const CROP = { left: 64, top: 14, width: 960, height: 640 };
const MARK = { x: 482, y: 320 };

// Meter pro Pixel op dëser Breet an dësem Zoom
const MPP = (156543.03392 * Math.cos((LAT * Math.PI) / 180)) / 2 ** Z;
const SCALE_M = 200;
const SCALE_PX = Math.round(SCALE_M / MPP);

const lerp = (a, b, t) => a + (b - a) * t;
const RAMP = { light: [0xf3, 0xed, 0xdd], dark: [0x2a, 0x22, 0x1b] };

async function main() {
  if (!existsSync(TILES)) {
    console.error('Keng Kacheln ënner scripts/tiles/ — kuck de Kommentar uewen.');
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });

  const composites = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      composites.push({
        input: readFileSync(join(TILES, `${X0 + c}_${Y0 + r}.png`)),
        left: c * 256,
        top: r * 256,
      });
    }
  }

  const stitched = await sharp({
    create: { width: COLS * 256, height: ROWS * 256, channels: 3, background: '#ffffff' },
  })
    .composite(composites)
    .png()
    .toBuffer();

  // Graustufe → Rampe an d'Palette. Kee Rout, keen Orange bleift iwwreg.
  const { data, info } = await sharp(stitched)
    .extract(CROP)
    .grayscale()
    .linear(1.08, -10)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const tinted = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0, p = 0; i < data.length; i += info.channels, p += 3) {
    const t = data[i] / 255;
    tinted[p] = lerp(RAMP.dark[0], RAMP.light[0], t);
    tinted[p + 1] = lerp(RAMP.dark[1], RAMP.light[1], t);
    tinted[p + 2] = lerp(RAMP.dark[2], RAMP.light[2], t);
  }

  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${CROP.width}" height="${CROP.height}">
  <g fill="none" stroke="#1C2126" stroke-width="2">
    <path d="M${MARK.x - 26} ${MARK.y} h16 M${MARK.x + 10} ${MARK.y} h16 M${MARK.x} ${MARK.y - 26} v16 M${MARK.x} ${MARK.y + 10} v16"/>
    <circle cx="${MARK.x}" cy="${MARK.y}" r="9"/>
  </g>
  <circle cx="${MARK.x}" cy="${MARK.y}" r="4.5" fill="#0077B3" stroke="#1C2126" stroke-width="1.5"/>
  <g transform="translate(28 ${CROP.height - 34})">
    <path d="M0 10 h${SCALE_PX}" stroke="#1C2126" stroke-width="3"/>
    <path d="M0 4 v12 M${SCALE_PX} 4 v12" stroke="#1C2126" stroke-width="3"/>
    <text x="0" y="-6" font-family="Archivo, Helvetica, Arial, sans-serif" font-size="15" font-weight="600" fill="#1C2126">${SCALE_M} m</text>
  </g>
  <g transform="translate(${CROP.width - 44} 30)">
    <path d="M0 26 L0 0 M0 0 L-7 9 M0 0 L7 9" stroke="#1C2126" stroke-width="2.5" fill="none"/>
    <text x="0" y="44" text-anchor="middle" font-family="Archivo, Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#1C2126">N</text>
  </g>
</svg>`);

  const base = sharp(tinted, { raw: { width: info.width, height: info.height, channels: 3 } })
    .composite([{ input: overlay }]);

  await base.clone().webp({ quality: 82 }).toFile(join(OUT, 'kaart-mertzig.webp'));
  await base.clone().avif({ quality: 55 }).toFile(join(OUT, 'kaart-mertzig.avif'));
  await base.clone().png({ compressionLevel: 9, palette: true }).toFile(join(OUT, 'kaart-mertzig.png'));

  console.log(`Kaart: ${info.width}×${info.height}px, ${MPP.toFixed(3)} m/px, Moossstaf ${SCALE_M} m = ${SCALE_PX} px`);
}

main().catch((e) => { console.error(e); process.exit(1); });
