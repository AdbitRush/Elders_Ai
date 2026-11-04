// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE SCALE (2026-11, nostalgia batch 3) — the counterfeit-coin riddle from puzzle books: one coin is a fake that
// weighs a little different. Find it with a pan balance in a few weighings.
// Easy: 9 coins, the fake is heavier, 3 weighings allowed (2 are enough). Normal: 12 coins, heavier, 3 weighings.
// Hard: 12 coins, the fake may be heavier OR lighter, 3 weighings (the famous version) - name the coin and which.
// Tap a coin to move it: table -> left pan -> right pan -> table. Weigh shows which side goes down. Then press
// "This is the fake" on your choice. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
function initBalance() {
    NK.start('balance', {
        setup(gs, diff) {
            gs.n = diff === 'easy' ? 9 : 12; gs.both = diff === 'hard'; gs.max = 3;
            gs.fake = Math.floor(Math.random() * gs.n); gs.heavy = gs.both ? Math.random() < 0.5 : true;
            gs.pan = Array(gs.n).fill(0); gs.log = []; gs.over = false; gs.choose = -1; gs.tilt = 0;
            gs.msg = `One of the ${gs.n} coins is a fake${gs.both ? ' - heavier or lighter, you do not know which' : ' and is heavier'}. You have ${gs.max} weighings.`;
        },
        view: _blView,
        keys: { KeyW: () => blWeigh() },
        rules: (gs) => [
            `There are ${gs.n} coins. Exactly one is a fake. ${gs.both ? 'It is either a little <b>heavier or lighter</b> than the rest - you must say which.' : 'It is a little <b>heavier</b> than the rest.'}`,
            'Tap a coin to move it: from the table to the <b>left pan</b>, then to the <b>right pan</b>, then back to the table.',
            `Press <b>Weigh</b>: the heavier side goes down, or the pans balance. You have <b>${gs.max} weighings</b>.`,
            'Put the same number of coins on each side, or the count alone will tip the scale.',
            'When you know, tap the coin and press This is the fake. No clock. Keyboard: arrows and Enter, W weighs.'],
        css: `.bl-scale{position:relative;height:170px;max-width:34rem;margin:0 auto}
.bl-post{position:absolute;left:50%;top:30px;bottom:10px;width:12px;margin-left:-6px;background:#6b4220;border-radius:6px}
.bl-beam{position:absolute;left:6%;right:6%;top:30px;height:10px;background:#8a5a2b;border-radius:5px;transform-origin:50% 50%;transition:transform .4s}
.bl-pan{position:absolute;top:0;width:44%;min-height:64px;background:#fde68a;border:3px solid #a16207;border-radius:0 0 50% 50%/0 0 30% 30%;display:flex;flex-wrap:wrap;justify-content:center;align-content:flex-end;gap:2px;padding:6px;box-sizing:border-box;transition:top .4s}
.bl-l{left:0}.bl-r{right:0}
.bl-coins{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0}
.bl-c{width:54px;height:54px;border-radius:50%;border:3px solid #92400e;background:radial-gradient(circle at 35% 30%,#fef3c7,#f59e0b 60%,#b45309);font:900 1.1rem system-ui;color:#2b1b0d;cursor:pointer;padding:0;--nk-r:50%;--nk-bw:3px}
.bl-c.bl-inL{border-color:#1d4ed8;box-shadow:0 0 0 3px #93c5fd}.bl-c.bl-inR{border-color:#7e22ce;box-shadow:0 0 0 3px #d8b4fe}
.bl-c.bl-ch{outline:4px dashed #15803d;outline-offset:2px}
.bl-mini{width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fef3c7,#f59e0b 60%,#b45309);border:2px solid #92400e;font:900 .75rem/26px system-ui;text-align:center;color:#2b1b0d}
.bl-log{background:#fffdf5;border:2px solid #e8cfa8;border-radius:12px;padding:8px 12px;font-size:1rem;margin-top:8px}
.bl-key{text-align:center;font-size:.95rem;color:#4a3420}`,
    });
}
const _blW = (gs, i) => (i === gs.fake ? (gs.heavy ? 1 : -1) : 0);
function blCoin(i) {
    const gs = gameState.balance; if (gs.over) return;
    gs.choose = i; gs.pan[i] = (gs.pan[i] + 1) % 3; gs.tilt = 0;
    gs.msg = `Coin ${i + 1} ${gs.pan[i] === 1 ? 'is on the left pan' : gs.pan[i] === 2 ? 'is on the right pan' : 'is back on the table'}.`;
    NK.render('balance');
}
function blWeigh() {
    const gs = gameState.balance; if (gs.over) return;
    if (gs.log.length >= gs.max) { gs.msg = 'No weighings left. Choose the fake.'; return NK.render('balance'); }
    const L = gs.pan.map((p, i) => (p === 1 ? i : -1)).filter((i) => i >= 0), R = gs.pan.map((p, i) => (p === 2 ? i : -1)).filter((i) => i >= 0);
    if (!L.length || !R.length) { gs.msg = 'Put at least one coin on each pan.'; return NK.render('balance'); }
    const wl = L.length * 10 + L.reduce((a, i) => a + _blW(gs, i), 0), wr = R.length * 10 + R.reduce((a, i) => a + _blW(gs, i), 0);
    gs.tilt = Math.sign(wr - wl);   // +1 = right pan down
    const res = wl === wr ? 'balance' : wl > wr ? 'left side down' : 'right side down';
    gs.log.push(`${L.map((i) => i + 1).join(' ')}  vs  ${R.map((i) => i + 1).join(' ')}: <b>${res}</b>${L.length !== R.length ? ' (uneven numbers of coins)' : ''}`);
    if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `Weighing ${gs.log.length}: ${res}. ${gs.max - gs.log.length ? NK.pl(gs.max - gs.log.length, 'weighing') + ' left.' : 'Now choose the fake.'}`;
    NK.render('balance');
}
function blClear() { const gs = gameState.balance; if (gs.over) return; gs.pan = gs.pan.map(() => 0); gs.tilt = 0; gs.msg = 'All coins back on the table.'; NK.render('balance'); }
function blGuess(heavy) {
    const gs = gameState.balance; if (gs.over) return;
    if (gs.choose < 0) { gs.msg = 'Tap the coin you think is the fake first.'; return NK.render('balance'); }
    const ok = gs.choose === gs.fake && (!gs.both || heavy === gs.heavy);
    gs.over = true; gs.tilt = 0;
    gs.msg = ok ? `Right - coin ${gs.fake + 1} is the fake${gs.both ? `, and it is ${gs.heavy ? 'heavier' : 'lighter'}` : ''}!` : `Not this time: the fake was coin ${gs.fake + 1}${gs.both ? ` (${gs.heavy ? 'heavier' : 'lighter'})` : ''}.`;
    NK.render('balance'); if (ok && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('balance', ok, ok ? `Found the fake with ${NK.pl(gs.log.length, 'weighing')}.` : `The fake was coin ${gs.fake + 1}. Splitting the coins into three equal groups is the classic first step.`);
}
function blNew() { initBalance(); }
function _blView(gs) {
    const can = !gs.over;
    const mini = (side) => gs.pan.map((p, i) => (p === side ? `<span class="bl-mini">${i + 1}</span>` : '')).join('');
    const ang = gs.tilt * 8, dy = gs.tilt * 14;
    const coins = gs.pan.map((p, i) => `<button type="button" class="nk-cell bl-c${p === 1 ? ' bl-inL' : p === 2 ? ' bl-inR' : ''}${gs.choose === i ? ' bl-ch' : ''}" onclick="blCoin(${i})" data-k="c${i}"${i === 0 ? ' data-first' : ''} aria-label="coin ${i + 1}, ${p === 1 ? 'left pan' : p === 2 ? 'right pan' : 'on the table'}"${can ? '' : ' disabled'}>${i + 1}</button>`).join('');
    return `<div class="nk-top"><span>Weighings: <b>${gs.log.length}</b> of ${gs.max}</span><span>${gs.both ? 'Heavier or lighter' : 'The fake is heavier'}</span></div>
      <div class="bl-scale" aria-hidden="true"><div class="bl-post"></div><div class="bl-beam" style="transform:rotate(${ang}deg)"></div>
        <div class="bl-pan bl-l" style="top:${40 - dy}px">${mini(1)}</div><div class="bl-pan bl-r" style="top:${40 + dy}px">${mini(2)}</div></div>
      <div class="bl-key">Blue ring = left pan, purple ring = right pan. Dashed outline = your chosen coin.</div>
      <div class="bl-coins" role="group" aria-label="coins">${coins}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('layers') + 'Weigh', 'blWeigh()', { cls: 'gk-primary', k: 'weigh', disabled: !can || gs.log.length >= gs.max })}${NK.btn('All back on the table', 'blClear()', { k: 'clear', disabled: !can })}</div>
      <div class="gk-btns">${gs.both ? NK.btn(`Coin ${gs.choose + 1} is the fake: heavier`, 'blGuess(true)', { k: 'gh', disabled: !can || gs.choose < 0 }) + NK.btn(`Coin ${gs.choose + 1} is the fake: lighter`, 'blGuess(false)', { k: 'gl', disabled: !can || gs.choose < 0 }) : NK.btn(gs.choose >= 0 ? `Coin ${gs.choose + 1} is the fake` : 'This is the fake', 'blGuess(true)', { k: 'gh', disabled: !can || gs.choose < 0 })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'blNew()', { k: 'restart' })}</div>
      <div class="bl-log" aria-label="weighings so far">${gs.log.length ? gs.log.map((l, i) => `<div>${i + 1}. ${l}</div>`).join('') : 'Your weighings will be listed here.'}</div>`;
}
