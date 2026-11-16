const _AV_ROOM = {
  dock: {
    name: 'the dock',
    text: 'Waves slap the old wooden dock. Dark clouds pile up over the sea. A path climbs north toward the lighthouse; a cottage stands to the east.',
    exits: {
      north: 'path',
      east: 'cottage'
    }
  },
  cottage: {
    name: 'the keeper\'s cottage',
    text: 'The keeper\'s cottage is tidy and cold. A rag rug lies by the door, a cupboard stands against the wall, and a window looks out over the dock to the west.',
    exits: { west: 'dock' },
    things: [
      'rug',
      'cupboard'
    ]
  },
  path: {
    name: 'the cliff path',
    text: 'A windy path along the cliff. The lighthouse towers to the north. A small shed with a padlock sits to the east. The dock is back south.',
    exits: {
      north: 'base',
      south: 'dock',
      east: 'shed'
    }
  },
  shed: {
    name: 'the tool shed',
    text: 'Rakes, nets and paint pots crowd the shed. A wooden trapdoor in the floor leads down.',
    exits: {
      west: 'path',
      down: 'cellar'
    },
    things: ['shelf'],
    locked: true
  },
  cellar: {
    name: 'the cellar',
    text: 'A damp stone cellar. Barrels line the walls.',
    exits: { up: 'shed' },
    dark: true,
    things: ['barrels']
  },
  base: {
    name: 'the foot of the lighthouse',
    text: 'The great white tower rises above you. Iron stairs spiral up inside the open door. The path runs back south.',
    exits: {
      up: 'lamp',
      south: 'path'
    },
    things: ['logbook']
  },
  lamp: {
    name: 'the lamp room',
    text: 'At the top of the tower, wind howls around the glass. The great lamp sits in the middle, its oil tank dry and its wick cold.',
    exits: { down: 'base' },
    things: ['lamp']
  }
};
const _AV_ITEM = {
  key: 'small brass key',
  matches: 'box of matches',
  lantern: 'hand lantern',
  oil: 'can of lamp oil'
};
function initAdventure() {
  NK.start('adventure', {
    setup(gs, diff) {
      gs.diff = diff;
      gs.at = 'dock';
      gs.inv = [];
      gs.moves = 0;
      gs.hints = 0;
      gs.over = false;
      gs.flags = {};
      gs.log = [];
      const keyAt = shuffle([
        'rug',
        'cupboard',
        'logbook'
      ])[0];
      gs.hide = {
        key: keyAt,
        matches: shuffle([
          'rug',
          'cupboard'
        ].filter(x => x !== keyAt))[0]
      };
      gs.loose = {
        shelf: 'lantern',
        barrels: 'oil'
      };
      _avSay(gs, 'A storm is coming, and the lighthouse lamp is dark. The fishing boat is due tonight. ' + _avDesc(gs));
    },
    view: _avView,
    rules: gs => [
      'A storm is coming and the lighthouse lamp has gone out. <b>Light the lamp</b> before the fishing boat comes in.',
      'Tap a direction to walk. <b>Look around</b> describes where you are; <b>Look at</b> a thing to search it closely.',
      'Things you find can be <b>taken</b>; things you carry can be <b>used</b> in the right place.',
      gs.diff === 'hard' ? 'On this level the boat arrives after <b>45 moves</b>, and there are no hints.' : gs.diff === 'normal' ? 'Hints are there if you need them (each one is counted). No move limit.' : 'Tap Hint any time for a nudge. No move limit.',
      'No clock. Keyboard: Tab to a button, Enter to press it.'
    ],
    css: `.av-scene{margin:10px 0 0;border-radius:18px;overflow:hidden;border:4px solid #6b4a2b;background:#22303b;box-shadow:0 2px 0 #4a321c,0 10px 24px rgba(60,40,20,.18)}
.av-scene svg{display:block;width:100%;height:auto}
.av-scr{position:relative;margin:14px 0 0;background:linear-gradient(180deg,#fdf7e6,#f7ecd0);color:#2e2116;border-radius:16px;border-start-start-radius:6px;border-end-start-radius:6px;border:1px solid #dcc79c;border-inline-start:12px solid #7c4a21;padding:18px 22px 18px 26px;padding-inline:26px 22px;font:1.2rem/1.6 Georgia,'Times New Roman',serif;box-shadow:0 1px 0 #fff inset,0 8px 20px rgba(90,60,25,.14);min-height:11rem;text-align:start}
.av-scr::before{content:'';position:absolute;top:0;bottom:0;inset-inline-start:10px;width:2px;background:rgba(180,82,60,.35)}
.av-scr h3{color:#7c2d12;font:italic 700 1.6rem/1.25 Georgia,'Times New Roman',serif;margin:0;letter-spacing:.01em;text-transform:none}
.av-scr h3::first-letter{text-transform:uppercase;font-size:1.25em}
.av-fl{display:block;width:100%;max-width:300px;height:14px;margin:6px 0 10px;color:#b4523c}
.av-scr p{margin:0 0 8px}
.av-scr .av-old{color:#6b5a45;font-size:1.02rem;font-style:italic;opacity:1}
.av-scr .av-now{min-height:3.4em}
.av-scr .av-now>*{background:transparent;border:0;box-shadow:none;color:inherit;padding:0;margin:0;font:inherit;text-align:start}
.av-scr.av-night{background:linear-gradient(180deg,#2a2c36,#1f2129);color:#f6ecd6;border-color:#3b3e4b;border-inline-start-color:#14151b}
.av-scr.av-night h3{color:#f6c66a}
.av-scr.av-night .av-old{color:#c4b9a3}
.av-scr.av-night .av-fl{color:#f6c66a}
.av-sec{margin:14px 0 0;background:#fffaf0;border:1px solid #e7d7b5;border-radius:16px;padding:12px 14px 14px}
.av-sec .gk-label{color:#78350f;text-align:start;margin:0 0 8px;font-size:1.08rem;font-weight:800}
.av-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.av-found{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:14px;background:#fff3cf;border:2px dashed #d99a1c}
.av-found svg,.av-prop svg{width:52px;height:52px;flex:none;display:block}
.av-shelf{align-items:flex-end;gap:14px;min-height:74px;padding:12px 14px 12px;border-radius:12px 12px 6px 6px;background:linear-gradient(180deg,#fbf1da,#f1e0bd);border-bottom:12px solid #8a5a33;box-shadow:0 4px 0 #5f3c20,inset 0 -3px 0 rgba(95,60,32,.18)}
.av-shelf>span{font-size:1.08rem;color:#5b4630}
.av-prop{display:inline-flex;flex-direction:column;align-items:center;gap:6px;font-size:1rem}
@media (prefers-reduced-motion:no-preference){
.av-sway{animation:av-sway 8s ease-in-out infinite alternate}
.av-bob{animation:av-bob 5s ease-in-out infinite alternate}
.av-ring{animation:av-ring 3.2s ease-in-out infinite alternate}
.av-beam{transform-box:view-box;transform-origin:440px 32px;animation:av-beam 6s ease-in-out infinite alternate}
.av-glow{animation:av-ring 2.6s ease-in-out infinite alternate}
}
@keyframes av-sway{from{transform:translateX(-7px)}to{transform:translateX(7px)}}
@keyframes av-bob{from{transform:translateY(-1.2px)}to{transform:translateY(1.4px)}}
@keyframes av-ring{from{opacity:.6}to{opacity:1}}
@keyframes av-beam{from{transform:rotate(-2.5deg);opacity:.8}to{transform:rotate(2.5deg);opacity:1}}`
  });
}
function _avDesc(gs) {
  const R = _AV_ROOM[gs.at];
  if (R.dark && !gs.flags.lit)
    return `It is pitch dark down here in ${ R.name }. You can't see a thing. Better go back up.`;
  let t = R.text;
  if (gs.at === 'shed' && R.locked && !gs.flags.shedOpen)
    t = 'The shed door is fastened with a brass padlock.';
  return t;
}
function _avSay(gs, t) {
  if (gs.msg)
    gs.log.push(gs.msg);
  gs.log = gs.log.slice(-2);
  gs.msg = t;
}
function _avTick(gs) {
  gs.moves++;
  if (gs.diff === 'hard' && gs.moves >= 45 && !gs.over) {
    gs.over = true;
    _avSay(gs, 'Out in the dark the boat\'s horn sounds... and with no light to guide it, it turns back to sea. You did not make it in time.');
    NK.render('adventure');
    NK.finish('adventure', false, 'The boat could not find the harbor in time. A new game shuffles the hiding places.');
    return true;
  }
  return false;
}
function avGo(dir) {
  const gs = gameState.adventure;
  if (gs.over)
    return;
  const R = _AV_ROOM[gs.at], to = R.exits[dir];
  if (!to)
    return;
  gs.found = null;
  if (to === 'shed' && !gs.flags.shedOpen && !gs.inv.includes('key')) {
    _avSay(gs, 'The shed door is fastened with a brass padlock. You need a key.');
    if (_avTick(gs))
      return;
    return NK.render('adventure');
  }
  if (to === 'shed' && !gs.flags.shedOpen) {
    gs.flags.shedOpen = true;
    gs.inv = gs.inv.filter(x => x !== 'key');
    gs.at = 'shed';
    _avSay(gs, 'The brass key turns in the padlock with a click, and the shed door swings open. ' + _avDesc(gs));
  } else {
    gs.at = to;
    _avSay(gs, _avDesc(gs));
  }
  if (typeof sfxFlip === 'function')
    sfxFlip();
  if (_avTick(gs))
    return;
  NK.render('adventure');
}
function avLook() {
  const gs = gameState.adventure;
  if (gs.over)
    return;
  _avSay(gs, _avDesc(gs));
  NK.render('adventure');
}
function avExamine(th) {
  const gs = gameState.adventure;
  if (gs.over)
    return;
  let t = '';
  const hid = Object.keys(gs.hide).find(k => gs.hide[k] === th && !gs.flags['got_' + k]);
  const text = {
    rug: 'An old rag rug, braided from scraps.',
    cupboard: 'A pine cupboard with a stiff door.',
    logbook: 'The keeper\'s logbook lies on a stool. The last entry reads: \'Oil low. Spare cans in the cellar. Matches always dry in the cottage.\'',
    shelf: 'A dusty shelf of odds and ends.',
    barrels: 'Old barrels, mostly empty.',
    lamp: gs.flags.oiled ? 'The lamp tank is full of oil. Now the wick just needs a flame.' : 'The tank of the great lamp is bone dry.'
  }[th];
  t = text;
  if (hid) {
    t += ` Tucked ${ th === 'rug' ? 'underneath it' : th === 'cupboard' ? 'inside' : 'between its pages' } you find a ${ _AV_ITEM[hid] }!`;
    gs.found = hid;
  } else if (gs.loose[th] && !gs.flags['got_' + gs.loose[th]]) {
    t += ` There is a ${ _AV_ITEM[gs.loose[th]] } here.`;
    gs.found = gs.loose[th];
  } else
    gs.found = null;
  _avSay(gs, t);
  if (_avTick(gs))
    return;
  NK.render('adventure');
}
function avTake() {
  const gs = gameState.adventure;
  if (gs.over || !gs.found)
    return;
  const it = gs.found;
  gs.inv.push(it);
  gs.flags['got_' + it] = true;
  gs.found = null;
  if (typeof sfxFlip === 'function')
    sfxFlip();
  _avSay(gs, `You take the ${ _AV_ITEM[it] }.`);
  if (_avTick(gs))
    return;
  NK.render('adventure');
}
function avUse(it) {
  const gs = gameState.adventure;
  if (gs.over)
    return;
  let t;
  if (it === 'matches' && gs.inv.includes('lantern') && !gs.flags.lit && gs.at !== 'lamp') {
    gs.flags.lit = true;
    t = 'You strike a match and light the hand lantern. A warm glow fills the space around you.';
    if (gs.at === 'cellar')
      t += ' ' + _avDesc(gs);
  } else if (it === 'lantern')
    t = gs.flags.lit ? 'The lantern burns steadily.' : 'The lantern is not lit. You need a flame.';
  else if (it === 'oil' && gs.at === 'lamp') {
    gs.flags.oiled = true;
    gs.inv = gs.inv.filter(x => x !== 'oil');
    t = 'You pour the oil into the great lamp\'s tank until it is full.';
  } else if (it === 'matches' && gs.at === 'lamp') {
    if (!gs.flags.oiled)
      t = 'You strike a match, but the wick is dry: the lamp needs oil first. The match goes out.';
    else {
      gs.over = true;
      t = 'You touch the match to the wick. The great lamp blazes, and its beam sweeps across the stormy sea. Far out, the fishing boat\'s horn answers. It is coming home safely!';
      _avSay(gs, t);
      NK.render('adventure');
      if (typeof sfxCorrect === 'function')
        sfxCorrect();
      return NK.finish('adventure', true, `The lighthouse is lit in ${ gs.moves } moves${ gs.hints ? ` with ${ NK.pl(gs.hints, 'hint') }` : '' }. The boat comes home safely.`);
    }
  } else if (it === 'oil')
    t = 'This oil is for the great lamp at the top of the lighthouse.';
  else if (it === 'matches')
    t = gs.inv.includes('lantern') ? 'The lantern is already lit.' : 'You strike a match. It flickers and goes out. Something to light would help.';
  else if (it === 'key')
    t = 'A small brass key. It looks like it fits a padlock.';
  _avSay(gs, t);
  if (_avTick(gs))
    return;
  NK.render('adventure');
}
function avHint() {
  const gs = gameState.adventure;
  if (gs.over || gs.diff === 'hard')
    return;
  gs.hints++;
  const f = gs.flags, has = x => gs.inv.includes(x);
  const h = !f.shedOpen && !has('key') ? `Somewhere, a small key is hidden. Look closely at things: the ${ gs.hide.key }?` : !f.shedOpen ? 'The key opens the shed off the cliff path.' : !f.got_lantern ? 'Look at the shelf in the shed.' : !has('matches') && !f.lit ? `The logbook says the matches are kept dry. Try the ${ gs.hide.matches }.` : !f.lit ? 'Use the matches to light your lantern, then go down into the cellar.' : !f.got_oil ? 'Look at the barrels in the cellar.' : !f.oiled ? 'Carry the oil to the top of the lighthouse and use it there.' : 'Use the matches in the lamp room.';
  _avSay(gs, 'Hint: ' + h);
  NK.render('adventure');
}
function avNew() {
  initAdventure();
}
function _avView(gs) {
  const R = _AV_ROOM[gs.at], dark = R.dark && !gs.flags.lit;
  const flags = gs.flags || {}, carry = gs.inv || [], hard = gs.diff === 'hard';
  const lost = !!gs.over && hard && gs.moves >= 45, won = !!gs.over && !lost;
  const budget = hard ? Math.min(1, gs.moves / 45) : 0;
  const storm0 = lost ? 1 : hard ? 0.25 + 0.75 * budget : 0.3;
  const storm = won ? Math.min(storm0, 0.5) : storm0;
  const n1 = n => Math.round(n * 10) / 10;
  const mix = (a, b, t) => {
    t = Math.max(0, Math.min(1, t));
    return '#' + [
      1,
      3,
      5
    ].map(i => Math.round(parseInt(a.substr(i, 2), 16) * (1 - t) + parseInt(b.substr(i, 2), 16) * t).toString(16).padStart(2, '0')).join('');
  };
  const dim = c => mix(c, '#1c2028', (won ? 0.5 : storm) * 0.62);
  const prop = x => {
    const lit = !!flags.lit;
    const art = {
      key: '<circle cx="14" cy="24" r="7.5" fill="none" stroke="#8a6212" stroke-width="7"/><circle cx="14" cy="24" r="7.5" fill="none" stroke="#e0ad38" stroke-width="4"/><path d="M21 24H43M36 24v8M43 24v7" fill="none" stroke="#8a6212" stroke-width="7" stroke-linecap="round"/><path d="M21 24H43M36 24v8M43 24v7" fill="none" stroke="#e0ad38" stroke-width="4" stroke-linecap="round"/>',
      matches: '<rect x="6" y="17" width="34" height="22" rx="3" fill="#a8392c" stroke="#5e1f18" stroke-width="2"/><rect x="11" y="22" width="24" height="12" rx="2" fill="#f8ebcb"/><path d="M15 28h16" stroke="#a8392c" stroke-width="2.5" stroke-linecap="round"/><path d="M24 15L39 6" stroke="#d8b377" stroke-width="3.5" stroke-linecap="round"/><circle cx="40.5" cy="5.5" r="3.6" fill="#c2402f"/>',
      lantern: (lit ? '<circle class="av-glow" cx="24" cy="28" r="21" fill="#ffd35a" opacity=".38"/>' : '') + '<path d="M16 14Q24 1 32 14" fill="none" stroke="#3f454d" stroke-width="3" stroke-linecap="round"/><rect x="17" y="12" width="14" height="6" rx="2" fill="#3f454d"/><rect x="14" y="18" width="20" height="21" rx="5" fill="' + (lit ? '#ffe08a' : '#d5dce2') + '" stroke="#3f454d" stroke-width="2.5"/>' + (lit ? '<path d="M24 36q-6-6 0-13q6 7 0 13z" fill="#ee8423"/>' : '<path d="M24 36v-7" stroke="#6b7480" stroke-width="2.5" stroke-linecap="round"/>') + '<rect x="12" y="38" width="24" height="6" rx="2" fill="#3f454d"/>',
      oil: '<path d="M33 27L44 13" stroke="#3f5a66" stroke-width="5" stroke-linecap="round"/><rect x="15" y="12" width="11" height="8" rx="2" fill="#3f5a66"/><rect x="8" y="19" width="26" height="24" rx="4" fill="#5f8190" stroke="#2f4650" stroke-width="2"/><rect x="8" y="27" width="26" height="8" fill="#f2c14e"/><path d="M44 5q4 6 0 8q-4-2 0-8z" fill="#d99a1c"/>'
    }[x] || '';
    return `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${ art }</svg>`;
  };
  const scene = (() => {
    const sky = won ? [
      '#172040',
      '#2c3962',
      '#6f7396'
    ] : [
      mix('#51648c', '#151a26', storm),
      mix('#b98a86', '#2b323f', storm),
      mix('#f3c58a', '#474e5c', storm)
    ];
    const cloudCol = won ? '#56607f' : mix('#efe1cf', '#363c49', Math.min(1, storm * 1.15));
    const clouds = [
      [
        70,
        46,
        1,
        0
      ],
      [
        230,
        30,
        0.8,
        0
      ],
      [
        330,
        62,
        0.9,
        0.35
      ],
      [
        140,
        76,
        1.2,
        0.5
      ],
      [
        262,
        60,
        1.25,
        0.62
      ],
      [
        390,
        34,
        1.15,
        0.72
      ],
      [
        30,
        24,
        1.4,
        0.82
      ],
      [
        455,
        78,
        1,
        0.9
      ]
    ].filter(c => storm >= c[3]).map(c => `<g transform="translate(${ c[0] } ${ c[1] }) scale(${ c[2] })" opacity="${ n1(0.7 + 0.25 * storm) }"><ellipse rx="46" ry="14"/><ellipse cx="-22" cy="-9" rx="22" ry="13"/><ellipse cx="10" cy="-13" rx="26" ry="16"/><ellipse cx="34" cy="-5" rx="18" ry="10"/></g>`).join('');
    let rain = '';
    if (storm > 0.6) {
      for (let i = 0; i < 30; i++) {
        const x = (i * 53 + 17) % 480, y = i * 37 % 150 + 6;
        rain += `M${ x } ${ y }l-5 15`;
      }
      rain = `<path d="${ rain }" stroke="#d5dfec" stroke-width="1.2" stroke-linecap="round" opacity="${ n1((storm - 0.6) * 1.4) }"/>`;
    }
    const stars = won ? [
      [
        40,
        22
      ],
      [
        118,
        14
      ],
      [
        190,
        40
      ],
      [
        262,
        18
      ],
      [
        322,
        34
      ],
      [
        84,
        58
      ]
    ].map(p => `<circle cx="${ p[0] }" cy="${ p[1] }" r="1.3" fill="#fff6dc" opacity=".8"/>`).join('') : '';
    const crest = mix('#e6f1f3', '#8d9faa', storm);
    const wave = (y, amp, len, off, fill, cls) => {
      let d = `M${ off - len } ${ y }`;
      for (let x = off - len; x < 480 + len; x += len)
        d += `q${ len / 4 } ${ n1(-amp) } ${ len / 2 } 0t${ len / 2 } 0`;
      return `<path${ cls ? ` class="${ cls }"` : '' } d="${ d }V270H${ off - len }Z" fill="${ fill }" stroke="${ crest }" stroke-width="1.5" stroke-opacity=".5"/>`;
    };
    const amp = 2.5 + 6 * storm, sea = won ? 0.72 : storm;
    const boat = won ? {
      x: 104,
      y: 196,
      k: 1.3,
      f: 1
    } : lost ? {
      x: 62,
      y: 176,
      k: 1,
      f: -1
    } : {
      x: 34 + 106 * budget,
      y: 168 + 22 * budget,
      k: 0.85 + 0.45 * budget,
      f: 1
    };
    const boatSvg = `<g class="av-bob"><g transform="translate(${ n1(boat.x) } ${ n1(boat.y) }) scale(${ n1(boat.k * boat.f) } ${ n1(boat.k) })"><path d="M2 -8V-23" stroke="#3a2a20" stroke-width="1.6"/><path d="M4 -21L15 -10H4Z" fill="${ dim('#f1e3c4') }"/><rect x="-8" y="-8" width="10" height="8" rx="1" fill="${ dim('#f4ead4') }"/><rect x="-6" y="-6" width="3.5" height="3" fill="${ won ? '#ffd35a' : '#40505c' }"/><path d="M-19 -1H19L13 8H-14Z" fill="${ dim('#8e4631') }"/><path d="M-19 -1H19" stroke="${ dim('#f4ead4') }" stroke-width="1.6"/><circle cx="2" cy="-24" r="${ won ? 2.6 : 1.8 }" fill="${ won ? '#ffd35a' : '#c9a24a' }"/>${ won ? '<circle class="av-glow" cx="2" cy="-24" r="7" fill="#ffd35a" opacity=".4"/>' : '' }<path d="M-24 7q6-3 12 0t12 0t12 0t12 0" fill="none" stroke="${ crest }" stroke-width="1.6" stroke-linecap="round" opacity=".8"/></g></g>`;
    const rock = dim('#4c4640'), rocks = `<path d="M104 244q4-12 13-11q9 0 11 11z M134 250q3-9 11-8q8 1 9 8z M84 250q2-7 8-6q6 0 7 6z" fill="${ rock }"/>`;
    const wood = dim('#8a5a33'), woodDk = dim('#5f3c20');
    const dock = `<path d="M138 216V238M158 216V238M178 216V238" stroke="${ woodDk }" stroke-width="3.5" stroke-linecap="round"/><rect x="130" y="212" width="66" height="5" rx="1.5" fill="${ wood }"/><path d="M142 212v5M154 212v5M166 212v5M178 212v5" stroke="${ woodDk }" stroke-width="1"/>`;
    const winGold = won ? '#ffd35a' : dim('#42505d');
    const cottage = `<rect x="262" y="166" width="7" height="14" fill="${ dim('#8c4a36') }"/><rect x="222" y="184" width="52" height="32" fill="${ dim('#f1e4ca') }"/><path d="M215 187L248 163L281 187Z" fill="${ dim('#9a4f39') }"/><rect x="231" y="194" width="11" height="22" rx="1" fill="${ dim('#6b4226') }"/><rect x="251" y="192" width="14" height="11" fill="${ winGold }" stroke="${ dim('#6b4226') }" stroke-width="1.5"/><path d="M258 192v11" stroke="${ dim('#6b4226') }" stroke-width="1"/>`;
    const shedOpen = !!flags.shedOpen;
    const shed = `<rect x="340" y="146" width="40" height="44" fill="${ dim('#b08a5e') }"/><path d="M350 146v44M370 146v44" stroke="${ dim('#8d6a44') }" stroke-width="1"/><path d="M333 149L360 131L387 149Z" fill="${ dim('#5d4636') }"/><rect x="353" y="155" width="14" height="34" fill="${ shedOpen ? '#1d1712' : dim('#7a5a3c') }"/>${ shedOpen ? `<path d="M353 155l-7 3v30l7 1z" fill="${ dim('#7a5a3c') }"/>` : `<path d="M357.5 167v-3a2.5 2.5 0 0 1 5 0v3" fill="none" stroke="#8a6212" stroke-width="1.6"/><rect x="355.5" y="166.5" width="9" height="7.5" rx="1.5" fill="#e6b53c" stroke="#8a6212" stroke-width="1"/>` }`;
    const land = dim('#7a6a58'), grass = dim('#86a25f');
    const top = 'M174 228Q182 216 198 214L290 210L330 186L392 166L402 148Q408 134 424 132L480 130';
    const island = `<path d="${ top }V270H166Z" fill="${ land }"/><path d="M400 160l-4 30M416 150l-3 44M452 146l2 52M300 214l-3 26M250 220l2 24" stroke="${ dim('#5e5144') }" stroke-width="1.5" stroke-linecap="round" opacity=".7"/><path d="${ top }" fill="none" stroke="${ grass }" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M200 213L290 209L330 185L392 165L402 147L420 133" fill="none" stroke="${ dim('#f0e0b8') }" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 7" opacity=".85"/>`;
    const cellarLit = !!flags.lit && gs.at === 'cellar';
    const cellar = shedOpen ? `<rect x="340" y="192" width="44" height="34" rx="7" fill="${ cellarLit ? '#6b4d2a' : '#14110e' }" stroke="${ dim('#3d342c') }" stroke-width="2"/><path d="M357 176V224M364 176V224M357 184h7M357 194h7M357 204h7M357 214h7" stroke="${ cellarLit ? '#d9b27a' : '#6d5a44' }" stroke-width="1.6"/>${ flags.got_oil && !cellarLit ? '' : `<g opacity="${ cellarLit ? 1 : 0.35 }"><rect x="369" y="208" width="11" height="16" rx="3" fill="#9a6b3c"/><path d="M369 213h11M369 219h11" stroke="#4d3520" stroke-width="1.4"/></g>` }` : '';
    const hw = y => 18 - (132 - y) * 7 / 88, band = (a, b) => `<path d="M${ n1(440 - hw(a)) } ${ a }H${ n1(440 + hw(a)) }L${ n1(440 + hw(b)) } ${ b }H${ n1(440 - hw(b)) }Z" fill="${ dim('#b9523c') }"/>`;
    const white = won ? '#f1e6cf' : dim('#fbf6ea');
    const glass = won ? '#ffe08a' : '#3a4753';
    const beam = won ? `<g class="av-beam"><path d="M440 28L-20 -12V76L440 37Z" fill="url(#av-beam)"/><path d="M440 29L500 20V46L440 36Z" fill="#ffe08a" opacity=".5"/></g><circle class="av-glow" cx="440" cy="32" r="34" fill="url(#av-halo)"/>` : '';
    const tower = `<path d="M422 132H458L451 44H429Z" fill="${ white }"/>${ band(60, 76) }${ band(94, 108) }<path d="M447 132L443 44H451L458 132Z" fill="#1c2028" opacity=".14"/><path d="M434 132v-11a6 6 0 0 1 12 0v11z" fill="${ dim('#4d3324') }"/><rect x="437" y="81" width="6" height="9" rx="3" fill="${ winGold }"/><rect x="411" y="40" width="58" height="4.5" rx="1" fill="${ dim('#3a3f48') }"/><path d="M413 40v-8M421 40v-8M459 40v-8M467 40v-8M412 32h18M450 32h18" stroke="${ dim('#3a3f48') }" stroke-width="1.3" fill="none"/><rect x="430" y="23" width="20" height="17" fill="${ glass }" stroke="${ dim('#3a3f48') }" stroke-width="1.6"/>${ flags.oiled && !won ? '<rect x="431" y="34.5" width="18" height="4.7" fill="#d2912c"/>' : '' }<path d="M436.7 23v17M443.3 23v17" stroke="${ dim('#3a3f48') }" stroke-width="1.1"/><path d="M426 24L440 9L454 24Z" fill="${ dim('#9a4f39') }"/><circle cx="440" cy="8" r="2.2" fill="${ dim('#3a3f48') }"/>`;
    const shine = won ? `<path d="M30 206h70M60 222h90M20 236h60M120 186h50" stroke="#ffd35a" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>` : '';
    const spot = {
      dock: [
        160,
        213
      ],
      cottage: [
        205,
        214
      ],
      path: [
        311,
        198
      ],
      shed: [
        331,
        186
      ],
      cellar: [
        350,
        224
      ],
      base: [
        408,
        133
      ],
      lamp: [
        418,
        40
      ]
    }[gs.at] || [
      160,
      213
    ];
    const hasLantern = carry.includes('lantern'), lanternLit = hasLantern && !!flags.lit;
    const keeper = `<g transform="translate(${ spot[0] } ${ spot[1] })${ gs.at === 'lamp' ? ' scale(-1 1)' : '' }"><circle class="av-ring" cy="-14" r="20" fill="#fff4d6" fill-opacity="${ dark ? 0.1 : 0.2 }" stroke="#fff4d6" stroke-width="1.8" stroke-dasharray="4 4"/>${ lanternLit ? '<circle class="av-glow" cx="9" cy="-10" r="13" fill="#ffd35a" opacity=".5"/>' : '' }<path d="M-2.6 0V-9M2.6 0V-9" stroke="#262a33" stroke-width="3" stroke-linecap="round"/><path d="M-6.5 -8H6.5L4.5 -21H-4.5Z" fill="#e3a724" stroke="#8a5f0c" stroke-width="1"/><circle cy="-24.5" r="4.3" fill="#f0c7a2"/><path d="M-7 -25.5Q0 -35 7 -25.5Z" fill="#e3a724" stroke="#8a5f0c" stroke-width="1"/>${ hasLantern ? `<path d="M5 -17L9 -13" stroke="#e3a724" stroke-width="2.6" stroke-linecap="round"/><rect x="6.8" y="-13" width="5" height="7" rx="1.4" fill="${ lanternLit ? '#ffe08a' : '#69727d' }" stroke="#262a33" stroke-width="1"/>` : '' }</g>`;
    return `<div class="av-scene" aria-hidden="true"><svg viewBox="0 0 480 250" focusable="false">
<defs><linearGradient id="av-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ sky[0] }"/><stop offset=".6" stop-color="${ sky[1] }"/><stop offset="1" stop-color="${ sky[2] }"/></linearGradient><linearGradient id="av-beam" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#ffe08a" stop-opacity=".75"/><stop offset="1" stop-color="#ffe08a" stop-opacity=".08"/></linearGradient><radialGradient id="av-halo"><stop offset="0" stop-color="#fff0b8" stop-opacity=".95"/><stop offset="1" stop-color="#ffd35a" stop-opacity="0"/></radialGradient></defs>
<rect width="480" height="152" fill="url(#av-sky)"/>${ stars }<g fill="${ cloudCol }">${ clouds }</g>${ rain }
<rect y="150" width="480" height="100" fill="${ mix('#7fa3ad', '#2b3945', sea) }"/>${ wave(164, amp * 0.5, 60, -10, mix('#6f97a3', '#27353f', sea)) }${ wave(184, amp * 0.75, 76, -30, mix('#5b8695', '#212f39', sea)) }${ shine }${ boatSvg }${ wave(212, amp, 92, -20, mix('#48727f', '#1a2730', sea), 'av-sway') }
${ dock }${ cottage }${ shed }${ beam }${ tower }${ island }${ cellar }${ rocks }${ keeper }${ wave(240, amp * 1.15, 110, -50, mix('#375f6d', '#131e26', sea), 'av-sway') }
</svg></div>`;
  })();
  const flourish = '<svg class="av-fl" viewBox="0 0 300 14" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><path d="M4 7H132M168 7H296" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".7"/><path d="M150 1l6 6-6 6-6-6z" fill="currentColor"/><circle cx="138" cy="7" r="1.8" fill="currentColor"/><circle cx="162" cy="7" r="1.8" fill="currentColor"/></svg>';
  const exits = Object.keys(R.exits).map(d => NK.btn((d === 'up' ? NK.icon('arrow-up') : d === 'down' ? NK.icon('arrow-down') : d === 'north' ? NK.icon('arrow-up') : d === 'south' ? NK.icon('arrow-down') : d === 'east' ? NK.icon('arrow-right') : NK.icon('arrow-left')) + `${ d[0].toUpperCase() + d.slice(1) } to ${ _AV_ROOM[R.exits[d]].name.replace(/^the /, '') }`, `avGo('${ d }')`, {
    k: 'go' + d,
    disabled: gs.over
  })).join('');
  const things = dark ? '' : (R.things || []).map(t => NK.btn(`Look at the ${ t === 'logbook' ? 'logbook' : t }`, `avExamine('${ t }')`, {
    k: 'x' + t,
    disabled: gs.over
  })).join('');
  const take = gs.found ? `<span class="av-found">${ prop(gs.found) }${ NK.btn(`Take the ${ _AV_ITEM[gs.found] }`, 'avTake()', {
    k: 'take',
    cls: 'gk-primary',
    disabled: gs.over
  }) }</span>` : '';
  const inv = gs.inv.map(x => `<span class="av-prop">${ prop(x) }${ NK.btn(`Use the ${ _AV_ITEM[x] }`, `avUse('${ x }')`, {
    k: 'use' + x,
    disabled: gs.over
  }) }</span>`).join('');
  return `<div class="nk-top"><span>Moves: <b>${ gs.moves }</b>${ gs.diff === 'hard' ? ' of 45' : '' }</span>${ gs.diff === 'hard' ? '' : `<span>Hints: <b>${ gs.hints }</b></span>` }</div>
      ${ scene }
      <div class="av-scr${ dark ? ' av-night' : '' }"><h3>${ R.name }</h3>${ flourish }${ gs.log.map(t => `<p class="av-old">${ t }</p>`).join('') }<div class="av-now">${ NK.msg(gs.msg) }</div></div>
      <div class="av-sec"><div class="gk-label">Go</div><div class="av-row">${ exits }</div></div>
      <div class="av-sec"><div class="gk-label">Here</div><div class="av-row">${ NK.btn(NK.icon('eye') + 'Look around', 'avLook()', {
    k: 'look',
    disabled: gs.over
  }) }${ things }${ take }</div></div>
      <div class="av-sec"><div class="gk-label">You carry</div><div class="av-row av-shelf">${ inv || '<span>Nothing yet.</span>' }</div></div>
      <div class="gk-btns">${ gs.diff === 'hard' ? '' : NK.btn(NK.icon('lightbulb') + 'Hint', 'avHint()', {
    k: 'hint',
    disabled: gs.over
  }) }${ NK.btn(NK.icon('rotate-ccw') + 'New game', 'avNew()', { k: 'restart' }) }</div>`;
}