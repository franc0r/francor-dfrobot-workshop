# Konzept „Maqueen Grand Prix"

**Stand:** 10.09.2026 · erster Testrun auf einer Messe

## Rahmen (mit Martin abgestimmt)
- Zielgruppe: Schüler ab ca. Klasse 7
- Hardware: **micro:bit V2 + DFRobot Maqueen Plus V3** (https://www.dfrobot.com/product-2935.html)
- Programmierung: **nur Blöcke** (MakeCode), kein Textcode
- Format: **feste Slots à 90 Min** auf einem Messestand, **2–4 Arbeitsplätze, je zwei Schüler**
- Arbeitsplätze: Laptop **oder Raspberry Pi 4 mit Monitor/Tastatur/Maus** (noch nicht fix)
- **Alles muss ohne Internet funktionieren** (siehe 02-offline-und-trockenlauf.md)
- Leitmedium: interaktive Webseite mit geführtem Ablauf, Fortschritt, Gamification, zwei Browser-Simulatoren

## Dramaturgie 90 Min
| Zeit | Station | Kern |
|---|---|---|
| 0:00–0:06 | Boxenstopp | Regelkreis wahrnehmen → entscheiden → handeln |
| 0:06–0:16 | Erster Kontakt | MakeCode, erstes Programm flashen (nur micro:bit am USB) |
| 0:16–0:36 | micro:bit allein | LED-Matrix, Knopf-Ereignisse, Beschleunigungssensor, Würfel |
| 0:36–0:52 | Fahrschule | Erweiterung laden, Parcours-Simulator, Motorblöcke |
| 0:52–1:08 | Augen | Kalibrierung + Linienverfolgung auf Knopf A = Wow-Moment |
| 1:08–1:18 | Reflexe | Laserscanner + wenn/dann/sonst — **Bonus-Station, streichbar** |
| 1:18–1:30 | Grand Prix | Tuning + ein Lauf auf Zeit (nie streichen) |

**Didaktischer Faden:** Station 2 legt „Sensorwert = Zahl, die Grenze legt das Programm fest"
— genau der Gedanke wird in Station 4 (schwarz ≈ 2700 / weiß ≈ 3800) wieder gebraucht.

## Technische Fakten (recherchiert, DFRobot Wiki / micro:bit Foundation)
- MakeCode-Erweiterung: Suchbegriff `dfrobot` → **DFRobot_MaqueenPlus_V2**. Der offizielle
  V3-Quick-Start-Guide: „Maqueen Plus V3 and Maqueen Plus V2 use the same library … the name of
  the library is still V2, but all the functions of V3 have been integrated." Erst ab Station 3 nötig.
- Motorblock: Tempo 0–255; unter ~30 bewegt sich nichts
- Linienverfolgung: Stufe 1–5, läuft im Hintergrund weiter bis gestoppt
- 5 Liniensensoren, Analogwerte ca. weiß 3800 / schwarz 2700 (Richtung im Trockenlauf messen)
- Kalibrierung: alle 5 Sensoren auf Schwarz, einschalten, **Calc-Key ~2 s halten**
- Zwei Schalter (Akkubrett + Bodenplatte) müssen beide an sein
- 8×8-Laserscanner, 20–4000 mm, **~3 s Init nach dem Einschalten**; Blocknamen unverifiziert
- Licht: Fahrzeuglicht 7 Farben, RGB-LEDs unten einzeln ansteuerbar

## Raspberry Pi als Arbeitsplatz
- Offiziell unterstützt: **Linux inkl. Raspberry Pi OS** (Bullseye / Bookworm); Chrome/Chromium
  ab 126 empfohlen, ältere können funktionieren
- Flashen Weg A: WebUSB („Gerät koppeln"). Weg B: `.hex` auf das Laufwerk `MICROBIT` ziehen —
  **funktioniert immer**; unter Linux ohne udev-Regel (VID 0d28 / PID 0204) oft der Hauptweg
- WebUSB braucht micro:bit-Firmware **0249+** (`DETAILS.TXT` auf dem Laufwerk)
- **4 GB RAM Minimum**, 8 GB entspannter; nur 2 Tabs, MakeCode-Simulator einklappen, aktive Kühlung
- Keine MakeCode-Offline-App für ARM — aber der Browser-Editor cacht sich selbst und läuft
  danach ohne Netz (Details in 02-offline-und-trockenlauf.md)
- Vorteil: alle Stationen per SD-Image klonbar, Ersatz-Pi in 2 Minuten einsatzbereit

## Offene Punkte
- Trockenlauf durchführen; Blocknamen (v. a. Laserscanner) und Messwerte in die Seite übernehmen
- Arbeitsplatz-Entscheidung Laptop vs. Raspberry Pi 4
- Parcours-Bauplan (braucht gemessenen Kurvenradius; schwarzes Isolierband 19 mm)
- Stand-Paket zum Drucken: Urkunde, Handzettel mit QR-Code, Tischaufsteller, Papier-Bestenliste
- Nach dem Testrun: Ausbau zur mehrwöchigen AG mit Umstieg auf Textcode denkbar

## Quellen
- https://wiki.dfrobot.com/SKU_MBT0050_Maqueen_Plus_V3
- https://wiki.dfrobot.com/mbt0050-aa/docs/23834 (Quick Start, Erweiterung V2 = V3)
- https://wiki.dfrobot.com/mbt0050-18650/docs/22701 (Getting Started, Kalibrierung)
- https://wiki.dfrobot.com/mbt0050-18650/docs/22702 (Motor, Licht)
- https://wiki.dfrobot.com/mbt0050-18650/docs/22704 (Quick Line Tracking)
- https://wiki.dfrobot.com/mbt0050-18650/docs/22705 (Sensorwerte)
- https://wiki.dfrobot.com/mbt0050-18650/docs/22709 (Laserscanner)
- https://support.microbit.org/support/solutions/articles/19000013991- (OS/Browser, Raspberry Pi)
- https://makecode.microbit.org/device/usb/webusb/troubleshoot (Firmware 0249+, WebUSB)
