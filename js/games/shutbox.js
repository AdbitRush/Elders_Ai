// ═══════════════════════════════════════════════════════════════════════════════
// SHUT THE BOX (2026-11, nostalgia batch 2) — the old pub and kitchen-table dice game, three rounds against the
// computer. No clock.
// Each player has a box of number tiles (1-9; 1-12 on hard). On your turn roll two dice, then shut open tiles that add
// up to the roll (one tile or several). Keep rolling until no open tiles add up to the roll. Your round score is the
// sum of the tiles still open - lower is better, and shutting every tile scores 0. Once 7 and up are all shut you may
// roll one die. After three rounds each, the lower total wins (a tie is not a win).
// Two-step on purpose: tap tiles to pick them (the running sum shows), then press Shut them.
// The computer's box plays out one step at a time so you can follow it.
// ═══════════════════════════════════════════════════════════════════════════════
function initShutBox() {
    NK.start('shutbox', {
        setup(gs, diff) {
            gs.n = diff === 'hard' ? 12 : 9; gs.rounds = 3; gs.round = 1;
            gs.tot = [0, 0]; gs.hist = []; gs.over = false;
            _sbNewBox(gs, 0);
            gs.msg = `Round 1 of 3. Tap Roll two dice. Then shut tiles that add up to the roll.`;
        },
        view: _sbView,
        keys: Object.assign({ KeyR: () => sbRoll(2), KeyO: () => sbRoll(1), KeyS: () => sbShut() }, NK.digits((n) => sbTile(n), 9)),
        rules: (gs) => [
            `Your box has tiles 1 to ${gs.n}. Tap <b>Roll two dice</b>.`,
            'Tap open tiles that <b>add up to the roll</b> - one tile or several (a roll of 8 could be 8, or 5 + 3, or 1 + 3 + 4). The sum of your picks shows as you go. Then press <b>Shut them</b>.',
            'Roll again and keep going. When no open tiles add up to your roll, your box is done for the round.',
            'Once tiles 7 and up are all shut, you may roll just one die.',
            'Your round score is the total of the tiles still open. Shutting every tile scores 0, the best there is.',
            'Then the computer plays its box. After three rounds the <b>lower total wins</b>. No clock.',
            'Keyboard: R rolls two dice, O rolls one die, 1 to 9 pick tiles, S shuts them.'],
        css: `.sb-tiles{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:5px;background:linear-gradient(#7a4a22,#5a3416);padding:10px 8px;border-radius:16px;box-shadow:inset 0 0 0 3px #3d230d}
.sb-t{min-height:64px;border:0;border-radius:8px;--nk-r:8px;background:linear-gradient(#fff7e6,#eed6a8);color:#2b1b0d;font:900 clamp(1.25rem,5vw,1.9rem)/1 Georgia,serif;cursor:pointer;display:flex;align-items:center;justify-content:center;min-width:0;padding:0;box-shadow:inset 0 -5px 0 rgba(0,0,0,.18)}
.sb-t.sb-pick{background:linear-gradient(#fde68a,#f59e0b);box-shadow:0 0 0 3px #fff,inset 0 -5px 0 rgba(0,0,0,.2)}
.sb-t.sb-shut{background:#3d230d;color:#8a6a4a;box-shadow:inset 0 4px 6px rgba(0,0,0,.5);cursor:default;font-size:1rem}
.sb-cpu .sb-t{min-height:40px;font-size:clamp(1rem,4vw,1.3rem)}
.sb-dice{display:flex;gap:12px;justify-content:center;align-items:center;margin:12px 0 4px;min-height:70px}
.sb-die{width:64px;height:64px;background:#fffdf7;border:3px solid #cbb994;border-radius:14px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);padding:9px;box-sizing:border-box}
.sb-die i{border-radius:50%;margin:12%}.sb-die i.on{background:#1d1b18}
.sb-sum{font-size:1.25rem;font-weight:900;margin-left:6px}
.sb-score{display:grid;grid-template-columns:auto repeat(3,1fr) auto;gap:4px 10px;font-size:1.05rem;background:#fff3d6;border:2px solid #e8cfa8;border-radius:12px;padding:8px 12px;margin-top:8px}
.sb-score b{font-weight:900}.sb-score .sb-h{font-weight:800;color:#4a3420}
.sb-lab{font-weight:800;margin:10px 2px 4px;color:#4a3420}
@media (max-width:480px){.sb-tiles{grid-template-columns:repeat(var(--nh),1fr)}}`,
    });
}
function _sbNewBox(gs, who) { gs.open = Array.from({ length: gs.n }, () => true); gs.who = who; gs.dice = []; gs.pick = []; gs.need = 0; }
const _SB_PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
const _sbDie = (v) => `<span class="sb-die" aria-label="die showing ${v}">${Array.from({ length: 9 }, (_, k) => `<i${_SB_PIPS[v].includes(k + 1) ? ' class="on"' : ''}></i>`).join('')}</span>`;
const _sbOpenVals = (gs) => gs.open.map((o, i) => (o ? i + 1 : 0)).filter(Boolean);
const _sbHighShut = (gs) => gs.open.slice(6).every((o) => !o);
// every way to make `t` from distinct open tiles
function _sbCombos(vals, t) {
    const out = [];
    (function rec(i, left, acc) { if (left === 0) { out.push(acc.slice()); return; } for (let k = i; k < vals.length; k++) { if (vals[k] > left) continue; acc.push(vals[k]); rec(k + 1, left - vals[k], acc); acc.pop(); } })(0, t, []);
    return out;
}
const _sbRest = (gs) => _sbOpenVals(gs).reduce((a, b) => a + b, 0);
function sbRoll(nd) {
    const gs = gameState.shutbox; if (gs.over || gs.who !== 0 || gs.need) return;
    if (nd === 1 && !_sbHighShut(gs)) { gs.msg = 'One die is allowed only after tiles 7 and up are all shut.'; return NK.render('shutbox'); }
    gs.dice = Array.from({ length: nd }, () => 1 + Math.floor(Math.random() * 6));
    gs.need = gs.dice.reduce((a, b) => a + b, 0); gs.pick = [];
    if (typeof sfxFlip === 'function') sfxFlip();
    if (!_sbCombos(_sbOpenVals(gs), gs.need).length) return _sbBoxDone(gs, `You rolled ${gs.need}. No open tiles add up to ${gs.need}, so your box is done.`);
    gs.msg = `You rolled ${gs.need}. Pick open tiles that add up to ${gs.need}.`;
    NK.render('shutbox');
}
function sbTile(v) {
    const gs = gameState.shutbox; if (gs.over || gs.who !== 0 || v < 1 || v > gs.n) return;
    if (!gs.need) { gs.msg = 'Roll the dice first.'; return NK.render('shutbox'); }
    if (!gs.open[v - 1]) { gs.msg = `Tile ${v} is already shut.`; return NK.render('shutbox'); }
    const i = gs.pick.indexOf(v);
    if (i >= 0) gs.pick.splice(i, 1); else gs.pick.push(v);
    const s = gs.pick.reduce((a, b) => a + b, 0);
    gs.msg = s === gs.need ? `${gs.pick.join(' + ')} = ${s}. Press Shut them.` : s > gs.need ? `${s} is more than ${gs.need}. Tap a picked tile to put it back.` : `Picked ${s} so far; the roll is ${gs.need}.`;
    NK.render('shutbox');
}
function sbShut() {
    const gs = gameState.shutbox; if (gs.over || gs.who !== 0 || !gs.need) return;
    const s = gs.pick.reduce((a, b) => a + b, 0);
    if (s !== gs.need) { gs.msg = `Your picks add up to ${s}, but the roll is ${gs.need}.`; return NK.render('shutbox'); }
    gs.pick.forEach((v) => (gs.open[v - 1] = false));
    if (typeof sfxCorrect === 'function') sfxCorrect();
    gs.pick = []; gs.need = 0; gs.dice = [];
    if (!_sbRest(gs)) return _sbBoxDone(gs, 'You shut the box - every tile!');
    gs.msg = `Shut. ${_sbHighShut(gs) ? 'Roll one die or two.' : 'Roll again.'}`;
    NK.render('shutbox');
}
function _sbBoxDone(gs, m) {
    const sc = _sbRest(gs);
    gs.tot[0] += sc; gs.hist.push([sc, null]);
    gs.msg = `${m} Your round score: ${sc}. Now the computer plays its box...`;
    gs.youShown = gs.open.slice();
    gs.need = 0; gs.who = 1; gs.cpuOpen = Array.from({ length: gs.n }, () => true); gs.dice = []; gs.cpuLog = '';
    NK.render('shutbox');
    NK.after(1300, _sbCpuStep);
}
function _sbCpuStep() {
    const gs = gameState.shutbox; if (gs.over) return;
    const vals = gs.cpuOpen.map((o, i) => (o ? i + 1 : 0)).filter(Boolean);
    const nd = gs.cpuOpen.slice(6).every((o) => !o) && vals.reduce((a, b) => a + b, 0) <= 6 ? 1 : 2;
    gs.dice = Array.from({ length: nd }, () => 1 + Math.floor(Math.random() * 6));
    const t = gs.dice.reduce((a, b) => a + b, 0), cs = _sbCombos(vals, t);
    if (typeof sfxFlip === 'function') sfxFlip();
    if (!cs.length) {
        const sc = vals.reduce((a, b) => a + b, 0);
        gs.tot[1] += sc; gs.hist[gs.hist.length - 1][1] = sc;
        gs.msg = `The computer rolled ${t} and is stuck. Its round score: ${sc}.`;
        NK.render('shutbox');
        return NK.after(1500, _sbRoundEnd);
    }
    // its habit: fewest tiles, then the biggest ones
    cs.sort((a, b) => a.length - b.length || Math.max(...b) - Math.max(...a));
    cs[0].forEach((v) => (gs.cpuOpen[v - 1] = false));
    gs.msg = `The computer rolled ${t} and shut ${cs[0].join(' + ')}.`;
    NK.render('shutbox');
    if (!gs.cpuOpen.some(Boolean)) { gs.hist[gs.hist.length - 1][1] = 0; gs.msg += ' It shut the box!'; NK.render('shutbox'); return NK.after(1500, _sbRoundEnd); }
    NK.after(1300, _sbCpuStep);
}
function _sbRoundEnd() {
    const gs = gameState.shutbox;
    if (gs.round >= gs.rounds) {
        gs.over = true; const [y, c] = gs.tot;
        gs.msg = `Final totals: you ${y}, computer ${c}. Lower wins.`;
        NK.render('shutbox');
        if (y < c && typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('shutbox', y < c, y < c ? `You won, ${y} to ${c} (lower is better)!` : y === c ? `A tie at ${y} each.` : `The computer won, ${c} to ${y}. The dice will roll differently next time.`);
    }
    gs.round++; _sbNewBox(gs, 0); gs.cpuOpen = null;
    gs.msg = `Round ${gs.round} of 3. Totals so far: you ${gs.tot[0]}, computer ${gs.tot[1]}. Tap Roll two dice.`;
    NK.render('shutbox');
}
function sbRestart() { initShutBox(); }
function _sbView(gs) {
    const mine = gs.who === 0;
    const open = mine ? gs.open : gs.cpuOpen;
    const tiles = open.map((o, i) => {
        const v = i + 1, pk = mine && gs.pick.includes(v);
        // every tile is a real control whose label says its state, even when it cannot be pressed (review 2026-11-04)
        if (!mine) return `<span class="nk-cell sb-t${o ? '' : ' sb-shut'}" role="img" aria-label="computer's tile ${v}, ${o ? 'open' : 'shut'}">${v}</span>`;
        if (!o) return `<button type="button" class="nk-cell sb-t sb-shut" data-k="t${v}" aria-label="tile ${v}, shut" disabled>${v}</button>`;
        return `<button type="button" class="nk-cell sb-t${pk ? ' sb-pick' : ''}" onclick="sbTile(${v})" data-k="t${v}"${v === 1 ? ' data-first' : ''} aria-pressed="${pk}" aria-label="tile ${v}, open${pk ? ', picked' : ''}"${gs.need && !gs.over ? '' : ' disabled'}>${v}</button>`;
    }).join('');
    const sum = gs.pick.reduce((a, b) => a + b, 0);
    const dice = gs.dice.length ? gs.dice.map(_sbDie).join('') + `<span class="sb-sum">= ${gs.dice.reduce((a, b) => a + b, 0)}</span>` : '<span class="sb-sum" style="color:#6b5640">Dice not rolled yet</span>';
    const rows = [0, 1, 2].map((r) => gs.hist[r] || [null, null]);
    const can = mine && !gs.over;
    return `<div class="nk-top"><span>Round <b>${gs.round}</b> of 3</span><span>You: <b>${gs.tot[0]}</b></span><span>Computer: <b>${gs.tot[1]}</b></span></div>
      <div class="sb-lab">${mine ? 'Your box' : "The computer's box"}</div>
      <div class="sb-tiles${mine ? '' : ' sb-cpu'}" style="--n:${gs.n};--nh:${Math.ceil(gs.n / 2) + (gs.n === 9 ? 0 : 0)}">${tiles}</div>
      <div class="sb-dice" aria-live="polite">${dice}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${can && !gs.need ? NK.btn(NK.icon('dices') + 'Roll two dice', 'sbRoll(2)', { cls: 'gk-primary', k: 'roll2' }) + (_sbHighShut(gs) ? NK.btn('Roll one die', 'sbRoll(1)', { k: 'roll1' }) : '') : ''}${can && gs.need ? NK.btn(`Shut them (${sum} of ${gs.need})`, 'sbShut()', { cls: 'gk-primary', k: 'shut', disabled: sum !== gs.need }) : ''}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'sbRestart()', { k: 'restart' })}</div>
      <div class="sb-score" aria-label="score sheet"><span class="sb-h">Round</span><span class="sb-h">1</span><span class="sb-h">2</span><span class="sb-h">3</span><span class="sb-h">Total</span>
        <span class="sb-h">You</span>${rows.map((x) => `<span>${x[0] ?? '–'}</span>`).join('')}<b>${gs.tot[0]}</b>
        <span class="sb-h">Computer</span>${rows.map((x) => `<span>${x[1] ?? '–'}</span>`).join('')}<b>${gs.tot[1]}</b></div>`;
}
