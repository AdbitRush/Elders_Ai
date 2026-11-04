// ═══════════════════════════════════════════════════════════════════════════════
// COLOR BY NUMBER (2026-11, nostalgia batch 2) — after the paint-by-number kits that were a craze in 1950s America.
// Solo, relaxing, no clock and no way to lose. The pictures are original pixel drawings made for BrainPlay.
// Each area of the picture carries a number. Pick a paint from the palette, then tap an area with that number:
// the whole area is painted. Tapping an area with a different number tells you which number it needs.
// Easy pictures are 10 x 10 with up to 5 paints; normal and hard are 12 x 12 with more paints (hard shows the
// number only once per area, the others show it in every square). Finishing reveals the picture's title.
// ═══════════════════════════════════════════════════════════════════════════════
const _CN_PICS = {
    easy: [
        { name: 'Sailboat on the bay', pal: { s: ['#93c5fd', 'sky blue'], w: ['#ffffff', 'white'], r: ['#dc2626', 'red'], b: ['#92400e', 'brown'], o: ['#1d4ed8', 'deep blue'] },
          rows: ['ssssssssss', 'sssssrssss', 'sssswrssss', 'sssswwssss', 'ssswwwwsss', 'sswwwwwsss', 'sssssbssss', 'sbbbbbbbbs', 'oobbbbbboo', 'oooooooooo'] },
        { name: 'Ice cream cone', pal: { b: ['#fde68a', 'butter yellow'], p: ['#f9a8d4', 'pink'], c: ['#dc2626', 'cherry red'], t: ['#d97706', 'toffee'], k: ['#b45309', 'dark toffee'] },
          rows: ['bbbbccbbbb', 'bbbbccbbbb', 'bbbppppbbb', 'bbppppppbb', 'bbppppppbb', 'bbttttttbb', 'bbbtkttbbb', 'bbbttktbbb', 'bbbbttbbbb', 'bbbbkbbbbb'] },
        { name: 'Little red house', pal: { s: ['#bfdbfe', 'pale blue'], r: ['#b91c1c', 'red'], y: ['#fde047', 'yellow'], g: ['#16a34a', 'green'], d: ['#78350f', 'brown'] },
          rows: ['ssssssssss', 'ssssrrssss', 'sssrrrrsss', 'ssrrrrrrss', 'srrrrrrrrs', 'sdyyddyyds', 'sdyyddyyds', 'sdddddddds', 'sddddyddds', 'gggggggggg'] },
    ],
    normal: [
        { name: 'The teapot', pal: { w: ['#fffbeb', 'cream'], t: ['#2563eb', 'blue'], l: ['#93c5fd', 'light blue'], y: ['#facc15', 'yellow'], g: ['#9ca3af', 'gray steam'], k: ['#1e3a8a', 'navy'] },
          rows: ['wwwwwgwwwwww', 'wwwwgwgwwwww', 'wwwwwyyywwww', 'wwwwttttwwww', 'wwtttttttwkw', 'wtttllltttkw', 'kttlllllttkw', 'ktttllltttww', 'wkttttttttww', 'wwttttttttww', 'wwwkkkkkkwww', 'wwwwwwwwwwww'] },
        { name: 'Red barn and the sun', pal: { s: ['#7dd3fc', 'sky blue'], y: ['#facc15', 'sun yellow'], r: ['#b91c1c', 'barn red'], w: ['#ffffff', 'white'], g: ['#15803d', 'grass green'], d: ['#713f12', 'dark brown'] },
          rows: ['ssssssssssyy', 'sssssssssyyy', 'ssssssssssyy', 'ssssrrrrssss', 'sssrrrrrrsss', 'ssrrrwwrrrss', 'srrrwddwrrrs', 'srrwdddwrrrs', 'srrwddddwrrs', 'srrwddddwrrs', 'gggggggggggg', 'gggggggggggg'] },
        { name: 'Jukebox', pal: { b: ['#fef3c7', 'cream'], o: ['#ea580c', 'orange'], y: ['#facc15', 'yellow'], p: ['#be185d', 'magenta'], k: ['#1f2937', 'black'], c: ['#22d3ee', 'cyan'] },
          rows: ['bbbbooooobbb', 'bbbooyyyoobb', 'bbooyccyyoob', 'bboyccccyoob', 'bbopkkkkpobb', 'bbopkcckpobb', 'bbopkkkkpobb', 'bbopppppppob', 'bbopyypyypob', 'bbopyypyypob', 'bbokkkkkkkob', 'bbbbbbbbbbbb'] },
    ],
};
_CN_PICS.hard = _CN_PICS.normal;
function _cnRegions(rows) {
    const H = rows.length, W = rows[0].length, id = Array.from({ length: H }, () => Array(W).fill(-1)), regs = [];
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
        if (id[r][c] >= 0) continue;
        const ch = rows[r][c], cells = [], st = [[r, c]]; id[r][c] = regs.length;
        while (st.length) { const [y, x] = st.pop(); cells.push([y, x]); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const yy = y + a, xx = x + b; if (yy >= 0 && yy < H && xx >= 0 && xx < W && id[yy][xx] < 0 && rows[yy][xx] === ch) { id[yy][xx] = regs.length; st.push([yy, xx]); } }); }
        // the label goes on the cell nearest the region's middle
        const my = cells.reduce((a, q) => a + q[0], 0) / cells.length, mx = cells.reduce((a, q) => a + q[1], 0) / cells.length;
        const lab = cells.reduce((b, q) => (Math.hypot(q[0] - my, q[1] - mx) < Math.hypot(b[0] - my, b[1] - mx) ? q : b), cells[0]);
        regs.push({ ch, cells, lab });
    }
    return { id, regs, H, W };
}
function initColorByNum() {
    NK.start('colorbynum', {
        setup(gs, diff) {
            const list = _CN_PICS[diff] || _CN_PICS.normal;
            let k; do { k = Math.floor(Math.random() * list.length); } while (list.length > 1 && k === gs.lastPic);
            gs.lastPic = k; gs.pic = list[k]; gs.diff = diff;
            gs.keys = Object.keys(gs.pic.pal); gs.num = {}; gs.keys.forEach((ch, i) => (gs.num[ch] = i + 1));
            gs.R = _cnRegions(gs.pic.rows); gs.done = gs.R.regs.map(() => false); gs.paint = 1; gs.over = false;
            gs.msg = 'Pick a paint, then tap an area that shows its number.';
        },
        view: _cnView,
        keys: NK.digits((n) => cnPaint(n), 7),
        rules: [
            'Every area of the picture shows a number. The palette below shows which paint each number is.',
            'Tap a paint, then tap an area with the <b>same number</b>: the whole area is painted at once.',
            'If you tap an area with a different number, the game tells you which number it needs - nothing is spoiled.',
            'Paint every area to see the finished picture and its title. There is no clock and no way to lose.',
            'Keyboard: 1 to 7 choose a paint, arrow keys move around the picture, Enter paints.'],
        css: `.cn-grid{display:grid;gap:1px;background:#a08360;padding:2px;border-radius:8px;max-width:min(100%,30rem);margin:0 auto}
.cn-c{aspect-ratio:1;border:0;padding:0;background:#fffdf5;color:#4a3420;font:800 clamp(.62rem,2.6vw,.95rem)/1 system-ui,sans-serif;display:flex;align-items:center;justify-content:center;cursor:pointer;--nk-r:0;min-width:0}
.cn-c.cn-on{color:transparent}
.cn-c.cn-hl{background:#fef3c7}
.cn-pal{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0}
.cn-pal .gk-btn{gap:8px;padding:6px 12px}
.cn-pal i{display:inline-block;width:26px;height:26px;border-radius:6px;border:2px solid #4a3420}
.cn-pal .gk-btn.cn-left{opacity:.5}
.cn-title{text-align:center;font:900 1.4rem Georgia,serif;color:#7c2d12;margin-top:8px}`,
    });
}
function cnPaint(n) { const gs = gameState.colorbynum; if (gs.over || n < 1 || n > gs.keys.length) return; gs.paint = n; gs.msg = `Paint ${n}: ${gs.pic.pal[gs.keys[n - 1]][1]}. Tap areas marked ${n}.`; NK.render('colorbynum'); }
function cnTap(r, c) {
    const gs = gameState.colorbynum; if (gs.over) return;
    const k = gs.R.id[r][c], reg = gs.R.regs[k], need = gs.num[reg.ch];
    if (gs.done[k]) { gs.msg = 'That area is already painted.'; return NK.render('colorbynum'); }
    if (need !== gs.paint) { gs.msg = `That area is number ${need} (${gs.pic.pal[reg.ch][1]}). Pick paint ${need} for it.`; return NK.render('colorbynum'); }
    gs.done[k] = true; if (typeof sfxFlip === 'function') sfxFlip();
    const left = gs.done.filter((x) => !x).length;
    if (!left) {
        gs.over = true; gs.msg = `Finished: "${gs.pic.name}".`; NK.render('colorbynum');
        if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('colorbynum', true, `You painted "${gs.pic.name}".`);
    }
    const sameLeft = gs.R.regs.filter((x, i) => !gs.done[i] && gs.num[x.ch] === gs.paint).length;
    gs.msg = sameLeft ? `${NK.pl(sameLeft, 'area')} left for paint ${gs.paint}.` : `Paint ${gs.paint} is finished. ${NK.pl(left, 'area')} to go - pick another paint.`;
    NK.render('colorbynum');
}
function cnNew() { initColorByNum(); }
function _cnView(gs) {
    const { id, regs, H, W } = gs.R, every = gs.diff !== 'hard';
    let cells = '';
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
        const k = id[r][c], reg = regs[k], n = gs.num[reg.ch], on = gs.done[k];
        const show = !on && (every || (reg.lab[0] === r && reg.lab[1] === c));
        const hl = !on && n === gs.paint;
        cells += `<button type="button" class="nk-cell cn-c${on ? ' cn-on' : ''}${hl ? ' cn-hl' : ''}" style="${on ? 'background:' + gs.pic.pal[reg.ch][0] : ''}" onclick="cnTap(${r},${c})" data-k="c${r}_${c}"${r === 0 && c === 0 ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}, ${on ? 'painted ' + gs.pic.pal[reg.ch][1] : 'number ' + n}"${gs.over ? ' disabled' : ''}>${show ? n : ''}</button>`;
    }
    const pal = gs.keys.map((ch, i) => { const left = regs.some((x, k) => !gs.done[k] && x.ch === ch); return NK.btn(`<i style="background:${gs.pic.pal[ch][0]}"></i>${i + 1} ${gs.pic.pal[ch][1]}`, `cnPaint(${i + 1})`, { k: 'p' + (i + 1), pressed: gs.paint === i + 1, cls: left ? '' : 'cn-left' }); }).join('');
    const doneN = gs.done.filter(Boolean).length;
    return `<div class="nk-top"><span>Areas painted: <b>${doneN}</b> of ${regs.length}</span><span>Paint: <b>${gs.paint}</b></span></div>
      <div class="cn-grid" style="grid-template-columns:repeat(${W},1fr)">${cells}</div>
      ${gs.over ? `<div class="cn-title">"${gs.pic.name}"</div>` : ''}
      <div class="cn-pal" role="group" aria-label="paints">${pal}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New picture', 'cnNew()', { k: 'restart' })}</div>`;
}
