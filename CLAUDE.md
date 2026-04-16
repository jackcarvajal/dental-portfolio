# REGLAS MAESTRAS - PROYECTO PRODIGY

## 0. PERMISOS
Permiso total: bash, leer, escribir, crear, eliminar. Confirma solo si: eliminas sin backup, cambios >200 líneas, instalas dependencias.

## 1. OPERACIÓN (SIN PROSA)
- Directo a la acción. Sin introducciones. Sin sugerencias no pedidas.
- Archivos >300 líneas: grep primero, leer solo ±30 líneas del match.
- Ediciones QUIRÚRGICAS. No reescribir bloques si cambia una línea.
- Diagnóstico de error: máx 3 líneas. Luego acción.
- Verificación única por cambio: un grep con número de línea. Sin cadenas.

## 2. CONTEXTO
- Usuario: Alejandro Carvajal. Idioma: Español estricto.
- Stack: Vanilla JS, HTML5, CSS3. Rutas relativas siempre.
- INTOCABLE sin autorización explícita: `calcularTotal()`, `STATE`, `calcularFechaEntrega()`.
- Sin variables paralelas para precios. Siempre usar STATE.

## 3. HORARIOS
- Hábil: L-S, 8am-6pm. Corte: 5pm. Post-corte → arranca día siguiente 8am.
- Sin domingos. STATE.tiempo solo dentro de horario hábil.

## 3b. PÁGINAS NUEVAS (mandamiento de oro)
Toda página HTML nueva pública DEBE incluir:
- `<nav class="navbar">` con el mismo encabezado doble (topbar + navbar principal) de index.html
- `<script src="js/footer.js"></script>` antes de `</body>`
- `<meta name="theme-color" content="#D946A6">` y `<link rel="manifest" href="/manifest.json">`
- `<script>if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});</script>`
- Link rel="canonical" y meta description
- ACTUALIZAR footer.js y sitemap.xml si la página es pública e indexable

## 4. SEGURIDAD
- `/app/*.html` (excepto login/reset): requieren `<meta name="robots" content="noindex,nofollow">` y `<script src="../js/auth-guard.js">` antes de cualquier JS de negocio.
- `/patient.html`, `/patients/*`: noindex. Sin auth, acceso por link.
- `/sql/*`, `/supabase/*`: bloqueados en netlify.toml.

## 5. COLORES (referencia rápida)
`--gold-primary:#D946A6` `--gold-hover:#D4AF37` `--accent-cyan:#00d2ff` `--bg-darker:#050505` `--bg-card:#1a2332` `--neon-green:#00FF41`

## 6. REPORTE (formato obligatorio al terminar tarea)
```
CAMBIOS: [archivo] → [qué cambió] (línea X)
VERIFICADO: [grep] → [resultado]
PENDIENTE: [acción] → solo si hay algo
```

## 7. LOG DE SESIÓN (solo al cerrar sesión larga, en SESIONES.md)
```
### YYYY-MM-DD | Xh
Implementado: [archivo → qué]
Errores: [error → solución]
Pendiente técnico: [tarea]
Pendiente manual: [acción Alejandro]
```
Omitir si sesión corta o de solo consultas.

## 8. BACKLOG
Las mejoras propuestas viven en PENDIENTES.md. No leer salvo que Alejandro lo indique.

## 9. PRIVACIDAD Y DATOS
- Todo formulario de captación (leads/registro) requiere checkbox Habeas Data Colombia.
- Texto legal: "Autorizo tratamiento de mis datos para gestión de pedidos. Acepto recibir novedades y promociones (opcional). Puedo darme de baja sin afectar seguimiento de caso."
- Separar estrictamente: Transaccionales (seguimiento Kanban → siempre) vs. Promocionales (marketing → requiere acepta_marketing = true).
- BAJA de marketing no afecta columna de notificaciones operativas.
- Columna `acepta_marketing boolean default false` en tablas de doctores y solicitudes_scanner.
