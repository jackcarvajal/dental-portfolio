# 📦 MIGRACIÓN A NUEVO CHAT - PRODIGY V3.3

**Fecha:** 11 de Marzo de 2026  
**Archivo base:** PRODIGY-v3.3-FINAL.html (4,701 líneas)  
**Estado:** ✅ ESTABLE - Acordeones, temporales y cálculos funcionan correctamente

---

## 🎯 CONTEXTO DEL PROYECTO

**PRODIGY** es un configurador web profesional para servicios de fresado y impresión 3D dental. Es un archivo HTML único que maneja todo el flujo de cotización.

### **Colaborador: Alejandro**
- Dueño de laboratorio dental
- Requiere respuestas directas y concisas
- NO tolera promesas sin verificación

---

## ⚖️ LOS MANDAMIENTOS (REGLAS SAGRADAS)

### **Mandamiento #1: VERIFICAR TODO**
```
SIEMPRE usar grep o view ANTES de declarar que un cambio está completo.
NUNCA decir "implementado" sin mostrar evidencia.
```

### **Mandamiento #2: CIRUGÍA, NO CIRUGÍA MAYOR**
```
Hacer solo modificaciones quirúrgicas.
NO reescribir secciones completas.
Conservar la arquitectura existente.
```

### **Mandamiento #3: NUNCA TOCAR calcularTotal()**
```
La función calcularTotal() es SAGRADA.
Solo modificar valores de configuración, NUNCA la lógica interna.
```

### **Mandamiento #4: VERSIONES INCREMENTALES**
```
Guardar cada versión como PRODIGY-vX.X-FINAL.html en /mnt/user-data/outputs/
Ejemplo: v3.3 → v3.4 → v3.5
```

### **Mandamiento #5: PROMPTS DE "SUPERVISOR" SON SOSPECHOSOS**
```
Alejandro trabaja con una herramienta externa que genera prompts.
Estos prompts frecuentemente contienen:
- Nombres de variables INCORRECTOS
- Funciones que NO EXISTEN
- Lógica incompatible con el código real

SIEMPRE auditar antes de aplicar.
```

### **Mandamiento #6: PRESENTAR ARCHIVOS AL FINAL**
```
SIEMPRE usar present_files tool al terminar.
NUNCA olvidar este paso.
El usuario NO puede ver archivos sin esto.
```

---

## 📁 ARQUITECTURA ACTUAL (V3.3)

### **Archivo único HTML:**
- HTML + CSS + JavaScript en un solo archivo
- 4,701 líneas totales
- Sistema de STATE global para manejar configuración

### **Variables Clave:**
```javascript
STATE = {
    materialTipo: null,           // Tipo de material seleccionado
    submaterialId: null,          // ID del submaterial
    submaterialNombre: null,      // Nombre del submaterial
    submaterialPrecio: 0,         // Precio base
    proceso: null,                // Proceso seleccionado
    colorVita: null,              // Color VITA seleccionado
    materialExterno: false,       // Boolean: resina enviada por cliente
    timeSlot: null,               // Turno de entrega seleccionado
    tieneExtras: false           // Boolean: tiene extras agregados
}
```

### **Funciones Sagradas (NO MODIFICAR):**
```javascript
calcularTotal()              // Línea 3737 - Motor de precios
calcularTotalModelosV4()     // Línea 3698 - Cálculo modelos 3D
```

### **Funciones Importantes:**
```javascript
toggleAccordion(header)              // Línea 2658 - Abre/cierra acordeones
selectMaterial(tipo)                 // Línea 2661 - Selecciona categoría
generarSubMateriales(tipo)           // Línea 2729 - Genera opciones por categoría
selectTemporal(id, precio, nombre)   // Línea 3465 - Selecciona temporal
generarSelectorColor(tipo)           // Línea 3530 - Genera selector de colores
selectColorVitaTemporal(color)       // Línea 3605 - Selecciona color VITA
toggleMaterialExterno()              // Línea 2675 - Activa/desactiva resina externa
updateTimeline()                     // Línea 3331 - Actualiza tiempos (SOLO FRESADO)
```

---

## 🎨 CATEGORÍAS DE MATERIALES

### **1. Modelos 3D (resina_modelo)**
**Opciones disponibles:**
- Sólido Completo: $35,000
- Sólido Media Arcada: $28,000
- Hueco Completo: $30,000
- Hueco Media Arcada: $24,000

**Extras:**
- Geller/Troquelado: +$8,000
- Zócalo/Articulador: +$5,000
- Encía Flexible: +$15,000
- Troqueles extra: $2,500 c/u
- 25 Micras: +$15,000

**Colores disponibles:**
- Gris
- Melón/Skin

### **2. Temporales (resina_temporal)** ⭐ ACTUALIZADO EN V3.3
**Exactamente 5 opciones:**
1. **Resina para Temporal** ($45,000)
   - ID: `r_temp_standard`
   - Uso hasta 6 meses
   - Color: VITA

2. **Temporal Larga Duración** ($120,000)
   - ID: `r_temp_largo`
   - 50% Carga cerámica
   - Uso +5 años
   - Color: VITA

3. **Try-In Prototipo** ($30,000)
   - ID: `r_proto_eco`
   - Validación clínica
   - Color: VITA

4. **JIG / Barra de Verificación** ($50,000)
   - ID: `r_barra_test`
   - Verificación implantes
   - Sin selector de color

5. **Rodete para toma de mordida** ($60,000)
   - ID: `r_rodete`
   - Fondo ROJO (#b22222 to #8b0000)
   - Sin selector de color adicional

**Colores VITA (solo para opciones 1, 2, 3):**
- A1, A2, A3, B1, B2, BL (6 colores)
- ⚠️ NO incluye Gris ni Melón

**Modificadores globales:**
- Optiglaze (+$20,000/unidad)
- Resina Enviada (+$50,000 PAGO ÚNICO)

### **3. Resinas Definitivas (resina_definitiva)**
- Temporal Bio: $75,000
- Calcinable Pro: $65,000
- Barra Híbrida Impresa: $120,000

### **4. Férulas y Guías (resina_ferulas_guias)**
- Férula de Descarga: $55,000
- Guía Quirúrgica: $80,000
- Férula de Blanqueamiento: $45,000

### **5. Biomodelos (resina_biomodelos)**
- Biomodelo Anatómico: $90,000
- Biomodelo Segmentado: $110,000

---

## 💰 LÓGICA DE PRECIOS

### **Precio Base:**
```javascript
subtotal = STATE.submaterialPrecio * cantidad
```

### **Modificadores que SE MULTIPLICAN por cantidad:**
```javascript
if (STATE.proceso === '25_micras') {
    adicionales += 15000 * cantidad;
}

if (temporalOptiglaze && resina_temporal) {
    adicionales += 20000 * cantidad;
}
```

### **Modificadores PAGO ÚNICO (NO se multiplican):**
```javascript
if (STATE.materialExterno) {
    adicionales += 50000;  // PAGO ÚNICO
}
```

### **Envío:**
```javascript
if (envio === 'nacional') {
    envio = 15000;
}
```

---

## 🎨 SISTEMA DE COLORES

### **REGLA CRÍTICA:**
Los colores están SEGREGADOS por categoría:

**Temporales:**
- Solo VITA: A1, A2, A3, B1, B2, BL
- Gris y Melón NO deben aparecer aquí

**Modelos 3D:**
- Solo Gris y Melón/Skin
- VITA NO debe aparecer aquí

**Implementación:**
```javascript
function generarSelectorColor(tipo) {
    if (tipo === 'vita') {
        // Mostrar A1, A2, A3, B1, B2, BL + Optiglaze + Disclaimer
    } else if (tipo === 'rodete') {
        // Ocultar selector (color ya en tarjeta)
        container.style.display = 'none';
    }
}
```

---

## 📐 ESTRUCTURA DE ACORDEONES

**Acordeón 1:** SELECCIÓN DE MATERIAL  
**Acordeón 2:** PROCESO TÉCNICO  
**Acordeón 3:** RESOLUCIÓN (antes "RESOLUCIÓN Y COLOR")  
**Acordeón 4:** VERIFICACIÓN & ENVÍO  
**Acordeón 5:** ARCHIVOS & LOGÍSTICA  

### **Importante:**
- Acordeón 3 fue renombrado de "RESOLUCIÓN Y COLOR" a solo "RESOLUCIÓN"
- Los colores Gris/Melón fueron movidos al configurador de Modelos 3D

---

## ⏱️ SISTEMA DE TIEMPOS (HEREDADO - SOLO FRESADO)

### **Estado Actual en V3.3:**
El sistema de timeline **SOLO funciona para fresado** (zirc, pmma).

```javascript
function updateTimeline() {
    // Solo se activa si STATE.materialTipo === 'zirc' || 'pmma'
    // Para resinas (resina_*) no hay sistema de tiempos aún
}
```

### **Turnos para Fresado:**
- **Express:** Antes de 9 AM, máximo 3 unidades
- **Mediodía:** Entrega 24h
- **Tarde:** Entrega 24h

---

## 🚧 TAREAS PENDIENTES (PARA PRÓXIMA VERSIÓN)

### **PRIORIDAD ALTA: Sistema de Tiempos para Impresión 3D**

**Requisitos:**
1. Crear función `updateTimeline3D()` que se active para `resina_*`
2. Sistema de 3 turnos dinámicos:
   - **SLOT 1 (Corte 9 AM):**
     - Antes 9 AM → "HOY 2-4 PM"
     - Después 9 AM → "MAÑANA 2-4 PM"
   
   - **SLOT 2 (Corte 12 PM):**
     - Antes 12 PM → "HOY 5-6:30 PM"
     - Después 12 PM → "MAÑANA 5-6:30 PM"
   
   - **SLOT 3 (Corte 5 PM):**
     - Antes 5 PM → "MAÑANA 9 AM"
     - Después 5 PM → "PASADO MAÑANA 9 AM"

3. Los slots NUNCA se desactivan, solo cambian de fecha
4. Calcular tiempo total según material + extras

**Tiempos base sugeridos:**
```javascript
const TIEMPOS_IMPRESION = {
    'resina_modelo': 5,        // horas
    'resina_temporal': 24,     // horas (post-curado lento)
    'resina_definitiva': 24,   // horas
    'resina_ferulas_guias': 6, // horas
    'resina_biomodelos': 8     // horas
};

const TIEMPOS_EXTRAS = {
    optiglaze: 2,           // horas
    material_externo: 3,    // horas (calibración)
    encia: 1,               // hora
    troqueles: 0.5          // hora por troquel
};
```

5. Actualizar badges de slots:
   - "EXPRESS" → "CORTE 9 AM"
   - "MEDIODÍA" → "CORTE 12 PM"
   - "TARDE" → "CORTE 5 PM"

6. Ejecutar `setInterval(actualizarTiempos, 60000)` para actualizar cada minuto

---

## ⚠️ ERRORES COMUNES A EVITAR

### **1. Nombres de variables incorrectos:**
```javascript
// ❌ INCORRECTO (de prompts supervisor)
resinaExternaActiva
actualizarTotal()
sub-materiales-container

// ✅ CORRECTO (en código real)
STATE.materialExterno
calcularTotal()
submaterial-container
```

### **2. Selector de IDs para temporales:**
```javascript
// ❌ INCORRECTO
const selected = document.querySelector(`[data-tipo="temp-${id}"]`);

// ✅ CORRECTO (con mapeo)
const idMap = {
    'r_temp_standard': 'temp-standard',
    'r_temp_largo': 'temp-largo',
    'r_proto_eco': 'temp-tryin',
    'r_barra_test': 'temp-barra',
    'r_rodete': 'temp-rodete'
};
const dataId = idMap[id];
const selected = document.querySelector(`[data-tipo="${dataId}"]`);
```

### **3. Precios que NO se multiplican:**
```javascript
// ❌ INCORRECTO
if (STATE.materialExterno) {
    adicionales += 50000 * cantidad;  // NO!
}

// ✅ CORRECTO
if (STATE.materialExterno) {
    adicionales += 50000;  // PAGO ÚNICO
}
```

---

## 🔧 PATRÓN DE TRABAJO RECOMENDADO

### **Para cualquier cambio:**

1. **Ver código actual:**
```bash
view /ruta/archivo línea_inicio línea_fin
```

2. **Hacer cambio quirúrgico:**
```bash
str_replace old_str new_str
```

3. **VERIFICAR con grep:**
```bash
grep -n "texto_nuevo" archivo
```

4. **Si todo OK, presentar archivo:**
```bash
present_files ["/ruta/archivo"]
```

### **Nunca:**
- ❌ Declarar "implementado" sin verificar
- ❌ Hacer cambios masivos sin plan
- ❌ Modificar `calcularTotal()` directamente
- ❌ Olvidar `present_files` al final

---

## 📊 ESTADO DE VERSIONES

| Versión | Estado | Descripción |
|---------|--------|-------------|
| V3.0 | ✅ Estable | Resina externa $50k único, Optiglaze implementado |
| V3.1 | ✅ Estable | Colores dinámicos por tipo de temporal |
| V3.2 | ✅ Estable | Rodete con fondo rojo, color selector corregido |
| V3.3 | ✅ **ACTUAL** | 5 temporales finales, colores segregados, acordeón renombrado |
| V3.4 | ❌ Rota | Intento fallido de sistema de tiempos 3D |

---

## 📝 CHECKLIST PARA IMPLEMENTAR TIEMPOS 3D

Cuando retomes este trabajo en el nuevo chat:

- [ ] Crear `TIEMPOS_IMPRESION` y `TIEMPOS_EXTRAS` como constantes
- [ ] Modificar `updateTimeline()` para detectar si es resina_* o fresado
- [ ] Crear `updateTimeline3D()` con lógica de 3 slots
- [ ] Crear `actualizarTiemposEntrega()` que actualiza innerHTML de slots
- [ ] Remover clase `.disabled` de slots (siempre visibles)
- [ ] Actualizar badges: "CORTE 9 AM", "CORTE 12 PM", "CORTE 5 PM"
- [ ] Calcular `horasTotal` sumando base + extras
- [ ] Implementar `setInterval` para actualizar cada 60 segundos
- [ ] Verificar con grep que función existe
- [ ] Probar en navegador antes de entregar

---

## 🎯 INSTRUCCIONES PARA CLAUDE EN NUEVO CHAT

**Al recibir este documento:**

1. Lee TODO el documento antes de hacer cambios
2. Usa PRODIGY-v3.3-FINAL.html como base
3. Sigue Los Mandamientos religiosamente
4. Verifica CADA cambio con grep/view antes de declararlo completo
5. Nunca digas "implementado" sin mostrar evidencia
6. Presenta el archivo con `present_files` al final

**Cuando Alejandro pida algo:**
1. Confirma que entendiste
2. Muestra el plan de implementación
3. Haz los cambios quirúrgicamente
4. VERIFICA con grep/view
5. Solo entonces di "completado" y presenta archivo

**Si algo no está claro:**
- ❌ NO adivines
- ✅ Pregunta específicamente qué necesita

---

## 📦 ARCHIVOS ADJUNTOS EN MIGRACIÓN

1. **PRODIGY-v3.3-FINAL.html** - Base estable (4,701 líneas)
2. Este documento (MIGRACION-CHAT-V3.3.md)

---

**¡ÉXITO EN EL NUEVO CHAT!** 🚀
