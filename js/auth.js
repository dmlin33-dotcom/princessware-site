/* auth.js — modal de login/registro para compradores */
(function () {
  let currentUser = null;

  /* ---------- inyectar estilos ---------- */
  const style = document.createElement('style');
  style.innerHTML = `
    .pw-auth-overlay {
      position: fixed; inset: 0; background: rgba(8,13,22,.82);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      z-index: 11000; display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .pw-auth-card {
      background: #fff; color: #0e2a52; width: 100%; max-width: 420px;
      border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,.4);
      overflow: hidden; animation: pwAuthIn .28s cubic-bezier(.25,.8,.25,1);
    }
    @keyframes pwAuthIn { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
    .pw-auth-tabs { display: flex; border-bottom: 1px solid #e2e8f0; }
    .pw-auth-tab {
      flex: 1; padding: 16px; background: none; border: none; font-family: 'Montserrat', sans-serif;
      font-size: .82rem; font-weight: 700; text-transform: uppercase; letter-spacing: .8px;
      color: #94a3b8; cursor: pointer; transition: .2s; border-bottom: 2px solid transparent;
    }
    .pw-auth-tab.active { color: #0e2a52; border-bottom-color: #0e2a52; }
    .pw-auth-body { padding: 28px 28px 24px; }
    .pw-auth-logo { text-align: center; margin-bottom: 18px; }
    .pw-auth-logo img { width: 48px; }
    .pw-auth-logo h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; margin: 6px 0 2px; color: #0e2a52; }
    .pw-auth-logo p { font-family: 'Montserrat', sans-serif; font-size: .72rem; color: #64748b; margin: 0; }
    .pw-auth-panel { display: none; }
    .pw-auth-panel.active { display: block; }
    .pw-auth-group { margin-bottom: 14px; }
    .pw-auth-group label { display: block; font-family: 'Montserrat', sans-serif; font-size: .72rem; font-weight: 700; color: #475569; margin-bottom: 5px; text-transform: uppercase; letter-spacing: .5px; }
    .pw-auth-group input { width: 100%; padding: 10px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-family: 'Montserrat', sans-serif; font-size: .85rem; outline: none; transition: .2s; box-sizing: border-box; background: #f8fafc; color: #0e2a52; }
    .pw-auth-group input:focus { border-color: #0e2a52; background: #fff; box-shadow: 0 0 0 3px rgba(14,42,82,.08); }
    .pw-auth-err { font-family: 'Montserrat', sans-serif; font-size: .78rem; color: #c0392b; background: #fbeae8; border-radius: 8px; padding: 9px 12px; margin-bottom: 12px; display: none; }
    .pw-auth-err.show { display: block; }
    .pw-auth-submit { width: 100%; padding: 12px; background: #0e2a52; color: #fff; border: none; border-radius: 9px; font-family: 'Montserrat', sans-serif; font-size: .85rem; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; cursor: pointer; transition: .2s; margin-top: 4px; }
    .pw-auth-submit:hover { background: #1b4a8f; }
    .pw-auth-submit:disabled { opacity: .6; cursor: default; }
    .pw-auth-close { position: absolute; top: 14px; right: 16px; background: none; border: none; font-size: 1.6rem; cursor: pointer; color: #94a3b8; line-height: 1; }

    /* perfil drawer */
    .pw-profile-drawer {
      position: fixed; inset: 0 0 0 auto; width: min(340px, 100vw);
      background: #fff; box-shadow: -4px 0 30px rgba(0,0,0,.18); z-index: 10500;
      transform: translateX(100%); transition: transform .28s cubic-bezier(.25,.8,.25,1);
      display: flex; flex-direction: column; overflow-y: auto;
    }
    .pw-profile-drawer.open { transform: none; }
    .pw-profile-h { padding: 22px 20px 16px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; }
    .pw-profile-avatar { width: 44px; height: 44px; border-radius: 50%; background: #0e2a52; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 1.1rem; font-weight: 700; flex-shrink: 0; }
    .pw-profile-name { font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; color: #0e2a52; font-weight: 700; }
    .pw-profile-email { font-family: 'Montserrat', sans-serif; font-size: .72rem; color: #64748b; }
    .pw-profile-close { margin-left: auto; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; flex-shrink: 0; }
    .pw-profile-body { padding: 22px 20px; flex: 1; }
    .pw-profile-body h4 { font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; color: #0e2a52; margin: 0 0 14px; }
    .pw-profile-field { margin-bottom: 14px; }
    .pw-profile-field label { display: block; font-family: 'Montserrat', sans-serif; font-size: .7rem; font-weight: 700; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: .5px; }
    .pw-profile-field input, .pw-profile-field textarea { width: 100%; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: .83rem; outline: none; box-sizing: border-box; background: #f8fafc; color: #0e2a52; transition: .2s; resize: vertical; }
    .pw-profile-field input:focus, .pw-profile-field textarea:focus { border-color: #0e2a52; background: #fff; }
    .pw-profile-save { width: 100%; padding: 11px; background: #0e2a52; color: #fff; border: none; border-radius: 9px; font-family: 'Montserrat', sans-serif; font-size: .82rem; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: .8px; transition: .2s; }
    .pw-profile-save:hover { background: #1b4a8f; }
    .pw-profile-foot { padding: 16px 20px; border-top: 1px solid #f1f5f9; }
    .pw-profile-logout { width: 100%; padding: 10px; background: none; border: 1.5px solid #e2e8f0; border-radius: 9px; color: #64748b; font-family: 'Montserrat', sans-serif; font-size: .8rem; font-weight: 700; cursor: pointer; transition: .2s; }
    .pw-profile-logout:hover { border-color: #c0392b; color: #c0392b; }
    .pw-profile-msg { font-family: 'Montserrat', sans-serif; font-size: .78rem; padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; display: none; }
    .pw-profile-msg.ok { display: block; background: #f0fdf4; color: #2e7d4f; }
    .pw-profile-msg.err { display: block; background: #fbeae8; color: #c0392b; }
  `;
  document.head.appendChild(style);

  /* ---------- HTML modal ---------- */
  const authEl = document.createElement('div');
  authEl.innerHTML = `
    <div class="pw-auth-overlay" id="pwAuthOverlay" style="display:none">
      <div class="pw-auth-card" style="position:relative">
        <button class="pw-auth-close" id="pwAuthClose">&times;</button>
        <div class="pw-auth-tabs">
          <button class="pw-auth-tab active" data-panel="login">Iniciar Sesión</button>
          <button class="pw-auth-tab" data-panel="register">Crear Cuenta</button>
        </div>
        <div class="pw-auth-body">
          <div class="pw-auth-logo">
            <img src="assets/logo-clean.png" alt="Princessware"/>
            <h3>Princessware</h3>
            <p>Acero Quirúrgico 18/8</p>
          </div>

          <!-- LOGIN -->
          <div class="pw-auth-panel active" id="pwPanelLogin">
            <div class="pw-auth-err" id="pwLoginErr"></div>
            <form id="pwLoginForm">
              <div class="pw-auth-group"><label>Email</label><input type="email" id="pwLoginEmail" placeholder="tu@email.com" required autocomplete="email"/></div>
              <div class="pw-auth-group"><label>Contraseña</label><input type="password" id="pwLoginPass" placeholder="••••••••" required autocomplete="current-password"/></div>
              <button type="submit" class="pw-auth-submit" id="pwLoginBtn">Ingresar</button>
            </form>
          </div>

          <!-- REGISTRO -->
          <div class="pw-auth-panel" id="pwPanelRegister">
            <div class="pw-auth-err" id="pwRegErr"></div>
            <form id="pwRegForm">
              <div class="pw-auth-group"><label>Nombre completo</label><input type="text" id="pwRegName" placeholder="Ej: Ana García" required autocomplete="name"/></div>
              <div class="pw-auth-group"><label>Email</label><input type="email" id="pwRegEmail" placeholder="tu@email.com" required autocomplete="email"/></div>
              <div class="pw-auth-group"><label>Teléfono</label><input type="tel" id="pwRegPhone" placeholder="Ej: +54 9 11 12345678" autocomplete="tel"/></div>
              <div class="pw-auth-group"><label>Dirección</label><input type="text" id="pwRegAddress" placeholder="Calle, número, ciudad" autocomplete="street-address"/></div>
              <div class="pw-auth-group"><label>Contraseña</label><input type="password" id="pwRegPass" placeholder="Mínimo 6 caracteres" required autocomplete="new-password" minlength="6"/></div>
              <button type="submit" class="pw-auth-submit" id="pwRegBtn">Crear mi cuenta</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- PERFIL DRAWER -->
    <div class="pw-profile-drawer" id="pwProfileDrawer">
      <div class="pw-profile-h">
        <div class="pw-profile-avatar" id="pwProfileAvatar">A</div>
        <div>
          <div class="pw-profile-name" id="pwProfileName">Nombre</div>
          <div class="pw-profile-email" id="pwProfileEmailDisp"></div>
        </div>
        <button class="pw-profile-close" id="pwProfileClose">&times;</button>
      </div>
      <div class="pw-profile-body">
        <h4>Mis datos</h4>
        <div class="pw-profile-msg" id="pwProfileMsg"></div>
        <form id="pwProfileForm">
          <div class="pw-profile-field"><label>Nombre completo</label><input type="text" id="ppName" required/></div>
          <div class="pw-profile-field"><label>Teléfono</label><input type="tel" id="ppPhone"/></div>
          <div class="pw-profile-field"><label>Dirección</label><input type="text" id="ppAddress"/></div>
          <button type="submit" class="pw-profile-save">Guardar cambios</button>
        </form>
      </div>
      <div class="pw-profile-foot">
        <button class="pw-profile-logout" id="pwProfileLogout">Cerrar sesión</button>
      </div>
    </div>
  `;
  document.body.appendChild(authEl);

  const $ = id => document.getElementById(id);

  /* ---------- tabs ---------- */
  document.querySelectorAll('.pw-auth-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.pw-auth-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.pw-auth-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $('pwPanel' + btn.dataset.panel.charAt(0).toUpperCase() + btn.dataset.panel.slice(1)).classList.add('active');
    };
  });

  /* ---------- abrir / cerrar modal ---------- */
  function openAuth() { $('pwAuthOverlay').style.display = 'flex'; }
  function closeAuth() { $('pwAuthOverlay').style.display = 'none'; }
  $('pwAuthClose').onclick = closeAuth;
  $('pwAuthOverlay').onclick = e => { if (e.target === $('pwAuthOverlay')) closeAuth(); };

  /* ---------- abrir / cerrar perfil ---------- */
  const scrim = document.getElementById('pwScrim');
  function openProfile() {
    $('pwProfileDrawer').classList.add('open');
    if (scrim) { scrim.classList.add('show'); }
  }
  function closeProfile() {
    $('pwProfileDrawer').classList.remove('open');
    if (scrim) { scrim.classList.remove('show'); }
  }
  $('pwProfileClose').onclick = closeProfile;
  if (scrim) {
    const origScrimClick = scrim.onclick;
    scrim.onclick = e => { closeProfile(); if (origScrimClick) origScrimClick(e); };
  }

  /* ---------- botón usuario en header ---------- */
  const userBtn = document.querySelector('.pw-actions button[aria-label="Cuenta"]');
  if (userBtn) {
    userBtn.onclick = () => { currentUser ? openProfile() : openAuth(); };
  }

  /* ---------- actualizar header ---------- */
  function updateHeader() {
    window.PW._userLoggedIn = !!currentUser;
    if (!userBtn) return;
    if (currentUser) {
      userBtn.title = currentUser.name;
      userBtn.style.color = '#0e2a52';
      userBtn.style.fontWeight = '700';
    } else {
      userBtn.title = '';
      userBtn.style.color = '';
      userBtn.style.fontWeight = '';
    }
  }

  /* ---------- cargar perfil en drawer ---------- */
  function fillProfile(u) {
    const initials = (u.name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    $('pwProfileAvatar').textContent = initials;
    $('pwProfileName').textContent = u.name;
    $('pwProfileEmailDisp').textContent = u.email;
    $('ppName').value = u.name || '';
    $('ppPhone').value = u.phone || '';
    $('ppAddress').value = u.address || '';
  }

  /* ---------- sync de favoritos ---------- */
  function syncFavoritesOnLogin(serverFavs) {
    const localFavs = window.PW && window.PW.Favorites ? window.PW.Favorites.items() : [];
    // Fusionar: unión de locales + servidor, sin duplicados
    const merged = [...new Set([...localFavs, ...(serverFavs || [])])];
    // Guardar en localStorage
    if (window.PW && window.PW.Favorites) {
      merged.forEach(id => { if (!window.PW.Favorites.has(id)) window.PW.Favorites.toggle(id); });
    }
    // Persistir en servidor
    fetch('/api/users/me/favorites', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorites: merged })
    }).catch(() => {});
  }

  /* ---------- verificar sesión al cargar ---------- */
  fetch('/api/users/me')
    .then(r => r.ok ? r.json() : null)
    .then(u => {
      if (u) {
        currentUser = u; fillProfile(u); updateHeader();
        // Sincronizar favoritos guardados en la cuenta
        if (u.favorites && u.favorites.length) syncFavoritesOnLogin(u.favorites);
      }
    })
    .catch(() => {});

  /* ---------- login ---------- */
  $('pwLoginForm').onsubmit = async e => {
    e.preventDefault();
    const btn = $('pwLoginBtn'); btn.disabled = true; btn.textContent = 'Ingresando...';
    const errEl = $('pwLoginErr'); errEl.classList.remove('show');
    try {
      const r = await fetch('/api/users/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: $('pwLoginEmail').value, password: $('pwLoginPass').value })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      const me = await (await fetch('/api/users/me')).json();
      currentUser = me; fillProfile(me); updateHeader();
      syncFavoritesOnLogin(me.favorites);
      closeAuth();
      if (window.PW && window.PW.toast) window.PW.toast('¡Bienvenida/o, ' + me.name + '!');
    } catch (err) {
      errEl.textContent = err.message; errEl.classList.add('show');
    } finally {
      btn.disabled = false; btn.textContent = 'Ingresar';
    }
  };

  /* ---------- registro ---------- */
  $('pwRegForm').onsubmit = async e => {
    e.preventDefault();
    const btn = $('pwRegBtn'); btn.disabled = true; btn.textContent = 'Creando cuenta...';
    const errEl = $('pwRegErr'); errEl.classList.remove('show');
    try {
      const r = await fetch('/api/users/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: $('pwRegName').value, email: $('pwRegEmail').value,
          phone: $('pwRegPhone').value, address: $('pwRegAddress').value,
          password: $('pwRegPass').value
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      const me = await (await fetch('/api/users/me')).json();
      currentUser = me; fillProfile(me); updateHeader();
      syncFavoritesOnLogin(me.favorites);
      closeAuth();
      if (window.PW && window.PW.toast) window.PW.toast('¡Cuenta creada! Bienvenida/o, ' + me.name + ' 🤍');
    } catch (err) {
      errEl.textContent = err.message; errEl.classList.add('show');
    } finally {
      btn.disabled = false; btn.textContent = 'Crear mi cuenta';
    }
  };

  /* ---------- actualizar perfil ---------- */
  $('pwProfileForm').onsubmit = async e => {
    e.preventDefault();
    const msgEl = $('pwProfileMsg'); msgEl.className = 'pw-profile-msg';
    try {
      const r = await fetch('/api/users/me', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: $('ppName').value, phone: $('ppPhone').value, address: $('ppAddress').value })
      });
      const u = await r.json();
      if (!r.ok) throw new Error(u.error);
      currentUser = u; fillProfile(u); updateHeader();
      msgEl.textContent = '¡Datos guardados!'; msgEl.classList.add('ok');
      setTimeout(() => msgEl.classList.remove('ok'), 3000);
    } catch (err) {
      msgEl.textContent = err.message; msgEl.classList.add('err');
    }
  };

  /* ---------- logout ---------- */
  $('pwProfileLogout').onclick = async () => {
    // Guardar favoritos actuales antes de cerrar sesión
    if (window.PW && window.PW.Favorites) {
      const favs = window.PW.Favorites.items();
      if (favs.length) {
        await fetch('/api/users/me/favorites', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ favorites: favs })
        }).catch(() => {});
      }
    }
    await fetch('/api/users/logout', { method: 'POST' });
    currentUser = null; updateHeader(); closeProfile();
    if (window.PW && window.PW.toast) window.PW.toast('Sesión cerrada.');
  };

  window.PW = window.PW || {};
  window.PW.openAuth = openAuth;
})();
