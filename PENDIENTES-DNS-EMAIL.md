# PRODIGY — Configuración DNS para Email Deliverability

> **Ojo: hay DOS lugares que usan Resend.** (1) Supabase Auth (SMTP) → correos de registro y «olvidé mi contraseña»:
> ✅ ya configurado. (2) Las funciones de la web en Cloudflare → todos los demás correos: ❌ falta la clave.
> **Estado 2026-10-01 (verificado con `cf pages get`): en Cloudflare NO existe `RESEND_API_KEY` → la web NO envía
> ningún correo** (bienvenidas, diseño listo, entregado, agradecimiento). `/api/send-email` responde 503. Hacer en
> orden: pasos 1–3 de abajo (DNS + verificar dominio) → **paso 4 (clave en Cloudflare)** → **paso 5 (SMTP de
> Supabase para «olvidé mi contraseña»)** → verificación.

## ⚠️ EJECUTAR EN CLOUDFLARE DNS (no en código)

### Acceso: cloudflare.com → prodigylabdental.com → DNS

**Estado real (verificado 2026-06-12 via nslookup):**
- Recepción de correo: **Cloudflare Email Routing** (MX → route1/2/3.mx.cloudflare.net) ✅ ya activo
- SPF: ✅ ya configurado para Cloudflare Email Routing
- DKIM Resend: ❌ no configurado
- DMARC: ❌ no existe

---

## 1. SPF (Sender Policy Framework) — ⚠️ ACTUALIZAR

**Ya existe** un registro SPF en `@` con:
```
v=spf1 include:_spf.mx.cloudflare.net ~all
```
Esto cubre el correo **recibido** vía Cloudflare Email Routing, pero NO los correos
**enviados** vía Resend (`noreply@`, `bienvenida@`, `alertas@`, `sistema@prodigylabdental.com`
desde `functions/api/*.js`).

**Acción:** cuando Resend te dé su valor SPF (paso 2), añadirlo al MISMO registro TXT
existente en `@` (un dominio solo puede tener UN registro SPF — se combinan los
`include:` en una sola línea). Ejemplo final esperado:
```
v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all
```
*(el `include:amazonses.com` es el típico de Resend — confirmar el valor exacto que
te muestre el dashboard de Resend en el paso 2, puede variar)*

---

## 2. Verificar dominio en Resend (DKIM + bounce)

1. Ir a: **resend.com → Domains → Add Domain**
2. Dominio: `prodigylabdental.com`
3. Resend mostrará 2-3 registros DNS para copiar a Cloudflare. Tipicamente:

   | Tipo | Nombre | Valor (ejemplo — usar el que muestre Resend) |
   |---|---|---|
   | TXT | `resend._domainkey` | `v=DKIM1; k=rsa; p=MIGfMA0...` (clave única, la da Resend) |
   | TXT | `@` (o `send`) | `include:amazonses.com` → fusionar con el SPF existente (ver paso 1) |
   | MX | `send` | `feedback-smtp.us-east-1.amazonses.com` (prioridad 10) — solo si Resend lo pide en un subdominio `send.` |

   ⚠️ Si Resend pide el MX en `send.prodigylabdental.com`, **no choca** con el MX
   principal de Cloudflare Email Routing (están en subdominios distintos).

4. En Cloudflare DNS, agregar cada registro exactamente como lo muestra Resend.
5. Volver a Resend → Domains → click **Verify** (puede tardar unos minutos en propagar).
6. Confirmar que `prodigylabdental.com` queda en estado **Verified** antes de seguir con DMARC.

---

## 3. DMARC — agregar DESPUÉS de verificar Resend (paso 2)

**Tipo:** TXT
**Nombre:** `_dmarc`
**Valor (copiar/pegar):**
```
v=DMARC1; p=quarantine; rua=mailto:gerencia@prodigylabdental.com; pct=100
```

Significado:
- `p=quarantine` → correos no autenticados van a spam (subir a `p=reject` tras 2-4 semanas sin falsos positivos en los reportes `rua`)
- `rua=` → reportes agregados de intentos de suplantación llegan a `gerencia@prodigylabdental.com`
- `pct=100` → aplica al 100% del correo

⚠️ **No agregar DMARC antes de verificar Resend** (paso 2) — si Resend aún falla
SPF/DKIM, con DMARC activo esos correos transaccionales podrían ir directo a spam
o rechazarse.

---

## 4. Clave de Resend en Cloudflare (sin esto no sale NINGÚN correo)
1. resend.com → **API Keys** → *Create API Key* → permiso **Sending access** → dominio `prodigylabdental.com`.
2. Copiar la clave (empieza por `re_`) — se muestra UNA vez. **No pegarla en el chat.**
3. Cloudflare → Workers & Pages → proyecto de PRODIGY → **Settings → Variables and Secrets → Production → Add**:
   - `RESEND_API_KEY` = la clave, tipo **Secret**
   - `FROM_EMAIL` = `PRODIGY Lab Dental <noreply@prodigylabdental.com>` (tipo Text)
4. **Save** → Deployments → *Retry deployment* del último (las variables entran en el siguiente despliegue).
5. Alejandro CAD/CAM: lo mismo en su proyecto con su dominio y `FROM_EMAIL` = `Alejandro CAD/CAM <alejandro@alejandrocadcam.com>`.

## 5. SMTP de Supabase con Resend (correo de «olvidé mi contraseña») — ✅ YA HECHO (ver BITACORA: «SMTP Supabase activado»)
Supabase → Authentication → **Emails → SMTP Settings** → *Enable custom SMTP*:
- Host `smtp.resend.com` · Puerto `465` · Usuario `resend` · Contraseña = una API key de Resend (puede ser otra solo para esto)
- Remitente `noreply@prodigylabdental.com` · Nombre `PRODIGY Lab Dental`
Sin esto, el reset de contraseña usa el correo de prueba de Supabase (límite muy bajo, suele caer en spam).

## Verificación (después de configurar todo)
1. Ir a: https://mxtoolbox.com/SuperTool.aspx → ingresar `prodigylabdental.com` → SPF/DKIM/DMARC deben dar OK
2. Enviar un correo de prueba desde `functions/api/bienvenida-referido.js` (o cualquier endpoint Resend) a una cuenta Gmail propia → revisar "Mostrar original" → SPF=pass, DKIM=pass, DMARC=pass
3. Score objetivo: A+ en https://www.mail-tester.com/ (enviar un correo de prueba a la dirección que te dan)

## Orden recomendado
SPF (fusionar) → Resend domain verify (DKIM) → confirmar "Verified" en Resend → DMARC → mxtoolbox/mail-tester
