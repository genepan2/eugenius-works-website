/**
 * One JSON object per line, so Workers Logs can filter and count by field.
 * Every entry passes through scrub(): a log line never carries what a
 * visitor typed or where they came from.
 */

type Level = 'info' | 'warn' | 'error';
type Fields = Record<string, string | number | boolean | undefined>;

const PRIVATE_KEYS = new Set([
  'name',
  'email',
  'message',
  'ip',
  'authorization',
  'subject',
  'text',
]);
const EMAIL = /[^\s@,<>"']+@[^\s@,<>"']+\.[^\s@,<>"']+/g;

/** Drops fields that hold personal data and masks any email address left in a value. */
export function scrub(fields: Fields): Fields {
  const out: Fields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (PRIVATE_KEYS.has(key.toLowerCase())) {
      out[key] = '[redacted]';
      continue;
    }
    out[key] = typeof value === 'string' ? value.replace(EMAIL, '[email]') : value;
  }
  return out;
}

export function log(level: Level, event: string, fields: Fields = {}): void {
  const line = JSON.stringify({ level, event, ...scrub(fields) });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}
