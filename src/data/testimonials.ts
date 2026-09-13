/**
 * Referenzen / Kundestëmmen.
 *
 * Et existéiert online keng eenzeg Kundestëmm. Déi 14 Google-Bewertungen
 * kommen ALLE vu Chauffeuren, keng vun engem Client. Also: keng erfonnte
 * Testimonials, och keng anonymiséiert.
 *
 * D'Sektioun rendert nëmmen, wann hei Anträg stinn.
 *
 * TODO[FEHLT] Client: dräi Clienten ufroen, ob mir se mat Numm nenne dierfen.
 */
export interface Testimonial {
  id: string;
  /** Zitat, direkt an der Sprooch vum Client. */
  quote: string;
  author: string;
  company: string;
  /** Sprooch vum Zitat — fir `lang` um <blockquote>. */
  lang: 'lb' | 'de' | 'fr' | 'en';
}

export const testimonials: Testimonial[] = [];
