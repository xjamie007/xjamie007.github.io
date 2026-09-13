/**
 * Erzeugt die ausgelieferten Bildfassungen aus den Originalen.
 *
 *   node scripts/build-photos.mjs
 *
 * Quelle: `src/content/photos/` — die Fotos des Betriebs, übernommen von
 * kasel.lu. Ziel: `public/img/foto/` als AVIF und WebP in zwei Breiten.
 *
 * ⚠ RECHTE: die Mentions légales von kasel.lu nennen als Urheber
 *   „Photos: © SAN'DESIGN" (die Agentur, die die alte Seite gebaut hat), nicht
 *   den Betrieb. Vor dem Livegang muss geklärt sein, dass Kasel die Nutzungs-
 *   rechte hat — sonst neu fotografieren. Siehe README, Abschnitt „Fotos".
 *
 * Die Originale sind nur 625 × 417 px. Deshalb wird nirgends hochskaliert:
 * die größte ausgelieferte Breite ist 625. Wo ein Slot breiter ist, steht ein
 * Farbfeld oder eine Zeichnung statt eines weichgezogenen Fotos.
 */
import sharp from 'sharp';
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src', 'content', 'photos');
const OUT = join(ROOT, 'public', 'img', 'foto');

const WIDTHS = [420, 625];

if (!existsSync(SRC)) {
  console.error(`Keine Originale unter ${SRC}`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => /\.(jpe?g|png)$/i.test(f));
let n = 0;

for (const file of files) {
  const name = parse(file).name;
  const input = join(SRC, file);
  const meta = await sharp(input).metadata();

  for (const w of WIDTHS) {
    if (w > (meta.width ?? 0)) continue; // niemals hochskalieren
    const base = sharp(input).resize(w).sharpen({ sigma: 0.6 });
    await base.clone().avif({ quality: 58 }).toFile(join(OUT, `${name}-${w}.avif`));
    await base.clone().webp({ quality: 80 }).toFile(join(OUT, `${name}-${w}.webp`));
    n += 2;
  }
}

console.log(`${files.length} Originale → ${n} Dateien in public/img/foto/`);
