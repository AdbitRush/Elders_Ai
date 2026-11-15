// ═══════════════════════════════════════════════════════════════════════════════
// GAME 23: WORD CATEGORY — pick the word that belongs to the category
// Presentation: market stall — hanging wooden sign + labelled jars on a shelf
// ═══════════════════════════════════════════════════════════════════════════════
const _CAT_POOLS={
  he:[
    {cat:'פירות',        members:['תפוח','בננה','אגס','ענבים','אבטיח','תות','משמש','שזיף']},
    {cat:'ירקות',        members:['מלפפון','עגבנייה','גזר','חסה','בצל','פלפל','קישוא','כרוב']},
    {cat:'בעלי חיים',    members:['כלב','חתול','סוס','פרה','אריה','דוב','שועל','ארנב']},
    {cat:'כלי תחבורה',   members:['מכונית','אוטובוס','רכבת','אופניים','מטוס','אונייה','משאית','קטנוע']},
    {cat:'חלקי הבית',    members:['מטבח','סלון','מרפסת','מקלחת','חדר שינה','מסדרון','מחסן','גינה']},
    {cat:'בגדים',        members:['חולצה','מכנסיים','שמלה','מעיל','גרביים','כובע','חצאית','סוודר']},
    {cat:'מקצועות',      members:['רופא','מורה','נגר','טבח','נהג','חשמלאי','שוטר','גנן']},
    {cat:'כלי נגינה',    members:['כינור','פסנתר','גיטרה','חליל','תוף','חצוצרה','נבל','אקורדיון']},
    {cat:'מזג אוויר',    members:['גשם','שמש','רוח','שלג','ברד','ערפל','סערה','קשת']},
    {cat:'רגשות',        members:['שמחה','עצב','כעס','פחד','אהבה','גאווה','הפתעה','געגוע']},
  ],
  en:[
    {cat:'Fruits',       members:['Apple','Banana','Pear','Grapes','Melon','Strawberry','Apricot','Plum']},
    {cat:'Vegetables',   members:['Cucumber','Tomato','Carrot','Lettuce','Onion','Pepper','Zucchini','Cabbage']},
    {cat:'Animals',      members:['Dog','Cat','Horse','Cow','Lion','Bear','Fox','Rabbit']},
    {cat:'Vehicles',     members:['Car','Bus','Train','Bicycle','Plane','Ship','Truck','Scooter']},
    {cat:'Rooms',        members:['Kitchen','Living room','Balcony','Bathroom','Bedroom','Hallway','Garage','Garden']},
    {cat:'Clothing',     members:['Shirt','Pants','Dress','Coat','Socks','Hat','Skirt','Sweater']},
    {cat:'Professions',  members:['Doctor','Teacher','Carpenter','Chef','Driver','Electrician','Officer','Gardener']},
    {cat:'Instruments',  members:['Violin','Piano','Guitar','Flute','Drum','Trumpet','Harp','Accordion']},
    {cat:'Weather',      members:['Rain','Sun','Wind','Snow','Hail','Fog','Storm','Rainbow']},
    {cat:'Feelings',     members:['Joy','Sadness','Anger','Fear','Love','Pride','Surprise','Longing']},
  ],
};
// Scene styles live on the existing function object (no new global name).
_catNext._css=`<style>
.cat-scene{margin-inline:auto;color:#3b2a1a}
.cat-scene .cat-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;font-size:1.3rem;font-weight:800;color:#4a3320}
.cat-scene .cat-score{min-width:76px;padding:4px 14px;border-radius:999px;background:#e7f3e4;border:2px solid #2f7d4f;color:#1f5c38;font-variant-numeric:tabular-nums}
.cat-scene .cat-prog{height:12px;margin-bottom:14px;border-radius:999px;background:#eadbb9;border:1px solid #c9a56b;overflow:hidden}
.cat-scene .cat-prog i{display:block;height:100%;border-radius:999px;background:#b7791f}
.cat-scene .cat-stall{position:relative;overflow:hidden;border:4px solid #7b4f27;border-radius:18px;background:repeating-linear-gradient(90deg,rgba(120,80,40,.08) 0 2px,transparent 2px 28px),linear-gradient(180deg,#fbf1dc,#f3e3c3);box-shadow:0 8px 20px rgba(70,40,10,.18)}
.cat-scene .cat-awn{display:block;width:100%;height:44px;filter:drop-shadow(0 3px 2px rgba(60,30,10,.25))}
.cat-scene .cat-signwrap{position:relative;width:min(90%,420px);margin:0 auto 14px;padding-top:24px}
.cat-scene .cat-signwrap::before,.cat-scene .cat-signwrap::after{content:'';position:absolute;top:-6px;width:5px;height:34px;border-radius:3px;background:repeating-linear-gradient(180deg,#8d8477 0 4px,#5f584e 4px 8px)}
.cat-scene .cat-signwrap::before{left:14%}
.cat-scene .cat-signwrap::after{right:14%}
.cat-scene .cat-sign{position:relative;margin:0;padding:14px 12px 16px;border:4px solid #4e3019;border-radius:14px;background:repeating-linear-gradient(92deg,rgba(0,0,0,.06) 0 2px,transparent 2px 15px),linear-gradient(180deg,#96663a,#75491f);color:#fff3d6;font-size:1.35rem;font-weight:700;line-height:1.35;box-shadow:inset 0 2px 0 rgba(255,255,255,.18),0 6px 10px rgba(50,25,5,.3)}
.cat-scene .cat-name{display:inline-block;margin-top:2px;font-size:clamp(1.9rem,8vw,2.6rem);font-weight:800;line-height:1.15;color:#ffdd85;text-shadow:0 2px 0 rgba(0,0,0,.35)}
.cat-scene .cat-shelf{display:grid;grid-template-columns:1fr 1fr;row-gap:8px;padding-bottom:10px}
.cat-scene .cat-slot{display:flex;flex-direction:column;min-width:0;padding:0 5px 16px;background:linear-gradient(180deg,transparent calc(100% - 16px),#b07a3f calc(100% - 16px),#8a5a2b calc(100% - 5px),#5a3819 calc(100% - 5px))}
.cat-scene .cat-jar{position:relative;flex:1;display:flex;align-items:center;justify-content:center;width:100%;min-height:104px;margin-top:20px;padding:16px 5px 12px;border:3px solid #6f8f86;border-radius:20px 20px 12px 12px;background:linear-gradient(100deg,rgba(255,255,255,.8) 0 10%,rgba(255,255,255,.25) 11% 18%,transparent 19%),linear-gradient(180deg,#e9f2ec,#cfe0d6);box-shadow:inset 0 -8px 12px rgba(60,100,90,.15),0 3px 4px rgba(60,35,10,.25);cursor:pointer;font:inherit;transition:transform .15s ease,box-shadow .2s ease,opacity .25s ease;animation:catIn .25s ease;-webkit-tap-highlight-color:transparent}
.cat-scene .cat-jar::before{content:'';position:absolute;top:-17px;left:17%;right:17%;height:17px;border-radius:7px 7px 3px 3px;background:#b5533c;box-shadow:inset 0 3px 0 rgba(255,255,255,.3),inset 0 -3px 0 rgba(0,0,0,.2)}
.cat-scene .cat-slot:nth-child(2) .cat-jar::before{background:#5d8a66}
.cat-scene .cat-slot:nth-child(3) .cat-jar::before{background:#c9932b}
.cat-scene .cat-slot:nth-child(4) .cat-jar::before{background:#7d5a7a}
.cat-scene .cat-label{display:block;width:100%;padding:10px 2px;border:2px solid #c9a56b;border-radius:6px;background:#fffaf0;box-shadow:0 1px 2px rgba(60,35,10,.2);font-size:clamp(1.3rem,5.2vw,1.65rem);font-wei
ght:800;line-height:1.2;color:#3b2a1a;overflow-wrap:anywhere}
.cat-scene .cat-jar:hover{transform:translateY(-3px)}
.cat-scene .cat-jar:active{transform:translateY(0)}
.cat-scene .cat-jar:focus-visible{outline:4px solid #1a365d;outline-offset:3px}
.cat-scene .cat-jar.cat-ok{border-color:#d99a1c;background:linear-gradient(180deg,#fff6d6,#ffe49a);box-shadow:0 0 0 4px #f6c453,0 0 26px 6px rgba(246,196,83,.85);transform:translateY(-3px);animation:catGlow .45s ease both}
.cat-scene .cat-jar.cat-ok .cat-label{border-color:#b7791f}
.cat-scene .cat-jar.cat-ok::after{content:'✓';position:absolute;top:-24px;inset-inline-end:-6px;width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:3px solid #f6c453;background:#2f7d4f;color:#fff;font-size:1.5rem;font-weight:800;line-height:1;box-shadow:0 3px 5px rgba(0,0,0,.3)}
.cat-scene .cat-jar.cat-no{border-color:#9a9a9a;background:#e4e0d8;opacity:.55;filter:grayscale(.7);transform:none;animation:none}
@keyframes catIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes catGlow{0%{box-shadow:0 0 0 0 #f6c453,0 0 0 0 rgba(246,196,83,0)}100%{box-shadow:0 0 0 4px #f6c453,0 0 26px 6px rgba(246,196,83,.85)}}
@media (prefers-reduced-motion:reduce){.cat-scene .cat-jar,.cat-scene .cat-jar.cat-ok{animation:none;transition:none}.cat-scene .cat-jar:hover,.cat-scene .cat-jar.cat-ok{transform:none}}
</style>`;
function initCategory(container){
    const gs=gameState.category;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs._sq=(typeof Levels!=='undefined')?Levels.count('category',_d==='easy'?5:_d==='hard'?10:7,0.5,15):7;
    gs._si=0; gs._ss=0;
    _catNext(container);
}
function _catNext(container){
    if(!gameState.active||gameState.currentId!=='category')return;
    const gs=gameState.category; gs._locked=false;
    if(gs._si>=gs._sq){gs._sessionScore={correct:gs._ss,total:gs._sq};levelComplete();return;}
    const isHe=currentLang==='he';
    const pools=_CAT_POOLS[isHe?'he':'en'];
    const pool=pools[Math.floor(Math.random()*pools.length)];
    const correct=pool.members[Math.floor(Math.random()*pool.members.length)];
    const others=shuffle(pools.filter(p=>p.cat!==pool.cat)).slice(0,3)
        .map(p=>p.members[Math.floor(Math.random()*p.members.length)]);
    gs._answer=correct;
    let html=`<div class="max-w-xl w-full text-center cat-scene">${_catNext._css}
      <div class="cat-top"><span>${gt('Question', 'שאלה')} ${gs._si+1}/${gs._sq}</span><span class="text-green-600 cat-score">✓ ${gs._ss}</span></div>
      <div class="cat-prog" aria-hidden="true"><i style="width:${Math.round(gs._si/gs._sq*100)}%"></i></div>
      <div class="cat-stall">
      <svg class="cat-awn" viewBox="0 0 360 44" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><pattern id="catAwnP" width="40" height="44" patternUnits="userSpaceOnUse"><rect width="20" height="44" fill="#b5533c"/><rect x="20" width="20" height="44" fill="#fbf3e0"/></pattern></defs><path d="M0 0H360V28${'q-10 16-20 0'.repeat(18)}Z" fill="url(#catAwnP)"/><rect width="360" height="5" fill="#7b4f27"/></svg>
      <div class="cat-signwrap"><h3 class="cat-sign">${gt('Which one belongs to:', 'מה שייך לקטגוריה:')}<br><span class="cat-name">${pool.cat}</span>?</h3></div>
      <div class="cat-shelf">`;
    shuffle([correct,...others]).forEach(w=>{
        html+=`<div class="cat-slot"><button onclick="_catAnswer(this,'${w.replace(/'/g,"\\'")}')" class="cat-jar border-2 border-gray-200"><span class="cat-label">${w}</span></button></div>`;
    });
    container.innerHTML=html+`</div></div></div>`;
}
function _catAnswer(btn,val){
    const gs=gameState.category;
    if(gs._locked)return;gs._locked=true;  // one answer per question
    const isC=val===gs._answer;
    if(isC){sfxCorrect();gs._ss++;}else sfxWrong();
    {const _c=document.querySelector('#gameContent .text-green-600');if(_c)_c.textContent='✓ '+gs._ss;}
    btn.classList.replace('border-gray-200',isC?'border-green-500':'border-red-500');
    btn.classList.add(isC?'bg-green-50':'bg-red-50');
    btn.classList.add(isC?'cat-ok':'cat-no');   // golden glow + check rosette / soft dim
    gs._si++;
    setTimeout(()=>_catNext(document.getElementById('gameContent')),isC?450:1000);
}
 


