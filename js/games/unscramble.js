// ═══════════════════════════════════════════════════════════════════════════════
// GAME 11: WORD UNSCRAMBLE — 7-word session
// ═══════════════════════════════════════════════════════════════════════════════
function initUnscramble(container){
    const state=gameState.unscramble;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    state._sq=_d==='easy'?5:_d==='hard'?10:7; state._si=0; state._ss=0; state._diff=_d;
    _unscrambleNext(container);
}
function _unscrambleNext(container){
    if(!gameState.active||gameState.currentId!=='unscramble')return;
    const state=gameState.unscramble;
    if(state._si>=state._sq){state._sessionScore={correct:state._ss,total:state._sq};levelComplete();return;}
    const pool=i18nData[currentLang].unscramble_pool;
    // easy → shorter words, hard → longer words
    const _d=state._diff||'normal';
    const filtered=_d==='easy'?pool.filter(p=>[...p.word].length<=4):_d==='hard'?pool.filter(p=>[...p.word].length>=4):pool;
    const src=filtered.length>0?filtered:pool;
    const item=src[Math.floor(Math.random()*src.length)];
    const word=item.word, letters=shuffle(word.split(''));
    state.word=word; state.answer=[]; state.letterEls=letters;
    const isHe=currentLang==='he';
    let tilesHtml=letters.map((l,i)=>`<span class="letter-tile" id="lt-${i}" onclick="pickLetter('${l}',${i})">${l}</span>`).join('');
    let ansHtml=word.split('').map((_,i)=>`<span class="answer-tile" id="at-${i}">&nbsp;</span>`).join('');
 
    // ── presentation only: board-game scene (felt table, wooden tiles, rack) ──
    const dir=isHe?'rtl':'ltr';
    const pipsHtml=Array.from({length:state._sq},(_,i)=>`<i class="usc-pip${i<state._si?' is-done':i===state._si?' is-now':''}"></i>`).join('');
    const grain='repeating-linear-gradient(91deg,rgba(70,40,12,0) 0 5px,rgba(70,40,12,.10) 5px 6px,rgba(255,232,185,.07) 6px 11px,rgba(70,40,12,.06) 11px 12px,rgba(70,40,12,0) 12px 19px)';
    const css=`
.usc-scene{box-sizing:border-box;width:100%;max-width:34rem;margin:0 auto;padding:.6rem .5rem .5rem;border-radius:1.25rem;text-align:center;
  font-family:Georgia,'Times New Roman','David','Frank Ruehl CLM',serif;color:#3b2412;-webkit-tap-highlight-color:transparent;
  background:${grain},linear-gradient(#9c6c3a,#7d5229);
  box-shadow:inset 0 2px 0 rgba(255,225,170,.35),inset 0 -3px 0 rgba(40,20,5,.35),0 8px 20px rgba(60,36,18,.28)}
.usc-scene *{box-sizing:border-box}
.usc-top{display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin:0 .15rem .6rem}
.usc-card{display:inline-flex;align-items:center;min-height:2.7rem;padding:.2rem .9rem;border-radius:.45rem;
  background:linear-gradient(#fdf5dd,#efdcb0);border:1px solid #6b4423;
  box-shadow:inset 0 1px 0 #fff,0 2px 0 #5a3a18,0 4px 8px rgba(30,15,5,.3);
  font-size:1.3rem;font-weight:700;line-height:1.2;color:#3b2412}
.usc-scene .usc-score{color:#1c5a34}
.usc-table{position:relative;padding:.9rem .5rem 1.1rem;border-radius:.9rem;
  background:repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 1px,transparent 1px 3px),
    repeating-linear-gradient(-45deg,rgba(0,0,0,.06) 0 1px,transparent 1px 3px),
    radial-gradient(ellipse at 50% 28%,#4f7f68 0,#3d6b56 55%,#2f5645 100%);
  box-shadow:inset 0 0 0 2px #4a2e12,inset 0 8px 22px rgba(0,0,0,.4)}
.usc-pips{display:flex;flex-wrap:wrap;justify-content:center;gap:.45rem;margin:0 0 .9rem}
.usc-pip{display:block;width:1.05rem;height:1.15rem;border-radius:.2rem;border:2px dashed rgba(255,240,205,.6)}
.usc-pip.is-done{border:1px solid #7a5a26;background:linear-gradient(160deg,#f6d77e,#d9a53d);box-shadow:0 2px 0 rgba(0,0,0,.3)}
.usc-pip.is-now{border:2px solid #fff3d2;background:linear-gradient(160deg,#f6e2b4,#dcbc7e);box-shadow:0 0 0 3px rgba(255,243,210,.28),0 2px 0 rgba(0,0,0,.3);transform:scale(1.2)}
.usc-note{position:relative;display:inline-block;max-width:94%;margin:0 auto 1.2rem;padding:.65rem 1.1rem .7rem;border-radius:2px;
  background:linear-gradient(178deg,#fffaf0 0,#fbf1d3 49%,#eadbb0 50%,#f8ecca 58%,#f6e8c4 100%);
  box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 4px 9px rgba(0,0,0,.35);
  font-size:1.35rem;line-height:1.35;color:#3b2412;transform:rotate(-1.2deg)}
.usc-note-k{font-style:italic;color:#6b4a26}
.usc-note-v{font-weight:700;color:#2b1708}
.usc-tiles{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;margin:0 0 1.3rem}
.usc-scene .letter-tile{display:inline-flex;align-items:center;justify-content:center;width:3.6rem;height:3.8rem;min-width:56px;min-height:56px;
  margin:0;padding:0;border-radius:.45rem;border:1px solid #9a6f3a;opacity:1;
  background:${grain},linear-gradient(160deg,#f8e6ba,#e8cb90 60%,#dbba7a);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.7),inset 0 -3px 0 rgba(120,80,30,.35),0 3px 0 #8a6130,0 7px 10px rgba(0,0,0,.38);
  color:#3b2412;font-family:inherit;font-size:2rem;font-weight:700;line-height:1;
  text-shadow:0 1px 0 rgba(255,255,255,.75),0 -1px 0 rgba(60,30,5,.4);
  cursor:pointer;user-select:none;-webkit-user-select:none;transform:none;
  transition:transform .15s ease,box-shadow .15s ease,background-color .2s ease}
.usc-scene .letter-tile:active{transform:translateY(2px);box-shadow:inset 0 2px 0 rgba(255,255,255,.7),inset 0 -3px 0 rgba(120,80,30,.35),0 1px 0 #8a6130,0 3px 5px rgba(0,0,0,.35)}
.usc-scene .letter-tile.used{background:rgba(0,0,0,.16);border:2px dashed rgba(255,240,205,.5);
  box-shadow:inset 0 3px 7px rgba(0,0,0,.4);color:rgba(255,240,205,.42);text-shadow:none;cursor:default;transform:none;opacity:1}
.usc-rack{position:relative;margin:0 auto .7rem;padding:.6rem .4rem 1.15rem;border-radius:.6rem .6rem .35rem .35rem;
  background:${grain},linear-gradient(#c08d4f,#9a6932);
  box-shadow:inset 0 2px 0 rgba(255,225,170,.5),inset 0 0 0 1px #5a3a18,0 6px 11px rgba(0,0,0,.4)}
.usc-rack::after{content:'';position:absolute;left:0;right:0;bottom:0;height:.6rem;border-radius:0 0 .35rem .35rem;
  background:linear-gradient(#7d5229,#5f3c1a);box-shadow:inset 0 2px 0 rgba(255,220,160,.35)}
.u
sc-slots{display:flex;flex-wrap:wrap;justify-content:center;gap:.3rem;min-height:3.4rem}
.usc-scene .answer-tile{display:inline-flex;align-items:center;justify-content:center;width:min(3.2rem,max(2rem,calc((100% - (var(--usc-n,5) - 1)*.3rem)/var(--usc-n,5))));height:3.4rem;margin:0;padding:0;
  border:2px dashed rgba(255,238,200,.85);border-radius:.4rem;background:rgba(50,28,8,.3);box-shadow:inset 0 2px 5px rgba(0,0,0,.35);
  color:#3b2412;font-family:inherit;font-size:clamp(1.6rem,7vw,1.95rem);font-weight:700;line-height:1;
  transition:box-shadow .3s ease,background-color .3s ease}
.usc-scene .answer-tile.usc-filled{border:1px solid #9a6f3a;
  background:${grain},linear-gradient(160deg,#f8e6ba,#e8cb90 60%,#dbba7a);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.7),inset 0 -3px 0 rgba(120,80,30,.35),0 3px 0 #6f4a20;
  text-shadow:0 1px 0 rgba(255,255,255,.75),0 -1px 0 rgba(60,30,5,.4)}
.usc-win .answer-tile.usc-filled{border-color:#b98a1e;
  background:linear-gradient(160deg,#fff3c4,#f6d671 60%,#e9bd45);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.85),0 3px 0 #8a6a1c,0 0 0 2px #f8d568,0 0 20px 7px rgba(255,214,110,.8);
  animation:usc-glow .4s ease-out both}
.usc-miss .usc-rack{animation:usc-shake .45s ease-in-out both}
.usc-miss .answer-tile{border-color:#ffc9b3}
.usc-msg{min-height:2.3rem;margin:0 0 .5rem;font-size:1.35rem;font-weight:700;line-height:1.5;color:#fff6dc;text-shadow:0 1px 2px rgba(0,0,0,.45)}
.usc-msg span{display:none}
.usc-win .usc-msg-ok,.usc-miss .usc-msg-no{display:inline}
.usc-win .usc-msg-ok{color:#ffe08a}
.usc-scene .usc-eraser{display:inline-flex;align-items:center;justify-content:center;gap:.6rem;min-height:56px;min-width:9rem;margin:0;padding:.3rem 1.3rem .45rem;
  border:1px solid #5a3a18;border-radius:.55rem;
  background:${grain},linear-gradient(#ecc98e,#cfa15f);
  box-shadow:inset 0 2px 0 rgba(255,245,215,.7),0 6px 0 #4a443d,0 7px 0 #2e2a26,0 11px 12px rgba(0,0,0,.35);
  color:#2b1708;font-family:inherit;font-size:1.35rem;font-weight:700;line-height:1.2;cursor:pointer;
  transition:transform .12s ease,box-shadow .12s ease}
.usc-scene .usc-eraser:active{transform:translateY(4px);box-shadow:inset 0 2px 0 rgba(255,245,215,.7),0 2px 0 #4a443d,0 3px 0 #2e2a26,0 5px 6px rgba(0,0,0,.35)}
.usc-scene .usc-eraser:focus-visible,.usc-scene .letter-tile:focus-visible{outline:3px solid #fff6dc;outline-offset:3px}
.usc-eraser svg{width:2.1rem;height:1.5rem;flex:none}
@media (hover:hover){
  .usc-scene .letter-tile:not(.used):hover{transform:translateY(-3px);box-shadow:inset 0 2px 0 rgba(255,255,255,.7),inset 0 -3px 0 rgba(120,80,30,.35),0 3px 0 #8a6130,0 11px 14px rgba(0,0,0,.4)}
  .usc-scene .usc-eraser:hover{background:${grain},linear-gradient(#f3d39c,#d8ab69)}
}
@media (min-width:480px){.usc-scene{padding:.75rem .75rem .7rem}.usc-table{padding:1.1rem 1rem 1.3rem}.usc-rack{padding:.7rem .7rem 1.25rem}}
@keyframes usc-glow{0%{transform:translateY(-3px)}60%{transform:translateY(1px)}100%{transform:none}}
@keyframes usc-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
@media (prefers-reduced-motion:reduce){.usc-scene *,.usc-scene *::after{animation:none!important;transition:none!important}}
`;
    container.innerHTML=`<style>${css}</style><div class="usc-scene text-center">
        <div class="usc-top">
            <span class="usc-card">${gt('Word', 'מילה')} ${state._si+1}/${state._sq}</span>
            <span class="text-green-600 usc-card usc-score">&#10003; ${state._ss}</span>
        </div>
        <div class="usc-table">
            <div class="usc-pips" aria-hidden="true">${pipsHtml}</div>
            <div class="usc-note"><span class="usc-note-k">${gt('Hint', 'רמז')}:</span> <span class="usc-note-v">${item.hint}</span></div>
            <div class="usc-tiles" dir="${dir}">${tilesHtml}</div>
            <div class="usc-rack"><div class="usc-slots" dir="${dir}" style="--usc-n:${word.split('').length}">${ansHtml}</div></div>
            <div class="usc-msg" aria-live="polite"><span class="usc-msg-ok">&#10003; ${gt('Well done!', 'כל הכבוד!')}</span><span class="usc-msg-no">${gt('Not quite - try again', 'לא בדיוק - נסו שוב')}</span></div>
            <button onclick="clearUnscramble()" class="usc-eraser"><svg viewBox="0 0 42 30" aria-hidden="true" focusable="false"><rect x="2" y="3" width="38" height="15" rx="4" fill="#b98548" stroke="#5a3a18" stroke-width="1.5"/><rect x="6" y="6" width="30" height="3" rx="1.5" fill="#f3d9a6" opacity=".7"/><rect x="2" y="17" width="38" height="9" rx="3" fill="#4a443d" stroke="#2e2a26" stroke-width="1.5"/><path d="M7 22h4M15 22h4M23 22h4M31 22h4" stroke="#8a8278" stroke-width="1.5" stroke-linecap="round"/></svg><span>${gt('Clear', 'נקה')}</span></button>
        </div>
    </div>`;
}
function pickLetter(letter,idx){
    const state=gameState.unscramble;
    const el=document.getElementById(`lt-${idx}`);
    if(el.classList.contains('used'))return;
    sfxFlip(); el.classList.add('used');
    const scene=el.closest?el.closest('.usc-scene'):null;       // visual state only
    if(scene)scene.classList.remove('usc-miss');
    state.answer.push({letter,idx});
    const pos=state.answer.length-1;
    const atEl=document.getElementById(`at-${pos}`); if(atEl){atEl.innerText=letter;atEl.classList.add('usc-filled');}
    if(state.answer.length===state.word.length){
        const formed=state.answer.map(x=>x.letter).join('');
        setTimeout(()=>{
            if(formed===state.word){
                sfxCorrect(); state._ss++;
                if(scene)scene.classList.add('usc-win');          // golden glow
                setTimeout(()=>{state._si++;_unscrambleNext(document.getElementById('gameContent'));},400);
            } else {
                sfxWrong(); clearUnscramble();
                if(scene)scene.classList.add('usc-miss');         // gentle rack shake + "try again"
            }
        },300);
    }
}
function clearUnscramble(){
    const state=gameState.unscramble;
    state.answer=[];
    state.letterEls.forEach((_,i)=>{const el=document.getElementById(`lt-${i}`);if(el){el.classList.remove('used');
        if(i===0&&el.closest){const sc=el.closest('.usc-scene');if(sc)sc.classList.remove('usc-miss');}}});
    state.word.split('').forEach((_,i)=>{const el=document.getElementById(`at-${i}`);if(el){el.innerText=' ';el.classList.remove('usc-filled');}});
}
 
