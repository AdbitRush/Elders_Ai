// ════════════════════════════════════════════════════════════════════════
// PATTERN WORKSHOP (2026-11, review) - copy a small mosaic from original geometric pieces, at your own pace.
// Linked articles: the pleasure of being a beginner (a new, approachable rule), let the player choose. Not a quilting or training programme.
// Stage 1: 2x2, pieces already turned the right way. Optional: 3x3 board, and/or "quarter turns" (one rule, with a worked example).
// The target stays on screen. Every action is a button: pick a piece, pick a square; turn left/right; Put back; Undo; Reset; Hint; Show answer.
// Pieces differ by SHAPE as well as colour. A rotation counts once per press. Turning-symmetric pieces are compared by canonical orientation.
// Choices are explained and kept in this browser only (bp-pwk-prefs); changing one mid-puzzle asks first and can be cancelled.
// Entertainment and practice. Not a medical test or treatment.
// ════════════════════════════════════════════════════════════════════════
const _PW = {
  half: { order: 4, col: '#2a5db0', name: 'diagonal half', pos: ['top-left', 'top-right', 'bottom-right', 'bottom-left'], d: '<path d="M0 0H60L0 60z"/>' },
  corner: { order: 4, col: '#b5472f', name: 'quarter circle', pos: ['top-left', 'top-right', 'bottom-right', 'bottom-left'], d: '<path d="M0 0H50A50 50 0 0 1 0 50z"/>' },
  bar: { order: 2, col: '#2e7a35', name: 'bar', pos: ['horizontal', 'vertical'], d: '<rect x="0" y="22" width="60" height="16"/>' },
  dot: { order: 1, col: '#6b3f8f', name: 'centre dot', pos: [''], d: '<circle cx="30" cy="30" r="15"/>' },
  arrow: { order: 4, col: '#8a5a10', name: 'arrow', pos: ['up', 'right', 'down', 'left'], d: '<path d="M30 6L52 36H38V54H22V36H8z"/>' },
};
const _PW_KEY = 'bp-pwk-prefs';
const _pwGet = () => { try { return JSON.parse(localStorage.getItem(_PW_KEY)) || {}; } catch (e) { return {}; } };
const _pwSet = (v) => { try { localStorage.setItem(_PW_KEY, JSON.stringify(v)); } catch (e) {} };
const _pwDesc = (p) => { if (!p) return 'empty'; const o = _PW[p.t]; const r = p.r % o.order; return o.name + (o.pos[r] ? ' ' + (p.t === 'arrow' ? 'pointing ' : p.t === 'bar' ? '' : 'in the ') + o.pos[r] + (p.t === 'half' || p.t === 'corner' ? ' corner' : '') : ''); };
const _pwCanon = (p) => p.r % _PW[p.t].order;
function _pwSvg(p, size) {
  const o = _PW[p.t]; const rot = (p.r % 4) * 90;
  return `<svg viewBox="0 0 60 60" width="${size}" height="${size}" aria-hidden="true" focusable="false"><rect width="60" height="60" rx="6" fill="#fff7e6"/><g fill="${o.col}" transform="rotate(${rot} 30 30)" clip-path="url(#pwkc)">${o.d}</g><rect x=".75" y=".75" width="58.5" height="58.5" rx="6" fill="none" stroke="#8a5a1e" stroke-width="1.5"/></svg>`;
}
const _pwClone = (o) => JSON.parse(JSON.stringify(o));

function initPatternWorkshop(container) {
  const gs = gameState.patternworkshop;
  Object.assign(gs, { prefs: Object.assign({ size: 2, rotate: false }, _pwGet()), moves: 0, hints: 0, over: false });
  const onKey = (e) => {
    if (gameState.currentId !== 'patternworkshop' || gs.over || !gs.held || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.key === 'r' || e.key === 'R') { _pwTurn(1); e.preventDefault(); } else if (e.key === 'l' || e.key === 'L') { _pwTurn(-1); e.preventDefault(); }
  };
  document.addEventListener('keydown', onKey); window._gameCleanup = () => document.removeEventListener('keydown', onKey);
  _pwNew();
}
function _pwNew() {
  const gs = gameState.patternworkshop, n = gs.prefs.size, N = n * n, types = Object.keys(_PW);
  let target;
  do {
    target = Array.from({ length: N }, (_, i) => ({ t: types[Math.floor(Math.random() * types.length)], r: gs.prefs.rotate ? Math.floor(Math.random() * 4) : 0 }));
    if (n === 2) { const pool = types.slice().sort(() => Math.random() - .5); target = target.map((c, i) => ({ t: pool[i], r: c.r })); }
  } while (new Set(target.map((c) => c.t + _pwCanon(c))).size < Math.min(3, N));   // never a boring all-alike board
  gs.target = target; gs.board = Array(N).fill(null);
  // tray: the same pieces (so it is always solvable); with turns on, every piece starts a different way round, in shuffled order
  gs.tray = target.map((c, i) => ({ id: i, t: c.t, r: gs.prefs.rotate ? ((c.r + 1 + Math.floor(Math.random() * 3)) % 4) : c.r })).sort(() => Math.random() - .5);
  gs.held = null; gs.undo = []; gs.moves = 0; gs.hints = 0; gs.over = false; gs.msg = ''; gs.hintCell = -1; gs.pending = null;
  _pwRender();
}
const _pwSnap = () => { const g = gameState.patternworkshop; g.undo.push(_pwClone({ board: g.board, tray: g.tray, held: g.held })); if (g.undo.length > 200) g.undo.shift(); };
function _pwPickTray(id) {
  const g = gameState.patternworkshop; if (g.over) return; _pwSnap();
  if (g.held) g.tray.push(g.held.p);
  const k = g.tray.findIndex((p) => p.id === id); if (k < 0) { g.undo.pop(); return; }
  g.held = { p: g.tray.splice(k, 1)[0] }; g.msg = `Holding: ${_pwDesc(g.held.p)}. Now pick a square.`; g.hintCell = -1; _pwRender('pwk-held');
}
function _pwCell(i) {
  const g = gameState.patternworkshop; if (g.over) return; _pwSnap();
  const cur = g.board[i];
  if (g.held) {
    g.board[i] = g.held.p; g.held = null; if (cur) g.tray.push(cur); g.moves++;
    g.msg = `Placed in row ${Math.floor(i / g.prefs.size) + 1}, column ${i % g.prefs.size + 1}.`;
  } else if (cur) { g.held = { p: cur }; g.board[i] = null; g.msg = `Picked up: ${_pwDesc(cur)}.`; }
  else { g.undo.pop(); g.msg = 'Pick a piece from the tray first.'; return _pwRender(); }
  g.hintCell = -1; _pwRender(g.held ? 'pwk-held' : 'pwk-cell-' + i); _pwCheck();
}
function _pwTurn(dir) {
  const g = gameState.patternworkshop; if (g.over || !g.held) return;
  if (!g.prefs.rotate) { g.msg = 'Turning is off in this puzzle (see "Your choices").'; return _pwRender('pwk-held'); }
  _pwSnap(); g.held.p.r = (g.held.p.r + (dir > 0 ? 1 : 3)) % 4; g.msg = `Turned ${dir > 0 ? 'right' : 'left'}: ${_pwDesc(g.held.p)}.`; _pwRender(dir > 0 ? 'pwk-tr' : 'pwk-tl');
}
function _pwPutBack() { const g = gameState.patternworkshop; if (g.over || !g.held) return; _pwSnap(); g.tray.push(g.held.p); g.held = null; g.msg = 'Put back in the tray.'; _pwRender(); }
function _pwUndo() { const g = gameState.patternworkshop; if (g.over) return; if (!g.undo.length) { g.msg = 'Nothing to undo yet.'; return _pwRender(); } const s = g.undo.pop(); g.board = s.board; g.tray = s.tray; g.held = s.held; g.msg = 'Undone.'; g.hintCell = -1; _pwRender('pwk-undo'); }
function _pwReset() { const g = gameState.patternworkshop; if (g.over) return; _pwSnap(); const all = g.tray.concat(g.board.filter(Boolean)); if (g.held) all.push(g.held.p); g.board = g.board.map(() => null); g.tray = all.sort((a, b) => a.id - b.id); g.held = null; g.msg = 'Cleared the board. Undo brings it back.'; _pwRender(); }
function _pwMatch(i) { const b = gameState.patternworkshop.board[i], t = gameState.patternworkshop.target[i]; return !!b && b.t === t.t && _pwCanon(b) === _pwCanon(t); }
function _pwCheck() {
  const g = gameState.patternworkshop; if (g.board.some((c) => !c)) return;
  const wrong = g.board.map((_, i) => i).filter((i) => !_pwMatch(i));
  if (!wrong.length) { g.over = true; g.msg = ''; _pwRender(); return GameKit.finish('patternworkshop', true, `Pattern matched in ${g.moves} placement${g.moves === 1 ? '' : 's'}; ${g.hints} hint${g.hints === 1 ? '' : 's'} used.`); }
  g.msg = `${g.board.length - wrong.length} of ${g.board.length} squares match. Pick up any square to change it, or ask for a hint.`; _pwRender();
}
function _pwHint() {
  const g = gameState.patternworkshop; if (g.over) return; const w = g.board.map((_, i) => i).filter((i) => !_pwMatch(i)); if (!w.length) return;
  g.hints++; const i = w[0]; g.hintCell = i;
  const tt = g.target[i]; g.msg = `Hint: look at row ${Math.floor(i / g.prefs.size) + 1}, column ${i % g.prefs.size + 1}. The target there: ${_pwDesc(tt)}.`; _pwRender('pwk-hint');
}
function _pwShow() { const g = gameState.patternworkshop; if (g.over) return; g.over = true; g.board = g.target.map((t, i) => ({ id: i, t: t.t, r: t.r })); g.tray = []; g.held = null; g.msg = ''; _pwRender(); GameKit.finish('patternworkshop', false, 'Here is the finished pattern. A new one is ready whenever you like.'); }
function _pwChoice(k, v) {
  const g = gameState.patternworkshop; if (g.prefs[k] === v) return;
  const progress = g.undo.length || g.board.some(Boolean) || g.held;
  if (progress && !g.over) { g.pending = { k, v }; g.msg = ''; return _pwRender('pwk-confirm'); }
  g.prefs[k] = v; _pwSet(g.prefs); _pwNew();
}
function _pwConfirm(yes) { const g = gameState.patternworkshop, p = g.pending; g.pending = null; if (yes && p) { g.prefs[p.k] = p.v; _pwSet(g.prefs); return _pwNew(); } g.msg = 'Kept your puzzle as it was.'; _pwRender(); }
function _pwRender(focusId) {
  const _pf = document.activeElement && document.activeElement.id;
  const g = gameState.patternworkshop, el = document.getElementById('gameContent'); if (!el || gameState.currentId !== 'patternworkshop') return;
  const n = g.prefs.size, N = n * n;
  const grid = (cells, cls, fn) => `<div class="pwk-grid ${cls}" style="grid-template-columns:repeat(${n},1fr)">${cells.map(fn).join('')}</div>`;
  const targetHtml = grid(g.target, 'pwk-t', (c, i) => `<div class="pwk-c" role="img" aria-label="Target row ${Math.floor(i / n) + 1}, column ${i % n + 1}: ${_pwDesc(c)}">${_pwSvg(c, 60)}</div>`);
  const boardHtml = grid(g.board, 'pwk-b', (p, i) => `<button type="button" id="pwk-cell-${i}" class="pwk-c pwk-cb${g.hintCell === i ? ' pwk-hint' : ''}${p && g.over ? ' pwk-done' : ''}" onclick="_pwCell(${i})" ${g.over ? 'disabled' : ''} aria-label="Row ${Math.floor(i / n) + 1}, column ${i % n + 1}: ${_pwDesc(p)}${g.hintCell === i ? ' (hint: check this square)' : ''}">${p ? _pwSvg(p, 60) : '<span class="pwk-empty" aria-hidden="true">+</span>'}</button>`);
  const tray = g.tray.map((p) => `<button type="button" class="pwk-tp" onclick="_pwPickTray(${p.id})" aria-label="Piece: ${_pwDesc(p)}. Pick it up." ${g.over ? 'disabled' : ''}>${_pwSvg(p, 56)}</button>`).join('');
  const heldHtml = g.held ? `<div class="pwk-heldbox" id="pwk-held" tabindex="-1" aria-label="Holding ${_pwDesc(g.held.p)}">${_pwSvg(g.held.p, 64)}<div><b>Holding:</b> ${_pwDesc(g.held.p)}</div></div>` : `<div class="pwk-heldbox pwk-none">Nothing held. Pick a piece below.</div>`;
  const rot = g.prefs.rotate ? `<button type="button" class="pwk-btn" id="pwk-tl" onclick="_pwTurn(-1)" ${g.held ? '' : 'disabled'} aria-label="Turn left a quarter">&#8630; Turn left</button><button type="button" class="pwk-btn" id="pwk-tr" onclick="_pwTurn(1)" ${g.held ? '' : 'disabled'} aria-label="Turn right a quarter">Turn right &#8631;</button>` : '';
  const seg = (k, vals) => `<div class="pwk-seg" role="group" aria-label="${k === 'size' ? 'Board size' : 'Quarter turns'}">${vals.map(([v, t]) => `<button type="button" aria-pressed="${g.prefs[k] === v}" onclick="_pwChoice('${k}',${v})">${t}</button>`).join('')}</div>`;
  const confirm = g.pending ? `<div class="pwk-confirm" id="pwk-confirm" tabindex="-1" role="alertdialog" aria-label="Change your puzzle?">Changing this starts a new puzzle and your current one is lost.<div class="pwk-row"><button type="button" class="pwk-btn pwk-main" onclick="_pwConfirm(true)">Start a new puzzle</button><button type="button" class="pwk-btn" onclick="_pwConfirm(false)">Keep my puzzle</button></div></div>` : '';
  const ex = g.prefs.rotate ? `<details class="pwk-ex"><summary>Rule example: turning a piece</summary><div class="pwk-row">${_pwSvg({ t: 'arrow', r: 0 }, 56)}<span>turn right once</span>${_pwSvg({ t: 'arrow', r: 1 }, 56)}<span>An arrow that pointed up now points right. Each press is one quarter turn.</span></div></details>` : `<details class="pwk-ex"><summary>How this works</summary><p style="margin:.4em 0 0">Copy the target. Pick a piece from the tray, then pick the square where it goes. Pieces are already the right way round. You can turn pieces on in "Your choices".</p></details>`;
  el.innerHTML = `<div class="pwk" dir="ltr"><svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><clipPath id="pwkc"><rect width="60" height="60" rx="6"/></clipPath></defs></svg>
    <h3 class="pwk-h">Copy this pattern</h3>${ex}
    <div class="pwk-boards"><div><div class="pwk-lab" id="pwk-tlab">Target (stays visible)</div>${targetHtml}</div><div><div class="pwk-lab">Your pattern</div>${boardHtml}</div></div>
    ${confirm}<div class="pwk-msg" role="status" aria-live="polite">${g.msg || (g.over ? 'Pattern complete.' : 'Pick a piece, then a square.')}</div>
    ${heldHtml}<div class="pwk-row">${rot}<button type="button" class="pwk-btn" onclick="_pwPutBack()" ${g.held ? '' : 'disabled'}>Put back</button></div>
    <div class="pwk-lab">Tray</div><div class="pwk-tray">${tray || '<span class="pwk-none">The tray is empty.</span>'}</div>
    <div class="pwk-row"><button type="button" class="pwk-btn" id="pwk-undo" onclick="_pwUndo()">Undo</button><button type="button" class="pwk-btn" onclick="_pwReset()">Reset</button><button type="button" class="pwk-btn" id="pwk-hint" onclick="_pwHint()">Show a hint</button><button type="button" class="pwk-btn" onclick="_pwShow()">Show answer</button><button type="button" class="pwk-btn" onclick="_pwNew()">New puzzle</button></div>
    <div class="pwk-card"><b>Your choices</b><div class="pwk-row"><span>Board:</span>${seg('size', [[2, '2 x 2'], [3, '3 x 3']])}</div><div class="pwk-row"><span>Quarter turns:</span>${seg('rotate', [[false, 'Off'], [true, 'On']])}</div><p class="pwk-fine">Choices are kept in this browser only. Changing one asks before it replaces your puzzle.</p></div>
    <p class="pwk-fine">For entertainment and practice. Not a medical test or treatment.</p><p class="pwk-fine pwk-art">Read more: <a href="article-the-pleasure-of-being-a-beginner.html">The pleasure of being a beginner</a> &middot; <a href="article-let-the-player-choose.html">Let the player choose</a></p></div>
    <style>
  .pwk-art a{display:inline-flex;align-items:center;min-height:44px;font-weight:700}
    .pwk{width:100%;box-sizing:border-box;max-width:34rem;margin:0 auto;color:#2b1b0d;font-size:1.08rem;line-height:1.4}
    .pwk-h{font:800 1.3rem Georgia,serif;margin:.1em 0 .4em}
    .pwk-boards{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin:10px 0}
    .pwk-lab{font-weight:800;margin:.3em 0}
    .pwk-grid{display:grid;gap:6px;background:#6b4220;padding:8px;border-radius:12px;width:max-content;max-width:100%}
    .pwk-c{width:60px;height:60px;padding:0;border:0;border-radius:6px;background:#fff7e6;display:block}
    .pwk-cb{cursor:pointer;min-width:60px;min-height:60px}.pwk-cb:focus-visible,.pwk-btn:focus-visible,.pwk-tp:focus-visible,.pwk-seg button:focus-visible,.pwk-heldbox:focus-visible,.pwk-confirm:focus-visible{outline:4px solid #1a56b0;outline-offset:2px}
    .pwk-cb[disabled]{cursor:default;opacity:1}.pwk-empty{font:700 1.6rem Georgia;color:#8a5a1e}
    .pwk-hint{outline:4px dashed #1a56b0;outline-offset:-2px}.pwk-done{box-shadow:0 0 0 3px #2e7a35 inset}
    .pwk-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
    .pwk-btn,.pwk-seg button{min-height:48px;min-width:48px;border-radius:12px;border:2px solid #8a5a1e;background:#fff7e6;color:#2b1b0d;font:800 1.02rem/1.2 Georgia,serif;padding:6px 14px;cursor:pointer}
    .pwk-btn[disabled]{opacity:.5;cursor:default}.pwk-main,.pwk-seg button[aria-pressed="true"]{background:#1a365d;color:#fff;border-color:#1a365d}
    .pwk-seg{display:inline-flex;gap:6px}
    .pwk-tray{display:flex;flex-wrap:wrap;gap:8px;min-height:64px;padding:8px;border:2px dashed #c9a46a;border-radius:12px}
    .pwk-tp{width:64px;height:64px;padding:2px;border:2px solid #8a5a1e;border-radius:10px;background:#fff7e6;cursor:pointer}.pwk-tp[disabled]{cursor:default}
    .pwk-heldbox{display:flex;gap:10px;align-items:center;min-height:68px;padding:6px 10px;border:2px solid #1a365d;border-radius:12px;background:#eef4ff}.pwk-none{border-color:#c9a46a;background:#fff7e6;color:#5b4630}
    .pwk-msg{min-height:2.8em;font-weight:700;margin:6px 0}.pwk-card,.pwk-ex,.pwk-confirm{border:2px solid #c9a46a;border-radius:12px;background:#fffaf0;padding:10px 12px;margin:10px 0}.pwk-ex summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:800}
    .pwk-confirm{border-color:#b5471f;background:#fff0e8}.pwk-fine,.pwk-none{font-size:.95rem;color:#5b4630}
    @media (max-width:420px){.pwk-c{width:56px;height:56px}.pwk-cb{min-width:56px;min-height:56px}.pwk-c svg{width:56px;height:56px}}
    @media (max-width:420px){.pwk-boards{gap:8px;flex-wrap:nowrap}.pwk-t{gap:3px;padding:5px}.pwk-t .pwk-c,.pwk-t .pwk-c svg{width:38px;height:38px}.pwk-b{gap:4px;padding:5px}.pwk-boards .pwk-lab{font-size:.9rem}}
    @media (max-width:360px){.pwk-boards{flex-wrap:wrap}}
    </style>`;
  { const f = document.getElementById(focusId || _pf); if (f) f.focus(); }   // keep keyboard focus on the same control across re-renders
}
