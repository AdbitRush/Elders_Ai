// ═══════════════════════════════════════════════════════════════════════════════
// TIPS CAROUSEL — rotating brain health tips above the game grid
// ═══════════════════════════════════════════════════════════════════════════════
const Tips = (() => {
  const DATA = {
    he: [
      '💧 שתו כוס מים לפני אימון — המוח זקוק להידרציה',
      '😴 שינה טובה של 7-8 שעות משפרת זיכרון ב-40%',
      '🚶 הליכה של 30 דקות ביום מגדילה את נפח ההיפוקמפוס',
      '🎵 מוזיקה קלאסית בשקט יכולה לשפר ריכוז בזמן אימון',
      '😊 שיחה חברתית ואינטראקציה חברתית מגנות על המוח מדעיכה',
      '🍇 אוכמניות ועלים ירוקים עשירים בנוגדי חמצון לבריאות המוח',
      '🧘 10 דקות מדיטציה ביום מפחיתות מתח ומשפרות מיקוד',
      '🖊️ כתיבה ביד מחזקת קישורים עצביים יותר מהקלדה',
    ],
    // 2026-10: nostalgia first. Short, checkable facts about the games and toys of the era (no health claims here;
    // the health note lives further down the page, under "Good fun, and good for you too").
    en: [
      'Did you know? The Slinky was invented by a naval engineer, Richard James, and first sold in 1945.',
      'Did you know? Parker Brothers first sold Monopoly in 1935.',
      'Did you know? Crayola\'s 64-crayon box with the built-in sharpener came out in 1958.',
      'Did you know? The Etch A Sketch went on sale in 1960.',
      'Did you know? Checkers is played on the same 8-by-8 board as chess.',
      'Did you know? Atari\'s Pong started in bars and arcades in 1972, three years before the home version.',
      'Did you know? The first Super Bowl, in January 1967, did not sell out.',
      'Did you know? Solitaire came free with Windows 3.0 in 1990, partly to teach people to use a mouse.',
    ],
  };

  let _iv = null, _idx = 0;

  function inject(container) {
    if (container.hasChildNodes()) return;
    const el = document.createElement('div');
    el.id = 'tips-carousel';
    el.innerHTML = '<span style="font-size:0.95rem;flex-shrink:0;line-height:0">' + (typeof Icon !== 'undefined' ? Icon.ui('lightbulb') : '') + '</span><span id="tips-text"></span>';
    container.appendChild(el);
    _rotate();
    _iv = setInterval(_rotate, 9000);
  }

  function _rotate(now) {
    if (typeof gameState !== 'undefined' && gameState.active) return;
    const el   = document.getElementById('tips-text');
    if (!el) { clearInterval(_iv); return; }
    const write = () => {
      // read the language when the text is written, not before the fade: a language switch during the fade
      // used to put the old language back (2026-10 e2e 11b)
      const lang = typeof currentLang !== 'undefined' ? currentLang : 'he';
      const pool = DATA[lang] || DATA.en || DATA.he;
      el.textContent = pool[_idx % pool.length].replace(/^[^\p{L}\p{N}]+/u, '');  // the lightbulb icon replaces each tip's emoji
      el.style.opacity = '1';
      _idx++;
    };
    if (now === true) return write();   // a language switch: replace the text at once, no fade
    el.style.opacity = '0';
    setTimeout(write, 400);
  }

  // render(): show a tip in the current language now (called by changeLanguage)
  return { inject, render: () => _rotate(true) };
})();
