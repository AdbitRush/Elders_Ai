// ═══════════════════════════════════════════════════════════════════════════════
// DAILY CHALLENGE — 3 curated games per day, star reward on completion
// ═══════════════════════════════════════════════════════════════════════════════
const DailyChallenge = (() => {
  const ALL_GAMES = ['memory','oddoneout','math','wordsearch','simon','sudoku','shapes',
                     'solitaire','trivia','numseq','unscramble','pairs','truefalse','flags','proverbs',
                     'hangman','recall','tetris'];

  function _today() { return new Date().toISOString().slice(0,10); }

  function _seededRand(seed) {
    let x = Math.sin(seed)*10000; return x - Math.floor(x);
  }

  function todayGames() {
    const d = _today();
    const n = d.replace(/-/g,'');
    // deterministic: seed from date number
    const seed = parseInt(n) % 997;
    const pool = [...ALL_GAMES];
    const out = [];
    for (let i=0;i<3;i++) {
      const idx = Math.floor(_seededRand(seed+i*7)*(pool.length));
      out.push(pool.splice(idx,1)[0]);
    }
    return out;
  }

  function getProgress() {
    const key = 'gg_dc_'+_today();
    try { return new Set(JSON.parse(localStorage.getItem(key)||'[]')); }
    catch { return new Set(); }
  }

  function markDone(gameId) {
    const key = 'gg_dc_'+_today();
    const done = getProgress(); done.add(gameId);
    localStorage.setItem(key, JSON.stringify([...done]));
    _refreshBanner();
    if (isCompleted()) {
      _celebrate();
      if (typeof Achievements!=='undefined') Achievements.check();
    }
  }

  function isCompleted() {
    const done = getProgress(); const games = todayGames();
    return games.every(g => done.has(g));
  }

  function _celebrate() {
    if (localStorage.getItem('gg_dc_cel_'+_today())) return;
    localStorage.setItem('gg_dc_cel_'+_today(),'1');
    const isHe = typeof currentLang!=='undefined'?currentLang==='he':true;
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:76px;left:50%;transform:translateX(-50%);z-index:5000;background:linear-gradient(135deg,#78350f,#b7791f);border:2px solid #f6c048;border-radius:1.1rem;padding:1.2rem 2rem;text-align:center;box-shadow:0 16px 48px rgba(0,0,0,0.7);min-width:280px;animation:badgeSlideIn 0.45s cubic-bezier(.22,.68,0,1.2) forwards';
    t.innerHTML = `<div style="font-size:2.2rem">⭐</div>
      <div style="color:#fef3c7;font-weight:800;font-size:1.15rem">${isHe?'השלמתם את האתגר היומי!':'Daily Challenge Complete!'}</div>
      <div style="color:rgba(254,243,199,0.75);font-size:0.85rem;margin-top:4px">⭐ +1 ${isHe?'נקודת כוכב':'star point'}</div>`;
    document.body.appendChild(t);
    if (typeof sfxWin==='function') sfxWin();
    if (typeof launchConfetti==='function') launchConfetti();
    setTimeout(()=>{ t.style.transition='opacity 0.5s'; t.style.opacity='0'; setTimeout(()=>t.remove(),550); },3800);
  }

  function _gameLabel(id) {
    // Try to get the name from the card DOM
    const card = document.querySelector(`[data-game="${id}"] h3`);
    if (card) return card.textContent.trim();
    const map = { memory:'זיכרון', oddoneout:'יוצא דופן', math:'חשבון', wordsearch:'חיפוש מילים',
      simon:'סיימון', sudoku:'סודוקו', shapes:'צורות', trivia:'טריוויה',
      numseq:'רצף מספרים', unscramble:'פענוח', pairs:'זוגות', truefalse:'נכון/לא נכון',
      flags:'דגלים', proverbs:'פתגמים', hangman:'תלייה', recall:'זיכרון תמונות', tetris:'טטריס' };
    return map[id]||id;
  }

  function _starStr() {
    const done = getProgress(); const games = todayGames();
    const c = games.filter(g=>done.has(g)).length;
    return ['☆','☆','☆'].map((_,i)=>i<c?'⭐':'☆').join('');
  }

  function injectBanner(container) {
    const isHe = typeof currentLang!=='undefined'?currentLang==='he':true;
    const existing = document.getElementById('daily-challenge-banner');
    if (existing) existing.remove();

    const games = todayGames();
    const done  = getProgress();

    const banner = document.createElement('div');
    banner.id = 'daily-challenge-banner';

    const pills = games.map(g =>
      `<span class="dc-game-pill${done.has(g)?' done':''}" onclick="loadGame('${g}',1)" title="${g}">
        ${done.has(g)?'✅':''} ${_gameLabel(g)}
      </span>`
    ).join('');

    banner.innerHTML = `
      <div>
        <span style="font-weight:800;color:#f6c048;font-size:0.9rem">📅 ${isHe?'האתגר היומי':'Daily Challenge'}</span>
        <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px">${pills}</div>
      </div>
      <div style="text-align:center">
        <div id="dc-stars" style="font-size:1.4rem;letter-spacing:2px">${_starStr()}</div>
        <div style="font-size:0.7rem;color:rgba(148,163,184,0.7);margin-top:2px">${done.size}/${games.length}</div>
      </div>`;

    container.prepend(banner);
    _highlightCards(games, done);
  }

  function _highlightCards(games, done) {
    document.querySelectorAll('.premium-card').forEach(card => {
      const id = card.dataset.game;
      card.classList.remove('dc-highlight');
      card.querySelector('.dc-crown-badge')?.remove();
      if (games.includes(id)) {
        if (!done.has(id)) {
          card.classList.add('dc-highlight');
          const crown = document.createElement('span');
          crown.className='dc-crown-badge'; crown.textContent='📅';
          card.style.position='relative'; card.appendChild(crown);
        }
      }
    });
  }

  function _refreshBanner() {
    const games = todayGames(); const done = getProgress();
    const pills = document.querySelectorAll('.dc-game-pill');
    if (!pills.length) return;
    pills.forEach((p,i) => {
      const g = games[i]; if (!g) return;
      if (done.has(g)) { p.classList.add('done'); p.innerHTML = `✅ ${_gameLabel(g)}`; }
    });
    const stars = document.getElementById('dc-stars');
    if (stars) stars.textContent = _starStr();
    _highlightCards(games, done);
  }

  return { todayGames, getProgress, markDone, isCompleted, injectBanner, _refreshBanner };
})();
