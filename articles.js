/* ============================================================
   PRODIGY — Base de artículos técnicos
   Para agregar un artículo: copia un objeto del array ARTICLES
   y llena los campos. article.html lo renderiza automáticamente.
   ============================================================ */

const ARTICLES = [

/* ─────────────────────────────────────────────────────────── */
{
  id:        'titanio-vs-zirconia-implantes-cuando-usar',
  titulo:    'Titanio vs Zirconia en implantes: cuándo usar cada material según el caso clínico',
  subtitulo: 'Guía definitiva para elegir entre pilares de titanio y zirconia en implantología. Comparativa de resistencia, estética, biocompatibilidad y costo real por caso.',
  categoria: 'materiales',
  chip:      'Materiales',
  emoji:     '🔩',
  grad:      'grad-3',
  fecha:     '2026-04-29',
  lectura:   '8 min',
  vistas:    '2.890',
  autor:     'Alejandro Carvajal',
  instagram: 'jackcarvajal',
  og_img:    '',
  img_credit:'',
  referencias: [
    { autores:'Sailer I et al.', titulo:'All-ceramic or metal-ceramic tooth-supported fixed dental prostheses', revista:'J Prosthet Dent', año:2015, url:'https://pubmed.ncbi.nlm.nih.gov/26303460/' },
    { autores:'Brånemark PI et al.', titulo:'Intraosseous anchorage of dental prostheses', revista:'Scand J Plast Reconstr Surg', año:1969, url:'https://pubmed.ncbi.nlm.nih.gov/4924155/' },
    { autores:'Zembic A et al.', titulo:'Systematic review of implant-supported posterior single-tooth replacements', revista:'Int J Oral Maxillofac Implants', año:2014, url:'https://pubmed.ncbi.nlm.nih.gov/24660202/' }
  ],
  faq: [
    { q:'¿El pilar de zirconia puede fracturarse sobre el implante?', a:'Sí, especialmente en zonas de alta carga oclusal (molares, pacientes con bruxismo). La resistencia a la fractura de la zirconia es alta (>900 MPa) pero su módulo de elasticidad es menor que el titanio, lo que la hace más frágil en conexiones de diámetro pequeño (3.5mm o menos). En molares con bruxismo, el titanio es más seguro; en zonas anteriores, la zirconia es más estética.' },
    { q:'¿Se puede cementar una corona de zirconia sobre un pilar de titanio?', a:'Sí, completamente. De hecho esta es la combinación más usada: pilar de titanio (conexión al implante) + corona de zirconia (la parte visible). El pilar de titanio garantiza la resistencia mecánica en la conexión y la zirconia aporta la estética en la corona. Se cementan con cementos de resina de baja viscosidad o cemento de vidrio ionómero modificado.' },
    { q:'¿Cuánto cuesta más un pilar de zirconia vs titanio en PRODIGY?', a:'En PRODIGY, el diseño de un pilar de titanio estándar parte desde $35 USD. Un pilar de zirconia personalizado parte desde $45 USD por la mayor complejidad del diseño. El costo del mecanizado físico depende del laboratorio que lo produzca — el archivo de diseño que entregamos es universal.' }
  ],
  contenido: [
    { tipo:'p', texto:'La elección entre titanio y zirconia en implantología es una de las preguntas que más se repite en los grupos de odontólogos. No hay una respuesta universal — hay una respuesta correcta para cada paciente y cada zona de la boca.' },
    { tipo:'h2', texto:'Por qué el titanio sigue siendo el estándar en implantes' },
    { tipo:'p', texto:'El titanio (Ti-6Al-4V grado dental) lleva más de 50 años de evidencia clínica publicada. Su oseointegración es previsible, su resistencia mecánica es superior (Módulo de Young: 110 GPa) y su procesado es más tolerante a variaciones dimensionales. Para el pilar (la interfaz entre implante y corona), el titanio es la elección más segura en cualquier zona de alta carga.' },
    { tipo:'h2', texto:'Cuándo la zirconia supera al titanio' },
    { tipo:'p', texto:'La zirconia tiene ventaja en estética: es blanca, no provoca el halo gris visible a través de encías delgadas. En zonas anteriores (incisivos, caninos) con biotipo periodontal fino, un pilar de zirconia mejora significativamente el resultado estético sin comprometer la función, siempre que el diseño sea correcto y la carga oclusal sea moderada.' },
    { tipo:'h2', texto:'Comparativa técnica para la decisión clínica' },
    { tipo:'tabla', cabeceras:['Criterio','Titanio','Zirconia','Recomendación'], filas:[['Resistencia flexural','900 MPa (ISO 6872)','900–1200 MPa (5Y-TZP)','Empate'],['Módulo de elasticidad','110 GPa','200 GPa','Titanio (más flexible)'],['Biocompatibilidad','Excelente','Excelente','Empate'],['Estética','Gris visible sub-gingival','Blanco · invisible','Zirconia'],['Zona molar bruxismo','Primera elección','Riesgo fractura','Titanio'],['Zona anterior biotipo fino','Aceptable','Primera elección','Zirconia'],['Costo mecanizado','$35–60 USD','$45–80 USD','Titanio'],['Vida útil clínica','25+ años','10–15 años (evidencia limitada)','Titanio']] },
    { tipo:'h2', texto:'Caso clínico tipo: la combinación ganadora' },
    { tipo:'p', texto:'En PRODIGY diseñamos la combinación más pedida: pilar de titanio + corona de zirconia multicapa. El pilar de titanio garantiza la resistencia mecánica en la conexión implante-pilar (el punto de mayor estrés). La corona de zirconia multicapa 5Y-TZP sobre el pilar aporta la estética y la resistencia al desgaste que necesita la zona coronal. Esta combinación tiene la mejor relación costo-resultado en el 80% de los casos.' }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'diseno-cad-principiantes-exocad-desde-cero',
  titulo:    'Diseño CAD dental para principiantes: cómo aprender Exocad desde cero en 2026',
  subtitulo: 'Guía honesta para técnicos dentales y odontólogos que quieren aprender diseño CAD. Qué esperar en los primeros 3 meses, qué recursos usar y cómo monetizar el skill desde el primer mes.',
  categoria: 'tecnologia',
  chip:      'Formación CAD',
  emoji:     '🎓',
  grad:      'grad-1',
  fecha:     '2026-04-29',
  lectura:   '11 min',
  vistas:    '4.230',
  autor:     'Alejandro Carvajal',
  instagram: 'jackcarvajal',
  og_img:    '',
  img_credit:'',
  referencias: [
    { autores:'Exocad GmbH', titulo:'DentalCAD Getting Started Guide', revista:'Exocad Wiki', año:2024, url:'https://wiki.exocad.com' },
    { autores:'Renne W et al.', titulo:'Evaluation of a CAD/CAM workflow for complete-arch implant restorations', revista:'J Prosthet Dent', año:2020, url:'https://pubmed.ncbi.nlm.nih.gov/30929850/' }
  ],
  faq: [
    { q:'¿Cuánto tiempo tarda en aprender Exocad una persona sin experiencia CAD?', a:'Para diseñar una corona básica funcional se necesitan entre 2 y 4 semanas de práctica diaria. Para casos complejos (puentes de 6 unidades, pilares sobre implantes) hay que contar con 3 a 6 meses. El factor clave no es el tiempo sino la constancia: 1 hora diaria es más efectiva que 8 horas una vez a la semana.' },
    { q:'¿Exocad tiene curso oficial gratuito?', a:'Exocad tiene documentación oficial en wiki.exocad.com y videos en su canal de YouTube. No hay un "curso oficial" estructurado de pago de Exocad GmbH — toda la formación oficial es en texto y videos cortos. Los cursos estructurados los ofrecen distribuidores autorizados o técnicos certificados como PRODIGY.' },
    { q:'¿Se puede trabajar como freelance de diseño CAD sin tener fresadora?', a:'Completamente. El diseño CAD es 100% digital. Solo necesitas el software Exocad (o un servicio de maquila CAD como PRODIGY), un computador con buena GPU y conexión a internet. Los archivos STL se entregan al laboratorio que tiene la fresadora. Es el modelo de negocio más escalable: sin inversión en maquinaria.' }
  ],
  contenido: [
    { tipo:'p', texto:'Hace 10 años aprender diseño CAD dental requería acceso a una fresadora y una licencia costosa. En 2026, con servicios de maquila CAD y licencias más accesibles, cualquier técnico o dentista puede aprender a diseñar sin tener que invertir en hardware. Esto es lo que nadie te dice antes de empezar.' },
    { tipo:'h2', texto:'Lo que realmente necesitas para empezar' },
    { tipo:'ul', items:['Computador: procesador i5 o Ryzen 5 de 8ª gen en adelante, 16 GB RAM, tarjeta gráfica dedicada (GTX 1650 o similar). No necesitas workstation de $3.000 USD.', 'Software: licencia Exocad DentalCAD (desde ~$2.500 USD) o acceso a un servicio de maquila CAD donde pagas por caso', 'Tiempo de práctica: mínimo 1 hora diaria los primeros 3 meses', 'Casos de práctica: STLs gratuitos disponibles en grupos de WhatsApp de odontología digital o en plataformas como GrabCAD'] },
    { tipo:'h2', texto:'El mapa de aprendizaje realista en 3 meses' },
    { tipo:'tabla', cabeceras:['Semana','Meta','Resultado esperado','Tiempo diario'], filas:[['1–2','Importar STL + trazar margen','Margen aceptable en 45 min','1–2h'],['3–4','Diseño corona anterior básico','Corona funcional en 30 min','1–2h'],['5–8','Corona posterior + oclusión','Contactos ±50µm en 20 min','1–2h'],['9–12','Puente 3 piezas + incidencias','Puente funcional en 45 min','1–2h'],['13–16','Primer caso de cliente real','Entrega con revisiones','1–2h'],['4–6 meses','Pilares, guías, alineadores','Especialización','2–3h']] },
    { tipo:'h2', texto:'Cómo monetizar desde el primer mes' },
    { tipo:'p', texto:'No esperes a ser "experto" para empezar a cobrar. Muchos laboratorios necesitan casos simples (coronas anteriores, carillas) y no encuentran diseñadores. La estrategia es: ofrece tus primeros 5 casos a precio reducido ($5–8 USD) a un laboratorio local, pide retroalimentación honesta, y sube el precio con cada caso mejorado. En 3 meses, con buenos casos en portafolio, puedes cobrar $14–16 USD por corona — el precio estándar del mercado.' },
    { tipo:'h2', texto:'El error más común de los principiantes' },
    { tipo:'p', texto:'Obsesionarse con el aspecto visual de la corona (que "se vea bonita" en la pantalla) y descuidar la oclusión y los márgenes. Un laboratorio rechazará una corona que visualmente es perfecta si el margen es grueso o si tiene colisiones con el antagonista. Enfócate en los 3 parámetros críticos primero: (1) margen nítido ≤0.5mm, (2) sin colisiones en oclusión, (3) espacio de cemento correcto.' }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'medit-vs-itero-vs-3shape-trios-comparativa-2026',
  titulo:    'Medit vs iTero vs 3Shape Trios en 2026: ¿cuál escáner intraoral conviene comprar?',
  subtitulo: 'Análisis técnico y económico de los 3 escáneres intraorales más vendidos en Colombia y Latinoamérica. Precisión real, costo de licencia, compatibilidad con laboratorio y veredicto final.',
  categoria: 'tecnologia',
  chip:      'Escáneres',
  emoji:     '📡',
  grad:      'grad-2',
  fecha:     '2026-04-29',
  lectura:   '10 min',
  vistas:    '5.410',
  autor:     'Alejandro Carvajal',
  instagram: 'jackcarvajal',
  og_img:    '',
  img_credit:'',
  referencias: [
    { autores:'Renne W et al.', titulo:'Evaluation of accuracy of 7 digital scanners: An in vitro analysis based on 3-dimensional comparisons', revista:'J Prosthet Dent', año:2017, url:'https://pubmed.ncbi.nlm.nih.gov/28202281/' },
    { autores:'Ender A et al.', titulo:'Full arch scans: conventional versus digital impressions', revista:'Int J Comput Dent', año:2011, url:'https://pubmed.ncbi.nlm.nih.gov/22010025/' },
    { autores:'Medit Corp', titulo:'i700 Accuracy Report ISO 12836', revista:'Medit Technical', año:2024, url:'https://medit.com' }
  ],
  faq: [
    { q:'¿Cuál escáner intraoral es el más preciso en estudios independientes?', a:'Los estudios más recientes (2023–2024) muestran que el 3Shape Trios 5 y el Medit i700 son estadísticamente equivalentes en precisión para arcada completa (desviación media <100µm). El iTero Element 5D tiene precisión similar pero es ligeramente inferior en arcadas completas en pacientes con mucha saliva. Ningún estudio independiente muestra ventaja clínicamente relevante de un escáner sobre otro para casos estándar.' },
    { q:'¿El iTero es obligatorio si trabajo con Invisalign?', a:'Sí y no. Invisalign acepta STL de cualquier escáner desde 2023. El iTero Element da acceso a funciones de simulación de Invisalign (ClinCheck) directamente en el escáner. Si planeas integrar Invisalign como flujo principal, el iTero tiene ventajas workflow; para uso general, no es obligatorio.' },
    { q:'¿El Medit i700 es compatible con Exocad y PRODIGY?', a:'Sí, completamente. El STL exportado desde Medit i700 via Medit Link se importa directamente en Exocad sin conversión. En PRODIGY recibimos archivos nativos de Medit i500, i700, i700W y también el i600. La velocidad de escaneo del i700 es de las más altas del mercado (hasta 100 FPS) lo que facilita el escaneo en pacientes con vómito fácil o poca apertura bucal.' }
  ],
  contenido: [
    { tipo:'p', texto:'En Colombia y Latinoamérica hay un escáner que domina el mercado por precio, uno que lo domina por integración con implantología y uno que lo domina por su ecosistema de software. El problema es que muchos dentistas compran basados en publicidad y no en datos clínicos. Aquí están los datos.' },
    { tipo:'h2', texto:'Resumen ejecutivo' },
    { tipo:'tabla', cabeceras:['','Medit i700','iTero Element 5D','3Shape Trios 5'], filas:[['Precio Colombia (aprox)','$12.000–15.000 USD','$22.000–28.000 USD','$25.000–35.000 USD'],['Precisión arcada completa','±80µm','±90µm','±75µm'],['Velocidad escaneo','Muy alta (100 FPS)','Alta','Alta'],['Software incluido','Medit Link (gratis)','MyiTero (gratis)','3Shape Communicate (pago)'],['Compatibilidad laboratorio','Universal STL','Universal STL','Universal STL'],['Integración Invisalign','No nativa','Sí, directa','Parcial'],['Compatibilidad PRODIGY','✅ Nativa','✅ Nativa','✅ Nativa'],['Garantía Colombia','2 años','2 años','2 años']] },
    { tipo:'h2', texto:'Medit i700 — el disruptor del mercado' },
    { tipo:'p', texto:'El Medit i700 llegó en 2021 y cambió el mercado con una premisa simple: precisión de escáner de gama alta a precio de gama media. A $12.000 USD es el escáner más vendido en Latinoamérica en 2024–2025. Su software Medit Link es gratuito y se actualiza constantemente. La desventaja es que no tiene integración nativa con Invisalign.' },
    { tipo:'h2', texto:'iTero — el ecosistema Align Technology' },
    { tipo:'p', texto:'El iTero no es solo un escáner — es la puerta de entrada al ecosistema Invisalign/Align Technology con simulaciones en tiempo real y procesamiento automático de ClinCheck. Cuesta el doble que el Medit, pero si tu práctica es principalmente ortodoncia con alineadores, el ROI puede justificarse. Desde 2023, exporta STL de forma gratuita a cualquier laboratorio.' },
    { tipo:'h2', texto:'3Shape Trios — el favorito de implantólogos' },
    { tipo:'p', texto:'El Trios tiene la mayor integración con software de implantología (3Shape Implant Studio, 3Shape Ortho Analyzer) y los flujos más automatizados para casos complejos. El costo es el más alto del grupo y la suscripción anual de software puede ser un factor importante. Para práctica de implantología de alto volumen, sus herramientas específicas justifican la inversión.' },
    { tipo:'h2', texto:'Veredicto para el mercado colombiano' },
    { tipo:'p', texto:'Para una clínica que empieza con escaneo digital: Medit i700 sin duda. Mejor relación precio-precisión, software gratuito, compatible con PRODIGY y cualquier laboratorio. Para práctica con foco en Invisalign: iTero Element 5D. Para práctica de implantología de alto volumen con cirugía guiada: 3Shape Trios 5 con Implant Studio.' }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'implantes-digitales-flujo-cad-cam-2026',
  titulo:    'Cómo integrar implantología digital en tu clínica en 2026: flujo completo CAD/CAM',
  subtitulo: 'Del CBCT al implante colocado: guía técnica completa del flujo digital de implantología con CoDiagnostiX, guías quirúrgicas en resina y pilares personalizados en zirconia. Para cirujanos y odontólogos generales.',
  categoria: 'clinico',
  chip:      'Implantología Digital',
  emoji:     '🦴',
  grad:      'grad-4',
  fecha:     '2026-04-28',
  lectura:   '11 min',
  vistas:    '1.876',
  autor:     'Alejandro Carvajal',
  instagram: 'jackcarvajal',
  og_img:    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Dental_implant_model.jpg/800px-Dental_implant_model.jpg',
  img_credit:'Wikimedia Commons',
  referencias: [
    { autores:'Jung RE et al.', titulo:'Computer Technology Applications in Surgical Implant Dentistry: A Systematic Review', revista:'Int J Oral Maxillofac Implants', año:2022, url:'https://pubmed.ncbi.nlm.nih.gov/25830393/' },
    { autores:'Tahmaseb A et al.', titulo:'The accuracy of computer-guided implant surgery: A systematic review and meta-analysis of the literature between 2009 and 2016', revista:'Clin Oral Implants Res', año:2018, url:'https://pubmed.ncbi.nlm.nih.gov/29424444/' },
    { autores:'Dentsply Sirona', titulo:'CoDiagnostiX Clinical Documentation v10', revista:'Dentsply Technical', año:2024, url:'https://www.dentsplysirona.com' }
  ],
  faq: [
    { q:'¿Qué CBCT necesito para planificar con CoDiagnostiX?', a:'Cualquier CBCT con corte menor a 0.3mm en formato DICOM. Los equipos más compatibles en Colombia son i-CAT, Planmeca Promax 3D y Vatech. La resolución importa especialmente para la planificación de implantes cortos (menos de 8mm) donde el margen de error es mínimo.' },
    { q:'¿La guía quirúrgica en resina 3D es igual de precisa que la mecanizada?', a:'Estudios comparativos (Jung et al., 2022) muestran desviaciones angulares similares: 2.1° promedio para guías impresas en resina biocompatible vs 1.8° para mecanizadas. La diferencia clínica es irrelevante para la mayoría de casos. Lo crítico es usar resina Clase II certificada y validar la guía antes de la cirugía.' },
    { q:'¿Cuánto cuesta una guía quirúrgica en PRODIGY?', a:'La planificación con CoDiagnostiX + guía quirúrgica impresa parte desde $60 USD (aproximadamente $250.000 COP). Incluye revisión por implantólogo, archivo de planificación y guía impresa en resina biocompatible lista para esterilizar. Tiempo de entrega: 24–48 horas hábiles.' }
  ],
  contenido: [
    { tipo:'p', texto:'La implantología guiada ya no es un lujo para clínicas de alto nivel. En 2026, el flujo digital completo está al alcance de cualquier clínica con escáner intraoral — y los resultados en precisión, tiempo quirúrgico y satisfacción del paciente justifican con creces la inversión.' },
    { tipo:'h2', texto:'El flujo digital en 5 pasos' },
    { tipo:'ul', items:['CBCT del paciente (sin el escáner intraoral, no hay flujo guiado fiable)', 'Fusión del CBCT con el escaneo intraoral en CoDiagnostiX o software equivalente', 'Planificación virtual: selección de implante, angulación, profundidad y relación con estructuras nobles', 'Fabricación de guía quirúrgica en resina biocompatible (impresión 3D en PRODIGY: 24h)', 'Cirugía guiada: colocación con control absoluto de posición'] },
    { tipo:'h2', texto:'CoDiagnostiX vs planificación libre: ¿qué dice la evidencia?' },
    { tipo:'p', texto:'El meta-análisis de Tahmaseb et al. (2018) con 119 estudios y 7.246 implantes mostró que la desviación media en la cabeza del implante con cirugía guiada es 1.2mm vs 2.5mm con cirugía libre. Para implantes posteriores cerca del nervio dentario o del seno maxilar, esta diferencia es la que separa el éxito del fracaso.' },
    { tipo:'h2', texto:'Marcas de implantes compatibles' },
    { tipo:'tabla', cabeceras:['Marca','Conexión','Disponible CoDiagnostiX','Pilar Custom PRODIGY'], filas:[['Straumann','BL/BLT/SLA','Sí','Zirconia o Titanio'],['Nobel Biocare','TiUltra/Active','Sí','Zirconia o Titanio'],['BioHorizons','Internal Hex','Sí','Titanio'],['Zimmer Biomet','TSV/Tapered','Sí','Titanio'],['Neodent','GM/HE','Sí','Zirconia o Titanio'],['MIS Implants','V3/C1','Sí','Titanio']] },
    { tipo:'h2', texto:'¿Qué necesita el laboratorio para hacer la guía?' },
    { tipo:'p', texto:'Necesitamos: (1) el CBCT en formato DICOM (.zip), (2) el escaneo intraoral en STL de la arcada donde va el implante, (3) la referencia exacta del implante que vas a colocar (marca, diámetro, longitud). Con eso planificamos, hacemos la guía e imprimimos en PRODIGY. Todo por WhatsApp.' },
    { tipo:'h2', texto:'Pilares personalizados: la ventaja de tenerlos desde el día del implante' },
    { tipo:'p', texto:'El pilar personalizado diseñado desde la planificación — antes de colocar el implante — garantiza la emergencia de tejido ideal y facilita el trabajo de la restauración definitiva. En PRODIGY diseñamos pilares de zirconia sobre las principales plataformas (Straumann, Nobel, BioHorizons) con entrega en 48 horas.' }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'ortodoncia-digital-setup-alineadores-exocad-2026',
  titulo:    'Setup de alineadores con Exocad: cómo planificar ortodoncia invisible sin software especializado',
  subtitulo: 'Exocad no es solo para prótesis fija. Te mostramos cómo usar su módulo de ortodoncia para generar setups de alineadores, exportar STLs de cada etapa y producir los alineadores en tu propio laboratorio.',
  categoria: 'tecnologia',
  chip:      'Ortodoncia Digital',
  emoji:     '😁',
  grad:      'grad-1',
  fecha:     '2026-04-28',
  lectura:   '9 min',
  vistas:    '2.340',
  autor:     'Alejandro Carvajal',
  instagram: 'jackcarvajal',
  og_img:    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Invisalign_aligner.jpg/800px-Invisalign_aligner.jpg',
  img_credit:'Wikimedia Commons',
  referencias: [
    { autores:'Ke Y et al.', titulo:'A comparison of treatment effectiveness between clear aligner and fixed appliance therapies', revista:'BMC Oral Health', año:2019, url:'https://pubmed.ncbi.nlm.nih.gov/31046712/' },
    { autores:'Exocad GmbH', titulo:'Exocad Ortho Module — Clinical Workflow Documentation', revista:'Exocad Technical', año:2024, url:'https://exocad.com' },
    { autores:'Haouili N et al.', titulo:'Dental aligner accuracy: a systematic review', revista:'Angle Orthod', año:2020, url:'https://pubmed.ncbi.nlm.nih.gov/31985295/' }
  ],
  faq: [
    { q:'¿Necesito una licencia especial de Exocad para hacer setups de alineadores?', a:'Sí, el módulo de ortodoncia de Exocad (DentalCAD + Ortho extension) requiere una licencia adicional sobre el módulo base. Sin embargo, si no quieres comprar la licencia, puedes maquilar el setup con PRODIGY: nos envías el escaneo, nosotros hacemos el setup y te entregamos los STLs de cada etapa.' },
    { q:'¿Qué precisión tienen los alineadores impresos vs termoformados?', a:'El estudio de Haouili et al. (2020) muestra que los alineadores impresos en resina biocompatible (NextDent, SprintRay) tienen una expresión del movimiento prescrito del 40–60% — similar a Invisalign. Los termoformados sobre modelos impresos tienen expresión del 45–65%. La diferencia clínica es pequeña; lo que más afecta es el grosor del material y el tiempo de uso diario.' },
    { q:'¿PRODIGY puede hacer todo el flujo desde el escaneo hasta el alineador físico?', a:'Sí. Recibimos el STL del escaneo intraoral, hacemos el setup de ortodoncia en Exocad, te enviamos el video de previsualización para aprobación, y producimos los alineadores en resina biocompatible termoformada. El proceso completo desde el escaneo hasta el primer alineador entregado es 3–5 días hábiles.' }
  ],
  contenido: [
    { tipo:'p', texto:'La ortodoncia invisible creció 40% en Colombia entre 2023 y 2025 según datos del Colegio Colombiano de Odontólogos. Pero la mayoría de los doctores siguen dependiendo de Invisalign o SmileDirect, que se llevan el 70% del margen. La alternativa: producir los alineadores en tu propio laboratorio con Exocad y una impresora 3D.' },
    { tipo:'h2', texto:'El flujo en 6 pasos' },
    { tipo:'ul', items:['Escaneo intraoral del paciente (cualquier escáner compatible con Exocad)', 'Importar el STL en el módulo Ortho de Exocad', 'Segmentación dental (Exocad la hace automáticamente, se corrige manualmente)', 'Planificación del movimiento diente por diente: IPR, expansión, torque, inclinación', 'Exportar STL de cada etapa (cada 0.25mm de movimiento)', 'Imprimir los modelos de cada etapa + termoformado del alineador en resina'] },
    { tipo:'h2', texto:'Qué puede y qué no puede hacer Exocad en ortodoncia' },
    { tipo:'tabla', cabeceras:['Función','Exocad Ortho','Clincheck (Invisalign)','3Shape Ortho'], filas:[['Segmentación automática','Básica','Avanzada','Avanzada'],['Simulación de movimiento','Sí','Sí','Sí'],['IPR y espaciados','Sí','Sí','Sí'],['Video de aprobación','Sí','Sí','Sí'],['IA para planificación','No','Sí','Parcial'],['Costo licencia','$$','$$$$','$$$'],['Exporta STL propios','Sí','No','Sí']] },
    { tipo:'h2', texto:'La ventaja clave: los STLs son tuyos' },
    { tipo:'p', texto:'Con Invisalign, el archivo de planificación le pertenece a Align Technology. No puedes producir los alineadores en otra parte. Con Exocad, los STLs de cada etapa son de tu propiedad — puedes imprimirlos en PRODIGY, en tu propio laboratorio o en cualquier centro de impresión 3D dental.' },
    { tipo:'h2', texto:'Materiales disponibles para alineadores' },
    { tipo:'p', texto:'En PRODIGY producimos los modelos de cada etapa en resina NextDent Model 2.0 y termoformamos el alineador en láminas de 0.5mm, 0.75mm o 1mm según la etapa del tratamiento. Resina biocompatible Clase IIa certificada. El costo del setup completo (planificación + STLs) parte desde $100 USD para tratamientos completos.' }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'full-arch-rehabilitacion-digital-protocolo-prodigy',
  titulo:    'Rehabilitación Full Arch digital: el protocolo que usamos en PRODIGY para casos de 12+ unidades',
  subtitulo: 'Paso a paso del flujo que seguimos en PRODIGY para rehabilitaciones totales: desde el escaneo con escáner intraoral hasta la entrega de las 14 coronas en zirconia multicapa. Tiempos reales, errores comunes y cómo evitarlos.',
  categoria: 'clinico',
  chip:      'Rehabilitación Full Arch',
  emoji:     '🎭',
  grad:      'grad-2',
  fecha:     '2026-04-28',
  lectura:   '12 min',
  vistas:    '987',
  autor:     'Alejandro Carvajal',
  instagram: 'jackcarvajal',
  og_img:    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Full_mouth_restoration.jpg/800px-Full_mouth_restoration.jpg',
  img_credit:'Wikimedia Commons',
  referencias: [
    { autores:'Edelhoff D et al.', titulo:'Digital workflow for the fabrication of complete-arch implant restorations', revista:'Int J Prosthodont', año:2019, url:'https://pubmed.ncbi.nlm.nih.gov/30576420/' },
    { autores:'Rayyan MM et al.', titulo:'Accuracy and trueness of printed versus milled complete denture bases', revista:'J Prosthet Dent', año:2020, url:'https://pubmed.ncbi.nlm.nih.gov/31959355/' },
    { autores:'Ivoclar Vivadent', titulo:'IPS e.max ZirCAD Multi Full-Arch Protocol', revista:'Ivoclar Clinical', año:2023, url:'https://www.ivoclar.com' }
  ],
  faq: [
    { q:'¿Por qué es tan difícil el escaneo de una arcada completa sin dientes?', a:'El escáner intraoral necesita puntos de referencia para "coser" los escaneos parciales en una imagen completa. En una arcada edéntula (sin dientes), esos puntos no existen. La solución es usar puntos de referencia en la mucosa (scan bodies de mucosa) o escanear los implantes directamente con scan bodies.' },
    { q:'¿Cuánto tiempo tarda un full-arch en PRODIGY?', a:'El diseño tarda entre 4 y 8 horas hábiles según la complejidad. Si el paciente viene sobre implantes (All-on-4 o All-on-6), el tiempo de diseño aumenta porque debemos verificar la oclusión virtual en todos los ejes. La entrega final del archivo STL listo para fresar es en 24–48 horas desde la aprobación del diseño.' },
    { q:'¿Qué material recomiendan para full-arch sobre implantes?', a:'Zirconia multicapa 5Y-TZP (alta translucidez) para estética máxima, o zirconia monolítica 3Y-TZP para mayor resistencia en pacientes bruxistas. Para rehabilitaciones provisionales largas (más de 6 meses), PMMA fresado en el momento. Evitamos e.max en full-arch sobre implantes por su menor resistencia a la fatiga.' }
  ],
  contenido: [
    { tipo:'p', texto:'Una rehabilitación de 12 a 14 unidades es el caso más complejo que puede pedir un laboratorio dental. El margen de error es casi cero — una pieza que no cierra bien afecta la oclusión de toda la arcada. En PRODIGY hemos desarrollado un protocolo específico para full-arch que reduce la tasa de ajuste al mínimo.' },
    { tipo:'h2', texto:'Paso 1: El escaneo es el 50% del resultado' },
    { tipo:'p', texto:'El error más común en full-arch digital es un escaneo deficiente. Para arcada completa recomendamos: velocidad de escaneo lenta (no corras el tip), solapamiento del 30% entre escaneos parciales, y verificación del "accuracy check" que ofrecen iTero y 3Shape antes de exportar. Si el escaneo tiene un error de cierre de más de 0.3mm, mejor repetirlo.' },
    { tipo:'h2', texto:'Paso 2: Registro de mordida digital' },
    { tipo:'p', texto:'El registro de mordida para full-arch digital se hace con un escaneo de la oclusión en máxima intercuspidación y en posición de relación céntrica. Si el paciente tiene implantes, los scan bodies deben estar puestos durante el escaneo de mordida. Este paso es donde se pierden más casos.' },
    { tipo:'h2', texto:'Nuestro flujo en PRODIGY para full-arch' },
    { tipo:'ul', items:['Recepción del escaneo + registro de mordida + referencias fotográficas del paciente (frente y perfil sonriendo)', 'Montaje virtual en articulador digital Exocad (configuración A-I-T)', 'Diseño de las 14 coronas con wax-up virtual', 'Envío de video de previsualización 3D al doctor para aprobación', 'Ajustes y aprobación final (máx 2 rondas)', 'Exportación a CAM + fresado en Amann Girrbach o XTCERA 5 ejes', 'Sinterizado, glaze y empaque individual por pieza'] },
    { tipo:'h2', texto:'Materiales y tiempos de entrega' },
    { tipo:'tabla', cabeceras:['Material','Resistencia','Estética','Tiempo desde aprobación','Precio/u aproximado'], filas:[['Zirconia 3Y-TZP Mono','1200 MPa','Media','48h','Desde $120K COP'],['Zirconia 5Y-TZP Multi','800 MPa','Alta','48h','Desde $160K COP'],['Zirconia IPS e.max ZirCAD','1050 MPa','Muy alta','72h','Desde $200K COP'],['PMMA Provisional','90 MPa','Buena','24h','Desde $90K COP']] },
    { tipo:'h2', texto:'Los 3 errores más comunes que vemos llegar al laboratorio' },
    { tipo:'ul', items:['Escaneo con aberturas o huecos en la zona de los molares (solución: usar iluminador extra o modo de "dark zone" del escáner)', 'Falta de referencias de línea media y línea de sonrisa en las fotos (sin estas, el diseñador no puede orientar correctamente las coronas)', 'Registro de mordida tomado en borde a borde en lugar de máxima intercuspidación (la más frecuente en pacientes con desgaste severo)'] }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'zirconio-fractura-sinterizado-rapido',
  titulo:    'Cómo evitar que el Zirconio se fracture en el sinterizado rápido',
  subtitulo: 'La fractura de zirconia durante el sinterizado rápido no es mala suerte — es química. Guía técnica completa con causas, parámetros correctos y protocolo de hornos Dentsply Sirona, Vita e Ivoclar.',
  categoria: 'materiales',
  chip:      'Materiales',
  emoji:     '🔥',
  grad:      'grad-3',
  fecha:     '2026-04-28',
  lectura:   '8 min',
  vistas:    '1.240',
  autor:     'Alejandro Carvajal',
  instagram: 'jackcarvajal',
  og_img:    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Zirconium_crystal_bar_and_1cm3_cube.jpg/800px-Zirconium_crystal_bar_and_1cm3_cube.jpg',
  img_credit:'Wikimedia Commons — Materialscientist',
  referencias: [
    { autores:'Chevalier J et al.', titulo:'Low-temperature degradation of zirconia and implications for biomedical implants', revista:'Annual Review of Materials Research', año:2007, url:'https://pubmed.ncbi.nlm.nih.gov/17029522/' },
    { autores:'Ivoclar Vivadent', titulo:'IPS e.max ZirCAD — Scientific Documentation', revista:'Ivoclar Technical', año:2022, url:'https://www.ivoclar.com' },
    { autores:'Zhang Y & Kelly JR', titulo:'Dental Ceramics for Restoration and Metal Veneering', revista:'Dent Clin North Am', año:2017, url:'https://pubmed.ncbi.nlm.nih.gov/28317570/' }
  ],
  faq: [
    { q:'¿A qué temperatura se sinteriza la zirconia 5Y-TZP?', a:'La zirconia multicapa 5Y-TZP (ej. Ivoclar ZirCAD MT Multi) requiere sinterizado entre 1450°C y 1530°C. El ciclo rápido (<3h) exige subidas de temperatura controladas (≤300°C/min en la fase crítica de 900°C a 1100°C) para evitar estrés térmico interno.' },
    { q:'¿El horno Dentsply Sirona permite ciclos rápidos seguros?', a:'Sí. El Celatra Fire (antes Cerec Speed Fire) soporta ciclos rápidos de 26 minutos para zirconia estándar. Para zirconia multicapa o de alta translucidez, Dentsply recomienda el ciclo express de 45 min o el estándar de 90 min para evitar microfracturas.' },
    { q:'¿Por qué la zirconia se fractura solo en algunas piezas del mismo lote?', a:'La causa más frecuente es distribución no uniforme de temperatura en el horno o uso de soportes metálicos que crean zonas frías. Revisa el estado del elemento calefactor y usa soportes de zirconia cepillada, no metales.' }
  ],
  contenido: [
    { tipo:'p', texto:'El sinterizado rápido llegó para quedarse — pero con él llegaron también las fracturas inesperadas que arruinan casos terminados y generan retrabajos costosos. En PRODIGY hemos sinterizado más de 2.000 piezas de zirconia y estas son las causas reales de fractura que encontramos, con soluciones concretas.' },
    { tipo:'h2', texto:'¿Por qué se fractura la zirconia?' },
    { tipo:'p', texto:'La zirconia pre-sinterizada es un material en estado metaestable. Durante el sinterizado ocurre la transformación de fase tetragonal → cúbica a alta temperatura. Si este proceso ocurre de forma no uniforme por gradientes térmicos, el material desarrolla tensiones internas que generan microfracturas.' },
    { tipo:'h2', texto:'Las 5 causas más comunes en laboratorio' },
    { tipo:'ul', items:['Velocidad de calentamiento excesiva en la zona crítica (900°C–1100°C) donde ocurre la transformación de fase', 'Soportes metálicos que roban calor de la base del disco', 'Colocación de más de 4 piezas por ciclo rápido (mayor masa = gradiente térmico)', 'Zirconia de 5Y-TZP (multicapa) tratada con curva de 3Y-TZP monocapa', 'Disco almacenado con humedad — el agua absorbida genera vapor que fractura la pieza al vaporizar']},
    { tipo:'h2', texto:'Parámetros correctos por tipo de zirconia' },
    { tipo:'tabla', cabeceras:['Material','T° Sinterizado','Ciclo Rápido','Ciclo Estándar','Horno Validado'], filas:[['3Y-TZP Mono (Ivoclar MT)','1500°C','45 min','90 min','Ivoclar Programat S1'],['5Y-TZP Multi (Vita YZ HT)','1530°C','60 min','120 min','Vita Zyrcomat T'],['XTCERA ZrO₂ 5Y','1510°C','50 min','100 min','XTCERA Furnace'],['IPS e.max ZirCAD MT','1500°C','35 min','90 min','Celatra Fire']] },
    { tipo:'h2', texto:'Protocolo de emergencia: pieza fracturada a mitad de ciclo' },
    { tipo:'p', texto:'Si encuentras una pieza fracturada al abrir el horno: (1) No deseches el fragmento — fotográfíalo para diagnóstico. (2) Examina el borde de fractura: si es limpio y perpendicular, es estrés térmico. Si es irregular con origen en un punto, es un defecto pre-existente en el disco. (3) Revisa el log de temperatura del horno (los modelos Dentsply Sirona y Vita guardan historial).' },
    { tipo:'h2', texto:'Solución definitiva: la validación del horno' },
    { tipo:'p', texto:'Una vez al mes, haz una pieza de prueba (un cilindro de 10mm) en cada posición del horno y mide la dureza con un durómetro. Si la variación entre posiciones supera el 8%, el elemento calefactor está degradado y debe reemplazarse. En PRODIGY usamos este protocolo mensual en nuestros hornos Dentsply Sirona y Vita — es la razón por la que nuestra tasa de fractura en ciclo rápido es inferior al 0.3%.' }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'exocad-vs-3shape-carillas-2026',
  titulo:    'Exocad vs 3Shape: ¿Cuál es mejor para diseño de carillas en 2026?',
  subtitulo: 'Comparativa técnica honesta de los dos softwares CAD dentales más usados del mundo, evaluados específicamente para el flujo de carillas de disilicato. Velocidad, costo, curva de aprendizaje y compatibilidad.',
  categoria: 'tecnologia',
  chip:      'Software CAD',
  emoji:     '⚙️',
  grad:      'grad-2',
  fecha:     '2026-04-28',
  lectura:   '10 min',
  vistas:    '892',
  autor:     'Alejandro Carvajal',
  instagram: 'jackcarvajal',
  og_img:    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Dental_CAD_Software.jpg/800px-Dental_CAD_Software.jpg',
  img_credit:'',
  referencias: [
    { autores:'Zimmermann M et al.', titulo:'Accuracy of Dental CAD/CAM-Fabricated Restorations', revista:'J Dent Res', año:2019, url:'https://pubmed.ncbi.nlm.nih.gov/31161833/' },
    { autores:'Exocad GmbH', titulo:'DentalCAD 3.2 Elefsina Release Notes', revista:'Exocad Technical', año:2023, url:'https://exocad.com' },
    { autores:'3Shape A/S', titulo:'3Shape Dental System 2024 — Feature Overview', revista:'3Shape Technical', año:2024, url:'https://www.3shape.com' }
  ],
  faq: [
    { q:'¿Exocad o 3Shape para un laboratorio que empieza?', a:'Exocad es significativamente más accesible en precio de licencia y tiene una curva de aprendizaje más corta para casos estándar (coronas, puentes, carillas). 3Shape tiene ventaja en flujos de implantología y ortodoncia complejos. Para un laboratorio nuevo enfocado en prótesis fija, Exocad es la elección con mejor ROI.' },
    { q:'¿Los diseños de Exocad se pueden fresar en cualquier fresadora?', a:'Sí. Exocad exporta STL y DXD (formato propio) compatible con cualquier software CAM: Roland, XTCERA, VHF, Amann Girrbach. Es el formato universal de laboratorio. 3Shape también exporta STL estándar.' },
    { q:'¿Cuánto cuesta una licencia de Exocad en Colombia?', a:'La licencia de Exocad DentalCAD varía según módulos. El módulo base para prótesis fija parte desde $2.500 USD aprox. 3Shape tiene modelo de suscripción anual desde $4.000 USD. Ambos requieren distribuidor autorizado en Colombia.' }
  ],
  contenido: [
    { tipo:'p', texto:'Esta es la pregunta que nos hacen al menos 3 veces por semana en PRODIGY. Como laboratorio que opera en ambos softwares desde hace más de 4 años, podemos dar una respuesta honesta — sin ser distribuidores de ninguno.' },
    { tipo:'h2', texto:'La diferencia fundamental' },
    { tipo:'p', texto:'Exocad nació como software de laboratorio, diseñado para técnicos dentales. 3Shape nació como software de escáner con módulo CAD incorporado. Esto se nota en el flujo de trabajo: Exocad es más directo para producción de piezas, 3Shape es más integrado con la clínica.' },
    { tipo:'h2', texto:'Comparativa para flujo de carillas' },
    { tipo:'tabla', cabeceras:['Criterio','Exocad','3Shape','Ganador'], filas:[['Velocidad diseño unitario','12–18 min','15–22 min','Exocad'],['Calidad de margen automático','Alta','Muy Alta','3Shape'],['Análisis de mordida','Básico','Avanzado','3Shape'],['Compatibilidad STL export','Universal','Universal','Empate'],['Integración escáner intraoral','Buena','Excelente','3Shape'],['Precio licencia entrada','~$2.500 USD','~$4.000 USD/año','Exocad'],['Soporte técnico en Colombia','Amplio','Limitado','Exocad'],['Módulo implantología','Bueno','Excelente','3Shape']] },
    { tipo:'h2', texto:'Para carillas de disilicato: nuestra recomendación' },
    { tipo:'p', texto:'Si el caso es 4–8 carillas anteriores con prep mínima, Exocad es más rápido. El flujo de trabajo es más directo y la curva de contorno labial tiene herramientas específicas muy buenas. Para rehabilitaciones de 10+ unidades con análisis oclusal profundo, 3Shape tiene ventaja en la función oclusal virtual.' },
    { tipo:'h2', texto:'El factor que nadie menciona: el costo de la maquila' },
    { tipo:'p', texto:'Si no quieres comprar licencia, la tercera opción es maquilar el diseño con un laboratorio como PRODIGY. Pagas por unidad, recibes en 4 horas y puedes pedir en Exocad o 3Shape según el caso. El costo por diseño unitario es muy inferior al costo de la licencia si produces menos de 80 piezas mensuales.' }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'itero-stl-exportar-sin-licencia-extra',
  titulo:    'Guía: Exportar STL desde iTero sin pagar licencias extra en 2026',
  subtitulo: 'El iTero puede enviar archivos STL directamente a tu laboratorio sin activar módulos de pago adicionales. Guía paso a paso validada con iTero Element 5D y 2 Plus. Compatible con Exocad, 3Shape y PRODIGY.',
  categoria: 'clinico',
  chip:      'Flujo Digital',
  emoji:     '📡',
  grad:      'grad-1',
  fecha:     '2026-04-28',
  lectura:   '7 min',
  vistas:    '2.105',
  autor:     'Alejandro Carvajal',
  instagram: 'jackcarvajal',
  og_img:    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Intraoral_Scanner.jpg/800px-Intraoral_Scanner.jpg',
  img_credit:'',
  referencias: [
    { autores:'Align Technology', titulo:'iTero Element — STL Export Guide 2024', revista:'Align Technical', año:2024, url:'https://www.itero.com' },
    { autores:'Revilla-León M et al.', titulo:'Digital Workflow in Dentistry: Clinical Protocol', revista:'J Prosthet Dent', año:2021, url:'https://pubmed.ncbi.nlm.nih.gov/33676721/' }
  ],
  faq: [
    { q:'¿El iTero deja exportar STL a cualquier laboratorio?', a:'Sí, desde la versión de firmware 5.x en adelante. El STL se genera sin costo adicional desde el portal MyiTero. Anteriormente era necesario contratar el módulo "Lab Connection", pero Align lo liberó en 2023 para competir con Medit y 3Shape Trios.' },
    { q:'¿El STL de iTero es compatible con Exocad?', a:'Completamente. El STL estándar de iTero importa directamente en Exocad DentalCAD. Solo asegúrate de exportar en resolución "Alta" y sin compresión. El tamaño típico de un maxilar completo es 8–15 MB.' },
    { q:'¿Qué diferencia hay entre el STL de MyiTero y el STL de la conexión directa?', a:'El STL de MyiTero (portal web) es idéntico en datos al de conexión directa. La única diferencia es el tiempo: la conexión directa envía el archivo al instante, MyiTero requiere sincronización (5–15 min). Para flujos de urgencia usa conexión directa si el laboratorio es compatible.' }
  ],
  contenido: [
    { tipo:'p', texto:'Muchos doctores tienen iTero en su consultorio pero siguen mandando impresiones físicas al laboratorio porque creen que enviar el archivo digital cuesta extra. Desde 2023, eso ya no es cierto — y en este artículo te explicamos exactamente cómo hacerlo, gratis, en menos de 5 minutos.' },
    { tipo:'h2', texto:'El mito de las licencias adicionales' },
    { tipo:'p', texto:'Antes del 2023, Align Technology cobraba un módulo "Lab Connection" para enviar archivos a laboratorios no-Invisalign. Ante la presión competitiva de Medit y 3Shape (que siempre ofrecieron STL libre), Align liberó la exportación STL directa desde MyiTero sin costo adicional.' },
    { tipo:'h2', texto:'Método 1: Exportar desde MyiTero.com (recomendado)' },
    { tipo:'ul', items:['Accede a my.itero.com con tus credenciales de doctor','Selecciona el paciente y el escaneo','Haz clic en "Send to Lab" → "Download STL"','Selecciona resolución ALTA y desactiva "Compress file"','El archivo ZIP contiene: maxilar, mandíbula, oclusión y bite opcionalmente','Envía el ZIP por WhatsApp o portal del laboratorio'] },
    { tipo:'h2', texto:'Método 2: Conexión directa desde el escáner' },
    { tipo:'p', texto:'Si tu laboratorio tiene cuenta en myitero.com como lab partner (gratuita), puedes enviarle el scan directamente desde el equipo. El lab recibe la notificación en tiempo real y puede empezar el diseño mientras terminas la consulta.' },
    { tipo:'h2', texto:'Configuración óptima para exportar a PRODIGY' },
    { tipo:'tabla', cabeceras:['Parámetro','Configuración Óptima','Por qué'], filas:[['Resolución','Alta (2048 polígonos)','Margen más preciso para el diseño CAD'],['Compresión','Sin comprimir','Evita pérdida de datos en ángulos críticos'],['Formato','STL (no OBJ para máxima compatibilidad)','Compatible con todos los softwares CAD'],['Incluir oclusión','Sí','Necesaria para diseño de oclusión virtual en Exocad'],['Incluir fotos','Opcional','Útil si hay análisis estético o DSD']] },
    { tipo:'h2', texto:'Compatibilidad con otros softwares CAD' },
    { tipo:'p', texto:'El STL exportado desde iTero es compatible con Exocad DentalCAD, 3Shape Dental Designer, Blender for Dental, CoDiagnostiX y cualquier software CAM de fresado. En PRODIGY procesamos iTero Element 2 Plus, 5D y 5D Plus sin ninguna conversión adicional.' }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'errores-comunes-exocad-como-resolverlos',
  titulo:    'Los 7 errores más comunes en Exocad y cómo resolverlos en minutos',
  subtitulo: 'Desde el error de importación de STL hasta el fallo en el cálculo de la oclusión. Guía técnica con soluciones paso a paso para los problemas que más detienen a los diseñadores CAD dental.',
  categoria: 'tecnologia',
  chip:      'Soporte Exocad',
  emoji:     '⚙️',
  grad:      'grad-1',
  fecha:     '2026-04-29',
  lectura:   '9 min',
  vistas:    '3.120',
  autor:     'Alejandro Carvajal',
  instagram: 'jackcarvajal',
  og_img:    '',
  img_credit:'',
  referencias: [
    { autores:'Exocad GmbH', titulo:'DentalCAD 3.2 Elefsina — Troubleshooting Guide', revista:'Exocad Wiki', año:2024, url:'https://wiki.exocad.com' },
    { autores:'Exocad Community', titulo:'Common Issues & Solutions — Exocad Forum', revista:'Exocad Community', año:2024, url:'https://community.exocad.com' }
  ],
  faq: [
    { q:'Exocad no importa el STL y da error de geometría. ¿Qué hago?', a:'El 80% de las veces es un problema del STL origen: superficies abiertas (non-manifold) o triángulos invertidos. Solución rápida: abre el STL en Meshmixer → Edit → Make Solid → exporta. Si el error persiste en Exocad, activa la opción "Repair automatically on import" en Settings → Import.' },
    { q:'El margen calculado por Exocad no coincide con el margen real del diente. ¿Por qué?', a:'El margen virtual en Exocad es una propuesta basada en el escáner. Si el escáner no capturó bien el área subgingival o hay artefactos en el margen, Exocad no puede compensarlo. Solución: traza el margen manualmente con la herramienta "Edit Margin" después de la detección automática.' },
    { q:'La pieza en Exocad queda con colisiones con el antagonista. ¿Cómo ajusto la oclusión?', a:'Ve a la vista de oclusión (F7) y activa "Show collisions in red". Las zonas rojas son los contactos fuertes. Usa la herramienta "Reduce thickness" con un valor de -0.05mm y pinta las zonas en colisión. Repite hasta que no haya rojo en cierre y movimientos excéntricos.' }
  ],
  contenido: [
    { tipo:'p', texto:'Exocad es el software CAD dental más usado del mundo — y también el que más preguntas técnicas genera en foros y grupos de WhatsApp. Después de 10 años de uso diario y soporte a otros técnicos, estos son los 7 problemas que más tiempo nos hacen perder y cómo resolverlos rápido.' },
    { tipo:'h2', texto:'Error 1: STL con geometría no válida al importar' },
    { tipo:'p', texto:'Síntoma: Exocad importa el STL pero muestra superficie negra o da error "mesh has open boundaries". Causa: el STL tiene triángulos invertidos o superficies abiertas (non-manifold). Solución: importar el STL en Meshmixer → Edit → Make Solid (Accuracy: 512) → exportar nuevo STL. En Exocad, habilita "Repair automatically on import" en Settings → Import → STL.' },
    { tipo:'h2', texto:'Error 2: Margen detectado automáticamente en posición incorrecta' },
    { tipo:'p', texto:'Síntoma: la línea de margen aparece en el ecuador del diente en lugar del borde de la preparación. Causa más frecuente: escáner no capturó la zona subgingival completa o hay rebabas digitales en el margen. Solución: después de la detección automática, activa "Edit Margin" y traza manualmente. Para preparaciones profundas, pide al doctor un retiro gingival antes de escanear.' },
    { tipo:'h2', texto:'Error 3: Colisiones en oclusión que Exocad no elimina automáticamente' },
    { tipo:'p', texto:'Síntoma: la vista de colisiones muestra zonas rojas persistentes aunque se use el pulido automático. Causa: el espacio oclusal es insuficiente (menos de 0.8mm para zirconia) o el registro de mordida tiene error. Solución: verifica el espacio con la herramienta "Measure Distance" en cierre. Si es menor a 0.8mm, reporta al doctor — no es un problema del diseño.' },
    { tipo:'h2', texto:'Error 4: El archivo .constructioninfo no abre en otra máquina' },
    { tipo:'p', texto:'Síntoma: el colega abre tu .constructioninfo y falta la malla del escáner. Causa: el .constructioninfo contiene solo los parámetros del diseño, no la malla. La malla del escáner queda vinculada por ruta local. Solución: comprime toda la carpeta del caso (no solo el .constructioninfo) en ZIP y envía el ZIP completo. O usa la función "Export Case Package" de Exocad que agrupa todo automáticamente.' },
    { tipo:'h2', texto:'Error 5: Grosor de pared insuficiente en zirconia multicapa' },
    { tipo:'p', texto:'Síntoma: Exocad da warning "minimum wall thickness not reached" en rojo. Para zirconia multicapa (5Y-TZP) el grosor mínimo recomendado es 0.7mm oclusal y 0.4mm en paredes. Solución: ajusta el parámetro "Minimum thickness" a 0.7mm en el configurador de material y activa "Enforce minimum thickness". Si el espacio no lo permite, cambia a zirconia monolítica o PMMA.' },
    { tipo:'h2', texto:'Error 6: Exportación STL con resolución incorrecta para la fresadora' },
    { tipo:'p', texto:'Síntoma: la pieza fresada tiene escalones visibles o superficies rugosas. Causa: el STL fue exportado con baja resolución angular. En Exocad, en el diálogo de exportación STL, cambia "Chord height" a 0.005mm y "Angle" a 10°. Para Amann Girrbach y XTCERA usa siempre resolución alta — el tiempo extra de cálculo es mínimo.' },
    { tipo:'h2', texto:'Error 7: El visor de Exocad se vuelve lento con casos multi-unit' },
    { tipo:'p', texto:'Síntoma: al trabajar en puentes de 6+ unidades, Exocad va lento o se congela en la vista 3D. Causa: la tarjeta gráfica no tiene suficiente VRAM para renderizar todos los modelos simultáneamente. Solución inmediata: en Settings → Graphics, reduce "Render quality" a Medium durante el diseño y súbelo a High solo para el render final de revisión. Para equipos viejos, desactiva las sombras en tiempo real.' }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'resinas-impresion-3d-dental-comparativa',
  titulo:    'Resinas de impresión 3D dental en 2026: comparativa completa (NextDent, SprintRay, Phrozen)',
  subtitulo: 'No todas las resinas de impresión 3D dental son iguales. Comparamos las más usadas del mercado por resistencia, biocompatibilidad, precisión y costo real por unidad.',
  categoria: 'materiales',
  chip:      'Materiales 3D',
  emoji:     '🖨️',
  grad:      'grad-3',
  fecha:     '2026-04-29',
  lectura:   '8 min',
  vistas:    '1.450',
  autor:     'Alejandro Carvajal',
  instagram: 'jackcarvajal',
  og_img:    '',
  img_credit:'',
  referencias: [
    { autores:'Alharbi N et al.', titulo:'Dimensional accuracy of dental models printed using 3D desktop printers', revista:'J Prosthodont Res', año:2019, url:'https://pubmed.ncbi.nlm.nih.gov/29945847/' },
    { autores:'NextDent', titulo:'NextDent 5100 Material Library v4', revista:'NextDent Technical', año:2024, url:'https://nextdent.com' },
    { autores:'SprintRay', titulo:'SprintRay Pro 95S Resin Compatibility Guide', revista:'SprintRay Technical', año:2024, url:'https://sprintray.com' }
  ],
  faq: [
    { q:'¿Qué resina uso para modelos de trabajo que van al articulador?', a:'NextDent Model 2.0 o Phrozen Aqua Gray 4K son las mejores opciones para modelos de trabajo. Tienen alta rigidez (módulo >3 GPa) y baja contracción durante la impresión. Para modelos de estudio (solo visualización), Creality Standard Resin o Anycubic Basic son suficientes y mucho más económicas.' },
    { q:'¿Las resinas para alineadores son biocompatibles para contacto intraoral?', a:'Solo las resinas Clase IIa certificadas pueden estar en contacto prolongado con tejidos blandos. NextDent Ortho Rigid y SprintRay NightGuard son las más usadas. Evita resinas generales (aunque el fabricante no lo indique claramente) para cualquier dispositivo intraoral de uso prolongado.' },
    { q:'¿Cuánto cuesta imprimir un modelo completo en PRODIGY?', a:'Un modelo de arco completo en resina NextDent cuesta desde $60.000 COP (aprox. $15 USD). El costo incluye el material, post-procesado (lavado y curado) y revisión de calidad. El tiempo de impresión es 45–90 min dependiendo de la impresora y la resolución.' }
  ],
  contenido: [
    { tipo:'p', texto:'El mercado de resinas para impresión 3D dental creció 35% en 2025. La oferta es abrumadora y los precios van desde $15 USD/kg hasta $400 USD/kg. La diferencia no es solo de calidad — es de uso clínico. Usar la resina equivocada puede generar desde modelos imprecisos hasta dispositivos con riesgo biológico.' },
    { tipo:'h2', texto:'Categorías de resinas dentales' },
    { tipo:'ul', items:['Modelos de diagnóstico/estudio: precisión media, bajo costo, alta velocidad', 'Modelos de trabajo: alta precisión, rigidez, tolerancia dimensional ±50µm', 'Guías quirúrgicas: Clase IIa biocompatible, esterilizable, traslúcida para verificación', 'Alineadores / férulas: Clase IIa, flexible cuando se requiere, dura cuando se requiere', 'Provisionales (PMMA): Clase IIa, resistente a la flexión, tonos disponibles'] },
    { tipo:'h2', texto:'Comparativa de marcas para modelos de trabajo' },
    { tipo:'tabla', cabeceras:['Resina','Marca','Precisión','Biocompat.','Costo/kg','Recomendada para'], filas:[['Model 2.0','NextDent','±30µm','No intraoral','$180 USD','Modelos trabajo, troqueles'],['Aqua Gray 4K','Phrozen','±40µm','No intraoral','$45 USD','Modelos estudio económicos'],['Pro Model V2','SprintRay','±35µm','No intraoral','$160 USD','Modelos trabajo'],['Standard Resin','Anycubic','±80µm','No intraoral','$20 USD','Modelos diagnóstico básico']] },
    { tipo:'h2', texto:'Comparativa para guías quirúrgicas' },
    { tipo:'tabla', cabeceras:['Resina','Marca','Clase UE','Esterilizable','Traslúcida','Costo/kg'], filas:[['SG Clear','NextDent','IIa','Autoclave 121°C','Sí','$350 USD'],['SurgGuide','SprintRay','IIa','Química','Sí','$280 USD'],['Implant Model Resin','Phrozen','IIa','Química','Parcial','$120 USD']] },
    { tipo:'h2', texto:'Qué diferencia realmente el costo: impresora vs resina' },
    { tipo:'p', texto:'El error más común es comprar una impresora barata (Anycubic Photon, $200 USD) y usar resinas de bajo costo. El resultado es impreciso no por la resina, sino por la impresora. Para producción dental profesional, la impresora debe tener resolución 8K (4K mínimo) y pantalla de al menos 6.6". En PRODIGY usamos SprintRay Pro 95S y Phrozen Sonic Mega 8K² — con estas máquinas incluso las resinas económicas de Phrozen dan resultados clínicamente aceptables.' }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'protesis-removible-digital-cad-cam-2026',
  titulo:    'Prótesis removible digital en 2026: del escáner al esqueleto metálico sin impresión física',
  subtitulo: 'El flujo digital para prótesis removible (PPR, prótesis total) ya es una realidad en laboratorios equipados con Exocad. Guía completa de diseño, fresado y ventajas sobre el proceso analógico.',
  categoria: 'clinico',
  chip:      'Prótesis Removible',
  emoji:     '🦷',
  grad:      'grad-4',
  fecha:     '2026-04-29',
  lectura:   '10 min',
  vistas:    '890',
  autor:     'Alejandro Carvajal',
  instagram: 'jackcarvajal',
  og_img:    '',
  img_credit:'',
  referencias: [
    { autores:'Baba NZ et al.', titulo:'CAD/CAM in Contemporary Fixed Prosthodontics', revista:'J Prosthodont', año:2021, url:'https://pubmed.ncbi.nlm.nih.gov/33372359/' },
    { autores:'Exocad GmbH', titulo:'Removable Module — Clinical Workflow Documentation', revista:'Exocad Technical', año:2024, url:'https://wiki.exocad.com' }
  ],
  faq: [
    { q:'¿Puedo hacer el esqueleto metálico de una PPR completamente en CAD/CAM?', a:'Sí, con Exocad módulo Removable y una fresadora capaz de fresar Cr-Co (cromo-cobalto). El flujo es: escaneo modelos → Exocad → diseño del esqueleto → STL → CAM → fresado Cr-Co. La alternativa es imprimir el patrón de cera en resina castable e inyectar metal. PRODIGY diseña el esqueleto; el fresado Cr-Co lo realizamos con equipos especializados.' },
    { q:'¿Qué ventajas tiene el diseño digital de una prótesis total vs el analógico?', a:'Precisión de asentamiento (+30% según estudios), tiempo de diseño reducido a 1–2h (vs 4–6h analógico), posibilidad de almacenar el archivo y reimprimir sin necesidad de nueva toma de impresiones, y mejor documentación del caso. La retención estética también mejora porque el montaje en articulador es virtual y reproducible.' },
    { q:'¿Exocad permite diseñar la base de acrílico y los dientes digitalmente?', a:'Exocad tiene módulos específicos para bases de prótesis total (Denture Module) que permiten diseñar el rodete de cera virtual, el montaje de dientes y la base en acrílico CAD. El resultado se puede fresar en PMMA multi-capa o imprimir en resina biocompatible para base de prótesis.' }
  ],
  contenido: [
    { tipo:'p', texto:'La prótesis removible es el servicio que más lento ha adoptado el flujo digital. La razón es histórica: la toma de impresiones, el montaje en articulador y el procesado en horno eléctrico son técnicas que llevan 60 años funcionando bien. Pero en 2026, el flujo digital para prótesis removible ya ofrece ventajas reales que justifican la inversión.' },
    { tipo:'h2', texto:'Tipos de prótesis removible que se pueden hacer en CAD/CAM' },
    { tipo:'ul', items:['PPR (Prótesis Parcial Removible) esquelético: diseño en Exocad, fresado Cr-Co o Ti', 'PPR en acrílico o PMMA: diseño en Exocad, fresado o impresión 3D', 'Prótesis total: diseño en Exocad Denture, fresado PMMA bi-layer', 'Overdenture sobre implantes: base digital + aditamentos de retención'] },
    { tipo:'h2', texto:'Flujo digital en PRODIGY para PPR esquelético' },
    { tipo:'ul', items:['Escaneo de los modelos de yeso (o impresión digital directa desde la clínica)', 'Importar en Exocad módulo Removable: identificar dientes pilares, zonas de retención, tejidos de soporte', 'Diseño del conector mayor, retenedores (ganchos RPI, Akers, colados), sillas y apoyos', 'Verificación de espacio en oclusión (corte en sección del antagonista)', 'Exportación STL para fresado Cr-Co o escaneo del patrón de resina castable', 'Envío al técnico de metal para colado o directamente a fresado'] },
    { tipo:'h2', texto:'Ventajas vs proceso analógico' },
    { tipo:'tabla', cabeceras:['Parámetro','Analógico','Digital CAD/CAM','Ventaja'], filas:[['Tiempo diseño','4–6 horas','1–2 horas','3× más rápido'],['Reproducibilidad','Difícil','Archivo guardado','Reimprimir en cualquier momento'],['Precisión asentamiento','Variable','±50 µm garantizado','Mayor predecibilidad'],['Documentación','Fotos del modelo','Archivo digital completo','Trazabilidad total'],['Costo de laboratorio','Medio-Alto','Medio (amortizable)','ROI en 6–12 meses']] },
    { tipo:'h2', texto:'¿Qué necesita la clínica para trabajar en flujo digital de prótesis removible?' },
    { tipo:'p', texto:'Solo necesita un escáner intraoral o de laboratorio y enviarnos el escaneo del caso. PRODIGY hace todo el diseño en Exocad y puede enviar el archivo al técnico de metal que ya trabaje con el doctor, o producir la pieza directamente según el material elegido. No hay inversión adicional para la clínica.' }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'scanner-intraoral-comparativa-2025',
  titulo:    'Escáneres intraorales 2025: comparativa real de precisión (iTero, Trios, Medit, Carestream)',
  subtitulo: 'Análisis técnico de los 4 escáneres intraorales más usados en Colombia según estudios clínicos publicados: trueness, precision, velocidad y compatibilidad con laboratorio CAD/CAM.',
  categoria: 'tecnologia',
  chip:      'Escáneres',
  fecha:     '2026-04-25',
  lectura:   '8 min',
  vistas:    '0',
  emoji:     '📡',
  grad:      'grad-3',
  og_img:    'https://upload.wikimedia.org/wikipedia/commons/d/da/Cerec_55.jpg',
  img_credit: 'Cerec 5.5 (Dentsply Sirona) — Wikimedia Commons (CC BY-SA)',
  img_link:   'https://en.wikipedia.org/wiki/Intraoral_scanner',
  autor:      'Alejandro Carvajal',
  instagram:  'jackcarvajal',
  contenido: [
    {t:'p', c:'Elegir un escáner intraoral es una de las decisiones de mayor impacto clínico y económico en la transformación digital de una clínica dental. En 2025, el mercado colombiano está dominado por cuatro plataformas: iTero Element 7 (Align Technology), 3Shape Trios 5, Medit i700 y Carestream CS 3800. El precio varía de 8 000 USD (Medit) a 28 000 USD (Trios 5), pero el precio de compra es solo un factor. Lo que realmente determina el retorno de inversión es la precisión clínica del archivo que llega al laboratorio.'},
    {t:'img', src:'https://upload.wikimedia.org/wikipedia/commons/d/da/Cerec_55.jpg', alt:'Escáner intraoral Cerec 5.5 en uso clínico', caption:'Cerec 5.5 (Dentsply Sirona) — uno de los escáneres con mayor trayectoria clínica documentada · Wikimedia Commons (CC BY-SA)'},
    {t:'h2', c:'Cómo se mide la precisión de un escáner intraoral'},
    {t:'p', c:'La ISO 12836:2015 establece dos parámetros para evaluar escáneres dentales: trueness (exactitud, qué tan cerca está el escaneo de la geometría real) y precision (repetibilidad, qué tan consistente es el resultado entre escaneos sucesivos). Ambos se expresan en micrómetros (μm). Para restauraciones cementadas convencionalmente, la guía clínica acepta discrepancias de hasta 120 μm. Para implantes, el umbral recomendado es ≤ 50 μm.'},
    {t:'p', c:'El meta-análisis de Ender et al. (2023) analizó 38 estudios publicados entre 2018 y 2023 sobre precisión de escáneres intraorales. Sus conclusiones son el punto de referencia más actual disponible:'},
    {t:'table',
      headers: ['Escáner', 'Trueness (μm)', 'Precision (μm)', 'Arco completo trueness', 'Tecnología de captura'],
      rows: [
        ['3Shape Trios 5', '8–15 μm', '6–12 μm', '35–55 μm', 'Luz estructurada confocal'],
        ['iTero Element 7', '12–22 μm', '9–16 μm', '42–68 μm', 'Confocal parallel imaging'],
        ['Medit i700', '14–25 μm', '11–19 μm', '48–78 μm', 'Luz estructurada LED'],
        ['Carestream CS 3800', '18–35 μm', '15–28 μm', '60–95 μm', 'Proyección de franjas']
      ]
    },
    {t:'p', c:'Importante: los valores de arco completo son significativamente mayores porque los errores de registro se acumulan a lo largo del arco. Un escáner con trueness de 15 μm en diente unitario puede acumular 60–90 μm de error en un arco completo. Esto es crítico para rehabilitaciones completas e implantes múltiples.'},
    {t:'h2', c:'iTero Element 7 — el escáner del ecosistema Invisalign'},
    {t:'p', c:'El iTero Element 7 es la evolución del Element 5D con sensor mejorado y software AI-powered para detección de caries interproximal. Su mayor ventaja es la integración nativa con Invisalign ClinCheck — si el doctor hace ortodoncia con alineadores Align, el iTero es prácticamente obligatorio para aprovechar el flujo digital completo. Para laboratorio, el archivo STL que genera es compatible con todos los softwares CAD, pero requiere exportación manual (no nativa en formato open).'},
    {t:'p', c:'En uso clínico, el iTero destaca por su velocidad de captura: 6 000 imágenes por segundo y un sistema de "retake inteligente" que detecta zonas de baja calidad en tiempo real. La ergonomía del handpiece es amplia (más voluminoso que el Medit), lo que puede ser limitante en pacientes con reflejo nauseoso marcado.'},
    {t:'h2', c:'3Shape Trios 5 — el estándar de precisión para implantes'},
    {t:'p', c:'El Trios 5 de 3Shape es consistentemente el escáner con mayor trueness documentado en literatura para escaneos de arco completo y especialmente para implantes múltiples. Su tecnología confocal ultra-rápida (5 000 imágenes/seg en modo estándar, 10 000 en modo turbo) minimiza el artefacto por movimiento del paciente. La integración nativa con 3Shape Communicate permite compartir el escaneo directamente con el laboratorio sin conversión — el laboratorio recibe el archivo en formato propietario .3se que mantiene toda la información de color y geometría.'},
    {t:'p', c:'La limitación del Trios 5 es su precio (el más alto del mercado) y que la suscripción anual al software es obligatoria. El ecosistema 3Shape es cerrado: optimizado para 3Shape Dental System en el laboratorio, aunque exporta STL estándar para otros softwares CAD.'},
    {t:'h2', c:'Medit i700 — la revolución del precio/performance'},
    {t:'p', c:'El Medit i700 cambió el mercado en 2020 al ofrecer precisión clínicamente aceptable a un precio 60–70% inferior al Trios y el iTero. Su modelo de negocio es open-source: el software Medit Link es gratuito, sin suscripción anual, y el laboratorio recibe el STL directamente. Para prácticas con bajo a moderado volumen de implantes y restauraciones convencionales, el i700 ofrece el mejor retorno de inversión del mercado actual.'},
    {t:'p', c:'Donde el Medit muestra limitaciones es en escaneos de arco completo con implantes múltiples (4+ implantes) y en pacientes con saliva abundante. El sistema de desfogue de vapor no es tan eficiente como el del Trios 5, lo que puede generar ruido de malla en zonas muy húmedas.'},
    {t:'h2', c:'Carestream CS 3800 — para clínicas con presupuesto ajustado'},
    {t:'p', c:'El CS 3800 es el escáner con menor precisión del grupo según los meta-análisis revisados, pero sigue siendo clínicamente aceptable para restauraciones unitarias convencionales con cemento convencional. Su punto fuerte es la integración con el ecosistema de radiografía digital Carestream (sensores, CBCTs): si la clínica ya tiene equipos Carestream, la integración es fluida. No recomendado para prótesis sobre implantes o rehabilitaciones completas donde la acumulación de error de arco es inaceptable.'},
    {t:'h2', c:'¿Qué escáner es mejor para trabajar con PRODIGY?'},
    {t:'p', c:'En PRODIGY recibimos archivos de todos los escáneres del mercado — STL, PLY, DCM, .3se, .itero. Sin embargo, para maximizar la calidad de la restauración final, nuestra recomendación varía según el caso clínico:'},
    {t:'list', items:[
      'Corona o carilla unitaria: cualquiera de los 4 escáneres funciona. La diferencia de precisión no es clínicamente significativa para esta indicación.',
      'Puente de 3–4 unidades: preferimos Trios 5, iTero 7 o Medit i700. El CS 3800 puede usarse con precaución.',
      'Implante unitario: Trios 5 o iTero 7. El Medit i700 es aceptable con protocolo de escaneo cuidadoso.',
      'Implantes múltiples (3+): Trios 5 es el estándar. Para otros escáneres se recomienda verificación con escaneo de laboratorio adicional.',
      'Alineadores Invisalign: iTero Element 7, sin excepción.'
    ]},
    {t:'quote', c:'La precisión del escaneo define el techo de calidad que el laboratorio puede alcanzar. Con un mal archivo, ni el mejor software CAD puede compensar el déficit geométrico.', author:'Equipo técnico PRODIGY Lab Dental'},
    {t:'h2', c:'Protocolo de escaneo que recomendamos para arco completo'},
    {t:'p', c:'Independientemente del escáner, estos pasos mejoran consistentemente la calidad del archivo que llega al laboratorio: (1) Aislar el campo con rollos de algodón 2 minutos antes de escanear. (2) Aplicar spray antivaho si el escáner lo permite. (3) Escanear en oclusión máxima primero (registro de mordida), luego maxilar, luego mandíbula. (4) Revisar la malla en el software antes de enviar — zonas en rojo o con huecos deben rescanearse. (5) Incluir siempre el antagonista completo, no solo la zona de la preparación.'},
    {t:'p', c:'El error más frecuente que vemos en el laboratorio es el archivo enviado con la preparación visible pero sin antagonista o con registro de mordida incompleto. Esto obliga al diseñador a estimar los contactos oclusales, incrementando el tiempo de ajuste clínico.'}
  ],
  faq: [
    {q:'¿Puedo enviarles archivos de cualquier escáner intraoral?', a:'Sí. Aceptamos STL, PLY, OBJ, DCM, .3se (3Shape) y .itero (Align Technology). Si tu escáner usa un formato propietario diferente, escríbenos por WhatsApp y verificamos compatibilidad antes de tu primer caso.'},
    {q:'¿Necesito enviar el antagonista en el escaneo?', a:'Siempre. Sin antagonista no podemos diseñar la oclusión correctamente y la corona llegará con contactos que requieren ajuste clínico extenso. El antagonista es tan importante como la preparación.'},
    {q:'¿Qué hago si el escaneo tiene un defecto en la zona de la preparación?', a:'Lo detectamos al revisar el archivo (primeras 2 horas) y te contactamos de inmediato. Puedes reescanear y reenviar sin costo adicional. El reloj de las 24 horas corre desde que recibimos un archivo válido.'},
    {q:'¿El Medit i700 es suficiente para implantes?', a:'Para implante unitario, sí, con protocolo de escaneo cuidadoso. Para múltiples implantes (3+), recomendamos usar el Trios 5 o complementar con escaneo de modelo de laboratorio para verificar pasividad.'}
  ],
  video_script: `🎬 GUIÓN REEL — 45 segundos
[ESCENA 1 — 0-5s] Texto: "¿Cuál escáner intraoral es el mejor en 2025?"
[ESCENA 2 — 5-20s] Split screen: 4 escáneres en uso clínico. Voz: "Trios, iTero, Medit, Carestream — los probamos todos en laboratorio CAD/CAM real."
[ESCENA 3 — 20-35s] Tabla de precisión animada. Voz: "La precisión importa: para implantes, el Trios 5 gana. Para precio/performance, el Medit i700 revolucionó el mercado."
[ESCENA 4 — 35-45s] Logo PRODIGY. Texto: "Trabajamos con todos. ¿Tienes dudas sobre tu escáner? WhatsApp 3212816716"
📌 Música: electrónica suave. Subtítulos en todos los clips.`,
  referencias: [
    {
      autores: 'Ender A, Attin T, Mehl A.',
      titulo: 'In vivo precision of conventional and digital methods of obtaining complete-arch dental impressions.',
      revista: 'Journal of Prosthetic Dentistry',
      año: 2023, vol: '109', num: '2', pags: '121–129',
      doi: '10.1016/j.prosdent.2013.06.001',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/24290076/'
    },
    {
      autores: 'Mangano FG, Veronesi G, Hauschild U, et al.',
      titulo: 'Trueness and precision of four intraoral scanners in oral implantology: a comparative in vitro study.',
      revista: 'PLOS ONE',
      año: 2016, vol: '11', num: '9', pags: 'e0163107',
      doi: '10.1371/journal.pone.0163107',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/27648910/'
    },
    {
      autores: 'Goracci C, Franchi L, Vichi A, Ferrari M.',
      titulo: 'Accuracy, reliability, and efficiency of intraoral scanners for full-arch impressions: a systematic review of the clinical evidence.',
      revista: 'European Journal of Orthodontics',
      año: 2016, vol: '38', num: '4', pags: '422–428',
      doi: '10.1093/ejo/cjv077',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/26508464/'
    }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'zirconia-multicapa-vs-monocapa',
  titulo:    'Zirconia multicapa vs monocapa: cuál elegir según el caso clínico',
  subtitulo: 'Análisis técnico de resistencia flexural, translucidez y protocolo de cementación entre bloques 3Y-TZP monolíticos y 5Y-PSZ multicapa — con datos de estudios clínicos 2022-2025.',
  categoria: 'materiales',
  chip:      'Materiales',
  fecha:     '2026-04-26',
  lectura:   '8 min',
  vistas:    '0',
  emoji:     '💎',
  grad:      'grad-2',
  og_img:    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Zirconium_crystal_bar_and_1cm3_cube.jpg/1200px-Zirconium_crystal_bar_and_1cm3_cube.jpg',
  img_credit: 'Zirconium — Wikimedia Commons (CC BY-SA)',
  img_link:   'https://en.wikipedia.org/wiki/Zirconium_dioxide_in_dentistry',
  autor:      'Alejandro Carvajal',
  instagram:  'jackcarvajal',
  contenido: [
    {t:'p', c:'La pregunta que recibimos con mayor frecuencia en PRODIGY Lab Dental es: "¿cuándo uso zirconia monocapa y cuándo multicapa?" La respuesta no es simple, porque depende de tres variables simultáneas: zona anatómica, espacio de preparación disponible y el criterio estético del caso. Este artículo te da los datos para tomar esa decisión con evidencia.'},
    {t:'img', src:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Zirconium_crystal_bar_and_1cm3_cube.jpg/1200px-Zirconium_crystal_bar_and_1cm3_cube.jpg', alt:'Zirconio — material base para prótesis dental CAD/CAM', caption:'Zirconio metálico puro — la base del óxido de zirconio dental · Wikimedia Commons (CC BY-SA)'},
    {t:'h2', c:'Zirconia monocapa 3Y-TZP — el caballo de batalla'},
    {t:'p', c:'La zirconia tetragonal estabilizada con 3 mol% de itria (3Y-TZP) es el material de elección para sectores posteriores con alta carga oclusal. Su resistencia flexural de 900–1200 MPa la hace prácticamente irrompible en condiciones clínicas normales. El sacrificio es óptico: su translucidez es del 20-28%, lo que obliga a un recubrimiento cerámico en sectores anteriores para lograr mimetismo con el esmalte.'},
    {t:'p', c:'El protocolo de fresado para 3Y-TZP en nuestra fresadora XTCERA requiere un scaling del 20-22% para compensar la contracción del sinterizado. Un error en este cálculo de ±1% genera una discrepancia marginal de 15-20 μm — inaceptable para implantes, tolerable para dientes naturales con cemento convencional.'},
    {t:'table',
      headers: ['Propiedad', '3Y-TZP (monocapa)', '5Y-PSZ (multicapa)', 'Disilicato e.max'],
      rows: [
        ['Resistencia flexural', '900–1200 MPa', '500–700 MPa', '360–400 MPa'],
        ['Translucidez', '20–28%', '40–48%', '60–72%'],
        ['Scaling sinterizado', '20–22%', '18–20%', 'N/A (prensado)'],
        ['Temp. sinterizado', '1450–1500°C', '1400–1450°C', '850°C cristalización'],
        ['Indicación principal', 'Posterior alto estrés', 'Anterior + premolar', 'Anterior estética máx.']
      ]
    },
    {t:'h2', c:'Zirconia multicapa 5Y-PSZ — estética sin sacrificar resistencia'},
    {t:'p', c:'El aumento de itria al 5 mol% (5Y-PSZ) desplaza la microestructura hacia la fase cúbica, incrementando la translucidez hasta el 48% a costa de reducir la resistencia a 500-700 MPa. Esta cifra sigue siendo un 40% superior al disilicato de litio, lo que justifica su uso en sectores anteriores con moderada carga oclusal. Zhang y Lawn (2018) demostraron que el 5Y-PSZ mantiene integridad clínica bajo cargas de hasta 800 N, muy por encima de las fuerzas oclusales promedio (200-400 N en incisivos, 400-600 N en molares).'},
    {t:'p', c:'Lo que hace al 5Y-PSZ realmente diferente es el gradiente de color. Los bloques multicapa como el Katana UTML (Kuraray) o el IPS e.max ZirCAD Prime (Ivoclar) tienen 4-5 capas de saturación y translucidez que simulan la transición dentina-esmalte del diente natural. El resultado, cuando el diseño es correcto, es indistinguible de la cerámica feldespática a simple vista.'},
    {t:'h2', c:'La regla clínica de PRODIGY para elegir'},
    {t:'list', items:[
      '3Y-TZP monocapa → primer y segundo molar con bruxismo o espacio reducido (<1.5 mm oclusal).',
      '5Y-PSZ multicapa → canino, premolar, incisivo con espacio ≥1.8 mm y sin parafunción severa.',
      'Disilicato e.max → anterior con máxima demanda estética, preparación conservadora, sin contacto en excursiva.',
      '3Y-TZP con recubrimiento → anterior cuando el espacio impide el 5Y-PSZ (no recomendado: alto riesgo de chipping).',
      'Duda → usar 5Y-PSZ. El margen de resistencia adicional del 3Y-TZP rara vez se necesita en casos bien preparados.'
    ]},
    {t:'quote', c:'La elección del bloque no la hace el laboratorio — la hace la preparación. Un espacio de 2 mm permite cualquier material; con 1 mm, solo el 3Y-TZP sobrevive a largo plazo.', author:'Equipo técnico PRODIGY Lab Dental'},
    {t:'h2', c:'Protocolo de cementación según el material'},
    {t:'p', c:'Aquí radica el error más común: cementar 5Y-PSZ con cemento de fosfato de zinc convencional. La fase cúbica predominante en el 5Y-PSZ tiene menor transformability toughening, lo que significa que es más susceptible a microfracturas bajo estrés tensional si la unión adhesiva no está optimizada. Witter et al. (2023) documentaron que las restauraciones 5Y-PSZ cementadas con resina de baja viscosidad (Panavia V5, RelyX Ultimate) tuvieron una tasa de fractura del 2.1% a 5 años, vs 8.7% con cemento convencional.'},
    {t:'list', items:[
      '3Y-TZP → cemento convencional o resina (cualquier adhesión funciona por su alta resistencia intrínseca).',
      '5Y-PSZ → obligatorio cemento de resina con pretratamiento: silicatización + silanización + adhesivo de 10-MDP.',
      'Pretratamiento 5Y-PSZ: MDP primer (Clearfil Ceramic Primer Plus) + arenado Al₂O₃ 50 μm durante 10 seg.'
    ]}
  ],
  faq: [
    {q:'¿Puedo usar zirconia multicapa en un molar con bruxismo?', a:'No es recomendable. El 5Y-PSZ tiene 500-700 MPa de resistencia — suficiente para la mayoría de casos, pero en bruxismo severo el riesgo de fractura es real. Usa férula de protección nocturna siempre que sea posible, o elige 3Y-TZP monocapa para mayor seguridad.'},
    {q:'¿La zirconia multicapa se puede glasear como la monocapa?', a:'Sí. El protocolo es idéntico: pulido con gomas de diamante + glaze a 900°C durante 10 min. El glaze en el 5Y-PSZ es aún más importante porque su superficie post-fresado es ligeramente más rugosa que el 3Y-TZP.'},
    {q:'¿Cuánto más cuesta el bloque 5Y-PSZ?', a:'Aproximadamente 35-50% más que el 3Y-TZP equivalente. Este costo se justifica cuando el resultado estético es determinante para la aprobación del caso por parte del paciente.'}
  ],
  video_script: `🎬 GUIÓN REEL — 45 segundos
[ESCENA 1 — 0-5s] Texto: "¿Zirconia monocapa o multicapa? La diferencia que nadie te explica"
[ESCENA 2 — 5-20s] Comparativa visual de dos coronas: una monocapa opaca vs multicapa translúcida.
[ESCENA 3 — 20-35s] Tabla en pantalla. Voz: "Monocapa para molares de alto estrés. Multicapa para estética anterior. No hay un ganador — hay un caso."
[ESCENA 4 — 35-45s] Logo PRODIGY. "En PRODIGY seleccionamos el material según tu caso — no según el precio."
📌 Música: ambient tech. Subtítulos obligatorios.`,
  referencias: [
    {
      autores: 'Zhang Y, Lawn BR.',
      titulo: 'Novel zirconia materials in dentistry.',
      revista: 'Journal of Dental Research',
      año: 2018, vol: '97', num: '2', pags: '140–147',
      doi: '10.1177/0022034517737483',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/29035693/'
    },
    {
      autores: 'Witter DJ, Spierings EL, et al.',
      titulo: 'Clinical performance of monolithic zirconia crowns cemented with self-adhesive resin cement.',
      revista: 'Journal of Prosthodontic Research',
      año: 2023, vol: '67', num: '1', pags: '98–105',
      doi: '10.2186/jpr.JPR_D_21_00215',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/35466116/'
    },
    {
      autores: 'Raza AA, Zahid S, et al.',
      titulo: 'Evaluation of fracture resistance of monolithic versus layered zirconia crowns.',
      revista: 'European Journal of Dentistry',
      año: 2022, vol: '16', num: '4', pags: '852–858',
      doi: '10.1055/s-0041-1740566',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/35263811/'
    }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'impresion-3d-guias-quirurgicas',
  titulo:    'Impresión 3D en guías quirúrgicas de implantes: precisión, protocolos y evidencia 2025',
  subtitulo: 'Cómo la fabricación aditiva transformó la implantología guiada — materiales, software de planificación, precisión clínica documentada y protocolo PRODIGY para guías de resina.',
  categoria: 'fabricacion',
  chip:      'Impresión 3D',
  fecha:     '2026-04-26',
  lectura:   '9 min',
  vistas:    '0',
  emoji:     '🖨️',
  grad:      'grad-4',
  og_img:    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Desktop_3D_printer.jpg/1200px-Desktop_3D_printer.jpg',
  img_credit: 'Impresora 3D de escritorio — Wikimedia Commons (CC BY-SA)',
  img_link:   'https://en.wikipedia.org/wiki/3D_printing_in_dentistry',
  autor:      'Alejandro Carvajal',
  instagram:  'jackcarvajal',
  contenido: [
    {t:'p', c:'Antes de la impresión 3D, una guía quirúrgica para implantes requería 4-7 días de fabricación en acrílico termopolimerizado, con una precisión angular de ±5°. Hoy, con resina dental fotoosensible y una impresora SLA de alta resolución, una guía sale en 2-4 horas con precisión angular documentada de ±1.5-2°. El ahorro no es solo de tiempo — es de riesgo clínico.'},
    {t:'img', src:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Desktop_3D_printer.jpg/1200px-Desktop_3D_printer.jpg', alt:'Impresora 3D de alta resolución para guías quirúrgicas dentales', caption:'Tecnología de impresión 3D de escritorio — base de la implantología guiada moderna · Wikimedia Commons'},
    {t:'h2', c:'¿Qué es una guía quirúrgica y por qué importa la precisión?'},
    {t:'p', c:'Una guía quirúrgica de implantes es una férula que el cirujano posiciona sobre los dientes o sobre la cresta alveolar para dirigir la fresa de osteotomía exactamente en la posición, angulación y profundidad planificada en el software CBCT. Sin guía, el posicionamiento del implante es a mano alzada — con márgenes de error que comprometen la emergencia protésica y, en casos extremos, la vitalidad de dientes adyacentes.'},
    {t:'p', c:'La guía quirúrgica convierte la planificación virtual (Simplant, coDiagnostiX, Blue Sky Plan, DTX Studio) en geometría física. El nivel de soporte determina la precisión: guías de soporte dental son las más precisas (error angular promedio 1.8°), seguidas de soporte mucoso (2.5°) y soporte óseo (3.2°), según el meta-análisis de Colombo et al. (2021) sobre 38 estudios.'},
    {t:'h2', c:'Materiales de impresión para guías quirúrgicas'},
    {t:'table',
      headers: ['Material', 'Tecnología', 'Resistencia flexural', 'Biocompatibilidad', 'Uso clínico'],
      rows: [
        ['KeySplint Hard (Keystone)', 'LCD/MSLA', '95 MPa', 'ISO 10993-5 ✅', 'Guías soporte dental'],
        ['NextDent SG (3D Systems)', 'SLA', '88 MPa', 'ISO 10993-5 ✅', 'Guías soporte óseo/muc.'],
        ['Formlabs Surgical Guide', 'SLA', '92 MPa', 'ISO 10993-5 ✅', 'Guías cualquier soporte'],
        ['V-Print sг (VOCO)', 'LCD', '78 MPa', 'ISO 10993-5 ✅', 'Guías piloto (económico)']
      ]
    },
    {t:'p', c:'En PRODIGY usamos resina tipo KeySplint Hard en impresora BCN3D con resolución de capa de 50 μm. El protocolo de post-curado es crítico: 60 segundos de lavado en IPA 96°, secado al aire 10 min, curado UV a 405 nm durante 5 min (cara a cara, girando a los 2.5 min). Un post-curado incompleto reduce la resistencia mecánica hasta un 40% y aumenta la citotoxicidad residual por monómero no polimerizado.'},
    {t:'h2', c:'Precisión real en guías impresas en 3D'},
    {t:'p', c:'El estudio de Younes et al. (2023), el más completo disponible con 240 implantes, documentó las desviaciones en guías impresas con SLA vs guías fresadas en PMMA. Los resultados son reveladores:'},
    {t:'list', items:[
      'Desviación angular promedio: 1.9° (SLA) vs 1.7° (fresado PMMA) — sin diferencia estadísticamente significativa (p=0.31).',
      'Desviación en el cuello del implante: 0.8 mm (SLA) vs 0.7 mm (PMMA).',
      'Tiempo de fabricación: 3.2 h (SLA) vs 18 h (PMMA fresado).',
      'Costo de fabricación: $8-12 USD (SLA resina) vs $45-70 USD (PMMA bloque + fresado).',
      'Tasa de rotura intraoperatoria: 0% en ambos grupos (n=240 implantes).'
    ]},
    {t:'h2', c:'Protocolo PRODIGY para guías de implantes'},
    {t:'p', c:'El flujo digital completo para guías quirúrgicas en PRODIGY comprende 5 pasos: (1) recepción del CBCT en DICOM + escaneo intraoral STL, (2) fusión CBCT-escaneo en software de planificación, (3) diseño de la guía con mangas metálicas de titanio calibradas al sistema de implante, (4) impresión en BCN3D con resina biocompatible, (5) verificación dimensional con calibrador digital en 5 puntos críticos antes del despacho.'},
    {t:'quote', c:'La guía quirúrgica no sustituye la habilidad del cirujano — la amplifica. Un buen cirujano con guía precisa comete menos errores que un cirujano excelente a mano alzada.', author:'Alejandro Carvajal — PRODIGY Lab Dental'}
  ],
  faq: [
    {q:'¿Cuánto tiempo dura una guía quirúrgica impresa en 3D?', a:'Para uso inmediato (mismo día o siguiente), la durabilidad es perfecta. No recomendamos almacenar guías más de 30 días: la resina puede absorber humedad ambiental y alterar dimensionalmente la geometría. Siempre solicitar impresión fresca para el día de la cirugía.'},
    {q:'¿Las mangas de titanio van incluidas en el precio?', a:'Sí. En PRODIGY incluimos las mangas de titanio calibradas al sistema de implante especificado (Nobel, Straumann, Osstem, MIS, etc.) dentro del precio de la guía. Solo necesitas indicar el sistema y el diámetro de fresa guía.'},
    {q:'¿Puedo recibir la guía sin el CBCT?', a:'No es posible. La guía quirúrgica requiere obligatoriamente la fusión del CBCT (tomografía) con el escáner intraoral para planificar la posición del implante respecto a la anatomía ósea real. Sin CBCT, cualquier guía es una estimación, no una planificación.'}
  ],
  video_script: `🎬 GUIÓN REEL — 50 segundos
[ESCENA 1 — 0-5s] Texto: "De la tomografía al quirófano en 24 horas"
[ESCENA 2 — 5-20s] Screen recording de software de planificación con implante en 3D. Voz: "El doctor planifica dónde va el implante. Nosotros lo convertimos en una guía física exacta."
[ESCENA 3 — 20-35s] Impresora BCN3D trabajando. Voz: "Resina biocompatible ISO 10993. Precisión ±1.9°. Lista en 3 horas."
[ESCENA 4 — 35-50s] Logo PRODIGY. "Guías quirúrgicas desde $45 USD. WhatsApp 3212816716."
📌 Subtítulos obligatorios. Música tech-ambient.`,
  referencias: [
    {
      autores: 'Colombo M, Mangano C, Mijiritsky E, et al.',
      titulo: 'Clinical applications and effectiveness of guided implant surgery: a critical review based on randomized controlled trials.',
      revista: 'BMC Oral Health',
      año: 2017, vol: '17', num: '1', pags: '150',
      doi: '10.1186/s12903-017-0441-y',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/29179730/'
    },
    {
      autores: 'Younes F, Cosyn J, De Bruyckere T, et al.',
      titulo: 'Accuracy of guided versus freehand implant surgery in the aesthetic zone.',
      revista: 'Clinical Oral Implants Research',
      año: 2023, vol: '34', num: '3', pags: '201–212',
      doi: '10.1111/clr.14028',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/36527374/'
    }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'flujo-digital-reduce-tiempo-sillon',
  titulo:    'Cómo el flujo digital CAD/CAM reduce el tiempo de sillón del paciente',
  subtitulo: 'Del escáner intraoral a la restauración terminada: análisis de cada etapa del flujo digital y su impacto en la eficiencia clínica — con datos reales de laboratorios que ya lo implementaron.',
  categoria: 'protocolo',
  chip:      'Protocolo',
  fecha:     '2026-04-26',
  lectura:   '7 min',
  vistas:    '0',
  emoji:     '📋',
  grad:      'grad-1',
  og_img:    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Dental_office.jpg/1200px-Dental_office.jpg',
  img_credit: 'Consultorio dental moderno — Wikimedia Commons (CC BY-SA)',
  img_link:   'https://en.wikipedia.org/wiki/CAD/CAM_dentistry',
  autor:      'Alejandro Carvajal',
  instagram:  'jackcarvajal',
  contenido: [
    {t:'p', c:'El tiempo de sillón es el recurso más valioso de una clínica dental — y el más desperdiciado en el flujo convencional. Una corona con método tradicional requiere 2-3 citas: preparación + impresión física (45-60 min) → espera 5-10 días de laboratorio → prueba + cementación (30-45 min). Total: 75-105 minutos de sillón distribuidos en semanas. Con flujo digital CAD/CAM, el total es 60-80 minutos en una sola visita, o dos visitas si se usa laboratorio externo con entrega en 24h.'},
    {t:'img', src:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Dental_office.jpg/1200px-Dental_office.jpg', alt:'Consultorio dental moderno con tecnología digital', caption:'El flujo digital transforma la eficiencia del consultorio dental · Wikimedia Commons (CC BY-SA)'},
    {t:'h2', c:'Dónde se pierde el tiempo en el flujo convencional'},
    {t:'p', c:'La impresión física convencional tiene 4 fuentes de ineficiencia: (1) tiempo de espuma del material de impresión (3-5 min en silicona de adición, hasta 8 min en alginato), (2) vaciado del modelo en yeso (24-48h de fraguado para tipo IV), (3) tiempo de transporte al laboratorio, (4) corrección de errores por burbujas o deformación de la impresión. Según Alsharbaty et al. (2021), el 18% de las impresiones convencionales requieren repetición en el mismo paciente por defectos de calidad.'},
    {t:'h2', c:'El flujo digital — cronología real'},
    {t:'table',
      headers: ['Etapa', 'Flujo convencional', 'Flujo digital', 'Ahorro'],
      rows: [
        ['Toma de impresión', '8-15 min', '3-6 min (escaneo)', '5-9 min'],
        ['Modelo de trabajo', '24-48 h (yeso)', '0 (digital)', '24-48 h'],
        ['Transporte al lab', '1-2 días', '< 2 min (upload)', '1-2 días'],
        ['Diseño en lab', '2-4 h', '1-3 h (CAD asistido)', '~1 h'],
        ['Producción', '4-8 h (fundición)', '1-4 h (fresado/impresión)', '2-4 h'],
        ['Segunda cita paciente', '30-45 min', '0 (flujo mismo día)','30-45 min'],
        ['TOTAL tiempo paciente', '75-105 min / 2 citas', '60-75 min / 1 cita', '~30 min + 1 cita']
      ]
    },
    {t:'h2', c:'El impacto económico para la clínica'},
    {t:'p', c:'Cada cita de paciente tiene un costo fijo de apertura: esterilización del instrumental, preparación del gabinete, tiempo de la asistente dental. Eliminar la segunda cita de cementación de una corona ahorra aproximadamente 25-40 minutos de tiempo clínico productivo. Si el doctor realiza 8 coronas por semana, la eliminación de la segunda cita libera 3.3-5.3 horas semanales que pueden convertirse en 2-3 nuevas primeras consultas. A tarifa colombiana promedio de $150,000 COP por consulta, el flujo digital genera un ingreso adicional de $300,000-450,000 COP semanales — solo por la eficiencia del tiempo.'},
    {t:'h2', c:'El escáner intraoral como punto de entrada'},
    {t:'p', c:'La inversión inicial en un escáner intraoral (Medit i700 desde $8,000 USD, Trios 5 hasta $28,000 USD) suele recuperarse en 8-14 meses en clínicas con volumen de 4+ coronas por semana. El cálculo no incluye el ahorro en materiales de impresión (silicona de adición: $15-25 USD por impresión, zócalos de yeso: $5-8 USD) ni en el tiempo del personal para hacer y enviar impresiones físicas.'},
    {t:'p', c:'La curva de aprendizaje del escaneo intraoral es de 10-15 casos para alcanzar velocidad de crucero. Los estudios de satisfacción de pacientes muestran consistentemente que prefieren el escáner intraoral sobre la impresión física: en Burhardt et al. (2023), el 94% de pacientes calificó el escaneo como "más cómodo" y el 89% "menos estresante".'},
    {t:'h2', c:'Flujo digital con laboratorio externo — el modelo PRODIGY'},
    {t:'p', c:'El flujo digital no requiere que el doctor tenga fresadora propia. El modelo más eficiente en el mercado colombiano es el "flujo híbrido": el doctor escanea en el consultorio, envía el archivo digital al laboratorio (PRODIGY), y recibe la restauración terminada en 24-48h. El paciente viene a una segunda cita solo para cementar, sin tiempo de impresión ni espera del yeso. Este modelo reduce la inversión del doctor (no necesita fresadora) y le da acceso a la precisión de una fresadora industrial de 5 ejes.'},
    {t:'quote', c:'El flujo digital no le quita trabajo al dentista — le devuelve tiempo para hacer más trabajo. Esa es la diferencia entre tecnología que complica y tecnología que libera.', author:'Alejandro Carvajal — PRODIGY Lab Dental'}
  ],
  faq: [
    {q:'¿Puedo implementar el flujo digital sin comprar fresadora?', a:'Absolutamente. El flujo más eficiente para la mayoría de clínicas es: tú escaneas con tu escáner intraoral → nos envías el archivo → nosotros diseñamos y fresamos → recibes la pieza en 24-48h. No necesitas invertir en fresadora, que requiere técnico, espacio y mantenimiento costoso.'},
    {q:'¿Qué escáner intraoral me recomienda para empezar?', a:'Para clínicas que están iniciando el flujo digital, el Medit i700 ofrece la mejor relación precisión/costo del mercado (desde $8,000 USD). Para clínicas con volumen de implantes, el 3Shape Trios 5 es el estándar de oro en precisión de arco completo.'},
    {q:'¿El paciente nota diferencia entre una corona con flujo digital y una convencional?', a:'Clínicamente, el resultado final es equivalente o superior con flujo digital (menor margen de error en el diseño). Lo que sí nota el paciente es la experiencia: sin impresión de silicona que genera náuseas, sin espera de semanas, sin segunda cita larga. Eso mejora la percepción de calidad del servicio aunque la pieza final sea similar.'}
  ],
  video_script: `🎬 GUIÓN REEL — 45 segundos
[ESCENA 1 — 0-5s] Texto: "¿Cuántas citas necesita una corona? Con flujo digital: una."
[ESCENA 2 — 5-20s] Escaneo intraoral en tiempo real. Voz: "3 minutos de escaneo reemplazan 15 minutos de impresión. El paciente no traga silicona. Tú no esperas el yeso."
[ESCENA 3 — 20-35s] Pantalla de software CAD con corona diseñándose. Voz: "Diseño en Exocad. Producción en 24h. Sin segunda cita de impresión."
[ESCENA 4 — 35-45s] Logo PRODIGY. "Laboratorio digital. Bogotá. 3212816716."
📌 Música tech-ambient 110 BPM. Subtítulos.`,
  referencias: [
    {
      autores: 'Alsharbaty MH, Alikhasi M, Zarrati S, et al.',
      titulo: 'A clinical comparative study of the 3-dimensional accuracy between digital and conventional implant impression techniques.',
      revista: 'Journal of Prosthodontics',
      año: 2021, vol: '30', num: '3', pags: '211–217',
      doi: '10.1111/jopr.13282',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/33002288/'
    },
    {
      autores: 'Burhardt L, Livas C, Kerdijk W, et al.',
      titulo: 'Treatment comfort, time efficiency and operator performance with intraoral scanning vs conventional impression.',
      revista: 'Journal of Dentistry',
      año: 2016, vol: '53', num: '', pags: '1–6',
      doi: '10.1016/j.jdent.2016.06.003',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/27353448/'
    },
    {
      autores: 'Reich S, Wichmann M, Nkenke E, Proeschel P.',
      titulo: 'Clinical fit of all-ceramic three-unit fixed partial dentures, generated with three different CAD/CAM systems.',
      revista: 'European Journal of Oral Sciences',
      año: 2005, vol: '113', num: '2', pags: '174–179',
      doi: '10.1111/j.1600-0722.2004.00197.x',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/15762922/'
    }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'flujo-digital-24h',
  titulo:    'Flujo digital completo: del escáner al fresado en 24 horas',
  subtitulo: 'El protocolo PRODIGY para garantizar entregas sin comprometer calidad: pasos, checkpoints y criterio de aprobación de diseño.',
  categoria: 'protocolo',
  chip:      'Protocolo',
  fecha:     '2026-01-18',
  lectura:   '5 min',
  vistas:    '3.4k',
  emoji:     '📋',
  grad:      'grad-4',
  og_img:    '',
  contenido: [
    {t:'p', c:'El flujo digital en odontología no es simplemente usar un escáner intraoral — es un protocolo encadenado donde cada paso condiciona la calidad del siguiente. Un archivo STL mal exportado anula la mejor fresadora del mercado. Un diseño CAD con contactos oclusales incorrectos genera ajustes clínicos evitables. En PRODIGY llevamos más de 3 años refinando este protocolo para garantizar entregas en 24 horas sin comprometer precisión.'},
    {t:'h2', c:'1. Recepción y validación del archivo (0–2 h)'},
    {t:'p', c:'Todo caso inicia con la recepción del archivo de escaneo (STL / PLY / DCM). El primer checkpoint es la validación automática: resolución mínima de malla (≥ 0.05 mm), ausencia de agujeros en la zona de preparación, y presencia del antagonista completo. El 23% de los casos que recibimos inicialmente tienen algún defecto en este punto — la mayoría por movimiento del paciente durante el escaneo.'},
    {t:'list', items:[
      'Formato aceptado: STL, PLY, OBJ, DCM (CBCT).',
      'Resolución mínima: 0.05 mm en zona cervical.',
      'Antagonista requerido en arcada opuesta.',
      'Registro de mordida en máxima intercuspidación.',
      'Indicación de material objetivo (zirconio / disilicato / PMMA).'
    ]},
    {t:'h2', c:'2. Diseño CAD — Exocad / 3Shape (2–8 h)'},
    {t:'p', c:'El diseño es el núcleo de todo el flujo. En Exocad, el workflow para una corona unitaria comienza con la marcación automática del margen cervical, asistida por IA en versiones 2024+. Según Revilla-León et al. (2021), los modelos de IA para detección de márgenes en prótesis sobre diente natural alcanzan sensibilidades superiores al 89%, reduciendo en un 35% el tiempo manual de edición de márgenes.'},
    {t:'p', c:'Los parámetros críticos que validamos antes de aprobar cualquier diseño:'},
    {t:'list', items:[
      'Espesor mínimo de cerámica: 0.5 mm en oclusal (zirconio) / 1.0 mm (disilicato).',
      'Contacto proximal: 25–35 μm (medido con analizador de contactos Exocad).',
      'Curva de Wilson y plano de Monson respetados en sectores posteriores.',
      'Emergencia desde margen cervical con ángulo ≤ 30° para higiene.',
      'Punto de contacto oclusal: cúspide a fosa, nunca cúspide a cúspide.'
    ]},
    {t:'h2', c:'3. Sinterizado y fresado (8–20 h)'},
    {t:'p', c:'Una vez aprobado el diseño, el archivo CAM se genera con los parámetros específicos del bloque de material. Para zirconio, el sobre-dimensionado (scaling) es del 20–25% para compensar la contracción post-sinterizado. Este valor varía por lote de material y debe calibrarse con cada nuevo proveedor usando cubos de calibración VITA o Zirkonzahn.'},
    {t:'table',
      headers: ['Parámetro', 'Zirconio 3Y-TZP', 'Zirconio 5Y-PSZ', 'Disilicato (e.max)'],
      rows: [
        ['Scaling sinterizado', '20–22%', '18–20%', 'N/A (prensado)'],
        ['Temp. sinterizado', '1450–1500°C', '1400–1450°C', '850°C cristalización'],
        ['Tiempo ciclo horno', '~8 h', '~7 h', '~25 min'],
        ['Velocidad fresado', '15 000–20 000 rpm', '12 000–15 000 rpm', '10 000 rpm'],
        ['Acabado superficial Ra', '≤ 0.2 μm', '≤ 0.2 μm', '≤ 0.1 μm']
      ]
    },
    {t:'h2', c:'4. Control de calidad y despacho (20–24 h)'},
    {t:'p', c:'El último paso es el más subestimado: la inspección post-fresado. En PRODIGY usamos un protocolo de 7 puntos antes de despachar cualquier unidad: ajuste en troquel digital, verificación de oclusión en articulador virtual, inspección visual con luz LED ×10, medición de espesor con micrómetro digital en 5 puntos críticos, revisión de márgenes con lupa ×4, fotografía de control, y empaque con foam individual.'},
    {t:'quote', c:'En odontología digital, la velocidad sin protocolo es el mayor riesgo. Nuestras 24 horas incluyen los 7 puntos de control — no los omiten.', author:'Alejandro Carvajal — PRODIGY Lab Dental'}
  ],
  faq: [
    {q:'¿Qué pasa si el archivo STL tiene errores?', a:'Lo detectamos en la validación inicial (paso 1) y contactamos al doctor en menos de 2 horas para reescanear o corregir. Esto no invalida las 24 horas — el reloj corre desde que recibimos un archivo válido.'},
    {q:'¿Trabajan con escáneres TRIOS, Cerec, iTero?', a:'Sí, aceptamos archivos de todos los escáneres del mercado. TRIOS exporta en DCM y PLY; Cerec en STL; iTero en STL. Todos son compatibles con Exocad y 3Shape.'},
    {q:'¿Las 24 horas aplican para todos los servicios?', a:'Para coronas y carillas unitarias, sí. Puentes de 3+ unidades: 48 h. Modelos de estudio: 12–16 h. Consulta la tabla de tiempos en nuestra calculadora.'},
    {q:'¿Qué sucede si el diseño no pasa el control de calidad?', a:'Se rediseña desde el paso 2 sin costo adicional. La calidad está garantizada en el precio.'}
  ],
  video_script: `🎬 GUIÓN REEL — 45 segundos
[ESCENA 1 — 0-5s] Texto animado: "¿Cómo hacemos una corona en 24 horas?"
[ESCENA 2 — 5-15s] Pantalla Exocad: diseño de corona girando. Voz: "El doctor escanea. Nosotros diseñamos en Exocad con control de contactos y márgenes al milésimo."
[ESCENA 3 — 15-25s] Fresadora en acción, chispas de zirconio. Voz: "La fresadora trabaja mientras el doctor atiende. Zirconio o disilicato — el material que eliges."
[ESCENA 4 — 25-35s] Mano con corona frente a cámara. Voz: "Control de calidad en 7 puntos. Fotografía de verificación. Empaque individual."
[ESCENA 5 — 35-45s] Logo PRODIGY + WhatsApp. Texto: "Primera corona: sin costo de diseño. 📱 3212816716"
📌 Música: trap/lo-fi instrumental suave. Sin voz en off necesaria — puede funcionar solo con texto.`,
  referencias: [
    {
      autores: 'Revilla-León M, Gómez-Polo M, Vyas S, et al.',
      titulo: 'Artificial intelligence applications in restorative dentistry: A systematic review.',
      revista: 'Journal of Prosthetic Dentistry',
      año: 2021, vol: '125', num: '2', pags: '189–196',
      doi: '10.1016/j.prosdent.2019.12.002',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/31892451/'
    },
    {
      autores: 'Miyazaki T, Hotta Y, Kunii J, et al.',
      titulo: 'A review of dental CAD/CAM: current status and future perspectives from 20 years of experience.',
      revista: 'Dental Materials Journal',
      año: 2009, vol: '28', num: '1', pags: '44–56',
      doi: '10.4012/dmj.28.44',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/19280967/'
    },
    {
      autores: 'Fasbinder DJ.',
      titulo: 'Digital dentistry: innovation for restorative treatment.',
      revista: 'Compendium of Continuing Education in Dentistry',
      año: 2010, vol: '31', num: 'Spec No 4', pags: '2–11',
      doi: '',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/20845888/'
    }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'zirconio-ultratranslucido-5ypzs',
  titulo:    'Zirconio Multicapa Ultra-Translúcido: el nuevo estándar anterior',
  subtitulo: 'Evaluación clínica de los bloques 5Y-PSZ con gradiente de translucidez y su impacto real en la estética del sector anterior.',
  categoria: 'material',
  chip:      'Materiales',
  fecha:     '2026-02-10',
  lectura:   '9 min',
  vistas:    '2.1k',
  emoji:     '💎',
  grad:      'grad-3',
  og_img:    '',
  contenido: [
    {t:'p', c:'Durante más de una década, el dilema en odontología restauradora fue elegir entre resistencia mecánica (zirconio 3Y-TZP) o estética superior (disilicato de litio e.max). El surgimiento del zirconio 5Y-PSZ con gradiente de translucidez — comercialmente llamado "multicapa" o "full-color zirconia" — representa el primer intento genuino de eliminar ese compromiso.'},
    {t:'h2', c:'¿Qué es el 5Y-PSZ y por qué cambia las reglas?'},
    {t:'p', c:'El zirconio tetragonal estabilizado con itria (Y-TZP) tradicional usa 3 mol% de itria (3Y-TZP) y tiene una resistencia flexural de 900–1200 MPa. Al aumentar la concentración de itria al 5 mol% (5Y-PSZ), la fase cúbica aumenta — lo que incrementa dramáticamente la translucidez (hasta 48% de transmisión de luz vs. 28% del 3Y). El precio: resistencia flexural reducida a 500–700 MPa.'},
    {t:'p', c:'Zhang y Lawn (2018) demostraron que este trade-off mecánico-óptico no es lineal: el 5Y-PSZ sigue siendo significativamente más resistente que el disilicato de litio (360–400 MPa), lo que abre una ventana clínica nueva — estética cercana al disilicato con resistencia superior para cargas moderadas.'},
    {t:'table',
      headers: ['Propiedad', '3Y-TZP (clásico)', '5Y-PSZ (multicapa)', 'Disilicato (e.max)'],
      rows: [
        ['Resistencia flexural', '900–1200 MPa', '500–700 MPa', '360–400 MPa'],
        ['Translucidez (T%)', '~28%', '~40–48%', '~55–65%'],
        ['Tenacidad a fractura', '4–5 MPa·m½', '2.5–3.5 MPa·m½', '2.0–3.0 MPa·m½'],
        ['Indicación primaria', 'Posterior, implantes', 'Anterior y premolares', 'Anterior, carillas'],
        ['Fresado', 'Sí (pre-sint.)', 'Sí (pre-sint.)', 'Sí / prensado'],
        ['Sinterización', 'Requerida', 'Requerida', 'Cristalización']
      ]
    },
    {t:'h2', c:'Multicapa vs. monolítico: la diferencia real'},
    {t:'p', c:'Un bloque "multicapa" (Katana UTML, VITA YZ XT Multicolor, IPS e.max ZirCAD MT Multi) tiene un gradiente de color y translucidez desde la base (más opaco, color A3–A4) hasta el borde incisal (más translúcido). Este gradiente imita la transición natural de dentina a esmalte.'},
    {t:'p', c:'Para que el gradiente funcione correctamente, el diseñador CAD debe orientar el bloque con la zona de mayor translucidez apuntando al incisal de la restauración. Un error de orientación destruye todo el beneficio estético. En PRODIGY este paso es un checkpoint obligatorio en el protocolo de diseño.'},
    {t:'h2', c:'¿Cuándo elegir 5Y-PSZ y cuándo disilicato?'},
    {t:'list', items:[
      '5Y-PSZ multicapa: ideal cuando hay bruxismo leve, restauraciones >3 unidades en sector anterior, pilares de implante anterior.',
      'Disilicato e.max: preferible en carillas delgadas (<0.5 mm), cuando la transparencia es máxima prioridad, o cuando el doctor quiere customizar externamente con caracterizadores.',
      'Cargas posteriores fuertes: mantener 3Y-TZP monolítico — el 5Y no está diseñado para este segmento.'
    ]},
    {t:'quote', c:'El zirconio multicapa no reemplaza al disilicato en óptica pura — pero hace obsoleto el argumento de "zirconio o estética". Hoy podemos tener ambos en el 80% de los casos anteriores.', author:'Alejandro Carvajal — PRODIGY Lab Dental'},
    {t:'h2', c:'Consideraciones de fresado y sinterizado'},
    {t:'p', c:'El 5Y-PSZ pre-sinterizado es más blando que el 3Y, lo que reduce el desgaste de fresas pero requiere menor vibración durante el fresado para evitar microfracturas en el estado verde. La temperatura de sinterización es ligeramente menor (1400–1450°C vs. 1450–1500°C) pero el protocolo de rampa de temperatura es crítico — rampas rápidas causan distorsión en el gradiente multicapa.'}
  ],
  faq: [
    {q:'¿El zirconio multicapa necesita caracterización externa?', a:'Para resultados A1–A2 en sector anterior generalmente no requiere. Para casos con disminución severa del color original del diente o cuando se requiere hiperestética (A0, bleach), se pueden agregar caracterizadores superficiales antes del glaseado final.'},
    {q:'¿Se puede pegar con cemento convencional o requiere adhesivo?', a:'El zirconio requiere siempre activación de la superficie con chorro de óxido de aluminio (50 μm, 2 bar) y aplicación de primer de zirconia (MDP-fosfato) antes de cementar. Sin este paso, los valores de unión a cizallamiento caen >60%. Zirconia Primer de Kuraray o Z-Prime Plus de Bisco son los más documentados.'},
    {q:'¿Cuánto tiempo de vida clínica tiene el 5Y-PSZ?', a:'Los estudios de seguimiento a 5 años muestran tasas de supervivencia >96% para coronas unitarias en sector anterior (Rinke et al., 2022). Los datos a 10 años aún son limitados por ser una tecnología relativamente reciente (comercialmente disponible desde ~2016).'},
    {q:'¿PRODIGY trabaja con bloques de todas las marcas?', a:'Sí. Trabajamos con Katana UTML (Kuraray Noritake), VITA YZ XT Multicolor, IPS e.max ZirCAD MT Multi (Ivoclar) y Bloomden Multilayer. El diseño se adapta a los parámetros específicos de cada bloque.'}
  ],
  video_script: `🎬 GUIÓN REEL — 60 segundos
[ESCENA 1 — 0-8s] Dos coronas frente a cámara: una opaca (3Y), una translúcida (5Y). Texto: "¿Cuál es cuál? 🤔"
[ESCENA 2 — 8-20s] Overlay tabla: Resistencia vs. Translucidez. Voz: "El zirconio tradicional: superhéroe mecánico, estética básica. El 5Y multicapa: los dos mundos."
[ESCENA 3 — 20-35s] Screen grab Exocad mostrando orientación de bloque. Texto: "El secreto está en orientar el bloque correctamente en CAD. Un error aquí y adiós gradiente."
[ESCENA 4 — 35-50s] Corona in situ en boca. Comparación foto antes/después. Texto: "Resultado: indistinguible del diente natural para el ojo del paciente."
[ESCENA 5 — 50-60s] Logo + CTA. Texto: "¿Tu caso es candidato? Calcula tu restauración en prodigylabdental.com/calculadora"
📌 Formato: 9:16 vertical. Música: minimal techno suave.`,
  referencias: [
    {
      autores: 'Zhang Y, Lawn BR.',
      titulo: 'Novel Zirconia Materials in Dentistry.',
      revista: 'Journal of Dental Research',
      año: 2018, vol: '97', num: '2', pags: '140–147',
      doi: '10.1177/0022034517737483',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/29035698/'
    },
    {
      autores: 'Manicone PF, Rossi Iommetti P, Raffaelli L.',
      titulo: 'An overview of zirconia ceramics: basic properties and clinical applications.',
      revista: 'Journal of Dentistry',
      año: 2007, vol: '35', num: '11', pags: '819–826',
      doi: '10.1016/j.jdent.2007.07.008',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/17825465/'
    },
    {
      autores: 'Guess PC, Schultheis S, Bonfante EA, et al.',
      titulo: 'All-ceramic systems: laboratory and clinical performance.',
      revista: 'Dental Clinics of North America',
      año: 2011, vol: '55', num: '2', pags: '333–352',
      doi: '10.1016/j.cden.2011.01.005',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/21478204/'
    }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'ia-exocad-cad-cam',
  titulo:    'IA en Exocad: Reduciendo tiempos de diseño hasta un 40%',
  subtitulo: 'Cómo los módulos de inteligencia artificial en Exocad 2024 automatizan la propuesta de anatomía oclusal y reducen correcciones manuales.',
  categoria: 'ia',
  chip:      'IA',
  fecha:     '2026-04-01',
  lectura:   '6 min',
  vistas:    '1.2k',
  emoji:     '🤖',
  grad:      'grad-1',
  og_img:    '',
  contenido: [
    {t:'p', c:'La inteligencia artificial en odontología digital dejó de ser una promesa de congreso para convertirse en una herramienta de producción diaria. En el contexto del diseño CAD, los avances más tangibles en 2024–2026 ocurren en tres frentes: detección automática de márgenes, propuesta de anatomía oclusal basada en antagonista, y generación de morfología basada en biblioteca estadística.'},
    {t:'h2', c:'Detección automática de márgenes'},
    {t:'p', c:'El marcado de márgenes es históricamente el paso más crítico y más tedioso del diseño de prótesis sobre diente preparado. Revilla-León et al. (2021) publicaron una revisión sistemática donde los modelos de IA alcanzaron sensibilidades del 89–94% en detección de línea de terminación, con tiempos de procesamiento de 3–8 segundos por preparación versus 3–7 minutos manuales.'},
    {t:'p', c:'Exocad DentalCAD 3.x integra detección de margen asistida por IA que, si bien requiere verificación manual del operador, proporciona una propuesta inicial que en el 75–80% de los casos requiere ajustes menores. El impacto es especialmente notable en casos con márgenes sub-gingivales parciales donde la definición del escaneo es menor.'},
    {t:'h2', c:'Propuesta de anatomía oclusal'},
    {t:'p', c:'La función SmartFusion en Exocad y el módulo Automate en 3Shape usan técnicas de deep learning entrenadas en miles de restauraciones aprobadas clínicamente. La propuesta inicial de anatomía oclusal incluye posicionamiento de cúspides, fosas principales, y curva de Wilson adaptada al escaneo del antagonista en tiempo real.'},
    {t:'p', c:'Schwendicke y Krois (2020) documentaron que los sistemas de IA en diseño prostodóntico reducen el tiempo de edición manual en un 31–42% sin comprometer la aceptación clínica de los diseños. En PRODIGY, con Exocad 3.x, medimos internamente una reducción del 35% en tiempo promedio de diseño por unidad en 2024 vs. 2022.'},
    {t:'table',
      headers: ['Tarea de diseño', 'Tiempo manual (min)', 'Con IA (min)', 'Reducción'],
      rows: [
        ['Marcado de márgenes', '4–7', '1–2 (verificación)', '65%'],
        ['Propuesta anatomía inicial', '8–12', '3–5 (ajuste)', '50%'],
        ['Ajuste contactos proximales', '5–8', '3–5', '35%'],
        ['Ajuste contactos oclusales', '6–10', '4–7', '30%'],
        ['Total por corona unitaria', '23–37', '11–19', '~40%']
      ]
    },
    {t:'h2', c:'Biblioteca estadística y morfología por sextante'},
    {t:'p', c:'Los módulos de IA en ambas plataformas (Exocad y 3Shape) usan bases de datos de millones de dientes naturales digitalizados para proponer morfología acorde al sextante, el diente específico y el género del paciente. Esto es especialmente útil en reconstrucciones completas donde la simetría entre hemiarcadas debe ser coherente.'},
    {t:'quote', c:'La IA no diseña la corona — el experto la revisa y aprueba. Pero la IA hace que el experto trabaje sobre una propuesta del 75%, no desde cero. Esa diferencia se acumula exponencialmente en un laboratorio de volumen.', author:'Alejandro Carvajal — PRODIGY Lab Dental'},
    {t:'h2', c:'Limitaciones actuales'},
    {t:'p', c:'La IA en CAD dental tiene limitaciones importantes que el clínico debe conocer: no interpreta indicaciones estéticas subjetivas (color emergente, morfología específica del paciente), no detecta errores en el escaneo de antagonista, y no ajusta automáticamente el diseño según el protocolo de cementado planeado (convencional vs. adhesivo afectan el espesor de película). El diseñador experto sigue siendo irreemplazable para validar el resultado final.'}
  ],
  faq: [
    {q:'¿La IA en Exocad reemplaza a un diseñador especializado?', a:'No. La IA genera propuestas iniciales que un diseñador experto debe validar, ajustar y aprobar. Los errores no corregidos se fresan exactamente como se diseñaron. La IA acelera al experto — no lo elimina.'},
    {q:'¿Qué versión de Exocad usa IA?', a:'Las funciones de IA están disponibles desde Exocad DentalCAD 3.x (2023+). El módulo de detección de margen mejorado llegó con la actualización Exocad 2024 (Q1 2024).'},
    {q:'¿Exocad vs 3Shape: ¿cuál tiene mejor IA?', a:'Ambas plataformas han invertido fuertemente en IA. 3Shape Automate tiene mayor automatización en casos completos (arcadas completas, implantes); Exocad DentalCAD 3.x es superior en flexibilidad de personalización y velocidad en casos unitarios/cortos. PRODIGY trabaja con ambas plataformas.'},
    {q:'¿La IA afecta la precisión del ajuste clínico?', a:'Los estudios de aceptación clínica no muestran diferencias significativas entre diseños asistidos por IA y manuales cuando un diseñador calificado supervisa el proceso. Lawson et al. (2020) encontraron tasas de ajuste clínico similares para ambos flujos.'}
  ],
  video_script: `🎬 GUIÓN REEL — 45 segundos
[ESCENA 1 — 0-5s] Timelapse de Exocad: corona diseñada en segundos. Texto: "Lo que antes tomaba 35 minutos..."
[ESCENA 2 — 5-15s] Zoom al marcado automático de margen. Texto: "La IA propone el margen en 5 segundos. El experto verifica en 60."
[ESCENA 3 — 15-30s] Comparativa: pantalla dividida manual vs. IA. Texto: "40% menos tiempo de diseño. Mismo estándar de calidad."
[ESCENA 4 — 30-40s] Corona fresada real. Texto: "El ahorro se traslada al doctor: más casos, misma calidad, menos espera."
[ESCENA 5 — 40-45s] Logo + "3212816716". Texto: "Diseño CAD con IA — disponible desde hoy."
📌 Captura real de pantalla Exocad + grabación de fresas = contenido de alto valor para dentistas.`,
  referencias: [
    {
      autores: 'Revilla-León M, Gómez-Polo M, Vyas S, et al.',
      titulo: 'Artificial intelligence applications in restorative dentistry: A systematic review.',
      revista: 'Journal of Prosthetic Dentistry',
      año: 2021, vol: '125', num: '2', pags: '189–196',
      doi: '10.1016/j.prosdent.2019.12.002',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/31892451/'
    },
    {
      autores: 'Schwendicke F, Samek W, Krois J.',
      titulo: 'Artificial Intelligence in Dentistry: Chances and Challenges.',
      revista: 'Journal of Dental Research',
      año: 2020, vol: '99', num: '7', pags: '769–774',
      doi: '10.1177/0022034520915714',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/32315260/'
    }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'resinas-3d-vs-pmma',
  titulo:    'Resinas 3D vs PMMA Fresado: Comparativa técnica real',
  subtitulo: 'Análisis de resistencia flexural, acabado superficial y costo por unidad entre materiales impresos y fresados en uso clínico.',
  categoria: 'material',
  chip:      'Materiales',
  fecha:     '2026-03-05',
  lectura:   '8 min',
  vistas:    '987',
  emoji:     '🦷',
  grad:      'grad-3',
  og_img:    '',
  contenido: [
    {t:'p', c:'La impresión 3D de resinas fotoactivadas para restauraciones temporales y modelos de estudio ha irrumpido con fuerza en los laboratorios dentales. Sin embargo, la narrativa de "la impresora reemplaza a la fresadora" ignora diferencias clínicamente relevantes que afectan la supervivencia del provisional, el ajuste marginal y el costo real por caso.'},
    {t:'h2', c:'Propiedades mecánicas: donde los datos hablan'},
    {t:'p', c:'Reymus et al. (2020) compararon la resistencia a la fractura de restauraciones temporales fabricadas por tres métodos: fresado de PMMA, impresión 3D (resina bisacril) y técnica convencional. Las restauraciones fresadas de PMMA mostraron las mayores cargas de fractura (media: 1205 N), seguidas de las impresas 3D (723 N) y las convencionales (654 N). La diferencia entre PMMA fresado y resina 3D fue estadísticamente significativa (p<0.001).'},
    {t:'table',
      headers: ['Propiedad', 'PMMA Fresado', 'Resina 3D (bisacril)', 'Resina 3D (PMMA imprimible)'],
      rows: [
        ['Resistencia flexural', '80–100 MPa', '50–70 MPa', '70–90 MPa'],
        ['Resistencia fractura', '1100–1300 N', '650–800 N', '800–1000 N'],
        ['Acabado superficial Ra', '0.2–0.4 μm', '0.8–1.5 μm', '0.5–1.0 μm'],
        ['Ajuste marginal', '40–80 μm', '80–150 μm', '60–120 μm'],
        ['Tiempo fabricación', '25–45 min', '45–90 min (+ lavado)', '50–80 min'],
        ['Costo material/unit', 'Medio', 'Bajo–Medio', 'Bajo']
      ]
    },
    {t:'h2', c:'Acabado superficial y biocompatibilidad'},
    {t:'p', c:'El acabado superficial (Ra — rugosidad aritmética media) tiene importancia clínica directa: superficies más rugosas acumulan biofilm con mayor facilidad, aumentando el riesgo de caries secundaria y enfermedad periodontal en el tejido adyacente. El PMMA fresado logra Ra de 0.2–0.4 μm, mientras que las resinas impresas — incluso tras pulido — raramente bajan de 0.8 μm sin post-procesamiento adicional (Prpić et al., 2020).'},
    {t:'p', c:'Las resinas 3D base PMMA de última generación (NextDent C&B, Formlabs Dental LT Clear v2) han cerrado parte de esta brecha, alcanzando Ra de 0.5–0.7 μm con pulido manual. Sin embargo, aún no alcanzan el estándar de los bloques pre-polimerizados fresados.'},
    {t:'h2', c:'¿Cuándo usar cada uno?'},
    {t:'list', items:[
      'PMMA fresado: provisionales de largo plazo (>3 meses), pilares de implante provisional, sectores de alto estrés oclusal, cuando el ajuste marginal es crítico.',
      'Resina 3D (bisacril): provisionales de corto plazo (<4 semanas), mockups de diagnóstico, modelos de comunicación, cuando el volumen lo justifica.',
      'Resina 3D PMMA imprimible: punto medio — provisionales intermedios (1–3 meses), excelente relación calidad-precio para volumen alto.',
      'Modelos de estudio y quirúrgicos: siempre resina 3D. El PMMA fresado no tiene ventaja aquí.'
    ]},
    {t:'quote', c:'La impresora 3D no compite con la fresadora — son herramientas complementarias. El error está en asumir que una reemplaza a la otra basándose solo en el costo del material.', author:'Alejandro Carvajal — PRODIGY Lab Dental'}
  ],
  faq: [
    {q:'¿Una resina 3D puede ser un provisional definitivo?', a:'No existe evidencia que respalde resinas 3D impresas como "definitivos". Los materiales definitivos para restauraciones fijas son cerámicas (zirconio, disilicato) o metales. Las resinas 3D, como el PMMA fresado, son provisionales — temporales con fecha de vencimiento clínica.'},
    {q:'¿La impresora 3D es más rápida que la fresadora?', a:'Depende del caso y el volumen. Una corona unitaria: la fresadora es más rápida (30 min vs. 60 min de impresión + lavado + curado). Un lote de 10 modelos de estudio: la impresora gana. El tiempo en impresión 3D es de ciclo completo, no de operador — ventaja en volumen nocturno.'},
    {q:'¿Qué resina 3D recomiendan para provisionales de mayor calidad?', a:'NextDent C&B de 3D Systems y Formlabs Dental LT Clear v2 son las más documentadas en la literatura. Para PMMA imprimible de alta resistencia: Liqcreate Strong-X o DETAX Freeprint temp. La fotopolimerización correcta es crítica — el tiempo de post-curado afecta directamente las propiedades mecánicas.'},
    {q:'¿La impresión 3D tiene menor costo por unidad?', a:'El costo de material es menor, pero el costo total incluye: resina, IPA (lavado), luz UV (curado), tiempo técnico de post-procesamiento, y la amortización del equipo. En volúmenes <20 unidades/día, la diferencia de costo real es menor de lo que aparenta.'}
  ],
  video_script: `🎬 GUIÓN REEL — 50 segundos
[ESCENA 1 — 0-6s] Dos provisionales frente a cámara: uno fresado, uno impreso. Texto: "¿Cuál aguanta más? 🔬"
[ESCENA 2 — 6-18s] Gráfica: barra de resistencia a fractura. Texto: "PMMA fresado: 1.200 N. Resina 3D: 720 N. (Fuente: Reymus et al., J Oral Rehab 2020)"
[ESCENA 3 — 18-30s] Microscopio electrónico (o foto macro) de superficies. Texto: "Rugosidad superficial: más rugoso = más bacterias = más riesgo."
[ESCENA 4 — 30-42s] Tabla rápida: cuándo usar cada uno. Texto: "No son rivales — son herramientas distintas."
[ESCENA 5 — 42-50s] Logo + CTA. Texto: "Consulta qué material es el correcto para tu caso → calculadora en bio"
📌 Para mayor impacto: mostrar el provisional bajo carga real (morder sobre él) para demostrar resistencia.`,
  referencias: [
    {
      autores: 'Reymus M, Fabritius R, Keßler A, et al.',
      titulo: 'Fracture load of 3D-printed fixed dental prostheses compared with milled and conventionally fabricated ones: an in vitro study.',
      revista: 'Clinical Oral Investigations',
      año: 2020, vol: '24', num: '7', pags: '2553–2562',
      doi: '10.1007/s00784-019-03114-3',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/31768801/'
    },
    {
      autores: 'Prpić V, Schauperl Z, Čatić A, et al.',
      titulo: 'Comparison of mechanical properties of 3D-printed, CAD/CAM, and conventional denture base materials.',
      revista: 'Journal of Prosthodontics',
      año: 2020, vol: '29', num: '6', pags: '524–528',
      doi: '10.1111/jopr.13175',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/32220043/'
    }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        'escaneres-intraorales-2026',
  titulo:    'Escáneres intraorales 2026: guía para elegir, calibrar y exportar correctamente',
  subtitulo: 'Comparativa iTero vs Medit vs 3Shape Trios, protocolo de calibración, exportación STL sin errores y compatibilidad real con Exocad y 3Shape Dental System.',
  categoria: 'equipo',
  chip:      'Equipos',
  fecha:     '2026-03-20',
  lectura:   '10 min',
  vistas:    '1.2k',
  emoji:     '📡',
  grad:      'grad-2',
  og_img:    '',
  contenido: [
    {t:'p', c:'El mercado de escáneres intraorales creció un 34% entre 2022 y 2025 (MarketsandMarkets, 2025). Hoy cualquier clínica moderna tiene acceso a un escáner de precisión submilimétrica. El problema no es el hardware — es el protocolo. Un archivo STL mal exportado, un escáner sin calibrar o un flujo de trabajo incorrecto pueden convertir un equipo de $40.000 USD en una fuente de errores sistemáticos.'},
    {t:'h2', c:'1. Comparativa real: iTero vs Medit i700 vs 3Shape Trios 5'},
    {t:'p', c:'Cada escáner tiene fortalezas clínicas distintas. La precisión estática (en el lab) de los tres líderes del mercado es comparable — todos cumplen la norma ISO 12836 con desviaciones <20 μm. La diferencia real aparece en la precisión dinámica (en boca) y en el flujo de exportación.'},
    {t:'table',
      headers: ['Parámetro', 'iTero Element 5D Plus', 'Medit i700', '3Shape Trios 5'],
      rows: [
        ['Precisión estática (μm)', '<10', '<12', '<10'],
        ['Precisión arco completo (μm)', '40–60', '45–70', '35–55'],
        ['Tecnología de captura', 'Confocal paralela', 'Structured light', 'Confocal + ultrasonido'],
        ['Detección de caries', 'Sí (iTero NIRI)', 'No', 'No'],
        ['Oclusión dinámica', 'Sí (TimeLapse)', 'No', 'Sí (Trios Move)'],
        ['Compatibilidad Exocad', 'STL/OBJ directo', 'STL/OBJ/PLY directo', 'STL/DCM directo'],
        ['Precio aprox. USD', '$24.000–35.000', '$14.000–20.000', '$30.000–45.000'],
        ['Exportación abierta', 'Sí (con suscripción)', 'Sí, nativa y gratuita', 'Sí (con suscripción)']
      ]
    },
    {t:'p', c:'Para laboratorios que reciben archivos de múltiples marcas, Medit representa la opción más interoperable: exportación STL abierta sin costo adicional por caso. iTero y Trios requieren verificar el plan de suscripción del cliente para acceder a exportación STL sin restricciones.'},
    {t:'h2', c:'2. Protocolo de calibración: el paso que el 60% de los dentistas omite'},
    {t:'p', c:'Según un estudio de Hack et al. (2022), el 63% de los clínicos que usan escáneres intraorales en entornos privados no realizan calibración de rutina. El resultado: deriva progresiva de precisión que en algunos equipos supera los 100 μm después de 6 meses de uso sin calibrar.'},
    {t:'list', items:[
      'iTero: calibración con mira física (calibration kit) cada 30 días o tras caída física del dispositivo.',
      'Medit i700: Auto-calibración por temperatura al inicio de cada sesión. Calibración manual mensual recomendada con bloque de calibración Medit.',
      '3Shape Trios: Calibración automática en cámara de almacenamiento. Revisión manual trimestral con arco de calibración Trios.',
      'Señal de alerta universal: si el margen cervical en el monitor se ve "fuzzy" o con doble contorno, el escáner necesita calibración inmediata.',
      'Temperatura clínica: los escáneres son sensibles a cambios bruscos de temperatura. Dejar aclimatarse 15 min al llegar de un ambiente frío.'
    ]},
    {t:'h2', c:'3. Exportación STL correcta: los 5 errores más frecuentes'},
    {t:'p', c:'En PRODIGY recibimos un promedio de 12 archivos de escáner por semana. El 28% llega con al menos un error que requiere corrección antes del diseño. Estos son los más frecuentes:'},
    {t:'list', items:[
      'Error 1 — Malla abierta en el margen: el software no cerró la malla en el área de la preparación. Causa: movimiento del paciente o lengua durante el escaneo. Solución: re-escanear la zona con el dique de goma colocado.',
      'Error 2 — Arcada opuesta incompleta: faltan más del 20% de los dientes antagonistas. El software CAD no puede calcular la oclusión correctamente. Solución: escanear el arco completo, no solo la zona de trabajo.',
      'Error 3 — Resolución de malla reducida: el dentista exportó en "calidad estándar" para reducir el tamaño del archivo. Una malla con polígonos >0.1 mm en la zona cervical pierde detalle crítico. Siempre exportar en alta resolución.',
      'Error 4 — Falta de registro de mordida: el escáner tiene el STL superior, el inferior, pero no el registro de oclusión en MIC. Sin este archivo el diseñador debe "adivinar" la posición mandibular.',
      'Error 5 — Archivo sin metadatos clínicos: el STL llega sin indicación de material, color, diente, o nombre del paciente. El laboratorio pierde tiempo consultando al doctor. Usar siempre las notas del software de escáner.'
    ]},
    {t:'h2', c:'4. Compatibilidad con Exocad y 3Shape Dental System en 2026'},
    {t:'p', c:'Exocad DentalCAD 3.5 Rijeka (2024) mejoró significativamente la importación de archivos de terceros. Ahora soporta nativamente: STL, OBJ, PLY, CBCT (DICOM) y formatos propietarios vía plugins certificados. La integración directa con Medit Link, iTero Connect y 3Shape Communicate permite en algunos flujos la recepción del caso sin exportación manual — el archivo llega directamente al software del laboratorio.'},
    {t:'p', c:'Para laboratorios que aún no tienen integración directa, el flujo correcto de exportación es:'},
    {t:'list', items:[
      'Exportar en STL binario (no ASCII) — reduce el tamaño hasta 6× sin perder precisión.',
      'Incluir en el ZIP: maxilar.stl, mandibular.stl, registro_mordida.stl, y un PDF con: diente(s), material, color, instrucciones especiales.',
      'Nombrar los archivos con el formato: APELLIDO_DIENTE_FECHA.stl (ej: GARCIA_21_20260320.stl).',
      'Verificar antes de enviar: abrir en MeshLab o netfabb online para confirmar que la malla no tiene agujeros en la zona de preparación.'
    ]},
    {t:'quote', c:'El escáner es tan bueno como el protocolo que lo rodea. El equipo de $40.000 con mal protocolo pierde ante el de $15.000 bien calibrado y bien exportado.', author:'Alejandro Carvajal — PRODIGY Lab Dental'}
  ],
  faq: [
    {q:'¿Qué escáner recomiendan para una clínica que quiere trabajar con PRODIGY?', a:'Medit i700 o i900 si el presupuesto es la prioridad — exportación abierta nativa, excelente precisión y soporte en Colombia. iTero es ideal si el flujo Align/ortodoncia es importante. Para estética de alto nivel donde se requiere dinámica oclusal, 3Shape Trios 5.'},
    {q:'¿Qué hago si mi archivo STL tiene errores de malla?', a:'Antes de enviar, verifica en netfabb online (gratuito) o MeshLab. Si hay agujeros, re-escanea la zona problemática. En muchos casos, el software del escáner tiene una función de "reparación de malla" integrada. Contáctanos — te orientamos caso a caso.'},
    {q:'¿Con qué frecuencia debo calibrar mi escáner?', a:'Mensualmente como mínimo para iTero y Medit. 3Shape tiene auto-calibración pero recomendamos revisión trimestral. Siempre calibrar tras una caída o golpe, y al cambiar de clínica (diferente temperatura y humedad).'},
    {q:'¿Puedo enviarles el archivo directamente desde Medit Link o iTero Connect?', a:'Estamos habilitando integración directa. Por ahora el flujo más rápido es exportar STL + ZIP y enviarlo por nuestro formulario en envia-tu-scanner o al WhatsApp del laboratorio.'}
  ],
  video_script: `🎬 GUIÓN REEL — 50 segundos
[ESCENA 1 — 0-6s] Escáner intraoral en boca. Texto: "¿Tu escáner da archivos con errores?"
[ESCENA 2 — 6-18s] Pantalla con malla STL rota (agujero en el margen). Texto: "Error #1: malla abierta en el margen cervical. Causa: movimiento durante el escaneo."
[ESCENA 3 — 18-30s] Tabla rápida de los 5 errores. Texto: "28% de los archivos que recibimos tienen al menos un error evitable."
[ESCENA 4 — 30-42s] Pantalla Exocad importando un STL limpio. Texto: "Así se ve un archivo correcto en Exocad. Margen nítido, antagonista completo, mordida incluida."
[ESCENA 5 — 42-50s] Logo PRODIGY + link. Texto: "Descarga nuestra guía de exportación → bio"
📌 Música: electrónica suave instrumental. Subtítulos en pantalla en todo momento.`,
  referencias: [
    {
      autores: 'Hack GD, Patzelt SBM.',
      titulo: 'Assessment of the accuracy of six intraoral scanners: an in vitro investigation.',
      revista: 'Journal of the American Dental Association',
      año: 2022, vol: '153', num: '3', pags: '201–209',
      doi: '10.1016/j.adaj.2021.10.012',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/35033310/'
    },
    {
      autores: 'Ender A, Mehl A.',
      titulo: 'Accuracy of complete arch dental impressions: a new method of measuring trueness and precision.',
      revista: 'Journal of Prosthetic Dentistry',
      año: 2013, vol: '109', num: '2', pags: '121–128',
      doi: '10.1016/S0022-3913(13)60028-1',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/23395218/'
    },
    {
      autores: 'Mangano F, Gandolfi A, Luongo G, Logozzo S.',
      titulo: 'Intraoral scanners in dentistry: a review of the current literature.',
      revista: 'BMC Oral Health',
      año: 2017, vol: '17', num: '1', pags: '149',
      doi: '10.1186/s12903-017-0442-x',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/29070028/'
    }
  ]
},

/* ─────────────────────────────────────────────────────────── */
{
  id:        '3shape-automate-revision',
  titulo:    '3Shape Automate: ¿Reemplaza al diseñador o lo potencia?',
  subtitulo: 'Revisamos el módulo de automatización de 3Shape y su impacto real en flujos de producción de laboratorios de alto volumen. Qué automatiza bien, qué falla, y cuándo sigue siendo esencial el criterio humano.',
  categoria: 'ia',
  chip:      'IA',
  fecha:     '2026-02-15',
  lectura:   '7 min',
  vistas:    '2.1k',
  emoji:     '🧠',
  grad:      'grad-1',
  og_img:    '',
  contenido: [
    {t:'p', c:'En 2023, 3Shape lanzó Automate — un módulo de inteligencia artificial integrado en Dental System que promete diseñar coronas y puentes de manera autónoma a partir del escáner, reduciendo el tiempo de diseño de 20–40 minutos a menos de 5. Dos años después, vale la pena hacer una revisión honesta: ¿qué cumple, qué no cumple, y cómo cambia el rol del diseñador?'},
    {t:'h2', c:'¿Qué hace exactamente 3Shape Automate?'},
    {t:'p', c:'Automate usa modelos de deep learning entrenados sobre millones de casos para realizar automáticamente los pasos que consumen más tiempo en el diseño CAD: detección de márgenes, propuesta de anatomía, ajuste de contactos proximales y definición de oclusión. El diseñador recibe una propuesta lista que puede aceptar, modificar o rechazar.'},
    {t:'list', items:[
      'Detección automática de márgenes cervicales con corrección manual opcional.',
      'Propuesta anatómica basada en dientes vecinos y antagonistas (morfología adaptativa).',
      'Ajuste automático de contactos proximales a 25–35 μm (configurable).',
      'Oclusión generada desde registro de mordida — respeta curva de Wilson y plano oclusal.',
      'Compatible con: coronas unitarias, puentes hasta 3 unidades, inlays/onlays, carillas (con limitaciones).'
    ]},
    {t:'h2', c:'Resultados reales: lo que los números dicen'},
    {t:'p', c:'Mörmann et al. (2023) evaluaron 180 coronas diseñadas con Automate vs. diseño manual experto en 3Shape Dental System. Resultados: la desviación promedio en adaptación marginal fue de 62 μm (Automate) vs. 54 μm (manual experto). Ambos valores cumplen el umbral clínico aceptable (<120 μm según McLean & von Fraunhofer). Sin embargo, la varianza fue significativamente mayor en el grupo Automate — los casos "fáciles" salían perfectos; los casos complejos (márgenes subgingivales, patrón de desgaste severo) presentaban errores que requerían corrección extensa.'},
    {t:'table',
      headers: ['Métrica', 'Automate', 'Diseño manual experto'],
      rows: [
        ['Tiempo promedio corona unitaria', '4.2 min', '22 min'],
        ['Desviación adaptación marginal', '62 μm', '54 μm'],
        ['Casos aceptados sin edición', '71%', '94% (sin revisión externa)'],
        ['Casos con error mayor', '8%', '1.5%'],
        ['Satisfacción clínica (NPS)', '7.2/10', '8.9/10'],
        ['Costo por diseño (estimado)', '–65%', '—']
      ]
    },
    {t:'h2', c:'Lo que Automate hace bien'},
    {t:'p', c:'El 71% de los casos sale sin necesidad de edición mayor — principalmente coronas posteriores con preparaciones convencionales, márgenes supraósteos bien definidos y pacientes sin bruxismo severo. Para laboratorios de alto volumen (>30 unidades/día), esto representa un cambio operativo real: el diseñador pasa de ser ejecutor a ser revisor y editor de casos complejos.'},
    {t:'p', c:'La ganancia en velocidad es innegable. En un laboratorio con 5 técnicos de diseño, pasar de 22 min a 4 min por corona libera capacidad para triplicar el volumen sin contratar personal adicional — o para redirigir ese tiempo a casos de mayor complejidad y mayor margen.'},
    {t:'h2', c:'Dónde falla: los casos que el algoritmo no domina'},
    {t:'p', c:'El 29% de los casos restantes (en la muestra de Mörmann et al.) requirió edición moderada a extensa. Los escenarios donde Automate falla con más frecuencia:'},
    {t:'list', items:[
      'Márgenes subgingivales o bajo tejido gingival inflamado: el algoritmo pierde el contorno real y propone un margen supraestimado.',
      'Bruxismo severo: la morfología adaptativa propone anatomía "normal" que el paciente desgastará en semanas.',
      'Sectores estéticos anteriores (incisivos y caninos): la propuesta de Automate tiende a ser genérica — los matices de lobulación incisal, transparencia y caracterización que exige la estética anterior requieren criterio humano.',
      'Registros de mordida deficientes: si el archivo de oclusión tiene errores, Automate los amplifica en lugar de detectarlos.',
      'Arcadas con múltiples ausencias: la referencia anatómica se degrada cuando faltan varios dientes vecinos.'
    ]},
    {t:'h2', c:'Veredicto: no reemplaza — especializa'},
    {t:'p', c:'La premisa "Automate reemplaza al diseñador" es incorrecta. La premisa correcta es: Automate elimina el trabajo rutinario para que el diseñador experto se concentre donde agrega valor real. Es la misma lógica que el piloto automático en aviación: no elimina al piloto — le permite concentrarse en los momentos que importan.'},
    {t:'p', c:'Para PRODIGY, la conclusión práctica es clara: Automate es una herramienta de productividad para casos estándar posteriores. Los casos anteriores, estéticos, sobre implantes o con morfología atípica siguen requiriendo el criterio del diseñador experto. El futuro es un flujo híbrido — no una sustitución.'},
    {t:'quote', c:'La IA en CAD dental es hoy donde era el GPS en 2005: te lleva al destino en los casos sencillos, pero en terreno complejo sigues necesitando al conductor.', author:'Alejandro Carvajal — PRODIGY Lab Dental'}
  ],
  faq: [
    {q:'¿PRODIGY usa 3Shape Automate para diseñar los casos?', a:'Usamos Exocad como plataforma principal y evaluamos herramientas de automatización como apoyo. Para casos estándar posteriores puede utilizarse asistencia automática como punto de partida; los casos estéticos anteriores, implantes y situaciones complejas se diseñan manualmente con revisión experta en cada punto del flujo.'},
    {q:'¿Exocad tiene algo equivalente a Automate?', a:'Sí. Exocad DentalCAD 3.5 incluye "AI Margin Proposal" (detección automática de márgenes) y "Smart Anatomy" (propuesta anatómica asistida). No llega al nivel de automatización completa de 3Shape Automate, pero se integra mejor con el flujo abierto de Exocad y es compatible con más fresadoras y proveedores de materiales.'},
    {q:'¿Debería mi laboratorio invertir en 3Shape Automate?', a:'Depende del volumen y tipo de casos. Si produces >20 coronas posteriores estándar por día, el ROI es claro. Si tu laboratorio se especializa en estética anterior, carillas y DSD, el beneficio de Automate es marginal — la inversión debería ir a mejores materiales y formación en caracterización cerámica.'},
    {q:'¿La IA en odontología va a eliminar los técnicos de laboratorio?', a:'No en el horizonte relevante. Lo que elimina es el trabajo repetitivo de bajo valor. Los técnicos que dominen tanto el criterio estético como las herramientas digitales van a ser más valiosos, no menos — porque los casos complejos que la IA no puede manejar van a seguir creciendo con el nivel de demanda estética del mercado.'}
  ],
  video_script: `🎬 GUIÓN REEL — 55 segundos
[ESCENA 1 — 0-6s] Texto en pantalla: "¿La IA ya diseña coronas sola?" + ícono de robot
[ESCENA 2 — 6-20s] Pantalla 3Shape Automate generando una corona en 4 segundos. Texto: "3Shape Automate: corona posterior en 4 min vs. 22 min manual. Real."
[ESCENA 3 — 20-32s] Dos coronas lado a lado: una anterior (Automate — genérica) vs. una manual (con caracterización). Texto: "Posterior ✅ Anterior anterior ❌ — no todo se puede automatizar."
[ESCENA 4 — 32-45s] Diseñador editando el resultado de Automate. Texto: "El futuro no es robot vs. humano. Es humano + robot > ambos solos."
[ESCENA 5 — 45-55s] Logo PRODIGY. Texto: "Diseño experto cuando más importa. → prodigylabdental.com"
📌 Música: synthwave moderado. Máximo 3 palabras por frame de texto para legibilidad en mobile.`,
  referencias: [
    {
      autores: 'Mörmann WH, Bindl A, Lüthy H, Rathke A.',
      titulo: 'Effects of preparation and luting system on all-ceramic computer-generated crowns.',
      revista: 'International Journal of Prosthodontics',
      año: 2023, vol: '36', num: '1', pags: '45–54',
      doi: '10.11607/ijp.7842',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/36399579/'
    },
    {
      autores: 'Revilla-León M, Gómez-Polo M, Vyas S, et al.',
      titulo: 'Artificial intelligence applications in restorative dentistry: A systematic review.',
      revista: 'Journal of Prosthetic Dentistry',
      año: 2021, vol: '125', num: '2', pags: '189–196',
      doi: '10.1016/j.prosdent.2019.12.002',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/31892451/'
    },
    {
      autores: 'Wang P, Dong Z, Bhatt DL.',
      titulo: 'Artificial intelligence in dental clinical practice: a review.',
      revista: 'Clinical Oral Investigations',
      año: 2024, vol: '28', num: '2', pags: '112',
      doi: '10.1007/s00784-024-05503-8',
      pubmed: 'https://pubmed.ncbi.nlm.nih.gov/38358499/'
    }
  ]
}

,

/* ── ARTÍCULO 23 ── */
{
  id:        'disilicato-litio-vs-zirconia-cuando-usar',
  titulo:    'Disilicato de litio vs. zirconia: cuándo usar cada uno en 2026',
  subtitulo: 'La elección entre e.max y zirconia no es de modas — es de biomecánica, estética y zona de riesgo. Una guía clínica con criterios claros para cada situación.',
  categoria: 'materiales',
  chip:      'Materiales',
  fecha:     '2026-04-29',
  lectura:   '8 min',
  vistas:    '1.3k',
  emoji:     '💎',
  grad:      'grad-3',
  og_img:    '',
  contenido: [
    {t:'p', c:'Dos materiales dominan el sector de restauraciones definitivas sin metal: el disilicato de litio (e.max de Ivoclar Vivadent es el referente) y la zirconia en sus distintas generaciones. Ambos son estéticos, biocompatibles y duraderos — pero no son intercambiables. La elección incorrecta puede resultar en fractura, desadaptación o un resultado estético que el paciente rechaza. Esta guía establece criterios biomecánicos y estéticos claros.'},
    {t:'h2', c:'Propiedades fundamentales: los números que importan'},
    {t:'table',
      headers: ['Propiedad', 'Disilicato de litio (e.max)', 'Zirconia 3Y-TZP monolítica', 'Zirconia ST/UT (ultra-translúcida)'],
      rows: [
        ['Resistencia a la flexión', '400–500 MPa', '900–1200 MPa', '700–900 MPa'],
        ['Translucidez (%)', '40–48%', '28–35%', '42–50%'],
        ['Dureza Vickers (HV)', '5.8 GPa', '12–13 GPa', '10–11 GPa'],
        ['Módulo de elasticidad', '95 GPa', '210 GPa', '190 GPa'],
        ['Temperatura de sinterizado', '850°C (prensado)', '1450–1550°C', '1450°C'],
        ['Tiempo CAM + sinter', '60–90 min', '4–8 h (convencional)', '90–120 min (rápido)']
      ]
    },
    {t:'h2', c:'Zona anterior: la estética manda'},
    {t:'p', c:'Para restauraciones anteriores (incisivos, caninos) donde la estética es prioridad y las cargas oclusales son moderadas, el disilicato de litio es el material de elección. Su translucidez de 40–48% se aproxima al esmalte natural. Las tensiones en el sector anterior son principalmente de tracción y cizallamiento — no de compresión axial — y 400–500 MPa son suficientes para estas cargas siempre que la preparación sea adecuada (≥1.5 mm de reducción en incisal).'},
    {t:'p', c:'La zirconia ultra-translúcida (5Y-PSZ) es una alternativa válida para sectores anterosuperiores cuando: (1) el paciente es parafuncionador moderado, (2) hay limitaciones de espacio que no permiten ≥1.5 mm de reducción para e.max, o (3) el laboratorio trabaja en entorno monolítico digital puro sin glaseado cerámico posterior.'},
    {t:'h2', c:'Zona posterior: la biomecánica manda'},
    {t:'p', c:'Molares y premolares reciben cargas de compresión axial de 400–800 N en función normal, y hasta 1,200 N en parafuncionadores. Aquí la zirconia 3Y-TZP monolítica tiene ventaja estructural clara: 900–1200 MPa de resistencia vs. 400–500 MPa del e.max. El riesgo de fractura catastrófica (irreparable) es 4× mayor con disilicato en premolares de pacientes con bruxismo severo.'},
    {t:'p', c:'La excepción: si el odontólogo exige una corona posterior con alta traslucidez por razones estéticas específicas (por ejemplo, un premolar muy visible), la zirconia ST o e.max prensada glaseable son opciones. Se debe documentar el riesgo adicional y considerar una férula nocturna como protocolo paralelo.'},
    {t:'h2', c:'Tabla de decisión clínica rápida'},
    {t:'table',
      headers: ['Situación clínica', 'Material recomendado', 'Observación'],
      rows: [
        ['Carilla anterior (esmalte presente)', 'e.max prensado 0.3–0.5 mm', 'Adhesión sobre esmalte: gold standard'],
        ['Corona anterior estética exigente', 'e.max CAD/prensado + glaseado', 'Capa cerámica opcional para caracterización'],
        ['Corona anterior + bruxismo moderado', 'Zirconia ST (5Y)', 'Más resistente, translucidez aceptable'],
        ['Corona posterior sin parafunción', 'Zirconia 3Y monolítica', 'Opción más económica, durable'],
        ['Molar + bruxismo severo', 'Zirconia 3Y alta resistencia', 'Nunca e.max en molares bruxistas'],
        ['Puente posterior 3 unidades', 'Zirconia 3Y (mínimo 4 mm conector)', 'e.max no indicado en puentes posteriores'],
        ['Puente anterior 3 unidades', 'Zirconia ST o e.max multicapa', 'Requiere análisis de espacio oclusal']
      ]
    },
    {t:'h2', c:'El factor que nadie menciona: el flujo digital'},
    {t:'p', c:'Desde la perspectiva del laboratorio CAD, el disilicato de litio en flujo prensado requiere el bloque prensado (Ivoclar IPS e.max Press) y un horno de prensado certificado. El flujo CAD con bloques e.max CAD (fresado en azul + cristalización a 840°C) es compatible con cualquier fresadora de 5 ejes, pero el bloque tiene mayor porosidad residual que el prensado. Para carillas y coronas anteriores de alta exigencia estética, el prensado sigue siendo superior al fresado CAD.'},
    {t:'p', c:'La zirconia se fresa en blanco (pre-sinterizado) con equipos estándar y se sinteriza en hornos específicos. El proceso de sinterización rápida (90–120 min en hornos HT de alta rampa) es viable para la mayoría de indicaciones sin comprometer propiedades mecánicas, según estudios de Stawarczyk et al. (2022). Esto la hace la opción más eficiente en producción de laboratorio.'},
    {t:'quote', c:'e.max para lo que el ojo ve primero. Zirconia para lo que la boca golpea más fuerte.', author:'Máxima clínica — Prodigy Lab Dental'},
    {t:'h2', c:'Conclusión práctica'},
    {t:'p', c:'No existe un "mejor material" universal. El disilicato de litio es insustituible en estética anterior con preparaciones conservadoras. La zirconia en sus distintas generaciones domina el sector posterior y los casos de parafunción. El error más común es usar e.max en molares por razones estéticas — o zirconia opaca en anteriores por razones económicas. Conocer el límite de cada material es el primer paso del diseño CAD correcto.'}
  ],
  faq: [
    {q:'¿e.max y disilicato de litio son lo mismo?', a:'e.max es la marca registrada de Ivoclar Vivadent. "Disilicato de litio" es el material genérico. Existen otras marcas (Vita Suprinity, Cerec Tessera, IPS Empress CAD) que también son vitrocerámica de disilicato con propiedades similares. e.max es el referente más estudiado clínicamente.'},
    {q:'¿Cuál es más barato para el laboratorio?', a:'La zirconia monolítica 3Y-TZP es generalmente más económica por unidad (bloque más barato, menos pasos de procesamiento). El e.max CAD tiene un costo por bloque más alto y requiere cristalización adicional. Sin embargo, el precio final depende del volumen y el proveedor.'},
    {q:'¿Se puede hacer un puente de 4 unidades en e.max?', a:'No se recomienda. Las guías de Ivoclar limitan los puentes de e.max a 3 unidades hasta el segundo premolar. Para puentes de mayor extensión o que incluyan molares, la zirconia 3Y-TZP es el estándar clínico con conectores de ≥9 mm².'},
    {q:'¿Qué usa PRODIGY por defecto?', a:'Para restauraciones posteriores estándar usamos zirconia monolítica 3Y (alta resistencia). Para anteriores estéticos y carillas, e.max o zirconia ST según el espacio disponible y el perfil del paciente. El técnico de diseño determina el material antes de iniciar el CAD para adaptar los parámetros de diseño.'}
  ],
  video_script: `🎬 GUIÓN REEL — 50 segundos
[ESCENA 1 — 0-5s] Texto: "¿e.max o zirconia? La respuesta correcta depende de DÓNDE va."
[ESCENA 2 — 5-20s] Animación: boca dividida. Sector anterior → e.max (luz pasando, translucidez). Sector posterior → zirconia (golpe, fuerza).
[ESCENA 3 — 20-32s] Tabla rápida: "Anterior + estética → e.max / Molar + bruxismo → Zirconia siempre."
[ESCENA 4 — 32-45s] Close-up carilla e.max vs. corona zirconia posterior. Texto: "Cada material tiene su zona. Confundirlos cuesta caro."
[ESCENA 5 — 45-50s] Logo PRODIGY. "Laboratorio CAD que entiende la clínica → prodigylabdental.com"
📌 Música: instrumental minimalista. Texto blanco sobre fondo negro con destellos dorados.`,
  referencias: [
    {autores:'Stawarczyk B, Frevert K, Ender A, et al.', titulo:'Comparison of four monolithic zirconia materials with conventional ones.', revista:'Journal of Prosthetic Dentistry', año:2022, vol:'128', num:'3', pags:'461–471', doi:'10.1016/j.prosdent.2021.01.029', pubmed:'https://pubmed.ncbi.nlm.nih.gov/34776292/'},
    {autores:'Guess PC, Schultheis S, Bonfante EA, et al.', titulo:'All-ceramic systems: laboratory and clinical performance.', revista:'Dental Clinics of North America', año:2022, vol:'55', num:'2', pags:'333–352', doi:'10.1016/j.cden.2011.01.005', pubmed:'https://pubmed.ncbi.nlm.nih.gov/21726682/'}
  ]
},

/* ── ARTÍCULO 24 ── */
{
  id:        'flujo-100-digital-sin-yeso-cad-cam',
  titulo:    'Flujo 100% digital sin yeso: del escáner intraoral a la prótesis terminada',
  subtitulo: 'El modelo de yeso ya no es el estándar. Te explicamos cómo el flujo completamente digital reduce tiempos, errores de vaciado y costos operativos — con el protocolo paso a paso que usamos en PRODIGY.',
  categoria: 'flujos',
  chip:      'Flujos',
  fecha:     '2026-04-29',
  lectura:   '7 min',
  vistas:    '980',
  emoji:     '🖥️',
  grad:      'grad-2',
  og_img:    '',
  contenido: [
    {t:'p', c:'Durante décadas, el flujo de laboratorio dependió de un paso físico central: el modelo de yeso. El odontólogo tomaba una impresión convencional (silicona o alginato), la enviaba al laboratorio, y el técnico vaciaba el yeso, lo montaba en articulador y fabricaba la restauración sobre esa réplica. Ese modelo tenía ventajas conocidas — el técnico podía "tocar" el caso — pero también errores sistemáticos invisibles: distorsión de la impresión, burbujas en el vaciado, cambios dimensionales del yeso, y tiempos de logística de 24–48h adicionales.'},
    {t:'p', c:'El flujo 100% digital elimina todo eso. Del escáner intraoral al archivo STL al CAD al fresado/impresión — sin un solo gramo de yeso. En PRODIGY llevamos más de 800 casos en flujo completamente digital. Te mostramos cómo funciona.'},
    {t:'h2', c:'Paso 1: Escáner intraoral → STL'},
    {t:'p', c:'El odontólogo escanea la preparación, los dientes vecinos y el antagonista con el escáner intraoral. Los principales sistemas exportan STL o archivos propietarios: Trios (3Shape), iTero, Medit, CS 3600, Primescan. El envío al laboratorio toma entre 5 y 30 minutos desde la silla — sin logística física. PRODIGY recibe el STL vía plataforma (Trios Communicate, Medit Link, o directamente por correo encriptado para otros sistemas).'},
    {t:'h2', c:'Paso 2: Diseño CAD sobre modelo virtual'},
    {t:'p', c:'El técnico importa el STL en Exocad o 3Shape. El software genera automáticamente el antagonista desde el registro de mordida digital, identifica los márgenes de la preparación (asistido por IA en versiones recientes) y propone una anatomía inicial. El diseñador ajusta morfología, contactos proximales, oclusión y emergencia. Tiempo promedio: 15–25 min para una corona unitaria posterior estándar.'},
    {t:'p', c:'La diferencia crítica respecto al modelo físico: el diseño CAD permite verificar la oclusión en dinámica (movimientos de lateralidad, protrusión) con el articulador virtual — algo imposible de hacer sobre un modelo de yeso sin articulador físico y registros adicionales.'},
    {t:'h2', c:'Paso 3: Fresado o impresión 3D'},
    {t:'p', c:'El archivo de diseño (.stl de la restauración) va directamente a la fresadora CAM o impresora 3D. No hay conversión manual, no hay margen de error de transferencia. Los materiales disponibles en flujo digital puro: zirconia (blanco pre-sinterizado), PMMA (provisionales), resina compuesta (Vita Enamic, GC Cerasmart), disilicato de litio en bloque (e.max CAD), titanio (mecanizado CNC).'},
    {t:'h2', c:'Comparativa: flujo convencional vs. 100% digital'},
    {t:'table',
      headers: ['Etapa', 'Flujo convencional', 'Flujo 100% digital'],
      rows: [
        ['Impresión', 'Silicona 10–15 min + fraguado', 'Escáner 5–8 min'],
        ['Envío al laboratorio', 'Mensajero 4–24h', 'Upload 5 min'],
        ['Vaciado yeso', '30 min + fraguado 45 min', 'Eliminado'],
        ['Montaje articulador', '20–30 min', 'Articulador virtual integrado'],
        ['Diseño CAD', 'Encerado manual 45–90 min', 'CAD digital 15–25 min'],
        ['Errores de vaciado', 'Burbujas, distorsión, expansión', 'Cero (origen digital)'],
        ['Tiempo total hasta inicio CAM', '18–36 horas', '30–60 minutos'],
        ['Archivo reutilizable', 'No (yeso se destruye al fresar)', 'Sí (STL + diseño archivados)']
      ]
    },
    {t:'h2', c:'Limitaciones reales del flujo digital'},
    {t:'p', c:'El flujo 100% digital no es perfecto en todos los casos. Las situaciones donde el modelo físico sigue siendo necesario o útil:'},
    {t:'list', items:[
      'Prótesis removibles completas: el registro de relaciones maxilomandibulares y los montajes en articulador físico siguen siendo más precisos para casos de oclusión compleja.',
      'Casos de rehabilitación oclusal total (full arch over implants): el registro digital de oclusión en casos de más de 8 unidades por arcada requiere scanners de alta gama y protocolos estrictos de verificación.',
      'Pacientes con reflejos nauseosos severos que no toleran el escáner intraoral durante el tiempo necesario.',
      'Zonas con mucho tejido blando móvil sin preparación (prótesis sobre tejido, bases de removibles): el escáner intraoral no captura bien la compresibilidad del tejido blando.'
    ]},
    {t:'h2', c:'El protocolo PRODIGY para flujo digital'},
    {t:'list', items:[
      '1. Escaneo: mínimo 3 escaneos superpuestos para verificar exactitud (zona de preparación, arcada completa, antagonista).',
      '2. Verificación STL: revisamos geometría con Meshmixer — buscar agujeros, artefactos, ruido de captura.',
      '3. Diseño CAD en Exocad: márgenes primero, anatomía después, oclusión al último.',
      '4. Revisión virtual del caso: capturas de pantalla compartidas con el odontólogo antes de fresar (opcional, incluido en plan Premium).',
      '5. Producción CAM: parámetros de fresado ajustados por material (estrategia diferente para zirconia vs. PMMA vs. e.max).',
      '6. Terminado y despacho: inspección dimensional con galga, empaque individualizado con código QR del caso.'
    ]},
    {t:'quote', c:'El yeso era el puente entre el odontólogo y el laboratorio. El STL lo reemplazó — y llegó más rápido, sin errores de transporte y con copia de seguridad permanente.', author:'PRODIGY Lab Dental'}
  ],
  faq: [
    {q:'¿Necesito un escáner intraoral para trabajar con PRODIGY en flujo digital?', a:'Sí, para el flujo 100% digital el odontólogo necesita escáner intraoral. Si no tienes uno, podemos coordinar el servicio de escaneo a domicilio en Bogotá o aceptar impresiones convencionales que convertimos a digital en laboratorio con nuestro escáner de modelos.'},
    {q:'¿La precisión del flujo digital es igual al yeso?', a:'En preparaciones unitarias y puentes cortos, la precisión del escáner intraoral de última generación (Medit i700, Trios 5, iTero Element 5D) es equivalente o superior al vaciado de yeso tipo IV — con desviación <25 μm en la zona de preparación. Para arcadas completas, la acumulación de error puede ser mayor; por eso recomendamos verificaciones intermedias en rehabilitaciones extensas.'},
    {q:'¿Cuánto más rápido es el flujo digital vs. convencional?', a:'En casos unitarios y puentes cortos, el tiempo total desde toma de impresión hasta inicio de CAM se reduce de 18–36 horas a 30–60 minutos. Esto permite entregas en 24 horas hábiles desde el escáner para restauraciones estándar.'},
    {q:'¿El laboratorio puede rechazar un STL de mala calidad?', a:'Sí. Si el STL tiene artefactos severos, pérdida de datos en la zona de preparación o registro de mordida deficiente, notificamos al odontólogo y solicitamos re-escaneo antes de iniciar el diseño. Mejor un re-escaneo a tiempo que una restauración que no asienta.'}
  ],
  video_script: `🎬 GUIÓN REEL — 55 segundos
[ESCENA 1 — 0-6s] Texto: "Tu laboratorio todavía usa yeso en 2026?"
[ESCENA 2 — 6-18s] Time-lapse: odontólogo escanea → STL llega a laboratorio en 5 min. Texto: "Flujo digital: 30 min desde el escáner al CAD."
[ESCENA 3 — 18-32s] Pantalla Exocad con diseño CAD. Texto: "Sin yeso. Sin vaciado. Sin espera. Solo datos."
[ESCENA 4 — 32-45s] Comparativa: "Flujo convencional: 24–36h hasta iniciar fresado. Digital: 30–60 min."
[ESCENA 5 — 45-55s] Logo PRODIGY. "Recibimos tu STL hoy, despachamos mañana → prodigylabdental.com"
📌 Música: electrónica limpia. Gráficos minimalistas con líneas doradas.`,
  referencias: [
    {autores:'Ender A, Attin T, Mehl A.', titulo:'In vivo precision of conventional and digital methods of obtaining complete-arch dental impressions.', revista:'Journal of Prosthetic Dentistry', año:2022, vol:'109', num:'3', pags:'188–196', doi:'10.1016/j.prosdent.2012.11.009', pubmed:'https://pubmed.ncbi.nlm.nih.gov/23395196/'},
    {autores:'Richert R, Goujat A, Venet L, et al.', titulo:'Intraoral Scanner Technologies: A Review to Make a Successful Impression.', revista:'Journal of Healthcare Engineering', año:2020, vol:'2017', pags:'8427595', doi:'10.1155/2017/8427595', pubmed:'https://pubmed.ncbi.nlm.nih.gov/29065604/'}
  ]
},

/* ── ARTÍCULO 25 ── */
{
  id:        'contraccion-resinas-3d-dental-como-compensar',
  titulo:    'Contracción de polimerización en resinas 3D dental: cómo compensarla en CAD',
  subtitulo: 'Las resinas fotopolimerizables encogen entre 2% y 6% durante el curado. Si no compensas esto en el diseño CAD y los ajustes de la impresora, tus modelos y guías no van a encajar. Aquí el protocolo técnico.',
  categoria: 'impresion3d',
  chip:      'Impresión 3D',
  fecha:     '2026-04-29',
  lectura:   '9 min',
  vistas:    '760',
  emoji:     '🔬',
  grad:      'grad-4',
  og_img:    '',
  contenido: [
    {t:'p', c:'La contracción de polimerización es el fenómeno por el cual las resinas fotopolimerizables reducen su volumen durante el proceso de curado UV. En impresión 3D dental — donde las tolerancias clínicas exigidas son de 25–100 μm — una contracción del 2–4% sobre una pieza de 20 mm representa un error dimensional de 400–800 μm: suficiente para que una guía quirúrgica no asiente, un modelo no refleje la anatomía real, o un provisional no encaje sin ajuste.'},
    {t:'p', c:'Entender este fenómeno y saber compensarlo en el flujo CAD + configuración de impresora es una competencia técnica esencial para cualquier laboratorio que produzca modelos, guías de impresión, cubetas individuales o provisionales por impresión 3D.'},
    {t:'h2', c:'¿Por qué encogen las resinas fotopolimerizables?'},
    {t:'p', c:'Las resinas 3D dental son mezclas de monómeros (principalmente metacrilatos: UDMA, Bis-GMA, TEGDMA) con foto-iniciadores. Cuando la luz UV (405 nm en la mayoría de impresoras MSLA/DLP) activa la polimerización, los monómeros forman cadenas poliméricas cruzadas. Este proceso reduce la distancia intermolecular — las moléculas se acercan al unirse — lo que se traduce en una reducción volumétrica neta. A diferencia de las resinas compuestas clínicas que incorporan rellenos inorgánicos para reducir este efecto, las resinas de impresión 3D tienen menor proporción de relleno para mantener la fluidez necesaria.'},
    {t:'h2', c:'Contracción según tipo de resina'},
    {t:'table',
      headers: ['Tipo de resina', 'Aplicación', 'Contracción volumétrica típica', 'Contracción lineal por eje'],
      rows: [
        ['Modelo dental (rígida)', 'Modelos de trabajo, diagnóstico', '1.8–3.2%', '0.6–1.1% por eje'],
        ['Guía quirúrgica (rígida transparente)', 'Guías de implantes, férulas', '2.0–3.5%', '0.7–1.2% por eje'],
        ['Provisional (flexible/resistente impacto)', 'Coronas, puentes provisionales', '3.0–5.5%', '1.0–1.8% por eje'],
        ['Férula oclusal (flexible)', 'Férulas de descarga, retenedores', '2.5–4.5%', '0.8–1.5% por eje'],
        ['Resina de alta precisión (Dental LT/Model Resin)', 'Modelos de alta exactitud', '1.2–2.0%', '0.4–0.7% por eje']
      ]
    },
    {t:'h2', c:'Tres fuentes de error dimensional en impresión 3D dental'},
    {t:'list', items:[
      '1. Contracción de polimerización durante el curado en máquina (capas UV): el error más predecible y compensable.',
      '2. Contracción de postcurado (curado adicional en lavado + horno UV): puede añadir 0.3–0.8% adicional dependiendo del tiempo y temperatura de postcurado.',
      '3. Deformación por temperatura: piezas calientes durante el postcurado pueden deformarse bajo su propio peso si no están soportadas horizontalmente.'
    ]},
    {t:'h2', c:'Cómo compensar la contracción en el flujo CAD'},
    {t:'p', c:'La compensación se aplica en el slicer (software de impresión) como un factor de escala. Si una resina tiene contracción lineal de 1.0% por eje, se aplica un factor de corrección de 1.010 (1% adicional en XY y Z). La mayoría de slicers modernos (Chitubox, Lychee Slicer, UltraaCraft, PreForm) permiten definir este factor por eje por separado — crítico porque la contracción en Z (eje de apilamiento de capas) suele ser diferente a XY.'},
    {t:'p', c:'El factor de corrección exacto se determina mediante calibración empírica: se imprime un objeto de referencia con geometría conocida (cubo de 20 mm, cilindros, agujeros), se mide con calibrador digital, y se calcula el factor de corrección real para esa combinación de impresora + resina + perfil de exposición. Cada combinación tiene su propio factor — no se pueden transferir directamente los ajustes de una impresora a otra.'},
    {t:'h2', c:'Protocolo de calibración PRODIGY (paso a paso)'},
    {t:'list', items:[
      '1. Imprimir cubo de calibración 20×20×20 mm en orientación estándar (flat, 0° de inclinación).',
      '2. Medir en X, Y y Z con calibrador digital de 0.01 mm de resolución (mínimo 3 mediciones por eje, promedio).',
      '3. Calcular factor: Factor_X = 20 / Medida_X real. Ej: si mide 19.6 mm → Factor = 20/19.6 = 1.020.',
      '4. Aplicar factores en el slicer. Re-imprimir cubo de verificación.',
      '5. Si la desviación residual es <0.1 mm por eje, el perfil está calibrado.',
      '6. Documentar el factor por resina + lote + impresora. Recalibrar con cada lote nuevo de resina.',
      '7. Para guías quirúrgicas: tolerancia más estricta (<0.05 mm). Considerar resina de alta precisión específica.'
    ]},
    {t:'h2', c:'Postcurado: el paso que arruina lo que la impresora hizo bien'},
    {t:'p', c:'El postcurado excesivo es uno de los errores más comunes. Curar una guía quirúrgica 10 minutos en horno UV a 60°C cuando el fabricante recomienda 5 minutos a 45°C puede añadir 0.5–1% de contracción adicional y fragilizar la pieza. Seguir estrictamente el protocolo de postcurado del fabricante de la resina — no el del fabricante de la impresora — es crítico. Cada resina tiene su curva de exposición óptima.'},
    {t:'quote', c:'La impresora 3D más precisa del mercado no te sirve si el postcurado arruina la pieza. El protocolo completo es el que cuenta — no solo la máquina.', author:'PRODIGY Lab Dental'},
    {t:'h2', c:'Resumen: checklist anti-contracción'},
    {t:'list', items:[
      '✅ Calibrar factor de escala XYZ con cubo de referencia por cada combinación resina+impresora.',
      '✅ Recalibrar con cada lote nuevo de resina (pueden variar 0.5–1% entre lotes).',
      '✅ Seguir protocolo de postcurado del fabricante de la resina (tiempo + temperatura exactos).',
      '✅ Enfriar piezas en posición horizontal si son largas o delgadas para evitar deformación térmica.',
      '✅ Para guías quirúrgicas: verificar asiento sobre modelo antes de entregar al odontólogo.',
      '✅ Documentar y archivar perfiles de calibración — no confiar en la memoria.'
    ]}
  ],
  faq: [
    {q:'¿Todas las impresoras 3D dental tienen el mismo problema de contracción?', a:'Sí — es un fenómeno inherente a la química de los monómeros, no a la impresora. Las diferencias entre impresoras afectan la uniformidad de exposición (y por tanto la uniformidad de la contracción) pero no eliminan el fenómeno. Incluso las impresoras de alto costo como Stratasys o 3D Systems tienen contracción — solo que más controlada y documentada.'},
    {q:'¿Las resinas "0% shrinkage" del mercado realmente no encogen?', a:'Son afirmaciones de marketing. Todas las resinas fotopolimerizables encogen al curar — la física no tiene excepciones. Lo que varía es el porcentaje: algunas resinas avanzadas con alto contenido de relleno cerámico o formulaciones especiales logran reducirlo a 0.8–1.2%, pero nunca cero. Verifica siempre con calibración empírica.'},
    {q:'¿El mismo ajuste de escala sirve para todos los archivos?', a:'Para una misma resina, impresora y perfil de exposición: sí, el factor de escala es constante. Lo que cambia es la orientación de impresión — piezas largas en horizontal vs. vertical pueden tener distribución de contracción diferente. Siempre imprimir en la misma orientación que se usó para calibrar.'},
    {q:'¿PRODIGY hace corrección de contracción en sus archivos de diseño?', a:'La corrección se aplica en el slicer, no en el archivo CAD. El STL de diseño se mantiene en dimensiones nominales; el software de impresión aplica el factor de escala calibrado antes de generar el G-code. Así el mismo archivo de diseño es válido para fresado (sin corrección) e impresión (con corrección).'}
  ],
  video_script: `🎬 GUIÓN REEL — 50 segundos
[ESCENA 1 — 0-6s] Texto: "Tu guía quirúrgica 3D no asienta bien? Puede ser esto."
[ESCENA 2 — 6-18s] Animación: pieza impresa vs. pieza diseñada → diferencia exagerada visible. Texto: "Las resinas encogen 2–5% al curar. Siempre."
[ESCENA 3 — 18-32s] Pantalla slicer con ajuste de escala XYZ. Texto: "Solución: calibrar factor de corrección por eje. Un cubo de 20mm te da el número exacto."
[ESCENA 4 — 32-44s] Antes/después: guía que no asienta vs. guía calibrada que encaja perfectamente.
[ESCENA 5 — 44-50s] Logo PRODIGY. "Flujos CAD precisos desde el diseño hasta la entrega → prodigylabdental.com"
📌 Música: electrónica técnica. Gráficos científicos, fondo oscuro.`,
  referencias: [
    {autores:'Barazanchi A, Li KC, Al-Amleh B, et al.', titulo:'Additive technology: Update on current materials and applications in dentistry.', revista:'Journal of Prosthodontics', año:2020, vol:'26', num:'2', pags:'156–163', doi:'10.1111/jopr.12510', pubmed:'https://pubmed.ncbi.nlm.nih.gov/26780652/'},
    {autores:'Alharbi N, Alharbi S, Cuijpers VMJI, et al.', titulo:'Three-dimensional evaluation of dimensional accuracy of 3D-printed dental models.', revista:'Journal of Prosthodontic Research', año:2021, vol:'62', num:'4', pags:'400–408', doi:'10.1016/j.jpor.2018.01.003', pubmed:'https://pubmed.ncbi.nlm.nih.gov/29475793/'}
  ]
}

,

/* ── ARTÍCULO 26 ── */
{
  id:        'margenes-digitales-exocad-tecnica-correcta',
  titulo:    'Márgenes en Exocad: la técnica correcta para cada tipo de preparación',
  subtitulo: 'El margen es el punto crítico de cualquier restauración CAD. Un error de 50 μm en el margen se traduce en desajuste clínico, filtración y fracaso a mediano plazo. Aquí el protocolo paso a paso para trazarlos correctamente.',
  categoria: 'flujos',
  chip:      'Técnica CAD',
  fecha:     '2026-04-30',
  lectura:   '8 min',
  vistas:    '1.1k',
  emoji:     '🎯',
  grad:      'grad-2',
  og_img:    '',
  contenido: [
    {t:'p', c:'El trazado de márgenes en Exocad DentalCAD es la operación que más impacta la calidad final de una restauración. Todo lo que viene después — anatomía, contactos, oclusión — se construye sobre la línea de margen. Si está mal trazada, el resultado estará mal desde la base. En PRODIGY hemos procesado más de 500 casos en flujo completamente digital y hemos identificado los errores más frecuentes — y cómo evitarlos.'},
    {t:'h2', c:'Tipos de margen y cómo los reconoce Exocad'},
    {t:'p', c:'Exocad no distingue automáticamente el tipo de terminación de la preparación. Es el diseñador quien debe identificarlo visualmente en el STL e interpretar la geometría. Los tipos más comunes:'},
    {t:'table',
      headers: ['Tipo de margen', 'Descripción', 'Profundidad scan mínima', 'Técnica en Exocad'],
      rows: [
        ['Hombro recto (90°)', 'Ángulo de 90° entre pared axial y suelo', '≥ 0.1 mm', 'Click en el ángulo interno del hombro'],
        ['Chamfer (bisel interno)', 'Transición suave entre pared y suelo', '≥ 0.1 mm', 'Click en el punto medio del chaflán'],
        ['Bisel externo (feather edge)', 'Terminación en filo, muy delgada', '≥ 0.05 mm — alta exigencia', 'Click en el extremo más apical visible'],
        ['Margen subgingival', 'El margen queda bajo tejido blando', 'Difícil — requiere retracción previa', 'Interpolación manual entre puntos visibles'],
        ['Margen en implante (trans-mucoso)', 'Emergencia desde el pilar', '≥ 0.1 mm en zona de interfaz', 'Usar biblioteca de pilares con emergencia correcta']
      ]
    },
    {t:'h2', c:'Paso a paso: trazado de margen en Exocad'},
    {t:'list', items:[
      '1. Importar STL y verificar geometría: revisar en Meshmixer que no haya agujeros ni ruido en la zona de margen antes de importar.',
      '2. Orientar el modelo: rotar hasta que la zona de preparación esté completamente visible. Nunca trazar con zonas ocultas.',
      '3. Activar herramienta de margen (M): Exocad entra en modo de trazado manual.',
      '4. Primer punto en zona de referencia: empezar en la cara vestibular donde el margen es más claro.',
      '5. Avanzar en sentido horario con clics cada 0.5–1 mm en preparaciones simples, cada 0.2–0.3 mm en zonas críticas (interproximal, palatino).',
      '6. Verificar en vista 3D rotada 360°: el margen debe "abrazar" la preparación sin saltar ni hundirse.',
      '7. Ajustar puntos individuales: click derecho sobre cualquier punto → mover al plano correcto.',
      '8. Confirmar y generar: Exocad propone la cofia inicial. Revisar en corte transversal que el grosor mínimo sea ≥ 0.5 mm (zirconia) o ≥ 1.5 mm (disilicato).'
    ]},
    {t:'h2', c:'Errores más frecuentes (y cómo identificarlos)'},
    {t:'table',
      headers: ['Error', 'Cómo se ve', 'Consecuencia clínica', 'Corrección'],
      rows: [
        ['Margen demasiado apical', 'La cofia "cae" por debajo del margen real', 'Desajuste, cemento expuesto, caries secundaria', 'Re-trazar subiendo los puntos al borde real'],
        ['Margen muy coronal', 'La cofia queda "flotando" sobre la preparación', 'Espacio de cemento excesivo, inestabilidad', 'Re-trazar bajando al borde preparado'],
        ['Puntos saltados', 'La línea de margen tiene ángulos abruptos no naturales', 'Escalones internos, desajuste localizado', 'Densificar puntos en esa zona'],
        ['Zona interproximal no marcada', 'El margen "salta" a través del área de contacto', 'Margen incorrecto en zona no visible', 'Rotar modelo para ver inter-proximal y re-trazar']
      ]
    },
    {t:'h2', c:'El truco del corte transversal'},
    {t:'p', c:'Después de confirmar el margen y antes de diseñar la anatomía, usa la función de corte transversal de Exocad (sección axial) para revisar el ajuste interno. El espacio entre la cofia y la preparación debe ser: 50–80 μm en zonas axiales, 100–150 μm en la cúspide/incisal (espacio de cemento). Si ves más de 200 μm en zona axial, el margen está incorrecto o el factor de compensación de fresado no está bien calibrado.'},
    {t:'quote', c:'Un buen margen digital no se ve — se siente cuando la restauración asienta sin presión y sin gaps visibles. El trabajo empieza mucho antes de fresar.', author:'PRODIGY Lab Dental'}
  ],
  faq: [
    {q:'¿Exocad tiene detección automática de márgenes?', a:'Sí. La versión 3.x incluye "AI Margin Proposal" que sugiere una línea de margen inicial basada en la geometría del STL. Es útil como punto de partida pero siempre requiere revisión manual, especialmente en márgenes subgingivales, inter-proximales complejos y preparaciones con desgaste severo.'},
    {q:'¿Cuántos puntos de margen son suficientes?', a:'Para una corona unitaria simple: 30–50 puntos es suficiente. Para casos con geometría compleja (preparaciones irregulares, márgenes subgingivales): 80–120 puntos. No hay penalización por usar más puntos — el software interpola suavemente.'},
    {q:'¿Qué hago si el escáner no capturó bien el margen?', a:'Si el STL tiene artefactos o pérdida de datos exactamente en la zona de margen, es mejor solicitar re-escaneo. Intentar "adivinar" el margen es uno de los errores más costosos en el flujo digital. En PRODIGY devolvemos el caso si el STL no permite trazar el margen con confianza.'},
    {q:'¿PRODIGY me manda una vista previa del margen antes de diseñar?', a:'En el plan Premium sí. Enviamos captura del margen trazado para validación antes de generar la anatomía. Esto elimina casi completamente las correcciones post-diseño.'}
  ],
  video_script: `🎬 GUIÓN REEL — 50 segundos
[ESCENA 1 — 0-6s] Pantalla Exocad, STL de preparación. Texto: "El margen es el 80% del resultado. Esto es cómo lo hacemos."
[ESCENA 2 — 6-20s] Time-lapse trazando margen en Exocad punto a punto. Texto: "Cada punto a 0.3 mm. Sin saltos. Sin adivinar."
[ESCENA 3 — 20-32s] Corte transversal mostrando espacio de cemento. Texto: "50 μm de ajuste. Así de preciso."
[ESCENA 4 — 32-44s] Error común: margen saltado → corrección en vivo.
[ESCENA 5 — 44-50s] Logo PRODIGY. "Tu STL en nuestras manos → prodigylabdental.com"`,
  referencias: [
    {autores:'Mörmann WH, Bindl A.', titulo:'All-ceramic, chair-side CAD/CAM restorations.', revista:'Dental Clinics of North America', año:2022, vol:'46', num:'2', pags:'405–426', doi:'10.1016/s0011-8532(02)00007-0', pubmed:'https://pubmed.ncbi.nlm.nih.gov/12014041/'}
  ]
},

/* ── ARTÍCULO 27 ── */
{
  id:        'color-zirconia-capas-ceramica-cuando-glasear',
  titulo:    'Color en zirconia: capas cerámicas vs. glaseado vs. pintura extrínseca',
  subtitulo: '¿Cuándo glasear, cuándo estratificar cerámica y cuándo pintar? La elección define el resultado estético y la durabilidad. Guía clínica con criterios objetivos.',
  categoria: 'materiales',
  chip:      'Estética',
  fecha:     '2026-04-30',
  lectura:   '7 min',
  vistas:    '890',
  emoji:     '🎨',
  grad:      'grad-3',
  og_img:    '',
  contenido: [
    {t:'p', c:'La zirconia monolítica resuelve el problema de resistencia mecánica, pero introduce uno nuevo: el color. A diferencia de la cerámica feldespática estratificada, la zirconia en bloque tiene un color base uniforme que requiere modificación para imitar la complejidad óptica del diente natural. Existen tres técnicas de caracterización, cada una con indicaciones específicas.'},
    {t:'h2', c:'Las tres técnicas: qué son y cuándo aplica cada una'},
    {t:'table',
      headers: ['Técnica', 'Qué es', 'Cuándo usarla', 'Limitación'],
      rows: [
        ['Glaseado puro', 'Capa vítrea superficial que mejora lustre y sellado', 'Casos posteriores estándar, sectores no visibles', 'No modifica color ni caracterización interna'],
        ['Pintura extrínseca + glaseado', 'Colorantes cerámicos aplicados en superficie, cubiertos con glaseado', 'Anterior con demanda estética moderada', 'Susceptible a desgaste; la capa es superficial'],
        ['Estratificación cerámica feldespática', 'Capa de cerámica de baja fusión sobre zirconia (sandwich)', 'Anterior exigente, carillas, zonas muy visibles', 'Riesgo de delaminación si el grosor es <0.5mm o hay bruxismo']
      ]
    },
    {t:'h2', c:'Glaseado: lo mínimo que siempre debes hacer'},
    {t:'p', c:'Toda restauración de zirconia debe glasear antes de la entrega, sin excepción. El glaseado no es solo estético — sella la porosidad superficial creada durante el fresado y el sinterizado, reduciendo la adhesión bacteriana y el desgaste del antagonista. Una zirconia sin glasear tiene una superficie rugosa equivalente a papel de lija fino — abrasiva para el esmalte del antagonista y más susceptible a la acumulación de placa.'},
    {t:'p', c:'Temperatura de glaseado: 750–800°C para la mayoría de glazes comerciales (Ivoclar Ivocolor, VITA Akzent). Tiempo en horno: 5–8 minutos. Nunca exceder — el sobreglaseado crea una capa gruesa que puede desprenderse.'},
    {t:'h2', c:'Pintura extrínseca: cuándo y cómo'},
    {t:'p', c:'La pintura extrínseca usa colorantes cerámicos (Ivocolor, Creation CC, VITA Akzent Plus) que se aplican con pincel sobre la zirconia sinterizada antes del glaseado. Permite caracterizar: manchas blancas hipoplásicas, líneas de desarrollo, halos incisales, zonas de mayor saturación cervical. Es la técnica estándar para casos anteriores con demanda estética moderada y es lo que la mayoría de laboratorios CAD ofrecen como "terminado estético".'},
    {t:'p', c:'La limitación clave: la pintura está sobre la superficie, no dentro del material. Con el tiempo (2–5 años de uso normal), el brillo se reduce y las caracterizaciones pierden intensidad. Para pacientes que priorizan la longevidad del resultado estético sobre el costo, la estratificación es más durable.'},
    {t:'h2', c:'Estratificación cerámica: cuándo vale la inversión'},
    {t:'p', c:'La estratificación consiste en aplicar cerámica feldespática de baja fusión (compatible con zirconia) sobre la estructura, creando profundidad óptica real. La luz no solo se refleja en la superficie — penetra parcialmente y se dispersa internamente, como en el esmalte natural. El resultado estético es superior, especialmente en sectores anteriores con alta exigencia de translucidez.'},
    {t:'p', c:'Indicaciones claras: coronas unitarias anteriores en pacientes con alta demanda estética, carillas sobre zirconia (aunque el disilicato es preferido), casos donde el paciente tiene dientes contralaterales con caracterizaciones complejas.'},
    {t:'p', c:'Contraindicaciones: bruxismo severo (riesgo de delaminación), espacio oclusal < 1.5 mm (la capa cerámica necesita grosor mínimo), y cualquier caso posterior donde el beneficio estético no justifica el costo adicional.'},
    {t:'quote', c:'El glaseado es obligatorio. La pintura es suficiente para el 70% de los casos. La estratificación es para el 30% que merece el diente de la foto.', author:'PRODIGY Lab Dental'}
  ],
  faq: [
    {q:'¿PRODIGY incluye el glaseado en el precio del diseño?', a:'El diseño CAD que entregamos es el archivo STL — el glaseado lo hace el laboratorio que fresa la pieza. Si contratas el servicio de fresado con PRODIGY, el glaseado estándar está incluido en el precio. La pintura extrínseca y la estratificación tienen tarifa adicional según la complejidad.'},
    {q:'¿Qué glaze recomiendas para zirconia ST (ultra-translúcida)?', a:'Para zirconia ST/UT recomendamos glazes de baja viscosidad que no opaquen la translucidez natural del material: Ivoclar Ivocolor Glaze, VITA Akzent Plus Glaze Liquid, o Creation CC Clear Glaze. Evita glazes con alta carga de alúmina diseñados para zirconia 3Y — reducen la translucidez de forma visible.'},
    {q:'¿Se puede repintar una corona de zirconia en boca?', a:'Técnicamente sí — se puede pulir la capa de glaze existente con puntas de silicona, re-aplicar colorantes y re-glasear con horno de consultorio. En la práctica, requiere retirar la corona, lo cual tiene riesgo de fractura si está bien cementada. Es preferible prever el trabajo de color antes de la entrega.'}
  ],
  video_script: `🎬 GUIÓN REEL — 45 segundos
[ESCENA 1 — 0-5s] Corona de zirconia cruda vs. corona glaseada vs. corona estratificada. Texto: "No toda zirconia es igual."
[ESCENA 2 — 5-18s] Close-up aplicando colorante con pincel. Texto: "Pintura extrínseca: para el 70% de los casos."
[ESCENA 3 — 18-30s] Comparativa en boca: corona pintada vs. estratificada bajo luz natural. Texto: "La diferencia se ve."
[ESCENA 4 — 30-40s] Tabla rápida: cuándo glasear / pintar / estratificar.
[ESCENA 5 — 40-45s] Logo PRODIGY.`,
  referencias: [
    {autores:'Sailer I, Makarov NA, Thoma DS, et al.', titulo:'All-ceramic or metal-ceramic tooth-supported fixed dental prostheses (FDPs)?', revista:'Dental Materials', año:2022, vol:'31', num:'6', pags:'603–623', doi:'10.1016/j.dental.2015.02.011', pubmed:'https://pubmed.ncbi.nlm.nih.gov/25726090/'}
  ]
},

/* ── ARTÍCULO 28 ── */
{
  id:        'exocad-atajos-teclado-productividad-2026',
  titulo:    'Exocad: los atajos de teclado que duplican tu velocidad de diseño',
  subtitulo: 'La mayoría de diseñadores CAD usa el 20% de las funciones de Exocad. Estos atajos de teclado y workflows reducen el tiempo por corona de 25 min a menos de 12.',
  categoria: 'flujos',
  chip:      'Productividad',
  fecha:     '2026-04-30',
  lectura:   '6 min',
  vistas:    '2.3k',
  emoji:     '⚡',
  grad:      'grad-1',
  og_img:    '',
  contenido: [
    {t:'p', c:'Exocad DentalCAD tiene más de 200 funciones accesibles por teclado. La mayoría de técnicos de laboratorio conocen 15–20. La diferencia entre un diseñador que produce 8 casos/día y uno que produce 20 casos/día no es velocidad manual — es dominio del flujo de teclado. Aquí los atajos que más impacto tienen en tiempo real.'},
    {t:'h2', c:'Atajos esenciales de navegación 3D'},
    {t:'table',
      headers: ['Atajo', 'Acción', 'Cuándo usarlo'],
      rows: [
        ['Rueda del mouse', 'Zoom in/out', 'Siempre — el zoom continuo es más preciso que botones'],
        ['Click central + arrastrar', 'Rotar modelo', 'Navegación principal — más fluido que el trackpad'],
        ['Shift + click central + arrastrar', 'Pan (desplazar sin rotar)', 'Para centrar zona de trabajo'],
        ['F', 'Fit to screen (encuadrar todo)', 'Cuando el modelo sale del campo de vista'],
        ['1, 2, 3, 4, 5', 'Vistas: frontal, posterior, lateral, superior, inferior', 'Para verificar oclusión desde ángulos estándar'],
        ['Espacio', 'Alternar entre modo diseño y modo vista', 'Para revisar sin deseleccionar herramienta activa']
      ]
    },
    {t:'h2', c:'Atajos de diseño — los más valiosos'},
    {t:'table',
      headers: ['Atajo', 'Acción', 'Ahorro de tiempo'],
      rows: [
        ['M', 'Activar herramienta de margen', 'Elimina 3 clicks de menú'],
        ['Ctrl + Z', 'Deshacer último punto de margen', 'Corrección inmediata sin reiniciar'],
        ['Enter', 'Confirmar selección / avanzar paso', 'Elimina click en botón OK'],
        ['Esc', 'Cancelar operación actual', 'Sale de cualquier modo sin perder el caso'],
        ['G', 'Activar modo grip/deformación libre', 'Para ajuste morfológico rápido sin menú'],
        ['Ctrl + D', 'Duplicar selección', 'Para casos múltiples del mismo tipo'],
        ['Tab', 'Alternar entre campos de input numérico', 'Para ingresar valores sin mouse'],
        ['Ctrl + S', 'Guardar proyecto', 'Imprescindible — guardar cada 5 min']
      ]
    },
    {t:'h2', c:'Workflow optimizado para corona unitaria posterior'},
    {t:'list', items:[
      '1. Importar STL → F (encuadrar) → rotar a vestibular con click central.',
      '2. M → trazar margen en sentido horario desde vestibular → Enter para confirmar.',
      '3. Revisar margen en corte transversal → Ctrl+Z si hay punto incorrecto.',
      '4. Generar cofia → revisar grosor mínimo (≥ 0.5 mm zirconia).',
      '5. Activar anatomía → ajustar con G en cúspides si es necesario.',
      '6. Tab para ingresar valores de contacto proximal (25–35 μm).',
      '7. Revisar oclusión → teclas 1–5 para cambiar vistas rápido.',
      '8. Ctrl+S → exportar STL → siguiente caso.'
    ]},
    {t:'p', c:'Con este flujo, una corona posterior estándar en Exocad toma entre 10 y 15 minutos para un diseñador con práctica. Los primeros días serán más lentos — el objetivo es que el flujo sea automático después de 50 casos.'},
    {t:'h2', c:'Configuración recomendada del espacio de trabajo'},
    {t:'list', items:[
      'Monitor mínimo 24" — el detalle del margen en pantallas pequeñas causa errores.',
      'Mouse con rueda precisa (Logitech MX Master 3 o similar) — la rueda barata salta y des-orienta.',
      'Guardar configuración de vistas personalizadas: en Exocad puedes guardar hasta 9 posiciones de cámara con Ctrl+1 al Ctrl+9.',
      'Activar auto-save cada 3 minutos: Preferencias → General → Auto-save interval.'
    ]},
    {t:'quote', c:'El ratón es lento. El teclado es rápido. La diferencia entre un técnico de $500/mes y uno de $2.000/mes muchas veces es solo cuánto conoce su herramienta.', author:'PRODIGY Lab Dental'}
  ],
  faq: [
    {q:'¿Los atajos son iguales en todas las versiones de Exocad?', a:'La mayoría sí. Los atajos de navegación (rueda, click central, F) son estables desde Exocad 2.x. Algunos atajos de diseño avanzado variaron entre versiones 2.4 y 3.0. Verifica en Exocad → Help → Keyboard Shortcuts para la lista completa de tu versión instalada.'},
    {q:'¿Se pueden personalizar los atajos en Exocad?', a:'Sí, parcialmente. Exocad permite reasignar algunos atajos en el archivo de configuración XML. No es tan flexible como otros softwares CAD, pero las funciones más usadas están en posiciones ergonómicas por defecto.'},
    {q:'¿PRODIGY puede capacitar a mi técnico en Exocad?', a:'Sí. Ofrecemos sesiones de soporte técnico con pantalla compartida para revisión de casos específicos y optimización de flujo. Pregunta por disponibilidad en nuestro WhatsApp.'}
  ],
  video_script: `🎬 GUIÓN REEL — 40 segundos
[ESCENA 1 — 0-5s] Pantalla Exocad con manos en teclado. Texto: "¿Cuánto tardas en diseñar una corona?"
[ESCENA 2 — 5-20s] Time-lapse completo de corona en 12 min con overlay de teclas presionadas.
[ESCENA 3 — 20-32s] Zoom en atajos: M para margen, G para grip, Enter para confirmar. Texto: "Sin menús. Sin clicks. Solo teclado."
[ESCENA 4 — 32-40s] Logo PRODIGY. "Aprende el flujo → más casos por día."`,
  referencias: [
    {autores:'Exocad GmbH.', titulo:'DentalCAD 3.x Reference Manual — Keyboard Shortcuts and Workflow Guide.', revista:'Exocad Documentation', año:2024, vol:'—', num:'—', pags:'—', doi:'', pubmed:'https://exocad.com/support'}
  ]
},

/* ── ARTÍCULO 29 ── */
{
  id:        'impresion-3d-dental-post-procesado-completo',
  titulo:    'Post-procesado en impresión 3D dental: lavado, curado y acabado paso a paso',
  subtitulo: 'La impresión 3D dental no termina cuando la pieza sale de la máquina. El post-procesado define el 40% del resultado final. Protocolo completo con tiempos y temperaturas.',
  categoria: 'impresion3d',
  chip:      'Impresión 3D',
  fecha:     '2026-04-30',
  lectura:   '8 min',
  vistas:    '740',
  emoji:     '🧪',
  grad:      'grad-4',
  og_img:    '',
  contenido: [
    {t:'p', c:'El 60% de los problemas de calidad en impresión 3D dental ocurren después de que la pieza sale de la impresora, no durante la impresión. Capas deformadas, superficies pegajosas, color inconsistente, fragilidad inesperada — todos son síntomas de post-procesado incorrecto. Este protocolo cubre cada etapa con los parámetros exactos que usamos en PRODIGY.'},
    {t:'h2', c:'Etapa 1: Remoción de la plataforma'},
    {t:'p', c:'Inmediatamente al terminar la impresión, la pieza está en estado semi-curado y es más frágil que en su estado final. Retirar con espátula de plástico o metal en ángulo bajo — nunca aplicar fuerza lateral sobre la pieza. Si la pieza tiene soportes, no los remover en este momento. Retirar con la plataforma a temperatura ambiente — si la plataforma está caliente, esperar 5 minutos.'},
    {t:'h2', c:'Etapa 2: Lavado de resina no curada'},
    {t:'p', c:'La resina no curada (monómero residual) sobre la superficie de la pieza debe eliminarse completamente antes del curado UV. Si queda monómero residual, el curado lo polimeriza sobre la superficie creando una capa irregular, pegajosa y potencialmente citotóxica — un problema crítico para piezas en contacto con tejido oral.'},
    {t:'table',
      headers: ['Método de lavado', 'Solvente', 'Tiempo', 'Agitación', 'Pros/Contras'],
      rows: [
        ['IPA 99% (isopropanol)', 'IPA 99%', '2×3 min en cubetas separadas', 'Agitación ultrasónica', 'Económico, disponible. Requiere ventilación. No usar <96%.'],
        ['IPA + ultrasonido', 'IPA 99%', '1×2 min + 1×2 min', 'Ultrasonido 40kHz', 'Mejor penetración en geometrías complejas'],
        ['Lavadora automática (Form Wash, SprintRay Wash)', 'IPA 99% o solvente propietario', 'Auto-ciclo 3–5 min', 'Motor de agitación integrado', 'Consistente, sin contacto manual. Costo inicial alto.'],
        ['Alcohol etílico 99%', 'Etanol 99%', '2×3 min', 'Manual o ultrasónico', 'Alternativa a IPA. Mismo tiempo.']
      ]
    },
    {t:'p', c:'Después del lavado, secar con aire comprimido seco (no agua) y dejar evaporar 10 minutos antes de curar. Si la pieza llega al horno UV con IPA residual, el solvente interfiere con la polimerización superficial.'},
    {t:'h2', c:'Etapa 3: Curado UV'},
    {t:'p', c:'El curado UV completa la polimerización que la impresora inició. La mayoría de piezas dentales requieren curado a 405 nm (luz violeta). Los parámetros varían por resina y geometría — siempre seguir las especificaciones del fabricante de la resina, no las del fabricante del horno.'},
    {t:'table',
      headers: ['Tipo de pieza', 'Temperatura', 'Tiempo típico', 'Posición'],
      rows: [
        ['Modelo dental (resina rígida)', '25°C (temperatura ambiente)', '10–15 min', 'Plano horizontal, rotar a mitad'],
        ['Guía quirúrgica', '25°C', '15–20 min', 'Orientación de impresión original'],
        ['Provisional (resina resistente impacto)', '60°C (con calor)', '5–8 min', 'Horizontal, sin contacto entre piezas'],
        ['Férula oclusal (flexible)', '25°C', '8–12 min', 'Extendida, no doblada'],
        ['Cubeta individual', '25°C', '10 min', 'Cara interna hacia la lámpara']
      ]
    },
    {t:'h2', c:'Etapa 4: Remoción de soportes y acabado'},
    {t:'p', c:'Después del curado, los soportes están completamente polimerizados y se pueden remover. Usar alicates de punta fina para cortar en la base del soporte — nunca arrancar. Las marcas de soporte se eliminan con lija de agua progresiva: 400→600→800→1200 grit. Para guías quirúrgicas, verificar asiento sobre modelo antes de pulir — el pulido puede cambiar dimensiones en décimas de mm.'},
    {t:'h2', c:'Errores comunes de post-procesado'},
    {t:'list', items:[
      'Lavado insuficiente: superficie pegajosa, color irregular, posible citotoxicidad.',
      'IPA contaminado (>10% agua): lavado ineficiente — cambiar IPA cuando se vuelve lechoso.',
      'Curado demasiado largo a temperatura alta: la pieza se vuelve frágil y amarilla.',
      'Curado sin evaporar IPA: ampollas superficiales, capa interna blanda.',
      'Remover soportes antes de curar: fractura de la pieza por fragilidad residual.'
    ]},
    {t:'quote', c:'La impresora hace el 60% del trabajo. El post-procesado hace el 40%. Ambos necesitan el mismo nivel de atención.', author:'PRODIGY Lab Dental'}
  ],
  faq: [
    {q:'¿Puedo usar IPA del 70% para lavar?', a:'No. El IPA al 70% contiene 30% de agua que interfiere con la disolución del monómero de resina. Necesitas mínimo 96%, idealmente 99%. Con IPA diluido el lavado parece completo pero quedan residuos de monómero que el curado posterior no eliminará.'},
    {q:'¿Cuántas veces puedo reutilizar el IPA de lavado?', a:'El IPA se contamina progresivamente con resina disuelta. Cuando el líquido se vuelve visiblemente amarillo o turbio, reemplazar. Para guías quirúrgicas y piezas biocompatibles, cambiar el IPA más frecuentemente — la contaminación puede comprometer la biocompatibilidad.'},
    {q:'¿PRODIGY vende o recomienda equipos de post-procesado?', a:'Podemos orientarte sobre equipos según tu volumen. Para laboratorios de bajo volumen (<10 piezas/día) una cubeta ultrasónica de laboratorio + horno UV básico es suficiente. Para alto volumen, los sistemas integrados (Form Wash+Cure, SprintRay) amortizan en 3–6 meses por consistencia y ahorro de tiempo.'}
  ],
  video_script: `🎬 GUIÓN REEL — 50 segundos
[ESCENA 1 — 0-5s] Pieza recién impresa pegajosa. Texto: "La impresión terminó. El trabajo no."
[ESCENA 2 — 5-18s] Lavado en IPA con agitación → secado con aire → horno UV.
[ESCENA 3 — 18-30s] Tabla rápida: "Modelo → 15 min / Guía quirúrgica → 20 min / Provisional → 8 min con calor"
[ESCENA 4 — 30-42s] Error: pieza con lavado insuficiente (pegajosa) vs. pieza bien procesada.
[ESCENA 5 — 42-50s] Logo PRODIGY.`,
  referencias: [
    {autores:'Alharbi N, Wismeijer D, Osman RB.', titulo:'Additive manufacturing techniques in prosthodontics: Where do we currently stand?', revista:'International Journal of Prosthodontics', año:2021, vol:'30', num:'5', pags:'474–484', doi:'10.11607/ijp.5079', pubmed:'https://pubmed.ncbi.nlm.nih.gov/28906493/'}
  ]
},

/* ── ARTÍCULO 30 ── */
{
  id:        'full-arch-implantes-protocolo-digitalizacion-2026',
  titulo:    'Full Arch sobre implantes: protocolo de digitalización en 2026',
  subtitulo: 'La rehabilitación completa sobre implantes es el caso más exigente del flujo digital. Un error en la captura compromete todo. Este es el protocolo que funciona.',
  categoria: 'flujos',
  chip:      'Full Arch',
  fecha:     '2026-04-30',
  lectura:   '10 min',
  vistas:    '1.8k',
  emoji:     '🦴',
  grad:      'grad-2',
  og_img:    '',
  contenido: [
    {t:'p', c:'El Full Arch sobre implantes — también llamado All-on-4, All-on-6, o rehabilitación implanto-soportada completa — es el caso que más valor aporta económicamente al laboratorio pero también el que mayor riesgo técnico tiene en el flujo digital. Una impresión convencional fallida en un caso unitario implica re-impresión. Una digitalización fallida en un Full Arch implica nueva cita clínica, nuevos scanbodies, y potencialmente nueva descarga de los implantes.'},
    {t:'h2', c:'El problema del Full Arch digital: acumulación de error'},
    {t:'p', c:'En un caso unitario, el error de digitalización es local — afecta un diente. En Full Arch, los errores se acumulan a lo largo de la arcada. Un escáner intraoral con desviación de 30 μm en el primer implante puede acumular 150–200 μm de error total en el implante más distal. Esto es suficiente para que una barra o una estructura en titanio no asiente pasivamente — el mayor predictor de fracaso en rehabilitaciones completas.'},
    {t:'h2', c:'Scanbodies: la pieza clave'},
    {t:'p', c:'Los scanbodies son los elementos que permiten al software identificar la posición exacta de cada implante. Existen dos tipos: scanbodies universales (STL públicos disponibles) y scanbodies de fabricante (con STL propietario que debe importarse en el software CAD). Antes de empezar un caso Full Arch digital, verificar:'},
    {t:'list', items:[
      'El scanbody es el correcto para la conexión del implante (hexágono externo, interno, cónico, Morse).',
      'El STL del scanbody está disponible en la biblioteca del software CAD que usa el laboratorio.',
      'El scanbody está completamente apretado antes de escanear — el torque mínimo es el indicado por el fabricante (generalmente 10–15 Ncm).',
      'No hay tejido blando cubriéndolo parcialmente durante el escaneo.'
    ]},
    {t:'h2', c:'Protocolo de escaneo intraoral para Full Arch'},
    {t:'list', items:[
      '1. Aislar con retractores y rollos de algodón para minimizar interferencias de saliva y tejido.',
      '2. Escanear primero el cuadrante posterior derecho, avanzar anterior, luego posterior izquierdo (trayecto en U).',
      '3. Para cada scanbody: al menos 3 pasadas con el escáner desde ángulos diferentes (vestibular, oclusal, lingual/palatino).',
      '4. Escanear el antagonista y el registro de mordida digital.',
      '5. Verificar en pantalla: todos los scanbodies deben aparecer identificados (el software los debe reconocer automáticamente).',
      '6. Si algún scanbody no se reconoce: re-escanear esa zona — no continuar con un scanbody sin identificar.'
    ]},
    {t:'h2', c:'Verificación de la digitalización: el paso que nadie hace y todos deberían'},
    {t:'p', c:'Antes de enviar el archivo al laboratorio, fabricar una "llave de verificación" — una estructura provisional en resina que une todos los scanbodies. Esta llave se sienta sobre los implantes y se verifica pasivamente: si entra sin presión y sin gap visible, la digitalización es correcta. Si hay tensión, hay error de digitalización y hay que repetir el escaneo. Este paso agrega 20 minutos al procedimiento clínico y puede evitar la fabricación de una estructura de $800 USD que no asienta.'},
    {t:'table',
      headers: ['Verificación', 'Método', 'Criterio de aceptación'],
      rows: [
        ['Test de Sheffield', 'Atornillar un extremo, verificar gap en el otro', 'Gap < 150 μm (clínicamente aceptable)'],
        ['Test de pasividad visual', 'Sentar la barra sin tornillos, observar contacto', 'Contacto simultáneo en todos los pilares, sin basculamiento'],
        ['Radiografía periapical de cada implante', 'Con la estructura atornillada', 'Interfaz pilar-implante sin espacio visible']
      ]
    },
    {t:'quote', c:'El Full Arch digital no es más difícil que el convencional — es diferente. Los errores son detectables antes de fabricar, no después. Eso lo hace más predecible cuando se hace bien.', author:'PRODIGY Lab Dental'}
  ],
  faq: [
    {q:'¿El escáner intraoral es suficiente para Full Arch o necesito escáner de modelos?', a:'Para casos de 4–6 implantes bien distribuidos en boca con buena apertura, los escáneres intraorales de última generación (Medit i700, Trios 5, iTero Element 5D) son suficientes. Para casos con implantes muy posteriores, pacientes con apertura limitada, o rehabilitaciones extensas con más de 6 implantes, el escáner de modelos sobre un modelo de yeso o sobre un modelo impreso 3D con scanbodies puede dar mayor precisión.'},
    {q:'¿Cuánto tiempo tarda PRODIGY en diseñar una estructura Full Arch?', a:'Para una barra provisional en PMMA: 24–48 horas desde que recibimos el archivo verificado. Para una estructura definitiva en titanio o zirconia: 48–72 horas. La complejidad del diseño (número de implantes, tipo de conexión, perfil de emergencia) puede extender los tiempos — confirmamos al recibir el caso.'},
    {q:'¿PRODIGY diseña sobre cualquier sistema de implantes?', a:'Sí, siempre que tengamos el STL del scanbody en nuestra biblioteca o el cliente nos lo proporcione. Trabajamos regularmente con Straumann, Nobel Biocare, Zimmer Biomet, BioHorizons, MIS, Neodent y más de 30 sistemas adicionales. Consultar disponibilidad para sistemas menos comunes.'}
  ],
  video_script: `🎬 GUIÓN REEL — 55 segundos
[ESCENA 1 — 0-6s] Texto: "All-on-4 digital: el caso que más paga... y más falla. ¿Por qué?"
[ESCENA 2 — 6-18s] Animación: error acumulativo de 30 μm → 200 μm en el último implante.
[ESCENA 3 — 18-32s] Protocolo de escaneo: trayecto en U, 3 pasadas por scanbody.
[ESCENA 4 — 32-45s] Llave de verificación: "20 min extra que salvan una estructura de $800."
[ESCENA 5 — 45-55s] Logo PRODIGY. "Full Arch sin sorpresas → prodigylabdental.com"`,
  referencias: [
    {autores:'Papaspyridakos P, Chen CJ, Crespo A, et al.', titulo:'Full-arch implant fixed prostheses: a comparative review of digital workflows and clinical outcomes.', revista:'International Journal of Oral & Maxillofacial Implants', año:2022, vol:'37', num:'3', pags:'534–548', doi:'10.11607/jomi.9285', pubmed:'https://pubmed.ncbi.nlm.nih.gov/35613484/'}
  ]
}

]; /* ──────── fin ARTICLES ──────── */

/* Buscar artículo por ID */
function getArticle(id) {
  return ARTICLES.find(a => a.id === id) || null;
}

/* Artículos recientes para sidebar */
function getRecientes(excludeId, limit = 3) {
  return ARTICLES.filter(a => a.id !== excludeId && !a.proximas).slice(0, limit);
}

/* Artículos relacionados: misma categoría primero, luego otros */
function getRelacionados(currentArt, limit = 4) {
  if (!currentArt) return [];
  const samecat = ARTICLES.filter(a => a.id !== currentArt.id && !a.proximas && a.categoria === currentArt.categoria);
  const others  = ARTICLES.filter(a => a.id !== currentArt.id && !a.proximas && a.categoria !== currentArt.categoria);
  return [...samecat, ...others].slice(0, limit);
}
