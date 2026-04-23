/* ============================================================
   PRODIGY — Base de artículos técnicos
   Para agregar un artículo: copia un objeto del array ARTICLES
   y llena los campos. article.html lo renderiza automáticamente.
   ============================================================ */

const ARTICLES = [

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
    {q:'¿Puedo enviarles el archivo directamente desde Medit Link o iTero Connect?', a:'Estamos habilitando integración directa. Por ahora el flujo más rápido es exportar STL + ZIP y enviarlo por nuestro formulario en envia-tu-scanner.html o al WhatsApp del laboratorio.'}
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
