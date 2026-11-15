// ═══════════════════════════════════════════════════════════════════════════════
// GAME 24: MISSING LETTER — complete the word with the right letter
// ═══════════════════════════════════════════════════════════════════════════════
const _LTR_POOLS={
  he:['שולחן','חלון','מטבח','ספרים','משפחה','ירושלים','תפוזים','חברים','שמיים','פרחים','מדינה','שכונה','תמונה','מנורה','ארוחה','שמלה','מכתב','עיתון','רכבת','מספריים','בקבוק','צלחת','שטיח','כרית','מגבת','סבתא','נכדים','חופשה','מוזיקה','טלפון'],
  en:['TABLE','WINDOW','KITCHEN','FAMILY','FRIENDS','FLOWERS','PICTURE','DINNER','LETTER','TRAIN','BOTTLE','CARPET','PILLOW','TOWEL','HOLIDAY','MUSIC','PHONE','GARDEN','MARKET','BRIDGE','CANDLE','MIRROR','BASKET','ORANGE','SUMMER','WINTER','MORNING','EVENING','COFFEE','BREAD'],
};
const _LTR_HE_ALPHA='אבגדהוזחטיכלמנסעפצקרשת';
const _LTR_EN_ALPHA='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function initLetters(container){
    const gs=gameState.letters;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs._sq=(typeof Levels!=='undefined')?Levels.count('letters',_d==='easy'?5:_d==='hard'?10:7,0.5,15):7;
    gs._si=0; gs._ss=0;
    gs._words=shuffle([..._LTR_POOLS[currentLang==='he'?'he':'en']]);
    _ltrNext(container);
}
function _ltrNext(container){
    if(!gameState.active||gameState.currentId!=='letters')return;
    const gs=gameState.letters; gs._locked=false;
    if(gs._si>=gs._sq){gs._sessionScore={correct:gs._ss,total:gs._sq};levelComplete();return;}
    const isHe=currentLang==='he';
    const word=gs._words[gs._si%gs._words.length];
    const chars=[...word];
    // Levels 1-5: one hole · 6+: two holes
    const holes=(gs.level||1)<6?1:2;
    const idxs=shuffle(chars.map((c,i)=>i).filter(i=>chars[i]!==' ')).slice(0,holes).sort((a,b)=>a-b);
    gs._answer=idxs.map(i=>chars[i]).join('');
    const shown=chars.map((c,i)=>idxs.includes(i)?'＿':c).join('');
    const alpha=isHe?_LTR_HE_ALPHA:_LTR_EN_ALPHA;
    const opts=new Set([gs._answer]);
    while(opts.size<4){
        let alt='';
        for(let k=0;k<holes;k++)alt+=alpha[Math.floor(Math.random()*alpha.length)];
        if(alt!==gs._answer)opts.add(alt);
    }
 
    // ── presentation only: typewriter scene (aged paper, stamp blocks, brass labels) ──
    const wordHtml=chars.map((c,i)=>idxs.includes(i)?'<span class="ltr-ch ltr-hole"></span>':`<span class="ltr-ch">${c===' '?'&nbsp;':c}</span>`).join('');
    const pipsHtml=Array.from({length:gs._sq},(_,i)=>`<i class="ltr-pip${i<gs._si?' is-done':i===gs._si?' is-now':''}"></i>`).join('');
    const keysHtml=[40,70,100,130,160,190,220,250,280].map(x=>`<circle cx="${x}" cy="77" r="8.5" fill="#2a2420"/><circle cx="${x}" cy="75.5" r="7" fill="#f6ecd4" stroke="#c9a44e" stroke-width="2"/>`).join('');
    const barsHtml=[-40,-30,-20,-10,0,10,20,30,40].map(dx=>`<path d="M160 60L${160+dx} ${44+Math.abs(dx)*.14}" stroke="#a79c88" stroke-width="1.6" stroke-linecap="round"/>`).join('');
    const grain='repeating-linear-gradient(91deg,rgba(40,20,5,0) 0 5px,rgba(40,20,5,.12) 5px 6px,rgba(255,225,175,.06) 6px 11px,rgba(40,20,5,.07) 11px 12px,rgba(40,20,5,0) 12px 19px)';
    const css=`
.ltr-scene{box-sizing:border-box;width:100%;max-width:36rem;margin:0 auto;padding:.7rem .6rem .8rem;border-radius:1.25rem;text-align:center;
  font-family:Georgia,'Times New Roman','David','Frank Ruehl CLM',serif;color:#fff3d6;-webkit-tap-highlight-color:transparent;
  background:${grain},linear-gradient(#7d5634,#63401f);
  box-shadow:inset 0 2px 0 rgba(255,225,170,.3),inset 0 -3px 0 rgba(30,14,2,.4),0 8px 20px rgba(60,36,18,.28)}
.ltr-scene *{box-sizing:border-box}
.ltr-top{display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin:0 0 .6rem}
.ltr-brass{display:inline-flex;align-items:center;min-height:2.7rem;padding:.2rem 1.25rem;border-radius:.35rem;border:1px solid #6b4f16;
  background:radial-gradient(circle at .5rem 50%,#7d5e1f 0 .14rem,transparent .17rem),radial-gradient(circle at calc(100% - .5rem) 50%,#7d5e1f 0 .14rem,transparent .17rem),
    linear-gradient(#f1dc9c,#d2ad55 55%,#b98f38);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -1px 0 rgba(90,60,10,.4),0 3px 6px rgba(20,8,0,.4);
  font-size:1.3rem;font-weight:700;line-height:1.2;color:#2b1e06;text-shadow:0 1px 0 rgba(255,245,200,.6)}
.ltr-scene .ltr-brass.text-green-600{color:#12411f}
.ltr-pips{display:flex;flex-wrap:wrap;justify-content:center;gap:.4rem;margin:0 0 .55rem}
.ltr-pip{display:block;width:.9rem;height:.9rem;border-radius:50%;border:2px solid rgba(255,235,190,.5);background:rgba(30,14,2,.3)}
.ltr-pip.is-done{border-color:#7d5e1f;background:radial-gradient(circle at 35% 30%,#fbe9a8,#c99f44)}
.ltr-pip.is-now{border-color:#fff3d6;background:#fff3d6;box-shadow:0 0 0 3px rgba(255,243,214,.28);transform:scale(1.2)}
.ltr-prompt{margin:0 0 .8rem;font-size:1.4rem;font-weight:700;line-height:1.3;color:#fff3d6;text-shadow:0 1px 2px rgba(0,0,0,.45)}
.ltr-stage{position:relative;margin:0 auto;max-width:30rem}
.ltr-paper{position:relative;z-
index:1;width:88%;margin:0 auto;padding:1.3rem .4rem 2.3rem;border-radius:3px 3px 0 0;
  background:repeating-linear-gradient(transparent 0 2.3rem,rgba(120,90,50,.09) 2.3rem calc(2.3rem + 1px)),
    radial-gradient(ellipse at 12% 8%,rgba(165,120,60,.2),transparent 55%),radial-gradient(ellipse at 92% 80%,rgba(150,105,50,.2),transparent 50%),
    linear-gradient(#fcf5e0,#f0e0b9);
  box-shadow:0 0 0 1px rgba(90,60,25,.35),0 -3px 12px rgba(20,8,0,.35);
  animation:ltr-feed .35s ease-out both;transition:background-color .3s ease}
.ltr-word{display:flex;flex-wrap:nowrap;justify-content:center;align-items:center;gap:.1em;
  font-family:'Courier New',Courier,'Miriam Fixed','Miriam Mono CLM',monospace;font-size:clamp(2rem,9.2vw,3.4rem);font-weight:700;line-height:1.1;
  color:#2a211a;text-shadow:0 0 1px rgba(42,33,26,.55)}
.ltr-ch{display:inline-flex;align-items:center;justify-content:center;min-width:.76em;height:1.4em}
.ltr-hole{width:.98em;border:3px dashed #7a5a2c;border-radius:.12em;background:rgba(255,255,255,.45)}
.ltr-hole.is-ok{border-style:solid;border-color:#2e7d4f;background:rgba(46,125,79,.14);color:#1b6a3a;text-shadow:0 0 2px rgba(27,106,58,.45);animation:ltr-ink .28s ease-out both}
.ltr-hole.is-bad{border-style:solid;border-color:#b23b2e;background:radial-gradient(ellipse at 55% 55%,rgba(178,59,46,.32),rgba(178,59,46,.08) 70%);
  color:#a3281c;text-shadow:2px 1px 3px rgba(163,40,28,.6),-1px 0 2px rgba(163,40,28,.4);transform:rotate(-4deg);animation:ltr-ink .28s ease-out both}
.ltr-mark{display:flex;align-items:center;justify-content:center;min-height:2.5rem;margin-top:.5rem;font-family:Georgia,'Times New Roman',serif;font-size:1.3rem;font-weight:700;line-height:1.2}
.ltr-mark span{display:none;padding:.1rem .7rem;border:3px solid currentColor;border-radius:.3rem;transform:rotate(-3deg);letter-spacing:.02em}
.ltr-paper.is-ok .ltr-mark-ok{display:inline-block;color:#1b6a3a;background:rgba(46,125,79,.1)}
.ltr-paper.is-bad .ltr-mark-no{display:inline-block;color:#a3281c;background:rgba(178,59,46,.1);box-shadow:0 0 8px 2px rgba(178,59,46,.25)}
.ltr-machine{position:relative;z-index:2;display:block;width:100%;height:auto;margin-top:-1.35rem;filter:drop-shadow(0 5px 6px rgba(20,8,0,.45))}
.ltr-tray{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.5rem;margin-top:.9rem;padding:.8rem .5rem .7rem;border-radius:.8rem;
  background:rgba(30,14,2,.35);box-shadow:inset 0 3px 9px rgba(15,5,0,.55),0 1px 0 rgba(255,225,170,.2)}
.ltr-scene .ltr-stamp{position:relative;display:flex;align-items:flex-end;justify-content:center;min-height:5.6rem;margin:0;padding:1.55rem .25rem .3rem;
  border:1px solid #5a3a18;border-radius:1.5rem 1.5rem .5rem .5rem;
  background:${grain},linear-gradient(#e9c58a,#c99a58 60%,#b5823f);
  box-shadow:inset 0 2px 0 rgba(255,245,215,.7),inset 0 -2px 0 rgba(80,45,10,.35),0 5px 0 #3a2a1c,0 9px 10px rgba(10,4,0,.45);
  color:#2a211a;font-family:inherit;cursor:pointer;transition:transform .14s ease,box-shadow .14s ease,opacity .25s ease}
.ltr-stamp::before{content:'';position:absolute;top:.95rem;left:18%;right:18%;height:.28rem;border-radius:.2rem;background:rgba(80,45,10,.4);box-shadow:0 1px 0 rgba(255,240,205,.55)}
.ltr-face{display:flex;align-items:center;justify-content:center;width:100%;min-height:3.2rem;padding:0 .1rem;border-radius:.35rem;border:2px solid #7a2f25;
  background:linear-gradient(#fffaf0,#f3e7cb);box-shadow:inset 0 1px 3px rgba(60,20,10,.3);
  font-family:'Courier New',Courier,'Miriam Fixed','Miriam Mono CLM',monospace;font-size:1.95rem;font-weight:700;line-height:1;color:#2a211a;
  transition:background-color .2s ease,color .2s ease,border-color .2s ease}
.ltr-face.is-two{font-size:1.6rem;letter-spacing:.04em}
.ltr-scene .ltr-stamp:active{transform:translateY(4px);box-shadow:inset 0 2px 0 rgba(255,245,215,.7),0 1px 0 #3a2a1c,0 3px 5px rgba(10,4,0,.45)}
.ltr-scene .ltr-stamp:focus-visible{outline:3px solid #fff3d6;outline-offset:3px}
.ltr-scene .ltr-stamp.border-green-500,.ltr-scene .ltr-stamp.border-red-500{transform:translateY(4px);box-shadow:inset 0 2px 0 rgba(255,245,215,.7),0 1px 0 #3a2a1c,0 3px 5px rgba(10,4,0,.45)}
.ltr-stamp.border-green-500 .ltr-face{border-color:#2e7d4f;background:#dff3e3;color:#1b6a3a}
.ltr-stamp.border-red-500 .ltr-face{border-color:#b23b2e;background:#fadfd9;color:#a3281c}
.ltr-stamp.border-green-500::after,.ltr-stamp.border-red-500::after{position:absolute;top:-.55rem;inset-inline-end:-.3rem;display:flex;align-items:center;justify-content:center;
  width:1.9rem;height:1.9rem;border-radius:50%;border:2px solid #fff3d6;color:#fff;font:700 1.3rem/1 Georgia,serif}
.ltr-stamp.border-green-500::after{content:'\\2713';background:#2e7d4f}
.ltr-stamp.border-red-500::after{content:'\\2715';background:#b23b2e}
.ltr-locked .ltr-stamp{cursor:default}
.ltr-locked .ltr-stamp:not(.border-green-500):not(.border-red-500){opacity:.55}
@media (hover:hover){.ltr-scene:not(.ltr-locked) .ltr-stamp:hover{transform:translateY(-3px);box-shadow:inset 0 2px 0 rgb
a(255,245,215,.7),inset 0 -2px 0 rgba(80,45,10,.35),0 5px 0 #3a2a1c,0 13px 14px rgba(10,4,0,.5)}}
@media (min-width:480px){.ltr-scene{padding:.9rem 1rem 1rem}.ltr-tray{gap:.75rem;padding:.9rem .8rem .8rem}.ltr-face.is-two{font-size:1.9rem}}
@keyframes ltr-feed{from{transform:translateY(16px)}to{transform:none}}
@keyframes ltr-ink{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.ltr-scene *,.ltr-scene *::before,.ltr-scene *::after{animation:none!important;transition:none!important}}
`;
    let html=`<style>${css}</style><div class="ltr-scene max-w-xl w-full text-center">
      <div class="ltr-top"><span class="ltr-brass">${gt('Word', 'מילה')} ${gs._si+1}/${gs._sq}</span><span class="text-green-600 ltr-brass">✓ ${gs._ss}</span></div>
      <div class="ltr-pips" aria-hidden="true">${pipsHtml}</div>
      <p class="ltr-prompt">${isHe?(holes>1?'אילו אותיות חסרות?':'איזו אות חסרה?'):(holes>1?'Which letters are missing?':'Which letter is missing?')}</p>
      <div class="ltr-stage">
        <div class="ltr-paper">
          <div class="ltr-word" dir="${isHe?'rtl':'ltr'}" role="img" aria-label="${shown}">${wordHtml}</div>
          <div class="ltr-mark" aria-live="polite"><span class="ltr-mark-ok">✓ ${gt('Correct!', 'נכון!')}</span><span class="ltr-mark-no">✕ ${gt('Not this one', 'לא הפעם')}</span></div>
        </div>
        <svg class="ltr-machine" viewBox="0 0 320 92" aria-hidden="true" focusable="false">
          <rect x="2" y="6" width="18" height="26" rx="5" fill="#1f1b18"/><rect x="300" y="6" width="18" height="26" rx="5" fill="#1f1b18"/>
          <rect x="5" y="10" width="3" height="18" rx="1.5" fill="#5d554c"/><rect x="312" y="10" width="3" height="18" rx="1.5" fill="#5d554c"/>
          <rect x="14" y="8" width="292" height="22" rx="11" fill="#2b2622"/>
          <rect x="24" y="11" width="272" height="4" rx="2" fill="#7a7167" opacity=".5"/>
          <rect x="38" y="3" width="244" height="4.5" rx="2.25" fill="#d2b872"/>
          <circle cx="92" cy="5.5" r="5.5" fill="#3a332d"/><circle cx="228" cy="5.5" r="5.5" fill="#3a332d"/>
          <path d="M12 44Q12 30 28 30H292Q308 30 308 44L318 87Q318 92 313 92H7Q2 92 2 87Z" fill="#5d7364"/>
          <path d="M12 44Q12 30 28 30H292Q308 30 308 44L309 48H11Z" fill="#fff" opacity=".14"/>
          <path d="M9 66H311" stroke="#d2b872" stroke-width="1.5" opacity=".8"/>
          <path d="M104 62A56 24 0 0 1 216 62Z" fill="#23201c"/>
          ${barsHtml}
          <rect x="132" y="60" width="56" height="5" rx="2.5" fill="#d2b872"/>
          ${keysHtml}
        </svg>
      </div>
      <div class="ltr-tray grid grid-cols-4 gap-3">`;
    shuffle([...opts]).forEach(o=>{
        html+=`<button onclick="_ltrAnswer(this,'${o}')" class="ltr-stamp bg-white border-2 border-gray-200 hover:border-[#b7791f] text-3xl font-bold p-4 rounded-xl transition shadow-sm"><span class="ltr-face${holes>1?' is-two':''}">${o}</span></button>`;
    });
    container.innerHTML=html+`</div></div>`;
}
function _ltrAnswer(btn,val){
    const gs=gameState.letters;
    if(gs._locked)return;gs._locked=true;  // one answer per word
    const isC=val===gs._answer;
    if(isC){sfxCorrect();gs._ss++;}else sfxWrong();
    btn.classList.replace('border-gray-200',isC?'border-green-500':'border-red-500');
    btn.classList.add(isC?'bg-green-50':'bg-red-50');
    // visual state only: stamp the chosen letter(s) onto the paper in green / red ink
    const sc=btn.closest?btn.closest('.ltr-scene'):null;
    if(sc){
        sc.classList.add('ltr-locked');
        const pp=sc.querySelector('.ltr-paper'); if(pp)pp.classList.add(isC?'is-ok':'is-bad');
        const vs=[...val];
        sc.querySelectorAll('.ltr-hole').forEach((h,k)=>{h.textContent=vs[k]||'';h.classList.add(isC?'is-ok':'is-bad');});
    }
    gs._si++;
    setTimeout(()=>_ltrNext(document.getElementById('gameContent')),isC?450:1100);
}
 
