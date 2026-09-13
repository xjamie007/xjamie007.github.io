/**
 * Liwwerung & Ofholung — d'Säit fir Chauffeuren.
 *
 * Firwat dat eng eege Sektioun AN eng eege Säit ass: all 14 ëffentlech
 * Bewertungen zum Betrib kommen vu Chauffeuren, keng eenzeg vun engem Client.
 * D'Rëbbelung do ass behiewbar, andeem ee virdru seet, wéi et leeft.
 *
 * ⚠ D'Ugaben ënnen hunn ee gemeinsame Problem: si stamen aus de Bewertunge vu
 * Chauffeuren, NET vun der Firma. Si stinn dofir op `publish: false` a rendere
 * NET, bis de Client se bestätegt huet. Dat ass Absicht — eng falsch Ugab op
 * enger Fahrersäit schéckt e 40-Tonner op déi falsch Säit vun der Hal.
 *
 * TODO[UNBESTÄTIGT] Client: all `publish`-Flag hei duerchgoen an op `true`
 * setzen, wat stëmmt. Wat net stëmmt, korrigéieren oder op `false` loossen.
 */

export interface DeliveryFact {
  /** `false` = rendert net. */
  publish: boolean;
  /** Zuel oder Wäert; `null` wann et nëmmen den i18n-Text brauch. */
  value?: number | string | null;
}

export const delivery = {
  /**
   * Zoufaart iwwer d'Haaptha. Dat ass den eenzegen Zougang zu Haff a Rampe.
   * Quell: Chauffeursbewertung. TODO[UNBESTÄTIGT] Stëmmt et, datt d'Zoufaart
   * nëmmen iwwer d'Haapthal geet?
   */
  accessThroughMainHall: { publish: false } as DeliveryFact,

  /** Véier LKW-Stellplazen. Quell: Chauffeursbewertung. TODO[UNBESTÄTIGT] Wéi vill Stellplazen si wierklech do? */
  truckSpaces: { publish: false, value: 4 } as DeliveryFact,

  /** Iwwernuechtung méiglech. Quell: Chauffeursbewertung. TODO[UNBESTÄTIGT] Dierfe Chauffeuren iwwernuechten? */
  overnight: { publish: false } as DeliveryFact,

  /**
   * D'Pabeieren (CMR) ginn un de Camion bruecht.
   * Quell: méi Chauffeursbewertungen, dovun zwou onofhängeg.
   * TODO[UNBESTÄTIGT] Ginn d'Pabeieren tatsächlech un de Camion bruecht?
   */
  paperworkToTruck: { publish: false } as DeliveryFact,

  /**
   * Sprooche beim Empfang. Lëtzebuergesch/Däitsch/Franséisch sinn am Land
   * selbstverständlech; Englesch ass duerch eng Chauffeursbewertung belegt.
   * TODO[UNBESTÄTIGT] Client: bestätegen, an ergänzen, wa méi geschwat gëtt.
   */
  languages: { publish: false, value: ['lb', 'de', 'fr', 'en'] },

  /**
   * Separat Telefonsnummer fir Chauffeuren.
   * TODO[FEHLT] Wann et keng gëtt, bleift `null` an et steet d'Haaptnummer do.
   */
  driverPhone: null as string | null,

  /**
   * Nummeréierte Wee. Dat ass déi EENZEG Nummeréierung op der ganzer Säit,
   * well et eng echt Reihenfolleg ass. Text an `src/i18n/*.json`.
   * D'Schrëtt selwer stinn ënner Virbehalt (Zoufaart), dofir hänkt d'Rendere
   * vum Flag `accessThroughMainHall` of.
   */
  steps: ['entry', 'yard', 'ramp', 'papers'] as const,
} as const;

export type DeliveryStep = (typeof delivery.steps)[number];
