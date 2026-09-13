/**
 * Strukturéiert Daten (JSON-LD).
 *
 * Regel: ALL Ugab hei muss mat deem iwwereneestëmmen, wat op der Säit steet.
 * Wat net op der Säit steet, kënnt net an d'Schema. Dofir:
 *   · `openingHoursSpecification` eréischt, wa Zäite bestätegt sinn
 *   · `aggregateRating` guer net — déi 14 Google-Bewertunge kommen vu
 *     Chauffeuren, net vu Clienten, an d'Profil ass net iwwerholl
 *   · nëmmen déi FAQ-Froen, déi tatsächlech gerendert ginn
 */
import { company, ispm15, storageAreaSqm } from '../data/company';
import { hours, hasHours } from '../data/hours';
import { answeredFaq } from '../data/faq';
import { productLines } from '../data/products';
import { t } from '../i18n';
import { htmlLang, path, type Locale, type RouteKey } from '../i18n/routes';
import { absolute } from './seo';

const ORG_ID = '#kasel';

type Json = Record<string, unknown>;

function postalAddress(): Json {
  return {
    '@type': 'PostalAddress',
    streetAddress: company.address.street,
    postalCode: company.address.postalCodeBare,
    addressLocality: company.address.locality,
    addressRegion: company.address.region,
    addressCountry: company.address.countryCode,
  };
}

/**
 * D'Firma. `LocalBusiness` an `Manufacturer` zesummen: si huet eng Adress, un
 * déi ee fiere kann, an si stellt hier. Béid stëmmt.
 */
export function organization(site: URL | undefined, locale: Locale): Json {
  const node: Json = {
    '@type': ['LocalBusiness', 'Manufacturer'],
    '@id': absolute(site, '/') + ORG_ID,
    name: company.legalName,
    alternateName: company.brand,
    url: absolute(site, path('home', locale)),
    address: postalAddress(),
    telephone: company.phoneE164,
    faxNumber: company.faxDisplay,
    email: company.email,
    vatID: company.vatId,
    identifier: [
      { '@type': 'PropertyValue', name: 'RCS Luxembourg', value: company.rcs },
      {
        '@type': 'PropertyValue',
        name: 'ISPM 15 / IPPC',
        value: `${ispm15.countryCode}-${ispm15.registrationNumber}`,
        description: `${ispm15.authority.name} (${ispm15.authority.abbr})`,
      },
    ],
    foundingDate: company.incorporated,
    founder: { '@type': 'Person', name: company.managingDirector },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: company.geo.latitude,
      longitude: company.geo.longitude,
    },
    areaServed: [
      { '@type': 'Country', name: 'Luxembourg' },
      { '@type': 'Country', name: 'Belgium' },
      { '@type': 'Country', name: 'Germany' },
      { '@type': 'Country', name: 'France' },
    ],
    knowsLanguage: ['lb', 'de', 'fr', 'en'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t(locale, 'products.heading'),
      itemListElement: productLines.map((key) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: t(locale, `products.${key}.title`),
          description: t(locale, `products.${key}.body`),
          provider: { '@id': absolute(site, '/') + ORG_ID },
        },
      })),
    },
  };

  // Ëffnungszäite kommen eréischt eran, wa se bestätegt sinn. E falsche Wäert
  // am Schema ass méi schlëmm wéi keen.
  if (hasHours) {
    node.openingHoursSpecification = hours
      .filter((h) => h.blocks && h.blocks.length > 0)
      .flatMap((h) =>
        h.blocks!.map((b) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: b.days.map(
            (d) =>
              ({ Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' })[d],
          ),
          opens: b.opens,
          closes: b.closes,
        })),
      );
  }

  if (company.phoneSecondary.publish) {
    node.contactPoint = [
      { '@type': 'ContactPoint', telephone: company.phoneSecondary.e164, contactType: 'sales' },
    ];
  }

  if (company.googleBusinessProfileUrl || company.socialProfiles.length) {
    node.sameAs = [company.googleBusinessProfileUrl, ...company.socialProfiles].filter(Boolean);
  }

  // 9.000 m² Lager ass belegt a steet och op der Säit.
  node.amenityFeature = {
    '@type': 'LocationFeatureSpecification',
    name: 'Storage area',
    value: `${storageAreaSqm} m2`,
  };

  return node;
}

export function website(site: URL | undefined, locale: Locale): Json {
  return {
    '@type': 'WebSite',
    '@id': absolute(site, path('home', locale)) + '#website',
    url: absolute(site, path('home', locale)),
    name: company.brand,
    inLanguage: htmlLang[locale],
    publisher: { '@id': absolute(site, '/') + ORG_ID },
  };
}

export function webPage(site: URL | undefined, locale: Locale, route: RouteKey): Json {
  return {
    '@type': 'WebPage',
    '@id': absolute(site, path(route, locale)) + '#webpage',
    url: absolute(site, path(route, locale)),
    name: t(locale, `meta.${route}.title`),
    description: t(locale, `meta.${route}.description`),
    inLanguage: htmlLang[locale],
    isPartOf: { '@id': absolute(site, path('home', locale)) + '#website' },
    about: { '@id': absolute(site, '/') + ORG_ID },
  };
}

export function breadcrumbs(site: URL | undefined, locale: Locale, trail: RouteKey[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((route, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: route === 'home' ? company.brand : t(locale, `meta.${route}.title`).split(' | ')[0].split(' — ')[0],
      item: absolute(site, path(route, locale)),
    })),
  };
}

/** Nëmmen déi Froen, déi och tatsächlech op der Säit stinn. */
export function faqPage(locale: Locale, ids?: string[]): Json {
  const items = answeredFaq.filter((f) => !ids || ids.includes(f.id));
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: t(locale, `faq.items.${f.id}.q`),
      acceptedAnswer: { '@type': 'Answer', text: t(locale, `faq.items.${f.id}.a`) },
    })),
  };
}

/** Eng Produktlinn als Déngscht. Keng Präisser — mir hu keng. */
export function service(site: URL | undefined, locale: Locale, key: string): Json {
  return {
    '@type': 'Service',
    name: t(locale, `products.${key}.title`),
    description: t(locale, `products.${key}.body`),
    serviceType: t(locale, `products.${key}.title`),
    provider: { '@id': absolute(site, '/') + ORG_ID },
    areaServed: { '@type': 'Country', name: 'Luxembourg' },
  };
}

/** Alles an EE Graph — ee `<script>` pro Säit, keng duebel Knäip. */
export function graph(nodes: Json[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}
