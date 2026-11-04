// ═══════════════════════════════════════════════════════════════════════════════
// GEM SWAP (2026-11, nostalgia batch 3) — the swap-and-match jewel puzzle, with no clock at all. Swap two gems next to
// each other to line up three or more of a kind across or down; they vanish, gems above fall, and new ones drop in.
// Each level has a goal of gems to collect within a set number of swaps. Easy: 5 kinds of gems, 20 swaps for 40 gems.
// Normal: 6 kinds, 20 swaps for 50. Hard: 6 kinds, 18 swaps for 60. A swap that makes no line is undone and costs
// nothing. Gems are told apart by shape AND color. If no swap is possible, the board is reshuffled for free.
// ═══════════════════════════════════════════════════════════════════════════════
const _GM_N = 7;
const _GM_K = [
    { c: '#dc2626', n: 'red heart', d: 'M20 33 C6 23 4 14 10 9 C15 5 19 8 20 11 C21 8 25 5 30 9 C36 14 34 23 20 33 Z' },
    { c: '#2563eb', n: 'blue drop', d: 'M20 5 C27 15 31 21 31 26 A11 11 0 0 1 9 26 C9 21 13 15 20 5 Z' },
    { c: '#16a34a', n: 'green leaf', d: 'M8 32 C8 16 18 7 33 7 C33 22 24 32 8 32 Z M8 32 L22 18' },
    { c: '#ca8a04', n: 'gold star', d: 'M20 4 L24.5 15 L36 15.5 L27 23 L30 34.5 L20 28 L10 34.5 L13 23 L4 15.5 L15.5 15 Z' },
    { c: '#9333ea', n: 'purple diamond', d: 'M20 4 L34 20 L20 36 L6 20 Z' },
    { c: '#ea580c', n: 'orange circle', d: 'M20 6 A14 14 0 1 1 19.9 6 Z' },
];
function initGemswap() {
    NK.start('gemswap', {
        setup(gs, diff) {
            gs.diff = diff; gs.kinds = diff === 'easy' ? 5 : 6; gs.swaps = diff === 'hard' ? 18 : 20; gs.goal = diff === 'easy' ? 40 : diff === 'hard' ? 60 : 50;
            gs.got = 0; gs.sel = -1; gs.over = false; gs.flash = []; gs.b = _gmFresh(gs);
            gs.msg = `Swap two neighboring gems to line up three or more. Collect ${gs.goal} gems in ${gs.swaps} swaps.`;
        },
        view: _gmView,
        rules: (gs) => [
            'Tap a gem, then a gem right next to it (above, below, left or right) to <b>swap</b> them.',
            'A swap must line up <b>three or more</b> of the same gem across or down. Those gems are collected, the gems above fall down, and new ones drop in. Falling gems can make more lines.',
            'A swap that makes no line is put back and costs nothing.',
            `Goal: collect <b>${gs.goal} gems</b> within <b>${gs.swaps} swaps</b>. Lines of four or five count extra.`,
            'Each gem has its own shape as well as its own color. No clock. Keyboard: arrow keys move, Enter picks and swaps.'],
        css: `.gm-b{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;background:#1e1b4b;padding:6px;border-radius:14px;box-shadow:inset 0 0 0 3px #312e81;max-width:min(100%,30rem,max(18rem,calc(100vh - 300px)));margin:0 auto}
.gm-s{aspect-ratio:1;border:0;padding:4%;min-width:0;background:#312e81;border-radius:10px;cursor:pointer;--nk-r:10px}
.gm-s svg{width:100%;height:100%;display:block;filter:drop-shadow(0 2px 0 rgba(0,0,0,.35))}
.gm-s.gm-sel{background:#fde68a;box-shadow:0 0 0 3px #f59e0b}
.gm-s.gm-nb{background:#4338ca}
.gm-s.gm-new svg{animation:gmdrop .25s ease-out}
@keyframes gmdrop{from{transform:translateY(-30%);opacity:.3}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.gm-s.gm-new svg{animation:none}}
.gm-bar{height:14px;border-radius:7px;background:#e5e7eb;overflow:hidden;margin:4px 0 10px}.gm-bar i{display:block;height:100%;background:linear-gradient(90deg,#a855f7,#ec4899)}`,
    });
}
const _gmRand = (gs) => Math.floor(Math.random() * gs.kinds);
function _gmFresh(gs) {
    for (;;) { const b = []; for (let i = 0; i < _GM_N * _GM_N; i++) { let k; do k = _gmRand(gs); while ((i % _GM_N >= 2 && b[i - 1] === k && b[i - 2] === k) || (i >= 2 * _GM_N && b[i - _GM_N] === k && b[i - 2 * _GM_N] === k)); b.push(k); } if (_gmAnyMove(b)) return b; }
}
function _gmLines(b) {   // set of cells in lines of 3+, and bonus count
    const hit = new Set(); let bonus = 0, N = _GM_N;
    for (let r = 0; r < N; r++) for (let c = 0; c < N;) { let e = c; while (e + 1 < N && b[r * N + e + 1] === b[r * N + c] && b[r * N + c] >= 0) e++; const L = e - c + 1; if (L >= 3) { for (let x = c; x <= e; x++) hit.add(r * N + x); bonus += L - 3; } c = e + 1; }
    for (let c = 0; c < N; c++) for (let r = 0; r < N;) { let e = r; while (e + 1 < N && b[(e + 1) * N + c] === b[r * N + c] && b[r * N + c] >= 0) e++; const L = e - r + 1; if (L >= 3) { for (let y = r; y <= e; y++) hit.add(y * N + c); bonus += L - 3; } r = e + 1; }
    return { hit, bonus };
}
function _gmSwap(b, i, j) { const t = b[i]; b[i] = b[j]; b[j] = t; }
function _gmAnyMove(b) { const N = _GM_N; for (let i = 0; i < N * N; i++) for (const j of [i + 1, i + N]) { if (j >= N * N || (j === i + 1 && i % N === N - 1)) continue; _gmSwap(b, i, j); const ok = _gmLines(b).hit.size > 0; _gmSwap(b, i, j); if (ok) return true; } return false; }
const _gmAdj = (i, j) => { const N = _GM_N; return (Math.abs(i - j) === 1 && Math.floor(i / N) === Math.floor(j / N)) || Math.abs(i - j) === N; };
function gmTap(i) {
    const gs = gameState.gemswap; if (gs.over) return;
    if (gs.sel < 0 || gs.sel === i) { gs.sel = gs.sel === i ? -1 : i; gs.msg = gs.sel < 0 ? '' : `${_GM_K[gs.b[i]].n} picked. Tap a gem next to it to swap.`; return NK.render('gemswap'); }
    if (!_gmAdj(gs.sel, i)) { gs.sel = i; gs.msg = `Only gems side by side can swap. ${_GM_K[gs.b[i]].n} picked instead.`; return NK.render('gemswap'); }
    const a = gs.sel; _gmSwap(gs.b, a, i); gs.sel = -1;
    let L = _gmLines(gs.b);
    if (!L.hit.size) { _gmSwap(gs.b, a, i); gs.msg = 'That swap makes no line of three, so it was put back. No swap used.'; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('gemswap'); }
    gs.swaps--; let got = 0, chain = 0; const fresh = new Set();
    while (L.hit.size) {
        chain++; got += L.hit.size + L.bonus * 2; L.hit.forEach((x) => (gs.b[x] = -1));
        for (let c = 0; c < _GM_N; c++) { const col = []; for (let r = _GM_N - 1; r >= 0; r--) if (gs.b[r * _GM_N + c] >= 0) col.push(gs.b[r * _GM_N + c]); for (let r = _GM_N - 1, k = 0; r >= 0; r--, k++) { const idx = r * _GM_N + c; if (k < col.length) gs.b[idx] = col[k]; else { gs.b[idx] = _gmRand(gs); fresh.add(idx); } } }
        L = _gmLines(gs.b);
    }
    gs.got += got; gs.flash = [...fresh]; if (typeof sfxFlip === 'function') sfxFlip();
    if (gs.got >= gs.goal) { gs.over = true; gs.msg = `Goal reached: ${gs.got} gems!`; NK.render('gemswap'); if (typeof sfxCorrect === 'function') sfxCorrect(); return NK.finish('gemswap', true, `${gs.got} gems collected with ${NK.pl(gs.swaps, 'swap')} to spare.`); }
    if (!gs.swaps) { gs.over = true; gs.msg = `Out of swaps with ${gs.got} of ${gs.goal} gems.`; NK.render('gemswap'); return NK.finish('gemswap', false, `${gs.got} of ${gs.goal} gems collected. A new board is one tap away.`); }
    let extra = ''; if (!_gmAnyMove(gs.b)) { gs.b = _gmFresh(gs); extra = ' No swaps were left, so the board was reshuffled for free.'; }
    gs.msg = `${got} gems${chain > 1 ? ` (a chain of ${chain}!)` : ''}. ${gs.goal - gs.got} to go, ${NK.pl(gs.swaps, 'swap')} left.${extra}`;
    NK.render('gemswap');
}
function gmNew() { initGemswap(); }
const _gmSvg = (k) => `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="${_GM_K[k].d}" fill="${_GM_K[k].c}" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
function _gmView(gs) {
    const h = gs.b.map((k, i) => `<button type="button" class="nk-cell gm-s${gs.sel === i ? ' gm-sel' : gs.sel >= 0 && _gmAdj(gs.sel, i) ? ' gm-nb' : ''}${gs.flash.includes(i) ? ' gm-new' : ''}" onclick="gmTap(${i})" data-k="g${i}"${i === 24 ? ' data-first' : ''} aria-label="row ${Math.floor(i / _GM_N) + 1} column ${i % _GM_N + 1}: ${_GM_K[k].n}${gs.sel === i ? ', picked' : ''}"${gs.over ? ' disabled' : ''}>${_gmSvg(k)}</button>`).join('');
    gs.flash = [];
    return `<div class="nk-top"><span>Gems: <b>${gs.got}</b> of ${gs.goal}</span><span>Swaps left: <b>${gs.swaps}</b></span></div>
      <div class="gm-bar" role="img" aria-label="${Math.min(100, Math.round(gs.got / gs.goal * 100))} percent of the goal"><i style="width:${Math.min(100, gs.got / gs.goal * 100)}%"></i></div>
      <div class="gm-b">${h}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New board', 'gmNew()', { k: 'restart' })}</div>`;
}
