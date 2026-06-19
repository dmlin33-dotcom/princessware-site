/* Lógica de Control del Panel de Administración de Princessware */

// Estado Global de la Aplicación
const state = {
  user: null,
  activeTab: 'dashboard',
  categories: [],
  products: [],
  recipes: [],
  benefits: [],
  orders: [],
  leads: [],
  users: [],
  settings: {},
  // Estados de edición actuales
  editingCategoryId: null,
  editingProductId: null,
  editingRecipeIndex: null,
  tempProductGallery: [] // Guarda rutas de imágenes de galería del producto siendo editado/creado
};

// Instancias de Gráficos de Chart.js
let salesChartInstance = null;
let categoriesChartInstance = null;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// --- AUTENTICACIÓN ---
function checkAuth() {
  fetch('/api/auth/verify')
    .then(res => res.json())
    .then(data => {
      if (data.authenticated) {
        state.user = data.username;
        document.getElementById('user-display').textContent = state.user;
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('admin-container').classList.remove('hidden');
        loadAllData();
      } else {
        document.getElementById('login-container').classList.remove('hidden');
        document.getElementById('admin-container').classList.add('hidden');
      }
    })
    .catch(err => {
      console.error('Error verificando sesión:', err);
      showToast('Error al conectar con el servidor.', 'error');
    });
}

function handleLogin(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('username').value;
  const passwordInput = document.getElementById('password').value;
  const errorAlert = document.getElementById('login-error');

  errorAlert.classList.add('hidden');

  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usernameInput, password: passwordInput })
  })
    .then(res => {
      if (res.ok) return res.json();
      return res.json().then(data => { throw new Error(data.error || 'Credenciales incorrectas'); });
    })
    .then(data => {
      showToast('¡Sesión iniciada con éxito!', 'success');
      checkAuth();
    })
    .catch(err => {
      errorAlert.textContent = err.message;
      errorAlert.classList.remove('hidden');
    });
}

function handleLogout() {
  fetch('/api/auth/logout', { method: 'POST' })
    .then(res => res.json())
    .then(() => {
      state.user = null;
      document.getElementById('login-container').classList.remove('hidden');
      document.getElementById('admin-container').classList.add('hidden');
      showToast('Sesión cerrada.', 'success');
    })
    .catch(err => {
      console.error('Error cerrando sesión:', err);
      showToast('Error al cerrar sesión.', 'error');
    });
}

// --- CARGA DE DATOS DESDE LA API ---
function loadAllData() {
  Promise.all([
    fetch('/api/categories').then(res => res.json()),
    fetch('/api/products').then(res => res.json()),
    fetch('/api/recipes').then(res => res.json()),
    fetch('/api/benefits').then(res => res.json()),
    fetch('/api/settings').then(res => res.json()),
    fetch('/api/orders').then(res => res.json()).catch(() => []), // Fallback vacío si falla o es viejo
    fetch('/api/leads').then(res => res.json()).catch(() => []), // Colección de prospectos
    fetch('/api/users').then(res => res.json()).catch(() => []),   // Usuarios registrados
    fetch('/api/interest').then(res => res.json()).catch(() => []) // Intereses anónimos
  ])
    .then(([categories, products, recipes, benefits, settings, orders, leads, users, interests]) => {
      state.categories = categories;
      state.products = products;
      state.recipes = recipes;
      state.benefits = benefits;
      state.settings = settings;
      state.orders = orders;
      state.leads = leads;
      state.users = users;
      state.interests = interests;

      renderDashboardStats();
      renderDashboardCharts();
      renderCategoriesTable();
      renderProductsTable();
      renderRecipesTable();
      renderBenefitsGrid();
      renderOrdersTable();
      renderLeadsTable();
      renderUsersTable();
      renderInterestsTable();
      populateSettingsForm();
      populateDropdowns();
    })
    .catch(err => {
      console.error('Error cargando datos del catálogo:', err);
      showToast('Error al cargar la información del catálogo.', 'error');
    });
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Login & Logout
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('btn-logout').addEventListener('click', handleLogout);

  // Navegación por pestañas
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const targetTab = btn.getAttribute('data-target');
      switchTab(targetTab);
    });
  });

  // Guardar configuración
  document.getElementById('settings-form').addEventListener('submit', handleSaveSettings);

  // Filtro de productos y pedidos
  document.getElementById('filter-prod-cat').addEventListener('change', renderProductsTable);
  document.getElementById('filter-order-status').addEventListener('change', renderOrdersTable);

  // Modals — Abrir para nuevo elemento
  document.getElementById('btn-add-cat').addEventListener('click', () => openCategoryModal());
  document.getElementById('btn-add-product').addEventListener('click', () => openProductModal());
  document.getElementById('btn-add-recipe').addEventListener('click', () => openRecipeModal());

  // Modals — Cerrar y cancelar
  const closeButtons = document.querySelectorAll('.modal-close, .modal-cancel');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Modals — Submit de formularios
  document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);
  document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
  document.getElementById('recipe-form').addEventListener('submit', handleRecipeSubmit);

  // Selector de etiquetas destacadas
  const badgeSelect = document.getElementById('prod-badge-select');
  const badgeInput = document.getElementById('prod-badge');
  badgeSelect.addEventListener('change', () => {
    if (badgeSelect.value === 'custom') {
      badgeInput.classList.remove('hidden');
      badgeInput.required = true;
      badgeInput.focus();
    } else {
      badgeInput.classList.add('hidden');
      badgeInput.required = false;
      badgeInput.value = badgeSelect.value;
    }
  });

  // Generador de SKU automático
  document.getElementById('btn-gen-sku').addEventListener('click', generateSkuSugerido);

  // Cerrar Lightbox haciendo clic en la cruz o fuera de la imagen
  const lightboxModal = document.getElementById('modal-lightbox');
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal || e.target.classList.contains('modal-close')) {
      lightboxModal.classList.add('hidden');
    }
  });

  // Zoom al hacer clic en las previsualizaciones de carga
  document.getElementById('cat-preview-img').addEventListener('click', function() {
    openLightbox(this.src, 'Previsualización de Portada de Categoría');
  });
  document.getElementById('prod-preview-img').addEventListener('click', function() {
    openLightbox(this.src, 'Previsualización de Imagen Principal de Producto');
  });
  document.getElementById('rec-preview-img').addEventListener('click', function() {
    openLightbox(this.src, 'Previsualización de Receta');
  });

  // Subida de imágenes - Inputs change events
  setupImageUploadEvents();
}

function switchTab(tabId) {
  state.activeTab = tabId;
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabPanels.forEach(panel => panel.classList.remove('active'));
  
  const targetPanel = document.getElementById(`tab-${tabId}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }
}

// --- GENERADOR DE SKU ---
function generateSkuSugerido() {
  const name = document.getElementById('prod-name').value.trim();
  const cat = document.getElementById('prod-cat').value;
  const pieces = document.getElementById('prod-pieces').value.trim();

  if (!name || !cat) {
    showToast('Ingresá el nombre y categoría para sugerir un SKU.', 'error');
    return;
  }

  // PW + CATEGORIA (3 letras) + NOMBRE CORTO + PIEZAS
  const prefix = 'PW';
  const catCode = cat.substring(0, 3).toUpperCase();
  
  // Limpiar nombre: quitar acentos, espacios duplicados y marca
  const nameClean = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/PRINCESSWARE/g, '')
    .replace(/[^A-Z0-9 ]/g, '')
    .trim();
  
  const nameWords = nameClean.split(' ').filter(w => w.length > 0);
  let nameCode = '';
  if (nameWords.length >= 2) {
    nameCode = (nameWords[0].substring(0, 3) + '-' + nameWords[1].substring(0, 3));
  } else if (nameWords.length === 1) {
    nameCode = nameWords[0].substring(0, 5);
  } else {
    nameCode = 'PROD';
  }

  // Obtener números de la medida/piezas
  const piecesNum = pieces.toUpperCase().replace(/[^0-9]/g, '');
  const piecesCode = piecesNum ? `-${piecesNum}` : '';

  const sku = `${prefix}-${catCode}-${nameCode}${piecesCode}`.replace(/--/g, '-').replace(/-$/, '');
  document.getElementById('prod-id').value = sku;
  showToast('SKU sugerido generado.', 'success');
}

// --- VISOR LIGHTBOX ---
window.openLightbox = function(src, caption = '') {
  const modal = document.getElementById('modal-lightbox');
  const img = document.getElementById('lightbox-img');
  const captionEl = document.getElementById('lightbox-caption');

  img.src = src;
  captionEl.textContent = caption;
  modal.classList.remove('hidden');
};

// --- RENDERIZADO DE GRÁFICOS VISUALES (CHART.JS) ---
function renderDashboardCharts() {
  // 1. Destruir instancias previas si existen
  if (salesChartInstance) salesChartInstance.destroy();
  if (categoriesChartInstance) categoriesChartInstance.destroy();

  // 2. Gráfico Doughnut: Distribución de Productos por Categoría
  const catCounts = {};
  state.categories.forEach(c => {
    catCounts[c.id] = 0;
  });
  state.products.forEach(p => {
    if (catCounts[p.cat] !== undefined) {
      catCounts[p.cat]++;
    }
  });

  const catLabels = state.categories.map(c => c.name);
  const catData = state.categories.map(c => catCounts[c.id]);

  const ctxCat = document.getElementById('categoriesChart').getContext('2d');
  categoriesChartInstance = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: catLabels,
      datasets: [{
        data: catData,
        backgroundColor: [
          '#0E2A52', // Azul Princess
          '#1B4A8F', // Azul Royal
          '#cfd9df', // Acero / Plata
          '#16233A'  // Grafito
        ],
        borderColor: 'rgba(226, 235, 240, 0.1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#F6F7F9',
            font: { family: 'Montserrat', size: 10 }
          }
        }
      }
    }
  });

  // 3. Gráfico Combinado (Línea + Barra): Pedidos y Ventas
  const dates = [];
  const orderCounts = [];
  const salesAmounts = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    dates.push(dateStr);

    // Filtrar pedidos de la base de datos para este día
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    
    const dayOrders = state.orders.filter(o => {
      const oTime = new Date(o.date).getTime();
      return oTime >= dayStart && oTime < dayEnd;
    });

    let count = dayOrders.length;
    let sum = dayOrders.reduce((s, o) => s + o.total, 0);

    // Mock data premium si el sistema no tiene pedidos registrados para mostrar visuales atractivas
    if (state.orders.length === 0) {
      const mockCounts = [2, 3, 1, 4, 2, 5, 3];
      const mockSales = [1290000, 2380000, 790000, 3120000, 1560000, 4360000, 2680000];
      count = mockCounts[6 - i];
      sum = mockSales[6 - i];
    }

    orderCounts.push(count);
    salesAmounts.push(sum / 1000000); // Expresado en millones de pesos para facilitar la visual
  }

  const ctxSales = document.getElementById('salesChart').getContext('2d');
  salesChartInstance = new Chart(ctxSales, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Monto total (en millones de $)',
          data: salesAmounts,
          borderColor: '#cfd9df', // Color Acero/Plata
          backgroundColor: 'rgba(207, 217, 223, 0.08)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          yAxisID: 'ySales'
        },
        {
          label: 'Cantidad de Pedidos',
          data: orderCounts,
          type: 'bar',
          backgroundColor: 'rgba(27, 74, 143, 0.65)', // Azul Royal
          borderColor: '#1B4A8F',
          borderWidth: 1,
          yAxisID: 'yCount',
          barPercentage: 0.55
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: 'rgba(226, 235, 240, 0.05)' },
          ticks: { color: '#a0aec0', font: { family: 'Montserrat', size: 9 } }
        },
        ySales: {
          position: 'left',
          grid: { color: 'rgba(226, 235, 240, 0.05)' },
          ticks: {
            color: '#cfd9df',
            font: { family: 'Montserrat', size: 9 },
            callback: function(value) { return '$' + value + 'M'; }
          },
          title: {
            display: true,
            text: 'Ventas (Millones)',
            color: '#cfd9df',
            font: { family: 'Montserrat', size: 9, weight: 600 }
          }
        },
        yCount: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#93c5fd', font: { family: 'Montserrat', size: 9 }, stepSize: 1 },
          title: {
            display: true,
            text: 'Cantidad de Pedidos',
            color: '#93c5fd',
            font: { family: 'Montserrat', size: 9, weight: 600 }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#F6F7F9',
            font: { family: 'Montserrat', size: 10 }
          }
        }
      }
    }
  });
}

// --- RENDERIZADO DE VISTAS ---

// 1. Dashboard
function renderDashboardStats() {
  document.getElementById('stat-products').textContent = state.products.length;
  document.getElementById('stat-categories').textContent = state.categories.length;
  document.getElementById('stat-recipes').textContent = state.recipes.length;
  document.getElementById('stat-orders').textContent = state.orders.length;
  const suEl = document.getElementById('stat-users');
  if (suEl) suEl.textContent = (state.users || []).length;
}

// 2. Tabla de Categorías
function renderCategoriesTable() {
  const tbody = document.getElementById('categories-table-body');
  tbody.innerHTML = '';

  state.categories.forEach(cat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="../${cat.img}" alt="${cat.name}" class="table-img" onclick="openLightbox('../${cat.img}', '${cat.name}')" onerror="this.src='../assets/logo-clean.png'"></td>
      <td><code>${cat.id}</code></td>
      <td><strong>${cat.name}</strong></td>
      <td>${cat.desc}</td>
      <td>
        <div class="table-actions">
          <button class="btn-action btn-edit" onclick="openCategoryModal('${cat.id}')">Editar</button>
          <button class="btn-action btn-delete" onclick="handleDeleteCategory('${cat.id}')">Borrar</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 3. Tabla de Productos
function renderProductsTable() {
  const tbody = document.getElementById('products-table-body');
  tbody.innerHTML = '';

  const filterCategory = document.getElementById('filter-prod-cat').value;
  
  const filteredProducts = filterCategory === 'all'
    ? state.products
    : state.products.filter(p => p.cat === filterCategory);

  filteredProducts.forEach(p => {
    const tr = document.createElement('tr');
    const badgeText = p.badge ? `<span class="badge badge-metal">${p.badge}</span>` : '<span class="badge-empty">Ninguna</span>';
    
    // Formatear precio pesos AR
    const priceFormatted = '$' + Number(p.price).toLocaleString('es-AR');

    tr.innerHTML = `
      <td><img src="../${p.img}" alt="${p.name}" class="table-img" onclick="openLightbox('../${p.img}', '${p.name}')" onerror="this.src='../assets/logo-clean.png'"></td>
      <td><code>${p.id}</code></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.pieces}</td>
      <td><span class="badge badge-blue">${p.cat}</span></td>
      <td><strong>${priceFormatted}</strong></td>
      <td>${badgeText}</td>
      <td>
        <div class="table-actions">
          <button class="btn-action btn-edit" onclick="openProductModal('${p.id}')">Editar</button>
          <button class="btn-action btn-delete" onclick="handleDeleteProduct('${p.id}')">Borrar</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 4. Tabla de Recetas
function renderRecipesTable() {
  const tbody = document.getElementById('recipes-table-body');
  tbody.innerHTML = '';

  state.recipes.forEach((rec, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="../${rec.img}" alt="${rec.title}" class="table-img" onclick="openLightbox('../${rec.img}', '${rec.title}')" onerror="this.src='../assets/logo-clean.png'"></td>
      <td><span class="badge badge-metal">${rec.tag}</span></td>
      <td><strong>${rec.title}</strong></td>
      <td>${rec.time}</td>
      <td><span class="badge badge-blue">${rec.level}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-action btn-edit" onclick="openRecipeModal(${idx})">Editar</button>
          <button class="btn-action btn-delete" onclick="handleDeleteRecipe(${idx})">Borrar</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 5. Grid de Beneficios
function renderBenefitsGrid() {
  const container = document.getElementById('benefits-container');
  container.innerHTML = '';

  state.benefits.forEach(b => {
    const card = document.createElement('div');
    card.className = 'benefit-edit-card';
    card.innerHTML = `
      <h4>${b.title} <span>Clave: ${b.k}</span></h4>
      <form onsubmit="handleSaveBenefit(event, '${b.k}')">
        <div class="form-group">
          <label>Título destacado</label>
          <input type="text" id="ben-title-${b.k}" value="${b.title}" required>
        </div>
        <div class="form-group">
          <label>Descripción corta</label>
          <input type="text" id="ben-desc-${b.k}" value="${b.desc}" required>
        </div>
        <button type="submit" class="btn-metal">Guardar Pilar</button>
      </form>
    `;
    container.appendChild(card);
  });
}

// 6. Carga de Pedidos (CRM)
function renderOrdersTable() {
  const tbody = document.getElementById('orders-table-body');
  tbody.innerHTML = '';

  const filterStatus = document.getElementById('filter-order-status').value;
  const filteredOrders = filterStatus === 'all'
    ? state.orders
    : state.orders.filter(o => o.status === filterStatus);

  if (filteredOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#718096; padding:2rem;">No hay pedidos registrados en este estado.</td></tr>`;
    return;
  }

  filteredOrders.forEach(o => {
    const tr = document.createElement('tr');
    
    const dateObj = new Date(o.date);
    const dateFormatted = dateObj.toLocaleDateString('es-AR') + ' ' + dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    // Link WhatsApp
    const cleanPhone = o.clientPhone.replace(/[^0-9]/g, '');
    const waLink = o.clientPhone
      ? `<a href="https://wa.me/${cleanPhone}" target="_blank" rel="noopener" class="wa-link">💬 ${o.clientPhone}</a>`
      : '<span style="color:#718096">Sin especificar</span>';

    const totalFmt = '$' + Number(o.total).toLocaleString('es-AR');
    const statusClass = `status-${o.status.toLowerCase()}`;

    tr.innerHTML = `
      <td><strong>#${o.id}</strong></td>
      <td>${dateFormatted}</td>
      <td><strong>${o.clientName}</strong></td>
      <td>${waLink}</td>
      <td><strong>${totalFmt}</strong></td>
      <td>
        <select class="status-select ${statusClass}" onchange="handleChangeOrderStatus(event, ${o.id})">
          <option value="Pendiente" ${o.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="Enviado" ${o.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
          <option value="Entregado" ${o.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
          <option value="Cancelado" ${o.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-action btn-edit" onclick="openOrderDetailsModal(${o.id})">Ver Detalle</button>
          <button class="btn-action btn-delete" onclick="handleDeleteOrder(${o.id})">Borrar</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 6b. Tabla de Prospectos (Leads)
function renderLeadsTable() {
  const tbody = document.getElementById('leads-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!state.leads || state.leads.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#718096; padding:2rem;">No hay prospectos de favoritos registrados aún.</td></tr>`;
    return;
  }

  state.leads.forEach(l => {
    const tr = document.createElement('tr');
    
    const dateObj = new Date(l.date);
    const dateFormatted = dateObj.toLocaleDateString('es-AR') + ' ' + dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    // Link WhatsApp
    const cleanPhone = l.phone.replace(/[^0-9]/g, '');
    const waLink = `<a href="https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(l.name)}!%20Te%20escribimos%20de%20Princessware...%20" target="_blank" rel="noopener" class="wa-link">💬 ${l.phone}</a>`;
    const contactInfo = `
      <div style="font-size:0.85rem; line-height:1.4;">
        <strong>Email:</strong> ${l.email || '<span style="color:#718096">Sin email</span>'}<br/>
        <strong>WhatsApp:</strong> ${waLink}
      </div>
    `;

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

    // Detalles de productos favoritos (fotos miniatura + SKU)
    const favsHtml = l.favs.map(rawSku => {
      const sku = SKU_MAPPING[rawSku] || rawSku;
      const p = state.products.find(prod => prod.id === sku);
      if (!p) return `<code style="display:inline-block; margin:2px;">${sku}</code>`;
      return `
        <div class="lead-fav-item" style="display:inline-flex; align-items:center; gap:8px; margin: 4px; padding: 4px 8px; background: rgba(11, 17, 26, 0.4); border-radius: 6px; border: var(--border-glass);">
          <img src="../${p.img}" alt="${p.name}" style="width:30px; height:30px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="openLightbox('../${p.img}', '${p.name}')" onerror="this.src='../assets/logo-clean.png'">
          <span style="font-size: 0.8rem; font-weight: 500; color:#fff;" title="${p.name}">${sku}</span>
        </div>
      `;
    }).join('');

    const statusClass = l.status === 'Compró' ? 'status-entregado' : 'status-pendiente';
    const statusLabel = l.status || 'Interesado';

    tr.innerHTML = `
      <td>${dateFormatted}</td>
      <td><strong>${l.name}</strong></td>
      <td>${contactInfo}</td>
      <td><div style="display:flex; flex-wrap:wrap; gap:4px; max-width: 400px;">${favsHtml}</div></td>
      <td><span class="badge ${statusClass}">${statusLabel}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-action btn-delete" onclick="handleDeleteLead(${l.id})">Borrar</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Borrar Prospecto
window.handleDeleteLead = function(leadId) {
  if (!confirm('¿Estás seguro de que querés borrar este prospecto de los registros?')) return;

  fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Error al borrar prospecto');
      return res.json();
    })
    .then(() => {
      showToast('Prospecto eliminado.', 'success');
      loadAllData();
    })
    .catch(err => {
      console.error(err);
      showToast('Error al borrar prospecto.', 'error');
    });
};

// Actualizar estado de pedido
window.handleChangeOrderStatus = function(e, orderId) {
  const newStatus = e.target.value;
  e.target.className = `status-select status-${newStatus.toLowerCase()}`;

  fetch(`/api/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al actualizar estado');
      return res.json();
    })
    .then(data => {
      showToast(`Pedido #${orderId} actualizado a ${newStatus}`, 'success');
      const idx = state.orders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        state.orders[idx].status = newStatus;
      }
      renderDashboardStats();
      renderDashboardCharts(); // Actualizar gráfico con el nuevo estado si aplica
    })
    .catch(err => {
      console.error(err);
      showToast('Error al actualizar estado del pedido.', 'error');
    });
};

// Detalle de Pedido
window.openOrderDetailsModal = function(orderId) {
  const o = state.orders.find(ord => ord.id === orderId);
  if (!o) return;

  document.getElementById('detail-order-id').textContent = `#${o.id}`;
  document.getElementById('detail-client-name').textContent = o.clientName;
  document.getElementById('detail-client-email').textContent = o.clientEmail || 'Sin especificar';
  document.getElementById('detail-client-phone').textContent = o.clientPhone || 'Sin especificar';
  
  const shippingMethodText = o.shippingMethod === 'Envio' ? `Envío a domicilio (${o.shippingZone || 'Zona sin especificar'})` : 'Retiro por Sucursal';
  document.getElementById('detail-shipping-method').textContent = shippingMethodText;
  
  const shippingCostText = o.shippingCost > 0 ? '$' + Number(o.shippingCost).toLocaleString('es-AR') : 'Gratis / Sin cargo';
  document.getElementById('detail-shipping-cost').textContent = shippingCostText;

  let addressText = '';
  if (o.shippingMethod === 'Envio') {
    addressText = `${o.addressCalle} ${o.addressNumero}`;
    if (o.addressPiso) addressText += `, Piso ${o.addressPiso}`;
    if (o.addressDepto) addressText += `, Depto ${o.addressDepto}`;
    if (o.addressLocalidad) addressText += ` - ${o.addressLocalidad}`;
    if (o.addressDetalle) addressText += ` (${o.addressDetalle})`;
  } else {
    addressText = 'Retiro por Sucursal (Sin envío)';
  }
  document.getElementById('detail-client-address').textContent = addressText;

  const dateObj = new Date(o.date);
  document.getElementById('detail-order-date').textContent = dateObj.toLocaleDateString('es-AR') + ' ' + dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const tbody = document.getElementById('order-items-tbody');
  tbody.innerHTML = '';

  o.items.forEach(i => {
    const unitFmt = '$' + Number(i.price).toLocaleString('es-AR');
    const subFmt = '$' + Number(i.price * i.qty).toLocaleString('es-AR');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${i.id}</code></td>
      <td><strong>${i.name}</strong></td>
      <td>${i.pieces}</td>
      <td>${i.qty}</td>
      <td>${unitFmt}</td>
      <td><strong>${subFmt}</strong></td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('detail-order-total').textContent = '$' + Number(o.total).toLocaleString('es-AR');
  document.getElementById('modal-order-details').classList.remove('hidden');
};

// Borrar pedido
window.handleDeleteOrder = function(orderId) {
  if (!confirm(`¿Estás seguro de que querés borrar el registro del pedido #${orderId}?`)) return;

  fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Error al borrar');
      return res.json();
    })
    .then(() => {
      showToast(`Pedido #${orderId} eliminado.`, 'success');
      loadAllData();
    })
    .catch(err => {
      console.error(err);
      showToast('Error al borrar el pedido.', 'error');
    });
};

// 7. Cargar datos en Configuración
function populateSettingsForm() {
  document.getElementById('set-whatsapp').value = state.settings.whatsapp || '';
  document.getElementById('set-instagram').value = state.settings.instagram || '';
  document.getElementById('set-freeShip').value = state.settings.freeShip || 0;
  document.getElementById('set-favUpsellText').value = state.settings.favUpsellText || '';
  document.getElementById('set-favUpsellDiscount').value = state.settings.favUpsellDiscount || 0;
  document.getElementById('set-shipCABA').value = state.settings.shipCABA || 0;
  document.getElementById('set-shipProvincias').value = state.settings.shipProvincias || 0;
  document.getElementById('set-shipInterior').value = state.settings.shipInterior || 0;
  document.getElementById('set-shipExterior').value = state.settings.shipExterior || 0;

  const isCatalog = state.settings.catalogMode === true || state.settings.catalogMode === 'true';
  document.getElementById('set-catalogMode-true').checked = isCatalog;
  document.getElementById('set-catalogMode-false').checked = !isCatalog;
}

// Rellenar dropdowns de categorías
function populateDropdowns() {
  const filterDropdown = document.getElementById('filter-prod-cat');
  const modalDropdown = document.getElementById('prod-cat');

  // Guardar valor seleccionado actual
  const currentFilterVal = filterDropdown.value;

  // Limpiar
  filterDropdown.innerHTML = '<option value="all">Todas las categorías</option>';
  modalDropdown.innerHTML = '<option value="">Seleccioná una categoría</option>';

  state.categories.forEach(cat => {
    const optFilter = document.createElement('option');
    optFilter.value = cat.id;
    optFilter.textContent = cat.name;
    filterDropdown.appendChild(optFilter);

    const optModal = document.createElement('option');
    optModal.value = cat.id;
    optModal.textContent = cat.name;
    modalDropdown.appendChild(optModal);
  });

  // Restaurar valor seleccionado si aún existe
  if (state.categories.some(c => c.id === currentFilterVal)) {
    filterDropdown.value = currentFilterVal;
  }
}

// --- MANEJO DE CONFIGURACIÓN Y BENEFICIOS (PUT) ---
function handleSaveSettings(e) {
  e.preventDefault();

  const whatsapp = document.getElementById('set-whatsapp').value;
  const instagram = document.getElementById('set-instagram').value;
  const freeShip = Number(document.getElementById('set-freeShip').value) || 0;
  const favUpsellText = document.getElementById('set-favUpsellText').value;
  const favUpsellDiscount = Number(document.getElementById('set-favUpsellDiscount').value) || 0;
  const shipCABA = Number(document.getElementById('set-shipCABA').value) || 0;
  const shipProvincias = Number(document.getElementById('set-shipProvincias').value) || 0;
  const shipInterior = Number(document.getElementById('set-shipInterior').value) || 0;
  const shipExterior = Number(document.getElementById('set-shipExterior').value) || 0;
  const catalogMode = document.querySelector('input[name="set-catalogMode"]:checked').value === 'true';

  fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      whatsapp, 
      instagram, 
      freeShip, 
      favUpsellText, 
      favUpsellDiscount, 
      shipCABA, 
      shipProvincias, 
      shipInterior, 
      shipExterior,
      catalogMode
    })
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al guardar');
      return res.json();
    })
    .then(data => {
      state.settings = data;
      showToast('¡Configuración guardada y sincronizada con éxito!', 'success');
      loadAllData();
    })
    .catch(err => {
      console.error(err);
      showToast('Error al guardar la configuración.', 'error');
    });
}

// Guardar Pilar Beneficios
function handleSaveBenefit(e, k) {
  e.preventDefault();

  const title = document.getElementById(`ben-title-${k}`).value;
  const desc = document.getElementById(`ben-desc-${k}`).value;

  fetch(`/api/benefits/${k}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, desc })
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al guardar');
      return res.json();
    })
    .then(data => {
      showToast('¡Pilar de beneficio actualizado!', 'success');
      loadAllData();
    })
    .catch(err => {
      console.error(err);
      showToast('Error al actualizar beneficio.', 'error');
    });
}

// --- MODALS OPEN/CLOSE/RESET ---

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.add('hidden'));
  state.editingCategoryId = null;
  state.editingProductId = null;
  state.editingRecipeIndex = null;
  state.tempProductGallery = [];
}

// Modal Categorías
function openCategoryModal(catId = null) {
  const form = document.getElementById('category-form');
  form.reset();
  
  const previewBox = document.getElementById('cat-preview-box');
  previewBox.classList.add('hidden');
  document.getElementById('cat-preview-img').src = '';
  
  const idInput = document.getElementById('cat-id');

  if (catId) {
    state.editingCategoryId = catId;
    document.getElementById('modal-category-title').textContent = 'Editar Categoría';
    idInput.value = catId;
    idInput.disabled = true; // No permitir cambiar ID en edición

    const cat = state.categories.find(c => c.id === catId);
    if (cat) {
      document.getElementById('cat-name').value = cat.name;
      document.getElementById('cat-desc').value = cat.desc;
      document.getElementById('cat-image').value = cat.img;
      if (cat.img) {
        document.getElementById('cat-preview-img').src = `../${cat.img}`;
        previewBox.classList.remove('hidden');
      }
    }
  } else {
    state.editingCategoryId = null;
    document.getElementById('modal-category-title').textContent = 'Nueva Categoría';
    idInput.disabled = false;
  }

  document.getElementById('modal-category').classList.remove('hidden');
}

// Modal Productos
function openProductModal(prodId = null) {
  const form = document.getElementById('product-form');
  form.reset();
  
  const previewBox = document.getElementById('prod-preview-box');
  previewBox.classList.add('hidden');
  document.getElementById('prod-preview-img').src = '';
  document.getElementById('gallery-previews-container').innerHTML = '';
  
  const idInput = document.getElementById('prod-id');
  state.tempProductGallery = [];

  const badgeSelect = document.getElementById('prod-badge-select');
  const badgeInput = document.getElementById('prod-badge');

  if (prodId) {
    state.editingProductId = prodId;
    document.getElementById('modal-product-title').textContent = 'Editar Producto (SKU)';
    idInput.value = prodId;
    idInput.disabled = true;
    document.getElementById('btn-gen-sku').classList.add('hidden'); // Ocultar generador en edición

    const prod = state.products.find(p => p.id === prodId);
    if (prod) {
      document.getElementById('prod-name').value = prod.name;
      document.getElementById('prod-pieces').value = prod.pieces;
      document.getElementById('prod-cat').value = prod.cat;
      document.getElementById('prod-price').value = prod.price;
      document.getElementById('prod-compare').value = prod.compare || '';
      
      // Control de Badge con selector y fallback custom
      if (prod.badge) {
        const standardOptions = ['Más vendido', 'Oferta', 'Nuevo', 'Últimas unidades', 'Recomendado'];
        if (standardOptions.includes(prod.badge)) {
          badgeSelect.value = prod.badge;
          badgeInput.value = prod.badge;
          badgeInput.classList.add('hidden');
        } else {
          badgeSelect.value = 'custom';
          badgeInput.value = prod.badge;
          badgeInput.classList.remove('hidden');
        }
      } else {
        badgeSelect.value = '';
        badgeInput.value = '';
        badgeInput.classList.add('hidden');
      }

      document.getElementById('prod-blurb').value = prod.blurb;
      document.getElementById('prod-desc').value = prod.desc;

      // Specs
      document.getElementById('prod-spec-material').value = prod.specs?.material || 'Acero quirúrgico 18/8';
      document.getElementById('prod-spec-apto').value = prod.specs?.apto || 'Gas, eléctrica, vitrocerámica e inducción';
      document.getElementById('prod-spec-incluye').value = prod.specs?.incluye || '';
      document.getElementById('prod-spec-garantia').value = prod.specs?.garantia || 'De por vida';

      // Imagen principal
      document.getElementById('prod-image').value = prod.img;
      if (prod.img) {
        document.getElementById('prod-preview-img').src = `../${prod.img}`;
        previewBox.classList.remove('hidden');
      }

      // Galería
      if (prod.gallery && Array.isArray(prod.gallery)) {
        state.tempProductGallery = [...prod.gallery];
        renderTempGallery();
      }
    }
  } else {
    state.editingProductId = null;
    document.getElementById('modal-product-title').textContent = 'Nuevo Producto';
    idInput.disabled = false;
    document.getElementById('btn-gen-sku').classList.remove('hidden');
    badgeSelect.value = '';
    badgeInput.value = '';
    badgeInput.classList.add('hidden');

    // Valores especificaciones por defecto
    document.getElementById('prod-spec-material').value = 'Acero quirúrgico 18/8';
    document.getElementById('prod-spec-apto').value = 'Gas, eléctrica, vitrocerámica e inducción';
    document.getElementById('prod-spec-garantia').value = 'De por vida';
  }

  document.getElementById('modal-product').classList.remove('hidden');
}

// Modal Recetas
function openRecipeModal(index = null) {
  const form = document.getElementById('recipe-form');
  form.reset();
  
  const previewBox = document.getElementById('rec-preview-box');
  previewBox.classList.add('hidden');
  document.getElementById('rec-preview-img').src = '';

  if (index !== null) {
    state.editingRecipeIndex = index;
    document.getElementById('modal-recipe-title').textContent = 'Editar Receta';

    const rec = state.recipes[index];
    if (rec) {
      document.getElementById('rec-tag').value = rec.tag;
      document.getElementById('rec-title').value = rec.title;
      document.getElementById('rec-desc').value = rec.desc;
      document.getElementById('rec-time').value = rec.time;
      document.getElementById('rec-level').value = rec.level;
      document.getElementById('rec-image').value = rec.img;
      if (rec.img) {
        document.getElementById('rec-preview-img').src = `../${rec.img}`;
        previewBox.classList.remove('hidden');
      }
    }
  } else {
    state.editingRecipeIndex = null;
    document.getElementById('modal-recipe-title').textContent = 'Nueva Receta';
  }

  document.getElementById('modal-recipe').classList.remove('hidden');
}

// --- SUBIDAS DE IMÁGENES POR FETCH ---
function setupImageUploadEvents() {
  // Categoría - Imagen
  document.getElementById('cat-image-file').addEventListener('change', function() {
    uploadSingleFile(this.files[0], 'cat-image', 'cat-preview-box', 'cat-preview-img');
  });

  // Producto - Imagen Principal
  document.getElementById('prod-image-file').addEventListener('change', function() {
    uploadSingleFile(this.files[0], 'prod-image', 'prod-preview-box', 'prod-preview-img');
  });

  // Producto - Imágenes Galería
  document.getElementById('prod-gallery-files').addEventListener('change', function() {
    uploadMultipleFiles(this.files);
  });

  // Receta - Imagen
  document.getElementById('rec-image-file').addEventListener('change', function() {
    uploadSingleFile(this.files[0], 'rec-image', 'rec-preview-box', 'rec-preview-img');
  });
}

function uploadSingleFile(file, textInputId, previewBoxId, previewImgId) {
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  showToast('Subiendo archivo...', 'success');

  fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
    .then(res => {
      if (!res.ok) throw new Error('Error de subida');
      return res.json();
    })
    .then(data => {
      if (data.image) {
        document.getElementById(textInputId).value = data.image;
        document.getElementById(previewImgId).src = `../${data.image}`;
        document.getElementById(previewBoxId).classList.remove('hidden');
        showToast('Imagen subida con éxito.', 'success');
      }
    })
    .catch(err => {
      console.error(err);
      showToast('Error al subir la imagen.', 'error');
    });
}

function uploadMultipleFiles(files) {
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('gallery', files[i]);
  }

  showToast('Subiendo imágenes de galería...', 'success');

  fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
    .then(res => {
      if (!res.ok) throw new Error('Error en subida múltiple');
      return res.json();
    })
    .then(data => {
      if (data.gallery && data.gallery.length > 0) {
        state.tempProductGallery.push(...data.gallery);
        renderTempGallery();
        showToast('Fotos agregadas a la galería.', 'success');
      }
    })
    .catch(err => {
      console.error(err);
      showToast('Error al subir las imágenes.', 'error');
    });
}

function renderTempGallery() {
  const container = document.getElementById('gallery-previews-container');
  container.innerHTML = '';

  state.tempProductGallery.forEach((path, idx) => {
    const div = document.createElement('div');
    div.className = 'gallery-preview-item';
    div.innerHTML = `
      <img src="../${path}" alt="Galería ${idx}" onclick="openLightbox('../${path}', 'Imagen de Galería')" onerror="this.src='../assets/logo-clean.png'">
      <button type="button" class="btn-remove-gal" onclick="removeTempGalleryItem(${idx})">&times;</button>
    `;
    container.appendChild(div);
  });
}

window.removeTempGalleryItem = function(idx) {
  state.tempProductGallery.splice(idx, 1);
  renderTempGallery();
};

// --- ENVÍO DE FORMULARIOS (CRUD POST/PUT) ---

// 1. Categoría Submit
function handleCategorySubmit(e) {
  e.preventDefault();

  const id = document.getElementById('cat-id').value.trim();
  const name = document.getElementById('cat-name').value.trim();
  const desc = document.getElementById('cat-desc').value.trim();
  const img = document.getElementById('cat-image').value.trim();

  const payload = { id, name, desc, img };
  const isEditing = state.editingCategoryId !== null;
  const url = isEditing ? `/api/categories/${state.editingCategoryId}` : '/api/categories';
  const method = isEditing ? 'PUT' : 'POST';

  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw new Error(data.error || 'Error al guardar'); });
      }
      return res.json();
    })
    .then(() => {
      showToast(isEditing ? '¡Categoría actualizada!' : '¡Categoría creada!', 'success');
      closeAllModals();
      loadAllData();
    })
    .catch(err => {
      showToast(err.message, 'error');
    });
}

// 2. Producto Submit
function handleProductSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('prod-id').value.trim();
  const name = document.getElementById('prod-name').value.trim();
  const pieces = document.getElementById('prod-pieces').value.trim();
  const cat = document.getElementById('prod-cat').value;
  const price = Number(document.getElementById('prod-price').value) || 0;
  
  const compareVal = document.getElementById('prod-compare').value;
  const compare = compareVal ? Number(compareVal) : null;
  
  const badgeVal = document.getElementById('prod-badge').value.trim();
  const badge = badgeVal || null;

  const blurb = document.getElementById('prod-blurb').value.trim();
  const desc = document.getElementById('prod-desc').value.trim();
  const img = document.getElementById('prod-image').value.trim();

  // Specs
  const specs = {
    material: document.getElementById('prod-spec-material').value.trim(),
    apto: document.getElementById('prod-spec-apto').value.trim(),
    incluye: document.getElementById('prod-spec-incluye').value.trim(),
    garantia: document.getElementById('prod-spec-garantia').value.trim()
  };

  const payload = {
    id,
    name,
    pieces,
    cat,
    price,
    compare,
    badge,
    blurb,
    desc,
    img,
    gallery: state.tempProductGallery,
    specs
  };

  const isEditing = state.editingProductId !== null;
  const url = isEditing ? `/api/products/${state.editingProductId}` : '/api/products';
  const method = isEditing ? 'PUT' : 'POST';

  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw new Error(data.error || 'Error al guardar producto'); });
      }
      return res.json();
    })
    .then(() => {
      showToast(isEditing ? '¡Producto actualizado!' : '¡Producto creado!', 'success');
      closeAllModals();
      loadAllData();
    })
    .catch(err => {
      showToast(err.message, 'error');
    });
}

// 3. Receta Submit
function handleRecipeSubmit(e) {
  e.preventDefault();

  const tag = document.getElementById('rec-tag').value.trim();
  const title = document.getElementById('rec-title').value.trim();
  const desc = document.getElementById('rec-desc').value.trim();
  const time = document.getElementById('rec-time').value.trim();
  const level = document.getElementById('rec-level').value;
  const img = document.getElementById('rec-image').value.trim();

  const payload = { tag, title, desc, time, level, img };
  const isEditing = state.editingRecipeIndex !== null;
  const url = isEditing ? `/api/recipes/${state.editingRecipeIndex}` : '/api/recipes';
  const method = isEditing ? 'PUT' : 'POST';

  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw new Error(data.error || 'Error al guardar receta'); });
      }
      return res.json();
    })
    .then(() => {
      showToast(isEditing ? '¡Receta actualizada!' : '¡Receta creada!', 'success');
      closeAllModals();
      loadAllData();
    })
    .catch(err => {
      showToast(err.message, 'error');
    });
}

// --- BORRAR ELEMENTOS (DELETE) ---

window.handleDeleteCategory = function(catId) {
  const checkHasProducts = state.products.some(p => p.cat === catId);
  if (checkHasProducts) {
    showToast('No podés borrar una categoría que contiene productos. Reasigná los productos primero.', 'error');
    return;
  }

  if (!confirm(`¿Estás seguro de que querés borrar la categoría "${catId}"?`)) return;

  fetch(`/api/categories/${catId}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Error al borrar');
      return res.json();
    })
    .then(() => {
      showToast('Categoría eliminada.', 'success');
      loadAllData();
    })
    .catch(err => {
      console.error(err);
      showToast('Error al borrar categoría.', 'error');
    });
};

window.handleDeleteProduct = function(prodId) {
  if (!confirm(`¿Estás seguro de que querés borrar el producto "${prodId}"?`)) return;

  fetch(`/api/products/${prodId}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Error al borrar');
      return res.json();
    })
    .then(() => {
      showToast('Producto eliminado.', 'success');
      loadAllData();
    })
    .catch(err => {
      console.error(err);
      showToast('Error al borrar producto.', 'error');
    });
};

window.handleDeleteRecipe = function(index) {
  if (!confirm('¿Estás seguro de que querés borrar esta receta?')) return;

  fetch(`/api/recipes/${index}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Error al borrar');
      return res.json();
    })
    .then(() => {
      showToast('Receta eliminada.', 'success');
      loadAllData();
    })
    .catch(err => {
      console.error(err);
      showToast('Error al borrar receta.', 'error');
    });
};

// --- USUARIOS REGISTRADOS ---
function renderUsersTable() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  const users = state.users || [];
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-plata-soft);padding:30px">Sin usuarios registrados aún.</td></tr>';
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${new Date(u.date).toLocaleDateString('es-AR')}</td>
      <td><strong>${u.name}</strong></td>
      <td><a href="mailto:${u.email}" style="color:var(--color-azul-royal)">${u.email}</a></td>
      <td>${u.phone || '-'}</td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${u.address || ''}">${u.address || '-'}</td>
      <td><button class="btn-danger-sm" onclick="handleDeleteUser(${u.id})">Eliminar</button></td>
    </tr>`).join('');
}

window.handleDeleteUser = function(id) {
  if (!confirm('¿Eliminar este usuario de la base de datos?')) return;
  fetch(`/api/users/${id}`, { method: 'DELETE' })
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(() => { showToast('Usuario eliminado.', 'success'); loadAllData(); })
    .catch(() => showToast('Error al eliminar usuario.', 'error'));
};

function renderInterestsTable() {
  const tbody = document.getElementById('interests-table-body');
  if (!tbody) return;
  const interests = state.interests || [];
  if (!interests.length) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--color-plata-soft);padding:30px">Sin registros de interés anónimo aún.</td></tr>';
    return;
  }
  const productsMap = {};
  (state.products || []).forEach(p => { productsMap[p.id] = p; });

  tbody.innerHTML = interests.map(item => {
    const fecha = new Date(item.updatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
    const productos = (item.productIds || []).map(id => {
      const p = productsMap[id];
      return p ? `<span style="display:inline-block;background:#f1f5f9;border-radius:6px;padding:2px 8px;margin:2px;font-size:.75rem">${p.name}</span>` : '';
    }).join('');
    return `<tr>
      <td>${fecha}</td>
      <td>${productos || '-'}</td>
      <td style="text-align:center"><strong>${(item.productIds || []).length}</strong></td>
    </tr>`;
  }).join('');
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✓' : '✗';
  
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;
  
  container.appendChild(toast);
  
  // Autodescartar en 4 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
