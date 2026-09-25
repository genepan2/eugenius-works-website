# Roadmap: eugenius-works-website

_updated 2026-09-25 by Claude_

The site is live at https://eugenius-works.com — an Astro static build served by a
Cloudflare Worker, with a contact form that sends through Resend.

## active

### real project content — open
next: write the descriptions for Extraseat, Hushspeak and Tripledigit, and decide which
have public URLs
last: 2026-09-25
Placeholder descriptions are in place and marked `<!-- PLACEHOLDER -->`. No project has a
`url` or `repo` yet, so none links anywhere. No project has body content, so the site
builds zero detail pages.

### real blog content — open
next: replace or delete the three placeholder posts
last: 2026-09-23
`src/content/blog/` holds 4 seed posts, one of them `draft: true`. All are invented and
marked `<!-- PLACEHOLDER -->`.

### cloudflare web analytics token — open
next: set `CF_BEACON_TOKEN` in `src/consts.ts`, or soften the privacy policy's analytics
section until it is set
last: 2026-09-22
The token is still a placeholder, so nothing is collected — while `/privacy` already
describes Cloudflare Web Analytics as running. The policy currently over-discloses.

### VAT number in the imprint — open
next: decide whether Eugenius Works OÜ is VAT-registered; add the number or drop the TODO
last: 2026-09-22
→ src/pages/imprint.astro

## parked

### landing page restructure — second pass
parked 2026-09-25 — the two-section Eugenius / Works split and the two-word navigation
shipped. The owner was still thinking through the fuller structure; revisit when that
settles.

## done

### homepage restructure and rename — 2026-09-25
Company name spelling corrected to "Eugenius" site-wide. Homepage split into `#eugenius`
and `#works`, `/about` folded in and deleted, navigation reduced to two words, footer
extended to carry every other route. Seed projects replaced. Phone number removed from
the imprint; contact email is now `hey@`.

### deploy to cloudflare — 2026-09-25
Live on `eugenius-works.com`. Git-connected Worker with static assets: `run_worker_first`
scoped to `/api/*`, so pages are served from the asset store without invoking the Worker.
Verified end to end — every route, the RSS feed, the custom 404, and the API's error
paths.

### contact form — 2026-09-25
Resend-backed, sending confirmed end to end. Honeypot, validation, per-IP rate limiting,
and a clean 502 with no key or upstream error leaked on failure. `RESEND_API_KEY` is a
dashboard secret; the two addresses live in `wrangler.jsonc`, which overrides the
dashboard on every deploy.

### legal pages — 2026-09-25
`/imprint` and `/privacy`, written for an Estonian entity under the Information Society
Services Act and the EU e-Commerce Directive. The privacy policy describes the site's real
data flows. No cookie banner: the site sets no cookies and the analytics is cookieless.

### initial site build — 2026-09-23
Astro 7, Tailwind v4, black and white, system fonts. Two content collections. Projects get
a detail page only when they have body content; drafts are excluded from listings, the RSS
feed and the sitemap.
→ docs/2026-09-22-spec-eugenius-works-website.md

## deferred

Not scheduled. Listed so they are not rediscovered as ideas:
tag index pages · project ↔ post links · a project `status` field · multi-language
support · dark mode · any visual branding or custom typeface
