// ═══════════════════════════════════════════════════════════════════════════════
// ACHIEVEMENTS — badge system: check, award, notify, display wall
// ═══════════════════════════════════════════════════════════════════════════════
const Achievements = (() => {
  const KEY = 'gg_achievements';

  const DEFS = [
    { id:'first_game',    icon:'🌟', he:'צעד ראשון',        en:'First Step',       desc_he:'שיחקתם את המשחק הראשון',       desc_en:'Played your first game',          check:s=>s.total>=1 },
    { id:'games_10',      icon:'🎯', he:'מתחיל',             en:'Beginner',         desc_he:'10 משחקים',                    desc_en:'10 games played',                 check:s=>s.total>=10 },
    { id:'games_50',      icon:'🏅', he:'שחקן מנוסה',        en:'Experienced',      desc_he:'50 משחקים',                    desc_en:'50 games played',                 check:s=>s.total>=50 },
    { id:'games_100',     icon:'🏆', he:'משחקן ותיק',        en:'Veteran',          desc_he:'100 משחקים!',                  desc_en:'100 games played!',               check:s=>s.total>=100 },
    { id:'streak_3',      icon:'🔥', he:'שגרתי',             en:'Consistent',       desc_he:'3 ימים ברצף',                  desc_en:'3 day streak',                    check:s=>s.streak>=3 },
    { id:'streak_7',      icon:'💎', he:'שומר המוח',         en:'Brain Guardian',   desc_he:'7 ימים ברצף',                  desc_en:'7 day streak',                    check:s=>s.streak>=7 },
    { id:'streak_30',     icon:'👑', he:'מלך/מלכת המוח',    en:'Brain Royalty',    desc_he:'30 ימים ברצף!',                desc_en:'30 day streak!',                  check:s=>s.streak>=30 },
    { id:'daily_done',    icon:'⭐', he:'גיבור יומי',         en:'Daily Hero',       desc_he:'השלמתם את האתגר היומי',        desc_en:'Completed today\'s challenge',    check:s=>s.dailyDone },
    { id:'explorer',      icon:'🌈', he:'חוקר',              en:'Explorer',         desc_he:'שיחקתם בכל 18 המשחקים',       desc_en:'Tried all 18 games',              check:s=>s.uniqueGames>=18 },
    { id:'memory_5',      icon:'🧠', he:'זיכרון חזק',        en:'Strong Memory',    desc_he:'רמה 5 בזיכרון',                desc_en:'Memory level 5',                  check:s=>(s.hs.memory||0)>=5 },
    { id:'memory_10',     icon:'🧩', he:'אלוף הזיכרון',      en:'Memory Champion',  desc_he:'רמה 10 בזיכרון!',              desc_en:'Memory level 10!',                check:s=>(s.hs.memory||0)>=10 },
    { id:'perfect',       icon:'💯', he:'מושלם',              en:'Perfect',          desc_he:'ניצחתם בלי טעויות',            desc_en:'Won without any mistakes',        check:s=>s.perfect },
    { id:'early_bird',    icon:'🌅', he:'ציפור השחר',        en:'Early Bird',       desc_he:'שיחקתם לפני 8 בבוקר',          desc_en:'Played before 8am',               check:s=>new Date().getHours()<8&&s.total>=1 },
    { id:'night_owl',     icon:'🦉', he:'ינשוף הלילה',       en:'Night Owl',        desc_he:'שיחקתם אחרי 10 בלילה',         desc_en:'Played after 10pm',               check:s=>new Date().getHours()>=22&&s.total>=1 },
    { id:'brain_50',      icon:'🧬', he:'מוח בריא',          en:'Healthy Brain',    desc_he:'ניקוד בריאות מוח 50+',          desc_en:'Brain health score 50+',          check:s=>s.brainScore>=50 },
    { id:'brain_80',      icon:'⚡', he:'מוח מבריק',         en:'Brilliant Mind',   desc_he:'ניקוד בריאות מוח 80+!',         desc_en:'Brain health score 80+!',         check:s=>s.brainScore>=80 },
    { id:'trivia_ace',    icon:'📚', he:'ידען',               en:'Scholar',          desc_he:'רמה 8 בטריוויה',               desc_en:'Trivia level 8',                  check:s=>(s.hs.trivia||0)>=8 },
    { id:'shabbat',       icon:'🕯️', he:'שבת שלום',          en:'Shabbat Shalom',   desc_he:'שיחקתם ביום שישי',             desc_en:'Played on Friday',                check:s=>new Date().getDay()===5&&s.total>=1 },
  ];

  function getEarned() {
    try { return new Set(JSON.parse(localStorage.getItem(KEY)||'[]')); }
    catch { return new Set(); }
  }

  function _save(set) { localStorage.setItem(KEY, JSON.stringify([...set])); }

  function _buildState(extra) {
    const ret = typeof Retention!=='undefined' ? Retention.load() : {};
    const ALL = ['memory','oddoneout','math','wordsearch','simon','sudoku','shapes','solitaire','trivia','numseq','unscramble','pairs','truefalse','flags','proverbs','hangman','recall','tetris'];
    const hs = {};
    let uniqueGames = 0;
    ALL.forEach(id => {
      const v = parseInt(localStorage.getItem('gg_hs_'+id)||'0');
      hs[id] = v; if (v>0) uniqueGames++;
    });
    const brainScore = typeof BrainScore!=='undefined' ? BrainScore.compute() : 0;
    const dailyDone  = typeof DailyChallenge!=='undefined' ? DailyChallenge.isCompleted() : false;
    return {
      total: ret.totalGames||0, streak: ret.streak||0,
      uniqueGames, hs, brainScore, dailyDone,
      perfect: extra?.perfect||false,
    };
  }

  function check(extra) {
    const earned = getEarned();
    const state  = _buildState(extra);
    const newOnes = [];
    DEFS.forEach(def => {
      if (!earned.has(def.id) && def.check(state)) {
        earned.add(def.id); newOnes.push(def);
      }
    });
    if (newOnes.length) {
      _save(earned);
      newOnes.forEach((def, i) => setTimeout(() => _notify(def), i*900));
    }
    return newOnes;
  }

  function _notify(def) {
    const isHe = typeof currentLang!=='undefined' ? currentLang==='he' : true;
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:76px;left:50%;transform:translateX(-50%);z-index:5000;background:linear-gradient(135deg,#1a365d,#2c5282);border:2px solid #f6c048;border-radius:1.1rem;padding:1rem 1.5rem;text-align:center;box-shadow:0 16px 48px rgba(0,0,0,0.7);min-width:260px;max-width:320px;animation:badgeSlideIn 0.45s cubic-bezier(.22,.68,0,1.2) forwards';
    t.innerHTML = `<div style="font-size:2.5rem;line-height:1.2">${def.icon}</div>
      <div style="color:#f6c048;font-weight:800;font-size:0.9rem;margin-top:2px">${isHe?'🏅 מדליה חדשה!':'🏅 New Badge!'}</div>
      <div style="color:#fff;font-weight:700;font-size:1.1rem;margin-top:3px">${isHe?def.he:def.en}</div>
      <div style="color:rgba(180,210,255,0.75);font-size:0.78rem;margin-top:3px">${isHe?def.desc_he:def.desc_en}</div>`;
    document.body.appendChild(t);
    if (typeof sfxWin==='function') sfxWin();
    setTimeout(()=>{ t.style.transition='opacity 0.5s'; t.style.opacity='0'; setTimeout(()=>t.remove(),550); }, 3500);
  }

  function renderWall(container) {
    const isHe = typeof currentLang!=='undefined' ? currentLang==='he' : true;
    const earned = getEarned();
    container.innerHTML = `
      <h3 style="font-size:1.25rem;font-weight:800;color:#f6c048;text-align:center;margin:0 0 1rem">
        ${isHe?'🏅 מדליות':'🏅 Achievements'} (${earned.size}/${DEFS.length})
      </h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">
        ${DEFS.map(def => {
          const got = earned.has(def.id);
          return `<div style="background:${got?'linear-gradient(135deg,rgba(183,121,31,0.22),rgba(246,192,72,0.08))':'rgba(255,255,255,0.03)'};border:1px solid ${got?'rgba(183,121,31,0.5)':'rgba(255,255,255,0.07)'};border-radius:0.85rem;padding:0.8rem 0.6rem;text-align:center;${got?'':'filter:grayscale(1);opacity:0.35'}">
            <div style="font-size:1.7rem;line-height:1.3">${got?def.icon:'🔒'}</div>
            <div style="font-size:0.75rem;font-weight:700;color:${got?'#f6c048':'#94a3b8'};margin-top:4px">${isHe?def.he:def.en}</div>
            <div style="font-size:0.65rem;color:rgba(148,163,184,0.65);margin-top:2px">${isHe?def.desc_he:def.desc_en}</div>
          </div>`;
        }).join('')}
      </div>`;
  }

  function showModal() {
    let ov = document.getElementById('ach-modal');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'ach-modal';
      ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:300;display:flex;align-items:center;justify-content:center;padding:1rem';
      ov.innerHTML = `<div style="background:linear-gradient(160deg,#0a1628,#0f2744);border:1px solid rgba(183,121,31,0.35);border-radius:1.75rem;padding:2rem;max-width:640px;width:100%;max-height:85vh;overflow-y:auto;position:relative">
        <button onclick="document.getElementById('ach-modal').remove()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:#64748b;font-size:1.5rem;cursor:pointer">✕</button>
        <div id="ach-wall"></div></div>`;
      document.body.appendChild(ov);
    }
    ov.style.display = 'flex';
    renderWall(document.getElementById('ach-wall'));
  }

  return { DEFS, getEarned, check, renderWall, showModal };
})();
