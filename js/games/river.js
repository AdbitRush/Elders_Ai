// ═══════════════════════════════════════════════════════════════════════════════
// RIVER CROSSING (2026-11, nostalgia batch 3) — the classic riddles about getting everyone across a river in a small
// boat. Easy: the farmer with a fox, a hen and a sack of grain (fox eats hen, hen eats grain, if left alone).
// Normal: three hens and three foxes, a boat for two; foxes may never outnumber hens on either bank. Hard: four
// people cross a narrow bridge at night with one lantern; at most two at a time, walking at the slower one's pace;
// everyone over within 17 minutes. Tap who goes in the boat (or on the bridge), then Cross. A move that breaks a
// rule is explained and can be undone. No clock: the minutes in the bridge puzzle are only counted, never timed.
// ═══════════════════════════════════════════════════════════════════════════════
const _RV_SC = {
    easy: { name: 'Farmer, fox, hen and grain', who: ['Farmer', 'Fox', 'Hen', 'Grain'], icon: ['user-round', 'dog', 'bird', 'leaf'], seats: 2, driver: [0] },
    normal: { name: 'Three hens and three foxes', who: ['Hen', 'Hen', 'Hen', 'Fox', 'Fox', 'Fox'], icon: ['bird', 'bird', 'bird', 'dog', 'dog', 'dog'], seats: 2, driver: null },
    hard: { name: 'The bridge at night', who: ['Ann (1 min)', 'Bob (2 min)', 'Cy (5 min)', 'Di (10 min)'], icon: ['user-round', 'user-round', 'user-round', 'user-round'], seats: 2, driver: null, times: [1, 2, 5, 10], limit: 17 },
};
function _rvBad(sc, side, boat) {
    // side: array 0 = left bank, 1 = right bank for each one; boat side b. Returns a reason or ''
    const at = (s) => sc.who.map((_, i) => i).filter((i) => side[i] === s);
    if (sc.driver) {   // farmer puzzle: trouble on the bank without the farmer
        for (const s of [0, 1]) { const here = at(s); if (here.includes(0)) continue; if (here.includes(1) && here.includes(2)) return 'The fox ate the hen while the farmer was away!'; if (here.includes(2) && here.includes(3)) return 'The hen ate the grain while the farmer was away!'; }
    } else if (!sc.times) {
        for (const s of [0, 1]) { const h = at(s).filter((i) => i < 3).length, f = at(s).filter((i) => i >= 3).length; if (h && f > h) return `On the ${s ? 'far' : 'near'} bank the foxes outnumber the hens!`; }
    }
    return '';
}
function initRiver() {
    NK.start('river', {
        setup(gs, diff) {
            gs.sc = _RV_SC[diff] || _RV_SC.normal; gs.side = gs.sc.who.map(() => 0); gs.boat = 0; gs.pick = []; gs.hist = []; gs.trips = 0; gs.mins = 0; gs.over = false; gs.bad = '';
            gs.msg = `${gs.sc.name}: get everyone to the far bank. Tap who goes, then Cross.`;
        },
        view: _rvView,
        keys: { KeyU: () => rvUndo(), KeyC: () => rvCross() },
        rules: (gs) => gs.sc.driver ? [
            'Get the farmer, the fox, the hen and the grain to the far bank.',
            'The boat holds the <b>farmer and one more</b>. Only the farmer can row.',
            'If the farmer is not there, the <b>fox eats the hen</b> and the <b>hen eats the grain</b>.',
            'Tap who goes in the boat, then press Cross. Undo takes back a trip. No clock.']
            : gs.sc.times ? [
                'Four people must cross a narrow bridge at night. They have <b>one lantern</b>, and the bridge holds at most <b>two</b> at a time.',
                'Anyone on the bridge needs the lantern, so someone must bring it back each time. A pair walks at the <b>slower</b> one\'s pace.',
                `Ann takes 1 minute, Bob 2, Cy 5 and Di 10. Get everyone across in <b>${gs.sc.limit} minutes</b> or less.`,
                'The minutes are only counted - nothing is timed. Tap who goes, then Cross. Undo takes back a trip.']
                : [
                    'Get three hens and three foxes to the far bank. The boat holds <b>one or two</b>, and anyone can row.',
                    'On either bank, the <b>foxes must never outnumber the hens</b> (when there are hens there). The boat counts with the bank it is moored at.',
                    'Tap who goes in the boat, then press Cross. Undo takes back a trip. No clock.'],
        css: `.rv-scene{display:grid;grid-template-columns:1fr minmax(70px,22%) 1fr;gap:6px;align-items:stretch;max-width:40rem;margin:0 auto}
.rv-bank{background:linear-gradient(#bbf7d0,#86efac);border-radius:14px;padding:8px;display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start;min-height:150px}
.rv-water{background:repeating-linear-gradient(180deg,#60a5fa 0 10px,#3b82f6 10px 20px);border-radius:10px;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:4px}
.rv-boat{background:#92400e;color:#fff7e6;border-radius:0 0 22px 22px;padding:6px 4px;font-weight:800;font-size:.85rem;text-align:center;width:100%}
.rv-p{min-height:52px;min-width:52px;border:2px solid #15803d;background:#fff;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 .8rem/1.1 system-ui;color:#14532d;cursor:pointer;padding:3px 5px;--nk-r:12px;--nk-bw:2px}
.rv-p svg{width:26px;height:26px}
.rv-p.rv-in{background:#fde68a;border-color:#b45309;color:#2b1b0d}
.rv-p:disabled{opacity:.55;cursor:default}
.rv-lab{width:100%;text-align:center;font-weight:900;color:#14532d}
.rv-bad{background:#fee2e2;border:2px solid #b91c1c;color:#7f1d1d;border-radius:12px;padding:8px;text-align:center;font-weight:800;margin-top:8px}`,
    });
}
function rvPick(i) {
    const gs = gameState.river; if (gs.over || gs.bad) return;
    if (gs.side[i] !== gs.boat) { gs.msg = `The ${gs.sc.times ? 'lantern' : 'boat'} is on the other side.`; return NK.render('river'); }
    const k = gs.pick.indexOf(i);
    if (k >= 0) gs.pick.splice(k, 1); else { if (gs.pick.length >= gs.sc.seats) { gs.msg = `Only ${gs.sc.seats} at a time.`; return NK.render('river'); } gs.pick.push(i); }
    gs.msg = gs.pick.length ? `Going: ${gs.pick.map((x) => gs.sc.who[x].split(' (')[0]).join(' and ')}. Press Cross.` : 'Tap who goes.';
    NK.render('river');
}
function rvCross() {
    const gs = gameState.river; if (gs.over || gs.bad) return;
    if (!gs.pick.length) { gs.msg = 'Pick who goes first.'; return NK.render('river'); }
    if (gs.sc.driver && !gs.pick.includes(0)) { gs.msg = 'Only the farmer can row the boat.'; return NK.render('river'); }
    gs.hist.push({ side: gs.side.slice(), boat: gs.boat, mins: gs.mins, trips: gs.trips });
    gs.pick.forEach((i) => (gs.side[i] = 1 - gs.boat));
    const took = gs.sc.times ? Math.max(...gs.pick.map((i) => gs.sc.times[i])) : 0;
    gs.mins += took; gs.boat = 1 - gs.boat; gs.trips++; const who = gs.pick.map((x) => gs.sc.who[x].split(' (')[0]).join(' and '); gs.pick = [];
    if (typeof sfxFlip === 'function') sfxFlip();
    gs.bad = _rvBad(gs.sc, gs.side, gs.boat);
    if (gs.bad) { gs.msg = 'Oh dear. Press Undo to take that trip back.'; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('river'); }
    if (gs.side.every((s) => s === 1)) {
        const ok = !gs.sc.times || gs.mins <= gs.sc.limit;
        if (!ok) { gs.bad = `Everyone is over, but it took ${gs.mins} minutes - the lantern only lasts ${gs.sc.limit}.`; gs.msg = 'So close. Undo a few trips and look for a faster way: who should bring the lantern back?'; return NK.render('river'); }
        gs.over = true; gs.msg = `Everyone is across in ${NK.pl(gs.trips, 'trip')}${gs.sc.times ? ` and ${gs.mins} minutes` : ''}!`; NK.render('river');
        if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('river', true, `${gs.sc.name}: solved in ${NK.pl(gs.trips, 'trip')}${gs.sc.times ? `, ${gs.mins} minutes` : ''}.`);
    }
    gs.msg = `${who} crossed${took ? ` (${took} min, ${gs.mins} so far)` : ''}.`;
    NK.render('river');
}
function rvUndo() { const gs = gameState.river; if (gs.over || !gs.hist.length) return; const h = gs.hist.pop(); gs.side = h.side; gs.boat = h.boat; gs.mins = h.mins; gs.trips = h.trips; gs.pick = []; gs.bad = ''; gs.msg = 'Trip taken back.'; NK.render('river'); }
function rvNew() { initRiver(); }
function _rvView(gs) {
    const sc = gs.sc, can = !gs.over && !gs.bad;
    const person = (i) => `<button type="button" class="nk-cell rv-p${gs.pick.includes(i) ? ' rv-in' : ''}" onclick="rvPick(${i})" data-k="p${i}"${i === 0 ? ' data-first' : ''} aria-pressed="${gs.pick.includes(i)}" aria-label="${sc.who[i]}${gs.pick.includes(i) ? ', going' : ''}"${can && gs.side[i] === gs.boat ? '' : ' disabled'}>${Icon.svg(sc.icon[i], { size: '26px', sw: 2.4 })}<span>${sc.who[i].replace(' (', '<br>(')}</span></button>`;
    const bank = (s) => `<div class="rv-bank" aria-label="${s ? 'far' : 'near'} bank"><span class="rv-lab">${s ? 'Far bank' : 'Near bank'}</span>${sc.who.map((_, i) => i).filter((i) => gs.side[i] === s).map(person).join('')}</div>`;
    return `<div class="nk-top"><span>Trips: <b>${gs.trips}</b></span>${sc.times ? `<span>Minutes: <b>${gs.mins}</b> of ${sc.limit}</span>` : ''}<span>${sc.name}</span></div>
      <div class="rv-scene">${bank(0)}<div class="rv-water"><div class="rv-boat" style="align-self:${gs.boat ? 'flex-end' : 'flex-start'}">${sc.times ? 'Lantern' : 'Boat'}<br>${gs.boat ? 'far side' : 'near side'} ${Icon.svg(gs.boat ? 'arrow-right' : 'arrow-left', { size: '16px', sw: 3 })}</div></div>${bank(1)}</div>
      ${gs.bad ? `<div class="rv-bad" role="alert">${gs.bad}</div>` : ''}
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('sailboat') + 'Cross', 'rvCross()', { cls: 'gk-primary', k: 'cross', disabled: !can || !gs.pick.length })}${NK.btn(NK.icon('undo-2') + 'Undo', 'rvUndo()', { k: 'undo', disabled: gs.over || !gs.hist.length })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'rvNew()', { k: 'restart' })}</div>`;
}
