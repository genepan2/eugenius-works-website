# Readiness-Fix: Die restlichen Punkte

_2026-11-06_

## Automatischer Rollback (`.github/workflows/ci.yml`)

**Was:** Nach jedem Deploy prüft die CI `/api/health`. Antwortet die Seite nicht, setzt ein neuer Schritt den Worker sofort auf die Version davor zurück (`wrangler rollback`). Der Lauf wird rot, und in seiner Zusammenfassung steht „Rolled back“.

**Warum:** Bisher hat die CI einen kaputten Deploy nur gemeldet. Die Seite blieb kaputt, bis jemand von Hand zurückrollte. Jetzt dauert ein Ausfall nach einem Deploy nur noch Sekunden.

**Grenzen:** Der Rollback greift nur, wenn der Health-Check direkt nach dem Deploy fehlschlägt. Einen Fehler, den `/api/health` nicht sieht, zum Beispiel eine kaputte Unterseite, fängt er nicht ab. Danach muss der fehlerhafte Commit trotzdem per `git revert` raus, sonst bringt ihn der nächste Deploy zurück. `docs/runbook.md` beschreibt beides.

## Ungenutzte Feature-Flags (`tests/unit/flags.test.ts`)

**Was:** Ein Test geht alle Flags in `src/flags.ts` durch. Jedes Flag muss irgendwo in `src/` mit `enabled('…')` abgefragt werden, und seine Variable (zum Beispiel `FLAG_METRICS`) muss in `docs/runbook.md` stehen. Sonst schlägt `npm test` fehl, mit dem Namen des Flags.

**Warum:** Ein Flag, das niemand mehr abfragt, ist ein toter Schalter: Wer ihn im Dashboard umlegt, erwartet eine Wirkung, die es nicht gibt. Ein Flag ohne Eintrag im Runbook findet im Ernstfall niemand. Geprüft: Mit einem erfundenen, ungenutzten Flag schlägt der Test fehl.

## Testdauer (`scripts/test-report.ts`)

**Was:** Nach `npm test` liest ein Skript die JUnit-Berichte in `test-results/` und schreibt in die Zusammenfassung jedes CI-Laufs: wie viele Tests, wie lange insgesamt und welche fünf am langsamsten waren. Braucht ein einzelner Test länger als 2 Sekunden, wird der Lauf rot. Lokal: `node scripts/test-report.ts` nach `npm test`.

**Warum:** Langsame Tests schleichen sich ein, einer nach dem anderen, bis die Rückmeldung für einen Agenten Minuten statt Sekunden dauert. So sieht man jede Änderung der Dauer im Lauf, in dem sie passiert. Heute: 59 Tests in etwa 2 Sekunden, der langsamste braucht 0,6 Sekunden (er wartet absichtlich auf eine Wiederholung).
