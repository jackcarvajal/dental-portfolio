# PRODIGY SaaS — Roadmap para vender a otros labs

## Visión del producto
**"El sistema operativo digital para laboratorios CAD/CAM en Colombia y LATAM"**

Software de gestión dental SaaS que reemplaza WhatsApp + Excel + Google Drive en labs digitales.

---

## Modelo de negocio elegido: White-label + SaaS híbrido

### Planes propuestos

| Plan | Precio/mes | Para quién |
|------|-----------|-----------|
| **Starter** | $149 USD | Lab 1 operario, <50 pedidos/mes |
| **Profesional** | $299 USD | Lab 3-5 operarios, <200 pedidos/mes |
| **Enterprise** | $599 USD | Red de labs, operarios ilimitados |
| **Setup fee** | $500 USD (único) | Configuración inicial + capacitación 4h |

### Proyección año 1
- Meta: 15 labs en Plan Profesional
- Ingresos: 15 × $299 × 12 = **$53.820 USD/año**
- + Setup fees: 15 × $500 = **$7.500 USD**
- **Total año 1: ~$61.000 USD**

---

## Fases de implementación técnica

### FASE 1 — Multi-tenant (4 semanas)
*Lo que hay que hacer en código:*

**1.1 Supabase — tabla de organizaciones**
```sql
CREATE TABLE organizations (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text UNIQUE NOT NULL,       -- prodigy, labdental-cali, etc.
  name        text NOT NULL,
  plan        text DEFAULT 'starter',
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  trial_ends  timestamptz,
  stripe_customer_id text,
  stripe_sub_id text
);

-- Agregar org_id a todas las tablas críticas
ALTER TABLE pedidos             ADD COLUMN org_id uuid REFERENCES organizations(id);
ALTER TABLE casos_portafolio    ADD COLUMN org_id uuid REFERENCES organizations(id);
ALTER TABLE logs_incidencias    ADD COLUMN org_id uuid REFERENCES organizations(id);
ALTER TABLE doctores_perfil     ADD COLUMN org_id uuid REFERENCES organizations(id);

-- RLS: cada org solo ve sus datos
CREATE POLICY "org_isolation" ON pedidos
  USING (org_id = (SELECT org_id FROM auth.users_orgs WHERE user_id = auth.uid()));
```

**1.2 Auth — vincular usuarios a organizaciones**
```sql
CREATE TABLE users_orgs (
  user_id  uuid REFERENCES auth.users(id),
  org_id   uuid REFERENCES organizations(id),
  role     text DEFAULT 'client',
  PRIMARY KEY (user_id, org_id)
);
```

**1.3 Edge Function — routing por org**
Cuando un lab configura su dominio (ej: `labcali.prodigy.app`), la función detecta el `org_id` por el subdominio y filtra todos los datos automáticamente.

---

### FASE 2 — Panel Global de Admin SaaS (2 semanas)
Nueva página `/superadmin/` (solo accesible desde emails PRODIGY):

| Feature | Descripción |
|---------|-------------|
| Dashboard de labs | Ver todos los orgs, plan, pedidos del mes |
| Gestión de suscripciones | Activar/suspender labs, cambiar plan |
| Métricas globales | Pedidos totales, ingresos, labs activos |
| Onboarding de nuevo lab | Wizard de 5 pasos |
| Soporte remoto | Ver los pedidos de cualquier lab (read-only) |

---

### FASE 3 — Onboarding automatizado (2 semanas)

**Flujo cuando un lab se registra:**
```
1. Llenan formulario en landing (nombre lab, NIT, ciudad, plan)
2. Stripe procesa pago del setup fee ($500 USD)
3. GitHub Action automático:
   - Crea org en Supabase
   - Crea usuario admin del lab
   - Envía email con credenciales
4. Lab recibe email: "Tu plataforma está lista en 15 minutos"
5. Entra al wizard de configuración:
   - Subir logo
   - Configurar precios
   - Conectar WhatsApp
   - Subir 3 casos al portafolio
6. Videollamada de capacitación 2h (incluida en setup fee)
```

---

### FASE 4 — Facturación SaaS (1 semana)

**Stripe integrado para cobrar suscripciones:**
- Stripe Billing para pagos recurrentes USD (tarjeta internacional)
- Wompi/PSE para labs Colombia que prefieren pago local
- Webhook de Stripe actualiza `organizations.plan` automáticamente
- Si lab no paga → acceso bloqueado pero datos preservados 30 días

---

### FASE 5 — Dominio personalizado por lab (1 semana)

Cada lab puede tener:
- `labcali.prodigysaas.com` (subdominio gratuito)
- `sistema.labdentalnorte.com` (dominio propio, $50/año extra)

Configurado via Cloudflare Multi-Domain Hosting.

---

## Stack tecnológico del SaaS

| Capa | Tecnología | Costo/mes |
|------|-----------|----------|
| Frontend | Vanilla JS (ya existe) | $0 |
| Hosting | Cloudflare Pages | $20/mes (Pro plan) |
| DB | Supabase Pro | $25/mes |
| Auth | Supabase Auth | incluido |
| Storage | Supabase Storage | $0.021/GB |
| Edge Functions | Cloudflare Workers | $5/mes |
| Pagos SaaS | Stripe | 2.9% + $0.30 |
| Email | Resend | $20/mes |
| **Total infraestructura** | | **~$75/mes** |

Con 15 labs pagando $299 = $4.485/mes → **margen: $4.410/mes (98%)**

---

## Go-to-market — Cómo conseguir los primeros 15 labs

### Canales prioritarios

**1. Labs existentes que conoces (primeros 3 en 30 días)**
- Contactar directamente labs en Bogotá que ya tienen CBCT
- Oferta: "3 meses gratis a cambio de testimonio en video"
- Convertir a pago desde mes 4

**2. Grupos de WhatsApp de odontología**
- 5 grupos activos de odontólogos en Colombia tienen 200-500 miembros
- Publicar caso de éxito con métricas reales (tiempo ahorrado, pedidos procesados)

**3. Distribuidores de equipos CAD/CAM**
- XTCERA, Amann Girrbach, Roland DGA tienen reps en Colombia
- Propuesta: "Ofrécelo como software incluido con tu equipo"
- Comisión: 20% del primer año para el distribuidor

**4. TikTok @prodigylabdental**
- Video: "Cómo proceso 50 pedidos/mes sin WhatsApp ni Excel"
- 3 videos → 1 lead de lab interesado → 1 cliente

**5. Congreso de Odontología Colombia (septiembre)**
- Stand o presentación en CNDOL o eventos similares
- Demo en vivo del sistema

---

## Lo que differencia del competidor más cercano

| Feature | PRODIGY SaaS | Dental Wings | easyDental | Excel+WhatsApp |
|---------|-------------|-------------|-----------|----------------|
| Precio/mes | $149-599 USD | $500-1.500 USD | $200-400 USD | $0 |
| Portal cliente | ✅ | ❌ | ❌ | ❌ |
| Facturación DIAN | ✅ | ❌ | ✅ (parcial) | ❌ |
| WhatsApp automático | ✅ | ❌ | ❌ | Manual |
| Blog con IA | ✅ | ❌ | ❌ | ❌ |
| Español Colombia | ✅ nativo | Traducido | ✅ | N/A |
| PWA móvil | ✅ | ❌ | ❌ | N/A |

---

## Timeline resumen

```
MES 1: Multi-tenant + Panel superadmin
MES 2: Onboarding automatizado + Stripe billing
MES 3: Landing de producto + 3 labs piloto gratis
MES 4: Primera cohorte de pago (5 labs)
MES 5-6: Iteración con feedback + TikTok
MES 7-8: 15 labs pagando
MES 12: 40 labs → $72.000 USD ARR
```

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Lab cancela tras primer mes | Contrato mínimo 6 meses |
| Competidor copia el producto | Datos históricos del lab = moat, no se pueden copiar |
| Supabase sube precios | Arquitectura agnóstica, migrable a PlanetScale/Neon |
| Lab no sabe usar el sistema | Capacitación incluida + videos en YouTube |
| Hack de datos de un lab | Multi-tenant con RLS strict — datos completamente aislados |
