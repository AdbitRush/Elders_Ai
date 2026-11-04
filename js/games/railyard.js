// ═══════════════════════════════════════════════════════════════════════════════
// RAIL YARD SHUFFLE (2026-11, nostalgia batch 2) — a freight-yard switching puzzle in the tradition of the "shunting
// puzzles" model railroaders lay out on a shelf. Solo, no clock.
// A yard engine works three dead-end sidings (each holds only so many cars) from a short lead track that has room
// for the engine and at most 3 cars. Make up the requested train, in order, on siding A.
// One move: the engine goes into a siding, couples to everything there, and comes back out with up to 3 cars
// (the ones nearest to it, counting the cars it brought in), leaving the rest. So a move can drop cars, pick cars
// up, or both. Every puzzle is made by running random legal moves backwards from a finished train, so it can
// always be solved. Easy and normal show "par", the fewest possible moves (found by a full search).
// Easy: 5 cars, train of 3. Normal: 6 cars, train of 4. Hard: 8 cars, train of 5 on the classic 5-3-3 sidings.
// Sidings: S[x][0] is the car nearest the switches; the engine's cars E[0] is the car nearest the engine.
// ═══════════════════════════════════════════════════════════════════════════════
const _RY_COL = [['#b91c1c', '#fff'], ['#1d4ed8', '#fff'], ['#15803d', '#fff'], ['#facc15', '#1f1406'], ['#7e22ce', '#fff'], ['#ea580c', '#1f1406'], ['#0e7490', '#fff'], ['#4b5563', '#fff']];
const _RY_NAMES = ['A', 'B', 'C'];
const _ryMove = (S, E, x, k, caps) => { const comb = E.concat(S[x]), rest = comb.slice(k); if (k > 3 || k > comb.length || rest.length > caps[x]) return null; return { S: S.map((s, i) => (i === x ? rest : s.slice())), E: comb.slice(0, k) }; };
function _ryPar(S0, caps, target, limit) {
    const key = (S, E) => S.map((s) => s.join(',')).join('|') + '/' + E.join(',');
    const goal = target.join(','), q = [[S0, []]], seen = new Map([[key(S0, []), 0]]);
    for (let h = 0; h < q.length; h++) {
        const [S, E] = q[h], d = seen.get(key(S, E));
        if (!E.length && S[0].join(',') === goal) return d;
        for (let x = 0; x < S.length; x++) for (let k = 0; k <= 3; k++) { const m = _ryMove(S, E, x, k, caps); if (!m) continue; const kk = key(m.S, m.E); if (seen.has(kk)) continue; seen.set(kk, d + 1); if (seen.size > limit) return -1; q.push([m.S, m.E]); }
    }
    return -1;
}
function initRailYard() {
    NK.start('railyard', {
        setup(gs, diff) {
            const [n, caps, L] = diff === 'easy' ? [5, [3, 3, 2], 3] : diff === 'hard' ? [8, [5, 3, 3], 5] : [6, [4, 3, 3], 4];
            gs.caps = caps; const cars = shuffle([...Array(n).keys()]);
            gs.target = cars.slice(0, L);
            // a finished yard: the train on A, the other cars on B and C, then random legal moves
            let S = [gs.target.slice(), [], []], E = [];
            cars.slice(L).forEach((c) => { const x = S[1].length < caps[1] ? 1 : 2; S[x].push(c); });
            for (let i = 0; i < 400 || E.length || S[0].join() === gs.target.join(); i++) {
                const opts = []; for (let x = 0; x < 3; x++) for (let k = 0; k <= 3; k++) { const m = _ryMove(S, E, x, k, caps); if (m) opts.push(m); }
                const m = opts[Math.floor(Math.random() * opts.length)]; S = m.S; E = m.E;
                if (i > 2000) break;
            }
            gs.S = S; gs.E = E; gs.start = { S: S.map((s) => s.slice()), E: E.slice() };
            gs.par = diff === 'hard' ? null : _ryPar(S, caps, gs.target, 120000);
            gs.moves = 0; gs.hist = []; gs.sel = -1; gs.over = false;
            gs.msg = 'Pick a siding to send the engine into.';
        },
        view: _ryView,
        keys: Object.assign({ KeyA: () => rySel(0), KeyB: () => rySel(1), KeyC: () => rySel(2), KeyU: () => ryUndo() }, { Digit0: () => ryGo(0), Numpad0: () => ryGo(0) }, NK.digits((k) => ryGo(k), 3)),
        rules: (gs) => [
            `Make up the train shown at the top on <b>siding A</b>, in that order, starting at the switch end.`,
            `The sidings hold ${gs.caps.map((c, i) => `${_RY_NAMES[i]} ${c}`).join(', ')} cars. The lead track has room for the engine and <b>at most 3 cars</b>.`,
            'One move: pick a siding, and the engine goes in, couples to everything there (and the cars it already has), then comes back out with the number of cars you choose - always the ones nearest to the engine. The rest stay in the siding.',
            'So "come out with 0 cars" leaves everything in the siding, and choosing more than the engine brought in picks cars up.',
            gs.par ? `<b>Par</b> is ${gs.par} moves, the fewest possible. Any finish counts.` : 'Any finish counts; on hard there is no par.',
            'Undo takes back a move. No clock. Keyboard: A, B, C pick a siding; 0 to 3 choose how many cars come out; U undoes.'],
        css: `.ry-yard{background:#e7dcc3;border:3px solid #a08360;border-radius:14px;padding:10px;display:flex;flex-direction:column;gap:10px}
.ry-row{display:flex;align-items:center;gap:8px;min-height:62px;width:100%;box-sizing:border-box;border-radius:12px;padding:6px 8px;background:repeating-linear-gradient(90deg,#8a6a4a 0 4px,transparent 4px 22px) 0 55%/100% 6px no-repeat,#efe6d2;border:3px solid transparent;cursor:pointer;--nk-r:12px;--nk-bw:3px;text-align:left;font:inherit;color:#2b1b0d}
.ry-row.ry-sel{border-color:#b45309;background-color:#fde68a}
.ry-row:disabled{cursor:default}
.ry-lab{flex:0 0 auto;width:4.4em;font-weight:900;line-height:1.1;font-size:1rem}
.ry-lab small{display:block;font-weight:700;font-size:.8rem;color:#4a3420}
.ry-cars{display:flex;gap:4px;flex-wrap:nowrap;align-items:center;min-width:0}
.ry-car{width:clamp(34px,10vw,48px);height:34px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font:900 1.15rem system-ui,sans-serif;border:2px solid #1f1406;position:relative;flex:0 0 auto}
.ry-car::after{content:"";position:absolute;bottom:-8px;left:18%;right:18%;height:6px;background:radial-gradient(circle,#1f1406 3px,transparent 4px) 0 0/50% 100%}
.ry-slot{width:clamp(34px,10vw,48px);height:30px;border:2px dashed #a08360;border-radius:6px;flex:0 0 auto}
.ry-eng{width:58px;height:40px;border-radius:8px 14px 6px 6px;background:#1f2937;color:#facc15;display:inline-flex;align-items:center;justify-content:center;font:900 .8rem system-ui;flex:0 0 auto;position:relative}
.ry-eng::before{content:"";position:absolute;top:-9px;left:8px;width:12px;height:10px;background:#1f2937;border-radius:2px}
.ry-lead{display:flex;align-items:center;gap:6px;padding:6px 8px;background:#efe6d2;border-radius:12px;min-height:56px}
.ry-target{display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;margin-bottom:10px;font-weight:800}
.ry-go{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0}`,
    });
}
const _ryCar = (c) => `<span class="ry-car" style="background:${_RY_COL[c][0]};color:${_RY_COL[c][1]}" aria-label="car ${c + 1}">${c + 1}</span>`;
function rySel(x) { const gs = gameState.railyard; if (gs.over) return; gs.sel = gs.sel === x ? -1 : x; gs.msg = gs.sel < 0 ? 'Pick a siding.' : `Siding ${_RY_NAMES[x]}: how many cars should the engine come back out with?`; NK.render('railyard'); }
function ryGo(k) {
    const gs = gameState.railyard; if (gs.over) return;
    if (gs.sel < 0) { gs.msg = 'First pick a siding (A, B or C).'; return NK.render('railyard'); }
    const x = gs.sel, m = _ryMove(gs.S, gs.E, x, k, gs.caps);
    if (!m) { const comb = gs.E.length + gs.S[x].length; gs.msg = k > comb ? `There are only ${comb} cars to take.` : `Siding ${_RY_NAMES[x]} holds only ${gs.caps[x]} cars, so the engine must take at least ${comb - gs.caps[x]}.`; return NK.render('railyard'); }
    gs.hist.push({ S: gs.S, E: gs.E }); gs.S = m.S; gs.E = m.E; gs.moves++; gs.sel = -1;
    if (typeof sfxFlip === 'function') sfxFlip();
    if (!gs.E.length && gs.S[0].join() === gs.target.join()) {
        gs.over = true; gs.msg = `The train is made up in ${NK.pl(gs.moves, 'move')}!`; NK.render('railyard');
        if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('railyard', true, `Train made up in ${NK.pl(gs.moves, 'move')}${gs.par ? ` (par ${gs.par})` : ''}.`);
    }
    gs.msg = `Move ${gs.moves} done. The engine has ${NK.pl(gs.E.length, 'car')}.` + (gs.S[0].join() === gs.target.join() ? ' The train is right - now bring the engine out empty.' : '');
    NK.render('railyard');
}
function ryUndo() { const gs = gameState.railyard; if (gs.over || !gs.hist.length) return; const h = gs.hist.pop(); gs.S = h.S; gs.E = h.E; gs.moves--; gs.sel = -1; gs.msg = 'Move taken back.'; NK.render('railyard'); }
function ryReset() { const gs = gameState.railyard; if (gs.over) return; gs.S = gs.start.S.map((s) => s.slice()); gs.E = gs.start.E.slice(); gs.hist = []; gs.moves = 0; gs.sel = -1; gs.msg = 'Back to the start.'; NK.render('railyard'); }
function ryNew() { initRailYard(); }
function _ryView(gs) {
    const rows = gs.S.map((s, x) => {
        const slots = gs.caps[x] - s.length;
        return `<button type="button" class="nk-cell ry-row${gs.sel === x ? ' ry-sel' : ''}" onclick="rySel(${x})" data-k="s${x}"${x === 0 ? ' data-first' : ''} aria-label="siding ${_RY_NAMES[x]}, holds ${gs.caps[x]}: ${s.length ? s.map((c) => 'car ' + (c + 1)).join(', ') : 'empty'}"${gs.over ? ' disabled' : ''}><span class="ry-lab">Siding ${_RY_NAMES[x]}<small>holds ${gs.caps[x]}</small></span><span class="ry-cars">${s.map(_ryCar).join('')}${'<span class="ry-slot"></span>'.repeat(Math.max(0, slots))}</span></button>`;
    }).join('');
    const comb = gs.sel >= 0 ? gs.E.length + gs.S[gs.sel].length : 0;
    const go = gs.sel >= 0 ? [0, 1, 2, 3].filter((k) => k <= comb).map((k) => NK.btn(`Come out with ${k}`, `ryGo(${k})`, { k: 'g' + k, cls: 'gk-primary', disabled: !_ryMove(gs.S, gs.E, gs.sel, k, gs.caps) })).join('') : '';
    return `<div class="nk-top"><span>Moves: <b>${gs.moves}</b>${gs.par ? ` (par ${gs.par})` : ''}</span></div>
      <div class="ry-target">Make up on siding A: ${gs.target.map(_ryCar).join('')}</div>
      <div class="ry-yard">
        <div class="ry-lead" aria-label="the engine on the lead track${gs.E.length ? ', with ' + gs.E.map((c) => 'car ' + (c + 1)).join(', ') : ''}"><span class="ry-eng">ENGINE</span><span class="ry-cars">${gs.E.map(_ryCar).join('')}${'<span class="ry-slot"></span>'.repeat(3 - gs.E.length)}</span></div>
        ${rows}
      </div>
      <div class="ry-go" role="group" aria-label="how many cars come out">${go}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('undo-2') + 'Undo', 'ryUndo()', { k: 'undo', disabled: gs.over || !gs.hist.length })}${NK.btn('Start over', 'ryReset()', { k: 'reset', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New puzzle', 'ryNew()', { k: 'restart' })}</div>`;
}
