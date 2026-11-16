const Profile = (() => {
  const K_AV = 'gg_avatar', K_SEEN = 'gg_profile_seen';
  const AVATARS = [
    '\u2B50',
    '\uD83E\uDD81',
    '\uD83C\uDF3A',
    '\uD83E\uDD8B',
    '\uD83C\uDFA8',
    '\uD83C\uDFB5',
    '\uD83C\uDF3B',
    '\uD83E\uDD85',
    '\uD83C\uDFE1',
    '\uD83D\uDD4A️',
    '\uD83C\uDF08',
    '\uD83C\uDFAD'
  ];
  const L = {
    en: {
      title: 'Welcome!',
      sub: 'Let\'s get to know you',
      name: 'What is your name?',
      ph: 'e.g. David, Ruth\u2026',
      avatar: 'Pick a symbol of your own',
      go: 'Let\'s begin',
      skip: 'Continue without',
      chosen: 'chosen',
      preview: 'This is how we will greet you:'
    }
  };
  const PROFILE_WORD = { en: 'Profile' };
  function lang() {
    const l = typeof currentLang !== 'undefined' ? currentLang : 'he';
    return L[l] ? l : 'en';
  }
  function isRTL(l) {
    return l === 'he';
  }
  function get() {
    return { avatar: localStorage.getItem(K_AV) || '\u2B50' };
  }
  function set(n, a) {
    localStorage.setItem(K_AV, a);
  }
  function updateGreetingEl() {
    const el = document.getElementById('greetingText');
    if (el)
      el.remove();
    const {avatar} = get();
    const chip = document.getElementById('profile-chip');
    if (chip) {
      const av = chip.querySelector('.av'), nm = chip.querySelector('.nm');
      if (av)
        av.textContent = avatar;
      if (nm)
        nm.textContent = PROFILE_WORD[lang()] || 'Profile';
    }
  }
  function injectStyles() {
    if (document.getElementById('profile-modal-css'))
      return;
    const st = document.createElement('style');
    st.id = 'profile-modal-css';
    st.textContent = `
.pm-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;
  padding:20px;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(183,121,31,.22),transparent 70%),rgba(4,10,22,.90);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);animation:pmFade .35s ease both}
.pm-card{position:relative;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;text-align:center;
  background:linear-gradient(165deg,#0d1c33 0%,#0a1628 55%,#101f38 100%);
  border:1px solid rgba(246,192,72,.34);border-radius:28px;padding:38px 34px 30px;
  box-shadow:0 40px 90px rgba(0,0,0,.75),0 0 0 1px rgba(255,255,255,.05) inset,0 0 90px rgba(183,121,31,.18);
  animation:pmRise .5s cubic-bezier(.2,.9,.25,1.05) both}
/* A soft gold arc across the top edge — the one decorative flourish. */
.pm-card::before{content:'';position:absolute;top:0;left:14%;right:14%;height:2px;border-radius:2px;
  background:linear-gradient(90deg,transparent,#f6c048,transparent)}
.pm-mark{font-size:3.4rem;line-height:1;margin-bottom:10px;display:block;
  filter:drop-shadow(0 6px 22px rgba(246,192,72,.45));animation:pmFloat 4.5s ease-in-out infinite}
.pm-title{font-size:2.1rem;font-weight:800;color:#f6c048;margin:0 0 6px;letter-spacing:-.01em}
.pm-sub{font-size:1.12rem;color:#b8cdf0;margin:0 0 26px}
.pm-label{display:block;font-size:1.05rem;font-weight:700;color:#e8f0ff;margin:0 0 10px}
.pm-input{width:100%;box-sizing:border-box;background:rgba(255,255,255,.07);color:#fff;
  border:2px solid rgba(246,192,72,.30);border-radius:16px;padding:0 18px;min-height:60px;
  font-family:inherit;font-size:1.3rem;font-weight:600;outline:none;transition:border-color .2s,box-shadow .2s}
.pm-input::placeholder{color:rgba(184,205,240,.55);font-weight:400}
.pm-input:focus{border-color:#f6c048;box-shadow:0 0 0 4px rgba(246,192,72,.24)}
.pm-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin:0 0 8px}
@media (max-width:430px){.pm-grid{grid-template-columns:repeat(4,1fr)}}
.pm-overlay button.pm-av{position:relative;aspect-ratio:1;min-height:56px;display:flex;align-items:center;justify-content:center;
  font-size:1.75rem;line-height:1;cursor:pointer;background:rgba(255,255,255,.06);
  border:2px solid rgba(255,255,255,.10);border-radius:18px;transition:transform .18s,border-color .18s,background .18s;padding:0}
.pm-overlay button.pm-av:hover{transform:translateY(-3px);background:rgba(255,255,255,.12)}
.pm-overlay button.pm-av:focus-visible{outline:3px solid #7dd3fc;outline-offset:3px}
.pm-overlay button.pm-av[aria-checked="true"]{border-color:#f6c048;background:rgba(183,121,31,.30);transform:translateY(-3px);
  box-shadow:0 8px 24px rgba(183,121,31,.45)}
/* Selection has to read without relying on colour alone. */
.pm-overlay button.pm-av[aria-checked="true"]::after{content:'✓';position:absolute;top:-7px;inset-inline-end:-7px;
  width:22px;height:22px;border-radius:50%;background:#f6c048;color:#0a1628;
  font-size:.8rem;font-weight:900;display:flex;align-items:center;justify-content:center}
.pm-preview{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;
  background:rgba(125,211,252,.08);border:1px solid rgba(125,211,252,.24);border-radius:16px;
  padding:14px 18px;margin:22px 0 24px}
.pm-preview-cap{font-size:.92rem;color:#9fb6da;width:100%;margin:0}
.pm-preview-line{font-size:1.25rem;font-weight:800;color:#fff;margin:0}
.pm-overlay button.pm-go{width:100%;min-height:62px;border:none;border-radius:18px;cursor:pointer;
  background:linear-gradient(135deg,#b7791f,#f6c048);color:#12203a;
  font-family:inherit;font-size:1.25rem;font-weight:800;
  box-shadow:0 14px 34px rgba(183,121,31,.45);transition:filter .2s,transform .2s}
.pm-overlay button.pm-go:hover{filter:brightness(1.06);transform:translateY(-2px)}
.pm-overlay button.pm-go:focus-visible{outline:3px solid #7dd3fc;outline-offset:3px}
.pm-overlay button.pm-skip{margin-top:14px;background:none;border:none;cursor:pointer;font-family:inherit;
  font-size:1.02rem;font-weight:600;color:#a8c0e4;text-decoration:underline;
  text-underline-offset:4px;padding:10px 14px;min-height:48px;border-radius:12px}
.pm-overlay button.pm-skip:hover{color:#f6c048}
.pm-overlay button.pm-skip:focus-visible{outline:3px solid #7dd3fc;outline-offset:2px}
@keyframes pmFade{from{opacity:0}to{opacity:1}}
@keyframes pmRise{from{opacity:0;transform:translateY(26px) scale(.965)}to{opacity:1;transform:none}}
@keyframes pmFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@media (prefers-reduced-motion:reduce){
  .pm-overlay,.pm-card,.pm-mark{animation:none}
  .pm-overlay button.pm-av,.pm-overlay button.pm-go{transition:none}
  .pm-overlay button.pm-av:hover,.pm-overlay button.pm-go:hover,.pm-overlay button.pm-av[aria-checked="true"]{transform:none}
}
/* Light theme: the same card, on paper. */
html[data-theme="light"] .pm-overlay{background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(183,121,31,.16),transparent 70%),rgba(226,233,244,.92)}
html[data-theme="light"] .pm-card{background:linear-gradient(165deg,#ffffff,#f4f7fc);
  border-color:rgba(183,121,31,.45);box-shadow:0 40px 90px rgba(26,54,93,.28)}
html[data-theme="light"] .pm-title{color:#a1690f}
html[data-theme="light"] .pm-sub{color:#4a5f80}
html[data-theme="light"] .pm-label{color:#1a365d}
html[data-theme="light"] .pm-input{background:#fff;color:#0f172a;border-color:rgba(183,121,31,.45)}
html[data-theme="light"] .pm-input::placeholder{color:#7d8ba3}
html[data-theme="light"] .pm-overlay button.pm-av{background:rgba(26,54,93,.06);border-color:rgba(26,54,93,.14)}
html[data-theme="light"] .pm-overlay button.pm-av[aria-checked="true"]{background:rgba(246,192,72,.35);border-color:#b7791f}
html[data-theme="light"] .pm-preview{background:rgba(26,54,93,.05);border-color:rgba(26,54,93,.16)}
html[data-theme="light"] .pm-preview-cap{color:#5b6f8f}
html[data-theme="light"] .pm-preview-line{color:#1a365d}
html[data-theme="light"] .pm-overlay button.pm-skip{color:#4a5f80}
`;
    document.head.appendChild(st);
  }
  function showFirstVisitModal(onComplete, full) {
    if (!full) {
      onComplete && onComplete();
      return;
    }
    if (localStorage.getItem(K_SEEN)) {
      onComplete && onComplete();
      return;
    }
    injectStyles();
    const l = lang(), tx = L[l], rtl = isRTL(l);
    const saved = get();
    let picked = AVATARS.indexOf(saved.avatar) >= 0 ? saved.avatar : AVATARS[0];
    const overlay = document.createElement('div');
    overlay.className = 'pm-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'pm-title');
    overlay.innerHTML = `
      <div class="pm-card" dir="${ 'ltr' }">
        <span class="pm-mark" aria-hidden="true">🧠</span>
        <h2 class="pm-title" id="pm-title">${ PROFILE_WORD[l] }</h2>

        <p class="pm-label" id="pm-avlabel" style="text-align:${ 'left' }">${ tx.avatar }</p>
        <div class="pm-grid" role="radiogroup" aria-labelledby="pm-avlabel">
          ${ AVATARS.map((a, i) => `<button type="button" class="pm-av" role="radio"
              aria-checked="${ a === picked ? 'true' : 'false' }" tabindex="${ a === picked ? '0' : '-1' }"
              data-av="${ a }" data-i="${ i }" aria-label="${ a } ${ a === picked ? tx.chosen : '' }">${ a }</button>`).join('') }
        </div>

        <button type="button" class="pm-go" id="pm-go">✅ ${ tx.go }</button>
        <button type="button" class="pm-skip" id="pm-skip">${ tx.skip }</button>
      </div>`;
    const $ = sel => overlay.querySelector(sel);
    const avButtons = Array.from(overlay.querySelectorAll('.pm-av'));
    function pick(av) {
      picked = av;
      avButtons.forEach(b => {
        const on = b.dataset.av === av;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        b.setAttribute('aria-label', `${ b.dataset.av } ${ on ? tx.chosen : '' }`.trim());
      });
    }
    avButtons.forEach(b => {
      b.addEventListener('click', () => pick(b.dataset.av));
      b.addEventListener('keydown', e => {
        const step = {
          ArrowRight: 1,
          ArrowLeft: -1,
          ArrowDown: 6,
          ArrowUp: -6
        }[e.key];
        if (step === undefined)
          return;
        e.preventDefault();
        const dir = step;
        const next = avButtons[(Number(b.dataset.i) + dir + avButtons.length) % avButtons.length];
        pick(next.dataset.av);
        next.focus();
      });
    });
    function close() {
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
    }
    function save() {
      set('', picked);
      localStorage.setItem(K_SEEN, '1');
      close();
      updateGreetingEl();
      onComplete && onComplete();
    }
    function skip() {
      localStorage.setItem(K_SEEN, '1');
      close();
      onComplete && onComplete();
    }
    $('#pm-go').addEventListener('click', save);
    $('#pm-skip').addEventListener('click', skip);
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        skip();
        return;
      }
      if (e.key !== 'Tab')
        return;
      const stops = [
        avButtons.find(b => b.tabIndex === 0),
        $('#pm-go'),
        $('#pm-skip')
      ].filter(Boolean);
      const i = stops.indexOf(document.activeElement);
      if (i === -1)
        return;
      const next = e.shiftKey ? i - 1 : i + 1;
      if (next < 0 || next >= stops.length) {
        e.preventDefault();
        stops[(next + stops.length) % stops.length].focus();
      }
    }
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(overlay);
    setTimeout(() => avButtons.find(b => b.tabIndex === 0).focus(), 380);
  }
  function edit() {
    localStorage.removeItem(K_SEEN);
    showFirstVisitModal(updateGreetingEl, true);
  }
  function relang() {
  }
  return {
    get,
    set,
    updateGreetingEl,
    showFirstVisitModal,
    edit,
    relang
  };
})();