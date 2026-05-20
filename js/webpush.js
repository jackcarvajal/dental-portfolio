/**
 * Web Push via OneSignal — 10,000 usuarios gratis
 * Notificaciones nativas en iPhone (Safari 16.4+), Android, Chrome, Firefox
 *
 * ACTIVACIÓN (5 min):
 * 1. onesignal.com → crear cuenta → New App → "prodigydentallab"
 * 2. Platform: Web → Site URL: https://prodigydentallab.pages.dev
 * 3. Copiar App ID (ej: "abc123-def456-...")
 * 4. Reemplazar ONESIGNAL_APP_ID abajo
 */

const ONESIGNAL_APP_ID = 'PENDIENTE'; // ← reemplazar con tu App ID de OneSignal

/* ── INICIALIZAR ── */
(function initOneSignal() {
  if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'PENDIENTE') return;

  const s = document.createElement('script');
  s.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
  s.defer = true;
  document.head.appendChild(s);

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      notifyButton: { enable: false }, // Usamos nuestro propio botón
      promptOptions: {
        slidedown: {
          prompts: [{
            type: 'push',
            autoPrompt: false,
            text: {
              actionMessage: '¿Quieres recibir notificaciones cuando tu diseño esté listo?',
              acceptButton:  'Sí, avisarme',
              cancelButton:  'Ahora no'
            }
          }]
        }
      }
    });
  });
})();

/** Mostrar botón de suscripción en el portal del cliente */
function mostrarBotonPush(containerId) {
  if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'PENDIENTE') return;
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = `
    <div style="background:rgba(0,210,255,.06);border:1px solid rgba(0,210,255,.2);border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:14px;margin-top:16px;">
      <i class="fas fa-bell" style="color:#00d2ff;font-size:1.2rem;flex-shrink:0"></i>
      <div style="flex:1">
        <div style="font-size:.78rem;font-weight:800;color:#e2e8f0;margin-bottom:2px">Notificaciones push</div>
        <div style="font-size:.72rem;color:#94a3b8">Recibe alertas cuando tu caso avance</div>
      </div>
      <button id="btn-push-toggle" onclick="togglePush()" style="background:rgba(0,210,255,.15);border:1px solid rgba(0,210,255,.35);color:#00d2ff;padding:6px 14px;border-radius:6px;font-size:.75rem;font-weight:700;cursor:pointer;white-space:nowrap">
        Activar
      </button>
    </div>`;

  if (window.OneSignalDeferred) {
    OneSignalDeferred.push(async function(OneSignal) {
      const subscribed = await OneSignal.User.PushSubscription.optedIn;
      const btn = document.getElementById('btn-push-toggle');
      if (btn) btn.textContent = subscribed ? '✅ Activado' : 'Activar';
    });
  }
}

async function togglePush() {
  if (!window.OneSignalDeferred) return;
  OneSignalDeferred.push(async function(OneSignal) {
    const subscribed = await OneSignal.User.PushSubscription.optedIn;
    if (subscribed) {
      await OneSignal.User.PushSubscription.optOut();
      const btn = document.getElementById('btn-push-toggle');
      if (btn) btn.textContent = 'Activar';
    } else {
      await OneSignal.Slidedown.promptPush();
      setTimeout(async () => {
        const now = await OneSignal.User.PushSubscription.optedIn;
        const btn = document.getElementById('btn-push-toggle');
        if (btn) btn.textContent = now ? '✅ Activado' : 'Activar';
      }, 2000);
    }
  });
}

/**
 * Enviar push a un usuario específico (via Cloudflare Function)
 */
async function pushAlCliente(externalUserId, titulo, mensaje, url) {
  if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'PENDIENTE') return false;
  try {
    const res = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        externalUserId, titulo, mensaje,
        url: url || 'https://prodigydentallab.pages.dev/app/client-panel'
      })
    });
    return res.ok;
  } catch(e) {
    console.warn('[Push] Error:', e.message);
    return false;
  }
}
