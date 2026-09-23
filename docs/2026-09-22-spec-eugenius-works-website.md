# Spec — Eugenius Works Website

**Date:** 2026-09-22
**Repo:** `/Users/eugenpanov/Code/eugenius-works-website`
**Status:** Ready to build

---

## 1. Purpose

A personal and professional site for Eugenious Works (Estonian legal entity). It shows
what the owner works on and what he thinks about. It is not a lead-generation site and it
does not sell anything.

The site has two kinds of content:

1. **Projects** — a list of things the owner builds or runs, including browser extensions,
   smaller tools, and larger projects.
2. **Blog** — articles about design, development, artificial intelligence, entrepreneurship,
   and business.

### Explicit non-goals

- No "hire me" call to action anywhere on the site.
- No branding work. The design is black and white, typography only, using the system font
  stack. Visual identity is deliberately deferred.
- The freelance business, "Get Eugenius", is a **separate website with separate branding**.
  This repository must not contain Get Eugenius branding, copy, or service descriptions.
  The only connection is a single entry in the project list: name, URL, short description.
  It is treated exactly like every other project.

---

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | Astro (latest stable), static output |
| Styling | Tailwind CSS v4 (CSS-first `@theme`, via the official Astro Tailwind integration) |
| Content | Markdown files in the repository, using Astro Content Collections with schema validation |
| Fonts | System font stack only. No web fonts, no font loading, no external font requests. |
| Package manager | npm |
| Target host | Cloudflare Pages (static). **Do not deploy.** The owner deploys manually later. |
| Domain | `eugenius-works.com` (already on Cloudflare). Used for canonical URLs and the RSS feed only. |

---

## 3. Design

Plain black and white. Typography only.

- Background white, text black. Dark mode is **out of scope** for this version.
- No color other than black, white, and greys for secondary text and rules.
- No shadows, no gradients, no rounded decorative elements, no icons.
- Links: underlined, black. Hover state may change underline or opacity only.
- Layout: a single centered column with a comfortable max width (roughly 65–75 characters
  of body text). Generous vertical rhythm.
- Responsive down to small phone widths with a side gutter. No horizontal scroll.
- Use Tailwind utility classes directly in `.astro` markup. Do not build a component
  library or a theme abstraction layer.

Design quality is explicitly **not** the goal of this version. Working infrastructure is
the goal. Do not spend effort on visual polish beyond clean, readable, consistent typography.

---

## 4. Content model

Two content collections, defined in `src/content.config.ts` with Zod schemas.

### 4.1 `projects`

Location: `src/content/projects/*.md`

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Project name |
| `description` | string | yes | One or two sentences |
| `url` | string (url) | no | The project's own website |
| `repo` | string (url) | no | Public repository, only when the project is open source |
| `cover` | image | no | Local file under `src/assets/`, using Astro's `image()` schema helper so Astro optimizes it |
| `order` | number | no | Manual sort key; lower first. Projects without `order` sort after those with one, alphabetically by title. |

Body content is **optional**. A project with no body renders as a card in the list only and
has **no detail page**. A project with a body gets a detail page at `/projects/<slug>`.
This rule must be implemented, not merely documented.

No `status` field in this version. It is a known later addition.

### 4.2 `blog`

Location: `src/content/blog/*.md`

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | |
| `description` | string | yes | Used for the list page and page metadata |
| `date` | date | yes | Publication date |
| `tags` | string[] | no | Defaults to an empty array |
| `draft` | boolean | no | Defaults to `false`. Drafts are excluded from all lists, the RSS feed, and the sitemap in production builds. |

Tags are rendered on each post and on post list entries as **plain text only**. There are
**no** `/tags/<tag>` index pages in this version. Do not create them.

---

## 5. Pages

| Route | Contents |
|---|---|
| `/` | Short intro (two or three lines) linking to `/about`; the project list; the most recent 5 posts linking to `/blog`; the contact form section; footer |
| `/projects` | Full project list |
| `/projects/<slug>` | Detail page. Generated **only** for projects that have body content. |
| `/blog` | All posts, newest first, grouped or separated clearly. Title, date, description, tags. |
| `/blog/<slug>` | Single post: title, date, tags, rendered markdown body |
| `/about` | A single markdown-backed page describing the owner and Eugenious Works |
| `/rss.xml` | RSS feed of blog posts, built with `@astrojs/rss` |
| `/404` | Minimal not-found page |

There is **no** `/contact` page. The contact form lives on the homepage only.

### Navigation

A single header on every page: site name linking to `/`, plus links to `/projects`,
`/blog`, and `/about`. No dropdowns, no mobile hamburger menu — four links fit on a phone.

### Footer

On every page. Contains:

- LinkedIn link
- X link
- RSS feed link
- Copyright line with the entity name

The footer link list must be defined as a single array in one place (for example
`src/consts.ts`) so that adding a link later is a one-line change.

---

## 6. Contact form

**Deliberately incomplete in this version.** The owner will connect the backend later.

Build the form markup on the homepage: name, email, message, submit button. Style it to
match the black-and-white typography, using only borders and text.

Requirements:

- The form must **not** submit anywhere. Give it no working `action`, and prevent the
  default submit so nothing is sent and no error appears to the visitor.
- Place a clear `TODO` comment directly above the form naming the planned backend:
  Resend, called from a Cloudflare Pages Function, with Formspree as the fallback option.
- Include a hidden honeypot input in the markup now, so the later backend work can read it.
- Do not install Resend, do not add API keys, do not create a Pages Function, and do not
  add spam protection logic.

---

## 7. Analytics

Cloudflare Web Analytics. Add the script tag to the shared layout, guarded so it loads in
production builds only. The site token is not available yet — use an obvious placeholder
constant in `src/consts.ts` with a comment stating that the owner must fill it in. The site
must build and run correctly while the placeholder is unset.

---

## 8. Seed content

Invent plausible placeholder content. Mark every invented file with a `<!-- PLACEHOLDER -->`
comment at the top of its body so the owner can find and replace it quickly.

- **Projects:** create 4. One of them must be **Get Eugenius**, the freelance business,
  entered exactly like any other project: name, URL, short description, and nothing more.
  The other three should be plausible small tools — for example a browser extension and a
  small utility. Give exactly one project a body so the conditional detail page route is
  actually exercised.
- **Blog:** create 3 posts with realistic titles across the stated subjects (design,
  development, AI, entrepreneurship, business), each a few paragraphs long, with tags and
  varied dates. Include one post with `draft: true` so the draft filter is exercised.
- **About:** a few short paragraphs about the owner and Eugenious Works.

---

## 9. SEO and metadata

- One shared `<head>` handling: title, description, canonical URL, Open Graph, and Twitter
  card tags. Per-page titles and descriptions come from the content.
- `@astrojs/sitemap` for `/sitemap-index.xml`.
- A `robots.txt` permitting all crawlers and pointing at the sitemap.
- Site constants (site name, description, domain, author, social links, analytics token)
  live in `src/consts.ts`.

---

## 10. Repository hygiene

- `.gitignore` covering `node_modules/`, `dist/`, `.astro/`, and local environment files.
- A `README.md` covering: what the site is, how to run it locally, how to add a project,
  how to add a post, and a short list of what is deliberately deferred.
- Do **not** run `git commit` or `git push`. Leave the work in the working tree.
- Do **not** create a GitHub repository. Do **not** deploy.

---

## 11. Acceptance criteria

The task is complete when all of the following hold and have actually been run:

1. `npm install` succeeds.
2. `npm run dev` serves the site locally without console errors.
3. `npm run build` completes with no errors and no Astro content-collection schema warnings.
4. Every route in section 5 renders: `/`, `/projects`, `/blog`, `/about`, `/rss.xml`,
   `/404`, one `/blog/<slug>`, and the one `/projects/<slug>` that has a body.
5. A project **without** body content produces **no** detail page, and the project list
   does not link to a nonexistent page for it.
6. The draft post does not appear on `/blog`, in `/rss.xml`, or in the sitemap.
7. `/rss.xml` is valid XML and lists the non-draft posts.
8. The homepage contact form renders and submitting it does nothing visible — no
   navigation, no network request, no error.
9. The page contains no web font request. Only the system font stack is used.
10. The layout has no horizontal scroll at 375px width.

---

## 12. Deferred — do not build

These are known future work. Building any of them now is out of scope.

- Contact form backend (Resend, Cloudflare Pages Function) and spam protection
- `/tags/<tag>` index pages
- Links between projects and posts
- A `status` field on projects
- Multi-language support
- Dark mode
- Any visual branding or custom typeface
- Deployment and DNS
