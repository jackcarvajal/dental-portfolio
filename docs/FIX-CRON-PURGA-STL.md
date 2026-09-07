# FIX — GitHub Action "Purga STL Storage Semanal" (fallaba cada semana)

> Diagnóstico 2026-09-07. El workflow `.github/workflows/purga-stl-semanal.yml` llama a
> `https://prodigylabdental.com/api/purgar-stl-storage` (borra STL reales de Storage de pedidos
> entregados hace +30 días). Fallaba con **exit 1** en ~4-9s desde su creación.

## Causa raíz — 3 fallos independientes (los 3 hay que arreglarlos)

1. **Faltan env vars en Cloudflare Pages** → la Function responde `{"error":"No configurado"}` **500**
   a *cualquier* request (verificado en vivo: `curl` a la ruta desde IP normal da 500).
   `functions/api/purgar-stl-storage.js` línea 81 exige `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `CRON_SECRET`.
2. **Secret `CRON_SECRET` de GitHub vacío** → `gh secret list` no lo lista. El curl manda `Bearer ` (vacío).
3. **Cloudflare Managed Challenge** a las IPs de datacenter de GitHub → devuelve **403** con la página
   `Just a moment…` ANTES de llegar a la Function (verificado en el log del run 34026824896).
   Desde una IP residencial NO pasa el challenge → por eso la ruta responde a mano pero no al runner.

## Solución — 3 pasos de config (el código del repo ya quedó endurecido y auto-diagnosticante)

### 1. Cloudflare Pages → env vars  (arregla el 500)
Dashboard → Pages → **Prodigy App** → Settings → Environment variables → **Production** (y Preview):
- `SUPABASE_URL` = `https://zgihrwqfyvgyapbwzkvw.supabase.co`
- `SUPABASE_SERVICE_KEY` = *(service_role key del proyecto — Supabase → Settings → API)*
- `CRON_SECRET` = *(un string aleatorio; genera con `openssl rand -hex 24`)* — **anótalo, va igual en el paso 2**

Redeploy tras guardarlas (Deployments → Retry deployment, o un push).

### 2. GitHub → secret `CRON_SECRET`  (arregla el vacío)
Repo → Settings → Secrets and variables → Actions → New repository secret:
- Name: `CRON_SECRET`
- Value: **el MISMO string** que pusiste en Cloudflare (paso 1). Deben ser idénticos byte a byte.

### 3. Cloudflare → WAF Custom Rule "Skip"  (arregla el 403 challenge)
Dashboard → prodigylabdental.com → Security → WAF → **Custom rules** → Create rule:
- **When**: `URI Path` `equals` `/api/purgar-stl-storage`
  *(opcional endurecer: AND `Request Header "Authorization"` `contains` `Bearer `)*
- **Then**: **Skip** → marca *Super Bot Fight Mode*, *Managed challenge* y *All remaining custom rules*.
- Deploy.

La seguridad NO se debilita: el endpoint sigue exigiendo el bearer `CRON_SECRET` (línea 86 del .js);
el WAF sólo deja de dar el challenge a esa ruta puntual.

## Verificar
GitHub → Actions → "Purga STL Storage Semanal" → **Run workflow** (workflow_dispatch).
Debe dar `Status: 200` y `{"purgados":N,"errores":0,"total":N}`. Si falla, el `::error::` ahora dice
exactamente cuál de los 3 fallos quedó (challenge / env vars / secret).

## Nota arquitectónica (futuro, opcional)
La lógica de purga sólo habla con Supabase (Storage DELETE + REST) — no necesita Cloudflare. El hogar
"correcto" sería una Supabase Edge Function `purga-stl` disparada por `pg_cron` (todo dentro de
Supabase, sin GitHub Actions ni challenge). Refactor mayor; no urge si los 3 pasos de arriba dejan
verde el workflow.
