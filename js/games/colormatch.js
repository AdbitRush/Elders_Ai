const _CM_COLORS = [
  {
    id: 'red',
    en: 'Red',
    hex: '#ef4444'
  },
  {
    id: 'blue',
    en: 'Blue',
    hex: '#3b82f6'
  },
  {
    id: 'green',
    en: 'Green',
    hex: '#22c55e'
  },
  {
    id: 'yellow',
    en: 'Yellow',
    hex: '#eab308'
  },
  {
    id: 'purple',
    en: 'Purple',
    hex: '#a855f7'
  },
  {
    id: 'orange',
    en: 'Orange',
    hex: '#f97316'
  }
];
function initColorMatch(container) {
  const gs = gameState.colormatch;
  const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  gs._sq = typeof Levels !== 'undefined' ? Levels.count('colormatch', _d === 'easy' ? 6 : _d === 'hard' ? 10 : 8, 0.5, 20) : 8;
  gs._si = 0;
  gs._ss = 0;
  _cmNext(container);
}
function _cmNext(container) {
  if (!gameState.active || gameState.currentId !== 'colormatch')
    return;
  const gs = gameState.colormatch;
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
  const nColors = Math.min(_CM_COLORS.length, 4 + Math.floor(((gs.level || 1) - 1) / 4));
  const palette = shuffle([..._CM_COLORS]).slice(0, nColors);
  const word = palette[Math.floor(Math.random() * palette.length)];
  let ink = palette[Math.floor(Math.random() * palette.length)];
  if ((gs.level || 1) > 1 && Math.random() < 0.8) {
    const others = palette.filter(c => c.id !== word.id);
    ink = others[Math.floor(Math.random() * others.length)];
  }
  gs._answer = ink.id;
  const wood = `repeating-linear-gradient(90deg,rgba(120,72,24,.09) 0 1px,rgba(0,0,0,0) 1px 8px,rgba(120,72,24,.05) 8px 10px,rgba(0,0,0,0) 10px 19px),linear-gradient(180deg,#f3d9a8 0%,#dcb779 100%)`;
  const css = `
.bp-cm{box-sizing:border-box;margin:0 auto;text-align:center;padding:14px 12px 16px;border-radius:26px;color:#3a2a1a;
  background:radial-gradient(130% 80% at 50% 0%,#fffaf0 0%,#f8edd8 60%,#f0e0c4 100%);
  box-shadow:inset 0 0 0 1px rgba(150,110,60,.28),0 8px 22px rgba(90,60,25,.16)}
.bp-cm *{box-sizing:border-box}
.bp-cm .bp-cm-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:0 0 10px}
.bp-cm .bp-cm-plaque{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:6px 16px;border-radius:12px;
  font-size:1.3rem;font-weight:800;line-height:1.2;white-space:nowrap;color:#38200e;background:${ wood };
  box-shadow:inset 0 2px 0 rgba(255,255,255,.7),inset 0 0 0 1px rgba(110,70,25,.45),0 3px 0 #8c5f2d,0 6px 10px rgba(60,35,15,.25);
  transition:box-shadow .25s ease}
.bp-cm .bp-cm-plaque.text-green-600{color:#16502a;min-width:76px}
.bp-cm.bp-cm-right .bp-cm-plaque.text-green-600{box-shadow:inset 0 2px 0 rgba(255,255,255,.7),inset 0 0 0 1px rgba(110,70,25,.45),0 3px 0 #8c5f2d,0 0 0 3px rgba(255,217,120,.95),0 0 18px 4px rgba(255,200,90,.6)}

/* Round progress: one brush mark per round */
.bp-cm .bp-cm-steps{display:flex;gap:4px;margin:0 2px 12px}
.bp-cm .bp-cm-steps i{flex:1 1 0;min-width:0;height:10px;border-radius:6px;background:rgba(120,85,40,.18);box-shadow:inset 0 1px 2px rgba(90,60,25,.3)}
.bp-cm .bp-cm-steps i.is-done{background:linear-gradient(180deg,#d9a253 0%,#b9772a 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.45)}
.bp-cm .bp-cm-steps i.is-now{background:#fff6dc;box-shadow:inset 0 0 0 2px #b9772a}

.bp-cm .bp-cm-ask{margin:0 4px 12px;font-size:1.3rem;font-weight:700;line-height:1.35;color:#553f29}

/* Canvas on its wooden stretcher */
.bp-cm .bp-cm-easel{position:relative;margin:0 0 18px;padding:10px;border-radius:18px;
  background:repeating-linear-gradient(90deg,rgba(90,50,15,.1) 0 1px,rgba(0,0,0,0) 1px 9px),linear-gradient(180deg,#c9995d 0%,#a87539 100%);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.4),inset 0 -3px 0 rgba(70,40,10,.3),0 8px 16px rgba(60,35,15,.28)}
.bp-cm .bp-cm-canvas{display:flex;align-items:center;justify-content:center;min-height:136px;padding:22px 8px;border-radius:10px;
  font-size:clamp(2.9rem,15vw,4.5rem);font-weight:900;line-height:1.1;
  text-shadow:0 0 1px rgba(58,36,18,.6),0 2px 0 rgba(58,36,18,.14);
  background:
    repeating-linear-gradient(0deg,rgba(150,115,60,.07) 0 1px,rgba(0,0,0,0) 1px 4px),
    repeating-linear-gradient(90deg,rgba(150,115,60,.07) 0 1px,rgba(0,0,0,0) 1px 4px),
    #fffaf0;
  box-shadow:inset 0 4px 12px rgba(90,60,25,.3),inset 0 0 0 1px rgba(120,85,40,.3);
  transition:box-shadow .25s ease,filter .25s ease}
.bp-cm .bp-cm-brush{position:absolute;bottom:-14px;inset-inline-end:10px;width:92px;height:30px;pointer-events:none;filter:drop-shadow(0 3px 3px rgba(60,35,15,.35))}
.bp-cm.bp-cm-right .bp-cm-canvas{box-shadow:inset 0 4px 12px rgba(90,60,25,.18),inset 0 0 0 1px rgba(120,85,40,.3),0 0 0 3px rgba(255,217,120,.95),0 0 24px 6px rgba(255,200,90,.6)}
.bp-cm.bp-cm-miss .bp-cm-canvas{filter:saturate(.8) brightness(.97)}

/* Palette board with paint daubs */
.bp-cm .bp-cm-palette{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:16px 14px 18px;border-radius:40px 46px 42px 48px/44px 40px 48px 42px;background:${ wood };
  box-shadow:inset 0 2px 0 rgba(255,255,255,.65),inset 0 -4px 0 rgba(110,70,25,.3),inset 0 0 0 1px rgba(110,70,25,.4),0 8px 16px rgba(60,35,15,.25)}
.bp-cm .bp-cm-daub{position:relative;display:flex;align-items:center;justify-content:center;min-width:0;min-height:80px;margin:0;padding:10px 8px;border:0;font:inherit;cursor:pointer;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
  border-radius:54% 46% 52% 48%/58% 52% 48% 42%;
  background-image:radial-gradient(60% 46% at 30% 20%,rgba(255,255,255,.6) 0%,rgba(255,255,255,0) 70%),radial-gradient(120% 110% at 50% 105%,rgba(0,0,0,.24) 0%,rgba(0,0,0,0) 60%);
  box-shadow:inset 0 -6px 10px rgba(0,0,0,.18),inset 0 3px 4px rgba(255,255,255,.35),0 4px 0 rgba(60,35,15,.28),0 9px 14px rgba(60,35,15,.3);
  transition:transform .2s ease,box-shadow .25s ease,opacity .25s ease,filter .25s ease}
.bp-cm .bp-cm-daub:nth-child(2n){border-radius:46% 54% 48% 52%/52% 58% 42% 48%}
.bp-cm .bp-cm-daub:nth-child(3n){border-radius:50% 50% 44% 56%/60% 48% 52% 40%}
.bp-cm .bp-cm-daub:focus{outline:none}
.bp-cm .bp-cm-daub:focus-visible{outline:3px solid #38200e;outline-offset:3px}
@media (hover:hover){.bp-cm:not(.bp-cm-locked) .bp-cm-daub:hover{transform:translateY(-2px) scale(1.02)}}
.bp-cm:not(.bp-cm-locked) .bp-cm-daub:active{transform:translateY(2px) scale(.98)}
.bp-cm .bp-cm-name{display:inline-block;max-width:100%;padding:6px 16px;border-radius:999px;background:rgba(255,251,240,.95);color:#2a1a0c;
  font-size:1.45rem;font-weight:900;line-height:1.2;box-shadow:0 2px 5px rgba(0,0,0,.28),inset 0 1px 0 #fff;pointer-events:none}

/* Feedback: warm glow for the right daub, soft dim for the rest */
.bp-cm.bp-cm-locked .bp-cm-daub{cursor:default}
.bp-cm.bp-cm-locked .bp-cm-daub:not(.bp-cm-true){opacity:.6;filter:saturate(.6)}
.bp-cm.bp-cm-miss .bp-cm-daub.bp-cm-picked{transform:scale(.96)}
.bp-cm.bp-cm-locked .bp-cm-daub.bp-cm-true{transform:scale(1.03);
  box-shadow:inset 0 -6px 10px rgba(0,0,0,.18),inset 0 3px 4px rgba(255,255,255,.35),0 0 0 4px #fff6dc,0 0 0 7px rgba(214,150,50,.9),0 0 24px 8px rgba(255,200,90,.7)}

@media (prefers-reduced-motion:reduce){
  .bp-cm .bp-cm-daub,.bp-cm .bp-cm-canvas,.bp-cm .bp-cm-plaque{transition:none!important;animation:none!important}
  .bp-cm .bp-cm-daub,.bp-cm .bp-cm-daub:hover,.bp-cm .bp-cm-daub:active{transform:none!important}
}`;
  let steps = '';
  for (let k = 0; k < gs._sq; k++)
    steps += `<i class="${ k < gs._si ? 'is-done' : k === gs._si ? 'is-now' : '' }"></i>`;
  const brush = `<svg class="bp-cm-brush" viewBox="0 0 92 30" aria-hidden="true" focusable="false"><path d="M4 15c8-6 16-7 24-5v10c-8 2-16 1-24-5z" fill="#6b5a48"/><path d="M4 15c7-3 14-4 22-3" fill="none" stroke="#8d7b66" stroke-width="1.5" stroke-linecap="round"/><rect x="27" y="8.5" width="17" height="13" rx="2" fill="#c9ced3"/><path d="M31 8.5v13M36 8.5v13" stroke="#8f969d" stroke-width="1.5"/><path d="M44 10h40a5 5 0 0 1 0 10H44z" fill="#9c4a2c"/><path d="M46 12.5h36" stroke="#c97a55" stroke-width="2" stroke-linecap="round"/></svg>`;
  let html = `<div class="max-w-xl w-full text-center bp-cm"><style>${ css }</style>
      <div class="flex justify-between text-sm font-bold text-gray-400 mb-2 bp-cm-top"><span class="bp-cm-plaque">${ gt('Round') } ${ gs._si + 1 }/${ gs._sq }</span><span class="text-green-600 bp-cm-plaque">✓ ${ gs._ss }</span></div>
      <div class="bp-cm-steps" aria-hidden="true">${ steps }</div>
      <p class="text-lg text-gray-500 mb-4 font-bold bp-cm-ask">${ gt('What COLOR is the word painted in? (not what it says!)') }</p>
      <div class="bp-cm-easel"><div class="bp-cm-canvas" style="color:${ ink.hex }">${ word.en }</div>${ brush }</div>
      <div class="grid grid-cols-2 gap-4 bp-cm-palette">`;
  shuffle([...palette]).forEach(c => {
    html += `<button onclick="_cmAnswer('${ c.id }')" class="bp-cm-daub" data-cm="${ c.id }" style="background-color:${ c.hex }"><span class="bp-cm-name">${ c.en }</span></button>`;
  });
  container.innerHTML = html + `</div></div>`;
}
function _cmAnswer(id) {
  const gs = gameState.colormatch;
  if (gs._locked)
    return;
  gs._locked = true;
  const isC = id === gs._answer;
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
  {
    const _r = document.querySelector('#gameContent .bp-cm');
    if (_r) {
      _r.classList.add('bp-cm-locked', isC ? 'bp-cm-right' : 'bp-cm-miss');
      const _p = _r.querySelector('[data-cm="' + id + '"]'), _t = _r.querySelector('[data-cm="' + gs._answer + '"]');
      if (_p)
        _p.classList.add('bp-cm-picked');
      if (_t)
        _t.classList.add('bp-cm-true');
    }
  }
  gs._si++;
  setTimeout(() => _cmNext(document.getElementById('gameContent')), isC ? 350 : 800);
}