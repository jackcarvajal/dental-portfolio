# REGLAS MAESTRAS - PROYECTO PRODIGY
> Estándares técnicos completos: `ESTANDARES-TECNICOS.md`

## 0. PERMISOS
Total: bash, leer, escribir, crear, eliminar. Confirma solo si: eliminas sin backup, cambios >200 líneas, instalas dependencias.

## 1. OPERACIÓN
- Directo. Sin introducciones. Sin sugerencias no pedidas.
- Archivos >300 líneas: grep primero, leer solo ±30 líneas del match.
- Ediciones QUIRÚRGICAS. Diagnóstico: máx 3 líneas. Verificación: un grep con número de línea.

## 2. CONTEXTO
- Usuario: Alejandro Carvajal. Idioma: Español estricto.
- Stack: Vanilla JS, HTML5, CSS3. Rutas relativas siempre.
- INTOCABLE: `calcularTotal()`, `STATE`, `calcularFechaEntrega()`. Sin variables paralelas para precios.

## 3. HORARIOS
L-S 8am-6pm. Corte 5pm → arranca día siguiente 8am. Sin domingos.

## 3b. PÁGINAS NUEVAS
Toda página pública DEBE tener:
- `<script src="js/header.js"></script>` — PRIMER elemento de `<body>`
- `<script src="js/footer.js"></script>` — antes de `</body>`
- `<meta name="theme-color" content="#D946A6">` + `<link rel="manifest" href="/manifest.json">`
- SW: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{})`
- canonical + meta description
- Actualizar footer.js y sitemap.xml si es indexable

## 3c. LEY 50/50
Cotizaciones: "50% abono inicio · 50% saldo contra entrega". Precios en COP. WA incluye: Total, Abono, Saldo.

## 4. SEGURIDAD
- `/app/*.html` (excl. login/reset): `noindex,nofollow` + `auth-guard.js` antes de JS de negocio.
- `/patient.html`, `/patients/*`: noindex.
- `/sql/*`, `/supabase/*`: bloqueados en `_redirects`.

## 5. COLORES
`#D946A6` gold · `#D4AF37` hover · `#00d2ff` cyan · `#050505` bg · `#1a2332` card · `#00FF41` neon

## 6. REPORTE (al terminar tarea)
```
CAMBIOS: [archivo] → [qué] (línea X)
VERIFICADO: [grep] → [resultado]
PENDIENTE: [acción] → solo si hay algo
```
Al final de sesión: indicar `/clear` (todo commiteado) o `/compact` (trabajo en vuelo).

## 7. BACKLOG
Mejoras propuestas en PENDIENTES.md. No leer salvo que Alejandro lo indique.

## 8. PRIVACIDAD
- Formularios: checkbox Habeas Data Colombia obligatorio.
- Separar: Transaccionales (siempre) vs. Promocionales (`acepta_marketing = true`).
- Columna `acepta_marketing boolean default false` en doctores y solicitudes_scanner.
