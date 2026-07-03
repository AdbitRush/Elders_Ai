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
    const gs=gameState.letters;
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
    let html=`<div class="max-w-xl w-full text-center">
      <div class="flex justify-between text-sm font-bold text-gray-400 mb-2"><span>${isHe?'מילה':'Word'} ${gs._si+1}/${gs._sq}</span><span class="text-green-600">✓ ${gs._ss}</span></div>
      <p class="text-lg text-gray-500 mb-4 font-bold">${isHe?(holes>1?'אילו אותיות חסרות?':'איזו אות חסרה?'):(holes>1?'Which letters are missing?':'Which letter is missing?')}</p>
      <div class="text-5xl md:text-6xl font-black tracking-widest py-9 bg-white text-[#1a365d] rounded-2xl shadow-inner mb-8">${shown}</div>
      <div class="grid grid-cols-4 gap-3">`;
    shuffle([...opts]).forEach(o=>{
        html+=`<button onclick="_ltrAnswer(this,'${o}')" class="bg-white border-2 border-gray-200 hover:border-[#b7791f] text-3xl font-bold p-4 rounded-xl transition shadow-sm">${o}</button>`;
    });
    container.innerHTML=html+`</div></div>`;
}
function _ltrAnswer(btn,val){
    const gs=gameState.letters;
    const isC=val===gs._answer;
    if(isC){sfxCorrect();gs._ss++;}else sfxWrong();
    btn.classList.replace('border-gray-200',isC?'border-green-500':'border-red-500');
    btn.classList.add(isC?'bg-green-50':'bg-red-50');
    gs._si++;
    setTimeout(()=>_ltrNext(document.getElementById('gameContent')),isC?450:1100);
}
