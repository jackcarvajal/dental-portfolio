# ACTIVAR PAGOS — checklist único (PRODIGY + Alejandro)

> Todo el sistema de pagos está **completo en código** (ago-2026). Esto es lo único que falta,
> y es **config/deploy tuyo** (no código). Hazlo en orden. Aplica a **los dos** Cloudflare Pages.

## 🔴 1. Redesplegar `wompi-signature` (lo más importante)
```
supabase functions deploy wompi-signature
```
Cierra **2 cosas de una**: (a) el hueco de dinero viejo (firmaba montos arbitrarios del cliente), y
(b) el CORS que bloqueaba los pagos Wompi desde el sitio de Alejandro. **Ya es seguro redesplegar** —
el `config.toml` versiona `verify_jwt=false`.

## 🟡 2. Redesplegar `webhook-handler` (Wompi)
```
supabase functions deploy webhook-handler
```
Activa el **aviso al staff** (campana del panel) cuando entra un pago Wompi.

## 🟢 3. PayPal — env vars (en CADA Cloudflare Pages → Settings → Environment Variables, Production)
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` — de developer.paypal.com → tu app **Live**
- `PAYPAL_ENV` = `live`  (usa `sandbox` para probar primero)
- `PAYPAL_WEBHOOK_ID` — lo obtienes en el paso 4
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` — ya deberían existir (los usa factura/stripe)

## 🟢 4. Registrar el webhook de PayPal
developer.paypal.com → tu app → **Webhooks → Add**:
- URL: `https://<tu-dominio>/api/paypal-webhook`  (uno por sitio)
- Evento: `PAYMENT.CAPTURE.COMPLETED`
- Copia el **Webhook ID** que te da → esa es la env var `PAYPAL_WEBHOOK_ID` del paso 3.

## 🟢 5. Probar en SANDBOX antes de anunciar
Con `PAYPAL_ENV=sandbox` + credenciales sandbox, haz un pago de prueba de punta a punta:
`/pagar?ref=UN_CODIGO_REAL` → paga → verifica que el pedido quede `Pagado` y llegue la notif a la campana.
Luego cambia a `live` y haz **un pago real de bajo monto**.

---

## Qué queda funcionando tras esto
- **Internacional**: `/pagar?ref=CODIGO` (tras cotizar por WhatsApp) → PayPal / tarjeta. Botón también en flujo-diseno para país≠CO.
- **Colombia**: Wompi (PSE/Nequi/tarjeta) + Transferencia (sin comisión).
- **Seguridad**: monto autoritativo de la BD en los dos rieles, captura/firma verificada server-side, webhook de reconciliación PayPal, idempotencia.
- **Post-pago**: cliente ve banner con nº de orden + botón "Confirmar por WhatsApp"; staff recibe 2 avisos en la campana (admin/finanzas + área de producción según el flujo); recordatorio de pago manda el link `/pagar`.

Detalle técnico de cada pieza: buscar "PayPal" y "post-pago" en `PENDIENTES.md`.
