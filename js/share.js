// ═══════════════════════════════════════════════════════════════════════════════
// SHARE SCORE  (js/share.js)
// Uses the native Web Share API with a clipboard fallback.
// Usage: Share.score('simon', 12)
//        Share.renderBtn(container, gameId, score)  → inserts a share button
// ═══════════════════════════════════════════════════════════════════════════════

const Share = (() => {
  const BASE_URL = 'https://adbitrush.github.io/Elders_Ai/';

  function _buildText(gameId, score, isHe) {
    if (isHe) {
      return `🏆 הגעתי לרמה ${score} ב-Golden Games (${gameId})! שחק גם אתה: ${BASE_URL}#${gameId}`;
    }
    return `🏆 I scored ${score} on Golden Games (${gameId})! Play free: ${BASE_URL}#${gameId}`;
  }

  function _toast(msg) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 2600);
  }

  async function score(gameId, value) {
    const isHe = (typeof currentLang !== 'undefined') ? currentLang === 'he' : true;
    const text = _buildText(gameId, value, isHe);
    const shareData = {
      title: isHe ? 'זהב של משחקים' : 'Golden Games',
      text,
      url: `${BASE_URL}#${gameId}`,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // user cancelled — do nothing
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(text);
      _toast(isHe ? '📋 הועתק ללוח!' : '📋 Copied to clipboard!');
    } catch {
      _toast(isHe ? `העתיקו: ${text}` : `Copy: ${text}`);
    }
  }

  function renderBtn(container, gameId, value) {
    const isHe = (typeof currentLang !== 'undefined') ? currentLang === 'he' : true;
    const label = isHe ? '📤 שתף את התוצאה' : '📤 Share score';
    container.innerHTML = `
      <button
        onclick="Share.score('${gameId}', ${value})"
        style="background:linear-gradient(135deg,#0369a1,#0ea5e9);color:#fff;border:none;border-radius:9999px;padding:0.55rem 1.4rem;font-weight:700;font-size:0.9rem;cursor:pointer;box-shadow:0 2px 8px rgba(3,105,161,0.35);transition:transform 0.15s,box-shadow 0.15s"
        onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''"
        aria-label="${label}">
        ${label}
      </button>`;
  }

  return { score, renderBtn };
})();
