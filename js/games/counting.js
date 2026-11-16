const _CNT_EMOJIS = [
  '\uD83C\uDF4E',
  '\uD83C\uDF38',
  '\u2B50',
  '\uD83D\uDC1F',
  '\uD83C\uDF40',
  '\uD83C\uDF88',
  '\uD83D\uDC26',
  '\uD83C\uDF47'
];
const _CNT_SECS = {
  easy: 20,
  normal: 14,
  hard: 10
};
const _CNT_ART = {
  '\uD83C\uDF4E': 'apple',
  '\u2B50': 'key',
  '\uD83D\uDC1F': 'cup',
  '\uD83C\uDF40': 'leaf'
};
const _cntSym = (e, o) => {
  o = o || {};
  const a = _cntSym.art[e];
  const pic = a ? `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${ a.d }</svg>` : Icon.sym(e, o);
  if (o.cls) {
    const he = false;
    return `<span class="cnt-it ${ o.cls }"${ a ? ` role="img" aria-label="${ a.en }"` : '' }>${ pic }</span>`;
  }
  const i = o.i || 0, k = o.k || 0;
  const r = (i * 37 + k * 17) % 29 - 14, dx = (i * 53 + k * 5 + 7) % 7 - 3, dy = (i * 29 + k * 11 + 3) % 7 - 3;
  return `<span class="cnt-it${ o.t ? ' cnt-t' : '' }" style="transform:translate(${ dx }px,${ dy }px) rotate(${ r }deg)">${ pic }</span>`;
};
_cntSym.art = {
  '\uD83C\uDF4E': {
    en: 'apples',
    d: '<path d="M24 15c-5-4-15-2-15 9 0 9 6 18 11 18 2 0 2.5-1 4-1s2 1 4 1c5 0 11-9 11-18 0-11-10-13-15-9z" fill="#d8392b" stroke="#8f1d14" stroke-width="1.6" stroke-linejoin="round"/><path d="M24 15c0-4 1-7 3-9" stroke="#5b3a1a" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M27.500 9.500c3-4.500 8-4.500 10.500-3-1.500 4.500-6 6-10.500 3z" fill="#4c9a3a" stroke="#2c6a22" stroke-width="1"/><ellipse cx="16" cy="23" rx="2.6" ry="5" fill="#fff" opacity=".4" transform="rotate(20 16 23)"/>'
  },
  '\uD83C\uDF38': {
    en: 'flowers',
    d: '<g fill="#f29bbd" stroke="#c9517f" stroke-width="1.5"><circle cx="24" cy="12.500" r="8.500"/><circle cx="35" cy="20.500" r="8.500"/><circle cx="30.800" cy="33.300" r="8.500"/><circle cx="17.200" cy="33.300" r="8.500"/><circle cx="13" cy="20.500" r="8.500"/></g><circle cx="24" cy="24" r="8" fill="#f29bbd"/><circle cx="24" cy="24" r="5.500" fill="#f6c445" stroke="#b98200" stroke-width="1.4"/>'
  },
  '\u2B50': {
    en: 'stars',
    d: '<polygon points="24,5 29.3,17.7 43,18.8 32.600,27.800 35.800,41.200 24,34 12.200,41.200 15.400,27.800 5,18.800 18.700,17.700" fill="#f4c20d" stroke="#a87400" stroke-width="1.8" stroke-linejoin="round"/><path d="M24 11l3 8.500 8.500 .7" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>'
  },
  '\uD83D\uDC1F': {
    en: 'fish',
    d: '<path d="M34 24l11-9.500v19z" fill="#1f5fa8" stroke="#153f73" stroke-width="1.5" stroke-linejoin="round"/><path d="M19 15.500c3-5.500 9-5.500 11-3l-4 4.500z" fill="#1f5fa8" stroke="#153f73" stroke-width="1.2" stroke-linejoin="round"/><ellipse cx="21.500" cy="24" rx="16" ry="10" fill="#3585d6" stroke="#153f73" stroke-width="1.6"/><path d="M9 28c6 4.500 18 4.500 25 0" fill="none" stroke="#bfe0ff" stroke-width="2" stroke-linecap="round" opacity=".7"/><circle cx="13" cy="21" r="2.800" fill="#fff"/><circle cx="12.600" cy="21" r="1.400" fill="#10243d"/><path d="M21 18c2 3.500 2 8 0 11.500" fill="none" stroke="#153f73" stroke-width="1.3" stroke-linecap="round"/>'
  },
  '\uD83C\uDF40': {
    en: 'clovers',
    d: '<path d="M24 24c2 8 4 14 9 19" fill="none" stroke="#1f6f34" stroke-width="3" stroke-linecap="round"/><g fill="#2f9e4f" stroke="#17642c" stroke-width="1.5"><circle cx="16" cy="15" r="9"/><circle cx="32" cy="15" r="9"/><circle cx="16" cy="30" r="9"/><circle cx="32" cy="30" r="9"/></g><circle cx="24" cy="22.500" r="6" fill="#2f9e4f"/><g stroke="#17642c" stroke-width="1.3" stroke-linecap="round"><path d="M24 22.500L17 16"/><path d="M24 22.500l7-6.500"/><path d="M24 22.500L17 29"/><path d="M24 22.500l7 6.500"/></g>'
  },
  '\uD83C\uDF88': {
    en: 'balloons',
    d: '<path d="M24 37c-3 3 3 5 0 10" fill="none" stroke="#7a5a3a" stroke-width="1.8" stroke-linecap="round"/><path d="M20.500 37.500h7L24 33z" fill="#c95f0c" stroke="#8f3f05" stroke-width="1" stroke-linejoin="round"/><ellipse cx="24" cy="19" rx="13.500" ry="16" fill="#f2811d" stroke="#8f3f05" stroke-width="1.6"/><ellipse cx="18" cy="13" rx="3" ry="5.500" fill="#fff" opacity=".45" transform="rotate(24 18 13)"/>'
  },
  '\uD83D\uDC26': {
    en: 'birds',
    d: '<path d="M12 24L2 18l3 12z" fill="#6b4425" stroke="#3f2613" stroke-width="1.3" stroke-linejoin="round"/><path d="M42 14.500l5.500 2.500-5.500 2.500z" fill="#e2a020" stroke="#8a5a12" stroke-width="1" stroke-linejoin="round"/><g stroke="#3f2613" stroke-width="1.6" stroke-linecap="round"><path d="M21 37v6"/><path d="M28 37v6"/></g><ellipse cx="23" cy="27" rx="14" ry="11" fill="#8f5d35" stroke="#3f2613" stroke-width="1.6"/><circle cx="35" cy="17" r="8.500" fill="#8f5d35" stroke="#3f2613" stroke-width="1.6"/><ellipse cx="27" cy="31" rx="8" ry="5.500" fill="#ecd3ad"/><path d="M12 25c5-5 12-4 15 1-4 4-10 4-15-1z" fill="#5f3c1f" stroke="#3f2613" stroke-width="1.2" stroke-linejoin="round"/><circle cx="37" cy="15.500" r="1.700" fill="#1c1008"/>'
  },
  '\uD83C\uDF47': {
    en: 'bunches of grapes',
    d: '<path d="M24 12V5" stroke="#5b3a1a" stroke-width="2.600" stroke-linecap="round"/><path d="M25 8c3-4 8-4 11-2-2 4-7 5-11 2z" fill="#4c9a3a" stroke="#2c6a22" stroke-width="1"/><g fill="#8246ad" stroke="#4d2070" stroke-width="1.5"><circle cx="13.500" cy="17.500" r="6"/><circle cx="24" cy="17.500" r="6"/><circle cx="34.500" cy="17.500" r="6"/><circle cx="18.700" cy="27" r="6"/><circle cx="29.300" cy="27" r="6"/><circle cx="24" cy="36.500" r="6"/></g><g fill="#fff" opacity=".45"><circle cx="11.500" cy="15.500" r="1.500"/><circle cx="22" cy="15.500" r="1.500"/><circle cx="32.500" cy="15.500" r="1.500"/><circle cx="16.700" cy="25" r="1.500"/><circle cx="27.300" cy="25" r="1.500"/><circle cx="22" cy="34.500" r="1.500"/></g>'
  }
};
function initCounting(container) {
  const gs = gameState.counting;
  const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  gs._sq = typeof Levels !== 'undefined' ? Levels.count('counting', _d === 'easy' ? 5 : _d === 'hard' ? 9 : 7, 0.5, 14) : 7;
  gs._si = 0;
  gs._ss = 0;
  gs._pts = 0;
  gs._times = [];
  gs._secs = _CNT_SECS[_d] || 14;
  const prev = window._gameCleanup;
  window._gameCleanup = () => {
    clearInterval(gs._tick);
    if (prev)
      prev();
  };
  _cntNext(container);
}
function _cntNext(container) {
  const gs = gameState.counting;
  clearInterval(gs._tick);
  if (!gameState.active || gameState.currentId !== 'counting')
    return;
  gs._locked = false;
  if (gs._si >= gs._sq) {
    const n = gs._sq, avg = gs._times.length ? gs._times.reduce((a, b) => a + b, 0) / gs._times.length : 0;
    const isHe = false;
    const txt = `${ gs._ss } of ${ n } right · ${ gs._pts } points · ${ avg.toFixed(1) } s per answer on average`;
    gs._sessionScore = {
      correct: gs._ss,
      total: n
    };
    return GameKit.finish('counting', gs._ss / n >= PASS_RATIO, txt);
  }
  const isHe = false;
  const lvl = gs.level || 1;
  const gridSize = Math.min(48, 16 + lvl * 3);
  const nKinds = Math.min(_CNT_EMOJIS.length, 3 + Math.floor(lvl / 3));
  const kinds = shuffle([..._CNT_EMOJIS]).slice(0, nKinds);
  const target = kinds[0];
  const targetCount = 3 + Math.floor(Math.random() * Math.min(9, 3 + lvl));
  const cells = [];
  for (let i = 0; i < targetCount; i++)
    cells.push(target);
  while (cells.length < gridSize) {
    cells.push(kinds[1 + Math.floor(Math.random() * (nKinds - 1))]);
  }
  gs._answer = targetCount;
  const opts = new Set([targetCount]);
  while (opts.size < 4) {
    const d = targetCount + Math.ceil(Math.random() * 3) * (Math.random() < 0.5 ? -1 : 1);
    if (d > 0)
      opts.add(d);
  }
  let pips = '';
  for (let i = 0; i < gs._sq; i++)
    pips += `<i class="${ i < gs._si ? 'done' : i === gs._si ? 'now' : '' }"></i>`;
  let html = `<div class="cntx max-w-2xl w-full text-center${ gridSize > 30 ? ' cnt-many' : '' }">
      <div class="cnt-head"><span>${ gt('Round') } ${ gs._si + 1 }/${ gs._sq }</span><span class="cnt-pts">${ gt('Points') }: ${ gs._pts }</span><span class="text-green-600">✓ ${ gs._ss }</span></div>
      <div class="cnt-pips" aria-hidden="true">${ pips }</div>
      <div class="cnt-timer" role="timer" aria-live="off"><div class="cnt-bar" id="cnt-bar"></div><span id="cnt-sec">${ gs._secs }</span></div>
      <p class="cnt-ask">${ `How many ${ _cntSym(target, { cls: 'cnt-q' }) } do you see?` }</p>
      <div class="cnt-field"><div class="cnt-cloth">${ shuffle(cells).map((e, i) => _cntSym(e, {
    i: i,
    k: gs._si,
    t: e === target
  })).join('') }</div></div>
      <div class="cnt-plaques">`;
  shuffle([...opts]).forEach(o => {
    html += `<button onclick="_cntAnswer(this,${ o })" data-v="${ o }" class="cnt-plaque border-gray-200">${ o }</button>`;
  });
  container.innerHTML = html + `</div></div>
    <style>
    .cntx{--s:clamp(38px,11vw,52px);box-sizing:border-box;text-align:center;margin-inline:auto;padding:14px 12px 18px;border-radius:22px;background:linear-gradient(#fdf7e9,#f6ead0);border:2px solid #e0c998;color:#3b2412;box-shadow:0 6px 18px rgba(90,60,20,.12)}
    .cntx.cnt-many{--s:clamp(32px,9.2vw,44px)}
    .cntx *{box-sizing:border-box}
    .cntx .cnt-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:4px 12px;font-size:1.3rem;font-weight:800;line-height:1.3;color:#5b3a1a;margin:0 2px 8px}
    .cntx .cnt-pts{color:#8a4b08}
    .cntx .text-green-600{color:#166534}
    .cntx .cnt-pips{display:flex;justify-content:center;gap:6px;margin:0 0 12px}
    .cntx .cnt-pips i{width:11px;height:11px;border-radius:50%;background:#eddfbf;border:1.5px solid #c9a46a}
    .cntx .cnt-pips i.done{background:#c98a1e;border-color:#8a5a12}
    .cntx .cnt-pips i.now{background:#fffaf0;border-color:#8a5a12;box-shadow:0 0 0 3px #f6d98a}
    .cntx .cnt-timer{position:relative;display:flex;align-items:center;justify-content:center;height:46px;border-radius:999px;background:#f1e4c6;border:2px solid #b98a4a;overflow:hidden;margin:0 0 14px;box-shadow:inset 0 2px 5px rgba(90,60,20,.2)}
    .cntx .cnt-bar{position:absolute;top:0;bottom:0;left:auto;right:auto;inset-inline-start:0;width:100%;background:repeating-linear-gradient(115deg,rgba(255,255,255,.24) 0 10px,rgba(255,255,255,0) 10px 20px),linear-gradient(#f7c948,#e0a019);transition:width .25s linear}
    .cntx .cnt-bar.cnt-low{background:repeating-linear-gradient(115deg,rgba(255,255,255,.2) 0 10px,rgba(255,255,255,0) 10px 20px),linear-gradient(#e89257,#c9642a)}
    .cntx #cnt-sec{position:relative;min-width:60px;padding:0 14px;font-weight:900;font-size:1.4rem;line-height:32px;color:#2b1a0e;background:#fffaf0;border:2px solid #8a5a2b;border-radius:999px;font-variant-numeric:tabular-nums;box-shadow:0 1px 3px rgba(60,35,10,.25)}
    .cntx .cnt-timer:has(.cnt-low) #cnt-sec{border-color:#b4501e;animation:cntPulse 1s ease-in-out infinite}
    .cntx.cnt-up #cnt-sec,.cntx.cnt-ok #cnt-sec,.cntx.cnt-no #cnt-sec{animation:none}
    @keyframes cntPulse{50%{transform:scale(1.07)}}
    .cntx .cnt-ask{font-size:1.5rem;font-weight:800;line-height:1.5;color:#3b2412;margin:0 0 12px}
    .cntx .cnt-it{display:inline-block;width:var(--s);height:var(--s);flex:none;transition:opacity .35s ease}
    .cntx .cnt-it svg{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 2px 1.5px rgba(60,35,10,.32));transition:filter .25s ease}
    .cntx .cnt-it.cnt-q{width:1.9em;height:1.9em;vertical-align:middle;margin:0 .2em;padding:.15em;border-radius:12px;background:#fffaf0;border:2px solid #d8c08c}
    .cntx .cnt-field{padding:10px;border-radius:20px;margin:0 0 18px;background:repeating-linear-gradient(90deg,rgba(60,30,10,.13) 0 2px,rgba(60,30,10,0) 2px 46px),linear-gradient(180deg,#bb8650,#a06a36);border:3px solid #7a4d22;box-shadow:inset 0 0 0 2px rgba(255,220,160,.28),0 4px 10px rgba(60,35,10,.25);transition:border-color .4s ease}
    .cntx:has(.cnt-low) .cnt-field{border-color:#b4501e}
    .cntx .cnt-cloth{display:flex;flex-wrap:wrap;justify-content:center;align-content:center;gap:6px 7px;min-height:150px;padding:16px 10px;border-radius:14px;background:radial-gradient(circle at 30% 20%,#fffdf5,#f8eed6);outline:2px dashed #d3b987;outline-offset:-7px;box-shadow:0 2px 6px rgba(60,35,10,.3);transition:filter .35s ease}
    .cntx.cnt-ok .cnt-it.cnt-t svg,.cntx.cnt-up .cnt-it.cnt-t svg{filter:drop-shadow(0 0 2px #e0a019) drop-shadow(0 0 6px #f6c445)}
    .cntx.cnt-up .cnt-cloth .cnt-it:not(.cnt-t){opacity:.25}
    .cntx.cnt-no .cnt-cloth{filter:saturate(.55) brightness(.97)}
    .cntx .cnt-plaques{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
    .cntx .cnt-plaque{position:relative;min-height:68px;margin:0;padding:8px 4px;border-radius:14px;border:3px solid #7a4d22;background:radial-gradient(circle at 9px 9px,#6b411b 0 2.5px,rgba(0,0,0,0) 3.2px),radial-gradient(circle at calc(100% - 9px) 9px,#6b411b 0 2.5px,rgba(0,0,0,0) 3.2px),repeating-linear-gradient(4deg,rgba(120,75,30,.13) 0 2px,rgba(120,75,30,0) 2px 9px),linear-gradient(#f6dfae,#e3bd7c);color:#2b1a0e;font-family:inherit;font-size:2rem;font-weight:900;line-height:1;cursor:pointer;box-shadow:0 4px 0 #6b411b,0 8px 10px rgba(60,35,10,.25);text-shadow:0 1px 0 rgba(255,244,214,.8);transition:transform .15s ease,box-shadow .25s ease,opacity .3s ease,filter .3s ease;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
    .cntx .cnt-plaque:focus-visible{outline:4px solid #1d4ed8;outline-offset:3px}
    .cntx .cnt-plaque:active{transform:translateY(3px);box-shadow:0 1px 0 #6b411b,0 3px 6px rgba(60,35,10,.25)}
    @media (hover:hover){.cntx .cnt-plaque:hover{border-color:#b7791f;transform:translateY(-2px)}}
    .cntx .cnt-plaque.bg-green-50{border-color:#a87400;background:linear-gradient(#fff0b0,#f6c445);transform:none;box-shadow:0 0 0 4px rgba(246,196,69,.6),0 0 26px 7px rgba(246,196,69,.8)}
    .cntx .cnt-plaque.bg-green-50::after{content:'✓';position:absolute;top:-10px;inset-inline-end:-6px;width:28px;height:28px;border-radius:50%;background:#166534;color:#fff;font-size:1.1rem;line-height:28px;text-shadow:none;box-shadow:0 0 0 2px #fff7dc}
    .cntx .cnt-plaque.bg-red-50{border-color:#9a8468;border-style:dashed;opacity:.5;filter:grayscale(.6);transform:translateY(3px);box-shadow:none}
    .cntx.cnt-ok .cnt-plaque,.cntx.cnt-no .cnt-plaque,.cntx.cnt-up .cnt-plaque{cursor:default}
    @media (prefers-reduced-motion:reduce){.cntx *,.cntx *::after{transition:none!important;animation:none!important}}
    </style>`;
  gs._t0 = Date.now();
  gs._tick = setInterval(() => {
    if (!gameState.active || gameState.currentId !== 'counting' || gs._locked) {
      clearInterval(gs._tick);
      return;
    }
    const left = Math.max(0, gs._secs - (Date.now() - gs._t0) / 1000);
    const bar = document.getElementById('cnt-bar'), sec = document.getElementById('cnt-sec');
    if (bar) {
      bar.style.width = left / gs._secs * 100 + '%';
      bar.classList.toggle('cnt-low', left <= gs._secs * 0.3);
    }
    if (sec)
      sec.textContent = Math.ceil(left);
    if (left <= 0)
      _cntTimeUp();
  }, 250);
}
function _cntTimeUp() {
  const gs = gameState.counting;
  if (gs._locked)
    return;
  gs._locked = true;
  clearInterval(gs._tick);
  sfxWrong();
  gs._times.push(gs._secs);
  const right = document.querySelector(`#gameContent [data-v="${ gs._answer }"]`);
  if (right) {
    right.classList.replace('border-gray-200', 'border-green-500');
    right.classList.add('bg-green-50');
  }
  const sec = document.getElementById('cnt-sec');
  if (sec)
    sec.textContent = gt('Time\'s up!');
  {
    const _r = document.querySelector('#gameContent .cntx');
    if (_r)
      _r.classList.add('cnt-up');
  }
  gs._si++;
  setTimeout(() => _cntNext(document.getElementById('gameContent')), 1400);
}
function _cntAnswer(btn, val) {
  const gs = gameState.counting;
  if (gs._locked)
    return;
  gs._locked = true;
  clearInterval(gs._tick);
  const took = Math.min(gs._secs, (Date.now() - gs._t0) / 1000);
  gs._times.push(took);
  const isC = val === gs._answer;
  if (isC) {
    sfxCorrect();
    gs._ss++;
    gs._pts += 100 + Math.round(Math.max(0, gs._secs - took)) * 10;
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
    const _r = document.querySelector('#gameContent .cntx');
    if (_r)
      _r.classList.add(isC ? 'cnt-ok' : 'cnt-no');
  }
  gs._si++;
  setTimeout(() => _cntNext(document.getElementById('gameContent')), isC ? 450 : 1100);
}