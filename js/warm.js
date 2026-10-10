/* warm.js — warm redesign helpers (branch preview/warm-redesign, 2026-10-09).
   Additive only: it never removes, hides or replaces an existing control.
   - html.in-game while a game is on screen, html.between-games while the end-of-game modal is open.
     css/warm.css uses them so the existing #adBar ticker shows on the hub and between games, never mid-game.
   - html[data-game] and --game-photo on #gameView: the per-game photo header and the quiz answer colours.
   - The existing theme button (toggleTheme, unchanged) gets a visible, translated Light / Dark label.
   - Every hub card gets an "About this game" link to the game's own page (<lang>/<id>/), and the
     #all-games list (in index.html) follows the current language. */
(function () {
  'use strict';
  var R = document.documentElement;
  var L = {
    he: { light: 'בהיר', dark: 'כהה', about: 'על המשחק', all: 'כל המשחקים — לכל משחק עמוד משלו', play: 'לשחק',
          menu: 'תפריט', text: 'גודל טקסט', sound: 'צליל', scores: 'תוצאות', awards: 'הישגים', invite: 'הזמנה', lang: 'שפה' },
    en: { light: 'Light', dark: 'Dark', about: 'About this game', all: 'All games — each has its own page', play: 'Play',
          menu: 'Menu', text: 'Text size', sound: 'Sound', scores: 'Scores', awards: 'Awards', invite: 'Invite', lang: 'Language' },
    es: { light: 'Claro', dark: 'Oscuro', about: 'Sobre el juego', all: 'Todos los juegos: cada uno tiene su página', play: 'Jugar',
          menu: 'Menú', text: 'Texto', sound: 'Sonido', scores: 'Puntos', awards: 'Logros', invite: 'Invitar', lang: 'Idioma' },
    fr: { light: 'Clair', dark: 'Sombre', about: 'À propos du jeu', all: 'Tous les jeux : chacun a sa page', play: 'Jouer',
          menu: 'Menu', text: 'Texte', sound: 'Son', scores: 'Scores', awards: 'Succès', invite: 'Inviter', lang: 'Langue' },
    de: { light: 'Hell', dark: 'Dunkel', about: 'Über das Spiel', all: 'Alle Spiele – jedes hat eine eigene Seite', play: 'Spielen',
          menu: 'Menü', text: 'Schrift', sound: 'Ton', scores: 'Punkte', awards: 'Erfolge', invite: 'Einladen', lang: 'Sprache' },
    el: { light: 'Φωτεινό', dark: 'Σκοτεινό', about: 'Για το παιχνίδι', all: 'Όλα τα παιχνίδια — το καθένα έχει τη σελίδα του', play: 'Παίξτε',
          menu: 'Μενού', text: 'Κείμενο', sound: 'Ήχος', scores: 'Σκορ', awards: 'Επιτεύγματα', invite: 'Πρόσκληση', lang: 'Γλώσσα' }
  };
  function lang() { var l = (typeof currentLang !== 'undefined' && currentLang) || R.lang || 'en'; return L[l] ? l : 'en'; }
  function tr(k) { return L[lang()][k]; }
  function curGame() { try { return (typeof gameState !== 'undefined' && gameState && gameState.currentId) || null; } catch (e) { return null; } }

  var NO_SCENE = { lifesim: true };
  (window.NEW_GAMES || []).forEach(function (g) { NO_SCENE[g.id] = true; });
  function syncState() {
    var gv = document.getElementById('gameView'), m = document.getElementById('modal');
    var inGame = !!(gv && !gv.classList.contains('hidden'));
    R.classList.toggle('in-game', inGame);
    R.classList.toggle('between-games', !!(m && !m.classList.contains('hidden')));
    var id = inGame && curGame();
    // the photo URL is absolute: a url() inside a custom property would otherwise resolve against css/
    // Time Journey has no header photo since 2026-10-10 (its only photo was of people's faces): its own warm gradient stays
    if (id) { R.setAttribute('data-game', id); gv.style.setProperty('--game-photo', NO_SCENE[id] ? 'none' : 'url("' + new URL('images/scenes/' + id + '.jpg', document.baseURI).href + '")'); }
    else R.removeAttribute('data-game');
  }

  function themeLabel() {
    var b = document.getElementById('themeBtn');
    if (!b) return;
    var light = R.getAttribute('data-theme') === 'light';
    var want = light ? 'dark' : 'light';   // the label names what a press switches TO
    var html = Icon.ui(light ? 'moon' : 'sun') + '<span class="w-tl">' + tr(want) + '</span>';
    if (b.innerHTML !== html) b.innerHTML = html;
    b.setAttribute('aria-label', tr(want));
    b.title = tr(want);
  }

  function cardLinks() {
    var l = lang();
    [].forEach.call(document.querySelectorAll('#homeScreen .premium-card'), function (card) {
      var hs = card.querySelector('[id^="hs-"]');
      if (!hs) return;
      var id = hs.id.slice(3), a = card.querySelector('a.w-page');
      if (!a) {
        a = document.createElement('a');
        a.className = 'w-page';
        a.addEventListener('click', function (e) { e.stopPropagation(); });
        var body = card.querySelector('.p-5') || card;
        body.appendChild(a);
      }
      a.href = l + '/' + id + '/';
      a.textContent = tr('about'); a.insertAdjacentHTML('afterbegin', Icon.ui('book-open-text') + ' ');
    });
    var h = document.getElementById('all-games-h');
    if (h) h.textContent = tr('all');
    [].forEach.call(document.querySelectorAll('#all-games [data-game]'), function (li) {
      var id = li.getAttribute('data-game'), page = li.querySelector('.ag-page'), play = li.querySelector('.ag-play');
      var hs = document.getElementById('hs-' + id), card = hs && hs.closest('.premium-card'), t = card && card.querySelector('h3');
      if (page) { page.href = l + '/' + id + '/'; if (t && t.textContent.trim()) page.textContent = t.textContent.trim(); }
      if (play) { play.href = '?lang=' + l + '#' + id; play.textContent = tr('play'); play.insertAdjacentHTML('afterbegin', Icon.ui('play') + ' '); }
    });
  }

  // Phones (2026-10-09): the header is ONE row — logo, title (the level during a game), ☰ Menu, Light/Dark,
  // Back. The other header controls are MOVED (the same elements, same handlers, nothing dropped) to a
  // labelled "tools" grid at the top of the ☰ menu, the language dropdown included; wider screens get them
  // back in the header, in their original places. Labels are CSS ::after from data-w-label, never child
  // elements: the menu's outside-click check compares e.target with the ☰ button itself.
  var PHONE = window.matchMedia ? window.matchMedia('(max-width:639px)') : null;
  var spots = [];
  function toolEls() {
    var q = function (s) { return document.querySelector(s); };
    return [
      [q('nav #textsize-btn') || q('#w-tools #textsize-btn'), 'text'],
      [q('nav #sound-btn') || q('#w-tools #sound-btn'), 'sound'],
      [q('button[title="Scoreboard"]'), 'scores'],
      [q('button[title="Achievements"]'), 'awards'],
      [q('#inviteBtn'), 'invite'],
      [q('#profile-chip'), null]
    ].filter(function (x) { return x[0]; });
  }
  function mobileHeader() {
    var menu = document.getElementById('gameMenu'), mb = document.getElementById('menuBtn'), sel = document.getElementById('langSelect');
    if (!menu || !mb) return;
    mb.setAttribute('data-w-label', tr('menu'));
    var tools = document.getElementById('w-tools');
    if (!tools) {
      tools = document.createElement('div'); tools.id = 'w-tools';
      tools.innerHTML = '<div class="w-lang"><label for="langSelect">' + Icon.ui('globe') + ' <span></span></label></div><div class="w-grid"></div>';
      menu.insertBefore(tools, menu.firstChild);
    }
    tools.querySelector('.w-lang span').textContent = tr('lang');
    var items = toolEls();
    items.forEach(function (x) { if (x[1]) x[0].setAttribute('data-w-label', tr(x[1])); });
    if (sel) items.push([sel, null]);
    var phone = !!(PHONE && PHONE.matches);
    if (phone && !spots.length) {
      items.forEach(function (x) {
        var el = x[0], mark = document.createComment('w-spot');
        el.parentNode.insertBefore(mark, el); spots.push([el, mark]);
        (el === sel ? tools.querySelector('.w-lang') : tools.querySelector('.w-grid')).appendChild(el);
      });
    } else if (!phone && spots.length) {
      spots.forEach(function (s) { s[1].parentNode.insertBefore(s[0], s[1]); s[1].remove(); });
      spots = [];
    }
    R.classList.toggle('w-phone-head', phone);
  }

  function all() { syncState(); themeLabel(); cardLinks(); mobileHeader(); }
  function start() {
    all();
    if (PHONE) (PHONE.addEventListener ? PHONE.addEventListener('change', mobileHeader) : PHONE.addListener(mobileHeader));
    new MutationObserver(mobileHeader).observe(R, { attributes: true, attributeFilter: ['lang'] });
    new MutationObserver(function () { themeLabel(); cardLinks(); }).observe(R, { attributes: true, attributeFilter: ['data-theme', 'lang'] });
    ['gameView', 'modal'].forEach(function (id) {
      var e = document.getElementById(id);
      if (e) new MutationObserver(syncState).observe(e, { attributes: true, attributeFilter: ['class'] });
    });
    window.addEventListener('hashchange', function () { setTimeout(syncState, 0); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.WarmUI = { sync: all };
})();
