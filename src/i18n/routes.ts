/**
 * URL-Struktur.
 *
 * Sproochpräfix `/lb/`, `/de/`, `/fr/`, `/en/`. Standardsprooch ass
 * Lëtzebuergesch — d'Wuerzel `/` leet op `/lb/` ëm, `x-default` weist op déi
 * lëtzebuergesch Fassung.
 *
 * D'Slugs si pro Sprooch spriechend a mat dem Begrëff, no deem an DËSER
 * Sprooch tatsächlech gesicht gëtt — net wuertgläich iwwersat.
 */

export const LOCALES = ['lb', 'de', 'fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'lb';

/** Wéi d'Sprooch am Ëmschalter steet. */
export const localeNames: Record<Locale, string> = {
  lb: 'Lëtzebuergesch',
  de: 'Deutsch',
  fr: 'Français',
  en: 'English',
};

/** Kuerzform am Ëmschalter. */
export const localeShort: Record<Locale, string> = {
  lb: 'LB',
  de: 'DE',
  fr: 'FR',
  en: 'EN',
};

/** `lang`-Attribut. `lb` ass den ISO-639-1-Code fir Lëtzebuergesch. */
export const htmlLang: Record<Locale, string> = {
  lb: 'lb',
  de: 'de',
  fr: 'fr',
  en: 'en',
};

export const routes = {
  home:     { lb: '',                             de: '',                            fr: '',                          en: '' },
  pallets:  { lb: 'paletten',                     de: 'holzpaletten',                fr: 'palettes-bois',             en: 'wooden-pallets' },
  crates:   { lb: 'keschten-op-mooss',            de: 'holzkisten-nach-mass',        fr: 'caisses-sur-mesure',        en: 'custom-crates' },
  repair:   { lb: 'reparatur-a-widderverwendung', de: 'reparatur-wiederverwendung',  fr: 'reparation-reemploi',       en: 'repair-and-reuse' },
  ispm15:   { lb: 'ispm-15',                      de: 'ispm-15',                     fr: 'nimp-15',                   en: 'ispm-15' },
  delivery: { lb: 'liwwerung-ofholung',           de: 'anlieferung-abholung',        fr: 'livraison-enlevement',      en: 'delivery-collection' },
  history:  { lb: 'historik',                     de: 'historie',                    fr: 'historique',                en: 'history' },
  contact:  { lb: 'kontakt',                      de: 'kontakt',                     fr: 'contact',                   en: 'contact' },
  thanks:   { lb: 'merci',                        de: 'danke',                       fr: 'merci',                     en: 'thank-you' },
  legal:    { lb: 'impressum',                    de: 'impressum',                   fr: 'mentions-legales',          en: 'legal-notice' },
  privacy:  { lb: 'dateschutz',                   de: 'datenschutz',                 fr: 'protection-des-donnees',    en: 'privacy' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

/** All Säiten ausser der Startsäit — fir `getStaticPaths` vun `[lang]/[slug]`. */
export const subpageKeys = (Object.keys(routes) as RouteKey[]).filter((k) => k !== 'home');

/** `/lb/paletten/` — ëmmer mat Schrägstrich hannen (`trailingSlash: 'always'`). */
export function path(route: RouteKey, locale: Locale): string {
  const slug = routes[route][locale];
  return slug ? `/${locale}/${slug}/` : `/${locale}/`;
}

/** Slug → Route-Schlëssel, fir de Sproochëmschalter (bleift op derselwechter Säit). */
export function routeFromSlug(locale: Locale, slug: string): RouteKey | undefined {
  return (Object.keys(routes) as RouteKey[]).find((k) => routes[k][locale] === slug);
}

/** Anker op der Startsäit. Musse mat den `id`s an `index.astro` iwwereneestëmmen. */
export const anchors = {
  products: 'wat-mir-maachen',
  configurator: 'konfigurator',
  stamp: 'de-stempel',
  delivery: 'liwwerung',
  history: 'historik',
  faq: 'faq',
  inquiry: 'ufro',
} as const;
