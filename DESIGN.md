---
name: Eugenius Works
description: One ink, one typeface. Every work is a black-and-white print ad, and the picture is a dot whose size is the status of the work.
colors:
  ink: "#000"
  paper: "#fff"
typography:
  display:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "clamp(2.25rem, 6.2vw, 5.25rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  display-long:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  display-reading:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "clamp(2.25rem, 4.6vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "clamp(1.375rem, 2.5vw, 2.125rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  signature:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "clamp(1.5rem, 2.4vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.5
  body-reading:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
  quote:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.4
  wordmark:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "tnum"
rounded:
  none: "0"
  dot: "50%"
spacing:
  page-gutter: "clamp(1rem, 4vw, 3rem)"
  ad-padding: "clamp(1.25rem, 4vw, 4rem)"
  section-gap: "6rem"
  column-gap: "2.5rem"
  row-padding: "1rem"
components:
  ad:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.ad-padding}"
  coupon:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "clamp(1.25rem, 4vw, 3rem)"
  button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0.6rem 1.5rem"
    height: "44px"
  button-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  button-disabled:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  link:
    textColor: "{colors.ink}"
  link-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  index-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "1rem 0"
  index-row-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.4rem 0"
  notice:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.6rem 0.9rem"
  status-dot:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.dot}"
  skip-link:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    padding: "0.5rem 0.75rem"
---

# Design System: Eugenius Works

## Overview

**Creative North Star: "The Long-Copy Ad"**

Every work is one black-and-white print ad in the manner of the 1960s big-idea campaigns. The problem is the headline. The name only signs it. A keyline frames the ad. A white picture field stands at the top. A centered headline follows, then narrow flush-left copy columns, then a signature at the bottom right.

The system has one ink and one typeface. There is no gray, no color, no shadow, no gradient and no rounded corner. The only round form is the status dot. The dot is the picture of a work, and its size is the status of the work. Interface color stays out, because the images that come later are in color and must stand alone.

States are binary. An element is ink on paper, or it inverts to paper on ink at once. One thing moves: the dot of a work travels into its ad when the visitor opens the work.

**Key Characteristics:**
- One ink on one paper. No third value.
- One typeface, Jost, in three weights: 400, 600, 700.
- Three line types: a 1px solid keyline and hairline, a 1.5px dashed coupon line, a 2px ring.
- The dot is the only picture and the only round form.
- Hover inverts at once. Only the dot moves.
- Headlines are sentence case and end with a period.

## Colors

The palette is two values: pure black ink on pure white paper.

### Primary
- **Ink** (`colors.ink`): all text, all lines, all dots, the solid button, the inverted row, the text selection, the caret and the form accent color.

### Neutral
- **Paper** (`colors.paper`): the page, the picture field, and the text color on every inverted surface. The browser theme color is also paper.

### Named Rules
**The One Ink Rule.** The interface has two values and no value between them. Gray, tint, opacity and gradient are not available. The default Tailwind palette is removed (`--color-*: initial`), so no other color utility exists.

**The Color Is For Pictures Rule.** Color enters the site only through images: a work `cover`, a post `cover`, an image in a post body. The interface around them stays ink and paper.

**The No-Highlight Rule.** Code blocks have no syntax colors. Syntax highlighting is off in the build configuration.

## Typography

**Display Font:** Jost Variable (self-hosted through `@fontsource-variable/jost`, latin file preloaded), with "Jost Fallback"
**Body Font:** Jost Variable, the same family
**Label/Mono Font:** Jost for labels. Code in post bodies uses the system monospace stack (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`) at 0.85em. This is the only other family.

**Character:** One geometric sans in the Futura line does all the work. Demi-bold headlines stand close and tight. The copy is regular weight at 19px and reads like ad body text.

"Jost Fallback" is local Arial or Helvetica with adjusted metrics (`size-adjust: 96%`, `ascent-override: 111%`, `descent-override: 39%`, `line-gap-override: 0%`). The font swap does not move the layout.

### Hierarchy
- **Display** (600, `clamp(2.25rem, 6.2vw, 5.25rem)`, line-height 1.02, tracking -0.025em): the headline of an ad and of an index page. Centered and balanced. Maximum width 18ch, and 22ch from 64rem viewport width. A flush-left variant heads the homepage sections ("Works.", "Writing.", "Send a note.").
- **Display, long** (600, `clamp(2.25rem, 5vw, 4.25rem)`): a work headline of 64 characters or more steps down one size, as a print ad does.
- **Display, reading** (600, `clamp(2.25rem, 4.6vw, 4rem)`, max 22ch): the headline of a post, the imprint and the privacy page.
- **Title** (600, `clamp(1.375rem, 2.5vw, 2.125rem)`, line-height 1.15, tracking -0.01em): index row headlines and the subheads of the legal pages. Post body `h2` uses the same style from 1.625rem. Post body `h3` is 1.25rem.
- **Signature** (700, `clamp(1.5rem, 2.4vw, 2rem)`, line-height 1.1, tracking -0.02em): the name that signs an ad, at the bottom right. This is the only use of weight 700.
- **Body** (400, 1.1875rem, line-height 1.5): ad copy. `text-wrap: pretty`, manual hyphens. Column width is 17rem. Short copy holds a 34rem measure.
- **Body, reading** (400, 1.1875rem, line-height 1.6): post bodies and legal pages, in a 36rem column.
- **Quote** (400, 1.375rem, line-height 1.4): block quotes in a post, behind a 1px ink rule at the left with 1.5rem padding.
- **Wordmark** (600, 1rem): the two words "Eugenius" and "Works" in the running head.
- **Label** (400, 0.875rem, line-height 1.4, tabular numerals): fine print. Folio, captions, row numbers, row meta, form labels, pager, footer.

### Named Rules
**The Period Rule.** A display headline is a sentence in sentence case and ends with a period. This is also true for one-word headlines ("Works.", "Imprint."). The signature also ends with a period when it is the name "Eugenius.". Subheads and post titles keep the words of their author.

**The Two Sizes Of Small Rule.** Small text is 0.875rem fine print or 1rem wordmark. Nothing is smaller than 0.875rem.

## Layout

The page is one column, 76rem wide at most, centered, with a gutter of `clamp(1rem, 4vw, 3rem)`. The running head stands above the content. The fine-print footer closes the page under a hairline, `clamp(4rem, 8vw, 7rem)` below the content. Homepage sections are 6rem apart.

**The ad.** A 1px ink keyline with padding `clamp(1.25rem, 4vw, 4rem)`. From top to bottom:
1. The picture field. White, at least `clamp(12rem, 38vh, 24rem)` high. Its content stands at the bottom of the field.
2. The headline, centered, `clamp(2rem, 5vw, 4rem)` below the field.
3. The copy. Three columns of 17rem with 2.5rem gaps, centered as a block, text flush left, `clamp(1.75rem, 3.5vw, 3rem)` below the headline. Paragraphs do not break across columns. Copy below 420 characters without a body becomes one 34rem column.
4. The signature block at the bottom right, text right-aligned, with one line of fine print below the name.

The homepage, each work, the empty blog and the 404 page all use this anatomy.

**The first-viewport fit.** At 64rem width and 45rem height or more, the ad is a flex column with a minimum height of `100svh - 6.5rem` and 2rem block padding. The picture field takes the free space. The gaps close to 2rem, 1.5rem and 1.5rem. The whole ad, keyline to keyline, stands in the first view.

**The picture field.**
- Homepage: all work dots in one row on one baseline, flush left, bottom-aligned. The base size is `min(7.5rem, 100cqi / 7.75)` and the gap is 0.1 of the base, so the row fills the field width on every screen from 360px. The divisor is the sum of the size factors of the current works plus the gaps plus a little air. Calculate it again when the works or their statuses change. Below 360px the row can wrap.
- A work: one large dot, base `clamp(9rem, 26vw, 19rem)`, at the top of the field. Its left edge is on the left edge of the 34rem short copy column.
- A caption band stands under the hero dots: one line of fine print, two lines below 30rem.

**The ruled index.** A list with a hairline above and a hairline below each row. A work row is a grid: number (3.5ch), dot (1.6rem), headline (free), meta (auto, right-aligned). A post row is headline and date. Below 40rem the meta moves under the headline and aligns left.

**Reading pages.** A centered headline block, then one 36rem column. Sections of the legal pages are 3rem apart. Long URLs wrap at any width.

**Images.** A work `cover` replaces the picture field of the ad at full frame width. The status dot then moves into the signature, at 0.9em, before the title. A post `cover` stands above the reading head at full page width. Images in a post body are limited to the column width.

**The closing.** "Send a note." and the reply coupon stand side by side in two equal columns from 56rem, and stack below.

**Breakpoints:** 359px (hero row can wrap), 30rem (caption band), 40rem (index row, pager), 56rem (closing), 64rem (headline measure; with 45rem height, the first-viewport fit).

**Print.** The print style removes the navigation, the closing, the footer links and the keyline, and prints external link addresses after the link text.

## Elevation & Depth

The system is flat. There are no shadows, no blur, no layers and no tonal steps. Paper has one level. A state change swaps ink and paper. It never lifts an element.

### Named Rules
**The Flat Paper Rule.** Nothing stands above the paper. Separation comes from a line or from white space, not from depth.

## Shapes

All corners are square (radius 0): frames, button, fields, notices, code blocks. The status dot is the only round form (radius 50%). The focus ring of a dot is also round.

Three line types exist, and each has one meaning:
- **1px solid ink:** the keyline of an ad, the hairlines of the index, the footer rule, the underline of a text field, the rule lines of the textarea, the notice border, the code block border, the quote rule, the link underline.
- **1.5px dashed ink:** the reply coupon only.
- **2px solid ink:** the focus ring (3px offset) and the paused ring.

### Named Rules
**The Dot Is The Only Circle Rule.** A circle always means a work and its status. No other element is round.

## Components

### Status Dot
The signature component. A circle in the current text color. Its width is `max(3px, base × factor)`. The context sets the base size and the status sets the factor.

| Status | Factor | Form |
|---|---|---|
| live | 1 | solid |
| in progress | 0.6 | solid |
| prototype | 0.32 | solid |
| idea | 0.14 | solid |
| paused | 0.6 | ring, 2px stroke, no fill |

Base sizes: hero row `min(7.5rem, 100cqi / 7.75)`, work picture `clamp(9rem, 26vw, 19rem)`, index row 1.6rem, pager 1rem, signature 0.9em. The dot is decorative for assistive technology. The status always stands in text next to it or in the link label.

In the hero row each dot is a link. The hit area is at least 28px. Hover and focus do not invert the dot. They put the 2px ring around the dot itself, and the caption band shows the number, title and status of that work in place of the general caption.

### The Dot Travels (motion)
The one authored motion. A click on a hero dot or an index row opens the work, and the dot grows into the picture field of the ad. The way back shrinks it into its place.
- A cross-document view transition (`@view-transition { navigation: auto }`). The script `src/scripts/dot-travel.js` gives the name `work-dot` to the clicked dot. The large dot of the work page has the same name.
- The transition group itself draws the circle: radius 50%, ink background. The old and new snapshots are hidden. Thus the dot stays a sharp ink circle at every size.
- For a paused work the transition type `dot-ring` draws the group as a 2px ring without fill.
- Duration 450ms, easing `cubic-bezier(0.16, 1, 0.3, 1)`. The page itself crossfades in 150ms.
- All of this, and smooth scrolling, is inside `prefers-reduced-motion: no-preference`. Without it, pages change at once.

### Links
- **Rest:** ink text, 1px underline, 0.2em offset.
- **Hover:** ink background, paper text, at once. No transition.
- **Focus:** 2px ink outline, 3px offset.
- Wordmark links and footer links have a minimum height of 36px. Wordmark links have no underline.

### Button
- **Shape:** square, 1px ink border, minimum height 44px, padding 0.6rem 1.5rem, weight 600.
- **Rest:** solid ink with paper text. The button is the one element that is inverted at rest.
- **Hover:** paper with ink text.
- **Disabled:** stays solid ink with paper text. The cursor shows progress and the label changes to "Sending…". It never turns gray.

### Ruled Index Row
- The whole row is the target. The link in the headline covers the row.
- **Hover / Focus:** the row inverts to paper on ink. The dot inverts with it. The ink bar extends 0.5rem past the text on each side, so the text keeps the page edge. On focus the 2px ring goes around the whole row.
- The dot is centered on the first line of the headline, also when the headline wraps.

### Reply Coupon
- **Frame:** 1.5px dashed ink, padding `clamp(1.25rem, 4vw, 3rem)`. This is the only dashed line of the site.
- **Text fields:** no box. A fine-print label above, a 1px ink underline below, padding 0.4rem.
- **Textarea:** no box. Ruled lines, one 1px ink line under every 1.75rem line of text. It grows with the content from six lines and cannot be resized by hand.
- **Fields are 1.75rem apart.** The solid button closes the form.
- **Notice:** success and error use the same form, a 1px ink box with padding 0.6rem 0.9rem. The words carry the meaning, not a color.

### Running Head
The wordmark stands at the left: the two words "Eugenius" and "Works", weight 600, 1rem, with a 0.3em gap and no separator. Each word is a link to its homepage section. A folio in fine print can stand at the right on the same baseline, for example `Nº 004 / 011` on a work.

### Section Head
On the homepage, a flush-left display headline with one line of fine print at the right on the same baseline. The pair wraps on narrow screens.

### Pager
Fine print under a work: previous work at the left, "All works" in the center, next work at the right. Each work link shows its status dot at 1rem and an underlined label. Below 40rem the three links stack. A post has one link, "All posts".

### Fine-Print Footer
A hairline, then two rows of fine-print links (the site, then legal and social), then the copyright line. Links have a minimum height of 36px and wrap with a 1.25rem gap.

### Skip Link
Ink background, paper text, fine print. It is off screen until it gets focus, then stands at the top left.

### Code and Quotes (post bodies)
Inline code and code blocks use the monospace stack. A code block has a 1px ink border, 1rem padding and horizontal scroll, and no colors. A horizontal rule is a 1px ink line. Lists use discs and decimals.

### Social Card
`scripts/og/og.html` draws the 1200 × 630 card with the same parts: a 1px keyline 40px inside the edge, the dot row with the same factors, the centered headline at 64px, and the signature at the bottom right.

## Do's and Don'ts

### Do:
- **Do** use only `colors.ink` and `colors.paper`. Show a state through inversion, a line or a word.
- **Do** build each new feature surface as an ad: keyline, picture field, centered headline with a period, flush-left copy columns, signature at the bottom right.
- **Do** show the status of a work as a dot with the recorded factors (1, 0.6, 0.32, 0.14, and the 2px ring for paused), and write the status in text next to it.
- **Do** make hover an immediate swap of ink and paper. Give keyboard focus the 2px ink outline with 3px offset.
- **Do** keep the disabled button solid ink. Tell the visitor about the state with the label and the cursor.
- **Do** keep all motion inside `prefers-reduced-motion: no-preference`.
- **Do** set long text in the 36rem column at line-height 1.6.
- **Do** let a cover image replace the picture field, and move the status dot into the signature.

### Don't:
- **Don't** add gray, opacity, a tint, a gradient or a shadow. An element is ink or paper.
- **Don't** add a second typeface to the interface. The monospace stack is for code in post bodies only.
- **Don't** round a corner. The dot is the only circle, and a circle means a work.
- **Don't** use the dashed line outside the reply coupon.
- **Don't** add motion to hover, to scroll or to page entry. The dot travel is the one motion.
- **Don't** scale a snapshot of the dot in a transition. The transition group draws the circle.
- **Don't** color code. Syntax highlighting stays off.
- **Don't** let the hero dots wrap at 360px or more. Calculate the row divisor again when the works change.
