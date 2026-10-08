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
    he: { light: 'בהיר', dark: 'כהה', about: 'על המשחק', all: 'כל המשחקים — לכל משחק עמוד משלו', play: 'לשחק' },
    en: { light: 'Light', dark: 'Dark', about: 'About this game', all: 'All games — each has its own page', play: 'Play' },
    es: { light: 'Claro', dark: 'Oscuro', about: 'Sobre el juego', all: 'Todos los juegos: cada uno tiene su página', play: 'Jugar' },
    fr: { light: 'Clair', dark: 'Sombre', about: 'À propos du jeu', all: 'Tous les jeux : chacun a sa page', play: 'Jouer' },
    de: { light: 'Hell', dark: 'Dunkel', about: 'Über das Spiel', all: 'Alle Spiele – jedes hat eine eigene Seite', play: 'Spielen' },
    el: { light: 'Φωτεινό', dark: 'Σκοτεινό', about: 'Για το παιχνίδι', all: 'Όλα τα παιχνίδια — το καθένα έχει τη σελίδα του', play: 'Παίξτε' }
  };
  function lang() { var l = (typeof currentLang !== 'undefined' && currentLang) || R.lang || 'en'; return L[l] ? l : 'en'; }
  function tr(k) { return L[lang()][k]; }
  function curGame() { try { return (typeof gameState !== 'undefined' && gameState && gameState.currentId) || null; } catch (e) { return null; } }

  function syncState() {
    var gv = document.getElementById('gameView'), m = document.getElementById('modal');
    var inGame = !!(gv && !gv.classList.contains('hidden'));
    R.classList.toggle('in-game', inGame);
    R.classList.toggle('between-games', !!(m && !m.classList.contains('hidden')));
    var id = inGame && curGame();
    // the photo URL is absolute: a url() inside a custom property would otherwise resolve against css/
    if (id) { R.setAttribute('data-game', id); gv.style.setProperty('--game-photo', 'url("' + new URL('images/cards/' + id + '.jpg', document.baseURI).href + '")'); }
    else R.removeAttribute('data-game');
  }

  function themeLabel() {
    var b = document.getElementById('themeBtn');
    if (!b) return;
    var light = R.getAttribute('data-theme') === 'light';
    var want = light ? 'dark' : 'light';   // the label names what a press switches TO
    var html = '<span aria-hidden="true">' + (light ? '🌙' : '☀️') + '</span><span class="w-tl">' + tr(want) + '</span>';
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
      a.textContent = '📄 ' + tr('about');
    });
    var h = document.getElementById('all-games-h');
    if (h) h.textContent = tr('all');
    [].forEach.call(document.querySelectorAll('#all-games [data-game]'), function (li) {
      var id = li.getAttribute('data-game'), page = li.querySelector('.ag-page'), play = li.querySelector('.ag-play');
      var hs = document.getElementById('hs-' + id), card = hs && hs.closest('.premium-card'), t = card && card.querySelector('h3');
      if (page) { page.href = l + '/' + id + '/'; if (t && t.textContent.trim()) page.textContent = t.textContent.trim(); }
      if (play) { play.href = '?lang=' + l + '#' + id; play.textContent = '▶ ' + tr('play'); }
    });
  }

  function all() { syncState(); themeLabel(); cardLinks(); }
  function start() {
    all();
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
