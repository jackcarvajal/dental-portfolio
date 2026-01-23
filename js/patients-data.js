// =============================================
// PRODIGY - BASE DE DATOS DE CASOS
// =============================================

const PATIENTS_DATA = [
    {
        id: "patient-001",
        name: "Rehabilitación Full Arch Superior",
        code: "CASO-001",
        type: "rehabilitacion",
        date: "Enero 2025",
        description: "Rehabilitación completa de arcada superior con 14 unidades cerámicas sobre implantes.",
        
        coverImage: "patients/patient-001/cover.jpeg",
        exocadFile: "patients/patient-001/exocad.html",  // ← CORREGIDO: era paul.html
        driveLink: "https://drive.google.com/file/d/TU_ID_AQUI/view",
        
        gallery: [
            "patients/patient-001/gallery/foto-1.jpeg",
            "patients/patient-001/gallery/foto-2.jpeg",
            "patients/patient-001/gallery/foto-3.jpeg",
            "patients/patient-001/gallery/foto-4.jpeg",
            "patients/patient-001/gallery/foto-5.jpeg",
            "patients/patient-001/gallery/foto-6.jpeg",
            "patients/patient-001/gallery/foto-7.jpeg",
            "patients/patient-001/gallery/foto-8.jpeg",
            "patients/patient-001/gallery/foto-9.jpeg"
        ],
        galleryCount: 9
    },,
    {
        id: "patient-002",
        name: "caso de carillas full arch",
        code: "patient-002",
        type: "estetica",
        date: "enero 2024",
        description: "caso de carillas",
        
        coverImage: "patients/patient-002/cover.jpeg",
        exocadFile: "patients/patient-002/exocad.html",
        driveLink: "no",
        
        gallery: [
            "patients/patient-002/gallery/WhatsApp Image 2025-12-10 at 19.53.22",
            "patients/patient-002/gallery/WhatsApp Image 2025-12-10 at 19.53.21 (1)",
            "patients/patient-002/gallery/WhatsApp Image 2025-12-10 at 19.53.21",
            "patients/patient-002/gallery/WhatsApp Image 2025-12-10 at 19.53.22 (1)",
            "patients/patient-002/gallery/WhatsApp Image 2025-12-10 at 19.53.22 (2)",
            "patients/patient-002/gallery/WhatsApp Image 2025-12-10 at 19.53.22 (3)",
            "patients/patient-002/gallery/WhatsApp Image 2025-12-10 at 19.53.23 (1)",
            "patients/patient-002/gallery/WhatsApp Image 2025-12-10 at 19.53.23"
        ],
        galleryCount: 8
    }
];

console.log(`✅ PRODIGY: ${PATIENTS_DATA.length} casos cargados`);
