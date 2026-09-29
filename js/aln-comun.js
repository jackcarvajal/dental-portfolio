/* PRODIGY — Alineadores: lógica compartida del tablero de la técnica/admin (app/alineadores.html)
   y del portal del cliente (app/facturacion-alineadores.html).
   · Fase del TRATAMIENTO según el pronóstico: fin = fecha_fin_tratamiento o (fecha de envío + «N meses»).
     En tratamiento → Refinamiento sin costo (hasta 6 meses después del fin) → Término vencido.
   · Gráficos ligeros sin librerías (barras apiladas y dona SVG). */
(function(){
  const esc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  // "2026-09-18" → fecha local al mediodía (evita que en Colombia salga el día anterior)
  const dt = d => d ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? d + 'T12:00:00' : d) : null;
  const fmtDY = d => d ? d.toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' }) : '—';
  const MES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const mesLbl = m => /^\d{4}-\d{2}$/.test(m || '') ? MES[Number(m.slice(5)) - 1] + ' ' + m.slice(2, 4) : (m || '—');
  const masMeses = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };

  // Solo valoración: caso cerrado sin plan ni modelos (viabilidad sin planificación, no viable, consulta)
  const soloVal = c => c.estado === 'terminado' && !c.plan_tratamiento && !c.modelos;
  const planificado = c => ['en_tratamiento','terminado'].includes(c.estado) && !soloVal(c);
  const mesesDur = c => { const m = /(\d+)\s*mes/i.exec(c.duracion_tratamiento || ''); return m ? Number(m[1]) : null; };
  function finTrat(c){
    if (c.fecha_fin_tratamiento) return { d: dt(c.fecha_fin_tratamiento), est: false };
    const n = mesesDur(c);
    if (c.fecha_envio && n) return { d: masMeses(dt(c.fecha_envio), n), est: true };
    return null;
  }
  // → null (aún no hay plan) · {k:'sindatos'} · {k:'curso', fin, p} · {k:'refina', fin, hasta} · {k:'vencido', fin, hasta}
  function trat(c){
    if (!planificado(c)) return null;
    const f = finTrat(c); if (!f) return { k:'sindatos' };
    const hoy = new Date(), hasta = masMeses(f.d, 6);
    if (hoy < f.d){
      const ini = c.fecha_envio ? dt(c.fecha_envio) : null;
      const p = ini && f.d > ini ? Math.min(1, Math.max(0, (hoy - ini) / (f.d - ini))) : null;
      return { k:'curso', fin:f.d, est:f.est, p };
    }
    if (hoy < hasta) return { k:'refina', fin:f.d, est:f.est, hasta };
    return { k:'vencido', fin:f.d, est:f.est, hasta };
  }
  const TRAT_LBL = { curso:'En tratamiento', refina:'Refinamiento sin costo', vencido:'Término vencido', sindatos:'Faltan fechas' };
  function celdaTrat(c){
    const t = trat(c);
    if (!t) return '<span class="l2" style="margin:0">—</span>';
    if (t.k === 'sindatos') return '<span class="falta">Falta la duración o el fin</span>';
    const aprox = t.est ? '~' : '';
    if (t.k === 'curso') return `<span class="pill enviado">En tratamiento</span><span class="l2">Fin ${aprox}${fmtDY(t.fin)}</span>` +
      (t.p != null ? `<div class="prog" title="${Math.round(t.p*100)} % del tiempo previsto"><i style="width:${Math.round(t.p*100)}%"></i></div>` : '');
    if (t.k === 'refina') return `<span class="pill aprobado">Refinamiento sin costo</span><span class="l2">Hasta ${fmtDY(t.hasta)} · terminó ${aprox}${fmtDY(t.fin)}</span>`;
    return `<span class="pill factur">Término vencido</span><span class="l2">Terminó ${aprox}${fmtDY(t.fin)} · refinamiento con costo</span>`;
  }

  // Barras apiladas. filas: [{lab, vals:{clave:n}}] · series: [{k, lbl, color}] · fmt: n → texto
  function barras(el, filas, series, fmt){
    if (!el) return;
    fmt = fmt || (n => String(n));
    const tot = f => series.reduce((a, s) => a + (f.vals[s.k] || 0), 0);
    const max = Math.max(1, ...filas.map(tot));
    if (!filas.length || !filas.some(tot)){ el.innerHTML = '<p class="empty">Sin datos todavía.</p>'; return; }
    const H = 140;
    el.innerHTML = `<div class="bars">${filas.map(f => { const t = tot(f);
        return `<div class="col" title="${esc(f.lab)} · ${esc(fmt(t))}"><span class="tot">${t ? esc(fmt(t)) : ''}</span>${
          series.slice().reverse().map(s => { const v = f.vals[s.k] || 0; return v ? `<span class="seg" style="height:${Math.max(3, Math.round(v / max * H))}px;background:${s.color}" title="${esc(s.lbl)}: ${esc(fmt(v))}"></span>` : ''; }).join('')
        }</div>`; }).join('')}</div>
      <div class="xlab">${filas.map(f => `<span>${esc(f.lab)}</span>`).join('')}</div>
      <div class="leg">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.lbl)}</span>`).join('')}</div>`;
  }
  // Dona. items: [{lbl, n, color}]
  function dona(el, items, centro){
    if (!el) return;
    const tot = items.reduce((a, i) => a + i.n, 0);
    if (!tot){ el.innerHTML = '<p class="empty">Sin datos todavía.</p>'; return; }
    const R = 54, C = 2 * Math.PI * R; let off = 0;
    const arcos = items.filter(i => i.n).map(i => { const len = i.n / tot * C;
      const s = `<circle r="${R}" cx="70" cy="70" fill="none" stroke="${i.color}" stroke-width="18" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 70 70)"><title>${esc(i.lbl)}: ${i.n}</title></circle>`;
      off += len; return s; }).join('');
    el.innerHTML = `<div class="dona"><svg viewBox="0 0 140 140" width="150" height="150" role="img" aria-label="${esc(centro || 'casos')}: ${tot}">
      <circle r="${R}" cx="70" cy="70" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="18"/>${arcos}
      <text x="70" y="68" text-anchor="middle" fill="#f5f5f7" font-size="26" font-weight="800" font-family="Inter,sans-serif">${tot}</text>
      <text x="70" y="88" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="Inter,sans-serif">${esc(centro || 'casos')}</text></svg>
      <div class="leg col">${items.map(i => `<span class="${i.n ? '' : 'cero'}"><i style="background:${i.color}"></i>${esc(i.lbl)} <b>${i.n}</b></span>`).join('')}</div></div>`;
  }
  // Últimos N meses con datos, en orden (para el eje X)
  function mesesDe(claves, n){ return [...new Set(claves.filter(Boolean))].sort().slice(-(n || 9)); }
  const compacto = n => n >= 1e6 ? (Math.round(n / 1e5) / 10).toLocaleString('es-CO') + ' M' : n >= 1000 ? Math.round(n / 1000) + ' mil' : String(Math.round(n));

  // Políticas de alineadores que el cliente acepta al subir un caso (versión guardada en alineadores_casos.politicas_version)
  const POL_VER = 'alineadores-2026-09-29b';
  const POLITICAS_HTML = '<ul class="pol-lista" style="margin:8px 0 0 18px;padding:0;line-height:1.6"><li><b>Viabilidad y valoración del caso:</b> se cobra cada vez que PRODIGY revisa el caso, aunque el resultado sea «no viable». Tiene vigencia de 3 a 4 meses.</li><li><b>Cancelación:</b> solo durante la <b>primera hora</b> después de subir el caso y si aún no se ha enviado nada. Después se cobra la viabilidad y valoración.</li><li><b>Trabajo realizado:</b> todo lo entregado (viabilidad y valoración, planificación, modificaciones de la planeación y refinamientos con costo) se cobra aunque el tratamiento no continúe o el paciente desista.</li><li><b>Revisiones:</b> la planificación incluye 2 revisiones; desde la tercera se cobra como modificación de la planeación según la tarifa vigente.</li><li><b>Refinamiento:</b> solo aplica cuando el tratamiento <b>terminó</b>. Uno sin costo si se solicita dentro de los 6 meses siguientes al fin del tratamiento; después, con costo.</li><li><b>Modificación de la planeación:</b> si antes de terminar el tratamiento hay que cambiar el plan porque el paciente no usó los alineadores como se indicó o no asistió a sus controles (causas ajenas a PRODIGY), no es un refinamiento: es una modificación de la planeación y tiene costo.</li><li><b>Pagos:</b> corte mensual: el estado de cuenta se envía cada mes y se paga dentro de los <b>primeros 10 días</b> del mes siguiente. Si pagas con PayPal se suma la comisión acordada.</li><li><b>Saldo vencido:</b> si el estado de cuenta no se ha pagado, hay tolerancia hasta el día 12; los días 13 y 14 los casos nuevos quedan <b>en espera</b> hasta recibir el pago, y desde el día 15 <b>no se pueden subir casos nuevos</b> hasta ponerse al día.</li><li><b>Tiempos:</b> se cuentan en días hábiles de Colombia (lunes a viernes). Sábados, domingos y festivos no son hábiles: puedes subir casos esos días, pero se empiezan a trabajar el siguiente día hábil.</li><li><b>Resultados:</b> dependen de la calidad de los archivos (escaneo, radiografías, fotos) y de la colaboración del paciente.</li><li><b>Datos:</b> declaras tener la autorización del paciente para compartir sus datos (Ley 1581 de 2012).</li></ul>';

  window.ALN = { POL_VER, POLITICAS_HTML, esc, dt, fmtDY, mesLbl, soloVal, planificado, finTrat, trat, TRAT_LBL, celdaTrat, barras, dona, mesesDe, compacto, masMeses };
})();
