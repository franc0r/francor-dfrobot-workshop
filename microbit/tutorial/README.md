# MakeCode-Tutorial (Versuch)

`erster-kontakt.md` führt Schritt für Schritt durch das Herz-Programm aus Station 1,
im Tutorial-Modus von MakeCode (Anleitung links, Glühbirne für die Lösung,
Blockpalette auf die nötigen Blöcke beschränkt). Entstanden aus dem Probelauf
vom 28.10.2026, siehe `docs/04-probelauf-2026-10-28.md`.

Noch nicht in der Workshop-Seite verlinkt. Erst testen.

## Stufe 1: Inhalt (mit Netz)

1. `tutorial-test.html` per Doppelklick in Chrome öffnen. Sie bettet MakeCode
   (`?controller=1&lang=de`) ein, genau wie <https://makecode.com/tutorial-tool>.
2. Warten, bis MakeCode da ist, dann `erster-kontakt.md` wählen → **Tutorial starten**.
3. Nach jeder Änderung an der `.md` die Datei neu wählen und neu starten.

Am 29.10.2026 mit Netz geprüft (Playwright/Chromium): Tutorial startet, deutsche
Oberfläche, Begrüßungsfenster und Schrittleiste erscheinen.

Darauf achten:
- Findet die Testperson die Blöcke? Die Palette zeigt nur die Blöcke des Schritts.
- Gibt es das Suchfeld im Tutorial-Modus überhaupt? (Schritt 1 nennt es.)
- Stimmen die deutschen Blocknamen in den farbigen Verweisen?
- Startet die Vorlage mit `beim Start` und `dauerhaft`, oder fehlt `beim Start`?

## Stufe 2: Offline (nur wenn Stufe 1 überzeugt)

### a) Eingebettet über `tutorial-test.html` — **geht offline nicht** (Martin, 29.10.2026)

Mit Netz läuft es, ohne Netz startet das eingebettete MakeCode nicht. Vermutlich, weil
Chrome Cache und Speicher eingebetteter Seiten getrennt von denen des normalen Tabs hält.
Dieser Weg ist damit raus; die Testseite bleibt nur für den Inhaltstest (Stufe 1).

1. Mit Netz: Testseite öffnen, MakeCode ganz laden lassen, Tutorial einmal starten.
2. WLAN aus bzw. Kabel ziehen, Chrome ganz schließen.
3. Testseite wieder per Doppelklick öffnen → Datei wählen → **Tutorial starten**.
4. micro:bit anstecken, **Herunterladen**: klappt das Koppeln (WebUSB) im eingebetteten Fenster?

Zur Kontrolle denselben Ablauf mit `makecode.microbit.org` im normalen Tab — der muss offline gehen.
Playwright taugt hierfür nicht: mit dessen Offline-Schalter startet nicht einmal der
normale MakeCode-Tab aus dem Cache. Nur der echte Test ohne Netz zählt.

### b) GitHub-Repo

Per Link lädt MakeCode ein eigenes Tutorial nur aus einem GitHub-Repo
(`#tutorial:github:besitzer/repo/datei`) oder aus einem geteilten Projekt — beides
braucht Netz. Ein GitHub-Tutorial bleibt aber nach dem ersten Laden in der
IndexedDB des Browsers und wird ohne Netz von dort genommen
(pxt `webapp/src/idbworkspace.ts`, `loadTutorialMarkdown`).

Test: Repo anlegen, Link einmal mit Netz öffnen, Netz trennen, Browser neu starten,
Link erneut öffnen. Geht das, wäre es eine zweite Ausnahme von Regel 1 in CLAUDE.md —
mit Vorladen beim Aufbau und einem Ausweichweg, falls der Browser-Speicher leer ist.
