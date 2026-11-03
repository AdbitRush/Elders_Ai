// ═══════════════════════════════════════════════════════════════════════════════
// CRYPTOQUOTE (2026-10, wave 2) — the newspaper-puzzle classic: a famous quote in a letter-swap code.
// Every letter stands for another one (never itself); the same code letter is always the same real letter.
// Tap a code letter, then type the real one (big keyboard or a real one). A few letters are given to start.
// The speaker is shown in plain words as the clue. One quote per day (Level 2+ = a different one).
// Quotes: well-documented words of their speakers or from the named film / document.
// ═══════════════════════════════════════════════════════════════════════════════
const CQ_QUOTES = [
  ['The only thing we have to fear is fear itself.', 'Franklin D. Roosevelt, first inaugural address, 1933'],
  ['Ask not what your country can do for you; ask what you can do for your country.', 'John F. Kennedy, inaugural address, 1961'],
  ["That's one small step for man, one giant leap for mankind.", 'Neil Armstrong, on the Moon, 1969'],
  ['Injustice anywhere is a threat to justice everywhere.', 'Martin Luther King Jr., Letter from Birmingham Jail, 1963'],
  ['Float like a butterfly, sting like a bee.', 'Muhammad Ali, 1964'],
  ["It ain't over till it's over.", 'Yogi Berra, 1973'],
  ['Mr. Gorbachev, tear down this wall!', 'Ronald Reagan, Berlin, 1987'],
  ['Give me liberty, or give me death!', 'Patrick Henry, 1775'],
  ['Speak softly and carry a big stick.', 'Theodore Roosevelt'],
  ['A house divided against itself cannot stand.', 'Abraham Lincoln, 1858'],
  ["There's no place like home.", 'Dorothy, The Wizard of Oz, 1939'],
  ["Here's looking at you, kid.", 'Rick, Casablanca, 1942'],
  ['Go ahead, make my day.', 'Harry Callahan, Sudden Impact, 1983'],
  ['May the Force be with you.', 'Star Wars, 1977'],
  ["You're gonna need a bigger boat.", 'Chief Brody, Jaws, 1975'],
  ['Early to bed and early to rise, makes a man healthy, wealthy, and wise.', "Benjamin Franklin, Poor Richard's Almanack"],
  ['Well done is better than well said.', "Benjamin Franklin, Poor Richard's Almanack"],
  ['In this world nothing can be said to be certain, except death and taxes.', 'Benjamin Franklin, letter of 1789'],
  ['Imagination is more important than knowledge.', 'Albert Einstein, 1929'],
  ['Not all those who wander are lost.', 'J. R. R. Tolkien, The Fellowship of the Ring'],
  ['Hope is the thing with feathers that perches in the soul.', 'Emily Dickinson'],
  ['I took the one less traveled by, and that has made all the difference.', 'Robert Frost, The Road Not Taken'],
  ['The buck stops here.', "Sign on Harry S. Truman's desk"],
  ['We hold these truths to be self-evident, that all men are created equal.', 'Declaration of Independence, 1776'],
];
function _cqRng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function initCryptoquote(container) {
    const gs = gameState.cryptoquote;
    const d = new Date(), day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
    const rnd = _cqRng(day * 97 + (gs.level || 1) * 131);
    const [text, who] = CQ_QUOTES[(day + (gs.level || 1) - 1) % CQ_QUOTES.length];
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let key;   // a derangement: no letter codes to itself
    do { key = A.slice(); for (let i = key.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [key[i], key[j]] = [key[j], key[i]]; } } while (key.some((k, i) => k === A[i]));
    const enc = {}; A.forEach((a, i) => { enc[a] = key[i]; });
    gs.text = text.toUpperCase(); gs.who = who; gs.enc = enc;
    gs.dec = {}; A.forEach((a) => { gs.dec[enc[a]] = a; });            // code -> plain (the answer)
    gs.guess = {}; gs.over = false; gs.msg = ''; gs.hints = 0;
    const used = [...new Set(gs.text.replace(/[^A-Z]/g, ''))];
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    const give = diff === 'easy' ? 4 : diff === 'hard' ? 1 : 2;
    // give the most frequent letters of the quote
    const freq = {}; gs.text.replace(/[^A-Z]/g, '').split('').forEach((ch) => { freq[ch] = (freq[ch] || 0) + 1; });
    used.sort((a, b) => freq[b] - freq[a]).slice(0, give).forEach((p) => { gs.guess[enc[p]] = p; });
    gs.given = Object.keys(gs.guess);
    gs.sel = enc[used.find((p) => !gs.guess[enc[p]])];
    const onKey = (e) => {
        if (gameState.currentId !== 'cryptoquote' || gs.over || e.ctrlKey || e.metaKey || e.altKey) return;
        if (/^[a-z]$/i.test(e.key)) { cqKey(e.key.toUpperCase()); e.preventDefault(); }
        else if (e.key === 'Backspace' || e.key === 'Delete') { cqKey('⌫'); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    window._gameCleanup = () => document.removeEventListener('keydown', onKey);
    _cqRender();
}
function cqSel(c) { const gs = gameState.cryptoquote; if (gs.over || gs.given.includes(c)) return; gs.sel = c; gs.msg = ''; _cqRender(); }
function cqKey(k) {
    const gs = gameState.cryptoquote; if (gs.over || !gs.sel) return;
    if (k === '⌫') { delete gs.guess[gs.sel]; return _cqRender(); }
    // one plain letter can stand for only one code letter: move it here
    Object.keys(gs.guess).forEach((c) => { if (gs.guess[c] === k && !gs.given.includes(c)) delete gs.guess[c]; });
    if (gs.given.some((c) => gs.guess[c] === k)) { gs.msg = `${k} is already given.`; return _cqRender(); }
    gs.guess[gs.sel] = k; if (typeof sfxClick === 'function') sfxClick();
    // next code letter still empty, in reading order
    const order = [...new Set(gs.text.replace(/[^A-Z]/g, '').split('').map((p) => gs.enc[p]))];
    const nx = order.slice(order.indexOf(gs.sel) + 1).concat(order).find((c) => !gs.guess[c]);
    if (nx) gs.sel = nx;
    _cqDone(); _cqRender();
}
function _cqDone() {
    const gs = gameState.cryptoquote;
    const codes = [...new Set(gs.text.replace(/[^A-Z]/g, '').split('').map((p) => gs.enc[p]))];
    if (codes.every((c) => gs.guess[c] === gs.dec[c]) && !gs.over) {
        gs.over = true; gs.msg = 'Solved!'; if (typeof sfxCorrect === 'function') sfxCorrect();
        GameKit.finish('cryptoquote', true, `"${gs.text.charAt(0) + gs.text.slice(1).toLowerCase()}" ${gs.hints ? `(${gs.hints} hint${gs.hints === 1 ? '' : 's'} used)` : ''}`);
    } else if (codes.every((c) => gs.guess[c])) { gs.msg = 'Every letter is filled in, but something is not right yet. Tap Check.'; }
}
function cqCheck() {
    const gs = gameState.cryptoquote; gs.wrong = Object.keys(gs.guess).filter((c) => gs.guess[c] !== gs.dec[c]);
    gs.msg = gs.wrong.length ? `${gs.wrong.length} letter${gs.wrong.length === 1 ? ' is' : 's are'} wrong (shown in red).` : 'All your letters are right so far.';
    if (gs.wrong.length && typeof sfxWrong === 'function') sfxWrong();
    _cqRender(); gs.wrong = [];
}
function cqHint() {
    const gs = gameState.cryptoquote; if (gs.over) return;
    const c = gs.sel && gs.guess[gs.sel] !== gs.dec[gs.sel] ? gs.sel : [...new Set(gs.text.replace(/[^A-Z]/g, '').split('').map((p) => gs.enc[p]))].find((x) => gs.guess[x] !== gs.dec[x]);
    if (!c) return;
    Object.keys(gs.guess).forEach((x) => { if (gs.guess[x] === gs.dec[c]) delete gs.guess[x]; });
    gs.guess[c] = gs.dec[c]; gs.hints++; gs.msg = `${c} stands for ${gs.dec[c]}.`;
    _cqDone(); _cqRender();
}
function cqGiveUp() {
    const gs = gameState.cryptoquote; if (gs.over) return;
    gs.over = true; Object.keys(gs.dec).forEach((c) => { gs.guess[c] = gs.dec[c]; }); gs.msg = 'Here is the quote.';
    _cqRender(); GameKit.finish('cryptoquote', false, `The quote was: "${gs.text.charAt(0) + gs.text.slice(1).toLowerCase()}" - ${gs.who}`);
}
function _cqRender() {
    const gs = gameState.cryptoquote, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'cryptoquote') return;
    const wrong = gs.wrong || [];
    const words = gs.text.split(/(?<=-)| /).map((w) => `<span class="cq-w">${[...w].map((ch) => {
        if (!/[A-Z]/.test(ch)) return `<span class="cq-p">${ch}</span>`;
        const c = gs.enc[ch], g = gs.guess[c] || '';
        const cls = ['gk-cell cq-l', c === gs.sel ? 'cq-sel' : '', gs.given.includes(c) ? 'cq-giv' : '', wrong.includes(c) ? 'cq-bad' : ''].join(' ');
        return `<button type="button" class="${cls}" onclick="cqSel('${c}')" aria-label="code ${c}${g ? ', guess ' + g : ''}"><b>${g || '&nbsp;'}</b><i>${c}</i></button>`;
    }).join('')}</span>`).join(' ');
    const kb = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM⌫'].map((row) => `<div class="cw-kr">${[...row].map((k) => {
        const used = k !== '⌫' && Object.values(gs.guess).includes(k);
        return `<button type="button" class="gk-cell cw-k${k === '⌫' ? ' cw-kw' : ''}${used ? ' cq-used' : ''}" onclick="cqKey('${k}')" aria-label="${k === '⌫' ? 'delete' : k}">${k}</button>`; }).join('')}</div>`).join('');
    el.innerHTML = `<div class="cq" dir="ltr">
      <div class="cq-help">${gs.sel && !gs.over ? `Code letter <b>${gs.sel}</b> stands for...? Type a letter.` : ''}</div>
      <div class="cq-q">${words}</div>
      <div class="cq-who">- ${QuizKit.esc(gs.who)}</div>
      ${gs.msg ? `<div class="cw-msg" role="status">${gs.msg}</div>` : ''}
      <div class="cw-kb">${kb}</div>
      <div class="gk-btns">${GameKit.btn('Check', 'cqCheck()')}${GameKit.btn('Hint', 'cqHint()')}${GameKit.btn('Give up', 'cqGiveUp()')}</div>
      <div class="cq-key">Small gray letter = the code. Big letter = your guess. Green letters were given to start.</div>
    </div>
    <style>
      .cq{width:100%;box-sizing:border-box;max-width:46rem;margin:0 auto;color:#2b1b0d}
      .cq-help{text-align:center;font-size:1.15rem;min-height:1.6em;margin-bottom:6px}
      .cq-q{display:flex;flex-wrap:wrap;gap:14px 16px;justify-content:center;background:#fff3d6;border:3px solid #e8cfa8;border-radius:16px;padding:14px 8px}
      .cq-w{display:inline-flex;gap:3px;flex-wrap:wrap;justify-content:center}
      .cq-l{display:flex;flex-direction:column;align-items:center;width:clamp(22px,7.2vw,40px);min-height:58px;border:0;border-bottom:3px solid #2b1b0d;background:#fffdf7;border-radius:6px 6px 0 0;cursor:pointer;padding:2px 0}
      .cq-l b{font:800 clamp(1.15rem,5.4vw,1.6rem)/1.1 Georgia,serif;color:#1d1b18;min-height:1.2em}
      .cq-l i{font:700 .85rem/1 system-ui,sans-serif;color:#6b5236;font-style:normal;margin-top:4px}
      .cq-l.cq-sel{background:#ffd34d}.cq-l.cq-giv b{color:#15803d}.cq-l.cq-bad b{color:#b91c1c;text-decoration:line-through}
      .cq-p{font:800 1.5rem/58px Georgia,serif;color:#2b1b0d}
      .cq-who{text-align:right;font-style:italic;font-size:1.1rem;margin:8px 4px}
      .cw-msg{text-align:center;font-weight:800;margin:8px 0}
      .cw-kb{margin:12px auto 4px;max-width:34rem}
      .cw-kr{display:flex;gap:4px;justify-content:center;margin-bottom:5px}
      .cw-k{flex:1 1 0;min-width:0;max-width:52px;min-height:50px;border-radius:9px;border:2px solid #c9a46a;background:#fffdf7;color:#2b1b0d;font-weight:800;font-size:1.15rem;cursor:pointer;padding:0}
      .cw-k.cq-used{background:#e9dcc3;color:#6b5236}
      .cw-kw{flex:1.6 1 0;max-width:80px}
      .cq .gk-btn{border-color:#c9a46a}
      .cq-key{text-align:center;font-size:.98rem;color:#4a3420;margin-top:6px}
    </style>`;
}
