/**
 * PRODIGY — AR Viewer (Realidad Aumentada web)
 * Permite al doctor proyectar el modelo STL en AR sobre su escritorio.
 *
 * Estrategia multiplataforma:
 *  - Android Chrome: WebXR hit-test API con Three.js
 *  - iOS Safari: Quick Look con archivo .usdz
 *  - Desktop: Fallback a visor 3D fullscreen estándar
 *
 * Uso:
 *   <script src="js/ar-viewer.js"></script>
 *   <button onclick="ProdigyAR.launch(url_stl, nombre)">Ver en AR</button>
 */

window.ProdigyAR = (function() {
    'use strict';

    const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';
    const STL_CDN   = 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/STLLoader.js';
    const GLTF_EXP  = 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/exporters/GLTFExporter.js';

    let _arOverlay = null;
    let _renderer  = null;
    let _xrSession = null;

    /* ── Detectar capacidades del dispositivo ─────────────────── */
    function detectCapabilities() {
        const ua = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(ua);
        const isAndroid = /android/.test(ua);
        const hasWebXR = 'xr' in navigator;
        const hasARQuickLook = isIOS && document.createElement('a').relList?.supports('ar');
        return { isIOS, isAndroid, hasWebXR, hasARQuickLook };
    }

    /* ── Crear overlay de AR ──────────────────────────────────── */
    function _createOverlay() {
        if (_arOverlay) return _arOverlay;
        _arOverlay = document.createElement('div');
        _arOverlay.id = '_prodigy-ar-overlay';
        _arOverlay.style.cssText = [
            'position:fixed;inset:0;z-index:99999;',
            'background:#000;display:flex;flex-direction:column;',
            'align-items:center;justify-content:center;',
            'font-family:-apple-system,sans-serif;color:#fff;'
        ].join('');
        _arOverlay.innerHTML = `
          <div id="_par-canvas-wrap" style="width:100%;height:100%;position:relative;"></div>
          <div style="position:fixed;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(transparent,rgba(0,0,0,.8));display:flex;gap:12px;justify-content:center;z-index:10;">
            <div id="_par-status" style="position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.7);padding:8px 18px;border-radius:100px;font-size:.8rem;backdrop-filter:blur(4px);"></div>
            <button type="button" id="_par-place-btn" style="display:none;background:#D946A6;border:none;color:#fff;padding:14px 28px;border-radius:100px;font-size:.9rem;font-weight:700;cursor:pointer;">📍 Colocar modelo</button>
            <button type="button" id="_par-close-btn" style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;padding:12px 24px;border-radius:100px;font-size:.85rem;cursor:pointer;" onclick="ProdigyAR.close()">✕ Cerrar</button>
          </div>
        `;
        document.body.appendChild(_arOverlay);
        return _arOverlay;
    }

    /* ── iOS Quick Look AR (USDZ) ─────────────────────────────── */
    async function _launchIOSAR(stlUrl, nombre) {
        // iOS usa Quick Look nativo con archivos .usdz o .reality
        // Dado que convertir STL→USDZ requiere servidor, mostramos el visor 3D
        // con instrucción de que para AR completo se necesita la app PRODIGY nativa.
        _launchFullscreenViewer(stlUrl, nombre,
            '🍎 Para AR en iPhone, abre este modelo en la app PRODIGY (próximamente en App Store)'
        );
    }

    /* ── Android / Desktop WebXR ──────────────────────────────── */
    async function _launchWebXR(stlUrl, nombre) {
        const cap = detectCapabilities();
        if (!cap.hasWebXR) {
            _launchFullscreenViewer(stlUrl, nombre, 'Tu navegador no soporta WebXR. Actualizalo a Chrome 79+');
            return;
        }

        try {
            const supported = await navigator.xr.isSessionSupported('immersive-ar');
            if (!supported) {
                _launchFullscreenViewer(stlUrl, nombre, 'AR no disponible en este dispositivo. Mostrando visor 3D.');
                return;
            }

            const overlay  = _createOverlay();
            const wrap     = overlay.querySelector('#_par-canvas-wrap');
            const statusEl = overlay.querySelector('#_par-status');
            const placeBtn = overlay.querySelector('#_par-place-btn');
            statusEl.textContent = 'Iniciando AR...';

            // Importar Three.js dinámicamente
            const { THREE, STLLoader, scene, camera } = await _initThreeXR(stlUrl, wrap, statusEl);

            // Iniciar sesión AR
            const sessionInit = {
                requiredFeatures: ['hit-test'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: overlay }
            };
            _xrSession = await navigator.xr.requestSession('immersive-ar', sessionInit);
            statusEl.textContent = '📸 Apunta al suelo o escritorio';

            // Configurar renderer
            _renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            _renderer.setPixelRatio(window.devicePixelRatio);
            _renderer.setSize(window.innerWidth, window.innerHeight);
            _renderer.xr.enabled = true;
            _renderer.xr.setSession(_xrSession);
            wrap.appendChild(_renderer.domElement);

            let hitTestSource = null;
            let model = scene.children.find(c => c.isMesh) || scene.children[0];
            let modelPlaced = false;
            const reticle = _createReticle(THREE);
            scene.add(reticle);

            _xrSession.addEventListener('end', () => { ProdigyAR.close(); });

            _xrSession.requestAnimationFrame(async function onStart(time, frame) {
                if (!frame) return;
                const refSpace = await _xrSession.requestReferenceSpace('viewer');
                hitTestSource = await _xrSession.requestHitTestSource({ space: refSpace });
                placeBtn.style.display = 'block';

                // Render loop
                _renderer.setAnimationLoop(function(time, frame) {
                    if (!frame) return;
                    const viewerSpace = _xrSession.requestReferenceSpace;
                    const hitTestResults = frame.getHitTestResults(hitTestSource);
                    if (hitTestResults.length > 0) {
                        const hit = hitTestResults[0];
                        const pose = hit.getPose(frame.getViewerPose(_renderer.xr.getReferenceSpace()));
                        if (pose) {
                            reticle.visible = true;
                            reticle.matrix.fromArray(pose.transform.matrix);
                        }
                    } else {
                        reticle.visible = false;
                    }
                    _renderer.render(scene, camera);
                });
            });

            placeBtn.addEventListener('click', function() {
                if (reticle.visible && model) {
                    model.position.setFromMatrixPosition(reticle.matrix);
                    model.visible = true;
                    modelPlaced = true;
                    statusEl.textContent = '✅ Modelo colocado — camina alrededor';
                    placeBtn.textContent = '🔄 Mover';
                }
            });

        } catch(e) {
            console.error('[ProdigyAR] Error WebXR:', e);
            _launchFullscreenViewer(stlUrl, nombre, 'Error iniciando AR: ' + e.message);
        }
    }

    /* ── Visor 3D fullscreen como fallback ────────────────────── */
    function _launchFullscreenViewer(stlUrl, nombre, mensaje) {
        const overlay = _createOverlay();
        const wrap    = overlay.querySelector('#_par-canvas-wrap');
        const status  = overlay.querySelector('#_par-status');
        status.textContent = mensaje || '🔄 Cargando modelo 3D...';

        import(THREE_CDN).then(async ({ THREE }) => {
            import(STL_CDN).then(({ STLLoader }) => {
                const scene    = new THREE.Scene();
                scene.background = new THREE.Color(0x050505);
                const camera   = new THREE.PerspectiveCamera(60, wrap.clientWidth / wrap.clientHeight, 0.01, 1000);
                const renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(wrap.clientWidth, wrap.clientHeight);
                wrap.appendChild(renderer.domElement);

                scene.add(new THREE.AmbientLight(0xffffff, 0.7));
                const dl = new THREE.DirectionalLight(0xffffff, 1.2);
                dl.position.set(5, 10, 5); scene.add(dl);

                const loader = new STLLoader();
                fetch(stlUrl).then(r => r.arrayBuffer()).then(buffer => {
                    const geometry = loader.parse(buffer);
                    geometry.computeBoundingBox();
                    geometry.center();
                    const size = new THREE.Vector3();
                    geometry.boundingBox.getSize(size);
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale  = 2 / maxDim;

                    const mesh = new THREE.Mesh(geometry,
                        new THREE.MeshPhongMaterial({ color: 0xD4AF37, specular: 0x444444, shininess: 60 })
                    );
                    mesh.scale.setScalar(scale);
                    scene.add(mesh);
                    camera.position.set(0, 1, 3);
                    camera.lookAt(0, 0, 0);

                    status.textContent = `✅ ${nombre || 'Modelo 3D'} — Toca para rotar`;

                    // Touch/Mouse rotation
                    let isDragging = false, prevX = 0, prevY = 0;
                    renderer.domElement.addEventListener('pointerdown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
                    renderer.domElement.addEventListener('pointermove', e => {
                        if (!isDragging) return;
                        mesh.rotation.y += (e.clientX - prevX) * 0.01;
                        mesh.rotation.x += (e.clientY - prevY) * 0.01;
                        prevX = e.clientX; prevY = e.clientY;
                    });
                    renderer.domElement.addEventListener('pointerup', () => { isDragging = false; });

                    function animate() {
                        requestAnimationFrame(animate);
                        if (!isDragging) mesh.rotation.y += 0.003;
                        renderer.render(scene, camera);
                    }
                    animate();
                }).catch(e => { status.textContent = 'Error cargando: ' + e.message; });
            });
        });
    }

    /* ── Three.js + STL en modo XR ────────────────────────────── */
    async function _initThreeXR(stlUrl, wrap, statusEl) {
        const { THREE } = await import(THREE_CDN);
        const { STLLoader } = await import(STL_CDN);

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 20);
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        scene.add(new THREE.DirectionalLight(0xffffff, 1.2));

        statusEl.textContent = '📥 Descargando modelo...';
        const buf     = await fetch(stlUrl).then(r => r.arrayBuffer());
        const loader  = new STLLoader();
        const geo     = loader.parse(buf);
        geo.computeBoundingBox(); geo.center();
        const size   = new THREE.Vector3();
        geo.boundingBox.getSize(size);
        const mesh = new THREE.Mesh(geo,
            new THREE.MeshPhongMaterial({ color: 0xD4AF37, specular: 0x444444 })
        );
        mesh.scale.setScalar(0.1 / Math.max(size.x, size.y, size.z));
        mesh.visible = false;
        scene.add(mesh);
        statusEl.textContent = '✅ Modelo listo';
        return { THREE, scene, camera };
    }

    /* ── Reticle (diana AR) ───────────────────────────────────── */
    function _createReticle(THREE) {
        const geo  = new THREE.RingGeometry(0.05, 0.08, 24);
        const mat  = new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(geo, mat);
        ring.rotation.x = -Math.PI / 2;
        ring.visible = false;
        ring.matrixAutoUpdate = false;
        return ring;
    }

    /* ── API pública ──────────────────────────────────────────── */
    async function launch(stlUrl, nombre) {
        if (!stlUrl) { alert('No hay archivo STL disponible para AR'); return; }
        const cap = detectCapabilities();

        if (cap.isIOS && cap.hasARQuickLook) {
            _launchIOSAR(stlUrl, nombre);
        } else if (cap.hasWebXR) {
            _launchWebXR(stlUrl, nombre);
        } else {
            _launchFullscreenViewer(stlUrl, nombre, '🔄 Cargando visor 3D...');
        }
    }

    function close() {
        if (_xrSession) { _xrSession.end().catch(()=>{}); _xrSession = null; }
        if (_renderer)  { _renderer.dispose(); _renderer = null; }
        if (_arOverlay) { _arOverlay.remove(); _arOverlay = null; }
    }

    function isSupported() {
        const cap = detectCapabilities();
        return cap.hasWebXR || cap.hasARQuickLook || true; // fallback siempre disponible
    }

    return { launch, close, isSupported, detectCapabilities };
})();
