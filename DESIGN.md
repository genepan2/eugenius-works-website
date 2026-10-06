---
name: Eugenius Works
description: Two words. One ink, one typeface, one left axis. One display word per page section, and everything else is normal text.
colors:
  ink: "#000"
  paper: "#fff"
typography:
  display:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "clamp(2.75rem, 11vw, 6rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "clamp(2.25rem, 4.6vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
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
  body-strong:
    fontFamily: "Jost Variable, Jost Fallback, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 600
    lineHeight: 1.5
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
spacing:
  page-gutter: "clamp(1rem, 4vw, 3rem)"
  word-above: "clamp(3rem, 6vw, 5rem)"
  word-below: "clamp(1.25rem, 2.5vw, 2rem)"
  row-padding: "1.25rem"
  footer-above: "clamp(4rem, 8vw, 7rem)"
components:
  link:
    textColor: "{colors.ink}"
  link-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
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
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.65rem"
  notice:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.6rem 0.9rem"
  work-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "1.25rem 0"
  skip-link:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    padding: "0.5rem 0.75rem"
---

# Design System: Eugenius Works

## Overview

**Creative North Star: "Two words"**

The company name is the structure of the site. "Eugenius" is the person and "Works" is the work. The landing page holds these two sections and nothing else. Each section starts with its word, set large at the left edge. Everything below the word is normal text.

The system is plain and has only text. It has one ink, one typeface and one left axis. Lists are rows between hairlines. Status is a word. Forms are plain boxes. There is no symbol, no frame, no picture stand-in and no motion. Interface color stays out, because the images that come later are in color and must stand alone.

The owner selected this structure from a rendered mockup (`.impeccable/mocks/plain/c-desktop.png`) after he rejected an earlier version with status dots. A visual change is shown to the owner as a rendered image and approved before it is built.

**Key Characteristics:**
- One ink on one paper. No third value.
- One typeface, Jost, in two weights: 400 and 600.
- One display word for each landing section or page. No other large element.
- One left axis. Nothing is centered.
- Hairlines of 1px rule the rows. Corners are square.
- Status is a word.
- No motion.

## Colors

The palette is two values: pure black ink on pure white paper.

### Primary
- **Ink** (`colors.ink`): all text, all hairlines, the field borders, the solid button, the hover background of a link, the text selection, the caret and the form accent color. The favicon is a plain ink square.

### Neutral
- **Paper** (`colors.paper`): the page, the field background, and the text color on every inverted surface. The browser theme color is also paper.

### Named Rules
**The One Ink Rule.** The interface has two values and no value between them. Gray, tint, opacity and gradient are not available. The default Tailwind palette is removed (`--color-*: initial`). A test fails the build output when it finds a color other than black or white.

**The Color Is For Pictures Rule.** Color enters the site only through images: a work `cover`, a post `cover`, an image in a post body. The interface around them stays ink and paper.

**The No-Highlight Rule.** Code blocks have no syntax colors. Syntax highlighting is off in the build configuration.

## Typography

**Display Font:** Jost Variable (self-hosted through `@fontsource-variable/jost`, latin file preloaded), with "Jost Fallback"
**Body Font:** Jost Variable, the same family
**Label/Mono Font:** Jost for labels. Code in post bodies uses the system monospace stack (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`) at 0.85em. This is the only other family.

**Character:** One geometric sans in the Futura line does all the work. The display word is demi-bold and tight. All other text is regular weight at 19px.

"Jost Fallback" is local Arial or Helvetica with adjusted metrics (`size-adjust: 96%`, `ascent-override: 111%`, `descent-override: 39%`, `line-gap-override: 0%`). The font swap does not move the layout.

### Hierarchy
- **Display** (600, `clamp(2.75rem, 11vw, 6rem)`, line-height 1, tracking -0.035em): the display word. "Eugenius" and "Works" on the landing page. On other pages it is the page word: "Works", the title of a work, "Blog", "Contact", "Imprint", "Privacy", "Not found". It has no period. Long words can break.
- **Headline** (600, `clamp(2.25rem, 4.6vw, 4rem)`, line-height 1.05, tracking -0.025em, max 22ch, balanced): the title of a blog post. It replaces the display word on a post page.
- **Title** (600, 1.75rem, line-height 1.2, tracking -0.01em): subheads of the legal pages. A post body `h2` is `clamp(1.625rem, 2.5vw, 2.125rem)` and an `h3` is 1.25rem, both 600 at line-height 1.15.
- **Body** (400, 1.1875rem, line-height 1.5): the about text, the work descriptions, form input. `text-wrap: pretty`, manual hyphens.
- **Body, reading** (400, 1.1875rem, line-height 1.6): post bodies, work pages and legal pages in the 36rem column.
- **Body, strong** (600, 1.1875rem): the name of a work in the table and the title of a post in the list. Same size as body.
- **Quote** (400, 1.375rem, line-height 1.4): block quotes in a post, behind a 1px ink rule at the left with 1.5rem padding.
- **Wordmark** (600, 1rem): the two words "Eugenius" and "Works" in the running head.
- **Label** (400, 0.875rem, line-height 1.4, tabular numerals): fine print. The status word, dates, form labels, work meta, pager, footer.

### Named Rules
**The One Word Rule.** Each landing section and each page has exactly one large element: its display word, or the post title on a post page. No second large line, no headline sentence, no subtitle in a display size.

**The Status Is A Word Rule.** The status of a work is the plain word in fine print under its name: live, in progress, prototype, paused, idea. No symbol, size or shape carries status.

## Layout

The page is one column, 76rem wide at most, with a gutter of `clamp(1rem, 4vw, 3rem)`. All content starts at the same left edge: the running head, the display word, the text, the table, the form, the footer. Nothing is centered or right-aligned, except the "next" link of the pager.

**Vertical rhythm.** The display word has `clamp(3rem, 6vw, 5rem)` above it and `clamp(1.25rem, 2.5vw, 2rem)` below it. The first word of a page has `clamp(1.5rem, 3vw, 2.5rem)` above it. The footer stands `clamp(4rem, 8vw, 7rem)` below the content.

**The landing page.** Two sections only: "Eugenius" with the three about paragraphs in the reading column, then "Works" with the works table. The page has a visually hidden `h1` "Eugenius Works", and the two words are `h2`.

**The reading column.** 36rem wide at most, flush left. Blocks are 1em apart. Sections of the legal pages are 3rem apart. Long URLs wrap at any width. The contact form, its notices and its intro text use the same 36rem width.

**The works table.** Full page width. Left column 16rem with 2rem padding at the right: name and status word. Right column: the full description, 44rem wide at most. At 40rem and below, each row stacks: name, status, then description.

**Images.** A work `cover` stands in the reading column above the description. A post `cover` stands under the post head at 36rem. Images in a post body are limited to the column width.

**Breakpoints:** 40rem (table rows stack, pager stacks) and `pointer: coarse` (small link targets grow from 36px to 44px).

**Print.** The print style removes the navigation, the contact form, the footer links and the pager, and prints external link addresses after the link text.

## Elevation & Depth

The system is flat. There are no shadows, no blur, no layers and no tonal steps. A state change swaps ink and paper. It never lifts an element.

### Named Rules
**The Flat Paper Rule.** Nothing stands above the paper. Separation comes from a hairline or from white space, not from depth.

## Shapes

All corners are square (radius 0). The system has no circle and no rounded form. Two tests enforce this on the build output: no `border-radius` other than 0, and no `<circle>` element.

Two line types exist:
- **1px solid ink:** the hairlines of the table and the post list, the pager rule, the footer rule, the field borders, the notice border, the code block border, the quote rule, the link underline.
- **2px solid ink:** the focus outline, with a 3px offset.

Hairlines divide rows. They do not enclose content. Only form fields, notices and code blocks have a box.

### Named Rules
**The Square Rule.** No rounded corner and no circle, in CSS or in SVG. The tests fail the build when one appears.

**The No Inline Style Rule.** The built HTML has no `style` attribute. All styling is in the stylesheet. A test enforces this.

## Components

### Display Word
One word at the left edge in the display role. It is a heading (`h2` on the landing page, `h1` on other pages). It names the section or the page and does nothing else. It is not a link.

### Links
- **Rest:** ink text, 1px underline, 0.2em offset.
- **Hover:** ink background, paper text, at once. No transition.
- **Focus:** 2px ink outline, 3px offset.
- No separate pressed state is built.

### Running Head
The wordmark stands at the top left: the two words "Eugenius" and "Works", weight 600, 1rem, with a 0.3em gap and no separator. Each word is a link to its landing section. The links have no underline and a minimum height of 36px (44px on touch screens). Nothing else is in the head.

### Works Table
A real table with visually hidden column heads ("Work", "Description").
- A 1px ink hairline above the table and below each row. Cell padding 1.25rem above and below. Text aligns to the top.
- **Left cell:** the name of the work as a link, weight 600, no underline at rest. Under it the status word in fine print.
- **Right cell:** the full description in body text.
- **Hover:** only the name is a link. It inverts and gets an underline. The row itself has no hover state.

### Post List
A list in the same ruled form: a hairline above, a hairline under each item, 1.25rem padding. Each item is the post title (600, body size, underlined link) and the date in fine print. An empty blog shows the line "No posts yet." and the footer shows no blog link.

### Work Page
The display word is the title of the work, with the status word in fine print below it. Then the description and the optional body in the reading column. Then two lines of fine print: the links (Website, Repository, Send a note) and the number of the work. The pager closes the page.

### Pager
Fine print above a 1px hairline: previous work at the left, "All works" in the center, next work at the right. Plain underlined links, minimum height 36px. At 40rem and below the three links stack at the left edge. A post has one link, "All posts".

### Contact Form
The form is on `/contact/` only. It is 36rem wide, 2rem below the intro text.
- **Fields:** a fine-print label above each field. The field is a plain box: 1px ink border, paper background, padding 0.5rem 0.65rem, body type. Fields are 1.25rem apart.
- **Textarea:** the same box. It is at least six lines high, grows with the content and cannot be resized by hand.
- **Focus:** the 2px ink outline with 3px offset.
- **Notice:** success, failure and busy use the same form, a 1px ink box with padding 0.6rem 0.9rem. The words carry the meaning. After a successful send the notice replaces the form. The form works without JavaScript.

### Button
- **Shape:** square, 1px ink border, minimum height 44px, padding 0.6rem 1.5rem, weight 600.
- **Rest:** solid ink with paper text.
- **Hover:** paper with ink text.
- **Disabled:** stays solid ink with paper text. The cursor shows progress and the label changes to "Sending…". It never turns gray.

### Fine-Print Footer
A 1px hairline, then two rows of fine-print links (the site, then legal and social), then the copyright line. Links have a minimum height of 36px (44px on touch screens), 8px of side padding for the hit area, and wrap with a 1.25rem gap.

### Skip Link
Ink background, paper text, fine print. It is off screen until it gets focus, then stands at the top left.

### Code and Quotes (post bodies)
Inline code and code blocks use the monospace stack. A code block has a 1px ink border, 1rem padding and horizontal scroll, and no colors. A horizontal rule is a 1px ink line.

### Social Card
`scripts/og/og.html` draws the 1200 × 630 card: "Eugenius" and "Works" on two lines at 150px, weight 600, at the left, with the first sentence of the about text below at 34px.

## Do's and Don'ts

### Do:
- **Do** show a visual change to the owner as a rendered image, and build it only after he approves it.
- **Do** use only `colors.ink` and `colors.paper`. Show a state through inversion, a hairline or a word.
- **Do** start each page with one display word at the left edge, and set everything else as normal text.
- **Do** keep all content on the one left axis.
- **Do** write the status of a work as a word in fine print.
- **Do** rule lists with 1px ink hairlines and keep all corners square.
- **Do** give keyboard focus the 2px ink outline with 3px offset.
- **Do** set long text in the 36rem column.
- **Do** keep the disabled button solid ink, and tell the visitor about the state with the label and the cursor.

### Don't:
- **Don't** add gray, opacity, a tint, a gradient or a shadow. An element is ink or paper.
- **Don't** add a second typeface to the interface. The monospace stack is for code in post bodies only.
- **Don't** round a corner or draw a circle. The tests fail.
- **Don't** write a `style` attribute into the markup. The tests fail.
- **Don't** add a second large element to a section or a page.
- **Don't** center content.
- **Don't** add motion: no transition, no animation, no page transition.
- **Don't** color code. Syntax highlighting stays off.

### Rejected, do not reintroduce:
The owner saw these in an earlier build and rejected them on 2026-10-06 ("remove this whole dots thing, it must go. I want a plain structure").
- Status dots, or any symbol, size or shape that carries status.
- Circles of any kind.
- Frames around content (the keyline "ad" frame).
- A headline sentence above the about text.
- Picture stand-ins: a drawn device in the place of a real image.
- A dashed coupon around the contact form.
- Page transitions.
- A contact form, a blog list or any third section on the landing page.
