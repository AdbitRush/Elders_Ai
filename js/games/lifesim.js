const _LS_ERAS = {
  young: {
    icon: '\uD83D\uDD7A',
    grad: 'linear-gradient(160deg,#3b0764,#9d174d,#f59e0b)',
    en: 'Play my 20-year-old self',
    scenes: [
      {
        e: '\uD83D\uDC83',
        en: 'Dance night in town! What do you do?',
        opts: [
          {
            en: 'Dance till sunrise',
            g: 1
          },
          {
            en: 'Sit on the side',
            g: 0
          },
          {
            en: 'Ask someone to dance',
            g: 1
          }
        ]
      },
      {
        e: '\uD83D\uDC8C',
        en: 'You got your first love letter...',
        opts: [
          {
            en: 'Reply the same evening',
            g: 1
          },
          {
            en: 'Too shy to answer',
            g: 0
          },
          {
            en: 'Keep it forever',
            g: 1
          }
        ]
      },
      {
        e: '\uD83C\uDF93',
        en: 'First job offer in the big city!',
        opts: [
          {
            en: 'Jump on it',
            g: 1
          },
          {
            en: 'Stay home',
            g: 0
          },
          {
            en: 'Ask mom first',
            g: 1
          }
        ]
      },
      {
        e: '\uD83C\uDFCD️',
        en: 'A friend offers a motorcycle ride...',
        opts: [
          {
            en: 'Hop on!',
            g: 1
          },
          {
            en: 'Only with a helmet',
            g: 1
          },
          {
            en: 'No way',
            g: 0
          }
        ]
      },
      {
        e: '\uD83C\uDFB8',
        en: 'Friends start a band. You...?',
        opts: [
          {
            en: 'Lead singer of course',
            g: 1
          },
          {
            en: 'On the drums',
            g: 1
          },
          {
            en: 'Just the audience',
            g: 0
          }
        ]
      },
      {
        e: '\uD83C\uDF0D',
        en: 'The big vacation \u2014 where to?',
        opts: [
          {
            en: 'Backpacking Europe',
            g: 1
          },
          {
            en: 'Stay and work',
            g: 0
          },
          {
            en: 'Dead Sea with friends',
            g: 1
          }
        ]
      }
    ]
  },
  old: {
    icon: '\uD83D\uDC75',
    grad: 'linear-gradient(160deg,#78350f,#b45309,#fcd34d)',
    en: 'Play grandma/grandpa for a day',
    scenes: [
      {
        e: '\uD83D\uDC68‍\uD83D\uDC69‍\uD83D\uDC67‍\uD83D\uDC66',
        en: 'The grandkids show up unannounced!',
        opts: [
          {
            en: 'Cookies from the freezer',
            g: 1
          },
          {
            en: 'Pretend not home',
            g: 0
          },
          {
            en: 'Tell an army story',
            g: 1
          }
        ]
      },
      {
        e: '\uD83D\uDCF1',
        en: 'The smartphone is "stuck" again...',
        opts: [
          {
            en: 'Turn it off and on',
            g: 1
          },
          {
            en: 'Smack it',
            g: 0
          },
          {
            en: 'Call the grandkid',
            g: 1
          }
        ]
      },
      {
        e: '\uD83E\uDDD3',
        en: 'Noon. The couch is calling...',
        opts: [
          {
            en: 'Sacred afternoon nap',
            g: 1
          },
          {
            en: 'Third coffee instead',
            g: 0
          },
          {
            en: 'Nap with the news on',
            g: 1
          }
        ]
      },
      {
        e: '\uD83E\uDD63',
        en: 'Granddaughter says the soup is "a bit salty"...',
        opts: [
          {
            en: '"That is how MY grandma made it!"',
            g: 1
          },
          {
            en: 'Add more salt',
            g: 0
          },
          {
            en: 'Let her cook next time',
            g: 1
          }
        ]
      },
      {
        e: '\uD83D\uDE8C',
        en: 'A young man offers you his bus seat.',
        opts: [
          {
            en: 'Smile and sit',
            g: 1
          },
          {
            en: '"I am younger at heart!"',
            g: 1
          },
          {
            en: 'Take offense',
            g: 0
          }
        ]
      },
      {
        e: '\uD83C\uDF05',
        en: '5 AM. Wide awake. Now what?',
        opts: [
          {
            en: 'Morning walk',
            g: 1
          },
          {
            en: 'Wake the kids by phone',
            g: 0
          },
          {
            en: 'Tea on the balcony',
            g: 1
          }
        ]
      }
    ]
  }
};
function initLifeSim(container) {
  const gs = gameState.lifesim;
  gs._stage = 'pick';
  _lsPick(container);
}
function _lsPick(container) {
  const isHe = false;
  let html = `<div class="max-w-2xl w-full text-center">
      <p class="text-xl font-bold mb-6 text-gray-200">${ Icon.ui('sparkles') } ${ gt('The time machine is ready. Where to?') }</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">`;
  for (const [k, era] of Object.entries(_LS_ERAS)) {
    html += `<button onclick="_lsStart('${ k }')" class="rounded-2xl p-8 text-white shadow-xl transition hover:scale-105"
          style="background:${ era.grad }">
          <div class="ls-ic text-6xl mb-3" style="animation:floaty 3s ease-in-out infinite">${ Icon.svg(Icon.name(era.icon), {
      size: '1em',
      sw: 1.8
    }) || era.icon }</div>
          <div class="text-xl font-bold">${ era.en }</div>
        </button>`;
  }
  container.innerHTML = html + '</div></div>';
}
function _lsStart(eraKey) {
  const gs = gameState.lifesim;
  const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  gs._era = eraKey;
  gs._scenes = shuffle([..._LS_ERAS[eraKey].scenes]).slice(0, _d === 'easy' ? 4 : _d === 'hard' ? 6 : 5);
  gs._si = 0;
  gs._hearts = 0;
  _lsScene(document.getElementById('gameContent'));
}
function _lsScene(container) {
  if (!gameState.active || gameState.currentId !== 'lifesim')
    return;
  const gs = gameState.lifesim, isHe = false;
  gs._locked = false;
  const era = _LS_ERAS[gs._era];
  if (gs._si >= gs._scenes.length) {
    gs._sessionScore = {
      correct: gs._hearts,
      total: gs._scenes.length
    };
    levelComplete();
    return;
  }
  const sc = gs._scenes[gs._si];
  let html = `<div class="max-w-2xl w-full text-center rounded-3xl p-8 md:p-10 shadow-2xl" style="background:${ era.grad }">
      <div class="flex justify-between text-sm font-bold text-white/80 mb-4">
        <span>${ Icon.ui(Icon.name(era.icon)) } ${ gs._si + 1 }/${ gs._scenes.length }</span>
        <span>${ Icon.ui('heart', {
    fill: true,
    fillOpacity: 1
  }).repeat(gs._hearts) || '\xB7' }</span>
      </div>
      <div class="ls-ic ls-scene text-7xl md:text-8xl mb-6" style="animation:floaty 3.4s ease-in-out infinite">${ Icon.svg(Icon.name(sc.e), {
    size: '1em',
    sw: 1.6
  }) || sc.e }</div>
      <p class="text-xl md:text-2xl font-bold text-white mb-8" style="text-shadow:0 2px 12px rgba(0,0,0,.4)">${ sc.en }</p>
      <div class="grid gap-3">`;
  shuffle([...sc.opts]).forEach(o => {
    html += `<button onclick="_lsChoose(${ o.g })" class="bg-white/95 text-gray-800 text-lg font-bold p-4 rounded-xl shadow-md transition hover:scale-[1.03] hover:bg-white">${ o.en }</button>`;
  });
  container.innerHTML = html + '</div></div>';
}
function _lsChoose(good) {
  const gs = gameState.lifesim, isHe = false;
  if (gs._locked)
    return;
  gs._locked = true;
  if (good) {
    sfxCorrect();
    gs._hearts++;
  } else
    sfxWrong();
  const c = document.getElementById('gameContent');
  const note = document.createElement('div');
  note.className = 'text-2xl font-black text-center mt-4';
  note.style.color = good ? '#4ade80' : '#fca5a5';
  note.innerHTML = good ? Icon.ui('heart', {
    fill: true,
    fillOpacity: 1
  }) + ' ' : '';
  note.append(good ? gt('A beautiful memory!') : gt('Also an experience...'));
  c.appendChild(note);
  gs._si++;
  setTimeout(() => _lsScene(c), good ? 900 : 1200);
}