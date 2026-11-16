function initProverbs(c) {
  const gs = gameState.proverbs;
  const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  gs.pool = shuffle([...i18nData[currentLang].proverbs_pool]);
  gs.idx = 0;
  gs.perLevel = _d === 'easy' ? 4 : _d === 'hard' ? 9 : 6;
  gs.score = 0;
  _provNext(c);
}
function _provNext(c) {
  if (!gameState.active || gameState.currentId !== 'proverbs')
    return;
  const gs = gameState.proverbs;
  gs._locked = false;
  if (gs.idx >= gs.perLevel) {
    gs._sessionScore = {
      correct: gs.score,
      total: gs.perLevel
    };
    levelComplete();
    return;
  }
  const item = gs.pool[gs.idx % gs.pool.length];
  const isHe = false;
  const css = `
.bpv,.bpv *{box-sizing:border-box}
.bpv{--g:90deg;width:100%;max-width:36rem;margin-left:auto;margin-right:auto;text-align:center}
.bpv-he{--g:270deg}
.bpv-room{position:relative;padding:14px 12px 16px;border-radius:22px;overflow:hidden;
  background:radial-gradient(90% 55% at 50% 36%,rgba(255,183,77,.30),rgba(255,183,77,0) 70%),
    repeating-linear-gradient(90deg,rgba(0,0,0,.16) 0 2px,rgba(0,0,0,0) 2px 58px),
    linear-gradient(180deg,#43281a,#2a180e);
  box-shadow:inset 0 0 0 2px rgba(255,214,150,.14),0 10px 26px rgba(0,0,0,.35)}
.bpv-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
.bpv-plate{position:relative;display:inline-block;padding:.3rem 1.5rem;border-radius:6px;white-space:nowrap;
  font-size:1.3rem;font-weight:800;line-height:1.3;color:#33210a;text-shadow:0 1px 0 rgba(255,244,200,.7);
  background:linear-gradient(180deg,#f8e7a8 0%,#d9b55f 45%,#b98f3a 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -2px 0 rgba(90,60,10,.45),0 2px 5px rgba(0,0,0,.5);
  transition:box-shadow .25s ease}
.bpv .bpv-plate.text-green-600{color:#33210a}
.bpv-plate::before,.bpv-plate::after{content:"";position:absolute;top:50%;width:7px;height:7px;margin-top:-3.5px;border-radius:50%;
  background:radial-gradient(circle at 35% 35%,#fff3c4,#7a5a1c 70%)}
.bpv-plate::before{left:7px}
.bpv-plate::after{right:7px}
.bpv[data-state="right"] .bpv-plate.text-green-600{box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -2px 0 rgba(90,60,10,.45),0 0 0 3px #ffe08a,0 0 18px 4px rgba(255,200,90,.85)}
 
.bpv-row{display:flex;justify-content:center;align-items:flex-end;gap:5px;height:44px;margin:8px 16px 16px;
  border-bottom:7px solid #94602f;border-radius:0 0 3px 3px;box-shadow:0 4px 5px -1px rgba(0,0,0,.5)}
.bpv-bk{display:block;flex:none;width:14px;height:31px;border-radius:2px 2px 0 0;transform-origin:50% 100%;transition:transform .25s ease,box-shadow .25s ease}
.bpv-bk:nth-child(3n+1){height:35px}
.bpv-bk:nth-child(3n+2){height:28px}
.bpv-bk.is-done{background:linear-gradient(180deg,transparent 5px,#e3bd6b 5px 7px,transparent 7px),linear-gradient(90deg,rgba(255,255,255,.22),rgba(0,0,0,.25)),#7a2a2f}
.bpv-bk.is-done:nth-child(3n+2){background:linear-gradient(180deg,transparent 5px,#e3bd6b 5px 7px,transparent 7px),linear-gradient(90deg,rgba(255,255,255,.22),rgba(0,0,0,.25)),#2a5a41}
.bpv-bk.is-done:nth-child(3n){background:linear-gradient(180deg,transparent 5px,#e3bd6b 5px 7px,transparent 7px),linear-gradient(90deg,rgba(255,255,255,.22),rgba(0,0,0,.25)),#2c466e}
.bpv-bk.is-todo{border:2px dashed rgba(255,225,170,.45);border-bottom:0}
.bpv-bk.is-now{background:linear-gradient(180deg,transparent 5px,#7a4a12 5px 7px,transparent 7px),linear-gradient(180deg,#ffd98a,#eaa63a);
  box-shadow:0 0 12px 3px rgba(255,190,80,.7);transform:rotate(-9deg) translateY(-3px)}
.bpv[data-state] .bpv-bk.is-now{transform:none;box-shadow:0 0 6px 1px rgba(255,190,80,.5)}
 
.bpv-book{position:relative;margin:0 2px 18px;padding:10px;border-radius:14px;
  background:linear-gradient(135deg,#7a4423,#4b2613 60%,#3a1c0d);
  box-shadow:inset 0 0 0 2px rgba(0,0,0,.35),inset 0 0 0 4px rgba(233,190,110,.4),0 0 38px 4px rgba(255,176,66,.28),0 10px 18px rgba(0,0,0,.45);
  transition:box-shadow .25s ease}
.bpv[data-state="right"] .bpv-book{box-shadow:inset 0 0 0 2px rgba(0,0,0,.35),inset 0 0 0 4px rgba(255,214,130,.75),0 0 56px 14px rgba(255,190,80,.62),0 10px 18px rgba(0,0,0,.45)}
.bpv[data-state="wrong"] .bpv-book{box-shadow:inset 0 0 0 2px rgba(0,0,0,.35),inset 0 0 0 4px rgba(233,190,110,.3),0 0 22px 2px rgba(255,176,66,.10),0 10px 18px rgba(0,0,0,.45)}
.bpv-page{position:relative;padding:1.5rem 1.15rem 1.3rem;border-radius:5px;color:#3a2410;
  background:radial-gradient(circle at 12% 18%,rgba(160,110,50,.16) 0 7px,rgba(160,110,50,0) 9px),
    radial-gradient(circle at 86% 78%,rgba(160,110,50,.14) 0 10px,rgba(160,110,50,0) 13px),
    radial-gradient(circle at 70% 12%,rgba(160,110,50,.10) 0 5px,rgba(160,110,50,0) 7px),
    linear-gradient(var(--g),rgba(96,56,20,.30),rgba(96,56,20,0) 9%),
    linear-gradient(180deg,#fcf3da,#f2e0b4);
  box-shadow:inset 0 0 26px rgba(139,90,32,.38),0 1px 0 rgba(255,255,255,.4)}
.bpv-q{margin:.6rem 0;font-family:Georgia,'Palatino Linotype','Book Antiqua','Frank Ruhl Libre','David Libre',David,'Times New Roman',serif;
  font-size:clamp(1.45rem,4.6vw,1.9rem);font-weight:700;font-style:italic;line-height:1.6;overflow-wrap:anywhere}
.bpv-he .bpv-q{font-style:normal}
.bpv-orn{display:block;margin:0 auto;width:120px;height:12px;color:#a8773a}
.bpv-ribbon{position:absolute;top:-3px;inset-inline-end:26px;width:16px;height:38px;
  background:linear-gradient(90deg,#8e1f2a,#c23a45 50%,#8e1f2a);
  -webkit-clip-path:polygon(0 0,100% 0,100% 100%,50% 76%,0 100%);clip-path:polygon(0 0,100% 0,100% 100%,50% 76%,0 100%)}
 
.bpv-shelf{position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:10px;padding:0 6px 13px}
.bpv-shelf::after{content:"";position:absolute;left:0;right:0;bottom:0;height:10px;border-radius:3px;
  background:linear-gradient(180deg,#b07a3f,#7c4f24);box-shadow:0 4px 6px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,225,170,.5)}
.bpv-opt{--lz:#6e1f26;position:relative;display:flex;align-items:center;justify-content:center;width:100%;min-height:64px;margin:0;
  padding:.55rem 3rem;border:0;border-radius:5px;cursor:pointer;font:inherit;font-size:1.35rem;font-weight:800;line-height:1.3;
  color:#fff3d4;text-shadow:0 1px 2px rgba(0,0,0,.65);overflow-wrap:anywhere;-webkit-appearance:none;appearance:none;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
  background:linear-gradient(90deg,transparent 12px,#e3bd6b 12px 15px,transparent 15px 20px,#e3bd6b 20px 22px,transparent 22px calc(100% - 22px),#e3bd6b calc(100% - 22px) calc(100% - 20px),transparent calc(100% - 20px) calc(100% - 15px),#e3bd6b calc(100% - 15px) calc(100% - 12px),transparent calc(100% - 12px)),
    linear-gradient(180deg,rgba(255,255,255,.20),rgba(255,255,255,0) 28%,rgba(0,0,0,0) 62%,rgba(0,0,0,.32)),
    var(--lz);
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.45),0 3px 0 rgba(0,0,0,.45),0 7px 10px rgba(0,0,0,.3);
  transition:box-shadow .2s ease,opacity .2s ease,transform .12s ease}
.bpv-opt:nth-child(4n+2){--lz:#1f4d36}
.bpv-opt:nth-child(4n+3){--lz:#223a5e}
.bpv-opt:nth-child(4n){--lz:#5c3615}
.bpv-opt:active{transform:translateY(2px)}
.bpv-opt:focus-visible{outline:3px solid #ffe08a;outline-offset:3px}
@media (hover:hover){.bpv-opt:hover{box-shadow:inset 0 0 0 1px rgba(0,0,0,.45),0 0 0 3px #f0c66f,0 3px 0 rgba(0,0,0,.45),0 7px 12px rgba(0,0,0,.35)}}
.bpv-opt::after{content:"";position:absolute;top:50%;inset-inline-end:.5rem;width:2.1rem;height:2.1rem;margin-top:-1.05rem;border-radius:50%;
  display:flex;align-items:center;justify-content:center;font-size:1.35rem;font-weight:900;line-height:1;text-shadow:none;opacity:0;transition:opacity .15s ease}
.bpv[data-state] .bpv-opt{pointer-events:none;cursor:default}
.bpv[data-state] .bpv-opt:not([data-ok="1"]):not(.is-pick){opacity:.5}
.bpv[data-state] .bpv-opt[data-ok="1"]{box-shadow:inset 0 0 0 1px rgba(0,0,0,.45),0 0 0 3px #ffd77a,0 0 26px 7px rgba(255,190,80,.78)}
.bpv[data-state] .bpv-opt[data-ok="1"]::after{content:"✓";opacity:1;background:#ffe08a;color:#234010;box-shadow:0 0 0 2px #7a5a1c}
.bpv-opt.is-pick:not([data-ok="1"]){outline:3px dashed #f4d9c6;outline-offset:-6px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.45),inset 0 0 0 99px rgba(20,10,5,.28),0 3px 0 rgba(0,0,0,.45)}
.bpv-opt.is-pick:not([data-ok="1"])::after{content:"✕";opacity:1;background:#f4d9c6;color:#7a1f14;box-shadow:0 0 0 2px #7a1f14}
 
@media (prefers-reduced-motion:no-preference){
  .bpv-book,.bpv-shelf{animation:bpvIn .3s ease both}
  .bpv-bk.is-now{animation:bpvLamp 2.6s ease-in-out infinite alternate}
  .bpv[data-state] .bpv-bk.is-now{animation:none}
  .bpv-opt.is-pick:not([data-ok="1"]){animation:bpvShake .42s ease both}
}
@media (prefers-reduced-motion:reduce){.bpv *{transition:none!important;animation:none!important}}
@keyframes bpvIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes bpvLamp{from{box-shadow:0 0 8px 2px rgba(255,190,80,.5)}to{box-shadow:0 0 15px 5px rgba(255,190,80,.85)}}
@keyframes bpvShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
`;
  const orn = `<svg class="bpv-orn" viewBox="0 0 120 12" aria-hidden="true" focusable="false"><path d="M2 6h44M74 6h44" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M60 1l5 5-5 5-5-5z" fill="currentColor"/><circle cx="50" cy="6" r="1.6" fill="currentColor"/><circle cx="70" cy="6" r="1.6" fill="currentColor"/></svg>`;
  const books = Array.from({ length: gs.perLevel }, (_, i) => `<i class="bpv-bk ${ i < gs.idx ? 'is-done' : i === gs.idx ? 'is-now' : 'is-todo' }"></i>`).join('');
  c.innerHTML = `<div class="bpv${ '' } max-w-xl w-full text-center"><style>${ css }</style>
      <div class="bpv-room">
        <div class="bpv-top"><span class="bpv-plate">${ gt('Proverb') } ${ gs.idx + 1 }/${ gs.perLevel }</span><span class="bpv-plate text-green-600">&#10003; ${ gs.score }</span></div>
        <div class="bpv-row" aria-hidden="true">${ books }</div>
        <div class="bpv-book">
          <div class="bpv-page">${ orn }<div class="bpv-q">"${ item.q }"</div>${ orn }</div>
          <span class="bpv-ribbon" aria-hidden="true"></span>
        </div>
        <div class="bpv-shelf">${ item.opts.map((o, i) => `<button onclick="answerProv(${ i },${ item.a })" class="bpv-opt" data-ok="${ i === item.a ? 1 : 0 }">${ o }</button>`).join('') }</div>
      </div>
    </div>`;
}
function answerProv(sel, correct) {
  if (!gameState.active || gameState.currentId !== 'proverbs')
    return;
  const gs = gameState.proverbs;
  if (gs._locked)
    return;
  gs._locked = true;
  if (sel === correct) {
    sfxCorrect();
    gs.score++;
  } else
    sfxWrong();
  try {
    const _r = document.getElementById('gameContent'), _w = _r && _r.querySelector ? _r.querySelector('.bpv') : null;
    if (_w) {
      _w.setAttribute('data-state', sel === correct ? 'right' : 'wrong');
      const _b = _w.querySelectorAll('.bpv-opt')[sel];
      if (_b)
        _b.classList.add('is-pick');
      const _c = _w.querySelector('.text-green-600');
      if (_c)
        _c.textContent = '\u2713 ' + gs.score;
    }
  } catch (_e) {
  }
  gs.idx++;
  setTimeout(() => _provNext(document.getElementById('gameContent')), sel === correct ? 350 : 800);
}