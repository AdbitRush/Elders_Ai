// ═══════════════════════════════════════════════════════════════════════════════
// THE OLD LIGHTHOUSE (2026-11, nostalgia batch 3) — an original short text adventure in the style of the first
// computer adventure games, played with buttons instead of typing. A storm is coming and the lighthouse lamp has gone
// out; a fishing boat is due tonight. Explore the little island, find what you need and light the lamp.
// Verbs are buttons: walk to the places shown, Look around, Look closely at things, Take and Use what you carry.
// Easy: Hint button, no move limit. Normal: hints are counted. Hard: no hints, and the lamp must be lit within
// 45 moves before the boat reaches the rocks. Each new game shuffles where the key and the matches are hidden.
// ═══════════════════════════════════════════════════════════════════════════════
const _AV_ROOM = {
    dock: { name: 'the dock', text: 'Waves slap the old wooden dock. Dark clouds pile up over the sea. A path climbs north toward the lighthouse; a cottage stands to the east.', exits: { north: 'path', east: 'cottage' } },
    cottage: { name: "the keeper's cottage", text: "The keeper's cottage is tidy and cold. A rag rug lies by the door, a cupboard stands against the wall, and a window looks out over the dock to the west.", exits: { west: 'dock' }, things: ['rug', 'cupboard'] },
    path: { name: 'the cliff path', text: 'A windy path along the cliff. The lighthouse towers to the north. A small shed with a padlock sits to the east. The dock is back south.', exits: { north: 'base', south: 'dock', east: 'shed' } },
    shed: { name: 'the tool shed', text: 'Rakes, nets and paint pots crowd the shed. A wooden trapdoor in the floor leads down.', exits: { west: 'path', down: 'cellar' }, things: ['shelf'], locked: true },
    cellar: { name: 'the cellar', text: 'A damp stone cellar. Barrels line the walls.', exits: { up: 'shed' }, dark: true, things: ['barrels'] },
    base: { name: 'the foot of the lighthouse', text: 'The great white tower rises above you. Iron stairs spiral up inside the open door. The path runs back south.', exits: { up: 'lamp', south: 'path' }, things: ['logbook'] },
    lamp: { name: 'the lamp room', text: 'At the top of the tower, wind howls around the glass. The great lamp sits in the middle, its oil tank dry and its wick cold.', exits: { down: 'base' }, things: ['lamp'] },
};
const _AV_ITEM = { key: 'small brass key', matches: 'box of matches', lantern: 'hand lantern', oil: 'can of lamp oil' };
function initAdventure() {
    NK.start('adventure', {
        setup(gs, diff) {
            gs.diff = diff; gs.at = 'dock'; gs.inv = []; gs.moves = 0; gs.hints = 0; gs.over = false; gs.flags = {}; gs.log = [];
            // where the key and matches are hidden changes each game
            const keyAt = shuffle(['rug', 'cupboard', 'logbook'])[0]; gs.hide = { key: keyAt, matches: shuffle(['rug', 'cupboard'].filter((x) => x !== keyAt))[0] };   // the logbook says the matches are in the cottage
            gs.loose = { shelf: 'lantern', barrels: 'oil' };
            _avSay(gs, 'A storm is coming, and the lighthouse lamp is dark. The fishing boat is due tonight. ' + _avDesc(gs));
        },
        view: _avView,
        rules: (gs) => [
            'A storm is coming and the lighthouse lamp has gone out. <b>Light the lamp</b> before the fishing boat comes in.',
            'Tap a direction to walk. <b>Look around</b> describes where you are; <b>Look at</b> a thing to search it closely.',
            'Things you find can be <b>taken</b>; things you carry can be <b>used</b> in the right place.',
            gs.diff === 'hard' ? 'On this level the boat arrives after <b>45 moves</b>, and there are no hints.' : gs.diff === 'normal' ? 'Hints are there if you need them (each one is counted). No move limit.' : 'Tap Hint any time for a nudge. No move limit.',
            'No clock. Keyboard: Tab to a button, Enter to press it.'],
        css: `.av-scr{background:#0c1a12;color:#bbf7d0;border-radius:14px;padding:14px 16px;font:1.12rem/1.55 ui-monospace,Menlo,Consolas,monospace;box-shadow:inset 0 0 0 3px #14532d,inset 0 0 30px rgba(34,197,94,.15);min-height:12rem}
.av-scr h3{color:#fde68a;font-size:1.15rem;margin:0 0 6px;text-transform:uppercase;letter-spacing:.05em}
.av-scr p{margin:0 0 8px}
.av-scr .av-old{opacity:.55;font-size:1rem}
.av-sec{margin:12px 0 0}
.av-sec .gk-label{color:#78350f;text-align:left;margin:0 0 4px}
.av-row{display:flex;flex-wrap:wrap;gap:6px}
.av-inv{display:flex;flex-wrap:wrap;gap:6px;min-height:30px;align-items:center}
.av-inv span{background:#fef3c7;border:2px solid #f59e0b;border-radius:999px;padding:3px 12px;font-weight:800}`,
    });
}
function _avDesc(gs) {
    const R = _AV_ROOM[gs.at];
    if (R.dark && !gs.flags.lit) return `It is pitch dark down here in ${R.name}. You can't see a thing. Better go back up.`;
    let t = R.text;
    if (gs.at === 'shed' && R.locked && !gs.flags.shedOpen) t = 'The shed door is fastened with a brass padlock.';
    return t;
}
function _avSay(gs, t) { if (gs.msg) gs.log.push(gs.msg); gs.log = gs.log.slice(-2); gs.msg = t; }
function _avTick(gs) {
    gs.moves++;
    if (gs.diff === 'hard' && gs.moves >= 45 && !gs.over) { gs.over = true; _avSay(gs, 'Out in the dark the boat\'s horn sounds... and with no light to guide it, it turns back to sea. You did not make it in time.'); NK.render('adventure'); NK.finish('adventure', false, 'The boat could not find the harbor in time. A new game shuffles the hiding places.'); return true; }
    return false;
}
function avGo(dir) {
    const gs = gameState.adventure; if (gs.over) return; const R = _AV_ROOM[gs.at], to = R.exits[dir];
    if (!to) return;
    gs.found = null;
    if (to === 'shed' && !gs.flags.shedOpen && !gs.inv.includes('key')) { _avSay(gs, 'The shed door is fastened with a brass padlock. You need a key.'); if (_avTick(gs)) return; return NK.render('adventure'); }
    if (to === 'shed' && !gs.flags.shedOpen) { gs.flags.shedOpen = true; gs.inv = gs.inv.filter((x) => x !== 'key'); gs.at = 'shed'; _avSay(gs, 'The brass key turns in the padlock with a click, and the shed door swings open. ' + _avDesc(gs)); }
    else { gs.at = to; _avSay(gs, _avDesc(gs)); }
    if (typeof sfxFlip === 'function') sfxFlip(); if (_avTick(gs)) return; NK.render('adventure');
}
function avLook() { const gs = gameState.adventure; if (gs.over) return; _avSay(gs, _avDesc(gs)); NK.render('adventure'); }
function avExamine(th) {
    const gs = gameState.adventure; if (gs.over) return; let t = '';
    const hid = Object.keys(gs.hide).find((k) => gs.hide[k] === th && !gs.flags['got_' + k]);
    const text = { rug: 'An old rag rug, braided from scraps.', cupboard: 'A pine cupboard with a stiff door.', logbook: "The keeper's logbook lies on a stool. The last entry reads: 'Oil low. Spare cans in the cellar. Matches always dry in the cottage.'", shelf: 'A dusty shelf of odds and ends.', barrels: 'Old barrels, mostly empty.', lamp: gs.flags.oiled ? 'The lamp tank is full of oil. Now the wick just needs a flame.' : 'The tank of the great lamp is bone dry.' }[th];
    t = text;
    if (hid) { t += ` Tucked ${th === 'rug' ? 'underneath it' : th === 'cupboard' ? 'inside' : 'between its pages'} you find a ${_AV_ITEM[hid]}!`; gs.found = hid; }
    else if (gs.loose[th] && !gs.flags['got_' + gs.loose[th]]) { t += ` There is a ${_AV_ITEM[gs.loose[th]]} here.`; gs.found = gs.loose[th]; }
    else gs.found = null;
    _avSay(gs, t); if (_avTick(gs)) return; NK.render('adventure');
}
function avTake() {
    const gs = gameState.adventure; if (gs.over || !gs.found) return; const it = gs.found;
    gs.inv.push(it); gs.flags['got_' + it] = true; gs.found = null; if (typeof sfxFlip === 'function') sfxFlip();
    _avSay(gs, `You take the ${_AV_ITEM[it]}.`); if (_avTick(gs)) return; NK.render('adventure');
}
function avUse(it) {
    const gs = gameState.adventure; if (gs.over) return; let t;
    if (it === 'matches' && gs.inv.includes('lantern') && !gs.flags.lit && gs.at !== 'lamp') { gs.flags.lit = true; t = 'You strike a match and light the hand lantern. A warm glow fills the space around you.'; if (gs.at === 'cellar') t += ' ' + _avDesc(gs); }
    else if (it === 'lantern') t = gs.flags.lit ? 'The lantern burns steadily.' : 'The lantern is not lit. You need a flame.';
    else if (it === 'oil' && gs.at === 'lamp') { gs.flags.oiled = true; gs.inv = gs.inv.filter((x) => x !== 'oil'); t = 'You pour the oil into the great lamp\'s tank until it is full.'; }
    else if (it === 'matches' && gs.at === 'lamp') {
        if (!gs.flags.oiled) t = 'You strike a match, but the wick is dry: the lamp needs oil first. The match goes out.';
        else { gs.over = true; t = 'You touch the match to the wick. The great lamp blazes, and its beam sweeps across the stormy sea. Far out, the fishing boat\'s horn answers. It is coming home safely!'; _avSay(gs, t); NK.render('adventure'); if (typeof sfxCorrect === 'function') sfxCorrect(); return NK.finish('adventure', true, `The lighthouse is lit in ${gs.moves} moves${gs.hints ? ` with ${NK.pl(gs.hints, 'hint')}` : ''}. The boat comes home safely.`); }
    }
    else if (it === 'oil') t = 'This oil is for the great lamp at the top of the lighthouse.';
    else if (it === 'matches') t = gs.inv.includes('lantern') ? 'The lantern is already lit.' : 'You strike a match. It flickers and goes out. Something to light would help.';
    else if (it === 'key') t = 'A small brass key. It looks like it fits a padlock.';
    _avSay(gs, t); if (_avTick(gs)) return; NK.render('adventure');
}
function avHint() {
    const gs = gameState.adventure; if (gs.over || gs.diff === 'hard') return; gs.hints++; const f = gs.flags, has = (x) => gs.inv.includes(x);
    const h = !f.shedOpen && !has('key') ? `Somewhere, a small key is hidden. Look closely at things: the ${gs.hide.key}?` : !f.shedOpen ? 'The key opens the shed off the cliff path.' : !f.got_lantern ? 'Look at the shelf in the shed.' : !has('matches') && !f.lit ? `The logbook says the matches are kept dry. Try the ${gs.hide.matches}.` : !f.lit ? 'Use the matches to light your lantern, then go down into the cellar.' : !f.got_oil ? 'Look at the barrels in the cellar.' : !f.oiled ? 'Carry the oil to the top of the lighthouse and use it there.' : 'Use the matches in the lamp room.';
    _avSay(gs, 'Hint: ' + h); NK.render('adventure');
}
function avNew() { initAdventure(); }
function _avView(gs) {
    const R = _AV_ROOM[gs.at], dark = R.dark && !gs.flags.lit;
    const exits = Object.keys(R.exits).map((d) => NK.btn((d === 'up' ? NK.icon('arrow-up') : d === 'down' ? NK.icon('arrow-down') : d === 'north' ? NK.icon('arrow-up') : d === 'south' ? NK.icon('arrow-down') : d === 'east' ? NK.icon('arrow-right') : NK.icon('arrow-left')) + `${d[0].toUpperCase() + d.slice(1)} to ${_AV_ROOM[R.exits[d]].name.replace(/^the /, '')}`, `avGo('${d}')`, { k: 'go' + d, disabled: gs.over })).join('');
    const things = dark ? '' : (R.things || []).map((t) => NK.btn(`Look at the ${t === 'logbook' ? 'logbook' : t}`, `avExamine('${t}')`, { k: 'x' + t, disabled: gs.over })).join('');
    const take = gs.found ? NK.btn(`Take the ${_AV_ITEM[gs.found]}`, 'avTake()', { k: 'take', cls: 'gk-primary', disabled: gs.over }) : '';
    const inv = gs.inv.map((x) => NK.btn(`Use the ${_AV_ITEM[x]}`, `avUse('${x}')`, { k: 'use' + x, disabled: gs.over })).join('');
    return `<div class="nk-top"><span>Moves: <b>${gs.moves}</b>${gs.diff === 'hard' ? ' of 45' : ''}</span>${gs.diff === 'hard' ? '' : `<span>Hints: <b>${gs.hints}</b></span>`}</div>
      <div class="av-scr"><h3>${R.name}</h3>${gs.log.map((t) => `<p class="av-old">${t}</p>`).join('')}</div>
      ${NK.msg(gs.msg)}
      <div class="av-sec"><div class="gk-label">Go</div><div class="av-row">${exits}</div></div>
      <div class="av-sec"><div class="gk-label">Here</div><div class="av-row">${NK.btn(NK.icon('eye') + 'Look around', 'avLook()', { k: 'look', disabled: gs.over })}${things}${take}</div></div>
      <div class="av-sec"><div class="gk-label">You carry</div><div class="av-row">${inv || '<span>Nothing yet.</span>'}</div></div>
      <div class="gk-btns">${gs.diff === 'hard' ? '' : NK.btn(NK.icon('lightbulb') + 'Hint', 'avHint()', { k: 'hint', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'avNew()', { k: 'restart' })}</div>`;
}
