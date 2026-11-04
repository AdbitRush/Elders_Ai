// ═══════════════════════════════════════════════════════════════════════════════
// CRATE SHOVE (2026-11, nostalgia batch 3) — the warehouse box-pushing puzzle of early home computers, in original
// little rooms. Walk the worker around and push every crate onto a marked spot. Crates can only be pushed, never
// pulled, and only one at a time, so a crate shoved into a corner is stuck (Undo is free). Three rooms a round.
// The rooms were made by pulling crates backwards from a finished room, then checked with a breadth-first solver,
// which also gives the fewest steps. Easy: one crate. Normal: two. Hard: three.
// Room rows: '#' wall, ' ' floor, '.' spot, '$' crate, '*' crate on a spot, '@' worker, '+' worker on a spot.
// ═══════════════════════════════════════════════════════════════════════════════
const _CR_LV = {   // { rows, m (fewest steps) }, made by the generator and checked with a breadth-first solver
    easy: [
        { rows: ["########", "###  ###", "## $ ###", "#     ##", "#@     #", "# .#####", "########"], m: 15 },
        { rows: ["######", "## ###", "##  ##", "##  @#", "#  $ #", "#    #", "# ##.#", "######"], m: 8 },
        { rows: ["#####", "# @ #", "# $ #", "#   #", "#  ##", "#.###", "#####"], m: 8 },
        { rows: ["########", "##   ###", "##   $@#", "##    ##", "#   #  #", "#  #  ##", "####  .#", "########"], m: 17 },
        { rows: ["######", "###  #", "#  $ #", "# +  #", "######"], m: 9 },
        { rows: ["########", "#  #####", "# .   ##", "###  $@#", "###  ###", "########"], m: 8 },
        { rows: ["######", "#   +#", "# $  #", "##   #", "######"], m: 9 },
        { rows: ["#####", "#  ##", "#  ##", "# $ #", "##.@#", "#####"], m: 8 },
        { rows: ["######", "##  ##", "#.   #", "#@$  #", "##   #", "#### #", "######"], m: 8 },
        { rows: ["#######", "#### ##", "#### ##", "##    #", "##  $ #", "#@ . ##", "#######"], m: 11 },
        { rows: ["######", "#  ###", "#  ###", "#  + #", "# $ ##", "#  ###", "######"], m: 9 },
        { rows: ["######", "### ##", "#   ##", "#@.  #", "# $# #", "##   #", "###  #", "######"], m: 8 }],
    normal: [
        { rows: ["########", "#      #", "# $  #$#", "##@. #.#", "########"], m: 15 },
        { rows: ["########", "###   .#", "###  $ #", "###  $ #", "# @  ###", "# #. ###", "# ######", "########"], m: 21 },
        { rows: ["#######", "#  @  #", "# $####", "# $.. #", "#######"], m: 15 },
        { rows: ["########", "##   ###", "##  .  #", "#@$ #$ #", "## .  ##", "########"], m: 16 },
        { rows: ["#######", "##.####", "##.####", "# $ $ #", "##   @#", "#######"], m: 16 },
        { rows: ["######", "#  .##", "# $ ##", "#    #", "#.####", "#$ ###", "#@####", "######"], m: 16 },
        { rows: ["########", "###  ###", "# # ####", "#   *  #", "# ##  ##", "# # $ ##", "#  @.###", "########"], m: 17 },
        { rows: ["########", "##  #.##", "#  $.  #", "#   $ ##", "####  @#", "########"], m: 17 },
        { rows: ["########", "#  @ .##", "# #$ $.#", "#   ## #", "########"], m: 17 },
        { rows: ["#######", "# #####", "#  .# #", "##@ $ #", "### $ #", "###.  #", "#######"], m: 15 },
        { rows: ["########", "###    #", "# $   ##", "#+$.#  #", "### ####", "########"], m: 15 },
        { rows: ["#######", "#    ##", "#@ $$ #", "#     #", "#. .###", "### ###", "#######"], m: 15 }],
    hard: [
        { rows: ["########", "#   ####", "# $$####", "# . .  #", "# $ . @#", "########"], m: 26 },
        { rows: ["#######", "##@ ###", "## $$ #", "#. .$.#", "##    #", "#######"], m: 30 },
        { rows: ["#######", "#  *@ #", "#  #$ #", "# . $ #", "##. ###", "#######"], m: 25 },
        { rows: ["#######", "###   #", "### # #", "###$$.#", "# #.$@#", "#    ##", "#  .###", "#######"], m: 28 },
        { rows: ["#######", "##@#..#", "##$   #", "#   $ #", "#  .$ #", "#   ###", "#######"], m: 26 },
        { rows: ["#######", "##.####", "#+$.  #", "## $$ #", "##    #", "#######"], m: 25 },
        { rows: ["########", "###    #", "#      #", "# $ $*.#", "# #@#  #", "#.######", "########"], m: 27 },
        { rows: ["#######", "#.##  #", "#. $  #", "# $ # #", "##. $ #", "#####@#", "#######"], m: 25 },
        { rows: ["########", "#     .#", "# $#$# #", "# $+ # #", "####.  #", "##### ##", "########"], m: 25 },
        { rows: ["#######", "#@  ###", "# $ ###", "##. $ #", "###.. #", "### $ #", "####  #", "#######"], m: 26 },
        { rows: ["######", "#@  ##", "#$ $##", "#. .##", "##$ .#", "##   #", "###  #", "######"], m: 25 },
        { rows: ["########", "#### ###", "####.$.#", "###   ##", "# $. ###", "#  $@###", "#   ####", "########"], m: 26 }],
};
function initCrates() {
    NK.start('crates', {
        setup(gs, diff) { gs.diff = diff; gs.list = shuffle(_CR_LV[diff].slice()).slice(0, 3); gs.k = 0; gs.over = false; gs.totalMoves = 0; _crLoad(gs); },
        view: _crView,
        keys: { KeyU: () => crUndo(), KeyZ: () => crUndo() },
        arrows(dir) { crStep({ up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[dir]); return true; },
        rules: [
            'Walk the <b>worker</b> and push every <b>crate</b> onto a <b>marked spot</b>.',
            'You can only <b>push</b> a crate, never pull it, and only one at a time. Walking into a crate pushes it if the square beyond is free.',
            'A crate pushed into a corner can never come out: tap <b>Undo</b> (free, as often as you like) or start the room over.',
            'Move with the arrow buttons, the arrow keys, or by tapping a square next to the worker. Three rooms a round.',
            'Each room shows the fewest steps it can be done in: a target for the keen, not a rule. No clock. U undoes.'],
        css: `.cr-b{display:grid;gap:0;max-width:min(100%,28rem,max(16rem,calc(100vh - 380px)));margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 0 0 4px #44403c}
.cr-s{aspect-ratio:1;border:0;padding:0;min-width:0;position:relative;display:flex;align-items:center;justify-content:center;--nk-r:0;background:#d6c7a1}
.cr-w{background:#57534e;background-image:linear-gradient(#78716c 2px,transparent 2px),linear-gradient(90deg,#78716c 2px,transparent 2px);background-size:50% 50%}
.cr-g::before{content:"";position:absolute;width:42%;height:42%;border-radius:50%;border:4px dashed #b91c1c}
.cr-c{position:absolute;inset:9%;border-radius:6px;background:repeating-linear-gradient(45deg,#b45309 0 6px,#d97706 6px 12px);border:3px solid #78350f;box-shadow:inset 0 0 0 3px rgba(255,255,255,.2)}
.cr-c.cr-on{background:repeating-linear-gradient(45deg,#15803d 0 6px,#22c55e 6px 12px);border-color:#14532d}
.cr-p{position:absolute;inset:14%;border-radius:50%;background:radial-gradient(circle at 40% 35%,#93c5fd,#1d4ed8 70%);border:3px solid #1e3a8a;z-index:1}
.cr-p::after{content:"";position:absolute;left:28%;right:28%;top:-14%;height:30%;border-radius:40% 40% 0 0;background:#facc15;border:2px solid #854d0e}
.cr-pad{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,56px);gap:6px;justify-content:center;margin:12px 0 0}
.cr-pad .gk-btn{min-width:0;padding:0}`,
    });
}
function _crLoad(gs) {
    const L = gs.list[gs.k]; gs.rows = L.rows; gs.best = L.m; gs.W = L.rows[0].length; gs.H = L.rows.length;
    gs.wall = []; gs.goal = []; gs.box = []; gs.hist = []; gs.moves = 0; gs.solved = false;
    L.rows.forEach((row, r) => [...row].forEach((ch, c) => { const i = r * gs.W + c; if (ch === '#') gs.wall.push(i); if ('.*+'.includes(ch)) gs.goal.push(i); if ('$*'.includes(ch)) gs.box.push(i); if ('@+'.includes(ch)) gs.pl = i; }));
    gs.msg = `Room ${gs.k + 1} of 3: push ${NK.pl(gs.box.length, 'crate')} onto the red spots. It can be done in ${gs.best} steps.`;
}
function crStep(d) {
    const gs = gameState.crates; if (gs.over || gs.solved || !d) return;
    const W = gs.W, n = gs.pl + d[0] * W + d[1], n2 = n + d[0] * W + d[1];
    if (gs.wall.includes(n)) return;
    const b = gs.box.indexOf(n);
    if (b >= 0 && (gs.wall.includes(n2) || gs.box.includes(n2))) { gs.msg = 'That crate is blocked on the other side.'; return NK.render('crates'); }
    gs.hist.push([gs.pl, gs.box.slice()]); gs.pl = n; gs.moves++;
    if (b >= 0) { gs.box[b] = n2; if (typeof sfxFlip === 'function') sfxFlip(); }
    const on = gs.box.filter((x) => gs.goal.includes(x)).length;
    if (on === gs.box.length) {
        gs.solved = true; gs.totalMoves += gs.moves; if (typeof sfxCorrect === 'function') sfxCorrect();
        gs.msg = `Room ${gs.k + 1} done in ${gs.moves} steps${gs.moves <= gs.best ? ': the fewest possible!' : ` (fewest: ${gs.best})`}.`;
        if (gs.k === 2) { gs.over = true; NK.render('crates'); return NK.finish('crates', true, `Three rooms cleared in ${gs.totalMoves} steps.`); }
        return NK.render('crates');
    }
    gs.msg = b >= 0 ? `${on} of ${gs.box.length} crates on spots. ${gs.moves} steps.` : `${gs.moves} steps.`;
    // a crate stuck in a corner that is not a spot
    const stuck = gs.box.some((x) => !gs.goal.includes(x) && ((gs.wall.includes(x - W) || gs.wall.includes(x + W)) && (gs.wall.includes(x - 1) || gs.wall.includes(x + 1))));
    if (stuck) gs.msg += ' A crate is stuck in a corner: tap Undo.';
    NK.render('crates');
}
function crTap(i) { const gs = gameState.crates, W = gs.W, dr = Math.floor(i / W) - Math.floor(gs.pl / W), dc = (i % W) - (gs.pl % W); if (Math.abs(dr) + Math.abs(dc) === 1) crStep([dr, dc]); }
function crUndo() { const gs = gameState.crates; if (gs.over || gs.solved || !gs.hist.length) return; [gs.pl, gs.box] = gs.hist.pop(); gs.moves++; gs.msg = 'One step taken back.'; NK.render('crates'); }
function crReset() { const gs = gameState.crates; if (gs.over || gs.solved) return; _crLoad(gs); NK.render('crates'); }
function crNext() { const gs = gameState.crates; if (gs.over || !gs.solved) return; gs.k++; _crLoad(gs); NK.render('crates'); }
function crNew() { initCrates(); }
function _crView(gs) {
    let h = '';
    for (let i = 0; i < gs.W * gs.H; i++) {
        const w = gs.wall.includes(i), g = gs.goal.includes(i), b = gs.box.includes(i), p = gs.pl === i;
        const lab = w ? 'wall' : `${p ? 'worker' : b ? 'crate' : 'floor'}${g ? ' on a spot' : ''}`;
        h += `<button type="button" class="nk-cell cr-s${w ? ' cr-w' : ''}${g ? ' cr-g' : ''}" onclick="crTap(${i})" data-k="c${i}"${p ? ' data-first' : ''} aria-label="row ${Math.floor(i / gs.W) + 1} column ${i % gs.W + 1}: ${lab}" tabindex="-1"${w ? ' disabled' : ''}>${b ? `<span class="cr-c${g ? ' cr-on' : ''}"></span>` : ''}${p ? '<span class="cr-p"></span>' : ''}</button>`;
    }
    const on = gs.box.filter((x) => gs.goal.includes(x)).length, dis = gs.over || gs.solved;
    const pad = `<div class="cr-pad" role="group" aria-label="move the worker"><span></span>${NK.btn(NK.icon('arrow-up'), 'crStep([-1,0])', { k: 'up', label: 'up', disabled: dis })}<span></span>${NK.btn(NK.icon('arrow-left'), 'crStep([0,-1])', { k: 'left', label: 'left', disabled: dis })}${NK.btn(NK.icon('arrow-down'), 'crStep([1,0])', { k: 'down', label: 'down', disabled: dis })}${NK.btn(NK.icon('arrow-right'), 'crStep([0,1])', { k: 'right', label: 'right', disabled: dis })}</div>`;
    return `<div class="nk-top"><span>Room <b>${gs.k + 1}</b> of 3</span><span>Crates on spots: <b>${on}</b> of ${gs.box.length}</span><span>Steps: <b>${gs.moves}</b> (best ${gs.best})</span></div>
      <div class="cr-b" style="grid-template-columns:repeat(${gs.W},1fr)">${h}</div>${pad}
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${gs.solved && !gs.over ? NK.btn(NK.icon('arrow-right') + 'Next room', 'crNext()', { k: 'next', cls: 'gk-primary' }) : ''}${NK.btn(NK.icon('undo-2') + 'Undo', 'crUndo()', { k: 'undo', disabled: dis || !gs.hist.length })}${NK.btn('Start room over', 'crReset()', { k: 'reset', disabled: dis })}${NK.btn(NK.icon('rotate-ccw') + 'New round', 'crNew()', { k: 'restart' })}</div>`;
}
