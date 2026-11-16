function initLights() {
  NK.start('lights', {
    setup(gs, diff) {
      gs.n = diff === 'easy' ? 3 : diff === 'hard' ? 5 : 4;
      const N = gs.n * gs.n, k = diff === 'easy' ? 3 : diff === 'hard' ? 7 : 5;
      do {
        gs.on = Array(N).fill(false);
        const presses = new Set();
        while (presses.size < k)
          presses.add(Math.floor(Math.random() * N));
        presses.forEach(i => _ltPress(gs, i));
        gs.par = _ltMinPar(gs, presses.size);
      } while (gs.on.every(x => !x));
      gs.start = gs.on.slice();
      gs.moves = 0;
      gs.hist = [];
      gs.hint = -1;
      gs.over = false;
      gs.msg = 'Turn every lamp off. Each press also switches the lamps next to it.';
    },
    view: _ltView,
    keys: {
      KeyU: () => ltUndo(),
      KeyH: () => ltHint()
    },
    rules: [
      'The goal is a dark board: every lamp <b>off</b>.',
      'Pressing a lamp switches it, and also the lamps right above, below, left and right of it. On becomes off, off becomes on. Lamps in the corners and along the edges have fewer neighbors.',
      'Pressing the same lamp twice puts everything back, and the order of presses does not matter.',
      '<b>Par</b> is the fewest presses that can solve this puzzle. Matching it is a fine finish, but any finish counts.',
      'Undo takes back a press. Hint rings one lamp that belongs to a real solution from where you are now.',
      'There is no clock. Keyboard: arrows move, Enter presses a lamp, U undoes, H gives a hint.'
    ],
    css: `.nk-top.lt-plate{display:flex;flex-wrap:wrap;justify-content:space-around;align-items:flex-start;gap:6px 14px;box-sizing:border-box;width:100%;max-width:min(100%,27rem);margin:0 auto 14px;padding:10px 18px 8px;border:2px solid #7a5a1c;border-radius:12px;color:#2e1a05;font:700 1.3rem/1.2 system-ui,sans-serif;text-shadow:0 1px 0 rgba(255,244,200,.75);background:radial-gradient(circle at 9px 9px,#6a4a12 0 2.5px,#f6e7ae 3px 4px,rgba(246,231,174,0) 4.5px),radial-gradient(circle at calc(100% - 9px) 9px,#6a4a12 0 2.5px,#f6e7ae 3px 4px,rgba(246,231,174,0) 4.5px),radial-gradient(circle at 9px calc(100% - 9px),#6a4a12 0 2.5px,#f6e7ae 3px 4px,rgba(246,231,174,0) 4.5px),radial-gradient(circle at calc(100% - 9px) calc(100% - 9px),#6a4a12 0 2.5px,#f6e7ae 3px 4px,rgba(246,231,174,0) 4.5px),linear-gradient(180deg,#f3dd94,#d6b055 46%,#bf9339 54%,#e2c46e);box-shadow:0 3px 8px rgba(50,25,5,.3),inset 0 1px 0 rgba(255,255,255,.65),inset 0 -2px 0 rgba(90,60,15,.45)}
.lt-plate span{display:flex;flex-direction:column;align-items:center;white-space:nowrap;unicode-bidi:plaintext}
.lt-plate b{font-size:1.9rem;line-height:1.1;font-weight:800}
.lt-frame{box-sizing:border-box;width:100%;max-width:min(100%,27rem);margin:0 auto;padding:clamp(6px,2vw,12px);border-radius:22px;background:linear-gradient(135deg,#f3dc93,#b8892f 28%,#f0d27a 50%,#8f6520 76%,#e2c067);box-shadow:0 6px 16px rgba(50,25,5,.35),inset 0 1px 0 rgba(255,255,255,.6),inset 0 -2px 0 rgba(80,50,10,.5)}
.lt-frame.lt-done{box-shadow:0 0 0 5px rgba(255,240,196,.75),0 6px 16px rgba(50,25,5,.35),inset 0 1px 0 rgba(255,255,255,.6),inset 0 -2px 0 rgba(80,50,10,.5)}
.lt-board{display:grid;gap:clamp(6px,2vw,12px);box-sizing:border-box;width:100%;padding:clamp(8px,2.6vw,16px);border-radius:14px;container-type:inline-size;background:radial-gradient(ellipse at 50% 50%,rgba(255,190,80,calc(var(--lt-lit,0)*.34)),rgba(255,190,80,0) 75%),linear-gradient(115deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.09) 46%,rgba(255,255,255,0) 62%),repeating-linear-gradient(92deg,rgba(0,0,0,.14) 0 1px,rgba(0,0,0,0) 1px 8px,rgba(255,210,160,.05) 8px 9px,rgba(255,210,160,0) 9px 21px),linear-gradient(180deg,#5e3719,#43260f 60%,#3a200c);box-shadow:inset 0 2px 8px rgba(0,0,0,.6),inset 0 0 0 2px #2a1608}
.lt-l{position:relative;aspect-ratio:1;border:0;--nk-r:50%;border-radius:50%;background:radial-gradient(ellipse 34% 22% at 36% 24%,rgba(255,255,255,.34),rgba(255,255,255,0)),radial-gradient(circle closest-side at 50% 50%,#5d5046 0,#3b3029 55%,#231b15 86%,#6d5220 87%,#d9b760 91%,#8a6524 96%,#4a3410 100%);color:#efe4d0;text-shadow:0 1px 2px #000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;font:800 1.3rem/1 system-ui,sans-serif;font-size:clamp(1.3rem,calc(26cqw / var(--lt-n,4)),1.75rem);cursor:pointer;min-width:0;padding:0;box-shadow:0 3px 5px rgba(0,0,0,.55)}
.lt-l svg{width:38%;height:38%;flex:none}
.lt-on{background:radial-gradient(ellipse 34% 22% at 36% 24%,rgba(255,255,255,.8),rgba(255,255,255,0)),radial-gradient(circle closest-side at 50% 50%,#fffbe6 0,#ffe27a 40%,#f7b733 70%,#e08e12 86%,#8f6a1e 87%,#fbe7a0 91%,#c99a3a 96%,#6a4a12 100%);color:#3a1c02;text-shadow:0 1px 0 rgba(255,255,255,.6);box-shadow:0 0 0 3px rgba(255,214,110,.35),0 0 26px 10px rgba(255,186,60,.6),0 3px 5px rgba(0,0,0,.4)!important}
.lt-l:focus-visible{outline:4px solid #fff;outline-offset:2px}
.lt-l.lt-hint{outline:5px dashed #60a5fa;outline-offset:2px;z-index:1}
.lt-l.lt-hint::after{content:"";position:absolute;inset:-4px;border-radius:50%;box-shadow:0 0 0 5px rgba(96,165,250,.5),0 0 16px 6px rgba(96,165,250,.55);pointer-events:none;animation:lt-ring 1.6s ease-in-out infinite}
@keyframes lt-ring{0%,100%{opacity:.35}50%{opacity:1}}
.lt-l:disabled{cursor:default}
.gk-btns.lt-btns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 12px;box-sizing:border-box;width:100%;max-width:min(100%,27rem);margin:16px auto 6px}
.gk-btns.lt-btns>*{box-sizing:border-box;min-width:0;min-height:60px;margin:0;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 12px;font:800 1.3rem/1.15 system-ui,sans-serif;color:#2e1a05;text-shadow:0 1px 0 rgba(255,244,200,.7);background:linear-gradient(180deg,#f6e2a0,#d9b455 48%,#c39a3c 52%,#e3c675);border:2px solid #6f4f17;border-radius:14px;box-shadow:0 5px 0 #5a3418,0 9px 12px rgba(50,25,5,.3),inset 0 1px 0 rgba(255,255,255,.7);cursor:pointer;transition:transform .08s,box-shadow .08s}
.gk-btns.lt-btns>*:active:not(:disabled){transform:translateY(4px);box-shadow:0 1px 0 #5a3418,0 3px 5px rgba(50,25,5,.3),inset 0 1px 0 rgba(255,255,255,.7)}
.gk-btns.lt-btns>*:focus-visible{outline:4px solid #1d4ed8;outline-offset:3px}
.gk-btns.lt-btns>*:disabled{background:#cdbf9d;color:#5c4a2e;border-color:#9a8a66;text-shadow:none;box-shadow:0 2px 0 #8a7a5a;cursor:default}
@media (prefers-reduced-motion:reduce){.lt-l.lt-hint::after{animation:none;opacity:1}.gk-btns.lt-btns>*{transition:none}.gk-btns.lt-btns>*:active:not(:disabled){transform:none}}`
  });
}
const _ltNb = (n, i) => {
  const r = Math.floor(i / n), c = i % n, o = [i];
  if (r)
    o.push(i - n);
  if (r < n - 1)
    o.push(i + n);
  if (c)
    o.push(i - 1);
  if (c < n - 1)
    o.push(i + 1);
  return o;
};
function _ltPress(gs, i) {
  _ltNb(gs.n, i).forEach(j => gs.on[j] = !gs.on[j]);
}
function _ltSolve(n, on) {
  const N = n * n, M = [];
  for (let j = 0; j < N; j++) {
    const row = Array(N + 1).fill(0);
    _ltNb(n, j).forEach(i => row[i] = 1);
    row[N] = on[j] ? 1 : 0;
    M.push(row);
  }
  let r = 0;
  const piv = [];
  for (let c = 0; c < N && r < N; c++) {
    let p = r;
    while (p < N && !M[p][c])
      p++;
    if (p === N)
      continue;
    [M[r], M[p]] = [
      M[p],
      M[r]
    ];
    for (let k = 0; k < N; k++)
      if (k !== r && M[k][c])
        for (let x = c; x <= N; x++)
          M[k][x] ^= M[r][x];
    piv.push(c);
    r++;
  }
  for (let k = r; k < N; k++)
    if (M[k][N])
      return null;
  const x = Array(N).fill(0);
  piv.forEach((c, k) => x[c] = M[k][N]);
  const nulls = [];
  for (let f = 0; f < N; f++)
    if (!piv.includes(f)) {
      const v = Array(N).fill(0);
      v[f] = 1;
      piv.forEach((c, k) => v[c] = M[k][f]);
      nulls.push(v);
    }
  return {
    x,
    nulls
  };
}
function _ltBest(n, on) {
  const S = _ltSolve(n, on);
  if (!S)
    return null;
  let best = S.x, bc = S.x.reduce((a, b) => a + b, 0);
  for (let m = 1; m < 1 << S.nulls.length; m++) {
    const v = S.x.slice();
    S.nulls.forEach((nv, k) => {
      if (m >> k & 1)
        nv.forEach((b, i) => v[i] ^= b);
    });
    const c = v.reduce((a, b) => a + b, 0);
    if (c < bc) {
      bc = c;
      best = v;
    }
  }
  return best;
}
function _ltMinPar(gs, fallback) {
  const b = _ltBest(gs.n, gs.on);
  return b ? b.reduce((a, c) => a + c, 0) : fallback;
}
function ltTap(i) {
  const gs = gameState.lights;
  if (gs.over)
    return;
  gs.hist.push(gs.on.slice());
  _ltPress(gs, i);
  gs.moves++;
  gs.hint = -1;
  if (typeof sfxFlip === 'function')
    sfxFlip();
  const left = gs.on.filter(Boolean).length;
  if (!left) {
    gs.over = true;
    gs.msg = `All dark in ${ gs.moves } press${ gs.moves === 1 ? '' : 'es' }!`;
    NK.render('lights');
    if (typeof sfxCorrect === 'function')
      sfxCorrect();
    return NK.finish('lights', true, `Every lamp off in ${ gs.moves } press${ gs.moves === 1 ? '' : 'es' } (par ${ gs.par }).${ gs.moves <= gs.par ? ' That is par!' : '' }`);
  }
  gs.msg = `${ left } lamp${ left === 1 ? '' : 's' } still on.`;
  NK.render('lights');
}
function ltUndo() {
  const gs = gameState.lights;
  if (gs.over || !gs.hist.length)
    return;
  gs.on = gs.hist.pop();
  gs.moves = Math.max(0, gs.moves - 1);
  gs.hint = -1;
  gs.msg = 'Press taken back.';
  NK.render('lights');
}
function ltHint() {
  const gs = gameState.lights;
  if (gs.over)
    return;
  const x = _ltBest(gs.n, gs.on);
  gs.hint = x ? x.findIndex(Boolean) : -1;
  gs.msg = gs.hint >= 0 ? 'Try the lamp ringed in blue. It is part of a solution from here.' : 'No hint available.';
  NK.render('lights');
}
function ltReset() {
  const gs = gameState.lights;
  if (gs.over)
    return;
  gs.on = gs.start.slice();
  gs.hist = [];
  gs.moves = 0;
  gs.hint = -1;
  gs.msg = 'Back to the start of this puzzle.';
  NK.render('lights');
}
function ltNew() {
  initLights();
}
function _ltView(gs) {
  const lamps = gs.on.map((v, i) => `<button type="button" class="nk-cell lt-l${ v ? ' lt-on' : '' }${ gs.hint === i ? ' lt-hint' : '' }" onclick="ltTap(${ i })" data-k="l${ i }"${ i === 0 ? ' data-first' : '' } aria-label="lamp row ${ Math.floor(i / gs.n) + 1 } column ${ i % gs.n + 1 }, ${ v ? 'on' : 'off' }" aria-pressed="${ v }"${ gs.over ? ' disabled' : '' }>${ v ? Icon.svg('sun', {
    size: '42%',
    sw: 2.4
  }) + '<span>ON</span>' : '<span>off</span>' }</button>`).join('');
  return `<div class="nk-top lt-plate"><span>Lamps on: <b>${ gs.on.filter(Boolean).length }</b></span><span>Presses: <b>${ gs.moves }</b></span><span>Par: <b>${ gs.par }</b></span></div>
      <div class="lt-frame${ gs.over ? ' lt-done' : '' }"><div class="lt-board" style="grid-template-columns:repeat(${ gs.n },1fr);--lt-n:${ gs.n };--lt-lit:${ (gs.on.filter(Boolean).length / gs.on.length).toFixed(2) }">${ lamps }</div></div>
      ${ NK.msg(gs.msg) }
      <div class="gk-btns lt-btns">${ NK.btn(NK.icon('undo-2') + 'Undo', 'ltUndo()', {
    k: 'undo',
    disabled: !gs.hist.length || gs.over
  }) }${ NK.btn(NK.icon('lightbulb') + 'Hint', 'ltHint()', {
    k: 'hint',
    disabled: gs.over
  }) }${ NK.btn('Start over', 'ltReset()', {
    k: 'reset',
    disabled: gs.over
  }) }${ NK.btn(NK.icon('rotate-ccw') + 'New puzzle', 'ltNew()', { k: 'new' }) }</div>`;
}