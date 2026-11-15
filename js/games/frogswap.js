// ═══════════════════════════════════════════════════════════════════════════════
// FROG SWAP (2026-11, nostalgia batch 3) — the old "toads and frogs" puzzle on a row of lily pads: green frogs on the
// left, brown toads on the right, one empty pad in the middle. Swap the two groups.
// Frogs only move right, toads only move left. A piece may hop onto the empty pad next to it, or jump over ONE piece
// of the other kind onto the empty pad behind it. Easy 2 + 2, normal 3 + 3, hard 4 + 4. The fewest moves is n(n+2).
// When no move is left before the swap is done, the puzzle says so: Undo and try another order. No clock.
// Visuals (2026-11 overhaul): a pond scene in pure CSS + inline SVG. The pond is always laid out left-to-right
// (direction:ltr) so "frogs go right, toads go left" matches the screen on the Hebrew (RTL) site too.
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
        css: `.nk-top.fs-plaque{display:flex;justify-content:center;flex-wrap:wrap;gap:4px 30px;max-width:22rem;margin:8px auto 0;padding:10px 26px;border-radius:12px;border:2px solid #5a3716;color:#fff6dc;font-weight:800;font-size:1.15rem;text-shadow:0 1px 1px rgba(0,0,0,.5);background:radial-gradient(circle at 11px 50%,#3d2610 0 3px,transparent 4px),radial-gradient(circle at calc(100% - 11px) 50%,#3d2610 0 3px,transparent 4px),repeating-linear-gradient(92deg,rgba(0,0,0,.07) 0 2px,transparent 2px 9px),linear-gradient(180deg,#a8743f,#8a5a2b 55%,#74481f);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 3px 6px rgba(60,35,10,.3)}
.nk-top.fs-plaque b{font-size:1.5rem;color:#ffe9a8}
.fs-pond{position:relative;direction:ltr;box-sizing:border-box;max-width:40rem;margin:18px auto 10px;padding:clamp(14px,4vw,26px) clamp(8px,1.6vw,14px);border-radius:22px;border:4px solid #7a5c3a;background:radial-gradient(120% 70% at 50% 0%,rgba(255,255,255,.38),transparent 60%),radial-gradient(ellipse 20% 16% at 14% 14%,transparent 0 70%,rgba(255,255,255,.34) 74% 82%,transparent 86%),radial-gradient(ellipse 24% 18% at 84% 90%,transparent 0 70%,rgba(255,255,255,.3) 74% 82%,transparent 86%),radial-gradient(ellipse 12% 9% at 58% 8%,transparent 0 66%,rgba(255,255,255,.26) 72% 84%,transparent 88%),linear-gradient(180deg,#b2e0e3,#74bbc7 55%,#4f9fb2);box-shadow:inset 0 3px 12px rgba(20,70,90,.4),0 6px 16px rgba(60,40,20,.22);transition:box-shadow .8s,border-color .8s}
.fs-pond.fs-win{border-color:#c98a1b;box-shadow:inset 0 0 40px rgba(255,214,120,.75),0 0 0 4px rgba(255,205,96,.6),0 0 34px 8px rgba(255,190,80,.6)}
.fs-pond.fs-win::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(ellipse at 50% 0%,rgba(255,226,140,.5),rgba(255,200,110,.16) 60%,transparent 85%)}
.fs-row{display:grid;gap:6px;position:relative}
.fs-row .fs-p{position:relative;display:grid;place-items:center;aspect-ratio:1/1.2;min-height:52px;min-width:0;padding:0;border:0;background:transparent;cursor:pointer;--nk-r:50%;-webkit-tap-highlight-color:transparent}
.fs-row .fs-p:disabled{opacity:1;cursor:default}
.fs-row .fs-p:focus-visible{outline:3px solid #5a2d0c;outline-offset:1px;border-radius:14px}
.fs-pad{position:absolute;left:2%;right:2%;top:50%;aspect-ratio:1;transform:translateY(-50%);filter:drop-shadow(0 3px 2px rgba(10,50,60,.4))}
.fs-pad i{position:absolute;inset:0;border-radius:50%;background:repeating-conic-gradient(from 8deg,rgba(255,255,255,.13) 0 2deg,transparent 2deg 30deg),radial-gradient(circle at 38% 32%,#74c279 0,#3f9a55 45%,#23703c 80%,#175a2d 100%);-webkit-mask:conic-gradient(from 34deg,transparent 0 34deg,#000 34deg);mask:conic-gradient(from 34deg,transparent 0 34deg,#000 34deg)}
.fs-e .fs-pad i{background:radial-gradient(circle at 38% 32%,#dff5cf 0,#aadd9f 50%,#7fc487 100%)}
.fs-e .fs-pad::after{content:"";position:absolute;inset:16%;border-radius:50%;border:2px dashed #fffdf0;box-shadow:0 0 8px rgba(255,255,240,.7)}
.fs-can .fs-pad::after{content:"";position:absolute;inset:0;border-radius:50%;border:3px solid #ffd766;box-shadow:0 0 10px 2px rgba(255,215,102,.8),inset 0 0 9px rgba(255,236,160,.7)}
.fs-pc{position:relative;z-index:2;display:block;width:88%;filter:drop-shadow(0 2px 1.5px rgba(0,0,0,.4))}
.fs-pc svg,.fs-mini svg{display:block;width:100%;height:auto}
.fs-can .fs-pc{animation:fs-hop 2.8s ease-in-out infinite}
.fs-win .fs-pc{animation:fs-joy 1.1s ease-out 2}
@keyframes fs-hop{0%,60%,100%{transform:translateY(0)}72%{transform:translateY(-13%)}84%{transform:translateY(0)}91%{transform:translateY(-4%)}}
@keyframes fs-joy{0%,100%{transform:translateY(0)}45%{transform:translateY(-16%)}}
.fs-legend{direction:ltr;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px 12px;max-width:40rem;margin:0 auto;font-weight:800;font-size:1.05rem;color:#4a3420}
.fs-legend>span{display:inline-flex;align-items:center;gap:6px}
.fs-mini{display:inline-block;width:34px;flex:none}
@media (max-width:480px){.fs-row{gap:0}.fs-pond{padding-left:2px;padding-right:2px;border-width:3px}}
@media (prefers-reduced-motion:reduce){.fs-can .fs-pc,.fs-win .fs-pc{animation:none}.fs-pond{transition:none}}`,
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
    // Inline SVG creatures. Frog: light green, tall round eyes, looks right (the way it moves).
    // Toad: dark brown, squat and warty, golden half-lidded eyes, looks left. Told apart by shape and lightness, not only hue.
    const art = {
        F: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g stroke="#2c5e1a" stroke-width="2.5" stroke-linejoin="round"><ellipse cx="13" cy="47" rx="10" ry="7" fill="#5fae36"/><ellipse cx="51" cy="47" rx="10" ry="7" fill="#5fae36"/><ellipse cx="32" cy="40" rx="20" ry="17" fill="#8fd24e"/><circle cx="20" cy="21" r="9.5" fill="#8fd24e"/><circle cx="44" cy="21" r="9.5" fill="#8fd24e"/></g><ellipse cx="32" cy="47" rx="12" ry="8.5" fill="#e6f7b8"/><circle cx="20" cy="21" r="6" fill="#fff"/><circle cx="44" cy="21" r="6" fill="#fff"/><circle cx="22.5" cy="21" r="3.2" fill="#1f2d12"/><circle cx="46.5" cy="21" r="3.2" fill="#1f2d12"/><path d="M22 36 Q32 44 42 36" fill="none" stroke="#2c5e1a" stroke-width="2.5" stroke-linecap="round"/><g fill="#5fae36" stroke="#2c5e1a" stroke-width="2"><ellipse cx="24" cy="57" rx="6.5" ry="3.2"/><ellipse cx="40" cy="57" rx="6.5" ry="3.2"/></g></svg>',
        T: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g stroke="#33200d" stroke-width="2.5" stroke-linejoin="round"><ellipse cx="32" cy="43" rx="27" ry="15" fill="#7d4f25"/><ellipse cx="32" cy="29" rx="19" ry="12" fill="#8a5a2b"/></g><ellipse cx="32" cy="50" rx="15" ry="6.5" fill="#edd6a6"/><g fill="#55340f"><circle cx="11" cy="41" r="2.6"/><circle cx="53" cy="41" r="2.6"/><circle cx="17" cy="49" r="2"/><circle cx="47" cy="49" r="2"/><circle cx="32" cy="21" r="2"/><circle cx="24" cy="37" r="1.6"/><circle cx="41" cy="36" r="1.6"/></g><g stroke="#33200d" stroke-width="2"><ellipse cx="21" cy="25" rx="7" ry="5.5" fill="#f7d75a"/><ellipse cx="43" cy="25" rx="7" ry="5.5" fill="#f7d75a"/></g><ellipse cx="18.8" cy="26" rx="3.6" ry="2.2" fill="#1d1206"/><ellipse cx="40.8" cy="26" rx="3.6" ry="2.2" fill="#1d1206"/><path d="M13.5 23.5 Q21 16.5 28.5 23.5 Z M35.5 23.5 Q43 16.5 50.5 23.5 Z" fill="#8a5a2b" stroke="#33200d" stroke-width="2" stroke-linejoin="round"/><path d="M21 37.5 Q32 41 43 37.5" fill="none" stroke="#33200d" stroke-width="2.5" stroke-linecap="round"/><g fill="#7d4f25" stroke="#33200d" stroke-width="2"><ellipse cx="15" cy="57" rx="8" ry="3.4"/><ellipse cx="49" cy="57" rx="8" ry="3.4"/></g></svg>',
    };
    const pads = gs.row.map((p, i) => `<button type="button" class="nk-cell fs-p${p ? '' : ' fs-e'}${mv.includes(i) ? ' fs-can' : ''}" onclick="fsTap(${i})" data-k="p${i}"${i === gs.n - 1 ? ' data-first' : ''} aria-label="pad ${i + 1}: ${p === 'F' ? 'frog' : p === 'T' ? 'toad' : 'empty'}${mv.includes(i) ? ', can move' : ''}"${gs.over ? ' disabled' : ''}><span class="fs-pad" aria-hidden="true"><i></i></span>${p ? `<span class="fs-pc fs-${p}">${art[p]}</span>` : ''}</button>`).join('');
    return `<div class="nk-top fs-plaque"><span>Moves: <b>${gs.moves}</b></span><span>Fewest: <b>${gs.best}</b></span></div>
      <div class="fs-pond${gs.over ? ' fs-win' : ''}"><div class="fs-row" style="grid-template-columns:repeat(${gs.row.length},1fr)">${pads}</div></div>
      <div class="fs-legend"><span><span class="fs-mini">${art.F}</span> = frog, goes right ${Icon.svg('arrow-right', { size: '18px', sw: 3 })}</span><span>${Icon.svg('arrow-left', { size: '18px', sw: 3 })} <span class="fs-mini">${art.T}</span> = toad, goes left</span></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('undo-2') + 'Undo', 'fsUndo()', { k: 'undo', disabled: gs.over || !gs.hist.length })}${NK.btn('Start over', 'fsReset()', { k: 'reset', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'fsNew()', { k: 'restart' })}</div>`;
}
