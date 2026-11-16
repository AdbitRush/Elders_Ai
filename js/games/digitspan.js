function initDigitSpan(container) {
  const gs = gameState.digitspan;
  const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  const _adj = _d === 'easy' ? -1 : _d === 'hard' ? 1 : 0;
  gs._len = Math.min(9, Math.max(3, 3 + Math.floor(((gs.level || 1) - 1) / 2) + _adj));
  gs._sq = 5;
  gs._si = 0;
  gs._ss = 0;
  _dsNext(container);
}
function _dsNext(container) {
  if (!gameState.active || gameState.currentId !== 'digitspan')
    return;
  const gs = gameState.digitspan;
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
  let num = '';
  for (let i = 0; i < gs._len; i++)
    num += Math.floor(Math.random() * 10);
  gs._target = num;
  gs._input = '';
  const showMs = 1200 + gs._len * 450;
  const css = `
.ds-root{margin-inline:auto;color:#fbf3df}
.ds-root *{box-sizing:border-box}
.ds-root .hidden{display:none}
.ds-desk{position:relative;border-radius:1.25rem;padding:.9rem .75rem 1.1rem;
  background:
    radial-gradient(ellipse at 50% 0%,rgba(255,226,160,.28),transparent 62%),
    repeating-linear-gradient(92deg,rgba(255,255,255,.04) 0 2px,rgba(0,0,0,.05) 2px 5px,transparent 5px 11px),
    repeating-linear-gradient(88deg,rgba(0,0,0,.07) 0 1px,transparent 1px 23px),
    linear-gradient(180deg,#8a5d36 0%,#74492a 55%,#5f3a20 100%);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.18),inset 0 -6px 12px rgba(0,0,0,.25),0 6px 18px rgba(60,35,10,.25)}
.ds-head{display:flex;justify-content:space-between;align-items:center;gap:.5rem;font-size:1.3rem;font-weight:800;line-height:1.2;color:#fbf3df;text-shadow:0 1px 2px rgba(0,0,0,.45)}
.ds-root .ds-score{color:#dff5bd;background:rgba(0,0,0,.28);padding:.1rem .6rem;border-radius:1rem;white-space:nowrap}
.ds-pips{display:flex;gap:.45rem;align-items:center}
.ds-pip{width:.85rem;height:.85rem;border-radius:50%;background:rgba(0,0,0,.32);box-shadow:inset 0 1px 2px rgba(0,0,0,.55),0 1px 0 rgba(255,255,255,.15)}
.ds-pip-done{background:radial-gradient(circle at 35% 30%,#ffe9a8,#d9a531 60%,#9a6d14);box-shadow:0 1px 2px rgba(0,0,0,.4)}
.ds-pip-now{background:#fff3c9;box-shadow:0 0 0 3px rgba(255,220,130,.45),0 0 10px rgba(255,214,110,.9)}
.ds-display{position:relative;margin:1.6rem auto 0;padding:.75rem .6rem .85rem;border-radius:1.1rem;
  background:linear-gradient(180deg,#3d3029,#231a15);border:3px solid #c79a3b;
  box-shadow:inset 0 0 0 2px rgba(0,0,0,.45),inset 0 2px 6px rgba(255,255,255,.12),0 8px 14px rgba(0,0,0,.35);
  --m:var(--n);--fs:clamp(1.3rem,calc((min(100vw,36rem) - 6.5rem)/var(--m)*.8),3.2rem)}
.ds-display.ds-recall{--m:calc(var(--n) + 1);margin-top:1rem}
.ds-show::before,.ds-show::after{content:"";position:absolute;top:-1rem;width:2.3rem;height:1rem;border-radius:2.3rem 2.3rem 0 0;
  background:linear-gradient(180deg,#f3d58a,#c79a3b 70%,#946c1c);box-shadow:inset 0 2px 0 rgba(255,255,255,.5)}
.ds-show::before{left:16%}
.ds-show::after{right:16%}
.ds-cap{margin:0 0 .6rem;font-size:1.3rem;font-weight:800;line-height:1.25;color:#f6e2b0}
.ds-flip,.ds-typed{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:.4rem 4px;font-size:var(--fs);min-height:1.5em}
.ds-card{position:relative;display:inline-flex;align-items:center;justify-content:center;width:1.05em;height:1.45em;border-radius:.16em;
  background:linear-gradient(180deg,#fffaf0,#f3e7cc);color:#2a1d12;font-weight:900;line-height:1;font-variant-numeric:tabular-nums;
  box-shadow:0 2px 0 #b9a680,0 3px 6px rgba(0,0,0,.45),inset 0 1px 0 #fff}
.ds-card::after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(42,29,18,.22)}
.ds-card.ds-cursor{background:transparent;border:2px dashed rgba(246,226,176,.8);box-shadow:none;animation:ds-blink 1.3s ease-in-out infinite}
.ds-card.ds-cursor::after{display:none}
.ds-card.ds-new{animation:ds-pop .16s ease-out}
.ds-gold .ds-card{background:linear-gradient(180deg,#fff6cf,#f2c14e);box-shadow:0 0 0 2px #ffd978,0 0 18px rgba(255,205,90,.95)}
.ds-gold .ds-cursor{display:none}
.ds-typed .ds-miss,.ds-typed .ds-fix{display:inline-block;padding:.22em .5em;border-radius:.3em;background:#fff8e8;font-weight:900;letter-spacing:.08em;
  font-size:clamp(1.3rem,.8em,2.4rem);line-height:1.15;font-variant-numeric:tabular-nums;box-shadow:0 3px 6px rgba(0,0,0,.4)}
.ds-root .ds-miss{color:#b3261e;text-decoration:line-through;text-decoration-thickness:.12em}
.ds-root .ds-fix{color:#17633a;box-shadow:0 0 0 3px #8fd3a8,0 3px 6px rgba(0,0,0,.4)}
.ds-fix::before{content:"✓ "}
.ds-timer{height:.55rem;border-radius:1rem;background:rgba(255,255,255,.16);margin-top:.8rem;o
verflow:hidden}
.ds-timer i{display:block;height:100%;width:100%;border-radius:1rem;background:linear-gradient(90deg,#f2c14e,#ffe9a8);transform-origin:left center;animation:ds-drain 1s linear forwards}
.ds-phone{margin:1rem auto 0;max-width:19rem;padding:.8rem .8rem 1.1rem;border-radius:1.5rem;border:3px solid #c79a3b;
  background:
    repeating-linear-gradient(91deg,rgba(255,255,255,.03) 0 2px,transparent 2px 9px),
    linear-gradient(180deg,#4a3526,#2c1f16);
  box-shadow:inset 0 0 0 2px rgba(0,0,0,.4),inset 0 2px 5px rgba(255,255,255,.12),0 8px 14px rgba(0,0,0,.35);animation:ds-rise .28s ease-out}
.ds-phone-cap{display:flex;align-items:center;justify-content:center;gap:.55rem;margin:0 0 .85rem;font-size:1.3rem;font-weight:800;line-height:1.25;color:#f6e2b0}
.ds-phone-cap svg{flex:none}
.ds-keys{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem .6rem;justify-items:center;max-width:15.5rem;margin:0 auto}
.ds-root .ds-key{width:4.25rem;height:4.25rem;max-width:100%;padding:0;border-radius:50%;border:3px solid #b58a2f;
  background:radial-gradient(circle at 35% 28%,#fffdf5,#f1e3c2 62%,#d8c296);color:#2a1d12;font-size:2rem;font-weight:900;line-height:1;
  display:inline-flex;align-items:center;justify-content:center;cursor:pointer;
  box-shadow:0 4px 0 #6f5318,0 6px 10px rgba(0,0,0,.45),inset 0 2px 0 rgba(255,255,255,.9);
  transition:transform .08s ease,box-shadow .08s ease,opacity .2s ease;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.ds-root .ds-key:active{transform:translateY(3px);box-shadow:0 1px 0 #6f5318,0 2px 4px rgba(0,0,0,.45),inset 0 2px 0 rgba(255,255,255,.9)}
.ds-root .ds-key:focus-visible{outline:3px solid #fff3c9;outline-offset:3px}
.ds-root .ds-key-del{background:radial-gradient(circle at 35% 28%,#f09a8c,#c0392b 62%,#8f231a);border-color:#f3c9a0;color:#fff}
.ds-root .ds-key-ok{background:radial-gradient(circle at 35% 28%,#8fd69b,#2f8f4a 62%,#1d6a34);border-color:#f3e3a0;color:#fff}
.ds-key svg{pointer-events:none}
.ds-done .ds-key{opacity:.55}
@keyframes ds-drain{to{transform:scaleX(0)}}
@keyframes ds-blink{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes ds-pop{from{transform:scale(.8)}to{transform:scale(1)}}
@keyframes ds-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media (hover:hover){.ds-root .ds-key:hover{border-color:#ffe9a8}}
@media (prefers-reduced-motion:reduce){.ds-root *{animation:none!important;transition:none!important}}
`;
  const pips = Array.from({ length: gs._sq }, (_, i) => `<i class="ds-pip${ i < gs._si ? ' ds-pip-done' : i === gs._si ? ' ds-pip-now' : '' }"></i>`).join('');
  const cards = num.split('').map(c => `<span class="ds-card" aria-hidden="true">${ c }</span>`).join('');
  container.innerHTML = `<div class="ds-root max-w-xl w-full text-center">
      <style>${ css }</style>
      <div class="ds-desk">
        <div class="ds-head"><span>${ gt('Round') } ${ gs._si + 1 }/${ gs._sq }</span><span class="ds-pips" aria-hidden="true">${ pips }</span><span class="text-green-600 ds-score">✓ ${ gs._ss }</span></div>
        <div id="ds-display" class="ds-display ds-show" dir="ltr" style="--n:${ gs._len }">
          <p class="ds-cap" dir="auto">${ gt('Memorize the number!') }</p>
          <div class="ds-flip" role="img" aria-label="${ num.split('').join(' ') }">${ cards }</div>
          <div class="ds-timer" aria-hidden="true"><i style="animation-duration:${ showMs }ms"></i></div>
        </div>
        <div id="ds-pad" class="hidden"></div>
      </div>
    </div>`;
  setTimeout(() => _dsShowPad(), showMs);
}
function _dsShowPad() {
  if (!gameState.active || gameState.currentId !== 'digitspan')
    return;
  const gs = gameState.digitspan;
  const isHe = false;
  const disp = document.getElementById('ds-display');
  disp.innerHTML = `<span id="ds-typed" class="ds-typed text-[#b7791f]"><span class="ds-card ds-cursor"></span></span>`;
  if (disp.classList) {
    disp.classList.remove('ds-show');
    disp.classList.add('ds-recall');
  }
  const pad = document.getElementById('ds-pad');
  pad.classList.remove('hidden');
  let html = `<div class="ds-phone"><p class="ds-phone-cap"><svg viewBox="0 0 48 24" width="44" height="22" aria-hidden="true"><path d="M4 14C4 6 12 3 24 3s20 3 20 11v3c0 2-1.5 3-3.5 3h-5c-2 0-3-1-3-3v-3c-3-1.5-14-1.5-17 0v3c0 2-1 3-3 3h-5C5.5 20 4 19 4 17z" fill="#f6e2b0"/></svg><span>${ gt('Type the number:') }</span></p><div class="ds-keys" dir="ltr">`;
  [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9
  ].forEach(d => {
    html += `<button type="button" onclick="_dsKey(${ d })" class="ds-key">${ d }</button>`;
  });
  html += `<button type="button" onclick="_dsKey(-1)" class="ds-key ds-key-del" aria-label="Delete">${ Icon.ui('delete', { size: '1.2em' }) }</button>
           <button type="button" onclick="_dsKey(0)" class="ds-key">0</button>
           <button type="button" onclick="_dsKey(-2)" class="ds-key ds-key-ok" aria-label="OK">${ Icon.ui('check', {
    size: '1.2em',
    sw: 3
  }) }</button>`;
  pad.innerHTML = html + `</div></
div>`;
}
function _dsKey(d) {
  const gs = gameState.digitspan;
  if (gs._locked)
    return;
  if (d === -2)
    gs._locked = true;
  if (d === -1) {
    gs._input = gs._input.slice(0, -1);
  } else if (d === -2) {
    const isC = gs._input === gs._target;
    if (isC) {
      sfxCorrect();
      gs._ss++;
    } else
      sfxWrong();
    const el = document.getElementById('ds-typed');
    if (el && !isC) {
      el.innerHTML = `<span class="ds-miss text-red-500 line-through">${ gs._input || '\u2014' }</span> <span class="ds-fix text-green-600">${ gs._target }</span>`;
    }
    if (el && isC && el.classList)
      el.classList.add('ds-gold');
    const pad = document.getElementById('ds-pad');
    if (pad && pad.classList)
      pad.classList.add('ds-done');
    gs._si++;
    setTimeout(() => _dsNext(document.getElementById('gameContent')), isC ? 400 : 1600);
    return;
  } else if (gs._input.length < gs._len + 2) {
    gs._input += d;
  }
  const el = document.getElementById('ds-typed');
  if (el) {
    el.innerText = gs._input || ' ';
    el.innerHTML = gs._input.split('').map((c, i, a) => `<span class="ds-card${ d >= 0 && i === a.length - 1 ? ' ds-new' : '' }">${ c }</span>`).join('') + (gs._input.length < gs._len + 2 ? `<span class="ds-card ds-cursor"></span>` : '');
  }
}