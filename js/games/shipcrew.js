// ═══════════════════════════════════════════════════════════════════════════════
// SHIP, CAPTAIN AND CREW (2026-11, nostalgia batch 3) — the tavern dice game. Five dice, up to three rolls a turn.
// You need a SHIP (6), then a CAPTAIN (5), then a CREW (4), in that order: each is set aside as soon as it can be
// (a 5 does not count until you have the 6, and so on). Once all three are aboard, the other two dice are the CARGO,
// and their total is your score. With rolls left you may roll the cargo again to try for more (or keep it).
// No ship, captain and crew after three rolls: no score. Five rounds against two computer sailors; the highest total
// wins. Easy: the sailors always stop at the first cargo. Hard: they push for 9 or more. No money, no clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _SC_NM = ['You', 'Ada', 'Gus'];
function initShipcrew() {
    NK.start('shipcrew', {
        setup(gs, diff) { gs.diff = diff; gs.tot = [0, 0, 0]; gs.round = 1; gs.p = 0; gs.over = false; gs.hist = []; _scTurn(gs); gs.msg = 'Round 1. Tap Roll: you need a 6 (ship), then a 5 (captain), then a 4 (crew).'; },
        view: _scView,
        keys: { KeyR: () => scRoll(), KeyK: () => scKeep() },
        rules: [
            'Roll five dice, up to <b>three times</b> a turn.',
            'You need a <b>ship (6)</b>, then a <b>captain (5)</b>, then a <b>crew (4)</b>, in that order. Each is set aside as soon as you roll it, once the one before it is aboard. (Two can come in one roll: a 6 and a 5 together both count.)',
            'With ship, captain and crew aboard, the other two dice are your <b>cargo</b>: their total is your score for the round.',
            'If you still have rolls left you may <b>roll the cargo again</b> for a higher total, or <b>Keep</b> it. Without ship, captain and crew after three rolls, you score nothing.',
            'Five rounds against two computer sailors. Highest total wins. No money, no clock. Keyboard: R rolls, K keeps.'],
        css: `.sc-t{background:radial-gradient(ellipse at 50% 30%,#1e3a8a,#0f1f4b 75%);border-radius:18px;padding:14px;box-shadow:inset 0 0 0 3px #0a1533;color:#e0f2fe}
.sc-crew{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.sc-slot{min-width:0;overflow-wrap:anywhere;border:2px dashed rgba(224,242,254,.45);border-radius:12px;padding:6px 3px;text-align:center;font-weight:800;font-size:clamp(.8rem,3.6vw,1rem);min-height:96px;display:flex;flex-direction:column;align-items:center;gap:4px}
.sc-slot.sc-in{border-style:solid;border-color:#fde68a;background:rgba(253,230,138,.12)}
.sc-slot svg.sc-ic{width:28px;height:28px}
.sc-die{width:clamp(46px,12.5vw,60px);height:clamp(46px,12.5vw,60px);background:#fffdf7;border-radius:12px;padding:5px;border:3px solid #0c4a6e;box-shadow:0 3px 0 #082f49;display:inline-block}
.sc-die svg{width:100%;height:100%;display:block}
.sc-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;min-height:62px;align-items:center}
.sc-cargo{text-align:center;font:900 1.3rem Georgia,serif;color:#fde68a;margin-top:8px;min-height:1.6em}
.sc-rolls{display:flex;gap:6px;justify-content:center;margin:8px 0 0}.sc-rolls i{width:16px;height:16px;border-radius:50%;background:#fde68a}.sc-rolls i.sc-used{background:transparent;border:2px solid #fde68a}
.sc-tab{display:grid;grid-template-columns:auto repeat(5,1fr) auto;gap:2px 6px;max-width:28rem;margin:10px auto 0;font-size:1rem;text-align:center}
.sc-tab .h{font-weight:800;color:#78350f}.sc-tab b{font-size:1.05rem}`,
    });
}
const _scFace = (v) => `<svg viewBox="0 0 100 100" aria-hidden="true">${({ 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[26, 26], [50, 50], [74, 74]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]], 6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]] })[v].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#0c4a6e"/>`).join('')}</svg>`;
function _scTurn(gs) { gs.have = 0; gs.dice = []; gs.rolls = 0; gs.done = false; gs.score = null; }   // have: 0 none, 1 ship, 2 + captain, 3 + crew
function _scThrow(gs) {
    const n = 5 - gs.have; gs.dice = [...Array(n)].map(() => 1 + Math.floor(Math.random() * 6)); gs.rolls++;
    for (const need of [6, 5, 4]) { if (gs.have === 6 - need) { const i = gs.dice.indexOf(need); if (i >= 0) { gs.dice.splice(i, 1); gs.have++; } } }
    if (typeof sfxFlip === 'function') sfxFlip();
}
const _scCargo = (gs) => (gs.have === 3 ? gs.dice.reduce((a, b) => a + b, 0) : null);
function scRoll() {
    const gs = gameState.shipcrew; if (gs.over || gs.p !== 0 || gs.done || gs.rolls >= 3) return;
    _scThrow(gs); const c = _scCargo(gs);
    if (c !== null && gs.rolls < 3) gs.msg = `Ship, captain and crew are aboard! Cargo: ${c}. Keep it, or roll the cargo again (${NK.pl(3 - gs.rolls, 'roll')} left).`;
    else if (c !== null) return _scFinish(gs, c);
    else if (gs.rolls >= 3) return _scFinish(gs, 0);
    else gs.msg = `${['No ship yet.', 'Ship aboard. Now a captain (5).', 'Ship and captain aboard. Now a crew (4).'][gs.have]} ${NK.pl(3 - gs.rolls, 'roll')} left.`;
    NK.render('shipcrew');
}
function scKeep() { const gs = gameState.shipcrew; if (gs.over || gs.p !== 0 || gs.done) return; const c = _scCargo(gs); if (c === null) return; _scFinish(gs, c); }
function _scFinish(gs, score) {
    gs.done = true; gs.score = score; gs.hist.push([gs.round, gs.p, score]); gs.tot[gs.p] += score;
    gs.msg = `${_SC_NM[gs.p]} ${gs.p === 0 ? 'score' : 'scores'} ${score}${score ? ' in cargo' : ': no full crew'}.`;
    NK.render('shipcrew');
    NK.after(1400, () => _scNext(gs));
}
function _scNext(gs) {
    if (gameState.shipcrew !== gs || gs.over) return;
    gs.p = (gs.p + 1) % 3;
    if (gs.p === 0) {
        if (gs.round >= 5) return _scEnd(gs);
        gs.round++;
    }
    _scTurn(gs);
    if (gs.p === 0) { gs.msg = `Round ${gs.round}. Your turn: tap Roll.`; return NK.render('shipcrew'); }
    gs.msg = `${_SC_NM[gs.p]} rolls...`; NK.render('shipcrew'); NK.after(900, _scCpu);
}
function _scCpu() {
    const gs = gameState.shipcrew; if (gs.over || gs.p === 0 || gs.done) return;
    _scThrow(gs); const c = _scCargo(gs), aim = gs.diff === 'easy' ? 0 : gs.diff === 'hard' ? 9 : 8;
    if (c !== null && (gs.rolls >= 3 || c >= aim)) return _scFinish(gs, c);
    if (c === null && gs.rolls >= 3) return _scFinish(gs, 0);
    gs.msg = `${_SC_NM[gs.p]} rolled: ${c !== null ? `cargo ${c}, rolling again` : ['no ship yet', 'ship aboard', 'ship and captain aboard'][gs.have]}.`;
    NK.render('shipcrew'); NK.after(1100, _scCpu);
}
function _scEnd(gs) {
    gs.over = true; const best = Math.max(...gs.tot), win = gs.tot[0] === best && gs.tot.filter((x) => x === best).length === 1;
    gs.msg = `Five rounds sailed. You ${gs.tot[0]}, Ada ${gs.tot[1]}, Gus ${gs.tot[2]}.`;
    NK.render('shipcrew'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('shipcrew', win, win ? `Best haul at sea: ${gs.tot[0]} to ${gs.tot[1]} and ${gs.tot[2]}.` : gs.tot[0] === best ? `A tie for the best haul at ${best}.` : `${_SC_NM[gs.tot.indexOf(best)]} had the best haul (${best}); you had ${gs.tot[0]}.`);
}
function scNew() { initShipcrew(); }
function _scView(gs) {
    const my = gs.p === 0 && !gs.over && !gs.done, c = _scCargo(gs);
    const slot = (k, lab, v, ic) => `<div class="sc-slot${gs.have > k ? ' sc-in' : ''}">${Icon.svg(ic, { size: '28px', sw: 2.2 }).replace('<svg', '<svg class="sc-ic"')}${lab}${gs.have > k ? `<span class="sc-die" style="width:40px;height:40px">${_scFace(v)}</span>` : '<span>needs ' + v + '</span>'}</div>`;
    const dice = gs.dice.map((v) => `<span class="sc-die">${_scFace(v)}</span>`).join('') || `<span>${gs.rolls ? '' : 'Five dice in the cup'}</span>`;
    const rolls = [0, 1, 2].map((k) => `<i class="${k < gs.rolls ? 'sc-used' : ''}"></i>`).join('');
    const cell = (r, p) => { const h = gs.hist.find((x) => x[0] === r && x[1] === p); return `<span>${h ? h[2] : r < gs.round || (r === gs.round && p < gs.p) ? '0' : '·'}</span>`; };
    const tab = `<div class="sc-tab"><span class="h"></span>${[1, 2, 3, 4, 5].map((r) => `<span class="h">${r}</span>`).join('')}<span class="h">Total</span>${[0, 1, 2].map((p) => `<span class="h">${_SC_NM[p]}</span>${[1, 2, 3, 4, 5].map((r) => cell(r, p)).join('')}<b>${gs.tot[p]}</b>`).join('')}</div>`;
    return `<div class="nk-top"><span>Round <b>${gs.round}</b> of 5</span><span>${gs.over ? 'Voyage over' : `${_SC_NM[gs.p]}${gs.p === 0 ? 'r' : "'s"} turn`}</span></div>
      <div class="sc-t"><div class="sc-crew">${slot(0, 'Ship', 6, 'sailboat')}${slot(1, 'Captain', 5, 'user-round')}${slot(2, 'Crew', 4, 'users')}</div>
        <div class="gk-label" style="color:#e0f2fe">${gs.have === 3 ? 'Cargo' : 'Rolled dice'}</div><div class="sc-row" role="img" aria-label="${gs.dice.length ? 'dice: ' + gs.dice.join(', ') : 'no dice rolled yet'}">${dice}</div>
        <div class="sc-cargo">${c !== null ? `Cargo: ${c}` : ''}</div><div class="sc-rolls" role="img" aria-label="${3 - gs.rolls} rolls left">${rolls}</div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('dices') + (c !== null ? 'Roll the cargo' : 'Roll'), 'scRoll()', { k: 'roll', cls: 'gk-primary', disabled: !my || gs.rolls >= 3 })}${NK.btn('Keep cargo', 'scKeep()', { k: 'keep', disabled: !my || c === null })}${NK.btn(NK.icon('rotate-ccw') + 'New voyage', 'scNew()', { k: 'restart' })}</div>
      ${tab}`;
}
