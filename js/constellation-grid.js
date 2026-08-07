/* PRODIGY — Constellation grid background (Vanilla JS, canvas)
   Malla de nodos que reacciona al cursor (resorte-masa + onda de choque).
   Overlay transparente sobre el fondo de la página. Conexiones por vecinos de grid (O(n), no O(n^2)).
   Guards: OFF móvil/touch, OFF prefers-reduced-motion, PAUSA con pestaña oculta.
   Uso: <script src="js/constellation-grid.js" defer></script>  (crea su propio canvas de fondo). */
(function(){
  "use strict";
  if (window.__constellation) return; window.__constellation = 1;

  function reduced(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches; }
  function fine(){ return !window.matchMedia || window.matchMedia('(pointer:fine)').matches; }
  if (reduced() || !fine() || window.innerWidth < 768) return;

  function start(){
    var canvas = document.createElement('canvas');
    canvas.id = 'constellation-bg';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;display:block;opacity:.85';
    canvas.setAttribute('aria-hidden','true');
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext('2d', { alpha: true });
    if(!ctx) return;

    var width=0, height=0, nodes=[], conns=[];
    var mouse = { x:-1000, y:-1000, prevX:-1000, prevY:-1000, vx:0, vy:0, radius:220 };
    function dark(){ return !document.body.classList.contains('light-mode'); }

    function initNodes(){
      nodes=[]; conns=[];
      var spacing = 66;
      var cols = Math.ceil(width/spacing)+1;
      var rows = Math.ceil(height/spacing)+1;
      for(var i=0;i<cols;i++){
        for(var j=0;j<rows;j++){
          var x=i*spacing, y=j*spacing;
          nodes.push({x:x,y:y,vx:0,vy:0,baseX:x,baseY:y,radius:Math.random()*1.2+1.2,
            label:((i*7).toString(16).toUpperCase())+':'+((j*11).toString(16).toUpperCase()),
            pulse:Math.random()*Math.PI*2});
        }
      }
      // conexiones = vecinos de grid (derecha, abajo, diagonales) -> O(n)
      function id(i,j){ return i*rows+j; }
      for(var a=0;a<cols;a++){
        for(var b=0;b<rows;b++){
          var idx=id(a,b);
          if(a+1<cols) conns.push([idx,id(a+1,b)]);
          if(b+1<rows) conns.push([idx,id(a,b+1)]);
          if(a+1<cols&&b+1<rows) conns.push([idx,id(a+1,b+1)]);
          if(a+1<cols&&b-1>=0) conns.push([idx,id(a+1,b-1)]);
        }
      }
    }
    function resize(){
      var dpr = Math.min(window.devicePixelRatio||1, 2);
      width=window.innerWidth; height=window.innerHeight;
      canvas.width=width*dpr; canvas.height=height*dpr;
      canvas.style.width=width+'px'; canvas.style.height=height+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      initNodes();
    }
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function(e){ mouse.x=e.clientX; mouse.y=e.clientY; }, {passive:true});
    window.addEventListener('mouseleave', function(){ mouse.x=-1000; mouse.y=-1000; });
    resize();

    var MAXD=90, MAXD2=MAXD*MAXD, SPRING=18, DAMP=0.82, lastTime=performance.now(), running=true;

    function render(now){
      if(!running) return;
      var dt=Math.min((now-lastTime)/1000, 0.05); lastTime=now;
      mouse.vx=(mouse.x-mouse.prevX)/(dt*1000||1); mouse.vy=(mouse.y-mouse.prevY)/(dt*1000||1);
      mouse.prevX=mouse.x; mouse.prevY=mouse.y;
      var speed=Math.sqrt(mouse.vx*mouse.vx+mouse.vy*mouse.vy);
      var isDark=dark();
      var nodeC = isDark?'255,255,255':'15,23,42';
      var accC  = isDark?'56,189,248':'2,132,199';

      ctx.clearRect(0,0,width,height);

      // física
      var i,n;
      for(i=0;i<nodes.length;i++){
        n=nodes[i]; n.pulse+=dt*3;
        var dx=mouse.x-n.x, dy=mouse.y-n.y, dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<mouse.radius && dist>0){
          var power=(1-dist/mouse.radius), force=power*(1500+speed*150), ang=Math.atan2(dy,dx);
          n.vx-=Math.cos(ang)*force*dt; n.vy-=Math.sin(ang)*force*dt;
        }
        n.vx+=(n.baseX-n.x)*SPRING*dt; n.vy+=(n.baseY-n.y)*SPRING*dt;
        n.vx*=DAMP; n.vy*=DAMP;
        n.x+=n.vx*dt*60; n.y+=n.vy*dt*60;
      }
      // conexiones (solo vecinos de grid)
      ctx.lineWidth=0.7;
      for(i=0;i<conns.length;i++){
        var a=nodes[conns[i][0]], c=nodes[conns[i][1]];
        var ndx=a.x-c.x, ndy=a.y-c.y, d2=ndx*ndx+ndy*ndy;
        if(d2<MAXD2){
          var nd=Math.sqrt(d2), alpha=(1-nd/MAXD)*(isDark?0.2:0.1);
          ctx.strokeStyle='rgba('+nodeC+','+alpha+')';
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(c.x,c.y); ctx.stroke();
        }
      }
      // nodos
      ctx.font='8px ui-monospace,SFMono-Regular,Consolas,monospace';
      for(i=0;i<nodes.length;i++){
        n=nodes[i];
        var mdx=mouse.x-n.x, mdy=mouse.y-n.y, md=Math.sqrt(mdx*mdx+mdy*mdy), near=md<mouse.radius;
        var ba=near?0.95:0.22+Math.sin(n.pulse)*0.1;
        ctx.fillStyle= near ? 'rgba('+accC+','+ba+')' : 'rgba('+nodeC+','+ba+')';
        var rr= near ? n.radius*2.2 : n.radius+Math.sin(n.pulse)*0.3;
        ctx.beginPath(); ctx.arc(n.x,n.y,Math.max(0.5,rr),0,Math.PI*2); ctx.fill();
        if(md<90){
          var ring=((n.pulse*20)%30)+4, ra=(1-ring/34)*0.4;
          ctx.strokeStyle='rgba('+accC+','+ra+')'; ctx.lineWidth=1;
          ctx.beginPath(); ctx.arc(n.x,n.y,ring,0,Math.PI*2); ctx.stroke();
          ctx.fillStyle='rgba('+accC+',0.85)'; ctx.fillText(n.label,n.x+10,n.y-10);
        }
      }
      requestAnimationFrame(render);
    }
    document.addEventListener('visibilitychange', function(){
      if(document.hidden){ running=false; }
      else if(!running){ running=true; lastTime=performance.now(); requestAnimationFrame(render); }
    });
    requestAnimationFrame(render);
  }

  if(document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
