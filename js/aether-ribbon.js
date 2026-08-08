/* PRODIGY — Aether ribbon mesh (Vanilla JS, Canvas 2D · sin dependencias)
   Cintas trigonométricas que ondulan detrás de un hero, reactivas al cursor + onda al hacer clic.
   Overlay TRANSPARENTE (no pinta fondo): se dibuja sobre el fondo oscuro del hero.
   Uso:  <section class="hero" data-aether data-colors="#D946A6,#D4AF37,#00d2ff"> … </section>
         + este script. El contenido del hero debe ir con position:relative;z-index:1.
   Guards: OFF prefers-reduced-motion (una pasada estática), PAUSA con pestaña oculta. */
(function(){
  "use strict";
  if (window.__aether) return; window.__aether = 1;
  function reduced(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches; }

  function build(mount){
    var colors = (mount.getAttribute('data-colors')||'#D946A6,#D4AF37,#00d2ff').split(',');
    var cs = getComputedStyle(mount);
    if (cs.position === 'static') mount.style.position = 'relative';

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0';
    canvas.setAttribute('aria-hidden','true');
    mount.insertBefore(canvas, mount.firstChild);
    var ctx = canvas.getContext('2d', { alpha:true }); if(!ctx) return;

    var W=0, H=0, dpr=Math.min(window.devicePixelRatio||1,2), small=window.innerWidth<768;
    var mouse={x:0,y:0,tx:0,ty:0};
    var ripple={x:0,y:0,r:0,max:0,active:false};
    var t=0, last=performance.now(), running=true, stat=reduced();

    function resize(){
      var r=mount.getBoundingClientRect(); W=r.width; H=r.height;
      canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      ripple.max=Math.max(W,H); small=window.innerWidth<768;
    }
    window.addEventListener('resize', resize); resize();

    if(!stat){
      window.addEventListener('mousemove', function(e){
        var r=mount.getBoundingClientRect(); mouse.tx=e.clientX-r.left-W/2; mouse.ty=e.clientY-r.top-H/2;
      }, {passive:true});
      mount.addEventListener('click', function(e){
        var r=mount.getBoundingClientRect(); ripple.x=e.clientX-r.left; ripple.y=e.clientY-r.top; ripple.r=0; ripple.active=true;
      });
    }

    function noise(x,tt,o){ return (Math.sin(x*0.0012+tt*0.25+o)+Math.cos(x*0.0028-tt*0.4+o*2))/2; }
    function rgba(hex,a){ var h=hex.replace('#','').trim(); var n=parseInt(h,16); return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')'; }

    var layers=[
      {n:small?8:13, step:small?9:5, off:0,   freq:0.0035, amp:52, speed:1.1, primary:true },
      {n:small?5:9,  step:small?10:6, off:1.2, freq:0.0075, amp:28, speed:0.7, primary:false}
    ];

    function frame(now){
      if(!running) return;
      var dt=Math.min((now-last)/1000,0.05); last=now; t+=dt*0.85;
      var lerp=1-Math.exp(-9*dt);
      mouse.x+=(mouse.tx-mouse.x)*lerp; mouse.y+=(mouse.ty-mouse.y)*lerp;
      ctx.clearRect(0,0,W,H);
      if(ripple.active){ ripple.r+=14; if(ripple.r>ripple.max) ripple.active=false; }

      for(var li=0; li<layers.length; li++){
        var L=layers[li];
        ctx.globalCompositeOperation='lighter';
        var g=ctx.createLinearGradient(0,0,W,0);
        g.addColorStop(0,   rgba(colors[0], L.primary?0.08:0.02));
        g.addColorStop(0.5, rgba(colors[1], L.primary?0.55:0.24));
        g.addColorStop(1,   rgba(colors[2]||colors[0], L.primary?0.08:0.02));
        for(var r=0;r<L.n;r++){
          var prog=r/L.n;
          var yOff=H*0.20 + r*(H*0.052) + L.off*28;
          var baseA=(1-prog*0.7)*0.5;
          ctx.beginPath();
          for(var x=0;x<=W+L.step;x+=L.step){
            var env=Math.sin((x/W)*Math.PI);
            var nF=1+noise(x,t,prog)*0.18, nA=1+noise(x*2,-t,prog*0.5)*0.15;
            var w1=Math.sin(x*(L.freq*nF)+t*L.speed+r*0.18)*(L.amp*env*nA);
            var w2=Math.cos(x*0.008-t*0.7+r*0.1)*(18*env);
            var cursorX=W/2+mouse.x, dmx=Math.abs(x-cursorX), mr=L.primary?300:180;
            var mf=Math.exp(-Math.pow(dmx/mr,2));
            var mdisp=Math.sin(x*0.015+t*2.6)*(mf*(L.primary?45:22)*env);
            var rip=0;
            if(ripple.active){ var rf=Math.exp(-Math.pow(Math.abs(dmx-ripple.r)/26,2)); rip=rf*18*(1.6-prog); }
            var y=yOff+w1+w2+mdisp+rip+mouse.y*(prog*0.1);
            if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
          }
          ctx.globalAlpha=baseA;
          ctx.strokeStyle=g;
          ctx.lineWidth=(L.primary?1.4:0.8)+(1-prog)*0.5;
          ctx.stroke();
        }
      }
      ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
      if(!stat && running) requestAnimationFrame(frame);
    }

    document.addEventListener('visibilitychange', function(){
      if(stat) return;
      if(document.hidden){ running=false; }
      else if(!running){ running=true; last=performance.now(); requestAnimationFrame(frame); }
    });

    if(stat){ t=2.0; frame(performance.now()); }   // reduced-motion: una pasada estática
    else requestAnimationFrame(frame);
  }

  function init(){ var l=document.querySelectorAll('[data-aether]'); for(var i=0;i<l.length;i++) build(l[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
