/* PRODIGY — Dot-matrix background (Vanilla JS, Canvas 2D · sin dependencias, sin CDN)
   Rejilla de puntos que parpadean, con intro radial desde el centro. Reactiva sutil al cursor.
   Uso:  <div data-dot-matrix data-accent="#D946A6,#D4AF37,#00d2ff"></div>  + este script.
         (crea un canvas fijo de fondo; el contenido debe ir con position:relative;z-index:1)
   Guards: OFF prefers-reduced-motion (rejilla estática), PAUSA con pestaña oculta. */
(function(){
  "use strict";
  if (window.__dotMatrix) return; window.__dotMatrix = 1;

  function reduced(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches; }

  function start(mount){
    var accent = (mount && mount.getAttribute('data-accent')) ? mount.getAttribute('data-accent').split(',') : ['#00d2ff','#D4AF37'];
    var GAP = parseInt(mount && mount.getAttribute('data-gap'),10) || 26;
    var DOT = 2.2;

    var canvas = document.createElement('canvas');
    canvas.className = 'dot-matrix-bg';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;display:block';
    canvas.setAttribute('aria-hidden','true');
    (mount || document.body).appendChild ? document.body.insertBefore(canvas, document.body.firstChild) : 0;
    var ctx = canvas.getContext('2d', { alpha:true });
    if(!ctx) return;

    function dark(){ return !document.body.classList.contains('light-mode'); }
    var W=0, H=0, cols=0, rows=0, cells=[], t0=performance.now(), running=true;
    var mouse={x:-1e4,y:-1e4};

    function build(){
      var dpr=Math.min(window.devicePixelRatio||1,2);
      W=window.innerWidth; H=window.innerHeight;
      canvas.width=W*dpr; canvas.height=H*dpr;
      canvas.style.width=W+'px'; canvas.style.height=H+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      cols=Math.ceil(W/GAP)+1; rows=Math.ceil(H/GAP)+1; cells=[];
      var cx=W/2, cy=H/2, maxD=Math.sqrt(cx*cx+cy*cy);
      for(var i=0;i<cols;i++){ for(var j=0;j<rows;j++){
        var x=i*GAP, y=j*GAP, dx=x-cx, dy=y-cy, d=Math.sqrt(dx*dx+dy*dy);
        cells.push({ x:x, y:y,
          delay: (d/maxD)*0.9 + Math.random()*0.15,     // intro radial
          ph: Math.random()*Math.PI*2, sp: 0.6+Math.random()*1.4, // parpadeo
          acc: Math.random()<0.14 ? accent[(Math.random()*accent.length)|0] : null });
      }}
    }
    function resize(){ build(); }
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function(e){ mouse.x=e.clientX; mouse.y=e.clientY; }, {passive:true});
    window.addEventListener('mouseleave', function(){ mouse.x=-1e4; mouse.y=-1e4; });
    build();

    var still = reduced();
    function frame(now){
      if(!running) return;
      var tt=(now-t0)/1000;
      ctx.clearRect(0,0,W,H);
      var isDark=dark();
      var base = isDark ? '255,255,255' : '15,23,42';
      for(var k=0;k<cells.length;k++){
        var c=cells[k];
        var intro = still ? 1 : Math.max(0, Math.min(1, (tt - c.delay)*2.2));
        if(intro<=0) continue;
        var flick = still ? 0.5 : (0.35 + 0.32*Math.sin(tt*c.sp + c.ph));
        // realce cerca del cursor
        var mdx=mouse.x-c.x, mdy=mouse.y-c.y, md=Math.sqrt(mdx*mdx+mdy*mdy);
        var near = md<130 ? (1-md/130) : 0;
        var a = Math.min(1, (flick*(isDark?0.5:0.42) + near*0.7) * intro);
        var r = DOT + near*1.8;
        if(c.acc){ ctx.fillStyle = hexA(c.acc, a*(near>0?1:0.9)); }
        else { ctx.fillStyle = 'rgba('+base+','+a.toFixed(3)+')'; }
        ctx.beginPath(); ctx.arc(c.x,c.y,r,0,6.283); ctx.fill();
      }
      if(!still) requestAnimationFrame(frame);
    }
    function hexA(hex,a){
      var h=hex.replace('#',''); if(h.length===3){h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];}
      var n=parseInt(h,16); return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a.toFixed(3)+')';
    }
    document.addEventListener('visibilitychange', function(){
      if(document.hidden){ running=false; }
      else if(!running){ running=true; t0=performance.now()-500; requestAnimationFrame(frame); }
    });
    requestAnimationFrame(frame);
  }

  function init(){ var m=document.querySelector('[data-dot-matrix]'); start(m); }
  if(document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
