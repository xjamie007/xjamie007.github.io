/**
 * Ufro entgéinthuelen a per Mail weiderginn.
 *
 * Supabase Edge Function (Deno). Deployen:
 *   supabase functions deploy send-inquiry --no-verify-jwt
 *   supabase secrets set --env-file ./supabase/.env
 *
 * Grondsätz:
 *   · Keng Schlësselen am Frontend. Dës Datei leeft um Server, d'Secrets
 *     kommen aus den Ëmgéigesvariabelen.
 *   · Spam-Schutz: Honeypot plus Préifung hei um Server. KEE Captcha —
 *     Captchaen kaschten echt Ufroen, a bei 20 Ufroen d'Woch ass dat deier.
 *   · Ouni JavaScript äntwert d'Funktioun mat engem 303 op d'Merci-Säit.
 *     Mat JavaScript mat JSON. Béid Weeër funktionéieren.
 *   · D'Regioun vun der Funktioun op `eu-central-1` (Frankfurt) stellen, soss
 *     stëmmt d'Dateschutzerklärung net.
 *
 * TODO[EINRICHTUNG] Ee vun deenen zwee Weeër konfiguréieren:
 *   a) SMTP iwwer de Mailserver vu kasel.lu — dann ass guer kee Drëtte
 *      involvéiert, an d'Dateschutzerklärung gëtt méi einfach. Bevirzugt.
 *   b) RESEND_API_KEY — HTTP-API. Dann d'Dateschutzerklärung ëm dee
 *      Verschaffer ergänzen.
 */

const MAX_FILE = 10 * 1024 * 1024;
const OK_TYPES = /^(application\/pdf|image\/png|image\/jpe?g)$/i;
const LANGS = ['lb', 'de', 'fr', 'en'] as const;
type Lang = (typeof LANGS)[number];

/** Slug vun der Merci-Säit pro Sprooch — muss mat `src/i18n/routes.ts` passen. */
const THANKS: Record<Lang, string> = { lb: 'merci', de: 'danke', fr: 'merci', en: 'thank-you' };

const env = (k: string, d = '') => Deno.env.get(k) ?? d;
const SITE = env('SITE_URL', 'https://www.kasel.lu').replace(/\/$/, '');
const ALLOWED = env('ALLOWED_ORIGIN', SITE);
const TO = env('INQUIRY_TO', 'tom@kasel.lu');
const FROM = env('INQUIRY_FROM', 'ufro@kasel.lu');

function cors(origin: string | null): Record<string, string> {
  const allow = origin && (origin === ALLOWED || origin === SITE) ? origin : ALLOWED;
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, accept',
    Vary: 'Origin',
  };
}

const clean = (v: FormDataEntryValue | null, max = 500) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

interface Attachment { filename: string; contentType: string; bytes: Uint8Array }

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const head = cors(origin);

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: head });
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: head });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'bad_request', req, head, 'lb');
  }

  const lang = (LANGS as readonly string[]).includes(clean(form.get('lang'), 4))
    ? (clean(form.get('lang'), 4) as Lang)
    : 'lb';

  // ── Honeypot ───────────────────────────────────────────────────────────
  // Ee Bot fëllt alles aus, wat en fënnt. E Mënsch gesäit dëst Feld net.
  // Mir äntwerten trotzdem freundlech: e Bot soll net léieren, wou d'Grenz läit.
  if (clean(form.get('website'), 200)) {
    return done(req, head, lang);
  }

  // ── Préifung um Server. D'Browser-Validéierung ass Komfort, dëst hei ass
  //    d'Kontroll — ee POST kann och ouni Formulaire kommen. ───────────────
  const company = clean(form.get('company'), 160);
  const contact = clean(form.get('contact'), 160);
  const email = clean(form.get('email'), 200);
  const subject = clean(form.get('subject'), 40);
  const message = clean(form.get('message'), 4000);
  const consent = clean(form.get('consent'), 10);

  const bad: string[] = [];
  if (!company) bad.push('company');
  if (!contact) bad.push('contact');
  if (!isEmail(email)) bad.push('email');
  if (!['pallets', 'crates', 'repair', 'storage', 'unsure'].includes(subject)) bad.push('subject');
  if (!message) bad.push('message');
  if (consent !== '1') bad.push('consent');
  if (bad.length) return fail(422, bad.join(','), req, head, lang);

  // ── Dateien ────────────────────────────────────────────────────────────
  const attachments: Attachment[] = [];
  const upload = form.get('attachment');
  if (upload instanceof File && upload.size > 0) {
    if (upload.size > MAX_FILE || !OK_TYPES.test(upload.type)) return fail(422, 'file', req, head, lang);
    attachments.push({
      filename: upload.name.replace(/[^\w.\- ]+/g, '_').slice(0, 120) || 'anhang',
      contentType: upload.type,
      bytes: new Uint8Array(await upload.arrayBuffer()),
    });
  }
  const svg = form.get('crate_svg');
  if (svg instanceof File && svg.size > 0 && svg.size < 512 * 1024) {
    attachments.push({
      filename: 'keschte.svg',
      contentType: 'image/svg+xml',
      bytes: new Uint8Array(await svg.arrayBuffer()),
    });
  }

  // ── Mail opbauen ───────────────────────────────────────────────────────
  const optional: [string, string][] = [
    ['Telefon', clean(form.get('phone'), 60)],
    ['Stéckzuel', clean(form.get('qty'), 20)],
    ['Wonschtermin', clean(form.get('lead_date'), 20)],
    ['Liwwerplaz', clean(form.get('place'), 160)],
  ].filter(([, v]) => v) as [string, string][];

  const cl = clean(form.get('crate_length'), 12);
  const cw = clean(form.get('crate_width'), 12);
  const ch = clean(form.get('crate_height'), 12);
  const hasCrate = !!(cl && cw && ch);
  const crate: [string, string][] = hasCrate
    ? ([
        ['Bannemooss', `${cl} × ${cw} × ${ch} mm`],
        ['Gewiicht', clean(form.get('crate_weight'), 12) ? `${clean(form.get('crate_weight'), 12)} kg` : ''],
        ['Ladegutt', clean(form.get('crate_cargo'), 160)],
        ['Zil', clean(form.get('crate_dest'), 20)],
        ['Bauweis', clean(form.get('crate_build'), 20)],
      ].filter(([, v]) => v) as [string, string][])
    : [];

  const lines = [
    `Firma:            ${company}`,
    `Uspriechpartner:  ${contact}`,
    `E-Mail:           ${email}`,
    `Wat:              ${subject}`,
    ...optional.map(([k, v]) => `${(k + ':').padEnd(18)}${v}`),
    '',
    'Noriicht',
    '--------',
    message,
  ];
  if (crate.length) {
    lines.push('', 'Aus dem Konfigurator', '--------------------', ...crate.map(([k, v]) => `${(k + ':').padEnd(18)}${v}`));
  }
  lines.push('', `Sprooch: ${lang}   Säit: ${clean(form.get('page'), 200)}`, `Zäit:    ${new Date().toISOString()}`);

  const body = lines.join('\n');
  const subjectLine = `Ufro ${company} — ${subject}`;

  try {
    await sendMail({ to: TO, from: FROM, replyTo: email, subject: subjectLine, text: body, attachments });
  } catch (err) {
    console.error('[send-inquiry] Versand feelgeschloen:', err);
    return fail(502, 'mail', req, head, lang);
  }

  return done(req, head, lang);
});

/* ── Äntwerten ───────────────────────────────────────────────────────────── */

const wantsJson = (req: Request) => (req.headers.get('accept') ?? '').includes('application/json');

function done(req: Request, head: Record<string, string>, lang: Lang) {
  if (wantsJson(req)) return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...head, 'content-type': 'application/json' } });
  return new Response(null, { status: 303, headers: { ...head, Location: `${SITE}/${lang}/${THANKS[lang]}/` } });
}

function fail(status: number, reason: string, req: Request, head: Record<string, string>, lang: Lang) {
  if (wantsJson(req)) return new Response(JSON.stringify({ ok: false, reason }), { status, headers: { ...head, 'content-type': 'application/json' } });
  // Ouni Skript: zeréck op d'Säit, mat engem Marker an der URL.
  return new Response(null, { status: 303, headers: { ...head, Location: `${SITE}/${lang}/?ufro=${encodeURIComponent(reason)}#ufro` } });
}

/* ── Versand ─────────────────────────────────────────────────────────────── */

interface Mail {
  to: string; from: string; replyTo: string; subject: string; text: string; attachments: Attachment[];
}

/**
 * Wee a) SMTP iwwer de Mailserver vu kasel.lu — do ass guer kee Drëtte
 * involvéiert. Wee b) Resend als HTTP-API. `a` gewënnt, wann et konfiguréiert
 * ass.
 */
async function sendMail(mail: Mail) {
  if (env('SMTP_HOST')) return sendSmtp(mail);
  if (env('RESEND_API_KEY')) return sendResend(mail);
  throw new Error('Kee Mailwee konfiguréiert: setz SMTP_HOST … oder RESEND_API_KEY.');
}

async function sendSmtp(mail: Mail) {
  const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts');
  const client = new SMTPClient({
    connection: {
      hostname: env('SMTP_HOST'),
      port: Number(env('SMTP_PORT', '587')),
      tls: env('SMTP_TLS', 'true') === 'true',
      auth: { username: env('SMTP_USER'), password: env('SMTP_PASS') },
    },
  });
  await client.send({
    from: mail.from,
    to: mail.to,
    replyTo: mail.replyTo,
    subject: mail.subject,
    content: mail.text,
    attachments: mail.attachments.map((a) => ({
      filename: a.filename,
      contentType: a.contentType,
      encoding: 'binary' as const,
      content: a.bytes,
    })),
  });
  await client.close();
}

async function sendResend(mail: Mail) {
  const b64 = (u: Uint8Array) => {
    let s = '';
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
    return btoa(s);
  };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env('RESEND_API_KEY')}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: mail.from,
      to: [mail.to],
      reply_to: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      attachments: mail.attachments.map((a) => ({ filename: a.filename, content: b64(a.bytes) })),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
