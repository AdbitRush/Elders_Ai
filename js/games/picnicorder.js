/* Picnic Order — js/games/picnicorder.js
   Study picnic items in order, press Ready (no timer), then pick them in the same order.
   No dependencies, network, storage, timers, or document-level listeners. */
(function () {
  'use strict';
  var ID = 'picnicorder', ROUNDS = 3, WIN_AT = 2; // WIN_AT: rounds needed for win=true (host decision)

  var SVG_OPEN = '<svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">';

  // Original line drawings; shapes differ by outline, so colour is never needed.
  var ITEMS = [
    { id: 'basket', svg: '<path d="M8 22h32l-4 18H12z"/><path d="M14 22c0-14 20-14 20 0"/><path d="M18 22l2 18M30 22l-2 18M10 31h28"/>',
      n: { he: 'סל', en: 'Basket', es: 'Cesta', fr: 'Panier', de: 'Korb', el: 'Καλάθι' } },
    { id: 'apple', svg: '<path d="M24 16c-7-5-15 0-14 10 1 9 8 16 14 12 6 4 13-3 14-12 1-10-7-15-14-10z"/><path d="M24 16c0-4 1-7 3-9"/><path d="M27 10c3-4 8-3 9-2-2 4-6 5-9 2z"/>',
      n: { he: 'תפוח', en: 'Apple', es: 'Manzana', fr: 'Pomme', de: 'Apfel', el: 'Μήλο' } },
    { id: 'sandwich', svg: '<path d="M6 38L24 8l18 30z"/><path d="M12 28h24M9 33h30"/>',
      n: { he: 'כריך', en: 'Sandwich', es: 'Sándwich', fr: 'Sandwich', de: 'Sandwich', el: 'Σάντουιτς' } },
    { id: 'bottle', svg: '<path d="M20 4h8v8c4 3 6 6 6 11v19H14V23c0-5 2-8 6-11z"/><path d="M14 28h20M20 8h8"/>',
      n: { he: 'בקבוק', en: 'Bottle', es: 'Botella', fr: 'Bouteille', de: 'Flasche', el: 'Μπουκάλι' } },
    { id: 'mug', svg: '<path d="M10 16h22v20a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z"/><path d="M32 21h4a5 5 0 0 1 0 10h-4"/><path d="M17 4c-2 3 2 4 0 7M25 4c-2 3 2 4 0 7"/>',
      n: { he: 'ספל', en: 'Mug', es: 'Taza', fr: 'Tasse', de: 'Tasse', el: 'Κούπα' } },
    { id: 'blanket', svg: '<rect x="6" y="10" width="36" height="28" rx="2"/><path d="M18 10v28M30 10v28M6 19h36M6 29h36"/>',
      n: { he: 'שמיכה', en: 'Blanket', es: 'Manta', fr: 'Couverture', de: 'Decke', el: 'Κουβέρτα' } },
    { id: 'cheese', svg: '<path d="M4 26L36 12l8 14v12H4z"/><path d="M4 26h40"/><circle cx="14" cy="32" r="2.5"/><circle cx="27" cy="33" r="2"/><circle cx="37" cy="31" r="1.5"/>',
      n: { he: 'גבינה', en: 'Cheese', es: 'Queso', fr: 'Fromage', de: 'Käse', el: 'Τυρί' } },
    { id: 'grapes', svg: '<circle cx="14" cy="20" r="5"/><circle cx="24" cy="20" r="5"/><circle cx="34" cy="20" r="5"/><circle cx="19" cy="29" r="5"/><circle cx="29" cy="29" r="5"/><circle cx="24" cy="38" r="5"/><path d="M24 15V6M24 9c3-4 8-3 10-1"/>',
      n: { he: 'ענבים', en: 'Grapes', es: 'Uvas', fr: 'Raisin', de: 'Trauben', el: 'Σταφύλια' } }
  ];

  var TXT = {
    en: { title: 'Picnic Order', round: 'Round {n} of 3', study: 'Look at the order. Take as long as you like.', ready: 'Ready',
      recall: 'Pick the items in the order you saw.', yours: 'Your order', undo: 'Undo', check: 'Check', show: 'Show answer',

      again: 'Try again', next: 'Next round', finish: 'See result', right: 'Correct order!', wrong: '{k} of {n} in the right place.',
      seq: 'The correct order', shown: 'Answer shown. This round is not counted as correct.',
      practice: 'Practice. This round is already scored.', result: '{c} of 3 rounds in the correct order.',
      ok: 'right place', no: 'wrong place' },
    he: { title: 'סדר הפיקניק', round: 'סיבוב {n} מתוך 3', study: 'התבוננו בסדר. קחו את הזמן.', ready: 'מוכנים',
      recall: 'בחרו את הפריטים לפי הסדר שראיתם.', yours: 'הסדר שלכם', undo: 'ביטול', check: 'בדיקה', show: 'הצגת התשובה',
      again: 'נסו שוב', next: 'הסיבוב הבא', finish: 'לתוצאה', right: 'הסדר נכון!', wrong: '{k} מתוך {n} במקום הנכון.',
      seq: 'הסדר הנכון', shown: 'התשובה הוצגה. הסיבוב הזה לא נספר כנכון.',
      practice: 'תרגול. הסיבוב הזה כבר נספר.', result: '{c} מתוך 3 סיבובים בסדר הנכון.',
      ok: 'במקום הנכון', no: 'לא במקום הנכון' },
    es: { title: 'Orden de pícnic', round: 'Ronda {n} de 3', study: 'Mire el orden. Tómese el tiempo que quiera.', ready: 'Listo',
      recall: 'Elija los objetos en el orden que vio.', yours: 'Su orden', undo: 'Deshacer', check: 'Comprobar', show: 'Mostrar respuesta',
      again: 'Intentar de nuevo', next: 'Siguiente ronda', finish: 'Ver resultado', right: '¡Orden correcto!', wrong: '{k} de {n} en el lugar correcto.',
      seq: 'El orden correcto', shown: 'Respuesta mostrada. Esta ronda no cuenta como correcta.',
      practice: 'Práctica. Esta ronda ya está puntuada.', result: '{c} de 3 rondas en el orden correcto.',
      ok: 'lugar correcto', no: 'lugar incorrecto' },
    fr: { title: 'L’ordre du pique-nique', round: 'Manche {n} sur 3', study: 'Regardez l’ordre. Prenez tout votre temps.', ready: 'Prêt',
      recall: 'Choisissez les objets dans l’ordre que vous avez vu.', yours: 'Votre ordre', undo: 'Annuler', check: 'Vérifier', show: 'Voir la réponse',
      again: 'Réessayer', next: 'Manche suivante', finish: 'Voir le résultat', right: 'Ordre correct !', wrong: '{k} sur {n} à la bonne place.',
      seq: 'L’ordre correct', shown: 'Réponse affichée. Cette manche ne compte pas comme réussie.',
      practice: 'Entraînement. Cette manche est déjà comptée.', result: '{c} manches sur 3 dans le bon ordre.',
      ok: 'bonne place', no: 'mauvaise place' },
    de: { title: 'Picknick-Reihenfolge', round: 'Runde {n} von 3', study: 'Sehen Sie sich die Reihenfolge an. Lassen Sie sich Zeit.', ready: 'Bereit',
      recall: 'Wählen Sie die Dinge in der gesehenen Reihenfolge.', yours: 'Ihre Reihenfolge', undo: 'Rückgängig', check: 'Prüfen', show: 'Lösung zeigen',
      again: 'Noch einmal', next: 'Nächste Runde', finish: 'Ergebnis ansehen', right: 'Richtige Reihenfolge!', wrong: '{k} von {n} an der richtigen Stelle.',
      seq: 'Die richtige Reihenfolge', shown: 'Lösung gezeigt. Diese Runde zählt nicht als richtig.',
      practice: 'Übung. Diese Runde ist bereits gewertet.', result: '{c} von 3 Runden in der richtigen Reihenfolge.',
      ok: 'richtige Stelle', no: 'falsche Stelle' },
    el: { title: 'Η σειρά του πικνίκ', round: 'Γύρος {n} από 3', study: 'Δείτε τη σειρά. Πάρτε όσο χρόνο θέλετε.', ready: 'Έτοιμοι',
      recall: 'Επιλέξτε τα αντικείμενα με τη σειρά που είδατε.', yours: 'Η σειρά σας', undo: 'Αναίρεση', check: 'Έλεγχος', show: 'Εμφάνιση απάντησης',
      again: 'Ξανά', next: 'Επόμενος γύρος', finish: 'Δείτε το αποτέλεσμα', right: 'Σωστή σειρά!', wrong: '{k} από {n} στη σωστή θέση.',
      seq: 'Η σωστή σειρά', shown: 'Η απάντηση εμφανίστηκε. Ο γύρος δεν μετρά ως σωστός.',

      practice: 'Εξάσκηση. Ο γύρος έχει ήδη βαθμολογηθεί.', result: '{c} από 3 γύρους με τη σωστή σειρά.',
      ok: 'σωστή θέση', no: 'λάθος θέση' }
  };

  // Colours inherit from the host and all strokes use currentColor, so light and dark themes keep the host's contrast.
  var CSS = [
    '.po-root{font-size:18px;line-height:1.4;color:inherit;width:100%;max-width:720px;margin:0 auto;padding:8px;box-sizing:border-box}',
    '.po-root *{box-sizing:border-box}',
    '.po-h{font-size:24px;margin:0 0 4px}',
    '.po-sub{font-size:18px;margin:6px 0}',
    '.po-strong,.po-msg{font-weight:700}',
    '.po-msg{font-size:20px;margin:6px 0;min-height:28px}',
    '.po-list{list-style:none;margin:10px 0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px}',
    '.po-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:112px;width:100%;padding:8px;border:2px solid currentColor;border-radius:12px;background:transparent;color:inherit;font:inherit;font-size:18px;text-align:center}',
    'button.po-card{cursor:pointer}',
    '.po-num{font-size:20px;font-weight:700}',
    '.po-lab,.po-mark{font-size:18px;overflow-wrap:anywhere}',
    '.po-mark{font-weight:700}',
    '.po-empty{border-style:dashed}',
    '.po-row{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}',
    '.po-btn{min-height:48px;min-width:48px;padding:10px 18px;border:2px solid currentColor;border-radius:12px;background:transparent;color:inherit;font:inherit;font-size:18px;font-weight:700;cursor:pointer}',
    '.po-main{border-width:4px}',
    '.po-root [aria-disabled="true"]{opacity:.55;border-style:dashed;cursor:default}',
    '.po-root button:focus-visible{outline:3px solid currentColor;outline-offset:3px}',
    '@media (prefers-reduced-motion:reduce){.po-root *{animation:none!important;transition:none!important}}'
  ].join('');

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), x = a[i];
      a[i] = a[j]; a[j] = x;

    }
    return a;
  }
  function fill(s, o) {
    return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? String(o[k]) : m; });
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function host() { return (typeof gameState !== 'undefined' && gameState) ? gameState : null; }

  function initPicnicOrder(container) {
    if (!container) return;
    var lang = (typeof currentLang === 'string' && TXT[currentLang]) ? currentLang : 'en';
    var t = TXT[lang];
    var gs0 = host();
    var level = (gs0 && gs0[ID] && Number(gs0[ID].level)) || 1;

    var round = 0, correct = 0, seq = [], choices = [], picks = [];
    var phase = 'study', scored = false, lastK = 0, finished = false;

    container.textContent = '';
    var root = el('div', 'po-root');
    root.dir = lang === 'he' ? 'rtl' : 'ltr';
    root.lang = lang;
    var head = el('h2', 'po-h', t.title);
    head.tabIndex = -1;
    var live = el('p', 'po-msg');            // persistent live region: instructions and feedback
    live.setAttribute('aria-live', 'polite');

    var view = el('div');
    root.appendChild(el('style', null, CSS));
    root.appendChild(head);
    root.appendChild(live);
    root.appendChild(view);
    container.appendChild(root);

    // Every handler checks this, so nothing runs after exit or after a re-init in the same container.
    function alive() {
      var gs = host();
      return root.parentNode === container && container.isConnected &&
        (!gs || (gs.active && gs.currentId === ID));
    }

    function wire(b, key, fn, off) {
      b.type = 'button';
      b.setAttribute('data-k', key);
      if (off) b.setAttribute('aria-disabled', 'true'); // stays focusable so keyboard focus is never lost
      b.addEventListener('click', function () {
        if (!alive() || finished || b.getAttribute('aria-disabled') === 'true') return;
        fn();
      });
    }
    function btn(label, key, fn, off, main) {
      var b = el('button', 'po-btn' + (main ? ' po-main' : ''), label);
      wire(b, key, fn, off);
      return b;
    }
    function card(tag, item, num, mark) {
      var c = el(tag, 'po-card');
      if (num) c.appendChild(el('span', 'po-num', String(num)));
      var pic = el('span', 'po-pic');

      pic.innerHTML = SVG_OPEN + item.svg + '</svg>'; // static markup defined above
      c.appendChild(pic);
      c.appendChild(el('span', 'po-lab', item.n[lang]));
      if (mark === true) c.appendChild(el('span', 'po-mark', '\u2713 ' + t.ok));
      if (mark === false) c.appendChild(el('span', 'po-mark', '\u2717 ' + t.no));
      return c;
    }
    function orderedList(items, withMarks) {
      var ol = el('ol', 'po-list');
      for (var i = 0; i < seq.length; i++) {
        if (items[i]) {
          ol.appendChild(card('li', items[i], i + 1, withMarks ? items[i] === seq[i] : undefined));
        } else {
          var empty = el('li', 'po-card po-empty');
          empty.appendChild(el('span', 'po-num', String(i + 1)));
          empty.appendChild(el('span', 'po-lab', '\u2014'));
          ol.appendChild(empty);
        }
      }
      return ol;
    }

    function render(focusKey) {
      view.textContent = '';
      if (phase === 'done') {
        live.textContent = fill(t.result, { c: correct });
        head.focus();
        return;
      }
      view.appendChild(el('p', 'po-sub', fill(t.round, { n: round + 1 })));
      var row = el('div', 'po-row');


      if (phase === 'study') {
        live.textContent = t.study;
        if (scored) view.appendChild(el('p', 'po-sub', t.practice));
        view.appendChild(orderedList(seq, false));
        row.appendChild(btn(t.ready, 'ready', ready, false, true));
      } else if (phase === 'recall') {
        live.textContent = t.recall;
        if (scored) view.appendChild(el('p', 'po-sub', t.practice));
        view.appendChild(el('p', 'po-sub po-strong', t.yours));
        view.appendChild(orderedList(picks, false));
        var grid = el('div', 'po-list');
        choices.forEach(function (item) {
          var pos = picks.indexOf(item) + 1;
          var b = card('button', item, pos || null);
          wire(b, 'c-' + item.id, function () { pick(item); }, pos > 0);
          grid.appendChild(b);
        });
        view.appendChild(grid);
        row.appendChild(btn(t.undo, 'undo', undo, picks.length === 0));
        row.appendChild(btn(t.check, 'check', check, picks.length < seq.length, true));
        row.appendChild(btn(t.show, 'show', showAnswer, false));
      } else { // 'checked' or 'shown'
        if (phase === 'checked') {
          live.textContent = lastK === seq.length ? t.right : fill(t.wrong, { k: lastK, n: seq.length });
          view.appendChild(el('p', 'po-sub po-strong', t.yours));
          view.appendChild(orderedList(picks, true));
        } else {
          live.textContent = t.shown;
        }
        view.appendChild(el('p', 'po-sub po-strong', t.seq));
        view.appendChild(orderedList(seq, false));
        row.appendChild(btn(round + 1 < ROUNDS ? t.next : t.finish, 'next', next, false, true));

        row.appendChild(btn(t.again, 'again', again, false));
      }
      view.appendChild(row);
      var target = focusKey && view.querySelector('[data-k="' + focusKey + '"]');
      (target || head).focus();
    }

    function newRound() {
      var len = Math.max(3, Math.min(6, 3 + round + Math.floor((level - 1) / 2)));
      seq = shuffle(ITEMS).slice(0, len);
      var tries = 0;
      do { choices = shuffle(seq); }
      while (tries++ < 10 && choices.every(function (c, i) { return c === seq[i]; }));
      picks = []; scored = false; lastK = 0; phase = 'study';
      render('ready');
    }
    function ready() {
      if (phase !== 'study') return;
      phase = 'recall';
      render('c-' + choices[0].id);
    }
    function pick(item) {
      if (phase !== 'recall' || picks.indexOf(item) >= 0 || picks.length >= seq.length) return;
      picks.push(item);
      render(picks.length === seq.length ? 'check' : 'c-' + item.id);
    }
    function undo() {
      if (phase !== 'recall' || !picks.length) return;
      var item = picks.pop();
      render('c-' + item.id);
    }
    function check() {

      if (phase !== 'recall' || picks.length < seq.length) return;
      lastK = 0;
      for (var i = 0; i < seq.length; i++) if (picks[i] === seq[i]) lastK++;
      if (!scored) {                 // only the first outcome of a round is ever scored
        scored = true;
        if (lastK === seq.length) correct++;
      }
      phase = 'checked';
      render('next');
    }
    function showAnswer() {
      if (phase !== 'recall') return;
      scored = true;                 // answer seen: this round can no longer count as correct
      phase = 'shown';
      render('next');
    }
    function again() {
      if (phase !== 'checked' && phase !== 'shown') return;
      picks = []; phase = 'study';   // same sequence, practice only (scored stays true)
      render('ready');
    }
    function next() {
      if (phase !== 'checked' && phase !== 'shown') return;
      round++;
      if (round < ROUNDS) { newRound(); return; }
      if (finished) return;
      finished = true;
      phase = 'done';
      render();
      if (typeof GameKit !== 'undefined' && GameKit && typeof GameKit.finish === 'function') {
        GameKit.finish(ID, correct >= WIN_AT, fill(t.result, { c: correct }));
      }

    }

    newRound();
  }

  window.initPicnicOrder = initPicnicOrder;
})();