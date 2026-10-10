/* consent.js — cookie consent for BrainPlay (2026-10-10).
   The banner is vanilla-cookieconsent 3.1.0 (MIT, self-hosted in js/vendor/cookieconsent/). It asks once, in the
   visitor's language, with "Accept" and "Reject" as equal buttons, and stores the answer in its own cookie.
   Google Consent Mode v2: everything starts DENIED (the inline snippet in index.html's <head> sets the defaults
   before any other script); only an "Accept" for advertising grants ad storage. No ad code is loaded by this file -
   when the AdSense tag is added it reads these signals. Game progress lives in localStorage on the device and is
   strictly necessary, so it is not behind consent.
   Footer "Cookie settings" reopens the choice: CookieConsent.showPreferences(). */
(function () {
  if (typeof CookieConsent === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function applyAds() {
    const ok = CookieConsent.acceptedCategory('ads');
    gtag('consent', 'update', {
      ad_storage: ok ? 'granted' : 'denied',
      ad_user_data: ok ? 'granted' : 'denied',
      ad_personalization: ok ? 'granted' : 'denied',
    });
  }

  const T = {
    en: {
      title: 'Cookies and ads', desc: 'BrainPlay is free because small ads are shown between games, never during a game. With your permission, our ad partner (Google) may use cookies to measure the ads and show ones that suit you. Your game progress stays on this device either way.',
      accept: 'Accept', reject: 'Reject', manage: 'Choose', save: 'Save my choice', ptitle: 'Cookie settings',
      nec: 'Needed for the site', necd: 'Remembers your cookie choice. Your scores, levels, name and settings are kept in this browser only and are never sent to us.',
      ads: 'Advertising', adsd: 'Lets Google use cookies to measure ads and choose ads that suit you. If you say no, you may still see ads, but they are not based on your browsing.',
      privacy: 'Privacy policy',
    },
    he: {
      title: 'עוגיות ופרסומות', desc: 'BrainPlay חינם כי מוצגות בו פרסומות קטנות בין משחק למשחק, אף פעם לא באמצע משחק. ברשותכם, שותף הפרסום שלנו (Google) יכול להשתמש בעוגיות כדי למדוד את הפרסומות ולהציג פרסומות שמתאימות לכם. ההתקדמות שלכם במשחקים נשמרת במכשיר בכל מקרה.',
      accept: 'מסכים', reject: 'לא מסכים', manage: 'לבחור', save: 'שמירת הבחירה', ptitle: 'הגדרות עוגיות',
      nec: 'נחוצות לאתר', necd: 'זוכרות את הבחירה שלכם לגבי עוגיות. הניקוד, השלבים, השם וההגדרות נשמרים רק בדפדפן הזה ולא נשלחים אלינו.',
      ads: 'פרסום', adsd: 'מאפשרות ל-Google להשתמש בעוגיות כדי למדוד פרסומות ולבחור פרסומות שמתאימות לכם. אם תסרבו, ייתכן שעדיין תראו פרסומות, אבל הן לא יתבססו על הגלישה שלכם.',
      privacy: 'מדיניות פרטיות',
    },
    es: {
      title: 'Cookies y anuncios', desc: 'BrainPlay es gratis porque muestra pequeños anuncios entre partidas, nunca durante una partida. Con su permiso, nuestro socio publicitario (Google) puede usar cookies para medir los anuncios y mostrarle los que le interesen. Su progreso en los juegos se guarda en este dispositivo en cualquier caso.',
      accept: 'Aceptar', reject: 'Rechazar', manage: 'Elegir', save: 'Guardar mi elección', ptitle: 'Ajustes de cookies',
      nec: 'Necesarias para el sitio', necd: 'Recuerdan su elección sobre las cookies. Sus puntuaciones, niveles, nombre y ajustes se guardan solo en este navegador y nunca se nos envían.',
      ads: 'Publicidad', adsd: 'Permiten a Google usar cookies para medir los anuncios y elegir los que le interesen. Si dice que no, puede seguir viendo anuncios, pero no basados en su navegación.',
      privacy: 'Política de privacidad',
    },
    fr: {
      title: 'Cookies et publicités', desc: "BrainPlay est gratuit grâce à de petites publicités affichées entre les parties, jamais pendant une partie. Avec votre accord, notre partenaire publicitaire (Google) peut utiliser des cookies pour mesurer les publicités et vous montrer celles qui vous correspondent. Votre progression reste sur cet appareil dans tous les cas.",
      accept: 'Accepter', reject: 'Refuser', manage: 'Choisir', save: 'Enregistrer mon choix', ptitle: 'Réglages des cookies',
      nec: 'Nécessaires au site', necd: "Mémorisent votre choix concernant les cookies. Vos scores, niveaux, nom et réglages restent dans ce navigateur et ne nous sont jamais envoyés.",
      ads: 'Publicité', adsd: "Permettent à Google d'utiliser des cookies pour mesurer les publicités et choisir celles qui vous correspondent. Si vous refusez, vous pourrez voir des publicités, mais elles ne seront pas basées sur votre navigation.",
      privacy: 'Politique de confidentialité',
    },
    de: {
      title: 'Cookies und Werbung', desc: 'BrainPlay ist kostenlos, weil zwischen den Spielen kleine Anzeigen gezeigt werden, nie während eines Spiels. Mit Ihrer Erlaubnis kann unser Werbepartner (Google) Cookies verwenden, um die Anzeigen zu messen und passende Anzeigen zu zeigen. Ihr Spielfortschritt bleibt in jedem Fall auf diesem Gerät.',
      accept: 'Akzeptieren', reject: 'Ablehnen', manage: 'Auswählen', save: 'Auswahl speichern', ptitle: 'Cookie-Einstellungen',
      nec: 'Für die Website nötig', necd: 'Merken sich Ihre Cookie-Auswahl. Punkte, Stufen, Name und Einstellungen bleiben nur in diesem Browser und werden nie an uns gesendet.',
      ads: 'Werbung', adsd: 'Erlauben Google, Cookies zu verwenden, um Anzeigen zu messen und passende Anzeigen auszuwählen. Wenn Sie ablehnen, sehen Sie möglicherweise weiterhin Anzeigen, aber nicht auf Grundlage Ihres Surfverhaltens.',
      privacy: 'Datenschutzerklärung',
    },
    el: {
      title: 'Cookies και διαφημίσεις', desc: 'Το BrainPlay είναι δωρεάν επειδή εμφανίζει μικρές διαφημίσεις ανάμεσα στα παιχνίδια, ποτέ κατά τη διάρκεια ενός παιχνιδιού. Με την άδειά σας, ο διαφημιστικός μας συνεργάτης (Google) μπορεί να χρησιμοποιεί cookies για να μετρά τις διαφημίσεις και να δείχνει όσες σας ταιριάζουν. Η πρόοδός σας μένει σε αυτή τη συσκευή σε κάθε περίπτωση.',
      accept: 'Αποδοχή', reject: 'Απόρριψη', manage: 'Επιλογή', save: 'Αποθήκευση επιλογής', ptitle: 'Ρυθμίσεις cookies',
      nec: 'Απαραίτητα για τον ιστότοπο', necd: 'Θυμούνται την επιλογή σας για τα cookies. Οι βαθμοί, τα επίπεδα, το όνομα και οι ρυθμίσεις σας μένουν μόνο σε αυτό το πρόγραμμα περιήγησης και δεν μας αποστέλλονται ποτέ.',
      ads: 'Διαφήμιση', adsd: 'Επιτρέπουν στη Google να χρησιμοποιεί cookies για να μετρά διαφημίσεις και να επιλέγει όσες σας ταιριάζουν. Αν αρνηθείτε, μπορεί να βλέπετε ακόμα διαφημίσεις, αλλά όχι με βάση την περιήγησή σας.',
      privacy: 'Πολιτική απορρήτου',
    },
  };
  function tr(t) {
    const link = `<a href="privacy.html">${t.privacy}</a>`;
    return {
      consentModal: { title: t.title, description: t.desc + ' ' + link, acceptAllBtn: t.accept, acceptNecessaryBtn: t.reject, showPreferencesBtn: t.manage },
      preferencesModal: {
        title: t.ptitle, acceptAllBtn: t.accept, acceptNecessaryBtn: t.reject, savePreferencesBtn: t.save, closeIconLabel: '×',
        sections: [
          { title: t.nec, description: t.necd, linkedCategory: 'necessary' },
          { title: t.ads, description: t.adsd, linkedCategory: 'ads' },
          { description: link },
        ],
      },
    };
  }
  const translations = {}; Object.keys(T).forEach((l) => { translations[l] = tr(T[l]); });
  const lang = (typeof currentLang !== 'undefined' && T[currentLang]) ? currentLang : 'en';

  CookieConsent.run({
    guiOptions: {
      consentModal: { layout: 'bar inline', position: 'bottom', equalWeightButtons: true, flipButtons: false },
      preferencesModal: { layout: 'box', equalWeightButtons: true },
    },
    categories: { necessary: { enabled: true, readOnly: true }, ads: {} },
    language: { default: lang, rtl: ['he'], translations },
    onConsent: applyAds,
    onChange: applyAds,
  });

  // follow the site's language switch
  if (typeof window.changeLanguage === 'function') {
    const orig = window.changeLanguage;
    window.changeLanguage = function (l) { const r = orig.apply(this, arguments); if (T[l]) CookieConsent.setLanguage(l); return r; };
  }
})();
