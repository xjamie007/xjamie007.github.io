/**
 * FAQ.
 *
 * Regel: eng Fro ouni belegten Äntwert gëtt NET gerendert. Léiwer siwen echt
 * Äntwerten wéi aacht gerode. `answered: false` hält d'Fro am Projet — sichtbar
 * fir de Client, onsichtbar fir de Besucher — a `npm run todo` lëscht se op.
 *
 * Text: `src/i18n/*.json` ënner `faq.<id>.q` / `faq.<id>.a`.
 */
import type { RouteKey } from '../i18n/routes';

export interface FaqItem {
  id: string;
  /** `false` = rendert net (Äntwert feelt oder ass net belegt). */
  answered: boolean;
  /** Optionale Link an der Äntwert, op eng eege Säit. */
  link?: { route: RouteKey; anchor?: string };
  /** Op der ISPM-15-Säit widderhuelen? */
  onIspmPage?: boolean;
}

export const faq: FaqItem[] = [
  { id: 'china', answered: true, link: { route: 'ispm15' }, onIspmPage: true },
  { id: 'eu', answered: true, link: { route: 'ispm15' }, onIspmPage: true },
  // Konkret Liwwerzäit feelt. D'Äntwert seet, wat belegt ass (Zuschnitt op
  // Bestellung, 9.000 m² Lager) an nennt bewosst KENG Dag-Zuel.
  // TODO[FEHLT] Client: Liwwerzäit nennen, dann d'Äntwert ergänzen.
  { id: 'leadtime', answered: true },
  // TODO[FEHLT] Client: Maacht Dir och eenzel Këschten oder nëmme Serien?
  // Bleift onsichtbar, bis d'Äntwert do ass.
  { id: 'single-units', answered: false },
  { id: 'repair', answered: true, link: { route: 'repair' }, onIspmPage: true },
  { id: 'storage', answered: true },
  { id: 'sizes', answered: true, link: { route: 'pallets' } },
  { id: 'driver-access', answered: true, link: { route: 'delivery' } },
];

/** Nëmmen déi, déi tatsächlech gerendert ginn — och fir d'FAQPage-JSON-LD. */
export const answeredFaq = faq.filter((f) => f.answered);
