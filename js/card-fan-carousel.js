/* PRODIGY — Card Fan Carousel (Vanilla JS + GSAP)
   Uso: initCardFan(mountEl, [{img, cap, link}], {maxWidth})
   Requiere window.gsap (CDN). Si no está o prefers-reduced-motion: fallback a scroll-snap accesible. */
(function(){
  "use strict";
  if (window.initCardFan) return;

  // ── CSS auto-inyectado (una sola vez) ──
  if (!document.getElementById('cf-styles')) {
    var css = document.createElement('style'); css.id='cf-styles';
    css.textContent =
    ".cf-mount{width:100%}"+
    ".fan-layout{position:relative;display:flex;justify-content:center;align-items:center;width:100%;max-width:80rem;margin:0 auto;height:34rem}"+
    ".fan-card{position:absolute;left:50%;top:50%;width:14rem;aspect-ratio:4/7;margin-left:-7rem;margin-top:-12.25rem;border-radius:16px;overflow:hidden;box-shadow:0 16px 46px rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.08);will-change:transform,opacity;cursor:pointer;background:#0d1525;text-decoration:none;display:block}"+
    ".fan-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:10}"+
    ".fan-card .cap{position:absolute;left:0;right:0;bottom:0;z-index:11;padding:14px 12px 11px;font-size:.78rem;font-weight:700;text-align:left;background:linear-gradient(0deg,rgba(0,0,0,.82),transparent);color:#fff}"+
    "@media(max-width:1024px){.fan-layout{height:30rem}}"+
    "@media(max-width:768px){.fan-layout{height:27rem}.fan-card{width:12rem;margin-left:-6rem;margin-top:-10.5rem}}"+
    "@media(max-width:480px){.fan-layout{height:23rem}.fan-card{width:10.5rem;margin-left:-5.25rem;margin-top:-9.19rem}}"+
    ".fan-nav{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:14px}"+
    ".fan-arrow{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;border:1.5px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:rgba(255,255,255,.65);font-size:1.3rem;line-height:1;cursor:pointer;outline:none;transition:.25s}"+
    ".fan-arrow:hover{border-color:rgba(255,255,255,.3);color:#fff}.fan-arrow:active{opacity:.7}"+
    ".fan-dots{display:flex;align-items:center;gap:7px}"+
    ".fan-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.16);transition:.3s;cursor:pointer}"+
    ".fan-dot.on{background:rgba(255,255,255,.85);transform:scale(1.35)}"+
    /* lightbox (ampliar foto) */
    ".cf-lightbox{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.9);opacity:0;transition:opacity .25s;cursor:zoom-out;padding:24px}"+
    ".cf-lightbox.on{opacity:1}"+
    ".cf-lightbox img{max-width:min(92vw,900px);max-height:90vh;border-radius:12px;box-shadow:0 20px 70px rgba(0,0,0,.7);object-fit:contain}"+
    ".cf-lightbox .cf-cap{position:absolute;bottom:18px;left:0;right:0;text-align:center;color:#fff;font:600 .9rem system-ui;text-shadow:0 2px 12px #000}"+
    ".cf-lightbox .cf-x{position:absolute;top:16px;right:22px;color:#fff;font-size:2.2rem;line-height:1;cursor:pointer;opacity:.85}"+
    /* fallback estático (reduced-motion o sin GSAP) */
    ".cf-static .fan-layout{height:auto;display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px 4px 12px;justify-content:flex-start}"+
    ".cf-static .fan-card{position:relative;left:auto;top:auto;margin:0;flex:0 0 auto;scroll-snap-align:center;transform:none!important;width:12rem}"+
    ".cf-static .fan-nav{display:none!important}";
    document.head.appendChild(css);
  }

  function openLightbox(src, cap){
    var lb=document.createElement('div');lb.className='cf-lightbox';
    var safe=String(cap||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    lb.innerHTML='<span class="cf-x" aria-hidden="true">×</span><img src="'+src+'" alt="'+safe.replace(/"/g,'&quot;')+'">'+(cap?'<div class="cf-cap">'+safe+'</div>':'');
    document.body.appendChild(lb);
    requestAnimationFrame(function(){lb.classList.add('on');});
    function close(){lb.classList.remove('on');setTimeout(function(){if(lb.parentNode)lb.parentNode.removeChild(lb);},260);document.removeEventListener('keydown',onKey);}
    lb.addEventListener('click',close);
    function onKey(e){if(e.key==='Escape')close();}
    document.addEventListener('keydown',onKey);
  }

  var MAX_VISIBLE=7, HALF=3;
  var FAN=[
    {rot:-21,scale:0.7756,x:-30,y:7.3,z:1},{rot:-14,scale:0.8498,x:-22,y:4.0,z:2},
    {rot:-7,scale:0.9346,x:-11,y:1.3,z:3},{rot:0,scale:1.0,x:0,y:0.0,z:10},
    {rot:7,scale:0.9346,x:11,y:1.3,z:3},{rot:14,scale:0.8498,x:22,y:4.0,z:2},
    {rot:21,scale:0.7756,x:30,y:7.3,z:1}
  ];
  function respMult(w){return w<480?0.28:w<640?0.38:w<768?0.5:w<1024?0.75:1.0;}
  function heightMult(w){var ideal=w<480?352:w<640?416:w<768?448:w<1024?544:608;var a=window.innerHeight*0.7;return a>=ideal?1:a/ideal;}
  function slotConfig(total,slot){
    if(total>=MAX_VISIBLE)return FAN[slot];
    var c=total>>1;var d=total>1?(slot-c)/c:0;var ad=Math.abs(d);
    return {rot:d*21,scale:1.0-0.2244*ad*ad,x:d*30,y:ad*ad*7.3,z:10-Math.abs(slot-c)};
  }

  function initCardFan(mount, cards){
    if(!mount||!cards||!cards.length)return;
    mount.classList.add('cf-mount');
    var layout=document.createElement('div');layout.className='fan-layout';
    cards.forEach(function(c,i){
      var el=document.createElement(c.link?'a':'div');el.className='fan-card';
      if(c.link){el.href=c.link;el.target=/^https?:/i.test(c.link)?'_blank':'_self';el.rel='noopener noreferrer';}
      else{el.style.cursor='zoom-in';el.addEventListener('click',function(ev){ev.preventDefault();openLightbox(c.img,c.cap);});}
      var cap=(c.cap||'').replace(/"/g,'&quot;');
      el.innerHTML='<img src="'+c.img+'" loading="lazy" alt="'+cap+'">'+(c.cap?'<span class="cap">'+c.cap+'</span>':'');
      layout.appendChild(el);
    });
    mount.innerHTML='';mount.appendChild(layout);

    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(reduce||!window.gsap){ mount.classList.add('cf-static'); return; }
    var gsap=window.gsap;

    var total=cards.length, needsPag=total>MAX_VISIBLE;
    var nav=document.createElement('div');nav.className='fan-nav';
    var dotsWrap=document.createElement('div');dotsWrap.className='fan-dots';
    var prevBtn=document.createElement('button');prevBtn.className='fan-arrow';prevBtn.setAttribute('aria-label','Anterior');prevBtn.innerHTML='‹';
    var nextBtn=document.createElement('button');nextBtn.className='fan-arrow';nextBtn.setAttribute('aria-label','Siguiente');nextBtn.innerHTML='›';
    nav.appendChild(prevBtn);nav.appendChild(dotsWrap);nav.appendChild(nextBtn);
    if(needsPag){mount.appendChild(nav);}

    var centerIndex=needsPag?HALF:total>>1;
    var isAnimating=false,hasEntered=false,direction=null,prevVisible=new Set(),cleanup=null;
    var cardEls=Array.prototype.slice.call(layout.querySelectorAll('.fan-card'));

    function visibleMap(center){
      var m=new Map();
      if(!needsPag){cardEls.forEach(function(_,i){m.set(i,i);});return m;}
      for(var s=0;s<MAX_VISIBLE;s++){m.set(((center+s-HALF)%total+total)%total,s);}
      return m;
    }
    function render(){
      if(cleanup)cleanup();
      var vmap=visibleMap(centerIndex),prev=prevVisible,dir=direction,first=!hasEntered;
      var mult=respMult(window.innerWidth),hM=heightMult(window.innerWidth);
      var slotCount=needsPag?MAX_VISIBLE:total,cfg=function(s){return slotConfig(slotCount,s);};
      if(first)isAnimating=true;
      var done=0,vc=vmap.size;
      function onDone(){if(++done>=vc){isAnimating=false;if(first)hasEntered=true;}}
      cardEls.forEach(function(card,ci){
        var slot=vmap.get(ci),was=prev.has(ci);
        if(slot!==undefined){
          var p=cfg(slot),target={x:(p.x*mult)+'rem',y:(p.y*hM)+'rem',rotation:p.rot,scale:p.scale,opacity:1,zIndex:p.z};
          if(first){gsap.set(card,{x:0,y:(12*hM)+'rem',rotation:0,scale:0.5,opacity:0});gsap.to(card,Object.assign({},target,{duration:1.2,ease:"elastic.out(1.05,.78)",delay:0.2+slot*0.06,onComplete:onDone}));}
          else if(!was){var ex=dir==='right'?40:-40;gsap.set(card,{x:ex+'rem',y:(p.y*hM)+'rem',rotation:dir==='right'?30:-30,scale:0.5,opacity:0});gsap.to(card,Object.assign({},target,{duration:0.6,ease:"power2.out",onComplete:onDone}));}
          else{gsap.to(card,Object.assign({},target,{duration:0.5,ease:"power2.out",onComplete:onDone}));}
        }else if(was){var exx=dir==='right'?-40:40;gsap.to(card,{x:exx+'rem',opacity:0,scale:0.5,rotation:dir==='right'?-30:30,duration:0.4,ease:"power2.in",zIndex:0});}
        else if(first){gsap.set(card,{opacity:0,scale:0.3,x:0,y:0,zIndex:0});}
      });
      prevVisible=new Set(vmap.keys());
      // hover
      var entries=[];cardEls.forEach(function(el,i){var s=vmap.get(i);if(s!==undefined)entries.push({el:el,slot:s});});
      entries.sort(function(a,b){return a.slot-b.slot;});
      var activeSlot=null,leaveTimer=null,centerSlot=entries.length>>1;
      function hoverLayout(hovered){
        var mm=respMult(window.innerWidth),hh=heightMult(window.innerWidth);
        entries.forEach(function(o){
          var base=cfg(o.slot),tx=base.x*mm,ty=base.y*hh,tr=base.rot,ts=base.scale,delay=0;
          if(hovered!==null){var dist=Math.abs(o.slot-hovered);delay=dist*0.02;
            if(o.slot===hovered){ty-=2.5*hh;ts*=1.08;}
            else{var norm=centerSlot>0?(o.slot-centerSlot)/centerSlot:0;var push=8*(1-Math.abs(norm))*(1+0.2*Math.max(0,3-dist));
              if(o.slot<hovered){tx-=push*mm;tr-=3/(dist+1);}else{tx+=push*mm;tr+=3/(dist+1);}
              if(o.slot===entries.length-1&&hovered<centerSlot)ty-=1*hh;if(o.slot===0&&hovered>centerSlot)ty-=1*hh;}
          }else{delay=Math.abs(o.slot-centerSlot)*0.02;}
          gsap.to(o.el,{x:tx+'rem',y:ty+'rem',rotation:tr,scale:ts,duration:0.5,delay:delay,ease:"elastic.out(1,.75)",overwrite:"auto"});
          gsap.set(o.el,{zIndex:base.z});
        });
      }
      var enterH=entries.map(function(o){var h=function(){if(isAnimating)return;if(leaveTimer){clearTimeout(leaveTimer);leaveTimer=null;}if(activeSlot!==o.slot){activeSlot=o.slot;hoverLayout(o.slot);}};o.el.addEventListener('mouseenter',h);return {el:o.el,h:h};});
      function onLeave(){if(isAnimating)return;if(leaveTimer)clearTimeout(leaveTimer);leaveTimer=setTimeout(function(){activeSlot=null;hoverLayout(null);},50);}
      layout.addEventListener('mouseleave',onLeave);
      function onResize(){if(!isAnimating)hoverLayout(activeSlot);}
      window.addEventListener('resize',onResize);
      cleanup=function(){enterH.forEach(function(x){x.el.removeEventListener('mouseenter',x.h);});layout.removeEventListener('mouseleave',onLeave);window.removeEventListener('resize',onResize);if(leaveTimer)clearTimeout(leaveTimer);};
    }
    function updateDots(){Array.prototype.forEach.call(dotsWrap.children,function(d,i){d.classList.toggle('on',i===centerIndex);});}
    function cycle(dir){if(isAnimating||!needsPag)return;isAnimating=true;direction=dir;centerIndex=dir==='right'?(centerIndex+1)%total:(centerIndex-1+total)%total;render();updateDots();}
    if(needsPag){
      cards.forEach(function(_,i){var d=document.createElement('span');d.className='fan-dot'+(i===centerIndex?' on':'');d.addEventListener('click',function(){if(isAnimating)return;var diff=((i-centerIndex)%total+total)%total;cycle(diff<=total/2?'right':'left');});dotsWrap.appendChild(d);});
      prevBtn.addEventListener('click',function(){cycle('left');});
      nextBtn.addEventListener('click',function(){cycle('right');});
    }
    render();
  }
  window.initCardFan=initCardFan;
})();
