# VERIFICAR — Protocolo de Alejandro
> Qué hacer TÚ después de cada cambio de Claude. Simple y rápido.

---

## ANTES DE VERIFICAR (siempre)
1. Espera ~2 min a que Cloudflare despliegue
2. Abre **ventana incógnito** (`Ctrl+Shift+N`)
3. Navega a la URL indicada

---

## LO QUE ME DEBES REPORTAR

### Si algo NO funciona:
```
- URL exacta donde falla
- Qué ves (texto del error, pantalla en blanco, elemento faltante)
- Dispositivo: PC / móvil
- Navegador: Chrome / Safari / otro
```

### Si funciona:
```
- "OK" es suficiente
```

---

## CHECKLISTS POR TIPO DE CAMBIO

### Cambio visual (CSS, layout, colores)
- [ ] ¿Se ve el elemento donde debe estar?
- [ ] ¿Los colores son correctos (dorado/magenta/cyan)?
- [ ] ¿Se ve bien en móvil? (redimensiona el browser a ~375px)

### Cambio de datos (Supabase, formularios)
- [ ] ¿El formulario envía sin error?
- [ ] ¿Los datos aparecen en Supabase después?
- [ ] ¿Aparece el mensaje de confirmación?

### Cambio en portafolio
- [ ] ¿Cargan los casos en `prodigylabdental.com/portafolio`?
- [ ] ¿Al clickear un caso, abre `caso?id=...`?
- [ ] ¿El visor Exocad carga (si el caso tiene archivo)?

### Cambio en panel admin
- [ ] Entra logueado como admin
- [ ] ¿La función específica ejecuta sin error en consola?
- [ ] ¿El cambio se refleja en Supabase (revisar tabla)?

### Cambio en animaciones / JS global
- [ ] Abre incógnito (sin cache del SW anterior)
- [ ] Scroll hacia abajo — ¿aparecen las secciones con fade?
- [ ] Hover en tarjetas eco — ¿hay glow?

---

## COMANDOS DE EMERGENCIA

### Cache viejo (ve el diseño antiguo):
```
F12 → Application → Service Workers → Unregister → Recargar
```

### Volver al punto de guardado pre-animaciones:
```bash
git checkout v-pre-gsap
```

### Ver último commit desplegado:
```bash
git log --oneline -5
```

---

## LO QUE YO (Claude) TE DIG AL TERMINAR

Siempre recibirás:
```
CAMBIOS: archivo → qué cambió (línea X)
VERIFICADO: grep resultado → confirma el cambio
PARA VERIFICAR: URL exacta → qué debe pasar
SI FALLA: qué hacer primero
```

---

## SEÑALES DE ALERTA (repórtame inmediatamente)

- Página en blanco (sin contenido)
- Error "Failed to fetch" o "Supabase error" visible
- Formulario que no envía después de 3 intentos
- Elemento que desapareció y antes estaba
- Consola del browser con errores en rojo (F12 → Console)
