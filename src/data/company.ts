/**
 * KASEL — Firmendaten.
 *
 * Dëst ass déi eenzeg Wourechtsquell fir Numm, Adress, Telefon a Registeren.
 * D'NAP-Daten (Name, Address, Phone) musse sech HEI änneren, ni am Markup —
 * soss laafe Säit, Impressum a JSON-LD auserneen, an dat kascht lokal Ranking.
 *
 * Marker-Konventioun fir `npm run todo` — jeeweils mam Präfix „TODO" an
 * eckege Klameren:
 *   UNBESTÄTIGT — d'Ugab existéiert, muss awer vum Client bestätegt ginn
 *   FEHLT       — d'Ugab feelt ganz; NÄISCHT erfannen
 *   EINRICHTUNG — technesch Ariichtung virum Livegang
 */

export const company = {
  /** Vollstänneger Firmennumm, wéi am RCS agedroen. Belegt. */
  legalName: 'Emballages en Bois Kasel S.à r.l.',
  /** Kuerzform fir d'Mark op der Säit. */
  brand: 'KASEL',
  legalForm: 'Société à responsabilité limitée (S.à r.l.)',

  address: {
    street: '12, Zone Industrielle',
    postalCode: 'L-9166',
    /** Ouni Land-Präfix — fir schema.org (`postalCode`) gebraucht. */
    postalCodeBare: '9166',
    locality: 'Mertzig',
    region: 'Kanton Dikrech',
    /** Kanonesch Form. De SICHTBARE Landesnumm kënnt aus `common.country`
     *  an der jeeweileger Sprooch; d'Schema benotzt `countryCode`. */
    country: 'Lëtzebuerg',
    countryCode: 'LU',
  },

  /** Sichtbar op der Säit — iwwerall identesch ze schreiwen. */
  phoneDisplay: '+352 888 334-1',
  /** E.164 fir `tel:` a fir JSON-LD. */
  phoneE164: '+352888334-1',

  /**
   * Zweite Durchwahl.
   * Belegt: kasel.lu führt diese Nummer selbst in den Mentions légales als
   * Kontakt des „Editeur Responsable". Die -1 steht auf Startseite und Kontakt.
   * Deshalb hier genauso: -1 überall, -23 zusätzlich im Impressum.
   */
  phoneSecondary: {
    publish: true,
    display: '+352 888 334-23',
    e164: '+352888334-23',
  },

  faxDisplay: '+352 838 715',
  email: 'tom@kasel.lu',

  /** Handelsregister. Belegt. */
  rcs: 'B192110',
  /** Belegt: steht so in den Mentions légales von kasel.lu („TVA ID"). */
  vatId: 'LU27299229',
  /** Datum vun der Androfung vun der Gesellschaft. Belegt. */
  incorporated: '2014-11-17',
  shareCapital: '12.500 €',
  /** Zweck laut RCS, franséisch am Original. */
  purposeFr: "fabrication et commerce d'emballages en bois et des produits dérivés",

  /**
   * Gérant. Belegt (RCS, Website, Editus).
   * Die Historique-Seite von kasel.lu nennt die Reihe ausdrücklich:
   * Henry Kasel (ab 1959) → Pierrot Kasel → Tom Kasel, der 2014 die
   * Produktionstätigkeit in der Emballages en Bois Kasel Sàrl übernimmt.
   */
  managingDirector: 'Tom Kasel',

  /**
   * Autorisation d'établissement / Gewerbegenehmigung.
   * TODO[FEHLT] Nummer beim Client ufroen. Bis dohin rendert d'Zeil am
   * Impressum NET — `null` heescht: guer net uweisen.
   */
  businessLicence: null as string | null,

  /**
   * Geografesch Positioun vum Betrib.
   * Lat/Lon: OpenStreetMap-Nominatim, Treffer op Hausnummer-Niveau fir
   * „12, Zone Industrielle, 9166 Mertzig" (ofgefrot 11.09.2026). De Plus Code
   * R2Q8+54 decodéiert op déi selwecht Plaz (±50 m) a bestätegt de Wäert.
   * Chauffeure schaffe mam Plus Code — dofir steet en op der Säit als Text.
   */
  geo: {
    plusCode: 'R2Q8+54 Mertzig',
    latitude: 49.8374458,
    longitude: 6.0153778,
  },

  /**
   * Google-Business-Profil leeft ënner „Maison Kasel Sàrl", ass NET vum Inhaber
   * iwwerholl, huet keng Zäiten a keng Fotoen.
   * TODO[UNBESTÄTIGT] Profil iwwerhuelen an Numm vereenheetlechen — eréischt
   * duerno hei verlinken. Bis dohin: `null`.
   */
  googleBusinessProfileUrl: null as string | null,

  /** Sozial Netzwierker: keng fonnt. Wann ee kënnt, hei androen. */
  socialProfiles: [] as string[],
} as const;

/**
 * ISPM-15-Register (Lëtzebuerg).
 * Quell: logistics.public.lu — Single Window for Logistics, Stand 08.04.2025.
 * Zoustänneg Autoritéit: ASTA (Administration des Services Techniques de
 * l'Agriculture). Ëffentlech nopréifbar — dat ass de Grond, firwat d'Behaaptung
 * op der Säit wierkt.
 */
export const ispm15 = {
  /** Eis Registréierungsnummer. Belegt. */
  registrationNumber: '079',
  countryCode: 'LU',

  /**
   * Behandlungscode um Stempel: HT = Heat Treatment, DB = Debarked.
   * TODO[UNBESTÄTIGT] Beim Client erfroen, wéi ee Code op de Stempel kënnt.
   * Ebenso op: ob Kasel als Behandlungsanlag (IT) oder als Hiersteller (FM)
   * registréiert ass. Bis dohin Standardwäert "HT".
   */
  treatmentCode: 'HT',

  /**
   * Belegt: das ASTA-Register führt Kasel in der Rubrik „Producteurs" —
   * also FM (Hersteller von Verpackungsmaterial), nicht IT (Behandlungsanlage).
   * Quelle siehe `source` unten. Wird derzeit nirgends ausgegeben, steht aber
   * bereit, falls der Stempel um den Zusatz ergänzt wird.
   */
  operatorType: 'FM' as 'IT' | 'FM' | null,

  authority: {
    abbr: 'ASTA',
    name: 'Administration des Services Techniques de l’Agriculture',
  },

  source: {
    label: 'Single Window for Logistics',
    url: 'https://logistics.public.lu/fr/formalities-procedures/type-goods/plants-wood/wood-packaging-material.html',
    retrieved: '2025-04-08',
  },

  /**
   * Alle drei eingetragenen Produzenten des Landes, in der Reihenfolge des
   * Registers. Nachgeprüft am amtlichen Verzeichnis (Stand 08.04.2025).
   *
   * Wichtig für die Formulierung auf der Seite: das Register führt daneben
   * elf „Revendeurs" (Wiederverkäufer). „Drei Betriebe" stimmt also nur mit
   * dem Zusatz „als Produzent/Hersteller eingetragen" — genau so steht es in
   * der Überschrift und in dieser Tabelle.
   */
  producers: [
    { name: 'Emballages en Bois Kasel Sàrl', town: 'Mertzig', number: '079', self: true },
    { name: 'Bois Brever SA', town: 'Huldang', number: '096', self: false },
    { name: 'Bois Scholtes', town: 'Manternach', number: '101', self: false },
  ],
} as const;

/** Vollstännege Stempeltext, esou wéi en op d'Holz kënnt: `LU – 079  HT`. */
export const stampLine = `${ispm15.countryCode} – ${ispm15.registrationNumber}`;

/**
 * Agrément vum Service Technique de l'Agriculture fir d'Hierstellung vu
 * Paletten a Këschten no den Afouerbestëmmunge vu China, Australien an
 * Neiséiland. Belegt (bestehend Websäit).
 */
export const exportApprovals = ['CN', 'AU', 'NZ'] as const;

/** 9.000 m² Lagerhalen. Belegt (bestehend Websäit). */
export const storageAreaSqm = 9000;
