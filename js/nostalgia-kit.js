/* nostalgia-kit.js — shared runtime for the 2026-11 nostalgia games (batch 2 onward). Loaded on every page after
   game-kit.js. Each game stays one file in js/games/<id>.js and calls NK.start(id, def) from its init function.

   Why it exists (the batch-1 review found these, and every game would otherwise repeat the fixes):
   - ONE global key listener (capture phase), installed once. Starting, restarting or levelling up a game never adds
     another listener, so nothing accumulates. It is active only while an NK game is the current game.
   - Held keys: a game action never repeats on key auto-repeat (only plain focus movement may repeat).
   - Header controls keep their keys: Enter/Space on a focused button outside the game area is left to the browser
     (the shared kbnav.js would otherwise swallow it), and Ctrl/Cmd/Alt shortcuts are never touched.
   - Letter shortcuts match the PHYSICAL key (e.code), so they work on a Hebrew (or any) keyboard layout.
   - Focus survives redraws: buttons carry data-k; the focused one is focused again after every render.
   - Timers belong to a session: NK.after / NK.every / NK.raf callbacks are dropped after a restart, level-up or exit,
     and NK.finish only opens the end screen for the session that finished.
   - The game root element is created once per session, so premium.css's entrance animation (on #gameContent > *)
     plays once, not on every move.
   - Right-to-left pages: the game root is dir="ltr" (English game text), status lines and the shared title,
     instructions and end-screen text get dir="auto" so punctuation lands on the correct side.

   def = { setup(gs, diff), view(gs) -> html, keys: {code: fn | {fn, repeat}}, arrows(dir, e) -> handled?, css,
           rules: [html...] }.  The game's state is gameState[id] (gs). */
(function () {
  const defs = {};
  let sess = null, seq = 0;
  const modalOpen = () => { const m = document.getElementById('modal'); return m && !m.classList.contains('hidden'); };
  const cur = () => (sess && typeof gameState !== 'undefined' && gameState.active && gameState.currentId === sess.id ? sess : null);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function stop() {
    if (!sess) return;
    sess.timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
    sess.rafs.forEach((r) => cancelAnimationFrame(r));
    sess = null;
  }
  function start(id, def) {
    // a foreign cleanup (another game's) is honoured once; ours is just stop()
    if (window._gameCleanup && window._gameCleanup !== stop) { try { window._gameCleanup(); } catch (e) {} }
    stop();
    css(); if (typeof GameKit !== 'undefined') GameKit.css();   // .gk-btn styles live in game-kit.js
    defs[id] = def;
    const gs = gameState[id];
    sess = { id, def, token: ++seq, timers: [], rafs: [] };
    gs._nk = sess.token;
    window._gameCleanup = stop;
    ['gameTitle', 'gameInstructions', 'modalTitle', 'modalBody'].forEach((x) => { const e = document.getElementById(x); if (e) e.setAttribute('dir', 'auto'); });
    if (def.css && !document.getElementById('nk-css-' + id)) { const st = document.createElement('style'); st.id = 'nk-css-' + id; st.textContent = def.css; document.head.appendChild(st); }
    const el = document.getElementById('gameContent');
    el.innerHTML = `<div class="nk nk-${id}" dir="ltr" tabindex="-1"></div>`;
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    def.setup(gs, diff);
    render(id);
  }
  function render(id) {
    const s = cur(); if (!s || s.id !== id) return;
    const root = document.querySelector('#gameContent > .nk'); if (!root) return;
    const a = document.activeElement, key = a && root.contains(a) && a.dataset ? a.dataset.k : null, hadFocus = a && root.contains(a);
    const gs = gameState[id];
    root.innerHTML = s.def.view(gs) + (s.def.rules ? rules(s.def.rules, gs) : '');
    if (key) { const n = root.querySelector(`[data-k="${CSS.escape(key)}"]`); if (n && !n.disabled) n.focus({ preventScroll: true }); else root.focus({ preventScroll: true }); }
    else if (hadFocus) root.focus({ preventScroll: true });
  }
  // the session's own timers: dropped on restart / exit, and never run for another session
  function after(ms, fn) { const s = sess; if (!s) return; const tok = s.token; const t = setTimeout(() => { if (sess && sess.token === tok && cur()) fn(); }, ms); s.timers.push(t); return t; }
  function every(ms, fn) { const s = sess; if (!s) return; const tok = s.token; const t = setInterval(() => { if (sess && sess.token === tok && cur()) fn(); }, ms); s.timers.push(t); return t; }
  function raf(fn) { const s = sess; if (!s) return; const tok = s.token; const r = requestAnimationFrame((ts) => { if (sess && sess.token === tok && cur()) fn(ts); }); s.rafs.push(r); return r; }
  const live = (id) => !!(sess && sess.id === id && cur());

  function finish(id, win, text) {
    const gs = gameState[id]; if (!gs || !live(id)) return;
    gs._outcome = { win: !!win, text: text || '' };
    after(win ? 600 : 900, () => { if (gameState.currentId === id && gameState[id] === gs && !modalOpen()) levelComplete(); });
  }

  // helpers for views
  const btn = (label, onclick, o) => { o = o || {}; return `<button type="button" class="gk-btn${o.cls ? ' ' + o.cls : ''}" onclick="${onclick}" data-k="${esc(o.k || onclick)}"${o.disabled ? ' disabled' : ''}${o.label ? ` aria-label="${esc(o.label)}"` : ''}${o.pressed !== undefined ? ` aria-pressed="${!!o.pressed}"` : ''}>${label}</button>`; };
  const icon = (n) => (typeof Icon !== 'undefined' ? Icon.ui(n) + ' ' : '');
  const msg = (text) => `<div class="nk-msg" role="status" aria-live="polite" dir="auto">${text || ''}</div>`;
  const rules = (items, gs) => `<details class="nk-rules"${gs && gs._rulesOpen ? ' open' : ''} ontoggle="NK._rt(this)"><summary data-k="nk-rules">How to play</summary><ul>${(typeof items === 'function' ? items(gs) : items).map((x) => `<li>${x}</li>`).join('')}</ul></details>`;
  function _rt(d) { const s = cur(); if (s) gameState[s.id]._rulesOpen = d.open; }
  const pl = (n, w, ws) => `${n} ${n === 1 ? w : ws || w + 's'}`;   // "1 shot", "2 shots"
  const digits = (fn, n) => { const o = {}; for (let i = 1; i <= (n || 9); i++) { o['Digit' + i] = () => fn(i); o['Numpad' + i] = () => fn(i); } return o; };

  // spatial focus movement among the game's buttons
  function moveFocus(dir) {
    const root = document.querySelector('#gameContent > .nk'); if (!root) return false;
    const els = [...root.querySelectorAll('button:not([disabled]),summary,[data-k][tabindex]')].filter((x) => { const r = x.getBoundingClientRect(); return r.width > 2 && r.height > 2; });
    if (!els.length) return false;
    const a = document.activeElement;
    let i = els.indexOf(a);
    if (i < 0) { (root.querySelector('[data-first]:not([disabled])') || els[0]).focus(); return true; }
    const c = a.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2;
    let best = null, bs = Infinity;
    els.forEach((x) => {
      if (x === a) return; const r = x.getBoundingClientRect(), dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy;
      const along = dir === 'right' ? dx : dir === 'left' ? -dx : dir === 'down' ? dy : -dy, perp = dir === 'right' || dir === 'left' ? Math.abs(dy) : Math.abs(dx);
      if (along <= 4) return; const sc = along + perp * 2.2; if (sc < bs) { bs = sc; best = x; }
    });
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    return true;
  }
  const DIRS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
  window.addEventListener('keydown', (e) => {
    const s = cur(); if (!s || modalOpen()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;                       // browser and system shortcuts stay untouched
    const t = e.target || document.body;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
    const root = document.querySelector('#gameContent > .nk');
    const inGame = t === document.body || t === document.documentElement || (root && root.contains(t));
    if (!inGame) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); return; }   // header controls: native Enter/Space
    const done = () => { e.preventDefault(); e.stopPropagation(); };
    const k = s.def.keys && (s.def.keys[e.code] || s.def.keys[e.key]);
    if (k) { const fn = typeof k === 'function' ? k : k.fn; if (e.repeat && !(k.repeat)) return done(); fn(e); return done(); }
    const dir = DIRS[e.key];
    if (dir) { if (s.def.arrows && s.def.arrows(dir, e) !== false) return done(); moveFocus(dir); return done(); }
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.repeat) return done();
      if (t.tagName === 'SUMMARY') { e.stopPropagation(); return; }         // native toggle of "How to play" (kbnav must not swallow it)
      if (t !== document.body && t !== root && typeof t.click === 'function') { t.click(); return done(); }
      if (s.def.enter) { s.def.enter(e); return done(); }
      return done();
    }
  }, true);

  function css() {
    if (document.getElementById('nk-css')) return;
    const st = document.createElement('style'); st.id = 'nk-css';
    st.textContent = `
.nk{width:100%;box-sizing:border-box;max-width:46rem;margin:0 auto;color:#2b1b0d;outline:none}
.nk-top{display:flex;justify-content:space-between;align-items:center;gap:8px 14px;flex-wrap:wrap;font-size:1.15rem;margin:0 2px 10px}
.nk-msg{text-align:center;font-weight:800;font-size:1.15rem;line-height:1.4;margin:12px 4px;min-height:2.9em;color:#2b1b0d}
.nk-rules{background:#fff3d6;border:2px solid #e8cfa8;border-radius:14px;padding:6px 14px;margin-top:8px;font-size:1.05rem;color:#2b1b0d}
.nk-rules summary{font-weight:800;cursor:pointer;min-height:48px;display:flex;align-items:center}
.nk-rules li{margin:6px 0 6px 1.2em;list-style:disc;line-height:1.45}
.nk .gk-btn{border-color:#c9a46a}
.nk .gk-btn[aria-pressed="true"]{background:#f59e0b;border-color:#92400e;color:#2a1700}
.nk-wood{background:linear-gradient(160deg,#9a6531,#6b4220);border-radius:20px;padding:10px;box-shadow:inset 0 0 0 3px #4d2f15,0 8px 20px -12px rgba(0,0,0,.5)}
.nk-felt{background:radial-gradient(ellipse at 50% 30%,#2f7d4f,#1f5c38 70%);border-radius:18px;padding:12px;box-shadow:inset 0 0 0 3px #174a2c;color:#fff7e6}
.nk-paper{background:#fffdf5;border:3px solid #e8cfa8;border-radius:16px;padding:12px;box-shadow:0 6px 18px -10px rgba(0,0,0,.35)}
#gameContent .nk button.nk-cell,#gameContent .nk button.nk-cell:hover,#gameContent .nk button.nk-cell:active{transform:none;box-shadow:none;transition:none;overflow:visible;border-radius:var(--nk-r,8px)!important;border-width:var(--nk-bw,0)!important}
#gameContent .nk button.nk-cell::after{display:none}
#gameContent .nk button.nk-cell:focus-visible{outline:4px solid #1d4ed8!important;outline-offset:1px!important;z-index:5}
#gameContent .nk .gk-btn:hover{transform:none}
@media (prefers-reduced-motion:reduce){.nk *{animation:none!important;transition:none!important}}`;
    document.head.appendChild(st);
  }
  window.NK = { start, stop, render, after, every, raf, live, finish, btn, icon, msg, rules, digits, pl, esc, _rt, moveFocus, modalOpen };
})();
