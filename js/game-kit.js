/* game-kit.js — shared pieces for the 2026-10 game waves (cards, boards, arcade).
   Loaded on every page (index.html), before any game file. Each new game stays one file in js/games/<id>.js.
   GameKit.finish(id, win, text): ends a session through the shared end screen (index.html levelComplete):
     win  -> "Well Done!", level-up, badges, daily challenge;  !win -> honest "Nice try", Play again at the same level.
     Either way the game counts as played for the streak. text = the result line shown under the title. */
(function () {
  const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const SUITS = ['♠', '♥', '♦', '♣'];   // 1,2 red
  const isRed = (s) => s === 1 || s === 2;

  function deck(opts) {
    opts = opts || {};
    const suits = opts.suits || [0, 1, 2, 3], copies = opts.copies || 1, out = [];
    for (let k = 0; k < copies; k++) for (const s of suits) for (let r = 1; r <= 13; r++) out.push({ r, s, up: false, id: out.length });
    return shuffle(out);
  }

  // one card as HTML. o: {sel, down, onclick, small, rankOnly, cls, hint}
  function card(c, o) {
    o = o || {};
    const on = o.onclick ? ` onclick="${o.onclick}"` : '';
    if (!c) return `<div class="gk-slot${o.cls ? ' ' + o.cls : ''}"${on}>${o.label || ''}</div>`;
    if (o.down || !c.up) return `<div class="gk-card gk-down${o.cls ? ' ' + o.cls : ''}"${on} aria-label="face-down card"></div>`;
    const red = isRed(c.s) ? ' gk-red' : '';
    const sel = o.sel ? ' gk-sel' : '', hint = o.hint ? ' gk-hint' : '';
    const label = RANKS[c.r] + (o.rankOnly ? '' : SUITS[c.s]);
    return `<div class="gk-card gk-up${red}${sel}${hint}${o.cls ? ' ' + o.cls : ''}"${on} aria-label="${label}">`
      // rank and suit together on the top strip (visible when cards overlap), a big suit in the middle
      + `<span class="gk-tl"><span class="gk-r">${RANKS[c.r]}</span>${o.rankOnly ? '' : `<span class="gk-ts">${SUITS[c.s]}</span>`}</span>`
      + (o.rankOnly ? '' : `<span class="gk-s">${SUITS[c.s]}</span>`) + `</div>`;
  }

  function finish(id, win, text) {
    if (!gameState.active || gameState.currentId !== id) return;
    gameState[id]._outcome = { win: !!win, text: text || '' };
    setTimeout(() => { if (gameState.active && gameState.currentId === id) levelComplete(); }, win ? 500 : 900);
  }

  // a big, warm button
  const btn = (label, onclick, o) => `<button type="button" class="gk-btn${o && o.cls ? ' ' + o.cls : ''}" onclick="${onclick}"${o && o.disabled ? ' disabled' : ''}${o && o.id ? ` id="${o.id}"` : ''}>${label}</button>`;
  const icon = (n) => (typeof Icon !== 'undefined' ? Icon.ui(n) + ' ' : '');

  function css() {
    if (document.getElementById('gk-css')) return;
    const st = document.createElement('style'); st.id = 'gk-css';
    st.textContent = `
.gk-table,.gk-wood{--w:clamp(40px,10.5vw,74px);width:100%;box-sizing:border-box}
.gk-table{background:radial-gradient(ellipse at 50% 30%,#2f7d4f,#1f5c38 70%);border-radius:18px;padding:12px;box-shadow:inset 0 0 0 3px #174a2c,0 10px 30px -14px rgba(0,0,0,.5);color:#fff7e6}
.gk-wood{background:linear-gradient(160deg,#8a5a2b,#6b4220);border-radius:18px;padding:12px;box-shadow:inset 0 0 0 3px #4d2f15,0 10px 30px -14px rgba(0,0,0,.5);color:#fff7e6}
.gk-status{font-size:1.15rem;font-weight:800;text-align:center;min-height:1.6em;margin:6px 0 10px;color:#fff7e6;text-shadow:0 1px 2px rgba(0,0,0,.4)}
.gk-row{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;align-items:flex-start}
.gk-card,.gk-slot{width:var(--w,clamp(40px,10.5vw,74px));height:calc(var(--w,clamp(40px,10.5vw,74px))*1.4);border-radius:9px;flex:0 0 auto;position:relative;user-select:none;cursor:pointer}
.gk-card.gk-up{background:#fffdf7;border:2px solid #cbb994;color:#1d1b18;box-shadow:0 2px 4px rgba(0,0,0,.35);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;line-height:1;font-family:Georgia,'Times New Roman',serif}
.gk-card .gk-tl{display:flex;align-items:baseline;justify-content:center;gap:1px;width:100%;padding-top:calc(var(--w,60px)*.05);white-space:nowrap}
.gk-card .gk-r{font-size:calc(var(--w,60px)*.40);font-weight:700;letter-spacing:-.04em}
.gk-card .gk-ts{font-size:calc(var(--w,60px)*.30)}
.gk-card .gk-s{font-size:calc(var(--w,60px)*.55);margin-top:calc(var(--w,60px)*.12)}
.gk-card.gk-red{color:#c62828}
.gk-card.gk-down{background:repeating-linear-gradient(45deg,#7c2d12 0 6px,#9a3412 6px 12px);border:2px solid #fde7c4;box-shadow:0 2px 4px rgba(0,0,0,.35)}
.gk-slot{border:2px dashed rgba(255,247,230,.55);background:rgba(0,0,0,.12);display:flex;align-items:center;justify-content:center;color:rgba(255,247,230,.75);font-weight:800;font-size:calc(var(--w,60px)*.36)}
.gk-sel{outline:4px solid #fbbf24;outline-offset:1px;transform:translateY(-4px)}
.gk-hint{outline:4px dashed #fde68a;outline-offset:1px}
.gk-btn{min-height:52px;min-width:52px;padding:8px 18px;border-radius:14px;border:2px solid #fde7c4;background:#fff7e6;color:#3b1d0e;font-weight:800;font-size:1.05rem;cursor:pointer;display:inline-flex;align-items:center;gap:6px;justify-content:center}
.gk-btn:disabled{opacity:.45;cursor:default}
.gk-btn.gk-primary{background:#f59e0b;border-color:#92400e;color:#2a1700}
.gk-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0}
.gk-col{display:flex;flex-direction:column;align-items:center;min-height:calc(var(--w,60px)*1.4)}
.gk-col .gk-card+.gk-card{margin-top:calc(var(--w,60px)*-1.0)}
.gk-col.gk-tight .gk-card+.gk-card{margin-top:calc(var(--w,60px)*-1.12)}
.gk-hand{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.gk-label{font-size:.95rem;font-weight:800;color:#fde7c4;text-align:center;margin:4px 0}
.gk-big{font-size:1.3rem}
@media (prefers-reduced-motion:reduce){.gk-sel{transform:none}}`;
    document.head.appendChild(st);
  }

  // size the cards so `cols` columns fit the table exactly (measured, not guessed). Re-run on resize / rotation.
  function fit(sel, cols, gap, max) {
    const t = document.querySelector(sel); if (!t) return;
    const cs = getComputedStyle(t), inner = t.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    t.style.setProperty('--w', Math.max(28, Math.min(max, Math.floor((inner - gap * (cols - 1)) / cols))) + 'px');
  }
  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (gameState && gameState.active && window['_fitNow_' + gameState.currentId]) window['_fitNow_' + gameState.currentId](); }, 150); });
  window.GameKit = { RANKS, SUITS, isRed, deck, card, finish, btn, icon, css, fit };
})();
