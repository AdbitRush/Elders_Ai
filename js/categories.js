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
    sequence:      ['memory', 'sequence'],
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
    blocks:     ['spatial', 'planning'],
    // Added 2026-08-26. These nine games existed for weeks with no entry here,
    // so their cards showed no skill badges at all — injectAllBadges() iterates
    // this map, so a missing game is simply skipped in silence. Same drift that
    // left them off the scoreboard.
    klondike:   ['planning', 'memory'],
    colormatch: ['attention', 'speed'],
    digitspan:  ['memory', 'sequence'],
    clock:      ['perception', 'logic'],
    counting:   ['speed', 'attention'],
    category:   ['language', 'logic'],
    letters:    ['language', 'spelling'],
    lifesim:    ['planning', 'sequence'],
    safari:     ['perception', 'attention'],
  };

  // ── Why each game is worth playing ────────────────────────────────────────
  // One line per game, saying what it actually asks your brain to do.
  //
  // These describe the DEMAND the game makes — holding a sequence, resisting an
  // obvious answer, rotating a shape. That is something the game genuinely does
  // and a player can feel. None of them claims a medical benefit, because
  // training a skill and protecting against disease are different things and
  // only the first is true here. See the note under #why-train on the home
  // screen for the rest of that reasoning.
  const WHY = {
    en: {
      memory:'Turning cards face down forces you to hold their positions in mind.',
      oddoneout:'Trains you to spot the one detail that breaks a pattern.',
      math:'Quick mental arithmetic, under mild time pressure.',
      wordsearch:'Systematic visual scanning — the skill behind finding things quickly.',
      sequence:'Stretches how long a sequence you can hold and repeat.',
      sudoku:'Pure deduction: every number you place rules others out.',
      shapes:'Matching a shape to its slot works spatial perception.',
      solitaire:'Adding to a target while planning which cards to keep.',
      trivia:'Retrieving facts you already know is what keeps them reachable.',
      numseq:'Finding the rule behind a sequence is pattern reasoning.',
      unscramble:'Rearranging letters into a word works spelling and word-finding.',
      pairs:'Opposites exercise the meaning side of vocabulary, not just recall.',
      truefalse:'Quick judgement against what you know, with no multiple-choice hints.',
      flags:'Linking a picture to a name — visual memory plus general knowledge.',
      proverbs:'Completing a familiar phrase draws on long-stored language.',
      hangman:'Guessing letters from a partial word is word-finding under constraint.',
      recall:'Look, then reproduce — short-term visual memory, directly.',
      blocks:'Rotating shapes to fit is mental rotation plus planning ahead.',
      klondike:'Holding several possible moves in mind and choosing an order.',
      colormatch:'Naming the colour and not the word trains resisting the obvious answer.',
      digitspan:'Measures and stretches your working-memory span for numbers.',
      clock:'Reading a dial turns a position into a number.',
      counting:'Counting quickly and accurately under time pressure.',
      category:'Sorting things into groups is how meaning is organised.',
      letters:'Finding the missing letter uses spelling and the shape of the word.',
      lifesim:'Putting steps into a sensible order is everyday planning.',
      safari:'Searching a busy scene for a target trains focused attention.',
    },
    he: {
      memory:'הפיכת הקלפים מחייבת להחזיק בראש איפה כל אחד נמצא.',
      oddoneout:'מאמן לזהות את הפרט האחד ששובר את התבנית.',
      math:'חשבון מהיר בראש, תחת לחץ זמן קל.',
      wordsearch:'סריקה חזותית שיטתית — המיומנות שמאחורי מציאת דברים מהר.',
      sequence:'מותח את אורך הרצף שאפשר לזכור ולחזור עליו.',
      sudoku:'היסק טהור: כל מספר שמניחים פוסל אחרים.',
      shapes:'התאמת צורה למקומה מפעילה תפיסה מרחבית.',
      solitaire:'חיבור לסכום יעד תוך תכנון אילו קלפים לשמור.',
      trivia:'שליפת ידע מוכר היא מה ששומר עליו נגיש.',
      numseq:'מציאת הכלל שמאחורי רצף היא חשיבה תבניתית.',
      unscramble:'סידור אותיות למילה מפעיל כתיב ומציאת מילים.',
      pairs:'הפכים מאמנים את צד המשמעות של אוצר המילים.',
      truefalse:'שיפוט מהיר מול הידע שלכם, בלי רמזים של ברירה.',
      flags:'קישור תמונה לשם — זיכרון חזותי יחד עם ידע כללי.',
      proverbs:'השלמת ביטוי מוכר שולפת שפה שאוחסנה לאורך שנים.',
      hangman:'ניחוש אותיות ממילה חלקית הוא מציאת מילים תחת אילוץ.',
      recall:'מסתכלים ואז משחזרים — זיכרון חזותי לטווח קצר, ישירות.',
      blocks:'סיבוב צורות כדי שיתאימו הוא סיבוב מנטלי ותכנון קדימה.',
      klondike:'החזקת כמה מהלכים אפשריים בראש ובחירת סדר ביניהם.',
      colormatch:'לומר את הצבע ולא את המילה מאמן התנגדות לתשובה המתבקשת.',
      digitspan:'מודד ומותח את טווח זיכרון העבודה למספרים.',
      clock:'קריאת מחוגים מתרגמת מיקום למספר.',
      counting:'לספור מהר ובדיוק תחת לחץ זמן.',
      category:'מיון לקבוצות הוא האופן שבו משמעות מאורגנת.',
      letters:'מציאת האות החסרה משתמשת בכתיב ובצורת המילה.',
      lifesim:'סידור שלבים בסדר הגיוני הוא תכנון יומיומי.',
      safari:'חיפוש מטרה בתמונה עמוסה מאמן קשב ממוקד.',
    },
    es: {
      memory:'Girar las cartas obliga a retener dónde está cada una.',
      oddoneout:'Entrena a detectar el detalle que rompe el patrón.',
      math:'Cálculo mental rápido, con algo de presión de tiempo.',
      wordsearch:'Barrido visual sistemático: la destreza de encontrar rápido.',
      sequence:'Amplía la longitud de secuencia que puedes retener y repetir.',
      sudoku:'Deducción pura: cada número que colocas descarta otros.',
      shapes:'Emparejar forma y hueco trabaja la percepción espacial.',
      solitaire:'Sumar hasta un objetivo mientras planificas qué cartas guardar.',
      trivia:'Recuperar lo que ya sabes es lo que lo mantiene accesible.',
      numseq:'Hallar la regla de una serie es razonamiento de patrones.',
      unscramble:'Reordenar letras trabaja la ortografía y la búsqueda de palabras.',
      pairs:'Los opuestos ejercitan el significado, no solo el recuerdo.',
      truefalse:'Juicio rápido frente a lo que sabes, sin opciones que ayuden.',
      flags:'Unir imagen y nombre: memoria visual más cultura general.',
      proverbs:'Completar una frase conocida recurre al lenguaje ya asentado.',
      hangman:'Adivinar letras de una palabra parcial es búsqueda léxica.',
      recall:'Mirar y reproducir: memoria visual a corto plazo, directa.',
      blocks:'Girar piezas para encajar es rotación mental y planificación.',
      klondike:'Retener varias jugadas posibles y elegir en qué orden.',
      colormatch:'Decir el color y no la palabra entrena a frenar lo obvio.',
      digitspan:'Mide y amplía tu memoria de trabajo para números.',
      clock:'Leer las agujas convierte una posición en un número.',
      counting:'Contar rápido y sin errores con presión de tiempo.',
      category:'Clasificar en grupos es cómo se organiza el significado.',
      letters:'Encontrar la letra que falta usa ortografía y forma de palabra.',
      lifesim:'Ordenar pasos con sentido es planificación cotidiana.',
      safari:'Buscar un objetivo en una escena cargada entrena la atención.',
    },
    fr: {
      memory:'Retourner les cartes oblige à retenir où se trouve chacune.',
      oddoneout:'Entraîne à repérer le détail qui rompt le motif.',
      math:'Calcul mental rapide, sous une légère pression de temps.',
      wordsearch:"Balayage visuel méthodique : l'art de trouver vite.",
      sequence:'Allonge la séquence que vous pouvez retenir et répéter.',
      sudoku:'Déduction pure : chaque chiffre posé en exclut d’autres.',
      shapes:'Associer forme et emplacement travaille la perception spatiale.',
      solitaire:'Atteindre un total tout en planifiant les cartes à garder.',
      trivia:"Retrouver ce que l'on sait déjà, c'est le garder accessible.",
      numseq:"Trouver la règle d'une suite, c'est raisonner par motifs.",
      unscramble:"Remettre les lettres en ordre travaille l'orthographe.",
      pairs:'Les contraires exercent le sens des mots, pas que la mémoire.',
      truefalse:'Jugement rapide face à vos connaissances, sans indices.',
      flags:'Relier une image à un nom : mémoire visuelle et culture.',
      proverbs:'Compléter une expression connue puise dans la langue ancrée.',
      hangman:"Deviner des lettres d'un mot partiel : recherche lexicale.",
      recall:'Regarder puis reproduire : mémoire visuelle à court terme.',
      blocks:'Faire pivoter les pièces : rotation mentale et anticipation.',
      klondike:"Garder plusieurs coups possibles en tête et choisir l'ordre.",
      colormatch:"Dire la couleur et non le mot entraîne à freiner l'évidence.",
      digitspan:'Mesure et étire votre mémoire de travail pour les chiffres.',
      clock:'Lire les aiguilles transforme une position en nombre.',
      counting:'Compter vite et juste sous contrainte de temps.',
      category:"Trier en groupes, c'est ainsi que le sens s'organise.",
      letters:'Trouver la lettre manquante mobilise orthographe et forme du mot.',
      lifesim:"Mettre des étapes dans un ordre logique, c'est planifier.",
      safari:"Chercher une cible dans une scène chargée entraîne l'attention.",
    },
    de: {
      memory:'Das Umdrehen der Karten zwingt dazu, ihre Positionen zu behalten.',
      oddoneout:'Übt, das eine Detail zu finden, das aus dem Muster fällt.',
      math:'Schnelles Kopfrechnen unter leichtem Zeitdruck.',
      wordsearch:'Systematisches Absuchen — die Fähigkeit, schnell zu finden.',
      sequence:'Erweitert, wie lange Folgen Sie behalten und wiederholen können.',
      sudoku:'Reine Deduktion: Jede gesetzte Zahl schließt andere aus.',
      shapes:'Form und Platz zuzuordnen trainiert die räumliche Wahrnehmung.',
      solitaire:'Auf eine Zielsumme addieren und dabei planen, was bleibt.',
      trivia:'Bekanntes abzurufen ist, was es abrufbar hält.',
      numseq:'Die Regel hinter einer Folge zu finden ist Musterdenken.',
      unscramble:'Buchstaben zu ordnen trainiert Rechtschreibung und Wortfindung.',
      pairs:'Gegensätze üben die Bedeutungsseite des Wortschatzes.',
      truefalse:'Schnelles Urteil gegen Ihr Wissen, ohne hilfreiche Auswahl.',
      flags:'Bild und Name verknüpfen: visuelles Gedächtnis plus Wissen.',
      proverbs:'Eine vertraute Wendung zu ergänzen schöpft aus alter Sprache.',
      hangman:'Buchstaben aus Wortfragmenten zu raten ist Wortfindung.',
      recall:'Ansehen, dann wiedergeben — visuelles Kurzzeitgedächtnis.',
      blocks:'Formen zu drehen ist mentale Rotation und Vorausplanung.',
      klondike:'Mehrere mögliche Züge im Kopf behalten und ordnen.',
      colormatch:'Die Farbe statt des Wortes zu nennen übt, das Naheliegende zu bremsen.',
      digitspan:'Misst und dehnt Ihre Merkspanne für Zahlen.',
      clock:'Zeiger zu lesen macht aus einer Position eine Zahl.',
      counting:'Schnell und genau zählen unter Zeitdruck.',
      category:'Ordnen in Gruppen ist, wie Bedeutung organisiert wird.',
      letters:'Den fehlenden Buchstaben zu finden nutzt Rechtschreibung und Wortbild.',
      lifesim:'Schritte sinnvoll zu ordnen ist alltägliche Planung.',
      safari:'In einer vollen Szene ein Ziel zu suchen schult die Aufmerksamkeit.',
    },
    el: {
      memory:'Το γύρισμα των καρτών σάς αναγκάζει να θυμάστε τις θέσεις τους.',
      oddoneout:'Εξασκεί τον εντοπισμό της λεπτομέρειας που σπάει το μοτίβο.',
      math:'Γρήγορη νοερή αριθμητική, με ελαφρά πίεση χρόνου.',
      wordsearch:'Συστηματική οπτική σάρωση — η ικανότητα να βρίσκεις γρήγορα.',
      sequence:'Επεκτείνει πόσο μεγάλη ακολουθία μπορείτε να συγκρατήσετε.',
      sudoku:'Καθαρή επαγωγή: κάθε αριθμός που βάζετε αποκλείει άλλους.',
      shapes:'Η αντιστοίχιση σχήματος και θέσης δουλεύει τη χωρική αντίληψη.',
      solitaire:'Άθροισμα προς έναν στόχο, με σχεδιασμό ποιες κάρτες κρατάτε.',
      trivia:'Η ανάκληση όσων ήδη ξέρετε τα κρατά προσβάσιμα.',
      numseq:'Η εύρεση του κανόνα μιας σειράς είναι συλλογισμός μοτίβων.',
      unscramble:'Η αναδιάταξη γραμμάτων δουλεύει ορθογραφία και εύρεση λέξεων.',
      pairs:'Τα αντίθετα εξασκούν τη σημασία, όχι μόνο τη μνήμη.',
      truefalse:'Γρήγορη κρίση πάνω σε όσα ξέρετε, χωρίς βοηθητικές επιλογές.',
      flags:'Σύνδεση εικόνας και ονόματος: οπτική μνήμη και γενικές γνώσεις.',
      proverbs:'Η συμπλήρωση γνωστής φράσης αντλεί από παλιά αποθηκευμένη γλώσσα.',
      hangman:'Η εικασία γραμμάτων από μισή λέξη είναι εύρεση λέξης.',
      recall:'Κοιτάτε και μετά αναπαράγετε — οπτική βραχύχρονη μνήμη.',
      blocks:'Η περιστροφή σχημάτων είναι νοερή περιστροφή και σχεδιασμός.',
      klondike:'Κρατάτε πολλές πιθανές κινήσεις και επιλέγετε σειρά.',
      colormatch:'Το να λέτε το χρώμα κι όχι τη λέξη εξασκεί τη συγκράτηση.',
      digitspan:'Μετρά και επεκτείνει το εύρος μνήμης εργασίας για αριθμούς.',
      clock:'Η ανάγνωση δεικτών μετατρέπει μια θέση σε αριθμό.',
      counting:'Γρήγορη και ακριβής μέτρηση υπό πίεση χρόνου.',
      category:'Η ταξινόμηση σε ομάδες οργανώνει τη σημασία.',
      letters:'Η εύρεση του γράμματος που λείπει χρησιμοποιεί ορθογραφία.',
      lifesim:'Η σωστή σειρά βημάτων είναι καθημερινός σχεδιασμός.',
      safari:'Η αναζήτηση στόχου σε γεμάτη σκηνή εξασκεί την προσοχή.',
    },
  };

  function whyFor(gameId) {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'he';
    return (WHY[lang] && WHY[lang][gameId]) || WHY.en[gameId] || '';
  }

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

      // One line under the badges saying what the game asks of you. Re-rendered
      // on every language change, same as the badges.
      let whyRow = card.querySelector('.why-line');
      if (!whyRow) {
        whyRow = document.createElement('div');
        whyRow.className = 'why-line';
        whyRow.style.cssText =
          'padding:0 1.25rem 1rem;font-size:0.78rem;line-height:1.5;color:#6b7280;' +
          'border-top:1px solid rgba(0,0,0,0.06);margin-top:2px;padding-top:8px;';
        badgeRow.parentNode.insertBefore(whyRow, badgeRow.nextSibling);
      }
      const why = whyFor(id);
      whyRow.textContent = why ? '🧠 ' + why : '';
      whyRow.style.display = why ? '' : 'none';
    });
  }

  return { badgesFor, skillsFor, filterBySkill, injectAllBadges, whyFor };
})();
