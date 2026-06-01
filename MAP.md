# MAP — PRODIGY Arquitectura de Referencia
> Para uso interno de Claude. Actualizar cuando cambie una función crítica.
> Última actualización: 2026-05-28

---

## JS GLOBALES

### js/header.js
| Función / Sección | Línea |
|-------------------|-------|
| Topbar HTML `topbarHtml =` | 456 |
| Navbar HTML `navHtml =` | 485 |
| Botón IA desktop `pnav2-ia-btn` | 557 |
| Botón hamburguesa `pnav2-ham` | 490 |
| Menú móvil `pnav2-mob` | 590 |
| `document.body.insertAdjacentHTML` — inyección DOM | 684 |
| `initUrgencia()` — widget horario | 699 |
| `_phdrCtaToggle()` — botón HAZ TU PEDIDO | 819 |
| `_pgBuildPrompt()` — system prompt chatbot | 846 |
| `_phdrToggleIA()` — abrir/cerrar chatbot | 883 |
| `_phdrLogin()` — mini-login topbar | 1026 |
| initUrgencia() — widget horario | 699 |

### js/footer.js
| Función / Sección | Línea |
|-------------------|-------|
| Footer HTML completo (`footer.innerHTML =`) | 116 |
| `_loadScript()` — lazy loader | 208 |
| Carga utm-tracker, conversions, geo-detect, content-protection | 213–216 |
| Cookie consent banner (SIC/GDPR) | 267 |

### js/auth-guard.js
| Función / Sección | Línea |
|-------------------|-------|
| `SUPABASE_URL` / `SUPABASE_ANON` | 14–15 |
| `ADMIN_EMAILS` (hardcoded) | 16 |
| `DEST_MAP` — roles → panel URLs | 18–30 |
| `getRole(user)` — admin por email, staff por app_metadata | 32–49 |
| `require(neededRole, loginUrl)` — verifica sesión y rol | 60–79 |
| `signOut()` | 81–84 |

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
| Cache version | `prodigy-v26` (línea 2) |
| PRECACHE array | línea 5–37 (incluye /flujo-diseno/fresado/impresion/lab) |
| NEVER_CACHE array | línea 40–51 |

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
| `_casoToast()` — toast no bloqueante | 174 |
| `_safeUrl()` — valida https:// en media | 216 |
| `render()` — renderiza caso completo | 237 |
| `cargarRelacionados()` | 369 |
| `loadExocadBlob()` — visor Exocad | 407 |
| `cargarNotas()` — carga comentarios | 441 |
| `eliminarNota()` — admin delete | 497 |
| `fijarNota()` — admin pin | 504 |
| `publicarNota()` — enviar comentario | 481 |
| Lightbox HTML | 142 |

### journal.html
| Sección | Línea |
|---------|-------|
| Filter buttons (12 categorías) | 795 |
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
| Total artículos | 41 (crece con auto-journal — martes+jueves) |
| `ARTICLES` array | línea 7 |
| `getArticle(id)` | línea 2568 |
| `getRelacionados()` | línea 2578 |
| `CATEGORY_COVERS` | línea 2589 |
| `getArticleCover()` | línea 2602 |
| Covers SVG | `assets/journal/cover-{cat}.svg` |

---

## PORTAL /app/

### app/admin-panel.html
| Función / Sección | Línea aprox. |
|-------------------|--------------|
| `switchTab()` — navegación tabs + auto-refresh Torre | 972 |
| `cargarPedidos()` — tab Pedidos | 1000 |
| `filtrarPedidos()` — filtro estado + búsqueda texto | 1220 |
| `cambiarEstado()` — abre modal-despacho si Despachado | 1120 |
| `abrirModalDespacho/cerrar/confirmar` — guía sin prompt | 1084 |
| `resolverIncidencia()` — abre modal-resolver | 2043 |
| `abrirModalResolver/cerrar/confirmarResolverIncidencia` | 1100 |
| `eliminarCaso()` — abre modal-confirm-del | 1540 |
| `cargarPortafolio()` — grid portafolio | ~1390 |
| `toggleVisibleCaso()` — publicar/ocultar | ~1465 |
| `cargarClientes()` — ranking CLV + WA | 1475 |
| `cargarDespachos()` — gestión flota | 1585 |
| `cargarTorre()` — torre de control + incidencias | 1925 |
| `cargarAnalytics()` — Radar de Ventas | 830 |
| `generarFichaPDF()` — jsPDF + QR | ~1750 |
| ADMIN_EMAILS constante | ~50 |

### app/operario-diseno.html
| Función / Sección | Línea aprox. |
|-------------------|--------------|
| `cargarCasos()` — carga kanban diseño | 344 |
| `renderKanban()` — render 4 columnas | 363 |
| `cardHTML()` — tarjeta con drag | 389 |
| `avanzar()` — cambio de estado | 456 |
| `abrirQA()` — modal QA 7 ítems | 500 |
| `enviarQA()` — aprobar/rechazar diseño | ~555 |
| `notifWA()` — WA notifications | 591 |
| `_COL_STATE` / drag & drop | 605 |
| Realtime channel 'diseno-casos' | 338 |

### app/panel-interno-operaciones.html
| Función / Sección | Línea |
|-------------------|-------|
| Variables `videoFile`, `pdfFile` | 1056–1057 |
| Formulario nuevo caso | 307 |
| `subirCaso()` — upload completo | 1089 |
| `cargarPortafolio()` — carga grid admin | 1194 |
| Modal edición HTML | 647 |
| `guardarEdicion()` | 1330 |
| `abrirModalFabConfirm()` — modal genérico confirm callback | ~2644 |
| `marcarPagoRecibido()` — usa modal-fab-confirm | ~2583 |
| `enrutarAFabricacion()` / `_doEnrutar()` — usa modal-fab-confirm | ~2596 |
| `abrirModalNuevoStaff()` — modal-nuevo-staff sin prompt | ~2660 |
| `eliminarCasoConfirm()` / `confirmarDelCaso()` — modal-del-caso | ~2685 |

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
- 68 URLs indexadas
- Incluye: todas las páginas públicas + 41 artículos + 3 calculadoras
- Excluye: /app/*, /patient, /caso

### scripts/auto-journal.js — Pipeline artículos IA
| Item | Valor |
|------|-------|
| `TOPIC_POOL` | 34 temas (línea 26) |
| `pickTopics()` | Aleatorio, evita últimos 6 slugs |
| `buildPrompt()` | Prompt científico con journals indexados |
| `callGemini()` | temperature: 0.15, gemini-2.0-flash |
| Salida | prepende 2 objetos a `articles.js` |
| Sitemap | auto-actualiza `sitemap.xml` |
| Cron | Martes + jueves 14:00 UTC (9 AM Bogotá) |
| Secret requerido | `GEMINI_API_KEY` en GitHub Secrets |
| Artifact | `marketing-social.txt` (30 días) |

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
SW_VERSION   = 'prodigy-v26'
FOOTER_VER   = 'v=20260528'
ADMIN_EMAILS = ['jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com']
```
