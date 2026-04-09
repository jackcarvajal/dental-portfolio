# REGLAS MAESTRAS - PROYECTO PRODIGY

## 0. PERMISOS DE EJECUCIÓN
Claude Code tiene PERMISO TOTAL: bash, leer, escribir, crear, eliminar archivos, PowerShell, Node.js, Python.
Solo pide confirmación si: eliminas sin backup, cambios >200 líneas, instalas dependencias.

## 1. Ejecución Directa
Ejecuta sin pedir permiso (`grep`, `view`, `edit`). Solo confirma si es destructivo o ambiguo.

## 2. Eficiencia de Tokens
- Nunca leas archivos >1000 líneas sin `grep` primero.
- Ediciones QUIRÚRGICAS. No reescribas bloques si solo cambia una línea.
- Reportes en texto plano. Sin emojis de sección, sin separadores ═══, sin repetir verificaciones.

## 2b. Protocolo de Eficiencia Operacional
1. **Contexto selectivo:** Archivos >300 líneas → leer solo ±30 líneas alrededor del match. Nunca el archivo completo si no es estrictamente necesario.
2. **Cero prosa inicial:** Sin introducciones ni explicaciones de lo que vas a hacer. Directo a la acción.
3. **Diagnóstico flash:** Si hay error, máximo 3 líneas de descripción. Luego acción.
4. **Sin propuestas no pedidas:** No sugerir mejoras estéticas ni refactors no solicitados explícitamente.
5. **Verificación única:** Una sola verificación por cambio (grep con número de línea). Sin verificaciones en cadena.

## 3. Contexto PRODIGY
- **Usuario:** Alejandro Carvajal (Experto Exocad/3Shape).
- **Stack:** Vanilla JS, HTML5, CSS3. Rutas relativas siempre.
- **Idioma:** Español estricto.
- **Sagrado:** `calcularTotal()` y `STATE` solo se tocan con autorización explícita. Sin variables paralelas para precios.

## 4. Reporte de Cambios (al finalizar toda tarea)
Formato compacto obligatorio — una línea por ítem:

```
CAMBIOS:
[archivo] → [qué cambió] (línea X)

VERIFICADO:
[grep o check] → [resultado]

PENDIENTE:
1. [acción concreta]
2. [acción concreta]
```

Si no hay pendientes, omitir esa sección. Sin decoración, sin prosa larga.

## 5. Horarios y Tiempos de Entrega
- Horario hábil: 8:00 AM - 6:00 PM. Corte: 5:00 PM.
- Días: lunes a sábado (sin domingos).
- Pedidos después de las 5 PM arrancan a las 8 AM del día siguiente.
- Distribuir `STATE.tiempo` solo dentro del horario hábil.

## 6. Colores del Tema
```css
--gold-primary: #D946A6      /* Magenta principal */
--gold-hover: #D4AF37        /* Dorado hovers */
--accent-cyan: #00d2ff       /* Cyan neón */
--bg-darker: #050505         /* Fondo oscuro */
--bg-card: #1a2332           /* Tarjetas */
--text-primary: #ffffff
--text-secondary: #e2e8f0
--text-tertiary: #cbd5e1
--neon-green: #00FF41
```

## 7. Funciones Críticas (NO TOCAR sin autorización)
- `calcularTotal()` — precio final
- `STATE` — objeto global de configuración
- `calcularFechaEntrega()` — lógica de tiempos

## 8. Seguridad — Checklist de Archivos Internos
Todo archivo de `/app/` que no sea `login.html` o `reset-password.html` debe tener:
- `<meta name="robots" content="noindex, nofollow">` en el `<head>`
- `<script src="../js/auth-guard.js"></script>` antes de cualquier JS de negocio
- El `robots.txt` ya tiene `Disallow: /app/` y `Disallow: /patient.html`

Archivos en raíz que NO deben ser públicos → agregar a `robots.txt` y con `noindex`.

## 9. Registro de Sesiones (Log Operacional)

### Formato obligatorio al iniciar o cerrar sesión larga:
Claude debe crear o actualizar `SESIONES.md` al final de cada sesión con el siguiente bloque:

```
### Sesión YYYY-MM-DD
**Duración estimada:** X horas

IMPLEMENTADO:
- [archivo] → [qué se hizo]

ERRORES ENCONTRADOS Y CORREGIDOS:
- [descripción del error] → [solución aplicada]

PENDIENTE TÉCNICO (código):
- [tarea concreta]

PENDIENTE MANUAL (Alejandro):
- [acción manual necesaria]

MEJORAS EVALUADAS (no implementadas):
- [idea] — [por qué se pospuso]
```

No escribir el log durante la sesión — solo al final o cuando el usuario lo pide.
Si la sesión fue corta o de solo consultas, omitir log.

## 10. Mejoras Propuestas — Banco de Ideas

Evaluadas y aprobadas por Alejandro para implementar cuando haya capacidad.
Marcar con ✅ cuando se implemente, ❌ si se descarta con razón.

### Alta prioridad
- [ ] **Notificación WA automática al doctor cuando avanza el estado** — `notify-wa` Edge Function ya existe en PENDIENTES Bloque 3. Cuando `avanzarCaso()` cambia estado, hacer POST a la función con el doctor_whatsapp.
- [ ] **Link de aprobación de diseño por WA** — Al guardar `link_diseno`, enviar WA al doctor con el link directo al portal + botón de aprobación. Actualmente solo queda en el portal sin notificación activa.
- [ ] **Columna `asignado_a` en `pedidos_doctor`** — Permite asignar casos a agentes específicos en el rutador cuando haya equipo. Requiere 1 línea SQL: `ALTER TABLE pedidos_doctor ADD COLUMN asignado_a TEXT;`

### Media prioridad
- [ ] **Dashboard de analytics en panel operador** — Pestaña "Métricas" con: casos por semana, tiempo promedio diseño→fresado, % urgentes, ingresos mensuales estimados. Todo calculado client-side desde `pedidos_doctor`.
- [ ] **Calendario de entregas** — Vista de semana en el panel operador mostrando casos por `fecha_entrega_estimada`. Identificar días con pico de carga.
- [ ] **Flujo "Envía tu escáner, diseñamos nosotros"** — Landing page pública donde clínicas con iTero/Medit suben su .stl sin Exocad. Amplía mercado a clínicas sin lab propio.
- [ ] **Realtime en rutador** — Suscripción Supabase Realtime en `#tab-rutador` para que las tarjetas se muevan solas cuando cambia el estado sin recargar manualmente.

### Baja prioridad / Cuando haya más volumen
- [ ] **App PWA del mensajero** — `mensajero.html` convertido a PWA instalable (manifest + service worker) para que el repartidor lo use offline.
- [ ] **Integración Medit/3Shape directa** — Webhook que recibe el caso del escáner directamente a `pedidos_doctor` sin formulario manual. Requiere API de Medit.
- [ ] **Auto-facturación** — Cuando `estado = 'enviado'`, generar PDF de factura con datos del doctor y enviarlo por WA. Requiere `migrate-billing.sql`.
- [ ] **Portal de paciente con realtime** — `patient.html` convertido a vista pública con código de seguimiento (tipo DHL), sin login, solo con código de caso.

## 11. Convención de Archivos Protegidos vs Públicos

| Ubicación | Auth requerido | noindex | Acceso |
|-----------|---------------|---------|--------|
| `/app/*.html` (excepto login, reset) | Sí (auth-guard.js) | Sí | Solo staff autenticado |
| `/patient.html` | No | Sí | Link directo (futuro: token) |
| `/patients/*` | No | Sí (robots) | Solo con link firmado |
| `/sql/*`, `/supabase/*` | Netlify 404 | — | Bloqueado en netlify.toml |
| `/*.html` raíz pública | No | No (indexable) | Público |
