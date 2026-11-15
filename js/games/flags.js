// Windows has no flag-emoji glyphs — render real flag images from the emoji's
// regional-indicator pair (🇺🇸 → "us" → flagcdn), emoji text as a fallback.
function _flagUrl(emoji){
    const code = [...emoji].map(ch => String.fromCharCode(ch.codePointAt(0) - 127397)).join('').toLowerCase();
    return 'https://flagcdn.com/w320/' + code + '.png';
}
// ═══════════════════════════════════════════════════════════════════════════════
// GAME 14: FLAG QUIZ
// ═══════════════════════════════════════════════════════════════════════════════
function initFlags(c) {
    const gs = gameState.flags;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs.pool = shuffle([...i18nData[currentLang].flags_pool]);
    gs.idx = 0; gs.perLevel = _d==='easy'?6:_d==='hard'?14:10; gs.score = 0;
    _flagNext(c);
}
function _flagNext(c) {
    if(!gameState.active || gameState.currentId !== 'flags') return;
    const gs = gameState.flags; gs._locked=false;
    if(gs.idx >= gs.perLevel) { gs._sessionScore={correct:gs.score,total:gs.perLevel}; levelComplete(); return; }
    const item = gs.pool[gs.idx % gs.pool.length];
    const isHe = currentLang === 'he';
    // ── presentation only below: an explorer's desk (styles are scoped under .bpf) ──
    const css = `
.bpf,.bpf *{box-sizing:border-box}
.bpf{width:100%;max-width:28rem;margin-left:auto;margin-right:auto;text-align:center}
.bpf-desk{position:relative;padding:14px 12px 16px;border-radius:22px;overflow:hidden;
  background:radial-gradient(80% 48% at 50% 34%,rgba(255,205,120,.22),rgba(255,205,120,0) 70%),
    repeating-linear-gradient(0deg,rgba(240,214,160,.08) 0 1px,rgba(240,214,160,0) 1px 44px),
    repeating-linear-gradient(90deg,rgba(240,214,160,.08) 0 1px,rgba(240,214,160,0) 1px 44px),
    linear-gradient(180deg,#234a4d,#17302f);
  box-shadow:inset 0 0 0 2px rgba(240,214,160,.18),0 10px 26px rgba(0,0,0,.35)}
.bpf-desk>*{position:relative;z-index:1}
.bpf-desk>.bpf-wm{position:absolute;z-index:0;bottom:-34px;inset-inline-end:-34px;width:170px;height:170px;color:#f0d6a0;opacity:.10;pointer-events:none}
 
.bpf-top{display:flex;justify-content:space-between;align-items:center;gap:10px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))}
.bpf-tag{position:relative;display:inline-block;padding:.3rem .95rem;padding-inline-start:2.15rem;white-space:nowrap;
  font-size:1.3rem;font-weight:800;line-height:1.3;color:#33210a;text-shadow:0 1px 0 rgba(255,244,200,.7);
  background:linear-gradient(180deg,#f8e7a8 0%,#d9b55f 45%,#b98f3a 100%);
  -webkit-clip-path:polygon(9px 0,calc(100% - 9px) 0,100% 9px,100% calc(100% - 9px),calc(100% - 9px) 100%,9px 100%,0 calc(100% - 9px),0 9px);
  clip-path:polygon(9px 0,calc(100% - 9px) 0,100% 9px,100% calc(100% - 9px),calc(100% - 9px) 100%,9px 100%,0 calc(100% - 9px),0 9px)}
.bpf .bpf-tag.text-green-600{color:#33210a}
.bpf-tag::before{content:"";position:absolute;top:50%;inset-inline-start:.7rem;width:.8rem;height:.8rem;margin-top:-.4rem;border-radius:50%;
  background:#17302f;box-shadow:0 0 0 2px #8a6a22,inset 0 1px 2px rgba(0,0,0,.6)}
.bpf[data-state="right"] .bpf-tag.text-green-600{background:linear-gradient(180deg,#fffbe3 0%,#ffe08a 50%,#e0b452 100%)}
 
.bpf-route{display:flex;justify-content:space-between;align-items:center;height:26px;margin:10px 8px 12px;
  background:repeating-linear-gradient(90deg,rgba(240,214,160,.6) 0 6px,rgba(240,214,160,0) 6px 12px) center/100% 2px no-repeat}
.bpf-dot{display:block;flex:none;width:12px;height:12px;border-radius:50%;transition:box-shadow .25s ease,background-color .25s ease}
.bpf-dot.is-done{background:radial-gradient(circle at 35% 35%,#fbe9a9,#b98f3a);box-shadow:0 0 0 2px #1b3a3b}
.bpf-dot.is-todo{background:#1b3a3b;box-shadow:inset 0 0 0 2px rgba(240,214,160,.7),0 0 0 2px #1b3a3b}
.bpf-dot.is-now{width:20px;height:20px;background:#fff1c2;box-shadow:inset 0 0 0 5px #c8553d,0 0 0 2px #1b3a3b,0 0 12px 3px rgba(255,200,110,.7)}
.bpf[data-state] .bpf-dot.is-now{background:#f3d27a;box-shadow:inset 0 0 0 5px #b98f3a,0 0 0 2px #1b3a3b}
 
.bpf-card{position:relative;margin:6px 6px 20px;padding:16px 56px 18px;border-radius:6px;transform:rotate(-1.2deg);
  background:radial-gradient(circle at 9% 84%,rgba(150,100,40,.16) 0 9px,rgba(150,100,40,0) 12px),
    radial-gradient(circle at 84% 92%,rgba(150,100,40,.10) 0 6px,rgba(150,100,40,0) 8px),
    linear-gradient(180deg,#fbf2da,#f0deb2);
  box-shadow:inset 0 0 24px rgba(139,90,32,.40),inset 0 0 0 1px rgba(120,80,30,.35),0 12px 22px rgba(0,0,0,.45),0 0 30px rgba(255,200,110,.12);
  transition:box-shadow .25s ease}
.bpf[data-state="right"] .bpf-card{box-shadow:inset 0 0 24px rgba(139,90,32,.40),inset 0 0 0 1px rgba(120,80,30,.35),0 12px 22px rgba(0,0,0,.45),0 0 44px 10px rgba(255,200,100,.6)}
.bpf-mount{display:flex;justify-content:center;align-items:center;min-height:clamp(100px,26vw,150px);margin:0;-webkit-user-select:none;user-select:none}
.bpf-mount>div{line-height:1.1}
.bpf-flag{display:block;width:auto;height:auto;max-width:100%;max-height:clamp(100px,26vw,150px);border:4px solid #fffaf0;border-radius:3px;
  background:#fffaf0;box-shadow:0 0 0 1px rgba(90,60,20,.45),0 6px 14px rgba(60,35,10,.45)}
.bpf-post{position:absolute;top:10px;inset-inline-end:10px;width:38px;height:46px;transform:rotate(3deg);filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}
.bpf-pm{position:absolute;top:36px;inset-inline-end:30px;width:26px;height:26px;border-radius:50%;border:2px solid rgba(110,70,40,.5);box-shadow:inset 0 0 0 3px rgba(251,242,218,0),inset 0 0 0 4.5px rgba(110,70,40,.38)}
.bpf-ink{position:absolute;bottom:8px;inset-inline-start:5px;width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:1.6rem;font-weight:900;line-height:1;border:3px double currentColor;transform:rotate(-14deg);opacity:0}
.bpf[data-state="right"] .bpf-ink{opacity:.95;color:#22693f}
.bpf[data-state="wrong"] .bpf-ink{opacity:.95;color:#a23a28}
.bpf[data-state="right"] .bpf-ink::before{content:"✓"}
.bpf[data-state="wrong"] .bpf-ink::before{content:"✕"}
 
.bpf-opts{display:flex;flex-direction:column;gap:12px}
.bpf-opt{position:relative;display:flex;align-items:center;justify-content:center;width:100%;min-height:62px;margin:0;padding:.5rem 3.3rem;
  border:2px solid #a8762f;border-radius:12px;cursor:pointer;font:inherit;font-size:1.4rem;font-weight:800;line-height:1.25;color:#2a1f10;
  overflow-wrap:anywhere;-webkit-appearance:none;appearance:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation;
  background:linear-gradient(180deg,#fdf6e3,#f3e3bb);box-shadow:0 3px 0 #6f4a17,0 8px 12px rgba(0,0,0,.3);
  transition:box-shadow .2s ease,opacity .2s ease,transform .12s ease,border-color .2s ease}
.bpf-opt::before{content:"";position:absolute;top:5px;left:5px;right:5px;bottom:5px;border:1.5px dashed rgba(150,100,40,.6);border-radius:7px;pointer-events:none}
.bpf-rose{position:absolute;top:50%;inset-inline-start:.8rem;width:2rem;height:2rem;margin-top:-1rem;color:#a8762f;pointer-events:none}
.bpf-opt:active{transform:translateY(2px);box-shadow:0 1px 0 #6f4a17,0 4px 8px rgba(0,0,0,.3)}
.bpf-opt:focus-visible{outline:3px solid #ffe08a;outline-offset:3px}
@media (hover:hover){.bpf-opt:hover{border-color:#7a4f14;background:linear-gradient(180deg,#fffaf0,#f8e6b4);box-shadow:0 0 0 3px #f0c66f,0 3px 0 #6f4a17,0 8px 12px rgba(0,0,0,.3)}}
.bpf-opt::after{content:"";position:absolute;top:50%;inset-inline-end:.7rem;width:2.1rem;height:2.1rem;margin-top:-1.05rem;border-radius:50%;
  display:flex;align-items:center;justify-content:center;font-size:1.35rem;font-weight:900;line-height:1;opacity:0;transition:opacity .15s ease}
.bpf[data-state] .bpf-opt{pointer-events:none;cursor:default}
.bpf[data-state] .bpf-opt:not([data-ok="1"]):not(.is-pick){opacity:.55}
.bpf[data-state] .bpf-opt[data-ok="1"]{border-color:#22693f;background:linear-gradient(180deg,#fffbe8,#fbe9a9);box-shadow:0 0 0 3px #ffd77a,0 0 26px 7px rgba(255,200,90,.75)}
.bpf[data-state] .bpf-opt[data-ok="1"]::after{content:"✓";opacity:1;color:#fff;background:#22693f}
.bpf-opt.is-pick:not([data-ok="1"]){border-style:dashed;border-color:#a23a28;background:linear-gradient(180deg,#f4e6da,#ead3c0);box-shadow:0 3px 0 #6f4a17}
.bpf-opt.is-pick:not([data-ok="1"])::after{content:"✕";opacity:1;color:#fff;background:#a23a28}
 
@media (prefers-reduced-motion:no-preference){
  .bpf-card,.bpf-opts{animation:bpfIn .3s ease both}
  .bpf-dot.is-now{animation:bpfPin 2.6s ease-in-out infinite alternate}
  .bpf[data-state] .bpf-dot.is-now{animation:none}
  .bpf[data-state] .bpf-ink{animation:bpfInk .28s ease-out both}
  .bpf-opt.is-pick:not([data-ok="1"]){animation:bpfShake .42s ease both}
}
@media (prefers-reduced-motion:reduce){.bpf *{transition:none!important;animation:none!important}}
@keyframes bpfIn{from{opacity:0}to{opacity:1}}
@keyframes bpfPin{from{box-shadow:inset 0 0 0 5px #c8553d,0 0 0 2px #1b3a3b,0 0 6px 1px rgba(255,200,110,.45)}to{box-shadow:inset 0 0 0 5px #c8553d,0 0 0 2px #1b3a3b,0 0 14px 5px rgba(255,200,110,.8)}}
@keyframes bpfInk{from{opacity:0;transform:rotate(-14deg) scale(1.5)}to{opacity:.95;transform:rotate(-14deg) scale(1)}}
@keyframes bpfShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
`;
    const rose = `<svg class="bpf-rose" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M16 2.5l3 13.5-3 13.5-3-13.5z" fill="currentColor"/><path d="M2.5 16l13.5-3 13.5 3-13.5 3z" fill="currentColor" opacity=".55"/><circle cx="16" cy="16" r="2" fill="#fbf3df"/></svg>`;
    const route = Array.from({length:gs.perLevel},(_,i)=>`<i class="bpf-dot ${i<gs.idx?'is-done':i===gs.idx?'is-now':'is-todo'}"></i>`).join('');
    c.innerHTML = `<div class="bpf${isHe?' bpf-he':''} max-w-md w-full text-center"><style>${css}</style>
      <div class="bpf-desk">
        <svg class="bpf-wm" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/><path d="M50 4l8 46-8 46-8-46z" fill="currentColor"/><path d="M4 50l46-8 46 8-46 8z" fill="currentColor" opacity=".6"/><path d="M18 18l36 28-4 4zM82 18L54 54l-4-4zM82 82L46 54l4-4zM18 82l28-36 4 4z" fill="currentColor" opacity=".35"/></svg>
        <div class="bpf-top"><span class="bpf-tag">${gt('Q', 'שאלה')} ${gs.idx+1}/${gs.perLevel}</span><span class="bpf-tag text-green-600">&#10003; ${gs.score}</span></div>
        <div class="bpf-route" aria-hidden="true">${route}</div>
        <div class="bpf-card">
          <svg class="bpf-post" viewBox="0 0 40 48" aria-hidden="true" focusable="false"><rect x="1" y="1" width="38" height="46" fill="#f7ecd0" stroke="#d8c08a" stroke-width="2" stroke-dasharray="3 3"/><rect x="6" y="6" width="28" height="36" fill="#2f6f73"/><circle cx="20" cy="24" r="9" fill="none" stroke="#f3d9a0" stroke-width="1.5"/><path d="M20 13l2.5 11-2.5 11-2.5-11z" fill="#f3d9a0"/><path d="M9 24l11-2.5 11 2.5-11 2.5z" fill="#f3d9a0" opacity=".7"/></svg>
          <span class="bpf-pm" aria-hidden="true"></span>
          <div class="bpf-mount select-none">
            <img class="bpf-flag" src="${_flagUrl(item.flag)}" alt="flag"
                 onerror="this.outerHTML='<div style=&quot;font-size:clamp(4rem,20vw,8rem)&quot;>'+decodeURIComponent('${encodeURIComponent(item.flag)}')+'</div>'">
          </div>
          <span class="bpf-ink" aria-hidden="true"></span>
        </div>
        <div class="bpf-opts">${item.opts.map((o,i)=>`<button onclick="answerFlag(${i},${item.a})" class="bpf-opt" data-ok="${i===item.a?1:0}">${rose}${o}</button>`).join('')}</div>
      </div>
    </div>`;
}
function answerFlag(sel, correct) {
    if(!gameState.active || gameState.currentId !== 'flags') return;
    const gs = gameState.flags;
    if(gs._locked)return;gs._locked=true;  // one answer per question
    if(sel === correct) { sfxCorrect(); gs.score++; } else sfxWrong();
    {const _c=document.querySelector('#gameContent .text-green-600');if(_c)_c.textContent='✓ '+gs.score;}
    // visual feedback only (ink stamp on the postcard, glow / shake, reveal the right destination)
    try{const _r=document.getElementById('gameContent'),_w=_r&&_r.querySelector?_r.querySelector('.bpf'):null;
        if(_w){_w.setAttribute('data-state',sel===correct?'right':'wrong');
            const _b=_w.querySelectorAll('.bpf-opt')[sel];if(_b)_b.classList.add('is-pick');}}catch(_e){}
    gs.idx++;
    setTimeout(() => _flagNext(document.getElementById('gameContent')), sel===correct ? 350 : 800);
}
 
