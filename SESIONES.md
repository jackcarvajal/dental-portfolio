# PRODIGY — Registro de Sesiones Operacionales
> Actualizar al finalizar cada sesión larga. Formato definido en CLAUDE.md § 9.

---

### Sesión 2026-04-08 (Sesión maestra — contexto comprimido previo + continuación)

**Temas:** Sistema de artículos dinámico · Auditoría de seguridad · Portal doctor · Rutador de casos · Análisis competitivo · Flujo de aprobación de diseño

---

IMPLEMENTADO:
- `articles.js` → creado — sistema de artículos dinámico con 4 artículos completos + 2 stubs. Referencias científicas reales con PubMed/DOI.
- `article.html` → creado — renderizador dinámico por ?id=, JSON-LD, FAQ accordion, compartir WA/LinkedIn.
- `journal.html` → 6 tarjetas conectadas a article.html?id=X (antes href="#").
- `index.html` → sección portafolio reemplazada con 3 tarjetas de casos reales con gradientes.
- `netlify.toml` → creado — CSP completa con wss:// para Supabase Realtime, cache agresivo, redirects de seguridad.
- `sitemap.xml` → actualizado — agregados journal.html, calculadora.html, portafolio.html, 4 artículos, raíz como / no /index.html.
- `sql/migrate-doctores.sql` → creado — tablas doctores_perfil + pedidos_doctor con RLS completo.
- `sql/migrate-leads.sql` → creado — tabla leads_doctores con RLS.
- `sql/migrate-diseno-approval.sql` → creado — ALTER TABLE: link_diseno, diseno_aprobado, notas_cambios.
- `app/client-panel.html` → sección "Mis Pedidos Online" + modal de aprobación de diseño (iframe Exocad + aprobar/pedir cambios → actualiza estado en BD).
- `app/panel-interno-operaciones.html` → Tab "Pedidos Doctores" + Tab "Rutador de Casos" (4 lanes kanban: diseño/fresado/impresión/QA) + compartir HTML diseño desde tarjeta en_diseno.
- `app/mensajero.html` → noindex agregado (faltaba).
- `patient.html` → noindex agregado + robots.txt actualizado.
- `PENDIENTES.md` → creado — fuente única de verdad con 8 bloques de pendientes manuales.
- `CLAUDE.md` → agregados §8 Seguridad, §9 Registro de Sesiones, §10 Banco de Mejoras, §11 Convención de Archivos.
- 54 enlaces `target="_blank"` en 13 archivos → `rel="noopener noreferrer"` agregado vía Node.js.
- WA unificado a 573212816716 en flujo-impresion.js (2 instancias corregidas).
- Email corregido a casos@prodigylabdental.com en enviar-produccion-*.html.

ERRORES ENCONTRADOS Y CORREGIDOS:
- `netlify.toml` CSP faltaba `wss://` → Supabase Realtime hubiera fallado en producción en silencio. Corregido.
- `sitemap.xml` apuntaba a /index.html en vez de / y faltaban journal/calculadora/portafolio/artículos. Corregido.
- `app/mensajero.html` sin noindex — panel interno indexable por Google. Corregido.
- `patient.html` en raíz sin noindex ni robots.txt Disallow. Corregido.
- WA en `flujo-impresion.js` apuntaba a número incorrecto (573228774481). Corregido.
- Email incorrecto en enviar-produccion-*.html. Corregido.
- `site:prodigylabdental.com` = 0 resultados — sitio no indexado por Google (causa: Netlify pendiente, dominio no activo).

PENDIENTE TÉCNICO (código):
- Notificación WA al doctor cuando se guarda `link_diseno` (función JS en guardarLinkDiseno + Edge Function notify-wa).
- Columna `asignado_a TEXT` en `pedidos_doctor` para asignación a agentes.
- Realtime subscription en el rutador (auto-refresh sin botón).

PENDIENTE MANUAL (Alejandro):
- Ejecutar en Supabase SQL Editor (en orden): migrate-doctores.sql → migrate-leads.sql → migrate-diseno-approval.sql
- Netlify: crear cuenta → importar repo → conectar dominio prodigylabdental.com → DNS → HTTPS.
- Google Search Console: verificar dominio → enviar sitemap.xml.
- Google My Business: crear perfil con fotos del lab.
- Supabase Auth: Site URL → https://prodigylabdental.com | Redirect URLs → https://prodigylabdental.com/**
- Supabase Storage: crear buckets `casos` y `evidencias-entrega` (Private).
- Supabase Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (generar con npx web-push generate-vapid-keys).
- Ver PENDIENTES.md para lista completa de 12 SQL + 8 Secrets + 4 Edge Functions.

MEJORAS EVALUADAS (no implementadas — ver CLAUDE.md §10):
- Live Design Review con video (tipo Dandy) → pospuesto: el HTML viewer de Exocad ya cubre la necesidad.
- Flujo "Envía tu escáner, diseñamos nosotros" → evaluado, alta prioridad para próxima sesión.
- Dashboard de analytics → banco de ideas §10, media prioridad.

---

ANÁLISIS COMPETITIVO REALIZADO:
- Sindekar (Colombia directa): sin calculadora pública, sin portal doctor online, sin blog. ProDigy supera en todos.
- Panthera Dental (Canadá, referencia mundial): 3 flujos de entrada, visor 3D, AI routing, integración Medit. Benchmark de plataforma.
- Dandy (EE.UU.): Live Design Review con video + 3D, $99 corona zirconio, escáner gratis con mínimo mensual.
- Cefredent (Bogotá, competidor directo): 24-36h, sin precios públicos, sin portal, sin blog.
- Fresatitan (Colombia): B2B lab-to-lab, sin portal online.
- 3Shape FullContour/Automate: diseño IA en 90s, solo diseño (no fresado), pago por aprobación.
- CadCam Masters / CadCrowd / ExocadDesigns: plataformas de outsourcing para escalar diseñadores.

---

### Plantilla para próximas sesiones:

```
### Sesión YYYY-MM-DD
**Temas:** [lista]

IMPLEMENTADO:
- 

ERRORES ENCONTRADOS Y CORREGIDOS:
- 

PENDIENTE TÉCNICO (código):
- 

PENDIENTE MANUAL (Alejandro):
- 

MEJORAS EVALUADAS (no implementadas):
- 
```
