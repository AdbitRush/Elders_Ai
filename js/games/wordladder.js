// ═══════════════════════════════════════════════════════════════════════════════
// WORD LADDER (2026-10, wave 2) — Lewis Carroll's "Doublets" (1879): turn the top word into the bottom word,
// changing ONE letter at a time; every step must be a real word. Four-letter words, a familiar-word list below.
// Each puzzle is checked to have a short solution inside this list (shortest path 3-5 changes, by level).
// Hint = shows the next word on a shortest path. Reaching the goal = "Well Done!"; Give up shows a solution.
// ═══════════════════════════════════════════════════════════════════════════════
const WL_WORDS = ('able acid aged also area army away baby back bake bald ball band bank bare bark barn base bath bead beak beam bean bear beat beef been beer bell belt bend bent best bike bill bind bird bite blow blue boat body boil bold bolt bond bone book boot bore born boss both bowl bulb bull burn bush busy cage cake call calm came camp cane cape card care cart case cash cast cave cell cent chat chin chip chop city clap claw clay clip club coal coat code coin cold come cone cook cool cope copy cord core corn cost coat cozy crab crew crop crow cube cure curl cute dame damp dare dark dart dash data date dawn days dead deal dear debt deck deep deer desk dial dice died diet dime dine dirt dish dive dock does doll dome done door dose dove down drag draw drew drip drop drum duck dull dune dusk dust duty each earn ease east easy edge else even ever exit face fact fade fail fair fall fame fare farm fast fate fear feed feel feet fell felt file fill film find fine fire firm fish fist five flag flat flew flip flow foam fold folk fond food fool foot ford fork form fort four fowl free frog from fuel full fund fuse gain gale game gang gate gave gaze gear gift girl give glad glow glue goal goat gold golf gone good gown grab gray grew grid grin grip grow gulf hail hair half hall halt hand hang hard hare harm hate have hawk head heal heap hear heat heel held helm help herb herd here hero hide high hike hill hint hire hold hole holy home hood hook hope horn hose host hour huge hull hung hunt hurt idea inch iron item jail jazz join joke jump june just keen keep kept kick kind king kiss kite knee knew knit knot know lace lack lady laid lake lamb lamp land lane last late lawn lazy lead leaf lean leap left lend lens less lick lift like lime line link lion list live load loaf loan lock loft logo long look loop lord lose loss lost loud love luck lump lung made mail main make male mall many mark mask mass mast mate maze meal mean meat meet melt mend menu mere mesh mild mile milk mill mind mine mint miss mist mode mold mole mood moon more most moth move much mule must name navy near neat neck need nest news next nice nine node none noon nose note noun oath obey once only open oven over pace pack page paid pail pain pair pale palm pane park part pass past path peak pear peel pick pier pile pill pine pink pint pipe plan play plot plow plug plum poem poet pole poll pond pony pool poor pope pork port pose post pour pray prey pull pump pure push race rack rage raid rail rain rake ramp rang rank rare rate read real rear rely rent rest rice rich ride ring rise risk road roam roar robe rock rode role roll roof room root rope rose rude ruin rule rush rust safe sage said sail sake sale salt same sand sang sank save seal seat seed seek seem seen self sell send sent ship shoe shop shot show shut sick side sigh sign silk sing sink site size skin slab slap sled slid slim slip slot slow snap snow soak soap sock soda sofa soft soil sold sole some song soon sore sort soul soup sour spin spot star stay stem step stew stir stop such suit sung sunk sure swan swim tail take tale talk tall tame tank tape task team tear tell tend tent term test text than that them then they thin this tide tidy tile till time tiny tire toad told toll tone took tool tops torn tour town trap tray tree trim trip true tube tuck tune turn twin type unit upon used vase vast verb very vest view vine vote wade wage wait wake walk wall wand want warm warn wary wash vast wave weak wear weed week well went were west what when whip wide wife wild will wind wine wing wipe wire wise wish with woke wolf wood wool word wore work worm worn wove wrap yard yarn year yell your zero zone ' +
  'bait bass bats beds bees bets bins bite boar bowl bows buck bugs bump bunk cans caps cars cats cots cows cubs cups cuts dams dens dips dogs dots dove fans fins fits flea foal fogs fuss gems gets gins gods gums guns guts hams hats hens hips hits hogs hops hugs huts jabs jams jars jaws jets jobs jogs jugs keys kids kits labs lads laps legs lids lips logs lots mats maps mobs mops mugs nets nods nuts oaks oars pads pans pats paws pegs pens pets pies pigs pins pits pods pots pups rags rams rats rays rods rubs rugs runs sacks sets sips sits sobs sons subs suns tabs tags tans taps ties tins tips toes tons tops toys tubs tugs vans vets wags wigs wins yaks ').trim().split(/\s+/).filter((w, i, a) => w.length === 4 && a.indexOf(w) === i);
const WL_SET = new Set(WL_WORDS);
const _wlDiff1 = (a, b) => { let d = 0; for (let i = 0; i < 4; i++) if (a[i] !== b[i]) d++; return d === 1; };
function _wlPath(a, b) {   // BFS inside the word list
    const prev = { [a]: null }, q = [a];
    while (q.length) { const w = q.shift(); if (w === b) break;
        for (let i = 0; i < 4; i++) for (let k = 0; k < 26; k++) { const n = w.slice(0, i) + String.fromCharCode(97 + k) + w.slice(i + 1); if (n !== w && WL_SET.has(n) && !(n in prev)) { prev[n] = w; q.push(n); } } }
    if (!(b in prev)) return null; const p = []; for (let w = b; w; w = prev[w]) p.unshift(w); return p;
}
function _wlFrom(a) {   // distances from a
    const dist = { [a]: 0 }, q = [a];
    while (q.length) { const w = q.shift();
        for (let i = 0; i < 4; i++) for (let k = 0; k < 26; k++) { const n = w.slice(0, i) + String.fromCharCode(97 + k) + w.slice(i + 1); if (WL_SET.has(n) && !(n in dist)) { dist[n] = dist[w] + 1; q.push(n); } } }
    return dist;
}
function initWordLadder(container) {
    const gs = gameState.wordladder;
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    const want = Math.min(6, (diff === 'easy' ? 3 : diff === 'hard' ? 5 : 4) + Math.floor(((gs.level || 1) - 1) / 3));
    let a, b, guard = 0;
    do { a = WL_WORDS[Math.floor(Math.random() * WL_WORDS.length)]; const d = _wlFrom(a); const far = Object.keys(d).filter((w) => d[w] === want); b = far.length ? far[Math.floor(Math.random() * far.length)] : null; } while (!b && guard++ < 200);
    gs.a = a; gs.b = b; gs.chain = [a]; gs.typed = ''; gs.over = false; gs.hints = 0; gs.best = want;
    gs.msg = `Change one letter at a time. It can be done in ${want} steps.`;
    const onKey = (e) => {
        if (gameState.currentId !== 'wordladder' || gs.over || e.ctrlKey || e.metaKey || e.altKey) return;
        if (/^[a-z]$/i.test(e.key)) { wlKey(e.key.toUpperCase()); e.preventDefault(); }
        else if (e.key === 'Backspace') { wlKey('⌫'); e.preventDefault(); }
        else if (e.key === 'Enter') { wlKey('↵'); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    window._gameCleanup = () => document.removeEventListener('keydown', onKey);
    _wlRender();
}
function wlKey(k) {
    const gs = gameState.wordladder; if (gs.over) return;
    if (k === '⌫') { gs.typed = gs.typed.slice(0, -1); return _wlRender(); }
    if (k === '↵') return wlEnter();
    if (gs.typed.length < 4) gs.typed += k.toLowerCase();
    if (typeof sfxClick === 'function') sfxClick();
    _wlRender();
}
function wlEnter() {
    const gs = gameState.wordladder, w = gs.typed, last = gs.chain[gs.chain.length - 1];
    if (w.length !== 4) { gs.msg = 'Type a four-letter word.'; return _wlRender(); }
    if (!_wlDiff1(w, last)) { gs.msg = `${w.toUpperCase()} must differ from ${last.toUpperCase()} by exactly one letter.`; if (typeof sfxWrong === 'function') sfxWrong(); return _wlRender(); }
    if (!WL_SET.has(w)) { gs.msg = `${w.toUpperCase()} isn't in our word list. Try another word.`; if (typeof sfxWrong === 'function') sfxWrong(); return _wlRender(); }
    if (gs.chain.includes(w)) { gs.msg = 'You already used that word.'; return _wlRender(); }
    gs.chain.push(w); gs.typed = ''; if (typeof sfxCorrect === 'function') sfxCorrect();
    if (w === gs.b) return _wlWin();
    const left = _wlPath(w, gs.b);
    gs.msg = left ? `Good. ${left.length - 1} more step${left.length === 2 ? '' : 's'} at best from here.` : 'Good word - but there is no way from it to the goal in our list. Tap Back one step.';
    _wlRender();
}
function wlBack() { const gs = gameState.wordladder; if (gs.over || gs.chain.length < 2) return; gs.chain.pop(); gs.typed = ''; gs.msg = 'Stepped back.'; _wlRender(); }
function wlHint() {
    const gs = gameState.wordladder; if (gs.over) return;
    let p = _wlPath(gs.chain[gs.chain.length - 1], gs.b);
    if (!p) { gs.chain = [gs.a]; p = _wlPath(gs.a, gs.b); }
    gs.chain.push(p[1]); gs.typed = ''; gs.hints++;
    if (p[1] === gs.b) return _wlWin();
    gs.msg = `Hint: ${p[1].toUpperCase()}.`; _wlRender();
}
function _wlWin() {
    const gs = gameState.wordladder; gs.over = true; gs.msg = 'You reached the goal!'; _wlRender();
    const steps = gs.chain.length - 1;
    GameKit.finish('wordladder', true, `${gs.a.toUpperCase()} to ${gs.b.toUpperCase()} in ${steps} step${steps === 1 ? '' : 's'}${gs.hints ? `, ${gs.hints} with a hint` : ''}. Best possible: ${gs.best}.`);
}
function wlGiveUp() {
    const gs = gameState.wordladder; if (gs.over) return; gs.over = true;
    const p = _wlPath(gs.a, gs.b); gs.chain = p; gs.msg = 'One way to do it:'; _wlRender();
    GameKit.finish('wordladder', false, 'One solution: ' + p.map((w) => w.toUpperCase()).join(' → '));
}
function _wlRender() {
    const gs = gameState.wordladder, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'wordladder') return;
    const tiles = (w, cls, prev) => `<div class="wl-w ${cls}">${[...w.padEnd(4, ' ')].map((ch, i) => `<span class="wl-l${prev && ch !== ' ' && prev[i] !== ch ? ' wl-ch' : ''}">${ch.trim() ? ch.toUpperCase() : ''}</span>`).join('')}</div>`;
    const chain = gs.chain.map((w, i) => tiles(w, i === 0 ? 'wl-start' : 'wl-step', gs.chain[i - 1])).join('');
    const kb = ['QWERTYUIOP', 'ASDFGHJKL', '↵ZXCVBNM⌫'].map((row) => `<div class="cw-kr">${[...row].map((k) => `<button type="button" class="gk-cell cw-k${k === '⌫' || k === '↵' ? ' cw-kw' : ''}" onclick="wlKey('${k}')" aria-label="${k === '⌫' ? 'delete' : k === '↵' ? 'enter' : k}">${k === '↵' ? 'OK' : k}</button>`).join('')}</div>`).join('');
    el.innerHTML = `<div class="wl" dir="ltr">
      <div class="wl-col">${chain}${gs.over ? '' : tiles(gs.typed, 'wl-type')}<div class="wl-goal-l">Goal</div>${tiles(gs.b, 'wl-goal')}</div>
      <div class="cw-msg" role="status">${gs.msg}</div>
      ${gs.over ? '' : `<div class="cw-kb">${kb}</div>
      <div class="gk-btns">${GameKit.btn('Back a step', 'wlBack()', { disabled: gs.chain.length < 2 })}${GameKit.btn('Hint', 'wlHint()')}${GameKit.btn('Give up', 'wlGiveUp()')}</div>`}
    </div>
    <style>
      .wl{width:100%;box-sizing:border-box;max-width:34rem;margin:0 auto;color:#2b1b0d}
      .wl-col{display:flex;flex-direction:column;align-items:center;gap:6px}
      .wl-w{display:flex;gap:6px}
      .wl-l{width:clamp(46px,13vw,58px);height:clamp(46px,13vw,58px);display:flex;align-items:center;justify-content:center;border-radius:10px;font:900 clamp(1.5rem,7vw,2rem)/1 Georgia,serif;background:#fffdf7;border:3px solid #c9a46a}
      .wl-l.wl-ch{background:#ffe08a;border-color:#c98a00}
      .wl-start .wl-l{background:#2b1b0d;color:#fff6e8;border-color:#2b1b0d}
      .wl-type .wl-l{border-style:dashed;background:#fff}
      .wl-goal .wl-l{background:#bbf7d0;border-color:#15803d;color:#14532d}
      .wl-goal-l{font-weight:900;font-size:1rem;margin-top:4px;color:#14532d}
      .cw-msg{text-align:center;font-weight:800;margin:10px 0;min-height:1.5em}
      .cw-kb{margin:8px auto 4px;max-width:34rem}
      .cw-kr{display:flex;gap:4px;justify-content:center;margin-bottom:5px}
      .cw-k{flex:1 1 0;min-width:0;max-width:52px;min-height:50px;border-radius:9px;border:2px solid #c9a46a;background:#fffdf7;color:#2b1b0d;font-weight:800;font-size:1.15rem;cursor:pointer;padding:0}
      .cw-kw{flex:1.8 1 0;max-width:84px;font-size:1rem}
      .wl .gk-btn{border-color:#c9a46a}
    </style>`;
}
