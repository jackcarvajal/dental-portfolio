# MAP — PRODIGY Arquitectura de Referencia
> Para uso interno de Claude. Actualizar cuando cambie una función crítica.
> Última actualización: 2026-05-05

---

## JS GLOBALES

### js/header.js
| Función / Sección | Línea |
|-------------------|-------|
| Topbar HTML | 357 |
| Navbar HTML | 386 |
| Mobile nav HTML | 486 |
| `initUrgencia()` — widget horario | 592 |
| `_phdrCtaToggle()` — botón HAZ TU PEDIDO | 725 |
| `_phdrToggleIA()` — abrir/cerrar chatbot | 789 |
| `_phdrLogin()` — mini-login topbar | 890 |

### js/footer.js
| Función / Sección | Línea |
|-------------------|-------|
| Footer HTML completo | 116 |
| `_loadScript()` + carga GSAP/protección | 208 |
| Cookie consent banner | 227 |

### js/animations.js
| Función / Sección | Línea |
|-------------------|-------|
| `initGSAP()` — registro ScrollTrigger | 9 |
| reveal() — helper genérico scroll | 17 |
| Portafolio index stagger | 33 |
| Portafolio página stagger | 47 |
| Flujos de pasos | 58 |
| caso.html animaciones | 68 |

### js/content-protection.js
| Protección | Línea |
|-----------|-------|
| Clic derecho en contenido | 10 |
| Teclas (F12, Ctrl+S/U/P) | 22 |
| Arrastre de imágenes | 43 |
| CSS overlay + no-drag | 50 |

### sw.js
| Item | Valor |
|------|-------|
| Cache version | `prodigy-v15` (línea 2) |
| PRECACHE array | línea 5–31 |
| NEVER_CACHE array | línea 34–44 |

---

## PÁGINAS PÚBLICAS

### index.html
| Sección | Línea |
|---------|-------|
| Portafolio dinámico `#portfolio` | 548 |
| `loadPortIndex()` — fetch Supabase | 1617 |
| Ecosistema `#tech-ecosystem` | 2354 |
| CSS animaciones eco-cards | 2360 |

### portafolio.html
| Función | Línea |
|---------|-------|
| `init()` — carga desde Supabase | 781 |
| Query Supabase casos_portafolio | 790 |
| `renderCases()` | 675 |
| `renderPage()` — paginación | 680 |
| `filtrar()` — filtro por tipo | 767 |
| `filtrarMat()` — filtro por material | 774 |

### caso.html
| Función | Línea |
|---------|-------|
| `render()` — renderiza caso completo | 199 |
| `cargarRelacionados()` | 309 |
| `loadExocadBlob()` — visor Exocad | 337 |
| `cargarNotas()` — carga comentarios | 370 |
| `publicarNota()` — enviar comentario | 410 |
| `eliminarNota()` — admin delete | ~395 |
| `fijarNota()` — admin pin | ~402 |
| Lightbox HTML | 142 |

### journal.html
| Sección | Línea |
|---------|-------|
| Filter buttons (8 categorías) | 795 |
| `renderAll()` — render tarjetas | 820 |
| `filterArticles()` con alias | 847 |

### article.html
| Sección | Línea |
|---------|-------|
| og:image meta dinámico | 15 |
| `init()` — carga artículo | ~385 |
| CAT_IMGS fallback Unsplash | 432 |
| Navegación prev/next `#art-nav` | ~507 |

### articles.js
| Item | Valor |
|------|-------|
| Total artículos | 35 |
| `ARTICLES` array | línea 7 |
| `getArticle(id)` | línea 2223 |
| `getRelacionados()` | línea 2233 |
| `CATEGORY_COVERS` | línea 2244 |
| `getArticleCover()` | línea 2257 |
| Covers SVG | `assets/journal/cover-{cat}.svg` |

---

## PORTAL /app/

### app/panel-interno-operaciones.html
| Función / Sección | Línea |
|-------------------|-------|
| Variables `videoFile`, `pdfFile` | 1056–1057 |
| Formulario nuevo caso | 307 |
| `subirCaso()` — upload completo | 1089 |
| `cargarPortafolio()` — carga grid admin | 1194 |
| Modal edición HTML | 647 |
| `guardarEdicion()` | 1330 |

### app/login.html
| Función | Línea |
|---------|-------|
| `params` URL parsing + mode=register | 609 |
| Pre-llenado desde topbar (tb_email) | 617 |
| `redirectByRole()` | 621 |
| `switchMain()` — tabs login/registro | 653 |

---

## INFRAESTRUCTURA

### _redirects
| Regla clave | Línea |
|-------------|-------|
| Bloqueo archivos sensibles | 8–27 |
| Redirect contacto → nosotros#contacto | 58 |
| `/app/*` rewrite 200 | 84 |

### _headers
| Sección | Línea |
|---------|-------|
| Cache-Control app/*.html (no-store) | ~17 |
| CSP completa | ~10 |
| HSTS, X-Frame, nosniff | ~30 |

### sitemap.xml
- 57 URLs indexadas
- Incluye: todas las páginas públicas + 35 artículos + 2 calculadoras
- Excluye: /app/*, /flujo-*, /patient, /caso

---

## SUPABASE

### Tablas principales
| Tabla | Uso |
|-------|-----|
| `casos_portafolio` | Casos del portafolio público |
| `feedback_casos` | Comentarios en caso.html |
| `pedidos_doctor` | Pedidos del portal de doctores |
| `doctores_perfil` | Perfil de doctores registrados |
| `citas_domicilio` | Agendamiento escaneos |
| `solicitudes_scanner` | Leads desde envia-tu-scanner |
| `leads_doctores` | Leads de landing pages |

### Buckets Storage
| Bucket | Visibilidad | Uso |
|--------|-------------|-----|
| `portafolio` | Public | Imágenes casos portafolio |
| `casos` | Private | Archivos de pedidos |
| `scanner-uploads` | Private | STL subidos por doctores |
| `evidencias-entrega` | Private | Fotos de entrega |

### Constantes (en múltiples archivos)
```
SUPABASE_URL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co'
PORT_BUCKET  = 'portafolio'
SW_VERSION   = 'prodigy-v15'
FOOTER_VER   = 'v=20260505'
ADMIN_EMAILS = ['jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com']
```
