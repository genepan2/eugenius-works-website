/**
 * Cloudflare Worker entry point.
 *
 * Serves the static Astro build from the ASSETS binding and handles
 * POST /api/contact, which forwards a homepage contact form submission by
 * email through the Resend REST API. The Astro output stays static and needs
 * no adapter.
 */
import { log } from './log.ts';
import { sendEmail } from './resend.ts';

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_FROM?: string;
  CONTACT_TO?: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const MAX_MESSAGE_LENGTH = 5000;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_BODY_BYTES = 20000;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

// ponytail: per-isolate rate limiting in a module-scope Map. It resets on cold
// start and is not shared between isolates or regions, so it slows a naive
// flood rather than stopping a determined one. Upgrade path if abuse becomes
// real: a KV namespace, or a Durable Object for a strict global counter.
// Only a submission that passed validation and is about to be sent counts, so
// typos and bot traps never lock a visitor out.
const hits = new Map<string, number[]>();

function recentHits(ip: string): number[] {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length === 0) hits.delete(ip);
  else hits.set(ip, recent);
  return recent;
}

const rateLimited = (ip: string): boolean => recentHits(ip).length >= RATE_LIMIT;

function countHit(ip: string): void {
  hits.set(ip, [...recentHits(ip), Date.now()]);
}

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'x-content-type-options': 'nosniff',
      'cache-control': 'no-store',
      ...extra,
    },
  });
}

const fail = (error: string, status: number) => json({ ok: false, error }, status);

/** Accept either a JSON body or a form-encoded one. */
async function readFields(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type') ?? '';
  const fields: Record<string, string> = {};

  if (contentType.includes('application/json')) {
    const body = (await request.json()) as Record<string, unknown>;
    for (const [key, value] of Object.entries(body ?? {})) {
      if (typeof value === 'string') fields[key] = value;
    }
    return fields;
  }

  const form = await request.formData();
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') fields[key] = value;
  }
  return fields;
}

interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

/** The cleaned message, or the sentence that tells the visitor what to fix. */
function validate(fields: Record<string, string>): ContactMessage | string {
  // Collapse every whitespace run, CR and LF included, so the name cannot
  // inject a header line into the subject.
  const name = (fields.name ?? '').replace(/\s+/g, ' ').trim();
  const email = (fields.email ?? '').trim();
  const message = (fields.message ?? '').trim();

  if (!name) return 'Please enter your name.';
  if (name.length > MAX_NAME_LENGTH) {
    return `Please keep the name under ${MAX_NAME_LENGTH} characters.`;
  }
  if (email.length > MAX_EMAIL_LENGTH || !/^[^\s@,<>]+@[^\s@,<>]+\.[^\s@,<>]+$/.test(email)) {
    return 'Please enter a valid email address.';
  }
  if (!message) return 'Please enter a message.';
  if (message.length > MAX_MESSAGE_LENGTH) {
    return `Please keep the message under ${MAX_MESSAGE_LENGTH} characters.`;
  }
  return { name, email, message };
}

const configured = (env: Env) => Boolean(env.RESEND_API_KEY && env.CONTACT_FROM && env.CONTACT_TO);

async function handleContact(request: Request, env: Env, requestId: string): Promise<Response> {
  if (request.method !== 'POST') {
    return fail('Method not allowed.', 405);
  }

  // Block cross-site posts. A form-encoded POST is a "simple request", so any
  // site could otherwise trigger an email. Origin wins; Sec-Fetch-Site is the
  // fallback; with neither header (curl, old browsers) the request is allowed.
  const origin = request.headers.get('origin');
  if (origin !== null) {
    if (origin !== new URL(request.url).origin) return fail('Forbidden.', 403);
  } else {
    const site = request.headers.get('sec-fetch-site');
    if (site !== null && site !== 'same-origin' && site !== 'none') {
      return fail('Forbidden.', 403);
    }
  }

  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return fail('The submission is too large.', 413);
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';

  let fields: Record<string, string>;
  try {
    fields = await readFields(request);
  } catch {
    return fail('Could not read the submission.', 400);
  }

  // Honeypot. Real visitors never fill this in. Answer as if the message was
  // accepted so a bot cannot learn it was caught, and send nothing.
  if ((fields.company ?? '').trim() !== '') {
    return json({ ok: true }, 200);
  }

  const input = validate(fields);
  if (typeof input === 'string') return fail(input, 400);
  const { name, email, message } = input;

  // The key is missing until the owner sets it in the Worker's dashboard under
  // Settings > Variables and Secrets. Say the form is unconfigured without
  // revealing which binding is absent.
  if (!configured(env)) {
    log('error', 'contact.not_configured', { requestId });
    return fail('The contact form is not configured yet. Please send an email instead.', 503);
  }

  if (rateLimited(ip)) {
    log('warn', 'contact.rate_limited', { requestId });
    return json(
      { ok: false, error: 'Too many messages from this address. Please try again later.' },
      429,
      { 'retry-after': String(RATE_WINDOW_MS / 1000) },
    );
  }
  countHit(ip);

  const sent = await sendEmail(
    env.RESEND_API_KEY!,
    {
      from: env.CONTACT_FROM!,
      to: env.CONTACT_TO!,
      replyTo: email,
      subject: `Contact form: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}\n`,
    },
    requestId,
  );
  // Resend's own error body may name the key or the account. It is never passed on.
  if (!sent) return fail('The message could not be sent. Please try again later.', 502);
  log('info', 'contact.sent', { requestId });
  return json({ ok: true }, 200);
}

async function handleApi(request: Request, env: Env, requestId: string): Promise<Response> {
  const { pathname } = new URL(request.url);

  // For uptime checks: answers without sending anything, and says whether the
  // form could send, not which setting is missing.
  if (pathname === '/api/health') {
    if (request.method !== 'GET' && request.method !== 'HEAD')
      return fail('Method not allowed.', 405);
    const ready = configured(env);
    return json({ ok: ready }, ready ? 200 : 503);
  }

  if (pathname === '/api/contact') {
    const response = await handleContact(request, env, requestId);

    // Without JavaScript the browser posts the form itself and would land on
    // a bare JSON page. Send it back to the contact page instead, where the
    // #contact-sent, #contact-failed (bad input) or #contact-busy (anything
    // else) notice shows through :target.
    const isJson = (request.headers.get('content-type') ?? '').includes('application/json');
    if (request.method === 'POST' && !isJson) {
      const fragment = response.ok
        ? '/contact/#contact-sent'
        : response.status === 400
          ? '/contact/#contact-failed'
          : '/contact/#contact-busy';
      return Response.redirect(new URL(fragment, request.url).href, 303);
    }
    return response;
  }

  // Any other /api/ path answers as JSON. Falling through would serve the
  // HTML 404 page to something that asked for an API.
  return fail('Not found.', 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith('/api/')) {
      // Cloudflare's ray ID ties this log line to the request in the dashboard.
      const requestId = request.headers.get('cf-ray') ?? crypto.randomUUID();
      const started = Date.now();
      const response = await handleApi(request, env, requestId);
      log(response.status >= 500 ? 'error' : 'info', 'api.request', {
        requestId,
        method: request.method,
        path: pathname,
        status: response.status,
        ms: Date.now() - started,
      });
      const headers = new Headers(response.headers);
      headers.set('x-request-id', requestId);
      return new Response(response.body, { status: response.status, headers });
    }

    // Safety net only: run_worker_first is scoped to "/api/*", so normal page
    // and asset requests are served from the asset store without ever
    // reaching this Worker.
    return env.ASSETS.fetch(request);
  },
};
