#!/usr/bin/env node
/**
 * PRODIGY — Auto-Journal Generator
 * ─────────────────────────────────────────────────────────────
 * Motor: Google Gemini 2.0 Flash (gratuito, 1500 req/día)
 * Imágenes: Wikipedia REST API (gratuito, sin key)
 * Social copy: GitHub Actions Artifact (privado)
 *
 * Variable de entorno requerida (GitHub Secret):
 *   GEMINI_API_KEY — Google AI Studio → aistudio.google.com
 */

'use strict';

const https  = require('https');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const ARTICLES_PATH = path.join(__dirname, '..', 'articles.js');
const SOCIAL_PATH   = path.join(__dirname, '..', 'marketing-social.txt');
const GEMINI_KEY    = process.env.GEMINI_API_KEY;

// ── Temas rotativos — materiales, máquinas, lanzamientos, SEO dental ─
// SEO: marcas reconocidas + búsquedas frecuentes en odontología digital
const TOPIC_POOL = [
  // ── MATERIALES ACTUALES ──────────────────────────────────────────
  {
    slug_prefix: 'emax-cad-2025',
    chip: 'Materiales',
    emoji: '💎',
    grad: 'grad-1',
    categoria: 'materiales',
    lectura: '7 min',
    titulo_seed: 'IPS e.max CAD Ivoclar — propiedades y casos clínicos 2025',
    tema_es: 'Análisis clínico del disilicato de litio IPS e.max CAD (Ivoclar Vivadent): resistencia flexural (≥400 MPa), módulo de elasticidad, translucidez por bloque (LT, MO, HT, BL), protocolo de cristalización en horno Programat y adaptación marginal en coronas monolíticas. Comparativa con versiones anteriores e IPS e.max Press. Estudios en Journal of Prosthetic Dentistry y Dental Materials 2022-2025.',
    wiki_article: 'Lithium disilicate',
  },
  {
    slug_prefix: 'zirconia-katana-dd',
    chip: 'Materiales',
    emoji: '💎',
    grad: 'grad-2',
    categoria: 'materiales',
    lectura: '7 min',
    titulo_seed: 'Zirconia Katana vs DD Bio ZW+ — comparativa propiedades 2025',
    tema_es: 'Comparativa de propiedades mecánicas y ópticas de las zirconias de alta translucidez líderes del mercado: Katana STML/UTML (Kuraray Noritake), DD Bio ZW+ (Dental Direkt), Prettau Anterior (Zirkonzahn) y Cercon ht (Dentsply Sirona). Resistencia flexural, tenacidad a fractura, translucidez (%T) y comportamiento clínico publicados en Dental Materials y Journal of Dentistry.',
    wiki_article: 'Zirconium dioxide in dentistry',
  },
  {
    slug_prefix: 'celtra-duo-vita-enamic',
    chip: 'Materiales',
    emoji: '🔬',
    grad: 'grad-3',
    categoria: 'materiales',
    lectura: '6 min',
    titulo_seed: 'Celtra Duo vs Vita Enamic — cerámica híbrida para CAD/CAM 2025',
    tema_es: 'Comparativa clínica de las principales cerámicas híbridas para fresado CAD/CAM: Celtra Duo (zirconia reforzada con disilicato de litio, Dentsply Sirona) vs Vita Enamic (cerámica híbrida polímero-infiltrada, Vita Zahnfabrik). Propiedades mecánicas, módulo elástico, resistencia al desgaste, biocompatibilidad y supervivencia clínica a 3-5 años. Publicaciones en Journal of Dentistry, Dental Materials y Clinical Oral Investigations.',
    wiki_article: 'Dental ceramics',
  },
  {
    slug_prefix: 'pmma-provisional-multicapa',
    chip: 'Materiales',
    emoji: '🦷',
    grad: 'grad-4',
    categoria: 'materiales',
    lectura: '6 min',
    titulo_seed: 'PMMA multicapa para provisionales CAD/CAM — Ivotion y alternativas 2025',
    tema_es: 'Uso clínico del PMMA de alta densidad multicapa para prótesis provisionales y de larga duración fabricadas por CAD/CAM: bloques Ivotion (Ivoclar), Temp Premium (Amann Girrbach), VITA CAD-Temp multiColor. Propiedades mecánicas, estética, comportamiento a largo plazo en rehabilitaciones Full Arch y protocolos de pulido. Estudios publicados en Journal of Prosthetic Dentistry y Clinical Oral Investigations.',
    wiki_article: 'Polymethyl methacrylate',
  },
  {
    slug_prefix: 'vita-suprinity-zirconia-litio',
    chip: 'Materiales',
    emoji: '💎',
    grad: 'grad-5',
    categoria: 'materiales',
    lectura: '6 min',
    titulo_seed: 'Vita Suprinity — zirconia reforzada con silicato de litio en CAD/CAM',
    tema_es: 'Caracterización clínica y técnica de Vita Suprinity PC (Vita Zahnfabrik): composición, resistencia flexural (420 MPa pre-cristalización, 700 MPa post-cristalización), protocolo de cristalización, adhesión con cemento resinoso y comparativa estética frente a disilicato de litio IPS e.max CAD. Revisión de estudios in vitro e in vivo publicados en Dental Materials, Journal of Dentistry y Operative Dentistry.',
    wiki_article: 'Dental ceramics',
  },
  {
    slug_prefix: 'resinas-3d-biocompatibles',
    chip: 'Impresión 3D',
    emoji: '🖨️',
    grad: 'grad-1',
    categoria: 'fabricacion',
    lectura: '6 min',
    titulo_seed: 'Resinas 3D dentales 2025 — NextDent, SprintRay y Carbon DLS',
    tema_es: 'Comparativa de resinas fotopolimerizables de clase II CE/FDA para impresión 3D dental en 2025: NextDent Splint & Tray, NextDent Cast, SprintRay Crown SG, Carbon DLS RPU 130. Propiedades mecánicas (resistencia flexural, módulo, resistencia al impacto), precisión dimensional (desviación µm), biocompatibilidad ISO 10993 y comportamiento clínico en guías quirúrgicas, modelos, provisionales y férulas. Estudios en Journal of Prosthetic Dentistry, Dental Materials y Journal of Dentistry.',
    wiki_article: '3D printing in dentistry',
  },
  // ── MÁQUINAS Y EQUIPOS ───────────────────────────────────────────
  {
    slug_prefix: 'fresadoras-5ejes-2025',
    chip: 'Fresadoras',
    emoji: '⚙️',
    grad: 'grad-2',
    categoria: 'maquinaria',
    lectura: '8 min',
    titulo_seed: 'Fresadoras dentales 5 ejes 2025 — Amann Girrbach, Roland, VHF',
    tema_es: 'Comparativa técnica de las fresadoras dentales de 5 ejes líderes en 2025: Amann Girrbach Ceramill Motion 3 (Alemania), Roland DWX-52DCi (Japón), VHF K5+ cameo, XTCERA M5 Pro y Dentsply Sirona inLab MC X5. Parámetros técnicos: precisión de fresado (±10 µm), materiales compatibles (zirconia, titanio, cera, PMMA, IPS e.max CAD, Celtra Duo), velocidad de husillo, número de unidades/día y costo operativo. Publicaciones en Journal of Prosthetic Dentistry e International Journal of Computerized Dentistry.',
    wiki_article: 'Dental milling machine',
  },
  {
    slug_prefix: 'scanner-intraoral-2025',
    chip: 'Escáneres',
    emoji: '📡',
    grad: 'grad-3',
    categoria: 'tecnologia',
    lectura: '7 min',
    titulo_seed: 'Escáneres intraorales 2025 — Medit i900, iTero Lumina, Trios 5',
    tema_es: 'Evaluación clínica de los escáneres intraorales de última generación en 2025: Medit i900 (Corea), iTero Lumina (Align Technology), 3Shape Trios 5 Star (Dinamarca), Dentsply Sirona Primescan 2 y Planmeca Emerald S. Métricas de trueness y precision (ISO 12836), velocidad de escaneado, compatibilidad de software, conectividad con laboratorio y casos clínicos publicados en Journal of Dentistry y Journal of Prosthetic Dentistry.',
    wiki_article: 'Intraoral scanner',
  },
  {
    slug_prefix: 'impresoras-3d-dentales-2025',
    chip: 'Impresión 3D',
    emoji: '🖨️',
    grad: 'grad-4',
    categoria: 'fabricacion',
    lectura: '7 min',
    titulo_seed: 'Impresoras 3D dentales 2025 — SprintRay Pro95, Carbon M3, Phrozen',
    tema_es: 'Análisis técnico de las impresoras 3D de resina para uso dental en 2025: SprintRay Pro95 S (MSLA), Carbon M3 Max (DLS), Phrozen Sonic Mega 8K S, Asiga Max UV, Structo DentaForm. Resolución de capa (25-100 µm), precisión dimensional, velocidad de impresión, compatibilidad de resinas abiertas vs. cerradas, costo por unidad y casos de uso (guías quirúrgicas, modelos, provisionales, férulas). Estudios publicados en Dental Materials y Journal of Dentistry.',
    wiki_article: '3D printing in dentistry',
  },
  {
    slug_prefix: 'hornos-sinterizacion-zirconia',
    chip: 'Equipos Lab',
    emoji: '🔥',
    grad: 'grad-5',
    categoria: 'maquinaria',
    lectura: '6 min',
    titulo_seed: 'Hornos de sinterización de zirconia — Programat S1, Vita Zyrcomat 6100',
    tema_es: 'Impacto del protocolo de sinterización en las propiedades finales de la zirconia dental: curvas de temperatura (ciclo estándar 8h vs. alta velocidad 75 min), comparativa de hornos Ivoclar Programat S1, Vita Zyrcomat 6100 MS, Dentsply Sirona inFire HTC Speed y Amann Girrbach Oven S1. Efecto sobre translucidez, resistencia flexural, estabilidad de fase tetragonal-monoclínica y adaptación marginal. Estudios publicados en Dental Materials, Journal of Prosthetic Dentistry y Journal of Dentistry.',
    wiki_article: 'Zirconium dioxide in dentistry',
  },
  // ── IMPLANTES Y MARCAS REFERENTES ───────────────────────────────
  {
    slug_prefix: 'implantes-straumann-2025',
    chip: 'Implantología',
    emoji: '🦷',
    grad: 'grad-1',
    categoria: 'implantologia',
    lectura: '7 min',
    titulo_seed: 'Implantes Straumann BLX y BLT — evidencia clínica 2025',
    tema_es: 'Revisión de la evidencia clínica publicada sobre los sistemas de implantes Straumann BLX (Bone Level Tapered Roxolid SLActive) y BLT: torque de inserción, estabilidad primaria (ISQ por resonancia de frecuencia), osteointegración acelerada, tasas de éxito a 5 años y protocolo de carga inmediata. Comparativa con Straumann TL y datos de registro clínico publicados en Clinical Oral Implants Research, IJOS y Periodontology 2000.',
    wiki_article: 'Dental implant',
  },
  {
    slug_prefix: 'implantes-nobel-all-on-4',
    chip: 'Implantología',
    emoji: '🦷',
    grad: 'grad-2',
    categoria: 'implantologia',
    lectura: '8 min',
    titulo_seed: 'Nobel Biocare All-on-4 — protocolo y supervivencia clínica',
    tema_es: 'Revisión sistemática y meta-análisis del protocolo All-on-4 con implantes Nobel Biocare (Nobel Active, NobelParallel Conical Connection): tasas de supervivencia implantaria (>95% a 5 años), pérdida ósea marginal, complicaciones protésicas y biológicas, evolución del protocolo desde Maló 2003. Comparativa con All-on-6. Publicaciones en Clinical Oral Implants Research, IJOS y Journal of Clinical Periodontology.',
    wiki_article: 'All-on-4',
  },
  {
    slug_prefix: 'implantes-osstem-megagen',
    chip: 'Implantología',
    emoji: '🦷',
    grad: 'grad-3',
    categoria: 'implantologia',
    lectura: '7 min',
    titulo_seed: 'Implantes Osstem TS III vs MegaGen AnyRidge — evidencia comparativa',
    tema_es: 'Comparativa de sistemas de implantes coreanos líderes: Osstem TSIII SA (tratamiento de superficie nanotopográfica) y MegaGen AnyRidge (rosca expansiva, autoroscado). Diseño de macro y microestructura, torque de inserción en hueso tipo III-IV, osteointegración, tasas de supervivencia y complicaciones según ensayos clínicos publicados en Clinical Oral Implants Research, Journal of Clinical Periodontology e IJOS.',
    wiki_article: 'Dental implant',
  },
  // ── SEO — BÚSQUEDAS FRECUENTES ──────────────────────────────────
  {
    slug_prefix: 'exocad-vs-3shape',
    chip: 'Software CAD',
    emoji: '🖥️',
    grad: 'grad-4',
    categoria: 'software',
    lectura: '7 min',
    titulo_seed: 'Exocad vs 3Shape Dental System — ¿cuál elegir en 2025?',
    tema_es: 'Comparativa técnica y clínica de los dos software CAD dentales más utilizados en el mundo: Exocad DentalCAD 3.5 Rijeka y 3Shape Dental System 2025. Módulos disponibles, flujos de trabajo, compatibilidad con escáneres de laboratorio e intraorales, precisión de diseño, curva de aprendizaje, modelo de licencias y adopción global. Datos de uso y satisfacción de técnicos dentales publicados en International Journal of Computerized Dentistry y Journal of Prosthetic Dentistry.',
    wiki_article: 'CAD/CAM dentistry',
  },
  {
    slug_prefix: 'cementacion-adhesiva-ceramicas',
    chip: 'Protocolos',
    emoji: '🔬',
    grad: 'grad-5',
    categoria: 'clinica',
    lectura: '6 min',
    titulo_seed: 'Cementación adhesiva en cerámicas CAD/CAM — protocolo basado en evidencia',
    tema_es: 'Protocolo de cementación adhesiva basado en evidencia para restauraciones CAD/CAM según el sustrato cerámico: grabado con HF 5% + silano (disilicato de litio, cerámica híbrida), tratamiento con MDP + sandblasting (zirconia), elección de cemento resinoso (RelyX Ultimate 3M, Variolink Esthetic Ivoclar, Panavia V5 Kuraray). Resistencia de unión, supervivencia clínica y errores más comunes. Publicaciones en Journal of Prosthetic Dentistry, Operative Dentistry y Dental Materials.',
    wiki_article: 'Dental bonding',
  },
  {
    slug_prefix: 'dsd-protocolo-2025',
    chip: 'Diseño Sonrisa',
    emoji: '✨',
    grad: 'grad-1',
    categoria: 'estetica',
    lectura: '6 min',
    titulo_seed: 'Diseño Digital de Sonrisa DSD — protocolo actualizado 2025',
    tema_es: 'Protocolo actualizado de Diseño Digital de Sonrisa (Digital Smile Design — DSD): integración de fotografía facial estandarizada, escáner intraoral y software de planificación estética. Comparativa de plataformas: DSD App, Smile Designer Pro, 3Shape Smile Design. Validación del mockup digital frente a encerado físico, satisfacción del paciente y predictibilidad del resultado final. Estudios publicados en Journal of Esthetic and Restorative Dentistry y Journal of Prosthetic Dentistry.',
    wiki_article: 'Cosmetic dentistry',
  },
  {
    slug_prefix: 'ia-dental-diagnostico',
    chip: 'Inteligencia Artificial',
    emoji: '🤖',
    grad: 'grad-2',
    categoria: 'innovacion',
    lectura: '7 min',
    titulo_seed: 'IA en odontología 2025 — Pearl, Overjet y detección de caries por radiografía',
    tema_es: 'Estado del arte de la inteligencia artificial en odontología diagnóstica y de laboratorio en 2025: Pearl AI y Overjet para detección automática de caries, pérdida ósea periimplantaria y cálculo en radiografías periapicales (aprobados FDA). IA en CAD para segmentación de márgenes automática (Exocad, 3Shape). Estudios de validación comparados con diagnóstico humano experto publicados en Journal of Dental Research, Dentomaxillofacial Radiology y Journal of Dentistry.',
    wiki_article: 'Artificial intelligence in healthcare',
  },
  {
    slug_prefix: 'alineadores-invisalign-vs-oe',
    chip: 'Ortodoncia Digital',
    emoji: '📐',
    grad: 'grad-3',
    categoria: 'ortodoncia',
    lectura: '6 min',
    titulo_seed: 'Invisalign vs alineadores de laboratorio — eficacia clínica 2025',
    tema_es: 'Comparativa clínica entre Invisalign (Align Technology, ClinCheck) y sistemas de alineadores fabricados en laboratorio (uLab, 3Shape Ortho, OrthoAnalyzer): eficacia de movimiento dental (torque, intrusión, extrusión), precisión de los alineadores impresos en 3D, tasa de refinamientos, satisfacción del paciente y costo-beneficio. Ensayos clínicos y revisiones publicadas en American Journal of Orthodontics and Dentofacial Orthopedics y Angle Orthodontist.',
    wiki_article: 'Clear aligners',
  },
  {
    slug_prefix: 'guia-quirurgica-precision-implante',
    chip: 'Guías Quirúrgicas',
    emoji: '🦷',
    grad: 'grad-4',
    categoria: 'implantologia',
    lectura: '8 min',
    titulo_seed: 'Precisión de guías quirúrgicas para implantes — meta-análisis 2025',
    tema_es: 'Meta-análisis de la precisión de cirugía guiada estática para implantes dentales: desviación angular media (°), desviación lateral en hombro (mm) y punta (mm), desviación de profundidad (mm). Variables que afectan la precisión: tipo de soporte (dentosoportada vs. mucosoportada vs. ósea), sistema de planificación (CoDiagnostiX, Simplant, Blue Sky Plan, Implant Studio 3Shape), material de la guía y precisión del escáner utilizado. Revisiones publicadas en Clinical Oral Implants Research, IJOS y Journal of Clinical Periodontology 2022-2025.',
    wiki_article: 'Dental implant',
  },
  {
    slug_prefix: 'flujo-digital-completo-lab',
    chip: 'Flujo Digital',
    emoji: '⚙️',
    grad: 'grad-5',
    categoria: 'tecnologia',
    lectura: '7 min',
    titulo_seed: 'Flujo de trabajo 100% digital en laboratorio dental — guía 2025',
    tema_es: 'Implementación del flujo de trabajo completamente digital en laboratorio dental en 2025: escáner de laboratorio (Medit T710, 3Shape D2000, Shining3D AutoScan DS-MIX), software CAD (Exocad, 3Shape), fresadora (Amann Girrbach, Roland, VHF) e impresora 3D (SprintRay, Asiga). Ventajas frente al flujo analógico: reducción de tiempo de turnaround, precisión, trazabilidad y costos. Estudios de eficiencia publicados en Journal of Prosthetic Dentistry y International Journal of Computerized Dentistry.',
    wiki_article: 'Dental laboratory',
  },
  // ── TEMAS COMPARTIDOS — diseño CAD / perspectiva freelance ───────
  {
    slug_prefix: 'diseno-cad-remoto',
    chip: 'Flujo Remoto',
    emoji: '📡',
    grad: 'grad-1',
    categoria: 'flujos',
    lectura: '7 min',
    titulo_seed: 'Flujo de trabajo CAD dental remoto — protocolos y evidencia',
    tema_es: 'Protocolos clínicos validados para el flujo de trabajo de diseño CAD dental remoto: requisitos de escáner intraoral (precisión ≥20 µm trueness), formatos de archivo STL/OBJ/PLY, transferencia de registros oclusales digitales y estándares de entrega. Evidencia clínica de precisión en restauraciones diseñadas remotamente vs. en laboratorio tradicional. Publicaciones en Journal of Prosthetic Dentistry y Journal of Dentistry.',
    wiki_article: 'CAD/CAM dentistry',
  },
  {
    slug_prefix: 'scanner-intraoral-cad',
    chip: 'Escáneres',
    emoji: '📐',
    grad: 'grad-2',
    categoria: 'diseno',
    lectura: '7 min',
    titulo_seed: 'Escáneres intraorales para diseño CAD — impacto en adaptación marginal',
    tema_es: 'Evaluación clínica de la precisión (trueness y precision según ISO 5725) de los principales escáneres intraorales para casos de diseño CAD dental: Medit i700/i900, 3Shape Trios 5, iTero Element 7, Primescan. Impacto directo en la adaptación marginal de restauraciones CAD/CAM. Estudios in vitro e in vivo en Journal of Dentistry, Journal of Prosthetic Dentistry y Dental Materials.',
    wiki_article: 'Intraoral scanner',
  },
  {
    slug_prefix: 'ferulas-oclusales-cad',
    chip: 'Férulas Oclusales',
    emoji: '🔬',
    grad: 'grad-3',
    categoria: 'ferula',
    lectura: '6 min',
    titulo_seed: 'Férulas oclusales CAD/CAM vs. convencionales — evidencia clínica',
    tema_es: 'Comparativa clínica y técnica de férulas oclusales fabricadas por CAD/CAM vs. convencionales (resina acrílica de presión): adaptación, retención, dureza Vickers, estabilidad dimensional y efectividad clínica en bruxismo y DTM. Revisión de ensayos clínicos publicados en Journal of Oral Rehabilitation, Journal of Prosthetic Dentistry y Journal of Craniomandibular & Sleep Practice.',
    wiki_article: 'Occlusal splint',
  },
  {
    slug_prefix: 'full-arch-digital',
    chip: 'Full Arch',
    emoji: '⚙️',
    grad: 'grad-4',
    categoria: 'implantologia',
    lectura: '10 min',
    titulo_seed: 'Protocolo Full Arch digital — precisión, materiales y evidencia',
    tema_es: 'Protocolo clínico basado en evidencia para rehabilitaciones Full Arch digitales (All-on-4, All-on-6): digitalización de arco completo, técnicas de verificación de arco, diseño CAD de estructura metálica y prótesis final en zirconia monolítica o PMMA. Tasas de éxito implantario, desajuste pasivo y satisfacción del paciente según meta-análisis en IJOS y Clinical Oral Implants Research.',
    wiki_article: 'All-on-4',
  },
  {
    slug_prefix: 'exocad-dentalcad-funciones',
    chip: 'Software CAD',
    emoji: '🖥️',
    grad: 'grad-5',
    categoria: 'software',
    lectura: '7 min',
    titulo_seed: 'Exocad DentalCAD — funciones avanzadas y adaptación marginal',
    tema_es: 'Evaluación de la precisión y eficiencia del software Exocad DentalCAD para el diseño de restauraciones dentales: estudios de adaptación marginal, tiempo de diseño, curva de aprendizaje y comparativa con 3Shape Dental System. Módulos clave: Implant Bar & Bridge, Removable Partial Denture, Smile Design. Publicaciones en Journal of Prosthetic Dentistry, International Journal of Computerized Dentistry y Journal of Dental Education.',
    wiki_article: 'CAD/CAM dentistry',
  },
  {
    slug_prefix: 'ia-cad-margenes',
    chip: 'IA en CAD',
    emoji: '🤖',
    grad: 'grad-1',
    categoria: 'ia',
    lectura: '8 min',
    titulo_seed: 'Inteligencia artificial en diseño CAD dental — segmentación y anatomía',
    tema_es: 'Aplicaciones de inteligencia artificial en diseño CAD dental: segmentación automática de márgenes, propuesta de anatomía oclusal, detección de colisiones y optimización de contactos proximales. Estudios de validación comparados con diseño manual por expertos. Publicaciones en Journal of Dental Research, Computers in Biology and Medicine y Journal of Dentistry.',
    wiki_article: 'Artificial intelligence in healthcare',
  },
  {
    slug_prefix: 'materiales-cad-comparativa',
    chip: 'Materiales CAD',
    emoji: '💎',
    grad: 'grad-2',
    categoria: 'materiales',
    lectura: '8 min',
    titulo_seed: 'Materiales para restauraciones CAD/CAM — comparativa propiedades mecánicas',
    tema_es: 'Propiedades mecánicas y clínicas de los materiales para restauraciones CAD/CAM: zirconia 3Y-TZP, 4Y-PSZ, 5Y-PSZ, disilicato de litio (IPS e.max CAD Ivoclar), zirconia reforzada con litio (Celtra Duo Dentsply), PMMA de alta densidad y resinas compuestas nanocerámicas (Vita Enamic). Comparativa de resistencia flexural, módulo elástico, tenacidad a la fractura y translucidez según estudios ISO 6872.',
    wiki_article: 'Zirconium dioxide in dentistry',
  },
  {
    slug_prefix: 'pilares-titanio-cad',
    chip: 'Pilares CAD',
    emoji: '⚙️',
    grad: 'grad-3',
    categoria: 'implantologia',
    lectura: '7 min',
    titulo_seed: 'Pilares implantarios individualizados en titanio CAD/CAM — precisión y biocompatibilidad',
    tema_es: 'Diseño y fabricación CAD/CAM de pilares implantarios individualizados en titanio grado 4 y grado 5 (Ti-6Al-4V): parámetros de diseño (perfil de emergencia, ángulo de convergencia, plataforma de conexión), ventajas clínicas frente a pilares estándar (adaptación gingival, salud periodontal), comparativa de ajuste vertical (fit test). Biocompatibilidad, corrosión galvánica y supervivencia clínica a 5 años. Estudios en Clinical Oral Implants Research, Journal of Clinical Periodontology y Journal of Prosthetic Dentistry.',
    wiki_article: 'Dental abutment',
  },
  {
    slug_prefix: 'barras-implantosoportadas-cad',
    chip: 'Barras CAD',
    emoji: '🔬',
    grad: 'grad-4',
    categoria: 'implantologia',
    lectura: '8 min',
    titulo_seed: 'Barras implantosoportadas CAD/CAM — diseño de conectores y protocolo clínico 2025',
    tema_es: 'Diseño CAD de barras sobre implantes para prótesis completas removibles e híbridas: geometría de conectores (sección transversal mínima 9mm2 en titanio, 16mm2 en zirconia), distribución de implantes para la barra (promedio 4-6 implantes), paralelismo (0-5° tolerancia), sistema de retenedores (ERA, Hader, Locator). Fresado en titanio grado 5 vs. zirconia monolítica: ventajas y limitaciones clínicas. Meta-análisis en International Journal of Oral & Maxillofacial Surgery y IJOS.',
    wiki_article: 'Implant-supported prosthesis',
  },
  {
    slug_prefix: 'carillas-emax-laboratorio',
    chip: 'Carillas Lab',
    emoji: '✨',
    grad: 'grad-5',
    categoria: 'estetica',
    lectura: '7 min',
    titulo_seed: 'Carillas e.max en laboratorio dental — protocolo CAD y cerámica estratificada',
    tema_es: 'Protocolo de laboratorio para carillas en IPS e.max: diseño CAD de la estructura (framework) en e.max CAD seguido de estratificación con IPS e.max Ceram, vs. carilla monolítica prensada. Parámetros de diseño (grosor de framework 0.2mm mínimo), temperatura y ciclos de cocción, caracterización con pigmentos y glazeado final. Comparativa de estética y resistencia fractura entre técnicas. Estudios en Journal of Esthetic and Restorative Dentistry, Dental Materials y Journal of Prosthetic Dentistry.',
    wiki_article: 'Dental veneers',
  },
  {
    slug_prefix: 'impresion-3d-guias-modelo',
    chip: '3D Laboratorio',
    emoji: '🖨️',
    grad: 'grad-1',
    categoria: 'impresion3d',
    lectura: '7 min',
    titulo_seed: 'Impresión 3D en laboratorio dental — modelos, guías y provisionales 2025',
    tema_es: 'Aplicaciones clínicas de la impresión 3D en el laboratorio dental moderno: modelos de estudio y trabajo en resina modelo (SprintRay Model+, NextDent Model 2.0), guías quirúrgicas implantares (resina biocompatible clase IIa, SprintRay Surgical Guide, Formlabs Dental SG), y provisionales de PMMA impreso. Precisión dimensional comparada con fresado y convencional, biocompatibilidad ISO 10993, y protocolos de post-curado. Revisiones en Journal of Prosthetic Dentistry y Dental Materials.',
    wiki_article: '3D printing in healthcare',
  },
  {
    slug_prefix: 'brackets-guias-posicionamiento',
    chip: 'Ortodoncia Lab',
    emoji: '📐',
    grad: 'grad-2',
    categoria: 'ortodoncia',
    lectura: '6 min',
    titulo_seed: 'Guías de posicionamiento de brackets CAD/CAM — precisión en ortodoncia digital',
    tema_es: 'Diseño y fabricación de guías de posicionamiento indirecto de brackets (IBT, Indirect Bonding Tray) en laboratorio dental: digitalización de modelos de estudio, planificación virtual de posición ideal del bracket en software (OrthoAnalyzer 3Shape, uLab, Insignia Ormco), fabricación de cubetas de transferencia en resina impresa. Precisión de posicionamiento comparado con bonding directo: desviaciones angulares y torque. Estudios en American Journal of Orthodontics and Dentofacial Orthopedics y Angle Orthodontist.',
    wiki_article: 'Indirect bonding',
  },
  {
    slug_prefix: 'endocrown-laboratorio-2025',
    chip: 'Endocorona Lab',
    emoji: '🦷',
    grad: 'grad-3',
    categoria: 'clinica',
    lectura: '7 min',
    titulo_seed: 'Endocorona en laboratorio dental CAD/CAM — materiales y protocolo de fabricación 2025',
    tema_es: 'Protocolo de laboratorio para la fabricación de endocoronas mediante CAD/CAM: criterios de selección de material (disilicato de litio IPS e.max CAD vs. zirconia Katana), diseño de la caja pulpar (profundidad 3-4mm, paredes remanentes mínimas 2mm), parámetros de glaseado y caracterización. Comparativa de resistencia a fractura en premolares y molares con endodoncia frente a restauraciones convencionales con poste. Revisiones en Journal of Endodontics y Journal of Prosthetic Dentistry.',
    wiki_article: 'Endocrown',
  },
  {
    slug_prefix: 'rehabilitacion-oral-colombia',
    chip: 'Rehab Colombia',
    emoji: '🇨🇴',
    grad: 'grad-4',
    categoria: 'clinica',
    lectura: '8 min',
    titulo_seed: 'Rehabilitación oral digital en Colombia — flujo CAD/CAM, costos y laboratorio',
    tema_es: 'Análisis del flujo de trabajo protésico con tecnología CAD/CAM en laboratorios dentales de Colombia: acceso a escaneo intraoral, costos de producción digital vs. convencional, materiales disponibles en el mercado colombiano (bloques cerámicos, discos de zirconia Katana, Sagemax, GDT), cadena de suministro y tiempos de entrega. Comparativa de calidad de adaptación marginal en ambos sistemas. Fuentes: Journal of Prosthetic Dentistry y estudios indexados en SciELO Colombia.',
    wiki_article: 'Dental laboratory',
  },
];

// ── Helpers ───────────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function uid(prefix) {
  return `${prefix}-${todayISO()}-${crypto.randomBytes(2).toString('hex')}`;
}

function pickTopics() {
  // Leer slugs ya publicados para evitar repetir tema reciente
  let usedSlugs = [];
  try {
    const raw = fs.readFileSync(ARTICLES_PATH, 'utf8');
    const matches = raw.match(/slug:\s*['"]([^'"]+)['"]/g) || [];
    usedSlugs = matches.map(m => m.replace(/slug:\s*['"]/, '').replace(/['"]/, ''));
  } catch (e) { /* archivo nuevo, continuar */ }

  // Pool sin los slugs usados recientemente (últimos 6)
  const recent = usedSlugs.slice(0, 6);
  const available = TOPIC_POOL.filter(t => !recent.some(s => s.startsWith(t.slug_prefix)));
  const pool = available.length >= 2 ? available : TOPIC_POOL;

  // Selección aleatoria de 2 temas distintos
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

// ── HTTP helper ───────────────────────────────────────────────────
function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
        }
        resolve(data);
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Gemini API ────────────────────────────────────────────────────
async function callGemini(prompt) {
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.15,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ]
  });

  const raw = await httpRequest({
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);

  const parsed = JSON.parse(raw);
  if (parsed.error) throw new Error(parsed.error.message);

  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini: respuesta vacía. ' + JSON.stringify(parsed).slice(0, 200));
  return text;
}

// ── Wikipedia REST API — imagen principal del artículo ───────────
async function fetchWikipediaImage(articleTitle) {
  try {
    const title = encodeURIComponent(articleTitle);
    const raw = await httpRequest({
      hostname: 'en.wikipedia.org',
      path: `/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=1200&pilicense=any`,
      method: 'GET',
      headers: { 'User-Agent': 'PRODIGYJournal/1.0 (prodigylabdental.com)' }
    });
    const data  = JSON.parse(raw);
    const pages = data.query?.pages || {};
    const page  = Object.values(pages)[0];
    if (!page?.thumbnail?.source) return null;
    return {
      url:    page.thumbnail.source,
      credit: `Wikipedia — ${articleTitle}`,
      link:   `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`
    };
  } catch (e) {
    console.warn('⚠️  Wikipedia imagen error:', e.message);
    return null;
  }
}

// ── Prompt de generación ──────────────────────────────────────────
function buildPrompt(topic) {
  return `Eres un experto en odontología digital y redactor científico con formación doctoral en ciencias de la salud oral.
Tu único deber es escribir basado en evidencia publicada en revistas indexadas de alto impacto:
Periodontology 2000, Journal of Dental Research (JDR), Journal of Clinical Periodontology,
Journal of Dentistry, Dental Materials, Journal of Prosthetic Dentistry,
Clinical Oral Implants Research, International Journal of Oral & Maxillofacial Implants (IJOS),
Journal of Endodontics, Cochrane Database of Systematic Reviews.
Fuentes de búsqueda autorizadas: PubMed/NCBI, ScienceDirect (Elsevier), JADA (ada.org), SciELO.

Escribe un artículo técnico riguroso en español sobre:
"${topic.tema_es}"

REGLAS ABSOLUTAS — VIOLACIÓN = ARTÍCULO RECHAZADO:
1. SOLO datos de estudios reales y verificables publicados en revistas indexadas
2. JAMÁS inventes estadísticas, porcentajes, citas ni DOIs — si no tienes certeza 100%, omite el dato
3. JAMÁS uses frases vagas como "estudios muestran" o "se ha demostrado" sin citar la fuente exacta
4. Cada afirmación técnica numérica DEBE tener referencia (Apellido et al., Revista, Año)
5. Referencias en formato Vancouver completo: Apellido AI, et al. Título. Revista. Año;Vol(N):pp. doi:10.XXXX/XXXXX
6. Mínimo 4 referencias con DOI verificable de PubMed o ScienceDirect
7. Nivel técnico para odontólogos generales y técnicos dentales especializados
8. Mínimo 5 secciones temáticas (h2)
9. Mínimo una tabla comparativa con datos de estudios reales (citar fuente en la tabla)

Devuelve EXACTAMENTE este JSON (sin texto antes ni después, sin markdown):
{
  "titulo": "Título descriptivo y preciso en español (máx 85 chars)",
  "subtitulo": "Resumen del valor clínico del artículo en 1-2 oraciones",
  "contenido": [
    {"t": "p", "c": "Párrafo introductorio con contexto clínico y epidemiológico actual..."},
    {"t": "h2", "c": "Nombre de sección 1"},
    {"t": "p", "c": "Desarrollo técnico con datos concretos y verificables..."},
    {"t": "list", "items": ["Dato técnico verificable 1", "Dato 2", "Dato 3", "Dato 4", "Dato 5"]},
    {"t": "h2", "c": "Nombre de sección 2"},
    {"t": "p", "c": "Contenido técnico..."},
    {"t": "table", "headers": ["Col1", "Col2", "Col3"], "rows": [["val1","val2","val3"],["val4","val5","val6"]]},
    {"t": "h2", "c": "Nombre de sección 3"},
    {"t": "p", "c": "Contenido..."},
    {"t": "h2", "c": "Nombre de sección 4"},
    {"t": "p", "c": "Contenido..."},
    {"t": "quote", "c": "Conclusión o cita de estudio relevante", "author": "Apellido et al., Revista, Año"}
  ],
  "referencias": [
    "Apellido A, Apellido B. Título completo del artículo. Nombre Revista. Año;Vol(N):pp-pp. doi:10.XXXX/XXXXX",
    "Apellido C et al. Título. Revista. Año;Vol:pp. doi:10.XXXX/XXXXX",
    "Apellido D, Apellido E. Título. Revista. Año;Vol(N):pp-pp. PMID: XXXXXXXX"
  ],
  "faq": [
    {"q": "Pregunta clínica frecuente relevante al tema", "a": "Respuesta técnica precisa basada en evidencia"},
    {"q": "Segunda pregunta clínica práctica", "a": "Respuesta con recomendación aplicable"}
  ],
  "social_instagram": "Texto para Instagram máx 150 chars. Dato sorprendente + 3 hashtags relevantes en odontología.",
  "social_linkedin": "Texto para LinkedIn 2-3 oraciones. Insight técnico clave para profesionales dentales. Sin hashtags."
}`;
}

// ── Parsear y validar respuesta Gemini ────────────────────────────
function parseGeminiResponse(raw) {
  let jsonStr = raw.trim();

  // Eliminar bloques ```json si Gemini los incluye
  const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) jsonStr = match[1].trim();

  const data = JSON.parse(jsonStr);

  // Validaciones mínimas
  if (!data.titulo)    throw new Error('Falta titulo');
  if (!data.contenido) throw new Error('Falta contenido');
  if (!Array.isArray(data.referencias) || data.referencias.length < 2)
    throw new Error('Insuficientes referencias');

  return data;
}

// ── Construir objeto artículo ─────────────────────────────────────
function buildArticleObject(topic, aiData, image) {
  return {
    id:        uid(topic.slug_prefix),
    titulo:    aiData.titulo,
    subtitulo: aiData.subtitulo || '',
    categoria: topic.categoria,
    chip:      topic.chip,
    fecha:     todayISO(),
    lectura:   topic.lectura,
    vistas:    '0',
    emoji:     topic.emoji,
    grad:      topic.grad,
    og_img:    image ? image.url : '',
    img_credit: image ? image.credit : '',
    img_link:   image ? image.link : '',
    autor:      'Alejandro Carvajal',
    instagram:  'jackcarvajal',
    contenido:  image
      ? (() => {
          // Inserta imagen de Wikipedia después del primer párrafo
          const c = [...(aiData.contenido || [])];
          const firstP = c.findIndex(b => b.t === 'p');
          const imgBlock = { t:'img', src: image.url, alt: topic.titulo_seed,
            caption: `${image.credit} · Wikimedia Commons (CC BY-SA)` };
          if (firstP >= 0) c.splice(firstP + 1, 0, imgBlock);
          else c.unshift(imgBlock);
          return c;
        })()
      : aiData.contenido,
    faq:        aiData.faq || [],
    referencias: aiData.referencias || []
  };
}

// ── Leer artículos existentes ─────────────────────────────────────
function readExistingArticles() {
  const raw = fs.readFileSync(ARTICLES_PATH, 'utf8');
  const match = raw.match(/const ARTICLES\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) throw new Error('No se encontró ARTICLES en articles.js');
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return ${match[1]}`)();
}

// ── Serializar → articles.js ──────────────────────────────────────
function serializeArticles(articles) {
  const header =
`/* ============================================================
   PRODIGY — Base de artículos técnicos
   Para agregar un artículo manualmente: copia un objeto del array
   y llena los campos. article.html lo renderiza automáticamente.
   Última actualización automática: ${todayISO()}
   ============================================================ */

const ARTICLES = [

`;
  const footer = `
];

if (typeof module !== 'undefined') module.exports = { ARTICLES };
`;
  const items = articles
    .map(a =>
      '/* ─────────────────────────────────────────────────── */\n' +
      JSON.stringify(a, null, 2)
    )
    .join(',\n\n');

  return header + items + footer;
}

// ── Social copy (va a GitHub Artifact, no al repo) ────────────────
function writeSocialFile(newArticles, socialDataList) {
  const date = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const sep = '═'.repeat(60);

  let content = `${sep}\nPRODIGY AUTO-JOURNAL — ${date}\n${sep}\n`;

  newArticles.forEach((art, i) => {
    const s = socialDataList[i] || {};
    const url = `https://prodigylabdental.com/article?id=${art.id}`;
    content += `\n📝 ARTÍCULO: ${art.titulo}\n`;
    content += `🔗 URL: ${url}\n`;
    if (art.og_img) content += `🖼️  IMAGEN: ${art.og_img}\n`;
    content += `\n📸 INSTAGRAM (copia y pega):\n${s.social_instagram || '—'}\n`;
    content += `\n💼 LINKEDIN (copia y pega):\n${s.social_linkedin || '—'}\n`;
    content += `\n${'─'.repeat(40)}\n`;
  });

  fs.writeFileSync(SOCIAL_PATH, content, 'utf8');
  console.log('✅ marketing-social.txt generado (GitHub Artifact — no se sube al repo)');
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  if (!GEMINI_KEY) {
    console.error('❌ GEMINI_API_KEY no está definida');
    process.exit(1);
  }

  console.log(`\n🚀 PRODIGY Auto-Journal — ${todayISO()}`);
  console.log(`📡 Motor: Google Gemini 2.0 Flash`);
  console.log(`🖼️  Imágenes: Wikipedia REST API (sin key)\n`);

  const topics = pickTopics();
  const newArticles   = [];
  const socialDataList = [];

  for (const topic of topics) {
    console.log(`\n── Generando: "${topic.titulo_seed}"`);

    try {
      // 1. Texto con Gemini
      const raw    = await callGemini(buildPrompt(topic));
      const aiData = parseGeminiResponse(raw);
      console.log(`   ✅ Texto: "${aiData.titulo}"`);
      console.log(`   📚 Referencias: ${aiData.referencias.length}`);

      // 2. Imagen con Wikipedia API (sin key)
      const image = await fetchWikipediaImage(topic.wiki_article);
      if (image) console.log(`   🖼️  Imagen: ${image.credit}`);
      else        console.log(`   ⚠️  Sin imagen (Wikipedia no devolvió portada)`);

      // 3. Construir artículo
      const article = buildArticleObject(topic, aiData, image);
      newArticles.push(article);
      socialDataList.push(aiData);

    } catch (err) {
      console.error(`   ❌ Error (${topic.slug_prefix}):`, err.message);
    }
  }

  if (newArticles.length === 0) {
    console.error('\n❌ No se generó ningún artículo. Abortando.');
    process.exit(1);
  }

  // 4. Prepend al articles.js existente
  let existing = [];
  try {
    existing = readExistingArticles();
    console.log(`\n📚 Artículos existentes: ${existing.length}`);
  } catch (e) {
    console.warn('⚠️  No se pudo leer articles.js:', e.message);
  }

  const allArticles = [...newArticles, ...existing];
  fs.writeFileSync(ARTICLES_PATH, serializeArticles(allArticles), 'utf8');
  console.log(`✅ articles.js → ${allArticles.length} artículos totales`);

  // 5. Social copy (Artifact)
  writeSocialFile(newArticles, socialDataList);

  // 6. Actualizar sitemap.xml con los nuevos artículos
  updateSitemap(newArticles);

  console.log('\n🎉 Auto-Journal completado.\n');
  newArticles.forEach(a => {
    console.log(`   → ${a.titulo}`);
    console.log(`     ID: ${a.id}`);
    if (a.og_img) console.log(`     IMG: ${a.og_img.slice(0, 60)}...`);
  });
}

function updateSitemap(articles) {
  const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
  try {
    let xml = fs.readFileSync(sitemapPath, 'utf8');
    for (const a of articles) {
      const entry = `  <url>\n    <loc>https://prodigylabdental.com/article?id=${a.id}</loc>\n    <lastmod>${todayISO()}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
      xml = xml.replace('</urlset>', entry + '\n\n</urlset>');
    }
    fs.writeFileSync(sitemapPath, xml, 'utf8');
    console.log(`✅ sitemap.xml actualizado con ${articles.length} artículo(s)`);
  } catch (e) {
    console.warn('⚠️  No se pudo actualizar sitemap.xml:', e.message);
  }
}

main().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
