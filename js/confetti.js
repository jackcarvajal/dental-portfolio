/* PRODIGY — Confetti (Vanilla JS, sin dependencias)
   API:
     window.confettiBurst({origin:{x,y}, particleCount, emojis:[...], colors:[...]})
     window.celebrateFlujo(clave, anchorEl?, {toast?, sides?, particleCount?})
        clave ∈ diseno | fresado | impresion | lab | alejandro  (mensaje + emojis propios de cada caso)
        toast:false -> solo confetti (sin mensaje)   sides:false -> sin cañones laterales
     window.celebrateUpload(anchorEl, {emojis?, title?, msg?, colors?})  (genérico / retrocompat)
   Respeta prefers-reduced-motion (omite el confetti, mantiene el mensaje). */
(function(){
  "use strict";
  if (window.__confetti) return; window.__confetti = 1;

  // ── Mensajes + emojis por caso (una sola fuente de verdad, compartida por ambos repos) ──
  var FLUJOS = {
    diseno:{ emojis:['🦷','✨','🎉','💎','📐','🚀'],
      title:'🦷 ¡Recibimos tu caso de diseño!',
      msg:'Lo diseñamos <strong style="color:#fff">fuerte y con precisión</strong> — márgenes y contactos cuidados. Te mandamos el preview por WhatsApp.' },
    fresado:{ emojis:['⚙️','💎','✨','🔩','🦷','🎉'],
      title:'⚙️ ¡Tu caso entró a fresado!',
      msg:'Zirconia / disilicato con ajuste exacto. Nos ponemos a trabajar ya; te contamos el avance por WhatsApp.' },
    impresion:{ emojis:['🖨️','🧩','✨','🦷','🎯','🎉'],
      title:'🖨️ ¡Tu caso entró a impresión!',
      msg:'Modelos y guías con detalle fino. Trabajamos <strong style="color:#fff">fuerte y preciso</strong>; avance por WhatsApp.' },
    lab:{ emojis:['🔬','🧪','🦷','✨','⭐','🎉'],
      title:'🔬 ¡Caso de laboratorio recibido!',
      msg:'Lo trabajamos con precisión de principio a fin. Te contamos cada avance por WhatsApp.' },
    alejandro:{ emojis:['👑','💎','✨','🦷','📐','🎉'],
      title:'👑 ¡Recibí tu caso!',
      msg:'<strong style="color:#fff">You send, I design.</strong> Precisión en cada detalle — te escribo el avance por WhatsApp.' },
    _default:{ emojis:['🦷','✨','🎉','⭐','💎','🚀'],
      title:'🎉 ¡Gracias, recibimos tu archivo!',
      msg:'Vamos a trabajar <strong style="color:#fff">fuerte y con precisión</strong> en exactamente lo que necesitas. Te contamos el avance por WhatsApp.' }
  };

  var CANVAS=null, CTX=null, particles=[], raf=null;

  // Cache de sprites de emoji: fillText por-frame es lentísimo y traba la animación.
  // Cada emoji se dibuja UNA vez a un canvas offscreen y luego solo se copia (drawImage).
  var SPRITES={};
  function sprite(ch){
    if(SPRITES[ch]) return SPRITES[ch];
    var c=document.createElement('canvas'), S=64; c.width=S; c.height=S;
    var g=c.getContext('2d'); g.font=Math.floor(S*0.78)+'px serif'; g.textAlign='center'; g.textBaseline='middle';
    g.fillText(ch, S/2, S/2+2);
    SPRITES[ch]=c; return c;
  }
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
    var emojis=opts.emojis||FLUJOS._default.emojis;
    var colors=opts.colors||['#D946A6','#D4AF37','#00d2ff','#00FF41','#ffffff'];
    var cx=ox*window.innerWidth, cy=oy*window.innerHeight;
    for(var i=0;i<n;i++){
      var ang=Math.random()*Math.PI*2, spd=11+Math.random()*17, useE=Math.random()<0.32;
      particles.push({
        x:cx, y:cy,
        vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd-(9+Math.random()*8),
        g:0.55+Math.random()*0.30, rot:Math.random()*6.28, vr:(Math.random()-0.5)*0.6,
        life:1, decay:0.022+Math.random()*0.020,
        spr: useE? sprite(emojis[Math.floor(Math.random()*emojis.length)]):null,
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
      p.vy+=p.g; p.vx*=0.978; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.life-=p.decay; alive++;
      CTX.save(); CTX.globalAlpha=Math.max(0,p.life); CTX.translate(p.x,p.y); CTX.rotate(p.rot);
      if(p.spr){ CTX.drawImage(p.spr, -p.size/2, -p.size/2, p.size, p.size); }
      else { CTX.fillStyle=p.color; CTX.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.62); }
      CTX.restore();
    }
    particles=particles.filter(function(p){ return p.life>0 && p.y<window.innerHeight+50; });
    if(alive && particles.length){ raf=requestAnimationFrame(loop); }
    else { raf=null; CTX.clearRect(0,0,window.innerWidth,window.innerHeight); }
  }

  function toast(o){
    o = (typeof o==='string') ? {msg:o} : (o||{});
    if(!document.getElementById('cf-toast-css')){
      var s=document.createElement('style'); s.id='cf-toast-css';
      s.textContent=
        ".cf-toast{position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(20px);z-index:99999;max-width:min(92vw,440px);"+
        "background:linear-gradient(160deg,#141c2b,#0b1017);border:1px solid rgba(217,70,166,.4);border-radius:16px;padding:16px 20px;"+
        "box-shadow:0 18px 50px rgba(0,0,0,.6);color:#f4f0f6;font-family:system-ui,-apple-system,sans-serif;opacity:0;transition:.3s;text-align:center}"+
        ".cf-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}"+
        ".cf-toast b{display:block;font-size:1rem;font-weight:800;margin-bottom:4px;background:linear-gradient(90deg,#D946A6,#D4AF37);-webkit-background-clip:text;background-clip:text;color:transparent}"+
        ".cf-toast span{font-size:.85rem;color:#c7d0dc;line-height:1.5}";
      document.head.appendChild(s);
    }
    var t=document.createElement('div'); t.className='cf-toast';
    t.innerHTML='<b>'+(o.title||FLUJOS._default.title)+'</b><span>'+(o.msg||FLUJOS._default.msg)+'</span>';
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('on'); });
    setTimeout(function(){ t.classList.remove('on'); setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 350); }, 5000);
  }

  function originDe(anchor){
    var ox=0.5, oy=0.4;
    if(anchor && anchor.getBoundingClientRect){ var r=anchor.getBoundingClientRect(); if(r.width){ ox=(r.left+r.width/2)/window.innerWidth; oy=(r.top+r.height/2)/window.innerHeight; } }
    return {x:ox,y:oy};
  }

  window.confettiBurst = burst;

  // celebrateFlujo(clave, anchor?, opts?) — dispara el confetti + mensaje propios del caso.
  window.celebrateFlujo = function(clave, anchor, opts){
    opts = opts || {};
    var f = FLUJOS[clave] || FLUJOS._default;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(!reduce){
      burst({origin:originDe(anchor), particleCount:opts.particleCount||150, emojis:f.emojis});
      if(opts.sides!==false) setTimeout(function(){ burst({origin:{x:0.08,y:0.55},particleCount:45,emojis:f.emojis}); burst({origin:{x:0.92,y:0.55},particleCount:45,emojis:f.emojis}); }, 150);
    }
    if(opts.toast!==false) toast({title:f.title, msg:f.msg});
  };

  // Genérico / retrocompat.
  window.celebrateUpload = function(anchor, opts){
    opts = (typeof opts==='string') ? {msg:opts} : (opts||{});
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(!reduce){
      burst({origin:originDe(anchor), particleCount:150, emojis:opts.emojis, colors:opts.colors});
      setTimeout(function(){ burst({origin:{x:0.08,y:0.55},particleCount:45,emojis:opts.emojis,colors:opts.colors}); burst({origin:{x:0.92,y:0.55},particleCount:45,emojis:opts.emojis,colors:opts.colors}); }, 150);
    }
    toast({title:opts.title, msg:opts.msg});
  };
})();
