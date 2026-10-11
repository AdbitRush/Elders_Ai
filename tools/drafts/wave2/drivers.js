  // ── wave 2 (2026-10): words & numbers ──
  async crossword(p, R) {
    const P = await p.evaluate(() => gameState.crossword.P.placed.map((w) => ({ w: w.w, r: w.r, c: w.c })));
    R.steps.push(`${P.length} words: ` + P.map((x) => x.w).join(','));
    // one wrong letter, Check marks it
    await p.click(`.cw-grid [onclick="cwCell(${P[0].r},${P[0].c})"]`); await p.keyboard.press('Q'.toLowerCase() === P[0].w[0].toLowerCase() ? 'z' : 'q');
    await p.locator('#gameContent .gk-btn', { hasText: 'Check' }).click(); await sleep(150);
    const bad = await p.evaluate(() => Object.keys(gameState.crossword.bad).length); R.steps.push('wrong letter + Check -> ' + bad + ' square marked red');
    if (bad !== 1) R.defects.push('Check did not mark the wrong letter');
    // fill every word: tap its first square, then type it (real keyboard) - tapping twice switches direction when needed
    for (const x of P) {
      if (await modalUp(p)) break;
      await p.click(`.cw-grid [onclick="cwCell(${x.r},${x.c})"]`);
      let ok = await p.evaluate((w) => gameState.crossword.word.w === w, x.w);
      if (!ok) { await p.click(`.cw-grid [onclick="cwCell(${x.r},${x.c})"]`); ok = await p.evaluate((w) => gameState.crossword.word.w === w, x.w); }
      if (!ok) { R.defects.push('could not select ' + x.w + ' by tapping its first square'); await p.evaluate((w) => cwPick(gameState.crossword.P.placed.findIndex((q) => q.w === w)), x.w); await p.evaluate((w) => { gameState.crossword.pos = 0; _cwRender(); }, x.w); }
      // on-screen keyboard for the first word, the real keyboard for the rest
      if (x === P[0]) { for (const ch of x.w) await p.click(`.cw-kb [onclick="cwKey('${ch}')"]`); } else await p.keyboard.type(x.w.toLowerCase());
    }
    if (!(await waitModal(p))) return R.defects.push('the solved grid did not end the game');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'crossword', R);
  },
  async cryptoquote(p, R) {
    const st = await p.evaluate(() => ({ dec: gameState.cryptoquote.dec, given: gameState.cryptoquote.given, text: gameState.cryptoquote.text, enc: gameState.cryptoquote.enc }));
    const codes = [...new Set(st.text.replace(/[^A-Z]/g, '').split('').map((ch) => st.enc[ch]))].filter((c) => !st.given.includes(c));
    R.steps.push(`quote of ${st.text.length} chars, ${st.given.length} letters given, ${codes.length} to solve`);
    // wrong guess then Check
    await p.click(`.cq-q [onclick="cqSel('${codes[0]}')"] >> nth=0`);
    const wrong = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find((k) => k !== st.dec[codes[0]] && !st.given.some((g) => st.dec[g] === k));
    await p.click(`.cw-kb [onclick="cqKey('${wrong}')"]`); await p.locator('#gameContent .gk-btn', { hasText: 'Check' }).click(); await sleep(150);
    R.steps.push('wrong letter + Check -> "' + (await p.locator('#gameContent .cw-msg').innerText()) + '"');
    for (const c of codes) { if (await modalUp(p)) break; await p.click(`.cq-q [onclick="cqSel('${c}')"] >> nth=0`); await p.keyboard.press(st.dec[c].toLowerCase()); }
    if (!(await waitModal(p))) return R.defects.push('the solved quote did not end the game');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'cryptoquote', R);
  },
  async wordladder(p, R) {
    const st = await p.evaluate(() => ({ a: gameState.wordladder.a, b: gameState.wordladder.b, path: _wlPath(gameState.wordladder.a, gameState.wordladder.b) }));
    R.steps.push(`${st.a.toUpperCase()} -> ${st.b.toUpperCase()}, shortest ${st.path.length - 1} steps`);
    await p.keyboard.type('zzzz'); await p.keyboard.press('Enter'); await sleep(100);
    R.steps.push('invalid word -> "' + (await p.locator('#gameContent .cw-msg').innerText()) + '"');
    await p.keyboard.press('Backspace'); await p.keyboard.press('Backspace'); await p.keyboard.press('Backspace'); await p.keyboard.press('Backspace');
    for (const w of st.path.slice(1)) { for (const ch of w.toUpperCase()) await p.click(`.cw-kb [onclick="wlKey('${ch}')"]`); await p.click(`.cw-kb [onclick="wlKey('↵')"]`); await sleep(80); }
    if (!(await waitModal(p))) return R.defects.push('reaching the goal word did not end the game');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'wordladder', R);
  },
  async nonogram(p, R) {
    const st = await p.evaluate(() => ({ n: gameState.nonogram.n, sol: gameState.nonogram.sol, name: gameState.nonogram.name }));
    R.steps.push(`${st.n}x${st.n} picture (${st.name})`);
    await p.click('#gameContent .ms-m:nth-child(2)'); const empty = []; st.sol.forEach((r, i) => r.forEach((v, j) => { if (!v) empty.push([i, j]); }));
    await p.click(`.ng-grid [onclick="ngTap(${empty[0][0]},${empty[0][1]})"]`);
    R.steps.push('X mode mark -> ' + (await p.evaluate(([r, c]) => gameState.nonogram.g[r][c], empty[0])) + ' (2 = X)');
    await p.click('#gameContent .ms-m:nth-child(1)');
    for (let i = 0; i < st.n; i++) for (let j = 0; j < st.n; j++) if (st.sol[i][j]) await p.click(`.ng-grid [onclick="ngTap(${i},${j})"]`);
    if (!(await waitModal(p))) return R.defects.push('the solved picture did not end the game');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'nonogram', R);
  },
  async minesweeper(p, R) {
    const n = await p.evaluate(() => gameState.minesweeper.n), mid = Math.floor(n / 2);
    await p.click(`.ms-grid [onclick="msTap(${mid},${mid})"]`);
    const st = await p.evaluate(() => ({ mine: gameState.minesweeper.mine, open: gameState.minesweeper.open }));
    R.steps.push(`first tap opened ${st.open.flat().filter(Boolean).length} squares (safe: ${!st.mine[mid][mid]})`);
    if (st.mine[mid][mid]) R.defects.push('first tap hit a mine');
    // flag a mine
    const mi = st.mine.flatMap((r, i) => r.map((v, j) => (v ? [i, j] : null))).filter(Boolean)[0];
    await p.click('#gameContent .ms-m:nth-child(2)'); await p.click(`.ms-grid [onclick="msTap(${mi[0]},${mi[1]})"]`); await p.click('#gameContent .ms-m:nth-child(1)');
    R.steps.push('flagged a square: ' + (await p.evaluate(([r, c]) => gameState.minesweeper.flag[r][c], mi)));
    for (let k = 0; k < 200 && !(await modalUp(p)); k++) {
      const c = await p.evaluate(() => { const g = gameState.minesweeper; for (let r = 0; r < g.n; r++) for (let c = 0; c < g.n; c++) if (!g.open[r][c] && !g.mine[r][c]) return [r, c]; return null; });
      if (!c) break; await p.click(`.ms-grid [onclick="msTap(${c[0]},${c[1]})"]`);
    }
    if (!(await waitModal(p))) return R.defects.push('a cleared field did not end the game');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'minesweeper', R);
  },
  async g2048(p, R) {
    await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowUp'); await sleep(100);
    R.steps.push('keyboard moves -> score ' + (await p.evaluate(() => gameState.g2048.score)) + ', undo history ' + (await p.evaluate(() => gameState.g2048.hist.length)));
    await p.locator('#gameContent .gk-btn', { hasText: 'Undo' }).click().catch(() => {});
    // set up a board one join from the goal, then join it with the big arrow button
    const goal = await p.evaluate(() => { const g = gameState.g2048; g.b = [[g.goal / 2, g.goal / 2, 0, 0], [2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 4]]; _g2Render(); return g.goal; });
    await p.click('.g2-pad [onclick="g2Move(\'l\')"]');
    if (!(await waitModal(p))) return R.defects.push(`making the ${goal} tile did not end the game`);
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'g2048', R);
  },
  async spotdiff(p, R) {
    for (let k = 0; k < 40 && !(await p.evaluate(() => gameState.spotdiff.ready)); k++) await sleep(250);
    const st = await p.evaluate(() => ({ n: gameState.spotdiff.spots.length, photo: gameState.spotdiff.photo[1] }));
    R.steps.push(`${st.n} differences on "${st.photo}"`); if (st.n < 5) R.defects.push('fewer than 5 differences were made');
    const box = await p.locator('.sd-p').nth(1).boundingBox();
    await p.mouse.click(box.x + 3, box.y + 3); R.steps.push('miss -> "' + (await p.locator('#gameContent .cw-msg').innerText()) + '"');
    const spots = await p.evaluate(() => gameState.spotdiff.spots);
    for (let i = 0; i < spots.length; i++) {
      const b = await p.locator('.sd-p').nth(i % 2).boundingBox();
      await p.mouse.click(b.x + spots[i].x * b.width, b.y + spots[i].y * b.height); await sleep(80);
    }
    if (!(await waitModal(p))) return R.defects.push('finding all differences did not end the game');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'spotdiff', R);
  },
  async fifteen(p, R) {
    await p.click('.ft-board [onclick="ftTap(0)"]').catch(() => {}); await sleep(80);
    R.steps.push('tap away from the gap -> "' + (await p.locator('#gameContent .cw-msg').innerText()) + '"');
    // put the puzzle one move from solved (gap moved one place), then solve it with a real tap
    const tgt = await p.evaluate(() => { const g = gameState.fifteen, N = g.n * g.n; g.t = Array.from({ length: N }, (_, i) => (i + 1) % N); g.t[N - 1] = g.t[N - 2]; g.t[N - 2] = 0; _ftRender(); return N - 1; });
    await p.click(`.ft-board [onclick="ftTap(${tgt})"]`);
    if (!(await waitModal(p))) return R.defects.push('the solved puzzle did not end the game');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'fifteen', R);
  },
  async mastermind(p, R) {
    const code = await p.evaluate(() => gameState.mastermind.code), k = await p.evaluate(() => gameState.mastermind.k);
    const wrong = code.slice(1).concat(code[0]);   // same colors, shifted: distinct, and not the code
    for (const c of wrong) await p.click(`.mm-pal [onclick="mmPick(${c})"]`);
    await p.locator('#gameContent .gk-btn', { hasText: 'Try' }).click(); await sleep(100);
    R.steps.push('first try -> "' + (await p.locator('#gameContent .cw-msg').innerText()) + '"');
    for (const c of code) await p.click(`.mm-pal [onclick="mmPick(${c})"]`);
    await p.locator('#gameContent .gk-btn', { hasText: 'Try' }).click();
    if (!(await waitModal(p))) return R.defects.push('the right code did not end the game');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'mastermind', R);
  },
