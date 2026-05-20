/**
 * Email automático via Resend (10,000/mes gratis)
 * Llama a /api/send-email (Cloudflare Function)
 *
 * ACTIVACIÓN:
 * 1. resend.com → crear cuenta → API Keys → crear key
 * 2. Cloudflare Dashboard → prodigydentallab → Settings → Environment Variables
 *    → Agregar: RESEND_API_KEY = re_xxxxxxxxx
 *    → Agregar: FROM_EMAIL = PRODIGY Lab <notificaciones@prodigydentallab.com>
 */

function htmlEmailProdigy(titulo, contenido, codigo) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);}
  .hdr{background:linear-gradient(135deg,#050505,#0d1525);padding:28px 32px;text-align:center;}
  .hdr h1{margin:0;font-size:1.1rem;font-weight:900;letter-spacing:2px;color:#D946A6;}
  .hdr p{margin:4px 0 0;font-size:.72rem;color:#94a3b8;}
  .body{padding:28px 32px;}
  .badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:6px;padding:4px 12px;font-size:.75rem;font-weight:700;margin-bottom:16px;}
  h2{font-size:1.1rem;font-weight:800;color:#1a1a2e;margin:0 0 12px;}
  p{font-size:.9rem;color:#475569;line-height:1.7;margin:0 0 16px;}
  .code{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;text-align:center;font-family:monospace;font-size:1rem;font-weight:800;color:#1a1a2e;letter-spacing:2px;margin:16px 0;}
  .btn{display:block;background:linear-gradient(135deg,#D946A6,#9333ea);color:#fff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:8px;font-weight:800;font-size:.9rem;margin:20px 0;}
  .ftr{background:#f8fafc;padding:18px 32px;text-align:center;font-size:.72rem;color:#94a3b8;border-top:1px solid #e2e8f0;}
  .ftr a{color:#D946A6;text-decoration:none;}
</style></head>
<body>
<div class="wrap">
  <div class="hdr">
    <h1>💎 PRODIGY LAB</h1>
    <p>Digital Dentistry · prodigydentallab.pages.dev</p>
  </div>
  <div class="body">
    ${contenido}
    ${codigo ? `<div class="code">${codigo}</div>` : ''}
    <a href="https://prodigydentallab.pages.dev/app/client-panel" class="btn">Ver mi portal →</a>
  </div>
  <div class="ftr">
    © ${new Date().getFullYear()} PRODIGY Digital Dentistry &nbsp;·&nbsp;
    prodigydentallab@gmail.com &nbsp;·&nbsp; +57 321 281 6716<br>
    <a href="https://prodigydentallab.pages.dev/app/client-panel">Portal del cliente</a>
    &nbsp;·&nbsp;
    <a href="https://wa.me/573212816716">WhatsApp</a>
  </div>
</div>
</body></html>`;
}

async function enviarEmail(to, subject, html) {
  if (!to || !to.includes('@')) return false;
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error);
    return true;
  } catch(e) {
    console.warn('[Email] Error:', e.message);
    return false;
  }
}

/* ── EMAILS PREDEFINIDOS ── */

function email_nuevoCaso(emailDoctor, codigo, servicio) {
  return enviarEmail(
    emailDoctor,
    `✅ Pedido recibido #${codigo} — PRODIGY Lab`,
    htmlEmailProdigy('Pedido recibido', `
      <div class="badge">✅ PEDIDO RECIBIDO</div>
      <h2>¡Recibimos tu pedido!</h2>
      <p>Confirmamos que tu orden fue creada exitosamente. Verificaremos los archivos y te contactaremos para confirmar.</p>
      <p><strong>Servicio:</strong> ${servicio}<br>
      <strong>Pago:</strong> 50% abono al inicio · 50% contra entrega</p>
      <p>Te avisaremos por WhatsApp y correo en cada etapa del proceso.</p>
    `, codigo)
  );
}

function email_pagoConfirmado(emailDoctor, codigo) {
  return enviarEmail(
    emailDoctor,
    `💳 Pago confirmado — Caso #${codigo} en proceso`,
    htmlEmailProdigy('Pago confirmado', `
      <div class="badge">💳 PAGO CONFIRMADO</div>
      <h2>¡Tu pago fue verificado!</h2>
      <p>Confirmamos la recepción de tu pago. Ya iniciamos la producción de tu caso.</p>
      <p>Te notificaremos cuando el diseño esté listo para que lo revises y apruebes.</p>
    `, codigo)
  );
}

function email_disenoListo(emailDoctor, codigo, revision) {
  return enviarEmail(
    emailDoctor,
    `🎨 Tu diseño está listo — Caso #${codigo} (Rev ${revision})`,
    htmlEmailProdigy('Diseño listo', `
      <div class="badge">🎨 DISEÑO LISTO</div>
      <h2>Tu diseño CAD está listo para revisar</h2>
      <p>Revisión <strong>${revision} de 2</strong> — hasta 2 revisiones sin costo adicional.</p>
      <p>Entra a tu portal, revisa el diseño 3D y aprueba o solicita ajustes.</p>
    `, codigo)
  );
}

function email_disenoAprobado(emailDoctor, codigo) {
  return enviarEmail(
    emailDoctor,
    `✅ Diseño aprobado — Caso #${codigo} pasa a producción`,
    htmlEmailProdigy('Diseño aprobado', `
      <div class="badge">✅ APROBADO</div>
      <h2>¡Tu diseño fue aprobado!</h2>
      <p>El laboratorio ya recibió tu aprobación y comienza la producción física.</p>
      <p>Tiempo estimado de manufactura según el servicio solicitado.</p>
    `, codigo)
  );
}

function email_stlListo(emailDoctor, codigo) {
  return enviarEmail(
    emailDoctor,
    `📦 Archivo STL listo — Caso #${codigo}`,
    htmlEmailProdigy('STL entregado', `
      <div class="badge">📦 STL LISTO</div>
      <h2>¡Tu archivo STL está disponible!</h2>
      <p>El diseño está disponible en tu portal para descargar y producir en tu equipo.</p>
      <p style="font-size:.8rem;color:#94a3b8;">El link de descarga es válido por 1 hora por seguridad.</p>
    `, codigo)
  );
}

function email_cambiosAplicados(emailDoctor, codigo, revision) {
  return enviarEmail(
    emailDoctor,
    `✏️ Cambios aplicados — Caso #${codigo} Rev ${revision} lista`,
    htmlEmailProdigy('Cambios aplicados', `
      <div class="badge">✏️ REVISIÓN ${revision}</div>
      <h2>Aplicamos tus cambios</h2>
      <p>La nueva versión de tu diseño está lista. Por favor revísala y confirma tu aprobación.</p>
      ${revision >= 2 ? '<p style="color:#f59e0b;font-size:.82rem;">⚠️ Esta es tu última revisión sin costo. Si necesitas más ajustes tendrá un costo adicional.</p>' : ''}
    `, codigo)
  );
}
