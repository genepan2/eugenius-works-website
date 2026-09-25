/**
 * Cloudflare Worker entry point.
 *
 * Serves the static Astro build from the ASSETS binding and handles
 * POST /api/contact, which forwards a homepage contact form submission by
 * email through the Resend REST API. The Astro output stays static and needs
 * no adapter.
 */

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_FROM?: string;
  CONTACT_TO?: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const MAX_MESSAGE_LENGTH = 5000;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

// ponytail: per-isolate rate limiting in a module-scope Map. It resets on cold
// start and is not shared between isolates or regions, so it slows a naive
// flood rather than stopping a determined one. Upgrade path if abuse becomes
// real: a KV namespace, or a Durable Object for a strict global counter.
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
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

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return fail('Method not allowed.', 405);
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  if (rateLimited(ip)) {
    return fail('Too many messages from this address. Please try again later.', 429);
  }

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

  const name = (fields.name ?? '').trim();
  const email = (fields.email ?? '').trim();
  const message = (fields.message ?? '').trim();

  if (!name) return fail('Please enter your name.', 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail('Please enter a valid email address.', 400);
  }
  if (!message) return fail('Please enter a message.', 400);
  if (message.length > MAX_MESSAGE_LENGTH) {
    return fail(`Please keep the message under ${MAX_MESSAGE_LENGTH} characters.`, 400);
  }

  // The key is missing until the owner sets it in the Worker's dashboard under
  // Settings > Variables and Secrets. Say the form is unconfigured without
  // revealing which binding is absent.
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM || !env.CONTACT_TO) {
    return fail('The contact form is not configured yet. Please send an email instead.', 503);
  }

  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: `Contact form: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}\n`,
      }),
    });
  } catch {
    return fail('The message could not be sent. Please try again later.', 502);
  }

  if (!response.ok) {
    // Resend's own error body may name the key or the account. Do not pass it on.
    return fail('The message could not be sent. Please try again later.', 502);
  }

  return json({ ok: true }, 200);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/contact') return handleContact(request, env);

    // Any other /api/ path answers as JSON. Falling through would serve the
    // HTML 404 page to something that asked for an API.
    if (pathname.startsWith('/api/')) return fail('Not found.', 404);

    // Safety net only: run_worker_first is scoped to "/api/*", so normal page
    // and asset requests are served from the asset store without ever
    // reaching this Worker.
    return env.ASSETS.fetch(request);
  },
};
