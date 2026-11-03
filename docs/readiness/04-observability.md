# Readiness-Fix: Observability und Betrieb

_2026-11-03_

## Der gemeinsame Grund

Bisher war der Worker eine Blackbox. Wenn das Kontaktformular nicht ging, gab es eine einzige Logzeile wie `contact: resend returned 500`. Man konnte nicht sagen, welcher Besucher betroffen war, wie oft es passierte und ob ein Deploy schuld war. Ein Agent, der einen Fehler beheben soll, braucht genau diese Informationen.

## Strukturierte Logs (`src/log.ts`)

**Was:** Jede Logzeile ist jetzt ein JSON-Objekt mit `level` und `event`, zum Beispiel `{"level":"error","event":"resend.failed","status":422,...}`.

**Warum:** In den Cloudflare-Logs kann man jetzt nach Feldern filtern und zählen, etwa „alle `resend.failed` der letzten Stunde“. Freitext lässt sich nur durchsuchen.

## Log-Scrubbing (`scrub()` in `src/log.ts`)

**Was:** Jedes Feld läuft durch `scrub()`. Name, E-Mail, Nachricht und IP werden zu `[redacted]`, und jede E-Mail-Adresse in einem anderen Feld wird zu `[email]`. Ein Test sendet eine Nachricht und prüft, dass nichts davon in einer Logzeile landet.

**Warum:** Laut deiner Datenschutzerklärung speichert die Seite keine Kontaktdaten. Vorher hielt das nur, solange niemand eine falsche Logzeile schrieb. Jetzt hält es durch den Code: Auch wenn ein Agent später `log(..., { email })` schreibt, kommt keine Adresse ins Log.

## Request-ID (`X-Request-Id`)

**Was:** Jede Antwort unter `/api/` trägt den Header `X-Request-Id`, gefüllt mit Cloudflares Ray-ID, und dieselbe ID steht in jeder Logzeile dieser Anfrage.

**Warum:** Meldet ein Besucher „das Formular ging nicht“, findet man mit der ID genau seine Logzeilen. Das Bug-Formular fragt deshalb nach ihr.

## Health-Check (`/api/health`)

**Was:** `GET /api/health` antwortet mit 200, wenn das Formular senden kann, und mit 503, wenn eine Einstellung fehlt oder das Formular pausiert ist. Es ruft Resend nicht an und sagt nicht, welche Einstellung fehlt.

**Warum:** So lässt sich von außen prüfen, ob die Seite funktioniert, ohne eine E-Mail zu verschicken. Der Health-Workflow und der Deploy nutzen diesen Endpunkt.

## Timeout, Retry und Circuit Breaker (`src/resend.ts`)

**Was:**
- Ein Aufruf an Resend bricht nach 8 Sekunden ab.
- Bei einem Netzwerkfehler, 429 oder 5xx wird einmal wiederholt. Ein Idempotency-Key sorgt dafür, dass Resend die E-Mail trotzdem höchstens einmal verschickt.
- Nach 5 Fehlschlägen in Folge ruft der Worker Resend 60 Sekunden lang gar nicht mehr an und antwortet sofort mit 502. Das ist der „Circuit Breaker“, die Sicherung.

**Warum:** Ohne Timeout hätte ein hängendes Resend den Besucher endlos warten lassen. Ohne Retry wäre ein einzelner Netzwerkaussetzer eine verlorene Nachricht gewesen. Und ohne die Sicherung würde der Worker bei einem Resend-Ausfall jede Anfrage weiter gegen die Wand schicken.

## Metriken (Analytics Engine, `src/metrics.ts`)

**Was:** Jede Anfrage an `/api/` schreibt einen Datenpunkt in das Cloudflare-Dataset `eugenius_works_api`: Pfad, Methode, Status, Ergebnis (`sent`, `invalid`, `rate_limited` …) und Millisekunden. Personendaten sind nicht dabei. Das Runbook enthält eine SQL-Abfrage, mit der man nach einem Deploy prüft, ob die Fehlerrate gestiegen ist.

**Warum:** Logs beantworten „was ist bei dieser Anfrage passiert“, Metriken beantworten „wie oft“ und „seit wann“. Unbekannte Pfade landen alle unter einem Schlüssel, damit ein Scanner das Dataset nicht mit Müll füllen kann.

## Feature-Flags (`src/flags.ts`)

**Was:** Flags sind Worker-Variablen mit dem Wert `on` oder `off`. Der Standardwert steht im Code. `FLAG_CONTACT_FORM=off` pausiert das Formular, `FLAG_METRICS=off` stoppt die Metriken. Ein Wechsel im Cloudflare-Dashboard wirkt ohne Deploy.

**Warum:** Wird das Formular von einem Bot missbraucht, schaltest du es in Sekunden ab, statt einen Code-Fix zu deployen. `AGENTS.md` verlangt außerdem, dass ein Agent eine riskante Worker-Änderung hinter ein Flag legt, das erst aus ist, bis du es einschaltest.

## Runbook (`docs/runbook.md`)

**Was:** Das Runbook beschreibt, wo Logs, Health-Check und Metriken zu finden sind, was jedes Log-Event bedeutet, was bei jedem Resend-Status zu tun ist und wie man einen Deploy zurückrollt.

**Warum:** Im Störfall will man nicht erst den Code lesen. Ein Agent, der einen Incident bearbeiten soll, findet dort den ersten Schritt.

## Alarmierung

**Was:** Der Workflow `.github/workflows/health.yml` prüft alle 30 Minuten `/api/health` und die Startseite. Schlägt die Prüfung fehl, öffnet er ein Issue mit dem Label `incident` oder kommentiert das schon offene. Der nächste erfolgreiche Lauf schließt es wieder.

**Warum:** Bisher hättest du einen Ausfall erst bemerkt, wenn ein Besucher dir schreibt. Jetzt meldet sich die Seite selbst, und das Issue verbindet den Fehler direkt mit dem Runbook.

**Noch offen (deine Aufgabe):** Für einen Alarm bei Fehler-Logs braucht es eine Einstellung im Cloudflare-Dashboard. Wrangler ist auf diesem Rechner nicht angemeldet, deshalb steht das als Aufgabe in `ROADMAP.md`.

## Bewusst nicht gemacht: Sentry

Du hast „nur Cloudflare-Logs“ gewählt. Die Kriterien „Error Tracking“ und „Error to Insight“ fragen gezielt nach Sentry oder einem ähnlichen Dienst. Das Health-Issue übernimmt einen Teil davon, die Kriterien selbst bleiben aber vermutlich rot. Ein weiterer Dienst würde für einen Worker mit einem einzigen Endpunkt mehr kosten als er bringt.
