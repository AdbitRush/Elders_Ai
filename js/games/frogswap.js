// ═══════════════════════════════════════════════════════════════════════════════
// FROG SWAP (2026-11, nostalgia batch 3) — the old "toads and frogs" puzzle on a row of lily pads: green frogs on the
// left, brown toads on the right, one empty pad in the middle. Swap the two groups.
// Frogs only move right, toads only move left. A piece may hop onto the empty pad next to it, or jump over ONE piece
// of the other kind onto the empty pad behind it. Easy 2 + 2, normal 3 + 3, hard 4 + 4. The fewest moves is n(n+2).
// When no move is left before the swap is done, the puzzle says so: Undo and try another order. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
function initFrogSwap() {
    NK.start('frogswap', {
        setup(gs, diff) {
            gs.n = diff === 'easy' ? 2 : diff === 'hard' ? 4 : 3;
            gs.row = [...Array(gs.n).fill('F'), '', ...Array(gs.n).fill('T')]; gs.hist = []; gs.moves = 0; gs.over = false;
            gs.best = gs.n * (gs.n + 2);
            gs.msg = 'Swap the frogs and the toads. Tap a piece that can move onto the empty pad.';
        },
        view: _fsView,
        keys: { KeyU: () => fsUndo() },
        rules: (gs) => [
            `${gs.n} green <b>frogs</b> start on the left, ${gs.n} brown <b>toads</b> on the right, with one empty pad between them.`,
            'Frogs only move <b>right</b>. Toads only move <b>left</b>. Nobody moves backward.',
            'A piece may <b>hop</b> onto the empty pad right next to it, or <b>jump over one</b> piece of the other kind onto the empty pad just past it.',
            'Swap the two groups: frogs all on the right, toads all on the left.',
            `The fewest moves is ${gs.best}. If you get stuck, Undo and try a different order. No clock. Keyboard: arrows and Enter, U undoes.`],
        css: `.fs-row{display:grid;gap:4px;max-width:40rem;margin:20px auto 8px;background:repeating-linear-gradient(90deg,#60a5fa 0 14px,#3b82f6 14px 28px);padding:10px 6px;border-radius:16px}
.fs-p{aspect-ratio:1;border:0;border-radius:50%;background:radial-gradient(circle at 50% 45%,#4ade80,#15803d);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;--nk-r:50%;min-width:0}
.fs-p.fs-e{background:radial-gradient(circle,#86efac,#22c55e);opacity:.75}
.fs-pc{width:70%;height:70%;border-radius:50% 50% 42% 42%;display:flex;align-items:center;justify-content:center;font:900 clamp(1rem,5vw,1.6rem) Georgia,serif;border:3px solid rgba(0,0,0,.35);overflow:hidden}
.fs-F{background:#bbf7d0;color:#14532d}.fs-T{background:#92400e;color:#fff7e6}
.fs-p.fs-can{box-shadow:0 0 0 4px #fde68a}`,
    });
}
function _fsMoves(gs) { const r = gs.row, e = r.indexOf(''), out = []; r.forEach((p, i) => { if (p === 'F' && (i + 1 === e || (i + 2 === e && r[i + 1] === 'T'))) out.push(i); if (p === 'T' && (i - 1 === e || (i - 2 === e && r[i - 1] === 'F'))) out.push(i); }); return out; }
function fsTap(i) {
    const gs = gameState.frogswap; if (gs.over) return;
    if (!gs.row[i]) { gs.msg = 'That is the empty pad. Tap a frog or toad that can move onto it.'; return NK.render('frogswap'); }
    if (!_fsMoves(gs).includes(i)) { gs.msg = gs.row[i] === 'F' ? 'That frog cannot move: frogs go right, onto the empty pad or over one toad.' : 'That toad cannot move: toads go left, onto the empty pad or over one frog.'; return NK.render('frogswap'); }
    const e = gs.row.indexOf(''); gs.hist.push(gs.row.slice()); gs.row[e] = gs.row[i]; gs.row[i] = ''; gs.moves++;
    if (typeof sfxFlip === 'function') sfxFlip();
    const n = gs.n, done = gs.row.slice(0, n).every((x) => x === 'T') && gs.row.slice(n + 1).every((x) => x === 'F');
    if (done) { gs.over = true; gs.msg = `Swapped in ${NK.pl(gs.moves, 'move')}${gs.moves === gs.best ? ' - the fewest possible!' : ''}`; NK.render('frogswap'); if (typeof sfxCorrect === 'function') sfxCorrect(); return NK.finish('frogswap', true, `Frogs and toads swapped in ${NK.pl(gs.moves, 'move')} (the fewest is ${gs.best}).`); }
    gs.msg = _fsMoves(gs).length ? `${NK.pl(gs.moves, 'move')}.` : 'No piece can move now. Press Undo and try a different order - avoid putting two of the same kind side by side in front of the gap.';
    NK.render('frogswap');
}
function fsUndo() { const gs = gameState.frogswap; if (gs.over || !gs.hist.length) return; gs.row = gs.hist.pop(); gs.moves--; gs.msg = 'Move taken back.'; NK.render('frogswap'); }
function fsReset() { const gs = gameState.frogswap; if (gs.over) return; gs.row = [...Array(gs.n).fill('F'), '', ...Array(gs.n).fill('T')]; gs.hist = []; gs.moves = 0; gs.msg = 'Back to the start.'; NK.render('frogswap'); }
function fsNew() { initFrogSwap(); }
function _fsView(gs) {
    const mv = gs.over ? [] : _fsMoves(gs);
    const pads = gs.row.map((p, i) => `<button type="button" class="nk-cell fs-p${p ? '' : ' fs-e'}${mv.includes(i) ? ' fs-can' : ''}" onclick="fsTap(${i})" data-k="p${i}"${i === gs.n - 1 ? ' data-first' : ''} aria-label="pad ${i + 1}: ${p === 'F' ? 'frog' : p === 'T' ? 'toad' : 'empty'}${mv.includes(i) ? ', can move' : ''}"${gs.over ? ' disabled' : ''}>${p ? `<span class="fs-pc fs-${p}">${p}</span>` : ''}</button>`).join('');
    return `<div class="nk-top"><span>Moves: <b>${gs.moves}</b></span><span>Fewest: <b>${gs.best}</b></span></div>
      <div class="fs-row" style="grid-template-columns:repeat(${gs.row.length},1fr)">${pads}</div>
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px 12px;max-width:40rem;margin:0 auto;font-weight:800;color:#4a3420"><span><b>F</b> = frog, goes right ${Icon.svg('arrow-right', { size: '18px', sw: 3 })}</span><span>${Icon.svg('arrow-left', { size: '18px', sw: 3 })} <b>T</b> = toad, goes left</span></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('undo-2') + 'Undo', 'fsUndo()', { k: 'undo', disabled: gs.over || !gs.hist.length })}${NK.btn('Start over', 'fsReset()', { k: 'reset', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'fsNew()', { k: 'restart' })}</div>`;
}
