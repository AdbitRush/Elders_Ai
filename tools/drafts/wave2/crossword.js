// Words and clues for the Daily Mini Crossword (js/games/crossword.js). Plain dictionary-style clues, everyday
// American English; a few nostalgia ones. Every clue states a plain fact about the word - no wordplay tricks.
window.CROSSWORD_WORDS = [
  ['APPLE', 'Red or green fruit; one a day keeps the doctor away, they say'],
  ['BREAD', 'Loaf from the bakery'],
  ['PIANO', 'Instrument with 88 keys'],
  ['RADIO', 'Box that plays music and news over the airwaves'],
  ['DINER', 'Roadside restaurant with booths and a counter'],
  ['JUKEBOX', 'Coin-operated machine that plays records'],
  ['MILKSHAKE', 'Thick, cold drink of ice cream and milk'],
  ['PICNIC', 'Meal eaten outdoors on a blanket'],
  ['GARDEN', 'Place to grow flowers and vegetables'],
  ['KITCHEN', 'Room where meals are cooked'],
  ['LETTER', 'It comes in an envelope with a stamp'],
  ['STAMP', 'Small sticker that pays for postage'],
  ['TRAIN', 'It runs on rails'],
  ['TICKET', 'Paper that lets you on the bus or into the show'],
  ['MOVIE', 'Feature film'],
  ['POPCORN', 'Snack sold at the movie theater'],
  ['CANDY', 'Sweets'],
  ['COOKIE', 'Small baked treat, maybe chocolate chip'],
  ['HONEY', 'Sweet food made by bees'],
  ['LEMON', 'Sour yellow citrus fruit'],
  ['ORANGE', 'Citrus fruit, or the color between red and yellow'],
  ['BANANA', 'Long yellow fruit you peel'],
  ['CHERRY', 'Small red fruit on top of a sundae'],
  ['PEACH', 'Fuzzy fruit Georgia is famous for'],
  ['TOAST', 'Bread browned for breakfast'],
  ['BACON', 'Breakfast strips that sizzle in the pan'],
  ['COFFEE', 'Morning drink brewed from roasted beans'],
  ['SUGAR', 'Sweetener in a bowl on the table'],
  ['SALT', 'Shaker partner of pepper'],
  ['PEPPER', 'Shaker partner of salt'],
  ['OCEAN', 'The Atlantic or the Pacific'],
  ['RIVER', 'The Mississippi, for one'],
  ['LAKE', 'Body of fresh water, like Erie or Michigan'],
  ['BEACH', 'Sandy shore'],
  ['ISLAND', 'Land surrounded by water'],
  ['FOREST', 'Large area covered with trees'],
  ['DESERT', 'Dry, sandy region'],
  ['VALLEY', 'Low land between hills'],
  ['CLOUD', 'White puff in the sky'],
  ['STORM', 'Wind and rain, maybe thunder'],
  ['SNOW', 'White flakes in winter'],
  ['WINTER', 'The coldest season'],
  ['SUMMER', 'The warmest season'],
  ['AUTUMN', 'Fall, when leaves turn color'],
  ['SPRING', 'Season when flowers bloom'],
  ['MONDAY', 'First workday of the week'],
  ['FRIDAY', 'Last workday of the week'],
  ['APRIL', 'Month of showers, in the rhyme'],
  ['JUNE', 'Month of many weddings'],
  ['MARCH', 'Month after February'],
  ['TIGER', 'Big striped cat'],
  ['HORSE', 'Animal you saddle and ride'],
  ['RABBIT', 'Long-eared animal that hops'],
  ['TURTLE', 'Slow animal with a shell'],
  ['EAGLE', 'Bird on the Great Seal of the United States'],
  ['ROBIN', 'Red-breasted bird of spring'],
  ['OWL', 'Night bird that hoots'],
  ['BEAR', 'Big furry animal that hibernates'],
  ['ZEBRA', 'Striped African animal'],
  ['CAMEL', 'Desert animal with a hump'],
  ['PUPPY', 'Young dog'],
  ['KITTEN', 'Young cat'],
  ['DOCTOR', 'Person you see when you are sick'],
  ['NURSE', 'Hospital worker who cares for patients'],
  ['TEACHER', 'Person at the front of the classroom'],
  ['FARMER', 'Person who grows crops'],
  ['BAKER', 'Person who makes bread and cakes'],
  ['PILOT', 'Person who flies a plane'],
  ['SCHOOL', 'Place for reading, writing and arithmetic'],
  ['PENCIL', 'Writing tool with an eraser on the end'],
  ['ERASER', 'It rubs out pencil marks'],
  ['CHALK', 'It writes on a blackboard'],
  ['BOOK', 'Novel or dictionary, for example'],
  ['NOVEL', 'Long work of fiction'],
  ['POEM', 'Verse that may rhyme'],
  ['SONG', 'Music with words to sing'],
  ['DANCE', 'Move to the music'],
  ['GUITAR', 'Six-string instrument you strum'],
  ['DRUM', 'Instrument you beat with sticks'],
  ['BANJO', 'Stringed instrument of bluegrass'],
  ['RECORD', 'Vinyl disc that spins on a turntable'],
  ['CAMERA', 'Device for taking pictures'],
  ['PHOTO', 'Snapshot'],
  ['ALBUM', 'Book for photos, or a long-playing record'],
  ['CLOCK', 'It has hands but no fingers'],
  ['WATCH', 'Timepiece worn on the wrist'],
  ['TABLE', 'Furniture you eat at'],
  ['CHAIR', 'Seat with a back'],
  ['SOFA', 'Couch'],
  ['LAMP', 'It lights up a room'],
  ['WINDOW', 'Glass pane in a wall'],
  ['DOOR', 'You knock on it'],
  ['HOUSE', 'Home'],
  ['PORCH', 'Covered area at the front of a house'],
  ['BRIDGE', 'It crosses a river'],
  ['TOWER', 'Tall, narrow building'],
  ['CASTLE', 'Home of a king, with towers and a moat'],
  ['CHURCH', 'Building with a steeple'],
  ['MARKET', 'Place to buy food'],
  ['BASKET', 'Woven container with a handle'],
  ['BOTTLE', 'Glass container for milk or soda'],
  ['CANDLE', 'Wax light with a wick'],
  ['MIRROR', 'Glass that shows your reflection'],
  ['PILLOW', 'Soft cushion for your head'],
  ['BLANKET', 'Warm cover on a bed'],
  ['SWEATER', 'Knitted top worn in cool weather'],
  ['JACKET', 'Short coat'],
  ['HAT', 'You wear it on your head'],
  ['BOOTS', 'Tall shoes for rain or snow'],
  ['TRAVEL', 'Go on a trip'],
  ['SAILOR', 'Person who works on a ship'],
  ['ANCHOR', 'Heavy hook that keeps a boat in place'],
  ['ROCKET', 'It blasts off into space'],
  ['PLANET', 'Mars or Jupiter'],
  ['MOON', 'Neil Armstrong walked on it in 1969'],
  ['STAR', 'Twinkling light in the night sky'],
  ['SUN', 'Star at the center of our solar system'],
  ['EARTH', 'The third planet from the Sun'],
  ['SMILE', 'Happy expression'],
  ['LAUGH', 'Sound you make at a good joke'],
  ['FRIEND', 'Pal'],
  ['FAMILY', 'Parents, children, grandparents and more'],
  ['MOTHER', 'Mom'],
  ['FATHER', 'Dad'],
  ['UNCLE', "Your parent's brother"],
  ['AUNT', "Your parent's sister"],
  ['COUSIN', "Your aunt's or uncle's child"],
  ['BABY', 'Newborn'],
  ['HEART', 'Organ that pumps blood'],
  ['HAND', 'It has five fingers'],
  ['NOSE', 'You smell with it'],
  ['TOOTH', 'You brush it'],
];

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY MINI CROSSWORD (2026-10, wave 2) — a small American crossword, the same puzzle for everyone on the same day
// (Level 2+ gives a different puzzle of the day). Words and plain clues: js/data/crossword-words.js.
// The grid is built here: a seeded generator crosses 6-8 words on an 11x11 board and keeps the tightest layout.
// Tap a square (tap again to switch Across/Down), type with the big keyboard or a real one.
// Check marks wrong letters red; Reveal fills one square. Solving ends the game ("Well Done!"); Give up = "Nice try".
// ═══════════════════════════════════════════════════════════════════════════════
function _cwRng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function _cwBuild(words, rnd) {
    const N = 11;
    let best = null;
    for (let attempt = 0; attempt < 40; attempt++) {
        const pool = words.filter((w) => w[0].length >= 3 && w[0].length <= 9).map((w) => ({ w: w[0], clue: w[1], k: rnd() })).sort((a, b) => a.k - b.k);
        const g = Array.from({ length: N }, () => Array(N).fill(null));
        const placed = [];
        const can = (w, r, c, dr, dc) => {
            if (r - dr >= 0 && c - dc >= 0 && g[r - dr][c - dc]) return false;
            const er = r + dr * w.length, ec = c + dc * w.length;
            if (er < N && ec < N && er >= 0 && ec >= 0 && g[er][ec]) return false;
            let cross = 0;
            for (let i = 0; i < w.length; i++) {
                const rr = r + dr * i, cc = c + dc * i;
                if (rr < 0 || cc < 0 || rr >= N || cc >= N) return false;
                const ch = g[rr][cc];
                if (ch) { if (ch !== w[i]) return false; cross++; continue; }
                // no side-by-side neighbours along the word (keeps it a real crossword)
                const sr = rr + dc, sc = cc + dr, tr = rr - dc, tc = cc - dr;
                if (sr < N && sc < N && g[sr][sc]) return false;
                if (tr >= 0 && tc >= 0 && g[tr][tc]) return false;
            }
            return placed.length ? cross > 0 && cross < w.length : true;
        };
        const put = (o, r, c, dr, dc) => { for (let i = 0; i < o.w.length; i++) g[r + dr * i][c + dc * i] = o.w[i]; placed.push({ w: o.w, clue: o.clue, r, c, dr, dc }); };
        const first = pool.find((o) => o.w.length >= 6) || pool[0];
        put(first, 5, Math.floor((N - first.w.length) / 2), 0, 1);
        for (const o of pool) {
            if (placed.length >= 8) break;
            if (placed.some((p) => p.w === o.w)) continue;
            const spots = [];
            for (const p of placed) for (let i = 0; i < p.w.length; i++) for (let j = 0; j < o.w.length; j++) {
                if (p.w[i] !== o.w[j]) continue;
                const dr = p.dr ? 0 : 1, dc = p.dc ? 0 : 1;   // cross at right angles
                const r = p.r + p.dr * i - dr * j, c = p.c + p.dc * i - dc * j;
                if (can(o.w, r, c, dr, dc)) spots.push([r, c, dr, dc]);
            }
            if (spots.length) { const s = spots[Math.floor(rnd() * spots.length)]; put(o, ...s); }
        }
        // crop
        let r0 = N, r1 = 0, c0 = N, c1 = 0;
        placed.forEach((p) => { r0 = Math.min(r0, p.r); c0 = Math.min(c0, p.c); r1 = Math.max(r1, p.r + p.dr * (p.w.length - 1)); c1 = Math.max(c1, p.c + p.dc * (p.w.length - 1)); });
        const size = Math.max(r1 - r0 + 1, c1 - c0 + 1);
        const score = placed.length * 10 - size;
        if (placed.length >= 6 && size <= 9 && (!best || score > best.score)) best = { score, placed: placed.map((p) => ({ ...p, r: p.r - r0, c: p.c - c0 })), rows: r1 - r0 + 1, cols: c1 - c0 + 1 };
    }
    return best;
}
function initCrossword(container) {
    const gs = gameState.crossword;
    const d = new Date(), day = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const P = _cwBuild(window.CROSSWORD_WORDS || [], _cwRng(day * 31 + (gs.level || 1) * 7919));
    if (!P) { container.innerHTML = '<p>Could not build today\'s puzzle.</p>'; return; }
    // number the words in reading order
    const starts = {};
    P.placed.forEach((p) => { starts[p.r + ',' + p.c] = 1; });
    let n = 0; const num = {};
    for (let r = 0; r < P.rows; r++) for (let c = 0; c < P.cols; c++) if (starts[r + ',' + c]) num[r + ',' + c] = ++n;
    P.placed.forEach((p) => { p.n = num[p.r + ',' + p.c]; p.cells = [...p.w].map((_, i) => [p.r + p.dr * i, p.c + p.dc * i]); });
    gs.P = P; gs.sol = Array.from({ length: P.rows }, () => Array(P.cols).fill(null));
    P.placed.forEach((p) => p.cells.forEach(([r, c], i) => { gs.sol[r][c] = p.w[i]; }));
    gs.ent = gs.sol.map((row) => row.map((x) => (x ? '' : null)));
    gs.bad = {}; gs.revealed = 0; gs.over = false;
    gs.word = P.placed.find((p) => p.dc) || P.placed[0]; gs.pos = 0;
    const onKey = (e) => {
        if (gameState.currentId !== 'crossword' || gs.over || e.ctrlKey || e.metaKey || e.altKey) return;
        if (/^[a-z]$/i.test(e.key)) { cwKey(e.key.toUpperCase()); e.preventDefault(); }
        else if (e.key === 'Backspace') { cwKey('⌫'); e.preventDefault(); }
        else if (e.key.startsWith('Arrow')) { const dc = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0, dr = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0; const [r, c] = gs.word.cells[gs.pos]; let rr = r + dr, cc = c + dc; while (gs.sol[rr] && gs.sol[rr][cc] === null) { rr += dr; cc += dc; } if (gs.sol[rr] && gs.sol[rr][cc]) cwCell(rr, cc, dr ? 'down' : 'across'); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    window._gameCleanup = () => document.removeEventListener('keydown', onKey);
    _cwRender();
}
function cwCell(r, c, want) {
    const gs = gameState.crossword; if (gs.over) return;
    const here = gs.P.placed.filter((p) => p.cells.some(([a, b]) => a === r && b === c));
    let w = here.find((p) => (want === 'down' ? p.dr : want === 'across' ? p.dc : false));
    if (!w) { const cur = gs.word.cells.some(([a, b]) => a === r && b === c); w = cur && here.length > 1 && !want ? here.find((p) => p !== gs.word) : here.includes(gs.word) ? gs.word : here[0]; }
    gs.word = w; gs.pos = w.cells.findIndex(([a, b]) => a === r && b === c); _cwRender();
}
function cwPick(i) { const gs = gameState.crossword; gs.word = gs.P.placed[i]; gs.pos = Math.max(0, gs.word.cells.findIndex(([r, c]) => !gs.ent[r][c])); _cwRender(); }
function cwKey(k) {
    const gs = gameState.crossword; if (gs.over) return;
    const [r, c] = gs.word.cells[gs.pos];
    if (k === '⌫') {
        if (!gs.ent[r][c] && gs.pos > 0) gs.pos--;
        const [r2, c2] = gs.word.cells[gs.pos]; gs.ent[r2][c2] = ''; delete gs.bad[r2 + ',' + c2];
    } else {
        gs.ent[r][c] = k; delete gs.bad[r + ',' + c];
        if (gs.pos < gs.word.cells.length - 1) gs.pos++;
        else { const nx = gs.P.placed.find((p) => p.cells.some(([a, b]) => !gs.ent[a][b])); if (nx && nx !== gs.word) cwPick(gs.P.placed.indexOf(nx)); }
    }
    if (typeof sfxClick === 'function') sfxClick();
    _cwCheckDone(); _cwRender();
}
function _cwCheckDone() {
    const gs = gameState.crossword;
    const all = gs.sol.every((row, r) => row.every((x, c) => x === null || gs.ent[r][c] === x));
    if (all && !gs.over) { gs.over = true; if (typeof sfxCorrect === 'function') sfxCorrect(); GameKit.finish('crossword', true, gs.revealed ? `Solved, with ${gs.revealed} square${gs.revealed === 1 ? '' : 's'} revealed.` : 'Solved without a single reveal!'); }
}
function cwCheck() {
    const gs = gameState.crossword; let wrong = 0;
    gs.sol.forEach((row, r) => row.forEach((x, c) => { if (x && gs.ent[r][c] && gs.ent[r][c] !== x) { gs.bad[r + ',' + c] = 1; wrong++; } }));
    gs.msg = wrong ? `${wrong} square${wrong === 1 ? ' is' : 's are'} not right yet (shown in red).` : 'Everything you have filled in so far is right.';
    if (wrong && typeof sfxWrong === 'function') sfxWrong();
    _cwRender();
}
function cwReveal() {
    const gs = gameState.crossword; if (gs.over) return;
    const [r, c] = gs.word.cells[gs.pos];
    const cell = gs.ent[r][c] === gs.sol[r][c] ? gs.word.cells.find(([a, b]) => gs.ent[a][b] !== gs.sol[a][b]) : [r, c];
    if (!cell) return;
    gs.ent[cell[0]][cell[1]] = gs.sol[cell[0]][cell[1]]; delete gs.bad[cell[0] + ',' + cell[1]]; gs.revealed++;
    gs.msg = 'One square revealed.'; _cwCheckDone(); _cwRender();
}
function cwGiveUp() {
    const gs = gameState.crossword; if (gs.over) return;
    gs.over = true; gs.ent = gs.sol.map((row) => row.map((x) => x)); gs.msg = 'Here is the full answer.';
    _cwRender(); GameKit.finish('crossword', false, 'The answers are shown on the grid. A new puzzle comes tomorrow.');
}
function _cwRender() {
    const gs = gameState.crossword, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'crossword') return;
    const P = gs.P, on = {}; gs.word.cells.forEach(([r, c]) => { on[r + ',' + c] = 1; });
    const cur = gs.word.cells[gs.pos], nums = {}; P.placed.forEach((p) => { nums[p.r + ',' + p.c] = p.n; });
    let grid = '';
    for (let r = 0; r < P.rows; r++) for (let c = 0; c < P.cols; c++) {
        const s = gs.sol[r][c];
        if (s === null) { grid += '<div class="cw-x"></div>'; continue; }
        const k = r + ',' + c, cls = ['cw-c', on[k] ? 'cw-on' : '', cur[0] === r && cur[1] === c ? 'cw-cur' : '', gs.bad[k] ? 'cw-bad' : ''].join(' ');
        grid += `<button type="button" class="${cls}" onclick="cwCell(${r},${c})" aria-label="row ${r + 1} column ${c + 1}">${nums[k] ? `<i>${nums[k]}</i>` : ''}${gs.ent[r][c] || ''}</button>`;
    }
    const list = (dir) => P.placed.map((p, i) => ({ p, i })).filter(({ p }) => (dir ? p.dr : p.dc)).sort((a, b) => a.p.n - b.p.n)
        .map(({ p, i }) => `<button type="button" class="cw-clue${p === gs.word ? ' cw-clue-on' : ''}" onclick="cwPick(${i})"><b>${p.n}</b> ${QuizKit.esc(p.clue)} <span>(${p.w.length})</span></button>`).join('');
    const kb = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM⌫'].map((row) => `<div class="cw-kr">${[...row].map((k) => `<button type="button" class="cw-k${k === '⌫' ? ' cw-kw' : ''}" onclick="cwKey('${k}')" aria-label="${k === '⌫' ? 'delete' : k}">${k}</button>`).join('')}</div>`).join('');
    el.innerHTML = `<div class="cw" dir="ltr">
      <div class="cw-now"><b>${gs.word.n} ${gs.word.dr ? 'Down' : 'Across'}:</b> ${QuizKit.esc(gs.word.clue)} <span>(${gs.word.w.length} letters)</span></div>
      <div class="cw-grid" style="grid-template-columns:repeat(${P.cols},1fr);max-width:min(100%,${P.cols * 58}px)">${grid}</div>
      ${gs.msg ? `<div class="cw-msg" role="status">${gs.msg}</div>` : ''}
      <div class="cw-kb">${kb}</div>
      <div class="gk-btns">${GameKit.btn('Check', 'cwCheck()')}${GameKit.btn('Reveal a square', 'cwReveal()')}${GameKit.btn('Give up', 'cwGiveUp()')}</div>
      <div class="cw-lists"><div><h4>Across</h4>${list(0)}</div><div><h4>Down</h4>${list(1)}</div></div>
    </div>
    <style>
      .cw{max-width:44rem;margin:0 auto;color:#2b1b0d}
      .cw-now{background:#fff3d6;border:3px solid #e8cfa8;border-radius:14px;padding:10px 14px;font-size:1.2rem;line-height:1.35;margin-bottom:10px}
      .cw-now span,.cw-clue span{color:#6b5236;font-size:.9em}
      .cw-grid{display:grid;gap:3px;margin:0 auto;background:#2b1b0d;padding:3px;border-radius:8px}
      .cw-x{background:#2b1b0d;aspect-ratio:1}
      .cw-c{position:relative;aspect-ratio:1;background:#fffdf7;border:0;border-radius:3px;font:800 clamp(1.1rem,6vw,1.7rem)/1 Georgia,serif;color:#1d1b18;cursor:pointer;padding:0;min-width:0}
      .cw-c i{position:absolute;top:1px;left:3px;font:700 .62rem/1 system-ui,sans-serif;color:#5b3f22;font-style:normal}
      .cw-c.cw-on{background:#cfe0ff}.cw-c.cw-cur{background:#ffd34d}.cw-c.cw-bad{color:#b91c1c;text-decoration:line-through}
      .cw-msg{text-align:center;font-weight:800;margin:8px 0;color:#2b1b0d}
      .cw-kb{margin:12px auto 4px;max-width:34rem}
      .cw-kr{display:flex;gap:4px;justify-content:center;margin-bottom:5px}
      .cw-k{flex:1 1 0;min-width:0;max-width:52px;min-height:50px;border-radius:9px;border:2px solid #c9a46a;background:#fffdf7;color:#2b1b0d;font-weight:800;font-size:1.15rem;cursor:pointer;padding:0}
      .cw-kw{flex:1.6 1 0;max-width:80px}
      .cw .gk-btn{border-color:#c9a46a}
      .cw-lists{display:grid;gap:10px;margin-top:8px}
      @media(min-width:640px){.cw-lists{grid-template-columns:1fr 1fr}}
      .cw-lists h4{font-weight:900;font-size:1.15rem;margin:4px 0}
      .cw-clue{display:block;width:100%;text-align:left;background:none;border:0;border-radius:10px;padding:8px 8px;font-size:1.08rem;line-height:1.35;color:#2b1b0d;cursor:pointer;min-height:48px}
      .cw-clue-on{background:#cfe0ff}
    </style>`;
}
