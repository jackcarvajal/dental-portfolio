/**
 * PRODIGY — Flujo Uploader v1.0
 * Sube los archivos del ProdigyMultiViewer a Supabase Storage
 * y devuelve un array con URLs firmadas (createSignedUrl).
 *
 * Bucket requerido en Supabase: "pedidos-archivos" (privado desde
 * patch-storage-buckets-privados-2026.sql — lectura solo vía signed URL,
 * excepto anon/ que anon puede leer para el flujo sin sesión)
 * Path: {uid}/{orderId}/{filename}
 *
 * Uso en sendToWhatsApp():
 *   const urls = await FlujoUploader.upload(STATE.ordenId);
 *   STATE.linkSTL = urls.join(', ');
 */
(function () {
    const SUPABASE_URL  = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
    const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhyd3FmeXZneWFwYnd6a3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzczNDksImV4cCI6MjA5MDg1MzM0OX0.9CzmFDQYeQKcbtAZoT1_n_OuJ1qPVJu3jImd938T634';
    const BUCKET        = 'pedidos-archivos';

    function getSb() {
        // Reutilizar cliente de ProdigyAuth si existe
        if (window.ProdigyAuth && window.ProdigyAuth.getSb) return window.ProdigyAuth.getSb();
        return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    }

    function sanitizeFilename(name) {
        return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    }

    /**
     * Sube todos los archivos del ProdigyMultiViewer al bucket.
     * @param {string} orderId  — ID de la orden (ej. "FRE-2026-001")
     * @param {Function} onProgress — callback(n, total) opcional
     * @param {string} contexto — clave de js/formatos.js (default: 'cliente_caso')
     * @returns {Promise<string[]>} — array de URLs firmadas; `.fallidos` lista los rechazos
     */
    async function upload(orderId, onProgress, contexto) {
        contexto = contexto || 'cliente_caso';
        if (!window.ProdigyMultiViewer) return [];
        const files = window.ProdigyMultiViewer.getFiles();
        if (!files || !files.length) return [];

        const sb = getSb();

        // Obtener uid del usuario autenticado
        const { data: { session } } = await sb.auth.getSession();
        const uid = session?.user?.id || 'anon';

        const urls = [];
        const fallidos = [];   // se le informan al usuario al terminar
        const subidos  = [];   // {bucket, ruta, nombre, file} para pedido_archivos
        const safeOrderId = (orderId || 'sin-id').replace(/[^a-zA-Z0-9_-]/g, '-');

        for (let i = 0; i < files.length; i++) {
            const f = files[i];

            // Validación contra la fuente única de verdad (js/formatos.js).
            // Antes había una lista local que contradecía al visor y al guard:
            // los .zip (CBCT) y .3oxz se descartaban en silencio.
            if (window.PFormatos) {
                const chk = await window.PFormatos.validarCompleto(f, contexto);
                if (!chk.ok) {
                    console.warn('[FlujoUploader] Rechazado:', f.name, chk.error);
                    fallidos.push({ name: f.name, error: chk.error });
                    continue;
                }
            }

            const safeName = sanitizeFilename(f.name);
            const path     = `${uid}/${safeOrderId}/${safeName}`;

            if (onProgress) onProgress(i, files.length);

            // Reintento con backoff — redes móviles inestables cortan subidas grandes a mitad
            const MAX_INTENTOS = 3;
            let uploadError = null;
            for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
                const { error } = await sb.storage
                    .from(BUCKET)
                    .upload(path, f, {
                        contentType: f.type || 'application/octet-stream',
                        upsert: true
                    });
                uploadError = error;
                if (!error) break;
                console.warn(`[FlujoUploader] Intento ${intento}/${MAX_INTENTOS} falló para ${f.name}:`, error.message);
                if (intento < MAX_INTENTOS) {
                    await new Promise(r => setTimeout(r, 1000 * intento)); // backoff: 1s, 2s
                }
            }

            if (uploadError) {
                console.warn('[FlujoUploader] Error definitivo subiendo', f.name, uploadError.message);
                fallidos.push({ name: f.name, error: `No se pudo subir "${f.name}" tras 3 intentos. Revisa tu conexión.` });
                // Continuar con el siguiente archivo en lugar de abortar todo el pedido
                continue;
            }

            // Ruta + bucket para registrar en `pedido_archivos` DESPUÉS de crear el
            // pedido (aquí todavía no existe: el insert ocurre al final del flujo).
            subidos.push({ bucket: BUCKET, ruta: path, nombre: f.name, file: f });

            const { data: signedData } = await sb.storage.from(BUCKET).createSignedUrl(path, 157788000); // 5 años — bucket privado, URL persiste en el pedido
            if (signedData?.signedUrl) urls.push(signedData.signedUrl);
        }

        if (onProgress) onProgress(files.length, files.length);

        // AVISAR AL USUARIO. Antes todos los fallos eran mudos (solo console.warn):
        // el doctor creía haber enviado el CBCT y el laboratorio recibía el caso sin él.
        if (fallidos.length) {
            const detalle = fallidos.map(x => '• ' + x.error).join('\n');
            if (window.showUploadError) {
                window.showUploadError(
                    fallidos.length === 1
                        ? fallidos[0].error
                        : `${fallidos.length} archivos no se enviaron. Revisa el detalle.`
                );
            }
            console.warn('[FlujoUploader] Archivos no enviados:\n' + detalle);
        }

        // 🎉 Celebración al enviar el caso — emojis variados según el flujo.
        // (En /flujo-diseno ya hubo un toast por-archivo; aquí solo confetti de cierre.)
        try {
            if (urls.length) {
                const pg = (location.pathname || '').toLowerCase();
                let emojis, esDiseno = pg.indexOf('diseno') > -1;
                if (pg.indexOf('fresado') > -1)        emojis = ['⚙️','💎','✨','🔩','🦷','🎉'];
                else if (pg.indexOf('impresion') > -1)  emojis = ['🖨️','🧩','✨','🦷','🎯','🎉'];
                else if (pg.indexOf('lab') > -1)         emojis = ['🔬','🧪','🦷','✨','⭐','🎉'];
                else                                     emojis = ['🦷','✨','🎉','💎','📐','🚀'];
                if (esDiseno) {
                    if (window.confettiBurst) window.confettiBurst({ origin:{x:0.5,y:0.35}, particleCount:120, emojis });
                } else if (window.celebrateUpload) {
                    window.celebrateUpload(null, { emojis });
                } else if (window.confettiBurst) {
                    window.confettiBurst({ origin:{x:0.5,y:0.35}, particleCount:130, emojis });
                }
            }
        } catch (_e) { /* la celebración nunca debe tumbar un envío */ }

        // Retrocompatible: se sigue devolviendo un ARRAY (los 4 flujos hacen urls.length
        // y urls.join), con las listas extra colgadas como propiedades.
        urls.fallidos = fallidos;
        urls.subidos  = subidos;
        return urls;
    }

    /**
     * Registra en `pedido_archivos` lo subido y lo fallido de una tanda.
     * Se llama DESPUÉS del insert del pedido, cuando ya existe su UUID.
     * Nunca lanza: un fallo de auditoría no debe tumbar un pedido válido.
     *
     * @param {object} sb        cliente supabase
     * @param {string} pedidoId  UUID del pedido ya creado
     * @param {Array}  resultado lo que devolvió upload()
     * @param {object} opts      { etapa, subidoPor }
     */
    async function registrarEnPedido(sb, pedidoId, resultado, opts) {
        if (!window.PRegArchivos || !sb || !pedidoId || !resultado) return;
        opts = opts || {};
        try {
            if (resultado.subidos && resultado.subidos.length) {
                await window.PRegArchivos.registrar(sb, pedidoId, resultado.subidos, opts);
            }
            // Dejar rastro de lo que NO llegó — antes esto no quedaba en ningún lado
            for (const f of (resultado.fallidos || [])) {
                await window.PRegArchivos.registrarFallo(sb, pedidoId, f.name, f.error, opts);
            }
        } catch (e) {
            console.warn('[FlujoUploader] registrarEnPedido falló:', e);
        }
    }

    /**
     * Versión simplificada: retorna "Subiendo..." y sube en background,
     * útil si el flujo no puede ser async.
     * Llama callback(urls) cuando termina.
     */
    function uploadAsync(orderId, callback) {
        upload(orderId).then(urls => {
            if (callback) callback(urls);
        }).catch(err => {
            console.warn('[FlujoUploader] uploadAsync error:', err);
            if (callback) callback([]);
        });
    }

    window.FlujoUploader = { upload, uploadAsync, registrarEnPedido };
})();
