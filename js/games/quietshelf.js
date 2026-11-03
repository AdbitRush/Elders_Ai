// ════════════════════════════════════════════════════════════════════════
// THE QUIET SHELF (2026-11, review) - find every object on a calm shelf that matches ONE written rule, e.g. "Find all 3 striped mugs."
// Linked article: a quieter screen for play. A design choice, not a treatment: one persistent instruction above the shelf, no clock, no sound,
// no flashing, no second task. The rule is carried by OBJECT and PATTERN (never by colour alone): colour is fixed per object type.
// Controls: every object is a button (toggle); Undo selection; Show a hint; Check shelf (explicit); Show answer. Three rounds; 6, 9 or 12 objects (player's choice).
// A wrong check keeps your picks and says how many matches you have and how many picks do not match - never which ones.
// Entertainment and practice. Not a medical test or treatment.
// ════════════════════════════════════════════════════════════════════════
const _QS_OBJ = {
  mug: { w: 'mug', col: '#b5472f', d: 'M22 26h34v36a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6z', extra: '<path d="M56 34h6a6 6 0 0 1 0 22h-6" fill="none" stroke="#b5472f" stroke-width="5"/>' },
  vase: { w: 'vase', col: '#2a5db0', d: 'M33 10h14v12c15 6 19 22 12 46H21c-7-24-3-40 12-46z', extra: '' },
  teapot: { w: 'teapot', col: '#2e7a35', d: 'M16 46c0-16 10-24 25-24s25 8 25 24v18H16z', extra: '<path d="M66 40l11-9v13z" fill="#2e7a35"/><rect x="34" y="15" width="14" height="8" rx="3" fill="#2e7a35"/>' },
  lamp: { w: 'lamp', col: '#8a5a10', d: 'M27 12h26l9 30H18z', extra: '<rect x="37" y="42" width="6" height="20" fill="#5b3a08"/><rect x="26" y="62" width="28" height="7" rx="3" fill="#5b3a08"/>' },
  pot: { w: 'plant pot', col: '#6b3f8f', d: 'M22 42h36l-6 26H28z', extra: '<path d="M40 42V22M40 30c-12-2-14-12-14-12s12 0 14 12M40 26c10-2 14-10 14-10s-12 0-14 10" fill="none" stroke="#2e6b3a" stroke-width="4"/>' },
};
const _QS_PAT = { plain: 'plain', striped: 'striped', dotted: 'dotted', checked: 'checked' };
const _QS_KEY = 'bp-qs-prefs';
const _qsGet = () => { try { return JSON.parse(localStorage.getItem(_QS_KEY)) || {}; } catch (e) { return {}; } };
const _qsSet = (v) => { try { localStorage.setItem(_QS_KEY, JSON.stringify(v)); } catch (e) {} };
const _qsName = (o, plural) => `${o.p === 'plain' ? '' : o.p + ' '}${_QS_OBJ[o.s].w}${plural ? 's' : ''}`.trim();
function _qsSvg(o, uid) {
  const b = _QS_OBJ[o.s], cid = 'qshc' + uid;
  const pat = { plain: '', striped: '<g stroke="#fff" stroke-width="5" opacity=".92">' + [-10, 2, 14, 26, 38, 50, 62, 74].map((y) => `<line x1="0" y1="${y}" x2="80" y2="${y + 12}"/>`).join('') + '</g>',
    dotted: '<g fill="#fff" opacity=".92">' + [[28, 30], [44, 30], [36, 42], [52, 42], [28, 54], [44, 54], [36, 20], [58, 56], [22, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6"/>`).join('') + '</g>',
    checked: '<g fill="#fff" opacity=".92">' + [0, 1, 2, 3, 4, 5].flatMap((r) => [0, 1, 2, 3, 4, 5].filter((c) => (r + c) % 2 === 0).map((c) => `<rect x="${10 + c * 10}" y="${8 + r * 10}" width="10" height="10"/>`)).join('') + '</g>' }[o.p];
  return `<svg viewBox="0 0 80 80" width="72" height="72" aria-hidden="true" focusable="false"><defs><clipPath id="${cid}"><path d="${b.d}"/></clipPath></defs>${b.extra}<path d="${b.d}" fill="${b.col}"/><g clip-path="url(#${cid})">${pat}</g><path d="${b.d}" fill="none" stroke="#2b1b0d" stroke-width="2"/></svg>`;
}
function initQuietShelf(container) {
  const g = gameState.quietshelf;
  Object.assign(g, { prefs: Object.assign({ size: 6 }, _qsGet()), round: 0, rounds: [], over: false, pending: null });
  _qsRound();
}
function _qsMake(N) {
  const shapes = Object.keys(_QS_OBJ), pats = Object.keys(_QS_PAT);
  const S = shapes[Math.floor(Math.random() * shapes.length)], P = pats[1 + Math.floor(Math.random() * 3)];   // a pattern rule: striped / dotted / checked
  const k = 2 + Math.floor(Math.random() * Math.min(3, Math.floor(N / 3)));   // 2..4 matches
  const items = []; for (let i = 0; i < k; i++) items.push({ s: S, p: P });
  const sameShape = pats.filter((x) => x !== P), samePat = shapes.filter((x) => x !== S);
  items.push({ s: S, p: sameShape[Math.floor(Math.random() * sameShape.length)] });   // looks alike: right object, wrong pattern
  items.push({ s: samePat[Math.floor(Math.random() * samePat.length)], p: P });       // looks alike: right pattern, wrong object
  while (items.length < N) { const s = shapes[Math.floor(Math.random() * shapes.length)], p = pats[Math.floor(Math.random() * pats.length)]; if (s === S && p === P) continue; items.push({ s, p }); }
  items.sort(() => Math.random() - .5);
  return { rule: { s: S, p: P }, k, items: items.map((o, i) => Object.assign({ id: i }, o)) };
}
function _qsRound() {
  const g = gameState.quietshelf, m = _qsMake(g.prefs.size);
  Object.assign(g, m, { picked: [], history: [], hintId: -1, checked: false, hints: 0, checks: 0, revealed: false, solved: false, msg: '', pending: null });
  _qsRender();
}
const _qsIsMatch = (o) => o.s === gameState.quietshelf.rule.s && o.p === gameState.quietshelf.rule.p;
function _qsToggle(id) {
  const g = gameState.quietshelf; if (g.over || g.solved || g.revealed) return;
  const i = g.picked.indexOf(id); if (i >= 0) g.picked.splice(i, 1); else g.picked.push(id);
  g.history.push(id); g.hintId = -1; g.msg = `${g.picked.length} of ${g.k} picked.`; _qsRender('qsh-i-' + id);
}
function _qsUndo() { const g = gameState.quietshelf; if (g.over || g.solved || g.revealed) return; if (!g.history.length) { g.msg = 'Nothing to undo yet.'; return _qsRender('qsh-undo'); } const id = g.history.pop(); const i = g.picked.indexOf(id); if (i >= 0) g.picked.splice(i, 1); else g.picked.push(id); g.msg = `Undid your last pick. ${g.picked.length} of ${g.k} picked.`; _qsRender('qsh-undo'); }
function _qsHint() {
  const g = gameState.quietshelf; if (g.over || g.solved || g.revealed) return;
  const left = g.items.filter((o) => _qsIsMatch(o) && !g.picked.includes(o.id)); if (!left.length) { g.msg = 'Every match is already picked. Press Check shelf when you are ready.'; return _qsRender('qsh-hint'); }
  g.hints++; g.hintId = left[0].id; g.msg = 'Hint: one match has a dashed outline.'; _qsRender('qsh-hint');
}
function _qsCheck() {
  const g = gameState.quietshelf; if (g.over || g.solved || g.revealed) return; g.checks++;
  const good = g.picked.filter((id) => _qsIsMatch(g.items[id])).length, extra = g.picked.length - good, missing = g.k - good;
  if (!extra && !missing) { g.solved = true; g.msg = `Yes - you found all ${g.k} ${_qsName(g.rule, true)}.`; g.rounds.push({ first: g.checks === 1, hints: g.hints, revealed: false }); return _qsRender('qsh-next'); }
  const bits = []; if (missing) bits.push(`${good} of the ${g.k} matches`); else bits.push(`all ${g.k} matches`); if (extra) bits.push(`${extra} pick${extra === 1 ? '' : 's'} that ${extra === 1 ? 'does' : 'do'} not match`);
  g.msg = `Not quite yet: you have ${bits.join(' and ')}. A match must be a ${_qsName(g.rule)} - the object and the pattern. Your picks are kept.`; _qsRender('qsh-msg');
}
function _qsShow() { const g = gameState.quietshelf; if (g.over || g.solved || g.revealed) return; g.revealed = true; g.msg = `Here are the ${g.k} ${_qsName(g.rule, true)}, outlined.`; g.rounds.push({ first: false, hints: g.hints, revealed: true }); _qsRender('qsh-next'); }
function _qsNext() {
  const g = gameState.quietshelf; if (!(g.solved || g.revealed)) return;
  g.round++; if (g.round >= 3) return _qsDone(true); _qsRound(); const h = document.getElementById('qsh-rule'); if (h) h.focus();
}
function _qsDone(complete) {
  const g = gameState.quietshelf; if (g.over) return; g.over = true;
  const r = g.rounds, first = r.filter((x) => x.first).length, rev = r.filter((x) => x.revealed).length, hints = r.reduce((a, x) => a + x.hints, 0);
  const text = `${r.length} ${r.length === 1 ? 'shelf' : 'shelves'} finished${complete ? '' : ' (round ended early)'}; ${first} matched on the first check; ${hints} hint${hints === 1 ? '' : 's'} used; ${rev} shown.`;
  const el = document.getElementById('gameContent'); if (!el) return;
  el.innerHTML = `<div class="qsh" dir="ltr"><h3 tabindex="-1" id="qsh-h" class="qsh-h">${complete ? 'All three shelves done' : 'Round ended'}</h3><div class="qsh-card" role="status"><p style="margin:0;font-weight:700">${text}</p><p style="margin:.5em 0 0">These are counts for this round only. They are not a score of attention.</p></div><div class="qsh-row"><button type="button" class="qsh-btn qsh-main" onclick="loadGame('quietshelf')">Play again</button><button type="button" class="qsh-btn" onclick="showHome()">Menu</button></div><p class="qsh-fine">For entertainment and practice. Not a medical test or treatment.</p><p class="qsh-fine qsh-art">Read more: <a href="article-a-quieter-screen-for-play.html">A quieter screen can be a better place to play</a></p></div>${_qsStyle()}`;
  const h = document.getElementById('qsh-h'); if (h) h.focus(); GameKit.finish('quietshelf', complete, text);
}
function _qsEnd() { const g = gameState.quietshelf; if (g.over) return; _qsDone(false); }
function _qsSize(v) {
  const g = gameState.quietshelf; if (g.prefs.size === v) return;
  if ((g.picked.length || g.history.length) && !g.solved && !g.revealed) { g.pending = v; return _qsRender('qsh-confirm'); }
  g.prefs.size = v; _qsSet(g.prefs); g.round = 0; g.rounds = []; _qsRound();
}
function _qsConfirm(yes) { const g = gameState.quietshelf, v = g.pending; g.pending = null; if (yes && v) { g.prefs.size = v; _qsSet(g.prefs); g.round = 0; g.rounds = []; return _qsRound(); } g.msg = 'Kept your shelf as it was.'; _qsRender(); }
function _qsStyle() {
  return `<style>
  .qsh-art a{display:inline-flex;align-items:center;min-height:44px;font-weight:700}
  .qsh{width:100%;box-sizing:border-box;max-width:36rem;margin:0 auto;color:#2b1b0d;font-size:1.1rem;line-height:1.4}
  .qsh-h{font:800 1.3rem Georgia,serif;margin:.2em 0 .5em}
  .qsh-rule{font:900 1.5rem/1.25 Georgia,serif;margin:.2em 0;padding:10px 14px;border:3px solid #1a365d;border-radius:14px;background:#eef4ff;color:#12284a}
  .qsh-count{font-weight:800;margin:.3em 0}
  .qsh-shelf{display:grid;gap:14px 10px;padding:14px 10px 18px;background:linear-gradient(#e7cfa2,#d9b97f);border:3px solid #8a5a1e;border-radius:14px;margin:10px 0}
  .qsh-it{position:relative;min-width:84px;min-height:92px;padding:6px 4px 10px;border:3px solid transparent;border-radius:12px;background:#fff7e6;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;border-bottom:8px solid #8a5a1e}
  .qsh-it[aria-pressed="true"]{border-color:#1a365d;background:#dbe8ff}
  .qsh-it .qsh-chk{position:absolute;top:2px;right:4px;font:900 1.3rem/1 Georgia,serif;color:#1a365d;display:none}.qsh-it[aria-pressed="true"] .qsh-chk{display:block}
  .qsh-it:focus-visible,.qsh-btn:focus-visible,.qsh-seg button:focus-visible,.qsh-h:focus-visible,.qsh-rule:focus-visible,.qsh-confirm:focus-visible{outline:4px solid #1a56b0;outline-offset:2px}
  .qsh-it.qsh-hint{outline:4px dashed #1a56b0;outline-offset:2px}.qsh-it.qsh-ans{box-shadow:0 0 0 4px #2e7a35}
  .qsh-it[disabled]{cursor:default;opacity:1}
  .qsh-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
  .qsh-btn,.qsh-seg button{min-height:48px;min-width:48px;border-radius:12px;border:2px solid #8a5a1e;background:#fff7e6;color:#2b1b0d;font:800 1.02rem/1.2 Georgia,serif;padding:6px 14px;cursor:pointer}
  .qsh-btn[disabled]{opacity:.5;cursor:default}.qsh-main,.qsh-seg button[aria-pressed="true"]{background:#1a365d;color:#fff;border-color:#1a365d}
  .qsh-seg{display:inline-flex;gap:6px;flex-wrap:wrap}
  .qsh-msg{min-height:3em;font-weight:700;margin:6px 0}.qsh-card,.qsh-confirm{border:2px solid #c9a46a;border-radius:12px;background:#fffaf0;padding:10px 12px;margin:10px 0}.qsh-confirm{border-color:#b5471f;background:#fff0e8}
  .qsh-fine{font-size:.95rem;color:#5b4630}
  </style>`;
}
function _qsRender(focusId) {
  const _pf = document.activeElement && document.activeElement.id;
  const g = gameState.quietshelf, el = document.getElementById('gameContent'); if (!el || gameState.currentId !== 'quietshelf' || g.over) return;
  const N = g.items.length, cols = N <= 6 ? 3 : N <= 9 ? 3 : 4, done = g.solved || g.revealed;
  const items = g.items.map((o) => { const pk = g.picked.includes(o.id), ans = g.revealed && _qsIsMatch(o);
    return `<button type="button" id="qsh-i-${o.id}" class="qsh-it${g.hintId === o.id ? ' qsh-hint' : ''}${ans ? ' qsh-ans' : ''}" aria-pressed="${pk}" onclick="_qsToggle(${o.id})" ${done ? 'disabled' : ''} aria-label="${_qsName(o)}${pk ? ', picked' : ', not picked'}${ans ? ', a match' : ''}"><span class="qsh-chk" aria-hidden="true">&#10003;</span>${_qsSvg(o, g.round + '-' + o.id)}</button>`; }).join('');
  const seg = `<div class="qsh-seg" role="group" aria-label="Objects on the shelf">${[6, 9, 12].map((v) => `<button type="button" aria-pressed="${g.prefs.size === v}" onclick="_qsSize(${v})">${v}</button>`).join('')}</div>`;
  const confirm = g.pending ? `<div class="qsh-confirm" id="qsh-confirm" tabindex="-1" role="alertdialog" aria-label="Change the shelf?">Changing the number of objects starts a new shelf, and your picks on this one are lost.<div class="qsh-row"><button type="button" class="qsh-btn qsh-main" onclick="_qsConfirm(true)">Start a new shelf</button><button type="button" class="qsh-btn" onclick="_qsConfirm(false)">Keep my shelf</button></div></div>` : '';
  el.innerHTML = `<div class="qsh" dir="ltr">
    <div class="qsh-row" style="justify-content:space-between"><b>Shelf ${g.round + 1} of 3</b><button type="button" class="qsh-btn" onclick="_qsEnd()">End round</button></div>
    <p class="qsh-rule" id="qsh-rule" tabindex="-1">Find all ${g.k} ${_qsName(g.rule, true)}.</p>
    <div class="qsh-count" role="status" aria-live="polite">${g.k} to find, ${g.picked.length} picked.</div>
    <div class="qsh-shelf" style="grid-template-columns:repeat(${cols},1fr)" role="group" aria-label="The shelf: ${N} objects">${items}</div>
    ${confirm}<div class="qsh-msg" id="qsh-msg" tabindex="-1" role="status" aria-live="polite">${g.msg || 'Pick every object that matches the rule, then press Check shelf.'}</div>
    <div class="qsh-row"><button type="button" class="qsh-btn qsh-main" onclick="_qsCheck()" ${done ? 'disabled' : ''}>Check shelf</button><button type="button" class="qsh-btn" id="qsh-undo" onclick="_qsUndo()" ${done ? 'disabled' : ''}>Undo selection</button><button type="button" class="qsh-btn" id="qsh-hint" onclick="_qsHint()" ${done ? 'disabled' : ''}>Show a hint</button><button type="button" class="qsh-btn" onclick="_qsShow()" ${done ? 'disabled' : ''}>Show answer</button>${done ? `<button type="button" class="qsh-btn qsh-main" id="qsh-next" onclick="_qsNext()">${g.round >= 2 ? 'Finish' : 'Next shelf'}</button>` : ''}</div>
    <div class="qsh-card"><b>Your choices</b><div class="qsh-row"><span id="qsh-ol">Objects on the shelf:</span>${seg}</div><p class="qsh-fine" style="margin:0">Kept in this browser only. There is no clock and no sound.</p></div>
    <p class="qsh-fine">For entertainment and practice. Not a medical test or treatment.</p><p class="qsh-fine qsh-art">Read more: <a href="article-a-quieter-screen-for-play.html">A quieter screen can be a better place to play</a></p></div>${_qsStyle()}`;
  { const f = document.getElementById(focusId || _pf); if (f) f.focus(); }   // keep keyboard focus on the same control across re-renders
}
