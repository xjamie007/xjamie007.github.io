/**
 * D'Këscht als isometrescht Drohtgitter.
 *
 * Selwer gezeechent — keng Zeechen- a keng 3D-Bibliothéik. Eng Bibliothéik fir
 * dat hei wier 40 bis 300 KB JavaScript fir eppes, wat mat zwou Zeile Sinus a
 * Cosinus geet, an hätt d'Budget vun 100 KB fir d'ganz Säit gesprengt.
 *
 * D'Zeechnung ass AUSGAB, kee Bedienelement: `role="img"` plus en `aria-label`,
 * dat de Zoustand a Wierder beschreift. D'Faarf allleng dréit näischt — de
 * Stempel gëtt zousätzlech mat enger Fahn beschrëft.
 */
import { useEffect, useRef, useState } from 'react';
import type { CrateBuild } from '../../data/products';

const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);

/* Gréisst vum Zeechenblat. Bewosst kleng gehalen: esou bleift 1 Eenheet no bei
   1 Pixel, an d'Moosszuele bleiwen och um Handy iwwer 12 px. */
const VB = { w: 620, h: 450 };
const PAD = { left: 104, right: 44, top: 28, bottom: 84 };
const BOX = { w: VB.w - PAD.left - PAD.right, h: VB.h - PAD.top - PAD.bottom };

const FONT = 'Archivo, Helvetica Neue, Arial, sans-serif';
const PAPER = { fill: 'var(--band-bg, #FFFFFF)' } as const;

export interface CrateSvgLabels {
  outer: string;
  length: string;
  width: string;
  height: string;
  ippc: string;
  example: string;
  ariaLabel: string;
}

export interface CrateSvgProps {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  skidHeightMm: number;
  skids: number;
  build: CrateBuild;
  ippc: boolean;
  isExample: boolean;
  labels: CrateSvgLabels;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

export default function CrateSvg(props: CrateSvgProps) {
  const { lengthMm: L0, widthMm: W0, heightMm: H0, skidHeightMm, skids, build, ippc, isExample, labels, svgRef } = props;

  /* De Stempel gëtt gesat — mat derselwechter Upressbewegung wéi d'Marke am
     Hero, an nëmmen EEMOL, beim éischten Erschéngen. */
  const [pressing, setPressing] = useState(false);
  const seen = useRef(false);
  useEffect(() => {
    if (ippc && !seen.current) {
      seen.current = true;
      setPressing(true);
      const id = window.setTimeout(() => setPressing(false), 280);
      return () => window.clearTimeout(id);
    }
    if (!ippc) seen.current = false;
    return undefined;
  }, [ippc]);

  const k = Math.min(BOX.w / ((L0 + W0) * C), BOX.h / ((L0 + W0) * S + H0));
  const L = L0 * k, W = W0 * k, H = H0 * k, SKH = skidHeightMm * k;

  const ox = PAD.left + W * C;
  const oy = PAD.top + H;
  const P = (x: number, y: number, z: number): [number, number] => [ox + (x - z) * C, oy + (x + z) * S - y];
  const pt = (x: number, y: number, z: number) => P(x, y, z).join(',');

  const bodyBottom = SKH;

  // Déi dräi sichtbar Flächen
  const faceTop = [pt(0, H, 0), pt(L, H, 0), pt(L, H, W), pt(0, H, W)].join(' ');
  const faceRight = [pt(L, H, 0), pt(L, H, W), pt(L, bodyBottom, W), pt(L, bodyBottom, 0)].join(' ');
  const faceFront = [pt(0, H, W), pt(L, H, W), pt(L, bodyBottom, W), pt(0, bodyBottom, W)].join(' ');

  // Bepliankung oder Lattung
  const planks: string[] = [];
  if (build === 'closed') {
    const nx = Math.max(3, Math.min(10, Math.round(L0 / 180)));
    const nz = Math.max(2, Math.min(8, Math.round(W0 / 180)));
    for (let i = 1; i < nx; i++) {
      const x = (L / nx) * i;
      planks.push(`M${pt(x, H, W)}L${pt(x, bodyBottom, W)}`);
      planks.push(`M${pt(x, H, 0)}L${pt(x, H, W)}`);
    }
    for (let i = 1; i < nz; i++) {
      const z = (W / nz) * i;
      planks.push(`M${pt(L, H, z)}L${pt(L, bodyBottom, z)}`);
    }
  } else {
    const n = Math.max(3, Math.min(7, Math.round((H0 - skidHeightMm) / 260)));
    for (let i = 1; i < n; i++) {
      const y = bodyBottom + ((H - bodyBottom) / n) * i;
      planks.push(`M${pt(0, y, W)}L${pt(L, y, W)}`);
      planks.push(`M${pt(L, y, 0)}L${pt(L, y, W)}`);
    }
    // Eckstänner, fir datt d'Lattung net an der Loft hänkt
    planks.push(`M${pt(L / 2, H, W)}L${pt(L / 2, bodyBottom, W)}`);
    planks.push(`M${pt(L, H, W / 2)}L${pt(L, bodyBottom, W / 2)}`);
  }

  // Kuffen: laanscht d'Breet, verdeelt iwwer d'Längt
  const skidW = Math.min(L / (skids * 2.2), 26);
  const skidXs = Array.from({ length: skids }, (_, i) =>
    skids === 1 ? (L - skidW) / 2 : (i * (L - skidW)) / (skids - 1),
  );

  /* Moosslinnen. D'Zuele bleiwen horizontal — an der Isometrie matgedréinte
     Schrëft ass authentesch, mee um Handy net méi liesbar. */
  const off = 24;
  const dimLen = { a: P(0, 0, W), b: P(L, 0, W), d: [-C * off, S * off] as [number, number] };
  const dimWid = { a: P(L, 0, 0), b: P(L, 0, W), d: [C * off, S * off] as [number, number] };
  const dimHei = { a: P(0, 0, W), b: P(0, H, W), d: [-(off + 10), 0] as [number, number] };

  const dimPath = (d: typeof dimLen) =>
    `M${d.a[0]},${d.a[1]}L${d.a[0] + d.d[0]},${d.a[1] + d.d[1]}` +
    `M${d.b[0]},${d.b[1]}L${d.b[0] + d.d[0]},${d.b[1] + d.d[1]}` +
    `M${d.a[0] + d.d[0]},${d.a[1] + d.d[1]}L${d.b[0] + d.d[0]},${d.b[1] + d.d[1]}`;
  const dimMid = (d: typeof dimLen): [number, number] => [
    (d.a[0] + d.b[0]) / 2 + d.d[0],
    (d.a[1] + d.b[1]) / 2 + d.d[1],
  ];

  const [mlx, mly] = dimMid(dimLen);
  const [mwx, mwy] = dimMid(dimWid);
  const [mhx, mhy] = dimMid(dimHei);

  // Stempel op der Fläch x = L (sichtbar) an op der géintiwwerleiender x = 0
  const stampW = Math.min(W * 0.52, 86);
  const stampH = stampW * 0.6;
  const su = (W - stampW) / 2;
  const sv = bodyBottom + (H - bodyBottom) / 2 - stampH / 2;
  /* Fläche-Matrizen fir déi zwou géintiwwerleiend Säiten x = L an x = 0.
     Zwee Falen, déi bei enger Isometrie schif goen, wa ee se net beuecht:
       · `d = -1` dréint d'y-Achs ëm — d'Stempelgrupp dréit se mat
         `translate(u, v+h) scale(1 -1)` zréck, soss steet de Stempel op der
         Kapp.
       · déi lokal u-Achs muss NO RIETS lafen, soss steet de Stempel
         spigelverkéiert. Dofir leeft u vu z = W no z = 0, net ëmgedréint. */
  const mRight = `matrix(${C} ${-S} 0 -1 ${ox + (L - W) * C} ${oy + (L + W) * S})`;
  const mLeft = `matrix(${C} ${-S} 0 -1 ${ox - W * C} ${oy + W * S})`;
  const flagFrom = P(L, sv + stampH / 2, W - su - stampW / 2);
  const flagTo: [number, number] = [VB.w - PAD.right + 4, flagFrom[1] - 46];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className="crate"
      color="#1C2126"
      role="img"
      aria-label={labels.ariaLabel}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        {skidXs.map((x, i) => (
          <g key={`skid-${i}`}>
            <polygon points={[pt(x, bodyBottom, W), pt(x + skidW, bodyBottom, W), pt(x + skidW, 0, W), pt(x, 0, W)].join(' ')} />
            <polygon points={[pt(x + skidW, bodyBottom, W), pt(x + skidW, bodyBottom, 0), pt(x + skidW, 0, 0), pt(x + skidW, 0, W)].join(' ')} />
          </g>
        ))}

        {/* Papeierfaarf als Fëllung: soss gesäit een d'Kuffen hir hënnescht
            Kante matten duerch d'Këscht duerchgoen. De Fallback hannert dem
            `var()` gëllt fir d'SVG, dat de Benotzer eroflued — dat huet keng
            Säit-CSS méi ronderëm. */}
        <polygon points={faceTop} style={PAPER} />
        <polygon points={faceRight} style={PAPER} />
        <polygon points={faceFront} style={PAPER} />

        <g strokeWidth="0.9" opacity="0.75">
          {planks.map((d, i) => <path key={`p-${i}`} d={d} />)}
        </g>
      </g>

      {/* Moosslinnen */}
      <g stroke="#6B7379" strokeWidth="1" fill="none">
        <path d={dimPath(dimLen)} />
        <path d={dimPath(dimWid)} />
        <path d={dimPath(dimHei)} />
      </g>
      <g
        fill="#6B7379"
        fontFamily={FONT}
        fontSize="22"
        fontWeight="500"
        style={{ fontStretch: '112%', fontVariantNumeric: 'tabular-nums' }}
      >
        <text x={mlx} y={mly + 22} textAnchor="middle">{L0}</text>
        <text x={mwx} y={mwy + 22} textAnchor="middle">{W0}</text>
        <text x={mhx - 8} y={mhy + 7} textAnchor="end">{H0}</text>
      </g>

      {/* IPPC-Stempel op zwou géintiwwerleiende Säiten:
          duerchgezunn op der sichtbarer, gestréchelt op der verstoppter. */}
      {ippc && (
        <g className={pressing ? 'stamp-press' : undefined} color="#1C2126">
          <g transform={`${mLeft} translate(${su} ${sv + stampH}) scale(1 -1)`} opacity="0.45">
            <StampGlyph w={stampW} h={stampH} dashed />
          </g>
          <g transform={`${mRight} translate(${su} ${sv + stampH}) scale(1 -1)`}>
            <StampGlyph w={stampW} h={stampH} />
          </g>
          <g stroke="#1C2126" strokeWidth="1" fill="none">
            <path d={`M${flagFrom[0]},${flagFrom[1]}L${flagTo[0] - 34},${flagTo[1]}L${flagTo[0]},${flagTo[1]}`} />
          </g>
          <text
            x={flagTo[0]}
            y={flagTo[1] - 7}
            textAnchor="end"
            fill="#1C2126"
            fontFamily={FONT}
            fontSize="15"
            fontWeight="600"
            style={{ fontVariantCaps: 'all-small-caps' }}
          >
            {labels.ippc}
          </text>
        </g>
      )}

      {isExample && (
        <text
          x={10}
          y={22}
          fill="#6B7379"
          fontFamily={FONT}
          fontSize="15"
          fontWeight="600"
          style={{ fontVariantCaps: 'all-small-caps' }}
        >
          {labels.example}
        </text>
      )}
    </svg>
  );
}

/** Abstrakte Stempel: Rummen, Ähre, zwou Zeile. Bei dëser Gréisst wier
 *  Schrëft onliesbar — an eng onliesbar Schrëft ass schlëmmer wéi keng.
 *  De grousse Stempel mat all sengen Zeechen steet am Hero an an der
 *  Sektioun „De Stempel". */
function StampGlyph({ w, h, dashed = false }: { w: number; h: number; dashed?: boolean }) {
  const s = h / 24;
  const dash = dashed ? { strokeDasharray: '3 2.5' } : {};
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1.3} {...dash}>
      <rect x="0" y="0" width={w} height={h} rx={2.5 * s} style={PAPER} />
      <line x1={w * 0.36} y1="0" x2={w * 0.36} y2={h} />
      <path d={`M${w * 0.18} ${h * 0.84}V${h * 0.24}`} strokeLinecap="round" />
      <path
        d={`M${w * 0.18} ${h * 0.7} ${w * 0.08} ${h * 0.6}M${w * 0.18} ${h * 0.7} ${w * 0.28} ${h * 0.6}
            M${w * 0.18} ${h * 0.5} ${w * 0.08} ${h * 0.4}M${w * 0.18} ${h * 0.5} ${w * 0.28} ${h * 0.4}
            M${w * 0.18} ${h * 0.32} ${w * 0.1} ${h * 0.24}M${w * 0.18} ${h * 0.32} ${w * 0.26} ${h * 0.24}`}
        strokeWidth={1}
        strokeLinecap="round"
      />
      <g strokeWidth={h * 0.12} strokeLinecap="round">
        <line x1={w * 0.46} y1={h * 0.36} x2={w * 0.88} y2={h * 0.36} />
        <line x1={w * 0.46} y1={h * 0.68} x2={w * 0.68} y2={h * 0.68} />
      </g>
    </g>
  );
}
