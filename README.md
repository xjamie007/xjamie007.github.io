# kasel.lu

Website für **Emballages en Bois Kasel S.à r.l.**, 12, Zone Industrielle,
L-9166 Mertzig.

Astro, statisch generiert, vier Sprachen, eine React-Island. Der Zweck der
Seite ist eine qualifizierte Anfrage — nicht Markenaufbau, nicht Shop.

> Diese Datei ist auf Deutsch, weil das Projekt auf Deutsch beauftragt wurde.
> Die Kommentare im Code sind auf Luxemburgisch, weil Luxemburgisch die
> Leitsprache der Seite ist.

---

## Schnellstart

```bash
npm install
npm run dev        # http://localhost:4321
```

```bash
npm run build      # astro check + astro build → dist/
npm run preview    # dist/ ansehen
npm run verify     # Übergabe-Prüfung gegen dist/
npm run todo       # alle offenen Punkte im Code
npm run lb:review  # luxemburgische Einträge, die noch niemand gelesen hat
```

`npm run build` bricht ab, wenn eine Übersetzung fehlt. Das ist Absicht: eine
halb übersetzte Seite darf nicht live gehen.

---

## Was wo liegt

```
src/
  data/          Fakten. Adresse, Register, Maße, Öffnungszeiten, FAQ, Team.
  i18n/          Alle Texte, vier Sprachen. lb.json ist die Leitfassung.
  lib/           crate-rules.ts (Konfigurator-Heuristik), seo.ts, jsonld.ts
  components/    Bausteine. drawings/ und configurator/ erzeugen alle SVG.
  pages/         [lang]/index.astro + [lang]/[slug].astro → 45 Seiten
  styles/        global.css — Tokens, Type-Scale, Layout. Eine Datei.
scripts/         Bilder, Karte, Prüfungen
supabase/        Edge Function, die die Anfrage entgegennimmt
public/fonts/    Archivo + Source Serif 4 als WOFF2 im Projekt
```

**Alles, was eine Zahl oder ein Fakt ist, steht in `src/data/`.
Alles, was ein Satz ist, steht in `src/i18n/`. Im Markup steht keins von
beidem.** Wer das durchhält, hält NAP-Daten, Impressum, JSON-LD und
Maßtabelle automatisch synchron.

---

## Inhalte ändern

| Was | Wo |
|---|---|
| Adresse, Telefon, RCS, MwSt, ISPM-Nummer, Behandlungscode | `src/data/company.ts` |
| Maße, Traglasten, Holzart, Trocknung, CP-Typen | `src/data/products.ts` |
| Öffnungszeiten (Büro **und** Rampe getrennt) | `src/data/hours.ts` |
| Zufahrt, Stellplätze, Übernachtung, Sprachen | `src/data/delivery.ts` |
| Welche FAQ-Frage erscheint | `src/data/faq.ts` |
| Team, Kundenstimmen | `src/data/team.ts`, `src/data/testimonials.ts` |
| Jeder Satz auf der Seite | `src/i18n/{lb,de,fr,en}.json` |
| Schwellwerte des Konfigurators | `src/lib/crate-rules.ts` |

Drei Regeln, die das Projekt trägt:

1. **`null` heißt „auf Anfrage".** Kein Strich, keine geschätzte Zahl. Was
   in der Datendatei fehlt, erscheint im Frontend als „op Nofro" / „auf
   Anfrage" / « sur demande » / "on request".
2. **Leere Liste heißt: Sektion erscheint nicht.** Team und Referenzen sind
   leer, also gibt es diese Sektionen zurzeit nicht. Kein Platzhalter, kein
   grauer Kopf-Icon, keine erfundene Kundenstimme.
3. **`publish: false` heißt: Zeile rendert nicht.** So sind die Angaben für
   Fahrer abgesichert, solange sie nicht bestätigt sind.

---

## Vier Sprachen

`/lb/`, `/de/`, `/fr/`, `/en/`. `/` leitet ohne Verzögerung auf `/lb/` um und
zeigt zusätzlich eine echte Sprachwahl, falls die Weiterleitung nicht greift.
`x-default` zeigt auf die luxemburgische Fassung.

Die Slugs sind pro Sprache eigenständig (`/de/holzpaletten/`,
`/fr/palettes-bois/`, `/en/wooden-pallets/`) und stehen in
`src/i18n/routes.ts`. Der Sprachumschalter bleibt auf derselben Seite.

### Die luxemburgische Fassung ist ein Entwurf

Bei einem Durchgang wurden **45 Einträge korrigiert** — darunter echte
Grammatikfehler, nicht nur Geschmack:

- **Eifeler Regel**: „no Gewiicht **an** Ladegutt" → „**a** Ladegutt". Das
  auslautende -n fällt vor Konsonanten außer d, h, n, t, z.
- **Falsche Wörter**: „Widderver**wennung**" → „Widderver**wendung**",
  „am Een**staz**" → „am **Asaz**", „**Pflanze**pass" → „**Planze**pass"
  (Luxemburgisch kennt kein *pfl-*), „Trocknungsgrad" → „Dréchnungsgrad",
  „Anhaltswäert" → „Richtwäert", „Ouni dëse **Krees**" → „Ouni dësen
  **Hoken**".
- **Numerus und Artikel**: „Déi styliséiert **Ähre** weist" → „**Ähr** weist",
  „wéi **eent** Register" → „wéi **ee** Register", „an **d'**Büro" →
  „an **de** Büro", „**ginn** et dräi Produzenten" → „**gëtt** et".
- **Wortstellung**: „Famillemembere féieren **weider d'Verwaltung**" →
  „… féieren **d'Verwaltung weider**".

Trotzdem steht weiter **jeder** Eintrag in `src/i18n/lb.json` auf
`"reviewed": false`. Eine Fremdkorrektur ersetzt keinen Muttersprachler — sie
macht seine Arbeit nur kürzer. Wo ein Fachbegriff unsicher war, steht der
deutsche Begriff als `"note"` daneben, statt frei zu erfinden.

```bash
npm run lb:review                       # Liste im Terminal
npm run lb:review -- --csv > lb.csv     # Blatt zum Durchgehen
```

Wer einen Satz freigibt, setzt `"reviewed": true`. Rechtschreibung nach dem
**Lëtzebuerger Online Dictionnaire (LOD)** / Zenter fir d'Lëtzebuerger Sprooch.

Der frühere englisch-polnische Fahrerblock auf „Anlieferung & Abholung" ist
**entfernt**. Die Idee war, dass Fahrer aus Polen und dem Balkan keinen
Sprachumschalter klicken — in der Praxis stand auf einer deutschen Seite
unvermittelt ein polnischer Absatz, ohne dass ein Leser verstand, warum. Wer
die Seite auf Englisch braucht, hat oben den Umschalter. Falls der Betrieb den
Block doch will, gehört er hinter eine bewusste Entscheidung, nicht als
Dauerzustand auf jede Sprachfassung.

---

## Was gegen die Quellen geprüft wurde

Jede Sachaussage auf der Seite ist gegen kasel.lu selbst oder gegen das
amtliche Register geprüft. Belegt sind:

- Spezialisierung auf Paletten und Holzkisten, eigene Sägerei, große
  Lagerfläche, Zuschnitt nach Bedarf, Fertigware direkt geliefert oder
  eingelagert und auf Abruf — *(kasel.lu, Home / Services)*
- Agrément des Service Technique de l'Agriculture für China, Australien,
  Neuseeland — *(kasel.lu, Services / Produits)*
- Die drei Produktlinien inklusive **CP-Paletten** und der Ladegüter Kupfer,
  Glas, Aluminium — *(kasel.lu, Produits)*
- Die gesamte Historie 1959 / 1973 / 1994 / 1995 / 1997+2000 / 2002–2008 /
  2008 / 2014, die Reihe Henry → Pierrot → Tom Kasel und die Verwaltung in
  Familienhand — *(kasel.lu, Historique)*
- **9.000 m²** ist die **Gesamtfläche** nach den beiden Hallen von 1997 und
  2000, nicht deren Summe. Der Text sagt das jetzt so.
- RCS **B192110**, TVA **LU27299229**, Fax **+352 838 715** und die zweite
  Durchwahl **-23** — *(kasel.lu, Mentions légales)*. Die -23 wird dort vom
  Betrieb selbst veröffentlicht und steht deshalb auch hier im Impressum.
- **ISPM 15: drei eingetragene Produzenten, Kasel ist Nr. 079** — geprüft am
  amtlichen Verzeichnis des Single Window for Logistics (Stand 08.04.2025):
  Emballages en Bois Kasel Sàrl / Mertzig / 079, Bois Brever SA / Huldange /
  096, Bois Scholtes / Manternach / 101. Das Register führt Kasel in der
  Rubrik „Producteurs", also **FM** (Hersteller), nicht IT (Behandlungsanlage).

Zwei Dinge wurden **entfernt**, weil sie sich nicht belegen ließen:

- **Die Maße 800 × 1200 und 1000 × 1200.** Kasel nennt auf der eigenen Seite
  „Standardpaletten, Paletten aller Art nach Maß und nach technischer
  Spezifikation des Kunden, CP-Paletten" — aber keine konkreten Maße. Die
  Zeilen stehen in `src/data/products.ts` bereit und sind auf
  `published: false`; die Maßtabelle erscheint, sobald echte Werte eingetragen
  sind.
- **„Drei Betriebe dürfen diesen Stempel setzen."** Das Register führt neben
  den drei Produzenten elf Wiederverkäufer. Die Überschrift sagt jetzt, was
  stimmt: *„Drei Betriebe in Luxemburg stehen als Hersteller im
  ISPM-15-Register. Wir sind einer davon."*

## Offene Punkte

`npm run todo` listet sie aus dem Code. Stand der Übergabe: **38**. Keine davon
ist vergessen — sie sind bewusst nicht erfunden. Nach Dringlichkeit:

### Bevor die Seite live geht

1. **Bildrechte klären.** Die Fotos stammen von kasel.lu, der Bildnachweis dort
   lautet „© SAN'DESIGN". Siehe `src/content/README.md`.
2. **`PUBLIC_INQUIRY_ENDPOINT` setzen** (`.env`, siehe `.env.example`) und die
   Edge Function deployen. Ohne das geht keine Anfrage raus, und
   `npm run verify` meldet es als Fehler. Siehe
   `supabase/functions/send-inquiry/README.md`.
3. **Behandlungscode bestätigen** — `HT`, `DB` oder beides?
   (`src/data/company.ts`, `ispm15.treatmentCode`). Er steht groß im Hero, in
   jeder OG-Karte und auf jedem Datenblatt.
4. **Angaben für Fahrer bestätigen** (`src/data/delivery.ts`). Sie stammen aus
   Google-Bewertungen von Fahrern, **nicht von der Firma**, und stehen deshalb
   auf `publish: false`. Solange nichts bestätigt ist, zeigt die Seite Adresse,
   Karte, Plus Code, Telefonnummer und ein Foto des Hofs — und sagt, dass der
   Rest nachkommt. Ein Telefonat schaltet die ganze Sektion frei.
5. **Autorisation d'établissement** nachtragen (`company.businessLicence`).
   Solange sie `null` ist, erscheint die Zeile im Impressum nicht.
6. **Antwortzeit festschreiben.** Formular und Danke-Seite sagen „innerhalb
   eines Arbeitstages". Eine Zusage, die nicht gehalten wird, ist schlimmer als
   keine — wenn es zwei Tage sind, gehören zwei Tage dorthin.
7. **Luxemburgisch lesen lassen** (siehe oben).

### Sobald es geht

8. **Maße und Traglasten eintragen** (`src/data/products.ts`). Die Tabelle
   steht, sie ist nur leer und erscheint deshalb noch nicht. Das ist das
   stärkste fehlende Argument der Palettenseite. Ebenso: welche CP-Typen
   tatsächlich gebaut werden.
9. **Öffnungszeiten** (`src/data/hours.ts`), getrennt nach Büro und Rampe.
   Erst dann erscheinen sie auf der Seite **und** im JSON-LD; ein falscher Wert
   im Schema ist schlimmer als keiner.
10. **FAQ ergänzen:** „Machen Sie auch einzelne Kisten oder nur Serien?" ist
    unbeantwortet und deshalb unsichtbar. Und die Lieferzeit konkretisieren.
11. **Team und Referenzen** — drei Kunden fragen, ob wir sie mit Namen nennen
    dürfen. Es existiert online keine einzige Kundenstimme; alle 14
    Google-Bewertungen kommen von Fahrern.
12. **Ein Foto vom Stempel beim Aufbringen.** Siehe `src/content/README.md`.
13. **Konfigurator-Schwellwerte bestätigen** (`src/lib/crate-rules.ts`):
    Brettstärke nach Gewicht, Kufenabstand, Kilo pro Kufe. Im Frontend sind die
    Ergebnisse als „Anhaltswert" beschriftet, und daneben steht, dass die
    endgültige Auslegung Kasel macht.

## Der größte einzelne SEO-Gewinn

Das **Google-Business-Profil** läuft unter „Maison Kasel Sàrl", ist **nicht
vom Inhaber übernommen**, hat keine Öffnungszeiten, keine Fotos, und 3,3 von 5
aus 14 Bewertungen — die alle von Fahrern stammen, keine von einem Kunden.

Zu tun, in dieser Reihenfolge:

1. Profil übernehmen (Inhaberbestätigung).
2. Namen mit dem Handelsregister vereinheitlichen.
3. Öffnungszeiten eintragen — dieselben wie in `src/data/hours.ts`.
4. Fotos hochladen — dieselben wie in `src/content/README.md`.
5. Kategorie prüfen („Palettenanbieter" → Hersteller).
6. Website verknüpfen.
7. Auf die Fahrer-Bewertungen antworten, mit Link auf
   `/lb/liwwerung-ofholung/`.

Das kostet einen Nachmittag und wirkt lokal stärker als jede Änderung am Code.
Solange es nicht geklärt ist, verlinkt die Website das Profil **nicht**
(`company.googleBusinessProfileUrl` ist `null`).

---

## Formular

Fünf Pflichtfelder: Firma, Ansprechpartner, E-Mail, „Was soll gebaut werden",
Nachricht. Optional und sichtbar: Telefon, Stückzahl, Wunschtermin, Lieferort,
Datei. Das alte Formular fragte Wohnadresse und Postleitzahl — das ist weg.

- **Ohne JavaScript** ist es ein normaler POST. Die Edge Function antwortet mit
  einem 303 auf die Merci-Seite. Es fehlt keine Funktion.
- **Mit JavaScript** stehen Fehlermeldungen am Feld, und die Bestätigung kommt
  ohne Seitenwechsel.
- **Die Konfigurator-Felder gehören über `form="ufro"` zum Anfrageformular**,
  obwohl sie weit oben auf der Seite stehen. Deshalb funktioniert der
  Konfigurator auch ohne Skript vollständig.
- Spam-Schutz: Honeypot plus Prüfung auf dem Server. **Kein Captcha** —
  Captchas kosten echte Anfragen.
- Fehler werden **nie** durch Farbe angezeigt (siehe unten), sondern durch
  Zeichen, Fettung und einen doppelten Rand am Feld.

Einrichtung: `supabase/functions/send-inquiry/README.md`. Zwei Wege, SMTP über
den eigenen Mailserver (bevorzugt, dann ist kein Dritter beteiligt) oder eine
HTTP-API. Die Funktion muss in der Region **eu-central-1** liegen, sonst stimmt
die Datenschutzerklärung nicht.

---

## Die Marke

Alles Sichtbare kommt aus dem, was der Betrieb schon hat — nichts davon ist
erfunden.

**Farbe.** `#0077B3` steht 43-mal im Stylesheet von kasel.lu und ist das Blau
im EK-Logo. Daraus die ganze Palette (`src/styles/global.css`):

| Token | Wert | Wofür |
|---|---|---|
| `--color-blue` | `#0077B3` | Hausfarbe: Flächen, Buttons, Fokusring |
| `--color-blue-deep` | `#00598A` | dieselbe Farbe als Text auf Weiß, 7.5:1 |
| `--color-blue-light` | `#4DA6D4` | dieselbe Farbe auf dunklem Grund, 6.0:1 |
| `--color-ink` | `#1C2126` | Fließtext und dunkle Bänder |
| `--color-black` | `#000000` | Logo — echtes Schwarz, wie in der Marke |
| `--color-grey` | `#6B7379` | Sekundärtext auf Weiß, 4.8:1 |
| `--color-mist` | `#F4F7F9` | zweiter heller Grund |

`npm run verify` misst alle diese Paare gegen WCAG 2.2 AA, statt sie zu
behaupten.

Nebenbei erfüllt die Palette die ISPM-15-Regel von selbst: Rot und Orange sind
der Kennzeichnung gefährlicher Güter vorbehalten und kommen auf dieser Seite
nicht vor — die Prüfung rechnet jeden Hex-Wert in HSL um und schlägt bei
0–42° und 345–360° an.

**Logo.** `src/components/Logo.astro` ist die Vektorfassung von kasel.lu
(`images/svg-172372x218.svg`, ein Illustrator-Export). Es wird **nicht**
nachgezeichnet und nicht umgebaut. In der Originaldatei trugen die blauen
Bestandteile — das „E" und die Zeile EMBALLAGES EN BOIS — die Klasse `st0`;
sie bekommen `--logo-accent`, alles Übrige erbt `currentColor` und kippt auf
dunklem Grund von selbst auf Weiß.

Die Datei besteht aus drei Blöcken, getrennt durch weiße Bänder bei y 138–151
und y 196–203 (gemessen, nicht geschätzt). `variant` schneidet über die
viewBox:

- `mark` — nur EK. Favicon, Apple-Touch-Icon.
- `wordmark` — EK + kasel.lu. Kopfzeile: die Zeile EMBALLAGES EN BOIS wäre dort
  7 px hoch und damit unlesbar.
- `full` — alles. Fußzeile, Wurzelseite, OG-Karten.

**Schrift.** Eine Familie: **Archivo**, variabel, als WOFF2 unter
`public/fonts/`. Neutrale Grotesk, nah an der Schrift im Logo. Die zweite
Familie (Source Serif 4) ist raus — sie passte nicht zu einer blau-weißen
Industriemarke und kostete 222 KB.

**Niemals über die Google-CDN.** Das überträgt die IP des Besuchers in die USA
und ist in der EU abgemahnt worden. Schriften kommen als Datei ins Projekt.

## Ton

Der Text war zu glatt. Typisch für maschinell geschriebene Sätze und in einem
Durchgang entfernt:

- **Gedankenstrich-Pointen.** „Wir schneiden das Holz, wenn Ihre Bestellung da
  ist — nicht vorher, nicht später." Jetzt: „Wir schneiden das Holz erst, wenn
  Ihre Bestellung da ist." Außerhalb der Meta-Titel, wo der Gedankenstrich ein
  normales Trennzeichen ist, steht kein einziger mehr.
- **Sätze, die sich selbst erklären.** „…das heißt, wir sind nicht auf
  Lagermaße angewiesen" → „Weil wir selbst sägen, sind wir nicht an Lagermaße
  gebunden."
- **Aphorismen.** „…spart uns einen Anruf — und Ihnen einen Vormittag" →
  „Je mehr Sie ausfüllen, desto genauer können wir antworten."
- Dabei fiel auf, dass die Lieferzeit-Antwort auf Deutsch, Französisch und
  Englisch noch „sagt Ihnen der Mann, der Ihre Anfrage liest" hieß — nur die
  luxemburgische Fassung war schon korrigiert.

Ein einfacher Test, der das Nachlassen früh zeigt:

```bash
node -e 'const un=v=>v?.value??v; …'   # zählt " — " außerhalb von meta.*
```

## Fotos

17 Aufnahmen des eigenen Betriebs, übernommen von kasel.lu: Halle, Hof,
Paletten- und Kistenstapel, Sägelinie, Palettenmaschine. Originale unter
`src/content/photos/`, ausgelieferte Fassungen als AVIF und WebP unter
`public/img/foto/` (`node scripts/build-photos.mjs`). Welches Foto wo steht:
`src/data/photos.ts`.

> **⚠ Rechte klären, bevor die Seite live geht.** Die Mentions légales von
> kasel.lu nennen als Urheber „Photos: © SAN'DESIGN" — die Agentur der alten
> Seite, nicht den Betrieb. Details und die Liste der noch fehlenden Motive
> stehen in `src/content/README.md`.

Die Originale sind nur 625 × 417 px. Deshalb steht nirgends ein Foto in einem
Slot, der breiter wird — lieber eine Fläche als ein weiches Bild. Das wichtigste
fehlende Motiv ist **der Stempel beim Aufbringen**: er ist das Argument der
ganzen Seite, und es gibt kein Bild davon.

## Weitere Festlegungen

**Die Karte ist eine Datei.** `public/img/kaart-mertzig.*`, aus
OpenStreetMap-Daten einmal erzeugt (`scripts/build-map.mjs`). Beim Aufruf der
Seite geht keine einzige Anfrage nach außen. Der Google-Maps-Link geht erst
beim Klick raus. Attribution steht in der Bildunterschrift und ist Pflicht.

**Keine Cookies, kein Tracking, kein Banner.** Deshalb ist die
Datenschutzerklärung kurz und stimmt.

**Bewegung.** Drei Arten, und keine vierte:

1. **Inhalt kommt beim Scrollen herein** — einmal, dann bleibt er. Ein
   IntersectionObserver, kein Scroll-Listener: der feuert nur, wenn etwas den
   Rand kreuzt, nicht bei jedem Pixel. Was gemeinsam hereinkommt, kommt um je
   70 ms versetzt, gedeckelt bei fünf Stufen. Jedes Element wird nach dem
   ersten Mal abgemeldet — was gelesen wurde, verschwindet beim Zurückscrollen
   nicht wieder.
2. **Was anklickbar ist, antwortet** — auf Zeiger *und* auf Finger: Fotos
   ziehen leicht an (`@media (hover: hover)`, damit es auf dem Handy nicht
   klebt), Buttons sinken beim Drücken um 1 px, Links lassen ihren Unterstrich
   aus dem Wort herauswachsen statt ihn einzublenden.
3. **Der Kopf zeigt an, dass gescrollt wurde** — ein Schatten, sonst nichts.
4. **Der Zeitstrahl der Historie füllt sich beim Scrollen** — über
   `animation-timeline: view()`, also ohne Scroll-Listener und ohne eine Zeile
   JavaScript. Wo der Browser das noch nicht kann, steht die Linie fertig da;
   es fehlt nichts, es bewegt sich nur nichts.

Dazu das IPPC-Cachet, das beim Laden gesetzt wird: 220 ms, von `scale(1.045)`
auf `scale(1)`. Dasselbe Keyframe benutzt der Konfigurator, wenn das Cachet zum
ersten Mal in der Zeichnung erscheint.

Alles hängt an einer `.js`-Klasse am `<html>`: **ohne Skript steht jeder Inhalt
sofort da**, nichts ist versteckt. `prefers-reduced-motion: reduce` schaltet die
Bewegung ab, nicht den Inhalt.

**Eine Nummerierung.** Der Weg des LKW (Einfahrt → Hof → Rampe → Papiere), weil
das eine echte Reihenfolge ist. Produkte sind nicht nummeriert.

**Ein lautes Element.** Der Konfigurator. Alles andere bleibt still.

## Der Rhythmus der Seite

Eine weiße Bahn mit zwei dunklen Blöcken darin sah nach Rohbau aus. Es gibt
jetzt drei helle Gründe, und jeder Wechsel ist ein weicher Verlauf statt einer
Kante:

| | Grund |
|---|---|
| Hero | Ink, mit einem Schimmer der Hausfarbe oben rechts |
| Auf einen Blick | Weiß |
| Was wir machen | `--color-mist` |
| Konfigurator | Weiß |
| Braucht es einen Stempel | `--color-mist` |
| Anlieferung | Weiß |
| Historie | `--color-blue-tint` |
| Häufig gefragt | `--color-mist` |
| Anfrage | Ink |

**„Über uns" und die Etappen** sind ein Block, kein Paar aus zwei Sektionen:
erst wer der Betrieb ist (kurzer Text, Foto aus der Halle), dann wie er dahin
gekommen ist. Die Etappen laufen als waagerechtes Band über acht Spalten, weil
dieselbe Information untereinander die halbe Breite leer stehen ließ. Die
senkrechte Zeitleiste steht weiter auf `/historie/`, wo sie mit acht
ausführlichen Einträgen richtig ist.

**Die Karte** auf `/anlieferung-abholung/` und `/kontakt/` steht in einer
begrenzten Spalte von 22 rem neben den Adressdaten. Über die volle Seitenbreite
nahm sie fast den ganzen Bildschirm ein, ohne mehr zu zeigen — der Ausschnitt
ist derselbe.

**Der Pfeil an den Produktlinien** ist eine bewusste Ausnahme. Ein „→" hinter
jedem Link stand ursprünglich auf der Liste der Vorlagen-Muster, die vermieden
werden sollten; der Auftraggeber hat ihn ausdrücklich gewünscht. Er läuft beim
Überfahren los und ist an den Link gebunden, nicht an einen Knopf.

**Häufig gefragt** ist zweispaltig: links Überschrift und der Hinweis, was zu
tun ist, wenn die eigene Frage fehlt (mit Knopf), rechts die Fragen als Karten
mit Nummer, Schatten beim Überfahren und blauem Rand, solange eine offen ist.

Das **Anfrageformular** steht mittig. Links ausgerichtet sah der dunkle Block
am Seitenende halb leer aus; der Fließtext darin bleibt linksbündig.

## Am Handy

Die **Schiene gibt es unter 60 rem nicht**. Sie ist eine Referenzspalte für den
Desktop; am Handy klappte sie über den Inhalt und wiederholte dort meistens,
was zwei Zeilen tiefer ohnehin stand — Telefonnummer, Adresse, Nummer 079. Das
las sich wie ein Fehler, nicht wie ein Register.

Die **Karte** wird unter 48 rem auf 12 rem Höhe beschnitten (`object-fit:
cover`) statt verkleinert. Im Originalverhältnis fraß sie fast ein Drittel des
Bildschirms; verkleinert wäre die Beschriftung nicht mehr lesbar gewesen.

Das **Cachet im Hero** ragt erst über die Fotokante hinaus, wenn daneben Platz
ist. Am schmalen Bildschirm liegt es im Bild, sonst hängt es unten aus dem Band.

## Was die Startseite leisten muss

Wer auf `/` landet, soll in **fünfzehn Sekunden** wissen, was der Betrieb
macht — ohne einen Absatz zu lesen. Deshalb in dieser Reihenfolge:

1. **Ein Satz.** „Paletten und Kisten aus Holz, nach Maß gebaut."
2. **Vier Zahlen.** Seit 1959 · Sägerei im Haus · 9.000 m² Lager · Export
   weltweit. Vier Begriffe, vier Werte, kein Fließtext.
3. **Die drei Produktlinien** mit Foto.

Erst danach kommt alles Weitere, jeweils als Kurzfassung mit Link auf die
Seite, die es ausführt. Die Startseite läuft durchgehend **ohne Schiene**
(`<Section wide>`): das technische Register gehört auf die Detailseiten, hier
zählt schnelles Erfassen.

**ISPM 15 ist zurückgenommen.** Auf der Startseite steht dazu genau ein Block,
und er beantwortet die einzige Frage, die einen Einkäufer bewegt: *brauche ich
für mein Ziel einen Stempel?* Zwei Zeilen — China/Australien/Neuseeland: ja,
innerhalb der EU: nein — ein Satz Begründung, ein Link. Was auf dem Cachet
steht, welches Register, welche Nummer: das steht auf `/ispm-15/`, wo danach
gesucht wird. Auch diese Seite führt jetzt mit „wann brauchen Sie was"; der
Registereintrag steht als Beleg ganz am Ende.

## Konfigurator

`src/components/configurator/` — die einzige React-Island, `client:visible`,
kein Zeichen- oder 3D-Paket. Das isometrische SVG entsteht aus zwei Zeilen
Sinus und Cosinus.

Er gibt **keinen Preis** und **keine verbindliche Konstruktionsangabe** aus. Er
zeichnet, was der Nutzer beschreibt, sagt, was aus dem Ziel folgt, und
überträgt alles in die Anfrage — sichtbar, nicht in versteckten Feldern.

Die Radio-Zeile „geschlossen / gelattet" hatte den Punkt neben statt vor dem
Wort. Ursache war eine Regel `.cfg__field label { display: block }`, die auch
das `<label>` der Radio-Zeile traf und dessen `inline-flex` aushebelte —
inzwischen `.cfg__field > label`. Genau die Selektor-Falle, vor der der
Standard warnt.

**Das Ladegut ist ein freies Textfeld**, keine Auswahlliste. Kasel schreibt auf
der eigenen Seite „pour l'emballage et le transfert outre-mer de produits de
cuivre, de verre, d'aluminium, **etc.**" — das „etc." ist der Punkt, gebaut wird
für alles, was über See geht. Eine Liste mit drei Einträgen hätte den Betrieb
kleiner gemacht, als er ist. Die vier häufigen Fälle stehen als `<datalist>`
darunter und steuern die Voreinstellung der Bauweise; steht dort etwas anderes,
bleibt die Bauweise stehen, statt geraten zu werden.

**Das Ziel steht voreingestellt auf EU**, nicht auf China. Der nächstliegende
Fall, nicht der spektakulärste. Das Cachet erscheint dadurch erst, wenn jemand
ein Drittland wählt — mit der Anpressbewegung, und genau dann, wenn es etwas
bedeutet.

Wer konfiguriert hat und es sich anders überlegt, kann die Maße über
**„Maße entfernen"** wieder herausnehmen — dann geht eine ganz normale Anfrage
raus. Der Knopf leert die Felder; es reicht nicht, nur die Zusammenfassung
auszublenden, weil die Felder über `form="ufro-form"` zum Formular gehören und
sonst weiter mitfahren würden.

Die Felder starten **leer**. Die Zeichnung zeigt so lange ein beschriftetes
Beispiel. Grund: sonst bekäme Tom bei jeder Palettenanfrage eine
Kistenbeschreibung mit, die niemand eingegeben hat.

---

## Deployment

GitHub Actions → GitHub Pages (`.github/workflows/deploy.yml`). Bei jedem Push
auf `main`: `astro check`, `astro build`, `node scripts/verify.mjs`. Was die
Prüfung nicht besteht, geht nicht live.

`PUBLIC_INQUIRY_ENDPOINT` als Repository-Secret hinterlegen.

Für einen anderen Host bleibt der `build`-Job identisch; nur `deploy` wird
ersetzt. `site` in `astro.config.mjs` muss zur Domain passen, sonst stimmen
Canonicals, hreflang und Sitemap nicht.

---

## Vor der Übergabe

`npm run build && npm run verify` prüft automatisch:

- kein roter oder oranger Farbwert in CSS und HTML
- vier Sprachen deckungsgleich, ungeprüfte lb-Einträge gezählt
- Title 50–60, Description 150–160 auf allen indexierten Seiten
- fünf `hreflang` inklusive `x-default`, Canonical, genau eine `<h1>` je Seite
- `alt` an jedem Bild, `lang` an jedem `<html>`, Name an jedem `role="img"`
- keine toten internen Links, keine toten Anker
- JavaScript unter 100 KB gzip (Stand: **73.9 KB**)
- Formular-Endpunkt gesetzt
- keine Schlüssel im ausgelieferten Code
- Sitemap (40 URLs), robots.txt, Favicon, vier OG-Bilder

Von Hand bleibt:

- [ ] Auf einem echten Handy getestet, nicht nur im Emulator
- [ ] Nur mit der Tastatur komplett bedienbar, Fokus immer sichtbar
- [ ] Mit Screenreader durch den Konfigurator (`aria-live` sagt die
      abgeleiteten Werte an)
- [ ] Formular real abgeschickt, Mail angekommen, Anhang dabei
- [ ] Lighthouse: Performance ≥ 95, Accessibility 100, Best Practices ≥ 95,
      SEO 100 — mobil, unter gedrosselter Verbindung
- [ ] Strukturierte Daten im Rich-Results-Test fehlerfrei
- [ ] Impressum und Datenschutz mit dem Steuerberater gegengelesen

## Bilder und Karte neu erzeugen

```bash
node scripts/build-photos.mjs   # src/content/photos/ → public/img/foto/ (AVIF + WebP)
node scripts/build-images.mjs   # Favicon, Apple-Touch-Icon, 4 OG-Karten
node scripts/build-map.mjs      # statische Karte aus den Kacheln in scripts/tiles/
```

Beide schreiben nach `public/`. Sie laufen nicht im Build mit — die Ergebnisse
liegen im Repository, damit ein Build ohne Netz funktioniert.
