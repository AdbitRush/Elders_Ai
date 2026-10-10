// ═══════════════════════════════════════════════════════════════════════════════
// FREECELL (2026-10, wave 1) — every card face up; four free cells, four home piles, eight columns.
// Tap a card (or a free cell) to pick it up, tap where it goes. Tap a picked card again to send it home,
// or to a free cell. A run can move only as far as the free space allows: (free cells + 1) x 2^(empty columns).
// Win = all 52 cards home. "Give up" ends the deal honestly (shared end screen: "Nice try").
// ═══════════════════════════════════════════════════════════════════════════════
function initFreeCell(container) {
    GameKit.css();
    const gs = gameState.freecell;
    const d = GameKit.deck(); d.forEach(c => c.up = true);
    gs.cas = [[], [], [], [], [], [], [], []]; d.forEach((c, i) => gs.cas[i % 8].push(c));
    gs.free = [null, null, null, null]; gs.home = [[], [], [], []]; gs.sel = null; gs.undo = []; gs.moves = 0;
    _fcRender();
}
const _fcRed = (c) => GameKit.isRed(c.s);
function _fcRunOk(run) { for (let i = 1; i < run.length; i++) { const a = run[i - 1], b = run[i]; if (a.r !== b.r + 1 || _fcRed(a) === _fcRed(b)) return false; } return true; }
function _fcMaxRun(toEmpty) {
    const gs = gameState.freecell, f = gs.free.filter(x => !x).length, e = gs.cas.filter(c => !c.length).length - (toEmpty ? 1 : 0);
    return (f + 1) * Math.pow(2, Math.max(0, e));
}
function _fcHomeOk(c) { const h = gameState.freecell.home[c.s]; return h.length === c.r - 1; }
function _fcOnto(c, col) { if (!col.length) return true; const t = col[col.length - 1]; return t.r === c.r + 1 && _fcRed(t) !== _fcRed(c); }
function _fcSnap() { const gs = gameState.freecell; gs.undo.push(JSON.stringify({ cas: gs.cas, free: gs.free, home: gs.home, moves: gs.moves })); if (gs.undo.length > 200) gs.undo.shift(); }
function _fcTake() { const gs = gameState.freecell, s = gs.sel; if (s.where === 'f') { const c = gs.free[s.i]; gs.free[s.i] = null; return [c]; } return gs.cas[s.i].splice(s.k); }
function _fcPicked() { const gs = gameState.freecell, s = gs.sel; return s.where === 'f' ? [gs.free[s.i]] : gs.cas[s.i].slice(s.k); }

function fcTap(where, i, k) {
    const gs = gameState.freecell; if (!gameState.active || gameState.currentId !== 'freecell') return;
    if (!gs.sel) {
        if (where === 'c' && gs.cas[i].length) { const kk = k < 0 ? gs.cas[i].length - 1 : k; if (_fcRunOk(gs.cas[i].slice(kk))) { gs.sel = { where: 'c', i, k: kk }; sfxFlip(); } else sfxWrong(); }
        else if (where === 'f' && gs.free[i]) { gs.sel = { where: 'f', i }; sfxFlip(); }
        return _fcRender();
    }
    const run = _fcPicked(), single = run.length === 1, c = run[0], s = gs.sel;
    // the same card again: home if it can go, else a free cell
    if ((where === s.where && i === s.i && (where === 'f' || k === s.k || (k < 0 && s.k === gs.cas[i].length - 1)))) {
        if (single && _fcHomeOk(c)) return _fcMove('h', c.s);
        const fi = gs.free.indexOf(null);
        if (single && where === 'c' && fi >= 0) return _fcMove('f', fi);
        gs.sel = null; return _fcRender();
    }
    if (where === 'h') { if (single && _fcHomeOk(c)) return _fcMove('h', c.s); }
    else if (where === 'f') { if (single && !gs.free[i]) return _fcMove('f', i); }
    else if (where === 'c') { const col = gs.cas[i]; if (_fcOnto(c, col) && run.length <= _fcMaxRun(!col.length)) return _fcMove('c', i); }
    // not legal: pick up the new card instead, if it can be picked
    sfxWrong(); gs.sel = null;
    if (where === 'c' && gs.cas[i].length) { const kk = k < 0 ? gs.cas[i].length - 1 : k; if (_fcRunOk(gs.cas[i].slice(kk))) gs.sel = { where: 'c', i, k: kk }; }
    else if (where === 'f' && gs.free[i]) gs.sel = { where: 'f', i };
    _fcRender();
}
function _fcMove(to, i) {
    const gs = gameState.freecell; _fcSnap();
    const run = _fcTake();
    if (to === 'h') gs.home[i].push(run[0]); else if (to === 'f') gs.free[i] = run[0]; else gs.cas[i].push(...run);
    gs.sel = null; gs.moves++; sfxCorrect();
    if (gs.home.every(h => h.length === 13)) { _fcRender(); return GameKit.finish('freecell', true, `Solved in ${gs.moves} moves`); }
    _fcRender();
}
function fcUndo() { const gs = gameState.freecell; if (!gs.undo.length) return sfxWrong(); Object.assign(gs, JSON.parse(gs.undo.pop())); gs.sel = null; sfxFlip(); _fcRender(); }
function fcGiveUp() { const gs = gameState.freecell; const n = gs.home.reduce((a, h) => a + h.length, 0); GameKit.finish('freecell', false, `${n} of 52 cards made it home this time.`); }

function _fcRender() {
    const gs = gameState.freecell, s = gs.sel, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'freecell') return;
    const C = GameKit.card;
    const free = gs.free.map((c, i) => c ? C(c, { onclick: `fcTap('f',${i},0)`, sel: s && s.where === 'f' && s.i === i }) : C(null, { onclick: `fcTap('f',${i},0)`, label: GameKit.icon('square-dashed') })).join('');
    const home = gs.home.map((h, i) => h.length ? C(h[h.length - 1], { onclick: `fcTap('h',${i},0)` }) : C(null, { onclick: `fcTap('h',${i},0)`, label: GameKit.SUITS[i] })).join('');
    const cols = gs.cas.map((col, i) => `<div class="gk-col fc-col" onclick="if(event.target===this)fcTap('c',${i},-1)">${col.length ? col.map((c, k) =>
        C(c, { onclick: `event.stopPropagation();fcTap('c',${i},${k})`, sel: s && s.where === 'c' && s.i === i && k >= s.k })).join('') : C(null, { onclick: `fcTap('c',${i},-1)` })}</div>`).join('');
    const homeN = gs.home.reduce((a, h) => a + h.length, 0);
    el.innerHTML = `<div class="gk-table fc" dir="ltr">
      <div class="gk-status">${homeN} of 52 home · moves ${gs.moves}</div>
      <div class="fc-top"><div class="gk-row">${free}</div><div class="gk-row">${home}</div></div>
      <div class="gk-row fc-cols">${cols}</div>
      <div class="gk-btns">${GameKit.btn(GameKit.icon('undo-2') + 'Undo', 'fcUndo()')}${GameKit.btn(GameKit.icon('rotate-ccw') + 'Give up', 'fcGiveUp()')}</div>
    </div>
    <style>@media(max-width:520px){.gk-table.fc{padding:8px 3px}}
    .fc .fc-top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}
    .fc .fc-top .gk-row{gap:4px;flex-wrap:nowrap}.fc .fc-cols{gap:4px;flex-wrap:nowrap}</style>`;
    _fitNow_freecell();
}
function _fitNow_freecell() { GameKit.fit('.gk-table.fc', 8, 4, 74); }
