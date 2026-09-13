/**
 * Meta, Canonicals an hreflang.
 *
 * Ouni `hreflang` inklusiv `x-default` hält Google déi véier Fassunge fir
 * duebelen Inhalt. Dofir kënnt op ALL Säit de komplette Satz eraus.
 */
import { LOCALES, DEFAULT_LOCALE, htmlLang, path, type Locale, type RouteKey } from '../i18n/routes';

export interface AlternateLink {
  hreflang: string;
  href: string;
}

export function absolute(site: URL | undefined, pathname: string): string {
  const origin = site ? site.origin : 'https://www.kasel.lu';
  return new URL(pathname, origin).href;
}

/** All Sproochfassunge vun DËSER Säit, plus `x-default` op d'lëtzebuergesch. */
export function alternates(site: URL | undefined, route: RouteKey): AlternateLink[] {
  const list: AlternateLink[] = LOCALES.map((l) => ({
    hreflang: htmlLang[l],
    href: absolute(site, path(route, l)),
  }));
  list.push({ hreflang: 'x-default', href: absolute(site, path(route, DEFAULT_LOCALE)) });
  return list;
}

/** Säiten, déi net an den Index gehéieren. */
export const NOINDEX_ROUTES: RouteKey[] = ['thanks'];

export function isNoindex(route: RouteKey): boolean {
  return NOINDEX_ROUTES.includes(route);
}

/** Reiefolleg vun de Krëmelen. `home` ass ëmmer d'Wuerzel. */
export function breadcrumbFor(route: RouteKey): RouteKey[] {
  return route === 'home' ? ['home'] : ['home', route];
}

export type { Locale, RouteKey };
