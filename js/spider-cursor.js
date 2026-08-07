/* PRODIGY — Spider cursor background (Vanilla JS, canvas)
   Fondo full-screen que sigue el cursor (efecto malla / nube de puntos).
   Guards: OFF en móvil/touch, OFF con prefers-reduced-motion, PAUSA con pestaña oculta.
   Uso: <script src="js/spider-cursor.js" defer></script>  (crea su propio canvas de fondo). */
(function(){
  "use strict";
  if (window.__spiderCursor) return; window.__spiderCursor = 1;

  function reduced(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches; }
  function fine(){ return !window.matchMedia || window.matchMedia('(pointer:fine)').matches; }
  // No arrancar en móvil / touch / reduced-motion
  if (reduced() || !fine() || window.innerWidth < 768) return;

  function start(){
    var canvas = document.createElement('canvas');
    canvas.id = 'spider-bg';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;display:block;opacity:.55';
    canvas.setAttribute('aria-hidden','true');
    document.body.insertBefore(canvas, document.body.firstChild);

    var ctx = canvas.getContext('2d');
    var w, h;
    var sin=Math.sin, cos=Math.cos, PI=Math.PI, hypot=Math.hypot, min=Math.min, max=Math.max;

    function rnd(x, dx){ x=(x===undefined?1:x); dx=(dx===undefined?0:dx); return Math.random()*x+dx; }
    function many(n, f){ var a=[]; for(var i=0;i<n;i++) a.push(f(i)); return a; }
    function lerp(a,b,t){ return a+(b-a)*t; }
    function noise(x,y,t){ t=(t===undefined?101:t);
      var w0=sin(0.3*x+1.4*t+2.0+2.5*sin(0.4*y+-1.3*t+1.0));
      var w1=sin(0.2*y+1.5*t+2.8+2.3*sin(0.5*x+-1.2*t+0.5));
      return w0+w1; }
    function pt(x,y){ return {x:x,y:y}; }
    function drawCircle(x,y,r){ ctx.beginPath(); ctx.ellipse(x,y,r,r,0,0,PI*2); ctx.fill(); }
    function drawLine(x0,y0,x1,y1){ ctx.beginPath(); ctx.moveTo(x0,y0);
      many(100,function(i){ i=(i+1)/100; var x=lerp(x0,x1,i), y=lerp(y0,y1,i); var k=noise(x/5+x0,y/5+y0)*2; ctx.lineTo(x+k,y+k); });
      ctx.stroke(); }

    function spawn(){
      var pts = many(300, function(){ return {x:rnd(window.innerWidth), y:rnd(window.innerHeight), len:0, r:0}; });
      var pts2 = many(9, function(i){ return {x:cos(i/9*PI*2), y:sin(i/9*PI*2)}; });
      var seed=rnd(100);
      var tx=rnd(window.innerWidth), ty=rnd(window.innerHeight);
      var x=rnd(window.innerWidth), y=rnd(window.innerHeight);
      var kx=rnd(0.5,0.5), ky=rnd(0.5,0.5);
      var walk=pt(rnd(50,50), rnd(50,50));
      var r=window.innerWidth/rnd(100,150);
      function paintPt(p){
        pts2.forEach(function(p2){ if(!p.len) return;
          drawLine(lerp(x+p2.x*r, p.x, p.len*p.len), lerp(y+p2.y*r, p.y, p.len*p.len), x+p2.x*r, y+p2.y*r); });
        drawCircle(p.x, p.y, p.r);
      }
      return {
        follow:function(nx,ny){ tx=nx; ty=ny; },
        tick:function(t){
          var smx=cos(t*kx+seed)*walk.x, smy=sin(t*ky+seed)*walk.y;
          var fx=tx+smx, fy=ty+smy;
          x += min(window.innerWidth/100, (fx-x)/10);
          y += min(window.innerWidth/100, (fy-y)/10);
          var i=0;
          pts.forEach(function(p){
            var dx=p.x-x, dy=p.y-y, len=hypot(dx,dy);
            var rr=min(2, window.innerWidth/len/5);
            var inc = len<window.innerWidth/10 && i++<8;
            var dir = inc?0.1:-0.1; if(inc) rr*=1.5;
            p.r=rr; p.len=max(0, min(p.len+dir,1)); paintPt(p);
          });
        }
      };
    }

    var spiders = many(2, spawn);
    window.addEventListener('pointermove', function(e){ spiders.forEach(function(s){ s.follow(e.clientX, e.clientY); }); }, {passive:true});

    var running = true;
    function anim(t){
      if(!running) return;
      if(w!==window.innerWidth) w=canvas.width=window.innerWidth;
      if(h!==window.innerHeight) h=canvas.height=window.innerHeight;
      ctx.fillStyle = "#050505"; drawCircle(0,0,w*10);
      ctx.fillStyle = ctx.strokeStyle = "#dfeaf5";
      t/=1000; spiders.forEach(function(s){ s.tick(t); });
      requestAnimationFrame(anim);
    }
    document.addEventListener('visibilitychange', function(){
      if(document.hidden){ running=false; }
      else if(!running){ running=true; requestAnimationFrame(anim); }
    });
    requestAnimationFrame(anim);
  }

  if(document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
