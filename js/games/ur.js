// ═══════════════════════════════════════════════════════════════════════════════
// ROYAL GAME OF UR (2026-11, nostalgia batch 3) — the 4,500-year-old race game, as reconstructed from the board found
// at Ur and a later rule tablet. You and the computer each race 7 pieces along your own lane, down the shared middle
// lane and off the board. Roll four two-sided dice: the number of marked tips (0 to 4) is how far one piece moves.
// Land on an opponent in the middle lane to send it back to the start. Flower squares (rosettes) give another roll,
// and the middle rosette is safe. A piece leaves the board only with an exact roll. First to bring all 7 home wins.
// Easy: the computer moves at random. Normal: it captures and heads for rosettes. Hard: it also keeps pieces out of
// reach. Path index for a piece: 0 = waiting, 1-4 own lane, 5-12 middle lane, 13-14 own lane, 15 = home.
// ═══════════════════════════════════════════════════════════════════════════════
const _UR_ROS = [4, 8, 14];
function initUr() {
    NK.start('ur', {
        setup(gs, diff) { gs.diff = diff; gs.pc = [Array(7).fill(0), Array(7).fill(0)]; gs.turn = 0; gs.roll = null; gs.over = false; gs.last = null; gs.dice = [0, 0, 0, 0]; gs.msg = 'Tap Roll. Then tap a piece to move it that many squares.'; },
        view: _urView,
        keys: { KeyR: () => urRoll() },
        rules: [
            'Each side races <b>7 pieces</b> along its own lane, down the shared <b>middle lane</b>, and off the board. Your lane is the bottom row: pieces enter at its 4th square and run left, cross the whole middle row to the right, then drop back into the last two squares of your row.',
            'Roll four two-sided dice: the number of marked tips, <b>0 to 4</b>, is how far <b>one</b> piece moves. A 0 means no move.',
            'Land on an opponent in the middle lane to <b>send it back</b> to the start. You cannot land on your own piece.',
            'A <b>flower square</b> gives you another roll, and nobody can be taken on the middle flower.',
            'A piece leaves the board only with the <b>exact</b> roll. First to bring all 7 home wins. No money, no clock. Keyboard: R rolls, arrows and Enter pick a piece.'],
        css: `.ur-b{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;background:#3b2412;padding:8px;border-radius:14px;box-shadow:inset 0 0 0 3px #1f130a;max-width:34rem;margin:0 auto}
.ur-s{aspect-ratio:1;border-radius:8px;background:#e8d5b0;position:relative;display:flex;align-items:center;justify-content:center;border:0;padding:0;min-width:0;--nk-r:8px}
.ur-s.ur-gap{background:transparent}
.ur-s.ur-ros{background:radial-gradient(circle,#fde68a 0 18%,#e8d5b0 19% 30%,#c2410c 31% 38%,#e8d5b0 39%)}
.ur-s.ur-mid{background-color:#f3e5c6}
.ur-s.ur-ros.ur-mid{background:radial-gradient(circle,#fde68a 0 18%,#f3e5c6 19% 30%,#c2410c 31% 38%,#f3e5c6 39%)}
.ur-p{width:74%;height:74%;border-radius:50%;border:3px solid rgba(0,0,0,.55);box-shadow:0 2px 0 rgba(0,0,0,.4)}
.ur-p0{background:radial-gradient(circle at 35% 30%,#fff,#d6d3d1 70%)}
.ur-p1{background:radial-gradient(circle at 35% 30%,#57534e,#0c0a09 70%)}
.ur-s.ur-can{box-shadow:0 0 0 4px #22c55e}
.ur-s.ur-to::after{content:"";position:absolute;width:30%;height:30%;border-radius:50%;background:rgba(34,197,94,.85)}
.ur-s.ur-last{box-shadow:inset 0 0 0 3px #facc15}
.ur-bank{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:8px 0;flex-wrap:wrap}
.ur-st{display:flex;align-items:center;gap:4px;flex-wrap:wrap;font-weight:800}
.ur-st .ur-p{width:26px;height:26px;border-width:2px}
#gameContent .nk button.ur-wait{display:flex;align-items:center;gap:6px;min-height:52px}
.ur-dice{display:flex;gap:8px;justify-content:center;align-items:center;margin:6px 0}
.ur-d{width:40px;height:36px;position:relative}
.ur-d svg{width:100%;height:100%}
.ur-roll{font:900 1.6rem Georgia,serif;min-width:2ch;text-align:center}`,
    });
}
// board square (row 0 computer lane, 1 middle, 2 your lane; column 0-7) for side s at path index k
function _urSq(s, k) { if (k <= 4) return [s ? 0 : 2, 4 - k]; if (k <= 12) return [1, k - 5]; return [s ? 0 : 2, 20 - k]; }
const _urShared = (k) => k >= 5 && k <= 12;
function _urMoves(gs, s, roll) {
    if (!roll) return [];
    const out = [], mine = gs.pc[s], opp = gs.pc[1 - s];
    const seen = new Set();
    mine.forEach((k, i) => {
        if (k === 15 || seen.has(k)) return; const t = k + roll; if (t > 15) return;
        if (t < 15 && mine.includes(t)) return;
        if (t === 8 && opp.includes(8)) return;   // the middle rosette is safe
        seen.add(k); out.push({ i, from: k, to: t, cap: _urShared(t) && opp.includes(t) });
    });
    return out;
}
function urRoll() {
    const gs = gameState.ur; if (gs.over || gs.turn !== 0 || gs.roll !== null) return;
    gs.dice = [0, 1, 2, 3].map(() => (Math.random() < 0.5 ? 1 : 0)); gs.roll = gs.dice.reduce((a, b) => a + b, 0); if (typeof sfxFlip === 'function') sfxFlip();
    const ms = _urMoves(gs, 0, gs.roll);
    if (!ms.length) { gs.msg = gs.roll ? `You rolled ${gs.roll}, but no piece can move that far.` : 'You rolled 0: no move this time.'; NK.render('ur'); return NK.after(1300, () => _urPass(gs)); }
    gs.msg = `You rolled ${gs.roll}. Tap a piece with a green ring${ms.some((m) => m.from === 0) ? ', or Enter a new piece' : ''}.`;
    NK.render('ur');
}
function _urPass(gs) { if (gameState.ur !== gs || gs.over) return; gs.roll = null; gs.turn = 1; NK.render('ur'); NK.after(700, _urCpu); }
function urMove(from) {
    const gs = gameState.ur; if (gs.over || gs.turn !== 0 || gs.roll === null) return;
    const m = _urMoves(gs, 0, gs.roll).find((x) => x.from === from);
    if (!m) { gs.msg = `That piece cannot move ${gs.roll}.`; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('ur'); }
    _urDo(gs, 0, m);
}
function _urDo(gs, s, m) {
    gs.pc[s][m.i] = m.to; gs.last = m.to < 15 ? _urSq(s, m.to) : null; let said = '';
    if (m.cap) { const j = gs.pc[1 - s].indexOf(m.to); gs.pc[1 - s][j] = 0; said = s ? ' It sent one of your pieces back to the start!' : ' You sent a computer piece back to the start!'; }
    if (m.to === 15) said += s ? ' A computer piece reached home.' : ' A piece reached home!';
    if (typeof sfxFlip === 'function') sfxFlip();
    if (gs.pc[s].every((k) => k === 15)) { gs.over = true; gs.turn = -1; gs.roll = null; const win = s === 0; const left = gs.pc[1 - s].filter((k) => k === 15).length;
        gs.msg = win ? 'All seven of your pieces are home. You win!' : 'All seven computer pieces are home.'; NK.render('ur'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('ur', win, win ? `All 7 home; the computer had ${left}.` : `The computer brought all 7 home; you had ${left}. A rematch is one tap away.`); }
    const again = _UR_ROS.includes(m.to);
    gs.roll = null;
    if (s === 0) { gs.msg = (m.to === 15 ? 'Home!' : `Moved to ${again ? 'a flower square' : 'square ' + m.to}.`) + said + (again ? ' Flower: roll again.' : ''); if (!again) { gs.turn = 1; NK.render('ur'); return NK.after(900, _urCpu); } return NK.render('ur'); }
    gs.msg = `The computer moved a piece ${m.to === 15 ? 'home' : 'to square ' + m.to}.${said}${again ? ' It landed on a flower and rolls again.' : ' Your turn: roll.'}`;
    if (again) { NK.render('ur'); return NK.after(1100, _urCpu); }
    gs.turn = 0; NK.render('ur');
}
function _urCpu() {
    const gs = gameState.ur; if (gs.over || gs.turn !== 1) return;
    gs.dice = [0, 1, 2, 3].map(() => (Math.random() < 0.5 ? 1 : 0)); const roll = gs.dice.reduce((a, b) => a + b, 0); gs.roll = roll;
    const ms = _urMoves(gs, 1, roll);
    if (!ms.length) { gs.msg = `The computer rolled ${roll} and cannot move. Your turn: roll.`; gs.roll = null; gs.turn = 0; return NK.render('ur'); }
    const danger = (k) => _urShared(k) && k !== 8 && gs.pc[0].some((y) => y > 0 && y < 15 && k - y >= 1 && k - y <= 4 && _urShared(y) || (y > 0 && y <= 4 && k - y >= 1 && k - y <= 4));
    const val = (m) => (m.to === 15 ? 6 : 0) + (m.cap ? 8 : 0) + (_UR_ROS.includes(m.to) ? 7 : 0) + m.to * 0.2 + (gs.diff === 'hard' ? (danger(m.from) ? 3 : 0) - (danger(m.to) ? 4 : 0) : 0);
    const m = gs.diff === 'easy' ? ms[Math.floor(Math.random() * ms.length)] : ms.map((x) => [x, val(x) + Math.random() * 0.5]).sort((a, b) => b[1] - a[1])[0][0];
    NK.render('ur'); NK.after(700, () => { if (gameState.ur === gs && !gs.over) { gs.msg = `The computer rolled ${roll}.`; _urDo(gs, 1, m); } });
}
function urNew() { initUr(); }
const _urDie = (up) => `<svg viewBox="0 0 40 36" class="ur-d" aria-hidden="true"><polygon points="20,2 38,34 2,34" fill="#f5f5f4" stroke="#292524" stroke-width="2.5"/>${up ? '<circle cx="20" cy="12" r="4.5" fill="#292524"/>' : ''}</svg>`;
function _urView(gs) {
    const my = gs.turn === 0 && !gs.over, ms = my && gs.roll !== null ? _urMoves(gs, 0, gs.roll) : [];
    const movable = new Set(ms.map((m) => m.from)), dest = ms.map((m) => m.to).filter((t) => t < 15).map((t) => _urSq(0, t).join());
    let h = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) {
        if (r !== 1 && (c === 4 || c === 5)) { h += '<span class="ur-s ur-gap" aria-hidden="true"></span>'; continue; }
        const ros = (r !== 1 && (c === 0 || c === 6)) || (r === 1 && c === 3);
        let who = -1, k = -1; for (const s of [0, 1]) gs.pc[s].forEach((x) => { if (x > 0 && x < 15 && _urSq(s, x).join() === r + ',' + c) { who = s; k = x; } });
        const can = who === 0 && movable.has(k), to = dest.includes(r + ',' + c), last = gs.last && gs.last.join() === r + ',' + c;
        const cls = `ur-s${ros ? ' ur-ros' : ''}${r === 1 ? ' ur-mid' : ''}${can ? ' ur-can' : ''}${to ? ' ur-to' : ''}${last ? ' ur-last' : ''}`, piece = who >= 0 ? `<span class="ur-p ur-p${who}"></span>` : '';
        const lab = `${r === 0 ? "computer's lane" : r === 1 ? 'middle lane' : 'your lane'}, square ${c + 1}${ros ? ', flower' : ''}: ${who === 0 ? 'your piece' : who === 1 ? 'computer piece' : 'empty'}${can ? ', can move' : ''}${to ? ', a piece can land here' : ''}`;
        h += can ? `<button type="button" class="nk-cell ${cls}" onclick="urMove(${k})" data-k="s${r}_${c}" aria-label="${lab}">${piece}</button>` : `<span class="${cls}" role="img" aria-label="${lab}">${piece}</span>`;
    }
    const wait = gs.pc[0].filter((k) => k === 0).length, home = gs.pc[0].filter((k) => k === 15).length, cw = gs.pc[1].filter((k) => k === 0).length, ch = gs.pc[1].filter((k) => k === 15).length;
    const stack = (n, s) => [...Array(n)].map(() => `<span class="ur-p ur-p${s}"></span>`).join('');
    const enter = movable.has(0) ? NK.btn(`<span class="ur-p ur-p0" style="width:24px;height:24px"></span>Enter a piece`, 'urMove(0)', { k: 'enter', cls: 'gk-primary ur-wait' }) : '';
    return `<div class="nk-top"><span>${gs.over ? 'Game over' : my ? 'Your turn (white)' : "Computer's turn (dark)"}</span><span>Home: you <b>${home}</b>, computer <b>${ch}</b></span></div>
      <div class="ur-bank"><div class="ur-st" aria-label="computer: ${cw} waiting">Computer waiting: ${stack(cw, 1) || '0'}</div><div class="ur-st">Home: ${stack(ch, 1) || '0'}</div></div>
      <div class="ur-b">${h}</div>
      <div class="ur-bank"><div class="ur-st" aria-label="you: ${wait} waiting">You waiting: ${stack(wait, 0) || '0'}</div><div class="ur-st">Home: ${stack(home, 0) || '0'}</div></div>
      <div class="ur-dice" role="img" aria-label="${gs.roll === null ? 'dice not rolled' : 'roll ' + gs.roll}">${gs.dice.map(_urDie).join('')}<span class="ur-roll">${gs.roll ?? ''}</span></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('dices') + 'Roll', 'urRoll()', { k: 'roll', cls: 'gk-primary', disabled: !my || gs.roll !== null })}${enter}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'urNew()', { k: 'restart' })}</div>`;
}
