(function () {
  if (typeof CookieConsent === 'undefined')
    return;
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  function applyAds() {
    const ok = CookieConsent.acceptedCategory('ads');
    gtag('consent', 'update', {
      ad_storage: ok ? 'granted' : 'denied',
      ad_user_data: ok ? 'granted' : 'denied',
      ad_personalization: ok ? 'granted' : 'denied'
    });
  }
  const T = {
    en: {
      title: 'Cookies and ads',
      desc: 'Dear Old Days is free to play. We plan to support it with advertising through Google AdSense. With your permission, Google and its advertising partners may use cookies to measure ads and show ones that suit you. Your game progress stays in your browser either way.',
      accept: 'Accept',
      reject: 'Reject',
      manage: 'Choose',
      save: 'Save my choice',
      ptitle: 'Cookie settings',
      nec: 'Needed for the site',
      necd: 'Remembers your cookie choice. Your scores, levels, name and settings are kept in this browser only and are never sent to us.',
      ads: 'Advertising',
      adsd: 'Lets Google use cookies to measure ads and choose ads that suit you. If you say no, you may still see ads, but they are not based on your browsing.',
      privacy: 'Privacy policy'
    }
  };
  function tr(t) {
    const link = `<a href="privacy.html">${ t.privacy }</a>`;
    return {
      consentModal: {
        title: t.title,
        description: t.desc + ' ' + link,
        acceptAllBtn: t.accept,
        acceptNecessaryBtn: t.reject,
        showPreferencesBtn: t.manage
      },
      preferencesModal: {
        title: t.ptitle,
        acceptAllBtn: t.accept,
        acceptNecessaryBtn: t.reject,
        savePreferencesBtn: t.save,
        closeIconLabel: '\xD7',
        sections: [
          {
            title: t.nec,
            description: t.necd,
            linkedCategory: 'necessary'
          },
          {
            title: t.ads,
            description: t.adsd,
            linkedCategory: 'ads'
          },
          { description: link }
        ]
      }
    };
  }
  const translations = {};
  Object.keys(T).forEach(l => {
    translations[l] = tr(T[l]);
  });
  const lang = typeof currentLang !== 'undefined' && T[currentLang] ? currentLang : 'en';
  CookieConsent.run({
    guiOptions: {
      consentModal: {
        layout: 'bar inline',
        position: 'bottom',
        equalWeightButtons: true,
        flipButtons: false
      },
      preferencesModal: {
        layout: 'box',
        equalWeightButtons: true
      }
    },
    categories: {
      necessary: {
        enabled: true,
        readOnly: true
      },
      ads: {}
    },
    language: {
      default: lang,
      rtl: [],
      translations
    },
    onConsent: applyAds,
    onChange: applyAds
  }).then(function () {
    const root = document.getElementById('cc-main');
    if (root)
      document.body.prepend(root);
    if (document.documentElement.classList.contains('show--consent'))
      window.scrollTo(0, 0);
  });
  if (typeof window.changeLanguage === 'function') {
    const orig = window.changeLanguage;
    window.changeLanguage = function (l) {
      const r = orig.apply(this, arguments);
      if (T[l])
        CookieConsent.setLanguage(l);
      return r;
    };
  }
}());