/* hub-nav.js — the top of the hub for 60+ games (2026-10-10 review):
   1. "Continue" = the last game played (resumes at its saved level) and the player's favorites, first thing on the page;
   2. genre chips that filter the game grid in place: All plus one chip per hub section (2026-11: every section has
      a chip, not only the first four), and a search box that matches game titles and descriptions as you type.
   Every game has a genre: the original 28 from GENRE below, the games added from 2026-10 from tools/new_games.json
   (window.NEW_GAMES[].section). Nothing is removed: "All" shows every card again. The choice is remembered per browser. */
const HubNav = (() => {
  const GENRE = {
    klondike: 'cards', solitaire: 'cards', memory: 'cards',
    wordsearch: 'words', unscramble: 'words', hangman: 'words', letters: 'words', category: 'words', pairs: 'words',
    sudoku: 'words', math: 'words', numseq: 'words', digitspan: 'words', counting: 'words', clock: 'words',
    oddoneout: 'words', shapes: 'words', colormatch: 'words', jigsaw: 'words', recall: 'words',
    trivia: 'trivia', truefalse: 'trivia', flags: 'trivia', proverbs: 'trivia', lifesim: 'trivia',
    blocks: 'arcade', sequence: 'arcade', safari: 'arcade',
  };
  const L = {
    en: { all: 'All games', cards: 'Cards & Board', words: 'Words & Numbers', trivia: 'Trivia', pastimes: 'Kitchen Table', puzzlebook: 'Puzzle Book', handheld: 'Early Computers', arcade: 'Arcade', garden: 'Gentle Practice', cont: 'Continue', favs: 'Your favorites', pick: 'Pick a kind of game', none: 'No games here yet - more are on the way.', find: 'Find a game', ph: 'Type a name, like solitaire or chess', count: (n, m) => (n === m ? `${m} games` : `Showing ${n} of ${m} games`), nomatch: (q) => `No game matches "${q}". Try another word, or clear the search.`, clear: 'Clear search' },
    he: { all: 'כל המשחקים', cards: 'קלפים ולוח', words: 'מילים ומספרים', trivia: 'טריוויה', pastimes: 'שולחן המטבח', puzzlebook: 'חוברת תשבצים', handheld: 'מחשבים ראשונים', arcade: 'ארקייד', garden: 'תרגול רגוע', cont: 'להמשיך', favs: 'המועדפים שלכם', pick: 'בחרו סוג משחק', none: 'עדיין אין כאן משחקים - בקרוב.', find: 'חיפוש משחק', ph: 'הקלידו שם, למשל סוליטר או שחמט', count: (n, m) => (n === m ? `${m} משחקים` : `מוצגים ${n} מתוך ${m} משחקים`), nomatch: (q) => `אין משחק שמתאים ל"${q}". נסו מילה אחרת או נקו את החיפוש.`, clear: 'ניקוי החיפוש' },
  };
  const KEY = 'gg_genre';
  const tx = () => L[typeof currentLang !== 'undefined' && L[currentLang] ? currentLang : 'en'];
  const genreOf = (id) => GENRE[id] || ((window.NEW_GAMES || []).find((g) => g.id === id) || {}).section || 'words';
  const idOf = (card) => { const m = (card.getAttribute('onclick') || '').match(/loadGame\('(\w+)'\)/); return m && m[1]; };
  const title = (id) => (typeof _menuGameTitles !== 'undefined' && _menuGameTitles[id] && typeof t === 'function') ? t(_menuGameTitles[id]) : id;
  const SECS = ['all', 'cards', 'words', 'trivia', 'pastimes', 'puzzlebook', 'handheld', 'arcade', 'garden'];
  // chip label: the short English/Hebrew name, else the translated section title (text before any colon)
  const label = (g) => { if (L[currentLangSafe()]) return tx()[g]; if (g === 'all') return tx().all; const k = 'sec_' + g + '_title'; const v = typeof t === 'function' ? t(k) : ''; return v && v !== k ? v.split(':')[0].trim() : L.en[g]; };
  function currentLangSafe() { return typeof currentLang !== 'undefined' ? currentLang : 'en'; }
  const norm = (x) => (x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N} ]+/gu, ' ');
  let q = '';
  let cur = 'all';
  try { cur = localStorage.getItem(KEY) || 'all'; } catch (e) {}

  function apply() {
    const grid = document.getElementById('homeScreen'); if (!grid) return;
    let shown = 0, total = 0; const secOn = new Set(), words = norm(q).split(' ').filter(Boolean);
    grid.querySelectorAll('.premium-card').forEach((c) => {
      const g = genreOf(idOf(c)); total++;
      const txt = c._hnText || (c._hnText = norm((c.querySelector('h3') || {}).textContent + ' ' + (c.querySelector('p') || {}).textContent + ' ' + idOf(c)));
      const on = (cur === 'all' || g === cur) && words.every((w) => txt.includes(w));
      c.style.display = on ? '' : 'none'; if (on) { shown++; secOn.add(g); }
    });
    grid.querySelectorAll('.w-sec').forEach((s) => { s.style.display = secOn.has(s.dataset.sec) ? '' : 'none'; });
    let empty = document.getElementById('hub-nav-empty');
    if (!shown) { if (!empty) { empty = document.createElement('p'); empty.id = 'hub-nav-empty'; empty.className = 'hn-empty'; empty.style.gridColumn = '1/-1'; grid.appendChild(empty); } empty.textContent = q.trim() ? tx().nomatch(q.trim()) : tx().none; }
    else if (empty) empty.remove();
    const cnt = document.getElementById('hn-count'); if (cnt) cnt.textContent = tx().count(shown, total);
    const clr = document.getElementById('hn-clear'); if (clr) clr.hidden = !q;
    document.querySelectorAll('#hub-nav .hn-chip').forEach((b) => b.setAttribute('aria-pressed', b.dataset.g === cur ? 'true' : 'false'));
  }
  function pick(g) { cur = g; try { localStorage.setItem(KEY, g); } catch (e) {} apply(); }
  function find(v) { q = v || ''; apply(); }
  function clear() { q = ''; const i = document.getElementById('hn-q'); if (i) { i.value = ''; i.focus(); } apply(); }

  function last() {   // the most recent game played: gg_last_game, else the newest gg_lp_<id> date
    try { const id = localStorage.getItem('gg_last_game'); if (id && (window.GAME_IDS || []).includes(id)) return id; } catch (e) {}
    return null;
  }
  function render() {
    const slot = document.getElementById('hub-nav-slot'); if (!slot) return;
    const T = tx(), lg = last();
    let favs = []; try { favs = (typeof Favorites !== 'undefined' && Favorites.get) ? Favorites.get() : JSON.parse(localStorage.getItem('gg_favs') || '[]'); } catch (e) {}
    favs = favs.filter((id) => (window.GAME_IDS || []).includes(id));
    const ic = (n) => (typeof Icon !== 'undefined' ? Icon.ui(n) + ' ' : '');
    const present = new Set([...document.querySelectorAll('#homeScreen .premium-card')].map((c) => genreOf(idOf(c))));
    const chips = SECS.filter((g) => g === 'all' || present.has(g) || document.querySelector(`.w-sec[data-sec="${g}"]`)).map((g) => `<button type="button" class="hn-chip" data-g="${g}" aria-pressed="false" onclick="HubNav.pick('${g}')">${label(g)}</button>`).join('');
    if (!SECS.includes(cur)) cur = 'all';
    // a div, not a <nav>: the header styles every `body nav` element (and its buttons) with !important
    slot.innerHTML = `<div id="hub-nav" role="navigation" aria-label="${T.pick}">
      ${lg || favs.length ? `<div class="hn-quick">
        ${lg ? `<button type="button" class="hn-continue" onclick="loadGame('${lg}')">${ic('play')}${T.cont}: <b>${title(lg)}</b></button>` : ''}
        ${favs.length ? `<div class="hn-favs"><span class="hn-label">${ic('heart')}${T.favs}:</span>${favs.map((id) => `<button type="button" class="hn-fav" onclick="loadGame('${id}')">${title(id)}</button>`).join('')}</div>` : ''}
      </div>` : ''}
      <div class="hn-search" role="search"><label for="hn-q" class="hn-label">${ic('search')}${T.find}</label>
        <div class="hn-qrow"><input id="hn-q" type="search" autocomplete="off" enterkeyhint="search" placeholder="${T.ph}" value="${q.replace(/"/g, '&quot;')}" oninput="HubNav.find(this.value)" aria-describedby="hn-count"><button type="button" id="hn-clear" class="hn-clear" onclick="HubNav.clear()" hidden>${T.clear}</button></div>
        <p id="hn-count" class="hn-count" aria-live="polite"></p></div>
      <div class="hn-chips" role="group" aria-label="${T.pick}">${chips}</div>
    </div>`;
    apply();
  }
  return { render, pick, find, clear, apply, genreOf };
})();
