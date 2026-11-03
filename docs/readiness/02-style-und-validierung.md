# Readiness-Fix: Style & Validation

_2026-11-03. Ein Commit pro Kriterium, siehe `git log`._

## Der gemeinsame Grund

Ein Agent schreibt schnell Code, aber er merkt Fehler erst, wenn ein Werkzeug sie ihm zeigt. Jede Prüfung in diesem Kapitel macht eine Fehlerart sichtbar, bevor ein Mensch sie sehen muss. Ohne diese Prüfungen erfährt der Agent erst durch dein Review, dass etwas nicht stimmt. Mit ihnen korrigiert er sich selbst, in Sekunden.

## Linter: ESLint (`eslint.config.js`, `npm run lint`)

**Was:** ESLint liest den Code und meldet typische Fehler, ohne ihn auszuführen. Es nutzt die empfohlenen Regeln für JavaScript, TypeScript und Astro.

**Warum:** Beim ersten Lauf hat ESLint vier echte Funde gemacht: zwei Variablen, die nie benutzt wurden, einen leeren `catch`-Block (er verschluckt Fehler) und einen regulären Ausdruck mit Steuerzeichen in `src/pages/contact.astro`. Den habe ich durch `\p{Cc}` ersetzt. Das bedeutet dasselbe, ist aber lesbar.

## Komplexitätsgrenze (`complexity`, `max-depth`, `max-lines`)

**Was:** ESLint bricht ab, wenn eine Funktion mehr als 25 Verzweigungen hat, tiefer als 4 Ebenen verschachtelt ist oder eine Datei über 400 Zeilen wächst.

**Warum:** Die Funktion `handleContact` in `src/worker.ts` lag bei 29. Je mehr Pfade eine Funktion hat, desto eher übersieht man beim Ändern einen davon, ein Agent genauso wie ein Mensch. Die Feldprüfungen stehen jetzt in einer eigenen Funktion `validate()`. Das Verhalten ist gleich geblieben, die Tests beweisen es.

## Namensregeln (`@typescript-eslint/naming-convention`)

**Was:** Funktionen und Variablen in camelCase, Konstanten wie `MAX_BODY_BYTES` in UPPER_CASE, Typen in PascalCase.

**Warum:** Ein Agent übernimmt den Stil, den er im Code vorfindet. Ist der gemischt, mischt er weiter. Eine Ausnahme ist bewusst gesetzt: Schlüssel in Objekten behalten ihre Schreibweise, weil Header-Namen wie `content-type` und JSON-Felder von außen kommen.

## Typprüfung: `astro check` (`npm run typecheck`)

**Was:** Prüft alle `.ts`- und `.astro`-Dateien gegen die strenge `tsconfig.json`.

**Warum:** Das war der wichtigste Fund. Node führt TypeScript aus, **ohne die Typen zu prüfen**, es wirft sie einfach weg. `astro check` hat beim ersten Lauf 33 Fehler gefunden, die bisher niemand bemerkt hatte:
- In den Seiten `works/[slug].astro` und `blog/[...slug].astro` waren die Props als `unknown` typisiert. Ein Tippfehler im Feldnamen wäre also nicht aufgefallen. Sie sind jetzt aus `getStaticPaths` abgeleitet.
- Die Tests haben dem Worker ein drittes Argument übergeben, das er gar nicht annimmt.

## Formatierung: Prettier (`.prettierrc.json`, `npm run format`)

**Was:** Prettier formatiert den Code einheitlich: einfache Anführungszeichen, 100 Zeichen Zeilenbreite, Astro-Plugin. Markdown und Inhalte lässt es bewusst aus, damit deine Texte ihre Zeilenumbrüche behalten.

**Warum:** Ohne Formatter mischt jeder Diff echte Änderungen mit Leerzeichen-Änderungen, und das Review wird mühsam. Ich habe geprüft, dass das gebaute HTML bis auf Leerzeichen identisch geblieben ist. Auch die Adresse im Impressum ist Zeichen für Zeichen gleich.

## Pre-Commit-Hook: lefthook (`lefthook.yml`)

**Was:** Vor jedem Commit prüft lefthook die gestagten Dateien: Formatierung, Lint, Secrets und Dateigröße. Das läuft parallel und dauert etwa eine Sekunde. `npm install` installiert den Hook automatisch.

**Warum:** CI meldet einen Fehler erst nach dem Push. Der Hook meldet ihn schon vor dem Commit, und dort ist er am billigsten zu beheben.

## Große Dateien (`scripts/check-file-size.ts`, `npm run size:files`)

**Was:** Bricht ab bei jeder Datei über 1 MB. `package-lock.json` ist ausgenommen, mit Begründung im Skript.

**Warum:** Ein Video oder ein Design-Export, der aus Versehen committet wird, bleibt für immer in der Git-Historie, auch wenn man ihn später löscht. Getestet mit einer 2-MB-Datei, die abgelehnt wurde.

## Toter Code und ungenutzte Abhängigkeiten: knip (`knip.json`, `npm run knip`)

**Was:** knip findet Dateien, Exporte und npm-Pakete, die nichts benutzt.

**Warum:** Toter Code führt Agenten in die Irre: Sie lesen ihn, halten ihn für relevant und passen ihn an. knip hat einen Fund gemacht, `PERSON_ID` in `src/jsonld.ts` wurde exportiert, aber nirgends importiert.

## Doppelter Code: jscpd (`.jscpd.json`, `npm run duplicates`)

**Was:** Bricht ab, wenn mehr als 2 % des Codes kopierte Blöcke von 8 Zeilen oder mehr sind. Im Moment sind es 0 %.

**Warum:** Agenten kopieren gern, statt eine gemeinsame Funktion zu schreiben. Dann wird ein Fehler an einer Stelle behoben und an der Kopie nicht.

## Größenbudget (`scripts/check-bundle-size.ts`, `npm run size:bundle`)

**Was:** Summiert die gebauten Assets nach Typ und bricht ab, wenn das Budget überschritten wird: 5 KB JavaScript, 20 KB CSS, 80 KB Schriften. Das ist etwa das Anderthalbfache der heutigen Größe.

**Warum:** Die Seite ist bewusst schlank. Eine neue Abhängigkeit oder eine zusätzliche Schrift-Variante kann sie unbemerkt verdoppeln. Jetzt fällt das bei dem Commit auf, der es verursacht.

## TODOs gehören in die Roadmap (`scripts/check-todos.ts`, `npm run todos`)

**Was:** Listet alle `TODO`-, `FIXME`- und `PLACEHOLDER`-Markierungen auf. Bricht ab, wenn eine Datei mit TODO nicht in `ROADMAP.md` genannt ist.

**Warum:** Ein TODO, das nur im Code steht, wird vergessen. Deine `ROADMAP.md` ist schon die Liste der offenen Arbeit, der Check verbindet sie mit dem Code. Beide offenen TODOs (Analytics-Token und Umsatzsteuer-ID) waren schon eingetragen.

## Secrets: secretlint (`.secretlintrc.json`, `npm run secrets`)

**Was:** Durchsucht die Dateien nach API-Schlüsseln, Tokens und privaten Schlüsseln. Das läuft im Hook und in CI.

**Warum:** Der Resend-Schlüssel liegt in `.dev.vars`, eine Kopie an der falschen Stelle wäre öffentlich, weil das Repo öffentlich ist. Getestet mit einem Schein-Token von GitHub, das gefunden wurde.
