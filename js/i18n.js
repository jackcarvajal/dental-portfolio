/**
 * PRODIGY — i18n Engine v1.0
 * Detects: navigator.language → es* → ES | pt* → PT | * → EN
 * Stores preference in localStorage key 'prd_lang'
 * API: window.i18n.set('en') | window.i18n.lang | window.i18n.t('key')
 * Usage in HTML:
 *   <span data-i18n="key"></span>
 *   <a data-i18n="key" data-i18n-href="key.href"></a>
 *   <input data-i18n-placeholder="key">
 */
(function () {
  'use strict';

  var LANGS   = ['es', 'en', 'pt'];
  var DEFAULT = 'en';

  /* ─────────────────────────────────────────────────────────
     DICCIONARIO  (páginas pueden extender via window._i18nExtra)
  ───────────────────────────────────────────────────────── */
  var T = {

    /* ── HERO ─────────────────────────────── */
    'hero.subtitle': {
      es: 'Digital Dental Excellence &nbsp;·&nbsp; Bogotá, Colombia',
      en: 'Digital Dental Excellence &nbsp;·&nbsp; Bogotá, Colombia',
      pt: 'Excelência Dental Digital &nbsp;·&nbsp; Bogotá, Colômbia'
    },
    'status.preparing': {
      es: 'Preparando algo extraordinario',
      en: 'Preparing something extraordinary',
      pt: 'Preparando algo extraordinário'
    },
    'hero.main_text': {
      es: 'Nuestro portal está en <strong>construcción final</strong>.<br>Estaremos en línea muy pronto.',
      en: 'Our portal is in <strong>final construction</strong>.<br>We\'ll be online very soon.',
      pt: 'Nosso portal está em <strong>construção final</strong>.<br>Estaremos online em breve.'
    },
    'hero.sub_text': {
      es: '¿Necesitas cotizar o tienes un caso urgente?<br>Escríbenos directamente, respondemos el mismo día.',
      en: 'Need a quote or have an urgent case?<br>Write to us directly — we respond the same day.',
      pt: 'Precisa de um orçamento ou tem um caso urgente?<br>Escreva-nos diretamente — respondemos no mesmo dia.'
    },
    'hero.cta_wa': {
      es: 'Contactar por WhatsApp',
      en: 'Contact via WhatsApp',
      pt: 'Contato pelo WhatsApp'
    },
    'hero.cta_wa.href': {
      es: 'https://wa.me/573212816716?text=Hola%20PRODIGY%2C%20necesito%20una%20cotización',
      en: 'https://wa.me/573212816716?text=Hello%20PRODIGY%2C%20I%20need%20a%20quote',
      pt: 'https://wa.me/573212816716?text=Olá%20PRODIGY%2C%20preciso%20de%20um%20orçamento'
    },

    /* ── SERVICE TAGS ─────────────────────── */
    'tag.milling':    { es: 'Fresado CAD/CAM', en: 'CAD/CAM Milling',  pt: 'Fresagem CAD/CAM' },
    'tag.design':     { es: 'Diseño Exocad',   en: 'Exocad Design',    pt: 'Design Exocad' },
    'tag.print3d':    { es: 'Impresión 3D',    en: '3D Printing',      pt: 'Impressão 3D' },
    'tag.zirconia':   { es: 'Zirconio',        en: 'Zirconia',         pt: 'Zircônia' },
    'tag.disilicate': { es: 'Disilicato',      en: 'Disilicate',       pt: 'Dissilicato' },
    'tag.scanner':    { es: 'Escáner Móvil',   en: 'Mobile Scanner',   pt: 'Scanner Móvel' },

    /* ── STATS ────────────────────────────── */
    'stat.casos_label':   { es: 'Casos fresados<br>por año',             en: 'Milled cases<br>per year',               pt: 'Casos fresados<br>por ano' },
    'stat.resp_label':    { es: 'Respuesta<br>promedio',                 en: 'Average<br>response time',               pt: 'Tempo de<br>resposta médio' },
    'stat.years_label':   { es: 'Años en<br>CAD/CAM digital',            en: 'Years in<br>digital CAD/CAM',            pt: 'Anos em<br>CAD/CAM digital' },
    'stat.quality_label': { es: 'Casos revisados<br>antes de salir',     en: 'Cases reviewed<br>before shipping',      pt: 'Casos revisados<br>antes de sair' },

    /* ── LAB SECTION ──────────────────────── */
    'lab.intro': {
      es: 'Somos un laboratorio dental de alta precisión con sede en Bogotá.<br>Trabajamos con clínicas y doctores en Colombia y el exterior —<br><strong>no necesitas tener el caso completo para contactarnos.</strong>',
      en: 'We are a high-precision dental laboratory based in Bogotá.<br>We work with clinics and doctors in Colombia and worldwide —<br><strong>you don\'t need a complete case to contact us.</strong>',
      pt: 'Somos um laboratório dental de alta precisão sediado em Bogotá.<br>Trabalhamos com clínicas e dentistas na Colômbia e no exterior —<br><strong>não precisa ter o caso completo para nos contatar.</strong>'
    },
    'lab.card1.title': {
      es: 'Diseño CAD desde cualquier país',
      en: 'CAD Design from anywhere in the world',
      pt: 'Design CAD de qualquer país'
    },
    'lab.card1.desc': {
      es: 'Si ya tienes el escáner en STL, OBJ o Exocad, nosotros diseñamos la restauración y te entregamos el archivo listo para fresar en tu propio centro. <strong>Sin importar dónde estés.</strong>',
      en: 'If you already have the scan in STL, OBJ or Exocad, we design the restoration and deliver the file ready to mill in your own center. <strong>No matter where you are.</strong>',
      pt: 'Se você já tem o escâner em STL, OBJ ou Exocad, nós projetamos a restauração e entregamos o arquivo pronto para fresar no seu próprio centro. <strong>Não importa onde você esteja.</strong>'
    },
    'lab.card2.title': {
      es: 'Respuesta en menos de 2 horas',
      en: 'Response in under 2 hours',
      pt: 'Resposta em menos de 2 horas'
    },
    'lab.card2.desc': {
      es: 'Cotizamos tu caso el mismo día. Cada hora que pasa es una restauración que no avanza. <strong>Un mensaje es suficiente para arrancar.</strong>',
      en: 'We quote your case the same day. Every hour that passes is a restoration not moving forward. <strong>One message is enough to get started.</strong>',
      pt: 'Cotizamos seu caso no mesmo dia. Cada hora que passa é uma restauração que não avança. <strong>Uma mensagem é suficiente para começar.</strong>'
    },
    'lab.card3.title': {
      es: 'Control de calidad en cada pieza',
      en: 'Quality control on every piece',
      pt: 'Controle de qualidade em cada peça'
    },
    'lab.card3.desc': {
      es: 'Cada restauración pasa por verificación dimensional antes de salir del laboratorio. <strong>Trabajamos con estándares de precisión que hablan por sí solos.</strong>',
      en: 'Every restoration undergoes dimensional verification before leaving the laboratory. <strong>We work with precision standards that speak for themselves.</strong>',
      pt: 'Cada restauração passa por verificação dimensional antes de sair do laboratório. <strong>Trabalhamos com padrões de precisão que falam por si mesmos.</strong>'
    },
    'lab.cta_label': {
      es: '¿Solo necesitas el diseño? Empieza aquí',
      en: 'Just need the design? Start here',
      pt: 'Só precisa do design? Comece aqui'
    },
    'lab.cta_btn': {
      es: 'Enviar mi escáner ahora',
      en: 'Send my scan now',
      pt: 'Enviar meu escâner agora'
    },
    'lab.cta_btn.href': {
      es: 'https://wa.me/573212816716?text=Hola%20PRODIGY%2C%20tengo%20un%20escáner%20listo%20y%20necesito%20el%20diseño%20CAD.%20¿Pueden%20cotizarme%3F',
      en: 'https://wa.me/573212816716?text=Hello%20PRODIGY%2C%20I%20have%20a%20scan%20ready%20and%20need%20CAD%20design.%20Can%20you%20quote%20me%3F',
      pt: 'https://wa.me/573212816716?text=Olá%20PRODIGY%2C%20tenho%20um%20escâner%20pronto%20e%20preciso%20do%20design%20CAD.%20Podem%20me%20cotizar%3F'
    },
    'lab.cta_note': {
      es: 'Formatos aceptados: STL · OBJ · PLY · Exocad · 3Shape',
      en: 'Accepted formats: STL · OBJ · PLY · Exocad · 3Shape',
      pt: 'Formatos aceitos: STL · OBJ · PLY · Exocad · 3Shape'
    },

    /* ── PSYCH SECTION ────────────────────── */
    'psych.badge': {
      es: 'Por qué los mejores doctores nos eligen',
      en: 'Why top doctors choose us',
      pt: 'Por que os melhores dentistas nos escolhem'
    },
    'psych.headline': {
      es: 'Tu reputación clínica<br>empieza en el <span>laboratorio</span>',
      en: 'Your clinical reputation<br>starts at the <span>laboratory</span>',
      pt: 'Sua reputação clínica<br>começa no <span>laboratório</span>'
    },
    'psych.body1': {
      es: 'Cada pieza que no ajusta es un paciente que no regresa. Sabemos lo que se siente cuando el retrabajo aparece en el peor momento — y precisamente por eso trabajamos cada caso como si la reputación en juego fuera la nuestra. <strong>Porque en parte, lo es.</strong>',
      en: 'Every piece that doesn\'t fit is a patient who won\'t return. We know what it feels like when rework shows up at the worst moment — and that\'s precisely why we work every case as if the reputation at stake were our own. <strong>Because in part, it is.</strong>',
      pt: 'Cada peça que não encaixa é um paciente que não volta. Sabemos o que é quando o retrabalho aparece no pior momento — e é precisamente por isso que trabalhamos cada caso como se a reputação em jogo fosse nossa. <strong>Porque em parte, é.</strong>'
    },
    'psych.body2': {
      es: 'Desde casos simples de diseño hasta flujos completos de Full Arch, rehabilitaciones totales e híbridos sobre implantes — PRODIGY tiene la tecnología y el equipo para que tú solo te preocupes por el paciente. <strong>Nosotros nos encargamos del resto.</strong>',
      en: 'From simple design cases to complete Full Arch workflows, total rehabilitations and implant hybrids — PRODIGY has the technology and team so you only worry about the patient. <strong>We take care of the rest.</strong>',
      pt: 'Desde casos simples de design até fluxos completos de Full Arch, reabilitações totais e híbridos sobre implantes — PRODIGY tem a tecnologia e a equipe para que você só se preocupe com o paciente. <strong>Nós cuidamos do resto.</strong>'
    },
    'psych.proof1': { es: 'Sin contratos de exclusividad',     en: 'No exclusivity contracts',          pt: 'Sem contratos de exclusividade' },
    'psych.proof2': { es: 'Envíos a toda Colombia',            en: 'Shipping across Colombia',           pt: 'Envios para toda a Colômbia' },
    'psych.proof3': { es: 'Archivos digitales al exterior',    en: 'Digital files worldwide',            pt: 'Arquivos digitais para o exterior' },
    'psych.proof4': { es: 'Orientación técnica de caso',       en: 'Technical case guidance',            pt: 'Orientação técnica de caso' },

    /* ── PROGRESS ─────────────────────────── */
    'progress.label': {
      es: 'Progreso de lanzamiento',
      en: 'Launch progress',
      pt: 'Progresso do lançamento'
    },

    /* ── FLUJO ────────────────────────────── */
    'flujo.sec_label':  { es: 'Flujo completo',                                      en: 'Full workflow',                                               pt: 'Fluxo completo' },
    'flujo.sec_title':  { es: 'Del escáner al terminado — en un solo proveedor',     en: 'From scan to finish — with a single provider',               pt: 'Do escâner ao acabamento — em um único fornecedor' },
    'flujo.step1.name': { es: 'Escáner',      en: 'Scanner',     pt: 'Escâner' },
    'flujo.step1.desc': { es: 'Intraoral en clínica o a domicilio',           en: 'Intraoral in-clinic or at home',         pt: 'Intraoral na clínica ou a domicílio' },
    'flujo.step2.name': { es: 'Diseño CAD',   en: 'CAD Design',  pt: 'Design CAD' },
    'flujo.step2.desc': { es: 'Modelado digital y ajuste oclusal',            en: 'Digital modeling and occlusal adjustment', pt: 'Modelagem digital e ajuste oclusal' },
    'flujo.step3.name': { es: 'CAM & Fresado', en: 'CAM & Milling', pt: 'CAM & Fresagem' },
    'flujo.step3.desc': { es: 'Zirconio, PMMA, e.max o titanio',              en: 'Zirconia, PMMA, e.max or titanium',      pt: 'Zircônia, PMMA, e.max ou titânio' },
    'flujo.step4.name': { es: 'Sinterizado',  en: 'Sintering',   pt: 'Sinterização' },
    'flujo.step4.desc': { es: 'Cocción, glaze y caracterización',             en: 'Firing, glazing and characterization',   pt: 'Cocção, glaze e caracterização' },
    'flujo.step5.name': { es: 'Entrega',      en: 'Delivery',    pt: 'Entrega' },
    'flujo.step5.desc': { es: 'Lista para cementar en 24–72 h',              en: 'Ready to cement in 24–72 h',             pt: 'Pronta para cimentar em 24–72 h' },
    'flujo.hint':       { es: 'desliza para ver más &nbsp;›',                en: 'swipe to see more &nbsp;›',              pt: 'deslize para ver mais &nbsp;›' },

    /* ── SERVICIOS ────────────────────────── */
    'serv.sec_label':       { es: 'También por separado',           en: 'Also available separately',          pt: 'Também separadamente' },
    'serv.sec_title':       { es: 'Solo lo que necesitas',          en: 'Only what you need',                 pt: 'Apenas o que você precisa' },
    'serv.mill.name':       { es: 'Solo Fresado',                   en: 'Milling Only',                       pt: 'Só Fresagem' },
    'serv.mill.desc':       { es: 'Envías el STL, nosotros fresamos con máxima precisión',  en: 'You send the STL, we mill with maximum precision',  pt: 'Você envia o STL, nós fresamos com máxima precisão' },
    'serv.cad.name':        { es: 'Solo CAD',                       en: 'CAD Only',                           pt: 'Só CAD' },
    'serv.cad.desc':        { es: 'Diseño digital listo para fresar en tu centro',          en: 'Digital design ready to mill in your center',       pt: 'Design digital pronto para fresar no seu centro' },
    'serv.print3d.name':    { es: 'Impresión 3D',                   en: '3D Printing',                        pt: 'Impressão 3D' },
    'serv.print3d.desc':    { es: 'Modelos diagnósticos, guías quirúrgicas y provisionales', en: 'Diagnostic models, surgical guides and temporaries', pt: 'Modelos diagnósticos, guias cirúrgicos e provisórios' },
    'serv.scan_c.name':     { es: 'Escáner en Clínica',             en: 'In-Clinic Scanner',                  pt: 'Escâner na Clínica' },
    'serv.scan_c.desc':     { es: 'Llevamos el equipo a tu consultorio en Bogotá',  en: 'We bring the equipment to your office in Bogotá',   pt: 'Levamos o equipamento ao seu consultório em Bogotá' },
    'serv.scan_h.name':     { es: 'Escáner a Domicilio',            en: 'Home Scanner',                       pt: 'Escâner a Domicílio' },
    'serv.scan_h.desc':     { es: 'Escaneo en la ubicación del paciente — ideal para tercera edad o casos especiales', en: 'Scanning at the patient\'s location — ideal for elderly or special cases', pt: 'Escaneamento na localização do paciente — ideal para idosos ou casos especiais' },
    'serv.scan_h.mat':      { es: 'Bogotá y alrededores',           en: 'Bogotá and surroundings',            pt: 'Bogotá e arredores' },
    'serv.courses.name':    { es: 'Cursos Digitales',               en: 'Digital Courses',                    pt: 'Cursos Digitais' },
    'serv.courses.desc':    { es: 'Aprende Exocad, flujo CAD/CAM y gestión de casos digitales desde cero',  en: 'Learn Exocad, CAD/CAM workflow and digital case management from scratch',  pt: 'Aprenda Exocad, fluxo CAD/CAM e gestão de casos digitais do zero' },
    'serv.courses.mat':     { es: 'Online · A tu ritmo',            en: 'Online · At your pace',              pt: 'Online · No seu ritmo' },
    'serv.complex.name':    { es: 'Flujos Complejos',               en: 'Complex Workflows',                  pt: 'Fluxos Complexos' },
    'serv.complex.desc':    { es: 'Full Arch, carillas totales, híbridos sobre implantes y rehabilitaciones completas — a tu alcance', en: 'Full Arch, full veneers, implant hybrids and complete rehabilitations — within your reach', pt: 'Full Arch, facetas totais, híbridos sobre implantes e reabilitações completas — ao seu alcance' },
    'serv.advisory.name':   { es: 'Asesoría de Caso',               en: 'Case Advisory',                      pt: 'Assessoria de Caso' },
    'serv.advisory.desc':   { es: '¿No sabes por dónde empezar? Te orientamos sobre flujo, materiales y pasos a seguir', en: 'Don\'t know where to start? We guide you on workflow, materials and next steps', pt: 'Não sabe por onde começar? Orientamos sobre fluxo, materiais e próximos passos' },
    'serv.advisory.mat':    { es: 'WhatsApp · Mismo día',           en: 'WhatsApp · Same day',                pt: 'WhatsApp · Mesmo dia' },
    'badge.soon':           { es: 'Próximamente',                   en: 'Coming Soon',                        pt: 'Em Breve' },
    'badge.intl':           { es: 'Internacional',                  en: 'International',                      pt: 'Internacional' },

    /* ── FOOTER ───────────────────────────── */
    'footer.text': {
      es: 'prodigylabdental.com &nbsp;·&nbsp; Laboratorio dental de precisión',
      en: 'prodigylabdental.com &nbsp;·&nbsp; Precision dental laboratory',
      pt: 'prodigylabdental.com &nbsp;·&nbsp; Laboratório dental de precisão'
    },

    /* ── DISEÑO CAD (diseno-cad) ─────────────────────── */
    'cad.hero.tag': {
      es: 'Diseño CAD · Global · 24–48 h',
      en: 'CAD Design · Global · 24–48 h',
      pt: 'Design CAD · Global · 24–48 h'
    },
    'cad.hero.h1': {
      es: 'Tu próxima restauración,<br>diseñada en <em>menos de 24 h</em>',
      en: 'Your next restoration,<br>designed in <em>under 24 h</em>',
      pt: 'Sua próxima restauração,<br>projetada em <em>menos de 24 h</em>'
    },
    'cad.hero.sub': {
      es: 'Envíanos tu escáner STL y nuestro equipo diseña la restauración en Exocad. Recibes el archivo listo para fresar en tu propio centro. Sin contratos. Sin exclusividad.',
      en: 'Send us your STL scan and our team designs the restoration in Exocad. You receive the file ready to mill at your own center. No contracts. No exclusivity.',
      pt: 'Envie-nos o seu scanner STL e nossa equipe projeta a restauração no Exocad. Você recebe o arquivo pronto para fresagem no seu próprio centro. Sem contratos. Sem exclusividade.'
    },
    'cad.cta.upload': {
      es: 'Subir STL ahora',
      en: 'Upload STL now',
      pt: 'Enviar STL agora'
    },
    'cad.cta.wa': {
      es: 'Cotizar por WhatsApp',
      en: 'Quote via WhatsApp',
      pt: 'Cotar por WhatsApp'
    },
    'cad.cta.wa_href': {
      es: 'https://wa.me/573212816716?text=Hola%20PRODIGY%2C%20quiero%20cotizar%20un%20dise%C3%B1o%20CAD.',
      en: 'https://wa.me/573212816716?text=Hello%20PRODIGY%2C%20I%20want%20to%20quote%20a%20CAD%20design.',
      pt: 'https://wa.me/573212816716?text=Ol%C3%A1%20PRODIGY%2C%20quero%20cotar%20um%20design%20CAD.'
    },
    'cad.cta.register': {
      es: 'Crear cuenta gratis',
      en: 'Create free account',
      pt: 'Criar conta grátis'
    },
    'cad.t.cases': {
      es: 'casos/año',
      en: 'cases/year',
      pt: 'casos/ano'
    },
    'cad.t.delivery': {
      es: 'entrega máx.',
      en: 'max. delivery',
      pt: 'entrega máx.'
    },
    'cad.t.countries': {
      es: 'países',
      en: 'countries',
      pt: 'países'
    },
    'cad.t.from': {
      es: 'desde',
      en: 'from',
      pt: 'a partir de'
    },
    'cad.how.ey': {
      es: 'Cómo funciona',
      en: 'How it works',
      pt: 'Como funciona'
    },
    'cad.how.h2': {
      es: 'Tres pasos. <em>Un archivo.</em>',
      en: 'Three steps. <em>One file.</em>',
      pt: 'Três passos. <em>Um arquivo.</em>'
    },
    'cad.how.sub': {
      es: 'Sin instalaciones de tu parte. Solo envía el escáner y recibe el diseño.',
      en: 'No setup on your end. Just send the scan and receive the design.',
      pt: 'Sem instalações da sua parte. Basta enviar o scanner e receber o design.'
    },
    'cad.s1.h': {
      es: 'Envía tu escáner',
      en: 'Send your scan',
      pt: 'Envie seu scanner'
    },
    'cad.s1.p': {
      es: 'Sube el STL por el portal o compártelo por WhatsApp. Aceptamos STL, OBJ, PLY, Exocad y 3Shape.',
      en: 'Upload the STL via the portal or share it via WhatsApp. We accept STL, OBJ, PLY, Exocad and 3Shape.',
      pt: 'Faça upload do STL pelo portal ou compartilhe pelo WhatsApp. Aceitamos STL, OBJ, PLY, Exocad e 3Shape.'
    },
    'cad.s1.tag': {
      es: 'Portal · WhatsApp · WeTransfer',
      en: 'Portal · WhatsApp · WeTransfer',
      pt: 'Portal · WhatsApp · WeTransfer'
    },
    'cad.s2.h': {
      es: 'Diseñamos en Exocad',
      en: 'We design in Exocad',
      pt: 'Projetamos no Exocad'
    },
    'cad.s2.p': {
      es: 'Modelado con ajuste oclusal, márgenes y contactos proximales. Vista previa antes de entrega.',
      en: 'Modeled with occlusal adjustment, margins and proximal contacts. Preview before delivery.',
      pt: 'Modelado com ajuste oclusal, margens e contatos proximais. Pré-visualização antes da entrega.'
    },
    'cad.s2.tag': {
      es: 'Exocad · 3Shape · Medit',
      en: 'Exocad · 3Shape · Medit',
      pt: 'Exocad · 3Shape · Medit'
    },
    'cad.s3.h': {
      es: 'Recibes el archivo',
      en: 'You receive the file',
      pt: 'Você recebe o arquivo'
    },
    'cad.s3.p': {
      es: 'STL listo para fresar, compatible con cualquier fresadora industrial. Revisiones incluidas.',
      en: 'STL ready to mill, compatible with any industrial milling machine. Revisions included.',
      pt: 'STL pronto para fresagem, compatível com qualquer fresadora industrial. Revisões inclusas.'
    },
    'cad.s3.tag': {
      es: '24–48 h · Revisiones incluidas',
      en: '24–48 h · Revisions included',
      pt: '24–48 h · Revisões inclusas'
    },
    'cad.pr.ey': {
      es: 'Precios',
      en: 'Pricing',
      pt: 'Preços'
    },
    'cad.pr.h2': {
      es: 'Claros. <em>Sin sorpresas.</em>',
      en: 'Clear. <em>No surprises.</em>',
      pt: 'Claros. <em>Sem surpresas.</em>'
    },
    'cad.pr.sub': {
      es: 'En USD. Sin suscripción ni mínimos. Pagas solo por lo que diseñas.',
      en: 'In USD. No subscription or minimums. Pay only for what you design.',
      pt: 'Em USD. Sem assinatura ou mínimos. Pague apenas pelo que você projeta.'
    },
    'cad.p1.name': {
      es: 'Modelo Diagnóstico',
      en: 'Diagnostic Model',
      pt: 'Modelo Diagnóstico'
    },
    'cad.p1.desc': {
      es: 'Modelo de estudio para análisis oclusal o guías quirúrgicas.',
      en: 'Study model for occlusal analysis or surgical guides.',
      pt: 'Modelo de estudo para análise oclusal ou guias cirúrgicas.'
    },
    'cad.p_stl': {
      es: 'Archivo STL incluido',
      en: 'STL file included',
      pt: 'Arquivo STL incluído'
    },
    'cad.p_24h': {
      es: 'Entrega en 24 h',
      en: 'Delivery in 24 h',
      pt: 'Entrega em 24 h'
    },
    'cad.p2.name': {
      es: 'Incrustación',
      en: 'Inlay / Onlay',
      pt: 'Incrustação'
    },
    'cad.p2.desc': {
      es: 'Inlays, onlays y overlays con ajuste oclusal preciso.',
      en: 'Inlays, onlays and overlays with precise occlusal adjustment.',
      pt: 'Inlays, onlays e overlays com ajuste oclusal preciso.'
    },
    'cad.p_prev': {
      es: 'Vista previa incluida',
      en: 'Preview included',
      pt: 'Pré-visualização incluída'
    },
    'cad.p_rev': {
      es: 'Revisión incluida',
      en: 'Revision included',
      pt: 'Revisão incluída'
    },
    'cad.p3.badge': {
      es: 'Más solicitado',
      en: 'Most requested',
      pt: 'Mais solicitado'
    },
    'cad.p3.name': {
      es: 'Corona Completa',
      en: 'Full Crown',
      pt: 'Coroa Completa'
    },
    'cad.p3.desc': {
      es: 'Corona posterior o anterior, implanto-soportada o sobre muñón.',
      en: 'Posterior or anterior crown, implant-supported or on abutment.',
      pt: 'Coroa posterior ou anterior, suportada por implante ou sobre toco.'
    },
    'cad.p_48h': {
      es: 'Entrega en 48 h',
      en: 'Delivery in 48 h',
      pt: 'Entrega em 48 h'
    },
    'cad.p4.name': {
      es: 'Rehabilitación',
      en: 'Rehabilitation',
      pt: 'Reabilitação'
    },
    'cad.p4.val': {
      es: 'Cotizar',
      en: 'Quote',
      pt: 'Cotar'
    },
    'cad.p4.desc': {
      es: 'Full Arch, híbridos, carillas totales y casos complejos.',
      en: 'Full Arch, hybrids, full veneers and complex cases.',
      pt: 'Full Arch, híbridos, facetas totais e casos complexos.'
    },
    'cad.p_ori': {
      es: 'Orientación técnica',
      en: 'Technical guidance',
      pt: 'Orientação técnica'
    },
    'cad.p_quot': {
      es: 'Cotización sin compromiso',
      en: 'No-commitment quote',
      pt: 'Cotação sem compromisso'
    },
    'cad.pr.note': {
      es: '<strong>Pagos:</strong> Transferencia · Wompi · PayPal · Western Union. Precios sin IVA para clientes locales.',
      en: '<strong>Payments:</strong> Wire transfer · PayPal · Western Union. Prices exclude VAT for local clients.',
      pt: '<strong>Pagamentos:</strong> Transferência · PayPal · Western Union. Preços sem IVA para clientes locais.'
    },
    'cad.rv.ey': {
      es: 'Lo que dicen',
      en: 'What they say',
      pt: 'O que dizem'
    },
    'cad.rv.h2': {
      es: 'Resultados que <em>hablan solos</em>',
      en: 'Results that <em>speak for themselves</em>',
      pt: 'Resultados que <em>falam por si só</em>'
    },
    'cad.r1.txt': {
      es: '"Envié el STL el lunes y al día siguiente tenía el diseño listo para fresar. La calidad superó mis expectativas."',
      en: '"I sent the STL on Monday and the next day I had the design ready to mill. The quality exceeded my expectations."',
      pt: '"Enviei o STL na segunda-feira e no dia seguinte tinha o design pronto para fresagem. A qualidade superou minhas expectativas."'
    },
    'cad.r1.who': {
      es: 'Dr. Marcelo V. · Prostodoncista, Buenos Aires',
      en: 'Dr. Marcelo V. · Prosthodontist, Buenos Aires',
      pt: 'Dr. Marcelo V. · Prostodontista, Buenos Aires'
    },
    'cad.r2.txt': {
      es: '"Precios claros, entregas a tiempo, y siempre incluyen vista previa del diseño. Trabajo con ellos hace un año."',
      en: '"Clear prices, on-time deliveries, and they always include a design preview. I\'ve been working with them for a year."',
      pt: '"Preços claros, entregas pontuais, e sempre incluem prévia do design. Trabalho com eles há um ano."'
    },
    'cad.r2.who': {
      es: 'Dra. Carla M. · Laboratorio dental, Ciudad de México',
      en: 'Dr. Carla M. · Dental laboratory, Mexico City',
      pt: 'Dra. Carla M. · Laboratório dental, Cidade do México'
    },
    'cad.r3.txt': {
      es: '"Archivos perfectamente compatibles con nuestra fresadora Roland. Muy profesionales y rápidos."',
      en: '"Files perfectly compatible with our Roland milling machine. Very professional and fast."',
      pt: '"Arquivos perfeitamente compatíveis com nossa fresadora Roland. Muito profissionais e rápidos."'
    },
    'cad.r3.who': {
      es: 'Th. Dupont · Laboratorio dental, Lyon, Francia',
      en: 'Th. Dupont · Dental laboratory, Lyon, France',
      pt: 'Th. Dupont · Laboratório dental, Lyon, França'
    },
    'cad.faq.ey': {
      es: 'Preguntas frecuentes',
      en: 'FAQ',
      pt: 'Perguntas frequentes'
    },
    'cad.faq.h2': {
      es: 'Resolvemos tus <em>dudas</em>',
      en: 'We answer your <em>questions</em>',
      pt: 'Respondemos suas <em>dúvidas</em>'
    },
    'cad.q1': {
      es: '¿Necesito cuenta para cotizar?',
      en: 'Do I need an account to get a quote?',
      pt: 'Preciso de conta para cotar?'
    },
    'cad.a1': {
      es: 'No. Puedes escribirnos por WhatsApp sin registro. La cuenta es útil para seguimiento en vivo y notificaciones automáticas.',
      en: 'No. You can message us on WhatsApp without registering. An account is useful for live tracking and automatic notifications.',
      pt: 'Não. Você pode nos escrever pelo WhatsApp sem cadastro. A conta é útil para acompanhamento em tempo real e notificações automáticas.'
    },
    'cad.q2': {
      es: '¿Qué formatos aceptan?',
      en: 'What formats do you accept?',
      pt: 'Quais formatos vocês aceitam?'
    },
    'cad.a2': {
      es: 'STL, OBJ, PLY, proyectos Exocad (.constructioninfo) y 3Shape (.3oxz/.3ox). Si tienes otro, consúltanos.',
      en: 'STL, OBJ, PLY, Exocad projects (.constructioninfo) and 3Shape (.3oxz/.3ox). If you have another format, ask us.',
      pt: 'STL, OBJ, PLY, projetos Exocad (.constructioninfo) e 3Shape (.3oxz/.3ox). Se você tiver outro formato, consulte-nos.'
    },
    'cad.q3': {
      es: '¿Puedo ver el diseño antes de recibirlo?',
      en: 'Can I see the design before receiving it?',
      pt: 'Posso ver o design antes de recebê-lo?'
    },
    'cad.a3': {
      es: 'Sí. Enviamos capturas del diseño antes de la entrega final. Si algo no convence, ajustamos sin costo adicional.',
      en: 'Yes. We send design screenshots before final delivery. If something doesn\'t look right, we adjust at no extra cost.',
      pt: 'Sim. Enviamos capturas do design antes da entrega final. Se algo não convencer, ajustamos sem custo adicional.'
    },
    'cad.q4': {
      es: '¿El STL es compatible con mi fresadora?',
      en: 'Is the STL compatible with my milling machine?',
      pt: 'O STL é compatível com minha fresadora?'
    },
    'cad.a4': {
      es: 'Entregamos STL estándar, compatible con Roland, Zirkonzahn, VHF, Straumann, Amann Girrbach y cualquier fresadora con archivos abiertos.',
      en: 'We deliver standard STL, compatible with Roland, Zirkonzahn, VHF, Straumann, Amann Girrbach and any open-file milling machine.',
      pt: 'Entregamos STL padrão, compatível com Roland, Zirkonzahn, VHF, Straumann, Amann Girrbach e qualquer fresadora com arquivos abertos.'
    },
    'cad.q5': {
      es: '¿Trabajan con clientes fuera de Colombia?',
      en: 'Do you work with clients outside Colombia?',
      pt: 'Vocês trabalham com clientes fora da Colômbia?'
    },
    'cad.a5': {
      es: 'Sí. El servicio CAD es 100 % digital. Trabajamos con laboratorios y clínicas en más de 20 países. Entrega por descarga o email.',
      en: 'Yes. The CAD service is 100% digital. We work with labs and clinics in over 20 countries. Delivery by download or email.',
      pt: 'Sim. O serviço CAD é 100% digital. Trabalhamos com laboratórios e clínicas em mais de 20 países. Entrega por download ou e-mail.'
    },
    'cad.fin.h2': {
      es: 'Tu primer diseño en <em>menos de 24 horas</em>',
      en: 'Your first design in <em>under 24 hours</em>',
      pt: 'Seu primeiro design em <em>menos de 24 horas</em>'
    },
    'cad.fin.sub': {
      es: 'Sin contratos. Sin exclusividad. Solo calidad que habla por sí sola.',
      en: 'No contracts. No exclusivity. Just quality that speaks for itself.',
      pt: 'Sem contratos. Sem exclusividade. Só qualidade que fala por si só.'
    },

    /* ── INDEX ────────────────────────────── */
    'index.hero.subtitle': {
      es: 'LUXURY CAD/CAM',
      en: 'LUXURY CAD/CAM',
      pt: 'LUXURY CAD/CAM'
    },
    'index.hero.desc': {
      es: 'Diseño dental digital de alta precisión para tus necesidades',
      en: 'High-precision digital dental design for your needs',
      pt: 'Design dental digital de alta precisão para suas necessidades'
    },
    'index.srv.title': {
      es: 'Servicios de Diseño CAD/CAM',
      en: 'CAD/CAM Design Services',
      pt: 'Serviços de Design CAD/CAM'
    },
    'index.port.title': {
      es: 'PORTAFOLIO DE DISEÑOS',
      en: 'DESIGN PORTFOLIO',
      pt: 'PORTFÓLIO DE DESIGNS'
    },
    'index.port.sub': {
      es: 'Casos reales diseñados en Exocad y 3Shape — zirconio, disilicato, PMMA y resina 3D',
      en: 'Real cases designed in Exocad and 3Shape — zirconia, disilicate, PMMA and 3D resin',
      pt: 'Casos reais projetados em Exocad e 3Shape — zircônia, dissilicato, PMMA e resina 3D'
    },
    'index.port.cta': {
      es: 'Ver Portafolio Completo',
      en: 'View Full Portfolio',
      pt: 'Ver Portfólio Completo'
    },
    'index.remote.title': {
      es: 'Diseño Remoto 24/7',
      en: 'Remote Design 24/7',
      pt: 'Design Remoto 24/7'
    },
    'index.remote.sub': {
      es: 'Servicio profesional de diseño dental digital. Tú escaneas, nosotros diseñamos. Entrega en 24-48 horas con calidad garantizada.',
      en: 'Professional digital dental design service. You scan, we design. Delivery in 24–48 hours with guaranteed quality.',
      pt: 'Serviço profissional de design dental digital. Você escaneia, nós projetamos. Entrega em 24–48 horas com qualidade garantida.'
    },

    /* ── NOSOTROS ─────────────────────────── */
    'nosotros.hero.tag': {
      es: 'Bogotá, Colombia',
      en: 'Bogotá, Colombia',
      pt: 'Bogotá, Colômbia'
    },
    'nosotros.hero.h1': {
      es: 'Innovación que<br>se siente en<br><em>cada ajuste</em>',
      en: 'Innovation you feel<br>in <em>every fit</em>',
      pt: 'Inovação que se sente<br>em <em>cada ajuste</em>'
    },
    'nosotros.hero.sub': {
      es: 'Somos un laboratorio dental de precisión especializado en diseño CAD avanzado y manufactura CAM. No producimos volumen — producimos exactitud.',
      en: 'We are a precision dental laboratory specialized in advanced CAD design and CAM manufacturing. We don\'t produce volume — we produce accuracy.',
      pt: 'Somos um laboratório dental de precisão especializado em design CAD avançado e manufatura CAM. Não produzimos volume — produzimos exatidão.'
    },
    'nosotros.historia.tag': {
      es: 'Nuestra historia',
      en: 'Our story',
      pt: 'Nossa história'
    },
    'nosotros.porque.tag': {
      es: 'Por qué PRODIGY',
      en: 'Why PRODIGY',
      pt: 'Por que PRODIGY'
    },
    'nosotros.porque.h2': {
      es: 'Tres razones que nos <em>definen</em>',
      en: 'Three reasons that <em>define us</em>',
      pt: 'Três razões que nos <em>definem</em>'
    },
    'nosotros.como.tag': {
      es: 'Cómo trabajamos',
      en: 'How we work',
      pt: 'Como trabalhamos'
    },
    'nosotros.contact.tag': {
      es: 'Hablemos',
      en: 'Let\'s talk',
      pt: 'Vamos conversar'
    },
    'nosotros.contact.title': {
      es: 'Inicia tu <em>consulta técnica</em>',
      en: 'Start your <em>technical consultation</em>',
      pt: 'Inicie sua <em>consulta técnica</em>'
    },
    'nosotros.wa.btn': {
      es: 'Escríbenos por WhatsApp',
      en: 'Message us on WhatsApp',
      pt: 'Escreva-nos pelo WhatsApp'
    },

    /* ── PORTAFOLIO ───────────────────────── */
    'port.hero.tag': {
      es: 'PORTAFOLIO',
      en: 'PORTFOLIO',
      pt: 'PORTFÓLIO'
    },
    'port.hero.sub1': {
      es: 'DISEÑOS DENTALES · CAD/CAM',
      en: 'DENTAL DESIGNS · CAD/CAM',
      pt: 'DESIGNS DENTAIS · CAD/CAM'
    },
    'port.hero.desc': {
      es: 'Casos reales de rehabilitación, estética y prótesis. Cada trabajo refleja precisión técnica y excelencia clínica.',
      en: 'Real rehabilitation, esthetic and prosthetic cases. Every piece reflects technical precision and clinical excellence.',
      pt: 'Casos reais de reabilitação, estética e prótese. Cada trabalho reflete precisão técnica e excelência clínica.'
    },
    'port.hero.back': {
      es: 'Volver al inicio',
      en: 'Back to home',
      pt: 'Voltar ao início'
    },
    'port.filter.all': {
      es: 'Todos',
      en: 'All',
      pt: 'Todos'
    },
    'port.filter.rehab': {
      es: 'Rehabilitación',
      en: 'Rehabilitation',
      pt: 'Reabilitação'
    },
    'port.filter.estetica': {
      es: 'Estética',
      en: 'Esthetics',
      pt: 'Estética'
    },
    'port.filter.implantes': {
      es: 'Implantes',
      en: 'Implants',
      pt: 'Implantes'
    },
    'port.filter.protesis': {
      es: 'Prótesis',
      en: 'Prosthetics',
      pt: 'Prótese'
    },
    'port.filter.alineadores': {
      es: 'Alineadores',
      en: 'Aligners',
      pt: 'Alinhadores'
    },

    /* ── JOURNAL ──────────────────────────── */
    'journal.hero.badge': {
      es: 'Publicaciones técnicas verificadas',
      en: 'Verified technical publications',
      pt: 'Publicações técnicas verificadas'
    },
    'journal.hero.h1': {
      es: 'PRODIGY<br><span class="grad">Insights</span>',
      en: 'PRODIGY<br><span class="grad">Insights</span>',
      pt: 'PRODIGY<br><span class="grad">Insights</span>'
    },
    'journal.hero.p1': {
      es: 'Artículos técnicos escritos por el equipo de PRODIGY Lab Dental.<br>Comparativas de escáneres, protocolos CAD/CAM, selección de materiales y casos clínicos reales —<br>para que tu clínica tome decisiones informadas, no basadas en marketing.',
      en: 'Technical articles written by the PRODIGY Lab Dental team.<br>Scanner comparisons, CAD/CAM protocols, material selection and real clinical cases —<br>so your clinic makes informed decisions, not marketing-driven ones.',
      pt: 'Artigos técnicos escritos pela equipe do PRODIGY Lab Dental.<br>Comparações de escâneres, protocolos CAD/CAM, seleção de materiais e casos clínicos reais —<br>para que sua clínica tome decisões informadas, não baseadas em marketing.'
    },
    'journal.hero.p2': {
      es: 'Tiempo de lectura: 5–15 min · Actualizado mensualmente · Sin paywalls',
      en: 'Reading time: 5–15 min · Updated monthly · No paywalls',
      pt: 'Tempo de leitura: 5–15 min · Atualizado mensalmente · Sem paywalls'
    },
    'journal.hero.stat1': {
      es: 'Doctores suscritos',
      en: 'Subscribed doctors',
      pt: 'Médicos inscritos'
    },
    'journal.hero.stat2': {
      es: 'Casos entregados a tiempo',
      en: 'Cases delivered on time',
      pt: 'Casos entregues no prazo'
    },
    'journal.hero.stat3': {
      es: 'Años en digital',
      en: 'Years in digital',
      pt: 'Anos no digital'
    },
    'journal.articles.tag': {
      es: 'Artículos técnicos',
      en: 'Technical articles',
      pt: 'Artigos técnicos'
    },
    'journal.filter.all': {
      es: 'Todos',
      en: 'All',
      pt: 'Todos'
    },
    'journal.filter.ia': {
      es: 'IA',
      en: 'AI',
      pt: 'IA'
    },
    'journal.filter.material': {
      es: 'Materiales',
      en: 'Materials',
      pt: 'Materiais'
    },
    'journal.filter.equipo': {
      es: 'Equipos',
      en: 'Equipment',
      pt: 'Equipamentos'
    },
    'journal.filter.protocolo': {
      es: 'Protocolos',
      en: 'Protocols',
      pt: 'Protocolos'
    },
    'journal.read': {
      es: 'Leer artículo',
      en: 'Read article',
      pt: 'Ler artigo'
    },

    /* ── SOPORTE ──────────────────────────── */
    'soporte.hero.tag': {
      es: 'IA + Soporte humano',
      en: 'AI + Human support',
      pt: 'IA + Suporte humano'
    },
    'soporte.hero.h1': {
      es: 'Centro de soporte <em>técnico</em>',
      en: 'Technical <em>support center</em>',
      pt: 'Central de suporte <em>técnico</em>'
    },
    'soporte.hero.sub': {
      es: 'Guías de escaneo, fichas de materiales, seguimiento de casos y un asistente IA entrenado en odontología digital. Respuesta inmediata, 24/7.',
      en: 'Scanning guides, material sheets, case tracking and an AI assistant trained in digital dentistry. Immediate response, 24/7.',
      pt: 'Guias de escaneamento, fichas de materiais, acompanhamento de casos e um assistente IA treinado em odontologia digital. Resposta imediata, 24/7.'
    },
    'soporte.hero.btn': {
      es: 'Hablar con el Asistente IA',
      en: 'Chat with AI Assistant',
      pt: 'Falar com o Assistente IA'
    },
    'soporte.recursos.tag': {
      es: 'Recursos técnicos',
      en: 'Technical resources',
      pt: 'Recursos técnicos'
    },
    'soporte.recursos.h2': {
      es: 'Herramientas para <span style="color:var(--gold)">tu flujo de trabajo</span>',
      en: 'Tools for <span style="color:var(--gold)">your workflow</span>',
      pt: 'Ferramentas para <span style="color:var(--gold)">seu fluxo de trabalho</span>'
    },
    'soporte.faq.tag': {
      es: 'Preguntas frecuentes',
      en: 'Frequently asked questions',
      pt: 'Perguntas frequentes'
    },
    'soporte.contact.tag': {
      es: 'Contacto directo',
      en: 'Direct contact',
      pt: 'Contato direto'
    },
    'soporte.wa.btn': {
      es: 'Soporte por WhatsApp',
      en: 'WhatsApp Support',
      pt: 'Suporte pelo WhatsApp'
    },

    /* ── FRESADO-CAM ──────────────────────── */
    'milling.hero.tag': {
      es: 'Producción CAM · Bogotá, Colombia · 24–72 h',
      en: 'CAM Production · Bogotá, Colombia · 24–72 h',
      pt: 'Produção CAM · Bogotá, Colômbia · 24–72 h'
    },
    'milling.hero.h1': {
      es: 'Tu restauración fresada<br>con <em>precisión industrial</em>',
      en: 'Your restoration milled<br>with <em>industrial precision</em>',
      pt: 'Sua restauração fresada<br>com <em>precisão industrial</em>'
    },
    'milling.hero.sub': {
      es: 'Fresado de alta precisión en zirconio, PMMA, e.max y titanio. Laboratorio CAM en Bogotá con entrega en 24–72 horas. Envía el diseño o el escáner — nosotros producimos.',
      en: 'High-precision milling in zirconia, PMMA, e.max and titanium. CAM lab in Bogotá with 24–72 h delivery. Send the design or the scan — we produce.',
      pt: 'Fresagem de alta precisão em zircônia, PMMA, e.max e titânio. Laboratório CAM em Bogotá com entrega em 24–72 h. Envie o design ou o escâner — nós produzimos.'
    },
    'milling.cta.wa': {
      es: 'Cotizar por WhatsApp',
      en: 'Quote via WhatsApp',
      pt: 'Cotar por WhatsApp'
    },
    'milling.cta.stl': {
      es: 'Subir escáner STL',
      en: 'Upload STL scan',
      pt: 'Enviar escâner STL'
    },
    'milling.mat.eyebrow': {
      es: 'Materiales disponibles',
      en: 'Available materials',
      pt: 'Materiais disponíveis'
    },
    'milling.mat.h2': {
      es: 'Fresamos lo que <em>necesitas</em>',
      en: 'We mill what <em>you need</em>',
      pt: 'Fresamos o que <em>você precisa</em>'
    },

    /* ── CALCULADORA ──────────────────────── */
    'calc.hero.badge': {
      es: 'Calculadora de caso',
      en: 'Case calculator',
      pt: 'Calculadora de caso'
    },
    'calc.hero.h1': {
      es: '¿Cuánto cuesta<br>tu <em>restauración</em>?',
      en: 'How much does<br>your <em>restoration</em> cost?',
      pt: 'Quanto custa<br>a sua <em>restauração</em>?'
    },
    'calc.hero.sub': {
      es: 'Selecciona el servicio, material y cantidad para obtener un estimado al instante. Sin sorpresas.',
      en: 'Select the service, material and quantity to get an instant estimate. No surprises.',
      pt: 'Selecione o serviço, material e quantidade para obter uma estimativa instantânea. Sem surpresas.'
    },
    'calc.srv.title': {
      es: 'Tipo de restauración',
      en: 'Restoration type',
      pt: 'Tipo de restauração'
    },
    'calc.mat.title': {
      es: 'Material',
      en: 'Material',
      pt: 'Material'
    },
    'calc.qty.title': {
      es: 'Cantidad de unidades',
      en: 'Number of units',
      pt: 'Quantidade de unidades'
    },
    'calc.extras.title': {
      es: 'Opciones adicionales',
      en: 'Additional options',
      pt: 'Opções adicionais'
    },
    'calc.cta.lead': {
      es: 'Recibe cotización exacta por WhatsApp',
      en: 'Receive exact quote via WhatsApp',
      pt: 'Receba cotação exata pelo WhatsApp'
    },
    'calc.cta.wa': {
      es: 'Enviar caso por WhatsApp',
      en: 'Send case via WhatsApp',
      pt: 'Enviar caso pelo WhatsApp'
    },
    'calc.cta.cot': {
      es: 'Solicitar cotización exacta',
      en: 'Request exact quote',
      pt: 'Solicitar cotação exata'
    },

    /* ── ENVIA-TU-SCANNER ─────────────────── */
    'scan.hero.badge': {
      es: 'Para clínicas con escáner intraoral',
      en: 'For clinics with intraoral scanner',
      pt: 'Para clínicas com escâner intraoral'
    },
    'scan.hero.h1.line1': {
      es: 'Ya tienes el escáner.',
      en: 'You already have the scanner.',
      pt: 'Você já tem o escâner.'
    },
    'scan.hero.h1.line2': {
      es: 'Te falta el laboratorio.',
      en: 'You\'re missing the lab.',
      pt: 'Falta o laboratório.'
    },
    'scan.hero.sub': {
      es: 'Envíanos tu archivo .stl desde iTero, Medit o Trios. PRODIGY diseña en Exocad y produce la restauración. Entrega en 24–48 horas.',
      en: 'Send us your .stl file from iTero, Medit or Trios. PRODIGY designs in Exocad and produces the restoration. Delivery in 24–48 hours.',
      pt: 'Envie-nos seu arquivo .stl do iTero, Medit ou Trios. PRODIGY projeta no Exocad e produz a restauração. Entrega em 24–48 horas.'
    },
    'scan.cta.upload': {
      es: 'Enviar mi escáner',
      en: 'Send my scan',
      pt: 'Enviar meu escâner'
    },
    'scan.cta.prices': {
      es: 'Ver precios',
      en: 'View pricing',
      pt: 'Ver preços'
    },
    'scan.how.label': {
      es: 'Proceso',
      en: 'Process',
      pt: 'Processo'
    },
    'scan.how.title': {
      es: 'De tu escáner a la boca del paciente. Sin rodeos.',
      en: 'From your scan to the patient\'s mouth. No detours.',
      pt: 'Do seu escâner à boca do paciente. Sem rodeios.'
    }
  };

  /* Merge page-specific keys defined before this script */
  if (window._i18nExtra) {
    var ek;
    for (ek in window._i18nExtra) { T[ek] = window._i18nExtra[ek]; }
  }

  /* ─────────────────────────────────────────────────────────
     NÚCLEO
  ───────────────────────────────────────────────────────── */
  function detectLang() {
    var saved = localStorage.getItem('prd_lang');
    if (saved && LANGS.indexOf(saved) !== -1) return saved;
    var nav = ((navigator.language || navigator.userLanguage) || '').toLowerCase();
    if (nav.indexOf('es') === 0) return 'es';
    if (nav.indexOf('pt') === 0) return 'pt';
    return DEFAULT;
  }

  var i18n = {
    lang: detectLang(),

    t: function (key) {
      var entry = T[key];
      if (!entry) return key;
      return entry[this.lang] || entry[DEFAULT] || key;
    },

    set: function (lang) {
      if (LANGS.indexOf(lang) === -1) return;
      this.lang = lang;
      localStorage.setItem('prd_lang', lang);
      this.apply();
    },

    apply: function () {
      var self = this;

      /* text / innerHTML */
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var val = self.t(el.getAttribute('data-i18n'));
        el.innerHTML = val;
      });

      /* href */
      document.querySelectorAll('[data-i18n-href]').forEach(function (el) {
        var val = self.t(el.getAttribute('data-i18n-href'));
        if (val && val !== el.getAttribute('data-i18n-href')) el.href = val;
      });

      /* placeholder */
      document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
        el.placeholder = self.t(el.getAttribute('data-i18n-placeholder'));
      });

      /* toggle buttons active state */
      document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === self.lang);
      });

      /* html lang attribute */
      document.documentElement.lang = this.lang;
    },

    init: function () {
      this.apply();
    }
  };

  window.i18n = i18n;

  /* Auto-init on DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { i18n.init(); });
  } else {
    i18n.init();
  }

})();
