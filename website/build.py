#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Baut aus den Quellbausteinen in src/ die fertigen Seiten in dist/.

    python3 build.py            # alle drei Ziele
    python3 build.py offline    # nur dist/maqueen-grand-prix-offline.html
    python3 build.py pages      # nur dist/maqueen-grand-prix-pages.html
    python3 build.py artifact   # nur dist/maqueen-grand-prix-artifact.html

offline  — eine einzige Datei, keine externen Aufrufe, Systemschriften.
           Das ist die Datei für die Arbeitsplätze auf der Messe.
pages    — dasselbe, nur ohne den Zusatz „Offline-Ausgabe“ in Titel und
           Kopfzeile. Das ist die Fassung für GitHub Pages. Auch sie lädt
           nichts von außen — ein öffentlich gehosteter Verein sollte keine
           Google-Fonts nachladen (DSGVO), und so bleibt es eine Datei.
artifact — Fassung zum Veröffentlichen als claude.ai-Artefakt (ohne
           <html>/<head>/<body>, mit Google-Fonts-Verknüpfung). Nur zum
           Teilen und Planen; braucht Internet.
"""
import base64, io, json, lzma, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")
DIST = os.path.join(HERE, "dist")

TITLE = "Maqueen Grand Prix"
# Ziele, die eine vollständige, in sich geschlossene HTML-Datei ergeben.
STANDALONE = ("offline", "pages")
TARGETS = ("offline", "pages", "artifact")
FONTS = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
         'family=Archivo:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600'
         '&family=IBM+Plex+Sans:wght@400;500;600&display=swap">')

FONTS_ONLINE = """  --mono:"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
  --sans:"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --display:"Archivo", "IBM Plex Sans", system-ui, sans-serif;"""
FONTS_OFFLINE = """  --mono:"IBM Plex Mono", ui-monospace, "DejaVu Sans Mono", "Liberation Mono", Consolas, "Courier New", monospace;
  --sans:"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "DejaVu Sans", Cantarell, sans-serif;
  --display:"Archivo", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "DejaVu Sans", sans-serif;"""

SKELETON_HEAD = """<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root{color-scheme:light dark}
html,body{margin:0}
img{max-width:100%}
[hidden]{display:none !important}
</style>
"""


def read(rel):
    return io.open(os.path.join(SRC, rel), encoding="utf-8").read().rstrip("\n")


MIMES = {".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg",
         ".jpeg": "image/jpeg", ".webp": "image/webp"}


def inline_assets(html):
    """src="assets/datei" wird zur data:-URI.

    Bilder liegen als Datei in src/assets/, damit die Quellen lesbar bleiben;
    in der fertigen Seite stecken sie eingebettet drin. Sonst wäre die
    Offline-Regel verletzt, sobald die HTML-Datei allein weitergereicht wird.
    """
    def one(m):
        rel = m.group(2)
        path = os.path.join(SRC, "assets", rel)
        if not os.path.exists(path):
            raise SystemExit("Asset fehlt: src/assets/" + rel)
        mime = MIMES.get(os.path.splitext(rel)[1].lower())
        if not mime:
            raise SystemExit("unbekannter Asset-Typ: " + rel)
        data = base64.b64encode(io.open(path, "rb").read()).decode("ascii")
        return '%s="data:%s;base64,%s"' % (m.group(1), mime, data)

    # src= für <img>, href= für <image> im SVG
    return re.sub(r'(src|href)="assets/([A-Za-z0-9._-]+)"', one, html)


MAKECODE = "https://makecode.microbit.org/"
VORLAGE = os.path.join(HERE, "..", "microbit", "vorlage", "vorlage.mkcd")
BIBLIOTHEK = os.path.join(HERE, "..", "microbit", "bibliothek", "custom.ts")


def check_vorlage(path: str) -> None:
    """Die Vorlage muss die Bibliothek „Grand Prix“ (custom.ts) mitbringen,
    und zwar byte-gleich mit microbit/bibliothek/custom.ts.

    Die .mkcd ist LZMA-gepackt (Kopf wie LZMA-JS ihn schreibt, also das
    alte „alone“-Format), darin JSON; dessen source ist wieder JSON mit den
    Projektdateien.
    """
    data = io.open(path, "rb").read()
    project = json.loads(lzma.decompress(data, format=lzma.FORMAT_ALONE))
    files = json.loads(project["source"])
    pxt = json.loads(files.get("pxt.json", "{}"))
    if ("custom.ts" not in files or "namespace grandPrix" not in files["custom.ts"]
            or "custom.ts" not in pxt.get("files", [])):
        raise SystemExit("Vorlage ohne Grand-Prix-Bibliothek (custom.ts) – python3 vorlage.py")
    # Die Vorlage muss die aktuelle Bibliothek tragen, nicht einen alten Stand.
    if files["custom.ts"].encode("utf-8") != io.open(BIBLIOTHEK, "rb").read():
        raise SystemExit("Vorlage veraltet – python3 vorlage.py "
                         "(custom.ts weicht von microbit/bibliothek/custom.ts ab)")


def makecode_links(html):
    """href="makecode:neu" und href="makecode:vorlage" werden zu MakeCode-Links.

    #newproject öffnet sofort ein leeres Projekt. #project: trägt die ganze
    Vorlage (die .mkcd als Base64) im Link selbst – MakeCode lädt dafür nichts
    nach und öffnet sie auch ohne Netz aus dem Cache.
    """
    if not os.path.exists(VORLAGE):
        raise SystemExit("Vorlage fehlt: microbit/vorlage/vorlage.mkcd (python3 vorlage.py)")
    check_vorlage(VORLAGE)
    b64 = base64.b64encode(io.open(VORLAGE, "rb").read()).decode("ascii")
    html = html.replace('href="makecode:neu"', 'href="%s#newproject"' % MAKECODE)
    html = html.replace('href="makecode:vorlage"', 'href="%s#project:%s"' % (MAKECODE, b64))
    # Drehbücher verweisen mit {karte:"makecode:neu"} / {karte:"makecode:vorlage"}
    # auf die Knöpfe; das ist kein Link und bleibt stehen.
    if "makecode:" in re.sub(r'karte:\s*"makecode:(?:neu|vorlage)"', "", html):
        raise SystemExit('unbekannter MakeCode-Platzhalter – nur makecode:neu und makecode:vorlage')
    return html


def drehbuch_js():
    """Alle src/drehbuch/NN-name.js, sortiert, hintereinander."""
    d = os.path.join(SRC, "drehbuch")
    out = []
    for f in sorted(x for x in os.listdir(d) if x.endswith(".js")):
        m = re.match(r"(\d\d)-[a-z0-9-]+\.js$", f)
        if not m:
            raise SystemExit("Drehbuch %s: Dateiname muss NN-name.js heißen" % f)
        body = read("drehbuch/" + f)
        if "DREHBUCH[%d]" % int(m.group(1)) not in body:
            raise SystemExit("Drehbuch %s: DREHBUCH[%d] steht nicht darin" % (f, int(m.group(1))))
        out.append("/* ---- Drehbuch %s ---- */\n%s\n" % (f, body))
    return "".join(out)


def karten_html():
    """Alle src/karten/*.html, sortiert, für den versteckten Kartenvorrat."""
    d = os.path.join(SRC, "karten")
    return "".join(read("karten/" + f) + "\n" for f in sorted(os.listdir(d)) if f.endswith(".html"))


# Textbudget je Station (Spec 2026-11-09-parcours-first, Abschnitt Textbudget; Station 5 auf
# 850 angehoben, weil das Grand-Prix-Programm vollständig auf der Seite steht). Gezählt wird
# stumpf: Tags raus, alles Übrige an Leerzeichen getrennt – auch Blocktexte, Knöpfe, Tabellen.
# Auf diesem Zweig zählt je Station, was das Team im Gespräch liest: die Nachrichten des
# Drehbuchs (auch die hinter den Zeig-Knöpfen) plus die Karten-Datei. Chips, Fertig-Knöpfe,
# IDs und Kartenverweise zählen nicht. Ein Gespräch spricht in ganzen Sätzen, deshalb gilt
# hier das Budget von master mal GESPRAECHSFAKTOR (Entscheidung 09.11.2026, bis Martin sie kippt).
TEXTBUDGET = [200, 350, 550, 500, 300, 850]
GESPRAECHSFAKTOR = 1.5


def wortzahl(body: str) -> int:
    return len(re.sub(r'<[^>]*>', ' ', body).split())


def drehbuch_text(js: str) -> str:
    """Nur die Nachrichten eines Drehbuchs: Schlüsselwörter, Chips, Fertig-Texte und
    Kartenverweise fallen raus, übrig bleiben die Zeichenketten, die das Team liest."""
    js = re.sub(r'\bchips\s*:\s*\[[^\]]*\]', '', js)
    js = re.sub(r'\b(fertig|id|titel|name|badge)\s*:\s*"(?:[^"\\]|\\.)*"', '', js)
    js = re.sub(r'\{\s*karte\s*:\s*"[^"]*"\s*\}', '', js)
    js = re.sub(r'"((?:[^"\\]|\\.)*)"\s*:\s*\[', '[', js)   # Knopftexte der Zeig-Blöcke
    return " ".join(re.findall(r'"((?:[^"\\]|\\.)*)"', js))


_gezaehlt = False   # Wortzahlen nur einmal ausgeben, nicht je Ziel


def check_textbudget():
    global _gezaehlt
    dreh = sorted(f for f in os.listdir(os.path.join(SRC, "drehbuch")) if f.endswith(".js"))
    karten = sorted(f for f in os.listdir(os.path.join(SRC, "karten")) if f.endswith(".html"))
    if len(dreh) != len(TEXTBUDGET) or len(karten) != len(TEXTBUDGET):
        raise SystemExit("%d Drehbücher, %d Kartendateien, aber %d Textbudgets"
                         % (len(dreh), len(karten), len(TEXTBUDGET)))
    for i, (dj, kh) in enumerate(zip(dreh, karten)):
        if dj[:2] != "%02d" % i or kh[:2] != "%02d" % i or dj[:-3] != kh[:-5]:
            raise SystemExit("Drehbuch %s und Karten %s passen nicht zu Station %d" % (dj, kh, i))
        n = wortzahl(drehbuch_text(read("drehbuch/" + dj))) + wortzahl(read("karten/" + kh))
        budget = int(TEXTBUDGET[i] * GESPRAECHSFAKTOR)
        if n > budget:
            raise SystemExit("Station %s: %d Wörter, Budget %d (%d × %.1f)"
                             % (dj[:-3], n, budget, TEXTBUDGET[i], GESPRAECHSFAKTOR))
        if not _gezaehlt:
            print("Station %d: %d/%d Wörter" % (i, n, budget))
    _gezaehlt = True


STATIONSMINUTEN = 105   # Summe der Stationen ...
PUFFER = 15             # ... plus Puffer = 120-Minuten-Slot


def check_times(app_js, drehbuch=""):
    """Rail-Array und Drehbuch-Minuten müssen zusammenpassen, Summe 105."""
    rail = [int(x) for x in re.findall(r'm:"(\d+) Min"', app_js)]
    # Drehbücher: wo eines existiert, muss seine Minutenzahl zum STATIONS-Array passen
    for nr, mins in re.findall(r'DREHBUCH\[(\d+)\]\s*=\s*\{(?:(?!DREHBUCH\[)[\s\S])*?\bmin:\s*(\d+)', drehbuch):
        if int(nr) >= len(rail) or int(mins) != rail[int(nr)]:
            raise SystemExit("Drehbuch %s: min %s passt nicht zum STATIONS-Array %s" % (nr, mins, rail))
    if sum(rail) != STATIONSMINUTEN:
        raise SystemExit("Stationsminuten summieren auf %d, nicht %d (+ %d Puffer = %d)"
                         % (sum(rail), STATIONSMINUTEN, PUFFER, STATIONSMINUTEN + PUFFER))
    return sum(rail)


def assemble(target):
    css = read("styles.css")
    app = read("app.js")
    drehbuch = drehbuch_js()
    marke = "/* @@EINHAENGEN@@ */"
    if app.count(marke) != 1:
        raise SystemExit("Marke %s muss in app.js genau einmal vorkommen" % marke)
    if os.path.exists(os.path.join(SRC, "stations")):
        raise SystemExit("Stationen gehören jetzt in drehbuch/ und karten/")
    check_times(app, drehbuch)
    check_textbudget()
    app = app.replace(marke, drehbuch + read("maskottchen.js"))

    if target in STANDALONE:
        if FONTS_ONLINE not in css:
            raise SystemExit("Schriftstapel in styles.css nicht gefunden – FONTS_ONLINE in build.py anpassen")
        css = css.replace(FONTS_ONLINE, FONTS_OFFLINE)

    topbar = read("topbar.html")
    if target == "offline":
        topbar = topbar.replace("Maqueen&nbsp;Plus&nbsp;V3</span>", "Maqueen&nbsp;Plus&nbsp;V3 &middot; Offline-Ausgabe</span>")

    title = TITLE + (" — Offline-Ausgabe" if target == "offline" else "")
    head = "<title>%s</title>\n" % title
    if target == "artifact":
        head += FONTS + "\n"
    head += "<style>\n" + css + "\n</style>\n"

    body = ("\n" + topbar + "\n\n"
            '<div class="shell">\n' + read("rail.html") + "\n\n"
            '  <main id="stage">\n' + read("figur.html") + "\n"
            '<section class="gespraech" id="gespraech"><div class="chat" id="chat"></div>'
            '<div class="antworten" id="antworten"></div></section>\n'
            '<div id="karten" hidden>\n' + karten_html() + "</div>\n\n"
            + read("stueckliste.html") + "\n"
            "\n  </main>\n</div>\n\n"
            '<div class="scrim" id="scrim"></div>\n' + read("handbuch.html") + "\n\n" + read("sicherheit.html") + "\n\n"
            "<script>\n" + app + "\n</script>\n")
    body = makecode_links(inline_assets(body))
    if "assets/" in body:
        raise SystemExit('Asset nicht eingebettet – src="assets/…" mit doppelten '
                         "Anführungszeichen schreiben")

    if target in STANDALONE:
        page = SKELETON_HEAD + head + "</head>\n<body>" + body + "</body>\n</html>\n"
        # harte Regel: nichts Externes. Einzige Ausnahme: Links in den
        # MakeCode-Editor – sie laden nichts in diese Seite, sondern öffnen
        # MakeCode im zweiten Tab, das am Arbeitsplatz aus dem Cache läuft.
        bad = re.findall(r'(?:src|href)="https?://(?!makecode\.microbit\.org/#)[^"]*"'
                         r'|src="https?://makecode[^"]*"|url\(\s*["\']?https?://', page)
        if bad:
            raise SystemExit("%s-Build enthält externe Verweise: %s" % (target, bad[:3]))
    else:
        page = head + body
    return page


def main(argv):
    targets = argv[1:] or list(TARGETS)
    os.makedirs(DIST, exist_ok=True)
    for t in targets:
        if t not in TARGETS:
            raise SystemExit("unbekanntes Ziel: " + t)
        out = os.path.join(DIST, "maqueen-grand-prix-%s.html" % t)
        page = assemble(t)
        io.open(out, "w", encoding="utf-8").write(page)
        print("%-9s %s  (%d KB)" % (t, os.path.relpath(out, HERE), len(page.encode("utf-8")) // 1024))


if __name__ == "__main__":
    main(sys.argv)
