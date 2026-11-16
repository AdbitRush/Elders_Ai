(function () {
    if (typeof i18nData === 'undefined')
        return;
    const C = {};
    for (const [lang, pools] of Object.entries(C)) {
        if (i18nData[lang])
            Object.assign(i18nData[lang], pools);
    }
    const POOL_KEYS = [
        'ws_pool',
        'unscramble_pool',
        'hangman_pool',
        'proverbs_pool',
        'trivia_pool',
        'pairs_pool',
        'tf_pool',
        'recall_pool',
        'flags_pool'
    ];
    for (const lang of Object.keys(i18nData)) {
        for (const k of POOL_KEYS) {
            if (!i18nData[lang][k] && i18nData.en && i18nData.en[k])
                i18nData[lang][k] = i18nData.en[k];
        }
    }
    const SIM = {
        en: {
            game_lifesim_title: 'Time Journey',
            game_lifesim_desc: 'Seniors play young, youngsters play grandma.',
            inst_lifesim: 'Pick an era, make choices, collect memories \u2764',
            game_safari_title: 'Living Safari',
            game_safari_desc: 'Animals roam the savanna \u2014 spot them!',
            inst_safari: 'Read the task and tap the right animal as it moves'
        }
    };
    for (const [lang, kv] of Object.entries(SIM)) {
        if (i18nData[lang])
            Object.assign(i18nData[lang], kv);
    }
    const UI = {};
    for (const [lang, kv] of Object.entries(UI)) {
        if (i18nData[lang])
            Object.assign(i18nData[lang], kv);
    }
    const FOOT = {
        en: {
            new_best: 'New personal best!',
            about_link: 'About',
            articles_link: 'Articles',
            privacy_link: 'Privacy',
            cookie_settings: 'Cookie settings'
        }
    };
    for (const [lang, kv] of Object.entries(FOOT)) {
        if (i18nData[lang])
            Object.assign(i18nData[lang], kv);
    }
    const HE_GAME_HEADERS = {};
    ;
    for (const g of window.NEW_GAMES || []) {
        for (const lang of Object.keys(i18nData)) {
            const L = i18nData[lang];
            if (!L['game_' + g.id + '_title'])
                L['game_' + g.id + '_title'] = g.title;
            if (!L['game_' + g.id + '_desc'])
                L['game_' + g.id + '_desc'] = g.desc;
            if (!L['inst_' + g.id])
                L['inst_' + g.id] = g.inst;
        }
    }
    for (const sec of window.NEW_GAME_SECTIONS || [])
        for (const lang of Object.keys(i18nData)) {
            const L = i18nData[lang];
            if (!L['sec_' + sec.key + '_title'])
                L['sec_' + sec.key + '_title'] = sec.title;
            if (!L['sec_' + sec.key + '_sub'])
                L['sec_' + sec.key + '_sub'] = sec.sub;
        }
    if (typeof currentLang !== 'undefined' && i18nData[currentLang]) {
        const L = i18nData[currentLang], n = (window.GAME_IDS || []).length;
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            const k = el.getAttribute('data-i18n');
            if (L[k])
                el.innerText = String(L[k]).replace('{n}', n);
        });
    }
}());