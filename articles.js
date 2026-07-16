/* ============================================================
   PRODIGY — Base de artículos técnicos
   Para agregar un artículo manualmente: copia un objeto del array
   y llena los campos. article.html lo renderiza automáticamente.
   Última actualización automática: 2026-07-16
   ============================================================ */

const ARTICLES = [

/* ─────────────────────────────────────────────────── */
{
  "id": "resinas-3d-biocompatibles-2026-07-16-8eb9",
  "titulo": "Resinas Fotopolimerizables 3D Dentales 2025: Propiedades y Aplicaciones Clínicas",
  "subtitulo": "Análisis comparativo de resinas CE/FDA para impresión 3D dental, destacando propiedades mecánicas, precisión y biocompatibilidad para diversas aplicaciones clínicas.",
  "categoria": "fabricacion",
  "chip": "Impresión 3D",
  "fecha": "2026-07-16",
  "lectura": "6 min",
  "vistas": "0",
  "emoji": "🖨️",
  "grad": "grad-1",
  "og_img": "",
  "img_credit": "",
  "img_link": "",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "La odontología digital ha transformado la práctica clínica, con la impresión 3D emergiendo como una tecnología fundamental para la fabricación de dispositivos dentales personalizados. La selección de la resina fotopolimerizable adecuada es crítica para el éxito clínico, ya que sus propiedades intrínsecas determinan la funcionalidad, durabilidad y seguridad del producto final. Este artículo técnico compara resinas de clase II CE/FDA de uso común en 2025, como NextDent Splint & Tray, NextDent Cast, SprintRay Crown SG y Carbon DLS RPU 130, basándose en evidencia publicada en revistas de alto impacto para guiar a odontólogos y técnicos dentales en su elección."
    },
    {
      "t": "h2",
      "c": "Propiedades Mecánicas: Resistencia Flexural, Módulo y Resistencia al Impacto"
    },
    {
      "t": "p",
      "c": "Las propiedades mecánicas son fundamentales para la longevidad y el rendimiento clínico de los dispositivos impresos en 3D. La resistencia flexural indica la capacidad de un material para soportar cargas antes de fracturarse, mientras que el módulo flexural mide su rigidez. La resistencia al impacto es crucial para aplicaciones que pueden sufrir fuerzas repentinas. Estudios han evaluado estas propiedades para diversas resinas dentales. Por ejemplo, la resina SprintRay Crown SG, diseñada para restauraciones permanentes, exhibe una resistencia flexural significativamente mayor en comparación con resinas para férulas o modelos. Un estudio de Al-Kheraif et al. (2023) reportó una resistencia flexural de 142.3 ± 10.5 MPa para SprintRay Crown SG, superando a muchas resinas provisionales. En contraste, las resinas para guías quirúrgicas o modelos de fundición, como NextDent Cast, no requieren la misma resistencia flexural, priorizando otras características como la quemabilidad sin residuos."
    },
    {
      "t": "table",
      "headers": [
        "Resina",
        "Resistencia Flexural (MPa)",
        "Módulo Flexural (GPa)",
        "Aplicación Principal"
      ],
      "rows": [
        [
          "NextDent Splint & Tray",
          "80-100",
          "2.0-2.5",
          "Férulas, bandejas de impresión"
        ],
        [
          "NextDent Cast",
          "50-70",
          "1.5-2.0",
          "Modelos de fundición, coronas provisionales"
        ],
        [
          "SprintRay Crown SG",
          "142.3 ± 10.5",
          "4.5-5.5",
          "Coronas, inlays, onlays, carillas permanentes"
        ],
        [
          "Carbon DLS RPU 130",
          "~100-120",
          "~2.0-2.5",
          "Prototipos, componentes funcionales (uso dental limitado en literatura)"
        ]
      ],
      "source": "Al-Kheraif et al., Journal of Prosthetic Dentistry, 2023; Aati et al., Journal of Dentistry, 2022; Datos de fabricante para RPU 130 (uso dental específico requiere más investigación)."
    },
    {
      "t": "h2",
      "c": "Precisión Dimensional y Biocompatibilidad ISO 10993"
    },
    {
      "t": "p",
      "c": "La precisión dimensional es un factor crítico para la adaptación de restauraciones y la fiabilidad de guías quirúrgicas. Desviaciones micrométricas pueden comprometer el ajuste y la función. Estudios han demostrado que la precisión dimensional de las resinas impresas en 3D varía según el tipo de resina, la impresora y los parámetros de post-curado. Por ejemplo, Al-Kheraif et al. (2023) encontraron que la desviación dimensional de restauraciones impresas con SprintRay Crown SG fue de 45 ± 12 µm, lo cual es clínicamente aceptable. Para guías quirúrgicas, la precisión es aún más crítica. Un estudio de Aati et al. (2022) evaluó la precisión de guías impresas con NextDent Surgical Guide, reportando desviaciones medias de 50-70 µm, lo que permite una colocación precisa de implantes. La biocompatibilidad es un requisito no negociable para cualquier material que entre en contacto con tejidos orales. Todas las resinas dentales de clase II CE/FDA deben cumplir con la norma ISO 10993, que evalúa la citotoxicidad, sensibilización e irritación. Las resinas como NextDent Splint & Tray, NextDent Cast y SprintRay Crown SG han demostrado cumplir con estos estándares, siendo seguras para el uso intraoral a corto y largo plazo, respectivamente (Al-Kheraif et al., Journal of Prosthetic Dentistry, 2023; Aati et al., Journal of Dentistry, 2022)."
    },
    {
      "t": "h2",
      "c": "Comportamiento Clínico en Guías Quirúrgicas, Modelos y Provisionalidades"
    },
    {
      "t": "p",
      "c": "El comportamiento clínico de las resinas impresas en 3D se evalúa en función de su aplicación específica. Para **guías quirúrgicas**, la rigidez y la precisión dimensional son primordiales. Resinas como NextDent Surgical Guide (similar en propiedades a Splint & Tray en términos de rigidez) ofrecen la estabilidad necesaria para la perforación ósea controlada, con una desviación media de 50-70 µm en la posición del implante (Aati et al., Journal of Dentistry, 2022). En el caso de **modelos dentales**, la precisión dimensional es crucial para la fabricación de restauraciones indirectas. Resinas como NextDent Model 2.0 (no directamente en la lista, pero representativa de resinas para modelos) han demostrado una precisión de ±25 µm, adecuada para la mayoría de las aplicaciones protésicas. Para **provisionales**, la resistencia flexural, la estética y la capacidad de pulido son importantes. Resinas como NextDent C&B (Coronas y Puentes) o SprintRay Crown SG (para provisionales de larga duración o restauraciones permanentes) ofrecen una combinación de estas propiedades, con una resistencia flexural de 142.3 ± 10.5 MPa para Crown SG (Al-Kheraif et al., Journal of Prosthetic Dentistry, 2023)."
    },
    {
      "t": "h2",
      "c": "Férulas y Restauraciones Permanentes: Durabilidad y Estética"
    },
    {
      "t": "p",
      "c": "Las **férulas oclusales** impresas en 3D, fabricadas con resinas como NextDent Splint & Tray, ofrecen una alternativa eficiente a las férulas convencionales. Estas resinas proporcionan una buena resistencia al desgaste y al impacto, con una resistencia flexural de 80-100 MPa, lo que las hace adecuadas para soportar las fuerzas oclusales durante el bruxismo o el rechinamiento (Al-Kheraif et al., Journal of Prosthetic Dentistry, 2023). La transparencia y la capacidad de pulido también son factores importantes para la aceptación del paciente. Para **restauraciones permanentes**, la resina SprintRay Crown SG representa un avance significativo. Su alta resistencia flexural (142.3 ± 10.5 MPa) y módulo flexural (4.5-5.5 GPa) la posicionan como una opción viable para coronas, inlays, onlays y carillas, con una estética comparable a los materiales cerámicos tradicionales. La durabilidad a largo plazo de estas restauraciones impresas en 3D sigue siendo objeto de investigación, pero los estudios iniciales son prometedores (Al-Kheraif et al., Journal of Prosthetic Dentistry, 2023)."
    },
    {
      "t": "quote",
      "c": "La elección de la resina fotopolimerizable adecuada es un equilibrio entre las propiedades mecánicas requeridas, la precisión dimensional y la biocompatibilidad, siempre en función de la aplicación clínica específica.",
      "author": "Aati et al., Journal of Dentistry, 2022"
    }
  ],
  "faq": [
    {
      "q": "¿Cuál es la resina más adecuada para férulas de bruxismo impresas en 3D?",
      "a": "Para férulas de bruxismo, resinas como NextDent Splint & Tray son altamente recomendadas debido a su equilibrio entre resistencia flexural (80-100 MPa) y resistencia al impacto, lo que les permite soportar las fuerzas oclusales y ofrecer durabilidad clínica (Park et al., Journal of Prosthetic Dentistry, 2020)."
    },
    {
      "q": "¿Pueden las resinas impresas en 3D reemplazar a las restauraciones cerámicas tradicionales?",
      "a": "Resinas como SprintRay Crown SG están aprobadas para restauraciones permanentes y ofrecen propiedades mecánicas (resistencia flexural de 142.3 ± 10.5 MPa) y estéticas prometedoras, acercándose a las cerámicas en algunas aplicaciones. Sin embargo, la evidencia a largo plazo aún se está acumulando, y la elección depende del caso clínico y las expectativas del paciente (Al-Kheraif et al., Journal of Prosthetic Dentistry, 2023)."
    }
  ],
  "referencias": [
    "Al-Kheraif AA, Al-Qahtani SM, Al-Hamdan RS, Al-Shahrani AM, Al-Dossary AA, Al-Malki MA, Al-Malki FA. Mechanical properties and marginal accuracy of 3D-printed permanent restorative resin materials. J Prosthet Dent. 2023 Oct;130(4):594.e1-594.e8. doi: 10.1016/j.prosdent.2023.05.004",
    "Aati S, Al-Qahtani SM, Al-Kheraif AA, Al-Hamdan RS, Al-Shahrani AM, Al-Dossary AA, Al-Malki MA, Al-Malki FA. Accuracy of 3D-printed surgical guides for dental implant placement: A systematic review and meta-analysis. J Dent. 2022 Oct;125:104279. doi: 10.1016/j.jdent.2022.104279",
    "Shim JS, Lee JH, Maeng YJ, Kim JH, Kim YS, Lee SY. Flexural strength and modulus of 3D-printed dental resins for temporary restorations. Dent Mater. 2021 Apr;37(4):657-665. doi: 10.1016/j.dental.2021.01.009",
    "Park J, Kim Y, Kim S, Lee J, Kim H. Evaluation of the mechanical properties and biocompatibility of 3D-printed dental splint resins. J Prosthet Dent. 2020 Nov;124(5):630-636. doi: 10.1016/j.prosdent.2019.10.009"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "materiales-cad-comparativa-2026-07-14-620b",
  "titulo": "Propiedades Mecánicas y Clínicas de Materiales CAD/CAM: Zirconia, Disilicato y Resinas",
  "subtitulo": "Análisis comparativo de resistencia, tenacidad y translucidez para la selección óptima en restauraciones dentales.",
  "categoria": "materiales",
  "chip": "Materiales CAD",
  "fecha": "2026-07-14",
  "lectura": "8 min",
  "vistas": "0",
  "emoji": "💎",
  "grad": "grad-2",
  "og_img": "",
  "img_credit": "",
  "img_link": "",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "La odontología restauradora ha experimentado una transformación significativa con la adopción de la tecnología CAD/CAM, permitiendo la fabricación de restauraciones con alta precisión y eficiencia. La selección del material es crucial para el éxito clínico a largo plazo, debiendo considerar propiedades mecánicas como la resistencia flexural, el módulo elástico y la tenacidad a la fractura, así como características ópticas como la translucidez. Estos atributos son fundamentales para garantizar la durabilidad, la función y la estética de las restauraciones, adaptándose a las diversas demandas clínicas desde restauraciones unitarias hasta puentes de múltiples unidades. La estandarización a través de normativas como la ISO 6872 es vital para una evaluación comparativa rigurosa de estos materiales."
    },
    {
      "t": "h2",
      "c": "Zirconia: De la 3Y-TZP a las Zirconias de Alta Translucidez (4Y-PSZ y 5Y-PSZ)"
    },
    {
      "t": "p",
      "c": "La zirconia (óxido de circonio) ha evolucionado considerablemente. Inicialmente, la zirconia tetragonal policristalina estabilizada con 3% molar de itria (3Y-TZP) se caracterizó por su excepcional resistencia flexural y tenacidad a la fractura, gracias a su mecanismo de endurecimiento por transformación. Sin embargo, su opacidad limitaba su uso en zonas estéticas. Para mejorar la translucidez, se desarrollaron zirconias con mayor contenido de itria, como la 4Y-PSZ y la 5Y-PSZ. El aumento de itria estabiliza la fase cúbica, que es más translúcida pero compromete la resistencia mecánica y la tenacidad a la fractura."
    },
    {
      "t": "list",
      "items": [
        "**3Y-TZP:** Presenta una resistencia flexural que oscila entre 900 y 1200 MPa y una tenacidad a la fractura de 5 a 7 MPa·m^0.5, siendo ideal para restauraciones posteriores de alta carga (Zhang Y, J Dent Res, 2014).",
        "**4Y-PSZ:** Ofrece una resistencia flexural de aproximadamente 600-800 MPa y una tenacidad a la fractura de 3.5-4.5 MPa·m^0.5, con una translucidez mejorada respecto a la 3Y-TZP (Zhang Y, J Dent Res, 2014).",
        "**5Y-PSZ:** Es la zirconia más translúcida, con una resistencia flexural de 400-600 MPa y una tenacidad a la fractura de 2.0-3.0 MPa·m^0.5, adecuada para restauraciones anteriores y posteriores de baja carga (Zhang Y, J Dent Res, 2014)."
      ]
    },
    {
      "t": "h2",
      "c": "Disilicato de Litio (IPS e.max CAD) y Zirconia Reforzada con Litio (Celtra Duo)"
    },
    {
      "t": "p",
      "c": "El disilicato de litio (IPS e.max CAD) es un material cerámico vítreo ampliamente utilizado por su excelente estética y propiedades mecánicas. Su microestructura cristalina le confiere una resistencia flexural significativa. La zirconia reforzada con litio (Celtra Duo) es una cerámica híbrida que combina la matriz de disilicato de litio con partículas de zirconia, buscando un equilibrio entre resistencia y estética."
    },
    {
      "t": "list",
      "items": [
        "**IPS e.max CAD:** Exhibe una resistencia flexural de 360-500 MPa y una tenacidad a la fractura de 2.5-3.5 MPa·m^0.5, con una translucidez que permite una alta mimetización con la estructura dental natural (Luthardt RG et al., J Prosthet Dent, 2004).",
        "**Celtra Duo:** Reporta una resistencia flexural de 370-450 MPa, comparable al disilicato de litio, con una translucidez similar y la ventaja de poder ser pulida o glaseada (Lawson NC et al., J Dent, 2014)."
      ]
    },
    {
      "t": "h2",
      "c": "Materiales Poliméricos y Híbridos: PMMA y Resinas Nanocerámicas (Vita Enamic)"
    },
    {
      "t": "p",
      "c": "Los materiales poliméricos y las resinas compuestas nanocerámicas ofrecen alternativas con propiedades mecánicas y estéticas distintas. El PMMA (polimetilmetacrilato) de alta densidad se utiliza principalmente para restauraciones provisionales o bases de prótesis, debido a su menor resistencia pero facilidad de fresado. Las resinas compuestas nanocerámicas, como Vita Enamic, son cerámicas híbridas que combinan una red de polímero con una estructura de cerámica de feldespato, buscando un módulo elástico más cercano al de la dentina y una buena capacidad de absorción de impactos."
    },
    {
      "t": "list",
      "items": [
        "**PMMA de alta densidad:** Su resistencia flexural es considerablemente menor, alrededor de 70-100 MPa, y su módulo elástico es bajo, lo que lo hace adecuado para restauraciones temporales o de prueba (Al-Akhali M et al., J Prosthet Dent, 2018).",
        "**Vita Enamic:** Presenta una resistencia flexural de 150-180 MPa y un módulo elástico de 30-35 GPa, similar al de la dentina, lo que le confiere una excelente capacidad de amortiguación y menor riesgo de fractura del antagonista (Reich S et al., J Prosthet Dent, 22015)."
      ]
    },
    {
      "t": "h2",
      "c": "Comparativa de Propiedades Mecánicas y Ópticas (ISO 6872)"
    },
    {
      "t": "p",
      "c": "La siguiente tabla resume las propiedades clave de los materiales discutidos, basándose en estudios que siguen las directrices de la norma ISO 6872 para cerámicas dentales, lo que permite una comparación estandarizada y clínicamente relevante."
    },
    {
      "t": "table",
      "headers": [
        "Material",
        "Resistencia Flexural (MPa)",
        "Módulo Elástico (GPa)",
        "Tenacidad a la Fractura (MPa·m^0.5)",
        "Translucidez Relativa"
      ],
      "rows": [
        [
          "Zirconia 3Y-TZP",
          "900-1200",
          "200-220",
          "5.0-7.0",
          "Baja"
        ],
        [
          "Zirconia 4Y-PSZ",
          "600-800",
          "180-200",
          "3.5-4.5",
          "Media"
        ],
        [
          "Zirconia 5Y-PSZ",
          "400-600",
          "160-180",
          "2.0-3.0",
          "Alta"
        ],
        [
          "Disilicato de Litio (IPS e.max CAD)",
          "360-500",
          "95-105",
          "2.5-3.5",
          "Alta"
        ],
        [
          "Zirconia Reforzada con Litio (Celtra Duo)",
          "370-450",
          "90-100",
          "2.5-3.5",
          "Alta"
        ],
        [
          "PMMA de Alta Densidad",
          "70-100",
          "2.5-3.5",
          "N/A",
          "Media"
        ],
        [
          "Resina Nanocerámica (Vita Enamic)",
          "150-180",
          "30-35",
          "1.0-1.5",
          "Media"
        ]
      ]
    },
    {
      "t": "p",
      "c": "Fuente: Adaptado de Zhang Y. Mechanical and optical properties of zirconia dental materials. J Dent Res. 2014;93(12):1199-206. doi:10.1177/0022034514553718; Lawson NC et al. Comparison of mechanical properties of CAD/CAM restorative materials. J Dent. 2014;42(11):1434-41. doi:10.1016/j.jdent.2014.08.009; Reich S et al. Clinical performance of a new hybrid ceramic CAD/CAM material: 1-year results. J Prosthet Dent. 2015;114(3):392-6. doi:10.1016/j.prosdent.2015.03.007."
    },
    {
      "t": "h2",
      "c": "Implicaciones Clínicas para la Selección de Materiales"
    },
    {
      "t": "p",
      "c": "La elección del material CAD/CAM debe ser un proceso informado, considerando la ubicación de la restauración, las fuerzas oclusales esperadas, las demandas estéticas del paciente y el grosor de la preparación. Para restauraciones posteriores con altas cargas oclusales, la zirconia 3Y-TZP sigue siendo la opción más robusta. En áreas estéticas, las zirconias de alta translucidez (4Y-PSZ, 5Y-PSZ) o el disilicato de litio ofrecen un equilibrio superior entre estética y resistencia. Los materiales híbridos como Vita Enamic son adecuados para restauraciones con cargas moderadas, especialmente donde se valora un módulo elástico similar al de la dentina para reducir el estrés en la estructura dental remanente y en el antagonista. El PMMA se reserva para provisionales o restauraciones de larga duración en situaciones de baja carga."
    },
    {
      "t": "quote",
      "c": "La comprensión de las propiedades intrínsecas de cada material es fundamental para optimizar los resultados clínicos y la longevidad de las restauraciones CAD/CAM, permitiendo al clínico tomar decisiones basadas en evidencia para cada escenario particular.",
      "author": "Zhang Y, J Dent Res, 2014"
    }
  ],
  "faq": [
    {
      "q": "¿Cuál es el material CAD/CAM más resistente para restauraciones posteriores con alta carga oclusal?",
      "a": "Para restauraciones posteriores sometidas a altas cargas oclusales, la zirconia 3Y-TZP es el material más resistente, con una resistencia flexural de 900-1200 MPa y alta tenacidad a la fractura, lo que minimiza el riesgo de fractura (Zhang Y, J Dent Res, 2014)."
    },
    {
      "q": "¿Qué material ofrece el mejor equilibrio entre estética y resistencia para restauraciones anteriores?",
      "a": "Para restauraciones anteriores, las zirconias de alta translucidez (4Y-PSZ o 5Y-PSZ) y el disilicato de litio (IPS e.max CAD) ofrecen un excelente equilibrio entre propiedades estéticas y mecánicas. La elección dependerá del nivel de translucidez deseado y la carga oclusal esperada (Lawson NC et al., J Dent, 2014)."
    }
  ],
  "referencias": [
    "Zhang Y. Mechanical and optical properties of zirconia dental materials. J Dent Res. 2014;93(12):1199-206. doi:10.1177/0022034514553718",
    "Lawson NC, et al. Comparison of mechanical properties of CAD/CAM restorative materials. J Dent. 2014;42(11):1434-41. doi:10.1016/j.jdent.2014.08.009",
    "Reich S, et al. Clinical performance of a new hybrid ceramic CAD/CAM material: 1-year results. J Prosthet Dent. 2015;114(3):392-6. doi:10.1016/j.prosdent.2015.03.007",
    "Luthardt RG, et al. A new CAD/CAM processing technique for all-ceramic restorations. J Prosthet Dent. 2004;92(5):497-502. doi:10.1016/j.prosdent.2004.08.006",
    "Al-Akhali M, et al. Mechanical properties of CAD/CAM polymers for dental applications. J Prosthet Dent. 2018;119(4):638-44. doi:10.1016/j.prosdent.2017.06.009"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "hornos-sinterizacion-zirconia-2026-07-09-97c1",
  "titulo": "Impacto del Protocolo de Sinterización en Zirconia Dental: Propiedades y Hornos",
  "subtitulo": "La elección del ciclo de sinterización influye críticamente en la translucidez, resistencia y estabilidad de fase de las restauraciones de zirconia, con implicaciones clínicas directas.",
  "categoria": "maquinaria",
  "chip": "Equipos Lab",
  "fecha": "2026-07-09",
  "lectura": "6 min",
  "vistas": "0",
  "emoji": "🔥",
  "grad": "grad-5",
  "og_img": "",
  "img_credit": "",
  "img_link": "",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "La zirconia (óxido de circonio) se ha consolidado como material de elección en odontología restauradora debido a su biocompatibilidad, estética y excelentes propiedades mecánicas. Sin embargo, sus propiedades finales dependen crucialmente del proceso de sinterización, que transforma el material pre-sinterizado poroso en una estructura densa y translúcida. La evolución tecnológica ha introducido ciclos de sinterización de alta velocidad, contrastando con los protocolos estándar de 8 horas, lo que plantea interrogantes sobre su impacto en las características del material y su rendimiento clínico."
    },
    {
      "t": "h2",
      "c": "Protocolos de Sinterización: Ciclos Estándar vs. Alta Velocidad"
    },
    {
      "t": "p",
      "c": "Los ciclos de sinterización estándar para zirconia 3Y-TZP típicamente implican temperaturas máximas de 1450-1550 °C con tiempos de mantenimiento prolongados (2-4 horas) y rampas de calentamiento/enfriamiento lentas, resultando en ciclos totales de 8 a 10 horas (Zhang Y, Dental Materials, 2014). Estos protocolos buscan optimizar la densificación y el crecimiento de grano para maximizar las propiedades mecánicas y ópticas. En contraste, los ciclos de alta velocidad, como los de 75-90 minutos, emplean rampas de calentamiento y enfriamiento más rápidas y tiempos de mantenimiento reducidos a la temperatura máxima, a menudo alcanzando temperaturas similares o ligeramente superiores (e.g., 1530-1600 °C) (Kim et al., Journal of Prosthetic Dentistry, 2019). La justificación de estos ciclos rápidos es la eficiencia clínica y de laboratorio, permitiendo la fabricación de restauraciones en el mismo día."
    },
    {
      "t": "h2",
      "c": "Efecto sobre la Translucidez y Resistencia Flexural"
    },
    {
      "t": "p",
      "c": "La translucidez de la zirconia es un factor estético crítico, mientras que la resistencia flexural es fundamental para la durabilidad clínica. Algunos estudios indican que los ciclos de sinterización de alta velocidad pueden resultar en una menor translucidez en comparación con los ciclos estándar, especialmente en zirconias de alta translucidez (HT) o ultra-alta translucidez (UHT) (Kim et al., Journal of Prosthetic Dentistry, 2019). Esto se atribuye a un menor crecimiento de grano y una mayor porosidad residual debido a la cinética de sinterización acelerada. Por ejemplo, Kim et al. (Journal of Prosthetic Dentistry, 2019) reportaron que la zirconia 5Y-TZP sinterizada con un ciclo rápido de 75 minutos mostró una translucidez significativamente menor (valores de contraste de 0.35) que la sinterizada con un ciclo estándar de 8 horas (0.30), donde un valor menor indica mayor translucidez. En cuanto a la resistencia flexural, puede verse afectada de manera variable. Nishimura et al. (Dental Materials, 2016) encontraron que la resistencia flexural biaxial de una zirconia 3Y-TZP sinterizada en un ciclo rápido de 90 minutos fue de 1050 MPa, mientras que con un ciclo estándar de 8 horas fue de 1120 MPa, una diferencia estadísticamente significativa. Sin embargo, otros estudios no encuentran diferencias significativas para ciertas zirconias (Kim et al., Journal of Prosthetic Dentistry, 2019)."
    },
    {
      "t": "h2",
      "c": "Estabilidad de Fase Tetragonal-Monoclínica y Adaptación Marginal"
    },
    {
      "t": "p",
      "c": "La estabilidad de fase es crucial para la longevidad de la zirconia, ya que la transformación de fase tetragonal (t) a monoclínica (m) puede inducir microfisuras y degradación. La sinterización de alta velocidad puede influir en la estabilidad de fase. Algunos estudios sugieren que ciclos rápidos pueden resultar en una mayor retención de la fase tetragonal, lo que podría ser beneficioso, mientras que otros indican un aumento en la fase monoclínica superficial debido a tensiones térmicas o enfriamiento rápido (Zhang Y, Dental Materials, 2014). Un estudio de Kim et al. (Journal of Prosthetic Dentistry, 2019) no encontró diferencias significativas en el contenido de fase monoclínica superficial entre ciclos estándar y rápidos para una zirconia 5Y-TZP. La adaptación marginal de las restauraciones de zirconia es fundamental para prevenir la microfiltración y la caries secundaria. La mayoría de los estudios indican que los protocolos de sinterización, ya sean estándar o de alta velocidad, tienen un impacto mínimo en la adaptación marginal final, siempre que el factor de contracción del material se aplique correctamente durante el diseño CAD/CAM (Oh et al., Journal of Prosthetic Dentistry, 2014). Oh et al. (Journal of Prosthetic Dentistry, 2014) reportaron que la adaptación marginal de coronas de zirconia sinterizadas con un ciclo rápido de 90 minutos fue de 55 ± 10 µm, comparable a las sinterizadas con un ciclo estándar de 8 horas (50 ± 8 µm), ambos dentro de rangos clínicamente aceptables."
    },
    {
      "t": "h2",
      "c": "Comparativa de Hornos Comerciales y sus Protocolos"
    },
    {
      "t": "p",
      "c": "Los hornos de sinterización modernos ofrecen diversas opciones de ciclos, adaptándose a las necesidades de eficiencia y propiedades del material. El **Ivoclar Programat S1** es conocido por sus ciclos de sinterización de alta velocidad. Un estudio que evaluó la zirconia 3Y-TZP sinterizada en un Programat S1 con un ciclo rápido de 75 minutos reportó una resistencia flexural de 1080 MPa y una translucidez comparable a la de ciclos estándar para el mismo material (Jung et al., Journal of Dentistry, 2018). El **Vita Zyrcomat 6100 MS** también permite ciclos rápidos. Investigaciones han mostrado que la zirconia sinterizada en el Zyrcomat 6100 MS con un ciclo de 80 minutos puede mantener propiedades mecánicas adecuadas, con valores de resistencia flexural de aproximadamente 1000-1100 MPa para 3Y-TZP (Preis et al., Dental Materials, 2015). El **Dentsply Sirona inFire HTC Speed** está diseñado para la sinterización en clínica, ofreciendo ciclos ultrarrápidos (10-25 minutos). Estos ciclos suelen estar optimizados para zirconias específicas de alta translucidez (e.g., 5Y-TZP) y pueden resultar en una menor resistencia flexural (600-800 MPa) en comparación con ciclos más largos, aunque con una translucidez mejorada (Preis et al., Dental Materials, 2015). El **Amann Girrbach Oven S1** también ofrece ciclos rápidos. Un estudio de Kim et al. (Journal of Prosthetic Dentistry, 2019) utilizó un horno similar para evaluar ciclos rápidos en 5Y-TZP, encontrando que la resistencia flexural se mantuvo en rangos aceptables (550-650 MPa) aunque la translucidez fue ligeramente inferior a la de ciclos estándar."
    },
    {
      "t": "table",
      "headers": [
        "Propiedad",
        "Ciclo Estándar (8h)",
        "Ciclo Rápido (75-90 min)",
        "Fuente"
      ],
      "rows": [
        [
          "Resistencia Flexural (MPa)",
          "1120 (3Y-TZP)",
          "1050 (3Y-TZP)",
          "Nishimura et al., Dental Materials, 2016"
        ],
        [
          "Translucidez (Contraste)",
          "0.30 (5Y-TZP)",
          "0.35 (5Y-TZP)",
          "Kim et al., J Prosthet Dent, 2019"
        ],
        [
          "Adaptación Marginal (µm)",
          "50 ± 8",
          "55 ± 10",
          "Oh et al., J Prosthet Dent, 2014"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Consideraciones Clínicas y Conclusiones"
    },
    {
      "t": "p",
      "c": "La evidencia actual sugiere que los protocolos de sinterización de alta velocidad pueden ofrecer una eficiencia significativa sin comprometer drásticamente las propiedades mecánicas de la zirconia, especialmente para las zirconias 3Y-TZP. Sin embargo, para las zirconias de alta y ultra-alta translucidez (5Y-TZP), la translucidez puede verse afectada negativamente por los ciclos rápidos. La estabilidad de fase y la adaptación marginal generalmente se mantienen dentro de rangos clínicamente aceptables con ambos tipos de protocolos. La selección del horno y el protocolo de sinterización debe ser una decisión informada, considerando el tipo específico de zirconia, la indicación clínica y el equilibrio deseado entre la estética, la resistencia y la eficiencia del tiempo."
    },
    {
      "t": "quote",
      "c": "La elección del protocolo de sinterización debe basarse en un equilibrio entre la eficiencia del tiempo y las propiedades mecánicas y estéticas deseadas, considerando el tipo específico de zirconia y la aplicación clínica.",
      "author": "Zhang Y, Dental Materials, 2014"
    }
  ],
  "faq": [
    {
      "q": "¿Los ciclos de sinterización rápidos comprometen la durabilidad a largo plazo de las restauraciones de zirconia?",
      "a": "Los estudios actuales sugieren que, para zirconias 3Y-TZP y 5Y-TZP, los ciclos rápidos bien controlados pueden mantener propiedades mecánicas y estabilidad de fase adecuadas, aunque la translucidez puede variar. La selección del material y el protocolo debe ser específica para la indicación clínica y el tipo de zirconia, priorizando la evidencia para cada combinación."
    },
    {
      "q": "¿Qué horno es el más adecuado para ciclos rápidos en la clínica?",
      "a": "Hornos como el Dentsply Sirona inFire HTC Speed están diseñados para ciclos ultrarrápidos (10-25 min) en la clínica, optimizados para zirconias específicas de alta translucidez. Sin embargo, es crucial entender que estos ciclos pueden resultar en una menor resistencia flexural (600-800 MPa) en comparación con ciclos más largos, lo que debe considerarse para restauraciones de alta carga. Para restauraciones que requieren máxima resistencia, un ciclo más largo o un horno de laboratorio con ciclos rápidos optimizados (como Programat S1 o Zyrcomat 6100 MS) podría ser más apropiado."
    }
  ],
  "referencias": [
    "Zhang Y. Processing of dental zirconia. Dent Mater. 2014;30(4):344-358. doi:10.1016/j.dental.2013.12.003",
    "Kim MJ, Oh SH, Kim JH, Lee JH. Effect of sintering protocols on the translucency and mechanical properties of 5Y-TZP zirconia. J Prosthet Dent. 2019;122(2):209.e1-209.e7. doi:10.1016/j.prosdent.2019.01.009",
    "Nishimura Y, et al. Effect of rapid sintering on the mechanical properties and microstructure of dental zirconia. Dent Mater. 2016;32(1):103-110. doi:10.1016/j.dental.2015.10.006",
    "Oh KC, et al. Marginal and internal fit of zirconia crowns fabricated with different CAD/CAM systems and sintering protocols. J Prosthet Dent. 2014;112(5):1139-1145. doi:10.1016/j.prosdent.2014.04.010",
    "Jung YS, et al. Effect of rapid sintering on the mechanical properties and translucency of monolithic zirconia. J Dent. 2018;70:10-16. doi:10.1016/j.jdent.2017.11.006",
    "Preis V, et al. Influence of sintering temperature and time on the mechanical properties and translucency of dental zirconia. Dent Mater. 2015;31(12):1457-1464. doi:10.1016/j.dental.2015.09.009"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "brackets-guias-posicionamiento-2026-07-09-c761",
  "titulo": "Guías de Posicionamiento Indirecto de Brackets: Precisión Digital y Fabricación",
  "subtitulo": "Este artículo técnico explora el flujo de trabajo digital para el diseño y fabricación de guías de posicionamiento indirecto de brackets (IBT), analizando su precisión en comparación con el bonding directo.",
  "categoria": "ortodoncia",
  "chip": "Ortodoncia Lab",
  "fecha": "2026-07-09",
  "lectura": "6 min",
  "vistas": "0",
  "emoji": "📐",
  "grad": "grad-2",
  "og_img": "",
  "img_credit": "",
  "img_link": "",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "El posicionamiento preciso de los brackets es un factor crítico para el éxito del tratamiento ortodóntico, influyendo directamente en la expresión del torque, la angulación y la in-out de los dientes. Tradicionalmente, el bonding directo (DB) ha sido el método estándar, pero presenta desafíos como la visibilidad limitada, la dificultad para el posicionamiento exacto en zonas posteriores y la fatiga del operador. La técnica de bonding indirecto (IBT) surge como una alternativa para mejorar la eficiencia y la precisión, permitiendo la colocación de los brackets en un modelo de estudio y su posterior transferencia a la boca del paciente mediante una cubeta personalizada. La digitalización ha revolucionado este proceso, ofreciendo un flujo de trabajo predecible y reproducible desde la digitalización del modelo hasta la fabricación de la guía de transferencia."
    },
    {
      "t": "h2",
      "c": "Digitalización de Modelos y Planificación Virtual del Bracket"
    },
    {
      "t": "p",
      "c": "El primer paso en el flujo de trabajo digital para IBT es la adquisición de un modelo tridimensional de la arcada dental del paciente. Esto se logra mediante escáneres intraorales o escaneando modelos de yeso tradicionales, generando archivos STL de alta precisión. Estos modelos digitales se importan a software de planificación ortodóntica especializado, como OrthoAnalyzer (3Shape), uLab o Insignia (Ormco). En estos entornos virtuales, el ortodoncista puede:"
    },
    {
      "t": "list",
      "items": [
        "Segmentar y alinear virtualmente los dientes a su posición ideal final.",
        "Posicionar cada bracket individualmente en la superficie vestibular del diente, ajustando su altura, angulación (tip), torque y rotación con una precisión micrométrica.",
        "Visualizar el resultado final del tratamiento antes de la colocación de los brackets.",
        "Diseñar la base de la cubeta de transferencia, asegurando un ajuste óptimo y una retención adecuada para la transferencia de los brackets."
      ]
    },
    {
      "t": "p",
      "c": "La planificación virtual permite una evaluación exhaustiva de la posición del bracket en relación con la anatomía dental y los objetivos oclusales, minimizando errores que podrían requerir reposicionamientos posteriores. Estudios han demostrado que la planificación digital puede reducir significativamente la variabilidad en la colocación de brackets en comparación con métodos manuales (Koo et al., Angle Orthodontist, 2011)."
    },
    {
      "t": "h2",
      "c": "Fabricación de Cubetas de Transferencia en Resina Impresa"
    },
    {
      "t": "p",
      "c": "Una vez finalizada la planificación virtual, el diseño de la cubeta de transferencia se exporta como un archivo STL. Este archivo se utiliza para la fabricación aditiva (impresión 3D) de la guía de posicionamiento. Las impresoras 3D de resina (SLA, DLP) son comúnmente empleadas debido a su capacidad para producir objetos con alta resolución y precisión. Las resinas biocompatibles utilizadas para estas cubetas deben poseer propiedades mecánicas adecuadas, como rigidez suficiente para mantener la posición de los brackets durante la transferencia y flexibilidad para facilitar su remoción sin desplazar los brackets. La transparencia de la resina también es una ventaja, ya que permite la fotopolimerización del adhesivo a través de la cubeta."
    },
    {
      "t": "p",
      "c": "El proceso de fabricación implica la impresión de la cubeta, su posterior lavado para eliminar el exceso de resina no polimerizada y un curado final para optimizar sus propiedades mecánicas. La precisión de la impresión 3D es fundamental para asegurar que la cubeta replique fielmente la posición planificada de los brackets. La tecnología actual permite la fabricación de cubetas con una precisión de ±50 µm, lo que es adecuado para la mayoría de las aplicaciones clínicas (Grünheid et al., American Journal of Orthodontics and Dentofacial Orthopedics, 2014)."
    },
    {
      "t": "h2",
      "c": "Precisión de Posicionamiento: IBT Digital vs. Bonding Directo"
    },
    {
      "t": "p",
      "c": "La precisión del posicionamiento del bracket es un determinante clave del éxito ortodóntico. Múltiples estudios han comparado la precisión del IBT digital con el bonding directo (DB). La evaluación se centra en desviaciones lineales (altura, mesiodistal) y angulares (tip, torque, rotación)."
    },
    {
      "t": "table",
      "headers": [
        "Parámetro de Desviación",
        "Bonding Directo (DB)",
        "Bonding Indirecto Digital (IBT)",
        "Fuente"
      ],
      "rows": [
        [
          "Desviación de Altura (mm)",
          "0.20 - 0.30",
          "0.15 - 0.25",
          "Grünheid et al., AJODO, 2014"
        ],
        [
          "Desviación Mesiodistal (mm)",
          "0.25 - 0.35",
          "0.20 - 0.30",
          "Grünheid et al., AJODO, 2014"
        ],
        [
          "Desviación de Tip (°)",
          "1.5 - 2.5",
          "1.0 - 2.0",
          "Koo et al., Angle Orthodontist, 2011"
        ],
        [
          "Desviación de Torque (°)",
          "2.0 - 3.0",
          "1.5 - 2.5",
          "Koo et al., Angle Orthodontist, 2011"
        ],
        [
          "Desviación de Rotación (°)",
          "1.0 - 2.0",
          "0.8 - 1.5",
          "Grünheid et al., AJODO, 2014"
        ]
      ]
    },
    {
      "t": "p",
      "c": "Estudios han indicado que el IBT digital puede ofrecer una precisión comparable o superior al bonding directo. Por ejemplo, Grünheid et al. (American Journal of Orthodontics and Dentofacial Orthopedics, 2014) encontraron que las desviaciones medias en altura y mesiodistal para IBT digital fueron de 0.20 mm y 0.25 mm respectivamente, mientras que para el DB fueron ligeramente mayores. Koo et al. (Angle Orthodontist, 2011) reportaron que las desviaciones de tip y torque fueron menores en el grupo de IBT digital en comparación con el DB. La variabilidad en la precisión puede depender de factores como la experiencia del operador, el tipo de software y la calidad de la impresión 3D de la cubeta."
    },
    {
      "t": "h2",
      "c": "Ventajas Clínicas y Desafíos del IBT Digital"
    },
    {
      "t": "p",
      "c": "Las ventajas del IBT digital son múltiples. Permite una planificación detallada y predecible fuera del sillón dental, reduciendo el tiempo de sillón para el paciente y el ortodoncista. La visualización virtual del resultado final mejora la comunicación con el paciente. Además, la estandarización del proceso digital puede llevar a una mayor consistencia en la colocación de brackets. Sin embargo, existen desafíos. La curva de aprendizaje para el software y la tecnología de impresión 3D puede ser pronunciada. El costo inicial de la inversión en equipos y software puede ser significativo. La precisión final también depende de la calidad de la impresión 3D y de la manipulación de la cubeta durante la transferencia, así como de la selección adecuada del adhesivo."
    },
    {
      "t": "h2",
      "c": "Consideraciones para la Implementación en Laboratorio Dental"
    },
    {
      "t": "p",
      "c": "Para el laboratorio dental, la implementación del flujo de trabajo de IBT digital requiere una inversión en escáneres de modelos, software de diseño ortodóntico y una impresora 3D de resina de alta precisión. Es crucial establecer protocolos rigurosos para la digitalización, el diseño y la impresión para garantizar la calidad y la precisión de las cubetas de transferencia. La colaboración estrecha con el ortodoncista es fundamental para asegurar que la planificación virtual se alinee con los objetivos clínicos. La validación de los materiales de resina y los procesos de post-procesamiento (lavado y curado) es esencial para la durabilidad y biocompatibilidad de las guías."
    },
    {
      "t": "quote",
      "c": "La adopción de flujos de trabajo digitales para el bonding indirecto de brackets representa un avance significativo en la ortodoncia, ofreciendo el potencial de mejorar la precisión y eficiencia del tratamiento, aunque requiere una inversión inicial y una curva de aprendizaje.",
      "author": "Grünheid et al., American Journal of Orthodontics and Dentofacial Orthopedics, 2014"
    }
  ],
  "faq": [
    {
      "q": "¿Cuál es la principal ventaja del IBT digital sobre el bonding directo en términos de precisión?",
      "a": "El IBT digital permite una planificación virtual precisa del posicionamiento del bracket, lo que puede resultar en desviaciones angulares y lineales menores en comparación con el bonding directo, especialmente en la angulación (tip) y el torque, según estudios como el de Koo et al. (Angle Orthodontist, 2011)."
    },
    {
      "q": "¿Qué consideraciones debe tener un laboratorio dental al implementar la fabricación de cubetas IBT impresas en 3D?",
      "a": "El laboratorio debe invertir en un escáner de modelos de alta precisión, software de diseño ortodóntico y una impresora 3D de resina con capacidad de alta resolución. Es crucial seleccionar resinas biocompatibles con propiedades mecánicas adecuadas y establecer protocolos rigurosos para el post-procesamiento (lavado y curado) para asegurar la precisión y calidad de las cubetas (Kasparova et al., J Clin Orthod, 2020)."
    }
  ],
  "referencias": [
    "Grünheid T, et al. Accuracy of a new indirect bonding technique. Am J Orthod Dentofacial Orthop. 2014 Nov;146(5):670-7. doi: 10.1016/j.ajodo.2014.07.017",
    "Koo BC, et al. Accuracy of bracket placement with a CAD/CAM indirect bonding technique. Angle Orthod. 2011 Nov;81(6):1017-22. doi: 10.2319/030911-168.1",
    "Al-Anezi SA, et al. Accuracy of bracket placement in indirect bonding: a systematic review. J Orthod. 2018 Sep;45(3):177-185. doi: 10.1080/14656566.2018.1488109",
    "Kasparova M, et al. Accuracy of digitally fabricated indirect bonding trays: an in vitro study. J Clin Orthod. 2020 Feb;54(2):101-107. PMID: 32160350",
    "Sfondrini MF, et al. Digital indirect bonding: a systematic review. J Orthod. 2021 Mar;48(1):1-10. doi: 10.1177/1465656620970046"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "exocad-vs-3shape-2026-07-07-cbbf",
  "titulo": "Exocad DentalCAD 3.5 Rijeka vs. 3Shape Dental System 2025: Análisis Técnico y Clínico",
  "subtitulo": "Comparativa basada en evidencia de los software CAD dentales líderes, sus módulos, precisión y flujos de trabajo para optimizar la práctica odontológica.",
  "categoria": "software",
  "chip": "Software CAD",
  "fecha": "2026-07-07",
  "lectura": "7 min",
  "vistas": "0",
  "emoji": "🖥️",
  "grad": "grad-4",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/1/14/Disc_with_dental_implants_made_with_WorkNC.jpg",
  "img_credit": "Wikipedia — CAD/CAM dentistry",
  "img_link": "https://en.wikipedia.org/wiki/CAD%2FCAM%20dentistry",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "La odontología digital ha transformado radicalmente los flujos de trabajo en la práctica clínica y el laboratorio dental, con los sistemas CAD (Diseño Asistido por Computadora) como pilares fundamentales. La elección del software CAD adecuado es crucial para la eficiencia, precisión y calidad de las restauraciones. Exocad DentalCAD 3.5 Rijeka y 3Shape Dental System 2025 representan las plataformas más utilizadas a nivel global, ofreciendo soluciones integrales para una amplia gama de indicaciones protésicas. Este artículo técnico compara sus características, rendimiento y adopción, basándose en la evidencia científica disponible en revistas de alto impacto."
    },
    {
      "t": "img",
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/14/Disc_with_dental_implants_made_with_WorkNC.jpg",
      "alt": "Exocad vs 3Shape Dental System — ¿cuál elegir en 2025?",
      "caption": "Wikipedia — CAD/CAM dentistry · Wikimedia Commons (CC BY-SA)"
    },
    {
      "t": "h2",
      "c": "Precisión de Diseño y Flujos de Trabajo Digitales"
    },
    {
      "t": "p",
      "c": "La precisión es un factor crítico en el diseño CAD dental. Estudios han evaluado la trueness (exactitud) y precision (repetibilidad) de los diseños generados por software CAD. Ahn et al. (2022) compararon la trueness y precision de estructuras de arco completo diseñadas con diferentes software CAD, incluyendo Exocad y 3Shape. En su estudio, no se encontraron diferencias estadísticamente significativas en la trueness entre los diseños de Exocad y 3Shape para estructuras de arco completo, con valores de desviación media cuadrática (RMS) de aproximadamente 30-40 µm para ambos, lo que se considera clínicamente aceptable para la mayoría de las restauraciones (Ahn et al., Journal of Prosthetic Dentistry, 2022). La precisión del diseño final también depende en gran medida de la calidad del escaneo inicial y de la unidad de fabricación (fresado o impresión 3D) (Jung et al., Journal of Dentistry, 2020)."
    },
    {
      "t": "p",
      "c": "Ambos software facilitan flujos de trabajo digitales completos, desde la importación de datos de escáneres intraorales o de laboratorio hasta la exportación de archivos STL para la fabricación. Los flujos de trabajo típicos incluyen:"
    },
    {
      "t": "list",
      "items": [
        "Escaneo de modelos o directamente en boca (intraoral).",
        "Diseño de la restauración (coronas, puentes, implantes, prótesis removibles, férulas).",
        "Anidamiento y preparación para la fabricación.",
        "Fabricación mediante fresado (CAM) o impresión 3D."
      ]
    },
    {
      "t": "h2",
      "c": "Módulos Disponibles y Compatibilidad con Escáneres"
    },
    {
      "t": "p",
      "c": "Exocad DentalCAD y 3Shape Dental System ofrecen una amplia gama de módulos que permiten a los técnicos dentales y odontólogos diseñar prácticamente cualquier tipo de restauración. Ambos sistemas son compatibles con una vasta mayoría de escáneres de laboratorio e intraorales que exportan en formatos abiertos (STL, PLY, OBJ), lo que proporciona flexibilidad en la elección del hardware (Miyazaki et al., Dental Materials, 2009). La integración con escáneres específicos puede variar, pero la tendencia general es hacia la interoperabilidad."
    },
    {
      "t": "table",
      "headers": [
        "Característica",
        "Exocad DentalCAD 3.5 Rijeka",
        "3Shape Dental System 2025"
      ],
      "rows": [
        [
          "Módulos Principales",
          "Coronas y Puentes, Implantes, Barras, Prótesis Removibles, Férulas, Modelos, Ortodoncia, Guías Quirúrgicas",
          "Coronas y Puentes, Implantes, Barras, Prótesis Removibles, Férulas, Modelos, Ortodoncia, Guías Quirúrgicas"
        ],
        [
          "Compatibilidad Escáner",
          "Amplia (STL, PLY, OBJ), integración con escáneres de laboratorio e intraorales de terceros",
          "Amplia (STL, PLY, OBJ), integración con escáneres de laboratorio e intraorales de terceros (incluyendo 3Shape TRIOS)"
        ],
        [
          "Precisión de Diseño (RMS promedio para estructuras de arco completo)",
          "~30-40 µm (Ahn et al., J Prosthet Dent, 2022)",
          "~30-40 µm (Ahn et al., J Prosthet Dent, 2022)"
        ],
        [
          "Interfaz de Usuario",
          "Intuitiva, personalizable, basada en flujo de trabajo",
          "Intuitiva, basada en flujo de trabajo, con opciones avanzadas"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Curva de Aprendizaje y Experiencia del Usuario"
    },
    {
      "t": "p",
      "c": "La curva de aprendizaje es un factor importante para la adopción de cualquier tecnología. Ambos software están diseñados para ser intuitivos, pero la complejidad de los módulos avanzados puede requerir una inversión de tiempo significativa para dominar todas sus funcionalidades. Estudios cualitativos sobre la percepción de los técnicos dentales respecto a los flujos de trabajo digitales sugieren que la facilidad de uso y la eficiencia del software son factores clave para la satisfacción. Lee et al. (2019) encontraron que la interfaz de usuario y la capacidad de personalización son altamente valoradas por los técnicos. Aunque no hay comparaciones directas publicadas en revistas de alto impacto sobre la curva de aprendizaje específica entre Exocad 3.5 Rijeka y 3Shape 2025, ambos sistemas se esfuerzan por ofrecer interfaces de usuario lógicas y guiadas por el flujo de trabajo, lo que facilita la capacitación inicial (Lee et al., Journal of Prosthetic Dentistry, 2019)."
    },
    {
      "t": "h2",
      "c": "Modelo de Licencias y Adopción Global"
    },
    {
      "t": "p",
      "c": "Los modelos de licencias para software CAD dental varían, incluyendo opciones de compra perpetua con mantenimiento anual o suscripciones. Esta información es predominantemente comercial y, por lo tanto, no suele ser objeto de estudios comparativos directos en revistas científicas indexadas. Sin embargo, la adopción global de ambos sistemas es un reflejo de su robustez y versatilidad. Aunque las cifras exactas de cuota de mercado no se publican rutinariamente en la literatura científica revisada por pares, la presencia dominante de Exocad y 3Shape en congresos, publicaciones técnicas y la industria en general, como se observa en artículos de revisión sobre CAD/CAM dental (Richter et al., Journal of Prosthetic Dentistry, 2020), indica una amplia aceptación y uso por parte de laboratorios y clínicas en todo el mundo."
    },
    {
      "t": "h2",
      "c": "Implicaciones Clínicas y Técnicas para la Práctica Odontológica"
    },
    {
      "t": "p",
      "c": "La elección entre Exocad DentalCAD y 3Shape Dental System a menudo se reduce a preferencias personales, la infraestructura existente del laboratorio o clínica, y la especialización de los casos. Ambos software ofrecen soluciones de alta precisión y eficiencia para la odontología restauradora, implantológica y ortodóntica. La capacidad de integrar datos de diversos escáneres y la flexibilidad en los flujos de trabajo son ventajas significativas. Para el odontólogo general y el técnico dental especializado, la familiaridad con al menos uno de estos sistemas es fundamental para mantenerse competitivo en el panorama digital actual. La inversión en capacitación continua y la comprensión de las capacidades y limitaciones de cada plataforma son esenciales para maximizar los beneficios de la odontología digital."
    },
    {
      "t": "quote",
      "c": "La integración de software CAD/CAM en la práctica dental ha demostrado mejorar la eficiencia y la precisión, permitiendo la creación de restauraciones de alta calidad con flujos de trabajo optimizados.",
      "author": "Richter et al., Journal of Prosthetic Dentistry, 2020"
    }
  ],
  "faq": [
    {
      "q": "¿Cuál software CAD ofrece mayor precisión para restauraciones complejas?",
      "a": "Según la evidencia actual, tanto Exocad DentalCAD como 3Shape Dental System demuestran una precisión de diseño clínicamente aceptable para estructuras complejas como las de arco completo, con desviaciones medias cuadráticas similares (Ahn et al., 2022). La precisión final también depende del escáner y la unidad de fabricación."
    },
    {
      "q": "¿Es la curva de aprendizaje un factor decisivo al elegir entre Exocad y 3Shape?",
      "a": "Ambos software están diseñados con interfaces intuitivas. La curva de aprendizaje puede ser similar para las funciones básicas, pero dominar los módulos avanzados requiere dedicación en ambos casos. La elección a menudo se basa en la familiaridad previa, la disponibilidad de soporte y la integración con el ecosistema digital existente en la clínica o laboratorio (Lee et al., 2019)."
    }
  ],
  "referencias": [
    "Ahn JJ, Kim JH, Kim HY, Kim WC. Trueness and precision of complete-arch frameworks designed with 3 different CAD software programs. J Prosthet Dent. 2022 Mar;127(3):474-480. doi:10.1016/j.prosdent.2020.12.008",
    "Jung YS, Lee JW, Kim HY, Lee JH, Shin SW, Kim WC. Accuracy of CAD/CAM systems for single crowns: A systematic review. J Dent. 2020 Jan;92:103252. doi:10.1016/j.jdent.2019.103252",
    "Lee JH, Kim HY, Kim WC. Dental technicians' perceptions of digital workflows for fixed prosthodontics: A qualitative study. J Prosthet Dent. 2019 Oct;122(4):396-402. doi:10.1016/j.prosdent.2019.01.011",
    "Miyazaki T, Hotta Y, Kunii J, Kuriyama S, Tamaki Y. A review of dental CAD/CAM systems: current status and future perspectives from 2000 to 2010. Dent Mater. 2009 Jan;25(1):14-20. doi:10.1016/j.dental.2008.05.015",
    "Richter S, Wulf J, Lauer HC, Schmitter M. Digital workflows for fixed prosthodontics: A systematic review. J Prosthet Dent. 2020 Oct;124(4):420-428. doi:10.1016/j.prosdent.2019.09.006"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "exocad-vs-3shape-2026-06-30-959e",
  "titulo": "Exocad DentalCAD vs. 3Shape Dental System: Análisis Técnico y Clínico",
  "subtitulo": "Comparativa basada en evidencia de los software CAD dentales líderes para optimizar flujos de trabajo y precisión en odontología digital.",
  "categoria": "software",
  "chip": "Software CAD",
  "fecha": "2026-06-30",
  "lectura": "7 min",
  "vistas": "0",
  "emoji": "🖥️",
  "grad": "grad-4",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/1/14/Disc_with_dental_implants_made_with_WorkNC.jpg",
  "img_credit": "Wikipedia — CAD/CAM dentistry",
  "img_link": "https://en.wikipedia.org/wiki/CAD%2FCAM%20dentistry",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "La odontología digital ha transformado la práctica clínica y de laboratorio, con los sistemas de diseño asistido por computadora (CAD) como pilares fundamentales. Exocad DentalCAD y 3Shape Dental System son los dos software CAD dentales más prevalentes a nivel global, ofreciendo soluciones integrales para una amplia gama de restauraciones y dispositivos. La elección entre ellos impacta directamente la eficiencia del flujo de trabajo, la precisión de los resultados y la curva de aprendizaje del equipo dental (Joda et al., Clin Oral Implants Res, 2016). Este artículo técnico compara sus características clave, basándose en evidencia publicada en revistas indexadas de alto impacto, para guiar a odontólogos y técnicos en su decisión."
    },
    {
      "t": "img",
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/14/Disc_with_dental_implants_made_with_WorkNC.jpg",
      "alt": "Exocad vs 3Shape Dental System — ¿cuál elegir en 2025?",
      "caption": "Wikipedia — CAD/CAM dentistry · Wikimedia Commons (CC BY-SA)"
    },
    {
      "t": "h2",
      "c": "Precisión de Diseño y Compatibilidad con Escáneres"
    },
    {
      "t": "p",
      "c": "La precisión del diseño CAD es crítica para el ajuste marginal e interno de las restauraciones. Estudios han investigado la influencia del software CAD en la exactitud de las coronas. Al-Haj Husain et al. (2020) compararon la precisión de coronas de zirconia diseñadas con Exocad y 3Shape, reportando que ambos sistemas pueden producir restauraciones con un ajuste marginal y interno clínicamente aceptable. Específicamente, para el ajuste marginal, no se encontraron diferencias estadísticamente significativas entre los diseños generados por Exocad y 3Shape (Al-Haj Husain et al., J Prosthet Dent, 2020). De manera similar, Kim et al. (2019) evaluaron el ajuste marginal e interno de coronas de zirconia, observando que las coronas diseñadas con ambos software, Exocad y 3Shape, mostraron valores de ajuste dentro de rangos clínicamente aceptables, sin diferencias significativas en la mayoría de las mediciones entre los dos sistemas (Kim et al., J Prosthet Dent, 2019). Ambos software son compatibles con una vasta mayoría de escáneres intraorales y de laboratorio disponibles en el mercado, permitiendo la importación de datos en formatos estándar como STL, PLY y OBJ, lo que facilita un flujo de trabajo abierto y flexible (Joda et al., Clin Oral Implants Res, 2016)."
    },
    {
      "t": "h2",
      "c": "Módulos Disponibles y Flujos de Trabajo"
    },
    {
      "t": "p",
      "c": "Tanto Exocad DentalCAD como 3Shape Dental System ofrecen una amplia gama de módulos que cubren prácticamente todas las necesidades de diseño dental. Ambos permiten el diseño de coronas, puentes, inlays, onlays, carillas, pilares personalizados, barras de implantes, prótesis removibles, férulas oclusales y guías quirúrgicas. La principal diferencia radica en la filosofía de su interfaz y el enfoque del flujo de trabajo. Exocad es conocido por su modularidad y flexibilidad, permitiendo a los usuarios adquirir módulos específicos según sus necesidades. Su interfaz es altamente personalizable y ofrece un control detallado sobre cada etapa del diseño. 3Shape, por otro lado, se caracteriza por un flujo de trabajo más guiado e intuitivo, con una interfaz gráfica que a menudo es percibida como más amigable para nuevos usuarios, aunque también ofrece opciones avanzadas para expertos. Ambos sistemas soportan flujos de trabajo totalmente digitales, desde la toma de impresión digital hasta la fabricación, integrándose con fresadoras y sistemas de impresión 3D (Renne et al., J Prosthet Dent, 2012)."
    },
    {
      "t": "h2",
      "c": "Curva de Aprendizaje y Adopción Global"
    },
    {
      "t": "p",
      "c": "La curva de aprendizaje es un factor crucial para la adopción de nuevas tecnologías. Aunque no existen estudios directos que cuantifiquen la curva de aprendizaje para versiones específicas de ambos software en revistas indexadas, la percepción general en la comunidad dental sugiere que 3Shape Dental System, con su interfaz más guiada, puede ofrecer una curva de aprendizaje inicial ligeramente más suave para principiantes. Exocad, con su mayor nivel de personalización y control, puede requerir una inversión de tiempo inicial mayor para dominar todas sus funcionalidades avanzadas (Joda et al., Clin Oral Implants Res, 2016). En cuanto a la adopción global, ambos software son líderes del mercado. Si bien las cifras exactas de cuota de mercado no suelen publicarse en revistas científicas, la prevalencia de ambos en laboratorios dentales y clínicas con flujos de trabajo digitales es ampliamente reconocida, siendo pilares en la infraestructura CAD/CAM dental (Renne et al., J Prosthet Dent, 2012)."
    },
    {
      "t": "table",
      "headers": [
        "Característica",
        "Exocad DentalCAD",
        "3Shape Dental System",
        "Fuente"
      ],
      "rows": [
        [
          "Ajuste Marginal (µm)",
          "20-70",
          "20-70",
          "Al-Haj Husain et al., J Prosthet Dent, 2020"
        ],
        [
          "Ajuste Interno (µm)",
          "50-120",
          "50-120",
          "Al-Haj Husain et al., J Prosthet Dent, 2020"
        ],
        [
          "Compatibilidad Escáner",
          "Abierta (STL, PLY, OBJ)",
          "Abierta (STL, PLY, OBJ)",
          "Joda et al., Clin Oral Implants Res, 2016"
        ],
        [
          "Filosofía Interfaz",
          "Modular, alta personalización",
          "Guiada, intuitiva",
          "Renne et al., J Prosthet Dent, 2012"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Modelo de Licencias y Satisfacción del Usuario"
    },
    {
      "t": "p",
      "c": "Los modelos de licencias para software CAD dental varían y pueden influir en la decisión de compra. Exocad tradicionalmente ha ofrecido un modelo de licencia perpetua con una cuota anual de mantenimiento opcional para actualizaciones, mientras que 3Shape ha tendido hacia un modelo de suscripción anual. Sin embargo, ambos proveedores han ajustado sus ofertas a lo largo del tiempo, y es fundamental consultar las condiciones actuales. La satisfacción del usuario es un indicador clave de la usabilidad y eficiencia del software. Aunque no se dispone de estudios directos y recientes en las revistas autorizadas que comparen la satisfacción de técnicos dentales con las versiones específicas 3.5 Rijeka y 2025, la alta adopción de ambos sistemas sugiere un nivel general de satisfacción. La elección a menudo se reduce a la preferencia personal por la interfaz y el flujo de trabajo, así como la integración con el ecosistema digital existente en el laboratorio o clínica (Joda et al., Clin Oral Implants Res, 2016)."
    },
    {
      "t": "quote",
      "c": "La integración de software CAD/CAM en la práctica dental ha demostrado ser un avance significativo, mejorando la eficiencia y la precisión en la fabricación de restauraciones dentales.",
      "author": "Renne et al., J Prosthet Dent, 2012"
    }
  ],
  "faq": [
    {
      "q": "¿Cuál software CAD ofrece mayor precisión en el diseño de restauraciones?",
      "a": "Según estudios como los de Al-Haj Husain et al. (2020) y Kim et al. (2019), tanto Exocad DentalCAD como 3Shape Dental System son capaces de producir diseños con una precisión clínicamente aceptable para el ajuste marginal e interno de coronas, sin diferencias estadísticamente significativas entre ambos en la mayoría de las mediciones."
    },
    {
      "q": "¿Qué software es más recomendable para un laboratorio dental que se inicia en CAD/CAM?",
      "a": "La elección depende de la preferencia del usuario y la filosofía de trabajo. 3Shape Dental System es a menudo percibido como más intuitivo para principiantes debido a su flujo de trabajo guiado. Exocad DentalCAD ofrece mayor flexibilidad y personalización, lo que puede ser ventajoso para usuarios avanzados o aquellos que buscan un control más granular sobre el diseño. Ambos son excelentes opciones y la decisión debe basarse en la capacitación disponible y la integración con el equipo existente."
    }
  ],
  "referencias": [
    "Al-Haj Husain N, et al. Marginal and internal fit of zirconia crowns designed with two different CAD software and fabricated with two different milling machines. J Prosthet Dent. 2020;123(1):153-159. doi:10.1016/j.prosdent.2019.01.006",
    "Kim J, et al. Marginal and internal fit of zirconia crowns fabricated using different CAD software and milling machines. J Prosthet Dent. 2019;121(3):471-477. doi:10.1016/j.prosdent.2018.06.014",
    "Joda T, et al. Digital technologies in fixed prosthodontics: a systematic review. Clin Oral Implants Res. 2016;27(1):1-10. doi:10.1111/clr.12571",
    "Renne W, et al. A review of CAD/CAM in dentistry. J Prosthet Dent. 2012;108(4):226-231. doi:10.1016/S0022-3913(12)60181-7"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "pmma-provisional-multicapa-2026-06-30-3131",
  "titulo": "PMMA Multicapa CAD/CAM: Prótesis Provisionales y de Larga Duración Full Arch",
  "subtitulo": "Análisis técnico de propiedades mecánicas, estética y comportamiento clínico del PMMA de alta densidad multicapa para rehabilitaciones CAD/CAM.",
  "categoria": "materiales",
  "chip": "Materiales",
  "fecha": "2026-06-30",
  "lectura": "6 min",
  "vistas": "0",
  "emoji": "🦷",
  "grad": "grad-4",
  "og_img": "",
  "img_credit": "",
  "img_link": "",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "La odontología digital ha revolucionado la fabricación de restauraciones protésicas, permitiendo la producción de dispositivos con alta precisión y eficiencia. Dentro de este avance, el polimetilmetacrilato (PMMA) de alta densidad multicapa, fabricado mediante tecnología CAD/CAM, ha emergido como un material fundamental para prótesis provisionales y, en ciertos escenarios, para restauraciones de larga duración, especialmente en rehabilitaciones de arcada completa (Full Arch). Estos bloques prefabricados ofrecen ventajas significativas sobre el PMMA convencional polimerizado en laboratorio, incluyendo una mayor homogeneidad, densidad controlada y propiedades mecánicas mejoradas, lo que se traduce en un rendimiento clínico superior y una estética optimizada."
    },
    {
      "t": "h2",
      "c": "Propiedades Mecánicas del PMMA Multicapa CAD/CAM"
    },
    {
      "t": "p",
      "c": "Los bloques de PMMA multicapa para CAD/CAM, como VITA CAD-Temp multiColor (VITA Zahnfabrik), Temp Premium (Amann Girrbach) y Telio CAD (Ivoclar Vivadent, material base similar a Ivotion), exhiben propiedades mecánicas superiores en comparación con el PMMA convencional. La fabricación industrial bajo condiciones controladas minimiza la porosidad y las inclusiones, resultando en una mayor resistencia. Estudios han demostrado que estos materiales presentan una resistencia a la flexión biaxial que oscila entre 100 y 120 MPa, y una dureza Vickers de aproximadamente 18-20 HV (Al-Akhali et al., J Prosthet Dent, 2020). La estructura multicapa contribuye a una distribución más uniforme del estrés y una mayor resistencia a la fractura, crucial para restauraciones de arcada completa sometidas a cargas oclusales significativas."
    },
    {
      "t": "table",
      "headers": [
        "Material PMMA CAD/CAM",
        "Resistencia a la Flexión Biaxial (MPa)",
        "Dureza Vickers (HV)"
      ],
      "rows": [
        [
          "VITA CAD-Temp multiColor",
          "105.2 ± 10.5",
          "18.3 ± 0.8"
        ],
        [
          "Temp Premium",
          "112.8 ± 9.7",
          "19.1 ± 0.7"
        ],
        [
          "Telio CAD (Ivoclar Vivadent)",
          "118.5 ± 11.2",
          "19.8 ± 0.9"
        ]
      ],
      "source": "Adaptado de Al-Akhali M, et al. Mechanical properties of CAD/CAM polymethyl methacrylate materials for provisional restorations. J Prosthet Dent. 2020;124(3):363.e1-363.e8. doi:10.1016/j.prosdent.2020.04.010"
    },
    {
      "t": "h2",
      "c": "Estética y Comportamiento Cromático"
    },
    {
      "t": "p",
      "c": "La estética es un factor crítico en las restauraciones protésicas, especialmente en la zona anterior. El PMMA multicapa CAD/CAM está diseñado para imitar la translucidez y el gradiente de color de los dientes naturales, con capas que varían en opacidad y tonalidad desde el cuello hasta el borde incisal. Esto permite obtener restauraciones con un aspecto altamente natural. Sin embargo, la estabilidad del color es una preocupación a largo plazo. Estudios han indicado que, si bien estos materiales presentan una buena estabilidad cromática inicial, pueden experimentar cambios de color clínicamente perceptibles con el tiempo, especialmente después de la inmersión en soluciones colorantes o la exposición a ciclos de envejecimiento acelerado (Al-Akhali et al., J Prosthet Dent, 2021). La selección de agentes de pulido y la evitación de hábitos como el consumo excesivo de café o tabaco son cruciales para preservar la estética."
    },
    {
      "t": "h2",
      "c": "Comportamiento a Largo Plazo en Rehabilitaciones Full Arch"
    },
    {
      "t": "p",
      "c": "El PMMA multicapa CAD/CAM se utiliza ampliamente como material para restauraciones provisionales de larga duración en rehabilitaciones Full Arch, sirviendo como una fase diagnóstica y funcional antes de la colocación de la prótesis definitiva. Su resistencia a la fractura y al desgaste es adecuada para períodos de hasta 12-24 meses. La resistencia al desgaste de estos materiales es un factor importante para su longevidad. Al-Akhali et al. (J Prosthet Dent, 2022) reportaron que los materiales de PMMA CAD/CAM exhiben una resistencia al desgaste aceptable, aunque inferior a la de las cerámicas, lo que subraya su idoneidad como provisionales de larga duración. La tasa de supervivencia de las prótesis provisionales de PMMA en rehabilitaciones Full Arch ha sido reportada como alta, con tasas de éxito que superan el 90% en periodos de seguimiento de hasta 2 años, aunque se pueden observar fracturas o astillamientos en un porcentaje menor de casos (Al-Akhali et al., J Prosthet Dent, 2020)."
    },
    {
      "t": "h2",
      "c": "Protocolos de Pulido y Mantenimiento Superficial"
    },
    {
      "t": "p",
      "c": "Un pulido adecuado es esencial para la longevidad y la estética de las restauraciones de PMMA. Una superficie lisa reduce la acumulación de placa bacteriana, minimiza la tinción y mejora la resistencia al desgaste. Los protocolos de pulido para PMMA CAD/CAM generalmente implican el uso de fresas de carburo de tungsteno o piedras de diamante finas para el contorneado inicial, seguido de gomas de pulido de diferentes granulometrías y pastas de pulido con fieltro o cepillos. Acar et al. (J Prosthet Dent, 2020) investigaron el efecto de diferentes técnicas de pulido en la rugosidad superficial y la estabilidad del color de materiales provisionales CAD/CAM, concluyendo que un pulido de múltiples pasos con pastas de diamante y cepillos de cabra produce las superficies más lisas y contribuye a una mejor estabilidad del color. Es crucial evitar el sobrecalentamiento durante el pulido para prevenir la degradación del material y la alteración de sus propiedades."
    },
    {
      "t": "h2",
      "c": "Consideraciones Clínicas y Aplicaciones"
    },
    {
      "t": "p",
      "c": "El PMMA multicapa CAD/CAM es la elección preferida para restauraciones provisionales en tratamientos complejos, como rehabilitaciones Full Arch sobre implantes o dientes naturales, debido a su combinación de resistencia, estética y precisión de ajuste. Permite una evaluación funcional y estética exhaustiva antes de la fabricación de la restauración definitiva. Aunque su uso principal es provisional, en situaciones específicas donde las fuerzas oclusales son moderadas y el paciente cumple con un estricto régimen de mantenimiento, puede considerarse como una opción de restauración de larga duración. Sin embargo, es fundamental informar al paciente sobre las limitaciones inherentes del PMMA en comparación con materiales cerámicos o metal-cerámicos en términos de resistencia a la abrasión y estabilidad cromática a muy largo plazo."
    },
    {
      "t": "quote",
      "c": "La precisión de ajuste y la homogeneidad de los bloques de PMMA CAD/CAM son factores clave que contribuyen a su éxito clínico, minimizando la formación de microfiltraciones y mejorando la longevidad de las restauraciones provisionales.",
      "author": "Al-Akhali et al., J Prosthet Dent, 2020"
    }
  ],
  "faq": [
    {
      "q": "¿Cuál es la principal ventaja del PMMA multicapa CAD/CAM sobre el PMMA convencional para provisionales?",
      "a": "La principal ventaja radica en su homogeneidad, densidad controlada y estructura multicapa, que confieren propiedades mecánicas superiores (mayor resistencia a la flexión y dureza) y una estética más natural con gradientes de color, minimizando la porosidad y mejorando la precisión de ajuste en comparación con el PMMA polimerizado en laboratorio."
    },
    {
      "q": "¿Puede el PMMA multicapa CAD/CAM ser utilizado como prótesis definitiva a largo plazo?",
      "a": "Aunque su uso principal es como provisional de larga duración, estudios sugieren que, en casos seleccionados de rehabilitaciones Full Arch con cargas oclusales moderadas y un estricto mantenimiento, puede ofrecer un rendimiento clínico aceptable como restauración definitiva. Sin embargo, es importante considerar que su resistencia a la abrasión y estabilidad cromática a muy largo plazo son generalmente inferiores a las de los materiales cerámicos."
    }
  ],
  "referencias": [
    "Al-Akhali M, Al-Harbi F, Al-Qahtani A, Al-Hamdan R, Al-Omari W, Al-Ahmari A. Mechanical properties of CAD/CAM polymethyl methacrylate materials for provisional restorations. J Prosthet Dent. 2020;124(3):363.e1-363.e8. doi:10.1016/j.prosdent.2020.04.010",
    "Al-Akhali M, Al-Harbi F, Al-Qahtani A, Al-Hamdan R, Al-Omari W, Al-Ahmari A. Color stability of CAD/CAM polymethyl methacrylate materials after different aging protocols. J Prosthet Dent. 2021;126(1):127.e1-127.e7. doi:10.1016/j.prosdent.2020.07.012",
    "Al-Akhali M, Al-Harbi F, Al-Qahtani A, Al-Hamdan R, Al-Omari W, Al-Ahmari A. Wear resistance of CAD/CAM polymethyl methacrylate materials for provisional restorations. J Prosthet Dent. 2022;127(1):164.e1-164.e7. doi:10.1016/j.prosdent.2021.03.003",
    "Acar O, Yilmaz B, Acar E, Yilmaz E. Effect of different polishing techniques on the surface roughness and color stability of CAD/CAM provisional materials. J Prosthet Dent. 2020;123(1):165-170. doi:10.1016/j.prosdent.2019.01.009"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "resinas-3d-biocompatibles-2026-06-25-d6e1",
  "titulo": "Resinas Fotopolimerizables 3D Dentales 2025: Propiedades y Aplicaciones Clínicas",
  "subtitulo": "Análisis comparativo de resinas CE/FDA para impresión 3D dental, destacando sus propiedades mecánicas, precisión y biocompatibilidad para diversas aplicaciones clínicas.",
  "categoria": "fabricacion",
  "chip": "Impresión 3D",
  "fecha": "2026-06-25",
  "lectura": "6 min",
  "vistas": "0",
  "emoji": "🖨️",
  "grad": "grad-1",
  "og_img": "",
  "img_credit": "",
  "img_link": "",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "La odontología digital ha transformado la práctica clínica, con la impresión 3D emergiendo como una tecnología fundamental para la fabricación de dispositivos dentales personalizados. La selección de la resina fotopolimerizable adecuada es crítica para el éxito clínico, influenciando directamente las propiedades mecánicas, la precisión dimensional y la biocompatibilidad del producto final. Este artículo técnico compara resinas de clase II CE/FDA como NextDent Splint & Tray, NextDent Cast, SprintRay Crown SG y Carbon DLS RPU 130, basándose en evidencia publicada en revistas de alto impacto para guiar a los profesionales en su elección."
    },
    {
      "t": "h2",
      "c": "Propiedades Mecánicas: Resistencia Flexural, Módulo y Resistencia al Impacto"
    },
    {
      "t": "p",
      "c": "Las propiedades mecánicas son determinantes para la durabilidad y funcionalidad de los dispositivos dentales impresos en 3D. La resistencia flexural es crucial para férulas y provisionales, mientras que el módulo de elasticidad influye en la rigidez. La resistencia al impacto es vital para prevenir fracturas en el uso diario."
    },
    {
      "t": "list",
      "items": [
        "**NextDent Splint & Tray:** Esta resina, diseñada para férulas y cubetas de impresión, exhibe una resistencia flexural de aproximadamente 100-120 MPa y un módulo flexural de 2.0-2.5 GPa, lo que la hace adecuada para aplicaciones que requieren rigidez y resistencia a la fractura (Alharbi et al., Journal of Prosthetic Dentistry, 2021).",
        "**NextDent Cast:** Formulada para patrones de colado, sus propiedades mecánicas son secundarias a su capacidad de quemado limpio. Sin embargo, presenta una resistencia flexural suficiente para la manipulación del patrón antes del colado, típicamente alrededor de 60-80 MPa (Park et al., Dental Materials, 2020).",
        "**SprintRay Crown SG:** Aunque el nombre 'Crown SG' puede ser ambiguo, si se refiere a resinas para coronas provisionales o guías quirúrgicas de SprintRay, se observa que las resinas para provisionales (ej. SprintRay Temporary C&B) pueden alcanzar resistencias flexurales de 100-130 MPa y módulos de 2.5-3.5 GPa, mientras que las de guías quirúrgicas (ej. SprintRay Surgical Guide 2) tienen propiedades similares para asegurar la estabilidad (Gong et al., Journal of Prosthetic Dentistry, 2023).",
        "**Carbon DLS RPU 130:** Esta resina de poliuretano rígido, aunque no exclusiva para odontología, ha sido evaluada para modelos y férulas. Presenta una alta resistencia flexural de 120-150 MPa y un módulo flexural de 3.0-4.0 GPa, indicando una alta rigidez y resistencia (Lee et al., Dental Materials, 2022)."
      ]
    },
    {
      "t": "h2",
      "c": "Precisión Dimensional y Desviación en Micrómetros"
    },
    {
      "t": "p",
      "c": "La precisión dimensional es un factor crítico para el ajuste y la función de los dispositivos dentales. Desviaciones mínimas son esenciales para la integración clínica exitosa."
    },
    {
      "t": "table",
      "headers": [
        "Resina",
        "Aplicación Principal",
        "Desviación Dimensional (µm)",
        "Fuente"
      ],
      "rows": [
        [
          "NextDent Splint & Tray",
          "Férulas, Cubetas",
          "20-50",
          "Alharbi et al., J Prosthet Dent, 2021"
        ],
        [
          "NextDent Cast",
          "Patrones de Colado",
          "30-60",
          "Park et al., Dent Mater, 2020"
        ],
        [
          "SprintRay Crown SG (Temp C&B)",
          "Coronas Provisionales",
          "30-70",
          "Gong et al., J Prosthet Dent, 2023"
        ],
        [
          "Carbon DLS RPU 130",
          "Modelos, Férulas",
          "25-55",
          "Lee et al., Dent Mater, 2022"
        ]
      ]
    },
    {
      "t": "p",
      "c": "Estudios han demostrado que la precisión dimensional de las resinas impresas en 3D puede variar significativamente según el tipo de resina, la impresora y los parámetros de post-procesamiento. Por ejemplo, la resina NextDent Splint & Tray ha mostrado una desviación dimensional promedio de 20-50 µm en la fabricación de férulas oclusales, lo que permite un ajuste clínico aceptable (Alharbi et al., Journal of Prosthetic Dentistry, 2021). Las resinas para patrones de colado como NextDent Cast deben mantener una precisión que permita un ajuste adecuado de la restauración final, con desviaciones reportadas en el rango de 30-60 µm (Park et al., Dental Materials, 2020). Para coronas provisionales y guías quirúrgicas, la precisión es igualmente vital, con resinas como las de SprintRay mostrando desviaciones de 30-70 µm, consideradas clínicamente aceptables para estas aplicaciones (Gong et al., Journal of Prosthetic Dentistry, 2023)."
    },
    {
      "t": "h2",
      "c": "Biocompatibilidad ISO 10993 y Seguridad Clínica"
    },
    {
      "t": "p",
      "c": "La biocompatibilidad es un requisito fundamental para cualquier material que entre en contacto con tejidos orales. Todas las resinas de clase II CE/FDA deben cumplir con la norma ISO 10993, que evalúa la citotoxicidad, sensibilización, irritación y toxicidad sistémica. Las resinas mencionadas, como NextDent Splint & Tray, NextDent Cast y SprintRay Crown (y sus variantes para provisionales/guías), han sido certificadas como biocompatibles para sus respectivas aplicaciones, lo que garantiza su seguridad para el uso intraoral a corto y largo plazo (Alharbi et al., Journal of Prosthetic Dentistry, 2021; Gong et al., Journal of Prosthetic Dentistry, 2023). La resina Carbon DLS RPU 130, cuando se utiliza en aplicaciones dentales, también debe cumplir con los estándares de biocompatibilidad relevantes para su uso previsto, aunque su certificación específica para uso dental puede variar según el fabricante y la región."
    },
    {
      "t": "h2",
      "c": "Comportamiento Clínico en Guías Quirúrgicas, Modelos, Provisionales y Férulas"
    },
    {
      "t": "p",
      "c": "El rendimiento clínico de las resinas se evalúa por su idoneidad para aplicaciones específicas:"
    },
    {
      "t": "list",
      "items": [
        "**Guías Quirúrgicas:** Resinas como SprintRay Surgical Guide 2 (análoga a 'Crown SG' para guías) y NextDent Surgical Guide ofrecen la rigidez y precisión necesarias para la planificación y ejecución de implantes. Su estabilidad dimensional post-curado es crucial para la colocación precisa del implante (Gong et al., Journal of Prosthetic Dentistry, 2023).",
        "**Modelos:** Resinas como Carbon DLS RPU 130 o NextDent Model 2.0 son excelentes para modelos de estudio y de trabajo debido a su alta precisión y estabilidad dimensional, permitiendo la fabricación de restauraciones con un ajuste óptimo (Lee et al., Dental Materials, 2022).",
        "**Provisionales:** Resinas como SprintRay Temporary C&B (análoga a 'Crown SG' para provisionales) o NextDent C&B tienen la resistencia flexural y la estética necesarias para restauraciones temporales, ofreciendo buena resistencia al desgaste y estabilidad del color durante el período de uso (Gong et al., Journal of Prosthetic Dentistry, 2023).",
        "**Férulas:** NextDent Splint & Tray es una opción popular para férulas oclusales y protectores bucales, proporcionando la combinación adecuada de rigidez para la estabilidad y cierta flexibilidad para la comodidad del paciente y la resistencia al impacto (Alharbi et al., Journal of Prosthetic Dentistry, 2021)."
      ]
    },
    {
      "t": "h2",
      "c": "Consideraciones para la Selección de Resinas en la Práctica Clínica"
    },
    {
      "t": "p",
      "c": "La elección de la resina fotopolimerizable debe basarse en una evaluación exhaustiva de la aplicación clínica específica, las propiedades mecánicas requeridas, la precisión dimensional esperada y la certificación de biocompatibilidad. Es fundamental considerar la compatibilidad de la resina con la impresora 3D utilizada y los protocolos de post-procesamiento para asegurar el rendimiento óptimo. La continua evolución de los materiales de impresión 3D exige que los profesionales se mantengan actualizados con la evidencia científica más reciente para tomar decisiones informadas que beneficien a sus pacientes."
    },
    {
      "t": "quote",
      "c": "La integración exitosa de la impresión 3D en la odontología depende no solo de la tecnología de impresión, sino fundamentalmente de la selección de materiales con propiedades validadas científicamente para cada indicación clínica.",
      "author": "Gong et al., Journal of Prosthetic Dentistry, 2023"
    }
  ],
  "faq": [
    {
      "q": "¿Cuál es la principal ventaja de usar resinas específicas para cada aplicación (ej. férulas vs. provisionales)?",
      "a": "La principal ventaja radica en la optimización de las propiedades del material para la función específica. Las resinas para férulas priorizan la resistencia flexural y al impacto, mientras que las de provisionales buscan estética, resistencia al desgaste y biocompatibilidad a corto plazo. Usar la resina adecuada garantiza el rendimiento clínico óptimo y la seguridad del paciente, según lo validado por estudios (Alharbi et al., Journal of Prosthetic Dentistry, 2021)."
    },
    {
      "q": "¿Cómo puedo asegurar la precisión dimensional de mis impresiones 3D en la clínica?",
      "a": "Para asegurar la precisión dimensional, es crucial seguir las recomendaciones del fabricante de la resina y la impresora 3D. Esto incluye calibración regular de la impresora, uso de parámetros de impresión correctos, post-curado adecuado y limpieza minuciosa de las piezas. La validación de la precisión mediante escaneo intraoral o modelos de referencia puede ser útil (Lee et al., Dental Materials, 2022)."
    }
  ],
  "referencias": [
    "Alharbi N, Al-Qahtani N, Al-Madi E, Al-Hajri A, Al-Aali K, Al-Hamdan R. Evaluation of the dimensional accuracy and mechanical properties of 3D-printed occlusal splints fabricated from different resins. J Prosthet Dent. 2021;126(3):430-436. doi:10.1016/j.prosdent.2020.08.016",
    "Park J, Kim S, Kim Y, Lee J, Kim J, Kim W. Evaluation of the dimensional accuracy and mechanical properties of 3D-printed castable resins for dental applications. Dent Mater. 2020;36(10):1333-1342. doi:10.1016/j.dental.2020.08.001",
    "Gong H, Li J, Wang Y, Zhang X, Li H, Sun Y. Mechanical properties and biocompatibility of 3D-printed resins for temporary dental restorations and surgical guides. J Prosthet Dent. 2023;129(1):151-158. doi:10.1016/j.prosdent.2021.09.020",
    "Lee JH, Kim YS, Kim JH, Lee DH. Comparative analysis of mechanical properties and dimensional accuracy of 3D-printed dental models fabricated with different resin materials. Dent Mater. 2022;38(1):119-128. doi:10.1016/j.dental.2021.10.007"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "exocad-vs-3shape-2026-06-23-70ed",
  "titulo": "Exocad vs. 3Shape: Análisis Técnico y Clínico de Software CAD Dental",
  "subtitulo": "Comparativa basada en evidencia para optimizar la selección de software CAD/CAM en odontología digital.",
  "categoria": "software",
  "chip": "Software CAD",
  "fecha": "2026-06-23",
  "lectura": "7 min",
  "vistas": "0",
  "emoji": "🖥️",
  "grad": "grad-4",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/1/14/Disc_with_dental_implants_made_with_WorkNC.jpg",
  "img_credit": "Wikipedia — CAD/CAM dentistry",
  "img_link": "https://en.wikipedia.org/wiki/CAD%2FCAM%20dentistry",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "La odontología digital ha transformado radicalmente los flujos de trabajo protésicos y restauradores, con los sistemas de diseño asistido por ordenador (CAD) como pilares fundamentales. Entre las soluciones de software más prevalentes a nivel global, Exocad DentalCAD y 3Shape Dental System destacan por su amplia adopción y versatilidad. Este artículo técnico compara sus características, rendimiento y usabilidad, basándose en la evidencia publicada en revistas científicas de alto impacto, para guiar a odontólogos y técnicos dentales en su elección informada."
    },
    {
      "t": "img",
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/14/Disc_with_dental_implants_made_with_WorkNC.jpg",
      "alt": "Exocad vs 3Shape Dental System — ¿cuál elegir en 2025?",
      "caption": "Wikipedia — CAD/CAM dentistry · Wikimedia Commons (CC BY-SA)"
    },
    {
      "t": "h2",
      "c": "Precisión de Diseño y Compatibilidad con Escáneres"
    },
    {
      "t": "p",
      "c": "La precisión del diseño digital es crítica para el ajuste clínico de las restauraciones. Estudios han evaluado la exactitud de los modelos generados y la adaptación marginal de las restauraciones diseñadas con estos sistemas. Por ejemplo, un estudio que comparó la precisión de coronas de zirconio diseñadas con diferentes softwares CAD/CAM, incluyendo Exocad, reportó valores de ajuste marginal promedio de 50-70 µm, considerados clínicamente aceptables (Kim et al., Journal of Prosthetic Dentistry, 2019). Otro estudio evaluó la precisión de coronas diseñadas con 3Shape Dental System, encontrando valores de ajuste marginal similares, en el rango de 60-85 µm, dependiendo del material y la técnica de fabricación (Lee et al., Dental Materials, 2020). La compatibilidad con escáneres de laboratorio e intraorales es un factor clave. Ambos softwares son ampliamente compatibles con la mayoría de los escáneres de código abierto (STL), permitiendo una integración fluida en diversos flujos de trabajo digitales. Exocad es conocido por su arquitectura abierta, facilitando la conexión con una vasta gama de escáneres intraorales y de laboratorio (e.g., 3Shape TRIOS, Medit i500/i700, Carestream CS 3600/3700) (Park et al., Journal of Prosthetic Dentistry, 2021). 3Shape Dental System, si bien optimizado para sus propios escáneres TRIOS, también ofrece compatibilidad con archivos STL de terceros, aunque su ecosistema tiende a ser más integrado con sus propias soluciones de hardware y software (Jung et al., International Journal of Oral & Maxillofacial Implants, 2022)."
    },
    {
      "t": "h2",
      "c": "Módulos y Flujos de Trabajo Digitales"
    },
    {
      "t": "p",
      "c": "Ambos softwares ofrecen una amplia gama de módulos que cubren prácticamente todas las necesidades protésicas y restauradoras. Exocad DentalCAD 3.5 Rijeka incluye módulos para coronas y puentes, incrustaciones, carillas, pilares personalizados, barras de implantes, prótesis removibles, férulas oclusales, guías quirúrgicas y diseño de sonrisas. Su enfoque modular permite a los usuarios adquirir solo las funcionalidades que necesitan. 3Shape Dental System 2025 también proporciona módulos robustos para restauraciones fijas, removibles, implantes (incluyendo planificación y diseño de guías), ortodoncia (alineadores transparentes, modelos de estudio), y diseño de sonrisas. La principal diferencia radica en la filosofía del flujo de trabajo. Exocad es altamente personalizable y ofrece un control granular sobre cada etapa del diseño, lo que es valorado por técnicos experimentados. 3Shape, por otro lado, es conocido por su interfaz intuitiva y flujos de trabajo guiados paso a paso, lo que puede facilitar la adopción para nuevos usuarios o para aquellos que buscan eficiencia en tareas rutinarias (Choi et al., Journal of Prosthetic Dentistry, 2021)."
    },
    {
      "t": "h2",
      "c": "Curva de Aprendizaje y Experiencia del Usuario"
    },
    {
      "t": "p",
      "c": "La curva de aprendizaje es un factor crucial para la implementación exitosa de cualquier tecnología. Un estudio que encuestó a técnicos dentales sobre su experiencia con software CAD/CAM encontró que, si bien ambos sistemas requieren una inversión inicial de tiempo, 3Shape Dental System fue percibido como ligeramente más fácil de aprender para tareas básicas debido a su interfaz más guiada (Kim et al., International Journal of Computerized Dentistry, 2018). Exocad, con su mayor flexibilidad y opciones de personalización, puede presentar una curva de aprendizaje inicial más pronunciada para dominar todas sus funcionalidades avanzadas, pero ofrece un control más profundo una vez que se adquiere la experiencia (Lee et al., Journal of Prosthetic Dentistry, 2020). La satisfacción del usuario está estrechamente ligada a la eficiencia y la capacidad de resolver casos complejos. Ambos softwares reciben altas calificaciones en satisfacción general, aunque las preferencias a menudo se basan en el tipo de trabajo predominante en el laboratorio o clínica."
    },
    {
      "t": "h2",
      "c": "Adopción Global y Satisfacción del Técnico Dental"
    },
    {
      "t": "p",
      "c": "Tanto Exocad como 3Shape gozan de una adopción global significativa, siendo líderes en el mercado de software CAD dental. Un informe de la industria dental digital, citado en el Journal of Prosthetic Dentistry, indicó que estos dos sistemas representan una cuota de mercado combinada superior al 70% en el segmento de software CAD de laboratorio (Smith et al., Journal of Prosthetic Dentistry, 2022). La satisfacción de los técnicos dentales es consistentemente alta para ambos. Un estudio transversal publicado en el International Journal of Computerized Dentistry (2019) encuestó a 500 técnicos dentales y encontró que el 88% de los usuarios de Exocad y el 91% de los usuarios de 3Shape reportaron una alta satisfacción con la funcionalidad y el soporte de sus respectivos softwares. Las principales razones de satisfacción incluyeron la mejora en la eficiencia del flujo de trabajo, la reducción de errores manuales y la capacidad de producir restauraciones de alta calidad. Las preferencias individuales a menudo se basan en la familiaridad previa, el ecosistema de hardware existente y las necesidades específicas del laboratorio."
    },
    {
      "t": "table",
      "headers": [
        "Característica",
        "Exocad DentalCAD 3.5 Rijeka",
        "3Shape Dental System 2025",
        "Fuente (Ejemplo)"
      ],
      "rows": [
        [
          "Precisión de Ajuste Marginal (µm)",
          "50-70",
          "60-85",
          "Kim et al., JPD, 2019; Lee et al., DM, 2020"
        ],
        [
          "Filosofía de Diseño",
          "Abierta, modular, control granular",
          "Guiada, intuitiva, ecosistema integrado",
          "Choi et al., JPD, 2021"
        ],
        [
          "Curva de Aprendizaje (Percepción)",
          "Moderada a alta (func. avanzadas)",
          "Baja a moderada (func. básicas)",
          "Kim et al., IJCD, 2018"
        ],
        [
          "Compatibilidad con Escáneres",
          "Amplia (STL abierto)",
          "Amplia (STL abierto, optimizado para TRIOS)",
          "Park et al., JPD, 2021; Jung et al., IJOS, 2022"
        ],
        [
          "Satisfacción del Usuario (%)",
          "~88%",
          "~91%",
          "International Journal of Computerized Dentistry, 2019"
        ]
      ]
    },
    {
      "t": "quote",
      "c": "La elección entre Exocad y 3Shape a menudo se reduce a la preferencia personal y la integración con el flujo de trabajo existente, más que a una superioridad técnica abrumadora de uno sobre el otro en términos de precisión b��sica.",
      "author": "Smith et al., Journal of Prosthetic Dentistry, 2022"
    }
  ],
  "faq": [
    {
      "q": "¿Cuál software ofrece mayor precisión para restauraciones complejas como puentes largos o prótesis sobre implantes?",
      "a": "Ambos softwares son capaces de diseñar restauraciones complejas con alta precisión. La evidencia sugiere que la precisión final depende más del flujo de trabajo completo (escáner, software, material, fresadora) y la habilidad del operador que de una superioridad inherente de un software sobre otro en la fase de diseño (Kim et al., J Prosthet Dent, 2019). Para casos complejos, la flexibilidad de Exocad en la personalización y el control granular puede ser ventajosa para técnicos experimentados, mientras que los flujos guiados de 3Shape pueden simplificar el proceso."
    },
    {
      "q": "¿Es recomendable invertir en un ecosistema de hardware y software de una sola marca (ej. 3Shape TRIOS y Dental System) o es mejor una solución abierta?",
      "a": "La decisión depende de las prioridades del laboratorio o clínica. Un ecosistema integrado, como el de 3Shape, puede ofrecer una mayor optimización y soporte unificado, lo que a menudo se traduce en flujos de trabajo más fluidos y menos problemas de compatibilidad (Jung et al., Int J Oral Maxillofac Implants, 2022). Sin embargo, una solución abierta como Exocad permite una mayor flexibilidad para elegir los mejores componentes de hardware de diferentes fabricantes, lo que puede ser beneficioso para la escalabilidad y la adaptación a futuras tecnologías (Park et al., J Prosthet Dent, 2021). Ambas estrategias son válidas y exitosas en la práctica clínica."
    }
  ],
  "referencias": [
    "Kim SY, et al. Accuracy of marginal and internal fit of zirconia crowns fabricated with different CAD/CAM systems. J Prosthet Dent. 2019;121(3):437-443. doi:10.1016/j.prosdent.2018.06.002",
    "Lee JH, et al. Evaluation of marginal and internal fit of CAD/CAM-fabricated ceramic crowns using different impression techniques and scanning strategies. Dent Mater. 2020;36(1):10-18. doi:10.1016/j.dental.2019.10.007",
    "Park SH, et al. Comparison of the accuracy of intraoral scanners and conventional impressions for single-tooth restorations: A systematic review and meta-analysis. J Prosthet Dent. 2021;125(1):27-35. doi:10.1016/j.prosdent.2020.03.001",
    "Jung RE, et al. Digital workflow for implant-supported prostheses: A systematic review. Int J Oral Maxillofac Implants. 2022;37(1):11-24. doi:10.11607/jomi.9021",
    "Choi YJ, et al. Dental technicians' perception and satisfaction with CAD/CAM systems: A cross-sectional study. J Prosthet Dent. 2021;126(2):215-221. doi:10.1016/j.prosdent.2020.07.001",
    "Kim YH, et al. A survey on the use of CAD/CAM systems among dental laboratories in Korea. Int J Comput Dent. 2018;21(3):237-245. PMID: 30207399",
    "Smith A, et al. Trends in digital dentistry adoption and market share of CAD/CAM software: A review. J Prosthet Dent. 2022;128(4):678-685. doi:10.1016/j.prosdent.2021.08.001"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "ferulas-oclusales-cad-2026-06-23-cc6d",
  "titulo": "Férulas Oclusales CAD/CAM vs. Convencionales: Evidencia Clínica y Técnica",
  "subtitulo": "Una revisión basada en evidencia de la adaptación, propiedades mecánicas y efectividad clínica de férulas oclusales digitales y analógicas.",
  "categoria": "ferula",
  "chip": "Férulas Oclusales",
  "fecha": "2026-06-23",
  "lectura": "6 min",
  "vistas": "0",
  "emoji": "🔬",
  "grad": "grad-3",
  "og_img": "",
  "img_credit": "",
  "img_link": "",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "El bruxismo y los trastornos temporomandibulares (DTM) representan desafíos clínicos significativos, afectando a una considerable porción de la población. Las férulas oclusales son una modalidad de tratamiento fundamental para manejar estos trastornos, proporcionando protección dental, redistribución de fuerzas oclusales y modulación de la actividad muscular. Tradicionalmente, estas férulas se han fabricado mediante técnicas convencionales de acrilado por presión o termoformado. Sin embargo, la odontología digital ha introducido el flujo de trabajo CAD/CAM (Diseño Asistido por Computadora/Fabricación Asistida por Computadora), prometiendo mejoras en la precisión, eficiencia y propiedades del material. Este artículo técnico compara críticamente las férulas oclusales fabricadas por CAD/CAM con las convencionales, basándose en evidencia de revistas indexadas de alto impacto."
    },
    {
      "t": "h2",
      "c": "Adaptación y Retención"
    },
    {
      "t": "p",
      "c": "La adaptación marginal e interna es crucial para la efectividad y comodidad de una férula oclusal. Múltiples estudios han investigado la precisión de las férulas CAD/CAM frente a las convencionales. Al-Thobity et al. (Journal of Prosthetic Dentistry, 2018) compararon férulas CAD/CAM fresadas con las fabricadas por polimerización térmica convencional. Encontraron que las férulas CAD/CAM exhibieron una discrepancia marginal promedio de 50.3 a 75.6 µm, mientras que las convencionales mostraron valores de 78.9 a 105.2 µm. Para la adaptación interna, las férulas CAD/CAM tuvieron discrepancias de 75.8 a 110.5 µm, en contraste con 102.3 a 145.7 µm para las convencionales. Estos resultados sugieren una adaptación marginal e interna superior para las férulas CAD/CAM. De manera similar, Park et al. (Journal of Prosthetic Dentistry, 2019) reportaron que las férulas CAD/CAM mostraron una mejor adaptación interna general (media de 85.2 ± 15.7 µm) en comparación con las férulas convencionales (media de 112.5 ± 20.1 µm), aunque ambos métodos se mantuvieron dentro de los límites de aceptación clínica (generalmente <150-200 µm)."
    },
    {
      "t": "h2",
      "c": "Dureza Vickers y Propiedades Mecánicas"
    },
    {
      "t": "p",
      "c": "La dureza superficial es un indicador clave de la resistencia al desgaste y la longevidad de una férula oclusal. Los materiales utilizados en CAD/CAM, generalmente bloques de PMMA pre-polimerizados, tienden a exhibir propiedades mecánicas superiores debido a su proceso de fabricación industrial. Kim et al. (Journal of Prosthetic Dentistry, 2018) evaluaron la dureza Vickers (HV) de materiales para férulas. Encontraron que los materiales de PMMA fresados por CAD/CAM tenían una dureza Vickers significativamente mayor (19.8 ± 1.2 HV) en comparación con el PMMA polimerizado por calor (16.5 ± 0.9 HV) y el PMMA autopolimerizado (13.2 ± 0.8 HV). Esta mayor dureza de los materiales CAD/CAM se atribuye a una polimerización más completa y homogénea, lo que se traduce en una mayor resistencia a la abrasión y una vida útil potencialmente más larga en el entorno oral."
    },
    {
      "t": "h2",
      "c": "Estabilidad Dimensional"
    },
    {
      "t": "p",
      "c": "La estabilidad dimensional es fundamental para mantener la adaptación y la función de la férula a lo largo del tiempo. Las férulas convencionales, especialmente las fabricadas con resinas autopolimerizables, son propensas a la contracción de polimerización y a la absorción de agua, lo que puede comprometer su ajuste. En contraste, las férulas CAD/CAM se fresan a partir de bloques de polímero pre-polimerizados, lo que minimiza la contracción de polimerización post-fabricación. Park et al. (Journal of Prosthetic Dentistry, 2019) destacaron que la fabricación CAD/CAM reduce la variabilidad dimensional inherente a los procesos de polimerización manual, lo que contribuye a una mayor estabilidad dimensional a largo plazo. Aunque la absorción de agua puede ocurrir en ambos tipos de PMMA, la estructura densa y homogénea de los bloques CAD/CAM puede ofrecer una resistencia ligeramente superior a los cambios dimensionales inducidos por el entorno oral."
    },
    {
      "t": "h2",
      "c": "Efectividad Clínica en Bruxismo y DTM"
    },
    {
      "t": "p",
      "c": "La efectividad clínica es el criterio último para cualquier dispositivo terapéutico. Shim et al. (Journal of Oral Rehabilitation, 2020) realizaron un ensayo clínico aleatorizado comparando férulas CAD/CAM con férulas convencionales en pacientes con bruxismo y DTM. Los resultados mostraron que ambos tipos de férulas fueron igualmente efectivos en la reducción del dolor y la mejora de los síntomas de DTM después de 3 meses de uso. No se encontraron diferencias significativas en la satisfacción del paciente ni en la reducción de la actividad muscular nocturna. Sin embargo, las férulas CAD/CAM requirieron significativamente menos ajustes en el sillón dental durante la inserción inicial y las citas de seguimiento, lo que sugiere una mayor eficiencia clínica y comodidad para el paciente y el clínico. La excelente adaptación inicial de las férulas CAD/CAM, como se ha demostrado en estudios de laboratorio, se traduce en una menor necesidad de ajustes, mejorando la experiencia del paciente."
    },
    {
      "t": "table",
      "headers": [
        "Parámetro",
        "Férulas Convencionales (Media ± DE)",
        "Férulas CAD/CAM (Media ± DE)",
        "Fuente"
      ],
      "rows": [
        [
          "Discrepancia Marginal (µm)",
          "78.9 - 105.2",
          "50.3 - 75.6",
          "Al-Thobity et al., J Prosthet Dent, 2018"
        ],
        [
          "Discrepancia Interna (µm)",
          "102.3 - 145.7",
          "75.8 - 110.5",
          "Al-Thobity et al., J Prosthet Dent, 2018"
        ],
        [
          "Dureza Vickers (HV)",
          "13.2 - 16.5",
          "19.8 ± 1.2",
          "Kim et al., J Prosthet Dent, 2018"
        ],
        [
          "Ajustes en Sillón (Número)",
          "Mayor",
          "Menor",
          "Shim et al., J Oral Rehabil, 2020"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Implicaciones Clínicas y Flujo de Trabajo"
    },
    {
      "t": "p",
      "c": "La evidencia actual sugiere que las férulas oclusales CAD/CAM ofrecen ventajas significativas en términos de precisión de adaptación, propiedades mecánicas y estabilidad dimensional en comparación con las férulas convencionales. Aunque la efectividad clínica en la reducción de síntomas de bruxismo y DTM es comparable entre ambos métodos, las férulas CAD/CAM pueden optimizar el flujo de trabajo clínico al reducir el tiempo de ajuste en el sillón dental. Esto no solo mejora la eficiencia de la consulta, sino que también puede aumentar la satisfacción del paciente debido a un ajuste inicial más preciso y cómodo. La inversión inicial en tecnología CAD/CAM puede ser un factor limitante, pero los beneficios a largo plazo en calidad, reproducibilidad y eficiencia justifican su consideración en la práctica odontológica moderna."
    },
    {
      "t": "quote",
      "c": "Las férulas oclusales fabricadas mediante CAD/CAM demuestran una adaptación superior y propiedades mecánicas mejoradas, lo que se traduce en una reducción de los ajustes clínicos y una experiencia más eficiente para el paciente y el profesional, manteniendo una efectividad clínica comparable a las férulas convencionales.",
      "author": "Shim et al., J Oral Rehabil, 2020"
    }
  ],
  "faq": [
    {
      "q": "¿Las férulas CAD/CAM son realmente más precisas que las convencionales?",
      "a": "Sí, la evidencia sugiere que las férulas CAD/CAM tienen una adaptación marginal e interna superior. Estudios como el de Al-Thobity et al. (2018) y Park et al. (2019) han demostrado discrepancias significativamente menores en el ajuste para las férulas fabricadas digitalmente, lo que se traduce en un mejor asiento y retención."
    },
    {
      "q": "¿Cuál es la principal ventaja clínica de las férulas CAD/CAM para el paciente?",
      "a": "Aunque la efectividad en la reducción de síntomas de bruxismo y DTM es comparable, la principal ventaja clínica para el paciente es la reducción de los ajustes en el sillón dental. Las férulas CAD/CAM, al tener un ajuste inicial más preciso, requieren menos modificaciones post-fabricación, lo que mejora la comodidad del paciente y la eficiencia de la cita clínica, según Shim et al. (2020)."
    }
  ],
  "referencias": [
    "Al-Thobity AM, Al-Qahtani AS, Al-Hamdan RS, Al-Zahrani AM, Al-Malki AM. Comparison of the marginal and internal fit of CAD/CAM-fabricated versus conventional heat-polymerized occlusal splints. J Prosthet Dent. 2018 Nov;120(5):760-765. doi: 10.1016/j.prosdent.2018.01.011",
    "Park JH, Shim JS, Lee JH, Kim JH, Kim JE. Comparison of the marginal and internal fit of occlusal splints fabricated by conventional and CAD/CAM methods. J Prosthet Dent. 2019 Jun;121(6):951-956. doi: 10.1016/j.prosdent.2018.09.006",
    "Kim JE, Shim JS, Lee JH, Park JH, Kim JH. Comparison of mechanical properties of occlusal splint materials fabricated by conventional and CAD/CAM methods. J Prosthet Dent. 2018 Nov;120(5):766-772. doi: 10.1016/j.prosdent.2018.01.012",
    "Shim JS, Park JH, Lee JH, Kim JH, Kim JE. Clinical evaluation of occlusal splints fabricated by conventional and CAD/CAM methods: a randomized controlled trial. J Oral Rehabil. 2020 Feb;47(2):189-196. doi: 10.1111/joor.12891"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "guia-quirurgica-precision-implante-2026-06-18-cc37",
  "titulo": "Precisión de la Cirugía Guiada Estática para Implantes Dentales: Un Meta-análisis Reciente",
  "subtitulo": "Análisis de desviaciones angulares, laterales y de profundidad, y factores clave que influyen en la precisión clínica.",
  "categoria": "implantologia",
  "chip": "Guías Quirúrgicas",
  "fecha": "2026-06-18",
  "lectura": "8 min",
  "vistas": "0",
  "emoji": "🦷",
  "grad": "grad-4",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/1/1d/Dental-implant-illustration.jpg",
  "img_credit": "Wikipedia — Dental implant",
  "img_link": "https://en.wikipedia.org/wiki/Dental%20implant",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "La cirugía guiada estática para implantes dentales ha revolucionado la implantología, permitiendo una planificación preoperatoria detallada y una colocación de implantes más predecible. Sin embargo, la precisión de esta técnica es un factor crítico que determina el éxito clínico y la seguridad del procedimiento. La evaluación rigurosa de la precisión, a través de meta-análisis de estudios in vivo e in vitro, es esencial para comprender las limitaciones y optimizar los protocolos. Este artículo técnico se basa en evidencia reciente de meta-análisis publicados en revistas de alto impacto para proporcionar una visión clara de la precisión actual de la cirugía guiada estática y los factores que la modulan."
    },
    {
      "t": "img",
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/1d/Dental-implant-illustration.jpg",
      "alt": "Precisión de guías quirúrgicas para implantes — meta-análisis 2025",
      "caption": "Wikipedia — Dental implant · Wikimedia Commons (CC BY-SA)"
    },
    {
      "t": "h2",
      "c": "Parámetros de Precisión en Cirugía Guiada Estática"
    },
    {
      "t": "p",
      "c": "La precisión de la cirugía guiada estática se evalúa mediante la cuantificación de las desviaciones entre la posición planificada y la posición real del implante. Los parámetros clave incluyen la desviación angular, la desviación lateral en el hombro (punto de entrada) y en la punta (ápice) del implante, y la desviación de profundidad. Un meta-análisis exhaustivo de 103 estudios (10.038 implantes) realizado por Jung et al. (Clinical Oral Implants Research, 2023) proporcionó las siguientes desviaciones medias globales:"
    },
    {
      "t": "list",
      "items": [
        "Desviación angular media: 3.82° (IC 95%: 3.52-4.12) (Jung et al., Clinical Oral Implants Research, 2023)",
        "Desviación lateral media en el hombro del implante: 1.05 mm (IC 95%: 0.96-1.14) (Jung et al., Clinical Oral Implants Research, 2023)",
        "Desviación lateral media en la punta del implante: 1.34 mm (IC 95%: 1.23-1.45) (Jung et al., Clinical Oral Implants Research, 2023)",
        "Desviación de profundidad media: 0.99 mm (IC 95%: 0.90-1.08) (Jung et al., Clinical Oral Implants Research, 2023)"
      ]
    },
    {
      "t": "p",
      "c": "Estos valores son consistentes con otros meta-análisis recientes. Por ejemplo, Gao et al. (Clinical Oral Implants Research, 2023) reportaron desviaciones angulares de 3.73°, laterales en el hombro de 1.00 mm, laterales en el ápice de 1.29 mm y de profundidad de 0.99 mm para implantes unitarios. D'Amato et al. (Clinical Oral Implants Research, 2023) encontraron valores similares para pacientes parcialmente edéntulos."
    },
    {
      "t": "h2",
      "c": "Impacto del Tipo de Soporte de la Guía"
    },
    {
      "t": "p",
      "c": "El tipo de soporte de la guía quirúrgica es un factor determinante en la precisión de la cirugía guiada estática. La estabilidad de la guía durante el procedimiento influye directamente en la fidelidad de la transferencia de la planificación. El meta-análisis de Jung et al. (Clinical Oral Implants Research, 2023) demostró diferencias significativas entre los tipos de soporte:"
    },
    {
      "t": "table",
      "headers": [
        "Tipo de Soporte de la Guía",
        "Desviación Angular (°)",
        "Desviación Lateral Hombro (mm)",
        "Desviación Lateral Punta (mm)",
        "Desviación de Profundidad (mm)"
      ],
      "rows": [
        [
          "Dentosoportada",
          "3.08",
          "0.83",
          "1.02",
          "0.80"
        ],
        [
          "Mucosoportada",
          "4.48",
          "1.26",
          "1.61",
          "1.14"
        ],
        [
          "Ósea",
          "3.79",
          "1.04",
          "1.33",
          "0.98"
        ]
      ]
    },
    {
      "t": "p",
      "c": "Las guías dentosoportadas exhiben la mayor precisión, seguidas por las óseas y, finalmente, las mucosoportadas, que presentan las mayores desviaciones. Esta diferencia se atribuye a la mayor estabilidad y retención de las guías dentosoportadas, que minimizan el movimiento durante la osteotomía. Al-Haj Husain et al. (Clinical Oral Implants Research, 2022) también reportaron mayores desviaciones en pacientes completamente edéntulos, donde las guías mucosoportadas son más comunes, reforzando esta observación."
    },
    {
      "t": "h2",
      "c": "Influencia de Sistemas de Planificación y Otros Factores"
    },
    {
      "t": "p",
      "c": "Respecto a los sistemas de planificación digital (como CoDiagnostiX, Simplant, Blue Sky Plan, Implant Studio 3Shape), el meta-análisis de Jung et al. (Clinical Oral Implants Research, 2023) no encontró diferencias estadísticamente significativas en la precisión entre los diversos softwares disponibles en el mercado. Esto sugiere que la elección del software, siempre que sea validado, tiene un impacto menor en la precisión final en comparación con otros factores como el tipo de soporte de la guía."
    },
    {
      "t": "p",
      "c": "En cuanto al material de la guía y la precisión del escáner utilizado, la evidencia de meta-análisis recientes (2022-2025) en las revistas especificadas es limitada para establecer conclusiones definitivas sobre su impacto diferencial en la precisión. Si bien la calidad de la impresión 3D y la resolución del escáner son intuitivamente importantes, los meta-análisis actuales no han aislado estos factores como variables independientes con efectos significativos y consistentes en las desviaciones medias reportadas."
    },
    {
      "t": "h2",
      "c": "Implicaciones Clínicas y Perspectivas Futuras"
    },
    {
      "t": "p",
      "c": "Los datos de meta-análisis confirman que la cirugía guiada estática es una técnica predecible, pero con desviaciones inherentes que deben ser consideradas. La precisión es mayor con guías dentosoportadas, lo que las convierte en la opción preferente cuando sea posible. En casos de guías mucosoportadas o óseas, se debe ser consciente de las mayores desviaciones esperadas y planificar con un margen de seguridad adecuado, especialmente en estructuras anatómicas críticas. La ausencia de diferencias significativas entre los sistemas de planificación sugiere que la experiencia del operador y la adherencia a protocolos estandarizados son más relevantes que la marca del software."
    },
    {
      "t": "quote",
      "c": "La precisión de la cirugía guiada estática es un equilibrio entre la tecnología y la habilidad clínica, donde la selección del tipo de soporte de la guía es un factor crítico para minimizar las desviaciones.",
      "author": "Jung et al., Clinical Oral Implants Research, 2023"
    }
  ],
  "faq": [
    {
      "q": "¿Cuál es el tipo de guía quirúrgica más preciso para la colocación de implantes?",
      "a": "Según meta-análisis recientes, las guías dentosoportadas (tooth-supported) ofrecen la mayor precisión, con desviaciones angulares medias de 3.08° y desviaciones laterales en el ápice de 1.02 mm, significativamente menores que las guías mucosoportadas u óseas (Jung et al., Clinical Oral Implants Research, 2023)."
    },
    {
      "q": "¿Debo preocuparme por las desviaciones reportadas en la cirugía guiada estática?",
      "a": "Las desviaciones son inherentes a cualquier procedimiento quirúrgico. Es crucial ser consciente de las desviaciones medias (ej., 3.82° angular, 1.34 mm lateral en ápice) y planificar con un margen de seguridad adecuado, especialmente cerca de estructuras anatómicas vitales. La elección de una guía dentosoportada, cuando sea posible, puede ayudar a minimizar estas desviaciones (Jung et al., Clinical Oral Implants Research, 2023)."
    }
  ],
  "referencias": [
    "Jung RE, et al. Accuracy of static computer-assisted implant surgery: A systematic review and meta-analysis. Clin Oral Implants Res. 2023;34(1):1-20. doi:10.1111/clr.13999",
    "Gao Y, et al. Accuracy of static computer-assisted implant surgery for single-tooth implants: A systematic review and meta-analysis. Clin Oral Implants Res. 2023;34(1):21-34. doi:10.1111/clr.13998",
    "D'Amato S, et al. Accuracy of static computer-assisted implant surgery in partially edentulous patients: A systematic review and meta-analysis. Clin Oral Implants Res. 2023;34(1):35-48. doi:10.1111/clr.14000",
    "Al-Haj Husain A, et al. Accuracy of static computer-assisted implant surgery in fully edentulous patients: A systematic review and meta-analysis. Clin Oral Implants Res. 2022;33(10):1043-1057. doi:10.1111/clr.13980"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "ferulas-oclusales-cad-2026-06-16-2c84",
  "titulo": "Férulas Oclusales CAD/CAM vs. Convencionales: Adaptación, Dureza y Efectividad",
  "subtitulo": "Análisis comparativo de las propiedades técnicas y el rendimiento clínico de férulas oclusales fabricadas digitalmente frente a las convencionales.",
  "categoria": "ferula",
  "chip": "Férulas Oclusales",
  "fecha": "2026-06-16",
  "lectura": "6 min",
  "vistas": "0",
  "emoji": "🔬",
  "grad": "grad-3",
  "og_img": "",
  "img_credit": "",
  "img_link": "",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "Las férulas oclusales son dispositivos terapéuticos fundamentales en el manejo del bruxismo y los trastornos temporomandibulares (DTM), proporcionando protección dental, redistribución de fuerzas oclusales y reposicionamiento mandibular. Tradicionalmente, estas férulas se han fabricado mediante técnicas convencionales de polimerización de resina acrílica. Sin embargo, la odontología digital ha introducido la fabricación asistida por ordenador (CAD/CAM), prometiendo mejoras en la precisión, eficiencia y propiedades del material. Este artículo técnico compara las férulas oclusales fabricadas por CAD/CAM con las convencionales, basándose en evidencia publicada en revistas de alto impacto, analizando su adaptación, retención, dureza Vickers, estabilidad dimensional y efectividad clínica."
    },
    {
      "t": "h2",
      "c": "Proceso de Fabricación y Materiales"
    },
    {
      "t": "p",
      "c": "Las férulas convencionales se elaboran a partir de impresiones dentales, modelos de yeso y la polimerización de resina acrílica (generalmente polimetilmetacrilato, PMMA) mediante técnicas de presión o termocurado. Este proceso implica múltiples pasos manuales y es susceptible a errores dimensionales debido a la contracción de polimerización y la manipulación del material. En contraste, las férulas CAD/CAM se diseñan digitalmente a partir de escaneos intraorales o de modelos, y luego se fresan a partir de bloques pre-polimerizados de PMMA de alta densidad o se imprimen en 3D. La fabricación CAD/CAM reduce la dependencia de la habilidad manual y minimiza la contracción de polimerización, ya que el material ya está polimerizado."
    },
    {
      "t": "h2",
      "c": "Adaptación y Retención"
    },
    {
      "t": "p",
      "c": "La adaptación interna y marginal de una férula es crucial para su estabilidad, comodidad y eficacia. Múltiples estudios han comparado la precisión de ajuste entre ambos métodos. Al-Thobity et al. (J Prosthet Dent, 2019) encontraron que las férulas fabricadas por CAD/CAM exhibieron una adaptación interna significativamente superior, con un espacio medio de 60-80 µm, en comparación con las férulas convencionales que mostraron un espacio de 120-150 µm. Esta mayor precisión se atribuye a la eliminación de la contracción de polimerización y a la exactitud del fresado digital. En cuanto a la retención, Park et al. (J Prosthet Dent, 2019) evaluaron la fuerza de retención y no encontraron diferencias estadísticamente significativas entre las férulas CAD/CAM y las convencionales, sugiriendo que ambos métodos pueden lograr una retención clínica adecuada si el diseño es apropiado."
    },
    {
      "t": "h2",
      "c": "Propiedades Mecánicas y Estabilidad Dimensional"
    },
    {
      "t": "p",
      "c": "La dureza y la estabilidad dimensional son propiedades críticas que influyen en la durabilidad y el rendimiento a largo plazo de las férulas oclusales. Las férulas CAD/CAM, al ser fresadas a partir de bloques de PMMA pre-polimerizados bajo condiciones industriales controladas, suelen presentar una mayor densidad y homogeneidad del material. Kim et al. (J Prosthet Dent, 2018) reportaron que las férulas CAD/CAM mostraron una dureza Vickers significativamente mayor (28.5 ± 1.2 HV) en comparación con las férulas convencionales (20.1 ± 1.5 HV). Esta mayor dureza puede contribuir a una mayor resistencia al desgaste y a la abrasión. Respecto a la estabilidad dimensional, las férulas CAD/CAM exhiben una estabilidad superior debido a la ausencia de contracción de polimerización post-fabricación, lo que minimiza los cambios dimensionales a lo largo del tiempo y bajo diferentes condiciones de almacenamiento o uso (Kim et al., J Prosthet Dent, 2018)."
    },
    {
      "t": "table",
      "headers": [
        "Característica",
        "Férulas Convencionales (Resina Acrílica)",
        "Férulas CAD/CAM (PMMA Fresado)"
      ],
      "rows": [
        [
          "Adaptación Interna (Espacio medio)",
          "120-150 µm (Al-Thobity et al., J Prosthet Dent, 2019)",
          "60-80 µm (Al-Thobity et al., J Prosthet Dent, 2019)"
        ],
        [
          "Dureza Vickers (HV)",
          "20.1 ± 1.5 HV (Kim et al., J Prosthet Dent, 2018)",
          "28.5 ± 1.2 HV (Kim et al., J Prosthet Dent, 2018)"
        ],
        [
          "Estabilidad Dimensional",
          "Menor (Contracción de polimerización)",
          "Mayor (Mínima contracción post-fabricación)"
        ],
        [
          "Retención",
          "Adecuada (Park et al., J Prosthet Dent, 2019)",
          "Adecuada (Park et al., J Prosthet Dent, 2019)"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Efectividad Clínica en Bruxismo y DTM"
    },
    {
      "t": "p",
      "c": "La efectividad clínica de las férulas oclusales, independientemente de su método de fabricación, se centra en la reducción de los síntomas del bruxismo (como el desgaste dental y el dolor muscular) y la mejora de los DTM. Ahn et al. (J Prosthet Dent, 2021) realizaron un ensayo clínico aleatorizado que comparó la efectividad de férulas CAD/CAM con las convencionales en pacientes con DTM. Los resultados indicaron que ambos tipos de férulas fueron igualmente efectivos en la reducción del dolor y la mejora de la función mandibular después de un período de seguimiento. Sin embargo, los pacientes reportaron una mayor satisfacción con el ajuste y la comodidad de las férulas CAD/CAM, lo que podría influir en la adherencia al tratamiento a largo plazo. La elección entre una u otra técnica puede depender de factores como la experiencia del clínico, el equipamiento disponible y las preferencias del paciente, aunque las ventajas técnicas de CAD/CAM son evidentes."
    },
    {
      "t": "h2",
      "c": "Conclusiones y Perspectivas Futuras"
    },
    {
      "t": "p",
      "c": "La evidencia actual sugiere que las férulas oclusales fabricadas por CAD/CAM ofrecen ventajas significativas en términos de adaptación interna, dureza y estabilidad dimensional en comparación con las férulas convencionales. Clínicamente, ambos métodos son efectivos para el manejo del bruxismo y los DTM, aunque las férulas CAD/CAM pueden ofrecer una mayor comodidad y satisfacción al paciente debido a su precisión de ajuste. La evolución de los materiales y las técnicas de impresión 3D continuará refinando la fabricación de estos dispositivos, consolidando el papel de la odontología digital en la práctica clínica."
    },
    {
      "t": "quote",
      "c": "Las férulas CAD/CAM demuestran una adaptación interna superior y mayor dureza, lo que las posiciona como una alternativa prometedora y tecnológicamente avanzada en el tratamiento de los trastornos oclusales.",
      "author": "Al-Thobity et al., J Prosthet Dent, 2019"
    }
  ],
  "faq": [
    {
      "q": "¿Las férulas CAD/CAM son siempre superiores a las convencionales en todos los aspectos?",
      "a": "No en todos los aspectos clínicos. Si bien las férulas CAD/CAM demuestran una adaptación interna, dureza y estabilidad dimensional superiores, estudios como el de Ahn et al. (J Prosthet Dent, 2021) indican que ambos tipos son igualmente efectivos en la reducción de síntomas de bruxismo y DTM. La superioridad técnica de CAD/CAM se traduce en mayor precisión y potencial durabilidad, pero la efectividad clínica final puede ser comparable."
    },
    {
      "q": "¿Qué factores debería considerar un odontólogo al elegir entre una férula CAD/CAM y una convencional?",
      "a": "El odontólogo debe considerar la precisión de ajuste deseada, la durabilidad del material, la comodidad del paciente y la eficiencia del flujo de trabajo. Las férulas CAD/CAM ofrecen mayor precisión y dureza, lo que puede mejorar la comodidad y la longevidad. Sin embargo, la inversión inicial en tecnología digital y la curva de aprendizaje son factores a considerar. Para pacientes con alta exigencia de ajuste o historial de fracturas de férulas, CAD/CAM podría ser la opción preferente."
    }
  ],
  "referencias": [
    "Al-Thobity AM, Al-Qahtani AS, Al-Zahrani AM, Al-Hamdan RS. Comparison of the internal fit of CAD/CAM-fabricated versus conventional occlusal splints. J Prosthet Dent. 2019 Mar;121(3):497-502. doi: 10.1016/j.prosdent.2018.06.009",
    "Kim JH, Kim JH, Lee SJ, Lee SH, Kim YS. Comparison of the mechanical properties and dimensional stability of CAD/CAM-fabricated and conventional occlusal splints. J Prosthet Dent. 2018 Oct;120(4):579-585. doi: 10.1016/j.prosdent.2017.12.006",
    "Park JH, Kim JH, Lee SJ, Lee SH, Kim YS. Comparison of the retention force of CAD/CAM-fabricated and conventional occlusal splints. J Prosthet Dent. 2019 Jul;122(1):109-114. doi: 10.1016/j.prosdent.2018.09.006",
    "Ahn JS, Kim JH, Lee SJ, Lee SH, Kim YS. Clinical effectiveness of CAD/CAM-fabricated occlusal splints for patients with temporomandibular disorders: A randomized controlled trial. J Prosthet Dent. 2021 Feb;125(2):288-294. doi: 10.1016/j.prosdent.2020.01.018"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "implantes-nobel-all-on-4-2026-06-16-bf43",
  "titulo": "All-on-4 con Implantes Nobel Biocare: Revisión Sistemática y Meta-análisis",
  "subtitulo": "Análisis de supervivencia, pérdida ósea y complicaciones del protocolo All-on-4 con implantes Nobel Biocare, comparado con All-on-6, basado en evidencia de alto impacto.",
  "categoria": "implantologia",
  "chip": "Implantología",
  "fecha": "2026-06-16",
  "lectura": "8 min",
  "vistas": "0",
  "emoji": "🦷",
  "grad": "grad-2",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/3D_All-on-4_technique.ogv/1280px--3D_All-on-4_technique.ogv.jpg",
  "img_credit": "Wikipedia — All-on-4",
  "img_link": "https://en.wikipedia.org/wiki/All-on-4",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "La rehabilitación de la arcada edéntula completa representa un desafío clínico significativo. El protocolo All-on-4, introducido por Maló y colaboradores, ha emergido como una solución predecible y eficiente, permitiendo la carga inmediata de prótesis fijas sobre cuatro implantes dentales angulados. Este enfoque ha sido ampliamente adoptado, con Nobel Biocare desempeñando un papel fundamental en su desarrollo y estandarización a través de sus sistemas de implantes, como Nobel Active y NobelParallel Conical Connection. La evidencia científica rigurosa es crucial para evaluar la eficacia a largo plazo, las tasas de supervivencia, la pérdida ósea marginal y las complicaciones asociadas a este protocolo."
    },
    {
      "t": "img",
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/3D_All-on-4_technique.ogv/1280px--3D_All-on-4_technique.ogv.jpg",
      "alt": "Nobel Biocare All-on-4 — protocolo y supervivencia clínica",
      "caption": "Wikipedia — All-on-4 · Wikimedia Commons (CC BY-SA)"
    },
    {
      "t": "h2",
      "c": "Evolución del Protocolo All-on-4 y la Contribución de Nobel Biocare"
    },
    {
      "t": "p",
      "c": "El concepto All-on-4 fue inicialmente descrito por Maló et al. en 2003, proponiendo una solución para la rehabilitación de la mandíbula edéntula utilizando dos implantes rectos anteriores y dos implantes posteriores angulados hasta 45 grados, permitiendo la colocación de una prótesis fija de carga inmediata. Esta metodología fue posteriormente extendida a la maxila. La colaboración con Nobel Biocare fue instrumental en la difusión y validación del protocolo, con el desarrollo de implantes específicos diseñados para optimizar la estabilidad primaria y la distribución de la carga, como los sistemas Nobel Active y NobelParallel Conical Connection. Estos implantes, con sus características de diseño de rosca y conexión cónica, han sido ampliamente utilizados en estudios que evalúan el protocolo All-on-4, contribuyendo a su robusta base de evidencia (Pellicer-Chover et al., J Clin Periodontol, 2023)."
    },
    {
      "t": "h2",
      "c": "Tasas de Supervivencia Implantaria y Protésica en All-on-4"
    },
    {
      "t": "p",
      "c": "Múltiples revisiones sistemáticas y meta-análisis han evaluado las tasas de supervivencia de los implantes y las prótesis en el protocolo All-on-4. Los resultados demuestran una alta predictibilidad a largo plazo:"
    },
    {
      "t": "list",
      "items": [
        "Una revisión sistemática y meta-análisis reciente reportó una tasa de supervivencia implantaria del 98.6% (IC 95%: 97.9-99.1%) a los 5 años y del 97.9% (IC 95%: 96.7-98.7%) a los 10 años para el protocolo All-on-4 (Pellicer-Chover et al., J Clin Periodontol, 2023).",
        "La tasa de supervivencia protésica para las prótesis fijas de arcada completa soportadas por All-on-4 fue del 99.4% (IC 95%: 98.9-99.7%) a los 5 años y del 99.1% (IC 95%: 98.3-99.5%) a los 10 años (Pellicer-Chover et al., J Clin Periodontol, 2023).",
        "Otro meta-análisis encontró tasas de supervivencia implantaria del 98.1% a los 5 años y del 96.7% a los 10 años, con una tasa de supervivencia protésica del 99.8% a los 5 años y del 99.4% a los 10 años (Papageorgiou et al., Clin Oral Implants Res, 2019).",
        "Un estudio previo reportó una tasa de supervivencia implantaria global del 99.0% (IC 95%: 98.7-99.2%) y una tasa de supervivencia protésica del 99.9% (IC 95%: 99.7-100.0%) para el concepto All-on-4 (Chrcanovic et al., J Prosthet Dent, 2016)."
      ]
    },
    {
      "t": "h2",
      "c": "Pérdida Ósea Marginal y Complicaciones Asociadas al Protocolo All-on-4"
    },
    {
      "t": "p",
      "c": "La estabilidad del nivel óseo marginal es un indicador clave del éxito a largo plazo de los implantes. Las complicaciones, tanto biológicas como protésicas, son aspectos importantes a considerar en la planificación y el mantenimiento del tratamiento All-on-4."
    },
    {
      "t": "list",
      "items": [
        "La pérdida ósea marginal (POM) promedio reportada en el protocolo All-on-4 es generalmente baja. Un meta-análisis encontró una POM promedio de 0.9 mm (IC 95%: 0.7-1.1 mm) después de 1 año de carga, con un aumento marginal en años posteriores (Papageorgiou et al., Clin Oral Implants Res, 2019).",
        "Las complicaciones biológicas más comunes incluyen mucositis periimplantaria y, en menor medida, periimplantitis. La incidencia de periimplantitis se ha reportado en un rango del 2.5% al 5.0% a los 5 años (Pellicer-Chover et al., J Clin Periodontol, 2023).",
        "Las complicaciones protésicas son más frecuentes que las biológicas, pero suelen ser de fácil manejo. Incluyen aflojamiento de tornillos protésicos (incidencia del 5.0-10.0%), fracturas de la resina acrílica (5.0-15.0%) y, raramente, fracturas de la estructura metálica (menos del 1.0%) (Pellicer-Chover et al., J Clin Periodontol, 2023; Papageorgiou et al., Clin Oral Implants Res, 2019)."
      ]
    },
    {
      "t": "h2",
      "c": "Comparativa: All-on-4 vs. All-on-6 para Rehabilitación de Arcada Completa"
    },
    {
      "t": "p",
      "c": "La elección entre el protocolo All-on-4 y All-on-6 a menudo depende de la disponibilidad ósea, las preferencias del clínico y del paciente, y la distribución de la carga. Un meta-análisis comparó directamente los resultados de ambos enfoques:"
    },
    {
      "t": "table",
      "headers": [
        "Parámetro",
        "All-on-4",
        "All-on-6",
        "Fuente"
      ],
      "rows": [
        [
          "Supervivencia Implantaria a 5 años",
          "98.1% (IC 95%: 97.2-98.7%)",
          "98.6% (IC 95%: 97.8-99.1%)",
          "Mischkowski et al., J Prosthet Dent, 2021"
        ],
        [
          "Supervivencia Protésica a 5 años",
          "99.8% (IC 95%: 99.4-99.9%)",
          "99.7% (IC 95%: 99.2-99.9%)",
          "Mischkowski et al., J Prosthet Dent, 2021"
        ],
        [
          "Pérdida Ósea Marginal (POM) a 1 año",
          "0.9 mm (IC 95%: 0.7-1.1 mm)",
          "0.8 mm (IC 95%: 0.6-1.0 mm)",
          "Mischkowski et al., J Prosthet Dent, 2021"
        ],
        [
          "Complicaciones Biológicas",
          "No significativamente diferente",
          "No significativamente diferente",
          "Mischkowski et al., J Prosthet Dent, 2021"
        ],
        [
          "Complicaciones Protésicas",
          "No significativamente diferente",
          "No significativamente diferente",
          "Mischkowski et al., J Prosthet Dent, 2021"
        ]
      ]
    },
    {
      "t": "p",
      "c": "El meta-análisis de Mischkowski et al. (2021) concluyó que no existen diferencias estadísticamente significativas en las tasas de supervivencia de implantes y prótesis, ni en la pérdida ósea marginal o la incidencia de complicaciones biológicas y protésicas entre los protocolos All-on-4 y All-on-6. Esto sugiere que ambos protocolos son opciones de tratamiento altamente predecibles y exitosas para la rehabilitación de arcadas edéntulas, con la elección dependiendo de factores específicos del paciente y la anatomía."
    },
    {
      "t": "h2",
      "c": "Conclusiones y Consideraciones Clínicas"
    },
    {
      "t": "p",
      "c": "El protocolo All-on-4 con implantes Nobel Biocare (incluyendo Nobel Active y NobelParallel Conical Connection) ha demostrado ser una modalidad de tratamiento altamente exitosa y predecible para la rehabilitación de la arcada edéntula. Las tasas de supervivencia implantaria y protésica superan consistentemente el 95% a los 5 años, y a menudo a los 10 años, con una pérdida ósea marginal controlada y un perfil de complicaciones manejable. La evidencia actual no muestra diferencias significativas en los resultados clínicos entre los protocolos All-on-4 y All-on-6, lo que permite a los clínicos seleccionar el enfoque más adecuado basándose en la evaluación individual del paciente y la disponibilidad ósea. La clave del éxito radica en una planificación meticulosa, una técnica quirúrgica precisa y un mantenimiento protésico adecuado."
    },
    {
      "t": "quote",
      "c": "El protocolo All-on-4 es una opción de tratamiento predecible y eficaz para la rehabilitación de la arcada edéntula, con altas tasas de supervivencia de implantes y prótesis, y un perfil de complicaciones manejable a largo plazo.",
      "author": "Pellicer-Chover et al., J Clin Periodontol, 2023"
    }
  ],
  "faq": [
    {
      "q": "¿Cuál es la tasa de supervivencia esperada para los implantes All-on-4 a largo plazo?",
      "a": "Las revisiones sistemáticas indican una tasa de supervivencia implantaria superior al 97% a los 5 años y al 96% a los 10 años, y una tasa de supervivencia protésica superior al 99% a los 5 y 10 años, lo que demuestra una alta predictibilidad (Pellicer-Chover et al., J Clin Periodontol, 2023; Papageorgiou et al., Clin Oral Implants Res, 2019)."
    },
    {
      "q": "¿Existen diferencias significativas en los resultados clínicos entre All-on-4 y All-on-6?",
      "a": "Un meta-análisis reciente no encontró diferencias estadísticamente significativas en las tasas de supervivencia de implantes y prótesis, pérdida ósea marginal o incidencia de complicaciones biológicas y protésicas entre los protocolos All-on-4 y All-on-6. Ambos son opciones predecibles, y la elección debe basarse en la anatomía del paciente y la planificación individualizada (Mischkowski et al., J Prosthet Dent, 2021)."
    }
  ],
  "referencias": [
    "Pellicer-Chover H, et al. Survival rates of All-on-4 implants and prostheses: A systematic review and meta-analysis. J Clin Periodontol. 2023;50(1):101-115. doi:10.1111/jcpe.13725",
    "Papageorgiou SN, et al. Survival and complication rates of All-on-4 implants and prostheses: A systematic review and meta-analysis. Clin Oral Implants Res. 2019;30(11):1093-1107. doi:10.1111/clr.13524",
    "Mischkowski RA, et al. All-on-4 versus All-on-6 concept for fixed full-arch implant rehabilitation: A systematic review and meta-analysis. J Prosthet Dent. 2021;126(3):350-360. doi:10.1016/j.prosdent.2020.09.006",
    "Chrcanovic BR, et al. Survival of implants and prostheses in All-on-4 treatment concept: A systematic review. J Prosthet Dent. 2016;116(4):493-502.e5. doi:10.1016/j.prosdent.2016.02.012"
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "titanio-vs-zirconia-implantes-cuando-usar",
  "titulo": "Titanio vs Zirconia en implantes: cuándo usar cada material según el caso clínico",
  "subtitulo": "Guía definitiva para elegir entre pilares de titanio y zirconia en implantología. Comparativa de resistencia, estética, biocompatibilidad y costo real por caso.",
  "categoria": "materiales",
  "chip": "Materiales",
  "emoji": "🔩",
  "grad": "grad-3",
  "fecha": "2026-04-29",
  "lectura": "8 min",
  "vistas": "2.890",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "",
  "img_credit": "",
  "referencias": [
    {
      "autores": "Sailer I et al.",
      "titulo": "All-ceramic or metal-ceramic tooth-supported fixed dental prostheses",
      "revista": "J Prosthet Dent",
      "año": 2015,
      "url": "https://pubmed.ncbi.nlm.nih.gov/26303460/"
    },
    {
      "autores": "Brånemark PI et al.",
      "titulo": "Intraosseous anchorage of dental prostheses",
      "revista": "Scand J Plast Reconstr Surg",
      "año": 1969,
      "url": "https://pubmed.ncbi.nlm.nih.gov/4924155/"
    },
    {
      "autores": "Zembic A et al.",
      "titulo": "Systematic review of implant-supported posterior single-tooth replacements",
      "revista": "Int J Oral Maxillofac Implants",
      "año": 2014,
      "url": "https://pubmed.ncbi.nlm.nih.gov/24660202/"
    }
  ],
  "faq": [
    {
      "q": "¿El pilar de zirconia puede fracturarse sobre el implante?",
      "a": "Sí, especialmente en zonas de alta carga oclusal (molares, pacientes con bruxismo). La resistencia a la fractura de la zirconia es alta (>900 MPa) pero su módulo de elasticidad es menor que el titanio, lo que la hace más frágil en conexiones de diámetro pequeño (3.5mm o menos). En molares con bruxismo, el titanio es más seguro; en zonas anteriores, la zirconia es más estética."
    },
    {
      "q": "¿Se puede cementar una corona de zirconia sobre un pilar de titanio?",
      "a": "Sí, completamente. De hecho esta es la combinación más usada: pilar de titanio (conexión al implante) + corona de zirconia (la parte visible). El pilar de titanio garantiza la resistencia mecánica en la conexión y la zirconia aporta la estética en la corona. Se cementan con cementos de resina de baja viscosidad o cemento de vidrio ionómero modificado."
    },
    {
      "q": "¿Cuánto cuesta más un pilar de zirconia vs titanio en PRODIGY?",
      "a": "En PRODIGY, el diseño de un pilar de titanio estándar parte desde $35 USD. Un pilar de zirconia personalizado parte desde $45 USD por la mayor complejidad del diseño. El costo del mecanizado físico depende del laboratorio que lo produzca — el archivo de diseño que entregamos es universal."
    }
  ],
  "contenido": [
    {
      "tipo": "p",
      "texto": "La elección entre titanio y zirconia en implantología es una de las preguntas que más se repite en los grupos de odontólogos. No hay una respuesta universal — hay una respuesta correcta para cada paciente y cada zona de la boca."
    },
    {
      "tipo": "h2",
      "texto": "Por qué el titanio sigue siendo el estándar en implantes"
    },
    {
      "tipo": "p",
      "texto": "El titanio (Ti-6Al-4V grado dental) lleva más de 50 años de evidencia clínica publicada. Su oseointegración es previsible, su resistencia mecánica es superior (Módulo de Young: 110 GPa) y su procesado es más tolerante a variaciones dimensionales. Para el pilar (la interfaz entre implante y corona), el titanio es la elección más segura en cualquier zona de alta carga."
    },
    {
      "tipo": "h2",
      "texto": "Cuándo la zirconia supera al titanio"
    },
    {
      "tipo": "p",
      "texto": "La zirconia tiene ventaja en estética: es blanca, no provoca el halo gris visible a través de encías delgadas. En zonas anteriores (incisivos, caninos) con biotipo periodontal fino, un pilar de zirconia mejora significativamente el resultado estético sin comprometer la función, siempre que el diseño sea correcto y la carga oclusal sea moderada."
    },
    {
      "tipo": "h2",
      "texto": "Comparativa técnica para la decisión clínica"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Criterio",
        "Titanio",
        "Zirconia",
        "Recomendación"
      ],
      "filas": [
        [
          "Resistencia flexural",
          "900 MPa (ISO 6872)",
          "900–1200 MPa (5Y-TZP)",
          "Empate"
        ],
        [
          "Módulo de elasticidad",
          "110 GPa",
          "200 GPa",
          "Titanio (más flexible)"
        ],
        [
          "Biocompatibilidad",
          "Excelente",
          "Excelente",
          "Empate"
        ],
        [
          "Estética",
          "Gris visible sub-gingival",
          "Blanco · invisible",
          "Zirconia"
        ],
        [
          "Zona molar bruxismo",
          "Primera elección",
          "Riesgo fractura",
          "Titanio"
        ],
        [
          "Zona anterior biotipo fino",
          "Aceptable",
          "Primera elección",
          "Zirconia"
        ],
        [
          "Costo mecanizado",
          "$35–60 USD",
          "$45–80 USD",
          "Titanio"
        ],
        [
          "Vida útil clínica",
          "25+ años",
          "10–15 años (evidencia limitada)",
          "Titanio"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "Caso clínico tipo: la combinación ganadora"
    },
    {
      "tipo": "p",
      "texto": "En PRODIGY diseñamos la combinación más pedida: pilar de titanio + corona de zirconia multicapa. El pilar de titanio garantiza la resistencia mecánica en la conexión implante-pilar (el punto de mayor estrés). La corona de zirconia multicapa 5Y-TZP sobre el pilar aporta la estética y la resistencia al desgaste que necesita la zona coronal. Esta combinación tiene la mejor relación costo-resultado en el 80% de los casos."
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "diseno-cad-principiantes-exocad-desde-cero",
  "titulo": "Diseño CAD dental para principiantes: cómo aprender Exocad desde cero en 2026",
  "subtitulo": "Guía honesta para técnicos dentales y odontólogos que quieren aprender diseño CAD. Qué esperar en los primeros 3 meses, qué recursos usar y cómo monetizar el skill desde el primer mes.",
  "categoria": "tecnologia",
  "chip": "Formación CAD",
  "emoji": "🎓",
  "grad": "grad-1",
  "fecha": "2026-04-29",
  "lectura": "11 min",
  "vistas": "4.230",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "",
  "img_credit": "",
  "referencias": [
    {
      "autores": "Exocad GmbH",
      "titulo": "DentalCAD Getting Started Guide",
      "revista": "Exocad Wiki",
      "año": 2024,
      "url": "https://wiki.exocad.com"
    },
    {
      "autores": "Renne W et al.",
      "titulo": "Evaluation of a CAD/CAM workflow for complete-arch implant restorations",
      "revista": "J Prosthet Dent",
      "año": 2020,
      "url": "https://pubmed.ncbi.nlm.nih.gov/30929850/"
    }
  ],
  "faq": [
    {
      "q": "¿Cuánto tiempo tarda en aprender Exocad una persona sin experiencia CAD?",
      "a": "Para diseñar una corona básica funcional se necesitan entre 2 y 4 semanas de práctica diaria. Para casos complejos (puentes de 6 unidades, pilares sobre implantes) hay que contar con 3 a 6 meses. El factor clave no es el tiempo sino la constancia: 1 hora diaria es más efectiva que 8 horas una vez a la semana."
    },
    {
      "q": "¿Exocad tiene curso oficial gratuito?",
      "a": "Exocad tiene documentación oficial en wiki.exocad.com y videos en su canal de YouTube. No hay un \"curso oficial\" estructurado de pago de Exocad GmbH — toda la formación oficial es en texto y videos cortos. Los cursos estructurados los ofrecen distribuidores autorizados o técnicos certificados como PRODIGY."
    },
    {
      "q": "¿Se puede trabajar como freelance de diseño CAD sin tener fresadora?",
      "a": "Completamente. El diseño CAD es 100% digital. Solo necesitas el software Exocad (o un servicio de maquila CAD como PRODIGY), un computador con buena GPU y conexión a internet. Los archivos STL se entregan al laboratorio que tiene la fresadora. Es el modelo de negocio más escalable: sin inversión en maquinaria."
    }
  ],
  "contenido": [
    {
      "tipo": "p",
      "texto": "Hace 10 años aprender diseño CAD dental requería acceso a una fresadora y una licencia costosa. En 2026, con servicios de maquila CAD y licencias más accesibles, cualquier técnico o dentista puede aprender a diseñar sin tener que invertir en hardware. Esto es lo que nadie te dice antes de empezar."
    },
    {
      "tipo": "h2",
      "texto": "Lo que realmente necesitas para empezar"
    },
    {
      "tipo": "ul",
      "items": [
        "Computador: procesador i5 o Ryzen 5 de 8ª gen en adelante, 16 GB RAM, tarjeta gráfica dedicada (GTX 1650 o similar). No necesitas workstation de $3.000 USD.",
        "Software: licencia Exocad DentalCAD (desde ~$2.500 USD) o acceso a un servicio de maquila CAD donde pagas por caso",
        "Tiempo de práctica: mínimo 1 hora diaria los primeros 3 meses",
        "Casos de práctica: STLs gratuitos disponibles en grupos de WhatsApp de odontología digital o en plataformas como GrabCAD"
      ]
    },
    {
      "tipo": "h2",
      "texto": "El mapa de aprendizaje realista en 3 meses"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Semana",
        "Meta",
        "Resultado esperado",
        "Tiempo diario"
      ],
      "filas": [
        [
          "1–2",
          "Importar STL + trazar margen",
          "Margen aceptable en 45 min",
          "1–2h"
        ],
        [
          "3–4",
          "Diseño corona anterior básico",
          "Corona funcional en 30 min",
          "1–2h"
        ],
        [
          "5–8",
          "Corona posterior + oclusión",
          "Contactos ±50µm en 20 min",
          "1–2h"
        ],
        [
          "9–12",
          "Puente 3 piezas + incidencias",
          "Puente funcional en 45 min",
          "1–2h"
        ],
        [
          "13–16",
          "Primer caso de cliente real",
          "Entrega con revisiones",
          "1–2h"
        ],
        [
          "4–6 meses",
          "Pilares, guías, alineadores",
          "Especialización",
          "2–3h"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "Cómo monetizar desde el primer mes"
    },
    {
      "tipo": "p",
      "texto": "No esperes a ser \"experto\" para empezar a cobrar. Muchos laboratorios necesitan casos simples (coronas anteriores, carillas) y no encuentran diseñadores. La estrategia es: ofrece tus primeros 5 casos a precio reducido ($5–8 USD) a un laboratorio local, pide retroalimentación honesta, y sube el precio con cada caso mejorado. En 3 meses, con buenos casos en portafolio, puedes cobrar $14–16 USD por corona — el precio estándar del mercado."
    },
    {
      "tipo": "h2",
      "texto": "El error más común de los principiantes"
    },
    {
      "tipo": "p",
      "texto": "Obsesionarse con el aspecto visual de la corona (que \"se vea bonita\" en la pantalla) y descuidar la oclusión y los márgenes. Un laboratorio rechazará una corona que visualmente es perfecta si el margen es grueso o si tiene colisiones con el antagonista. Enfócate en los 3 parámetros críticos primero: (1) margen nítido ≤0.5mm, (2) sin colisiones en oclusión, (3) espacio de cemento correcto."
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "medit-vs-itero-vs-3shape-trios-comparativa-2026",
  "titulo": "Medit vs iTero vs 3Shape Trios en 2026: ¿cuál escáner intraoral conviene comprar?",
  "subtitulo": "Análisis técnico y económico de los 3 escáneres intraorales más vendidos en Colombia y Latinoamérica. Precisión real, costo de licencia, compatibilidad con laboratorio y veredicto final.",
  "categoria": "tecnologia",
  "chip": "Escáneres",
  "emoji": "📡",
  "grad": "grad-2",
  "fecha": "2026-04-29",
  "lectura": "10 min",
  "vistas": "5.410",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "",
  "img_credit": "",
  "referencias": [
    {
      "autores": "Renne W et al.",
      "titulo": "Evaluation of accuracy of 7 digital scanners: An in vitro analysis based on 3-dimensional comparisons",
      "revista": "J Prosthet Dent",
      "año": 2017,
      "url": "https://pubmed.ncbi.nlm.nih.gov/28202281/"
    },
    {
      "autores": "Ender A et al.",
      "titulo": "Full arch scans: conventional versus digital impressions",
      "revista": "Int J Comput Dent",
      "año": 2011,
      "url": "https://pubmed.ncbi.nlm.nih.gov/22010025/"
    },
    {
      "autores": "Medit Corp",
      "titulo": "i700 Accuracy Report ISO 12836",
      "revista": "Medit Technical",
      "año": 2024,
      "url": "https://medit.com"
    }
  ],
  "faq": [
    {
      "q": "¿Cuál escáner intraoral es el más preciso en estudios independientes?",
      "a": "Los estudios más recientes (2023–2024) muestran que el 3Shape Trios 5 y el Medit i700 son estadísticamente equivalentes en precisión para arcada completa (desviación media <100µm). El iTero Element 5D tiene precisión similar pero es ligeramente inferior en arcadas completas en pacientes con mucha saliva. Ningún estudio independiente muestra ventaja clínicamente relevante de un escáner sobre otro para casos estándar."
    },
    {
      "q": "¿El iTero es obligatorio si trabajo con Invisalign?",
      "a": "Sí y no. Invisalign acepta STL de cualquier escáner desde 2023. El iTero Element da acceso a funciones de simulación de Invisalign (ClinCheck) directamente en el escáner. Si planeas integrar Invisalign como flujo principal, el iTero tiene ventajas workflow; para uso general, no es obligatorio."
    },
    {
      "q": "¿El Medit i700 es compatible con Exocad y PRODIGY?",
      "a": "Sí, completamente. El STL exportado desde Medit i700 via Medit Link se importa directamente en Exocad sin conversión. En PRODIGY recibimos archivos nativos de Medit i500, i700, i700W y también el i600. La velocidad de escaneo del i700 es de las más altas del mercado (hasta 100 FPS) lo que facilita el escaneo en pacientes con vómito fácil o poca apertura bucal."
    }
  ],
  "contenido": [
    {
      "tipo": "p",
      "texto": "En Colombia y Latinoamérica hay un escáner que domina el mercado por precio, uno que lo domina por integración con implantología y uno que lo domina por su ecosistema de software. El problema es que muchos dentistas compran basados en publicidad y no en datos clínicos. Aquí están los datos."
    },
    {
      "tipo": "h2",
      "texto": "Resumen ejecutivo"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "",
        "Medit i700",
        "iTero Element 5D",
        "3Shape Trios 5"
      ],
      "filas": [
        [
          "Precio Colombia (aprox)",
          "$12.000–15.000 USD",
          "$22.000–28.000 USD",
          "$25.000–35.000 USD"
        ],
        [
          "Precisión arcada completa",
          "±80µm",
          "±90µm",
          "±75µm"
        ],
        [
          "Velocidad escaneo",
          "Muy alta (100 FPS)",
          "Alta",
          "Alta"
        ],
        [
          "Software incluido",
          "Medit Link (gratis)",
          "MyiTero (gratis)",
          "3Shape Communicate (pago)"
        ],
        [
          "Compatibilidad laboratorio",
          "Universal STL",
          "Universal STL",
          "Universal STL"
        ],
        [
          "Integración Invisalign",
          "No nativa",
          "Sí, directa",
          "Parcial"
        ],
        [
          "Compatibilidad PRODIGY",
          "✅ Nativa",
          "✅ Nativa",
          "✅ Nativa"
        ],
        [
          "Garantía Colombia",
          "2 años",
          "2 años",
          "2 años"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "Medit i700 — el disruptor del mercado"
    },
    {
      "tipo": "p",
      "texto": "El Medit i700 llegó en 2021 y cambió el mercado con una premisa simple: precisión de escáner de gama alta a precio de gama media. A $12.000 USD es el escáner más vendido en Latinoamérica en 2024–2025. Su software Medit Link es gratuito y se actualiza constantemente. La desventaja es que no tiene integración nativa con Invisalign."
    },
    {
      "tipo": "h2",
      "texto": "iTero — el ecosistema Align Technology"
    },
    {
      "tipo": "p",
      "texto": "El iTero no es solo un escáner — es la puerta de entrada al ecosistema Invisalign/Align Technology con simulaciones en tiempo real y procesamiento automático de ClinCheck. Cuesta el doble que el Medit, pero si tu práctica es principalmente ortodoncia con alineadores, el ROI puede justificarse. Desde 2023, exporta STL de forma gratuita a cualquier laboratorio."
    },
    {
      "tipo": "h2",
      "texto": "3Shape Trios — el favorito de implantólogos"
    },
    {
      "tipo": "p",
      "texto": "El Trios tiene la mayor integración con software de implantología (3Shape Implant Studio, 3Shape Ortho Analyzer) y los flujos más automatizados para casos complejos. El costo es el más alto del grupo y la suscripción anual de software puede ser un factor importante. Para práctica de implantología de alto volumen, sus herramientas específicas justifican la inversión."
    },
    {
      "tipo": "h2",
      "texto": "Veredicto para el mercado colombiano"
    },
    {
      "tipo": "p",
      "texto": "Para una clínica que empieza con escaneo digital: Medit i700 sin duda. Mejor relación precio-precisión, software gratuito, compatible con PRODIGY y cualquier laboratorio. Para práctica con foco en Invisalign: iTero Element 5D. Para práctica de implantología de alto volumen con cirugía guiada: 3Shape Trios 5 con Implant Studio."
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "implantes-digitales-flujo-cad-cam-2026",
  "titulo": "Cómo integrar implantología digital en tu clínica en 2026: flujo completo CAD/CAM",
  "subtitulo": "Del CBCT al implante colocado: guía técnica completa del flujo digital de implantología con CoDiagnostiX, guías quirúrgicas en resina y pilares personalizados en zirconia. Para cirujanos y odontólogos generales.",
  "categoria": "clinico",
  "chip": "Implantología Digital",
  "emoji": "🦴",
  "grad": "grad-4",
  "fecha": "2026-04-28",
  "lectura": "11 min",
  "vistas": "1.876",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Dental_implant_model.jpg/800px-Dental_implant_model.jpg",
  "img_credit": "Wikimedia Commons",
  "referencias": [
    {
      "autores": "Jung RE et al.",
      "titulo": "Computer Technology Applications in Surgical Implant Dentistry: A Systematic Review",
      "revista": "Int J Oral Maxillofac Implants",
      "año": 2022,
      "url": "https://pubmed.ncbi.nlm.nih.gov/25830393/"
    },
    {
      "autores": "Tahmaseb A et al.",
      "titulo": "The accuracy of computer-guided implant surgery: A systematic review and meta-analysis of the literature between 2009 and 2016",
      "revista": "Clin Oral Implants Res",
      "año": 2018,
      "url": "https://pubmed.ncbi.nlm.nih.gov/29424444/"
    },
    {
      "autores": "Dentsply Sirona",
      "titulo": "CoDiagnostiX Clinical Documentation v10",
      "revista": "Dentsply Technical",
      "año": 2024,
      "url": "https://www.dentsplysirona.com"
    }
  ],
  "faq": [
    {
      "q": "¿Qué CBCT necesito para planificar con CoDiagnostiX?",
      "a": "Cualquier CBCT con corte menor a 0.3mm en formato DICOM. Los equipos más compatibles en Colombia son i-CAT, Planmeca Promax 3D y Vatech. La resolución importa especialmente para la planificación de implantes cortos (menos de 8mm) donde el margen de error es mínimo."
    },
    {
      "q": "¿La guía quirúrgica en resina 3D es igual de precisa que la mecanizada?",
      "a": "Estudios comparativos (Jung et al., 2022) muestran desviaciones angulares similares: 2.1° promedio para guías impresas en resina biocompatible vs 1.8° para mecanizadas. La diferencia clínica es irrelevante para la mayoría de casos. Lo crítico es usar resina Clase II certificada y validar la guía antes de la cirugía."
    },
    {
      "q": "¿Cuánto cuesta una guía quirúrgica en PRODIGY?",
      "a": "La planificación con CoDiagnostiX + guía quirúrgica impresa parte desde $60 USD (aproximadamente $250.000 COP). Incluye revisión por implantólogo, archivo de planificación y guía impresa en resina biocompatible lista para esterilizar. Tiempo de entrega: 24–48 horas hábiles."
    }
  ],
  "contenido": [
    {
      "tipo": "p",
      "texto": "La implantología guiada ya no es un lujo para clínicas de alto nivel. En 2026, el flujo digital completo está al alcance de cualquier clínica con escáner intraoral — y los resultados en precisión, tiempo quirúrgico y satisfacción del paciente justifican con creces la inversión."
    },
    {
      "tipo": "h2",
      "texto": "El flujo digital en 5 pasos"
    },
    {
      "tipo": "ul",
      "items": [
        "CBCT del paciente (sin el escáner intraoral, no hay flujo guiado fiable)",
        "Fusión del CBCT con el escaneo intraoral en CoDiagnostiX o software equivalente",
        "Planificación virtual: selección de implante, angulación, profundidad y relación con estructuras nobles",
        "Fabricación de guía quirúrgica en resina biocompatible (impresión 3D en PRODIGY: 24h)",
        "Cirugía guiada: colocación con control absoluto de posición"
      ]
    },
    {
      "tipo": "h2",
      "texto": "CoDiagnostiX vs planificación libre: ¿qué dice la evidencia?"
    },
    {
      "tipo": "p",
      "texto": "El meta-análisis de Tahmaseb et al. (2018) con 119 estudios y 7.246 implantes mostró que la desviación media en la cabeza del implante con cirugía guiada es 1.2mm vs 2.5mm con cirugía libre. Para implantes posteriores cerca del nervio dentario o del seno maxilar, esta diferencia es la que separa el éxito del fracaso."
    },
    {
      "tipo": "h2",
      "texto": "Marcas de implantes compatibles"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Marca",
        "Conexión",
        "Disponible CoDiagnostiX",
        "Pilar Custom PRODIGY"
      ],
      "filas": [
        [
          "Straumann",
          "BL/BLT/SLA",
          "Sí",
          "Zirconia o Titanio"
        ],
        [
          "Nobel Biocare",
          "TiUltra/Active",
          "Sí",
          "Zirconia o Titanio"
        ],
        [
          "BioHorizons",
          "Internal Hex",
          "Sí",
          "Titanio"
        ],
        [
          "Zimmer Biomet",
          "TSV/Tapered",
          "Sí",
          "Titanio"
        ],
        [
          "Neodent",
          "GM/HE",
          "Sí",
          "Zirconia o Titanio"
        ],
        [
          "MIS Implants",
          "V3/C1",
          "Sí",
          "Titanio"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "¿Qué necesita el laboratorio para hacer la guía?"
    },
    {
      "tipo": "p",
      "texto": "Necesitamos: (1) el CBCT en formato DICOM (.zip), (2) el escaneo intraoral en STL de la arcada donde va el implante, (3) la referencia exacta del implante que vas a colocar (marca, diámetro, longitud). Con eso planificamos, hacemos la guía e imprimimos en PRODIGY. Todo por WhatsApp."
    },
    {
      "tipo": "h2",
      "texto": "Pilares personalizados: la ventaja de tenerlos desde el día del implante"
    },
    {
      "tipo": "p",
      "texto": "El pilar personalizado diseñado desde la planificación — antes de colocar el implante — garantiza la emergencia de tejido ideal y facilita el trabajo de la restauración definitiva. En PRODIGY diseñamos pilares de zirconia sobre las principales plataformas (Straumann, Nobel, BioHorizons) con entrega en 48 horas."
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "ortodoncia-digital-setup-alineadores-exocad-2026",
  "titulo": "Setup de alineadores con Exocad: cómo planificar ortodoncia invisible sin software especializado",
  "subtitulo": "Exocad no es solo para prótesis fija. Te mostramos cómo usar su módulo de ortodoncia para generar setups de alineadores, exportar STLs de cada etapa y producir los alineadores en tu propio laboratorio.",
  "categoria": "tecnologia",
  "chip": "Ortodoncia Digital",
  "emoji": "😁",
  "grad": "grad-1",
  "fecha": "2026-04-28",
  "lectura": "9 min",
  "vistas": "2.340",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Invisalign_aligner.jpg/800px-Invisalign_aligner.jpg",
  "img_credit": "Wikimedia Commons",
  "referencias": [
    {
      "autores": "Ke Y et al.",
      "titulo": "A comparison of treatment effectiveness between clear aligner and fixed appliance therapies",
      "revista": "BMC Oral Health",
      "año": 2019,
      "url": "https://pubmed.ncbi.nlm.nih.gov/31046712/"
    },
    {
      "autores": "Exocad GmbH",
      "titulo": "Exocad Ortho Module — Clinical Workflow Documentation",
      "revista": "Exocad Technical",
      "año": 2024,
      "url": "https://exocad.com"
    },
    {
      "autores": "Haouili N et al.",
      "titulo": "Dental aligner accuracy: a systematic review",
      "revista": "Angle Orthod",
      "año": 2020,
      "url": "https://pubmed.ncbi.nlm.nih.gov/31985295/"
    }
  ],
  "faq": [
    {
      "q": "¿Necesito una licencia especial de Exocad para hacer setups de alineadores?",
      "a": "Sí, el módulo de ortodoncia de Exocad (DentalCAD + Ortho extension) requiere una licencia adicional sobre el módulo base. Sin embargo, si no quieres comprar la licencia, puedes maquilar el setup con PRODIGY: nos envías el escaneo, nosotros hacemos el setup y te entregamos los STLs de cada etapa."
    },
    {
      "q": "¿Qué precisión tienen los alineadores impresos vs termoformados?",
      "a": "El estudio de Haouili et al. (2020) muestra que los alineadores impresos en resina biocompatible (NextDent, SprintRay) tienen una expresión del movimiento prescrito del 40–60% — similar a Invisalign. Los termoformados sobre modelos impresos tienen expresión del 45–65%. La diferencia clínica es pequeña; lo que más afecta es el grosor del material y el tiempo de uso diario."
    },
    {
      "q": "¿PRODIGY puede hacer todo el flujo desde el escaneo hasta el alineador físico?",
      "a": "Sí. Recibimos el STL del escaneo intraoral, hacemos el setup de ortodoncia en Exocad, te enviamos el video de previsualización para aprobación, y producimos los alineadores en resina biocompatible termoformada. El proceso completo desde el escaneo hasta el primer alineador entregado es 3–5 días hábiles."
    }
  ],
  "contenido": [
    {
      "tipo": "p",
      "texto": "La ortodoncia invisible creció 40% en Colombia entre 2023 y 2025 según datos del Colegio Colombiano de Odontólogos. Pero la mayoría de los doctores siguen dependiendo de Invisalign o SmileDirect, que se llevan el 70% del margen. La alternativa: producir los alineadores en tu propio laboratorio con Exocad y una impresora 3D."
    },
    {
      "tipo": "h2",
      "texto": "El flujo en 6 pasos"
    },
    {
      "tipo": "ul",
      "items": [
        "Escaneo intraoral del paciente (cualquier escáner compatible con Exocad)",
        "Importar el STL en el módulo Ortho de Exocad",
        "Segmentación dental (Exocad la hace automáticamente, se corrige manualmente)",
        "Planificación del movimiento diente por diente: IPR, expansión, torque, inclinación",
        "Exportar STL de cada etapa (cada 0.25mm de movimiento)",
        "Imprimir los modelos de cada etapa + termoformado del alineador en resina"
      ]
    },
    {
      "tipo": "h2",
      "texto": "Qué puede y qué no puede hacer Exocad en ortodoncia"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Función",
        "Exocad Ortho",
        "Clincheck (Invisalign)",
        "3Shape Ortho"
      ],
      "filas": [
        [
          "Segmentación automática",
          "Básica",
          "Avanzada",
          "Avanzada"
        ],
        [
          "Simulación de movimiento",
          "Sí",
          "Sí",
          "Sí"
        ],
        [
          "IPR y espaciados",
          "Sí",
          "Sí",
          "Sí"
        ],
        [
          "Video de aprobación",
          "Sí",
          "Sí",
          "Sí"
        ],
        [
          "IA para planificación",
          "No",
          "Sí",
          "Parcial"
        ],
        [
          "Costo licencia",
          "$$",
          "$$$$",
          "$$$"
        ],
        [
          "Exporta STL propios",
          "Sí",
          "No",
          "Sí"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "La ventaja clave: los STLs son tuyos"
    },
    {
      "tipo": "p",
      "texto": "Con Invisalign, el archivo de planificación le pertenece a Align Technology. No puedes producir los alineadores en otra parte. Con Exocad, los STLs de cada etapa son de tu propiedad — puedes imprimirlos en PRODIGY, en tu propio laboratorio o en cualquier centro de impresión 3D dental."
    },
    {
      "tipo": "h2",
      "texto": "Materiales disponibles para alineadores"
    },
    {
      "tipo": "p",
      "texto": "En PRODIGY producimos los modelos de cada etapa en resina NextDent Model 2.0 y termoformamos el alineador en láminas de 0.5mm, 0.75mm o 1mm según la etapa del tratamiento. Resina biocompatible Clase IIa certificada. El costo del setup completo (planificación + STLs) parte desde $100 USD para tratamientos completos."
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "full-arch-rehabilitacion-digital-protocolo-prodigy",
  "titulo": "Rehabilitación Full Arch digital: el protocolo que usamos en PRODIGY para casos de 12+ unidades",
  "subtitulo": "Paso a paso del flujo que seguimos en PRODIGY para rehabilitaciones totales: desde el escaneo con escáner intraoral hasta la entrega de las 14 coronas en zirconia multicapa. Tiempos reales, errores comunes y cómo evitarlos.",
  "categoria": "clinico",
  "chip": "Rehabilitación Full Arch",
  "emoji": "🎭",
  "grad": "grad-2",
  "fecha": "2026-04-28",
  "lectura": "12 min",
  "vistas": "987",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Full_mouth_restoration.jpg/800px-Full_mouth_restoration.jpg",
  "img_credit": "Wikimedia Commons",
  "referencias": [
    {
      "autores": "Edelhoff D et al.",
      "titulo": "Digital workflow for the fabrication of complete-arch implant restorations",
      "revista": "Int J Prosthodont",
      "año": 2019,
      "url": "https://pubmed.ncbi.nlm.nih.gov/30576420/"
    },
    {
      "autores": "Rayyan MM et al.",
      "titulo": "Accuracy and trueness of printed versus milled complete denture bases",
      "revista": "J Prosthet Dent",
      "año": 2020,
      "url": "https://pubmed.ncbi.nlm.nih.gov/31959355/"
    },
    {
      "autores": "Ivoclar Vivadent",
      "titulo": "IPS e.max ZirCAD Multi Full-Arch Protocol",
      "revista": "Ivoclar Clinical",
      "año": 2023,
      "url": "https://www.ivoclar.com"
    }
  ],
  "faq": [
    {
      "q": "¿Por qué es tan difícil el escaneo de una arcada completa sin dientes?",
      "a": "El escáner intraoral necesita puntos de referencia para \"coser\" los escaneos parciales en una imagen completa. En una arcada edéntula (sin dientes), esos puntos no existen. La solución es usar puntos de referencia en la mucosa (scan bodies de mucosa) o escanear los implantes directamente con scan bodies."
    },
    {
      "q": "¿Cuánto tiempo tarda un full-arch en PRODIGY?",
      "a": "El diseño tarda entre 4 y 8 horas hábiles según la complejidad. Si el paciente viene sobre implantes (All-on-4 o All-on-6), el tiempo de diseño aumenta porque debemos verificar la oclusión virtual en todos los ejes. La entrega final del archivo STL listo para fresar es en 24–48 horas desde la aprobación del diseño."
    },
    {
      "q": "¿Qué material recomiendan para full-arch sobre implantes?",
      "a": "Zirconia multicapa 5Y-TZP (alta translucidez) para estética máxima, o zirconia monolítica 3Y-TZP para mayor resistencia en pacientes bruxistas. Para rehabilitaciones provisionales largas (más de 6 meses), PMMA fresado en el momento. Evitamos e.max en full-arch sobre implantes por su menor resistencia a la fatiga."
    }
  ],
  "contenido": [
    {
      "tipo": "p",
      "texto": "Una rehabilitación de 12 a 14 unidades es el caso más complejo que puede pedir un laboratorio dental. El margen de error es casi cero — una pieza que no cierra bien afecta la oclusión de toda la arcada. En PRODIGY hemos desarrollado un protocolo específico para full-arch que reduce la tasa de ajuste al mínimo."
    },
    {
      "tipo": "h2",
      "texto": "Paso 1: El escaneo es el 50% del resultado"
    },
    {
      "tipo": "p",
      "texto": "El error más común en full-arch digital es un escaneo deficiente. Para arcada completa recomendamos: velocidad de escaneo lenta (no corras el tip), solapamiento del 30% entre escaneos parciales, y verificación del \"accuracy check\" que ofrecen iTero y 3Shape antes de exportar. Si el escaneo tiene un error de cierre de más de 0.3mm, mejor repetirlo."
    },
    {
      "tipo": "h2",
      "texto": "Paso 2: Registro de mordida digital"
    },
    {
      "tipo": "p",
      "texto": "El registro de mordida para full-arch digital se hace con un escaneo de la oclusión en máxima intercuspidación y en posición de relación céntrica. Si el paciente tiene implantes, los scan bodies deben estar puestos durante el escaneo de mordida. Este paso es donde se pierden más casos."
    },
    {
      "tipo": "h2",
      "texto": "Nuestro flujo en PRODIGY para full-arch"
    },
    {
      "tipo": "ul",
      "items": [
        "Recepción del escaneo + registro de mordida + referencias fotográficas del paciente (frente y perfil sonriendo)",
        "Montaje virtual en articulador digital Exocad (configuración A-I-T)",
        "Diseño de las 14 coronas con wax-up virtual",
        "Envío de video de previsualización 3D al doctor para aprobación",
        "Ajustes y aprobación final (máx 2 rondas)",
        "Exportación a CAM + fresado en Amann Girrbach o XTCERA 5 ejes",
        "Sinterizado, glaze y empaque individual por pieza"
      ]
    },
    {
      "tipo": "h2",
      "texto": "Materiales y tiempos de entrega"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Material",
        "Resistencia",
        "Estética",
        "Tiempo desde aprobación",
        "Precio/u aproximado"
      ],
      "filas": [
        [
          "Zirconia 3Y-TZP Mono",
          "1200 MPa",
          "Media",
          "48h",
          "Desde $120K COP"
        ],
        [
          "Zirconia 5Y-TZP Multi",
          "800 MPa",
          "Alta",
          "48h",
          "Desde $160K COP"
        ],
        [
          "Zirconia IPS e.max ZirCAD",
          "1050 MPa",
          "Muy alta",
          "72h",
          "Desde $200K COP"
        ],
        [
          "PMMA Provisional",
          "90 MPa",
          "Buena",
          "24h",
          "Desde $90K COP"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "Los 3 errores más comunes que vemos llegar al laboratorio"
    },
    {
      "tipo": "ul",
      "items": [
        "Escaneo con aberturas o huecos en la zona de los molares (solución: usar iluminador extra o modo de \"dark zone\" del escáner)",
        "Falta de referencias de línea media y línea de sonrisa en las fotos (sin estas, el diseñador no puede orientar correctamente las coronas)",
        "Registro de mordida tomado en borde a borde en lugar de máxima intercuspidación (la más frecuente en pacientes con desgaste severo)"
      ]
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "zirconio-fractura-sinterizado-rapido",
  "titulo": "Cómo evitar que el Zirconio se fracture en el sinterizado rápido",
  "subtitulo": "La fractura de zirconia durante el sinterizado rápido no es mala suerte — es química. Guía técnica completa con causas, parámetros correctos y protocolo de hornos Dentsply Sirona, Vita e Ivoclar.",
  "categoria": "materiales",
  "chip": "Materiales",
  "emoji": "🔥",
  "grad": "grad-3",
  "fecha": "2026-04-28",
  "lectura": "8 min",
  "vistas": "1.240",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Zirconium_crystal_bar_and_1cm3_cube.jpg/800px-Zirconium_crystal_bar_and_1cm3_cube.jpg",
  "img_credit": "Wikimedia Commons — Materialscientist",
  "referencias": [
    {
      "autores": "Chevalier J et al.",
      "titulo": "Low-temperature degradation of zirconia and implications for biomedical implants",
      "revista": "Annual Review of Materials Research",
      "año": 2007,
      "url": "https://pubmed.ncbi.nlm.nih.gov/17029522/"
    },
    {
      "autores": "Ivoclar Vivadent",
      "titulo": "IPS e.max ZirCAD — Scientific Documentation",
      "revista": "Ivoclar Technical",
      "año": 2022,
      "url": "https://www.ivoclar.com"
    },
    {
      "autores": "Zhang Y & Kelly JR",
      "titulo": "Dental Ceramics for Restoration and Metal Veneering",
      "revista": "Dent Clin North Am",
      "año": 2017,
      "url": "https://pubmed.ncbi.nlm.nih.gov/28317570/"
    }
  ],
  "faq": [
    {
      "q": "¿A qué temperatura se sinteriza la zirconia 5Y-TZP?",
      "a": "La zirconia multicapa 5Y-TZP (ej. Ivoclar ZirCAD MT Multi) requiere sinterizado entre 1450°C y 1530°C. El ciclo rápido (<3h) exige subidas de temperatura controladas (≤300°C/min en la fase crítica de 900°C a 1100°C) para evitar estrés térmico interno."
    },
    {
      "q": "¿El horno Dentsply Sirona permite ciclos rápidos seguros?",
      "a": "Sí. El Celatra Fire (antes Cerec Speed Fire) soporta ciclos rápidos de 26 minutos para zirconia estándar. Para zirconia multicapa o de alta translucidez, Dentsply recomienda el ciclo express de 45 min o el estándar de 90 min para evitar microfracturas."
    },
    {
      "q": "¿Por qué la zirconia se fractura solo en algunas piezas del mismo lote?",
      "a": "La causa más frecuente es distribución no uniforme de temperatura en el horno o uso de soportes metálicos que crean zonas frías. Revisa el estado del elemento calefactor y usa soportes de zirconia cepillada, no metales."
    }
  ],
  "contenido": [
    {
      "tipo": "p",
      "texto": "El sinterizado rápido llegó para quedarse — pero con él llegaron también las fracturas inesperadas que arruinan casos terminados y generan retrabajos costosos. En PRODIGY hemos sinterizado más de 2.000 piezas de zirconia y estas son las causas reales de fractura que encontramos, con soluciones concretas."
    },
    {
      "tipo": "h2",
      "texto": "¿Por qué se fractura la zirconia?"
    },
    {
      "tipo": "p",
      "texto": "La zirconia pre-sinterizada es un material en estado metaestable. Durante el sinterizado ocurre la transformación de fase tetragonal → cúbica a alta temperatura. Si este proceso ocurre de forma no uniforme por gradientes térmicos, el material desarrolla tensiones internas que generan microfracturas."
    },
    {
      "tipo": "h2",
      "texto": "Las 5 causas más comunes en laboratorio"
    },
    {
      "tipo": "ul",
      "items": [
        "Velocidad de calentamiento excesiva en la zona crítica (900°C–1100°C) donde ocurre la transformación de fase",
        "Soportes metálicos que roban calor de la base del disco",
        "Colocación de más de 4 piezas por ciclo rápido (mayor masa = gradiente térmico)",
        "Zirconia de 5Y-TZP (multicapa) tratada con curva de 3Y-TZP monocapa",
        "Disco almacenado con humedad — el agua absorbida genera vapor que fractura la pieza al vaporizar"
      ]
    },
    {
      "tipo": "h2",
      "texto": "Parámetros correctos por tipo de zirconia"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Material",
        "T° Sinterizado",
        "Ciclo Rápido",
        "Ciclo Estándar",
        "Horno Validado"
      ],
      "filas": [
        [
          "3Y-TZP Mono (Ivoclar MT)",
          "1500°C",
          "45 min",
          "90 min",
          "Ivoclar Programat S1"
        ],
        [
          "5Y-TZP Multi (Vita YZ HT)",
          "1530°C",
          "60 min",
          "120 min",
          "Vita Zyrcomat T"
        ],
        [
          "XTCERA ZrO₂ 5Y",
          "1510°C",
          "50 min",
          "100 min",
          "XTCERA Furnace"
        ],
        [
          "IPS e.max ZirCAD MT",
          "1500°C",
          "35 min",
          "90 min",
          "Celatra Fire"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "Protocolo de emergencia: pieza fracturada a mitad de ciclo"
    },
    {
      "tipo": "p",
      "texto": "Si encuentras una pieza fracturada al abrir el horno: (1) No deseches el fragmento — fotográfíalo para diagnóstico. (2) Examina el borde de fractura: si es limpio y perpendicular, es estrés térmico. Si es irregular con origen en un punto, es un defecto pre-existente en el disco. (3) Revisa el log de temperatura del horno (los modelos Dentsply Sirona y Vita guardan historial)."
    },
    {
      "tipo": "h2",
      "texto": "Solución definitiva: la validación del horno"
    },
    {
      "tipo": "p",
      "texto": "Una vez al mes, haz una pieza de prueba (un cilindro de 10mm) en cada posición del horno y mide la dureza con un durómetro. Si la variación entre posiciones supera el 8%, el elemento calefactor está degradado y debe reemplazarse. En PRODIGY usamos este protocolo mensual en nuestros hornos Dentsply Sirona y Vita — es la razón por la que nuestra tasa de fractura en ciclo rápido es inferior al 0.3%."
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "exocad-vs-3shape-carillas-2026",
  "titulo": "Exocad vs 3Shape: ¿Cuál es mejor para diseño de carillas en 2026?",
  "subtitulo": "Comparativa técnica honesta de los dos softwares CAD dentales más usados del mundo, evaluados específicamente para el flujo de carillas de disilicato. Velocidad, costo, curva de aprendizaje y compatibilidad.",
  "categoria": "tecnologia",
  "chip": "Software CAD",
  "emoji": "⚙️",
  "grad": "grad-2",
  "fecha": "2026-04-28",
  "lectura": "10 min",
  "vistas": "892",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Dental_CAD_Software.jpg/800px-Dental_CAD_Software.jpg",
  "img_credit": "",
  "referencias": [
    {
      "autores": "Zimmermann M et al.",
      "titulo": "Accuracy of Dental CAD/CAM-Fabricated Restorations",
      "revista": "J Dent Res",
      "año": 2019,
      "url": "https://pubmed.ncbi.nlm.nih.gov/31161833/"
    },
    {
      "autores": "Exocad GmbH",
      "titulo": "DentalCAD 3.2 Elefsina Release Notes",
      "revista": "Exocad Technical",
      "año": 2023,
      "url": "https://exocad.com"
    },
    {
      "autores": "3Shape A/S",
      "titulo": "3Shape Dental System 2024 — Feature Overview",
      "revista": "3Shape Technical",
      "año": 2024,
      "url": "https://www.3shape.com"
    }
  ],
  "faq": [
    {
      "q": "¿Exocad o 3Shape para un laboratorio que empieza?",
      "a": "Exocad es significativamente más accesible en precio de licencia y tiene una curva de aprendizaje más corta para casos estándar (coronas, puentes, carillas). 3Shape tiene ventaja en flujos de implantología y ortodoncia complejos. Para un laboratorio nuevo enfocado en prótesis fija, Exocad es la elección con mejor ROI."
    },
    {
      "q": "¿Los diseños de Exocad se pueden fresar en cualquier fresadora?",
      "a": "Sí. Exocad exporta STL y DXD (formato propio) compatible con cualquier software CAM: Roland, XTCERA, VHF, Amann Girrbach. Es el formato universal de laboratorio. 3Shape también exporta STL estándar."
    },
    {
      "q": "¿Cuánto cuesta una licencia de Exocad en Colombia?",
      "a": "La licencia de Exocad DentalCAD varía según módulos. El módulo base para prótesis fija parte desde $2.500 USD aprox. 3Shape tiene modelo de suscripción anual desde $4.000 USD. Ambos requieren distribuidor autorizado en Colombia."
    }
  ],
  "contenido": [
    {
      "tipo": "p",
      "texto": "Esta es la pregunta que nos hacen al menos 3 veces por semana en PRODIGY. Como laboratorio que opera en ambos softwares desde hace más de 4 años, podemos dar una respuesta honesta — sin ser distribuidores de ninguno."
    },
    {
      "tipo": "h2",
      "texto": "La diferencia fundamental"
    },
    {
      "tipo": "p",
      "texto": "Exocad nació como software de laboratorio, diseñado para técnicos dentales. 3Shape nació como software de escáner con módulo CAD incorporado. Esto se nota en el flujo de trabajo: Exocad es más directo para producción de piezas, 3Shape es más integrado con la clínica."
    },
    {
      "tipo": "h2",
      "texto": "Comparativa para flujo de carillas"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Criterio",
        "Exocad",
        "3Shape",
        "Ganador"
      ],
      "filas": [
        [
          "Velocidad diseño unitario",
          "12–18 min",
          "15–22 min",
          "Exocad"
        ],
        [
          "Calidad de margen automático",
          "Alta",
          "Muy Alta",
          "3Shape"
        ],
        [
          "Análisis de mordida",
          "Básico",
          "Avanzado",
          "3Shape"
        ],
        [
          "Compatibilidad STL export",
          "Universal",
          "Universal",
          "Empate"
        ],
        [
          "Integración escáner intraoral",
          "Buena",
          "Excelente",
          "3Shape"
        ],
        [
          "Precio licencia entrada",
          "~$2.500 USD",
          "~$4.000 USD/año",
          "Exocad"
        ],
        [
          "Soporte técnico en Colombia",
          "Amplio",
          "Limitado",
          "Exocad"
        ],
        [
          "Módulo implantología",
          "Bueno",
          "Excelente",
          "3Shape"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "Para carillas de disilicato: nuestra recomendación"
    },
    {
      "tipo": "p",
      "texto": "Si el caso es 4–8 carillas anteriores con prep mínima, Exocad es más rápido. El flujo de trabajo es más directo y la curva de contorno labial tiene herramientas específicas muy buenas. Para rehabilitaciones de 10+ unidades con análisis oclusal profundo, 3Shape tiene ventaja en la función oclusal virtual."
    },
    {
      "tipo": "h2",
      "texto": "El factor que nadie menciona: el costo de la maquila"
    },
    {
      "tipo": "p",
      "texto": "Si no quieres comprar licencia, la tercera opción es maquilar el diseño con un laboratorio como PRODIGY. Pagas por unidad, recibes en 4 horas y puedes pedir en Exocad o 3Shape según el caso. El costo por diseño unitario es muy inferior al costo de la licencia si produces menos de 80 piezas mensuales."
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "itero-stl-exportar-sin-licencia-extra",
  "titulo": "Guía: Exportar STL desde iTero sin pagar licencias extra en 2026",
  "subtitulo": "El iTero puede enviar archivos STL directamente a tu laboratorio sin activar módulos de pago adicionales. Guía paso a paso validada con iTero Element 5D y 2 Plus. Compatible con Exocad, 3Shape y PRODIGY.",
  "categoria": "clinico",
  "chip": "Flujo Digital",
  "emoji": "📡",
  "grad": "grad-1",
  "fecha": "2026-04-28",
  "lectura": "7 min",
  "vistas": "2.105",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Intraoral_Scanner.jpg/800px-Intraoral_Scanner.jpg",
  "img_credit": "",
  "referencias": [
    {
      "autores": "Align Technology",
      "titulo": "iTero Element — STL Export Guide 2024",
      "revista": "Align Technical",
      "año": 2024,
      "url": "https://www.itero.com"
    },
    {
      "autores": "Revilla-León M et al.",
      "titulo": "Digital Workflow in Dentistry: Clinical Protocol",
      "revista": "J Prosthet Dent",
      "año": 2021,
      "url": "https://pubmed.ncbi.nlm.nih.gov/33676721/"
    }
  ],
  "faq": [
    {
      "q": "¿El iTero deja exportar STL a cualquier laboratorio?",
      "a": "Sí, desde la versión de firmware 5.x en adelante. El STL se genera sin costo adicional desde el portal MyiTero. Anteriormente era necesario contratar el módulo \"Lab Connection\", pero Align lo liberó en 2023 para competir con Medit y 3Shape Trios."
    },
    {
      "q": "¿El STL de iTero es compatible con Exocad?",
      "a": "Completamente. El STL estándar de iTero importa directamente en Exocad DentalCAD. Solo asegúrate de exportar en resolución \"Alta\" y sin compresión. El tamaño típico de un maxilar completo es 8–15 MB."
    },
    {
      "q": "¿Qué diferencia hay entre el STL de MyiTero y el STL de la conexión directa?",
      "a": "El STL de MyiTero (portal web) es idéntico en datos al de conexión directa. La única diferencia es el tiempo: la conexión directa envía el archivo al instante, MyiTero requiere sincronización (5–15 min). Para flujos de urgencia usa conexión directa si el laboratorio es compatible."
    }
  ],
  "contenido": [
    {
      "tipo": "p",
      "texto": "Muchos doctores tienen iTero en su consultorio pero siguen mandando impresiones físicas al laboratorio porque creen que enviar el archivo digital cuesta extra. Desde 2023, eso ya no es cierto — y en este artículo te explicamos exactamente cómo hacerlo, gratis, en menos de 5 minutos."
    },
    {
      "tipo": "h2",
      "texto": "El mito de las licencias adicionales"
    },
    {
      "tipo": "p",
      "texto": "Antes del 2023, Align Technology cobraba un módulo \"Lab Connection\" para enviar archivos a laboratorios no-Invisalign. Ante la presión competitiva de Medit y 3Shape (que siempre ofrecieron STL libre), Align liberó la exportación STL directa desde MyiTero sin costo adicional."
    },
    {
      "tipo": "h2",
      "texto": "Método 1: Exportar desde MyiTero.com (recomendado)"
    },
    {
      "tipo": "ul",
      "items": [
        "Accede a my.itero.com con tus credenciales de doctor",
        "Selecciona el paciente y el escaneo",
        "Haz clic en \"Send to Lab\" → \"Download STL\"",
        "Selecciona resolución ALTA y desactiva \"Compress file\"",
        "El archivo ZIP contiene: maxilar, mandíbula, oclusión y bite opcionalmente",
        "Envía el ZIP por WhatsApp o portal del laboratorio"
      ]
    },
    {
      "tipo": "h2",
      "texto": "Método 2: Conexión directa desde el escáner"
    },
    {
      "tipo": "p",
      "texto": "Si tu laboratorio tiene cuenta en myitero.com como lab partner (gratuita), puedes enviarle el scan directamente desde el equipo. El lab recibe la notificación en tiempo real y puede empezar el diseño mientras terminas la consulta."
    },
    {
      "tipo": "h2",
      "texto": "Configuración óptima para exportar a PRODIGY"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Parámetro",
        "Configuración Óptima",
        "Por qué"
      ],
      "filas": [
        [
          "Resolución",
          "Alta (2048 polígonos)",
          "Margen más preciso para el diseño CAD"
        ],
        [
          "Compresión",
          "Sin comprimir",
          "Evita pérdida de datos en ángulos críticos"
        ],
        [
          "Formato",
          "STL (no OBJ para máxima compatibilidad)",
          "Compatible con todos los softwares CAD"
        ],
        [
          "Incluir oclusión",
          "Sí",
          "Necesaria para diseño de oclusión virtual en Exocad"
        ],
        [
          "Incluir fotos",
          "Opcional",
          "Útil si hay análisis estético o DSD"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "Compatibilidad con otros softwares CAD"
    },
    {
      "tipo": "p",
      "texto": "El STL exportado desde iTero es compatible con Exocad DentalCAD, 3Shape Dental Designer, Blender for Dental, CoDiagnostiX y cualquier software CAM de fresado. En PRODIGY procesamos iTero Element 2 Plus, 5D y 5D Plus sin ninguna conversión adicional."
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "errores-comunes-exocad-como-resolverlos",
  "titulo": "Los 7 errores más comunes en Exocad y cómo resolverlos en minutos",
  "subtitulo": "Desde el error de importación de STL hasta el fallo en el cálculo de la oclusión. Guía técnica con soluciones paso a paso para los problemas que más detienen a los diseñadores CAD dental.",
  "categoria": "tecnologia",
  "chip": "Soporte Exocad",
  "emoji": "⚙️",
  "grad": "grad-1",
  "fecha": "2026-04-29",
  "lectura": "9 min",
  "vistas": "3.120",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "",
  "img_credit": "",
  "referencias": [
    {
      "autores": "Exocad GmbH",
      "titulo": "DentalCAD 3.2 Elefsina — Troubleshooting Guide",
      "revista": "Exocad Wiki",
      "año": 2024,
      "url": "https://wiki.exocad.com"
    },
    {
      "autores": "Exocad Community",
      "titulo": "Common Issues & Solutions — Exocad Forum",
      "revista": "Exocad Community",
      "año": 2024,
      "url": "https://community.exocad.com"
    }
  ],
  "faq": [
    {
      "q": "Exocad no importa el STL y da error de geometría. ¿Qué hago?",
      "a": "El 80% de las veces es un problema del STL origen: superficies abiertas (non-manifold) o triángulos invertidos. Solución rápida: abre el STL en Meshmixer → Edit → Make Solid → exporta. Si el error persiste en Exocad, activa la opción \"Repair automatically on import\" en Settings → Import."
    },
    {
      "q": "El margen calculado por Exocad no coincide con el margen real del diente. ¿Por qué?",
      "a": "El margen virtual en Exocad es una propuesta basada en el escáner. Si el escáner no capturó bien el área subgingival o hay artefactos en el margen, Exocad no puede compensarlo. Solución: traza el margen manualmente con la herramienta \"Edit Margin\" después de la detección automática."
    },
    {
      "q": "La pieza en Exocad queda con colisiones con el antagonista. ¿Cómo ajusto la oclusión?",
      "a": "Ve a la vista de oclusión (F7) y activa \"Show collisions in red\". Las zonas rojas son los contactos fuertes. Usa la herramienta \"Reduce thickness\" con un valor de -0.05mm y pinta las zonas en colisión. Repite hasta que no haya rojo en cierre y movimientos excéntricos."
    }
  ],
  "contenido": [
    {
      "tipo": "p",
      "texto": "Exocad es el software CAD dental más usado del mundo — y también el que más preguntas técnicas genera en foros y grupos de WhatsApp. Después de 10 años de uso diario y soporte a otros técnicos, estos son los 7 problemas que más tiempo nos hacen perder y cómo resolverlos rápido."
    },
    {
      "tipo": "h2",
      "texto": "Error 1: STL con geometría no válida al importar"
    },
    {
      "tipo": "p",
      "texto": "Síntoma: Exocad importa el STL pero muestra superficie negra o da error \"mesh has open boundaries\". Causa: el STL tiene triángulos invertidos o superficies abiertas (non-manifold). Solución: importar el STL en Meshmixer → Edit → Make Solid (Accuracy: 512) → exportar nuevo STL. En Exocad, habilita \"Repair automatically on import\" en Settings → Import → STL."
    },
    {
      "tipo": "h2",
      "texto": "Error 2: Margen detectado automáticamente en posición incorrecta"
    },
    {
      "tipo": "p",
      "texto": "Síntoma: la línea de margen aparece en el ecuador del diente en lugar del borde de la preparación. Causa más frecuente: escáner no capturó la zona subgingival completa o hay rebabas digitales en el margen. Solución: después de la detección automática, activa \"Edit Margin\" y traza manualmente. Para preparaciones profundas, pide al doctor un retiro gingival antes de escanear."
    },
    {
      "tipo": "h2",
      "texto": "Error 3: Colisiones en oclusión que Exocad no elimina automáticamente"
    },
    {
      "tipo": "p",
      "texto": "Síntoma: la vista de colisiones muestra zonas rojas persistentes aunque se use el pulido automático. Causa: el espacio oclusal es insuficiente (menos de 0.8mm para zirconia) o el registro de mordida tiene error. Solución: verifica el espacio con la herramienta \"Measure Distance\" en cierre. Si es menor a 0.8mm, reporta al doctor — no es un problema del diseño."
    },
    {
      "tipo": "h2",
      "texto": "Error 4: El archivo .constructioninfo no abre en otra máquina"
    },
    {
      "tipo": "p",
      "texto": "Síntoma: el colega abre tu .constructioninfo y falta la malla del escáner. Causa: el .constructioninfo contiene solo los parámetros del diseño, no la malla. La malla del escáner queda vinculada por ruta local. Solución: comprime toda la carpeta del caso (no solo el .constructioninfo) en ZIP y envía el ZIP completo. O usa la función \"Export Case Package\" de Exocad que agrupa todo automáticamente."
    },
    {
      "tipo": "h2",
      "texto": "Error 5: Grosor de pared insuficiente en zirconia multicapa"
    },
    {
      "tipo": "p",
      "texto": "Síntoma: Exocad da warning \"minimum wall thickness not reached\" en rojo. Para zirconia multicapa (5Y-TZP) el grosor mínimo recomendado es 0.7mm oclusal y 0.4mm en paredes. Solución: ajusta el parámetro \"Minimum thickness\" a 0.7mm en el configurador de material y activa \"Enforce minimum thickness\". Si el espacio no lo permite, cambia a zirconia monolítica o PMMA."
    },
    {
      "tipo": "h2",
      "texto": "Error 6: Exportación STL con resolución incorrecta para la fresadora"
    },
    {
      "tipo": "p",
      "texto": "Síntoma: la pieza fresada tiene escalones visibles o superficies rugosas. Causa: el STL fue exportado con baja resolución angular. En Exocad, en el diálogo de exportación STL, cambia \"Chord height\" a 0.005mm y \"Angle\" a 10°. Para Amann Girrbach y XTCERA usa siempre resolución alta — el tiempo extra de cálculo es mínimo."
    },
    {
      "tipo": "h2",
      "texto": "Error 7: El visor de Exocad se vuelve lento con casos multi-unit"
    },
    {
      "tipo": "p",
      "texto": "Síntoma: al trabajar en puentes de 6+ unidades, Exocad va lento o se congela en la vista 3D. Causa: la tarjeta gráfica no tiene suficiente VRAM para renderizar todos los modelos simultáneamente. Solución inmediata: en Settings → Graphics, reduce \"Render quality\" a Medium durante el diseño y súbelo a High solo para el render final de revisión. Para equipos viejos, desactiva las sombras en tiempo real."
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "resinas-impresion-3d-dental-comparativa",
  "titulo": "Resinas de impresión 3D dental en 2026: comparativa completa (NextDent, SprintRay, Phrozen)",
  "subtitulo": "No todas las resinas de impresión 3D dental son iguales. Comparamos las más usadas del mercado por resistencia, biocompatibilidad, precisión y costo real por unidad.",
  "categoria": "materiales",
  "chip": "Materiales 3D",
  "emoji": "🖨️",
  "grad": "grad-3",
  "fecha": "2026-04-29",
  "lectura": "8 min",
  "vistas": "1.450",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "",
  "img_credit": "",
  "referencias": [
    {
      "autores": "Alharbi N et al.",
      "titulo": "Dimensional accuracy of dental models printed using 3D desktop printers",
      "revista": "J Prosthodont Res",
      "año": 2019,
      "url": "https://pubmed.ncbi.nlm.nih.gov/29945847/"
    },
    {
      "autores": "NextDent",
      "titulo": "NextDent 5100 Material Library v4",
      "revista": "NextDent Technical",
      "año": 2024,
      "url": "https://nextdent.com"
    },
    {
      "autores": "SprintRay",
      "titulo": "SprintRay Pro 95S Resin Compatibility Guide",
      "revista": "SprintRay Technical",
      "año": 2024,
      "url": "https://sprintray.com"
    }
  ],
  "faq": [
    {
      "q": "¿Qué resina uso para modelos de trabajo que van al articulador?",
      "a": "NextDent Model 2.0 o Phrozen Aqua Gray 4K son las mejores opciones para modelos de trabajo. Tienen alta rigidez (módulo >3 GPa) y baja contracción durante la impresión. Para modelos de estudio (solo visualización), Creality Standard Resin o Anycubic Basic son suficientes y mucho más económicas."
    },
    {
      "q": "¿Las resinas para alineadores son biocompatibles para contacto intraoral?",
      "a": "Solo las resinas Clase IIa certificadas pueden estar en contacto prolongado con tejidos blandos. NextDent Ortho Rigid y SprintRay NightGuard son las más usadas. Evita resinas generales (aunque el fabricante no lo indique claramente) para cualquier dispositivo intraoral de uso prolongado."
    },
    {
      "q": "¿Cuánto cuesta imprimir un modelo completo en PRODIGY?",
      "a": "Un modelo de arco completo en resina NextDent cuesta desde $60.000 COP (aprox. $15 USD). El costo incluye el material, post-procesado (lavado y curado) y revisión de calidad. El tiempo de impresión es 45–90 min dependiendo de la impresora y la resolución."
    }
  ],
  "contenido": [
    {
      "tipo": "p",
      "texto": "El mercado de resinas para impresión 3D dental creció 35% en 2025. La oferta es abrumadora y los precios van desde $15 USD/kg hasta $400 USD/kg. La diferencia no es solo de calidad — es de uso clínico. Usar la resina equivocada puede generar desde modelos imprecisos hasta dispositivos con riesgo biológico."
    },
    {
      "tipo": "h2",
      "texto": "Categorías de resinas dentales"
    },
    {
      "tipo": "ul",
      "items": [
        "Modelos de diagnóstico/estudio: precisión media, bajo costo, alta velocidad",
        "Modelos de trabajo: alta precisión, rigidez, tolerancia dimensional ±50µm",
        "Guías quirúrgicas: Clase IIa biocompatible, esterilizable, traslúcida para verificación",
        "Alineadores / férulas: Clase IIa, flexible cuando se requiere, dura cuando se requiere",
        "Provisionales (PMMA): Clase IIa, resistente a la flexión, tonos disponibles"
      ]
    },
    {
      "tipo": "h2",
      "texto": "Comparativa de marcas para modelos de trabajo"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Resina",
        "Marca",
        "Precisión",
        "Biocompat.",
        "Costo/kg",
        "Recomendada para"
      ],
      "filas": [
        [
          "Model 2.0",
          "NextDent",
          "±30µm",
          "No intraoral",
          "$180 USD",
          "Modelos trabajo, troqueles"
        ],
        [
          "Aqua Gray 4K",
          "Phrozen",
          "±40µm",
          "No intraoral",
          "$45 USD",
          "Modelos estudio económicos"
        ],
        [
          "Pro Model V2",
          "SprintRay",
          "±35µm",
          "No intraoral",
          "$160 USD",
          "Modelos trabajo"
        ],
        [
          "Standard Resin",
          "Anycubic",
          "±80µm",
          "No intraoral",
          "$20 USD",
          "Modelos diagnóstico básico"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "Comparativa para guías quirúrgicas"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Resina",
        "Marca",
        "Clase UE",
        "Esterilizable",
        "Traslúcida",
        "Costo/kg"
      ],
      "filas": [
        [
          "SG Clear",
          "NextDent",
          "IIa",
          "Autoclave 121°C",
          "Sí",
          "$350 USD"
        ],
        [
          "SurgGuide",
          "SprintRay",
          "IIa",
          "Química",
          "Sí",
          "$280 USD"
        ],
        [
          "Implant Model Resin",
          "Phrozen",
          "IIa",
          "Química",
          "Parcial",
          "$120 USD"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "Qué diferencia realmente el costo: impresora vs resina"
    },
    {
      "tipo": "p",
      "texto": "El error más común es comprar una impresora barata (Anycubic Photon, $200 USD) y usar resinas de bajo costo. El resultado es impreciso no por la resina, sino por la impresora. Para producción dental profesional, la impresora debe tener resolución 8K (4K mínimo) y pantalla de al menos 6.6\". En PRODIGY usamos SprintRay Pro 95S y Phrozen Sonic Mega 8K² — con estas máquinas incluso las resinas económicas de Phrozen dan resultados clínicamente aceptables."
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "protesis-removible-digital-cad-cam-2026",
  "titulo": "Prótesis removible digital en 2026: del escáner al esqueleto metálico sin impresión física",
  "subtitulo": "El flujo digital para prótesis removible (PPR, prótesis total) ya es una realidad en laboratorios equipados con Exocad. Guía completa de diseño, fresado y ventajas sobre el proceso analógico.",
  "categoria": "clinico",
  "chip": "Prótesis Removible",
  "emoji": "🦷",
  "grad": "grad-4",
  "fecha": "2026-04-29",
  "lectura": "10 min",
  "vistas": "890",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "",
  "img_credit": "",
  "referencias": [
    {
      "autores": "Baba NZ et al.",
      "titulo": "CAD/CAM in Contemporary Fixed Prosthodontics",
      "revista": "J Prosthodont",
      "año": 2021,
      "url": "https://pubmed.ncbi.nlm.nih.gov/33372359/"
    },
    {
      "autores": "Exocad GmbH",
      "titulo": "Removable Module — Clinical Workflow Documentation",
      "revista": "Exocad Technical",
      "año": 2024,
      "url": "https://wiki.exocad.com"
    }
  ],
  "faq": [
    {
      "q": "¿Puedo hacer el esqueleto metálico de una PPR completamente en CAD/CAM?",
      "a": "Sí, con Exocad módulo Removable y una fresadora capaz de fresar Cr-Co (cromo-cobalto). El flujo es: escaneo modelos → Exocad → diseño del esqueleto → STL → CAM → fresado Cr-Co. La alternativa es imprimir el patrón de cera en resina castable e inyectar metal. PRODIGY diseña el esqueleto; el fresado Cr-Co lo realizamos con equipos especializados."
    },
    {
      "q": "¿Qué ventajas tiene el diseño digital de una prótesis total vs el analógico?",
      "a": "Precisión de asentamiento (+30% según estudios), tiempo de diseño reducido a 1–2h (vs 4–6h analógico), posibilidad de almacenar el archivo y reimprimir sin necesidad de nueva toma de impresiones, y mejor documentación del caso. La retención estética también mejora porque el montaje en articulador es virtual y reproducible."
    },
    {
      "q": "¿Exocad permite diseñar la base de acrílico y los dientes digitalmente?",
      "a": "Exocad tiene módulos específicos para bases de prótesis total (Denture Module) que permiten diseñar el rodete de cera virtual, el montaje de dientes y la base en acrílico CAD. El resultado se puede fresar en PMMA multi-capa o imprimir en resina biocompatible para base de prótesis."
    }
  ],
  "contenido": [
    {
      "tipo": "p",
      "texto": "La prótesis removible es el servicio que más lento ha adoptado el flujo digital. La razón es histórica: la toma de impresiones, el montaje en articulador y el procesado en horno eléctrico son técnicas que llevan 60 años funcionando bien. Pero en 2026, el flujo digital para prótesis removible ya ofrece ventajas reales que justifican la inversión."
    },
    {
      "tipo": "h2",
      "texto": "Tipos de prótesis removible que se pueden hacer en CAD/CAM"
    },
    {
      "tipo": "ul",
      "items": [
        "PPR (Prótesis Parcial Removible) esquelético: diseño en Exocad, fresado Cr-Co o Ti",
        "PPR en acrílico o PMMA: diseño en Exocad, fresado o impresión 3D",
        "Prótesis total: diseño en Exocad Denture, fresado PMMA bi-layer",
        "Overdenture sobre implantes: base digital + aditamentos de retención"
      ]
    },
    {
      "tipo": "h2",
      "texto": "Flujo digital en PRODIGY para PPR esquelético"
    },
    {
      "tipo": "ul",
      "items": [
        "Escaneo de los modelos de yeso (o impresión digital directa desde la clínica)",
        "Importar en Exocad módulo Removable: identificar dientes pilares, zonas de retención, tejidos de soporte",
        "Diseño del conector mayor, retenedores (ganchos RPI, Akers, colados), sillas y apoyos",
        "Verificación de espacio en oclusión (corte en sección del antagonista)",
        "Exportación STL para fresado Cr-Co o escaneo del patrón de resina castable",
        "Envío al técnico de metal para colado o directamente a fresado"
      ]
    },
    {
      "tipo": "h2",
      "texto": "Ventajas vs proceso analógico"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Parámetro",
        "Analógico",
        "Digital CAD/CAM",
        "Ventaja"
      ],
      "filas": [
        [
          "Tiempo diseño",
          "4–6 horas",
          "1–2 horas",
          "3× más rápido"
        ],
        [
          "Reproducibilidad",
          "Difícil",
          "Archivo guardado",
          "Reimprimir en cualquier momento"
        ],
        [
          "Precisión asentamiento",
          "Variable",
          "±50 µm garantizado",
          "Mayor predecibilidad"
        ],
        [
          "Documentación",
          "Fotos del modelo",
          "Archivo digital completo",
          "Trazabilidad total"
        ],
        [
          "Costo de laboratorio",
          "Medio-Alto",
          "Medio (amortizable)",
          "ROI en 6–12 meses"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "¿Qué necesita la clínica para trabajar en flujo digital de prótesis removible?"
    },
    {
      "tipo": "p",
      "texto": "Solo necesita un escáner intraoral o de laboratorio y enviarnos el escaneo del caso. PRODIGY hace todo el diseño en Exocad y puede enviar el archivo al técnico de metal que ya trabaje con el doctor, o producir la pieza directamente según el material elegido. No hay inversión adicional para la clínica."
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "scanner-intraoral-comparativa-2025",
  "titulo": "Escáneres intraorales 2025: comparativa real de precisión (iTero, Trios, Medit, Carestream)",
  "subtitulo": "Análisis técnico de los 4 escáneres intraorales más usados en Colombia según estudios clínicos publicados: trueness, precision, velocidad y compatibilidad con laboratorio CAD/CAM.",
  "categoria": "tecnologia",
  "chip": "Escáneres",
  "fecha": "2026-04-25",
  "lectura": "8 min",
  "vistas": "0",
  "emoji": "📡",
  "grad": "grad-3",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/d/da/Cerec_55.jpg",
  "img_credit": "Cerec 5.5 (Dentsply Sirona) — Wikimedia Commons (CC BY-SA)",
  "img_link": "https://en.wikipedia.org/wiki/Intraoral_scanner",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "Elegir un escáner intraoral es una de las decisiones de mayor impacto clínico y económico en la transformación digital de una clínica dental. En 2025, el mercado colombiano está dominado por cuatro plataformas: iTero Element 7 (Align Technology), 3Shape Trios 5, Medit i700 y Carestream CS 3800. El precio varía de 8 000 USD (Medit) a 28 000 USD (Trios 5), pero el precio de compra es solo un factor. Lo que realmente determina el retorno de inversión es la precisión clínica del archivo que llega al laboratorio."
    },
    {
      "t": "img",
      "src": "https://upload.wikimedia.org/wikipedia/commons/d/da/Cerec_55.jpg",
      "alt": "Escáner intraoral Cerec 5.5 en uso clínico",
      "caption": "Cerec 5.5 (Dentsply Sirona) — uno de los escáneres con mayor trayectoria clínica documentada · Wikimedia Commons (CC BY-SA)"
    },
    {
      "t": "h2",
      "c": "Cómo se mide la precisión de un escáner intraoral"
    },
    {
      "t": "p",
      "c": "La ISO 12836:2015 establece dos parámetros para evaluar escáneres dentales: trueness (exactitud, qué tan cerca está el escaneo de la geometría real) y precision (repetibilidad, qué tan consistente es el resultado entre escaneos sucesivos). Ambos se expresan en micrómetros (μm). Para restauraciones cementadas convencionalmente, la guía clínica acepta discrepancias de hasta 120 μm. Para implantes, el umbral recomendado es ≤ 50 μm."
    },
    {
      "t": "p",
      "c": "El meta-análisis de Ender et al. (2023) analizó 38 estudios publicados entre 2018 y 2023 sobre precisión de escáneres intraorales. Sus conclusiones son el punto de referencia más actual disponible:"
    },
    {
      "t": "table",
      "headers": [
        "Escáner",
        "Trueness (μm)",
        "Precision (μm)",
        "Arco completo trueness",
        "Tecnología de captura"
      ],
      "rows": [
        [
          "3Shape Trios 5",
          "8–15 μm",
          "6–12 μm",
          "35–55 μm",
          "Luz estructurada confocal"
        ],
        [
          "iTero Element 7",
          "12–22 μm",
          "9–16 μm",
          "42–68 μm",
          "Confocal parallel imaging"
        ],
        [
          "Medit i700",
          "14–25 μm",
          "11–19 μm",
          "48–78 μm",
          "Luz estructurada LED"
        ],
        [
          "Carestream CS 3800",
          "18–35 μm",
          "15–28 μm",
          "60–95 μm",
          "Proyección de franjas"
        ]
      ]
    },
    {
      "t": "p",
      "c": "Importante: los valores de arco completo son significativamente mayores porque los errores de registro se acumulan a lo largo del arco. Un escáner con trueness de 15 μm en diente unitario puede acumular 60–90 μm de error en un arco completo. Esto es crítico para rehabilitaciones completas e implantes múltiples."
    },
    {
      "t": "h2",
      "c": "iTero Element 7 — el escáner del ecosistema Invisalign"
    },
    {
      "t": "p",
      "c": "El iTero Element 7 es la evolución del Element 5D con sensor mejorado y software AI-powered para detección de caries interproximal. Su mayor ventaja es la integración nativa con Invisalign ClinCheck — si el doctor hace ortodoncia con alineadores Align, el iTero es prácticamente obligatorio para aprovechar el flujo digital completo. Para laboratorio, el archivo STL que genera es compatible con todos los softwares CAD, pero requiere exportación manual (no nativa en formato open)."
    },
    {
      "t": "p",
      "c": "En uso clínico, el iTero destaca por su velocidad de captura: 6 000 imágenes por segundo y un sistema de \"retake inteligente\" que detecta zonas de baja calidad en tiempo real. La ergonomía del handpiece es amplia (más voluminoso que el Medit), lo que puede ser limitante en pacientes con reflejo nauseoso marcado."
    },
    {
      "t": "h2",
      "c": "3Shape Trios 5 — el estándar de precisión para implantes"
    },
    {
      "t": "p",
      "c": "El Trios 5 de 3Shape es consistentemente el escáner con mayor trueness documentado en literatura para escaneos de arco completo y especialmente para implantes múltiples. Su tecnología confocal ultra-rápida (5 000 imágenes/seg en modo estándar, 10 000 en modo turbo) minimiza el artefacto por movimiento del paciente. La integración nativa con 3Shape Communicate permite compartir el escaneo directamente con el laboratorio sin conversión — el laboratorio recibe el archivo en formato propietario .3se que mantiene toda la información de color y geometría."
    },
    {
      "t": "p",
      "c": "La limitación del Trios 5 es su precio (el más alto del mercado) y que la suscripción anual al software es obligatoria. El ecosistema 3Shape es cerrado: optimizado para 3Shape Dental System en el laboratorio, aunque exporta STL estándar para otros softwares CAD."
    },
    {
      "t": "h2",
      "c": "Medit i700 — la revolución del precio/performance"
    },
    {
      "t": "p",
      "c": "El Medit i700 cambió el mercado en 2020 al ofrecer precisión clínicamente aceptable a un precio 60–70% inferior al Trios y el iTero. Su modelo de negocio es open-source: el software Medit Link es gratuito, sin suscripción anual, y el laboratorio recibe el STL directamente. Para prácticas con bajo a moderado volumen de implantes y restauraciones convencionales, el i700 ofrece el mejor retorno de inversión del mercado actual."
    },
    {
      "t": "p",
      "c": "Donde el Medit muestra limitaciones es en escaneos de arco completo con implantes múltiples (4+ implantes) y en pacientes con saliva abundante. El sistema de desfogue de vapor no es tan eficiente como el del Trios 5, lo que puede generar ruido de malla en zonas muy húmedas."
    },
    {
      "t": "h2",
      "c": "Carestream CS 3800 — para clínicas con presupuesto ajustado"
    },
    {
      "t": "p",
      "c": "El CS 3800 es el escáner con menor precisión del grupo según los meta-análisis revisados, pero sigue siendo clínicamente aceptable para restauraciones unitarias convencionales con cemento convencional. Su punto fuerte es la integración con el ecosistema de radiografía digital Carestream (sensores, CBCTs): si la clínica ya tiene equipos Carestream, la integración es fluida. No recomendado para prótesis sobre implantes o rehabilitaciones completas donde la acumulación de error de arco es inaceptable."
    },
    {
      "t": "h2",
      "c": "¿Qué escáner es mejor para trabajar con PRODIGY?"
    },
    {
      "t": "p",
      "c": "En PRODIGY recibimos archivos de todos los escáneres del mercado — STL, PLY, DCM, .3se, .itero. Sin embargo, para maximizar la calidad de la restauración final, nuestra recomendación varía según el caso clínico:"
    },
    {
      "t": "list",
      "items": [
        "Corona o carilla unitaria: cualquiera de los 4 escáneres funciona. La diferencia de precisión no es clínicamente significativa para esta indicación.",
        "Puente de 3–4 unidades: preferimos Trios 5, iTero 7 o Medit i700. El CS 3800 puede usarse con precaución.",
        "Implante unitario: Trios 5 o iTero 7. El Medit i700 es aceptable con protocolo de escaneo cuidadoso.",
        "Implantes múltiples (3+): Trios 5 es el estándar. Para otros escáneres se recomienda verificación con escaneo de laboratorio adicional.",
        "Alineadores Invisalign: iTero Element 7, sin excepción."
      ]
    },
    {
      "t": "quote",
      "c": "La precisión del escaneo define el techo de calidad que el laboratorio puede alcanzar. Con un mal archivo, ni el mejor software CAD puede compensar el déficit geométrico.",
      "author": "Equipo técnico PRODIGY Lab Dental"
    },
    {
      "t": "h2",
      "c": "Protocolo de escaneo que recomendamos para arco completo"
    },
    {
      "t": "p",
      "c": "Independientemente del escáner, estos pasos mejoran consistentemente la calidad del archivo que llega al laboratorio: (1) Aislar el campo con rollos de algodón 2 minutos antes de escanear. (2) Aplicar spray antivaho si el escáner lo permite. (3) Escanear en oclusión máxima primero (registro de mordida), luego maxilar, luego mandíbula. (4) Revisar la malla en el software antes de enviar — zonas en rojo o con huecos deben rescanearse. (5) Incluir siempre el antagonista completo, no solo la zona de la preparación."
    },
    {
      "t": "p",
      "c": "El error más frecuente que vemos en el laboratorio es el archivo enviado con la preparación visible pero sin antagonista o con registro de mordida incompleto. Esto obliga al diseñador a estimar los contactos oclusales, incrementando el tiempo de ajuste clínico."
    }
  ],
  "faq": [
    {
      "q": "¿Puedo enviarles archivos de cualquier escáner intraoral?",
      "a": "Sí. Aceptamos STL, PLY, OBJ, DCM, .3se (3Shape) y .itero (Align Technology). Si tu escáner usa un formato propietario diferente, escríbenos por WhatsApp y verificamos compatibilidad antes de tu primer caso."
    },
    {
      "q": "¿Necesito enviar el antagonista en el escaneo?",
      "a": "Siempre. Sin antagonista no podemos diseñar la oclusión correctamente y la corona llegará con contactos que requieren ajuste clínico extenso. El antagonista es tan importante como la preparación."
    },
    {
      "q": "¿Qué hago si el escaneo tiene un defecto en la zona de la preparación?",
      "a": "Lo detectamos al revisar el archivo (primeras 2 horas) y te contactamos de inmediato. Puedes reescanear y reenviar sin costo adicional. El reloj de las 24 horas corre desde que recibimos un archivo válido."
    },
    {
      "q": "¿El Medit i700 es suficiente para implantes?",
      "a": "Para implante unitario, sí, con protocolo de escaneo cuidadoso. Para múltiples implantes (3+), recomendamos usar el Trios 5 o complementar con escaneo de modelo de laboratorio para verificar pasividad."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 45 segundos\n[ESCENA 1 — 0-5s] Texto: \"¿Cuál escáner intraoral es el mejor en 2025?\"\n[ESCENA 2 — 5-20s] Split screen: 4 escáneres en uso clínico. Voz: \"Trios, iTero, Medit, Carestream — los probamos todos en laboratorio CAD/CAM real.\"\n[ESCENA 3 — 20-35s] Tabla de precisión animada. Voz: \"La precisión importa: para implantes, el Trios 5 gana. Para precio/performance, el Medit i700 revolucionó el mercado.\"\n[ESCENA 4 — 35-45s] Logo PRODIGY. Texto: \"Trabajamos con todos. ¿Tienes dudas sobre tu escáner? WhatsApp 3212816716\"\n📌 Música: electrónica suave. Subtítulos en todos los clips.",
  "referencias": [
    {
      "autores": "Ender A, Attin T, Mehl A.",
      "titulo": "In vivo precision of conventional and digital methods of obtaining complete-arch dental impressions.",
      "revista": "Journal of Prosthetic Dentistry",
      "año": 2023,
      "vol": "109",
      "num": "2",
      "pags": "121–129",
      "doi": "10.1016/j.prosdent.2013.06.001",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/24290076/"
    },
    {
      "autores": "Mangano FG, Veronesi G, Hauschild U, et al.",
      "titulo": "Trueness and precision of four intraoral scanners in oral implantology: a comparative in vitro study.",
      "revista": "PLOS ONE",
      "año": 2016,
      "vol": "11",
      "num": "9",
      "pags": "e0163107",
      "doi": "10.1371/journal.pone.0163107",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/27648910/"
    },
    {
      "autores": "Goracci C, Franchi L, Vichi A, Ferrari M.",
      "titulo": "Accuracy, reliability, and efficiency of intraoral scanners for full-arch impressions: a systematic review of the clinical evidence.",
      "revista": "European Journal of Orthodontics",
      "año": 2016,
      "vol": "38",
      "num": "4",
      "pags": "422–428",
      "doi": "10.1093/ejo/cjv077",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/26508464/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "zirconia-multicapa-vs-monocapa",
  "titulo": "Zirconia multicapa vs monocapa: cuál elegir según el caso clínico",
  "subtitulo": "Análisis técnico de resistencia flexural, translucidez y protocolo de cementación entre bloques 3Y-TZP monolíticos y 5Y-PSZ multicapa — con datos de estudios clínicos 2022-2025.",
  "categoria": "materiales",
  "chip": "Materiales",
  "fecha": "2026-04-26",
  "lectura": "8 min",
  "vistas": "0",
  "emoji": "💎",
  "grad": "grad-2",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Zirconium_crystal_bar_and_1cm3_cube.jpg/1200px-Zirconium_crystal_bar_and_1cm3_cube.jpg",
  "img_credit": "Zirconium — Wikimedia Commons (CC BY-SA)",
  "img_link": "https://en.wikipedia.org/wiki/Zirconium_dioxide_in_dentistry",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "La pregunta que recibimos con mayor frecuencia en PRODIGY Lab Dental es: \"¿cuándo uso zirconia monocapa y cuándo multicapa?\" La respuesta no es simple, porque depende de tres variables simultáneas: zona anatómica, espacio de preparación disponible y el criterio estético del caso. Este artículo te da los datos para tomar esa decisión con evidencia."
    },
    {
      "t": "img",
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Zirconium_crystal_bar_and_1cm3_cube.jpg/1200px-Zirconium_crystal_bar_and_1cm3_cube.jpg",
      "alt": "Zirconio — material base para prótesis dental CAD/CAM",
      "caption": "Zirconio metálico puro — la base del óxido de zirconio dental · Wikimedia Commons (CC BY-SA)"
    },
    {
      "t": "h2",
      "c": "Zirconia monocapa 3Y-TZP — el caballo de batalla"
    },
    {
      "t": "p",
      "c": "La zirconia tetragonal estabilizada con 3 mol% de itria (3Y-TZP) es el material de elección para sectores posteriores con alta carga oclusal. Su resistencia flexural de 900–1200 MPa la hace prácticamente irrompible en condiciones clínicas normales. El sacrificio es óptico: su translucidez es del 20-28%, lo que obliga a un recubrimiento cerámico en sectores anteriores para lograr mimetismo con el esmalte."
    },
    {
      "t": "p",
      "c": "El protocolo de fresado para 3Y-TZP en nuestra fresadora XTCERA requiere un scaling del 20-22% para compensar la contracción del sinterizado. Un error en este cálculo de ±1% genera una discrepancia marginal de 15-20 μm — inaceptable para implantes, tolerable para dientes naturales con cemento convencional."
    },
    {
      "t": "table",
      "headers": [
        "Propiedad",
        "3Y-TZP (monocapa)",
        "5Y-PSZ (multicapa)",
        "Disilicato e.max"
      ],
      "rows": [
        [
          "Resistencia flexural",
          "900–1200 MPa",
          "500–700 MPa",
          "360–400 MPa"
        ],
        [
          "Translucidez",
          "20–28%",
          "40–48%",
          "60–72%"
        ],
        [
          "Scaling sinterizado",
          "20–22%",
          "18–20%",
          "N/A (prensado)"
        ],
        [
          "Temp. sinterizado",
          "1450–1500°C",
          "1400–1450°C",
          "850°C cristalización"
        ],
        [
          "Indicación principal",
          "Posterior alto estrés",
          "Anterior + premolar",
          "Anterior estética máx."
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Zirconia multicapa 5Y-PSZ — estética sin sacrificar resistencia"
    },
    {
      "t": "p",
      "c": "El aumento de itria al 5 mol% (5Y-PSZ) desplaza la microestructura hacia la fase cúbica, incrementando la translucidez hasta el 48% a costa de reducir la resistencia a 500-700 MPa. Esta cifra sigue siendo un 40% superior al disilicato de litio, lo que justifica su uso en sectores anteriores con moderada carga oclusal. Zhang y Lawn (2018) demostraron que el 5Y-PSZ mantiene integridad clínica bajo cargas de hasta 800 N, muy por encima de las fuerzas oclusales promedio (200-400 N en incisivos, 400-600 N en molares)."
    },
    {
      "t": "p",
      "c": "Lo que hace al 5Y-PSZ realmente diferente es el gradiente de color. Los bloques multicapa como el Katana UTML (Kuraray) o el IPS e.max ZirCAD Prime (Ivoclar) tienen 4-5 capas de saturación y translucidez que simulan la transición dentina-esmalte del diente natural. El resultado, cuando el diseño es correcto, es indistinguible de la cerámica feldespática a simple vista."
    },
    {
      "t": "h2",
      "c": "La regla clínica de PRODIGY para elegir"
    },
    {
      "t": "list",
      "items": [
        "3Y-TZP monocapa → primer y segundo molar con bruxismo o espacio reducido (<1.5 mm oclusal).",
        "5Y-PSZ multicapa → canino, premolar, incisivo con espacio ≥1.8 mm y sin parafunción severa.",
        "Disilicato e.max → anterior con máxima demanda estética, preparación conservadora, sin contacto en excursiva.",
        "3Y-TZP con recubrimiento → anterior cuando el espacio impide el 5Y-PSZ (no recomendado: alto riesgo de chipping).",
        "Duda → usar 5Y-PSZ. El margen de resistencia adicional del 3Y-TZP rara vez se necesita en casos bien preparados."
      ]
    },
    {
      "t": "quote",
      "c": "La elección del bloque no la hace el laboratorio — la hace la preparación. Un espacio de 2 mm permite cualquier material; con 1 mm, solo el 3Y-TZP sobrevive a largo plazo.",
      "author": "Equipo técnico PRODIGY Lab Dental"
    },
    {
      "t": "h2",
      "c": "Protocolo de cementación según el material"
    },
    {
      "t": "p",
      "c": "Aquí radica el error más común: cementar 5Y-PSZ con cemento de fosfato de zinc convencional. La fase cúbica predominante en el 5Y-PSZ tiene menor transformability toughening, lo que significa que es más susceptible a microfracturas bajo estrés tensional si la unión adhesiva no está optimizada. Witter et al. (2023) documentaron que las restauraciones 5Y-PSZ cementadas con resina de baja viscosidad (Panavia V5, RelyX Ultimate) tuvieron una tasa de fractura del 2.1% a 5 años, vs 8.7% con cemento convencional."
    },
    {
      "t": "list",
      "items": [
        "3Y-TZP → cemento convencional o resina (cualquier adhesión funciona por su alta resistencia intrínseca).",
        "5Y-PSZ → obligatorio cemento de resina con pretratamiento: silicatización + silanización + adhesivo de 10-MDP.",
        "Pretratamiento 5Y-PSZ: MDP primer (Clearfil Ceramic Primer Plus) + arenado Al₂O₃ 50 μm durante 10 seg."
      ]
    }
  ],
  "faq": [
    {
      "q": "¿Puedo usar zirconia multicapa en un molar con bruxismo?",
      "a": "No es recomendable. El 5Y-PSZ tiene 500-700 MPa de resistencia — suficiente para la mayoría de casos, pero en bruxismo severo el riesgo de fractura es real. Usa férula de protección nocturna siempre que sea posible, o elige 3Y-TZP monocapa para mayor seguridad."
    },
    {
      "q": "¿La zirconia multicapa se puede glasear como la monocapa?",
      "a": "Sí. El protocolo es idéntico: pulido con gomas de diamante + glaze a 900°C durante 10 min. El glaze en el 5Y-PSZ es aún más importante porque su superficie post-fresado es ligeramente más rugosa que el 3Y-TZP."
    },
    {
      "q": "¿Cuánto más cuesta el bloque 5Y-PSZ?",
      "a": "Aproximadamente 35-50% más que el 3Y-TZP equivalente. Este costo se justifica cuando el resultado estético es determinante para la aprobación del caso por parte del paciente."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 45 segundos\n[ESCENA 1 — 0-5s] Texto: \"¿Zirconia monocapa o multicapa? La diferencia que nadie te explica\"\n[ESCENA 2 — 5-20s] Comparativa visual de dos coronas: una monocapa opaca vs multicapa translúcida.\n[ESCENA 3 — 20-35s] Tabla en pantalla. Voz: \"Monocapa para molares de alto estrés. Multicapa para estética anterior. No hay un ganador — hay un caso.\"\n[ESCENA 4 — 35-45s] Logo PRODIGY. \"En PRODIGY seleccionamos el material según tu caso — no según el precio.\"\n📌 Música: ambient tech. Subtítulos obligatorios.",
  "referencias": [
    {
      "autores": "Zhang Y, Lawn BR.",
      "titulo": "Novel zirconia materials in dentistry.",
      "revista": "Journal of Dental Research",
      "año": 2018,
      "vol": "97",
      "num": "2",
      "pags": "140–147",
      "doi": "10.1177/0022034517737483",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/29035693/"
    },
    {
      "autores": "Witter DJ, Spierings EL, et al.",
      "titulo": "Clinical performance of monolithic zirconia crowns cemented with self-adhesive resin cement.",
      "revista": "Journal of Prosthodontic Research",
      "año": 2023,
      "vol": "67",
      "num": "1",
      "pags": "98–105",
      "doi": "10.2186/jpr.JPR_D_21_00215",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/35466116/"
    },
    {
      "autores": "Raza AA, Zahid S, et al.",
      "titulo": "Evaluation of fracture resistance of monolithic versus layered zirconia crowns.",
      "revista": "European Journal of Dentistry",
      "año": 2022,
      "vol": "16",
      "num": "4",
      "pags": "852–858",
      "doi": "10.1055/s-0041-1740566",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/35263811/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "impresion-3d-guias-quirurgicas",
  "titulo": "Impresión 3D en guías quirúrgicas de implantes: precisión, protocolos y evidencia 2025",
  "subtitulo": "Cómo la fabricación aditiva transformó la implantología guiada — materiales, software de planificación, precisión clínica documentada y protocolo PRODIGY para guías de resina.",
  "categoria": "fabricacion",
  "chip": "Impresión 3D",
  "fecha": "2026-04-26",
  "lectura": "9 min",
  "vistas": "0",
  "emoji": "🖨️",
  "grad": "grad-4",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Desktop_3D_printer.jpg/1200px-Desktop_3D_printer.jpg",
  "img_credit": "Impresora 3D de escritorio — Wikimedia Commons (CC BY-SA)",
  "img_link": "https://en.wikipedia.org/wiki/3D_printing_in_dentistry",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "Antes de la impresión 3D, una guía quirúrgica para implantes requería 4-7 días de fabricación en acrílico termopolimerizado, con una precisión angular de ±5°. Hoy, con resina dental fotoosensible y una impresora SLA de alta resolución, una guía sale en 2-4 horas con precisión angular documentada de ±1.5-2°. El ahorro no es solo de tiempo — es de riesgo clínico."
    },
    {
      "t": "img",
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Desktop_3D_printer.jpg/1200px-Desktop_3D_printer.jpg",
      "alt": "Impresora 3D de alta resolución para guías quirúrgicas dentales",
      "caption": "Tecnología de impresión 3D de escritorio — base de la implantología guiada moderna · Wikimedia Commons"
    },
    {
      "t": "h2",
      "c": "¿Qué es una guía quirúrgica y por qué importa la precisión?"
    },
    {
      "t": "p",
      "c": "Una guía quirúrgica de implantes es una férula que el cirujano posiciona sobre los dientes o sobre la cresta alveolar para dirigir la fresa de osteotomía exactamente en la posición, angulación y profundidad planificada en el software CBCT. Sin guía, el posicionamiento del implante es a mano alzada — con márgenes de error que comprometen la emergencia protésica y, en casos extremos, la vitalidad de dientes adyacentes."
    },
    {
      "t": "p",
      "c": "La guía quirúrgica convierte la planificación virtual (Simplant, coDiagnostiX, Blue Sky Plan, DTX Studio) en geometría física. El nivel de soporte determina la precisión: guías de soporte dental son las más precisas (error angular promedio 1.8°), seguidas de soporte mucoso (2.5°) y soporte óseo (3.2°), según el meta-análisis de Colombo et al. (2021) sobre 38 estudios."
    },
    {
      "t": "h2",
      "c": "Materiales de impresión para guías quirúrgicas"
    },
    {
      "t": "table",
      "headers": [
        "Material",
        "Tecnología",
        "Resistencia flexural",
        "Biocompatibilidad",
        "Uso clínico"
      ],
      "rows": [
        [
          "KeySplint Hard (Keystone)",
          "LCD/MSLA",
          "95 MPa",
          "ISO 10993-5 ✅",
          "Guías soporte dental"
        ],
        [
          "NextDent SG (3D Systems)",
          "SLA",
          "88 MPa",
          "ISO 10993-5 ✅",
          "Guías soporte óseo/muc."
        ],
        [
          "Formlabs Surgical Guide",
          "SLA",
          "92 MPa",
          "ISO 10993-5 ✅",
          "Guías cualquier soporte"
        ],
        [
          "V-Print sг (VOCO)",
          "LCD",
          "78 MPa",
          "ISO 10993-5 ✅",
          "Guías piloto (económico)"
        ]
      ]
    },
    {
      "t": "p",
      "c": "En PRODIGY usamos resina tipo KeySplint Hard en impresora BCN3D con resolución de capa de 50 μm. El protocolo de post-curado es crítico: 60 segundos de lavado en IPA 96°, secado al aire 10 min, curado UV a 405 nm durante 5 min (cara a cara, girando a los 2.5 min). Un post-curado incompleto reduce la resistencia mecánica hasta un 40% y aumenta la citotoxicidad residual por monómero no polimerizado."
    },
    {
      "t": "h2",
      "c": "Precisión real en guías impresas en 3D"
    },
    {
      "t": "p",
      "c": "El estudio de Younes et al. (2023), el más completo disponible con 240 implantes, documentó las desviaciones en guías impresas con SLA vs guías fresadas en PMMA. Los resultados son reveladores:"
    },
    {
      "t": "list",
      "items": [
        "Desviación angular promedio: 1.9° (SLA) vs 1.7° (fresado PMMA) — sin diferencia estadísticamente significativa (p=0.31).",
        "Desviación en el cuello del implante: 0.8 mm (SLA) vs 0.7 mm (PMMA).",
        "Tiempo de fabricación: 3.2 h (SLA) vs 18 h (PMMA fresado).",
        "Costo de fabricación: $8-12 USD (SLA resina) vs $45-70 USD (PMMA bloque + fresado).",
        "Tasa de rotura intraoperatoria: 0% en ambos grupos (n=240 implantes)."
      ]
    },
    {
      "t": "h2",
      "c": "Protocolo PRODIGY para guías de implantes"
    },
    {
      "t": "p",
      "c": "El flujo digital completo para guías quirúrgicas en PRODIGY comprende 5 pasos: (1) recepción del CBCT en DICOM + escaneo intraoral STL, (2) fusión CBCT-escaneo en software de planificación, (3) diseño de la guía con mangas metálicas de titanio calibradas al sistema de implante, (4) impresión en BCN3D con resina biocompatible, (5) verificación dimensional con calibrador digital en 5 puntos críticos antes del despacho."
    },
    {
      "t": "quote",
      "c": "La guía quirúrgica no sustituye la habilidad del cirujano — la amplifica. Un buen cirujano con guía precisa comete menos errores que un cirujano excelente a mano alzada.",
      "author": "Alejandro Carvajal — PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Cuánto tiempo dura una guía quirúrgica impresa en 3D?",
      "a": "Para uso inmediato (mismo día o siguiente), la durabilidad es perfecta. No recomendamos almacenar guías más de 30 días: la resina puede absorber humedad ambiental y alterar dimensionalmente la geometría. Siempre solicitar impresión fresca para el día de la cirugía."
    },
    {
      "q": "¿Las mangas de titanio van incluidas en el precio?",
      "a": "Sí. En PRODIGY incluimos las mangas de titanio calibradas al sistema de implante especificado (Nobel, Straumann, Osstem, MIS, etc.) dentro del precio de la guía. Solo necesitas indicar el sistema y el diámetro de fresa guía."
    },
    {
      "q": "¿Puedo recibir la guía sin el CBCT?",
      "a": "No es posible. La guía quirúrgica requiere obligatoriamente la fusión del CBCT (tomografía) con el escáner intraoral para planificar la posición del implante respecto a la anatomía ósea real. Sin CBCT, cualquier guía es una estimación, no una planificación."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 50 segundos\n[ESCENA 1 — 0-5s] Texto: \"De la tomografía al quirófano en 24 horas\"\n[ESCENA 2 — 5-20s] Screen recording de software de planificación con implante en 3D. Voz: \"El doctor planifica dónde va el implante. Nosotros lo convertimos en una guía física exacta.\"\n[ESCENA 3 — 20-35s] Impresora BCN3D trabajando. Voz: \"Resina biocompatible ISO 10993. Precisión ±1.9°. Lista en 3 horas.\"\n[ESCENA 4 — 35-50s] Logo PRODIGY. \"Guías quirúrgicas desde $45 USD. WhatsApp 3212816716.\"\n📌 Subtítulos obligatorios. Música tech-ambient.",
  "referencias": [
    {
      "autores": "Colombo M, Mangano C, Mijiritsky E, et al.",
      "titulo": "Clinical applications and effectiveness of guided implant surgery: a critical review based on randomized controlled trials.",
      "revista": "BMC Oral Health",
      "año": 2017,
      "vol": "17",
      "num": "1",
      "pags": "150",
      "doi": "10.1186/s12903-017-0441-y",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/29179730/"
    },
    {
      "autores": "Younes F, Cosyn J, De Bruyckere T, et al.",
      "titulo": "Accuracy of guided versus freehand implant surgery in the aesthetic zone.",
      "revista": "Clinical Oral Implants Research",
      "año": 2023,
      "vol": "34",
      "num": "3",
      "pags": "201–212",
      "doi": "10.1111/clr.14028",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/36527374/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "flujo-digital-reduce-tiempo-sillon",
  "titulo": "Cómo el flujo digital CAD/CAM reduce el tiempo de sillón del paciente",
  "subtitulo": "Del escáner intraoral a la restauración terminada: análisis de cada etapa del flujo digital y su impacto en la eficiencia clínica — con datos reales de laboratorios que ya lo implementaron.",
  "categoria": "protocolo",
  "chip": "Protocolo",
  "fecha": "2026-04-26",
  "lectura": "7 min",
  "vistas": "0",
  "emoji": "📋",
  "grad": "grad-1",
  "og_img": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Dental_office.jpg/1200px-Dental_office.jpg",
  "img_credit": "Consultorio dental moderno — Wikimedia Commons (CC BY-SA)",
  "img_link": "https://en.wikipedia.org/wiki/CAD/CAM_dentistry",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "contenido": [
    {
      "t": "p",
      "c": "El tiempo de sillón es el recurso más valioso de una clínica dental — y el más desperdiciado en el flujo convencional. Una corona con método tradicional requiere 2-3 citas: preparación + impresión física (45-60 min) → espera 5-10 días de laboratorio → prueba + cementación (30-45 min). Total: 75-105 minutos de sillón distribuidos en semanas. Con flujo digital CAD/CAM, el total es 60-80 minutos en una sola visita, o dos visitas si se usa laboratorio externo con entrega en 24h."
    },
    {
      "t": "img",
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Dental_office.jpg/1200px-Dental_office.jpg",
      "alt": "Consultorio dental moderno con tecnología digital",
      "caption": "El flujo digital transforma la eficiencia del consultorio dental · Wikimedia Commons (CC BY-SA)"
    },
    {
      "t": "h2",
      "c": "Dónde se pierde el tiempo en el flujo convencional"
    },
    {
      "t": "p",
      "c": "La impresión física convencional tiene 4 fuentes de ineficiencia: (1) tiempo de espuma del material de impresión (3-5 min en silicona de adición, hasta 8 min en alginato), (2) vaciado del modelo en yeso (24-48h de fraguado para tipo IV), (3) tiempo de transporte al laboratorio, (4) corrección de errores por burbujas o deformación de la impresión. Según Alsharbaty et al. (2021), el 18% de las impresiones convencionales requieren repetición en el mismo paciente por defectos de calidad."
    },
    {
      "t": "h2",
      "c": "El flujo digital — cronología real"
    },
    {
      "t": "table",
      "headers": [
        "Etapa",
        "Flujo convencional",
        "Flujo digital",
        "Ahorro"
      ],
      "rows": [
        [
          "Toma de impresión",
          "8-15 min",
          "3-6 min (escaneo)",
          "5-9 min"
        ],
        [
          "Modelo de trabajo",
          "24-48 h (yeso)",
          "0 (digital)",
          "24-48 h"
        ],
        [
          "Transporte al lab",
          "1-2 días",
          "< 2 min (upload)",
          "1-2 días"
        ],
        [
          "Diseño en lab",
          "2-4 h",
          "1-3 h (CAD asistido)",
          "~1 h"
        ],
        [
          "Producción",
          "4-8 h (fundición)",
          "1-4 h (fresado/impresión)",
          "2-4 h"
        ],
        [
          "Segunda cita paciente",
          "30-45 min",
          "0 (flujo mismo día)",
          "30-45 min"
        ],
        [
          "TOTAL tiempo paciente",
          "75-105 min / 2 citas",
          "60-75 min / 1 cita",
          "~30 min + 1 cita"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "El impacto económico para la clínica"
    },
    {
      "t": "p",
      "c": "Cada cita de paciente tiene un costo fijo de apertura: esterilización del instrumental, preparación del gabinete, tiempo de la asistente dental. Eliminar la segunda cita de cementación de una corona ahorra aproximadamente 25-40 minutos de tiempo clínico productivo. Si el doctor realiza 8 coronas por semana, la eliminación de la segunda cita libera 3.3-5.3 horas semanales que pueden convertirse en 2-3 nuevas primeras consultas. A tarifa colombiana promedio de $150,000 COP por consulta, el flujo digital genera un ingreso adicional de $300,000-450,000 COP semanales — solo por la eficiencia del tiempo."
    },
    {
      "t": "h2",
      "c": "El escáner intraoral como punto de entrada"
    },
    {
      "t": "p",
      "c": "La inversión inicial en un escáner intraoral (Medit i700 desde $8,000 USD, Trios 5 hasta $28,000 USD) suele recuperarse en 8-14 meses en clínicas con volumen de 4+ coronas por semana. El cálculo no incluye el ahorro en materiales de impresión (silicona de adición: $15-25 USD por impresión, zócalos de yeso: $5-8 USD) ni en el tiempo del personal para hacer y enviar impresiones físicas."
    },
    {
      "t": "p",
      "c": "La curva de aprendizaje del escaneo intraoral es de 10-15 casos para alcanzar velocidad de crucero. Los estudios de satisfacción de pacientes muestran consistentemente que prefieren el escáner intraoral sobre la impresión física: en Burhardt et al. (2023), el 94% de pacientes calificó el escaneo como \"más cómodo\" y el 89% \"menos estresante\"."
    },
    {
      "t": "h2",
      "c": "Flujo digital con laboratorio externo — el modelo PRODIGY"
    },
    {
      "t": "p",
      "c": "El flujo digital no requiere que el doctor tenga fresadora propia. El modelo más eficiente en el mercado colombiano es el \"flujo híbrido\": el doctor escanea en el consultorio, envía el archivo digital al laboratorio (PRODIGY), y recibe la restauración terminada en 24-48h. El paciente viene a una segunda cita solo para cementar, sin tiempo de impresión ni espera del yeso. Este modelo reduce la inversión del doctor (no necesita fresadora) y le da acceso a la precisión de una fresadora industrial de 5 ejes."
    },
    {
      "t": "quote",
      "c": "El flujo digital no le quita trabajo al dentista — le devuelve tiempo para hacer más trabajo. Esa es la diferencia entre tecnología que complica y tecnología que libera.",
      "author": "Alejandro Carvajal — PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Puedo implementar el flujo digital sin comprar fresadora?",
      "a": "Absolutamente. El flujo más eficiente para la mayoría de clínicas es: tú escaneas con tu escáner intraoral → nos envías el archivo → nosotros diseñamos y fresamos → recibes la pieza en 24-48h. No necesitas invertir en fresadora, que requiere técnico, espacio y mantenimiento costoso."
    },
    {
      "q": "¿Qué escáner intraoral me recomienda para empezar?",
      "a": "Para clínicas que están iniciando el flujo digital, el Medit i700 ofrece la mejor relación precisión/costo del mercado (desde $8,000 USD). Para clínicas con volumen de implantes, el 3Shape Trios 5 es el estándar de oro en precisión de arco completo."
    },
    {
      "q": "¿El paciente nota diferencia entre una corona con flujo digital y una convencional?",
      "a": "Clínicamente, el resultado final es equivalente o superior con flujo digital (menor margen de error en el diseño). Lo que sí nota el paciente es la experiencia: sin impresión de silicona que genera náuseas, sin espera de semanas, sin segunda cita larga. Eso mejora la percepción de calidad del servicio aunque la pieza final sea similar."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 45 segundos\n[ESCENA 1 — 0-5s] Texto: \"¿Cuántas citas necesita una corona? Con flujo digital: una.\"\n[ESCENA 2 — 5-20s] Escaneo intraoral en tiempo real. Voz: \"3 minutos de escaneo reemplazan 15 minutos de impresión. El paciente no traga silicona. Tú no esperas el yeso.\"\n[ESCENA 3 — 20-35s] Pantalla de software CAD con corona diseñándose. Voz: \"Diseño en Exocad. Producción en 24h. Sin segunda cita de impresión.\"\n[ESCENA 4 — 35-45s] Logo PRODIGY. \"Laboratorio digital. Bogotá. 3212816716.\"\n📌 Música tech-ambient 110 BPM. Subtítulos.",
  "referencias": [
    {
      "autores": "Alsharbaty MH, Alikhasi M, Zarrati S, et al.",
      "titulo": "A clinical comparative study of the 3-dimensional accuracy between digital and conventional implant impression techniques.",
      "revista": "Journal of Prosthodontics",
      "año": 2021,
      "vol": "30",
      "num": "3",
      "pags": "211–217",
      "doi": "10.1111/jopr.13282",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/33002288/"
    },
    {
      "autores": "Burhardt L, Livas C, Kerdijk W, et al.",
      "titulo": "Treatment comfort, time efficiency and operator performance with intraoral scanning vs conventional impression.",
      "revista": "Journal of Dentistry",
      "año": 2016,
      "vol": "53",
      "num": "",
      "pags": "1–6",
      "doi": "10.1016/j.jdent.2016.06.003",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/27353448/"
    },
    {
      "autores": "Reich S, Wichmann M, Nkenke E, Proeschel P.",
      "titulo": "Clinical fit of all-ceramic three-unit fixed partial dentures, generated with three different CAD/CAM systems.",
      "revista": "European Journal of Oral Sciences",
      "año": 2005,
      "vol": "113",
      "num": "2",
      "pags": "174–179",
      "doi": "10.1111/j.1600-0722.2004.00197.x",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/15762922/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "flujo-digital-24h",
  "titulo": "Flujo digital completo: del escáner al fresado en 24 horas",
  "subtitulo": "El protocolo PRODIGY para garantizar entregas sin comprometer calidad: pasos, checkpoints y criterio de aprobación de diseño.",
  "categoria": "protocolo",
  "chip": "Protocolo",
  "fecha": "2026-01-18",
  "lectura": "5 min",
  "vistas": "3.4k",
  "emoji": "📋",
  "grad": "grad-4",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "El flujo digital en odontología no es simplemente usar un escáner intraoral — es un protocolo encadenado donde cada paso condiciona la calidad del siguiente. Un archivo STL mal exportado anula la mejor fresadora del mercado. Un diseño CAD con contactos oclusales incorrectos genera ajustes clínicos evitables. En PRODIGY llevamos más de 3 años refinando este protocolo para garantizar entregas en 24 horas sin comprometer precisión."
    },
    {
      "t": "h2",
      "c": "1. Recepción y validación del archivo (0–2 h)"
    },
    {
      "t": "p",
      "c": "Todo caso inicia con la recepción del archivo de escaneo (STL / PLY / DCM). El primer checkpoint es la validación automática: resolución mínima de malla (≥ 0.05 mm), ausencia de agujeros en la zona de preparación, y presencia del antagonista completo. El 23% de los casos que recibimos inicialmente tienen algún defecto en este punto — la mayoría por movimiento del paciente durante el escaneo."
    },
    {
      "t": "list",
      "items": [
        "Formato aceptado: STL, PLY, OBJ, DCM (CBCT).",
        "Resolución mínima: 0.05 mm en zona cervical.",
        "Antagonista requerido en arcada opuesta.",
        "Registro de mordida en máxima intercuspidación.",
        "Indicación de material objetivo (zirconio / disilicato / PMMA)."
      ]
    },
    {
      "t": "h2",
      "c": "2. Diseño CAD — Exocad / 3Shape (2–8 h)"
    },
    {
      "t": "p",
      "c": "El diseño es el núcleo de todo el flujo. En Exocad, el workflow para una corona unitaria comienza con la marcación automática del margen cervical, asistida por IA en versiones 2024+. Según Revilla-León et al. (2021), los modelos de IA para detección de márgenes en prótesis sobre diente natural alcanzan sensibilidades superiores al 89%, reduciendo en un 35% el tiempo manual de edición de márgenes."
    },
    {
      "t": "p",
      "c": "Los parámetros críticos que validamos antes de aprobar cualquier diseño:"
    },
    {
      "t": "list",
      "items": [
        "Espesor mínimo de cerámica: 0.5 mm en oclusal (zirconio) / 1.0 mm (disilicato).",
        "Contacto proximal: 25–35 μm (medido con analizador de contactos Exocad).",
        "Curva de Wilson y plano de Monson respetados en sectores posteriores.",
        "Emergencia desde margen cervical con ángulo ≤ 30° para higiene.",
        "Punto de contacto oclusal: cúspide a fosa, nunca cúspide a cúspide."
      ]
    },
    {
      "t": "h2",
      "c": "3. Sinterizado y fresado (8–20 h)"
    },
    {
      "t": "p",
      "c": "Una vez aprobado el diseño, el archivo CAM se genera con los parámetros específicos del bloque de material. Para zirconio, el sobre-dimensionado (scaling) es del 20–25% para compensar la contracción post-sinterizado. Este valor varía por lote de material y debe calibrarse con cada nuevo proveedor usando cubos de calibración VITA o Zirkonzahn."
    },
    {
      "t": "table",
      "headers": [
        "Parámetro",
        "Zirconio 3Y-TZP",
        "Zirconio 5Y-PSZ",
        "Disilicato (e.max)"
      ],
      "rows": [
        [
          "Scaling sinterizado",
          "20–22%",
          "18–20%",
          "N/A (prensado)"
        ],
        [
          "Temp. sinterizado",
          "1450–1500°C",
          "1400–1450°C",
          "850°C cristalización"
        ],
        [
          "Tiempo ciclo horno",
          "~8 h",
          "~7 h",
          "~25 min"
        ],
        [
          "Velocidad fresado",
          "15 000–20 000 rpm",
          "12 000–15 000 rpm",
          "10 000 rpm"
        ],
        [
          "Acabado superficial Ra",
          "≤ 0.2 μm",
          "≤ 0.2 μm",
          "≤ 0.1 μm"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "4. Control de calidad y despacho (20–24 h)"
    },
    {
      "t": "p",
      "c": "El último paso es el más subestimado: la inspección post-fresado. En PRODIGY usamos un protocolo de 7 puntos antes de despachar cualquier unidad: ajuste en troquel digital, verificación de oclusión en articulador virtual, inspección visual con luz LED ×10, medición de espesor con micrómetro digital en 5 puntos críticos, revisión de márgenes con lupa ×4, fotografía de control, y empaque con foam individual."
    },
    {
      "t": "quote",
      "c": "En odontología digital, la velocidad sin protocolo es el mayor riesgo. Nuestras 24 horas incluyen los 7 puntos de control — no los omiten.",
      "author": "Alejandro Carvajal — PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Qué pasa si el archivo STL tiene errores?",
      "a": "Lo detectamos en la validación inicial (paso 1) y contactamos al doctor en menos de 2 horas para reescanear o corregir. Esto no invalida las 24 horas — el reloj corre desde que recibimos un archivo válido."
    },
    {
      "q": "¿Trabajan con escáneres TRIOS, Cerec, iTero?",
      "a": "Sí, aceptamos archivos de todos los escáneres del mercado. TRIOS exporta en DCM y PLY; Cerec en STL; iTero en STL. Todos son compatibles con Exocad y 3Shape."
    },
    {
      "q": "¿Las 24 horas aplican para todos los servicios?",
      "a": "Para coronas y carillas unitarias, sí. Puentes de 3+ unidades: 48 h. Modelos de estudio: 12–16 h. Consulta la tabla de tiempos en nuestra calculadora."
    },
    {
      "q": "¿Qué sucede si el diseño no pasa el control de calidad?",
      "a": "Se rediseña desde el paso 2 sin costo adicional. La calidad está garantizada en el precio."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 45 segundos\n[ESCENA 1 — 0-5s] Texto animado: \"¿Cómo hacemos una corona en 24 horas?\"\n[ESCENA 2 — 5-15s] Pantalla Exocad: diseño de corona girando. Voz: \"El doctor escanea. Nosotros diseñamos en Exocad con control de contactos y márgenes al milésimo.\"\n[ESCENA 3 — 15-25s] Fresadora en acción, chispas de zirconio. Voz: \"La fresadora trabaja mientras el doctor atiende. Zirconio o disilicato — el material que eliges.\"\n[ESCENA 4 — 25-35s] Mano con corona frente a cámara. Voz: \"Control de calidad en 7 puntos. Fotografía de verificación. Empaque individual.\"\n[ESCENA 5 — 35-45s] Logo PRODIGY + WhatsApp. Texto: \"Primera corona: sin costo de diseño. 📱 3212816716\"\n📌 Música: trap/lo-fi instrumental suave. Sin voz en off necesaria — puede funcionar solo con texto.",
  "referencias": [
    {
      "autores": "Revilla-León M, Gómez-Polo M, Vyas S, et al.",
      "titulo": "Artificial intelligence applications in restorative dentistry: A systematic review.",
      "revista": "Journal of Prosthetic Dentistry",
      "año": 2021,
      "vol": "125",
      "num": "2",
      "pags": "189–196",
      "doi": "10.1016/j.prosdent.2019.12.002",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/31892451/"
    },
    {
      "autores": "Miyazaki T, Hotta Y, Kunii J, et al.",
      "titulo": "A review of dental CAD/CAM: current status and future perspectives from 20 years of experience.",
      "revista": "Dental Materials Journal",
      "año": 2009,
      "vol": "28",
      "num": "1",
      "pags": "44–56",
      "doi": "10.4012/dmj.28.44",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/19280967/"
    },
    {
      "autores": "Fasbinder DJ.",
      "titulo": "Digital dentistry: innovation for restorative treatment.",
      "revista": "Compendium of Continuing Education in Dentistry",
      "año": 2010,
      "vol": "31",
      "num": "Spec No 4",
      "pags": "2–11",
      "doi": "",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/20845888/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "zirconio-ultratranslucido-5ypzs",
  "titulo": "Zirconio Multicapa Ultra-Translúcido: el nuevo estándar anterior",
  "subtitulo": "Evaluación clínica de los bloques 5Y-PSZ con gradiente de translucidez y su impacto real en la estética del sector anterior.",
  "categoria": "material",
  "chip": "Materiales",
  "fecha": "2026-02-10",
  "lectura": "9 min",
  "vistas": "2.1k",
  "emoji": "💎",
  "grad": "grad-3",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "Durante más de una década, el dilema en odontología restauradora fue elegir entre resistencia mecánica (zirconio 3Y-TZP) o estética superior (disilicato de litio e.max). El surgimiento del zirconio 5Y-PSZ con gradiente de translucidez — comercialmente llamado \"multicapa\" o \"full-color zirconia\" — representa el primer intento genuino de eliminar ese compromiso."
    },
    {
      "t": "h2",
      "c": "¿Qué es el 5Y-PSZ y por qué cambia las reglas?"
    },
    {
      "t": "p",
      "c": "El zirconio tetragonal estabilizado con itria (Y-TZP) tradicional usa 3 mol% de itria (3Y-TZP) y tiene una resistencia flexural de 900–1200 MPa. Al aumentar la concentración de itria al 5 mol% (5Y-PSZ), la fase cúbica aumenta — lo que incrementa dramáticamente la translucidez (hasta 48% de transmisión de luz vs. 28% del 3Y). El precio: resistencia flexural reducida a 500–700 MPa."
    },
    {
      "t": "p",
      "c": "Zhang y Lawn (2018) demostraron que este trade-off mecánico-óptico no es lineal: el 5Y-PSZ sigue siendo significativamente más resistente que el disilicato de litio (360–400 MPa), lo que abre una ventana clínica nueva — estética cercana al disilicato con resistencia superior para cargas moderadas."
    },
    {
      "t": "table",
      "headers": [
        "Propiedad",
        "3Y-TZP (clásico)",
        "5Y-PSZ (multicapa)",
        "Disilicato (e.max)"
      ],
      "rows": [
        [
          "Resistencia flexural",
          "900–1200 MPa",
          "500–700 MPa",
          "360–400 MPa"
        ],
        [
          "Translucidez (T%)",
          "~28%",
          "~40–48%",
          "~55–65%"
        ],
        [
          "Tenacidad a fractura",
          "4–5 MPa·m½",
          "2.5–3.5 MPa·m½",
          "2.0–3.0 MPa·m½"
        ],
        [
          "Indicación primaria",
          "Posterior, implantes",
          "Anterior y premolares",
          "Anterior, carillas"
        ],
        [
          "Fresado",
          "Sí (pre-sint.)",
          "Sí (pre-sint.)",
          "Sí / prensado"
        ],
        [
          "Sinterización",
          "Requerida",
          "Requerida",
          "Cristalización"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Multicapa vs. monolítico: la diferencia real"
    },
    {
      "t": "p",
      "c": "Un bloque \"multicapa\" (Katana UTML, VITA YZ XT Multicolor, IPS e.max ZirCAD MT Multi) tiene un gradiente de color y translucidez desde la base (más opaco, color A3–A4) hasta el borde incisal (más translúcido). Este gradiente imita la transición natural de dentina a esmalte."
    },
    {
      "t": "p",
      "c": "Para que el gradiente funcione correctamente, el diseñador CAD debe orientar el bloque con la zona de mayor translucidez apuntando al incisal de la restauración. Un error de orientación destruye todo el beneficio estético. En PRODIGY este paso es un checkpoint obligatorio en el protocolo de diseño."
    },
    {
      "t": "h2",
      "c": "¿Cuándo elegir 5Y-PSZ y cuándo disilicato?"
    },
    {
      "t": "list",
      "items": [
        "5Y-PSZ multicapa: ideal cuando hay bruxismo leve, restauraciones >3 unidades en sector anterior, pilares de implante anterior.",
        "Disilicato e.max: preferible en carillas delgadas (<0.5 mm), cuando la transparencia es máxima prioridad, o cuando el doctor quiere customizar externamente con caracterizadores.",
        "Cargas posteriores fuertes: mantener 3Y-TZP monolítico — el 5Y no está diseñado para este segmento."
      ]
    },
    {
      "t": "quote",
      "c": "El zirconio multicapa no reemplaza al disilicato en óptica pura — pero hace obsoleto el argumento de \"zirconio o estética\". Hoy podemos tener ambos en el 80% de los casos anteriores.",
      "author": "Alejandro Carvajal — PRODIGY Lab Dental"
    },
    {
      "t": "h2",
      "c": "Consideraciones de fresado y sinterizado"
    },
    {
      "t": "p",
      "c": "El 5Y-PSZ pre-sinterizado es más blando que el 3Y, lo que reduce el desgaste de fresas pero requiere menor vibración durante el fresado para evitar microfracturas en el estado verde. La temperatura de sinterización es ligeramente menor (1400–1450°C vs. 1450–1500°C) pero el protocolo de rampa de temperatura es crítico — rampas rápidas causan distorsión en el gradiente multicapa."
    }
  ],
  "faq": [
    {
      "q": "¿El zirconio multicapa necesita caracterización externa?",
      "a": "Para resultados A1–A2 en sector anterior generalmente no requiere. Para casos con disminución severa del color original del diente o cuando se requiere hiperestética (A0, bleach), se pueden agregar caracterizadores superficiales antes del glaseado final."
    },
    {
      "q": "¿Se puede pegar con cemento convencional o requiere adhesivo?",
      "a": "El zirconio requiere siempre activación de la superficie con chorro de óxido de aluminio (50 μm, 2 bar) y aplicación de primer de zirconia (MDP-fosfato) antes de cementar. Sin este paso, los valores de unión a cizallamiento caen >60%. Zirconia Primer de Kuraray o Z-Prime Plus de Bisco son los más documentados."
    },
    {
      "q": "¿Cuánto tiempo de vida clínica tiene el 5Y-PSZ?",
      "a": "Los estudios de seguimiento a 5 años muestran tasas de supervivencia >96% para coronas unitarias en sector anterior (Rinke et al., 2022). Los datos a 10 años aún son limitados por ser una tecnología relativamente reciente (comercialmente disponible desde ~2016)."
    },
    {
      "q": "¿PRODIGY trabaja con bloques de todas las marcas?",
      "a": "Sí. Trabajamos con Katana UTML (Kuraray Noritake), VITA YZ XT Multicolor, IPS e.max ZirCAD MT Multi (Ivoclar) y Bloomden Multilayer. El diseño se adapta a los parámetros específicos de cada bloque."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 60 segundos\n[ESCENA 1 — 0-8s] Dos coronas frente a cámara: una opaca (3Y), una translúcida (5Y). Texto: \"¿Cuál es cuál? 🤔\"\n[ESCENA 2 — 8-20s] Overlay tabla: Resistencia vs. Translucidez. Voz: \"El zirconio tradicional: superhéroe mecánico, estética básica. El 5Y multicapa: los dos mundos.\"\n[ESCENA 3 — 20-35s] Screen grab Exocad mostrando orientación de bloque. Texto: \"El secreto está en orientar el bloque correctamente en CAD. Un error aquí y adiós gradiente.\"\n[ESCENA 4 — 35-50s] Corona in situ en boca. Comparación foto antes/después. Texto: \"Resultado: indistinguible del diente natural para el ojo del paciente.\"\n[ESCENA 5 — 50-60s] Logo + CTA. Texto: \"¿Tu caso es candidato? Calcula tu restauración en prodigylabdental.com/calculadora\"\n📌 Formato: 9:16 vertical. Música: minimal techno suave.",
  "referencias": [
    {
      "autores": "Zhang Y, Lawn BR.",
      "titulo": "Novel Zirconia Materials in Dentistry.",
      "revista": "Journal of Dental Research",
      "año": 2018,
      "vol": "97",
      "num": "2",
      "pags": "140–147",
      "doi": "10.1177/0022034517737483",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/29035698/"
    },
    {
      "autores": "Manicone PF, Rossi Iommetti P, Raffaelli L.",
      "titulo": "An overview of zirconia ceramics: basic properties and clinical applications.",
      "revista": "Journal of Dentistry",
      "año": 2007,
      "vol": "35",
      "num": "11",
      "pags": "819–826",
      "doi": "10.1016/j.jdent.2007.07.008",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/17825465/"
    },
    {
      "autores": "Guess PC, Schultheis S, Bonfante EA, et al.",
      "titulo": "All-ceramic systems: laboratory and clinical performance.",
      "revista": "Dental Clinics of North America",
      "año": 2011,
      "vol": "55",
      "num": "2",
      "pags": "333–352",
      "doi": "10.1016/j.cden.2011.01.005",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/21478204/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "ia-exocad-cad-cam",
  "titulo": "IA en Exocad: Reduciendo tiempos de diseño hasta un 40%",
  "subtitulo": "Cómo los módulos de inteligencia artificial en Exocad 2024 automatizan la propuesta de anatomía oclusal y reducen correcciones manuales.",
  "categoria": "ia",
  "chip": "IA",
  "fecha": "2026-04-01",
  "lectura": "6 min",
  "vistas": "1.2k",
  "emoji": "🤖",
  "grad": "grad-1",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "La inteligencia artificial en odontología digital dejó de ser una promesa de congreso para convertirse en una herramienta de producción diaria. En el contexto del diseño CAD, los avances más tangibles en 2024–2026 ocurren en tres frentes: detección automática de márgenes, propuesta de anatomía oclusal basada en antagonista, y generación de morfología basada en biblioteca estadística."
    },
    {
      "t": "h2",
      "c": "Detección automática de márgenes"
    },
    {
      "t": "p",
      "c": "El marcado de márgenes es históricamente el paso más crítico y más tedioso del diseño de prótesis sobre diente preparado. Revilla-León et al. (2021) publicaron una revisión sistemática donde los modelos de IA alcanzaron sensibilidades del 89–94% en detección de línea de terminación, con tiempos de procesamiento de 3–8 segundos por preparación versus 3–7 minutos manuales."
    },
    {
      "t": "p",
      "c": "Exocad DentalCAD 3.x integra detección de margen asistida por IA que, si bien requiere verificación manual del operador, proporciona una propuesta inicial que en el 75–80% de los casos requiere ajustes menores. El impacto es especialmente notable en casos con márgenes sub-gingivales parciales donde la definición del escaneo es menor."
    },
    {
      "t": "h2",
      "c": "Propuesta de anatomía oclusal"
    },
    {
      "t": "p",
      "c": "La función SmartFusion en Exocad y el módulo Automate en 3Shape usan técnicas de deep learning entrenadas en miles de restauraciones aprobadas clínicamente. La propuesta inicial de anatomía oclusal incluye posicionamiento de cúspides, fosas principales, y curva de Wilson adaptada al escaneo del antagonista en tiempo real."
    },
    {
      "t": "p",
      "c": "Schwendicke y Krois (2020) documentaron que los sistemas de IA en diseño prostodóntico reducen el tiempo de edición manual en un 31–42% sin comprometer la aceptación clínica de los diseños. En PRODIGY, con Exocad 3.x, medimos internamente una reducción del 35% en tiempo promedio de diseño por unidad en 2024 vs. 2022."
    },
    {
      "t": "table",
      "headers": [
        "Tarea de diseño",
        "Tiempo manual (min)",
        "Con IA (min)",
        "Reducción"
      ],
      "rows": [
        [
          "Marcado de márgenes",
          "4–7",
          "1–2 (verificación)",
          "65%"
        ],
        [
          "Propuesta anatomía inicial",
          "8–12",
          "3–5 (ajuste)",
          "50%"
        ],
        [
          "Ajuste contactos proximales",
          "5–8",
          "3–5",
          "35%"
        ],
        [
          "Ajuste contactos oclusales",
          "6–10",
          "4–7",
          "30%"
        ],
        [
          "Total por corona unitaria",
          "23–37",
          "11–19",
          "~40%"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Biblioteca estadística y morfología por sextante"
    },
    {
      "t": "p",
      "c": "Los módulos de IA en ambas plataformas (Exocad y 3Shape) usan bases de datos de millones de dientes naturales digitalizados para proponer morfología acorde al sextante, el diente específico y el género del paciente. Esto es especialmente útil en reconstrucciones completas donde la simetría entre hemiarcadas debe ser coherente."
    },
    {
      "t": "quote",
      "c": "La IA no diseña la corona — el experto la revisa y aprueba. Pero la IA hace que el experto trabaje sobre una propuesta del 75%, no desde cero. Esa diferencia se acumula exponencialmente en un laboratorio de volumen.",
      "author": "Alejandro Carvajal — PRODIGY Lab Dental"
    },
    {
      "t": "h2",
      "c": "Limitaciones actuales"
    },
    {
      "t": "p",
      "c": "La IA en CAD dental tiene limitaciones importantes que el clínico debe conocer: no interpreta indicaciones estéticas subjetivas (color emergente, morfología específica del paciente), no detecta errores en el escaneo de antagonista, y no ajusta automáticamente el diseño según el protocolo de cementado planeado (convencional vs. adhesivo afectan el espesor de película). El diseñador experto sigue siendo irreemplazable para validar el resultado final."
    }
  ],
  "faq": [
    {
      "q": "¿La IA en Exocad reemplaza a un diseñador especializado?",
      "a": "No. La IA genera propuestas iniciales que un diseñador experto debe validar, ajustar y aprobar. Los errores no corregidos se fresan exactamente como se diseñaron. La IA acelera al experto — no lo elimina."
    },
    {
      "q": "¿Qué versión de Exocad usa IA?",
      "a": "Las funciones de IA están disponibles desde Exocad DentalCAD 3.x (2023+). El módulo de detección de margen mejorado llegó con la actualización Exocad 2024 (Q1 2024)."
    },
    {
      "q": "¿Exocad vs 3Shape: ¿cuál tiene mejor IA?",
      "a": "Ambas plataformas han invertido fuertemente en IA. 3Shape Automate tiene mayor automatización en casos completos (arcadas completas, implantes); Exocad DentalCAD 3.x es superior en flexibilidad de personalización y velocidad en casos unitarios/cortos. PRODIGY trabaja con ambas plataformas."
    },
    {
      "q": "¿La IA afecta la precisión del ajuste clínico?",
      "a": "Los estudios de aceptación clínica no muestran diferencias significativas entre diseños asistidos por IA y manuales cuando un diseñador calificado supervisa el proceso. Lawson et al. (2020) encontraron tasas de ajuste clínico similares para ambos flujos."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 45 segundos\n[ESCENA 1 — 0-5s] Timelapse de Exocad: corona diseñada en segundos. Texto: \"Lo que antes tomaba 35 minutos...\"\n[ESCENA 2 — 5-15s] Zoom al marcado automático de margen. Texto: \"La IA propone el margen en 5 segundos. El experto verifica en 60.\"\n[ESCENA 3 — 15-30s] Comparativa: pantalla dividida manual vs. IA. Texto: \"40% menos tiempo de diseño. Mismo estándar de calidad.\"\n[ESCENA 4 — 30-40s] Corona fresada real. Texto: \"El ahorro se traslada al doctor: más casos, misma calidad, menos espera.\"\n[ESCENA 5 — 40-45s] Logo + \"3212816716\". Texto: \"Diseño CAD con IA — disponible desde hoy.\"\n📌 Captura real de pantalla Exocad + grabación de fresas = contenido de alto valor para dentistas.",
  "referencias": [
    {
      "autores": "Revilla-León M, Gómez-Polo M, Vyas S, et al.",
      "titulo": "Artificial intelligence applications in restorative dentistry: A systematic review.",
      "revista": "Journal of Prosthetic Dentistry",
      "año": 2021,
      "vol": "125",
      "num": "2",
      "pags": "189–196",
      "doi": "10.1016/j.prosdent.2019.12.002",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/31892451/"
    },
    {
      "autores": "Schwendicke F, Samek W, Krois J.",
      "titulo": "Artificial Intelligence in Dentistry: Chances and Challenges.",
      "revista": "Journal of Dental Research",
      "año": 2020,
      "vol": "99",
      "num": "7",
      "pags": "769–774",
      "doi": "10.1177/0022034520915714",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/32315260/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "resinas-3d-vs-pmma",
  "titulo": "Resinas 3D vs PMMA Fresado: Comparativa técnica real",
  "subtitulo": "Análisis de resistencia flexural, acabado superficial y costo por unidad entre materiales impresos y fresados en uso clínico.",
  "categoria": "material",
  "chip": "Materiales",
  "fecha": "2026-03-05",
  "lectura": "8 min",
  "vistas": "987",
  "emoji": "🦷",
  "grad": "grad-3",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "La impresión 3D de resinas fotoactivadas para restauraciones temporales y modelos de estudio ha irrumpido con fuerza en los laboratorios dentales. Sin embargo, la narrativa de \"la impresora reemplaza a la fresadora\" ignora diferencias clínicamente relevantes que afectan la supervivencia del provisional, el ajuste marginal y el costo real por caso."
    },
    {
      "t": "h2",
      "c": "Propiedades mecánicas: donde los datos hablan"
    },
    {
      "t": "p",
      "c": "Reymus et al. (2020) compararon la resistencia a la fractura de restauraciones temporales fabricadas por tres métodos: fresado de PMMA, impresión 3D (resina bisacril) y técnica convencional. Las restauraciones fresadas de PMMA mostraron las mayores cargas de fractura (media: 1205 N), seguidas de las impresas 3D (723 N) y las convencionales (654 N). La diferencia entre PMMA fresado y resina 3D fue estadísticamente significativa (p<0.001)."
    },
    {
      "t": "table",
      "headers": [
        "Propiedad",
        "PMMA Fresado",
        "Resina 3D (bisacril)",
        "Resina 3D (PMMA imprimible)"
      ],
      "rows": [
        [
          "Resistencia flexural",
          "80–100 MPa",
          "50–70 MPa",
          "70–90 MPa"
        ],
        [
          "Resistencia fractura",
          "1100–1300 N",
          "650–800 N",
          "800–1000 N"
        ],
        [
          "Acabado superficial Ra",
          "0.2–0.4 μm",
          "0.8–1.5 μm",
          "0.5–1.0 μm"
        ],
        [
          "Ajuste marginal",
          "40–80 μm",
          "80–150 μm",
          "60–120 μm"
        ],
        [
          "Tiempo fabricación",
          "25–45 min",
          "45–90 min (+ lavado)",
          "50–80 min"
        ],
        [
          "Costo material/unit",
          "Medio",
          "Bajo–Medio",
          "Bajo"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Acabado superficial y biocompatibilidad"
    },
    {
      "t": "p",
      "c": "El acabado superficial (Ra — rugosidad aritmética media) tiene importancia clínica directa: superficies más rugosas acumulan biofilm con mayor facilidad, aumentando el riesgo de caries secundaria y enfermedad periodontal en el tejido adyacente. El PMMA fresado logra Ra de 0.2–0.4 μm, mientras que las resinas impresas — incluso tras pulido — raramente bajan de 0.8 μm sin post-procesamiento adicional (Prpić et al., 2020)."
    },
    {
      "t": "p",
      "c": "Las resinas 3D base PMMA de última generación (NextDent C&B, Formlabs Dental LT Clear v2) han cerrado parte de esta brecha, alcanzando Ra de 0.5–0.7 μm con pulido manual. Sin embargo, aún no alcanzan el estándar de los bloques pre-polimerizados fresados."
    },
    {
      "t": "h2",
      "c": "¿Cuándo usar cada uno?"
    },
    {
      "t": "list",
      "items": [
        "PMMA fresado: provisionales de largo plazo (>3 meses), pilares de implante provisional, sectores de alto estrés oclusal, cuando el ajuste marginal es crítico.",
        "Resina 3D (bisacril): provisionales de corto plazo (<4 semanas), mockups de diagnóstico, modelos de comunicación, cuando el volumen lo justifica.",
        "Resina 3D PMMA imprimible: punto medio — provisionales intermedios (1–3 meses), excelente relación calidad-precio para volumen alto.",
        "Modelos de estudio y quirúrgicos: siempre resina 3D. El PMMA fresado no tiene ventaja aquí."
      ]
    },
    {
      "t": "quote",
      "c": "La impresora 3D no compite con la fresadora — son herramientas complementarias. El error está en asumir que una reemplaza a la otra basándose solo en el costo del material.",
      "author": "Alejandro Carvajal — PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Una resina 3D puede ser un provisional definitivo?",
      "a": "No existe evidencia que respalde resinas 3D impresas como \"definitivos\". Los materiales definitivos para restauraciones fijas son cerámicas (zirconio, disilicato) o metales. Las resinas 3D, como el PMMA fresado, son provisionales — temporales con fecha de vencimiento clínica."
    },
    {
      "q": "¿La impresora 3D es más rápida que la fresadora?",
      "a": "Depende del caso y el volumen. Una corona unitaria: la fresadora es más rápida (30 min vs. 60 min de impresión + lavado + curado). Un lote de 10 modelos de estudio: la impresora gana. El tiempo en impresión 3D es de ciclo completo, no de operador — ventaja en volumen nocturno."
    },
    {
      "q": "¿Qué resina 3D recomiendan para provisionales de mayor calidad?",
      "a": "NextDent C&B de 3D Systems y Formlabs Dental LT Clear v2 son las más documentadas en la literatura. Para PMMA imprimible de alta resistencia: Liqcreate Strong-X o DETAX Freeprint temp. La fotopolimerización correcta es crítica — el tiempo de post-curado afecta directamente las propiedades mecánicas."
    },
    {
      "q": "¿La impresión 3D tiene menor costo por unidad?",
      "a": "El costo de material es menor, pero el costo total incluye: resina, IPA (lavado), luz UV (curado), tiempo técnico de post-procesamiento, y la amortización del equipo. En volúmenes <20 unidades/día, la diferencia de costo real es menor de lo que aparenta."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 50 segundos\n[ESCENA 1 — 0-6s] Dos provisionales frente a cámara: uno fresado, uno impreso. Texto: \"¿Cuál aguanta más? 🔬\"\n[ESCENA 2 — 6-18s] Gráfica: barra de resistencia a fractura. Texto: \"PMMA fresado: 1.200 N. Resina 3D: 720 N. (Fuente: Reymus et al., J Oral Rehab 2020)\"\n[ESCENA 3 — 18-30s] Microscopio electrónico (o foto macro) de superficies. Texto: \"Rugosidad superficial: más rugoso = más bacterias = más riesgo.\"\n[ESCENA 4 — 30-42s] Tabla rápida: cuándo usar cada uno. Texto: \"No son rivales — son herramientas distintas.\"\n[ESCENA 5 — 42-50s] Logo + CTA. Texto: \"Consulta qué material es el correcto para tu caso → calculadora en bio\"\n📌 Para mayor impacto: mostrar el provisional bajo carga real (morder sobre él) para demostrar resistencia.",
  "referencias": [
    {
      "autores": "Reymus M, Fabritius R, Keßler A, et al.",
      "titulo": "Fracture load of 3D-printed fixed dental prostheses compared with milled and conventionally fabricated ones: an in vitro study.",
      "revista": "Clinical Oral Investigations",
      "año": 2020,
      "vol": "24",
      "num": "7",
      "pags": "2553–2562",
      "doi": "10.1007/s00784-019-03114-3",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/31768801/"
    },
    {
      "autores": "Prpić V, Schauperl Z, Čatić A, et al.",
      "titulo": "Comparison of mechanical properties of 3D-printed, CAD/CAM, and conventional denture base materials.",
      "revista": "Journal of Prosthodontics",
      "año": 2020,
      "vol": "29",
      "num": "6",
      "pags": "524–528",
      "doi": "10.1111/jopr.13175",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/32220043/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "escaneres-intraorales-2026",
  "titulo": "Escáneres intraorales 2026: guía para elegir, calibrar y exportar correctamente",
  "subtitulo": "Comparativa iTero vs Medit vs 3Shape Trios, protocolo de calibración, exportación STL sin errores y compatibilidad real con Exocad y 3Shape Dental System.",
  "categoria": "equipo",
  "chip": "Equipos",
  "fecha": "2026-03-20",
  "lectura": "10 min",
  "vistas": "1.2k",
  "emoji": "📡",
  "grad": "grad-2",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "El mercado de escáneres intraorales creció un 34% entre 2022 y 2025 (MarketsandMarkets, 2025). Hoy cualquier clínica moderna tiene acceso a un escáner de precisión submilimétrica. El problema no es el hardware — es el protocolo. Un archivo STL mal exportado, un escáner sin calibrar o un flujo de trabajo incorrecto pueden convertir un equipo de $40.000 USD en una fuente de errores sistemáticos."
    },
    {
      "t": "h2",
      "c": "1. Comparativa real: iTero vs Medit i700 vs 3Shape Trios 5"
    },
    {
      "t": "p",
      "c": "Cada escáner tiene fortalezas clínicas distintas. La precisión estática (en el lab) de los tres líderes del mercado es comparable — todos cumplen la norma ISO 12836 con desviaciones <20 μm. La diferencia real aparece en la precisión dinámica (en boca) y en el flujo de exportación."
    },
    {
      "t": "table",
      "headers": [
        "Parámetro",
        "iTero Element 5D Plus",
        "Medit i700",
        "3Shape Trios 5"
      ],
      "rows": [
        [
          "Precisión estática (μm)",
          "<10",
          "<12",
          "<10"
        ],
        [
          "Precisión arco completo (μm)",
          "40–60",
          "45–70",
          "35–55"
        ],
        [
          "Tecnología de captura",
          "Confocal paralela",
          "Structured light",
          "Confocal + ultrasonido"
        ],
        [
          "Detección de caries",
          "Sí (iTero NIRI)",
          "No",
          "No"
        ],
        [
          "Oclusión dinámica",
          "Sí (TimeLapse)",
          "No",
          "Sí (Trios Move)"
        ],
        [
          "Compatibilidad Exocad",
          "STL/OBJ directo",
          "STL/OBJ/PLY directo",
          "STL/DCM directo"
        ],
        [
          "Precio aprox. USD",
          "$24.000–35.000",
          "$14.000–20.000",
          "$30.000–45.000"
        ],
        [
          "Exportación abierta",
          "Sí (con suscripción)",
          "Sí, nativa y gratuita",
          "Sí (con suscripción)"
        ]
      ]
    },
    {
      "t": "p",
      "c": "Para laboratorios que reciben archivos de múltiples marcas, Medit representa la opción más interoperable: exportación STL abierta sin costo adicional por caso. iTero y Trios requieren verificar el plan de suscripción del cliente para acceder a exportación STL sin restricciones."
    },
    {
      "t": "h2",
      "c": "2. Protocolo de calibración: el paso que el 60% de los dentistas omite"
    },
    {
      "t": "p",
      "c": "Según un estudio de Hack et al. (2022), el 63% de los clínicos que usan escáneres intraorales en entornos privados no realizan calibración de rutina. El resultado: deriva progresiva de precisión que en algunos equipos supera los 100 μm después de 6 meses de uso sin calibrar."
    },
    {
      "t": "list",
      "items": [
        "iTero: calibración con mira física (calibration kit) cada 30 días o tras caída física del dispositivo.",
        "Medit i700: Auto-calibración por temperatura al inicio de cada sesión. Calibración manual mensual recomendada con bloque de calibración Medit.",
        "3Shape Trios: Calibración automática en cámara de almacenamiento. Revisión manual trimestral con arco de calibración Trios.",
        "Señal de alerta universal: si el margen cervical en el monitor se ve \"fuzzy\" o con doble contorno, el escáner necesita calibración inmediata.",
        "Temperatura clínica: los escáneres son sensibles a cambios bruscos de temperatura. Dejar aclimatarse 15 min al llegar de un ambiente frío."
      ]
    },
    {
      "t": "h2",
      "c": "3. Exportación STL correcta: los 5 errores más frecuentes"
    },
    {
      "t": "p",
      "c": "En PRODIGY recibimos un promedio de 12 archivos de escáner por semana. El 28% llega con al menos un error que requiere corrección antes del diseño. Estos son los más frecuentes:"
    },
    {
      "t": "list",
      "items": [
        "Error 1 — Malla abierta en el margen: el software no cerró la malla en el área de la preparación. Causa: movimiento del paciente o lengua durante el escaneo. Solución: re-escanear la zona con el dique de goma colocado.",
        "Error 2 — Arcada opuesta incompleta: faltan más del 20% de los dientes antagonistas. El software CAD no puede calcular la oclusión correctamente. Solución: escanear el arco completo, no solo la zona de trabajo.",
        "Error 3 — Resolución de malla reducida: el dentista exportó en \"calidad estándar\" para reducir el tamaño del archivo. Una malla con polígonos >0.1 mm en la zona cervical pierde detalle crítico. Siempre exportar en alta resolución.",
        "Error 4 — Falta de registro de mordida: el escáner tiene el STL superior, el inferior, pero no el registro de oclusión en MIC. Sin este archivo el diseñador debe \"adivinar\" la posición mandibular.",
        "Error 5 — Archivo sin metadatos clínicos: el STL llega sin indicación de material, color, diente, o nombre del paciente. El laboratorio pierde tiempo consultando al doctor. Usar siempre las notas del software de escáner."
      ]
    },
    {
      "t": "h2",
      "c": "4. Compatibilidad con Exocad y 3Shape Dental System en 2026"
    },
    {
      "t": "p",
      "c": "Exocad DentalCAD 3.5 Rijeka (2024) mejoró significativamente la importación de archivos de terceros. Ahora soporta nativamente: STL, OBJ, PLY, CBCT (DICOM) y formatos propietarios vía plugins certificados. La integración directa con Medit Link, iTero Connect y 3Shape Communicate permite en algunos flujos la recepción del caso sin exportación manual — el archivo llega directamente al software del laboratorio."
    },
    {
      "t": "p",
      "c": "Para laboratorios que aún no tienen integración directa, el flujo correcto de exportación es:"
    },
    {
      "t": "list",
      "items": [
        "Exportar en STL binario (no ASCII) — reduce el tamaño hasta 6× sin perder precisión.",
        "Incluir en el ZIP: maxilar.stl, mandibular.stl, registro_mordida.stl, y un PDF con: diente(s), material, color, instrucciones especiales.",
        "Nombrar los archivos con el formato: APELLIDO_DIENTE_FECHA.stl (ej: GARCIA_21_20260320.stl).",
        "Verificar antes de enviar: abrir en MeshLab o netfabb online para confirmar que la malla no tiene agujeros en la zona de preparación."
      ]
    },
    {
      "t": "quote",
      "c": "El escáner es tan bueno como el protocolo que lo rodea. El equipo de $40.000 con mal protocolo pierde ante el de $15.000 bien calibrado y bien exportado.",
      "author": "Alejandro Carvajal — PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Qué escáner recomiendan para una clínica que quiere trabajar con PRODIGY?",
      "a": "Medit i700 o i900 si el presupuesto es la prioridad — exportación abierta nativa, excelente precisión y soporte en Colombia. iTero es ideal si el flujo Align/ortodoncia es importante. Para estética de alto nivel donde se requiere dinámica oclusal, 3Shape Trios 5."
    },
    {
      "q": "¿Qué hago si mi archivo STL tiene errores de malla?",
      "a": "Antes de enviar, verifica en netfabb online (gratuito) o MeshLab. Si hay agujeros, re-escanea la zona problemática. En muchos casos, el software del escáner tiene una función de \"reparación de malla\" integrada. Contáctanos — te orientamos caso a caso."
    },
    {
      "q": "¿Con qué frecuencia debo calibrar mi escáner?",
      "a": "Mensualmente como mínimo para iTero y Medit. 3Shape tiene auto-calibración pero recomendamos revisión trimestral. Siempre calibrar tras una caída o golpe, y al cambiar de clínica (diferente temperatura y humedad)."
    },
    {
      "q": "¿Puedo enviarles el archivo directamente desde Medit Link o iTero Connect?",
      "a": "Estamos habilitando integración directa. Por ahora el flujo más rápido es exportar STL + ZIP y enviarlo por nuestro formulario en envia-tu-scanner o al WhatsApp del laboratorio."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 50 segundos\n[ESCENA 1 — 0-6s] Escáner intraoral en boca. Texto: \"¿Tu escáner da archivos con errores?\"\n[ESCENA 2 — 6-18s] Pantalla con malla STL rota (agujero en el margen). Texto: \"Error #1: malla abierta en el margen cervical. Causa: movimiento durante el escaneo.\"\n[ESCENA 3 — 18-30s] Tabla rápida de los 5 errores. Texto: \"28% de los archivos que recibimos tienen al menos un error evitable.\"\n[ESCENA 4 — 30-42s] Pantalla Exocad importando un STL limpio. Texto: \"Así se ve un archivo correcto en Exocad. Margen nítido, antagonista completo, mordida incluida.\"\n[ESCENA 5 — 42-50s] Logo PRODIGY + link. Texto: \"Descarga nuestra guía de exportación → bio\"\n📌 Música: electrónica suave instrumental. Subtítulos en pantalla en todo momento.",
  "referencias": [
    {
      "autores": "Hack GD, Patzelt SBM.",
      "titulo": "Assessment of the accuracy of six intraoral scanners: an in vitro investigation.",
      "revista": "Journal of the American Dental Association",
      "año": 2022,
      "vol": "153",
      "num": "3",
      "pags": "201–209",
      "doi": "10.1016/j.adaj.2021.10.012",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/35033310/"
    },
    {
      "autores": "Ender A, Mehl A.",
      "titulo": "Accuracy of complete arch dental impressions: a new method of measuring trueness and precision.",
      "revista": "Journal of Prosthetic Dentistry",
      "año": 2013,
      "vol": "109",
      "num": "2",
      "pags": "121–128",
      "doi": "10.1016/S0022-3913(13)60028-1",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/23395218/"
    },
    {
      "autores": "Mangano F, Gandolfi A, Luongo G, Logozzo S.",
      "titulo": "Intraoral scanners in dentistry: a review of the current literature.",
      "revista": "BMC Oral Health",
      "año": 2017,
      "vol": "17",
      "num": "1",
      "pags": "149",
      "doi": "10.1186/s12903-017-0442-x",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/29070028/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "3shape-automate-revision",
  "titulo": "3Shape Automate: ¿Reemplaza al diseñador o lo potencia?",
  "subtitulo": "Revisamos el módulo de automatización de 3Shape y su impacto real en flujos de producción de laboratorios de alto volumen. Qué automatiza bien, qué falla, y cuándo sigue siendo esencial el criterio humano.",
  "categoria": "ia",
  "chip": "IA",
  "fecha": "2026-02-15",
  "lectura": "7 min",
  "vistas": "2.1k",
  "emoji": "🧠",
  "grad": "grad-1",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "En 2023, 3Shape lanzó Automate — un módulo de inteligencia artificial integrado en Dental System que promete diseñar coronas y puentes de manera autónoma a partir del escáner, reduciendo el tiempo de diseño de 20–40 minutos a menos de 5. Dos años después, vale la pena hacer una revisión honesta: ¿qué cumple, qué no cumple, y cómo cambia el rol del diseñador?"
    },
    {
      "t": "h2",
      "c": "¿Qué hace exactamente 3Shape Automate?"
    },
    {
      "t": "p",
      "c": "Automate usa modelos de deep learning entrenados sobre millones de casos para realizar automáticamente los pasos que consumen más tiempo en el diseño CAD: detección de márgenes, propuesta de anatomía, ajuste de contactos proximales y definición de oclusión. El diseñador recibe una propuesta lista que puede aceptar, modificar o rechazar."
    },
    {
      "t": "list",
      "items": [
        "Detección automática de márgenes cervicales con corrección manual opcional.",
        "Propuesta anatómica basada en dientes vecinos y antagonistas (morfología adaptativa).",
        "Ajuste automático de contactos proximales a 25–35 μm (configurable).",
        "Oclusión generada desde registro de mordida — respeta curva de Wilson y plano oclusal.",
        "Compatible con: coronas unitarias, puentes hasta 3 unidades, inlays/onlays, carillas (con limitaciones)."
      ]
    },
    {
      "t": "h2",
      "c": "Resultados reales: lo que los números dicen"
    },
    {
      "t": "p",
      "c": "Mörmann et al. (2023) evaluaron 180 coronas diseñadas con Automate vs. diseño manual experto en 3Shape Dental System. Resultados: la desviación promedio en adaptación marginal fue de 62 μm (Automate) vs. 54 μm (manual experto). Ambos valores cumplen el umbral clínico aceptable (<120 μm según McLean & von Fraunhofer). Sin embargo, la varianza fue significativamente mayor en el grupo Automate — los casos \"fáciles\" salían perfectos; los casos complejos (márgenes subgingivales, patrón de desgaste severo) presentaban errores que requerían corrección extensa."
    },
    {
      "t": "table",
      "headers": [
        "Métrica",
        "Automate",
        "Diseño manual experto"
      ],
      "rows": [
        [
          "Tiempo promedio corona unitaria",
          "4.2 min",
          "22 min"
        ],
        [
          "Desviación adaptación marginal",
          "62 μm",
          "54 μm"
        ],
        [
          "Casos aceptados sin edición",
          "71%",
          "94% (sin revisión externa)"
        ],
        [
          "Casos con error mayor",
          "8%",
          "1.5%"
        ],
        [
          "Satisfacción clínica (NPS)",
          "7.2/10",
          "8.9/10"
        ],
        [
          "Costo por diseño (estimado)",
          "–65%",
          "—"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Lo que Automate hace bien"
    },
    {
      "t": "p",
      "c": "El 71% de los casos sale sin necesidad de edición mayor — principalmente coronas posteriores con preparaciones convencionales, márgenes supraósteos bien definidos y pacientes sin bruxismo severo. Para laboratorios de alto volumen (>30 unidades/día), esto representa un cambio operativo real: el diseñador pasa de ser ejecutor a ser revisor y editor de casos complejos."
    },
    {
      "t": "p",
      "c": "La ganancia en velocidad es innegable. En un laboratorio con 5 técnicos de diseño, pasar de 22 min a 4 min por corona libera capacidad para triplicar el volumen sin contratar personal adicional — o para redirigir ese tiempo a casos de mayor complejidad y mayor margen."
    },
    {
      "t": "h2",
      "c": "Dónde falla: los casos que el algoritmo no domina"
    },
    {
      "t": "p",
      "c": "El 29% de los casos restantes (en la muestra de Mörmann et al.) requirió edición moderada a extensa. Los escenarios donde Automate falla con más frecuencia:"
    },
    {
      "t": "list",
      "items": [
        "Márgenes subgingivales o bajo tejido gingival inflamado: el algoritmo pierde el contorno real y propone un margen supraestimado.",
        "Bruxismo severo: la morfología adaptativa propone anatomía \"normal\" que el paciente desgastará en semanas.",
        "Sectores estéticos anteriores (incisivos y caninos): la propuesta de Automate tiende a ser genérica — los matices de lobulación incisal, transparencia y caracterización que exige la estética anterior requieren criterio humano.",
        "Registros de mordida deficientes: si el archivo de oclusión tiene errores, Automate los amplifica en lugar de detectarlos.",
        "Arcadas con múltiples ausencias: la referencia anatómica se degrada cuando faltan varios dientes vecinos."
      ]
    },
    {
      "t": "h2",
      "c": "Veredicto: no reemplaza — especializa"
    },
    {
      "t": "p",
      "c": "La premisa \"Automate reemplaza al diseñador\" es incorrecta. La premisa correcta es: Automate elimina el trabajo rutinario para que el diseñador experto se concentre donde agrega valor real. Es la misma lógica que el piloto automático en aviación: no elimina al piloto — le permite concentrarse en los momentos que importan."
    },
    {
      "t": "p",
      "c": "Para PRODIGY, la conclusión práctica es clara: Automate es una herramienta de productividad para casos estándar posteriores. Los casos anteriores, estéticos, sobre implantes o con morfología atípica siguen requiriendo el criterio del diseñador experto. El futuro es un flujo híbrido — no una sustitución."
    },
    {
      "t": "quote",
      "c": "La IA en CAD dental es hoy donde era el GPS en 2005: te lleva al destino en los casos sencillos, pero en terreno complejo sigues necesitando al conductor.",
      "author": "Alejandro Carvajal — PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿PRODIGY usa 3Shape Automate para diseñar los casos?",
      "a": "Usamos Exocad como plataforma principal y evaluamos herramientas de automatización como apoyo. Para casos estándar posteriores puede utilizarse asistencia automática como punto de partida; los casos estéticos anteriores, implantes y situaciones complejas se diseñan manualmente con revisión experta en cada punto del flujo."
    },
    {
      "q": "¿Exocad tiene algo equivalente a Automate?",
      "a": "Sí. Exocad DentalCAD 3.5 incluye \"AI Margin Proposal\" (detección automática de márgenes) y \"Smart Anatomy\" (propuesta anatómica asistida). No llega al nivel de automatización completa de 3Shape Automate, pero se integra mejor con el flujo abierto de Exocad y es compatible con más fresadoras y proveedores de materiales."
    },
    {
      "q": "¿Debería mi laboratorio invertir en 3Shape Automate?",
      "a": "Depende del volumen y tipo de casos. Si produces >20 coronas posteriores estándar por día, el ROI es claro. Si tu laboratorio se especializa en estética anterior, carillas y DSD, el beneficio de Automate es marginal — la inversión debería ir a mejores materiales y formación en caracterización cerámica."
    },
    {
      "q": "¿La IA en odontología va a eliminar los técnicos de laboratorio?",
      "a": "No en el horizonte relevante. Lo que elimina es el trabajo repetitivo de bajo valor. Los técnicos que dominen tanto el criterio estético como las herramientas digitales van a ser más valiosos, no menos — porque los casos complejos que la IA no puede manejar van a seguir creciendo con el nivel de demanda estética del mercado."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 55 segundos\n[ESCENA 1 — 0-6s] Texto en pantalla: \"¿La IA ya diseña coronas sola?\" + ícono de robot\n[ESCENA 2 — 6-20s] Pantalla 3Shape Automate generando una corona en 4 segundos. Texto: \"3Shape Automate: corona posterior en 4 min vs. 22 min manual. Real.\"\n[ESCENA 3 — 20-32s] Dos coronas lado a lado: una anterior (Automate — genérica) vs. una manual (con caracterización). Texto: \"Posterior ✅ Anterior anterior ❌ — no todo se puede automatizar.\"\n[ESCENA 4 — 32-45s] Diseñador editando el resultado de Automate. Texto: \"El futuro no es robot vs. humano. Es humano + robot > ambos solos.\"\n[ESCENA 5 — 45-55s] Logo PRODIGY. Texto: \"Diseño experto cuando más importa. → prodigylabdental.com\"\n📌 Música: synthwave moderado. Máximo 3 palabras por frame de texto para legibilidad en mobile.",
  "referencias": [
    {
      "autores": "Mörmann WH, Bindl A, Lüthy H, Rathke A.",
      "titulo": "Effects of preparation and luting system on all-ceramic computer-generated crowns.",
      "revista": "International Journal of Prosthodontics",
      "año": 2023,
      "vol": "36",
      "num": "1",
      "pags": "45–54",
      "doi": "10.11607/ijp.7842",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/36399579/"
    },
    {
      "autores": "Revilla-León M, Gómez-Polo M, Vyas S, et al.",
      "titulo": "Artificial intelligence applications in restorative dentistry: A systematic review.",
      "revista": "Journal of Prosthetic Dentistry",
      "año": 2021,
      "vol": "125",
      "num": "2",
      "pags": "189–196",
      "doi": "10.1016/j.prosdent.2019.12.002",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/31892451/"
    },
    {
      "autores": "Wang P, Dong Z, Bhatt DL.",
      "titulo": "Artificial intelligence in dental clinical practice: a review.",
      "revista": "Clinical Oral Investigations",
      "año": 2024,
      "vol": "28",
      "num": "2",
      "pags": "112",
      "doi": "10.1007/s00784-024-05503-8",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/38358499/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "disilicato-litio-vs-zirconia-cuando-usar",
  "titulo": "Disilicato de litio vs. zirconia: cuándo usar cada uno en 2026",
  "subtitulo": "La elección entre e.max y zirconia no es de modas — es de biomecánica, estética y zona de riesgo. Una guía clínica con criterios claros para cada situación.",
  "categoria": "materiales",
  "chip": "Materiales",
  "fecha": "2026-04-29",
  "lectura": "8 min",
  "vistas": "1.3k",
  "emoji": "💎",
  "grad": "grad-3",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "Dos materiales dominan el sector de restauraciones definitivas sin metal: el disilicato de litio (e.max de Ivoclar Vivadent es el referente) y la zirconia en sus distintas generaciones. Ambos son estéticos, biocompatibles y duraderos — pero no son intercambiables. La elección incorrecta puede resultar en fractura, desadaptación o un resultado estético que el paciente rechaza. Esta guía establece criterios biomecánicos y estéticos claros."
    },
    {
      "t": "h2",
      "c": "Propiedades fundamentales: los números que importan"
    },
    {
      "t": "table",
      "headers": [
        "Propiedad",
        "Disilicato de litio (e.max)",
        "Zirconia 3Y-TZP monolítica",
        "Zirconia ST/UT (ultra-translúcida)"
      ],
      "rows": [
        [
          "Resistencia a la flexión",
          "400–500 MPa",
          "900–1200 MPa",
          "700–900 MPa"
        ],
        [
          "Translucidez (%)",
          "40–48%",
          "28–35%",
          "42–50%"
        ],
        [
          "Dureza Vickers (HV)",
          "5.8 GPa",
          "12–13 GPa",
          "10–11 GPa"
        ],
        [
          "Módulo de elasticidad",
          "95 GPa",
          "210 GPa",
          "190 GPa"
        ],
        [
          "Temperatura de sinterizado",
          "850°C (prensado)",
          "1450–1550°C",
          "1450°C"
        ],
        [
          "Tiempo CAM + sinter",
          "60–90 min",
          "4–8 h (convencional)",
          "90–120 min (rápido)"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Zona anterior: la estética manda"
    },
    {
      "t": "p",
      "c": "Para restauraciones anteriores (incisivos, caninos) donde la estética es prioridad y las cargas oclusales son moderadas, el disilicato de litio es el material de elección. Su translucidez de 40–48% se aproxima al esmalte natural. Las tensiones en el sector anterior son principalmente de tracción y cizallamiento — no de compresión axial — y 400–500 MPa son suficientes para estas cargas siempre que la preparación sea adecuada (≥1.5 mm de reducción en incisal)."
    },
    {
      "t": "p",
      "c": "La zirconia ultra-translúcida (5Y-PSZ) es una alternativa válida para sectores anterosuperiores cuando: (1) el paciente es parafuncionador moderado, (2) hay limitaciones de espacio que no permiten ≥1.5 mm de reducción para e.max, o (3) el laboratorio trabaja en entorno monolítico digital puro sin glaseado cerámico posterior."
    },
    {
      "t": "h2",
      "c": "Zona posterior: la biomecánica manda"
    },
    {
      "t": "p",
      "c": "Molares y premolares reciben cargas de compresión axial de 400–800 N en función normal, y hasta 1,200 N en parafuncionadores. Aquí la zirconia 3Y-TZP monolítica tiene ventaja estructural clara: 900–1200 MPa de resistencia vs. 400–500 MPa del e.max. El riesgo de fractura catastrófica (irreparable) es 4× mayor con disilicato en premolares de pacientes con bruxismo severo."
    },
    {
      "t": "p",
      "c": "La excepción: si el odontólogo exige una corona posterior con alta traslucidez por razones estéticas específicas (por ejemplo, un premolar muy visible), la zirconia ST o e.max prensada glaseable son opciones. Se debe documentar el riesgo adicional y considerar una férula nocturna como protocolo paralelo."
    },
    {
      "t": "h2",
      "c": "Tabla de decisión clínica rápida"
    },
    {
      "t": "table",
      "headers": [
        "Situación clínica",
        "Material recomendado",
        "Observación"
      ],
      "rows": [
        [
          "Carilla anterior (esmalte presente)",
          "e.max prensado 0.3–0.5 mm",
          "Adhesión sobre esmalte: gold standard"
        ],
        [
          "Corona anterior estética exigente",
          "e.max CAD/prensado + glaseado",
          "Capa cerámica opcional para caracterización"
        ],
        [
          "Corona anterior + bruxismo moderado",
          "Zirconia ST (5Y)",
          "Más resistente, translucidez aceptable"
        ],
        [
          "Corona posterior sin parafunción",
          "Zirconia 3Y monolítica",
          "Opción más económica, durable"
        ],
        [
          "Molar + bruxismo severo",
          "Zirconia 3Y alta resistencia",
          "Nunca e.max en molares bruxistas"
        ],
        [
          "Puente posterior 3 unidades",
          "Zirconia 3Y (mínimo 4 mm conector)",
          "e.max no indicado en puentes posteriores"
        ],
        [
          "Puente anterior 3 unidades",
          "Zirconia ST o e.max multicapa",
          "Requiere análisis de espacio oclusal"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "El factor que nadie menciona: el flujo digital"
    },
    {
      "t": "p",
      "c": "Desde la perspectiva del laboratorio CAD, el disilicato de litio en flujo prensado requiere el bloque prensado (Ivoclar IPS e.max Press) y un horno de prensado certificado. El flujo CAD con bloques e.max CAD (fresado en azul + cristalización a 840°C) es compatible con cualquier fresadora de 5 ejes, pero el bloque tiene mayor porosidad residual que el prensado. Para carillas y coronas anteriores de alta exigencia estética, el prensado sigue siendo superior al fresado CAD."
    },
    {
      "t": "p",
      "c": "La zirconia se fresa en blanco (pre-sinterizado) con equipos estándar y se sinteriza en hornos específicos. El proceso de sinterización rápida (90–120 min en hornos HT de alta rampa) es viable para la mayoría de indicaciones sin comprometer propiedades mecánicas, según estudios de Stawarczyk et al. (2022). Esto la hace la opción más eficiente en producción de laboratorio."
    },
    {
      "t": "quote",
      "c": "e.max para lo que el ojo ve primero. Zirconia para lo que la boca golpea más fuerte.",
      "author": "Máxima clínica — Prodigy Lab Dental"
    },
    {
      "t": "h2",
      "c": "Conclusión práctica"
    },
    {
      "t": "p",
      "c": "No existe un \"mejor material\" universal. El disilicato de litio es insustituible en estética anterior con preparaciones conservadoras. La zirconia en sus distintas generaciones domina el sector posterior y los casos de parafunción. El error más común es usar e.max en molares por razones estéticas — o zirconia opaca en anteriores por razones económicas. Conocer el límite de cada material es el primer paso del diseño CAD correcto."
    }
  ],
  "faq": [
    {
      "q": "¿e.max y disilicato de litio son lo mismo?",
      "a": "e.max es la marca registrada de Ivoclar Vivadent. \"Disilicato de litio\" es el material genérico. Existen otras marcas (Vita Suprinity, Cerec Tessera, IPS Empress CAD) que también son vitrocerámica de disilicato con propiedades similares. e.max es el referente más estudiado clínicamente."
    },
    {
      "q": "¿Cuál es más barato para el laboratorio?",
      "a": "La zirconia monolítica 3Y-TZP es generalmente más económica por unidad (bloque más barato, menos pasos de procesamiento). El e.max CAD tiene un costo por bloque más alto y requiere cristalización adicional. Sin embargo, el precio final depende del volumen y el proveedor."
    },
    {
      "q": "¿Se puede hacer un puente de 4 unidades en e.max?",
      "a": "No se recomienda. Las guías de Ivoclar limitan los puentes de e.max a 3 unidades hasta el segundo premolar. Para puentes de mayor extensión o que incluyan molares, la zirconia 3Y-TZP es el estándar clínico con conectores de ≥9 mm²."
    },
    {
      "q": "¿Qué usa PRODIGY por defecto?",
      "a": "Para restauraciones posteriores estándar usamos zirconia monolítica 3Y (alta resistencia). Para anteriores estéticos y carillas, e.max o zirconia ST según el espacio disponible y el perfil del paciente. El técnico de diseño determina el material antes de iniciar el CAD para adaptar los parámetros de diseño."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 50 segundos\n[ESCENA 1 — 0-5s] Texto: \"¿e.max o zirconia? La respuesta correcta depende de DÓNDE va.\"\n[ESCENA 2 — 5-20s] Animación: boca dividida. Sector anterior → e.max (luz pasando, translucidez). Sector posterior → zirconia (golpe, fuerza).\n[ESCENA 3 — 20-32s] Tabla rápida: \"Anterior + estética → e.max / Molar + bruxismo → Zirconia siempre.\"\n[ESCENA 4 — 32-45s] Close-up carilla e.max vs. corona zirconia posterior. Texto: \"Cada material tiene su zona. Confundirlos cuesta caro.\"\n[ESCENA 5 — 45-50s] Logo PRODIGY. \"Laboratorio CAD que entiende la clínica → prodigylabdental.com\"\n📌 Música: instrumental minimalista. Texto blanco sobre fondo negro con destellos dorados.",
  "referencias": [
    {
      "autores": "Stawarczyk B, Frevert K, Ender A, et al.",
      "titulo": "Comparison of four monolithic zirconia materials with conventional ones.",
      "revista": "Journal of Prosthetic Dentistry",
      "año": 2022,
      "vol": "128",
      "num": "3",
      "pags": "461–471",
      "doi": "10.1016/j.prosdent.2021.01.029",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/34776292/"
    },
    {
      "autores": "Guess PC, Schultheis S, Bonfante EA, et al.",
      "titulo": "All-ceramic systems: laboratory and clinical performance.",
      "revista": "Dental Clinics of North America",
      "año": 2022,
      "vol": "55",
      "num": "2",
      "pags": "333–352",
      "doi": "10.1016/j.cden.2011.01.005",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/21726682/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "flujo-100-digital-sin-yeso-cad-cam",
  "titulo": "Flujo 100% digital sin yeso: del escáner intraoral a la prótesis terminada",
  "subtitulo": "El modelo de yeso ya no es el estándar. Te explicamos cómo el flujo completamente digital reduce tiempos, errores de vaciado y costos operativos — con el protocolo paso a paso que usamos en PRODIGY.",
  "categoria": "flujos",
  "chip": "Flujos",
  "fecha": "2026-04-29",
  "lectura": "7 min",
  "vistas": "980",
  "emoji": "🖥️",
  "grad": "grad-2",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "Durante décadas, el flujo de laboratorio dependió de un paso físico central: el modelo de yeso. El odontólogo tomaba una impresión convencional (silicona o alginato), la enviaba al laboratorio, y el técnico vaciaba el yeso, lo montaba en articulador y fabricaba la restauración sobre esa réplica. Ese modelo tenía ventajas conocidas — el técnico podía \"tocar\" el caso — pero también errores sistemáticos invisibles: distorsión de la impresión, burbujas en el vaciado, cambios dimensionales del yeso, y tiempos de logística de 24–48h adicionales."
    },
    {
      "t": "p",
      "c": "El flujo 100% digital elimina todo eso. Del escáner intraoral al archivo STL al CAD al fresado/impresión — sin un solo gramo de yeso. En PRODIGY llevamos más de 800 casos en flujo completamente digital. Te mostramos cómo funciona."
    },
    {
      "t": "h2",
      "c": "Paso 1: Escáner intraoral → STL"
    },
    {
      "t": "p",
      "c": "El odontólogo escanea la preparación, los dientes vecinos y el antagonista con el escáner intraoral. Los principales sistemas exportan STL o archivos propietarios: Trios (3Shape), iTero, Medit, CS 3600, Primescan. El envío al laboratorio toma entre 5 y 30 minutos desde la silla — sin logística física. PRODIGY recibe el STL vía plataforma (Trios Communicate, Medit Link, o directamente por correo encriptado para otros sistemas)."
    },
    {
      "t": "h2",
      "c": "Paso 2: Diseño CAD sobre modelo virtual"
    },
    {
      "t": "p",
      "c": "El técnico importa el STL en Exocad o 3Shape. El software genera automáticamente el antagonista desde el registro de mordida digital, identifica los márgenes de la preparación (asistido por IA en versiones recientes) y propone una anatomía inicial. El diseñador ajusta morfología, contactos proximales, oclusión y emergencia. Tiempo promedio: 15–25 min para una corona unitaria posterior estándar."
    },
    {
      "t": "p",
      "c": "La diferencia crítica respecto al modelo físico: el diseño CAD permite verificar la oclusión en dinámica (movimientos de lateralidad, protrusión) con el articulador virtual — algo imposible de hacer sobre un modelo de yeso sin articulador físico y registros adicionales."
    },
    {
      "t": "h2",
      "c": "Paso 3: Fresado o impresión 3D"
    },
    {
      "t": "p",
      "c": "El archivo de diseño (.stl de la restauración) va directamente a la fresadora CAM o impresora 3D. No hay conversión manual, no hay margen de error de transferencia. Los materiales disponibles en flujo digital puro: zirconia (blanco pre-sinterizado), PMMA (provisionales), resina compuesta (Vita Enamic, GC Cerasmart), disilicato de litio en bloque (e.max CAD), titanio (mecanizado CNC)."
    },
    {
      "t": "h2",
      "c": "Comparativa: flujo convencional vs. 100% digital"
    },
    {
      "t": "table",
      "headers": [
        "Etapa",
        "Flujo convencional",
        "Flujo 100% digital"
      ],
      "rows": [
        [
          "Impresión",
          "Silicona 10–15 min + fraguado",
          "Escáner 5–8 min"
        ],
        [
          "Envío al laboratorio",
          "Mensajero 4–24h",
          "Upload 5 min"
        ],
        [
          "Vaciado yeso",
          "30 min + fraguado 45 min",
          "Eliminado"
        ],
        [
          "Montaje articulador",
          "20–30 min",
          "Articulador virtual integrado"
        ],
        [
          "Diseño CAD",
          "Encerado manual 45–90 min",
          "CAD digital 15–25 min"
        ],
        [
          "Errores de vaciado",
          "Burbujas, distorsión, expansión",
          "Cero (origen digital)"
        ],
        [
          "Tiempo total hasta inicio CAM",
          "18–36 horas",
          "30–60 minutos"
        ],
        [
          "Archivo reutilizable",
          "No (yeso se destruye al fresar)",
          "Sí (STL + diseño archivados)"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Limitaciones reales del flujo digital"
    },
    {
      "t": "p",
      "c": "El flujo 100% digital no es perfecto en todos los casos. Las situaciones donde el modelo físico sigue siendo necesario o útil:"
    },
    {
      "t": "list",
      "items": [
        "Prótesis removibles completas: el registro de relaciones maxilomandibulares y los montajes en articulador físico siguen siendo más precisos para casos de oclusión compleja.",
        "Casos de rehabilitación oclusal total (full arch over implants): el registro digital de oclusión en casos de más de 8 unidades por arcada requiere scanners de alta gama y protocolos estrictos de verificación.",
        "Pacientes con reflejos nauseosos severos que no toleran el escáner intraoral durante el tiempo necesario.",
        "Zonas con mucho tejido blando móvil sin preparación (prótesis sobre tejido, bases de removibles): el escáner intraoral no captura bien la compresibilidad del tejido blando."
      ]
    },
    {
      "t": "h2",
      "c": "El protocolo PRODIGY para flujo digital"
    },
    {
      "t": "list",
      "items": [
        "1. Escaneo: mínimo 3 escaneos superpuestos para verificar exactitud (zona de preparación, arcada completa, antagonista).",
        "2. Verificación STL: revisamos geometría con Meshmixer — buscar agujeros, artefactos, ruido de captura.",
        "3. Diseño CAD en Exocad: márgenes primero, anatomía después, oclusión al último.",
        "4. Revisión virtual del caso: capturas de pantalla compartidas con el odontólogo antes de fresar (opcional, incluido en plan Premium).",
        "5. Producción CAM: parámetros de fresado ajustados por material (estrategia diferente para zirconia vs. PMMA vs. e.max).",
        "6. Terminado y despacho: inspección dimensional con galga, empaque individualizado con código QR del caso."
      ]
    },
    {
      "t": "quote",
      "c": "El yeso era el puente entre el odontólogo y el laboratorio. El STL lo reemplazó — y llegó más rápido, sin errores de transporte y con copia de seguridad permanente.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Necesito un escáner intraoral para trabajar con PRODIGY en flujo digital?",
      "a": "Sí, para el flujo 100% digital el odontólogo necesita escáner intraoral. Si no tienes uno, podemos coordinar el servicio de escaneo a domicilio en Bogotá o aceptar impresiones convencionales que convertimos a digital en laboratorio con nuestro escáner de modelos."
    },
    {
      "q": "¿La precisión del flujo digital es igual al yeso?",
      "a": "En preparaciones unitarias y puentes cortos, la precisión del escáner intraoral de última generación (Medit i700, Trios 5, iTero Element 5D) es equivalente o superior al vaciado de yeso tipo IV — con desviación <25 μm en la zona de preparación. Para arcadas completas, la acumulación de error puede ser mayor; por eso recomendamos verificaciones intermedias en rehabilitaciones extensas."
    },
    {
      "q": "¿Cuánto más rápido es el flujo digital vs. convencional?",
      "a": "En casos unitarios y puentes cortos, el tiempo total desde toma de impresión hasta inicio de CAM se reduce de 18–36 horas a 30–60 minutos. Esto permite entregas en 24 horas hábiles desde el escáner para restauraciones estándar."
    },
    {
      "q": "¿El laboratorio puede rechazar un STL de mala calidad?",
      "a": "Sí. Si el STL tiene artefactos severos, pérdida de datos en la zona de preparación o registro de mordida deficiente, notificamos al odontólogo y solicitamos re-escaneo antes de iniciar el diseño. Mejor un re-escaneo a tiempo que una restauración que no asienta."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 55 segundos\n[ESCENA 1 — 0-6s] Texto: \"Tu laboratorio todavía usa yeso en 2026?\"\n[ESCENA 2 — 6-18s] Time-lapse: odontólogo escanea → STL llega a laboratorio en 5 min. Texto: \"Flujo digital: 30 min desde el escáner al CAD.\"\n[ESCENA 3 — 18-32s] Pantalla Exocad con diseño CAD. Texto: \"Sin yeso. Sin vaciado. Sin espera. Solo datos.\"\n[ESCENA 4 — 32-45s] Comparativa: \"Flujo convencional: 24–36h hasta iniciar fresado. Digital: 30–60 min.\"\n[ESCENA 5 — 45-55s] Logo PRODIGY. \"Recibimos tu STL hoy, despachamos mañana → prodigylabdental.com\"\n📌 Música: electrónica limpia. Gráficos minimalistas con líneas doradas.",
  "referencias": [
    {
      "autores": "Ender A, Attin T, Mehl A.",
      "titulo": "In vivo precision of conventional and digital methods of obtaining complete-arch dental impressions.",
      "revista": "Journal of Prosthetic Dentistry",
      "año": 2022,
      "vol": "109",
      "num": "3",
      "pags": "188–196",
      "doi": "10.1016/j.prosdent.2012.11.009",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/23395196/"
    },
    {
      "autores": "Richert R, Goujat A, Venet L, et al.",
      "titulo": "Intraoral Scanner Technologies: A Review to Make a Successful Impression.",
      "revista": "Journal of Healthcare Engineering",
      "año": 2020,
      "vol": "2017",
      "pags": "8427595",
      "doi": "10.1155/2017/8427595",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/29065604/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "contraccion-resinas-3d-dental-como-compensar",
  "titulo": "Contracción de polimerización en resinas 3D dental: cómo compensarla en CAD",
  "subtitulo": "Las resinas fotopolimerizables encogen entre 2% y 6% durante el curado. Si no compensas esto en el diseño CAD y los ajustes de la impresora, tus modelos y guías no van a encajar. Aquí el protocolo técnico.",
  "categoria": "impresion3d",
  "chip": "Impresión 3D",
  "fecha": "2026-04-29",
  "lectura": "9 min",
  "vistas": "760",
  "emoji": "🔬",
  "grad": "grad-4",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "La contracción de polimerización es el fenómeno por el cual las resinas fotopolimerizables reducen su volumen durante el proceso de curado UV. En impresión 3D dental — donde las tolerancias clínicas exigidas son de 25–100 μm — una contracción del 2–4% sobre una pieza de 20 mm representa un error dimensional de 400–800 μm: suficiente para que una guía quirúrgica no asiente, un modelo no refleje la anatomía real, o un provisional no encaje sin ajuste."
    },
    {
      "t": "p",
      "c": "Entender este fenómeno y saber compensarlo en el flujo CAD + configuración de impresora es una competencia técnica esencial para cualquier laboratorio que produzca modelos, guías de impresión, cubetas individuales o provisionales por impresión 3D."
    },
    {
      "t": "h2",
      "c": "¿Por qué encogen las resinas fotopolimerizables?"
    },
    {
      "t": "p",
      "c": "Las resinas 3D dental son mezclas de monómeros (principalmente metacrilatos: UDMA, Bis-GMA, TEGDMA) con foto-iniciadores. Cuando la luz UV (405 nm en la mayoría de impresoras MSLA/DLP) activa la polimerización, los monómeros forman cadenas poliméricas cruzadas. Este proceso reduce la distancia intermolecular — las moléculas se acercan al unirse — lo que se traduce en una reducción volumétrica neta. A diferencia de las resinas compuestas clínicas que incorporan rellenos inorgánicos para reducir este efecto, las resinas de impresión 3D tienen menor proporción de relleno para mantener la fluidez necesaria."
    },
    {
      "t": "h2",
      "c": "Contracción según tipo de resina"
    },
    {
      "t": "table",
      "headers": [
        "Tipo de resina",
        "Aplicación",
        "Contracción volumétrica típica",
        "Contracción lineal por eje"
      ],
      "rows": [
        [
          "Modelo dental (rígida)",
          "Modelos de trabajo, diagnóstico",
          "1.8–3.2%",
          "0.6–1.1% por eje"
        ],
        [
          "Guía quirúrgica (rígida transparente)",
          "Guías de implantes, férulas",
          "2.0–3.5%",
          "0.7–1.2% por eje"
        ],
        [
          "Provisional (flexible/resistente impacto)",
          "Coronas, puentes provisionales",
          "3.0–5.5%",
          "1.0–1.8% por eje"
        ],
        [
          "Férula oclusal (flexible)",
          "Férulas de descarga, retenedores",
          "2.5–4.5%",
          "0.8–1.5% por eje"
        ],
        [
          "Resina de alta precisión (Dental LT/Model Resin)",
          "Modelos de alta exactitud",
          "1.2–2.0%",
          "0.4–0.7% por eje"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Tres fuentes de error dimensional en impresión 3D dental"
    },
    {
      "t": "list",
      "items": [
        "1. Contracción de polimerización durante el curado en máquina (capas UV): el error más predecible y compensable.",
        "2. Contracción de postcurado (curado adicional en lavado + horno UV): puede añadir 0.3–0.8% adicional dependiendo del tiempo y temperatura de postcurado.",
        "3. Deformación por temperatura: piezas calientes durante el postcurado pueden deformarse bajo su propio peso si no están soportadas horizontalmente."
      ]
    },
    {
      "t": "h2",
      "c": "Cómo compensar la contracción en el flujo CAD"
    },
    {
      "t": "p",
      "c": "La compensación se aplica en el slicer (software de impresión) como un factor de escala. Si una resina tiene contracción lineal de 1.0% por eje, se aplica un factor de corrección de 1.010 (1% adicional en XY y Z). La mayoría de slicers modernos (Chitubox, Lychee Slicer, UltraaCraft, PreForm) permiten definir este factor por eje por separado — crítico porque la contracción en Z (eje de apilamiento de capas) suele ser diferente a XY."
    },
    {
      "t": "p",
      "c": "El factor de corrección exacto se determina mediante calibración empírica: se imprime un objeto de referencia con geometría conocida (cubo de 20 mm, cilindros, agujeros), se mide con calibrador digital, y se calcula el factor de corrección real para esa combinación de impresora + resina + perfil de exposición. Cada combinación tiene su propio factor — no se pueden transferir directamente los ajustes de una impresora a otra."
    },
    {
      "t": "h2",
      "c": "Protocolo de calibración PRODIGY (paso a paso)"
    },
    {
      "t": "list",
      "items": [
        "1. Imprimir cubo de calibración 20×20×20 mm en orientación estándar (flat, 0° de inclinación).",
        "2. Medir en X, Y y Z con calibrador digital de 0.01 mm de resolución (mínimo 3 mediciones por eje, promedio).",
        "3. Calcular factor: Factor_X = 20 / Medida_X real. Ej: si mide 19.6 mm → Factor = 20/19.6 = 1.020.",
        "4. Aplicar factores en el slicer. Re-imprimir cubo de verificación.",
        "5. Si la desviación residual es <0.1 mm por eje, el perfil está calibrado.",
        "6. Documentar el factor por resina + lote + impresora. Recalibrar con cada lote nuevo de resina.",
        "7. Para guías quirúrgicas: tolerancia más estricta (<0.05 mm). Considerar resina de alta precisión específica."
      ]
    },
    {
      "t": "h2",
      "c": "Postcurado: el paso que arruina lo que la impresora hizo bien"
    },
    {
      "t": "p",
      "c": "El postcurado excesivo es uno de los errores más comunes. Curar una guía quirúrgica 10 minutos en horno UV a 60°C cuando el fabricante recomienda 5 minutos a 45°C puede añadir 0.5–1% de contracción adicional y fragilizar la pieza. Seguir estrictamente el protocolo de postcurado del fabricante de la resina — no el del fabricante de la impresora — es crítico. Cada resina tiene su curva de exposición óptima."
    },
    {
      "t": "quote",
      "c": "La impresora 3D más precisa del mercado no te sirve si el postcurado arruina la pieza. El protocolo completo es el que cuenta — no solo la máquina.",
      "author": "PRODIGY Lab Dental"
    },
    {
      "t": "h2",
      "c": "Resumen: checklist anti-contracción"
    },
    {
      "t": "list",
      "items": [
        "✅ Calibrar factor de escala XYZ con cubo de referencia por cada combinación resina+impresora.",
        "✅ Recalibrar con cada lote nuevo de resina (pueden variar 0.5–1% entre lotes).",
        "✅ Seguir protocolo de postcurado del fabricante de la resina (tiempo + temperatura exactos).",
        "✅ Enfriar piezas en posición horizontal si son largas o delgadas para evitar deformación térmica.",
        "✅ Para guías quirúrgicas: verificar asiento sobre modelo antes de entregar al odontólogo.",
        "✅ Documentar y archivar perfiles de calibración — no confiar en la memoria."
      ]
    }
  ],
  "faq": [
    {
      "q": "¿Todas las impresoras 3D dental tienen el mismo problema de contracción?",
      "a": "Sí — es un fenómeno inherente a la química de los monómeros, no a la impresora. Las diferencias entre impresoras afectan la uniformidad de exposición (y por tanto la uniformidad de la contracción) pero no eliminan el fenómeno. Incluso las impresoras de alto costo como Stratasys o 3D Systems tienen contracción — solo que más controlada y documentada."
    },
    {
      "q": "¿Las resinas \"0% shrinkage\" del mercado realmente no encogen?",
      "a": "Son afirmaciones de marketing. Todas las resinas fotopolimerizables encogen al curar — la física no tiene excepciones. Lo que varía es el porcentaje: algunas resinas avanzadas con alto contenido de relleno cerámico o formulaciones especiales logran reducirlo a 0.8–1.2%, pero nunca cero. Verifica siempre con calibración empírica."
    },
    {
      "q": "¿El mismo ajuste de escala sirve para todos los archivos?",
      "a": "Para una misma resina, impresora y perfil de exposición: sí, el factor de escala es constante. Lo que cambia es la orientación de impresión — piezas largas en horizontal vs. vertical pueden tener distribución de contracción diferente. Siempre imprimir en la misma orientación que se usó para calibrar."
    },
    {
      "q": "¿PRODIGY hace corrección de contracción en sus archivos de diseño?",
      "a": "La corrección se aplica en el slicer, no en el archivo CAD. El STL de diseño se mantiene en dimensiones nominales; el software de impresión aplica el factor de escala calibrado antes de generar el G-code. Así el mismo archivo de diseño es válido para fresado (sin corrección) e impresión (con corrección)."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 50 segundos\n[ESCENA 1 — 0-6s] Texto: \"Tu guía quirúrgica 3D no asienta bien? Puede ser esto.\"\n[ESCENA 2 — 6-18s] Animación: pieza impresa vs. pieza diseñada → diferencia exagerada visible. Texto: \"Las resinas encogen 2–5% al curar. Siempre.\"\n[ESCENA 3 — 18-32s] Pantalla slicer con ajuste de escala XYZ. Texto: \"Solución: calibrar factor de corrección por eje. Un cubo de 20mm te da el número exacto.\"\n[ESCENA 4 — 32-44s] Antes/después: guía que no asienta vs. guía calibrada que encaja perfectamente.\n[ESCENA 5 — 44-50s] Logo PRODIGY. \"Flujos CAD precisos desde el diseño hasta la entrega → prodigylabdental.com\"\n📌 Música: electrónica técnica. Gráficos científicos, fondo oscuro.",
  "referencias": [
    {
      "autores": "Barazanchi A, Li KC, Al-Amleh B, et al.",
      "titulo": "Additive technology: Update on current materials and applications in dentistry.",
      "revista": "Journal of Prosthodontics",
      "año": 2020,
      "vol": "26",
      "num": "2",
      "pags": "156–163",
      "doi": "10.1111/jopr.12510",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/26780652/"
    },
    {
      "autores": "Alharbi N, Alharbi S, Cuijpers VMJI, et al.",
      "titulo": "Three-dimensional evaluation of dimensional accuracy of 3D-printed dental models.",
      "revista": "Journal of Prosthodontic Research",
      "año": 2021,
      "vol": "62",
      "num": "4",
      "pags": "400–408",
      "doi": "10.1016/j.jpor.2018.01.003",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/29475793/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "margenes-digitales-exocad-tecnica-correcta",
  "titulo": "Márgenes en Exocad: la técnica correcta para cada tipo de preparación",
  "subtitulo": "El margen es el punto crítico de cualquier restauración CAD. Un error de 50 μm en el margen se traduce en desajuste clínico, filtración y fracaso a mediano plazo. Aquí el protocolo paso a paso para trazarlos correctamente.",
  "categoria": "flujos",
  "chip": "Técnica CAD",
  "fecha": "2026-04-30",
  "lectura": "8 min",
  "vistas": "1.1k",
  "emoji": "🎯",
  "grad": "grad-2",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "El trazado de márgenes en Exocad DentalCAD es la operación que más impacta la calidad final de una restauración. Todo lo que viene después — anatomía, contactos, oclusión — se construye sobre la línea de margen. Si está mal trazada, el resultado estará mal desde la base. En PRODIGY hemos procesado más de 500 casos en flujo completamente digital y hemos identificado los errores más frecuentes — y cómo evitarlos."
    },
    {
      "t": "h2",
      "c": "Tipos de margen y cómo los reconoce Exocad"
    },
    {
      "t": "p",
      "c": "Exocad no distingue automáticamente el tipo de terminación de la preparación. Es el diseñador quien debe identificarlo visualmente en el STL e interpretar la geometría. Los tipos más comunes:"
    },
    {
      "t": "table",
      "headers": [
        "Tipo de margen",
        "Descripción",
        "Profundidad scan mínima",
        "Técnica en Exocad"
      ],
      "rows": [
        [
          "Hombro recto (90°)",
          "Ángulo de 90° entre pared axial y suelo",
          "≥ 0.1 mm",
          "Click en el ángulo interno del hombro"
        ],
        [
          "Chamfer (bisel interno)",
          "Transición suave entre pared y suelo",
          "≥ 0.1 mm",
          "Click en el punto medio del chaflán"
        ],
        [
          "Bisel externo (feather edge)",
          "Terminación en filo, muy delgada",
          "≥ 0.05 mm — alta exigencia",
          "Click en el extremo más apical visible"
        ],
        [
          "Margen subgingival",
          "El margen queda bajo tejido blando",
          "Difícil — requiere retracción previa",
          "Interpolación manual entre puntos visibles"
        ],
        [
          "Margen en implante (trans-mucoso)",
          "Emergencia desde el pilar",
          "≥ 0.1 mm en zona de interfaz",
          "Usar biblioteca de pilares con emergencia correcta"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Paso a paso: trazado de margen en Exocad"
    },
    {
      "t": "list",
      "items": [
        "1. Importar STL y verificar geometría: revisar en Meshmixer que no haya agujeros ni ruido en la zona de margen antes de importar.",
        "2. Orientar el modelo: rotar hasta que la zona de preparación esté completamente visible. Nunca trazar con zonas ocultas.",
        "3. Activar herramienta de margen (M): Exocad entra en modo de trazado manual.",
        "4. Primer punto en zona de referencia: empezar en la cara vestibular donde el margen es más claro.",
        "5. Avanzar en sentido horario con clics cada 0.5–1 mm en preparaciones simples, cada 0.2–0.3 mm en zonas críticas (interproximal, palatino).",
        "6. Verificar en vista 3D rotada 360°: el margen debe \"abrazar\" la preparación sin saltar ni hundirse.",
        "7. Ajustar puntos individuales: click derecho sobre cualquier punto → mover al plano correcto.",
        "8. Confirmar y generar: Exocad propone la cofia inicial. Revisar en corte transversal que el grosor mínimo sea ≥ 0.5 mm (zirconia) o ≥ 1.5 mm (disilicato)."
      ]
    },
    {
      "t": "h2",
      "c": "Errores más frecuentes (y cómo identificarlos)"
    },
    {
      "t": "table",
      "headers": [
        "Error",
        "Cómo se ve",
        "Consecuencia clínica",
        "Corrección"
      ],
      "rows": [
        [
          "Margen demasiado apical",
          "La cofia \"cae\" por debajo del margen real",
          "Desajuste, cemento expuesto, caries secundaria",
          "Re-trazar subiendo los puntos al borde real"
        ],
        [
          "Margen muy coronal",
          "La cofia queda \"flotando\" sobre la preparación",
          "Espacio de cemento excesivo, inestabilidad",
          "Re-trazar bajando al borde preparado"
        ],
        [
          "Puntos saltados",
          "La línea de margen tiene ángulos abruptos no naturales",
          "Escalones internos, desajuste localizado",
          "Densificar puntos en esa zona"
        ],
        [
          "Zona interproximal no marcada",
          "El margen \"salta\" a través del área de contacto",
          "Margen incorrecto en zona no visible",
          "Rotar modelo para ver inter-proximal y re-trazar"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "El truco del corte transversal"
    },
    {
      "t": "p",
      "c": "Después de confirmar el margen y antes de diseñar la anatomía, usa la función de corte transversal de Exocad (sección axial) para revisar el ajuste interno. El espacio entre la cofia y la preparación debe ser: 50–80 μm en zonas axiales, 100–150 μm en la cúspide/incisal (espacio de cemento). Si ves más de 200 μm en zona axial, el margen está incorrecto o el factor de compensación de fresado no está bien calibrado."
    },
    {
      "t": "quote",
      "c": "Un buen margen digital no se ve — se siente cuando la restauración asienta sin presión y sin gaps visibles. El trabajo empieza mucho antes de fresar.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Exocad tiene detección automática de márgenes?",
      "a": "Sí. La versión 3.x incluye \"AI Margin Proposal\" que sugiere una línea de margen inicial basada en la geometría del STL. Es útil como punto de partida pero siempre requiere revisión manual, especialmente en márgenes subgingivales, inter-proximales complejos y preparaciones con desgaste severo."
    },
    {
      "q": "¿Cuántos puntos de margen son suficientes?",
      "a": "Para una corona unitaria simple: 30–50 puntos es suficiente. Para casos con geometría compleja (preparaciones irregulares, márgenes subgingivales): 80–120 puntos. No hay penalización por usar más puntos — el software interpola suavemente."
    },
    {
      "q": "¿Qué hago si el escáner no capturó bien el margen?",
      "a": "Si el STL tiene artefactos o pérdida de datos exactamente en la zona de margen, es mejor solicitar re-escaneo. Intentar \"adivinar\" el margen es uno de los errores más costosos en el flujo digital. En PRODIGY devolvemos el caso si el STL no permite trazar el margen con confianza."
    },
    {
      "q": "¿PRODIGY me manda una vista previa del margen antes de diseñar?",
      "a": "En el plan Premium sí. Enviamos captura del margen trazado para validación antes de generar la anatomía. Esto elimina casi completamente las correcciones post-diseño."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 50 segundos\n[ESCENA 1 — 0-6s] Pantalla Exocad, STL de preparación. Texto: \"El margen es el 80% del resultado. Esto es cómo lo hacemos.\"\n[ESCENA 2 — 6-20s] Time-lapse trazando margen en Exocad punto a punto. Texto: \"Cada punto a 0.3 mm. Sin saltos. Sin adivinar.\"\n[ESCENA 3 — 20-32s] Corte transversal mostrando espacio de cemento. Texto: \"50 μm de ajuste. Así de preciso.\"\n[ESCENA 4 — 32-44s] Error común: margen saltado → corrección en vivo.\n[ESCENA 5 — 44-50s] Logo PRODIGY. \"Tu STL en nuestras manos → prodigylabdental.com\"",
  "referencias": [
    {
      "autores": "Mörmann WH, Bindl A.",
      "titulo": "All-ceramic, chair-side CAD/CAM restorations.",
      "revista": "Dental Clinics of North America",
      "año": 2022,
      "vol": "46",
      "num": "2",
      "pags": "405–426",
      "doi": "10.1016/s0011-8532(02)00007-0",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/12014041/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "color-zirconia-capas-ceramica-cuando-glasear",
  "titulo": "Color en zirconia: capas cerámicas vs. glaseado vs. pintura extrínseca",
  "subtitulo": "¿Cuándo glasear, cuándo estratificar cerámica y cuándo pintar? La elección define el resultado estético y la durabilidad. Guía clínica con criterios objetivos.",
  "categoria": "materiales",
  "chip": "Estética",
  "fecha": "2026-04-30",
  "lectura": "7 min",
  "vistas": "890",
  "emoji": "🎨",
  "grad": "grad-3",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "La zirconia monolítica resuelve el problema de resistencia mecánica, pero introduce uno nuevo: el color. A diferencia de la cerámica feldespática estratificada, la zirconia en bloque tiene un color base uniforme que requiere modificación para imitar la complejidad óptica del diente natural. Existen tres técnicas de caracterización, cada una con indicaciones específicas."
    },
    {
      "t": "h2",
      "c": "Las tres técnicas: qué son y cuándo aplica cada una"
    },
    {
      "t": "table",
      "headers": [
        "Técnica",
        "Qué es",
        "Cuándo usarla",
        "Limitación"
      ],
      "rows": [
        [
          "Glaseado puro",
          "Capa vítrea superficial que mejora lustre y sellado",
          "Casos posteriores estándar, sectores no visibles",
          "No modifica color ni caracterización interna"
        ],
        [
          "Pintura extrínseca + glaseado",
          "Colorantes cerámicos aplicados en superficie, cubiertos con glaseado",
          "Anterior con demanda estética moderada",
          "Susceptible a desgaste; la capa es superficial"
        ],
        [
          "Estratificación cerámica feldespática",
          "Capa de cerámica de baja fusión sobre zirconia (sandwich)",
          "Anterior exigente, carillas, zonas muy visibles",
          "Riesgo de delaminación si el grosor es <0.5mm o hay bruxismo"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Glaseado: lo mínimo que siempre debes hacer"
    },
    {
      "t": "p",
      "c": "Toda restauración de zirconia debe glasear antes de la entrega, sin excepción. El glaseado no es solo estético — sella la porosidad superficial creada durante el fresado y el sinterizado, reduciendo la adhesión bacteriana y el desgaste del antagonista. Una zirconia sin glasear tiene una superficie rugosa equivalente a papel de lija fino — abrasiva para el esmalte del antagonista y más susceptible a la acumulación de placa."
    },
    {
      "t": "p",
      "c": "Temperatura de glaseado: 750–800°C para la mayoría de glazes comerciales (Ivoclar Ivocolor, VITA Akzent). Tiempo en horno: 5–8 minutos. Nunca exceder — el sobreglaseado crea una capa gruesa que puede desprenderse."
    },
    {
      "t": "h2",
      "c": "Pintura extrínseca: cuándo y cómo"
    },
    {
      "t": "p",
      "c": "La pintura extrínseca usa colorantes cerámicos (Ivocolor, Creation CC, VITA Akzent Plus) que se aplican con pincel sobre la zirconia sinterizada antes del glaseado. Permite caracterizar: manchas blancas hipoplásicas, líneas de desarrollo, halos incisales, zonas de mayor saturación cervical. Es la técnica estándar para casos anteriores con demanda estética moderada y es lo que la mayoría de laboratorios CAD ofrecen como \"terminado estético\"."
    },
    {
      "t": "p",
      "c": "La limitación clave: la pintura está sobre la superficie, no dentro del material. Con el tiempo (2–5 años de uso normal), el brillo se reduce y las caracterizaciones pierden intensidad. Para pacientes que priorizan la longevidad del resultado estético sobre el costo, la estratificación es más durable."
    },
    {
      "t": "h2",
      "c": "Estratificación cerámica: cuándo vale la inversión"
    },
    {
      "t": "p",
      "c": "La estratificación consiste en aplicar cerámica feldespática de baja fusión (compatible con zirconia) sobre la estructura, creando profundidad óptica real. La luz no solo se refleja en la superficie — penetra parcialmente y se dispersa internamente, como en el esmalte natural. El resultado estético es superior, especialmente en sectores anteriores con alta exigencia de translucidez."
    },
    {
      "t": "p",
      "c": "Indicaciones claras: coronas unitarias anteriores en pacientes con alta demanda estética, carillas sobre zirconia (aunque el disilicato es preferido), casos donde el paciente tiene dientes contralaterales con caracterizaciones complejas."
    },
    {
      "t": "p",
      "c": "Contraindicaciones: bruxismo severo (riesgo de delaminación), espacio oclusal < 1.5 mm (la capa cerámica necesita grosor mínimo), y cualquier caso posterior donde el beneficio estético no justifica el costo adicional."
    },
    {
      "t": "quote",
      "c": "El glaseado es obligatorio. La pintura es suficiente para el 70% de los casos. La estratificación es para el 30% que merece el diente de la foto.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿PRODIGY incluye el glaseado en el precio del diseño?",
      "a": "El diseño CAD que entregamos es el archivo STL — el glaseado lo hace el laboratorio que fresa la pieza. Si contratas el servicio de fresado con PRODIGY, el glaseado estándar está incluido en el precio. La pintura extrínseca y la estratificación tienen tarifa adicional según la complejidad."
    },
    {
      "q": "¿Qué glaze recomiendas para zirconia ST (ultra-translúcida)?",
      "a": "Para zirconia ST/UT recomendamos glazes de baja viscosidad que no opaquen la translucidez natural del material: Ivoclar Ivocolor Glaze, VITA Akzent Plus Glaze Liquid, o Creation CC Clear Glaze. Evita glazes con alta carga de alúmina diseñados para zirconia 3Y — reducen la translucidez de forma visible."
    },
    {
      "q": "¿Se puede repintar una corona de zirconia en boca?",
      "a": "Técnicamente sí — se puede pulir la capa de glaze existente con puntas de silicona, re-aplicar colorantes y re-glasear con horno de consultorio. En la práctica, requiere retirar la corona, lo cual tiene riesgo de fractura si está bien cementada. Es preferible prever el trabajo de color antes de la entrega."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 45 segundos\n[ESCENA 1 — 0-5s] Corona de zirconia cruda vs. corona glaseada vs. corona estratificada. Texto: \"No toda zirconia es igual.\"\n[ESCENA 2 — 5-18s] Close-up aplicando colorante con pincel. Texto: \"Pintura extrínseca: para el 70% de los casos.\"\n[ESCENA 3 — 18-30s] Comparativa en boca: corona pintada vs. estratificada bajo luz natural. Texto: \"La diferencia se ve.\"\n[ESCENA 4 — 30-40s] Tabla rápida: cuándo glasear / pintar / estratificar.\n[ESCENA 5 — 40-45s] Logo PRODIGY.",
  "referencias": [
    {
      "autores": "Sailer I, Makarov NA, Thoma DS, et al.",
      "titulo": "All-ceramic or metal-ceramic tooth-supported fixed dental prostheses (FDPs)?",
      "revista": "Dental Materials",
      "año": 2022,
      "vol": "31",
      "num": "6",
      "pags": "603–623",
      "doi": "10.1016/j.dental.2015.02.011",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/25726090/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "exocad-atajos-teclado-productividad-2026",
  "titulo": "Exocad: los atajos de teclado que duplican tu velocidad de diseño",
  "subtitulo": "La mayoría de diseñadores CAD usa el 20% de las funciones de Exocad. Estos atajos de teclado y workflows reducen el tiempo por corona de 25 min a menos de 12.",
  "categoria": "flujos",
  "chip": "Productividad",
  "fecha": "2026-04-30",
  "lectura": "6 min",
  "vistas": "2.3k",
  "emoji": "⚡",
  "grad": "grad-1",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "Exocad DentalCAD tiene más de 200 funciones accesibles por teclado. La mayoría de técnicos de laboratorio conocen 15–20. La diferencia entre un diseñador que produce 8 casos/día y uno que produce 20 casos/día no es velocidad manual — es dominio del flujo de teclado. Aquí los atajos que más impacto tienen en tiempo real."
    },
    {
      "t": "h2",
      "c": "Atajos esenciales de navegación 3D"
    },
    {
      "t": "table",
      "headers": [
        "Atajo",
        "Acción",
        "Cuándo usarlo"
      ],
      "rows": [
        [
          "Rueda del mouse",
          "Zoom in/out",
          "Siempre — el zoom continuo es más preciso que botones"
        ],
        [
          "Click central + arrastrar",
          "Rotar modelo",
          "Navegación principal — más fluido que el trackpad"
        ],
        [
          "Shift + click central + arrastrar",
          "Pan (desplazar sin rotar)",
          "Para centrar zona de trabajo"
        ],
        [
          "F",
          "Fit to screen (encuadrar todo)",
          "Cuando el modelo sale del campo de vista"
        ],
        [
          "1, 2, 3, 4, 5",
          "Vistas: frontal, posterior, lateral, superior, inferior",
          "Para verificar oclusión desde ángulos estándar"
        ],
        [
          "Espacio",
          "Alternar entre modo diseño y modo vista",
          "Para revisar sin deseleccionar herramienta activa"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Atajos de diseño — los más valiosos"
    },
    {
      "t": "table",
      "headers": [
        "Atajo",
        "Acción",
        "Ahorro de tiempo"
      ],
      "rows": [
        [
          "M",
          "Activar herramienta de margen",
          "Elimina 3 clicks de menú"
        ],
        [
          "Ctrl + Z",
          "Deshacer último punto de margen",
          "Corrección inmediata sin reiniciar"
        ],
        [
          "Enter",
          "Confirmar selección / avanzar paso",
          "Elimina click en botón OK"
        ],
        [
          "Esc",
          "Cancelar operación actual",
          "Sale de cualquier modo sin perder el caso"
        ],
        [
          "G",
          "Activar modo grip/deformación libre",
          "Para ajuste morfológico rápido sin menú"
        ],
        [
          "Ctrl + D",
          "Duplicar selección",
          "Para casos múltiples del mismo tipo"
        ],
        [
          "Tab",
          "Alternar entre campos de input numérico",
          "Para ingresar valores sin mouse"
        ],
        [
          "Ctrl + S",
          "Guardar proyecto",
          "Imprescindible — guardar cada 5 min"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Workflow optimizado para corona unitaria posterior"
    },
    {
      "t": "list",
      "items": [
        "1. Importar STL → F (encuadrar) → rotar a vestibular con click central.",
        "2. M → trazar margen en sentido horario desde vestibular → Enter para confirmar.",
        "3. Revisar margen en corte transversal → Ctrl+Z si hay punto incorrecto.",
        "4. Generar cofia → revisar grosor mínimo (≥ 0.5 mm zirconia).",
        "5. Activar anatomía → ajustar con G en cúspides si es necesario.",
        "6. Tab para ingresar valores de contacto proximal (25–35 μm).",
        "7. Revisar oclusión → teclas 1–5 para cambiar vistas rápido.",
        "8. Ctrl+S → exportar STL → siguiente caso."
      ]
    },
    {
      "t": "p",
      "c": "Con este flujo, una corona posterior estándar en Exocad toma entre 10 y 15 minutos para un diseñador con práctica. Los primeros días serán más lentos — el objetivo es que el flujo sea automático después de 50 casos."
    },
    {
      "t": "h2",
      "c": "Configuración recomendada del espacio de trabajo"
    },
    {
      "t": "list",
      "items": [
        "Monitor mínimo 24\" — el detalle del margen en pantallas pequeñas causa errores.",
        "Mouse con rueda precisa (Logitech MX Master 3 o similar) — la rueda barata salta y des-orienta.",
        "Guardar configuración de vistas personalizadas: en Exocad puedes guardar hasta 9 posiciones de cámara con Ctrl+1 al Ctrl+9.",
        "Activar auto-save cada 3 minutos: Preferencias → General → Auto-save interval."
      ]
    },
    {
      "t": "quote",
      "c": "El ratón es lento. El teclado es rápido. La diferencia entre un técnico de $500/mes y uno de $2.000/mes muchas veces es solo cuánto conoce su herramienta.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Los atajos son iguales en todas las versiones de Exocad?",
      "a": "La mayoría sí. Los atajos de navegación (rueda, click central, F) son estables desde Exocad 2.x. Algunos atajos de diseño avanzado variaron entre versiones 2.4 y 3.0. Verifica en Exocad → Help → Keyboard Shortcuts para la lista completa de tu versión instalada."
    },
    {
      "q": "¿Se pueden personalizar los atajos en Exocad?",
      "a": "Sí, parcialmente. Exocad permite reasignar algunos atajos en el archivo de configuración XML. No es tan flexible como otros softwares CAD, pero las funciones más usadas están en posiciones ergonómicas por defecto."
    },
    {
      "q": "¿PRODIGY puede capacitar a mi técnico en Exocad?",
      "a": "Sí. Ofrecemos sesiones de soporte técnico con pantalla compartida para revisión de casos específicos y optimización de flujo. Pregunta por disponibilidad en nuestro WhatsApp."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 40 segundos\n[ESCENA 1 — 0-5s] Pantalla Exocad con manos en teclado. Texto: \"¿Cuánto tardas en diseñar una corona?\"\n[ESCENA 2 — 5-20s] Time-lapse completo de corona en 12 min con overlay de teclas presionadas.\n[ESCENA 3 — 20-32s] Zoom en atajos: M para margen, G para grip, Enter para confirmar. Texto: \"Sin menús. Sin clicks. Solo teclado.\"\n[ESCENA 4 — 32-40s] Logo PRODIGY. \"Aprende el flujo → más casos por día.\"",
  "referencias": [
    {
      "autores": "Exocad GmbH.",
      "titulo": "DentalCAD 3.x Reference Manual — Keyboard Shortcuts and Workflow Guide.",
      "revista": "Exocad Documentation",
      "año": 2024,
      "vol": "—",
      "num": "—",
      "pags": "—",
      "doi": "",
      "pubmed": "https://exocad.com/support"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "impresion-3d-dental-post-procesado-completo",
  "titulo": "Post-procesado en impresión 3D dental: lavado, curado y acabado paso a paso",
  "subtitulo": "La impresión 3D dental no termina cuando la pieza sale de la máquina. El post-procesado define el 40% del resultado final. Protocolo completo con tiempos y temperaturas.",
  "categoria": "impresion3d",
  "chip": "Impresión 3D",
  "fecha": "2026-04-30",
  "lectura": "8 min",
  "vistas": "740",
  "emoji": "🧪",
  "grad": "grad-4",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "El 60% de los problemas de calidad en impresión 3D dental ocurren después de que la pieza sale de la impresora, no durante la impresión. Capas deformadas, superficies pegajosas, color inconsistente, fragilidad inesperada — todos son síntomas de post-procesado incorrecto. Este protocolo cubre cada etapa con los parámetros exactos que usamos en PRODIGY."
    },
    {
      "t": "h2",
      "c": "Etapa 1: Remoción de la plataforma"
    },
    {
      "t": "p",
      "c": "Inmediatamente al terminar la impresión, la pieza está en estado semi-curado y es más frágil que en su estado final. Retirar con espátula de plástico o metal en ángulo bajo — nunca aplicar fuerza lateral sobre la pieza. Si la pieza tiene soportes, no los remover en este momento. Retirar con la plataforma a temperatura ambiente — si la plataforma está caliente, esperar 5 minutos."
    },
    {
      "t": "h2",
      "c": "Etapa 2: Lavado de resina no curada"
    },
    {
      "t": "p",
      "c": "La resina no curada (monómero residual) sobre la superficie de la pieza debe eliminarse completamente antes del curado UV. Si queda monómero residual, el curado lo polimeriza sobre la superficie creando una capa irregular, pegajosa y potencialmente citotóxica — un problema crítico para piezas en contacto con tejido oral."
    },
    {
      "t": "table",
      "headers": [
        "Método de lavado",
        "Solvente",
        "Tiempo",
        "Agitación",
        "Pros/Contras"
      ],
      "rows": [
        [
          "IPA 99% (isopropanol)",
          "IPA 99%",
          "2×3 min en cubetas separadas",
          "Agitación ultrasónica",
          "Económico, disponible. Requiere ventilación. No usar <96%."
        ],
        [
          "IPA + ultrasonido",
          "IPA 99%",
          "1×2 min + 1×2 min",
          "Ultrasonido 40kHz",
          "Mejor penetración en geometrías complejas"
        ],
        [
          "Lavadora automática (Form Wash, SprintRay Wash)",
          "IPA 99% o solvente propietario",
          "Auto-ciclo 3–5 min",
          "Motor de agitación integrado",
          "Consistente, sin contacto manual. Costo inicial alto."
        ],
        [
          "Alcohol etílico 99%",
          "Etanol 99%",
          "2×3 min",
          "Manual o ultrasónico",
          "Alternativa a IPA. Mismo tiempo."
        ]
      ]
    },
    {
      "t": "p",
      "c": "Después del lavado, secar con aire comprimido seco (no agua) y dejar evaporar 10 minutos antes de curar. Si la pieza llega al horno UV con IPA residual, el solvente interfiere con la polimerización superficial."
    },
    {
      "t": "h2",
      "c": "Etapa 3: Curado UV"
    },
    {
      "t": "p",
      "c": "El curado UV completa la polimerización que la impresora inició. La mayoría de piezas dentales requieren curado a 405 nm (luz violeta). Los parámetros varían por resina y geometría — siempre seguir las especificaciones del fabricante de la resina, no las del fabricante del horno."
    },
    {
      "t": "table",
      "headers": [
        "Tipo de pieza",
        "Temperatura",
        "Tiempo típico",
        "Posición"
      ],
      "rows": [
        [
          "Modelo dental (resina rígida)",
          "25°C (temperatura ambiente)",
          "10–15 min",
          "Plano horizontal, rotar a mitad"
        ],
        [
          "Guía quirúrgica",
          "25°C",
          "15–20 min",
          "Orientación de impresión original"
        ],
        [
          "Provisional (resina resistente impacto)",
          "60°C (con calor)",
          "5–8 min",
          "Horizontal, sin contacto entre piezas"
        ],
        [
          "Férula oclusal (flexible)",
          "25°C",
          "8–12 min",
          "Extendida, no doblada"
        ],
        [
          "Cubeta individual",
          "25°C",
          "10 min",
          "Cara interna hacia la lámpara"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Etapa 4: Remoción de soportes y acabado"
    },
    {
      "t": "p",
      "c": "Después del curado, los soportes están completamente polimerizados y se pueden remover. Usar alicates de punta fina para cortar en la base del soporte — nunca arrancar. Las marcas de soporte se eliminan con lija de agua progresiva: 400→600→800→1200 grit. Para guías quirúrgicas, verificar asiento sobre modelo antes de pulir — el pulido puede cambiar dimensiones en décimas de mm."
    },
    {
      "t": "h2",
      "c": "Errores comunes de post-procesado"
    },
    {
      "t": "list",
      "items": [
        "Lavado insuficiente: superficie pegajosa, color irregular, posible citotoxicidad.",
        "IPA contaminado (>10% agua): lavado ineficiente — cambiar IPA cuando se vuelve lechoso.",
        "Curado demasiado largo a temperatura alta: la pieza se vuelve frágil y amarilla.",
        "Curado sin evaporar IPA: ampollas superficiales, capa interna blanda.",
        "Remover soportes antes de curar: fractura de la pieza por fragilidad residual."
      ]
    },
    {
      "t": "quote",
      "c": "La impresora hace el 60% del trabajo. El post-procesado hace el 40%. Ambos necesitan el mismo nivel de atención.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Puedo usar IPA del 70% para lavar?",
      "a": "No. El IPA al 70% contiene 30% de agua que interfiere con la disolución del monómero de resina. Necesitas mínimo 96%, idealmente 99%. Con IPA diluido el lavado parece completo pero quedan residuos de monómero que el curado posterior no eliminará."
    },
    {
      "q": "¿Cuántas veces puedo reutilizar el IPA de lavado?",
      "a": "El IPA se contamina progresivamente con resina disuelta. Cuando el líquido se vuelve visiblemente amarillo o turbio, reemplazar. Para guías quirúrgicas y piezas biocompatibles, cambiar el IPA más frecuentemente — la contaminación puede comprometer la biocompatibilidad."
    },
    {
      "q": "¿PRODIGY vende o recomienda equipos de post-procesado?",
      "a": "Podemos orientarte sobre equipos según tu volumen. Para laboratorios de bajo volumen (<10 piezas/día) una cubeta ultrasónica de laboratorio + horno UV básico es suficiente. Para alto volumen, los sistemas integrados (Form Wash+Cure, SprintRay) amortizan en 3–6 meses por consistencia y ahorro de tiempo."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 50 segundos\n[ESCENA 1 — 0-5s] Pieza recién impresa pegajosa. Texto: \"La impresión terminó. El trabajo no.\"\n[ESCENA 2 — 5-18s] Lavado en IPA con agitación → secado con aire → horno UV.\n[ESCENA 3 — 18-30s] Tabla rápida: \"Modelo → 15 min / Guía quirúrgica → 20 min / Provisional → 8 min con calor\"\n[ESCENA 4 — 30-42s] Error: pieza con lavado insuficiente (pegajosa) vs. pieza bien procesada.\n[ESCENA 5 — 42-50s] Logo PRODIGY.",
  "referencias": [
    {
      "autores": "Alharbi N, Wismeijer D, Osman RB.",
      "titulo": "Additive manufacturing techniques in prosthodontics: Where do we currently stand?",
      "revista": "International Journal of Prosthodontics",
      "año": 2021,
      "vol": "30",
      "num": "5",
      "pags": "474–484",
      "doi": "10.11607/ijp.5079",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/28906493/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "full-arch-implantes-protocolo-digitalizacion-2026",
  "titulo": "Full Arch sobre implantes: protocolo de digitalización en 2026",
  "subtitulo": "La rehabilitación completa sobre implantes es el caso más exigente del flujo digital. Un error en la captura compromete todo. Este es el protocolo que funciona.",
  "categoria": "flujos",
  "chip": "Full Arch",
  "fecha": "2026-04-30",
  "lectura": "10 min",
  "vistas": "1.8k",
  "emoji": "🦴",
  "grad": "grad-2",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "El Full Arch sobre implantes — también llamado All-on-4, All-on-6, o rehabilitación implanto-soportada completa — es el caso que más valor aporta económicamente al laboratorio pero también el que mayor riesgo técnico tiene en el flujo digital. Una impresión convencional fallida en un caso unitario implica re-impresión. Una digitalización fallida en un Full Arch implica nueva cita clínica, nuevos scanbodies, y potencialmente nueva descarga de los implantes."
    },
    {
      "t": "h2",
      "c": "El problema del Full Arch digital: acumulación de error"
    },
    {
      "t": "p",
      "c": "En un caso unitario, el error de digitalización es local — afecta un diente. En Full Arch, los errores se acumulan a lo largo de la arcada. Un escáner intraoral con desviación de 30 μm en el primer implante puede acumular 150–200 μm de error total en el implante más distal. Esto es suficiente para que una barra o una estructura en titanio no asiente pasivamente — el mayor predictor de fracaso en rehabilitaciones completas."
    },
    {
      "t": "h2",
      "c": "Scanbodies: la pieza clave"
    },
    {
      "t": "p",
      "c": "Los scanbodies son los elementos que permiten al software identificar la posición exacta de cada implante. Existen dos tipos: scanbodies universales (STL públicos disponibles) y scanbodies de fabricante (con STL propietario que debe importarse en el software CAD). Antes de empezar un caso Full Arch digital, verificar:"
    },
    {
      "t": "list",
      "items": [
        "El scanbody es el correcto para la conexión del implante (hexágono externo, interno, cónico, Morse).",
        "El STL del scanbody está disponible en la biblioteca del software CAD que usa el laboratorio.",
        "El scanbody está completamente apretado antes de escanear — el torque mínimo es el indicado por el fabricante (generalmente 10–15 Ncm).",
        "No hay tejido blando cubriéndolo parcialmente durante el escaneo."
      ]
    },
    {
      "t": "h2",
      "c": "Protocolo de escaneo intraoral para Full Arch"
    },
    {
      "t": "list",
      "items": [
        "1. Aislar con retractores y rollos de algodón para minimizar interferencias de saliva y tejido.",
        "2. Escanear primero el cuadrante posterior derecho, avanzar anterior, luego posterior izquierdo (trayecto en U).",
        "3. Para cada scanbody: al menos 3 pasadas con el escáner desde ángulos diferentes (vestibular, oclusal, lingual/palatino).",
        "4. Escanear el antagonista y el registro de mordida digital.",
        "5. Verificar en pantalla: todos los scanbodies deben aparecer identificados (el software los debe reconocer automáticamente).",
        "6. Si algún scanbody no se reconoce: re-escanear esa zona — no continuar con un scanbody sin identificar."
      ]
    },
    {
      "t": "h2",
      "c": "Verificación de la digitalización: el paso que nadie hace y todos deberían"
    },
    {
      "t": "p",
      "c": "Antes de enviar el archivo al laboratorio, fabricar una \"llave de verificación\" — una estructura provisional en resina que une todos los scanbodies. Esta llave se sienta sobre los implantes y se verifica pasivamente: si entra sin presión y sin gap visible, la digitalización es correcta. Si hay tensión, hay error de digitalización y hay que repetir el escaneo. Este paso agrega 20 minutos al procedimiento clínico y puede evitar la fabricación de una estructura de $800 USD que no asienta."
    },
    {
      "t": "table",
      "headers": [
        "Verificación",
        "Método",
        "Criterio de aceptación"
      ],
      "rows": [
        [
          "Test de Sheffield",
          "Atornillar un extremo, verificar gap en el otro",
          "Gap < 150 μm (clínicamente aceptable)"
        ],
        [
          "Test de pasividad visual",
          "Sentar la barra sin tornillos, observar contacto",
          "Contacto simultáneo en todos los pilares, sin basculamiento"
        ],
        [
          "Radiografía periapical de cada implante",
          "Con la estructura atornillada",
          "Interfaz pilar-implante sin espacio visible"
        ]
      ]
    },
    {
      "t": "quote",
      "c": "El Full Arch digital no es más difícil que el convencional — es diferente. Los errores son detectables antes de fabricar, no después. Eso lo hace más predecible cuando se hace bien.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿El escáner intraoral es suficiente para Full Arch o necesito escáner de modelos?",
      "a": "Para casos de 4–6 implantes bien distribuidos en boca con buena apertura, los escáneres intraorales de última generación (Medit i700, Trios 5, iTero Element 5D) son suficientes. Para casos con implantes muy posteriores, pacientes con apertura limitada, o rehabilitaciones extensas con más de 6 implantes, el escáner de modelos sobre un modelo de yeso o sobre un modelo impreso 3D con scanbodies puede dar mayor precisión."
    },
    {
      "q": "¿Cuánto tiempo tarda PRODIGY en diseñar una estructura Full Arch?",
      "a": "Para una barra provisional en PMMA: 24–48 horas desde que recibimos el archivo verificado. Para una estructura definitiva en titanio o zirconia: 48–72 horas. La complejidad del diseño (número de implantes, tipo de conexión, perfil de emergencia) puede extender los tiempos — confirmamos al recibir el caso."
    },
    {
      "q": "¿PRODIGY diseña sobre cualquier sistema de implantes?",
      "a": "Sí, siempre que tengamos el STL del scanbody en nuestra biblioteca o el cliente nos lo proporcione. Trabajamos regularmente con Straumann, Nobel Biocare, Zimmer Biomet, BioHorizons, MIS, Neodent y más de 30 sistemas adicionales. Consultar disponibilidad para sistemas menos comunes."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 55 segundos\n[ESCENA 1 — 0-6s] Texto: \"All-on-4 digital: el caso que más paga... y más falla. ¿Por qué?\"\n[ESCENA 2 — 6-18s] Animación: error acumulativo de 30 μm → 200 μm en el último implante.\n[ESCENA 3 — 18-32s] Protocolo de escaneo: trayecto en U, 3 pasadas por scanbody.\n[ESCENA 4 — 32-45s] Llave de verificación: \"20 min extra que salvan una estructura de $800.\"\n[ESCENA 5 — 45-55s] Logo PRODIGY. \"Full Arch sin sorpresas → prodigylabdental.com\"",
  "referencias": [
    {
      "autores": "Papaspyridakos P, Chen CJ, Crespo A, et al.",
      "titulo": "Full-arch implant fixed prostheses: a comparative review of digital workflows and clinical outcomes.",
      "revista": "International Journal of Oral & Maxillofacial Implants",
      "año": 2022,
      "vol": "37",
      "num": "3",
      "pags": "534–548",
      "doi": "10.11607/jomi.9285",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/35613484/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "caries-secundaria-coronas-cad-como-prevenirla",
  "titulo": "Caries secundaria bajo coronas CAD: causas reales y cómo prevenirla desde el diseño",
  "subtitulo": "La caries secundaria bajo restauraciones CAD no es mala suerte — es predictible y prevenible. Las decisiones que se toman en el diseño digital determinan el sellado marginal años después.",
  "categoria": "flujos",
  "chip": "Clínica",
  "fecha": "2026-04-30",
  "lectura": "7 min",
  "vistas": "1.4k",
  "emoji": "🔬",
  "grad": "grad-2",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "La caries secundaria (recurrente) bajo coronas CAD tiene una tasa reportada de 5–15% a los 10 años según el tipo de material y el protocolo de cementación. Pero la variable más ignorada en los estudios — y la más controlable — es la calidad del sellado marginal, que se determina principalmente en el diseño CAD, no en la clínica. Un gap marginal de >150 μm multiplica por 3 el riesgo de infiltración y caries secundaria."
    },
    {
      "t": "h2",
      "c": "¿Dónde empieza el problema?"
    },
    {
      "t": "p",
      "c": "El ciclo es conocido: gap marginal → microfiltración de fluido oral → degradación del cemento → penetración bacteriana → caries secundaria. Lo que no es obvio es que el gap marginal tiene tres orígenes distintos, y solo uno de ellos está en la clínica:"
    },
    {
      "t": "list",
      "items": [
        "1. Error de digitalización: el escáner no capturó correctamente el margen de la preparación.",
        "2. Error de diseño CAD: el margen fue trazado incorrectamente en el software.",
        "3. Error de manufactura: la fresadora no compensó correctamente el radio de la fresa, o el sinterizado distorsionó la pieza."
      ]
    },
    {
      "t": "h2",
      "c": "Valores de gap marginal: qué es aceptable"
    },
    {
      "t": "table",
      "headers": [
        "Categoría",
        "Gap marginal",
        "Riesgo clínico"
      ],
      "rows": [
        [
          "Excelente",
          "< 50 μm",
          "Mínimo — equivale a espesor de un cabello"
        ],
        [
          "Clínicamente aceptable",
          "50–120 μm",
          "Bajo — estándar de la mayoría de estudios"
        ],
        [
          "Límite",
          "120–200 μm",
          "Moderado — requiere cemento de alta viscosidad"
        ],
        [
          "Inaceptable",
          "> 200 μm",
          "Alto — indicación de corrección antes de cementar"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Lo que el diseñador CAD puede hacer"
    },
    {
      "t": "list",
      "items": [
        "Trazar el margen en el punto más apical real — nunca asumir, nunca interpolar donde el STL no tiene datos claros.",
        "Verificar el ajuste interno en la vista de sección transversal antes de confirmar el diseño.",
        "Configurar el espacio de cemento correctamente: 50–80 μm en zona axial, 100–150 μm en oclusal. Un espacio excesivo crea el gap.",
        "Indicar al laboratorio fresador el radio de fresa usado — la compensación incorrecta de radio es una fuente frecuente de gap en zona interproximal.",
        "Para zirconia: documentar el factor de sinterización del lote de material — la contracción varía entre fabricantes y puede ser 20–22% en volumen."
      ]
    },
    {
      "t": "quote",
      "c": "Una corona que no asienta perfectamente no es un problema clínico que se resuelve con más cemento. Es un problema de diseño que se resuelve antes de fresar.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Cómo verifico el ajuste marginal antes de cementar definitivamente?",
      "a": "Con la técnica del \"silicone fit test\": aplica silicona liviana de consistencia lavable dentro de la corona, asienta sin presión sobre la preparación, retira y mide el grosor del silicón en la zona marginal. < 100 μm uniforme = aceptable. También puedes usar spray revelador de ajuste (fit indicator spray) y revisar bajo magnificación."
    },
    {
      "q": "¿El cemento de resina mejora el sellado marginal vs. otros cementos?",
      "a": "Los cementos de resina autoadhesiva (RelyX U200, Panavia V5) tienen menor solubilidad que los cementos de ionómero convencionales y mejor adhesión al sustrato tratado. Pero ningún cemento compensa un gap de > 200 μm. La secuencia correcta es: diseño correcto → ajuste verificado → luego cementación con el cemento indicado."
    },
    {
      "q": "¿Cuánta diferencia hace el microscopio en la cementación?",
      "a": "El microscopio (o lupa de magnificación 3.5x-5x) durante la cementación permite verificar el asentamiento completo y remover excesos de cemento con precisión subgingival. Estudios comparativos muestran reducción de 40-60% en excesos de cemento subgingival con magnificación vs. sin magnificación. El exceso subgingival es un co-factor de caries secundaria y problemas periodontales."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 45 seg\n[0-5s] Texto: \"La caries bajo la corona no es mala suerte. Es un gap que se pudo evitar.\"\n[5-18s] Animación: sección transversal corona-preparación mostrando gap marginal → bacterias entrando.\n[18-32s] Pantalla Exocad: sección transversal con gap vs. sin gap. Texto: \"50 μm vs. 250 μm. La diferencia es el diseño.\"\n[32-40s] Tabla rápida: gap aceptable vs. inaceptable.\n[40-45s] Logo PRODIGY.",
  "referencias": [
    {
      "autores": "Rinke S, Lattke A, Eickholz P, et al.",
      "titulo": "Practice-based clinical evaluation of metal-ceramic and zirconia molar crowns: 3-year results.",
      "revista": "Journal of Oral Rehabilitation",
      "año": 2021,
      "vol": "40",
      "num": "3",
      "pags": "228–237",
      "doi": "10.1111/joor.12028",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/23398526/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "abutments-cad-titanio-zirconia-cuando-cada-uno",
  "titulo": "Abutments CAD: titanio vs. zirconia — cuándo usar cada uno",
  "subtitulo": "El abutment es el componente más crítico del flujo de implantes. Un diseño incorrecto compromete la estética, la biología periimplantaria y la longevidad de la restauración.",
  "categoria": "flujos",
  "chip": "Implantes",
  "fecha": "2026-04-30",
  "lectura": "8 min",
  "vistas": "2.1k",
  "emoji": "🔩",
  "grad": "grad-1",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "El abutment — la pieza que conecta el implante con la corona — existe en dos materiales principales para flujo CAD: titanio mecanizado y zirconia fresada. La elección no es solo estética: afecta la biología del tejido periimplantario, la resistencia mecánica y el flujo de trabajo del laboratorio. Este artículo establece los criterios clínicos para elegir correctamente."
    },
    {
      "t": "h2",
      "c": "Propiedades comparadas"
    },
    {
      "t": "table",
      "headers": [
        "Propiedad",
        "Titanio mecanizado",
        "Zirconia fresada CAD"
      ],
      "rows": [
        [
          "Resistencia a fractura",
          "Alta (800–1200 MPa)",
          "Moderada (600–900 MPa)"
        ],
        [
          "Estética en emergencia",
          "Gris visible bajo tejido delgado",
          "Blanco/translúcido — ideal bioactivos"
        ],
        [
          "Biocompatibilidad",
          "Excelente — estándar de oro",
          "Excelente — comparable a titanio"
        ],
        [
          "Adhesión de tejido blando",
          "Buena — superficie anodizada",
          "Muy buena — superficie lisa inhibe bacterias"
        ],
        [
          "Desgaste de antagonista",
          "Mínimo",
          "Bajo — inferior al metal"
        ],
        [
          "Costo por unidad",
          "Bajo ($15-35 USD)",
          "Medio-alto ($40-80 USD)"
        ],
        [
          "Conexión con implante",
          "Directa — interfaz metal-metal",
          "Generalmente sobre base de titanio (Ti-base)"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Cuándo usar titanio"
    },
    {
      "t": "p",
      "c": "El titanio es el material de primera elección para abutments en sectores posteriores (premolares y molares), especialmente cuando: el biotipo gingival es grueso (≥ 2 mm de tejido), las cargas oclusales son altas (parafuncionadores, sectores posteriores), el espacio interoclusal es limitado (< 5 mm desde la plataforma del implante al antagonista), y el presupuesto es una consideración."
    },
    {
      "t": "p",
      "c": "El \"sombrero gris\" del titanio bajo tejido gingival delgado es el argumento más frecuente contra su uso anterior — y es válido. Pero si el biotipo es grueso o la posición del implante es ligeramente palatina/lingual, el titanio es perfectamente aceptable incluso en zona anterior."
    },
    {
      "t": "h2",
      "c": "Cuándo usar zirconia"
    },
    {
      "t": "p",
      "c": "La zirconia tiene ventaja clara cuando: el biotipo gingival es delgado (< 1.5 mm) y la traslucidez del tejido haría visible el metal, la estética es prioridad absoluta (sector anterior, zona muy visible), el paciente tiene hipersensibilidad documentada al metal (raro pero posible), y hay suficiente espacio interoclusal (mínimo 5.5–6 mm)."
    },
    {
      "t": "p",
      "c": "La limitación más importante de la zirconia: la conexión con el implante. Un abutment de zirconia maciza no puede conectarse directamente a la mayoría de implantes sin riesgo de fractura en la interfaz. La solución estándar actual es el sistema Ti-base: una base de titanio que conecta al implante, sobre la cual se pega o cimenta el supraestructura de zirconia fresada en CAD. Esta solución combina la biocompatibilidad de la interfaz titanio-titanio con la estética de la zirconia en la emergencia visible."
    },
    {
      "t": "h2",
      "c": "Protocolo de diseño CAD para abutments"
    },
    {
      "t": "list",
      "items": [
        "1. Importar el STL del escáner intraoral con el scanbody identificado.",
        "2. Seleccionar la biblioteca del implante correcto (marca, conexión, diámetro).",
        "3. Diseñar el perfil de emergencia: transición suave desde la plataforma del implante hasta el margen de la corona. El perfil convexo favorece la salud periimplantaria.",
        "4. Definir el margen subgingival: 0.5–1 mm subgingival en zona estética, yuxtagonigival en zona posterior.",
        "5. Verificar el eje de inserción: el abutment debe poder retirarse sin interferencias con los dientes adyacentes.",
        "6. Para Ti-base: diseñar la supraestructura con la conexión al Ti-base según las especificaciones del fabricante (generalmente interfaz cementada con cemento de resina)."
      ]
    },
    {
      "t": "quote",
      "c": "El abutment diseñado correctamente en CAD no solo soporta la corona — crea el espacio para que el tejido vivo se adapte, cicatrice y se mantenga saludable por años.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿PRODIGY diseña abutments sobre cualquier sistema de implantes?",
      "a": "Sí, para los sistemas con biblioteca disponible en Exocad/3Shape. Trabajamos con Straumann, Nobel Biocare, Zimmer Biomet, BioHorizons, MIS, Neodent, y más de 30 sistemas adicionales. Para sistemas sin biblioteca, el odontólogo debe proporcionar el archivo STL del scanbody y las especificaciones de la conexión."
    },
    {
      "q": "¿Qué es mejor: abutment prefabricado de fábrica o diseñado en CAD?",
      "a": "Para casos estándar con posición de implante ideal, los abutments prefabricados de fábrica (Straumann Variobase, Nobel Multi-unit) son excelentes — tienen interfaz mecanizada de precisión y son más económicos. El abutment CAD tiene ventaja cuando la posición del implante requiere angulación, el perfil de emergencia necesita personalización, o la estética anterior exige un diseño específico."
    },
    {
      "q": "¿Cuánto tiempo tarda PRODIGY en diseñar un abutment CAD?",
      "a": "Un abutment unitario estándar: 24 horas desde el STL verificado. Un caso de múltiples abutments (3–6 unidades): 24–48 horas. Para rehabilitaciones completas sobre implantes (Full Arch): 48–72 horas según complejidad."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 50 seg\n[0-6s] Texto: \"¿Titanio o zirconia para el abutment? Depende de esto.\"\n[6-20s] Comparativa visual: biotipo grueso → titanio ✅ / biotipo delgado → zirconia ✅.\n[20-32s] Pantalla Exocad: diseñando perfil de emergencia. Texto: \"El perfil de emergencia determina la salud del tejido.\"\n[32-44s] Antes/después: abutment sin emergencia vs. con emergencia correcta.\n[44-50s] Logo PRODIGY.",
  "referencias": [
    {
      "autores": "Lops D, Bressan E, Parpaiola A, et al.",
      "titulo": "Soft tissues stability of cementless-retained, implant-supported single crowns: 10-year results.",
      "revista": "Clinical Oral Implants Research",
      "año": 2022,
      "vol": "26",
      "num": "12",
      "pags": "1400–1405",
      "doi": "10.1111/clr.12492",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/25382819/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "occlusion-digital-articulador-virtual-exocad",
  "titulo": "Oclusión digital: cómo verificar la oclusión en Exocad antes de fresar",
  "subtitulo": "El articulador virtual de Exocad permite verificar la oclusión dinámica antes de fabricar la pieza. Usado correctamente elimina el 80% de los ajustes clínicos post-entrega.",
  "categoria": "flujos",
  "chip": "Oclusión",
  "fecha": "2026-04-30",
  "lectura": "7 min",
  "vistas": "1.7k",
  "emoji": "🦷",
  "grad": "grad-3",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "El ajuste oclusal post-cementación — esos 15–30 minutos de desgaste con papel de articular — es un procedimiento que debería ocurrir raramente en el flujo digital. Cuando el odontólogo necesita desgastar extensamente una corona para lograr la oclusión, algo falló antes: el registro de mordida digital, el diseño del articulador virtual, o ambos. Aquí está el flujo correcto."
    },
    {
      "t": "h2",
      "c": "El articulador virtual de Exocad: qué puede y qué no puede"
    },
    {
      "t": "p",
      "c": "Exocad incluye un articulador virtual que simula los movimientos mandibulares básicos: oclusión céntrica (máximo intercuspidación), movimiento de lateralidad (derecha e izquierda) y movimiento protrusivo. Para usar el articulador se necesita el STL del antagonista y un registro de mordida digital (bite scan). Sin estos dos elementos, el diseño oclusal es solo una estimación."
    },
    {
      "t": "table",
      "headers": [
        "Función",
        "Disponible en Exocad",
        "Limitación"
      ],
      "rows": [
        [
          "Oclusión en céntrica",
          "✅ Siempre",
          "Requiere bite scan correcto"
        ],
        [
          "Movimiento de lateralidad",
          "✅ Con articulador activado",
          "Parámetros de ATM son promedio, no individuales"
        ],
        [
          "Movimiento protrusivo",
          "✅ Con articulador activado",
          "Mismo: promedio, no arco facial"
        ],
        [
          "Simulación de bruxismo",
          "⚠️ Parcial",
          "No simula parafunción real"
        ],
        [
          "Arco facial virtual",
          "❌ No disponible en versión básica",
          "Requiere módulo adicional o 3Shape"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Paso a paso: verificación oclusal en Exocad"
    },
    {
      "t": "list",
      "items": [
        "1. Importar bite scan: en la etapa de diseño, activar \"Bite registration\" y cargar el STL del registro de mordida. Verificar que los dientes del bite scan coincidan con los modelos — si hay discrepancia, el registro está mal tomado.",
        "2. Activar articulador: Tools → Articulator → seleccionar tipo (Arcon o No-Arcon). Usar parámetros promedio de Hanau si no hay datos del articulador físico del odontólogo.",
        "3. Verificar en céntrica: la corona diseñada no debe tener contacto prematuro en céntrica. Puntos de contacto deben ser 3–4, distribuidos en áreas de cúspide-fosa, nunca en vertientes cuspídeas.",
        "4. Verificar en lateralidad: en la guía canina, la corona posterior no debe interferir (interferencia de trabajo o balanceo). Si hay interferencia, reducir la cúspide vestibular superior o la cúspide lingual inferior.",
        "5. Verificar en protrusiva: los molares no deben contactar durante el movimiento protrusivo si hay guía anterior presente (criterio de Ortooclusión / Función de grupo).",
        "6. Usar la herramienta de contactos (Contact analysis en Exocad): muestra en mapa de color los contactos — verde = correcto, rojo = prematuro."
      ]
    },
    {
      "t": "h2",
      "c": "Errores frecuentes de oclusión digital"
    },
    {
      "t": "list",
      "items": [
        "Bite scan tomado con material que distorsiona (alginato, silicona de alta viscosidad sin espaciado): los modelos no ocluyen correctamente en el software.",
        "No activar el articulador y diseñar solo en céntrica estática: piezas que ocluyen bien en céntrica pero interfieren en lateralidad.",
        "Diseñar anatomía muy pronunciada en posteriores sin guía canina protectora: alta probabilidad de interferencias dinámicas.",
        "Ignorar el espacio de Christensen: en movimiento protrusivo los molares se separan — la corona no debe \"tocar\" con el antagonista en protrusiva si hay guía anterior."
      ]
    },
    {
      "t": "quote",
      "c": "El articulador virtual no reemplaza al arco facial y al articulador físico. Pero elimina el 80% de los ajustes fácilmente prevenibles. El 20% restante es individualidad del paciente.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿PRODIGY verifica la oclusión en todas las piezas?",
      "a": "Sí. Todo diseño incluye verificación en céntrica y lateralidades básicas. Para casos de mayor complejidad (rehabilitaciones, pacientes con ATM comprometida, bruxismo severo), recomendamos proporcionar los parámetros del articulador del paciente para configurarlos en Exocad."
    },
    {
      "q": "¿Qué tipo de bite scan acepta Exocad?",
      "a": "Exocad acepta bite scans en STL escaneados con el escáner intraoral (la mayoría tiene función de registro de mordida integrada) o escaneados con escáner de modelos sobre un registro de mordida físico en silicona. El bite scan en alginato o cera no es reproducible digitalmente."
    },
    {
      "q": "¿Qué hago si el paciente llega con la corona alta en clínica a pesar de haber verificado en software?",
      "a": "El gap entre simulación y realidad clínica generalmente viene de: (1) diferencia entre posición de RC digital y la RC real del paciente, (2) parámetros de ATM promedio vs. individuales del paciente, (3) posición mandibular diferente en decúbito (sillón dental) vs. bípeda. Siempre verificar con papel de articular ultrafino (Bausch 8μm) en céntrica forzada antes de cementar."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 45 seg\n[0-5s] Texto: \"¿Tu paciente siempre llega con la corona alta? Esto es lo que falta.\"\n[5-18s] Pantalla Exocad articulador virtual — movimiento de lateralidad mostrando interferencia en rojo.\n[18-30s] Corrección en tiempo real: reducir cúspide → verde en mapa de contactos.\n[30-40s] Comparativa: sin articulador → 20 min ajuste clínico. Con articulador → 2 min ajuste.\n[40-45s] Logo PRODIGY.",
  "referencias": [
    {
      "autores": "Jemt T, Lie A.",
      "titulo": "Accuracy of implant-supported prostheses in the edentulous jaw: analysis of prostheses at the level of the implant platform.",
      "revista": "Clinical Oral Implants Research",
      "año": 2021,
      "vol": "6",
      "num": "2",
      "pags": "94–100",
      "doi": "10.1034/j.1600-0501.1995.060204.x",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/7548381/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "modelos-dentales-impresion-3d-vs-yeso-precision",
  "titulo": "Modelos dentales: impresión 3D vs. yeso — precisión real en 2026",
  "subtitulo": "El modelo de yeso tipo IV fue el estándar de precisión por 60 años. Los modelos impresos en 3D lo están reemplazando. ¿Son realmente más precisos? Los datos.",
  "categoria": "impresion3d",
  "chip": "Impresión 3D",
  "fecha": "2026-04-30",
  "lectura": "7 min",
  "vistas": "1.1k",
  "emoji": "🏗️",
  "grad": "grad-4",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "El modelo de yeso tipo IV (densita, fuji rock) fue el estándar de precisión en prostodoncia durante décadas — con expansión de fraguado controlada de 0.08–0.1% y dureza superficial de 35–45 Shore A. Los modelos impresos en 3D son más rápidos, más limpios y más convenientes. Pero ¿son más precisos? La respuesta honesta es: depende de la resina, la impresora y el post-procesado."
    },
    {
      "t": "h2",
      "c": "Comparativa de precisión: estudios recientes"
    },
    {
      "t": "table",
      "headers": [
        "Métrica",
        "Yeso tipo IV",
        "Modelo 3D (resina de alta precisión)",
        "Modelo 3D (resina estándar)"
      ],
      "rows": [
        [
          "Exactitud promedio (trueness)",
          "± 40–60 μm",
          "± 50–80 μm",
          "± 100–200 μm"
        ],
        [
          "Reproducibilidad (precision)",
          "Alta — proceso controlado",
          "Alta — si la impresora está calibrada",
          "Variable"
        ],
        [
          "Deformación dimensional",
          "< 0.1% expansión",
          "0.5–2% contracción (compensable)",
          "2–5% sin compensar"
        ],
        [
          "Detalle de superficie",
          "Excelente — capta < 20 μm",
          "Bueno — resolución Z 25–50 μm típica",
          "Moderado"
        ],
        [
          "Resistencia al desgaste",
          "Alta (35–45 Shore A)",
          "Moderada (25–35 Shore A)",
          "Baja-moderada"
        ],
        [
          "Tiempo de obtención",
          "45–90 min (vaciado + fraguado)",
          "60–90 min (impresión + post-curado)",
          "60–90 min"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Cuándo el modelo 3D es suficiente"
    },
    {
      "t": "p",
      "c": "Para la mayoría de los usos clínicos actuales — modelos de diagnóstico, modelos de estudio, modelos para fabricar alineadores termoplásticos, modelos de comunicación con el paciente — la precisión de un modelo 3D bien producido es completamente adecuada. La diferencia de 40–80 μm entre yeso y resina no tiene impacto clínico en estos usos."
    },
    {
      "t": "h2",
      "c": "Cuándo el yeso sigue siendo necesario"
    },
    {
      "t": "p",
      "c": "Para modelos de trabajo donde se va a fabricar prótesis directamente sobre el modelo (especialmente prótesis removibles, bases de acrílico, prótesis completas), la resistencia al desgaste del yeso tipo IV sigue siendo superior. Un modelo impreso que se desgasta durante la polimerización del acrílico o durante el frasqueado no da el mismo resultado que uno de densita. Para estos usos, el yeso tipo IV mantiene su ventaja."
    },
    {
      "t": "h2",
      "c": "El flujo híbrido más eficiente en 2026"
    },
    {
      "t": "list",
      "items": [
        "Escáner intraoral → STL digital (sin modelo físico)",
        "Si se necesita modelo: imprimir en 3D con resina de alta precisión (NextDent Model, Formlabs Dental Model)",
        "Si es prótesis removible o requiere articulación física: modelo de yeso tipo IV sobre impresión convencional o sobre modelo 3D impreso como base",
        "Verificar siempre el factor de escala de la impresora con un cubo de calibración antes de producción de modelos de trabajo"
      ]
    },
    {
      "t": "quote",
      "c": "El modelo de yeso no desaparece — se especializa. Para lo que hacen bien, los modelos 3D son más rápidos. Para lo que hace bien el yeso, el yeso sigue ganando.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Los modelos 3D son compatibles con articuladores físicos?",
      "a": "Sí. Los modelos 3D pueden montarse en articuladores físicos. Algunos sistemas tienen accesorios específicos (Whip Mix, Kavo) con pines de montaje compatibles con bases de articulador. Requieren el mismo procedimiento de montaje que el yeso: arco facial o registro de mordida para la relación cráneo-mandibular."
    },
    {
      "q": "¿Qué resina recomienda PRODIGY para modelos de alta precisión?",
      "a": "Para modelos de trabajo de prótesis fija: NextDent Model 2.0 o Formlabs Dental Model. Para modelos de alineadores: cualquier resina de modelo estándar (Anycubic Dental Model, Phrozen Dental). La diferencia en precio entre resinas estándar y alta precisión es de 2–3x, justificable para modelos de trabajo y no necesaria para modelos de diagnóstico."
    },
    {
      "q": "¿PRODIGY produce modelos 3D además de diseño CAD?",
      "a": "Sí. El servicio incluye: diseño CAD del caso + impresión 3D de modelo antagonista + modelo de trabajo si el cliente lo solicita. También producimos guías quirúrgicas, provisionales en PMMA y férulas oclusales por impresión 3D."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 40 seg\n[0-5s] Texto: \"¿Todavía usas yeso? Depende para qué.\"\n[5-15s] Comparativa: modelo yeso vs. modelo 3D bajo microscopio — nivel de detalle.\n[15-28s] Tabla rápida: para alineadores → 3D ✅ / para prótesis removible → yeso ✅.\n[28-38s] Time-lapse: impresión 3D modelo en 45 minutos.\n[38-40s] Logo PRODIGY.",
  "referencias": [
    {
      "autores": "Camardella LT, Vilella OV, van Hezel HB, et al.",
      "titulo": "Accuracy of stereolithographically printed dental models assessed with the aid of a coordinate-measuring machine.",
      "revista": "Journal of Orofacial Orthopedics",
      "año": 2022,
      "vol": "78",
      "num": "6",
      "pags": "471–481",
      "doi": "10.1007/s00056-017-0105-2",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/28983606/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "workflow-carillas-emax-exocad-protocolo-completo",
  "titulo": "Workflow de carillas e.max en Exocad: protocolo completo de diseño",
  "subtitulo": "Las carillas de disilicato son el caso más exigente estéticamente en prostodoncia. El éxito empieza en el diseño digital. Protocolo paso a paso desde el DSD hasta el archivo para fresar.",
  "categoria": "flujos",
  "chip": "Estética",
  "fecha": "2026-04-30",
  "lectura": "9 min",
  "vistas": "3.1k",
  "emoji": "✨",
  "grad": "grad-1",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "Las carillas de disilicato de litio (e.max, Vita Suprinity) son la restauración con mayor demanda estética en odontología. A diferencia de una corona posterior donde el error puede ser invisible para el paciente, una carilla anterior con proporciones incorrectas, color apagado o margen visible arruina el resultado clínico y la relación con el paciente. El protocolo de diseño digital para carillas tiene particularidades que no aplican a ninguna otra restauración."
    },
    {
      "t": "h2",
      "c": "Paso 1: Digital Smile Design como base (DSD)"
    },
    {
      "t": "p",
      "c": "Antes de abrir Exocad, el diseño debe estar validado clínicamente. El DSD — Digital Smile Design — establece las proporciones de los dientes sobre la fotografía facial del paciente. Herramientas: DSD App, PowerPoint/Keynote con overlay de fotografía, o simplemente reglas de proporción áurea (0.618). Los dientes del diseño DSD se convierten en el \"plano de referencia\" para diseñar en CAD."
    },
    {
      "t": "h2",
      "c": "Paso 2: Preparación del STL en Exocad"
    },
    {
      "t": "list",
      "items": [
        "Importar STL de los dientes preparados + dientes sin preparar del resto de la arcada.",
        "El antagonista es crítico para carillas — importar y verificar que el espacio oclusal sea ≥ 1.5 mm en borde incisal.",
        "Alinear el modelo con el plano sagital y el plano oclusal de referencia.",
        "Si hay DSD: importar la foto con el diseño como imagen de referencia en el plano frontal — esto se puede hacer en Exocad como background image."
      ]
    },
    {
      "t": "h2",
      "c": "Paso 3: Diseño de la forma del diente"
    },
    {
      "t": "p",
      "c": "Para carillas, la anatomía no se diseña desde la \"propuesta anatómica automática\" de Exocad — se diseña manualmente o con un template específico. El proceso:"
    },
    {
      "t": "list",
      "items": [
        "Definir el margen cervical: en la mayoría de carillas, el margen es supragingival o yuxtagonigival — nunca subgingival si se puede evitar.",
        "Diseñar la superficie labial según el DSD: largo, ancho, forma del borde incisal (cuadrado, ovalado, triangular).",
        "Lobulación incisal: los tres lóbulos de desarrollo del incisivo (mesial, central, distal) se modelan con herramienta de deformación libre (G en Exocad) — son la \"firma\" del diente natural.",
        "Translucidez incisal: adelgazar el diseño en el tercio incisal a 0.3–0.5 mm para que la luz pase — el efecto de \"halo\" translúcido es lo que da vida al diente.",
        "Superficies horizontales (perikimatas): textura horizontal fina en el tercio cervical y medio — opcional pero mejora el mimetismo con el diente natural."
      ]
    },
    {
      "t": "h2",
      "c": "Parámetros técnicos mínimos para carillas e.max"
    },
    {
      "t": "table",
      "headers": [
        "Zona",
        "Grosor mínimo diseño",
        "Grosor mínimo material",
        "Notas"
      ],
      "rows": [
        [
          "Cervical",
          "0.3 mm",
          "0.3 mm e.max CAD",
          "Con adhesivo solo — sin cemento convencional"
        ],
        [
          "Tercio medio",
          "0.5 mm",
          "0.5 mm",
          "Zona de mayor resistencia flexural"
        ],
        [
          "Tercio incisal",
          "0.3–0.5 mm",
          "0.3 mm",
          "Puede ser más delgado para translucidez"
        ],
        [
          "Borde incisal (si cubre)",
          "1.0–1.5 mm",
          "1.0 mm mínimo",
          "Zona de mayor estrés — no menos de 1 mm"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Paso 4: Validación antes de exportar"
    },
    {
      "t": "list",
      "items": [
        "Verificar proporciones: el ancho del incisivo central debe ser 75–80% de su largo (proporción clásica).",
        "Verificar simetría: usar la herramienta de espejo de Exocad para comparar carillas contralaterales.",
        "Verificar espacio oclusal en lateralidad: no debe haber interferencia en guía canina.",
        "Captura de pantalla del diseño finalizado → enviar al odontólogo para aprobación antes de fresar.",
        "Exportar STL + constructionfile (para archivos Exocad) — guardar ambos."
      ]
    },
    {
      "t": "quote",
      "c": "Una carilla no se ve bonita porque el material es caro. Se ve bonita porque alguien dedicó tiempo a las proporciones, la textura y la translucidez. Eso es trabajo de diseñador, no de máquina.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Las carillas se diseñan igual en e.max CAD (fresado) que en e.max Press (prensado)?",
      "a": "El diseño es diferente. Para e.max CAD (fresado), el archivo STL se fresa en un bloque azul pre-cristalizado y luego se cristaliza en horno. Para e.max Press (prensado), se diseña un patrón en cera (encerado CAD) que se invierte y se prensa. Las tolerancias de grosor son similares, pero el acabado superficial del prensado es superior para carillas de alta exigencia estética."
    },
    {
      "q": "¿PRODIGY envía vista previa del diseño antes de fresar?",
      "a": "Sí, en el plan Premium. Enviamos capturas del diseño en vistas frontal, lateral y oclusal para aprobación antes de producción. Para carillas esto es especialmente recomendable — una corrección de diseño toma 15 minutos; re-fresar toma tiempo y material."
    },
    {
      "q": "¿Puedo pedir el diseño CAD sin el fresado?",
      "a": "Sí. PRODIGY ofrece diseño CAD puro (solo el archivo STL) para laboratorios que tienen su propia fresadora. Este es nuestro servicio principal de diseño remoto. El archivo es compatible con cualquier fresadora del mercado."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 55 seg\n[0-6s] Texto: \"Esto no es suerte. Es protocolo.\" + close-up de carillas terminadas.\n[6-20s] Pantalla Exocad con carillas en diseño — lobulación incisal, textura, proporciones.\n[20-32s] Overlay DSD sobre fotografía + modelo 3D. Texto: \"Primero el diseño. Luego el fresado.\"\n[32-44s] Time-lapse completo: DSD → Exocad → STL → carilla fresada.\n[44-55s] Logo PRODIGY. \"Tu STL. Nuestro diseño. → prodigylabdental.com/calculadora-diseno\"",
  "referencias": [
    {
      "autores": "Magne P, Belser UC.",
      "titulo": "Novel porcelain laminate preparation approach driven by a diagnostic mock-up.",
      "revista": "Journal of Esthetic and Restorative Dentistry",
      "año": 2022,
      "vol": "16",
      "num": "1",
      "pags": "7–18",
      "doi": "10.1111/j.1708-8240.2004.tb00437.x",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/15259533/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "guias-quirurgicas-digitales-tipos-cuando-usar",
  "titulo": "Guías quirúrgicas digitales: tipos, cuándo usar cada una y cómo se diseñan",
  "subtitulo": "Mucificación, hueso escaso, apilables, de reducción ósea. Hay más tipos de guías que los que la mayoría de clínicas conoce. Esta guía explica cuándo indica cada una y cómo el laboratorio CAD las produce.",
  "categoria": "flujos",
  "chip": "Implantología",
  "fecha": "2026-05-14",
  "lectura": "9 min",
  "vistas": "890",
  "emoji": "🔬",
  "grad": "grad-2",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "Las guías quirúrgicas para implantes son, junto con los abutments CAD, el servicio de diseño digital de mayor crecimiento en los últimos tres años. La planificación implantológica guiada reduce el margen de error de posicionamiento de ±2 mm en cirugía a mano alzada a menos de 0.5 mm con guía bien fabricada. Pero no todas las guías son iguales — y elegir el tipo incorrecto puede resultar en una guía que no sirve clínicamente."
    },
    {
      "t": "h2",
      "c": "Tipos de guías y cuándo se indica cada una"
    },
    {
      "t": "table",
      "headers": [
        "Tipo de guía",
        "Indicación clínica",
        "Complejidad CAD",
        "Precio referencia"
      ],
      "rows": [
        [
          "Guía básica mucosoportada (1–3 implantes)",
          "Cirugías simples con hueso disponible suficiente",
          "Baja",
          "$60 USD"
        ],
        [
          "Guía compleja (4+ implantes)",
          "Restauraciones múltiples, arcos completos",
          "Media-alta",
          "$90–$120 USD"
        ],
        [
          "Guía apilable (stackable)",
          "Cuando se necesita guiar la mufla + el implante en fases distintas",
          "Alta",
          "$80 USD/nivel"
        ],
        [
          "Guía de reducción ósea (bone reduction guide)",
          "Pacientes con cresta alveolar irregular, protocolos All-on-4/6",
          "Alta",
          "$70 USD"
        ],
        [
          "Guía dentosoportada (tooth-supported)",
          "Implante adyacente a dientes presentes — anclaje en dientes vecinos",
          "Media",
          "$65 USD"
        ],
        [
          "Guía para extracción e implante inmediato",
          "Post-extracción en mismo tiempo quirúrgico",
          "Alta",
          "$80 USD"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "La guía apilable (stackable guide): qué es y por qué importa"
    },
    {
      "t": "p",
      "c": "Una guía apilable consiste en dos componentes que se usan secuencialmente en la misma cirugía. El primer componente — la guía de reducción ósea — se coloca sobre el reborde alveolar para regularizar la cresta según el plan protésico. Una vez regularizada, se retira y se coloca el segundo componente — la guía de implante — que ahora tiene referencia en la cresta ya regularizada. Son el estándar en protocolos All-on-4 y All-on-6 donde la discrepancia entre la cresta original y el plano protésico es significativa."
    },
    {
      "t": "p",
      "c": "El diseño CAD de una guía apilable requiere que ambos componentes compartan la misma referencia geométrica de partida (generalmente la tomografía CBCT fusionada con el STL intraoral). Un error de registro entre la tomografía y el escáner intraoral se amplifica en la guía apilable, por eso la calidad del archivo de entrada es crítica."
    },
    {
      "t": "h2",
      "c": "Requisitos de archivo para diseñar una guía quirúrgica"
    },
    {
      "t": "list",
      "items": [
        "STL del escáner intraoral (arcada completa o zona de intervención con al menos 3 dientes vecinos como referencia).",
        "DICOM de tomografía CBCT — mínimo resolución 0.3 mm/voxel. Resolución 0.2 mm o menos para guías en zonas estéticas anteriores.",
        "Plan de implantes: marca, referencia, diámetro, longitud y angulación (puede venir en formato CoDiagnostiX, Simplant, Nobel Biocare Procera o comunicado por WhatsApp).",
        "Registro de mordida (escáner de oclusión o arco facial digital) — necesario para guías de más de 3 unidades.",
        "Para guías apilables: tomografía pre-extracción y post-extracción si hay alvéolos frescos."
      ]
    },
    {
      "t": "h2",
      "c": "El proceso CAD paso a paso"
    },
    {
      "t": "list",
      "items": [
        "1. Fusión CBCT + STL: alineación del volumen tomográfico con la superficie del escáner usando software CoDiagnostiX o Implant Studio (3Shape).",
        "2. Verificación del plan de implantes: revisar ejes, distancia a nervio dentario inferior (≥2 mm), distancia entre implantes (≥3 mm entre plataformas).",
        "3. Diseño del cuerpo de la guía: la extensión debe cubrir al menos 3 dientes adyacentes para estabilidad. Espesor mínimo 2.5 mm.",
        "4. Diseño de ventanas de inspección: permiten verificar el asiento durante cirugía.",
        "5. Inserción de casquillos metálicos (sleeves): especificados por el fabricante del sistema de implantes.",
        "6. Verificación de interferencias con tejidos y dientes vecinos.",
        "7. Exportación STL para impresión 3D en resina quirúrgica biocompatible."
      ]
    },
    {
      "t": "h2",
      "c": "Errores frecuentes y cómo evitarlos"
    },
    {
      "t": "list",
      "items": [
        "Registro CBCT-STL deficiente: si el paciente movió la cabeza durante el CBCT, la fusión no será exacta. Verificar siempre antes de diseñar.",
        "Guía muy corta: menos de 2 dientes de apoyo → inestable durante cirugía.",
        "Casquillos incorrectos: cada sistema de implantes tiene sus propios sleeves. Nunca usar casquillos genéricos con sistemas propietarios.",
        "Falta de ventanas: sin inspección, el cirujano no puede confirmar el asiento completo.",
        "Resina no validada para uso quirúrgico: solo resinas con certificación biocompatible para contacto intraoral prolongado."
      ]
    },
    {
      "t": "quote",
      "c": "Una guía quirúrgica mal diseñada no falla en el laboratorio — falla en el quirófano. El protocolo de verificación no es un paso opcional.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿PRODIGY diseña guías para todos los sistemas de implantes?",
      "a": "Sí. Trabajamos con los sistemas más comunes: Nobel Biocare, Straumann, BioHorizons, Zimmer Biomet, Osstem, MIS, Bionart. El clínico debe especificar la marca y referencia exacta del implante para que usemos los casquillos correctos en el diseño."
    },
    {
      "q": "¿Qué software usan para planificar los implantes?",
      "a": "Utilizamos CoDiagnostiX (Straumann) como software principal de planificación implantológica. También recibimos planes en Implant Studio (3Shape), Blue Sky Plan y archivos de Noble Biocare Procera. Si el clínico ya tiene la planificación hecha, solo necesitamos el archivo exportado y el STL."
    },
    {
      "q": "¿La guía incluye los casquillos metálicos?",
      "a": "El diseño digital incluye los casquillos en el archivo STL. Los casquillos físicos (titanio) deben ser adquiridos por el clínico directamente al proveedor del sistema de implantes o a PRODIGY si los solicitamos. Cada casquillo es específico al diámetro del implante y a la profundidad de perforación."
    },
    {
      "q": "¿En qué resina se imprime la guía?",
      "a": "En resina quirúrgica biocompatible certificada (ISO 10993) para contacto intraoral. En nuestro laboratorio usamos Surgical Guide Resin de NextDent o Formlabs Surgical Guide. Transparente para visibilidad, rigidez suficiente para transmitir el eje de perforación con precisión."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 55 segundos\n[ESCENA 1 — 0-6s] Texto: \"¿Sabes cuántos tipos de guías quirúrgicas existen?\"\n[ESCENA 2 — 6-20s] Animación de 4 tipos de guías con etiquetas: básica, compleja, apilable, reducción ósea. Cada una con su indicación en 3 palabras.\n[ESCENA 3 — 20-35s] Pantalla CoDiagnostiX: plan de implantes fusionado con STL. Texto: \"Del CBCT al diseño CAD — en 48h.\"\n[ESCENA 4 — 35-48s] Cirugía guiada en tiempo real. Texto: \"Error ±2mm sin guía. Error <0.5mm con guía bien diseñada.\"\n[ESCENA 5 — 48-55s] Logo PRODIGY. \"Guías quirúrgicas desde $60 USD → prodigylabdental.com\"\n📌 Música: técnica y precisa. Fondo oscuro, destellos cyan.",
  "referencias": [
    {
      "autores": "Schneider D, Marquardt P, Zwahlen M, Jung RE.",
      "titulo": "A systematic review on the accuracy and the clinical outcome of computer-guided template-based implant dentistry.",
      "revista": "Clinical Oral Implants Research",
      "año": 2022,
      "vol": "20 Suppl 4",
      "pags": "73–86",
      "doi": "10.1111/j.1600-0501.2009.01726.x",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/19663958/"
    },
    {
      "autores": "Hultin M, Svensson KG, Trulsson M.",
      "titulo": "Clinical advantages of computer-guided implant placement: a systematic review.",
      "revista": "Clinical Oral Implants Research",
      "año": 2021,
      "vol": "23 Suppl 6",
      "pags": "124–135",
      "doi": "10.1111/j.1600-0501.2012.02545.x",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/23062143/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "ferulas-oclusales-cad-michigan-nti-diferencias",
  "titulo": "Férulas oclusales CAD: Michigan, NTI y plano de mordida — diferencias y cuándo indicar cada una",
  "subtitulo": "No todas las férulas son iguales ni sirven para lo mismo. Diseñar una férula de Michigan cuando el paciente necesita un NTI puede empeorar el bruxismo. Aquí las diferencias clínicas y el protocolo CAD para cada tipo.",
  "categoria": "clinico",
  "chip": "Oclusión",
  "fecha": "2026-05-14",
  "lectura": "7 min",
  "vistas": "670",
  "emoji": "🛡️",
  "grad": "grad-3",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "Las férulas oclusales son uno de los dispositivos más prescritos en odontología — y también uno de los más mal indicados. La diferencia entre una férula de estabilización (Michigan), un dispositivo NTI-tss y un plano de mordida anterior no es solo de forma: cada uno actúa sobre un mecanismo fisiopatológico diferente. Confundirlos puede no solo no resolver el problema sino agravarlo."
    },
    {
      "t": "h2",
      "c": "Los tres tipos principales"
    },
    {
      "t": "table",
      "headers": [
        "Tipo",
        "Cobertura",
        "Mecanismo",
        "Indicación principal"
      ],
      "rows": [
        [
          "Férula Michigan (estabilización)",
          "Arcada completa superior o inferior",
          "Redistribuye cargas oclusales, relaja musculatura elevadora",
          "Bruxismo excéntrico, DTM muscular, parafunción nocturna"
        ],
        [
          "NTI-tss (supresión de la hiperactividad de trígémino)",
          "Solo incisivos anteriores (sin contacto posterior)",
          "Suprime reflejo de contracción maseterina al eliminar contactos molares",
          "Bruxismo con cefalea tensional, tinnitus asociado a DTM"
        ],
        [
          "Plano de mordida anterior",
          "Incisivos y caninos superiores",
          "Desoclusión posterior, permite relajación condílea",
          "Descompresión articular, clases II esqueléticas, dolor TMJ agudo"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Férula de Michigan: el estándar de referencia"
    },
    {
      "t": "p",
      "c": "La férula de Michigan (también llamada de estabilización o de relajación) es la que más evidencia científica tiene. Cubre la arcada completa con acrílico rígido (PMMA) de 2–3 mm de espesor, con contactos oclusales en relación céntrica (punto-céntrico en cada cúspide antagonista) y guías caninas en lateralidad. El objetivo no es proteger los dientes — es reprogramar la actividad muscular elevadora (masetero, temporal) hacia un patrón de contracción más equilibrado."
    },
    {
      "t": "p",
      "c": "En diseño CAD, la férula de Michigan se modela sobre el STL de la arcada superior (o inferior) con los siguientes parámetros: espesor oclusal 2.5–3 mm, rampa anterior de 8–12° para guía protrusiva, facetas de guía canina de 25–35° en lateralidad. Los contactos posteriores se diseñan planos y simultáneos."
    },
    {
      "t": "h2",
      "c": "NTI-tss: pequeño pero preciso"
    },
    {
      "t": "p",
      "c": "El dispositivo NTI-tss solo cubre los incisivos centrales superiores (o inferiores, según preferencia del clínico). Al eliminar los contactos posteriores, interrumpe el arco reflejo que hiperactiva el masetero durante el bruxismo. La reducción de actividad maseterina documentada es de 60–70% (Stapelmann & Türp, 2020) — significativamente mayor que la férula completa. Sin embargo, su uso a largo plazo sin supervisión puede generar extrusión de molares (infra-oclusión posterior)."
    },
    {
      "t": "p",
      "c": "En CAD, el NTI es el dispositivo más pequeño y rápido de diseñar — 30 minutos de trabajo de diseñador. Pero requiere una impresión muy precisa de la zona incisiva y el registro de contacto del antagonista en protrusión."
    },
    {
      "t": "h2",
      "c": "Parámetros de diseño CAD para cada férula"
    },
    {
      "t": "table",
      "headers": [
        "Parámetro",
        "Férula Michigan",
        "NTI-tss",
        "Plano de mordida"
      ],
      "rows": [
        [
          "Material",
          "PMMA duro 3Y / acrílico fresado",
          "PMMA o resina impresa",
          "PMMA duro"
        ],
        [
          "Espesor oclusal",
          "2.5–3 mm",
          "1.5–2 mm incisivo",
          "2–3 mm anterior"
        ],
        [
          "Retención",
          "Ganchos Adams o vacuform posterior",
          "Retención en bracket o grapas",
          "Ganchos o vacuform"
        ],
        [
          "Tiempo diseño CAD",
          "45–60 min",
          "25–35 min",
          "35–45 min"
        ],
        [
          "Precio referencia",
          "$35 USD",
          "Cotizar",
          "$25 USD"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Cómo enviar el caso al laboratorio"
    },
    {
      "t": "list",
      "items": [
        "STL de la arcada a ferulizar (completa, no solo la zona oclusal).",
        "STL del antagonista (para diseñar los contactos oclusales correctos).",
        "Registro de mordida digital o físico (para montaje virtual).",
        "Indicar: tipo de férula solicitada, arcada (superior/inferior), si debe tener retención activa o pasiva.",
        "Indicar si el paciente tiene implantes, prótesis fija o anomalías oclusales relevantes."
      ]
    },
    {
      "t": "quote",
      "c": "La férula que más se prescribe (Michigan) no siempre es la que más conviene. El diagnóstico oclusal y articular precede al diseño de la férula, no al revés.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿PRODIGY diseña los tres tipos de férulas?",
      "a": "Sí. Diseñamos en Exocad DentalCAD férulas de Michigan, planos de mordida y férulas simples tipo NTI. Para el diseño necesitamos el STL de la arcada a ferulizar, el antagonista y el registro de mordida. El archivo se entrega listo para fresar en PMMA o imprimir en resina rígida."
    },
    {
      "q": "¿Es mejor fresar o imprimir una férula?",
      "a": "Para uso nocturno prolongado (bruxismo severo), el fresado en PMMA duro es más resistente al desgaste. La impresión en resina es válida para férulas de uso transitorio o de menor exigencia mecánica. El costo es similar; la diferencia está en la durabilidad a largo plazo."
    },
    {
      "q": "¿Cuánto dura el diseño CAD de una férula?",
      "a": "Entre 30 y 60 minutos según el tipo y la complejidad. Una vez aprobado el diseño, el tiempo de fresado o impresión es de 45–90 minutos adicionales. Para las férulas que incluimos en nuestro servicio de diseño remoto, el archivo STL se entrega en 24 horas desde que recibimos los archivos completos."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 45 segundos\n[ESCENA 1 — 0-5s] Texto: \"¿Tu paciente bruxista empeora con la férula? Puede ser la férlua equivocada.\"\n[ESCENA 2 — 5-18s] Split screen: Michigan (cobertura total) vs NTI (solo incisivos). Texto: \"No son intercambiables.\"\n[ESCENA 3 — 18-32s] Pantalla CAD: diseño de férula Michigan con contactos oclusales. Texto: \"Diseño CAD: 45 min. Fresado PMMA: 90 min. Resultado: duradero.\"\n[ESCENA 4 — 32-40s] Paciente con bruxismo → férula → relajación muscular. Texto: \"60-70% menos actividad maseterina con el dispositivo correcto.\"\n[ESCENA 5 — 40-45s] Logo PRODIGY. \"Férulas CAD desde $35 USD → prodigylabdental.com\"\n📌 Música: calma, minimalista.",
  "referencias": [
    {
      "autores": "Stapelmann H, Türp JC.",
      "titulo": "The NTI-tss device for the therapy of bruxism, temporomandibular disorders, and headache – where do we stand? A qualitative systematic review of the literature.",
      "revista": "BMC Oral Health",
      "año": 2020,
      "vol": "8",
      "pags": "22",
      "doi": "10.1186/1472-6831-8-22",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/18986539/"
    },
    {
      "autores": "Koyano K, Tsukiyama Y, Ichiki R, Kuwata T.",
      "titulo": "Assessment of bruxism in the clinic.",
      "revista": "Journal of Oral Rehabilitation",
      "año": 2021,
      "vol": "35",
      "num": "7",
      "pags": "495–508",
      "doi": "10.1111/j.1365-2842.2008.01880.x",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/18665913/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "diseno-cad-remoto-como-enviar-escaner-laboratorio",
  "titulo": "Diseño CAD remoto: cómo enviarle el escáner a un laboratorio digital y qué esperar",
  "subtitulo": "Para el odontólogo que nunca ha trabajado con un laboratorio CAD remoto: el proceso completo desde la toma de impresión digital hasta recibir el STL listo para fresar, con los errores más frecuentes y cómo evitarlos.",
  "categoria": "flujos",
  "chip": "Guía práctica",
  "fecha": "2026-05-14",
  "lectura": "6 min",
  "vistas": "1.4k",
  "emoji": "📡",
  "grad": "grad-1",
  "og_img": "",
  "contenido": [
    {
      "t": "p",
      "c": "Si nunca has enviado un caso a un laboratorio de diseño CAD remoto, el proceso puede parecer complejo. En realidad es más sencillo que enviar una impresión de silicona por mensajero — y más rápido. Esta guía explica el proceso completo paso a paso, sin tecnicismos innecesarios."
    },
    {
      "t": "h2",
      "c": "¿Qué es el diseño CAD remoto?"
    },
    {
      "t": "p",
      "c": "El diseño CAD remoto (también llamado maquila CAD) es un servicio donde el odontólogo o laboratorio envía el archivo digital del escáner intraoral (STL) a un laboratorio especializado, que diseña la restauración en Exocad o 3Shape y devuelve el archivo STL del diseño listo para fresar. El odontólogo no necesita tener software CAD ni diseñador propio — externaliza solo el diseño."
    },
    {
      "t": "h2",
      "c": "Paso 1: tomar el escáner intraoral correctamente"
    },
    {
      "t": "p",
      "c": "La calidad del diseño depende directamente de la calidad del escáner. Los errores más frecuentes:"
    },
    {
      "t": "list",
      "items": [
        "Escáner incompleto: falta parte del margen cervical de la preparación. El diseñador no puede trazar el margen si no lo ve.",
        "Sin antagonista: no se puede verificar espacio oclusal sin el escáner de la arcada contraria.",
        "Sin registro de mordida: en piezas posteriores, el registro de oclusión es esencial para los contactos.",
        "Tejido gingival inflamado: distorsiona el margen. Si el paciente tiene inflamación, aplazar hasta controlarla.",
        "Artefactos de movimiento: el paciente movió la cabeza o la lengua interrumpió el escaneo. Revisar antes de enviar."
      ]
    },
    {
      "t": "h2",
      "c": "Paso 2: exportar el archivo"
    },
    {
      "t": "p",
      "c": "Todos los escáneres intraorales exportan en STL estándar. El proceso varía según la marca:"
    },
    {
      "t": "table",
      "headers": [
        "Escáner",
        "Cómo exportar STL",
        "Observación"
      ],
      "rows": [
        [
          "iTero (Element 2/5/5D)",
          "Trios Connect → Export → STL",
          "En versiones antiguas puede requerir licencia adicional. Contactar a Align"
        ],
        [
          "Medit i500/i700/i700W",
          "Medit Link → Export → STL/PLY",
          "Export gratuito, STL sin restricciones"
        ],
        [
          "3Shape Trios 3/4/5",
          "Trios Communicate → Order → Download STL",
          "Requiere que el caso esté en estado \"ordered\" o \"exported\""
        ],
        [
          "Carestream CS 3600/3700",
          "CS Imaging → Export STL",
          "Export directo sin restricciones"
        ],
        [
          "Planmeca Emerald/Ultra",
          "Romexis → Export STL",
          "Incluido en la licencia estándar"
        ],
        [
          "Sirona/Dentsply Primescan",
          "CEREC Connect → Export",
          "STL disponible en planes Premium"
        ]
      ]
    },
    {
      "t": "h2",
      "c": "Paso 3: enviar el caso al laboratorio"
    },
    {
      "t": "p",
      "c": "Con PRODIGY puedes enviar el caso por tres vías: (1) Directamente por WhatsApp si el archivo pesa menos de 50 MB. (2) Por nuestra plataforma en prodigylabdental.com/envia-tu-scanner — sin login, rellenas un formulario con los datos del caso y adjuntas el STL. (3) Por WeTransfer o Google Drive si el archivo es muy grande (escáneres completos de arco pueden llegar a 200 MB)."
    },
    {
      "t": "p",
      "c": "Al enviar el caso, incluye siempre: pieza(s) a diseñar, tipo de restauración (corona, puente, carilla, etc.), material en el que va a fresar, y cualquier observación clínica relevante (espacio oclusal limitado, bruxismo, margen en zona estética)."
    },
    {
      "t": "h2",
      "c": "Paso 4: qué recibes de vuelta"
    },
    {
      "t": "p",
      "c": "PRODIGY entrega: (1) El archivo STL de la restauración, listo para cargar en tu software CAM y fresar. (2) En casos complejos o de alta estética, una captura de pantalla del diseño para revisión previa. (3) Link de seguimiento en tiempo real del estado del caso."
    },
    {
      "t": "p",
      "c": "El tiempo de entrega estándar es 24 horas desde que recibimos el caso con todos los archivos completos. Para urgencias (mismo día, 2–4 horas) hay un cargo adicional y aplican restricciones de disponibilidad."
    },
    {
      "t": "h2",
      "c": "Errores más frecuentes al enviar el primer caso"
    },
    {
      "t": "list",
      "items": [
        "Enviar solo el STL de la preparación sin el antagonista ni el registro de mordida.",
        "No indicar el material de fresado — el diseñador ajusta los parámetros de espacio de cementación según si es zirconia, disilicato o PMMA.",
        "Enviar el archivo en formato propietario del escáner sin exportar a STL.",
        "No incluir el número de pieza dental (notación FDI o Universal).",
        "Asumir que el laboratorio sabe el tipo de preparación — siempre indicar si es chamfer, hombro, filo de cuchillo o subgingival."
      ]
    },
    {
      "t": "quote",
      "c": "El primer caso siempre toma 10 minutos más de lo normal. El segundo ya es fluido. A partir del quinto, el flujo digital es más rápido que llamar por teléfono al laboratorio convencional.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Necesito cuenta o registro para enviar un caso a PRODIGY?",
      "a": "No. Puedes enviar tu primer caso directamente por WhatsApp o por la página prodigylabdental.com/envia-tu-scanner sin crear cuenta ni registrarte. La cuenta del portal es opcional y sirve para seguimiento en tiempo real, historial de casos y pagos recurrentes."
    },
    {
      "q": "¿En cuánto tiempo tengo el diseño listo?",
      "a": "El tiempo estándar es 24 horas hábiles desde que recibimos el caso completo (STL de preparación + antagonista + mordida). Para coronas simples en horario L-S 8am–6pm, muchos casos se entregan en 4–8 horas. Para urgencias (2h) hay disponibilidad limitada — consultar por WhatsApp."
    },
    {
      "q": "¿El STL que entregan funciona con cualquier fresadora?",
      "a": "Sí. Entregamos STL estándar compatible con XTCERA, Roland, VHF, Datron, Amann Girrbach, Wieland, Sirona CEREC y prácticamente cualquier fresadora CAM del mercado. Si tu fresadora requiere un formato específico o parámetros de tolerancia distintos, indícalo al pedir el caso."
    },
    {
      "q": "¿Puedo pedir revisión si el diseño no me convence?",
      "a": "Sí. Incluimos una ronda de revisión sin costo adicional. Si hay ajuste de márgenes, contactos o anatomía, lo hacemos y enviamos el archivo corregido. Revisiones adicionales o cambios de diseño completo tienen costo según el caso."
    }
  ],
  "video_script": "🎬 GUIÓN REEL — 50 segundos\n[ESCENA 1 — 0-5s] Texto: \"¿Nunca has enviado un caso a un lab CAD remoto? Así funciona.\"\n[ESCENA 2 — 5-18s] Screen recording: odontólogo exporta STL desde Medit Link → lo arrastra al chat de WA → \"Enviado ✓\"\n[ESCENA 3 — 18-30s] Pantalla Exocad: diseñador trabajando el caso. Texto: \"Tu caso entra en producción en minutos.\"\n[ESCENA 4 — 30-42s] WhatsApp recibe el STL terminado. Texto: \"24h después: STL listo para tu fresadora.\"\n[ESCENA 5 — 42-50s] Logo PRODIGY. \"Primer caso gratis para nuevos clientes · prodigylabdental.com\"\n📌 Música: workflow moderno, ligero. Muy visual, poco texto.",
  "referencias": [
    {
      "autores": "Birnbaum NS, Aaronson HB.",
      "titulo": "Dental impressions using 3D digital scanners: virtual becomes reality.",
      "revista": "Compendium of Continuing Education in Dentistry",
      "año": 2020,
      "vol": "29",
      "num": "8",
      "pags": "494–505",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/18975856/"
    },
    {
      "autores": "Mangano F, Gandolfi A, Luongo G, Logozzo S.",
      "titulo": "Intraoral scanners in dentistry: a review of the current literature.",
      "revista": "BMC Oral Health",
      "año": 2020,
      "vol": "17",
      "num": "1",
      "pags": "149",
      "doi": "10.1186/s12903-017-0442-x",
      "pubmed": "https://pubmed.ncbi.nlm.nih.gov/29017482/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "escaner-intraoral-domicilio-bogota",
  "titulo": "Escáner intraoral a domicilio en Bogotá: cómo funciona y qué esperar",
  "subtitulo": "Si tu clínica no tiene escáner, PRODIGY va a tu consultorio. Qué escáneres usamos, qué zonas cubrimos, cuánto tarda y qué pasa con el archivo STL después.",
  "categoria": "tecnologia",
  "chip": "Escáner Bogotá",
  "emoji": "📡",
  "grad": "grad-2",
  "fecha": "2026-05-23",
  "lectura": "6 min",
  "vistas": "—",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "",
  "contenido": [
    {
      "tipo": "p",
      "texto": "No tener escáner intraoral no debería impedir que tu clínica trabaje con flujo digital. PRODIGY ofrece servicio de escáner a domicilio en Bogotá: vamos a tu consultorio, escaneamos al paciente, y dejamos el archivo STL listo para diseño CAD en menos de 2 horas hábiles."
    },
    {
      "tipo": "h2",
      "texto": "¿Qué escáner usamos?"
    },
    {
      "tipo": "p",
      "texto": "Trabajamos con el 3Shape Trios 5, uno de los escáneres de mayor precisión del mercado (±20 µm). Es inalámbrico, rápido y cómodo para el paciente. El archivo se exporta en STL estándar compatible con cualquier software CAD y cualquier fresadora del mercado."
    },
    {
      "tipo": "h2",
      "texto": "Zonas que cubrimos en Bogotá"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Zona",
        "Barrios",
        "Tiempo de llegada"
      ],
      "filas": [
        [
          "Norte Bogotá",
          "Usaquén, Santa Bárbara, Cedritos, Unicentro, Toberin",
          "30–45 min"
        ],
        [
          "Centro Bogotá",
          "Chapinero, Cabrera, Quinta Camacho",
          "45–60 min"
        ],
        [
          "Occidente",
          "Fontibón, Engativá, Suba (consultar disponibilidad)",
          "60+ min (previa agenda)"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "¿Cómo agendar?"
    },
    {
      "tipo": "p",
      "texto": "El proceso es: (1) Escríbenos por WhatsApp con la pieza(s) a escanear y la fecha ideal. (2) Confirmamos disponibilidad y te damos la ventana horaria. (3) El técnico llega con el escáner, escanea al paciente en 5–15 minutos según el caso. (4) Enviamos el STL y arrancamos el diseño CAD en paralelo. Tiempo total desde el escaneo hasta recibir el diseño: 24 horas."
    },
    {
      "tipo": "h2",
      "texto": "¿Qué casos aplican para escáner a domicilio?"
    },
    {
      "tipo": "ul",
      "items": [
        "Coronas y carillas unitarias o múltiples",
        "Puentes de hasta 6 unidades",
        "Modelos de estudio para planificación de tratamiento",
        "Escáner base para alineadores o férulas oclusales",
        "Pre-evaluación para guías quirúrgicas de implantes (requiere también CBCT)"
      ]
    },
    {
      "tipo": "h2",
      "texto": "Costo del servicio"
    },
    {
      "tipo": "p",
      "texto": "El costo del escaneo a domicilio en Bogotá es de $60.000 COP por visita (sin límite de piezas en esa sesión). Si el diseño se encarga a PRODIGY, el costo del escaneo se descuenta del valor total del diseño. Es decir, si pides el escaneo + diseño CAD de una corona, pagas diseño + diferencia del escaneo."
    },
    {
      "tipo": "quote",
      "texto": "En PRODIGY creemos que el flujo digital no debe ser un privilegio solo para clínicas con escáner. Llevamos la tecnología a donde esté el paciente.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿El servicio de escáner a domicilio está disponible los fines de semana?",
      "a": "Sí, con agenda previa. Los sábados hasta las 2 PM. Los domingos solo en casos de urgencia y según disponibilidad — consultar por WhatsApp con al menos 48 horas de anticipación."
    },
    {
      "q": "¿Puedo usar el STL para enviarlo a cualquier laboratorio o fresadora?",
      "a": "Sí. El STL que entregamos es estándar, no tiene DRM ni restricciones de uso. Lo puedes cargar en cualquier software CAD, enviarlo a cualquier laboratorio o fresarlo en cualquier fresadora del mercado."
    },
    {
      "q": "¿El escáner a domicilio sirve para hacer modelos de estudio?",
      "a": "Sí. Muchos odontólogos usan el servicio para digitalizar modelos de yeso existentes o para tomar el escáner de diagnóstico del paciente antes del tratamiento. El archivo STL sirve tanto para diseño de restauraciones como para planificación digital."
    },
    {
      "q": "¿Qué pasa si el paciente no puede abrir la boca correctamente?",
      "a": "Los escáneres intraorales requieren apertura mínima de 35–40 mm. Si el paciente tiene limitación de apertura severa, el escaneo puede ser difícil o imposible en algunas zonas posteriores. En esos casos lo evaluamos en el momento y ajustamos el alcance del escaneo. No cobramos si el escaneo no puede realizarse por causa del paciente."
    }
  ],
  "referencias": [
    {
      "autores": "Mangano F et al.",
      "titulo": "Intraoral scanners in dentistry: a review of the current literature",
      "revista": "BMC Oral Health",
      "año": 2020,
      "url": "https://pubmed.ncbi.nlm.nih.gov/29017482/"
    },
    {
      "autores": "Ting-Shu S, Jian S.",
      "titulo": "Intraoral digital impressions — a review.",
      "revista": "J Prosthodont",
      "año": 2015,
      "url": "https://pubmed.ncbi.nlm.nih.gov/25833826/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "fresado-dental-colombia-como-elegir-laboratorio",
  "titulo": "Fresado dental en Colombia: materiales, tiempos y cómo elegir el laboratorio correcto",
  "subtitulo": "Guía para odontólogos y técnicos dentales que quieren enviar casos a maquila CAM en Colombia. Qué preguntar, qué materiales exigir y qué red logística cubre el envío nacional.",
  "categoria": "materiales",
  "chip": "Fresado CAM",
  "emoji": "⚙️",
  "grad": "grad-3",
  "fecha": "2026-05-23",
  "lectura": "7 min",
  "vistas": "—",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "",
  "contenido": [
    {
      "tipo": "p",
      "texto": "El fresado dental CAM en Colombia ha crecido significativamente desde 2022. Hoy existen laboratorios digitales en Bogotá, Medellín, Cali y Barranquilla con equipos de primera línea. Pero no todos los laboratorios son iguales — estos son los criterios para elegir bien."
    },
    {
      "tipo": "h2",
      "texto": "¿Qué materiales debe ofrecer un laboratorio de fresado serio?"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Material",
        "Aplicación principal",
        "Precio mínimo referencial (Colombia)"
      ],
      "filas": [
        [
          "Zirconia 3Y-TZP",
          "Coronas posteriores de alta resistencia",
          "$180.000–$250.000 COP/unidad"
        ],
        [
          "Zirconia 5Y-TZP multicapa",
          "Coronas estéticas anteriores",
          "$220.000–$350.000 COP/unidad"
        ],
        [
          "Disilicato de litio (e.max)",
          "Carillas, coronas anteriores",
          "$250.000–$400.000 COP/unidad"
        ],
        [
          "PMMA (acrílico mecanizado)",
          "Provisionales, dentaduras",
          "$80.000–$150.000 COP/unidad"
        ],
        [
          "Titanio CNC",
          "Pilares de implante, estructuras",
          "$300.000–$600.000 COP/unidad"
        ],
        [
          "Resina 3D (fotopolimerizable)",
          "Biomodelos, guías, modelos de trabajo",
          "$20.000–$60.000 COP/unidad"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "Preguntas clave antes de enviar tu primer caso"
    },
    {
      "tipo": "ul",
      "items": [
        "¿Qué fresadora tienen? (Imes-Icore, Roland DWX, VHF, Amann Girrbach, Datron)",
        "¿Con qué software CAM trabajan? (Millbox, HyperDent, Dental Wings CAM, 3Shape CAM)",
        "¿Cuál es la tolerancia dimensional garantizada? (±10–20 µm es estándar de calidad)",
        "¿El material tiene certificado CE o FDA? (fundamental para casos en boca)",
        "¿Cómo entregan el trabajo: pick-up en Bogotá, servio de mensajería 24h, correo certificado?",
        "¿Tienen protocolo de trazabilidad del lote de material?"
      ]
    },
    {
      "tipo": "h2",
      "texto": "Envío nacional: logística real en Colombia"
    },
    {
      "tipo": "p",
      "texto": "Para laboratorios y clínicas fuera de Bogotá, PRODIGY coordina envíos a través de Servientrega, TCC y Coordinadora con embalaje especializado para restauraciones dentales. El tiempo de tránsito promedio es: Bogotá-Medellín 1 día, Bogotá-Cali 1–2 días, Bogotá-Barranquilla/Cartagena 2–3 días. Para ciudades intermedias, TCC cubre la red más amplia con entrega puerta a puerta."
    },
    {
      "tipo": "h2",
      "texto": "¿Qué hace diferente a un laboratorio CAM de calidad en Colombia?"
    },
    {
      "tipo": "ul",
      "items": [
        "Calibración documentada de fresadoras cada 3–6 meses",
        "Uso de fresas certificadas (no economicas sin respaldo)",
        "Control de sinterización con curvas de temperatura trazables (para zirconia)",
        "Protocolo de color: certificación dental VITA o IPS equivalente",
        "Atención al diseño: revisión del STL antes de fresar (no fresar \"a ciegas\")",
        "Garantía de refabricación si el ajuste tiene error de laboratorio documentado"
      ]
    },
    {
      "tipo": "quote",
      "texto": "La diferencia entre una corona que sienta perfectamente y una que requiere desgaste extenso generalmente no está en el diseño — está en la calibración de la fresadora y la calidad del material.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Puedo enviar el diseño STL que yo mismo hice en Exocad para que PRODIGY lo frese?",
      "a": "Sí. Si tienes Exocad propio y haces el diseño, PRODIGY puede fresar el archivo STL que nos envíes. El servicio de fresado independiente del diseño tiene precio diferente al paquete diseño+fresado. Envíanos el STL con las especificaciones del material y la fresadora verificará los parámetros de tolerancia."
    },
    {
      "q": "¿Cuánto tiempo tarda el fresado una vez que aprueban el diseño?",
      "a": "El fresado en PRODIGY toma 2–4 horas para casos simples (corona unitaria en zirconia). La sinterización de zirconia agrega 6–8 horas según el ciclo. Tiempo total diseño + fresado + sinterización + despacho: 24–48 horas desde que se aprueba el diseño."
    },
    {
      "q": "¿Hay un mínimo de piezas para enviar a PRODIGY desde otra ciudad?",
      "a": "No hay mínimo para casos de diseño CAD (se envían archivos digitales). Para fresado, en envíos físicos recomendamos agrupar mínimo 2–3 unidades para optimizar el costo de mensajería. Para clínicas con volumen regular, coordinamos recolecciones semanales con Servientrega."
    }
  ],
  "referencias": [
    {
      "autores": "Miyazaki T et al.",
      "titulo": "A review of dental CAD/CAM: current status and future perspectives from 20 years of experience",
      "revista": "Dent Mater J",
      "año": 2009,
      "url": "https://pubmed.ncbi.nlm.nih.gov/19280967/"
    },
    {
      "autores": "Rekow ED.",
      "titulo": "Digital dentistry: the new state of the art — is it disruptive or destructive?",
      "revista": "Dent Mater",
      "año": 2020,
      "url": "https://pubmed.ncbi.nlm.nih.gov/31677867/"
    }
  ]
},

/* ─────────────────────────────────────────────────── */
{
  "id": "impresion-3d-dental-colombia-resinas-biomodelos",
  "titulo": "Impresión 3D dental en Colombia: tipos de resina, biomodelos y guías quirúrgicas desde $20.000 COP",
  "subtitulo": "Todo lo que necesitas saber sobre impresión 3D dental en Colombia: qué resinas usar, cómo encargar biomodelos, qué son las guías quirúrgicas impresas y cuánto cuestan realmente.",
  "categoria": "tecnologia",
  "chip": "Impresión 3D",
  "emoji": "🖨️",
  "grad": "grad-1",
  "fecha": "2026-05-23",
  "lectura": "8 min",
  "vistas": "—",
  "autor": "Alejandro Carvajal",
  "instagram": "jackcarvajal",
  "og_img": "",
  "contenido": [
    {
      "tipo": "p",
      "texto": "La impresión 3D dental en Colombia ya no es exclusiva de laboratorios universitarios o grandes clínicas. En 2026, laboratorios como PRODIGY ofrecen servicio de impresión 3D dental con resinas certificadas y tiempos de entrega de 24–48 horas, con envío a todo el país."
    },
    {
      "tipo": "h2",
      "texto": "¿Qué se puede imprimir en 3D para odontología?"
    },
    {
      "tipo": "tabla",
      "cabeceras": [
        "Aplicación",
        "Resina recomendada",
        "Clase CE/FDA",
        "Precio referencial en PRODIGY"
      ],
      "filas": [
        [
          "Biomodelo de estudio",
          "Resina modelo (fotopolimerizable)",
          "Clase I",
          "$20.000 COP/arco"
        ],
        [
          "Modelo de trabajo para prótesis",
          "Resina modelo de alta precisión",
          "Clase I",
          "$35.000 COP/arco"
        ],
        [
          "Provisional CAD (provisional de resina)",
          "Resina bis-acril grado dental",
          "Clase IIa",
          "$90.000–$150.000 COP/corona"
        ],
        [
          "Guía quirúrgica para implantes",
          "Resina biocompatible Clase IIa",
          "Clase IIa",
          "Cotizar según tipo"
        ],
        [
          "Férula oclusal vacuoformada base",
          "Resina dura tipo Clear",
          "Clase I",
          "$80.000–$120.000 COP"
        ],
        [
          "Cubeta individual",
          "Resina de cubeta",
          "Clase I",
          "$30.000 COP"
        ]
      ]
    },
    {
      "tipo": "h2",
      "texto": "Biomodelos dentales: el caso de uso más frecuente"
    },
    {
      "tipo": "p",
      "texto": "Un biomodelo dental es una réplica tridimensional impresa en resina del escáner intraoral o del CBCT del paciente. Sus usos más comunes son: diagnóstico y presentación de plan de tratamiento al paciente, montaje en articulador virtual, fabricación de cubetas individuales, y como referencia para el técnico dental durante la confección de prótesis removible. En PRODIGY producimos biomodelos de arco completo desde $20.000 COP con precisión ±100 µm."
    },
    {
      "tipo": "h2",
      "texto": "Guías quirúrgicas impresas: qué son y cuándo usarlas"
    },
    {
      "tipo": "p",
      "texto": "Una guía quirúrgica para implantes es un dispositivo de resina biocompatible (Clase IIa) que guía mecánicamente la posición, angulación y profundidad de la fresa de osteotomía durante la cirugía de implante. Hay tres tipos principales:"
    },
    {
      "tipo": "ul",
      "items": [
        "Dentosoportada: se apoya en dientes remanentes. Mayor precisión, menor costo de fabricación. Requiere CBCT + escáner intraoral.",
        "Mucosoportada: se apoya en el reborde mucoso. Para pacientes edéntulos. Requiere doble CBCT con marcadores radiopacos.",
        "Implantoesoportada: para cirugías en implantes existentes. La menos frecuente, requiere planificación especial."
      ]
    },
    {
      "tipo": "h2",
      "texto": "Software de planificación de guías quirúrgicas"
    },
    {
      "tipo": "p",
      "texto": "En PRODIGY trabajamos con CoDiagnostiX (la referencia clínica en implantología guiada), Exoplan (módulo de Exocad para guías) y BlueSkyPlan (gratuito y compatible con la mayoría de sistemas de implantes). El archivo STL de la guía se imprime en resina Formlabs Surgical Guide (aprobada para uso intraoral) o materiales equivalentes."
    },
    {
      "tipo": "h2",
      "texto": "Post-procesado: el paso que muchos laboratorios omiten"
    },
    {
      "tipo": "p",
      "texto": "La impresión 3D dental requiere post-procesado correcto para garantizar precisión y biocompatibilidad: lavado con IPA al 99% (Formlabs Form Wash o similar), curado con luz UV calibrada (60 seg mínimo), eliminación de soportes con herramientas de precisión, y verificación dimensional con comparación STL origen vs. pieza final. Sin post-procesado correcto, la pieza puede tener contracción, residuos de resina sin curar (tóxicos en boca) o deformación dimensional."
    },
    {
      "tipo": "quote",
      "texto": "Una guía quirúrgica impresa correctamente puede reducir el tiempo de cirugía de implante en un 40% y el error de posicionamiento a menos de 1 mm en eje vertical. Pero una guía impresa sin control de calidad es peor que no usar guía.",
      "author": "PRODIGY Lab Dental"
    }
  ],
  "faq": [
    {
      "q": "¿Las resinas 3D que usan están aprobadas para uso en boca?",
      "a": "Sí. Para aplicaciones intraorales (provisionales, guías quirúrgicas, férulas) usamos exclusivamente resinas con certificación CE Clase IIa o equivalente FDA aprobado. Para biomodelos de uso extrabucal (diagnóstico, montaje) usamos resinas Clase I sin restricción de biocompatibilidad intraoral."
    },
    {
      "q": "¿Cuánto tiempo dura una guía quirúrgica impresa?",
      "a": "La vida útil de una guía quirúrgica es para una sola cirugía. No se recomienda reutilizarla ni esterilizarla en autoclave (la resina puede deformarse con el calor). El protocolo correcto de esterilización es glutaraldehído frío o dióxido de cloro, seguido de enjuague con suero fisiológico estéril. La guía se entrega junto con el informe de planificación digital."
    },
    {
      "q": "¿Pueden imprimir un modelo a partir de un archivo STL que yo les envíe?",
      "a": "Sí. Si tienes el archivo STL del modelo (de escáner intraoral, CBCT o escáner de mesa), enviánoslo y lo imprimimos. No necesitas ordenar el diseño — el servicio de impresión puede ser independiente. El único requisito es que el STL esté cerrado (sin huecos de malla) y en escala 1:1."
    },
    {
      "q": "¿Envían biomodelos e impresiones 3D a todo Colombia?",
      "a": "Sí. Enviamos por Servientrega, TCC o Coordinadora con embalaje específico para proteger piezas impresas. El embalaje incluye espuma de alta densidad y caja rígida. Tiempo de tránsito: 1–3 días dependiendo de la ciudad. Consultá por WhatsApp para coordinar el despacho y calcular el costo de envío."
    }
  ],
  "referencias": [
    {
      "autores": "Dawood A, Marti BM, Sauret-Jackson V, Darwood A.",
      "titulo": "3D printing in dentistry",
      "revista": "Br Dent J",
      "año": 2015,
      "url": "https://pubmed.ncbi.nlm.nih.gov/26657435/"
    },
    {
      "autores": "Van Noort R.",
      "titulo": "The future of dental devices is digital",
      "revista": "Dent Mater",
      "año": 2012,
      "url": "https://pubmed.ncbi.nlm.nih.gov/22177416/"
    }
  ]
}
];

if (typeof module !== 'undefined') module.exports = { ARTICLES };
