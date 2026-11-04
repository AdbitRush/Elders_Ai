// ═══════════════════════════════════════════════════════════════════════════════
// MATCHSTICK FIX (2026-11, nostalgia batch 3) — the newspaper and pub puzzle: a sum made of matchsticks is wrong.
// Move exactly ONE match to make it right. Digits are drawn like a calculator (seven sticks each); the plus sign has
// a standing stick that can be taken away (making it a minus) or a minus can gain one.
// Each puzzle is generated from a true sum by moving one match the other way, and every true sum reachable with
// one move is accepted. Tap a lit match to pick it up, tap an empty spot to put it down. Three puzzles per game.
// Easy: one-digit sums, the moved match stays inside the numbers. Normal: also the plus/minus. Hard: two-digit answers.
// ═══════════════════════════════════════════════════════════════════════════════
const _MF_SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
const _MF_DIG = Object.fromEntries(Object.entries(_MF_SEG).map(([d, s]) => [s.split('').sort().join(''), +d]));
// a puzzle state: list of symbols; each digit is a set of segments, the operator is {v: true/false} (vertical stick)
function _mfEval(st) {
    const digs = st.map((x) => (x.t === 'd' ? _MF_DIG[[...x.s].sort().join('')] : null));
    if (st.some((x, i) => x.t === 'd' && digs[i] === undefined)) return null;
    // layout: A op B = C (C may be 1 or 2 digits)
    const opI = st.findIndex((x) => x.t === 'o'), eqI = st.findIndex((x) => x.t === 'e');
    const num = (a, b) => digs.slice(a, b).reduce((s, d) => s * 10 + d, 0);
    const A = num(0, opI), B = num(opI + 1, eqI), C = num(eqI + 1, st.length);
    return { A, B, C, plus: st[opI].v, ok: (st[opI].v ? A + B : A - B) === C };
}
const _mfClone = (st) => st.map((x) => ({ ...x, s: x.s ? new Set(x.s) : undefined }));
function _mfMoves(st, opOK) {
    // every way to move one stick: from (symbol i, segment) to (symbol j, segment)
    const lit = [], dark = [];
    st.forEach((x, i) => {
        if (x.t === 'd') 'abcdefg'.split('').forEach((g) => (x.s.has(g) ? lit : dark).push([i, g]));
        if (x.t === 'o' && opOK) (x.v ? lit : dark).push([i, 'v']);
    });
    const out = [];
    for (const [i, g] of lit) for (const [j, h] of dark) {
        const n = _mfClone(st);
        if (g === 'v') n[i].v = false; else n[i].s.delete(g);
        if (h === 'v') n[j].v = true; else n[j].s.add(h);
        out.push({ st: n, from: [i, g], to: [j, h] });
    }
    return out;
}
function _mfMake(diff) {
    for (let t = 0; t < 400; t++) {
        let A, B, C, plus = diff === 'easy' ? true : Math.random() < 0.5;
        if (diff === 'hard') { A = Math.floor(Math.random() * 10); B = Math.floor(Math.random() * 10); if (plus) C = A + B; else { if (A < B) [A, B] = [B, A]; C = A - B; } if (C < 10 && plus) continue; }
        else { A = Math.floor(Math.random() * 10); B = Math.floor(Math.random() * 10); if (plus) { C = A + B; if (C > 9) continue; } else { if (A < B) [A, B] = [B, A]; C = A - B; } }
        const sym = (d) => ({ t: 'd', s: new Set(_MF_SEG[d]) });
        const st = [sym(A), { t: 'o', v: plus }, sym(B), { t: 'e' }, ...String(C).split('').map((d) => sym(+d))];
        const wrong = _mfMoves(st, diff !== 'easy').filter((m) => { const e = _mfEval(m.st); return e && !e.ok; });
        if (!wrong.length) continue;
        const pick = wrong[Math.floor(Math.random() * wrong.length)];
        return { start: pick.st, answer: st };
    }
    return null;
}
function initMatchFix() {
    NK.start('matchfix', {
        setup(gs, diff) {
            gs.diff = diff; gs.k = 0; gs.over = false; gs.solvedN = 0; gs.hints = 0;
            gs.list = []; while (gs.list.length < 3) { const p = _mfMake(diff); if (p) gs.list.push(p); }
            _mfLoad(gs);
        },
        view: _mfView,
        rules: (gs) => [
            'The sum is made of matchsticks and it is <b>wrong</b>. Move <b>exactly one</b> match to make it true.',
            'Digits are drawn the way a calculator shows them, seven sticks each.',
            gs.diff === 'easy' ? 'On easy the plus sign stays as it is; the match to move is somewhere in the numbers.' : 'The plus sign\'s standing stick may be moved too (making a minus), or a minus may gain one (making a plus).',
            'Tap a lit match to pick it up (it turns blue), then tap an empty spot (a faint outline) to put it there. Tap the blue match again to put it back.',
            'Any true sum made by moving one match counts. Three puzzles make a game. No clock.'],
        css: `.mf-eq{display:flex;align-items:center;justify-content:center;gap:clamp(4px,2vw,14px);flex-wrap:wrap;background:#3d2a17;border-radius:16px;padding:16px 8px;margin-bottom:6px}
.mf-d{--dw:clamp(44px,13vw,74px);display:block;position:relative;width:var(--dw);height:calc(var(--dw) * 1.75);flex:0 0 auto}
#gameContent .nk button.mf-s{position:absolute}
.mf-s{position:absolute;border:0;padding:0;cursor:pointer;background:transparent;--nk-r:6px}
.mf-s i{position:absolute;inset:0;border-radius:5px;background:rgba(255,247,230,.12);border:2px dashed rgba(255,247,230,.28)}
.mf-s.mf-on i{background:linear-gradient(90deg,#f5d08a,#e4a853);border:2px solid #7c2d12}
.mf-s.mf-on.mf-h i{background:linear-gradient(90deg,#f5d08a,#e4a853)}
.mf-s.mf-on::after{content:"";position:absolute;width:12px;height:12px;border-radius:50%;background:#dc2626;border:2px solid #7f1d1d}
.mf-s.mf-v.mf-on::after{left:50%;top:-4px;margin-left:-6px}.mf-s.mf-hz.mf-on::after{left:-4px;top:50%;margin-top:-6px}
.mf-s.mf-sel i{background:linear-gradient(90deg,#93c5fd,#3b82f6)!important;border-color:#1e3a8a!important}
.mf-s.mf-drop i{border-color:#fde68a;background:rgba(253,230,138,.25)}
.mf-op{--ow:clamp(32px,9vw,50px);display:block;position:relative;width:var(--ow);height:var(--ow);flex:0 0 auto}
.mf-bar{position:absolute;left:0;top:42%;width:100%;height:16%;border-radius:5px;background:linear-gradient(90deg,#f5d08a,#e4a853);border:2px solid #7c2d12;box-sizing:border-box}
.mf-eqs{color:#f5d08a;font:900 clamp(2rem,9vw,3.4rem) system-ui;padding:0 4px}`,
    });
}
function _mfLoad(gs) { const P = gs.list[gs.k]; gs.st = _mfClone(P.start); gs.held = null; gs.msg = `Puzzle ${gs.k + 1} of 3: move one match to make the sum true.`; }
// segment boxes in % of a digit box (w 100, h 175 scaled to %)
const _MF_BOX = { a: [14, 2, 72, 9, 'hz'], b: [80, 7, 12, 40, 'v'], c: [80, 53, 12, 40, 'v'], d: [14, 89, 72, 9, 'hz'], e: [8, 53, 12, 40, 'v'], f: [8, 7, 12, 40, 'v'], g: [14, 45.5, 72, 9, 'hz'] };
function mfTap(i, g) {
    const gs = gameState.matchfix; if (gs.over || gs.solved) return;
    const x = gs.st[i], on = g === 'v' ? x.v : x.s.has(g);
    if (!gs.held) {
        if (!on) { gs.msg = 'Pick up a lit match first.'; return NK.render('matchfix'); }
        if (x.t === 'o' && gs.diff === 'easy') { gs.msg = 'On easy the plus sign stays put. Look in the numbers.'; return NK.render('matchfix'); }
        gs.held = [i, g]; gs.msg = 'Now tap an empty spot to put the match there.'; return NK.render('matchfix');
    }
    if (gs.held[0] === i && gs.held[1] === g) { gs.held = null; gs.msg = 'Match put back.'; return NK.render('matchfix'); }
    if (on) { gs.held = [i, g]; gs.msg = 'Picked up this match instead.'; return NK.render('matchfix'); }
    if (x.t === 'o' && gs.diff === 'easy') { gs.msg = 'On easy the plus sign stays put.'; return NK.render('matchfix'); }
    const n = _mfClone(gs.st), [hi, hg] = gs.held;
    if (hg === 'v') n[hi].v = false; else n[hi].s.delete(hg);
    if (g === 'v') n[i].v = true; else n[i].s.add(g);
    const e = _mfEval(n);
    if (!e) { gs.msg = 'That would not make a proper digit everywhere. Try another spot.'; return NK.render('matchfix'); }
    gs.st = n; gs.held = null; if (typeof sfxFlip === 'function') sfxFlip();
    if (e.ok) {
        gs.solvedN++; if (typeof sfxCorrect === 'function') sfxCorrect();
        if (gs.k >= 2) { gs.over = true; gs.msg = `${e.A} ${e.plus ? '+' : '-'} ${e.B} = ${e.C}. All three fixed!`; NK.render('matchfix'); return NK.finish('matchfix', true, `Three sums fixed by moving one match each${gs.hints ? ` (${NK.pl(gs.hints, 'hint')})` : ''}.`); }
        gs.solved = true; gs.msg = `${e.A} ${e.plus ? '+' : '-'} ${e.B} = ${e.C}. True! Press Next puzzle.`; return NK.render('matchfix');
    }
    // not true: undo the move so only one match is ever moved
    gs.st = _mfClone(gs.list[gs.k].start);
    gs.msg = `That makes ${e.A} ${e.plus ? '+' : '-'} ${e.B} = ${e.C}, which is not true. The match went back. Try another.`;
    NK.render('matchfix');
}
function mfHint() {
    const gs = gameState.matchfix; if (gs.over || gs.solved) return;
    const m = _mfMoves(gs.list[gs.k].start, gs.diff !== 'easy').find((m) => { const e = _mfEval(m.st); return e && e.ok; });
    if (!m) return; gs.hints++; gs.st = _mfClone(gs.list[gs.k].start); gs.held = m.from;
    gs.msg = 'Hint: the blue match is one that can move. Where should it go?'; NK.render('matchfix');
}
function mfNext() { const gs = gameState.matchfix; if (!gs.solved || gs.over) return; gs.solved = false; gs.k++; _mfLoad(gs); NK.render('matchfix'); }
function mfNew() { initMatchFix(); }
function _mfView(gs) {
    const can = !gs.over && !gs.solved;
    const seg = (i, g, on, box) => { const [x, y, w, h, o] = box; const sel = gs.held && gs.held[0] === i && gs.held[1] === g; return `<button type="button" class="nk-cell mf-s mf-${o}${on ? ' mf-on' : ''}${sel ? ' mf-sel' : ''}${gs.held && !on ? ' mf-drop' : ''}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%" onclick="mfTap(${i},'${g}')" data-k="m${i}${g}"${i === 0 && g === 'a' ? ' data-first' : ''} aria-label="${on ? 'match' : 'empty spot'}${sel ? ', picked up' : ''}"${can ? '' : ' disabled'}><i></i></button>`; };
    const sym = gs.st.map((x, i) => {
        if (x.t === 'e') return '<span class="mf-eqs" aria-label="equals">=</span>';
        if (x.t === 'o') return `<span class="mf-op" aria-label="${x.v ? 'plus' : 'minus'}"><span class="mf-bar"></span>${seg(i, 'v', x.v, [42, 0, 16, 100, 'v'])}</span>`;
        return `<span class="mf-d" aria-label="digit">${'abcdefg'.split('').map((g) => seg(i, g, x.s.has(g), _MF_BOX[g])).join('')}</span>`;
    }).join('');
    return `<div class="nk-top"><span>Puzzle <b>${gs.k + 1}</b> of 3</span><span>Hints: <b>${gs.hints}</b></span></div>
      <div class="mf-eq">${sym}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${gs.solved ? NK.btn('Next puzzle', 'mfNext()', { cls: 'gk-primary', k: 'next' }) : ''}${NK.btn(NK.icon('lightbulb') + 'Hint', 'mfHint()', { k: 'hint', disabled: !can })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'mfNew()', { k: 'restart' })}</div>`;
}
