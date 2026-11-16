function initFifteen(container) {
  const gs = gameState.fifteen;
  const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  gs.n = diff === 'easy' ? 3 : 4;
  const N = gs.n * gs.n;
  gs.t = Array.from({ length: N }, (_, i) => (i + 1) % N);
  let gap = N - 1, prev = -1;
  const steps = diff === 'hard' ? 400 : diff === 'easy' ? 80 : 200;
  for (let k = 0; k < steps || _ftSolved(); k++) {
    const nb = _ftNb(gap).filter(x => x !== prev);
    const x = nb[Math.floor(Math.random() * nb.length)];
    gs.t[gap] = gs.t[x];
    gs.t[x] = 0;
    prev = gap;
    gap = x;
  }
  gs.moves = 0;
  gs.over = false;
  const onKey = e => {
    if (gameState.currentId !== 'fifteen' || gs.over)
      return;
    const g = gs.t.indexOf(0), n = gs.n, r = Math.floor(g / n), c = g % n;
    const tgt = {
      ArrowLeft: c < n - 1 ? g + 1 : -1,
      ArrowRight: c > 0 ? g - 1 : -1,
      ArrowUp: r < n - 1 ? g + n : -1,
      ArrowDown: r > 0 ? g - n : -1
    }[e.key];
    if (tgt !== undefined) {
      if (tgt >= 0)
        ftTap(tgt);
      e.preventDefault();
    }
  };
  document.addEventListener('keydown', onKey);
  window._gameCleanup = () => document.removeEventListener('keydown', onKey);
  _ftRender();
}
function _ftNb(i) {
  const n = gameState.fifteen.n, r = Math.floor(i / n), c = i % n, o = [];
  if (r)
    o.push(i - n);
  if (r < n - 1)
    o.push(i + n);
  if (c)
    o.push(i - 1);
  if (c < n - 1)
    o.push(i + 1);
  return o;
}
function _ftSolved() {
  const t = gameState.fifteen.t;
  return t.every((v, i) => v === (i + 1) % t.length);
}
function ftTap(i) {
  const gs = gameState.fifteen;
  if (gs.over)
    return;
  const n = gs.n, g = gs.t.indexOf(0), gr = Math.floor(g / n), gc = g % n, r = Math.floor(i / n), c = i % n;
  if (r !== gr && c !== gc) {
    gs.msg = 'Only tiles in the same row or column as the gap can slide.';
    return _ftRender();
  }
  const step = r === gr ? c < gc ? -1 : 1 : r < gr ? -n : n;
  for (let p = g; p !== i; p += step) {
    gs.t[p] = gs.t[p + step];
    gs.t[p + step] = 0;
  }
  gs.moves++;
  gs.msg = '';
  if (typeof sfxFlip === 'function')
    sfxFlip();
  if (_ftSolved()) {
    gs.over = true;
    _ftRender();
    if (typeof sfxCorrect === 'function')
      sfxCorrect();
    return GameKit.finish('fifteen', true, `Solved in ${ gs.moves } move${ gs.moves === 1 ? '' : 's' }!`);
  }
  _ftRender();
}
function ftGiveUp() {
  const gs = gameState.fifteen;
  if (gs.over)
    return;
  gs.over = true;
  gs.t = gs.t.map((_, i) => (i + 1) % gs.t.length);
  _ftRender();
  GameKit.finish('fifteen', false, 'Here is the finished puzzle. A new shuffle is one tap away.');
}
function _ftRender() {
  const gs = gameState.fifteen, el = document.getElementById('gameContent');
  if (!el || gameState.currentId !== 'fifteen')
    return;
  const n = gs.n, g = gs.t.indexOf(0), gr = Math.floor(g / n), gc = g % n;
  const pv = gs._v;
  const slid = !!pv && pv.t.length === gs.t.length && gs.moves === pv.m + 1;
  const won = gs.over && !!pv && gs.moves > pv.w;
  gs._v = {
    t: gs.t.slice(),
    m: gs.moves,
    w: gs.over ? pv ? pv.w : gs.moves : gs.moves
  };
  const tiles = gs.t.map((v, i) => {
    if (!v)
      return '<div class="ft-gap" aria-label="gap"></div>';
    const r = Math.floor(i / n), c = i % n, mv = !gs.over && (r === gr || c === gc);
    let sl = '';
    if (slid) {
      const pi = pv.t.indexOf(v);
      if (pi !== i)
        sl = ` style="--dx:${ pi % n - c };--dy:${ Math.floor(pi / n) - r }"`;
    }
    return `<button type="button" class="ft-t${ v === i + 1 ? ' ft-ok' : '' }${ mv ? ' ft-mv' : '' }${ sl ? ' ft-sl' : '' }" onclick="ftTap(${ i })" aria-label="tile ${ v }"${ sl }>${ v }</button>`;
  }).join('');
  el.innerHTML = `<div class="ft${ gs.over ? ' ft-over' : '' }${ won ? ' ft-won' : '' }" dir="ltr">
      <div class="g2-top"><span>Moves: <b>${ gs.moves }</b></span><span>Goal: 1 to ${ gs.t.length - 1 } in order</span></div>
      <div class="ft-box"><div class="ft-board" style="grid-template-columns:repeat(${ gs.n },1fr)">${ tiles }</div></div>
      <div class="cw-msg" role="status">${ gs.msg || 'Tap a tile next to the gap - or further along the same row or column.' }</div>
      <div class="gk-btns">${ GameKit.btn('Give up', 'ftGiveUp()') }</div>
    </div>
    <style>
      .ft{width:100%;box-sizing:border-box;max-width:26rem;margin:0 auto;color:#2b1b0d}
      .ft .g2-top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;font-size:1.15rem;font-weight:700;margin-bottom:10px;gap:8px}
      .ft .g2-top span:first-child{display:inline-flex;align-items:baseline;gap:.4em;padding:7px 14px;border-radius:10px;color:#fff4dc;text-shadow:0 -1px 0 rgba(40,20,5,.6);background:repeating-linear-gradient(93deg,rgba(0,0,0,0) 0 9px,rgba(0,0,0,.09) 9px 10px,rgba(0,0,0,0) 10px 17px,rgba(255,220,170,.06) 17px 19px),linear-gradient(180deg,#7d4c23 0%,#5a3415 100%);box-shadow:inset 0 1px 0 rgba(255,220,170,.4),inset 0 -2px 0 rgba(0,0,0,.3),0 2px 4px rgba(60,30,8,.3)}
      .ft .g2-top span:first-child b{font-size:1.35rem;font-weight:900;color:#ffe2a6}
      .ft-box{box-sizing:border-box;padding:clamp(10px,3.2vw,14px);border-radius:20px;background:repeating-linear-gradient(94deg,rgba(40,18,4,0) 0 11px,rgba(40,18,4,.16) 11px 12px,rgba(40,18,4,0) 12px 27px,rgba(255,220,170,.08) 27px 29px,rgba(40,18,4,0) 29px 41px,rgba(40,18,4,.1) 41px 43px),linear-gradient(150deg,#96622f 0%,#7a4a22 45%,#5c3615 100%);box-shadow:inset 0 2px 0 rgba(255,225,180,.4),inset 0 -4px 0 rgba(0,0,0,.35),0 12px 18px -8px rgba(60,30,8,.55)}
      .ft-board{display:grid;gap:6px;padding:8px;border-radius:12px;background:radial-gradient(rgba(255,255,255,.06) 1px,rgba(255,255,255,0) 1.3px) 0 0/5px 5px,radial-gradient(rgba(0,0,0,.18) 1px,rgba(0,0,0,0) 1.3px) 2px 3px/5px 5px,#25352b;box-shadow:inset 0 5px 9px rgba(0,0,0,.65),inset 0 0 0 2px rgba(0,0,0,.4),0 1px 0 rgba(255,225,180,.35)}
      .ft-t{position:relative;aspect-ratio:1;min-width:0;margin:0;padding:0;border:0;border-radius:10px;cursor:default;-webkit-tap-highlight-color:transparent;font:900 clamp(1.8rem,9vw,2.8rem)/1 Georgia,serif;color:#3a2208;text-shadow:0 1px 0 rgba(255,246,222,.75),0 -1px 0 rgba(60,30,5,.35);background:repeating-linear-gradient(92deg,rgba(120,70,20,0) 0 7px,rgba(120,70,20,.11) 7px 8px,rgba(120,70,20,0) 8px 13px,rgba(120,70,20,.07) 13px 15px,rgba(120,70,20,0) 15px 24px,rgba(255,250,235,.16) 24px 26px),radial-gradient(120% 70% at 30% 15%,rgba(255,255,255,.38),rgba(255,255,255,0) 60%),linear-gradient(180deg,#f6dfae 0%,#e9c98c 55%,#d8ae69 100%);box-shadow:inset 0 2px 0 rgba(255,250,235,.7),inset 0 -5px 0 rgba(95,55,15,.38),inset 0 0 0 1px rgba(95,55,15,.3),0 2px 3px rgba(0,0,0,.5);transition:transform .12s ease-out,box-shadow .12s ease-out}
      .ft-t.ft-ok{background:repeating-linear-gradient(92deg,rgba(70,90,20,0) 0 7px,rgba(70,90,20,.11) 7px 8px,rgba(70,90,20,0) 8px 13px,rgba(70,90,20,.07) 13px 15px,rgba(70,90,20,0) 15px 24px,rgba(255,255,240,.16) 24px 26px),radial-gradient(120% 70% at 30% 15%,rgba(255,255,255,.38),rgba(255,255,255,0) 60%),linear-gradient(180deg,#e9efcb 0%,#d3dea4 55%,#b9c97f 100%)}
      .ft-t.ft-ok::after{content:"";position:absolute;top:9%;right:9%;width:12%;height:12%;min-width:7px;min-height:7px;border-radius:50%;background:#2f6b2a;box-shadow:inset 0 1px 1px rgba(0,0,0,.4),0 1px 0 rgba(255,255,255,.6)}
      .ft-t.ft-mv{cursor:pointer;box-shadow:inset 0 2px 0 rgba(255,250,235,.7),inset 0 -5px 0 rgba(95,55,15,.38),inset 0 0 0 1px rgba(95,55,15,.3),0 0 0 2px rgba(255,214,130,.85),0 4px 6px rgba(0,0,0,.55)}
      @media (hover:hover){.ft-t.ft-mv:hover{transform:translateY(-3px);box-shadow:inset 0 2px 0 rgba(255,250,235,.7),inset 0 -5px 0 rgba(95,55,15,.38),inset 0 0 0 1px rgba(95,55,15,.3),0 0 0 3px rgba(255,214,130,1),0 8px 10px rgba(0,0,0,.55)}}
      .ft-t.ft-mv:active{transform:translateY(1px)}
      .ft-t:focus-visible{outline:3px solid #fff;outline-offset:1px;box-shadow:0 0 0 6px #1d4ed8}
      .ft-t.ft-sl{animation:ft-slide .16s ease-out}
      .ft-gap{aspect-ratio:1;min-width:0;border-radius:10px;background:rgba(0,0,0,.22);box-shadow:inset 0 4px 9px rgba(0,0,0,.6),inset 0 -1px 0 rgba(255,255,255,.06)}
      .ft-won .ft-box{animation:ft-glow 2.4s ease-in-out infinite alternate}
      .ft-won .ft-t,.ft-won .ft-t.ft-ok{background:repeating-linear-gradient(92deg,rgba(130,80,10,0) 0 7px,rgba(130,80,10,.11) 7px 8px,rgba(130,80,10,0) 8px 13px,rgba(130,80,10,.07) 13px 15px,rgba(130,80,10,0) 15px 24px,rgba(255,255,240,.18) 24px 26px),radial-gradient(120% 70% at 30% 15%,rgba(255,255,255,.45),rgba(255,255,255,0) 60%),linear-gradient(180deg,#fdeab0 0%,#f6cf74 55%,#e6b24a 100%)}
      .ft .gk-btn{border-color:#c9a46a}
      .ft .cw-msg{text-align:center;font-weight:700;font-size:1.05rem;margin:12px 0 10px;min-height:1.5em}
      @keyframes ft-slide{from{transform:translate(calc(var(--dx,0)*(100% + 6px)),calc(var(--dy,0)*(100% + 6px)))}to{transform:none}}
      @keyframes ft-glow{from{box-shadow:inset 0 2px 0 rgba(255,225,180,.4),inset 0 -4px 0 rgba(0,0,0,.35),0 0 0 3px rgba(245,180,60,.4),0 0 14px rgba(245,170,50,.35)}to{box-shadow:inset 0 2px 0 rgba(255,225,180,.4),inset 0 -4px 0 rgba(0,0,0,.35),0 0 0 5px rgba(245,180,60,.7),0 0 36px rgba(245,170,50,.7)}}
      @media (prefers-reduced-motion:reduce){.ft-t{transition:none}.ft-t.ft-sl{animation:none}.ft-t.ft-mv:hover,.ft-t.ft-mv:active{transform:none}.ft-won .ft-box{animation:none;box-shadow:inset 0 2px 0 rgba(255,225,180,.4),inset 0 -4px 0 rgba(0,0,0,.35),0 0 0 4px rgba(245,180,60,.6),0 0 24px rgba(245,170,50,.5)}}
    </style>`;
}