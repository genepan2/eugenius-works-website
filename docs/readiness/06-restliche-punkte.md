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

## Dauer jeder Anfrage (`src/worker.ts`, `src/metrics.ts`)

**Was:** Der Worker misst bei jeder `/api/`-Anfrage zwei Zeiten: die ganze Anfrage und, wenn eine E-Mail rausging, die Wartezeit auf Resend. Beide stehen im Log (`ms`, `resendMs`), in den Metriken (`double1`, `double3`) und im Header `Server-Timing` jeder Antwort. Den zeigt der Browser unter Entwicklertools → Network → Timing. `docs/runbook.md` hat eine SQL-Abfrage für die langsamsten 5 % der Anfragen.

**Warum:** Ist das Formular langsam, ist die erste Frage: liegt es am Worker oder an Resend? Bisher gab es nur die Gesamtzeit. Echtes Profiling (CPU-Profile) gibt es auf Cloudflare Workers nur lokal mit `wrangler dev`. Für einen Worker, der fast nur auf Resend wartet, sagt die Aufteilung mehr.

**Hinweis:** Auf Workers bleibt die Uhr während reiner Rechenarbeit stehen und läuft nur über Netzwerkzugriffe weiter. Die Zahlen zeigen also Wartezeit, nicht CPU-Zeit. Die CPU-Zeit steht im Cloudflare-Dashboard unter Metrics.

## Unzuverlässige Tests (`.github/workflows/flaky.yml`)

**Was:** Jede Nacht um 02:41 UTC baut ein Lauf `develop` und lässt alle Tests dreimal hintereinander auf demselben Stand laufen. Danach vergleicht `scripts/test-report.ts --flaky` die drei JUnit-Berichte. Hat ein Test einmal bestanden und ein anderes Mal nicht, legt der Lauf ein Issue mit dem Label `flaky` an, oder er kommentiert das offene. Die nächste saubere Nacht schließt es.

**Warum:** Ein Test, der mal grün und mal rot ist, kostet Vertrauen. Ein Agent kann dann nicht mehr unterscheiden, ob er etwas kaputt gemacht hat oder ob der Test nur wackelt. Geprüft: Mit einem künstlich veränderten Bericht meldet das Skript den betroffenen Test und endet mit einem Fehler. Bei drei echten Läufen meldet es nichts.

## Vom Fehler zum Issue (`.github/workflows/errors.yml`)

**Was:** Einmal am Tag um 06:07 UTC fragt ein Lauf bei Analytics Engine nach, wie viele `/api/`-Anfragen in den letzten 24 Stunden mit einem 5xx-Fehler geendet haben, aufgeteilt nach Pfad, Status und Ursache (`resend_failed`, `unavailable`, …). Gab es welche, legt er ein Issue mit dem Label `errors` und einer Tabelle an, oder er kommentiert das offene. Ein Tag ohne Fehler schließt es. Kann er Cloudflare nicht erreichen, wird nur der Lauf rot, ohne Issue.

**Warum:** Der Health-Check sieht nur, ob die Seite gerade antwortet. Fehler zwischen zwei Checks, zum Beispiel ein Resend-Ausfall von zehn Minuten, sah bisher niemand. Jetzt wird aus jedem Fehler eine Aufgabe, die ein Agent finden und mit dem Runbook bearbeiten kann. Ein Dienst wie Sentry ist dafür nicht nötig. Die Daten liegen schon in den Metriken.

**Bis das Token da ist:** Der Lauf überspringt sich selbst, bis das Repo-Secret `CLOUDFLARE_ANALYTICS_TOKEN` gesetzt ist. Das ist ein Cloudflare-API-Token, das nur „Account Analytics: Read“ darf.

## Schrittweise Auslieferung (`.github/workflows/ci.yml`, Job „Deploy“)

**Was:** Ein Merge nach `main` schaltet die neue Version nicht mehr auf einmal live. Der Lauf macht vier Schritte:

1. Er lädt die neue Version hoch, ohne ihr Verkehr zu geben (0 %).
2. Er prüft `/api/health`, die Startseite und `/contact/` gezielt auf der neuen Version. Das geht mit dem Header `Cloudflare-Workers-Version-Overrides`.
3. Die neue Version bekommt 10 % des Verkehrs. Eine Minute lang prüft der Lauf alle zehn Sekunden `/api/health`.
4. Erst dann bekommt sie 100 %, und der Lauf prüft ein letztes Mal.

Schlägt eine Prüfung fehl, setzt der Lauf die alte Version wieder auf 100 %. Das ersetzt das `wrangler rollback` aus dem ersten Punkt, weil der Lauf jetzt die alte Version kennt und nicht raten muss.

**Warum:** Ein Fehler trifft so zuerst niemanden (0 %) und danach höchstens jeden zehnten Besucher, eine Minute lang. Bei einem kleinen Auftritt ist das mehr Absicherung als echte Messung, kostet aber nur gut eine Minute pro Auslieferung.

**Noch nicht live geprüft:** Der Ablauf läuft erst beim nächsten Merge nach `main` zum ersten Mal echt. Dann im Lauf nachsehen, ob die drei Versionsschritte durchgehen.

## Besucherstatistik (Cloudflare Web Analytics)

**Was:** Der Code ist schon fertig. Sobald in `src/consts.ts` ein echtes Token in `CLOUDFLARE_ANALYTICS_TOKEN` steht, bindet jede Seite das Skript von Cloudflare ein. Die Sicherheitsregeln in `public/_headers` erlauben es schon, und die Datenschutzseite beschreibt es schon. Solange der Platzhalter dort steht, wird nichts eingebunden und nichts gezählt.

**Warum noch offen:** Das Token gibt es nur im Cloudflare-Dashboard (Analytics & Logs → Web Analytics → Site hinzufügen → `eugenius-works.com`). Es ist kein Geheimnis, es steht später in jeder Seite. Wenn es da ist, trägt ein Agent es ein, baut die Seite und prüft, dass das Skript in `dist/` auftaucht.

**Nachtrag 2026-11-06:** Das Token steht jetzt in `src/consts.ts`. Es kam erst, als im Dashboard „Enable with JS Snippet installation“ gewählt war. Die Einstellung „Enable, excluding visitor data in the EU“ zeigt kein Token. Geprüft: Nach dem Build enthalten `dist/index.html` und `dist/contact/index.html` das Skript mit dem Token, und alle Tests laufen durch.

## Automatischer Code-Review (`.github/workflows/claude-review.yml`)

**Was:** Claude prüft jeden Pull Request, wenn er geöffnet wird und nach jedem neuen Push. Er liest zuerst `AGENTS.md` und `DESIGN.md` und meldet nur Fehler, Sicherheitsprobleme und Verstöße gegen diese Regeln. Die Funde stehen als Kommentare direkt an den Zeilen, dazu eine kurze Zusammenfassung. Der Review blockiert nichts: Er ist ein Rat, keine Pflichtprüfung. PRs von Bots (Dependabot, release-please) prüft er nicht.

**Warum:** Ein zweiter Blick auf jede Änderung fängt Fehler, bevor sie nach `main` gehen. Das gilt besonders, wenn ein Agent die Änderung geschrieben hat. CodeRabbit war installiert, hat aber alle PRs übersprungen.

**Was dafür nötig ist:** die Claude GitHub App auf dem Repo und ein Repo-Secret, entweder `CLAUDE_CODE_OAUTH_TOKEN` (Claude-Abo) oder `ANTHROPIC_API_KEY`. Ohne Secret überspringt sich der Lauf selbst.
