/**
 * Sends one email through the Resend REST API, with a timeout, one retry and a
 * circuit breaker. All state lives in the isolate, like the rate limit.
 */
import { log } from './log.ts';

export interface Email {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}

const TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 300;
const FAILURES_TO_OPEN = 5;
const OPEN_FOR_MS = 60 * 1000;

let failures = 0;
let openUntil = 0;

/** Back to a closed breaker. For tests. */
export function resetResendCircuit(): void {
  failures = 0;
  openUntil = 0;
}

// A network error, a timeout, a 429 and a 5xx can pass on a second try; a 4xx will not.
const retryable = (status: number) => status === 429 || status >= 500;

async function attempt(key: string, email: Email, requestId: string): Promise<number> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
        // The retry reuses the key, so Resend sends the email at most once.
        'idempotency-key': requestId,
      },
      body: JSON.stringify({
        from: email.from,
        to: [email.to],
        reply_to: email.replyTo,
        subject: email.subject,
        text: email.text,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.status;
  } catch (error) {
    log('warn', 'resend.request_failed', {
      requestId,
      error: error instanceof Error ? error.name : 'unknown',
    });
    return 0;
  }
}

/** True when Resend accepted the email. Never throws. */
export async function sendEmail(key: string, email: Email, requestId: string): Promise<boolean> {
  if (Date.now() < openUntil) {
    log('warn', 'resend.circuit_open', { requestId });
    return false;
  }
  let status = await attempt(key, email, requestId);
  if (status === 0 || retryable(status)) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    status = await attempt(key, email, requestId);
  }
  const ok = status >= 200 && status < 300;
  if (ok) {
    failures = 0;
    return true;
  }
  failures++;
  log('error', 'resend.failed', { requestId, status, failures });
  if (failures >= FAILURES_TO_OPEN) {
    openUntil = Date.now() + OPEN_FOR_MS;
    log('error', 'resend.circuit_opened', { requestId, seconds: OPEN_FOR_MS / 1000 });
  }
  return false;
}
