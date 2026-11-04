// Game drivers for play-nostalgia2.js. Each driver plays a real game to its end with clicks / keys.
// play(p, R, H): R.steps / R.defects collect results; H has sleep, G (state), msg, click(sel), btn(text).
// Optional: restartK (data-k of the restart button), focusSel (a game button to hold Enter on), heKey ({code, key}).
module.exports = {
  reversi: {
    heKey: { code: 'KeyH', key: 'י' },
    async play(p, R, H) {
      let moves = 0;
      for (let k = 0; k < 200; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'reversi'); if (g.over) break;
        if (g.turn !== 1) { await H.sleep(250); continue; }
        // a taken square is refused with a message (first move only)
        if (!moves) { await H.click(p, '[onclick="rvTap(27)"]'); R.steps.push('tap a taken square -> ' + (await H.msg(p)).slice(0, 50)); }
        const best = await p.evaluate(() => { const b = gameState.reversi.b; let bi = -1, bn = 0; for (let i = 0; i < 64; i++) { const n = _rvFlips(b, i, 1).length; if (n > bn || ([0, 7, 56, 63].includes(i) && n)) { bn = n; bi = i; if ([0, 7, 56, 63].includes(i)) break; } } return [bi, bn]; });
        const n0 = g.b.filter(Boolean).length;
        await H.click(p, `[onclick="rvTap(${best[0]})"]`); moves++;
        const g2 = await H.G(p, 'reversi');
        const n1 = g2.b.filter((x) => x === 1).length;
        if (g2.b.filter(Boolean).length !== n0 + 1 && !g2.over && g2.turn !== 1) R.defects.push('disc count wrong after a move');
        if (g.b.filter((x) => x === 1).length + best[1] + 1 !== n1 && g2.turn !== 1) R.defects.push(`flip count wrong: expected ${best[1]}`);
      }
      const g = await H.G(p, 'reversi');
      R.steps.push(`played ${moves} moves; final you ${g.b.filter((x) => x === 1).length}, computer ${g.b.filter((x) => x === 2).length}`);
    },
  },
  fourrow: {
    async play(p, R, H) {
      await p.keyboard.press('Digit4'); await p.keyboard.press('ArrowLeft');
      R.steps.push('keys 4 then Left -> ' + (await H.msg(p)).slice(0, 40));
      for (let k = 0; k < 400; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'fourrow'); if (g.over) break;
        if (g.turn !== 1) { await H.sleep(250); continue; }
        const c = await p.evaluate(() => { const b = gameState.fourrow.b; const cols = [3, 2, 4, 1, 5, 0, 6].filter((c) => _frDrop(b, c) >= 0);
          for (const p of [1, 2]) for (const c of cols) { const t = b.map((x) => x.slice()); t[_frDrop(t, c)][c] = p; if (_frLine(t, p)) return c; } return cols[0]; });
        await H.click(p, `[onclick="frPick(${c})"]`);
        if (k % 2) await H.click(p, `[onclick="frPick(${c})"]`); else await H.btn(p, 'Drop');
      }
      const g = await H.G(p, 'fourrow'); R.steps.push(`game over after ${g.moves} of my moves; line: ${JSON.stringify(g.win)}`);
    },
  },
  shutbox: {
    focusSel: '#gameContent [data-k="roll2"]',
    heKey: { code: 'KeyR', key: 'ר' },
    async play(p, R, H) {
      for (let k = 0; k < 400; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'shutbox'); if (g.over) break;
        if (g.who !== 0) { await H.sleep(300); continue; }
        if (!g.need) { if (g.open.slice(6).every((o) => !o) && Math.random() < .5) await H.btn(p, 'Roll one die'); else await H.btn(p, 'Roll two dice'); continue; }
        const combo = await p.evaluate(() => { const g = gameState.shutbox; const cs = _sbCombos(_sbOpenVals(g), g.need); cs.sort((a, b) => a.length - b.length || Math.max(...b) - Math.max(...a)); return cs[0]; });
        if (!combo) { await H.sleep(200); continue; }
        for (const v of combo) await H.click(p, `[onclick="sbTile(${v})"]`);
        await H.btn(p, 'Shut them');
      }
      const g = await H.G(p, 'shutbox');
      const sum = g.hist.reduce((a, h) => [a[0] + h[0], a[1] + h[1]], [0, 0]);
      R.steps.push(`3 rounds: ${JSON.stringify(g.hist)} totals ${g.tot} (sheet sums ${sum})`);
      if (sum[0] !== g.tot[0] || sum[1] !== g.tot[1] || g.hist.length !== 3) R.defects.push('score sheet does not add up');
    },
  },
  lights: {
    restartK: 'new',
    heKey: { code: 'KeyH', key: 'י' },
    async play(p, R, H) {
      await H.click(p, '[onclick="ltTap(0)"]'); await H.btn(p, 'Undo');
      R.steps.push('press + undo -> ' + (await H.msg(p)));
      await H.btn(p, 'Hint'); const h = (await H.G(p, 'lights')).hint; R.steps.push('hint lamp ' + h);
      const sol = await p.evaluate(() => _ltBest(gameState.lights.n, gameState.lights.on));
      const par = (await H.G(p, 'lights')).par;
      let n = 0; for (let i = 0; i < sol.length; i++) if (sol[i]) { if (await H.modalUp(p)) break; await H.click(p, `[onclick="ltTap(${i})"]`); n++; }
      R.steps.push(`solved with ${n} presses (par ${par})`); if (n !== par) R.defects.push('the best solution does not match par');
    },
  },
  maze: {
    restartK: 'new', focusSel: '#gameContent [data-k="goright"]',
    async play(p, R, H) {
      // drive the true route with the ARROW KEYS (keyboard play)
      await p.evaluate(() => document.body.focus());
      const route = await p.evaluate(() => _mzRoute(gameState.maze));
      R.steps.push('true route ' + (route.length - 1) + ' squares');
      for (let k = 0; k < 400; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'maze'); if (g.over) break;
        const i = route.indexOf(g.pos.join(',')); if (i < 0) { R.defects.push('car left the route'); break; }
        const [r, c] = route[i + 1].split(',').map(Number);
        const key = r > g.pos[0] ? 'ArrowDown' : r < g.pos[0] ? 'ArrowUp' : c > g.pos[1] ? 'ArrowRight' : 'ArrowLeft';
        await p.keyboard.press(key); await H.sleep(30);
      }
      const g = await H.G(p, 'maze'); R.steps.push(`reached the diner in ${g.moves} presses`);
    },
  },

  morris: {
    async play(p, R, H) {
      await H.click(p, '[onclick="moTap(0)"]');
      let n = 0;
      for (let k = 0; k < 600; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'morris'); if (g.over) break;
        if (g.turn !== 1) { await H.sleep(200); continue; }
        const m = await p.evaluate(() => { const g = gameState.morris; return _moSearch({ b: g.b, hand: g.hand }, 1, 2, -1e9, 1e9).m; });
        if (m.from >= 0) await H.click(p, `[onclick="moTap(${m.from})"]`);
        await H.click(p, `[onclick="moTap(${m.to})"]`);
        if (m.rem >= 0) { const g2 = await H.G(p, 'morris'); if (!g2.removing) R.defects.push('a mill did not ask for a removal'); await H.click(p, `[onclick="moTap(${m.rem})"]`); }
        n++;
      }
      const g = await H.G(p, 'morris'); R.steps.push(`${n} moves; you ${g.b.filter((x) => x === 1).length}, computer ${g.b.filter((x) => x === 2).length} on the board; "${(await H.msg(p)).slice(0, 70)}"`);
    },
  },
  salvo: {
    async play(p, R, H) {
      for (let k = 0; k < 600; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'salvo'); if (g.over) break;
        if (g.turn !== 1) { await H.sleep(200); continue; }
        // a fair hunter: follow up unsunk hits, else checkerboard
        const S = g.myShots, n = 8, open = S.map((v, i) => (v === 2 && g.cpu.ships[g.cpu.g[i]].hits < g.cpu.ships[g.cpu.g[i]].L ? i : -1)).filter((i) => i >= 0);
        const nb = (i) => [i - n, i + n, i % n ? i - 1 : -1, i % n < n - 1 ? i + 1 : -1].filter((x) => x >= 0 && x < 64 && !S[x]);
        let t = open.flatMap(nb)[0]; if (t === undefined) { const c = [...Array(64).keys()].filter((i) => !S[i] && (Math.floor(i / n) + i % n) % 2 === 0); t = c.length ? c[0] : S.indexOf(0); }
        await H.click(p, `[onclick="svTap(${t})"]`);
        if (k % 2) await H.click(p, `[onclick="svTap(${t})"]`); else await H.btn(p, 'Fire');
      }
      const g = await H.G(p, 'salvo'); R.steps.push(`${g.shots} shots; enemy sunk ${g.cpu.ships.filter((s) => s.hits === s.L).length}/${g.cpu.ships.length}, mine sunk ${g.me.ships.filter((s) => s.hits === s.L).length}`);
    },
  },
  bingo: {
    heKey: { code: 'KeyN', key: 'מ' },
    async play(p, R, H) {
      await H.btn(p, 'BINGO!'); R.steps.push('early BINGO -> ' + (await H.msg(p)).slice(0, 40));
      for (let k = 0; k < 120; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'bingo'); if (g.over) break;
        await H.btn(p, 'Call the next ball');
        const g2 = await H.G(p, 'bingo'); if (g2.over) break; const n = g2.called[g2.called.length - 1];
        if (k === 0 && !R._miss) { R._miss = 1; const miss = g2.cards[0].nums.findIndex((x, i) => x && !g2.called.includes(x)); await H.click(p, `[onclick="bgDaub(0,${miss})"]`); R.steps.push('daub an uncalled number -> ' + (await H.msg(p)).slice(0, 50)); }
        for (let ci = 0; ci < g2.cards.length; ci++) { const i = g2.cards[ci].nums.indexOf(n); if (i >= 0) await H.click(p, `[onclick="bgDaub(${ci},${i})"]`); }
        const has = await p.evaluate(() => gameState.bingo.cards.some((c) => _BG_PATTERNS[gameState.bingo.pat].test(c.daub)));
        if (has) { await H.btn(p, 'BINGO!'); break; }
      }
      const g = await H.G(p, 'bingo'); R.steps.push(`pattern ${g.pat}, ${g.called.length} balls`);
    },
  },
  moonland: {
    focusSel: '#gameContent [data-k="fire"]', heKey: { code: 'KeyF', key: 'כ' },
    async play(p, R, H) {
      await p.keyboard.press('Digit7'); R.steps.push('key 7 -> throttle ' + (await H.G(p, 'moonland')).B);
      for (let k = 0; k < 40; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'moonland'); if (g.over) break;
        const B = await p.evaluate(() => { const g = gameState.moonland; let best = null; for (let b = 0; b <= 10; b++) { const r = _mlStep(g.h, g.v, b, g.fuel); const tgt = Math.min(Math.sqrt(2 * 1.2 * Math.max(r.h, 0)) + 1, 60); const c = (r.landed ? (Math.abs(r.v) > g.safe - 0.5 ? 100 : 0) : Math.abs(r.v - tgt)) + b * 0.02; if (!best || c < best[0]) best = [c, b]; } return best[1]; });
        // set it with the on-screen buttons: Off, then + presses
        await H.btn(p, 'Off (0)'); for (let i = 0; i < B; i++) await p.locator('#gameContent [data-k="plus"]').click();
        await H.btn(p, 'Fire for 5 seconds');
      }
      const g = await H.G(p, 'moonland'); R.steps.push(`${g.turn} turns, touchdown at ${Math.abs(g.v).toFixed(1)} m/s (safe ${g.safe}), fuel ${Math.round(g.fuel)}`);
    },
  },
  jellybean: {
    focusSel: '#gameContent [data-k="k7"]',
    async play(p, R, H) {
      for (let j = 0; j < 5; j++) {
        const g = await H.G(p, 'jellybean');
        const drawn = await p.evaluate(() => document.querySelectorAll('.jb-jar ellipse').length);
        if (drawn !== g.jars[g.i]) R.defects.push(`jar ${j + 1}: ${drawn} beans drawn, ${g.jars[g.i]} expected`);
        const guess = j === 4 ? String(g.jars[g.i] * 2) : String(g.jars[g.i]);   // the last one far off on purpose
        for (const ch of guess) await H.click(p, `[data-k="k${ch}"]`);
        await H.btn(p, 'Guess');
        if (j === 0) R.steps.push('exact guess -> ' + (await H.msg(p)).slice(0, 70));
        await H.btn(p, j < 4 ? 'Next jar' : 'See the judging');
      }
      const g = await H.G(p, 'jellybean'); R.steps.push('ribbons ' + g.res.map((r) => r.cls).join(','));
    },
  },

  golf: {
    heKey: null,
    async play(p, R, H) {
      await H.click(p, '[onclick="gfSlot(0)"]'); await H.click(p, '[onclick="gfSlot(0)"]');
      R.steps.push('flip a face-up card -> ' + (await H.msg(p)).slice(0, 40));
      await H.click(p, '[onclick="gfSlot(4)"]');
      for (let k = 0; k < 600; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'golf'); if (g.over) break;
        if (g.phase === 'flip') { const i = g.hands[0].findIndex((c) => !c.up); await H.click(p, `[onclick="gfSlot(${i})"]`); continue; }
        if (g.phase === 'scored') {
          const ok = await p.evaluate(() => { const g = gameState.golf; const sc = (h) => { let s = 0; for (let c = 0; c < 3; c++) { const a = h[c], b = h[c + 3], v = (x) => (x.r === 2 ? -2 : x.r === 13 ? 0 : x.r >= 11 ? 10 : x.r); s += a.r === b.r ? 0 : v(a) + v(b); } return s; }; const last = g.cards[g.cards.length - 1]; return last[0] === sc(g.hands[0]) && last[1] === sc(g.hands[1]); });
          R.steps.push(`hole ${g.hole}: ${JSON.stringify(g.cards[g.cards.length - 1])} score check ${ok}`); if (!ok) R.defects.push('hole score wrong');
          await H.btn(p, 'Next hole'); continue;
        }
        if (g.turn !== 0) { await H.sleep(250); continue; }
        if (g.mustFlip) { const i = g.hands[0].findIndex((c) => !c.up); await H.click(p, `[onclick="gfSlot(${i})"]`); continue; }
        if (g.hold) {
          const [i, gain] = await p.evaluate(() => { const g = gameState.golf; let bi = 0, bg = -99; for (let i = 0; i < 6; i++) { const x = _gfGain(g.hands[0], i, g.hold, 5.5); if (x > bg) { bg = x; bi = i; } } return [bi, bg]; });
          if (g.from === 'stock' && gain < 1 && g.hands[0].some((c) => !c.up)) await H.click(p, '[data-k="disc"]'); else await H.click(p, `[onclick="gfSlot(${i})"]`);
          continue;
        }
        const top = g.disc[g.disc.length - 1];
        const gain = await p.evaluate((top) => { const g = gameState.golf; let bg = -99; for (let i = 0; i < 6; i++) bg = Math.max(bg, _gfGain(g.hands[0], i, top, 5.5)); return bg; }, top);
        if (gain >= 2) await H.click(p, '[data-k="disc"]'); else await H.click(p, '[data-k="stock"]');
      }
      const g = await H.G(p, 'golf'); R.steps.push(`3 holes: ${JSON.stringify(g.cards)} totals ${g.tot}`);
    },
  },
  crosssums: {
    focusSel: '#gameContent [data-k="d1"]',
    async play(p, R, H) {
      const g0 = await H.G(p, 'crosssums');
      const cells = Object.keys(g0.P.sol).map(Number).filter((i) => !g0.P.given[i]);
      // a wrong digit first: Check must mark it
      const w = cells[0], wrong = g0.P.sol[w] === 9 ? 1 : g0.P.sol[w] + 1;
      await H.click(p, `[onclick="ksSel(${w})"]`); await H.click(p, `[data-k="d${wrong}"]`);
      await H.btn(p, 'Check'); R.steps.push('wrong digit + Check -> ' + (await H.msg(p)));
      for (const i of cells) { await H.click(p, `[onclick="ksSel(${i})"]`); await p.keyboard.press('Digit' + g0.P.sol[i]); }
      R.steps.push(`filled ${cells.length} squares by keyboard digits`);
    },
  },
  logicgrid: {
    heKey: { code: 'KeyX', key: 'ס' },
    async play(p, R, H) {
      const g0 = await H.G(p, 'logicgrid');
      R.steps.push(`${g0.P.n} neighbors, ${g0.P.cats.join('+')}, ${g0.P.clues.length} clues`);
      await H.btn(p, 'Mode: Choose'); await H.click(p, '[data-k="o1"]'); R.steps.push('cross out -> ' + JSON.stringify((await H.G(p, 'logicgrid')).out[0][0]));
      await H.btn(p, 'Mode: Cross out');
      for (let c = 0; c < g0.P.cats.length; c++) for (let q = 0; q < g0.P.n; q++) {
        if (await H.modalUp(p)) break;
        await H.click(p, `[onclick="lgSel(${c},${q})"]`); await H.click(p, `[data-k="o${g0.P.A[c][q]}"]`);
      }
    },
  },
  fillin: {
    heKey: null,
    async play(p, R, H) {
      const g0 = await H.G(p, 'fillin');
      // a clash: try each same-length word in the first empty space until one is refused
      const k0 = g0.slots.findIndex((s) => !s.w);
      for (let k = 0; k < g0.slots.length; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'fillin'); const s = g.slots[k]; if (s.w) continue;
        for (let t = 0; t < 3; t++) { const gg = await H.G(p, 'fillin'); if (gg.sel === k) break; await H.click(p, `[onclick="fiCell(${s.r},${s.c})"]`); }
        if ((await H.G(p, 'fillin')).sel !== k) { await H.click(p, `[onclick="fiCell(${s.r + s.dr},${s.c + s.dc})"]`); }
        if (k === k0) {
          // a same-length word that clashes with a letter already in the grid must be refused
          const other = await p.evaluate((k) => { const g = gameState.fillin, s = g.slots[k], G = _fiGrid(g), cells = _fiCells(s); return g.words.findIndex((w) => w.length === s.L && !g.slots.some((x) => x.w === w) && cells.some(([r, c], i) => G[r + ',' + c] && G[r + ',' + c] !== w[i])); }, k);
          if (other >= 0) { await H.click(p, `[onclick="fiWord(${other})"]`); R.steps.push('clashing word -> ' + (await H.msg(p)).slice(0, 80)); if ((await H.G(p, 'fillin')).slots[k].w) R.defects.push('a clashing word was accepted'); }
        }
        if ((await H.G(p, 'fillin')).sel !== k) { R.defects.push('could not select space ' + k); continue; }
        await H.click(p, `[onclick="fiWord(${g.words.indexOf(g0.P.placed[k].w)})"]`);
      }
      const g = await H.G(p, 'fillin'); R.steps.push(`${g.slots.filter((s) => s.w).length} of ${g.slots.length} spaces filled`);
    },
  },
  colorbynum: {
    async play(p, R, H) {
      const g0 = await H.G(p, 'colorbynum');
      const wrongReg = g0.R.regs.findIndex((x) => g0.num[x.ch] !== 1);
      await H.click(p, `[onclick="cnTap(${g0.R.regs[wrongReg].lab[0]},${g0.R.regs[wrongReg].lab[1]})"]`); R.steps.push('wrong paint -> ' + (await H.msg(p)).slice(0, 60));
      for (let k = 0; k < g0.R.regs.length; k++) {
        if (await H.modalUp(p)) break;
        const r = g0.R.regs[k]; await H.click(p, `[data-k="p${g0.num[r.ch]}"]`); await H.click(p, `[onclick="cnTap(${r.lab[0]},${r.lab[1]})"]`);
      }
      R.steps.push(`"${g0.pic.name}": ${g0.R.regs.length} areas painted`);
    },
  },

  chess: {
    async play(p, R, H) {
      await H.click(p, '[onclick="chTap(52)"]'); await H.click(p, '[onclick="chTap(28)"]'); R.steps.push('illegal pawn move -> ' + (await H.msg(p)).slice(0, 60));
      await H.click(p, '[onclick="chTap(36)"]');   // the pawn is still picked
      for (let w = 0; w < 30 && (await H.G(p, 'chess')).S.t !== 'w'; w++) await H.sleep(150);
      await H.btn(p, 'Take back'); const tb = await H.G(p, 'chess'); R.steps.push(`take back -> move ${tb.S.fm}, ${tb.S.t} to play, pawn back on e2: ${tb.S.b[52] === 'P'}`);
      let n = 0;
      for (let k = 0; k < 900; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'chess'); if (g.over) break;
        if (g.S.t !== 'w' || g.thinking) { await H.sleep(120); continue; }
        const m = await p.evaluate(() => _chSearch(gameState.chess.S, 2, -1e9, 1e9, false).m);
        await H.click(p, `[onclick="chTap(${m.f})"]`); await H.click(p, `[onclick="chTap(${m.t})"]`);
        if (m.pr) { await H.click(p, `[data-k="pr${m.pr}"]`); R.steps.push('promoted to ' + m.pr); }
        n++;
      }
      const g = await H.G(p, 'chess'); R.steps.push(`${n} white moves; "${(await H.msg(p)).slice(-70)}"`);
    },
  },
  railyard: {
    heKey: { code: 'KeyA', key: 'ש' },
    async play(p, R, H) {
      const plan = await p.evaluate(() => { const g = gameState.railyard, key = (S, E) => S.map((s) => s.join(',')).join('|') + '/' + E.join(','), goal = g.target.join(',');
        const q = [[g.S, g.E, []]], seen = new Set([key(g.S, g.E)]);
        for (let h = 0; h < q.length && h < 400000; h++) { const [S, E, path] = q[h]; if (!E.length && S[0].join(',') === goal) return path;
          for (let x = 0; x < 3; x++) for (let k = 0; k <= 3; k++) { const m = _ryMove(S, E, x, k, g.caps); if (!m) continue; const kk = key(m.S, m.E); if (seen.has(kk)) continue; seen.add(kk); q.push([m.S, m.E, path.concat([[x, k]])]); } }
        return null; });
      if (!plan) { R.defects.push('no solution found by the test search'); return; }
      const par = (await H.G(p, 'railyard')).par;
      R.steps.push(`plan of ${plan.length} moves (par ${par})`); if (par && plan.length !== par) R.defects.push('par does not match the shortest plan');
      for (const [x, k] of plan) { await H.click(p, `[onclick="rySel(${x})"]`); await H.click(p, `[data-k="g${k}"]`); }
    },
  },
  twentyq: {
    focusSel: '#gameContent [data-k="q0"]',
    async play(p, R, H) {
      const g0 = await H.G(p, 'twentyq');
      if (!g0.auto) { await H.click(p, '[onclick="tqPick(5)"]'); await H.btn(p, 'Cross out'); R.steps.push('cross out -> ' + JSON.stringify((await H.G(p, 'twentyq')).out)); await H.click(p, '[onclick="tqPick(5)"]'); await H.btn(p, 'Cross out'); }
      for (let k = 0; k < 25; k++) {
        if (await H.modalUp(p)) break;
        const step = await p.evaluate(() => { const g = gameState.twentyq; const pool = _TQ_ITEMS.filter((it) => _tqFits(g, it)); if (pool.length === 1) return { guess: _TQ_ITEMS.indexOf(pool[0]) };
          let best = -1, bs = 1e9; _TQ_Q.forEach((q, i) => { if (g.asked.includes(i)) return; const y = pool.filter((x) => _tqYes(i, x)).length, s = Math.max(y, pool.length - y); if (s < bs) { bs = s; best = i; } }); return { ask: best }; });
        if (step.guess !== undefined) { await H.click(p, `[onclick="tqPick(${step.guess})"]`); await H.click(p, '[data-k="guess"]'); break; }
        await H.click(p, `[data-k="q${step.ask}"]`);
      }
      const g = await H.G(p, 'twentyq'); R.steps.push(`secret ${g.secret}: ${g.asked.length} questions + ${g.guessed.length} guess`);
    },
  },
  sticks: {
    focusSel: '#gameContent [data-k="next"]', heKey: { code: 'KeyP', key: 'פ' },
    async play(p, R, H) {
      const tapStick = async (i) => { await p.locator('.sk-svg').evaluate((e) => e.scrollIntoView({ block: 'center' })); const bx = await p.locator('.sk-svg').boundingBox();
        // tap at a point of the stick not crossed by later sticks if possible (else its middle)
        const pt = await p.evaluate((i) => { const g = gameState.sticks, s = g.st[i]; for (let t = 0.1; t <= 0.9; t += 0.05) { const x = s.p[0] + (s.q[0] - s.p[0]) * t, y = s.p[1] + (s.q[1] - s.p[1]) * t; const near = g.st.some((o, j) => j !== i && !o.gone && (() => { const vx = o.q[0] - o.p[0], vy = o.q[1] - o.p[1], u = Math.max(0, Math.min(1, ((x - o.p[0]) * vx + (y - o.p[1]) * vy) / (vx * vx + vy * vy))); return Math.hypot(x - o.p[0] - u * vx, y - o.p[1] - u * vy) < 14; })()); if (!near) return [x, y]; } return [(s.p[0] + s.q[0]) / 2, (s.p[1] + s.q[1]) / 2]; }, i);
        const k = (bx.width - 6) / 300; await p.mouse.click(bx.x + 3 + pt[0] * k, bx.y + 3 + pt[1] * k); await H.sleep(40); };
      // one deliberate jiggle: the bottom stick if it is covered
      const cov = await p.evaluate(() => gameState.sticks.st.findIndex((s, i) => !_skFree(gameState.sticks, i)));
      if (cov >= 0) { await tapStick(cov); const sel = (await H.G(p, 'sticks')).sel; if (sel === cov) { await H.btn(p, 'Pick up'); R.steps.push('lift a covered stick -> ' + (await H.msg(p)).slice(0, 50)); } else R.steps.push('tap picked stick ' + sel + ' instead of ' + cov); }
      for (let k = 0; k < 60; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'sticks'); if (g.over) break;
        const i = await p.evaluate(() => { const g = gameState.sticks; for (let i = g.st.length - 1; i >= 0; i--) if (!g.st[i].gone && _skFree(g, i)) return i; return -1; });
        await tapStick(i); const sel = (await H.G(p, 'sticks')).sel;
        if (sel !== i) { await p.evaluate((i) => { gameState.sticks.sel = i; }, i); R.steps.push(`tap landed on stick ${sel}, wanted ${i} (used arrow selection)`); }
        await H.btn(p, 'Pick up');
      }
      const g = await H.G(p, 'sticks'); R.steps.push(`jiggles ${g.jig}, points ${g.pts}, left ${g.st.filter((s) => !s.gone).length}`);
    },
  },
  tilematch: {
    focusSel: '#gameContent [data-k="hint"]', heKey: { code: 'KeyH', key: 'י' },
    async play(p, R, H) {
      const blk = await p.evaluate(() => gameState.tilematch.t.findIndex((x, i) => !_tmIsFree(gameState.tilematch, i)));
      if (blk >= 0) { await H.click(p, `[onclick="tmTap(${blk})"]`).catch(() => {}); R.steps.push('blocked tile -> ' + (await H.msg(p)).slice(0, 50)); }
      let pairs = 0, shuf = 0;
      for (let k = 0; k < 80; k++) {
        if (await H.modalUp(p)) break;
        const g = await H.G(p, 'tilematch'); if (g.over) break;
        await H.btn(p, 'Hint'); const h = (await H.G(p, 'tilematch')).hint;
        if (!h) { if (shuf >= 3) { await H.btn(p, 'Give up'); R.defects.push('stuck after hints and 3 shuffles'); break; } await H.btn(p, 'Shuffle'); shuf++; continue; }
        await H.click(p, `[onclick="tmTap(${h[0]})"]`); await H.click(p, `[onclick="tmTap(${h[1]})"]`); pairs++;
        if (pairs === 2 && !R._undone) { R._undone = 1; await H.btn(p, 'Undo'); R.steps.push('undo -> ' + (await H.msg(p))); pairs--; }
      }
      R.steps.push(`${pairs} pairs removed, ${shuf} shuffles`);
    },
  },
};
