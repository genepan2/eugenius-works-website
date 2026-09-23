# Eugenious Works Website

The personal and professional site for Eugenious Works: a list of projects and a blog.
Static Astro, Tailwind CSS v4, markdown content, no backend.

The design is deliberately plain — black and white, system fonts, typography only. Working
infrastructure is the goal of this version, not visual polish.

## Run it locally

```
npm install
npm run dev      # local dev server
npm run build    # static build into dist/
npm run preview  # serve the built site
```

## Add a project

Create `src/content/projects/<slug>.md`. The file name is the URL slug.

```markdown
---
title: Project Name
description: One or two sentences.
url: https://example.com      # optional
repo: https://github.com/...  # optional, only when open source
cover: ../../assets/cover.png # optional, a local file under src/assets/
order: 4                      # optional sort key, lower first
---
```

Body content is optional and it decides the routing:

- **No body** — the project shows in the lists only. It gets no detail page and the lists
  do not link to one.
- **With a body** — the project also gets a detail page at `/projects/<slug>`.

Projects with `order` sort first, ascending. Projects without `order` follow, alphabetically
by title.

## Add a post

Create `src/content/blog/<slug>.md`. The file name is the URL slug.

```markdown
---
title: Post Title
description: Shown in the post list, the page metadata, and the RSS feed.
date: 2026-09-22
tags: ["design", "ai"]  # optional, defaults to []
draft: true             # optional, defaults to false
---
```

`draft: true` keeps a post out of `/blog`, out of `/rss.xml`, and out of the sitemap, and
produces no page in the build.

Tags render as plain text. There are no tag index pages.

## Placeholder content

Every seeded file carries a `<!-- PLACEHOLDER -->` comment at the top of its body. Search
for it to find everything that needs replacing:

```
grep -r PLACEHOLDER src/
```

## Contact form

The homepage form posts to `functions/api/contact.ts`, a Cloudflare Pages Function that
forwards the message by email through the Resend REST API. The Astro build stays static —
Pages serves the function alongside it, so there is no adapter and no server output mode.

It needs three environment variables, set in the Cloudflare Pages dashboard under
**Settings > Environment variables**:

| Variable | Meaning |
|---|---|
| `RESEND_API_KEY` | Resend API key, from https://resend.com/api-keys |
| `CONTACT_FROM` | Sender address, must be on the verified domain |
| `CONTACT_TO` | Where submissions are delivered |

Before any mail will send, `eugenius-works.com` must be verified as a sending domain in
Resend. That means adding the DKIM, SPF, and DMARC records Resend gives you to Cloudflare
DNS and waiting for verification to pass. `CONTACT_FROM` must be an address on that
verified domain — Resend rejects a sender on an unverified one.

Until `RESEND_API_KEY` is set the function returns 503 and the form shows a message asking
the visitor to email instead, so the site is safe to deploy before Resend is configured.

For local testing, copy `.dev.vars.example` to `.dev.vars` and run `wrangler pages dev`.
`.dev.vars` is gitignored and must never be committed.

## Before deploying

Set `CLOUDFLARE_ANALYTICS_TOKEN` in `src/consts.ts` to the real Cloudflare Web Analytics
site token. While it holds the placeholder value the analytics script is not emitted, and
the site builds and runs normally either way. The script is production-only.

## Deliberately deferred

- `/tags/<tag>` index pages
- Links between projects and posts
- A `status` field on projects
- Multi-language support
- Dark mode
- Visual branding and a custom typeface
- Deployment and DNS
