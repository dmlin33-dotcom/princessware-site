/* home.js — render del home */
(function () {
  const { CATEGORIES, PRODUCTS, BENEFITS, icon, productCardHTML } = window.PW;

  // beneficios
  document.getElementById('pwBenefits').innerHTML = BENEFITS.map((b) => `
    <div class="pw-benefit">
      <div class="pw-benefit-ic">${icon(b.k, 24, '#1b4a8f')}</div>
      <div><div class="pw-benefit-t">${b.title}</div><div class="pw-benefit-d">${b.desc}</div></div>
    </div>`).join('');

  // categorías
  document.getElementById('pwCatsGrid').innerHTML = CATEGORIES.map((c) => `
    <a class="pw-cat-card" href="tienda.html?cat=${c.id}">
      <img src="${c.img}" alt="${c.name}"/>
      <div class="pw-cat-ov"></div>
      <div class="pw-cat-tx"><div class="pw-cat-name">${c.name}</div><div class="pw-cat-desc">${c.desc}</div></div>
    </a>`).join('');

  // productos + tabs
  const tabs = [{ id: 'all', n: 'Todos' }, { id: 'sets', n: 'Sets' }, { id: 'ollas', n: 'Ollas' }, { id: 'sartenes', n: 'Sartenes' }, { id: 'vapor', n: 'Vapor' }];
  let filter = 'all';
  const tabsEl = document.getElementById('pwTabs');
  const gridEl = document.getElementById('pwGrid');
  function renderTabs() { tabsEl.innerHTML = tabs.map((t) => `<button class="${filter === t.id ? 'on' : ''}" data-f="${t.id}">${t.n}</button>`).join(''); tabsEl.querySelectorAll('[data-f]').forEach((b) => b.onclick = () => { filter = b.dataset.f; renderTabs(); renderGrid(); }); }
  function renderGrid() { const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.cat === filter); gridEl.innerHTML = list.map((p) => productCardHTML(p)).join(''); }
  renderTabs(); renderGrid();

  // destacado (sin precios ni countdown)
  const hero = PRODUCTS[0];
  const offer = document.getElementById('pwOffer');
  offer.innerHTML = `
    <div class="pw-offer-photo"><img src="assets/set-four-black.jpeg" alt="${hero.name}"/></div>
    <div class="pw-offer-tx">
      <div class="pw-eyebrow on-dark">Destacado</div>
      <h2>${hero.name}</h2>
      <p>${hero.blurb}</p>
      <a class="btn-metal" href="producto.html?id=${hero.id}">Ver detalles ${icon('arrow', 16, '#0e2a52')}</a>
    </div>`;
})();
