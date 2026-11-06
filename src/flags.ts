/**
 * Feature flags for the Worker. Each flag has a default here and can be switched
 * without a code change: set the variable named in `env` on the Worker
 * (wrangler.jsonc `vars`, or the dashboard) to "on" or "off", and it applies on
 * the next request after the variable is saved.
 */

export const FLAGS = {
  /** Off: /api/contact answers 503 and the form shows its "busy" notice. A kill switch. */
  contactForm: { env: 'FLAG_CONTACT_FORM', default: true },
  /** Off: the Worker writes no data points to Analytics Engine. */
  metrics: { env: 'FLAG_METRICS', default: true },
} as const;

export type Flag = keyof typeof FLAGS;

export function enabled(flag: Flag, env: object): boolean {
  const { env: name, default: fallback } = FLAGS[flag];
  const value = (env as Record<string, unknown>)[name];
  if (typeof value !== 'string') return fallback;
  if (/^(on|true|1)$/i.test(value.trim())) return true;
  if (/^(off|false|0)$/i.test(value.trim())) return false;
  return fallback;
}
