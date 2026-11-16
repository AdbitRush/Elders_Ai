function init2048(container) {
  const gs = gameState.g2048;
  const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  const base = diff === 'easy' ? 128 : diff === 'hard' ? 512 : 256;
  gs.goal = Math.min(2048, base * Math.pow(2, (gs.level || 1) - 1));
  gs.b = Array.from({ length: 4 }, () => Array(4).fill(0));
  gs.score = 0;
  gs.over = false;
  gs.hist = [];
  _g2Add();
  _g2Add();
  const onKey = e => {
    if (gameState.currentId !== 'g2048')
      return;
    const d = {
      ArrowLeft: 'l',
      ArrowRight: 'r',
      ArrowUp: 'u',
      ArrowDown: 'd'
    }[e.key];
    if (d) {
      g2Move(d);
      e.preventDefault();
    }
  };
  document.addEventListener('keydown', onKey);
  window._gameCleanup = () => document.removeEventListener('keydown', onKey);
  _g2Render();
}
function _g2Add() {
  const gs = gameState.g2048, free = [];
  gs.b.forEach((row, r) => row.forEach((v, c) => {
    if (!v)
      free.push([
        r,
        c
      ]);
  }));
  if (!free.length)
    return;
  const [r, c] = free[Math.floor(Math.random() * free.length)];
  gs.b[r][c] = Math.random() < 0.9 ? 2 : 4;
  gs.fresh = r * 4 + c;
}
function _g2Slide(line) {
  const v = line.filter(x => x), out = [];
  let gain = 0;
  for (let i = 0; i < v.length; i++) {
    if (v[i] === v[i + 1]) {
      out.push(v[i] * 2);
      gain += v[i] * 2;
      i++;
    } else
      out.push(v[i]);
  }
  while (out.length < 4)
    out.push(0);
  return {
    out,
    gain
  };
}
function _g2Can() {
  const b = gameState.g2048.b;
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (!b[r][c])
        return true;
      if (c < 3 && b[r][c] === b[r][c + 1])
        return true;
      if (r < 3 && b[r][c] === b[r + 1][c])
        return true;
    }
  return false;
}
function g2Move(d) {
  const gs = gameState.g2048;
  if (gs.over)
    return;
  const b = gs.b, nb = b.map(r => r.slice());
  let gain = 0;
  for (let i = 0; i < 4; i++) {
    let line = d === 'l' || d === 'r' ? b[i].slice() : b.map(r => r[i]);
    if (d === 'r' || d === 'd')
      line.reverse();
    const s = _g2Slide(line);
    gain += s.gain;
    let o = s.out;
    if (d === 'r' || d === 'd')
      o = o.reverse();
    for (let j = 0; j < 4; j++) {
      if (d === 'l' || d === 'r')
        nb[i][j] = o[j];
      else
        nb[j][i] = o[j];
    }
  }
  if (nb.every((r, i) => r.every((v, j) => v === b[i][j]))) {
    gs.msg = 'Nothing moves that way. Try another direction.';
    return _g2Render();
  }
  gs.hist.push({
    b: b.map(r => r.slice()),
    score: gs.score
  });
  if (gs.hist.length > 50)
    gs.hist.shift();
  gs.b = nb;
  gs.score += gain;
  gs.msg = '';
  _g2Add();
  if (gain && typeof sfxFlip === 'function')
    sfxFlip();
  const top = Math.max(...gs.b.flat());
  if (top >= gs.goal) {
    gs.over = true;
    _g2Render();
    if (typeof sfxCorrect === 'function')
      sfxCorrect();
    return GameKit.finish('g2048', true, `You made the ${ gs.goal } tile! Score ${ gs.score }.`);
  }
  if (!_g2Can()) {
    gs.over = true;
    gs.msg = 'No moves left.';
    _g2Render();
    return GameKit.finish('g2048', false, `No moves left. Your biggest tile was ${ top } (goal ${ gs.goal }).`);
  }
  _g2Render();
}
function g2Undo() {
  const gs = gameState.g2048;
  if (gs.over || !gs.hist.length)
    return;
  const h = gs.hist.pop();
  gs.b = h.b;
  gs.score = h.score;
  gs.fresh = -1;
  gs.msg = 'Move undone.';
  _g2Render();
}
function _g2Render() {
  const gs = gameState.g2048, el = document.getElementById('gameContent');
  if (!el || gameState.currentId !== 'g2048')
    return;
  const C = {
    2: [
      '#f8eed8',
      '#d6c19a',
      '#33220f'
    ],
    4: [
      '#efd7a4',
      '#c9a868',
      '#33220f'
    ],
    8: [
      '#eab66c',
      '#bf8436',
      '#2e1c0a'
    ],
    16: [
      '#e3924a',
      '#b0621f',
      '#2a1506'
    ],
    32: [
      '#d9744a',
      '#a3482a',
      '#260f04'
    ],
    64: [
      '#b2412d',
      '#7c2617',
      '#fff6ea'
    ],
    128: [
      '#f2cc4d',
      '#bd9520',
      '#2e2203'
    ],
    256: [
      '#aebb68',
      '#7f8d3c',
      '#1f2606'
    ],
    512: [
      '#3f7d55',
      '#275a3a',
      '#f6fff4'
    ],
    1024: [
      '#2f6f7e',
      '#1c4d59',
      '#f2fcff'
    ],
    2048: [
      '#6b4a8a',
      '#48305f',
      '#fbf4ff'
    ]
  };
  const top = Math.max(...gs.b.flat());
  const state = gs.over ? top >= gs.goal ? ' g2-won' : ' g2-lost' : '';
  const pct = Math.max(0, Math.min(100, Math.round((Math.log2(Math.max(top, 2)) - 1) / (Math.log2(gs.goal) - 1) * 100)));
  const tiles = gs.b.flat().map((v, i) => {
    const fresh = i === gs.fresh ? ' g2-new' : '';
    if (!v)
      return `<div class="g2-t${ fresh }"></div>`;
    const [f, e, k] = C[v] || [
      '#3a332d',
      '#1f1a16',
      '#fff8ea'
    ];
    const sz = v >= 1024 ? ' g2-s4' : v >= 128 ? ' g2-s3' : '';
    return `<div class="g2-t g2-v${ sz }${ v >= 128 ? ' g2-hi' : '' }${ v >= gs.goal ? ' g2-goal' : '' }${ fresh }" style="--f:${ f };--e:${ e };--k:${ k }">${ v }</div>`;
  }).join('');
  const chev = p => `<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" focusable="false"><path d="${ p }" fill="none" stroke="currentColor" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const arrow = (d, s, l) => `<button type="button" class="g2-a" onclick="g2Move('${ d }')" aria-label="${ l }">${ s }</button>`;
  el.innerHTML = `<div class="g2${ state }" dir="ltr">
      <div class="g2-top"><span class="g2-plq">Goal: <b>${ gs.goal }</b></span><span class="g2-plq">Score: <b>${ gs.score }</b></span></div>
      <div class="g2-prog" aria-hidden="true"><i style="width:${ pct }%"></i></div>
      <div class="g2-frame"><div class="g2-board" id="g2-board">${ tiles }</div></div>
      <div class="cw-msg" role="status">${ gs.msg || '&nbsp;' }</div>
      <div class="g2-pad">${ arrow('u', chev('M5 15l7-7 7 7'), 'up') }<div class="g2-mid">${ arrow('l', chev('M15 5l-7 7 7 7'), 'left') }${ GameKit.btn('Undo', 'g2Undo()', { disabled: !gs.hist.length || gs.over }) }${ arrow('r', chev('M9 5l7 7-7 7'), 'right') }</div>${ arrow('d', chev('M5 9l7 7 7-7'), 'down') }</div>
    </div>
    <style>
      .g2{width:100%;box-sizing:border-box;max-width:26rem;margin:0 auto;color:#2b1b0d}
      .g2 *{box-sizing:border-box}
      /* plaques */
      .g2-top{display:flex;justify-content:space-between;gap:10px;margin-bottom:8px}
      .g2-plq{flex:1;display:flex;align-items:baseline;justify-content:center;gap:8px;padding:8px 14px;border-radius:12px;font-size:1.2rem;font-weight:700;color:#fff3dc;
        background:radial-gradient(circle at 9px 50%,#e9c98f 0 2.5px,rgba(0,0,0,.35) 3px 4px,transparent 4.5px),radial-gradient(circle at calc(100% - 9px) 50%,#e9c98f 0 2.5px,rgba(0,0,0,.35) 3px 4px,transparent 4.5px),repeating-linear-gradient(91deg,rgba(0,0,0,.07) 0 2px,transparent 2px 11px),linear-gradient(#7d5230,#5e3a1d);
        box-shadow:inset 0 1px 0 rgba(255,225,175,.35),inset 0 -2px 0 rgba(0,0,0,.3),0 2px 4px rgba(60,35,10,.3)}
      .g2-plq b{font-size:1.5rem;font-weight:900;color:#fff;font-variant-numeric:tabular-nums}
      /* progress groove: biggest tile on its way to the goal */
      .g2-prog{height:10px;border-radius:6px;background:#d9c3a0;box-shadow:inset 0 2px 3px rgba(70,40,10,.4);margin:0 4px 12px;overflow:hidden}
      .g2-prog i{display:block;height:100%;border-radius:6px;background:linear-gradient(#f4c552,#d99a1f);transition:width .3s ease}
      /* tray */
      .g2-frame{padding:10px;border-radius:22px;
        background:repeating-linear-gradient(93deg,rgba(80,45,15,.10) 0 2px,transparent 2px 9px),repeating-linear-gradient(88deg,rgba(255,235,200,.08) 0 1px,transparent 1px 17px),linear-gradient(150deg,#c79a63,#a9783f 55%,#b98950);
        box-shadow:inset 0 2px 0 rgba(255,235,200,.55),inset 0 -3px 0 rgba(70,40,10,.35),0 6px 14px rgba(70,40,10,.32);transition:box-shadow .4s ease}
      .g2-board{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;padding:10px;border-radius:14px;touch-action:none;user-select:none;-webkit-user-select:none;
        background:repeating-linear-gradient(92deg,rgba(0,0,0,.08) 0 2px,transparent 2px 10px),linear-gradient(#7f5630,#6c4624);
        box-shadow:inset 0 4px 8px rgba(30,15,0,.55),inset 0 -1px 0 rgba(255,225,175,.25)}
      /* empty well */
      .g2-t{aspect-ratio:1;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-family:system-ui,sans-serif;line-height:1;
        font-size:clamp(1.7rem,8.5vw,2.7rem);font-variant-numeric:tabular-nums;background:rgba(40,20,5,.26);box-shadow:inset 0 3px 5px rgba(25,10,0,.45),inset 0 -1px 0 rgba(255,225,175,.18)}
      /* block */
      .g2-v{color:var(--k);background:linear-gradient(160deg,rgba(255,255,255,.42),rgba(255,255,255,0) 46%),linear-gradient(0deg,rgba(0,0,0,.07),rgba(0,0,0,0) 40%),var(--f);
        box-shadow:0 4px 0 var(--e),0 7px 8px rgba(25,10,0,.38),inset 0 1px 0 rgba(255,255,255,.6);transform:translateY(-2px)}
      .g2-s3{font-size:clamp(1.5rem,7vw,2.3rem)}
      .g2-s4{font-size:clamp(1.4rem,6vw,1.9rem)}
      .g2-hi{box-shadow:0 4px 0 var(--e),0 7px 8px rgba(25,10,0,.38),inset 0 1px 0 rgba(255,255,255,.6),inset 0 0 0 3px rgba(255,255,255,.32)}
      .g2-new{animation:g2pop .22s ease-out}@keyframes g2pop{from{transform:translateY(-2px) scale(.6);opacity:.3}to{transform:translateY(-2px) scale(1);opacity:1}}
      /* state in the scene */
      .g2-won .g2-frame{box-shadow:inset 0 2px 0 rgba(255,235,200,.55),inset 0 -3px 0 rgba(70,40,10,.35),0 0 0 4px #f5c84b,0 0 34px 10px rgba(245,190,60,.7);animation:g2glow 1.8s ease-in-out 2}
      .g2-won .g2-goal{box-shadow:0 4px 0 var(--e),0 0 0 4px #ffe08a,0 0 18px 6px rgba(255,215,110,.9),inset 0 1px 0 rgba(255,255,255,.6)}
      .g2-won .g2-prog i{background:linear-gradient(#ffe08a,#f0b429)}
      @keyframes g2glow{50%{box-shadow:inset 0 2px 0 rgba(255,235,200,.55),inset 0 -3px 0 rgba(70,40,10,.35),0 0 0 4px #ffe08a,0 0 48px 16px rgba(250,205,90,.85)}}
      .g2-lost .g2-frame{filter:grayscale(.6) brightness(.93)}
      .g2-lost .g2-prog{filter:grayscale(.7)}
      /* controls */
      .g2-pad{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:4px}
      .g2-mid{display:flex;gap:8px;align-items:center}
      .g2-a{width:72px;height:60px;border-radius:14px;border:2px solid #6b3f14;background:linear-gradient(#f6c477,#dd9438);color:#2a1700;font-size:1.6rem;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;
        box-shadow:0 4px 0 #8a5318,inset 0 1px 0 rgba(255,255,255,.55);transition:transform .08s ease,box-shadow .08s ease;touch-action:manipulation}
      .g2-a:active{transform:translateY(3px);box-shadow:0 1px 0 #8a5318,inset 0 1px 0 rgba(255,255,255,.55)}
      .g2-a:focus-visible{outline:3px solid #1d4ed8;outline-offset:3px}
      .g2 .gk-btn{border-color:#c9a46a}
      .g2 .cw-msg{text-align:center;font-weight:800;font-size:1.1rem;margin:10px 0 8px;min-height:1.5em}
      @media (prefers-reduced-motion:reduce){.g2-new,.g2-won .g2-frame{animation:none}.g2-prog i,.g2-frame,.g2-a{transition:none}}
    </style>`;
  const bd = document.getElementById('g2-board');
  let sx = 0, sy = 0;
  bd.addEventListener('touchstart', e => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });
  bd.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30)
      return;
    g2Move(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'r' : 'l' : dy > 0 ? 'd' : 'u');
  });
}