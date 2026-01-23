// =============================================
// PRODIGY - JAVASCRIPT PRINCIPAL
// NO TOCAR ESTE ARCHIVO
// =============================================

// Navigation scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10,14,26,0.98)';
        navbar.style.boxShadow = '0 10px 40px rgba(0,0,0,0.5)';
    } else {
        navbar.style.background = 'rgba(10,14,26,0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const navMenu = document.getElementById('navMenu');
        navMenu.classList.remove('active');
    });
});

// Portfolio rendering
const typeBadges = {
    rehabilitacion: '🔬 Rehabilitación',
    implantes: '⚙️ Implantes',
    estetica: '✨ Estética',
    ferulas: '🛡️ Férulas',
    ortodoncia: '📐 Ortodoncia'
};

let currentFilter = 'all';

function renderPortfolio(filter = 'all') {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    const filteredData = filter === 'all' 
        ? PATIENTS_DATA 
        : PATIENTS_DATA.filter(p => p.type === filter);

    if (filteredData.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color: rgba(248,250,252,0.5);">No hay casos en esta categoría</p>';
        return;
    }

    filteredData.forEach(patient => {
        const card = document.createElement('div');
        card.className = 'portfolio-card';
        card.innerHTML = `
            <img src="${patient.coverImage}" 
                 alt="${patient.name}" 
                 class="portfolio-image" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23151b2e%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23ff6b35%22 font-size=%2260%22 text-anchor=%22middle%22 dy=%22.3em%22%3E🦷%3C/text%3E%3C/svg%3E'">
            <div class="portfolio-content">
                <span class="portfolio-badge">${typeBadges[patient.type]}</span>
                <h3>${patient.name}</h3>
                <p>${patient.description}</p>
                <div class="portfolio-meta">
                    <span><i class="fas fa-calendar"></i> ${patient.date}</span>
                    <span><i class="fas fa-images"></i> ${patient.galleryCount || 0} fotos</span>
                </div>
            </div>
        `;
        card.onclick = () => {
            window.location.href = `patient.html?id=${patient.id}`;
        };
        grid.appendChild(card);
    });
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderPortfolio(currentFilter);
    });
});

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderPortfolio();
    console.log('✅ PRODIGY iniciado correctamente');
});