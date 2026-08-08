/* PRODIGY — Confetti (Vanilla JS, sin dependencias)
   window.confettiBurst({origin:{x,y}, particleCount, emojis:[...], colors:[...]})
   window.celebrateUpload(anchorEl, {emojis:[...], msg?, colors?})  -> confetti desde el elemento + toast de agradecimiento.
      (2º arg también acepta un string = solo mensaje). Emojis variados por lugar: cada flujo pasa su set.
   Respeta prefers-reduced-motion (omite el confetti, mantiene el mensaje). */
(function(){
  "use strict";
  if (window.__confetti) return; window.__confetti = 1;

  var CANVAS=null, CTX=null, particles=[], raf=null;
  function ensureCanvas(){
    if(CANVAS) return;
    CANVAS=document.createElement('canvas');
    CANVAS.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:99998;pointer-events:none';
    CANVAS.setAttribute('aria-hidden','true');
    document.body.appendChild(CANVAS);
    CTX=CANVAS.getContext('2d');
    resize(); window.addEventListener('resize', resize);
  }
  function resize(){ if(!CANVAS)return; var dpr=Math.min(window.devicePixelRatio||1,2); CANVAS.width=window.innerWidth*dpr; CANVAS.height=window.innerHeight*dpr; CTX.setTransform(dpr,0,0,dpr,0,0); }

  function burst(opts){
    opts=opts||{};
    ensureCanvas();
    var ox=(opts.origin&&opts.origin.x!=null)?opts.origin.x:0.5;
    var oy=(opts.origin&&opts.origin.y!=null)?opts.origin.y:0.45;
    var n=opts.particleCount||130;
    var emojis=opts.emojis||['🦷','✨','🎉','⭐','💎','🚀'];
    var colors=opts.colors||['#D946A6','#D4AF37','#00d2ff','#00FF41','#ffffff'];
    var cx=ox*window.innerWidth, cy=oy*window.innerHeight;
    for(var i=0;i<n;i++){
      var ang=Math.random()*Math.PI*2, spd=4+Math.random()*9, useE=Math.random()<0.32;
      particles.push({
        x:cx, y:cy,
        vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd-(4+Math.random()*5),
        g:0.15+Math.random()*0.12, rot:Math.random()*6.28, vr:(Math.random()-0.5)*0.32,
        life:1, decay:0.006+Math.random()*0.009,
        emoji: useE? emojis[Math.floor(Math.random()*emojis.length)]:null,
        color: colors[Math.floor(Math.random()*colors.length)],
        size: useE?(16+Math.random()*14):(5+Math.random()*6)
      });
    }
    if(!raf) raf=requestAnimationFrame(loop);
  }

  function loop(){
    CTX.clearRect(0,0,window.innerWidth,window.innerHeight);
    var alive=0;
    for(var i=0;i<particles.length;i++){
      var p=particles[i]; if(p.life<=0) continue;
      p.vy+=p.g; p.vx*=0.99; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.life-=p.decay; alive++;
      CTX.save(); CTX.globalAlpha=Math.max(0,p.life); CTX.translate(p.x,p.y); CTX.rotate(p.rot);
      if(p.emoji){ CTX.font=p.size+'px serif'; CTX.textAlign='center'; CTX.textBaseline='middle'; CTX.fillText(p.emoji,0,0); }
      else { CTX.fillStyle=p.color; CTX.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.62); }
      CTX.restore();
    }
    particles=particles.filter(function(p){ return p.life>0 && p.y<window.innerHeight+50; });
    if(alive && particles.length){ raf=requestAnimationFrame(loop); }
    else { raf=null; CTX.clearRect(0,0,window.innerWidth,window.innerHeight); }
  }

  function toast(msg){
    if(!document.getElementById('cf-toast-css')){
      var s=document.createElement('style'); s.id='cf-toast-css';
      s.textContent=
        ".cf-toast{position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(20px);z-index:99999;max-width:min(92vw,440px);"+
        "background:linear-gradient(160deg,#141c2b,#0b1017);border:1px solid rgba(217,70,166,.4);border-radius:16px;padding:16px 20px;"+
        "box-shadow:0 18px 50px rgba(0,0,0,.6);color:#f4f0f6;font-family:system-ui,-apple-system,sans-serif;opacity:0;transition:.35s;text-align:center}"+
        ".cf-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}"+
        ".cf-toast b{display:block;font-size:1rem;font-weight:800;margin-bottom:4px;background:linear-gradient(90deg,#D946A6,#D4AF37);-webkit-background-clip:text;background-clip:text;color:transparent}"+
        ".cf-toast span{font-size:.85rem;color:#c7d0dc;line-height:1.5}";
      document.head.appendChild(s);
    }
    var t=document.createElement('div'); t.className='cf-toast';
    t.innerHTML='<b>🎉 ¡Gracias, recibimos tu archivo!</b><span>'+(msg||'Vamos a trabajar <strong style="color:#fff">fuerte y con precisión</strong> en exactamente lo que necesitas. Te contamos el avance por WhatsApp.')+'</span>';
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('on'); });
    setTimeout(function(){ t.classList.remove('on'); setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 400); }, 5200);
  }

  window.confettiBurst = burst;
  // celebrateUpload(anchorEl, opts)  ·  opts = {emojis:[...], msg:"..."}  (o un string = solo msg)
  window.celebrateUpload = function(anchor, opts){
    opts = (typeof opts==='string') ? {msg:opts} : (opts||{});
    var emojis = opts.emojis, colors = opts.colors;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(!reduce){
      var ox=0.5, oy=0.42;
      if(anchor && anchor.getBoundingClientRect){ var r=anchor.getBoundingClientRect(); if(r.width){ ox=(r.left+r.width/2)/window.innerWidth; oy=(r.top+r.height/2)/window.innerHeight; } }
      burst({origin:{x:ox,y:oy}, particleCount:150, emojis:emojis, colors:colors});
      setTimeout(function(){ burst({origin:{x:0.08,y:0.55},particleCount:45,emojis:emojis,colors:colors}); burst({origin:{x:0.92,y:0.55},particleCount:45,emojis:emojis,colors:colors}); }, 160);
    }
    toast(opts.msg);
  };
})();
