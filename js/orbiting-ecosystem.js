/* PRODIGY — Orbiting ecosystem globe (Vanilla JS)
   Esfera de partículas + logo al centro, con anillos de marcas orbitando (contrarrotadas para quedar derechas).
   Sin CDNs externos. Uso:
     <div id="orb-eco" data-logo="diamond"></div>
     <script src="js/orbiting-ecosystem.js" defer></script>
   Respeta prefers-reduced-motion (queda estático). */
(function(){
  "use strict";
  if (window.__orbEco) return; window.__orbEco = 1;

  var CSS =
    ".orb-stage{position:relative;width:100%;height:26rem;overflow:hidden;display:flex;justify-content:center;--bd:rgba(255,255,255,.12)}"+
    "@media(min-width:768px){.orb-stage{height:34rem}}"+
    ".orb-core{position:absolute;bottom:0;left:50%;transform:translate(-50%,42%);width:18rem;height:18rem;pointer-events:none;z-index:6}"+
    "@media(min-width:768px){.orb-core{width:30rem;height:30rem}}"+
    ".orb-core canvas{position:absolute;inset:0;width:100%;height:100%}"+
    ".orb-logo{position:absolute;top:34%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;filter:drop-shadow(0 4px 22px rgba(0,210,255,.5));z-index:7}"+
    "@media(min-width:768px){.orb-logo{width:92px;height:92px}}"+
    ".orb-ring{position:absolute;bottom:0;left:50%;transform:translate(-50%,50%);border-radius:50%;border:1px solid var(--bd)}"+
    ".orb-arm{position:absolute;top:0;left:50%;height:50%;transform-origin:bottom center;display:flex;flex-direction:column;align-items:center}"+
    ".orb-badge{margin-top:-18px;display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid var(--bd);border-radius:100px;"+
      "background:rgba(9,14,22,.92);backdrop-filter:blur(6px);white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,.5)}"+
    ".orb-badge .dot{width:8px;height:8px;border-radius:50%;flex:none}"+
    ".orb-badge span{font-size:.72rem;font-weight:800;color:#e8eef6;letter-spacing:.01em}"+
    "@keyframes orb-cw{from{transform:rotate(var(--a))}to{transform:rotate(calc(var(--a) + 360deg))}}"+
    "@keyframes orb-ccw{from{transform:rotate(var(--a))}to{transform:rotate(calc(var(--a) - 360deg))}}"+
    "@keyframes orb-ncw{from{transform:rotate(var(--c))}to{transform:rotate(calc(var(--c) - 360deg))}}"+
    "@keyframes orb-nccw{from{transform:rotate(var(--c))}to{transform:rotate(calc(var(--c) + 360deg))}}"+
    "@media(prefers-reduced-motion:reduce){.orb-arm,.orb-badge{animation:none!important}}";

  var DIAMOND = '<svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="38,29 62,29 62,44 38,44" fill="#9fecff"/><polygon points="38,29 17,44 38,44" fill="#56cef5"/><polygon points="62,29 83,44 62,44" fill="#34ace2"/><polygon points="17,44 50,44 50,77" fill="#0f6fb0"/><polygon points="50,44 83,44 50,77" fill="#0d68a8"/><polygon points="38,29 62,29 83,44 50,77 17,44" fill="none" stroke="#d4f2ff" stroke-width="2" stroke-linejoin="round"/></svg>';
  var CROWN = '<svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="22,64 78,64 83,38 64,51 50,28 36,51 17,38" fill="#f0c040" stroke="#fff3c0" stroke-width="2" stroke-linejoin="round"/><rect x="22" y="64" width="56" height="11" rx="2.5" fill="#d9a520" stroke="#fff3c0" stroke-width="2"/><circle cx="50" cy="28" r="4.5" fill="#ff5da2"/><circle cx="17" cy="38" r="3.6" fill="#5ad1ff"/><circle cx="83" cy="38" r="3.6" fill="#5ad1ff"/></svg>';
  var LOGOS = { diamond:DIAMOND, crown:CROWN };

  // Ecosistema dental real (sin logos externos): nombre + color. Preset por data-preset.
  var PRESETS = {
    // PRODIGY: laboratorio completo (escaneo + diseño + fresado)
    full: [
      { r:15, dur:20, cw:true,  brands:[["exocad","#00d2ff"],["3Shape","#7db8ff"],["Medit","#4ade80"]] },
      { r:21, dur:28, cw:false, brands:[["exoplan","#a855f7"],["iTero","#e0b23a"],["Aidite","#D946A6"]] },
      { r:27, dur:36, cw:true,  brands:[["VHF K5+","#00d2ff"],["Amann","#4ade80"],["Blender","#e0894a"]] }
    ],
    // Alejandro: diseño remoto puro (software, sin fresadoras)
    cad: [
      { r:15, dur:20, cw:true,  brands:[["exocad","#00d2ff"],["3Shape","#7db8ff"],["Medit","#4ade80"]] },
      { r:21, dur:28, cw:false, brands:[["CoDiagnostiX","#a855f7"],["exoplan","#e0b23a"],["DSD","#D946A6"]] },
      { r:27, dur:36, cw:true,  brands:[["Blender","#e0894a"],["Meshmixer","#00d2ff"],["STL / PLY","#4ade80"]] }
    ]
  };

  function particleSphere(canvas){
    var ctx=canvas.getContext('2d'), N=170, pts=[], dpr=Math.min(window.devicePixelRatio||1,2);
    function size(){ var w=canvas.clientWidth, h=canvas.clientHeight; canvas.width=w*dpr; canvas.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
    for(var i=0;i<N;i++){ var y=1-(i/(N-1))*2, r=Math.sqrt(1-y*y), th=i*2.399963; pts.push([Math.cos(th)*r, y, Math.sin(th)*r]); }
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var ang=0, running=true;
    function frame(){
      if(!running) return;
      size();
      var w=canvas.clientWidth, h=canvas.clientHeight, cx=w/2, cy=h/2, R=Math.min(w,h)*0.42;
      ctx.clearRect(0,0,w,h);
      ang += reduce?0:0.0035;
      var ca=Math.cos(ang), sa=Math.sin(ang);
      for(var i=0;i<pts.length;i++){
        var x=pts[i][0], y=pts[i][1], z=pts[i][2];
        var rx=x*ca - z*sa, rz=x*sa + z*ca;
        var depth=(rz+1)/2;                 // 0 lejos, 1 cerca
        var sx=cx+rx*R, sy=cy+y*R;
        var alpha=0.15+depth*0.6, rad=0.6+depth*1.7;
        ctx.fillStyle='rgba('+(120+depth*135|0)+','+(200+depth*55|0)+',255,'+alpha.toFixed(2)+')';
        ctx.beginPath(); ctx.arc(sx,sy,rad,0,Math.PI*2); ctx.fill();
      }
      if(!reduce) requestAnimationFrame(frame);
    }
    document.addEventListener('visibilitychange',function(){ if(document.hidden){running=false;} else if(!running&&!reduce){running=true;requestAnimationFrame(frame);} });
    requestAnimationFrame(frame);
  }

  function build(mount){
    var logoKind = mount.getAttribute('data-logo')||'diamond';
    var RINGS = PRESETS[mount.getAttribute('data-preset')||'full'] || PRESETS.full;
    var stage=document.createElement('div'); stage.className='orb-stage';
    // rings
    RINGS.forEach(function(ring){
      var el=document.createElement('div'); el.className='orb-ring';
      el.style.width=ring.r+'rem'; el.style.height=ring.r+'rem';
      var all = ring.brands.concat(ring.brands); // espejo (+180)
      all.forEach(function(b, idx){
        var base = (360/ring.brands.length)*(idx % ring.brands.length);
        var angle = base + (idx>=ring.brands.length?180:0);
        var arm=document.createElement('div'); arm.className='orb-arm';
        arm.style.setProperty('--a', angle+'deg');
        arm.style.animation='orb-'+(ring.cw?'cw':'ccw')+' '+ring.dur+'s linear infinite';
        var badge=document.createElement('div'); badge.className='orb-badge';
        badge.style.setProperty('--c', (-angle)+'deg');
        badge.style.animation='orb-'+(ring.cw?'ncw':'nccw')+' '+ring.dur+'s linear infinite';
        badge.innerHTML='<span class="dot" style="background:'+b[1]+'"></span><span>'+b[0]+'</span>';
        arm.appendChild(badge); el.appendChild(arm);
      });
      stage.appendChild(el);
    });
    // core: sphere + logo
    var core=document.createElement('div'); core.className='orb-core';
    var cv=document.createElement('canvas'); core.appendChild(cv);
    stage.appendChild(core);
    var logo=document.createElement('div'); logo.className='orb-logo'; logo.innerHTML=(LOGOS[logoKind]||DIAMOND);
    stage.appendChild(logo);
    mount.innerHTML=''; mount.appendChild(stage);
    particleSphere(cv);
  }

  function init(){
    if(!document.getElementById('orb-eco-css')){ var s=document.createElement('style'); s.id='orb-eco-css'; s.textContent=CSS; document.head.appendChild(s); }
    var m=document.getElementById('orb-eco'); if(m) build(m);
  }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
