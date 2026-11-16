const AFFILIATE_CONFIG = {
  platform: 'off',
  amazonTag: '',
  products: []
};
const Affiliate = (() => {
  'use strict';
  try {
    [
      'gg_aff_cfg',
      'gg_aff_products',
      'gg_aff_auth'
    ].forEach(k => localStorage.removeItem(k));
  } catch (e) {
  }
  function _esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function _link(p) {
    const {platform, amazonTag} = AFFILIATE_CONFIG;
    if ((platform === 'amazon' || platform === 'both') && p.amazon_url) {
      const u = p.amazon_url;
      return amazonTag ? u + (u.includes('?') ? '&' : '?') + 'tag=' + encodeURIComponent(amazonTag) : u;
    }
    if ((platform === 'aliexpress' || platform === 'both') && p.ali_url)
      return p.ali_url;
    return null;
  }
  function _safeHref(u) {
    return /^https:\/\//i.test(u || '') ? u : null;
  }
  function _name(p) {
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'he';
    return p.name_en || p.name_en || p.name_he || '';
  }
  let _iv = null, _idx = 0;
  function _rotate() {
    const el = document.getElementById('adFallback');
    const items = AFFILIATE_CONFIG.products.filter(p => _name(p) && _safeHref(_link(p)));
    if (!el || !items.length)
      return;
    const p = items[_idx++ % items.length];
    el.style.opacity = '0';
    setTimeout(() => {
      el.innerHTML = (p.emoji || '\uD83D\uDECD️') + ' <a href="' + _esc(_safeHref(_link(p))) + '" target="_blank" rel="noopener nofollow sponsored" style="color:#f6c048;text-decoration:none;font-weight:600">' + _esc(_name(p)) + ' \u2192</a>';
      el.style.opacity = '1';
    }, 450);
  }
  function init() {
    if (AFFILIATE_CONFIG.platform === 'off')
      return;
    if (!AFFILIATE_CONFIG.products.some(p => _safeHref(_link(p))))
      return;
    clearInterval(window._adTickerIv);
    const pill = document.querySelector('.ad-pill');
    if (pill)
      pill.textContent = AFFILIATE_CONFIG.platform === 'amazon' ? 'Amazon' : AFFILIATE_CONFIG.platform === 'aliexpress' ? 'AliExpress' : 'Shop';
    _rotate();
    _iv = setInterval(_rotate, 8000);
  }
  return { init };
})();
Affiliate.init();