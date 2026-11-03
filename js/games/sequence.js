// ═══════════════════════════════════════════════════════════════════════════════
// GAME 5: SEQUENCE — neon glow + bilingual + difficulty speed
// ═══════════════════════════════════════════════════════════════════════════════
function initSequence(container) {
    // Porch Rhythm is a second mode of this same game; ?mode=porch (from the article link) or the mode buttons start it. Classic stays the default.
    if (!gameState.sequence._modeChosen && new URLSearchParams(location.search).get('mode') === 'porch') { gameState.sequence._modeChosen = true; gameState.sequence._mode = 'porch'; return _prStart(); }
    if (gameState.sequence._modeChosen && gameState.sequence._mode === 'porch') return _prStart();
    gameState.sequence._mode = 'classic';
    if(!gameState.sequence.sequence)gameState.sequence.sequence=[];
    gameState.sequence.userIndex=0; gameState.sequence.waitingForUser=false;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gameState.sequence._diff=_d;
    const isHe=currentLang==='he';
    const colors=[
        {id:0,color:'#ef4444',glow:'rgba(239,68,68,0.7)'},
        {id:1,color:'#3b82f6',glow:'rgba(59,130,246,0.7)'},
        {id:2,color:'#22c55e',glow:'rgba(34,197,94,0.7)'},
        {id:3,color:'#eab308',glow:'rgba(234,179,8,0.7)'}
    ];
    let html=`<div style="display:flex;flex-direction:column;align-items:center;gap:20px;width:100%">
        ${_seqModeRow('classic')}
        <div id="sequence-score" style="font-size:20px;font-weight:800;color:#1e293b;letter-spacing:0.05em">${gt('Level 1...', 'רמה 1...')}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:280px;width:100%">`;
    colors.forEach(col=>{
        html+=`<div id="sequence-${col.id}" onclick="clickSequence(${col.id})"
            style="width:100%;aspect-ratio:1;border-radius:20px;background:${col.color};filter:brightness(0.55);cursor:pointer;transition:filter 0.15s,transform 0.1s,box-shadow 0.15s;box-shadow:0 4px 12px rgba(0,0,0,0.3)"
            onmousedown="this.style.transform='scale(0.94)'" onmouseup="this.style.transform='scale(1)'"></div>`;
    });
    html+=`</div><p style="text-align:center;font-size:.95rem;color:#5b4630;margin:0">Porch Rhythm: a calmer 3-phrase mode with optional sound is one button above. <a href="article-play-a-rhythm-not-a-health-promise.html" style="display:inline-flex;align-items:center;min-height:44px;font-weight:700">Read: play a rhythm, not a health promise</a></p></div>`;
    container.innerHTML=html;
    container._sequenceColors=colors;
    setTimeout(()=>playColorSequence(),800);
}
// A run belongs to one state object: leaving the game (or restarting it) replaces gameState.sequence, so every await
// re-checks that this run is still the one on screen before touching the DOM (2026-10-10: a TypeError in
// flashSequence when the player navigated away mid-sequence - the loop kept flashing a board that was gone).
function _seqAlive(state){return gameState.active&&gameState.currentId==='sequence'&&gameState.sequence===state&&!!document.getElementById('sequence-0');}
async function playColorSequence() {
    const state=gameState.sequence;
    if(!_seqAlive(state))return;
    const isHe=currentLang==='he';
    state.waitingForUser=false; state.userIndex=0;
    const _d=state._diff||'normal';
    const gap=_d==='easy'?700:_d==='hard'?300:500;
    state.sequence.push(Math.floor(Math.random()*4));
    const scEl=document.getElementById('sequence-score');
    if(scEl){scEl.innerText=isHe?`רמה ${state.sequence.length}...`:`Level ${state.sequence.length}...`; scEl.style.color='';}
    for(let i=0;i<state.sequence.length;i++){if(!_seqAlive(state))return;await new Promise(r=>setTimeout(r,gap));if(!_seqAlive(state))return;await flashSequence(state.sequence[i],_d);}
    if(!_seqAlive(state))return; state.waitingForUser=true;
    if(scEl) scEl.innerHTML=(isHe?`רמה ${state.sequence.length} — תורך! `:`Level ${state.sequence.length} — Your turn! `)+Icon.ui('pointer');
}
async function flashSequence(id,_d='normal') {
    if(!gameState.active||gameState.currentId!=='sequence')return;
    const el=document.getElementById(`sequence-${id}`);
    if(!el)return;
    const dur=_d==='easy'?600:_d==='hard'?250:400;
    const glows=['rgba(239,68,68,0.8)','rgba(59,130,246,0.8)','rgba(34,197,94,0.8)','rgba(234,179,8,0.8)'];
    el.style.filter='brightness(1.4)'; el.style.boxShadow=`0 0 28px 8px ${glows[id]},0 4px 12px rgba(0,0,0,0.3)`; _tone(220+id*110,0.25);
    await new Promise(r=>setTimeout(r,dur));
    if(!el.isConnected)return;
    el.style.filter='brightness(0.55)'; el.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)';
}
function clickSequence(id) {
    const isHe=currentLang==='he';
    const state=gameState.sequence; if(!state.waitingForUser)return;
    flashSequence(id, state._diff||'normal');
    if(id===state.sequence[state.userIndex]){
        state.userIndex++;
        if(state.userIndex===state.sequence.length){
            state.waitingForUser=false;
            const lv=state.sequence.length;
            const scEl=document.getElementById('sequence-score');
            if(scEl){scEl.innerText=`✓ ${isHe?`רמה ${lv}!`:`Level ${lv}!`}`; scEl.style.color='#16a34a';}
            sfxCorrect();
            setTimeout(()=>{if(!_seqAlive(state))return;if(scEl)scEl.style.color='';playColorSequence();},700);
        }
    } else {
        sfxWrong();
        state.waitingForUser=false;
        const score=state.sequence.length;
        state.sequence=[];
        const gc=document.getElementById('gameContent');
        setTimeout(()=>{
            if(!_seqAlive(state))return;   // the player left during the pause
            // honest result: only a real run (level 2+) can set a personal best
            const hs=score>1&&checkHS('sequence',score);
            Retention.recordWin();
            gc.innerHTML=`<div class="text-center py-8 px-4 max-w-sm mx-auto">
                <div class="w-modal-mark" aria-hidden="true">${Icon.svg(score>1?'party-popper':'rotate-ccw',{size:'1em',sw:1.8})}</div>
                <div class="text-3xl font-bold mt-3 text-slate-800">${score>1?gt('Great job!', 'כל הכבוד!'):gt('Nice try - want to play again?', 'ניסיון יפה - רוצים לשחק שוב?')}</div>
                <div class="text-xl mt-3 text-gray-600">${isHe?`הגעת לרמה`:'You reached level'} <strong class="text-[#1a365d] text-2xl">${score}</strong></div>
                ${hs?`<div class="mt-2 text-amber-600 font-bold text-lg">${Icon.ui('star')} ${gt('New personal best!', 'שיא אישי חדש!')}</div>`:''}
                <div id="sequence-share" class="mt-3"></div>
                <div class="flex gap-3 justify-center mt-6 flex-wrap">
                    <button onclick="loadGame('sequence')" class="btn-premium py-3 px-8 rounded-xl font-bold">${gt('Play Again', 'שחק שוב')}</button>
                    <button onclick="showHome()" class="bg-gray-200 hover:bg-gray-300 py-3 px-8 rounded-xl font-bold text-gray-700 transition">${gt('Menu', 'תפריט')}</button>
                </div></div>`;
            if(typeof Share!=='undefined'){const sd=document.getElementById('sequence-share');if(sd)Share.renderBtn(sd,'sequence',score);}
        },800);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PORCH RHYTHM (2026-11, review) - a second mode of this same Sequence game (no second rhythm game).
// Linked article: "Play a rhythm, not a health promise". Four numbered, patterned pads. Watch (and optionally hear) a short pattern, then repeat the ORDER.
// Order only (no reaction-time scoring). Sound is OFF until you turn it on, has a mute at all times, and uses plain original tones (no songs, nothing autoplays).
// Silent play is complete: every step is shown by an outline, a pattern and the words "Now: pad 3". Reduced-motion: no animation, same cues.
// Player chooses the pattern length (2, 3 or 4) and the pace (slow / normal); nothing speeds up by itself. Three phrases, replay any time, skip any phrase.
// Results separate first-try matches from replay/retry-assisted and skipped; never a score of memory or music ability. Not music lessons or therapy.
// Entertainment and practice. Not a medical test or treatment.
// ═══════════════════════════════════════════════════════════════════════════════
const _PR_KEY = 'bp-pr-prefs', _PR_FREQ = [262, 330, 392, 523];
const _PR_PAT = ['repeating-linear-gradient(45deg,#fff 0 6px,transparent 6px 14px)', 'radial-gradient(#fff 3px,transparent 3.5px) 0 0/14px 14px', 'repeating-linear-gradient(90deg,#fff 0 5px,transparent 5px 14px)', 'repeating-linear-gradient(0deg,#fff 0 5px,transparent 5px 14px)'];
const _PR_COL = ['#b5472f', '#2a5db0', '#2e7a35', '#6b3f8f'], _PR_NAME = ['diagonal stripes', 'dots', 'vertical stripes', 'horizontal stripes'];
const _prGet = () => { try { return JSON.parse(localStorage.getItem(_PR_KEY)) || {}; } catch (e) { return {}; } };
const _prSet = (v) => { try { localStorage.setItem(_PR_KEY, JSON.stringify(v)); } catch (e) {} };
function _seqMode(m) {
  const g = gameState.sequence; g._mode = m; g._modeChosen = true; g.sequence = []; if (g.pr) { g.pr.token = (g.pr.token || 0) + 1; }
  const c = document.getElementById('gameContent'); if (m === 'porch') _prStart(); else initSequence(c);
}
function _seqModeRow(active) {
  return `<div class="prp-modes" role="group" aria-label="Mode" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button type="button" aria-pressed="${active === 'classic'}" onclick="_seqMode('classic')" class="prp-m">Classic (keeps growing)</button><button type="button" aria-pressed="${active === 'porch'}" onclick="_seqMode('porch')" class="prp-m">Porch Rhythm (3 phrases)</button></div>`;
}
function _prStyle() {
  return `<style>
  .prp{width:100%;box-sizing:border-box;max-width:32rem;margin:0 auto;color:#2b1b0d;font-size:1.08rem;line-height:1.4}
  .prp h3{font:800 1.3rem/1.25 Georgia,serif;margin:.2em 0 .5em}
  .prp-card{border:2px solid #c9a46a;border-radius:14px;background:#fffaf0;padding:12px 14px;margin:0 0 12px}
  .prp-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
  .prp-btn,.prp-seg button,.prp-m{min-height:48px;min-width:48px;border-radius:12px;border:2px solid #8a5a1e;background:#fff7e6;color:#2b1b0d;font:800 1.02rem/1.2 Georgia,serif;padding:6px 14px;cursor:pointer}
  .prp-btn[disabled]{opacity:.5;cursor:default}.prp-main,.prp-seg button[aria-pressed="true"],.prp-m[aria-pressed="true"]{background:#1a365d;color:#fff;border-color:#1a365d}
  .prp-seg{display:inline-flex;gap:6px;flex-wrap:wrap}
  .prp button:focus-visible,.prp [tabindex="-1"]:focus-visible{outline:4px solid #1a56b0;outline-offset:2px}
  .prp-pads{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:22rem;margin:12px auto}
  .prp-pad{aspect-ratio:1;min-height:92px;border-radius:18px;border:4px solid #2b1b0d;color:#fff;font:900 2.6rem/1 Georgia,serif;text-shadow:0 0 6px #000,0 0 3px #000;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .prp-pad[aria-disabled="true"]{cursor:default}
  .prp-pad.prp-on{outline:8px solid #ffe14d;outline-offset:2px;filter:brightness(1.35)}
  .prp-dots{display:flex;gap:8px;justify-content:center;margin:6px 0}.prp-dot{width:18px;height:18px;border-radius:50%;border:3px solid #2b1b0d;background:#fff}.prp-dot.prp-f{background:#1a365d}
  .prp-msg{min-height:3.2em;font-weight:700;margin:6px 0;text-align:center}.prp-fine{font-size:.95rem;color:#5b4630;text-align:center}
  .prp-modes button{font-size:.98rem}
  .prp-art a{display:inline-flex;align-items:center;min-height:44px;font-weight:700}
  </style>`;
}
function _prShell(inner) { const el = document.getElementById('gameContent'); if (!el || gameState.currentId !== 'sequence') return null; el.innerHTML = `<div class="prp" dir="ltr">${_seqModeRow('porch')}${inner}<p class="prp-fine">For entertainment and practice. Not a medical test or treatment. Not music lessons or therapy.</p><p class="prp-fine prp-art">Read more: <a href="article-play-a-rhythm-not-a-health-promise.html">Play a rhythm, not a health promise</a> &middot; <a href="article-let-the-player-choose.html">Let the player choose</a></p></div>${_prStyle()}`; return el; }
function _prSeg(label, key, vals) { const g = gameState.sequence.pr; return `<div class="prp-card"><div id="prp-l-${key}"><b>${label}</b></div><div class="prp-seg" role="group" aria-labelledby="prp-l-${key}">${vals.map(([v, t]) => `<button type="button" aria-pressed="${g.prefs[key] === v}" onclick="_prPref('${key}',${typeof v === 'string' ? `'${v}'` : v})">${t}</button>`).join('')}</div></div>`; }
function _prPref(k, v) { const g = gameState.sequence.pr; g.prefs[k] = v; _prSet(g.prefs); if (k === 'sound' && v) _prBeep(0); if (g.phase === 'start') _prStart(); else { _prMsgPref(); } }
function _prMsgPref() { const g = gameState.sequence.pr; const b = document.getElementById('prp-sound'); if (b) { b.textContent = g.prefs.sound ? 'Sound: on (press to mute)' : 'Sound: off (press to turn on)'; b.setAttribute('aria-pressed', String(g.prefs.sound)); } }
function _prBeep(i) {
  const g = gameState.sequence.pr; if (!g || !g.prefs.sound) return;
  try { _tone(_PR_FREQ[i], 0.32, 'sine', 0.07); } catch (e) { if (!g._soundWarned) { g._soundWarned = true; g.msg = 'Sound is not available here. Every step is still shown on the pads.'; } }
}
function _prStart() {
  const g = gameState.sequence; g._mode = 'porch';
  const pr = g.pr = Object.assign(g.pr || {}, { prefs: Object.assign({ len: 3, pace: 'normal', sound: false }, _prGet()), phase: 'start', token: (g.pr && g.pr.token || 0) + 1, phrase: 0, results: [], msg: '' });
  const h = _prShell(`<h3 tabindex="-1" id="prp-h">Porch Rhythm</h3>
    <div class="prp-card"><p style="margin:0">Watch a short pattern on four numbered pads, then press the pads in the <b>same order</b>. Only the order matters - there is no clock. You can replay any time, skip a phrase, and play completely in silence.</p></div>
    <h3 style="font-size:1.1rem">Your choices</h3>
    ${_prSeg('How long should each pattern be?', 'len', [[2, '2 pads'], [3, '3 pads'], [4, '4 pads']])}
    ${_prSeg('How quickly should it play?', 'pace', [['slow', 'Slow'], ['normal', 'Normal']])}
    ${_prSeg('Sound (plain tones, quiet)', 'sound', [[false, 'Off'], [true, 'On']])}
    <div class="prp-row"><button type="button" class="prp-btn prp-main" id="prp-go" onclick="_prBegin()">Start</button></div>`);
  if (h) { const hd = document.getElementById('prp-h'); if (hd) hd.focus(); }
  if (!pr._vis) { pr._vis = true; document.addEventListener('visibilitychange', _prVis); }
}
function _prVis() { const g = gameState.sequence && gameState.sequence.pr; if (!g || gameState.currentId !== 'sequence') return; if (document.hidden && g.phase === 'play') { g.token++; g.phase = 'idle'; g.msg = 'Playback paused while this tab was hidden. Press Replay to watch it again.'; _prRender(); } }
function _prBegin() { const g = gameState.sequence.pr; g.phrase = 0; g.results = []; _prPhrase(); }
function _prNew(len) { const s = []; for (let i = 0; i < len; i++) s.push(Math.floor(Math.random() * 4)); if (len > 1 && s.every((x) => x === s[0])) s[len - 1] = (s[0] + 1 + Math.floor(Math.random() * 3)) % 4; return s; }
function _prPhrase() { const g = gameState.sequence.pr; g.seq = _prNew(+g.prefs.len); g.entry = []; g.tries = 0; g.replayed = false; g.skipped = false; g.msg = ''; _prPlay(true); }
async function _prPlay(first) {
  const g = gameState.sequence.pr; const tk = ++g.token; g.phase = 'play'; g.entry = []; g.on = -1; g.now = ''; if (!first) g.replayed = true;
  g.msg = 'Watch' + (g.prefs.sound ? ' and listen' : '') + '...'; _prRender();
  const step = g.prefs.pace === 'slow' ? 900 : 600, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await wait(450);
  for (let i = 0; i < g.seq.length; i++) {
    if (tk !== g.token || gameState.currentId !== 'sequence') return;
    g.on = g.seq[i]; g.now = `Now: pad ${g.seq[i] + 1} (step ${i + 1} of ${g.seq.length})`; _prBeep(g.seq[i]); _prLight();
    await wait(step * (reduce ? 1 : 0.7)); if (tk !== g.token) return; g.on = -1; _prLight(); await wait(step * 0.3 + 120);
  }
  if (tk !== g.token || gameState.currentId !== 'sequence') return;
  g.phase = 'enter'; g.now = ''; g.msg = `Your turn: press the ${g.seq.length} pads in the same order. (Keys 1 to 4 work too.)`; _prRender('prp-pad-0');
}
function _prLight() { const g = gameState.sequence.pr; document.querySelectorAll('.prp-pad').forEach((b, i) => b.classList.toggle('prp-on', g.on === i)); const n = document.getElementById('prp-now'); if (n) n.textContent = g.on >= 0 ? g.now : ''; }
function _prPress(i) {
  const g = gameState.sequence.pr; if (!g || g.phase !== 'enter') return;   // ignored while the pattern plays or between phrases
  _prBeep(i); g.entry.push(i); const k = g.entry.length - 1;
  if (g.seq[k] !== i) { g.tries++; g.entry = []; g.msg = 'Not that one. Press Replay to watch again, or just try again from the first pad.'; return _prRender('prp-msg'); }
  if (g.entry.length === g.seq.length) { g.phase = 'between'; const first = g.tries === 0 && !g.replayed; g.results.push({ first, skipped: false }); g.msg = first ? 'That is it - phrase complete.' : 'That is it - phrase complete (with a replay or a retry).'; return _prRender('prp-next'); }
  g.msg = `${g.entry.length} of ${g.seq.length} so far.`; _prRender();
}
function _prSkip() { const g = gameState.sequence.pr; if (!g || !(g.phase === 'enter' || g.phase === 'idle' || g.phase === 'play')) return; g.token++; g.phase = 'between'; g.results.push({ first: false, skipped: true }); g.msg = `Skipped. The pattern was ${g.seq.map((x) => x + 1).join(', ')}.`; _prRender('prp-next'); }
function _prNext() { const g = gameState.sequence.pr; if (g.phase !== 'between') return; g.phrase++; if (g.phrase >= 3) return _prDone(true); _prPhrase(); }
function _prReplay() { const g = gameState.sequence.pr; if (!g || g.phase === 'between' || g.phase === 'start') return; _prPlay(false); }
function _prSound() { const g = gameState.sequence.pr; g.prefs.sound = !g.prefs.sound; _prSet(g.prefs); if (g.prefs.sound) _prBeep(0); _prMsgPref(); }
function _prEnd() { _prDone(false); }
function _prDone(complete) {
  const g = gameState.sequence.pr; if (g.phase === 'done') return; g.token++; g.phase = 'done'; const r = g.results, first = r.filter((x) => x.first).length, sk = r.filter((x) => x.skipped).length, as = r.length - first - sk;
  const text = `${r.length} phrase${r.length === 1 ? '' : 's'} finished${complete ? '' : ' (round ended early)'}; ${first} matched on the first try; ${as} needed a replay or a retry; ${sk} skipped.`;
  _prShell(`<h3 tabindex="-1" id="prp-h">${complete ? 'Three phrases done' : 'Round ended'}</h3><div class="prp-card" role="status"><p style="margin:0;font-weight:700">${text}</p><p style="margin:.5em 0 0">These are counts for this round only. They say nothing about memory or musical ability.</p></div><div class="prp-row"><button type="button" class="prp-btn prp-main" onclick="_seqMode('porch')">Play again</button><button type="button" class="prp-btn" onclick="showHome()">Menu</button></div>`);
  const hd = document.getElementById('prp-h'); if (hd) hd.focus(); GameKit.finish('sequence', complete, text);
}
function _prRender(focusId) {
  const _pf = document.activeElement && document.activeElement.id;
  const g = gameState.sequence.pr; if (gameState.currentId !== 'sequence' || g.phase === 'start' || g.phase === 'done') return;
  const live = g.phase === 'enter';
  const pads = [0, 1, 2, 3].map((i) => `<button type="button" id="prp-pad-${i}" class="prp-pad${g.on === i ? ' prp-on' : ''}" style="background:${_PR_PAT[i]},${_PR_COL[i]}" ${live ? '' : 'aria-disabled="true"'} onclick="_prPress(${i})" aria-label="Pad ${i + 1}, ${_PR_NAME[i]}${g.on === i ? ', playing now' : ''}">${i + 1}</button>`).join('');
  const dots = g.seq.map((_, i) => `<span class="prp-dot${i < g.entry.length ? ' prp-f' : ''}"></span>`).join('');
  _prShell(`<div class="prp-row" style="justify-content:space-between"><b>Phrase ${Math.min(g.phrase + 1, 3)} of 3</b><button type="button" class="prp-btn" onclick="_prEnd()">End round</button></div>
    <div class="prp-msg" id="prp-msg" tabindex="-1" role="status" aria-live="polite">${g.msg}</div>
    <div class="prp-msg" id="prp-now" aria-live="polite" style="min-height:1.6em"></div>
    <div class="prp-pads" role="group" aria-label="Four pads">${pads}</div>
    <div class="prp-dots" aria-label="${g.entry.length} of ${g.seq.length} entered">${dots}</div>
    <div class="prp-row" style="justify-content:center"><button type="button" class="prp-btn" id="prp-replay" onclick="_prReplay()" ${g.phase === 'between' ? 'disabled' : ''}>Replay</button><button type="button" class="prp-btn" id="prp-sound" aria-pressed="${g.prefs.sound}" onclick="_prSound()">${g.prefs.sound ? 'Sound: on (press to mute)' : 'Sound: off (press to turn on)'}</button><button type="button" class="prp-btn" onclick="_prSkip()" ${g.phase === 'between' ? 'disabled' : ''}>Skip this phrase</button>${g.phase === 'between' ? `<button type="button" class="prp-btn prp-main" id="prp-next" onclick="_prNext()">${g.phrase >= 2 ? 'Finish' : 'Next phrase'}</button>` : ''}</div>`);
  { const f = document.getElementById(focusId || _pf); if (f) f.focus(); }   // keep keyboard focus on the same control across re-renders
}
document.addEventListener('keydown', (e) => {
  const g = gameState && gameState.sequence && gameState.sequence.pr; if (!g || gameState.currentId !== 'sequence' || gameState.sequence._mode !== 'porch' || g.phase !== 'enter' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  const n = '1234'.indexOf(e.key); if (n >= 0 && e.key.length === 1) { _prPress(n); e.preventDefault(); }
});
