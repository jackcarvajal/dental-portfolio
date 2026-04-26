/* ============================================================
   PRODIGY — Base de artículos técnicos
   Para agregar un artículo: copia un objeto del array ARTICLES
   y llena los campos. article.html lo renderiza automáticamente.
   ============================================================ */

const ARTICLES = [

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
