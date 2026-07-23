# GUÍA — Auditoría web app / e-commerce

Leer solo al hacer una auditoría completa del sitio o al crear página con FAQ/schema.

## 404.html — obligatorio en AMBOS proyectos
```html
<meta name="robots" content="noindex">
<!-- CTA principal + auto-redirect 10s + skip link + SW register -->
```
Copiar patrón mínimo de 404.html PRODIGY.

## Schema.org — tipos por contexto
| Página | Tipo obligatorio |
|---|---|
| Home personal | `Person` + `Service` |
| Servicio/landing | `Service` + `BreadcrumbList` |
| Página con FAQ accordion | + `FAQPage` (mainEntity con Q/A) |
| Contacto/soporte | `ContactPage` |
| Cotizador/calculator | `Service` + `BreadcrumbList` |

Regla: siempre que exista un `<details>`/acordeón de FAQ visible → agregar FAQPage schema (Google lo muestra como rich result).

## hreflang — páginas con tráfico internacional
```html
<link rel="alternate" hreflang="es" href="https://[dominio]/[slug]">
<link rel="alternate" hreflang="en" href="https://[dominio]/[slug]?lang=en">
<link rel="alternate" hreflang="x-default" href="https://[dominio]/[slug]">
```
Obligatorio en: index, servicios principales, calculadoras, portafolio.

## dns-prefetch — fallback para preconnect
```html
<link rel="preconnect" href="https://dominio.com">
<link rel="dns-prefetch" href="https://dominio.com">
```
