// ═══════════════════════════════════════════════════════════════════════════════
// SPIDER SOLITAIRE, ONE SUIT (2026-10, wave 1) — 104 spades in 10 columns, 50 in the deck (5 deals of 10).
// Move any descending run onto a card one higher, or into an empty column. A full King-to-Ace run goes home.
// Win = 8 runs home. The deck deals one card to every column (classic rule: not while a column is empty).
// ═══════════════════════════════════════════════════════════════════════════════
function initSpider(container) {
    GameKit.css();
    const gs = gameState.spider;
    const d = GameKit.deck({ suits: [0], copies: 8 });
    gs.cols = []; let k = 0;
    for (let i = 0; i < 10; i++) { const n = i < 4 ? 6 : 5; gs.cols.push(d.slice(k, k + n)); k += n; gs.cols[i][gs.cols[i].length - 1].up = true; }
    gs.stock = d.slice(k); gs.done = 0; gs.sel = null; gs.undo = []; gs.moves = 0; gs.msg = '';
    _spRender();
}
function _spRunFrom(col, k) { if (!col[k] || !col[k].up) return false; for (let i = k + 1; i < col.length; i++) if (!col[i].up || col[i].r !== col[i - 1].r - 1) return false; return true; }
function _spSnap() { const gs = gameState.spider; gs.undo.push(JSON.stringify({ cols: gs.cols, stock: gs.stock, done: gs.done, moves: gs.moves })); if (gs.undo.length > 150) gs.undo.shift(); }
function _spAfter() {
    const gs = gameState.spider;
    for (const col of gs.cols) {
        if (col.length >= 13) {   // a complete King..Ace run at the end of the column goes home
            const tail = col.slice(-13);
            if (tail[0].r === 13 && tail.every((c, i) => c.up && c.r === 13 - i)) { col.splice(-13); gs.done++; sfxWin(); }
        }
        if (col.length && !col[col.length - 1].up) col[col.length - 1].up = true;
    }
    if (gs.done === 8) { _spRender(); return GameKit.finish('spider', true, `All 8 runs home in ${gs.moves} moves`); }
    _spRender();
}
function spTap(i, k) {
    const gs = gameState.spider; if (!gameState.active || gameState.currentId !== 'spider') return;
    const col = gs.cols[i]; gs.msg = '';
    if (!gs.sel) {
        const kk = k < 0 ? col.length - 1 : k;
        if (col.length && _spRunFrom(col, kk)) { gs.sel = { i, k: kk }; sfxFlip(); } else if (col.length) sfxWrong();
        return _spRender();
    }
    const s = gs.sel, run = gs.cols[s.i].slice(s.k);
    if (s.i === i) { gs.sel = null; return _spRender(); }
    const top = col[col.length - 1];
    if (!col.length || top.r === run[0].r + 1) {
        _spSnap(); gs.cols[s.i].splice(s.k); col.push(...run); gs.sel = null; gs.moves++; sfxCorrect(); return _spAfter();
    }
    sfxWrong(); gs.sel = null;
    const kk = k < 0 ? col.length - 1 : k; if (col.length && _spRunFrom(col, kk)) gs.sel = { i, k: kk };
    _spRender();
}
function spDeal() {
    const gs = gameState.spider; gs.sel = null;
    if (!gs.stock.length) { gs.msg = 'The deck is empty.'; return _spRender(); }
    if (gs.cols.some(c => !c.length)) { gs.msg = 'Fill every empty column before dealing.'; sfxWrong(); return _spRender(); }
    _spSnap(); for (const col of gs.cols) { const c = gs.stock.pop(); c.up = true; col.push(c); } gs.moves++; sfxFlip(); _spAfter();
}
function spUndo() { const gs = gameState.spider; if (!gs.undo.length) return sfxWrong(); Object.assign(gs, JSON.parse(gs.undo.pop())); gs.sel = null; gs.msg = ''; sfxFlip(); _spRender(); }
function spGiveUp() { GameKit.finish('spider', false, `${gameState.spider.done} of 8 runs made it home this time.`); }
function _spRender() {
    const gs = gameState.spider, s = gs.sel, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'spider') return;
    const C = GameKit.card;
    const cols = gs.cols.map((col, i) => `<div class="gk-col sp-col" onclick="if(event.target===this)spTap(${i},-1)">${col.length ? col.map((c, k) =>
        C(c, { rankOnly: true, onclick: c.up ? `event.stopPropagation();spTap(${i},${k})` : '', sel: s && s.i === i && k >= s.k, cls: c.up ? '' : 'sp-down' })).join('') : C(null, { onclick: `spTap(${i},-1)` })}</div>`).join('');
    const deals = Math.floor(gs.stock.length / 10);
    el.innerHTML = `<div class="gk-table sp" dir="ltr">
      <div class="gk-status">${gs.msg ? gs.msg : `Runs home: ${gs.done} of 8 · moves ${gs.moves}`}</div>
      <div class="gk-row sp-cols">${cols}</div>
      <div class="gk-btns">${GameKit.btn(GameKit.icon('layers') + `Deal (${deals} left)`, 'spDeal()', { cls: 'gk-primary', disabled: !deals })}${GameKit.btn(GameKit.icon('undo-2') + 'Undo', 'spUndo()')}${GameKit.btn(GameKit.icon('rotate-ccw') + 'Give up', 'spGiveUp()')}</div>
    </div>
    <style>@media(max-width:520px){.gk-table.sp{padding:8px 3px}}
    .sp .sp-cols{gap:3px;flex-wrap:nowrap}.sp .gk-card .gk-r{font-size:calc(var(--w)*.55)}
    .sp .gk-col .gk-card.sp-down+.gk-card{margin-top:calc(var(--w)*-1.18)}</style>`;
    _fitNow_spider();
}
function _fitNow_spider() { GameKit.fit('.gk-table.sp', 10, 3, 70); }
