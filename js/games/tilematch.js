// ═══════════════════════════════════════════════════════════════════════════════
// TILE MATCH (2026-11, nostalgia batch 2) — tile-matching solitaire in the style of the mahjong tile puzzles that
// came to home computers in the 1980s (the tile game itself was an American parlor craze in the 1920s).
// Original tile faces (simple picture symbols), not traditional mahjong tiles. Solo, no clock.
// Remove the tiles in matching pairs. A tile is FREE when no tile lies on top of it and its left or right side is
// open. Tap two free tiles with the same picture to remove them. Clear the board to win.
// Every deal is built backwards (pairs placed so that each could have been the next pair removed), so every deal
// can be cleared. Undo, Hint (shows a free pair) and Shuffle (re-deals the remaining tiles, still solvable) help.
// Blocked tiles are shaded so free ones stand out. Easy 32 tiles, normal 44, hard 68; four of each picture.
// Positions: {c, r, z}; layer z+1 sits on layer z offset by one cell, so tile (c, r, z+1) covers (c, r, z).
// ═══════════════════════════════════════════════════════════════════════════════
const _TM_FACES = [['flower', '#be185d'], ['sun', '#c2410c'], ['moon', '#4338ca'], ['star', '#a16207'], ['heart', '#be123c'], ['leaf', '#15803d'], ['fish', '#0369a1'], ['bird', '#0f766e'],
    ['cat', '#92400e'], ['key', '#a16207'], ['house', '#9a3412'], ['bell', '#b45309'], ['music', '#7e22ce'], ['coffee', '#78350f'], ['apple', '#c62828'], ['sailboat', '#0369a1'], ['crown', '#a16207']];
const _TM_LAYOUT = {
    easy: [[6, 4, 0], [4, 2, 1]],
    normal: [[6, 5, 0], [4, 3, 1], [2, 1, 2]],
    hard: [[7, 6, 0], [5, 4, 1], [3, 2, 2]],
};
function _tmPositions(diff) {
    const out = [];
    (_TM_LAYOUT[diff] || _TM_LAYOUT.normal).forEach(([w, h, z]) => { for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) out.push({ c: c + z, r: r + z, z }); });
    return out;
}
const _tmKey = (c, r, z) => c + ',' + r + ',' + z;
function _tmFreeIn(set, p) {
    if (set.has(_tmKey(p.c, p.r, p.z + 1))) return false;
    return !set.has(_tmKey(p.c - 1, p.r, p.z)) || !set.has(_tmKey(p.c + 1, p.r, p.z));
}
// deal faces onto `pos` (array of positions) so the board can be cleared: build it pair by pair, bottom up.
// pairFaces: the face of each pair to place (new game: every picture twice, i.e. four tiles; Shuffle: the pairs left)
function _tmDeal(pos, pairFaces) {
    pairFaces = pairFaces || Array.from({ length: pos.length / 2 }, (_, i) => i % (pos.length / 4));
    for (let attempt = 0; attempt < 300; attempt++) {
        const set = new Set(), face = {}, bag = shuffle(pairFaces.slice());
        let ok = true;
        while (set.size < pos.length) {
            // a tile may be added when the one beneath it is in, and it is free in the board as built so far
            // ...and rows grow as one unbroken run (a tile dropped between two others could never be free)
            const ext = (p) => { const cols = pos.filter((q) => q.r === p.r && q.z === p.z && set.has(_tmKey(q.c, q.r, q.z))).map((q) => q.c); return !cols.length || p.c === Math.min(...cols) - 1 || p.c === Math.max(...cols) + 1; };
            const can = pos.filter((p) => { const k = _tmKey(p.c, p.r, p.z); if (set.has(k)) return false; if (p.z && !set.has(_tmKey(p.c, p.r, p.z - 1))) return false; if (set.has(_tmKey(p.c, p.r, p.z + 1))) return false; return ext(p); });
            let pair = null;
            for (const a of shuffle(can.slice())) {
                set.add(_tmKey(a.c, a.r, a.z));
                const can2 = pos.filter((x) => x !== a && !set.has(_tmKey(x.c, x.r, x.z)) && (!x.z || set.has(_tmKey(x.c, x.r, x.z - 1))) && !set.has(_tmKey(x.c, x.r, x.z + 1)) && ext(x));
                const b = shuffle(can2).find((x) => { set.add(_tmKey(x.c, x.r, x.z)); const f = _tmFreeIn(set, a) && _tmFreeIn(set, x); set.delete(_tmKey(x.c, x.r, x.z)); return f; });
                set.delete(_tmKey(a.c, a.r, a.z));
                if (b) { pair = [a, b]; break; }
            }
            if (!pair) { ok = false; break; }
            const f = bag.pop(); pair.forEach((p) => { set.add(_tmKey(p.c, p.r, p.z)); face[_tmKey(p.c, p.r, p.z)] = f; });
        }
        if (ok) return face;
    }
    return null;
}
function initTileMatch() {
    NK.start('tilematch', {
        setup(gs, diff) {
            gs.diff = diff; gs.pos = _tmPositions(diff); let f = null; while (!f) f = _tmDeal(gs.pos);
            gs.t = gs.pos.map((p) => ({ ...p, f: f[_tmKey(p.c, p.r, p.z)], gone: false }));
            gs.sel = -1; gs.hist = []; gs.hint = null; gs.over = false; gs.shuffles = 0;
            gs.msg = 'Tap two free tiles with the same picture. Shaded tiles are blocked for now.';
        },
        view: _tmView,
        keys: { KeyH: () => tmHint(), KeyU: () => tmUndo() },
        rules: [
            'Remove all the tiles in <b>matching pairs</b>. Each picture appears four times.',
            'A tile is <b>free</b> when no tile lies on top of it and nothing touches it on its left side or on its right side. Blocked tiles are shaded.',
            'Tap a free tile, then another free tile with the same picture: both are removed.',
            'Plan ahead: a tile on top, or at the end of a long row, often needs to go first.',
            'Every deal can be cleared, but an unlucky order of pairs can leave a dead end. Hint looks ahead and shows a pair that keeps the board clearable. Undo takes back a pair; Shuffle re-deals the remaining tiles; Give up appears when you are stuck.',
            'No clock. Keyboard: arrow keys move between tiles, Enter picks, H hint, U undo.'],
        css: `.tm-board{position:relative;margin:0 auto;max-width:100%}
.tm-t{position:absolute;border:2px solid #8a6a4a;border-radius:9px;background:linear-gradient(#fffdf5,#f1e4c8);box-shadow:3px 4px 0 #a08360,4px 6px 6px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;--nk-r:9px;--nk-bw:2px}
.tm-t.tm-blk{filter:brightness(.78) saturate(.7);cursor:default}
.tm-t.tm-sel{background:#fde68a;border-color:#b45309;box-shadow:0 0 0 4px #1d4ed8,3px 4px 0 #a08360}
.tm-t.tm-hint{outline:4px dashed #15803d;outline-offset:2px}
#gameContent .nk button.tm-t{position:absolute}`,
    });
}
const _tmLive = (gs) => new Set(gs.t.filter((x) => !x.gone).map((x) => _tmKey(x.c, x.r, x.z)));
const _tmIsFree = (gs, i, live) => _tmFreeIn(live || _tmLive(gs), gs.t[i]);
function _tmPairs(gs) { const live = _tmLive(gs), fr = gs.t.map((x, i) => (!x.gone && _tmIsFree(gs, i, live) ? i : -1)).filter((i) => i >= 0), out = []; for (let a = 0; a < fr.length; a++) for (let b = a + 1; b < fr.length; b++) if (gs.t[fr[a]].f === gs.t[fr[b]].f) out.push([fr[a], fr[b]]); return out; }
function tmTap(i) {
    const gs = gameState.tilematch; if (gs.over) return;
    const t = gs.t[i]; if (t.gone) return;
    gs.hint = null;
    if (!_tmIsFree(gs, i)) { gs.msg = 'That tile is blocked: a tile lies on top of it, or both of its sides are covered.'; return NK.render('tilematch'); }
    if (gs.sel < 0 || gs.sel === i) { gs.sel = gs.sel === i ? -1 : i; gs.msg = gs.sel < 0 ? '' : 'Now tap a free tile with the same picture.'; return NK.render('tilematch'); }
    if (gs.t[gs.sel].f !== t.f) { gs.sel = i; gs.msg = 'Those pictures do not match. This tile is picked now instead.'; return NK.render('tilematch'); }
    gs.hist.push([gs.sel, i]); gs.t[gs.sel].gone = true; t.gone = true; gs.sel = -1;
    if (typeof sfxFlip === 'function') sfxFlip();
    const left = gs.t.filter((x) => !x.gone).length;
    if (!left) { gs.over = true; gs.msg = 'The board is clear!'; NK.render('tilematch'); if (typeof sfxCorrect === 'function') sfxCorrect(); return NK.finish('tilematch', true, `Every tile matched${gs.shuffles ? ` (with ${NK.pl(gs.shuffles, 'shuffle')})` : ''}!`); }
    gs.msg = _tmPairs(gs).length ? `${left} tiles to go.` : 'No free pairs left. Press Undo, or Shuffle to re-deal the remaining tiles.';
    NK.render('tilematch');
}
function tmUndo() { const gs = gameState.tilematch; if (gs.over || !gs.hist.length) return; gs.stuck = false; gs.hist.pop().forEach((i) => (gs.t[i].gone = false)); gs.sel = -1; gs.hint = null; gs.msg = 'Pair put back.'; NK.render('tilematch'); }
// a pair to take that still lets the whole board be cleared (bounded search; null = none found in time)
function _tmSafePair(gs, budget) {
    const t = gs.t, seen = new Set(); let n = 0;
    const live = new Set(t.map((x, i) => (x.gone ? -1 : i)).filter((i) => i >= 0));
    const keyset = () => new Set([...live].map((i) => _tmKey(t[i].c, t[i].r, t[i].z)));
    function go() {
        if (!live.size) return [];
        if (++n > budget) throw 0;
        const sig = [...live].sort((a, b) => a - b).join(','); if (seen.has(sig)) return null; seen.add(sig);
        const ks = keyset(), fr = [...live].filter((i) => _tmFreeIn(ks, t[i]));
        // tiles that cover others first: they are the usual bottlenecks
        const cov = (i) => (ks.has(_tmKey(t[i].c, t[i].r, t[i].z - 1)) ? 2 : 0) + t[i].z;
        const pairs = []; for (let a = 0; a < fr.length; a++) for (let b = a + 1; b < fr.length; b++) if (t[fr[a]].f === t[fr[b]].f) pairs.push([fr[a], fr[b]]);
        pairs.sort((x, y) => cov(y[0]) + cov(y[1]) - cov(x[0]) - cov(x[1]));
        for (const pr of pairs) { live.delete(pr[0]); live.delete(pr[1]); const r = go(); live.add(pr[0]); live.add(pr[1]); if (r) return [pr].concat(r); }
        return null;
    }
    try { const r = go(); return r === null ? false : r[0] || null; } catch (e) { return null; }
}
function tmHint() {
    const gs = gameState.tilematch; if (gs.over) return;
    const p = _tmPairs(gs); if (!p.length) { gs.hint = null; gs.msg = _tmStuckMsg(gs); return NK.render('tilematch'); }
    const safe = _tmSafePair(gs, 40000);
    gs.hint = safe || p[0];
    gs.msg = safe ? 'A matching free pair is outlined in green, and the board can still be cleared after it.' : safe === false ? 'From here the board cannot be cleared any more. Undo a few pairs, try Shuffle, or Give up.' : 'A matching free pair is outlined in green.';
    NK.render('tilematch');
}
const _tmStuckMsg = (gs) => 'No free pairs left. Press Undo, or Shuffle to re-deal the remaining tiles.';
function tmGiveUp() { const gs = gameState.tilematch; if (gs.over) return; gs.over = true; gs.msg = 'You gave up this deal.'; NK.render('tilematch'); NK.finish('tilematch', false, `${NK.pl(gs.t.filter((x) => !x.gone).length, 'tile')} left on this deal. The Hint button looks ahead, so it can help avoid dead ends.`); }
function tmShuffle() {
    const gs = gameState.tilematch; if (gs.over) return;
    const live = gs.t.filter((x) => !x.gone), cnt = {};
    live.forEach((x) => (cnt[x.f] = (cnt[x.f] || 0) + 1));   // tiles leave in pairs, so every count is even
    const pairs = Object.keys(cnt).flatMap((f) => Array(cnt[f] / 2).fill(+f)), f = _tmDeal(live, pairs);
    if (!f) { gs.stuck = true; gs.msg = 'These tiles cannot all be cleared from here, even re-dealt (a tile lies on top of its only possible match). Undo a few pairs, or Give up.'; return NK.render('tilematch'); }
    live.forEach((x) => (x.f = f[_tmKey(x.c, x.r, x.z)])); gs.hist = []; gs.sel = -1; gs.hint = null; gs.shuffles++; gs.stuck = false;
    gs.msg = 'The remaining tiles were re-dealt (and can still all be cleared).'; NK.render('tilematch');
}
function tmNew() { initTileMatch(); }
function _tmView(gs) {
    const maxC = Math.max(...gs.pos.map((p) => p.c)) + 1, maxR = Math.max(...gs.pos.map((p) => p.r)) + 1;
    const W = 100 / (maxC + 0.3), H = 1.28;   // a tile is W% of the board wide, H x as tall as wide
    const live = _tmLive(gs), dz = 1.4;   // each layer sits right on the one below, nudged up and left so the stack shows
    const order = gs.t.map((x, i) => i).filter((i) => !gs.t[i].gone).sort((a, b) => gs.t[a].z - gs.t[b].z || gs.t[a].r - gs.t[b].r || gs.t[a].c - gs.t[b].c);
    const tiles = order.map((i) => {
        const x = gs.t[i], free = _tmFreeIn(live, x), [ic, col] = _TM_FACES[x.f];
        const st = `left:${(x.c + 0.15) * W - x.z * dz}%;top:calc(${x.r * W * H + 0.6}cqw - ${x.z * dz * 1.6}cqw);width:${W * 0.94}%;height:${W * H * 0.94}cqw;z-index:${x.z * 10 + 1}`;
        return `<button type="button" class="nk-cell tm-t${free ? '' : ' tm-blk'}${gs.sel === i ? ' tm-sel' : ''}${gs.hint && gs.hint.includes(i) ? ' tm-hint' : ''}" style="${st};color:${col}" onclick="tmTap(${i})" data-k="t${i}" aria-label="${ic} tile${free ? '' : ', blocked'}"${gs.over ? ' disabled' : ''}>${Icon.svg(ic, { size: '62%', sw: 2.4, fill: true, fillOpacity: .2 })}</button>`;
    }).join('');
    const left = gs.t.filter((x) => !x.gone).length;
    return `<div class="nk-top"><span>Tiles left: <b>${left}</b></span><span>Free pairs: <b>${_tmPairs(gs).length}</b></span></div>
      <div style="container-type:inline-size;max-width:min(100%,34rem);margin:0 auto"><div class="tm-board" style="height:${(maxR + 0.4) * W * H}cqw">${tiles}</div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('undo-2') + 'Undo', 'tmUndo()', { k: 'undo', disabled: gs.over || !gs.hist.length })}${NK.btn(NK.icon('lightbulb') + 'Hint', 'tmHint()', { k: 'hint', disabled: gs.over })}${NK.btn(NK.icon('shuffle') + 'Shuffle', 'tmShuffle()', { k: 'shuffle', disabled: gs.over })}${!gs.over && (gs.stuck || !_tmPairs(gs).length) ? NK.btn('Give up', 'tmGiveUp()', { k: 'giveup' }) : ''}${NK.btn(NK.icon('rotate-ccw') + 'New deal', 'tmNew()', { k: 'restart' })}</div>`;
}
