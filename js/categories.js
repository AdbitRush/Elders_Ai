const Categories = (() => {
  const SKILL_COLORS = {
    memory: {
      bg: '#ede9fe',
      color: '#6d28d9',
      label_en: 'Memory'
    },
    focus: {
      bg: '#e0f2fe',
      color: '#0369a1',
      label_en: 'Focus'
    },
    perception: {
      bg: '#fce7f3',
      color: '#9d174d',
      label_en: 'Perception'
    },
    attention: {
      bg: '#dbeafe',
      color: '#1e40af',
      label_en: 'Attention'
    },
    arithmetic: {
      bg: '#dcfce7',
      color: '#166534',
      label_en: 'Arithmetic'
    },
    speed: {
      bg: '#fff7ed',
      color: '#c2410c',
      label_en: 'Speed'
    },
    language: {
      bg: '#f0fdf4',
      color: '#15803d',
      label_en: 'Language'
    },
    sequence: {
      bg: '#fef9c3',
      color: '#a16207',
      label_en: 'Sequence'
    },
    logic: {
      bg: '#f5f3ff',
      color: '#7c3aed',
      label_en: 'Logic'
    },
    planning: {
      bg: '#fff1f2',
      color: '#be123c',
      label_en: 'Planning'
    },
    spatial: {
      bg: '#ecfdf5',
      color: '#065f46',
      label_en: 'Spatial'
    },
    vocabulary: {
      bg: '#faf5ff',
      color: '#6b21a8',
      label_en: 'Vocabulary'
    },
    knowledge: {
      bg: '#fffbeb',
      color: '#92400e',
      label_en: 'Knowledge'
    },
    geography: {
      bg: '#e0f2fe',
      color: '#0c4a6e',
      label_en: 'Geography'
    },
    recall: {
      bg: '#fdf2f8',
      color: '#9d174d',
      label_en: 'Recall'
    },
    pattern: {
      bg: '#ecfdf5',
      color: '#064e3b',
      label_en: 'Pattern'
    },
    spelling: {
      bg: '#fff7ed',
      color: '#9a3412',
      label_en: 'Spelling'
    }
  };
  const MAP = {
    memory: [
      'memory',
      'focus'
    ],
    oddoneout: [
      'perception',
      'attention'
    ],
    math: [
      'arithmetic',
      'speed'
    ],
    wordsearch: [
      'language',
      'focus'
    ],
    sequence: [
      'memory',
      'sequence'
    ],
    sudoku: [
      'logic',
      'planning'
    ],
    shapes: [
      'spatial',
      'perception'
    ],
    solitaire: [
      'arithmetic',
      'planning'
    ],
    trivia: [
      'knowledge',
      'recall'
    ],
    numseq: [
      'logic',
      'pattern'
    ],
    unscramble: [
      'language',
      'spelling'
    ],
    pairs: [
      'language',
      'vocabulary'
    ],
    truefalse: [
      'knowledge',
      'recall'
    ],
    flags: [
      'knowledge',
      'geography'
    ],
    proverbs: [
      'language',
      'memory'
    ],
    hangman: [
      'language',
      'vocabulary'
    ],
    recall: [
      'memory',
      'attention'
    ],
    blocks: [
      'spatial',
      'planning'
    ],
    klondike: [
      'planning',
      'memory'
    ],
    colormatch: [
      'attention',
      'speed'
    ],
    digitspan: [
      'memory',
      'sequence'
    ],
    clock: [
      'perception',
      'logic'
    ],
    counting: [
      'speed',
      'attention'
    ],
    category: [
      'language',
      'logic'
    ],
    letters: [
      'language',
      'spelling'
    ],
    lifesim: [
      'planning',
      'sequence'
    ],
    safari: [
      'perception',
      'attention'
    ]
  };
  (window.NEW_GAMES || []).forEach(g => {
    MAP[g.id] = g.skills;
  });
  const WHY = {
    en: {
      memory: 'Turning cards face down forces you to hold their positions in mind.',
      oddoneout: 'Spotting the one detail that breaks a pattern.',
      math: 'Quick mental arithmetic, under mild time pressure.',
      wordsearch: 'Systematic visual scanning \u2014 the skill behind finding things quickly.',
      sequence: 'Holding a sequence in mind and repeating it.',
      sudoku: 'Pure deduction: every number you place rules others out.',
      shapes: 'Matching a shape to its slot uses spatial perception.',
      solitaire: 'Adding to a target while planning which cards to keep.',
      trivia: 'Bringing back facts you already know.',
      numseq: 'Finding the rule behind a sequence is pattern reasoning.',
      unscramble: 'Rearranging letters into a word uses spelling and word-finding.',
      pairs: 'Finding the word with the opposite meaning.',
      truefalse: 'Quick judgement against what you know, with no multiple-choice hints.',
      flags: 'Linking a picture to a name \u2014 visual memory plus general knowledge.',
      proverbs: 'Completing a familiar phrase draws on long-stored language.',
      hangman: 'Guessing letters from a partial word is word-finding under constraint.',
      recall: 'Look, then reproduce \u2014 short-term visual memory, directly.',
      blocks: 'Rotating shapes to fit is mental rotation plus planning ahead.',
      klondike: 'Holding several possible moves in mind and choosing an order.',
      colormatch: 'Naming the color and not the word.',
      digitspan: 'Remembering a number and typing it back.',
      clock: 'Reading a dial turns a position into a number.',
      counting: 'Counting quickly and accurately under time pressure.',
      category: 'Sorting things into groups is how meaning is organized.',
      letters: 'Finding the missing letter uses spelling and the shape of the word.',
      lifesim: 'Putting steps into a sensible order is everyday planning.',
      safari: 'Searching a busy scene for a target.'
    }
  };
  (window.NEW_GAMES || []).forEach(g => {
    WHY.en[g.id] = g.why;
  });
  function whyFor(gameId) {
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'he';
    return WHY[lang] && WHY[lang][gameId] || WHY.en[gameId] || '';
  }
  const SKILL_L10N = {};
  function badgesFor(gameId) {
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'he';
    const skills = MAP[gameId] || [];
    return skills.map(sk => {
      const meta = SKILL_COLORS[sk] || {
        bg: '#f1f5f9',
        color: '#475569',
        label_en: sk
      };
      const label = SKILL_L10N[lang] && SKILL_L10N[lang][sk] || meta.label_en;
      return `<span class="skill-tag" style="background:${ meta.bg };color:${ meta.color }">${ label }</span>`;
    }).join('');
  }
  function skillsFor(gameId) {
    return MAP[gameId] || [];
  }
  function filterBySkill(skill) {
    return Object.entries(MAP).filter(([, skills]) => skills.includes(skill)).map(([id]) => id);
  }
  function injectAllBadges() {
    Object.keys(MAP).forEach(id => {
      const card = document.querySelector(`.premium-card[onclick="loadGame('${ id }')"]`);
      if (!card)
        return;
      let badgeRow = card.querySelector('.skill-badges');
      if (!badgeRow) {
        badgeRow = document.createElement('div');
        badgeRow.className = 'skill-badges';
        badgeRow.style.cssText = 'padding:0 1.25rem 0.75rem;display:flex;gap:4px;flex-wrap:wrap;';
        const p = card.querySelector('p');
        if (p && p.parentNode)
          p.parentNode.insertBefore(badgeRow, p.nextSibling);
      }
      badgeRow.innerHTML = badgesFor(id);
      let whyRow = card.querySelector('.why-line');
      if (!whyRow) {
        whyRow = document.createElement('div');
        whyRow.className = 'why-line';
        whyRow.style.cssText = 'padding:0 1.25rem 1rem;font-size:0.78rem;line-height:1.5;color:#6b7280;' + 'border-top:1px solid rgba(0,0,0,0.06);margin-top:2px;padding-top:8px;';
        badgeRow.parentNode.insertBefore(whyRow, badgeRow.nextSibling);
      }
      const why = whyFor(id);
      whyRow.textContent = why || '';
      if (why && typeof Icon !== 'undefined')
        whyRow.insertAdjacentHTML('afterbegin', Icon.ui('brain', { cls: 'lc-ui lc-why' }) + ' ');
      whyRow.style.display = why ? '' : 'none';
    });
  }
  return {
    badgesFor,
    skillsFor,
    filterBySkill,
    injectAllBadges,
    whyFor
  };
})();