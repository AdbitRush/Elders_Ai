// ═══════════════════════════════════════════════════════════════════════════════
// TELEGRAPH OFFICE (2026-11, nostalgia batch 3) — decode telegrams sent in Morse code, the dots and dashes of the
// old wire and the scouting handbook. Each telegram arrives as Morse letters (shown, and played as beeps if you
// like); type or tap the plain letters. Five telegrams a shift. Easy: short words and the full code chart is shown.
// Normal: two-word telegrams, the chart shows only the letters in today's telegrams plus a few others. Hard: longer
// telegrams and the chart stays closed unless you open it (each look is counted). No clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _TG_CODE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..' };
const _TG_MSG = {
    easy: ['SOS', 'HELLO', 'HOME', 'STOP', 'LOVE', 'CAKE', 'RAIN', 'MAIL', 'SONG', 'BOAT', 'FARM', 'TRAIN', 'SNOW', 'BABY', 'GOLD'],
    normal: ['ALL WELL', 'HOME SOON', 'BABY BOY', 'COME HOME', 'GOOD NEWS', 'MISS YOU', 'ARRIVE MONDAY', 'SEND HELP', 'WE WON', 'SNOW DEEP', 'HAPPY BIRTHDAY', 'TRAIN LATE'],
    hard: ['ARRIVED SAFE STOP', 'MEET AT NOON', 'WEDDING IN JUNE', 'CROPS ARE IN', 'WIRE MONEY SOON', 'ALL ABOARD AT TEN', 'BRING THE QUILT', 'BACK BY FRIDAY', 'THE COW HAD TWINS', 'ROOF FIXED STOP'],
};
function initTelegraph() {
    NK.start('telegraph', {
        setup(gs, diff) {
            gs.diff = diff; gs.list = shuffle(_TG_MSG[diff].slice()).slice(0, 5); gs.k = 0; gs.over = false; gs.peeks = 0; gs.misses = 0; gs.chart = diff === 'easy';
            const used = new Set(gs.list.join('').replace(/ /g, '')); gs.chartSet = diff === 'easy' ? Object.keys(_TG_CODE) : shuffle(Object.keys(_TG_CODE).filter((L) => !used.has(L))).slice(0, 5).concat([...used]).sort();
            _tgLoad(gs);
        },
        view: _tgView,
        keys: Object.assign({ Backspace: () => tgType('') }, Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((L) => ['Key' + L, () => tgType(L)]))),
        rules: (gs) => [
            'A telegram arrives in <b>Morse code</b>: each letter is a short pattern of dots (short beeps) and dashes (long beeps). Letters are separated by gaps; a slash / marks a space between words.',
            'Type the plain letters, or tap them on the letter board. A wrong letter is shown in red and does not count; try another.',
            gs.diff === 'easy' ? 'The code chart is open for you.' : gs.diff === 'normal' ? 'The chart shows the letters in this shift\'s telegrams, plus a few others.' : 'The chart is closed: open it whenever you need it (each look is counted).',
            'Tap <b>Play beeps</b> to hear the telegram tapped out. A handy start: E is a single dot, T is a single dash, and S O S is ... --- ...',
            'Five telegrams a shift. No clock. Keyboard: letter keys type, Backspace undoes the last letter.'],
        css: `.tg-paper{background:#fef9e7;border:2px solid #d6c7a1;border-radius:10px;padding:14px 10px;box-shadow:0 3px 0 #d6c7a1;font-family:ui-monospace,Menlo,monospace}
.tg-head{display:flex;justify-content:space-between;font:800 .95rem system-ui,sans-serif;color:#78350f;border-bottom:2px dashed #d6c7a1;padding-bottom:6px;margin-bottom:10px}
.tg-words{display:flex;flex-wrap:wrap;gap:12px 22px;justify-content:center}
.tg-word{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:100%}
.tg-l{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:2.2rem}
.tg-code{font:900 clamp(1rem,4.6vw,1.6rem) ui-monospace,monospace;letter-spacing:.08em;color:#1c1917;white-space:nowrap}
.tg-box{width:2.4rem;height:2.6rem;border-bottom:3px solid #78350f;font:900 1.6rem Georgia,serif;display:flex;align-items:flex-end;justify-content:center;color:#1d4ed8}
.tg-box.tg-cur{background:#fde68a;border-radius:6px 6px 0 0}
.tg-box.tg-bad{color:#b91c1c}
.tg-kb{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;max-width:30rem;margin:12px auto 0}
#gameContent .nk .tg-kb .gk-btn{min-width:0;padding:0;font:900 1.2rem Georgia,serif;min-height:48px}
.tg-chart{display:grid;grid-template-columns:repeat(auto-fill,minmax(5.2rem,1fr));gap:4px 10px;max-width:34rem;margin:10px auto 0;font-size:1.05rem}
.tg-chart span{background:#fff7e6;border:1px solid #e7d7b5;border-radius:6px;padding:3px 6px;display:flex;justify-content:space-between}
.tg-chart b{font-family:Georgia,serif}.tg-chart code{font-weight:900;letter-spacing:.08em}`,
    });
}
function _tgLoad(gs) { gs.msgText = gs.list[gs.k]; gs.pos = 0; gs.got = ''; gs.bad = ''; gs.done = false; gs.msg = `Telegram ${gs.k + 1} of 5 has arrived. Decode it letter by letter.`; }
const _tgLetters = (gs) => gs.msgText.replace(/ /g, '');
function tgType(L) {
    const gs = gameState.telegraph; if (gs.over || gs.done) return;
    const want = _tgLetters(gs);
    if (!L) { if (gs.bad) gs.bad = ''; else if (gs.pos) { gs.pos--; gs.got = gs.got.slice(0, -1); } gs.msg = ''; return NK.render('telegraph'); }
    if (L === want[gs.pos]) { gs.got += L; gs.pos++; gs.bad = ''; if (typeof sfxFlip === 'function') sfxFlip(); }
    else { gs.bad = L; gs.misses++; gs.msg = `${L} is ${_TG_CODE[L]}, but this letter is ${_TG_CODE[want[gs.pos]]}. Try again.`; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('telegraph'); }
    if (gs.pos === want.length) {
        gs.done = true; if (typeof sfxCorrect === 'function') sfxCorrect();
        gs.msg = `Decoded: "${gs.msgText}".`;
        if (gs.k === 4) { gs.over = true; NK.render('telegraph'); return NK.finish('telegraph', true, `Five telegrams decoded${gs.misses ? ` with ${NK.pl(gs.misses, 'wrong letter')}` : ' without a wrong letter'}${gs.peeks ? `, ${NK.pl(gs.peeks, 'look')} at the chart` : ''}.`); }
    } else gs.msg = '';
    NK.render('telegraph');
}
function tgNext() { const gs = gameState.telegraph; if (gs.over || !gs.done) return; gs.k++; _tgLoad(gs); NK.render('telegraph'); }
function tgChart() { const gs = gameState.telegraph; gs.chart = !gs.chart; if (gs.chart && gs.diff === 'hard') gs.peeks++; NK.render('telegraph'); }
function tgPlay() {
    const gs = gameState.telegraph; let A; try { A = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    const u = 0.09; let t = A.currentTime + 0.05;
    const beep = (len) => { const o = A.createOscillator(), g = A.createGain(); o.frequency.value = 660; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.01); g.gain.setValueAtTime(0.18, t + len - 0.01); g.gain.linearRampToValueAtTime(0, t + len); o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + len + 0.02); t += len + u; };
    for (const ch of gs.msgText) { if (ch === ' ') { t += u * 4; continue; } for (const s of _TG_CODE[ch]) beep(s === '.' ? u : u * 3); t += u * 2; }
    setTimeout(() => A.close && A.close(), (t - A.currentTime + 0.5) * 1000);
}
function tgNew() { initTelegraph(); }
function _tgView(gs) {
    let idx = 0;
    const words = gs.msgText.split(' ').map((w) => `<div class="tg-word">${[...w].map((L) => { const i = idx++, shown = i < gs.pos ? L : i === gs.pos && gs.bad ? gs.bad : '';
        return `<div class="tg-l"><span class="tg-code" aria-label="letter ${i + 1}: ${_TG_CODE[L].replace(/\./g, 'dot ').replace(/-/g, 'dash ').trim()}">${_TG_CODE[L].replace(/\./g, '•').replace(/-/g, '–')}</span><span class="tg-box${i === gs.pos && !gs.done ? ' tg-cur' : ''}${i === gs.pos && gs.bad ? ' tg-bad' : ''}" aria-hidden="true">${shown}</span></div>`; }).join('')}</div>`).join('<div class="tg-l" aria-hidden="true"><span class="tg-code">/</span></div>');
    const kb = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((L) => NK.btn(L, `tgType('${L}')`, { k: 'L' + L, disabled: gs.over || gs.done })).join('') + NK.btn(Icon.svg('delete', { size: '22px', sw: 2.4 }), "tgType('')", { k: 'L_', label: 'undo last letter', disabled: gs.over || gs.done });
    const chart = gs.chart ? `<div class="tg-chart">${gs.chartSet.map((L) => `<span><b>${L}</b><code>${_TG_CODE[L].replace(/\./g, '•').replace(/-/g, '–')}</code></span>`).join('')}</div>` : '';
    return `<div class="nk-top"><span>Telegram <b>${gs.k + 1}</b> of 5</span><span>Wrong letters: <b>${gs.misses}</b></span>${gs.diff === 'hard' ? `<span>Chart looks: <b>${gs.peeks}</b></span>` : ''}</div>
      <div class="tg-paper"><div class="tg-head"><span>TELEGRAPH OFFICE</span><span>No. ${101 + gs.k}</span></div><div class="tg-words" aria-label="telegram in Morse code, ${_tgLetters(gs).length} letters; ${gs.pos} decoded${gs.got ? ': ' + gs.got : ''}">${words}</div></div>
      ${NK.msg(gs.msg)}
      <div class="tg-kb" role="group" aria-label="letters">${kb}</div>
      <div class="gk-btns">${gs.done && !gs.over ? NK.btn(NK.icon('arrow-right') + 'Next telegram', 'tgNext()', { k: 'next', cls: 'gk-primary' }) : ''}${NK.btn(NK.icon('volume-2') + 'Play beeps', 'tgPlay()', { k: 'play' })}${gs.diff === 'easy' ? '' : NK.btn(gs.chart ? 'Close the chart' : 'Open the chart', 'tgChart()', { k: 'chart', pressed: gs.chart })}${NK.btn(NK.icon('rotate-ccw') + 'New shift', 'tgNew()', { k: 'restart' })}</div>${chart}`;
}
