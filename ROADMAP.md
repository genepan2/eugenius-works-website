# Roadmap: eugenius-works-website

_updated 2026-09-29 by Claude_

The site is live at https://eugenius-works.com — an Astro static build served by a
Cloudflare Worker, with a contact form that sends through Resend.

## active

### product scene generator name — open
next: choose a public name for the product scene generator
last: 2026-09-28
The project is listed under a working title, marked `<!-- PLACEHOLDER -->` in
`src/content/projects/product-scene-generator.md`. The client it was built for must not be
named on the site.

### real blog content — open
next: write the first real post
last: 2026-09-29
All four seed posts are now `draft: true`, so the blog, the RSS feed and the sitemap are
empty and the homepage hides its Writing section. Delete the seed posts once real ones
exist.

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

### eugenius section text — 2026-09-29
The owner's own about text replaced the invented bio.

### real project list — 2026-09-28
Eleven real projects with the owner's own descriptions, and a required `status` field
(live, in progress, prototype, paused, idea) shown after each title. No client names
appear. Only Get Eugenius links out.

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

## deferred

Not scheduled. Listed so they are not rediscovered as ideas:
tag index pages · project ↔ post links · multi-language
support · dark mode · any visual branding or custom typeface
