// ════════════════════════════════════════════════════════════════════════
// NAME GARDEN (2026-11, review) - meet four (or six) fictional neighbours, then try to say who is who, and always see the answer.
// Linked articles: spacing, trying to remember then checking, giving a name a connection. A distinct mode: Word Recall only recognises items
// seen once, with no feedback per item; Memory Match is matching. Here each character is asked about twice, with other characters in between.
// Rules (from the design brief): the correct name is revealed after EVERY attempt; "Show name" and "Replay study" count as a reminder;
// a round always ends after 2 practice turns per character, whatever the answers; nothing locks you into a retry loop.
// Names are fictional (never the player's); only the set, round progress and three preferences are kept, in this browser only.
// Entertainment and practice. Not a medical test or treatment. Multiple choice is recognition, not free recall - the screen says so.
// ════════════════════════════════════════════════════════════════════════
const _NG_CAST = [
  { id: 'rosa', name: 'Rosa', cue: 'red roses by the gate', acc: 'rose', skin: '#f1c9a5', top: '#b5473a', hair: '#d9d9d9' },
  { id: 'walter', name: 'Walter', cue: 'a blue watering can', acc: 'can', skin: '#c68b59', top: '#2f5d8a', hair: '#6b6b6b' },
  { id: 'ines', name: 'Ines', cue: 'a wide yellow sunhat', acc: 'hat', skin: '#8d5a3b', top: '#7a5a12', hair: '#2b2b2b' },
  { id: 'theo', name: 'Theo', cue: 'a green wheelbarrow', acc: 'barrow', skin: '#e6b98f', top: '#2e6b3a', hair: '#8a5a2b' },
  { id: 'mabel', name: 'Mabel', cue: 'a purple scarf', acc: 'scarf', skin: '#f3d7bd', top: '#6b3f8f', hair: '#f2f2f2' },
  { id: 'gus', name: 'Gus', cue: 'a big orange pumpkin', acc: 'pumpkin', skin: '#a8714a', top: '#9a4d12', hair: '#444' },
];
const _NG_KEY = 'bp-nmg-prefs', _NG_ROUND = 'bp-nmg-round';
function _ngGet(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v === null || v === undefined ? d : v; } catch (e) { return d; } }
function _ngSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function _ngDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
const _ngEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function _ngAvatar(c) {   // original vector people: shapes (hat, scarf, flower, can, barrow, pumpkin) carry the cue, not colour alone
  const acc = {
    rose: '<g><circle cx="88" cy="96" r="9" fill="#c0392b"/><circle cx="88" cy="96" r="4" fill="#7d1f16"/><path d="M88 105v22" stroke="#2e6b3a" stroke-width="3"/></g>',
    can: '<g><rect x="76" y="92" width="26" height="20" rx="4" fill="#2f5d8a"/><path d="M102 98l12-8" stroke="#2f5d8a" stroke-width="4"/><path d="M76 98c-8 0-8 8 0 8" stroke="#2f5d8a" stroke-width="3" fill="none"/></g>',
    hat: '<g><ellipse cx="60" cy="30" rx="48" ry="9" fill="#e6b800"/><path d="M36 30c0-18 48-18 48 0z" fill="#f2c500"/></g>',
    barrow: '<g><path d="M70 100h38l-6 18H78z" fill="#2e6b3a"/><circle cx="94" cy="124" r="6" fill="#333"/><path d="M70 100l-14 8" stroke="#2e6b3a" stroke-width="4"/></g>',
    scarf: '<g><path d="M34 76q26 16 52 0v12q-26 14-52 0z" fill="#6b3f8f"/><rect x="74" y="84" width="10" height="26" rx="3" fill="#6b3f8f"/></g>',
    pumpkin: '<g><ellipse cx="90" cy="108" rx="18" ry="14" fill="#e8851a"/><path d="M90 94v-6" stroke="#2e6b3a" stroke-width="4"/><path d="M82 96q8 14 0 24M98 96q-8 14 0 24" stroke="#b9600c" stroke-width="2" fill="none"/></g>',
  }[c.acc];
  return `<svg class="nmg-av" viewBox="0 0 120 140" role="img" aria-label="${_ngEsc('A neighbour with ' + c.cue)}" focusable="false">
    <rect x="30" y="68" width="60" height="62" rx="18" fill="${c.top}"/>
    <circle cx="60" cy="48" r="24" fill="${c.skin}"/><path d="M36 44q4-24 24-24t24 24q-10-8-24-8t-24 8z" fill="${c.hair}"/>
    <circle cx="51" cy="50" r="2.6" fill="#2b1b0d"/><circle cx="69" cy="50" r="2.6" fill="#2b1b0d"/><path d="M52 60q8 7 16 0" stroke="#2b1b0d" stroke-width="2.4" fill="none" stroke-linecap="round"/>${acc}</svg>`;
}

function initNameGarden(container) {
  const gs = gameState.namegarden;
  const prefs = Object.assign({ size: 4, gap: 'normal', cues: true }, _ngGet(_NG_KEY, {}));
  Object.assign(gs, { prefs, over: false, phase: 'start', token: 0 });
  const onKey = (e) => {
    if (gameState.currentId !== 'namegarden' || gs.phase !== 'ask' || gs.locked) return;
    const n = parseInt(e.key, 10); if (n >= 1 && n <= gs.cast.length && !e.ctrlKey && !e.metaKey && !e.altKey) { _ngPick(gs.opts[n - 1]); e.preventDefault(); }
  };
  document.addEventListener('keydown', onKey);
  window._gameCleanup = () => document.removeEventListener('keydown', onKey);
  _ngStart();
}
function _ngShell(inner) {
  const el = document.getElementById('gameContent'); if (!el || gameState.currentId !== 'namegarden') return null;
  el.innerHTML = `<div class="ng" dir="ltr">${inner}<p class="nmg-fine">For entertainment and practice. Not a medical test or treatment. The people and names are made up.</p><p class="nmg-fine nmg-art">Read more: <a href="article-why-coming-back-can-help-learning.html">Why coming back can be different from starting over</a> &middot; <a href="article-try-to-remember-then-check.html">Try to remember, then check</a> &middot; <a href="article-give-a-new-name-a-connection.html">Give a new name something to connect to</a></p></div>
  <style>
  .nmg-art a{display:inline-flex;align-items:center;min-height:44px;font-weight:700}
  .ng{width:100%;box-sizing:border-box;max-width:34rem;margin:0 auto;color:#2b1b0d;font-size:1.1rem;line-height:1.45}
  .ng h3{font:800 1.35rem/1.25 Georgia,serif;margin:.2em 0 .5em}
  .ng .nmg-card{background:#fffaf0;border:2px solid #c9a46a;border-radius:16px;padding:14px;margin:0 0 12px}
  .ng .nmg-av{width:104px;height:121px;display:block;margin:0 auto}
  .ng .nmg-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  .ng .nmg-opts{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:12px 0}
  .ng .nmg-opt,.ng .nmg-btn{min-height:52px;border-radius:12px;border:2px solid #8a5a1e;background:#fff7e6;color:#2b1b0d;font:800 1.15rem/1.2 Georgia,serif;padding:8px 12px;cursor:pointer}
  .ng .nmg-opt:focus-visible,.ng .nmg-btn:focus-visible,.ng [tabindex="-1"]:focus-visible{outline:4px solid #1a56b0;outline-offset:2px}
  .ng .nmg-opt[disabled]{cursor:default;opacity:1}
  .ng .nmg-opt.nmg-right{background:#d7f0d2;border-color:#2e7a35}
  .ng .nmg-opt.nmg-chosen-wrong{background:#ffe3d6;border-color:#b5471f}
  .ng .nmg-btn.nmg-main{background:#1a365d;color:#fff;border-color:#1a365d}
  .ng .nmg-seg{display:inline-flex;gap:6px;flex-wrap:wrap}
  .ng .nmg-seg button{min-height:48px;min-width:48px;padding:6px 12px;border-radius:10px;border:2px solid #8a5a1e;background:#fff7e6;color:#2b1b0d;font:700 1.05rem Georgia,serif;cursor:pointer}
  .ng .nmg-seg button[aria-pressed="true"]{background:#1a365d;color:#fff;border-color:#1a365d}
  .ng .nmg-fb{min-height:3.2em;font-weight:700}
  .ng .nmg-study{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .ng .nmg-study .nmg-card{text-align:center;margin:0}
  .ng .nmg-name{font:900 1.4rem Georgia,serif;display:block}
  .ng .nmg-fine{font-size:.95rem;color:#5b4630;text-align:center;margin:.8em 0 0}
  @media (prefers-reduced-motion:no-preference){.ng .nmg-opt{transition:background .15s}}
  </style>`;
  return el;
}
function _ngSeg(label, key, vals) {
  const gs = gameState.namegarden;
  return `<div class="nmg-card"><div id="nmg-l-${key}"><b>${label}</b></div><div class="nmg-seg" role="group" aria-labelledby="nmg-l-${key}">${vals.map(([v, t, why]) => `<button type="button" aria-pressed="${gs.prefs[key] === v}" onclick="_ngPref('${key}',${JSON.stringify(v).replace(/"/g, '&quot;')})" title="${_ngEsc(why || '')}">${t}</button>`).join('')}</div></div>`;
}
function _ngPref(k, v) {
  const gs = gameState.namegarden;
  gs.prefs[k] = v; _ngSet(_NG_KEY, gs.prefs);
  _ngStart();
  const b = document.querySelector('.nmg-seg button[aria-pressed="true"]'); if (b) { /* keep focus near the choice */ const g = document.querySelector(`.nmg-seg[aria-labelledby="nmg-l-${k}"] button[aria-pressed="true"]`); if (g) g.focus(); }
}
function _ngStart() {
  const gs = gameState.namegarden; gs.phase = 'start'; gs.token++;
  const saved = _ngGet(_NG_ROUND, null);
  const resume = saved && saved.v === 1 && saved.turn < saved.order.length;
  const h = _ngShell(`<h3>Name Garden</h3>
    <div class="nmg-card"><p style="margin:0">Meet ${gs.prefs.size} neighbours, each with a name and something to remember them by. Then you will be asked who is who - twice each, with the others in between. <b>You will always be shown the right name after you answer.</b> Choosing from a list is recognising a name, not recalling it from nothing, and there is no clock.</p></div>
    ${resume ? `<div class="nmg-card"><b>You have a round in progress</b> (turn ${saved.turn + 1} of ${saved.order.length}).<div class="nmg-row" style="margin-top:8px"><button type="button" class="nmg-btn nmg-main" onclick="_ngResume()">Continue my round</button><button type="button" class="nmg-btn" id="nmg-clear" onclick="_ngClear()">Clear my saved round</button></div></div>` : ''}
    <h3 style="font-size:1.1rem">Your choices</h3>
    ${_ngSeg('How many neighbours?', 'size', [[4, '4 (recommended)', 'Four to start'], [6, '6', 'Six neighbours: more to keep apart']])}
    ${_ngSeg('How far apart should repeat questions be?', 'gap', [['short', 'Closer together', 'Each neighbour comes back after one other question'], ['normal', 'Further apart', 'Each neighbour comes back after two or more other questions']])}
    ${_ngSeg('Show the "remember them by" cue during questions?', 'cues', [[true, 'Show cue'], [false, 'Hide cue']])}
    <div class="nmg-row"><button type="button" class="nmg-btn nmg-main" id="nmg-go" onclick="_ngBegin()">${resume ? 'Start a new round' : 'Start'}</button></div>`);
  if (h) { const hd = h.querySelector('h3'); if (hd) { hd.tabIndex = -1; } }
}
function _ngCast(size, setId) { return _NG_CAST.slice(0, size); }
function _ngOrder(ids, gap) {
  const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const need = gap === 'normal' ? 3 : 2, n = ids.length;   // positions apart between the two turns of one neighbour
  for (let t = 0; t < 400; t++) {
    const p = shuf(ids), q = shuf(ids);
    if (ids.every((id) => (n + q.indexOf(id)) - p.indexOf(id) >= need)) return p.concat(q);
  }
  const p = ids.slice(); return p.concat(p.slice(1), p.slice(0, 1));   // fallback: a rotation
}
function _ngBegin() {
  const gs = gameState.namegarden;
  gs.cast = _ngCast(gs.prefs.size); gs.order = _ngOrder(gs.cast.map((c) => c.id), gs.prefs.gap); gs.turn = 0; gs.res = [];
  _ngPersist(); _ngStudy(true);
}
function _ngClear() { _ngDel(_NG_ROUND); _ngStart(); const g = document.getElementById('nmg-go'); if (g) g.focus(); }
function _ngResume() {
  const gs = gameState.namegarden, s = _ngGet(_NG_ROUND, null); if (!s) return _ngStart();
  gs.cast = _ngCast(s.size); gs.order = s.order; gs.turn = s.turn; gs.res = s.res; gs.prefs = Object.assign(gs.prefs, { size: s.size, gap: s.gap, cues: s.cues });
  _ngAsk();
}
function _ngPersist() { const gs = gameState.namegarden; _ngSet(_NG_ROUND, { v: 1, size: gs.prefs.size, gap: gs.prefs.gap, cues: gs.prefs.cues, order: gs.order, turn: gs.turn, res: gs.res }); }
function _ngStudy(first) {
  const gs = gameState.namegarden; gs.phase = 'study'; gs.token++;
  if (!first) gs.usedStudy = true;
  const cards = gs.cast.map((c) => `<div class="nmg-card">${_ngAvatar(c)}<span class="nmg-name">${c.name}</span><span>${c.cue}</span></div>`).join('');
  const h = _ngShell(`<h3 tabindex="-1" id="nmg-h">Meet the neighbours</h3><p>Take your time. Each name goes with something you can picture. Try joining them: <i>"Rosa, roses."</i> Nothing here is timed.</p>
    <div class="nmg-study">${cards}</div><div class="nmg-row" style="margin-top:12px"><button type="button" class="nmg-btn nmg-main" id="nmg-ready" onclick="_ngAsk()">${first ? "I'm ready - ask me" : 'Back to the question'}</button></div>`);
  const hd = document.getElementById('nmg-h'); if (hd) hd.focus();
}
function _ngAsk() {
  const gs = gameState.namegarden; if (gameState.currentId !== 'namegarden') return;
  if (gs.turn >= gs.order.length) return _ngDone(true);
  gs.phase = 'ask'; gs.locked = false; gs.usedReminder = !!gs.usedStudy && gs._studyTurn === gs.turn; gs.first = null; gs.token++;
  const c = gs.cast.find((x) => x.id === gs.order[gs.turn]);
  gs.cur = c; gs.opts = (function (a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; })(gs.cast.map((x) => x.name));
  const opts = gs.opts.map((nm, i) => `<button type="button" class="nmg-opt" data-name="${nm}" onclick="_ngPick('${nm}')" aria-label="${i + 1}: ${nm}">${i + 1}. ${nm}</button>`).join('');
  _ngShell(`<div class="nmg-row" style="justify-content:space-between"><b id="nmg-prog">Turn ${gs.turn + 1} of ${gs.order.length}</b><button type="button" class="nmg-btn" onclick="_ngEnd()">End round</button></div>
    <div class="nmg-card"><h3 tabindex="-1" id="nmg-h" style="text-align:center">Who is this?</h3>${_ngAvatar(c)}${gs.prefs.cues ? `<p style="text-align:center;margin:.4em 0 0">Remember them by: <b>${c.cue}</b></p>` : ''}</div>
    <div class="nmg-opts" role="group" aria-label="Choose the name (keys 1 to ${gs.opts.length})">${opts}</div>
    <div class="nmg-fb" role="status" aria-live="polite" id="nmg-fb">Pick a name, or ask to be shown.</div>
    <div class="nmg-row"><button type="button" class="nmg-btn" id="nmg-show" onclick="_ngShow()">Show name</button><button type="button" class="nmg-btn" onclick="_ngReplay()">Replay study</button></div>`);
  const hd = document.getElementById('nmg-h'); if (hd) hd.focus();
}
function _ngReplay() { const gs = gameState.namegarden; if (gs.phase !== 'ask') return; gs._studyTurn = gs.turn; gs.usedStudy = true; _ngStudy(false); gs.usedReminder = true; }
function _ngReveal(kind, chosen) {   // kind: 'match' | 'diff' | 'reminder'
  const gs = gameState.namegarden; if (gs.locked) return; gs.locked = true; gs.token++;
  const right = gs.cur.name;
  gs.res.push({ id: gs.cur.id, k: gs.usedReminder && kind !== 'reminder' ? (kind + '+r') : kind });
  document.querySelectorAll('.nmg-opt').forEach((b) => { b.disabled = true; if (b.dataset.name === right) { b.classList.add('nmg-right'); b.insertAdjacentHTML('beforeend', ' <span aria-hidden="true">✓</span>'); } else if (b.dataset.name === chosen) b.classList.add('nmg-chosen-wrong'); });
  const fb = document.getElementById('nmg-fb');
  if (fb) fb.textContent = kind === 'match' ? `Yes - this is ${right}. (${gs.cur.cue}.)` : kind === 'diff' ? `Not this time. This is ${right} - ${gs.cur.cue}.` : `This is ${right} - ${gs.cur.cue}.`;
  const last = gs.turn + 1 >= gs.order.length;
  const sh = document.getElementById('nmg-show'); if (sh) sh.disabled = true;
  document.getElementById('nmg-fb').insertAdjacentHTML('afterend', `<div class="nmg-row" style="margin:8px 0"><button type="button" class="nmg-btn nmg-main" id="nmg-next" onclick="_ngNext()">${last ? 'See my round' : 'Next'}</button></div>`);
  gs.turn++; _ngPersist();
  const nx = document.getElementById('nmg-next'); if (nx) nx.focus();
}
function _ngPick(name) { const gs = gameState.namegarden; if (gs.phase !== 'ask' || gs.locked) return; _ngReveal(name === gs.cur.name ? 'match' : 'diff', name); }
function _ngShow() { const gs = gameState.namegarden; if (gs.phase !== 'ask' || gs.locked) return; gs.usedReminder = true; _ngReveal('reminder'); }
function _ngNext() { const gs = gameState.namegarden; if (gs.phase !== 'ask' || !gs.locked) return; gs.locked = false; if (gs.turn >= gs.order.length) _ngDone(true); else _ngAsk(); }
function _ngTally() {
  const gs = gameState.namegarden, r = gs.res, plain = (x) => x.k;
  const matched = r.filter((x) => x.k === 'match').length;
  const reminder = r.filter((x) => x.k === 'reminder' || /\+r$/.test(x.k)).length;
  const differed = r.filter((x) => x.k === 'diff').length;
  return { turns: r.length, matched, reminder, differed };
}
function _ngEnd() { const gs = gameState.namegarden; if (gs.phase !== 'ask' && gs.phase !== 'study') return; _ngDone(false); }
function _ngDone(complete) {
  const gs = gameState.namegarden; if (gs.over) return; gs.over = true; gs.phase = 'done'; gs.token++;
  const t = _ngTally(), total = gs.order.length;
  const text = `${t.turns} practice turn${t.turns === 1 ? '' : 's'} completed${complete ? '' : ' of ' + total}; ${t.matched} first-choice answer${t.matched === 1 ? '' : 's'} matched; ${t.reminder} used a reminder.`;
  _ngDel(_NG_ROUND);
  _ngShell(`<h3 tabindex="-1" id="nmg-h">${complete ? 'Round complete' : 'Round ended'}</h3><div class="nmg-card" role="status"><p style="margin:0;font-weight:700">${text}</p>${t.differed ? `<p style="margin:.5em 0 0">${t.differed} first choice${t.differed === 1 ? '' : 's'} differed from the answer - that is what practice is for.</p>` : ''}<p style="margin:.5em 0 0">This is a count for this round only. It is not a score of your memory.</p></div>
    <div class="nmg-row"><button type="button" class="nmg-btn nmg-main" onclick="loadGame('namegarden')">Play again</button><button type="button" class="nmg-btn" onclick="showHome()">Menu</button></div>`);
  const hd = document.getElementById('nmg-h'); if (hd) hd.focus();
  GameKit.finish('namegarden', complete, text);
}
