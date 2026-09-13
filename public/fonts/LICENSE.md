# Schrift

**Archivo** (Variable), unter der **SIL Open Font License 1.1**. Sie darf
selbst gehostet werden und liegt deshalb als Datei im Projekt — sie wird
**nicht** über die Google-CDN geladen, das würde die IP jedes Besuchers in die
USA übertragen und ist in der EU abgemahnt worden.

| Datei | Achsen |
|---|---|
| `archivo-var-latin.woff2` | `wght` 100–900, `wdth` 62–125 |
| `archivo-var-latin-ext.woff2` | dieselben, Latin-Ext |

Lizenztext: <https://openfontlicense.org/open-font-license-official-text/>
Upstream: <https://github.com/Omnibus-Type/Archivo>

Nur der Schnitt `normal` (aufrecht) liegt im Projekt. Kursiv wird nicht
gebraucht — die Gestaltung hebt kein einzelnes Wort kursiv hervor.

`scripts/fonts/Archivo.ttf` ist dieselbe Schrift als TrueType und wird nur
beim Rastern der OG-Karten gebraucht (`scripts/build-images.mjs`). Sie wird
nicht ausgeliefert.
