// ═══════════════════════════════════════════════════════════════════════════════
// GAME 23: WORD CATEGORY — pick the word that belongs to the category
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
function initCategory(container){
    const gs=gameState.category;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs._sq=(typeof Levels!=='undefined')?Levels.count('category',_d==='easy'?5:_d==='hard'?10:7,0.5,15):7;
    gs._si=0; gs._ss=0;
    _catNext(container);
}
function _catNext(container){
    if(!gameState.active||gameState.currentId!=='category')return;
    const gs=gameState.category;
    if(gs._si>=gs._sq){gs._sessionScore={correct:gs._ss,total:gs._sq};levelComplete();return;}
    const isHe=currentLang==='he';
    const pools=_CAT_POOLS[isHe?'he':'en'];
    const pool=pools[Math.floor(Math.random()*pools.length)];
    const correct=pool.members[Math.floor(Math.random()*pool.members.length)];
    const others=shuffle(pools.filter(p=>p.cat!==pool.cat)).slice(0,3)
        .map(p=>p.members[Math.floor(Math.random()*p.members.length)]);
    gs._answer=correct;
    let html=`<div class="max-w-xl w-full text-center">
      <div class="flex justify-between text-sm font-bold text-gray-400 mb-2"><span>${isHe?'שאלה':'Question'} ${gs._si+1}/${gs._sq}</span><span class="text-green-600">✓ ${gs._ss}</span></div>
      <h3 class="text-2xl md:text-3xl font-bold mb-8 text-[#1a365d] bg-blue-50 p-5 rounded-xl">${isHe?'מה שייך לקטגוריה:':'Which one belongs to:'}<br><span class="text-[#b7791f]">${pool.cat}</span>?</h3>
      <div class="grid grid-cols-2 gap-4">`;
    shuffle([correct,...others]).forEach(w=>{
        html+=`<button onclick="_catAnswer(this,'${w.replace(/'/g,"\\'")}')" class="bg-white border-2 border-gray-200 hover:border-[#b7791f] text-2xl font-bold p-5 rounded-xl transition shadow-sm">${w}</button>`;
    });
    container.innerHTML=html+`</div></div>`;
}
function _catAnswer(btn,val){
    const gs=gameState.category;
    const isC=val===gs._answer;
    if(isC){sfxCorrect();gs._ss++;}else sfxWrong();
    btn.classList.replace('border-gray-200',isC?'border-green-500':'border-red-500');
    btn.classList.add(isC?'bg-green-50':'bg-red-50');
    gs._si++;
    setTimeout(()=>_catNext(document.getElementById('gameContent')),isC?450:1000);
}
