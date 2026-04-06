# 🚀 MIGRACIÓN PRODIGY v135 - GUÍA COMPLETA

## 📦 ARCHIVOS ESENCIALES

### Archivo Principal
- **PRODIGY-v135-MIGRATION-READY.html** (4,005 líneas)
- Estado: ✅ PRODUCCIÓN READY
- Modo default: OSCURO (obligatorio)

## 🎯 CARACTERÍSTICAS IMPLEMENTADAS

### Sistema Core
- ✅ Cotización CAM dental completa
- ✅ calcularTotal() INTACTA (NUNCA modificar)
- ✅ deepFreeze() en SUB_MATERIALES
- ✅ Validación completa de inputs
- ✅ Seguridad anti-manipulación

### UI/UX
- ✅ Modo oscuro/claro (inicia SIEMPRE oscuro)
- ✅ Menú hamburguesa grid 3×3
- ✅ Popup ayuda rectangular
- ✅ Botones flotantes (5 totales)
- ✅ Scroll to top
- ✅ Responsive 100%

### Integraciones
- ✅ WhatsApp (manual - pendiente API)
- ✅ Google Translate
- ✅ Confirmación de pago
- ✅ Timeline de entrega

## 🎨 TEMAS

### Modo Oscuro (Default)
```css
--bg-darker: #050505
--bg-dark: #080808
--bg-card: #0c0c0c
--accent: #8B7355 (dorado)
--text: #ffffff
```

### Modo Claro
```css
--bg: #ffffff → #f5f5f5
--accent: #D4AF37 (dorado luxury)
--text: #000 (TODO NEGRO peso 800)
Degradados dorados difuminados
```

## 🔧 REGLAS CRÍTICAS

### LOS 10 MANDAMIENTOS (NUNCA VIOLAR)
1. **NUNCA** modificar `calcularTotal()`
2. Solo cambios quirúrgicos incrementales
3. `SUB_MATERIALES` es fuente única de verdad
4. deepFreeze() activo siempre
5. Versiones incrementales (v136, v137...)
6. Verificar líneas después de cada cambio
7. Copiar a /outputs siempre
8. Mantener estructura de precios
9. Seguridad anti-DevTools activa
10. Mode default = OSCURO siempre

## 📋 PENDIENTES PARA SIGUIENTE FASE

### Alta Prioridad
- [ ] Migración WhatsApp Business API
- [ ] Integración Supabase
- [ ] PWA capabilities
- [ ] Analítica de conversiones

### Media Prioridad
- [ ] Notificaciones push
- [ ] Historial de órdenes
- [ ] Multi-idioma nativo
- [ ] Export PDF órdenes

### Baja Prioridad
- [ ] Dashboard admin
- [ ] Reportes avanzados
- [ ] A/B testing
- [ ] Chat en vivo

## 🛠️ INSTRUCCIONES PARA NUEVA CONVERSACIÓN

### 1. Subir Archivos
```
- PRODIGY-v135-MIGRATION-READY.html
- MIGRACION-NUEVO-CHAT-v135.md (este archivo)
```

### 2. Contexto Inicial
```
"Estoy continuando el desarrollo de PRODIGY v135.
Adjunto el HTML actual y la guía de migración.
Necesito [DESCRIBIR CAMBIO ESPECÍFICO]"
```

### 3. Recordatorios Importantes
- Siempre incrementar versión (v136+)
- Verificar calcularTotal() intacta
- Modo oscuro por defecto
- Texto negro en modo claro
- Copiar a /outputs

## 📊 ESTADÍSTICAS FINALES

- **Versiones desarrolladas:** 135
- **Líneas de código:** 4,005
- **Funciones críticas:** TODAS intactas
- **Tests realizados:** Múltiples iteraciones
- **Estado:** ✅ PRODUCCIÓN

## 🎨 MODO CLARO - ESPECIFICACIONES

### Contraste Máximo
```css
/* TODO TEXTO EN NEGRO */
color: #000 !important;
font-weight: 800 !important;

/* Emojis visibles */
filter: drop-shadow(0 0 3px rgba(0,0,0,0.3));

/* Calculadora fondo dorado */
background: linear-gradient(145deg, 
    rgba(255,255,255,0.95), 
    rgba(212,175,55,0.08));
```

### Elementos Adaptados
- ✅ Menú: Blanco con bordes dorados
- ✅ Acordeones: Degradado dorado sutil
- ✅ Chips: Dorado luxury
- ✅ Modales: Fondo blanco difuminado
- ✅ Inputs: Bordes dorados

## 💾 BACKUP

Versiones previas importantes:
- v113: Base funcional sin bugs
- v127: Header titán + glow
- v130: Menú compacto
- v133: Luxury dorado
- v135: FINAL MIGRATION READY

## 🚨 ERRORES COMUNES A EVITAR

1. ❌ Modificar calcularTotal()
2. ❌ Cambiar estructura SUB_MATERIALES
3. ❌ Iniciar en modo claro
4. ❌ Texto gris en modo claro
5. ❌ Bordes blancos en oscuro
6. ❌ Olvidar versionar
7. ❌ No copiar a /outputs
8. ❌ Cambios masivos sin incrementar

## 📞 CONTACTO

**WhatsApp:** +57 322 877 4481  
**Sistema:** PRODIGY CAM Dental  
**Usuario:** Jessica Mendez

---

✅ **TODO LISTO PARA MIGRACIÓN**  
📦 **ARCHIVOS PREPARADOS**  
🚀 **v135 PRODUCCIÓN READY**

**Fecha migración:** 2025-02-24  
**Versión:** v135-MIGRATION-READY  
**Estado:** COMPLETO
