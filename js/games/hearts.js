// ═══════════════════════════════════════════════════════════════════════════════
// HEARTS vs 3 COMPUTER PLAYERS (2026-10, wave 1) — one full hand of 13 tricks.
// Classic rules: pass 3 cards (left, right, across, then keep - by level), the 2♣ leads the first trick, follow suit
// if you can, no hearts or Q♠ on the first trick unless you have nothing else, hearts can't be led until one has been
// played. Each heart = 1 point, the Q♠ = 13. Take all 26 and you "shoot the moon": everyone else gets 26.
// Lowest score wins: you pass the session with the lowest (or tied lowest) score of the four.
// Seats clockwise: 0 You (south), 1 West, 2 North, 3 East.
// ═══════════════════════════════════════════════════════════════════════════════
const _HZ_NAMES = ['You', 'West', 'North', 'East'];
const _hzV = (c) => (c.r === 1 ? 14 : c.r);
const _hzPts = (c) => (c.s === 1 ? 1 : c.s === 0 && c.r === 12 ? 13 : 0);
const _hzName = (c) => GameKit.RANKS[c.r] + GameKit.SUITS[c.s];

function initHearts(container) {
    GameKit.css();
    const gs = gameState.hearts;
    const d = GameKit.deck();
    gs.hands = [0, 1, 2, 3].map((i) => d.slice(i * 13, i * 13 + 13));
    gs.hands[0].forEach((c) => (c.up = true));
    gs.pts = [0, 0, 0, 0]; gs.trick = []; gs.broken = false; gs.first = true; gs.busy = false; gs.over = false;
    gs.passDir = ((gs.level || 1) - 1) % 4;   // 0 left (West), 1 right (East), 2 across (North), 3 keep
    gs.sel = []; gs.got = []; gs.lastWin = null;
    _hzSort();
    if (gs.passDir === 3) { gs.phase = 'play'; _hzStartPlay(); }
    else { gs.phase = 'pass'; gs.msg = `Choose 3 cards to pass to ${_HZ_NAMES[[1, 3, 2][gs.passDir]]}.`; _hzRender(); }
}
function _hzSort() { const o = [0, 1, 3, 2]; gameState.hearts.hands[0].sort((a, b) => o[a.s] - o[b.s] || _hzV(a) - _hzV(b)); }

// ── passing ──
function hzTap(id) {
    const gs = gameState.hearts; if (gs.over || gs.busy) return;
    if (gs.phase === 'pass') {
        const k = gs.sel.indexOf(id);
        if (k >= 0) gs.sel.splice(k, 1); else if (gs.sel.length < 3) gs.sel.push(id); else { gs.msg = 'You have picked 3. Tap one again to swap it, or tap Pass.'; return _hzRender(); }
        gs.msg = gs.sel.length === 3 ? 'Ready - tap Pass.' : `Choose ${3 - gs.sel.length} more card${gs.sel.length === 2 ? '' : 's'} to pass.`;
        if (typeof sfxFlip === 'function') sfxFlip();
        return _hzRender();
    }
    if (gs.phase !== 'play' || _hzTurn() !== 0) return;
    const c = gs.hands[0].find((x) => x.id === id); if (!c) return;
    const legal = _hzLegal(0);
    if (!legal.includes(c)) { gs.msg = _hzWhyNot(c); if (typeof sfxWrong === 'function') sfxWrong(); return _hzRender(); }
    _hzPlay(0, c);
}
function _hzCpuPass(p) {
    const h = gameState.hearts.hands[p];
    const score = (c) => (c.s === 0 && c.r >= 12 ? 100 + c.r : c.s === 1 ? 50 + _hzV(c) : _hzV(c));
    return [...h].sort((a, b) => score(b) - score(a)).slice(0, 3);
}
function hzPass() {
    const gs = gameState.hearts; if (gs.phase !== 'pass' || gs.sel.length !== 3) return;
    const to = (p) => (p + [1, 3, 2][gs.passDir]) % 4;
    const out = [0, 1, 2, 3].map((p) => (p === 0 ? gs.hands[0].filter((c) => gs.sel.includes(c.id)) : _hzCpuPass(p)));
    out.forEach((cards, p) => { gs.hands[p] = gs.hands[p].filter((c) => !cards.includes(c)); });
    out.forEach((cards, p) => { cards.forEach((c) => { c.up = to(p) === 0; gs.hands[to(p)].push(c); }); });
    gs.got = out[[3, 1, 2][gs.passDir]].map((c) => c.id);   // what came to you
    gs.sel = []; _hzSort(); gs.phase = 'play';
    _hzStartPlay(`You received ${out[[3, 1, 2][gs.passDir]].map(_hzName).join(', ')} (marked). `);
}

// ── play ──
function _hzStartPlay(pre) {
    const gs = gameState.hearts;
    gs.leader = gs.hands.findIndex((h) => h.some((c) => c.s === 3 && c.r === 2));
    gs.msg = (pre || '') + (gs.leader === 0 ? 'You have the 2♣ - lead it to start.' : `${_HZ_NAMES[gs.leader]} has the 2♣ and leads.`);
    _hzRender();
    if (gs.leader !== 0) _hzCpuSoon();
}
function _hzTurn() { const gs = gameState.hearts; return (gs.leader + gs.trick.length) % 4; }
function _hzLegal(p) {
    const gs = gameState.hearts, h = gs.hands[p];
    if (gs.trick.length) {
        const f = h.filter((c) => c.s === gs.trick[0].c.s); if (f.length) return f;
        if (gs.first) { const safe = h.filter((c) => !_hzPts(c)); if (safe.length) return safe; }
        return h;
    }
    if (gs.first) return h.filter((c) => c.s === 3 && c.r === 2);
    if (!gs.broken) { const nh = h.filter((c) => c.s !== 1); if (nh.length) return nh; }
    return h;
}
function _hzWhyNot(c) {
    const gs = gameState.hearts;
    if (!gs.trick.length && gs.first) return 'The first trick must start with the 2♣.';
    if (gs.trick.length && gs.hands[0].some((x) => x.s === gs.trick[0].c.s)) return `You have a ${GameKit.SUITS[gs.trick[0].c.s]}, so you must follow suit.`;
    if (gs.trick.length && gs.first) return 'No points on the first trick: play a card that is not a heart or the Q♠.';
    if (!gs.trick.length && c.s === 1) return 'Hearts are not broken yet: lead another suit.';
    return 'That card can\'t be played now.';
}
function _hzPlay(p, c) {
    const gs = gameState.hearts;
    gs.hands[p] = gs.hands[p].filter((x) => x !== c); c.up = true;
    gs.trick.push({ p, c }); if (p === 0) gs.got = []; gs.lastWin = null;
    if (c.s === 1) gs.broken = true;
    if (typeof sfxFlip === 'function') sfxFlip();
    if (gs.trick.length === 4) return _hzEndTrick();
    gs.msg = _hzTurn() === 0 ? 'Your turn.' + (gs.trick.length ? ` Follow ${GameKit.SUITS[gs.trick[0].c.s]} if you can.` : '') : `${_HZ_NAMES[_hzTurn()]} is thinking...`;
    _hzRender();
    if (_hzTurn() !== 0) _hzCpuSoon();
}
function _hzWinner() {
    const t = gameState.hearts.trick, s = t[0].c.s;
    return t.filter((x) => x.c.s === s).reduce((a, b) => (_hzV(b.c) > _hzV(a.c) ? b : a));
}
function _hzEndTrick() {
    const gs = gameState.hearts; gs.busy = true;
    const w = _hzWinner(), pts = gs.trick.reduce((s, x) => s + _hzPts(x.c), 0);
    gs.lastWin = w.c.id;
    gs.msg = `${w.p === 0 ? 'You take' : _HZ_NAMES[w.p] + ' takes'} the trick${pts ? ` (${pts} point${pts === 1 ? '' : 's'})` : ''}.`;
    _hzRender();
    setTimeout(() => {
        if (!gameState.active || gameState.currentId !== 'hearts') return;
        gs.pts[w.p] += pts; gs.trick = []; gs.first = false; gs.leader = w.p; gs.busy = false; gs.lastWin = null;
        if (!gs.hands[0].length) return _hzEndHand();
        gs.msg = w.p === 0 ? 'You lead the next trick.' : `${_HZ_NAMES[w.p]} leads.`;
        _hzRender();
        if (w.p !== 0) _hzCpuSoon();
    }, 1300);
}
function _hzEndHand() {
    const gs = gameState.hearts; gs.over = true;
    let note = '';
    const moon = gs.pts.indexOf(26);
    if (moon >= 0) { gs.pts = gs.pts.map((x, i) => (i === moon ? 0 : 26)); note = `${moon === 0 ? 'You' : _HZ_NAMES[moon]} shot the moon! `; }
    const best = Math.min(...gs.pts), win = gs.pts[0] === best;
    const line = _HZ_NAMES.map((n, i) => `${n} ${gs.pts[i]}`).join(', ');
    gs.msg = note + 'Hand over. ' + line + '.';
    _hzRender();
    GameKit.finish('hearts', win, note + (win ? `Lowest score - you win the hand! ${line}.` : `You took ${gs.pts[0]} points this time. ${line}.`));
}
function _hzCpuSoon() {
    setTimeout(() => {
        const gs = gameState.hearts;
        if (!gameState.active || gameState.currentId !== 'hearts' || gs.over || gs.busy || gs.phase !== 'play') return;
        const p = _hzTurn(); if (p === 0) return;
        _hzPlay(p, _hzCpuPick(p));
    }, 750);
}
function _hzCpuPick(p) {
    const gs = gameState.hearts, L = _hzLegal(p);
    const up = (a, b) => _hzV(a) - _hzV(b), down = (a, b) => _hzV(b) - _hzV(a);
    const isQ = (c) => c.s === 0 && c.r === 12;
    if (!gs.trick.length) {   // lead low, from a short suit, keep hearts and high spades back
        const cnt = [0, 0, 0, 0]; gs.hands[p].forEach((c) => cnt[c.s]++);
        return [...L].sort((a, b) => (a.s === 1) - (b.s === 1) || (a.s === 0 && _hzV(a) >= 12) - (b.s === 0 && _hzV(b) >= 12) || cnt[a.s] - cnt[b.s] || up(a, b))[0];
    }
    const lead = gs.trick[0].c.s;
    if (L[0].s === lead) {
        const top = _hzV(_hzWinner().c);
        const under = L.filter((c) => _hzV(c) < top).sort(down);
        if (under.length) return under[0];                       // the highest card that still loses
        const safe = L.filter((c) => !isQ(c)).sort(up);
        if (gs.trick.length === 3 && !gs.trick.some((x) => _hzPts(x.c))) return (safe.length ? safe : L).sort(down)[0];   // last, no points: win high
        return (safe.length ? safe : L.sort(up))[0];
    }
    const q = L.find(isQ); if (q) return q;                   // can't follow: dump the Q♠, then high spades, then hearts
    const bigS = L.filter((c) => c.s === 0 && _hzV(c) > 12).sort(down); if (bigS.length) return bigS[0];
    const h = L.filter((c) => c.s === 1).sort(down); if (h.length) return h[0];
    return [...L].sort(down)[0];
}

function _hzRender() {
    const gs = gameState.hearts, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'hearts') return;
    const C = GameKit.card;
    const legal = gs.phase === 'play' && !gs.busy && !gs.over && _hzTurn() === 0 ? _hzLegal(0) : [];
    const played = (p) => { const x = gs.trick.find((t) => t.p === p); return x ? C(x.c, { sel: gs.lastWin === x.c.id }) : `<div class="hz-empty">${p ? gs.hands[p].length + ' cards' : ''}</div>`; };
    const seat = (p) => `<div class="hz-seat hz-p${p}"><div class="hz-name${_hzTurn() === p && gs.phase === 'play' && !gs.busy && !gs.over ? ' hz-now' : ''}">${_HZ_NAMES[p]} · ${gs.pts[p]}</div>${played(p)}</div>`;
    const hand = gs.hands[0].map((c) => C(c, { onclick: `hzTap(${c.id})`, sel: gs.sel.includes(c.id), hint: legal.includes(c), cls: gs.got.includes(c.id) ? 'hz-got' : '' })).join('');
    const passBtn = gs.phase === 'pass' ? `<div class="gk-btns">${GameKit.btn(GameKit.icon('arrow-right') + `Pass to ${_HZ_NAMES[[1, 3, 2][gs.passDir]]}`, 'hzPass()', { cls: 'gk-primary', disabled: gs.sel.length !== 3 })}</div>` : '';
    el.innerHTML = `<div class="gk-table hz" dir="ltr">
      <div class="gk-status" role="status">${gs.msg}</div>
      <div class="hz-trick">${seat(2)}${seat(1)}<div class="hz-center">${gs.broken ? '♥ broken' : ''}</div>${seat(3)}${seat(0)}</div>
      ${passBtn}
      <div class="gk-label gk-big">Your hand</div>
      <div class="gk-hand hz-hand">${hand}</div>
      ${gs.phase === 'play' ? `<div class="gk-label hz-key">Gold dashed outline = a card you can play now.${gs.got.length ? ' Blue = the cards you were passed.' : ''} Hearts 1 point each, Q♠ 13. Lowest score wins.</div>` : ''}
    </div>
    <style>
      .gk-table.hz{--w:clamp(40px,12.4vw,70px)}
      .hz .hz-trick{display:grid;grid-template-columns:1fr auto 1fr;grid-template-rows:auto auto auto;gap:4px 6px;justify-items:center;align-items:center;margin:4px auto 10px;max-width:420px}
      .hz .hz-trick .gk-card,.hz .hz-empty{--w:clamp(40px,11vw,60px)}
      .hz .hz-p2{grid-column:2;grid-row:1}.hz .hz-p1{grid-column:1;grid-row:2}.hz .hz-center{grid-column:2;grid-row:2;color:#ffd0d0;font-weight:800;min-width:60px;text-align:center}
      .hz .hz-p3{grid-column:3;grid-row:2}.hz .hz-p0{grid-column:2;grid-row:3}
      .hz .hz-seat{display:flex;flex-direction:column;align-items:center;gap:3px}
      .hz .hz-name{font-weight:800;font-size:1rem;color:#fff7e6;background:rgba(0,0,0,.25);padding:2px 10px;border-radius:999px;white-space:nowrap}
      .hz .hz-name.hz-now{background:#f59e0b;color:#2a1700}
      .hz .hz-empty{width:var(--w);height:calc(var(--w)*1.4);border:2px dashed rgba(255,247,230,.35);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:#fde7c4;text-align:center}
      .hz .hz-hand{gap:4px}
      .hz .gk-card.hz-got{box-shadow:0 0 0 4px #60a5fa,0 2px 4px rgba(0,0,0,.35)}
      .hz .hz-key{font-weight:700;font-size:.95rem;opacity:.95}
    </style>`;
}
