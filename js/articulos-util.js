/* PRODIGY — funciones de la base de artículos (articles.js).
   Viven aquí y NO dentro de articles.js: el generador automático (scripts/auto-journal.js) reescribe
   articles.js completo y en jun-2026 las borró → todos los artículos se abrían en blanco
   («getArticle is not defined»). Cargar DESPUÉS de articles.js. */
(function () {
  'use strict';
  function lista() { return typeof ARTICLES !== 'undefined' ? ARTICLES : []; }

  /* Tema de un artículo automático: el id es «<tema>-AAAA-MM-DD-xxxx». Los manuales no llevan fecha. */
  function tema(id) { return String(id || '').replace(/-\d{4}-\d{2}-\d{2}-[0-9a-f]{4}$/, ''); }
  window.articuloTema = tema;

  /* Buscar artículo por ID */
  window.getArticle = function (id) {
    return lista().find(function (a) { return a.id === id; }) || null;
  };

  /* Versión más reciente del mismo tema (para enlaces viejos a un artículo repetido que se retiró) */
  window.getArticleMismoTema = function (id) {
    var t = tema(id);
    if (t === id) return null;
    return lista().find(function (a) { return tema(a.id) === t && !a.proximas; }) || null;
  };

  /* Artículos recientes para la barra lateral */
  window.getRecientes = function (excludeId, limit) {
    return lista().filter(function (a) { return a.id !== excludeId && !a.proximas; }).slice(0, limit || 3);
  };

  /* Relacionados: misma categoría primero, luego otros */
  window.getRelacionados = function (currentArt, limit) {
    if (!currentArt) return [];
    var otros = lista().filter(function (a) { return a.id !== currentArt.id && !a.proximas; });
    var misma = otros.filter(function (a) { return a.categoria === currentArt.categoria; });
    var resto = otros.filter(function (a) { return a.categoria !== currentArt.categoria; });
    return misma.concat(resto).slice(0, limit || 4);
  };

  /* Portada: og_img del artículo o, si no tiene, la portada SVG de su categoría */
  var PORTADAS = {
    materiales: '/assets/journal/cover-materiales.svg', material: '/assets/journal/cover-materiales.svg',
    tecnologia: '/assets/journal/cover-tecnologia.svg', flujos: '/assets/journal/cover-flujos.svg',
    fabricacion: '/assets/journal/cover-flujos.svg', clinico: '/assets/journal/cover-clinico.svg',
    impresion3d: '/assets/journal/cover-impresion3d.svg', ia: '/assets/journal/cover-ia.svg',
    protocolo: '/assets/journal/cover-protocolo.svg', equipo: '/assets/journal/cover-equipo.svg'
  };
  /* Wikimedia (2025) solo sirve miniaturas en anchos estándar: 800px o 1200px responden 400 y la portada salía
     rota. Se lleva al ancho estándar más cercano; si el archivo ya no existe, la tarjeta usa la portada de su
     categoría (getArticleCoverRespaldo + onerror en journal.html y article.html). */
  var WM_ANCHOS = [250, 330, 500, 960, 1280, 1920];
  function anchoWikimedia(u) {
    var m = /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/.+\/)(\d+)px-([^\/?#]+)(?:[?#].*)?$/.exec(u);
    if (!m || WM_ANCHOS.indexOf(+m[2]) >= 0) return u;
    var w = +m[2], std = WM_ANCHOS.filter(function (x) { return x >= Math.min(w, 960); })[0] || 1280;
    return m[1] + std + 'px-' + m[3];
  }
  window.getArticleCoverRespaldo = function (article) {
    return PORTADAS[article && article.categoria] || '/assets/journal/cover-tecnologia.svg';
  };
  window.getArticleCover = function (article) {
    if (article && article.og_img && String(article.og_img).trim()) return anchoWikimedia(String(article.og_img).trim());
    return window.getArticleCoverRespaldo(article);
  };
  window.arreglarImagenArticulo = anchoWikimedia;
})();
