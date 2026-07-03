/**
 * Cloudflare Pages Function — Purga real de STL en Supabase Storage
 *
 * GET /api/purgar-stl-storage
 *
 * Reemplaza al cron SQL 'prodigy-purga-stl-semanal' (sql/trigger-purga-stl-30dias.sql),
 * que solo limpiaba columnas en la tabla `pedidos` pero NUNCA borraba el archivo
 * real en Storage (Postgres no puede llamar la API de Storage directamente).
 *
 * Disparado semanalmente por .github/workflows/purga-stl-semanal.yml
 *
 * Variables de entorno requeridas (Cloudflare Pages → Settings → Environment Variables):
 *   SUPABASE_URL          = https://xxx.supabase.co
 *   SUPABASE_SERVICE_KEY  = service_role_key
 *   CRON_SECRET           = string aleatorio compartido con el GitHub Secret del mismo nombre
 *
 * Lógica:
 *   1. Busca pedidos ENTREGADOS hace más de 30 días con stl_ruta sin purgar
 *   2. Borra el archivo real del bucket 'diseno-archivos' vía Storage API
 *   3. Solo si el borrado en Storage fue exitoso (o el archivo ya no existía),
 *      limpia las columnas en `pedidos` y registra en `logs_incidencias`
 */

function corsHeaders() {
  return { 'Content-Type': 'application/json' };
}

async function borrarArchivoStorage(env, bucket, path) {
  if (!path) return { ok: true, skipped: true };
  const res = await fetch(
    `${env.SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(path).replace(/%2F/g, '/')}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'apikey': env.SUPABASE_SERVICE_KEY,
      },
    }
  );
  // 200/404 se tratan como éxito — 404 significa que ya no existe (idempotente)
  return { ok: res.ok || res.status === 404, status: res.status };
}

async function logIncidencia(env, tipo, severidad, descripcion) {
  await fetch(`${env.SUPABASE_URL}/rest/v1/logs_incidencias`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tipo, severidad, descripcion, resuelta: true }),
  }).catch(() => {});
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY || !env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'No configurado' }), { status: 500, headers: corsHeaders() });
  }

  const auth = request.headers.get('Authorization') || '';
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: corsHeaders() });
  }

  try {
    const treintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const query = `${env.SUPABASE_URL}/rest/v1/pedidos?select=id,codigo,stl_ruta,stl_urls` +
      `&estado_operativo=eq.ENTREGADO&updated_at=lt.${encodeURIComponent(treintaDiasAtras)}` +
      `&stl_ruta=not.is.null&or=(stl_purgado.is.null,stl_purgado.eq.false)&limit=50`;

    const pedidosRes = await fetch(query, {
      headers: {
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'apikey': env.SUPABASE_SERVICE_KEY,
      },
    });
    if (!pedidosRes.ok) throw new Error('Error consultando pedidos: ' + pedidosRes.status);
    const pedidos = await pedidosRes.json();

    let purgados = 0;
    let errores = 0;

    for (const pedido of pedidos) {
      try {
        // Borrar STL principal
        const del1 = await borrarArchivoStorage(env, 'diseno-archivos', pedido.stl_ruta);

        // Borrar archivos adicionales si stl_urls es un array de rutas
        const rutasExtra = Array.isArray(pedido.stl_urls) ? pedido.stl_urls : [];
        for (const ruta of rutasExtra) {
          await borrarArchivoStorage(env, 'diseno-archivos', ruta);
        }

        if (!del1.ok) throw new Error(`Storage delete falló (status ${del1.status}) para ${pedido.stl_ruta}`);

        // Solo si el borrado real fue exitoso, limpiar la BD
        const updateRes = await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${pedido.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            stl_purgado: true,
            stl_purgado_at: new Date().toISOString(),
            stl_ruta: null,
            stl_urls: null,
            stl_liberado: false,
            link_diseno: null,
          }),
        });
        if (!updateRes.ok) throw new Error('Error actualizando pedido: ' + updateRes.status);

        await logIncidencia(env, 'PURGA_STL', 'INFO',
          `[AUTO-PURGE] STL purgado (Storage real) del pedido ${pedido.codigo} (${pedido.id}) — 30 días post-entrega`);
        purgados++;
      } catch (err) {
        await logIncidencia(env, 'PURGA_STL_ERROR', 'WARN',
          `[AUTO-PURGE] Error purgando pedido ${pedido.codigo}: ${err.message}`);
        errores++;
      }
    }

    if (purgados > 0 || errores > 0) {
      await logIncidencia(env, 'PURGA_STL_RESUMEN', 'INFO',
        `[AUTO-PURGE] Ciclo completado: ${purgados} pedidos purgados, ${errores} errores`);
    }

    return new Response(JSON.stringify({ purgados, errores, total: pedidos.length }), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
  }
}
