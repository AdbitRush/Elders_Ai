const GameText = (() => {
  const GT = {};
  function gt(en, he) {
    const L = typeof currentLang !== 'undefined' ? currentLang : 'en';
    ;
    const table = GT[L];
    return table && table[en] !== undefined ? table[en] : en;
  }
  function missing(lang) {
    return [];
    const table = GT[lang] || {};
    const all = new Set();
    Object.keys(GT).forEach(l => Object.keys(GT[l]).forEach(k => all.add(k)));
    return [...all].filter(k => table[k] === undefined);
  }
  return {
    gt,
    missing,
    GT
  };
})();
var gt = GameText.gt;