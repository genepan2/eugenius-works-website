# Roadmap: eugenius-works-website

_updated 2026-11-06 by Droid_

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

### error report token — open
next: create a Cloudflare API token with only Account → Account Analytics → Read and save
it as the repository secret `CLOUDFLARE_ANALYTICS_TOKEN`, then run the "Errors" workflow once
last: 2026-11-06
Until then the daily error report skips itself.
→ .github/workflows/errors.yml

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

## unsorted

### links for the live works
ExtraSeat and Triple Digit are marked "live" but have no `url`, so a visitor cannot check
it. Add the URLs to the project files when they are public.

### project images and a portrait
The design is black and white so that color images can carry the color. No image exists
yet. A `cover` field is ready on projects and posts.

## done

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
tag index pages · project ↔ post links · multi-language support · dark mode ·
color in the interface (color belongs to the images)
