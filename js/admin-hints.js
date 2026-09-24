/* PRODIGY — Ayuda contextual del menú admin.
   Al pasar el mouse por una opción muestra, en una frase, QUÉ HACE y cuándo usarla.
   Pensado para que cualquier persona que ayude con la web sepa a dónde ir. */
(function () {
  var H = {
    'tab:pedidos': 'Todos los casos del laboratorio: estado, pagos y producción. Empieza aquí cada día.',
    'bandeja-solicitudes.html': 'Solicitudes nuevas desde la web (escáner, domicilio, alineadores). Se cotizan y se convierten en caso.',
    'rastreo.html': 'Dónde está físicamente cada caso y quién lo tiene ahora. Historial de movimientos.',
    'tab:torre': 'Urgencias e incidencias abiertas. Si ves un número rojo, revísalo primero.',
    'reportes-web.html': 'Problemas que reportan operarios, doctores y visitantes con «¿Algo falla?», y errores que la web detecta sola.',
    'tab:fabricacion': 'Solicitudes de fabricación y cotizaciones que esperan respuesta.',
    'tab:despachos': 'Asignar casos terminados a un mensajero y seguir la entrega.',
    'tab:rutador': 'Tablero por área (diseño, fresado, impresión, calidad): quién está haciendo qué.',
    'ficha-caso.html': 'Busca un caso por su código y ve toda su información en una sola página.',
    'clientes.html': 'Doctores registrados: código DR-####, contacto y cuántos casos llevan.',
    'tab:pedidos-doc': 'Pedidos que los doctores hicieron desde su propio portal.',
    'cotizaciones.html': 'Cotizaciones enviadas y su estado (aceptada, rechazada, vencida).',
    'alineadores.html': 'Casos de alineadores: cuentas con el cliente y pagos a la técnica.',
    'tab:clientes': 'Lista antigua de clientes (antes del registro de doctores). Solo para consulta.',
    'gestionar-usuarios.html': 'Crear cuentas del equipo, darles roles, desactivarlas o borrarlas.',
    'papeleria.html': 'Protocolos por área y por tipo de trabajo, listos para imprimir.',
    'inventario.html': 'Materiales en stock, entradas, salidas y alertas de faltantes.',
    'operario-diseno.html': 'Ver el panel tal como lo ve un diseñador CAD.',
    'operator-panel.html': 'Ver el panel del área de fresado / laboratorio.',
    'taller.html': 'Ver el panel del taller (acabado, calidad y despacho).',
    'metricas.html': 'Tablero principal de números: ingresos, tiempos de entrega y mejores doctores.',
    'tab:metricas-fin': 'Finanzas: ingresos, cobros pendientes y márgenes.',
    'tab:analytics': 'Qué hacen los visitantes en la web y de dónde vienen las ventas.',
    'tab:reportes': 'Reportes para analizar el negocio y descargar.',
    'tab:metricas': 'Números de los pedidos hechos desde el portal del doctor.',
    'metricas-seo.html': 'Cómo aparece la web en Google (búsquedas y posiciones).',
    'tab:referidos': 'Programa de referidos: códigos, quién refirió a quién y recompensas.',
    'metricas-referidos.html': 'Cuánto dinero trae el programa de referidos.',
    'metricas-churn.html': 'Doctores que dejaron de enviar casos, para recuperarlos a tiempo.',
    'tab:newsletter': 'Suscriptores del boletín por correo.',
    'tab:leads': 'Contactos que llegaron leyendo artículos del Journal.',
    'tab:waitlist': 'Laboratorios interesados en usar la plataforma (lista de espera).',
    'tab:portafolio': 'Subir fotos de casos al portafolio público de la web.',
    'editar-links.html': 'Editar la página de enlaces (/links) que se comparte en redes sociales.',
    'anonimizar.html': 'Tapar caras y datos de pacientes en fotos antes de publicarlas.',
    'admin-precios.html': 'Precios de servicios y materiales que ven los clientes.',
    'configuracion.html': 'Ajustes generales del sistema. Cambiar solo si sabes qué haces.',
    'pruebas-carga.html': 'Herramienta técnica de pruebas. No es para el uso diario.',
    'ayuda.html': 'Guías paso a paso de todo el sistema. Si no sabes cómo hacer algo, empieza aquí.',
    '/': 'Abre la página pública en una pestaña nueva.',
    'logout': 'Salir de tu cuenta.'
  };

  function key(a) {
    var oc = a.getAttribute('onclick') || '';
    var m = oc.match(/switchTab\('([^']+)'/);
    if (m) return 'tab:' + m[1];
    if (/cerrarSesion/.test(oc)) return 'logout';
    return (a.getAttribute('href') || '').replace(/^\.\//, '');
  }

  function init() {
    var tip = document.createElement('div');
    tip.id = 'lx-hint';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);

    document.querySelectorAll('.sidebar .nav-item').forEach(function (a) {
      var h = H[key(a)];
      if (!h) return;
      a.setAttribute('aria-description', h);
      var show = function () {
        var r = a.getBoundingClientRect();
        tip.textContent = '';
        var b = document.createElement('b');
        b.textContent = a.textContent.replace(/\s+/g, ' ').trim().replace(/\s\d+$/, '');
        tip.appendChild(b);
        tip.appendChild(document.createTextNode(h));
        tip.style.left = (r.right + 12) + 'px';
        tip.style.top = Math.max(8, Math.min(window.innerHeight - 96, r.top - 4)) + 'px';
        tip.classList.add('on');
      };
      var hide = function () { tip.classList.remove('on'); };
      a.addEventListener('mouseenter', show);
      a.addEventListener('focus', show);
      a.addEventListener('mouseleave', hide);
      a.addEventListener('blur', hide);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
