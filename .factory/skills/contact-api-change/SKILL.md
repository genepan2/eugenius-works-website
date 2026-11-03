---
name: contact-api-change
description: Steps for changing the contact endpoint. Use when editing src/worker.ts, the contact form's fields, limits, status codes or redirects, or docs/openapi.json.
---

`docs/openapi.json` is the contract of `/api/contact`. `tests/unit/openapi.test.ts` drives `src/worker.ts` against it, and `docs/api.md` is generated from it. A Worker change is done when all three agree and `npm test` passes.

1. Change `src/worker.ts`. Keep the order of the checks (origin, body size, body parsing, honeypot, fields, configuration, rate limit, delivery): the spec states it, and the rate limit counts only valid messages.
2. Update `docs/openapi.json` to the new behavior: field rules, statuses, headers, redirect targets. Done when every status the Worker can return is listed and every listed status is reachable.
3. Add the behavior to `tests/unit/contact.test.ts` when it is not a field rule or a status. `tests/unit/openapi.test.ts` already reads the field rules and statuses from the spec.
4. Run `npm run docs`, then `npm run build && npm test`. Done when both tests named above pass and the docs check is quiet.
5. If the form changed, update `src/pages/contact.astro`: its client script and its no-JavaScript notices `#contact-sent`, `#contact-failed` and `#contact-busy`.

`npm run test:e2e` sends a real email through the live site. It tests the deployed Worker, not your local change, so leave it for after a deploy the owner asked for.
