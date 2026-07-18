# 🗂️ DIRECTORIO DE PROYECTOS — Ecosistema Dental

> Mapa único de todos los proyectos: dónde vive cada uno, sus URLs públicas y privadas,
> los accesos internos y los bypass. Actualizado: 2026-07-17.

---

## Resumen rápido

| Proyecto | Dominio en vivo | Repo local | Cloudflare | Rama | Marca (favicon) |
|---|---|---|---|---|---|
| **PRODIGY Lab Dental** | https://prodigylabdental.com | `d:\proyectos-web\mi-portfolio-dental\dental-portfolio` | "Prodigy App" | `main` | 💎 |
| **Alejandro CAD/CAM** | https://alejandrocadcam.pages.dev | `D:\proyectos-web\alejandro-carvajal-site` | "alejandrocadcam" | `master` | 👑 |
| **Bogotá Smile Studio** (B2C) | https://bogotasmilestudio.com | `d:\proyectos-web\dental-concierge` (carpeta `bss/`) | dental-concierge | `master` ⚠️ | ✈️ |
| **BSS Agencia** (B2B) | https://bogotasmilestudio.com/agencia | mismo repo (carpeta `agencia/`) | dental-concierge | `master` ⚠️ | ✈️ |

⚠️ El repo **dental-concierge no tiene remoto git configurado** — no se puede `git push`. Se despliega por subida directa a Cloudflare (o falta conectar el remoto).

---

## 🔗 Infraestructura compartida

- **Supabase (un solo proyecto para los tres):** `zgihrwqfyvgyapbwzkvw`
  - Separación por columna **`negocio`**: `prodigy` · `alejandrocadcam` · (BSS)
  - Dashboard: https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw
  - Table Editor: https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/editor
  - SQL Editor: https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/sql/new
  - API Keys: https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/settings/api-keys
- **Cloudflare Pages:** https://dash.cloudflare.com → Workers & Pages (cada sitio es un proyecto separado; las env vars NO se comparten entre proyectos)
- **Env vars requeridas en cada proyecto Cloudflare:** `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `GEMINI_API_KEY` (+ `CALLMEBOT_APIKEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY` según funciones usadas)

---

## 💎 PRODIGY Lab Dental

**Público:** https://prodigylabdental.com — 90 URLs en sitemap. Home, servicios (diseño CAD, fresado, impresión 3D, guías quirúrgicas, alineadores), calculadoras, portafolio, journal, contacto.

**Landing internacional (carillas, solo EE.UU.):**
- https://prodigylabdental.com/en/veneers
- **Bypass para verla desde Colombia:** añade `?preview=1` → https://prodigylabdental.com/en/veneers?preview=1 (guarda `pg_preview` en sessionStorage; sin él, un visitante de Colombia se redirige a la home)
- Términos: https://prodigylabdental.com/en/veneer-terms

**Privado — Panel interno** (`/app/*`, `noindex`, protegido por `auth-guard.js`):
- **Login:** https://prodigylabdental.com/app/login.html
- **Admin (jackalejandroc@gmail.com):** entra a `/app/panel-interno-operaciones.html`
- Ruta para **crear caso de portafolio:** login → panel → **Gestionar casos** (`/app/gestionar-casos.html`) → botón **Agregar caso** (`/app/agregar-caso.html`)
- Otros paneles por rol: operator-panel · mensajero · inventario · calidad · contabilidad · operario-diseno · taller · operario · client-panel
- Métricas: metricas / metricas-churn / metricas-referidos / metricas-seo
- Config: configuracion · admin-precios · cambiar-contrasena

**Roles (auth-guard.js) → panel destino:**
`admin`→panel-interno-operaciones · `operator`→operator-panel · `mensajero`→mensajero · `encargado_inventario`→inventario · `calidad`→calidad · `contabilidad`→contabilidad · `diseno`→operario-diseno · `taller`→taller · `fresado`/`impresion`→operario · `client`→client-panel
> Admin se define por **email** (lista en `auth-guard.js`), el resto por `app_metadata.role`.

---

## 👑 Alejandro CAD/CAM

**Público:** https://alejandrocadcam.pages.dev — 52 URLs en sitemap. Home (sobre-mi), servicios de diseño (corona, full-arch, implante, puente, provisional, endodóntico, guías quirúrgicas, férulas/splint, wax-up, prótesis), calculadora, portafolio, reseñas, blog.

**Landing internacional (carillas, solo EE.UU.):**
- https://alejandrocadcam.pages.dev/en/veneers
- **Bypass desde Colombia:** `?preview=1` → https://alejandrocadcam.pages.dev/en/veneers?preview=1 (guarda `ac_preview`)
- Términos: https://alejandrocadcam.pages.dev/en/veneer-terms

**Privado — Panel interno** (`/app/*`):
- **Login:** https://alejandrocadcam.pages.dev/app/login.html
- Paneles: admin-panel · client-panel · mis-casos · metricas · configuracion · cambiar-contrasena
- WhatsApp del negocio: **+57 321 958 1949**

---

## ✈️ Bogotá Smile Studio (dental-concierge)

Un solo repo sirve **dos sitios** vía `_redirects`:

**B2C — pacientes internacionales (EE.UU./Canadá):** https://bogotasmilestudio.com
- 54 páginas bajo `bss/` (turismo dental, veneers, implantes, All-on-4, consulta virtual, garantías, etc.)
- La raíz `/` reescribe a `/bss/index.html`

**B2B — odontólogos LATAM:** https://bogotasmilestudio.com/agencia
- Landing de agencia (`agencia/`)

**Privado — Portal BSS:**
- **Login:** https://bogotasmilestudio.com/bss/login.html (o ruta limpia según `_redirects`)
- Paneles: `bss/dashboard.html` (staff) · `bss/patient.html` (paciente)

> WhatsApp / teléfono y precios: ver memoria del proyecto BSS. Sin bypass geo (todo el sitio es internacional).

---

## 🔓 Cheatsheet de bypass / preview

| Página | Bypass | Efecto |
|---|---|---|
| PRODIGY `/en/veneers` | `?preview=1` | Ver la landing US desde Colombia (guarda `pg_preview`) |
| Alejandro `/en/veneers` | `?preview=1` | Ídem (guarda `ac_preview`) |

Ambas landings redirigen a la home local **solo** si la geo-detección confirma Colombia; si la geo falla (fallback), NO redirige (fail-open).

---

## 🛠️ Diagnóstico rápido

- **Backend caído / no guarda nada:** revisar env vars en Cloudflare del proyecto + `GET /api/health-check` (solo PRODIGY).
- **No abre una página del panel (queda en blanco):** la página se oculta hasta que `auth-guard.js` confirme sesión; si falla, revisar login/sesión.
- **"row-level security policy" al guardar:** el usuario no tiene sesión autenticada válida o le falta el rol en `app_metadata`.
