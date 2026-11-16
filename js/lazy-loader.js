const LazyLoader = (() => {
  const _loaded = new Set();
  const _pending = new Map();
  function load(gameId) {
    if (_loaded.has(gameId))
      return Promise.resolve();
    if (_pending.has(gameId))
      return _pending.get(gameId);
    const p = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `js/games/${ gameId }.js`;
      s.defer = true;
      s.onload = () => {
        _loaded.add(gameId);
        _pending.delete(gameId);
        resolve();
      };
      s.onerror = () => {
        _pending.delete(gameId);
        reject(new Error(`Failed to load js/games/${ gameId }.js`));
      };
      document.head.appendChild(s);
    });
    _pending.set(gameId, p);
    return p;
  }
  function preload(gameIds) {
    gameIds.forEach(id => load(id).catch(() => {
    }));
  }
  function patchLoadGame() {
    if (typeof loadGame !== 'function')
      return;
    const _original = loadGame;
    window.loadGame = async function (gameId, level = 1) {
      try {
        await load(gameId);
      } catch (e) {
        console.warn(`Could not lazy-load ${ gameId }:`, e);
      }
      _original(gameId, level);
    };
  }
  return {
    load,
    preload,
    patchLoadGame
  };
})();