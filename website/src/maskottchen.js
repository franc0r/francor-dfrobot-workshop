/* Maskottchen: Figur und Gespräch. Der Ablauf (Frage-Feld, LLM) folgt in den nächsten Aufgaben. */

/* ---------- Figur ---------- */
var MASKOTTCHEN_NAME = "Franco";

var figur = (function(){
  var el = document.getElementById("figur");
  var nameEl = document.getElementById("figurname");
  var pupillen = el ? el.querySelectorAll(".pupille") : [];
  var jubelTimer = null;
  var MAX = 3.2;                    // größter Blickausschlag in SVG-Einheiten
  if(nameEl) nameEl.textContent = MASKOTTCHEN_NAME;

  function zustand(name){
    if(!el) return;
    clearTimeout(jubelTimer);
    el.setAttribute("data-zustand", name);
    // Jubel ist ein Hüpfer, danach wieder Ruhe
    if(name === "jubel") jubelTimer = setTimeout(function(){ el.setAttribute("data-zustand", "leerlauf"); }, 900);
  }

  function schauen(clientX, clientY){
    if(!el) return;
    var r = el.querySelector("svg").getBoundingClientRect();
    var dx = clientX - (r.left + r.width / 2);
    var dy = clientY - (r.top + r.height / 2);
    var len = Math.sqrt(dx * dx + dy * dy);
    if(len > MAX){ dx = dx / len * MAX; dy = dy / len * MAX; }
    var t = "translate(" + dx.toFixed(2) + " " + dy.toFixed(2) + ")";
    for(var i = 0; i < pupillen.length; i++) pupillen[i].setAttribute("transform", t);
  }

  function zuElement(ziel){
    if(!ziel) return;
    var r = ziel.getBoundingClientRect();
    schauen(r.left + r.width / 2, r.top + r.height / 2);
  }

  document.addEventListener("mousemove", function(e){ schauen(e.clientX, e.clientY); }, {passive:true});
  document.addEventListener("touchstart", function(e){
    var t = e.touches && e.touches[0];
    if(t) schauen(t.clientX, t.clientY);
  }, {passive:true});

  return { zustand: zustand, schauen: schauen, zuElement: zuElement };
})();

/* ---------- Gespräch ----------
   Jede Station ist ein Drehbuch in src/drehbuch/NN-name.js:
     DREHBUCH[N] = { name, min, badge, titel, schritte:[ {
       id:"projekt",            eindeutig je Station
       bonus:false,             true = Zugabe: erst „Machen wir!“ / „Überspringen“
       titel:"Würfel",          nur bei Bonus, optional: Text für „Extra: …“ (sonst die id)
       nachrichten:[ "Text mit <b>HTML</b>", {karte:"k4-bloecke"} ],
       zeig:{ "Zeig mir wo":[ "…", {karte:"makecode:vorlage"} ] },   optional
       chips:[ "…", "…", "…" ],   3–4 Vorschlagsfragen für „Geht nicht“
       fertig:"Hab ich ✓" } ] }
   Gespeichert in S:
     S.schritt[st]  Index des aktuellen Schritts; = Anzahl Schritte heißt: Station fertig
     S.chat[st]     Verlauf: {r:"bot", h:html} · {r:"me", h:text} · {r:"karte", k:id}
                    („me“ kann ja:"id" tragen: Bonus-Schritt id ist angenommen)
     S.skip["st:id"] = 1   Bonus übersprungen; bleibt als „Extra: …“ erreichbar
   Die Figur spricht von selbst nur beim Schrittwechsel, danach nur auf Klick.
   Einzige Ausnahme ist der Stups nach STUPS_MS ohne Klick, einmal je Schritt. */
var TIPP_MS = 700;               // Abstand zwischen zwei Blasen (Tipp-Effekt)
var STUPS_MS = 180000;           // drei Minuten ohne Klick im Gespräch
var STUPS_TEXT = "Alles gut bei euch? Ich bin hier, wenn ihr mich braucht.";
var gespraechEl = document.getElementById("gespraech");
var chatEl = document.getElementById("chat");
var antEl = document.getElementById("antworten");
var gesprStation = null;         // Station, die gerade im Gespräch steht
var spielTimer = null;           // nächste Blase beim Abspielen
var stupsTimer = null, stupsFuer = null;
var stupsGemacht = {};           // "st:i" → 1, nur im Speicher
var wartetAufSicherheit = null;  // Station, deren erster Schritt nach dem Sicherheitsfenster startet
var umweg = null;                // {st, i}: ein Extra-Schritt läuft, danach weiter beim alten Stand

/* MakeCode-Knöpfe. build.py ersetzt genau diese href-Texte durch die echten Links. */
var MAKECODE_KNOEPFE = {
  neu: '<a class="btn" href="makecode:neu" target="_blank" rel="noopener">Neues Projekt starten</a>',
  vorlage: '<a class="btn" href="makecode:vorlage" target="_blank" rel="noopener">Neues Roboter-Projekt starten</a>'
};

function tippMs(){ return reduced() ? 0 : TIPP_MS; }
function sichtbar(el){
  try{ el.scrollIntoView({block:"nearest", behavior: reduced() ? "auto" : "smooth"}); }catch(e){}
}

/* Eine Blase anhängen. Bot-Blasen sind HTML aus dem Drehbuch (vertrauenswürdig),
   eigene Antworten („me“) sind Text. */
function blase(st, html, me){
  var el = document.createElement("div");
  el.className = "blase" + (me ? " me" : "");
  el.setAttribute("data-st", st);
  chatEl.appendChild(el);
  if(me){ el.textContent = html; return el; }
  el.innerHTML = html;
  var leds = el.querySelectorAll("[data-led]");
  for(var k = 0; k < leds.length; k++) leds[k].outerHTML = ledIcon(leds[k].getAttribute("data-led"));
  // erst im Dokument, damit nestStack die Blockfarbe lesen kann
  var stapel = el.querySelectorAll(".mcstack");
  for(var m = 0; m < stapel.length; m++) nestStack(stapel[m]);
  return el;
}

/* Eine Karte anhängen. Hier nur die MakeCode-Knöpfe; die übrigen Karten
   kommen aus dem Vorrat #karten (nächste Aufgabe), bis dahin ein leerer Rahmen. */
function karte(st, id){
  var el = document.createElement("div");
  el.className = "blase karte";
  el.setAttribute("data-k", id);
  var teil = id.split(":");
  if(teil[0] === "makecode" && MAKECODE_KNOEPFE[teil[1]]) el.innerHTML = MAKECODE_KNOEPFE[teil[1]];
  chatEl.appendChild(el);
  return el;
}

function zeigeEintrag(st, e){
  return e.r === "karte" ? karte(st, e.k) : blase(st, e.h, e.r === "me");
}
function logPush(st, eintrag){
  if(!S.chat[st]) S.chat[st] = [];
  S.chat[st].push(eintrag);
  save();
}
/* eigene Antwort: in den Verlauf und gleich als Blase zeigen */
function sage(st, text, ja){
  var e = {r:"me", h:text};
  if(ja) e.ja = ja;
  logPush(st, e);
  sichtbar(blase(st, text, true));
}

function stopSpiel(){ clearTimeout(spielTimer); spielTimer = null; }
function aktSchritt(st){ return umweg && umweg.st === st ? umweg.i : S.schritt[st]; }
function istUmweg(st, i){ return !!(umweg && umweg.st === st && umweg.i === i); }
/* Bonus angenommen? Steht als ja:id an einer eigenen Antwort im Verlauf. */
function entschieden(st, s){
  var log = S.chat[st] || [];
  for(var k = 0; k < log.length; k++) if(log[k].ja === s.id) return true;
  return false;
}

/* Nachrichten nacheinander zeigen. Sie stehen sofort vollständig im Verlauf,
   damit ein Neuladen mitten im Tippen nichts verliert und nichts doppelt zeigt. */
function spielNachrichten(st, liste, danach){
  stopSpiel();
  clearTimeout(stupsTimer); stupsFuer = null;
  antEl.innerHTML = "";
  if(!S.chat[st]) S.chat[st] = [];
  var eintraege = [];
  for(var k = 0; k < liste.length; k++){
    var n = liste[k];
    var e = typeof n === "string" ? {r:"bot", h:n} : {r:"karte", k:n.karte};
    eintraege.push(e);
    S.chat[st].push(e);
  }
  save();
  figur.zustand("reden");
  var j = 0;
  function naechste(){
    if(j < eintraege.length){
      var e = eintraege[j++], el = zeigeEintrag(st, e);
      sichtbar(el);
      if(e.r === "karte") figur.zuElement(el);
      if(tippMs()){ spielTimer = setTimeout(naechste, tippMs()); return; }
      naechste();
      return;
    }
    spielTimer = null;
    figur.zustand("leerlauf");
    danach();
  }
  naechste();
}

/* Schritt i: Die Figur spricht ihn von vorn bis zu den Antwortknöpfen. */
function spielSchritt(st, i){
  var s = DREHBUCH[st].schritte[i];
  if(!istUmweg(st, i)) S.schritt[st] = i;   // gespeichert in spielNachrichten
  var liste = s.nachrichten.slice();
  if(s.bonus && !entschieden(st, s)) liste.push("Lust auf Extra? Sonst geht's weiter.");
  spielNachrichten(st, liste, function(){ antworten(st, i); });
}

function knopf(attr, wert, text, klasse){
  var b = document.createElement("button");
  b.type = "button";
  if(klasse) b.className = klasse;
  b.setAttribute(attr, wert);
  b.textContent = text;
  antEl.appendChild(b);
  return b;
}

/* Antwortknöpfe zu Schritt i. i = Anzahl Schritte heißt: Station fertig. */
function antworten(st, i){
  var d = DREHBUCH[st];
  antEl.innerHTML = "";
  if(i >= d.schritte.length){
    if(st < STATIONS.length - 1) knopf("data-go", String(st + 1), "Weiter zu Station " + (st + 1) + " →");
    else knopf("data-abschluss", "", "Workshop abschließen ✓");
  } else {
    var s = d.schritte[i];
    if(s.bonus && !entschieden(st, s) && !istUmweg(st, i)){
      knopf("data-machen", "", "Machen wir!");
      knopf("data-skip", "", "Überspringen", "sec");
    } else {
      knopf("data-fertig", "", s.fertig);
      for(var key in (s.zeig || {})) knopf("data-zeig", key, key, "sec");
      knopf("data-frage", "", "Geht nicht", "sec");   // Frage-Feld folgt in der nächsten Aufgabe
    }
  }
  // übersprungene Zugaben bleiben erreichbar
  for(var j = 0; j < d.schritte.length; j++){
    var x = d.schritte[j];
    if(S.skip[st + ":" + x.id] && !istUmweg(st, j)) knopf("data-extra", x.id, "Extra: " + (x.titel || x.id), "extra");
  }
  stupsStart(st, i);
}

/* Nach „fertig“ oder „Überspringen“: nächster Schritt oder Abzeichen. */
function weiterNach(st, i){
  var d = DREHBUCH[st];
  if(i + 1 < d.schritte.length){ spielSchritt(st, i + 1); return; }
  S.schritt[st] = d.schritte.length;
  complete(st);   // wirkt nur einmal je Station
  spielNachrichten(st, ["Das Abzeichen <b>" + d.badge + "</b> gehört euch!"], function(){
    figur.zustand("jubel");
    antworten(st, d.schritte.length);
  });
}

function fertig(st){
  var i = aktSchritt(st), s = DREHBUCH[st].schritte[i];
  sage(st, s.fertig);
  if(s.bonus){ S.bonus[s.id] = 1; save(); }
  if(istUmweg(st, i)){
    // Extra erledigt: zurück zum alten Stand, ohne etwas neu abzuspielen
    umweg = null;
    delete S.skip[st + ":" + s.id];
    save();
    figur.zustand("jubel");
    antworten(st, S.schritt[st]);
    return;
  }
  weiterNach(st, i);
}

function ueberspringen(st){
  var i = S.schritt[st], s = DREHBUCH[st].schritte[i];
  sage(st, "Überspringen");
  S.skip[st + ":" + s.id] = 1;
  weiterNach(st, i);   // speichert
}

function machen(st){
  var i = S.schritt[st], s = DREHBUCH[st].schritte[i];
  sage(st, "Machen wir!", s.id);
  antworten(st, i);
}

/* Übersprungene Zugabe nachholen. S.skip bleibt stehen, bis sie erledigt ist,
   damit ein Neuladen mittendrin sie nicht verliert. */
function extra(st, id){
  var d = DREHBUCH[st];
  for(var j = 0; j < d.schritte.length; j++){
    if(d.schritte[j].id !== id) continue;
    umweg = {st:st, i:j};
    sage(st, "Extra: " + (d.schritte[j].titel || id), id);
    spielSchritt(st, j);
    return;
  }
}

function zeigMir(st, key){
  var i = aktSchritt(st), s = DREHBUCH[st].schritte[i];
  if(!s.zeig || !s.zeig[key]) return;
  sage(st, key);
  spielNachrichten(st, s.zeig[key], function(){ antworten(st, i); });
}

/* Station ins Gespräch holen: Verlauf sofort, dann die Knöpfe des aktuellen
   Schritts. Nur beim allerersten Besuch spricht die Figur Schritt 0. */
function gesprZeige(st){
  stopSpiel();
  clearTimeout(stupsTimer); stupsFuer = null;
  if(umweg && umweg.st !== st) umweg = null;
  gesprStation = st;
  wartetAufSicherheit = null;
  chatEl.innerHTML = "";
  antEl.innerHTML = "";
  figur.zustand("leerlauf");
  var d = DREHBUCH[st];
  if(!d || !d.schritte || !d.schritte.length){
    blase(st, "Diese Station schreibe ich gerade noch.");
    return;
  }
  var log = S.chat[st] || [];
  for(var k = 0; k < log.length; k++) zeigeEintrag(st, log[k]);
  if(S.schritt[st] === undefined){
    // unter dem Sicherheitsfenster hört keiner zu: erst danach begrüßen
    if(document.body.classList.contains("safety-on")){ wartetAufSicherheit = st; return; }
    spielSchritt(st, 0);
    return;
  }
  antworten(st, umweg ? umweg.i : Math.min(S.schritt[st], d.schritte.length));
}

/* vom Sicherheitsfenster gerufen, sobald es zu ist */
function gesprSicherheitZu(){
  var st = wartetAufSicherheit;
  wartetAufSicherheit = null;
  if(st !== null && st === gesprStation && S.schritt[st] === undefined) spielSchritt(st, 0);
}

/* „Neues Team“: alles Flüchtige vergessen (S selbst setzt app.js zurück) */
function gesprZuruecksetzen(){
  stopSpiel(); clearTimeout(stupsTimer);
  stupsGemacht = {}; stupsFuer = null; umweg = null; wartetAufSicherheit = null;
}

/* ---------- Stups ---------- */
function stupsStart(st, i){
  clearTimeout(stupsTimer);
  stupsFuer = null;
  if(i >= DREHBUCH[st].schritte.length || stupsGemacht[st + ":" + i]) return;
  stupsFuer = {st:st, i:i};
  stupsTimer = setTimeout(function(){
    stupsFuer = null;
    if(gesprStation !== st || spielTimer) return;
    stupsGemacht[st + ":" + i] = 1;
    // nur im Bild, nicht im Verlauf: Der Stups gehört nicht zum Gespräch
    sichtbar(blase(st, STUPS_TEXT));
  }, STUPS_MS);
}

/* ---------- Antworten (Klicks) ---------- */
gespraechEl.addEventListener("click", function(){
  // jeder Klick im Gespräch schiebt den Stups auf
  if(stupsFuer) stupsStart(stupsFuer.st, stupsFuer.i);
});

antEl.addEventListener("click", function(e){
  var b = e.target.closest ? e.target.closest("button") : null;
  if(!b || gesprStation === null) return;
  var st = gesprStation;
  if(b.hasAttribute("data-fertig")) fertig(st);
  else if(b.hasAttribute("data-zeig")) zeigMir(st, b.getAttribute("data-zeig"));
  else if(b.hasAttribute("data-machen")) machen(st);
  else if(b.hasAttribute("data-skip")) ueberspringen(st);
  else if(b.hasAttribute("data-extra")) extra(st, b.getAttribute("data-extra"));
  else if(b.hasAttribute("data-go")){ go(Number(b.getAttribute("data-go"))); timerAutoStart(); }
  else if(b.hasAttribute("data-abschluss")){
    var ft = document.getElementById("finaltitle");
    if(ft) ft.textContent = "Workshop geschafft!";
    paintProgress();
    figur.zustand("jubel");
  }
  // data-frage („Geht nicht“): Frage-Feld folgt in der nächsten Aufgabe
});
