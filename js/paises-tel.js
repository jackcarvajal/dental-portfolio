/* PRODIGY — Indicativos telefónicos de todos los países + selector con búsqueda (por nombre, código ISO o indicativo).
   Uso: PaisesTel.montar(contenedor, { input: <input hidden donde queda '+57'>, porDefecto:'CO', onCambio(p) })  */
(function(){
  // [ISO, nombre en español, indicativo]
  const L = [
    ['AF','Afganistán','93'],['AL','Albania','355'],['DE','Alemania','49'],['AD','Andorra','376'],['AO','Angola','244'],['AI','Anguila','1264'],
    ['AG','Antigua y Barbuda','1268'],['SA','Arabia Saudita','966'],['DZ','Argelia','213'],['AR','Argentina','54'],['AM','Armenia','374'],['AW','Aruba','297'],
    ['AU','Australia','61'],['AT','Austria','43'],['AZ','Azerbaiyán','994'],['BS','Bahamas','1242'],['BH','Baréin','973'],['BD','Bangladés','880'],
    ['BB','Barbados','1246'],['BE','Bélgica','32'],['BZ','Belice','501'],['BJ','Benín','229'],['BM','Bermudas','1441'],['BY','Bielorrusia','375'],
    ['BO','Bolivia','591'],['BA','Bosnia y Herzegovina','387'],['BW','Botsuana','267'],['BR','Brasil','55'],['BN','Brunéi','673'],['BG','Bulgaria','359'],
    ['BF','Burkina Faso','226'],['BI','Burundi','257'],['BT','Bután','975'],['CV','Cabo Verde','238'],['KH','Camboya','855'],['CM','Camerún','237'],
    ['CA','Canadá','1'],['BQ','Caribe Neerlandés','599'],['QA','Catar','974'],['TD','Chad','235'],['CL','Chile','56'],['CN','China','86'],['CY','Chipre','357'],
    ['CO','Colombia','57'],['KM','Comoras','269'],['CG','Congo','242'],['CD','Congo (Rep. Democrática)','243'],['KP','Corea del Norte','850'],
    ['KR','Corea del Sur','82'],['CI','Costa de Marfil','225'],['CR','Costa Rica','506'],['HR','Croacia','385'],['CU','Cuba','53'],['CW','Curazao','599'],
    ['DK','Dinamarca','45'],['DM','Dominica','1767'],['EC','Ecuador','593'],['EG','Egipto','20'],['SV','El Salvador','503'],['AE','Emiratos Árabes Unidos','971'],
    ['ER','Eritrea','291'],['SK','Eslovaquia','421'],['SI','Eslovenia','386'],['ES','España','34'],['US','Estados Unidos','1'],['EE','Estonia','372'],
    ['SZ','Esuatini','268'],['ET','Etiopía','251'],['PH','Filipinas','63'],['FI','Finlandia','358'],['FJ','Fiyi','679'],['FR','Francia','33'],['GA','Gabón','241'],
    ['GM','Gambia','220'],['GE','Georgia','995'],['GH','Ghana','233'],['GI','Gibraltar','350'],['GD','Granada','1473'],['GR','Grecia','30'],['GL','Groenlandia','299'],
    ['GP','Guadalupe','590'],['GU','Guam','1671'],['GT','Guatemala','502'],['GF','Guayana Francesa','594'],['GN','Guinea','224'],['GQ','Guinea Ecuatorial','240'],
    ['GW','Guinea-Bisáu','245'],['GY','Guyana','592'],['HT','Haití','509'],['HN','Honduras','504'],['HK','Hong Kong','852'],['HU','Hungría','36'],['IN','India','91'],
    ['ID','Indonesia','62'],['IQ','Irak','964'],['IR','Irán','98'],['IE','Irlanda','353'],['IS','Islandia','354'],['KY','Islas Caimán','1345'],['CK','Islas Cook','682'],
    ['FO','Islas Feroe','298'],['MH','Islas Marshall','692'],['SB','Islas Salomón','677'],['TC','Islas Turcas y Caicos','1649'],['VG','Islas Vírgenes Británicas','1284'],
    ['VI','Islas Vírgenes de EE. UU.','1340'],['IL','Israel','972'],['IT','Italia','39'],['JM','Jamaica','1876'],['JP','Japón','81'],['JO','Jordania','962'],
    ['KZ','Kazajistán','7'],['KE','Kenia','254'],['KG','Kirguistán','996'],['KI','Kiribati','686'],['XK','Kosovo','383'],['KW','Kuwait','965'],['LA','Laos','856'],
    ['LS','Lesoto','266'],['LV','Letonia','371'],['LB','Líbano','961'],['LR','Liberia','231'],['LY','Libia','218'],['LI','Liechtenstein','423'],['LT','Lituania','370'],
    ['LU','Luxemburgo','352'],['MO','Macao','853'],['MK','Macedonia del Norte','389'],['MG','Madagascar','261'],['MY','Malasia','60'],['MW','Malaui','265'],
    ['MV','Maldivas','960'],['ML','Malí','223'],['MT','Malta','356'],['MA','Marruecos','212'],['MQ','Martinica','596'],['MU','Mauricio','230'],['MR','Mauritania','222'],
    ['YT','Mayotte','262'],['MX','México','52'],['FM','Micronesia','691'],['MD','Moldavia','373'],['MC','Mónaco','377'],['MN','Mongolia','976'],['ME','Montenegro','382'],
    ['MS','Montserrat','1664'],['MZ','Mozambique','258'],['MM','Myanmar','95'],['NA','Namibia','264'],['NR','Nauru','674'],['NP','Nepal','977'],['NI','Nicaragua','505'],
    ['NE','Níger','227'],['NG','Nigeria','234'],['NO','Noruega','47'],['NC','Nueva Caledonia','687'],['NZ','Nueva Zelanda','64'],['OM','Omán','968'],
    ['NL','Países Bajos','31'],['PK','Pakistán','92'],['PW','Palaos','680'],['PS','Palestina','970'],['PA','Panamá','507'],['PG','Papúa Nueva Guinea','675'],
    ['PY','Paraguay','595'],['PE','Perú','51'],['PF','Polinesia Francesa','689'],['PL','Polonia','48'],['PT','Portugal','351'],['PR','Puerto Rico','1'],
    ['GB','Reino Unido','44'],['CF','República Centroafricana','236'],['CZ','República Checa','420'],['DO','República Dominicana','1'],['RE','Reunión','262'],
    ['RW','Ruanda','250'],['RO','Rumania','40'],['RU','Rusia','7'],['WS','Samoa','685'],['KN','San Cristóbal y Nieves','1869'],['SM','San Marino','378'],
    ['VC','San Vicente y las Granadinas','1784'],['LC','Santa Lucía','1758'],['ST','Santo Tomé y Príncipe','239'],['SN','Senegal','221'],['RS','Serbia','381'],
    ['SC','Seychelles','248'],['SL','Sierra Leona','232'],['SG','Singapur','65'],['SX','Sint Maarten','1721'],['SY','Siria','963'],['SO','Somalia','252'],
    ['LK','Sri Lanka','94'],['ZA','Sudáfrica','27'],['SD','Sudán','249'],['SS','Sudán del Sur','211'],['SE','Suecia','46'],['CH','Suiza','41'],['SR','Surinam','597'],
    ['TH','Tailandia','66'],['TW','Taiwán','886'],['TZ','Tanzania','255'],['TJ','Tayikistán','992'],['TL','Timor Oriental','670'],['TG','Togo','228'],['TO','Tonga','676'],
    ['TT','Trinidad y Tobago','1868'],['TN','Túnez','216'],['TM','Turkmenistán','993'],['TR','Turquía','90'],['TV','Tuvalu','688'],['UA','Ucrania','380'],
    ['UG','Uganda','256'],['UY','Uruguay','598'],['UZ','Uzbekistán','998'],['VU','Vanuatu','678'],['VA','Vaticano','39'],['VE','Venezuela','58'],['VN','Vietnam','84'],
    ['YE','Yemen','967'],['DJ','Yibuti','253'],['ZM','Zambia','260'],['ZW','Zimbabue','263']
  ].map(([iso, nombre, cod]) => ({ iso, nombre, cod }));

  // Los más usados por los clientes del laboratorio, arriba
  const FRECUENTES = ['CO','DO','MX','US','ES','EC','PE','CL','AR','VE','PA','CR'];
  // Zona horaria → país (para proponer el indicativo del cliente)
  const TZ = { 'America/Bogota':'CO','America/Santo_Domingo':'DO','America/Mexico_City':'MX','America/Lima':'PE','America/Santiago':'CL',
    'America/Argentina/Buenos_Aires':'AR','America/Caracas':'VE','America/Guayaquil':'EC','America/Panama':'PA','America/Costa_Rica':'CR','Europe/Madrid':'ES',
    'America/Puerto_Rico':'PR','America/New_York':'US','America/Chicago':'US','America/Los_Angeles':'US' };
  const bandera = iso => /^[A-Z]{2}$/.test(iso) ? String.fromCodePoint(...[...iso].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '';
  const sinTildes = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]);
  const porIso = iso => L.find(p => p.iso === iso);
  function sugerido(def){
    try { const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; if (TZ[tz]) return TZ[tz]; } catch (_) {}
    return def || 'CO';
  }

  function montar(cont, opt){
    opt = opt || {};
    let actual = porIso(opt.porDefecto || sugerido('CO')) || porIso('CO');
    cont.classList.add('ptel');
    cont.innerHTML = `
      <button type="button" class="ptel-btn" aria-haspopup="listbox" aria-expanded="false" title="Indicativo del país">
        <span class="ptel-flag"></span><span class="ptel-cod"></span><i class="fas fa-chevron-down" aria-hidden="true"></i>
      </button>
      <div class="ptel-pop" hidden>
        <input type="search" class="ptel-q" placeholder="Buscar país o código (ej. Dominicana, +1, DO)" aria-label="Buscar país o indicativo" autocomplete="off">
        <ul class="ptel-list" role="listbox"></ul>
      </div>`;
    const btn = cont.querySelector('.ptel-btn'), pop = cont.querySelector('.ptel-pop'), q = cont.querySelector('.ptel-q'), ul = cont.querySelector('.ptel-list');
    function pintarBoton(){
      cont.querySelector('.ptel-flag').textContent = bandera(actual.iso);
      cont.querySelector('.ptel-cod').textContent = '+' + actual.cod;   // la bandera (o sus letras en Windows) ya dice el país
      cont.querySelector('.ptel-btn').setAttribute('aria-label', 'Indicativo: ' + actual.nombre + ' +' + actual.cod);
      if (opt.input) opt.input.value = '+' + actual.cod;
      cont.dataset.iso = actual.iso;
    }
    function lista(){
      const t = sinTildes(q.value.trim()).replace(/^\+/, '');
      let items = L.filter(p => !t || sinTildes(p.nombre).includes(t) || p.iso.toLowerCase() === t || p.cod.startsWith(t));
      if (!t) items = FRECUENTES.map(porIso).concat([null]).concat(L.filter(p => !FRECUENTES.includes(p.iso)));
      ul.innerHTML = items.length ? items.map(p => p ? `<li role="option" data-iso="${p.iso}" aria-selected="${p.iso === actual.iso}"><span>${bandera(p.iso)}</span> ${esc(p.nombre)} <b>+${p.cod}</b></li>` : '<li class="ptel-sep" aria-hidden="true"></li>').join('')
        : '<li class="ptel-vacio">Sin resultados</li>';
    }
    function abrir(){ pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); q.value = ''; lista(); setTimeout(() => q.focus(), 0); }
    function cerrar(){ pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', () => pop.hidden ? abrir() : cerrar());
    q.addEventListener('input', lista);
    q.addEventListener('keydown', e => {
      if (e.key === 'Escape') { cerrar(); btn.focus(); }
      if (e.key === 'Enter') { e.preventDefault(); const li = ul.querySelector('li[data-iso]'); if (li) li.click(); }
    });
    ul.addEventListener('click', e => {
      const li = e.target.closest('li[data-iso]'); if (!li) return;
      actual = porIso(li.dataset.iso); pintarBoton(); cerrar(); btn.focus();
      if (opt.onCambio) opt.onCambio(actual);
    });
    document.addEventListener('click', e => { if (!cont.contains(e.target)) cerrar(); });
    pintarBoton();
    return {
      get: () => actual,
      // Quita el indicativo de un número completo (+18097473980 → 8097473980) y selecciona el país si se reconoce
      desdeNumero(n){
        const d = String(n || '').replace(/[^\d+]/g, '');
        if (!d.startsWith('+')) return d.replace(/\D/g, '');
        const dig = d.slice(1);
        let c = L.filter(p => dig.startsWith(p.cod)).sort((a, b) => b.cod.length - a.cod.length)[0];
        if (!c) return dig;
        // +1 lo comparten EE. UU., Canadá, Rep. Dominicana y Puerto Rico: se decide por el código de área
        if (c.cod === '1'){ const area = dig.slice(1, 4); c = porIso(['809','829','849'].includes(area) ? 'DO' : (['787','939'].includes(area) ? 'PR' : (actual.cod === '1' ? actual.iso : 'US'))); }
        if (c.cod !== actual.cod) { actual = c; pintarBoton(); }
        return dig.slice(c.cod.length);
      }
    };
  }
  window.PaisesTel = { lista: L, bandera, montar };
})();
