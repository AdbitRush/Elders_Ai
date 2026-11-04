// ═══════════════════════════════════════════════════════════════════════════════
// DOT TO DOT (2026-11, nostalgia batch 3) — the activity-book classic: join the numbered dots in order and a picture
// appears. Three pictures a round, drawn from nine simple outlines made for this game. Taps are forgiving: a tap near
// the right dot counts. Easy: the next dot glows. Normal: more dots, no glow. Hard: more dots, counting by threes
// (3, 6, 9...). Keyboard: Tab or arrow keys move between dots, Enter joins. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _DD_PICS = (() => {
    const star = [], heart = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 18 : 42; star.push([50 + r * Math.cos(a), 54 + r * Math.sin(a)]); }
    for (let i = 0; i < 16; i++) { const t = Math.PI * 2 * i / 16; heart.push([50 + 2.6 * 16 * Math.sin(t) ** 3, 46 - 2.6 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); }
    return [
        { name: 'a house', fill: '#fca5a5', pts: [[20, 90], [20, 50], [10, 50], [50, 14], [90, 50], [80, 50], [80, 90], [60, 90], [60, 64], [40, 64], [40, 90]] },
        { name: 'a sailboat', fill: '#93c5fd', pts: [[22, 86], [8, 70], [46, 70], [46, 10], [84, 62], [54, 62], [54, 70], [92, 70], [78, 86]] },
        { name: 'a star', fill: '#fde047', pts: star },
        { name: 'a fish', fill: '#fdba74', pts: [[8, 50], [24, 34], [44, 26], [64, 30], [80, 44], [94, 28], [92, 50], [94, 72], [80, 56], [64, 70], [44, 74], [24, 66]] },
        { name: 'a heart', fill: '#f9a8d4', pts: heart },
        { name: 'a pine tree', fill: '#86efac', pts: [[50, 6], [70, 30], [59, 30], [78, 52], [65, 52], [86, 76], [57, 76], [57, 94], [43, 94], [43, 76], [14, 76], [35, 52], [22, 52], [41, 30], [30, 30]] },
        { name: 'a rocket', fill: '#c4b5fd', pts: [[50, 4], [63, 20], [64, 58], [80, 74], [80, 90], [62, 80], [58, 90], [42, 90], [38, 80], [20, 90], [20, 74], [36, 58], [37, 20]] },
        { name: 'a cat', fill: '#fcd34d', pts: [[22, 14], [38, 32], [62, 32], [78, 14], [82, 48], [72, 72], [50, 84], [28, 72], [18, 48]] },
        { name: 'a bell', fill: '#facc15', pts: [[50, 6], [64, 14], [68, 34], [72, 58], [88, 74], [62, 80], [56, 92], [44, 92], [38, 80], [12, 74], [28, 58], [32, 34], [36, 14]] },
    ];
})();
function _ddDots(pic, diff) {
    if (diff === 'easy') return pic.pts.map((p) => p.slice());
    const out = [];   // more dots: split long sides
    pic.pts.forEach((p, i) => { const q = pic.pts[(i + 1) % pic.pts.length], d = Math.hypot(q[0] - p[0], q[1] - p[1]), k = d > 44 ? 3 : d > 24 ? 2 : 1; for (let j = 0; j < k; j++) out.push([p[0] + (q[0] - p[0]) * j / k, p[1] + (q[1] - p[1]) * j / k]); });
    return out;
}
function initDotdot() {
    NK.start('dotdot', {
        setup(gs, diff) {
            gs.diff = diff; gs.step = diff === 'hard' ? 3 : 1; gs.order = shuffle([...Array(_DD_PICS.length).keys()]).slice(0, 3); gs.k = 0; gs.misses = 0; gs.over = false;
            _ddLoad(gs);
        },
        view: _ddView,
        rules: (gs) => [
            `Join the dots in order, starting at <b>${gs.step}</b>${gs.step > 1 ? ' and counting by threes (3, 6, 9...)' : ''}. Tap each dot in turn and a line draws itself.`,
            'Taps are forgiving: a tap close to the right dot counts.',
            'After the last dot, the line closes back to the first and the picture is colored in.',
            gs.diff === 'easy' ? 'The next dot glows to help you.' : 'There is no glow on this level: find the next number yourself.',
            'Three pictures a round. No clock. Keyboard: Tab or arrow keys move between dots, Enter joins.'],
        css: `.dd-b{position:relative;scroll-margin-top:96px;scroll-margin-bottom:12px;width:min(100%,32rem,max(18rem,calc(100vh - 290px)));aspect-ratio:1;margin:0 auto;background:#fffdf5;border-radius:12px;box-shadow:inset 0 0 0 3px #d6d3d1,0 2px 0 #e7e5e4;cursor:pointer;touch-action:manipulation}
.dd-svg{position:absolute;inset:0;width:100%;height:100%}
#gameContent .nk button.dd-d{position:absolute}
.dd-d{width:7%;height:7%;margin:-3.5% 0 0 -3.5%;border:0;padding:0;background:transparent;pointer-events:none;--nk-r:50%}
.dd-n{position:absolute;transform:translate(-50%,-50%);font:800 clamp(.72rem,3.1vw,1.05rem) system-ui,sans-serif;color:#1c1917;pointer-events:none;background:rgba(255,253,245,.85);padding:0 2px;border-radius:4px;line-height:1.1}
.dd-n.dd-did{color:#a8a29e}
.dd-name{text-align:center;font:italic 800 1.35rem Georgia,serif;color:#14532d;margin:8px 0 0;min-height:1.6em}
@keyframes ddglow{0%,100%{r:2.3}50%{r:3.3}}
.dd-glow{animation:ddglow 1.2s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.dd-glow{animation:none}}`,
    });
}
function _ddLoad(gs) {
    const pic = _DD_PICS[gs.order[gs.k]]; gs.pic = pic; gs.dots = _ddDots(pic, gs.diff); gs.done = 1; gs.closed = false;
    // label positions: push each number a little away from the picture's middle so it does not sit on the line
    const cx = gs.dots.reduce((a, p) => a + p[0], 0) / gs.dots.length, cy = gs.dots.reduce((a, p) => a + p[1], 0) / gs.dots.length;
    gs.lab = gs.dots.map(([x, y]) => { const d = Math.hypot(x - cx, y - cy) || 1; return [Math.min(96, Math.max(4, x + (x - cx) / d * 5.5)), Math.min(97, Math.max(3, y + (y - cy) / d * 5.5))]; });
    gs.msg = `Picture ${gs.k + 1} of 3. The pencil is on dot ${gs.step}. Tap dot ${gs.step * 2}.`;
}
function ddBoard(e) {
    const gs = gameState.dotdot; if (gs.over || gs.closed) return;
    const b = e.currentTarget.getBoundingClientRect(), x = (e.clientX - b.left) / b.width * 100, y = (e.clientY - b.top) / b.height * 100;
    // nearest dot to the tap; the next dot wins if it is close enough, even when another dot is a bit nearer
    const want = gs.done % gs.dots.length, dist = (i) => Math.hypot(gs.dots[i][0] - x, gs.dots[i][1] - y);
    if (dist(want) < 9) return ddTap(want);
    let best = 0; gs.dots.forEach((_, i) => { if (dist(i) < dist(best)) best = i; });
    ddTap(dist(best) < 9 ? best : -1);
}
function ddTap(i) {
    const gs = gameState.dotdot; if (gs.over || gs.closed) return;
    const want = gs.done % gs.dots.length, num = (j) => (j + 1) * gs.step;
    if (i !== want) { gs.misses++; gs.msg = i < 0 ? `Tap right on a dot. The next one is ${num(want)}.` : `That is dot ${num(i)}. The next one is ${num(want)}.`; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('dotdot'); }
    if (typeof sfxFlip === 'function') sfxFlip();
    if (want === 0) {   // back to the first dot: the picture is closed
        gs.closed = true; gs.msg = `It is ${gs.pic.name}!`;
        if (gs.k === 2) { gs.over = true; NK.render('dotdot'); if (typeof sfxCorrect === 'function') sfxCorrect(); return NK.finish('dotdot', true, `Three pictures drawn: ${gs.order.map((o) => _DD_PICS[o].name.replace(/^an? /, '')).join(', ')}${gs.misses ? ` (${NK.pl(gs.misses, 'missed tap')})` : ', without a single missed tap'}.`); }
        return NK.render('dotdot');
    }
    gs.done++;
    gs.msg = gs.done === gs.dots.length ? `Last dot! Now go back to ${gs.step} to close the picture.` : `Next: ${num(gs.done % gs.dots.length)}.`;
    NK.render('dotdot');
}
function ddNext() {
    const gs = gameState.dotdot; if (gs.over || !gs.closed) return; gs.k++; _ddLoad(gs); NK.render('dotdot');
    // bring the whole new picture into view, clear of the site's sticky top bar
    const b = document.querySelector('#gameContent .dd-b'); if (b) b.scrollIntoView({ block: 'nearest' });
}
function ddNew() { initDotdot(); }
function _ddView(gs) {
    const d = gs.dots, want = gs.done % d.length, path = d.slice(0, gs.done).map((p) => p.join(' ')).join(' L');
    let svg = gs.closed ? `<path d="M${d.map((p) => p.join(' ')).join(' L')} Z" fill="${gs.pic.fill}" stroke="#1c1917" stroke-width="1.1" stroke-linejoin="round"/>` : `<path d="M${path}" fill="none" stroke="#1d4ed8" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/>`;
    d.forEach(([x, y], i) => { const did = i < gs.done; svg += `<circle cx="${x}" cy="${y}" r="${did ? 1.3 : 1.6}" fill="${did ? '#1d4ed8' : '#1c1917'}"/>`; });
    if (gs.diff === 'easy' && !gs.closed) svg += `<circle class="dd-glow" cx="${d[want][0]}" cy="${d[want][1]}" r="2.6" fill="none" stroke="#f59e0b" stroke-width=".8"/>`;
    const nums = gs.closed ? '' : d.map((_, i) => `<span class="dd-n${i < gs.done && i !== want ? ' dd-did' : ''}" style="left:${gs.lab[i][0]}%;top:${gs.lab[i][1]}%">${(i + 1) * gs.step}</span>`).join('');
    const btns = gs.closed ? '' : d.map(([x, y], i) => `<button type="button" class="nk-cell dd-d" style="left:${x}%;top:${y}%" onclick="event.stopPropagation();ddTap(${i})" data-k="d${i}"${i === want ? ' data-first' : ''} aria-label="dot ${(i + 1) * gs.step}${i < gs.done ? ', joined' : ''}${i === want ? ', next' : ''}">${''}</button>`).join('');
    const nextBtn = gs.closed && !gs.over ? NK.btn(NK.icon('arrow-right') + 'Next picture', 'ddNext()', { k: 'next', cls: 'gk-primary' }) : '';
    return `<div class="nk-top"><span>Picture <b>${gs.k + 1}</b> of 3</span><span>Dots: <b>${Math.min(gs.done, d.length)}</b> of ${d.length}</span></div>
      <div class="dd-b" onclick="ddBoard(event)"><svg class="dd-svg" viewBox="0 0 100 100" aria-hidden="true">${svg}</svg>${nums}${btns}</div>
      <div class="dd-name">${gs.closed ? gs.pic.name.charAt(0).toUpperCase() + gs.pic.name.slice(1) + '!' : ''}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${nextBtn}${NK.btn(NK.icon('rotate-ccw') + 'New round', 'ddNew()', { k: 'restart' })}</div>`;
}
