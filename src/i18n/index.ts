/**
 * Iwwersetzungen.
 *
 * All Text läit an `lb.json` / `de.json` / `fr.json` / `en.json` — NI am Markup.
 * Dat gëllt och fir Feelermeldungen, Datumsformater, Buttonstexter an Alt-Texter.
 *
 * `lb.json` huet eng aner Form wéi déi dräi aner: all Antrag ass
 * `{ "value": "…", "reviewed": false }`, well d'lëtzebuergesch Fassung eng
 * Entworf ass an nach vun engem Mammesproochler gelies muss ginn.
 * `npm run lb:review` lëscht alles op, wat nach op `reviewed: false` steet.
 */
import lb from './lb.json';
import de from './de.json';
import fr from './fr.json';
import en from './en.json';
import { DEFAULT_LOCALE, type Locale } from './routes';

type Node = string | string[] | { value: string | string[]; reviewed?: boolean; note?: string } | { [k: string]: Node };

const dicts: Record<Locale, Record<string, Node>> = {
  lb: lb as Record<string, Node>,
  de: de as Record<string, Node>,
  fr: fr as Record<string, Node>,
  en: en as Record<string, Node>,
};

function resolve(dict: Record<string, Node>, key: string): Node | undefined {
  let cur: Node | undefined = dict;
  for (const part of key.split('.')) {
    if (cur == null || typeof cur !== 'object' || Array.isArray(cur)) return undefined;
    cur = (cur as Record<string, Node>)[part];
  }
  return cur;
}

function unwrap(node: Node | undefined): string | string[] | undefined {
  if (node == null) return undefined;
  if (typeof node === 'string' || Array.isArray(node)) return node;
  if ('value' in node) return (node as { value: string | string[] }).value;
  return undefined;
}

/**
 * Eng feelend Iwwersetzung gëtt NET stëll mat enger anerer Sprooch gefëllt an
 * och net erfonnt: am Dev gëtt d'Plaz sichtbar markéiert, am Build brécht en
 * Feeler. Esou kann keng hallef iwwersat Säit live goen.
 */
function miss(locale: Locale, key: string): never | string {
  const msg = `[i18n] Feelend Iwwersetzung: ${locale}.${key}`;
  if (import.meta.env.PROD) throw new Error(msg);
  console.warn(msg);
  return `⟦${locale}.${key}⟧`;
}

export function t(locale: Locale, key: string): string {
  const v = unwrap(resolve(dicts[locale], key));
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.join(' ');
  return miss(locale, key);
}

/** Fir Opzielungen an Ofsätz, déi als Array am JSON stinn. */
export function tList(locale: Locale, key: string): string[] {
  const v = unwrap(resolve(dicts[locale], key));
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return [v];
  miss(locale, key);
  return [];
}

/** Gëtt et de Schlëssel iwwerhaapt? Fir optional Blocks. */
export function has(locale: Locale, key: string): boolean {
  return unwrap(resolve(dicts[locale], key)) !== undefined;
}

/** Zuel an der Sprooch vun der Säit — z. B. 9.000 m² vs 9,000 m². */
export function num(locale: Locale, value: number): string {
  const tag = locale === 'lb' ? 'lb-LU' : locale === 'de' ? 'de-LU' : locale === 'fr' ? 'fr-LU' : 'en-GB';
  return new Intl.NumberFormat(tag).format(value);
}

export { DEFAULT_LOCALE };
export type { Locale };
