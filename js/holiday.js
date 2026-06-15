// ═══════════════════════════════════════════════════════════════════════════════
// HOLIDAY — Shabbat / Jewish holiday banner + milestone full-screen celebration
// ═══════════════════════════════════════════════════════════════════════════════
const Holiday = (() => {
  const HOLIDAYS = {
    '2026-09-11': { he:'🍎 שנה טובה ומתוקה! חג ראש השנה שמח',    en:'🍎 Happy Rosh Hashana! Wishing you a sweet new year' },
    '2026-09-12': { he:'🍎 שנה טובה! שנה שכולה ברכה ואהבה',       en:'🍎 Happy New Year! A year full of blessings' },
    '2026-09-20': { he:'🌿 חג סוכות שמח! שמחת החג לכולם',          en:'🌿 Happy Sukkot! Joy of the holiday to all' },
    '2026-12-14': { he:'🕯️ חנוכה שמח! אורות וסביבונים',             en:'🕯️ Happy Hanukkah! Lights and spinning tops' },
    '2026-12-15': { he:'🕯️ חנוכה שמח! חנוכיה מאירה',               en:'🕯️ Happy Hanukkah! Let the candles shine' },
    '2026-03-05': { he:'🎭 פורים שמח! משתה ושמחה לכולם',           en:'🎭 Happy Purim! Joy and celebration for all' },
    '2026-04-02': { he:'🍷 חג פסח שמח! יציאה לחירות',              en:'🍷 Happy Passover! Freedom and joy' },
    '2026-04-03': { he:'🍷 פסח שמח! ליל הסדר מיוחד',               en:'🍷 Happy Passover! A special Seder night' },
    '2026-05-22': { he:'🌾 חג שבועות שמח! תורה ומסורת',             en:'🌾 Happy Shavuot! Torah and tradition' },
  };

  const MILESTONES    = [10, 50, 100, 200, 500];
  const MILESTONE_KEY = 'gg_milestones';

  function _today() { return new Date().toISOString().slice(0, 10); }

  function _isShabbat() {
    const d = new Date().getDay(); // 5 = Friday, 6 = Saturday
    const h = new Date().getHours();
    return (d === 5 && h >= 16) || d === 6;
  }

  function injectBanner(container) {
    if (!container) return;
    const isHe  = typeof currentLang !== 'undefined' ? currentLang === 'he' : true;
    const today  = _today();
    let msg = null;
    if (HOLIDAYS[today]) {
      msg = isHe ? HOLIDAYS[today].he : HOLIDAYS[today].en;
    } else if (_isShabbat()) {
      msg = isHe ? '🕯️ שבת שלום! שמחים שאתם כאן' : "🕯️ Shabbat Shalom! Glad you're here";
    }
    const existing = document.getElementById('holiday-banner');
    if (existing) { existing.textContent = msg || ''; existing.style.display = msg ? 'block' : 'none'; return; }
    if (!msg) return;
    const div = document.createElement('div');
    div.id = 'holiday-banner';
    div.textContent = msg;
    container.prepend(div);
  }

  function checkMilestone(totalGames) {
    let seen;
    try { seen = new Set(JSON.parse(localStorage.getItem(MILESTONE_KEY) || '[]')); }
    catch { seen = new Set(); }
    const hit = MILESTONES.find(m => totalGames >= m && !seen.has(m));
    if (!hit) return;
    seen.add(hit);
    localStorage.setItem(MILESTONE_KEY, JSON.stringify([...seen]));
    const isHe = typeof currentLang !== 'undefined' ? currentLang === 'he' : true;
    const ov = document.createElement('div');
    ov.id = 'milestone-overlay';
    ov.innerHTML = `
      <div id="milestone-box">
        <div style="font-size:3.5rem;margin-bottom:0.5rem">🏆</div>
        <div style="font-size:1.8rem;font-weight:800;color:#f6c048;margin-bottom:0.5rem">
          ${hit} ${isHe ? 'משחקים!' : 'Games!'}
        </div>
        <div style="color:rgba(180,210,255,0.85);font-size:1rem;margin-bottom:1.5rem">
          ${isHe
            ? `מדהים! הגעתם ל-${hit} משחקים. המוח שלכם אסיר תודה 🧠`
            : `Amazing! You've played ${hit} games. Your brain thanks you 🧠`}
        </div>
        <button onclick="document.getElementById('milestone-overlay').remove()"
          style="background:linear-gradient(135deg,#b7791f,#f6c048);color:#0a1628;border:none;border-radius:0.9rem;padding:0.75rem 2rem;font-size:1rem;font-weight:800;cursor:pointer">
          ${isHe ? '🚀 המשיכו לאמן!' : '🚀 Keep Training!'}
        </button>
      </div>`;
    document.body.appendChild(ov);
    if (typeof launchConfetti === 'function') launchConfetti();
  }

  return { injectBanner, checkMilestone };
})();
