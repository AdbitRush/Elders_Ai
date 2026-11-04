// ═══════════════════════════════════════════════════════════════════════════════
// CAVE HUNT (2026-11, nostalgia batch 3) — an original, gentle take on the hide-and-seek cave games of the first
// home computers. Twenty caverns, each joined by tunnels to three others. Somewhere a sleeping BEAR has to be caught
// with a net and carried back to the park. Two caverns have deep PITS, and two have BATS that carry you off to a
// random cavern. You cannot see them, but next door you can sense them: "a cold draft" (pit), "flapping wings" (bats),
// "a bear's snore" (bear). Throw a net into a cavern next to you; a miss may wake the bear and it shuffles one cavern
// along. Walking in on the bear or falling in a pit costs a lantern (3 lanterns) and you start again at the entrance.
// Easy: 5 nets, the bear never wakes. Normal: 4 nets. Hard: 3 nets and it wakes on every miss. No clock.
// The caverns are the corners of a dodecahedron (the classic map), drawn flat as rings of 5, 10 and 5.
// ═══════════════════════════════════════════════════════════════════════════════
const _CV_ADJ = [null, [2, 5, 8], [1, 3, 10], [2, 4, 12], [3, 5, 14], [1, 4, 6], [5, 7, 15], [6, 8, 17], [1, 7, 9], [8, 10, 18], [2, 9, 11], [10, 12, 19], [3, 11, 13], [12, 14, 20], [4, 13, 15], [6, 14, 16], [15, 17, 20], [7, 16, 18], [9, 17, 19], [11, 18, 20], [13, 16, 19]];
function _cvPos(k) {   // flat drawing: outer 1-5, middle 6-15, inner 16-20 (percent of the map)
    let a, r;
    if (k <= 5) { a = { 1: 72, 2: 144, 3: 216, 4: 288, 5: 0 }[k]; r = 46; } else if (k <= 15) { a = (k - 6) * 36; r = 31; } else { a = { 16: 324, 17: 36, 18: 108, 19: 180, 20: 252 }[k]; r = 15; }
    const t = (a - 90) * Math.PI / 180; return [50 + r * Math.cos(t), 50 + r * Math.sin(t)];
}
function initCavehunt() {
    NK.start('cavehunt', {
        setup(gs, diff) {
            gs.diff = diff; gs.nets = diff === 'easy' ? 5 : diff === 'hard' ? 3 : 4; gs.lamps = 3; gs.over = false; gs.mode = 'walk';
            const rooms = shuffle([...Array(20).keys()].map((x) => x + 1).filter((x) => x !== 1)); gs.bear = rooms[0]; gs.pits = [rooms[1], rooms[2]]; gs.bats = [rooms[3], rooms[4]];
            gs.at = 1; gs.seen = { 1: _cvSense(gs, 1) }; gs.path = [1]; gs.moves = 0;
            gs.msg = 'You are at the cave entrance (cavern 1). ' + _cvSay(gs, 1);
        },
        view: _cvView,
        keys: { KeyN: () => cvMode() },
        rules: (gs) => [
            'Twenty caverns, each joined by tunnels to three others. Somewhere a sleeping <b>bear</b> waits to be caught with a net and taken to the park.',
            'Next to danger you can sense it: <b>a cold draft</b> means a pit next door, <b>flapping wings</b> means bats next door, <b>a bear\'s snore</b> means the bear is next door.',
            'Tap a joined cavern to walk there. Or switch to <b>Throw a net</b> and tap a joined cavern to throw into it. ' + (gs.diff === 'easy' ? 'A miss does not wake the bear on this level.' : 'A miss may wake the bear, and it shuffles to a cavern next to it.'),
            'Bats carry you to a random cavern. Falling in a pit or walking in on the bear costs a <b>lantern</b>, and you start again at the entrance. Lose all 3 lanterns, or all your nets, and the hunt is over.',
            'The map remembers what you sensed (S snore, D draft, W wings) in every cavern you visited. No clock. Keyboard: Tab and Enter, N switches between walking and throwing.'],
        css: `.cv-map{position:relative;width:min(100%,30rem,max(18rem,calc(100vh - 360px)));aspect-ratio:1;margin:0 auto;background:radial-gradient(circle,#44403c,#1c1917 75%);border-radius:50%;box-shadow:inset 0 0 0 4px #0c0a09}
.cv-svg{position:absolute;inset:0;width:100%;height:100%}
#gameContent .nk button.cv-r{position:absolute}
.cv-r{width:11%;height:11%;margin:-5.5% 0 0 -5.5%;border-radius:50%;border:3px solid #78716c;background:#292524;color:#a8a29e;font:800 clamp(.75rem,3vw,1rem) system-ui,sans-serif;padding:0;--nk-r:50%;--nk-bw:3px;display:flex;align-items:center;justify-content:center;z-index:2}
.cv-r.cv-vis{background:#57534e;color:#fafaf9}
.cv-r.cv-here{background:#facc15;color:#1c1917;border-color:#fef08a;box-shadow:0 0 0 4px rgba(250,204,21,.35),0 0 22px #facc15}
.cv-r.cv-next{border-color:#4ade80;background:#14532d;color:#fff;cursor:pointer}
.cv-r.cv-net{border-color:#f97316;background:#7c2d12;color:#fff;cursor:pointer}
.cv-r:disabled{cursor:default;opacity:1}
.cv-tags{position:absolute;left:50%;top:100%;transform:translateX(-50%);display:flex;gap:1px;font-size:.7rem;white-space:nowrap}
.cv-t{display:inline-flex;width:15px;height:15px;border-radius:50%;font:900 .62rem system-ui,sans-serif;font-style:normal;align-items:center;justify-content:center;color:#fff}.cv-tb{background:#b45309}.cv-td{background:#0284c7}.cv-tw{background:#7c3aed}
.cv-sense{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0 0}
.cv-sense span{background:#f5f5f4;border-radius:999px;padding:4px 12px;font-weight:800;border:2px solid #d6d3d1}
.cv-sense span.cv-on{background:#fde68a;border-color:#b45309}
.cv-mode{display:flex;justify-content:center;gap:8px;margin:10px 0 0}
.cv-lamps i{display:inline-block;width:12px;height:16px;border-radius:4px 4px 2px 2px;background:#facc15;margin:0 2px;vertical-align:-2px;border:1px solid #92400e}.cv-lamps i.cv-off{background:transparent}`,
    });
}
function _cvSense(gs, r) { const n = _CV_ADJ[r]; return { draft: n.some((x) => gs.pits.includes(x)), bats: n.some((x) => gs.bats.includes(x)), bear: n.includes(gs.bear) }; }
function _cvSay(gs, r) { const s = _cvSense(gs, r), out = []; if (s.bear) out.push("You hear a bear's snore nearby."); if (s.draft) out.push('You feel a cold draft.'); if (s.bats) out.push('You hear flapping wings.'); return out.length ? out.join(' ') : 'All is quiet here.'; }
function cvMode() { const gs = gameState.cavehunt; if (gs.over) return; gs.mode = gs.mode === 'walk' ? 'net' : 'walk'; gs.msg = gs.mode === 'net' ? `Net ready (${NK.pl(gs.nets, 'net')} left). Tap a joined cavern to throw into it.` : 'Walking. Tap a joined cavern to go there.'; NK.render('cavehunt'); }
function cvRoom(r) {
    const gs = gameState.cavehunt; if (gs.over || !_CV_ADJ[gs.at].includes(r)) return;
    if (gs.mode === 'net') return _cvThrow(gs, r);
    gs.moves++; if (typeof sfxFlip === 'function') sfxFlip();
    _cvEnter(gs, r, '');
}
function _cvEnter(gs, r, pre) {
    gs.at = r; gs.path.push(r);
    if (r === gs.bear) return _cvLose(gs, `${pre}You walked right in on the bear! It grumbles and you hurry back to the entrance.`);
    if (gs.pits.includes(r)) return _cvLose(gs, `${pre}A pit! You slip down and climb out at the entrance.`);
    if (gs.bats.includes(r)) { let to; do to = 1 + Math.floor(Math.random() * 20); while (to === r || to === gs.bear || gs.pits.includes(to)); gs.seen[r] = _cvSense(gs, r); return _cvEnter(gs, to, `${pre}Bats! They carry you off to cavern ${to}. `); }
    gs.seen[r] = _cvSense(gs, r); gs.msg = `${pre}Cavern ${r}. ${_cvSay(gs, r)}`; NK.render('cavehunt');
}
function _cvLose(gs, said) {
    gs.lamps--; if (typeof sfxWrong === 'function') sfxWrong();
    if (gs.lamps <= 0) { gs.over = true; gs.msg = said + ' That was your last lantern.'; NK.render('cavehunt'); return NK.finish('cavehunt', false, `The lanterns ran out. The bear was in cavern ${gs.bear}. A new cave is one tap away.`); }
    gs.at = 1; gs.msg = `${said} ${NK.pl(gs.lamps, 'lantern')} left. ${_cvSay(gs, 1)}`; NK.render('cavehunt');
}
function _cvThrow(gs, r) {
    gs.nets--; gs.mode = 'walk'; if (typeof sfxFlip === 'function') sfxFlip();
    if (r === gs.bear) { gs.over = true; gs.msg = `Caught! The bear was asleep in cavern ${r}. Off to the park it goes.`; NK.render('cavehunt'); if (typeof sfxCorrect === 'function') sfxCorrect(); return NK.finish('cavehunt', true, `Bear caught in cavern ${r} with ${NK.pl(gs.nets, 'net')} to spare, after ${NK.pl(gs.moves, 'walk')}.`); }
    let said = `The net lands in cavern ${r}: empty.`;
    const wake = gs.diff === 'easy' ? 0 : gs.diff === 'hard' ? 1 : 0.5;
    if (Math.random() < wake) { const opts = _CV_ADJ[gs.bear].filter((x) => !gs.pits.includes(x) && x !== gs.at); if (opts.length) { gs.bear = opts[Math.floor(Math.random() * opts.length)]; said += ' You hear the bear wake and shuffle to another cavern.'; gs.seen = { [gs.at]: _cvSense(gs, gs.at) }; said += ' (Your old notes no longer fit; the map is cleared.)'; } }
    if (gs.bear === gs.at) return _cvLose(gs, said + ' It shuffled right into you!');
    if (!gs.nets) { gs.over = true; gs.msg = said + ' That was your last net.'; NK.render('cavehunt'); return NK.finish('cavehunt', false, `Out of nets. The bear was in cavern ${gs.bear}. A new cave is one tap away.`); }
    gs.msg = `${said} ${_cvSay(gs, gs.at)}`; NK.render('cavehunt');
}
function cvNew() { initCavehunt(); }
function _cvView(gs) {
    let lines = '', rooms = ''; const next = _CV_ADJ[gs.at];
    for (let a = 1; a <= 20; a++) for (const b of _CV_ADJ[a]) if (b > a) { const [x1, y1] = _cvPos(a), [x2, y2] = _cvPos(b), lit = (a === gs.at || b === gs.at); lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lit ? '#facc15' : '#57534e'}" stroke-width="${lit ? 1.4 : 0.8}"/>`; }
    for (let r = 1; r <= 20; r++) {
        const [x, y] = _cvPos(r), s = gs.seen[r], here = r === gs.at, nx = next.includes(r) && !gs.over;
        const tags = s && !here ? `<span class="cv-tags" aria-hidden="true">${s.bear ? '<i class="cv-t cv-tb">S</i>' : ''}${s.draft ? '<i class="cv-t cv-td">D</i>' : ''}${s.bats ? '<i class="cv-t cv-tw">W</i>' : ''}</span>` : '';
        const lab = `cavern ${r}${here ? ', you are here' : ''}${s ? `, visited${s.bear ? ', snore' : ''}${s.draft ? ', draft' : ''}${s.bats ? ', wings' : ''}${!s.bear && !s.draft && !s.bats ? ', quiet' : ''}` : ''}${nx ? (gs.mode === 'net' ? ', throw a net here' : ', walk here') : ''}`;
        rooms += `<button type="button" class="nk-cell cv-r${s ? ' cv-vis' : ''}${here ? ' cv-here' : ''}${nx ? (gs.mode === 'net' ? ' cv-net' : ' cv-next') : ''}" style="left:${x}%;top:${y}%" onclick="cvRoom(${r})" data-k="r${r}"${nx && r === next[0] ? ' data-first' : ''} aria-label="${lab}"${nx ? '' : ' disabled'}>${r}${tags}</button>`;
    }
    const S = _cvSense(gs, gs.at), lamps = [0, 1, 2].map((k) => `<i class="${k < gs.lamps ? '' : 'cv-off'}"></i>`).join('');
    return `<div class="nk-top"><span>Cavern <b>${gs.at}</b></span><span>Nets: <b>${gs.nets}</b></span><span class="cv-lamps" role="img" aria-label="${NK.pl(gs.lamps, 'lantern')}">Lanterns ${lamps}</span></div>
      <div class="cv-map"><svg class="cv-svg" viewBox="0 0 100 100" aria-hidden="true">${lines}</svg>${rooms}</div>
      <div class="cv-sense" aria-hidden="true"><span class="${S.bear ? 'cv-on' : ''}"><i class="cv-t cv-tb">S</i> Snore</span><span class="${S.draft ? 'cv-on' : ''}"><i class="cv-t cv-td">D</i> Draft</span><span class="${S.bats ? 'cv-on' : ''}"><i class="cv-t cv-tw">W</i> Wings</span></div>
      <div class="cv-mode">${NK.btn('Walk', "gameState.cavehunt.mode==='walk'||cvMode()", { k: 'walk', pressed: gs.mode === 'walk', disabled: gs.over })}${NK.btn(`Throw a net (${gs.nets})`, "gameState.cavehunt.mode==='net'||cvMode()", { k: 'net', pressed: gs.mode === 'net', cls: gs.mode === 'net' ? 'gk-primary' : '', disabled: gs.over })}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New cave', 'cvNew()', { k: 'restart' })}</div>`;
}
