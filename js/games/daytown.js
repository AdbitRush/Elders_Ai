// ════════════════════════════════════════════════════════════════════════
// A DAY IN TOWN (2026-11, review) - a small made-up town with two ways to play. Linked articles: "a plan you can change", "a small map to explore".
// PLAN: put 3-5 errands in order so that a few stated rules are met (A before B; be at a place by step N; finish at the Park). Every puzzle is built
//   FROM a known valid route, and the solver below enumerates every order, so it always has an answer; any valid order is accepted. No clock, no penalties.
// MAP (Wayfinder): follow an indicated route across a little grid past three landmarks to the destination with big arrow buttons or the arrow keys.
//   Map visible by default; optional hide-and-reveal with unlimited reminders. A wrong turn is explained and never moves you. Three routes per session.
// No real place, no driving, no appointments, medicines or money. Not a test of everyday ability. Entertainment and practice. Not a medical test or treatment.
// Controls are all buttons (map pieces have a numbered list as a full equivalent). Choices (mode, stage, show-route) stay in this browser only.
// ════════════════════════════════════════════════════════════════════════
const _DT_STOPS = {
  library: { name: 'Library', short: 'the Library', errand: 'return your book', x: 14, y: 24 },
  market: { name: 'Market', short: 'the Market', errand: 'buy some fruit', x: 50, y: 12 },
  picnic: { name: 'Picnic shop', short: 'the Picnic shop', errand: 'collect the picnic basket', x: 86, y: 30 },
  bakery: { name: 'Bakery', short: 'the Bakery', errand: 'pick up some bread', x: 24, y: 78 },
  park: { name: 'Park', short: 'the Park', errand: 'rest on a bench', x: 78, y: 76 },
};
const _DT_HOME = { x: 50, y: 48 };
const _DT_KEY = 'bp-dt-prefs';
const _dtGet = () => { try { return JSON.parse(localStorage.getItem(_DT_KEY)) || {}; } catch (e) { return {}; } };
const _dtSet = (v) => { try { localStorage.setItem(_DT_KEY, JSON.stringify(v)); } catch (e) {} };
const _dtDist = (a, b) => Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 0.5);
function _dtLen(order) { let d = 0, p = _DT_HOME; order.forEach((id) => { d += _dtDist(p, _DT_STOPS[id]); p = _DT_STOPS[id]; }); return d; }
function _dtPerms(a) { if (a.length <= 1) return [a.slice()]; const out = []; a.forEach((x, i) => _dtPerms(a.slice(0, i).concat(a.slice(i + 1))).forEach((r) => out.push([x].concat(r)))); return out; }
const _dtShuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// ---- rules ----------------------------------------------------------------
function _dtRuleText(c) {
  if (c.k === 'before') return `${_dtCap(_DT_STOPS[c.a].errand)} (${_DT_STOPS[c.a].name}) before ${_DT_STOPS[c.b].short}.`;
  if (c.k === 'by') return `${_DT_STOPS[c.a].short.replace(/^the /, 'The ')} closes after step ${c.n}, so ${_DT_STOPS[c.a].errand} (${_DT_STOPS[c.a].name}) by step ${c.n}.`;
  return `Finish at ${_DT_STOPS[c.a].short}.`;
}
const _dtCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function _dtFails(route, cons) {   // [] when every rule holds; each message names what the submitted order did
  const pos = (id) => route.indexOf(id) + 1, out = [];
  cons.forEach((c) => {
    if (c.k === 'before' && !(pos(c.a) < pos(c.b))) out.push(`Rule not met: "${_dtRuleText(c)}" In your route ${_DT_STOPS[c.a].short} is step ${pos(c.a)} and ${_DT_STOPS[c.b].short} is step ${pos(c.b)}.`);
    if (c.k === 'by' && !(pos(c.a) <= c.n)) out.push(`Rule not met: "${_dtRuleText(c)}" In your route you reach ${_DT_STOPS[c.a].short} at step ${pos(c.a)}.`);
    if (c.k === 'last' && route[route.length - 1] !== c.a) out.push(`Rule not met: "${_dtRuleText(c)}" Your route ends at ${_DT_STOPS[route[route.length - 1]].short}.`);
  });
  return out;
}
function _dtMakePuzzle(stage) {
  const n = stage === 1 ? 3 : stage === 2 ? 4 : 5, ids = Object.keys(_DT_STOPS);
  for (let t = 0; t < 400; t++) {
    const stops = _dtShuf(ids).slice(0, n); if (!stops.includes('park')) stops[0] = 'park';
    const sol = _dtShuf(stops); sol.push(sol.splice(sol.indexOf('park'), 1)[0]);   // the Park is last in the built route
    const cons = [{ k: 'last', a: 'park' }];
    const pairs = []; for (let i = 0; i < n - 1; i++) for (let j = i + 1; j < n - 1; j++) pairs.push([sol[i], sol[j]]);   // not involving the final stop (a "before the Park" rule is implied by "finish at the Park")
    if (stage === 1) { if (!pairs.length) continue; const [a, b] = pairs[Math.floor(Math.random() * pairs.length)]; cons.push({ k: 'before', a, b }); }
    if (stage === 2) { if (!pairs.length) continue; const [a, b] = pairs[Math.floor(Math.random() * pairs.length)]; cons.push({ k: 'before', a, b }); const i = Math.floor(Math.random() * (n - 1)); cons.push({ k: 'by', a: sol[i], n: i + 1 + (i < n - 2 ? 1 : 0) }); }
    if (stage === 3) { if (pairs.length < 2) continue; const sh = _dtShuf(pairs); cons.push({ k: 'before', a: sh[0][0], b: sh[0][1] }); const i = Math.floor(Math.random() * (n - 1)); cons.push({ k: 'by', a: sol[i], n: i + 1 + (i < n - 2 ? 1 : 0) }); }
    if (_dtFails(sol, cons).length) continue;   // the built route must satisfy its own rules
    const valid = _dtPerms(stops).filter((r) => !_dtFails(r, cons).length);
    if (!valid.length || valid.length > (n === 3 ? 2 : n === 4 ? 6 : 14)) continue;   // feasible, and the rules actually matter
    const best = valid.reduce((m, r) => Math.min(m, _dtLen(r)), 1e9);
    return { stops, cons, sol, validCount: valid.length, best };
  }
  const stops = ['library', 'market', 'park'].slice(0, n); return { stops, cons: [{ k: 'last', a: 'park' }], sol: stops, validCount: 2, best: _dtLen(stops) };
}
// ---- map (Wayfinder) ------------------------------------------------------
const _DM = { W: 6, H: 6 };
const _DM_DIRS = { up: [0, -1, 'up', '↑'], down: [0, 1, 'down', '↓'], left: [-1, 0, 'left', '←'], right: [1, 0, 'right', '→'] };
const _DM_LAND = [{ id: 'fountain', name: 'the fountain', glyph: 'F', shape: 'circle' }, { id: 'bakery', name: 'the bakery', glyph: 'B', shape: 'square' }, { id: 'clock', name: 'the clock tower', glyph: 'C', shape: 'triangle' }];
function _dmBfs(start, goal, walls) {
  const key = (p) => p[0] + ',' + p[1], q = [start], prev = { [key(start)]: null };
  while (q.length) { const c = q.shift(); if (c[0] === goal[0] && c[1] === goal[1]) break; _dtShuf(Object.keys(_DM_DIRS)).forEach((d) => { const v = _DM_DIRS[d], n = [c[0] + v[0], c[1] + v[1]]; if (n[0] < 0 || n[1] < 0 || n[0] >= _DM.W || n[1] >= _DM.H || walls.has(key(n)) || key(n) in prev) return; prev[key(n)] = { from: c, d }; q.push(n); }); }
  if (!(key(goal) in prev)) return null;
  const dirs = []; let c = goal; while (prev[key(c)]) { dirs.unshift(prev[key(c)].d); c = prev[key(c)].from; } return dirs;
}
function _dmMake() {
  for (let t = 0; t < 400; t++) {
    const cells = _dtShuf([].concat(...Array.from({ length: _DM.H }, (_, y) => Array.from({ length: _DM.W }, (_, x) => [x, y]))));
    const S = cells[0], L = [cells[1], cells[2], cells[3]], D = cells[4], walls = new Set(cells.slice(5, 11).map((p) => p[0] + ',' + p[1]));
    const legs = [S, L[0], L[1], L[2], D]; let route = [], marks = []; let ok = true;
    for (let i = 0; i < 4; i++) { const d = _dmBfs(legs[i], legs[i + 1], walls); if (!d) { ok = false; break; } route = route.concat(d); marks.push(route.length); }
    if (!ok || route.length < 8 || route.length > 18) continue;
    return { S, L, D, walls, route, marks, land: _dtShuf(_DM_LAND) };
  }
  return null;
}
// ---- shell ------------------------------------------------------------------
function initDayTown(container) {
  const g = gameState.daytown;
  Object.assign(g, { prefs: Object.assign({ mode: 'plan', stage: 1, showRoute: true }, _dtGet()), over: false, phase: 'start', timers: [] });
  const onKey = (e) => {
    if (gameState.currentId !== 'daytown' || g.phase !== 'map' || g.over || e.ctrlKey || e.metaKey || e.altKey) return;
    const d = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key]; if (d && !(e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))) { _dmMove(d); e.preventDefault(); }
  };
  document.addEventListener('keydown', onKey);
  window._gameCleanup = () => { document.removeEventListener('keydown', onKey); (g.timers || []).forEach(clearTimeout); };
  _dtStart();
}
function _dtStyle() {
  return `<style>
  .dtn-art a{display:inline-flex;align-items:center;min-height:44px;font-weight:700}
  .dtn{width:100%;box-sizing:border-box;max-width:36rem;margin:0 auto;color:#2b1b0d;font-size:1.08rem;line-height:1.4}
  .dtn h3{font:800 1.3rem/1.25 Georgia,serif;margin:.2em 0 .5em}
  .dtn-card{border:2px solid #c9a46a;border-radius:14px;background:#fffaf0;padding:12px 14px;margin:0 0 12px}
  .dtn-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
  .dtn-btn,.dtn-seg button{min-height:48px;min-width:48px;border-radius:12px;border:2px solid #8a5a1e;background:#fff7e6;color:#2b1b0d;font:800 1.02rem/1.2 Georgia,serif;padding:6px 14px;cursor:pointer}
  .dtn-btn[disabled]{opacity:.5;cursor:default}.dtn-main,.dtn-seg button[aria-pressed="true"]{background:#1a365d;color:#fff;border-color:#1a365d}
  .dtn-seg{display:inline-flex;gap:6px;flex-wrap:wrap}
  .dtn button:focus-visible,.dtn [tabindex="-1"]:focus-visible{outline:4px solid #1a56b0;outline-offset:2px}
  .dtn-rules{margin:.2em 0 .6em;padding-left:1.2em}.dtn-rules li{margin:.2em 0}
  .dtn-map{position:relative;width:100%;aspect-ratio:3/2;border:3px solid #8a5a1e;border-radius:14px;background:#e8f0d4;overflow:hidden}
  .dtn-map svg{position:absolute;inset:0;width:100%;height:100%}
  .dtn-pos{position:absolute;transform:translate(-50%,-50%)}
  .dtn-stop{min-width:64px;min-height:52px;padding:4px 6px;border-radius:12px;border:2px solid #8a5a1e;background:#fff7e6;color:#2b1b0d;font:800 .88rem/1.1 Georgia,serif;cursor:pointer;text-align:center}
  .dtn-stop[aria-pressed="true"]{background:#1a365d;color:#fff;border-color:#1a365d}
  .dtn-home{position:absolute;transform:translate(-50%,-50%);font:800 .8rem Georgia,serif;background:#fff;border:2px dashed #8a5a1e;border-radius:10px;padding:2px 6px}
  .dtn-route{margin:0 0 8px;padding:0;list-style:none;display:grid;gap:6px}.dtn-route li{display:flex;flex-wrap:wrap;gap:6px;align-items:center;border:2px solid #c9a46a;border-radius:12px;background:#fff7e6;padding:6px 10px}
  .dtn-route li b{min-width:5.2em}.dtn-msg{min-height:3.2em;font-weight:700;margin:6px 0}.dtn-fine{font-size:.95rem;color:#5b4630}
  .dtn-grid{display:grid;grid-template-columns:repeat(${_DM.W},1fr);gap:3px;background:#6b4220;padding:5px;border-radius:12px}
  .dtn-cell{aspect-ratio:1;min-height:44px;background:#f4efd8;border-radius:6px;position:relative;display:flex;align-items:center;justify-content:center;font:900 1rem Georgia,serif}
  .dtn-wall{background:#4d7a4a;color:#fff}.dtn-path{background:#ffe9a8}.dtn-me::after{content:"";position:absolute;inset:18%;border-radius:50%;background:#1a365d;border:3px solid #fff}
  .dtn-pad{display:grid;grid-template-columns:repeat(3,64px);grid-template-areas:". u ." "l . r" ". d .";gap:8px;justify-content:center;margin:10px 0}
  .dtn-pad button{min-width:64px;min-height:64px;font-size:1.6rem}.dtn-u{grid-area:u}.dtn-l{grid-area:l}.dtn-r{grid-area:r}.dtn-d{grid-area:d}
  .dtn-legend{margin:8px 0 0}
  </style>`;
}
function _dtShell(inner) { const el = document.getElementById('gameContent'); if (!el || gameState.currentId !== 'daytown') return null; el.innerHTML = `<div class="dtn" dir="ltr">${inner}<p class="dtn-fine">A made-up town. For entertainment and practice. Not a medical test or treatment.</p><p class="dtn-fine dtn-art">Read more: <a href="article-a-plan-you-can-change.html">A plan is something you can change</a> &middot; <a href="article-a-small-map-to-explore.html">A small map to explore</a></p></div>${_dtStyle()}`; return el; }
function _dtSeg(label, key, vals) {
  const g = gameState.daytown;
  return `<div class="dtn-card"><div id="dtn-l-${key}"><b>${label}</b></div><div class="dtn-seg" role="group" aria-labelledby="dtn-l-${key}">${vals.map(([v, t]) => `<button type="button" aria-pressed="${g.prefs[key] === v}" onclick="_dtPref('${key}',${typeof v === 'string' ? `'${v}'` : v})">${t}</button>`).join('')}</div></div>`;
}
function _dtPref(k, v) {
  const g = gameState.daytown;
  if (g.phase !== 'start' && (g.progress && g.progress())) { g.pending = { k, v }; return _dtAskChange(); }
  g.prefs[k] = v; _dtSet(g.prefs); if (g.phase === 'start') _dtStart(); else _dtBegin();
}
function _dtAskChange() {
  const box = document.getElementById('dtn-confirm'); if (box) box.remove();
  const g = gameState.daytown; const host = document.querySelector('.dtn'); if (!host) return;
  host.insertAdjacentHTML('afterbegin', `<div class="dtn-card" id="dtn-confirm" tabindex="-1" role="alertdialog" aria-label="Change your game?" style="border-color:#b5471f;background:#fff0e8">Changing this starts a new puzzle and your current one is lost.<div class="dtn-row"><button type="button" class="dtn-btn dtn-main" onclick="_dtConfirm(true)">Start a new puzzle</button><button type="button" class="dtn-btn" onclick="_dtConfirm(false)">Keep my puzzle</button></div></div>`);
  const b = document.getElementById('dtn-confirm'); if (b) b.focus();
}
function _dtConfirm(yes) { const g = gameState.daytown, p = g.pending; g.pending = null; if (yes && p) { g.prefs[p.k] = p.v; _dtSet(g.prefs); return _dtBegin(); } const b = document.getElementById('dtn-confirm'); if (b) b.remove(); }
function _dtStart() {
  const g = gameState.daytown; g.phase = 'start'; g.progress = null; (g.timers || []).forEach(clearTimeout);
  _dtShell(`<h3 tabindex="-1" id="dtn-h">A Day in Town</h3>
    <div class="dtn-card"><p style="margin:0">Two small puzzles in a made-up town. <b>Plan</b>: put a few errands in order so that the rules fit. <b>Map</b>: follow a route on a small map. There is no clock, you can change your mind as often as you like, and you can always be shown a solution.</p></div>
    <h3 style="font-size:1.1rem">Your choices</h3>
    ${_dtSeg('What would you like to do?', 'mode', [['plan', 'Plan errands'], ['map', 'Follow a map']])}
    ${g.prefs.mode === 'plan' ? _dtSeg('How many errands?', 'stage', [[1, '3 errands'], [2, '4 errands'], [3, '5 errands']]) : _dtSeg('Show the route on the map?', 'showRoute', [[true, 'Always show it'], [false, 'Hide it (show again any time)']])}
    <div class="dtn-row"><button type="button" class="dtn-btn dtn-main" id="dtn-go" onclick="_dtBegin()">Start</button></div>`);
}
function _dtBegin() { const g = gameState.daytown; g.over = false; g.session = { n: 0, firstTry: 0, shown: 0, done: 0 }; if (g.prefs.mode === 'plan') _dtPlanNew(); else _dmNew(); }
// ---- PLAN -------------------------------------------------------------------
function _dtPlanNew() {
  const g = gameState.daytown; g.phase = 'plan'; g.puz = _dtMakePuzzle(+g.prefs.stage); g.route = []; g.undo = []; g.msg = ''; g.solved = false; g.shownSol = false; g.tries = 0; g.preview = false; g.firstOk = null;
  g.progress = () => g.route.length > 0 && !g.solved; _dtPlanRender('dtn-h');
}
const _dtSnap = () => { const g = gameState.daytown; g.undo.push(g.route.slice()); if (g.undo.length > 200) g.undo.shift(); };
function _dtAdd(id) {
  const g = gameState.daytown; if (g.solved || g.shownSol) return;
  if (g.route.includes(id)) { g.msg = `${_DT_STOPS[id].short.replace(/^the /, 'The ')} is already in your route (step ${g.route.indexOf(id) + 1}). Each stop is visited once - use Remove to take it out.`; return _dtPlanRender('dtn-msg'); }
  _dtSnap(); g.route.push(id); g.msg = `Added: ${_DT_STOPS[id].name} (step ${g.route.length}).`; g.preview = false; _dtPlanRender('dtn-msg');
}
function _dtMove(i, d) { const g = gameState.daytown; if (g.solved || g.shownSol) return; const j = i + d; if (j < 0 || j >= g.route.length) return; _dtSnap(); const t = g.route[i]; g.route[i] = g.route[j]; g.route[j] = t; g.msg = `Moved ${_DT_STOPS[t].name} to step ${j + 1}.`; g.preview = false; _dtPlanRender(`dtn-${d < 0 ? 'up' : 'dn'}-${j}`); }
function _dtRemove(i) { const g = gameState.daytown; if (g.solved || g.shownSol) return; _dtSnap(); const t = g.route.splice(i, 1)[0]; g.msg = `Removed ${_DT_STOPS[t].name}.`; g.preview = false; _dtPlanRender('dtn-msg'); }
function _dtUndo() { const g = gameState.daytown; if (g.solved || g.shownSol) return; if (!g.undo.length) { g.msg = 'Nothing to undo yet.'; return _dtPlanRender('dtn-undo'); } g.route = g.undo.pop(); g.msg = 'Undone.'; g.preview = false; _dtPlanRender('dtn-undo'); }
function _dtReset() { const g = gameState.daytown; if (g.solved || g.shownSol) return; _dtSnap(); g.route = []; g.msg = 'Route cleared. Undo brings it back.'; g.preview = false; _dtPlanRender('dtn-msg'); }
function _dtPreview() { const g = gameState.daytown; if (!g.route.length) { g.msg = 'Add a stop first, then preview the route.'; return _dtPlanRender('dtn-msg'); } g.preview = true; g.msg = `Preview: ${g.route.map((id) => _DT_STOPS[id].name).join(' → ')}. Distance so far: ${_dtLen(g.route)} map units.`; _dtPlanRender('dtn-msg'); }
function _dtTry() {
  const g = gameState.daytown; if (g.solved || g.shownSol) return; g.tries++;
  const need = g.puz.stops.length;
  if (g.route.length !== need) { g.msg = `Your route needs all ${need} stops and has ${g.route.length}. Add the ones that are missing.`; return _dtPlanRender('dtn-msg'); }
  const fails = _dtFails(g.route, g.puz.cons);
  if (fails.length) { g.msg = fails.join(' '); return _dtPlanRender('dtn-msg'); }
  g.solved = true; g.firstOk = g.tries === 1; const d = _dtLen(g.route);
  g.msg = `That route works. Its length is ${d} map units.${d > g.puz.best ? ` A shorter valid route exists (${g.puz.best} units) - you can try for it, or carry on.` : ' It is also the shortest valid route.'} Any route that follows the rules is a good one.`;
  g.session.done++; if (g.firstOk) g.session.firstTry++; g.session.n++; _dtPlanRender('dtn-next');
}
function _dtShow() { const g = gameState.daytown; if (g.solved || g.shownSol) return; g.shownSol = true; g.route = g.puz.sol.slice(); g.preview = true; g.msg = `One valid route is shown: ${g.route.map((id) => _DT_STOPS[id].name).join(' → ')} (${_dtLen(g.route)} units).`; g.session.shown++; g.session.n++; _dtPlanRender('dtn-next'); }
function _dtTryShorter() { const g = gameState.daytown; if (!g.solved) return; g.solved = false; g.session.done--; if (g.firstOk) g.session.firstTry--; g.session.n--; g.tries = 0; g.msg = 'Take your time: rearrange the stops and press Try this route when you are ready.'; _dtPlanRender('dtn-msg'); }
function _dtNext() {
  const g = gameState.daytown; if (!(g.solved || g.shownSol)) return;
  if (g.session.n >= 3) return _dtDone(true); _dtPlanNew();
}
function _dtDone(complete) {
  const g = gameState.daytown; if (g.over) return; g.over = true; g.phase = 'done'; const s = g.session;
  const what = g.prefs.mode === 'plan' ? 'route' : 'map route';
  const text = g.prefs.mode === 'plan'
    ? `${s.n} route${s.n === 1 ? '' : 's'} finished${complete ? '' : ' (round ended early)'}; ${s.firstTry} worked on the first try; ${s.shown} shown.`
    : `${s.n} ${what}${s.n === 1 ? '' : 's'} finished${complete ? '' : ' (round ended early)'}; ${s.firstTry} followed with no wrong turn or reminder; ${s.n - s.firstTry} used a reminder or a wrong turn.`;
  _dtShell(`<h3 tabindex="-1" id="dtn-h">${complete ? 'Three routes done' : 'Round ended'}</h3><div class="dtn-card" role="status"><p style="margin:0;font-weight:700">${text}</p><p style="margin:.5em 0 0">These are counts for this round only. They say nothing about everyday skills.</p></div><div class="dtn-row"><button type="button" class="dtn-btn dtn-main" onclick="loadGame('daytown')">Play again</button><button type="button" class="dtn-btn" onclick="showHome()">Menu</button></div>`);
  const h = document.getElementById('dtn-h'); if (h) h.focus(); GameKit.finish('daytown', complete, text);
}
function _dtEnd() { const g = gameState.daytown; if (g.over) return; (g.timers || []).forEach(clearTimeout); _dtDone(false); }
function _dtPlanRender(focusId) {
  const _pf = document.activeElement && document.activeElement.id;
  const g = gameState.daytown, p = g.puz; if (gameState.currentId !== 'daytown') return;
  const done = g.solved || g.shownSol;
  const pts = g.route.map((id) => _DT_STOPS[id]);
  const line = g.preview && pts.length ? `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="#1a365d" stroke-width="1.4" stroke-dasharray="3 2" points="${[_DT_HOME].concat(pts).map((q) => `${q.x},${q.y}`).join(' ')}"/></svg>` : '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 48H100M50 0V100M14 24L50 48L86 30M24 78L50 48L78 76" stroke="#c9b48a" stroke-width="2" fill="none"/></svg>';
  const nodes = p.stops.map((id) => { const s = _DT_STOPS[id], inr = g.route.indexOf(id) + 1; return `<span class="dtn-pos" style="left:${s.x}%;top:${s.y}%"><button type="button" class="dtn-stop" aria-pressed="${inr > 0}" onclick="_dtAdd('${id}')" ${done ? 'disabled' : ''} aria-label="${s.name}: ${s.errand}${inr ? ', in your route at step ' + inr : ', not in your route'}">${s.name}${inr ? ' (' + inr + ')' : ''}</button></span>`; }).join('');   // wrapper: the site's #gameContent button{position:relative} would otherwise override absolute placement
  const list = p.stops.map((id) => { const s = _DT_STOPS[id], inr = g.route.includes(id); return `<button type="button" class="dtn-btn" onclick="_dtAdd('${id}')" ${done || inr ? 'disabled' : ''}>Add ${s.name}</button>`; }).join('');
  const route = g.route.map((id, i) => `<li><b>Step ${i + 1}</b> ${_DT_STOPS[id].name}<button type="button" class="dtn-btn" id="dtn-up-${i}" onclick="_dtMove(${i},-1)" ${done || i === 0 ? 'disabled' : ''} aria-label="Move ${_DT_STOPS[id].name} earlier">Earlier</button><button type="button" class="dtn-btn" id="dtn-dn-${i}" onclick="_dtMove(${i},1)" ${done || i === g.route.length - 1 ? 'disabled' : ''} aria-label="Move ${_DT_STOPS[id].name} later">Later</button><button type="button" class="dtn-btn" onclick="_dtRemove(${i})" ${done ? 'disabled' : ''} aria-label="Remove ${_DT_STOPS[id].name}">Remove</button></li>`).join('');
  _dtShell(`<div class="dtn-row" style="justify-content:space-between"><b>Route ${Math.min(g.session.n + (done ? 0 : 1), 3)} of 3</b><button type="button" class="dtn-btn" onclick="_dtEnd()">End round</button></div>
    <h3 tabindex="-1" id="dtn-h">Plan your day: ${p.stops.length} errands</h3>
    <div class="dtn-card"><b>The rules</b> (they stay here)<ul class="dtn-rules">${p.cons.map((c) => `<li>${_dtRuleText(c)}</li>`).join('')}</ul>Visit every stop once. Any order that follows the rules is accepted.</div>
    <div class="dtn-map" aria-label="Map of the town (the buttons below are the same stops)">${line}<span class="dtn-home" style="left:${_DT_HOME.x}%;top:${_DT_HOME.y}%">Start</span>${nodes}</div>
    <div class="dtn-row" role="group" aria-label="Add a stop">${list}</div>
    <h3 style="font-size:1.1rem">Your route</h3><ol class="dtn-route" aria-label="Your route, in order" style="list-style:none">${route || '<li style="border-style:dashed;color:#5b4630">No stops yet. Pick a stop on the map or press an Add button.</li>'}</ol>
    <div class="dtn-msg" id="dtn-msg" tabindex="-1" role="status" aria-live="polite">${g.msg || 'Pick the stops in the order you want to visit them.'}</div>
    <div class="dtn-row"><button type="button" class="dtn-btn dtn-main" onclick="_dtTry()" ${done ? 'disabled' : ''}>Try this route</button><button type="button" class="dtn-btn" onclick="_dtPreview()" ${done ? 'disabled' : ''}>Preview route</button><button type="button" class="dtn-btn" id="dtn-undo" onclick="_dtUndo()" ${done ? 'disabled' : ''}>Undo</button><button type="button" class="dtn-btn" onclick="_dtReset()" ${done ? 'disabled' : ''}>Reset</button><button type="button" class="dtn-btn" onclick="_dtShow()" ${done ? 'disabled' : ''}>Show a solution</button></div>
    ${done ? `<div class="dtn-row"><button type="button" class="dtn-btn dtn-main" id="dtn-next" onclick="_dtNext()">${g.session.n >= 3 ? 'Finish' : 'Next route'}</button>${g.solved && _dtLen(g.route) > p.best ? '<button type="button" class="dtn-btn" onclick="_dtTryShorter()">Try for a shorter route</button>' : ''}</div>` : ''}
    <div class="dtn-card"><b>Your choices</b>${_dtInlineSeg()}</div>`);
  { const f = document.getElementById(focusId || _pf); if (f) f.focus(); }   // keep keyboard focus on the same control across re-renders
}
function _dtInlineSeg() { const g = gameState.daytown; return `<div class="dtn-row"><span>Errands:</span><div class="dtn-seg" role="group" aria-label="Number of errands">${[[1, '3'], [2, '4'], [3, '5']].map(([v, t]) => `<button type="button" aria-pressed="${g.prefs.stage === v}" onclick="_dtPref('stage',${v})">${t}</button>`).join('')}</div></div><p class="dtn-fine" style="margin:0">Kept in this browser only. Changing it starts a new puzzle and asks first.</p>`; }
// ---- MAP --------------------------------------------------------------------
function _dmNew() {
  const g = gameState.daytown; g.phase = 'map'; const m = _dmMake(); g.map = m; g.pos = m.S.slice(); g.step = 0; g.misses = 0; g.reminders = 0; g.mdone = false; g.shownRoute = g.prefs.showRoute !== false; g.msg = ''; g.replaying = false; g.visited = 0;
  g.progress = () => (g.step > 0 || g.misses > 0) && !g.mdone; _dmRender('dtn-h');
}
function _dmCells() { const g = gameState.daytown, m = g.map, key = (p) => p[0] + ',' + p[1]; const pathSet = new Set(); let c = m.S.slice(); pathSet.add(key(c)); m.route.forEach((d) => { c = [c[0] + _DM_DIRS[d][0], c[1] + _DM_DIRS[d][1]]; pathSet.add(key(c)); }); return { key, pathSet }; }
function _dmDescribe() { const g = gameState.daytown, m = g.map, out = []; let last = 0; const names = m.land.map((l) => l.name); const marks = m.marks; let i = 0; m.marks.forEach((end, li) => { const seg = m.route.slice(i, end); const runs = []; seg.forEach((d) => { if (runs.length && runs[runs.length - 1][0] === d) runs[runs.length - 1][1]++; else runs.push([d, 1]); }); out.push(runs.map(([d, n]) => `${d} ${n}`).join(', ') + (li < 3 ? `, then you reach ${names[li]}` : ', and you arrive at the destination')); i = end; }); return out; }
function _dmMove(dir) {
  const g = gameState.daytown; if (g.phase !== 'map' || g.mdone || g.over || g.replaying) return;
  const m = g.map, v = _DM_DIRS[dir], n = [g.pos[0] + v[0], g.pos[1] + v[1]], key = (p) => p[0] + ',' + p[1], want = m.route[g.step];
  if (n[0] < 0 || n[1] < 0 || n[0] >= _DM.W || n[1] >= _DM.H) { g.misses++; g.msg = `That is the edge of the map - you cannot go ${dir}. The next step on the route is ${want}.`; return _dmRender('dtn-msg'); }
  if (m.walls.has(key(n))) { g.misses++; g.msg = `That way is blocked by a hedge. The next step on the route is ${want}.`; return _dmRender('dtn-msg'); }
  if (dir !== want) { g.misses++; g.msg = `That is not the way on the route. The next step is ${want}. Nothing has changed - you are still where you were.`; return _dmRender('dtn-msg'); }
  g.pos = n; g.step++; g.hint = false;
  const li = m.marks.indexOf(g.step); g.msg = li >= 0 && li < 3 ? `You reached ${m.land[li].name}. Keep going.` : `Step ${g.step} of ${m.route.length}.`;
  if (g.step >= m.route.length) { g.mdone = true; const first = !g.misses && !g.reminders; g.session.n++; if (first) g.session.firstTry++; g.msg = `You reached the destination in ${m.route.length} steps${first ? '' : (g.reminders ? ' with the help of a reminder' : ' after a wrong turn')}. Well done.`; return _dmRender('dtn-next'); }
  _dmRender();
}
function _dmNextStep() { const g = gameState.daytown; if (g.mdone || g.replaying) return; g.reminders++; g.hint = true; g.msg = `Reminder: the next step is ${g.map.route[g.step]} ${_DM_DIRS[g.map.route[g.step]][3]}.`; _dmRender('dtn-msg'); }
function _dmToggleRoute() { const g = gameState.daytown; if (g.mdone || g.replaying) return; g.shownRoute = !g.shownRoute; if (g.shownRoute) g.reminders++; g.msg = g.shownRoute ? 'The route is shown.' : 'The route is hidden. You can show it again any time.'; _dmRender('dtn-route-btn'); }
function _dmReplay() {
  const g = gameState.daytown; if (g.mdone || g.replaying) return; g.reminders++; g.replaying = true; g.pos = g.map.S.slice(); g.step = 0; g.shownRoute = true;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, delay = reduce ? 0 : 550; g.timers = g.timers || [];
  g.map.route.forEach((d, i) => { g.timers.push(setTimeout(() => { if (gameState.currentId !== 'daytown' || g.phase !== 'map') return; const v = _DM_DIRS[d]; g.pos = [g.pos[0] + v[0], g.pos[1] + v[1]]; g.step = i + 1; g.msg = `Replay: step ${i + 1}, ${d}.`; _dmRender(); }, delay * (i + 1))); });
  g.timers.push(setTimeout(() => { if (gameState.currentId !== 'daytown' || g.phase !== 'map') return; g.replaying = false; g.pos = g.map.S.slice(); g.step = 0; g.msg = 'That was the whole route. You are back at the start - have another go, with or without the route shown.'; _dmRender('dtn-msg'); }, delay * (g.map.route.length + 1) + 50));
  _dmRender('dtn-msg');
}
function _dmNext() { const g = gameState.daytown; if (!g.mdone) return; if (g.session.n >= 3) return _dtDone(true); _dmNew(); }
function _dmRender(focusId) {
  const _pf = document.activeElement && document.activeElement.id;
  const g = gameState.daytown, m = g.map; if (gameState.currentId !== 'daytown' || g.phase !== 'map') return;
  const { key, pathSet } = _dmCells(); const arrowAt = {}; { let c = m.S.slice(); m.route.forEach((d) => { const k0 = key(c); if (!arrowAt[k0]) arrowAt[k0] = d; c = [c[0] + _DM_DIRS[d][0], c[1] + _DM_DIRS[d][1]]; }); } const landAt = {}; m.L.forEach((p, i) => landAt[key(p)] = m.land[i]);
  const nextPos = (() => { const v = _DM_DIRS[m.route[g.step]]; return v ? [g.pos[0] + v[0], g.pos[1] + v[1]] : null; })();
  let cells = ''; for (let y = 0; y < _DM.H; y++) for (let x = 0; x < _DM.W; x++) {
    const k = x + ',' + y, wall = m.walls.has(k), me = g.pos[0] === x && g.pos[1] === y, S = m.S[0] === x && m.S[1] === y, D = m.D[0] === x && m.D[1] === y, L = landAt[k];
    const onPath = g.shownRoute && pathSet.has(k) && !wall; const isNext = g.hint && nextPos && nextPos[0] === x && nextPos[1] === y;
    const lab = wall ? 'hedge' : S ? 'start' : D ? 'destination' : L ? L.name.replace(/^the /, '') : 'path';
    cells += `<div class="dtn-cell${wall ? ' dtn-wall' : ''}${onPath ? ' dtn-path' : ''}${me ? ' dtn-me' : ''}" ${isNext ? 'style="outline:4px dashed #1a56b0;outline-offset:-3px"' : ''} role="img" aria-label="Row ${y + 1}, column ${x + 1}: ${lab}${onPath && arrowAt[k] ? ', the route goes ' + arrowAt[k] : ''}${me ? ', you are here' : ''}">${wall ? '▒' : S ? 'S' : D ? 'D' : L ? L.glyph : onPath && arrowAt[k] ? _DM_DIRS[arrowAt[k]][3] : ''}</div>`;
  }
  const dirs = _dmDescribe();
  const dirList = g.shownRoute ? `<ol class="dtn-rules" aria-label="The route in words"><li>Start (S).</li>${dirs.map((t) => `<li>${t.charAt(0).toUpperCase() + t.slice(1)}.</li>`).join('')}</ol>` : '<p class="dtn-fine">The route is hidden. Press "Show the route" whenever you want to see it again - there is no limit.</p>';
  const done = g.mdone;
  _dtShell(`<div class="dtn-row" style="justify-content:space-between"><b>Map ${Math.min(g.session.n + (done ? 0 : 1), 3)} of 3</b><button type="button" class="dtn-btn" onclick="_dtEnd()">End round</button></div>
    <h3 tabindex="-1" id="dtn-h">Follow the route from S to D</h3>
    <p style="margin:0 0 8px">Go from <b>S</b> past ${m.land.map((l) => l.name).join(', ')} to <b>D</b>. Green squares are hedges. Use the arrow buttons or your arrow keys.</p>
    <div class="dtn-grid" role="group" aria-label="The map, ${_DM.W} by ${_DM.H}">${cells}</div>
    <p class="dtn-legend"><b>Key:</b> S start, D destination, ${m.land.map((l) => l.glyph + ' ' + l.name.replace(/^the /, '')).join(', ')}, ▒ hedge.</p>
    <div class="dtn-msg" id="dtn-msg" tabindex="-1" role="status" aria-live="polite">${g.msg || 'You are at S. Which way first?'}</div>
    <div class="dtn-pad" role="group" aria-label="Move"><button type="button" class="dtn-btn dtn-u" onclick="_dmMove('up')" aria-label="Go up" ${done ? 'disabled' : ''}>↑</button><button type="button" class="dtn-btn dtn-l" onclick="_dmMove('left')" aria-label="Go left" ${done ? 'disabled' : ''}>←</button><button type="button" class="dtn-btn dtn-r" onclick="_dmMove('right')" aria-label="Go right" ${done ? 'disabled' : ''}>→</button><button type="button" class="dtn-btn dtn-d" onclick="_dmMove('down')" aria-label="Go down" ${done ? 'disabled' : ''}>↓</button></div>
    <div class="dtn-row"><button type="button" class="dtn-btn" onclick="_dmNextStep()" ${done || g.replaying ? 'disabled' : ''}>Show next step</button><button type="button" class="dtn-btn" id="dtn-route-btn" onclick="_dmToggleRoute()" ${done || g.replaying ? 'disabled' : ''}>${g.shownRoute ? 'Hide the route' : 'Show the route'}</button><button type="button" class="dtn-btn" onclick="_dmReplay()" ${done || g.replaying ? 'disabled' : ''}>Show a solution (replay)</button>${done ? `<button type="button" class="dtn-btn dtn-main" id="dtn-next" onclick="_dmNext()">${g.session.n >= 3 ? 'Finish' : 'Next map'}</button>` : ''}</div>
    ${dirList}
    <div class="dtn-card"><b>Your choices</b><div class="dtn-row"><span>Route:</span><div class="dtn-seg" role="group" aria-label="Show the route"><button type="button" aria-pressed="${g.prefs.showRoute !== false}" onclick="_dtPref('showRoute',true)">Always show it</button><button type="button" aria-pressed="${g.prefs.showRoute === false}" onclick="_dtPref('showRoute',false)">Hide it</button></div></div><p class="dtn-fine" style="margin:0">Kept in this browser only. Changing it starts a new map and asks first.</p></div>`);
  { const f = document.getElementById(focusId || _pf); if (f) f.focus(); }   // keep keyboard focus on the same control across re-renders
}
