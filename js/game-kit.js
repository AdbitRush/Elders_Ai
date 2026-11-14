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
.gk-table,.gk-wood{--w:clamp(46px,11.5vw,96px);width:100%;box-sizing:border-box}
/* the felt table. background is !important on purpose: adding gk-table to a board that still carries its own
   green (inline style or per-game CSS) must win, so every game gets the same felt without touching its code */
.gk-table{background:radial-gradient(ellipse 80% 62% at 50% 30%,rgba(255,255,255,.10),rgba(255,255,255,0) 72%),radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 50%,rgba(0,0,0,.36) 100%),${FELT} #1c6240 !important;border-radius:18px;padding:12px;box-shadow:inset 0 0 0 3px #113b26,inset 0 0 0 4px rgba(255,236,190,.20),inset 0 4px 20px rgba(0,0,0,.45),0 12px 30px -14px rgba(0,0,0,.6);color:#fff7e6}
.gk-wood{background:linear-gradient(160deg,#8a5a2b,#6b4220);border-radius:18px;padding:12px;box-shadow:inset 0 0 0 3px #4d2f15,inset 0 4px 18px rgba(0,0,0,.3),0 12px 30px -14px rgba(0,0,0,.55);color:#fff7e6}
.gk-status{font-size:1.15rem;font-weight:800;text-align:center;min-height:1.6em;margin:6px 0 10px;color:#fff7e6;text-shadow:0 1px 2px rgba(0,0,0,.55)}
.gk-row{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;align-items:flex-start}

/* ---- cards. Size comes only from --w (set by the table default or by GameKit.fit); border stays 2px so no layout moves ---- */
.gk-card,.gk-slot{width:var(--w,clamp(46px,11.5vw,96px));height:calc(var(--w,clamp(46px,11.5vw,96px))*1.4);border-radius:clamp(6px,calc(var(--w,60px)*.17),12px);flex:0 0 auto;position:relative;user-select:none;-webkit-user-select:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
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
})();/* QuizKit — the shared multiple-choice engine (2026-10 trivia expansion + wave 3 nostalgia quizzes).
   QuizKit.start(container, cfg)
     cfg.id      game id (gameState[cfg.id] holds the session)
     cfg.items   [{q, a, w:[wrong...], x, d, t, lv, img, credit}]   a = right answer, x = one-line explanation,
                 d = decade ('50s'..'80s'), t = topic key, lv = 1 easy / 2 / 3 hard
     cfg.decades / cfg.topics  [[key,label]...]  optional pickers shown before the round
     cfg.n       {easy, normal, hard} questions per round;  cfg.sortOpts: 'num' sorts numeric answers
     cfg.ask     optional item -> HTML for the question card (default: item.q)
   Every round: no repeats until the player has seen the whole (filtered) pool (localStorage gg_qk_seen_<id>);
   after each answer the right answer and the explanation stay on screen until the player taps Next.
   The score goes to the shared end screen (60% = Well Done!). */
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const T = {
    en: { start: 'Start', decade: 'Which years?', topic: 'Which topic?', all: 'All', q: 'Question', right: 'Right!', wrong: 'Not quite.', was: 'The answer is', next: 'Next', last: 'See my score', pool: (n) => `${n} questions in this mix` },
    he: { start: 'להתחיל', decade: 'אילו שנים?', topic: 'איזה נושא?', all: 'הכול', q: 'שאלה', right: 'נכון!', wrong: 'לא בדיוק.', was: 'התשובה היא', next: 'הבא', last: 'לתוצאה', pool: (n) => `${n} שאלות בבחירה הזו` },
  };
  const L = () => T[currentLang] || T.en;
  const key = (it) => { let h = 0; const s = it.q + '|' + it.a; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const cfgs = {};

  function css() {
    if (document.getElementById('qk-css')) return;
    const st = document.createElement('style'); st.id = 'qk-css';
    st.textContent = `
.qk{width:100%;box-sizing:border-box;max-width:44rem;margin:0 auto;color:var(--w-table-ink,#2b1b0d)}
.qk-top{display:flex;justify-content:space-between;font-weight:800;font-size:1.05rem;color:var(--w-table-ink2,#4a3420);margin:0 2px 10px}
.qk-card{background:#fff3d6;border:3px solid #e8cfa8;border-radius:18px;padding:18px 16px;font-size:clamp(1.3rem,4.6vw,1.75rem);font-weight:800;line-height:1.35;text-align:center;margin-bottom:16px;color:#2b1b0d}
.qk-card .qk-sub{display:block;font-size:.72em;font-weight:700;color:#5b3f22;margin-top:6px}
.qk-card img{display:block;margin:0 auto 10px;max-width:100%;max-height:42vh;border-radius:12px;border:3px solid #e8cfa8;background:#efe3cc}
.qk-credit{font-size:.75rem;font-weight:600;color:#6b5236;margin-top:4px}
.qk-opts{display:grid;gap:12px}
@media (min-width:640px){.qk-opts{grid-template-columns:1fr 1fr}}
.qk-opt{min-height:64px;padding:12px 14px;border-radius:16px;border:3px solid;font-size:1.25rem;font-weight:800;color:var(--w-q-ink,#1f1406);cursor:pointer;text-align:center;line-height:1.25}
.qk-opt:nth-child(4n+1){background:var(--w-q1,#ffe08a);border-color:var(--w-q1b,#c98a00)}
.qk-opt:nth-child(4n+2){background:var(--w-q2,#b9f0d2);border-color:var(--w-q2b,#2f9e66)}
.qk-opt:nth-child(4n+3){background:var(--w-q3,#cfe0ff);border-color:var(--w-q3b,#4a78c9)}
.qk-opt:nth-child(4n+4){background:var(--w-q4,#ffd0e1);border-color:var(--w-q4b,#c2507e)}
.qk-opt[disabled]{cursor:default;opacity:.7}
.qk-opt.qk-ok{background:var(--w-ok,#15803d)!important;border-color:var(--w-ok,#15803d)!important;color:#fff!important;opacity:1}
.qk-opt.qk-bad{background:var(--w-bad,#b91c1c)!important;border-color:var(--w-bad,#b91c1c)!important;color:#fff!important;opacity:1}
.qk-opt.qk-ok::after{content:"  ✓"}.qk-opt.qk-bad::after{content:"  ✗"}
.qk-ex{margin-top:16px;background:#fffdf7;border:3px solid #e8cfa8;border-left:8px solid var(--w-ok,#15803d);border-radius:14px;padding:14px 16px;font-size:1.15rem;line-height:1.45;color:#2b1b0d}
.qk-ex.qk-exbad{border-left-color:var(--w-bad,#b91c1c)}
.qk-ex b{font-size:1.2rem}
.qk-next{display:flex;justify-content:center;margin-top:14px}
.qk-btn{min-height:56px;min-width:160px;padding:10px 24px;border-radius:16px;border:3px solid #92400e;background:#f59e0b;color:#2a1700;font-weight:900;font-size:1.25rem;cursor:pointer}
.qk-pick h4{font-size:1.25rem;font-weight:900;margin:6px 0 10px;text-align:center;color:#2b1b0d}
.qk-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:16px}
.qk-chip{min-height:52px;padding:8px 18px;border-radius:999px;border:3px solid #c9a46a;background:#fffdf7;color:#2b1b0d;font-weight:800;font-size:1.1rem;cursor:pointer}
.qk-chip[aria-pressed="true"]{background:#2b1b0d;border-color:#2b1b0d;color:#fff6e8}
.qk-count{text-align:center;font-weight:700;color:#5b3f22;margin:-4px 0 12px}`;
    document.head.appendChild(st);
  }

  function pool(cfg, pick) {
    return cfg.items.filter((it) => (!pick.d || pick.d === 'all' || it.d === pick.d) && (!pick.t || pick.t === 'all' || it.t === pick.t));
  }
  function choose(cfg, list, n) {
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    const ok = diff === 'easy' ? [1, 2] : diff === 'hard' ? [2, 3] : [1, 2, 3];
    const seenK = 'gg_qk_seen_' + cfg.id, seen = new Set(store.get(seenK, []));
    let cand = list.filter((it) => ok.includes(it.lv || 2));
    if (cand.length < n) cand = list.slice();
    let fresh = cand.filter((it) => !seen.has(key(it)));
    if (fresh.length < n) {   // the whole mix has been seen: start it over, keep this round free of the last one
      cand.forEach((it) => seen.delete(key(it)));
      const last = new Set(store.get(seenK + '_last', []));
      fresh = cand.filter((it) => !last.has(key(it)));
      if (fresh.length < n) fresh = cand.slice();
    }
    // easy rounds lean on the best-known facts first
    let out = shuffle(fresh.slice());
    if (diff === 'easy') out.sort((a, b) => (a.lv || 2) - (b.lv || 2));
    out = shuffle(out.slice(0, n));
    out.forEach((it) => seen.add(key(it)));
    store.set(seenK, [...seen].slice(-2000)); store.set(seenK + '_last', out.map(key));
    return out;
  }

  function start(container, cfg) {
    css(); cfgs[cfg.id] = cfg;
    const gs = gameState[cfg.id];
    gs.pick = Object.assign({ d: 'all', t: 'all' }, store.get('gg_qk_pick_' + cfg.id, {}));
    if (cfg.decades || cfg.topics) renderPick(cfg.id); else go(cfg.id);
    const onKey = (e) => {
      if (!gameState.active || gameState.currentId !== cfg.id || e.target.closest && e.target.closest('input,select,textarea')) return;
      const s = gameState[cfg.id];
      if (s.phase === 'ask' && /^[1-4]$/.test(e.key)) { answer(cfg.id, +e.key - 1); e.preventDefault(); }
      else if (s.phase === 'shown' && (e.key === 'Enter' || e.key === ' ')) { next(cfg.id); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    const prev = window._gameCleanup;
    window._gameCleanup = () => { document.removeEventListener('keydown', onKey); if (prev) prev(); };
  }
  function el() { return document.getElementById('gameContent'); }
  function live(id) { return gameState.active && gameState.currentId === id && el(); }

  function renderPick(id) {
    const cfg = cfgs[id], gs = gameState[id], l = L(); gs.phase = 'pick';
    if (!live(id)) return;
    const chips = (list, field, fn) => `<div class="qk-chips">${[['all', l.all]].concat(list).map(([k, lab]) =>
      `<button type="button" class="qk-chip" aria-pressed="${gs.pick[field] === k}" onclick="QuizKit.setPick('${id}','${field}','${k}')">${esc(lab)}</button>`).join('')}</div>`;
    const n = pool(cfg, gs.pick).length;
    el().innerHTML = `<div class="qk qk-pick">
      ${cfg.decades ? `<h4>${l.decade}</h4>${chips(cfg.decades, 'd')}` : ''}
      ${cfg.topics ? `<h4>${l.topic}</h4>${chips(cfg.topics, 't')}` : ''}
      <div class="qk-count">${l.pool(n)}</div>
      <div class="qk-next"><button type="button" class="qk-btn" onclick="QuizKit.go('${id}')"${n ? '' : ' disabled'}>${l.start} ▶</button></div></div>`;
  }
  function setPick(id, field, k) {
    const gs = gameState[id]; gs.pick[field] = k;
    if (!pool(cfgs[id], gs.pick).length) gs.pick[field === 'd' ? 't' : 'd'] = 'all';   // never offer an empty mix
    store.set('gg_qk_pick_' + id, gs.pick); renderPick(id);
  }
  function go(id) {
    const cfg = cfgs[id], gs = gameState[id];
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    const n = (cfg.n || { easy: 8, normal: 10, hard: 12 })[diff] || 10;
    gs.questions = choose(cfg, pool(cfg, gs.pick || {}), n).map((it) => {
      const opts = shuffle([it.a].concat(shuffle(it.w.slice()).slice(0, 3)));
      if (cfg.sortOpts === 'num') opts.sort((a, b) => parseFloat(String(a).replace(/[^0-9.]/g, '')) - parseFloat(String(b).replace(/[^0-9.]/g, '')));
      return { it, opts, ans: opts.indexOf(it.a) };
    });
    gs.current = 0; gs.score = 0; render(id);
  }
  function render(id) {
    const cfg = cfgs[id], gs = gameState[id], l = L();
    if (!live(id)) return;
    if (gs.current >= gs.questions.length) { gs.phase = 'done'; gs._sessionScore = { correct: gs.score, total: gs.questions.length }; return levelComplete(); }
    gs.phase = 'ask'; gs._locked = false;
    const Q = gs.questions[gs.current], it = Q.it;
    const ask = cfg.ask ? cfg.ask(it) : esc(it.q);
    el().innerHTML = `<div class="qk" dir="${currentLang === 'he' && !cfg.ltr ? 'rtl' : 'ltr'}">
      <div class="qk-top"><span>${l.q} ${gs.current + 1}/${gs.questions.length}</span><span style="color:var(--w-ok,#15803d)">✓ ${gs.score}</span></div>
      <div class="qk-card">${ask}</div>
      <div class="qk-opts">${Q.opts.map((o, i) => `<button type="button" class="qk-opt" onclick="QuizKit.answer('${id}',${i})">${esc(o)}</button>`).join('')}</div>
      <div id="qk-after"></div></div>`;
  }
  function answer(id, i) {
    const gs = gameState[id], l = L();
    if (!live(id) || gs.phase !== 'ask' || gs._locked) return;   // one answer per question
    gs._locked = true; gs.phase = 'shown';
    const Q = gs.questions[gs.current], ok = i === Q.ans;
    if (ok) { gs.score++; if (typeof sfxCorrect === 'function') sfxCorrect(); } else if (typeof sfxWrong === 'function') sfxWrong();
    const bs = el().querySelectorAll('.qk-opt');
    bs.forEach((b, k) => { b.disabled = true; if (k === Q.ans) b.classList.add('qk-ok'); else if (k === i) b.classList.add('qk-bad'); });
    const last = gs.current + 1 >= gs.questions.length;
    const ex = Q.it.x ? `<div>${esc(Q.it.x)}</div>` : '';
    document.getElementById('qk-after').innerHTML = `<div class="qk-ex${ok ? '' : ' qk-exbad'}" role="status"><b>${ok ? l.right : l.wrong + ' ' + l.was + ' ' + esc(Q.it.a) + '.'}</b>${ex}</div>
      <div class="qk-next"><button type="button" class="qk-btn" onclick="QuizKit.next('${id}')">${last ? l.last : l.next} ▶</button></div>`;
    const nb = el().querySelector('.qk-next .qk-btn'); if (nb && nb.scrollIntoView) nb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function next(id) {
    const gs = gameState[id];
    if (!live(id) || gs.phase !== 'shown') return;
    gs.current++; render(id);
    const top = el().querySelector('.qk'); if (top && top.scrollIntoView && window.scrollY > top.getBoundingClientRect().top + window.scrollY) top.scrollIntoView({ block: 'start' });
  }
  // rows: [decade, topic, level, question, answer, [wrong...], explanation]  ->  items
  const rows = (r) => r.map(([d, t, lv, q, a, w, x]) => ({ d, t, lv, q, a, w, x }));
  window.QuizKit = { start, setPick, go, answer, next, rows, esc };
})();
