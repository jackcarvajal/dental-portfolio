/**
 * PRODIGY — Promociones de catálogo (precio oferta + ventana + conteo regresivo)
 *
 * Fuente: columnas de la tabla `catalogo` → precio, precio_oferta, oferta_desde, oferta_hasta.
 * Una oferta está ACTIVA cuando: precio_oferta > 0  Y  ahora ∈ [oferta_desde, oferta_hasta]
 * (los límites nulos se tratan como abiertos: sin `desde` = ya empezó; sin `hasta` = no vence).
 *
 * Uso:
 *   const info = Promo.resolver(row);   // row = fila de catalogo con las columnas de oferta
 *   info -> { precio, enOferta, precioNormal, desde, hasta, ahorroPct }
 *   Promo.badgeHTML(info.hasta)         // <span> con conteo regresivo (se auto-actualiza solo)
 *   Promo.precioHTML(info, fmt)         // precio normal tachado + precio oferta (o precio normal)
 *
 * El conteo regresivo se refresca solo: Promo.iniciarTicks() arranca un intervalo global que
 * actualiza cada [data-promo-hasta] en la página. Es idempotente.
 */
(function () {
  'use strict';
  const Promo = {};
  const ahora = () => Date.now();
  const ts = (v) => { if (!v) return null; const t = Date.parse(v); return isNaN(t) ? null : t; };

  /** Resuelve el precio efectivo de una fila de catálogo. */
  Promo.resolver = function (row) {
    const normal = Number(row && row.precio) || 0;
    const oferta = Number(row && (row.precio_oferta ?? row.precioOferta)) || 0;
    const desde = ts(row && (row.oferta_desde ?? row.ofertaDesde));
    const hasta = ts(row && (row.oferta_hasta ?? row.ofertaHasta));
    const n = ahora();
    const enVentana = (desde === null || n >= desde) && (hasta === null || n <= hasta);
    const enOferta = oferta > 0 && oferta < normal && enVentana;
    return {
      precio: enOferta ? oferta : normal,
      enOferta,
      precioNormal: normal,
      desde, hasta,
      ahorroPct: enOferta && normal > 0 ? Math.round((1 - oferta / normal) * 100) : 0,
    };
  };

  Promo.enOferta = (row) => Promo.resolver(row).enOferta;
  /** Precio a cobrar (oferta si activa, si no el normal). */
  Promo.precioEfectivo = (row) => Promo.resolver(row).precio;

  /** Texto del conteo regresivo hacia `hastaMs` (ms epoch). '' si ya venció o no hay fecha. */
  Promo.tiempoRestante = function (hastaMs) {
    if (!hastaMs) return '';
    let s = Math.floor((hastaMs - ahora()) / 1000);
    if (s <= 0) return '';
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600);  s -= h * 3600;
    const m = Math.floor(s / 60);    s -= m * 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  /** Badge de oferta con conteo regresivo. Se auto-actualiza vía iniciarTicks(). */
  Promo.badgeHTML = function (hastaMs, ahorroPct) {
    const t = Promo.tiempoRestante(hastaMs);
    const pct = ahorroPct ? ` −${ahorroPct}%` : '';
    const attr = hastaMs ? ` data-promo-hasta="${hastaMs}"` : '';
    return `<span class="promo-badge"${attr}>🔥 OFERTA${pct}${t ? ` · termina en <b class="promo-cd">${t}</b>` : ''}</span>`;
  };

  /** Precio formateado: si hay oferta, muestra el normal tachado + el de oferta. */
  Promo.precioHTML = function (info, fmt) {
    fmt = fmt || (v => '$' + Number(v || 0).toLocaleString('es-CO'));
    if (!info.enOferta) return `<span class="precio-normal-val">${fmt(info.precioNormal)}</span>`;
    return `<span class="precio-tachado">${fmt(info.precioNormal)}</span> <span class="precio-oferta">${fmt(info.precio)}</span>`;
  };

  /** CSS mínimo (inyecta una vez). Colores heredados del sitio; ajustables por página. */
  Promo.inyectarCSS = function () {
    if (document.getElementById('promo-css')) return;
    const s = document.createElement('style'); s.id = 'promo-css';
    s.textContent = `
      .promo-badge{display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#ef4444,#f97316);
        color:#fff;font-size:.66rem;font-weight:800;padding:3px 9px;border-radius:20px;white-space:nowrap;
        letter-spacing:.02em;box-shadow:0 2px 8px rgba(239,68,68,.35);}
      .promo-badge b{font-variant-numeric:tabular-nums;}
      .precio-tachado{text-decoration:line-through;opacity:.55;font-weight:600;margin-right:6px;}
      .precio-oferta{color:#f97316;font-weight:900;}
    `;
    document.head.appendChild(s);
  };

  /** Arranca el refresco global del conteo regresivo (idempotente). */
  Promo.iniciarTicks = function () {
    if (Promo._tick) return;
    Promo._tick = setInterval(function () {
      document.querySelectorAll('[data-promo-hasta]').forEach(function (el) {
        const hasta = Number(el.getAttribute('data-promo-hasta'));
        const cd = el.querySelector('.promo-cd');
        const t = Promo.tiempoRestante(hasta);
        if (!t) { el.remove(); return; }           // venció → quitar badge
        if (cd) cd.textContent = t;
      });
    }, 1000);
  };

  if (typeof window !== 'undefined') { window.Promo = Promo; Promo.inyectarCSS(); Promo.iniciarTicks(); }
})();
