# 🏆 LOS 10 MANDAMIENTOS DE PRODIGY - REGLAS DE ORO

## ⚠️ NUNCA VIOLAR ESTAS REGLAS

### 1️⃣ FUNCIÓN SAGRADA
```javascript
function calcularTotal() { ... }
```
**NUNCA** modificar esta función. Es el corazón del sistema.

### 2️⃣ CAMBIOS QUIRÚRGICOS
Solo modificaciones **incrementales** y **pequeñas**. Nunca reescribir bloques completos.

### 3️⃣ FUENTE ÚNICA DE VERDAD
```javascript
const SUB_MATERIALES = deepFreeze({ ... });
```
**NUNCA** modificar precios fuera de esta constante. Es la única fuente válida.

### 4️⃣ PROTECCIÓN ACTIVA
`deepFreeze()` debe estar **SIEMPRE** activo. Protege la integridad de precios.

### 5️⃣ VERSIONADO OBLIGATORIO
Cada cambio = nueva versión incremental (v136, v137, v138...)

### 6️⃣ VERIFICACIÓN POST-CAMBIO
Después de CADA modificación:
```bash
wc -l archivo.html
grep "function calcularTotal" archivo.html
```

### 7️⃣ OUTPUTS SIEMPRE
```bash
cp /home/claude/PRODIGY-vXXX.html /mnt/user-data/outputs/
```
**SIEMPRE** copiar versión final a /outputs

### 8️⃣ ESTRUCTURA INTOCABLE
Mantener jerarquía de precios y lógica de cálculo intacta.

### 9️⃣ SEGURIDAD ANTI-DEVTOOLS
```javascript
document.addEventListener('contextmenu', e => e.preventDefault());
// F12, Ctrl+Shift+I bloqueados
```
**NUNCA** deshabilitar protecciones de seguridad.

### 🔟 MODO OSCURO DEFAULT
Sistema **SIEMPRE** debe iniciar en modo oscuro. Es obligatorio.

---

# 📋 GUÍA RÁPIDA NUEVA CONVERSACIÓN

## 🚀 INICIO DE SESIÓN

### Archivos a Subir
```
1. PRODIGY-v135-FINAL.html (4,007 líneas)
2. GUIA-MANDAMIENTOS-v135.md (este archivo)
```

### Mensaje Inicial
```
Hola, continúo el desarrollo de PRODIGY v135.
Adjunto:
- HTML actual (v135-FINAL.html)  
- Guía de mandamientos y reglas

Necesito: [DESCRIPCIÓN DEL CAMBIO]
```

## ✅ CHECKLIST PRE-CAMBIO

Antes de CUALQUIER modificación, confirmar:

- [ ] ¿Es cambio quirúrgico pequeño?
- [ ] ¿NO toca calcularTotal()?
- [ ] ¿NO modifica SUB_MATERIALES?
- [ ] ¿Versión incrementada? (v136+)
- [ ] ¿Entiendo el impacto completo?

## 🎯 WORKFLOW ESTÁNDAR

### 1. Copiar base
```bash
cp /mnt/user-data/outputs/PRODIGY-v135-FINAL.html /home/claude/PRODIGY-v136.html
```

### 2. Hacer cambio quirúrgico
Solo modificar lo estrictamente necesario.

### 3. Verificar integridad
```bash
wc -l PRODIGY-v136.html
grep "function calcularTotal" PRODIGY-v136.html
```

### 4. Guardar a outputs
```bash
cp /home/claude/PRODIGY-v136.html /mnt/user-data/outputs/
```

### 5. Presentar archivo
```bash
present_files PRODIGY-v136.html
```

---

# 🎨 REGLAS DE DISEÑO

## Modo Oscuro (DEFAULT)
```css
--bg-darker: #050505
--bg-dark: #080808
--accent: #8B7355
--text: #ffffff
Inicia SIEMPRE en este modo
```

## Modo Claro
```css
--bg: #ffffff
--accent: #D4AF37 (dorado luxury)
--text: #000 (peso 800, NUNCA gris)
Degradados dorados difuminados
Emojis con drop-shadow para visibilidad
```

## Responsive
- Desktop: >1024px
- Tablet: 769-1024px
- Mobile: ≤768px
- Small: ≤480px

---

# 🔧 CARACTERÍSTICAS v135

## ✅ Implementado
- Cotización CAM completa
- Modo oscuro/claro (default oscuro)
- Menú hamburguesa 3×3
- Popup ayuda rectangular con WhatsApp
- Confirmación de pago
- Timeline entrega
- Google Translate
- Scroll to top
- 5 botones flotantes
- Responsive completo
- Header compacto

## 🚧 Pendiente
- WhatsApp Business API
- Supabase integration
- PWA capabilities
- Dashboard admin
- Analytics

---

# ⚡ ATAJOS RÁPIDOS

## Comandos Útiles
```bash
# Ver líneas
wc -l archivo.html

# Verificar función crítica
grep "function calcularTotal" archivo.html

# Buscar en archivo
grep -n "texto" archivo.html

# Ver sección específica
sed -n '100,200p' archivo.html
```

## Ubicaciones Clave
```
Función crítica: ~línea 2500
SUB_MATERIALES: ~línea 2200
Estilos: líneas 1-1800
HTML: líneas 1800-3800
JavaScript: líneas 3800-4000
```

---

# 🚨 ERRORES COMUNES

### ❌ NO HACER
1. Modificar calcularTotal()
2. Cambiar estructura SUB_MATERIALES
3. Iniciar en modo claro
4. Texto gris en modo claro
5. Cambios masivos sin versionar
6. Olvidar copiar a /outputs
7. No verificar líneas post-cambio
8. Deshabilitar deepFreeze()

### ✅ SÍ HACER
1. Cambios incrementales pequeños
2. Versionar siempre (v136+)
3. Verificar calcularTotal() intacta
4. Texto negro peso 800 en claro
5. Copiar a /outputs
6. Documentar cambios
7. Mantener seguridad activa
8. Default modo oscuro

---

# 📊 ESTADO ACTUAL v135

```
Versión: v135-FINAL
Líneas: 4,007
Estado: ✅ PRODUCCIÓN READY
Funciones críticas: INTACTAS
Tests: MÚLTIPLES ITERACIONES
Modo default: OSCURO
Contraste claro: NEGRO 800
```

---

# 💡 TIPS DE DESARROLLO

## Antes de Modificar
1. Leer esta guía completa
2. Entender el cambio requerido
3. Identificar archivo/sección exacta
4. Planear cambio quirúrgico
5. Verificar no toca funciones críticas

## Durante Modificación
1. Cambios pequeños incrementales
2. Un solo objetivo por versión
3. Comentar código nuevo si complejo
4. Mantener estructura existente

## Después de Modificar
1. Verificar líneas totales
2. Confirmar calcularTotal() intacta
3. Probar en navegador si posible
4. Copiar a /outputs
5. Documentar cambio

---

# 🎯 PRÓXIMOS PASOS SUGERIDOS

## Alta Prioridad
1. WhatsApp Business API integration
2. Supabase para persistencia
3. PWA manifest y service worker

## Media Prioridad
1. Sistema de notificaciones
2. Historial de órdenes
3. Export PDF

## Baja Prioridad
1. Dashboard administrativo
2. A/B testing
3. Chat soporte en vivo

---

# 📞 CONTACTO Y DATOS

**Cliente:** Jessica Mendez  
**WhatsApp:** +57 322 877 4481  
**Sistema:** PRODIGY CAM Dental  
**Versión:** v135-FINAL  
**Fecha:** Febrero 2025

---

# 🎉 MENSAJE FINAL

✅ **v135 está 100% funcional y listo para producción**

📦 **Archivos para migrar:**
- PRODIGY-v135-FINAL.html
- GUIA-MANDAMIENTOS-v135.md

🚀 **Siguiente versión será v136**

⚠️ **RECUERDA LOS 10 MANDAMIENTOS**

💪 **¡Éxito en la próxima fase de desarrollo!**

---

*Documento generado: 24 Feb 2025*  
*Versión guía: 1.0*  
*Tokens disponibles nueva sesión: ~190,000*
