# Readiness-Fix: Dokumentation

_2026-11-02, Kategorie „Documentation“ aus `/readiness-fix`_

## Der gemeinsame Grund

Der Readiness-Bericht misst, wie gut ein KI-Agent in diesem Repo arbeiten kann, ohne zu raten. Die Kategorie „Documentation“ stellt zwei Fragen:

- **Findet der Agent das Wissen, das er braucht?**
- **Bleibt dieses Wissen wahr, wenn sich der Code ändert?**

Veraltete Dokumentation ist für einen Agenten schlimmer als keine, denn er glaubt ihr. Deshalb fügt jeder der fünf Punkte entweder Wissen hinzu oder einen Test, der es aktuell hält. Meistens beides.

## 1. AGENTS.md

**Was:** `AGENTS.md` ist eine Datei, die jeder Agent (Droid, Claude Code, Codex, Cursor) beim Start automatisch liest.

**Warum:** Das README richtet sich an Menschen. Es erklärt zum Beispiel, wie man einen Post anlegt. Ein Agent braucht etwas anderes, nämlich die Regeln, die man nirgends nachschlagen kann:

- **Die Reihenfolge von Build und Tests.** `npm test` prüft das gebaute `dist/`. Ohne vorherigen Build testet der Agent alten Code und hält das Ergebnis für gültig.
- **Was er nicht von sich aus tun darf.** `test:e2e` verschickt eine echte E-Mail über die Live-Seite, und `deploy` geht direkt in Produktion. Beides nur auf Anweisung des Eigentümers.
- **Die Falle mit Tailwind.** Tailwind liest auch Kommentare. Ein Wort wie „rounded“ in einem Kommentar erzeugt eine CSS-Regel und lässt den Designtest scheitern. Das steht in keiner Konfigurationsdatei, ein Agent würde es also erst durch einen Fehler lernen.
- **Der Verweis auf `DESIGN.md`.** Ein Agent hält sich sonst nicht an das Schwarz-Weiß-Design und zeigt visuelle Änderungen nicht vorher.

Bewusst nicht drin ist alles, was der Agent selbst in `package.json` oder im README nachlesen kann. Jede Zeile in `AGENTS.md` wird bei jedem Auftrag mitgelesen, und eine Kopie veraltet irgendwann.

## 2. Der Sync-Test für AGENTS.md

**Was:** `tests/agents-md.test.ts` prüft, dass jeder Befehl, jede Datei und jeder Skill, den `AGENTS.md` nennt, wirklich existiert.

**Warum:** Wird `tests/site.test.ts` irgendwann umbenannt, steht in `AGENTS.md` ein toter Pfad, und der Agent sucht nach einer Datei, die es nicht mehr gibt. Jetzt schlägt in diesem Fall `npm test` fehl, und der Fehler fällt sofort auf statt erst beim nächsten Agenten. Geprüft mit einer erfundenen Zeile `npm run lint`: Der Test hat sie abgelehnt.

Eine Grenze hat der Test: Er prüft nur, ob die Namen existieren, nicht ob die Aussagen stimmen. Das bleibt Handarbeit.

## 3. Das API-Schema (`docs/openapi.json`)

**Was:** `docs/openapi.json` ist eine maschinenlesbare Beschreibung von `/api/contact` im OpenAPI-Standard. Sie enthält die Felder mit ihren Grenzen (Name höchstens 100 Zeichen, Nachricht höchstens 5000), alle acht Statuscodes und die Weiterleitungen beim Formular ohne JavaScript.

**Warum:** Bisher stand dieses Verhalten nur im Code von `src/worker.ts`. Um zu erfahren, was die API bei einer zu langen Nachricht antwortet, musste man den Code lesen. Jetzt gibt es einen Vertrag an einer festen Stelle.

Damit der Vertrag nicht veraltet, schickt `tests/openapi.test.ts` echte Anfragen an den Worker und vergleicht die Antworten mit dem Schema. Das gilt in beide Richtungen:

- Der Test schlägt fehl, wenn der Worker etwas tut, das nicht im Schema steht.
- Er schlägt auch fehl, wenn das Schema einen Status nennt, den der Worker nie liefert.

Als Probe wurde im Schema 5000 auf 4000 geändert, und der Test hat den Unterschied sofort gefunden.

## 4. Automatisch erzeugte Doku (`docs/api.md`)

**Was:** `npm run docs` erzeugt aus dem JSON-Schema eine lesbare Markdown-Seite mit Tabellen (`scripts/gen-api-docs.ts`).

**Warum:** JSON ist für Maschinen gut und für Menschen mühsam zu lesen. Würde man die lesbare Fassung von Hand pflegen, gäbe es zwei Quellen, und die laufen früher oder später auseinander. So bleibt `docs/openapi.json` die einzige Quelle, und `docs/api.md` wird daraus abgeleitet. `npm test` prüft, ob die Seite noch zum Schema passt, und schlägt fehl, wenn jemand vergessen hat, `npm run docs` laufen zu lassen.

## 5. Der Skill `contact-api-change`

**Was:** `.factory/skills/contact-api-change/SKILL.md` ist eine Anleitung, die ein Agent nur lädt, wenn er am Kontaktformular arbeitet.

**Warum:** Eine Änderung am Kontaktformular hat mehrere Schritte, die man leicht vergisst: Worker ändern, Schema anpassen, Tests ergänzen, Doku neu erzeugen und gegebenenfalls `src/pages/contact.astro` anpassen. Diese Schritte gehören nicht in `AGENTS.md`, weil sie nur bei dieser einen Aufgabe gebraucht werden und sonst bei jedem Auftrag Platz kosten würden. Der Skill wird erst geladen, wenn er gebraucht wird. In `AGENTS.md` steht nur ein Satz, der auf ihn verweist.

## Wie die Teile zusammenhängen

Der Worker-Code ist die Wahrheit, und das Schema beschreibt ihn. Die Markdown-Doku entsteht aus dem Schema. `AGENTS.md` und der Skill verweisen auf all das. Jedes Glied dieser Kette hat einen Test, also merkt `npm test` es, sobald irgendwo etwas nicht mehr stimmt.
