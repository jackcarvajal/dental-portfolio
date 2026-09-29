/**
 * PRODIGY — Protocolo técnico para enviar casos de alineadores
 * v1.0 · 2026-09-28
 *
 * Una sola fuente de verdad para las dos páginas donde se cargan casos:
 *   · envia-alineadores.html            (pública)
 *   · app/nueva-orden-alineadores.html  (portal del doctor)
 * Cada página solo pone <div id="protocolo-aln"></div> donde quiere el bloque.
 *
 * Cubre lo TÉCNICO (qué y cómo enviar), advertencias y sugerencias. Las
 * políticas COMERCIALES (cobros, cancelación, revisiones, refinamientos) viven
 * en el bloque .pol-aln de cada página y en terminos-y-legal#politica-alineadores:
 * aquí solo se enlazan, no se repiten.
 *
 * Contenido 100 % estático (sin datos de usuario) → innerHTML es seguro.
 */
(function () {
  var host = document.getElementById('protocolo-aln');
  if (!host) return;

  if (!document.getElementById('protocolo-aln-css')) {
    var st = document.createElement('style');
    st.id = 'protocolo-aln-css';
    st.textContent = [
      '#protocolo-aln{margin:14px 0 16px;font-size:.9rem;color:#e2e8f0;line-height:1.55}',
      '#protocolo-aln details{background:rgba(0,210,255,.05);border:1px solid rgba(0,210,255,.25);border-radius:12px;padding:12px 14px}',
      '#protocolo-aln details details{background:rgba(255,255,255,.02);border-color:rgba(255,255,255,.1);margin-top:10px;padding:10px 12px}',
      '#protocolo-aln details.pa-warn{border-color:rgba(217,70,166,.35);background:rgba(217,70,166,.05)}',
      '#protocolo-aln details.pa-tip{border-color:rgba(0,255,65,.25);background:rgba(0,255,65,.03)}',
      '#protocolo-aln summary{cursor:pointer;font-weight:800;color:#00d2ff}',
      '#protocolo-aln details details summary{color:#D4AF37;font-size:.88rem}',
      '#protocolo-aln details.pa-warn summary{color:#D946A6}',
      '#protocolo-aln details.pa-tip summary{color:#00FF41}',
      '#protocolo-aln .pa-lead{margin:8px 0 2px;color:#94a3b8;font-size:.85rem}',
      '#protocolo-aln ul{margin:8px 0 0 18px;padding:0}',
      '#protocolo-aln li{margin:3px 0}',
      '#protocolo-aln b{color:#f1f5f9}',
      '#protocolo-aln a{color:#00d2ff}'
    ].join('');
    document.head.appendChild(st);
  }

  // En el portal (/app/) los enlaces suben un nivel
  var base = location.pathname.indexOf('/app/') !== -1 ? '../' : '/';

  host.innerHTML =
    '<details open>' +
      '<summary>📐 Protocolo para enviar tu caso (revísalo antes de subir)</summary>' +
      '<p class="pa-lead">Un caso completo arranca sin demoras. Si falta algo, queda en espera y el tiempo no corre hasta completarlo.</p>' +

      '<details>' +
        '<summary>🦷 1. Escaneo intraoral (STL)</summary>' +
        '<ul>' +
          '<li><b>Arcadas completas</b>, superior e inferior, hasta el último molar presente.</li>' +
          '<li>Incluye <b>encía y fondo de vestíbulo</b> (3–5 mm por debajo del margen gingival) y el <b>paladar</b> en la superior.</li>' +
          '<li><b>Registro de mordida</b> en máxima intercuspidación, alineado con ambas arcadas.</li>' +
          '<li><b>Sin huecos ni zonas faltantes</b> en las superficies de los dientes, sin saliva ni sangre.</li>' +
          '<li><b>Reciente:</b> tomado máximo <b>30 días</b> antes de enviar, y sin tratamientos dentales posteriores.</li>' +
          '<li>Formato <b>STL o PLY</b>, un archivo por arcada. Si son modelos, yeso tipo IV sin burbujas ni fracturas.</li>' +
        '</ul>' +
      '</details>' +

      '<details>' +
        '<summary>🩻 2. Radiografías</summary>' +
        '<ul>' +
          '<li><b>Panorámica</b> y <b>lateral de cráneo</b>, de máximo <b>6 meses</b>.</li>' +
          '<li>Legibles y en buena resolución: JPG, PNG o PDF.</li>' +
          '<li><b>CBCT (DICOM)</b> recomendado si hay caninos incluidos, raíces cortas o reabsorciones, o poco hueso.</li>' +
        '</ul>' +
      '</details>' +

      '<details>' +
        '<summary>📸 3. Fotografías (8 fotos)</summary>' +
        '<ul>' +
          '<li><b>Extraorales:</b> frontal en reposo, frontal sonriendo y perfil.</li>' +
          '<li><b>Intraorales:</b> frontal en oclusión, lateral derecha, lateral izquierda, oclusal superior y oclusal inferior (con espejo).</li>' +
          '<li>Nítidas, con buena luz, retractores y <b>sin filtros</b>.</li>' +
        '</ul>' +
      '</details>' +

      '<details>' +
        '<summary>📝 4. Indicación clínica</summary>' +
        '<ul>' +
          '<li><b>Objetivo del tratamiento</b> y motivo de consulta.</li>' +
          '<li><b>Arcadas a tratar:</b> superior, inferior o ambas.</li>' +
          '<li><b>Qué NO se debe mover:</b> implantes, dientes anquilosados, coronas o puentes.</li>' +
          '<li><b>Restricciones:</b> si aceptas IPR (y cuánto), attachments, expansión, elásticos o extracciones planeadas.</li>' +
          '<li>Tratamientos previos, recidivas y cualquier preferencia, como número máximo de alineadores.</li>' +
        '</ul>' +
      '</details>' +

      '<details class="pa-warn">' +
        '<summary>⚠️ Advertencias</summary>' +
        '<ul>' +
          '<li><b>Archivos incompletos o con defectos:</b> te pediremos reenviarlos y el caso queda en espera. Un escaneo con huecos o distorsión no se planifica.</li>' +
          '<li><b>Salud oral primero:</b> enfermedad periodontal activa, caries o dientes con movilidad deben tratarse antes de iniciar. Evaluarlo es responsabilidad del ortodoncista tratante.</li>' +
          '<li><b>Implantes, anquilosis, coronas y puentes no se mueven:</b> si no los indicas, la planificación puede no ser ejecutable.</li>' +
          '<li><b>La planificación digital es una propuesta:</b> la decisión clínica, el seguimiento y los controles del paciente están a cargo del ortodoncista tratante.</li>' +
          '<li><b>El resultado depende del paciente:</b> los alineadores deben usarse <b>20 a 22 horas al día</b>. Si no los usa o falta a sus controles, el plan puede requerir una modificación con costo.</li>' +
          '<li><b>Escaneo vencido:</b> si pasan más de 30 días o hubo tratamientos, pedimos un escaneo nuevo antes de planificar.</li>' +
        '</ul>' +
      '</details>' +

      '<details class="pa-tip">' +
        '<summary>💡 Sugerencias para que tu caso salga a la primera</summary>' +
        '<ul>' +
          '<li><b>Revisa el escaneo antes de enviarlo:</b> gíralo 360° y busca zonas vacías, sobre todo en distales y entre dientes.</li>' +
          '<li><b>Nombra los archivos:</b> <i>Paciente_Superior.stl</i>, <i>Paciente_Inferior.stl</i>, <i>Paciente_Mordida.stl</i>.</li>' +
          '<li><b>Envía todo en un solo ZIP</b> para que no se pierda ningún archivo.</li>' +
          '<li><b>Mientras más detallada la indicación, menos revisiones.</b> Si hay algo que no quieres que se haga, dilo por escrito.</li>' +
          '<li><b>Agrupa tus comentarios</b> en cada revisión: la planificación incluye 2 y conviene aprovecharlas completas.</li>' +
          '<li><b>Programa controles cada 6 a 8 semanas</b> para detectar a tiempo si el paciente no está usando bien los alineadores.</li>' +
        '</ul>' +
      '</details>' +

      '<p class="pa-lead" style="margin-top:10px">Cobros, cancelación, revisiones y refinamientos: ver las <b>políticas de alineadores</b> más abajo o en <a href="' + base + 'terminos-y-legal#politica-alineadores" target="_blank" rel="noopener">Términos</a>.</p>' +
    '</details>';
})();
