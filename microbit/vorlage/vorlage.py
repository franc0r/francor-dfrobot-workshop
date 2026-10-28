#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Schreibt vorlage.mkcd: ein MakeCode-Projekt mit der Erweiterung
DFRobot_MaqueenPlus_V2 und nur „initialisiere Maqueen Plus V2“ in „beim Start“.

    python3 vorlage.py            # schreibt vorlage.mkcd neben dieses Skript

Eine .mkcd ist, was MakeCode beim Speichern exportiert: JSON mit meta und
source, LZMA-gepackt (Kopf mit bekannter Länge, wie LZMA-JS ihn schreibt).
Die LiDAR-Erweiterung (Matrix LiDAR Entfernung) muss nicht extra rein — die
Maqueen-Erweiterung bringt sie als Abhängigkeit mit.

Ein Export aus MakeCode (Zahnrad → Projekt speichern) ersetzt die Datei
genauso gut; build.py nimmt, was hier liegt.
"""
import json, lzma, os, struct

# Stand 28.10.2026, neueste Version der Erweiterung
MAQUEEN = "github:dfrobot/pxt-dfrobot_maqueenplus_v20#v2.2.29"
NAME = "Maqueen-Vorlage"

files = {
    "pxt.json": json.dumps({
        "name": NAME,
        "description": "",
        "dependencies": {"core": "*", "radio": "*", "microphone": "*", "maqueenPlusV2": MAQUEEN},
        "files": ["main.blocks", "main.ts", "README.md"],
        "preferredEditor": "blocksprj"}, indent=4),
    "main.blocks": ('<xml xmlns="https://developers.google.com/blockly/xml">'
                    '<block type="pxt-on-start" x="20" y="20"><statement name="HANDLER">'
                    '<block type="maqueenPlusV2_I2CInit"></block>'
                    '</statement></block></xml>'),
    "main.ts": "maqueenPlusV2.I2CInit()\n",
    "README.md": "",
}
project = {"meta": {"cloudId": "pxt/microbit", "editor": "blocksprj", "name": NAME},
           "source": json.dumps(files, indent=2)}

raw = json.dumps(project, indent=2).encode("utf-8")
dict_size = 1 << 20
body = lzma.compress(raw, format=lzma.FORMAT_RAW, filters=[
    {"id": lzma.FILTER_LZMA1, "dict_size": dict_size, "lc": 3, "lp": 0, "pb": 2}])
head = bytes([(2 * 5 + 0) * 9 + 3]) + struct.pack("<IQ", dict_size, len(raw))

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vorlage.mkcd")
open(out, "wb").write(head + body)
print("vorlage.mkcd  (%d Byte)" % (len(head) + len(body)))
