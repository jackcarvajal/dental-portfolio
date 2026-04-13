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
