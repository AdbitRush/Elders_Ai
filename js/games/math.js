function initMath(container) {
  const gs = gameState.math;
  const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  gs._sq = _d === 'easy' ? 6 : _d === 'hard' ? 15 : 10;
  gs._si = 0;
  gs._ss = 0;
  gs._diff = _d;
  _mathNext(container);
}
function _mathNext(container) {
  if (!gameState.active || gameState.currentId !== 'math')
    return;
  const gs = gameState.math;
  gs._locked = false;
  if (gs._si >= gs._sq) {
    gs._sessionScore = {
      correct: gs._ss,
      total: gs._sq
    };
    levelComplete();
    return;
  }
  const _d = gs._diff || 'normal';
  const maxVal = _d === 'easy' ? 6 + gs.level * 2 : _d === 'hard' ? 14 + gs.level * 4 : 10 + gs.level * 3;
  const isAdd = Math.random() > (_d === 'easy' ? 0.2 : 0.4);
  let a, b, answer;
  if (isAdd) {
    a = Math.floor(Math.random() * maxVal) + 1;
    b = Math.floor(Math.random() * maxVal) + 1;
    answer = a + b;
  } else {
    a = Math.floor(Math.random() * maxVal) + 5;
    b = Math.floor(Math.random() * a);
    answer = a - b;
  }
  let opts = new Set([answer]);
  const spread = _d === 'easy' ? 3 : _d === 'hard' ? 6 : 4;
  while (opts.size < 4) {
    const f = answer + (Math.floor(Math.random() * spread * 2 + 1) - spread);
    if (f >= 0 && f !== answer)
      opts.add(f);
  }
  const optsArr = shuffle(Array.from(opts));
  const isHe = false;
  const digits = String(a).length + String(b).length;
  const eqSize = digits >= 6 ? ' qm-eq-xs' : digits >= 5 ? ' qm-eq-s' : '';
  const ticks = Array.from({ length: gs._sq }, (_, i) => `<i class="qm-tick${ i < gs._si ? ' qm-done' : i === gs._si ? ' qm-cur' : '' }"></i>`).join('');
  const css = `
.qm-scene{box-sizing:border-box;width:100%;max-width:26rem;margin:0 auto;padding:12px 12px 4px;text-align:center;border-radius:22px;
  background:linear-gradient(180deg,#f9f1e2 0%,#f4e8d3 58%,#eadbc0 58%,#e5d4b5 100%);box-shadow:inset 0 0 0 1px rgba(120,84,40,.18);-webkit-tap-highlight-color:transparent}
.qm-scene *{box-sizing:border-box}
.qm-frame{position:relative;padding:11px 11px 0;border-radius:14px;
  background:repeating-linear-gradient(92deg,rgba(70,38,12,.12) 0 2px,rgba(255,225,170,.08) 2px 7px,rgba(70,38,12,.05) 7px 11px),linear-gradient(180deg,#b9814a,#96602f);
  box-shadow:inset 0 2px 0 #cf9b62,inset 0 -2px 0 rgba(60,30,8,.35),0 10px 18px rgba(70,42,14,.28)}
.qm-board{position:relative;overflow:hidden;border-radius:6px;padding:12px 14px 14px;color:#f7f2e6;
  background:radial-gradient(120% 90% at 30% 20%,#45564c 0%,#36443c 45%,#2b3731 100%);
  box-shadow:inset 0 0 0 2px rgba(20,14,6,.55),inset 0 6px 18px rgba(0,0,0,.35)}
.qm-board::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.55;
  background:linear-gradient(102deg,transparent 0 26%,rgba(255,255,255,.06) 36%,transparent 50%,rgba(255,255,255,.04) 68%,transparent 80%),
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .3 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.qm-top{position:relative;display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:1.3rem;font-weight:700;line-height:1.25;
  font-family:"Chalkboard SE","Segoe Print","Comic Sans MS","Marker Felt",sans-serif;text-shadow:0 0 8px rgba(255,255,255,.15)}
.qm-count{color:#ece6d6}
.qm-scene .qm-score{color:#f8d976;padding:1px 11px;border:2px dashed rgba(248,217,118,.65);border-radius:12px;white-space:nowrap}
.qm-eq{position:relative;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:.08em .26em;margin:20px 0 18px;direction:ltr;
  font-family:"Chalkboard SE","Segoe Print","Comic Sans MS","Marker Felt",sans-serif;font-weight:700;line-height:1.15;font-size:clamp(2.3rem,11.5vw,3.6rem);
  color:#fcf8ee;text-shadow:0 0 1px rgba(255,255,255,.9),0 0 12px rgba(255,255,255,.2),1px 2px 0 rgba(0,0,0,.28)}
.qm-eq-s{font-size:clamp(2rem,9.6vw,3.2rem)}
.qm-eq-xs{font-size:clamp(1.8rem,8.4vw,2.8rem)}
.qm-op{color:#f8d976}
.qm-q{display:inline-flex;align-items:center;justify-content:center;min-width:1.2em;height:1.28em;padding:0 .12em;border:3px dashed rgba(252,248,238,.8);border-radius:.22em;color:#f8d976;
  transition:border-color .2s,box-shadow .2s,background-color .2s}
.qm-scene:has(.qm-block.bg-green-100) .qm-q{border-style:solid;border-color:#f8d976;background:rgba(248,217,118,.16);box-shadow:0 0 18px 4px rgba(248,217,118,.45)}
.qm-ticks{position:relative;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;min-height:24px;align-items:flex-end}
.qm-tick{display:block;width:5px;height:18px;border-radius:3px;background:rgba(255,255,255,.4);transform:rotate(5deg)}
.qm-tick:nth-child(even){transform:rotate(-4deg)}
.qm-tick.qm-done{background:#f8d976;box-shadow:0 0 6px rgba(248,217,118,.5)}
.qm-tick.qm-cur{height:24px;width:6px;background:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.3),0 0 8px rgba(255,255,255,.6)}
.qm-tray{position:relative;height:24px}
.qm-tray::before{content:'';position:absolute;left:-5px;right:-5px;bottom:0;height:10px;border-radius:3px 3px 6px 6px;background:linear-gradient(180deg,#d3a069,#a06a36);box-shadow:0 4px 5px rgba(60,35,10,.3)}
.qm-tray i{position:absolute;bottom:10px;display:block;height:7px;border-radius:3px;box-shadow:0 1px 1px rgba(0,0,0,.3)}
.qm-tray i:nth-child(1){left:20px;width:30px;background:#fcf8ee}
.qm-tray i:nth-child(2){left:58px;width:20px;background:#f8d976;transform:rotate(-7deg)}
.qm-tray i:nth-child(3){right:20px;width:40px;height:12px;border-radius:3px 3px 2px 2px;background:linear-gradient(180deg,#8a5630 0 46%,#3d3a37 46%)}
.qm-shelf{position:relative;display:grid;grid-template-columns:1fr 1fr;column-gap:16px;row-gap:34px;padding:22px 14px 28px;margin-top:2px;direction:ltr}
.qm-shelf::before,.qm-shelf::after{content:'';position:absolute;left:0;right:0;height:13px;border-radius:4px;pointer-events:none;
  background:repeating-linear-gradient(90deg,rgba(70,38,12,.1) 0 3px,transparent 3px 14px),linear-gradient(180deg,#cf9b62,#9a6332);box-shadow:0 5px 7px rgba(60,35,10,.26)}
.qm-shelf::before{top:105px}
.qm-shelf::after{top:217px}
.qm-scene .qm-block{position:relative;z-index:1;display:block;width:100%;height:78px;margin:0;padding:0 4px;font:inherit;font-size:2.1rem;font-weight:800;line-height:1;
  font-variant-numeric:tabular-nums;color:#3a2412;cursor:pointer;border:3px solid #b5854f;border-radius:14px;touch-action:manipulation;-webkit-user-select:none;user-select:none;
  background:repeating-linear-gradient(96deg,rgba(150,100,45,.1) 0 2px,transparent 2px 9px),linear-gradient(180deg,#fcedd2,#eed3a4);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.7),inset 0 -3px 0 rgba(150,100,45,.22),0 5px 0 #a3743f,0 9px 9px rgba(60,35,10,.28)}
.qm-scene .qm-block:nth-child(1){border-color:#3f8f8a}
.qm-scene .qm-block:nth-child(2){border-color:#c2693f}
.qm-scene .qm-block:nth-child(3){border-color:#b98a1f}
.qm-scene .qm-block:nth-child(4){border-color:#7d5a95}
.qm-scene .qm-block:active{transform:translateY(3px);box-shadow:inset 0 2px 0 rgba(255,255,255,.7),0 2px 0 #a3743f,0 4px 5px rgba(60,35,10,.28)}
.qm-scene .qm-block:focus-visible{outline:4px solid #1f4fbf;outline-offset:3px}
.qm-scene .qm-block.bg-green-100{border-color:#c98a00;background:linear-gradient(180deg,#fff0b0,#f5c23c);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.8),0 5px 0 #b07a1c,0 0 0 4px rgba(245,194,60,.55),0 0 26px 10px rgba(245,194,60,.7)}
.qm-scene .qm-block.bg-red-100{border-color:#b23a2a;background:linear-gradient(180deg,#fbe0d8,#efb6a7)}
.qm-scene .qm-block.bg-green-100::after,.qm-scene .qm-block.bg-red-100::after{position:absolute;top:4px;right:9px;font-size:1.3rem;font-weight:800;line-height:1}
.qm-scene .qm-block.bg-green-100::after{content:'\\2713';color:#6b4700}
.qm-scene .qm-block.bg-red-100::after{content:'\\2715';color:#8f2416}
.qm-shelf:has(.bg-green-100) .qm-block:not(.bg-green-100){opacity:.5}
@media (hover:hover){.qm-scene .qm-block:hover{filter:brightness(1.04)}}
@media (prefers-reduced-motion:no-preference){
  .qm-scene .qm-block{transition:transform .12s ease,box-shadow .2s ease,opacity .2s ease}
  .qm-eq{animation:qm-write .35s ease-out both}
  .qm-tick.qm-cur{animation:qm-cur 1.6s ease-in-out infinite}
  .qm-scene .qm-block.bg-green-100{animation:qm-glow .45s ease-out both}
  .qm-scene .qm-block.bg-red-100{animation:qm-shake .5s ease-in-out both}
}
@keyframes qm-write{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes qm-cur{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes qm-glow{0%{transform:scale(1)}45%{transform:scale(1.06) translateY(-3px)}100%{transform:scale(1.02) translateY(-1px)}}
@keyframes qm-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
`;
  container.innerHTML = `<style>${ css }</style><div class="qm-scene">
        <div class="qm-frame">
            <div class="qm-board">
                <div class="qm-top">
                    <span class="qm-count">${ gt('Q') } ${ gs._si + 1 }/${ gs._sq }</span>
                    <span class="qm-score text-green-600">✓ ${ gs._ss }</span>
                </div>
                <div class="qm-eq${ eqSize }" dir="ltr"><span>${ a }</span> <span class="qm-op">${ isAdd ? '+' : '\u2212' }</span> <span>${ b }</span> <span class="qm-op">=</span> <span class="qm-q">?</span></div>
                <div class="qm-ticks" aria-hidden="true">${ ticks }</div>
            </div>
            <div class="qm-tray" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
        <div class="qm-shelf">
            ${ optsArr.map(opt => `<button onclick="answerMath(${ opt },${ answer })" class="qm-block bg-blue-50 border-blue-200">${ opt }</button>`).join('') }
        </div></div>`;
}
function answerMath(sel, cor) {
  if (!gameState.active || gameState.currentId !== 'math')
    return;
  const gs = gameState.math;
  if (gs._locked)
    return;
  const btn = event.target;
  if (sel === cor) {
    gs._locked = true;
    sfxCorrect();
    gs._ss++;
    btn.classList.replace('bg-blue-50', 'bg-green-100');
    btn.classList.replace('border-blue-200', 'border-green-400');
    setTimeout(() => {
      gs._si++;
      _mathNext(document.getElementById('gameContent'));
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