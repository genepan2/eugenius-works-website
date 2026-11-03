/**
 * A meta description of at most `max` characters: whole sentences while they fit.
 * If the first sentence alone is too long, cut it at a word boundary and add `…`.
 */
export function metaDescription(text: string, max = 160): string {
  const sentences = text.trim().match(/.*?[.!?](?=\s|$)|.+$/gs) ?? [];
  let out = '';
  for (const sentence of sentences) {
    const next = out ? `${out} ${sentence.trim()}` : sentence.trim();
    if (next.length > max) break;
    out = next;
  }
  if (out) return out;
  const cut = text.trim().slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length)}…`;
}
