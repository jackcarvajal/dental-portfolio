# 📝 CHANGELOG - PRODIGY

Registro detallado de cambios por versión del configurador PRODIGY.

---

## [v6.1-FINAL] - 2026-03-29 ✅ ACTUAL

### 🎯 Objetivo de la Versión
Arquitectura de tarjetas para Color y Terminado, tiempos clínicos actualizados.

### ✨ Nuevas Funcionalidades
- **Selector de Color con Tarjetas:** Sistema de tarjetas cuadradas en lugar de botones con gradientes
- **Selector de Terminado:** Tarjetas para "Solo Glaseado" y "Maquillaje + Glaseado"
- **Función `seleccionarColor()`:** Maneja selección de color VITA
- **Función `seleccionarTerminado()`:** Maneja selección de tipo de terminado
- **Función `actualizarResumenCalculadora()`:** Sincroniza todas las displays de la calculadora

### 🔧 Cambios Técnicos
- **HTML:**
  - Eliminado: `<div id="container-color-vita">`
  - Eliminado: `<div id="grid-colores-vita">`
  - Creado: `<div id="section-color">` con `<div id="grid-colores">`
  - Creado: `<div id="section-terminado">`

- **JavaScript:**
  - Refactorizada `selectSubMaterial()` para generar tarjetas simples
  - Agregadas funciones `seleccionarColor()` y `seleccionarTerminado()`
  - Agregada función `actualizarResumenCalculadora()`

- **STATE:**
  - Agregado: `STATE.terminado`
  - Mantenido: `STATE.color` (sin cambios)

### 📊 Datos Actualizados
**Tiempos clínicos en SUB_MATERIALES:**
- Rodin Sculpture: `Vida: 24 a 36 meses / All-on-X`
- BEGO Varseo Plus: `Vida: 24 a 36 meses / Carillas y Coronas`
- Saremco CROWNTEC: `Vida: 24 a 36 meses / Inlays y Coronas`
- SprintRay OnPoint: `Vida: 12 a 24 meses / Coronas`
- Graphy TC-80: `Vida: 12 a 24 meses / Híbridas`

### 🐛 Bugs Corregidos
- Selector de color ahora genera tarjetas correctamente
- Terminado ahora se guarda en STATE y actualiza resumen

### 📈 Estadísticas
- **Líneas de código:** 5,156 (-8 vs v6.0)
- **Funciones nuevas:** 3
- **Elementos HTML nuevos:** 2 secciones

### 📝 Notas de Migración
- Si actualizas desde v6.0, todas las funcionalidades se mantienen
- La calculadora es compatible con versiones anteriores
- No se requieren cambios en datos del cliente

---

## [v6.0-FINAL] - 2026-03-29

### 🎯 Objetivo de la Versión
Limpiar códigos de color VITA eliminando descripciones en paréntesis.

### 🔧 Cambios Técnicos
**mapeoColores actualizado:**
```javascript
// ANTES (v5.9):
'def_rodin': ['A1', 'A2', 'A3', 'B1', 'C2', '0M1 (Bleach)', '0M3 (Bleach)']

// DESPUÉS (v6.0):
'def_rodin': ['A1', 'A2', 'A3', 'B1', 'C2', '0M1', '0M3']
```

**Todos los códigos limpiados:**
- `0M1 (Bleach)` → `0M1`
- `0M3 (Bleach)` → `0M3`
- `BL (Bleach)` → `BL`
- `SW (Snow White)` → `SW`

### ⚠️ Incidente durante desarrollo
**INTENTO FALLIDO INICIAL:**
- Se intentó cambiar de botones visuales a `<select>` dropdown
- Esto rompió el selector de colores, Optiglaze y calculadora
- **SOLUCIÓN:** Restaurar desde v5.9 funcional y solo actualizar códigos

### 📈 Estadísticas
- **Líneas de código:** 5,163 (-1 vs v5.9)
- **Gradientes CSS:** Agregados para nuevos tonos (C2, D3, A3.5, 0M1, 0M3, SW)

### 📝 Lección Aprendida
No cambiar arquitectura funcional cuando solo se necesita actualizar datos.

---

## [v5.9-FINAL] - 2026-03-28

### 🎯 Objetivo de la Versión
Corrección de bugs en selector de colores y calculadora.

### 🐛 Bugs Corregidos
- **Función `selectSubMaterial`:** Firma correcta con 3 parámetros `(id, nombre, precio)`
- **STATE.precioBase:** Ahora se asigna correctamente con `parseFloat(precio)`
- **precio-base-display:** Actualizado en tiempo real
- **Selección visual:** Ahora usa `data-id` correctamente
- **Guía clínica:** Actualizada con especificaciones oficiales

### 🔧 Cambios Técnicos
**Función selectSubMaterial corregida:**
```javascript
function selectSubMaterial(id, nombre, precio) {
    STATE.submaterialId = id;
    STATE.submaterialNombre = nombre;
    STATE.submaterialPrecio = precio;
    STATE.precioBase = parseFloat(precio);  // CRÍTICO
    // ... resto del código
}
```

### 📊 Datos Actualizados
**mapeoColores con códigos reales de fabricantes:**
- Rodin: A1, A2, A3, B1, C2, 0M1 (Bleach), 0M3 (Bleach)
- BEGO: A1, A2, A3, B1, B3, C2, D3, BL (Bleach)
- Saremco: A1, A2, A3, A3.5, B1, SW (Snow White)
- SprintRay: A1, A2, A3, B1, B3, C2, D3, Bleach
- Graphy: A1, A2, A3

### 📈 Estadísticas
- **Líneas de código:** 5,164
- **Funciones corregidas:** 1 (selectSubMaterial)

---

## [v5.8-FINAL] - 2026-03-27

### 🎯 Objetivo de la Versión
Reemplazar dropdown de colores por botones visuales con gradientes.

### ✨ Nuevas Funcionalidades
- **Botones visuales de colores:** Grid de 3 columnas con gradientes CSS
- **Función `selectColorVita(color)`:** Maneja selección de color
- **Hover effects:** Bordes cyan y transform scale al pasar mouse
- **Selección visual:** Border gold y background cyan en color seleccionado

### 🔧 Cambios Técnicos
**HTML:**
- Agregado: `<div id="grid-colores-vita">`
- Eliminado: `<select id="select-color-vita">`

**JavaScript:**
- Agregado objeto `coloresVita` con gradientes por tono:
```javascript
const coloresVita = {
    'A1': { bg: 'linear-gradient(135deg, #f0e8dd 0%, #e8dcc8 100%)', desc: 'Muy Claro', txt: '#3a2a1a' },
    'A2': { bg: 'linear-gradient(135deg, #ead4b8 0%, #ddc5a5 100%)', desc: 'Claro', txt: '#3a2a1a' },
    // ... más colores
}
```

### 📈 Estadísticas
- **Líneas de código:** 5,110 (+100 vs v5.7)
- **Gradientes CSS únicos:** 15

---

## [v5.7-FINAL] - 2026-03-26

### 🎯 Objetivo de la Versión
Implementar selector de colores VITA básico con dropdown.

### ✨ Nuevas Funcionalidades
- **Selector de colores VITA:** Dropdown `<select>` para selección de color
- **container-color-vita:** Contenedor para selector de colores
- **Nota de inventario:** Advertencia sobre stock de resinas de especialidad
- **Contraindicaciones:** Advertencias clínicas para uso correcto

### 🔧 Cambios Técnicos
**HTML:**
- Agregado: `<div id="container-color-vita">`
- Agregado: `<select id="select-color-vita">`

**JavaScript:**
- Agregado: `mapeoColores` dentro de `selectSubMaterial()`
- Lógica de mostrar/ocultar selector según resina

### 📊 Datos Agregados
```javascript
const mapeoColores = {
    'def_rodin': ['A1', 'A2', 'A3', 'B1', 'BL1', 'BL2'],
    'def_bego': ['A1', 'A2', 'A3', 'B1', 'B3', 'BL3'],
    // ... más resinas
};
```

### 📈 Estadísticas
- **Líneas de código:** 5,010 (+50 vs v5.6)

---

## [v5.6-FINAL] - 2026-03-22

### 🎯 Versión Base
Esta es la versión base desde donde comenzó el desarrollo documentado.

### ✨ Funcionalidades Existentes
- Selector de materiales (6 categorías)
- Selector de resinas definitivas (6 opciones)
- Calculadora dinámica
- Timeline de entregas
- Formulario de cliente
- Sistema de validación

### 📊 Base de Datos
**SUB_MATERIALES definido:**
```javascript
'resina_definitiva': [
    { id: 'def_rodin', nom: 'Rodin Sculpture', precio: 50000 },
    { id: 'def_bego', nom: 'BEGO Varseo Plus', precio: 45000 },
    { id: 'def_saremco', nom: 'Saremco CROWNTEC', precio: 42000 },
    { id: 'def_sprintray', nom: 'SprintRay OnPoint', precio: 48000 },
    { id: 'def_graphy', nom: 'Graphy TC-80', precio: 45000 },
    { id: 'def_estandar', nom: 'Definitiva Estándar', precio: 35000 }
]
```

### 📈 Estadísticas
- **Líneas de código:** 5,057
- **Tamaño archivo:** 353 KB

---

## Versiones Anteriores (Pre-v5.6)

### [v3.3] - Contexto en MIGRACION-CHAT-V3_3.md
- Flujo de fresado (zirc/pmma) implementado
- Timeline automático
- Funciones de cálculo de fechas
- Sistema de acordeones

### [v2.1] - Mapeo de iconos
- Sistema de iconos neon por categoría
- Colores distintivos por tipo de resina

### [v1.0] - Versión inicial
- Configurador básico
- Calculadora simple
- Sin selector de colores

---

## 📊 Estadísticas Generales del Proyecto

| Versión | Líneas | Funciones | Cambio Principal |
|---------|--------|-----------|------------------|
| v6.1 | 5,156 | ~35 | Tarjetas Color/Terminado |
| v6.0 | 5,163 | ~33 | Códigos VITA limpios |
| v5.9 | 5,164 | ~33 | Bug fixes calculadora |
| v5.8 | 5,110 | ~32 | Botones visuales colores |
| v5.7 | 5,010 | ~31 | Selector colores básico |
| v5.6 | 5,057 | ~30 | Versión base documentada |

---

## 🎯 Próximas Versiones Planeadas

### v6.2 (Pendiente)
- TBD por Alejandro

### v7.0 (Futuro)
- Posible integración con backend
- Exportar cotizaciones a PDF
- Sistema de descuentos por volumen

---

**Última actualización:** 29 Marzo 2026  
**Mantenido por:** Alejandro + Claude  
**Formato:** Markdown (Keep a Changelog style)
