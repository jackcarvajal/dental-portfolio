# PRODIGY — Configuración DNS para Email Deliverability

## ⚠️ EJECUTAR EN CLOUDFLARE DNS (no en código)

### Acceso: cloudflare.com → prodigylabdental.com → DNS

---

## 1. SPF (Sender Policy Framework)
Evita que otros envíen correos haciéndose pasar por prodigylabdental.com.

**Tipo:** TXT  
**Nombre:** @  
**Valor:**
```
v=spf1 include:_spf.google.com include:mail.supabase.io ~all
```
*(Ajustar si usas otro proveedor de correo)*

---

## 2. DKIM (DomainKeys Identified Mail)
Firma digital en cada correo — Gmail/Outlook lo verifican.

**Si usas Google Workspace:**
- Google Admin → Apps → Gmail → Autenticar correo → Generar registro DKIM
- Copiar el registro TXT generado y pegarlo en Cloudflare DNS

**Nombre típico:** `google._domainkey`  
**Tipo:** TXT  
**Valor:** el que genera Google (empieza con `v=DKIM1; k=rsa; p=...`)

---

## 3. DMARC (Domain-based Message Authentication)
Política: qué hacer si alguien intenta suplantar el dominio.

**Tipo:** TXT  
**Nombre:** `_dmarc`  
**Valor:**
```
v=DMARC1; p=quarantine; rua=mailto:gerencia@prodigylabdental.com; pct=100
```

Significado:
- `p=quarantine` → correos no autenticados van a spam (usar `p=reject` cuando todo esté verificado)
- `rua=` → recibes reportes de intentos de suplantación
- `pct=100` → aplica al 100% del correo

---

## Verificación (después de configurar)
1. Ir a: https://mxtoolbox.com/SuperTool.aspx
2. Ingresar: prodigylabdental.com
3. Verificar SPF → OK, DKIM → OK, DMARC → OK

## Score objetivo: A+ en https://www.mail-tester.com/
