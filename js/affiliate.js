// js/affiliate.js — optional sponsored-link ticker (Amazon / AliExpress).
//
// CONFIG IS COMMITTED, NOT EDITED IN THE BROWSER. The old in-page "admin"
// (password hash + tags + products in each visitor's localStorage) protected
// nothing and its settings never reached other visitors; it was removed on
// 2026-10-06. To turn this on, edit AFFILIATE_CONFIG below, commit, push.
// Affiliate IDs are public by nature (they appear in every outgoing link), so
// they belong in the repo — never put a password or API secret here.
//
// With platform 'off' or no products, this file does nothing and the normal
// site-message ticker keeps running.
const AFFILIATE_CONFIG = {
  platform: 'off',          // 'off' | 'amazon' | 'aliexpress' | 'both'
  amazonTag: '',            // e.g. 'yourtag-21'
  products: [
    // { name_en: 'Large-print puzzle book', name_he: 'ספר חידות בדפוס גדול', emoji: '📖',
    //   amazon_url: 'https://www.amazon.com/dp/XXXXXXXXXX', ali_url: '' },
  ],
};

const Affiliate = (() => {
  'use strict';

  // Remove what the retired browser-side admin left behind on existing visitors.
  try { ['gg_aff_cfg', 'gg_aff_products', 'gg_aff_auth'].forEach(k => localStorage.removeItem(k)); } catch (e) {}

  function _esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _link(p) {
    const { platform, amazonTag } = AFFILIATE_CONFIG;
    if ((platform === 'amazon' || platform === 'both') && p.amazon_url) {
      const u = p.amazon_url;
      return amazonTag ? u + (u.includes('?') ? '&' : '?') + 'tag=' + encodeURIComponent(amazonTag) : u;
    }
    if ((platform === 'aliexpress' || platform === 'both') && p.ali_url) return p.ali_url;
    return null;
  }

  function _safeHref(u) { return /^https:\/\//i.test(u || '') ? u : null; }

  function _name(p) {
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'he';
    return (lang === 'he' ? p.name_he : p.name_en) || p.name_en || p.name_he || '';
  }

  let _iv = null, _idx = 0;

  function _rotate() {
    const el = document.getElementById('adFallback');
    const items = AFFILIATE_CONFIG.products.filter(p => _name(p) && _safeHref(_link(p)));
    if (!el || !items.length) return;
    const p = items[_idx++ % items.length];
    el.style.opacity = '0';
    setTimeout(() => {
      el.innerHTML = (p.emoji || '🛍️') + ' <a href="' + _esc(_safeHref(_link(p))) +
        '" target="_blank" rel="noopener nofollow sponsored" style="color:#f6c048;text-decoration:none;font-weight:600">' +
        _esc(_name(p)) + ' →</a>';
      el.style.opacity = '1';
    }, 450);
  }

  function init() {
    if (AFFILIATE_CONFIG.platform === 'off') return;
    if (!AFFILIATE_CONFIG.products.some(p => _safeHref(_link(p)))) return;
    clearInterval(window._adTickerIv);          // replace the site-message ticker
    const pill = document.querySelector('.ad-pill');
    if (pill) pill.textContent = AFFILIATE_CONFIG.platform === 'amazon' ? 'Amazon'
      : AFFILIATE_CONFIG.platform === 'aliexpress' ? 'AliExpress' : 'Shop';
    _rotate();
    _iv = setInterval(_rotate, 8000);
  }

  return { init };
})();

Affiliate.init();
