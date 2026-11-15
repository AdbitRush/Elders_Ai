// ═══════════════════════════════════════════════════════════════════════════════
// TOWER OF HANOI (2026-11, nostalgia batch 3) — the toy-box disk puzzle (published by Édouard Lucas in 1883).
// Move the whole stack from the left peg to the right peg: one disk at a time, never a bigger disk on a smaller one.
// Tap a peg to lift its top disk, tap another peg to set it down. Easy 3 disks, normal 4, hard 5. The fewest moves
// possible is 2^n - 1; any finish counts. Undo, Start over. No clock.
// Presentation (2026-11 visual pass): a wooden toy - turned pegs on a polished base, painted wooden rings, the lifted
// ring floats above its peg, walnut plaques for the counts, a warm glow on the win. CSS only, no assets.
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
        css: `.hn-scene{position:relative;max-width:34rem;margin:0 auto 10px;padding:12px 12px 26px;border-radius:20px;background:radial-gradient(120% 85% at 50% 0%,#fffaf0 0%,#f8ecd4 55%,#ecd8b4 100%);box-shadow:inset 0 0 0 1px rgba(120,80,30,.2),0 2px 10px rgba(90,60,20,.14)}
.nk-top.hn-top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 8px}
.nk-top.hn-top span{display:inline-flex;align-items:baseline;gap:.4em;padding:7px 14px;border-radius:10px;font:700 1.05rem/1.2 system-ui,sans-serif;color:#fff4dc;background:repeating-linear-gradient(93deg,rgba(0,0,0,0) 0 9px,rgba(0,0,0,.09) 9px 10px,rgba(0,0,0,0) 10px 17px,rgba(255,220,170,.06) 17px 19px),linear-gradient(180deg,#7d4c23 0%,#5a3415 100%);box-shadow:inset 0 1px 0 rgba(255,220,170,.4),inset 0 -2px 0 rgba(0,0,0,.3),0 2px 4px rgba(60,30,8,.3);text-shadow:0 -1px 0 rgba(40,20,5,.6)}
.nk-top.hn-top span b{font-size:1.35rem;font-weight:900;color:#ffe2a6}
.hn-hold{min-height:1.9em;display:flex;align-items:center;justify-content:center;margin:0 0 2px;font:700 1.05rem/1.2 system-ui,sans-serif;color:#5a4028}
.hn-hold b{color:#8a3b12;font-weight:900}
.hn-row{position:relative;isolation:isolate;display:grid;grid-template-columns:repeat(3,1fr);gap:0;padding:0 8px}
.hn-row::before{content:"";position:absolute;z-index:-1;left:3%;right:3%;bottom:-13px;height:20px;border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(70,40,10,.38),rgba(70,40,10,0))}
.hn-row::after{content:"";position:absolute;z-index:0;left:0;right:0;bottom:0;height:42px;border-radius:9px 9px 13px 13px;background:repeating-linear-gradient(91deg,rgba(70,35,8,0) 0 13px,rgba(70,35,8,.13) 13px 14px,rgba(70,35,8,0) 14px 31px,rgba(255,225,180,.1) 31px 33px,rgba(70,35,8,0) 33px 47px,rgba(70,35,8,.09) 47px 49px),linear-gradient(180deg,#d09a5e 0%,#b0763c 40%,#8c5626 100%);box-shadow:inset 0 2px 0 rgba(255,236,205,.6),inset 0 -4px 0 rgba(60,30,8,.38),0 9px 12px -6px rgba(70,40,10,.55)}
.hn-col{position:relative;z-index:1;min-width:0}
.hn-peg{position:relative;width:100%;height:clamp(200px,50vw,260px);border:0;margin:0;background:transparent;border-radius:14px 14px 0 0;cursor:pointer;display:flex;flex-direction:column-reverse;align-items:center;padding:0 3px;gap:2px;color:inherit;font:inherit;-webkit-tap-highlight-color:transparent;--nk-r:14px}
.hn-peg::before{content:"";position:absolute;bottom:0;top:46px;left:50%;width:14px;margin-left:-7px;border-radius:7px 7px 0 0;background:repeating-linear-gradient(180deg,rgba(60,30,8,0) 0 27px,rgba(60,30,8,.26) 27px 29px,rgba(255,230,190,.25) 29px 30px),linear-gradient(90deg,#70411a 0%,#b47c3d 28%,#e6b97e 47%,#b17536 68%,#653915 100%)}
.hn-peg::after{content:"";position:absolute;top:36px;left:50%;width:20px;height:20px;margin-left:-10px;border-radius:50%;background:radial-gradient(circle at 38% 32%,#f3cf98 0%,#c28c4c 45%,#74441c 100%);box-shadow:0 1px 2px rgba(50,25,5,.45)}
.hn-peg:disabled{cursor:default;opacity:1}
.hn-peg.hn-sel{background:radial-gradient(62% 72% at 50% 58%,rgba(255,208,120,.6),rgba(255,208,120,0) 72%);box-shadow:inset 0 0 0 3px rgba(180,83,9,.85)}
@media (hover:hover){.hn-peg:not(:disabled):not(.hn-sel):hover{background:radial-gradient(60% 70% at 50% 60%,rgba(255,224,160,.45),rgba(255,224,160,0) 72%)}}
.hn-d{position:relative;z-index:1;flex:none;height:clamp(24px,6vw,30px);border-radius:999px;display:flex;align-items:center;justify-content:center;font:900 1.05rem/1 system-ui,sans-serif;background:linear-gradient(180deg,rgba(255,255,255,.52) 0%,rgba(255,255,255,.14) 30%,rgba(0,0,0,0) 56%,rgba(0,0,0,.26) 100%),var(--c,#c2410c);box-shadow:inset 0 0 0 1.5px rgba(60,25,5,.38),inset 0 -3px 4px rgba(60,20,0,.2),0 2px 2px rgba(60,30,8,.38)}
.hn-up{position:absolute;z-index:2;top:5px;left:3px;right:3px;display:flex;justify-content:center;pointer-events:none;animation:hn-rise .22s ease-out,hn-bob 2.6s .22s ease-in-out infinite alternate}
.hn-up .hn-d{box-shadow:inset 0 0 0 1.5px rgba(60,25,5,.38),inset 0 -3px 4px rgba(60,20,0,.2),0 0 0 3px rgba(255,236,190,.85),0 12px 10px -5px rgba(60,30,8,.5)}
.hn-lab{height:42px;display:flex;align-items:center;justify-content:center}
.hn-lab span{display:inline-block;min-width:1.9em;padding:3px 10px;border-radius:8px;text-align:center;font:800 1.05rem/1.25 system-ui,sans-serif;color:#fff4dc;background:linear-gradient(180deg,#5e3716,#4a2a0f);box-shadow:inset 0 2px 3px rgba(0,0,0,.5),0 1px 0 rgba(255,230,190,.45)}
.hn-win{background:radial-gradient(120% 85% at 50% 0%,#fffdf3 0%,#fdeec3 55%,#f3d18a 100%);animation:hn-glow 2.4s ease-in-out infinite alternate}
.hn-win .hn-col:last-child .hn-peg{background:radial-gradient(70% 75% at 50% 62%,rgba(255,205,96,.75),rgba(255,205,96,0) 72%)}
.hn-win .hn-col:last-child .hn-lab span{background:linear-gradient(180deg,#a1620f,#7c4708);color:#fff8e1}
@keyframes hn-rise{from{transform:translateY(34px)}to{transform:none}}
@keyframes hn-bob{from{transform:translateY(0)}to{transform:translateY(4px)}}
@keyframes hn-glow{from{box-shadow:inset 0 0 0 1px rgba(120,80,30,.2),0 0 0 3px rgba(245,180,60,.35),0 0 14px rgba(245,170,50,.3)}to{box-shadow:inset 0 0 0 1px rgba(120,80,30,.2),0 0 0 4px rgba(245,180,60,.6),0 0 34px rgba(245,170,50,.6)}}
@media (prefers-reduced-motion:reduce){.hn-up{animation:none}.hn-win{animation:none;box-shadow:inset 0 0 0 1px rgba(120,80,30,.2),0 0 0 4px rgba(245,180,60,.55),0 0 24px rgba(245,170,50,.45)}}`,
    });
}
// Painted wooden rings, warm and graduated: the smallest is the lightest.
const _HN_COL = ['#f8d98c', '#f0ad4e', '#dc7a3c', '#b94a30', '#8c2f3a', '#5c2a40'];
const _hnDisk = (d, n) => `<span class="hn-d" style="width:${30 + (d / n) * 62}%;--c:${_HN_COL[d - 1]};color:${d > 3 ? '#fff8ea' : '#3b2208'};text-shadow:${d > 3 ? '0 1px 1px rgba(40,10,0,.6)' : '0 1px 0 rgba(255,255,255,.5)'}" aria-hidden="true">${d}</span>`;
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
        const up = gs.hold === i, shown = up ? p.slice(0, -1) : p;
        // the lifted ring stays inside its own peg button, floating above the post
        const lifted = up ? `<span class="hn-up">${_hnDisk(p[p.length - 1], gs.n)}</span>` : '';
        return `<div class="hn-col"><button type="button" class="nk-cell hn-peg${up ? ' hn-sel' : ''}" onclick="hnTap(${i})" data-k="p${i}"${i === 0 ? ' data-first' : ''} aria-label="${['left', 'middle', 'right'][i]} peg, ${p.length ? 'disks ' + p.join(', ') + ' from the bottom' : 'empty'}"${gs.over ? ' disabled' : ''}>${shown.map((d) => _hnDisk(d, gs.n)).join('')}${lifted}</button><div class="hn-lab"><span>${i + 1}${i === 2 ? ' (goal)' : ''}</span></div></div>`;
    }).join('');
    const held = gs.hold >= 0 ? gs.pegs[gs.hold][gs.pegs[gs.hold].length - 1] : 0;
    return `<div class="hn-scene${gs.over ? ' hn-win' : ''}" dir="ltr">
      <div class="nk-top hn-top"><span>Moves: <b>${gs.moves}</b></span><span>Fewest possible: <b>${gs.best}</b></span></div>
      <div class="hn-hold" aria-live="polite">${held ? `<span aria-hidden="true">Holding disk <b>${held}</b></span>` : `<span>${gs.over ? 'Tower complete' : 'No disk lifted'}</span>`}</div>
      <div class="hn-row">${pegs}</div>
      </div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('undo-2') + 'Undo', 'hnUndo()', { k: 'undo', disabled: gs.over || !gs.hist.length })}${NK.btn('Start over', 'hnReset()', { k: 'reset', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'hnNew()', { k: 'restart' })}</div>`;
}
