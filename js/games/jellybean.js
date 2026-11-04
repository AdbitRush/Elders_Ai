// ═══════════════════════════════════════════════════════════════════════════════
// JELLY BEAN JAR (2026-11, nostalgia batch 2) — the "guess how many beans are in the jar" table at county fairs,
// school fairs and bank openings. Solo, no clock: count, estimate, or a bit of both.
// Five jars per game. Every bean is drawn flat in the picture (none hidden behind others), so a patient counter can
// get it exactly; an estimator can count one row and multiply. Type a guess with the number pad (or the keyboard).
// Ribbons: within 5% = blue (3 points), within 12% = red (2), within 20% = white (1). 7 points or more wins.
// Easy jars hold 20-60 beans, normal 40-110, hard 80-180.
// Beans are laid on a jittered grid of slots inside the jar outline, and N slots are filled at random.
// ═══════════════════════════════════════════════════════════════════════════════
const _JB_COLS = ['#dc2626', '#f59e0b', '#16a34a', '#7c3aed', '#ec4899', '#0ea5e9', '#f97316', '#facc15', '#111827', '#ffffff'];
// the jar outline (viewBox 240 x 310); beans are kept inside it with a real point-in-path test
const _JB_PATH = 'M74 44 h92 v26 q32 14 40 40 v150 q0 36 -40 36 h-92 q-40 0 -40 -36 v-150 q8 -26 40 -40 z';
let _jbCtx = null;
function _jbInside(x, y, rx, ry) {
    if (!_jbCtx) { _jbCtx = document.createElement('canvas').getContext('2d'); _jbInside.p = new Path2D(_JB_PATH); }
    const m = 4;   // keep clear of the glass
    return [[0, 0], [rx + m, 0], [-rx - m, 0], [0, ry + m], [0, -ry - m]].every(([a, b]) => _jbCtx.isPointInPath(_jbInside.p, x + a, y + b)) && y > 58;
}
function _jbFill(n) {
    // pick a bean size that leaves enough slots, then fill n slots at random
    for (let s = 20; s >= 8; s -= 1) {
        const slots = [];
        let row = 0; for (let y = 62; y < 300; y += s * 0.72, row++) for (let x = 26 + (row % 2 ? s / 2 : 0); x < 216; x += s) if (_jbInside(x, y, s * 0.5, s * 0.36)) slots.push([x, y]);
        if (slots.length >= n * 1.15) {
            return { s, beans: shuffle(slots).slice(0, n).map(([x, y]) => ({ x: x + (Math.random() - .5) * s * .15, y: y + (Math.random() - .5) * s * .12, r: Math.random() * 60 - 30, c: _JB_COLS[Math.floor(Math.random() * _JB_COLS.length)] })) };
        }
    }
    return { s: 8, beans: [] };
}
function initJellyBean() {
    NK.start('jellybean', {
        setup(gs, diff) {
            const [lo, hi] = diff === 'easy' ? [20, 60] : diff === 'hard' ? [80, 180] : [40, 110];
            gs.jars = Array.from({ length: 5 }, () => lo + Math.floor(Math.random() * (hi - lo + 1)));
            gs.i = 0; gs.entry = ''; gs.res = []; gs.over = false; gs.reveal = false;
            gs.fill = _jbFill(gs.jars[0]);
            gs.msg = 'How many jelly beans are in jar 1? Type your guess and press Guess.';
        },
        view: _jbView,
        enter() { if (gameState.jellybean.reveal) jbNext(); else jbGuess(); },
        keys: Object.assign({ Backspace: () => jbKey('del'), NumpadEnter: () => (gameState.jellybean.reveal ? jbNext() : jbGuess()), Digit0: () => jbKey('0'), Numpad0: () => jbKey('0') }, NK.digits((n) => jbKey(String(n)), 9)),
        rules: [
            'There are <b>five jars</b>. For each, guess how many jelly beans it holds.',
            'Every bean is drawn in plain sight - none hide behind others - so you may count them all, or count one row and multiply. There is no clock.',
            'Type your guess on the number pad, then press <b>Guess</b>.',
            'Within 5% of the true count wins a <b>blue ribbon</b> (3 points), within 12% a <b>red</b> (2), within 20% a <b>white</b> (1).',
            'Score <b>7 points or more</b> over the five jars to win the prize.',
            'Keyboard: number keys type, Backspace deletes, Enter guesses and moves on.'],
        css: `.jb-row{display:flex;gap:16px;align-items:flex-start;justify-content:center;flex-wrap:wrap}
.jb-jar{width:min(100%,19rem);flex:0 1 19rem}
.jb-jar svg{width:100%;height:auto;display:block}
.jb-side{flex:0 1 17rem;min-width:15rem}
.jb-entry{font:900 2.2rem/1 Georgia,serif;text-align:center;background:#fffdf5;border:3px solid #c9a46a;border-radius:14px;padding:10px;min-height:1.2em;letter-spacing:.06em}
.jb-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}
.jb-pad .gk-btn{font-size:1.4rem;min-height:56px;padding:0}
.jb-rib{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:6px 0}
.jb-r{display:inline-flex;align-items:center;gap:4px;font-weight:800;font-size:.95rem;border-radius:999px;padding:4px 10px;border:2px solid #cbb994;background:#fff}
.jb-r.b{background:#dbeafe;border-color:#1d4ed8;color:#1e3a8a}.jb-r.r{background:#fee2e2;border-color:#b91c1c;color:#7f1d1d}.jb-r.w{background:#f8fafc;border-color:#64748b;color:#334155}.jb-r.n{color:#6b5640}
@media (max-width:560px){.jb-side{min-width:0;width:100%}}`,
    });
}
const _jbRibbon = (g, n) => { const e = Math.abs(g - n) / n; return e <= 0.05 ? ['b', 'Blue ribbon', 3] : e <= 0.12 ? ['r', 'Red ribbon', 2] : e <= 0.2 ? ['w', 'White ribbon', 1] : ['n', 'No ribbon', 0]; };
function jbKey(k) {
    const gs = gameState.jellybean; if (gs.over || gs.reveal) return;
    if (k === 'del') gs.entry = gs.entry.slice(0, -1);
    else if (k === 'clear') gs.entry = '';
    else if (gs.entry.length < 4) gs.entry = (gs.entry + k).replace(/^0+(?=\d)/, '');
    NK.render('jellybean');
}
function jbGuess() {
    const gs = gameState.jellybean; if (gs.over || gs.reveal) return;
    const g = parseInt(gs.entry, 10);
    if (!g) { gs.msg = 'Type a number first.'; return NK.render('jellybean'); }
    const n = gs.jars[gs.i], [cls, name, pts] = _jbRibbon(g, n);
    gs.res.push({ g, n, cls, name, pts }); gs.reveal = true;
    const off = g - n;
    gs.msg = `Jar ${gs.i + 1} holds <b>${n}</b> beans. You said ${g} (${off === 0 ? 'exactly right!' : Math.abs(off) + (off > 0 ? ' too many' : ' too few')}). ${name}${pts ? ` - ${pts} point${pts === 1 ? '' : 's'}` : ''}.`;
    if (pts && typeof sfxCorrect === 'function') sfxCorrect();
    NK.render('jellybean');
}
function jbNext() {
    const gs = gameState.jellybean; if (gs.over || !gs.reveal) return;
    if (gs.i >= 4) {
        gs.over = true; const tot = gs.res.reduce((a, r) => a + r.pts, 0);
        gs.msg = `All five jars judged: ${tot} points (7 wins the prize).`; NK.render('jellybean');
        return NK.finish('jellybean', tot >= 7, tot >= 7 ? `${tot} points and the prize jar is yours!` : `${tot} points this time; 7 wins the prize. Counting one row and multiplying is a good trick.`);
    }
    gs.i++; gs.entry = ''; gs.reveal = false; gs.fill = _jbFill(gs.jars[gs.i]);
    gs.msg = `How many jelly beans are in jar ${gs.i + 1}?`;
    NK.render('jellybean');
}
function jbRestart() { initJellyBean(); }
function _jbView(gs) {
    const { s, beans } = gs.fill;
    const bean = (b) => `<ellipse cx="${b.x.toFixed(1)}" cy="${b.y.toFixed(1)}" rx="${(s * 0.46).toFixed(1)}" ry="${(s * 0.32).toFixed(1)}" fill="${b.c}" stroke="#1f2937" stroke-width="1" transform="rotate(${b.r.toFixed(0)} ${b.x.toFixed(1)} ${b.y.toFixed(1)})"/>`;
    const jar = `<svg viewBox="0 0 240 310" role="img" aria-label="a jar of jelly beans${gs.reveal ? ', ' + gs.jars[gs.i] + ' beans' : ''}">
      <path d="${_JB_PATH}" fill="#f0f9ff" stroke="#64748b" stroke-width="4"/>
      ${beans.map(bean).join('')}
      <rect x="66" y="26" width="108" height="22" rx="6" fill="#b91c1c" stroke="#7f1d1d" stroke-width="3"/>
      <path d="M50 120 q-6 70 4 140" stroke="#fff" stroke-width="6" fill="none" opacity=".55" stroke-linecap="round"/></svg>`;
    const pad = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'clear', '0', 'del'].map((k) => NK.btn(k === 'del' ? Icon.svg('delete', { size: '26px', sw: 2.4 }) : k === 'clear' ? 'Clear' : k, `jbKey('${k}')`, { k: 'k' + k, label: k === 'del' ? 'delete' : k === 'clear' ? 'clear' : k, disabled: gs.reveal || gs.over })).join('');
    const ribs = gs.res.map((r, i) => `<span class="jb-r ${r.cls}">Jar ${i + 1}: ${r.name.replace(' ribbon', '')}</span>`).join('');
    const tot = gs.res.reduce((a, r) => a + r.pts, 0);
    return `<div class="nk-top"><span>Jar <b>${gs.i + 1}</b> of 5</span><span>Points: <b>${tot}</b> (7 wins)</span></div>
      <div class="jb-row"><div class="jb-jar">${jar}</div>
      <div class="jb-side"><div class="jb-entry" aria-live="polite" aria-label="your guess">${gs.reveal ? gs.res[gs.res.length - 1].g : gs.entry || '&nbsp;'}</div>
      ${gs.reveal ? '' : `<div class="jb-pad">${pad}</div>`}
      <div class="gk-btns">${gs.reveal ? NK.btn(gs.i >= 4 ? 'See the judging' : 'Next jar', 'jbNext()', { cls: 'gk-primary', k: 'next', disabled: gs.over }) : NK.btn('Guess', 'jbGuess()', { cls: 'gk-primary', k: 'guess', disabled: !gs.entry })}</div></div></div>
      ${NK.msg(gs.msg)}
      <div class="jb-rib">${ribs}</div>
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New game', 'jbRestart()', { k: 'restart' })}</div>`;
}
