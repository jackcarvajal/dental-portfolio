# Correos de «olvidé mi contraseña» — configuración (PRODIGY + Alejandro CAD/CAM)

Un solo proyecto Supabase (`zgihrwqfyvgyapbwzkvw`) atiende los DOS dominios. El código ya está bien
(login → `resetPasswordForEmail(redirectTo: <dominio>/app/reset-password.html)` → la página pide la
nueva clave). Lo que falta es configuración en Supabase y Resend. ~10 minutos.

## 1) Direcciones de regreso permitidas (Supabase)
https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/auth/url-configuration
- **Site URL:** `https://prodigylabdental.com`
- **Redirect URLs** → *Add URL*, una por una:
  - `https://prodigylabdental.com/**`
  - `https://alejandrocadcam.com/**`
- Guardar. Sin la de un dominio, el enlace del correo lleva a la portada de PRODIGY o falla.

## 2) Dominio verificado en Resend
https://resend.com/domains → `prodigylabdental.com` debe decir **Verified**.
Si no aparece: *Add domain* → copia los registros DNS (MX, TXT/SPF, DKIM) en Cloudflare →
DNS de `prodigylabdental.com` → espera a que Resend lo marque verificado.

## 3) Clave de envío de Resend
https://resend.com/api-keys → *Create API key* → nombre `supabase-auth`, permiso **Sending access**,
dominio `prodigylabdental.com` → copia la clave (empieza por `re_`). No se vuelve a mostrar.

## 4) SMTP propio en Supabase
https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/auth/smtp
- Enable custom SMTP: **ON**
- Sender email: `noreply@prodigylabdental.com` · Sender name: `PRODIGY Lab Dental`
- Host: `smtp.resend.com` · Port: `465`
- Username: `resend` · Password: la clave `re_…` del paso 3
- Guardar.

## 5) Plantillas de los correos (con la marca de cada web)
Ver **`docs/correos-auth/LEEME.md`**: 4 plantillas (recuperar, confirmar, enlace de acceso, invitación) que salen
en dorado para Alejandro CAD/CAM y en magenta para PRODIGY, según la cuenta o la web desde la que se pidió.

## 6) Probar
1. https://prodigylabdental.com/app/login.html → «¿Olvidaste tu contraseña?» → tu correo.
2. Debe llegar en 1 minuto desde `noreply@prodigylabdental.com` (revisa también spam).
3. El enlace abre `…/app/reset-password.html` → nueva contraseña → entra.
4. Repite en https://alejandrocadcam.com/app/login.html (debe volver a alejandrocadcam.com).

Si el correo no llega: Supabase → Logs → Auth muestra el error del SMTP.
