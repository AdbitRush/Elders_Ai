function initClock(container) {
  const gs = gameState.clock;
  const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  gs._sq = typeof Levels !== 'undefined' ? Levels.count('clock', _d === 'easy' ? 5 : _d === 'hard' ? 10 : 7, 0.5, 15) : 7;
  gs._si = 0;
  gs._ss = 0;
  _clkNext(container);
}
function _clkFmt(h, m) {
  return `${ h }:${ String(m).padStart(2, '0') }`;
}
function _clkSvg(h, m) {
  const hDeg = h % 12 * 30 + m * 0.5, mDeg = m * 6;
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0)
      continue;
    const a = i * 6 * Math.PI / 180;
    ticks += `<line x1="${ 100 + 86.5 * Math.sin(a) }" y1="${ 100 - 86.5 * Math.cos(a) }" x2="${ 100 + 90 * Math.sin(a) }" y2="${ 100 - 90 * Math.cos(a) }" stroke="#7a5a3a" stroke-width="1.2"/>`;
  }
  for (let i = 0; i < 12; i++) {
    const a = i * 30 * Math.PI / 180;
    ticks += `<line x1="${ 100 + 82 * Math.sin(a) }" y1="${ 100 - 82 * Math.cos(a) }" x2="${ 100 + 90 * Math.sin(a) }" y2="${ 100 - 90 * Math.cos(a) }" stroke="#2b1a0e" stroke-width="${ i % 3 === 0 ? 5 : 3 }" stroke-linecap="round"/>`;
    const n = i === 0 ? 12 : i;
    ticks += `<text x="${ 100 + 68 * Math.sin(a) }" y="${ 100 - 68 * Math.cos(a) + 7 }" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="20" font-weight="bold" fill="#2b1a0e">${ n }</text>`;
  }
  return `<svg viewBox="-22 -32 244 254" class="clk-face w-56 h-56 md:w-64 md:h-64 mx-auto" role="img" aria-label="${ gt('Analog clock') }">
      <defs>
        <linearGradient id="clkWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a8703c"/><stop offset=".45" stop-color="#7d4d24"/><stop offset="1" stop-color="#5a3415"/></linearGradient>
        <linearGradient id="clkBrass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e3a1"/><stop offset=".5" stop-color="#c9982f"/><stop offset="1" stop-color="#8f6a16"/></linearGradient>
        <radialGradient id="clkFace" cx=".42" cy=".36" r=".8"><stop offset="0" stop-color="#fffdf6"/><stop offset=".75" stop-color="#fbf2dc"/><stop offset="1" stop-color="#eedfbd"/></radialGradient>
      </defs>
      <path d="M100 -24L84 -3h32z" fill="none" stroke="#5a3415" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="100" cy="-25" r="4.500" fill="url(#clkBrass)" stroke="#6b4a12" stroke-width="1"/>
      <circle cx="100" cy="100" r="109" fill="none" stroke="url(#clkWood)" stroke-width="20"/>
      <g fill="none" stroke="#3f2410" stroke-opacity=".28" stroke-width="1"><circle cx="100" cy="100" r="114"/><circle cx="100" cy="100" r="108.500"/><circle cx="100" cy="100" r="104"/></g>
      <circle cx="100" cy="100" r="118.500" fill="none" stroke="#3f2410" stroke-width="1.5"/>
      <circle cx="100" cy="100" r="96" fill="url(#clkFace)"/>
      <circle class="clk-rim" cx="100" cy="100" r="97.500" fill="none" stroke="url(#clkBrass)" stroke-width="5"/>
      <circle cx="100" cy="100" r="94.500" fill="none" stroke="#6b4a12" stroke-opacity=".5" stroke-width="1"/>${ ticks }
      <g class="clk-hh" transform="rotate(${ hDeg } 100 100)"><path d="M96 100L97.300 62 100 55l2.700 7L104 100z" fill="#2b1a0e" stroke="#120a04" stroke-width=".8" stroke-linejoin="round"/></g>
      <g class="clk-mh" transform="rotate(${ mDeg } 100 100)"><path d="M97.500 100L98.600 39 100 32l1.400 7L102.500 100z" fill="#a35f0e" stroke="#5d3506" stroke-width=".8" stroke-linejoin="round"/></g>
      <circle cx="100" cy="100" r="7" fill="#2b1a0e"/><circle cx="100" cy="100" r="2.800" fill="url(#clkBrass)"/></svg>`;
}
function _clkNext(container) {
  if (!gameState.active || gameState.currentId !== 'clock')
    return;
  const gs = gameState.clock;
  gs._locked = false;
  if (gs._si >= gs._sq) {
    gs._sessionScore = {
      correct: gs._ss,
      total: gs._sq
    };
    levelComplete();
    return;
  }
  const isHe = false;
  const lvl = gs.level || 1;
  const step = lvl < 5 ? 15 : lvl < 10 ? 5 : 1;
  const h = 1 + Math.floor(Math.random() * 12);
  const m = Math.floor(Math.random() * (60 / step)) * step;
  gs._answer = _clkFmt(h, m);
  const opts = new Set([gs._answer]);
  while (opts.size < 4) {
    const dh = Math.random() < 0.5 ? h : 1 + Math.floor(Math.random() * 12);
    const dm = Math.floor(Math.random() * (60 / step)) * step;
    opts.add(_clkFmt(dh, dm));
  }
  let pips = '';
  for (let i = 0; i < gs._sq; i++)
    pips += `<i class="${ i < gs._si ? 'done' : i === gs._si ? 'now' : '' }"></i>`;
  let html = `<div class="clkx max-w-xl w-full text-center">
      <div class="clk-head"><span>${ gt('Clock') } ${ gs._si + 1 }/${ gs._sq }</span><span class="text-green-600">✓ ${ gs._ss }</span></div>
      <div class="clk-pips" aria-hidden="true">${ pips }</div>
      <p class="clk-ask">${ gt('What time is it?') }</p>
      <div class="clk-wall">${ _clkSvg(h, m) }</div>
      <div class="clk-plaques" dir="ltr">`;
  shuffle([...opts]).forEach(o => {
    html += `<button onclick="_clkAnswer(this,'${ o }')" class="clk-plaque border-gray-200">${ o }</button>`;
  });
  container.innerHTML = html + `</div></div>
    <style>
    .clkx{box-sizing:border-box;text-align:center;margin-inline:auto;padding:14px 12px 18px;border-radius:22px;background:linear-gradient(#fdf7e9,#f6ead0);border:2px solid #e0c998;color:#3b2412;box-shadow:0 6px 18px rgba(90,60,20,.12)}
    .clkx *{box-sizing:border-box}
    .clkx .clk-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:4px 12px;font-size:1.3rem;font-weight:800;line-height:1.3;color:#5b3a1a;margin:0 2px 8px}
    .clkx .text-green-600{color:#166534}
    .clkx .clk-pips{display:flex;justify-content:center;gap:6px;margin:0 0 10px}
    .clkx .clk-pips i{width:11px;height:11px;border-radius:50%;background:#eddfbf;border:1.5px solid #c9a46a}
    .clkx .clk-pips i.done{background:#c98a1e;border-color:#8a5a12}
    .clkx .clk-pips i.now{background:#fffaf0;border-color:#8a5a12;box-shadow:0 0 0 3px #f6d98a}
    .clkx .clk-ask{font-size:1.5rem;font-weight:800;line-height:1.4;color:#3b2412;margin:0 0 12px}
    .clkx .clk-wall{position:relative;overflow:hidden;padding:12px 0 30px;border-radius:20px;margin:0 0 18px;background:repeating-linear-gradient(90deg,rgba(120,140,100,.10) 0 18px,rgba(120,140,100,0) 18px 36px),linear-gradient(#f3eedb,#e9e2c6);border:2px solid #d6c59b;box-shadow:inset 0 0 26px rgba(120,90,40,.14)}
    .clkx .clk-wall::after{content:'';position:absolute;left:0;right:0;bottom:0;height:16px;background:repeating-linear-gradient(90deg,rgba(60,30,10,.16) 0 2px,rgba(60,30,10,0) 2px 54px),linear-gradient(#b17a44,#8f5d2e);border-top:2px solid #6b411b}
    .clkx .clk-face{display:block;margin:0 auto;width:min(72vw,300px);height:auto;filter:drop-shadow(0 8px 7px rgba(60,35,10,.32));transition:filter .35s ease,opacity .35s ease}
    .clkx .clk-rim{transition:stroke .3s ease}
    .clkx.clk-ok .clk-rim{stroke:#8fc93f}
    .clkx.clk-ok .clk-face{filter:drop-shadow(0 0 10px rgba(214,190,60,.95)) drop-shadow(0 8px 7px rgba(60,35,10,.3))}
    .clkx.clk-no .clk-face{opacity:.8;filter:saturate(.55) drop-shadow(0 8px 7px rgba(60,35,10,.25))}
    .clkx .clk-plaques{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 12px}
    .clkx .clk-plaque{position:relative;min-height:70px;margin:0;padding:10px 6px;border-radius:14px;border:3px solid #3a2210;background:radial-gradient(circle at 50% 0,rgba(255,220,170,.22),rgba(255,220,170,0) 70%),linear-gradient(#734a2c,#57351d);color:#fff6e0;font-family:inherit;font-size:2rem;font-weight:900;line-height:1;letter-spacing:.02em;font-variant-numeric:tabular-nums;cursor:pointer;outline:2px dashed rgba(255,232,186,.55);outline-offset:-9px;box-shadow:0 4px 0 #2f1b0c,0 8px 10px rgba(60,35,10,.28);text-shadow:0 2px 0 rgba(30,15,5,.6);transition:transform .15s ease,box-shadow .25s ease,opacity .3s ease,filter .3s ease,background-color .25s ease;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
    .clkx .clk-plaque:focus-visible{outline:4px solid #1d4ed8;outline-offset:3px}
    .clkx .clk-plaque:active{transform:translateY(3px);box-shadow:0 1px 0 #2f1b0c,0 3px 6px rgba(60,35,10,.28)}
    @media (hover:hover){.clkx .clk-plaque:hover{border-color:#b7791f;transform:translateY(-2px)}}
    .clkx .clk-plaque.bg-green-50{border-color:#e6b93a;background:linear-gradient(#2f8a4a,#1c6936);color:#fffbe8;outline-color:rgba(255,236,160,.8);transform:none;box-shadow:0 0 0 4px rgba(230,185,58,.65),0 0 26px 7px rgba(190,205,70,.8)}
    .clkx .clk-plaque.bg-green-50::after{content:'✓';position:absolute;top:-10px;right:-6px;width:28px;height:28px;border-radius:50%;background:#f6c445;color:#1c4a22;font-size:1.1rem;line-height:28px;text-shadow:none;box-shadow:0 0 0 2px #fff7dc}
    .clkx .clk-plaque.bg-red-50{border-color:#6f5a48;opacity:.5;filter:grayscale(.6);transform:translateY(3px);box-shadow:none}
    .clkx.clk-ok .clk-plaque,.clkx.clk-no .clk-plaque{cursor:default}
    @media (prefers-reduced-motion:reduce){.clkx *,.clkx *::after{transition:none!important;animation:none!important}}
    </style>`;
}
function _clkAnswer(btn, val) {
  const gs = gameState.clock;
  if (gs._locked)
    return;
  gs._locked = true;
  const isC = val === gs._answer;
  if (isC) {
    sfxCorrect();
    gs._ss++;
  } else
    sfxWrong();
  {
    const _c = document.querySelector('#gameContent .text-green-600');
    if (_c)
      _c.textContent = '\u2713 ' + gs._ss;
  }
  btn.classList.replace('border-gray-200', isC ? 'border-green-500' : 'border-red-500');
  btn.classList.add(isC ? 'bg-green-50' : 'bg-red-50');
  {
    const _r = document.querySelector('#gameContent .clkx');
    if (_r)
      _r.classList.add(isC ? 'clk-ok' : 'clk-no');
  }
  gs._si++;
  setTimeout(() => _clkNext(document.getElementById('gameContent')), isC ? 450 : 1000);
}