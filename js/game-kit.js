/* game-kit.js — shared pieces for the 2026-10 game waves (cards, boards, arcade).
   Loaded on every page (index.html), before any game file. Each new game stays one file in js/games/<id>.js.
   GameKit.finish(id, win, text): ends a session through the shared end screen (index.html levelComplete):
     win  -> "Well Done!", level-up, badges, daily challenge;  !win -> honest "Nice try", Play again at the same level.
     Either way the game counts as played for the streak. text = the result line shown under the title.
   2026-11 card/table visual overhaul: same card(c, o) API and the same gk-* class hooks; only the look changed.
     Everything is code-drawn (CSS gradients + inline SVG data-URIs), no external assets. */
(function () {
  const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const SUITS = ['♠', '♥', '♦', '♣'];   // 1,2 red
  const isRed = (s) => s === 1 || s === 2;
  // U+FE0E (text presentation) after a suit glyph stops iOS / Android drawing it as a colour emoji, which would ignore
  // our red / black and look childish. Used in the visible spans only: SUITS and the aria-label stay exactly as before.
  const TXT = '︎';

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
      + `<span class="gk-tl"><span class="gk-r">${RANKS[c.r]}</span>${o.rankOnly ? '' : `<span class="gk-ts">${SUITS[c.s]}${TXT}</span>`}</span>`
      + (o.rankOnly ? '' : `<span class="gk-s">${SUITS[c.s]}${TXT}</span>`) + `</div>`;
  }

  function finish(id, win, text) {
    if (!gameState.active || gameState.currentId !== id) return;
    gameState[id]._outcome = { win: !!win, text: text || '' };
    setTimeout(() => { if (gameState.active && gameState.currentId === id) levelComplete(); }, win ? 500 : 900);
  }

  // a big, warm button
  const btn = (label, onclick, o) => (css(), `<button type="button" class="gk-btn${o && o.cls ? ' ' + o.cls : ''}" onclick="${onclick}"${o && o.disabled ? ' disabled' : ''}${o && o.id ? ` id="${o.id}"` : ''}>${label}</button>`);
  const icon = (n) => (typeof Icon !== 'undefined' ? Icon.ui(n) + ' ' : '');

  // inline SVG -> CSS url(), so the textures below stay readable in source
  const svg = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
  // felt: fine dark speckle over the green, tiled 160 px
  const FELT = svg("<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='.5'/></svg>");
  // card back: gold diamond lattice on burgundy with a small gold stud in every diamond; one tile, scaled with --w
  const BACK = svg("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><rect width='20' height='20' fill='#7a1828'/><path d='M-1-1L21 21M21-1L-1 21' stroke='#d9b163' stroke-width='1.7'/><g fill='#f0cf86'><circle cx='10' cy='0' r='1.7'/><circle cx='10' cy='20' r='1.7'/><circle cx='0' cy='10' r='1.7'/><circle cx='20' cy='10' r='1.7'/></g></svg>");

  function css() {
    if (document.getElementById('gk-css')) return;
    const st = document.createElement('style'); st.id = 'gk-css';
    st.textContent = `
.gk-table,.gk-wood{--w:clamp(40px,10.5vw,74px);width:100%;box-sizing:border-box}
/* the felt table. background is !important on purpose: adding gk-table to a board that still carries its own
   green (inline style or per-game CSS) must win, so every game gets the same felt without touching its code */
.gk-table{background:radial-gradient(ellipse 80% 62% at 50% 30%,rgba(255,255,255,.10),rgba(255,255,255,0) 72%),radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 50%,rgba(0,0,0,.36) 100%),${FELT} #1c6240 !important;border-radius:18px;padding:12px;box-shadow:inset 0 0 0 3px #113b26,inset 0 0 0 4px rgba(255,236,190,.20),inset 0 4px 20px rgba(0,0,0,.45),0 12px 30px -14px rgba(0,0,0,.6);color:#fff7e6}
.gk-wood{background:linear-gradient(160deg,#8a5a2b,#6b4220);border-radius:18px;padding:12px;box-shadow:inset 0 0 0 3px #4d2f15,inset 0 4px 18px rgba(0,0,0,.3),0 12px 30px -14px rgba(0,0,0,.55);color:#fff7e6}
.gk-status{font-size:1.15rem;font-weight:800;text-align:center;min-height:1.6em;margin:6px 0 10px;color:#fff7e6;text-shadow:0 1px 2px rgba(0,0,0,.55)}
.gk-row{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;align-items:flex-start}

/* ---- cards. Size comes only from --w (set by the table default or by GameKit.fit); border stays 2px so no layout moves ---- */
.gk-card,.gk-slot{width:var(--w,clamp(40px,10.5vw,74px));height:calc(var(--w,clamp(40px,10.5vw,74px))*1.4);border-radius:clamp(6px,calc(var(--w,60px)*.17),12px);flex:0 0 auto;position:relative;user-select:none;-webkit-user-select:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
/* face: warm white paper, cream inner border, a dark hairline + layered soft shadows so it reads as a physical card */
.gk-card.gk-up{background:linear-gradient(180deg,#fffefa,#fbf5e6);border:2px solid #eadcb9;color:#17140f;box-shadow:0 0 0 1px rgba(58,40,12,.42),0 1px 1px rgba(0,0,0,.30),0 3px 7px rgba(0,0,0,.30);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;line-height:1;overflow:hidden;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-variant-numeric:lining-nums}
/* top strip: must stay inside the 0.4 x --w that shows when .gk-col overlaps cards, so it sits tight to the top edge */
.gk-card .gk-tl{display:flex;align-items:baseline;justify-content:center;gap:calc(var(--w,60px)*.02);width:100%;padding-top:0;line-height:.9;white-space:nowrap}
.gk-card .gk-r{font-size:calc(var(--w,60px)*.42);font-weight:800;letter-spacing:-.05em}
.gk-card .gk-ts,.gk-card .gk-s{font-family:'Segoe UI Symbol','Apple Symbols','Noto Sans Symbols2','Noto Sans Symbols','DejaVu Sans','Arial Unicode MS',sans-serif;font-variant-emoji:text;font-weight:400}
.gk-card .gk-ts{font-size:calc(var(--w,60px)*.34)}
/* the big suit fills and centres in whatever is left under the strip */
.gk-card .gk-s{font-size:calc(var(--w,60px)*.72);flex:1 1 auto;display:flex;align-items:center;justify-content:center;margin-top:0;padding-bottom:calc(var(--w,60px)*.05)}
.gk-card.gk-red{color:#b3141c}
/* back: burgundy margin, thin gold frame, gold diamond lattice inside */
.gk-card.gk-down{background:${BACK} 50% 50%/calc(var(--w,60px)*.24) calc(var(--w,60px)*.24) #7a1828;border:2px solid #f4e6c4;box-shadow:inset 0 0 0 calc(var(--w,60px)*.05) #6d1322,inset 0 0 0 calc(var(--w,60px)*.05 + 1.5px) #e6c275,0 0 0 1px rgba(40,10,10,.5),0 1px 1px rgba(0,0,0,.30),0 3px 7px rgba(0,0,0,.30)}
/* empty place: pressed into the felt */
.gk-slot{border:2px dashed rgba(255,244,214,.62);background:rgba(0,0,0,.17);box-shadow:inset 0 2px 7px rgba(0,0,0,.30);display:flex;align-items:center;justify-content:center;color:rgba(255,247,230,.85);font-weight:800;font-size:calc(var(--w,60px)*.36)}

/* ---- interaction states (transparent outlines turn solid in Windows high-contrast mode, where shadows vanish) ---- */
/* legal-move hint: soft green pulse */
.gk-hint,.gk-card.gk-hint,.gk-slot.gk-hint{outline:3px solid transparent;outline-offset:1px;box-shadow:0 0 0 3px #46e08d,0 0 12px 4px rgba(150,255,190,.6),0 2px 5px rgba(0,0,0,.3);animation:gk-pulse 1.7s ease-in-out infinite}
@keyframes gk-pulse{0%,100%{box-shadow:0 0 0 3px #35d07f,0 0 4px 1px rgba(150,255,190,.30),0 2px 5px rgba(0,0,0,.3)}50%{box-shadow:0 0 0 4px #6bf5ab,0 0 18px 7px rgba(150,255,190,.85),0 2px 5px rgba(0,0,0,.3)}}
/* selected: lifts, warm gold ring and glow */
.gk-sel{transform:translateY(min(-4px,calc(var(--w,60px)*-.09)));outline:3px solid transparent;outline-offset:1px}
.gk-sel,.gk-card.gk-sel,.gk-slot.gk-sel{border-color:#f0a400;box-shadow:0 0 0 3px #ffbe1a,0 0 16px 5px rgba(255,200,60,.75),0 9px 14px rgba(0,0,0,.42);animation:none}
/* keyboard focus: white ring inside a deep-blue ring, obvious on felt, wood and paper alike */
.gk-card:focus-visible,.gk-slot:focus-visible,.gk-btn:focus-visible{outline:4px solid #fff;outline-offset:2px;box-shadow:0 0 0 9px #0b3d91;animation:none}

.gk-btn{min-height:52px;min-width:52px;padding:8px 18px;border-radius:14px;border:2px solid #fde7c4;background:#fff7e6;color:#3b1d0e;font-weight:800;font-size:1.05rem;cursor:pointer;display:inline-flex;align-items:center;gap:6px;justify-content:center;box-shadow:0 2px 0 rgba(0,0,0,.28),0 4px 10px -4px rgba(0,0,0,.4)}
.gk-btn:disabled{opacity:.45;cursor:default}
.gk-btn.gk-primary{background:#f59e0b;border-color:#92400e;color:#2a1700}
.gk-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0}
.gk-col{display:flex;flex-direction:column;align-items:center;min-height:calc(var(--w,60px)*1.4)}
.gk-col .gk-card+.gk-card{margin-top:calc(var(--w,60px)*-1.0)}
.gk-col.gk-tight .gk-card+.gk-card{margin-top:calc(var(--w,60px)*-1.12)}
/* tight columns show only 0.28 x --w of a covered card: shrink that strip so the rank is whole instead of cut in half */
.gk-col.gk-tight .gk-card:not(:last-child) .gk-r{font-size:calc(var(--w,60px)*.30)}
.gk-col.gk-tight .gk-card:not(:last-child) .gk-ts{font-size:calc(var(--w,60px)*.25)}
.gk-hand{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.gk-label{font-size:.95rem;font-weight:800;color:#fde7c4;text-align:center;margin:4px 0;text-shadow:0 1px 2px rgba(0,0,0,.45)}
.gk-big{font-size:1.3rem}
@media (prefers-reduced-motion:reduce){.gk-sel{transform:none}.gk-hint,.gk-card.gk-hint,.gk-slot.gk-hint{animation:none}}`;
    document.head.appendChild(st);
  }

  // size the cards so `cols` columns fit the table exactly (measured, not guessed). Re-run on resize / rotation.
  // min (default 28) may be lowered by a game whose columns must all fit a 320 px phone (Spider's 10 columns)
  function fit(sel, cols, gap, max, min) {
    const t = document.querySelector(sel); if (!t) return;
    const cs = getComputedStyle(t), inner = t.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    t.style.setProperty('--w', Math.max(min || 28, Math.min(max, Math.floor((inner - gap * (cols - 1)) / cols))) + 'px');
  }
  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (typeof gameState !== 'undefined' && gameState.active && window['_fitNow_' + gameState.currentId]) window['_fitNow_' + gameState.currentId](); }, 150); });
  // 2026-11-03: a game's own keyboard shortcut must not fire with a browser shortcut held, while typing, or under an open menu or dialog.
  function keyBlocked(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return true;
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return true;
    const m = document.getElementById('gameMenu'); if (m && !m.classList.contains('hidden')) return true;
    const d = document.getElementById('modal'); if (d && !d.classList.contains('hidden')) return true;
    return false;
  }
  // Games that redraw with innerHTML lose keyboard focus. Call focusKey(el) before the redraw and restoreFocus(el, key) after it.
  // If the same control is gone or disabled, focus goes to the status line, never to another button: Enter must not press New game by accident.
  function focusKey(el) {
    const a = document.activeElement; if (!a || !el.contains(a)) return null;
    if (a.getAttribute('role') === 'status') return '@status';
    return a.getAttribute('onclick');
  }
  function restoreFocus(el, key) {
    if (!key) return;
    const n = key === '@status' ? null : [...el.querySelectorAll('[onclick]')].find((x) => x.getAttribute('onclick') === key && !x.disabled);
    if (n) { n.focus({ preventScroll: true }); return; }
    const st = el.querySelector('[role="status"]'); if (st) { st.setAttribute('tabindex', '-1'); st.focus({ preventScroll: true }); }
  }
  window.GameKit = { RANKS, SUITS, isRed, deck, card, finish, btn, icon, css, fit, keyBlocked, focusKey, restoreFocus };
})();