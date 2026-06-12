/**
 * Email automático via Resend (10,000/mes gratis)
 * Llama a /api/send-email (Cloudflare Function)
 *
 * ACTIVACIÓN:
 * 1. resend.com → crear cuenta → API Keys → crear key
 * 2. Cloudflare Dashboard → prodigylabdental → Settings → Environment Variables
 *    → Agregar: RESEND_API_KEY = re_xxxxxxxxx
 *    → Agregar: FROM_EMAIL = PRODIGY Lab <notificaciones@prodigylabdental.com>
 */

async function enviarEmail(to, subject, text, tipo) {
  if (!to || !to.includes('@')) return false;
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, text, tipo })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error);
    return true;
  } catch(e) {
    console.warn('[Email] Error:', e.message);
    return false;
  }
}

/* ── EMAILS PREDEFINIDOS — contenido HTML se genera server-side (functions/api/send-email.js) ── */

function email_nuevoCaso(emailDoctor, codigo, servicio) {
  return enviarEmail(
    emailDoctor,
    `✅ Pedido recibido #${codigo} — PRODIGY Lab`,
    `Confirmamos que tu pedido #${codigo} (${servicio}) fue creado exitosamente. Pago: 50% abono al inicio · 50% contra entrega. Te avisaremos por WhatsApp y correo en cada etapa.`,
    'pedido_confirmado'
  );
}

function email_pagoConfirmado(emailDoctor, codigo) {
  return enviarEmail(
    emailDoctor,
    `💳 Pago confirmado — Caso #${codigo} en proceso`,
    `Confirmamos la recepción de tu pago para el caso #${codigo}. Ya iniciamos la producción. Te notificaremos cuando el diseño esté listo para revisar y aprobar.`,
    'pedido_confirmado'
  );
}

function email_disenoListo(emailDoctor, codigo, revision) {
  return enviarEmail(
    emailDoctor,
    `🎨 Tu diseño está listo — Caso #${codigo} (Rev ${revision})`,
    `El diseño CAD de tu caso #${codigo} está listo (revisión ${revision} de 2, sin costo adicional). Entra a tu portal para revisarlo en 3D y aprobarlo o solicitar ajustes.`,
    'diseno_listo'
  );
}

function email_disenoAprobado(emailDoctor, codigo) {
  return enviarEmail(
    emailDoctor,
    `✅ Diseño aprobado — Caso #${codigo} pasa a producción`,
    `Tu diseño del caso #${codigo} fue aprobado y el laboratorio ya inició la producción física. Te notificaremos del avance.`,
    'pedido_confirmado'
  );
}

function email_stlListo(emailDoctor, codigo) {
  return enviarEmail(
    emailDoctor,
    `📦 Archivo STL listo — Caso #${codigo}`,
    `El archivo STL de tu caso #${codigo} ya está disponible en tu portal para descargar y producir en tu equipo. El link de descarga es válido por 1 hora por seguridad.`,
    'stl_listo'
  );
}

function email_cambiosAplicados(emailDoctor, codigo, revision) {
  return enviarEmail(
    emailDoctor,
    `✏️ Cambios aplicados — Caso #${codigo} Rev ${revision} lista`,
    `Aplicamos los cambios solicitados al caso #${codigo}. Por favor revisa la nueva versión y confirma tu aprobación.${revision >= 2 ? ' Nota: esta es tu última revisión sin costo adicional.' : ''}`,
    'cambios_aplicados'
  );
}
