// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Die Adresse, unter der die Seite wirklich liegt. Sie steckt in jedem
// Canonical, in jedem hreflang und in der Sitemap — stimmt sie nicht, hält
// Google die vier Sprachfassungen für doppelten Inhalt.
//
// Über die Umgebungsvariable, damit der Umzug auf kasel.lu später kein
// Code-Edit ist: SITE_URL setzen, bauen, fertig. Danach auch die
// Sitemap-Zeile in `public/robots.txt` mitziehen — `npm run verify` prüft,
// dass die beiden zusammenpassen.
//
// `||`, nicht `??`: eine nicht gesetzte GitHub-Variable kommt als LEERER
// String an, nicht als undefined. Mit `??` wäre das ein gültiger Wert und
// Astro bricht mit „site: Invalid url" ab.
const SITE = process.env.SITE_URL || 'https://xjamie007.github.io';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  // Lëtzebuergesch ass Leitsprooch. `/` leet op `/lb/` ëm, `x-default` weist
  // op d'lëtzebuergesch Fassung (gesat am <BaseHead>).
  i18n: {
    defaultLocale: 'lb',
    locales: ['lb', 'de', 'fr', 'en'],
    routing: {
      prefixDefaultLocale: true,
      // Astro seng eege Weiderleedung wier eng Meta-Refresh mat ZWOU Sekonnen
      // Verzögerung, ouni <html lang> an ouni hreflang. Mir maachen d'Wuerzel
      // selwer: `src/pages/index.astro`, Weiderleedung ouni Verzögerung, mat
      // enger richteger Sproochwiel fir de Fall, datt se net gräift.
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'lb',
        locales: { lb: 'lb', de: 'de', fr: 'fr', en: 'en' },
      },
      // Wat `noindex` ass, gehéiert och net an d'Sitemap: d'404, d'Merci-Säiten
      // an d'Wuerzel `/`, déi nëmmen op `/lb/` weiderleet.
      filter: (page) => {
        const p = new URL(page).pathname;
        if (p === '/') return false;
        if (p.includes('/404')) return false;
        return !/\/(merci|danke|thank-you)\/$/.test(p);
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: false,
});
