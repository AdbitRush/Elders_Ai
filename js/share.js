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

  function _waUrl(gameId, value) {
    const isHe = (typeof currentLang !== 'undefined') ? currentLang === 'he' : true;
    const text  = _buildText(gameId, value, isHe);
    return 'https://wa.me/?text=' + encodeURIComponent(text);
  }

  function renderBtn(container, gameId, value) {
    const isHe   = (typeof currentLang !== 'undefined') ? currentLang === 'he' : true;
    const waUrl  = _waUrl(gameId, value);
    const waLabel  = isHe ? 'שתף בוואטסאפ' : 'Share on WhatsApp';
    const nativeLabel = isHe ? '📤 שתף' : '📤 Share';
    container.innerHTML =
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:4px">' +
        '<a href="' + waUrl + '" target="_blank" rel="noopener" class="wa-btn" aria-label="' + waLabel + '">' +
          '<svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.82.736 5.47 2.025 7.773L0 32l8.427-2.007A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.25a13.2 13.2 0 01-6.726-1.835l-.483-.287-4.998 1.19 1.24-4.862-.315-.5A13.22 13.22 0 012.75 16C2.75 8.682 8.682 2.75 16 2.75S29.25 8.682 29.25 16 23.318 29.25 16 29.25zm7.22-9.927c-.396-.198-2.344-1.157-2.707-1.288-.363-.132-.627-.198-.89.198s-1.022 1.288-1.253 1.553c-.23.264-.462.297-.858.099-.396-.198-1.671-.616-3.183-1.963-1.176-1.05-1.97-2.346-2.201-2.742-.23-.396-.024-.61.173-.807.178-.178.396-.462.594-.693.198-.23.264-.396.396-.66.132-.264.066-.495-.033-.693-.099-.198-.89-2.146-1.22-2.94-.32-.77-.648-.666-.89-.678l-.759-.013c-.264 0-.693.099-1.056.495s-1.386 1.354-1.386 3.302 1.42 3.83 1.617 4.094c.198.264 2.794 4.267 6.77 5.983.946.408 1.684.652 2.26.834.95.302 1.815.26 2.498.158.762-.114 2.344-.958 2.674-1.883.33-.924.33-1.716.23-1.882-.099-.165-.363-.264-.759-.462z"/></svg>' +
          ' ' + waLabel +
        '</a>' +
        '<button onclick="Share.score(\'' + gameId + '\',' + value + ')" ' +
          'style="background:rgba(3,105,161,0.15);border:1.5px solid rgba(14,165,233,0.4);color:#38bdf8;border-radius:9999px;padding:0.5rem 1.2rem;font-weight:700;font-size:0.88rem;cursor:pointer;transition:all 0.15s" ' +
          'onmouseenter="this.style.background=\'rgba(3,105,161,0.28)\'" onmouseleave="this.style.background=\'rgba(3,105,161,0.15)\'" ' +
          'aria-label="' + nativeLabel + '">' + nativeLabel + '</button>' +
      '</div>';
  }

  return { score, renderBtn, _waUrl };
})();
