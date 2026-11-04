# Readiness-Fix: CI, Abhängigkeiten, Sicherheit und Aufgaben

_2026-11-03_

## Der gemeinsame Grund

Bisher lief jede Prüfung nur, wenn jemand daran dachte, sie lokal zu starten, und der Deploy war ein Befehl von deinem Rechner aus. Die Prüfungen aus den anderen Kapiteln bringen erst etwas, wenn sie bei **jeder** Änderung laufen, auch bei der eines Agenten, der den Hook umgeht.

## CI (`.github/workflows/ci.yml`)

**Was:** Bei jedem Push und jedem Pull Request laufen nacheinander:
- Formatierung, Lint und Typprüfung
- knip, die Prüfungen auf doppelten Code, Secrets, Dateigröße und TODOs
- der Build, mit der gemessenen Dauer
- das Größenbudget und die Tests

CI hebt die Testberichte und den Build auf.

**Warum:** CI ist die eine Stelle, an der kein Schritt vergessen werden kann. Ein Agent sieht am roten oder grünen Haken, ob er fertig ist.

## Automatischer Deploy

**Was:** Nach erfolgreichen Prüfungen deployt jeder Merge nach `main` mit wrangler und prüft danach `/api/health`. Das gilt aber erst, wenn du die Secrets `CLOUDFLARE_API_TOKEN` und `CLOUDFLARE_ACCOUNT_ID` im Repo setzt. Bis dahin überspringt der Job den Deploy und sagt das in der Zusammenfassung.

**Warum:** Ein Deploy aus CI ist immer derselbe Ablauf aus einem sauberen Checkout, egal wer ihn auslöst. Er passiert nur, wenn alle Tests grün sind, und er prüft danach selbst, ob die Seite lebt. `AGENTS.md` sagt deshalb: Gearbeitet wird auf `develop`, `main` ändert sich nur per Pull Request von `develop`, und gepusht wird nur auf deine Anweisung.

## Release Notes (`.github/workflows/release.yml`)

**Was:** release-please hält einen Pull Request offen, der die Commits auf `main` in eine `CHANGELOG.md` überträgt. Mergst du ihn, entsteht eine Version mit Release Notes.

**Warum:** Das funktioniert, weil die Commits schon nach der Konvention `feat:` / `fix:` / `docs:` geschrieben sind. So sieht man auch später, was ein Agent wann geändert hat.

## Dependabot mit Wartezeit (`.github/dependabot.yml`, `.npmrc`)

**Was:** Dependabot öffnet jede Woche Pull Requests für npm-Updates und jeden Monat für die GitHub Actions. Eine neue Version muss 7 Tage alt sein, bevor er sie vorschlägt. `.npmrc` setzt `min-release-age=3`, damit auch `npm install` nur Versionen nimmt, die mindestens 3 Tage alt sind.

**Warum:** Wird ein npm-Paket gekapert, wird die bösartige Version meist innerhalb von Stunden oder Tagen entdeckt und zurückgezogen. Die Wartezeit sorgt dafür, dass sie bis dahin nicht bei dir landet.

## Gepinnte Actions

**Was:** Jede GitHub Action ist auf einen festen Commit-Hash gepinnt, nicht auf einen Tag wie `v7`.

**Warum:** Einen Tag kann der Autor der Action jederzeit auf anderen Code umbiegen, einen Hash nicht. Dependabot hält die Hashes aktuell.

## CodeQL (`.github/workflows/codeql.yml`)

**Was:** GitHub analysiert den Code bei jedem Pull Request und jede Woche auf Sicherheitslücken (SAST). Die Funde stehen unter Security → Code scanning.

## DAST: OWASP ZAP (`.github/workflows/dast.yml`)

**Was:** Einmal pro Woche ein passiver Scan der Live-Seite. Er liest nur Seiten und prüft Header, Cookies und Datenlecks. Er greift nicht an und verschickt kein Formular. Funde werden als Issue angelegt.

**Warum:** CodeQL liest den Code, ZAP prüft die laufende Seite. Ein falsch gesetzter Header in `public/_headers` fällt nur so auf.

## Devcontainer (`.devcontainer/devcontainer.json`)

**Was:** Eine fertige Entwicklungsumgebung mit Node 26 und der GitHub CLI. Sie installiert und baut beim Start. Getestet: In einem frischen Container laufen alle Tests durch.

**Warum:** Ein Agent in der Cloud (oder ein neuer Rechner) bekommt genau die Umgebung, in der die Tests grün sind.

## `.gitignore` und `.nvmrc`

`.gitignore` schließt jetzt auch Editor-Ordner (`.idea/`, `.vscode/`), Logs und Coverage aus. `.nvmrc` legt Node 26 fest, für nvm, CI und den Devcontainer.

## CODEOWNERS, Templates und Labels

- `.github/CODEOWNERS` macht dich zum Reviewer jeder Änderung.
- Das Bug-Formular fragt nach Seite, Schritten, Erwartung und Request-ID. Das Änderungsformular fragt nach „was, warum, wann fertig“ und weist auf die Design-Freigabe hin.
- Die Pull-Request-Vorlage enthält eine Checkliste: Tests, Lint, Design-Freigabe, API-Spec und Roadmap.
- `.github/labels.yml` legt die Labels fest, darunter `content`, `design`, `contact-form`, `incident` und `triage`. Ein Workflow wendet die Datei an.

**Warum:** Ein Agent, der ein Issue anlegt oder bearbeitet, weiß dadurch, welche Angaben gebraucht werden und wie er es einordnet.

## Stand nach dem ersten Push (2026-11-04)

Erledigt:
- Gepusht. Der erste CI-Lauf auf `main` war grün. Der Deploy-Job hat sich übersprungen, weil die Cloudflare-Secrets fehlen.
- **Zwei Branches:** Gearbeitet wird auf `develop`. `main` ist die Produktion und ändert sich nur per Pull Request von `develop`. CI und CodeQL laufen auf beiden Branches, der Deploy nur auf `main`.
- **Branch-Schutz:** Auf `main` und `develop` muss die Prüfung „Lint, type-check and test“ grün sein. Force-Push und Löschen sind gesperrt, die Historie bleibt linear. Auf `main` geht es nur per Pull Request, auch für dich als Admin.
- **Dependabot:** Alerts und automatische Security-Updates sind an. Die Pull Requests zielen auf `develop`.
- **release-please** darf jetzt Pull Requests anlegen. Beim ersten Lauf fehlte GitHub Actions dafür die Erlaubnis. Der Release-PR sammelt die Commits auf `main`.
- Updates der Actions kommen jetzt in einem gemeinsamen Pull Request. `init` und `analyze` von CodeQL müssen zusammen wechseln, getrennt bricht der CodeQL-Lauf.
- Der Health-Check alle 30 Minuten bleibt aus, bis die Repo-Variable `HEALTH_CHECK` auf `on` steht. Auf der Live-Seite läuft noch der alte Worker ohne `/api/health`, der Check würde also sofort ein Incident-Issue öffnen.

## Was du noch tun musst

1. **Cloudflare-Secrets** `CLOUDFLARE_API_TOKEN` (Vorlage „Edit Cloudflare Workers“) und `CLOUDFLARE_ACCOUNT_ID` im Repo setzen. Ab dann deployt jeder Merge nach `main`.
2. Nach dem ersten Deploy die Repo-Variable **`HEALTH_CHECK=on`** setzen (Settings → Secrets and variables → Actions → Variables).
3. Die **Fehler-Benachrichtigung in Cloudflare** einrichten (siehe `ROADMAP.md`).
