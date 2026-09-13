# Bildmaterial

## Woher die Fotos kommen

Die 17 Originale unter `src/content/photos/` stammen von **kasel.lu** — es sind
die Fotos des eigenen Betriebs, die dort seit 2016 stehen: Halle, Hof,
Palettenstapel, Kisten, Sägelinie, Palettenmaschine.

```
produkte_1 … produkte_12      Halle, Hof, Paletten- und Kistenstapel, Schnittholz
produktion_1 … produktion_5   Palettenmaschine, Sägelinie, Mitarbeiter an der Anlage
```

`node scripts/build-photos.mjs` erzeugt daraus `public/img/foto/` als **AVIF
und WebP** in zwei Breiten. Welches Foto wo steht, regelt
`src/data/photos.ts`; die Alt-Texte stehen in allen vier Sprachen unter
`photos.*` in `src/i18n/`.

## ⚠ Die Rechte müssen geklärt werden

Die Mentions légales von kasel.lu nennen als Urheber:

> Photos: © SAN'DESIGN

Das ist die Agentur, die die alte Seite gebaut hat — **nicht** der Betrieb.
Bevor die neue Seite live geht, muss schriftlich vorliegen, dass Kasel die
Nutzungsrechte an diesen Aufnahmen hat. Zwei Wege:

1. **Rechte bestätigen lassen.** Eine Mail von SAN'DESIGN genügt meistens; bei
   einem Auftragswerk liegen die Rechte oft ohnehin beim Auftraggeber.
2. **Neu fotografieren.** Dann die Liste unten abarbeiten. Die neuen Dateien
   einfach unter demselben Namen in `src/content/photos/` legen und
   `npm run build` — Format, Größen und Alt-Texte bleiben, wie sie sind.

Der Bildnachweis steht bereits im Impressum (`LegalPage.astro`).

## Was noch fehlt

Die vorhandenen Fotos decken Halle, Hof, Ware und Maschinen ab. Drei Motive
fehlen und würden die Seite deutlich stärker machen:

| Motiv | Wofür | Format | Verhältnis | Mindestbreite |
|---|---|---|---|---|
| **Der Stempel beim Aufbringen** — das Eisen am Holz, der Brandfleck frisch | Sektion „Der Stempel", ISPM-15-Seite | AVIF + WebP | 3:2 quer | 2400 px |
| **Tom Kasel**, Porträt im Betrieb, nicht im Studio | Team-Sektion (erscheint erst mit `src/data/team.ts`) | AVIF + WebP | 1:1 | 1200 px |
| **Die Rampe von außen**, aus der Sicht des Fahrers im Führerhaus | Seite „Anlieferung & Abholung" | AVIF + WebP | 16:9 quer | 2000 px |

Das erste ist das wichtigste: der Stempel ist das Argument der ganzen Seite,
und es gibt kein Foto davon.

## Auflösung

Die vorhandenen Originale sind nur **625 × 417 px**. Deshalb wird nirgends
hochskaliert und kein Foto in einen Slot gesetzt, der breiter als 625 px wird
— lieber eine Fläche als ein weichgezogenes Bild. Wer neu fotografiert, sollte
mindestens 2400 px Breite liefern; dann kann `scripts/build-photos.mjs` um
größere Breiten ergänzt werden (`WIDTHS` in der Datei).

## Wie Fotos aussehen sollen

- **Wirklich der Betrieb.** Kein Stockfoto. Der ganze Punkt dieser Seite ist,
  dass sie nachprüfbar ist.
- **Tageslicht, keine Blitzhärte.** Die vorhandenen Aufnahmen sind so gemacht;
  neue sollten dazu passen.
- **Nah rangehen.** Stapelfotos aus der Ferne machen alle Wettbewerber. Die
  Kante eines Bretts, der Stempel am Holz, die Hand am Nagelapparat.
- Querformat. Hochformat passt nicht ins Layout.
