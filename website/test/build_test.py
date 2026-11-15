import json, lzma, os, struct, sys, tempfile, unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import build

ERW = "github:franc0r/pxt-francor-maqueen#v0.1.4"


def mkcd(files):
    """Schreibt eine .mkcd wie vorlage.py (LZMA alone) und gibt den Pfad zurück."""
    project = {"meta": {"cloudId": "pxt/microbit", "editor": "blocksprj", "name": "T"},
               "source": json.dumps(files)}
    raw = json.dumps(project).encode("utf-8")
    body = lzma.compress(raw, format=lzma.FORMAT_RAW, filters=[
        {"id": lzma.FILTER_LZMA1, "dict_size": 1 << 20, "lc": 3, "lp": 0, "pb": 2}])
    head = bytes([(2 * 5 + 0) * 9 + 3]) + struct.pack("<IQ", 1 << 20, len(raw))
    d = tempfile.mkdtemp()
    path = os.path.join(d, "t.mkcd")
    open(path, "wb").write(head + body)
    return path


def projekt(deps=None, files=None, extra=None):
    d = {"core": "*", "radio": "*", "microphone": "*", "francor-maqueen": ERW}
    if deps is not None:
        d = deps
    f = files if files is not None else ["main.blocks", "main.ts", "README.md"]
    out = {"pxt.json": json.dumps({"name": "T", "dependencies": d, "files": f}),
           "main.blocks": "<xml></xml>", "main.ts": "francorMaqueen.start()\n", "README.md": ""}
    out.update(extra or {})
    return out


class CheckVorlage(unittest.TestCase):
    def test_gute_vorlage(self):
        build.check_vorlage(mkcd(projekt()))

    def test_falsche_version(self):
        deps = {"core": "*", "francor-maqueen": ERW.replace("v0.1.4", "v0.1.3")}
        with self.assertRaises(SystemExit):
            build.check_vorlage(mkcd(projekt(deps=deps)))

    def test_dfrobot_verboten(self):
        deps = {"core": "*", "francor-maqueen": ERW,
                "maqueenPlusV2": "github:dfrobot/pxt-dfrobot_maqueenplus_v20#v2.2.29"}
        with self.assertRaises(SystemExit):
            build.check_vorlage(mkcd(projekt(deps=deps)))

    def test_custom_ts_verboten(self):
        with self.assertRaises(SystemExit):
            build.check_vorlage(mkcd(projekt(files=["main.blocks", "main.ts", "custom.ts"])))
        with self.assertRaises(SystemExit):
            build.check_vorlage(mkcd(projekt(extra={"custom.ts": "namespace x {}"})))

    def test_ohne_erweiterung(self):
        with self.assertRaises(SystemExit):
            build.check_vorlage(mkcd(projekt(deps={"core": "*", "radio": "*"})))

    def test_echte_vorlage(self):
        build.check_vorlage(build.VORLAGE)


if __name__ == "__main__":
    unittest.main()
