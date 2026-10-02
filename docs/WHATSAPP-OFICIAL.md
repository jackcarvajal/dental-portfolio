# WhatsApp oficial (Cloud API de Meta) — avisos automáticos al doctor

> Estado (2026-10-01): el código ya está listo en `functions/api/notify-wa.js` y queda **inerte** hasta que
> existan `WA_TOKEN` y `WA_PHONE_ID` en Cloudflare. Mientras tanto todo sigue como antes: el panel abre
> WhatsApp con el mensaje escrito y la persona del equipo lo envía a mano.

## Por qué

| Hoy | Problema |
|---|---|
| CallMeBot (`notify-staff`; `wa-auto` se eliminó oct-2026) | No es oficial y **solo envía al número que lo activó**: sirve para avisos al equipo, nunca para doctores. Cambia de número seguido. |
| `wa.me` (`notify-wa`) | Funciona, pero alguien tiene que tocar «Enviar» en cada caso. |
| **Cloud API de Meta** | Oficial, gratis de montar, envía solo. Se paga por mensaje de plantilla entregado. |

**Costo de referencia:** los mensajes de *utilidad* (avisos de un caso) en Colombia cuestan fracciones de
centavo de dólar cada uno (≈ US$0,0008 según las tablas publicadas a 2026; confirmar en
https://developers.facebook.com/docs/whatsapp/pricing). 300 avisos al mes ≈ menos de US$1. Responder dentro
de las 24 h después de que el doctor escribe es gratis.

## Cómo funciona en el sistema

**Bandeja de WhatsApp** (`app/bandeja-whatsapp.html`, tabla `avisos_whatsapp`): cada cambio de etapa de un caso de
PRODIGY deja un aviso en cola (trigger en `pedidos`, `sql/avisos-whatsapp-2026.sql`). La secretaria los envía desde ahí
con el WhatsApp de PRODIGY; los paneles ya no abren WhatsApp por su cuenta cuando el aviso quedó en la bandeja
(`notify-wa` responde `en_bandeja`). Con la API oficial, el mismo botón lo envía solo y el aviso queda «Salió solo».

1. Alguien del equipo cambia el estado de un caso (panel de diseño, panel de operación, panel interno).
2. El panel llama a `/api/notify-wa` **con su sesión**. La función verifica que sea del equipo
   (`app_metadata`, nunca `user_metadata`), busca la llave del caso y arma el enlace de seguimiento.
3. Si `WA_TOKEN` y `WA_PHONE_ID` existen → envía la plantilla aprobada y el panel muestra
   «WhatsApp enviado al doctor». Si no existen o Meta rechaza → abre `wa.me` como hoy.
4. Llamadas sin sesión (p. ej. la lista de espera de mantenimiento) nunca envían por la API ni reciben la llave del caso.

## Lo que tiene que hacer Alejandro (una sola vez)

1. **Número.** Recomendado: una SIM nueva solo para avisos automáticos («PRODIGY Notificaciones»). Un número
   conectado a la API deja de funcionar en la app de WhatsApp normal; así el WhatsApp Business actual sigue intacto.
2. **App de Meta.** https://developers.facebook.com/apps → Crear app → tipo *Business* → agregar el producto
   **WhatsApp** → conectarla al portafolio de negocio de PRODIGY → *API Setup* → agregar el número y verificarlo por SMS.
3. **Nombre visible** «PRODIGY Lab Dental» (Meta lo aprueba) y, si lo pide, **verificación del negocio**
   (Configuración del negocio → Centro de seguridad).
4. **Método de pago** en WhatsApp Manager (tarjeta).
5. **Plantillas** (WhatsApp Manager → Plantillas → Crear → categoría **Utilidad**). Crear las 4 de abajo en
   **español (`es`)** y, si atiendes clientes fuera de Colombia, también en **inglés (`en`)** con el MISMO nombre.
6. **Token permanente.** Configuración del negocio → Usuarios del sistema → Agregar (rol Admin) → asignarle la app
   y la cuenta de WhatsApp con control total → *Generar token* con los permisos `whatsapp_business_messaging` y
   `whatsapp_business_management`.
7. **Cloudflare** (proyecto de PRODIGY → Settings → Variables and Secrets → Production, tipo **Secret**):
   `WA_TOKEN` = el token del paso 6 · `WA_PHONE_ID` = el *Phone number ID* de *API Setup*. Guardar y volver a
   desplegar. **Nunca pegues el token en el chat.**
8. **Prueba:** pasa un caso de prueba a «Revisión del cliente». Debe salir «WhatsApp enviado al doctor» y llegar
   el mensaje al número del caso.

## Plantillas (copiar tal cual)

Todas: categoría **Utilidad**, un botón **URL dinámica** con la base `https://prodigylabdental.com/{{1}}`.
En «ejemplo» del botón usa `seguimiento-caso?id=CAD-7F3A21&key=EJEMPLO`.

| Nombre | Texto (es) | Botón | Se envía cuando |
|---|---|---|---|
| `prodigy_diseno_listo` | Hola Dr(a). {{1}}, el diseño de su caso {{2}} está listo para revisar. Puede aprobarlo o pedir cambios; incluye 2 revisiones. | Revisar diseño | El diseñador lo pasa a revisión del cliente |
| `prodigy_avance_caso` | Hola Dr(a). {{1}}, hay novedades en su caso {{2}}: {{3}}. Le avisaremos en cada etapa. | Seguir mi caso | Diseño, cambios, producción, fresado, impresión, calidad, despacho, en camino |
| `prodigy_reenviar_archivos` | Hola Dr(a). {{1}}, los archivos de su caso {{2}} llegaron incompletos o con un problema. Por favor reenvíelos para continuar. | Ver mi caso | Archivo con error |
| `prodigy_caso_entregado` | Hola Dr(a). {{1}}, su caso {{2}} fue entregado. Gracias por confiar en PRODIGY Lab Dental. | Ver recibo | Entregado |

Versión en inglés (`en`), mismos nombres:
- `prodigy_diseno_listo`: Hello Dr. {{1}}, the design for your case {{2}} is ready for review. You can approve it or request changes; 2 revisions are included.
- `prodigy_avance_caso`: Hello Dr. {{1}}, there is an update on your case {{2}}: {{3}}. We will keep you posted at every stage.
- `prodigy_reenviar_archivos`: Hello Dr. {{1}}, the files for your case {{2}} arrived incomplete or with a problem. Please resend them to continue.
- `prodigy_caso_entregado`: Hello Dr. {{1}}, your case {{2}} was delivered. Thank you for trusting PRODIGY Lab Dental.

Ejemplos para la revisión de Meta: {{1}} = `Laura`, {{2}} = `PROD-91C04E`, {{3}} = `empezó el fresado`.

## Después (fase 2, no hecho)

- Confirmación automática al doctor apenas crea un pedido (`pedido_recibido`): se dispara sin sesión, así que
  debe buscar el número en la base, enviar una sola vez por pedido y solo si el pedido tiene minutos de creado.
- Pasar los avisos al equipo (`notify-staff`) de CallMeBot a la API oficial.
- Alejandro CAD/CAM: mismo patrón con su propio número y plantillas (marca distinta).
