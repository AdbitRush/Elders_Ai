// ═══════════════════════════════════════════════════════════════════════════════
// VICTORY GARDEN (2026-11, nostalgia batch 3) — a backyard vegetable garden, one week at a time, in the spirit of the
// home-front gardens. Twelve beds. Each week you have a few chores to spend: plant a seed, water a bed, pull weeds,
// or harvest what is ripe. Then end the week: crops grow, beds dry out (unless it rains), weeds creep in. A crop left
// dry two weeks running wilts; heavy weeds stop it growing; a ripe crop left too long goes past its best.
// Grow the target harvest for the church supper by the last week. Easy: 5 chores a week, 40 lb in 14 weeks.
// Normal: 4 chores, 55 lb. Hard: 4 chores, 70 lb, and drier weather. No clock: weeks pass only when you say so.
// ═══════════════════════════════════════════════════════════════════════════════
const _VG_CROP = { carrot: { n: 'carrots', grow: 3, lb: 4, c: '#ea580c' }, beans: { n: 'beans', grow: 4, lb: 6, c: '#16a34a' }, tomato: { n: 'tomatoes', grow: 6, lb: 10, c: '#dc2626' }, squash: { n: 'squash', grow: 7, lb: 14, c: '#ca8a04' } };
function initVictorygarden() {
    NK.start('victorygarden', {
        setup(gs, diff) {
            gs.diff = diff; gs.week = 1; gs.weeks = 14; gs.per = diff === 'easy' ? 5 : 4; gs.left = gs.per; gs.goal = diff === 'easy' ? 40 : diff === 'hard' ? 70 : 55;
            gs.beds = [...Array(12)].map(() => ({ crop: null, age: 0, water: 2, dry: 0, weeds: 0, ripe: 0 })); gs.lb = 0; gs.tool = 'carrot'; gs.over = false; gs.rain = false; gs.basket = [];
            gs.msg = `Week 1. Pick a chore, then tap a bed. You have ${gs.per} chores a week. Grow ${gs.goal} lb for the church supper by week ${gs.weeks}.`;
        },
        view: _vgView,
        keys: { KeyE: () => vgEnd() },
        rules: (gs) => [
            `Each week you have <b>${gs.per} chores</b>. Pick a chore button, then tap a bed: <b>plant</b> a seed in an empty bed, <b>water</b> a bed, <b>pull weeds</b>, or <b>harvest</b> a ripe crop.`,
            'Carrots ripen in 3 weeks (4 lb), beans in 4 (6 lb), tomatoes in 6 (10 lb), squash in 7 (14 lb). Big crops pay more but take longer.',
            'When you <b>end the week</b>, crops grow and beds dry out by one drop (rain waters everything). A crop dry two weeks in a row <b>wilts</b>. Three weeds stop a crop growing. A ripe crop left two weeks goes past its best and gives half.',
            `Goal: <b>${gs.goal} lb</b> harvested by the end of week ${gs.weeks}.`,
            'No clock: the week ends only when you tap End the week. Keyboard: Tab and Enter, E ends the week.'],
        css: `.vg-b{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#78350f;padding:8px;border-radius:16px;box-shadow:inset 0 0 0 3px #451a03;max-width:30rem;margin:0 auto}
.vg-s{aspect-ratio:1;border:0;padding:4px;min-width:0;background:repeating-linear-gradient(0deg,#92400e 0 6px,#a16207 6px 12px);border-radius:10px;cursor:pointer;--nk-r:10px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;color:#fff;font:800 .72rem system-ui,sans-serif}
.vg-s.vg-wet{background:repeating-linear-gradient(0deg,#57290b 0 6px,#6b3410 6px 12px)}
.vg-s.vg-ripe{box-shadow:0 0 0 3px #facc15}
.vg-s.vg-dead{filter:grayscale(1) brightness(.8)}
.vg-s svg{position:absolute;left:12%;right:12%;top:6%;width:76%;height:62%}
.vg-tag{position:relative;background:rgba(0,0,0,.45);border-radius:6px;padding:1px 4px;line-height:1.2;text-align:center}
.vg-drops{position:absolute;top:3px;left:4px;display:flex;gap:1px}.vg-drops i{width:6px;height:8px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#38bdf8}
.vg-wd{position:absolute;top:3px;right:4px;font-size:.7rem;color:#bef264}
.vg-tools{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0}
.vg-tools .gk-btn{min-height:48px;padding:6px 12px}
.vg-bar{height:14px;border-radius:7px;background:#e5e7eb;overflow:hidden;margin:2px 0 10px}.vg-bar i{display:block;height:100%;background:linear-gradient(90deg,#16a34a,#84cc16)}`,
    });
}
function vgTool(t) { const gs = gameState.victorygarden; if (gs.over) return; gs.tool = t; gs.msg = { carrot: 'Plant carrots: tap an empty bed.', beans: 'Plant beans: tap an empty bed.', tomato: 'Plant tomatoes: tap an empty bed.', squash: 'Plant squash: tap an empty bed.', water: 'Water: tap a bed.', weed: 'Pull weeds: tap a bed.', harvest: 'Harvest: tap a ripe bed (gold ring).' }[t]; NK.render('victorygarden'); }
function vgBed(i) {
    const gs = gameState.victorygarden; if (gs.over) return; const b = gs.beds[i], t = gs.tool;
    if (!gs.left) { gs.msg = 'No chores left this week. Tap End the week.'; return NK.render('victorygarden'); }
    let did = '';
    if (_VG_CROP[t]) { if (b.crop) { gs.msg = 'That bed is already planted.'; return NK.render('victorygarden'); } Object.assign(b, { crop: t, age: 0, dry: 0, ripe: 0, dead: false }); did = `Planted ${_VG_CROP[t].n} in bed ${i + 1}.`; }
    else if (t === 'water') { if (b.water >= 3) { gs.msg = 'That bed is already soaked.'; return NK.render('victorygarden'); } b.water = 3; b.dry = 0; did = `Watered bed ${i + 1}.`; }
    else if (t === 'weed') { if (!b.weeds) { gs.msg = 'No weeds there.'; return NK.render('victorygarden'); } b.weeds = 0; did = `Pulled the weeds in bed ${i + 1}.`; }
    else if (t === 'harvest') {
        if (!b.crop) { gs.msg = 'Nothing growing there.'; return NK.render('victorygarden'); }
        if (b.dead) { b.crop = null; b.dead = false; did = `Cleared the wilted plants from bed ${i + 1}.`; }
        else if (b.age < _VG_CROP[b.crop].grow) { gs.msg = `The ${_VG_CROP[b.crop].n} need ${_VG_CROP[b.crop].grow - b.age} more week${_VG_CROP[b.crop].grow - b.age === 1 ? '' : 's'}.`; return NK.render('victorygarden'); }
        else { const lb = b.ripe >= 2 ? Math.round(_VG_CROP[b.crop].lb / 2) : _VG_CROP[b.crop].lb; gs.lb += lb; gs.basket.push(b.crop); did = `Harvested ${lb} lb of ${_VG_CROP[b.crop].n}${b.ripe >= 2 ? ' (a little past their best)' : ''}!`; b.crop = null; if (typeof sfxCorrect === 'function') sfxCorrect(); }
    }
    gs.left--; if (typeof sfxFlip === 'function' && t !== 'harvest') sfxFlip();
    if (gs.lb >= gs.goal) { gs.over = true; gs.msg = `${did} That makes ${gs.lb} lb: enough for the church supper!`; NK.render('victorygarden'); return NK.finish('victorygarden', true, `${gs.lb} lb harvested by week ${gs.week} of ${gs.weeks}.`); }
    gs.msg = `${did} ${NK.pl(gs.left, 'chore')} left this week.`; NK.render('victorygarden');
}
function vgEnd() {
    const gs = gameState.victorygarden; if (gs.over) return;
    if (gs.week >= gs.weeks) { gs.over = true; gs.msg = `The season is over: ${gs.lb} of ${gs.goal} lb.`; NK.render('victorygarden'); return NK.finish('victorygarden', false, `${gs.lb} of ${gs.goal} lb harvested this season. Next year's garden is one tap away.`); }
    gs.rain = Math.random() < (gs.diff === 'hard' ? 0.18 : 0.3); let wilted = 0;
    gs.beds.forEach((b) => {
        if (gs.rain) b.water = 3; else b.water = Math.max(0, b.water - 1);
        if (!b.crop || b.dead) return;
        if (!b.water) { b.dry++; if (b.dry >= 2) { b.dead = true; wilted++; return; } } else b.dry = 0;
        if (Math.random() < 0.35) b.weeds = Math.min(3, b.weeds + 1);
        if (b.age >= _VG_CROP[b.crop].grow) b.ripe++; else if (b.weeds < 3 && b.water) b.age++;
    });
    gs.week++; gs.left = gs.per;
    gs.msg = `Week ${gs.week}. ${gs.rain ? 'Rain overnight watered every bed.' : 'A dry week.'}${wilted ? ` ${NK.pl(wilted, 'bed')} wilted.` : ''} ${NK.pl(gs.per, 'chore')} to spend.`;
    NK.render('victorygarden');
}
function vgNew() { initVictorygarden(); }
function _vgPlant(b) {
    const C = _VG_CROP[b.crop], f = Math.min(1, b.age / C.grow), h = 10 + f * 26;
    let s = `<path d="M20 40 V${40 - h}" stroke="#15803d" stroke-width="2.4"/><path d="M20 ${40 - h * 0.5} q-8 -4 -10 -10 q8 0 10 6 M20 ${40 - h * 0.7} q8 -4 10 -10 q-8 0 -10 6" fill="#22c55e"/>`;
    if (b.age >= C.grow) s += b.crop === 'carrot' ? '<path d="M14 36 l3 -9 l3 9 z M21 36 l3 -9 l3 9 z" fill="#ea580c"/>' : `<circle cx="13" cy="${40 - h * 0.45}" r="${b.crop === 'squash' ? 6 : 4}" fill="${C.c}"/><circle cx="27" cy="${40 - h * 0.6}" r="${b.crop === 'squash' ? 6 : 4}" fill="${C.c}"/>`;
    return `<svg viewBox="0 0 40 40" aria-hidden="true">${s}</svg>`;
}
// the Refreshed look's bed pictures (css/refresh.css); these classes change nothing else. Only real states are mapped, and wilted beds keep the drawn plants.
const _vgArt = (b, ripe) => (b.dead ? '' : !b.crop ? ' vg-a-empty' : b.crop !== 'tomato' ? ' vg-a-soil' : ripe ? ' vg-a-tomato-ripe' : ' vg-a-tomato-grow');
function _vgView(gs) {
    const beds = gs.beds.map((b, i) => {
        const C = b.crop && _VG_CROP[b.crop], ripe = C && !b.dead && b.age >= C.grow;
        const st = !b.crop ? 'empty' : b.dead ? `${C.n}, wilted` : ripe ? `${C.n}, ripe${b.ripe >= 2 ? ', past its best' : ''}` : `${C.n}, ${C.grow - b.age} week${C.grow - b.age === 1 ? '' : 's'} to go`;
        return `<button type="button" class="nk-cell vg-s${b.water >= 2 ? ' vg-wet' : ''}${ripe ? ' vg-ripe' : ''}${b.dead ? ' vg-dead' : ''}${_vgArt(b, ripe)}" onclick="vgBed(${i})" data-k="b${i}"${i === 0 ? ' data-first' : ''} aria-label="bed ${i + 1}: ${st}, water ${b.water} of 3${b.weeds ? `, ${b.weeds} weeds` : ''}"${gs.over ? ' disabled' : ''}>
          <span class="vg-drops" aria-hidden="true">${'<i></i>'.repeat(b.water)}</span>${b.weeds ? `<span class="vg-wd" aria-hidden="true">${'✿'.repeat(b.weeds)}</span>` : ''}${b.crop ? _vgPlant(b) : ''}<span class="vg-tag">${!b.crop ? 'empty' : b.dead ? 'wilted' : ripe ? 'ripe!' : `${C.grow - b.age} wk`}</span></button>`; }).join('');
    const tool = (t, lab) => NK.btn(lab, `vgTool('${t}')`, { k: 't' + t, pressed: gs.tool === t, cls: gs.tool === t ? 'gk-primary' : '', disabled: gs.over });
    return `<div class="nk-top"><span>Week <b>${gs.week}</b> of ${gs.weeks}</span><span>Chores left: <b>${gs.left}</b></span><span>Harvest: <b>${gs.lb}</b> of ${gs.goal} lb</span></div>
      <div class="vg-bar" role="img" aria-label="${gs.lb} of ${gs.goal} pounds"><i style="width:${Math.min(100, gs.lb / gs.goal * 100)}%"></i></div>
      <div class="vg-b">${beds}</div>
      <div class="vg-tools" role="group" aria-label="chores">${tool('carrot', 'Plant carrots (3 wk)')}${tool('beans', 'Plant beans (4 wk)')}${tool('tomato', 'Plant tomatoes (6 wk)')}${tool('squash', 'Plant squash (7 wk)')}${tool('water', 'Water')}${tool('weed', 'Pull weeds')}${tool('harvest', 'Harvest')}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('sun') + (gs.week >= gs.weeks ? 'End the season' : 'End the week'), 'vgEnd()', { k: 'end', cls: 'gk-primary', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New garden', 'vgNew()', { k: 'restart' })}</div>`;
}
