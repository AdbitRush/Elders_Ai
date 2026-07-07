// ═══════════════════════════════════════════════════════════════════════════════
// GAME 25: LIFE SIM — "Time Journey": seniors play their young selves,
// youngsters play being old. Scenario cards → choices → memories ❤
// ═══════════════════════════════════════════════════════════════════════════════
const _LS_ERAS = {
    young: {
        icon:'🕺', grad:'linear-gradient(160deg,#3b0764,#9d174d,#f59e0b)',
        he:'לשחק את עצמי בגיל 20', en:'Play my 20-year-old self',
        scenes: [
            {e:'💃', he:'ערב ריקודים בעיר! מה עושים?', en:'Dance night in town! What do you do?',
             opts:[{he:'רוקדים עד הבוקר',en:'Dance till sunrise',g:1},{he:'יושבים בצד',en:'Sit on the side',g:0},{he:'מזמינים מישהו לרקוד',en:'Ask someone to dance',g:1}]},
            {e:'💌', he:'קיבלתם מכתב אהבה ראשון...', en:'You got your first love letter...',
             opts:[{he:'עונים באותו ערב',en:'Reply the same evening',g:1},{he:'מתביישים ולא עונים',en:'Too shy to answer',g:0},{he:'שומרים אותו לנצח',en:'Keep it forever',g:1}]},
            {e:'🎓', he:'הצעת עבודה ראשונה בעיר הגדולה!', en:'First job offer in the big city!',
             opts:[{he:'קופצים על ההזדמנות',en:'Jump on it',g:1},{he:'נשארים בבית',en:'Stay home',g:0},{he:'מתייעצים עם אמא',en:'Ask mom first',g:1}]},
            {e:'🏍️', he:'חבר מציע טרמפ על אופנוע...', en:'A friend offers a motorcycle ride...',
             opts:[{he:'עולים בלי לחשוב',en:'Hop on!',g:1},{he:'רק עם קסדה',en:'Only with a helmet',g:1},{he:'בשום אופן לא',en:'No way',g:0}]},
            {e:'🎸', he:'חברים פותחים להקה. אתם...?', en:'Friends start a band. You...?',
             opts:[{he:'סולן ראשי כמובן',en:'Lead singer of course',g:1},{he:'מנגנים בתופים',en:'On the drums',g:1},{he:'רק קהל',en:'Just the audience',g:0}]},
            {e:'🌍', he:'חופשה גדולה — לאן נוסעים?', en:'The big vacation — where to?',
             opts:[{he:'טיול תרמילאים באירופה',en:'Backpacking Europe',g:1},{he:'נשארים לעבוד',en:'Stay and work',g:0},{he:'ים המלח עם החברים',en:'Dead Sea with friends',g:1}]},
        ],
    },
    old: {
        icon:'👵', grad:'linear-gradient(160deg,#78350f,#b45309,#fcd34d)',
        he:'לשחק סבא/סבתא ליום אחד', en:'Play grandma/grandpa for a day',
        scenes: [
            {e:'👨‍👩‍👧‍👦', he:'הנכדים באים פתאום לביקור!', en:'The grandkids show up unannounced!',
             opts:[{he:'מוציאים עוגיות מהמקפיא',en:'Cookies from the freezer',g:1},{he:'מעמידים פנים שלא בבית',en:'Pretend not home',g:0},{he:'מספרים להם סיפור מהצבא',en:'Tell an army story',g:1}]},
            {e:'📱', he:'הטלפון החכם "נתקע" שוב...', en:'The smartphone is "stuck" again...',
             opts:[{he:'מכבים ומדליקים',en:'Turn it off and on',g:1},{he:'דופקים עליו',en:'Smack it',g:0},{he:'מתקשרים לנכד',en:'Call the grandkid',g:1}]},
            {e:'🧓', he:'צהריים. הספה קוראת לכם...', en:'Noon. The couch is calling...',
             opts:[{he:'שנ"צ קדוש',en:'Sacred afternoon nap',g:1},{he:'קפה שלישי במקום',en:'Third coffee instead',g:0},{he:'שנ"צ עם החדשות ברקע',en:'Nap with the news on',g:1}]},
            {e:'🥣', he:'הנכדה טוענת שהמרק "קצת מלוח"...', en:'Granddaughter says the soup is "a bit salty"...',
             opts:[{he:'"ככה סבתא שלי בישלה!"',en:'"That is how MY grandma made it!"',g:1},{he:'מוסיפים עוד מלח',en:'Add more salt',g:0},{he:'נותנים לה לבשל בפעם הבאה',en:'Let her cook next time',g:1}]},
            {e:'🚌', he:'צעיר מפנה לכם מקום באוטובוס.', en:'A young man offers you his bus seat.',
             opts:[{he:'מודים בחיוך ומתיישבים',en:'Smile and sit',g:1},{he:'"אני צעיר ממך ברוחי!"',en:'"I am younger at heart!"',g:1},{he:'מתעלמים בעלבון',en:'Take offense',g:0}]},
            {e:'🌅', he:'חמש בבוקר. ערים. מה עכשיו?', en:'5 AM. Wide awake. Now what?',
             opts:[{he:'הליכת בוקר בשכונה',en:'Morning walk',g:1},{he:'מתקשרים לילדים להעיר אותם',en:'Wake the kids by phone',g:0},{he:'תה ומרפסת',en:'Tea on the balcony',g:1}]},
        ],
    },
};

function initLifeSim(container){
    const gs=gameState.lifesim;
    gs._stage='pick';
    _lsPick(container);
}
function _lsPick(container){
    const isHe=currentLang==='he';
    let html=`<div class="max-w-2xl w-full text-center">
      <p class="text-xl font-bold mb-6 text-gray-200">${isHe?'✨ מכונת הזמן מוכנה. לאן נוסעים?':'✨ The time machine is ready. Where to?'}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">`;
    for(const [k,era] of Object.entries(_LS_ERAS)){
        html+=`<button onclick="_lsStart('${k}')" class="rounded-2xl p-8 text-white shadow-xl transition hover:scale-105"
          style="background:${era.grad}">
          <div class="text-6xl mb-3" style="animation:floaty 3s ease-in-out infinite">${era.icon}</div>
          <div class="text-xl font-bold">${isHe?era.he:era.en}</div>
        </button>`;
    }
    container.innerHTML=html+'</div></div>';
}
function _lsStart(eraKey){
    const gs=gameState.lifesim;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs._era=eraKey;
    gs._scenes=shuffle([..._LS_ERAS[eraKey].scenes]).slice(0,_d==='easy'?4:_d==='hard'?6:5);
    gs._si=0; gs._hearts=0;
    _lsScene(document.getElementById('gameContent'));
}
function _lsScene(container){
    if(!gameState.active||gameState.currentId!=='lifesim')return;
    const gs=gameState.lifesim, isHe=currentLang==='he';
    const era=_LS_ERAS[gs._era];
    if(gs._si>=gs._scenes.length){
        gs._sessionScore={correct:gs._hearts,total:gs._scenes.length};
        levelComplete(); return;
    }
    const sc=gs._scenes[gs._si];
    let html=`<div class="max-w-2xl w-full text-center rounded-3xl p-8 md:p-10 shadow-2xl" style="background:${era.grad}">
      <div class="flex justify-between text-sm font-bold text-white/80 mb-4">
        <span>${era.icon} ${gs._si+1}/${gs._scenes.length}</span>
        <span>${'❤️'.repeat(gs._hearts)||'·'}</span>
      </div>
      <div class="text-7xl md:text-8xl mb-6" style="animation:floaty 3.4s ease-in-out infinite">${sc.e}</div>
      <p class="text-xl md:text-2xl font-bold text-white mb-8" style="text-shadow:0 2px 12px rgba(0,0,0,.4)">${isHe?sc.he:sc.en}</p>
      <div class="grid gap-3">`;
    shuffle([...sc.opts]).forEach((o)=>{
        html+=`<button onclick="_lsChoose(${o.g})" class="bg-white/95 text-gray-800 text-lg font-bold p-4 rounded-xl shadow-md transition hover:scale-[1.03] hover:bg-white">${isHe?o.he:o.en}</button>`;
    });
    container.innerHTML=html+'</div></div>';
}
function _lsChoose(good){
    const gs=gameState.lifesim, isHe=currentLang==='he';
    if(good){sfxCorrect();gs._hearts++;}else sfxWrong();
    const c=document.getElementById('gameContent');
    const note=document.createElement('div');
    note.className='text-2xl font-black text-center mt-4';
    note.style.color=good?'#4ade80':'#fca5a5';
    note.textContent=good?(isHe?'❤️ זיכרון יפה נוסף!':'❤️ A beautiful memory!'):(isHe?'😅 גם זו חוויה...':'😅 Also an experience...');
    c.appendChild(note);
    gs._si++;
    setTimeout(()=>_lsScene(c), good?900:1200);
}
