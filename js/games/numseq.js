// ═══════════════════════════════════════════════════════════════════════════════
// GAME 10: NUMBER SEQUENCE
// Scene: a chalkboard "number train" — painted cars carry the sequence, the
// dashed car waits for the answer, wooden number blocks sit on a shelf below.
// All art is inline CSS/SVG (no external assets).
// ═══════════════════════════════════════════════════════════════════════════════
const _SEQ_GENERATORS = [
    (lvl) => { const step=2+lvl,s=Math.floor(Math.random()*10)+1; return {seq:[s,s+step,s+2*step,s+3*step],next:s+4*step,type:'+'} },
    (lvl) => { const step=1+Math.floor(lvl/2),s=Math.floor(Math.random()*8)+10+lvl*2; return {seq:[s,s-step,s-2*step,s-3*step],next:s-4*step,type:'-'} },
    ()    => { const m=2,s=Math.floor(Math.random()*4)+1; return {seq:[s,s*m,s*m*m,s*m*m*m],next:s*m*m*m*m,type:'×2'} },
    // each number is the sum of the two before it (Fibonacci rule). The old one built a,b,a+b,a+2b -> a+3b, which no rule explains.
    (lvl) => { const a=1+Math.floor(Math.random()*3),b=a+1+Math.floor(Math.random()*3); return {seq:[a,b,a+b,a+2*b],next:2*a+3*b,type:'fib'} },
    (lvl) => { const step=5+lvl*2,s=Math.floor(Math.random()*5)+1; return {seq:[s,s+step,s+2*step,s+3*step],next:s+4*step,type:'+'} },
];
function initNumSeq(container){
    const gs=gameState.numseq;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs._sq=_d==='easy'?6:_d==='hard'?14:10; gs._si=0; gs._ss=0;
    _numseqNext(container);
}
function _numseqNext(container){
    if(!gameState.active||gameState.currentId!=='numseq')return;
    const gs=gameState.numseq; gs._locked=false;
    if(gs._si>=gs._sq){gs._sessionScore={correct:gs._ss,total:gs._sq};levelComplete();return;}
    const gen=_SEQ_GENERATORS[Math.floor(Math.random()*_SEQ_GENERATORS.length)];
    const {seq,next}=gen(gs.level);
    let opts=new Set([next]);
    while(opts.size<4){const d=next+(Math.floor(Math.random()*10)-5);if(d!==next&&d>0)opts.add(d);}
    const optsArr=shuffle(Array.from(opts));
    const isHe=currentLang==='he';
    // ── presentation only below ──
    const css=`
.ns-root{color:#2a1d12}
.ns-root *{box-sizing:border-box}
.ns-board{position:relative;border-radius:1rem;padding:.7rem .4rem 1.7rem;border:8px solid #8a5d36;
  background:
    radial-gradient(ellipse at 22% 18%,rgba(255,255,255,.08),transparent 55%),
    radial-gradient(ellipse at 80% 85%,rgba(255,255,255,.05),transparent 50%),
    linear-gradient(160deg,#35564a,#27423a);
  box-shadow:inset 0 0 0 2px rgba(0,0,0,.35),inset 0 0 28px rgba(0,0,0,.35),0 0 0 2px #6b4526,0 6px 16px rgba(60,35,10,.25)}
.ns-head{display:flex;justify-content:space-between;align-items:center;gap:.5rem;font-size:1.3rem;font-weight:800;line-height:1.2;color:#f4f1e4;padding-inline:.35rem;margin-bottom:.35rem}
.ns-root .ns-score{color:#cdf2b4;white-space:nowrap}
.ns-track{position:relative;height:2.7rem;margin:0 .4rem 1rem}
.ns-ties{position:absolute;inset-inline:0;bottom:0;display:flex;gap:3px;height:.45rem}
.ns-tie{flex:1;border-radius:2px;background:rgba(244,241,228,.26)}
.ns-tie-done{background:#f3d97c}
.ns-tie-now{background:#f4f1e4}
.ns-engine{position:absolute;bottom:.5rem;width:3rem;height:2rem;inset-inline-start:var(--ns-to);animation:ns-roll .5s ease-out both}
.ns-engine svg{display:block;width:100%;height:100%;overflow:visible}
[dir="rtl"] .ns-engine svg{transform:scaleX(-1)}
.ns-engine:dir(rtl) svg{transform:scaleX(-1)}
.ns-puff{animation:ns-puff 1.8s ease-in-out infinite}
.ns-puff2{animation-delay:.6s}
.ns-train{position:relative;display:flex;align-items:flex-end;justify-content:center;flex-wrap:wrap;row-gap:1rem;margin:0 .1rem}
.ns-train::after{content:"";position:absolute;inset-inline:0;bottom:0;height:3px;border-radius:2px;background:rgba(244,241,228,.6)}
.ns-car{position:relative;flex:1 1 0;min-width:2.6rem;max-width:4.4rem;height:3.3rem;margin-bottom:.535rem;display:flex;align-items:center;justify-content:center;
  border-radius:.5rem .5rem .3rem .3rem;border:2px solid var(--c,#b5533c);border-top-width:6px;border-bottom-width:6px;
  background:linear-gradient(180deg,#fff9ea,#f1e1bd);color:#2a1d12;font-weight:900;font-size:clamp(1.3rem,6vw,2rem);line-height:1;font-variant-numeric:tabular-nums;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.7),0 2px 4px rgba(0,0,0,.35)}
.ns-car.ns-long{font-size:clamp(1.3rem,5vw,1.55rem);letter-spacing:-.03em}
.ns-car::before,.ns-car::after{content:"";position:absolute;bottom:-.72rem;width:.7rem;height:.7rem;border-radius:50%;background:#2a1d12;border:2px solid #f4f1e4}
.ns-car::before{left:12%}
.ns-car::after{right:12%}
.ns-car.ns-q{--c:transparent;background:transparent;color:#f3d97c;box-shadow:none;outline:3px dashed #f3d97c;outline-offset:-4px;transition:background .2s ease,box-shadow .2s ease}
.ns-car.ns-q:not(.ns-solved){animation:ns-wait 1.6s ease-in-out infinite}
.ns-car.ns-q::before,.ns-car.ns-q::after{background:#2d4a40;border-color:#f3d97c}
.ns-car.ns-q.ns-solved{background:linear-gradient(180deg,#fff7d6,#f2c14e);colo
r:#2a1d12;outline-color:transparent;box-shadow:0 0 0 2px #ffd978,0 0 16px rgba(255,214,110,.9)}
.ns-arrow{flex:0 0 1.1rem;height:3.3rem;margin-bottom:.535rem;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:900;line-height:1;color:#f4f1e4}
[dir="rtl"] .ns-arrow{transform:scaleX(-1)}
.ns-arrow:dir(rtl){transform:scaleX(-1)}
.ns-tray{position:absolute;inset-inline:12%;bottom:.3rem;height:.45rem;border-radius:.2rem;background:linear-gradient(180deg,#a8744a,#7c5230);box-shadow:0 2px 3px rgba(0,0,0,.35)}
.ns-tray::before,.ns-tray::after{content:"";position:absolute;bottom:100%;height:.3rem;border-radius:.15rem}
.ns-tray::before{inset-inline-start:10%;width:1.7rem;background:#f4f1e4}
.ns-tray::after{inset-inline-start:calc(10% + 2.2rem);width:1.2rem;background:#f3d97c}
.ns-shelf{display:grid;grid-template-columns:1fr 1fr;column-gap:1rem;row-gap:1.5rem;margin-top:1.3rem;padding:0 .9rem .9rem;border-radius:.3rem;
  background:repeating-linear-gradient(180deg,transparent 0,transparent 4.6rem,#b07a4e 4.6rem,#b07a4e 4.75rem,#8a5d36 4.75rem,#8a5d36 5.3rem,rgba(60,35,10,.2) 5.3rem,rgba(60,35,10,.2) 5.5rem,transparent 5.5rem,transparent 6.1rem)}
.ns-root .ns-block{position:relative;isolation:isolate;height:4.6rem;min-height:56px;padding:0;border-radius:.7rem .7rem .35rem .35rem;border:2px solid #9a6a35;
  background:repeating-linear-gradient(94deg,rgba(120,72,20,.08) 0 2px,transparent 2px 9px),linear-gradient(180deg,#f8e2b4,#e9c98b);
  color:#2a1d12;font-size:2rem;font-weight:900;line-height:1;font-variant-numeric:tabular-nums;cursor:pointer;
  box-shadow:inset 0 3px 0 rgba(255,255,255,.65),inset 0 -5px 0 rgba(120,72,20,.28),0 2px 5px rgba(60,35,10,.3);
  transition:transform .12s ease,box-shadow .2s ease,border-color .2s ease;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.ns-root .ns-block::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;opacity:0;transition:opacity .2s ease}
.ns-root .ns-block:active{transform:scale(.96)}
.ns-root .ns-block:focus-visible{outline:3px solid #27423a;outline-offset:3px}
.ns-root .ns-block.bg-green-100{border-color:#3f8f4f;box-shadow:0 0 0 3px #f2c14e,0 0 20px rgba(242,193,78,.9),inset 0 3px 0 rgba(255,255,255,.65)}
.ns-root .ns-block.bg-green-100::before{opacity:1;background:linear-gradient(180deg,#d9f2b0,#f3d67a)}
.ns-root .ns-block.bg-green-100::after{content:"✓";position:absolute;top:.2rem;inset-inline-end:.45rem;font-size:1.3rem;color:#1d6a34}
.ns-root .ns-block.bg-red-100{border-color:#c0564a;animation:ns-shake .35s ease}
.ns-root .ns-block.bg-red-100::before{opacity:1;background:linear-gradient(180deg,#fbd5cd,#f0a99c)}
@keyframes ns-roll{from{inset-inline-start:var(--ns-from)}}
@keyframes ns-puff{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes ns-wait{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes ns-shake{0%,100%{transform:translateX(0)}30%{transform:translateX(-4px)}70%{transform:translateX(4px)}}
@media (hover:hover){.ns-root .ns-block:hover{border-color:#6b4526;transform:translateY(-2px)}.ns-root .ns-block:hover:active{transform:scale(.96)}}
@media (prefers-reduced-motion:reduce){.ns-root *{animation:none!important;transition:none!important}}
`;
    const paints=['#b5533c','#c9962e','#5f8a6b','#4f7396'];
    const span=Math.max(1,gs._sq-1);
    const pos=f=>`calc((100% - 3rem)*${(Math.min(1,f)).toFixed(4)})`;
    const ties=Array.from({length:gs._sq},(_,i)=>`<i class="ns-tie${i<gs._si?' ns-tie-done':i===gs._si?' ns-tie-now':''}"></i>`).join('');
    const arrow=`<span class="ns-arrow text-gray-400 font-bold">→</span>`;
    container.innerHTML=`<div class="ns-root w-full max-w-sm mx-auto text-center">
        <style>${css}</style>
        <div class="ns-board">
        <div class="ns-head">
            <span>${gt('Q', 'שאלה')} ${gs._si+1}/${gs._sq}</span>
            <span class="text-green-600 ns-score">✓ ${gs._ss}</span>
        </div>
        <div class="ns-track" aria-hidden="true">
            <div class="ns-ties">${ties}</div>
            <div class="ns-engine" style="--ns-from:${pos(Math.max(0,gs._si-1)/span)};--ns-to:${pos(gs._si/span)}"><svg viewBox="0 0 48 32" fill="none" stroke="#f4f1e4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V8h12v14"/><path d="M8 12h4v4H8z"/><path d="M16 13h20a4 4 0 0 1 4 4v5H4"/><path d="M30 13V6h5v7"/><path d="M40 22l5 4"/><circle cx="12" cy="25" r="4.5" fill="#2d4a40"/><circle cx="30" cy="25" r="4.5" fill="#2d4a40"/><circle class="ns-puff" cx="35" cy="1.5" r="1.8" fill="#f4f1e4" stroke="none"/><circle class="ns-puff ns-puff2" cx="40" cy="-2" r="2.4" fill="#f4f1e4" stroke="none"/></svg></div>
        </div>
        <div class="ns-train">
            ${seq.map((n,i)=>`<div class="ns-car${String(n).length>2?' ns-long':''}" style="--c:${paints[i%paints.length]}">${n}</div>`).join(arrow)}
            ${arrow}
            <div id="ns-q" class="ns-car ns-q">?</div>
        </div>
        <div class="ns-tray" aria-hidden="true"></div>

        </div>
        <div class="ns-shelf">
            ${optsArr.map(opt=>`<button type="button" onclick="answerNumSeq(${opt},${next})" class="ns-block bg-blue-50 border-blue-200">${opt}</button>`).join('')}
        </div></div>`;
}
function answerNumSeq(sel,cor){
    if(!gameState.active||gameState.currentId!=='numseq')return;
    const gs=gameState.numseq;
    if(gs._locked)return;   // one answer per question: a double-tap scored twice and skipped a question
    const btn=event.target;
    if(sel===cor){
        gs._locked=true; sfxCorrect(); gs._ss++;
        btn.classList.replace('bg-blue-50','bg-green-100'); btn.classList.replace('border-blue-200','border-green-400');
        const q=document.getElementById('ns-q');
        if(q&&q.classList){q.textContent=cor;q.classList.add('ns-solved');}   // the empty car receives its number
        setTimeout(()=>{gs._si++;_numseqNext(document.getElementById('gameContent'));},500);
    } else {
        sfxWrong();
        btn.classList.replace('bg-blue-50','bg-red-100'); btn.classList.replace('border-blue-200','border-red-300');
        setTimeout(()=>{btn.classList.replace('bg-red-100','bg-blue-50');btn.classList.replace('border-red-300','border-blue-200');},600);
    }
}
 
