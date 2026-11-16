function _sudokuGen9() {
  const base = [
    [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9
    ],
    [
      4,
      5,
      6,
      7,
      8,
      9,
      1,
      2,
      3
    ],
    [
      7,
      8,
      9,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    [
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      1
    ],
    [
      5,
      6,
      7,
      8,
      9,
      1,
      2,
      3,
      4
    ],
    [
      8,
      9,
      1,
      2,
      3,
      4,
      5,
      6,
      7
    ],
    [
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      1,
      2
    ],
    [
      6,
      7,
      8,
      9,
      1,
      2,
      3,
      4,
      5
    ],
    [
      9,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  ];
  const nm = shuffle([
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9
  ]);
  let g = base.map(row => row.map(v => nm[v - 1]));
  for (let b = 0; b < 3; b++) {
    const p = shuffle([
      0,
      1,
      2
    ]);
    const sl = g.slice(b * 3, b * 3 + 3);
    g[b * 3] = sl[p[0]];
    g[b * 3 + 1] = sl[p[1]];
    g[b * 3 + 2] = sl[p[2]];
  }
  for (let b = 0; b < 3; b++) {
    const p = shuffle([
      0,
      1,
      2
    ]);
    g = g.map(row => {
      const n = [...row];
      n[b * 3] = row[b * 3 + p[0]];
      n[b * 3 + 1] = row[b * 3 + p[1]];
      n[b * 3 + 2] = row[b * 3 + p[2]];
      return n;
    });
  }
  return g;
}
function initSudoku(container) {
  const gs = gameState.sudoku;
  const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  const _hAdj = _d === 'easy' ? -10 : _d === 'hard' ? 10 : 0;
  const sol = _sudokuGen9();
  const holes = Math.min(Math.max(15, 25 + gs.level * 3 + _hAdj), 56);
  const puz = sol.map(r => [...r]);
  const given = Array(9).fill(null).map(() => Array(9).fill(true));
  let rem = 0;
  for (const pos of shuffle([...Array(81).keys()])) {
    if (rem >= holes)
      break;
    const r = Math.floor(pos / 9), c = pos % 9;
    puz[r][c] = 0;
    given[r][c] = false;
    rem++;
  }
  gs.sol = sol;
  gs.filled = puz;
  gs.given = given;
  gs.sr = -1;
  gs.sc = -1;
  _sudokuRender(container);
}
function _sudokuRender(c) {
  if (!gameState.active || gameState.currentId !== 'sudoku')
    return;
  const gs = gameState.sudoku;
  const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  const noHints = _d === 'hard';
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const P = isLight ? {
    cell: '#ffffff',
    grp: '#eef2f8',
    sameN: '#dbeafe',
    sel: '#93c5fd',
    border: '#cbd5e1',
    borderThick: '#2563eb',
    given: '#0f172a',
    filled: '#1d4ed8',
    conflict: '#dc2626',
    numBtn: '#eef2f8',
    numBtnBorder: '#cbd5e1',
    numBtnText: '#1a365d',
    numBtnHover: '#dbeafe',
    barText: '#475569',
    clearBg: '#fef2f2',
    clearBorder: '#fca5a5',
    clearText: '#dc2626',
    clearHover: '#fecaca',
    boardShadow: 'rgba(37,99,235,0.2)'
  } : {
    cell: '#0a1628',
    grp: '#0f2040',
    sameN: '#1e3a8a',
    sel: '#1d4ed8',
    border: '#1e3a5f',
    borderThick: '#3b82f6',
    given: '#f0f4ff',
    filled: '#60a5fa',
    conflict: '#f87171',
    numBtn: '#0f2040',
    numBtnBorder: '#1e3a5f',
    numBtnText: '#93c5fd',
    numBtnHover: '#1d4ed8',
    barText: '#93c5fd',
    clearBg: '#1a0a0a',
    clearBorder: '#7f1d1d',
    clearText: '#f87171',
    clearHover: '#7f1d1d',
    boardShadow: 'rgba(59,130,246,0.25)'
  };
  const sr = gs.sr, sc_ = gs.sc, sbr = sr >= 0 ? Math.floor(sr / 3) : -1, sbc = sc_ >= 0 ? Math.floor(sc_ / 3) : -1;
  const svn = sr >= 0 && sc_ >= 0 ? gs.filled[sr][sc_] : 0;
  const tsScale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
  const fs = 'clamp(1rem, 4.2vw, 1.5rem)';
  let boxes = '';
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      let cells = '';
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          const r = br * 3 + dr, cc = bc * 3 + dc;
          const v = gs.filled[r][cc];
          const isSel = r === sr && cc === sc_;
          const inGrp = !noHints && (r === sr || cc === sc_ || Math.floor(r / 3) === sbr && Math.floor(cc / 3) === sbc);
          const isSameN = !noHints && !isSel && svn > 0 && v === svn;
          const isGiven = gs.given[r][cc];
          let conflict = false;
          if (v > 0 && !isGiven) {
            for (let i = 0; i < 9; i++) {
              if (i !== cc && gs.filled[r][i] === v)
                conflict = true;
              if (i !== r && gs.filled[i][cc] === v)
                conflict = true;
            }
            for (let er = 0; er < 3; er++)
              for (let ec = 0; ec < 3; ec++) {
                const nr = br * 3 + er, nc = bc * 3 + ec;
                if ((nr !== r || nc !== cc) && gs.filled[nr][nc] === v)
                  conflict = true;
              }
          }
          const bg = isSel ? P.sel : isSameN ? P.sameN : inGrp ? P.grp : P.cell;
          const color = conflict ? P.conflict : isGiven ? P.given : P.filled;
          const fw = isGiven ? '800' : '600';
          cells += `<div onclick="selectSudoku9(${ r },${ cc })" style="background:${ bg };display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;transition:background 0.15s;font-size:${ fs };color:${ color };font-weight:${ fw }">${ v || '' }</div>`;
        }
      }
      boxes += `<div style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:1px;background:${ P.border }">${ cells }</div>`;
    }
  }
  const numBtnW = 'calc(2.5rem * ' + tsScale + ')';
  const numBtns = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9
  ].map(n => `<button onclick="fillSudoku9(${ n })" style="width:${ numBtnW };height:${ numBtnW };background:${ P.numBtn };border:1px solid ${ P.numBtnBorder };border-radius:8px;color:${ P.numBtnText };font-size:calc(1rem * ${ tsScale });font-weight:700;cursor:pointer;transition:background 0.15s" onmouseover="this.style.background='${ P.numBtnHover }'" onmouseout="this.style.background='${ P.numBtn }'">${ n }</button>`).join('');
  const isHe = false;
  const wrapStyle = isLight ? 'display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px;border-radius:18px;background:rgba(255,255,255,0.72);border:1px solid #cbd5e1;box-shadow:0 10px 34px rgba(15,23,42,0.12)' : 'display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px;border-radius:18px;background:#0a1628;border:1px solid rgba(59,130,246,0.35);box-shadow:0 10px 34px rgba(0,0,0,0.45)';
  c.innerHTML = `<div style="${ wrapStyle }">
        <div style="color:${ P.barText };font-size:calc(0.8rem * ${ tsScale });font-weight:700;letter-spacing:0.05em">${ gt('LEVEL') } ${ gameState.sudoku.level } &nbsp;·&nbsp; ${ gt('TAP A CELL, THEN A NUMBER') }</div>
        <div style="direction:ltr;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:3px;padding:3px;background:${ P.borderThick };border-radius:10px;width:min(92vw, 26rem);aspect-ratio:1;box-shadow:0 0 30px ${ P.boardShadow }">${ boxes }</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${ numBtns }<button onclick="fillSudoku9(0)" style="width:${ numBtnW };height:${ numBtnW };background:${ P.clearBg };border:1px solid ${ P.clearBorder };border-radius:8px;color:${ P.clearText };font-size:calc(1rem * ${ tsScale });font-weight:700;cursor:pointer" onmouseover="this.style.background='${ P.clearHover }'" onmouseout="this.style.background='${ P.clearBg }'">✕</button></div>
    </div>`;
}
function selectSudoku9(r, c) {
  gameState.sudoku.sr = r;
  gameState.sudoku.sc = c;
  _sudokuRender(document.getElementById('gameContent'));
}
function _sudokuLegal(g, r, c, v) {
  if (!v)
    return true;
  for (let i = 0; i < 9; i++) {
    if (i !== c && g[r][i] === v)
      return false;
    if (i !== r && g[i][c] === v)
      return false;
  }
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 3; dr++)
    for (let dc = 0; dc < 3; dc++) {
      const nr = br + dr, nc = bc + dc;
      if ((nr !== r || nc !== c) && g[nr][nc] === v)
        return false;
    }
  return true;
}
function _sudokuSolved(g) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      if (!g[r][c])
        return false;
      if (!_sudokuLegal(g, r, c, g[r][c]))
        return false;
    }
  return true;
}
function fillSudoku9(num) {
  const gs = gameState.sudoku;
  const r = gs.sr, c = gs.sc;
  if (r === -1 || c === -1 || gs.given[r][c])
    return;
  gs.filled[r][c] = num;
  if (num > 0)
    _sudokuLegal(gs.filled, r, c, num) ? sfxCorrect() : sfxWrong();
  if (_sudokuSolved(gs.filled))
    setTimeout(() => levelComplete(), 600);
  else
    _sudokuRender(document.getElementById('gameContent'));
}