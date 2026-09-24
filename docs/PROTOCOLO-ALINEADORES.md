# Protocolo de Alineadores — PRODIGY (piloto ortodoncia)

Fuente: Alejandro + Mayra (técnica de alineadores), sep-2026. Cliente piloto: **Panorámica Digital 3D** (Rep. Dominicana). Ver `memory/project_flujo_alineadores.md`.

## Flujo general
1. **Valoración** → 2. **Planificación / plan de tratamiento** (hasta 2 revisiones) → 3. **Modelos para impresión 3D** → **caso terminado**.
Reusa el motor de revisión de diseño existente (`REVISION_CLIENTE` → aprobar / pedir cambio, límite 2 revisiones).

## 1. Valoración
Para estimar la cantidad de alineadores se requiere: **STL + fotos del paciente + radiografía panorámica/perfil + indicaciones**.
- La valoración es **viable 3–4 meses**. Pasado ese tiempo → **nueva valoración** con recepción de nuevos archivos.

### Checklist para una valoración más completa (lo que envía el ortodoncista)
- Radiografía panorámica y de perfil.
- Fotos del paciente (frontal, oclusales, laterales).
- Motivo de consulta del paciente.
- Indicaciones del ortodoncista.
- Indicar si está de acuerdo con **IPR** y con el uso de **attachments** o posibles aditamentos.

## 2. Replaneación
Solicitada por el ortodoncista si el paciente no va acorde al plan diseñado. Revisar aprox. **a mitad de tratamiento**.
- Si va **acorde** con el tiempo del plan → cobro adicional **($20)**.
- Si **NO** está dentro de los tiempos del plan → cobro adicional **($40)**.

## 3. Refinamiento
Después de terminar todo el plan, si el ortodoncista lo ve necesario.
- Solicitado **antes de 6 meses** de finalizado el tratamiento → **sin cobro**.
- Cada tratamiento finalizado en los tiempos correctos → **un (1) refinamiento** incluido.
- Cambios y solicitudes adicionales → **tienen costo** aparte de lo anterior.
- **Después de 6 meses** → cobro adicional **($40)**.

## Tarifas — DOS cuentas separadas (¡no confundir!)
Cada caso genera hasta 2 cargos: uno que **cobro al cliente** y otro que **pago a Mayra**.

### A) Lo que COBRO al cliente (Panorámica Digital 3D) — **USD** (paga por **Global66, sin comisión de envío**, al corte mensual)
**PRECIO VIGENTE (lo que el sistema cobra HOY — el alza AÚN NO aplica):**
- **Valoración sola:** **$30 USD**
- **Caso completo** (valoración + plan + modelos): **$90 USD**
- Replaneación: **$20** (en tiempo) / **$40** (fuera de tiempo) USD.
- Refinamiento: **$0** (≤6 meses, 1º incluido) / **$40** (>6 meses o adicional) USD.
- Cobro: **Global66 @JESSMEN1171** (Jessica Mendez Carmelo) → sin comisión: envían el monto exacto (instrucciones enviadas por WhatsApp el 8-jun-2026). **PayPal** solo como alternativa: el cliente suma **12 % de comisión** (acordado por Alejandro; no quedó por escrito en el texto del chat — confirmarlo por escrito).
- Cómo pagan (historial de WhatsApp): el cliente arma el reporte desde el último paciente del reporte anterior; su departamento de pagos lo autoriza (tarda semanas). Pagado hasta **mayo 2026** (confirmado 7-ago). Una valoración de un caso NO viable se cobra igual (confirmado 12-ago, Naomi Severino).

**PROPUESTA de alza (enviada al cliente, PENDIENTE de aprobación — NO aplicar hasta que confirmen):**
- Valoración **$40** · Caso completo **$120** · Replaneación **$25/$50** · Refinamiento **$50**.
- Motivo: el dólar cayó de ~3.880 a ~3.180 (sep-2026) → el margen se comprimió ~31%. El precio $90 no es sostenible más allá de **nov-2026**.
- Al aprobarse: actualizar el trigger/RPC en `sql/alineadores-mayra-panel-2026.sql` y `PRECIOS` en `app/alineadores.html`. Revisión trimestral + cláusula piso: si USD/COP < 3.300, recalcular con `(margen_objetivo_COP + costo_Mayra_COP) ÷ tasa`.
- Historial de precio: **$60/$20** → **$90/$30 (vigente)** → propuesta **$120/$40**.

### B) Lo que PAGO a Mayra (técnica) — **COP**
- **Valoración sola:** **$20.000 COP** (se re-cobra si pasan +4 meses y hay que re-valorar).
- **Caso completo (planeación):** **$60.000 COP** (confirmado: 9 planeaciones = 540.000).
- Pago a Mayra: Global66 / Nequi **@mayrar2720**.

### Corte mensual
Se suman los cargos del mes **por cada cuenta por separado**: `TOTAL A COBRAR (cliente)` y `TOTAL A PAGAR (Mayra)`. Estado por cargo: pendiente / pagado / facturado.
> ⚠️ Moneda por confirmar/registrar por cargo (`moneda`): la hoja del cliente está en miles (COP); el pago a Mayra es en USD. El sistema guarda `monto` + `moneda` en cada cargo.

## Formato de entrega de Mayra (técnica) — trabaja con 3Shape
Mayra planifica en **3Shape** (por ahora), así que **NO sube HTML** (no es el flujo de diseño de coronas). Sus entregables por caso son:
- **Video** (recorrido del setup / simulación de movimientos).
- **PDF** (plan de tratamiento, cantidad de alineadores, IPR, attachments).
- **Imágenes** (capturas del setup, antes/después).
El cliente revisa esos archivos y **aprueba o deja observaciones** (2 revisiones). Al aprobar, Mayra envía **modelos para impresión 3D** y el caso termina.

## Qué debe enviar el CLIENTE (revisar en cada caso antes de dar viabilidad)
- **STL** (escaneo intraoral o modelos).
- **Radiografía panorámica y de perfil.**
- **Fotos** del paciente (frontal, oclusales, laterales).
- **Motivo de consulta** del paciente.
- **Indicaciones** del ortodoncista.
- **Confirmar** si está de acuerdo con **IPR** y con **attachments/aditamentos**.
> Si falta algo (típico: panorámica, confirmación de implante/pieza, escaneo con distorsión/huecos) → **pedirlo antes de planificar**. Una valoración es viable **3–4 meses**; pasado ese tiempo se recobra y se piden archivos nuevos.

## Factores por los que un plan NO se da totalmente (no imputables al lab)
- No cementar attachments.
- Cementar attachments con excesos que impiden la buena adaptación del alineador.
- No realizar los cortes interproximales (IPR) indicados.
- No usar los elásticos indicados.
- Uso insuficiente/inadecuado por parte del paciente.

## Modelo de datos (dónde se guarda)
- `alineadores_casos` — un caso: paciente, cliente, técnico, viabilidad, plan, modelos, fechas clave (valoración, recepción, envío, fin de tratamiento), estado. **Visible a staff incl. Mayra (diseno) — SIN dinero.**
- `alineadores_cargos` — cada evento facturable (valoración, completo, replaneación, refinamiento, adicional) con `monto`, `moneda`, `fecha`, `mes_corte`, `facturado_cliente`, `pagado_mayra`. **Solo admin/operator/contabilidad — Mayra NO ve dinero.**
- Página: `app/alineadores.html` (tracker + corte mensual). SQL: `sql/alineadores-casos-2026.sql`.
