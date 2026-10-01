# Arquitectura — Ecosistema PRODIGY

> Fuente única de verdad de la arquitectura (actualizado 2026-10-01). Reemplaza la versión de jun-2026.
> La skill `prodigy-arquitectura` (`.claude/skills/` y `.agents/skills/`) obliga a leer este archivo
> antes de crear una página, módulo, tabla, endpoint o integración. Si algo aquí deja de ser cierto,
> se corrige aquí — no en otro documento.

---

## 1. Decisión (ADR-001): monolito modular por producto + núcleo compartido

**Contexto.** Tres productos (PRODIGY, Alejandro CAD/CAM, Bogotá Smile Studio) en tres repos, una sola base
Supabase (`zgihrwqfyvgyapbwzkvw`, separada por la columna `negocio`), Cloudflare Pages + Functions como
backend en el borde, sin paso de build, un solo desarrollador asistido por IA.

**Decisión.** Cada repo es un **monolito modular**: un solo despliegue, organizado por **módulos de negocio**
(sección 3) con fronteras explícitas. Lo que comparten los productos es un **núcleo compartido** (sección 4)
cuya versión canónica vive en PRODIGY. De la arquitectura hexagonal se adopta solo la idea de los
**adaptadores en el borde**: todo proveedor externo (Gemini, CallMeBot, Resend, PayPal/Stripe, OneSignal) se
habla desde `functions/api/`, nunca desde el navegador.

| Opción | Veredicto | Por qué |
|---|---|---|
| Monolítica (sin módulos) | ❌ ya se quedó corta | 48 páginas `/app`, 35 endpoints, 50+ tablas: sin fronteras, cada página consulta todo (`pedidos` se consulta directo en ~99 lugares) |
| Multi-repo | ✅ se mantiene (un repo por producto) | Despliegues, dominios y marcas independientes. Su costo — copiar código entre repos — se controla con el núcleo compartido |
| Microservicios | ❌ descartada | Exige equipo, observabilidad y despliegue por servicio; un desarrollador pagaría el costo sin el beneficio. Supabase + Functions ya dan aislamiento serverless |
| Hexagonal completa | ⚠️ solo parcial | Puertos/adaptadores completos son excesivos en JS vanilla sin build; sí aplica a integraciones externas y al acceso a datos |
| **Por módulos (monolito modular)** | ✅ **elegida** | Estándar de la industria para este tamaño (Fowler «MonolithFirst», Shopify/GitLab). Permite extraer un módulo después si el SaaS (`SAAS-ROADMAP.md`) lo exige |

**Consecuencias.** No se crean servicios nuevos ni frameworks SPA. Cada cosa nueva pertenece a un módulo y
respeta sus fronteras. El núcleo se corrige una vez y se propaga a los demás repos (Ley de oro, `CLAUDE.md` §1b).

---

## 2. Mapa actual

```
                    ┌──────────────── Supabase zgihrwqfyvgyapbwzkvw ────────────────┐
                    │ Postgres (RLS, RPC SECURITY DEFINER, triggers) · Auth · Storage │
                    │ columna `negocio`: prodigy · alejandrocadcam · bss             │
                    └───────▲───────────────────────▲───────────────────────▲────────┘
                            │                       │                       │
   PRODIGY (main)           │   Alejandro (master)  │   BSS dental-concierge │ (sin remoto git)
   prodigylabdental.com ────┘   alejandrocadcam ────┘   bogotasmilestudio ───┘
   Cloudflare Pages + Functions en los tres; cada proyecto con sus propias env vars.
```

**Capas dentro de PRODIGY**

| Carpeta | Qué es | Regla |
|---|---|---|
| `*.html`, `en/` | Páginas públicas (SEO) | `docs/GUIA-PAGINAS-NUEVAS.md` |
| `app/` | Portales autenticados (staff y clientes) | `noindex` + `auth-guard.js` antes del JS de negocio |
| `js/` | Lógica de UI y núcleo compartido | Cambiar archivo ⇒ subir `?v=` (caché inmutable) |
| `css/` | Estilos compartidos (`aln.css`, `styles.css`) | Paleta y tipografía: `ESTANDARES-UX-TIPOGRAFIA.md` |
| `functions/api/` | Backend en el borde (Cloudflare) | Única puerta a APIs externas y a la service_role |
| `functions/_middleware.js` | Bloquea archivos internos servidos como estáticos | Añadir aquí toda carpeta interna nueva |
| `supabase/functions/` | Edge Functions Deno (`send-push`, `verify-price`, `wompi-signature`…) | Segundo runtime: no crear más ahí (ver §6) |
| `sql/` | Parches SQL que se corren a mano en el SQL Editor | `sql/_baseline/README.md`: una definición canónica por RPC |
| `tools/` | Auditorías (`audit*.mjs`, `sql-map.mjs`) | Corren en pre-push |
| `.github/workflows/` | Crons (SLA, journal, keepalive, purga) | Llaman a `dental-portfolio-em6.pages.dev` (el dominio propio reta a los bots) |

---

## 3. Módulos de negocio

Cada módulo es dueño de sus páginas, su JS, sus endpoints y sus tablas. Otro módulo usa sus datos por
medio de una RPC o vista del dueño, no tocando sus tablas directamente.

| Módulo | Páginas principales | Tablas (prefijo / dueñas) | Documento |
|---|---|---|---|
| **Pedidos y flujos** | `flujo-*.html`, `envia-tu-scanner`, `app/panel-interno-operaciones`, `operario`, `orden-produccion`, `ficha-caso` | `pedidos`, `pedido_*`, `pedidos_operacion` | `docs/CONTRATO-COLUMNAS-PEDIDOS.md`, `docs/CONTRATO-ESTADOS.md` |
| **Diseño** | `app/operario-diseno`, `revision-diseno`, `revision-express` | `historial_diseno`, `diseno_*`, `operarios_tarifas` | — |
| **Alineadores** | `envia-alineadores`, `app/alineadores`, `nueva-orden-alineadores`, `facturacion-alineadores` | `alineadores_*` | `docs/PROTOCOLO-ALINEADORES.md` |
| **Gestión del lab** | `app/rastreo`, `mover`, `caso-qr`, `etiqueta`, `inventario`, `calidad`, `taller`, `mensajero` | `inventario_*`, `despachos`, `lotes_material`, `pedido_movimientos`, `pedido_incidencias` | `docs/ROADMAP-GESTION-LAB.md` |
| **Cobros** | `pagar`, `calculadora*`, `app/cotizaciones`, `contabilidad`, `admin-precios` | `cotizaciones`, `pagos`, `config_precios`, `catalogo` | `docs/ACTIVAR-PAGOS.md` · Ley 50/50 |
| **Clientes y crecimiento** | `app/client-panel`, `referidos-portal`, `metricas*`, `clientes` | `doctores_perfil`, `referidos`, `leads_doctores`, `analytics_events` | — |
| **Identidad y acceso** | `app/login`, `gestionar-usuarios`, `crear-operario`, `cambiar-contrasena` | `perfiles`, `staff_departamentos` (+ `app_metadata.roles`) | `docs/GUIA-SEGURIDAD.md` |
| **Notificaciones y soporte** | `app/reportes-web`, `bandeja-whatsapp`, `ayuda`, `soporte` | `notificaciones_internas`, `avisos_whatsapp`, `push_subscriptions`, `reportes_web`, `logs_incidencias` | `docs/PROTOCOLO-WHATSAPP.md`, `docs/WHATSAPP-OFICIAL.md` |
| **Contenido y SEO** | páginas públicas, `journal`, `portafolio`, `links` | `casos_portafolio`, `comentarios_portafolio`, `links_config` | `docs/GUIA-BOT-Y-ARTICULOS.md`, `docs/GUIA-AUDITORIA.md` |

---

## 4. Núcleo compartido y paridad entre productos

Es el código que los tres productos necesitan igual. Su versión canónica está en **PRODIGY**; los otros repos
la copian y solo cambian su configuración (marca, `negocio`, textos), nunca la lógica.

- **JS:** `auth-guard`, `rol-actual`, `notif-panel`, `ver-clave`, `webpush`, `modo-prueba`, `pedido-guard`,
  `upload-guard`, `registro-archivos`, `fechas-habiles`, `formatos`, `visor-universal`, `historial`, `imprimir`.
- **Functions:** `notify-staff`, `reportar-problema`, `send-email`, `send-push`, `gemini`, `paypal-*`.

**Estado medido (2026-10-01, PRODIGY ↔ Alejandro):** 36 archivos JS en común — 12 idénticos y 24 con
diferencias (p. ej. `auth-guard` 132 líneas, `pagos` 1 201); 14 funciones en común — 13 con diferencias.
Parte es configuración legítima; el resto es deriva por fixes que no se portaron.

**Regla:** las diferencias por producto van en un bloque de configuración al inicio del archivo
(`const NEGOCIO = …`), no en bifurcaciones del código. Un fix al núcleo se hace en PRODIGY y se porta.

---

## 5. ¿Dónde va esto? (reglas para todo lo nuevo)

| Si lo nuevo es… | Va en… | Nunca en… |
|---|---|---|
| Regla que toca dinero, estado de un caso o permisos | Postgres: RPC `SECURITY DEFINER` + `search_path`, trigger o RLS | Solo en el JS de la página (el navegador muestra; el servidor decide) |
| Llamada a un proveedor con clave | `functions/api/<capacidad>.js` + env var en Cloudflare | El navegador, `supabase/functions/`, el repo |
| UI usada en 2+ páginas | `js/<modulo>-<cosa>.js` o el archivo del módulo que ya exista | Copiada y pegada en cada página |
| Consulta a una tabla desde 2+ páginas | (objetivo) un acceso a datos del módulo dueño | Columnas escritas a mano en cada página |
| Tabla o columna nueva | Módulo dueño, nombre en español, `negocio` si es compartida, RLS + GRANT, `sql/<modulo>-<tema>-<año>.sql` idempotente | Tablas paralelas, columnas bilingües, sin verificar el esquema real |
| Página pública | Raíz o `en/`, checklist `docs/GUIA-PAGINAS-NUEVAS.md` | — |
| Página interna | `app/`, `noindex` + `auth-guard.js` | Sin guardia |
| Carpeta interna nueva | Bloqueo en `functions/_middleware.js` y `_redirects` | Servida pública |
| Algo del núcleo compartido | PRODIGY primero, luego portar | Solo en un repo |

Antes de tocar BD: `node tools/audit-schema-live.mjs` y la skill `prodigy-cambio-bd`.

---

## 6. Deuda técnica y plan por etapas

Cirugía sobre datos vivos: por etapas, cada una verificable y reversible.

**Etapa 1 — bajo riesgo (siguiente):**
1. **Registro de SQL aplicado.** Hoy no se sabe con certeza qué parche ya se corrió. Seguir
   `sql/_baseline/README.md`: migraciones con fecha, solo agregar, y una tabla que anote cada una aplicada.
2. ✅ **Detector de deriva del núcleo:** `node tools/audit-nucleo.mjs` compara los archivos del §4 con
   Alejandro (BSS en pausa: `--repo`) y marca cuál repo los tocó último (si el otro es más nuevo, tiene un fix por traer).

**Etapa 2 — medio:**
3. **Acceso a datos por módulo**, empezando por `pedidos`: un archivo con las consultas y columnas del módulo
   para que un cambio de esquema se corrija en un solo lugar.
4. **Un solo runtime por capacidad.** El envío de push existe dos veces (`supabase/functions/send-push` en
   calidad/contabilidad/mensajero y `functions/api/send-push` en el resto). Unificar en Cloudflare.
5. **Revisar posibles solapes** (verificar contra la base antes de decidir): `leads` / `leads_doctores`,
   `clientes` / `doctores_perfil` / `perfiles`, `archivos` / `pedido_archivos`.

**Etapa 3 — cuando BSS o el SaaS lo pidan:**
6. **Monorepo** (`apps/prodigy`, `apps/alejandro`, `apps/bss`, `packages/nucleo`) con un paso de copia del
   núcleo al publicar en Cloudflare Pages. Elimina la paridad manual, pero exige mover tres proyectos de
   Cloudflare: solo si el costo de portar fixes sigue creciendo.

**No hacer:** microservicios, reescritura a React/Next, una tabla nueva por cada variante de un concepto
que ya existe.
