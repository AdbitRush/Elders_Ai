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

/* QuizKit — the shared multiple-choice engine (2026-10 trivia expansion + wave 3 nostalgia quizzes).
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
.qk{max-width:44rem;margin:0 auto;color:var(--w-table-ink,#2b1b0d)}
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
