# 🦷 PRODIGY - Configurador Dental Lab

## 📋 Información del Proyecto

**Versión Actual:** v6.1-FINAL  
**Fecha:** Marzo 2026  
**Desarrollador:** Alejandro  
**Asistente:** Claude (Anthropic)  

## 🎯 ¿Qué es PRODIGY?

PRODIGY es un configurador web para laboratorio dental que permite cotizar y configurar trabajos de impresión 3D dental. Es una aplicación HTML pura (sin frameworks) con calculadora dinámica, selector de materiales, colores VITA y sistema de timeline para entregas.

## 🏗️ Arquitectura Técnica

- **Stack:** HTML5 + CSS3 + Vanilla JavaScript
- **Sin dependencias externas** (excepto Font Awesome para iconos)
- **Tema:** Cyberpunk/Dark con variables CSS
- **Archivo único:** Todo en un solo HTML (portabilidad)
- **Líneas de código:** ~5,156 líneas en v6.1

## 📁 Estructura de Archivos Recomendada

```
PRODIGY/
├── README.md                          # Este archivo
├── builds/
│   ├── PRODIGY-v6.1-FINAL.html       # ✅ Versión actual FUNCIONAL
│   ├── PRODIGY-v6.0-FINAL.html       # Versión anterior
│   └── versiones-anteriores/         # Historial de builds
├── docs/
│   ├── GUIA-MANDAMIENTOS-v3_3.md     # 📜 REGLAS OBLIGATORIAS
│   ├── MIGRACION-CHAT-V3_3.md        # Contexto técnico del proyecto
│   ├── CONTEXTO-COMPLETO-CLAUDE-CODE.md  # Historial completo de desarrollo
│   └── CHANGELOG.md                   # Registro de cambios por versión
└── assets/
    └── capturas/                      # Screenshots del UI
```

## 🚀 Estado Actual del Proyecto

### ✅ Funcionalidades Implementadas

1. **Selector de Materiales (6 categorías)**
   - Modelos 3D
   - Temporales
   - Definitivas (resinas de carga cerámica)
   - Calcinables
   - Férulas y Guías
   - Biomodelos

2. **Selector de Colores VITA (v6.1)**
   - Sistema de tarjetas limpias (solo código: A1, A2, etc.)
   - Mapeo por fabricante:
     - Rodin: A1, A2, A3, B1, C2, 0M1, 0M3
     - BEGO: A1, A2, A3, B1, B3, C2, D3, BL
     - Saremco: A1, A2, A3, A3.5, B1, SW
     - SprintRay: A1, A2, A3, B1, B3, C2, D3, Bleach
     - Graphy: A1, A2, A3

3. **Selector de Terminado**
   - Solo Glaseado
   - Maquillaje + Glaseado

4. **Calculadora Dinámica**
   - Precio base por material
   - Extras (Optiglaze, Material Externo, etc.)
   - Resumen en tiempo real
   - Display de precio final

5. **Sistema de Timeline**
   - Cálculo automático de fechas de entrega
   - Consideración de fines de semana
   - Tiempos por proceso (50 micras, 25 micras)

6. **Formulario de Datos del Cliente**
   - Validación en tiempo real
   - WhatsApp para contacto
   - Origen del cliente

## 📜 REGLAS SAGRADAS DE DESARROLLO

### ⚠️ ANTES DE HACER CUALQUIER CAMBIO

**OBLIGATORIO:** Lee `/docs/GUIA-MANDAMIENTOS-v3_3.md`

**Los 10 Mandamientos (Resumen):**

1. **VERIFICAR TODO** - Usa `grep` antes de declarar "listo"
2. **CIRUGÍA, NO CIRUGÍA MAYOR** - Solo cambios quirúrgicos
3. **NUNCA TOCAR `calcularTotal()`** - Es sagrada (línea ~3737)
4. **VERSIONES INCREMENTALES** - v6.2, v6.3, etc. (nunca sobrescribir)
5. **AUDITAR PROMPTS SUPERVISOR** - Los nombres a veces están mal
6. **SIEMPRE PRESENTAR ARCHIVOS** - Sin esto no se ve nada
7. **LEER ANTES DE MODIFICAR** - `view` → `plan` → `execute` → `verify`
8. **NO INVENTAR, VERIFICAR** - Si no existe, pregunta
9. **RESPUESTAS DIRECTAS** - Sin explicaciones innecesarias
10. **CUANDO NO SABES, PREGUNTA** - Mejor que romper código

### 🔄 Workflow Obligatorio (El Ciclo Sagrado)

```
1. VIEW   → Ver código actual
2. PLAN   → Planear cambio quirúrgico
3. CHANGE → Ejecutar str_replace (o edit directo en Claude Code)
4. VERIFY → grep para verificar
5. CONFIRM → Declarar completado
6. SAVE   → Guardar nueva versión
```

## 📊 Changelog de Versiones

### v6.1-FINAL (Actual) ✅
- **Fecha:** 29 Marzo 2026
- **Cambios:**
  - Arquitectura de tarjetas para Color y Terminado
  - Eliminado `container-color-vita` viejo
  - Creado `section-color` y `section-terminado`
  - Tiempos clínicos actualizados (24-36 meses para permanentes)
  - Función `seleccionarColor()` y `seleccionarTerminado()`
  - Función `actualizarResumenCalculadora()`

### v6.0-FINAL
- **Fecha:** 29 Marzo 2026
- **Cambios:**
  - Códigos VITA limpios sin descripciones
  - Eliminados paréntesis: `0M1 (Bleach)` → `0M1`
  - mapeoColores actualizado con códigos oficiales

### v5.9-FINAL
- **Fecha:** 22-28 Marzo 2026
- **Cambios:**
  - Selector de colores VITA con botones visuales
  - Función `selectColorVita(color)`
  - Grid de 3 columnas con gradientes CSS
  - Guía clínica con especificaciones oficiales

### v5.6 - v5.8
- Iteraciones anteriores del selector de colores
- Migración de dropdown a botones visuales

## 🎨 Arquitectura del STATE Global

```javascript
STATE = {
    // Material principal
    materialTipo: null,              // 'resina_definitiva', 'resina_temporal', etc.
    
    // Submaterial (resina específica)
    submaterialId: null,             // 'def_rodin', 'def_bego', etc.
    submaterialNombre: null,         // 'Rodin Sculpture'
    submaterialPrecio: 0,
    precioBase: 0,                   // Precio base parseado
    
    // Color y Terminado (v6.1)
    color: null,                     // 'A1', 'A2', '0M1', etc.
    colorVita: null,                 // Compatibilidad legacy
    terminado: null,                 // 'Solo Glaseado' o 'Maquillaje + Glaseado'
    
    // Proceso y extras
    proceso: '50_micras',            // '50_micras', '25_micras'
    materialExterno: false,          // Resina de cliente (+$50,000 único)
    
    // Timeline
    tiempoProceso: 0,                // Días de proceso
    
    // ... otros campos
}
```

## 🛠️ Funciones Críticas (NO TOCAR sin autorización)

### `calcularTotal()` - Línea ~3737
**⚠️ SAGRADA - NO MODIFICAR**

Esta función calcula el precio final sumando:
- Precio base del material
- Extras que se multiplican por cantidad (Optiglaze, Resolución 25 micras)
- Extras de pago único (Material Externo $50,000)

**Solo modificar si Alejandro dice explícitamente: "modifica calcularTotal"**

### `selectSubMaterial(id, nombre, precio)` - Línea ~3125
Función principal para seleccionar resina. Dispara:
1. Actualización de STATE
2. Generación de tarjetas de color
3. Mostrar sección de terminado
4. Actualizar calculadora visual
5. Llamar `calcularTotal()`

### `seleccionarColor(color, elemento)` - v6.1
Guarda color VITA seleccionado, marca tarjeta activa, actualiza resumen.

### `seleccionarTerminado(tipo, elemento)` - v6.1
Guarda tipo de terminado, marca tarjeta activa, actualiza resumen.

## 🗂️ Estructura de Datos: SUB_MATERIALES

```javascript
SUB_MATERIALES = {
    'resina_definitiva': [
        { 
            id: 'def_rodin', 
            nom: 'Rodin Sculpture', 
            subtitulo: 'Vida: 24 a 36 meses / All-on-X', 
            precio: 50000 
        },
        { 
            id: 'def_bego', 
            nom: 'BEGO Varseo Plus', 
            subtitulo: 'Vida: 24 a 36 meses / Carillas y Coronas', 
            precio: 45000 
        },
        // ... más resinas
    ],
    // ... otras categorías
}
```

## 🎯 Casos de Uso Comunes

### Cambiar un Precio
```javascript
// INCORRECTO ❌
precio: 50000 → precio: 55000  // Sin verificar

// CORRECTO ✅
1. grep -n "def_rodin.*50000" archivo
2. Verificar línea exacta
3. Hacer cambio quirúrgico
4. grep -n "def_rodin.*55000" archivo
5. Confirmar que aparece
```

### Agregar un Nuevo Color a una Resina
```javascript
// En mapeoColores (línea ~3150):
'def_rodin': ['A1', 'A2', 'A3', 'B1', 'C2', '0M1', '0M3', 'NUEVO'],

// Verificar:
grep -n "'def_rodin'.*NUEVO" archivo
```

### Actualizar Texto de Subtítulo
```javascript
// SUB_MATERIALES (línea ~2584):
subtitulo: 'Vida: 24 a 36 meses / All-on-X'

// Cambio quirúrgico directo en esa línea
// Verificar con grep después
```

## 🚨 Errores Comunes a Evitar

### ❌ ERROR #1: No Verificar Cambios
```
Desarrollador: "Ya cambié el precio a $55,000"
Claude: [sin usar grep]
Resultado: El cambio no se aplicó, archivo sigue con $50,000
```

### ❌ ERROR #2: Reescribir Funciones Completas
```javascript
// MAL - Reescribir toda calcularTotal() "para mejorar"
function calcularTotal() {
    // 100 líneas nuevas
}

// BIEN - Solo cambiar la constante que usa
const PRECIO_OPTIGLAZE = 20000; // Era 18000
```

### ❌ ERROR #3: No Versionar
```
PRODIGY-FINAL.html  ← ❌ Sin versión
PRODIGY-v6.1-FINAL.html  ← ✅ Versionado correcto
```

### ❌ ERROR #4: Inventar Nombres de Variables
```javascript
// Prompt supervisor dice:
"Actualiza resinaExternaActiva"

// Pero en el código real es:
STATE.materialExterno

// SIEMPRE verificar con grep primero
```

## 📞 Contacto y Notas del Desarrollador

**Desarrollador:** Alejandro  
**Preferencias de comunicación:**
- Respuestas directas y concisas
- Sin explicaciones excesivas
- Ir directo a la solución
- Español como idioma principal

**Herramientas externas que usa Alejandro:**
- Un sistema "supervisor" que genera prompts automáticos
- **ADVERTENCIA:** Los prompts del supervisor a veces tienen errores en nombres de variables/funciones
- **SIEMPRE auditar** nombres contra el código real con `grep`

## 🔗 Documentos de Referencia

1. **GUIA-MANDAMIENTOS-v3_3.md** - Reglas obligatorias de desarrollo
2. **MIGRACION-CHAT-V3_3.md** - Contexto técnico e historia del proyecto
3. **CONTEXTO-COMPLETO-CLAUDE-CODE.md** - Historial completo de esta conversación

## 🎓 Para Claude Code: Cómo Trabajar en Este Proyecto

### Primer Prompt Recomendado
```
Hola Claude Code. Soy Alejandro, dueño de PRODIGY.

Por favor:
1. Lee /docs/GUIA-MANDAMIENTOS-v3_3.md (obligatorio)
2. Abre /builds/PRODIGY-v6.1-FINAL.html
3. Confirma que entiendes la arquitectura

Después te daré la siguiente tarea.
```

### Antes de Cada Cambio
```
1. Leer mandamientos relevantes
2. Usar grep para encontrar código exacto
3. Planear cambio quirúrgico (explicar qué harás)
4. Ejecutar cambio
5. Verificar con grep
6. Confirmar a Alejandro
7. Guardar como nueva versión (v6.2, v6.3, etc.)
```

### Comandos Útiles para Claude Code
```bash
# Buscar función
grep -n "function calcularTotal" archivo

# Verificar cambio
grep -n "nuevo_texto" archivo

# Contar ocurrencias
grep -c "STATE.color" archivo

# Buscar con contexto
grep -A5 -B5 "selectSubMaterial" archivo
```

---

## ✅ Checklist Antes de Entregar Nueva Versión

- [ ] Todos los cambios verificados con grep
- [ ] Ninguna función crítica modificada sin autorización
- [ ] Archivo tiene número de versión correcto (v6.X)
- [ ] No hay comentarios de "TODO" o "FIXME"
- [ ] Las líneas totales son coherentes (±100 líneas vs anterior)
- [ ] No hay syntax errors
- [ ] Archivo guardado en `/builds/PRODIGY-vX.X-FINAL.html`

---

**Última actualización:** 29 Marzo 2026  
**Versión de este README:** 1.0  
**Estado del proyecto:** ✅ FUNCIONAL - v6.1-FINAL operativa
