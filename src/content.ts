import { getCollection } from 'astro:content';

/** Projects with `order` first (ascending), then the rest alphabetically by title. */
export async function getSortedProjects() {
  const projects = await getCollection('projects');
  return projects.sort((a, b) => {
    const ao = a.data.order;
    const bo = b.data.order;
    if (ao !== undefined && bo !== undefined) return ao - bo;
    if (ao !== undefined) return -1;
    if (bo !== undefined) return 1;
    return a.data.title.localeCompare(b.data.title);
  });
}

/** Non-draft posts, newest first. Used by /blog, the homepage, the RSS feed and the sitemap. */
export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Zero-padded catalog number, as in `Nº 004`. */
export const workNumber = (index: number) => String(index + 1).padStart(3, '0');

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];

/** `11` → `Eleven`, for counts that open a sentence. Digits past twenty. */
export const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n);

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
