// =============================================
// PRODIGY - BASE DE DATOS DE CASOS
// AQUÍ AGREGAS TUS CASOS
// =============================================

const PATIENTS_DATA = [
    // ========== EJEMPLO CASO 1 ==========
    {
        id: "patient-001",
        name: "Rehabilitación Full Arch Superior",
        code: "CASO-001",
        type: "rehabilitacion",
        date: "Enero 2025",
        description: "Rehabilitación completa de arcada superior con 14 unidades cerámicas sobre implantes.",
        
        // Rutas de archivos (NO CAMBIAR estas rutas)
        coverImage: "patients/patient-001/cover.jpg",
        exocadFile: "patients/patient-001/exocad.html",
        
        // Tu link de Google Drive para descargar
        driveLink: "https://drive.google.com/file/d/TU_ID_AQUI/view",
        
        // Galería de fotos
        gallery: [
            "patients/patient-001/gallery/WhatsApp Image 2026-01-06 at 15.23.jpg",
            "patients/patient-001/gallery/WhatsApp Image 2026-01-06 at 15.25.jpg"
        ],
        galleryCount: 2
    }

    // ========== PARA AGREGAR MÁS CASOS: ==========
    // 1. Copia desde la línea 12 hasta la 27 (TODO el bloque {})
    // 2. ANTES de pegar, agrega una COMA después del } del caso anterior
    // 3. Pega el bloque copiado
    // 4. Cambia:
    //    - id: "patient-002" (siguiente número)
    //    - name: "Nombre de tu caso"
    //    - description: "Descripción"
    //    - driveLink: "tu link"
    //    - gallery: las fotos que tengas
    //    - galleryCount: cantidad de fotos
    //
    // EJEMPLO de cómo agregar el caso 2:
    /*
    ,
    {
        id: "patient-002",
        name: "Barra sobre Implantes",
        code: "CASO-002",
        type: "implantes",
        date: "Enero 2025",
        description: "Barra titanio con 6 conexiones multi-unit.",
        coverImage: "patients/patient-002/cover.jpg",
        exocadFile: "patients/patient-002/exocad.html",
        driveLink: "https://drive.google.com/file/d/OTRO_ID/view",
        gallery: [],
        galleryCount: 0
    }
    */
];

// NO TOCAR NADA ABAJO DE ESTA LÍNEA
console.log(`✅ PRODIGY: ${PATIENTS_DATA.length} casos cargados`);