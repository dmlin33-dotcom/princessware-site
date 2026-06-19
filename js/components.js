/* components.js — chrome compartido: header, footer, favoritos, toast, nav móvil, WhatsApp */
(function () {
  const { CATEGORIES, PRODUCTS, SETTINGS, Favorites } = window.PW;

  /* ---------- iconos (línea simple) ---------- */
  const PATHS = {
    search: '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    heart: '<path d="M12 20s-7-4.6-9.3-9.1C1.3 8 2.6 4.8 5.8 4.8c2 0 3.2 1.3 4.2 2.6 1-1.3 2.2-2.6 4.2-2.6 3.2 0 4.5 3.2 3.1 6.1C19 15.4 12 20 12 20z"/>',
    close: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z"/>',
    truck: '<rect x="1" y="6" width="13" height="10" rx="1"/><path d="M14 9h4l3 3v4h-7z"/><circle cx="6" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    leaf: '<path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14-1 0-1-1-1-1z"/><path d="M5 19c3-4 6-6 10-7.5"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    oil: '<circle cx="12" cy="12" r="8.5"/><line x1="6" y1="6" x2="18" y2="18"/>',
    tox: '<path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"/><path d="M9.5 12.5l1.7 1.7L15 10"/>',
    life: '<circle cx="8" cy="12" r="3.4"/><circle cx="16" cy="12" r="3.4"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    wa: '<path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c.6.3 1.1.4 1.5.5a3.6 3.6 0 0 0 1.6.1c.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1z"/>',
  };
  function icon(name, size = 20, color = 'currentColor', fill = 'none', stroke = 1.6) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${PATHS[name] || ''}</svg>`;
  }
  function stars(value) {
    return '<span style="display:inline-flex;gap:1.5px;color:#c79a3a">' +
      [0, 1, 2, 3, 4].map((i) => {
        const op = value >= i + 0.7 ? 1 : value >= i + 0.2 ? 0.55 : 0.22;
        return `<span style="opacity:${op}">${icon('star', 13, '#c79a3a', '#c79a3a')}</span>`;
      }).join('') + '</span>';
  }

  const NAV = [
    { n: 'Inicio', href: 'index.html', key: 'home' },
    { n: 'Catálogo', href: 'tienda.html', key: 'tienda' },
    { n: 'El Acero 18/8', href: 'acero-18-8.html', key: 'acero' },
    { n: 'Recetas', href: 'recetas.html', key: 'recetas' },
    { n: 'Nosotros', href: 'nosotros.html', key: 'nosotros' },
    { n: 'Contacto', href: 'contacto.html', key: 'contacto' },
  ];
  const active = document.body.getAttribute('data-page') || '';

  /* ---------- announce ---------- */
  const ANN = ['Envíos a todo el país', 'Garantía de por vida en acero quirúrgico 18/8', 'Cociná sin aceite ni agua · Acero 18/8'];

  /* ---------- inyectar chrome superior ---------- */
  const top = document.createElement('div');
  top.innerHTML = `
    <div class="pw-announce">${icon('truck', 14, '#bcd0ea')} <span class="pw-announce-txt" id="pwAnn">${ANN[0]}</span></div>
    <header class="pw-head" id="pwHead">
      <div class="pw-head-in">
        <a class="pw-logo" href="index.html" aria-label="Princessware inicio">
          <div class="pw-logo-chip"><img src="assets/logo-clean.png" alt="Princessware"/></div>
          <div class="pw-logo-tx">PRINCESSWARE<small>Acero Quirúrgico 18/8</small></div>
        </a>
        <nav class="pw-nav">${NAV.map((l) => `<a href="${l.href}" class="${l.key === active ? 'active' : ''}">${l.n}</a>`).join('')}</nav>
        <div class="pw-actions">
          <button aria-label="Buscar" id="pwSearchBtn">${icon('search', 20)}</button>
          <button aria-label="Cuenta" class="pw-hide-sm">${icon('user', 20)}</button>
          <button aria-label="Favoritos" class="pw-favs-btn" id="pwFavsBtn">${icon('heart', 20)}<span class="pw-count pw-favs-count" id="pwFavsCount" style="display:none">0</span></button>
          <button aria-label="Menú" class="pw-burger" id="pwBurger">${icon('menu', 22)}</button>
        </div>
      </div>
    </header>
    <div class="pw-mnav" id="pwMnav">
      <div class="pw-mnav-h"><button aria-label="Cerrar" id="pwMnavClose">${icon('close', 22, '#0e2a52')}</button></div>
      ${NAV.map((l) => `<a href="${l.href}">${l.n}</a>`).join('')}
    </div>`;
  document.body.insertBefore(top, document.body.firstChild);

  /* ---------- footer + favoritos + toast + whatsapp ---------- */
  const cols = [
    { h: 'Catálogo', l: [['Sets completos', 'tienda.html?cat=sets'], ['Ollas & cacerolas', 'tienda.html?cat=ollas'], ['Sartenes', 'tienda.html?cat=sartenes'], ['Cocción al vapor', 'tienda.html?cat=vapor']] },
    { h: 'Ayuda', l: [['Envíos', 'contacto.html'], ['Garantía de por vida', 'acero-18-8.html'], ['Cómo cuidar el acero', 'acero-18-8.html'], ['Contacto', 'contacto.html']] },
    { h: 'Nosotros', l: [['Nuestra historia', 'nosotros.html'], ['El acero 18/8', 'acero-18-8.html'], ['Recetas', 'recetas.html'], ['Mayoristas', 'contacto.html']] },
  ];
  const bottom = document.createElement('div');
  bottom.innerHTML = `
    <footer class="pw-foot">
      <div class="pw-foot-top">
        <div class="pw-foot-brand">
          <div class="pw-logo-chip lg"><img src="assets/logo-clean.png" alt="Princessware"/></div>
          <p>Acero quirúrgico 18/8 para cocinar sano, conservar nutrientes y cuidar a tu familia. Una inversión para toda la vida.</p>
          <div class="pw-foot-social">@${SETTINGS.instagram}</div>
        </div>
        ${cols.map((c) => `<div class="pw-foot-col"><h4>${c.h}</h4>${c.l.map((x) => `<a href="${x[1]}">${x[0]}</a>`).join('')}</div>`).join('')}
      </div>
      <div class="pw-foot-bar">
        <span>© ${new Date().getFullYear()} Princessware · Acero Quirúrgico 18/8</span>
        <span class="pw-pay">${icon('shield', 14, '#8aa6cb')} Garantía de por vida · Acero quirúrgico 18/8</span>
      </div>
    </footer>
    <div class="pw-scrim" id="pwScrim"></div>
    <aside class="pw-favs-drawer" id="pwFavsDrawer" aria-hidden="true">
      <header class="pw-favs-h"><span id="pwFavsTitle">Mis Favoritos (0)</span><button aria-label="Cerrar" id="pwFavsClose">${icon('close', 20, '#0e2a52')}</button></header>
      <div class="pw-favs-items" id="pwFavsItems"></div>
    </aside>
    <div class="pw-toast" id="pwToast"></div>
    <a class="pw-wa" href="https://wa.me/${SETTINGS.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('wa', 30, '#fff', '#fff', 0)}</a>
    <div class="pw-search-overlay" id="pwSearchOverlay" aria-hidden="true">
      <div class="pw-search-box">
        <div class="pw-search-input-row">
          ${icon('search', 20, '#94a3b8')}
          <input type="search" id="pwSearchInput" placeholder="Buscar productos…" autocomplete="off" autocorrect="off"/>
          <button id="pwSearchClose" aria-label="Cerrar">${icon('close', 20, '#64748b')}</button>
        </div>
        <div class="pw-search-results" id="pwSearchResults"></div>
      </div>
    </div>`;
  document.body.appendChild(bottom);

  /* ---------- comportamiento ---------- */
  const $ = (id) => document.getElementById(id);

  // announce rotativo
  let ai = 0;
  setInterval(() => { ai = (ai + 1) % ANN.length; const el = $('pwAnn'); el.textContent = ANN[ai]; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = 'fade .5s ease'; }, 3500);

  // header sólido al scrollear
  const head = $('pwHead');
  const onScroll = () => head.classList.toggle('solid', window.scrollY > 20);
  onScroll(); window.addEventListener('scroll', onScroll);

  // nav móvil
  const mnav = $('pwMnav');
  $('pwBurger').onclick = () => mnav.classList.add('open');
  $('pwMnavClose').onclick = () => mnav.classList.remove('open');

  // drawer de favoritos
  const favsEl = $('pwFavsDrawer'), scrim = $('pwScrim');
  // ID de sesión anónima para tracking
  let _anonSessionId = null;
  try { _anonSessionId = sessionStorage.getItem('pw_sid') || (Date.now() + '-' + Math.random().toString(36).slice(2)); sessionStorage.setItem('pw_sid', _anonSessionId); } catch(e) {}

  function trackAnonInterest(favIds) {
    if (!favIds.length) return;
    // Solo si no hay usuario logueado (auth.js lo detecta vía cookie, pero aquí usamos flag global)
    if (window.PW._userLoggedIn) return;
    fetch('/api/interest', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: favIds, sessionId: _anonSessionId })
    }).catch(() => {});
  }

  function openFavs() { favsEl.classList.add('open'); scrim.classList.add('show'); favsEl.setAttribute('aria-hidden', 'false'); }
  function closeFavs() { favsEl.classList.remove('open'); scrim.classList.remove('show'); favsEl.setAttribute('aria-hidden', 'true'); }
  $('pwFavsBtn').onclick = openFavs;
  $('pwFavsClose').onclick = closeFavs;

  scrim.onclick = () => { closeFavs(); mnav.classList.remove('open'); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeFavs(); mnav.classList.remove('open'); closeSearch && closeSearch(); } });

  // estilos de búsqueda
  const searchStyle = document.createElement('style');
  searchStyle.innerHTML = `
    .pw-search-overlay {
      position: fixed; inset: 0; background: rgba(8,13,22,.7);
      backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
      z-index: 12000; display: flex; align-items: flex-start; justify-content: center;
      padding: 80px 16px 16px; opacity: 0; pointer-events: none;
      transition: opacity .2s;
    }
    .pw-search-overlay.open { opacity: 1; pointer-events: all; }
    .pw-search-box {
      background: #fff; border-radius: 14px; width: 100%; max-width: 600px;
      box-shadow: 0 20px 60px rgba(0,0,0,.3); overflow: hidden;
      transform: translateY(-12px); transition: transform .2s;
    }
    .pw-search-overlay.open .pw-search-box { transform: none; }
    .pw-search-input-row {
      display: flex; align-items: center; gap: 10px; padding: 14px 18px;
      border-bottom: 1px solid #f1f5f9;
    }
    .pw-search-input-row svg { flex-shrink: 0; }
    #pwSearchInput {
      flex: 1; border: none; outline: none; font-family: 'Montserrat', sans-serif;
      font-size: 1rem; color: #0e2a52; background: transparent;
    }
    #pwSearchInput::placeholder { color: #94a3b8; }
    #pwSearchClose { background: none; border: none; cursor: pointer; padding: 2px; display: flex; }
    .pw-search-results { max-height: 420px; overflow-y: auto; }
    .pw-search-empty {
      padding: 32px; text-align: center; font-family: 'Montserrat', sans-serif;
      font-size: .85rem; color: #94a3b8;
    }
    .pw-search-item {
      display: flex; align-items: center; gap: 14px; padding: 12px 18px;
      text-decoration: none; color: #0e2a52; transition: background .15s;
      border-bottom: 1px solid #f8fafc;
    }
    .pw-search-item:hover { background: #f8fafc; }
    .pw-search-item img { width: 54px; height: 54px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
    .pw-search-item-info { flex: 1; min-width: 0; }
    .pw-search-item-cat { font-family: 'Montserrat', sans-serif; font-size: .68rem; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; }
    .pw-search-item-name { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pw-search-item-blurb { font-family: 'Montserrat', sans-serif; font-size: .75rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pw-search-item-arrow { color: #94a3b8; flex-shrink: 0; }
    .pw-search-hint { padding: 20px 18px; }
    .pw-search-hint p { font-family: 'Montserrat', sans-serif; font-size: .75rem; color: #94a3b8; margin: 0 0 10px; text-transform: uppercase; letter-spacing: .5px; }
    .pw-search-cats { display: flex; flex-wrap: wrap; gap: 8px; }
    .pw-search-cat { padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e2e8f0; font-family: 'Montserrat', sans-serif; font-size: .75rem; color: #0e2a52; text-decoration: none; transition: .15s; }
    .pw-search-cat:hover { border-color: #0e2a52; background: #0e2a52; color: #fff; }
  `;
  document.head.appendChild(searchStyle);

  // lógica de búsqueda
  const searchOverlay = $('pwSearchOverlay');
  const searchInput = $('pwSearchInput');
  const searchResults = $('pwSearchResults');

  function openSearch() {
    searchOverlay.classList.add('open');
    searchOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => searchInput.focus(), 50);
    renderSearchHint();
  }
  function closeSearch() {
    searchOverlay.classList.remove('open');
    searchOverlay.setAttribute('aria-hidden', 'true');
    searchInput.value = '';
  }

  $('pwSearchBtn').onclick = openSearch;
  $('pwSearchClose').onclick = closeSearch;
  searchOverlay.onclick = e => { if (e.target === searchOverlay) closeSearch(); };

  function renderSearchHint() {
    const quickLinks = [
      { label: 'Sets Completos', href: 'tienda.html?cat=sets' },
      { label: 'Ollas & Cacerolas', href: 'tienda.html?cat=ollas' },
      { label: 'Sartenes', href: 'tienda.html?cat=sartenes' },
      { label: 'Recetas', href: 'recetas.html' },
    ];
    searchResults.innerHTML = `
      <div class="pw-search-hint">
        <p>Accesos rápidos</p>
        <div class="pw-search-cats">
          ${quickLinks.map(l => `<a class="pw-search-cat" href="${l.href}">${l.label}</a>`).join('')}
        </div>
      </div>`;
  }

  function renderSearchMatches(q) {
    const term = q.toLowerCase().trim();
    const matches = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.blurb || '').toLowerCase().includes(term) ||
      (p.desc || '').toLowerCase().includes(term) ||
      (p.pieces || '').toLowerCase().includes(term)
    ).slice(0, 8);

    if (!matches.length) {
      searchResults.innerHTML = `<div class="pw-search-empty">Sin resultados para "<strong>${q}</strong>"</div>`;
      return;
    }
    searchResults.innerHTML = matches.map(p => {
      const catName = (CATEGORIES.find(c => c.id === p.cat) || {}).name || '';
      return `<a class="pw-search-item" href="producto.html?id=${p.id}">
        <img src="${p.img}" alt="${p.name}"/>
        <div class="pw-search-item-info">
          <div class="pw-search-item-cat">${catName} · ${p.pieces}</div>
          <div class="pw-search-item-name">${p.name}</div>
          <div class="pw-search-item-blurb">${p.blurb || ''}</div>
        </div>
        <span class="pw-search-item-arrow">${icon('chev', 16, '#94a3b8')}</span>
      </a>`;
    }).join('');
  }

  searchInput.oninput = () => {
    const q = searchInput.value.trim();
    if (q.length < 2) { renderSearchHint(); return; }
    renderSearchMatches(q);
  };

  searchInput.onkeydown = e => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) window.location = `tienda.html?q=${encodeURIComponent(q)}`;
    }
  };

  // toast
  let tt;
  function toast(msg) { const el = $('pwToast'); el.innerHTML = icon('check', 16, '#fff') + ' ' + msg; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 2200); }

  /* ---------- tarjeta de producto (reutilizable) ---------- */
  function productCardHTML(p, showRatings = true) {
    const catName = (CATEGORIES.find((c) => c.id === p.cat) || {}).name || '';
    const badge = p.badge && p.badge !== 'Oferta' ? `<span class="pw-badge ${p.badge === 'Nuevo' ? 'is-new' : ''}">${p.badge}</span>` : '';
    const isFav = Favorites.has(p.id);
    const favClass = isFav ? 'pw-fav on' : 'pw-fav';
    const favIconColor = isFav ? '#c0392b' : '#0e2a52';
    const favIconFill = isFav ? '#c0392b' : 'none';
    return `
      <article class="pw-card">
        <div class="pw-card-img">
          <a class="pw-card-link" href="producto.html?id=${p.id}" aria-label="${p.name}"></a>
          <img src="${p.img}" alt="${p.name}" loading="lazy"/>
          ${badge}
          <button class="${favClass}" data-fav="${p.id}" aria-label="Favorito">${icon('heart', 17, favIconColor, favIconFill)}</button>
          <a class="pw-quick" href="producto.html?id=${p.id}" style="text-decoration:none; display:flex; align-items:center; justify-content:center;">${icon('chev', 15, '#fff')} Ver Detalles</a>
        </div>
        <div class="pw-card-body">
          <div class="pw-cat">${catName} · ${p.pieces}</div>
          <h3 class="pw-name"><a href="producto.html?id=${p.id}">${p.name}</a></h3>
          ${showRatings ? `<div class="pw-rate">${stars(p.rating)}<span>${p.rating} · ${p.reviews}</span></div>` : ''}
          <p class="pw-blurb">${p.blurb}</p>
        </div>
      </article>`;
  }

  /* ---------- render favoritos drawer ---------- */
  function renderFavs() {
    const favIds = Favorites.items().map(String);
    const count = favIds.length;
    const items = PRODUCTS.filter(p => favIds.includes(String(p.id)));

    const fc = $('pwFavsCount');
    if (fc) { fc.textContent = count; fc.style.display = count > 0 ? 'flex' : 'none'; }
    const ft = $('pwFavsTitle');
    if (ft) { ft.textContent = `Mis Favoritos (${count})`; }

    const fItems = $('pwFavsItems');
    if (fItems) {
      fItems.innerHTML = items.length === 0
        ? '<div class="pw-empty">No tenés favoritos guardados.<br/>¡Explorá el catálogo y agregá los que te gusten! 🤍</div>'
        : items.map((i) => `
          <div class="pw-line">
            <img src="${i.img}" alt="${i.name}"/>
            <div class="pw-line-mid">
              <div class="pw-line-name">${i.name}</div>
              <div class="pw-line-sub">${i.pieces}</div>
              <a class="btn-fav-add-cart" href="producto.html?id=${i.id}" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">${icon('chev', 13, '#fff')} Ver Detalles</a>
            </div>
            <div class="pw-line-right">
              <button class="pw-rm-fav" data-rm-fav="${i.id}">Quitar</button>
            </div>
          </div>`).join('') + (items.length ? `
          <div style="padding:16px 15px; border-top:1px solid #f1f5f9;">
            <button id="pwFavsWaBtn" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:#25d366;color:#fff;border:none;border-radius:10px;font-family:var(--sans);font-size:.83rem;font-weight:700;cursor:pointer;transition:.2s;">
              ${icon('wa', 18, '#fff', '#fff', 0)} Consultar todo por WhatsApp
            </button>
          </div>` : '');

      fItems.querySelectorAll('[data-rm-fav]').forEach((b) => b.onclick = () => {
        Favorites.toggle(b.dataset.rmFav);
      });

      // Botón WhatsApp grupal
      const waBtn = document.getElementById('pwFavsWaBtn');
      if (waBtn) {
        waBtn.onclick = () => {
          const lines = items.map(i => `• ${i.name} (${i.pieces})`).join('\n');
          const msg = encodeURIComponent(`¡Hola Princessware! Me interesan estos productos 🤍\n\n${lines}\n\n¿Podría darme más información?`);
          window.open(`https://wa.me/${SETTINGS.whatsapp}?text=${msg}`, '_blank');
        };
      }
    }

    // Sincronizar corazones en pantalla
    document.querySelectorAll('[data-fav]').forEach((btn) => {
      const id = btn.dataset.fav;
      const isFav = favIds.includes(id);
      btn.classList.toggle('on', isFav);
      const size = btn.classList.contains('pw-fav') ? 17 : 20;
      btn.innerHTML = icon('heart', size, isFav ? '#c0392b' : '#0e2a52', isFav ? '#c0392b' : 'none');
    });
  }
  Favorites.subscribe(favIds => { renderFavs(); trackAnonInterest(favIds); });
  renderFavs();

  // delegación: favoritos desde cualquier grilla
  document.addEventListener('click', (e) => {
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      const pId = fav.dataset.fav;
      const isAdded = Favorites.toggle(pId);
      toast(isAdded ? 'Agregado a tus favoritos 🤍' : 'Quitado de favoritos');
    }
  });

  window.PW.icon = icon;
  window.PW.stars = stars;
  window.PW.productCardHTML = productCardHTML;
  window.PW.toast = toast;
  window.PW.renderFavs = renderFavs;
})();
