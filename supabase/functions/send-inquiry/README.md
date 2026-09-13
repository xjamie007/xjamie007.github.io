# send-inquiry

Hëlt d'Ufro vum Formulaire entgéint a schéckt se als Mail un den Tom.

## Ariichten

```bash
supabase functions deploy send-inquiry --no-verify-jwt
supabase secrets set --env-file ./supabase/.env
```

`supabase/.env` (NET an d'Repository):

```
SITE_URL=https://www.kasel.lu
ALLOWED_ORIGIN=https://www.kasel.lu
INQUIRY_TO=tom@kasel.lu
INQUIRY_FROM=ufro@kasel.lu

# Wee a) — bevirzugt: eegene Mailserver, kee Drëtte involvéiert
SMTP_HOST=mail.kasel.lu
SMTP_PORT=587
SMTP_USER=ufro@kasel.lu
SMTP_PASS=…
SMTP_TLS=true

# Wee b) — alternativ
# RESEND_API_KEY=…
```

D'Funktioun muss an der Regioun **eu-central-1** (Frankfurt) leien, soss
stëmmt d'Dateschutzerklärung net.

Duerno an `.env` vum Frontend:

```
PUBLIC_INQUIRY_ENDPOINT=https://<projet-ref>.supabase.co/functions/v1/send-inquiry
```

## Testen

```bash
curl -X POST "$PUBLIC_INQUIRY_ENDPOINT" \
  -H 'Accept: application/json' \
  -F lang=lb -F company='Test SA' -F contact='Tom' \
  -F email='test@example.com' -F subject=crates \
  -F message='Test' -F consent=1
```

Erwaart: `{"ok":true}` an eng Mail am Postfach.
