/**
 * PRODIGY — Formatos de archivo · FUENTE ÚNICA DE VERDAD
 * v1.0 · 2026-07-18
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 * Antes había CUATRO listas de formatos que no coincidían entre sí:
 *   - js/stl-multi-viewer.js  (ACCEPT_EXTS)
 *   - js/flujo-uploader.js    (ALLOWED_EXTS)
 *   - js/upload-guard.js      (UPLOAD_RULES.CAD)
 *   - flujo-diseno.html       (ALLOWED_EXT inline)
 * Consecuencias reales en producción:
 *   · El CBCT (.zip de DICOM) se descartaba en silencio → el caso llegaba sin tomografía
 *   · Los .3oxz de 3Shape también (son contenedores ZIP)
 *   · Se anunciaba .constructioninfo pero el código esperaba .constructionfile
 *   · El .pdf se aceptaba al subir pero el visor no dejaba seleccionarlo
 *
 * REGLA: cualquier cambio de formatos se hace AQUÍ y solo aquí.
 *
 * Uso:
 *   PFormatos.permitidos('cliente_caso')        → ['.stl','.ply',...]
 *   PFormatos.accept('cliente_caso')            → ".stl,.ply,..."  (para <input accept>)
 *   PFormatos.validar(file, 'cliente_caso')     → { ok:true } | { ok:false, error:'...' }
 *   PFormatos.categoria('.stl')                 → 'modelo3d'
 *   PFormatos.meta('.stl')                      → { icon, label, color, visor }
 */
(function () {

    /* ═══════════════════════════════════════════════════════════════
       CATEGORÍAS — qué es cada archivo y con qué visor se abre
       ═══════════════════════════════════════════════════════════════ */
    const CATEGORIAS = {
        modelo3d:  { visor: 'stl',    label: 'Modelo 3D' },
        tomografia:{ visor: 'ninguno',label: 'Tomografía' },
        proyecto:  { visor: 'ninguno',label: 'Proyecto CAD' },
        libreria:  { visor: 'ninguno',label: 'Librería' },
        diseno:    { visor: 'html',   label: 'Diseño' },
        imagen:    { visor: 'imagen', label: 'Imagen' },
        documento: { visor: 'pdf',    label: 'Documento' },
        // NOTA: las notas de voz se evaluaron y se descartaron (decisión 2026-07-18).
        // El feedback clínico se canaliza por TEXTO + IMAGEN: una foto marcando el
        // margen es más precisa que un audio, y el texto queda buscable y auditable.
        // No re-agregar audio sin revisar esa decisión.
    };

    /* ═══════════════════════════════════════════════════════════════
       EXTENSIONES — metadatos por tipo
       ═══════════════════════════════════════════════════════════════ */
    const EXT = {
        // ── Modelos 3D (escaneo intraoral, diseño) ──
        '.stl':  { cat:'modelo3d',  icon:'fa-cube',         label:'STL',      color:'#00d2ff' },
        '.stlb': { cat:'modelo3d',  icon:'fa-cube',         label:'STL bin',  color:'#00d2ff' },
        '.stla': { cat:'modelo3d',  icon:'fa-cube',         label:'STL ascii',color:'#00d2ff' },
        '.obj':  { cat:'modelo3d',  icon:'fa-object-group', label:'OBJ',      color:'#a78bfa' },
        '.ply':  { cat:'modelo3d',  icon:'fa-layer-group',  label:'PLY',      color:'#60a5fa' },

        // ── Tomografía / CBCT — casi siempre llega como ZIP de cortes DICOM ──
        '.dcm':  { cat:'tomografia',icon:'fa-x-ray',        label:'DICOM',    color:'#34d399' },
        '.dicom':{ cat:'tomografia',icon:'fa-x-ray',        label:'DICOM',    color:'#34d399' },

        // ── Proyectos CAD nativos ──
        '.3oxz': { cat:'proyecto',  icon:'fa-tooth',        label:'3Shape',   color:'#f472b6' },
        '.3ox':  { cat:'proyecto',  icon:'fa-tooth',        label:'3Shape',   color:'#f472b6' },
        '.constructioninfo': { cat:'proyecto', icon:'fa-drafting-compass', label:'Exocad', color:'#fbbf24' },
        '.constructionfile': { cat:'proyecto', icon:'fa-drafting-compass', label:'Exocad', color:'#fbbf24' },
        '.dxd':  { cat:'proyecto',  icon:'fa-drafting-compass', label:'Exocad DXD', color:'#fbbf24' },

        // ── Librerías (implantes, dientes, atributos) y contenedores ──
        // El ZIP es imprescindible: CBCT, librerías Exocad y proyectos 3Shape viajan así.
        '.zip':  { cat:'libreria',  icon:'fa-file-zipper',  label:'ZIP',      color:'#fbbf24' },
        '.rar':  { cat:'libreria',  icon:'fa-file-zipper',  label:'RAR',      color:'#fbbf24' },
        '.7z':   { cat:'libreria',  icon:'fa-file-zipper',  label:'7Z',       color:'#fbbf24' },

        // ── Diseño entregable ──
        '.html': { cat:'diseno',    icon:'fa-cube',         label:'Visor 3D', color:'#D946A6' },
        '.htm':  { cat:'diseno',    icon:'fa-cube',         label:'Visor 3D', color:'#D946A6' },

        // ── Imágenes clínicas / control de calidad ──
        '.jpg':  { cat:'imagen',    icon:'fa-image',        label:'JPG',      color:'#fb923c' },
        '.jpeg': { cat:'imagen',    icon:'fa-image',        label:'JPG',      color:'#fb923c' },
        '.png':  { cat:'imagen',    icon:'fa-image',        label:'PNG',      color:'#4ade80' },
        '.webp': { cat:'imagen',    icon:'fa-image',        label:'WEBP',     color:'#a3e635' },
        '.heic': { cat:'imagen',    icon:'fa-image',        label:'HEIC',     color:'#fb923c' },
        '.heif': { cat:'imagen',    icon:'fa-image',        label:'HEIF',     color:'#fb923c' },
        '.tiff': { cat:'imagen',    icon:'fa-image',        label:'TIFF',     color:'#94a3b8' },
        '.tif':  { cat:'imagen',    icon:'fa-image',        label:'TIFF',     color:'#94a3b8' },
        '.bmp':  { cat:'imagen',    icon:'fa-image',        label:'BMP',      color:'#94a3b8' },
        '.gif':  { cat:'imagen',    icon:'fa-image',        label:'GIF',      color:'#c084fc' },

        // ── Documentos ──
        '.pdf':  { cat:'documento', icon:'fa-file-pdf',     label:'PDF',      color:'#ef4444' },

    };

    /* ═══════════════════════════════════════════════════════════════
       CONTEXTOS — quién sube qué, en qué momento, y si es obligatorio
       ═══════════════════════════════════════════════════════════════ */
    const CONTEXTOS = {
        // ── TRAMO 1 · El cliente abre el caso ──────────────────────
        cliente_caso: {
            label: 'archivos del caso',
            cats:  ['modelo3d','tomografia','proyecto','libreria','imagen','documento'],
            maxMB: 500,
            obligatorio: true,   // no se puede enviar un caso sin al menos un archivo
            minArchivos: 1
        },
        // ── TRAMO 1b · El cliente responde una revisión ────────────
        cliente_revision: {
            label: 'archivos de la revisión',
            cats:  ['modelo3d','imagen','documento'],
            maxMB: 200,
            obligatorio: false,  // puede pedir cambios solo con texto
            minArchivos: 0
        },
        // ── TRAMO 1c · Comprobante de pago ─────────────────────────
        cliente_pago: {
            label: 'comprobante de pago',
            cats:  ['imagen','documento'],
            maxMB: 10,
            obligatorio: true,
            minArchivos: 1
        },
        // ── TRAMO 2 · El operario entrega ──────────────────────────
        operario_diseno: {
            label: 'diseño terminado',
            cats:  ['diseno','modelo3d','proyecto','imagen','documento'],
            maxMB: 500,
            obligatorio: true,
            minArchivos: 1
        },
        // ── TRAMO 2b · Evidencia de producción / entrega ───────────
        operario_evidencia: {
            label: 'evidencia',
            cats:  ['imagen','documento'],
            maxMB: 20,
            obligatorio: false,
            minArchivos: 0
        },
    };

    /* ═══════════════════════════════════════════════════════════════
       FIRMAS PELIGROSAS — lo que NUNCA debe subirse
       Se valida por contenido, no por extensión (un .exe renombrado a .stl
       sigue siendo un .exe). El ZIP NO está aquí: es un formato legítimo y
       necesario; el riesgo real son los ejecutables.
       ═══════════════════════════════════════════════════════════════ */
    const FIRMAS_BLOQUEADAS = [
        { sig:[0x4D,0x5A],           label:'ejecutable Windows (EXE/DLL)' },
        { sig:[0x7F,0x45,0x4C,0x46], label:'ejecutable Linux (ELF)' },
        { sig:[0x23,0x21],           label:'script de shell (#!)' },
        { sig:[0xCA,0xFE,0xBA,0xBE], label:'ejecutable macOS (Mach-O)' },
        { sig:[0xCF,0xFA,0xED,0xFE], label:'ejecutable macOS (Mach-O 64)' },
        { sig:[0xCE,0xFA,0xED,0xFE], label:'ejecutable macOS (Mach-O 32)' },
    ];

    /* ═══════════════════════════════════════════════════════════════
       API
       ═══════════════════════════════════════════════════════════════ */

    function extDe(nombre) {
        const n = String(nombre || '').toLowerCase();
        // .constructioninfo y similares: tomar desde el último punto
        const i = n.lastIndexOf('.');
        return i >= 0 ? n.slice(i) : '';
    }

    function permitidos(contexto) {
        const cfg = CONTEXTOS[contexto];
        if (!cfg) return [];
        return Object.keys(EXT).filter(e => cfg.cats.includes(EXT[e].cat));
    }

    function accept(contexto) {
        return permitidos(contexto).join(',');
    }

    function meta(ext) {
        const e = ext.startsWith('.') ? ext.toLowerCase() : '.' + ext.toLowerCase();
        const m = EXT[e];
        if (!m) return { icon:'fa-file', label:'Archivo', color:'#94a3b8', cat:null, visor:'ninguno' };
        return { ...m, visor: (CATEGORIAS[m.cat] || {}).visor || 'ninguno' };
    }

    function categoria(ext) {
        return (meta(ext) || {}).cat || null;
    }

    /** Validación síncrona por nombre y tamaño. */
    function validar(file, contexto) {
        const cfg = CONTEXTOS[contexto];
        if (!cfg) return { ok:false, error:'Contexto de subida desconocido.' };

        const ext = extDe(file.name);
        if (!ext) {
            return { ok:false, error:`"${file.name}" no tiene extensión. Renómbralo (ej. caso.stl) e inténtalo de nuevo.` };
        }
        if (!EXT[ext]) {
            return { ok:false, error:`"${file.name}": el formato ${ext.toUpperCase()} no está soportado. Acepta: ${permitidos(contexto).join(' ').toUpperCase()}` };
        }
        if (!cfg.cats.includes(EXT[ext].cat)) {
            return { ok:false, error:`"${file.name}" (${EXT[ext].label}) no corresponde a ${cfg.label}. Súbelo en la sección adecuada.` };
        }
        const mb = file.size / (1024 * 1024);
        if (mb > cfg.maxMB) {
            return { ok:false, error:`"${file.name}" pesa ${mb.toFixed(0)} MB y el máximo es ${cfg.maxMB} MB. Comprímelo en ZIP o mándalo por WeTransfer.` };
        }
        if (file.size === 0) {
            return { ok:false, error:`"${file.name}" está vacío (0 bytes). Vuelve a exportarlo.` };
        }
        return { ok:true };
    }

    /** Validación por contenido — asíncrona. Detecta ejecutables renombrados. */
    function validarContenido(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const buf = new Uint8Array(e.target.result);
                for (const { sig, label } of FIRMAS_BLOQUEADAS) {
                    if (sig.every((b, i) => buf[i] === b)) {
                        resolve({ ok:false, error:`"${file.name}" fue bloqueado: contiene un ${label}.` });
                        return;
                    }
                }
                resolve({ ok:true });
            };
            reader.onerror = () => resolve({ ok:false, error:`No se pudo leer "${file.name}".` });
            reader.readAsArrayBuffer(file.slice(0, 8));
        });
    }

    /** Validación completa (nombre + tamaño + contenido). */
    async function validarCompleto(file, contexto) {
        const r1 = validar(file, contexto);
        if (!r1.ok) return r1;
        return await validarContenido(file);
    }

    function config(contexto) {
        return CONTEXTOS[contexto] || null;
    }

    window.PFormatos = {
        permitidos, accept, validar, validarContenido, validarCompleto,
        meta, categoria, config, extDe,
        CATEGORIAS, CONTEXTOS, EXT
    };
})();
