// ═══════════════════════════════════════════════════════════════════════════════
// SEA SALVO (2026-11, nostalgia batch 2) — the pencil-and-paper hidden-fleet game played on squared paper long
// before it came in a box, against the computer. No clock.
// Both sides hide a fleet on an 8x8 sea. Take turns calling one square: "hit" or "miss". When every square of a ship
// is hit, it is sunk (and named). Sink the whole fleet first to win.
// Fleet: easy 4+3+2+2, normal 4+3+3+2, hard 4+3+3+2+2. Your fleet is placed for you (Shuffle my ships before the
// first shot). Firing is two-step on purpose: tap a square to aim (crosshair), tap again or press Fire.
// Computer: easy shoots at random and only sometimes follows up a hit; normal hunts on a checkerboard and follows
// hits; hard also lines up two hits before trying the ends.
// ═══════════════════════════════════════════════════════════════════════════════
const _SV_N = 8;
const _SV_NAMES = { 4: 'liner', 3: 'steamer', 2: 'tugboat' };
function _svPlace(sizes) {
    for (;;) {
        const g = Array(_SV_N * _SV_N).fill(-1), ships = []; let ok = true;
        for (let k = 0; k < sizes.length && ok; k++) {
            let placed = false;
            for (let t = 0; t < 200 && !placed; t++) {
                const hz = Math.random() < .5, L = sizes[k], r = Math.floor(Math.random() * (_SV_N - (hz ? 0 : L - 1))), c = Math.floor(Math.random() * (_SV_N - (hz ? L - 1 : 0)));
                const cells = Array.from({ length: L }, (_, i) => (r + (hz ? 0 : i)) * _SV_N + c + (hz ? i : 0));
                // ships never touch, not even at the corners (fairer to find)
                if (cells.every((x) => { const rr = Math.floor(x / _SV_N), cc = x % _SV_N; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const y = rr + a, z = cc + b; if (y >= 0 && y < _SV_N && z >= 0 && z < _SV_N && g[y * _SV_N + z] >= 0) return false; } return true; })) {
                    cells.forEach((x) => (g[x] = k)); ships.push({ L, cells, hits: 0 }); placed = true;
                }
            }
            ok = placed;
        }
        if (ok) return { g, ships };
    }
}
function initSalvo() {
    NK.start('salvo', {
        setup(gs, diff) {
            gs.diff = diff; gs.sizes = diff === 'easy' ? [4, 3, 2, 2] : diff === 'hard' ? [4, 3, 3, 2, 2] : [4, 3, 3, 2];
            gs.me = _svPlace(gs.sizes); gs.cpu = _svPlace(gs.sizes);
            gs.myShots = Array(64).fill(0); gs.cpuShots = Array(64).fill(0);   // 0 untried, 1 miss, 2 hit
            gs.aim = -1; gs.turn = 1; gs.over = false; gs.shots = 0; gs.lastCpu = -1; gs.cpuHits = [];
            gs.msg = 'Tap a square on the enemy sea to aim, then tap it again or press Fire.';
        },
        view: _svView,
        keys: { KeyF: () => svFire() },
        rules: (gs) => [
            `Both sides have hidden a fleet: ${gs.sizes.map((L) => `${_SV_NAMES[L]} (${L} squares)`).join(', ')}. Ships lie straight, across or down, and never touch each other.`,
            'Tap a square on the <b>enemy sea</b> to aim (a crosshair appears), then tap it again or press <b>Fire</b>.',
            'A red cross is a <b>hit</b>, a white dot is a <b>miss</b>. When every square of a ship is hit, it sinks and is named.',
            'Then the computer fires at <b>your fleet</b>, shown below. Take turns until one fleet is gone.',
            'Tip: after a hit, try the squares next to it. Ships never touch, so the squares around a sunk ship are empty.',
            'No clock. Keyboard: arrow keys aim, Enter aims and fires, F fires.'],
        css: `.sv-sea{display:grid;grid-template-columns:repeat(8,1fr);gap:2px;background:#0c4a6e;padding:5px;border-radius:12px;max-width:min(100%,26rem);margin:0 auto}
.sv-c{aspect-ratio:1;background:#7dd3fc;border:0;--nk-r:4px;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;min-width:0;color:#0c4a6e}
.sv-c:disabled{cursor:default}
.sv-c.sv-m{background:#bae6fd}.sv-c.sv-m::before{content:"";width:28%;height:28%;border-radius:50%;background:#fff;box-shadow:0 0 0 2px #0c4a6e}
.sv-c.sv-h{background:#fecaca;color:#b91c1c}
.sv-c.sv-sunk{background:#475569;color:#fecaca}
.sv-c.sv-aim{box-shadow:inset 0 0 0 4px #f59e0b;background:#fde68a}
.sv-c.sv-ship{background:#94a3b8}
.sv-c.sv-last{box-shadow:inset 0 0 0 3px #f59e0b}
.sv-mine{max-width:min(80%,18rem)}.sv-mine .sv-c{cursor:default}
.sv-lab{text-align:center;font-weight:800;margin:10px 0 4px;color:#4a3420}
.sv-fleet{display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center;font-size:1rem;margin:6px 0}
.sv-fleet span{display:inline-flex;align-items:center;gap:4px}.sv-fleet i{display:inline-block;width:12px;height:12px;background:#0c4a6e;border-radius:2px}
.sv-fleet .sv-gone{text-decoration:line-through;color:#6b5640}.sv-fleet .sv-gone i{background:#b91c1c}`,
    });
}
const _svX = () => Icon.svg('x', { size: '70%', sw: 3.4 });
function _svView(gs) {
    const my = gs.turn === 1 && !gs.over;
    const sunk = (side, k) => side.ships[k].hits === side.ships[k].L;
    const enemy = gs.myShots.map((v, i) => {
        const k = gs.cpu.g[i], isSunk = v === 2 && sunk(gs.cpu, k);
        const cls = 'nk-cell sv-c' + (v === 1 ? ' sv-m' : v === 2 ? (isSunk ? ' sv-sunk' : ' sv-h') : '') + (gs.aim === i ? ' sv-aim' : '') + (gs.over && v === 0 && k >= 0 ? ' sv-ship' : '');
        const lab = `${String.fromCharCode(65 + Math.floor(i / 8))}${i % 8 + 1}, ${v === 1 ? 'miss' : v === 2 ? (isSunk ? 'sunk' : 'hit') : gs.aim === i ? 'aimed' : 'not tried'}`;
        return `<button type="button" class="${cls}" onclick="svTap(${i})" data-k="e${i}"${i === 27 ? ' data-first' : ''} aria-label="${lab}"${my && !v ? '' : ' disabled'}>${v === 2 ? _svX() : gs.aim === i ? Icon.svg('crosshair', { size: '70%', sw: 2.6 }) : ''}</button>`;
    }).join('');
    const mine = gs.cpuShots.map((v, i) => {
        const k = gs.me.g[i];
        const cls = 'nk-cell sv-c' + (v === 1 ? ' sv-m' : v === 2 ? (sunk(gs.me, k) ? ' sv-sunk' : ' sv-h') : k >= 0 ? ' sv-ship' : '') + (i === gs.lastCpu ? ' sv-last' : '');
        return `<span class="${cls}">${v === 2 ? _svX() : ''}</span>`;
    }).join('');
    const fleet = (side) => side.ships.map((s) => `<span class="${s.hits === s.L ? 'sv-gone' : ''}">${'<i></i>'.repeat(s.L)} ${_SV_NAMES[s.L]}</span>`).join('');
    const left = (side) => side.ships.filter((s) => s.hits < s.L).length;
    return `<div class="nk-top"><span>Enemy ships left: <b>${left(gs.cpu)}</b></span><span>Your ships left: <b>${left(gs.me)}</b></span><span>Shots: <b>${gs.shots}</b></span></div>
      <div class="sv-lab">Enemy sea (tap to aim)</div>
      <div class="sv-sea">${enemy}</div>
      <div class="sv-fleet" aria-label="enemy fleet">${fleet(gs.cpu)}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('target') + 'Fire', 'svFire()', { cls: 'gk-primary', k: 'fire', disabled: !my || gs.aim < 0 })}${!gs.shots && !gs.over ? NK.btn(NK.icon('shuffle') + 'Shuffle my ships', 'svShuffle()', { k: 'shuffle' }) : ''}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'svRestart()', { k: 'restart' })}</div>
      <div class="sv-lab">Your fleet (the computer fires here)</div>
      <div class="sv-sea sv-mine" aria-label="your fleet">${mine}</div>
      <div class="sv-fleet" aria-label="your ships">${fleet(gs.me)}</div>`;
}
function svRestart() { initSalvo(); }
function svShuffle() { const gs = gameState.salvo; if (gs.shots) return; gs.me = _svPlace(gs.sizes); gs.msg = 'Your fleet has been moved. Aim when you are ready.'; NK.render('salvo'); }
function svTap(i) {
    const gs = gameState.salvo; if (gs.over || gs.turn !== 1) return;
    if (gs.myShots[i]) { gs.msg = 'You have already fired there.'; return NK.render('salvo'); }
    if (gs.aim === i) return svFire();
    gs.aim = i; gs.msg = `Aimed at ${String.fromCharCode(65 + Math.floor(i / 8))}${i % 8 + 1}. Tap it again or press Fire.`;
    NK.render('salvo');
}
function svFire() {
    const gs = gameState.salvo; if (gs.over || gs.turn !== 1 || gs.aim < 0) return;
    const i = gs.aim; gs.aim = -1; gs.shots++;
    const k = gs.cpu.g[i];
    if (k < 0) { gs.myShots[i] = 1; gs.msg = 'Miss.'; if (typeof sfxFlip === 'function') sfxFlip(); }
    else {
        gs.myShots[i] = 2; const s = gs.cpu.ships[k]; s.hits++;
        if (typeof sfxCorrect === 'function') sfxCorrect();
        gs.msg = s.hits === s.L ? `Hit - you sank the enemy ${_SV_NAMES[s.L]}!` : 'Hit!';
        if (gs.cpu.ships.every((x) => x.hits === x.L)) return _svEnd(true);
    }
    gs.turn = 2; gs.msg += ' The computer is aiming...'; NK.render('salvo');
    NK.after(900, _svCpu);
}
function _svCpuPick(gs) {
    const n = _SV_N, S = gs.cpuShots, free = (i) => i >= 0 && i < 64 && !S[i];
    const nb = (i) => { const r = Math.floor(i / n), c = i % n, o = []; if (r) o.push(i - n); if (r < n - 1) o.push(i + n); if (c) o.push(i - 1); if (c < n - 1) o.push(i + 1); return o; };
    // open hits = hits on ships not yet sunk
    const open = S.map((v, i) => (v === 2 && gs.me.ships[gs.me.g[i]].hits < gs.me.ships[gs.me.g[i]].L ? i : -1)).filter((i) => i >= 0);
    const follow = gs.diff !== 'easy' || Math.random() < .5;
    if (open.length && follow) {
        if (gs.diff === 'hard' && open.length >= 2) {
            const hz = Math.floor(open[0] / n) === Math.floor(open[1] / n), sorted = open.slice().sort((a, b) => a - b);
            const ends = hz ? [sorted[0] - 1, sorted[sorted.length - 1] + 1].filter((x) => x >= 0 && Math.floor(x / n) === Math.floor(sorted[0] / n)) : [sorted[0] - n, sorted[sorted.length - 1] + n];
            const e = ends.filter(free); if (e.length) return e[Math.floor(Math.random() * e.length)];
        }
        const c = [...new Set(open.flatMap(nb))].filter(free); if (c.length) return c[Math.floor(Math.random() * c.length)];
    }
    // never next to a sunk ship (they cannot touch)
    const nearSunk = new Set(); gs.me.ships.forEach((s) => { if (s.hits === s.L) s.cells.forEach((x) => { const r = Math.floor(x / n), cc = x % n; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const y = r + a, z = cc + b; if (y >= 0 && y < n && z >= 0 && z < n) nearSunk.add(y * n + z); } }); });
    let pool = [...Array(64).keys()].filter((i) => free(i) && (gs.diff === 'easy' || !nearSunk.has(i)));
    if (gs.diff !== 'easy') { const par = pool.filter((i) => (Math.floor(i / n) + i % n) % 2 === 0); if (par.length) pool = par; }
    if (!pool.length) pool = [...Array(64).keys()].filter(free);
    return pool[Math.floor(Math.random() * pool.length)];
}
function _svCpu() {
    const gs = gameState.salvo; if (gs.over) return;
    const i = _svCpuPick(gs), k = gs.me.g[i]; gs.lastCpu = i;
    const where = `${String.fromCharCode(65 + Math.floor(i / 8))}${i % 8 + 1}`;
    if (k < 0) { gs.cpuShots[i] = 1; gs.msg = `The computer fired at ${where} and missed. Your turn.`; }
    else {
        gs.cpuShots[i] = 2; const s = gs.me.ships[k]; s.hits++;
        gs.msg = s.hits === s.L ? `The computer fired at ${where} and sank your ${_SV_NAMES[s.L]}. Your turn.` : `The computer hit your ship at ${where}. Your turn.`;
        if (gs.me.ships.every((x) => x.hits === x.L)) return _svEnd(false);
    }
    if (typeof sfxFlip === 'function') sfxFlip();
    gs.turn = 1; NK.render('salvo');
}
function _svEnd(win) {
    const gs = gameState.salvo; gs.over = true; gs.aim = -1;
    gs.msg = win ? `You sank the whole enemy fleet in ${NK.pl(gs.shots, 'shot')}!` : 'The computer sank your whole fleet. Its ships are shown in gray.';
    NK.render('salvo');
    NK.finish('salvo', win, win ? `Enemy fleet sunk in ${NK.pl(gs.shots, 'shot')}!` : 'Your fleet went down this time. A new sea is one tap away.');
}
