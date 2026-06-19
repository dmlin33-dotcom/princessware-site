/* shop.js — catálogo con filtros, orden y ?cat= / ?sort= */
(function () {
  const { CATEGORIES, PRODUCTS, productCardHTML } = window.PW;
  const params = new URLSearchParams(location.search);
  const state = {
    cats: new Set(params.get('cat') ? [params.get('cat')] : []),
    oferta: params.get('sort') === 'oferta',
    nuevo: false,
    sort: 'relevancia',
  };

  // título según categoría
  const single = state.cats.size === 1 ? CATEGORIES.find((c) => c.id === [...state.cats][0]) : null;
  if (single) {
    document.getElementById('pwShopTitle').textContent = single.name;
    document.getElementById('pwShopDesc').textContent = single.desc + '. Acero quirúrgico 18/8, garantía de por vida.';
    document.getElementById('pwCrumbCat').textContent = single.name;
  }

  // Ajustes de Modo Catálogo
  if (window.PW.SETTINGS.catalogMode) {
    document.title = 'Catálogo · Princessware';
    const crumbCat = document.getElementById('pwCrumbCat');
    if (crumbCat && crumbCat.textContent === 'Tienda') crumbCat.textContent = 'Catálogo';
    const shopTitle = document.getElementById('pwShopTitle');
    if (shopTitle && shopTitle.textContent === 'Tienda') shopTitle.textContent = 'Catálogo';
  }

  // filtros de categoría
  const catWrap = document.getElementById('pwCatFilters');
  catWrap.innerHTML = CATEGORIES.map((c) => `<label class="pw-filter-opt"><input type="checkbox" value="${c.id}" ${state.cats.has(c.id) ? 'checked' : ''}/> ${c.name}</label>`).join('');
  catWrap.querySelectorAll('input').forEach((inp) => inp.onchange = () => { inp.checked ? state.cats.add(inp.value) : state.cats.delete(inp.value); render(); });

  const fNuevo = document.getElementById('fNuevo'); fNuevo.onchange = () => { state.nuevo = fNuevo.checked; render(); };
  document.getElementById('pwSort').onchange = (e) => { state.sort = e.target.value; render(); };

  // filtro móvil
  document.getElementById('pwMobileFilter').onclick = () => document.getElementById('pwFilters').classList.toggle('open');

  function render() {
    let list = PRODUCTS.slice();
    if (state.cats.size) list = list.filter((p) => state.cats.has(p.cat));
    if (state.nuevo) list = list.filter((p) => p.badge === 'Nuevo');
    if (state.sort === 'rating') list.sort((a, b) => b.rating - a.rating);

    document.getElementById('pwShopCount').textContent = `${list.length} producto${list.length === 1 ? '' : 's'}`;
    const grid = document.getElementById('pwShopGrid');
    grid.innerHTML = list.length ? list.map((p) => productCardHTML(p)).join('') : '<p style="color:var(--ink-soft);padding:40px 0">No hay productos con esos filtros. Probá quitar alguno.</p>';
  }
  render();
})();
