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
    en: [
      '💧 Drink water before training — your brain needs hydration',
      '😴 7-8 hours of sleep improves memory by up to 40%',
      '🚶 30 minutes of walking daily increases hippocampus volume',
      '🎵 Soft classical music can sharpen focus during training',
      '😊 Social connections and conversation protect the aging brain',
      '🍇 Blueberries and leafy greens are rich in brain-healthy antioxidants',
      '🧘 10 minutes of daily meditation reduces stress and boosts focus',
      '🖊️ Writing by hand strengthens neural pathways more than typing',
    ],
  };

  let _iv = null, _idx = 0;

  function inject(container) {
    if (container.hasChildNodes()) return;
    const el = document.createElement('div');
    el.id = 'tips-carousel';
    el.innerHTML = '<span style="font-size:0.95rem;flex-shrink:0">💡</span><span id="tips-text"></span>';
    container.appendChild(el);
    _rotate();
    _iv = setInterval(_rotate, 9000);
  }

  function _rotate() {
    if (typeof gameState !== 'undefined' && gameState.active) return;
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'he';
    const pool = DATA[lang] || DATA.en || DATA.he;
    const el   = document.getElementById('tips-text');
    if (!el) { clearInterval(_iv); return; }
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = pool[_idx % pool.length];
      el.style.opacity = '1';
      _idx++;
    }, 400);
  }

  return { inject };
})();
