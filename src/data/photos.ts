/**
 * Welches Foto wo steht.
 *
 * Quelle: die Fotos des Betriebs von kasel.lu, Originale unter
 * `src/content/photos/`, ausgelieferte Fassungen unter `public/img/foto/`
 * (`node scripts/build-photos.mjs`).
 *
 * ⚠ TODO[EINRICHTUNG] Rechte klären. Die Mentions légales von kasel.lu nennen
 * als Urheber „Photos: © SAN'DESIGN" — die Agentur der alten Seite, nicht den
 * Betrieb. Vor dem Livegang muss schriftlich vorliegen, dass Kasel die
 * Nutzungsrechte hat. Sonst: neu fotografieren, Liste in
 * `src/content/README.md`.
 *
 * Die Originale sind 625 × 417 px. Deshalb steht nirgends ein Foto in einem
 * Slot, der breiter als 625 px wird — lieber eine Fläche als ein weiches Bild.
 */

export interface Photo {
  /** Dateiname ohne Breite und Endung. */
  file: string;
  /** i18n-Schlüssel für den Alt-Text. */
  altKey: string;
}

export const photos = {
  hall:    { file: 'produkte_6',    altKey: 'photos.hall' },
  pallets: { file: 'produkte_2',    altKey: 'photos.pallets' },
  crates:  { file: 'produkte_5',    altKey: 'photos.crates' },
  marked:  { file: 'produkte_4',    altKey: 'photos.marked' },
  repair:  { file: 'produkte_11',   altKey: 'photos.repair' },
  machine: { file: 'produktion_1',  altKey: 'photos.machine' },
  sawline: { file: 'produktion_2',  altKey: 'photos.sawline' },
  worker:  { file: 'produktion_5',  altKey: 'photos.worker' },
  yard:    { file: 'produkte_9',    altKey: 'photos.yard' },
  timber:  { file: 'produkte_10',   altKey: 'photos.timber' },
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

/** Urheber, wie ihn die Mentions légales von kasel.lu nennen. */
export const photoCredit = 'SAN’DESIGN';

/** Native Abmessungen aller Originale. */
export const PHOTO_W = 625;
export const PHOTO_H = 417;
