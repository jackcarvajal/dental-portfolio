# PRODIGY — Estándares UX: Tipografía, Contraste y Legibilidad

> Checklist obligatorio para toda página nueva o existente.
> Mínimo = lo que no puede faltar. Óptimo = lo que separa un sitio profesional. Excelencia = top 5%.

---

## 1. FUENTE

| Nivel | Estándar |
|---|---|
| **Mínimo** | Una sola familia sans-serif en toda la página. Nunca mezclar serif + sans en el mismo párrafo. |
| **Óptimo** | `Inter` como fuente principal (igual que el homepage). Cargada desde Google Fonts con `display=swap`. |
| **Excelencia** | `Inter` + `preconnect` a `fonts.googleapis.com` y `fonts.gstatic.com` para carga sin bloqueo. Variable weight `400;600;700;800;900`. |

**Regla de oro:** Todas las páginas deben usar `font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.

---

## 2. TAMAÑOS DE FUENTE

| Uso | Mínimo | Óptimo | Prohibido |
|---|---|---|---|
| Cuerpo / párrafo | `1rem` (16px) | `1rem` con `line-height: 1.7` | < `0.9rem` en cuerpo |
| Descripción de card | `0.92rem` | `1rem` | < `0.85rem` |
| Label / etiqueta | `0.85rem` | `0.9rem` | < `0.8rem` si es texto legible |
| Badge / chip decorativo | `0.75rem` | `0.8rem` | < `0.7rem` |
| Footnote / caption de imagen | `0.82rem` | `0.85rem` | < `0.75rem` |
| Título de card (h3) | `1rem` | `1.1rem` | — |
| Título de sección (h2) | `clamp(1.4rem, 3vw, 2rem)` | `clamp(1.6rem, 4vw, 2.4rem)` | < `1.2rem` |
| Título de página (h1) | `clamp(1.8rem, 4vw, 2.8rem)` | `clamp(2rem, 5vw, 3.5rem)` | < `1.6rem` |

**Regla:** Nunca usar `font-size` menor a `0.75rem` en texto que el usuario deba leer. Los badges/chips < `0.75rem` solo si son puramente decorativos (iconos + 1-2 palabras en uppercase).

---

## 3. CONTRASTE DE COLOR (WCAG AA)

| Tipo de texto | Color mínimo sobre fondo `#050505` | Óptimo | Prohibido |
|---|---|---|---|
| Texto principal | `#e2e8f0` (contraste ~14:1) | `#f0f0f5` | — |
| Texto secundario | `#94a3b8` (contraste ~5.2:1) | `#b0b0b8` | < `#94a3b8` |
| Texto de descripción card | `#a8b4c0` | `#b8bcc8` | `#8b99a8`, `#86868b` |
| Placeholder de input | `rgba(255,255,255,0.4)` | `rgba(255,255,255,0.5)` | < 0.35 opacity |
| Texto sobre fondo card `#0d1520` | `#94a3b8` mínimo | `#b0b0b8` | `#666`, `#777`, `#888` |

**Valores PROHIBIDOS en texto sobre fondos oscuros:**
- `#666`, `#777`, `#888`, `#86868b`, `#8b99a8` → reemplazar por `#94a3b8` mínimo
- `rgba(255,255,255,0.3)` o menor → elevar a `rgba(255,255,255,0.5)`
- `#475569`, `#64748b` → solo aceptable si está sobre fondo claro, jamás sobre dark bg

**Herramienta de verificación:** https://webaim.org/resources/contrastchecker/

---

## 4. LINE-HEIGHT (Interlineado)

| Uso | Mínimo | Óptimo |
|---|---|---|
| Párrafo cuerpo | `1.6` | `1.7` |
| Descripción de card | `1.55` | `1.65` |
| Título (h1/h2/h3) | `1.1` | `1.15` |
| Caption / footnote | `1.4` | `1.5` |

**Nunca** `line-height < 1.4` en texto de más de 1 línea.

---

## 5. JERARQUÍA VISUAL EN CARDS/CAJONES

| Elemento | Regla |
|---|---|
| **Ícono o emoji** | `1.5rem`–`2rem`. Siempre con `margin-bottom: 10px–16px`. |
| **Título de card (h3)** | Bold `700`, color claro `#e2e8f0`–`#f0f0f5`, `1rem`–`1.15rem`. |
| **Descripción (p)** | Regular `400`, color `#94a3b8`–`#b8bcc8`, `0.92rem`–`1rem`. |
| **Separación** | `margin-bottom` entre título y descripción: `6px`–`10px`. |
| **Padding interno** | Mínimo `20px`. Óptimo `24px`–`32px`. |
| **Border-radius** | Mínimo `12px`. Óptimo `16px`–`20px`. |

**Regla de oro:** Un usuario que vea la card por 2 segundos debe entender qué hace y por qué le importa.

---

## 6. GRID DE CARDS

| Nivel | Estándar |
|---|---|
| **Mínimo** | `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))` |
| **Óptimo** | `minmax(240px, 1fr)` con `gap: 16px`–`24px` |
| **Excelencia** | Responsive: 4 col desktop → 2 col tablet → 1 col móvil, con scroll snap en móvil |

---

## 7. INPUTS Y FORMULARIOS

| Elemento | Mínimo | Óptimo |
|---|---|---|
| Padding interno | `12px 16px` | `14px 18px` |
| Font-size | `1rem` | `1rem`–`1.05rem` |
| Color de texto | `#fff` o `#e2e8f0` | `#f0f0f5` |
| Border visible | `1px solid rgba(255,255,255,0.15)` | `2px solid rgba(255,215,0,0.25)` |
| Placeholder | `rgba(255,255,255,0.4)` | `rgba(255,255,255,0.5)` |
| Label | `0.88rem` bold, color `#b0b0b8` | `0.9rem` bold, `#c0c0c8` |
| Border-radius | `10px` | `12px`–`14px` |
| Focus ring | `outline: 2px solid #D946A6` | outline + `box-shadow: 0 0 0 3px rgba(217,70,166,0.2)` |

---

## 8. BOTONES

| Tipo | Padding | Font-size | Font-weight | Border-radius |
|---|---|---|---|---|
| CTA principal | `14px 32px` | `1rem` | `700`–`800` | `50px` (pill) |
| Secundario | `12px 24px` | `0.95rem` | `700` | `50px` |
| Ghost | `11px 22px` | `0.9rem` | `600` | `50px` |
| Dentro de card | `10px 20px` | `0.88rem` | `700` | `30px` |

---

## 9. CHECKLIST PÁGINA NUEVA (obligatorio antes de publicar)

```
□ Font-family: Inter cargada con preconnect
□ Todos los párrafos cuerpo ≥ 1rem, line-height ≥ 1.6
□ Todas las descripciones de card ≥ 0.92rem
□ Todos los badges/chips ≥ 0.75rem
□ Colores de texto secundario ≥ #94a3b8 sobre fondos oscuros
□ Ningún texto usa: #666, #777, #86868b, #8b99a8
□ Inputs con padding ≥ 12px y font-size ≥ 1rem
□ Botón CTA visible, pill (border-radius: 50px), padding ≥ 14px
□ Cards con padding ≥ 20px y border-radius ≥ 12px
□ Jerarquía clara: h3 > p, diferencia de color y tamaño notable
□ Verificado en: Chrome desktop + Chrome móvil (375px)
```

---

## 10. ERRORES FRECUENTES A EVITAR

| Error | Correcto |
|---|---|
| `font-size: .7rem` en descripción | `font-size: .92rem` mínimo |
| `color: #666` sobre fondo oscuro | `color: #94a3b8` |
| `color: rgba(255,255,255,0.2)` en texto | `rgba(255,255,255,0.6)` mínimo |
| Mezclar Poppins + Inter en misma página | Solo Inter |
| `line-height: 1.2` en párrafo | `line-height: 1.65` |
| Card sin padding | `padding: 24px` mínimo |
| Texto bloque >60 chars sin max-width | `max-width: 65ch` en párrafos largos |
| Font-weight 400 en títulos de card | `font-weight: 700` mínimo |

---

*Última actualización: 2026-04-25 | Basado en auditoría PRODIGY round 4*
