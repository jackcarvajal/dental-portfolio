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
