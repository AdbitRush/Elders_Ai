/* ═══════════════════════════════════════════════════════════════════════════
   AMBIENT BACKGROUND ENGINE

   Two layers, crossfaded. As you scroll the game grid, the layer underneath
   becomes the photograph of whichever game card is nearest the middle of the
   screen; open a game and the backdrop holds that game's picture.

   Notes for whoever touches this next:
   - It reads the cards' own <img src>, so it cannot drift from the grid. No
     second list of filenames to keep in step.
   - It never throws when the grid is not there (a game is open, or the markup
     changed): every lookup is guarded and the module returns early.
   - Scroll work is rAF-throttled and does nothing unless the chosen picture
     actually changed.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.getElementById('ambientBg');
  if (!root) return;

  var A = root.querySelector('.ab-a');
  var B = root.querySelector('.ab-b');
  if (!A || !B) return;

  var reduced = false;
  try {
    reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var active = A;
  var currentSrc = '';
  var ticking = false;
  var preloaded = {};

  function preload(src) {
    if (!src || preloaded[src]) return;
    preloaded[src] = true;
    var im = new Image();
    im.decoding = 'async';
    im.src = src;
  }

  function show(src) {
    if (!src || src === currentSrc) return;
    currentSrc = src;
    var next = (active === A) ? B : A;
    next.style.backgroundImage = 'url("' + src + '")';
    next.classList.add('ab-on');
    if (!reduced) next.classList.add('ab-ken');
    active.classList.remove('ab-on');
    active.classList.remove('ab-ken');
    active = next;
  }

  // Every game photograph on the page, in document order.
  function cards() {
    return Array.prototype.slice.call(document.querySelectorAll('img.thumbnail-img'))
      .filter(function (im) { return im.getAttribute('src'); });
  }

  function nearestToCentre() {
    var list = cards();
    if (!list.length) return '';
    var centre = window.innerHeight / 2;
    var best = null;
    var bestGap = Infinity;
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) continue;   // offscreen
      var gap = Math.abs((r.top + r.height / 2) - centre);
      if (gap < bestGap) { bestGap = gap; best = list[i]; }
    }
    if (!best) best = list[0];
    return best.getAttribute('src');
  }

  // When a game is open the grid is gone; hold that game's own picture.
  function fromRoute() {
    var id = (location.hash || '').replace(/^#/, '').split('?')[0];
    if (!id) return '';
    return 'images/cards/' + id + '.jpg';
  }

  function update() {
    ticking = false;
    var src = cards().length ? nearestToCentre() : fromRoute();
    if (!src) return;
    show(src);

    // warm the neighbours so the next fade is instant
    var list = cards();
    for (var i = 0; i < list.length; i++) {
      if (list[i].getAttribute('src') === src) {
        if (list[i - 1]) preload(list[i - 1].getAttribute('src'));
        if (list[i + 1]) preload(list[i + 1].getAttribute('src'));
        break;
      }
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('hashchange', function () { currentSrc = ''; update(); });

  // The grid is rendered by the app after this file runs, and re-rendered on
  // language and category changes, so watch for it rather than assuming.
  if (window.MutationObserver) {
    var mo = new MutationObserver(function () { onScroll(); });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  update();
})();
