# SECURITY — PRODIGY Lab Dental (prodigylabdental.com)

Postura de seguridad y resistencia post-cuántica · Security posture & post-quantum readiness
Última auditoría de código / Last code audit: **2026-09-19** (Claude Opus 4.8, análisis estático).

---

## 🇪🇸 Resumen (Español)

Arquitectura: sitio estático en **Cloudflare Pages** + **Cloudflare Functions** (serverless) + **Supabase** (Postgres/PostgREST/RLS/Auth). Sin servidor propio.

### Resultado de la auditoría — TODO PASA
| Control | Estado | Detalle |
|---|---|---|
| Secretos en cliente | ✅ | Ninguno. La llave `service_role` solo vive en `functions/api/*` leída de env vars (`env.SUPABASE_SERVICE_KEY`). El cliente usa solo la anon key pública (`"role":"anon"`). |
| CORS | ✅ | Validado contra allowlist por origen; sin wildcard abierto en endpoints con datos. |
| Autorización de roles | ✅ | Por **email allowlist / `app_metadata`**, nunca `user_metadata` (user-controlled). Hay smoke-test que lo verifica. |
| XSS | ✅ | `escH()`/`esc()` o `textContent` para datos de Supabase/externos en innerHTML. Ventana de impresión escapa con `esc()`. |
| `eval` / `new Function` | ✅ | No en código propio (solo en dependencias auditadas). |
| Cabeceras | ✅ | CSP estricta, HSTS `max-age=63072000; includeSubDomains; preload`, X-Frame-Options, nosniff, Referrer-Policy, COOP. |
| Aislamiento por negocio | ✅ | Consultas filtran `negocio` en las 5 tablas compartidas con Alejandro CAD/CAM. |

### Resistencia cuántica
- La cripto vulnerable a cuántica (Shor sobre RSA/ECDSA) es la del **handshake TLS**, gestionada por **Cloudflare**, no por este código.
- **Cloudflare ya despliega intercambio de llaves híbrido post-cuántico** (X25519 + **ML-KEM/Kyber**, estándar NIST) en su edge. Los visitantes con navegador moderno ya obtienen protección post-cuántica **automáticamente**.
- Este código **no implementa cripto asimétrica propia**. Aleatoriedad segura (`crypto.getRandomValues`) para IDs/nonces; `Math.random` solo para animaciones/UI.
- Simétrico/hashes (AES-256, SHA-2) siguen siendo cuántico-resistentes con longitudes adecuadas.

### Pendiente (config, no código)
- Cloudflare Dashboard → SSL/TLS: confirmar **TLS 1.3 mínimo** y opción **Post-Quantum** activa.
- Mantener el dominio en la lista **HSTS preload**.

---

## 🇬🇧 Summary (English, technical)

Architecture: static site on **Cloudflare Pages** + **Cloudflare Functions** (edge serverless) + **Supabase** (Postgres/PostgREST/RLS/Auth). No self-managed origin server.

### Threat model
Primary assets: doctor/lab PII and case files (STL), order/payment state. Trust boundaries: browser↔Cloudflare (TLS, Cloudflare-managed), Cloudflare Functions↔Supabase (service-role, env-injected), browser↔Supabase (anon key + RLS). Client is untrusted; all privileged mutations go through Functions or RLS-guarded RPCs.

### Findings — all PASS (static analysis, 2026-09-19)
- **Secret management**: no secrets in client bundles. `service_role` key referenced exclusively as `env.SUPABASE_SERVICE_KEY` inside `functions/api/*` (server-side). Client uses the public anon JWT (`role: anon`).
- **CORS**: Functions echo the request origin only when it matches an allowlist (or `*.pages.dev`), else fall back to the canonical origin — no reflected-origin-with-credentials wildcard on data endpoints.
- **AuthZ**: staff role decisions use a hardcoded email allowlist / `app_metadata`; `user_metadata` is treated as user-controlled and used for display only. A smoke test asserts `user_metadata` is never used for role logic.
- **XSS**: DB/external data is HTML-escaped (`escH()`/`esc()`) or set via `textContent` before entering `innerHTML`. The print-window `document.write` path escapes field values via `esc()`; only static titles/CSS are unescaped.
- **Dynamic code exec**: no `eval`/`new Function`/`document.write` into the main document in first-party code.
- **Transport**: HSTS (2y, `includeSubDomains; preload`), strict CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`.

### Post-quantum posture
- Quantum-relevant asymmetric crypto (Shor vs RSA/ECDSA) lives in the **TLS handshake**, terminated by **Cloudflare**, not in this repository.
- Cloudflare's edge already negotiates **hybrid post-quantum key exchange** (X25519 + **ML-KEM/Kyber**, NIST FIPS 203) with PQC-capable clients — automatic, no code change.
- First-party code implements **no bespoke asymmetric cryptography**. CSPRNG (`crypto.getRandomValues`) is used for identifiers/nonces; `Math.random` is confined to non-security UI (particles, shuffles, DOM ids).
- Symmetric primitives / hashes (AES-256, SHA-2 family) remain quantum-resistant at deployed key sizes (Grover only halves effective strength).

### Recommended config actions (dashboard, not code)
- Cloudflare SSL/TLS → set **minimum TLS 1.3**; confirm **Post-Quantum** key agreement enabled for the zone.
- Keep the apex domain enrolled in **HSTS preload** (hstspreload.org).

### Reporting a vulnerability
Email **gerencia@prodigylabdental.com** with steps to reproduce. Please do not open public issues for security-sensitive reports. No live exploitation of production without written authorization.

---

*Nota / Note:* auditoría a nivel de **código** (SAST). No sustituye un pentest dinámico autorizado (DAST) ni un pentest de infraestructura Cloudflare/Supabase. / Code-level (SAST) audit; does not replace an authorized dynamic pentest (DAST) or a Cloudflare/Supabase infrastructure assessment.
