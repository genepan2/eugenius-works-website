# AGENTS.md

Eugenius Works, a personal site: static Astro 7 with Tailwind v4, served by a Cloudflare Worker that also runs the contact form at `/api/contact` (`src/worker.ts`, configured by `wrangler.jsonc`). `README.md` covers setup, content frontmatter and the environment variables.

## Commands

- `npm run build` writes `dist/`. Run it before `npm test`: `tests/site/` checks the built HTML, so a stale `dist/` tests old code.
- `npm test` runs `tests/unit/` with a coverage floor, then `tests/site/`. With `npm run lint` and `npm run typecheck` it is the gate for every change. Node strips TypeScript types without checking them; only `npm run typecheck` catches a type error.
- One test file per module: `tests/unit/<module>.test.ts`. Name each `test()` after the behavior it shows, as a sentence. A test that needs `dist/` goes in `tests/site/`.
- `npm run docs` regenerates `docs/api.md` from `docs/openapi.json`. `npm test` fails while the two differ.
- `npm run test:e2e` sends a real email through the live site and counts against its rate limit of 5 per 10 minutes. Run it only when the owner asks.
- `npm run deploy` publishes to production. Run it only on the owner's word. A push to `main` deploys too, through `.github/workflows/ci.yml`, once the Cloudflare secrets are set; so push only on the owner's word.
- CI runs the same checks as the commands above. The pre-commit hook (`lefthook.yml`) checks staged files only.
- `docs/runbook.md` covers the logs, the health check at `/api/health`, and rollback.

## Design

`DESIGN.md` is the design system and is binding: black and white only, one typeface, square corners, no motion. `tests/site/site.test.ts` enforces part of it on the build output. Show the owner a visual change as a rendered image and build it after he approves it. `PRODUCT.md` holds the voice and audience.

Tailwind scans every source file, comments included, for class names. A comment holding a utility class word (for example the word for a rounded corner) puts that rule into the CSS and fails the site test. `src/reading-time.ts` shows the case.

The content security policy in `public/_headers` allows only same-origin scripts and styles. Put scripts in files and styling in `src/styles/global.css`.

## Contact API

`docs/openapi.json` is the contract of `src/worker.ts`, and `tests/unit/openapi.test.ts` drives the Worker against it. A change to the Worker's behavior updates the spec, then `npm run docs`. Log through `src/log.ts`, never `console` directly: it drops what a visitor typed. Put a risky Worker change behind a flag in `src/flags.ts`, default off until the owner turns it on. The skill `contact-api-change` has the steps.

## Records

- `ROADMAP.md` tracks open and done work. Update the entry you worked on, with the date.
- Seeded content carries `<!-- PLACEHOLDER -->`. Replace it only with text from the owner.
- `src/consts.ts` holds `CLOUDFLARE_ANALYTICS_TOKEN`, still a placeholder.
- Commit messages are conventional and plain: `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`.

`tests/unit/agents-md.test.ts` checks that every path and `npm run` command named in this file exists.
