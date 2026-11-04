// ═══════════════════════════════════════════════════════════════════════════════
// TWENTY QUESTIONS (2026-11, nostalgia batch 2) — the parlor game "Animal, vegetable or mineral?" that radio and
// early television turned into a quiz show. The computer thinks of one of 30 everyday things; you ask yes/no
// questions from the list and work out which one. Solo, no clock.
// Every thing has a different pattern of answers (checked by tools/preview/twentyq-check.js), so the questions can
// always pin it down (33 questions). A guess ("Is it the car?") also uses a question. Find it within the limit to win.
// Easy: 20 questions, things that no longer fit are grayed out for you. Normal: 20, you cross things out yourself.
// Hard: 14 questions, cross out yourself. The questions are written to have one plain answer for each thing.
// ═══════════════════════════════════════════════════════════════════════════════
const _TQ_ITEMS = ['dog', 'cat', 'cow', 'horse', 'chicken', 'robin', 'goldfish', 'apple', 'orange', 'carrot', 'potato', 'rose', 'sunflower', 'oak tree',
    'television', 'table radio', 'toaster', 'stovetop teakettle', 'candle', 'bicycle', 'car', 'train', 'airplane', 'umbrella', 'book', 'baseball', 'kite', 'wristwatch', 'guitar', 'hat'];
const _TQ_Q = [
    ['Is it an animal?', ['dog', 'cat', 'cow', 'horse', 'chicken', 'robin', 'goldfish']],
    ['Is it a plant, or part of a plant?', ['apple', 'orange', 'carrot', 'potato', 'rose', 'sunflower', 'oak tree']],
    ['Is it made by people?', ['television', 'table radio', 'toaster', 'stovetop teakettle', 'candle', 'bicycle', 'car', 'train', 'airplane', 'umbrella', 'book', 'baseball', 'kite', 'wristwatch', 'guitar', 'hat']],
    ['Is it an animal with four legs?', ['dog', 'cat', 'cow', 'horse']],
    ['Does it have feathers?', ['chicken', 'robin']],
    ['Does it live in water?', ['goldfish']],
    ['Is it a farm animal?', ['cow', 'horse', 'chicken']],
    ['Is it a common house pet?', ['dog', 'cat', 'goldfish']],
    ['Can it fly high up in the sky?', ['robin', 'airplane', 'kite']],
    ['Is it a fruit or a vegetable?', ['apple', 'orange', 'carrot', 'potato']],
    ['Does it grow on a tree?', ['apple', 'orange']],
    ['Does it grow under the ground?', ['carrot', 'potato']],
    ['Is it a flower?', ['rose', 'sunflower']],
    ['Is it a tree?', ['oak tree']],
    ['Is it orange in color?', ['orange', 'carrot', 'goldfish']],
    ['Is it bigger than a grown person?', ['cow', 'horse', 'oak tree', 'car', 'train', 'airplane']],
    ['Does it have wheels?', ['bicycle', 'car', 'train', 'airplane']],
    ['Can people ride in it or on it?', ['horse', 'bicycle', 'car', 'train', 'airplane']],
    ['Does it have an engine?', ['car', 'train', 'airplane']],
    ['Does it plug into a wall socket?', ['television', 'table radio', 'toaster']],
    ['Does it have a screen?', ['television']],
    ['Is it used in the kitchen?', ['toaster', 'stovetop teakettle']],
    ['Is it used to heat, cook or burn something?', ['toaster', 'stovetop teakettle', 'candle']],
    ['Is it a musical instrument?', ['guitar']],
    ['Does it have strings?', ['guitar', 'kite']],
    ['Do you wear it?', ['wristwatch', 'hat']],
    ['Does it tell the time?', ['wristwatch']],
    ['Do you read it?', ['book']],
    ['Is it a ball used in a game?', ['baseball']],
    ['Do you open it up when it rains?', ['umbrella']],
    ['Does it bark?', ['dog']],
    ['Does it have thorns?', ['rose']],
    ['Does it run on rails?', ['train']],
];
const _tqYes = (q, item) => _TQ_Q[q][1].includes(item);
function initTwentyQ() {
    NK.start('twentyq', {
        setup(gs, diff) {
            gs.diff = diff; gs.limit = diff === 'hard' ? 14 : 20; gs.auto = diff === 'easy';
            gs.secret = _TQ_ITEMS[Math.floor(Math.random() * _TQ_ITEMS.length)];
            gs.asked = []; gs.guessed = []; gs.out = []; gs.pick = -1; gs.over = false;
            gs.msg = `I am thinking of one of the 30 things below. Ask yes/no questions - you have ${gs.limit}.`;
        },
        view: _tqView,
        rules: (gs) => [
            'The computer has picked one of the <b>30 things</b> in the list. Ask questions from the question list; each gets a plain <b>yes</b> or <b>no</b>.',
            `You have <b>${gs.limit} questions</b>. Guessing a thing ("Is it the car?") also uses one.`,
            gs.auto ? 'On easy, things that no longer fit your answers are grayed out for you.' : 'Tap a thing to pick it, then <b>Cross out</b> to rule it out (tap again to bring it back) or <b>Guess</b> it.',
            'Good questions split the list roughly in half. "Is it an animal?" is a fine start.',
            'Every thing has its own pattern of answers, so it can always be found. No clock.'],
        css: `.tq-log{background:#fffdf5;border:3px solid #e8cfa8;border-radius:14px;padding:8px 12px;margin-bottom:10px;min-height:3em;font-size:1.05rem}
.tq-log div{padding:3px 0;border-bottom:1px dashed #e8cfa8}.tq-log b.y{color:#15803d}.tq-log b.n{color:#b91c1c}
.tq-sec{font-weight:900;color:#4a3420;margin:12px 0 6px}
.tq-qs{display:flex;flex-direction:column;gap:6px}
.tq-q{text-align:left;justify-content:flex-start!important;font-weight:700!important;min-height:52px}
.tq-items{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.2rem,1fr));gap:6px}
.tq-i{min-height:52px;border:2px solid #c9a46a;background:#fff;color:#2b1b0d;font:800 1rem/1.15 system-ui,sans-serif;border-radius:12px;--nk-r:12px;--nk-bw:2px;cursor:pointer;padding:4px 6px}
.tq-i.tq-x{color:#8a7560;text-decoration:line-through;background:#f3ead8;border-style:dashed}
.tq-i.tq-sel{background:#fde68a;border-color:#b45309}
.tq-i.tq-win{background:#bbf7d0;border-color:#15803d}
.tq-act{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:8px 0}`,
    });
}
const _tqLeft = (gs) => gs.limit - gs.asked.length - gs.guessed.length;
const _tqFits = (gs, item) => gs.asked.every((q) => _tqYes(q, item) === _tqYes(q, gs.secret)) && !gs.guessed.includes(item);
function tqAsk(q) {
    const gs = gameState.twentyq; if (gs.over || gs.asked.includes(q)) return;
    if (_tqLeft(gs) <= 0) return;
    gs.asked.push(q); const yes = _tqYes(q, gs.secret);
    if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `"${_TQ_Q[q][0]}" - ${yes ? 'Yes.' : 'No.'} ${NK.pl(_tqLeft(gs), 'question')} left.`;
    if (_tqLeft(gs) <= 0) return _tqEnd(false);
    NK.render('twentyq');
}
function tqPick(i) { const gs = gameState.twentyq; if (gs.over) return; gs.pick = gs.pick === i ? -1 : i; gs.msg = gs.pick < 0 ? '' : `The ${_TQ_ITEMS[i]}: guess it, or cross it out.`; NK.render('twentyq'); }
function tqCross() { const gs = gameState.twentyq; if (gs.over || gs.pick < 0) return; const it = _TQ_ITEMS[gs.pick], k = gs.out.indexOf(it); if (k >= 0) gs.out.splice(k, 1); else gs.out.push(it); gs.pick = -1; gs.msg = k >= 0 ? `The ${it} is back on the list.` : `The ${it} is crossed out.`; NK.render('twentyq'); }
function tqGuess() {
    const gs = gameState.twentyq; if (gs.over || gs.pick < 0) return;
    const it = _TQ_ITEMS[gs.pick];
    if (it === gs.secret) { gs.guessed.push(it); return _tqEnd(true); }
    gs.guessed.push(it); gs.out.push(it); gs.pick = -1;
    gs.msg = `No, it is not the ${it}. ${NK.pl(_tqLeft(gs), 'question')} left.`;
    if (_tqLeft(gs) <= 0) return _tqEnd(false);
    NK.render('twentyq');
}
function _tqEnd(win) {
    const gs = gameState.twentyq; gs.over = true; gs.pick = -1;
    const used = gs.asked.length + gs.guessed.length;
    gs.msg = win ? `Yes - it is the ${gs.secret}! Found with ${NK.pl(used, 'question')}.` : `Out of questions. I was thinking of the ${gs.secret}.`;
    NK.render('twentyq');
    if (win && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('twentyq', win, win ? `It was the ${gs.secret}, found with ${NK.pl(used, 'question')}!` : `It was the ${gs.secret}. Questions that split the list in half find it fastest.`);
}
function tqNew() { initTwentyQ(); }
function _tqView(gs) {
    const log = gs.asked.map((q) => `<div>${_TQ_Q[q][0]} <b class="${_tqYes(q, gs.secret) ? 'y' : 'n'}">${_tqYes(q, gs.secret) ? 'Yes' : 'No'}</b></div>`).concat(gs.guessed.map((g) => `<div>Is it the ${g}? <b class="${g === gs.secret ? 'y' : 'n'}">${g === gs.secret ? 'Yes!' : 'No'}</b></div>`)).join('');
    const items = _TQ_ITEMS.map((it, i) => {
        const x = gs.out.includes(it) || (gs.auto && !_tqFits(gs, it)), win = gs.over && it === gs.secret;
        return `<button type="button" class="nk-cell tq-i${x && !win ? ' tq-x' : ''}${gs.pick === i ? ' tq-sel' : ''}${win ? ' tq-win' : ''}" onclick="tqPick(${i})" data-k="i${i}" aria-pressed="${gs.pick === i}" aria-label="${it}${x ? ', ruled out' : ''}"${gs.over ? ' disabled' : ''}>${it}</button>`;
    }).join('');
    const left = gs.auto ? _TQ_ITEMS.filter((it) => _tqFits(gs, it)).length : null;
    const qs = _TQ_Q.map((q, i) => NK.btn(q[0], `tqAsk(${i})`, { k: 'q' + i, cls: 'tq-q', disabled: gs.over || gs.asked.includes(i) })).join('');
    const pickIt = gs.pick >= 0 ? _TQ_ITEMS[gs.pick] : '';
    return `<div class="nk-top"><span>Questions left: <b>${_tqLeft(gs)}</b> of ${gs.limit}</span>${left !== null ? `<span>Still possible: <b>${left}</b></span>` : ''}</div>
      <div class="tq-log" aria-label="questions and answers">${log || 'Your questions and the answers appear here.'}</div>
      ${NK.msg(gs.msg)}
      <div class="tq-sec">The 30 things</div>
      <div class="tq-items">${items}</div>
      <div class="tq-act">${NK.btn(pickIt ? `Guess: the ${pickIt}` : 'Guess', 'tqGuess()', { k: 'guess', cls: 'gk-primary', disabled: gs.over || gs.pick < 0 })}${gs.auto ? '' : NK.btn('Cross out', 'tqCross()', { k: 'cross', disabled: gs.over || gs.pick < 0 })}</div>
      <div class="tq-sec">Ask a question</div>
      <div class="tq-qs">${qs}</div>
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New game', 'tqNew()', { k: 'restart' })}</div>`;
}
