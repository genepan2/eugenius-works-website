import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_NAME, SITE_DESCRIPTION } from '../consts';
import { getPublishedPosts } from '../content';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      categories: post.data.tags,
      link: `/blog/${post.id}/`,
    })),
  });
}
