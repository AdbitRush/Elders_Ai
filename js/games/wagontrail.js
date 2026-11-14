// ═══════════════════════════════════════════════════════════════════════════════
// PRAIRIE WAGON (2026-11, nostalgia batch 3) — an original take on the covered-wagon journey games of the school
// computer lab. Lead a family wagon 1,000 miles west before the snows close the mountain pass (day 84 on easy, day 80 otherwise). Each day
// choose: travel at a steady pace, push hard, rest, or forage for food. Food runs down every day; pushing wears out
// the family and the wagon; resting heals. Along the way come rivers to cross (ford, take the ferry, or wait for the
// water to drop), two trading forts, and the odd surprise: a broken wheel, a storm, wild berries, a friendly
// traveler. Nothing is shot or hunted. Easy: more food and money, gentler surprises. Hard: less of both.
// Money is the family's savings in the story, not real money. No clock: one day passes per choice.
//
// Visuals (2026-11 overhaul, presentation only): a panoramic prairie scene replaces the thin trail strip. The wagon
// stands at the current mile on a winding trail; rivers, forts and the valley cabin are drawn at their real miles;
// the sun crosses the sky as the days run out and snow creeps down the far peaks. The sky reflects state: storm
// while a wheel is being mended, grey when health is low, pale near the deadline, golden on arrival. Stats are
// wooden sign-boards, the day log is a ruled journal page. Pure inline SVG + CSS, no assets.
// ═══════════════════════════════════════════════════════════════════════════════
const _WT_STOPS = [[150, 'river', 'Plum Creek'], [330, 'fort', 'Fort Prospect'], [520, 'river', 'Big Muddy River'], [700, 'fort', 'Fort Juniper'], [860, 'river', 'Snake Bend'], [1000, 'end', 'the valley']];
function initWagontrail() {
    NK.start('wagontrail', {
        setup(gs, diff) {
            const E = diff === 'easy', H = diff === 'hard';
            gs.diff = diff; gs.last = E ? 84 : H ? 80 : 80; gs.day = 1; gs.mi = 0; gs.food = E ? 420 : H ? 300 : 340; gs.money = E ? 120 : H ? 70 : 90; gs.parts = E ? 2 : 1; gs.health = 100; gs.wagon = 100;
            gs.stop = 0; gs.at = null; gs.over = false; gs.log = []; gs.stuck = 0;
            gs.msg = `The wagon is packed and the oxen are hitched. 1,000 miles to the valley, and the pass closes on day ${gs.last}. Choose how to spend the first day.`;
            const sv = _wtLoad();
            if (sv) { Object.assign(gs, sv); gs.msg = `Welcome back: your journey resumes on day ${gs.day}. Choose what to do next.`; }
        },
        view: _wtView,
        rules: (gs) => [
            `Lead the family wagon <b>1,000 miles</b> west and reach the valley <b>by day ${gs.last}</b>, before snow closes the pass.`,
            'Each choice is one day. <b>Steady</b> travel covers about 17 miles; <b>push hard</b> covers about 23 but tires the family and the wagon. <b>Rest</b> restores health. <b>Forage</b> finds some food but no miles.',
            'The family eats 8 pounds of food a day. With no food, health falls fast. If health reaches zero the family must turn back.',
            'At a <b>river</b>, ford it (free, a little risky), take the ferry (costs money), or wait a day for the water to drop. At a <b>fort</b>, trade money for food and spare wagon parts.',
            'A broken wheel needs a spare part, or two days of mending. Nothing is shot or hunted on this trail. No clock.'],
        css: `.wt-trail{position:relative;height:clamp(176px,34vw,210px);margin:6px 0 14px;border-radius:18px;border:4px solid #6b4423;box-shadow:0 3px 0 #4a2e14,0 8px 18px rgba(74,46,20,.18);overflow:hidden;background:linear-gradient(#a9d6ee 0%,#d6ecf4 42%,#f6ecd0 64%)}
.wt-trail.wt-m-late{background:linear-gradient(#b7c8d6 0%,#dde5e8 42%,#efe6d2 64%)}
.wt-trail.wt-m-weak{background:linear-gradient(#b3bbc1 0%,#d2d5d5 42%,#e3ddd0 64%)}
.wt-trail.wt-m-storm{background:linear-gradient(#5f6b78 0%,#8b96a0 42%,#b9bdb8 64%)}
.wt-trail.wt-m-snow{background:linear-gradient(#c7d0d9 0%,#e5e9ee 42%,#f4f4f2 64%)}
.wt-trail.wt-m-win{background:linear-gradient(#f5c46c 0%,#fbdfa3 42%,#fff1cf 64%)}
.wt-bg{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
.wt-m-late .wt-bg{filter:saturate(.85)}
.wt-m-weak .wt-bg{filter:saturate(.5)}
.wt-m-storm .wt-bg{filter:saturate(.75) brightness(.8)}
.wt-sun{position:absolute;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:radial-gradient(circle at 40% 38%,#fffbe0,#f8cf5c 70%);box-shadow:0 0 0 7px rgba(248,207,92,.28),0 0 0 15px rgba(248,207,92,.14)}
.wt-m-weak .wt-sun,.wt-m-late .wt-sun{opacity:.6;box-shadow:0 0 0 7px rgba(255,255,255,.25)}
.wt-m-storm .wt-sun,.wt-m-snow .wt-sun{opacity:0}
.wt-m-win .wt-sun{transform:scale(1.25);box-shadow:0 0 0 9px rgba(255,236,170,.45),0 0 0 20px rgba(255,236,170,.25)}
.wt-cloud{position:absolute;width:74px;height:auto;fill:#fff;opacity:.92;animation:wt-drift 26s ease-in-out infinite alternate}
.wt-cloud.wt-c2{width:56px;opacity:.8;animation-duration:34s}
.wt-cloud.wt-c3{display:none;width:120px;animation-duration:40s}
.wt-m-weak .wt-cloud,.wt-m-late .wt-cloud{fill:#e3e6e8}
.wt-m-snow .wt-cloud{fill:#eef1f4;width:104px}
.wt-m-storm .wt-cloud{fill:#48525d;opacity:.96;width:124px}
.wt-m-storm .wt-c3,.wt-m-snow .wt-c3,.wt-m-weak .wt-c3{display:block}
@keyframes wt-drift{from{transform:translateX(-10px)}to{transform:translateX(14px)}}
.wt-fx{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
.wt-m-storm .wt-fx{background:repeating-linear-gradient(100deg,transparent 0,transparent 13px,rgba(235,242,248,.42) 13px,rgba(235,242,248,.42) 14.5px)}
.wt-m-snow .wt-fx{background-image:radial-gradient(circle,#fff 0,#fff 2px,transparent 2.6px),radial-gradient(circle,#fff 0,#fff 1.5px,transparent 2.1px);background-size:38px 34px,26px 30px;background-position:0 0,13px 17px}
.wt-call{position:absolute;top:44px;width:0;border-left:3px dotted rgba(74,46,20,.6);transform:translateX(-50%)}
.wt-mk{position:absolute;display:block;width:40px;height:44px;margin-top:-2px;transform:translate(-50%,-100%)}
.wt-mk svg{display:block;width:100%;height:100%}
.wt-mk.wt-done{opacity:.72}
.wt-mk.wt-nxt{filter:drop-shadow(0 0 4px #fff3c4) drop-shadow(0 0 2px #fff3c4)}
.wt-sign{position:absolute;top:8px;transform:translateX(-50%);padding:3px 12px;border-radius:7px;border:2px solid #4a2e14;background:linear-gradient(#8a5a2e,#74481f);color:#fff8e6;font-weight:800;font-size:1rem;line-height:1.4;white-space:nowrap;text-transform:capitalize;box-shadow:0 2px 0 rgba(74,46,20,.5)}
.wt-rig{position:absolute;display:block}
.wt-wag{position:absolute;left:0;top:0;width:clamp(88px,22vw,112px);height:auto;aspect-ratio:120/70;transform:translate(-50%,-90%);overflow:visible}
.wt-wag .wt-w-brk,.wt-wag .wt-patch{display:none}
.wt-stuck .wt-wag{transform:translate(-50%,-90%) rotate(-2.5deg)}
.wt-stuck .wt-wag .wt-w-ok{display:none}
.wt-stuck .wt-wag .wt-w-brk,.wt-worn .wt-wag .wt-patch{display:inline}
.wt-st{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 14px}
.wt-b{position:relative;padding:10px 10px 12px;border-radius:12px;border:2px solid #4a2e14;background:repeating-linear-gradient(92deg,rgba(0,0,0,.07) 0,rgba(0,0,0,.07) 2px,transparent 2px,transparent 9px),linear-gradient(#8a5a2e,#74481f);box-shadow:0 3px 0 #4a2e14,inset 0 1px 0 rgba(255,255,255,.18);color:#fff8e6;text-align:center;font-weight:700;font-size:1rem;line-height:1.35}
.wt-lab{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px}
.wt-lab svg{width:20px;height:20px;flex:none}
.wt-b b{display:block;font-size:1.5rem;font-weight:800;line-height:1.3}
.wt-b.wt-low{border-color:#ffd7cf;background:repeating-linear-gradient(92deg,rgba(0,0,0,.07) 0,rgba(0,0,0,.07) 2px,transparent 2px,transparent 9px),linear-gradient(#a3382a,#872619);box-shadow:0 3px 0 #5e170f,inset 0 1px 0 rgba(255,255,255,.18)}
.wt-b.wt-low::after{content:'!';position:absolute;top:-10px;inset-inline-end:-6px;width:26px;height:26px;border-radius:50%;background:#fff8e6;border:2px solid #872619;color:#872619;font-weight:900;font-size:1.05rem;line-height:22px;text-align:center}
.wt-bar{height:14px;margin-top:6px;border-radius:7px;background:#f6ead0;box-shadow:inset 0 1px 3px rgba(74,46,20,.45);overflow:hidden}
.wt-bar i{display:block;height:100%;border-radius:7px}
.wt-log{margin:14px 0 6px;padding:10px 16px;padding-inline-start:36px;border-radius:12px;border:2px solid #e2cfa3;border-inline-start:8px solid #b4452c;background-color:#fffaf0;background-image:repeating-linear-gradient(transparent 0,transparent calc(1.8rem - 1px),#e8d9b5 calc(1.8rem - 1px),#e8d9b5 1.8rem);background-position:0 10px;box-shadow:0 2px 6px rgba(74,46,20,.12);font-size:1.05rem;line-height:1.8rem;color:#3f2f1f}
.wt-log:empty{display:none}
.wt-log li{margin:0}
.wt-log li::marker{color:#b4452c}
@media (max-width:520px){.wt-st{grid-template-columns:repeat(2,1fr)}}
@media (prefers-reduced-motion:reduce){.wt-cloud{animation:none}}`,
    });
}
// Autosave of the active journey (same try/catch localStorage pattern as the other games). Cleared when the journey ends or a new one starts.
const _WT_KEY = 'gg_wagontrail_save';
const _WT_FIELDS = ['diff', 'last', 'day', 'mi', 'food', 'money', 'parts', 'health', 'wagon', 'stop', 'at', 'log', 'stuck', 'waited'];
function _wtSave(gs) {
    try {
        if (gs.over) return localStorage.removeItem(_WT_KEY);
        const o = { v: 1 }; _WT_FIELDS.forEach((k) => { if (gs[k] !== undefined) o[k] = gs[k]; });
        localStorage.setItem(_WT_KEY, JSON.stringify(o));
    } catch (e) {}
}
function _wtLoad() {
    try {
        const o = JSON.parse(localStorage.getItem(_WT_KEY));
        const num = (k) => typeof o[k] === 'number' && isFinite(o[k]);
        if (!o || o.v !== 1 || !['day', 'mi', 'food', 'money', 'parts', 'health', 'wagon', 'stop', 'last', 'stuck'].every(num)) return null;
        if (!['easy', 'normal', 'hard'].includes(o.diff) || o.stop < 0 || o.stop >= _WT_STOPS.length || o.day > o.last || o.health <= 0 || !Array.isArray(o.log)) return null;
        if (o.at !== null && o.at !== 'river' && o.at !== 'fort') return null;
        delete o.v;
        return o;
    } catch (e) { return null; }
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
function wtNew() { try { localStorage.removeItem(_WT_KEY); } catch (e) {} initWagontrail(); }
// Covered wagon with a yoke of oxen, heading right (west on this map). Wheel bottoms sit at y=66 of 70.
// .wt-w-ok / .wt-w-brk swap the rear wheel for a propped axle while mending; .wt-patch shows on a worn wagon.
const _WT_WAGON = (() => {
    const wheel = (cx, cy, r) => {
        const d = r * 0.7;
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f1dfb4" stroke="#3d2914" stroke-width="2.4"/><path d="M${cx - r} ${cy}H${cx + r}M${cx} ${cy - r}V${cy + r}M${cx - d} ${cy - d}L${cx + d} ${cy + d}M${cx - d} ${cy + d}L${cx + d} ${cy - d}" stroke="#3d2914" stroke-width="1.3"/><circle cx="${cx}" cy="${cy}" r="2.4" fill="#3d2914"/>`;
    };
    return '<svg viewBox="0 0 120 70" class="wt-wag" aria-hidden="true">'
        + '<ellipse cx="60" cy="67" rx="55" ry="3" fill="#000" opacity=".16"/>'
        // far ox
        + '<ellipse cx="89" cy="46" rx="13" ry="7.5" fill="#6e4524"/><rect x="80" y="50" width="3" height="15" fill="#5a381c"/><rect x="97" y="50" width="3" height="15" fill="#5a381c"/>'
        // tongue pole
        + '<path d="M64 47L104 44" stroke="#4a2e14" stroke-width="2" stroke-linecap="round"/>'
        // near ox
        + '<path d="M79.5 46q-4 4-3 10" fill="none" stroke="#7d5229" stroke-width="1.6" stroke-linecap="round"/>'
        + '<rect x="82" y="53" width="3.4" height="13" fill="#7d5229"/><rect x="87.5" y="53" width="3.4" height="13" fill="#7d5229"/><rect x="98" y="53" width="3.4" height="13" fill="#7d5229"/><rect x="103" y="53" width="3.4" height="13" fill="#7d5229"/>'
        + '<ellipse cx="93" cy="49" rx="14" ry="8" fill="#9a6a3a"/><ellipse cx="90" cy="47" rx="5" ry="3" fill="#e8d2b0" opacity=".8"/>'
        + '<ellipse cx="109" cy="45" rx="6.5" ry="5.2" fill="#9a6a3a"/><ellipse cx="114" cy="47" rx="3" ry="2.6" fill="#e8d2b0"/><circle cx="110.5" cy="43.5" r=".9" fill="#2b1a0c"/>'
        + '<path d="M106 40.5q-1-5 3-6M111 40.5q3-4 6-3" fill="none" stroke="#f3ead2" stroke-width="1.6" stroke-linecap="round"/>'
        + '<rect x="100" y="39.5" width="5" height="9" rx="2" fill="#4a2e14"/>'
        // wagon bed
        + '<rect x="14" y="49" width="46" height="2.5" fill="#4a2e14"/>'
        + '<rect x="8" y="38" width="58" height="11" rx="1.5" fill="#8a4f22" stroke="#4a2e14" stroke-width="1.5"/><path d="M9 43.5H65" stroke="#6b3a17" stroke-width="1"/>'
        // canvas bonnet
        + '<path d="M9 37C7 15 18 7 37 7C56 7 67 15 65 37Z" fill="#fbf4dd" stroke="#6b4a2a" stroke-width="1.8" stroke-linejoin="round"/>'
        + '<path d="M23 9.5C19 18 19 28 21 37M37 7C36 17 36 27 37 37M51 9.5C55 18 55 28 53 37" fill="none" stroke="#d9c9a0" stroke-width="1.4"/>'
        + '<path d="M58 13C66 18 66 30 64 37L56 37C59 29 59 20 58 13Z" fill="#cdb98a"/>'
        + '<g class="wt-patch" fill="#c9a36b" stroke="#6b4a2a" stroke-width=".9" stroke-dasharray="1.6 1.2"><rect x="26" y="17" width="8" height="7"/><rect x="42" y="24" width="6" height="6"/></g>'
        + '<rect x="6" y="36" width="62" height="3" rx="1.5" fill="#5b3518"/>'
        // wheels
        + `<g class="wt-w-ok">${wheel(20, 54, 12)}</g>`
        + `<g class="wt-w-brk"><rect x="15" y="51" width="10" height="5" rx="1" fill="#5b3518"/><rect x="16" y="56" width="8" height="5" rx="1" fill="#74481f"/><rect x="15" y="61" width="10" height="5" rx="1" fill="#5b3518"/><g transform="translate(7 56) rotate(-14) scale(.5 1)">${wheel(0, 0, 10)}</g></g>`
        + wheel(54, 56.5, 9.5)
        + '</svg>';
})();
function _wtView(gs) {
    _wtSave(gs);   // every state change redraws, so the view is the single point that autosaves
    const pct = (m) => 4 + m / 1000 * 92;
    const nx = _wtNext(gs), H = Math.round(gs.health), W = Math.round(gs.wagon), daysLeft = Math.ceil(gs.food / 8);

    // ── Scene geometry: the trail winds gently; ty(m) is its height (in % of the scene) at mile m ──
    const ty = (m) => 76 + 4.5 * Math.sin(m / 1000 * Math.PI * 2.6);
    const f1 = (n) => Math.round(n * 10) / 10;
    const pts = (from, to) => { const a = []; for (let m = from; m < to; m += 20) a.push(m); a.push(to); return a.map((m) => `${f1(pct(m) * 10)},${f1(ty(m) * 2)}`).join(' '); };
    const t = Math.max(0, Math.min(1, (gs.day - 1) / Math.max(1, gs.last - 1)));   // share of the season used up

    // ── Mood: what the sky says about the state of the journey ──
    const won = gs.over && gs.mi >= 1000;
    const mood = won ? 'win' : gs.over ? (gs.health <= 0 ? 'weak' : 'snow') : gs.stuck ? 'storm' : H < 35 ? 'weak' : gs.last - gs.day < 10 ? 'late' : 'fair';

    // Far peaks guarding the pass: the snow line creeps down as the days run out
    const sd = Math.min(0.85, 0.2 + 0.6 * t);
    const peaks = [[850, 52, 72, 64], [925, 34, 88, 82], [992, 56, 62, 60]].map(([px, py, w, h]) =>
        `<polygon points="${px - w},${py + h} ${px},${py} ${px + w},${py + h}" fill="#8d9fae"/><polygon points="${px},${py} ${f1(px + w * sd)},${f1(py + h * sd)} ${f1(px + w * sd * 0.35)},${f1(py + h * sd * 0.8)} ${px},${f1(py + h * sd)} ${f1(px - w * sd * 0.4)},${f1(py + h * sd * 0.78)} ${f1(px - w * sd)},${f1(py + h * sd)}" fill="#fdfdfb"/>`).join('');
    const rivers = _WT_STOPS.filter((s) => s[1] === 'river').map(([m]) => {
        const x = Math.round(pct(m) * 10);
        return `<path d="M${x - 6} 120C${x - 14} 140 ${x + 10} 150 ${x - 4} 170S${x - 16} 190 ${x - 18} 200L${x + 24} 200C${x + 22} 186 ${x + 32} 170 ${x + 18} 150S${x + 2} 135 ${x + 6} 120Z" fill="#6fb3d9"/><path d="M${x + 1} 126C${x - 4} 142 ${x + 16} 152 ${x + 6} 172S${x} 190 ${x + 2} 200" fill="none" stroke="#bfe0f2" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
    }).join('');
    const tufts = [40, 130, 235, 300, 410, 480, 590, 655, 760, 830, 940].map((x, i) => { const y = i % 2 ? 186 : 170; return `<path d="M${x} ${y}l-5 -9M${x} ${y}l1 -11M${x} ${y}l6 -8" stroke="#5d8f49" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`; }).join('');
    const bg = `<svg class="wt-bg" viewBox="0 0 1000 200" preserveAspectRatio="none">${peaks}`
        + '<path d="M0 118C120 92 220 100 330 112S560 88 700 108S900 100 1000 110L1000 200L0 200Z" fill="#a9c79b"/>'
        + '<path d="M0 128C150 112 300 132 470 122S780 112 1000 128L1000 200L0 200Z" fill="#93bd7c"/>'
        + '<rect y="134" width="1000" height="66" fill="#9cc27a"/>'
        + '<path d="M0 178C200 168 400 186 600 174S900 170 1000 180L1000 200L0 200Z" fill="#7fae62"/>'
        + (mood === 'snow' ? '<rect y="96" width="1000" height="104" fill="#fff" opacity=".55"/>' : '')
        + rivers + tufts
        + `<polyline points="${pts(-60, 1060)}" fill="none" stroke="#e2c996" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`
        + `<polyline points="${pts(-60, gs.mi)}" fill="none" stroke="#9a6a35" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`
        + '</svg>';
    const cloud = (c, l, tp) => `<svg class="wt-cloud ${c}" viewBox="0 0 64 28" style="left:${l}%;top:${tp}%"><path d="M10 26a8 8 0 0 1 1-16 12 12 0 0 1 23-3 10 10 0 0 1 17 5 7 7 0 0 1 1 14z"/></svg>`;

    // ── Stops: river sign, palisade fort, valley cabin — each standing at its real mile ──
    const art = {
        river: '<svg viewBox="0 0 40 44"><rect x="18" y="22" width="4" height="22" rx="1" fill="#5b3a1c"/><rect x="3" y="3" width="34" height="22" rx="5" fill="#2f7fb0" stroke="#fffaf0" stroke-width="2.5"/><path d="M8 11q3-4 6 0t6 0 6 0 6 0M8 18q3-4 6 0t6 0 6 0 6 0" fill="none" stroke="#fffaf0" stroke-width="2.2" stroke-linecap="round"/></svg>',
        fort: '<svg viewBox="0 0 40 44"><path d="M20 22V3" stroke="#4a2e14" stroke-width="2"/><path d="M20 3l12 4-12 4z" fill="#b4452c"/><path d="M5 44V22l3-4 3 4 3-4 3 4 3-4 3 4 3-4 3 4 3-4 3 4v22z" fill="#9a6a3a" stroke="#fffaf0" stroke-width="1.5" stroke-linejoin="round"/><path d="M15 44V34a5 5 0 0 1 10 0v10z" fill="#4a2e14"/></svg>',
        end: '<svg viewBox="0 0 40 44"><path d="M33 44V30" stroke="#5b3a1c" stroke-width="2"/><path d="M33 11l6 12h-12zM33 19l7 13h-14z" fill="#2f6b3a"/><rect x="21" y="13" width="4" height="8" fill="#7a3b1d"/><rect x="4" y="26" width="24" height="18" fill="#c98f4e" stroke="#fffaf0" stroke-width="1.5"/><path d="M1 27L16 13l15 14z" fill="#7a3b1d" stroke="#fffaf0" stroke-width="1.5" stroke-linejoin="round"/><rect x="13" y="33" width="7" height="11" fill="#5b3518"/><rect x="6.5" y="31" width="4.5" height="4.5" fill="#fde9a8"/></svg>',
    };
    const mkLeft = (m) => `clamp(22px,${f1(pct(m))}%,calc(100% - 22px))`;
    const mk = _WT_STOPS.map(([m, tp, n], i) => `<span class="wt-mk wt-${tp}${i < gs.stop ? ' wt-done' : i === gs.stop ? ' wt-nxt' : ''}" style="left:${mkLeft(m)};top:${f1(ty(m))}%" title="${n}">${art[tp]}</span>`).join('');
    const sign = `<span class="wt-call" style="left:${mkLeft(nx[0])};height:calc(${f1(ty(nx[0]))}% - 94px)"></span><span class="wt-sign" style="left:clamp(84px,${f1(pct(nx[0]))}%,calc(100% - 84px))">${nx[2]}</span>`;
    const scene = `<span class="wt-sun" style="left:${f1(8 + 78 * t)}%;top:${f1(16 + 12 * t)}%"></span>${cloud('wt-c1', 16, 8)}${cloud('wt-c2', 60, 22)}${cloud('wt-c3', 36, 3)}${bg}<span class="wt-fx"></span>${sign}${mk}`;

    // ── Stat sign-boards ──
    const ic = {
        food: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8l-2 4c4 2 6 6 6 9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4c0-3 2-7 6-9z" fill="currentColor"/></svg>',
        health: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z" fill="currentColor"/></svg>',
        wagon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M3.5 12h17M12 3.5v17M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="1.5"/></svg>',
        money: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#74481f" stroke-width="1.8"/></svg>',
        parts: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="3.4 2.5"/><circle cx="12" cy="12" r="4.6" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>',
        lasts: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    };
    const stat = (icon, lab, v, low, col) => `<div class="wt-b${low ? ' wt-low' : ''}"><span class="wt-lab">${ic[icon]}${lab}</span><b>${v}</b>${col ? `<div class="wt-bar"><i style="width:${Math.max(0, Math.min(100, col[0]))}%;background:${col[1]}"></i></div>` : ''}</div>`;

    let acts;
    if (gs.over) acts = '';
    else if (gs.at === 'river') acts = `<div class="gk-label">${nx[2]}: how will you cross?</div><div class="gk-btns">${NK.btn('Ford it', "wtRiver('ford')", { k: 'ford', cls: 'gk-primary' })}${NK.btn(`Ferry ($${gs.diff === 'hard' ? 30 : 20})`, "wtRiver('ferry')", { k: 'ferry' })}${NK.btn('Wait a day', "wtRiver('wait')", { k: 'wait' })}</div>`;
    else if (gs.at === 'fort') acts = `<div class="gk-label">${nx[2]}: the trading post is open</div><div class="gk-btns">${NK.btn('Buy 50 lb food ($10)', "wtBuy('food')", { k: 'food' })}${NK.btn('Buy a spare part ($15)', "wtBuy('part')", { k: 'part' })}${NK.btn(NK.icon('arrow-right') + 'Back on the trail', 'wtLeave()', { k: 'leave', cls: 'gk-primary' })}</div>`;
    else acts = `<div class="gk-btns">${NK.btn(gs.stuck ? 'Keep mending' : 'Travel steady', "wtAct('steady')", { k: 'steady', cls: 'gk-primary' })}${NK.btn('Push hard', "wtAct('push')", { k: 'push', disabled: !!gs.stuck })}${NK.btn('Rest', "wtAct('rest')", { k: 'rest' })}${NK.btn('Forage', "wtAct('forage')", { k: 'forage' })}</div>`;
    return `<div class="nk-top"><span>Day <b>${gs.day}</b> of ${gs.last}</span><span>Miles: <b>${Math.round(gs.mi)}</b> of 1000</span><span>Next: <b>${nx[2]}</b> (${nx[0] - Math.round(gs.mi)} mi)</span></div>
      <div class="pilot-scene pilot-wagon" aria-hidden="true"></div><div class="wt-trail wt-m-${mood}${gs.stuck && !gs.over ? ' wt-stuck' : ''}${W < 35 ? ' wt-worn' : ''}" role="img" aria-label="${Math.round(gs.mi)} of 1000 miles">${scene}<span class="wt-rig" style="left:clamp(56px,${f1(pct(gs.mi))}%,calc(100% - 56px));top:${f1(ty(gs.mi))}%">${_WT_WAGON}</span></div>
      <div class="wt-st">${stat('food', 'Food (lb)', Math.round(gs.food), daysLeft < 8, null)}${stat('health', 'Health', H, H < 35, [H, H < 35 ? '#c62828' : '#3f9142'])}${stat('wagon', 'Wagon', W, W < 35, [W, W < 35 ? '#c62828' : '#b7791f'])}${stat('money', 'Money', '$' + gs.money, false, null)}${stat('parts', 'Spare parts', gs.parts, false, null)}${stat('lasts', 'Food lasts', NK.pl(daysLeft, 'day'), daysLeft < 8, null)}</div>
      ${NK.msg(gs.msg)}${acts}
      <ul class="wt-log" aria-label="recent days">${gs.log.slice(1).map((l) => `<li>${l}</li>`).join('')}</ul>
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New journey', 'wtNew()', { k: 'restart' })}</div>`;
}