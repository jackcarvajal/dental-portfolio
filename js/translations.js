// ===== TRANSLATIONS.JS - SISTEMA DE INTERNACIONALIZACIÓN =====

const translations = {
    es: {
        // Navbar
        'Home': 'Inicio',
        'Portfolio': 'Portafolio',
        'Remote Design': 'Diseño Remoto',
        'CAM Production': 'Producción CAM',
        'Courses': 'Cursos',
        'Contact': 'Contactar',
        
        // Hero
        'You Scan': 'Tú Escaneas',
        'We Design': 'Nosotros Diseñamos',
        'High-precision digital dental design with CAD/CAM technology<br>For your laboratory and clinic': 'Diseño dental digital de alta precisión con tecnología CAD/CAM<br>Para tu laboratorio y clínica',
        'Delivery: 24-48 hours': 'Entrega: 24-48 horas',
        'Remote Service': 'Servicio Remoto',
        'View Courses': 'Ver Cursos',
        
        // Portfolio
        'Our Work': 'Nuestro Trabajo',
        'Digital designs that transform smiles': 'Diseños digitales que transforman sonrisas',
        'All': 'Todos',
        'Rehabilitation': 'Rehabilitación',
        'Implants': 'Implantes',
        'Aesthetics': 'Estética',
        'Splints': 'Férulas',
        'Orthodontics': 'Ortodoncia',
        
        // Remote Design
        'Remote Design Service': 'Servicio de Diseño Remoto',
        'You scan, we design. Fast, precise, professional': 'Tú escaneas, nosotros diseñamos. Rápido, preciso, profesional',
        'Register Case': 'Registra tu Caso',
        'Complete the form with patient details and delivery date': 'Completa el formulario con datos del paciente y fecha de entrega',
        '50% Advance Payment': 'Adelanto del 50%',
        'Pay 50% advance via Nequi, BREV, transfer, or PayPal': 'Paga el 50% por adelantado vía Nequi, BREV, transferencia o PayPal',
        'Upload Files': 'Sube los Archivos',
        'Send your STL scans and intraoral photos': 'Envía tus escaneos STL y fotos intraorales',
        '24-48h Delivery': 'Entrega 24-48h',
        'Receive your professional design in 24-48 hours': 'Recibe tu diseño profesional en 24-48 horas',
        'Choose Your Upload Method': 'Elige tu Método de Envío',
        'Shared folder - Direct and organized': 'Carpeta compartida - Directo y organizado',
        'Large files - Automatic deletion in 7 days': 'Archivos grandes - Borrado automático en 7 días',
        'Direct contact - Quick and personal': 'Contacto directo - Rápido y personal',
        'Traditional method - Reliable and professional': 'Método tradicional - Confiable y profesional',
        'Select': 'Seleccionar',
        
        // CAM Production
        'CAM Production Service': 'Servicio de Producción CAM',
        'You design, we manufacture. Precision and quality guaranteed': 'Tú diseñas, nosotros fabricamos. Precisión y calidad garantizada',
        'Resin Models': 'Modelos en Resina',
        'High-precision 3D printing for dental models': 'Impresión 3D de alta precisión para modelos dentales',
        'Prototypes': 'Prototipos',
        'Functional prototypes for testing and validation': 'Prototipos funcionales para pruebas y validación',
        'Castable Resin': 'Resina Calcinable',
        'Patterns for metal casting with clean burnout': 'Patrones para colado en metal con quemado limpio',
        'Milling': 'Fresado',
        'CNC milling for final restorations': 'Fresado CNC para restauraciones finales',
        'Required Files for CAM Production': 'Archivos Requeridos para Producción CAM',
        'files (exported designs)': 'archivos (diseños exportados)',
        'CAD Scene (Exocad project)': 'Escena CAD (proyecto Exocad)',
        'file (production parameters)': 'archivo (parámetros de producción)',
        'Request CAM Production': 'Solicitar Producción CAM',
        
        // Courses
        'Exocad Training': 'Capacitación Exocad',
        'Master digital design with personalized training': 'Domina el diseño digital con capacitación personalizada',
        'Online Course': 'Curso Online',
        'Learn from anywhere with personalized sessions': 'Aprende desde cualquier lugar con sesiones personalizadas',
        'Live personalized sessions': 'Sesiones en vivo personalizadas',
        'Flexible schedule': 'Horarios flexibles',
        'Recorded material': 'Material grabado',
        'Post-course support': 'Soporte post-curso',
        'More Info': 'Más Información',
        'MOST POPULAR': 'MÁS POPULAR',
        'In-Person in Bogotá': 'Presencial en Bogotá',
        'Intensive hands-on training in our facilities': 'Capacitación intensiva práctica en nuestras instalaciones',
        'Direct personalized attention': 'Atención personalizada directa',
        'Intensive practice': 'Práctica intensiva',
        'Professional equipment': 'Equipos profesionales',
        'Completion certificate': 'Certificado de finalización',
        'Reserve Your Spot': 'Reserva tu Cupo',
        'Corporate Training': 'Capacitación Corporativa',
        'Custom programs for laboratories and clinics': 'Programas personalizados para laboratorios y clínicas',
        'Custom content': 'Contenido personalizado',
        'Team training': 'Capacitación en equipo',
        'At your location': 'En tus instalaciones',
        'Continuous support': 'Soporte continuo',
        'Request Quote': 'Solicitar Cotización',
        
        // Footer
        'Services': 'Servicios',
        'Training': 'Capacitación',
        'Follow Us': 'Síguenos',
        'Medical-grade encryption | Automatic file deletion every 7 days | Compliance with Law 1581 (Data Protection)': 'Cifrado de grado médico | Eliminación automática de archivos cada 7 días | Cumplimiento Ley 1581 (Protección de Datos)',
        'All rights reserved': 'Todos los derechos reservados',
        
        // Form
        'Back': 'Volver',
        'Registration Form': 'Formulario de Registro',
        'Full Name *': 'Nombre Completo *',
        'Phone *': 'Teléfono *',
        'Required Delivery Date *': 'Fecha de Entrega Requerida *',
        'Case Type *': 'Tipo de Caso *',
        'Select type...': 'Selecciona tipo...',
        'Crown': 'Corona',
        'Bridge': 'Puente',
        'Implant': 'Implante',
        'Splint': 'Férula',
        'Complete Rehabilitation': 'Rehabilitación Completa',
        'Payment Method *': 'Método de Pago *',
        'Select method...': 'Selecciona método...',
        'Bank Transfer': 'Transferencia',
        'You must attach proof of 50% advance payment': 'Debes adjuntar comprobante del adelanto 50%',
        'Payment Information': 'Información de Pago',
        'Nequi Number': 'Número Nequi',
        'BREV Key': 'Llave BREV',
        'Pay with PayPal': 'Pagar con PayPal',
        'Amount includes 5.4% + $0.30 USD PayPal fee': 'El monto incluye comisión de 5.4% + $0.30 USD de PayPal',
        'Service Amount (USD)': 'Monto del Servicio (USD)',
        'Total to pay (with fees):': 'Total a pagar (con comisiones):',
        'Payment Receipt (50% Advance) *': 'Comprobante de Pago (Adelanto 50%) *',
        'Drag your receipt here': 'Arrastra tu comprobante aquí',
        'or click to select': 'o haz clic para seleccionar',
        'WeTransfer Download Link *': 'Link de Descarga de WeTransfer *',
        'Paste the WeTransfer download link here after uploading your files': 'Pega aquí el link de descarga de WeTransfer después de subir tus archivos',
        'Intraoral Photos (Minimum 3)': 'Fotos Intraorales (Mínimo 3)',
        'Drag intraoral photos': 'Arrastra fotos intraorales',
        'Multiple files allowed': 'Múltiples archivos permitidos',
        'Extraoral Photos (Optional)': 'Fotos Extraorales (Opcional)',
        'Drag extraoral photos': 'Arrastra fotos extraorales',
        'Important Note - WeTransfer': 'Nota Importante - WeTransfer',
        'Files sent via WeTransfer are automatically deleted after 7 days. Make sure we receive your case within this timeframe.': 'Los archivos enviados por WeTransfer se borran automáticamente en 7 días. Asegúrate de que recibamos tu caso dentro de este plazo.',
        'Additional Comments': 'Observaciones Adicionales',
        'Submit Form': 'Enviar Formulario'
    },
    en: {
        // English translations (keys are already in English)
    }
};

// Función para aplicar traducciones
function applyTranslations(lang) {
    document.querySelectorAll('[data-en]').forEach(element => {
        const key = element.getAttribute(`data-${lang}`);
        if (key) {
            // Si el elemento es un input placeholder
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = key;
            } else {
                element.innerHTML = key;
            }
        }
    });
}

// Función para cambiar idioma
function changeLanguage(lang) {
    localStorage.setItem('language', lang);
    applyTranslations(lang);
    
    // Actualizar botones activos
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Inicializar idioma al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'es';
    changeLanguage(savedLang);
    
    // Agregar event listeners a los botones de idioma
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
});

console.log('Translations.js loaded 🌍');
