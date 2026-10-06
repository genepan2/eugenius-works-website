# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Peers and builders: indie hackers, designers, developers and founders who arrive from X or
LinkedIn and want to see what Eugen Panov builds and how he thinks. They are not clients.
They scan first, then read what catches them.

## Product Purpose

The personal and professional site of Eugen Panov, run under his Estonian company Eugenius
Works OÜ. It shows what he works on (products, tools, experiments) and what he thinks
about (a blog on design, development, AI, entrepreneurship and business). It does not sell
anything. Success: a visitor understands in seconds who he is, sees the range of the work
with an honest status for each project, and has a reason to come back or to write.

## Positioning

A generalist's public record: a communication designer who became a builder in automation
and AI, and who builds the missing tool himself. Every project is listed with an honest
status, from live product to bare idea. The company name is the structure of the site:
"Eugenius" is the person, "Works" is the work.

## Operating Context

- Static Astro site served by a Cloudflare Worker with static assets, at eugenius-works.com.
- Content is Markdown in the repository: `src/content/projects/` and `src/content/blog/`.
- A contact form on its own page, `/contact/`, sends through Resend. No email address is
  shown outside the imprint.
- English only. Multi-language support is deferred.
- Get Eugenius, the freelance service, is a separate site with a separate brand. Here it is
  one ordinary project entry.

## Capabilities and Constraints

- Routes: `/`, `/works/`, `/works/<slug>/`, `/contact/`, `/blog/`, `/blog/<slug>/`,
  `/imprint/`, `/privacy/`, `/404`, `/rss.xml`. Old `/projects` URLs redirect to `/works`.
- Each project has a required status: live, in progress, prototype, paused, idea.
- The contact form must work without JavaScript.
- No cookies, no tracking beyond cookieless Cloudflare Web Analytics, no cookie banner.
- Two client names must never appear in the repository or the build.
- Undecided: the public name of the "Product Scene Generator"; the VAT status in the
  imprint; the analytics token.

## Brand Commitments

- **Black and white only.** The interface carries no color. Reason, from the owner: images
  for blog articles and projects come later and will be colorful, so the interface must
  stay out of their way. Typeface, layout and motion are free.
- **Plain structure, text only.** No dots, no circles, no status symbols, no picture
  stand-ins, no decorative devices. The owner rejected a status-dot system on 2026-10-06.
  Status is a word.
- The two-word navigation "Eugenius" / "Works" and the two homepage sections of the same
  names. **The landing page holds only these two sections.** The contact form, the blog
  and everything else live on separate pages.
- **Image before code.** A visual change is shown to the owner as an image (a rendered
  mockup) and approved before it is built.
- The owner's own texts: the about text and the project descriptions. They are not
  rewritten without his approval.
- No "hire me", no sales language.

## Evidence on Hand

- Eleven real projects with the owner's descriptions and statuses.
- The owner's about text (three short paragraphs).
- No images yet: no portrait, no project screenshots, no article images. Do not fabricate
  them. Do not fabricate testimonials, numbers, clients or logos.
- No published blog posts yet. Four seed posts exist as drafts and are invented text.

## Product Principles

1. Honest status over polish: an idea is shown as an idea.
2. The work leads; the interface stays out of the way of future color images.
3. Small and exact: no dependency, page or feature without a present need.
4. The owner's words, not generated ones.

## Accessibility & Inclusion

WCAG 2.2 AA. The owner builds a tool for colorblind climbers; the site must not rely on
color for meaning, which the black-and-white commitment already enforces.
