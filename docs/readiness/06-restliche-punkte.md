# Readiness-Fix: Die restlichen Punkte

_2026-11-06_

## Automatischer Rollback (`.github/workflows/ci.yml`)

**Was:** Nach jedem Deploy prüft die CI `/api/health`. Antwortet die Seite nicht, setzt ein neuer Schritt den Worker sofort auf die Version davor zurück (`wrangler rollback`). Der Lauf wird rot, und in seiner Zusammenfassung steht „Rolled back“.

**Warum:** Bisher hat die CI einen kaputten Deploy nur gemeldet. Die Seite blieb kaputt, bis jemand von Hand zurückrollte. Jetzt dauert ein Ausfall nach einem Deploy nur noch Sekunden.

**Grenzen:** Der Rollback greift nur, wenn der Health-Check direkt nach dem Deploy fehlschlägt. Einen Fehler, den `/api/health` nicht sieht, zum Beispiel eine kaputte Unterseite, fängt er nicht ab. Danach muss der fehlerhafte Commit trotzdem per `git revert` raus, sonst bringt ihn der nächste Deploy zurück. `docs/runbook.md` beschreibt beides.
