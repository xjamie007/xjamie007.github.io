/**
 * „Këscht konfiguréieren" — dat eent Element, un dat ee sech erënnert.
 *
 * ── Wat en NET mécht ────────────────────────────────────────────────────────
 * Kee Präis. Keng verbindlech Konstruktiounsugab. Déi ofgeleete Wäerter sinn
 * Anhaltswäerter a stinn esou beschrëft do; d'lescht Auslegung mécht Kasel.
 *
 * ── Ouni JavaScript ─────────────────────────────────────────────────────────
 * All Feld hei ass e richtegt Formularelement mat engem sichtbare <label> an
 * engem `form="ufro-form"`-Attribut. Dat heescht: d'Felder gehéieren zum
 * Ufro-Formulaire wäit ënnen op der Säit, och wa se wäit dovun am DOM stinn.
 * Ouni Skript geet just d'Virschau verluer — keng eenzeg Funktioun.
 * De Knäppchen ass dann en normale `submit`: de Browser sprangt vun eleng op
 * dat éischt eidelt Flichtfeld am Ufro-Formulaire.
 *
 * ── Budget ──────────────────────────────────────────────────────────────────
 * Eenzeg React-Insel op der Säit, `client:visible`, ouni Zeechenbibliothéik.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CrateSvg from './CrateSvg';
import { RULES, defaultBuild, derive, matchCargo } from '../../lib/crate-rules';
import type { CargoKind, CrateBuild, Destination } from '../../data/products';

export interface ConfiguratorStrings {
  heading: string;
  lead: string;
  fieldsetSize: string;
  fieldsetBuild: string;
  exampleTag: string;
  innerLabel: string;
  innerHint: string;
  length: string;
  width: string;
  height: string;
  weightLabel: string;
  weightHint: string;
  cargo: string;
  cargoHint: string;
  dest: string;
  qty: string;
  build: string;
  outerLabel: string;
  outerHint: string;
  cargoOptions: Record<CargoKind, string>;
  destOptions: Record<Destination, string>;
  buildOptions: Record<CrateBuild, string>;
  buildAutoNote: string;
  stampOn: string;
  stampOff: string;
  actionSubmit: string;
  actionDownload: string;
  noscript: string;
  srSummary: string;
  mm: string;
  kg: string;
}

/** Beispillwäerter fir d'Zeechnung, soulaang d'Felder eidel sinn. Si ginn NET
 *  mat der Ufro geschéckt — eidel Felder bleiwen eidel, soss kréich den Tom bei
 *  all Palette-Ufro nach eng Këschtebeschreiwung mat, déi keen ugefrot huet. */
const EXAMPLE = { length: 1200, width: 800, height: 900, weight: 850 };

interface Props {
  s: ConfiguratorStrings;
  formId: string;
  /** Anker vum Ufro-Formulaire, fir de Spronk. */
  inquiryAnchor: string;
  /** ID vum eidele Behälter am Formulaire, an deen d'Zesummefaassung kënnt. */
  summaryMountId: string;
  summaryHeading: string;
  summaryEdit: string;
  /** Fir d'Ufro ouni Këschtemoossen erauszeschécken. */
  summaryRemove: string;
  summaryRemoveHint: string;
  /** Anker vum Konfigurator, fir de Link „Änneren". */
  selfAnchor: string;
}

const numeric = (v: string) => {
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
};

export default function Configurator({
  s, formId, inquiryAnchor, summaryMountId, summaryHeading, summaryEdit,
  summaryRemove, summaryRemoveHint, selfAnchor,
}: Props) {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [qty, setQty] = useState('');
  /* Freitext, keine Auswahl: Kasel baut laut eigener Seite für Kupfer, Glas,
     Aluminium „etc." — das etc. ist der Punkt. Die vier Vorschläge stehen als
     <datalist> darunter und steuern die Voreinstellung der Bauweise. */
  const [cargo, setCargo] = useState('');
  const [dest, setDest] = useState<Destination>('eu');
  const [build, setBuild] = useState<CrateBuild>(defaultBuild('copper'));
  const [buildTouched, setBuildTouched] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  const [summaryOn, setSummaryOn] = useState(false);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    setHydrated(true);
    setMount(document.getElementById(summaryMountId));
  }, [summaryMountId]);

  /* Die Bauweise folgt dem Ladegut, bis der Benutzer selbst umschaltet. Steht
     dort etwas, das wir nicht kennen, bleibt sie stehen — geraten wird nicht. */
  const known = matchCargo(cargo, s.cargoOptions as Record<string, string>);
  useEffect(() => {
    if (!buildTouched && known) setBuild(defaultBuild(known));
  }, [known, buildTouched]);

  const nL = numeric(length), nW = numeric(width), nH = numeric(height), nKg = numeric(weight);
  const isExample = !(nL && nW && nH);

  const d = useMemo(
    () =>
      derive({
        innerLengthMm: nL ?? EXAMPLE.length,
        innerWidthMm: nW ?? EXAMPLE.width,
        innerHeightMm: nH ?? EXAMPLE.height,
        weightKg: nKg ?? EXAMPLE.weight,
        cargo: known ?? 'copper',
        destination: dest,
        build,
        quantity: numeric(qty) ?? 1,
      }),
    [nL, nW, nH, nKg, known, dest, build, qty],
  );

  const outer = `${d.outerLengthMm} × ${d.outerWidthMm} × ${d.outerHeightMm}`;
  const stampText = d.ippc ? s.stampOn : s.stampOff;
  const spoken = s.srSummary
    .replace('{outer}', outer)
    .replace('{skids}', String(d.skids))
    .replace('{build}', s.buildOptions[build])
    .replace('{stamp}', stampText);

  /**
   * D'Moossen erëm eraushuelen.
   *
   * Wien konfiguréiert huet a sech anescht besënnt, soll eng ganz normal Ufro
   * schécke kënnen. D'Felder ginn eidel gemaach — si gehéieren zum Formulaire,
   * et geet also net duer, nëmmen d'Zesummefaassung auszeblenden, soss fueren
   * d'Wäerter weider mat.
   */
  const dropConfig = () => {
    setLength('');
    setWidth('');
    setHeight('');
    setWeight('');
    setQty('');
    setCargo('');
    setSummaryOn(false);
    document.getElementById(inquiryAnchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const download = () => {
    const el = svgRef.current;
    if (!el) return;
    const xml = new XMLSerializer().serializeToString(el);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kasel-keschte-${d.outerLengthMm}x${d.outerWidthMm}x${d.outerHeightMm}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  /** Mat Skript: d'Wäerter ginn sichtbar an d'Formulaire iwwerholl an et gëtt
   *  dohinner gesprongen. Ouni Skript mécht de Browser datselwecht Zil vun
   *  eleng, iwwer d'Formularvalidéierung. */
  const toInquiry = (e: React.MouseEvent) => {
    if (!hydrated) return;
    e.preventDefault();
    setSummaryOn(true);
    const form = document.getElementById(formId) as HTMLFormElement | null;
    const target = document.getElementById(inquiryAnchor);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      // Dat éischt Flichtfeld, dat nach eidel ass — net einfach dat éischt
      // Flichtfeld, soss landet de Cursor niewent dem, wat feelt.
      const fields = Array.from(form?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]') ?? []);
      const first = fields.find((el) => ('checked' in el && el.type === 'checkbox' ? !el.checked : !el.value));
      (first ?? fields[0])?.focus({ preventScroll: true });
    }, 420);
  };

  const rows: [string, string][] = [
    [s.innerLabel, `${nL ?? '–'} × ${nW ?? '–'} × ${nH ?? '–'} ${s.mm}`],
    [s.weightLabel, nKg ? `${nKg} ${s.kg}` : '–'],
    [s.cargo, cargo.trim() || '–'],
    [s.dest, s.destOptions[dest]],
    [s.build, s.buildOptions[build]],
    [s.qty, numeric(qty) ? String(numeric(qty)) : '–'],
    [s.outerLabel, `${outer} ${s.mm}`],
    ['ISPM 15', stampText],
  ];

  const lim = RULES.limits;

  return (
    <div className="cfg">
      <div className="cfg__stage">
        <figure className="cfg__figure">
          <CrateSvg
            svgRef={svgRef}
            lengthMm={d.outerLengthMm}
            widthMm={d.outerWidthMm}
            heightMm={d.outerHeightMm}
            skidHeightMm={d.skidHeightMm}
            skids={d.skids}
            build={build}
            ippc={d.ippc}
            isExample={isExample}
            labels={{
              outer: s.outerLabel, length: s.length, width: s.width, height: s.height,
              ippc: 'IPPC', example: s.exampleTag, ariaLabel: spoken,
            }}
          />
          {/* Was sich ableitet, wird angesagt — auch wenn es niemand sieht.
              Die Zahlen stehen auf der Zeichnung und fahren mit der Anfrage
              mit; ein zweiter Kasten mit denselben Werten war nur Wiederholung. */}
          <p className="sr-only" aria-live="polite">{spoken}</p>
        </figure>
      </div>

      <div className="cfg__form">
        <fieldset className="cfg__set">
          <legend className="t-label cfg__legend">{s.fieldsetSize}</legend>

          <div className="cfg__dims">
            <p className="t-label cfg__groupLabel" id="cfg-inner">{s.innerLabel}</p>
            <p className="t-caption cfg__hint" id="cfg-inner-hint">{s.innerHint}</p>
            <div className="cfg__dimRow" role="group" aria-labelledby="cfg-inner" aria-describedby="cfg-inner-hint">
              <Field id="crate_length" label={s.length} value={length} set={setLength} form={formId} lim={lim.lengthMm} ph={String(EXAMPLE.length)} />
              <Field id="crate_width" label={s.width} value={width} set={setWidth} form={formId} lim={lim.widthMm} ph={String(EXAMPLE.width)} />
              <Field id="crate_height" label={s.height} value={height} set={setHeight} form={formId} lim={lim.heightMm} ph={String(EXAMPLE.height)} />
            </div>
          </div>

          <div className="cfg__pair">
            <Field id="crate_weight" label={s.weightLabel} hint={s.weightHint} value={weight} set={setWeight} form={formId} lim={lim.weightKg} ph={String(EXAMPLE.weight)} wide />
            <Field id="qty" label={s.qty} value={qty} set={setQty} form={formId} lim={lim.qty} ph="10" wide />
          </div>
        </fieldset>

        <fieldset className="cfg__set">
          <legend className="t-label cfg__legend">{s.fieldsetBuild}</legend>

          <div className="cfg__pair">
            <div className="cfg__field">
              <label className="t-label" htmlFor="crate_cargo">{s.cargo}</label>
              <input
                id="crate_cargo"
                name="crate_cargo"
                form={formId}
                type="text"
                className="cfg__input"
                list="cargo-options"
                maxLength={120}
                autoComplete="off"
                placeholder={s.cargoOptions.copper}
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                aria-describedby="cargo-hint"
              />
              <datalist id="cargo-options">
                {(Object.keys(s.cargoOptions) as CargoKind[]).map((k) => (
                  <option key={k} value={s.cargoOptions[k]} />
                ))}
              </datalist>
              <p className="t-caption cfg__hint" id="cargo-hint">{s.cargoHint}</p>
            </div>
            <div className="cfg__field">
              <label className="t-label" htmlFor="crate_dest">{s.dest}</label>
              <select
                id="crate_dest" name="crate_dest" form={formId} className="cfg__input"
                value={dest} onChange={(e) => setDest(e.target.value as Destination)}
              >
                {(Object.keys(s.destOptions) as Destination[]).map((k) => (
                  <option key={k} value={k}>{s.destOptions[k]}</option>
                ))}
              </select>
            </div>
          </div>


          <div className="cfg__field">
            <p className="t-label cfg__groupLabel" id="cfg-build">{s.build}</p>
            <div className="cfg__radios" role="radiogroup" aria-labelledby="cfg-build" aria-describedby="cfg-build-note">
              {(Object.keys(s.buildOptions) as CrateBuild[]).map((k) => (
                <label key={k} className="cfg__radio">
                  <input
                    type="radio" name="crate_build" value={k} form={formId}
                    checked={build === k}
                    onChange={() => { setBuild(k); setBuildTouched(true); }}
                  />
                  <span>{s.buildOptions[k]}</span>
                </label>
              ))}
            </div>
            <p className="t-caption cfg__hint" id="cfg-build-note">{s.buildAutoNote}</p>
          </div>
        </fieldset>

        <p className="cfg__actions">
          <button type="submit" form={formId} className="btn btn--primary" onClick={toInquiry}>
            {s.actionSubmit}
          </button>
          {hydrated && (
            <button type="button" className="btn btn--quiet" onClick={download}>
              {s.actionDownload}
            </button>
          )}
        </p>

        {/* E richtegt <noscript>, keng Bedingung um Zoustand: d'Insel lued
            eréischt, wa se an de Bléck kënnt (`client:visible`). Eng Bedingung
            géif de Saz all Besucher kuerz weisen an hie dann ewechhuelen — e
            Flackeren, dat näischt erklärt. */}
        <noscript dangerouslySetInnerHTML={{ __html: `<p class="t-caption cfg__noscript">${s.noscript.replace(/</g, '&lt;')}</p>` }} />
      </div>

      {summaryOn && mount
        ? createPortal(
            <div className="sum">
              <h3 className="t-label sum__head">{summaryHeading}</h3>
              <dl className="sum__list">
                {rows.map(([k, v]) => (
                  <div key={k}><dt className="t-label">{k}</dt><dd className="t-num">{v}</dd></div>
                ))}
              </dl>
              <p className="sum__actions">
                <a className="link" href={`#${selfAnchor}`}>{summaryEdit}</a>
                <button type="button" className="sum__drop" onClick={dropConfig}>{summaryRemove}</button>
              </p>
              <p className="t-caption sum__hint">{summaryRemoveHint}</p>
            </div>,
            mount,
          )
        : null}
    </div>
  );
}

function Field(props: {
  id: string; label: string; hint?: string; value: string; form: string; ph: string;
  set: (v: string) => void; lim: { min: number; max: number; step: number }; wide?: boolean;
}) {
  const { id, label, hint, value, set, form, lim, ph, wide } = props;
  return (
    <div className={wide ? 'cfg__field' : 'cfg__field cfg__field--narrow'}>
      <label className="t-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        form={form}
        className="cfg__input"
        type="number"
        inputMode="numeric"
        min={lim.min}
        max={lim.max}
        step={lim.step}
        placeholder={ph}
        value={value}
        onChange={(e) => set(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && <p className="t-caption cfg__hint" id={`${id}-hint`}>{hint}</p>}
    </div>
  );
}
