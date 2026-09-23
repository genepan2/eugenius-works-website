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

/**
 * A project gets a detail page only when it has body content.
 * The seed `<!-- PLACEHOLDER -->` marker is not content, so it does not count.
 */
export function hasDetailPage(project: { body?: string }) {
  const body = (project.body ?? '').replace(/<!--[\s\S]*?-->/g, '').trim();
  return body.length > 0;
}

/** Non-draft posts, newest first. Used by /blog, the homepage, the RSS feed and the sitemap. */
export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
