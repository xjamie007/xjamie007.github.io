/**
 * Produktdaten — Moossen, Traglaaschten, Holzaart, Trocknungsgrad.
 *
 * REGEL: Hei steet keng erfonnte Zuel. Wat feelt, ass `null`. `null` rendert am
 * Frontend als „op Nofro" / „auf Anfrage" / « sur demande » / "on request" —
 * ni als Zuel, ni als Strich.
 *
 * De Client fëllt dës Datei aus. Duerno stinn d'Wäerter automatesch an der
 * Moosstabell op der Palettesäit, an der Sitemap an am JSON-LD.
 */

/** Text vun de Produktzeilen läit an `src/i18n/*.json` ënner `products.*`. */
export type ProductKey = 'pallets' | 'crates' | 'repair';

export const productLines: ProductKey[] = ['pallets', 'crates', 'repair'];

export interface PalletSpec {
  id: string;
  /** Baubreet a mm (kuerz Kant). `null` = op Nofro. */
  width: number | null;
  /** Baulängt a mm (laang Kant). `null` = op Nofro. */
  length: number | null;
  /** Traglaascht a kg. TODO[FEHLT] Traglaascht pro Mooss vum Client anzedroen. */
  loadCapacityKg: number | null;
  /** i18n-Schlëssel fir d'Holzaart, z. B. `spec.wood.spruce`. TODO[FEHLT] Holzaart pro Mooss vum Client. */
  woodKey: string | null;
  /** i18n-Schlëssel fir den Trocknungsgrad. TODO[FEHLT] Trocknungsgrad pro Mooss vum Client. */
  dryingKey: string | null;
  /**
   * Kann dës Palette mat IPPC-Stempel geliwwert ginn?
   * `true` ass belegt: Kasel ass agedroene Produzent Nr. 079 — d'Behandlung
   * an d'Kennzeechnung sinn dofir fir all Massivholz méiglech.
   */
  ispm15: boolean;
  /** `false` heescht: Zeil rendert net. */
  published: boolean;
}

/**
 * Standardmaße.
 *
 * ⚠ Kasel nennt auf der eigenen Seite „Standardpaletten, Paletten aller Art
 * nach Maß und nach technischer Spezifikation des Kunden, CP-Paletten" — aber
 * KEINE konkreten Maße. 800 × 1200 und 1000 × 1200 wären die naheliegenden
 * europäischen Standardformate, stehen aber nirgends belegt. Deshalb sind die
 * Zeilen angelegt und auf `published: false` gesetzt: die Tabelle rendert
 * nicht, solange nichts bestätigt ist.
 *
 * TODO[FEHLT] Client: welche Standardmaße bauen Sie wirklich? Maße, Traglast,
 * Holzart und Trocknungsgrad eintragen und `published: true` setzen. Erst dann
 * erscheint die Maßtabelle auf der Palettenseite.
 */
export const standardPallets: PalletSpec[] = [
  {
    id: 'std-a',
    width: null,          // TODO[FEHLT] Breite Standardmaß A
    length: null,         // TODO[FEHLT] Länge Standardmaß A
    loadCapacityKg: null, // TODO[FEHLT] Traglast Standardmaß A
    woodKey: null,        // TODO[FEHLT] Holzart Standardmaß A
    dryingKey: null,      // TODO[FEHLT] Trocknungsgrad Standardmaß A
    ispm15: true,
    published: false,
  },
  {
    id: 'std-b',
    width: null,          // TODO[FEHLT] Breite Standardmaß B
    length: null,         // TODO[FEHLT] Länge Standardmaß B
    loadCapacityKg: null, // TODO[FEHLT] Traglast Standardmaß B
    woodKey: null,        // TODO[FEHLT] Holzart Standardmaß B
    dryingKey: null,      // TODO[FEHLT] Trocknungsgrad Standardmaß B
    ispm15: true,
    published: false,
  },
];

/**
 * CP-Paletten (Chemie-Paletten).
 *
 * D'Firma nennt „CP-Paletten" an hirem eegenen Text — d'Bezeechnunge sinn also
 * belegt. D'MOOSSEN sinn et net: si stinn an der CP-Norm, mee mir hunn se net
 * aus enger Quell, déi mir nopréiwe konnten, an eng falsch Moossen op enger
 * Palettesäit ass schlëmmer wéi guer keng.
 *
 * TODO[FEHLT] Client: d'Moossen aus Ärer CP-Spezifikatioun androen, an déi
 * Typen op `published: false` setzen, déi Dir net maacht.
 */
export const cpPallets: PalletSpec[] = (
  ['CP1', 'CP2', 'CP3', 'CP4', 'CP5', 'CP6', 'CP7', 'CP8', 'CP9'] as const
).map((id) => ({
  id,
  width: null,
  length: null,
  loadCapacityKg: null,
  woodKey: null,
  dryingKey: null,
  ispm15: true,
  published: true,
}));

/**
 * Sonderpaletten no Kundespezifikatioun: keng Tabell, well et do kee
 * Standardmooss gëtt. D'Zeil op der Säit weist op de Formulaire.
 */

/** Bauweisen fir Këschten. Voreestellung hänkt um Ladegutt (`crate-rules.ts`). */
export type CrateBuild = 'closed' | 'slatted';

/**
 * Vorschläge für das Ladegut — KEINE abschließende Liste.
 *
 * Kasel schreibt auf der eigenen Seite „pour l'emballage et le transfert
 * outre-mer de produits de cuivre, de verre, d'aluminium, **etc.**". Das „etc."
 * ist der Punkt: gebaut wird für alles, was über See geht. Das Feld im
 * Konfigurator ist deshalb ein freies Textfeld; diese vier stehen nur als
 * Vorschlagsliste darunter, weil sie die häufigsten Fälle sind und weil sie
 * die Voreinstellung der Bauweise steuern.
 */
export const cargoKinds = ['copper', 'glass', 'aluminium', 'machine'] as const;
export type CargoKind = (typeof cargoKinds)[number];

/** Ziler fir de Konfigurator. */
export const destinations = ['eu', 'cn', 'au', 'nz', 'third'] as const;
export type Destination = (typeof destinations)[number];

/** Wat soll gebaut ginn — Auswiel am Ufro-Formulaire. */
export const inquirySubjects = ['pallets', 'crates', 'repair', 'storage', 'unsure'] as const;
export type InquirySubject = (typeof inquirySubjects)[number];
