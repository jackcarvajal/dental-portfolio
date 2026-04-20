/**
 * PRODIGY — Flujo Uploader v1.0
 * Sube los archivos del ProdigyMultiViewer a Supabase Storage
 * y devuelve un array con las URLs públicas.
 *
 * Bucket requerido en Supabase: "pedidos-archivos" (público, no RLS en reads)
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
     * @returns {Promise<string[]>} — array de URLs públicas
     */
    async function upload(orderId, onProgress) {
        if (!window.ProdigyMultiViewer) return [];
        const files = window.ProdigyMultiViewer.getFiles();
        if (!files || !files.length) return [];

        const sb = getSb();

        // Obtener uid del usuario autenticado
        const { data: { session } } = await sb.auth.getSession();
        const uid = session?.user?.id || 'anon';

        const urls = [];
        const safeOrderId = (orderId || 'sin-id').replace(/[^a-zA-Z0-9_-]/g, '-');

        for (let i = 0; i < files.length; i++) {
            const f        = files[i];
            const safeName = sanitizeFilename(f.name);
            const path     = `${uid}/${safeOrderId}/${safeName}`;

            if (onProgress) onProgress(i, files.length);

            const { error } = await sb.storage
                .from(BUCKET)
                .upload(path, f, {
                    contentType: f.type || 'application/octet-stream',
                    upsert: true
                });

            if (error) {
                console.warn('[FlujoUploader] Error subiendo', f.name, error.message);
                // Continuar con el siguiente archivo en lugar de abortar
                continue;
            }

            const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
            if (pub?.publicUrl) urls.push(pub.publicUrl);
        }

        if (onProgress) onProgress(files.length, files.length);
        return urls;
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

    window.FlujoUploader = { upload, uploadAsync };
})();
