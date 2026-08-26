// ═══════════════════════════════════════════════════════════════════════════════
// SHARE  (js/share.js)
// Share scores AND invite friends — native Web Share API, WhatsApp, Email,
// and clipboard fallback. Localized for he/en/es/fr/de/el.
// Usage:
//   Share.invite()                                  → invite-friends sheet
//   Share.score('simon', 12)                        → native share score
//   Share.renderBtn(container, gameId, score)       → WhatsApp + share buttons
// ═══════════════════════════════════════════════════════════════════════════════

const Share = (() => {
  const BASE_URL = 'https://games.178-105-148-72.sslip.io/';

  const L = {
    he: {
      brand: 'משחקי מוח', tagline: 'אימון מוח יומי לגיל השלישי — חינם לגמרי',
      score: (g, s) => `🏆 הגעתי לרמה ${s} במשחקי מוח (${g})! שחקו גם אתם: ${BASE_URL}#${g}`,
      inviteText: `🧠 משחקי מוח — אימון יומיומי למוח חד וצלול, חינם לגמרי ובלי פרסומות מקפיצות. בואו לשחק: ${BASE_URL}`,
      inviteTitle: 'משחקי מוח — הזמנה לשחק',
      emailSubject: 'בואו לשחק במשחקי מוח 🧠',
      wa: 'שתפו בוואטסאפ', native: '📤 שתף', copy: '📋 העתק לינק',
      copied: '📋 הועתק ללוח!', email: '📧 שלח במייל', sms: '💬 שלח ב-SMS',
      inviteBtn: '📤 הזמן חברים',
    },
    en: {
      brand: 'BrainPlay', tagline: 'Daily brain training for seniors — 100% free',
      score: (g, s) => `🏆 I reached level ${s} in BrainPlay (${g})! Play free: ${BASE_URL}#${g}`,
      inviteText: `🧠 BrainPlay — daily brain training for a sharp mind, 100% free with no pop-ups. Come play: ${BASE_URL}`,
      inviteTitle: 'BrainPlay — you are invited',
      emailSubject: 'Come play BrainPlay 🧠',
      wa: 'Share on WhatsApp', native: '📤 Share', copy: '📋 Copy link',
      copied: '📋 Copied to clipboard!', email: '📧 Send by email', sms: '💬 Send by SMS',
      inviteBtn: '📤 Invite friends',
    },
    es: {
      brand: 'Juegos de Mente', tagline: 'Entrenamiento cerebral diario para mayores — 100% gratis',
      score: (g, s) => `🏆 ¡Llegué al nivel ${s} en Juegos de Mente (${g})! Juega gratis: ${BASE_URL}#${g}`,
      inviteText: `🧠 Juegos de Mente — entrenamiento cerebral diario, 100% gratis y sin ventanas emergentes. ¡Ven a jugar: ${BASE_URL}`,
      inviteTitle: 'Juegos de Mente — estás invitado',
      emailSubject: 'Ven a jugar a Juegos de Mente 🧠',
      wa: 'Compartir en WhatsApp', native: '📤 Compartir', copy: '📋 Copiar enlace',
      copied: '📋 ¡Copiado al portapapeles!', email: '📧 Enviar por correo', sms: '💬 Enviar por SMS',
      inviteBtn: '📤 Invitar amigos',
    },
    fr: {
      brand: "Jeux de l'Esprit", tagline: "Entraînement cérébral quotidien pour les aînés — 100% gratuit",
      score: (g, s) => `🏆 J'ai atteint le niveau ${s} à Jeux de l'Esprit (${g}) ! Jouez gratuitement : ${BASE_URL}#${g}`,
      inviteText: `🧠 Jeux de l'Esprit — entraînement cérébral quotidien, 100% gratuit et sans pop-ups. Venez jouer : ${BASE_URL}`,
      inviteTitle: "Jeux de l'Esprit — vous êtes invité",
      emailSubject: "Venez jouer à Jeux de l'Esprit 🧠",
      wa: 'Partager sur WhatsApp', native: '📤 Partager', copy: '📋 Copier le lien',
      copied: '📋 Lien copié !', email: '📧 Envoyer par e-mail', sms: '💬 Envoyer par SMS',
      inviteBtn: '📤 Inviter des amis',
    },
    de: {
      brand: 'Gehirnspiele', tagline: 'Tägliches Gehirntraining für Senioren — 100% kostenlos',
      score: (g, s) => `🏆 Ich habe Level ${s} bei Gehirnspiele (${g}) erreicht! Spiel kostenlos mit: ${BASE_URL}#${g}`,
      inviteText: `🧠 Gehirnspiele — tägliches Gehirntraining für einen wachen Geist, 100% kostenlos und ohne Pop-ups. Spiel mit: ${BASE_URL}`,
      inviteTitle: 'Gehirnspiele — du bist eingeladen',
      emailSubject: 'Spiel mit bei Gehirnspiele 🧠',
      wa: 'Auf WhatsApp teilen', native: '📤 Teilen', copy: '📋 Link kopieren',
      copied: '📋 In Zwischenablage kopiert!', email: '📧 Per E-Mail senden', sms: '💬 Per SMS senden',
      inviteBtn: '📤 Freunde einladen',
    },
    el: {
      brand: 'Παιχνίδια Μυαλού', tagline: 'Καθημερινή εκγύμναση μυαλού για ηλικιωμένους — 100% δωρεάν',
      score: (g, s) => `🏆 Έφτασα στο επίπεδο ${s} στα Παιχνίδια Μυαλού (${g})! Παίξε δωρεάν: ${BASE_URL}#${g}`,
      inviteText: `🧠 Παιχνίδια Μυαλού — καθημερινή εκγύμναση μυαλού, 100% δωρεάν και χωρίς αναδυόμενα. Ελάτε να παίξετε: ${BASE_URL}`,
      inviteTitle: 'Παιχνίδια Μυαλού — είστε καλεσμένοι',
      emailSubject: 'Ελάτε να παίξετε Παιχνίδια Μυαλού 🧠',
      wa: 'Κοινή χρήση στο WhatsApp', native: '📤 Κοινή χρήση', copy: '📋 Αντιγραφή συνδέσμου',
      copied: '📋 Αντιγράφηκε!', email: '📧 Αποστολή με email', sms: '💬 Αποστολή με SMS',
      inviteBtn: '📤 Προσκαλέστε φίλους',
    },
  };

  function _lang() {
    return (typeof currentLang !== 'undefined' && L[currentLang]) ? currentLang : 'en';
  }
  function _t() { return L[_lang()]; }

  function _toast(msg) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#1a365d;color:#fff;padding:10px 18px;border-radius:9999px;font-weight:700;font-size:0.9rem;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.4);opacity:0;transition:opacity 0.3s;pointer-events:none;max-width:90vw;text-align:center';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = '0'; }, 2600);
  }

  async function _nativeShare(data) {
    if (navigator.share && navigator.canShare?.(data)) {
      try { await navigator.share(data); return true; }
      catch (err) { if (err.name === 'AbortError') return true; }
    }
    return false;
  }

  // ── Invite friends (navbar button) ──────────────────────────────────────
  async function invite() {
    const t = _t();
    const text = t.inviteText;
    const data = { title: t.inviteTitle, text, url: BASE_URL };
    const ok = await _nativeShare(data);
    if (ok) return;

    // Show the friendly chooser: WhatsApp / Email / SMS / Copy
    const dlg = document.createElement('div');
    dlg.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9998;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)';
    const wa = 'https://wa.me/?text=' + encodeURIComponent(text);
    const mail = 'mailto:?subject=' + encodeURIComponent(t.emailSubject) + '&body=' + encodeURIComponent(text);
    const sms = 'sms:?&body=' + encodeURIComponent(text);
    const btnStyle = 'display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;border-radius:14px;font-weight:800;font-size:1rem;cursor:pointer;border:none;margin-bottom:10px;color:#fff';
    dlg.innerHTML =
      '<div style="background:#fff;border-radius:22px;padding:24px;max-width:380px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,0.5);text-align:center;color:#1e293b">' +
        '<div style="font-size:2.2rem;margin-bottom:6px">🧠</div>' +
        '<div style="font-size:1.25rem;font-weight:800;margin-bottom:4px">' + t.inviteTitle + '</div>' +
        '<div style="font-size:0.88rem;color:#64748b;margin-bottom:18px">' + t.tagline + '</div>' +
        '<a href="' + wa + '" target="_blank" rel="noopener" style="' + btnStyle + 'background:#25D366">' + t.wa + '</a>' +
        '<a href="' + mail + '" style="' + btnStyle + 'background:#1a365d">' + t.email + '</a>' +
        '<a href="' + sms + '" style="' + btnStyle + 'background:#0ea5e9">' + t.sms + '</a>' +
        '<button id="ggCopyBtn" style="' + btnStyle + 'background:#64748b;margin-bottom:0">' + t.copy + '</button>' +
        '<button id="ggCloseBtn" style="margin-top:12px;background:none;border:none;color:#94a3b8;font-size:0.85rem;cursor:pointer;font-weight:700">✕</button>' +
      '</div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.remove(); });
    dlg.querySelector('#ggCloseBtn').addEventListener('click', () => dlg.remove());
    dlg.querySelector('#ggCopyBtn').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(text); _toast(t.copied); }
      catch { _toast(text); }
      dlg.remove();
    });
  }

  // ── Share a score (win modals) ──────────────────────────────────────────
  async function score(gameId, value) {
    const t = _t();
    const text = t.score(gameId, value);
    const data = { title: t.brand, text, url: `${BASE_URL}#${gameId}` };
    const ok = await _nativeShare(data);
    if (ok) return;
    try {
      await navigator.clipboard.writeText(text);
      _toast(t.copied);
    } catch {
      _toast(text);
    }
  }

  function _waUrl(gameId, value) {
    const t = _t();
    return 'https://wa.me/?text=' + encodeURIComponent(t.score(gameId, value));
  }

  function renderBtn(container, gameId, value) {
    const t = _t();
    const waUrl = _waUrl(gameId, value);
    container.innerHTML =
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:4px">' +
        '<a href="' + waUrl + '" target="_blank" rel="noopener" class="wa-btn" aria-label="' + t.wa + '">' +
          '<svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.82.736 5.47 2.025 7.773L0 32l8.427-2.007A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.25a13.2 13.2 0 01-6.726-1.835l-.483-.287-4.998 1.19 1.24-4.862-.315-.5A13.22 13.22 0 012.75 16C2.75 8.682 8.682 2.75 16 2.75S29.25 8.682 29.25 16 23.318 29.25 16 29.25zm7.22-9.927c-.396-.198-2.344-1.157-2.707-1.288-.363-.132-.627-.198-.89.198s-1.022 1.288-1.253 1.553c-.23.264-.462.297-.858.099-.396-.198-1.671-.616-3.183-1.963-1.176-1.05-1.97-2.346-2.201-2.742-.23-.396-.024-.61.173-.807.178-.178.396-.462.594-.693.198-.23.264-.396.396-.66.132-.264.066-.495-.033-.693-.099-.198-.89-2.146-1.22-2.94-.32-.77-.648-.666-.89-.678l-.759-.013c-.264 0-.693.099-1.056.495s-1.386 1.354-1.386 3.302 1.42 3.83 1.617 4.094c.198.264 2.794 4.267 6.77 5.983.946.408 1.684.652 2.26.834.95.302 1.815.26 2.498.158.762-.114 2.344-.958 2.674-1.883.33-.924.33-1.716.23-1.882-.099-.165-.363-.264-.759-.462z"/></svg>' +
          ' ' + t.wa +
        '</a>' +
        '<button onclick="Share.score(\'' + gameId + '\',' + value + ')" ' +
          'style="background:rgba(3,105,161,0.15);border:1.5px solid rgba(14,165,233,0.4);color:#38bdf8;border-radius:9999px;padding:0.5rem 1.2rem;font-weight:700;font-size:0.88rem;cursor:pointer;transition:all 0.15s" ' +
          'onmouseenter="this.style.background=\'rgba(3,105,161,0.28)\'" onmouseleave="this.style.background=\'rgba(3,105,161,0.15)\'" ' +
          'aria-label="' + t.native + '">' + t.native + '</button>' +
      '</div>';
  }

  return { score, renderBtn, invite, _waUrl, _lang };
})();
