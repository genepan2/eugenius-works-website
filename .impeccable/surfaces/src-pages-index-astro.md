---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/works/index.astro","src/pages/works/[slug].astro","src/pages/contact.astro","src/pages/blog/index.astro","src/pages/blog/[...slug].astro","src/pages/imprint.astro","src/pages/privacy.astro","src/pages/404.astro","src/layouts/BaseLayout.astro"]
---

# Surface brief: whole site (homepage leads)

Scope: every route of eugenius-works.com. The homepage is the first surface; `/works/`,
`/works/<slug>/`, `/contact/`, `/blog/`, `/blog/<slug>/`, `/imprint/`, `/privacy/` and
`/404` inherit its world.

Visitor mode: Read. The visitor reads who this is and scans what he makes.

Audience and job: peers and builders who arrive from X or LinkedIn. They read the about
text, scan the works, and open the one they care about.

Constraints: black and white only; the owner's texts stay word for word; no fabricated
images, clients or numbers; the contact form works without JavaScript.

History: on 2026-10-06 the owner first chose "The Long-Copy Ad" from written cards. The
build added a status-dot device that the cards did not show. The owner saw it and rejected
it: "remove this whole dots thing, it must go. I want a plain structure", and asked to see
an image before code. He then chose mockup C from three rendered mockups, with one change.

Unresolved: real images (portrait, project pictures, article pictures) arrive later and
will be in color.

## Direction contract

THESIS: Two words. The company name is the structure of the site: "Eugenius" is the
person, "Works" is the work. The landing page holds these two sections and nothing else.
This refuses the earlier ad concept and every device that is not text: no dots, no
circles, no status symbols, no frames, no picture stand-ins.

OWN-WORLD: One ink, `#000` on `#fff`, no gray, no color. One typeface, Jost. Exactly one
large element per section: the section word, set as a display word at the left edge.
Everything else is normal text. Lists are tables ruled by 1px hairlines. Status is a
word. Forms are plain 1px boxes. One left axis for everything.

STORY: The visitor reads who Eugen is in three short paragraphs, scans eleven works with
their status and full description, opens one, and finds the contact page and the blog in
the footer when he wants them.

FIRST VIEWPORT: Running head "Eugenius Works" at the top left, small. The display word
"Eugenius" at the left edge, about 6rem. Under it the three about paragraphs in one
column of about 36rem. Below, the display word "Works" and the first rows of the table:
name and status word at the left, the full description at the right. No button, no
form, no picture.

FORM: Mockup C, "Two words", chosen by the owner from three rendered mockups; the
approved image is `.impeccable/mocks/plain/c-desktop.png` (phone: `c-mobile.png`,
source: `c.html`). Owner's change to it: no contact form on the landing page; contact
and blog are separate pages. No dice roll for this round; the owner pinned the
direction. Motion: none.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
