/**
 * Erzeugt das Abhol-Blatt als PDF — ein A4-Bogen pro Sprache.
 *
 * Warum von Hand und ohne Bibliothek: das Blatt enthält Adresse, Plus Code und
 * Telefon, sonst nichts. Dafür reichen die 14 Standardschriften, die jeder
 * Reader hat; eine PDF-Bibliothek wäre mehr Abhängigkeit als Inhalt.
 *
 * Gedruckt wird NUR, was in `src/data/company.ts` als belegt steht. Der Weg
 * über den Hof steht bewusst nicht drauf: die Schritte stammen aus
 * Fahrerbewertungen, nicht von der Firma (siehe src/data/delivery.ts).
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'public/downloads';
const BLUE = [0x00 / 255, 0x77 / 255, 0xb3 / 255];
const GREY = [0x6b / 255, 0x73 / 255, 0x79 / 255];
const INK = [0x1c / 255, 0x21 / 255, 0x26 / 255];
const LINE = [0xd8 / 255, 0xde / 255, 0xe3 / 255];

const W = 595.28, H = 841.89, M = 56;

/** Zeichen, die WinAnsi anders kodiert als Latin-1. Mehr braucht es nicht. */
const WINANSI = { '–': 0x96, '—': 0x97, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '€': 0x80, '…': 0x85 };

function pdfString(s) {
  const bytes = [];
  for (const ch of s) {
    const code = WINANSI[ch] ?? ch.codePointAt(0);
    const b = code > 255 ? 0x3f : code; // was WinAnsi nicht kennt, wird „?"
    if (b === 0x28 || b === 0x29 || b === 0x5c) bytes.push(0x5c);
    bytes.push(b);
  }
  return Buffer.from(bytes);
}

/** Sammelt Content-Stream-Operatoren. y wird von oben gemessen, das liest sich besser. */
function sheet() {
  const ops = [];
  const rgb = (c) => `${c[0].toFixed(3)} ${c[1].toFixed(3)} ${c[2].toFixed(3)}`;
  return {
    text(s, x, yTop, { size = 10, bold = false, color = INK } = {}) {
      if (!s) return;
      ops.push(Buffer.from(`BT ${rgb(color)} rg /${bold ? 'FB' : 'FR'} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${(H - yTop).toFixed(2)} Tm (`));
      ops.push(pdfString(s));
      ops.push(Buffer.from(') Tj ET\n'));
    },
    image(name, x, yTop, width, height) {
      ops.push(Buffer.from(`q ${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${x.toFixed(2)} ${(H - yTop - height).toFixed(2)} cm /${name} Do Q\n`));
    },
    rule(yTop, { color = LINE, height = 0.75, x = M, width = W - 2 * M } = {}) {
      ops.push(Buffer.from(`${rgb(color)} rg ${x.toFixed(2)} ${(H - yTop - height).toFixed(2)} ${width.toFixed(2)} ${height} re f\n`));
    },
    build: () => Buffer.concat(ops),
  };
}

function buildPdf(content, image) {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /FR 5 0 R /FB 6 0 R >> /XObject << /Im0 7 0 R >> >> /Contents 4 0 R >>`,
    null, // Content-Stream
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    // Das JPEG wandert unverändert in die Datei: DCTDecode ist genau das
    // Format, das der Reader ohnehin dekodiert.
    { dict: `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode >>`, data: image.data },
  ];

  const chunks = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1')];
  const offsets = [];
  let pos = chunks[0].length;

  objects.forEach((body, i) => {
    const n = i + 1;
    offsets[n] = pos;
    const stream = body === null ? { dict: '<<', data: content } : body.data ? body : null;
    const parts = stream
      ? [
          Buffer.from(`${n} 0 obj\n${stream.dict.replace(/>>$/, `/Length ${stream.data.length} >>`).replace(/^<<$/, `<< /Length ${stream.data.length} >>`)}\nstream\n`),
          stream.data,
          Buffer.from('\nendstream\nendobj\n'),
        ]
      : [Buffer.from(`${n} 0 obj\n${body}\nendobj\n`)];
    for (const p of parts) { chunks.push(p); pos += p.length; }
  });

  const xrefAt = pos;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= objects.length; n++) xref += `${String(offsets[n]).padStart(10, '0')} 00000 n \n`;
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  chunks.push(Buffer.from(xref, 'latin1'));
  return Buffer.concat(chunks);
}

// ── Inhalt ──────────────────────────────────────────────────────────────────
const src = fs.readFileSync('src/data/company.ts', 'utf8');
const pick = (key) => src.match(new RegExp(`${key}: '([^']+)'`))?.[1] ?? '';
const co = {
  legalName: pick('legalName'),
  street: pick('street'),
  postalCode: pick('postalCode'),
  locality: pick('locality'),
  plusCode: pick('plusCode'),
  phone: pick('phoneDisplay'),
  phone2: src.match(/display: '(\+352 888 334-23)'/)?.[1] ?? '',
  fax: pick('faxDisplay'),
  email: pick('email'),
  rcs: pick('rcs'),
  vat: pick('vatId'),
};
const geo = { lat: src.match(/latitude: ([\d.]+)/)[1], lon: src.match(/longitude: ([\d.]+)/)[1] };

const val = (v) => (v && typeof v === 'object' && 'value' in v ? v.value : v);

/** Breite und Höhe aus dem SOF-Marker des JPEG lesen — mehr braucht der Reader nicht. */
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('Kein SOF-Marker im JPEG gefunden');
}

const mapData = fs.readFileSync('src/assets/pdf/kaart-mertzig.jpg');
const map = { data: mapData, ...jpegSize(mapData) };

fs.mkdirSync(OUT, { recursive: true });
for (const locale of ['lb', 'de', 'fr', 'en']) {
  const i18n = JSON.parse(fs.readFileSync(`src/i18n/${locale}.json`, 'utf8'));
  const s = Object.fromEntries(Object.entries(i18n.delivery.pdf).map(([k, v]) => [k, val(v)]));
  const country = val(i18n.common.country);

  const p = sheet();
  p.rule(M, { color: BLUE, height: 5 });
  p.text(co.legalName, M, M + 32, { size: 15, bold: true });
  p.text(s.subtitle, M, M + 49, { size: 9.5, color: GREY });
  p.rule(M + 64);

  // Adresse links, Telefon rechts — das sind die zwei Dinge, die ein Fahrer
  // sucht, und sie sollen aus Armlänge lesbar sein.
  const col2 = M + 290;
  let y = M + 100;
  p.text(s.addressLabel.toUpperCase(), M, y, { size: 8, bold: true, color: GREY });
  p.text(co.street, M, y + 32, { size: 25, bold: true });
  p.text(`${co.postalCode} ${co.locality}`, M, y + 62, { size: 25, bold: true });
  p.text(country, M, y + 84, { size: 11, color: GREY });

  p.text(s.contactLabel.toUpperCase(), col2, y, { size: 8, bold: true, color: GREY });
  p.text(co.phone, col2, y + 28, { size: 18, bold: true });
  [[s.phoneAlt, co.phone2], ['Fax', co.fax], ['E-Mail', co.email]]
    .forEach(([k, v], i) => p.text(`${k}: ${v}`, col2, y + 50 + i * 15, { size: 10, color: GREY }));

  y += 106;
  p.rule(y);
  p.text(s.positionLabel.toUpperCase(), M, y + 26, { size: 8, bold: true, color: GREY });
  p.text(co.plusCode, M, y + 44, { size: 13, bold: true });
  p.text(`${s.coordinatesLabel}: ${geo.lat}, ${geo.lon}`, col2, y + 44, { size: 11, color: GREY });

  // Die Karte ist das Nützlichste auf dem Blatt: Marker, Maßstab, Nordpfeil.
  const mapW = W - 2 * M;
  const mapH = (mapW * map.height) / map.width;
  const mapTop = y + 62;
  p.image('Im0', M, mapTop, mapW, mapH);
  p.text('© OpenStreetMap contributors', M, mapTop + mapH + 12, { size: 8, color: GREY });

  p.text(s.note, M, mapTop + mapH + 38, { size: 10 });

  p.rule(H - M - 26);
  p.text(`${co.legalName} · RCS ${co.rcs} · TVA ${co.vat} · kasel.lu`, M, H - M - 8, { size: 8, color: GREY });

  const file = path.join(OUT, `kasel-${locale}.pdf`);
  fs.writeFileSync(file, buildPdf(p.build(), map));
  console.log(`  ${file}  ${(fs.statSync(file).size / 1024).toFixed(1)} kB`);
}
