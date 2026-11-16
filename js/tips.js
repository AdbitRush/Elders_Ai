const Tips = (() => {
  const DATA = {
    en: [
      'Did you know? The Slinky was invented by a naval engineer, Richard James, and first sold in 1945.',
      'Did you know? Parker Brothers first sold Monopoly in 1935.',
      'Did you know? Crayola\'s 64-crayon box with the built-in sharpener came out in 1958.',
      'Did you know? The Etch A Sketch went on sale in 1960.',
      'Did you know? Checkers is played on the same 8-by-8 board as chess.',
      'Did you know? Atari\'s Pong started in bars and arcades in 1972, three years before the home version.',
      'Did you know? The first Super Bowl, in January 1967, did not sell out.',
      'Did you know? Solitaire came free with Windows 3.0 in 1990, partly to teach people to use a mouse.'
    ]
  };
  let _iv = null, _idx = 0;
  function inject(container) {
    if (container.hasChildNodes())
      return;
    const el = document.createElement('div');
    el.id = 'tips-carousel';
    el.innerHTML = '<span style="font-size:0.95rem;flex-shrink:0;line-height:0">' + (typeof Icon !== 'undefined' ? Icon.ui('lightbulb') : '') + '</span><span id="tips-text"></span>';
    container.appendChild(el);
    _rotate();
    _iv = setInterval(_rotate, 9000);
  }
  function _rotate(now) {
    if (typeof gameState !== 'undefined' && gameState.active)
      return;
    const el = document.getElementById('tips-text');
    if (!el) {
      clearInterval(_iv);
      return;
    }
    const write = () => {
      const lang = typeof currentLang !== 'undefined' ? currentLang : 'he';
      const pool = DATA[lang] || DATA.en || DATA.he;
      el.textContent = pool[_idx % pool.length].replace(/^[^\p{L}\p{N}]+/u, '');
      el.style.opacity = '1';
      _idx++;
    };
    if (now === true)
      return write();
    el.style.opacity = '0';
    setTimeout(write, 400);
  }
  return {
    inject,
    render: () => _rotate(true)
  };
})();