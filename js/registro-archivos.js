/**
 * PRODIGY — Registro de archivos del caso
 * v1.0 · 2026-07-18
 *
 * Escribe una fila en `pedido_archivos` por cada archivo que entra al caso.
 * Sirve para responder lo que antes no se podía preguntar:
 *   · ¿Cuántos archivos debían llegar vs. cuántos llegaron?
 *   · ¿Este caso trae el CBCT antes de mandarlo a producción?
 *   · ¿Cuál de estas 5 imágenes es la radiografía y cuál la toma de color?
 *
 * Se llena EN PARALELO a las columnas viejas (stl_url, stl_urls, fotos_feedback).
 * No las reemplaza todavía: los paneles siguen leyendo de ellas.
 *
 * Uso:
 *   await PRegArchivos.registrar(sb, pedidoId, [
 *     { bucket:'pedidos-archivos', ruta:'uid/ORD-1/caso.stl', file: fileObj }
 *   ], { etapa:'cliente_caso', subidoPor: email });
 *
 *   await PRegArchivos.registrarFallo(sb, pedidoId, 'caso.zip', 'Formato no soportado');
 */
(function () {

    /* Extensión → tipo clínico. Cuando no se puede deducir del formato
       (una imagen puede ser foto o radiografía), se usa 'foto_clinica' y el
       operario puede reclasificarla desde el panel. */
    const TIPO_POR_EXT = {
        '.stl':'escaneo', '.stlb':'escaneo', '.stla':'escaneo',
        '.ply':'escaneo', '.obj':'escaneo',
        '.dcm':'cbct', '.dicom':'cbct',
        '.3oxz':'proyecto_cad', '.3ox':'proyecto_cad',
        '.constructioninfo':'proyecto_cad', '.constructionfile':'proyecto_cad', '.dxd':'proyecto_cad',
        '.zip':'libreria', '.rar':'libreria', '.7z':'libreria',
        '.jpg':'foto_clinica', '.jpeg':'foto_clinica', '.png':'foto_clinica',
        '.webp':'foto_clinica', '.heic':'foto_clinica', '.heif':'foto_clinica',
        '.tiff':'radiografia', '.tif':'radiografia',   // las Rx suelen venir en TIFF
        '.pdf':'diagnostico',
        '.html':'diseno', '.htm':'diseno'
    };

    function extDe(nombre) {
        if (window.PFormatos) return window.PFormatos.extDe(nombre);
        const n = String(nombre || '').toLowerCase();
        const i = n.lastIndexOf('.');
        return i >= 0 ? n.slice(i) : '';
    }

    /**
     * Deduce el tipo clínico. `pista` permite forzarlo desde la UI
     * (ej. el doctor sube en la casilla "Radiografía" → pista='radiografia').
     */
    function tipoDe(nombre, etapa, pista) {
        if (pista) return pista;
        const ext = extDe(nombre);

        // La etapa manda sobre la extensión en los casos claros
        if (etapa === 'cliente_pago')        return 'comprobante';
        if (etapa === 'operario_evidencia')  return ext === '.pdf' ? 'factura' : 'evidencia';
        if (etapa === 'operario_diseno' && ext === '.stl') return 'stl_final';

        // El ZIP es ambiguo: puede ser CBCT o una librería. Si el nombre lo
        // sugiere, se marca como CBCT — es el caso que más importa no perder.
        if (['.zip','.rar','.7z'].includes(ext)) {
            if (/cbct|dicom|tomograf|tac\b/i.test(nombre)) return 'cbct';
        }
        if (/\brx\b|periapical|panoramic|panoramica/i.test(nombre)) return 'radiografia';

        return TIPO_POR_EXT[ext] || 'otro';
    }

    /**
     * Registra archivos subidos con éxito.
     * Nunca lanza: si el registro falla, la subida real ya ocurrió y no debe
     * perderse el pedido por un problema de auditoría.
     */
    async function registrar(sb, pedidoId, archivos, opts) {
        opts = opts || {};
        if (!sb || !pedidoId || !archivos || !archivos.length) return { ok: false, n: 0 };

        const etapa = opts.etapa || 'cliente_caso';
        const filas = archivos.map(a => {
            const nombre = a.nombre || (a.file && a.file.name) || 'archivo';
            return {
                pedido_id:  pedidoId,
                bucket:     a.bucket,
                ruta:       a.ruta,
                nombre:     String(nombre).slice(0, 200),
                extension:  extDe(nombre),
                peso_bytes: a.file ? a.file.size : (a.peso || null),
                mime:       a.file ? (a.file.type || null) : (a.mime || null),
                tipo:       tipoDe(nombre, etapa, a.tipo),
                etapa:      etapa,
                estado:     'ok',
                subido_por: opts.subidoPor || null
            };
        }).filter(f => f.bucket && f.ruta);

        if (!filas.length) return { ok: false, n: 0 };

        // upsert: los reintentos de subida no deben duplicar el registro
        const { error } = await sb.from('pedido_archivos')
            .upsert(filas, { onConflict: 'pedido_id,bucket,ruta', ignoreDuplicates: true });

        if (error) {
            console.warn('[PRegArchivos] No se registraron los archivos:', error.message);
            return { ok: false, n: 0, error: error.message };
        }
        return { ok: true, n: filas.length };
    }

    /**
     * Deja constancia de un archivo que NO llegó.
     * Esto es lo que faltaba: cuando el CBCT se descartaba en silencio, no
     * quedaba ni un rastro en la base de que el doctor lo había intentado.
     */
    async function registrarFallo(sb, pedidoId, nombre, motivo, opts) {
        opts = opts || {};
        if (!sb || !pedidoId || !nombre) return { ok: false };

        const { error } = await sb.from('pedido_archivos').insert({
            pedido_id:  pedidoId,
            bucket:     '(no subido)',
            ruta:       'fallido/' + Date.now() + '/' + String(nombre).slice(0, 100),
            nombre:     String(nombre).slice(0, 200),
            extension:  extDe(nombre),
            tipo:       tipoDe(nombre, opts.etapa || 'cliente_caso'),
            etapa:      opts.etapa || 'cliente_caso',
            estado:     'fallido',
            error_msg:  String(motivo || '').slice(0, 500),
            subido_por: opts.subidoPor || null
        });

        if (error) {
            console.warn('[PRegArchivos] No se registró el fallo:', error.message);
            return { ok: false };
        }
        return { ok: true };
    }

    /** Resumen de lo que tiene (y le falta) a un caso. */
    async function resumen(sb, pedidoId) {
        const { data, error } = await sb
            .from('pedidos_archivos_resumen')
            .select('*')
            .eq('pedido_id', pedidoId)
            .single();
        if (error) return null;
        return data;
    }

    window.PRegArchivos = { registrar, registrarFallo, resumen, tipoDe, TIPO_POR_EXT };
})();
