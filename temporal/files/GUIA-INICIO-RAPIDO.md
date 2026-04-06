# 🚀 GUÍA DE INICIO RÁPIDO - Claude Code

**Para:** Claude Code (tu nuevo asistente)  
**De:** Alejandro (desarrollador de PRODIGY)  
**Idioma:** Español

---

## 👋 Bienvenido a PRODIGY

Hola Claude Code. Soy Alejandro y este es PRODIGY, un configurador web para laboratorio dental.

Este documento te dará todo lo que necesitas para empezar a trabajar en el proyecto de inmediato.

---

## 📚 DOCUMENTOS QUE DEBES LEER PRIMERO

### 1️⃣ **OBLIGATORIO** - Lee ANTES de hacer cualquier cosa:
```
/docs/GUIA-MANDAMIENTOS-v3_3.md
```
Son las reglas sagradas. Sin excepciones. Léelas completas.

### 2️⃣ **Contexto Completo** - Lee para entender la historia:
```
/docs/CONTEXTO-COMPLETO-CLAUDE-CODE.md
```
Todo el historial de desarrollo, errores y lecciones aprendidas.

### 3️⃣ **Referencia Técnica** - Consulta cuando necesites detalles:
```
/docs/MIGRACION-CHAT-V3_3.md
```
Arquitectura técnica heredada de versiones anteriores.

---

## 🎯 ¿QUÉ ES PRODIGY?

**Descripción corta:**
Configurador web HTML puro para cotizar trabajos de impresión 3D dental.

**Tecnología:**
- HTML5 + CSS3 + Vanilla JavaScript
- Sin frameworks (React, Vue, etc.)
- Todo en un solo archivo (portabilidad)
- Tema cyberpunk/dark

**Versión actual:**
v6.1-FINAL (5,156 líneas)

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
PRODIGY/
├── README.md                              # Documentación principal
├── builds/
│   ├── PRODIGY-v6.1-FINAL.html           # ✅ ARCHIVO PRINCIPAL
│   └── versiones-anteriores/             # Backups
├── docs/
│   ├── GUIA-MANDAMIENTOS-v3_3.md         # 📜 REGLAS (lee primero)
│   ├── CONTEXTO-COMPLETO-CLAUDE-CODE.md  # Historia completa
│   ├── MIGRACION-CHAT-V3_3.md            # Contexto técnico
│   ├── CHANGELOG.md                       # Registro de cambios
│   └── GUIA-INICIO-RAPIDO.md             # Este archivo
└── assets/
    └── capturas/                          # Screenshots del UI
```

---

## ⚡ TU PRIMER PROMPT (COPIA Y PEGA)

```
Hola Claude Code. Soy Alejandro.

PASO 1: Lee estos documentos en orden:
1. /docs/GUIA-MANDAMIENTOS-v3_3.md (OBLIGATORIO)
2. /docs/CONTEXTO-COMPLETO-CLAUDE-CODE.md
3. README.md

PASO 2: Abre el archivo principal:
/builds/PRODIGY-v6.1-FINAL.html

PASO 3: Confirma que entiendes:
- Los 10 Mandamientos (especialmente 1, 2, 3)
- El Ciclo Sagrado (VIEW → PLAN → CHANGE → VERIFY → CONFIRM → SAVE)
- La función calcularTotal() es SAGRADA (línea ~3737)
- Siempre versionar: v6.2, v6.3, etc.

Responde: "Listo. He leído todo y entiendo el proyecto."
```

---

## 🎓 LOS 3 MANDAMIENTOS MÁS CRÍTICOS

### 1️⃣ VERIFICAR TODO
```bash
# Después de CADA cambio:
grep -n "texto_nuevo" archivo

# Si NO aparece → el cambio NO se aplicó
# NUNCA digas "listo" sin verificar con grep
```

### 2️⃣ CIRUGÍA, NO CIRUGÍA MAYOR
```javascript
// ❌ MAL - Reescribir 50 líneas
function calcularTotal() {
    // Nueva lógica "mejorada"
}

// ✅ BIEN - Cambio quirúrgico de 1 línea
const PRECIO_OPTIGLAZE = 22000;  // Era 20000
```

### 3️⃣ NUNCA TOCAR calcularTotal()
```javascript
// Ubicación: Línea ~3737
function calcularTotal() {
    // ⚠️ SAGRADA - NO MODIFICAR
    // Solo modificar si Alejandro dice explícitamente
}
```

---

## 🔄 EL WORKFLOW CORRECTO

Para **CADA** tarea que te pida Alejandro:

```
1. VIEW   → Ver código actual (grep o abrir archivo)
2. PLAN   → Explicar qué vas a cambiar
3. CHANGE → Ejecutar el cambio
4. VERIFY → grep para confirmar que se aplicó
5. CONFIRM → Decir "completado" con evidencia
6. SAVE   → Guardar como nueva versión (v6.X+1)
```

**Ejemplo práctico:**
```
Alejandro: "Cambia el precio de Rodin a $55,000"

Tú:
1. VIEW: grep -n "def_rodin.*50000" archivo
   → Encuentro línea 2584
2. PLAN: Voy a cambiar línea 2584: precio: 50000 → 55000
3. CHANGE: [ejecuto el cambio]
4. VERIFY: grep -n "def_rodin.*55000" archivo
   → Aparece en línea 2584 ✅
5. CONFIRM: "Precio actualizado a $55,000 (línea 2584)"
6. SAVE: Guardar como PRODIGY-v6.2-FINAL.html
```

---

## 🧠 ARQUITECTURA CLAVE (Memoriza esto)

### STATE Global (el cerebro del sistema)
```javascript
STATE = {
    // Material
    materialTipo: null,           // 'resina_definitiva', etc.
    submaterialId: null,          // 'def_rodin', etc.
    submaterialNombre: null,      // 'Rodin Sculpture'
    precioBase: 0,               
    
    // Selecciones
    color: null,                 // 'A1', 'B3', '0M1', etc.
    terminado: null,             // 'Solo Glaseado', etc.
    
    // Extras
    materialExterno: false,      // +$50,000 PAGO ÚNICO
    proceso: '50_micras',
}
```

### Funciones Principales (NO tocar sin permiso)

**calcularTotal() - Línea ~3737**
- Calcula precio final
- Suma extras multiplicables (Optiglaze, Resolución)
- Suma extras únicos (Material Externo)
- ⚠️ SAGRADA - NO MODIFICAR

**selectSubMaterial(id, nombre, precio) - Línea ~3125**
- Selecciona resina específica
- Genera tarjetas de color
- Muestra terminado
- Actualiza calculadora

**seleccionarColor(color, elemento) - v6.1**
- Guarda color en STATE
- Marca tarjeta activa
- Actualiza resumen

**seleccionarTerminado(tipo, elemento) - v6.1**
- Guarda terminado en STATE
- Marca tarjeta activa
- Actualiza resumen

---

## ⚠️ ADVERTENCIAS CRÍTICAS

### 1. Sistema Supervisor con Errores
Alejandro usa una herramienta externa que a veces envía prompts con errores:

**Errores comunes:**
| ❌ Supervisor Dice | ✅ Código Real |
|-------------------|---------------|
| `resinaExternaActiva` | `STATE.materialExterno` |
| `actualizarTotal()` | `calcularTotal()` |
| `renderSubmateriales()` | `generarSubMateriales()` |

**Solución:**
```bash
# SIEMPRE verificar con grep ANTES de aplicar:
grep -n "nombre_variable" archivo
```

### 2. Material Externo: $50,000 ÚNICO
```javascript
// PROTEGIDO - Verificar siempre:
grep -n "adicionales += 50000" archivo

// Debe ser pago ÚNICO (sin multiplicar):
if (STATE.materialExterno) {
    adicionales += 50000;  // NO *= cantidad
}
```

### 3. Mapeo de Colores por Fabricante
```javascript
// Cada resina tiene colores específicos:
const mapeoColores = {
    'def_rodin': ['A1', 'A2', 'A3', 'B1', 'C2', '0M1', '0M3'],
    'def_bego': ['A1', 'A2', 'A3', 'B1', 'B3', 'C2', 'D3', 'BL'],
    // ... NO inventar colores
};
```

---

## 🎯 CASOS DE USO COMUNES

### Cambiar un Precio
```bash
# 1. Buscar precio actual
grep -n "def_rodin.*50000" archivo

# 2. Anotar línea (ej. 2584)

# 3. Cambiar:
{ id: 'def_rodin', nom: 'Rodin Sculpture', precio: 50000 }
                                                    ↓
{ id: 'def_rodin', nom: 'Rodin Sculpture', precio: 55000 }

# 4. Verificar:
grep -n "def_rodin.*55000" archivo
# Debe aparecer en línea 2584

# 5. Guardar como v6.2
```

### Agregar Color a una Resina
```javascript
// Ubicación: mapeoColores (línea ~3150)

// ANTES:
'def_rodin': ['A1', 'A2', 'A3', 'B1', 'C2', '0M1', '0M3']

// DESPUÉS:
'def_rodin': ['A1', 'A2', 'A3', 'B1', 'C2', '0M1', '0M3', 'C4']

// Verificar:
grep -n "'def_rodin'.*C4" archivo
```

### Actualizar Texto de Subtítulo
```javascript
// Ubicación: SUB_MATERIALES (línea ~2584)

// ANTES:
subtitulo: 'Vida: 24 a 36 meses / All-on-X'

// DESPUÉS:
subtitulo: 'Vida: 36 a 48 meses / All-on-X'

// Verificar:
grep -n "36 a 48 meses" archivo
```

---

## 🚫 ERRORES QUE DEBES EVITAR

### ❌ Error #1: No Verificar
```
Tú: "Cambié el precio a $55,000"
Realidad: El archivo sigue con $50,000

CAUSA: No usaste grep para verificar
```

### ❌ Error #2: Reescribir Código Funcional
```javascript
// MAL: Reescribir calcularTotal() "para mejorar"
function calcularTotal() {
    // 100 líneas nuevas
}

// BIEN: Solo cambiar constantes
const PRECIO_BASE = 55000;  // Era 50000
```

### ❌ Error #3: No Versionar
```
❌ PRODIGY-FINAL.html          (sin versión)
✅ PRODIGY-v6.2-FINAL.html     (correcto)
```

### ❌ Error #4: Inventar Nombres
```javascript
// Prompt dice: "Actualiza colorSeleccionado"
// Código real: STATE.color

// SIEMPRE verificar con grep primero:
grep -n "colorSeleccionado" archivo
// Si no existe → preguntar a Alejandro
```

---

## 💬 ESTILO DE COMUNICACIÓN CON ALEJANDRO

### ✅ Respuestas que Alejandro QUIERE:
```
"Precio actualizado a $55,000 (línea 2584).
Archivo v6.2 listo."
```

### ❌ Respuestas que Alejandro NO QUIERE:
```
"Perfecto, he procedido a actualizar meticulosamente 
el precio base considerando todos los factores..."
```

**Reglas:**
- Directo al punto
- Sin disculpas innecesarias
- Sin explicaciones largas
- En español
- Evidencia (número de línea, grep result)

---

## 🛠️ COMANDOS ÚTILES PARA TI

```bash
# Buscar función
grep -n "function calcularTotal" archivo

# Buscar variable en STATE
grep -n "STATE.color" archivo

# Contar ocurrencias
grep -c "selectSubMaterial" archivo

# Ver contexto (5 líneas antes y después)
grep -A5 -B5 "mapeoColores" archivo

# Buscar sin importar mayúsculas
grep -ni "rodin" archivo

# Buscar en múltiples archivos
grep -r "calcularTotal" /builds/

# Ver líneas específicas del archivo
sed -n '2580,2590p' archivo
```

---

## ✅ CHECKLIST ANTES DE ENTREGAR

Antes de decir "listo" a Alejandro:

- [ ] Cambios verificados con grep
- [ ] Ninguna función crítica modificada sin permiso
- [ ] Archivo tiene versión correcta (v6.X)
- [ ] Sin comentarios "TODO" o "FIXME"
- [ ] Líneas coherentes (±100 vs anterior)
- [ ] Sin syntax errors obvios
- [ ] Archivo guardado en `/builds/PRODIGY-vX.X-FINAL.html`

---

## 🎯 TU SIGUIENTE PASO

Después de leer esta guía:

1. **Ejecuta tu primer prompt** (el que está arriba en "Tu Primer Prompt")
2. **Lee los mandamientos** (/docs/GUIA-MANDAMIENTOS-v3_3.md)
3. **Lee el contexto completo** (/docs/CONTEXTO-COMPLETO-CLAUDE-CODE.md)
4. **Abre el archivo principal** (/builds/PRODIGY-v6.1-FINAL.html)
5. **Confirma a Alejandro** que estás listo

---

## 📞 PREGUNTAS FRECUENTES

**P: ¿Puedo modificar calcularTotal()?**  
R: NO. A menos que Alejandro diga explícitamente "modifica calcularTotal".

**P: ¿Debo preguntar antes de hacer cambios?**  
R: Explica tu PLAN primero, espera confirmación, luego ejecuta.

**P: ¿Qué hago si el prompt del supervisor tiene errores?**  
R: Audita con grep. Si el nombre no existe, pregunta a Alejandro.

**P: ¿Cuándo creo una nueva versión?**  
R: Después de CADA tarea completada. v6.1 → v6.2 → v6.3, etc.

**P: ¿Puedo "mejorar" el código?**  
R: NO. Cirugía quirúrgica solamente. Solo cambia lo que Alejandro pide.

**P: ¿Qué hago si rompo algo?**  
R: Restaura desde la versión anterior (ej. v6.1) y reporta a Alejandro.

---

## 🎓 RECURSOS ADICIONALES

- **GUIA-MANDAMIENTOS-v3_3.md:** Reglas completas con ejemplos
- **CONTEXTO-COMPLETO-CLAUDE-CODE.md:** Historia completa del proyecto
- **CHANGELOG.md:** Registro de cambios por versión
- **README.md:** Documentación general

---

## ✨ MENSAJE FINAL

Bienvenido al equipo, Claude Code.

PRODIGY es un proyecto sólido con reglas claras. Síguelas al pie de la letra y todo irá bien.

**Recuerda:**
1. Lee los mandamientos SIEMPRE
2. Verifica con grep SIEMPRE
3. Cirugía quirúrgica, NO reescrituras
4. Versiona SIEMPRE

¡Nos vemos en el código! 🦷✨

---

**Creado:** 29 Marzo 2026  
**Para:** Claude Code  
**Por:** Alejandro + Claude (claude.ai)  
**Versión de esta guía:** 1.0
