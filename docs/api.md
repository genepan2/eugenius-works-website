<!-- Generated from docs/openapi.json by scripts/gen-api-docs.ts. Edit the spec, then run `npm run docs`. -->

# Contact API 1.0.0

The Cloudflare Worker in `src/worker.ts` runs only for `/api/*` requests. Every other path is a static file from `dist/`. Any other `/api/` path answers 404 with an `Error` body. Every `/api/` answer carries an `X-Request-Id` header: Cloudflare's ray ID, or a random UUID without one. The Worker's log lines carry the same ID. Every `/api/` answer also carries a `Server-Timing` header: `worker;dur=<ms>`, and `resend;dur=<ms>` when the request sent an email.

Servers:

- `https://eugenius-works.com`: production
- `http://localhost:8787`: `npm run build`, then `npx wrangler dev` with `.dev.vars`

## POST /api/contact

Send a contact form message by email.

Forwards the message through Resend to `CONTACT_TO`, with the sender's address as reply-to. The checks run in this order: origin, body size, body parsing, honeypot, fields, configuration, rate limit, delivery. A JSON request gets a JSON answer. Any other content type is the form post a browser sends without JavaScript, and it gets a 303 redirect to a notice on `/contact/` instead.

Every method other than POST answers 405 with an `Error` body.

**Request body:** `application/json` (ContactMessage) or `application/x-www-form-urlencoded` (ContactMessage). At most 20000 bytes by `Content-Length`. A post from another site is refused: the `Origin` header must match the request's origin, or without `Origin`, `Sec-Fetch-Site` must be `same-origin` or `none`.

| Status | Body | Meaning |
|---|---|---|
| 200 | Success | Sent. A filled honeypot gets the same answer and sends nothing. |
| 303 |  | Form posts only. Redirects to the notice for the result: `#contact-sent` on success, `#contact-failed` for invalid input, `#contact-busy` for every other failure. Header `Location`: The notice on `/contact/` of the request's origin. |
| 400 | Error | A field is missing or breaks a rule, or the body cannot be read. |
| 403 | Error | The post came from another site. |
| 413 | Error | `Content-Length` is over 20000 bytes. |
| 429 | Error | More than 5 valid messages from one IP address in 10 minutes. Invalid submissions do not count. The limit lives in Worker memory, so it resets on a cold start. Header `Retry-After`: Seconds to wait. |
| 502 | Error | Resend could not be reached, timed out after 8 seconds, or refused the message, also on one retry. After 5 failed messages in a row the Worker stops calling Resend for 60 seconds and answers 502 at once. Resend's own error is never passed on. |
| 503 | Error | The form is paused (`FLAG_CONTACT_FORM=off`), or `RESEND_API_KEY`, `CONTACT_FROM` or `CONTACT_TO` is not set. The message does not say which setting is missing. |

## GET /api/health

Check whether the contact form can send.

For uptime monitors. Sends nothing and does not call Resend. It reports whether the three settings are present, without naming a missing one.

Every method other than GET and HEAD answers 405 with an `Error` body.

| Status | Body | Meaning |
|---|---|---|
| 200 | Health | The form is configured. |
| 503 | Health | A setting is missing or the form is paused, so the form would answer 503. |

## Schemas

### ContactMessage

| Field | Required | Rules | Meaning |
|---|---|---|---|
| `name` | yes | string, at least 1, at most 100 | Every run of whitespace, line breaks included, becomes one space before the check, so the name cannot add a line to the email subject. |
| `email` | yes | string, at most 254, matches `^[^\s@,<>]+@[^\s@,<>]+\.[^\s@,<>]+$` | The reply-to address of the email. |
| `message` | yes | string, at least 1, at most 5000 | Plain text. |
| `company` | no | string | Honeypot, hidden from people. Any value other than whitespace makes the Worker answer 200 and send nothing. |

### Success

| Field | Required | Rules | Meaning |
|---|---|---|---|
| `ok` | yes | always `true` |  |

### Error

| Field | Required | Rules | Meaning |
|---|---|---|---|
| `ok` | yes | always `false` |  |
| `error` | yes | string | One sentence to show to the visitor. |

### Health

| Field | Required | Rules | Meaning |
|---|---|---|---|
| `ok` | yes | boolean | `true` when the form can send. |
