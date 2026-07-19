/**
 * PRODIGY — Días hábiles y festivos de Colombia
 * v1.0 · 2026-07-19
 *
 * POR QUÉ EXISTE
 * El cálculo de festivos estaba DUPLICADO en flujo-fresado.html y
 * js/flujo-impresion.js, y AUSENTE en flujo-diseno y flujo-lab. Esos dos
 * últimos solo hacían:
 *     if (d !== 0 && d !== 6 && h >= 8 && h < 18) horasRestantes--;
 * es decir, saltaban sábado y domingo pero prometían entregas en pleno
 * festivo — y en Colombia son ~18 al año, casi todos lunes.
 *
 * Además los criterios no coincidían entre flujos:
 *   · impresión: "Lunes a Sábado (domingo excluido)"  → el sábado cuenta
 *   · diseño:    saltaba sábado Y domingo             → el sábado no cuenta
 * El mismo caso daba fechas distintas según por dónde entrara.
 *
 * ⚠️ NO se toca calcularFechaEntrega() de fresado ni de impresión: esas
 * funciones están marcadas INTOCABLE y además ya calculan bien. Este módulo
 * es para los flujos que NO tenían nada y para lo que se escriba de aquí en
 * adelante.
 *
 * Uso:
 *   PFechas.esFestivo(new Date())        → true/false
 *   PFechas.esHabil(new Date())          → false si domingo o festivo
 *   PFechas.entrega(16)                  → Date, sumando 16 horas hábiles
 *   PFechas.entregaDias(2)               → Date, sumando 2 días hábiles
 */
(function () {

    /* ── Configuración del laboratorio ────────────────────────────────
       Un solo lugar donde cambiarlo. Si algún día se abre el sábado o se
       mueve el horario, se ajusta aquí y aplica a todo.                */
    const CFG = {
        horaApertura: 8,    // 8:00 AM
        horaCierre:   18,   // 6:00 PM — fin de la jornada de producción
        horaCorte:    17,   // 5:00 PM — después de esta hora el caso entra al día siguiente
        sabadoHabil:  false // el sábado NO cuenta como día de producción
    };

    /* ── Festivos de Colombia ─────────────────────────────────────────
       Fijos + Ley Emiliani (se trasladan al lunes siguiente) + los que
       dependen de la Pascua, calculada con el algoritmo de Butcher.     */
    function obtenerFestivos(anio) {
        const set = new Set();
        const add = (mes, dia) => set.add(new Date(anio, mes - 1, dia).toDateString());

        /** Ley Emiliani: si no cae lunes, se corre al lunes siguiente. */
        function emiliani(mes, dia) {
            const d = new Date(anio, mes - 1, dia);
            const dow = d.getDay();
            if (dow !== 1) d.setDate(d.getDate() + (dow === 0 ? 1 : 8 - dow));
            set.add(d.toDateString());
        }

        // Fijos, sin traslado
        add(1,1);   // Año Nuevo
        add(5,1);   // Día del Trabajo
        add(7,20);  // Independencia
        add(8,7);   // Batalla de Boyacá
        add(12,8);  // Inmaculada Concepción
        add(12,25); // Navidad

        // Ley Emiliani
        emiliani(1,6);   // Reyes Magos
        emiliani(3,19);  // San José
        emiliani(6,29);  // San Pedro y San Pablo
        emiliani(8,15);  // Asunción
        emiliani(10,12); // Día de la Raza
        emiliani(11,1);  // Todos los Santos
        emiliani(11,11); // Independencia de Cartagena

        // Pascua — algoritmo de Butcher
        const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100,
              d2 = Math.floor(b / 4), e = b % 4,
              f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
              h = (19 * a + b - d2 - g + 15) % 30,
              i = Math.floor(c / 4), k = c % 4,
              l = (32 + 2 * e + 2 * i - h - k) % 7,
              m = Math.floor((a + 11 * h + 22 * l) / 451),
              mp = Math.floor((h + l - 7 * m + 114) / 31),
              dp = ((h + l - 7 * m + 114) % 31) + 1;
        const pascua = new Date(anio, mp - 1, dp);

        // Jueves y Viernes Santo NO se trasladan
        const jSanto = new Date(pascua); jSanto.setDate(pascua.getDate() - 3);
        const vSanto = new Date(pascua); vSanto.setDate(pascua.getDate() - 2);
        set.add(jSanto.toDateString());
        set.add(vSanto.toDateString());

        /** Los que dependen de Pascua sí se trasladan al lunes. */
        function emilianiDesde(base, dias) {
            const d = new Date(base); d.setDate(d.getDate() + dias);
            const dow = d.getDay();
            if (dow !== 1) d.setDate(d.getDate() + (dow === 0 ? 1 : 8 - dow));
            set.add(d.toDateString());
        }
        emilianiDesde(pascua, 39); // Ascensión
        emilianiDesde(pascua, 60); // Corpus Christi
        emilianiDesde(pascua, 68); // Sagrado Corazón

        return set;
    }

    const _cache = {};
    function esFestivo(fecha) {
        const a = fecha.getFullYear();
        if (!_cache[a]) _cache[a] = obtenerFestivos(a);
        return _cache[a].has(fecha.toDateString());
    }

    /** Día de producción: ni domingo, ni festivo, ni sábado si está cerrado. */
    function esHabil(fecha) {
        const d = fecha.getDay();
        if (d === 0) return false;
        if (d === 6 && !CFG.sabadoHabil) return false;
        return !esFestivo(fecha);
    }

    /** Siguiente día hábil a las 8:00 AM. */
    function siguienteHabil(desde) {
        const d = new Date(desde);
        d.setDate(d.getDate() + 1);
        d.setHours(CFG.horaApertura, 0, 0, 0);
        while (!esHabil(d)) d.setDate(d.getDate() + 1);
        return d;
    }

    /**
     * Momento en que realmente arranca el trabajo.
     * Si el caso entra después del corte (5 PM), fuera de horario o en día no
     * hábil, la cuenta empieza el siguiente día hábil a las 8 AM. Es lo que
     * antes no se respetaba: un pedido de viernes 6 PM prometía entrega el
     * sábado.
     */
    function inicioProduccion(desde) {
        let d = new Date(desde || Date.now());
        if (!esHabil(d)) return siguienteHabil(d);
        if (d.getHours() >= CFG.horaCorte) return siguienteHabil(d);
        if (d.getHours() < CFG.horaApertura) {
            d.setHours(CFG.horaApertura, 0, 0, 0);
            return d;
        }
        return d;
    }

    /** Suma horas HÁBILES (dentro de jornada, saltando no laborables). */
    function entrega(horasHabiles, desde) {
        let d = inicioProduccion(desde);
        let restantes = Math.max(0, Number(horasHabiles) || 0);
        // Tope de seguridad: evita un bucle infinito si la config queda mal
        let guarda = 0;
        while (restantes > 0 && guarda < 20000) {
            guarda++;
            d = new Date(d.getTime() + 3600000);
            if (esHabil(d) && d.getHours() > CFG.horaApertura && d.getHours() <= CFG.horaCierre) {
                restantes--;
            }
            if (d.getHours() >= CFG.horaCierre || !esHabil(d)) {
                const sig = siguienteHabil(d);
                if (sig > d) d = sig;
            }
        }
        return d;
    }

    /** Suma días hábiles completos. */
    function entregaDias(dias, desde) {
        let d = inicioProduccion(desde);
        let restantes = Math.max(0, Number(dias) || 0);
        while (restantes > 0) {
            d = siguienteHabil(d);
            restantes--;
        }
        d.setHours(CFG.horaCierre, 0, 0, 0);
        return d;
    }

    /** "vie 25 jul" — formato corto para mostrar al cliente. */
    function fmt(fecha) {
        return fecha.toLocaleDateString('es-CO',
            { weekday: 'short', day: 'numeric', month: 'short' });
    }

    /** ¿Cuántos festivos hay entre hoy y la fecha? Para explicar demoras. */
    function festivosEntre(desde, hasta) {
        const out = [];
        const d = new Date(desde);
        while (d <= hasta) {
            if (esFestivo(d)) out.push(new Date(d));
            d.setDate(d.getDate() + 1);
        }
        return out;
    }

    window.PFechas = {
        esFestivo, esHabil, entrega, entregaDias,
        inicioProduccion, siguienteHabil, festivosEntre, fmt,
        obtenerFestivos, CFG
    };
})();
