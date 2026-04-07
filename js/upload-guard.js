/**
 * PRODIGY — Upload Guard v1.0
 * Agente 1: Seguridad — Validación de archivos antes de subida
 *
 * Uso:
 *   const r = validateUpload(file, 'CAD');
 *   if (!r.valid) { showUploadError(r.error); return; }
 */

const UPLOAD_RULES = {
    CAD: {
        allowed: ['.stl', '.obj', '.ply'],
        blocked: ['.scene', '.cad', '.3dm', '.3ds', '.max', '.mb', '.ma', '.blend',
                  '.mp4', '.avi', '.mov', '.mkv', '.wmv', '.webm', '.m4v', '.exe',
                  '.zip', '.rar', '.7z', '.js', '.php', '.sh'],
        maxMB:   500,
        label:   'archivos CAD'
    },
    COMPROBANTE: {
        allowed: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
        blocked: [],
        maxMB:   10,
        label:   'comprobantes de pago'
    },
    FOTO_SALIDA: {
        allowed: ['.jpg', '.jpeg', '.png', '.webp'],
        blocked: [],
        maxMB:   20,
        label:   'fotos de control de calidad'
    }
};

/**
 * Valida un File antes de subirlo.
 * @param {File}   file
 * @param {'CAD'|'COMPROBANTE'|'FOTO_SALIDA'} tipo
 * @returns {{ valid: boolean, error?: string }}
 */
function validateUpload(file, tipo = 'CAD') {
    const cfg  = UPLOAD_RULES[tipo];
    if (!cfg) return { valid: false, error: 'Tipo de validación desconocido.' };

    const name = file.name.toLowerCase();
    const dot  = name.lastIndexOf('.');
    const ext  = dot >= 0 ? name.slice(dot) : '';

    if (cfg.blocked.includes(ext)) {
        return {
            valid: false,
            error: `⛔ Formato bloqueado: ${ext.toUpperCase()}. `
                 + `Solo se aceptan: ${cfg.allowed.join(', ').toUpperCase()}`
        };
    }
    if (!cfg.allowed.includes(ext)) {
        return {
            valid: false,
            error: `❌ Formato no reconocido: ${ext ? ext.toUpperCase() : '(sin extensión)'}. `
                 + `Formatos aceptados: ${cfg.allowed.join(', ').toUpperCase()}`
        };
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > cfg.maxMB) {
        return {
            valid: false,
            error: `❌ Archivo muy grande (${sizeMB.toFixed(1)} MB). Máximo: ${cfg.maxMB} MB.`
        };
    }
    return { valid: true };
}

/**
 * Elimina columnas PII de un objeto de caso antes de mostrarlo en panel operador.
 * Cuando la DB esté conectada, llamar esto antes de renderizar cada caso.
 */
function filtrarPIIOperador(caso) {
    if (!caso) return caso;
    const PII_FIELDS = ['doctor_uid', 'email', 'nombre_doctor', 'nombre_paciente',
                        'telefono', 'customer_name', 'customer_email', 'customer_phone'];
    const limpio = { ...caso };
    PII_FIELDS.forEach(f => delete limpio[f]);
    return limpio;
}

/** Muestra un toast de error de validación de archivo */
function showUploadError(message) {
    let toast = document.getElementById('pg-upload-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'pg-upload-toast';
        toast.style.cssText = [
            'position:fixed', 'bottom:80px', 'left:50%', 'transform:translateX(-50%)',
            'background:#0d0000', 'border:1px solid #ef4444', 'color:#f87171',
            'padding:12px 22px', 'border-radius:10px', 'font-size:0.88rem',
            'font-weight:700', 'z-index:9999', 'max-width:90vw', 'text-align:center',
            'box-shadow:0 4px 20px rgba(239,68,68,0.35)',
            'transition:opacity 0.3s'
        ].join(';');
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.display = 'block';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 4500);
    setTimeout(() => { if (toast.style.opacity === '0') toast.style.display = 'none'; }, 4900);
}

window.validateUpload     = validateUpload;
window.filtrarPIIOperador = filtrarPIIOperador;
window.showUploadError    = showUploadError;
window.UPLOAD_RULES       = UPLOAD_RULES;
