/**
 * Ëffnungszäiten.
 *
 * Si sinn néierens verëffentlecht — och net am Google-Profil. Also ginn se net
 * erfonnt. `null` heescht: d'Komponent <OpeningHours> rendert guer NÄISCHT.
 * Kee „Mo–Fr 8–17" als Platzhalter: eng falsch Zäit schéckt e Camion ëm 7 Auer
 * virun en zouent Duer.
 *
 * Aus dem selwechte Grond kënnt `openingHoursSpecification` eréischt an d'JSON-LD,
 * wann hei eppes steet — e falsche Wäert am Schema ass méi schlëmm wéi keen.
 *
 * TODO[FEHLT] Client: zwou getrennte Zäiten uginn.
 *   a) Büro / telefonesch Erreechbarkeet
 *   b) Uliwwerung an Ofhuelung un der Rampe
 */

/** Weekdeeg no schema.org. */
export type Weekday = 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su';

export interface HoursBlock {
  days: Weekday[];
  /** „08:00" */
  opens: string;
  /** „17:00" */
  closes: string;
}

export interface HoursSet {
  /** i18n-Schlëssel fir d'Iwwerschrëft, z. B. `hours.office`. */
  labelKey: string;
  blocks: HoursBlock[] | null;
  /** Optionale Fousnot, i18n-Schlëssel. */
  noteKey?: string;
}

export const hours: HoursSet[] = [
  { labelKey: 'hours.office', blocks: null },
  { labelKey: 'hours.ramp', blocks: null },
];

/** `true`, soubal iergendeng Zäit bestätegt ass. Steiert Rendering a JSON-LD. */
export const hasHours = hours.some((h) => h.blocks !== null && h.blocks.length > 0);
