const A11y = (() => {
  let _liveEl = null;
  function _getLive() {
    if (!_liveEl) {
      _liveEl = document.createElement('div');
      _liveEl.id = 'a11y-live';
      _liveEl.setAttribute('role', 'status');
      _liveEl.setAttribute('aria-live', 'polite');
      _liveEl.setAttribute('aria-atomic', 'true');
      _liveEl.className = 'sr-only';
      document.body.appendChild(_liveEl);
    }
    return _liveEl;
  }
  function announce(msg, priority = 'polite') {
    const el = _getLive();
    el.setAttribute('aria-live', priority);
    el.textContent = '';
    requestAnimationFrame(() => {
      el.textContent = msg;
    });
  }
  function trapFocus(el) {
    const selector = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(el.querySelectorAll(selector));
    if (!focusable.length)
      return;
    focusable[0].focus();
    el._trapHandler = e => {
      if (e.key !== 'Tab')
        return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    el.addEventListener('keydown', el._trapHandler);
  }
  function releaseFocus(el) {
    if (el._trapHandler) {
      el.removeEventListener('keydown', el._trapHandler);
      delete el._trapHandler;
    }
  }
  function closeOnEscape(el, onClose) {
    const handler = e => {
      if (e.key === 'Escape') {
        onClose();
        document.removeEventListener('keydown', handler);
      }
    };
    document.addEventListener('keydown', handler);
  }
  function labelIconButtons(root = document) {
    root.querySelectorAll('button:not([aria-label])').forEach(btn => {
      const text = btn.textContent.trim();
      if (text.length <= 3 && /^\p{Emoji}/u.test(text)) {
        btn.setAttribute('aria-label', text);
      }
    });
  }
  function enableHomeKeyNav() {
    document.addEventListener('keydown', e => {
      if (document.getElementById('gameView')?.classList.contains('hidden') === false)
        return;
      if (e.target && e.target.closest && e.target.closest('input,select,textarea'))
        return;
      const cards = Array.from(document.querySelectorAll('.premium-card'));
      const idx = cards.indexOf(document.activeElement?.closest('.premium-card'));
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        cards[Math.min(idx + 1, cards.length - 1)]?.querySelector('button')?.focus();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        cards[Math.max(idx - 1, 0)]?.querySelector('button')?.focus();
      }
    });
  }
  function init() {
    _getLive();
    enableHomeKeyNav();
    labelIconButtons();
  }
  return {
    announce,
    trapFocus,
    releaseFocus,
    closeOnEscape,
    labelIconButtons,
    init
  };
})();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', A11y.init.bind(A11y));
} else {
  A11y.init();
}