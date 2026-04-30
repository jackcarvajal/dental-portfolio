/**
 * PRODIGY — AudioManager v2.0
 * Música upbeat energética — Re mayor, 128 BPM, síntesis procedural.
 * Sin archivos externos. Web Audio API puro.
 */
(function(window) {
  'use strict';

  var ctx = null;
  var master = null;
  var allNodes = [];
  var timers = [];
  var ambientActive = false;
  var initialized = false;
  var MAX_GAIN = 0.18;

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

  /* ── REVERB corto (sala pequeña) ─────────────────────────────────── */
  function buildReverb(decaySec) {
    decaySec = decaySec || 0.6;
    var rate = ctx.sampleRate;
    var len  = rate * decaySec;
    var buf  = ctx.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    var conv = ctx.createConvolver();
    conv.buffer = buf;
    var g = ctx.createGain();
    g.gain.value = 0.12;
    conv.connect(g);
    g.connect(master);
    return conv;
  }

  /* ── PAD DE ACORDES (Re mayor → Sol → La → Re) ───────────────────── */
  function buildPad() {
    var reverb = buildReverb(1.2);
    var padGain = ctx.createGain();
    padGain.gain.value = 0;
    padGain.connect(master);
    padGain.connect(reverb);

    // Progresión D - G - A - D en voicing de 3 notas
    var chords = [
      [293.66, 369.99, 440.00],   // D4  F#4  A4
      [196.00, 246.94, 293.66],   // G3  B3   D4
      [220.00, 277.18, 329.63],   // A3  C#4  E4
      [293.66, 369.99, 440.00]    // D4  F#4  A4
    ];

    var BPM = 128;
    var bar = (60 / BPM) * 4;  // duración de 1 compás (1.875s)
    var chordIdx = 0;

    function playChord() {
      if (!ambientActive) return;
      var c = chords[chordIdx % chords.length];
      var now = ctx.currentTime;

      c.forEach(function(freq, i) {
        var osc  = ctx.createOscillator();
        var g    = ctx.createGain();
        // Dos osciladores ligeramente desafinados para coro
        var osc2 = ctx.createOscillator();
        var g2   = ctx.createGain();

        osc.type  = 'triangle';
        osc2.type = 'triangle';
        osc.frequency.value  = freq;
        osc2.frequency.value = freq * 1.004; // +4 cents detune = efecto coro

        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.06 - i * 0.01, now + 0.15);
        g.gain.setValueAtTime(0.06 - i * 0.01, now + bar - 0.25);
        g.gain.linearRampToValueAtTime(0, now + bar);

        g2.gain.value = 0.04;

        osc.connect(g);   g.connect(padGain);
        osc2.connect(g2); g2.connect(padGain);
        osc.start(now);   osc2.start(now);
        osc.stop(now + bar + 0.1);
        osc2.stop(now + bar + 0.1);
        allNodes.push(osc, osc2);
      });

      chordIdx++;
      var t = timers.length;
      timers[t] = setTimeout(playChord, bar * 1000 - 20);
    }

    // Fade in del pad
    var n = ctx.currentTime;
    padGain.gain.setValueAtTime(0, n);
    padGain.gain.linearRampToValueAtTime(0.55, n + 2.5);

    playChord();
  }

  /* ── ARPEGGIO LEAD ────────────────────────────────────────────────── */
  function buildArpeggio() {
    var arpGain = ctx.createGain();
    arpGain.gain.value = 0;
    arpGain.connect(master);

    var BPM = 128;
    var beat = 60 / BPM;          // 0.469s
    var eighth = beat / 2;         // 0.234s — semicorchea

    // Arpeggio en Re mayor: D4 F# A B D5 A F# D4 (8 notas)
    var notes = [293.66, 369.99, 440.00, 493.88, 587.33, 440.00, 369.99, 293.66];

    var idx = 0;
    function playNote() {
      if (!ambientActive) return;
      var freq = notes[idx % notes.length];
      var now  = ctx.currentTime;

      var osc  = ctx.createOscillator();
      var env  = ctx.createGain();
      var lpf  = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 3200;
      lpf.Q.value = 0.7;

      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      env.gain.setValueAtTime(0.10, now);
      env.gain.exponentialRampToValueAtTime(0.001, now + eighth * 0.85);

      osc.connect(lpf); lpf.connect(env); env.connect(arpGain);
      osc.start(now); osc.stop(now + eighth);
      allNodes.push(osc);

      idx++;
      var t = timers.length;
      timers[t] = setTimeout(playNote, eighth * 1000 - 5);
    }

    // Arranca tras 1s para dejar que el pad entre primero
    var t0 = timers.length;
    timers[t0] = setTimeout(function() {
      if (!ambientActive) return;
      var n = ctx.currentTime;
      arpGain.gain.setValueAtTime(0, n);
      arpGain.gain.linearRampToValueAtTime(0.5, n + 1);
      playNote();
    }, 1000);
  }

  /* ── RITMO: kick + snare + hi-hat a 128 BPM ──────────────────────── */
  function buildRhythm() {
    var BPM   = 128;
    var beat  = 60 / BPM;
    var rGain = ctx.createGain();
    rGain.gain.value = 0;
    rGain.connect(master);

    var now = ctx.currentTime;
    rGain.gain.setValueAtTime(0, now);
    rGain.gain.linearRampToValueAtTime(0.9, now + 1.5);

    // Kick: sweep 120→35Hz, punch rápido
    function kick(when) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(160, when);
      o.frequency.exponentialRampToValueAtTime(35, when + 0.1);
      g.gain.setValueAtTime(0.6, when);
      g.gain.exponentialRampToValueAtTime(0.001, when + 0.22);
      o.connect(g); g.connect(rGain);
      o.start(when); o.stop(when + 0.25);
    }

    // Snare: ruido blanco filtrado + tono
    function snare(when) {
      var buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      var d   = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource();
      src.buffer = buf;
      var hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass'; hpf.frequency.value = 1800;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.35, when);
      g.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
      src.connect(hpf); hpf.connect(g); g.connect(rGain);
      src.start(when); src.stop(when + 0.2);
      // Tono del snare
      var ot = ctx.createOscillator();
      var gt = ctx.createGain();
      ot.type = 'triangle'; ot.frequency.value = 200;
      gt.gain.setValueAtTime(0.15, when);
      gt.gain.exponentialRampToValueAtTime(0.001, when + 0.1);
      ot.connect(gt); gt.connect(rGain);
      ot.start(when); ot.stop(when + 0.12);
    }

    // Hi-hat cerrado: ruido + highpass corto
    function hihat(when, vol) {
      vol = vol || 0.12;
      var buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      var d   = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource();
      src.buffer = buf;
      var hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass'; hpf.frequency.value = 7000;
      var g = ctx.createGain();
      g.gain.setValueAtTime(vol, when);
      g.gain.exponentialRampToValueAtTime(0.001, when + 0.05);
      src.connect(hpf); hpf.connect(g); g.connect(rGain);
      src.start(when); src.stop(when + 0.06);
    }

    // Patrón 1 compás: kick en 1 y 3, snare en 2 y 4, hi-hat en corcheas
    function loop() {
      if (!ambientActive) return;
      var t = ctx.currentTime;
      kick(t);
      hihat(t, 0.10);

      hihat(t + beat * 0.5, 0.08);

      snare(t + beat);
      hihat(t + beat, 0.12);

      hihat(t + beat * 1.5, 0.08);

      kick(t + beat * 2);
      hihat(t + beat * 2, 0.10);

      hihat(t + beat * 2.5, 0.08);

      snare(t + beat * 3);
      hihat(t + beat * 3, 0.12);

      hihat(t + beat * 3.5, 0.08);

      var ti = timers.length;
      timers[ti] = setTimeout(loop, beat * 4 * 1000 - 15);
    }

    // Arranca tras 0.5s
    var t1 = timers.length;
    timers[t1] = setTimeout(loop, 500);
  }

  /* ── FEEDBACK UI (sin cambios) ────────────────────────────────────── */
  function playFeedback(type) {
    if (!ctx) init();
    resume();
    var now = ctx.currentTime;
    var sounds = {
      ping: function() {
        [880, 1100].forEach(function(f, i) {
          var o = ctx.createOscillator(); var g = ctx.createGain();
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0, now + i * 0.06);
          g.gain.linearRampToValueAtTime(0.08, now + i * 0.06 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.06); o.stop(now + i * 0.06 + 0.3);
        });
      },
      success: function() {
        [523, 659, 784, 1047].forEach(function(f, i) {
          var o = ctx.createOscillator(); var g = ctx.createGain();
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0, now + i * 0.1);
          g.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.03);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.6);
        });
      },
      error: function() {
        var o = ctx.createOscillator(); var g = ctx.createGain();
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
      click: function() {
        var o = ctx.createOscillator(); var g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = 1200;
        g.gain.setValueAtTime(0.05, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.05);
      },
      upload: function() {
        [330, 440, 550, 660].forEach(function(f, i) {
          var o = ctx.createOscillator(); var g = ctx.createGain();
          o.type = 'triangle'; o.frequency.value = f;
          g.gain.setValueAtTime(0, now + i * 0.04);
          g.gain.linearRampToValueAtTime(0.06, now + i * 0.04 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.04); o.stop(now + i * 0.04 + 0.15);
        });
      }
    };
    if (sounds[type]) sounds[type]();
  }

  /* ── STOP TODO ────────────────────────────────────────────────────── */
  function stopAll() {
    ambientActive = false;
    timers.forEach(function(t) { clearTimeout(t); });
    timers = [];
    allNodes.forEach(function(n) { try { n.stop(); } catch(e) {} });
    allNodes = [];
    if (master && ctx) {
      var t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 1.2);
      setTimeout(function() { if (ctx) ctx.suspend(); }, 1400);
    }
  }

  /* ── API PÚBLICA ──────────────────────────────────────────────────── */
  var AM = {
    toggleAmbient: function() {
      if (!ctx) init();
      resume();
      var btn = document.getElementById('sound-btn');
      var ico = btn ? btn.querySelector('i') : null;

      if (!ambientActive) {
        ambientActive = true;
        if (btn) btn.classList.add('playing');
        if (ico) ico.className = 'fas fa-volume-high';
        if (btn) btn.title = 'Silenciar música';
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(MAX_GAIN, ctx.currentTime + 2);
        buildPad();
        buildArpeggio();
        buildRhythm();
        if (window.ProdigyAnalytics) ProdigyAnalytics.trackAudioToggle('on');
      } else {
        if (btn) btn.classList.remove('playing');
        if (ico) ico.className = 'fas fa-volume-xmark';
        if (btn) btn.title = 'Música ambiente';
        stopAll();
        if (window.ProdigyAnalytics) ProdigyAnalytics.trackAudioToggle('off');
      }
    },

    startWorkflow: function() {
      if (!ctx) init();
      resume();
      if (!ambientActive) {
        ambientActive = true;
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(MAX_GAIN * 0.6, ctx.currentTime + 1.5);
        buildPad();
        buildRhythm();
      }
    },
    stopWorkflow: function() { stopAll(); },

    ping:    function() { playFeedback('ping');    },
    success: function() { playFeedback('success'); },
    error:   function() { playFeedback('error');   },
    click:   function() { playFeedback('click');   },
    upload:  function() { playFeedback('upload');  }
  };

  document.addEventListener('click', function _first() {
    if (ctx) resume();
    document.removeEventListener('click', _first);
  }, { once: true });

  window.ProdigyAudio = AM;

})(window);
