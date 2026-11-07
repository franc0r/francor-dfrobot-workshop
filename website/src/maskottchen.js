/* Maskottchen: Figur, Gespräch und Ablauf. Gespräch und Ablauf folgen in den nächsten Aufgaben. */

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
