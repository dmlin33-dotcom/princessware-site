/* product.js — ficha de producto por ?id= */
(function () {
  const { CATEGORIES, PRODUCTS, icon, stars, productCardHTML } = window.PW;
  const id = new URLSearchParams(location.search).get('id') || 'p1';
  const p = PRODUCTS.find((x) => x.id === id) || PRODUCTS[0];
  const catName = (CATEGORIES.find((c) => c.id === p.cat) || {}).name || '';
  const gallery = p.gallery && p.gallery.length ? p.gallery : [p.img];

  document.title = p.name + ' · Princessware';
  document.getElementById('pwCrumb').textContent = p.name;
  const crumbLinks = document.querySelectorAll('.pw-crumb a');
  crumbLinks.forEach(a => { if (a.textContent === 'Tienda') a.textContent = 'Catálogo'; });

  document.getElementById('pwPd').innerHTML = `
    <div class="pw-pd-gallery">
      <div class="pw-pd-main"><img id="pwPdImg" src="${gallery[0]}" alt="${p.name}"/></div>
      <div class="pw-pd-thumbs">
        ${gallery.map((g, i) => `<button class="pw-pd-thumb ${i === 0 ? 'on' : ''}" data-g="${g}"><img src="${g}" alt=""/></button>`).join('')}
      </div>
    </div>
    <div class="pw-pd-info">
      <div class="pw-cat">${catName} · ${p.pieces}</div>
      <h1>${p.name}</h1>
      <div class="pw-pd-rate">${stars(p.rating)} <span>${p.rating} · ${p.reviews} opiniones</span></div>
      <p class="pw-pd-blurb">${p.desc || p.blurb}</p>
      <div class="pw-pd-buy">
        <a class="pw-pd-add" href="https://wa.me/${window.PW.SETTINGS.whatsapp}?text=${encodeURIComponent('¡Hola! Me interesa este producto: ' + p.name + ' (' + p.pieces + ')')}" target="_blank" style="text-decoration:none; display:flex; align-items:center; justify-content:center; flex:1;">
          ${icon('wa', 18, '#fff', '#fff', 0)} Consultar por WhatsApp
        </a>
        <button class="pw-pd-add-fav" data-fav="${p.id}" aria-label="Favorito" style="background:#fff;border:1.5px solid var(--steel-200);border-radius:13px;width:52px;height:52px;display:flex;align-items:center;justify-content:center;color:var(--navy-800);transition:.15s;flex-shrink:0;margin-left:8px;"></button>
      </div>
      <div class="pw-pd-meta">
        <div class="pw-pd-meta-row">${icon('truck', 18, '#1b4a8f')}<div><b>Envío a todo el país.</b> Consulte disponibilidad por zona.</div></div>
        <div class="pw-pd-meta-row">${icon('shield', 18, '#1b4a8f')}<div><b>Garantía de por vida.</b> Acero quirúrgico 18/8 que dura generaciones.</div></div>
        <div class="pw-pd-meta-row">${icon('leaf', 18, '#1b4a8f')}<div><b>Cero tóxicos.</b> Sin teflón ni PFOA. Cociná sin aceite ni agua.</div></div>
      </div>
    </div>`;

  if (window.PW.renderFavs) window.PW.renderFavs();

  // galería
  document.querySelectorAll('.pw-pd-thumb').forEach((t) => t.onclick = () => {
    document.getElementById('pwPdImg').src = t.dataset.g;
    document.querySelectorAll('.pw-pd-thumb').forEach((x) => x.classList.remove('on'));
    t.classList.add('on');
  });

  // especificaciones
  if (p.specs) {
    const labels = { material: 'Material', apto: 'Apto para', incluye: 'Incluye', garantia: 'Garantía' };
    document.getElementById('pwSpecs').innerHTML = Object.keys(p.specs).map((k) => `
      <div class="pw-spec-card"><h4>${labels[k] || k}</h4><p>${p.specs[k]}</p></div>`).join('');
  }

  // relacionados (misma categoría, sin el actual)
  const rel = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).concat(PRODUCTS.filter((x) => x.cat !== p.cat)).slice(0, 4);
  document.getElementById('pwRelated').innerHTML = rel.map((x) => productCardHTML(x)).join('');
})();
