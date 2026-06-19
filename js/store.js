/* store.js — carrito y favoritos compartido con persistencia segura (localStorage + fallback en memoria) */
(function () {
  const KEY = 'pw_cart_v1';
  const FAV_KEY = 'pw_fav_v1';
  let mem = [];                 // respaldo en memoria si no hay localStorage
  let favMem = [];
  const subs = [];

  const SKU_MAPPING = {
    'p1': 'PW-SET-FAM-18',
    'p2': 'PW-SET-ESE-09',
    'p3': 'PW-SET-DUO-06',
    'p4': 'PW-OLL-PRO-24',
    'p5': 'PW-CAC-TAP-20',
    'p6': 'PW-SAR-ASA-28',
    'p7': 'PW-BUD-VAP-MU',
    'p8': 'PW-OLL-FAM-28'
  };

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      const items = raw ? JSON.parse(raw) : mem;
      return (Array.isArray(items) ? items : []).map(i => {
        if (i && i.id && SKU_MAPPING[i.id]) {
          return { ...i, id: SKU_MAPPING[i.id] };
        }
        return i;
      });
    } catch (e) {
      return mem.map(i => {
        if (i && i.id && SKU_MAPPING[i.id]) {
          return { ...i, id: SKU_MAPPING[i.id] };
        }
        return i;
      });
    }
  }
  function write(items) {
    mem = items;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* sin persistencia */ }
    subs.forEach((fn) => fn(items));
  }

  function readFavs() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const items = raw ? JSON.parse(raw) : favMem;
      return (Array.isArray(items) ? items : []).map(id => SKU_MAPPING[id] || id);
    } catch (e) {
      return favMem.map(id => SKU_MAPPING[id] || id);
    }
  }
  const favSubs = [];
  function writeFavs(items) {
    favMem = items;
    try { localStorage.setItem(FAV_KEY, JSON.stringify(items)); } catch (e) {}
    favSubs.forEach((fn) => fn(items));
  }

  const Cart = {
    items: () => read(),
    count: () => read().reduce((s, i) => s + i.qty, 0),
    subtotal: () => read().reduce((s, i) => s + i.price * i.qty, 0),
    add(product, qty = 1, customPrice = null) {
      const items = read();
      const e = items.find((i) => i.id === product.id);
      const priceToUse = customPrice !== null ? Number(customPrice) : product.price;
      if (e) {
        e.qty += qty;
        if (customPrice !== null) e.price = priceToUse;
      }
      else items.push({ id: product.id, name: product.name, price: priceToUse, img: product.img, pieces: product.pieces, qty });
      write(items);
    },
    setQty(id, delta) {
      const items = read().map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
      write(items);
    },
    remove(id) { write(read().filter((i) => i.id !== id)); },
    clear() { write([]); },
    subscribe(fn) { subs.push(fn); return () => { const i = subs.indexOf(fn); if (i > -1) subs.splice(i, 1); }; },
  };

  const Favorites = {
    items: () => readFavs(),
    has: (id) => readFavs().includes(SKU_MAPPING[id] || id),
    toggle(id) {
      const items = readFavs();
      const mappedId = SKU_MAPPING[id] || id;
      const idx = items.indexOf(mappedId);
      if (idx > -1) {
        items.splice(idx, 1);
      } else {
        items.push(mappedId);
      }
      writeFavs(items);
      return idx === -1; // Devuelve true si fue agregado, false si fue removido
    },
    clear() { writeFavs([]); },
    subscribe(fn) { favSubs.push(fn); return () => { const i = favSubs.indexOf(fn); if (i > -1) favSubs.splice(i, 1); }; }
  };

  window.PW = window.PW || {};
  window.PW.Cart = Cart;
  window.PW.Favorites = Favorites;
})();
