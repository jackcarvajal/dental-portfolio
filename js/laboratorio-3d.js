/* laboratorio-3d.js — «Así va tu caso en el laboratorio»: el laboratorio PRODIGY en 3D con la estación
 * donde está el caso y de quién es el turno. Prototipo aprobado (v9, 1-oct-2026); las reglas viven en
 * js/caso-etapas.js (fuente única). three.js 0.165 desde jsdelivr: la página debe tener el importmap de «three».
 * Uso (desde un script normal):  window.ProdigyLab3D.montar(contenedor, { codigo, flujo, estado_operativo })
 *                                 → { actualizar(caso), destruir() }
 * Se pausa fuera de pantalla y con la pestaña oculta; quieto con «reducir movimiento»; liviano en celular.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const CSS = `
.lab3d{position:relative;height:540px;border-radius:18px;overflow:hidden;background:radial-gradient(900px 420px at 50% 20%,rgba(0,210,255,.10),transparent 60%),radial-gradient(700px 400px at 80% 100%,rgba(217,70,166,.10),transparent 60%),#070b12;border:1px solid rgba(255,255,255,.07);font-family:Inter,-apple-system,'Segoe UI',sans-serif;color:#e2e8f0;text-align:left}
.lab3d .lienzo,.lab3d .capa{position:absolute;inset:0}.lab3d .capa{pointer-events:none}
.lab3d .et{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center}
.lab3d .et .t{background:rgba(10,15,24,.88);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:5px 10px;font-size:.72rem;font-weight:800;white-space:nowrap;color:#e2e8f0}
.lab3d .et .t b{color:#94a3b8;font-weight:700;margin-right:6px}
.lab3d .et .palo{width:1px;height:18px;background:rgba(255,255,255,.25)}
.lab3d .et.activa .t{border-color:#D946A6;box-shadow:0 0 0 3px rgba(217,70,166,.25);color:#fff}
.lab3d .et.hecha .t b{color:#00FF41}
.lab3d .et.espera .t{border-color:#D4AF37;box-shadow:0 0 0 3px rgba(212,175,55,.25)}
.lab3d .et.fuera .t{opacity:.45}.lab3d .et.fuera .t b{color:#475569}
.lab3d .etq-caso{position:absolute;transform:translate(-50%,-100%);background:#D4AF37;color:#1a1405;border-radius:50px;padding:5px 11px;font-size:.72rem;font-weight:900;white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,.4)}
.lab3d .etq-caso[hidden]{display:none}.lab3d .etq-caso.transito{background:#B0267F;color:#fff}
.lab3d .estado{position:absolute;left:14px;bottom:14px;background:rgba(10,15,24,.9);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px 16px;width:300px;max-width:calc(100% - 28px)}
.lab3d .estado small{font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;font-weight:800}
.lab3d .estado strong{display:block;font-size:1.02rem;margin-top:4px}
.lab3d .estado .det{display:block;font-size:.8rem;color:#94a3b8;margin-top:2px;line-height:1.5}
.lab3d .turno{display:inline-flex;margin-top:9px;border-radius:50px;padding:4px 10px;font-size:.72rem;font-weight:800}
.lab3d .turno.lab{background:rgba(217,70,166,.14);color:#f0a6d6;border:1px solid rgba(217,70,166,.4)}
.lab3d .turno.doctor{background:rgba(212,175,55,.16);color:#f3d77a;border:1px solid rgba(212,175,55,.5)}
.lab3d .turno.fin{background:rgba(0,255,65,.1);color:#7dff9e;border:1px solid rgba(0,255,65,.4)}
.lab3d .turno.cancelado{background:rgba(148,163,184,.12);color:#cbd5e1;border:1px solid rgba(148,163,184,.35)}
.lab3d .cta{display:none;text-decoration:none;margin-top:9px;background:#D4AF37;color:#1a1405;border-radius:50px;padding:7px 14px;font-weight:800;font-size:.76rem}
.lab3d .cta.ver{display:inline-block}
.lab3d .foto{display:flex;align-items:center;gap:9px;margin-top:9px;color:#7dff9e;font-size:.74rem;font-weight:800;text-decoration:none}.lab3d .foto[hidden]{display:none}
.lab3d .foto img{width:54px;height:54px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,255,65,.4)}
.lab3d .barra{height:4px;border-radius:4px;background:rgba(255,255,255,.08);margin-top:10px;overflow:hidden}
.lab3d .barra i{display:block;height:100%;background:linear-gradient(90deg,#D946A6,#D4AF37,#00d2ff);transition:width .5s}
.lab3d .ayuda{position:absolute;right:14px;top:14px;font-size:.72rem;color:#94a3b8;background:rgba(10,15,24,.7);border-radius:50px;padding:6px 12px}
@media(max-width:700px){.lab3d{height:auto}.lab3d .lienzo{position:relative;height:340px}.lab3d .capa{bottom:auto;height:340px;overflow:hidden}.lab3d .ayuda{display:none}.lab3d .et .t{font-size:.6rem;padding:3px 6px}.lab3d .et .palo{height:10px}.lab3d .estado{position:relative;left:auto;bottom:auto;width:auto;max-width:none;margin:0 10px 10px}}
`;

function montar(contenedor, caso0, opciones = {}) {
if (!document.getElementById('lab3d-css')) { const st = document.createElement('style'); st.id = 'lab3d-css'; st.textContent = CSS; document.head.appendChild(st); }
const caja = document.createElement('div'); caja.className = 'lab3d';
caja.innerHTML = '<div class="lienzo" role="img" aria-label="Laboratorio PRODIGY en 3D: la estación iluminada es la etapa actual del caso."></div><div class="capa"><div class="etq-caso" hidden></div></div>'
  + '<div class="estado" aria-live="polite"><small></small><strong></strong><span class="det"></span><span class="turno"></span><br><a class="cta" target="_blank" rel="noopener noreferrer"></a><a class="foto" target="_blank" rel="noopener noreferrer" hidden><img alt="Foto de la entrega de tu caso" loading="lazy"><span>Ver la foto de la entrega</span></a><div class="barra"><i></i></div></div>'
  + '<div class="ayuda">Arrastra para girar · rueda para acercar</div>';
contenedor.textContent = ''; contenedor.appendChild(caja);
const lienzo = caja.querySelector('.lienzo'), capa = caja.querySelector('.capa'), etqCaso = caja.querySelector('.etq-caso');
const ui = { orden: caja.querySelector('.estado small'), nombre: caja.querySelector('.estado strong'), detalle: caja.querySelector('.estado .det'),
             turno: caja.querySelector('.estado .turno'), cta: caja.querySelector('.estado .cta'), foto: caja.querySelector('.estado .foto'), barra: caja.querySelector('.estado .barra i') };
const movil = matchMedia('(max-width: 700px)').matches;
const CE = window.CasoEtapas;
const ESTACIONES = CE.ESTACIONES;
/* ═════════ 2 · Escena ═════════ */
const menosMov = matchMedia('(prefers-reduced-motion: reduce)').matches;
const W = () => lienzo.clientWidth, H = () => lienzo.clientHeight;   // en celular el estado va debajo del lienzo
const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
ren.setPixelRatio(Math.min(devicePixelRatio, movil ? 1.25 : 1.75)); ren.setSize(W(), H());
ren.outputColorSpace = THREE.SRGBColorSpace; ren.toneMapping = THREE.ACESFilmicToneMapping; ren.toneMappingExposure = 1.1;
ren.shadowMap.enabled = !movil; ren.shadowMap.type = THREE.PCFSoftShadowMap;
ren.domElement.dataset.engine = 'three';
lienzo.appendChild(ren.domElement);
const escena = new THREE.Scene();
const pm = new THREE.PMREMGenerator(ren); escena.environment = pm.fromScene(new RoomEnvironment(), .04).texture; escena.environmentIntensity = .55;
const cam = new THREE.PerspectiveCamera(34, W() / H(), .1, 120); cam.position.set(9.5, 8.6, 12.5); if (W() / H() < 1.1) cam.position.multiplyScalar(1.5);   // pantalla angosta: más lejos para que quepa el laboratorio
const ctl = new OrbitControls(cam, ren.domElement);
ctl.enableDamping = true; ctl.enablePan = false; ctl.minDistance = 9; ctl.maxDistance = 34; ctl.maxPolarAngle = Math.PI * .46; ctl.target.set(0, .6, 0);
ctl.autoRotate = !menosMov; ctl.autoRotateSpeed = .4;
escena.add(new THREE.HemisphereLight(0xcfe3ff, 0x1a1020, 1.7));
const sol = new THREE.DirectionalLight(0xffffff, 3.2); sol.position.set(-5, 11, 7); sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, { left: -10, right: 10, top: 9, bottom: -9 }); sol.shadow.bias = -.0003; escena.add(sol);
const contra = new THREE.DirectionalLight(0x9fd8ff, 1.6); contra.position.set(6, 6, -8); escena.add(contra);

const mat = (c, m = .2, r = .45, x = {}) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r, ...x });
const M = {
  base: mat(0x1a2332, .7, .35), placa: mat(0x101722, .6, .4), borde: mat(0x2b3646, .8, .3), cromo: mat(0xc9d1d9, .95, .18),
  oscuro: mat(0x0b1018, .4, .5), negro: mat(0x16191f, .3, .55), blanco: mat(0xe9edf2, .15, .35), zirc: mat(0xf4f1ea, .05, .55),
  vidrio: mat(0x9fd8ff, .1, .05, { transparent: true, opacity: .18, depthWrite: false }), lente: mat(0x1b2a4a, .6, .08),
  resina: mat(0x00d2ff, .1, .2, { transparent: true, opacity: .55 }), estudio: mat(0xffffff, 0, .7, { emissive: 0xffffff, emissiveIntensity: .1 }),
};
const brillo = c => mat(c, .2, .3, { emissive: c, emissiveIntensity: .45 });
const caja3 = (g, w, h, d, x, y, z, m = M.base, r = .05) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 3, h / 3, d / 3)), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; g.add(o); return o; };
const cil = (g, r, h, x, y, z, m = M.cromo, r2 = r, s = 28) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r2, h, s), m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
const UP = new THREE.Vector3(0, 1, 0);
function barra(g, a, b, r, m = M.cromo) { const d = b.clone().sub(a), o = cil(g, r, d.length(), 0, 0, 0, m, r, 10); o.position.copy(a).addScaledVector(d, .5); o.quaternion.setFromUnitVectors(UP, d.normalize()); return o; }
function pantalla(g, w, h, x, y, z, dibujar) {
  const c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * h / w); const k = c.getContext('2d'); dibujar(k, c.width, c.height);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); o.position.set(x, y, z); g.add(o); return o;
}
const txt = (k, s, x, y, tam, col, peso = 800) => { k.fillStyle = col; k.font = `${peso} ${tam}px Inter, sans-serif`; k.fillText(s, x, y); };

// dientes (los usan la bandeja, calidad y terminado)
const esmalte = new THREE.MeshPhysicalMaterial({ color: 0xf7f4ee, roughness: .3, clearcoat: .6 });
const DIM = { i: [.3, .15, .74], l: [.25, .14, .66], c: [.28, .25, .8], p: [.3, .29, .62], m: [.41, .39, .58] };
function dienteGeo(tipo) {
  const [w, d, h] = DIM[tipo];
  const g = new THREE.LatheGeometry([[0, 0], [.42, 0], [.5, .25], [.5, .62], [.44, .86], [.3, .97], [0, 1]].map(([x, y]) => new THREE.Vector2(x, y)), 20); g.scale(w * 2, h, d * 2);
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let k = 0; k < p.count; k++) {
    v.fromBufferAttribute(p, k);
    if (v.y > h * .8) { let b = 0; if (tipo === 'm') b = Math.cos(v.x / w * 3.8) * Math.cos(v.z / d * 3.8) * .05; if (tipo === 'p') b = Math.cos(v.x / w * 3.1) * .045; if (tipo === 'c') b = (1 - Math.abs(v.x) / w) * .1; if (tipo === 'i' || tipo === 'l') { v.z *= .55; b = -.02; } v.y += b; }
    const nx = v.x / w, nz = v.z / d; v.x = w * Math.sign(nx) * Math.pow(Math.abs(nx), .72); v.z = d * Math.sign(nz) * Math.pow(Math.abs(nz), .72);
    p.setXYZ(k, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
}
const corona = (g, x, y, z, s, m = esmalte) => { const o = new THREE.Mesh(dienteGeo('m'), m); o.scale.setScalar(s); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };

// plataforma
const lab = new THREE.Group(); escena.add(lab);
caja3(lab, 15, .4, 9.8, 0, -.2, 0, M.base, .22);
caja3(lab, 14.7, .06, 9.5, 0, .03, 0, M.borde, .15);
caja3(lab, 14.5, .08, 9.3, 0, .09, 0, M.placa, .14);
const piso = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: .3 })); piso.rotation.x = -Math.PI / 2; piso.position.y = -.41; piso.receiveShadow = true; escena.add(piso);
const lineaMarca = caja3(lab, 13.6, .03, .05, 0, -.02, 4.92, brillo(0xD946A6), .01);

// estaciones
const est = {};
for (const [id, d] of Object.entries(ESTACIONES)) {
  const g = new THREE.Group(); g.position.set(...d.pos); lab.add(g);
  caja3(g, 2.3, .14, 1.9, 0, .2, 0, M.oscuro, .1);
  const luz = brillo(d.c); luz.emissiveIntensity = .15; caja3(g, 2.2, .04, 1.8, 0, .29, 0, luz, .09);
  caja3(g, 2.26, .16, 1.86, 0, .38, 0, M.base, .1);
  pantalla(g, 1.4, .3, 0, .38, .94, (k, w, h) => { k.fillStyle = '#0b1018'; k.fillRect(0, 0, w, h); txt(k, d.n.toUpperCase(), 24, h * .7, h * .48, '#' + d.c.toString(16).padStart(6, '0'), 800); });
  est[id] = { id, ...d, g, luz };
}
const S = Object.fromEntries(Object.entries(est).map(([k, v]) => [k, v.g]));

// Recepción · escáner intraoral con la arcada en pantalla
caja3(S.recepcion, 1.1, .9, .8, -.2, .9, -.2, M.blanco, .14);
const varita = cil(S.recepcion, .07, .9, .55, 1.15, .1, M.blanco, .09); varita.rotation.z = .5;
pantalla(S.recepcion, .9, .55, -.2, 1.28, .21, (k, w, h) => { k.fillStyle = '#05131a'; k.fillRect(0, 0, w, h); k.strokeStyle = '#00d2ff'; k.lineWidth = 6; k.beginPath(); k.ellipse(w / 2, h * .9, w * .34, h * .62, 0, Math.PI, 0); k.stroke(); txt(k, 'STL', 18, 50, 40, '#00d2ff'); });

// Diseño CAD · escritorio + monitor con la corona en Exocad
caja3(S.diseno, 1.8, .08, 1.0, 0, .95, -.1, M.borde, .03); for (const x of [-.8, .8]) cil(S.diseno, .04, .5, x, .7, -.1, M.cromo);
cil(S.diseno, .05, .45, 0, 1.2, -.42, M.cromo); caja3(S.diseno, 1.5, .9, .06, 0, 1.78, -.42, M.oscuro, .04);
pantalla(S.diseno, 1.4, .8, 0, 1.78, -.385, (k, w, h) => {
  k.fillStyle = '#0a0f18'; k.fillRect(0, 0, w, h); txt(k, 'EXOCAD', 18, 40, 28, '#D946A6');
  k.fillStyle = '#e9edf2'; k.beginPath(); k.moveTo(w * .36, h * .78); k.bezierCurveTo(w * .3, h * .3, w * .45, h * .22, w * .5, h * .34); k.bezierCurveTo(w * .55, h * .22, w * .7, h * .3, w * .64, h * .78); k.closePath(); k.fill();
  k.strokeStyle = '#D946A6'; k.lineWidth = 4; k.setLineDash([10, 8]); k.beginPath(); k.ellipse(w * .5, h * .78, w * .16, h * .05, 0, 0, Math.PI * 2); k.stroke();
});
caja3(S.diseno, .7, .03, .3, 0, 1.0, .2, M.oscuro, .01);

// Fresado · fresadora de 5 ejes con puerta de vidrio, disco de zirconio y husillo
caja3(S.fresado, 1.6, .4, 1.2, 0, .66, 0, M.blanco, .1);
caja3(S.fresado, 1.6, 1.0, .1, 0, 1.36, -.55, M.blanco, .04);
for (const x of [-.75, .75]) caja3(S.fresado, .1, 1.0, 1.2, x, 1.36, 0, M.blanco, .04);
caja3(S.fresado, 1.6, .36, 1.2, 0, 2.04, 0, M.blanco, .1);
caja3(S.fresado, 1.38, .96, .02, 0, 1.36, -.49, M.oscuro, .01);
caja3(S.fresado, 1.4, .04, 1.0, 0, .88, 0, M.oscuro, .01);
caja3(S.fresado, 1.3, .03, .06, 0, 1.82, .25, brillo(0xffffff), .01);
caja3(S.fresado, 1.42, .94, .03, 0, 1.36, .6, M.vidrio, .01);
for (const y of [.88, 1.84]) caja3(S.fresado, 1.46, .04, .05, 0, y, .61, M.cromo, .01);
for (const x of [-.72, .72]) caja3(S.fresado, .04, .98, .05, x, 1.36, .61, M.cromo, .01);
caja3(S.fresado, .04, .4, .06, .6, 1.36, .66, M.cromo, .02);
caja3(S.fresado, 1.5, .03, .03, 0, 1.87, .61, brillo(0xD4AF37), .01);
pantalla(S.fresado, .86, .2, -.28, 2.04, .605, (k, w, h) => { k.fillStyle = '#e9edf2'; k.fillRect(0, 0, w, h); txt(k, 'PRODIGY', 14, h * .68, h * .5, '#0b1018', 900); txt(k, '5 EJES', w * .62, h * .68, h * .42, '#b8860b', 800); });
pantalla(S.fresado, .34, .22, .5, 2.04, .605, (k, w, h) => { k.fillStyle = '#0a0f18'; k.fillRect(0, 0, w, h); txt(k, 'ZrO2', 14, h * .42, h * .28, '#D4AF37'); k.fillStyle = '#1f2937'; k.fillRect(14, h * .62, w - 28, h * .14); k.fillStyle = '#00FF41'; k.fillRect(14, h * .62, (w - 28) * .64, h * .14); });
caja3(S.fresado, 1.4, .03, .03, 0, .5, .61, brillo(0x00d2ff), .01);
const portaDisco = new THREE.Group(); S.fresado.add(portaDisco); portaDisco.position.set(-.18, 1.34, 0);
portaDisco.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(.36, .045, 14, 48), M.cromo), { castShadow: true }));
const disco = cil(portaDisco, .33, .1, 0, 0, 0, M.zirc, .33, 48); disco.rotation.x = Math.PI / 2;
for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + .4; const pz = cil(portaDisco, .028, .11, Math.cos(a) * .23, Math.sin(a) * .23, .02, M.oscuro); pz.rotation.x = Math.PI / 2; }
caja3(S.fresado, .34, .08, .08, -.58, 1.34, 0, M.cromo, .02);
const husillo = new THREE.Group(); S.fresado.add(husillo); husillo.position.set(.4, 1.34, .05);
cil(husillo, .1, .42, 0, 0, 0, M.blanco).rotation.z = Math.PI / 2;
cil(husillo, .055, .1, -.26, 0, 0, M.cromo).rotation.z = Math.PI / 2;
cil(husillo, .014, .16, -.38, 0, 0, M.cromo, .006).rotation.z = Math.PI / 2;
cil(husillo, .03, .5, .02, .27, 0, M.cromo);

// Impresión 3D · impresora de resina con plataforma que sube
caja3(S.impresion, 1.3, .55, 1.1, 0, .72, 0, M.oscuro, .1); caja3(S.impresion, 1.0, .1, .8, 0, 1.03, 0, M.resina, .03);
cil(S.impresion, .05, 1.4, -.5, 1.7, -.3, M.cromo);
const plato = caja3(S.impresion, .8, .06, .6, 0, 1.6, 0, M.cromo, .02);
caja3(S.impresion, 1.2, 1.3, 1.0, 0, 1.75, 0, new THREE.MeshStandardMaterial({ color: 0x00d2ff, transparent: true, opacity: .14, roughness: .1, depthWrite: false }), .08);

// Terminado · horno de glaseado (cúpula que sube) + paleta de maquillaje, pincel y micromotor de ajuste
caja3(S.terminado, .86, .42, .76, -.4, .67, -.15, M.blanco, .1);                       // cuerpo del horno
pantalla(S.terminado, .5, .16, -.4, .74, .235, (k, w, h) => { k.fillStyle = '#0a0f18'; k.fillRect(0, 0, w, h); txt(k, 'GLAZE 830°C', 12, h * .7, h * .5, '#ffb04d', 800); });
const plataforma = cil(S.terminado, .26, .05, -.4, .91, -.15, brillo(0xff9a3c));      // soporte de cocción (brilla al hornear)
corona(S.terminado, -.47, .94, -.17, .2); corona(S.terminado, -.31, .94, -.1, .18);
const cupula = new THREE.Group(); S.terminado.add(cupula); cupula.position.set(-.4, 1.12, -.15);
cil(cupula, .34, .36, 0, 0, 0, M.blanco, .36); cil(cupula, .24, .1, 0, .22, 0, M.blanco, .34);
const brasa = cil(cupula, .28, .02, 0, -.18, 0, brillo(0xff9a3c));
cil(S.terminado, .03, .7, -.82, 1.05, -.15, M.cromo);                                    // poste de la cúpula
caja3(S.terminado, .58, .04, .4, .48, .48, .3, M.blanco, .02);                           // paleta de maquillaje
[0xf3e6c8, 0xe8d3a8, 0xd8b98a, 0xc9a06b, 0x7fa7d6, 0xb97a56].forEach((c, k) => cil(S.terminado, .045, .02, .3 + (k % 3) * .17, .51, .22 + Math.floor(k / 3) * .16, mat(c, 0, .5), .045, 16));
const pincel = new THREE.Group(); S.terminado.add(pincel); pincel.position.set(.5, .62, -.25);
barra(pincel, new THREE.Vector3(-.22, -.02, 0), new THREE.Vector3(.2, .1, 0), .015, M.negro); cil(pincel, .006, .07, -.25, -.04, 0, mat(0xD946A6, .1, .5), .018).rotation.z = 1.3;
const micro = cil(S.terminado, .045, .38, .78, .55, -.42, M.cromo, .035); micro.rotation.z = Math.PI / 2; micro.rotation.y = .5;
corona(S.terminado, .22, .5, -.5, .22);

// Calidad · estudio de fotografía: cámara en trípode apuntando a la corona sobre una base giratoria
caja3(S.calidad, 1.0, .04, .9, -.55, .48, -.1, M.estudio, .02);                          // fondo infinito (base)
caja3(S.calidad, 1.0, .85, .04, -.55, .9, -.55, M.estudio, .02);                         // fondo infinito (pared)
cil(S.calidad, .02, .9, -1.0, .93, -.45, M.cromo); caja3(S.calidad, .36, .36, .08, -1.0, 1.45, -.4, M.estudio, .03).rotation.y = .5;   // luz del estudio
const giratoria = new THREE.Group(); S.calidad.add(giratoria); giratoria.position.set(-.55, .52, -.12);
cil(giratoria, .2, .05, 0, 0, 0, M.cromo, .22); const coronaQA = corona(giratoria, 0, .03, 0, .34);
const tripode = new THREE.Vector3(.1, 1.12, .5);
for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + .3; barra(S.calidad, tripode.clone().setY(1.0), new THREE.Vector3(tripode.x + Math.cos(a) * .3, .47, tripode.z + Math.sin(a) * .3), .018, M.negro); }
cil(S.calidad, .025, .24, tripode.x, 1.06, tripode.z, M.cromo);
const camara = new THREE.Group(); S.calidad.add(camara); camara.position.copy(tripode).setY(1.3); camara.scale.setScalar(1.45);
caja3(camara, .44, .28, .16, 0, 0, 0, M.negro, .04);                                    // cuerpo
caja3(camara, .12, .26, .12, -.17, -.01, .06, M.negro, .04);                            // empuñadura
caja3(camara, .16, .1, .12, .02, .17, -.01, M.negro, .03);                              // visor
const flash = caja3(camara, .14, .07, .08, .02, .26, .01, mat(0xffffff, 0, .3, { emissive: 0xffffff, emissiveIntensity: .05 }), .02);
cil(camara, .016, .02, -.14, .15, .02, brillo(0xD946A6), .016, 12);                      // disparador
const objetivo = cil(camara, .1, .26, .03, 0, .2, M.negro, .11, 32); objetivo.rotation.x = Math.PI / 2;
for (const z of [.14, .27]) { const a = cil(camara, .105, .02, .03, 0, z, M.cromo, .105, 32); a.rotation.x = Math.PI / 2; }
const vidrioObj = new THREE.Mesh(new THREE.CircleGeometry(.085, 32), M.lente); vidrioObj.position.set(.03, 0, .335); camara.add(vidrioObj);
const luzFlash = new THREE.PointLight(0xffffff, 0, 3.5); luzFlash.position.set(.02, .3, .3); camara.add(luzFlash);
// microscopio estereoscópico: revisión de márgenes, contactos y anatomía
const microscopio = new THREE.Group(); S.calidad.add(microscopio); microscopio.position.set(.62, .46, -.3); microscopio.scale.setScalar(1.25);
caja3(microscopio, .42, .07, .42, 0, .04, 0, M.blanco, .03);                                   // base
cil(microscopio, .1, .02, 0, .09, .06, M.oscuro, .1); corona(microscopio, 0, .1, .06, .14);            // platina con una corona
cil(microscopio, .035, .78, 0, .45, -.16, M.cromo);                                            // columna
caja3(microscopio, .13, .16, .12, 0, .62, -.1, M.blanco, .03);                                 // cremallera de enfoque
cil(microscopio, .045, .24, 0, .62, -.1, M.negro).rotation.z = Math.PI / 2;                    // perillas
caja3(microscopio, .22, .15, .2, 0, .76, .03, M.blanco, .04);                                  // cabezal
cil(microscopio, .05, .12, 0, .64, .05, M.negro);                                              // objetivo
const aro = new THREE.Mesh(new THREE.TorusGeometry(.065, .012, 8, 28), brillo(0xffffff)); aro.rotation.x = Math.PI / 2; aro.position.set(0, .58, .05); microscopio.add(aro);   // luz anular
for (const x of [-.05, .05]) { barra(microscopio, new THREE.Vector3(x, .82, 0), new THREE.Vector3(x * 1.3, .98, .13), .028, M.negro); cil(microscopio, .034, .04, x * 1.3, 1.0, .14, M.negro); }   // oculares
pantalla(S.calidad, .4, .18, .72, .66, .62, (k, w, h) => { k.fillStyle = '#04150a'; k.fillRect(0, 0, w, h); txt(k, 'QA ✓ FOTOS', 14, h * .68, h * .5, '#00FF41', 900); });

// Empaque · cajas selladas, cinta y la guía impresa
const cajas = new THREE.Group(); S.empaque.add(cajas); cajas.position.x = -.25;
caja3(S.empaque, .34, .1, .16, .7, .51, -.45, M.negro, .03); cil(S.empaque, .1, .08, .7, .62, -.45, mat(0xc9a36a, .1, .4)).rotation.x = Math.PI / 2;   // cinta
caja3(S.empaque, .32, .2, .28, .7, .56, .3, M.blanco, .05);                                                                                         // impresora de guías
pantalla(S.empaque, .26, .1, .7, .6, .445, (k, w, h) => { k.fillStyle = '#ffffff'; k.fillRect(0, 0, w, h); k.fillStyle = '#0b1018'; for (let i = 0; i < 18; i++) k.fillRect(10 + i * 9, 8, i % 3 ? 3 : 6, h * .55); txt(k, 'GUÍA', w * .62, h * .78, h * .4, '#b8860b', 900); });
// Entrega · el consultorio del doctor: sillón odontológico y la caja ya recibida (o el portátil si es solo diseño)
const tapiz = mat(0xD946A6, .1, .55);
cil(S.entrega, .26, .1, -.25, .5, 0, M.blanco, .3); cil(S.entrega, .07, .3, -.25, .68, 0, M.cromo);
caja3(S.entrega, .78, .1, .42, -.15, .86, 0, tapiz, .05);                                                  // asiento
const respaldo = caja3(S.entrega, .56, .1, .4, -.68, 1.04, 0, tapiz, .05); respaldo.rotation.z = -.55;     // respaldo reclinado
const cabecera = caja3(S.entrega, .18, .08, .24, -.95, 1.22, 0, tapiz, .04); cabecera.rotation.z = -.55;
const piernas = caja3(S.entrega, .42, .08, .38, .42, .78, 0, tapiz, .04); piernas.rotation.z = -.35;     // apoyapiernas
cil(S.entrega, .03, 1.2, .3, 1.05, -.6, M.cromo);                                                          // poste de la lámpara
barra(S.entrega, new THREE.Vector3(.3, 1.62, -.6), new THREE.Vector3(-.3, 1.55, -.25), .025, M.cromo);
caja3(S.entrega, .26, .08, .16, -.34, 1.5, -.22, brillo(0xffffff), .04);                                  // lámpara
const cajaRecibida = new THREE.Group(); S.entrega.add(cajaRecibida);
caja3(cajaRecibida, .36, .24, .3, .72, .58, .5, mat(0xc9a36a, .05, .8), .03); caja3(cajaRecibida, .37, .03, .31, .72, .7, .5, brillo(0xD4AF37), .01);
const digital = new THREE.Group(); S.entrega.add(digital); digital.position.set(.62, .185, .38); digital.scale.setScalar(.55);
caja3(cajas, .9, .6, .7, -.2, .75, -.1, mat(0xc9a36a, .05, .8), .04); caja3(cajas, .7, .45, .55, .55, .68, .25, mat(0xb88f55, .05, .8), .04); caja3(cajas, .55, .4, .45, -.15, 1.25, -.1, mat(0xd8b67d, .05, .8), .04);
caja3(cajas, .91, .06, .08, -.2, .75, .27, brillo(0xD4AF37), .01);
caja3(digital, 1.1, .05, .72, 0, .5, .05, M.borde, .03);
const tapa = new THREE.Group(); digital.add(tapa); tapa.position.set(0, .52, -.31); tapa.rotation.x = -.22;
caja3(tapa, 1.1, .7, .04, 0, .35, 0, M.borde, .03);
pantalla(tapa, 1.0, .6, 0, .35, .025, (k, w, h) => { k.fillStyle = '#05131a'; k.fillRect(0, 0, w, h); k.strokeStyle = '#00d2ff'; k.lineWidth = 12; k.lineCap = 'round'; k.beginPath(); k.moveTo(w / 2, h * .18); k.lineTo(w / 2, h * .58); k.moveTo(w / 2 - 50, h * .44); k.lineTo(w / 2, h * .6); k.lineTo(w / 2 + 50, h * .44); k.stroke(); txt(k, 'STL · HTML 3D', w / 2 - 130, h * .86, 40, '#e2e8f0', 800); });

// Reparto · moto del mensajero (Bogotá) y camión de la transportadora (otras ciudades)
const RUEDA = (g, r, x, y, z) => { const w = new THREE.Group(); g.add(w); w.position.set(x, y, z);
  w.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(r, r * .34, 10, 26), M.negro), { castShadow: true }));
  const c = cil(w, r * .45, r * .5, 0, 0, 0, M.cromo, r * .45, 16); c.rotation.x = Math.PI / 2; return w; };
const moto = new THREE.Group(); lab.add(moto);
const ruedasMoto = [RUEDA(moto, .18, -.38, .24, 0), RUEDA(moto, .18, .38, .24, 0)];
caja3(moto, .5, .16, .16, 0, .42, 0, M.negro, .05);                                              // chasis
caja3(moto, .26, .15, .2, .1, .53, 0, mat(0xD946A6, .3, .35), .07);                               // tanque magenta
caja3(moto, .3, .06, .18, -.13, .56, 0, M.negro, .03);                                           // sillín
barra(moto, new THREE.Vector3(.38, .24, 0), new THREE.Vector3(.28, .68, 0), .022, M.cromo);       // horquilla
cil(moto, .015, .38, .28, .69, 0, M.negro).rotation.x = Math.PI / 2;                               // manubrio
cil(moto, .05, .05, .34, .6, 0, brillo(0xffffff), .05, 16).rotation.z = Math.PI / 2;               // farola
const cajaMoto = caja3(moto, .34, .3, .34, -.34, .76, 0, mat(0xD946A6, .1, .5), .04);             // baúl con el caso
caja3(moto, .345, .04, .345, -.34, .8, 0, brillo(0xD4AF37), .01);
pantalla(moto, .26, .08, -.34, .7, .172, (k, w, h) => { k.fillStyle = '#D946A6'; k.fillRect(0, 0, w, h); txt(k, 'PRODIGY', 18, h * .74, h * .62, '#ffffff', 900); });
const piloto = new THREE.Group(); moto.add(piloto);
const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.09, .22, 6, 12), M.oscuro); torso.position.set(-.06, .78, 0); torso.rotation.z = -.35; torso.castShadow = true; piloto.add(torso);
const casco = new THREE.Mesh(new THREE.SphereGeometry(.1, 20, 14), mat(0xD946A6, .4, .25)); casco.position.set(.02, 1.0, 0); piloto.add(casco);
const visor = new THREE.Mesh(new THREE.SphereGeometry(.101, 20, 14, -Math.PI / 4, Math.PI / 2, Math.PI / 3, Math.PI / 4), M.lente); visor.position.copy(casco.position); piloto.add(visor);
for (const z of [-.11, .11]) { barra(piloto, new THREE.Vector3(.0, .88, z * .6), new THREE.Vector3(.27, .7, z * 1.4), .03, M.oscuro); barra(piloto, new THREE.Vector3(-.12, .6, z * .7), new THREE.Vector3(.05, .34, z * 1.1), .035, M.oscuro); }
moto.scale.setScalar(1.1);
const camion = new THREE.Group(); lab.add(camion); camion.position.set(-3.0, .13, 3.95); camion.visible = false;
const ruedasCamion = [];
for (const x of [-.45, .5]) for (const z of [-.29, .29]) ruedasCamion.push(RUEDA(camion, .13, x, .17, z));
caja3(camion, 1.1, .64, .6, -.15, .64, 0, M.blanco, .05);                                        // furgón
caja3(camion, 1.12, .05, .62, -.15, .36, 0, M.borde, .02);
caja3(camion, .44, .5, .58, .6, .55, 0, mat(0x1a2332, .5, .35), .08);                             // cabina
caja3(camion, .03, .2, .48, .82, .66, 0, M.lente, .01);                                          // parabrisas
for (const z of [-.2, .2]) cil(camion, .04, .03, .83, .42, z, brillo(0xffffff), .04, 12).rotation.z = Math.PI / 2;
pantalla(camion, .9, .3, -.15, .68, .302, (k, w, h) => { k.fillStyle = '#ffffff'; k.fillRect(0, 0, w, h); k.fillStyle = '#D946A6'; k.fillRect(0, h * .78, w, h * .22);
  txt(k, 'PRODIGY', 22, h * .55, h * .42, '#0b1018', 900); txt(k, 'ENVÍOS', w * .6, h * .55, h * .3, '#b8860b', 800); });
let transito = null, xRuta = -2.2;
const aparcarMoto = () => { moto.position.set(-2.75, .4, 2.45); moto.rotation.y = Math.PI + .35; moto.scale.setScalar(1.1); };   // parqueada en la estación Reparto
aparcarMoto();

// banda transportadora y la bandeja del caso
const via = new THREE.CatmullRomCurve3([[-5.0, .62, -.9], [-1.7, .62, -1.5], [1.7, .62, -1.5], [5.0, .62, -.9], [5.8, .62, .7], [4.6, .62, 1.05], [0, .62, 1.2], [-4.6, .62, 1.05], [-5.8, .62, .7]].map(p => new THREE.Vector3(...p)), true, 'catmullrom', .3);
const banda = new THREE.Mesh(new THREE.TubeGeometry(via, 160, .3, 8, true), M.oscuro); banda.scale.y = .25; banda.position.y = .47; lab.add(banda);
const N = 120, tablillas = new THREE.InstancedMesh(new RoundedBoxGeometry(.12, .05, .5, 1, .01), M.borde, N); lab.add(tablillas);
const d0 = new THREE.Object3D(), pv = new THREE.Vector3(), tv = new THREE.Vector3();
function moverBanda(t) { for (let i = 0; i < N; i++) { const u = (i / N + t * .01) % 1; via.getPointAt(u, pv); via.getTangentAt(u, tv); d0.position.copy(pv); d0.rotation.set(0, -Math.atan2(tv.z, tv.x), 0); d0.updateMatrix(); tablillas.setMatrixAt(i, d0.matrix); } tablillas.instanceMatrix.needsUpdate = true; }
const caso = new THREE.Group(); lab.add(caso);
const bandeja = new THREE.Group(); caso.add(bandeja); bandeja.position.y = .08;
const plastico = mat(0xD946A6, .05, .45, { emissive: 0xD946A6, emissiveIntensity: .12 });
caja3(bandeja, 1.0, .05, .74, 0, 0, 0, plastico, .03);
for (const z of [-.35, .35]) caja3(bandeja, 1.0, .16, .04, 0, .08, z, plastico, .02);
for (const x of [-.48, .48]) caja3(bandeja, .04, .16, .74, x, .08, 0, plastico, .02);
pantalla(bandeja, .3, .09, .3, .1, .375, (k, w, h) => { k.fillStyle = '#ffffff'; k.fillRect(0, 0, w, h); txt(k, 'CASO', 12, h * .72, h * .6, '#9c27b0', 900); });
const modelo = new THREE.Group(); bandeja.add(modelo); modelo.scale.setScalar(.14); modelo.position.set(0, .05, -.04);
const yeso = new THREE.MeshPhysicalMaterial({ color: 0xece5d6, roughness: .6, clearcoat: .15 });
const encia = new THREE.MeshPhysicalMaterial({ color: 0xd98a96, roughness: .45, clearcoat: .3 });
const curva = t => { const a = (t - .5) * Math.PI * .92; return new THREE.Vector3(Math.sin(a) * 2.35, 0, -Math.cos(a) * 2.6 + 1.25); };
const TIPOS = ['m', 'm', 'p', 'p', 'c', 'l', 'i', 'i', 'l', 'c', 'p', 'p', 'm', 'm'];
TIPOS.forEach((tp, k) => { const t = k / (TIPOS.length - 1), pos = curva(t), tan = curva(Math.min(1, t + .01)).sub(curva(Math.max(0, t - .01))).normalize();
  const m = new THREE.Mesh(dienteGeo(tp), esmalte); m.position.set(pos.x, .02, pos.z); m.rotation.y = Math.atan2(tan.x, tan.z) + Math.PI / 2; m.castShadow = true; modelo.add(m); });
function herradura(r, alto, y, m) {
  const sh = new THREE.Shape(), NN = 40;
  for (let k = 0; k <= NN; k++) { const p = curva(k / NN), n = new THREE.Vector3(p.x, 0, p.z - 1.25).normalize(); sh[k ? 'lineTo' : 'moveTo'](p.x + n.x * r, p.z + n.z * r); }
  for (let k = NN; k >= 0; k--) { const p = curva(k / NN), n = new THREE.Vector3(p.x, 0, p.z - 1.25).normalize(); sh.lineTo(p.x - n.x * r, p.z - n.z * r); }
  const g = new THREE.ExtrudeGeometry(sh, { depth: alto, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 2 }); g.rotateX(Math.PI / 2); g.translate(0, y + alto, 0);
  const o = new THREE.Mesh(g, m); o.castShadow = true; modelo.add(o);
}
herradura(.4, .44, -.26, encia); herradura(.6, .36, -.62, yeso);
const halo = new THREE.Mesh(new THREE.RingGeometry(.6, .65, 56), new THREE.MeshBasicMaterial({ color: 0xD946A6, transparent: true, opacity: .8, side: THREE.DoubleSide })); halo.rotation.x = -Math.PI / 2; halo.position.y = -.02; caso.add(halo);
const puerto = {};
for (const e of Object.values(est)) { let best = 0, dist = 1e9; for (let i = 0; i < 400; i++) { const p = via.getPointAt(i / 400), dd = (p.x - e.pos[0]) ** 2 + (p.z - e.pos[2] * .45) ** 2; if (dd < dist) { dist = dd; best = i / 400; } } puerto[e.id] = best; }

// la cámara del estudio apunta a la corona
lab.updateMatrixWorld(true); camara.lookAt(coronaQA.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, .08, 0)));

/* ═════════ 3 · Etiquetas y estado del caso (de CasoEtapas) ═════════ */
for (const e of Object.values(est)) { const el = document.createElement('div'); el.className = 'et'; el.innerHTML = '<div class="t"><b></b><span></span></div><div class="palo"></div>'; el.querySelector('span').textContent = e.n; capa.appendChild(el); e.el = el; e.ancla = new THREE.Vector3(); }
const proyectar = (v, el) => { const p = v.clone().project(cam); el.style.left = ((p.x + 1) / 2 * W()) + 'px'; el.style.top = ((1 - p.y) / 2 * H()) + 'px'; el.style.opacity = p.z < 1 ? 1 : 0; };
function etiquetas() {
  for (const e of Object.values(est)) { e.ancla.set(0, e.pos[2] > 0 ? 1.95 : 2.45, 0); e.g.localToWorld(e.ancla); proyectar(e.ancla, e.el); }
  if (!etqCaso.hidden) proyectar(transito ? (transito === 'moto' ? moto : camion).localToWorld(new THREE.Vector3(0, transito === 'moto' ? 1.25 : 1.15, 0)) : caso.localToWorld(new THREE.Vector3(0, 1.0, 0)), etqCaso);
}
const HALO = { lab: 0xD946A6, doctor: 0xD4AF37, fin: 0x00FF41, cancelado: 0x64748b };
let u = null, uCaso = 0, uDestino = 0;
function aplicar(datos, saltar) {
  u = CE.leer(datos); const F = u.F, idx = u.idx, cod = String(datos.codigo || '');
  for (const e of Object.values(est)) {
    const k = F.pasos.indexOf(e.id), en = k >= 0;
    e.el.classList.toggle('fuera', !en);
    e.el.querySelector('b').textContent = en ? String(k + 1).padStart(2, '0') : '—';
    if (!en) { e.el.classList.remove('activa', 'espera', 'hecha'); continue; }
    e.el.classList.toggle('activa', k === idx && u.turno !== 'doctor' && u.turno !== 'cancelado');
    e.el.classList.toggle('espera', k === idx && u.turno === 'doctor');
    e.el.classList.toggle('hecha', u.turno === 'fin' ? true : k < idx);
  }
  digital.visible = !!F.digital; cajaRecibida.visible = !F.digital;
  est.entrega.el.querySelector('span').textContent = F.digital ? 'Entregado (digital)' : 'Entregado';
  uDestino = puerto[u.paso]; if (saltar) uCaso = puerto.recepcion;
  halo.material.color.setHex(HALO[u.turno]); plastico.color.setHex(u.turno === 'cancelado' ? 0x64748b : 0xD946A6); plastico.emissive.setHex(u.turno === 'cancelado' ? 0x000000 : 0xD946A6);
  transito = u.vehiculo || null; xRuta = -2.2;
  camion.visible = transito === 'camion'; cajaMoto.visible = transito !== 'camion';
  etqCaso.hidden = u.turno !== 'doctor' && !transito;
  etqCaso.classList.toggle('transito', !!transito);
  etqCaso.textContent = transito === 'moto' ? '🏍️ En camino' : transito === 'camion' ? '🚚 En camino · transportadora' : '⏸ Esperando al doctor';
  ui.orden.textContent = `Orden ${cod || '—'} · ${F.n}`;
  ui.nombre.textContent = u.t;
  ui.detalle.textContent = u.d;
  ui.turno.className = 'turno ' + u.turno;
  ui.turno.textContent = u.turno === 'lab' ? `${CE.TURNO_TXT.lab} · ${est[u.paso].n}` : CE.TURNO_TXT[u.turno];
  const mostrarCta = !!u.cta && !opciones.sinBoton;
  ui.cta.classList.toggle('ver', mostrarCta); ui.cta.textContent = u.cta || '';
  ui.cta.href = u.ir === 'rastreo' ? u.rastreo : u.ir === 'wa' ? 'https://wa.me/573212816716?text=' + encodeURIComponent('Hola, escribo por mi caso ' + cod)
                              : '/app/login.html?redirect=' + encodeURIComponent('/app/client-panel.html#aprobar=' + cod);
  // Entregado: la foto que tomó el mensajero (enlace firmado de nuestro Supabase)
  const foto = u.turno === 'fin' && /^https:\/\/[a-z0-9]+\.supabase\.co\//.test(datos.foto_entrega || '') ? datos.foto_entrega : '';
  ui.foto.hidden = !foto; if (foto) { ui.foto.href = foto; ui.foto.querySelector('img').src = foto; }
  ui.barra.style.width = (u.turno === 'fin' ? 100 : u.turno === 'cancelado' ? 0 : (idx + .5) / F.pasos.length * 100) + '%';
}
aplicar(caso0, true); uCaso = uDestino;

/* ═════════ 4 · Animación (se pausa fuera de pantalla; quieta con «reducir movimiento») ═════════ */
let visible = true; const io_ = new IntersectionObserver(([x]) => { visible = x.isIntersecting; }); io_.observe(caja);
const reloj = new THREE.Clock(); let t = 0, ultimoFlash = 0;
let raf = 0, vivo = true;
function cuadro() {
  if (!vivo) return;
  raf = requestAnimationFrame(cuadro);
  if (!visible || document.hidden) return;
  const dt = Math.min(reloj.getDelta(), .05); if (!menosMov) t += dt;
  moverBanda(t);
  const d = (uDestino - uCaso + 1) % 1; if (d > .002) uCaso = (uCaso + Math.min(d, dt * (menosMov ? 1 : .2))) % 1; else uCaso = uDestino;
  via.getPointAt(uCaso, pv); caso.position.set(pv.x, pv.y + .12, pv.z);
  via.getTangentAt(uCaso, tv); bandeja.rotation.y = -Math.atan2(tv.z, tv.x);
  const espera = u.turno === 'doctor', vel = espera ? 1.4 : 3;
  bandeja.position.y = .08 + (espera ? 0 : Math.sin(t * 2.2) * .015);
  halo.scale.setScalar(1 + Math.sin(t * vel) * (espera ? .14 : .08)); halo.material.opacity = .55 + Math.sin(t * vel) * .25;
  for (const e of Object.values(est)) {
    const k = u.F.pasos.indexOf(e.id), idx = u.idx;
    const obj = k < 0 ? .04 : k === idx && u.turno !== 'cancelado' ? 1.6 + Math.sin(t * vel) * .4 : (k < idx || u.turno === 'fin' ? .35 : .12);
    e.luz.emissiveIntensity += (obj - e.luz.emissiveIntensity) * .1;
  }
  const aqui = id => u.paso === id && u.turno === 'lab';
  { const k = aqui('fresado') ? 1 : .3; husillo.position.x = .4 + Math.sin(t * 2.4) * .05 * k; husillo.position.y = 1.34 + Math.sin(t * 1.3) * .12 * k; portaDisco.rotation.y = Math.sin(t * .6) * .35 * k; }
  plato.position.y = 1.35 + (Math.sin(t * (aqui('impresion') ? .8 : .25)) * .5 + .5) * .5;
  { const k = aqui('terminado') ? 1 : 0; cupula.position.y = 1.12 + (Math.sin(t * .7) * .5 + .5) * .32 * k; brasa.material.emissiveIntensity = .2 + k * (1.2 + Math.sin(t * 2) * .4); plataforma.material.emissiveIntensity = .15 + k * (.8 + Math.sin(t * 2) * .3); pincel.rotation.z = Math.sin(t * 3) * .15 * k; }
  giratoria.rotation.y += dt * (aqui('calidad') ? .9 : .2);
  if (aqui('calidad') && t - ultimoFlash > 2.4) ultimoFlash = t;
  { const f = aqui('calidad') ? Math.max(0, 1 - (t - ultimoFlash) * 5) : 0; luzFlash.intensity = f * 18; flash.material.emissiveIntensity = .05 + f * 3; }
  caso.visible = !transito;
  { const v = transito === 'camion' ? camion : moto, ruedas = transito === 'camion' ? ruedasCamion : ruedasMoto, r = transito === 'camion' ? .13 : .18;
    if (transito) {
      // de Reparto (x −2.2) al consultorio (x −5.6) por el carril del frente; al llegar se achica y vuelve a salir
      const paso = menosMov ? 0 : dt * .9; xRuta -= paso; if (xRuta < -5.6) xRuta = -2.2;
      v.position.set(menosMov ? -3.9 : xRuta, .13, 4.15); v.rotation.y = Math.PI; ruedas.forEach(w => { w.rotation.z -= paso / r; });
      const e = Math.min(1, (xRuta + 5.6) / .6); v.scale.setScalar((transito === 'moto' ? 1.1 : 1) * (menosMov ? 1 : Math.max(.001, e)));
      if (transito === 'camion') aparcarMoto();
    } else aparcarMoto();
    piloto.visible = transito === 'moto'; }
  lineaMarca.material.emissiveIntensity = .4 + Math.sin(t * 1.5) * .2;
  ctl.update(); etiquetas(); ren.render(escena, cam);
}
cuadro();
const alRedimensionar = () => { cam.aspect = W() / H(); cam.updateProjectionMatrix(); ren.setSize(W(), H()); };
addEventListener('resize', alRedimensionar);

return {
  actualizar(datos) { aplicar(datos, false); },
  destruir() { vivo = false; cancelAnimationFrame(raf); io_.disconnect(); removeEventListener('resize', alRedimensionar); ctl.dispose(); ren.dispose(); pm.dispose(); contenedor.textContent = ''; },
};
}

window.ProdigyLab3D = { montar };
window.dispatchEvent(new Event('prodigy-lab3d-listo'));
