/**
 * End-to-end check of the contact form against the live site.
 * Run: npm run test:e2e
 *
 * It SENDS A REAL EMAIL. The Worker allows 5 sends per 10 minutes per IP, so
 * this is not part of `npm test`.
 *
 * 1. System Chrome opens /contact/, fills the form and submits it.
 * 2. The Resend API is polled until the email with this run's token in the
 *    subject has the event `delivered`. That step needs a full-access
 *    RESEND_API_KEY (environment, or .dev.vars); a send-only key cannot read.
 *
 * Environment: E2E_BASE_URL (default https://eugenius-works.com),
 * RESEND_API_KEY, E2E_REQUIRE_RECEIPT=1 (fail when the receipt check is skipped).
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright-core';

const BASE = (process.env.E2E_BASE_URL ?? 'https://eugenius-works.com').replace(/\/+$/, '');
const POLL_MS = 3000;
const POLL_TIMEOUT_MS = 60000;

// The Worker builds the subject as `Contact form: ${name}`, so the token in
// the name identifies the email of this run.
const token = `E2E ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** The key from the environment, else from .dev.vars. Never printed. */
function resendKey(): string | undefined {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  const file = new URL('../.dev.vars', import.meta.url);
  if (!existsSync(file)) return undefined;
  const match = readFileSync(file, 'utf8').match(/^\s*RESEND_API_KEY\s*=\s*(.*?)\s*$/m);
  return match?.[1].replace(/^(["'])(.*)\1$/, '$2') || undefined;
}

async function submitForm(): Promise<void> {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage();
    await page.goto(`${BASE}/contact/`);
    await page.locator('#name').fill(token);
    await page.locator('#email').fill('e2e@eugenius-works.com');
    await page.locator('#message').fill(`Automatic end-to-end test of the contact form. Token: ${token}`);
    // The honeypot field `company` stays empty.
    await page.locator('#contact-submit').click();

    const sent = page.locator('#contact-sent.is-shown');
    const error = page.locator('#contact-error:not(.hidden)');
    await sent.or(error).first().waitFor({ state: 'visible' });

    if (await error.isVisible()) {
      assert.fail(`the form shows an error: ${(await error.innerText()).trim()}`);
    }
    assert.ok(await sent.isVisible(), '#contact-sent must be visible');
    assert.ok(await page.locator('#contact-form').isHidden(), 'the form must be hidden after a send');
  } finally {
    await browser.close();
  }
}

/**
 * Resend, GET /emails: { data: [{ id, subject, last_event, ... }] }, newest
 * first. GET /emails/{id} gives the same `last_event` for one email.
 */
async function resendGet(path: string, key: string): Promise<any> {
  const response = await fetch(`https://api.resend.com${path}`, {
    headers: { authorization: `Bearer ${key}` },
  });
  if (response.ok) return response.json();

  // Resend errors are { statusCode, name, message }. An invalid key is a 400
  // `validation_error`; a send-only key is a 401 `restricted_api_key`.
  const body = (await response.json().catch(() => ({}))) as any;
  const detail = `${body.name ?? 'error'}: ${body.message ?? ''}`.replaceAll(key, '[key]');
  const keyProblem = [401, 403].includes(response.status) || /api key/i.test(detail);
  assert.fail(
    `Resend GET ${path.split('?')[0]} returned HTTP ${response.status} (${detail}).` +
      (keyProblem
        ? ' The receipt check needs a valid RESEND_API_KEY with full access. A send-only key cannot read emails.'
        : ''),
  );
}

async function checkReceipt(key: string): Promise<void> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let id: string | undefined;
  let lastEvent = 'not found in Resend';

  while (true) {
    if (!id) {
      const list = await resendGet('/emails?limit=100', key);
      const email = list.data?.find((item: any) => String(item.subject).includes(token));
      id = email?.id;
      if (email) lastEvent = email.last_event;
    } else {
      lastEvent = (await resendGet(`/emails/${id}`, key)).last_event;
    }

    // `opened` and `clicked` can only follow a delivery.
    if (['delivered', 'opened', 'clicked'].includes(lastEvent)) {
      console.log(`contact e2e: receipt OK, Resend email ${id}, last event "${lastEvent}"`);
      return;
    }
    if (['bounced', 'complained', 'failed', 'suppressed', 'canceled'].includes(lastEvent)) {
      assert.fail(`the email was not delivered: Resend email ${id}, last event "${lastEvent}"`);
    }
    // sent, queued, scheduled, delivery_delayed, or not listed yet: wait.
    if (Date.now() + POLL_MS > deadline) {
      assert.fail(
        `no "delivered" event after ${POLL_TIMEOUT_MS / 1000} s: ` +
          `Resend email ${id ?? '(none)'}, last state "${lastEvent}"`,
      );
    }
    await sleep(POLL_MS);
  }
}

console.log(`contact e2e: ${BASE}/contact/, subject token "${token}"`);
await submitForm();
console.log('contact e2e: form submitted, the page shows the thank-you notice');

const key = resendKey();
if (key) {
  await checkReceipt(key);
  console.log('contact e2e: all checks passed');
} else {
  console.log('contact e2e: RECEIPT CHECK SKIPPED. No RESEND_API_KEY in the environment or in .dev.vars.');
  if (process.env.E2E_REQUIRE_RECEIPT === '1') {
    console.error('contact e2e: FAILED, because E2E_REQUIRE_RECEIPT=1 requires the receipt check.');
    process.exitCode = 1;
  }
}
