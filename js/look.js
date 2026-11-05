/* look.js: the Classic / Refreshed appearance choice. One key (gg-look), separate from dark mode (gg-theme), text size
   (gg-textsize) and language (gg-lang). Classic is the default: the attribute is only present for Refreshed, and every
   visual rule of the Refreshed look in css/refresh.css hangs off it. Each page sets the attribute in its <head> with a
   one-line script, before first paint; this file adds the control and keeps open tabs in step.
   The control is two native radio buttons, so arrow keys, Space, screen readers and the selected state need no scripting. */
(function () {
  'use strict';
  var KEY = 'gg-look', R = document.documentElement, seq = 0, groups = [];
  var T = {
    he: ['מראה', 'קלאסי', 'מחודש'],
    en: ['Appearance', 'Classic', 'Refreshed'],
    es: ['Apariencia', 'Clásico', 'Renovado'],
    fr: ['Apparence', 'Classique', 'Modernisé'],
    de: ['Darstellung', 'Klassisch', 'Aufgefrischt'],
    el: ['Εμφάνιση', 'Κλασική', 'Ανανεωμένη']
  };
  function words() { return T[(R.lang || 'en').slice(0, 2)] || T.en; }
  function get() { try { return localStorage.getItem(KEY) === 'refreshed' ? 'refreshed' : 'classic'; } catch (e) { return R.getAttribute('data-look') === 'refreshed' ? 'refreshed' : 'classic'; } }
  function show(v) {
    if (v === 'refreshed') R.setAttribute('data-look', 'refreshed'); else R.removeAttribute('data-look');
    groups.forEach(function (g) {
      [].forEach.call(g.querySelectorAll('input'), function (i) { i.checked = i.value === v; i.parentNode.classList.toggle('look-on', i.checked); });
    });
  }
  function set(v) { v = v === 'refreshed' ? 'refreshed' : 'classic'; try { localStorage.setItem(KEY, v); } catch (e) {} show(v); }
  function label() {
    var w = words();
    groups.forEach(function (g) {
      g.querySelector('legend').textContent = w[0];
      g.querySelector('[data-v="classic"]').textContent = w[1];
      g.querySelector('[data-v="refreshed"]').textContent = w[2];
    });
  }
  function make(cls) {
    var n = 'look-' + (++seq), f = document.createElement('fieldset');
    f.className = 'look-toggle' + (cls ? ' ' + cls : '');
    f.innerHTML = '<legend></legend><div class="look-opts">' +
      ['classic', 'refreshed'].map(function (v) { return '<label><input type="radio" name="' + n + '" value="' + v + '"><span data-v="' + v + '"></span></label>'; }).join('') + '</div>';
    f.addEventListener('change', function (e) { if (e.target && e.target.value) set(e.target.value); });
    f.addEventListener('click', function (e) { e.stopPropagation(); });
    groups.push(f);
    return f;
  }
  function mount() {
    var head = document.getElementById('homeScreen-header'), menu = document.getElementById('gameMenu'), list = document.getElementById('gameMenuList'), foot = document.querySelector('body > footer');
    if (head) {                                   // the app page: hub, the menu (which also opens during a game) and the footer
      head.insertBefore(make('look-hub'), head.firstChild);
      if (menu && list) menu.insertBefore(make('look-menu'), list);
      if (foot) foot.appendChild(make('look-foot'));
    } else {                                      // articles, about, privacy, credits and the game landing pages
      var anchor = document.querySelector('.wrap > .top') || document.querySelector('header.brand'), first = document.querySelector('.wrap > h1');
      if (anchor) anchor.parentNode.insertBefore(make('look-page'), anchor.nextSibling);
      else if (first) first.parentNode.insertBefore(make('look-page'), first);
    }
    label(); show(get());
    new MutationObserver(label).observe(R, { attributes: true, attributeFilter: ['lang'] });
    window.addEventListener('storage', function (e) { if (e.key === KEY || e.key === null) show(get()); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  window.Look = { get: get, set: set };
})();
