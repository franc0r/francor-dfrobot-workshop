#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Baut aus den Quellbausteinen in src/ die fertigen Seiten in dist/.

    python3 build.py            # beide Ziele
    python3 build.py offline    # nur dist/maqueen-grand-prix-offline.html
    python3 build.py artifact   # nur dist/maqueen-grand-prix-artifact.html

offline  — eine einzige Datei, keine externen Aufrufe, Systemschriften.
           Das ist die Datei für die Arbeitsplätze auf der Messe.
artifact — Fassung zum Veröffentlichen als claude.ai-Artefakt (ohne
           <html>/<head>/<body>, mit Google-Fonts-Verknüpfung). Nur zum
           Teilen und Planen; braucht Internet.
"""
import base64, io, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")
DIST = os.path.join(HERE, "dist")

TITLE = "Maqueen Grand Prix"
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
        rel = m.group(1)
        path = os.path.join(SRC, "assets", rel)
        if not os.path.exists(path):
            raise SystemExit("Asset fehlt: src/assets/" + rel)
        mime = MIMES.get(os.path.splitext(rel)[1].lower())
        if not mime:
            raise SystemExit("unbekannter Asset-Typ: " + rel)
        data = base64.b64encode(io.open(path, "rb").read()).decode("ascii")
        return 'src="data:%s;base64,%s"' % (mime, data)

    return re.sub(r'src="assets/([A-Za-z0-9._-]+)"', one, html)


def stations():
    d = os.path.join(SRC, "stations")
    files = sorted(f for f in os.listdir(d) if f.endswith(".html"))
    out = []
    for i, f in enumerate(files):
        body = read("stations/" + f)
        m = re.search(r'data-st="(\d)"', body)
        if not m or int(m.group(1)) != i:
            raise SystemExit("Station %s: data-st passt nicht zur Reihenfolge (erwartet %d)" % (f, i))
        out.append("  <!-- ============ STATION %d ============ -->\n%s\n" % (i, body))
    return "".join(out)


def check_times(stations_html, app_js):
    """Eyebrow-Minuten, Rail-Array und Handbuch-Zeitplan müssen zusammenpassen."""
    eyebrow = [int(x) for x in re.findall(r'<span class="tag">Station \d</span><span>(\d+) Minuten</span>', stations_html)]
    rail = [int(x) for x in re.findall(r'm:"(\d+) Min"', app_js)]
    if eyebrow != rail:
        raise SystemExit("Zeiten stimmen nicht überein: Eyebrows %s vs. STATIONS-Array %s" % (eyebrow, rail))
    if sum(eyebrow) != 90:
        raise SystemExit("Stationsminuten summieren auf %d, nicht 90" % sum(eyebrow))
    return sum(eyebrow)


def assemble(target):
    css = read("styles.css")
    app = read("app.js")
    st = stations()
    check_times(st, app)

    if target == "offline":
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
            '  <main id="stage">\n\n' + st + "\n  </main>\n</div>\n\n"
            '<div class="scrim" id="scrim"></div>\n' + read("handbuch.html") + "\n\n"
            "<script>\n" + app + "\n</script>\n")
    body = inline_assets(body)
    if "assets/" in body:
        raise SystemExit('Asset nicht eingebettet – src="assets/…" mit doppelten '
                         "Anführungszeichen schreiben")

    if target == "offline":
        page = SKELETON_HEAD + head + "</head>\n<body>" + body + "</body>\n</html>\n"
        # harte Regel: nichts Externes
        bad = re.findall(r'(?:src|href)="https?://[^"]*"|url\(\s*["\']?https?://', page)
        if bad:
            raise SystemExit("Offline-Build enthält externe Verweise: %s" % bad[:3])
    else:
        page = head + body
    return page


def main(argv):
    targets = argv[1:] or ["offline", "artifact"]
    os.makedirs(DIST, exist_ok=True)
    for t in targets:
        if t not in ("offline", "artifact"):
            raise SystemExit("unbekanntes Ziel: " + t)
        out = os.path.join(DIST, "maqueen-grand-prix-%s.html" % t)
        page = assemble(t)
        io.open(out, "w", encoding="utf-8").write(page)
        print("%-9s %s  (%d KB)" % (t, os.path.relpath(out, HERE), len(page.encode("utf-8")) // 1024))


if __name__ == "__main__":
    main(sys.argv)
