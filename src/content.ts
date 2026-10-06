import { getCollection, type CollectionEntry } from 'astro:content';

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

/**
 * The ad's headline is the description's first sentence; the copy is the rest.
 * A sentence ends at the first `.`, `!` or `?` followed by a space or the end.
 */
export function splitDescription(description: string): { headline: string; copy: string } {
  const match = description.match(/^.*?[.!?](?=\s|$)/s);
  if (!match) return { headline: description.trim(), copy: '' };
  return { headline: match[0].trim(), copy: description.slice(match[0].length).trim() };
}

/** Headline of a work: the frontmatter override, else the first sentence of its description. */
export function projectHeadline(project: CollectionEntry<'projects'>) {
  return project.data.headline ?? splitDescription(project.data.description).headline;
}

/** Zero-padded catalog number, as in `Nº 004`. */
export const workNumber = (index: number) => String(index + 1).padStart(3, '0');

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];

/** `11` → `Eleven`, for counts that open a sentence. Digits past twenty. */
export const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n);
