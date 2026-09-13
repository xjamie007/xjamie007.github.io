/**
 * Historik. All Joer ass belegt (bestehend Websäit kasel.lu).
 * Den Text zu all Joer läit an `src/i18n/*.json` ënner `history.<id>`.
 *
 * Bewusst eine knappe Liste, keine Scroll-Timeline: die Jahreszahlen sind
 * Daten, keine Dekoration. Bois Brever hat „75 Years Experience" als Kachel
 * bereits — eine große Erfahrungszahl sähe hier nur nach Nachmachen aus.
 *
 * Zum Verhältnis der beiden Firmennamen (auf der alten Seite belegt):
 * „Maison Kasel Sàrl" wurde 1973 in Bissen gegründet und besteht weiter;
 * die 2014 gegründete „Emballages en Bois Kasel Sàrl" unter Tom Kasel hat
 * die PRODUKTION übernommen, die Verwaltung bleibt in Familienhand. Das
 * Impressum nennt deshalb ausschließlich Emballages en Bois Kasel (B192110),
 * die Historie nennt Maison Kasel als das, was sie ist: der ältere Name.
 */
export interface HistoryEntry {
  id: string;
  /** Wat als Zuel um Bildschierm steet. */
  year: string;
}

export const history: HistoryEntry[] = [
  { id: '1959', year: '1959' },
  { id: '1973', year: '1973' },
  { id: '1994', year: '1994' },
  { id: '1995', year: '1995' },
  { id: '1997', year: '1997 · 2000' },
  { id: '2002', year: '2002–2008' },
  { id: '2008', year: '2008' },
  { id: '2014', year: '2014' },
];
