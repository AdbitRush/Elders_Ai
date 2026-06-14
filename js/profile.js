// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE — personal name + avatar + first-visit modal
// ═══════════════════════════════════════════════════════════════════════════════
const Profile = (() => {
  const K_NAME = 'gg_name', K_AV = 'gg_avatar', K_SEEN = 'gg_profile_seen';
  const AVATARS = ['⭐','🦁','🌺','🦋','🎨','🎵','🌻','🦅','🏡','🕊️','🌈','🎭'];

  function get()   { return { name: localStorage.getItem(K_NAME)||'', avatar: localStorage.getItem(K_AV)||'⭐' }; }
  function set(n,a){ localStorage.setItem(K_NAME, n.trim()); localStorage.setItem(K_AV, a); }
  function hasName(){ return !!localStorage.getItem(K_NAME); }

  function greeting() {
    const lang = typeof currentLang!=='undefined' ? currentLang : 'he';
    const isHe = lang==='he';
    const h = new Date().getHours();
    const { name, avatar } = get();
    const time = h>=5&&h<12 ? (isHe?'בוקר טוב':'Good morning')
                :h>=12&&h<17 ? (isHe?'צהריים טובים':'Good afternoon')
                :h>=17&&h<21 ? (isHe?'ערב טוב':'Good evening')
                : (isHe?'לילה שקט':'Good night');
    return name ? `${time}, ${name}! ${avatar}` : `${time}! 💛`;
  }

  function updateGreetingEl() {
    const el = document.getElementById('greetingText');
    if (el) el.innerText = greeting();
    // Also update profile chip
    const { name, avatar } = get();
    const chip = document.getElementById('profile-chip');
    if (chip) {
      const av = chip.querySelector('.av'), nm = chip.querySelector('.nm');
      if (av) av.textContent = avatar;
      if (nm) nm.textContent = name || (typeof currentLang!=='undefined'&&currentLang==='he'?'פרופיל':'Profile');
    }
  }

  function showFirstVisitModal(onComplete) {
    if (localStorage.getItem(K_SEEN)) { onComplete?.(); return; }
    const isHe = typeof currentLang!=='undefined' ? currentLang==='he' : true;

    const overlay = document.createElement('div');
    overlay.id = 'profile-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(6,12,26,0.93);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(10px)';

    const avBtns = AVATARS.map(a =>
      `<button class="av-opt" data-av="${a}" onclick="Profile._pickAv('${a}',this)" style="font-size:1.7rem;background:rgba(255,255,255,0.05);border:2.5px solid transparent;border-radius:50%;width:48px;height:48px;cursor:pointer;transition:all 0.18s;line-height:1">${a}</button>`
    ).join('');

    overlay.innerHTML = `
      <div style="background:linear-gradient(160deg,#0a1628,#0f2744);border:1px solid rgba(183,121,31,0.45);border-radius:2rem;padding:2.5rem;max-width:440px;width:100%;text-align:center;box-shadow:0 32px 80px rgba(0,0,0,0.8)">
        <div style="font-size:3rem;margin-bottom:0.4rem">🧠</div>
        <h2 style="font-size:1.8rem;font-weight:800;color:#f6c048;margin:0 0 0.4rem">${isHe?'ברוכים הבאים!':'Welcome!'}</h2>
        <p style="color:rgba(180,210,255,0.8);font-size:1rem;margin:0 0 1.5rem">${isHe?'נשמח להכיר אתכם 😊':"We'd love to know you 😊"}</p>

        <label style="display:block;text-align:${isHe?'right':'left'};color:#93c5fd;font-weight:700;font-size:0.9rem;margin-bottom:6px">${isHe?'מה שמכם?':'Your name?'}</label>
        <input id="_pname" type="text" maxlength="20" autocomplete="given-name"
          placeholder="${isHe?'לדוגמה: דוד, רות...':'e.g. David, Ruth...'}"
          style="width:100%;background:rgba(255,255,255,0.07);border:2px solid rgba(183,121,31,0.35);border-radius:0.75rem;padding:0.75rem 1rem;color:#fff;font-size:1.15rem;font-family:inherit;margin-bottom:1.25rem;direction:${isHe?'rtl':'ltr'};outline:none;box-sizing:border-box;transition:border-color 0.2s"
          oninput="this.style.borderColor='#b7791f'" onkeydown="if(event.key==='Enter')Profile._save()">

        <label style="display:block;text-align:${isHe?'right':'left'};color:#93c5fd;font-weight:700;font-size:0.9rem;margin-bottom:8px">${isHe?'בחרו אווטאר:':'Choose avatar:'}</label>
        <div id="_pavgrid" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:1.5rem">${avBtns}</div>

        <button onclick="Profile._save()" style="width:100%;background:linear-gradient(135deg,#b7791f,#f6c048);color:#0a1628;border:none;border-radius:0.9rem;padding:0.9rem;font-size:1.15rem;font-weight:800;cursor:pointer;margin-bottom:0.5rem">
          ${isHe?'✅ בואו נתחיל!':'✅ Let\'s go!'}
        </button>
        <button onclick="Profile._skip()" style="background:none;border:none;color:rgba(148,163,184,0.6);font-size:0.85rem;cursor:pointer;padding:0.4rem;width:100%">
          ${isHe?'דלג':'Skip'}
        </button>
      </div>`;

    let _selectedAv = AVATARS[0];
    Profile._pickAv = (av, btn) => {
      document.querySelectorAll('.av-opt').forEach(b => { b.style.borderColor='transparent'; b.style.background='rgba(255,255,255,0.05)'; });
      btn.style.borderColor = '#f6c048'; btn.style.background = 'rgba(183,121,31,0.25)';
      _selectedAv = av;
    };
    Profile._save = () => {
      const name = document.getElementById('_pname')?.value?.trim() || '';
      set(name, _selectedAv);
      localStorage.setItem(K_SEEN, '1');
      overlay.remove(); updateGreetingEl(); onComplete?.();
    };
    Profile._skip = () => { localStorage.setItem(K_SEEN, '1'); overlay.remove(); onComplete?.(); };

    document.body.appendChild(overlay);
    // Select first avatar
    const first = overlay.querySelector('.av-opt');
    if (first) { first.style.borderColor='#f6c048'; first.style.background='rgba(183,121,31,0.25)'; }
    setTimeout(() => document.getElementById('_pname')?.focus(), 350);
  }

  function edit() {
    localStorage.removeItem(K_SEEN);
    showFirstVisitModal(updateGreetingEl);
  }

  return { get, set, hasName, greeting, updateGreetingEl, showFirstVisitModal, edit };
})();
