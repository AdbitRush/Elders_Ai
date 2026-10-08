/* BrainPlay PREVIEW review tool (preview build only, never main; adapted from the AllyFind one):
   T1 notes per design section, saved to the VPS via POST /__review/notes (notes.json); T2 palette variants, remembered;
   layout options (review round 1): each sets html[data-v-<group>], which the preview build's site code and fh.css read. */
(function () {
  'use strict';
  var API = '/__review/notes';
  var PALETTES = [
    { id: '', name: 'Honey (as designed)', sw: ['#f6b545', '#b45309', '#2a1a0c'] },
    { id: 'garden', name: 'Garden green', sw: ['#7fd18b', '#2f7d32', '#141a10'] },
    { id: 'sea', name: 'Sea blue', sw: ['#5fd0d6', '#0e7490', '#0e171b'] }
  ];
  // First option of each group = the site's default when nothing is chosen (preview-only CSS in review.css).
  var VARIANTS = [
    { id: 'qcolor', name: 'Answer buttons in quiz games', opts: [['warm', 'Four warm colours'], ['plain', 'One calm colour']] },
    { id: 'photo', name: 'Photo header inside a game', opts: [['tall', 'Tall photo'], ['slim', 'Slim photo strip'], ['off', 'No photo (plain band)']] }
  ];
  var SECTIONS = [
    { id: 'header', name: 'Header & buttons', sel: 'nav' },
    { id: 'hub', name: 'Home page (hero, why train)', sel: '#hero' },
    { id: 'cards', name: 'Game cards', sel: '#homeScreen' },
    { id: 'allgames', name: 'All games list', sel: '#all-games' },
    { id: 'game', name: 'Inside a game', sel: '#gameView' },
    { id: 'win', name: 'End-of-game screen', sel: '#modal' },
    { id: 'ads', name: 'Ad / message bar', sel: '#adBar' },
    { id: 'footer', name: 'Footer', sel: 'footer' },
    { id: 'options', name: 'Layout options (which ones you prefer)', sel: '' },
    { id: 'general', name: 'General notes', sel: '' }
  ];
  var root = document.documentElement;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) { return null; } }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function palette() { return root.getAttribute('data-palette') || ''; }
  function palName(id) { for (var i = 0; i < PALETTES.length; i++) if (PALETTES[i].id === id) return PALETTES[i].name; return PALETTES[0].name; }
  function hhmm(iso) { var d = iso ? new Date(iso) : new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }

  function getVariants() { try { return JSON.parse(store('afr-v') || '{}') || {}; } catch (e) { return {}; } }
  function variantsText() {
    var v = getVariants();
    return VARIANTS.map(function (g) { return g.id + '=' + (v[g.id] || g.opts[0][0]); }).join(' ');
  }
  function setVariant(gid, val) {
    var v = getVariants();
    v[gid] = val; store('afr-v', JSON.stringify(v));
    root.setAttribute('data-v-' + gid, val);

    syncLayoutMenu();
  }
  function syncLayoutMenu() {
    var v = getVariants();
    [].forEach.call(lmenu.querySelectorAll('.afr-opt'), function (b) {
      var g = b.getAttribute('data-g'), cur = v[g] || b.getAttribute('data-def');
      b.classList.toggle('on', b.getAttribute('data-id') === cur);
      b.setAttribute('aria-checked', b.getAttribute('data-id') === cur ? 'true' : 'false');
    });
  }

  function setPalette(id) {
    if (id) root.setAttribute('data-palette', id); else root.removeAttribute('data-palette');
    store('afr-palette', id || '');
    palLabel.textContent = palName(id);
    [].forEach.call(menu.querySelectorAll('.afr-opt'), function (b) { b.classList.toggle('on', b.getAttribute('data-id') === id); });
  }

  /* toolbar */
  var bar = el('div', 'afr-bar');
  var tag = el('span', 'afr-tag', 'Preview');
  var palBtn = el('button', 'afr-btn afr-light');
  palBtn.type = 'button'; palBtn.setAttribute('aria-haspopup', 'true');
  palBtn.appendChild(document.createTextNode('🎨 '));
  var palLabel = el('span', 'afr-long', '');
  palBtn.appendChild(palLabel);
  var layBtn = el('button', 'afr-btn afr-light', '🧩 Layout');
  layBtn.type = 'button'; layBtn.setAttribute('aria-haspopup', 'true');
  var notesBtn = el('button', 'afr-btn', '📝 Notes');
  notesBtn.type = 'button';
  var minBtn = el('button', 'afr-btn afr-min', '–'); minBtn.type = 'button';
  minBtn.setAttribute('aria-label', 'Hide the review toolbar'); minBtn.title = 'Hide the review toolbar (tap PREVIEW to bring it back)';
  bar.appendChild(tag); bar.appendChild(palBtn); bar.appendChild(layBtn); bar.appendChild(notesBtn); bar.appendChild(minBtn);
  function setMin(on) { bar.classList.toggle('afr-mini', on); store('afr-min', on ? '1' : ''); }
  minBtn.addEventListener('click', function () { setMin(true); menu.hidden = true; lmenu.hidden = true; });
  tag.addEventListener('click', function () { if (bar.classList.contains('afr-mini')) setMin(false); });

  /* layout options menu */
  var lmenu = el('div', 'afr-menu afr-lmenu'); lmenu.hidden = true; lmenu.setAttribute('role', 'menu');
  VARIANTS.forEach(function (g) {
    lmenu.appendChild(el('div', 'afr-gh', g.name));
    g.opts.forEach(function (o) {
      var b = el('button', 'afr-opt', o[1]); b.type = 'button'; b.setAttribute('role', 'menuitemradio');
      b.setAttribute('data-g', g.id); b.setAttribute('data-id', o[0]); b.setAttribute('data-def', g.opts[0][0]);
      b.addEventListener('click', function () { setVariant(g.id, o[0]); });
      lmenu.appendChild(b);
    });
  });
  layBtn.addEventListener('click', function (e) { e.stopPropagation(); menu.hidden = true; lmenu.hidden = !lmenu.hidden; });
  document.addEventListener('click', function (e) { if (!lmenu.hidden && !lmenu.contains(e.target) && e.target !== layBtn) lmenu.hidden = true; });

  /* palette menu */
  var menu = el('div', 'afr-menu'); menu.hidden = true; menu.setAttribute('role', 'menu');
  PALETTES.forEach(function (p) {
    var b = el('button', 'afr-opt'); b.type = 'button'; b.setAttribute('data-id', p.id); b.setAttribute('role', 'menuitem');
    var sw = el('span', 'afr-sw');
    p.sw.forEach(function (c) { var i = el('i'); i.style.background = c; sw.appendChild(i); });
    b.appendChild(sw); b.appendChild(el('span', '', p.name));
    b.addEventListener('click', function () { setPalette(p.id); menu.hidden = true; });
    menu.appendChild(b);
  });
  palBtn.addEventListener('click', function (e) { e.stopPropagation(); lmenu.hidden = true; menu.hidden = !menu.hidden; });
  document.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target)) menu.hidden = true; });

  /* notes drawer */
  var drawer = el('div', 'afr-drawer'); drawer.setAttribute('role', 'dialog'); drawer.hidden = true; drawer.setAttribute('aria-label', 'Design review notes');
  var head = el('div', 'afr-head');
  var ht = el('div'); ht.appendChild(el('b', '', 'Design review notes'));
  var build = document.querySelector('meta[name="afr-build"]');
  ht.appendChild(el('small', '', 'Saved to the VPS. Each save records the page, palette, layout options, theme and screen width.' + (build ? ' Build ' + build.content : '')));
  var x = el('button', 'afr-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close notes');
  head.appendChild(ht); head.appendChild(x);
  var list = el('div', 'afr-list');
  drawer.appendChild(head); drawer.appendChild(list);
  var fields = {};

  function flash(sel) {
    var t = sel && document.querySelector(sel);
    if (!t) return false;
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    t.classList.add('afr-flash');
    setTimeout(function () { t.classList.remove('afr-flash'); }, 2200);
    return true;
  }
  function show(s) {
    if (window.innerWidth < 760) drawer.hidden = true;
    if (s.id === 'game' && !root.classList.contains('in-game') && window.loadGame) { window.loadGame('trivia'); return; }
    if (s.id === 'win' && window.levelComplete && root.classList.contains('in-game')) { window.levelComplete(); return; }
    flash(s.sel);
  }

  function status(f, cls, text) { f.st.className = 'afr-st' + (cls ? ' ' + cls : ''); f.st.textContent = text; }

  function save(id) {
    var f = fields[id];
    f.btn.disabled = true; status(f, '', 'Saving…');
    var body = {
      section: id, text: f.ta.value, page: location.pathname + location.search,
      palette: palName(palette()), theme: root.classList.contains('dark') ? 'dark' : 'light',
      lang: root.lang || '', viewport: window.innerWidth + 'x' + window.innerHeight, variants: variantsText()
    };
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || r.status); return j; }); })
      .then(function (j) { f.saved = body.text; status(f, 'ok', '✓ Saved ' + hhmm(j.saved_at)); })
      .catch(function (e) { status(f, 'err', '✗ Not saved (' + e.message + ') - try again'); })
      .then(function () { f.btn.disabled = false; });
  }

  SECTIONS.forEach(function (s) {
    var box = el('div', 'afr-sec');
    var sh = el('div', 'afr-sh'); sh.appendChild(el('b', '', s.name));
    if (s.sel) {
      var sb = el('button', 'afr-show', 'Show me'); sb.type = 'button';
      sb.addEventListener('click', function () { show(s); });
      sh.appendChild(sb);
    }
    var ta = el('textarea'); ta.maxLength = 5000; ta.placeholder = 'What should change in the ' + s.name.toLowerCase() + '?';
    ta.setAttribute('aria-label', s.name + ' notes');
    var row = el('div', 'afr-row');
    var btn = el('button', 'afr-save', 'Save'); btn.type = 'button';
    var st = el('span', 'afr-st', '');
    row.appendChild(btn); row.appendChild(st);
    box.appendChild(sh); box.appendChild(ta); box.appendChild(row);
    list.appendChild(box);
    var f = fields[s.id] = { ta: ta, btn: btn, st: st, saved: '' };
    btn.addEventListener('click', function () { save(s.id); });
    ta.addEventListener('input', function () { if (ta.value !== f.saved) status(f, 'dirty', 'Unsaved changes'); else status(f, 'ok', '✓ Saved'); });
    ta.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') save(s.id); });
  });

  function loadNotes() {
    fetch(API, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      Object.keys(j.notes || {}).forEach(function (k) {
        var f = fields[k], n = j.notes[k];
        if (!f || f.ta.value !== f.saved) return; // never clobber an unsaved edit
        f.ta.value = f.saved = n.text || '';
        status(f, 'ok', '✓ Saved ' + hhmm(n.saved_at));
      });
    }).catch(function () {});
  }
  function openNotes() { drawer.hidden = false; menu.hidden = true; loadNotes(); }
  notesBtn.addEventListener('click', function () { if (drawer.hidden) openNotes(); else drawer.hidden = true; });
  x.addEventListener('click', function () { drawer.hidden = true; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { menu.hidden = true; lmenu.hidden = true; } });
  window.addEventListener('beforeunload', function (e) {
    for (var k in fields) if (fields[k].ta.value !== fields[k].saved) { e.preventDefault(); e.returnValue = ''; return ''; }
  });

  function mount() {
    document.body.appendChild(bar); document.body.appendChild(menu); document.body.appendChild(lmenu); document.body.appendChild(drawer);
    setPalette(palette());
    var v = getVariants();
    Object.keys(v).forEach(function (k) { root.setAttribute('data-v-' + k, v[k]); });
    syncLayoutMenu();
    if (store('afr-min')) setMin(true);
    window.dispatchEvent(new Event('fh-variants'));
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
