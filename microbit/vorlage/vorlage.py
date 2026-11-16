#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Schreibt vorlage.mkcd: ein MakeCode-Projekt, das auf unsere Erweiterung
FRANCOR Maqueen (pxt-francor-maqueen) verweist und nur „starte Maqueen“ in
„beim Start“ hat.

    python3 vorlage.py            # schreibt vorlage.mkcd neben dieses Skript

Eine .mkcd ist, was MakeCode beim Speichern exportiert: JSON mit meta und
source, LZMA-gepackt (Kopf mit bekannter Länge, wie LZMA-JS ihn schreibt).
Die Erweiterung wird nur verwiesen (GitHub, feste Version), nicht eingebettet.
Der LiDAR ist Teil derselben Erweiterung; eine zweite braucht es nicht.

Ein Export aus MakeCode (Zahnrad → Projekt speichern) ersetzt die Datei
genauso gut; build.py nimmt, was hier liegt.
"""
import json, lzma, os, struct

# Erweiterung FRANCOR Maqueen, feste Version (Tag im GitHub-Repo)
FRANCOR_MAQUEEN = "github:franc0r/pxt-francor-maqueen#v0.1.4"
NAME = "Maqueen-Vorlage"
HERE = os.path.dirname(os.path.abspath(__file__))

files = {
    "pxt.json": json.dumps({
        "name": NAME,
        "description": "",
        "dependencies": {"core": "*", "radio": "*", "microphone": "*", "francor-maqueen": FRANCOR_MAQUEEN},
        "files": ["main.blocks", "main.ts", "README.md"],
        "preferredEditor": "blocksprj"}, indent=4),
    "main.blocks": ('<xml xmlns="https://developers.google.com/blockly/xml">'
                    '<block type="pxt-on-start" x="20" y="20"><statement name="HANDLER">'
                    '<block type="francor_start"></block>'
                    '</statement></block></xml>'),
    "main.ts": "francorMaqueen.start()\n",
    "README.md": "",
}
project = {"meta": {"cloudId": "pxt/microbit", "editor": "blocksprj", "name": NAME},
           "source": json.dumps(files, indent=2)}

raw = json.dumps(project, indent=2).encode("utf-8")
dict_size = 1 << 20
body = lzma.compress(raw, format=lzma.FORMAT_RAW, filters=[
    {"id": lzma.FILTER_LZMA1, "dict_size": dict_size, "lc": 3, "lp": 0, "pb": 2}])
head = bytes([(2 * 5 + 0) * 9 + 3]) + struct.pack("<IQ", dict_size, len(raw))

out = os.path.join(HERE, "vorlage.mkcd")
open(out, "wb").write(head + body)
print("vorlage.mkcd  (%d Byte)" % (len(head) + len(body)))
