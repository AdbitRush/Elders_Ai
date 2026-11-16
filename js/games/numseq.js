const _SEQ_GENERATORS = [
  lvl => {
    const step = 2 + lvl, s = Math.floor(Math.random() * 10) + 1;
    return {
      seq: [
        s,
        s + step,
        s + 2 * step,
        s + 3 * step
      ],
      next: s + 4 * step,
      type: '+'
    };
  },
  lvl => {
    const step = 1 + Math.floor(lvl / 2), s = Math.floor(Math.random() * 8) + 10 + lvl * 2;
    return {
      seq: [
        s,
        s - step,
        s - 2 * step,
        s - 3 * step
      ],
      next: s - 4 * step,
      type: '-'
    };
  },
  () => {
    const m = 2, s = Math.floor(Math.random() * 4) + 1;
    return {
      seq: [
        s,
        s * m,
        s * m * m,
        s * m * m * m
      ],
      next: s * m * m * m * m,
      type: '\xD72'
    };
  },
  lvl => {
    const a = 1 + Math.floor(Math.random() * 3), b = a + 1 + Math.floor(Math.random() * 3);
    return {
      seq: [
        a,
        b,
        a + b,
        a + 2 * b
      ],
      next: 2 * a + 3 * b,
      type: 'fib'
    };
  },
  lvl => {
    const step = 5 + lvl * 2, s = Math.floor(Math.random() * 5) + 1;
    return {
      seq: [
        s,
        s + step,
        s + 2 * step,
        s + 3 * step
      ],
      next: s + 4 * step,
      type: '+'
    };
  }
];
function initNumSeq(container) {
  const gs = gameState.numseq;
  const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  gs._sq = _d === 'easy' ? 6 : _d === 'hard' ? 14 : 10;
  gs._si = 0;
  gs._ss = 0;
  _numseqNext(container);
}
function _numseqNext(container) {
  if (!gameState.active || gameState.currentId !== 'numseq')
    return;
  const gs = gameState.numseq;
  gs._locked = false;
  if (gs._si >= gs._sq) {
    gs._sessionScore = {
      correct: gs._ss,
      total: gs._sq
    };
    levelComplete();
    return;
  }
  const gen = _SEQ_GENERATORS[Math.floor(Math.random() * _SEQ_GENERATORS.length)];
  const {seq, next} = gen(gs.level);
  let opts = new Set([next]);
  while (opts.size < 4) {
    const d = next + (Math.floor(Math.random() * 10) - 5);
    if (d !== next && d > 0)
      opts.add(d);
  }
  const optsArr = shuffle(Array.from(opts));
  const isHe = false;
  const css = `

.ns-root{color:#2a1d12;max-width:1000px;
  --ns-car-h:clamp(3.3rem,10vw,7.5rem);
  --ns-wheel:clamp(.7rem,1.5vw,1.1rem);
  --ns-eng-w:clamp(3rem,6vw,5rem);
  --ns-tie-h:clamp(.45rem,.8vw,.65rem);
  --ns-chalk:clamp(1.7rem,3.4vw,2.8rem);
  --ns-bh:clamp(4.6rem,9vw,7.2rem)}
.ns-root *{box-sizing:border-box}
.ns-board{position:relative;border-radius:clamp(1rem,1.6vw,1.4rem);padding:clamp(.7rem,1.4vw,1.1rem) clamp(.4rem,1.6vw,1.4rem) clamp(1.7rem,3vw,2.4rem);border:clamp(8px,1vw,12px) solid #8a5d36;
  background:
    radial-gradient(ellipse at 22% 18%,rgba(255,255,255,.08),transparent 55%),
    radial-gradient(ellipse at 80% 85%,rgba(255,255,255,.05),transparent 50%),
    linear-gradient(160deg,#35564a,#27423a);
  box-shadow:inset 0 0 0 2px rgba(0,0,0,.35),inset 0 0 28px rgba(0,0,0,.35),0 0 0 2px #6b4526,0 6px 16px rgba(60,35,10,.25)}
.ns-head{display:flex;justify-content:space-between;align-items:center;gap:.5rem;font-size:clamp(1.3rem,2.4vw,2.1rem);font-weight:800;line-height:1.2;color:#f4f1e4;padding-inline:.35rem;margin-bottom:clamp(.35rem,.8vw,.7rem)}
.ns-root .ns-score{color:#cdf2b4;white-space:nowrap}
.ns-track{position:relative;height:clamp(2.7rem,5.4vw,4.4rem);margin-block:0 clamp(1rem,1.8vw,1.5rem);margin-inline:.4rem calc(.4rem + var(--ns-eng-w) - 3rem)}
.ns-ties{position:absolute;inset-inline-start:0;inset-inline-end:calc(3rem - var(--ns-eng-w));bottom:0;display:flex;gap:clamp(3px,.4vw,5px);height:var(--ns-tie-h)}
.ns-tie{flex:1;border-radius:2px;background:rgba(244,241,228,.26)}
.ns-tie-done{background:#f3d97c}
.ns-tie-now{background:#f4f1e4}
.ns-engine{position:absolute;bottom:calc(var(--ns-tie-h) + .05rem);width:var(--ns-eng-w);height:calc(var(--ns-eng-w) * 2 / 3);inset-inline-start:var(--ns-to);animation:ns-roll .5s ease-out both}
.ns-engine svg{display:block;width:100%;height:100%;overflow:visible}
[dir="rtl"] .ns-engine svg{transform:scaleX(-1)}
.ns-engine:dir(rtl) svg{transform:scaleX(-1)}
.ns-puff{animation:ns-puff 1.8s ease-in-out infinite}
.ns-puff2{animation-delay:.6s}
.ns-train{position:relative;display:flex;align-items:flex-end;justify-content:center;flex-wrap:wrap;row-gap:clamp(1rem,2vw,1.6rem);margin:0 .1rem}
.ns-train::after{content:"";position:absolute;inset-inline:0;bottom:0;height:clamp(3px,.35vw,5px);border-radius:2px;background:rgba(244,241,228,.6)}
.ns-car{position:relative;flex:1 1 0;min-width:2.6rem;max-width:clamp(4.4rem,14vw,10.5rem);height:var(--ns-car-h);margin-bottom:calc(var(--ns-wheel) * .765);display:flex;align-items:center;justify-content:center;
  border-radius:clamp(.5rem,1vw,.8rem) clamp(.5rem,1vw,.8rem) .3rem .3rem;border:clamp(2px,.25vw,3px) solid var(--c,#b5533c);border-top-width:clamp(6px,.8vw,10px);border-bottom-width:clamp(6px,.8vw,10px);
  background:linear-gradient(180deg,#fff9ea,#f1e1bd);color:#2a1d12;font-weight:900;font-size:clamp(1.3rem,6vw,4rem);line-height:1;font-variant-numeric:tabular-nums;

  box-shadow:inset 0 0 0 1px rgba(255,255,255,.7),0 2px 4px rgba(0,0,0,.35)}
.ns-car.ns-long{font-size:clamp(1.3rem,5vw,3.2rem);letter-spacing:-.03em}
.ns-car::before,.ns-car::after{content:"";position:absolute;bottom:calc(var(--ns-wheel) * -1.03);width:var(--ns-wheel);height:var(--ns-wheel);border-radius:50%;background:#2a1d12;border:clamp(2px,.25vw,3px) solid #f4f1e4}
.ns-car::before{left:12%}
.ns-car::after{right:12%}
.ns-car.ns-q{--c:transparent;background:transparent;color:#f3d97c;box-shadow:none;outline:clamp(3px,.4vw,5px) dashed #f3d97c;outline-offset:-4px;transition:background .2s ease,box-shadow .2s ease}
.ns-car.ns-q:not(.ns-solved){animation:ns-wait 1.6s ease-in-out infinite}
.ns-car.ns-q::before,.ns-car.ns-q::after{background:#2d4a40;border-color:#f3d97c}
.ns-car.ns-q.ns-solved{background:linear-gradient(180deg,#fff7d6,#f2c14e);color:#2a1d12;outline-color:transparent;box-shadow:0 0 0 2px #ffd978,0 0 16px rgba(255,214,110,.9)}
.ns-arrow{flex:0 0 clamp(1.1rem,3vw,2.4rem);height:var(--ns-car-h);margin-bottom:calc(var(--ns-wheel) * .765);display:flex;align-items:center;justify-content:center;font-size:clamp(1.3rem,3vw,2.6rem);font-weight:900;line-height:1;color:#f4f1e4}
[dir="rtl"] .ns-arrow{transform:scaleX(-1)}
.ns-arrow:dir(rtl){transform:scaleX(-1)}
.ns-tray{position:absolute;inset-inline:12%;bottom:clamp(.3rem,.8vw,.7rem);height:clamp(.45rem,.8vw,.7rem);border-radius:.2rem;background:linear-gradient(180deg,#a8744a,#7c5230);box-shadow:0 2px 3px rgba(0,0,0,.35)}
.ns-tray::before,.ns-tray::after{content:"";position:absolute;bottom:100%;height:clamp(.3rem,.55vw,.45rem);border-radius:.15rem}
.ns-tray::before{inset-inline-start:10%;width:var(--ns-chalk);background:#f4f1e4}
.ns-tray::after{inset-inline-start:calc(10% + var(--ns-chalk) + .5rem);width:calc(var(--ns-chalk) * .7);background:#f3d97c}
.ns-shelf{display:grid;grid-template-columns:1fr 1fr;column-gap:clamp(1rem,2vw,1.6rem);row-gap:1.5rem;max-width:48rem;margin:clamp(1.3rem,2.2vw,1.8rem) auto 0;padding:0 clamp(.9rem,2vw,1.6rem) .9rem;border-radius:.3rem;
  background:repeating-linear-gradient(180deg,transparent 0,transparent var(--ns-bh),#b07a4e var(--ns-bh),#b07a4e calc(var(--ns-bh) + .15rem),#8a5d36 calc(var(--ns-bh) + .15rem),#8a5d36 calc(var(--ns-bh) + .7rem),rgba(60,35,10,.2) calc(var(--ns-bh) + .7rem),rgba(60,35,10,.2) calc(var(--ns-bh) + .9rem),transparent calc(var(--ns-bh) + .9rem),transparent calc(var(--ns-bh) + 1.5rem))}
.ns-root .ns-block{position:relative;isolation:isolate;height:var(--ns-bh);min-height:56px;padding:0;border-radius:clamp(.7rem,1.2vw,1rem) clamp(.7rem,1.2vw,1rem) .35rem .35rem;border:clamp(2px,.25vw,3px) solid #9a6a35;
  background:repeating-linear-gradient(94deg,rgba(120,72,20,.08) 0 2px,transparent 2px 9px),linear-gradient(180deg,#f8e2b4,#e9c98b);
  color:#2a1d12;font-size:clamp(2rem,4.4vw,3.4rem);font-weight:900;line-height:1;font-variant-numeric:tabular-nums;cursor:pointer;
  box-shadow:inset 0 3px 0 rgba(255,255,255,.65),inset 0 -5px 0 rgba(120,72,20,.28),0 2px 5px rgba(60,35,10,.3);
  transition:transform .12s ease,box-shadow .2s ease,border-color .2s ease;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.ns-root .ns-block::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;opacity:0;transition:opacity .2s ease}
.ns-root .ns-block:active{transform:scale(.96)}
.ns-root .ns-block:focus-visible{outline:3px solid #27423a;outline-offset:3px}
.ns-root .ns-block.bg-green-100{border-color:#3f8f4f;box-shadow:0 0 0 3px #f2c14e,0 0 20px rgba(242,193,78,.9),inset 0 3px 0 rgba(255,255,255,.65)}
.ns-root .ns-block.bg-green-100::before{opacity:1;background:linear-gradient(180deg,#d9f2b0,#f3d67a)}
.ns-root .ns-block.bg-green-100::after{content:"✓";position:absolute;top:clamp(.2rem,.6vw,.5rem);inset-inline-end:clamp(.45rem,1vw,.9rem);font-size:clamp(1.3rem,2.4vw,2rem);color:#1d6a34}
.ns-root .ns-block.bg-red-100{border-color:#c0564a;animation:ns-shake .35s ease}
.ns-root .ns-block.bg-red-100::before{opacity:1;background:linear-gradient(180deg,#fbd5cd,#f0a99c)}
@keyframes ns-roll{from{inset-inline-start:var(--ns-from)}}

@keyframes ns-puff{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes ns-wait{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes ns-shake{0%,100%{transform:translateX(0)}30%{transform:translateX(-4px)}70%{transform:translateX(4px)}}
@media (hover:hover){.ns-root .ns-block:hover{border-color:#6b4526;transform:translateY(-2px)}.ns-root .ns-block:hover:active{transform:scale(.96)}}
@media (prefers-reduced-motion:reduce){.ns-root *{animation:none!important;transition:none!important}}
`;
  const paints = [
    '#b5533c',
    '#c9962e',
    '#5f8a6b',
    '#4f7396'
  ];
  const span = Math.max(1, gs._sq - 1);
  const pos = f => `calc((100% - 3rem)*${ Math.min(1, f).toFixed(4) })`;
  const ties = Array.from({ length: gs._sq }, (_, i) => `<i class="ns-tie${ i < gs._si ? ' ns-tie-done' : i === gs._si ? ' ns-tie-now' : '' }"></i>`).join('');
  const arrow = `<span class="ns-arrow text-gray-400 font-bold">→</span>`;
  container.innerHTML = `<div class="ns-root w-full mx-auto text-center">
        <style>${ css }</style>
        <div class="ns-board">
        <div class="ns-head">
            <span>${ gt('Q') } ${ gs._si + 1 }/${ gs._sq }</span>
            <span class="text-green-600 ns-score">✓ ${ gs._ss }</span>
        </div>
        <div class="ns-track" aria-hidden="true">
            <div class="ns-ties">${ ties }</div>
            <div class="ns-engine" style="--ns-from:${ pos(Math.max(0, gs._si - 1) / span) };--ns-to:${ pos(gs._si / span) }"><svg viewBox="0 0 48 32" fill="none" stroke="#f4f1e4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V8h12v14"/><path d="M8 12h4v4H8z"/><path d="M16 13h20a4 4 0 0 1 4 4v5H4"/><path d="M30 13V6h5v7"/><path d="M40 22l5 4"/><circle cx="12" cy="25" r="4.5" fill="#2d4a40"/><circle cx="30" cy="25" r="4.5" fill="#2d4a40"/><circle class="ns-puff" cx="35" cy="1.5" r="1.8" fill="#f4f1e4" stroke="none"/><circle class="ns-puff ns-puff2" cx="40" cy="-2" r="2.4" fill="#f4f1e4" stroke="none"/></svg></div>
        </div>
        <div class="ns-train">
            ${ seq.map((n, i) => `<div class="ns-car${ String(n).length > 2 ? ' ns-long' : '' }" style="--c:${ paints[i % paints.length] }">${ n }</div>`).join(arrow) }
            ${ arrow }
            <div id="ns-q" class="ns-car ns-q">?</div>
        </div>
        <div class="ns-tray" aria-hidden="true"></div>

        </div>
        <div class="ns-shelf">
            ${ optsArr.map(opt => `<button type="button" onclick="answerNumSeq(${ opt },${ next })" class="ns-block bg-blue-50 border-blue-200">${ opt }</button>`).join('') }

        </div></div>`;
}
function answerNumSeq(sel, cor) {
  if (!gameState.active || gameState.currentId !== 'numseq')
    return;
  const gs = gameState.numseq;
  if (gs._locked)
    return;
  const btn = event.target;
  if (sel === cor) {
    gs._locked = true;
    sfxCorrect();
    gs._ss++;
    btn.classList.replace('bg-blue-50', 'bg-green-100');
    btn.classList.replace('border-blue-200', 'border-green-400');
    const q = document.getElementById('ns-q');
    if (q && q.classList) {
      q.textContent = cor;
      q.classList.add('ns-solved');
    }
    setTimeout(() => {
      gs._si++;
      _numseqNext(document.getElementById('gameContent'));
    }, 500);
  } else {
    sfxWrong();
    btn.classList.replace('bg-blue-50', 'bg-red-100');
    btn.classList.replace('border-blue-200', 'border-red-300');
    setTimeout(() => {
      btn.classList.replace('bg-red-100', 'bg-blue-50');
      btn.classList.replace('border-red-300', 'border-blue-200');
    }, 600);
  }
}