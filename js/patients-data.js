// =============================================
// PRODIGY - BASE DE DATOS DE CASOS CLÍNICOS
// Última actualización: Febrero 2025
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
        exocadFile: "patients/patient-001/exocad.html",
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
    },
    {
        id: "patient-002",
        name: "Carillas Superior e Inferior",
        code: "PATIENT-002",
        type: "estetica",
        date: "2025",
        description: "Carillas estéticas completas superior e inferior.",
        
        coverImage: "patients/patient-002/C.jpeg",
        exocadFile: "patients/patient-002/felipe pinzon.html",
        driveLink: null,
        
        gallery: [
            "patients/patient-002/gallery/1.jpeg",
            "patients/patient-002/gallery/2.jpeg",
            "patients/patient-002/gallery/3.jpeg",
            "patients/patient-002/gallery/4.jpeg",
            "patients/patient-002/gallery/5.jpeg",
            "patients/patient-002/gallery/6.jpeg",
            "patients/patient-002/gallery/7.jpeg",
            "patients/patient-002/gallery/8.jpeg"
        ],
        galleryCount: 8
    }
];

// ===== FUNCIONES AUXILIARES =====
function getPatientById(patientId) {
    return PATIENTS_DATA.find(patient => patient.id === patientId) || null;
}

function filterPatientsByType(type) {
    if (!type) return PATIENTS_DATA;
    return PATIENTS_DATA.filter(patient => patient.type === type);
}

function getAllCaseTypes() {
    return [...new Set(PATIENTS_DATA.map(patient => patient.type))];
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.PATIENTS_DATA = PATIENTS_DATA;
    window.getPatientById = getPatientById;
    window.filterPatientsByType = filterPatientsByType;
    window.getAllCaseTypes = getAllCaseTypes;
}

// Log de verificación
console.log('✅ PATIENTS_DATA cargado:', PATIENTS_DATA.length, 'casos');
