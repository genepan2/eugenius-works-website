# Readiness-Fix: Testing

_2026-11-03_

## Der gemeinsame Grund

Tests sind für einen Agenten die einzige Möglichkeit festzustellen, ob seine Änderung funktioniert. Damit das zuverlässig ist, müssen die Tests drei Dinge leisten: Sie müssen einzeln auffindbar sein, sie dürfen sich nicht gegenseitig beeinflussen, und sie müssen melden, wenn Code ungetestet bleibt.

## Der Testrunner von Node (`node:test`)

**Was:** Die Tests waren einfache Skripte voller `assert`-Aufrufe. Jetzt nutzen sie den eingebauten Testrunner von Node mit benannten `test()`-Blöcken. Es kommt keine neue Abhängigkeit dazu.

**Warum:** Bei einem Skript brach der Lauf beim ersten Fehler ab, und man sah nur eine Zeilennummer. Jetzt laufen alle Tests weiter, und jeder Fehler steht mit seinem Namen da, etwa „✖ a cross-site post gets 403 and sends nothing“. Ein Agent weiß sofort, welches Verhalten kaputt ist. Man kann auch einen einzelnen Test starten: `node --test --test-name-pattern="honeypot" tests/unit/`.

## Struktur und Namensregel

**Was:** `tests/unit/` braucht keinen Build, `tests/site/` prüft `dist/`, und `tests/e2e/` verschickt echte E-Mails. Es gibt eine Testdatei pro Modul, und jeder Test heißt wie das Verhalten, das er zeigt, als Satz. Die Regel steht in `AGENTS.md`.

**Warum:** So findet ein Agent den passenden Test zu einer Datei, ohne zu suchen, und schreibt neue Tests am richtigen Ort. Damit `metaDescription` testbar wurde, ist sie nach `src/meta-description.ts` umgezogen. In der alten Datei hing sie an Astro und ließ sich außerhalb davon nicht laden.

## Isolation

**Was:** Der Runner startet jede Testdatei in einem eigenen Prozess. Innerhalb der Worker-Tests nutzt jeder Test seine eigene IP-Adresse.

**Warum:** Das Rate-Limit lebt im Speicher des Workers. Würden zwei Tests dieselbe IP nutzen, hinge das Ergebnis von ihrer Reihenfolge ab, und ein Test würde zufällig rot. Solche Tests nennt man „flaky“. Einem Agenten zeigen sie Fehler, die er nicht verursacht hat.

## Coverage-Schwellen

**Was:** `npm run test:unit` misst, welcher Teil von `src/` von Tests ausgeführt wird, und bricht ab unter 95 % der Zeilen, 85 % der Verzweigungen oder 95 % der Funktionen. Heute sind es 100 %, 96 % und 100 %.

**Warum:** Ohne Schwelle kann ein Agent neuen Code ohne Tests hinzufügen, und alle Tests bleiben grün. Die Schwelle zwingt ihn, Tests mitzuschreiben. Der erste Lauf hat eine echte Lücke gezeigt: Der Fall „Resend nicht erreichbar“ war ungetestet. Dafür gibt es jetzt einen Test.

## Laufzeit-Berichte (JUnit)

**Was:** Jeder Lauf schreibt `test-results/unit.xml` und `test-results/site.xml` mit der Dauer jedes einzelnen Tests. CI hebt die Berichte auf.

**Warum:** Wenn die Tests langsam werden, sieht man im Bericht, welcher Test die Zeit kostet. Langsame Tests sind ein Grund, warum Agenten (und Menschen) sie überspringen.
