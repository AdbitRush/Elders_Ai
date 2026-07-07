// Golden Games — Service Worker v2 (F5)
// v2 fixes: relative paths (v1 hardcoded /Elders_Ai/ → install failed on any
// other deployment path); 10 modules loaded by index.html were missing from
// the cache; navigations are now network-first so site updates actually reach
// installed users (v1 was cache-first with a never-bumped cache name).

const CACHE = 'golden-games-v15';

// Relative URLs — resolved against the SW's own location, deployment-path agnostic
const SHELL = [
  './',
  './index.html',
  './css/style.css',
  './css/hooks.css',
  './css/premium.css',
  './manifest.json',
  './images/icon.svg',
  './images/cards/memory.jpg',
  './images/cards/oddoneout.jpg',
  './images/cards/math.jpg',
  './images/cards/wordsearch.jpg',
  './images/cards/simon.jpg',
  './images/cards/sudoku.jpg',
  './images/cards/shapes.jpg',
  './images/cards/solitaire.jpg',
  './images/cards/trivia.jpg',
  './images/cards/numseq.jpg',
  './images/cards/unscramble.jpg',
  './images/cards/pairs.jpg',
  './images/cards/truefalse.jpg',
  './images/cards/flags.jpg',
  './images/cards/proverbs.jpg',
  './images/cards/hangman.jpg',
  './images/cards/recall.jpg',
  './images/cards/tetris.jpg',
  './images/cards/colormatch.jpg',
  './images/cards/digitspan.jpg',
  './images/cards/clock.jpg',
  './images/cards/counting.jpg',
  './images/cards/category.jpg',
  './images/cards/letters.jpg',
  './js/stats.js',
  './js/difficulty.js',
  './js/levels.js',
  './js/share.js',
  './js/categories.js',
  './js/accessibility.js',
  './js/achievements.js',
  './js/textsize.js',
  './js/lang-content.js',
  './js/games/lifesim.js',
  './js/games/safari.js',
  './js/affiliate.js',
  './js/brainscore.js',
  './js/daily-challenge.js',
  './js/favorites.js',
  './js/holiday.js',
  './js/profile.js',
  './js/tips.js',
  './js/fx.js',
  './js/kbnav.js',
  './js/games/memory.js',
  './js/games/oddoneout.js',
  './js/games/math.js',
  './js/games/wordsearch.js',
  './js/games/simon.js',
  './js/games/sudoku.js',
  './js/games/shapes.js',
  './js/games/solitaire.js',
  './js/games/trivia.js',
  './js/games/numseq.js',
  './js/games/unscramble.js',
  './js/games/pairs.js',
  './js/games/truefalse.js',
  './js/games/flags.js',
  './js/games/proverbs.js',
  './js/games/hangman.js',
  './js/games/recall.js',
  './js/games/tetris.js',
  './js/games/colormatch.js',
  './js/games/digitspan.js',
  './js/games/clock.js',
  './js/games/counting.js',
  './js/games/category.js',
  './js/games/letters.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Network-first for Tailwind CDN + Google Fonts; cache-first for everything else
  const url = new URL(e.request.url);
  const isExternal = url.origin !== self.location.origin;
  if (isExternal) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Navigations (the HTML shell): network-first so deploys reach installed
  // users on their next online visit; cached shell only when offline.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
    );
    return;
  }
  // Static assets: cache-first with runtime fill
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});
