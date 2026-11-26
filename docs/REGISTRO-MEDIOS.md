# Registro de medios: de dónde sale cada foto, video y música

Sirve para las dos webs (prodigylabdental.com y alejandrocadcam.com). Antes de publicar una foto o un video
nuevo, anótalo aquí: origen, permiso y crédito. Si no se sabe el origen, no se publica.

Última revisión: 25-nov-2026.

## Propios (sin riesgo)

| Qué | Dónde | Permiso |
|---|---|---|
| Fotos de banco del laboratorio (coronas, carillas, barras, guías, piezas fresadas) | `assets/trabajos/*` (ambas webs) | Propias |
| Videos del laboratorio | `assets/videos/*`, `assets/links-gallery/*` | Propios (ver «Música» abajo) |
| Catálogo y antes/después de /servicios | `assets/catalogo/*` (PRODIGY) | Propios |
| Casos del portafolio | Supabase Storage `portafolio/` | Casos reales. 3 portadas muestran la cara del paciente: Alejandro decidió publicarlas así el 18-nov-2026. Debe haber un consentimiento escrito del paciente (Ley 1581), guardado fuera del repo. |
| Imágenes para compartir (og:image) | `assets/og-*.jpg` | Hechas con `tools/og-generar.mjs` a partir de fotos propias o del portafolio |
| Retrato de Alejandro en un congreso | `assets/alejandro-carvajal.jpg/.webp` (ambas) | Si la tomó el fotógrafo del evento, conviene tener su permiso por escrito (un mensaje basta) |

## Bancos de fotos libres

| Foto | Autor | Licencia | Dónde se usa |
|---|---|---|---|
| `assets/alineadores/alineadores-en-las-manos-*` | Laura Villela, Pexels | Pexels: uso comercial libre, sin atribución obligatoria (se acredita igual en el pie) | /alineadores-cad (PRODIGY) |
| `assets/alineadores/alineador-pulido-*` | Helia Ghaharian, Pexels | Pexels | /alineadores-cad |
| `assets/alineadores/alineador-colocacion-*` | Arvind Philomin, Pexels | Pexels | /alineadores (Alejandro) |
| `assets/alineadores/alineador-transparente-*` | Roberto Junior, Pexels | Pexels | Sin uso por ahora |
| Portadas de respaldo del blog por categoría (ia, materiales, equipo) | Unsplash, enlazadas (no descargadas) | Unsplash: uso comercial libre | `article.html` (ambas). Si el autor borra la foto, la portada desaparece. Pasó con «tecnologia» en Alejandro (404): el 25-nov se cambió por una foto propia. |

## Por confirmar ⚠

| Qué | Por qué |
|---|---|
| `assets/alineadores/alineador-fondo-*` (fondo del hero de /alineadores-cad, PRODIGY) | Sale de la antigua `Aligners-scaled.webp` de la web de Alejandro. Esa foto se retiró el 25-nov porque «parecía de banco con derechos», y después se volvió a usar como fondo, a pedido de Alejandro. Hay que confirmar de dónde salió. Si no es propia, se cambia por una de Pexels o por una foto del laboratorio. |
| `assets/aidite-Screenshot_*.webp` (PRODIGY, /escaneo-fotogrametria) | Capturas del software del escáner Aidite (material del fabricante). Confirmar con el distribuidor que se pueden usar en la web. |

## Música

`assets/links-gallery/barra-zircona.mp4` y `assets/links-gallery/lentes-ceramicos.mp4` tienen pista de audio
(volumen medio de −17 y −12 dB: casi seguro es música). Se ven en /links con controles, o sea con sonido.
Si la música salió de CapCut, Instagram o TikTok, esa licencia sirve para usarla dentro de esa app, no en la
web. Hay dos salidas: cambiarla por música libre (YouTube Audio Library o Pixabay Music, anotando el tema
aquí) o quitar el audio (`ffmpeg -i in.mp4 -c:v copy -an out.mp4`). Los demás videos no tienen audio.

## Cómo preparar una foto o un video nuevo

- Fotos: WebP de 800 y 1600 px de ancho, con `width` y `height` en la `<img>` (evitan que la página salte al cargar).
- Videos: 540 px de ancho, menos de 1 MB si dura menos de 20 s, H.264 con `+faststart`, `muted` y `poster`.
  Si se recomprime uno que ya está publicado, súbele el `?v=` en todas las páginas que lo usan (los
  `/assets/*` se guardan en caché como inmutables por un año).
