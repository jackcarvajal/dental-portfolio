// PRODIGY — Script de minificación CSS
// Uso: node minify.js
// Ejecutar cada vez que edites global-nav.css o flujo-impresion.css

const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, 'css');

const archivos = ['global-nav.css', 'flujo-impresion.css'];

function minify(contenido) {
    return contenido
        .replace(/\/\*[\s\S]*?\*\//g, '')       // elimina comentarios
        .replace(/\s*([{};:,>~+])\s*/g, '$1')   // elimina espacios alrededor de símbolos
        .replace(/\s+/g, ' ')                    // colapsa espacios múltiples
        .replace(/;\}/g, '}')                    // elimina ; antes de }
        .trim();
}

archivos.forEach(archivo => {
    const origen = path.join(CSS_DIR, archivo);
    const destino = path.join(CSS_DIR, archivo.replace('.css', '.min.css'));

    if (!fs.existsSync(origen)) {
        console.error('❌ No encontrado:', archivo);
        return;
    }

    const original = fs.readFileSync(origen, 'utf8');
    const minificado = minify(original);
    fs.writeFileSync(destino, minificado);

    const orig = Buffer.byteLength(original, 'utf8');
    const mini = Buffer.byteLength(minificado, 'utf8');
    const pct = ((1 - mini / orig) * 100).toFixed(1);

    console.log(`✅ ${archivo} → ${archivo.replace('.css', '.min.css')} | ${orig}b → ${mini}b (${pct}% reducido)`);
});

console.log('\n🚀 Minificación completada. Los .min.css están actualizados.');
