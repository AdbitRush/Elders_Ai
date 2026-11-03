// ═══════════════════════════════════════════════════════════════════════════════
// PICTURE LOGIC — nonogram / picross (2026-10, wave 2). The numbers beside each row and above each column give the
// runs of filled squares in that line, in order ("3 1" = three filled, a gap, then one). Fill the grid to reveal a
// picture. A "Fill / Mark X" switch: X marks a square you know is empty. Rows and columns turn green when they match.
// Easy = 5x5, normal = 8x8, hard = 10x10. Solved when every row and column matches its numbers ("Well Done!").
// ═══════════════════════════════════════════════════════════════════════════════
const NG_PICS = {
  5: [['Heart', '.#.#.|#####|#####|.###.|..#..'], ['House', '..#..|.###.|#####|#.#.#|#.###'], ['Cup', '#####|#####|####.|.###.|..#..'],
      ['Arrow', '..#..|.###.|#.#.#|..#..|..#..'], ['Smile', '.#.#.|.#.#.|.....|#...#|.###.'], ['Tree', '..#..|.###.|#####|..#..|..#..'],
      ['Bell', '..#..|.###.|.###.|#####|..#..'], ['Boat', '..#..|..##.|..###|#####|.###.']],
  8: [['Coffee cup', '........|.#.#.#..|........|######..|#####.#.|######..|.####...|########'],
      ['Sailboat', '...#....|...##...|...###..|...####.|...#....|########|.######.|..####..'],
      ['Music note', '...#####|...#...#|...#...#|...#...#|.###.###|####.###|.##..###|........'],
      ['Umbrella', '...##...|.######.|########|#.#..#.#|...#....|...#....|...#..#.|....##..'],
      ['Key', '.###....|#...#...|#...####|#...#.##|.###..#.|........|........|........'],
      ['Cat', '#.....#.|##...##.|#######.|#.###.#.|#######.|.#####..|..###...|..#.#...']],
  10: [['Anchor', '....##....|...#..#...|....##....|..######..|....##....|....##....|#...##...#|##..##..##|.###..###.|...####...'],
       ['Rocket', '....##....|...####...|...#..#...|...####...|...####...|...####...|..######..|.##.##.##.|.#..##..#.|....##....'],
       ['Apple', '.....#....|....#.....|..##.###..|.#########|##########|##########|##########|.########.|.########.|..##..##..'],
       ['Radio', '....#.....|.....#....|######....|##########|#.....#..#|#.###.#.##|#.###.#..#|#.....#.##|##########|.#......#.'],
       ['Guitar', '........##|.......##.|......#...|.....#....|..###.....|.#####....|##.##.....|##.##.....|.####.....|..##......'],
       ['Star', '....##....|....##....|...####...|##########|.########.|..######..|..######..|.###..###.|.##....##.|##......##']],
};
function _ngRuns(line) { const o = []; let k = 0; for (const v of line) { if (v) k++; else if (k) { o.push(k); k = 0; } } if (k) o.push(k); return o.length ? o : [0]; }
function initNonogram(container) {
    const gs = gameState.nonogram;
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    const n = diff === 'easy' ? 5 : diff === 'hard' ? 10 : 8;
    const list = NG_PICS[n];
    const seenK = 'gg_ng_seen_' + n; let seen = []; try { seen = JSON.parse(localStorage.getItem(seenK)) || []; } catch (e) {}
    let pick = list.findIndex((_, i) => !seen.includes(i)); if (pick < 0) { seen = []; pick = Math.floor(Math.random() * list.length); }
    try { localStorage.setItem(seenK, JSON.stringify(seen.concat(pick))); } catch (e) {}
    const [name, rows] = list[pick];
    gs.n = n; gs.name = name; gs.sol = rows.split('|').map((r) => [...r].map((ch) => ch === '#'));
    gs.rowC = gs.sol.map(_ngRuns); gs.colC = gs.sol[0].map((_, c) => _ngRuns(gs.sol.map((r) => r[c])));
    gs.g = Array.from({ length: n }, () => Array(n).fill(0));   // 0 empty, 1 filled, 2 X
    gs.mode = 1; gs.over = false; gs.msg = '';
    _ngRender();
}
function ngMode(m) { gameState.nonogram.mode = m; _ngRender(); }
function ngTap(r, c) {
    const gs = gameState.nonogram; if (gs.over) return;
    gs.g[r][c] = gs.g[r][c] === gs.mode ? 0 : gs.mode;
    if (typeof sfxClick === 'function') sfxClick();
    const ok = (line, clue) => _ngRuns(line.map((v) => v === 1)).join(',') === clue.join(',');
    if (gs.g.every((row, i) => ok(row, gs.rowC[i])) && gs.colC.every((cl, j) => ok(gs.g.map((row) => row[j]), cl))) {
        gs.over = true; gs.msg = `It's a ${gs.name.toLowerCase()}!`; _ngRender(); if (typeof sfxCorrect === 'function') sfxCorrect();
        return GameKit.finish('nonogram', true, `You revealed the picture: a ${gs.name.toLowerCase()}.`);
    }
    _ngRender();
}
function ngGiveUp() { const gs = gameState.nonogram; if (gs.over) return; gs.over = true; gs.g = gs.sol.map((r) => r.map((v) => (v ? 1 : 0))); gs.msg = `The picture was a ${gs.name.toLowerCase()}.`; _ngRender(); GameKit.finish('nonogram', false, `The picture was a ${gs.name.toLowerCase()}.`); }
function _ngRender() {
    const gs = gameState.nonogram, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'nonogram') return;
    const n = gs.n, okLine = (line, clue) => _ngRuns(line.map((v) => v === 1)).join(',') === clue.join(',');
    const colDone = gs.colC.map((cl, j) => okLine(gs.g.map((r) => r[j]), cl));
    let h = `<div class="ng-corner"></div>` + gs.colC.map((cl, j) => `<div class="ng-cc${colDone[j] ? ' ng-done' : ''}">${cl.map((x) => `<span>${x}</span>`).join('')}</div>`).join('');
    gs.g.forEach((row, r) => {
        const done = okLine(row, gs.rowC[r]);
        h += `<div class="ng-rc${done ? ' ng-done' : ''}">${gs.rowC[r].join(' ')}</div>`;
        row.forEach((v, c) => { h += `<button type="button" class="gk-cell ng-c ng-v${v}${(c + 1) % 5 === 0 && c < n - 1 ? ' ng-rb' : ''}${(r + 1) % 5 === 0 && r < n - 1 ? ' ng-bb' : ''}" onclick="ngTap(${r},${c})" aria-label="row ${r + 1} column ${c + 1}${v === 1 ? ', filled' : v === 2 ? ', marked empty' : ''}">${v === 2 ? '✕' : ''}</button>`; });
    });
    el.innerHTML = `<div class="ng" dir="ltr">
      <div class="ms-mode" role="group" aria-label="What a tap does">
        <button type="button" class="ms-m" aria-pressed="${gs.mode === 1}" onclick="ngMode(1)">■ Fill</button>
        <button type="button" class="ms-m" aria-pressed="${gs.mode === 2}" onclick="ngMode(2)">✕ Mark empty</button></div>
      <div class="ng-grid" style="grid-template-columns:auto repeat(${n},1fr)">${h}</div>
      <div class="cw-msg" role="status">${gs.msg || 'Rows and columns turn green when they match their numbers.'}</div>
      <div class="gk-btns">${GameKit.btn('Give up', 'ngGiveUp()')}</div>
    </div>
    <style>
      .ng{width:100%;box-sizing:border-box;max-width:34rem;margin:0 auto;color:#2b1b0d}
      .ms-mode{display:flex;gap:8px;justify-content:center;margin-bottom:10px}
      .ms-m{min-height:52px;flex:1;max-width:12rem;border-radius:14px;border:3px solid #c9a46a;background:#fffdf7;color:#2b1b0d;font-weight:900;font-size:1.1rem;cursor:pointer}
      .ms-m[aria-pressed="true"]{background:#2b1b0d;color:#fff6e8;border-color:#2b1b0d}
      .ng-grid{display:grid;gap:2px;align-items:stretch}
      .ng-cc{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;font-weight:800;font-size:clamp(.8rem,3.4vw,1.05rem);line-height:1.15;padding-bottom:3px;border-radius:5px}
      .ng-rc{display:flex;align-items:center;justify-content:flex-end;font-weight:800;font-size:clamp(.8rem,3.4vw,1.05rem);padding-right:5px;white-space:nowrap;border-radius:5px}
      .ng-done{background:#bbf7d0;color:#14532d}
      .ng-c{aspect-ratio:1;min-width:0;border:1px solid #b9a07a;background:#fffdf7;border-radius:3px;cursor:pointer;padding:0;font-weight:900;color:#9a3412;font-size:clamp(.8rem,3.6vw,1.2rem)}
      .ng-c.ng-v1{background:#2b1b0d;border-color:#2b1b0d}
      .ng-c.ng-rb{margin-right:2px}.ng-c.ng-bb{margin-bottom:2px}
      .ng .gk-btn{border-color:#c9a46a}
      .cw-msg{text-align:center;font-weight:700;margin:10px 0;min-height:1.5em}
    </style>`;
}
