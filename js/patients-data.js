// ============================================
// BASE DE DATOS DE PACIENTES
// SOLO EDITA ESTA SECCIÓN PARA AGREGAR CASOS
// ============================================

const PATIENTS_DATA = [
    // EJEMPLO 1: Caso de Rehabilitación
    {
        id: "patient-001",
        name: "Rehabilitación Full Arch Maxilar",
        code: "001",
        type: "rehabilitacion",
        date: "Diciembre 2025",
        description: "Rehabilitación completa de arcada superior con 14 unidades cerámicas . Workflow digital completo con escaneo intraoral.",
        
        // RUTAS DE ARCHIVOS (ajusta según tu estructura)
        coverImage: "patients/patient-001/cover.jpg",
        exocadFile: "patients/patient-001/exocad.html",
        driveLink: "https://drive.google.com/file/d/1_O4NneXouY9VmM3QD-Cz0zzHHnm-VKQz/view?usp=drive_link",
        
        // GALERÍA (opcional - puedes dejar array vacío si no hay imágenes)
        gallery: [
            "patients/patient-001/gallery/img-1.jpg",
            "patients/patient-001/gallery/img-2.jpg",
            "patients/patient-001/gallery/img-3.jpg"
        ],
        
        galleryCount: 9
    },

    // EJEMPLO 2: Caso de Implantes
    {
        id: "patient-002",
        name: "Barra Multi-Unit sobre 6 Implantes",
        code: "IM-2024-015",
        type: "implantes",
        date: "Enero 2025",
        description: "Diseño de barra fresada en titanio grado 5 con conexiones multi-unit. Optimizada para sobredentadura con retención mecánica.",
        
        coverImage: "patients/patient-002/cover.jpg",
        exocadFile: "patients/patient-002/exocad.html",
        driveLink: "https://drive.google.com/file/d/OTRO_ID_DE_GOOGLE_DRIVE/view",
        
        gallery: [
            "patients/patient-002/gallery/img-1.jpg",
            "patients/patient-002/gallery/img-2.jpg"
        ],
        
        galleryCount: 2
    },

    // EJEMPLO 3: Caso de Estética
    {
        id: "patient-003",
        name: "Carillas E-Max Anteriores Superiores",
        code: "ES-2024-032",
        type: "estetica",
        date: "Noviembre 2024",
        description: "Set de 10 carillas en disilicato de litio con diseño de sonrisa digital. Preparaciones mínimamente invasivas.",
        
        coverImage: "patients/patient-003/cover.jpg",
        exocadFile: "patients/patient-003/exocad.html",
        driveLink: "https://drive.google.com/file/d/TERCER_ID_DE_DRIVE/view",
        
        gallery: [
            "patients/patient-003/gallery/img-1.jpg",
            "patients/patient-003/gallery/img-2.jpg",
            "patients/patient-003/gallery/img-3.jpg",
            "patients/patient-003/gallery/img-4.jpg"
        ],
        
        galleryCount: 4
    },

    // EJEMPLO 4: Caso de Férulas
    {
        id: "patient-004",
        name: "Férula de Descarga Michigan",
        code: "FE-2024-008",
        type: "ferulas",
        date: "Diciembre 2024",
        description: "Férula oclusal tipo Michigan para arcada superior. Diseño digital con guías caninas optimizadas y ajuste oclusal preciso.",
        
        coverImage: "patients/patient-004/cover.jpg",
        exocadFile: "patients/patient-004/exocad.html",
        driveLink: "https://drive.google.com/file/d/CUARTO_ID_DE_DRIVE/view",
        
        gallery: [],
        
        galleryCount: 0
    }

    // ============================================
    // PARA AGREGAR UN NUEVO PACIENTE:
    // ============================================
    // 1. Copia el bloque completo de un ejemplo anterior
    // 2. Cambia el id (debe ser único: patient-005, patient-006, etc)
    // 3. Actualiza todos los campos con la información del nuevo caso
    // 4. Asegúrate de que las rutas de archivos coincidan con tu estructura
    // 5. Agrega una coma al final del bloque anterior
    // 6. Guarda el archivo y sube a GitHub
    
    // EJEMPLO DE CÓMO AGREGAR EL PACIENTE 005:
    /*
    ,
    {
        id: "patient-005",
        name: "Tu Nuevo Caso Aquí",
        code: "XX-2025-001",
        type: "rehabilitacion", // opciones: rehabilitacion, implantes, estetica, ferulas
        date: "Enero 2025",
        description: "Descripción detallada del caso clínico...",
        
        coverImage: "patients/patient-005/cover.jpg",
        exocadFile: "patients/patient-005/exocad.html",
        driveLink: "https://drive.google.com/file/d/NUEVO_ID/view",
        
        gallery: [
            "patients/patient-005/gallery/img-1.jpg",
            "patients/patient-005/gallery/img-2.jpg"
        ],
        
        galleryCount: 2
    }
    */
];

// ============================================
// NO EDITES NADA DEBAJO DE ESTA LÍNEA
// ============================================

// Validación automática de datos
if (typeof window !== 'undefined') {
    console.log(`✅ Base de datos cargada: ${PATIENTS_DATA.length} pacientes`);
    
    // Verificar que no haya IDs duplicados
    const ids = PATIENTS_DATA.map(p => p.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
        console.error('❌ ERROR: IDs duplicados encontrados:', duplicates);
    }
}