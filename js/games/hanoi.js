// ═══════════════════════════════════════════════════════════════════════════════
// TOWER OF HANOI (2026-11, nostalgia batch 3) — the toy-box disk puzzle (published by Édouard Lucas in 1883).
// Move the whole stack from the left peg to the right peg: one disk at a time, never a bigger disk on a smaller one.
// Tap a peg to lift its top disk, tap another peg to set it down. Easy 3 disks, normal 4, hard 5. The fewest moves
// possible is 2^n - 1; any finish counts. Undo, Start over. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
function initHanoi() {
    NK.start('hanoi', {
        setup(gs, diff) {
            gs.n = diff === 'easy' ? 3 : diff === 'hard' ? 5 : 4;
            gs.pegs = [Array.from({ length: gs.n }, (_, i) => gs.n - i), [], []];
            gs.hold = -1; gs.moves = 0; gs.hist = []; gs.over = false; gs.best = 2 ** gs.n - 1;
            gs.msg = `Move all ${gs.n} disks to the right-hand peg. Tap a peg to lift its top disk.`;
        },
        view: _hnView,
        keys: Object.assign({ KeyU: () => hnUndo() }, NK.digits((k) => hnTap(k - 1), 3)),
        rules: (gs) => [
            'Move the whole stack from the <b>left peg</b> to the <b>right peg</b>.',
            'Move <b>one disk at a time</b>: tap a peg to lift its top disk, then tap the peg to put it on.',
            'A disk may never sit on a <b>smaller</b> disk.',
            `The fewest moves possible with ${gs.n} disks is <b>${gs.best}</b>. Any finish counts. Undo and Start over are always there.`,
            'No clock. Keyboard: 1, 2, 3 pick the pegs, U undoes, or arrow keys and Enter.'],
        css: `.hn-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:34rem;margin:0 auto}
.hn-peg{position:relative;width:100%;height:clamp(180px,42vw,240px);border:0;background:linear-gradient(#fff7e6,#f3e2c2);border-radius:14px;cursor:pointer;display:flex;flex-direction:column-reverse;align-items:center;padding:0 4px 18px;gap:3px;--nk-r:14px}
.hn-peg::before{content:"";position:absolute;bottom:14px;top:22px;left:50%;width:10px;margin-left:-5px;background:#8a5a2b;border-radius:5px}
.hn-peg::after{content:"";position:absolute;bottom:6px;left:8%;right:8%;height:10px;background:#6b4220;border-radius:5px}
.hn-peg.hn-sel{box-shadow:inset 0 0 0 4px #1d4ed8}
.hn-d{position:relative;z-index:1;height:clamp(20px,5vw,26px);border-radius:10px;border:2px solid rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font:900 .9rem system-ui;color:#fff;text-shadow:0 1px 1px rgba(0,0,0,.5)}
.hn-hold{height:40px;display:flex;align-items:center;justify-content:center;margin-bottom:6px}
.hn-lab{text-align:center;font-weight:800;color:#4a3420;margin-top:4px}`,
    });
}
const _HN_COL = ['#b91c1c', '#c2410c', '#a16207', '#15803d', '#1d4ed8', '#6d28d9'];
const _hnDisk = (d, n) => `<span class="hn-d" style="width:${30 + (d / n) * 62}%;background:${_HN_COL[d - 1]}" aria-hidden="true">${d}</span>`;
function hnTap(p) {
    const gs = gameState.hanoi; if (gs.over || p < 0 || p > 2) return;
    if (gs.hold < 0) {
        if (!gs.pegs[p].length) { gs.msg = 'That peg is empty. Tap a peg with disks on it.'; return NK.render('hanoi'); }
        gs.hold = p; gs.msg = `Disk ${gs.pegs[p][gs.pegs[p].length - 1]} lifted. Tap the peg to put it on (or the same peg to put it back).`; return NK.render('hanoi');
    }
    const from = gs.hold; gs.hold = -1;
    if (from === p) { gs.msg = 'Put back.'; return NK.render('hanoi'); }
    const d = gs.pegs[from][gs.pegs[from].length - 1], top = gs.pegs[p][gs.pegs[p].length - 1];
    if (top && top < d) { gs.msg = `Disk ${d} cannot go on the smaller disk ${top}.`; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('hanoi'); }
    gs.hist.push(gs.pegs.map((x) => x.slice())); gs.pegs[from].pop(); gs.pegs[p].push(d); gs.moves++;
    if (typeof sfxFlip === 'function') sfxFlip();
    if (gs.pegs[2].length === gs.n) {
        gs.over = true; gs.msg = `The tower is moved in ${NK.pl(gs.moves, 'move')}${gs.moves === gs.best ? ' - the fewest possible!' : ` (the fewest is ${gs.best}).`}`;
        NK.render('hanoi'); if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('hanoi', true, `Tower moved in ${NK.pl(gs.moves, 'move')}; the fewest possible is ${gs.best}.`);
    }
    gs.msg = `Moved disk ${d}.`; NK.render('hanoi');
}
function hnUndo() { const gs = gameState.hanoi; if (gs.over || !gs.hist.length) return; gs.pegs = gs.hist.pop(); gs.moves--; gs.hold = -1; gs.msg = 'Move taken back.'; NK.render('hanoi'); }
function hnReset() { const gs = gameState.hanoi; if (gs.over) return; gs.pegs = [Array.from({ length: gs.n }, (_, i) => gs.n - i), [], []]; gs.hold = -1; gs.moves = 0; gs.hist = []; gs.msg = 'Back to the start.'; NK.render('hanoi'); }
function hnNew() { initHanoi(); }
function _hnView(gs) {
    const pegs = gs.pegs.map((p, i) => {
        const shown = gs.hold === i ? p.slice(0, -1) : p;
        return `<div><button type="button" class="nk-cell hn-peg${gs.hold === i ? ' hn-sel' : ''}" onclick="hnTap(${i})" data-k="p${i}"${i === 0 ? ' data-first' : ''} aria-label="${['left', 'middle', 'right'][i]} peg, ${p.length ? 'disks ' + p.join(', ') + ' from the bottom' : 'empty'}"${gs.over ? ' disabled' : ''}>${shown.map((d) => _hnDisk(d, gs.n)).join('')}</button><div class="hn-lab">${i + 1}${i === 2 ? ' (goal)' : ''}</div></div>`;
    }).join('');
    const held = gs.hold >= 0 ? gs.pegs[gs.hold][gs.pegs[gs.hold].length - 1] : 0;
    return `<div class="nk-top"><span>Moves: <b>${gs.moves}</b></span><span>Fewest possible: <b>${gs.best}</b></span></div>
      <div class="hn-hold" aria-live="polite">${held ? `<span style="width:min(60%,16rem);display:flex;justify-content:center">${_hnDisk(held, gs.n)}</span>` : '<span style="color:#6b5640;font-weight:700">No disk lifted</span>'}</div>
      <div class="hn-row">${pegs}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('undo-2') + 'Undo', 'hnUndo()', { k: 'undo', disabled: gs.over || !gs.hist.length })}${NK.btn('Start over', 'hnReset()', { k: 'reset', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'hnNew()', { k: 'restart' })}</div>`;
}
