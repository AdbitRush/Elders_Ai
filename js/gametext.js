// ═══════════════════════════════════════════════════════════════════════════════
// IN-GAME TEXT  (js/gametext.js)
// ═══════════════════════════════════════════════════════════════════════════════
// Every game was written with a two-language ternary:
//
//     isHe ? 'רמה' : 'LEVEL'
//
// which is correct for Hebrew and English and wrong for the other four. Pick
// Spanish and you got a Spanish home screen, Spanish card titles and Spanish
// badges — and then "LEVEL", "SCORE", "Play Again" and "GAME OVER" in English
// the moment a game opened. 23 of the 27 games did this. The site looked
// translated until you actually played it.
//
// gt(en, he) keeps the two arguments the games already had and looks up the
// rest by the English string. Hebrew still comes from the call site, so nothing
// about the Hebrew build changed. A string with no entry falls back to English,
// which is the old behaviour — never a blank label.
//
// TO ADD A STRING: use gt('English', 'עברית') at the call site and add the four
// translations below. Missing ones degrade to English rather than breaking.

const GameText = (() => {
  const GT = {
    es: {
      'Clear': 'Borrar', 'Clock': 'Reloj', 'Find the ': 'Encuentra ',
      'GAME OVER': 'FIN DEL JUEGO', 'Great job!': '¡Muy bien!', 'Hint': 'Pista',
      'LEVEL': 'NIVEL', 'LEVEL ': 'NIVEL ', 'LINES': 'LÍNEAS', 'Level 1...': 'Nivel 1...',
      'Memorize the number!': '¡Memoriza el número!', 'Menu': 'Menú', 'Mistakes': 'Errores',
      'Play Again': 'Jugar otra vez', 'Proverb': 'Refrán', 'Q': 'P', 'Question': 'Pregunta',
      'Round': 'Ronda', 'SCORE': 'PUNTOS', 'Score': 'Puntos',
      'TAP A CELL, THEN A NUMBER': 'TOCA UNA CASILLA Y LUEGO UN NÚMERO',
      'The word was: ': 'La palabra era: ', 'Type the number:': 'Escribe el número:',
      'What COLOR is the word painted in? (not what it says!)': '¿De qué COLOR está pintada la palabra? (¡no lo que dice!)',
      'What time is it?': '¿Qué hora es?', 'Which one belongs to:': '¿Cuál pertenece a:',
      'Word': 'Palabra', '✅ Check': '✅ Comprobar', '✅ Got them! Continue': '✅ ¡Listo! Continuar',
      '✅ True': '✅ Verdadero', '❌ False': '❌ Falso',
      '✨ The time machine is ready. Where to?': '✨ La máquina del tiempo está lista. ¿Adónde?',
      '❤️ A beautiful memory!': '❤️ ¡Un recuerdo precioso!', '⤓ DROP': '⤓ CAER',
      '⭐ New personal best!': '⭐ ¡Nuevo récord personal!',
      '💡 Swipe the board: left/right to move · down to drop · tap to rotate':
        '💡 Desliza en el tablero: izquierda/derecha para mover · abajo para caer · toca para girar',
      '📖 Study these items:': '📖 Estudia estos objetos:', '🔄 New Word': '🔄 Nueva palabra',
      '🔄 Try Again': '🔄 Intentar de nuevo', '🔍 Select the items you saw:': '🔍 Selecciona los objetos que viste:',
      '😅 Also an experience...': '😅 También es una experiencia...',
    },
    fr: {
      'Clear': 'Effacer', 'Clock': 'Horloge', 'Find the ': 'Trouvez ',
      'GAME OVER': 'PARTIE TERMINÉE', 'Great job!': 'Bravo !', 'Hint': 'Indice',
      'LEVEL': 'NIVEAU', 'LEVEL ': 'NIVEAU ', 'LINES': 'LIGNES', 'Level 1...': 'Niveau 1...',
      'Memorize the number!': 'Mémorisez le nombre !', 'Menu': 'Menu', 'Mistakes': 'Erreurs',
      'Play Again': 'Rejouer', 'Proverb': 'Proverbe', 'Q': 'Q', 'Question': 'Question',
      'Round': 'Manche', 'SCORE': 'SCORE', 'Score': 'Score',
      'TAP A CELL, THEN A NUMBER': 'TOUCHEZ UNE CASE PUIS UN CHIFFRE',
      'The word was: ': 'Le mot était : ', 'Type the number:': 'Tapez le nombre :',
      'What COLOR is the word painted in? (not what it says!)': "De quelle COULEUR le mot est-il écrit ? (pas ce qu'il dit !)",
      'What time is it?': 'Quelle heure est-il ?', 'Which one belongs to:': 'Lequel appartient à :',
      'Word': 'Mot', '✅ Check': '✅ Vérifier', '✅ Got them! Continue': "✅ C'est retenu ! Continuer",
      '✅ True': '✅ Vrai', '❌ False': '❌ Faux',
      '✨ The time machine is ready. Where to?': '✨ La machine à explorer le temps est prête. Où allons-nous ?',
      '❤️ A beautiful memory!': '❤️ Un beau souvenir !', '⤓ DROP': '⤓ LÂCHER',
      '⭐ New personal best!': '⭐ Nouveau record personnel !',
      '💡 Swipe the board: left/right to move · down to drop · tap to rotate':
        '💡 Glissez sur le plateau : gauche/droite pour déplacer · bas pour lâcher · touchez pour tourner',
      '📖 Study these items:': '📖 Mémorisez ces objets :', '🔄 New Word': '🔄 Nouveau mot',
      '🔄 Try Again': '🔄 Réessayer', '🔍 Select the items you saw:': '🔍 Sélectionnez les objets vus :',
      '😅 Also an experience...': "😅 C'est aussi une expérience...",
    },
    de: {
      'Clear': 'Löschen', 'Clock': 'Uhr', 'Find the ': 'Finde ',
      'GAME OVER': 'SPIEL VORBEI', 'Great job!': 'Gut gemacht!', 'Hint': 'Tipp',
      'LEVEL': 'STUFE', 'LEVEL ': 'STUFE ', 'LINES': 'REIHEN', 'Level 1...': 'Stufe 1...',
      'Memorize the number!': 'Merken Sie sich die Zahl!', 'Menu': 'Menü', 'Mistakes': 'Fehler',
      'Play Again': 'Nochmal spielen', 'Proverb': 'Sprichwort', 'Q': 'F', 'Question': 'Frage',
      'Round': 'Runde', 'SCORE': 'PUNKTE', 'Score': 'Punkte',
      'TAP A CELL, THEN A NUMBER': 'FELD ANTIPPEN, DANN ZAHL',
      'The word was: ': 'Das Wort war: ', 'Type the number:': 'Zahl eingeben:',
      'What COLOR is the word painted in? (not what it says!)': 'In welcher FARBE steht das Wort? (nicht was es sagt!)',
      'What time is it?': 'Wie spät ist es?', 'Which one belongs to:': 'Was gehört zu:',
      'Word': 'Wort', '✅ Check': '✅ Prüfen', '✅ Got them! Continue': '✅ Gemerkt! Weiter',
      '✅ True': '✅ Richtig', '❌ False': '❌ Falsch',
      '✨ The time machine is ready. Where to?': '✨ Die Zeitmaschine ist bereit. Wohin?',
      '❤️ A beautiful memory!': '❤️ Eine schöne Erinnerung!', '⤓ DROP': '⤓ FALLEN',
      '⭐ New personal best!': '⭐ Neue Bestleistung!',
      '💡 Swipe the board: left/right to move · down to drop · tap to rotate':
        '💡 Auf dem Feld wischen: links/rechts bewegen · runter fallen lassen · tippen zum Drehen',
      '📖 Study these items:': '📖 Prägen Sie sich diese ein:', '🔄 New Word': '🔄 Neues Wort',
      '🔄 Try Again': '🔄 Nochmal versuchen', '🔍 Select the items you saw:': '🔍 Wählen Sie, was Sie gesehen haben:',
      '😅 Also an experience...': '😅 Auch eine Erfahrung...',
    },
    el: {
      'Clear': 'Καθαρισμός', 'Clock': 'Ρολόι', 'Find the ': 'Βρείτε ',
      'GAME OVER': 'ΤΕΛΟΣ ΠΑΙΧΝΙΔΙΟΥ', 'Great job!': 'Μπράβο!', 'Hint': 'Υπόδειξη',
      'LEVEL': 'ΕΠΙΠΕΔΟ', 'LEVEL ': 'ΕΠΙΠΕΔΟ ', 'LINES': 'ΓΡΑΜΜΕΣ', 'Level 1...': 'Επίπεδο 1...',
      'Memorize the number!': 'Απομνημονεύστε τον αριθμό!', 'Menu': 'Μενού', 'Mistakes': 'Λάθη',
      'Play Again': 'Παίξτε ξανά', 'Proverb': 'Παροιμία', 'Q': 'Ερ', 'Question': 'Ερώτηση',
      'Round': 'Γύρος', 'SCORE': 'ΣΚΟΡ', 'Score': 'Σκορ',
      'TAP A CELL, THEN A NUMBER': 'ΠΑΤΗΣΤΕ ΕΝΑ ΚΕΛΙ ΚΑΙ ΜΕΤΑ ΑΡΙΘΜΟ',
      'The word was: ': 'Η λέξη ήταν: ', 'Type the number:': 'Πληκτρολογήστε τον αριθμό:',
      'What COLOR is the word painted in? (not what it says!)': 'Σε τι ΧΡΩΜΑ είναι γραμμένη η λέξη; (όχι τι λέει!)',
      'What time is it?': 'Τι ώρα είναι;', 'Which one belongs to:': 'Ποιο ανήκει στο:',
      'Word': 'Λέξη', '✅ Check': '✅ Έλεγχος', '✅ Got them! Continue': '✅ Τα θυμάμαι! Συνέχεια',
      '✅ True': '✅ Σωστό', '❌ False': '❌ Λάθος',
      '✨ The time machine is ready. Where to?': '✨ Η μηχανή του χρόνου είναι έτοιμη. Πού πάμε;',
      '❤️ A beautiful memory!': '❤️ Μια όμορφη ανάμνηση!', '⤓ DROP': '⤓ ΠΤΩΣΗ',
      '⭐ New personal best!': '⭐ Νέο προσωπικό ρεκόρ!',
      '💡 Swipe the board: left/right to move · down to drop · tap to rotate':
        '💡 Σύρετε στο ταμπλό: αριστερά/δεξιά για κίνηση · κάτω για πτώση · πατήστε για περιστροφή',
      '📖 Study these items:': '📖 Μελετήστε αυτά τα αντικείμενα:', '🔄 New Word': '🔄 Νέα λέξη',
      '🔄 Try Again': '🔄 Δοκιμάστε ξανά', '🔍 Select the items you saw:': '🔍 Επιλέξτε όσα είδατε:',
      '😅 Also an experience...': '😅 Και αυτό εμπειρία...',
    },
  };

  function gt(en, he) {
    const L = (typeof currentLang !== 'undefined') ? currentLang : 'he';
    if (L === 'he') return he;
    const table = GT[L];
    return (table && table[en] !== undefined) ? table[en] : en;
  }

  // Which English strings have no translation in a given language — used by the
  // coverage check so a missing string is found here rather than by a player.
  function missing(lang) {
    if (lang === 'he' || lang === 'en') return [];
    const table = GT[lang] || {};
    const all = new Set();
    Object.keys(GT).forEach(l => Object.keys(GT[l]).forEach(k => all.add(k)));
    return [...all].filter(k => table[k] === undefined);
  }

  return { gt, missing, GT };
})();

// Games call gt() directly, so expose it as a plain global alongside the module.
var gt = GameText.gt;
