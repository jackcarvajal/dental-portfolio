# PRODIGY — Protocolo de Test Completo
> Ejecutar antes de lanzar campañas publicitarias

---

## TEST 1 — Flujo Diseño CAD (cliente nuevo sin cuenta)
**Simula: Odontólogo de México que llegó por Google Ads**

### Pasos:
1. [ ] Abrir pestaña incógnito → ir a `prodigylabdental.com/diseno-remoto`
2. [ ] Verificar: ¿Carga la página sin errores? ¿Se ve el hero correctamente?
3. [ ] Click en "Ver precios exactos" → debe ir a `/calculadora-diseno`
4. [ ] En calculadora: seleccionar "Corona / Inlay", cantidad 3, urgente ON
5. [ ] Verificar: ¿Muestra precio en USD? ¿Toggle USD/COP funciona?
6. [ ] Click "Subir mi STL ahora" → debe ir a `/envia-tu-scanner` **SIN pedir login**
7. [ ] Llenar formulario: nombre ficticio, WA ficticio, seleccionar tipo de servicio
8. [ ] Subir un archivo STL de prueba (o cualquier archivo .stl)
9. [ ] Verificar: ¿Aparece confirmación de éxito?
10. [ ] Verificar: ¿Llega notificación al WhatsApp real?
11. [ ] Verificar: ¿El caso aparece en Supabase → tabla `solicitudes_scanner`?

**Resultado esperado:** Caso registrado, WA recibido, sin login en ningún paso ✅

---

## TEST 2 — Flujo Diseño CAD (cliente registrado)
**Simula: Cliente existente con cuenta en el portal**

### Pasos:
1. [ ] Ir a `prodigylabdental.com/flujo-diseno`
2. [ ] Debe redirigir a login automáticamente
3. [ ] Iniciar sesión con cuenta de prueba
4. [ ] Llenar el formulario de diseño completo
5. [ ] Subir archivo STL
6. [ ] Verificar: ¿Se crea pedido en Supabase → tabla `pedidos`?
7. [ ] Verificar: ¿Llega WA de confirmación con link de seguimiento?
8. [ ] Abrir el link de seguimiento → debe mostrar estado del pedido

**Resultado esperado:** Pedido en BD, WA con tracking link ✅

---

## TEST 3 — Flujo Fresado (cliente Colombia)
**Simula: Laboratorio colombiano**

### Pasos:
1. [ ] Ir a `prodigylabdental.com/fresado-cam`
2. [ ] Click "Calcular precio" → debe ir a `/calculadora-fresado`
3. [ ] Seleccionar servicio, material, cantidad → verificar precio en COP
4. [ ] Click "Pedir fresado online" → debe pedir login
5. [ ] Iniciar sesión → llegar a `flujo-fresado`
6. [ ] Completar formulario + subir STL
7. [ ] Verificar pedido en Supabase

**Resultado esperado:** Pedido creado con login ✅

---

## TEST 4 — Geo-block (cliente internacional en fresado)
**Simula: Cliente de otro país que intenta acceder a fresado**

### Pasos:
1. [ ] Con VPN activa (país ≠ Colombia) ir a `prodigylabdental.com/flujo-fresado`
2. [ ] Debe mostrar overlay: "Servicio disponible solo en Colombia"
3. [ ] Debe ofrecer WhatsApp + link a diseño CAD

**Resultado esperado:** Overlay de geo-bloqueo visible ✅

---

## TEST 5 — Panel Admin
**Simula: Alejandro recibiendo un caso nuevo**

### Pasos:
1. [ ] Ir a `prodigylabdental.com/app/admin-panel`
2. [ ] Verificar que carga el panel con pedidos en tiempo real
3. [ ] Buscar el caso de prueba del TEST 1 (solicitudes_scanner)
4. [ ] Buscar el caso del TEST 2 (pedidos)
5. [ ] Verificar que se puede cambiar el estado del pedido
6. [ ] Verificar que el cambio de estado se refleja en `/seguimiento-caso`

**Resultado esperado:** Admin ve todos los casos, puede actualizar estados ✅

---

## TEST 6 — Seguimiento de caso (cliente sin login)
**Simula: Cliente verificando su pedido**

### Pasos:
1. [ ] Tomar el link de seguimiento del TEST 2
2. [ ] Abrirlo en pestaña incógnito (sin login)
3. [ ] Verificar que muestra el estado actual del pedido

**Resultado esperado:** Tracking visible sin login ✅

---

## TEST 7 — Bot IA (Gemini)
### Pasos:
1. [ ] Ir a `prodigylabdental.com`
2. [ ] Abrir el chat del bot
3. [ ] Preguntar: "¿Cuánto cuesta una corona de zirconio?"
4. [ ] Verificar que responde con información correcta de PRODIGY

**Resultado esperado:** Bot responde con precios y flujo correcto ✅

---

## TEST 8 — Calculadora Diseño (internacional USD)
### Pasos:
1. [ ] Ir a `prodigylabdental.com/calculadora-diseno`
2. [ ] Verificar que abre en USD por defecto
3. [ ] Cambiar a COP → verificar conversión
4. [ ] Seleccionar Full Arch, 2 arcadas → verificar total
5. [ ] Click WhatsApp → verificar que el mensaje incluye el resumen del caso

**Resultado esperado:** Precio correcto, mensaje WA con detalle del caso ✅

---

## CHECKLIST ADMIN POST-TEST

- [ ] Todos los pedidos de prueba: eliminar de Supabase (limpiar BD)
- [ ] Verificar que GA4 recibió eventos (analytics.google.com → Tiempo real)
- [ ] Verificar que Meta Pixel recibió PageView (Meta → Administrador de eventos)
- [ ] Confirmar que no hay errores en consola del navegador (F12 → Console)

---

## Errores conocidos que reportar

| Error | Dónde reportar |
|-------|----------------|
| STL no sube | Verificar bucket `scanner-uploads` en Supabase Storage → políticas RLS |
| Bot no responde | Verificar GEMINI_API_KEY en Cloudflare env vars |
| WhatsApp no llega | Verificar función edge `notify-wa` en Supabase Functions |
| Geo-block no funciona | ipapi.co puede estar bloqueado — verificar en Network tab |
