/**
 * Liquid Sculpture Hero — motor de partículas líquidas (WebGL2 GPGPU)
 * Portado a JS VANILLA para PRODIGY desde el componente React de guglielmogiannattasio.it.
 * Crédito al autor original del efecto. Aquí sin React/shadcn/TS: un <canvas> + este módulo.
 *
 * Uso:
 *   LiquidHero.mount({ container:'#mi-hero', src:'/img/escultura.webp', imageBackground:'#EAE9E7' });
 * Sin WebGL2 (o si falla), muestra la imagen estática. Respeta prefers-reduced-motion.
 */
(function (global) {
  "use strict";

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function def(v, d) { return v === undefined || v === null ? d : v; }

  function hexToRgb(hex, fallback) {
    if (typeof hex !== "string") return fallback;
    var s = hex.trim();
    var m = s.match(/^#?([0-9a-f]{3})$/i);
    if (m) { var p = m[1].split("").map(function (c) { return parseInt(c + c, 16) / 255; }); return [p[0], p[1], p[2]]; }
    m = s.match(/^#?([0-9a-f]{6})([0-9a-f]{2})?$/i);
    if (m) { var n = parseInt(m[1], 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; }
    m = s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
    if (m) return [+m[1] / 255, +m[2] / 255, +m[3] / 255];
    return fallback;
  }

  /* ── shaders ───────────────────────────────────────────────────── */
  var NOISE = "\nfloat hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }\nfloat vnoise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);\n  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }\nvec2 ambientField(vec2 uv, float t){\n  vec2 q = uv*vec2(3.2,1.7);\n  vec2 a = vec2(vnoise(q+vec2(t*0.11,0.0))-0.5, vnoise(q+vec2(5.2,t*0.08)+3.1)-0.5);\n  vec2 q2 = uv*vec2(7.5,4.0) + vec2(-t*0.19, t*0.13);\n  vec2 b = vec2(vnoise(q2+1.7)-0.5, vnoise(q2+9.3)-0.5);\n  return a + b*0.45;\n}\n";

  var ENERGY = "\nfloat energyAt(vec2 rectPx, vec2 mouse, float radius, float presence, float wakeEnergy){\n  vec2 d = rectPx - mouse;\n  float f = exp(-dot(d,d)/(radius*radius))*presence;\n  return smoothstep(0.06, 0.5, f*1.15 + wakeEnergy*1.7);\n}\n";

  var QUAD_VS = "#version 300 es\nlayout(location=0) in vec2 aPos;\nout vec2 vUv;\nvoid main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.0,1.0); }\n";

  var FLOW_FS = "#version 300 es\nprecision highp float;\nin vec2 vUv;\nout vec4 o;\nuniform sampler2D uPrev;\nuniform vec2 uTexel;\nuniform vec2 uMouse;\nuniform vec2 uVel;\nuniform vec2 uSize;\nuniform float uRadius;\nuniform float uPresence;\nuniform float uDecay;\nvec2 decV(vec4 c){ return (c.rg*255.0-128.0)/127.0; }\nvoid main(){\n  vec2 v0 = decV(texture(uPrev, vUv));\n  vec2 uv = vUv - v0*uTexel*2.5;\n  vec4 c = texture(uPrev, uv)*0.52\n    + 0.12*(texture(uPrev, uv+vec2(uTexel.x,0.0)) + texture(uPrev, uv-vec2(uTexel.x,0.0))\n          + texture(uPrev, uv+vec2(0.0,uTexel.y)) + texture(uPrev, uv-vec2(0.0,uTexel.y)));\n  vec2 v = decV(c);\n  float p = c.b;\n  vec2 d = (vUv-uMouse)*uSize;\n  float f = exp(-dot(d,d)/(uRadius*uRadius))*uPresence;\n  float sp = clamp(length(uVel)*2.5, 0.0, 1.0);\n  v += uVel*f*0.22;\n  p = max(p, f*sp);\n  v *= uDecay;\n  p *= uDecay;\n  v = sign(v)*max(abs(v)-1.2/127.0, 0.0);\n  p = max(p-1.2/255.0, 0.0);\n  v = clamp(v, -1.0, 1.0);\n  o = vec4((v*127.0+128.0)/255.0, p, 1.0);\n}\n";

  var SIM_FS = "#version 300 es\nprecision highp float;\nout vec4 o;\nuniform sampler2D uState;\nuniform sampler2D uHome;\nuniform sampler2D uFlow;\nuniform vec2 uSize;\nuniform vec2 uMouse;\nuniform float uRadius;\nuniform float uPresence;\nuniform float uStrength;\nuniform float uSpread;\nuniform float uTurb;\nuniform float uReturn;\nuniform float uTime;\nuniform float uDt;\nuniform float uIntro;\n" + NOISE + "\nvec2 curl(vec2 p){\n  const float e = 0.35;\n  float a = vnoise(p+vec2(0.0,e)) - vnoise(p-vec2(0.0,e));\n  float b = vnoise(p+vec2(e,0.0)) - vnoise(p-vec2(e,0.0));\n  return vec2(a, -b)/(2.0*e);\n}\nvoid main(){\n  ivec2 ij = ivec2(gl_FragCoord.xy);\n  vec4 hm = texelFetch(uHome, ij, 0);\n  if(hm.w <= 0.0){ o = vec4(0.0); return; }\n  vec4 st = texelFetch(uState, ij, 0);\n  vec2 off = st.xy;\n  vec2 vel = st.zw;\n  float sd = hm.z;\n  float light = 0.45 + sd*1.1;\n\n  vec2 p = hm.xy*uSize + off;\n  vec4 fl = texture(uFlow, clamp(p/uSize, 0.0, 1.0));\n  vec2 wake = (fl.rg*255.0-128.0)/127.0;\n  float pr = fl.b;\n\n  vec2 toM = p - uMouse;\n  float r2 = dot(toM,toM);\n  float f = exp(-r2/(uRadius*uRadius))*uPresence;\n  vec2 n = toM*inversesqrt(r2+1.0);\n  float e = clamp(pr*2.0 + f, 0.0, 1.0);\n\n  vec2 acc = vec2(0.0);\n  acc += n*f*1.25*uStrength*uSpread*light;\n  acc += vec2(-n.y, n.x)*f*1.45*uStrength*uSpread*(0.4+sd);\n  acc += (wake*42.0*uSpread*light - vel)*e*0.08;\n  vec2 q = p*0.0095 + vec2(uTime*0.35, -uTime*0.2);\n  vec2 c = curl(q) + 0.5*curl(q*2.3 + 7.1);\n  acc += c*(e*1.2*uSpread + uIntro*1.5)*uTurb*light;\n  float k = (0.006 + 0.02*uReturn)*(0.65+sd*0.7)*(1.0 - uIntro*0.75);\n  acc -= off*k;\n\n  vel += acc*uDt;\n  vel *= pow(mix(0.93, 0.955, e), uDt);\n  off += vel*uDt;\n  if(dot(off,off) < 0.0004 && dot(vel,vel) < 0.0004){ off = vec2(0.0); vel = vec2(0.0); }\n  o = vec4(off, vel);\n}\n";

  var PART_VS = "#version 300 es\nprecision highp float;\nlayout(location=0) in vec2 aCorner;\nuniform sampler2D uState;\nuniform sampler2D uHome;\nuniform sampler2D uCol;\nuniform sampler2D uFlow;\nuniform int uTexW;\nuniform vec4 uRect;\nuniform vec2 uRes;\nuniform vec2 uMouse;\nuniform float uRadius;\nuniform float uPresence;\nuniform float uDot;\nuniform float uTime;\nuniform float uAmbient;\nuniform float uStreak;\nuniform float uIntroVis;\nuniform float uRest;\nuniform vec3 uTint;\nout vec2 vLocal;\nout float vHalfLen;\nout float vR;\nout vec3 vCol;\nout float vA;\n" + NOISE + ENERGY + "\nvoid main(){\n  int id = gl_InstanceID;\n  ivec2 ij = ivec2(id % uTexW, id / uTexW);\n  vec4 hm = texelFetch(uHome, ij, 0);\n  vec4 st = texelFetch(uState, ij, 0);\n  vec4 cl = texelFetch(uCol, ij, 0);\n\n  float wakeE = texture(uFlow, hm.xy).b;\n  float E = energyAt(hm.xy*uRect.zw, uMouse, uRadius, uPresence, wakeE);\n  float lift = smoothstep(0.35, 2.5, length(st.xy));\n  float a = max(max(E, lift), max(uRest, 1.0-uIntroVis));\n  if(a < 0.01 || hm.w <= 0.0){ gl_Position = vec4(2.0,2.0,2.0,1.0); return; }\n\n  vec2 base = uRect.xy + hm.xy*uRect.zw + st.xy;\n  base -= ambientField(hm.xy, uTime)*10.0*uAmbient;\n\n  vec2 v = st.zw;\n  float sp = length(v);\n  vec2 dir = sp > 0.001 ? v/sp : vec2(1.0,0.0);\n  float r = uDot*hm.w*0.5;\n  float len = min(sp*1.25, 18.0)*uStreak;\n  vec2 lc = aCorner*vec2(r + len*0.5 + 1.0, r + 1.0);\n  vec2 center = base - dir*len*0.5;\n  vec2 world = center + dir*lc.x + vec2(-dir.y, dir.x)*lc.y;\n\n  vec2 clip = world/uRes*2.0-1.0;\n  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\n  vLocal = lc;\n  vHalfLen = len*0.5;\n  vR = r;\n  vec3 col = cl.rgb*uTint;\n  float glint = smoothstep(2.0, 16.0, sp);\n  col = mix(col, min(col*1.18 + vec3(0.07,0.075,0.085), vec3(1.0)), glint*0.75);\n  vCol = col;\n  vA = a;\n}\n";

  var PART_FS = "#version 300 es\nprecision highp float;\nin vec2 vLocal;\nin float vHalfLen;\nin float vR;\nin vec3 vCol;\nin float vA;\nuniform float uDpr;\nout vec4 o;\nvoid main(){\n  vec2 q = vec2(max(abs(vLocal.x)-vHalfLen, 0.0), vLocal.y);\n  float d = length(q) - vR;\n  float a = clamp(0.5 - d*uDpr, 0.0, 1.0);\n  float tail = vHalfLen > 0.0 ? clamp(0.5 - vLocal.x/(2.0*(vHalfLen+vR)), 0.0, 1.0) : 0.0;\n  a *= 1.0 - tail*0.55;\n  a *= vA;\n  if(a < 0.004) discard;\n  o = vec4(vCol*a, a);\n}\n";

  var IMAGE_FS = "#version 300 es\nprecision highp float;\nout vec4 o;\nuniform sampler2D uImg;\nuniform sampler2D uFlow;\nuniform vec2 uRes;\nuniform float uDpr;\nuniform vec4 uRect;\nuniform vec3 uBg;\nuniform vec3 uImgBg;\nuniform vec2 uMouse;\nuniform float uPresence;\nuniform float uRadius;\nuniform float uStrength;\nuniform float uTime;\nuniform float uAmbient;\nuniform float uIntroVis;\nuniform float uRest;\nuniform float uAlphaMode;\n" + NOISE + ENERGY + "\nvoid main(){\n  vec2 px = vec2(gl_FragCoord.x, uRes.y*uDpr - gl_FragCoord.y)/uDpr;\n  vec2 size = uRect.zw;\n  vec2 uv = (px-uRect.xy)/size;\n  if(uv.x < -0.05 || uv.x > 1.05 || uv.y < -0.12 || uv.y > 1.12){ o = vec4(0.0); return; }\n  vec4 fl = texture(uFlow, clamp(uv,0.0,1.0));\n  vec2 vel = (fl.rg*255.0-128.0)/127.0;\n  vec2 rp = uv*size;\n  vec2 toM = rp - uMouse;\n  float fall = exp(-dot(toM,toM)/(uRadius*uRadius))*uPresence;\n  vec2 disp = -toM*0.22*uStrength*fall - vel*10.0*uStrength;\n  disp += ambientField(uv, uTime)*10.0*uAmbient;\n  vec2 suv = uv + disp/size;\n  vec4 tx = texture(uImg, suv);\n  vec3 col = tx.rgb;\n  vec2 e = smoothstep(vec2(0.0), vec2(0.004,0.01), suv) * smoothstep(vec2(1.0), vec2(0.996,0.99), suv);\n  float key = uAlphaMode > 0.5 ? tx.a : smoothstep(0.012, 0.05, length(col-uImgBg));\n  float k = key*e.x*e.y;\n  float E = energyAt(rp, uMouse, uRadius, uPresence, fl.b);\n  float show = (1.0 - max(E, uRest))*uIntroVis;\n  vec3 mat = uAlphaMode > 0.5 ? col : col*(uBg/max(uImgBg, vec3(0.001)));\n  float A = k*show;\n  o = vec4(mat*A, A);\n}\n";

  function compile(gl, vs, fs) {
    var make = function (type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        var log = gl.getShaderInfoLog(sh);
        gl.deleteShader(sh);
        throw new Error("Shader: " + log);
      }
      return sh;
    };
    var p = gl.createProgram();
    var v = make(gl.VERTEX_SHADER, vs);
    var f = make(gl.FRAGMENT_SHADER, fs);
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.bindAttribLocation(p, 0, "aPos");
    gl.linkProgram(p);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("Link: " + gl.getProgramInfoLog(p));
    var u = {};
    var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
      var info = gl.getActiveUniform(p, i);
      if (info) u[info.name] = gl.getUniformLocation(p, info.name);
    }
    return { p: p, u: u };
  }

  var TEX_W = 1024;
  var SETTLE_FRAMES = 270;

  function LiquidEngine(canvas, opts, onFail) {
    this.lastImage = null;
    this.onFirstFrame = null;
    this.canvas = canvas;
    this.opts = opts;
    this.onFail = onFail;
    this.lowPower = false;
    this.stateFormat = { internal: 0, type: 0 };
    this.imgTex = null;
    this.flowTex = [];
    this.flowFb = [];
    this.flowW = 256;
    this.flowH = 104;
    this.flowIdx = 0;
    this.flowDirty = false;
    this.homeTex = null;
    this.colTex = null;
    this.stateTex = [];
    this.stateFb = [];
    this.stateIdx = 0;
    this.texH = 1;
    this.n = 0;
    this.gridW = 1;
    this.stateDirty = false;
    this.alphaMode = false;
    this.imgBg = [0.918, 0.914, 0.906];
    this.flowing = 0;
    this.aspect = 2.5;
    this.rect = { x: 0, y: 0, w: 1, h: 1 };
    this.cssW = 1;
    this.cssH = 1;
    this.target = { x: -9999, y: -9999 };
    this.mouse = { x: -9999, y: -9999 };
    this.prevMouse = { x: -9999, y: -9999 };
    this.mvel = { x: 0, y: 0 };
    this.presence = 0;
    this.presenceTarget = 0;
    this.burst = 0;
    this.lastInput = -1e9;
    this.settle = 1e9;
    this.touchRelease = 0;
    this.time = 0;
    this.introT = 1;
    this.raf = 0;
    this.running = false;
    this.last = 0;
    this.skip = 0;
    this.visible = true;
    this.ready = false;
    this.destroyed = false;
    this.lost = false;
    this.homeData = null;

    var self = this;
    this.onLost = function (e) { e.preventDefault(); self.lost = true; self.stop(); self.onFail(); };

    var gl = canvas.getContext("webgl2", {
      alpha: true, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: "high-performance"
    });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    var nav = navigator;
    this.lowPower = (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4 || window.matchMedia("(pointer: coarse)").matches;
    this.initGL();
    canvas.addEventListener("webglcontextlost", this.onLost, false);

    this.frame = function (now) {
      if (!self.running) return;
      var rawMs = now - self.last;
      var dt = clamp(rawMs / 16.6667, 0.25, 3);
      self.last = now;
      var o = self.opts;
      var ambientOn = o.ambient && !o.reducedMotion;

      if (self.touchRelease && now > self.touchRelease) { self.presenceTarget = 0; self.touchRelease = 0; }
      var ease = 1 - Math.pow(1 - 0.22, dt);
      self.mouse.x += (self.target.x - self.mouse.x) * ease;
      self.mouse.y += (self.target.y - self.mouse.y) * ease;
      var vx = (self.mouse.x - self.prevMouse.x) / dt;
      var vy = (self.mouse.y - self.prevMouse.y) / dt;
      self.prevMouse.x = self.mouse.x;
      self.prevMouse.y = self.mouse.y;
      self.mvel.x += (clamp(vx, -60, 60) - self.mvel.x) * 0.5;
      self.mvel.y += (clamp(vy, -60, 60) - self.mvel.y) * 0.5;
      var pk = self.presenceTarget > self.presence ? 0.1 : 0.035;
      self.presence += (self.presenceTarget - self.presence) * (1 - Math.pow(1 - pk, dt));
      if (self.presence < 0.001 && self.presenceTarget === 0) self.presence = 0;
      var fk = self.presenceTarget > self.flowing ? 0.05 : 0.018;
      self.flowing += (self.presenceTarget - self.flowing) * (1 - Math.pow(1 - fk, dt));
      if (self.flowing < 0.002 && self.presenceTarget === 0) self.flowing = 0;
      if (self.introT < 1) self.introT = Math.min(1, self.introT + Math.min(rawMs, 100) / 3200);

      var interacting = self.presence > 0.001 || self.burst > 0;
      self.settle = interacting ? 0 : self.settle + dt;
      var active = interacting || self.settle < SETTLE_FRAMES || self.introT < 1;

      if (!active) {
        if (self.flowDirty) self.clearFlow();
        if (self.stateDirty) self.clearState();
        if (!ambientOn) { self.draw(); self.firstFrame(); self.stop(); return; }
        self.raf = requestAnimationFrame(self.frame);
        if (self.skip++ % 2) return;
        self.time += (dt * 2 * o.speed) / 60;
        self.draw(); self.firstFrame();
        return;
      }
      self.raf = requestAnimationFrame(self.frame);
      self.time += (dt * o.speed * (1 + self.flowing * 1.6)) / 60;
      self.stepFlow(dt);
      self.stepSim(dt);
      self.burst = Math.max(0, self.burst - 0.1 * dt);
      self.draw(); self.firstFrame();
    };
  }

  LiquidEngine.prototype.initGL = function () {
    var gl = this.gl;
    var full = gl.getExtension("EXT_color_buffer_float");
    var half = full ? null : gl.getExtension("EXT_color_buffer_half_float");
    if (!full && !half) throw new Error("No float render targets");
    this.stateFormat = { internal: gl.RGBA16F, type: gl.HALF_FLOAT };

    this.pFlow = compile(gl, QUAD_VS, FLOW_FS);
    this.pSim = compile(gl, QUAD_VS, SIM_FS);
    this.pPart = compile(gl, PART_VS, PART_FS);
    this.pImg = compile(gl, QUAD_VS, IMAGE_FS);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    for (var i = 0; i < 2; i++) {
      var t = this.makeTex(gl.RGBA8, this.flowW, this.flowH, gl.RGBA, gl.UNSIGNED_BYTE, null, gl.LINEAR);
      var fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      this.flowTex.push(t);
      this.flowFb.push(fb);
    }
    this.clearFlow();
  };

  LiquidEngine.prototype.makeTex = function (internal, w, h, format, type, data, filter) {
    var gl = this.gl;
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };

  LiquidEngine.prototype.clearFlow = function () {
    var gl = this.gl;
    for (var i = 0; i < this.flowFb.length; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.flowFb[i]);
      gl.viewport(0, 0, this.flowW, this.flowH);
      gl.clearColor(128 / 255, 128 / 255, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.flowDirty = false;
  };

  LiquidEngine.prototype.clearState = function () {
    var gl = this.gl;
    for (var i = 0; i < this.stateFb.length; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.stateFb[i]);
      gl.viewport(0, 0, TEX_W, this.texH);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.stateDirty = false;
  };

  LiquidEngine.prototype.setImage = function (img) {
    if (this.destroyed || this.lost) return;
    var gl = this.gl;
    this.lastImage = img;
    this.aspect = img.naturalWidth / img.naturalHeight || 2.5;
    this.flowH = Math.max(32, Math.round(this.flowW / this.aspect));
    for (var i = 0; i < this.flowTex.length; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this.flowTex[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.flowW, this.flowH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    this.clearFlow();
    if (this.imgTex) gl.deleteTexture(this.imgTex);
    this.imgTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.imgTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.buildParticles(img);
    this.ready = true;
    if (this.opts.intro && !this.opts.reducedMotion) this.startIntro();
    this.wake();
  };

  LiquidEngine.prototype.buildParticles = function (img) {
    var gl = this.gl;
    var baseGrid = this.lowPower ? 640 : 1000;
    var gw = Math.round(baseGrid * Math.sqrt(clamp(this.opts.density, 0.15, 2)));
    var gh = Math.max(1, Math.round(gw / this.aspect));
    this.gridW = gw;
    var data;
    try {
      var c = document.createElement("canvas");
      c.width = gw;
      c.height = gh;
      var ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, gw, gh);
      data = ctx.getImageData(0, 0, gw, gh).data;
    } catch (err) { throw new Error("Image is not CORS-readable"); }

    var transparent = 0;
    for (var ii = 3; ii < data.length; ii += 4 * 7) if (data[ii] < 250) transparent++;
    this.alphaMode = transparent > data.length / (4 * 7) / 20;
    if (this.opts.imgBg) this.imgBg = this.opts.imgBg;
    else if (!this.alphaMode) {
      var r0 = 0, g0 = 0, b0 = 0, n0 = 0;
      var pw = Math.max(2, Math.round(gw * 0.012));
      var corners = [[0, 0], [gw - pw, 0], [0, gh - pw], [gw - pw, gh - pw]];
      for (var ci = 0; ci < corners.length; ci++) {
        var cx = corners[ci][0], cy = corners[ci][1];
        for (var y = cy; y < cy + pw; y++)
          for (var x = cx; x < cx + pw; x++) {
            var i0 = (y * gw + x) * 4;
            r0 += data[i0]; g0 += data[i0 + 1]; b0 += data[i0 + 2]; n0++;
          }
      }
      this.imgBg = [r0 / n0 / 255, g0 / n0 / 255, b0 / n0 / 255];
    }
    var home = [];
    var col = [];
    for (var yy = 0; yy < gh; yy++) {
      for (var xx = 0; xx < gw; xx++) {
        var i = (yy * gw + xx) * 4;
        var r = data[i] / 255;
        var g = data[i + 1] / 255;
        var b = data[i + 2] / 255;
        if (this.alphaMode) {
          var a = data[i + 3] / 255;
          if (a < 0.12) continue;
          if (a < 0.5 && Math.random() > a * 2) continue;
        } else {
          var dev = Math.hypot(r - this.imgBg[0], g - this.imgBg[1], b - this.imgBg[2]);
          if (dev < 0.03) continue;
          if (dev < 0.07 && Math.random() > (dev - 0.03) / 0.04) continue;
        }
        var jx = (Math.random() - 0.5) * 0.6;
        var jy = (Math.random() - 0.5) * 0.6;
        home.push((xx + 0.5 + jx) / gw, (yy + 0.5 + jy) / gh, Math.random(), 0.85 + Math.random() * 0.3);
        col.push(data[i], data[i + 1], data[i + 2], 255);
      }
    }
    var n = home.length / 4;
    this.n = n;
    this.texH = Math.max(1, Math.ceil(n / TEX_W));
    var total = TEX_W * this.texH;
    var homeArr = new Float32Array(total * 4);
    homeArr.set(home);
    var colArr = new Uint8Array(total * 4);
    colArr.set(col);

    var old = [this.homeTex, this.colTex].concat(this.stateTex);
    for (var oi = 0; oi < old.length; oi++) if (old[oi]) gl.deleteTexture(old[oi]);
    for (var fi = 0; fi < this.stateFb.length; fi++) gl.deleteFramebuffer(this.stateFb[fi]);
    this.stateTex = [];
    this.stateFb = [];
    this.homeTex = this.makeTex(gl.RGBA32F, TEX_W, this.texH, gl.RGBA, gl.FLOAT, homeArr, gl.NEAREST);
    this.colTex = this.makeTex(gl.RGBA8, TEX_W, this.texH, gl.RGBA, gl.UNSIGNED_BYTE, colArr, gl.NEAREST);
    for (var si = 0; si < 2; si++) {
      var t = this.makeTex(this.stateFormat.internal, TEX_W, this.texH, gl.RGBA, this.stateFormat.type, null, gl.NEAREST);
      var fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("Float FBO incomplete");
      this.stateTex.push(t);
      this.stateFb.push(fb);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.homeData = homeArr;
    this.clearState();
  };

  LiquidEngine.prototype.startIntro = function () {
    var gl = this.gl;
    var home = this.homeData;
    if (!home) return;
    var w = this.rect.w > 10 ? this.rect.w : 1300;
    var total = TEX_W * this.texH;
    var st = new Float32Array(total * 4);
    for (var i = 0; i < this.n; i++) {
      var hx = home[i * 4] - 0.5;
      var hy = home[i * 4 + 1] - 0.5;
      var sd = home[i * 4 + 2];
      var ang = (Math.random() - 0.5) * 0.9 + (hx > 0 ? 0 : Math.PI);
      var dist = w * (0.04 + Math.random() * 0.14) * (0.5 + Math.abs(hx) * 1.4);
      st[i * 4] = Math.cos(ang) * dist + hx * w * 0.25 * sd;
      st[i * 4 + 1] = Math.sin(ang) * dist * 0.55 + hy * 120 * (Math.random() - 0.5);
    }
    gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.stateIdx]);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.stateFormat.internal, TEX_W, this.texH, 0, gl.RGBA, gl.FLOAT, st);
    this.introT = 0;
    this.stateDirty = true;
  };

  LiquidEngine.prototype.setOptions = function (o) {
    var rebuild =
      (o.density !== undefined && o.density !== this.opts.density) ||
      (o.imgBg !== undefined && String(o.imgBg) !== String(this.opts.imgBg));
    for (var k in o) this.opts[k] = o[k];
    if (rebuild && this.ready && this.lastImage) {
      try { this.buildParticles(this.lastImage); } catch (e) { this.onFail(); }
    }
    this.wake();
  };

  LiquidEngine.prototype.resize = function (cssW, cssH, rect) {
    this.cssW = Math.max(1, cssW);
    this.cssH = Math.max(1, cssH);
    this.rect = rect;
    var dpr = Math.min(window.devicePixelRatio || 1, this.lowPower ? 1.5 : 2);
    var px = this.cssW * this.cssH * dpr * dpr;
    if (px > 4.5e6) dpr = Math.max(1, Math.sqrt(4.5e6 / (this.cssW * this.cssH)));
    var w = Math.round(this.cssW * dpr);
    var h = Math.round(this.cssH * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    this.draw();
  };

  LiquidEngine.prototype.setVisible = function (v) {
    this.visible = v;
    if (v) this.wake(); else this.stop();
  };

  LiquidEngine.prototype.pointer = function (type, x, y, touch) {
    if (!this.opts.interactive || this.lost) return;
    var now = performance.now();
    if (type === "leave" || type === "up") {
      if (touch) this.touchRelease = now + 260; else this.presenceTarget = 0;
      this.wake();
      return;
    }
    if (this.mouse.x < -9000 || type === "down") {
      this.mouse.x = this.prevMouse.x = x;
      this.mouse.y = this.prevMouse.y = y;
    }
    this.target.x = x;
    this.target.y = y;
    this.presenceTarget = 1;
    this.lastInput = now;
    this.settle = 0;
    if (type === "down") { this.burst = 1; this.touchRelease = 0; }
    this.wake();
  };

  LiquidEngine.prototype.wake = function () {
    if (!this.ready || this.running || !this.visible || this.destroyed || this.lost) {
      if (this.ready && !this.running) this.draw();
      return;
    }
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  };

  LiquidEngine.prototype.stop = function () { this.running = false; cancelAnimationFrame(this.raf); };

  LiquidEngine.prototype.radiusPx = function () { return this.opts.radius * clamp(this.rect.w / 1400, 0.6, 1.25); };
  LiquidEngine.prototype.strength = function () { return this.opts.strength * (this.opts.reducedMotion ? 0.5 : 1); };

  LiquidEngine.prototype.firstFrame = function () {
    if (this.onFirstFrame) {
      var cb = this.onFirstFrame;
      this.onFirstFrame = null;
      requestAnimationFrame(function () { cb(); });
    }
  };

  LiquidEngine.prototype.stepFlow = function (dt) {
    var gl = this.gl;
    var P = this.pFlow;
    var dst = 1 - this.flowIdx;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.flowFb[dst]);
    gl.viewport(0, 0, this.flowW, this.flowH);
    gl.disable(gl.BLEND);
    gl.useProgram(P.p);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
    gl.uniform1i(P.u.uPrev, 0);
    gl.uniform2f(P.u.uTexel, 1 / this.flowW, 1 / this.flowH);
    var r = this.rect;
    gl.uniform2f(P.u.uMouse, (this.mouse.x - r.x) / r.w, (this.mouse.y - r.y) / r.h);
    gl.uniform2f(P.u.uVel, clamp(this.mvel.x / 40, -1, 1), clamp(this.mvel.y / 40, -1, 1));
    gl.uniform2f(P.u.uSize, r.w, r.h);
    gl.uniform1f(P.u.uRadius, this.radiusPx());
    gl.uniform1f(P.u.uPresence, Math.max(this.presence, this.burst));
    gl.uniform1f(P.u.uDecay, Math.pow(0.968, dt));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.flowIdx = dst;
    this.flowDirty = true;
  };

  LiquidEngine.prototype.stepSim = function (dt) {
    if (!this.n) return;
    var gl = this.gl;
    var P = this.pSim;
    var o = this.opts;
    var r = this.rect;
    var dst = 1 - this.stateIdx;
    var intro = o.reducedMotion || !o.intro ? 0 : Math.pow(1 - this.introT, 2);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.stateFb[dst]);
    gl.viewport(0, 0, TEX_W, this.texH);
    gl.disable(gl.BLEND);
    gl.useProgram(P.p);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.stateIdx]);
    gl.uniform1i(P.u.uState, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.homeTex);
    gl.uniform1i(P.u.uHome, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
    gl.uniform1i(P.u.uFlow, 2);
    gl.uniform2f(P.u.uSize, r.w, r.h);
    gl.uniform2f(P.u.uMouse, this.mouse.x - r.x, this.mouse.y - r.y);
    gl.uniform1f(P.u.uRadius, this.radiusPx());
    gl.uniform1f(P.u.uPresence, Math.max(this.presence, this.burst));
    gl.uniform1f(P.u.uStrength, this.strength() * (1 + this.burst * 1.5));
    gl.uniform1f(P.u.uSpread, clamp(o.spread, 0, 2));
    gl.uniform1f(P.u.uTurb, clamp(o.turbulence, 0, 2) * (o.reducedMotion ? 0.3 : 1));
    gl.uniform1f(P.u.uReturn, clamp(o.returnSpeed, 0, 2));
    gl.uniform1f(P.u.uTime, this.time);
    gl.uniform1f(P.u.uDt, dt);
    gl.uniform1f(P.u.uIntro, intro);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.stateIdx = dst;
    this.stateDirty = true;
  };

  LiquidEngine.prototype.draw = function () {
    if (!this.ready || this.lost || this.destroyed) return;
    var gl = this.gl;
    var o = this.opts;
    var r = this.rect;
    var rm = o.reducedMotion;
    var introVis = rm || !o.intro ? 1 : Math.pow(this.introT, 2.2);
    var base = o.ambient && !rm ? clamp(o.ambientIntensity, 0, 2) : 0;
    var amb = base + this.flowing * 0.85 * clamp(o.liquid, 0, 2) * (rm ? 0.3 : 1);
    var rest = o.restStyle === "particles" ? 1 : 0;
    var br = o.bg[0], bg = o.bg[1], bb = o.bg[2];
    var ir = this.imgBg[0], ig = this.imgBg[1], ib = this.imgBg[2];
    var dpr = this.canvas.width / this.cssW;
    var pres = Math.max(this.presence, this.burst);
    var mx = this.mouse.x - r.x;
    var my = this.mouse.y - r.y;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.bindVertexArray(this.vao);
    gl.disable(gl.BLEND);

    var I = this.pImg;
    gl.useProgram(I.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.imgTex);
    gl.uniform1i(I.u.uImg, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
    gl.uniform1i(I.u.uFlow, 1);
    gl.uniform2f(I.u.uRes, this.cssW, this.cssH);
    gl.uniform1f(I.u.uDpr, dpr);
    gl.uniform4f(I.u.uRect, r.x, r.y, r.w, r.h);
    gl.uniform3f(I.u.uBg, br, bg, bb);
    gl.uniform3f(I.u.uImgBg, ir, ig, ib);
    gl.uniform2f(I.u.uMouse, mx, my);
    gl.uniform1f(I.u.uPresence, pres);
    gl.uniform1f(I.u.uRadius, this.radiusPx());
    gl.uniform1f(I.u.uStrength, this.strength());
    gl.uniform1f(I.u.uTime, this.time);
    gl.uniform1f(I.u.uAmbient, amb);
    gl.uniform1f(I.u.uIntroVis, introVis);
    gl.uniform1f(I.u.uRest, rest);
    gl.uniform1f(I.u.uAlphaMode, this.alphaMode ? 1 : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (!this.n || (!this.stateDirty && rest === 0 && introVis >= 1)) return;

    var P = this.pPart;
    gl.useProgram(P.p);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.stateIdx]);
    gl.uniform1i(P.u.uState, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.homeTex);
    gl.uniform1i(P.u.uHome, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.colTex);
    gl.uniform1i(P.u.uCol, 2);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
    gl.uniform1i(P.u.uFlow, 3);
    gl.uniform1i(P.u.uTexW, TEX_W);
    gl.uniform4f(P.u.uRect, r.x, r.y, r.w, r.h);
    gl.uniform2f(P.u.uRes, this.cssW, this.cssH);
    gl.uniform2f(P.u.uMouse, mx, my);
    gl.uniform1f(P.u.uRadius, this.radiusPx());
    gl.uniform1f(P.u.uPresence, pres);
    var spacing = r.w / this.gridW;
    gl.uniform1f(P.u.uDot, spacing * 1.45 * clamp(o.dotSize, 0.2, 3));
    gl.uniform1f(P.u.uTime, this.time);
    gl.uniform1f(P.u.uAmbient, amb);
    gl.uniform1f(P.u.uStreak, (o.streaks ? 1 : 0) * (0.45 + 0.55 * introVis));
    gl.uniform1f(P.u.uIntroVis, introVis);
    gl.uniform1f(P.u.uRest, rest);
    gl.uniform1f(P.u.uDpr, dpr);
    if (this.alphaMode) gl.uniform3f(P.u.uTint, 1, 1, 1);
    else gl.uniform3f(P.u.uTint, br / Math.max(ir, 0.001), bg / Math.max(ig, 0.001), bb / Math.max(ib, 0.001));
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.n);
    gl.disable(gl.BLEND);
  };

  LiquidEngine.prototype.destroy = function () {
    this.destroyed = true;
    this.stop();
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    var gl = this.gl;
    if (!this.lost) {
      gl.deleteBuffer(this.quad);
      gl.deleteVertexArray(this.vao);
      var texs = this.flowTex.concat(this.stateTex, [this.imgTex, this.homeTex, this.colTex]);
      for (var i = 0; i < texs.length; i++) if (texs[i]) gl.deleteTexture(texs[i]);
      var fbs = this.flowFb.concat(this.stateFb);
      for (var f = 0; f < fbs.length; f++) gl.deleteFramebuffer(fbs[f]);
      var progs = [this.pFlow, this.pSim, this.pPart, this.pImg];
      for (var p = 0; p < progs.length; p++) if (progs[p]) gl.deleteProgram(progs[p].p);
    }
    var ext = gl.getExtension("WEBGL_lose_context");
    if (ext) ext.loseContext();
  };

  /* ── inicializador vanilla ─────────────────────────────────────── */
  function computeRect(w, h, aspect, scale, xPct, yPct) {
    var rw = w * scale;
    if (rw / aspect > h * 0.98) rw = h * 0.98 * aspect;
    var rh = rw / aspect;
    var cx = w * (0.5 + xPct / 100);
    var cy = h * (0.5 + yPct / 100);
    return { x: cx - rw / 2, y: cy - rh / 2, w: rw, h: rh };
  }

  function mount(opts) {
    opts = opts || {};
    var container = typeof opts.container === "string" ? document.querySelector(opts.container) : opts.container;
    if (!container || !opts.src) return null;
    var cs = getComputedStyle(container);
    if (cs.position === "static") container.style.position = "relative";
    if (!container.style.overflow) container.style.overflow = "hidden";

    var fallback = document.createElement("img");
    fallback.alt = opts.imageAlt || "";
    fallback.decoding = "async";
    fallback.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:100%;max-height:100%;pointer-events:none;user-select:none;-webkit-user-drag:none;transition:opacity .45s ease";
    fallback.src = opts.src;
    var canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity .5s ease";
    container.appendChild(fallback);
    container.appendChild(canvas);

    var reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    var eo = {
      interactive: opts.interactive !== false,
      strength: def(opts.strength, 1),
      radius: def(opts.radius, 220),
      density: def(opts.density, 1),
      dotSize: def(opts.dotSize, 1),
      spread: def(opts.spread, 1),
      turbulence: def(opts.turbulence, 1),
      returnSpeed: def(opts.returnSpeed, 1),
      streaks: opts.streaks !== false,
      restStyle: opts.restStyle || "image",
      ambient: opts.ambient !== false,
      ambientIntensity: def(opts.ambientIntensity, 1),
      speed: def(opts.speed, 1),
      intro: opts.intro !== false,
      reducedMotion: reduced,
      bg: hexToRgb(opts.background || "#050505", [0.02, 0.02, 0.02]),
      imgBg: opts.imageBackground ? hexToRgb(opts.imageBackground, null) : null,
      liquid: def(opts.liquid, 1)
    };

    // ── Móvil / batería: el efecto es pesado (100k partículas GPU). ──
    // Por defecto en móvil NO se anima: se muestra la imagen estática (mejor para batería/rendimiento).
    // opts.mobile: 'static' (def) · 'reduced' (versión aligerada) · 'full' (igual que escritorio).
    // prefers-reduced-motion SIEMPRE cae a estática.
    var coarse = false;
    try { coarse = window.matchMedia("(pointer: coarse)").matches; } catch (e) {}
    var smallScreen = Math.min(window.innerWidth || 9999, window.innerHeight || 9999) < 700;
    var weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
    var isMobile = coarse || smallScreen;
    var mode = opts.mobile || "static";

    if (reduced || (isMobile && mode === "static")) {
      fallback.style.opacity = "1";
      canvas.style.display = "none";
      return {
        engine: null,
        setOptions: function () {},
        destroy: function () { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); }
      };
    }
    if ((isMobile || weak) && mode === "reduced") {
      eo.density = Math.min(eo.density, 0.5);
      eo.intro = false;
      eo.ambient = false;
      eo.streaks = false;
      eo.radius = Math.min(eo.radius, 150);
      eo.turbulence = Math.min(eo.turbulence, 0.6);
    }

    var engine = null, failed = false;
    function fail() { failed = true; canvas.style.opacity = "0"; fallback.style.opacity = "1"; }
    try { engine = new LiquidEngine(canvas, eo, fail); }
    catch (e) { fail(); return { engine: null, destroy: function () {} }; }

    engine.onFirstFrame = function () { canvas.style.opacity = "1"; fallback.style.opacity = "0"; };

    function doResize() {
      if (!engine || failed) return;
      var w = container.clientWidth, h = container.clientHeight;
      if (w < 1 || h < 1) return;
      engine.resize(w, h, computeRect(w, h, engine.aspect || 2.5, def(opts.scale, 1), def(opts.x, 0), def(opts.y, 0)));
    }

    var img = new Image();
    // crossOrigin solo si la imagen es de OTRO dominio; en el mismo origen estorba (doble fetch) y no hace falta
    var isCross = /^https?:\/\//i.test(opts.src) && opts.src.indexOf(location.origin + "/") !== 0;
    if (isCross) img.crossOrigin = "anonymous";
    img.onload = function () {
      if (failed || !engine) return;
      try { doResize(); engine.setImage(img); doResize(); }
      catch (e) { fail(); }
    };
    img.onerror = function () { fail(); };
    img.src = opts.src;

    var ro = new ResizeObserver(doResize);
    ro.observe(container);

    function toLocal(e) { var b = container.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; }
    function onMove(e) { if (engine) { var p = toLocal(e); engine.pointer("move", p.x, p.y, e.pointerType === "touch"); } }
    function onDown(e) { if (engine) { var p = toLocal(e); engine.pointer("down", p.x, p.y, e.pointerType === "touch"); } }
    function onUp(e) { if (engine) { var p = toLocal(e); engine.pointer("up", p.x, p.y, e.pointerType === "touch"); } }
    function onLeave(e) { if (engine) { var p = toLocal(e); engine.pointer("leave", p.x, p.y, e.pointerType === "touch"); } }
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    container.addEventListener("pointerleave", onLeave);

    var io = new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) if (engine) engine.setVisible(es[i].isIntersecting);
    }, { threshold: 0.01 });
    io.observe(container);

    return {
      engine: engine,
      setOptions: function (o) { if (engine) engine.setOptions(o); },
      destroy: function () {
        ro.disconnect();
        io.disconnect();
        container.removeEventListener("pointermove", onMove);
        container.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        container.removeEventListener("pointerleave", onLeave);
        if (engine) engine.destroy();
      }
    };
  }

  global.LiquidHero = { mount: mount, hexToRgb: hexToRgb };
})(typeof window !== "undefined" ? window : this);
