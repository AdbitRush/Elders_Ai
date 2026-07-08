// ═══════════════════════════════════════════════════════════════════════════════
// GAME CATEGORIES & COGNITIVE SKILL TAGS  (js/categories.js)
// Lets each game card show colored skill badges.
// Usage: Categories.badgesFor('memory')   → HTML string of pill badges
//        Categories.filterBySkill('memory') → array of game ids
// ═══════════════════════════════════════════════════════════════════════════════

const Categories = (() => {
  // Skill → color mapping
  const SKILL_COLORS = {
    memory:     { bg: '#ede9fe', color: '#6d28d9', label_he: 'זיכרון',   label_en: 'Memory' },
    focus:      { bg: '#e0f2fe', color: '#0369a1', label_he: 'מיקוד',    label_en: 'Focus' },
    perception: { bg: '#fce7f3', color: '#9d174d', label_he: 'תפיסה',    label_en: 'Perception' },
    attention:  { bg: '#dbeafe', color: '#1e40af', label_he: 'קשב',      label_en: 'Attention' },
    arithmetic: { bg: '#dcfce7', color: '#166534', label_he: 'חשבון',    label_en: 'Arithmetic' },
    speed:      { bg: '#fff7ed', color: '#c2410c', label_he: 'מהירות',   label_en: 'Speed' },
    language:   { bg: '#f0fdf4', color: '#15803d', label_he: 'שפה',      label_en: 'Language' },
    sequence:   { bg: '#fef9c3', color: '#a16207', label_he: 'רצף',      label_en: 'Sequence' },
    logic:      { bg: '#f5f3ff', color: '#7c3aed', label_he: 'לוגיקה',   label_en: 'Logic' },
    planning:   { bg: '#fff1f2', color: '#be123c', label_he: 'תכנון',    label_en: 'Planning' },
    spatial:    { bg: '#ecfdf5', color: '#065f46', label_he: 'מרחבי',    label_en: 'Spatial' },
    vocabulary: { bg: '#faf5ff', color: '#6b21a8', label_he: 'אוצר מילים', label_en: 'Vocabulary' },
    knowledge:  { bg: '#fffbeb', color: '#92400e', label_he: 'ידע',      label_en: 'Knowledge' },
    geography:  { bg: '#e0f2fe', color: '#0c4a6e', label_he: 'גאוגרפיה', label_en: 'Geography' },
    recall:     { bg: '#fdf2f8', color: '#9d174d', label_he: 'שחזור',    label_en: 'Recall' },
    pattern:    { bg: '#ecfdf5', color: '#064e3b', label_he: 'דפוס',     label_en: 'Pattern' },
    spelling:   { bg: '#fff7ed', color: '#9a3412', label_he: 'כתיב',     label_en: 'Spelling' },
  };

  const MAP = {
    memory:     ['memory', 'focus'],
    oddoneout:  ['perception', 'attention'],
    math:       ['arithmetic', 'speed'],
    wordsearch: ['language', 'focus'],
    simon:      ['memory', 'sequence'],
    sudoku:     ['logic', 'planning'],
    shapes:     ['spatial', 'perception'],
    solitaire:  ['arithmetic', 'planning'],
    trivia:     ['knowledge', 'recall'],
    numseq:     ['logic', 'pattern'],
    unscramble: ['language', 'spelling'],
    pairs:      ['language', 'vocabulary'],
    truefalse:  ['knowledge', 'recall'],
    flags:      ['knowledge', 'geography'],
    proverbs:   ['language', 'memory'],
    hangman:    ['language', 'vocabulary'],
    recall:     ['memory', 'attention'],
    tetris:     ['spatial', 'planning'],
  };

  // Native skill labels for es/fr/de/el (he/en live in SKILL_COLORS)
  const SKILL_L10N = {
    es: { memory:'Memoria', focus:'Concentración', perception:'Percepción', attention:'Atención', arithmetic:'Cálculo', speed:'Rapidez', language:'Lenguaje', sequence:'Secuencia', logic:'Lógica', planning:'Planificación', spatial:'Espacial', vocabulary:'Vocabulario', knowledge:'Conocimiento', geography:'Geografía', recall:'Recuerdo', pattern:'Patrones', spelling:'Ortografía' },
    fr: { memory:'Mémoire', focus:'Concentration', perception:'Perception', attention:'Attention', arithmetic:'Calcul', speed:'Vitesse', language:'Langue', sequence:'Séquence', logic:'Logique', planning:'Planification', spatial:'Spatial', vocabulary:'Vocabulaire', knowledge:'Culture', geography:'Géographie', recall:'Rappel', pattern:'Motifs', spelling:'Orthographe' },
    de: { memory:'Gedächtnis', focus:'Konzentration', perception:'Wahrnehmung', attention:'Aufmerksamkeit', arithmetic:'Rechnen', speed:'Tempo', language:'Sprache', sequence:'Reihenfolge', logic:'Logik', planning:'Planung', spatial:'Räumlich', vocabulary:'Wortschatz', knowledge:'Wissen', geography:'Geografie', recall:'Erinnern', pattern:'Muster', spelling:'Rechtschreibung' },
    el: { memory:'Μνήμη', focus:'Συγκέντρωση', perception:'Αντίληψη', attention:'Προσοχή', arithmetic:'Αριθμητική', speed:'Ταχύτητα', language:'Γλώσσα', sequence:'Ακολουθία', logic:'Λογική', planning:'Σχεδιασμός', spatial:'Χωρική', vocabulary:'Λεξιλόγιο', knowledge:'Γνώσεις', geography:'Γεωγραφία', recall:'Ανάκληση', pattern:'Μοτίβα', spelling:'Ορθογραφία' },
  };

  function badgesFor(gameId) {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'he';
    const skills = MAP[gameId] || [];
    return skills.map(sk => {
      const meta = SKILL_COLORS[sk] || { bg: '#f1f5f9', color: '#475569', label_he: sk, label_en: sk };
      const label = lang === 'he' ? meta.label_he : ((SKILL_L10N[lang] && SKILL_L10N[lang][sk]) || meta.label_en);
      return `<span class="skill-tag" style="background:${meta.bg};color:${meta.color}">${label}</span>`;
    }).join('');
  }

  function skillsFor(gameId) {
    return MAP[gameId] || [];
  }

  function filterBySkill(skill) {
    return Object.entries(MAP)
      .filter(([, skills]) => skills.includes(skill))
      .map(([id]) => id);
  }

  // Inject skill badges into all game cards on the home screen
  function injectAllBadges() {
    Object.keys(MAP).forEach(id => {
      const card = document.querySelector(`[onclick="loadGame('${id}')"]`);
      if (!card) return;
      let badgeRow = card.querySelector('.skill-badges');
      if (!badgeRow) {
        badgeRow = document.createElement('div');
        badgeRow.className = 'skill-badges';
        badgeRow.style.cssText = 'padding:0 1.25rem 0.75rem;display:flex;gap:4px;flex-wrap:wrap;';
        const p = card.querySelector('p');
        if (p && p.parentNode) p.parentNode.insertBefore(badgeRow, p.nextSibling);
      }
      badgeRow.innerHTML = badgesFor(id);
    });
  }

  return { badgesFor, skillsFor, filterBySkill, injectAllBadges };
})();
