/* Maskottchen: Figur, Gespräch, Frage-Feld und LLM-Anbindung. */

/* ---------- Figur ---------- */
var MASKOTTCHEN_NAME = "Franco";

var figur = (function(){
  var el = document.getElementById("figur");
  var nameEl = document.getElementById("figurname");
  var pupillen = el ? el.querySelectorAll(".pupille") : [];
  var jubelTimer = null;
  var MAX = 3.2;                    // größter Blickausschlag in SVG-Einheiten
  if(nameEl) nameEl.textContent = MASKOTTCHEN_NAME;
  var svgEl = el ? el.querySelector("svg") : null;
  if(svgEl) svgEl.setAttribute("aria-label", MASKOTTCHEN_NAME + ", das FRANCOR-Maskottchen");
  // Handbuch: Stellen, die den Namen nennen
  var refs = document.querySelectorAll(".figurname-ref");
  for(var r = 0; r < refs.length; r++) refs[r].textContent = MASKOTTCHEN_NAME;

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
     S.fragen       Fragen dieses Teams an „Geht nicht“; ab LLM_FRAGEN_MAX kein LLM mehr
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

/* ---------- Vorlesen (Web Speech API, Standard aus, Schalter mgp-tts im Handbuch) ---------- */
function ttsAn(){
  try{ return localStorage.getItem("mgp-tts") === "1" && !!window.speechSynthesis && !!window.SpeechSynthesisUtterance; }catch(e){ return false; }
}
/* Satzgrenzen: Lookbehind nur, wo der Browser es kann */
var TTS_SATZ = null;
try{ TTS_SATZ = new RegExp("(?<=[.!?])\\s+"); }catch(e){ TTS_SATZ = /\s+/; }
/* html → Klartext (ohne Tags, ohne Blockbilder), in Sätzen der Reihe nach einreihen */
function vorlesen(html){
  if(!ttsAn()) return;
  try{
    var t = document.createElement("div");
    t.innerHTML = String(html).replace(/<br\s*\/?>/gi, " ");
    var bl = t.querySelectorAll(".mcstack, svg, script, style");
    for(var b = 0; b < bl.length; b++) bl[b].parentNode.removeChild(bl[b]);
    var text = (t.textContent || "").replace(/\s+/g, " ").replace(/^ | $/g, "");
    if(!text) return;
    var stimme = null, vs = window.speechSynthesis.getVoices() || [];
    for(var v = 0; v < vs.length; v++) if(/^de/i.test(vs[v].lang || "")){ stimme = vs[v]; break; }
    var saetze = text.split(TTS_SATZ);
    for(var i = 0; i < saetze.length; i++){
      if(!saetze[i]) continue;
      var u = new window.SpeechSynthesisUtterance(saetze[i]);
      u.lang = "de-DE";
      if(stimme) u.voice = stimme;
      window.speechSynthesis.speak(u);
    }
  }catch(e){}
}
/* neuer Schritt: Altes nicht mehr nachsprechen */
function vorlesenStopp(){
  try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}
}

/* Eine Blase anhängen. Bot-Blasen sind HTML aus dem Drehbuch (vertrauenswürdig),
   eigene Antworten („me“) sind Text. sprich: frisch gesprochene Blase, wird vorgelesen
   (nie beim Wiederzeigen des Verlaufs). */
function blase(st, html, me, sprich){
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
  if(sprich) vorlesen(html);
  return el;
}

/* Eine Karte anhängen: MakeCode-Knöpfe werden erzeugt, alle anderen Karten
   kommen aus dem versteckten Vorrat #karten (src/karten/*.html). Der Knoten wird
   umgehängt, nie geklont: Quiz und Figuren sind einmalig (IDs, Handler aus app.js).
   Unbekannte IDs ergeben einen leeren Rahmen. */
function karte(st, id){
  var el = document.createElement("div");
  el.className = "blase karte";
  el.setAttribute("data-k", id);
  chatEl.appendChild(el);
  var teil = id.split(":");
  if(teil[0] === "makecode"){
    if(MAKECODE_KNOEPFE[teil[1]]) el.innerHTML = MAKECODE_KNOEPFE[teil[1]];
    return el;
  }
  var k = document.querySelector('[data-karte="' + id + '"]');
  if(k){
    var alt = k.parentNode;
    el.appendChild(k);
    // Lag die Karte schon in einer älteren Blase, bleibt von der kein leerer Rahmen übrig
    if(alt && alt !== el && alt.classList && alt.classList.contains("blase") && !alt.firstChild && alt.parentNode) alt.parentNode.removeChild(alt);
  }
  return el;
}
/* Vor jedem Neuaufbau des Verlaufs: Karten zurück in den Vorrat, sonst gehen sie
   mit dem Löschen des Gesprächs verloren. */
function kartenZurueck(){
  var vorrat = document.getElementById("karten");
  var l = chatEl.querySelectorAll("[data-karte]");
  for(var i = 0; i < l.length; i++) vorrat.appendChild(l[i]);
}

function zeigeEintrag(st, e, sprich){
  return e.r === "karte" ? karte(st, e.k) : blase(st, e.h, e.r === "me", sprich);
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
  vorlesenStopp();
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
      var e = eintraege[j++], el = zeigeEintrag(st, e, true);
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
      knopf("data-frage", "", "Geht nicht", "sec");
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
  vorlesenStopp();
  clearTimeout(stupsTimer); stupsFuer = null;
  if(umweg && umweg.st !== st) umweg = null;
  gesprStation = st;
  wartetAufSicherheit = null;
  kartenZurueck();
  chatEl.innerHTML = "";
  antEl.innerHTML = "";
  figur.zustand("leerlauf");
  var d = DREHBUCH[st];
  var log = S.chat[st] || [];
  for(var k = 0; k < log.length; k++) zeigeEintrag(st, log[k]);
  if(!d || !d.schritte || !d.schritte.length){
    blase(st, "Diese Station schreibe ich gerade noch.");
    return;
  }
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
  stopSpiel(); clearTimeout(stupsTimer); vorlesenStopp();
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
  else if(b.hasAttribute("data-frage") || b.hasAttribute("data-nochfrage")) frageOeffnen(st);
});

/* ---------- Frage-Feld ---------- */
var RUECKFALL_TEXT = "Hm, da komm ich gerade nicht ran. Schaut mal hier rein, und wenn das nichts bringt: Wink den Betreuer her.";
var KONTINGENT_TEXT = "Mein Frage-Kontingent für dieses Team ist aufgebraucht — ab jetzt hilft der Betreuer.";
var LLM_FRAGEN_MAX = 30;         // Fragen je Team; danach nur noch Checkliste und Betreuer (bremst einen geleakten Schlüssel)

/* „Geht nicht“: Eingabefeld mit Vorschlagsfragen (Chips) des aktuellen Schritts */
function frageOeffnen(st){
  var i = aktSchritt(st), d = DREHBUCH[st];
  if(!d || i >= d.schritte.length) return;
  var chips = d.schritte[i].chips || [];
  clearTimeout(stupsTimer); stupsFuer = null;
  figur.zustand("sorge");
  antEl.innerHTML = "";
  var f = document.createElement("form");
  f.className = "frage"; f.id = "frage";
  var html = "";
  if(chips.length){
    html += '<div class="chips">';
    for(var k = 0; k < chips.length; k++) html += '<button type="button" class="chip">' + chips[k].replace(/&/g, "&amp;").replace(/</g, "&lt;") + '</button>';
    html += '</div>';
  }
  html += '<div class="frage-zeile"><input id="frageeingabe" type="text" maxlength="200" autocomplete="off" placeholder="Oder schreib selbst, was nicht geht">' +
          '<button type="submit">Fragen</button><button type="button" class="sec" data-zurueck>Doch nicht</button></div>';
  f.innerHTML = html;
  antEl.appendChild(f);
  f.addEventListener("click", function(e){
    var b = e.target.closest ? e.target.closest("button") : null;
    if(!b) return;
    if(b.classList.contains("chip")) fragen(st, b.textContent);
    else if(b.hasAttribute("data-zurueck")){ figur.zustand("leerlauf"); antworten(st, aktSchritt(st)); }
  });
  f.addEventListener("submit", function(e){
    e.preventDefault();
    fragen(st, document.getElementById("frageeingabe").value);
  });
  try{ document.getElementById("frageeingabe").focus({preventScroll:true}); }catch(x){}
  sichtbar(f);
}

/* Frage stellen: erst die Anfrage bauen (Verlauf noch ohne die neue Frage), dann die Frage loggen */
function fragen(st, text){
  text = String(text || "").replace(/^\s+|\s+$/g, "");
  if(!text) return;
  if((+S.fragen || 0) >= LLM_FRAGEN_MAX){
    sage(st, text);
    rueckfall(st, KONTINGENT_TEXT);
    return;
  }
  S.fragen = (+S.fragen || 0) + 1;   // gespeichert mit sage()
  var p = llmAntwort(st, text);
  sage(st, text);
  antEl.innerHTML = "";
  figur.zustand("gruebeln");
  var gen = S;   // „Neues Team“ ersetzt S: eine späte Antwort gehört dann nicht mehr ins neue Gespräch
  p.then(function(a){
    zaehlerPlus(a.usage);
    return { ok:true, text:a.text };
  }, function(){
    return { ok:false };
  }).then(function(r){
    if(S !== gen) return;
    if(r.ok) llmFertig(st, r.text); else rueckfall(st);
  }).catch(function(){
    if(S === gen) rueckfall(st);
  });
}

/* wieder die Antwortknöpfe des Schritts, dazu „Noch eine Frage“ */
function nachFrage(st){
  if(gesprStation !== st) return;
  figur.zustand("leerlauf");
  var i = aktSchritt(st);
  antworten(st, i);
  if(i < DREHBUCH[st].schritte.length) knopf("data-nochfrage", "", "Noch eine Frage", "sec");
}
/* Antworten des Modells sind Text, nie HTML */
function llmFertig(st, text){
  var h = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
  logPush(st, {r:"bot", h:h});
  if(gesprStation !== st) return;
  sichtbar(blase(st, h, false, true));
  nachFrage(st);
}
/* kein Schlüssel, kein Netz, Fehler, Zeitüberschreitung, Kontingent aufgebraucht: Checkliste der Station */
function rueckfall(st, text){
  text = text || RUECKFALL_TEXT;
  logPush(st, {r:"bot", h:text});
  // dieselbe Karte nicht noch einmal ins Log, wenn sie die letzte Karte im Verlauf ist (Fragen dazwischen zählen nicht)
  var log = S.chat[st] || [], j = log.length - 1, id = "k" + st + "-klemmt";
  while(j >= 0 && (log[j].r === "me" || (log[j].r === "bot" && (log[j].h === RUECKFALL_TEXT || log[j].h === KONTINGENT_TEXT)))) j--;
  var neu = !(j >= 0 && log[j].r === "karte" && log[j].k === id);
  if(neu) logPush(st, {r:"karte", k:id});
  if(gesprStation !== st) return;
  blase(st, text);
  if(neu) sichtbar(karte(st, id));
  nachFrage(st);
}

/* ---------- LLM (OpenRouter) ---------- */
var LLM_URL = "https://openrouter.ai/api/v1/chat/completions";
var LLM_MODELL = "anthropic/claude-haiku-4.5";
var LLM_MAX_TOKENS = 200;
var LLM_TIMEOUT_MS = 15000;
var LLM_CENT_PRO_MTOKEN = {ein: 100, aus: 500};   // Schätzung, nur für die Anzeige
var LLM_KONTEXT_ZEICHEN = 6000;                   // ≈ 2000 Token bei etwa 3 Zeichen je Token (Deutsch)
var LLM_VERLAUF = 4;                              // so viele Verlaufseinträge gehen mit (als Mitschrift in der Frage)

function ohneHtml(h){
  return String(h).replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").replace(/^ | $/g, "");
}
function kuerze(t, n){ return t.length > n ? t.slice(0, n - 1) + "…" : t; }
function schrittText(s){
  var t = [];
  for(var k = 0; k < s.nachrichten.length; k++) if(typeof s.nachrichten[k] === "string") t.push(ohneHtml(s.nachrichten[k]));
  return t.join(" ");
}

/* System-Prompt: feste Regeln, Drehbuch der Station in Kurzform, aktueller Schritt.
   Zusammen bleibt es unter LLM_KONTEXT_ZEICHEN, 2000 Zeichen bleiben für die Mitschrift (4 × 400 plus Namen) und die Frage (400) frei. */
function systemPrompt(st){
  var d = DREHBUCH[st], i = aktSchritt(st);
  var p = "Du bist " + MASKOTTCHEN_NAME + ", das Maskottchen des Robotik-Workshops von FRANCOR e. V. " +
    "Du sprichst Deutsch, Du-Form, kurze Sätze, Klasse 7, frech und freundlich. " +
    "Du kennst nur diesen Workshop: micro:bit V2, Maqueen Plus V3, MakeCode mit Blöcken. " +
    "Blocknamen nimmst du wörtlich aus dem Drehbuch, nie erfunden. Höchstens drei Sätze. Du schreibst nie Textcode. " +
    "Bei Hardware-Gefahr (Kabel, Akku, Hitze) und bei allem, was nicht zum Workshop gehört, verweist du freundlich auf die Betreuenden.";
  if(!d || !d.schritte) return p;
  var aktuell = i < d.schritte.length ? d.schritte[i] : null;
  var ende = aktuell ? "\n\nAktueller Schritt (" + (aktuell.titel || aktuell.id) + "): " + kuerze(schrittText(aktuell), 600) : "";
  var platz = LLM_KONTEXT_ZEICHEN - 2000 - p.length - ende.length - 120;
  var kurz = "";
  for(var k = 0; k < d.schritte.length; k++){
    var z = (k + 1) + ". " + (d.schritte[k].titel || d.schritte[k].id) + ": " + kuerze(schrittText(d.schritte[k]), 300) + "\n";
    if(kurz.length + z.length > platz) break;
    kurz += z;
  }
  return p + "\n\nDrehbuch der Station " + st + " (" + d.name + "):\n" + kurz + ende;
}

/* letzte Textbeiträge des Verlaufs als kurze Mitschrift „Franco: … / Team: …“ (Karten übersprungen).
   Sie steht in der einen user-Nachricht: Die Anfrage ist immer [system, user], so verlangen es
   Anthropic-Modelle (erste Nachricht nach system ist user, Rollen wechseln sich ab).
   Bot-Blasen sind HTML und werden entschärft, eigene Antworten („me“) sind schon Text. */
function llmVerlauf(st){
  var log = S.chat[st] || [], aus = [];
  for(var k = log.length - 1; k >= 0 && aus.length < LLM_VERLAUF; k--){
    var e = log[k];
    if(e.r !== "bot" && e.r !== "me") continue;
    aus.unshift((e.r === "me" ? "Team: " : MASKOTTCHEN_NAME + ": ") + kuerze(e.r === "me" ? String(e.h) : ohneHtml(e.h), 400));
  }
  return aus;
}
function llmFrage(st, text){
  var v = llmVerlauf(st), f = kuerze(text, 400);
  return v.length ? "Bisher im Gespräch:\n" + v.join("\n") + "\n\nFrage des Teams: " + f : f;
}

/* Promise<{text, usage}>. Jeder Fehler (kein Schlüssel, kein Netz, Status, Zeit, kaputtes JSON) wird zur Ablehnung. */
function llmAntwort(st, text){
  return new Promise(function(ok, nein){
    var key = "";
    try{ key = localStorage.getItem("mgp-key") || ""; }catch(e){}
    if(!key){ nein(new Error("kein Schlüssel")); return; }
    var ctl = typeof AbortController === "function" ? new AbortController() : null;
    var uhr = setTimeout(function(){ if(ctl) ctl.abort(); nein(new Error("Zeit")); }, LLM_TIMEOUT_MS);
    var msgs = [{role:"system", content: systemPrompt(st)}, {role:"user", content: llmFrage(st, text)}];
    fetch(LLM_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json", "Authorization":"Bearer " + key},
      body: JSON.stringify({model: LLM_MODELL, max_tokens: LLM_MAX_TOKENS, messages: msgs}),
      signal: ctl ? ctl.signal : undefined
    }).then(function(res){
      if(!res.ok) throw new Error("Status " + res.status);
      return res.json();
    }).then(function(j){
      var t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      if(typeof t !== "string" || !t.replace(/\s/g, "")) throw new Error("leer");
      clearTimeout(uhr);
      ok({text: t, usage: j.usage});
    }).catch(function(err){ clearTimeout(uhr); nein(err); });
  });
}

/* ---------- Zähler und Schlüssel (Handbuch) ---------- */
function zaehlerLesen(){
  var z = {anfragen:0, ein:0, aus:0};
  try{
    var j = JSON.parse(localStorage.getItem("mgp-llm"));
    if(j && typeof j === "object"){ z.anfragen = +j.anfragen || 0; z.ein = +j.ein || 0; z.aus = +j.aus || 0; }
  }catch(e){}
  return z;
}
function zaehlerPlus(usage){
  var z = zaehlerLesen();
  z.anfragen++;
  if(usage){ z.ein += +usage.prompt_tokens || 0; z.aus += +usage.completion_tokens || 0; }
  try{ localStorage.setItem("mgp-llm", JSON.stringify(z)); }catch(e){}
  zaehlerAnzeigen();
}
function zaehlerAnzeigen(){
  var el = document.getElementById("llmzaehler");
  if(!el) return;
  var z = zaehlerLesen();
  var cent = (z.ein * LLM_CENT_PRO_MTOKEN.ein + z.aus * LLM_CENT_PRO_MTOKEN.aus) / 1000000;
  el.textContent = z.anfragen + (z.anfragen === 1 ? " Anfrage" : " Anfragen") + " · ca. " + (Math.round(cent * 100) / 100).toString().replace(".", ",") + " Cent";
}
function schluesselAnzeigen(){
  var el = document.getElementById("orkeystate");
  if(!el) return;
  var k = "";
  try{ k = localStorage.getItem("mgp-key") || ""; }catch(e){}
  el.textContent = k ? "Schlüssel gesetzt" : "kein Schlüssel";
}
(function(){
  var cb = document.getElementById("coachbtn"), sv = document.getElementById("orkeysave"),
      rs = document.getElementById("llmreset"), del = document.getElementById("orkeydel"),
      inp = document.getElementById("orkey");
  var tb = document.getElementById("ttsbox");
  function ttsLesen(){
    if(!tb) return;
    var an = false;
    try{ an = localStorage.getItem("mgp-tts") === "1"; }catch(e){}
    tb.checked = an;
  }
  if(tb) tb.addEventListener("change", function(){
    try{ localStorage.setItem("mgp-tts", tb.checked ? "1" : "0"); }catch(e){}
    if(!tb.checked) vorlesenStopp();
  });
  function frisch(){ zaehlerAnzeigen(); schluesselAnzeigen(); ttsLesen(); }
  if(cb) cb.addEventListener("click", frisch);
  // Fenster „LLM Setup“: Knopf in der Kopfzeile; Escape, Klick daneben
  // und „Schließen“ machen es wieder zu. Gespeichert wird wie bisher in mgp-key.
  var kd = document.getElementById("keydlg"), kb = document.getElementById("keybtn"), kok = document.getElementById("keydlgok");
  function keydlgZeigen(v){
    if(!kd) return;
    kd.hidden = !v;
    if(v){ schluesselAnzeigen(); if(inp){ inp.value = ""; inp.focus({preventScroll:true}); } }
  }
  if(kb) kb.addEventListener("click", function(){ keydlgZeigen(true); });
  if(kok) kok.addEventListener("click", function(){ keydlgZeigen(false); });
  if(kd){
    kd.addEventListener("click", function(e){ if(e.target === kd) keydlgZeigen(false); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !kd.hidden) keydlgZeigen(false); });
    if(inp) inp.addEventListener("keydown", function(e){ if(e.key === "Enter" && sv) sv.click(); });
  }
  if(sv) sv.addEventListener("click", function(){
    var v = inp.value.replace(/^\s+|\s+$/g, "");
    if(!v) return;
    try{ localStorage.setItem("mgp-key", v); }catch(e){}
    inp.value = "";
    schluesselAnzeigen();
  });
  if(del) del.addEventListener("click", function(){
    try{ localStorage.removeItem("mgp-key"); }catch(e){}
    schluesselAnzeigen();
  });
  if(rs) rs.addEventListener("click", function(){
    try{ localStorage.removeItem("mgp-llm"); }catch(e){}
    zaehlerAnzeigen();
  });
  frisch();
})();

/* ---------- Testhaken (nur beim Doppelklick-Öffnen, nicht auf GitHub Pages) ----------
   Der Smoketest holt damit Karten ins Gespräch, ohne ein Drehbuch durchzuspielen. */
if(location.protocol === "file:"){
  window.__karte = function(st, id){ karte(st, id); logPush(st, {r:"karte", k:id}); };
  window.__drehbuchMin = (function(){
    var l = [];
    for(var i = 0; i < STATIONS.length; i++) l.push(DREHBUCH[i] ? DREHBUCH[i].min : null);
    return l;
  })();
}
