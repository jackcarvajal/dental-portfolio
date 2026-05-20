/**
 * Content Guard — Filtra datos sensibles en comentarios e imágenes
 * Aplica en: feedback de casos, notas de cambios, comentarios del portafolio
 * Usado en AMBOS proyectos: PRODIGY y alejandrocadcam
 */

// Patrones que NO pueden aparecer en comentarios públicos
const PATRONES_PRIVADOS = [
  /(\+?57|0057)?[\s\-.]?3[0-9]{2}[\s\-.]?[0-9]{3}[\s\-.]?[0-9]{4}/g, // Teléfonos Colombia
  /(\+?1)?[\s\-.]?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/g,           // Teléfonos USA
  /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,              // Emails
  /wa\.me\/\d+/gi,                                                       // Links WA
  /whatsapp\.com\/send/gi,                                               // Links WA
  /https?:\/\/[^\s]+/gi,                                                // URLs externas (en comentarios de clientes)
];

const PALABRAS_PROHIBIDAS = [
  'mierda','puta','puto','culo','coño','verga','hijueputa','hp',
  'idiota','estupido','imbecil','pendejo','cabron','joder',
  'fuck','shit','ass','bitch','bastard','cunt'
];

/**
 * Valida un texto antes de guardarlo
 * @returns {object} { ok: boolean, error: string|null, texto: string }
 */
function validarTextoPublico(texto) {
  if (!texto || !texto.trim()) return { ok: false, error: 'El texto no puede estar vacío.' };

  const t = texto.trim();

  // Verificar palabras prohibidas
  const lower = t.toLowerCase();
  const palabraMala = PALABRAS_PROHIBIDAS.find(p => lower.includes(p));
  if (palabraMala) return { ok: false, error: 'El comentario contiene lenguaje inapropiado. Por favor usa un tono profesional.' };

  // Verificar datos privados
  for (const patron of PATRONES_PRIVADOS) {
    patron.lastIndex = 0;
    if (patron.test(t)) {
      return {
        ok: false,
        error: 'Por seguridad no puedes incluir números de teléfono, emails ni links en los comentarios. Para comunicarte directamente usa WhatsApp o el canal de soporte.'
      };
    }
  }

  if (t.length > 1000) return { ok: false, error: 'El comentario no puede superar 1000 caracteres.' };

  return { ok: true, error: null, texto: t };
}

/**
 * Valida una imagen antes de subirla
 * Solo permite formatos de imagen, bloquea PDFs con metadatos sensibles
 */
function validarArchivo(file, tipo = 'imagen') {
  if (!file) return { ok: false, error: 'No se seleccionó archivo.' };

  const TIPOS_IMAGEN = ['image/jpeg','image/jpg','image/png','image/webp','image/heic','image/heif'];
  const TIPOS_STL    = ['application/octet-stream','model/stl','application/sla'];
  const TIPOS_DOC    = ['application/pdf','image/jpeg','image/png'];

  const maxMB = tipo === 'stl' ? 50 : tipo === 'doc' ? 10 : 5;
  const maxBytes = maxMB * 1024 * 1024;

  if (file.size > maxBytes) return { ok: false, error: `El archivo no puede superar ${maxMB}MB.` };

  if (tipo === 'imagen' && !TIPOS_IMAGEN.includes(file.type)) {
    return { ok: false, error: 'Solo se permiten imágenes (JPG, PNG, WebP).' };
  }
  if (tipo === 'doc' && !TIPOS_DOC.includes(file.type)) {
    return { ok: false, error: 'Solo se permiten imágenes o PDF.' };
  }

  return { ok: true, error: null };
}

/**
 * Muestra error de validación en un elemento toast o alerta
 */
function mostrarErrorValidacion(mensaje, toastFn) {
  if (typeof toastFn === 'function') {
    toastFn(mensaje, 'error');
  } else {
    alert(mensaje);
  }
}
