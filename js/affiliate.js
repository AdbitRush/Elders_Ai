// js/affiliate.js — Affiliate link management (Amazon & AliExpress)
const Affiliate = (() => {
  'use strict';

  const CFG_KEY  = 'gg_aff_cfg';
  const PROD_KEY = 'gg_aff_products';
  const AUTH_KEY = 'gg_aff_auth';
  const DEF_CFG  = { platform: 'off', amazonTag: '', aliPid: '', aliAppKey: '' };

  // ── Storage ───────────────────────────────────────────────────────────────────
  function getCfg() {
    try { return Object.assign({}, DEF_CFG, JSON.parse(localStorage.getItem(CFG_KEY) || '{}')); }
    catch(e) { return Object.assign({}, DEF_CFG); }
  }
  function saveCfg(c) { localStorage.setItem(CFG_KEY, JSON.stringify(c)); }

  function getProducts() {
    try { return JSON.parse(localStorage.getItem(PROD_KEY) || '[]'); }
    catch(e) { return []; }
  }
  function saveProducts(arr) { localStorage.setItem(PROD_KEY, JSON.stringify(arr)); }

  // ── Auth ──────────────────────────────────────────────────────────────────────
  function getAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); }
    catch(e) { return null; }
  }
  function _saveAuth(email, hash) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ email, hash }));
  }
  async function _hash(str) {
    if (crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    }
    // Fallback for non-HTTPS (local dev)
    return btoa(unescape(encodeURIComponent(str)));
  }

  // ── Link helpers ──────────────────────────────────────────────────────────────
  function _amazonLink(url, tag) {
    if (!url || !tag) return url || null;
    return url + (url.includes('?') ? '&' : '?') + 'tag=' + encodeURIComponent(tag);
  }

  function _productLink(p) {
    const { platform, amazonTag } = getCfg();
    if ((platform === 'amazon' || platform === 'both') && p.amazon_url) {
      return _amazonLink(p.amazon_url, amazonTag);
    }
    if ((platform === 'aliexpress' || platform === 'both') && p.ali_url) {
      return p.ali_url; // user pastes pre-generated affiliate URL
    }
    return null;
  }

  function _productName(p) {
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'he';
    return (lang === 'he' ? p.name_he : p.name_en) || p.name_en || p.name_he || 'Product';
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Ad bar ────────────────────────────────────────────────────────────────────
  let _tickerIv = null;
  let _prodIdx  = 0;

  function _takeover() {
    clearInterval(window._adTickerIv); // stop original ticker
    clearInterval(_tickerIv);
    _prodIdx = 0;

    const cfg = getCfg();
    const pill = document.querySelector('.ad-pill');
    if (pill) {
      pill.textContent = cfg.platform === 'amazon'    ? 'Amazon'
                       : cfg.platform === 'aliexpress' ? 'AliExpress'
                       : 'Shop';
    }

    const products = getProducts().filter(p => p.active !== false);
    if (!products.length) return;

    _rotateTicker();
    _tickerIv = setInterval(_rotateTicker, 8000);
  }

  function _rotateTicker() {
    const cfg = getCfg();
    if (cfg.platform === 'off') return;
    const products = getProducts().filter(p => p.active !== false);
    if (!products.length) return;

    const el = document.getElementById('adFallback');
    if (!el) return;

    const p    = products[_prodIdx % products.length];
    const link = _productLink(p);
    const name = _productName(p);
    const icon = p.emoji || '🛍️';

    el.style.opacity = '0';
    setTimeout(() => {
      if (link) {
        el.innerHTML = icon + ' <a href="' + _esc(link) + '" target="_blank" rel="noopener nofollow sponsored" ' +
          'style="color:#f6c048;text-decoration:none;font-weight:600">' + _esc(name) + ' →</a>';
      } else {
        el.textContent = icon + ' ' + name;
      }
      el.style.opacity = '1';
    }, 450);

    _prodIdx++;
  }

  // ── Side bar ──────────────────────────────────────────────────────────────────
  function _refreshSideBar() {
    const cfg = getCfg();
    const sideContent = document.getElementById('adSideContent');
    if (!sideContent) return;

    if (cfg.platform === 'off') {
      sideContent.innerHTML = '<div style="font-size:11px;color:#94a3b8;text-align:center;line-height:1.5">מקום פרסום<br><span style="font-size:10px">160\xd7250</span></div>' +
        '<div style="font-size:10px;color:#cbd5e1;text-align:center;border:1px dashed #e2e8f0;border-radius:6px;padding:8px;width:100%">ממתין ל-AdSense</div>';
      return;
    }

    const products = getProducts().filter(p => p.active !== false);
    if (!products.length) {
      sideContent.innerHTML = '<div style="color:#64748b;font-size:11px;text-align:center;padding:12px">No products<br>configured</div>';
      return;
    }

    const p    = products[0];
    const link = _productLink(p);
    const name = _productName(p);
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'he';
    const desc = (lang === 'he' ? p.desc_he : p.desc_en) || p.desc_en || p.desc_he || '';
    const icon = p.emoji || '🛍️';
    const btnLabel = cfg.platform === 'amazon'    ? '🛒 Amazon'
                   : cfg.platform === 'aliexpress' ? '🛍️ AliExpress' : '🛒 קנה עכשיו';

    sideContent.innerHTML =
      (p.img ? '<img src="' + _esc(p.img) + '" alt="' + _esc(name) + '" style="width:100%;height:90px;object-fit:cover;border-radius:6px">'
             : '<div style="font-size:2.8rem;margin:4px 0;text-align:center">' + icon + '</div>') +
      '<div style="font-size:11px;font-weight:700;color:#e2e8f0;text-align:center;line-height:1.3;margin-top:4px">' + _esc(name) + '</div>' +
      (desc ? '<div style="font-size:10px;color:#94a3b8;text-align:center;line-height:1.4;margin-top:3px">' + _esc(desc) + '</div>' : '') +
      (link ? '<a href="' + _esc(link) + '" target="_blank" rel="noopener nofollow sponsored" style="display:block;background:linear-gradient(135deg,#b7791f,#f6c048);color:#0a1628;text-align:center;border-radius:7px;padding:7px;font-size:11px;font-weight:800;text-decoration:none;margin-top:6px">' + btnLabel + '</a>' : '');
  }

  // ── Admin trigger (5× tap on pill) ────────────────────────────────────────────
  let _tapCount = 0, _tapTimer = null;

  function _setupTrigger() {
    const pill = document.querySelector('.ad-pill');
    if (!pill) return;
    pill.style.cursor = 'pointer';
    pill.title = 'Tap 5\xd7 for affiliate settings';
    pill.addEventListener('click', () => {
      _tapCount++;
      clearTimeout(_tapTimer);
      if (_tapCount >= 5) { _tapCount = 0; showAdmin(); return; }
      _tapTimer = setTimeout(() => { _tapCount = 0; }, 2500);
    });
    if (new URLSearchParams(location.search).has('admin')) {
      setTimeout(showAdmin, 300);
    }
  }

  // ── Shared input style ────────────────────────────────────────────────────────
  function _inp(extra) {
    return 'width:100%;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.12);border-radius:8px;padding:7px 10px;color:#e2e8f0;font-size:0.88rem;font-family:inherit;box-sizing:border-box;outline:none;' + (extra || '');
  }

  // ── Product row (admin list) ──────────────────────────────────────────────────
  function _prodRow(p, i) {
    return '<div data-pr="' + i + '" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:8px 12px;display:flex;align-items:center;gap:10px">' +
      '<span style="font-size:1.2rem;flex-shrink:0">' + (p.emoji || '🛍️') + '</span>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="color:#e2e8f0;font-size:0.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + _esc(p.name_en || p.name_he || 'Unnamed') + '</div>' +
        '<div style="color:' + (p.active === false ? '#64748b' : '#4ade80') + ';font-size:0.72rem">' + (p.active === false ? 'Hidden' : 'Active') + '</div>' +
      '</div>' +
      '<button onclick="Affiliate._editProd(' + i + ')" style="background:none;border:1px solid rgba(255,255,255,0.18);color:#94a3b8;border-radius:6px;padding:3px 8px;font-size:0.75rem;cursor:pointer">Edit</button>' +
      '<button onclick="Affiliate._delProd(' + i + ')" style="background:none;border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:6px;padding:3px 8px;font-size:0.75rem;cursor:pointer">✕</button>' +
    '</div>';
  }

  // ── Product add/edit form ─────────────────────────────────────────────────────
  function _prodForm(p, i) {
    const isEdit = i !== undefined && i >= 0;
    return '<div id="_pf" style="background:rgba(10,20,40,0.8);border:1px solid rgba(183,121,31,0.35);border-radius:12px;padding:14px;margin-top:8px;display:flex;flex-direction:column;gap:7px">' +
      '<div style="color:#f6c048;font-size:0.88rem;font-weight:700;margin-bottom:2px">' + (isEdit ? '✏️ Edit' : '➕ New') + ' Product</div>' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<input id="_pf-emoji"    value="' + _esc(p ? p.emoji     || '🛍️' : '🛍️') + '" maxlength="4" placeholder="🛍️" style="' + _inp('width:56px;text-align:center;font-size:1.2rem') + '">' +
        '<input id="_pf-name-en" value="' + _esc(p ? p.name_en   || ''   : '')   + '" placeholder="Product name (English)"    style="' + _inp('flex:1') + '">' +
      '</div>' +
      '<input id="_pf-name-he"  value="' + _esc(p ? p.name_he   || '' : '') + '" placeholder="שם המוצר (עברית)"  style="' + _inp('direction:rtl') + '">' +
      '<input id="_pf-desc-en"  value="' + _esc(p ? p.desc_en   || '' : '') + '" placeholder="Short description EN (optional)" style="' + _inp() + '">' +
      '<input id="_pf-desc-he"  value="' + _esc(p ? p.desc_he   || '' : '') + '" placeholder="תיאור קצר (רשות)"    style="' + _inp('direction:rtl') + '">' +
      '<input id="_pf-img"      value="' + _esc(p ? p.img       || '' : '') + '" placeholder="Product image URL (optional)"   style="' + _inp() + '">' +
      '<input id="_pf-amazon"   value="' + _esc(p ? p.amazon_url|| '' : '') + '" placeholder="Amazon URL — ?tag= auto-appended (e.g. amazon.com/dp/ASIN)" style="' + _inp() + '">' +
      '<input id="_pf-ali"      value="' + _esc(p ? p.ali_url   || '' : '') + '" placeholder="AliExpress affiliate URL (s.click.aliexpress.com/...)"       style="' + _inp() + '">' +
      '<label style="display:flex;align-items:center;gap:8px;color:#94a3b8;font-size:0.82rem;cursor:pointer">' +
        '<input id="_pf-active" type="checkbox" ' + (!p || p.active !== false ? 'checked' : '') + '> Show in ads (active)' +
      '</label>' +
      '<div style="display:flex;gap:8px;margin-top:4px">' +
        '<button onclick="Affiliate._saveProd(' + (isEdit ? i : -1) + ')" style="flex:1;background:linear-gradient(135deg,#b7791f,#f6c048);color:#0a1628;border:none;border-radius:8px;padding:8px;font-weight:800;cursor:pointer;font-size:0.88rem">' + (isEdit ? '💾 Save' : '✅ Add') + '</button>' +
        '<button onclick="document.getElementById(\'_pf\')?.remove()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);color:#94a3b8;border-radius:8px;padding:8px 14px;cursor:pointer">Cancel</button>' +
      '</div>' +
    '</div>';
  }

  function _rebuildList() {
    const products = getProducts();
    const list = document.getElementById('_aff-pl');
    if (!list) return;
    list.innerHTML = products.length
      ? products.map(_prodRow).join('')
      : '<div style="color:#475569;font-size:0.82rem;text-align:center;padding:16px 0">No products yet. Add your first one.</div>';
  }

  // ── Auth gate ─────────────────────────────────────────────────────────────────
  function showAdmin() {
    // Toggle off if already open
    const ex = document.getElementById('_aff-admin') || document.getElementById('_aff-gate');
    if (ex) { ex.remove(); return; }
    const auth = getAuth();
    if (!auth) { _showSetup(); } else { _showLogin(auth.email); }
  }

  function _gateOverlay(id) {
    const el = document.createElement('div');
    el.id = id;
    el.style.cssText = 'position:fixed;inset:0;background:rgba(6,12,26,0.96);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1.5rem;backdrop-filter:blur(12px)';
    return el;
  }

  function _showSetup() {
    const ov = _gateOverlay('_aff-gate');
    ov.innerHTML =
      '<div style="max-width:400px;width:100%;background:linear-gradient(160deg,#0a1628,#0f2744);border:1px solid rgba(183,121,31,0.4);border-radius:1.5rem;padding:1.75rem">' +
        '<div style="text-align:center;margin-bottom:1.25rem">' +
          '<div style="font-size:2rem;margin-bottom:6px">🔐</div>' +
          '<h2 style="color:#f6c048;font-size:1.15rem;font-weight:800;margin:0">Create Admin Access</h2>' +
          '<p style="color:rgba(148,163,184,0.7);font-size:0.78rem;margin:4px 0 0">Protects your affiliate settings. Stored locally on this device.</p>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px">' +
          '<div>' +
            '<div style="color:#93c5fd;font-size:0.75rem;font-weight:700;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px">Email</div>' +
            '<input id="_ag-email" type="email" autocomplete="email" placeholder="your@email.com" style="' + _inp() + '">' +
          '</div>' +
          '<div>' +
            '<div style="color:#93c5fd;font-size:0.75rem;font-weight:700;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px">Password</div>' +
            '<input id="_ag-pwd" type="password" autocomplete="new-password" placeholder="Choose a password" style="' + _inp() + '" onkeydown="if(event.key===\'Enter\')document.getElementById(\'_ag-pwd2\').focus()">' +
          '</div>' +
          '<div>' +
            '<div style="color:#93c5fd;font-size:0.75rem;font-weight:700;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px">Confirm Password</div>' +
            '<input id="_ag-pwd2" type="password" autocomplete="new-password" placeholder="Repeat password" style="' + _inp() + '" onkeydown="if(event.key===\'Enter\')Affiliate._setupSave()">' +
          '</div>' +
          '<div id="_ag-err" style="color:#f87171;font-size:0.78rem;min-height:18px;text-align:center"></div>' +
          '<button onclick="Affiliate._setupSave()" style="width:100%;background:linear-gradient(135deg,#b7791f,#f6c048);color:#0a1628;border:none;border-radius:0.85rem;padding:0.85rem;font-size:1rem;font-weight:800;cursor:pointer;margin-top:4px">✅ Save & Open Settings</button>' +
          '<button onclick="document.getElementById(\'_aff-gate\').remove()" style="background:none;border:none;color:rgba(100,116,139,0.6);font-size:0.8rem;cursor:pointer;width:100%;padding:4px">Cancel</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    setTimeout(() => document.getElementById('_ag-email')?.focus(), 100);
  }

  function _showLogin(email) {
    const ov = _gateOverlay('_aff-gate');
    ov.innerHTML =
      '<div style="max-width:380px;width:100%;background:linear-gradient(160deg,#0a1628,#0f2744);border:1px solid rgba(183,121,31,0.4);border-radius:1.5rem;padding:1.75rem">' +
        '<div style="text-align:center;margin-bottom:1.25rem">' +
          '<div style="font-size:2rem;margin-bottom:6px">🔐</div>' +
          '<h2 style="color:#f6c048;font-size:1.15rem;font-weight:800;margin:0">Admin Login</h2>' +
          '<p style="color:rgba(148,163,184,0.55);font-size:0.78rem;margin:4px 0 0">' + _esc(email) + '</p>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px">' +
          '<div>' +
            '<div style="color:#93c5fd;font-size:0.75rem;font-weight:700;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px">Password</div>' +
            '<input id="_ag-pwd" type="password" autocomplete="current-password" placeholder="Enter your password" style="' + _inp() + '" onkeydown="if(event.key===\'Enter\')Affiliate._loginCheck()">' +
          '</div>' +
          '<div id="_ag-err" style="color:#f87171;font-size:0.78rem;min-height:18px;text-align:center"></div>' +
          '<button onclick="Affiliate._loginCheck()" style="width:100%;background:linear-gradient(135deg,#b7791f,#f6c048);color:#0a1628;border:none;border-radius:0.85rem;padding:0.85rem;font-size:1rem;font-weight:800;cursor:pointer">🔓 Login</button>' +
          '<div style="display:flex;justify-content:space-between;margin-top:2px">' +
            '<button onclick="document.getElementById(\'_aff-gate\').remove()" style="background:none;border:none;color:rgba(100,116,139,0.6);font-size:0.78rem;cursor:pointer">Cancel</button>' +
            '<button onclick="Affiliate._resetAuth()" style="background:none;border:none;color:rgba(100,116,139,0.45);font-size:0.72rem;cursor:pointer">Forgot password?</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    setTimeout(() => document.getElementById('_ag-pwd')?.focus(), 100);
  }

  async function _setupSave() {
    const email = (document.getElementById('_ag-email')?.value || '').trim();
    const pwd   = document.getElementById('_ag-pwd')?.value  || '';
    const pwd2  = document.getElementById('_ag-pwd2')?.value || '';
    const errEl = document.getElementById('_ag-err');
    if (!email || !email.includes('@')) { errEl.textContent = 'Enter a valid email.'; return; }
    if (pwd.length < 4)                 { errEl.textContent = 'Password must be at least 4 characters.'; return; }
    if (pwd !== pwd2)                   { errEl.textContent = 'Passwords do not match.'; return; }
    errEl.textContent = '';
    const hash = await _hash(pwd);
    _saveAuth(email, hash);
    document.getElementById('_aff-gate')?.remove();
    _showAdminPanel();
  }

  async function _loginCheck() {
    const pwd   = document.getElementById('_ag-pwd')?.value || '';
    const errEl = document.getElementById('_ag-err');
    const auth  = getAuth();
    if (!auth) { errEl.textContent = 'No credentials found.'; return; }
    const hash = await _hash(pwd);
    if (hash !== auth.hash) { errEl.textContent = 'Wrong password. Try again.'; return; }
    document.getElementById('_aff-gate')?.remove();
    _showAdminPanel();
  }

  function _resetAuth() {
    if (!confirm('This will delete your admin password and let you set a new one. Continue?')) return;
    localStorage.removeItem(AUTH_KEY);
    document.getElementById('_aff-gate')?.remove();
    _showSetup();
  }

  // ── Show admin panel (authenticated) ─────────────────────────────────────────
  function _showAdminPanel() {
    const ex = document.getElementById('_aff-admin');
    if (ex) { ex.remove(); return; }

    const cfg      = getCfg();
    const products = getProducts();

    const overlay = document.createElement('div');
    overlay.id = '_aff-admin';
    overlay.setAttribute('data-plt', cfg.platform);
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(6,12,26,0.96);z-index:2000;overflow-y:auto;padding:1.5rem 1rem;backdrop-filter:blur(12px)';

    const pltBtns = ['off', 'amazon', 'aliexpress', 'both'].map(p => {
      const a = cfg.platform === p;
      const labels = { off:'Off', amazon:'🛒 Amazon', aliexpress:'🛍️ AliExpress', both:'🔀 Both' };
      return '<button onclick="Affiliate._setPlt(\'' + p + '\',this)" id="_aff-plt-' + p + '" style="padding:7px 15px;border-radius:8px;font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.18s;border:2px solid ' + (a?'#f6c048':'rgba(255,255,255,0.12)') + ';background:' + (a?'rgba(183,121,31,0.28)':'rgba(255,255,255,0.04)') + ';color:' + (a?'#f6c048':'#64748b') + '">' + labels[p] + '</button>';
    }).join('');

    const amzDim = cfg.platform === 'off' || cfg.platform === 'aliexpress';
    const aliDim = cfg.platform === 'off' || cfg.platform === 'amazon';

    overlay.innerHTML =
      '<div style="max-width:540px;margin:0 auto;background:linear-gradient(160deg,#0a1628,#0f2744);border:1px solid rgba(183,121,31,0.4);border-radius:1.5rem;padding:1.75rem">' +

        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">' +
          '<h2 style="color:#f6c048;font-size:1.25rem;font-weight:800;margin:0">⚙️ Affiliate Settings</h2>' +
          '<button onclick="document.getElementById(\'_aff-admin\').remove()" style="background:none;border:none;color:#64748b;font-size:1.5rem;cursor:pointer;line-height:1">✕</button>' +
        '</div>' +

        '<div style="margin-bottom:1.25rem">' +
          '<div style="color:#93c5fd;font-size:0.78rem;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">Platform</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' + pltBtns + '</div>' +
        '</div>' +

        '<div id="_aff-amz" style="margin-bottom:1.25rem;transition:opacity 0.2s;' + (amzDim ? 'opacity:0.35;pointer-events:none' : '') + '">' +
          '<div style="color:#fb923c;font-size:0.78rem;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">🛒 Amazon Associate Tag</div>' +
          '<input id="_aff-amz-tag" type="text" value="' + _esc(cfg.amazonTag) + '" placeholder="yourname-20" style="' + _inp() + '">' +
          '<div style="color:rgba(148,163,184,0.55);font-size:0.71rem;margin-top:4px">Your tracking ID (e.g. <code style="background:rgba(255,255,255,0.08);padding:1px 4px;border-radius:3px">adbitrush-20</code>). Amazon product URLs will auto-get <code style="background:rgba(255,255,255,0.08);padding:1px 4px;border-radius:3px">?tag=…</code> appended.</div>' +
        '</div>' +

        '<div id="_aff-ali" style="margin-bottom:1.25rem;transition:opacity 0.2s;' + (aliDim ? 'opacity:0.35;pointer-events:none' : '') + '">' +
          '<div style="color:#fb7185;font-size:0.78rem;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">🛍️ AliExpress Publisher ID</div>' +
          '<input id="_aff-ali-pid" type="text" value="' + _esc(cfg.aliPid) + '" placeholder="e.g. 1234567890" style="' + _inp('margin-bottom:8px') + '">' +
          '<div style="color:rgba(148,163,184,0.55);font-size:0.71rem;margin-top:-4px;margin-bottom:10px">Your PID from AliExpress Portals. Generate affiliate links there and paste the full URL into each product below.</div>' +
          '<div style="color:rgba(148,163,184,0.75);font-size:0.78rem;font-weight:600;margin-bottom:4px">App Key <span style="font-weight:400;opacity:0.65">(optional)</span></div>' +
          '<input id="_aff-ali-key" type="text" value="' + _esc(cfg.aliAppKey) + '" placeholder="App Key from AliExpress Portals" style="' + _inp() + '">' +
        '</div>' +

        '<div style="margin-bottom:1.25rem">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
            '<div style="color:#93c5fd;font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Products (' + products.length + ')</div>' +
            '<button onclick="Affiliate._openProdForm()" style="background:rgba(183,121,31,0.15);border:1px solid rgba(183,121,31,0.35);color:#f6c048;border-radius:6px;padding:4px 12px;font-size:0.78rem;font-weight:700;cursor:pointer">+ Add Product</button>' +
          '</div>' +
          '<div id="_aff-pl" style="display:flex;flex-direction:column;gap:6px">' +
            (products.length ? products.map(_prodRow).join('') : '<div style="color:#475569;font-size:0.82rem;text-align:center;padding:16px 0">No products yet. Add your first one.</div>') +
          '</div>' +
        '</div>' +

        '<button onclick="Affiliate._saveAdmin()" style="width:100%;background:linear-gradient(135deg,#b7791f,#f6c048);color:#0a1628;border:none;border-radius:0.9rem;padding:0.85rem;font-size:1rem;font-weight:800;cursor:pointer;margin-bottom:10px">✅ Save Settings</button>' +
        '<div style="color:rgba(148,163,184,0.4);font-size:0.7rem;text-align:center">Saved in browser only. Reopen: tap the pill 5\xd7 or add <code>?admin</code> to the URL.</div>' +
      '</div>';

    document.body.appendChild(overlay);
  }

  // ── Admin: platform toggle ─────────────────────────────────────────────────────
  function _setPlt(p, _btn) {
    document.getElementById('_aff-admin')?.setAttribute('data-plt', p);
    ['off', 'amazon', 'aliexpress', 'both'].forEach(id => {
      const b = document.getElementById('_aff-plt-' + id);
      if (!b) return;
      const a = id === p;
      b.style.borderColor = a ? '#f6c048' : 'rgba(255,255,255,0.12)';
      b.style.background  = a ? 'rgba(183,121,31,0.28)' : 'rgba(255,255,255,0.04)';
      b.style.color       = a ? '#f6c048' : '#64748b';
    });
    const amzDim = p === 'off' || p === 'aliexpress';
    const aliDim = p === 'off' || p === 'amazon';
    const amzEl = document.getElementById('_aff-amz');
    const aliEl = document.getElementById('_aff-ali');
    if (amzEl) { amzEl.style.opacity = amzDim ? '0.35' : '1'; amzEl.style.pointerEvents = amzDim ? 'none' : 'auto'; }
    if (aliEl) { aliEl.style.opacity = aliDim ? '0.35' : '1'; aliEl.style.pointerEvents = aliDim ? 'none' : 'auto'; }
  }

  // ── Admin: save config ─────────────────────────────────────────────────────────
  function _saveAdmin() {
    const platform = document.getElementById('_aff-admin')?.getAttribute('data-plt') || 'off';
    saveCfg({
      platform,
      amazonTag: (document.getElementById('_aff-amz-tag')?.value || '').trim(),
      aliPid:    (document.getElementById('_aff-ali-pid')?.value || '').trim(),
      aliAppKey: (document.getElementById('_aff-ali-key')?.value || '').trim(),
    });
    document.getElementById('_aff-admin')?.remove();
    _refresh();
    _toast('✅ Affiliate settings saved!');
  }

  // ── Admin: product CRUD ────────────────────────────────────────────────────────
  function _openProdForm() {
    document.getElementById('_pf')?.remove();
    const list = document.getElementById('_aff-pl');
    if (!list) return;
    const div = document.createElement('div');
    div.innerHTML = _prodForm(null, -1);
    list.appendChild(div.firstElementChild);
  }

  function _editProd(i) {
    document.getElementById('_pf')?.remove();
    const row = document.querySelector('[data-pr="' + i + '"]');
    if (!row) return;
    const div = document.createElement('div');
    div.innerHTML = _prodForm(getProducts()[i], i);
    row.insertAdjacentElement('afterend', div.firstElementChild);
  }

  function _saveProd(i) {
    const p = {
      emoji:      (document.getElementById('_pf-emoji')?.value  || '🛍️').trim(),
      name_en:    (document.getElementById('_pf-name-en')?.value || '').trim(),
      name_he:    (document.getElementById('_pf-name-he')?.value || '').trim(),
      desc_en:    (document.getElementById('_pf-desc-en')?.value || '').trim(),
      desc_he:    (document.getElementById('_pf-desc-he')?.value || '').trim(),
      img:        (document.getElementById('_pf-img')?.value     || '').trim(),
      amazon_url: (document.getElementById('_pf-amazon')?.value  || '').trim(),
      ali_url:    (document.getElementById('_pf-ali')?.value     || '').trim(),
      active:     document.getElementById('_pf-active')?.checked !== false,
    };
    const products = getProducts();
    if (i >= 0) { products[i] = p; } else { products.push(p); }
    saveProducts(products);
    document.getElementById('_pf')?.remove();
    _rebuildList();
  }

  function _delProd(i) {
    if (!confirm('Delete this product?')) return;
    const products = getProducts();
    products.splice(i, 1);
    saveProducts(products);
    _rebuildList();
  }

  // ── Toast ─────────────────────────────────────────────────────────────────────
  function _toast(msg) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:#0f2744;border:1px solid #b7791f;color:#f6c048;padding:10px 22px;border-radius:10px;font-size:0.9rem;font-weight:700;z-index:3000;transition:opacity 0.4s;white-space:nowrap';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 420); }, 2500);
  }

  // ── Refresh display (called after save) ───────────────────────────────────────
  function _refresh() {
    clearInterval(_tickerIv);
    _prodIdx = 0;

    const cfg  = getCfg();
    const pill = document.querySelector('.ad-pill');

    if (cfg.platform !== 'off') {
      _takeover();
      _refreshSideBar();
    } else {
      if (pill) pill.textContent = 'Ad';
      const el = document.getElementById('adFallback');
      if (el) el.textContent = '';
      // Restart original ticker if we stored it
      const orig = window._rotateAdTicker;
      if (typeof orig === 'function') {
        orig();
        window._adTickerIv = setInterval(orig, 6000);
      }
      _refreshSideBar();
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────────
  function init() {
    _setupTrigger();
    const cfg = getCfg();
    if (cfg.platform !== 'off') {
      _takeover();
      _refreshSideBar();
    }
  }

  return {
    init, showAdmin, getCfg, getProducts, saveCfg, saveProducts, getAuth,
    // Auth gate callbacks (inline onclick)
    _setupSave, _loginCheck, _resetAuth,
    // Admin panel callbacks (inline onclick)
    _setPlt, _saveAdmin, _openProdForm, _editProd, _saveProd, _delProd,
  };
})();

Affiliate.init();
