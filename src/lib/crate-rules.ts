/**
 * Hiweislogik fir de Këschtekonfigurator.
 *
 * ══ WAT DËS DATEI IS UN WAT SI NET IS ═══════════════════════════════════════
 * Si ass eng HEURISTIK, fir datt d'Zeechnung plausibel ausgesäit an de Client
 * eng Virstellung kritt. Si ass KENG technesch Auslegung, KENG Traglaaschtformel
 * a KENG Normtabell. All Wäert, deen doraus kënnt, gëtt am Frontend als
 * „Anhaltswäert" beschrëft, mat dem Saz doniewent, datt déi lescht Auslegung
 * Kasel mécht.
 *
 * All Schwellwäert steet hei un EENER Plaz. Néierens soss am Code stinn Zuelen.
 *
 * TODO[UNBESTÄTIGT] Kasel muss dës Schwellwäerter bestätegen oder duerch hir
 * eege ersetzen. Bis dohin sinn et virsiichteg gewielten Defaults, keng Zousoen.
 * ════════════════════════════════════════════════════════════════════════════
 */
import type { CargoKind, CrateBuild, Destination } from '../data/products';

export const RULES = {
  /** Spill ronderëm d'Ladegutt, pro Säit, a mm. */
  clearanceMm: 20,

  /**
   * Brietdicken no Gewiicht, a mm. Éischt Zeil, déi passt, gëllt.
   * TODO[UNBESTÄTIGT] Brietdicken pro Gewiichtsklass vu Kasel bestätege loossen.
   */
  boardThickness: [
    { upToKg: 200, mm: 15 },
    { upToKg: 800, mm: 19 },
    { upToKg: 2000, mm: 22 },
    { upToKg: Infinity, mm: 25 },
  ],

  /** Héicht vun de Kuffen, a mm — esou vill, datt e Stapler drënner kënnt. */
  skidHeightMm: 80,
  /** Breet vun enger Kuff a Fuertrichtung, a mm. */
  skidWidthMm: 95,
  /** Ongeféier all esou vill mm Längt eng weider Kuff. TODO[UNBESTÄTIGT] Kuffenofstand bestätegen. */
  skidSpacingMm: 1100,
  /** Zousätzlech Kuff, wa méi wéi esou vill kg pro Kuff kéimen. TODO[UNBESTÄTIGT] Kilo pro Kuff bestätegen. */
  kgPerSkid: 700,
  minSkids: 2,
  maxSkids: 6,

  /** Grenzen fir d'Eingabfelder — verhënnert onsënneg Zeechnungen. */
  limits: {
    lengthMm: { min: 100, max: 12000, step: 10 },
    widthMm: { min: 100, max: 3000, step: 10 },
    heightMm: { min: 100, max: 3000, step: 10 },
    weightKg: { min: 1, max: 30000, step: 1 },
    qty: { min: 1, max: 9999, step: 1 },
  },
} as const;

/**
 * Voreinstellung der Bauweise nach Ladegut. Der Benutzer kann umschalten.
 * `null` heißt: das eingetippte Ladegut ist keiner der bekannten Fälle — dann
 * bleibt die Bauweise stehen, wie sie ist, statt zu raten.
 */
export function defaultBuild(cargo: CargoKind | null): CrateBuild {
  // Glas verdréit weder Stëbs nach Wieder → zou.
  // Maschinnen an Aluminium sinn a sech stabil → gelatt duergeet.
  // Koffer geet béid Weeër; zou ass déi méi sécher Voreestellung.
  switch (cargo) {
    case 'glass':
    case 'copper':
      return 'closed';
    case 'machine':
    case 'aluminium':
      return 'slatted';
    default:
      return 'closed';
  }
}

/**
 * Freitext auf einen bekannten Fall abbilden — über die Beschriftungen in der
 * Sprache der Seite, damit „Kupfer", „cuivre" und „copper" dasselbe treffen.
 * Kein Treffer heißt kein Treffer; es wird nichts geraten.
 */
export function matchCargo(text: string, labels: Record<string, string>): CargoKind | null {
  const needle = text.trim().toLowerCase();
  if (!needle) return null;
  for (const [key, label] of Object.entries(labels)) {
    if (label.trim().toLowerCase() === needle) return key as CargoKind;
  }
  return null;
}

/**
 * Brauch d'Zil e ISPM-15-behandelt Holz mat IPPC-Stempel?
 * Bannent der EU: neen. Drëttland: jo.
 * Dat ass keng Heuristik, dat ass d'Norm.
 */
export function needsIppc(dest: Destination): boolean {
  return dest !== 'eu';
}

export function boardThicknessMm(weightKg: number): number {
  const row = RULES.boardThickness.find((r) => weightKg <= r.upToKg);
  return row ? row.mm : RULES.boardThickness[RULES.boardThickness.length - 1].mm;
}

/** Anhaltswäert. Skaléiert mat der Längt an, wann néideg, mam Gewiicht. */
export function skidCount(lengthMm: number, weightKg: number): number {
  const bySpan = Math.ceil(lengthMm / RULES.skidSpacingMm) + 1;
  const byWeight = Math.ceil(weightKg / RULES.kgPerSkid);
  const n = Math.max(RULES.minSkids, bySpan, byWeight);
  return Math.min(RULES.maxSkids, n);
}

export interface CrateInput {
  innerLengthMm: number;
  innerWidthMm: number;
  innerHeightMm: number;
  weightKg: number;
  cargo: CargoKind;
  destination: Destination;
  build: CrateBuild;
  quantity: number;
}

export interface CrateDerived {
  boardMm: number;
  outerLengthMm: number;
  outerWidthMm: number;
  outerHeightMm: number;
  skids: number;
  skidHeightMm: number;
  /** Baussevolume a m³, op zwou Nokommastellen. */
  volumeM3: number;
  ippc: boolean;
}

/**
 * Baussemooss = Bannemooss + Spill + zweemol Brietdicken; ënnen dozou
 * d'Kuffenhéicht. Méi ass et net — an et soll och net méi sinn.
 */
export function derive(input: CrateInput): CrateDerived {
  const board = boardThicknessMm(input.weightKg);
  const pad = RULES.clearanceMm * 2 + board * 2;
  const outerLengthMm = Math.round(input.innerLengthMm + pad);
  const outerWidthMm = Math.round(input.innerWidthMm + pad);
  const outerHeightMm = Math.round(input.innerHeightMm + pad + RULES.skidHeightMm);
  return {
    boardMm: board,
    outerLengthMm,
    outerWidthMm,
    outerHeightMm,
    skids: skidCount(outerLengthMm, input.weightKg),
    skidHeightMm: RULES.skidHeightMm,
    volumeM3: Math.round((outerLengthMm * outerWidthMm * outerHeightMm) / 1e7) / 100,
    ippc: needsIppc(input.destination),
  };
}

/** Wäerter, mat deene mir ufänken — realistesch Exportkëscht, keng Nullen. */
export const DEFAULT_INPUT: CrateInput = {
  innerLengthMm: 1200,
  innerWidthMm: 800,
  innerHeightMm: 900,
  weightKg: 850,
  cargo: 'copper',
  // EU als Voreinstellung: der nächstliegende Fall, nicht der spektakulärste.
  destination: 'eu',
  build: 'closed',
  quantity: 10,
};
