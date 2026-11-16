const _spWho = p => [
  gt('You'),
  gt('West'),
  gt('Your partner'),
  gt('East')
][p];
const _spName = c => `${ [
  gt(''),
  gt('Ace'),
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  gt('Jack'),
  gt('Queen'),
  gt('King')
][c.r] } ${ gt('of') } ${ [
  gt('spades'),
  gt('hearts'),
  gt('diamonds'),
  gt('clubs')
][c.s] }`;
const _spHi = c => c.r === 1 ? 14 : c.r;
const _SP_KEY = 'gg_spades_save';
const _SP_FIELDS = [
  'diff',
  'target',
  'score',
  'bags',
  'dealer',
  'over',
  'handNo',
  'hands',
  'bids',
  'won',
  'trick',
  'broken',
  'phase',
  'last',
  'lastW',
  'lead',
  'msg'
];
function _spSave(gs) {
  try {
    if (gs.over)
      return localStorage.removeItem(_SP_KEY);
    const o = { v: 1 };
    _SP_FIELDS.forEach(k => {
      if (gs[k] !== undefined)
        o[k] = gs[k];
    });
    localStorage.setItem(_SP_KEY, JSON.stringify(o));
  } catch (e) {
  }
}
function _spLoad() {
  try {
    const o = JSON.parse(localStorage.getItem(_SP_KEY));
    if (!o || o.v !== 1 || ![
        'easy',
        'normal',
        'hard'
      ].includes(o.diff) || ![
        150,
        200,
        250
      ].includes(o.target))
      return null;
    if (!Array.isArray(o.hands) || o.hands.length !== 4 || !o.hands.every(h => Array.isArray(h)))
      return null;
    if (!Array.isArray(o.bids) || !Array.isArray(o.won) || !Array.isArray(o.score) || !Array.isArray(o.trick))
      return null;
    if (![
        'bid',
        'play',
        'scored'
      ].includes(o.phase) || typeof o.handNo !== 'number' || typeof o.msg !== 'string')
      return null;
    delete o.v;
    return o;
  } catch (e) {
    return null;
  }
}
function initSpades() {
  NK.start('spades', {
    setup(gs, diff) {
      gs.diff = diff;
      gs.target = diff === 'easy' ? 150 : diff === 'hard' ? 250 : 200;
      gs.score = [
        0,
        0
      ];
      gs.bags = [
        0,
        0
      ];
      gs.dealer = 3;
      gs.over = false;
      gs.handNo = 0;
      _spDeal(gs);
      const sv = _spLoad();
      if (sv) {
        Object.assign(gs, sv);
        if (gs.phase === 'play')
          setTimeout(() => {
            if (gameState.spades === gs && !gs.over)
              _spGo(gs);
          }, 450);
      }
    },
    view: _spView,
    rules: gs => [
      gt('You (south) and your <b>partner</b> (north) play against <b>West</b> and <b>East</b>. <b>Spades are always trumps.</b>'),
      gt('First everyone <b>bids</b> how many tricks they expect to take. You and your partner\'s bids add up to your team\'s contract.'),
      gt('<b>Follow suit</b> if you can. If you cannot, play any card, a spade to win the trick if you like. The highest spade wins; with no spade, the highest card of the suit led wins. Aces are high.'),
      gt('Spades may not be <b>led</b> until a spade has been played on an earlier trick (unless you hold nothing but spades).'),
      gt(`Make your contract: 10 points per trick bid, plus 1 for each extra trick (a "bag"). Fall short: minus 10 per trick bid. Every 10 bags costs 100. First team to <b>${ gs.target }</b> wins.`),
      gt('No money, no clock. Keyboard: arrow keys and Enter on your cards and the bid buttons.')
    ],
    css: `.sp-t{--w:clamp(40px,10.6vw,88px)}
.sp-tab{display:grid;grid-template-columns:1fr auto 1fr;grid-template-rows:auto auto auto;align-items:center;justify-items:center;gap:4px;min-height:calc(var(--w)*3.6)}
.sp-seat{font:800 .9rem system-ui,sans-serif;color:#fde7c4;text-align:center;line-height:1.25}
.sp-seat b{color:#fff}
.sp-play{display:flex;flex-direction:column;align-items:center;gap:2px}
.sp-play .gk-card.sp-win{outline:4px solid #4ade80;outline-offset:1px}
.sp-hand{display:flex;flex-wrap:wrap;gap:3px;justify-content:center;margin-top:8px}
#gameContent .nk button.sp-b{background:none;border:0;padding:0;--nk-r:9px;display:block}
.sp-b:disabled{cursor:default}
.sp-b:disabled .gk-card{filter:brightness(.7)}
.sp-b.sp-ok .gk-card{transform:translateY(-3px)}
.sp-bid{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0}
.sp-bid .gk-btn{min-width:52px}
.sp-sc{display:grid;grid-template-columns:auto 1fr 1fr;gap:2px 14px;max-width:24rem;margin:8px auto 0;font-size:1rem}
.sp-sc b{text-align:right}
@media (prefers-reduced-motion:reduce){.sp-b.sp-ok .gk-card{transform:none}}`
  });
}
function _spSort(h) {
  const ord = [
    0,
    1,
    3,
    2
  ];
  h.sort((a, b) => ord.indexOf(a.s) - ord.indexOf(b.s) || _spHi(a) - _spHi(b));
}
function _spDeal(gs) {
  const d = GameKit.deck();
  d.forEach(c => c.up = true);
  gs.hands = [
    0,
    1,
    2,
    3
  ].map(() => d.splice(0, 13));
  gs.hands.forEach(_spSort);
  gs.dealer = (gs.dealer + 1) % 4;
  gs.handNo++;
  gs.bids = [
    null,
    null,
    null,
    null
  ];
  gs.won = [
    0,
    0,
    0,
    0
  ];
  gs.trick = [];
  gs.broken = false;
  gs.phase = 'bid';
  gs.last = null;
  for (let p = (gs.dealer + 1) % 4; p !== 0; p = (p + 1) % 4)
    gs.bids[p] = _spCpuBid(gs.hands[p], gs.diff);
  gs.lead = (gs.dealer + 1) % 4;
  const said = [
    1,
    2,
    3
  ].filter(p => gs.bids[p] !== null).map(p => `${ _spWho(p) } ${ gt('bid') } ${ gs.bids[p] }`).join(', ');
  gs.msg = gt(`Hand ${ gs.handNo }. ${ said ? said + '. ' : '' }How many tricks will you take? Count your Aces, Kings and spades.`);
}
function _spCpuBid(h, diff) {
  let t = 0;
  const sp = h.filter(c => c.s === 0);
  for (const s of [
      1,
      2,
      3
    ]) {
    const cs = h.filter(c => c.s === s);
    if (cs.some(c => c.r === 1))
      t += 1;
    if (cs.some(c => c.r === 13) && cs.length >= 2 && cs.length <= 5)
      t += 0.8;
    if (cs.length <= 1 && sp.length >= 3)
      t += 0.6;
  }
  sp.forEach(c => {
    if (_spHi(c) >= 12)
      t += 1;
    else if (_spHi(c) >= 10)
      t += 0.5;
  });
  if (sp.length > 4)
    t += sp.length - 4;
  return Math.max(1, Math.min(7, Math.round(t * (diff === 'easy' ? 0.9 : 1))));
}
function spBid(n) {
  const gs = gameState.spades;
  if (gs.over || gs.phase !== 'bid')
    return;
  gs.bids[0] = n;
  for (let p = 1; p < 4; p++)
    if (gs.bids[p] === null)
      gs.bids[p] = _spCpuBid(gs.hands[p], gs.diff);
  gs.phase = 'play';
  gs.msg = gt(`Bids: you ${ n }, West ${ gs.bids[1] }, partner ${ gs.bids[2] }, East ${ gs.bids[3] }. Your team needs ${ n + gs.bids[2] }, theirs ${ gs.bids[1] + gs.bids[3] }.`);
  _spGo(gs);
}
const _spLegal = (gs, p) => {
  const h = gs.hands[p];
  if (!gs.trick.length) {
    const non = h.filter(c => c.s !== 0);
    return gs.broken || !non.length ? h : non;
  }
  const led = gs.trick[0].c.s, f = h.filter(c => c.s === led);
  return f.length ? f : h;
};
function _spWinner(trick) {
  let w = trick[0];
  for (const t of trick.slice(1)) {
    if (t.c.s === 0 && w.c.s !== 0 || t.c.s === w.c.s && _spHi(t.c) > _spHi(w.c))
      w = t;
  }
  return w;
}
function _spNextPlayer(gs) {
  return (gs.lead + gs.trick.length) % 4;
}
function _spGo(gs) {
  if (gs.over)
    return;
  if (gs.trick.length === 4)
    return NK.after(gs.diff === 'easy' ? 1400 : 1100, () => _spCollect(gs));
  const p = _spNextPlayer(gs);
  if (p === 0) {
    const tail = !gs.trick.length ? gt(' Your lead.') : gt(' Your turn.');
    if (!gs.msg.endsWith(tail))
      gs.msg += tail;
    return NK.render('spades');
  }
  NK.render('spades');
  NK.after(650, () => {
    if (gameState.spades !== gs || gs.over)
      return;
    _spPlay(gs, p, _spCpuCard(gs, p));
  });
}
function _spPlay(gs, p, c) {
  const h = gs.hands[p];
  h.splice(h.indexOf(c), 1);
  gs.trick.push({
    p,
    c
  });
  if (c.s === 0)
    gs.broken = true;
  if (typeof sfxFlip === 'function')
    sfxFlip();
  gs.msg = p === 0 ? gt(`You play the ${ _spName(c) }.`) : gt(`${ _spWho(p) } plays the ${ _spName(c) }.`);
  _spGo(gs);
}
function _spCpuCard(gs, p) {
  const L = _spLegal(gs, p), low = cs => cs.reduce((a, b) => b.s !== 0 && a.s === 0 || b.s === a.s && _spHi(b) < _spHi(a) || b.s !== 0 && a.s !== 0 && _spHi(b) < _spHi(a) ? b : a);
  const teamBid = gs.bids[p] + gs.bids[(p + 2) % 4], teamWon = gs.won[p] + gs.won[(p + 2) % 4], need = teamWon < teamBid;
  if (!gs.trick.length) {
    const aces = L.filter(c => c.s !== 0 && c.r === 1);
    if (aces.length && need)
      return aces[0];
    if (gs.diff !== 'easy') {
      const kings = L.filter(c => c.s !== 0 && c.r === 13 && !gs.hands[p].some(x => x.s === c.s && x.r === 1));
      if (kings.length && need && Math.random() < 0.3)
        return kings[0];
    }
    return low(L);
  }
  const w = _spWinner(gs.trick), partnerWins = w.p === (p + 2) % 4;
  const beats = L.filter(c => _spWinner(gs.trick.concat([{
      p,
      c
    }])).p === p);
  if (partnerWins && (gs.trick.length === 3 || _spHi(w.c) >= 13 || w.c.s === 0))
    return low(L);
  if (beats.length && (need || gs.diff === 'easy')) {
    beats.sort((a, b) => (a.s === 0) - (b.s === 0) || _spHi(a) - _spHi(b));
    return beats[0];
  }
  return low(L);
}
function spCard(i) {
  const gs = gameState.spades;
  if (gs.over || gs.phase !== 'play' || _spNextPlayer(gs) !== 0 || gs.trick.length === 4)
    return;
  const c = gs.hands[0][i], L = _spLegal(gs, 0);
  if (!L.includes(c)) {
    const suit = [
      gt('spade'),
      gt('heart'),
      gt('diamond'),
      gt('club')
    ][gs.trick.length ? gs.trick[0].c.s : 0];
    gs.msg = gs.trick.length ? gt(`You must follow suit: play a ${ suit }.`) : gt('Spades are not broken yet: lead another suit.');
    if (typeof sfxWrong === 'function')
      sfxWrong();
    return NK.render('spades');
  }
  gs.last = null;
  _spPlay(gs, 0, c);
}
function _spCollect(gs) {
  if (gameState.spades !== gs || gs.over)
    return;
  const w = _spWinner(gs.trick);
  gs.won[w.p]++;
  gs.last = gs.trick.slice();
  gs.lastW = w.p;
  gs.trick = [];
  gs.lead = w.p;
  gs.msg = w.p === 0 ? gt(`You take the trick with the ${ _spName(w.c) }.`) : gt(`${ _spWho(w.p) } takes the trick with the ${ _spName(w.c) }.`);
  if (gs.hands[0].length)
    return _spGo(gs);
  const lines = [];
  [
    0,
    1
  ].forEach(t => {
    const bid = gs.bids[t] + gs.bids[t + 2], got = gs.won[t] + gs.won[t + 2];
    if (got >= bid) {
      const bags = got - bid;
      gs.score[t] += bid * 10 + bags;
      gs.bags[t] += bags;
      let pen = '';
      if (gs.bags[t] >= 10) {
        gs.bags[t] -= 10;
        gs.score[t] -= 100;
        pen = gt(', and 10 bags cost 100');
      }
      lines.push(gt(`${ t ? 'They' : 'You' } bid ${ bid }, took ${ got }: +${ bid * 10 + bags }${ pen }`));
    } else {
      gs.score[t] -= bid * 10;
      lines.push(gt(`${ t ? 'They' : 'You' } bid ${ bid }, took only ${ got }: -${ bid * 10 }`));
    }
  });
  gs.phase = 'scored';
  gs.msg = lines.join('. ') + '.';
  const [a, b] = gs.score;
  if (a >= gs.target || b >= gs.target) {
    gs.over = true;
    const win = a > b;
    NK.render('spades');
    if (win && typeof sfxCorrect === 'function')
      sfxCorrect();
    return NK.finish('spades', win, win ? gt(`You and your partner won ${ a } to ${ b }.`) : a === b ? gt(`A tie at ${ a }.`) : gt(`West and East won ${ b } to ${ a }. A rematch is one tap away.`));
  }
  NK.render('spades');
}
function spNext() {
  const gs = gameState.spades;
  if (gs.over || gs.phase !== 'scored')
    return;
  _spDeal(gs);
  NK.render('spades');
}
function spNew() {
  try {
    localStorage.removeItem(_SP_KEY);
  } catch (e) {
  }
  initSpades();
}
function _spView(gs) {
  _spSave(gs);
  const my = gs.phase === 'play' && _spNextPlayer(gs) === 0 && gs.trick.length < 4 && !gs.over, L = my ? _spLegal(gs, 0) : [];
  const shown = gs.trick.length ? gs.trick : gs.last || [], win = shown.length === 4 ? _spWinner(shown).p : -1;
  const at = p => {
    const t = shown.find(x => x.p === p);
    return `<div class="sp-play" ${ t ? `role="img" aria-label="${ _spWho(p) } ${ p === 0 ? gt('played the') : gt('played the') } ${ _spName(t.c) }"` : '' }>${ t ? GameKit.card(t.c, { cls: win === p ? 'sp-win' : '' }) : GameKit.card(null, { label: '' }) }</div>`;
  };
  const seat = p => `<div class="sp-seat">${ _spWho(p) }<br>${ gt('bid') } <b>${ gs.bids[p] ?? '?' }</b> · ${ gt('won') } <b>${ gs.won[p] }</b></div>`;
  const tab = `<div class="sp-tab"><span></span><div>${ seat(2) }${ at(2) }</div><span></span><div>${ seat(1) }${ at(1) }</div><span></span><div>${ seat(3) }${ at(3) }</div><span></span><div>${ at(0) }${ seat(0) }</div><span></span></div>`;
  const hand = gs.hands[0].map((c, i) => `<button type="button" class="nk-cell sp-b${ L.includes(c) ? ' sp-ok' : '' }" onclick="spCard(${ i })" data-k="h${ c.r }_${ c.s }"${ i === 0 ? ' data-first' : '' } aria-label="${ _spName(c) }${ my && !L.includes(c) ? gt(', cannot be played now') : '' }"${ my && L.includes(c) ? '' : ' disabled' }>${ GameKit.card(c) }</button>`).join('');
  const bid = gs.phase === 'bid' && !gs.over ? `<div class="sp-bid" role="group" aria-label="${ gt('your bid') }">${ [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8
  ].map(n => NK.btn(String(n), `spBid(${ n })`, {
    k: 'b' + n,
    label: gt(`bid ${ n } tricks`)
  })).join('') }</div>` : '';
  const sc = `<div class="sp-sc"><span></span><b>${ gt('You + partner') }</b><b>${ gt('West + East') }</b><span>${ gt('Score') }</span><b>${ gs.score[0] }</b><b>${ gs.score[1] }</b><span>${ gt('Bags') }</span><b>${ gs.bags[0] }</b><b>${ gs.bags[1] }</b><span>${ gt('This hand') }</span><b>${ gs.won[0] + gs.won[2] } ${ gt('of') } ${ (gs.bids[0] ?? 0) + (gs.bids[2] ?? 0) }</b><b>${ gs.won[1] + gs.won[3] } ${ gt('of') } ${ (gs.bids[1] ?? 0) + (gs.bids[3] ?? 0) }</b></div>`;
  return `<div class="nk-top"><span>${ gt('Hand') } <b>${ gs.handNo }</b></span><span>${ gs.broken ? gt('Spades broken') : gt('Spades not broken') }</span><span>${ gt('Target:') } <b>${ gs.target }</b></span></div>
      <div class="gk-table sp-t">${ tab }<div class="sp-hand">${ hand }</div></div>
      ${ bid }${ NK.msg(gs.msg) }
      <div class="gk-btns">${ gs.phase === 'scored' && !gs.over ? NK.btn(gt('Next hand'), 'spNext()', {
    k: 'next',
    cls: 'gk-primary'
  }) : '' }${ NK.btn(NK.icon('rotate-ccw') + gt('New game'), 'spNew()', { k: 'restart' }) }</div>
      ${ sc }`;
}