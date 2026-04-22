/**
 * PRODIGY — STL Multi-Viewer v1.0
 * Visor 3D multi-archivo reutilizable para flujo pages.
 * STL → tarjeta con visor Three.js interactivo
 * Otros formatos → tarjeta con ícono + metadatos
 *
 * Uso:
 *   <div id="pmv-zone"></div>
 *   <script src="js/stl-multi-viewer.js"></script>
 *   <script>ProdigyMultiViewer.init('pmv-zone');</script>
 *
 * API pública:
 *   ProdigyMultiViewer.init(containerId)   — monta la UI
 *   ProdigyMultiViewer.getFiles()          — devuelve array de File objects seleccionados
 *   ProdigyMultiViewer.clear()             — limpia todo
 */
(function () {
    /* ── CONSTANTES ────────────────────────────────────── */
    const THREE_CDN   = 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';
    const STL_CDN     = 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/STLLoader.js';
    const ORBIT_CDN   = 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/controls/OrbitControls.js';
    const MAX_MB      = 250;
    const ACCEPT_EXTS = '.stl,.obj,.ply,.dcm,.zip,.3oxz,.3ox,.stlb,.stla,.jpg,.jpeg,.png,.webp,.tiff,.tif,.bmp,.gif';
    const IMG_EXTS    = new Set(['jpg','jpeg','png','webp','tiff','tif','bmp','gif']);

    const EXT_META = {
        stl:  { icon: 'fa-cube',        label: 'STL',       color: '#00d2ff' },
        obj:  { icon: 'fa-object-group',label: 'OBJ',       color: '#a78bfa' },
        ply:  { icon: 'fa-layer-group', label: 'PLY',       color: '#60a5fa' },
        dcm:  { icon: 'fa-x-ray',       label: 'DICOM',     color: '#34d399' },
        zip:  { icon: 'fa-file-zipper', label: 'ZIP',       color: '#fbbf24' },
        '3oxz':{ icon:'fa-tooth',       label: '3Shape',    color: '#f472b6' },
        '3ox': { icon:'fa-tooth',       label: '3Shape',    color: '#f472b6' },
        jpg:  { icon: 'fa-image',       label: 'JPG',       color: '#fb923c' },
        jpeg: { icon: 'fa-image',       label: 'JPG',       color: '#fb923c' },
        png:  { icon: 'fa-image',       label: 'PNG',       color: '#4ade80' },
        webp: { icon: 'fa-image',       label: 'WEBP',      color: '#a3e635' },
        tiff: { icon: 'fa-image',       label: 'TIFF',      color: '#94a3b8' },
        tif:  { icon: 'fa-image',       label: 'TIFF',      color: '#94a3b8' },
        bmp:  { icon: 'fa-image',       label: 'BMP',       color: '#94a3b8' },
        gif:  { icon: 'fa-image',       label: 'GIF',       color: '#c084fc' },
    };

    /* ── STATE ─────────────────────────────────────────── */
    let files     = [];   // { id, file, name, ext, sizeMb }
    let viewers   = {};   // id → { renderer, scene, camera, controls, animId }
    let threeReady = false;
    let THREE_MOD, STL_LOADER, ORBIT_CTRL;
    let containerId;
    let uidSeq = 0;

    /* ── CSS ──────────────────────────────────────────── */
    function injectCSS() {
        if (document.getElementById('pmv-css')) return;
        const s = document.createElement('style');
        s.id = 'pmv-css';
        s.textContent = `
.pmv-wrap { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

/* DROPZONE */
.pmv-drop {
    border: 2px dashed rgba(0,210,255,0.35);
    border-radius: 14px;
    padding: 32px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s;
    background: rgba(0,210,255,0.03);
    position: relative;
}
.pmv-drop.over {
    border-color: #00d2ff;
    background: rgba(0,210,255,0.08);
}
.pmv-drop input[type=file] {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    opacity: 0; cursor: pointer;
}
.pmv-drop-ico { font-size: 2.2rem; color: #00d2ff; margin-bottom: 10px; display: block; }
.pmv-drop-title { color: #fff; font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; }
.pmv-drop-sub { color: #64748b; font-size: 0.78rem; line-height: 1.5; }
.pmv-drop-sub span { color: #94a3b8; }

/* GRID DE TARJETAS */
.pmv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
    margin-top: 16px;
}
.pmv-card {
    background: #0d1525;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: border-color 0.2s;
}
.pmv-card:hover { border-color: rgba(0,210,255,0.3); }

/* CANVAS CONTENEDOR */
.pmv-canvas-wrap {
    width: 100%;
    height: 180px;
    background: #020810;
    position: relative;
    overflow: hidden;
}
.pmv-canvas-wrap canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
}
.pmv-canvas-hint {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    pointer-events: none;
    color: rgba(255,255,255,0.18);
    font-size: 0.72rem; gap: 8px;
}
.pmv-canvas-hint i { font-size: 1.6rem; }
.pmv-canvas-hint.hidden { display: none; }

/* TARJETA ÍCONO (no STL) */
.pmv-icon-wrap {
    width: 100%; height: 180px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 10px;
}
.pmv-icon-wrap i { font-size: 3rem; }
.pmv-icon-badge {
    font-size: 0.68rem; font-weight: 800;
    padding: 3px 10px; border-radius: 20px;
    letter-spacing: 1px;
}

/* FOOTER DE TARJETA */
.pmv-card-foot {
    padding: 10px 12px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; gap: 8px;
}
.pmv-fname {
    flex: 1;
    font-size: 0.72rem;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.pmv-fsize {
    font-size: 0.66rem;
    color: #64748b;
    flex-shrink: 0;
}
.pmv-del {
    background: none; border: none;
    color: #ef4444; cursor: pointer;
    font-size: 0.9rem; padding: 2px 4px;
    flex-shrink: 0; opacity: 0.6;
    transition: opacity 0.2s;
}
.pmv-del:hover { opacity: 1; }

/* MINI CONTROLES STL */
.pmv-stl-ctrl {
    display: flex; gap: 4px;
    padding: 6px 10px;
    background: rgba(0,0,0,0.3);
}
.pmv-stl-btn {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: #94a3b8; border-radius: 6px;
    font-size: 0.65rem; padding: 3px 8px;
    cursor: pointer; transition: all 0.2s;
    font-family: inherit;
}
.pmv-stl-btn:hover { background: rgba(0,210,255,0.1); color: #00d2ff; border-color: rgba(0,210,255,0.3); }

/* ESTADO VACÍO */
.pmv-empty { display: none; }
.pmv-grid:empty + .pmv-empty { display: block; }

/* DRAG ENTER en toda la ventana */
.pmv-window-drag .pmv-drop {
    border-color: #00d2ff;
    background: rgba(0,210,255,0.06);
}
        `;
        document.head.appendChild(s);
    }

    /* ── LOAD THREE.JS (módulos ES) ────────────────────── */
    async function loadThree() {
        if (threeReady) return true;
        try {
            const [threeM, stlM, orbitM] = await Promise.all([
                import(THREE_CDN),
                import(STL_CDN),
                import(ORBIT_CDN)
            ]);
            THREE_MOD   = threeM;
            STL_LOADER  = stlM.STLLoader;
            ORBIT_CTRL  = orbitM.OrbitControls;
            threeReady  = true;
            return true;
        } catch (e) {
            console.warn('[PMV] Three.js no disponible:', e);
            return false;
        }
    }

    /* ── RENDER TARJETA STL ─────────────────────────────── */
    function buildSTLCard(fObj) {
        const id = fObj.id;
        const card = document.createElement('div');
        card.className = 'pmv-card';
        card.id = 'pmv-card-' + id;
        card.innerHTML = `
<div class="pmv-canvas-wrap" id="pmv-cvwrap-${id}">
    <div class="pmv-canvas-hint" id="pmv-hint-${id}">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Cargando visor...</span>
    </div>
</div>
<div class="pmv-stl-ctrl">
    <button class="pmv-stl-btn" onclick="ProdigyMultiViewer._reset('${id}')"><i class="fas fa-compress-arrows-alt"></i> Reset</button>
    <button class="pmv-stl-btn" onclick="ProdigyMultiViewer._wire('${id}')"><i class="fas fa-border-none"></i> Wire</button>
</div>
<div class="pmv-card-foot">
    <span class="pmv-fname" title="${fObj.name}">${fObj.name}</span>
    <span class="pmv-fsize">${fObj.sizeMb} MB</span>
    <button class="pmv-del" onclick="ProdigyMultiViewer._remove('${id}')" title="Quitar"><i class="fas fa-times"></i></button>
</div>`;
        return card;
    }

    /* ── INIT THREE SCENE PARA UNA TARJETA ─────────────── */
    async function mountSTLViewer(fObj) {
        const ok = await loadThree();
        if (!ok) return;
        const { THREE } = { THREE: THREE_MOD };
        const wrap = document.getElementById('pmv-cvwrap-' + fObj.id);
        if (!wrap) return;

        const W = wrap.offsetWidth  || 240;
        const H = wrap.offsetHeight || 180;

        const renderer = new THREE_MOD.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x020810, 1);
        wrap.appendChild(renderer.domElement);

        const scene  = new THREE_MOD.Scene();
        const camera = new THREE_MOD.PerspectiveCamera(45, W / H, 0.01, 2000);

        // Luces
        scene.add(new THREE_MOD.AmbientLight(0xffffff, 0.6));
        const dir1 = new THREE_MOD.DirectionalLight(0xffffff, 0.8);
        dir1.position.set(1, 2, 3);
        scene.add(dir1);
        const dir2 = new THREE_MOD.DirectionalLight(0x00d2ff, 0.3);
        dir2.position.set(-2, -1, -2);
        scene.add(dir2);

        const controls = new ORBIT_CTRL(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.enableZoom = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.2;

        let mesh = null;
        let wireframe = false;

        // Cargar STL
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loader = new STL_LOADER();
                const geo = loader.parse(e.target.result);
                geo.computeVertexNormals();
                geo.center();
                geo.computeBoundingBox();
                const box  = geo.boundingBox;
                const size = Math.max(
                    box.max.x - box.min.x,
                    box.max.y - box.min.y,
                    box.max.z - box.min.z
                );
                camera.position.set(0, 0, size * 1.8);
                camera.near = size * 0.01;
                camera.far  = size * 20;
                camera.updateProjectionMatrix();
                controls.target.set(0, 0, 0);

                const mat = new THREE_MOD.MeshPhongMaterial({
                    color: 0xd4d4d4,
                    specular: 0x444444,
                    shininess: 60,
                    side: THREE_MOD.DoubleSide
                });
                mesh = new THREE_MOD.Mesh(geo, mat);
                scene.add(mesh);

                const hint = document.getElementById('pmv-hint-' + fObj.id);
                if (hint) hint.classList.add('hidden');
            } catch(err) {
                const hint = document.getElementById('pmv-hint-' + fObj.id);
                if (hint) { hint.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Error al leer STL</span>'; }
            }
        };
        reader.readAsArrayBuffer(fObj.file);

        let animId;
        function animate() {
            animId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        viewers[fObj.id] = { renderer, scene, camera, controls, getMesh: () => mesh,
            toggleWire: () => {
                if (!mesh) return;
                wireframe = !wireframe;
                mesh.material.wireframe = wireframe;
            },
            resetCam: () => {
                if (!mesh) return;
                const box = new THREE_MOD.Box3().setFromObject(mesh);
                const sz  = Math.max(...['x','y','z'].map(a => box.max[a] - box.min[a]));
                camera.position.set(0, 0, sz * 1.8);
                controls.target.set(0, 0, 0);
                controls.update();
            },
            destroy: () => {
                cancelAnimationFrame(animId);
                controls.dispose();
                renderer.dispose();
                if (mesh) { mesh.geometry.dispose(); mesh.material.dispose(); }
            }
        };
    }

    /* ── TARJETA ÍCONO (formatos no-STL) ────────────────── */
    function buildIconCard(fObj) {
        const meta = EXT_META[fObj.ext] || { icon: 'fa-file', label: fObj.ext.toUpperCase(), color: '#94a3b8' };
        const card = document.createElement('div');
        card.className = 'pmv-card';
        card.id = 'pmv-card-' + fObj.id;
        card.innerHTML = `
<div class="pmv-icon-wrap">
    <i class="fas ${meta.icon}" style="color:${meta.color}"></i>
    <span class="pmv-icon-badge" style="background:${meta.color}22;color:${meta.color};border:1px solid ${meta.color}44">${meta.label}</span>
</div>
<div class="pmv-card-foot">
    <span class="pmv-fname" title="${fObj.name}">${fObj.name}</span>
    <span class="pmv-fsize">${fObj.sizeMb} MB</span>
    <button class="pmv-del" onclick="ProdigyMultiViewer._remove('${fObj.id}')" title="Quitar"><i class="fas fa-times"></i></button>
</div>`;
        return card;
    }

    /* ── TARJETA IMAGEN (preview nativo) ───────────────── */
    function buildImageCard(fObj) {
        const meta = EXT_META[fObj.ext] || { label: fObj.ext.toUpperCase(), color: '#fb923c' };
        const card = document.createElement('div');
        card.className = 'pmv-card';
        card.id = 'pmv-card-' + fObj.id;
        const url = URL.createObjectURL(fObj.file);
        card.innerHTML = `
<div class="pmv-canvas-wrap" style="cursor:zoom-in;" onclick="window.open('${url}','_blank')">
    <img src="${url}" alt="${fObj.name}"
         style="width:100%;height:100%;object-fit:cover;display:block;"
         onload="this.style.opacity=1" style="opacity:0;transition:opacity .3s">
    <span style="position:absolute;top:6px;right:6px;background:${meta.color}22;color:${meta.color};
          border:1px solid ${meta.color}44;font-size:.6rem;font-weight:800;padding:2px 7px;
          border-radius:10px;letter-spacing:1px;">${meta.label}</span>
</div>
<div class="pmv-card-foot">
    <span class="pmv-fname" title="${fObj.name}">${fObj.name}</span>
    <span class="pmv-fsize">${fObj.sizeMb} MB</span>
    <button class="pmv-del" onclick="ProdigyMultiViewer._remove('${fObj.id}')" title="Quitar"><i class="fas fa-times"></i></button>
</div>`;
        return card;
    }

    /* ── AGREGAR ARCHIVOS ──────────────────────────────── */
    function addFiles(fileList) {
        const grid = document.getElementById('pmv-grid-' + containerId);
        if (!grid) return;

        Array.from(fileList).forEach(f => {
            // Duplicado
            if (files.find(x => x.name === f.name && x.sizeMb === +(f.size/1024/1024).toFixed(1))) return;
            // Tamaño
            const sizeMb = +(f.size / 1024 / 1024).toFixed(1);
            if (sizeMb > MAX_MB) {
                _pgToast(`"${f.name}" supera el límite de ${MAX_MB} MB`);
                return;
            }
            const ext   = f.name.split('.').pop().toLowerCase();
            const id    = 'pmv' + (++uidSeq);
            const fObj  = { id, file: f, name: f.name, ext, sizeMb };
            files.push(fObj);

            const isSTL = ext === 'stl' || ext === 'stla' || ext === 'stlb';
            const isImg = IMG_EXTS.has(ext);
            const card  = isSTL ? buildSTLCard(fObj)
                        : isImg ? buildImageCard(fObj)
                        : buildIconCard(fObj);
            grid.appendChild(card);

            if (isSTL) mountSTLViewer(fObj);
        });

        updateDropzone();
    }

    /* ── REMOVER ARCHIVO ───────────────────────────────── */
    function removeFile(id) {
        if (viewers[id]) {
            viewers[id].destroy();
            delete viewers[id];
        }
        files = files.filter(f => f.id !== id);
        const card = document.getElementById('pmv-card-' + id);
        if (card) card.remove();
        updateDropzone();
    }

    /* ── ACTUALIZAR DROPZONE UI ────────────────────────── */
    function updateDropzone() {
        const dz = document.getElementById('pmv-drop-' + containerId);
        if (!dz) return;
        if (files.length > 0) {
            dz.style.padding = '16px 20px';
        } else {
            dz.style.padding = '';
        }
    }

    /* ── MONTAR UI PRINCIPAL ────────────────────────────── */
    function init(cId) {
        containerId = cId;
        injectCSS();
        const container = document.getElementById(cId);
        if (!container) { console.error('[PMV] Contenedor no encontrado:', cId); return; }

        container.className = (container.className + ' pmv-wrap').trim();
        container.innerHTML = `
<div class="pmv-drop" id="pmv-drop-${cId}" onclick="document.getElementById('pmv-input-${cId}').click()">
    <input type="file" id="pmv-input-${cId}" multiple accept="${ACCEPT_EXTS}"
           onclick="event.stopPropagation()"
           onchange="ProdigyMultiViewer._onInput(event)">
    <i class="fas fa-cloud-arrow-up pmv-drop-ico"></i>
    <div class="pmv-drop-title">Arrastra tus archivos aquí o haz clic</div>
    <div class="pmv-drop-sub">
        <span>STL · OBJ · PLY · DICOM (.dcm) · 3Shape (.3oxz) · ZIP</span><br>
        Múltiples archivos · Máx. ${MAX_MB} MB por archivo
    </div>
</div>
<div class="pmv-grid" id="pmv-grid-${cId}"></div>`;

        // Drag & drop en el dropzone
        const dz = document.getElementById('pmv-drop-' + cId);
        dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('over'); });
        dz.addEventListener('dragleave', e => { if (!dz.contains(e.relatedTarget)) dz.classList.remove('over'); });
        dz.addEventListener('drop', e => {
            e.preventDefault();
            dz.classList.remove('over');
            addFiles(e.dataTransfer.files);
        });

        // Drag & drop en toda la ventana
        document.addEventListener('dragover',  e => { e.preventDefault(); container.classList.add('pmv-window-drag'); });
        document.addEventListener('dragleave', e => { if (!e.relatedTarget) container.classList.remove('pmv-window-drag'); });
        document.addEventListener('drop', e => {
            e.preventDefault();
            container.classList.remove('pmv-window-drag');
            const hasDental = Array.from(e.dataTransfer.files).some(f => {
                const ext = f.name.split('.').pop().toLowerCase();
                return ACCEPT_EXTS.replace(/\./g,'').split(',').includes(ext);
            });
            if (hasDental) addFiles(e.dataTransfer.files);
        });

        // Pre-cargar Three.js en background
        loadThree();
    }

    /* ── API PÚBLICA ────────────────────────────────────── */
    window.ProdigyMultiViewer = {
        init,
        getFiles: ()  => files.map(f => f.file),
        getFileObjs: ()=> files,
        clear: () => {
            Object.values(viewers).forEach(v => v.destroy());
            viewers = {};
            files   = [];
            const grid = document.getElementById('pmv-grid-' + containerId);
            if (grid) grid.innerHTML = '';
            updateDropzone();
        },
        _onInput: (e) => addFiles(e.target.files),
        _remove:  (id) => removeFile(id),
        _reset:   (id) => { if (viewers[id]) viewers[id].resetCam(); },
        _wire:    (id) => { if (viewers[id]) viewers[id].toggleWire(); }
    };
})();
