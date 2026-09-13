/**
 * Sammelt all offen Punkten aus dem Code.
 *
 *   npm run todo
 *
 * Konventioun:
 *   TODO[UNBESTÄTIGT]  d'Ugab existéiert, muss awer vum Client bestätegt ginn
 *   TODO[FEHLT]        d'Ugab feelt ganz — NÄISCHT erfannen
 *   TODO[EINRICHTUNG]  technesch Ariichtung virum Livegang
 *
 * Dës Lëscht gehéiert an d'Iwwergab. Wat hei steet, ass net vergiess —
 * et ass bewosst net erfonnt.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['src', 'supabase', 'scripts', 'public/fonts'];
// Dëst Skript selwer beschreift d'Konventioun — et wier soss säin eegene Fonn.
const SKIP = /node_modules|dist|\.astro|\.fontcache|tiles|scripts\/todo\.mjs/;
const RE = /TODO\[(UNBESTÄTIGT|FEHLT|EINRICHTUNG)\]\s*(.*)/;

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    const p = join(dir, name);
    if (SKIP.test(p)) continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|astro|mjs|js|json|css|md)$/.test(p)) out.push(p);
  }
  return out;
}

const buckets = { UNBESTÄTIGT: [], FEHLT: [], EINRICHTUNG: [] };

for (const dir of DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const m = line.match(RE);
      if (!m) return;
      // Eng Notiz, déi iwwer méi Zeile geet, gëtt zesummegezunn — mee NËMMEN
      // iwwer Kommentarzeilen. Soss zitt d'Lëscht Code mat eran.
      let text = m[2].replace(/\s*\*\/\s*$/, '').trim();
      for (let j = i + 1; j < lines.length && j - i < 6; j++) {
        const cont = lines[j].match(/^\s*(?:\*|\/\/)\s?(.*)$/);
        if (!cont) break;
        const next = cont[1].trim();
        if (!next || next.startsWith('/') || next.startsWith('*') || RE.test(lines[j])) break;
        if (/^[═─━=\-_·]+$/.test(next)) break; // Kaderlinnen sinn keen Text
        text += (text ? ' ' : '') + next;
      }
      buckets[m[1]].push({ file: relative(ROOT, file), line: i + 1, text });
    });
  }
}

const titles = {
  FEHLT: 'FEELT — Ugab feelt ganz. Näischt erfonnt.',
  UNBESTÄTIGT: 'ONBESTÄTEGT — existéiert, muss bestätegt ginn.',
  EINRICHTUNG: 'ARIICHTUNG — technesch, virum Livegang.',
};

let total = 0;
for (const key of ['FEHLT', 'UNBESTÄTIGT', 'EINRICHTUNG']) {
  const rows = buckets[key];
  total += rows.length;
  console.log(`\n${titles[key]}  (${rows.length})`);
  console.log('─'.repeat(76));
  for (const r of rows) console.log(`  ${r.file}:${r.line}\n    ${r.text}`);
}
console.log(`\n${total} offen Punkten am ganzen.\n`);
