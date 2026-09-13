/**
 * Lëscht all lëtzebuergesch Anträg op, déi nach net vun engem Mammesproochler
 * gelies goufen.
 *
 *   npm run lb:review           alles, wat op `reviewed: false` steet
 *   npm run lb:review -- --csv  als CSV, fir en Dokument zum Duerchgoen
 *
 * `src/i18n/lb.json` ass d'Leitfassung. All Antrag huet
 * `{ "value": …, "reviewed": false }`; wien e Saz gelies an ofgeseent huet,
 * setzt `reviewed` op `true`. `note` steet do, wou de Fachbegrëff onsécher ass
 * — do steet den däitsche Begrëff dobäi, statt fräi ze erfannen.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const lb = JSON.parse(readFileSync(join(ROOT, 'src/i18n/lb.json'), 'utf8'));
const de = JSON.parse(readFileSync(join(ROOT, 'src/i18n/de.json'), 'utf8'));

const csv = process.argv.includes('--csv');
const rows = [];

function at(obj, path) {
  return path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), obj);
}

function walk(node, path = '') {
  if (node && typeof node === 'object' && 'value' in node && 'reviewed' in node) {
    if (!node.reviewed) {
      const v = Array.isArray(node.value) ? node.value.join(' ⏎ ') : node.value;
      const d = at(de, path);
      rows.push({
        key: path,
        lb: v,
        de: typeof d === 'string' ? d : Array.isArray(d) ? d.join(' ⏎ ') : '',
        note: node.note ?? '',
      });
    }
    return;
  }
  if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
}
walk(lb);

if (csv) {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  console.log('Schlëssel,Lëtzebuergesch,Däitsch,Notiz,Gepréift');
  for (const r of rows) console.log([r.key, r.lb, r.de, r.note, ''].map(esc).join(','));
} else {
  console.log(`\n${rows.length} lëtzebuergesch Anträg nach net gepréift.\n`);
  console.log('D\'lëtzebuergesch Fassung ass en ENTWORF. Si muss virum Livegang');
  console.log('vun engem Mammesproochler gelies ginn. Rechtschreiwung no dem');
  console.log('Lëtzebuerger Online Dictionnaire (LOD) / Zenter fir d\'Lëtzebuerger Sprooch.\n');
  console.log('  npm run lb:review -- --csv > lb-review.csv   fir e Blat zum Duerchgoen\n');
  for (const r of rows.slice(0, 25)) {
    console.log(`  ${r.key}`);
    console.log(`    LB  ${r.lb.slice(0, 110)}${r.lb.length > 110 ? '…' : ''}`);
    if (r.note) console.log(`    ⚑   ${r.note}`);
  }
  if (rows.length > 25) console.log(`\n  … a ${rows.length - 25} weiderer. Mat --csv kritt Dir se all.\n`);
}
