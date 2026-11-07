# Roadmap: eugenius-works-website

_updated 2026-11-07 by Droid_

The plain "Two words" redesign and the technical hardening are live at
https://eugenius-works.com since 2026-10-08.

## active

### contact form receipt check — open
next: create a full-access Resend API key, put it in `.dev.vars` as `RESEND_API_KEY`, run
`npm run test:e2e`
last: 2026-10-08
The end-to-end test sends the live form in a browser and passed on 2026-10-08. Its second
half asks Resend whether the email was delivered; that half is skipped without a key that
can read emails. Also look in the `hey@` mailbox for the subject
`Contact form: E2E 1791437125705-6agfje`.
→ tests/contact.e2e.ts

### cloudflare dashboard settings — open
next: turn on SSL/TLS → Edge Certificates → "Always Use HTTPS"; decide about `www`
last: 2026-10-06
`http://eugenius-works.com` answers with 200 and no redirect, and
`www.eugenius-works.com` has no DNS record. Both are dashboard actions, not code.

### product scene generator name — open
next: choose a public name for the product scene generator
last: 2026-09-28
The project is listed under a working title, marked `<!-- PLACEHOLDER -->` in
`src/content/projects/product-scene-generator.md`. The client it was built for must not be
named on the site.

### real blog content — open
next: write the first real post, then delete the four seed posts
last: 2026-10-06
All four seed posts are `draft: true` and invented. One of them says the site uses system
fonts, which is no longer true. The blog page, the post page and the footer link are
ready; the footer shows "Blog" when the first post is published.

### VAT number in the imprint — open
next: decide whether Eugenius Works OÜ is VAT-registered; add the number or drop the TODO
last: 2026-09-22
→ src/pages/imprint.astro

## planned

Mission-sized work, each with milestones. A visual change starts with a rendered mockup
the owner approves (DESIGN.md). Suggested order: images first, then the blog, then the
public record.

### images for works and blog — planned
next: write a mission brief; first milestone ends with mockups of a work page and a post
with a cover, for the owner to approve
last: 2026-11-07
Color comes in only through images, and none exist yet. Build the path for them: an image
pipeline with Astro `<Image>` (AVIF and WebP, fixed sizes, no layout shift), alt text
required in the content schema, a gallery on the work page, the social card taken from the
cover, and site tests for image weight and dimensions. The images themselves come from the
owner; none are invented.

### blog ready to publish — planned
next: write a mission brief after the first real post exists
last: 2026-11-07
Reading time and the share line (X, LinkedIn, Email) are live since 2026-10-08. Still
open: tag pages, "related works" under a post and "posts about this work" on a work page,
previous and next post, a full-text RSS feed, footnotes and code blocks to the design
standard, and a check that blocks publishing while a post still holds seed text. Usual
extras to decide on: more share targets (Bluesky, Mastodon, Hacker News), a "copy link"
button (a small script in a file, the CSP allows no inline script), a table of contents
for long posts.

### works as a public record — planned
next: write a mission brief
last: 2026-11-07
The positioning is "a generalist's public record". Add a status history for each work
(when it went from idea to prototype to live), the date of the last change read from git,
a `/now` page with what Eugen works on right now, and an RSS feed of changes to the works.
Text only: status stays a word.
## unsorted

### links for the live works
ExtraSeat and Triple Digit are marked "live" but have no `url`, so a visitor cannot check
it. Add the URLs to the project files when they are public.

### project images and a portrait
No image exists yet. A `cover` field is ready on projects and posts. The pipeline for
them is planned above; the images and the portrait come from the owner.

## done

### claude review on every pull request — 2026-11-07
`.github/workflows/claude-review.yml` reviews each pull request and comments on bugs,
security issues and broken project rules. First review ran on pull request 19.

### error report token — 2026-11-06
The repository secret `CLOUDFLARE_ANALYTICS_TOKEN` is set; `.github/workflows/errors.yml`
runs every day.

### error alert in Cloudflare — 2026-11-06
A Cloudflare monitor (Alerts → Monitors, Threshold) counts rows of `eugenius_works_api`
with `double2 = 1` every 15 minutes over the last 15 minutes and mails `hey@` at 4 or more.

### cloudflare web analytics — 2026-11-06
The site token is in `src/consts.ts`; every production page loads the Cloudflare beacon,
as `/privacy/` describes.

### deploy from CI with gradual rollout — 2026-11-06
A merge into `main` deploys from CI: the new version gets 0 % and a smoke test, then 10 %
for a minute, then 100 %; a failed check puts the old version back. Nightly flaky-test
runs, test durations, request timing and the flag check came with it.

### blog reading time and share links — 2026-10-08
A post shows "N min read" on its date line and a plain "Share: X, LinkedIn, Email" line
below the text. No script, no icon.

### redesign deployed — 2026-10-08
Pushed on the owner's word. Checked on the real domain: the security headers, and
`/projects/extraseat` → `/works/extraseat/`.

### plain "Two words" redesign — 2026-10-06
One typeface (Jost, self-hosted), black and white only. The landing page holds two
sections, "Eugenius" and "Works"; the contact form moved to `/contact/`. A first attempt
with status dots was rejected by the owner and removed. Recorded in DESIGN.md.

### technical hardening — 2026-10-06
Security headers and a content security policy, long-lived asset caching, a hardened
contact endpoint, trailing-slash URLs, structured data, a social card, and a site test
that guards the build (`npm test`).

### landing page restructure — 2026-10-06
Settled by the redesign: two sections on the landing page, everything else on its own
page. This closes the thread parked on 2026-09-25.

### eugenius section text — 2026-09-29
The owner's own about text replaced the invented bio.

### real project list — 2026-09-28
Eleven real projects with the owner's descriptions and a required `status` field.

## deferred

Not scheduled. Listed so they are not rediscovered as ideas:
multi-language support (not needed, owner 2026-11-07) · dark mode ·
color in the interface (color belongs to the images)
