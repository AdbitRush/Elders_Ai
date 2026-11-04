// ═══════════════════════════════════════════════════════════════════════════════
// PRAIRIE WAGON (2026-11, nostalgia batch 3) — an original take on the covered-wagon journey games of the school
// computer lab. Lead a family wagon 1,000 miles west before the snows close the mountain pass (day 84 on easy, day 80 otherwise). Each day
// choose: travel at a steady pace, push hard, rest, or forage for food. Food runs down every day; pushing wears out
// the family and the wagon; resting heals. Along the way come rivers to cross (ford, take the ferry, or wait for the
// water to drop), two trading forts, and the odd surprise: a broken wheel, a storm, wild berries, a friendly
// traveler. Nothing is shot or hunted. Easy: more food and money, gentler surprises. Hard: less of both.
// Money is the family's savings in the story, not real money. No clock: one day passes per choice.
// ═══════════════════════════════════════════════════════════════════════════════
const _WT_STOPS = [[150, 'river', 'Plum Creek'], [330, 'fort', 'Fort Prospect'], [520, 'river', 'Big Muddy River'], [700, 'fort', 'Fort Juniper'], [860, 'river', 'Snake Bend'], [1000, 'end', 'the valley']];
function initWagontrail() {
    NK.start('wagontrail', {
        setup(gs, diff) {
            const E = diff === 'easy', H = diff === 'hard';
            gs.diff = diff; gs.last = E ? 84 : H ? 80 : 80; gs.day = 1; gs.mi = 0; gs.food = E ? 420 : H ? 300 : 340; gs.money = E ? 120 : H ? 70 : 90; gs.parts = E ? 2 : 1; gs.health = 100; gs.wagon = 100;
            gs.stop = 0; gs.at = null; gs.over = false; gs.log = []; gs.stuck = 0;
            gs.msg = `The wagon is packed and the oxen are hitched. 1,000 miles to the valley, and the pass closes on day ${gs.last}. Choose how to spend the first day.`;
        },
        view: _wtView,
        rules: (gs) => [
            `Lead the family wagon <b>1,000 miles</b> west and reach the valley <b>by day ${gs.last}</b>, before snow closes the pass.`,
            'Each choice is one day. <b>Steady</b> travel covers about 17 miles; <b>push hard</b> covers about 23 but tires the family and the wagon. <b>Rest</b> restores health. <b>Forage</b> finds some food but no miles.',
            'The family eats 8 pounds of food a day. With no food, health falls fast. If health reaches zero the family must turn back.',
            'At a <b>river</b>, ford it (free, a little risky), take the ferry (costs money), or wait a day for the water to drop. At a <b>fort</b>, trade money for food and spare wagon parts.',
            'A broken wheel needs a spare part, or two days of mending. Nothing is shot or hunted on this trail. No clock.'],
        css: `.wt-trail{position:relative;height:58px;margin:4px 0 12px;background:linear-gradient(#bbf7d0,#86efac);border-radius:12px;box-shadow:inset 0 0 0 3px #166534;overflow:hidden}
.wt-road{position:absolute;left:4%;right:4%;top:50%;height:4px;background:#a16207;border-radius:2px}
.wt-mk{position:absolute;top:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;border:2px solid #fff}
.wt-mk.wt-river{background:#0284c7}.wt-mk.wt-fort{background:#7c2d12;border-radius:3px}.wt-mk.wt-end{background:#16a34a;width:20px;height:20px}
.wt-wag{position:absolute;top:50%;transform:translate(-50%,-62%);width:44px;height:34px}
.wt-st{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 10px}
.wt-st div{background:#fff7e6;border:2px solid #fde7c4;border-radius:12px;padding:6px;text-align:center;font-weight:800;font-size:.95rem}
.wt-st b{display:block;font-size:1.35rem}
.wt-st .wt-low{border-color:#dc2626;background:#fee2e2}
.wt-bar{height:8px;border-radius:4px;background:#e5e7eb;margin-top:3px;overflow:hidden}.wt-bar i{display:block;height:100%}
.wt-log{font-size:.98rem;color:#57534e;margin:6px 0 0;padding-left:1.1rem}
.wt-log li{margin:2px 0}`,
    });
}
const _wtR = (a, b) => a + Math.random() * (b - a);
function _wtNext(gs) { return _WT_STOPS[gs.stop]; }
function _wtDay(gs, said) {
    gs.day++; gs.food = Math.max(0, gs.food - 8);
    if (!gs.food) { gs.health -= 9; said += ' There is no food left: everyone is weak with hunger.'; }
    gs.health = Math.max(0, Math.min(100, gs.health)); gs.wagon = Math.max(0, Math.min(100, gs.wagon));
    gs.log.unshift(`Day ${gs.day - 1}: ${said}`); gs.log = gs.log.slice(0, 4);
    if (gs.health <= 0) return _wtEnd(gs, false, 'The family is too weak to go on and must turn back toward the last town.');
    if (gs.day > gs.last) return _wtEnd(gs, false, `Snow has closed the pass with ${Math.round(1000 - gs.mi)} miles still to go.`);
    gs.msg = said; NK.render('wagontrail');
}
function _wtEvent(gs) {
    const r = Math.random(), mild = gs.diff === 'easy';
    if (r < 0.07) { if (gs.parts) { gs.parts--; return ' A wheel cracked on a rock; you fitted a spare part.'; } gs.stuck = 2; return ' A wheel cracked on a rock! With no spare part, mending it will take two days.'; }
    if (r < 0.13) { const f = Math.round(_wtR(15, mild ? 25 : 45)); gs.food = Math.max(0, gs.food - f); return ` A storm soaked the supplies: ${f} pounds of food spoiled.`; }
    if (r < 0.19) { const f = Math.round(_wtR(15, 35)); gs.food += f; return ` You found wild berries and plums by the trail: +${f} pounds of food.`; }
    if (r < 0.23) { gs.health += 8; return ' A friendly traveler shared a hot supper and good advice.'; }
    if (r < 0.27 && !mild) { gs.health -= 10; return ' Someone caught a chill and the family is worn down.'; }
    return '';
}
function wtAct(a) {
    const gs = gameState.wagontrail; if (gs.over || gs.at) return;
    if (gs.stuck && a !== 'rest' && a !== 'forage') { gs.stuck--; gs.wagon += 10; return _wtDay(gs, gs.stuck ? 'Mending the wheel. One more day.' : 'The wheel is mended at last.'); }
    let said = '';
    if (a === 'steady' || a === 'push') {
        const push = a === 'push', mi = Math.round((push ? _wtR(20, 26) : _wtR(15, 19)) * (0.8 + gs.wagon / 500) * (gs.health < 40 ? 0.75 : 1));
        const stop = _wtNext(gs), lim = stop[0];
        gs.mi = Math.min(lim, gs.mi + mi); gs.health -= push ? _wtR(4, 8) : _wtR(0, 1.5); gs.wagon -= push ? _wtR(3, 6) : _wtR(0, 1.2);
        said = `${push ? 'Pushed hard' : 'Traveled steadily'}: ${mi} miles.` + _wtEvent(gs);
        if (gs.mi >= lim) { gs.at = stop[1]; said += stop[1] === 'end' ? '' : ` You have reached ${stop[2]}.`; if (stop[1] === 'end') { gs.day++; return _wtEnd(gs, true, `The wagon rolls into the valley on day ${gs.day - 1}!`); } }
        if (typeof sfxFlip === 'function') sfxFlip();
    } else if (a === 'rest') { gs.health += _wtR(10, 16); gs.wagon += 3; said = 'Rested in camp. Everyone feels better.'; }
    else if (a === 'forage') { const f = Math.round(_wtR(10, gs.diff === 'hard' ? 22 : 30)); gs.food += f; gs.health -= 1; said = `Foraged for roots, greens and berries: +${f} pounds of food.`; }
    _wtDay(gs, said);
}
function wtRiver(c) {
    const gs = gameState.wagontrail; if (gs.over || gs.at !== 'river') return; const nm = _wtNext(gs)[2];
    if (c === 'ferry') { const cost = gs.diff === 'hard' ? 30 : 20; if (gs.money < cost) { gs.msg = `The ferry costs $${cost}, and you have only $${gs.money}.`; return NK.render('wagontrail'); } gs.money -= cost; gs.at = null; gs.stop++; return _wtDay(gs, `Took the ferry across ${nm} for $${cost}. Safe and dry.`); }
    if (c === 'wait') { gs.waited = (gs.waited || 0) + 1; return _wtDay(gs, `Waited a day at ${nm}. The water looks a little lower.`); }
    const risk = Math.max(0.08, (gs.diff === 'easy' ? 0.22 : gs.diff === 'hard' ? 0.45 : 0.32) - (gs.waited || 0) * 0.1);
    gs.at = null; gs.stop++; gs.waited = 0;
    if (Math.random() < risk) { const f = Math.round(_wtR(30, 70)); gs.food = Math.max(0, gs.food - f); gs.wagon -= 12; if (typeof sfxWrong === 'function') sfxWrong(); return _wtDay(gs, `Forded ${nm}, but the wagon tipped in the current: ${f} pounds of food washed away.`); }
    _wtDay(gs, `Forded ${nm} without trouble.`);
}
function wtBuy(what) {
    const gs = gameState.wagontrail; if (gs.over || gs.at !== 'fort') return;
    const price = { food: [10, 50], part: [15, 1] }[what];
    if (gs.money < price[0]) { gs.msg = `That costs $${price[0]}; you have $${gs.money}.`; return NK.render('wagontrail'); }
    gs.money -= price[0]; if (what === 'food') gs.food += price[1]; else gs.parts++;
    gs.msg = what === 'food' ? `Bought 50 pounds of food for $10.` : 'Bought a spare wagon part for $15.'; if (typeof sfxFlip === 'function') sfxFlip(); NK.render('wagontrail');
}
function wtLeave() { const gs = gameState.wagontrail; if (gs.over || gs.at !== 'fort') return; gs.at = null; gs.stop++; gs.health += 6; _wtDay(gs, `Left ${_WT_STOPS[gs.stop - 1][2]} after a good night's sleep.`); }
function _wtEnd(gs, win, said) {
    gs.over = true; gs.msg = said; NK.render('wagontrail'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('wagontrail', win, win ? `Arrived on day ${gs.day - 1} with ${Math.round(gs.food)} pounds of food and the family in ${gs.health > 70 ? 'good' : gs.health > 40 ? 'fair' : 'poor'} health.` : `${said} A new journey is one tap away.`);
}
function wtNew() { initWagontrail(); }
const _WT_WAGON = '<svg viewBox="0 0 44 34" class="wt-wag" aria-hidden="true"><path d="M6 20 Q6 4 22 4 Q38 4 38 20 Z" fill="#fefce8" stroke="#78350f" stroke-width="2"/><rect x="4" y="19" width="36" height="6" rx="1" fill="#92400e"/><circle cx="11" cy="28" r="5" fill="#fef3c7" stroke="#451a03" stroke-width="2"/><circle cx="33" cy="28" r="5" fill="#fef3c7" stroke="#451a03" stroke-width="2"/></svg>';
function _wtView(gs) {
    const pct = (m) => 4 + m / 1000 * 92;
    const mk = _WT_STOPS.map(([m, t, n]) => `<span class="wt-mk wt-${t}" style="left:${pct(m)}%" title="${n}"></span>`).join('');
    const stat = (lab, v, low, col) => `<div class="${low ? 'wt-low' : ''}">${lab}<b>${v}</b>${col ? `<div class="wt-bar"><i style="width:${Math.max(0, Math.min(100, col[0]))}%;background:${col[1]}"></i></div>` : ''}</div>`;
    const nx = _wtNext(gs), H = Math.round(gs.health), W = Math.round(gs.wagon), daysLeft = Math.ceil(gs.food / 8);
    let acts;
    if (gs.over) acts = '';
    else if (gs.at === 'river') acts = `<div class="gk-label">${nx[2]}: how will you cross?</div><div class="gk-btns">${NK.btn('Ford it', "wtRiver('ford')", { k: 'ford', cls: 'gk-primary' })}${NK.btn(`Ferry ($${gs.diff === 'hard' ? 30 : 20})`, "wtRiver('ferry')", { k: 'ferry' })}${NK.btn('Wait a day', "wtRiver('wait')", { k: 'wait' })}</div>`;
    else if (gs.at === 'fort') acts = `<div class="gk-label">${nx[2]}: the trading post is open</div><div class="gk-btns">${NK.btn('Buy 50 lb food ($10)', "wtBuy('food')", { k: 'food' })}${NK.btn('Buy a spare part ($15)', "wtBuy('part')", { k: 'part' })}${NK.btn(NK.icon('arrow-right') + 'Back on the trail', 'wtLeave()', { k: 'leave', cls: 'gk-primary' })}</div>`;
    else acts = `<div class="gk-btns">${NK.btn(gs.stuck ? 'Keep mending' : 'Travel steady', "wtAct('steady')", { k: 'steady', cls: 'gk-primary' })}${NK.btn('Push hard', "wtAct('push')", { k: 'push', disabled: !!gs.stuck })}${NK.btn('Rest', "wtAct('rest')", { k: 'rest' })}${NK.btn('Forage', "wtAct('forage')", { k: 'forage' })}</div>`;
    return `<div class="nk-top"><span>Day <b>${gs.day}</b> of ${gs.last}</span><span>Miles: <b>${Math.round(gs.mi)}</b> of 1000</span><span>Next: <b>${nx[2]}</b> (${nx[0] - Math.round(gs.mi)} mi)</span></div>
      <div class="wt-trail" role="img" aria-label="${Math.round(gs.mi)} of 1000 miles"><span class="wt-road"></span>${mk}<span style="position:absolute;left:clamp(24px,${pct(gs.mi)}%,calc(100% - 24px));top:50%">${_WT_WAGON}</span></div>
      <div class="wt-st">${stat('Food (lb)', Math.round(gs.food), daysLeft < 8, null)}${stat('Health', H, H < 35, [H, H < 35 ? '#dc2626' : '#16a34a'])}${stat('Wagon', W, W < 35, [W, W < 35 ? '#dc2626' : '#a16207'])}${stat('Money', '$' + gs.money, false, null)}${stat('Spare parts', gs.parts, false, null)}${stat('Food lasts', NK.pl(daysLeft, 'day'), daysLeft < 8, null)}</div>
      ${NK.msg(gs.msg)}${acts}
      <ul class="wt-log" aria-label="recent days">${gs.log.slice(1).map((l) => `<li>${l}</li>`).join('')}</ul>
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New journey', 'wtNew()', { k: 'restart' })}</div>`;
}
