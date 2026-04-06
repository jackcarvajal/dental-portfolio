# 📖 CONTEXTO COMPLETO - Historial de Desarrollo PRODIGY

**Documento para Claude Code**  
Este archivo contiene el contexto completo de todas las conversaciones y desarrollo del proyecto PRODIGY desde marzo 2026.

---

## 🎯 RESUMEN EJECUTIVO

**Proyecto:** PRODIGY - Configurador Dental Lab  
**Versión Actual:** v6.1-FINAL (5,156 líneas)  
**Desarrollador:** Alejandro  
**Asistente IA:** Claude (Anthropic)  
**Período de desarrollo documentado:** 22-29 Marzo 2026  

**Estado actual:** ✅ FUNCIONAL - Selector de colores VITA, terminado y calculadora operativos

---

## 📋 HISTORIAL DE CONVERSACIONES

### SESIÓN 1: Desarrollo v5.6 → v5.9 (22-28 Marzo 2026)

**Archivo base:** PRODIGY-v5.6-FINAL.html (353 KB, 5,057 líneas)

#### Objetivos de la sesión:
1. Implementar selector de colores VITA para resinas definitivas
2. Corregir bugs de calculadora
3. Actualizar especificaciones clínicas de resinas

#### Cambios aplicados:

**v5.7:**
- Insertado `<div id="container-color-vita">` con `<div id="grid-colores-vita">`
- Agregado mapeoColores en selectSubMaterial
- Nota de inventario y contraindicaciones

**v5.8:**
- Reemplazado dropdown `<select>` por botones visuales con gradientes de color
- Función `selectColorVita(color)` agregada (línea ~3224)
- Grid 3 columnas con gradientes CSS por tono

**v5.9 (FUNCIONAL):**
- Función `selectSubMaterial` con firma correcta `(id, nombre, precio)` - 3 parámetros
- `STATE.precioBase = parseFloat(precio)` asignado
- `precio-base-display` actualizado en tiempo real
- Selección visual por `data-id`
- Guía clínica actualizada con especificaciones oficiales de fabricantes

#### Base de datos SUB_MATERIALES implementada:
```javascript
'resina_definitiva': [
    { id: 'def_rodin',    nom: 'Rodin Sculpture',    subtitulo: 'Coronas / Puentes / All-on-X',  precio: 50000 },
    { id: 'def_bego',     nom: 'BEGO Varseo Plus',   subtitulo: 'Carillas / Inlays / Coronas',   precio: 45000 },
    { id: 'def_saremco',  nom: 'Saremco CROWNTEC',   subtitulo: 'Coronas / Puentes / Inlays',    precio: 42000 },
    { id: 'def_sprintray',nom: 'SprintRay OnPoint',  subtitulo: 'Coronas / Puentes',             precio: 48000 },
    { id: 'def_graphy',   nom: 'Graphy TC-80',       subtitulo: 'Coronas / Puentes / Carillas',  precio: 45000 },
    { id: 'def_estandar', nom: 'Definitiva Estándar',subtitulo: 'Uso Limitado / Monocromática',  precio: 35000 }
]
```

#### mapeoColores oficial (catálogos reales):
```javascript
const mapeoColores = {
    'def_rodin':    ['A1', 'A2', 'A3', 'B1', 'C2', '0M1 (Bleach)', '0M3 (Bleach)'],
    'def_bego':     ['A1', 'A2', 'A3', 'B1', 'B3', 'C2', 'D3', 'BL (Bleach)'],
    'def_saremco':  ['A1', 'A2', 'A3', 'A3.5', 'B1', 'SW (Snow White)'],
    'def_sprintray':['A1', 'A2', 'A3', 'B1', 'B3', 'C2', 'D3', 'Bleach'],
    'def_graphy':   ['A1', 'A2', 'A3'],
    'def_estandar': ['A1', 'A2', 'A3', 'B1'],
    'temp_unidad':  ['A1', 'A2', 'A3', 'B1']
};
```

#### Errores cometidos en esta sesión (para no repetir):
1. Cambiar firma de `selectSubMaterial` de 3 a 4 parámetros - rompió todos los onclick
2. Usar `event.currentTarget` sin que event esté definido en el scope
3. Inventar colores VITA que no existen en catálogos reales
4. No verificar con grep antes de declarar cambios completados

---

### SESIÓN 2: Auditoría y v6.0 (29 Marzo 2026)

**Objetivo:** Limpiar códigos de color VITA (eliminar descripciones en paréntesis)

#### Reporte de Auditoría Técnica:
- **Problema detectado:** Códigos VITA con "apellidos" innecesarios
- **Ejemplo:** `'0M1 (Bleach)'` → debería ser solo `'0M1'`
- **Razón:** Plataforma B2B profesional, técnicos dentales hablan en códigos exactos

#### Cambios v6.0 (INTENTO FALLIDO):
- Se intentó cambiar de botones visuales a `<select>` dropdown
- **RESULTADO:** Rompió el selector de colores, Optiglaze y calculadora
- **LECCIÓN:** No cambiar arquitectura funcional sin necesidad

#### Cambios v6.0 (CORRECCIÓN):
- Restaurado desde V5.9 funcional
- Solo actualizado mapeoColores con códigos limpios:

```javascript
const mapeoColores = {
    'def_rodin': ['A1', 'A2', 'A3', 'B1', 'C2', '0M1', '0M3'],  // ✅ Sin paréntesis
    'def_bego': ['A1', 'A2', 'A3', 'B1', 'B3', 'C2', 'D3', 'BL'],
    'def_saremco': ['A1', 'A2', 'A3', 'A3.5', 'B1', 'SW'],
    'def_sprintray': ['A1', 'A2', 'A3', 'B1', 'B3', 'C2', 'D3', 'Bleach'],
    'def_graphy': ['A1', 'A2', 'A3'],
    'def_estandar': ['A1', 'A2', 'A3', 'B1']
};
```

#### Error crítico aprendido:
- No aplicar cambios arquitectónicos cuando solo se necesita actualizar datos
- Mantener lo que funciona, cambiar solo lo necesario (cirugía quirúrgica)

---

### SESIÓN 3: v6.1 - Arquitectura de Tarjetas (29 Marzo 2026)

**Reporte del supervisor técnico:**

#### Verificación Oficial de Tiempos en Boca:
- **Pac-Dent (Rodin Sculpture 2.0):** FDA 510(k) certifica como "restauraciones dentales permanentes"
- **BEGO (VarseoSmile Crown Plus):** IFU: "Material para coronas simples permanentes"
- **Graphy TC-80DP:** "Permanent C&B Resin"

**PERO:** En práctica clínica real, laboratorios catalogan internamente como "Provisionales de Larga Duración (12-24 meses)" para evitar problemas de garantías.

**DECISIÓN:** Ajustar tiempos a realidad del laboratorio:
- Permanentes: "24 a 36 meses"
- Transicionales: "12 a 24 meses"

#### Problema detectado en v6.0:
- Selector `<select>` dropdown no coincidía con arquitectura de tarjetas
- Usuario mostraba captura con **botones/tarjetas**, no dropdown

#### Solución v6.1:
1. **Eliminar completamente** el selector viejo `<div id="container-color-vita">`
2. **Crear nueva arquitectura de tarjetas:**
   - `<div id="section-color">` con `<div id="grid-colores">`
   - `<div id="section-terminado">` con botones:
     - "Solo Glaseado"
     - "Maquillaje + Glaseado"

#### Funciones nuevas implementadas:

```javascript
function selectSubMaterial(id, nombre, precio) {
    // 1. Actualiza STATE
    STATE.submaterialId = id;
    STATE.submaterialNombre = nombre;
    STATE.precioBase = parseFloat(precio);
    
    // 2. Genera tarjetas de color (solo código, ej. "A1")
    // 3. Muestra sección de terminado
    // 4. Actualiza resumen calculadora
    // 5. Llama calcularTotal()
}

function seleccionarColor(color, elemento) {
    STATE.color = color;
    // Marca tarjeta activa (cyan border)
    actualizarResumenCalculadora();
}

function seleccionarTerminado(tipo, elemento) {
    STATE.terminado = tipo;
    // Marca tarjeta activa
    actualizarResumenCalculadora();
}

function actualizarResumenCalculadora() {
    // Actualiza calc-resina, calc-color, calc-terminado
    // Sincroniza precio-base-display
}
```

#### Cambios en SUB_MATERIALES:
```javascript
'resina_definitiva': [
    { id: 'def_rodin', nom: 'Rodin Sculpture', 
      subtitulo: 'Vida: 24 a 36 meses / All-on-X', precio: 50000 },
    { id: 'def_bego', nom: 'BEGO Varseo Plus', 
      subtitulo: 'Vida: 24 a 36 meses / Carillas y Coronas', precio: 45000 },
    { id: 'def_saremco', nom: 'Saremco CROWNTEC', 
      subtitulo: 'Vida: 24 a 36 meses / Inlays y Coronas', precio: 42000 },
    { id: 'def_sprintray', nom: 'SprintRay OnPoint', 
      subtitulo: 'Vida: 12 a 24 meses / Coronas', precio: 48000 },
    { id: 'def_graphy', nom: 'Graphy TC-80', 
      subtitulo: 'Vida: 12 a 24 meses / Híbridas', precio: 45000 }
]
```

#### Verificación v6.1:
```bash
✅ container-color-vita: ELIMINADO
✅ section-color: EXISTE
✅ section-terminado: EXISTE
✅ Tiempos 24-36 meses: VERIFICADO
✅ 5,156 líneas (coherente con v5.9)
```

---

## 🎯 ESTADO FINAL DEL PROYECTO

### Arquitectura Actual (v6.1-FINAL)

#### 1. Selector de Material Principal
6 categorías disponibles:
- Modelos 3D
- Temporales
- **Definitivas** (foco principal de desarrollo reciente)
- Calcinables
- Férulas y Guías
- Biomodelos

#### 2. Selector de Resina Específica (Definitivas)
- Rodin Sculpture (All-on-X, Permanente, $50k)
- BEGO Varseo Plus (Carillas, Permanente, $45k)
- Saremco CROWNTEC (Coronas, Permanente, $42k)
- SprintRay OnPoint (Transicional 12-24m, $48k)
- Graphy TC-80 (Transicional 12-24m, $45k)
- Definitiva Estándar (Limitado, $35k)

#### 3. Selector de Color VITA (Tarjetas)
- Sistema de tarjetas cuadradas
- Solo código (ej. "A1", "B3", "0M1")
- Sin descripciones ni paréntesis
- Colores específicos por fabricante

#### 4. Selector de Terminado (Tarjetas)
- Solo Glaseado
- Maquillaje + Glaseado

#### 5. Calculadora Dinámica
- Precio base actualizado en tiempo real
- Display de extras (Optiglaze, Material Externo)
- Total final
- Resumen de selecciones

---

## 🧬 ARQUITECTURA INTERNA CRÍTICA

### STATE Global (Objeto Central)
```javascript
STATE = {
    // Material y submaterial
    materialTipo: null,           // 'resina_definitiva', etc.
    submaterialId: null,          // 'def_rodin', etc.
    submaterialNombre: null,      // 'Rodin Sculpture'
    precioBase: 0,               // Precio parseado
    
    // Selecciones v6.1
    color: null,                 // 'A1', '0M1', 'SW', etc.
    terminado: null,             // 'Solo Glaseado', etc.
    
    // Extras
    materialExterno: false,      // +$50,000 pago ÚNICO (no multiplica)
    proceso: '50_micras',        // Resolución
    
    // Timeline
    tiempoProceso: 0            // Días
}
```

### Función Sagrada: calcularTotal()
**Ubicación:** Línea ~3737  
**Estado:** SAGRADA - NO TOCAR

**Lógica:**
1. Toma `STATE.precioBase`
2. Suma extras multiplicables por cantidad:
   - Optiglaze: +$20k por unidad
   - Resolución 25 micras: +$15k por unidad
3. Suma extras de pago único:
   - Material Externo: +$50k (UNA SOLA VEZ)
4. Calcula total final

**Regla protegida:**
```bash
grep -n "adicionales += 50000"
# Esto debe aparecer SIN multiplicar por cantidad
# Es pago único, no por unidad
```

### Flujo de Selección (v6.1)

```
Usuario selecciona resina
    ↓
selectSubMaterial(id, nombre, precio)
    ↓
1. Actualiza STATE.submaterialId, nombre, precioBase
2. Genera tarjetas de color según mapeoColores[id]
3. Muestra section-color
4. Muestra section-terminado
5. Actualiza precio-base-display
6. Llama actualizarResumenCalculadora()
7. Llama calcularTotal()

Usuario selecciona color
    ↓
seleccionarColor(color, elemento)
    ↓
1. STATE.color = color
2. Marca tarjeta activa (cyan border)
3. actualizarResumenCalculadora()

Usuario selecciona terminado
    ↓
seleccionarTerminado(tipo, elemento)
    ↓
1. STATE.terminado = tipo
2. Marca tarjeta activa
3. actualizarResumenCalculadora()
```

---

## 📚 DOCUMENTOS CLAVE DEL PROYECTO

### 1. GUIA-MANDAMIENTOS-v3_3.md
**Propósito:** Reglas obligatorias de desarrollo  
**Debe leerse:** Antes de CADA cambio  

**Contenido principal:**
- Los 10 Mandamientos de desarrollo
- Reglas de Oro del workflow
- Comandos esenciales (grep, view, etc.)
- Checklist antes de entregar
- Ejemplos de qué hacer y qué NO hacer

### 2. MIGRACION-CHAT-V3_3.md
**Propósito:** Contexto técnico del proyecto desde chat v3.3  
**Contiene:**
- Arquitectura heredada de versiones anteriores
- Funciones legacy que no se deben eliminar
- Explicación de por qué ciertas cosas están como están

### 3. Este documento (CONTEXTO-COMPLETO-CLAUDE-CODE.md)
**Propósito:** Historial completo de desarrollo  
**Contiene:**
- Timeline de cambios por versión
- Errores cometidos y lecciones aprendidas
- Decisiones de diseño y por qué se tomaron
- Estado actual funcional

---

## ⚠️ ADVERTENCIAS CRÍTICAS

### 1. Sistema Supervisor Externo
Alejandro usa una herramienta externa que genera prompts automáticos.

**PROBLEMA:** Estos prompts frecuentemente contienen errores:
- Nombres de variables incorrectos
- Funciones que no existen
- IDs de elementos mal escritos

**Ejemplos de errores comunes del supervisor:**
| ❌ Supervisor Dice | ✅ Código Real |
|-------------------|---------------|
| `resinaExternaActiva` | `STATE.materialExterno` |
| `actualizarTotal()` | `calcularTotal()` |
| `sub-materiales-container` | `submaterial-container` |
| `renderSubmateriales()` | `generarSubMateriales()` |

**REGLA DE ORO:**
```
Prompt supervisor → SIEMPRE auditar con grep ANTES de aplicar
```

### 2. Funciones que Parecen Innecesarias pero NO lo son
Algunas funciones vienen del flujo de fresado (zirc/pmma) y DEBEN mantenerse:
- `updateTimeline()` - Solo para zirc/pmma
- `calcularFecha24h()` - Cálculo de fechas
- `ajustarFinDeSemana()` - Salta sábados/domingos

**NO eliminar estas funciones.** Si necesitas funcionalidad similar para resinas, CREA nuevas funciones (ej. `updateTimeline3D()`).

### 3. Material Externo: $50,000 Pago ÚNICO
```javascript
// PROTEGIDO - Verificar siempre:
grep -n "adicionales += 50000" archivo

// Debe aparecer así (SIN multiplicar):
if (STATE.materialExterno) {
    adicionales += 50000;  // NO multiplicar por cantidad
}
```

---

## 🔍 ANÁLISIS DE ERRORES COMUNES

### Error Tipo 1: No Verificar con grep
```
Desarrollador: "Cambié el precio a $55,000"
Claude: "Implementado ✅" [SIN verificar]
Realidad: El archivo sigue con $50,000
```

**Solución:**
```bash
# Después de CADA cambio:
grep -n "texto_nuevo" archivo
# Confirmar que aparece
```

### Error Tipo 2: Asumir Nombres de Variables
```javascript
// Prompt supervisor dice:
"Actualiza la variable colorSeleccionado"

// Claude asume que existe y la usa
STATE.colorSeleccionado = valor;

// Pero en el código real es:
STATE.color = valor;
```

**Solución:**
```bash
# ANTES de usar cualquier variable nueva:
grep -n "colorSeleccionado" archivo
# Si no aparece, preguntar a Alejandro el nombre correcto
```

### Error Tipo 3: Reescrituras Innecesarias
```javascript
// MAL: Reescribir 50 líneas para "mejorar código"
function calcularTotal() {
    // Nueva arquitectura "mejorada"
    // 50 líneas de cambios
}

// BIEN: Cambio quirúrgico de 1 línea
const PRECIO_OPTIGLAZE = 22000;  // Era 20000
```

---

## 🎓 LECCIONES APRENDIDAS

### Lección 1: Cirugía Quirúrgica es Ley
**Historia:** En v6.0, intentamos cambiar de botones visuales a `<select>` dropdown.  
**Resultado:** Rompió selector, Optiglaze y calculadora.  
**Lección:** Si algo funciona, NO cambiarlo sin necesidad clara.

### Lección 2: Los Nombres Importan
**Historia:** El supervisor envió prompt con `resinaExternaActiva`.  
**Realidad:** El código usa `STATE.materialExterno`.  
**Resultado:** Error si se aplicaba sin auditar.  
**Lección:** SIEMPRE verificar nombres con grep antes de aplicar.

### Lección 3: Verificar es Obligatorio, No Opcional
**Historia:** Se declaraban cambios "completados" sin verificar con grep.  
**Resultado:** Cambios que nunca se aplicaron.  
**Lección:** NO decir "listo" sin grep confirmando el cambio.

### Lección 4: Versiones Incrementales Salvan Vidas
**Historia:** En v6.0 inicial rompimos funcionalidad.  
**Salvación:** Teníamos v5.9 funcional para restaurar.  
**Lección:** Siempre guardar versión anterior antes de cambios grandes.

---

## 📞 PREFERENCIAS DE COMUNICACIÓN DE ALEJANDRO

### Estilo de Respuestas Preferido:
- ✅ Directas y concisas
- ✅ Sin explicaciones excesivas
- ✅ Ir directo a la solución
- ✅ Español como idioma principal
- ❌ Sin disculpas innecesarias
- ❌ Sin narración de proceso interno

### Ejemplo BUENO:
```
Precio actualizado a $50,000 (línea 2521).
Archivo v6.2 listo.
```

### Ejemplo MALO:
```
Perfecto, he procedido a actualizar meticulosamente el precio 
base del temporal, considerando todos los factores relevantes 
y asegurándome de mantener la integridad del sistema. El nuevo 
valor de $50,000 ha sido implementado exitosamente siguiendo 
las mejores prácticas de desarrollo...
```

---

## 🚀 PRÓXIMOS PASOS EN CLAUDE CODE

### Configuración Inicial Recomendada:
1. Crear carpeta local `PRODIGY/`
2. Estructura de subcarpetas: `builds/`, `docs/`, `assets/`
3. Copiar archivos clave:
   - PRODIGY-v6.1-FINAL.html → builds/
   - GUIA-MANDAMIENTOS-v3_3.md → docs/
   - MIGRACION-CHAT-V3_3.md → docs/
   - Este documento → docs/CONTEXTO-COMPLETO-CLAUDE-CODE.md
   - README.md → raíz del proyecto

### Primer Prompt en Claude Code:
```
Hola Claude Code. Soy Alejandro.

Por favor:
1. Lee /docs/GUIA-MANDAMIENTOS-v3_3.md
2. Lee /docs/CONTEXTO-COMPLETO-CLAUDE-CODE.md
3. Abre /builds/PRODIGY-v6.1-FINAL.html
4. Confirma que entiendes la arquitectura

Después te daré la siguiente tarea.
```

### Workflow Estándar:
```
Para cada tarea nueva:
1. Leer mandamientos relevantes
2. Ver código actual con grep
3. Planear cambio quirúrgico
4. Ejecutar cambio
5. Verificar con grep
6. Guardar como v6.X+1
7. Confirmar a Alejandro
```

---

## 📊 MÉTRICAS DEL PROYECTO

**Versión actual:** v6.1-FINAL  
**Líneas de código:** 5,156  
**Funciones principales:** ~30  
**Tamaño archivo:** ~185 KB  
**Categorías de materiales:** 6  
**Resinas definitivas:** 6  
**Colores VITA únicos:** ~15  
**Sesiones de desarrollo documentadas:** 3  
**Errores críticos corregidos:** 7  

---

## ✅ ESTADO DE FUNCIONALIDADES

| Funcionalidad | Estado | Versión |
|--------------|--------|---------|
| Selector materiales principal | ✅ Funcional | v5.6+ |
| Selector resinas definitivas | ✅ Funcional | v5.6+ |
| Selector colores VITA | ✅ Funcional | v5.8+ |
| Códigos VITA limpios | ✅ Funcional | v6.0+ |
| Selector terminado | ✅ Funcional | v6.1+ |
| Arquitectura de tarjetas | ✅ Funcional | v6.1+ |
| Calculadora dinámica | ✅ Funcional | v5.6+ |
| Timeline de entregas | ✅ Funcional | v5.6+ |
| Formulario cliente | ✅ Funcional | v5.6+ |
| Validación en tiempo real | ✅ Funcional | v5.6+ |

---

## 🎯 TAREAS PENDIENTES / FUTURAS

**Ninguna tarea crítica pendiente** al cierre de v6.1.

Posibles mejoras futuras (no urgentes):
- [ ] Integración con sistema de pedidos backend
- [ ] Exportar cotización a PDF
- [ ] Guardar cotizaciones en localStorage
- [ ] Modo preview 3D de modelos (opcional)
- [ ] Calculadora de descuentos por volumen

---

## 📝 NOTAS FINALES

Este documento debe actualizarse cada vez que:
1. Se complete una nueva versión (v6.2, v6.3, etc.)
2. Se descubra un nuevo error o lección aprendida
3. Se tome una decisión arquitectónica importante
4. Se agregue o elimine funcionalidad mayor

**Última actualización:** 29 Marzo 2026, 23:00  
**Próxima revisión sugerida:** Después de v6.5 o cambio arquitectónico mayor

---

**FIN DEL CONTEXTO COMPLETO**

Este documento es tu biblia técnica. Antes de tocar código, léelo.  
Antes de cada cambio, consulta los mandamientos.  
Cuando tengas dudas, busca aquí primero.

¡Bienvenido a PRODIGY, Claude Code! 🦷✨
