// =============================================
// PRODIGY - MAIN SCRIPT
// =============================================

(function() {
    'use strict';

    // ===== PROTECCIÓN BÁSICA (Opcional) =====
    // Nota: Estas medidas son fácilmente eludibles y solo disuaden usuarios básicos
    function initProtection() {
        // Deshabilitar menú contextual
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });

        // Deshabilitar atajos de teclado comunes de DevTools
        document.addEventListener('keydown', function(e) {
            // F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+I (Inspector)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+U (Ver código fuente)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+C (Selector de elementos)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                return false;
            }
        });
    }

    // ===== GENERACIÓN DINÁMICA DEL PORTAFOLIO =====
    function initPortfolio() {
        const portfolioGrid = document.querySelector('.portfolio-grid');
        
        // Validar que existe el contenedor
        if (!portfolioGrid) {
            console.error('❌ No se encontró el contenedor .portfolio-grid');
            return;
        }

        // Validar que existen datos
        if (typeof PATIENTS_DATA === 'undefined' || !PATIENTS_DATA || PATIENTS_DATA.length === 0) {
            console.error('❌ No hay datos de pacientes disponibles');
            portfolioGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <p style="color: var(--color-gold); font-size: 1.2rem;">
                        No hay casos disponibles en este momento
                    </p>
                </div>
            `;
            return;
        }

        // Limpiar el grid por si acaso
        portfolioGrid.innerHTML = '';

        // Generar las tarjetas dinámicamente
        PATIENTS_DATA.forEach((patient, index) => {
            const card = createPortfolioCard(patient, index);
            portfolioGrid.appendChild(card);
        });

        console.log(`✅ ${PATIENTS_DATA.length} tarjetas de portafolio generadas correctamente`);
    }

    // ===== CREAR TARJETA DE PORTAFOLIO =====
    function createPortfolioCard(patient, index) {
        const card = document.createElement('div');
        card.className = 'portfolio-card';
        card.setAttribute('data-patient-id', patient.id);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Ver caso: ${patient.name}`);

        // Determinar estrategia de carga de imagen
        const loadingStrategy = index < 4 ? 'eager' : 'lazy';

        card.innerHTML = `
            <div class="image-wrapper">
                <img src="${patient.coverImage}" 
                     alt="${patient.name}" 
                     loading="${loadingStrategy}"
                     onerror="handleImageError(this)">
                <div class="watermark">© PRODIGY</div>
            </div>
            <div class="card-info">
                <h3>${patient.name}</h3>
                <p>${patient.description || 'Caso clínico de alta complejidad'}</p>
                <span class="card-date">${patient.date || 'Fecha no especificada'}</span>
            </div>
        `;

        // Eventos de navegación
        const navigateToPatient = () => {
            window.location.href = `patient.html?id=${patient.id}`;
        };

        card.addEventListener('click', navigateToPatient);
        
        // Soporte de teclado (accesibilidad)
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToPatient();
            }
        });

        return card;
    }

    // ===== MANEJO DE ERRORES DE IMAGEN =====
    window.handleImageError = function(img) {
        console.warn(`⚠️ Error al cargar imagen: ${img.src}`);
        
        // Intentar con imagen por defecto
        if (!img.src.includes('default.jpg')) {
            img.src = 'assets/default.jpg';
        } else {
            // Si incluso la imagen por defecto falla, usar un placeholder
            img.style.display = 'none';
            const wrapper = img.closest('.image-wrapper');
            if (wrapper) {
                wrapper.style.background = 'linear-gradient(135deg, #1e2433 0%, #0a0e1a 100%)';
                wrapper.innerHTML += '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #D4AF37; font-size: 3rem;">💎</div>';
            }
        }
    };

    // ===== SCROLL SUAVE CON OFFSET DEL NAVBAR =====
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Ignorar enlaces que solo son "#"
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (!target) return;
                
                e.preventDefault();
                
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 90;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }

    // ===== EFECTO DE NAVBAR AL HACER SCROLL =====
    function initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        let lastScroll = 0;

        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            // Agregar clase "scrolled" cuando se hace scroll
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    }

    // ===== ANIMACIONES AL HACER SCROLL (Intersection Observer) =====
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar elementos que queremos animar
        const animateElements = document.querySelectorAll(
            '.portfolio-card, .service-card, .method-card, .course-card, .production-card'
        );
        
        animateElements.forEach(el => observer.observe(el));
    }

    // ===== INICIALIZACIÓN AL CARGAR EL DOM =====
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Iniciando PRODIGY...');

        // Inicializar protección (opcional)
        initProtection();

        // Inicializar portafolio
        initPortfolio();

        // Inicializar scroll suave
        initSmoothScroll();

        // Inicializar efectos del navbar
        initNavbarScroll();

        // Inicializar animaciones de scroll
        if ('IntersectionObserver' in window) {
            initScrollAnimations();
        }

        console.log('✅ PRODIGY inicializado correctamente');
    });

    // ===== MANEJO DE ERRORES GLOBALES =====
    window.addEventListener('error', function(e) {
        console.error('❌ Error capturado:', e.message, e.filename, e.lineno);
    });

    // ===== MENSAJES DE BIENVENIDA EN CONSOLA =====
    console.log('%c💎 PRODIGY', 'font-size: 24px; font-weight: bold; color: #D4AF37;');
    console.log('%cDigital Dental Excellence', 'font-size: 14px; color: #86868b;');
    console.log('%cDesarrollado con precisión quirúrgica', 'font-size: 12px; color: #FF6600;');

})();
