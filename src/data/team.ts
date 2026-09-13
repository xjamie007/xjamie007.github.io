/**
 * Equipe.
 *
 * Belegt sinn: Tom Kasel (Gérant) an Nadine Lanter-Kasel (Uspriechpartnerin,
 * Quell Editus) — d'ROLL vun der Madamm Lanter-Kasel ass awer UNBESTÄTIGT.
 * Weider Nimm a Rollen: TODO[FEHLT].
 *
 * D'Sektioun rendert nëmmen, wann hei Anträg stinn. Solaang d'Lëscht eidel ass,
 * gëtt et op der Startsäit guer keng Equipe-Sektioun — kee Platzhalter, kee
 * groe Kapp-Icon.
 *
 * TODO[FEHLT] Client: Nimm, Rollen, Duerchwal a Fotoen. Eréischt dann uschalten.
 */
export interface TeamMember {
  id: string;
  name: string;
  /** i18n-Schlëssel fir d'Roll, z. B. `team.role.gerant`. */
  roleKey: string;
  email?: string;
  phone?: string;
  /** Datei ënner `/img/team/…` — Format: kuck `src/content/README.md`. */
  photo?: string;
}

export const team: TeamMember[] = [];
