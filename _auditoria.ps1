param([string]$Path = $PSScriptRoot)

$errores  = 0
$warnings = 0
$ok       = 0

function Fallo  { param($msg) Write-Host "  [ERROR] $msg" -ForegroundColor Red;    $script:errores++ }
function Aviso  { param($msg) Write-Host "  [WARN]  $msg" -ForegroundColor Yellow; $script:warnings++ }
function OK     { param($msg) Write-Host "  [OK]    $msg" -ForegroundColor Green;  $script:ok++ }

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  PRODIGY - AUDITORIA AUTOMATICA" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[ PAGINAS PUBLICAS ]" -ForegroundColor Magenta

$publicas = Get-ChildItem "$Path\*.html" | Where-Object {
    $_.Name -notmatch "^_" -and
    $_.Name -ne "mantenimiento.html" -and
    $_.Name -ne "offline.html" -and
    $_.Name -ne "contacto.html" -and
    $_.Name -ne "mapa-sitio.html" -and
    $_.Name -ne "recibo-caso.html"
}

foreach ($f in $publicas) {
    $nombre    = $f.Name
    $contenido = Get-Content $f.FullName -Raw -Encoding UTF8

    if ($contenido -notmatch 'href="#main-content"') {
        Fallo "$nombre - Sin skip link href=#main-content (WCAG 2.4.1)"
    }
    if ($contenido -notmatch 'id="main-content"') {
        Fallo "$nombre - Sin main id=main-content (WCAG 2.4.1)"
    }
    $mainCount = ([regex]::Matches($contenido, '<main[\s>]')).Count
    if ($mainCount -gt 1) {
        Fallo "$nombre - $mainCount main anidados (HTML invalido)"
    }
    $preconnects = [regex]::Matches($contenido, 'rel="preconnect" href="([^"]+)"')
    foreach ($pc in $preconnects) {
        $dominio = $pc.Groups[1].Value -replace ' crossorigin',''
        if ($contenido -notmatch "dns-prefetch.*$([regex]::Escape($dominio))") {
            Aviso "$nombre - Falta dns-prefetch para $dominio"
        }
    }
    if ($contenido -notmatch 'BreadcrumbList') {
        Aviso "$nombre - Sin schema BreadcrumbList"
    }
    if ($contenido -match '<details' -and $contenido -notmatch 'FAQPage') {
        Fallo "$nombre - Tiene [details] pero sin FAQPage schema"
    }
    if ($contenido -match 'noindex' -and $contenido -match 'header\.js') {
        Aviso "$nombre - Pagina publica con noindex"
    }
    if ($contenido -notmatch 'footer\.js') {
        Fallo "$nombre - Sin footer.js"
    }
    if ($contenido -notmatch 'serviceWorker') {
        Aviso "$nombre - Sin registro de Service Worker"
    }
}

Write-Host ""
Write-Host "[ PAGINAS /app/ ]" -ForegroundColor Magenta

$appExcluidas = @('login.html','reset-password.html','success.html','onboarding.html')
$appPages = Get-ChildItem "$Path\app\*.html" | Where-Object { $_.Name -notin $appExcluidas }

foreach ($f in $appPages) {
    $nombre    = "app/$($f.Name)"
    $contenido = Get-Content $f.FullName -Raw -Encoding UTF8

    if ($contenido -notmatch 'auth-guard\.js') {
        Fallo "$nombre - Sin auth-guard.js"
    }
    if ($contenido -notmatch 'noindex') {
        Fallo "$nombre - Sin noindex en pagina privada"
    }
}

Write-Host ""
Write-Host "[ REVISION XSS BASICA ]" -ForegroundColor Magenta

$todasHtml = Get-ChildItem "$Path\*.html","$Path\app\*.html","$Path\en\*.html" -ErrorAction SilentlyContinue

foreach ($f in $todasHtml) {
    if ($f.Name -match "^_") { continue }
    $nombre  = $f.Name
    $lineas  = Get-Content $f.FullName -Encoding UTF8
    $lineNum = 0
    foreach ($linea in $lineas) {
        $lineNum++
        $esInner      = $linea -match 'innerHTML\s*[+=]+'
        $noEscape     = $linea -notmatch 'escH\(|escHtml\(|sanitizar\(|esc\(|_escH\(|_fiEsc\(|escapeHtml\(|textContent'
        $noComment    = $linea -notmatch "//.*innerHTML"
        $noEmpty      = $linea -notmatch "= ''\s*$"
        if ($esInner -and $noEscape -and $noComment -and $noEmpty) {
            $hasInterp = ($linea -match '\$\{[a-zA-Z]') -or ($linea -match '\+\s*[a-zA-Z]')
            if ($hasInterp) {
                Aviso "${nombre}:${lineNum} - innerHTML con variable sin escaping visible"
            }
        }
    }
}

Write-Host ""
Write-Host "[ JS COMPARTIDOS ]" -ForegroundColor Magenta

$jsFiles = Get-ChildItem "$Path\js\*.js" -ErrorAction SilentlyContinue

foreach ($f in $jsFiles) {
    $nombre    = "js/$($f.Name)"
    $contenido = Get-Content $f.FullName -Raw -Encoding UTF8
    if ($contenido -match 'wa\.me/57' -and $contenido -notmatch 'wa\.me/573212816716') {
        $waMatches = [regex]::Matches($contenido, 'wa\.me/(\d+)')
        foreach ($m in $waMatches) {
            if ($m.Groups[1].Value -ne '573212816716') {
                Fallo "$nombre - Numero WA incorrecto: $($m.Value)"
            }
        }
    }
}

Write-Host ""
Write-Host "[ SERVICE WORKER ]" -ForegroundColor Magenta

$sw = Get-Content "$Path\sw.js" -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
if ($sw) {
    $version = [regex]::Match($sw, "prodigy-v(\d+)").Groups[1].Value
    OK "sw.js - Cache version: prodigy-v$version"
} else {
    Fallo "sw.js no encontrado"
}

Write-Host ""
Write-Host "[ SITEMAP ]" -ForegroundColor Magenta

$sitemap = Get-Content "$Path\sitemap.xml" -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
if ($sitemap) {
    $urlCount = ([regex]::Matches($sitemap, '<loc>')).Count
    OK "sitemap.xml - $urlCount URLs indexadas"
    $clavesReq = @('diseno-cad','guias-quirurgicas','calculadora','portafolio','nosotros')
    foreach ($clave in $clavesReq) {
        if ($sitemap -notmatch $clave) {
            Aviso "sitemap.xml - Falta URL: /$clave"
        }
    }
} else {
    Fallo "sitemap.xml no encontrado"
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  RESUMEN" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Errores:   $errores" -ForegroundColor $(if ($errores -gt 0) { 'Red' } else { 'Green' })
Write-Host "  Warnings:  $warnings" -ForegroundColor $(if ($warnings -gt 0) { 'Yellow' } else { 'Green' })
Write-Host "  OK:        $ok" -ForegroundColor Green
Write-Host ""
if ($errores -eq 0 -and $warnings -eq 0) {
    Write-Host "  Todo limpio - listo para publicar" -ForegroundColor Green
} elseif ($errores -eq 0) {
    Write-Host "  Sin errores criticos, revisar warnings" -ForegroundColor Yellow
} else {
    Write-Host "  Corregir errores antes de publicar" -ForegroundColor Red
}
Write-Host ""
