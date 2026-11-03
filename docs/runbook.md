# Runbook

What to do when the site or the contact form misbehaves. The site is static files on
Cloudflare; only `/api/*` runs code (`src/worker.ts`).

## Where to look

- **Health:** `curl -i https://eugenius-works.com/api/health`. `200 {"ok":true}` means the
  Worker runs and the three contact settings are present. `503` means one is missing.
- **Logs:** Cloudflare dashboard → Workers & Pages → `eugenius-works-website` → Logs, or
  `npx wrangler tail --format pretty` for a live view. Each line is one JSON object with an
  `event` field. A visitor's `X-Request-Id` header is the `requestId` in the log and the
  ray ID in Cloudflare.
- **Deploys:** Workers & Pages → `eugenius-works-website` → Deployments. Each deploy from
  CI is also a run of the `CI` workflow on GitHub, linked from its commit.

| `event`                  | Level | Meaning                                                        |
| ------------------------ | ----- | -------------------------------------------------------------- |
| `api.request`            | info  | One line per `/api/` request: method, path, status, `ms`       |
| `contact.sent`           | info  | Resend accepted a message                                      |
| `contact.rate_limited`   | warn  | One IP sent more than 5 messages in 10 minutes                 |
| `resend.request_failed`  | warn  | One attempt failed: network error or the 8 second timeout      |
| `resend.failed`          | error | Resend refused the message, also on the retry; has `status`    |
| `resend.circuit_opened`  | error | 5 failed messages in a row; Resend is not called for 60 s      |
| `contact.not_configured` | error | A setting is missing; the form answers 503                     |

Logs never hold what a visitor typed, their address or their IP (`src/log.ts`). To read
a message that failed, ask the visitor to write to `hey@eugenius-works.com`.

## Alerts

- **Health check:** the GitHub Actions workflow `.github/workflows/health.yml` calls
  `/api/health` every 30 minutes. When it fails, GitHub emails the repository owner.
- **Error logs:** a Workers Observability alert in the Cloudflare dashboard
  (Workers & Pages → `eugenius-works-website` → Observability → Alerts) when `error`
  lines exceed 3 in 10 minutes, sent to `hey@eugenius-works.com`. It is set by hand in
  the dashboard and is still open on `ROADMAP.md`.

## The contact form fails

1. `curl -i https://eugenius-works.com/api/health`.
   - `503`: a setting is missing. Set `RESEND_API_KEY` as a secret
     (`npx wrangler secret put RESEND_API_KEY`) or check `vars` in `wrangler.jsonc`.
2. Search the logs for `resend.failed` and read `status`:
   - `401` or `403`: the key was revoked. Create a new key in Resend and put it.
   - `422`: the sender is not allowed. `CONTACT_FROM` must be on the domain verified in
     Resend; check the DNS records there.
   - `429`: Resend's own limit. Wait; the breaker already holds off.
   - `5xx` or `resend.request_failed`: Resend is down. Check https://resend-status.com.
     The form answers "busy" and recovers on its own.
3. Many `contact.rate_limited` lines from one burst mean a bot. The limit is per isolate
   (see the comment in `src/worker.ts`). If it persists, add a Cloudflare WAF rate
   limiting rule on `/api/contact`.

## A deploy broke the site

1. Roll back: Workers & Pages → `eugenius-works-website` → Deployments → the previous
   deployment → Rollback. Or `npx wrangler rollback` from a machine logged in with
   `npx wrangler login`. This takes seconds and needs no build.
2. Revert the commit on `main` (`git revert <sha>`) and push, so the next deploy does
   not bring the fault back.
3. Add a test that would have caught it.

## The site is down

Static pages do not run the Worker. If pages fail too, check
https://www.cloudflarestatus.com and the DNS records of `eugenius-works.com` in the
dashboard. Nothing in this repository can fix a Cloudflare outage.
