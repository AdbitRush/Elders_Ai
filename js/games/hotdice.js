// ═══════════════════════════════════════════════════════════════════════════════
// HOT DICE (2026-11, nostalgia batch 3) — the push-your-luck dice game played with six dice, you against the computer.
// Roll the dice and set aside at least one scoring die. Then either BANK the points of this turn, or roll the dice
// that are left to try for more. A roll with nothing that scores is a bust: the turn's points are lost.
// Scoring: each 1 = 100, each 5 = 50; three of a kind = 100 x the number (three 1s = 1000), and each extra matching
// die doubles that; 1-2-3-4-5-6 = 1500; three pairs = 750. Score with all six dice ("hot dice") and you may roll all
// six again. First to the target wins: easy 3000, normal 4000, hard 5000; the computer plays bolder on hard.
// No money, no clock.
// ═══════════════════════════════════════════════════════════════════════════════
// score a set of dice values; every die must count, or the result is null
function _hdScore(vals) {
    if (!vals.length) return null;
    const cnt = [0, 0, 0, 0, 0, 0, 0]; vals.forEach((v) => cnt[v]++);
    if (vals.length === 6 && cnt.slice(1).every((x) => x === 1)) return 1500;
    if (vals.length === 6 && cnt.filter((x) => x === 2).length === 3) return 750;
    let s = 0;
    for (let f = 1; f <= 6; f++) {
        let k = cnt[f];
        if (k >= 3) { s += (f === 1 ? 1000 : f * 100) * Math.pow(2, k - 3); k = 0; }
        if (k) { if (f === 1) s += 100 * k; else if (f === 5) s += 50 * k; else return null; }
    }
    return s;
}
// best score that some subset of the roll can make (0 = bust)
function _hdBest(vals) { let best = 0, pick = []; for (let m = 1; m < 1 << vals.length; m++) { const sub = vals.filter((_, i) => m & (1 << i)), s = _hdScore(sub); if (s !== null && (s > best || (s === best && sub.length < pick.length))) { best = s; pick = [...Array(vals.length).keys()].filter((i) => m & (1 << i)); } } return { best, pick }; }
function initHotdice() {
    NK.start('hotdice', {
        setup(gs, diff) { gs.diff = diff; gs.target = diff === 'easy' ? 3000 : diff === 'hard' ? 5000 : 4000; gs.score = [0, 0]; gs.turn = 0; gs.over = false; _hdStartTurn(gs); gs.msg = `First to ${gs.target}. Tap Roll to start your turn.`; },
        view: _hdView,
        keys: { KeyR: () => hdRoll(), KeyB: () => hdBank() },
        rules: (gs) => [
            'Roll the six dice, then tap the dice you want to <b>set aside</b>: at least one must score.',
            'Then <b>Bank</b> the points of this turn, or <b>Roll</b> the dice that are left to try for more. A roll with nothing that scores is a <b>bust</b>: the whole turn\'s points are lost.',
            'Scoring: a <b>1 is 100</b>, a <b>5 is 50</b>. Three of a kind is 100 times the number (three 1s are 1000), and each extra matching die doubles it. 1-2-3-4-5-6 is 1500; three pairs are 750.',
            'Score with all six dice and you get <b>hot dice</b>: roll all six again and keep adding.',
            `First to <b>${gs.target}</b> wins. No money, no clock. Keyboard: arrow keys and Enter on the dice, R rolls, B banks.`],
        css: `.hd-t{background:radial-gradient(ellipse at 50% 30%,#2f7d4f,#1f5c38 70%);border-radius:18px;padding:14px;box-shadow:inset 0 0 0 3px #174a2c;color:#fff7e6}
.hd-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;min-height:76px;align-items:center}
#gameContent .nk button.hd-d{width:clamp(50px,13.5vw,68px);height:clamp(50px,13.5vw,68px);border-radius:14px;border:3px solid #78350f;background:#fffdf7;padding:6px;cursor:pointer;--nk-r:14px;--nk-bw:3px;box-shadow:0 4px 0 #a16207}
.hd-d:disabled{cursor:default}
.hd-d.hd-pk{background:#fde68a;transform:translateY(-6px);border-color:#b45309}
.hd-d svg{width:100%;height:100%}
.hd-kept{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:8px;min-height:40px;align-items:center;font-weight:800;color:#fde7c4}
.hd-kept .hd-sm{width:34px;height:34px;background:#e7e5e4;border-radius:8px;padding:3px;opacity:.9}
.hd-sc{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
.hd-sc div{background:#fffbeb;border:2px solid #fde7c4;border-radius:14px;padding:8px 12px;font-weight:800;text-align:center}
.hd-sc b{display:block;font-size:1.6rem}
.hd-sc .hd-on{border-color:#f59e0b;box-shadow:0 0 0 3px #fde68a}
.hd-bar{height:10px;border-radius:5px;background:#e7e5e4;margin-top:4px;overflow:hidden}.hd-bar i{display:block;height:100%;background:#16a34a}
@media (prefers-reduced-motion:reduce){.hd-d.hd-pk{transform:none}}`,
    });
}
function _hdStartTurn(gs) { gs.dice = []; gs.pick = []; gs.kept = []; gs.turnPts = 0; gs.left = 6; gs.rolled = false; gs.bust = false; }
const _hdPips = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[26, 26], [50, 50], [74, 74]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]], 6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]] };
const _hdFace = (v) => `<svg viewBox="0 0 100 100" aria-hidden="true">${_hdPips[v].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="${v === 1 || v === 5 ? '#b91c1c' : '#1c1917'}"/>`).join('')}</svg>`;
function _hdThrow(gs) { gs.dice = [...Array(gs.left)].map(() => 1 + Math.floor(Math.random() * 6)); gs.pick = []; gs.rolled = true; if (typeof sfxFlip === 'function') sfxFlip(); }
function hdRoll() {
    const gs = gameState.hotdice; if (gs.over || gs.turn !== 0) return;
    if (gs.rolled) {   // rolling again: the picked dice must score
        const s = _hdScore(gs.pick.map((i) => gs.dice[i]));
        if (s === null) { gs.msg = gs.pick.length ? 'Every die you set aside must score (1s, 5s, or sets).' : 'Set aside at least one scoring die first.'; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('hotdice'); }
        gs.turnPts += s; gs.kept.push(...gs.pick.map((i) => gs.dice[i])); gs.left -= gs.pick.length; if (!gs.left) { gs.left = 6; gs.kept = []; gs.hot = true; }
    }
    _hdThrow(gs);
    const b = _hdBest(gs.dice);
    if (!b.best) { gs.msg = `Bust! Nothing scores, and ${gs.turnPts} turn points are lost.`; gs.bust = true; if (typeof sfxWrong === 'function') sfxWrong(); NK.render('hotdice'); return NK.after(1600, () => _hdNext(gs)); }
    gs.msg = `${gs.hot ? 'Hot dice! All six rolled again. ' : ''}Tap the dice to set aside. The best you can take from this roll is ${b.best}.`; gs.hot = false;
    NK.render('hotdice');
}
function hdPick(i) {
    const gs = gameState.hotdice; if (gs.over || gs.turn !== 0 || !gs.rolled || gs.bust) return;
    const k = gs.pick.indexOf(i); if (k >= 0) gs.pick.splice(k, 1); else gs.pick.push(i);
    const s = _hdScore(gs.pick.map((j) => gs.dice[j]));
    gs.msg = !gs.pick.length ? '' : s === null ? 'Those dice do not all score together yet.' : `Set aside: ${s} points. This turn: ${gs.turnPts + s}. Roll on or Bank.`;
    NK.render('hotdice');
}
function hdBank() {
    const gs = gameState.hotdice; if (gs.over || gs.turn !== 0 || !gs.rolled || gs.bust) return;
    const s = _hdScore(gs.pick.map((i) => gs.dice[i]));
    if (s === null) { gs.msg = 'Set aside at least one scoring die before you bank.'; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('hotdice'); }
    gs.score[0] += gs.turnPts + s; gs.msg = `You banked ${gs.turnPts + s}.`; if (typeof sfxCorrect === 'function') sfxCorrect();
    if (gs.score[0] >= gs.target) return _hdEnd(gs, 0);
    _hdNext(gs);
}
function _hdNext(gs) {
    if (gameState.hotdice !== gs || gs.over) return;
    gs.turn = 1 - gs.turn; _hdStartTurn(gs);
    if (gs.turn === 1) { gs.msg += ' The computer rolls...'; NK.render('hotdice'); return NK.after(900, _hdCpu); }
    gs.msg += ' Your turn: tap Roll.'; NK.render('hotdice');
}
function _hdCpu() {
    const gs = gameState.hotdice; if (gs.over || gs.turn !== 1) return;
    _hdThrow(gs); const b = _hdBest(gs.dice);
    if (!b.best) { gs.bust = true; gs.msg = `The computer rolled ${gs.dice.join(', ')}: bust! It loses ${gs.turnPts} points.`; NK.render('hotdice'); return NK.after(1500, () => _hdNext(gs)); }
    // keep the best set, but on normal/easy keep only one 1 or 5 when that leaves more dice to roll
    let pick = b.pick;
    const singles = b.pick.filter((i) => gs.dice[i] === 1 || gs.dice[i] === 5);
    if (gs.diff !== 'easy' && singles.length > 1 && singles.length === b.pick.length && gs.left - 1 >= 3) pick = [singles.find((i) => gs.dice[i] === 1) ?? singles[0]];
    gs.pick = pick; const s = _hdScore(pick.map((i) => gs.dice[i]));
    gs.turnPts += s; gs.left -= pick.length; const hot = !gs.left; if (hot) gs.left = 6;
    const need = gs.target - gs.score[1], bold = gs.diff === 'hard' ? 1 : gs.diff === 'easy' ? -1 : 0;
    const stop = gs.turnPts >= need || (!hot && (gs.left <= 1 + (bold > 0 ? 0 : 1) ? gs.turnPts >= 200 : gs.left <= 3 ? gs.turnPts >= 350 + bold * 150 : gs.turnPts >= 600 + bold * 300));
    gs.msg = `The computer rolled ${gs.dice.join(', ')} and set aside ${s}. Turn total ${gs.turnPts}.`;
    NK.render('hotdice');
    if (stop) return NK.after(1200, () => { if (gameState.hotdice !== gs || gs.over) return; gs.score[1] += gs.turnPts; gs.msg = `The computer banks ${gs.turnPts}.`; if (gs.score[1] >= gs.target) return _hdEnd(gs, 1); _hdNext(gs); });
    gs.kept = hot ? [] : gs.kept.concat(pick.map((i) => gs.dice[i]));
    NK.after(1300, _hdCpu);
}
function _hdEnd(gs, who) {
    gs.over = true; gs.turn = -1; const [a, b] = gs.score; gs.msg += who === 0 ? ` You reached ${a}. You win!` : ` The computer reached ${b}.`;
    NK.render('hotdice'); NK.finish('hotdice', who === 0, who === 0 ? `You won ${a} to ${b}.` : `The computer won ${b} to ${a}. A rematch is one tap away.`);
}
function hdNew() { initHotdice(); }
function _hdView(gs) {
    const my = gs.turn === 0 && !gs.over, s = gs.rolled ? _hdScore(gs.pick.map((i) => gs.dice[i])) : null;
    const dice = gs.dice.map((v, i) => { const pk = gs.pick.includes(i); return my && gs.rolled && !gs.bust ? `<button type="button" class="nk-cell hd-d${pk ? ' hd-pk' : ''}" onclick="hdPick(${i})" data-k="d${i}"${i === 0 ? ' data-first' : ''} aria-label="die showing ${v}${pk ? ', set aside' : ''}" aria-pressed="${pk}">${_hdFace(v)}</button>` : `<span class="nk-cell hd-d${pk ? ' hd-pk' : ''}" role="img" aria-label="die showing ${v}" style="display:inline-block;width:clamp(50px,13.5vw,68px);height:clamp(50px,13.5vw,68px);border-radius:14px;border:3px solid #78350f;background:${pk ? '#fde68a' : '#fffdf7'};padding:6px;box-shadow:0 4px 0 #a16207">${_hdFace(v)}</span>`; }).join('') || '<span>Tap Roll</span>';
    const kept = gs.kept.map((v) => `<span class="hd-sm">${_hdFace(v)}</span>`).join('');
    const bar = (v) => `<div class="hd-bar"><i style="width:${Math.min(100, v / gs.target * 100)}%"></i></div>`;
    return `<div class="nk-top"><span>Target: <b>${gs.target}</b></span><span>${gs.over ? 'Game over' : my ? 'Your turn' : "Computer's turn"}</span><span>This turn: <b>${gs.turnPts + (s || 0)}</b></span></div>
      <div class="hd-sc"><div class="${gs.turn === 0 ? 'hd-on' : ''}">You<b>${gs.score[0]}</b>${bar(gs.score[0])}</div><div class="${gs.turn === 1 ? 'hd-on' : ''}">Computer<b>${gs.score[1]}</b>${bar(gs.score[1])}</div></div>
      <div class="hd-t"><div class="hd-row">${dice}</div><div class="hd-kept">${kept ? 'Set aside this turn: ' + kept : `Dice to roll: ${gs.left}`}</div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('dices') + (gs.rolled ? `Roll ${gs.left - gs.pick.length || 6} dice` : 'Roll'), 'hdRoll()', { k: 'roll', cls: 'gk-primary', disabled: !my || gs.bust || (gs.rolled && s === null) })}${NK.btn('Bank' + (s !== null ? ' ' + (gs.turnPts + s) : ''), 'hdBank()', { k: 'bank', disabled: !my || !gs.rolled || gs.bust || s === null })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'hdNew()', { k: 'restart' })}</div>`;
}
