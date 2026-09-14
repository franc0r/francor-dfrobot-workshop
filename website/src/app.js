(function(){
"use strict";

/* ================= state ================= */
var KEY = "mgp-v1";
var STATIONS = [
  {n:"Boxenstopp", m:"6 Min", badge:"Rookie"},
  {n:"Erster Kontakt", m:"10 Min", badge:"Ersteinschalter"},
  {n:"micro:bit allein", m:"20 Min", badge:"Pixelkünstler"},
  {n:"Fahrschule", m:"16 Min", badge:"Fahrlehrer"},
  {n:"Augen", m:"16 Min", badge:"Spurhalter"},
  {n:"Reflexe", m:"10 Min", badge:"Bremsassistent"},
  {n:"Grand Prix", m:"12 Min", badge:"Champion"}
];
var S = {team:"", pts:0, done:[], quiz:{}, levels:{}, mb:{}, cur:0};

function load(){
  try{
    var raw = localStorage.getItem(KEY);
    if(raw){ var o = JSON.parse(raw); if(o && typeof o==="object"){ for(var k in S){ if(o[k]!==undefined) S[k]=o[k]; } } }
  }catch(e){}
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function addPts(n){ S.pts += n; save(); paintScore(); }

/* ================= chrome ================= */
var ptsval = document.getElementById("ptsval");
var teamIn = document.getElementById("team");
var rail = document.getElementById("rail");
var railfoot = rail.querySelector(".railfoot");
var badgesEl = document.getElementById("badges");
var progfill = document.getElementById("progfill");

function paintScore(){
  ptsval.textContent = S.pts;
  var pct = Math.round(S.done.length / STATIONS.length * 100);
  progfill.style.width = pct + "%";
  var t = S.team ? S.team : "—";
  var ft = document.getElementById("finalwho");
  if(ft) ft.textContent = "Team " + t + " · " + S.pts + " Punkte";
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
function buildRail(){
  STATIONS.forEach(function(st,i){
    var b = document.createElement("button");
    b.type = "button"; b.className = "stepbtn"; b.dataset.go = i;
    b.innerHTML = '<span class="num">'+i+'</span><span class="lbl">'+st.n+'<span class="min">'+st.m+'</span></span>';
    b.addEventListener("click", function(){ go(i); });
    rail.insertBefore(b, railfoot);
  });
}
function paintRail(){
  var btns = rail.querySelectorAll(".stepbtn");
  for(var i=0;i<btns.length;i++){
    var idx = Number(btns[i].dataset.go);
    btns[i].setAttribute("aria-current", idx === S.cur ? "true" : "false");
    btns[i].classList.toggle("done", S.done.indexOf(idx) > -1);
    if(S.done.indexOf(idx) > -1) btns[i].querySelector(".num").textContent = "✓";
    else btns[i].querySelector(".num").textContent = idx;
  }
}
function go(i){
  S.cur = i; save();
  var secs = document.querySelectorAll(".station");
  for(var k=0;k<secs.length;k++){ secs[k].hidden = Number(secs[k].dataset.st) !== i; }
  paintRail(); paintScore();
  window.scrollTo({top:0, behavior: reduced() ? "auto" : "smooth"});
}
function reduced(){ try{ return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){ return false; } }

function complete(i){
  if(S.done.indexOf(i) === -1){ S.done.push(i); addPts(20); }
  paintRail(); paintBadges(); paintScore(); save();
}

document.addEventListener("click", function(e){
  var b = e.target.closest ? e.target.closest("[data-next]") : null;
  if(!b) return;
  var v = b.dataset.next;
  var cur = Number(b.closest(".station").dataset.st);
  if(v === "done"){
    complete(cur);
    document.getElementById("finaltitle").textContent = "Workshop geschafft!";
    paintScore();
    return;
  }
  var t = Number(v);
  if(t > cur) complete(cur);
  go(t);
});

teamIn.addEventListener("input", function(){ S.team = teamIn.value; save(); paintScore(); });

/* ================= quiz ================= */
document.querySelectorAll(".quiz").forEach(function(q){
  var id = q.dataset.quiz, ans = q.dataset.answer;
  var fb = q.querySelector(".qfb");
  var FB = {
    q0: "Richtig. Der Summer <em>erzeugt</em> etwas – er ist ein Aktor, kein Sensor. Sensoren nehmen auf, Aktoren geben aus.",
    q1: "Richtig. Der Code liegt im Flash-Speicher des micro:bit – wie eine App auf dem Handy. Er überlebt jedes Ausschalten.",
    q2: "Richtig. Der Computer tut genau das, was da steht – steht eine 4 im Block, zeigt er eine 4. Erst der Block <kbd>zufällige Zahl</kbd> macht daraus einen Würfel. Merkt euch: Wenn etwas immer dasselbe tut, liegt es fast nie am Schütteln.",
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
        if(!S.quiz[id]){ S.quiz[id] = 1; addPts(10); save(); }
      } else {
        fb.innerHTML = "Nicht ganz – denk nochmal nach und probier eine andere Antwort.";
        fb.hidden = false;
      }
    });
  });
});

/* ================= timer ================= */
var TOTAL = 90*60, left = TOTAL, running = false, tick = null;
var tval = document.getElementById("tval"), tbtn = document.getElementById("tbtn"), tbox = document.getElementById("timer");
function fmt(s){ var m = Math.floor(s/60), r = s%60; return (m<10?"0":"")+m+":"+(r<10?"0":"")+r; }
function paintT(){ tval.textContent = fmt(Math.max(0,left)); }
tbtn.addEventListener("click", function(){
  running = !running;
  tbtn.textContent = running ? "Pause" : "Start";
  tbox.classList.toggle("running", running);
  if(running){ tick = setInterval(function(){ if(left>0){ left--; paintT(); } }, 1000); }
  else { clearInterval(tick); }
});
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

/* ================= reset ================= */
document.getElementById("resetbtn").addEventListener("click", function(){
  S = {team:"", pts:0, done:[], quiz:{}, levels:{}, mb:{}, cur:0};
  save();
  teamIn.value = "";
  document.querySelectorAll(".quiz").forEach(function(q){
    q.dataset.locked = "";
    q.querySelectorAll(".opt").forEach(function(o){ o.classList.remove("right","wrong"); o.style.opacity=""; });
    q.querySelector(".qfb").hidden = true;
  });
  document.getElementById("finaltitle").textContent = "Ziel erreicht";
  left = TOTAL; running = false; clearInterval(tick);
  tbtn.textContent = "Start"; tbox.classList.remove("running"); paintT();
  prog = []; setLevel(0); mbReset();
  paintBadges(); paintScore(); go(0);
});

/* ================= SIMULATOR ================= */
var LEVELS = [
  {
    name:"1 · Geradeaus",
    cols:6, rows:3,
    start:{x:0,y:1,dir:0},
    goal:{x:5,y:1},
    walls:[],
    max:1,
    brief:"<b>Auftrag:</b> Bring den Roboter zur Zielflagge. Er schaut nach rechts. Schaffst du es mit einem einzigen Baustein?"
  },
  {
    name:"2 · Um die Ecke",
    cols:6, rows:5,
    start:{x:0,y:4,dir:0},
    goal:{x:5,y:0},
    walls:[[0,0],[1,0],[2,0],[3,0],[2,2],[3,2]],
    max:3,
    brief:"<b>Auftrag:</b> Die obere Reihe ist versperrt. Fahr außen herum. Drei Bausteine reichen – <em>fahre</em>, <em>drehe</em>, <em>fahre</em>."
  },
  {
    name:"3 · Bonus",
    cols:5, rows:5,
    start:{x:0,y:4,dir:0},
    goal:{x:4,y:0},
    walls:[[0,0],[1,0],[2,0],[3,0],[0,1],[1,1],[2,1],[0,2],[1,2],[4,2],[0,3],[3,3],[4,3],[2,4],[3,4],[4,4]],
    max:5,
    brief:"<b>Bonus für schnelle Teams:</b> Vier gleiche Stufen. Ohne Schleife brauchst du 16 Bausteine – mit der <em>wiederhole</em>-Schleife nur 5. Finde das Muster einer Stufe heraus."
  }
];
var COLORS = ["rot","grün","blau","gelb","pink"];
var CSSCOL = {"rot":"#E23B26","grün":"#20A85A","blau":"#2C7BE5","gelb":"#E8B321","pink":"#D6399B"};

var lev = 0, prog = [], uid = 1, insertInto = null, busy = false;
var robot = {x:0, y:0, ang:0, light:null};

var cv = document.getElementById("cv"), ctx = cv.getContext("2d");
var progEl = document.getElementById("prog"), palEl = document.getElementById("palette");
var statusEl = document.getElementById("status"), missionEl = document.getElementById("mission");
var counterEl = document.getElementById("counter"), levselEl = document.getElementById("levsel");

var PALETTE = [
  {t:"fwd",  cls:"b-mq",    label:"fahre vorwärts"},
  {t:"left", cls:"b-mq",    label:"drehe links ↺"},
  {t:"right",cls:"b-mq",    label:"drehe rechts ↻"},
  {t:"light",cls:"b-var",   label:"Licht an"},
  {t:"rep",  cls:"b-loop",  label:"wiederhole ×"}
];
function blockColor(t){
  if(t==="rep") return "#00A040";
  if(t==="light") return "#E07000";
  return "#264F87";
}
function labelOf(b){
  if(b.t==="fwd") return "fahre " + b.n + " Feld" + (b.n>1?"er":"") + " vor";
  if(b.t==="left") return "drehe links";
  if(b.t==="right") return "drehe rechts";
  if(b.t==="light") return "Licht " + b.c;
  if(b.t==="rep") return "wiederhole " + b.n + "×";
  return "";
}
function newBlock(t){
  var b = {id:uid++, t:t};
  if(t==="fwd") b.n = 1;
  if(t==="rep"){ b.n = 2; b.kids = []; }
  if(t==="light") b.c = COLORS[0];
  return b;
}
function buildPalette(){
  PALETTE.forEach(function(p){
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "pb " + p.cls;
    btn.style.background = blockColor(p.t);
    btn.textContent = p.label;
    btn.addEventListener("click", function(){
      if(busy) return;
      var b = newBlock(p.t);
      if(insertInto && p.t !== "rep"){
        var host = findRep(insertInto);
        if(host) host.kids.push(b); else prog.push(b);
      } else {
        prog.push(b);
        if(p.t === "rep") insertInto = b.id;
      }
      renderProg();
    });
    palEl.appendChild(btn);
  });
}
function findRep(id){
  for(var i=0;i<prog.length;i++){ if(prog[i].id===id && prog[i].t==="rep") return prog[i]; }
  return null;
}
function countBlocks(){
  var c = 0;
  prog.forEach(function(b){ c++; if(b.t==="rep") c += b.kids.length; });
  return c;
}
function removeBlock(id){
  for(var i=0;i<prog.length;i++){
    if(prog[i].id===id){ if(prog[i].id===insertInto) insertInto=null; prog.splice(i,1); return; }
    if(prog[i].t==="rep"){
      for(var j=0;j<prog[i].kids.length;j++){ if(prog[i].kids[j].id===id){ prog[i].kids.splice(j,1); return; } }
    }
  }
}
function moveBlock(id, d){
  var arrs = [prog];
  prog.forEach(function(b){ if(b.t==="rep") arrs.push(b.kids); });
  for(var a=0;a<arrs.length;a++){
    var arr = arrs[a];
    for(var i=0;i<arr.length;i++){
      if(arr[i].id===id){
        var t = i + d;
        if(t<0 || t>=arr.length) return;
        var tmp = arr[i]; arr[i]=arr[t]; arr[t]=tmp; return;
      }
    }
  }
}
function rowFor(b, isKid){
  var row = document.createElement("div");
  row.className = "prow" + (isKid ? " kid" : "");
  var chip = document.createElement("div");
  chip.className = "chip"; chip.dataset.bid = b.id;
  chip.style.background = blockColor(b.t);

  if(b.t==="fwd" || b.t==="rep"){
    var minus = document.createElement("button");
    minus.type="button"; minus.className="step"; minus.textContent="−";
    minus.setAttribute("aria-label","weniger");
    minus.addEventListener("click", function(e){ e.stopPropagation(); if(busy) return; var lo = b.t==="rep"?2:1; if(b.n>lo){ b.n--; renderProg(); } });
    var val = document.createElement("span"); val.className="val"; val.textContent = b.n;
    var plus = document.createElement("button");
    plus.type="button"; plus.className="step"; plus.textContent="+";
    plus.setAttribute("aria-label","mehr");
    plus.addEventListener("click", function(e){ e.stopPropagation(); if(busy) return; var hi = b.t==="rep"?6:5; if(b.n<hi){ b.n++; renderProg(); } });
    var lbl = document.createElement("span"); lbl.className="lbl"; lbl.textContent = labelOf(b);
    chip.appendChild(lbl); chip.appendChild(minus); chip.appendChild(val); chip.appendChild(plus);
  } else if(b.t==="light"){
    var lbl2 = document.createElement("span"); lbl2.className="lbl"; lbl2.textContent = labelOf(b);
    var cyc = document.createElement("button");
    cyc.type="button"; cyc.className="step"; cyc.textContent="↻";
    cyc.setAttribute("aria-label","Farbe wechseln");
    cyc.addEventListener("click", function(e){ e.stopPropagation(); if(busy) return; b.c = COLORS[(COLORS.indexOf(b.c)+1)%COLORS.length]; renderProg(); });
    chip.appendChild(lbl2); chip.appendChild(cyc);
  } else {
    var lbl3 = document.createElement("span"); lbl3.className="lbl"; lbl3.textContent = labelOf(b);
    chip.appendChild(lbl3);
  }

  if(b.t==="rep"){
    chip.classList.toggle("active", insertInto === b.id);
    chip.style.cursor = "pointer";
    chip.title = "Anklicken: neue Bausteine landen in dieser Schleife";
    chip.addEventListener("click", function(){ if(busy) return; insertInto = (insertInto === b.id) ? null : b.id; renderProg(); });
  }

  var up = document.createElement("button");
  up.type="button"; up.className="tool"; up.textContent="↑"; up.setAttribute("aria-label","nach oben");
  up.addEventListener("click", function(){ if(busy) return; moveBlock(b.id,-1); renderProg(); });
  var dn = document.createElement("button");
  dn.type="button"; dn.className="tool"; dn.textContent="↓"; dn.setAttribute("aria-label","nach unten");
  dn.addEventListener("click", function(){ if(busy) return; moveBlock(b.id,1); renderProg(); });
  var del = document.createElement("button");
  del.type="button"; del.className="tool"; del.textContent="✕"; del.setAttribute("aria-label","löschen");
  del.addEventListener("click", function(){ if(busy) return; removeBlock(b.id); renderProg(); });

  row.appendChild(chip); row.appendChild(up); row.appendChild(dn); row.appendChild(del);
  return row;
}
function renderProg(){
  progEl.innerHTML = "";
  if(prog.length === 0){
    var e = document.createElement("div");
    e.className = "emptyprog";
    e.textContent = "Noch leer — klick links auf einen Baustein";
    progEl.appendChild(e);
  }
  prog.forEach(function(b){
    progEl.appendChild(rowFor(b,false));
    if(b.t==="rep"){
      b.kids.forEach(function(k){ progEl.appendChild(rowFor(k,true)); });
      var dz = document.createElement("div");
      dz.className = "dropzone" + (insertInto===b.id ? " on" : "");
      dz.textContent = insertInto===b.id ? "▸ neue Bausteine landen hier drin" : "Schleife anklicken, um hier einzufügen";
      progEl.appendChild(dz);
    }
  });
  var c = countBlocks(), mx = LEVELS[lev].max;
  counterEl.textContent = c + " Bausteine · Bestwert: " + mx;
  counterEl.classList.toggle("over", c > mx);
}

/* --- canvas --- */
function cssvar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function fit(){
  var L = LEVELS[lev];
  var w = cv.parentElement.clientWidth - 28;
  if(w < 180) w = 180;
  var cell = Math.floor(w / L.cols);
  var dpr = window.devicePixelRatio || 1;
  cv.width = cell*L.cols*dpr; cv.height = cell*L.rows*dpr;
  cv.style.height = (cell*L.rows) + "px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return cell;
}
function draw(){
  var L = LEVELS[lev];
  var cell = fit();
  var W = cell*L.cols, H = cell*L.rows;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = cssvar("--surface"); ctx.fillRect(0,0,W,H);

  ctx.strokeStyle = cssvar("--grid"); ctx.lineWidth = 1;
  for(var i=0;i<=L.cols;i++){ ctx.beginPath(); ctx.moveTo(i*cell+.5,0); ctx.lineTo(i*cell+.5,H); ctx.stroke(); }
  for(var j=0;j<=L.rows;j++){ ctx.beginPath(); ctx.moveTo(0,j*cell+.5); ctx.lineTo(W,j*cell+.5); ctx.stroke(); }

  ctx.fillStyle = cssvar("--ink-3");
  L.walls.forEach(function(w){
    var x=w[0]*cell, y=w[1]*cell;
    ctx.globalAlpha = .22; ctx.fillRect(x+2,y+2,cell-4,cell-4); ctx.globalAlpha = 1;
    ctx.strokeStyle = cssvar("--ink-3"); ctx.lineWidth = 1.2;
    ctx.beginPath();
    for(var d=-cell; d<cell; d+=8){ ctx.moveTo(x+d+2, y+cell-2); ctx.lineTo(x+d+cell-2, y+2); }
    ctx.save(); ctx.beginPath(); ctx.rect(x+2,y+2,cell-4,cell-4); ctx.clip();
    ctx.beginPath();
    for(var d2=-cell; d2<cell; d2+=8){ ctx.moveTo(x+d2, y+cell); ctx.lineTo(x+d2+cell, y); }
    ctx.globalAlpha=.5; ctx.stroke(); ctx.globalAlpha=1;
    ctx.restore();
  });

  // goal: checkered flag square
  var gx = L.goal.x*cell, gy = L.goal.y*cell, q = cell/4;
  for(var a=0;a<4;a++) for(var b2=0;b2<4;b2++){
    ctx.fillStyle = ((a+b2)%2===0) ? cssvar("--track") : cssvar("--surface-2");
    ctx.fillRect(gx+a*q+2, gy+b2*q+2, q-0.5, q-0.5);
  }
  ctx.strokeStyle = cssvar("--teal"); ctx.lineWidth = 2.5;
  ctx.strokeRect(gx+2.5, gy+2.5, cell-5, cell-5);

  // robot
  var rx = robot.x*cell + cell/2, ry = robot.y*cell + cell/2;
  var s = cell*0.62;
  ctx.save();
  ctx.translate(rx,ry); ctx.rotate(robot.ang);
  ctx.fillStyle = "rgba(0,0,0,.16)";
  rr(-s/2+2, -s/2+4, s, s*0.78, 5); ctx.fill();
  ctx.fillStyle = "#22303A";
  rr(-s/2, -s/2, s, s*0.78, 5); ctx.fill();
  ctx.strokeStyle = cssvar("--surface"); ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#0D1416";
  ctx.fillRect(-s/2-2, -s/2+1, s*0.22, s*0.16);
  ctx.fillRect(-s/2-2, s*0.39-s*0.16, s*0.22, s*0.16);
  ctx.fillRect(s/2-s*0.2+2, -s/2+1, s*0.22, s*0.16);
  ctx.fillRect(s/2-s*0.2+2, s*0.39-s*0.16, s*0.22, s*0.16);
  var lc = robot.light ? CSSCOL[robot.light] : "#F3F6F7";
  ctx.fillStyle = lc;
  ctx.beginPath(); ctx.arc(s*0.34, -s*0.2, s*0.09, 0, 6.3); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.34, s*0.2, s*0.09, 0, 6.3); ctx.fill();
  if(robot.light){
    ctx.globalAlpha = .3; ctx.beginPath();
    ctx.moveTo(s*0.4,-s*0.3); ctx.lineTo(s*1.1,-s*0.55); ctx.lineTo(s*1.1,s*0.55); ctx.lineTo(s*0.4,s*0.3);
    ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  }
  ctx.fillStyle = "#5C7080";
  ctx.beginPath(); ctx.moveTo(s*0.05,-s*0.13); ctx.lineTo(s*0.28,0); ctx.lineTo(s*0.05,s*0.13); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function rr(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

function setLevel(i){
  lev = i; insertInto = null;
  prog = [];
  resetRobot();
  missionEl.innerHTML = LEVELS[i].brief;
  levselEl.querySelectorAll("button").forEach(function(b,k){
    b.setAttribute("aria-pressed", k===i ? "true" : "false");
    b.classList.toggle("solved", !!S.levels[k]);
  });
  setStatus("Klicke links auf Bausteine, um dein Programm zu bauen. Dann auf Ausführen.", "");
  renderProg(); draw();
}
function resetRobot(){
  var st = LEVELS[lev].start;
  robot.x = st.x; robot.y = st.y; robot.ang = st.dir * Math.PI/2; robot.light = null;
}
function setStatus(t, cls){
  statusEl.innerHTML = t;
  statusEl.className = "simstatus" + (cls ? " " + cls : "");
}
function buildLevSel(){
  LEVELS.forEach(function(L,i){
    var b = document.createElement("button");
    b.type="button"; b.textContent = L.name;
    b.addEventListener("click", function(){ if(busy) return; setLevel(i); });
    levselEl.appendChild(b);
  });
}

function isWall(x,y){
  var L = LEVELS[lev];
  if(x<0 || y<0 || x>=L.cols || y>=L.rows) return true;
  for(var i=0;i<L.walls.length;i++){ if(L.walls[i][0]===x && L.walls[i][1]===y) return true; }
  return false;
}
function compile(){
  var out = [];
  prog.forEach(function(b){
    if(b.t==="rep"){
      for(var r=0;r<b.n;r++){ b.kids.forEach(function(k){ push(k); }); }
      if(b.kids.length===0) out.push({t:"noop", id:b.id});
    } else push(b);
  });
  function push(b){
    if(b.t==="fwd"){ for(var i=0;i<b.n;i++) out.push({t:"fwd", id:b.id}); }
    else out.push({t:b.t, id:b.id, c:b.c});
  }
  return out;
}
function sleep(ms){ return new Promise(function(r){ setTimeout(r, reduced()?0:ms); }); }
function tween(dur, fn){
  return new Promise(function(res){
    if(reduced()){ fn(1); draw(); res(); return; }
    var t0 = performance.now();
    function step(now){
      var p = Math.min(1,(now-t0)/dur);
      fn(p<1 ? (p<.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2) : 1);
      draw();
      if(p<1) requestAnimationFrame(step); else res();
    }
    requestAnimationFrame(step);
  });
}
function highlight(id){
  progEl.querySelectorAll(".chip").forEach(function(c){ c.classList.toggle("running", Number(c.dataset.bid)===id); });
}

var runbtn = document.getElementById("runbtn");
runbtn.addEventListener("click", run);
document.getElementById("clearbtn").addEventListener("click", function(){
  if(busy) return; prog = []; insertInto = null; resetRobot(); renderProg(); draw();
  setStatus("Programm geleert.", "");
});

async function run(){
  if(busy) return;
  if(prog.length === 0){ setStatus("Dein Programm ist noch leer.", "bad"); return; }
  busy = true; runbtn.disabled = true;
  resetRobot(); draw();
  setStatus("Läuft …", "");
  var steps = compile(), crashed = false;

  for(var i=0;i<steps.length;i++){
    var s = steps[i];
    highlight(s.id);
    if(s.t === "fwd"){
      var dx = Math.round(Math.cos(robot.ang)), dy = Math.round(Math.sin(robot.ang));
      var nx = robot.x + dx, ny = robot.y + dy;
      if(isWall(nx,ny)){
        await tween(160, function(p){});
        crashed = true; break;
      }
      var ox = robot.x, oy = robot.y;
      await tween(340, function(p){ robot.x = ox + dx*p; robot.y = oy + dy*p; });
      robot.x = nx; robot.y = ny;
    } else if(s.t === "left" || s.t === "right"){
      var d = (s.t === "left") ? -Math.PI/2 : Math.PI/2;
      var oa = robot.ang;
      await tween(280, function(p){ robot.ang = oa + d*p; });
      robot.ang = oa + d;
    } else if(s.t === "light"){
      robot.light = s.c; draw(); await sleep(260);
    } else {
      await sleep(120);
    }
  }
  highlight(-1);
  var L = LEVELS[lev];
  if(crashed){
    setStatus("💥 Rumms — da war eine Wand. Kein Problem: Ingenieure fahren beim ersten Versuch fast immer dagegen. Schau, wo er stecken blieb, und ändere einen Baustein.", "bad");
  } else if(Math.round(robot.x)===L.goal.x && Math.round(robot.y)===L.goal.y){
    var c = countBlocks(), star = c <= L.max;
    var gained = 0;
    if(!S.levels[lev]){ gained += 15; }
    if(star && S.levels[lev] !== "star"){ gained += 10; }
    S.levels[lev] = star ? "star" : "ok";
    if(gained > 0){ addPts(gained); }
    save();
    levselEl.querySelectorAll("button")[lev].classList.add("solved");
    setStatus("🏁 Im Ziel!" + (star ? " Und das mit nur " + c + " Bausteinen — Bestwert erreicht." : " Es geht aber noch kürzer: " + L.max + " Bausteine reichen.") + (gained?" <b>+"+gained+" Punkte</b>":""), "ok");
  } else {
    setStatus("Angekommen — aber nicht auf der Zielflagge. Zähl die Felder nochmal genau ab.", "bad");
  }
  busy = false; runbtn.disabled = false;
}


/* ================= micro:bit SIMULATOR ================= */
var PAT = {
  heart:  "0101011111111110111000100",
  arrowR: "0010000010111110001000100",
  arrowL: "0010001000111110100000100",
  dot:    "0000000000001000000000000",
  smiley: "0000001010000001000101110",
  d1:     "0000000000001000000000000",
  d2:     "0000100000000000000010000",
  d3:     "0000100000001000000010000",
  d4:     "1000100000000000000010001",
  d5:     "1000100000001000000010001",
  d6:     "1000100000100010000010001"
};
var mbMode = "draw";
var mbDraw = "0000000000000000000000000";
var mbBtn = {a:false, b:false};
var mbTilt = 0, mbShown = "0000000000000000000000000";
var mbSeen = {};
var mbMatrix = document.getElementById("mbmatrix");
var mbCtl = document.getElementById("mbctl");
var mbTabsEl = document.getElementById("mbtabs");
var mbMissionEl = document.getElementById("mbmission");
var mbExtraEl = document.getElementById("mbextra");
var mbChipsEl = document.getElementById("mbchips");
var mbCodeEl = document.getElementById("mbcode");
var mbStatusEl = document.getElementById("mbstatus");
var mbXval = document.getElementById("mbxval");

var MBTABS = [
  {k:"draw",  n:"1 · Zeichnen"},
  {k:"btn",   n:"2 · Knöpfe"},
  {k:"tilt",  n:"3 · Neigen"}
];
var MBMISSION = {
  draw:"<b>Auftrag:</b> Klick die Lämpchen an, bis das Zielbild rechts daneben entsteht. Rechts siehst du live, wie der Block <em>zeige LEDs</em> dafür aussieht.",
  btn:"<b>Auftrag:</b> Drück A, drück B, und drück beide zusammen. Achte darauf: Das Programm wartet – es passiert erst etwas, wenn du drückst.",
  tilt:"<b>Auftrag:</b> Kipp den micro:bit mit dem Regler nach links und nach rechts, und schüttle ihn einmal. Beobachte dabei die Zahl unter dem Gerät."
};

function mbCells(){ return mbMatrix.querySelectorAll(".led"); }
function mbPaint(pat){
  mbShown = pat;
  var c = mbCells();
  for(var i=0;i<25;i++){ c[i].classList.toggle("on", pat.charAt(i) === "1"); }
}
function mbBuildMatrix(){
  mbMatrix.innerHTML = "";
  for(var i=0;i<25;i++){
    var b = document.createElement("button");
    b.type = "button"; b.className = "led"; b.dataset.i = i;
    b.setAttribute("aria-label", "LED " + (i+1));
    b.addEventListener("click", function(){
      if(mbMode !== "draw") return;
      var k = Number(this.dataset.i);
      mbDraw = mbDraw.substring(0,k) + (mbDraw.charAt(k)==="1"?"0":"1") + mbDraw.substring(k+1);
      mbPaint(mbDraw); mbCode(); mbCheckDraw();
    });
    mbMatrix.appendChild(b);
  }
}
function mini(pat){
  var h = '<div class="mbmini">';
  for(var i=0;i<25;i++){ h += '<span class="' + (pat.charAt(i)==="1"?"on":"") + '"></span>'; }
  return h + "</div>";
}
function mbCode(){
  var h = "";
  if(mbMode === "draw"){
    var rows = [];
    for(var r=0;r<5;r++){
      var line = "";
      for(var c=0;c<5;c++){ line += (mbDraw.charAt(r*5+c)==="1" ? "#" : "."); }
      rows.push(line);
    }
    h = '<div class="mccap">Live aus deiner Zeichnung</div>' +
        '<div class="mcb b-basic">beim Start</div>' +
        '<div class="mcb b-basic i1">zeige LEDs</div>' +
        '<div class="ledsrc">' + rows.join("\n") + '</div>';
  } else if(mbMode === "btn"){
    h = '<div class="mccap">Drei Ereignisse</div>' +
        '<div class="mcb b-input">beim Knopf <b>A</b> gedrückt</div>' +
        '<div class="mcb b-basic i1">zeige Symbol <b>❤</b></div>' +
        '<div class="mcb b-input">beim Knopf <b>B</b> gedrückt</div>' +
        '<div class="mcb b-basic i1">zeige Pfeil <b>Osten</b></div>' +
        '<div class="mcb b-input">beim Knopf <b>A+B</b> gedrückt</div>' +
        '<div class="mcb b-basic i1">zeige Symbol <b>☺</b></div>';
  } else {
    h = '<div class="mccap">Neigung auswerten</div>' +
        '<div class="mcb b-basic">dauerhaft</div>' +
        '<div class="mcb b-logic i1">wenn <b>Beschleunigung x</b> &gt; <b>300</b> dann</div>' +
        '<div class="mcb b-basic i2">zeige Pfeil <b>Osten</b></div>' +
        '<div class="mcb b-logic i1">sonst wenn <b>Beschleunigung x</b> &lt; <b>−300</b> dann</div>' +
        '<div class="mcb b-basic i2">zeige Pfeil <b>Westen</b></div>' +
        '<div class="mcb b-logic i1">sonst</div>' +
        '<div class="mcb b-basic i2">zeige LEDs <b>Punkt</b></div>' +
        '<div class="mccap" style="margin-top:8px">Und der Würfel</div>' +
        '<div class="mcb b-input">wenn geschüttelt</div>' +
        '<div class="mcb b-basic i1">zeige Zahl <b>zufällig 1 bis 6</b></div>';
  }
  mbCodeEl.innerHTML = h;
}
function mbChips(){
  var h = "";
  if(mbMode === "btn"){
    h += '<span class="' + (mbSeen.a?"on":"") + '">Knopf A</span>';
    h += '<span class="' + (mbSeen.b?"on":"") + '">Knopf B</span>';
    h += '<span class="' + (mbSeen.ab?"on":"") + '">A + B</span>';
  } else if(mbMode === "tilt"){
    h += '<span class="' + (mbSeen.left?"on":"") + '">links gekippt</span>';
    h += '<span class="' + (mbSeen.mid?"on":"") + '">flach</span>';
    h += '<span class="' + (mbSeen.right?"on":"") + '">rechts gekippt</span>';
    h += '<span class="' + (mbSeen.shake?"on":"") + '">geschüttelt</span>';
  }
  mbChipsEl.innerHTML = h;
}
function mbStatus(t, cls){
  mbStatusEl.innerHTML = t;
  mbStatusEl.className = "simstatus" + (cls ? " " + cls : "");
}
function mbAward(key, n, msg){
  if(!S.mb) S.mb = {};
  if(S.mb[key]) { mbStatus(msg, "ok"); return; }
  S.mb[key] = 1; save(); addPts(n);
  mbStatus(msg + " <b>+" + n + " Punkte</b>", "ok");
}
function mbCheckDraw(){
  if(mbDraw === PAT.heart){
    mbAward("draw", 10, "❤ Genau das Zielbild! Übertrag dieses Muster jetzt in MakeCode &ndash; im Block <em>zeige LEDs</em> klickst du dieselben Punkte an.");
  }
}
function mbSetMode(m){
  mbMode = m;
  mbTabsEl.querySelectorAll("button").forEach(function(b){
    b.setAttribute("aria-pressed", b.dataset.k === m ? "true" : "false");
  });
  mbMissionEl.innerHTML = MBMISSION[m];
  mbCtl.hidden = (m !== "tilt");
  mbExtraEl.innerHTML = (m === "draw")
    ? '<div class="mccap" style="margin-top:14px">Zielbild</div>' + mini(PAT.heart)
    : "";
  mbCells().forEach(function(c){ c.classList.toggle("tap", m === "draw"); });
  document.getElementById("mbA").disabled = (m !== "btn");
  document.getElementById("mbB").disabled = (m !== "btn");
  if(m === "draw"){ mbPaint(mbDraw); mbStatus("Klick die Lämpchen an. Wenn dein Bild stimmt, sag ich Bescheid.", ""); }
  else if(m === "btn"){ mbPaint("0000000000000000000000000"); mbStatus("Der Bildschirm ist leer &ndash; das Programm wartet auf dich.", ""); }
  else { mbTiltPaint(); mbStatus("Zieh den Regler. Die Zahl unten ist genau das, was der echte Sensor liefert.", ""); }
  mbChips(); mbCode();
}
function mbPress(which){
  if(mbMode !== "btn") return;
  var el = document.getElementById(which === "a" ? "mbA" : "mbB");
  el.classList.add("pressed");
  setTimeout(function(){ el.classList.remove("pressed"); }, 220);
  mbBtn[which] = true;
  var other = which === "a" ? "b" : "a";
  var both = mbBtn[other + "_recent"];
  if(both){
    mbSeen.ab = 1; mbPaint(PAT.smiley);
    mbStatus("A und B zusammen &ndash; das ist ein drittes, eigenes Ereignis.", "");
  } else if(which === "a"){
    mbSeen.a = 1; mbPaint(PAT.heart);
  } else {
    mbSeen.b = 1; mbPaint(PAT.arrowR);
  }
  mbBtn[which + "_recent"] = true;
  setTimeout(function(){ mbBtn[which + "_recent"] = false; }, 600);
  mbChips();
  if(mbSeen.a && mbSeen.b && mbSeen.ab){
    mbAward("btn", 10, "Alle drei Ereignisse ausprobiert. Merke: Das Programm läuft nicht durch &ndash; es wartet.");
  }
}
function mbTiltPaint(){
  mbXval.textContent = mbTilt;
  if(mbTilt > 300){ mbPaint(PAT.arrowR); mbSeen.right = 1; }
  else if(mbTilt < -300){ mbPaint(PAT.arrowL); mbSeen.left = 1; }
  else { mbPaint(PAT.dot); mbSeen.mid = 1; }
  mbChips();
  if(mbSeen.left && mbSeen.right && mbSeen.mid && mbSeen.shake){
    mbAward("tilt", 10, "Alle vier Zustände gesehen. Die Grenze bei 300 hast nicht der micro:bit und nicht ich festgelegt &ndash; die legt das Programm fest. Also ihr.");
  }
}
function mbShakeRoll(){
  mbSeen.shake = 1;
  var n = 0, t = 0;
  var iv = setInterval(function(){
    mbPaint(PAT["d" + (1 + Math.floor(Math.random()*6))]);
    t++;
    if(t > 7){
      clearInterval(iv);
      n = 1 + Math.floor(Math.random()*6);
      mbPaint(PAT["d" + n]);
      mbStatus("Gewürfelt: <b>" + n + "</b>. Drei Blöcke, und ihr habt ein Spielzeug gebaut.", "");
      setTimeout(mbTiltPaint, 1400);
    }
  }, reduced() ? 1 : 70);
  mbChips();
}
function mbInit(){
  MBTABS.forEach(function(t){
    var b = document.createElement("button");
    b.type = "button"; b.textContent = t.n; b.dataset.k = t.k;
    b.addEventListener("click", function(){ mbSetMode(t.k); });
    mbTabsEl.appendChild(b);
  });
  mbBuildMatrix();
  document.getElementById("mbA").addEventListener("click", function(){ mbPress("a"); });
  document.getElementById("mbB").addEventListener("click", function(){ mbPress("b"); });
  document.getElementById("mbtilt").addEventListener("input", function(){
    mbTilt = Number(this.value); mbTiltPaint();
  });
  document.getElementById("mbshake").addEventListener("click", mbShakeRoll);
  mbSetMode("draw");
}
function mbReset(){
  mbDraw = "0000000000000000000000000";
  mbSeen = {}; mbBtn = {a:false,b:false}; mbTilt = 0;
  document.getElementById("mbtilt").value = 0;
  mbSetMode("draw");
}

/* ================= boot ================= */
load();
buildRail(); buildPalette(); buildLevSel(); mbInit();
teamIn.value = S.team || "";
paintBadges(); paintScore(); paintRail();
setLevel(0);
go(S.cur || 0);

var rt;
window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(draw, 120); });
try{
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  if(mq.addEventListener) mq.addEventListener("change", draw);
}catch(e){}
})();
