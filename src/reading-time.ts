// Minutes to read `text` at 230 words a minute: the ceiling, at least 1.
// Tailwind scans this file, so the comment must not hold a word that is a
// utility class name (the word for "not square" makes a border-radius rule).
export function readingTime(text: string): number {
  return Math.max(1, Math.ceil((text.match(/\S+/g) ?? []).length / 230));
}
