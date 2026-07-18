/**
 * PRODIGY — Asistente del panel (tooltips + guía rápida)
 * v1.1 · 2026-07-18
 *
 * Qué hace:
 *  1. Muestra una burbuja explicativa al pasar el mouse (o al enfocar con
 *     teclado) sobre los items del menú y los botones de acción.
 *  2. Las explicaciones se asignan solas: lee el switchTab('X') del menú y la
 *     función del onclick de cada botón. No hay que tocar el HTML.
 *  3. Funciona también con botones creados dinámicamente (usa delegación).
 *  4. Botón flotante "?" con una guía rápida de todo el panel, para que
 *     alguien nuevo aprenda a usarlo sin que se lo expliquen.
 *
 * Uso:  <script src="../js/panel-tips.js?v=20260718"></script>
 * Extra: cualquier elemento con  data-tip="texto"  también muestra ayuda.
 */
(function () {
  'use strict';

  /* ── Qué hace cada sección del panel ─────────────────────────── */
  var TIPS = {
    'pedidos':      'Todos los casos del laboratorio: estado, cliente, precio y avance. Es la vista del día a día.',
    'rutador':      'Asigna cada caso al área u operario que corresponde según el tipo de trabajo.',
    'despachos':    'Casos listos para entregar: asigna mensajero, registra la entrega y sube la evidencia.',
    'torre':        'Alertas y casos que necesitan atención: retrasos, incidencias y vencimientos.',
    'fabricacion':  'Seguimiento de producción: fresado, impresión 3D y taller.',
    'clientes':     'Directorio de doctores y clínicas, con su historial de pedidos.',
    'equipo':       'Miembros del equipo PRODIGY y su información de contacto.',
    'staff':        'Crea usuarios internos y define qué puede ver cada rol (diseño, calidad, mensajero…).',
    'pedidos-doc':  'Pedidos que los doctores envían desde el portal de cliente.',
    'leads':        'Contactos y solicitudes de cotización que llegan desde la página web.',
    'portafolio':   'Sube casos terminados con fotos. Se publican de inmediato en el portafolio público de la web.',
    'metricas':     'Indicadores del negocio: volumen de casos, tiempos y desempeño.',
    'metricas-fin': 'Ingresos, costos y rentabilidad por período.',
    'analytics':    'Radar de ventas: de dónde vienen los clientes y qué está convirtiendo.',
    'reportes':     'Reportes de la operación para descargar y analizar.',
    'referidos':    'Programa de referidos: quién refirió a quién y las recompensas generadas.',
    'waitlist':     'Laboratorios en lista de espera interesados en el servicio.',
    'newsletter':   'Suscriptores del boletín y los envíos realizados.'
  };

  /* ── Qué hace cada botón (se detecta por su función onclick) ──── */
  var BTN_TIPS = {
    'cargarPedidos':          'Vuelve a cargar la lista con los datos más recientes.',
    'cargarPortafolio':       'Actualiza la lista de casos publicados.',
    'cargarClientes':         'Vuelve a cargar el directorio de clientes.',
    'cargarDespachos':        'Actualiza los despachos pendientes y en ruta.',
    'cargarTorre':            'Refresca las alertas y casos que requieren atención.',
    'cargarStaff':            'Vuelve a cargar la lista del equipo interno.',
    'exportarCSV':            'Descarga la información en un archivo CSV para abrir en Excel.',
    'subirCaso':              'Publica el caso en el portafolio público de la web.',
    'subirCasoSimple':        'Publica el caso en el portafolio público de la web.',
    'limpiarFormPortafolio':  'Borra lo escrito en el formulario para empezar de nuevo.',
    'abrirEditar':            'Edita el nombre, tipo y datos de este caso.',
    'eliminarCaso':           'Elimina este caso del portafolio. No se puede deshacer.',
    'eliminarCasoConfirm':    'Elimina este caso del portafolio. No se puede deshacer.',
    'toggleVisible':          'Muestra u oculta este caso en la web pública.',
    'moverCaso':              'Cambia el orden en que aparece el caso en el portafolio.',
    'cerrarSesion':           'Cierra tu sesión y vuelve a la pantalla de acceso.',
    'guardarTodo':            'Guarda todos los cambios pendientes de una vez.',
    'guardarUno':             'Guarda los cambios de esta fila.',
    'descartarCambios':       'Descarta los cambios sin guardar y restaura los valores.',
    'filtrar':                'Filtra la lista por esta categoría.'
  };

  /* ── "¿Qué hago aquí?" — misión de cada panel, por archivo ───── */
  var PANEL_INTRO = {
    'panel-interno-operaciones.html': ['Centro de operaciones', 'Desde aquí controlas todo: pedidos, producción, despachos, equipo y portafolio. Usa el menú de la izquierda para moverte entre secciones.'],
    'operator-panel.html':  ['Panel de operación', 'Gestiona los casos asignados y actualiza su avance para que el resto del equipo vea el estado real.'],
    'mensajero.html':       ['Tus entregas', 'Aquí ves los casos asignados para recoger y entregar. Marca cada entrega y sube la foto de evidencia.'],
    'taller.html':          ['Casos en taller', 'Trabajos asignados a tu área. Actualiza el estado a medida que avanzas para no frenar el despacho.'],
    'operario-diseno.html': ['Casos por diseñar', 'Descarga los archivos del caso, haz el diseño CAD y súbelo. Al marcarlo listo pasa a producción.'],
    'operario.html':        ['Tus casos asignados', 'Los trabajos que te tocan. Actualiza el avance de cada uno cuando lo termines.'],
    'calidad.html':         ['Control de calidad', 'Revisa los casos terminados antes de despachar: apruébalos o devuélvelos con la observación.'],
    'inventario.html':      ['Inventario', 'Existencias de materiales, entradas y salidas. Revisa las alertas de stock bajo para no quedarte sin material.'],
    'contabilidad.html':    ['Finanzas', 'Pagos, facturación e ingresos del laboratorio. Concilia lo cobrado contra lo entregado.'],
    'client-panel.html':    ['Tu portal', 'Crea pedidos, sigue el avance de tus casos y consulta tu historial y facturas.'],
    'cotizaciones.html':    ['Cotizaciones', 'Cotizaciones enviadas a los doctores y su estado (pendiente, aceptada, vencida).'],
    'gestionar-casos.html': ['Casos del portafolio', 'Administra los casos publicados: editar, reordenar, ocultar o eliminar.'],
    'agregar-caso.html':    ['Subir caso al portafolio', 'Publica un caso terminado con sus fotos y archivos. Aparece de inmediato en la web pública.'],
    'admin-precios.html':   ['Precios del catálogo', 'Los cambios aquí afectan a las cotizaciones NUEVAS. Guarda para aplicar.'],
    'configuracion.html':   ['Configuración', 'Ajustes generales de la plataforma y del negocio.'],
    'metricas.html':        ['Métricas', 'Indicadores de volumen, tiempos y desempeño del laboratorio.'],
    'metricas-churn.html':  ['Retención de clientes', 'Doctores que dejaron de pedir. Sirve para reactivarlos a tiempo.'],
    'metricas-referidos.html': ['Referidos', 'Rendimiento del programa de referidos y recompensas generadas.'],
    'metricas-seo.html':    ['SEO', 'Cómo se está posicionando la web en buscadores.'],
    'inventario-materiales.html': ['Materiales', 'Control de materiales del laboratorio.'],
    'referidos-portal.html': ['Portal de referidos', 'Comparte tu enlace y sigue las recompensas que generas.'],
    'onboarding.html':      ['Completa tu perfil', 'Estos datos se usan para tus pedidos y facturación. Solo se piden una vez.']
  };

  /* Agrupación para la guía rápida */
  var GUIA = [
    ['Operación diaria', ['pedidos', 'rutador', 'despachos', 'torre', 'fabricacion']],
    ['Clientes y equipo', ['clientes', 'equipo', 'staff', 'pedidos-doc', 'leads']],
    ['Portafolio', ['portafolio']],
    ['Analítica', ['metricas', 'metricas-fin', 'analytics', 'reportes']],
    ['Crecimiento', ['referidos', 'waitlist', 'newsletter']]
  ];

  /* ── Estilos ──────────────────────────────────────────────────── */
  var css = ''
    + '#ptip{position:fixed;z-index:100000;max-width:280px;background:#14100a;color:#f5f5f7;'
    + 'border:1px solid rgba(212,175,55,.45);border-radius:10px;padding:10px 13px;font-size:.8rem;'
    + 'line-height:1.5;box-shadow:0 8px 26px rgba(0,0,0,.6);pointer-events:none;opacity:0;'
    + 'transform:translateY(4px);transition:opacity .13s ease,transform .13s ease;}'
    + '#ptip.show{opacity:1;transform:translateY(0);}'
    + '#ptip b{color:#D4AF37;display:block;margin-bottom:3px;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px;}'
    + '#phelp-btn{position:fixed;right:18px;bottom:18px;z-index:99998;width:44px;height:44px;border-radius:50%;'
    + 'background:linear-gradient(135deg,#D4AF37,#B8860B);color:#000;border:none;font-size:1.25rem;font-weight:900;'
    + 'cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;}'
    + '#phelp-btn:hover{filter:brightness(1.08);}'
    + '#phelp-btn:focus-visible{outline:3px solid #00d2ff;outline-offset:2px;}'
    + '#phelp-panel{position:fixed;right:18px;bottom:72px;z-index:99999;width:min(380px,calc(100vw - 36px));'
    + 'max-height:min(70vh,560px);overflow:auto;background:#0d0a00;border:1px solid rgba(212,175,55,.35);'
    + 'border-radius:14px;padding:18px 20px;box-shadow:0 12px 40px rgba(0,0,0,.7);display:none;}'
    + '#phelp-panel.show{display:block;}'
    + '#phelp-panel h3{margin:0 0 4px;font-size:1rem;color:#fff;}'
    + '#phelp-panel .sub{color:#94a3b8;font-size:.78rem;margin:0 0 14px;}'
    + '#phelp-panel .grp{font-size:.68rem;text-transform:uppercase;letter-spacing:.8px;color:#D4AF37;'
    + 'font-weight:800;margin:14px 0 6px;}'
    + '#phelp-panel .row{padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06);}'
    + '#phelp-panel .row:last-child{border-bottom:none;}'
    + '#phelp-panel .row .n{font-weight:700;font-size:.83rem;color:#f5f5f7;}'
    + '#phelp-panel .row .d{font-size:.76rem;color:#94a3b8;line-height:1.45;margin-top:2px;}'
    + '#phelp-close{position:absolute;top:10px;right:12px;background:none;border:none;color:#94a3b8;'
    + 'font-size:1.3rem;cursor:pointer;line-height:1;}'
    + '#pintro{position:relative;background:linear-gradient(135deg,rgba(212,175,55,.10),rgba(212,175,55,.03));'
    + 'border:1px solid rgba(212,175,55,.28);border-left:3px solid #D4AF37;border-radius:12px;'
    + 'padding:14px 44px 14px 16px;margin:0 0 20px;}'
    + '#pintro .t{font-weight:800;color:#D4AF37;font-size:.9rem;margin-bottom:3px;}'
    + '#pintro .x{font-size:.83rem;color:#cbd5e1;line-height:1.55;}'
    + '#pintro button{position:absolute;top:8px;right:10px;background:none;border:none;color:#94a3b8;'
    + 'font-size:1.15rem;cursor:pointer;line-height:1;}'
    + '#pintro button:hover{color:#fff;}'
    + '@media(prefers-reduced-motion:reduce){#ptip{transition:none;}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ── Burbuja ──────────────────────────────────────────────────── */
  var tip = document.createElement('div');
  tip.id = 'ptip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;

  /* Devuelve el texto de ayuda del elemento, asignándolo si hace falta */
  function tipFor(el) {
    if (!el || !el.getAttribute) return null;
    if (el.hasAttribute('data-tip')) return el.getAttribute('data-tip');
    var oc = el.getAttribute('onclick') || '';
    var m = oc.match(/switchTab\(\s*['"]([a-z0-9-]+)['"]/i);
    if (m && TIPS[m[1]]) { el.setAttribute('data-tip', TIPS[m[1]]); return TIPS[m[1]]; }
    var b = oc.match(/([A-Za-z_$][\w$]*)\s*\(/);
    if (b && BTN_TIPS[b[1]]) { el.setAttribute('data-tip', BTN_TIPS[b[1]]); return BTN_TIPS[b[1]]; }
    return null;
  }

  function show(el, txt) {
    var titulo = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 34);
    tip.innerHTML = '';
    if (titulo) { var b = document.createElement('b'); b.textContent = titulo; tip.appendChild(b); }
    tip.appendChild(document.createTextNode(txt));
    tip.hidden = false;
    var r = el.getBoundingClientRect();
    tip.style.left = '-9999px'; tip.style.top = '0'; tip.classList.add('show');
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = r.right + 12, top = r.top + (r.height / 2) - (th / 2);
    if (left + tw > window.innerWidth - 10) left = Math.max(10, r.left - tw - 12);
    top = Math.min(Math.max(10, top), window.innerHeight - th - 10);
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
  }
  function hide() { tip.classList.remove('show'); tip.hidden = true; }

  /* ── Delegación: sirve también para botones creados después ───── */
  function onEnter(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var el = t.closest('[data-tip],[onclick]');
    if (!el) return;
    var txt = tipFor(el);
    if (txt) show(el, txt);
  }

  /* ── Tarjeta "¿qué hago aquí?" (una por panel, se puede ocultar) ── */
  function intro() {
    var archivo = (location.pathname.split('/').pop() || 'index').toLowerCase();
    if (archivo.indexOf('.html') === -1) archivo += '.html';   // URLs limpias
    var info = PANEL_INTRO[archivo];
    if (!info) return;
    var KEY = 'pintro_oculto_' + archivo;
    try { if (localStorage.getItem(KEY) === '1') return; } catch (e) {}

    // Insertar al inicio del contenido principal (o del body si no hay)
    var host = document.getElementById('main-content')
            || document.querySelector('main, .main, .container, .content')
            || document.body;
    var box = document.createElement('div');
    box.id = 'pintro';
    box.innerHTML = '<div class="t">' + info[0] + '</div><div class="x">' + info[1] + '</div>'
      + '<button type="button" aria-label="Ocultar esta ayuda" title="No volver a mostrar">&times;</button>';
    box.querySelector('button').addEventListener('click', function () {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      box.remove();
    });
    host.insertBefore(box, host.firstChild);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(tip);
    intro();

    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout', hide);
    document.addEventListener('focusin', onEnter);
    document.addEventListener('focusout', hide);
    window.addEventListener('scroll', hide, true);

    /* Botón de ayuda + guía rápida */
    var btn = document.createElement('button');
    btn.id = 'phelp-btn'; btn.type = 'button'; btn.textContent = '?';
    btn.setAttribute('aria-label', 'Guía rápida del panel');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'phelp-panel');
    btn.setAttribute('data-tip', 'Abre la guía rápida: explica para qué sirve cada sección del panel.');

    var pan = document.createElement('div');
    pan.id = 'phelp-panel'; pan.setAttribute('role', 'dialog');
    pan.setAttribute('aria-label', 'Guía rápida del panel');
    /* Solo listar las secciones que existen EN ESTA página (cada rol ve las suyas) */
    var presentes = {};
    document.querySelectorAll('[onclick]').forEach(function (el) {
      var m = (el.getAttribute('onclick') || '').match(/switchTab\(\s*['"]([a-z0-9-]+)['"]/i);
      if (m) presentes[m[1]] = true;
    });
    var hayTabs = Object.keys(presentes).length > 0;

    var html = '<button id="phelp-close" type="button" aria-label="Cerrar guía">&times;</button>'
      + '<h3>Guía rápida</h3><p class="sub">Para qué sirve cada sección. Pasa el mouse sobre el menú o los botones para ver su ayuda.</p>';
    if (hayTabs) {
      GUIA.forEach(function (g) {
        var items = g[1].filter(function (k) { return TIPS[k] && presentes[k]; });
        if (!items.length) return;
        html += '<div class="grp">' + g[0] + '</div>';
        items.forEach(function (k) {
          var nombre = k.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
          html += '<div class="row"><div class="n">' + nombre + '</div><div class="d">' + TIPS[k] + '</div></div>';
        });
      });
    } else {
      html += '<div class="row"><div class="d">Pasa el mouse por encima de los botones de esta pantalla '
        + 'y aparecerá una nota explicando qué hace cada uno.</div></div>';
    }
    pan.innerHTML = html;

    document.body.appendChild(pan);
    document.body.appendChild(btn);

    function toggle(open) {
      pan.classList.toggle('show', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? '×' : '?';
    }
    btn.addEventListener('click', function () { toggle(!pan.classList.contains('show')); });
    pan.querySelector('#phelp-close').addEventListener('click', function () { toggle(false); btn.focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && pan.classList.contains('show')) { toggle(false); btn.focus(); }
    });
  });

  /* API por si se quieren agregar ayudas desde otra página */
  window.PanelTips = { tips: TIPS, botones: BTN_TIPS };
})();
