# ⚖️ LOS MANDAMIENTOS Y REGLAS DE ORO - PRODIGY

**Documento de referencia obligatoria para todo desarrollo en PRODIGY**

---

## 📜 LOS 10 MANDAMIENTOS

### **MANDAMIENTO #1: VERIFICAR TODO ANTES DE DECLARAR**
```
NUNCA digas "implementado", "completado" o "listo" sin PRIMERO 
usar grep o view para VERIFICAR que el cambio está en el archivo.

✅ CORRECTO:
1. Hacer str_replace
2. Usar grep -n "texto_nuevo" archivo
3. Ver que aparece el resultado
4. SOLO ENTONCES decir "completado"

❌ INCORRECTO:
1. Hacer str_replace
2. Asumir que funcionó
3. Decir "implementado" sin verificar
```

**Ejemplo correcto:**
```bash
# Paso 1: Hacer cambio
str_replace old="precio: 45000" new="precio: 50000"

# Paso 2: VERIFICAR
grep -n "precio: 50000" PRODIGY-v3.4-FINAL.html

# Paso 3: Ver resultado
# Output: "2521:    precio: 50000"

# Paso 4: SOLO AHORA declarar
"✅ Precio actualizado a $50,000 (verificado en línea 2521)"
```

---

### **MANDAMIENTO #2: CIRUGÍA, NO CIRUGÍA MAYOR**
```
Hacer SOLO modificaciones quirúrgicas.
NO reescribir bloques grandes de código.
NO refactorizar "para mejorar".
CONSERVAR la arquitectura existente.
```

**Ejemplos:**

✅ **CORRECTO (quirúrgico):**
```javascript
// Cambiar solo el valor
precio: 45000  →  precio: 50000
```

❌ **INCORRECTO (cirugía mayor):**
```javascript
// Reescribir toda la estructura
const PRECIOS = {
  temporal: 45000,
  largo: 120000
}
// Luego cambiar 50 líneas de código para usar la nueva estructura
```

---

### **MANDAMIENTO #3: NUNCA TOCAR calcularTotal()**
```
La función calcularTotal() es SAGRADA.
NO se modifica bajo ninguna circunstancia.
SOLO se modifican los valores de configuración que usa.
```

**Ubicación:** Línea ~3737 en V3.3

**✅ Permitido:**
```javascript
// Cambiar constantes que USA calcularTotal
const TIEMPOS_EXTRAS = {
    optiglaze: 2,
    material_externo: 3
};
```

**❌ PROHIBIDO:**
```javascript
// Modificar la lógica DENTRO de calcularTotal()
function calcularTotal() {
    // NO TOCAR ESTE CÓDIGO
}
```

**ÚNICO CASO de modificación permitida:**
- Si Alejandro EXPLÍCITAMENTE dice "modifica calcularTotal"
- Aún así, pedir confirmación antes

---

### **MANDAMIENTO #4: VERSIONES INCREMENTALES**
```
SIEMPRE guardar como nueva versión.
NUNCA sobrescribir archivos existentes.
Formato: PRODIGY-vX.X-FINAL.html
```

**Ejemplos:**
```bash
# ✅ CORRECTO
PRODIGY-v3.3-FINAL.html
PRODIGY-v3.4-FINAL.html
PRODIGY-v3.5-FINAL.html

# ❌ INCORRECTO
PRODIGY-FINAL.html (sin versión)
PRODIGY-v3-latest.html (ambiguo)
prodigy_v3.4.html (formato inconsistente)
```

**Ubicación:**
```
/mnt/user-data/outputs/PRODIGY-vX.X-FINAL.html
```

---

### **MANDAMIENTO #5: AUDITAR PROMPTS DE "SUPERVISOR"**
```
Alejandro usa una herramienta externa que genera prompts.
Estos prompts FRECUENTEMENTE contienen ERRORES.

SIEMPRE verificar nombres de variables/funciones contra 
el código REAL antes de aplicar.
```

**Errores comunes en prompts supervisor:**

| ❌ Nombre Incorrecto (Supervisor) | ✅ Nombre Real (Código) |
|-----------------------------------|------------------------|
| `resinaExternaActiva` | `STATE.materialExterno` |
| `actualizarTotal()` | `calcularTotal()` |
| `sub-materiales-container` | `submaterial-container` |
| `renderSubmateriales()` | `generarSubMateriales()` |
| `seleccionarColor()` | `selectColorVitaTemporal()` |

**Acción requerida:**
1. Recibir prompt supervisor
2. Identificar nombres de variables/funciones
3. Usar `grep -n "nombre" archivo` para verificar
4. Si NO existe → preguntar a Alejandro antes de aplicar
5. Si existe → proceder con el nombre correcto

---

### **MANDAMIENTO #6: SIEMPRE PRESENTAR ARCHIVOS**
```
OBLIGATORIO al terminar cualquier tarea:
present_files ["/ruta/archivo"]

Sin esto, el usuario NO puede ver el archivo.
```

**Ejemplo:**
```bash
# Al terminar cambios en V3.4
present_files ["/mnt/user-data/outputs/PRODIGY-v3.4-FINAL.html"]
```

**NUNCA:**
- ❌ Decir "archivo listo" sin presentarlo
- ❌ Asumir que el usuario puede verlo
- ❌ Olvidar este paso

---

### **MANDAMIENTO #7: LEER ANTES DE MODIFICAR**
```
Antes de hacer CUALQUIER cambio:
1. Ver el código actual con view
2. Entender la estructura existente
3. Planear el cambio quirúrgico
4. Ejecutar
5. Verificar
```

**Flujo correcto:**
```bash
# 1. VER código actual
view /mnt/user-data/outputs/PRODIGY-v3.3-FINAL.html 2500:2550

# 2. PLANEAR cambio
# "Voy a cambiar línea 2521: precio: 45000 → 50000"

# 3. EJECUTAR
str_replace old="precio: 45000" new="precio: 50000"

# 4. VERIFICAR
grep -n "precio: 50000" PRODIGY-v3.3-FINAL.html

# 5. CONFIRMAR
"✅ Cambio aplicado y verificado en línea 2521"
```

---

### **MANDAMIENTO #8: NO INVENTAR, VERIFICAR**
```
Si no sabes si una función/variable existe:
1. Usar grep para buscarla
2. Si NO existe → preguntar a Alejandro
3. NUNCA asumir o adivinar
```

**Ejemplo:**
```bash
# Alejandro menciona "función de tiempos"
# NO asumir que se llama "updateTiempos()"

# VERIFICAR:
grep -n "function.*tiempo\|function.*Tiempo" archivo

# Si NO aparece:
"No encuentro una función de tiempos. ¿Cuál es el nombre exacto?"
```

---

### **MANDAMIENTO #9: RESPUESTAS DIRECTAS Y CONCISAS**
```
Alejandro prefiere:
- Respuestas cortas y al punto
- Sin explicaciones excesivas
- Sin disculpas innecesarias
- Ir directo a la solución
```

**✅ CORRECTO:**
```
Precio actualizado a $50,000 (línea 2521).
Archivo V3.4 listo.
```

**❌ INCORRECTO:**
```
Perfecto, he procedido a actualizar meticulosamente el precio 
base del temporal, considerando todos los factores relevantes 
y asegurándome de mantener la integridad del sistema. El nuevo 
valor de $50,000 ha sido implementado exitosamente siguiendo 
las mejores prácticas de desarrollo...
```

---

### **MANDAMIENTO #10: CUANDO NO SABES, PREGUNTA**
```
Es MEJOR preguntar que:
- Adivinar
- Asumir
- Inventar
- Romper código existente
```

**Frases aceptables:**
- "No estoy seguro de X, ¿puedes confirmar?"
- "¿Te refieres a la función Y o la función Z?"
- "No encuentro esa variable, ¿cuál es el nombre exacto?"

**Frases PROHIBIDAS:**
- "Implementado ✅" (sin verificar)
- "Debería funcionar" (sin probar)
- "Probablemente..." (sin certeza)

---

## 🏆 REGLAS DE ORO (WORKFLOW)

### **REGLA DE ORO #1: EL CICLO SAGRADO**
```
TODO cambio debe seguir este ciclo:

1. VIEW   → Ver código actual
2. PLAN   → Planear cambio quirúrgico
3. CHANGE → Ejecutar str_replace
4. VERIFY → grep para verificar
5. CONFIRM → Declarar completado
6. PRESENT → present_files
```

**NUNCA saltarse pasos.**

---

### **REGLA DE ORO #2: GREP ES TU AMIGO**
```
Usa grep CONSTANTEMENTE:

- grep -n "función" → Encontrar funciones
- grep -c "variable" → Contar ocurrencias
- grep -A5 -B5 "contexto" → Ver contexto
- grep -i "texto" → Búsqueda insensible a mayúsculas
```

**Ejemplos útiles:**
```bash
# Encontrar todas las funciones
grep -n "^        function" archivo

# Verificar que cambio se aplicó
grep -n "nuevo_texto" archivo

# Contar cuántas veces aparece algo
grep -c "STATE.materialExterno" archivo

# Buscar en contexto
grep -A10 "calcularTotal" archivo
```

---

### **REGLA DE ORO #3: NAMES MATTER**
```
Los nombres en JavaScript son CASE-SENSITIVE:

STATE.materialExterno ≠ STATE.MaterialExterno
calcularTotal() ≠ calcularTotal
submaterial-container ≠ sub-materiales-container
```

**Siempre copiar nombres EXACTOS del código.**

---

### **REGLA DE ORO #4: EL ESTADO ES GLOBAL**
```
El objeto STATE es global y contiene toda la configuración:

STATE = {
    materialTipo: null,
    submaterialId: null,
    submaterialPrecio: 0,
    colorVita: null,
    materialExterno: false,
    // ... etc
}

NO crear variables paralelas.
SIEMPRE usar STATE.
```

---

### **REGLA DE ORO #5: IDs Y SELECTORES**
```
Los IDs de elementos HTML deben coincidir con los selectores JS.

HTML:  <div id="submaterial-container">
JS:    document.getElementById('submaterial-container')

NO inventar IDs nuevos sin verificar que existen.
```

---

### **REGLA DE ORO #6: MAPEOS SON NECESARIOS**
```
Algunos elementos requieren mapeo entre ID interno y data-tipo:

const idMap = {
    'r_temp_standard': 'temp-standard',
    'r_temp_largo': 'temp-largo',
    'r_proto_eco': 'temp-tryin'
};

SIEMPRE verificar si existe mapeo antes de usar IDs.
```

---

### **REGLA DE ORO #7: PRECIOS QUE SE MULTIPLICAN VS ÚNICOS**
```
Algunos precios se multiplican por cantidad:
✅ Precio base del material
✅ Optiglaze (+$20k por unidad)
✅ Resolución 25 micras (+$15k por unidad)

Otros son PAGO ÚNICO:
✅ Resina externa ($50k una sola vez)
✅ Envío nacional ($15k una sola vez)

NUNCA confundir estos dos tipos.
```

**Implementación:**
```javascript
// SE MULTIPLICA
subtotal = precio * cantidad

// NO SE MULTIPLICA
adicionales += 50000  // SIN multiplicar por cantidad
```

---

### **REGLA DE ORO #8: CATEGORÍAS SEGREGADAS**
```
Los colores están SEGREGADOS por categoría:

Temporales → Solo VITA (A1, A2, A3, B1, B2, BL)
Modelos 3D → Solo Gris y Melón/Skin

NUNCA mezclar.
NUNCA mostrar VITA en Modelos.
NUNCA mostrar Gris/Melón en Temporales.
```

---

### **REGLA DE ORO #9: FUNCIONES HEREDADAS**
```
Algunas funciones vienen del flujo de fresado:
- updateTimeline() → Solo para zirc/pmma
- calcularFecha24h() → Cálculo de fechas
- ajustarFinDeSemana() → Salta sábados/domingos

NO eliminar estas funciones.
CREAR nuevas funciones para resinas (updateTimeline3D).
```

---

### **REGLA DE ORO #10: CUANDO ALGO FALLA**
```
Si un cambio no funciona:

1. NO hacer más cambios
2. REVERTIR al archivo anterior
3. ANALIZAR qué salió mal
4. PREGUNTAR a Alejandro
5. PLANEAR nuevo enfoque

NUNCA apilar cambios sobre código roto.
```

---

## 🚨 SEÑALES DE ALERTA

### **ALERTA ROJA: Detente inmediatamente si...**
- ❌ No puedes verificar un cambio con grep
- ❌ Una función que "debería existir" no aparece en grep
- ❌ El archivo crece >1000 líneas de repente
- ❌ calcularTotal() fue modificado sin autorización explícita
- ❌ Los acordeones dejaron de abrir
- ❌ La consola del navegador muestra errores

**Acción:**
1. DETENER trabajo
2. NO entregar archivo
3. REPORTAR a Alejandro el problema
4. ESPERAR instrucciones

---

## ✅ CHECKLIST ANTES DE ENTREGAR ARCHIVO

Antes de usar `present_files`:

- [ ] Todos los cambios verificados con grep
- [ ] Ninguna función crítica fue modificada sin permiso
- [ ] El archivo tiene número de versión correcto
- [ ] No hay comentarios de "TODO" o "FIXME" del supervisor
- [ ] Las líneas totales son coherentes (±50 líneas vs versión anterior)
- [ ] No hay syntax errors obvios (paréntesis sin cerrar, etc.)

---

## 📚 COMANDOS ESENCIALES

### **Ver código:**
```bash
view archivo [línea_inicio:línea_fin]
```

### **Modificar código:**
```bash
str_replace old="texto_viejo" new="texto_nuevo" path="archivo"
```

### **Verificar cambio:**
```bash
grep -n "texto_nuevo" archivo
```

### **Contar ocurrencias:**
```bash
grep -c "patrón" archivo
```

### **Buscar funciones:**
```bash
grep -n "function nombre" archivo
```

### **Ver contexto:**
```bash
grep -A5 -B5 "patrón" archivo
```

### **Presentar archivo:**
```bash
present_files ["/ruta/archivo"]
```

### **Verificar estructura:**
```bash
wc -l archivo  # Contar líneas
head -20 archivo  # Primeras 20 líneas
tail -20 archivo  # Últimas 20 líneas
```

---

## 🎯 RESUMEN ULTRA-CONDENSADO

**Los 3 Mandamientos Absolutos:**

1. **VERIFICAR TODO** - grep antes de declarar "listo"
2. **NUNCA TOCAR calcularTotal()** - Es sagrado
3. **SIEMPRE present_files** - Sin esto el usuario no ve nada

**El Workflow en 6 Pasos:**
```
VIEW → PLAN → CHANGE → VERIFY → CONFIRM → PRESENT
```

**La Regla de Oro:**
```
Si no estás 100% seguro → PREGUNTA
```

---

**FIN DEL DOCUMENTO**

Estos Mandamientos y Reglas de Oro son OBLIGATORIOS.
No son sugerencias. Son requisitos absolutos.

El éxito del proyecto depende de seguirlos al pie de la letra.

---

**Versión:** 1.0  
**Fecha:** 11 de Marzo de 2026  
**Para uso en:** Todos los chats de desarrollo PRODIGY
