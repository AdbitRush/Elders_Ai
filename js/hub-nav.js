/* hub-nav.js — the top of the hub for 60+ games (2026-10-10 review):
   1. "Continue" = the last game played (resumes at its saved level) and the player's favorites, first thing on the page;
   2. genre chips (All · Cards & Board · Words & Numbers · Trivia · Arcade) that filter the game grid in place.
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
    en: { all: 'All games', cards: 'Cards & Board', words: 'Words & Numbers', trivia: 'Trivia', arcade: 'Arcade', cont: 'Continue', favs: 'Your favorites', pick: 'Pick a kind of game', none: 'No games here yet - more are on the way.' },
    he: { all: 'כל המשחקים', cards: 'קלפים ולוח', words: 'מילים ומספרים', trivia: 'טריוויה', arcade: 'ארקייד', cont: 'להמשיך', favs: 'המועדפים שלכם', pick: 'בחרו סוג משחק', none: 'עדיין אין כאן משחקים - בקרוב.' },
  };
  const KEY = 'gg_genre';
  const tx = () => L[typeof currentLang !== 'undefined' && L[currentLang] ? currentLang : 'en'];
  const genreOf = (id) => GENRE[id] || ((window.NEW_GAMES || []).find((g) => g.id === id) || {}).section || 'words';
  const idOf = (card) => { const m = (card.getAttribute('onclick') || '').match(/loadGame\('(\w+)'\)/); return m && m[1]; };
  const title = (id) => (typeof _menuGameTitles !== 'undefined' && _menuGameTitles[id] && typeof t === 'function') ? t(_menuGameTitles[id]) : id;
  let cur = 'all';
  try { cur = localStorage.getItem(KEY) || 'all'; } catch (e) {}

  function apply() {
    const grid = document.getElementById('homeScreen'); if (!grid) return;
    let shown = 0;
    grid.querySelectorAll('.premium-card').forEach((c) => { const on = cur === 'all' || genreOf(idOf(c)) === cur; c.style.display = on ? '' : 'none'; if (on) shown++; });
    grid.querySelectorAll('.w-sec').forEach((s) => { s.style.display = cur === 'all' || s.dataset.sec === cur ? '' : 'none'; });
    let empty = document.getElementById('hub-nav-empty');
    if (!shown) { if (!empty) { empty = document.createElement('p'); empty.id = 'hub-nav-empty'; empty.style.gridColumn = '1/-1'; grid.appendChild(empty); } empty.textContent = tx().none; }
    else if (empty) empty.remove();
    document.querySelectorAll('#hub-nav .hn-chip').forEach((b) => b.setAttribute('aria-pressed', b.dataset.g === cur ? 'true' : 'false'));
  }
  function pick(g) { cur = g; try { localStorage.setItem(KEY, g); } catch (e) {} apply(); }

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
    const chips = ['all', 'cards', 'words', 'trivia', 'arcade'].map((g) => `<button type="button" class="hn-chip" data-g="${g}" aria-pressed="false" onclick="HubNav.pick('${g}')">${T[g]}</button>`).join('');
    slot.innerHTML = `<nav id="hub-nav" aria-label="${T.pick}">
      ${lg || favs.length ? `<div class="hn-quick">
        ${lg ? `<button type="button" class="hn-continue" onclick="loadGame('${lg}')">${ic('play')}${T.cont}: <b>${title(lg)}</b></button>` : ''}
        ${favs.length ? `<div class="hn-favs"><span class="hn-label">${ic('heart')}${T.favs}:</span>${favs.map((id) => `<button type="button" class="hn-fav" onclick="loadGame('${id}')">${title(id)}</button>`).join('')}</div>` : ''}
      </div>` : ''}
      <div class="hn-chips" role="group" aria-label="${T.pick}">${chips}</div>
    </nav>`;
    apply();
  }
  return { render, pick, apply, genreOf };
})();
