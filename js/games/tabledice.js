// ═══════════════════════════════════════════════════════════════════════════════
// KITCHEN TABLE DICE (2026-11, nostalgia batch) — the five-dice score-card game families played at the kitchen
// table for generations (the old public-domain "Yacht" family of dice games). Solo, no clock.
// 13 turns. Each turn: roll five dice up to three times; tap dice between rolls to keep them; then fill one empty
// line of the score card. Every line is used once; a line that does not fit scores 0 (asked twice, so no slip).
// Top lines (Ones..Sixes) = the sum of that number; 63+ in the top half earns a 35 bonus.
// Three/Four alike = sum of all dice; Full house (3 + 2) = 25; Short run (4 in a row) = 30; Long run (5) = 40;
// Five alike = 50; Any dice = sum of all dice.
// The goal score depends on the level: easy 140, normal 170, hard 200. Reaching it = "Well Done!".
// ═══════════════════════════════════════════════════════════════════════════════
const _TD_LINES = [
    { k: 'n1', name: 'Ones', help: 'Add up the 1s', f: (d) => _tdSumOf(d, 1) },
    { k: 'n2', name: 'Twos', help: 'Add up the 2s', f: (d) => _tdSumOf(d, 2) },
    { k: 'n3', name: 'Threes', help: 'Add up the 3s', f: (d) => _tdSumOf(d, 3) },
    { k: 'n4', name: 'Fours', help: 'Add up the 4s', f: (d) => _tdSumOf(d, 4) },
    { k: 'n5', name: 'Fives', help: 'Add up the 5s', f: (d) => _tdSumOf(d, 5) },
    { k: 'n6', name: 'Sixes', help: 'Add up the 6s', f: (d) => _tdSumOf(d, 6) },
    { k: 'k3', name: 'Three alike', help: '3 the same: all dice count', f: (d) => (_tdMax(d) >= 3 ? _tdSum(d) : 0) },
    { k: 'k4', name: 'Four alike', help: '4 the same: all dice count', f: (d) => (_tdMax(d) >= 4 ? _tdSum(d) : 0) },
    { k: 'fh', name: 'Full house', help: '3 of one + 2 of another: 25', f: (d) => { const c = _tdCounts(d).filter(Boolean).sort(); return c.length === 2 && c[0] === 2 ? 25 : 0; } },
    { k: 'ss', name: 'Short run', help: '4 in a row: 30', f: (d) => (_tdRun(d) >= 4 ? 30 : 0) },
    { k: 'ls', name: 'Long run', help: '5 in a row: 40', f: (d) => (_tdRun(d) >= 5 ? 40 : 0) },
    { k: 'k5', name: 'Five alike', help: 'All 5 the same: 50', f: (d) => (_tdMax(d) === 5 ? 50 : 0) },
    { k: 'ch', name: 'Any dice', help: 'Add up all the dice', f: (d) => _tdSum(d) },
];
const _tdSum = (d) => d.reduce((a, b) => a + b, 0);
const _tdSumOf = (d, n) => d.filter((x) => x === n).length * n;
const _tdCounts = (d) => { const c = [0, 0, 0, 0, 0, 0, 0]; d.forEach((x) => c[x]++); return c; };
const _tdMax = (d) => Math.max(..._tdCounts(d));
const _tdRun = (d) => { const s = new Set(d); let best = 0, cur = 0; for (let i = 1; i <= 6; i++) { cur = s.has(i) ? cur + 1 : 0; best = Math.max(best, cur); } return best; };
function initTableDice(container) {
    if (window._gameCleanup) { window._gameCleanup(); window._gameCleanup = null; }   // New game calls init directly: drop the previous game's listeners and timers
    const gs = gameState.tabledice;
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    gs.goal = diff === 'easy' ? 140 : diff === 'hard' ? 200 : 170;
    gs.card = {}; gs.turn = 1; gs.over = false;
    _tdNewTurn(gs);
    const onKey = (e) => {
        if (gameState.currentId !== 'tabledice' || gs.over || GameKit.keyBlocked(e)) return;
        const isR = e.key === 'r' || e.key === 'R' || e.code === 'KeyR';   // e.code: on a Hebrew keyboard this key types a different letter
        if (isR) { if (!e.repeat) tdRoll(); e.preventDefault(); }
        else if (/^[1-5]$/.test(e.key)) { if (!e.repeat) tdHold(+e.key - 1); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    window._gameCleanup = () => document.removeEventListener('keydown', onKey);
    gs.msg = `Turn 1 of 13. Tap Roll to throw the five dice. Goal: ${gs.goal} points.`;
    _tdRender();
}
function _tdNewTurn(gs) { gs.dice = [0, 0, 0, 0, 0]; gs.hold = [false, false, false, false, false]; gs.rolls = 0; gs.confirm = null; }
const _tdUpper = (gs) => ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'].reduce((a, k) => a + (gs.card[k] || 0), 0);
const _tdBonus = (gs) => (_tdUpper(gs) >= 63 ? 35 : 0);
const _tdTotal = (gs) => Object.values(gs.card).reduce((a, b) => a + b, 0) + _tdBonus(gs);
function tdRoll() {
    const gs = gameState.tabledice; if (gs.over || gs.rolls >= 3) return;
    if (gs.rolls > 0 && gs.hold.every(Boolean)) { gs.msg = 'All five dice are kept. Tap a die to let it roll, or pick a line on the score card.'; return _tdRender(); }
    gs.dice = gs.dice.map((v, i) => (gs.hold[i] && gs.rolls ? v : 1 + Math.floor(Math.random() * 6)));
    gs.rolls++; gs.confirm = null; gs.rolled = Date.now();
    if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = gs.rolls < 3 ? `Roll ${gs.rolls} of 3. Tap any dice you want to keep, then roll again - or pick a line now.` : 'That was your last roll. Pick a line on the score card.';
    _tdRender();
}
function tdHold(i) {
    const gs = gameState.tabledice; if (gs.over) return;
    if (!gs.rolls) { gs.msg = 'Roll first, then tap the dice you want to keep.'; return _tdRender(); }
    if (gs.rolls >= 3) { gs.msg = 'No rolls left this turn. Pick a line on the score card.'; return _tdRender(); }
    gs.hold[i] = !gs.hold[i]; gs.confirm = null;
    gs.msg = gs.hold[i] ? `Keeping that ${gs.dice[i]}. It will not be rolled.` : `That ${gs.dice[i]} will be rolled again.`;
    _tdRender();
}
function tdScore(k) {
    const gs = gameState.tabledice; if (gs.over) return;
    if (!gs.rolls) { gs.msg = 'Roll the dice first.'; return _tdRender(); }
    if (gs.card[k] !== undefined) { gs.msg = 'That line is already filled in. Each line is used once.'; return _tdRender(); }
    const L = _TD_LINES.find((x) => x.k === k), v = L.f(gs.dice);
    if (v === 0 && gs.confirm !== k) { gs.confirm = k; gs.msg = `${L.name} would score 0 with these dice. Tap it again to use it for 0, or pick another line.`; return _tdRender(); }
    gs.card[k] = v;
    if (typeof sfxCorrect === 'function' && v > 0) sfxCorrect();
    if (gs.turn >= 13) {
        gs.over = true; _tdNewTurn(gs);
        const t = _tdTotal(gs), win = t >= gs.goal;
        try { const best = +localStorage.getItem('gg_td_best') || 0; if (t > best) localStorage.setItem('gg_td_best', t); } catch (e) {}
        gs.msg = `Score card full: ${t} points.`;
        _tdRender();
        return GameKit.finish('tabledice', win, win ? `${t} points - the goal was ${gs.goal}. Well played!` : `${t} points this time; the goal was ${gs.goal}. Every game is a fresh card.`);
    }
    gs.turn++; _tdNewTurn(gs);
    gs.msg = `${L.name}: ${v} point${v === 1 ? '' : 's'} written down. Turn ${gs.turn} of 13 - tap Roll.`;
    _tdRender();
}
function tdRestart() { initTableDice(document.getElementById('gameContent')); }
const _TD_PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
function _tdDie(v, i, held, can, fresh) {
    const pips = v ? Array.from({ length: 9 }, (_, k) => `<i${_TD_PIPS[v].includes(k + 1) ? ' class="on"' : ''}></i>`).join('') : '<em>?</em>';
    return `<button type="button" class="td-die${held ? ' td-held' : ''}${fresh && !held ? ' td-fresh' : ''}" onclick="tdHold(${i})" aria-pressed="${held}" aria-label="${v ? 'die showing ' + v : 'not rolled yet'}${held ? ', kept' : ''}"${can ? '' : ' aria-disabled="true"'}><span class="td-face">${pips}</span><span class="td-keep">${held ? 'KEPT' : v && can ? 'Keep' : '&nbsp;'}</span></button>`;
}
function _tdRender() {
    const gs = gameState.tabledice, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'tabledice') return;
    const canHold = gs.rolls > 0 && gs.rolls < 3 && !gs.over, fresh = gs.rolled && Date.now() - gs.rolled < 400;
    const dice = gs.dice.map((v, i) => _tdDie(v, i, gs.hold[i], canHold, fresh)).join('');
    const line = (L) => {
        const done = gs.card[L.k] !== undefined, pot = gs.rolls && !done ? L.f(gs.dice) : null;
        const cls = 'td-line' + (done ? ' td-done' : pot !== null ? (pot ? ' td-can' : ' td-zero') : '') + (gs.confirm === L.k ? ' td-confirm' : '');
        const val = done ? `<b>${gs.card[L.k]}</b>` : pot !== null ? `<b class="td-pot">${pot}</b>` : '<b class="td-empty">–</b>';
        return `<button type="button" class="${cls}" onclick="tdScore('${L.k}')" aria-label="${L.name}: ${done ? 'scored ' + gs.card[L.k] : pot !== null ? 'would score ' + pot : 'empty'}"${done || gs.over ? ' disabled' : ''}><span class="td-n">${L.name}<small>${L.help}</small></span>${val}</button>`;
    };
    const up = _tdUpper(gs);
    const _fk = GameKit.focusKey(el);
    el.innerHTML = `<div class="td" dir="ltr">
      <div class="td-top"><span>Turn <b>${Math.min(gs.turn, 13)}</b> of 13</span><span>Total <b>${_tdTotal(gs)}</b></span><span>Goal <b>${gs.goal}</b></span></div>
      <div class="td-felt">
        <div class="td-dice">${dice}</div>
        <div class="gk-btns">${GameKit.btn(GameKit.icon('dices') + (gs.rolls ? `Roll again (${3 - gs.rolls} left)` : 'Roll'), 'tdRoll()', { cls: 'gk-primary gk-big', disabled: gs.over || gs.rolls >= 3 })}</div>
      </div>
      <div class="td-msg" role="status" aria-live="polite">${gs.msg}</div>
      <div class="td-card">
        <div class="td-col"><h3>Top half</h3>${_TD_LINES.slice(0, 6).map(line).join('')}
          <div class="td-sub"><span>Top half so far: <b>${up}</b> / 63</span><span>Bonus: <b>${_tdBonus(gs)}</b></span></div></div>
        <div class="td-col"><h3>Bottom half</h3>${_TD_LINES.slice(6).map(line).join('')}</div>
      </div>
      <div class="gk-btns">${GameKit.btn(GameKit.icon('rotate-ccw') + 'New score card', 'tdRestart()')}</div>
      <details class="td-rules"><summary>How to play</summary><ul>
        <li>The game has <b>13 turns</b>, one for each line of the score card.</li>
        <li>Each turn, tap <b>Roll</b>. Tap the dice you like to <b>keep</b> them, then roll the rest. You get up to 3 rolls.</li>
        <li>Then tap one empty line of the card. The number next to each line shows what it would score right now.</li>
        <li>If the dice do not fit a line, it scores 0. You will be asked twice before a 0 is written down.</li>
        <li>Top half: 63 or more in total earns a <b>35-point bonus</b> (that is three of each number).</li>
        <li>Runs are numbers in a row, such as 2-3-4-5. Reach the goal score to win. No clock.</li>
        <li>Keyboard: R rolls, 1 to 5 keep or free a die, arrow keys and Enter pick a line.</li></ul></details>
    </div>
    <style>
      .td{width:100%;box-sizing:border-box;max-width:44rem;margin:0 auto;color:#2b1b0d}
      .td-top{display:flex;justify-content:space-between;font-size:1.15rem;margin:0 2px 10px;gap:8px;flex-wrap:wrap}
      .td-felt{background:radial-gradient(ellipse at 50% 30%,#2f7d4f,#1f5c38 70%);border-radius:18px;padding:14px 10px 4px;box-shadow:inset 0 0 0 3px #174a2c}
      .td-dice{display:flex;gap:clamp(6px,2vw,14px);justify-content:center}
      .td-die{display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:0;padding:0;cursor:pointer;color:#fff7e6;font:inherit;flex:0 1 auto;min-width:0}
      .td-face{width:clamp(52px,15vw,80px);aspect-ratio:1;background:#fffdf7;border-radius:14px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);padding:12%;box-sizing:border-box;box-shadow:0 4px 0 #cbb994,0 6px 10px rgba(0,0,0,.35);border:3px solid transparent}
      .td-face i{border-radius:50%;margin:14%}.td-face i.on{background:#1d1b18}
      .td-face em{grid-column:1/-1;grid-row:1/-1;align-self:center;justify-self:center;font:900 1.8rem Georgia,serif;color:#a08360;font-style:normal}
      .td-held .td-face{border-color:#fbbf24;box-shadow:0 0 0 3px #fbbf24,0 4px 0 #cbb994;transform:translateY(-3px)}
      .td-keep{font-size:.8rem;font-weight:800;min-height:1.2em;white-space:nowrap}
      .td-held .td-keep{color:#fde68a}
      .td-fresh .td-face{animation:tdShake .35s}
      @keyframes tdShake{0%{transform:rotate(-12deg) scale(.9)}60%{transform:rotate(8deg)}100%{transform:none}}
      .td-msg{text-align:center;font-weight:800;font-size:1.15rem;margin:12px 4px;min-height:3em}
      .td-card{display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#fffdf5;border:3px solid #e8cfa8;border-radius:16px;padding:12px}
      .td-col h3{font-size:1.1rem;font-weight:900;margin:0 0 6px;color:#7c2d12}
      .td-line{display:flex;width:100%;align-items:center;justify-content:space-between;gap:8px;min-height:54px;padding:6px 10px;margin:0 0 6px;border-radius:10px;border:2px solid #e8cfa8;background:#fff;color:#2b1b0d;font:inherit;text-align:left;cursor:pointer}
      .td-n{display:flex;flex-direction:column;font-weight:800;font-size:1.05rem;line-height:1.2}
      .td-n small{font-weight:600;font-size:.85rem;color:#4a3420}
      .td-line b{font-size:1.3rem;min-width:2.2em;text-align:right}
      .td-can{border-color:#15803d;background:#f0fdf4}.td-can .td-pot{color:#166534}
      .td-zero .td-pot{color:#6b5640}
      .td-confirm{border-color:#b91c1c;background:#fef2f2}
      .td-done{background:#f3ead8;cursor:default;border-style:dashed}.td-done b{color:#1d1b18}
      .td-empty{color:#a08360}
      .td-sub{display:flex;flex-direction:column;gap:2px;font-size:1rem;padding:4px 6px;color:#4a3420}
      .td .gk-btn{border-color:#c9a46a}
      .td-rules{background:#fff3d6;border:2px solid #e8cfa8;border-radius:14px;padding:10px 14px;margin-top:6px;font-size:1.05rem}
      .td-rules summary{font-weight:800;cursor:pointer;min-height:44px;display:flex;align-items:center}
      .td-rules li{margin:6px 0 6px 1.1em;list-style:disc}
      @media (max-width:560px){.td-card{gap:8px;padding:8px}.td-line{padding:6px 8px;min-height:52px}.td-n{font-size:.98rem}.td-n small{display:none}.td-line b{font-size:1.2rem;min-width:1.6em}}
      @media (prefers-reduced-motion:reduce){.td-fresh .td-face{animation:none}.td-held .td-face{transform:none}}
      #gameContent .td button.td-die,#gameContent .td button.td-die:hover{box-shadow:none;border-width:0!important;border-radius:0!important;transform:none;overflow:visible}
      #gameContent .td button.td-die::after{display:none}
      #gameContent .td button.td-line{border-radius:10px!important}#gameContent .td button.td-line:hover{transform:none}
    </style>`;
    GameKit.restoreFocus(el, _fk);
}
