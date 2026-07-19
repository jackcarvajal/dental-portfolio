/**
 * PRODIGY — Visor Universal v1.0
 * 2026-07-18
 *
 * POR QUÉ EXISTE
 * Los visores existían solo del lado de SUBIR, no del de RECIBIR: el doctor veía
 * su STL en 3D al mandarlo, pero no podía ver nada de lo que el laboratorio le
 * entregaba. Y el PDF no tenía visor en ningún lado.
 *
 * Este módulo abre cualquier entregable en un solo componente:
 *   HTML (export Exocad)  → iframe aislado          — el flujo más simple, es el modelo
 *   STL / OBJ / PLY       → Three.js interactivo
 *   Imágenes              → <img> con zoom
 *   PDF                   → visor nativo del navegador
 *   ZIP / DICOM / otros   → tarjeta con descarga
 *
 * Uso:
 *   PVisor.abrir([{ url, nombre }, ...])          → modal a pantalla completa
 *   PVisor.montar('mi-div', [{ url, nombre }])    → incrustado en un contenedor
 *
 * Depende de js/formatos.js (PFormatos) para saber qué visor toca cada extensión.
 */
(function () {
    const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';
    const STL_CDN   = 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/STLLoader.js';
    const OBJ_CDN   = 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/OBJLoader.js';
    const PLY_CDN   = 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/PLYLoader.js';
    const ORBIT_CDN = 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/controls/OrbitControls.js';

    let THREE_MOD, LOADERS = {}, ORBIT, tresReady = false;
    let _activos = [];   // renderers vivos, para limpiarlos al cerrar

    function escH(s) {
        return String(s == null ? '' : s)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    /** Solo se abren URLs https reales — bloquea javascript:, data:, etc. */
    function urlSegura(u) {
        try {
            const p = new URL(u, location.href);
            return p.protocol === 'https:' || p.protocol === 'blob:'
                || (p.protocol === 'http:' && p.hostname === 'localhost');
        } catch { return false; }
    }

    function extDe(nombre, url) {
        if (window.PFormatos) {
            const e = window.PFormatos.extDe(nombre || '');
            if (e) return e;
        }
        const base = String(nombre || url || '').split('?')[0];
        const i = base.lastIndexOf('.');
        return i >= 0 ? base.slice(i).toLowerCase() : '';
    }

    function tipoDe(ext) {
        if (window.PFormatos) return window.PFormatos.meta(ext).visor;
        if (['.html','.htm'].includes(ext)) return 'html';
        if (['.stl','.obj','.ply','.stlb','.stla'].includes(ext)) return 'stl';
        if (['.jpg','.jpeg','.png','.webp','.gif','.bmp','.heic','.heif'].includes(ext)) return 'imagen';
        if (ext === '.pdf') return 'pdf';
        return 'ninguno';
    }

    /* ── CSS ───────────────────────────────────────────────────── */
    function injectCSS() {
        if (document.getElementById('pvis-css')) return;
        const s = document.createElement('style');
        s.id = 'pvis-css';
        s.textContent = `
.pvis-ov{position:fixed;inset:0;background:rgba(3,3,6,.94);backdrop-filter:blur(6px);z-index:10000;display:flex;flex-direction:column;}
.pvis-top{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0;}
.pvis-top h3{margin:0;font-size:.92rem;color:#e2e8f0;font-weight:700;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pvis-x{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#e2e8f0;width:34px;height:34px;border-radius:9px;cursor:pointer;font-size:1rem;flex-shrink:0;}
.pvis-x:hover{background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.4);}
.pvis-tabs{display:flex;gap:6px;padding:10px 18px;overflow-x:auto;flex-shrink:0;border-bottom:1px solid rgba(255,255,255,.06);}
.pvis-tab{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:#94a3b8;padding:7px 13px;border-radius:8px;cursor:pointer;font-size:.72rem;white-space:nowrap;display:flex;align-items:center;gap:7px;min-height:34px;}
.pvis-tab:hover{background:rgba(255,255,255,.08);color:#e2e8f0;}
.pvis-tab.on{background:rgba(212,175,55,.14);border-color:rgba(212,175,55,.45);color:#D4AF37;font-weight:700;}
.pvis-body{flex:1;position:relative;overflow:auto;background:#050505;}
.pvis-pane{position:absolute;inset:0;display:none;}
.pvis-pane.on{display:block;}
.pvis-pane iframe{width:100%;height:100%;border:none;background:#000;}
.pvis-pane canvas{display:block;width:100%;height:100%;}
.pvis-img{width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto;}
.pvis-img img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;cursor:zoom-in;}
.pvis-img img.zoom{max-width:none;max-height:none;cursor:zoom-out;}
.pvis-pdf{width:100%;height:100%;}
.pvis-pdf embed,.pvis-pdf iframe{width:100%;height:100%;border:none;}
.pvis-nada{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#94a3b8;text-align:center;padding:30px;}
.pvis-nada i{font-size:3rem;opacity:.35;}
.pvis-dl{background:linear-gradient(135deg,#D4AF37,#c19b2e);color:#0a0a0a;border:none;padding:11px 22px;border-radius:9px;font-weight:800;cursor:pointer;font-size:.8rem;text-decoration:none;display:inline-flex;align-items:center;gap:8px;min-height:42px;}
.pvis-load{height:100%;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:.82rem;gap:10px;}
.pvis-in{border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;background:#050505;display:flex;flex-direction:column;}
.pvis-in .pvis-body{min-height:340px;position:relative;}
@media(max-width:640px){.pvis-top h3{font-size:.8rem;}.pvis-in .pvis-body{min-height:260px;}}
@media(prefers-reduced-motion:reduce){.pvis-ov{backdrop-filter:none;}}`;
        document.head.appendChild(s);
    }

    /* ── Three.js bajo demanda ─────────────────────────────────── */
    async function cargarThree(necesita) {
        if (tresReady && LOADERS[necesita]) return true;
        try {
            if (!THREE_MOD) {
                THREE_MOD = await import(THREE_CDN);
                ORBIT = (await import(ORBIT_CDN)).OrbitControls;
            }
            if (necesita === '.obj' && !LOADERS['.obj'])      LOADERS['.obj'] = (await import(OBJ_CDN)).OBJLoader;
            else if (necesita === '.ply' && !LOADERS['.ply']) LOADERS['.ply'] = (await import(PLY_CDN)).PLYLoader;
            else if (!LOADERS['.stl'])                        LOADERS['.stl'] = (await import(STL_CDN)).STLLoader;
            tresReady = true;
            return true;
        } catch (e) {
            console.warn('[PVisor] No se pudo cargar Three.js:', e);
            return false;
        }
    }

    async function render3D(pane, url, ext) {
        pane.innerHTML = '<div class="pvis-load"><i class="fas fa-circle-notch fa-spin"></i> Cargando modelo 3D…</div>';
        const clave = ['.obj','.ply'].includes(ext) ? ext : '.stl';
        if (!await cargarThree(clave)) { sinVisor(pane, url, 'No se pudo cargar el visor 3D.'); return; }

        const THREE = THREE_MOD;
        const w = pane.clientWidth || 800, h = pane.clientHeight || 500;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0f);
        const cam = new THREE.PerspectiveCamera(45, w / h, 0.1, 5000);
        const rend = new THREE.WebGLRenderer({ antialias: true });
        rend.setSize(w, h);
        rend.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        scene.add(new THREE.AmbientLight(0xffffff, 0.65));
        const l1 = new THREE.DirectionalLight(0xffffff, 0.9); l1.position.set(1, 1, 1); scene.add(l1);
        const l2 = new THREE.DirectionalLight(0x88aaff, 0.35); l2.position.set(-1, -1, -1); scene.add(l2);

        const Loader = LOADERS[clave];
        new Loader().load(url, (res) => {
            let obj;
            if (clave === '.obj') {
                obj = res;
                obj.traverse(c => { if (c.isMesh) c.material = new THREE.MeshPhongMaterial({ color: 0xd8d8e0, shininess: 28 }); });
            } else {
                res.computeVertexNormals();
                obj = new THREE.Mesh(res, new THREE.MeshPhongMaterial({ color: 0xd8d8e0, shininess: 28, flatShading: false }));
            }
            // Centrar y encuadrar
            const box = new THREE.Box3().setFromObject(obj);
            const c = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            obj.position.sub(c);
            scene.add(obj);
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            cam.position.set(0, 0, maxDim * 2.2);
            cam.near = maxDim / 100; cam.far = maxDim * 100; cam.updateProjectionMatrix();

            pane.innerHTML = '';
            pane.appendChild(rend.domElement);
            const ctrl = new ORBIT(cam, rend.domElement);
            ctrl.enableDamping = true;

            let raf;
            (function loop() { raf = requestAnimationFrame(loop); ctrl.update(); rend.render(scene, cam); })();
            _activos.push({ rend, raf, ctrl });

            const ro = new ResizeObserver(() => {
                const nw = pane.clientWidth, nh = pane.clientHeight;
                if (!nw || !nh) return;
                cam.aspect = nw / nh; cam.updateProjectionMatrix(); rend.setSize(nw, nh);
            });
            ro.observe(pane);
        }, undefined, (err) => {
            console.warn('[PVisor] Error cargando 3D:', err);
            sinVisor(pane, url, 'No se pudo leer el modelo. Descárgalo para abrirlo en tu software.');
        });
    }

    function sinVisor(pane, url, msg) {
        const dl = urlSegura(url)
            ? `<a class="pvis-dl" href="${escH(url)}" target="_blank" rel="noopener noreferrer" download><i class="fas fa-download"></i> Descargar archivo</a>`
            : '';
        pane.innerHTML = `<div class="pvis-nada"><i class="fas fa-file"></i><p>${escH(msg || 'Este formato no tiene vista previa.')}</p>${dl}</div>`;
    }

    /* ── Render por tipo ───────────────────────────────────────── */
    async function pintar(pane, item) {
        const ext  = extDe(item.nombre, item.url);
        const tipo = tipoDe(ext);

        if (!urlSegura(item.url)) { sinVisor(pane, null, 'Enlace no válido.'); return; }

        if (tipo === 'html') {
            // SANDBOX: 'allow-scripts' SIN 'allow-same-origin'. Juntas se anulan entre sí
            // —el contenido puede quitarse el sandbox y alcanzar la sesión del doctor—.
            // Los export de Exocad son autocontenidos, así que no necesitan same-origin.
            const f = document.createElement('iframe');
            f.setAttribute('sandbox', 'allow-scripts');
            f.setAttribute('referrerpolicy', 'no-referrer');
            f.src = item.url;
            pane.innerHTML = '';
            pane.appendChild(f);
            return;
        }
        if (tipo === 'stl') { await render3D(pane, item.url, ext); return; }
        if (tipo === 'imagen') {
            pane.innerHTML = `<div class="pvis-img"><img src="${escH(item.url)}" alt="${escH(item.nombre || 'Imagen')}" loading="lazy"></div>`;
            const img = pane.querySelector('img');
            img.addEventListener('click', () => img.classList.toggle('zoom'));
            img.addEventListener('error', () => sinVisor(pane, item.url, 'No se pudo cargar la imagen.'));
            return;
        }
        if (tipo === 'pdf') {
            pane.innerHTML = `<div class="pvis-pdf"><iframe src="${escH(item.url)}" title="${escH(item.nombre || 'PDF')}"></iframe></div>`;
            return;
        }
        const meta = window.PFormatos ? window.PFormatos.meta(ext) : { label: 'Archivo' };
        sinVisor(pane, item.url, `${meta.label} — este formato se abre en tu software CAD. Descárgalo.`);
    }

    /* ── Normalizar entrada ────────────────────────────────────── */
    function normalizar(archivos) {
        const arr = Array.isArray(archivos) ? archivos : [archivos];
        return arr.map((a, i) => {
            if (typeof a === 'string') {
                const nom = decodeURIComponent(String(a).split('?')[0].split('/').pop() || ('archivo-' + (i + 1)));
                return { url: a, nombre: nom };
            }
            return { url: a.url || a.signedUrl || '', nombre: a.nombre || a.name || ('archivo-' + (i + 1)) };
        }).filter(a => a.url);
    }

    function limpiar() {
        _activos.forEach(v => {
            try { cancelAnimationFrame(v.raf); v.ctrl && v.ctrl.dispose(); v.rend.dispose(); } catch {}
        });
        _activos = [];
    }

    /* ── Construir la UI ───────────────────────────────────────── */
    function construir(root, items, titulo) {
        const tabs = items.map((it, i) => {
            const ext = extDe(it.nombre, it.url);
            const m = window.PFormatos ? window.PFormatos.meta(ext) : { icon:'fa-file', label:'Archivo', color:'#94a3b8' };
            return `<button type="button" class="pvis-tab${i === 0 ? ' on' : ''}" data-i="${i}">
                <i class="fas ${m.icon}" style="color:${m.color}"></i>
                <span>${escH(it.nombre)}</span></button>`;
        }).join('');

        root.innerHTML =
            (titulo !== null ? `<div class="pvis-top"><h3>${escH(titulo || 'Archivos del caso')}</h3>
                <button type="button" class="pvis-x" aria-label="Cerrar visor">✕</button></div>` : '') +
            (items.length > 1 ? `<div class="pvis-tabs" role="tablist">${tabs}</div>` : '') +
            `<div class="pvis-body">${items.map((_, i) =>
                `<div class="pvis-pane${i === 0 ? ' on' : ''}" data-p="${i}"></div>`).join('')}</div>`;

        const panes = root.querySelectorAll('.pvis-pane');
        const pintados = new Set();

        function mostrar(i) {
            root.querySelectorAll('.pvis-tab').forEach(t => t.classList.toggle('on', +t.dataset.i === i));
            panes.forEach(p => p.classList.toggle('on', +p.dataset.p === i));
            if (!pintados.has(i)) { pintados.add(i); pintar(panes[i], items[i]); }  // perezoso
        }

        root.querySelectorAll('.pvis-tab').forEach(t =>
            t.addEventListener('click', () => mostrar(+t.dataset.i)));

        mostrar(0);
        return { mostrar };
    }

    /* ── API pública ───────────────────────────────────────────── */

    /** Modal a pantalla completa. */
    function abrir(archivos, opts) {
        opts = opts || {};
        const items = normalizar(archivos);
        if (!items.length) return null;
        injectCSS();

        const ov = document.createElement('div');
        ov.className = 'pvis-ov';
        ov.setAttribute('role', 'dialog');
        ov.setAttribute('aria-modal', 'true');
        ov.setAttribute('aria-label', opts.titulo || 'Visor de archivos');
        document.body.appendChild(ov);
        document.body.style.overflow = 'hidden';

        construir(ov, items, opts.titulo || 'Archivos del caso');

        function cerrar() {
            limpiar();
            ov.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', onKey);
        }
        function onKey(e) { if (e.key === 'Escape') cerrar(); }

        ov.querySelector('.pvis-x').addEventListener('click', cerrar);
        ov.addEventListener('click', e => { if (e.target === ov) cerrar(); });
        document.addEventListener('keydown', onKey);
        ov.querySelector('.pvis-x').focus();

        return { cerrar };
    }

    /** Incrustado dentro de un contenedor existente. */
    function montar(contenedor, archivos, opts) {
        opts = opts || {};
        const root = typeof contenedor === 'string' ? document.getElementById(contenedor) : contenedor;
        if (!root) { console.warn('[PVisor] Contenedor no encontrado:', contenedor); return null; }
        const items = normalizar(archivos);
        injectCSS();
        root.classList.add('pvis-in');
        if (!items.length) {
            root.innerHTML = `<div class="pvis-nada" style="min-height:200px"><i class="fas fa-folder-open"></i><p>Aún no hay archivos.</p></div>`;
            return null;
        }
        return construir(root, items, opts.titulo === undefined ? null : opts.titulo);
    }

    window.PVisor = { abrir, montar, limpiar };
})();
