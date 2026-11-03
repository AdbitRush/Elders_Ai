// ═══════════════════════════════════════════════════════════════════════════════
// DOMINOES, THE BLOCK GAME vs COMPUTER (2026-10, wave 1) — a double-six set (28 tiles), 7 tiles each, no drawing.
// Play a tile whose number matches an open end of the line; a double is played the same way. Can't play? You pass.
// The first to play every tile wins. If neither side can play, the lower total of pips left in hand wins.
// ═══════════════════════════════════════════════════════════════════════════════
function initDominoes(container) {
    GameKit.css();
    const gs = gameState.dominoes;
    const set = []; for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) set.push([a, b]);
    shuffle(set);
    gs.me = set.slice(0, 7); gs.cpu = set.slice(7, 14); gs.line = []; gs.ends = null; gs.sel = null; gs.passes = 0; gs.busy = false; gs.over = false;
    // the higher double starts; otherwise you start
    const dbl = (h) => Math.max(-1, ...h.filter(t => t[0] === t[1]).map(t => t[0]));
    gs.turn = dbl(gs.cpu) > dbl(gs.me) ? 1 : 0;
    gs.msg = gs.turn ? 'The computer has the higher double and starts.' : 'You start: tap any domino.';
    _doRender();
    if (gs.turn) setTimeout(_doCpu, 1200);
}
const _doPips = (h) => h.reduce((a, t) => a + t[0] + t[1], 0);
function _doFits(t, ends) { if (!ends) return ['L']; const s = []; if (t[0] === ends[0] || t[1] === ends[0]) s.push('L'); if (t[0] === ends[1] || t[1] === ends[1]) s.push('R'); return s; }
function _doPlace(t, side) {
    const gs = gameState.dominoes;
    if (!gs.ends) { gs.line = [t.slice()]; gs.ends = [t[0], t[1]]; return; }
    if (side === 'L') { const n = gs.ends[0]; const tile = t[1] === n ? [t[0], t[1]] : [t[1], t[0]]; gs.line.unshift(tile); gs.ends[0] = tile[0]; }
    else { const n = gs.ends[1]; const tile = t[0] === n ? [t[0], t[1]] : [t[1], t[0]]; gs.line.push(tile); gs.ends[1] = tile[1]; }
}
function _doCheckEnd() {
    const gs = gameState.dominoes;
    if (!gs.me.length) { gs.over = true; _doRender(); GameKit.finish('dominoes', true, 'You played every domino first!'); return true; }
    if (!gs.cpu.length) { gs.over = true; _doRender(); GameKit.finish('dominoes', false, `The computer went out first. You had ${gs.me.length} domino${gs.me.length === 1 ? '' : 'es'} left.`); return true; }
    if (gs.passes >= 2) {
        gs.over = true; const a = _doPips(gs.me), b = _doPips(gs.cpu); _doRender();
        GameKit.finish('dominoes', a < b, a < b ? `Blocked! You win on points: ${a} to ${b}.` : a === b ? `Blocked, and a tie on points (${a} each).` : `Blocked: the computer wins on points, ${b} to ${a}.`);
        return true;
    }
    return false;
}
function doTap(i) {
    const gs = gameState.dominoes; if (gs.turn !== 0 || gs.busy || gs.over) return;
    const t = gs.me[i], fits = _doFits(t, gs.ends);
    if (!fits.length) { gs.msg = 'That domino does not match an open end.'; sfxWrong(); gs.sel = null; return _doRender(); }
    if (fits.length === 2 && gs.ends[0] !== gs.ends[1]) { gs.sel = i; gs.msg = 'It fits both ends: tap Left or Right.'; sfxFlip(); return _doRender(); }
    _doPlay(i, fits[0]);
}
function doSide(side) { const gs = gameState.dominoes; if (gs.sel === null) return; _doPlay(gs.sel, side); }
function _doPlay(i, side) {
    const gs = gameState.dominoes; const t = gs.me.splice(i, 1)[0]; _doPlace(t, side); gs.sel = null; gs.passes = 0; sfxCorrect();
    if (_doCheckEnd()) return;
    gs.turn = 1; gs.busy = true; gs.msg = 'The computer is thinking…'; _doRender(); setTimeout(_doCpu, 900);
}
function doPass() {
    const gs = gameState.dominoes; if (gs.turn !== 0 || gs.over) return;
    if (gs.me.some(t => _doFits(t, gs.ends).length)) { gs.msg = 'You still have a domino that fits.'; sfxWrong(); return _doRender(); }
    gs.passes++; gs.msg = 'You passed.'; if (_doCheckEnd()) return;
    gs.turn = 1; gs.busy = true; _doRender(); setTimeout(_doCpu, 900);
}
function _doCpu() {
    const gs = gameState.dominoes; if (!gameState.active || gameState.currentId !== 'dominoes' || gs.over) return;
    // play the heaviest tile that fits (gets rid of points); doubles first on a tie
    const opts = []; gs.cpu.forEach((t, i) => _doFits(t, gs.ends).forEach(s => opts.push({ i, s, w: t[0] + t[1] + (t[0] === t[1] ? .5 : 0) })));
    if (!opts.length) { gs.passes++; gs.msg = 'The computer cannot play and passes. Your turn.'; }
    else { opts.sort((a, b) => b.w - a.w); const o = opts[0]; const t = gs.cpu.splice(o.i, 1)[0]; _doPlace(t, o.s); gs.passes = 0; gs.msg = `The computer played ${t[0]}-${t[1]}. Your turn.`; sfxFlip(); }
    gs.busy = false; gs.turn = 0;
    if (_doCheckEnd()) return;
    if (!gs.me.some(t => _doFits(t, gs.ends).length)) gs.msg += ' No domino fits: tap Pass.';
    _doRender();
}
function _doTile(t, o) {
    const pip = (n) => { const P = { 0: [], 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }[n]; let h = ''; for (let k = 0; k < 9; k++) h += `<i${P.includes(k) ? ' class="on"' : ''}></i>`; return `<span class="do-half">${h}</span>`; };
    return `<div class="do-tile${o && o.cls ? ' ' + o.cls : ''}"${o && o.onclick ? ` onclick="${o.onclick}"` : ''} aria-label="${t[0]}-${t[1]}">${pip(t[0])}<span class="do-line"></span>${pip(t[1])}</div>`;
}
function _doRender() {
    const gs = gameState.dominoes, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'dominoes') return;
    const hand = gs.me.map((t, i) => _doTile(t, { onclick: `doTap(${i})`, cls: (gs.sel === i ? 'do-sel' : '') + (gs.turn === 0 && _doFits(t, gs.ends).length ? ' do-ok' : '') })).join('');
    const line = gs.line.map(t => _doTile(t, { cls: 'do-flat' + (t[0] === t[1] ? ' do-dbl' : '') })).join('');
    const canPlay = gs.me.some(t => _doFits(t, gs.ends).length);
    el.innerHTML = `<div class="gk-table do" dir="ltr">
      <div class="gk-status">${gs.msg}</div>
      <div class="gk-label">Computer: ${gs.cpu.length} domino${gs.cpu.length === 1 ? '' : 'es'}</div>
      <div class="do-cpu">${gs.cpu.map(() => '<span class="do-back"></span>').join('')}</div>
      <div class="do-line-wrap">${line || '<span class="gk-label">The line starts here</span>'}</div>
      ${gs.ends ? `<div class="gk-label">Open ends: ${gs.ends[0]} and ${gs.ends[1]}</div>` : ''}
      ${gs.sel !== null ? `<div class="gk-btns">${GameKit.btn('◀ Left end (' + gs.ends[0] + ')', "doSide('L')", { cls: 'gk-primary' })}${GameKit.btn('Right end (' + gs.ends[1] + ') ▶', "doSide('R')", { cls: 'gk-primary' })}</div>` : ''}
      <div class="gk-label gk-big">Your dominoes</div>
      <div class="do-hand">${hand}</div>
      <div class="gk-btns">${GameKit.btn('Pass', 'doPass()', { disabled: gs.turn !== 0 || canPlay || gs.over })}</div>
    </div>
    <style>.do .do-hand{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
    .do .do-tile{display:inline-flex;flex-direction:column;align-items:center;background:#fffdf7;border:2px solid #cbb994;border-radius:10px;padding:5px;gap:4px;box-shadow:0 3px 0 rgba(0,0,0,.35);cursor:pointer}
    .do .do-hand .do-tile{width:clamp(46px,12vw,68px)}.do .do-ok{box-shadow:0 0 0 3px #fde68a,0 3px 0 rgba(0,0,0,.35)}.do .do-sel{outline:4px solid #fbbf24;transform:translateY(-4px)}
    .do .do-half{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;width:100%;aspect-ratio:1}
    .do .do-half i{border-radius:50%}.do .do-half i.on{background:#1d1b18}
    .do .do-line{width:90%;height:2px;background:#8a7a5a}
    .do .do-line-wrap{display:flex;flex-wrap:wrap;gap:3px;justify-content:center;align-items:center;min-height:60px;margin:12px 0;padding:8px;background:rgba(0,0,0,.12);border-radius:12px}
    .do .do-flat{flex-direction:row;width:auto;cursor:default;padding:3px}.do .do-flat .do-half{width:clamp(18px,4.2vw,28px)}.do .do-flat .do-line{width:2px;height:clamp(18px,4.2vw,28px)}
    .do .do-flat.do-dbl{flex-direction:column}.do .do-flat.do-dbl .do-line{width:clamp(18px,4.2vw,28px);height:2px}
    .do .do-cpu{display:flex;gap:4px;justify-content:center;flex-wrap:wrap}.do .do-back{width:18px;height:32px;border-radius:4px;background:repeating-linear-gradient(45deg,#7c2d12 0 4px,#9a3412 4px 8px);border:1px solid #fde7c4}</style>`;
}
