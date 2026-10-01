/* Dock compartido arriba-derecha: campana + distintivo de rol se acomodan lado a lado
   sin importar qué script cargue primero (antes el distintivo tapaba la campana). */
function prodigyDock(){
  var d=document.getElementById('prodigy-dock');
  if(!d){
    d=document.createElement('div'); d.id='prodigy-dock'; document.body.appendChild(d);
    if(!document.getElementById('prodigy-dock-css')){
      var s=document.createElement('style'); s.id='prodigy-dock-css';
      s.textContent='#prodigy-dock{position:fixed;top:10px;right:14px;z-index:99991;display:flex;align-items:center;gap:10px;pointer-events:none}'
        +'#prodigy-dock>*{pointer-events:auto;position:relative!important;top:auto!important;right:auto!important;bottom:auto!important;left:auto!important}'
        +'#prodigy-dock>#_notif-btn{order:1}#prodigy-dock>#rolchip{order:2}'
        +'@media print{#prodigy-dock{display:none}}';
      document.head.appendChild(s);
    }
    prodigyDockReserve();
  }
  return d;
}
/* Reserva espacio para el dock: empuja el contenido y baja las barras fijas/pegajosas superiores,
   para que el dock NUNCA tape botones de la página. Una página que ya deja su propio hueco
   puede excluirse con <body data-dock-safe>. */
function prodigyDockReserve(){
  var b=document.body; if(!b || b.hasAttribute('data-dock-safe') || b.getAttribute('data-dock-reserved')) return;
  b.setAttribute('data-dock-reserved','1');
  var H=56;
  b.style.paddingTop=((parseFloat(getComputedStyle(b).paddingTop)||0)+H)+'px';
  var vh=window.innerHeight||800;
  document.querySelectorAll('body>*,body>*>*,header,nav,.navbar,.topbar,.header,.top-bar').forEach(function(el){
    if(el.id==='prodigy-dock'||el.id==='rolbar'||el.closest('#prodigy-dock')) return;
    var cs=getComputedStyle(el);
    if((cs.position==='fixed'||cs.position==='sticky') && (parseFloat(cs.top)||0)<=12){
      var r=el.getBoundingClientRect();
      if(r.height>0 && r.height<vh*0.45 && r.width>window.innerWidth*0.4) el.style.top=((parseFloat(cs.top)||0)+H)+'px';
    }
  });
}
/**
 * PRODIGY — "¿Dónde estoy?" — identificador de panel y rol
 * v1.0 · 2026-07-18
 *
 * Problema que resuelve: siendo pocas personas, una misma persona entra a
 * varios paneles (admin, diseño, producción…) y es fácil confundirse de
 * pantalla. Esto pone una franja de color inconfundible arriba, con el nombre
 * del panel y el rol con el que entraste.
 *
 * Si además eres admin, aparece un selector para saltar a cualquier panel
 * sin cerrar sesión.
 *
 * Uso:  <script src="../js/rol-actual.js?v=20260718"></script>
 */
(function () {
  'use strict';

  /* Panel -> nombre visible, color y rol que le corresponde */
  var PANELES = {
    'panel-interno-operaciones.html': ['ADMINISTRACIÓN', '#D4AF37', 'admin'],
    'operator-panel.html':            ['OPERACIÓN',      '#00d2ff', 'operator'],
    'operario-diseno.html':           ['DISEÑO CAD',     '#3b82f6', 'diseno'],
    'operario.html':                  ['PRODUCCIÓN',     '#f97316', 'fresado / impresión'],
    'taller.html':                    ['TALLER',         '#a78bfa', 'taller'],
    'calidad.html':                   ['CALIDAD',        '#00FF41', 'calidad'],
    'mensajero.html':                 ['MENSAJERÍA',     '#25D366', 'mensajero'],
    'inventario.html':                ['INVENTARIO',     '#fbbf24', 'encargado_inventario'],
    'contabilidad.html':              ['CONTABILIDAD',   '#D946A6', 'contabilidad'],
    'client-panel.html':              ['PORTAL DEL DOCTOR', '#94a3b8', 'cliente'],
    'cotizaciones.html':              ['COTIZACIONES',   '#00d2ff', 'admin / operator'],
    'bandeja-solicitudes.html':       ['SOLICITUDES',    '#D946A6', 'secretaria / admin'],
    'bandeja-whatsapp.html':          ['WHATSAPP',       '#25D366', 'secretaria / admin'],
    'gestionar-casos.html':           ['PORTAFOLIO',     '#D4AF37', 'admin'],
    'agregar-caso.html':              ['SUBIR CASO',     '#D4AF37', 'admin'],
    'admin-precios.html':             ['PRECIOS',        '#D4AF37', 'admin'],
    'configuracion.html':             ['CONFIGURACIÓN',  '#D4AF37', 'admin'],
    'pruebas-carga.html':             ['PRUEBAS',        '#f87171', 'admin'],
    'metricas.html':                  ['MÉTRICAS',       '#00d2ff', 'admin'],
    'metricas-fin.html':              ['MÉTRICAS FIN.',  '#D946A6', 'admin']
  };

  /* Adónde puede saltar el admin */
  var SALTOS = [
    ['panel-interno-operaciones.html', 'Administración'],
    ['operator-panel.html',            'Operación'],
    ['operario-diseno.html',           'Diseño CAD'],
    ['operario.html',                  'Producción'],
    ['taller.html',                    'Taller'],
    ['calidad.html',                   'Calidad'],
    ['mensajero.html',                 'Mensajería'],
    ['inventario.html',                'Inventario'],
    ['contabilidad.html',              'Contabilidad'],
    ['cotizaciones.html',              'Cotizaciones'],
    ['bandeja-whatsapp.html',          'WhatsApp'],
    ['pruebas-carga.html',             'Pruebas']
  ];

  function archivo() {
    var n = (location.pathname.split('/').pop() || 'index').toLowerCase();
    return n.indexOf('.html') > -1 ? n : n + '.html';
  }


  /* Celular: el menú lateral se vuelve un cajón con botón «Menú» (antes se ocultaba o aplastaba el contenido,
     y no había cómo navegar ni cerrar sesión). Aplica a toda página con .sidebar que cargue este script. */
  function menuMovil() {
    var lado = document.querySelector('.sidebar');
    if (!lado || document.getElementById('menubtn')) return;
    if (!lado.id) lado.id = 'menu-lateral';
    var st = document.createElement('style');
    st.textContent = '#menubtn,#menufondo{display:none}'
      + '@media(max-width:768px){'
      + '#menubtn{display:inline-flex;align-items:center;gap:7px;position:fixed;top:11px;left:12px;z-index:99992;background:rgba(10,10,10,.92);'
      + 'border:1px solid rgba(255,255,255,.18);color:#fff;border-radius:9px;padding:8px 12px;font:700 .8rem/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}'
      + 'html body .sidebar{display:flex!important;flex-direction:column;position:fixed!important;top:0!important;left:0;bottom:0;height:100vh!important;'
      + 'width:min(84vw,290px)!important;z-index:99993;overflow-y:auto;transform:translateX(-105%);transition:transform .25s ease}'
      + 'body.menu-abierto .sidebar{transform:none;box-shadow:12px 0 40px rgba(0,0,0,.6)}'
      + '#menufondo{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99992}'
      + 'body.menu-abierto #menufondo{display:block}}'
      + '@media(prefers-reduced-motion:reduce){html body .sidebar{transition:none}}'
      + '@media print{#menubtn,#menufondo{display:none!important}}';
    document.head.appendChild(st);
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'menubtn';
    b.setAttribute('aria-controls', lado.id); b.setAttribute('aria-expanded', 'false');
    b.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i> Menú';
    var fondo = document.createElement('div'); fondo.id = 'menufondo';
    function poner(abierto) { document.body.classList.toggle('menu-abierto', abierto); b.setAttribute('aria-expanded', String(abierto)); }
    b.addEventListener('click', function () { poner(!document.body.classList.contains('menu-abierto')); });
    fondo.addEventListener('click', function () { poner(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') poner(false); });
    lado.addEventListener('click', function (e) { if (e.target.closest('a,button')) poner(false); });
    document.body.appendChild(fondo); document.body.appendChild(b);
  }

  document.addEventListener('DOMContentLoaded', function () {
    menuMovil();
    var f = archivo();
    var cfg = PANELES[f];
    if (!cfg) return;
    var nombre = cfg[0], color = cfg[1], rol = cfg[2];

    var css = ''
      + '#rolbar{position:fixed;top:0;left:0;right:0;z-index:99990;height:5px;background:' + color + ';}'
      + '#rolchip{position:fixed;top:11px;right:14px;z-index:99991;display:flex;align-items:center;gap:9px;'
      + 'background:rgba(10,10,10,.92);border:1px solid ' + color + '66;border-left:3px solid ' + color + ';'
      + 'border-radius:9px;padding:6px 12px;font:600 .72rem/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;'
      + 'color:#e6e9ee;backdrop-filter:blur(6px);}'
      + '#rolchip .p{color:' + color + ';font-weight:800;letter-spacing:.6px;}'
      + '#rolchip .r{color:#94a3b8;font-size:.68rem;}'
      + '#rolsel{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#e6e9ee;'
      + 'border-radius:7px;padding:4px 7px;font-size:.7rem;font-family:inherit;cursor:pointer;color-scheme:dark;}'
      + '#rolsel option{background:#14100a;color:#f5f5f7;}'
      + '@media(max-width:640px){#rolchip{padding:5px 8px;gap:6px}#rolchip .r{display:none}#rolchip .p{font-size:.62rem;letter-spacing:.3px}#rolsel{max-width:84px;padding:3px 5px}}'
      + '#rolsalir{background:none;border:none;color:#94a3b8;cursor:pointer;padding:2px 4px;font-size:.82rem;line-height:1}#rolsalir:hover,#rolsalir:focus-visible{color:#f87171}'
      + '@media print{#rolbar,#rolchip{display:none;}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var bar = document.createElement('div'); bar.id = 'rolbar'; document.body.appendChild(bar);

    var chip = document.createElement('div');
    chip.id = 'rolchip';
    chip.setAttribute('data-tip', 'Te indica en qué panel estás y con qué rol. Sirve para no confundirte de pantalla.');
    chip.innerHTML = '<span class="p">' + nombre + '</span><span class="r">rol: ' + rol + '</span>';
    prodigyDock().appendChild(chip);

    /* Cerrar sesión siempre a mano, en cualquier panel que muestre este distintivo */
    var salir = document.createElement('button');
    salir.type = 'button'; salir.id = 'rolsalir';
    salir.title = 'Cerrar sesión'; salir.setAttribute('aria-label', 'Cerrar sesión');
    salir.innerHTML = '<i class="fas fa-right-from-bracket" aria-hidden="true"></i>';
    salir.addEventListener('click', function () {
      if (window.ProdigyAuth && ProdigyAuth.signOut) ProdigyAuth.signOut(); else location.href = '/app/login.html';
    });
    chip.appendChild(salir);

    /* Selector de panel — solo para quien es admin */
    function esAdmin() {
      if (window.PRODIGY_ROLE === 'admin') return true;
      var mail = (window.PRODIGY_EMAIL || '').toLowerCase();
      return mail === 'jackalejandroc@gmail.com' || mail === 'labdentalprodigy@gmail.com' || mail === 'gerencia@prodigylabdental.com' || mail === 'casos@prodigylabdental.com';
    }
    function ponerSelector() {
      if (!esAdmin() || document.getElementById('rolsel')) return;
      var s = document.createElement('select');
      s.id = 'rolsel';
      s.setAttribute('aria-label', 'Cambiar de panel');
      s.setAttribute('data-tip', 'Salta a otro panel sin cerrar sesión. Solo disponible para el administrador.');
      s.innerHTML = '<option value="">Ir a…</option>'
        + SALTOS.filter(function (x) { return x[0] !== f; })
                .map(function (x) { return '<option value="' + x[0] + '">' + x[1] + '</option>'; }).join('');
      s.addEventListener('change', function () {
        if (s.value) location.href = '/app/' + s.value;
      });
      chip.insertBefore(s, salir);
    }
    ponerSelector();
    // El rol se resuelve después del login: reintentar un par de veces
    var t = 0, iv = setInterval(function () {
      ponerSelector();
      if (++t > 12 || document.getElementById('rolsel')) clearInterval(iv);
    }, 500);
  });
})();
