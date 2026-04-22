        const SUB_MATERIALES_FALLBACK = {
            'resina_modelo': [
                { id: 'mod_base',     nom: 'Z-Model Base (Estudio/Trabajo)',        precio: 25000, fastReady: true, icon: '📐', info: 'Sólido, acabado mate. Diagnóstico y articulación.' },
                { id: 'mod_termo',    nom: 'Modelo Termoformado (Alineadores)',     precio: 35000, fastReady: true, icon: '😁', info: 'Alta resistencia térmica y mecánica.' },
                { id: 'mod_gingiva',  nom: 'Modelo con Encía Flexible',             precio: 45000, fastReady: true, icon: '🫦', info: 'Máscara gingival removible para implantes.' },
                { id: 'mod_troquel',  nom: 'Modelo Troquelado (Dieless)',           precio: 40000, fastReady: true, icon: '💎', info: 'Muñones removibles para ajuste de márgenes.' },
                { id: 'mod_geller',   nom: 'Modelo Geller (Carillas)',              precio: 50000, fastReady: true, icon: '✨', info: 'Alveolos preparados para alta exigencia estética.' },
                { id: 'mod_mockup',   nom: 'Modelo Mock-Up',                        precio: 30000, fastReady: true, icon: '😊', info: 'Diseño de sonrisa impreso para llave motivacional.' }
            ],
            'resina_biomodelos': [
                { id: 'bio_estandar', nom: 'Mandíbula / Maxilar / Parte Ósea Escala 1:1', subtitulo: 'FDM Filamento', precio: 45000, fastReady: true, icon: '💀', info: '<strong>Impresión FDM</strong> - Filamento alta resistencia. No exponer a calor directo > 60°C.' },
                { id: 'bio_craneo',   nom: 'Cráneo Completo / Gran Volumen',               subtitulo: 'FDM Gran Formato', precio: 85000, fastReady: true, icon: '🦴', info: '<strong>Gran Volumen</strong> - Planificación quirúrgica craneofacial. Escala 1:1 validada por CBCT.' }
            ],
            'resina_temporal': [
                { id: 'r_temp_standard',  nom: 'Resina para Temporal',        precio: 45000, icon: '⏳', info: '<strong>Uso estándar</strong> - Provisionales para uso hasta 6 meses' },
                { id: 'r_temp_largo',  nom: 'Temporal Larga Duración',  precio: 120000, icon: '💎', info: '<strong>Carga cerámica 50%</strong> - Resina reforzada para uso prolongado (+5 años)' },
                { id: 'r_proto_eco',   nom: 'Try-In Prototipo',     precio: 30000, icon: '🧪', info: '<strong>Validación clínica</strong> - Prototipo para prueba de ajuste · No uso prolongado' },
                { id: 'r_barra_test',  nom: 'JIG / Barra de Verificación',  precio: 50000, icon: '🔧', info: '<strong>Estructura rígida</strong> - Verificación de pasividad para implantes' },
                { id: 'r_rodete',      nom: 'Rodete para toma de mordida',  precio: 60000, icon: '📋', info: '<strong>Base de registro estable</strong> - Rodete anatómico para dimensión vertical' }
            ],
            'resina_definitiva': [
                // BLOQUE 1: PERMANENTES (Certificación Clase IIa)
                { id: 'def_rodin',     nom: 'Rodin Sculpture', subtitulo: 'Vida: 24 meses / Coronas y All-on-X', precio: 50000, icon: '🏛️', info: 'Rehabilitaciones totales, híbridas y coronas individuales. Alta resistencia al desgaste y estética duradera.' },
                { id: 'def_bego',      nom: 'BEGO Varseo Plus', subtitulo: 'Vida: Permanente / Coronas y Carillas', precio: 45000, icon: '💎', info: 'Resina definitiva con excelente estética. Ideal para coronas unitarias, inlays, onlays y carillas.' },
                { id: 'def_saremco',   nom: 'Saremco CROWNTEC', subtitulo: 'Vida: Permanente / Coronas e Inlays', precio: 42000, icon: '🎨', info: 'Resina de alta estética con excelente efecto camaleón. Para restauraciones definitivas.' },
                
                // BLOQUE 2: LARGA DURACIÓN (Transicionales)
                { id: 'def_sprintray', nom: 'SprintRay OnPoint', subtitulo: 'Vida: 12 a 24 meses / Coronas', precio: 48000, icon: '🎯', info: '<strong>Dureza Oclusal Extrema</strong> - Para casos transicionales de larga duración. Precisión marginal micrométrica' },
                { id: 'def_graphy',    nom: 'Graphy TC-80', subtitulo: 'Férulas / Placas Bruxismo', precio: 45000, icon: '🦷', info: 'Diseñada específicamente para guardas oclusales y férulas de descarga. Flexibilidad térmica y memoria de forma.' },
                
                // BLOQUE 3: USO GENERAL
                { id: 'def_estandar',  nom: 'Definitiva Estándar', subtitulo: 'Uso Limitado / Monocromática', precio: 35000, icon: '⚪', info: '<strong>Económica</strong> - Color único gris/blanco. Para casos de bajo presupuesto o pruebas' }
            ],
            'resina_calcinable': [
                { id: 'calc_cofia',    nom: 'Coronas, Carillas, Incrustaciones o Abutments', subtitulo: 'Cofia / Inlay / Fija', precio: 10000, icon: '🔥', info: '<strong>Burnout 100% Limpio (0% Cenizas)</strong> - Para inyectar disilicato o fundir metal. Subida lenta 5°C/min hasta 750°C · 1h de mantenimiento.' },
                { id: 'calc_barra',    nom: 'Barra para Implantes / Sobredentadura',          subtitulo: 'Gran Formato', precio: 40000, icon: '🔗', info: '<strong>Pasividad Garantizada</strong> - Estructuras largas para sobredentaduras sobre implantes. Estabilidad dimensional máxima.' },
                { id: 'calc_esqueleto',nom: 'Estructura Completa PPR',                         subtitulo: 'Alta Rigidez / Removible', precio: 65000, icon: '⚙️', info: '<strong>Estabilidad Dimensional</strong> - Esqueleto metálico completo. No se deforma, garantiza que el metal entre sin ajustes.' }
            ],
            'resina_ferulas_guias': [
                { id: 'ferula_descarga',   nom: 'Férula Miorrelajante / Descarga Rígida',  subtitulo: 'Bruxismo / Splint', precio: 75000, fastReady: true, icon: '🛡️', info: '<strong>Biocompatibilidad Clase IIa</strong> - Alta resistencia al desgaste, totalmente cristalina. No esterilizar en autoclave > 121°C.' },
                { id: 'ferula_quirurgica', nom: 'Guía Quirúrgica de Alta Precisión',        subtitulo: 'Implantes / Cirugía', precio: 85000, fastReady: true, icon: '🎯', info: '<strong>Precisión Micrométrica</strong> - Transparente, biocompatible Clase IIa. Diseñada sobre planificación digital de implantes (CBCT).' },
                { id: 'ferula_cubeta',     nom: 'Cubeta Individual de Impresión',           subtitulo: 'Impresión Definitiva', precio: 45000, fastReady: true, icon: '🥄', info: '<strong>Ajuste Anatómico Perfecto</strong> - Diseñada sobre modelo primario. Reduce gasto de silicona y mejora fidelidad en casos complejos.' }
            ]
        };

        const CONFIG = {
            materiales: {
                'resina_modelo': { nom: 'Modelos', desc: 'Yeso Digital y Troqueles' },
                'resina_temporal': { nom: 'Temporales', desc: 'Provisionales y Prototipos' },
                'resina_definitiva': { nom: 'Definitivas', desc: 'Carga Cerámica Alta Gama' },
                'resina_calcinable': { nom: 'Calcinables', desc: 'Para Inyección / Fundición' },
                'resina_ferulas_guias': { nom: 'Férulas y Guías', desc: 'Quirúrgicas y Splint' },
                'resina_biomodelos': { nom: 'Biomodelos', desc: 'Anatomía Ósea' }
            },
            precios_extras: {
                'postproceso_pulido': 15000,
                'postproceso_pintado': 25000,
                'acabado_uv': 15000,  // Glaseado UV Espejo
                'express': 20000,     // Recargo slot Express por unidad
                'express_24h': 20000,
                'express_12h': 40000,
                'resolucion_25_micras': 15000,  // Recargo por alta precisión y mayor tiempo de máquina
                'envio_nacional': 15000
            },
            horarios_corte: {
                'express': 9,
                'mediodia': 12,
                'tarde': 17
            }
        }

        // ==========================================
        // DEEP FREEZE - SEGURIDAD GRADO MILITAR
        // ==========================================
        function deepFreeze(object) {
            Object.keys(object).forEach(name => {
                let prop = object[name];
                if (typeof prop == 'object' && prop !== null) { 
                    deepFreeze(prop); 
                }
            });
            return Object.freeze(object);
        }

        // Aplicar congelamiento profundo
        deepFreeze(SUB_MATERIALES_FALLBACK);
        // CONFIG.precios_extras NO se congela: Supabase puede actualizar sus valores en runtime
        if(CONFIG.horarios_corte) deepFreeze(CONFIG.horarios_corte);
        deepFreeze(CONFIG);

        // SUB_MATERIALES mutable: se parchará con precios Supabase en inicializarCatalogo()
        let SUB_MATERIALES = SUB_MATERIALES_FALLBACK;

        // ─────────────────────────────────────────────
        // CATÁLOGO DINÁMICO: precios desde Supabase + Kill Switch
        // ─────────────────────────────────────────────
        async function inicializarCatalogo() {
            const sb = (typeof getSupabase === 'function') ? getSupabase() : null;
            if (!sb) return; // sin SDK → fallback estático, todo funciona igual

            try {
                const { data: items, error } = await sb
                    .from('catalogo')
                    .select('id,precio,activo')
                    .eq('flujo', 'impresion');
                if (error || !items || !items.length) return;

                const mapa = Object.fromEntries(items.map(i => [i.id, i]));

                // Reconstruir SUB_MATERIALES filtrando inactivos y actualizando precios
                const nuevoSub = {};
                for (const [cat, arr] of Object.entries(SUB_MATERIALES_FALLBACK)) {
                    nuevoSub[cat] = arr
                        .filter(item => {
                            const row = mapa[item.id];
                            return !row || row.activo !== false;
                        })
                        .map(item => {
                            const row = mapa[item.id];
                            return row ? { ...item, precio: row.precio } : item;
                        });
                }
                SUB_MATERIALES = nuevoSub;
                deepFreeze(SUB_MATERIALES);

                // Si el usuario ya eligió un material, actualizar el precio en STATE
                if (STATE.submaterialId && mapa[STATE.submaterialId]) {
                    STATE.submaterialPrecio = mapa[STATE.submaterialId].precio;
                    calcularTotal();
                }

                // Cargar también extras desde config_precios
                const { data: extras } = await sb
                    .from('config_precios')
                    .select('id,precio')
                    .eq('flujo', 'impresion');
                if (extras && extras.length) {
                    const extMap = Object.fromEntries(extras.map(e => [e.id, e.precio]));
                    // CONFIG.precios_extras no está congelado → mutación directa segura
                    if (extMap['postproceso_pulido'])   CONFIG.precios_extras.postproceso_pulido = extMap['postproceso_pulido'];
                    if (extMap['postproceso_pintado'])  CONFIG.precios_extras.postproceso_pintado = extMap['postproceso_pintado'];
                    if (extMap['acabado_uv'])           CONFIG.precios_extras.acabado_uv = extMap['acabado_uv'];
                    if (extMap['express_impresion'])    CONFIG.precios_extras.express = extMap['express_impresion'];
                    if (extMap['express_12h'])          CONFIG.precios_extras.express_12h = extMap['express_12h'];
                    if (extMap['resolucion_25_micras']) CONFIG.precios_extras.resolucion_25_micras = extMap['resolucion_25_micras'];
                    if (extMap['envio_nacional'])       CONFIG.precios_extras.envio_nacional = extMap['envio_nacional'];
                    calcularTotal();
                }
            } catch (e) {
                console.warn('[PRODIGY] Catálogo: usando precios estáticos.', e.message);
            }
        }


        let STATE = {
            materialTipo: null,
            submaterialId: null,
            submaterialPrecio: 0,
            submaterialNombre: null,
            proceso: null,
            colorVita: null,
            timeSlot: null,
            tieneExtras: false,
            ferulaGuia: null,
            ciudad: null,
            materialExterno: false,
            express: false,
            precioTerminado: 0
        };


        const SUBMAT_ICON_MAP={}; // IDs de fresado eliminados — impresión usa sub.icon directamente

        function toggleAccordion(header) {
            const accordion = header.parentElement;
            accordion.classList.toggle('active');
        }

        function toggleOtroOrigen() {
            const origen = document.getElementById('origen').value;
            const otroGroup = document.getElementById('otroOrigenGroup');
            
            if (origen === 'Otro') {
                otroGroup.classList.remove('hidden');
            } else {
                otroGroup.classList.add('hidden');
                document.getElementById('otroOrigen').value = '';
            }
        }

        function toggleMaterialExterno(){
            STATE.materialExterno=document.getElementById('material-externo').checked;
            const footer=document.getElementById('material-disclaimer-footer');
            const warningCal=document.getElementById('warning-calibracion-resina');
            
            if(STATE.materialExterno){
                if(footer)footer.style.display='block';
                if(warningCal)warningCal.style.display='block';
                // NO OCULTAR submaterial-container - es modificador global
            }else{
                if(footer)footer.style.display='none';
                if(warningCal)warningCal.style.display='none';
            }
            calcularTotal();
        }

        function validateNameOnly(input) {
            input.value = input.value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, '');
            clearError(input);
        }

        function validatePhone(input) {
            input.value = input.value.replace(/\D/g, '');
            clearError(input);
        }

        function showError(element, message) {
            element.classList.add('input-error');
            const existingTooltip = element.parentElement.querySelector('.tooltip-error');
            if (existingTooltip) existingTooltip.remove();

            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip-error';
            tooltip.textContent = message;
            element.parentElement.appendChild(tooltip);
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
            setTimeout(() => tooltip.remove(), 2800);
        }

        function clearError(element) {
            element.classList.remove('input-error');
            const tooltip = element.parentElement.querySelector('.tooltip-error');
            if (tooltip) tooltip.remove();
        }

        function handleOrigenChange() {
            const origen = document.getElementById('origen').value;
            const otroContainer = document.getElementById('otro-origen-container');
            if (origen === 'Otro') {
                otroContainer.classList.remove('hidden');
            } else {
                otroContainer.classList.add('hidden');
            }
        }

        function selectMaterial(tipo) {
            document.querySelectorAll('.material-card').forEach(card => {
                card.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');
            STATE.materialTipo = tipo;

            STATE.submaterialId = null;
            STATE.submaterialPrecio = 0;
            STATE.submaterialNombre = null;
            STATE.proceso = null;
            STATE.ferulaGuia = null;
            STATE.tieneExtras = false;
            STATE.colorVita = null;
            STATE.materialExterno = false;
            const _tme = document.getElementById('material-externo');
            if (_tme) { _tme.checked = false; _tme.disabled = false; }
            const _fme = document.getElementById('material-disclaimer-footer');
            if (_fme) _fme.style.display = 'none';
            
            // LIMPIAR BORDES DORADOS DE TARJETAS TEMPORALES
            document.querySelectorAll('[data-tipo^="temp-"]').forEach(card => {
                card.style.border = '2px solid #444';
                if (!card.getAttribute('data-tipo').includes('rodete')) {
                    card.style.background = 'rgba(0,0,0,0.3)';
                }
            });

            const submaterialContainer = document.getElementById('submaterial-container');
            const otroContainer = document.getElementById('otro-container');
            const procesoAccordion = document.getElementById('acc-proceso');
            // Si elige OTRO
            if (tipo === 'otro') {
                submaterialContainer.classList.add('hidden');
                otroContainer.classList.remove('hidden');
                procesoAccordion.classList.add('hidden');
                document.getElementById('proceso-content').innerHTML = '';
                return;
            }

            // Si elige CERA o METAL: ocultar procesos, auto-seleccionar crudo
            if (tipo === 'cera' || tipo === 'metal') {
                otroContainer.classList.add('hidden');
                procesoAccordion.classList.add('hidden');
                const _tlsm = document.getElementById('timeline-section');
                if (_tlsm) _tlsm.style.display = 'none';
                generarSubMateriales(tipo);
                STATE.proceso = 'crudo';
                document.getElementById('proceso-content').innerHTML = '';
                updateTimeline();
                calcularTotal();
                return;
            }

            // Flujo normal
            otroContainer.classList.add('hidden');
            procesoAccordion.classList.remove('hidden');
            actualizarVisibilidadColor();
            const _tls = document.getElementById('timeline-section');
            if (_tls) _tls.style.display = (tipo === 'cera' || tipo === 'metal' || tipo === 'otro') ? 'none' : 'block';
            const _bg = document.getElementById('btn-guia-zirc');
            if (_bg) _bg.style.display = (tipo === 'zirc') ? 'flex' : 'none';
            generarSubMateriales(tipo);

            document.getElementById('proceso-content').innerHTML = 
                '<p style="color: var(--text-secondary); text-align: center; padding: 40px 0;">Selecciona un material específico</p>';

            updateTimeline();
            calcularTotal();
        }

        function generarSubMateriales(tipo) {
            const container = document.getElementById('submaterial-container');
            const subMats = SUB_MATERIALES[tipo];

            if (!subMats || subMats.length === 0) {
                container.classList.add('hidden');
                return;
            }

            // MAPEO DE ICONOS Y COLORES (CORAZÓN DE V2.1)
            const infoCat = {
                resina_modelo: { titulo: "Modelos 3D", icono: "fa-layer-group", clase: "icon-modelos" },
                resina_temporal: { titulo: "Temporales, Prototipos, JIG de Verificación y Rodetes", icono: "fa-hourglass-half", clase: "icon-temporales" },
                resina_definitiva: { titulo: "Resinas Definitivas (Carga Cerámica)", icono: "fa-gem", clase: "icon-definitivas" },
                resina_calcinable: { titulo: "Resinas Calcinables (Inyección / Fundición)", icono: "fa-fire", clase: "icon-calcinables" },
                resina_ferulas_guias: { titulo: "Férulas y Guías Quirúrgicas", icono: "fa-crosshairs", clase: "icon-ferulas" },
                resina_biomodelos: { titulo: "Biomodelos Anatómicos", icono: "fa-bone", clase: "icon-biomodelos" }
            };

            const cat = infoCat[tipo] || { titulo: "Selecciona Tipo", icono: "fa-microchip", clase: "" };

            let html = '<div class="submaterial-section">';
            
            // INYECCIÓN REAL DEL TÍTULO CON ICONO Y COLOR
            html += `<h4 style="display:flex; align-items:center; gap:10px;">
                        <i class="fa-solid ${cat.icono} ${cat.clase}" style="font-size: 1.5rem;"></i> ${cat.titulo}
                    </h4>`;
            
            // BOTONES DE GUÍA CLÍNICA - CYAN ELÉCTRICO UNIFICADO
            if (tipo === 'resina_modelo') {
                html += `
                    <button type="button" onclick="document.getElementById('modal-guia-modelos').style.display='flex'" style="width: 100%; margin-bottom: 15px; background: rgba(0, 210, 255, 0.1); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fa-solid fa-book-medical"></i> Ver Guía Clínica de Modelos
                    </button>
                `;
            }
            
            if (tipo === 'resina_temporal') {
                html += `
                    <button type="button" onclick="document.getElementById('modal-guia-temporales').style.display='flex'" style="width: 100%; margin-bottom: 15px; background: rgba(0, 210, 255, 0.1); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fa-solid fa-book-medical"></i> Ver Guía Clínica de Temporales
                    </button>
                `;
            }
            
            if (tipo === 'resina_ferulas_guias') {
                html += `
                    <button type="button" onclick="document.getElementById('modal-guia-ferulas').style.display='flex'" style="width: 100%; margin-bottom: 15px; background: rgba(0, 210, 255, 0.1); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fa-solid fa-file-medical"></i> Ver Guía Clínica: Férulas y Guías
                    </button>
                `;
            }
            
            if (tipo === 'resina_definitiva') {
                html += `
                    <button type="button" onclick="document.getElementById('modal-guia-definitivas').style.display='flex'" style="width: 100%; margin-bottom: 15px; background: rgba(0, 210, 255, 0.1); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fa-solid fa-microscope"></i> Ver Guía Clínica: Definitivas
                    </button>
                `;
            }
            
            if (tipo === 'resina_calcinable') {
                html += `
                    <button type="button" onclick="document.getElementById('modal-guia-calcinables').style.display='flex'" style="width: 100%; margin-bottom: 15px; background: rgba(251, 146, 60, 0.1); border: 1px solid #fb923c; color: #fb923c; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fa-solid fa-fire"></i> Ver Guía Clínica: Calcinables
                    </button>
                `;
            }
            
            if (tipo === 'resina_biomodelos') {
                html += `
                    <button type="button" onclick="document.getElementById('modal-guia-biomodelos').style.display='flex'" style="width: 100%; margin-bottom: 15px; background: rgba(0, 210, 255, 0.1); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fa-solid fa-bone"></i> Ver Guía Clínica: Biomodelos
                    </button>
                `;
            }
            
            // CONFIGURADOR TEMPORALES - ESTILO TARJETAS V2.8 CON VITA
            if (tipo === 'resina_temporal') {
                html += `
                <div class="modelo-grid" style="display: grid; gap: 15px; background: rgba(255,255,255,0.02); padding: 20px; border-radius: 12px;">
                    
                    <div class="config-group">
                        <span style="font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Selecciona Tipo de Temporal</span>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
                            <div onclick="selectTemporal('r_temp_standard', 45000, 'Resina para Temporal', 'vita')" data-tipo="temp-standard" style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">RESINA TEMPORAL</div>
                                <div style="font-size: 0.7rem; color: #888; margin-bottom: 6px;">Uso hasta 6 meses</div>
                                <div style="color: var(--gold-primary); font-weight: bold; font-size: 1.1rem;">$45.000</div>
                            </div>
                            <div onclick="selectTemporal('r_temp_largo', 120000, 'Temporal Larga Duración', 'vita')" data-tipo="temp-largo" style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">LARGA DURACIÓN</div>
                                <div style="font-size: 0.7rem; color: #888; margin-bottom: 6px;">50% Cerámica · +5 años</div>
                                <div style="color: var(--gold-primary); font-weight: bold; font-size: 1.1rem;">$120.000</div>
                            </div>
                            <div onclick="selectTemporal('r_proto_eco', 30000, 'Try-In Prototipo', 'vita')" data-tipo="temp-tryin" style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">TRY-IN PROTOTIPO</div>
                                <div style="font-size: 0.7rem; color: #888; margin-bottom: 6px;">Validación · No prolongado</div>
                                <div style="color: var(--gold-primary); font-weight: bold; font-size: 1.1rem;">$30.000</div>
                            </div>
                            <div onclick="selectTemporal('r_barra_test', 50000, 'JIG / Barra de Verificación', 'none')" data-tipo="temp-barra" style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">JIG / BARRA</div>
                                <div style="font-size: 0.7rem; color: #888; margin-bottom: 6px;">Verificación implantes</div>
                                <div style="color: var(--gold-primary); font-weight: bold; font-size: 1.1rem;">$50.000</div>
                            </div>
                            <div onclick="selectTemporal('r_rodete', 60000, 'Rodete para toma de mordida', 'rodete')" data-tipo="temp-rodete" style="padding: 14px; background: linear-gradient(135deg, #b22222 0%, #8b0000 100%); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; color: #ffffff;">
                                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">RODETE MORDIDA</div>
                                <div style="font-size: 0.7rem; opacity: 0.9; margin-bottom: 6px;">Base registro estable</div>
                                <div style="color: #FFD700; font-weight: bold; font-size: 1.1rem;">$60.000</div>
                            </div>
                        </div>
                    </div>

                    <!-- COLORES DINÁMICOS SEGÚN SELECCIÓN -->
                    <div id="color-selector-container" style="display: none;">
                    </div>

                </div>
                `;

                container.innerHTML = html;
                container.classList.remove('hidden');
                return;
            }

            // CONFIGURADOR MODELOS V2.4 - PANEL TÉCNICO SIN EMOJIS
            if (tipo === 'resina_modelo') {
                html += `
                <div class="modelo-grid" style="display: grid; gap: 15px; background: rgba(255,255,255,0.02); padding: 20px; border-radius: 12px;">
                    
                    <div class="config-group">
                        <span style="font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Estructura Base</span>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
                            <div onclick="selectBase('solido_full', 35000)" data-tipo="base-solido-full" style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">SÓLIDO COMPLETO</div>
                                <div style="color: var(--gold-primary); font-weight: bold; font-size: 1.1rem;">$35.000</div>
                            </div>
                            <div onclick="selectBase('solido_media', 28000)" data-tipo="base-solido-media" style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">SÓLIDO MEDIA ARCADA</div>
                                <div style="color: var(--gold-primary); font-weight: bold; font-size: 1.1rem;">$28.000</div>
                                <div style="font-size: 0.7rem; color: #888; margin-top: 2px;">≤6 dientes</div>
                            </div>
                            <div onclick="selectBase('hueco_full', 30000)" data-tipo="base-hueco-full" style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">HUECO COMPLETO</div>
                                <div style="color: var(--gold-primary); font-weight: bold; font-size: 1.1rem;">$30.000</div>
                            </div>
                            <div onclick="selectBase('hueco_media', 24000)" data-tipo="base-hueco-media" style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">HUECO MEDIA ARCADA</div>
                                <div style="color: var(--gold-primary); font-weight: bold; font-size: 1.1rem;">$24.000</div>
                                <div style="font-size: 0.7rem; color: #888; margin-top: 2px;">≤6 dientes</div>
                            </div>
                        </div>
                    </div>

                    <div class="config-group">
                        <span style="font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Propósito y Especialidad</span>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
                            <div onclick="selectProposito('estudio', 0)" data-tipo="prop-estudio" style="padding: 12px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight: 700; font-size: 0.9rem;">ESTUDIO / TRABAJO</div>
                            </div>
                            <div onclick="selectProposito('alineador', 0)" data-tipo="prop-alineador" style="padding: 12px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight: 700; font-size: 0.9rem;">ALINEADORES</div>
                                <div style="font-size: 0.7rem; color: #888; margin-top: 2px;">Obliga Sólido + Gris</div>
                            </div>
                            <div onclick="selectProposito('mockup', 0)" data-tipo="prop-mockup" style="padding: 12px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight: 700; font-size: 0.9rem;">MOCK-UP</div>
                            </div>
                            <div onclick="selectProposito('geller', 8000)" data-tipo="prop-geller" style="padding: 12px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight: 700; font-size: 0.9rem;">GELLER / TROQUELADO</div>
                                <div style="font-size: 0.7rem; color: var(--gold-primary); margin-top: 3px; font-weight: 600;">+$8.000</div>
                                <div style="font-size: 0.65rem; color: #888; margin-top: 1px;">Incluye 12 troqueles</div>
                            </div>
                        </div>
                    </div>

                    <div class="config-group" style="margin-top: 15px;">
                        <span style="font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Color de Impresión</span>
                        <div style="display: flex; gap: 12px; margin-top: 8px;">
                            <div onclick="selectColor('gris')" id="btn-gris" data-tipo="color-gris" style="flex: 1; padding: 14px; background: linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; color: white; font-weight: 700; font-size: 1rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                                GRIS
                            </div>
                            <div onclick="selectColor('durazno')" id="btn-durazno" data-tipo="color-durazno" style="flex: 1; padding: 14px; background: linear-gradient(135deg, #ffb088 0%, #ff9966 100%); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; color: #2a1810; font-weight: 700; font-size: 1rem; text-shadow: 0 1px 2px rgba(255,255,255,0.3);">
                                MELÓN / SKIN
                            </div>
                        </div>
                    </div>

                    <div class="extras-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 15px;">
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="check-zocalo-art" onchange="toggleExtraV4('zocalo_articulador', 5000)" style="width: 18px; height: 18px; cursor: pointer;">
                            <span>Zócalo / Articulador (+$5.000)</span>
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="check-encia" onchange="toggleExtraV4('encia', 15000)" style="width: 18px; height: 18px; cursor: pointer;">
                            <span>Encía Flexible (+$15.000)</span>
                        </label>
                    </div>

                    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; margin-top: 8px;">
                        <span style="font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Troqueles Extra</span>
                        <p style="font-size: 0.75rem; color: #666; margin: 5px 0 8px 0; line-height: 1.4;">
                            Si desea troqueles extra, asegúrese de incluirlos en su archivo STL.
                        </p>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="number" id="num-troqueles" min="0" value="0" onchange="calcularTotalModelosV4()" style="flex: 1; padding: 10px; background: #111; border: 2px solid #333; color: white; border-radius: 6px; font-size: 0.95rem; font-weight: 600;">
                            <span style="color: var(--gold-primary); font-weight: 600;">x $2.500 c/u</span>
                        </div>
                        <div id="warning-troqueles-v4" style="display: none; margin-top: 10px; padding: 10px; background: rgba(255,152,0,0.1); border-left: 3px solid #ff9800; border-radius: 4px; font-size: 0.75rem; color: #ff9800;">
                            ⚠️ Sin modelo Geller, los troqueles se imprimen sueltos para verificación según archivo STL enviado.
                        </div>
                    </div>

                </div>
                `;
                
                container.innerHTML = html;
                container.classList.remove('hidden');
                return;
            }
            
            // TARJETAS ESTILO MODELOS (limpias, sin iconos) para definitivas, calcinables, férulas, biomodelos
            // RESINAS DEFINITIVAS: tarjetas limpias + sección de color separada (V6.2)
            if (tipo === 'resina_definitiva') {
                html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px;">';

                subMats.forEach(sub => {
                    html += `
                        <div onclick="selectSubMaterial('${sub.id}', '${sub.nom}', ${sub.precio})"
                             data-id="${sub.id}"
                             style="padding: 18px 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s ease;"
                             onmouseover="this.style.borderColor='var(--accent-cyan)'; this.style.background='rgba(0,210,255,0.05)';"
                             onmouseout="if(!this.classList.contains('selected')){this.style.borderColor='#444'; this.style.background='rgba(0,0,0,0.3)';}">
                            <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 2px; line-height: 1.2; text-transform: uppercase;">${sub.nom}</div>
                            ${sub.subtitulo ? `<div style="font-size: 0.8rem; color: #aaa; margin-bottom: 8px; font-style: italic;">${sub.subtitulo}</div>` : ''}
                            ${sub.info ? `<div style="font-size: 0.75rem; color: #888; margin-bottom: 8px; line-height: 1.4;">${sub.info}</div>` : ''}
                            <div style="color: var(--gold-primary); font-weight: bold; font-size: 1.1rem;">$${sub.precio.toLocaleString('es-CO')}</div>
                        </div>
                    `;
                });

                html += '</div>';

                html += `
                    <div id="section-color" style="display: none; margin-top: 20px;">
                        <label style="font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Color VITA Classical</label>
                        <div id="grid-colores" class="sub-grid-container" style="margin-top: 10px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        </div>
                    </div>

                    <div id="section-terminado" style="display: none; margin-top: 20px;">
                        <label style="font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Servicio de Terminado</label>
                        <div class="sub-grid-container" style="margin-top: 10px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            <div class="sub-option-btn terminado-btn" onclick="seleccionarTerminado('Solo Glaseado', this)" style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight:700;">Solo Glaseado</div>
                                <div style="font-size:0.75rem;color:#888;margin-top:4px;">+$15.000</div>
                            </div>
                            <div class="sub-option-btn terminado-btn" onclick="seleccionarTerminado('Maquillaje + Glaseado', this)" style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight:700;">Maquillaje + Glaseado</div>
                                <div style="font-size:0.75rem;color:#888;margin-top:4px;">+$25.000</div>
                            </div>
                        </div>
                        <div style="margin-top: 10px; padding: 12px 15px; background: rgba(0,210,255,0.05); border-left: 4px solid var(--accent-cyan); border-radius: 8px;">
                            <div style="color: var(--accent-cyan); font-weight: 700; font-size: 0.8rem; margin-bottom: 6px;">✨ SERVICIO DE GLASEADO</div>
                            <p style="font-size: 0.72rem; line-height: 1.5; color: var(--text-secondary); margin: 0;">El glaseado fotopolimerizable mejora el brillo, la resistencia al desgaste y la biocompatibilidad de las piezas. El maquillaje permite personalizar tonos y caracterizaciones sobre la pieza impresa.</p>
                        </div>
                    </div>
                `;

                html += '</div>';
                container.innerHTML = html;
                container.classList.remove('hidden');
                return;
            }

            // CALCINABLES, FÉRULAS, BIOMODELOS: tarjetas estándar sin colores inline
            if (tipo === 'resina_calcinable' || tipo === 'resina_ferulas_guias' || tipo === 'resina_biomodelos') {
                html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px;">';

                subMats.forEach(sub => {
                    html += `
                        <div onclick="selectSubMaterial('${sub.id}', '${sub.nom}', ${sub.precio})"
                             data-id="${sub.id}"
                             style="padding: 18px 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s ease;"
                             onmouseover="this.style.borderColor='var(--accent-cyan)'; this.style.background='rgba(0,210,255,0.05)';"
                             onmouseout="if(!this.classList.contains('selected')){this.style.borderColor='#444'; this.style.background='rgba(0,0,0,0.3)';}">
                            <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 2px; line-height: 1.2; text-transform: uppercase;">${sub.nom}</div>
                            ${sub.subtitulo ? `<div style="font-size: 0.8rem; color: #aaa; margin-bottom: 8px; font-style: italic;">(${sub.subtitulo})</div>` : ''}
                            ${sub.info ? `<div style="font-size: 0.75rem; color: #888; margin-bottom: 8px; line-height: 1.4;">${sub.info}</div>` : ''}
                            <div style="color: var(--gold-primary); font-weight: bold; font-size: 1.1rem;">$${sub.precio.toLocaleString('es-CO')}</div>
                        </div>
                    `;
                });

                html += '</div>';

                html += `
                    <div id="section-color" style="display: none; margin-top: 20px;">
                        <label style="color: #00d2ff; font-weight: bold; font-size: 0.9rem;">🎨 Seleccione Color VITA:</label>
                        <div id="grid-colores" class="sub-grid-container" style="margin-top: 10px; display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px;">
                        </div>
                    </div>
                    <div id="section-terminado" style="display: none; margin-top: 20px;">
                        <label style="font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Servicio de Terminado</label>
                        <div class="sub-grid-container" style="margin-top: 10px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            <div class="sub-option-btn terminado-btn" onclick="seleccionarTerminado('Solo Glaseado', this)" style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight:700;">Solo Glaseado</div>
                                <div style="font-size:0.75rem;color:#888;margin-top:4px;">+$15.000</div>
                            </div>
                            <div class="sub-option-btn terminado-btn" onclick="seleccionarTerminado('Maquillaje + Glaseado', this)" style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-weight:700;">Maquillaje + Glaseado</div>
                                <div style="font-size:0.75rem;color:#888;margin-top:4px;">+$25.000</div>
                            </div>
                        </div>
                        <div style="margin-top: 10px; padding: 12px 15px; background: rgba(0,210,255,0.05); border-left: 4px solid var(--accent-cyan); border-radius: 8px;">
                            <div style="color: var(--accent-cyan); font-weight: 700; font-size: 0.8rem; margin-bottom: 6px;">✨ SERVICIO DE GLASEADO</div>
                            <p style="font-size: 0.72rem; line-height: 1.5; color: var(--text-secondary); margin: 0;">El glaseado fotopolimerizable mejora el brillo, la resistencia al desgaste y la biocompatibilidad de las piezas. El maquillaje permite personalizar tonos y caracterizaciones sobre la pieza impresa.</p>
                        </div>
                    </div>
                `;

                html += '</div>';
                container.innerHTML = html;
                container.classList.remove('hidden');
                return;
            }

            // SISTEMA VIEJO DE CHIPS (para temporales si es necesario)
            html += '<div class="submaterial-chips">';

            subMats.forEach(sub => {
                const iD=SUBMAT_ICON_MAP[sub.id]||{icon:sub.icon||'🔹',cls:'neon-sub-oro'};
                html += `
                    <div class="submaterial-chip" data-id="${sub.id}" onclick="selectSubMaterial('${sub.id}', '${sub.nom}', ${sub.precio})">
                        <div class="icon-neon-wrapper ${iD.cls}">${iD.icon}</div>
                        <div class="submaterial-name" style="font-weight:700;">${sub.nom}</div>
                        ${sub.info?`<div class="submaterial-info">${sub.info}</div>`:''}
                        <div class="submaterial-price" style="margin-top:5px;color:var(--gold-primary);font-weight:bold;">$${sub.precio.toLocaleString('es-CO')}</div>
                    </div>
                `;
            });
            // Centrar si solo hay 1 elemento (disi, cera)
            if(subMats.length===1){const grid=document.getElementById('submaterial-container');if(grid)grid.querySelector('.submaterial-chips')?.classList.add('submaterial-chips-single');}

            html += '</div></div>';
            container.innerHTML = html;
            container.classList.remove('hidden');
        }

        function selectSubMaterial(id, nombre, precio) {
            // 1. ESTADO NATIVO
            STATE.submaterialId = id;
            STATE.submaterialNombre = nombre;
            STATE.precioBase = parseFloat(precio);
            STATE.submaterialPrecio = parseFloat(precio);

            // 2. UI BOTONES - Marcar seleccionado
            document.querySelectorAll('[data-id]').forEach(card => {
                card.classList.remove('selected');
                if (card.style.borderColor) {
                    card.style.borderColor = '#444';
                    card.style.background = 'rgba(0,0,0,0.3)';
                }
            });
            
            const selectedCard = document.querySelector(`[data-id="${id}"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
                selectedCard.style.borderColor = 'var(--accent-cyan)';
                selectedCard.style.background = 'rgba(0,210,255,0.1)';
            }

            // 3. MAPEO DE COLORES (CÓDIGOS OFICIALES LIMPIOS)
            const colorSection = document.getElementById('section-color');
            const colorGrid = document.getElementById('grid-colores');
            const terminadoSection = document.getElementById('section-terminado');

            const mapeoColores = {
                'def_rodin': ['A1', 'A2', 'A3', 'B1', 'C2', '0M1', '0M3'],
                'def_bego': ['A1', 'A2', 'A3', 'B1', 'B3', 'C2', 'D3', 'BL'],
                'def_saremco': ['A1', 'A2', 'A3', 'A3.5', 'B1', 'SW'],
                'def_sprintray': ['A1', 'A2', 'A3', 'B1', 'B3', 'C2', 'D3', 'Bleach'],
                'def_graphy': ['A1', 'A2', 'A3'],
                'def_estandar': ['A1', 'A2', 'A3', 'B1'],
                'temp_unidad': ['A1', 'A2', 'A3', 'B1']
            };

            // 4. GENERAR TARJETAS DE COLOR - ESTILO VITA CON FONDOS REALES
            const VITA_ESTILOS = {
                'A1':     { bg: 'linear-gradient(135deg, #f0e8dd 0%, #e8dcc8 100%)', color: '#3a2a1a', desc: 'Muy Claro' },
                'A2':     { bg: 'linear-gradient(135deg, #ead4b8 0%, #ddc5a5 100%)', color: '#3a2a1a', desc: 'Claro' },
                'A3':     { bg: 'linear-gradient(135deg, #d4b595 0%, #c8a885 100%)', color: '#2a1a10', desc: 'Medio' },
                'A3.5':   { bg: 'linear-gradient(135deg, #c8a880 0%, #bc9c70 100%)', color: '#2a1a10', desc: 'Medio Oscuro' },
                'B1':     { bg: 'linear-gradient(135deg, #f5f0e8 0%, #ede5d8 100%)', color: '#3a2a1a', desc: 'Amarillento' },
                'B2':     { bg: 'linear-gradient(135deg, #ede0c8 0%, #ddd0b8 100%)', color: '#3a2a1a', desc: 'Amarillo Medio' },
                'B3':     { bg: 'linear-gradient(135deg, #e0cc98 0%, #d0bc88 100%)', color: '#3a2a1a', desc: 'Amarillo' },
                'C2':     { bg: 'linear-gradient(135deg, #d8b890 0%, #cca878 100%)', color: '#2a1a10', desc: 'Pardo Claro' },
                'D3':     { bg: 'linear-gradient(135deg, #c8a070 0%, #b89060 100%)', color: '#2a1a10', desc: 'Pardo Medio' },
                'BL':     { bg: 'linear-gradient(135deg, #fafaf8 0%, #f2f2f0 100%)', color: '#3a2a1a', desc: 'Bleach' },
                'Bleach': { bg: 'linear-gradient(135deg, #fafaf8 0%, #f2f2f0 100%)', color: '#3a2a1a', desc: 'Bleach' },
                '0M1':    { bg: 'linear-gradient(135deg, #f8f4ef 0%, #f0ece5 100%)', color: '#3a2a1a', desc: 'Blanqueado' },
                '0M3':    { bg: 'linear-gradient(135deg, #f0e8de 0%, #e8e0d5 100%)', color: '#3a2a1a', desc: 'Muy Claro' },
                'SW':     { bg: 'linear-gradient(135deg, #fefefe 0%, #f8f8f8 100%)', color: '#3a2a1a', desc: 'Snow White' },
            };

            if (colorSection && colorGrid) {
                if (mapeoColores[id]) {
                    colorSection.style.display = 'block';
                    terminadoSection.style.display = 'block';

                    // Label de sección
                    const labelEl = colorSection.querySelector('label');
                    if (labelEl) labelEl.textContent = 'Color VITA Classical';

                    // Grid de colores estilizados
                    colorGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                    colorGrid.innerHTML = '';

                    mapeoColores[id].forEach(c => {
                        const estilo = VITA_ESTILOS[c] || { bg: 'rgba(0,0,0,0.3)', color: '#fff', desc: '' };
                        let btn = document.createElement('div');
                        btn.className = 'sub-option-btn color-btn';
                        btn.style.cssText = `padding: 12px; background: ${estilo.bg}; border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s ease; color: ${estilo.color};`;
                        btn.innerHTML = `<div style="font-weight:700;font-size:0.95rem;">${c}</div>`;
                        btn.onclick = (e) => seleccionarColor(c, e.currentTarget);
                        colorGrid.appendChild(btn);
                    });

                    // Disclaimer caracterización (insertar después del grid si no existe)
                    const disclaimerId = 'disclaimer-caract-def';
                    if (!document.getElementById(disclaimerId)) {
                        const disclaimer = document.createElement('div');
                        disclaimer.id = disclaimerId;
                        disclaimer.innerHTML = `
                            <div style="margin-top:15px;padding:15px;background:rgba(139,115,85,0.08);border-left:4px solid var(--gold-primary);border-radius:8px;">
                                <div style="color:var(--gold-primary);font-weight:700;font-size:0.85rem;margin-bottom:8px;">🎨 SERVICIO DE CARACTERIZACIÓN (TINTE)</div>
                                <p style="font-size:0.75rem;line-height:1.5;color:var(--text-secondary);margin:0;">Si el color deseado no se encuentra en las opciones base, PRODIGY ofrece el servicio de caracterización mediante tintes y maquillaje. Debido a factores químicos y de post-procesado, no se garantiza una exactitud del 100% respecto a la guía física, aunque el proceso se realiza bajo estándares de excelencia para buscar el mejor resultado estético posible.</p>
                            </div>
                        `;
                        colorSection.appendChild(disclaimer);
                    }
                } else {
                    colorSection.style.display = 'none';
                    terminadoSection.style.display = 'none';
                }
            }
            
            // 5. ACTUALIZAR CALCULADORA VISUAL
            const baseDisplay = document.getElementById('precio-base-display');
            if (baseDisplay) baseDisplay.innerText = "$ " + STATE.precioBase.toLocaleString('es-CO');
            
            // 6. ASIGNAR PROCESO POR DEFECTO
            if (!STATE.proceso) {
                STATE.proceso = '50_micras';
            }
            
            // 7. ACTUALIZAR RESUMEN Y DISPARAR CÁLCULOS
            actualizarResumenCalculadora();
            if (typeof calcularTotal === 'function') calcularTotal();
        }

        // NUEVAS FUNCIONES DE ESTADO V6.1
        function seleccionarColor(color, elemento) {
            STATE.color = color;
            document.querySelectorAll('.color-btn').forEach(b => {
                b.classList.remove('active');
                b.style.borderColor = '#444';
                b.style.boxShadow = 'none';
            });
            elemento.classList.add('active');
            elemento.style.borderColor = 'var(--accent-cyan)';
            elemento.style.boxShadow = '0 0 0 2px var(--accent-cyan)';
            actualizarResumenCalculadora();
        }

        function seleccionarTerminado(tipo, elemento) {
            STATE.terminado = tipo;
            STATE.precioTerminado = tipo === 'Solo Glaseado' ? 15000 : (tipo === 'Maquillaje + Glaseado' ? 25000 : 0);
            document.querySelectorAll('.terminado-btn').forEach(b => {
                b.classList.remove('active');
                b.style.borderColor = '#444';
                b.style.background = 'rgba(0,0,0,0.3)';
            });
            elemento.classList.add('active');
            elemento.style.borderColor = 'var(--accent-cyan)';
            elemento.style.background = 'rgba(0,210,255,0.1)';
            actualizarResumenCalculadora();
            calcularTotal();
        }

        function actualizarResumenCalculadora() {
            const calcResina = document.getElementById('calc-resina');
            const calcColor = document.getElementById('calc-color');
            const calcTerminado = document.getElementById('calc-terminado');
            const baseDisplay = document.getElementById('precio-base-display');
            
            if (calcResina) calcResina.innerText = STATE.submaterialNombre || '-';
            if (calcColor) calcColor.innerText = STATE.color || 'Pendiente';
            if (calcTerminado) calcTerminado.innerText = STATE.terminado || 'Pendiente';
            if (baseDisplay) baseDisplay.innerText = "$ " + STATE.precioBase.toLocaleString('es-CO');
        }

        function selectColorVita(color) {
            // MANTENER COMPATIBILIDAD CON FUNCIÓN ANTERIOR
            seleccionarColor(color, event.currentTarget);
        }



        function generarProceso(tipo) {
            const contenedor = document.getElementById('proceso-content');
            let html = '';

            // RESOLUCIONES PARA TODAS LAS RESINAS 3D
            html = `
                <h4 style="color: var(--gold-primary); margin-bottom: 15px;">Selecciona la Resolución de Impresión</h4>
                <div class="process-grid" style="grid-template-columns: repeat(2, 1fr);">
                    <div class="process-card" onclick="selectProcess('50_micras')">
                        <span class="icon">📏</span>
                        <h4>50 Micras (Estándar)</h4>
                        <p>Resolución estándar - Excelente para modelos</p>
                        <small style="color: var(--gold-primary); font-size: 0.75rem; display: block; margin-top: 8px;">⚡ Mayor velocidad de impresión</small>
                    </div>
                    <div class="process-card" onclick="selectProcess('25_micras')">
                        <span class="icon">🔬</span>
                        <h4>25 Micras: Alta Precisión (+$15,000)</h4>
                        <p>Precisión quirúrgica absoluta</p>
                        <small style="color: var(--gold-primary); font-size: 0.75rem; display: block; margin-top: 8px;">⚠️ Requiere doble tiempo de máquina y calibración específica de resina</small>
                    </div>
                </div>

                <div class="alert alert-warning" style="margin-top: 20px; background: rgba(255, 152, 0, 0.08); border: 1.5px solid rgba(255, 152, 0, 0.3);">
                    ⚠️ <strong>Nota Técnica - 25 Micras:</strong> La impresión a 25 micras duplica el tiempo de uso de máquina y el costo de calibración, garantizando precisión absoluta en piezas pequeñas y detalles quirúrgicos.
                </div>
            `;

            contenedor.innerHTML = html;
        }

        function generarOpcionesVita() {
            const colores = ['A1','A2','A3','A3.5','A4','B1','B2','B3','B4','C1','C2','C3','C4','D2','D3','D4','BL1','BL2','BL3','BL4'];
            return colores.map(c => `<div class="vita-option" onclick="selectVita('${c}')">${c}</div>`).join('');
        }

        function selectProcess(proc) {
            document.querySelectorAll('#proceso-content .process-grid .process-card').forEach(card => {
                card.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');
            STATE.proceso = proc;
            actualizarVisibilidadColor();
            updateTimeline();
            calcularTotal();
        }

        function selectVita(color){document.querySelectorAll('.vita-option').forEach(o=>{o.classList.remove('selected');});event.currentTarget.classList.add('selected');STATE.colorVita=color;const wCD=document.getElementById('warning-color-cd');if(wCD){if(color.startsWith('C')||color.startsWith('D'))wCD.classList.remove('hidden');else wCD.classList.add('hidden');}calcularTotal();}

        function selectFerulaGuia(tipo) {
            const cards = document.querySelectorAll('[onclick^="selectFerulaGuia"]').forEach(el => {
                el.parentElement.parentElement.querySelectorAll('.process-card').forEach(card => {
                    card.classList.remove('selected');
                });
            });
            event.currentTarget.classList.add('selected');
            STATE.ferulaGuia = tipo;
            calcularTotal();
        }

        function toggleExtraInput(inputId) {
            const checkbox = event.target;
            const input = document.getElementById(inputId);
            
            if (checkbox.checked) {
                input.disabled = false;
                input.style.cursor = 'text';
                input.style.borderColor = 'var(--gold-primary)';
                input.value = 1;
                
                // Aplicar límite máximo basado en cantidad total
                const cantidadTotal = parseInt(document.getElementById('cantidad')?.value || 1);
                input.max = cantidadTotal;
            } else {
                input.disabled = true;
                input.style.cursor = 'not-allowed';
                input.style.borderColor = 'var(--border-subtle)';
                input.value = 1;
            }
            
            if(inputId==='cant-encia'){const wZ=document.getElementById('warning-encia-zirc');if(wZ)wZ.style.display=event.target.checked?'block':'none';}
            if(inputId==='cant-encia-pmma'){const wP=document.getElementById('warning-encia-pmma-inline');if(wP)wP.style.display=event.target.checked?'block':'none';}
            calcularTotal();
        }

        function clampProcessQty(input) {
            const max = parseInt(input.max, 10);
            let val = parseInt(input.value, 10) || 0;
            if (val > max) {
                showProdigyAlert('⚠️ Límite de Unidades', `Solo puedes aplicar este proceso a máximo <strong>${max} unidades</strong> — la cantidad original de tu caso. El valor ha sido ajustado automáticamente.`, 'Entendido');
                input.value = max;
            } else if (val < 0) {
                input.value = 0;
            }
            calcularTotal();
        }

        function limitarExtras() {
            const cantidadTotal = parseInt(document.getElementById('cantidad')?.value || 1);
            
            // Lista de inputs de extras (impresión)
            const extrasInputs = [];
            
            extrasInputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    // Actualizar el max
                    input.max = cantidadTotal;
                    
                    // Si el valor actual supera el nuevo máximo, ajustarlo
                    const valorActual = parseInt(input.value || 1);
                    if (valorActual > cantidadTotal) {
                        input.value = cantidadTotal;
                    }
                }
            });
        }

        // Lógica base para calcular entrega de 24h
        function calcularFecha24h(hC){let f=new Date();let h=f.getHours();let d=f.getDay();if(d===0||(d===6&&h>=12)){f.setDate(f.getDate()+(d===0?1:2));d=1;h=8;}f.setDate(f.getDate()+(h>=hC?2:1));if(f.getDay()===6)f.setDate(f.getDate()+2);if(f.getDay()===0)f.setDate(f.getDate()+1);return f;}

        // ==========================================
        // FESTIVOS COLOMBIA - ETERNOS (calculados dinámicamente)
        // ==========================================
        function obtenerFestivos(anio) {
            const set = new Set();
            function add(mes, dia) {
                set.add(new Date(anio, mes - 1, dia).toDateString());
            }
            function emiliani(mes, dia) {
                const d = new Date(anio, mes - 1, dia);
                const dow = d.getDay();
                if (dow !== 1) d.setDate(d.getDate() + (dow === 0 ? 1 : 8 - dow));
                set.add(d.toDateString());
            }
            // Fijos sin traslado
            add(1,1); add(5,1); add(7,20); add(8,7); add(12,8); add(12,25);
            // Ley Emiliani
            emiliani(1,6); emiliani(3,19); emiliani(6,29);
            emiliani(8,15); emiliani(10,12); emiliani(11,1); emiliani(11,11);
            // Pascua (Butcher)
            const a=anio%19,b=Math.floor(anio/100),c=anio%100,d2=Math.floor(b/4),e=b%4,
                  f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
                  h=(19*a+b-d2-g+15)%30,i=Math.floor(c/4),k=c%4,
                  l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
                  mp=Math.floor((h+l-7*m+114)/31),dp=((h+l-7*m+114)%31)+1;
            const pascua=new Date(anio,mp-1,dp);
            const jSanto=new Date(pascua); jSanto.setDate(pascua.getDate()-3);
            const vSanto=new Date(pascua); vSanto.setDate(pascua.getDate()-2);
            set.add(jSanto.toDateString());
            set.add(vSanto.toDateString());
            function emilianiDesde(base,dias) {
                const d=new Date(base); d.setDate(d.getDate()+dias);
                const dow=d.getDay();
                if(dow!==1) d.setDate(d.getDate()+(dow===0?1:8-dow));
                set.add(d.toDateString());
            }
            emilianiDesde(pascua,39); emilianiDesde(pascua,60); emilianiDesde(pascua,68);
            return set;
        }
        const _festCache={};
        function esFestivo(fecha) {
            const a=fecha.getFullYear();
            if(!_festCache[a]) _festCache[a]=obtenerFestivos(a);
            return _festCache[a].has(fecha.toDateString());
        }

        /**
         * Calcula fecha de entrega respetando horario del laboratorio
         * Horario: 8 AM - 6 PM (10 horas laborables)
         * Corte: 5 PM (pedidos después arrancan 8 AM día siguiente)
         * Días: Lunes a Sábado (domingo excluido)
         */
        function calcularFechaEntrega(horasRequeridas) {
            const HORA_INICIO = 8;
            const HORA_FIN = 18;
            const HORA_CORTE = 17;

            let fechaActual = new Date();
            let horaActual = fechaActual.getHours();
            let minutoActual = fechaActual.getMinutes();

            // Si es después de las 5 PM, arrancar mañana a las 8 AM
            if (horaActual >= HORA_CORTE) {
                fechaActual.setDate(fechaActual.getDate() + 1);
                fechaActual.setHours(HORA_INICIO, 0, 0, 0);
            }
            // Si es antes de las 8 AM, arrancar hoy a las 8 AM
            else if (horaActual < HORA_INICIO) {
                fechaActual.setHours(HORA_INICIO, 0, 0, 0);
            }
            // Si es después de las 6 PM pero antes de medianoche, arrancar mañana
            else if (horaActual >= HORA_FIN) {
                fechaActual.setDate(fechaActual.getDate() + 1);
                fechaActual.setHours(HORA_INICIO, 0, 0, 0);
            }
            // Si está en horario hábil (8 AM - 5 PM), continuar desde hora actual

            // Saltar domingos y festivos
            while (fechaActual.getDay() === 0 || esFestivo(fechaActual)) {
                fechaActual.setDate(fechaActual.getDate() + 1);
                fechaActual.setHours(HORA_INICIO, 0, 0, 0);
            }

            let horasRestantes = horasRequeridas;

            while (horasRestantes > 0) {
                let horaDecimal = fechaActual.getHours() + (fechaActual.getMinutes() / 60);
                let horasDisponiblesHoy = HORA_FIN - horaDecimal;

                if (horasRestantes <= horasDisponiblesHoy) {
                    fechaActual.setMinutes(fechaActual.getMinutes() + (horasRestantes * 60));
                    horasRestantes = 0;
                } else {
                    horasRestantes -= horasDisponiblesHoy;
                    fechaActual.setDate(fechaActual.getDate() + 1);
                    fechaActual.setHours(HORA_INICIO, 0, 0, 0);
                    while (fechaActual.getDay() === 0 || esFestivo(fechaActual)) {
                        fechaActual.setDate(fechaActual.getDate() + 1);
                    }
                }
            }

            // Sábado después de 1 PM → lunes 9 AM (saltar si festivo)
            if (fechaActual.getDay() === 6 && fechaActual.getHours() >= 13) {
                fechaActual.setDate(fechaActual.getDate() + 2);
                fechaActual.setHours(9, 0, 0, 0);
                while (esFestivo(fechaActual)) fechaActual.setDate(fechaActual.getDate() + 1);
            }
            return fechaActual;
        }

        // ==========================================
        // SISTEMA DE TURNOS V4.0 - MAPA DE CHECKPOINTS
        // ==========================================

        function obtenerNivelMaterial() {
            const tipo = STATE.materialTipo;
            if (!tipo) return 1;
            if (tipo === 'resina_definitiva') return 3;
            if (tipo === 'resina_temporal') return 2;
            return 1; // modelo, calcinable, ferulas, biomodelos, zirc, pmma, disi, etc.
        }

        /**
         * Devuelve { fechaIngreso, fechaEntrega } según la Matriz de Turnos
         * Nivel 1: Modelos, Calcinables, Férulas, Biomodelos, Zirc, PMMA
         * Nivel 2: Resinas Temporales
         * Nivel 3: Resinas Definitivas (Rodin, BEGO, Saremco)
         * REGLA TIEMPO REAL: si la hora actual >= horaBoton, se empuja 1 día
         * REGLA FIN DE SEMANA: salta domingos automáticamente
         */
        function calcularFechasTurno(nivel, horaBoton) {
            const ahora = new Date();
            const horaActual = ahora.getHours() + (ahora.getMinutes() / 60);
            const yaPassoElCorte = horaActual >= horaBoton;
            const off = yaPassoElCorte ? 1 : 0;

            function construirFecha(diasOffset, hora, minutos) {
                const f = new Date(ahora);
                f.setDate(f.getDate() + diasOffset);
                f.setHours(hora, minutos || 0, 0, 0);
                while (f.getDay() === 0 || esFestivo(f)) f.setDate(f.getDate() + 1);
                // Sábado después de 1 PM → lunes 9 AM (saltar si festivo)
                if (f.getDay() === 6 && f.getHours() >= 13) {
                    f.setDate(f.getDate() + 2);
                    f.setHours(9, 0, 0, 0);
                    while (esFestivo(f)) f.setDate(f.getDate() + 1);
                }
                return f;
            }

            const MATRIZ = {
                1: { // Modelos, Calcinables, Férulas, Biomodelos, Zirc, PMMA
                    9:  { iH: 9,  eOff: 0, eH: 13 },
                    12: { iH: 12, eOff: 0, eH: 17 },
                    17: { iH: 17, eOff: 1, eH: 12 }
                },
                2: { // Resinas Temporales
                    9:  { iH: 9,  eOff: 0, eH: 14 },
                    12: { iH: 12, eOff: 1, eH: 17 },
                    17: { iH: 17, eOff: 1, eH: 12 }
                },
                3: { // Resinas Definitivas — 9am→2pm mañana | 12pm→6pm mañana | 5pm→12pm pasado mañana
                    9:  { iH: 9,  eOff: 1, eH: 14 },
                    12: { iH: 12, eOff: 1, eH: 18 },
                    17: { iH: 17, eOff: 2, eH: 12 }
                }
            };

            const c = MATRIZ[nivel][horaBoton];
            return {
                fechaIngreso: construirFecha(off, c.iH, 0),
                fechaEntrega: construirFecha(off + c.eOff, c.eH, 0)
            };
        }

        function formatearFechaTurno(fecha) {
            const dias  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
            const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            const h = fecha.getHours();
            const m = fecha.getMinutes().toString().padStart(2, '0');
            const ampm = h < 12 ? 'AM' : 'PM';
            const hDisplay = h > 12 ? h - 12 : (h === 0 ? 12 : h);
            return `${dias[fecha.getDay()]} ${fecha.getDate()} ${meses[fecha.getMonth()]} ${hDisplay}:${m} ${ampm}`;
        }

        function updateTimeline() {
            // Sin material → mostrar fechas con nivel 1 por defecto
            if (!STATE.materialTipo || STATE.materialTipo.startsWith('resina_')) {
                return calcularEntregaProdigy();
            }

            const ahora = new Date();
            const horaActual = ahora.getHours();
            const minutoActual = ahora.getMinutes();
            const horaDecimal = horaActual + (minutoActual / 60);

            const expressSlot = document.querySelector('[data-slot="express"]');
            const mediodiaSlot = document.querySelector('[data-slot="mediodia"]');
            const tardeSlot = document.querySelector('[data-slot="tarde"]');

            const alertExpress = document.getElementById('alert-express');
            const cantidad = parseInt(document.getElementById('cantidad')?.value || 1);

            // Express disponible solo para Zirc y PMMA, sin extras, antes de 9 AM, y máximo 3 unidades
            if (['zirc', 'pmma'].includes(STATE.materialTipo) && !STATE.tieneExtras) {
                alertExpress.classList.remove('hidden');

                if (horaDecimal < CONFIG.horarios_corte.express) {
                    const hoy = new Date(ahora);
                    if (cantidad <= 3) {
                        document.getElementById('date-express').innerHTML=`Entrega HOY<br>${formatearFecha(hoy)}<br><span style="color:var(--gold-primary);font-size:0.7rem;">5:00 PM · Express</span>`;
                        expressSlot.classList.remove('disabled');
                    } else {
                        document.getElementById('date-express').innerHTML = `Máximo 3 unidades<br>Fair Play Express`;
                        expressSlot.classList.add('disabled');
                    }
                } else {
                    document.getElementById('date-express').innerHTML = `Cerrado<br>Abre 00:00`;
                    expressSlot.classList.add('disabled');
                }
            } else {
                alertExpress.classList.add('hidden');
                expressSlot.classList.add('disabled');
                document.getElementById('date-express').innerHTML = `No disponible<br>para este material`;
            }

            let fechaMediadia = calcularFecha24h(CONFIG.horarios_corte.mediodia);
            document.getElementById('date-mediodia').innerHTML = `Entrega<br>${formatearFecha(fechaMediadia)}<br>12:00 PM`;

            let fechaTarde = calcularFecha24h(CONFIG.horarios_corte.tarde);
            document.getElementById('date-tarde').innerHTML = `Entrega<br>${formatearFecha(fechaTarde)}<br>5:00 PM`;
            
            // Validar coherencia de estado
            clearTimeSlotIfInvalid();
            setSelectedSlotUI(STATE.timeSlot);
        }

        // ==========================================
        // FUNCIONES AUXILIARES - HORAS HÁBILES Y TIEMPOS DINÁMICOS
        // ==========================================
        
        function obtenerHorasProceso(submaterialId) {
            if (!submaterialId) return 4;
            
            // LÓGICA ALL-ON-X: 10+ unidades = 8 horas (volumen alto)
            const cantidad = parseInt(document.getElementById('cantidad')?.value, 10) || 1;
            if (cantidad >= 10) return 8;
            
            // Modelos requieren más capas (6 horas)
            if (submaterialId.includes('modelo')) return 6;
            
            // Coronas, carillas, férulas, temporales, calcinables (4 horas)
            return 4;
        }

        function sumarHorasHabiles(fechaInicio, horasASumar) {
            let fecha = new Date(fechaInicio);
            let horasRestantes = horasASumar;

            while (horasRestantes > 0) {
                fecha.setHours(fecha.getHours() + 1);
                let dia = fecha.getDay();
                let hora = fecha.getHours();
                let min = fecha.getMinutes();

                // Domingo (0) y festivos no se trabajan
                if (dia === 0 || esFestivo(fecha)) continue;

                // Lunes a Viernes: 8 AM a 6 PM (18:00)
                let esDiaHabilNormal = (dia >= 1 && dia <= 5) && (hora >= 8 && hora < 18);
                
                // Sábado: 8 AM a 12:30 PM
                let esSabadoHabil = (dia === 6) && (hora >= 8 && (hora < 12 || (hora === 12 && min <= 30)));

                if (esDiaHabilNormal || esSabadoHabil) {
                    horasRestantes--;
                } else {
                    // Si llega al final del día hábil, salta al día siguiente a las 8:00 AM
                    if (dia >= 1 && dia <= 5 && hora >= 18) {
                        fecha.setDate(fecha.getDate() + 1);
                        fecha.setHours(8, 0, 0, 0);
                    } else if (dia === 6 && (hora > 12 || (hora === 12 && min > 30))) {
                        // Si pasa del sábado a medio día, salta al Lunes
                        fecha.setDate(fecha.getDate() + 2);
                        fecha.setHours(8, 0, 0, 0);
                    }
                }
            }
            return fecha;
        }

        // ==========================================
        // SISTEMA DE TIEMPOS 3D V4.0 - MAPA DE CHECKPOINTS
        // ==========================================
        function calcularEntregaProdigy() {
            try {
                const nivel = obtenerNivelMaterial();

                const slotsConfig = [
                    { selector: '[data-slot="express"]',  idTexto: 'date-express',  corte: 9  },
                    { selector: '[data-slot="mediodia"]', idTexto: 'date-mediodia', corte: 12 },
                    { selector: '[data-slot="tarde"]',    idTexto: 'date-tarde',    corte: 17 }
                ];

                slotsConfig.forEach(config => {
                    const slotEl = document.querySelector(config.selector);
                    const p = document.getElementById(config.idTexto);
                    if (!slotEl || !p) return;

                    slotEl.classList.remove('disabled');

                    const { fechaIngreso, fechaEntrega } = calcularFechasTurno(nivel, config.corte);

                    const txtIngreso  = formatearFechaTurno(fechaIngreso);
                    const txtEntrega  = formatearFechaTurno(fechaEntrega);

                    // Determinar si ingreso es HOY para feedback visual
                    const esHoy = fechaIngreso.toDateString() === new Date().toDateString();

                    // Escape defensivo: txtIngreso/txtEntrega son fechas internas,
                    // pero usamos textContent en nodos para eliminar cualquier riesgo XSS.
                    const spanIng = document.createElement('span');
                    spanIng.style.cssText = 'font-size:0.72rem;color:var(--accent-cyan);';
                    spanIng.textContent   = '📥 Ingreso: ';
                    const strongIng = document.createElement('strong');
                    strongIng.textContent = txtIngreso;
                    spanIng.appendChild(strongIng);

                    const spanEnt = document.createElement('span');
                    spanEnt.style.cssText = 'font-size:0.72rem;color:var(--gold-primary);';
                    spanEnt.textContent   = '📦 Entrega: ';
                    const strongEnt = document.createElement('strong');
                    strongEnt.textContent = txtEntrega;
                    spanEnt.appendChild(strongEnt);

                    p.innerHTML = '';
                    p.appendChild(spanIng);
                    p.appendChild(document.createElement('br'));
                    p.appendChild(spanEnt);

                    if (esHoy) {
                        slotEl.style.opacity = "1";
                        slotEl.style.borderColor = "rgba(0, 210, 255, 0.3)";
                    } else {
                        slotEl.style.opacity = "0.75";
                        slotEl.style.borderColor = "rgba(251, 146, 60, 0.3)";
                    }
                    slotEl.style.boxShadow = "none";
                });

                // Actualizar línea de entrega en el resumen lateral
                actualizarResumenFechas();

                // Mantener selección
                setSelectedSlotUI(STATE.timeSlot);

            } catch (e) {
                console.error("Error en Tiempos 3D:", e);
            }
        }

        function actualizarResumenFechas() {
            if (!STATE.timeSlot) return;
            const corteMap = { express: 9, mediodia: 12, tarde: 17 };
            const corte = corteMap[STATE.timeSlot];
            if (!corte) return;
            const nivel = obtenerNivelMaterial();
            const { fechaIngreso, fechaEntrega } = calcularFechasTurno(nivel, corte);
            const lineaIngreso = document.getElementById('line-ingreso');
            const lineaEntrega = document.getElementById('line-entrega-fecha');
            if (lineaIngreso) {
                document.getElementById('calc-ingreso').textContent = formatearFechaTurno(fechaIngreso);
                lineaIngreso.classList.remove('hidden');
            }
            if (lineaEntrega) {
                document.getElementById('calc-entrega-fecha').textContent = formatearFechaTurno(fechaEntrega);
                lineaEntrega.classList.remove('hidden');
            }
        }

        function ajustarFinDeSemana(fecha) {
            const dia = fecha.getDay();
            
            if (dia === 6) fecha.setDate(fecha.getDate() + 2); // Sábado -> Lunes
            if (dia === 0) fecha.setDate(fecha.getDate() + 1); // Domingo -> Lunes

            return fecha;
        }

        function formatearFecha(fecha) {
            const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            return `${dias[fecha.getDay()]} ${fecha.getDate()} ${meses[fecha.getMonth()]}`;
        }

        function selectTimeSlot(slot) {
            if (event.currentTarget.classList.contains('disabled')) return;

            document.querySelectorAll('.timeline-slot').forEach(s => {
                s.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');
            STATE.timeSlot = slot;
            calcularTotal();
            actualizarResumenFechas();
        }

        function setSelectedSlotUI(slot) {
            document.querySelectorAll('.timeline-slot').forEach(s => s.classList.remove('selected'));
            if (!slot) return;
            const el = document.querySelector(`.timeline-slot[data-slot="${slot}"]`);
            if (el && !el.classList.contains('disabled')) el.classList.add('selected');
        }

        function clearTimeSlotIfInvalid() {
            if (!STATE.timeSlot) return;
            const el = document.querySelector(`.timeline-slot[data-slot="${STATE.timeSlot}"]`);
            if (!el || el.classList.contains('disabled')) {
                STATE.timeSlot = null;
                STATE.timeSlotName = null;
                setSelectedSlotUI(null);
            }
        }

        function actualizarVisibilidadColor() {
            const colorVita = document.getElementById('color-vita');
            if (!colorVita) return;
            const requiereColor =
                STATE.materialTipo === 'resina_temporal' ||
                STATE.materialTipo === 'resina_definitiva';
            if (requiereColor) {
                colorVita.style.display = 'block';
                colorVita.classList.remove('hidden');
            } else {
                colorVita.style.display = 'none';
                colorVita.classList.add('hidden');
                STATE.colorVita = null;
            }
        }

        // VARIABLES GLOBALES V2.4
        let modeloV4 = {
            base: 'solido_full',
            baseValor: 35000,
            proposito: 'estudio',
            propositoValor: 0,
            resolucion: 50,
            resolucionValor: 0,
            color: 'gris',
            extras: {
                zocalo_articulador: false,
                encia: false
            },
            troqueles: 0
        };

        let temporalOptiglaze = false; // Variable global para Optiglaze en temporales
        let temporalTipoColor = 'none'; // Tipo de selector de color

        function toggleOptiglazeTemporal() {
            temporalOptiglaze = document.getElementById('check-optiglaze-temp')?.checked || false;
            calcularTotal();
        }

        function toggleOptcardTemporal(el) {
            temporalOptiglaze = !temporalOptiglaze;
            if (temporalOptiglaze) {
                el.style.borderColor = 'var(--accent-cyan)';
                el.style.background = 'rgba(0,210,255,0.1)';
                el.style.boxShadow = '0 0 0 2px var(--accent-cyan)';
            } else {
                el.style.borderColor = '#444';
                el.style.background = 'rgba(0,0,0,0.3)';
                el.style.boxShadow = 'none';
            }
            calcularTotal();
        }

        function toggleExpress(checked) {
            STATE.express = checked;
            updateTimeline(); // Actualizar fechas de entrega
            calcularTotal(); // Recalcular con cargo Express
        }

        // FUNCIÓN PARA TEMPORALES V3.1 - Con colores dinámicos
        function selectTemporal(id, precio, nombre, tipoColor) {
            // Mapeo de IDs a data-tipo
            const idMap = {
                'r_temp_standard': 'temp-standard',
                'r_temp_largo': 'temp-largo',
                'r_proto_eco': 'temp-tryin',
                'r_barra_test': 'temp-barra',
                'r_rodete': 'temp-rodete'
            };
            
            // Actualizar UI
            document.querySelectorAll('[data-tipo^="temp-"]').forEach(card => {
                card.style.border = '2px solid #444';
                if (!card.getAttribute('data-tipo').includes('rodete')) {
                    card.style.background = 'rgba(0,0,0,0.3)';
                }
            });
            
            const dataId = idMap[id];
            const selected = document.querySelector(`[data-tipo="${dataId}"]`);
            if (selected) {
                selected.style.border = '2px solid var(--gold-primary)';
                if (!id.includes('rodete')) {
                    selected.style.background = 'rgba(255,215,0,0.05)';
                }
            }
            
            // Guardar en STATE
            STATE.submaterialId = id;
            STATE.submaterialNombre = nombre;
            STATE.submaterialPrecio = precio;
            temporalTipoColor = tipoColor;
            
            // Generar selector de color dinámico
            generarSelectorColor(tipoColor);
            
            calcularTotal();
        }

        function generarSelectorColor(tipo) {
            const container = document.getElementById('color-selector-container');
            if (!container) return;
            
            if (tipo === 'none') {
                container.style.display = 'none';
                return;
            }
            
            container.style.display = 'block';
            
            let html = '<div class="config-group" style="margin-top: 15px;">';
            
            if (tipo === 'vita') {
                // COLORES VITA PARA TEMPORALES
                html += `
                    <span style="font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Color VITA Classical</span>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px;">
                        <div onclick="selectColorVitaTemporal('A1')" data-tipo="vita-a1" style="padding: 12px; background: linear-gradient(135deg, #f0e8dd 0%, #e8dcc8 100%); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; color: #3a2a1a;">
                            <div style="font-weight: 700; font-size: 0.95rem;">A1</div>
                        </div>
                        <div onclick="selectColorVitaTemporal('A2')" data-tipo="vita-a2" style="padding: 12px; background: linear-gradient(135deg, #ead4b8 0%, #ddc5a5 100%); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; color: #3a2a1a;">
                            <div style="font-weight: 700; font-size: 0.95rem;">A2</div>
                        </div>
                        <div onclick="selectColorVitaTemporal('A3')" data-tipo="vita-a3" style="padding: 12px; background: linear-gradient(135deg, #d4b595 0%, #c8a885 100%); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; color: #2a1a10;">
                            <div style="font-weight: 700; font-size: 0.95rem;">A3</div>
                        </div>
                        <div onclick="selectColorVitaTemporal('B1')" data-tipo="vita-b1" style="padding: 12px; background: linear-gradient(135deg, #f5f0e8 0%, #ede5d8 100%); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; color: #3a2a1a;">
                            <div style="font-weight: 700; font-size: 0.95rem;">B1</div>
                        </div>
                        <div onclick="selectColorVitaTemporal('B2')" data-tipo="vita-b2" style="padding: 12px; background: linear-gradient(135deg, #ede0c8 0%, #ddd0b8 100%); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; color: #3a2a1a;">
                            <div style="font-weight: 700; font-size: 0.95rem;">B2</div>
                        </div>
                        <div onclick="selectColorVitaTemporal('BL')" data-tipo="vita-bl" style="padding: 12px; background: linear-gradient(135deg, #fafaf8 0%, #f2f2f0 100%); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; color: #3a2a1a;">
                            <div style="font-weight: 700; font-size: 0.95rem;">BL</div>
                        </div>
                    </div>
                    
                    <!-- TARJETA GLASEADO TEMPORALES -->
                    <div style="margin-top: 15px;">
                        <label style="font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 10px;">Servicio de Terminado</label>
                        <div id="optiglaze-card" onclick="toggleOptcardTemporal(this)"
                             style="padding: 14px; background: rgba(0,0,0,0.3); border: 2px solid #444; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s ease;">
                            <div style="font-weight:700;">Maquillaje Pro con Optiglaze</div>
                            <div style="font-size:0.75rem;color:#888;margin-top:4px;">+$20.000 / unidad</div>
                        </div>
                        <div style="margin-top: 10px; padding: 12px 15px; background: rgba(0,210,255,0.05); border-left: 4px solid var(--accent-cyan); border-radius: 8px;">
                            <div style="color: var(--accent-cyan); font-weight: 700; font-size: 0.8rem; margin-bottom: 6px;">✨ SERVICIO DE GLASEADO</div>
                            <p style="font-size: 0.72rem; line-height: 1.5; color: var(--text-secondary); margin: 0;">El Optiglaze es un sellador fotopolimerizable que mejora el brillo, la resistencia al desgaste y la biocompatibilidad. El precio se cobra por unidad fabricada. No garantiza correspondencia exacta con guías físicas de color.</p>
                        </div>
                    </div>
                    
                    <!-- DISCLAIMER CARACTERIZACIÓN -->
                    <div style="margin-top: 15px; padding: 15px; background: rgba(139,115,85,0.08); border-left: 4px solid var(--gold-primary); border-radius: 8px;">
                        <div style="color: var(--gold-primary); font-weight: 700; font-size: 0.85rem; margin-bottom: 8px;">
                            🎨 SERVICIO DE CARACTERIZACIÓN (TINTE)
                        </div>
                        <p style="font-size: 0.75rem; line-height: 1.5; color: var(--text-secondary); margin: 0;">
                            Si el color deseado no se encuentra en las opciones base, PRODIGY ofrece el servicio de caracterización mediante tintes y maquillaje. Debido a factores químicos y de post-procesado, no se garantiza una exactitud del 100% respecto a la guía física, aunque el proceso se realiza bajo estándares de excelencia para buscar el mejor resultado estético posible.
                        </p>
                    </div>
                `;
            } else if (tipo === 'rodete') {
                // RODETES: No mostrar selector adicional (color ya está en la tarjeta)
                container.style.display = 'none';
                return;
            }
            
            html += '</div>';
            container.innerHTML = html;
        }

        function selectColorVitaTemporal(color) {
            // Actualizar UI
            document.querySelectorAll('[data-tipo^="vita-"]').forEach(card => {
                card.style.border = '2px solid #444';
            });
            const colorKey = 'vita-' + color.toLowerCase().replace('.', '');
            const selected = document.querySelector(`[data-tipo="${colorKey}"]`);
            if (selected) {
                selected.style.border = '2px solid var(--gold-primary)';
            }
            
            // Guardar en STATE
            STATE.colorVita = color;
            
            calcularTotal();
        }

        function selectBase(tipo, valor) {
            modeloV4.base = tipo;
            modeloV4.baseValor = valor;
            
            // Actualizar UI
            document.querySelectorAll('[data-tipo^="base-"]').forEach(card => {
                card.style.border = '2px solid #444';
                card.style.background = 'rgba(0,0,0,0.3)';
            });
            const selected = document.querySelector(`[data-tipo="base-${tipo.replace('_', '-')}"]`);
            if (selected) {
                selected.style.border = '2px solid var(--gold-primary)';
                selected.style.background = 'rgba(255,215,0,0.05)';
            }
            
            calcularTotalModelosV4();
        }

        function selectProposito(tipo, valor) {
            modeloV4.proposito = tipo;
            modeloV4.propositoValor = valor;
            
            // Actualizar UI
            document.querySelectorAll('[data-tipo^="prop-"]').forEach(card => {
                card.style.border = '2px solid #444';
                card.style.background = 'rgba(0,0,0,0.3)';
            });
            const selected = document.querySelector(`[data-tipo="prop-${tipo}"]`);
            if (selected) {
                selected.style.border = '2px solid var(--gold-primary)';
                selected.style.background = 'rgba(255,215,0,0.05)';
            }
            
            // Alineadores fuerza sólido + gris
            if (tipo === 'alineador') {
                if (!modeloV4.base.includes('solido')) {
                    selectBase('solido_full', 35000);
                }
                selectColor('gris');
                const btnDurazno = document.getElementById('btn-durazno');
                if (btnDurazno) {
                    btnDurazno.style.opacity = '0.4';
                    btnDurazno.style.pointerEvents = 'none';
                }
            } else {
                const btnDurazno = document.getElementById('btn-durazno');
                if (btnDurazno) {
                    btnDurazno.style.opacity = '1';
                    btnDurazno.style.pointerEvents = 'auto';
                }
            }
            
            calcularTotalModelosV4();
        }

        function selectResolucion(micras, valor) {
            modeloV4.resolucion = micras;
            modeloV4.resolucionValor = valor;
            
            // Actualizar UI
            document.querySelectorAll('[data-tipo^="res-"]').forEach(card => {
                card.style.border = '2px solid #444';
                card.style.background = 'rgba(0,0,0,0.3)';
            });
            const selected = document.querySelector(`[data-tipo="res-${micras}"]`);
            if (selected) {
                selected.style.border = '2px solid var(--gold-primary)';
                selected.style.background = 'rgba(255,215,0,0.05)';
            }
            
            calcularTotalModelosV4();
        }

        function selectColor(color) {
            modeloV4.color = color;
            
            // Actualizar UI
            const btnGris = document.getElementById('btn-gris');
            const btnDurazno = document.getElementById('btn-durazno');
            
            if (color === 'gris') {
                if (btnGris) btnGris.style.border = '2px solid var(--gold-primary)';
                if (btnDurazno) btnDurazno.style.border = '2px solid #444';
            } else {
                if (btnGris) btnGris.style.border = '2px solid #444';
                if (btnDurazno) btnDurazno.style.border = '2px solid var(--gold-primary)';
            }
            
            calcularTotalModelosV4();
        }

        function toggleExtraV4(tipo, valor) {
            modeloV4.extras[tipo] = !modeloV4.extras[tipo];
            calcularTotalModelosV4();
        }

        function calcularTotalModelosV4() {
            let total = modeloV4.baseValor + modeloV4.propositoValor + modeloV4.resolucionValor;
            
            // Extras
            if (modeloV4.extras.zocalo_articulador) total += 5000;
            if (modeloV4.extras.encia) total += 15000;
            
            // Troqueles
            const troquelesInput = document.getElementById('num-troqueles');
            if (troquelesInput) {
                const troqueles = parseInt(troquelesInput.value) || 0;
                modeloV4.troqueles = troqueles;
                total += troqueles * 2500;
                
                // Advertencia troqueles sin Geller
                const warning = document.getElementById('warning-troqueles-v4');
                if (warning) {
                    if (troqueles > 0 && modeloV4.proposito !== 'geller') {
                        warning.style.display = 'block';
                    } else {
                        warning.style.display = 'none';
                    }
                }
            }
            
            // Guardar en STATE
            STATE.submaterialPrecio = total;
            STATE.submaterialNombre = `Modelo ${modeloV4.base} - ${modeloV4.proposito} (${modeloV4.resolucion}μ)`;
            STATE.submaterialId = 'modelo_custom_v4';
            
            calcularTotal();
        }

        function calcularTotal() {
            if (!STATE.submaterialId) return;

            const cantidad = Math.max(1, parseInt(document.getElementById('cantidad').value, 10) || 1);
            
            const clampExtra = (n) => Math.min(cantidad, Math.max(0, parseInt(n, 10) || 0));

            let subtotal = 0;
            let adicionales = 0;
            let express = 0;
            let envio = 0;

            // Proceso normal con material (IMPRESIÓN 3D)
            subtotal = STATE.submaterialPrecio * cantidad;

            // RECARGO POR ALTA PRECISIÓN: 25 micras
            if (STATE.proceso === '25_micras') {
                adicionales += CONFIG.precios_extras.resolucion_25_micras * cantidad;
            }

            // COSTO CALIBRACIÓN: Resina enviada $50,000 PAGO ÚNICO + 24h
            if(STATE.materialExterno){
                adicionales += 50000; // Pago único por orden, NO se multiplica
            }

            // OPTIGLAZE en temporales (+$20,000 por unidad)
            if(temporalOptiglaze && STATE.materialTipo === 'resina_temporal') {
                adicionales += 20000 * cantidad;
            }

            // SLOT EXPRESS: recargo por unidad
            if (STATE.timeSlot === 'express') {
                express = CONFIG.precios_extras.express * cantidad;
            }

            const envioSelect = document.getElementById('envio');
            if (envioSelect.value === 'nacional') {
                envio = CONFIG.precios_extras.envio_nacional;
            }

            const terminado    = STATE.precioTerminado || 0;
            const valorSeguro  = document.getElementById('seguro-garantia')?.checked ? 5000 : 0;
            const valorEnvioGPS = Number(document.getElementById('recargo-distancia')?.value) || 0;
            const total = subtotal + adicionales + express + envio + terminado + valorSeguro + valorEnvioGPS;

            // Protección NaN - Si alguna variable es undefined/null
            if (isNaN(total) || total < 0) {
                console.warn('Error en cálculo: ', {subtotal, adicionales, express, envio});
                return; // No actualizar UI si hay error
            }

            document.getElementById('calc-material').textContent = STATE.submaterialNombre || '-';
            document.getElementById('calc-proceso').textContent = STATE.proceso || '-';
            
            // Mostrar/Ocultar Color VITA según material
            const lineColor = document.getElementById('line-color');
            if (STATE.materialTipo === 'metal' || STATE.materialTipo === 'cera' || STATE.materialTipo === 'otro') {
                if(lineColor) lineColor.style.display = 'none';
                document.getElementById('calc-color').textContent = '-';
            } else {
                if(lineColor) lineColor.style.display = 'flex';
                document.getElementById('calc-color').textContent = STATE.colorVita || '-';
            }
            
            document.getElementById('calc-cantidad').textContent = cantidad;
            document.getElementById('calc-subtotal').textContent = formatCurrency(subtotal);

            if (express > 0) {
                document.getElementById('line-express').classList.remove('hidden');
                document.getElementById('calc-express').textContent = formatCurrency(express);
            } else {
                document.getElementById('line-express').classList.add('hidden');
            }

            if (adicionales > 0) {
                document.getElementById('line-adicionales').classList.remove('hidden');
                document.getElementById('calc-adicionales').textContent = formatCurrency(adicionales);
            } else {
                document.getElementById('line-adicionales').classList.add('hidden');
            }

            if (envio > 0) {
                document.getElementById('line-envio').classList.remove('hidden');
                document.getElementById('calc-envio').textContent = formatCurrency(envio);
            } else {
                document.getElementById('line-envio').classList.add('hidden');
            }

            // Wompi +3% si no es transferencia
            const chkTrans = document.getElementById('chk-transferencia');
            const wompiAmt = (chkTrans && !chkTrans.checked) ? Math.round(total * 0.03) : 0;
            const totalFinal = total + wompiAmt;

            const lineWompi = document.getElementById('line-wompi');
            const calcWompi = document.getElementById('calc-wompi');
            if (lineWompi && calcWompi) {
                if (wompiAmt > 0) {
                    lineWompi.classList.remove('hidden');
                    calcWompi.textContent = formatCurrency(wompiAmt);
                } else {
                    lineWompi.classList.add('hidden');
                }
            }

            const totalElement = document.getElementById('calc-total');
            totalElement.textContent = formatCurrency(totalFinal);
            
            // Mostrar mensaje de calibración cuando hay material seleccionado
            const calibrationNotice = document.getElementById('calibration-notice');
            if (calibrationNotice && STATE.submaterialId) {
                calibrationNotice.classList.remove('hidden');
            } else if (calibrationNotice) {
                calibrationNotice.classList.add('hidden');
            }
            
            // Animación premium al recalcular
            totalElement.classList.remove('pulse');
            setTimeout(() => totalElement.classList.add('pulse'), 10);
            setTimeout(() => totalElement.classList.remove('pulse'), 610);

            return total;
        }

        function formatCurrency(amount) {
            return '$' + Math.round(amount).toLocaleString('es-CO') + ' COP';
        }

        async function handleFileUpload(input, fromDrop) {
            // Si viene de drag & drop, sincronizar el input real
            if (fromDrop && input.files) {
                const dt = new DataTransfer();
                if (input.files[0]) dt.items.add(input.files[0]);
                document.getElementById('comprobante').files = dt.files;
            }
            const file = (fromDrop ? input.files[0] : document.getElementById('comprobante').files[0]);
            if (!file) return;

            if (window.validateUpload) {
                const ext = validateUpload(file, 'COMPROBANTE');
                if (!ext.valid) { showUploadError(ext.error); return; }
                const mb = await validateMagicBytes(file);
                if (!mb.safe) { showUploadError(mb.error); return; }
            }

            const placeholder = document.getElementById('comprobante-placeholder');
            const preview    = document.getElementById('comprobante-preview');
            const previewImg = document.getElementById('preview-img');
            const fileNameEl = document.getElementById('file-name');

            fileNameEl.textContent = '✅ ' + file.name;

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = e => {
                    previewImg.src = e.target.result;
                    placeholder.style.display = 'none';
                    preview.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            } else {
                // PDF u otro
                previewImg.src = '';
                previewImg.style.display = 'none';
                placeholder.style.display = 'none';
                preview.style.display = 'flex';
            }
            validateChecks();
        }

        function validateChecks() {
            const check1 = document.getElementById('check1').checked;
            const check2 = document.getElementById('check2').checked;
            const check3 = document.getElementById('check3').checked;
            const comprobante = document.getElementById('comprobante').files.length > 0;

            const btnSubmit = document.getElementById('btn-submit');
            if (check1 && check2 && check3 && comprobante) {
                btnSubmit.disabled = false;
            } else {
                btnSubmit.disabled = true;
            }
        }

        function showPaymentModal(tipo) {
            const totalNum = parseInt((document.getElementById('calc-total')?.textContent || '0').replace(/\D/g,'')) || 0;
            if (totalNum <= 0) {
                showProdigyAlert('✨ ¡Casi Listo!', 'Para continuar con tu pedido PRODIGY, primero selecciona el <strong>material</strong> (ej. Zirconio o Resina 3D) y especifica la cantidad. ¡Solo te tomará unos segundos!', 'Ir a Selección');
                return;
            }
            const modal = document.getElementById('modal-payment');
            const title = document.getElementById('modal-payment-title');
            const body = document.getElementById('modal-payment-body');

            let content = '';
            if (tipo === 'nequi') {
                title.textContent = '💙 PAGAR CON NEQUI';
                content = `
                    <div class="pay-total-pill">💰 TOTAL: ${document.getElementById('calc-total').textContent}</div>
                    <div class="pay-box" style="--pay-accent:#9B5DE5;">
                        <span class="pay-method-tag">Nequi · Escanea el QR</span>
                        <div class="pay-qr"><img src="data:image/jpeg;base64,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" alt="QR Nequi" style="width: 200px; height: 200px; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;"></div>
                        <h3>Jessica Mendez</h3>
                        <div class="pay-num">322 877 4481</div>
                        <button class="pay-copy" onclick="navigator.clipboard.writeText('3228774481');this.textContent='✅ Copiado';setTimeout(()=>this.textContent='📋 Copiar número',1500);">📋 Copiar número</button>
                        <p class="pay-info">📸 Sube el comprobante en el portal para confirmar tu pedido.</p>
                    </div>
                `;
            } else if (tipo === 'daviplata') {
                title.textContent = '💗 PAGAR CON DAVIPLATA';
                content = `
                    <div class="pay-total-pill">💰 TOTAL: ${document.getElementById('calc-total').textContent}</div>
                    <div class="pay-box" style="--pay-accent:#E91E8C;">
                        <span class="pay-method-tag">Daviplata · Billetera Digital</span>
                        <i class="fas fa-mobile-alt" style="font-size:2.5rem;color:#E91E8C;margin-bottom:14px;display:block;filter:drop-shadow(0 0 12px #E91E8C80);"></i>
                        <h3>Jessica Mendez</h3>
                        <div class="pay-num">322 877 4481</div>
                        <button class="pay-copy" onclick="navigator.clipboard.writeText('3228774481');this.textContent='✅ Copiado';setTimeout(()=>this.textContent='📋 Copiar número',1500);">📋 Copiar número</button>
                        <p class="pay-info">* Use el número directamente en su app Daviplata.</p>
                    </div>
                `;
            } else if (tipo === 'banco') {
                title.textContent = '🏦 TRANSFERENCIA BANCARIA';
                content = `
                    <div class="pay-total-pill">💰 TOTAL: ${document.getElementById('calc-total').textContent}</div>
                    <div class="pay-box" style="--pay-accent:#8A05BE;">
                        <span class="pay-method-tag">Nu Bank · Cuenta de Ahorros</span>
                        <h3>Jessica Mendez Carmelo</h3>
                        <div class="pay-num">@LXY423</div>
                        <button class="pay-copy" onclick="navigator.clipboard.writeText('LXY423');this.textContent='✅ Copiado';setTimeout(()=>this.textContent='📋 Copiar llave',1500);">📋 Copiar llave</button>
                        <p class="pay-info"><strong>Cuenta:</strong> 22253814 &nbsp;·&nbsp; <strong>C.E.:</strong> 7582423</p>
                    </div>
                    <div class="pay-divider">o también</div>
                    <div class="pay-box" style="--pay-accent:var(--gold-primary);">
                        <span class="pay-method-tag">Breb · Billetera</span>
                        <h3>Jessica</h3>
                        <div class="pay-num">322 877 4481</div>
                        <button class="pay-copy" onclick="navigator.clipboard.writeText('3228774481');this.textContent='✅ Copiado';setTimeout(()=>this.textContent='📋 Copiar',1500);">📋 Copiar</button>
                    </div>
                    <p class="pay-info" style="text-align:center;margin-top:8px;">📸 Sube el comprobante en el portal</p>
                `;
            }

            body.innerHTML = content;
            modal.classList.add('active');
        }

        function openModal(modalId) {
            document.getElementById(modalId).classList.add('active');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
            if (modalId === 'modal-confirmation') {
                const cb = document.getElementById('check-terminos-confirm');
                const btn = document.getElementById('btn-whatsapp-confirm');
                if (cb) cb.checked = false;
                if (btn) { btn.disabled = true; btn.style.opacity = '0.45'; }
            }
        }

        function showTerms() {
            document.getElementById('modal-terms').classList.add('active');
        }

        function toggleWhatsAppBtn(cb) {
            const btn = document.getElementById('btn-whatsapp-confirm');
            if (btn) btn.disabled = !cb.checked;
        }

        function sanitizar(txt) {
            const d = document.createElement('div');
            d.textContent = String(txt);
            return d.innerHTML;
        }

        function submitOrder() {
            // VALIDAR CONFIRMACIÓN DE PAGO
            const pMetodo = document.getElementById('pago_metodo').value;
            const pTitular = document.getElementById('pago_titular').value.trim();
            const pRef = document.getElementById('pago_referencia').value.trim();

            if (!pMetodo || !pTitular) {
                showProdigyAlert('📋 Datos Incompletos', 'Para procesar tu orden, completa el <strong>método de pago</strong> y el nombre del <strong>titular</strong>. Estos datos nos permiten verificar tu transacción. ¡Ya casi terminamos!', 'Completar Datos');
                document.getElementById('pago_metodo').focus();
                return;
            }

            if (!STATE.timeSlot && !STATE.horaCorte) {
                showProdigyAlert('⏰ Horario Requerido', 'Para finalizar tu orden, selecciona un <strong>horario de entrega</strong> en la línea de tiempo. Elige la opción que mejor se adapte a tus necesidades.', 'Seleccionar Horario');
                document.querySelector('.timeline-slots')?.scrollIntoView({behavior:'smooth',block:'center'});
                return;
            }
            const nombreCliente = sanitizar(document.getElementById('nombreCliente').value.trim());
            const whatsappCliente = document.getElementById('whatsappCliente').value.trim();
            const ciudad = sanitizar(document.getElementById('ciudad').value.trim());
            const nombrePaciente = sanitizar(document.getElementById('nombrePaciente').value.trim());
            let origen = document.getElementById('origen').value;
            const linkSTL = document.getElementById('linkSTL').value.trim();

            // Si seleccionó "Otro", tomar el valor del input adicional
            if (origen === 'Otro') {
                const otroOrigen = document.getElementById('otroOrigen').value.trim();
                if (!otroOrigen) {
                    showError(document.getElementById('otroOrigen'), 'Especifica el origen');
                    return;
                }
                origen = `Otro: ${otroOrigen}`;
            }

            if (!nombreCliente) {
                showError(document.getElementById('nombreCliente'), 'Nombre requerido');
                return;
            }

            if (whatsappCliente.length !== 10) {
                showError(document.getElementById('whatsappCliente'), 'WhatsApp: 10 dígitos');
                return;
            }

            if (!ciudad) {
                showError(document.getElementById('ciudad'), 'Ciudad requerida');
                return;
            }

            if (!nombrePaciente) {
                showError(document.getElementById('nombrePaciente'), 'Nombre paciente requerido');
                return;
            }

            if (!origen) {
                showError(document.getElementById('origen'), 'Selecciona origen');
                return;
            }

            if (!STATE.submaterialId) {
                showProdigyAlert('🦷 Material Pendiente', 'Por favor selecciona el <strong>material específico</strong> de tu caso. Sin esta información no podemos generar correctamente tu orden.', 'Seleccionar Material');
                return;
            }

            if (!STATE.timeSlot) {
                showProdigyAlert('⏰ Horario Pendiente', 'Para enviar tu orden por WhatsApp, selecciona el <strong>horario de entrega</strong> que prefieras en la línea de tiempo.', 'Seleccionar Horario');
                return;
            }

            const hasViewerFiles = window.ProdigyMultiViewer && window.ProdigyMultiViewer.getFiles().length > 0;
            if (!linkSTL && !hasViewerFiles) {
                showError(document.getElementById('linkSTL'), 'Adjunta archivos o pega un link de Drive/WeTransfer/Dropbox');
                return;
            }

            if (linkSTL) {
                // Validar que el enlace sea de WeTransfer, Google Drive o Dropbox
                const esWeTransfer = linkSTL.toLowerCase().includes('wetransfer.com') || linkSTL.toLowerCase().includes('we.tl');
                const esDrive     = linkSTL.toLowerCase().includes('drive.google.com');
                const esDropbox   = linkSTL.toLowerCase().includes('dropbox.com');

                if (!esWeTransfer && !esDrive && !esDropbox) {
                    showError(document.getElementById('linkSTL'), 'Acepta enlaces de Buzón PRODIGY (Dropbox), Google Drive o WeTransfer');
                    return;
                }
            }

            // Validar cantidad mínima
            const cantidadNum = parseInt(document.getElementById('cantidad').value, 10);
            if (!Number.isInteger(cantidadNum) || cantidadNum < 1) {
                showError(document.getElementById('cantidad'), 'Cantidad mínima: 1');
                return;
            }

            const _rnd = new Uint8Array(6); crypto.getRandomValues(_rnd);
            const orderId = 'PROD-' + Array.from(_rnd).map(b => b.toString(16).padStart(2,'0')).join('').toUpperCase();
            const cantidad = cantidadNum;
            const totalVerificado = calcularTotal();
            const total = totalVerificado
                ? `$${Number(totalVerificado).toLocaleString('es-CO')}`
                : document.getElementById('calc-total').textContent;
            const timeSlotNames = {
                'express': '🚀 Express 9 AM',
                'mediodia': '☀️ Mediodía 12 PM',
                'tarde': '🌙 Tarde 5 PM'
            };

            const confirmBody = document.getElementById('confirmation-body');
            confirmBody.innerHTML = '';

            const addLine = (label, value) => {
                const p = document.createElement('p');
                const strong = document.createElement('strong');
                strong.textContent = label + ': ';
                p.appendChild(strong);
                p.appendChild(document.createTextNode(value));
                confirmBody.appendChild(p);
            };

            addLine('ID Orden', orderId);
            addLine('Cliente', nombreCliente);
            addLine('Paciente', nombrePaciente);
            addLine('Origen', origen);
            addLine('Material', STATE.submaterialNombre || '');
            addLine('Proceso', STATE.proceso || 'Standard');
            addLine('Color', STATE.colorVita || 'N/A');
            addLine('Cantidad', `${cantidad} unidades`);
            addLine('Entrega', timeSlotNames[STATE.timeSlot] || '');
            addLine('Total', total);
            // Fecha estimada de entrega
            const fechaResumen = document.getElementById('fecha-entrega');
            if(fechaResumen){
                const txt=fechaResumen.innerText||fechaResumen.textContent;
                addLine('Entrega Estimada', txt.replace('Entrega estimada: ','').trim());
            }

            STATE.ordenId = orderId;
            STATE.nombreCliente = nombreCliente;
            STATE.whatsappCliente = whatsappCliente;
            STATE.nombrePaciente = nombrePaciente;
            STATE.origen = origen;
            STATE.linkSTL = linkSTL;
            STATE.cantidad = cantidad;
            STATE.total = total;
            STATE.timeSlotName = timeSlotNames[STATE.timeSlot];
            STATE.pagoMetodo = pMetodo;
            STATE.pagoTitular = pTitular;
            STATE.pagoReferencia = pRef;

            // Facturación DIAN
            STATE.billingReq   = document.getElementById('chk-factura')?.checked || false;
            STATE.billingTipo  = STATE.billingReq ? (document.getElementById('billing_tipo')?.value  || '') : '';
            STATE.billingNit   = STATE.billingReq ? (document.getElementById('billing_nit')?.value.trim()   || '') : '';
            STATE.billingRazon = STATE.billingReq ? (document.getElementById('billing_razon')?.value.trim() || '') : '';
            STATE.billingEmail = STATE.billingReq ? (document.getElementById('billing_email')?.value.trim() || '') : '';
            if (STATE.billingReq && (!STATE.billingTipo || !STATE.billingNit || !STATE.billingRazon || !STATE.billingEmail)) {
                showProdigyAlert('🧾 Datos de Facturación', 'Si requieres factura, completa <strong>todos los campos</strong> de facturación electrónica.', 'Completar');
                return;
            }

            document.getElementById('modal-confirmation').classList.add('active');
        }

        async function sendToWhatsApp() {
            const btn = document.getElementById('btn-whatsapp-confirm');
            if (btn && btn.dataset.sending === '1') return;

            // Rate limiting: máx 1 pedido cada 2 min por sesión
            const _wts = localStorage.getItem('prodigy_wts');
            if (_wts && (Date.now() - parseInt(_wts)) < 120000) {
                const _min = Math.ceil((120000 - (Date.now() - parseInt(_wts))) / 60000);
                showProdigyAlert('⏱️ Por Favor Espera', `Genera un nuevo pedido en ${_min} minuto(s) para evitar duplicados.`, 'Entendido');
                return;
            }
            localStorage.setItem('prodigy_wts', Date.now().toString());

            if (btn) { btn.dataset.sending = '1'; btn.disabled = true; btn.textContent = '⏳ Generando Orden...'; }
            setTimeout(() => {
                if (btn) { btn.dataset.sending = '0'; btn.disabled = false; btn.textContent = '🚀 CONFIRMAR Y ABRIR WHATSAPP'; }
            }, 3000);

            closeModal('modal-confirmation');

            // Subir archivos del multi-viewer a Supabase (si los hay)
            if (window.FlujoUploader && window.ProdigyMultiViewer) {
                const _vf = window.ProdigyMultiViewer.getFiles();
                if (_vf && _vf.length > 0) {
                    try {
                        const _urls = await window.FlujoUploader.upload(STATE.ordenId);
                        if (_urls && _urls.length > 0) STATE.linkSTL = _urls.join(', ');
                    } catch(_ue) { /* continuar con link manual */ }
                }
            }

            // Construir mensaje de WhatsApp con datos de pago
            let texto = `*🖨️ ORDEN DE IMPRESIÓN 3D - PRODIGY*\n\n`;
            texto += `📋 *ID:* ${STATE.ordenId}\n`;
            texto += `👤 *Cliente:* ${STATE.nombreCliente}\n`;
            texto += `📱 *WhatsApp:* ${STATE.whatsappCliente}\n`;
            texto += `🏙️ *Ciudad:* ${document.getElementById('ciudad').value}\n`;
            texto += `👤 *Paciente:* ${STATE.nombrePaciente}\n`;
            texto += `📍 *Origen:* ${STATE.origen}\n\n`;
            
            // Determinar tipo de resina para WhatsApp
            let tipoResina = 'Definitivo';
            if(STATE.submaterialId === 'r_proto_eco') tipoResina = 'PROTOTIPO (Validación - NO biocompatible)';
            else if(STATE.submaterialId === 'r_barra_test') tipoResina = 'Barra de Prueba';
            else if(STATE.materialTipo === 'resina_temporal') tipoResina = 'Temporal';
            else if(STATE.materialTipo === 'resina_modelo') tipoResina = 'Modelo';
            else if(STATE.submaterialId === 'r_barra_hybrid') tipoResina = 'Barra Híbrida';
            else if(STATE.materialTipo === 'resina_quirurgica') tipoResina = 'Quirúrgico';
            else if(STATE.materialTipo === 'resina_especial') tipoResina = 'Especial';
            
            texto += `🖨️ *RESINA:* ${sanitizar(STATE.submaterialNombre || 'N/A')}\n`;
            texto += `🔖 *Tipo:* ${tipoResina}\n`;
            texto += `📏 *Resolución:* ${STATE.proceso || 'Standard'}\n`;
            texto += `🎨 *Color VITA:* ${STATE.colorVita || 'Estándar de Calidad PRODIGY (Según disponibilidad)'}\n`;
            texto += `🔢 *Cantidad:* ${STATE.cantidad} unidades\n\n`;
            
            texto += `⏱️ *Entrega:* ${STATE.timeSlotName}\n`;
            const fechaElem = document.getElementById('fecha-entrega');
            if(fechaElem) {
                const fechaTxt = (fechaElem.innerText || fechaElem.textContent).replace('Entrega estimada: ','').trim();
                texto += `📅 *Fecha:* ${fechaTxt}\n\n`;
            }
            
            texto += `💰 *CONFIRMACIÓN DE PAGO*\n`;
            texto += `• Medio: ${STATE.pagoMetodo}\n`;
            texto += `• Titular: ${STATE.pagoTitular}\n`;
            texto += `• Ref: ${STATE.pagoReferencia || 'No proporcionada'}\n\n`;
            
            texto += `💵 *TOTAL: ${STATE.total}* (pago 100% al confirmar)\n\n`;
            texto += `📎 *Archivos STL:* ${STATE.linkSTL}\n`;

            // Nonce de seguridad para tracking
            const _nonce = btoa(STATE.ordenId + ':' + Date.now().toString(36)).replace(/[+/=]/g, c => c==='+' ? '-' : c==='/' ? '_' : '');
            STATE.nonce = _nonce;
            texto += `🔍 *Seguimiento:* https://prodigylabdental.com/seguimiento-caso.html?id=${STATE.ordenId}&key=${_nonce}\n\n`;

            // Persistir en Supabase (no-blocking — si falla, WA sigue igual)
            try {
                const _sb = (typeof getSupabase === 'function') ? getSupabase() : null;
                if (_sb) {
                    const _fechaElem = document.getElementById('fecha-entrega');
                    const _fechaTxt  = _fechaElem ? (_fechaElem.innerText||_fechaElem.textContent).replace('Entrega estimada: ','').trim() : null;
                    _sb.from('pedidos').insert([{
                        codigo:           STATE.ordenId,
                        doctor:           STATE.nombreCliente,
                        whatsapp:         STATE.whatsappCliente,
                        servicio:         CONFIG.materiales[STATE.materialTipo]?.nom || STATE.materialTipo,
                        material:         STATE.materialTipo,
                        submaterial:      STATE.submaterialNombre,
                        color_vita:       STATE.colorVita,
                        cantidad:         STATE.cantidad,
                        total:            typeof STATE.total === 'string' ? parseInt(STATE.total.replace(/\D/g,'')) : STATE.total,
                        estado:           'Borrador',
                        fecha_entrega:    _fechaTxt,
                        link_stl:         STATE.linkSTL,
                        nonce:            _nonce,
                        flujo:            'impresion',
                        requiere_factura:       STATE.billingReq  || false,
                        billing_tipo:           STATE.billingTipo  || null,
                        billing_nit:            STATE.billingNit   || null,
                        billing_razon:          STATE.billingRazon || null,
                        billing_email:          STATE.billingEmail || null,
                        terminos_aceptados_at:  new Date().toISOString(),
                        user_agent:             navigator.userAgent.slice(0, 250),
                        seguro_garantia_activo: document.getElementById('seguro-garantia')?.checked || false,
                        costo_envio:            Number(document.getElementById('recargo-distancia')?.value) || 0
                    }]).then(({ error: _e }) => {
                        if (_e) console.warn('[PRODIGY] Pedido no guardado en BD:', _e.message);
                    });
                }
            } catch(_e2) { /* silencioso */ }
            if (STATE.billingReq) {
                texto += `🧾 *FACTURA ELECTRÓNICA (DIAN)*\n`;
                texto += `• Tipo doc: ${STATE.billingTipo}\n`;
                texto += `• NIT/Cédula: ${STATE.billingNit}\n`;
                texto += `• Razón Social: ${STATE.billingRazon}\n`;
                texto += `• Email factura: ${STATE.billingEmail}\n\n`;
            }
            texto += `_✅ Acepto los términos y condiciones de PRODIGY (Malla STL verificada)_`;
            texto += `\n\n🤝 *¡Gracias por confiar en PRODIGY Lab Dental!*\nSu caso está en las mejores manos. Trabajamos con precisión, calidad y compromiso en cada detalle.\n_Esperamos seguir siendo su aliado en sus próximos trabajos._ 💎\n_Equipo PRODIGY · Bogotá, Colombia_`;
            
            // TODO: Migración futura a WhatsApp Business API
            // En lugar de window.open, enviar datos a endpoint:
            // await fetch('/api/whatsapp/send', {
            //     method: 'POST',
            //     body: JSON.stringify({
            //         to: '573228774481',
            //         message: texto,
            //         orderData: STATE
            //     })
            // });
            
            const urlWhatsapp = `https://wa.me/573212816716?text=${encodeURIComponent(texto)}`;
            
            try {
                window.open(urlWhatsapp, '_blank');
                const exito = document.getElementById('modal-exito');
                if (exito) {
                    document.getElementById('exito-orden-id').textContent = STATE.ordenId || '—';
                    document.getElementById('exito-cliente').textContent = STATE.nombreCliente || '—';
                    document.getElementById('exito-total').textContent = STATE.total || '—';
                    exito.classList.add('active');
                }
            } catch(e) {
                showProdigyAlert('📱 Error de Conexión', 'No se pudo abrir WhatsApp automáticamente. Verifica que tienes WhatsApp instalado e intenta de nuevo.', 'Intentar de Nuevo');
            }
        }

        function calcularDV(nit) {
            const primos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
            const digits = String(nit).replace(/\D/g,'').split('').reverse();
            let sum = 0;
            for (let i = 0; i < digits.length && i < primos.length; i++) {
                sum += parseInt(digits[i]) * primos[i];
            }
            const rem = sum % 11;
            return rem <= 1 ? rem : 11 - rem;
        }

        function validarNIT(input) {
            let ind = document.getElementById('nit-indicator');
            if (!ind) return;
            const raw = input.value.trim();
            const match = raw.match(/^(\d{6,15})[-\s]?(\d)$/);
            if (!match) {
                ind.textContent = raw.length > 5 ? '⚠️ Formato: 123456789-0' : '';
                ind.style.color = '#f59e0b';
                return;
            }
            const dv = parseInt(match[2]);
            const calc = calcularDV(match[1]);
            if (dv === calc) {
                ind.textContent = '✓ NIT válido';
                ind.style.color = '#00FF41';
            } else {
                ind.textContent = `✗ DV incorrecto — debe ser ${calc}`;
                ind.style.color = '#f87171';
            }
        }

        function copiarId() {
            const id = document.getElementById('exito-orden-id')?.textContent;
            if (id && id !== '—') navigator.clipboard.writeText(id).then(() => {
                const btn = document.querySelector('#modal-exito button[onclick="copiarId()"]');
                if (btn) { btn.textContent = '✓ Copiado'; setTimeout(() => { btn.textContent = '📋 Copiar'; }, 2000); }
            });
        }

        function toggleBillingSection() {
            const fields = document.getElementById('billing-fields');
            if (fields) fields.style.display = document.getElementById('chk-factura').checked ? 'block' : 'none';
        }

        // ── INSTAGRAM SHARE CANVAS ────────────────────────────────────────────────
        function generarTarjetaIG() {
            const canvas = document.getElementById('ig-canvas');
            if (!canvas) return;

            // Spinner: bloquear botón y mostrar estado mientras el hilo renderiza
            const btn = document.querySelector('button[onclick="generarTarjetaIG()"]');
            if (btn) { btn.disabled = true; btn.textContent = 'Generando tarjeta...'; }

            // Ceder el hilo al browser (60 ms) para que pinte el spinner antes del bloqueo CPU
            setTimeout(() => {
            const ctx = canvas.getContext('2d');
            canvas.width  = 1080;
            canvas.height = 1080;

            // Fondo
            const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
            bg.addColorStop(0, '#050505');
            bg.addColorStop(1, '#0a1628');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, 1080, 1080);

            // Barras laterales magenta-dorado
            const barGrad = ctx.createLinearGradient(0, 0, 1080, 0);
            barGrad.addColorStop(0, '#D946A6');
            barGrad.addColorStop(1, '#D4AF37');
            ctx.fillStyle = barGrad;
            ctx.fillRect(0, 0, 1080, 14);
            ctx.fillRect(0, 1066, 1080, 14);

            // Marco interior
            ctx.strokeStyle = 'rgba(217,70,166,0.25)';
            ctx.lineWidth = 1;
            ctx.strokeRect(50, 50, 980, 980);

            // PRODIGY
            ctx.textAlign = 'center';
            ctx.font = 'bold 90px Arial, sans-serif';
            const logoGrad = ctx.createLinearGradient(200, 0, 880, 0);
            logoGrad.addColorStop(0, '#D946A6');
            logoGrad.addColorStop(1, '#D4AF37');
            ctx.fillStyle = logoGrad;
            ctx.fillText('PRODIGY', 540, 170);

            ctx.font = '26px Arial, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.fillText('LABORATORIO DENTAL DIGITAL — CAD/CAM', 540, 215);

            // Divisor
            ctx.strokeStyle = 'rgba(212,175,55,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(140, 248); ctx.lineTo(940, 248); ctx.stroke();

            // Datos del caso
            const ordenId    = document.getElementById('exito-orden-id')?.textContent || STATE.ordenId || '—';
            const cliente    = document.getElementById('exito-cliente')?.textContent   || STATE.nombreCliente || '—';
            const total      = document.getElementById('exito-total')?.textContent     || STATE.total || '—';
            const servicio   = (CONFIG.materiales?.[STATE.materialTipo]?.nom || STATE.materialTipo || '—');
            const submat     = STATE.submaterialNombre || '';
            const fechaTxt   = STATE.fechaEntregaTxt || '';

            const rows = [
                ['ID Orden',  ordenId],
                ['Cliente',   cliente],
                ['Servicio',  servicio + (submat ? ' — ' + submat : '')],
                ['Total',     total],
                ['Entrega',   fechaTxt || '—'],
            ];

            let y = 320;
            rows.forEach(([label, value]) => {
                ctx.textAlign = 'left';
                ctx.font = '24px Arial, sans-serif';
                ctx.fillStyle = 'rgba(255,255,255,0.45)';
                ctx.fillText(label.toUpperCase(), 150, y);
                ctx.font = 'bold 34px Arial, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(value, 150, y + 44);
                y += 110;
            });

            // Divisor inferior
            ctx.strokeStyle = 'rgba(217,70,166,0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(140, 890); ctx.lineTo(940, 890); ctx.stroke();

            // Pie
            ctx.textAlign = 'center';
            ctx.font = 'bold 26px Arial, sans-serif';
            ctx.fillStyle = '#D4AF37';
            ctx.fillText('Tecnología CAD/CAM · Alta Precisión · Bogotá', 540, 930);
            ctx.font = '22px Arial, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.fillText('prodigylabdental.com', 540, 965);

            // Descargar imagen y restaurar botón
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a   = document.createElement('a');
                a.href     = url;
                a.download = 'prodigy-caso-' + ordenId + '.png';
                a.click();
                URL.revokeObjectURL(url);
                if (btn) { btn.disabled = false; btn.textContent = '📸 Compartir en Instagram'; }
            }, 'image/png');
            }, 60); // fin setTimeout
        }

        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
            }
        });
        document.addEventListener('selectstart', e => e.preventDefault());
        document.addEventListener('copy', e => e.preventDefault());

        document.addEventListener('DOMContentLoaded', () => {
            // Cargar precios dinámicos desde Supabase (async, no bloquea UI)
            inicializarCatalogo();

            limitarExtras();

            // FORZAR limpieza de "Cargando..." INMEDIATAMENTE
            document.getElementById('date-express').innerHTML = `<span style="color:#999;">Selecciona material</span>`;
            document.getElementById('date-mediodia').innerHTML = `<span style="color:#999;">Selecciona material</span>`;
            document.getElementById('date-tarde').innerHTML = `<span style="color:#999;">Selecciona material</span>`;
            document.getElementById('line-ingreso')?.classList.add('hidden');
            document.getElementById('line-entrega-fecha')?.classList.add('hidden');
            
            updateTimeline();
            document.querySelector('.accordion').classList.add('active');
            
            // Actualización automática cada 60 segundos
            setInterval(function() {
                if (STATE.materialTipo) {
                    updateTimeline();
                }
            }, 60000);
            
            // BLINDAJE: No decimales ni negativos
            document.querySelectorAll('input[type="number"]').forEach((input) => {
                // Bloqueo de teclas problemáticas
                input.addEventListener('keydown', (e) => {
                    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault();
                });

                // Bloqueo de pegado no numérico
                input.addEventListener('paste', (e) => {
                    const text = (e.clipboardData || window.clipboardData).getData('text');
                    if (!/^\d+$/.test(text)) e.preventDefault();
                });

                input.addEventListener('input', () => {
                    const min = input.id === 'cantidad' ? 1 : 0;
                    const max = input.max ? parseInt(input.max, 10) : null;

                    let v = parseInt(input.value, 10);
                    if (Number.isNaN(v)) v = min;
                    v = Math.max(min, v);
                    if (max !== null && !Number.isNaN(max)) v = Math.min(max, v);

                    input.value = String(v);
                });
            });
            // Autosave: restore profile fields
            const _prof = JSON.parse(localStorage.getItem('prodigy_profile') || '{}');
            if (_prof.nombre) { const el = document.getElementById('nombreCliente'); if (el && !el.value) el.value = _prof.nombre; }
            if (_prof.wa)     { const el = document.getElementById('whatsappCliente'); if (el && !el.value) el.value = _prof.wa; }
            if (_prof.ciudad) { const el = document.getElementById('ciudad'); if (el && !el.value) el.value = _prof.ciudad; }
            // Autosave: save on input
            ['nombreCliente','whatsappCliente','ciudad'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.addEventListener('input', () => {
                    const p = JSON.parse(localStorage.getItem('prodigy_profile') || '{}');
                    p[id === 'nombreCliente' ? 'nombre' : id === 'whatsappCliente' ? 'wa' : 'ciudad'] = el.value;
                    localStorage.setItem('prodigy_profile', JSON.stringify(p));
                });
            });
        });

        // ==========================================
        // CAPA DE SEGURIDAD ANTI-INSPECCIÓN
        // ==========================================
        document.addEventListener('contextmenu', e => e.preventDefault()); // Bloquea click derecho
        
        document.addEventListener('keydown', function(e) {
            // Bloquea F12
            if(e.keyCode === 123) { e.preventDefault(); return false; }
            // Bloquea Ctrl+Shift+I (Herramientas dev)
            if(e.ctrlKey && e.shiftKey && e.keyCode === 73) { e.preventDefault(); return false; }
            // Bloquea Ctrl+Shift+J (Consola)
            if(e.ctrlKey && e.shiftKey && e.keyCode === 74) { e.preventDefault(); return false; }
            // Bloquea Ctrl+U (Ver código fuente)
            if(e.ctrlKey && e.keyCode === 85) { e.preventDefault(); return false; }
            // Bloquea Ctrl+S (Guardar página)
            if(e.ctrlKey && e.keyCode === 83) { e.preventDefault(); return false; }
        });

        // ==========================================
        // DETECCIÓN HÍBRIDA INTELIGENTE (v112)
        // ==========================================
        let blockerDetected = false;

        // Detección silenciosa al cargar página
        document.addEventListener('DOMContentLoaded', function() {
            // Crear cebo para AdBlockers
            let cebo = document.createElement('div');
            cebo.innerHTML = '&nbsp;';
            cebo.className = 'adsbox ad-placement doubleclick ad-placeholder';
            cebo.style.position = 'absolute';
            cebo.style.top = '-9999px';
            cebo.style.left = '-9999px';
            document.body.appendChild(cebo);

            // Verificar tras 1 segundo si el cebo fue bloqueado
            setTimeout(function() {
                if (cebo.offsetHeight === 0 || cebo.style.display === 'none' || window.getComputedStyle(cebo).display === 'none') {
                    blockerDetected = true; // Marcamos que hay bloqueador pero NO mostramos banner aún
                }
                cebo.remove();
            }, 1000);
        });

        // Función para mostrar banner solo cuando sea necesario
        function showWarningBanner() {
            let banner = document.getElementById('system-ux-warning');
            if(banner) {
                banner.style.setProperty('display', 'flex', 'important');
            }
        }

        // FUNCIÓN THEME TOGGLE
        function toggleTheme() {
            const body = document.body;
            const themeBtn = document.getElementById('theme-btn');
            
            body.classList.toggle('light-theme');
            
            if (body.classList.contains('light-theme')) {
                themeBtn.textContent = '☀️';
                localStorage.setItem('theme', 'light');
            } else {
                themeBtn.textContent = '🌙';
                localStorage.setItem('theme', 'dark');
            }
        }

        // CARGAR TEMA GUARDADO
        document.addEventListener('DOMContentLoaded', function() {
            const savedTheme = localStorage.getItem('theme');
            const themeBtn = document.getElementById('theme-btn');
            
            if (savedTheme === 'light') {
                document.body.classList.add('light-theme');
                themeBtn.textContent = '☀️';
            }
        });

        // FUNCIÓN TRADUCCIÓN GOOGLE
        function translatePage() {
            if (!window.googleTranslateElementInit) {
                // Cargar script de Google Translate
                const script = document.createElement('script');
                script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                document.head.appendChild(script);
                
                window.googleTranslateElementInit = function() {
                    new google.translate.TranslateElement({
                        pageLanguage: 'es',
                        autoDisplay: false
                    }, 'google_translate_element');
                };
                
                // Crear contenedor oculto
                const div = document.createElement('div');
                div.id = 'google_translate_element';
                div.style.display = 'none';
                document.body.appendChild(div);
                
                setTimeout(() => {
                    const select = document.querySelector('.goog-te-combo');
                    if (select) {
                        select.dispatchEvent(new Event('change'));
                    }
                }, 1000);
            } else {
                showProdigyAlert('🌐 Google Translate', 'El traductor ya está activo. Usa el <strong>selector de idioma</strong> en la parte superior de la página para cambiar el idioma del contenido.', 'Entendido');
            }
        }

        // FUNCIÓN AYUDA
        // FUNCIÓN MENÚ HAMBURGUESA
        function toggleMenu() {
            const menu = document.getElementById('nav-menu');
            const overlay = document.getElementById('nav-overlay');
            menu.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        // FUNCIÓN SCROLL A SECCIONES
        function scrollToSection(sectionId) {
            const sections = {
                'datos-cliente': document.querySelector('.accordion'),
                'material': document.querySelectorAll('.accordion')[1],
                'procesos': document.querySelectorAll('.accordion')[2],
                'tiempos': document.querySelectorAll('.accordion')[3],
                'archivos': document.querySelectorAll('.accordion')[4],
                'resumen': document.querySelector('.calculator')
            };
            
            const target = sections[sectionId];
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                toggleMenu();
                
                // Abrir acordeón si está cerrado
                if (!target.classList.contains('active') && target.classList.contains('accordion')) {
                    target.classList.add('active');
                }
            }
        }

        // FUNCIÓN SCROLL TO TOP
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Mostrar/ocultar botón según scroll
        window.addEventListener('scroll', function() {
            const scrollBtn = document.getElementById('scrollToTop');
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });

        // CIERRE DE MODALES CLICKEANDO FUERA DEL CUADRO
        window.onclick = function(event) {
            if (event.target.classList.contains('modal') || event.target.classList.contains('modal-overlay')) {
                event.target.style.display = 'none';
            }
        }

        function showHelp() {
            const modal = document.createElement('div');
            modal.id = 'help-modal';
            modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:10000;backdrop-filter:blur(8px);';
            
            modal.innerHTML = `
                <div style="background:#ffffff;border:2px solid #E87427;border-radius:12px;width:90%;max-width:700px;box-shadow:0 0 40px rgba(232,116,39,0.4);">
                    <div style="background:linear-gradient(135deg,#E87427 0%,#D96523 100%);padding:14px 20px;border-radius:10px 10px 0 0;text-align:center;">
                        <h2 style="color:#fff;margin:0;font-size:1.2rem;font-weight:900;">🔧 AYUDA RÁPIDA - PRODIGY</h2>
                    </div>
                    <div style="padding:20px;background:rgba(217, 70, 166, 0.08);color:#000;display:grid;grid-template-columns:1fr 1fr;gap:15px;border-radius:0 0 12px 12px;">
                        <div>
                            <h3 style="color:#E87427;font-size:0.95rem;margin-bottom:10px;font-weight:800;">📋 Pasos orden:</h3>
                            <ol style="line-height:1.6;padding-left:18px;margin:0;font-size:0.85rem;color:#000 !important;font-weight:600;">
                                <li style="color:#000 !important;">Datos del cliente</li>
                                <li style="color:#000 !important;">Material y cantidad</li>
                                <li style="color:#000 !important;">Proceso finalización</li>
                                <li style="color:#000 !important;">Horario entrega</li>
                                <li style="color:#000 !important;">Archivos STL</li>
                                <li style="color:#000 !important;">Datos de pago</li>
                                <li style="color:#000 !important;">Generar → WhatsApp</li>
                            </ol>
                        </div>
                        <div>
                            <h3 style="color:#E87427;font-size:0.95rem;margin-bottom:10px;font-weight:800;">💡 Funciones:</h3>
                            <ul style="line-height:1.6;list-style:none;padding:0;margin:0 0 12px;font-size:0.85rem;color:#000 !important;font-weight:600;">
                                <li style="color:#000 !important;">🌙/☀️ Tema oscuro/claro</li>
                                <li style="color:#000 !important;">🌐 Traducir página</li>
                                <li style="color:#000 !important;">🍔 Menú navegación</li>
                                <li style="color:#000 !important;">❓ Esta ayuda</li>
                            </ul>
                            <button onclick="window.open('https://wa.me/573212816716?text=Hola,%20necesito%20ayuda%20para%20crear%20mi%20orden%20en%20PRODIGY','_blank');document.getElementById('help-modal').remove();" style="width:100%;padding:10px;background:linear-gradient(135deg,#25D366 0%,#128C7E 100%);border:none;border-radius:6px;color:#fff;font-size:0.85rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.3s;">
                                <i class="fab fa-whatsapp" style="font-size:1.2rem;"></i>
                                <span>Soporte WhatsApp</span>
                            </button>
                        </div>
                    </div>
                    <div style="padding:0 20px 20px;">
                        <button onclick="document.getElementById('help-modal').remove()" style="width:100%;padding:12px;background:#E87427;border:none;border-radius:8px;color:#fff;font-size:0.95rem;font-weight:800;cursor:pointer;transition:all 0.3s;">
                            Aceptar
                        </button>
                    </div>
                </div>
            `;
            
            modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
            document.body.appendChild(modal);
        }

        // === SISTEMA DE ALERTAS PREMIUM PRODIGY ===
        function showProdigyAlert(titulo, mensaje, btnTexto) {
            document.getElementById('custom-alert-title').innerHTML = titulo;
            document.getElementById('custom-alert-message').innerHTML = mensaje;
            document.getElementById('custom-alert-btn').textContent = btnTexto || 'Entendido';
            document.getElementById('custom-alert-overlay').style.display = 'flex';
        }
        function closeProdigyAlert() {
            document.getElementById('custom-alert-overlay').style.display = 'none';
        }
