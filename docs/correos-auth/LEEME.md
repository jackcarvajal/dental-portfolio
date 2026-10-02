# Correos de acceso (Supabase Auth) — una plantilla para las dos marcas

PRODIGY y Alejandro CAD/CAM comparten el proyecto Supabase, así que los correos de **confirmar cuenta, recuperar
contraseña, enlace de acceso e invitación** son los mismos para las dos webs. Estas plantillas eligen la marca solas:

- **Alejandro CAD/CAM** (dorado) si la cuenta tiene `user_metadata.negocio = 'alejandrocadcam'` **o** el enlace vuelve a
  `https://alejandrocadcam.com…` (el login de Alejandro lo manda así).
- **PRODIGY** (magenta) en cualquier otro caso.

Probadas con Go `text/template` y `html/template` (el motor de Supabase) en 5 casos cada una: 0 fallos.

## Pegarlas (5 minutos)
https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/auth/templates

| Plantilla en Supabase | Subject | Body (abrir, Ctrl+A, Ctrl+C, pegar en *Source*) |
|---|---|---|
| Reset Password | `Restablece tu contraseña` | `recuperar-clave.html` |
| Confirm signup | `Confirma tu correo` | `confirmar-correo.html` |
| Magic Link | `Tu enlace para entrar` | `enlace-acceso.html` |
| Invite user | `Te invitamos al portal` | `invitacion.html` |

Guardar cada una con **Save changes**.

## Remitente neutro (opcional)
https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/auth/smtp → **Sender name:** `Portal de casos`
(la dirección sigue siendo `noreply@prodigylabdental.com`: Supabase solo admite un remitente por proyecto).

## Direcciones de regreso (si no están)
https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/auth/url-configuration → Redirect URLs:
`https://prodigylabdental.com/**` y `https://alejandrocadcam.com/**`. Sin la de Alejandro, su enlace vuelve a PRODIGY.

## Probar justo después de pegar
1. https://alejandrocadcam.com/app/login.html → «¿Olvidaste tu contraseña?» → tu correo → debe llegar en dorado.
2. https://prodigylabdental.com/app/login.html → lo mismo → debe llegar en magenta.
3. Si no llega ninguno: Supabase → Logs → Auth (un error de plantilla se ve ahí) y vuelve a la plantilla anterior.
