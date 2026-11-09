(function(){
"use strict";

/* ================= state ================= */
var KEY = "mgp-v1";
var STATIONS = [
  {n:"Boxenstopp", m:"5 Min", badge:"Rookie"},
  {n:"Erster Kontakt", m:"13 Min", badge:"Ersteinschalter"},
  {n:"micro:bit allein", m:"15 Min", badge:"Pixelkünstler"},
  {n:"Fahrschule", m:"14 Min", badge:"Fahrlehrer"},
  {n:"Augen", m:"18 Min", badge:"Spurhalter"},
  {n:"Reflexe", m:"10 Min", badge:"Bremsassistent"},
  {n:"Grand Prix", m:"30 Min", badge:"Champion"}
];
var S = {done:[], quiz:{}, bonus:{}, cur:0, safe:false};

function load(){
  try{
    var raw = localStorage.getItem(KEY);
    if(raw){ var o = JSON.parse(raw); if(o && typeof o==="object"){ for(var k in S){ if(o[k]!==undefined) S[k]=o[k]; } } }
  }catch(e){}
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }

/* ================= chrome ================= */
var rail = document.getElementById("rail");
var railfoot = rail.querySelector(".railfoot");
var badgesEl = document.getElementById("badges");
var progfill = document.getElementById("progfill");

function paintProgress(){
  var pct = Math.round(S.done.length / STATIONS.length * 100);
  progfill.style.width = pct + "%";
  var ft = document.getElementById("finalwho");
  if(ft) ft.textContent = S.done.length + " von " + STATIONS.length + " Abzeichen";
  var fb = document.getElementById("finalbadges");
  if(fb){
    fb.innerHTML = "";
    STATIONS.forEach(function(st,i){
      if(S.done.indexOf(i) > -1){
        var p = document.createElement("span"); p.className="pill"; p.textContent = st.badge; fb.appendChild(p);
      }
    });
  }
}
function paintBadges(){
  badgesEl.innerHTML = "";
  STATIONS.forEach(function(st,i){
    var b = document.createElement("span");
    b.className = "badge" + (S.done.indexOf(i)>-1 ? " on" : "");
    b.textContent = st.badge;
    badgesEl.appendChild(b);
  });
}
/* Die Stückliste ist keine Station: kein Zähler, keine Minuten, kein Abzeichen.
   Sie hängt als Seite „teile“ oben in der Leiste und ist für die, die nach dem
   Workshop fragen, wo es den Roboter gibt. */
function buildRail(){
  var pg = document.createElement("button");
  pg.type = "button"; pg.className = "stepbtn page"; pg.dataset.go = "teile";
  pg.innerHTML = '<span class="num">i</span><span class="lbl">Stückliste<span class="min">für zu Hause</span></span>';
  pg.addEventListener("click", function(){ go("teile"); });
  rail.insertBefore(pg, rail.firstElementChild);
  STATIONS.forEach(function(st,i){
    var b = document.createElement("button");
    b.type = "button"; b.className = "stepbtn"; b.dataset.go = i;
    b.innerHTML = '<span class="num">'+i+'</span><span class="lbl">'+st.n+'<span class="min">'+st.m+'</span></span>';
    b.addEventListener("click", function(){ go(i); if(i > 0) timerAutoStart(); });
    rail.insertBefore(b, railfoot);
  });
}
function paintRail(){
  var btns = rail.querySelectorAll(".stepbtn");
  for(var i=0;i<btns.length;i++){
    var idx = btns[i].dataset.go;
    btns[i].setAttribute("aria-current", idx === String(S.cur) ? "true" : "false");
    if(btns[i].classList.contains("page")) continue;
    idx = Number(idx);
    btns[i].classList.toggle("done", S.done.indexOf(idx) > -1);
    if(S.done.indexOf(idx) > -1) btns[i].querySelector(".num").textContent = "✓";
    else btns[i].querySelector(".num").textContent = idx;
  }
}
function go(i){
  S.cur = i; save();
  var secs = document.querySelectorAll(".station");
  for(var k=0;k<secs.length;k++){ secs[k].hidden = secs[k].dataset.st !== String(i); }
  paintRail(); paintProgress();
  window.scrollTo({top:0, behavior: reduced() ? "auto" : "smooth"});
}
function reduced(){ try{ return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){ return false; } }

function complete(i){
  if(S.done.indexOf(i) === -1) S.done.push(i);
  paintRail(); paintBadges(); paintProgress(); save();
}

document.addEventListener("click", function(e){
  var g = e.target.closest ? e.target.closest("main [data-go]") : null;
  if(g){ go(g.dataset.go === "teile" ? "teile" : Number(g.dataset.go)); return; }
  var b = e.target.closest ? e.target.closest("[data-next]") : null;
  if(!b) return;
  var v = b.dataset.next;
  var cur = Number(b.closest(".station").dataset.st);
  if(v === "done"){
    complete(cur);
    document.getElementById("finaltitle").textContent = "Workshop geschafft!";
    paintProgress();
    return;
  }
  var t = Number(v);
  if(t > cur) complete(cur);
  go(t);
  if(t > 0) timerAutoStart();
});

/* ================= bonus (Team-Challenges, selbst abgehakt) ================= */
document.querySelectorAll("[data-bonus]").forEach(function(btn){
  var id = btn.dataset.bonus, label = btn.innerHTML;
  btn.paintBonus = function(){
    btn.disabled = !!S.bonus[id];
    if(S.bonus[id]) btn.textContent = "✓ Erledigt"; else btn.innerHTML = label;
  };
  btn.paintBonus();
  btn.addEventListener("click", function(){
    if(S.bonus[id]) return;
    S.bonus[id] = 1; save(); btn.paintBonus();
  });
});

/* ================= quiz ================= */
document.querySelectorAll(".quiz").forEach(function(q){
  var id = q.dataset.quiz, ans = q.dataset.answer;
  var fb = q.querySelector(".qfb");
  var FB = {
    q0: "Richtig. Der Summer <em>erzeugt</em> etwas – er ist ein Aktor, kein Sensor. Sensoren nehmen auf, Aktoren geben aus.",
    q1: "Richtig. Der Code liegt im Flash-Speicher des micro:bit – wie eine App auf dem Handy. Er überlebt jedes Ausschalten.",
    q2: "Richtig. Der Computer tut genau das, was da steht – steht eine 4 im Block, zeigt er eine 4. Erst der Block <kbd>wähle eine zufällige Zahl</kbd> macht daraus einen Würfel. Merkt euch: Wenn etwas immer dasselbe tut, liegt es fast nie am Schütteln.",
    q3: "Richtig. Niedriger Wert = wenig Licht kommt zurück = schwarz. Nur der mittlere Sensor sieht die Linie, also liegt sie mittig.",
    q4: "Richtig. Ein Sensor ist nur nützlich, wenn er ständig gelesen wird. Der <kbd>dauerhaft</kbd>-Block macht daraus einen Regelkreis."
  };
  q.querySelectorAll(".opt").forEach(function(o){
    o.addEventListener("click", function(){
      if(q.dataset.locked === "1") return;
      var right = o.dataset.k === ans;
      o.classList.add(right ? "right" : "wrong");
      if(right){
        q.dataset.locked = "1";
        q.querySelectorAll(".opt").forEach(function(x){ if(x!==o) x.style.opacity = ".45"; });
        fb.innerHTML = FB[id] || "Richtig!";
        fb.hidden = false;
        if(!S.quiz[id]){ S.quiz[id] = 1; save(); }
      } else {
        fb.innerHTML = "Nicht ganz – denk nochmal nach und probier eine andere Antwort.";
        fb.hidden = false;
      }
    });
  });
});

/* ================= timer ================= */
var TOTAL = 120*60, left = TOTAL, running = false, tick = null, tStarted = false;
var tval = document.getElementById("tval"), tbtn = document.getElementById("tbtn"), tbox = document.getElementById("timer");
function fmt(s){ var m = Math.floor(s/60), r = s%60; return (m<10?"0":"")+m+":"+(r<10?"0":"")+r; }
function paintT(){ tval.textContent = fmt(Math.max(0,left)); }
function setRunning(v){
  running = v; if(v) tStarted = true;
  tbtn.textContent = running ? "Pause" : "Start";
  tbox.classList.toggle("running", running);
  clearInterval(tick);
  if(running){ tick = setInterval(function(){ if(left>0){ left--; paintT(); } }, 1000); }
}
tbtn.addEventListener("click", function(){ setRunning(!running); });
/* Der Start wird gern vergessen: Wer Station 0 per „Los geht's“ oder über die
   Leiste verlässt, startet den Timer – aber nur, wenn er seit „Neues Team“ noch
   nie lief. Eine bewusste Pause bleibt also Pause; Neuladen startet nichts. */
function timerAutoStart(){ if(!tStarted) setRunning(true); }
/* Zeit ändern: Klick auf die Anzeige, dann „75“ (Minuten) oder „42:30“ eintippen.
   Enter oder Wegklicken übernimmt, Escape bricht ab. „Neues Team“ stellt wieder 120:00. */
var tedit = document.getElementById("tedit");
function editT(on){ tval.hidden = on; tedit.hidden = !on; if(on){ tedit.value = fmt(Math.max(0,left)); tedit.focus(); tedit.select(); } }
function commitT(){
  if(tedit.hidden) return;
  var m = /^\s*(\d{1,3})(?::(\d{1,2}))?\s*$/.exec(tedit.value);
  if(m && Number(m[2] || 0) < 60){ left = Number(m[1]) * 60 + Number(m[2] || 0); paintT(); }
  editT(false);
}
tval.addEventListener("click", function(){ editT(true); });
tedit.addEventListener("keydown", function(e){
  if(e.key === "Enter") commitT();
  else if(e.key === "Escape"){ e.stopPropagation(); editT(false); }
});
tedit.addEventListener("blur", commitT);
paintT();

/* ================= drawer ================= */
var coach = document.getElementById("coach"), scrim = document.getElementById("scrim");
function openCoach(v){
  coach.classList.toggle("open", v);
  scrim.classList.toggle("on", v);
  coach.setAttribute("aria-hidden", v ? "false" : "true");
}
document.getElementById("coachbtn").addEventListener("click", function(){ openCoach(true); });
document.getElementById("coachclose").addEventListener("click", function(){ openCoach(false); });
scrim.addEventListener("click", function(){ openCoach(false); });
document.addEventListener("keydown", function(e){ if(e.key === "Escape") openCoach(false); });

/* ================= Sicherheit =================
   Erscheint beim ersten Öffnen und nach „Neues Team“; ein Betreuer liest es mit
   dem Team. Schließt nur über den Knopf (kein Escape, kein Klick daneben), damit
   es nicht vor dem Ende weggeklickt wird. „Sicherheit“ in der Kopfzeile holt es
   jederzeit zurück. */
var safety = document.getElementById("safety"), safetyok = document.getElementById("safetyok");
function openSafety(v){
  safety.hidden = !v;
  document.body.classList.toggle("safety-on", v);
  if(v){ openCoach(false); safety.scrollTop = 0; safetyok.focus({preventScroll:true}); }
}
safetyok.addEventListener("click", function(){ S.safe = true; save(); openSafety(false); });
document.getElementById("safetybtn").addEventListener("click", function(){ openSafety(true); });
safety.addEventListener("keydown", function(e){
  if(e.key === "Escape") e.stopPropagation();
  if(e.key === "Tab"){ e.preventDefault(); safetyok.focus(); }
});
/* ================= reset ================= */
document.getElementById("resetbtn").addEventListener("click", function(){
  S = {done:[], quiz:{}, bonus:{}, cur:0, safe:false};
  save();
  document.querySelectorAll("[data-bonus]").forEach(function(b){ b.paintBonus(); });
  document.querySelectorAll(".quiz").forEach(function(q){
    q.dataset.locked = "";
    q.querySelectorAll(".opt").forEach(function(o){ o.classList.remove("right","wrong"); o.style.opacity=""; });
    q.querySelector(".qfb").hidden = true;
  });
  document.getElementById("finaltitle").textContent = "Ziel erreicht";
  left = TOTAL; setRunning(false); tStarted = false; paintT();
  paintBadges(); paintProgress(); go(0);
  openSafety(true);
});

/* ================= Block-Optik: Symbole und Klammern ================= */
var PAT = {
  heart:  "0101011111111110111000100",
  arrowR: "0010000010111110001000100",
  arrowL: "0010001000111110100000100",
  arrowN: "0010001110101010010000100",
  arrowS: "0010000100101010111000100",
  skull:  "0111010101111110111001110",
  dot:    "0000000000001000000000000",
  d1:     "0000000000001000000000000",
  d2:     "0000100000000000000010000",
  d3:     "0000100000001000000010000",
  d4:     "1000100000000000000010001",
  d5:     "1000100000001000000010001",
  d6:     "1000100000100010000010001"
};
/* Klammer-Blöcke wie in MakeCode: In den Stationen stehen die Blöcke flach
   untereinander, eingerückt mit i1/i2. Hier wird daraus die Klammer-Form –
   ein Block, auf den tiefer eingerückte folgen, umschließt sie. „sonst“/„ansonsten“ hängt
   sich als Mittelsteg an das vorangehende „wenn“. */
function mcLevel(el){ return el.classList.contains("i2") ? 2 : el.classList.contains("i1") ? 1 : 0; }
function nestStack(stack){
  if(stack.classList.contains("flat")) return;
  var kids = Array.prototype.slice.call(stack.children), open = [];
  function colorOf(el){ return (el.className.match(/\bb-[a-z]+/) || [""])[0]; }
  kids.forEach(function(el, i){
    if(!el.classList.contains("mcb")){ open = []; stack.appendChild(el); return; }
    var lv = mcLevel(el);
    while(open.length && open[open.length-1].lv >= lv) open.pop();
    var parent = open.length ? open[open.length-1].body : stack;
    var next = kids[i+1], deeper = next && next.classList.contains("mcb") && mcLevel(next) > lv;
    el.classList.remove("i1", "i2");
    if(!deeper){ parent.appendChild(el); return; }
    var body = document.createElement("div"); body.className = "mcbody";
    var prev = parent.lastElementChild;
    if(/^(an)?sonst$/.test(el.textContent.trim()) && prev && prev.classList.contains("mcc") && prev.dataset.c === colorOf(el)){
      el.classList.add("mch");
      prev.insertBefore(el, prev.lastElementChild);
      prev.insertBefore(body, prev.lastElementChild);
    } else {
      var c = document.createElement("div"); c.className = "mcc"; c.dataset.c = colorOf(el);
      c.style.setProperty("--c", getComputedStyle(el).backgroundColor);
      el.classList.add("mch");
      var foot = document.createElement("div"); foot.className = "mcfoot";
      c.appendChild(el); c.appendChild(body); c.appendChild(foot);
      parent.appendChild(c);
    }
    open.push({lv:lv, body:body});
  });
}

/* Symbol im Block wie in MakeCode: 5×5-Bildchen mit Auswahlpfeil */
function ledIcon(name){
  var pat = PAT[name], h = '<b class="ledico" role="img" aria-label="' + ({heart:"Herz", skull:"Totenkopf"}[name] || name) + '"><i>';
  for(var i=0;i<25;i++){ h += '<span' + (pat.charAt(i)==="1" ? ' class="on"' : '') + '></span>'; }
  return h + '</i></b>';
}
/* ================= boot ================= */
load();
document.querySelectorAll("[data-led]").forEach(function(el){ el.outerHTML = ledIcon(el.dataset.led); });
document.querySelectorAll(".station .mcstack").forEach(nestStack);
buildRail();
paintBadges(); paintProgress(); paintRail();
go(S.cur === "teile" ? "teile" : (Number(S.cur) || 0));
if(!S.safe) openSafety(true);

})();
