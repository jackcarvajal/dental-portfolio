/**
 * PRODIGY — AudioManager v1.0
 * Sistema de audio procedural completo — Web Audio API, sin archivos externos.
 * Tres capas: Drone Ambient / Ritmo Workflow / Feedback UI
 */
(function(window) {
  'use strict';

  var ctx = null;
  var master = null;
  var droneNodes = [];
  var rhythmNodes = [];
  var ambientActive = false;
  var rhythmActive = false;
  var initialized = false;
  var MAX_GAIN = 0.15; // Límite de seguridad: nunca aturde

  /* ── INIT ─────────────────────────────────────────────────────────── */
  function init() {
    if (initialized) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    initialized = true;
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  /* ── REVERB SINTÉTICO (delay network, sin archivo) ────────────────── */
  function buildReverb() {
    var convolver = ctx.createConvolver();
    var rate = ctx.sampleRate;
    var len  = rate * 2.5; // 2.5 segundos de cola
    var buf  = ctx.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var data = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
      }
    }
    convolver.buffer = buf;
    var reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.18;
    convolver.connect(reverbGain);
    reverbGain.connect(master);
    return convolver;
  }

  /* ── DRONE AMBIENT ─────────────────────────────────────────────────── */
  function buildDrone() {
    var reverb = buildReverb();
    var droneGain = ctx.createGain();
    droneGain.gain.value = 0.55;
    droneGain.connect(master);
    droneGain.connect(reverb);

    // Serie armónica en La (A1=55Hz): drone profundo y cálido
    var harmonics = [
      { freq: 55,  gain: 0.18 },
      { freq: 110, gain: 0.12 },
      { freq: 165, gain: 0.07 },
      { freq: 220, gain: 0.05 },
      { freq: 330, gain: 0.03 },
      { freq: 440, gain: 0.02 }
    ];

    harmonics.forEach(function(h, idx) {
      var osc     = ctx.createOscillator();
      var oscGain = ctx.createGain();
      var lfo     = ctx.createOscillator();
      var lfoGain = ctx.createGain();

      // Oscilador principal
      osc.type = idx < 2 ? 'sine' : 'sine';
      osc.frequency.value = h.freq;
      oscGain.gain.value  = h.gain;

      // LFO de "respiración" — ciclo lento de 8-18 segundos
      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + idx * 0.008;
      lfoGain.gain.value  = h.freq * 0.004;

      // Conectar
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency); // modula la frecuencia suavemente
      osc.connect(oscGain);
      oscGain.connect(droneGain);

      // Filtro pasa-bajos para suavizar los armónicos altos
      if (h.freq > 200) {
        var lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = h.freq * 2.5;
        lpf.Q.value = 0.5;
        osc.disconnect(oscGain);
        osc.connect(lpf);
        lpf.connect(oscGain);
      }

      lfo.start();
      osc.start();
      droneNodes.push(osc, lfo);
    });
  }

  /* ── RITMO WORKFLOW (kick + pluck a 110 BPM) ──────────────────────── */
  function buildRhythm() {
    var BPM      = 110;
    var interval = (60 / BPM); // 0.545s por beat
    var rGain    = ctx.createGain();
    rGain.gain.value = 0;
    rGain.connect(master);

    // Fade in del ritmo
    var now = ctx.currentTime;
    rGain.gain.setValueAtTime(0, now);
    rGain.gain.linearRampToValueAtTime(0.12, now + 3);

    // Kick procedural: sweep de frecuencia 100→30Hz
    function scheduleKick(when) {
      var kick = ctx.createOscillator();
      var kGain = ctx.createGain();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(100, when);
      kick.frequency.exponentialRampToValueAtTime(30, when + 0.12);
      kGain.gain.setValueAtTime(0.4, when);
      kGain.gain.exponentialRampToValueAtTime(0.001, when + 0.25);
      kick.connect(kGain);
      kGain.connect(rGain);
      kick.start(when);
      kick.stop(when + 0.3);
    }

    // Pluck digital: tono corto estilo sintetizador
    function schedulePluck(when, freq) {
      var pluck = ctx.createOscillator();
      var pGain = ctx.createGain();
      pluck.type = 'triangle';
      pluck.frequency.value = freq;
      pGain.gain.setValueAtTime(0.15, when);
      pGain.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
      pluck.connect(pGain);
      pGain.connect(rGain);
      pluck.start(when);
      pluck.stop(when + 0.22);
    }

    // Patrón: kick en 1 y 3, pluck en 2 y 4
    var bars = 0;
    function loop() {
      if (!rhythmActive) return;
      var t = ctx.currentTime;
      scheduleKick(t);
      schedulePluck(t + interval, 440);       // beat 2: La4
      scheduleKick(t + interval * 2);
      schedulePluck(t + interval * 3, 330);   // beat 4: Mi4
      bars++;
      rhythmNodes._timer = setTimeout(loop, interval * 4 * 1000 - 20);
    }

    rhythmNodes._gain = rGain;
    rhythmActive = true;
    loop();
  }

  function stopRhythm() {
    rhythmActive = false;
    clearTimeout(rhythmNodes._timer);
    if (rhythmNodes._gain) {
      var now = ctx.currentTime;
      rhythmNodes._gain.gain.cancelScheduledValues(now);
      rhythmNodes._gain.gain.setValueAtTime(rhythmNodes._gain.gain.value, now);
      rhythmNodes._gain.gain.linearRampToValueAtTime(0, now + 1.5);
    }
  }

  /* ── FEEDBACK UI ───────────────────────────────────────────────────── */
  function playFeedback(type) {
    if (!ctx) init();
    resume();
    var now = ctx.currentTime;

    var sounds = {
      // Selección confirmada — tono limpio ascendente
      ping: function() {
        [880, 1100].forEach(function(f, i) {
          var o = ctx.createOscillator();
          var g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = f;
          g.gain.setValueAtTime(0, now + i * 0.06);
          g.gain.linearRampToValueAtTime(0.08, now + i * 0.06 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.06);
          o.stop(now + i * 0.06 + 0.3);
        });
      },

      // Pago exitoso — joya cayendo en cristal (arpeggio ascendente)
      success: function() {
        [523, 659, 784, 1047].forEach(function(f, i) {
          var o = ctx.createOscillator();
          var g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = f;
          g.gain.setValueAtTime(0, now + i * 0.1);
          g.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.03);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.6);
        });
      },

      // Error — tono grave descendente
      error: function() {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(280, now);
        o.frequency.exponentialRampToValueAtTime(100, now + 0.4);
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        var lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass'; lpf.frequency.value = 600;
        o.connect(lpf); lpf.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.5);
      },

      // Click digital — tick rápido de UI
      click: function() {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = 1200;
        g.gain.setValueAtTime(0.05, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.05);
      },

      // Swish — transición entre secciones
      swish: function() {
        var buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        var d   = buf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        var src = ctx.createBufferSource();
        src.buffer = buf;
        var bpf = ctx.createBiquadFilter();
        bpf.type = 'bandpass'; bpf.frequency.value = 4000; bpf.Q.value = 0.8;
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        src.connect(bpf); bpf.connect(g); g.connect(ctx.destination);
        src.start(now); src.stop(now + 0.18);
      },

      // Upload — "carga" tecnológica
      upload: function() {
        [330, 440, 550, 660].forEach(function(f, i) {
          var o = ctx.createOscillator();
          var g = ctx.createGain();
          o.type = 'triangle'; o.frequency.value = f;
          g.gain.setValueAtTime(0, now + i * 0.04);
          g.gain.linearRampToValueAtTime(0.06, now + i * 0.04 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.04);
          o.stop(now + i * 0.04 + 0.15);
        });
      }
    };

    if (sounds[type]) sounds[type]();
  }

  /* ── API PÚBLICA ───────────────────────────────────────────────────── */
  var AM = {

    // Activar/desactivar drone ambient (botón del home)
    toggleAmbient: function() {
      if (!ctx) init();
      resume();
      var btn = document.getElementById('sound-btn');
      var ico = btn ? btn.querySelector('i') : null;

      if (!ambientActive) {
        buildDrone();
        ambientActive = true;
        if (btn) btn.classList.add('playing');
        if (ico) ico.className = 'fas fa-volume-high';
        if (btn) btn.title = 'Silenciar música';
        if (window.ProdigyAnalytics) ProdigyAnalytics.trackAudioToggle('on');
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(MAX_GAIN, ctx.currentTime + 3);
      } else {
        if (btn) btn.classList.remove('playing');
        if (ico) ico.className = 'fas fa-volume-xmark';
        if (btn) btn.title = 'Música ambiente';
        var t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(0, t + 2);
        setTimeout(function() {
          droneNodes.forEach(function(n) { try { n.stop(); } catch(e) {} });
          droneNodes = [];
          ambientActive = false;
          if (ctx) ctx.suspend();
        }, 2200);
      }
    },

    // Activar ritmo en páginas de flujo/calculadora
    startWorkflow: function() {
      if (!ctx) init();
      resume();
      if (!ambientActive) {
        buildDrone();
        ambientActive = true;
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(MAX_GAIN * 0.7, ctx.currentTime + 2);
      }
      if (!rhythmActive) buildRhythm();
    },

    stopWorkflow: function() {
      stopRhythm();
    },

    // Sonidos de feedback UI
    ping:    function() { if (!ctx) init(); resume(); playFeedback('ping');    },
    success: function() { if (!ctx) init(); resume(); playFeedback('success'); },
    error:   function() { if (!ctx) init(); resume(); playFeedback('error');   },
    click:   function() { if (!ctx) init(); resume(); playFeedback('click');   },
    swish:   function() { if (!ctx) init(); resume(); playFeedback('swish');   },
    upload:  function() { if (!ctx) init(); resume(); playFeedback('upload');  }
  };

  // Resume en primer toque (política de autoplay Chrome/Safari)
  document.addEventListener('click', function _first() {
    if (ctx) resume();
    document.removeEventListener('click', _first);
  }, { once: true });

  window.ProdigyAudio = AM;

})(window);
