/**
 * ═══════════════════════════════════════════════════════════════
 *  PRODIGY — supabase-mock.js
 *  Puente de datos simulado con la API exacta de @supabase/supabase-js
 *  ─────────────────────────────────────────────────────────────
 *  PROPÓSITO: Permite que la futura integración real con Supabase
 *  sea un simple reemplazo de este archivo por el cliente oficial.
 *
 *  MIGRACIÓN FUTURA:
 *    1. npm install @supabase/supabase-js
 *    2. Reemplazar este archivo con:
 *       import { createClient } from '@supabase/supabase-js'
 *       export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
 *    3. Eliminar MOCK_DB — los datos vivirán en Supabase PostgreSQL
 *
 *  TABLAS SIMULADAS (PostgreSQL schema):
 *    - catalogo        → materiales y precios por categoría
 *    - pedidos         → órdenes de producción
 *    - usuarios        → doctores y operadores
 *    - config_precios  → extras (express, pulido, pintado...)
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

// ── LATENCIA SIMULADA (ms) para imitar red real ─────────────────
const MOCK_LATENCY = 120;
const delay = (ms = MOCK_LATENCY) => new Promise(r => setTimeout(r, ms));

// ══════════════════════════════════════════════════════════════════
//  MOCK_DB — Espejo fiel de los datos en flujo-impresion.js
//  Estructurado como tablas relacionales de PostgreSQL
// ══════════════════════════════════════════════════════════════════
const MOCK_DB = {

    /* ── tabla: catalogo ───────────────────────────────────────── */
    catalogo: [
        // MODELOS
        { id: 'mod_base',          categoria: 'resina_modelo',         nombre: 'Z-Model Base (Estudio/Trabajo)',               precio: 25000, activo: true, fast_ready: true,  descripcion: 'Sólido, acabado mate. Diagnóstico y articulación.' },
        { id: 'mod_termo',         categoria: 'resina_modelo',         nombre: 'Modelo Termoformado (Alineadores)',             precio: 35000, activo: true, fast_ready: true,  descripcion: 'Alta resistencia térmica y mecánica.' },
        { id: 'mod_gingiva',       categoria: 'resina_modelo',         nombre: 'Modelo con Encía Flexible',                    precio: 45000, activo: true, fast_ready: true,  descripcion: 'Máscara gingival removible para implantes.' },
        { id: 'mod_troquel',       categoria: 'resina_modelo',         nombre: 'Modelo Troquelado (Dieless)',                  precio: 40000, activo: true, fast_ready: true,  descripcion: 'Muñones removibles para ajuste de márgenes.' },
        { id: 'mod_geller',        categoria: 'resina_modelo',         nombre: 'Modelo Geller (Carillas)',                     precio: 50000, activo: true, fast_ready: true,  descripcion: 'Alveolos preparados para alta exigencia estética.' },
        { id: 'mod_mockup',        categoria: 'resina_modelo',         nombre: 'Modelo Mock-Up',                               precio: 30000, activo: true, fast_ready: true,  descripcion: 'Diseño de sonrisa impreso para llave motivacional.' },
        // BIOMODELOS FDM
        { id: 'bio_estandar',      categoria: 'resina_biomodelos',     nombre: 'Mandíbula / Maxilar / Parte Ósea Escala 1:1',  precio: 45000, activo: true, fast_ready: true,  descripcion: 'Impresión FDM. No exponer a calor > 60°C.' },
        { id: 'bio_craneo',        categoria: 'resina_biomodelos',     nombre: 'Cráneo Completo / Gran Volumen',               precio: 85000, activo: true, fast_ready: true,  descripcion: 'Gran volumen. Planificación quirúrgica craneofacial.' },
        // TEMPORALES
        { id: 'r_temp_standard',   categoria: 'resina_temporal',       nombre: 'Resina para Temporal',                         precio: 45000, activo: true, fast_ready: false, descripcion: 'Provisionales para uso hasta 6 meses.' },
        { id: 'r_temp_largo',      categoria: 'resina_temporal',       nombre: 'Temporal Larga Duración',                      precio: 120000, activo: true, fast_ready: false, descripcion: 'Carga cerámica 50%. Uso prolongado +5 años.' },
        { id: 'r_proto_eco',       categoria: 'resina_temporal',       nombre: 'Try-In Prototipo',                             precio: 30000, activo: true, fast_ready: false, descripcion: 'Validación clínica. No uso prolongado.' },
        { id: 'r_barra_test',      categoria: 'resina_temporal',       nombre: 'JIG / Barra de Verificación',                  precio: 50000, activo: true, fast_ready: false, descripcion: 'Verificación de pasividad para implantes.' },
        // DEFINITIVAS
        { id: 'def_onyx',          categoria: 'resina_definitiva',     nombre: 'ONYX — Elite (Carga Cerámica 80%)',            precio: 80000, activo: true, fast_ready: false, descripcion: 'Alta translucidez. Coronas definitivas de larga duración.' },
        { id: 'def_sprintray',     categoria: 'resina_definitiva',     nombre: 'SprintRay OnPoint',                            precio: 48000, activo: true, fast_ready: false, descripcion: 'Dureza oclusal extrema. Transicional larga duración.' },
        { id: 'def_graphy',        categoria: 'resina_definitiva',     nombre: 'Graphy TC-80',                                 precio: 45000, activo: true, fast_ready: false, descripcion: 'Guardas oclusales y férulas de descarga.' },
        { id: 'def_estandar',      categoria: 'resina_definitiva',     nombre: 'Definitiva Estándar',                          precio: 35000, activo: true, fast_ready: false, descripcion: 'Económica. Color único gris/blanco.' },
        // CALCINABLES
        { id: 'calc_cofia',        categoria: 'resina_calcinable',     nombre: 'Coronas, Carillas, Incrustaciones o Abutments', precio: 10000, activo: true, fast_ready: false, descripcion: 'Burnout 100% limpio. Para inyectar disilicato o fundir metal.' },
        { id: 'calc_barra',        categoria: 'resina_calcinable',     nombre: 'Barra para Implantes / Sobredentadura',         precio: 40000, activo: true, fast_ready: false, descripcion: 'Pasividad garantizada para sobredentaduras.' },
        { id: 'calc_esqueleto',    categoria: 'resina_calcinable',     nombre: 'Estructura Completa PPR',                       precio: 65000, activo: true, fast_ready: false, descripcion: 'Esqueleto metálico completo removible.' },
        // FÉRULAS Y GUÍAS
        { id: 'ferula_descarga',   categoria: 'resina_ferulas_guias',  nombre: 'Férula Miorrelajante / Descarga Rígida',        precio: 75000, activo: true, fast_ready: true,  descripcion: 'Biocompatibilidad Clase IIa. Bruxismo severo.' },
        { id: 'ferula_quirurgica', categoria: 'resina_ferulas_guias',  nombre: 'Guía Quirúrgica de Alta Precisión',             precio: 85000, activo: true, fast_ready: true,  descripcion: 'Transparente, Clase IIa. Planificación digital CBCT.' },
        { id: 'ferula_cubeta',     categoria: 'resina_ferulas_guias',  nombre: 'Cubeta Individual de Impresión',                precio: 45000, activo: true, fast_ready: true,  descripcion: 'Diseñada sobre modelo primario.' },
        // DISEÑO CAD
        { id: 'cad_express',       categoria: 'diseno_cad',            nombre: 'Express Posterior',                             precio: 25000, activo: true, fast_ready: true,  descripcion: 'Coronas posteriores anatómicas. Flujo IA/template Exocad. 4-8h.' },
        { id: 'cad_signature',     categoria: 'diseno_cad',            nombre: 'Signature Anterior (Alta Estética)',            precio: 65000, activo: true, fast_ready: false, descripcion: 'Sector frontal. Morfología personalizada, análisis de sonrisa. 24h.' },
        { id: 'cad_estructura',    categoria: 'diseno_cad',            nombre: 'Estructuras & Férulas (solo diseño)',           precio: 45000, activo: true, fast_ready: false, descripcion: 'Barras, cofias, sobredentaduras, PPR, guías quirúrgicas. 24-48h.' },
    ],

    /* ── tabla: config_precios (extras/recargos) ───────────────── */
    config_precios: [
        { id: 'postproceso_pulido',  nombre: 'Postproceso — Pulido',     precio: 15000,  tipo: 'extra' },
        { id: 'postproceso_pintado', nombre: 'Postproceso — Pintado',    precio: 25000,  tipo: 'extra' },
        { id: 'acabado_uv',          nombre: 'Glaseado UV Espejo',       precio: 15000,  tipo: 'extra' },
        { id: 'express_24h',         nombre: 'Recargo Express 24h',      precio: 20000,  tipo: 'recargo' },
        { id: 'express_12h',         nombre: 'Recargo Express 12h',      precio: 40000,  tipo: 'recargo' },
        { id: 'envio_nacional',      nombre: 'Envío Nacional (fuera BGA)',precio: 15000,  tipo: 'envio' },
    ],

    /* ── tabla: categorias_catalogo ────────────────────────────── */
    categorias_catalogo: [
        { id: 'resina_modelo',        nombre: 'Modelos',               descripcion: 'Yeso Digital y Troqueles',         color_hex: '#00d2ff' },
        { id: 'resina_temporal',      nombre: 'Temporales',            descripcion: 'Provisionales y Prototipos',       color_hex: '#fbbf24' },
        { id: 'resina_definitiva',    nombre: 'Definitivas',           descripcion: 'Carga Cerámica Alta Gama',         color_hex: '#a78bfa' },
        { id: 'resina_calcinable',    nombre: 'Calcinables',           descripcion: 'Para Inyección / Fundición',       color_hex: '#fb923c' },
        { id: 'resina_ferulas_guias', nombre: 'Férulas y Guías',       descripcion: 'Quirúrgicas y Splint',             color_hex: '#10b981' },
        { id: 'resina_biomodelos',    nombre: 'Biomodelos (FDM)',      descripcion: 'Anatomía Ósea y Craneofacial',     color_hex: '#d4c5a9' },
        { id: 'diseno_cad',           nombre: 'Diseño CAD',            descripcion: 'Exocad · 3Shape · IA',             color_hex: '#D946A6' },
    ],

    /* ── tabla: pedidos (datos demo) ───────────────────────────── */
    pedidos: [
        { id: 'PRD-2025-041', doctor: 'Dr. García',    paciente: 'Juan López',    servicio_id: 'cad_express',     estado: 'produccion', total: 50000, fecha: '2025-04-02', operador_id: null },
        { id: 'PRD-2025-040', doctor: 'Dra. Ruiz',     paciente: 'Ana Martínez',  servicio_id: 'bio_estandar',    estado: 'pendiente',  total: 45000, fecha: '2025-04-01', operador_id: null },
        { id: 'PRD-2025-039', doctor: 'Dr. López',     paciente: 'Carlos Rivas',  servicio_id: 'def_onyx',        estado: 'produccion', total: 96000, fecha: '2025-03-30', operador_id: 'op_pedro' },
        { id: 'PRD-2025-038', doctor: 'Dr. Mora',      paciente: 'María García',  servicio_id: 'mod_gingiva',     estado: 'entregado',  total: 45000, fecha: '2025-03-28', operador_id: 'op_pedro' },
        { id: 'PRD-2025-035', doctor: 'Dr. Soto',      paciente: 'Luis Morales',  servicio_id: 'ferula_descarga', estado: 'entregado',  total: 75000, fecha: '2025-03-22', operador_id: 'op_carlos' },
        { id: 'PRD-2025-032', doctor: 'Dra. Vargas',   paciente: 'Ana Martínez',  servicio_id: 'cad_signature',   estado: 'pendiente',  total: 130000, fecha: '2025-03-18', operador_id: null },
    ],

    /* ── tabla: usuarios ───────────────────────────────────────── */
    usuarios: [
        { id: 'usr_demo',    email: 'demo@prodigy.co',     nombre: 'Demo User',    rol: 'client',   activo: true },
        { id: 'adm_1',       email: 'alejandro@prodigy.co',nombre: 'Alejandro C.', rol: 'admin',    activo: true },
        { id: 'op_carlos',   email: 'carlos@prodigy.co',   nombre: 'Carlos (CAD)', rol: 'operator', activo: true },
        { id: 'op_pedro',    email: 'pedro@prodigy.co',    nombre: 'Pedro (CAM)',  rol: 'operator', activo: true },
    ],
};

// ══════════════════════════════════════════════════════════════════
//  QUERY BUILDER — imita la cadena .from().select().eq()
//  del SDK oficial @supabase/supabase-js
// ══════════════════════════════════════════════════════════════════
class MockQueryBuilder {
    constructor(tabla) {
        this._tabla   = tabla;
        this._data    = (MOCK_DB[tabla] || []).slice(); // copia
        this._filters = [];
        this._cols    = null;
        this._limit   = null;
        this._single  = false;
    }

    /** Filtro de igualdad: .eq('campo', valor) */
    eq(col, val) {
        this._data = this._data.filter(row => row[col] === val);
        return this;
    }

    /** Filtro de diferencia: .neq('campo', valor) */
    neq(col, val) {
        this._data = this._data.filter(row => row[col] !== val);
        return this;
    }

    /** Filtro in: .in('campo', [v1,v2]) */
    in(col, vals) {
        this._data = this._data.filter(row => vals.includes(row[col]));
        return this;
    }

    /** Columnas a retornar: .select('id,nombre,precio') */
    select(cols = '*') {
        if (cols !== '*') {
            const keys = cols.split(',').map(c => c.trim());
            this._cols = keys;
            this._data = this._data.map(row => {
                const filtered = {};
                keys.forEach(k => { filtered[k] = row[k]; });
                return filtered;
            });
        }
        return this;
    }

    /** Limitar resultados */
    limit(n) { this._limit = n; return this; }

    /** Retornar un solo registro */
    single() { this._single = true; return this; }

    /** Ordenar: .order('campo', {ascending:true}) */
    order(col, { ascending = true } = {}) {
        this._data.sort((a, b) => {
            const av = a[col], bv = b[col];
            if (av < bv) return ascending ? -1 : 1;
            if (av > bv) return ascending ? 1 : -1;
            return 0;
        });
        return this;
    }

    /** Ejecuta la query (devuelve Promise igual que Supabase) */
    async then(resolve, reject) {
        try {
            await delay();
            let result = this._data;
            if (this._limit) result = result.slice(0, this._limit);
            if (this._single) {
                resolve({ data: result[0] || null, error: result[0] ? null : { message: 'No encontrado' } });
            } else {
                resolve({ data: result, error: null });
            }
        } catch (err) {
            reject({ data: null, error: err });
        }
    }
}

// ══════════════════════════════════════════════════════════════════
//  AUTH MOCK — imita supabase.auth
// ══════════════════════════════════════════════════════════════════
const DEMO_CREDENTIALS = {
    'demo@prodigy.co':       { password: 'prodigy2025', rol: 'client',   id: 'usr_demo' },
    'alejandro@prodigy.co':  { password: 'admin2025',   rol: 'admin',    id: 'adm_1'   },
    'carlos@prodigy.co':     { password: 'cad2025',     rol: 'operator', id: 'op_carlos' },
    'pedro@prodigy.co':      { password: 'cam2025',     rol: 'operator', id: 'op_pedro'  },
};

const authMock = {
    _session: null,

    async signInWithPassword({ email, password }) {
        await delay();
        const cred = DEMO_CREDENTIALS[email.toLowerCase()];
        if (!cred || cred.password !== password) {
            return { data: null, error: { message: 'Credenciales incorrectas' } };
        }
        const user = MOCK_DB.usuarios.find(u => u.id === cred.id);
        this._session = { user, access_token: 'mock-token-' + Date.now() };
        sessionStorage.setItem('prodigy_role', cred.rol);
        sessionStorage.setItem('prodigy_user', email);
        sessionStorage.setItem('prodigy_uid',  cred.id);
        return { data: { user, session: this._session }, error: null };
    },

    async signOut() {
        await delay(50);
        this._session = null;
        sessionStorage.removeItem('prodigy_role');
        sessionStorage.removeItem('prodigy_user');
        sessionStorage.removeItem('prodigy_uid');
        return { error: null };
    },

    getSession() {
        const role = sessionStorage.getItem('prodigy_role');
        const user = sessionStorage.getItem('prodigy_user');
        if (role && user) {
            const u = MOCK_DB.usuarios.find(x => x.email === user);
            return { data: { session: { user: u } }, error: null };
        }
        return { data: { session: null }, error: null };
    },

    onAuthStateChange(cb) {
        // Llama inmediatamente con el estado actual
        const { data } = this.getSession();
        cb(data.session ? 'SIGNED_IN' : 'SIGNED_OUT', data.session);
        return { data: { subscription: { unsubscribe: () => {} } } };
    },
};

// ══════════════════════════════════════════════════════════════════
//  INSERT / UPDATE / DELETE MOCKS
// ══════════════════════════════════════════════════════════════════
class MockMutationBuilder {
    constructor(tabla, op, payload) {
        this._tabla   = tabla;
        this._op      = op;
        this._payload = payload;
        this._filter  = null;
    }

    eq(col, val) { this._filter = { col, val }; return this; }

    async then(resolve) {
        await delay();
        const tabla = MOCK_DB[this._tabla];
        if (!tabla) return resolve({ data: null, error: { message: 'Tabla no existe' } });

        if (this._op === 'insert') {
            const record = { ...this._payload, id: this._payload.id || `mock-${Date.now()}` };
            tabla.push(record);
            resolve({ data: record, error: null });

        } else if (this._op === 'update' && this._filter) {
            const idx = tabla.findIndex(r => r[this._filter.col] === this._filter.val);
            if (idx !== -1) {
                Object.assign(tabla[idx], this._payload);
                resolve({ data: tabla[idx], error: null });
            } else {
                resolve({ data: null, error: { message: 'Registro no encontrado' } });
            }

        } else if (this._op === 'delete' && this._filter) {
            const idx = tabla.findIndex(r => r[this._filter.col] === this._filter.val);
            if (idx !== -1) {
                tabla.splice(idx, 1);
                resolve({ data: { success: true }, error: null });
            } else {
                resolve({ data: null, error: { message: 'Registro no encontrado' } });
            }
        } else {
            resolve({ data: null, error: { message: 'Operación inválida' } });
        }
    }
}

// ══════════════════════════════════════════════════════════════════
//  CLIENTE PRINCIPAL — objeto `supabase` exportado
//  API compatible con @supabase/supabase-js v2
// ══════════════════════════════════════════════════════════════════
export const supabase = {
    auth: authMock,

    /**
     * Inicia una query de SELECT
     * @param {string} tabla — nombre de la tabla
     * @returns {MockQueryBuilder}
     * @example
     *   const { data } = await supabase.from('catalogo').select('*').eq('activo', true)
     */
    from(tabla) {
        return {
            select: (cols = '*') => new MockQueryBuilder(tabla).select(cols),

            insert: (payload) => new MockMutationBuilder(tabla, 'insert', payload),

            update: (payload) => new MockMutationBuilder(tabla, 'update', payload),

            delete: () => new MockMutationBuilder(tabla, 'delete', null),
        };
    },

    /**
     * Storage mock — retorna URL blob si se pasa un File
     * En producción: supabase.storage.from('archivos').upload(path, file)
     */
    storage: {
        from(bucket) {
            return {
                async upload(path, file) {
                    await delay(500);
                    const url = URL.createObjectURL(file);
                    return { data: { path, publicUrl: url }, error: null };
                },
                getPublicUrl(path) {
                    return { data: { publicUrl: `https://mock-storage.prodigy.co/${path}` } };
                },
            };
        },
    },
};

// ── HELPERS DE CONVENIENCIA ─────────────────────────────────────

/**
 * Obtiene todos los items del catálogo, opcionalmente filtrados por categoría
 * @param {string|null} categoria — ej. 'resina_modelo' | null para todos
 */
export async function getCatalogo(categoria = null) {
    const qb = supabase.from('catalogo').select('*').eq('activo', true);
    if (categoria) qb.eq('categoria', categoria);
    return qb;
}

/**
 * Actualiza el precio de un item del catálogo (Admin only)
 * @param {string} itemId — id del item
 * @param {number} nuevoPrecio
 */
export async function updatePrecio(itemId, nuevoPrecio) {
    return supabase.from('catalogo').update({ precio: nuevoPrecio }).eq('id', itemId);
}

/**
 * Obtiene pedidos filtrados por estado
 * @param {'pendiente'|'produccion'|'entregado'|null} estado
 */
export async function getPedidos(estado = null) {
    const qb = supabase.from('pedidos').select('*').order('fecha', { ascending: false });
    if (estado) qb.eq('estado', estado);
    return qb;
}

/**
 * Crea un nuevo pedido
 * @param {object} pedido — campos: doctor, paciente, servicio_id, total, operador_id?
 */
export async function crearPedido(pedido) {
    const nuevo = {
        ...pedido,
        id:     'PRD-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*900)+100),
        estado: 'pendiente',
        fecha:  new Date().toISOString().split('T')[0],
    };
    return supabase.from('pedidos').insert(nuevo);
}

// ── NOTA PARA EL DESARROLLADOR ──────────────────────────────────
if (typeof window !== 'undefined') {
    console.info(
        '%c[PRODIGY Mock] supabase-mock.js activo\n%cReemplazar con cliente real cuando tengas SUPABASE_URL + SUPABASE_ANON_KEY',
        'color:#D946A6;font-weight:900;', 'color:#64748b;'
    );
}
