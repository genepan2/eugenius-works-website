---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/works/index.astro","src/pages/works/[slug].astro","src/pages/blog/index.astro","src/pages/blog/[...slug].astro","src/pages/imprint.astro","src/pages/privacy.astro","src/pages/404.astro","src/layouts/BaseLayout.astro"]
---

# Surface brief: whole site (homepage leads)

Scope: every route of eugenius-works.com. The homepage is the first surface; `/works`,
`/works/<slug>`, `/blog`, `/blog/<slug>`, `/imprint`, `/privacy` and `/404` inherit its world.

Visitor mode: Experience on the homepage and the work pages (the works lead). Read on blog
posts, imprint and privacy.

Audience and job: peers and builders who arrive from X or LinkedIn. They scan the eleven
works, open the one whose problem they know, and may write a note.

Constraints: black and white only; the owner's texts stay word for word; no fabricated
images, clients or numbers; the contact form works without JavaScript.

Unresolved: real images (portrait, project pictures, article pictures) arrive later and
will be in color.

## Direction contract

THESIS: The problem is the headline; the name only signs it. Every work is one
black-and-white print ad in the manner of the 1960s big-idea campaigns. This refuses the
builder-portfolio default (name, tagline, grid of project names) and its opposite, the
giant brutalist wordmark.

OWN-WORLD: One ink. Pure black on pure white, no gray, no color; color belongs to future
images only. One geometric sans in the Futura line (Jost). Headlines are demi-bold sentence
case and end with a period. Copy stands in narrow flush-left columns. A solid 1px keyline
frames an ad; a dashed keyline frames the reply coupon; hairlines rule the index. Hover and
active states invert: paper on ink. The picture is a black dot whose size is the status of
the work: idea a speck, prototype small, in progress medium, live large, paused a ring.

STORY: The visitor sees eleven dots and one sentence, understands that this person builds
what is missing, scans eleven problems as headlines, opens the ad of the one they know, and
replies through the coupon.

FIRST VIEWPORT: One framed ad. Running head above the frame: "Eugenius Works", small, at
left. The upper 40% of the frame is a white field that holds the eleven dots in one row,
bottom-aligned, left of center, each dot a link to its work. Below, centered: the headline
"When something is missing, I build it myself." at 5rem or more. Below it the three
paragraphs of the about text in three columns. Signature "Eugenius." at bottom right. No
button; the dots and the two words are the actions.

FORM: The Long-Copy Ad, position 1 of the ordered list (the pick, chosen by the user over
the assigned Card Index). Seed key 112bcaf0. Code-led. Signature interaction: the dot
travels. A dot or headline clicked on an index grows into the picture field of its ad
through a cross-document view transition. Motion grammar: that one morph, exponential
ease-out; state changes invert instantly; nothing else moves.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
