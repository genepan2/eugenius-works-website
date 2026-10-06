# Eugenius Works Website

The personal and professional site for Eugenius Works: a list of projects and a blog.
Static Astro, Tailwind CSS v4, markdown content. A small Cloudflare Worker handles the
contact form (see "Contact form").

The interface is black and white; see DESIGN.md once it exists.

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
status: live                  # live | in progress | prototype | paused | idea
headline: A short line        # optional
url: https://example.com      # optional
repo: https://github.com/...  # optional, only when open source
cover: ../../assets/cover.png # optional, a local file under src/assets/
order: 4                      # optional sort key, lower first
---
```

`status` is required. It must be one of `live`, `in progress`, `prototype`, `paused`,
or `idea`. The build fails on any other value.

Routes: `/`, `/works/`, `/works/<slug>/`, `/contact/`, `/blog/`, `/blog/<slug>/`, `/imprint/`,
`/privacy/`, `/rss.xml`. Every project gets its own page at `/works/<slug>/`. Body content
is optional. The old `/projects` URLs redirect to `/works/`.

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

The form on `/contact/` posts to `/api/contact`, handled by `src/worker.ts`. The site is a
Cloudflare **Worker with static assets**, configured by `wrangler.jsonc`: the Worker
serves the static Astro build from the `ASSETS` binding and runs only for `/api/*`
requests. The Astro build stays static — there is no adapter and no server output mode.

It needs three environment variables, set on the Worker under
**Settings > Variables and Secrets**:

| Variable | Kind | Meaning |
|---|---|---|
| `RESEND_API_KEY` | Secret (encrypted) | Resend API key, from https://resend.com/api-keys |
| `CONTACT_FROM` | Variable | Sender address, must be on the verified domain |
| `CONTACT_TO` | Variable | Where submissions are delivered |

Before any mail will send, `eugenius-works.com` must be verified as a sending domain in
Resend. That means adding the DKIM, SPF, and DMARC records Resend gives you to Cloudflare
DNS and waiting for verification to pass. `CONTACT_FROM` must be an address on that
verified domain — Resend rejects a sender on an unverified one.

Until `RESEND_API_KEY` is set the Worker returns 503 and the form shows a message asking
the visitor to email instead, so the site is safe to deploy before Resend is configured.

For local testing, copy `.dev.vars.example` to `.dev.vars`, then run `npm run build`
followed by `npx wrangler dev`. `.dev.vars` supplies the three values locally, is
gitignored, and must never be committed.

## Security headers

`public/_headers` sets the response headers for static pages and assets: a Content
Security Policy, HSTS, `nosniff`, a referrer policy, a permissions policy, and a
cross-origin opener policy. It also gives `/_astro/*` a long immutable cache, sets the RSS
content type, and sends `X-Robots-Tag: noindex` on `workers.dev` hosts.

Cloudflare does not apply `_headers` to responses that the Worker creates. The Worker
sets `nosniff` and `no-store` on its own JSON responses.

The Content Security Policy allows only same-origin scripts, so no page may use an inline
script.

## Tests

```
node tests/contact.test.ts
```

The test runs the Worker with a stubbed `fetch`. It sends no real request. It needs a Node
version that runs TypeScript files directly.

## Before deploying

Set `CLOUDFLARE_ANALYTICS_TOKEN` in `src/consts.ts` to the real Cloudflare Web Analytics
site token. While it holds the placeholder value the analytics script is not emitted, and
the site builds and runs normally either way. The script is production-only.

## Deliberately deferred

- `/tags/<tag>` index pages
- Links between projects and posts
- Multi-language support
- Dark mode
