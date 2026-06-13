// ═══════════════════════════════════════════════════════════════════════════════
// LAZY GAME SCRIPT LOADER  (js/lazy-loader.js)
// Optional: use instead of 18 eager <script> tags to load game JS on demand.
//
// ACTIVATE by:
//   1. Remove all <script src="js/games/..."> tags from index.html
//   2. Add <script src="js/lazy-loader.js"></script> in their place
//   3. loadGame() will auto-load the game's JS before calling init{Game}()
//
// Currently NOT activated — eager loading is kept for simplicity.
// ═══════════════════════════════════════════════════════════════════════════════

const LazyLoader = (() => {
  const _loaded   = new Set();
  const _pending  = new Map(); // gameId → Promise

  function load(gameId) {
    if (_loaded.has(gameId)) return Promise.resolve();
    if (_pending.has(gameId)) return _pending.get(gameId);

    const p = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `js/games/${gameId}.js`;
      s.defer = true;
      s.onload  = () => { _loaded.add(gameId); _pending.delete(gameId); resolve(); };
      s.onerror = () => { _pending.delete(gameId); reject(new Error(`Failed to load js/games/${gameId}.js`)); };
      document.head.appendChild(s);
    });

    _pending.set(gameId, p);
    return p;
  }

  // Preload a list of games in the background (e.g. after home screen renders)
  function preload(gameIds) {
    gameIds.forEach(id => load(id).catch(() => {}));
  }

  // Wrap loadGame() so it awaits the script before calling init*()
  // Call this once after the core index.html script block runs.
  function patchLoadGame() {
    if (typeof loadGame !== 'function') return;
    const _original = loadGame;
    window.loadGame = async function(gameId, level = 1) {
      try {
        await load(gameId);
      } catch(e) {
        console.warn(`Could not lazy-load ${gameId}:`, e);
      }
      _original(gameId, level);
    };
  }

  return { load, preload, patchLoadGame };
})();
