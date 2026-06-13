// Golden Games — Service Worker v1
// Caches shell + all game modules for offline play

const CACHE = 'golden-games-v1';

const SHELL = [
  '/Elders_Ai/',
  '/Elders_Ai/index.html',
  '/Elders_Ai/css/style.css',
  '/Elders_Ai/js/stats.js',
  '/Elders_Ai/js/difficulty.js',
  '/Elders_Ai/js/share.js',
  '/Elders_Ai/js/categories.js',
  '/Elders_Ai/js/accessibility.js',
  '/Elders_Ai/js/games/memory.js',
  '/Elders_Ai/js/games/oddoneout.js',
  '/Elders_Ai/js/games/math.js',
  '/Elders_Ai/js/games/wordsearch.js',
  '/Elders_Ai/js/games/simon.js',
  '/Elders_Ai/js/games/sudoku.js',
  '/Elders_Ai/js/games/shapes.js',
  '/Elders_Ai/js/games/solitaire.js',
  '/Elders_Ai/js/games/trivia.js',
  '/Elders_Ai/js/games/numseq.js',
  '/Elders_Ai/js/games/unscramble.js',
  '/Elders_Ai/js/games/pairs.js',
  '/Elders_Ai/js/games/truefalse.js',
  '/Elders_Ai/js/games/flags.js',
  '/Elders_Ai/js/games/proverbs.js',
  '/Elders_Ai/js/games/hangman.js',
  '/Elders_Ai/js/games/recall.js',
  '/Elders_Ai/js/games/tetris.js',
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
