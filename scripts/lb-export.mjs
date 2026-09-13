/**
 * Gibt den gesamten luxemburgischen Text zum Gegenlesen aus.
 *
 *   node scripts/lb-export.mjs            Markdown nach lb-text.md
 *   node scripts/lb-export.mjs --stdout   ins Terminal
 *
 * Gruppiert nach dem, was der Besucher sieht, mit der deutschen Fassung als
 * Vergleich daneben. Wer einen Satz freigibt, setzt in `src/i18n/lb.json`
 * bei dem Eintrag `"reviewed": true`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const lb = JSON.parse(readFileSync(join(ROOT, 'src/i18n/lb.json'), 'utf8'));
const de = JSON.parse(readFileSync(join(ROOT, 'src/i18n/de.json'), 'utf8'));

const at = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
const flat = (s) => (Array.isArray(s) ? s.join('  ⏎  ') : String(s ?? ''));

const rows = [];
(function walk(n, p = '') {
  if (n && typeof n === 'object' && 'value' in n) { rows.push({ key: p, lb: flat(n.value), reviewed: n.reviewed, note: n.note }); return; }
  if (n && typeof n === 'object') for (const [k, v] of Object.entries(n)) walk(v, p ? `${p}.${k}` : k);
})(lb);

const GROUPS = [
  ['hero', 'Startseite — Kopfbereich'],
  ['facts', 'Startseite — Auf einen Blick'],
  ['products', 'Startseite — Was wir machen'],
  ['config', 'Kistenkonfigurator'],
  ['stampShort', 'Startseite — Braucht es einen Stempel'],
  ['about', 'Startseite — Über uns'],
  ['history', 'Historie'],
  ['delivery', 'Anlieferung & Abholung'],
  ['faq', 'Häufig gefragt'],
  ['form', 'Anfrageformular'],
  ['thanks', 'Danke-Seite'],
  ['pallets', 'Seite: Paletten'],
  ['crates', 'Seite: Kisten'],
  ['repair', 'Seite: Reparatur'],
  ['ispm15', 'Seite: ISPM 15'],
  ['stamp', 'Der Stempel, Feld für Feld'],
  ['contact', 'Seite: Kontakt'],
  ['legal', 'Impressum'],
  ['privacy', 'Datenschutz'],
  ['notfound', 'Seite nicht gefunden'],
  ['nav', 'Navigation'],
  ['rail', 'Datenschiene'],
  ['footer', 'Fußzeile'],
  ['hours', 'Öffnungszeiten'],
  ['photos', 'Alt-Texte der Fotos'],
  ['common', 'Wiederkehrende Wörter'],
  ['meta', 'Titel und Beschreibungen für Suchmaschinen'],
];

const lines = [
  '# Luxemburgischer Text — komplett',
  '',
  `${rows.length} Einträge. Die deutsche Fassung steht als Vergleich darunter.`,
  '',
  'Wer einen Satz freigibt, setzt in `src/i18n/lb.json` bei dem Eintrag',
  '`"reviewed": true`. Was noch offen ist, zeigt `npm run lb:review`.',
  '',
  '---',
  '',
];

const seen = new Set();
for (const [prefix, title] of GROUPS) {
  const group = rows.filter((r) => r.key === prefix || r.key.startsWith(prefix + '.'));
  if (!group.length) continue;
  lines.push(`## ${title}`, '');
  for (const r of group) {
    seen.add(r.key);
    lines.push(`**${r.key}**${r.reviewed ? ' ✔' : ''}`);
    lines.push(`> ${r.lb}`);
    const d = flat(at(de, r.key));
    if (d) lines.push(`> *DE: ${d}*`);
    if (r.note) lines.push(`> ⚑ ${r.note}`);
    lines.push('');
  }
}
const rest = rows.filter((r) => !seen.has(r.key));
if (rest.length) {
  lines.push('## Übriges', '');
  for (const r of rest) { lines.push(`**${r.key}**`, `> ${r.lb}`, ''); }
}

const text = lines.join('\n');
if (process.argv.includes('--stdout')) console.log(text);
else { writeFileSync(join(ROOT, 'lb-text.md'), text); console.log(`lb-text.md geschrieben — ${rows.length} Einträge, ${text.length} Zeichen`); }
