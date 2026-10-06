---
target: the whole site, homepage first
total_score: 26
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 3
target_identity: "file:/Users/eugenpanov/Code/eugenius-works-website/src/pages/index.astro"
target_fingerprint: "sha256:91b2f1fbd24af6bad51e188f91e775f7ad698f45b4e412c4d9bbfcf16551ea86"
target_path: /Users/eugenpanov/Code/eugenius-works-website/src/pages/index.astro
timestamp: 2026-10-06T11-23-18Z
slug: src-pages-index-astro
---
Method: dual-agent (A: critique-a · B: critique-b)

# Critique: eugenius-works.com, the Long-Copy Ad build

## Design health score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Form states are good; "sending" is only announced through the button text |
| 2 | Match with the real world | 3 | The ad anatomy is familiar; status words are plain |
| 3 | User control and freedom | 3 | Back and forward work, and the dot travels both ways |
| 4 | Consistency and standards | 3 | The "idea" dot is reused as decoration on the empty blog and the 404 page |
| 5 | Error prevention | 3 | Input limits and validation are in place |
| 6 | Recognition, not recall | 2 | Hero dots have no names on touch; the dot legend exists only on the homepage; the wordmark does not look like navigation |
| 7 | Flexibility and efficiency | 3 | Whole-row targets, full keyboard path |
| 8 | Aesthetic and minimalist design | 3 | One ink, one typeface; the empty field is too tall on phones |
| 9 | Error recovery | 3 | Without JavaScript, a failed send clears the typed message |
| 10 | Help and documentation | n/a | A portfolio surface |
| **Total** | | **26/36** | **Good** |

## Design specificity verdict

LLM assessment: specific. The dot shows status by size, the problem is the headline, the name is the signature, and the row of dots ends in the idea speck like a full stop. An unrelated product could not use it unchanged.

Deterministic scan: 43 findings on 8 pages, three rule families, all judged false positives or accepted: 25 cramped-padding (ruled index and keyline frame, by design), 10 tight-leading (the browser measures 1.02 to 1.15 on display headlines, never the reported 0.97), 8 repeating-stripes-gradient (the ruled lines of the message field).

Visual overlays: none. The site's Content-Security-Policy blocked the injected detector script. Fallback: manual measurement.

Measured in a real browser: no horizontal overflow at desktop width and at 390px; only rgb(0,0,0) and rgb(255,255,255) in computed colors; no text below 14px; no console errors and no CSP violations; every keyboard stop has a visible focus indicator; the three form states behave as specified; all security headers present.

## Overall impression

The first viewport is the peak: eleven dots, one sentence, one signature. The index puts the problem first. The biggest opportunity is the visitor who does not start on the homepage: a work page opened from a link says nothing about who made it.

## What is working

1. The headline-first index.
2. The dot as the only picture, plus one motion.
3. The contact form: works without JavaScript, keeps values and moves focus with JavaScript.

## Priority issues

- [P1] A work page opened from a link has no author and no context. `/works/<slug>/` shows the work's name and status only. Fix: a fine-print line in the signature: "Nº 007 of eleven works by Eugen Panov", linked to the homepage. Command: /impeccable clarify
- [P1] On phones, the hero dots are too small to tap. At 390px: seven dots 23px, one 12px, one 5px (WCAG 2.5.8 needs 24px); no names on touch. Fix: an invisible tap area of at least 24px per dot without overlap; the footer links "X" (8px wide) and "RSS" (23px) too. Command: /impeccable adapt
- [P1] The blog is a dead end. Footer "Blog" and "RSS" lead to an empty page and an empty feed. Fix: hide both links until the first post exists; keep the page. Command: /impeccable distill
- [P2] "Send a note" on a work page loses the work. Fix: carry the work in the link (`/?re=<slug>#contact`) and prefill the message with "About <Title>: ". Command: /impeccable harden
- [P2] On phones the white field above the dots is too tall (about 230px on the homepage, about 250px on work pages). Fix: a shorter field below 40rem. Command: /impeccable adapt

## Persona red flags

- A developer on a phone from an X link to one work: no author, no link to the product, the transition never runs for them, "Send a note" forgets the work.
- A designer who knows 1960s ads: three axes in each ad; on the homepage the dots start at x=219 and the copy at x=272; the copy is two or three sentences, so on idea pages the white field is the largest element.
- A first-time visitor: the wordmark does not look like navigation; the blog is reachable only from the footer.
- A skeptical reader: two works are "live" with no link, so "live" cannot be checked.

## Minor observations

- The 404 page and the empty blog reuse the work-dot transition name.
- "11 works" and "Eleven works" stand one screen apart.
- On phones the legend line leaves "finished." alone.
- The hero dots should start on the same left axis as the copy.
- The mobile pager stacks three links with three alignments.
- Decide before the first color image: is the dot the picture or only the status?

## Questions to consider

- Should the about text promise writing before the first post exists?
- When color images arrive, does the dot stay?
