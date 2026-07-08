/* lang-content.js — native GAME CONTENT for es/fr/de/el.
   The UI was translated but word games still served Hebrew/English pools.
   Loaded after the inline i18nData; games read pools at start time so this
   just has to run before the first game loads. Any pool still missing in any
   language falls back to English (never Hebrew, never undefined). */
(function () {
  if (typeof i18nData === 'undefined') return;

  const C = {
    fr: {
      ws_pool: ["PAIX","AMOUR","LIVRE","SOLEIL","FAMILLE","SANTE","SOURIRE","ESPOIR","LUMIERE","REVE","MUSIQUE","FLEUR","JOIE","MER","ETOILE"],
      unscramble_pool: [
        {word:"AMOUR",hint:"émotion"},{word:"LIVRE",hint:"lecture"},{word:"FLEUR",hint:"jardin"},
        {word:"OISEAU",hint:"il vole"},{word:"ARBRE",hint:"plante"},{word:"MAISON",hint:"on y vit"},
        {word:"SOLEIL",hint:"dans le ciel"},{word:"MUSIQUE",hint:"mélodie"},{word:"FROMAGE",hint:"produit laitier"},
        {word:"JARDIN",hint:"plein de fleurs"}],
      hangman_pool: [
        {word:"POMME",hint:"un fruit"},{word:"MAISON",hint:"où l'on habite"},{word:"MUSIQUE",hint:"sons et mélodie"},
        {word:"PAIN",hint:"à la boulangerie"},{word:"FLEUR",hint:"au jardin"},{word:"SOLEIL",hint:"brille le jour"},
        {word:"FAMILLE",hint:"les proches"},{word:"VOYAGE",hint:"partir loin"},{word:"BONHEUR",hint:"sentiment de joie"},
        {word:"CUISINE",hint:"on y prépare les repas"}],
      proverbs_pool: [
        {q:"Petit à petit, l'oiseau fait son ___",opts:["nid","chant","vol","chemin"],a:0},
        {q:"Qui vivra ___",opts:["verra","saura","gagnera","rira"],a:0},
        {q:"L'habit ne fait pas le ___",opts:["moine","roi","juge","maître"],a:0},
        {q:"Après la pluie, le beau ___",opts:["temps","jour","soleil","matin"],a:0},
        {q:"Rien ne sert de courir, il faut partir à ___",opts:["point","temps","l'heure","pied"],a:0},
        {q:"Mieux vaut tard que ___",opts:["jamais","rien","demain","tôt"],a:0},
        {q:"Les bons comptes font les bons ___",opts:["amis","voisins","frères","temps"],a:0},
        {q:"Il ne faut pas vendre la peau de l'ours avant de l'avoir ___",opts:["tué","vu","chassé","trouvé"],a:0}],
      trivia_pool: [
        {q:"Quel est le plus grand océan du monde ?",opts:["Atlantique","Indien","Pacifique","Arctique"],a:2},
        {q:"Qui a peint la Joconde ?",opts:["Michel-Ange","Léonard de Vinci","Renoir","Monet"],a:1},
        {q:"Quelle est la capitale de l'Italie ?",opts:["Milan","Venise","Rome","Naples"],a:2},
        {q:"Combien de jours dans une année bissextile ?",opts:["364","365","366","367"],a:2},
        {q:"Quel fleuve traverse Paris ?",opts:["La Loire","Le Rhône","La Seine","La Garonne"],a:2},
        {q:"Quelle planète est la plus proche du Soleil ?",opts:["Vénus","Mercure","Mars","Terre"],a:1},
        {q:"Qui a écrit « Les Misérables » ?",opts:["Zola","Balzac","Victor Hugo","Camus"],a:2},
        {q:"Combien y a-t-il de continents ?",opts:["5","6","7","8"],a:2}],
      pairs_pool: [
        {a:"Chaud",b:"Froid"},{a:"Grand",b:"Petit"},{a:"Heureux",b:"Triste"},{a:"Jour",b:"Nuit"},
        {a:"Noir",b:"Blanc"},{a:"Rapide",b:"Lent"},{a:"Neuf",b:"Vieux"},{a:"Haut",b:"Bas"},
        {a:"Ouvert",b:"Fermé"},{a:"Fort",b:"Faible"}],
      tf_pool: [
        {s:"Paris est la capitale de la France",a:true},{s:"Le Soleil est une étoile",a:true},
        {s:"Une pieuvre a 8 bras",a:true},{s:"Une semaine compte 8 jours",a:false},
        {s:"Le miel ne périme jamais",a:true},{s:"Les pingouins vivent au pôle Nord",a:false},
        {s:"La Grande Muraille est en Chine",a:true},{s:"Les tomates sont des légumes",a:false}],
      recall_pool: ["🍎 Pomme","🚗 Voiture","🌸 Fleur","📚 Livre","🐕 Chien","☕ Café","🎸 Guitare","⚽ Ballon","🍕 Pizza","🌙 Lune","🏠 Maison","🎂 Gâteau","🌹 Rose","🦁 Lion","🍇 Raisin"],
      flags_pool: [
        {flag:"🇺🇸",opts:["Canada","Australie","États-Unis","Nouvelle-Zélande"],a:2},
        {flag:"🇬🇧",opts:["Irlande","Australie","Canada","Royaume-Uni"],a:3},
        {flag:"🇫🇷",opts:["Belgique","France","Suisse","Italie"],a:1},
        {flag:"🇮🇹",opts:["Italie","Espagne","Portugal","Grèce"],a:0},
        {flag:"🇩🇪",opts:["Autriche","Pays-Bas","Allemagne","Danemark"],a:2},
        {flag:"🇯🇵",opts:["Chine","Corée","Japon","Thaïlande"],a:2},
        {flag:"🇬🇷",opts:["Chypre","Grèce","Turquie","Albanie"],a:1},
        {flag:"🇪🇸",opts:["Mexique","Portugal","Espagne","Argentine"],a:2}],
    },

    es: {
      ws_pool: ["PAZ","AMOR","LIBRO","SOL","FAMILIA","SALUD","SONRISA","ESPERANZA","LUZ","SUENO","MUSICA","FLOR","ALEGRIA","MAR","ESTRELLA"],
      unscramble_pool: [
        {word:"AMOR",hint:"emoción"},{word:"LIBRO",hint:"lectura"},{word:"FLOR",hint:"jardín"},
        {word:"PAJARO",hint:"vuela"},{word:"ARBOL",hint:"planta"},{word:"CASA",hint:"donde vives"},
        {word:"SOL",hint:"en el cielo"},{word:"MUSICA",hint:"melodía"},{word:"QUESO",hint:"lácteo"},
        {word:"JARDIN",hint:"lleno de flores"}],
      hangman_pool: [
        {word:"MANZANA",hint:"una fruta"},{word:"CASA",hint:"donde vives"},{word:"MUSICA",hint:"sonidos y melodía"},
        {word:"PAN",hint:"de la panadería"},{word:"FLOR",hint:"en el jardín"},{word:"SOL",hint:"brilla de día"},
        {word:"FAMILIA",hint:"los tuyos"},{word:"VIAJE",hint:"ir lejos"},{word:"FELICIDAD",hint:"sentimiento de alegría"},
        {word:"COCINA",hint:"donde se prepara la comida"}],
      proverbs_pool: [
        {q:"A quien madruga, Dios le ___",opts:["ayuda","paga","quiere","cuida"],a:0},
        {q:"Más vale tarde que ___",opts:["nunca","pronto","nada","ayer"],a:0},
        {q:"En boca cerrada no entran ___",opts:["moscas","palabras","penas","males"],a:0},
        {q:"No hay mal que por bien no ___",opts:["venga","pase","dure","llegue"],a:0},
        {q:"Ojos que no ven, corazón que no ___",opts:["siente","llora","sabe","duele"],a:0},
        {q:"Dime con quién andas y te diré quién ___",opts:["eres","serás","fuiste","vas"],a:0},
        {q:"Al mal tiempo, buena ___",opts:["cara","suerte","sombra","copa"],a:0},
        {q:"Más vale pájaro en mano que ciento ___",opts:["volando","cantando","mirando","esperando"],a:0}],
      trivia_pool: [
        {q:"¿Cuál es el océano más grande del mundo?",opts:["Atlántico","Índico","Pacífico","Ártico"],a:2},
        {q:"¿Quién pintó la Mona Lisa?",opts:["Miguel Ángel","Leonardo da Vinci","Goya","Picasso"],a:1},
        {q:"¿Cuál es la capital de Italia?",opts:["Milán","Venecia","Roma","Nápoles"],a:2},
        {q:"¿Cuántos días tiene un año bisiesto?",opts:["364","365","366","367"],a:2},
        {q:"¿Qué río pasa por Sevilla?",opts:["Ebro","Tajo","Guadalquivir","Duero"],a:2},
        {q:"¿Qué planeta está más cerca del Sol?",opts:["Venus","Mercurio","Marte","Tierra"],a:1},
        {q:"¿Quién escribió Don Quijote?",opts:["Lorca","Cervantes","Machado","Borges"],a:1},
        {q:"¿Cuántos continentes hay?",opts:["5","6","7","8"],a:2}],
      pairs_pool: [
        {a:"Caliente",b:"Frío"},{a:"Grande",b:"Pequeño"},{a:"Feliz",b:"Triste"},{a:"Día",b:"Noche"},
        {a:"Negro",b:"Blanco"},{a:"Rápido",b:"Lento"},{a:"Nuevo",b:"Viejo"},{a:"Alto",b:"Bajo"},
        {a:"Abierto",b:"Cerrado"},{a:"Fuerte",b:"Débil"}],
      tf_pool: [
        {s:"Madrid es la capital de España",a:true},{s:"El Sol es una estrella",a:true},
        {s:"Un pulpo tiene 8 brazos",a:true},{s:"Una semana tiene 8 días",a:false},
        {s:"La miel nunca caduca",a:true},{s:"Los pingüinos viven en el Polo Norte",a:false},
        {s:"La Gran Muralla está en China",a:true},{s:"El tomate es una verdura",a:false}],
      recall_pool: ["🍎 Manzana","🚗 Coche","🌸 Flor","📚 Libro","🐕 Perro","☕ Café","🎸 Guitarra","⚽ Balón","🍕 Pizza","🌙 Luna","🏠 Casa","🎂 Tarta","🌹 Rosa","🦁 León","🍇 Uvas"],
      flags_pool: [
        {flag:"🇺🇸",opts:["Canadá","Australia","Estados Unidos","Nueva Zelanda"],a:2},
        {flag:"🇬🇧",opts:["Irlanda","Australia","Canadá","Reino Unido"],a:3},
        {flag:"🇫🇷",opts:["Bélgica","Francia","Suiza","Italia"],a:1},
        {flag:"🇮🇹",opts:["Italia","España","Portugal","Grecia"],a:0},
        {flag:"🇩🇪",opts:["Austria","Países Bajos","Alemania","Dinamarca"],a:2},
        {flag:"🇯🇵",opts:["China","Corea","Japón","Tailandia"],a:2},
        {flag:"🇬🇷",opts:["Chipre","Grecia","Turquía","Albania"],a:1},
        {flag:"🇪🇸",opts:["México","Portugal","España","Argentina"],a:2}],
    },

    de: {
      ws_pool: ["FRIEDEN","LIEBE","BUCH","SONNE","FAMILIE","GLUECK","LICHT","TRAUM","MUSIK","BLUME","FREUDE","MEER","STERN","HOFFNUNG","LACHEN"],
      unscramble_pool: [
        {word:"LIEBE",hint:"Gefühl"},{word:"BUCH",hint:"zum Lesen"},{word:"BLUME",hint:"im Garten"},
        {word:"VOGEL",hint:"er fliegt"},{word:"BAUM",hint:"Pflanze"},{word:"HAUS",hint:"man wohnt darin"},
        {word:"SONNE",hint:"am Himmel"},{word:"MUSIK",hint:"Melodie"},{word:"KAESE",hint:"Milchprodukt"},
        {word:"GARTEN",hint:"voller Blumen"}],
      hangman_pool: [
        {word:"APFEL",hint:"eine Frucht"},{word:"HAUS",hint:"man wohnt darin"},{word:"MUSIK",hint:"Klänge und Melodie"},
        {word:"BROT",hint:"vom Bäcker"},{word:"BLUME",hint:"im Garten"},{word:"SONNE",hint:"scheint am Tag"},
        {word:"FAMILIE",hint:"die Liebsten"},{word:"REISE",hint:"in die Ferne"},{word:"FREUDE",hint:"Gefühl des Glücks"},
        {word:"KUECHE",hint:"dort wird gekocht"}],
      proverbs_pool: [
        {q:"Morgenstund hat Gold im ___",opts:["Mund","Haar","Haus","Herz"],a:0},
        {q:"Wer rastet, der ___",opts:["rostet","ruht","verliert","schläft"],a:0},
        {q:"Aller guten Dinge sind ___",opts:["drei","zwei","vier","viele"],a:0},
        {q:"Übung macht den ___",opts:["Meister","Mann","Weg","Unterschied"],a:0},
        {q:"Der Apfel fällt nicht weit vom ___",opts:["Stamm","Baum","Ast","Garten"],a:0},
        {q:"Was du heute kannst besorgen, das verschiebe nicht auf ___",opts:["morgen","später","übermorgen","nie"],a:0},
        {q:"Ende gut, alles ___",opts:["gut","schön","vorbei","klar"],a:0},
        {q:"Wer zuletzt lacht, lacht am ___",opts:["besten","längsten","lautesten","meisten"],a:0}],
      trivia_pool: [
        {q:"Was ist der größte Ozean der Welt?",opts:["Atlantik","Indischer","Pazifik","Arktis"],a:2},
        {q:"Wer malte die Mona Lisa?",opts:["Michelangelo","Leonardo da Vinci","Dürer","Rembrandt"],a:1},
        {q:"Was ist die Hauptstadt Italiens?",opts:["Mailand","Venedig","Rom","Neapel"],a:2},
        {q:"Wie viele Tage hat ein Schaltjahr?",opts:["364","365","366","367"],a:2},
        {q:"Welcher Fluss fließt durch Köln?",opts:["Elbe","Donau","Rhein","Main"],a:2},
        {q:"Welcher Planet ist der Sonne am nächsten?",opts:["Venus","Merkur","Mars","Erde"],a:1},
        {q:"Wer schrieb „Faust“?",opts:["Schiller","Goethe","Heine","Kafka"],a:1},
        {q:"Wie viele Kontinente gibt es?",opts:["5","6","7","8"],a:2}],
      pairs_pool: [
        {a:"Heiß",b:"Kalt"},{a:"Groß",b:"Klein"},{a:"Glücklich",b:"Traurig"},{a:"Tag",b:"Nacht"},
        {a:"Schwarz",b:"Weiß"},{a:"Schnell",b:"Langsam"},{a:"Neu",b:"Alt"},{a:"Hoch",b:"Tief"},
        {a:"Offen",b:"Geschlossen"},{a:"Stark",b:"Schwach"}],
      tf_pool: [
        {s:"Berlin ist die Hauptstadt Deutschlands",a:true},{s:"Die Sonne ist ein Stern",a:true},
        {s:"Ein Oktopus hat 8 Arme",a:true},{s:"Eine Woche hat 8 Tage",a:false},
        {s:"Honig wird niemals schlecht",a:true},{s:"Pinguine leben am Nordpol",a:false},
        {s:"Die Große Mauer steht in China",a:true},{s:"Tomaten sind Gemüse",a:false}],
      recall_pool: ["🍎 Apfel","🚗 Auto","🌸 Blume","📚 Buch","🐕 Hund","☕ Kaffee","🎸 Gitarre","⚽ Ball","🍕 Pizza","🌙 Mond","🏠 Haus","🎂 Kuchen","🌹 Rose","🦁 Löwe","🍇 Trauben"],
      flags_pool: [
        {flag:"🇺🇸",opts:["Kanada","Australien","USA","Neuseeland"],a:2},
        {flag:"🇬🇧",opts:["Irland","Australien","Kanada","Großbritannien"],a:3},
        {flag:"🇫🇷",opts:["Belgien","Frankreich","Schweiz","Italien"],a:1},
        {flag:"🇮🇹",opts:["Italien","Spanien","Portugal","Griechenland"],a:0},
        {flag:"🇩🇪",opts:["Österreich","Niederlande","Deutschland","Dänemark"],a:2},
        {flag:"🇯🇵",opts:["China","Korea","Japan","Thailand"],a:2},
        {flag:"🇬🇷",opts:["Zypern","Griechenland","Türkei","Albanien"],a:1},
        {flag:"🇪🇸",opts:["Mexiko","Portugal","Spanien","Argentinien"],a:2}],
    },

    el: {
      ws_pool: ["ΕΙΡΗΝΗ","ΑΓΑΠΗ","ΒΙΒΛΙΟ","ΗΛΙΟΣ","ΥΓΕΙΑ","ΧΑΜΟΓΕΛΟ","ΕΛΠΙΔΑ","ΦΩΣ","ΟΝΕΙΡΟ","ΜΟΥΣΙΚΗ","ΛΟΥΛΟΥΔΙ","ΧΑΡΑ","ΘΑΛΑΣΣΑ","ΑΣΤΕΡΙ","ΖΩΗ"],
      unscramble_pool: [
        {word:"ΑΓΑΠΗ",hint:"συναίσθημα"},{word:"ΒΙΒΛΙΟ",hint:"διάβασμα"},{word:"ΛΟΥΛΟΥΔΙ",hint:"στον κήπο"},
        {word:"ΠΟΥΛΙ",hint:"πετάει"},{word:"ΔΕΝΤΡΟ",hint:"φυτό"},{word:"ΣΠΙΤΙ",hint:"εκεί μένεις"},
        {word:"ΗΛΙΟΣ",hint:"στον ουρανό"},{word:"ΜΟΥΣΙΚΗ",hint:"μελωδία"},{word:"ΤΥΡΙ",hint:"γαλακτοκομικό"},
        {word:"ΚΗΠΟΣ",hint:"γεμάτος λουλούδια"}],
      hangman_pool: [
        {word:"ΜΗΛΟ",hint:"ένα φρούτο"},{word:"ΣΠΙΤΙ",hint:"εκεί μένεις"},{word:"ΜΟΥΣΙΚΗ",hint:"ήχοι και μελωδία"},
        {word:"ΨΩΜΙ",hint:"από τον φούρνο"},{word:"ΛΟΥΛΟΥΔΙ",hint:"στον κήπο"},{word:"ΗΛΙΟΣ",hint:"λάμπει τη μέρα"},
        {word:"ΟΙΚΟΓΕΝΕΙΑ",hint:"οι δικοί σου"},{word:"ΤΑΞΙΔΙ",hint:"πας μακριά"},{word:"ΧΑΡΑ",hint:"αίσθημα ευτυχίας"},
        {word:"ΚΟΥΖΙΝΑ",hint:"εκεί μαγειρεύεις"}],
      proverbs_pool: [
        {q:"Όποιος βιάζεται, ___",opts:["σκοντάφτει","κερδίζει","χάνει","τρέχει"],a:0},
        {q:"Η καλή μέρα απ' το πρωί ___",opts:["φαίνεται","αρχίζει","μετριέται","έρχεται"],a:0},
        {q:"Κάλλιο αργά παρά ___",opts:["ποτέ","νωρίς","γρήγορα","αύριο"],a:0},
        {q:"Το μήλο κάτω απ' τη μηλιά θα ___",opts:["πέσει","μείνει","ωριμάσει","κυλήσει"],a:0},
        {q:"Η γλώσσα κόκαλα δεν έχει και κόκαλα ___",opts:["τσακίζει","σπάει","λυγίζει","πονάει"],a:0},
        {q:"Ό,τι λάμπει δεν είναι ___",opts:["χρυσός","ήλιος","φως","αλήθεια"],a:0},
        {q:"Πες μου τον φίλο σου να σου πω ποιος ___",opts:["είσαι","ήσουν","θα γίνεις","μοιάζεις"],a:0},
        {q:"Αγάλι-αγάλι γίνεται η αγουρίδα ___",opts:["μέλι","κρασί","γλυκιά","ώριμη"],a:0}],
      trivia_pool: [
        {q:"Ποιος είναι ο μεγαλύτερος ωκεανός;",opts:["Ατλαντικός","Ινδικός","Ειρηνικός","Αρκτικός"],a:2},
        {q:"Ποιος ζωγράφισε τη Μόνα Λίζα;",opts:["Μιχαήλ Άγγελος","Λεονάρντο ντα Βίντσι","Ελ Γκρέκο","Πικάσο"],a:1},
        {q:"Ποια είναι η πρωτεύουσα της Ιταλίας;",opts:["Μιλάνο","Βενετία","Ρώμη","Νάπολη"],a:2},
        {q:"Πόσες μέρες έχει το δίσεκτο έτος;",opts:["364","365","366","367"],a:2},
        {q:"Ποιο βουνό είναι το ψηλότερο στην Ελλάδα;",opts:["Ταΰγετος","Όλυμπος","Πήλιο","Ψηλορείτης"],a:1},
        {q:"Ποιος πλανήτης είναι πιο κοντά στον Ήλιο;",opts:["Αφροδίτη","Ερμής","Άρης","Γη"],a:1},
        {q:"Ποιος έγραψε την Οδύσσεια;",opts:["Ησίοδος","Όμηρος","Σοφοκλής","Ευριπίδης"],a:1},
        {q:"Πόσες ήπειροι υπάρχουν;",opts:["5","6","7","8"],a:2}],
      pairs_pool: [
        {a:"Ζεστό",b:"Κρύο"},{a:"Μεγάλο",b:"Μικρό"},{a:"Χαρούμενος",b:"Λυπημένος"},{a:"Μέρα",b:"Νύχτα"},
        {a:"Μαύρο",b:"Άσπρο"},{a:"Γρήγορο",b:"Αργό"},{a:"Καινούριο",b:"Παλιό"},{a:"Ψηλά",b:"Χαμηλά"},
        {a:"Ανοιχτό",b:"Κλειστό"},{a:"Δυνατός",b:"Αδύναμος"}],
      tf_pool: [
        {s:"Η Αθήνα είναι η πρωτεύουσα της Ελλάδας",a:true},{s:"Ο Ήλιος είναι αστέρι",a:true},
        {s:"Το χταπόδι έχει 8 πλοκάμια",a:true},{s:"Η εβδομάδα έχει 8 μέρες",a:false},
        {s:"Το μέλι δεν χαλάει ποτέ",a:true},{s:"Οι πιγκουίνοι ζουν στον Βόρειο Πόλο",a:false},
        {s:"Το Σινικό Τείχος είναι στην Κίνα",a:true},{s:"Η ντομάτα είναι λαχανικό",a:false}],
      recall_pool: ["🍎 Μήλο","🚗 Αυτοκίνητο","🌸 Λουλούδι","📚 Βιβλίο","🐕 Σκύλος","☕ Καφές","🎸 Κιθάρα","⚽ Μπάλα","🍕 Πίτσα","🌙 Φεγγάρι","🏠 Σπίτι","🎂 Τούρτα","🌹 Τριαντάφυλλο","🦁 Λιοντάρι","🍇 Σταφύλια"],
      flags_pool: [
        {flag:"🇺🇸",opts:["Καναδάς","Αυστραλία","ΗΠΑ","Νέα Ζηλανδία"],a:2},
        {flag:"🇬🇧",opts:["Ιρλανδία","Αυστραλία","Καναδάς","Ηνωμένο Βασίλειο"],a:3},
        {flag:"🇫🇷",opts:["Βέλγιο","Γαλλία","Ελβετία","Ιταλία"],a:1},
        {flag:"🇮🇹",opts:["Ιταλία","Ισπανία","Πορτογαλία","Ελλάδα"],a:0},
        {flag:"🇩🇪",opts:["Αυστρία","Ολλανδία","Γερμανία","Δανία"],a:2},
        {flag:"🇯🇵",opts:["Κίνα","Κορέα","Ιαπωνία","Ταϊλάνδη"],a:2},
        {flag:"🇬🇷",opts:["Κύπρος","Ελλάδα","Τουρκία","Αλβανία"],a:1},
        {flag:"🇪🇸",opts:["Μεξικό","Πορτογαλία","Ισπανία","Αργεντινή"],a:2}],
    },
  };

  // merge native content
  for (const [lang, pools] of Object.entries(C)) {
    if (i18nData[lang]) Object.assign(i18nData[lang], pools);
  }
  // safety net: ANY language missing ANY pool falls back to English content
  const POOL_KEYS = ["ws_pool","unscramble_pool","hangman_pool","proverbs_pool","trivia_pool",
                     "pairs_pool","tf_pool","recall_pool","flags_pool"];
  for (const lang of Object.keys(i18nData)) {
    for (const k of POOL_KEYS) {
      if (!i18nData[lang][k] && i18nData.en && i18nData.en[k]) i18nData[lang][k] = i18nData.en[k];
    }
  }

  // ── UI keys for the two simulation games (all 6 languages) ──
  const SIM = {
    he: {game_lifesim_title:"מסע בזמן", game_lifesim_desc:"מבוגרים משחקים צעירים, צעירים משחקים סבתא.", inst_lifesim:"בחרו תקופה, קבלו החלטות ואספו זיכרונות ❤",
         game_safari_title:"ספארי חי", game_safari_desc:"חיות נעות בסוואנה — מצאו אותן!", inst_safari:"הקשיבו למשימה והקישו על החיה הנכונה בזמן שהיא זזה"},
    en: {game_lifesim_title:"Time Journey", game_lifesim_desc:"Seniors play young, youngsters play grandma.", inst_lifesim:"Pick an era, make choices, collect memories ❤",
         game_safari_title:"Living Safari", game_safari_desc:"Animals roam the savanna — spot them!", inst_safari:"Read the task and tap the right animal as it moves"},
    es: {game_lifesim_title:"Viaje en el tiempo", game_lifesim_desc:"Los mayores juegan a ser jóvenes y al revés.", inst_lifesim:"Elige una época, toma decisiones, colecciona recuerdos ❤",
         game_safari_title:"Safari vivo", game_safari_desc:"Los animales recorren la sabana — ¡encuéntralos!", inst_safari:"Lee la tarea y toca el animal correcto mientras se mueve"},
    fr: {game_lifesim_title:"Voyage dans le temps", game_lifesim_desc:"Les aînés jouent les jeunes, et inversement.", inst_lifesim:"Choisissez une époque, décidez, collectez des souvenirs ❤",
         game_safari_title:"Safari vivant", game_safari_desc:"Les animaux parcourent la savane — trouvez-les !", inst_safari:"Lisez la consigne et touchez le bon animal en mouvement"},
    de: {game_lifesim_title:"Zeitreise", game_lifesim_desc:"Senioren spielen jung, Junge spielen Oma.", inst_lifesim:"Wähle eine Ära, triff Entscheidungen, sammle Erinnerungen ❤",
         game_safari_title:"Lebende Safari", game_safari_desc:"Tiere ziehen durch die Savanne — finde sie!", inst_safari:"Lies die Aufgabe und tippe das richtige Tier an"},
    el: {game_lifesim_title:"Ταξίδι στον χρόνο", game_lifesim_desc:"Οι μεγάλοι παίζουν νέους, οι νέοι παίζουν γιαγιά.", inst_lifesim:"Διάλεξε εποχή, πάρε αποφάσεις, μάζεψε αναμνήσεις ❤",
         game_safari_title:"Ζωντανό σαφάρι", game_safari_desc:"Ζώα κινούνται στη σαβάνα — βρες τα!", inst_safari:"Διάβασε την αποστολή και άγγιξε το σωστό ζώο"},
  };
  for (const [lang, kv] of Object.entries(SIM)) {
    if (i18nData[lang]) Object.assign(i18nData[lang], kv);
  }

  // ── UI keys for the 14 newer games (es/fr/de/el were falling back to English) ──
  const UI = {
    es: {
      game_tf_title:"Verdadero o falso", game_tf_desc:"Pon a prueba tus conocimientos: ¿cada frase es verdadera o falsa?",
      game_flags_title:"Quiz de banderas", game_flags_desc:"Adivina el país por su bandera.",
      game_proverbs_title:"Completa el refrán", game_proverbs_desc:"Añade la palabra que falta para terminar el dicho.",
      game_hangman_title:"El ahorcado", game_hangman_desc:"Adivina la palabra oculta antes de agotar los intentos.",
      game_recall_title:"Memoria visual", game_recall_desc:"Recuerda los objetos mostrados y luego selecciónalos.",
      game_tetris_title:"Tetris", game_tetris_desc:"Apila las piezas que caen para completar líneas.",
      game_colormatch_title:"Color y palabra", game_colormatch_desc:"¡Pulsa el color de la tinta, no la palabra!",
      game_digitspan_title:"Memoria de números", game_digitspan_desc:"Memoriza el número y escríbelo de memoria.",
      game_clock_title:"Lectura del reloj", game_clock_desc:"¿Qué hora es? Lee el reloj.",
      game_counting_title:"Conteo rápido", game_counting_desc:"Cuenta los símbolos indicados en la cuadrícula.",
      game_category_title:"Categorías", game_category_desc:"Elige la palabra que corresponde a la categoría.",
      game_letters_title:"Letra perdida", game_letters_desc:"Completa la letra que falta en la palabra.",
      inst_tetris:"Mover: ← → | Girar: ↑ | Bajar: ↓ | Táctil: desliza o usa los botones",
      inst_tf:"Lee la frase y elige: ¿verdadero o falso?",
      inst_flags:"Mira la bandera y elige el nombre correcto del país",
      inst_proverbs:"Lee el comienzo del refrán y complétalo",
      inst_hangman:"Adivina la palabra oculta letra por letra",
      inst_recall:"Observa los objetos y luego búscalos en el grupo grande",
    },
    fr: {
      game_tf_title:"Vrai ou faux", game_tf_desc:"Testez vos connaissances : chaque phrase est-elle vraie ou fausse ?",
      game_flags_title:"Quiz des drapeaux", game_flags_desc:"Trouvez le pays d'après son drapeau.",
      game_proverbs_title:"Complétez le proverbe", game_proverbs_desc:"Trouvez le mot manquant pour finir le dicton.",
      game_hangman_title:"Le pendu", game_hangman_desc:"Devinez le mot caché avant d'épuiser vos chances.",
      game_recall_title:"Mémoire visuelle", game_recall_desc:"Mémorisez les objets montrés, puis retrouvez-les.",
      game_tetris_title:"Tetris", game_tetris_desc:"Empilez les pièces qui tombent pour compléter des lignes.",
      game_colormatch_title:"Couleur et mot", game_colormatch_desc:"Touchez la couleur de l'encre — pas le mot !",
      game_digitspan_title:"Mémoire des chiffres", game_digitspan_desc:"Mémorisez le nombre puis saisissez-le.",
      game_clock_title:"Lecture de l'heure", game_clock_desc:"Quelle heure est-il ? Lisez l'horloge.",
      game_counting_title:"Comptage rapide", game_counting_desc:"Comptez les symboles demandés dans la grille.",
      game_category_title:"Catégories", game_category_desc:"Choisissez le mot qui correspond à la catégorie.",
      game_letters_title:"Lettre manquante", game_letters_desc:"Complétez la lettre manquante dans le mot.",
      inst_tetris:"Déplacer : ← → | Tourner : ↑ | Descendre : ↓ | Tactile : glissez ou touchez les boutons",
      inst_tf:"Lisez la phrase et choisissez : vrai ou faux",
      inst_flags:"Regardez le drapeau et choisissez le bon pays",
      inst_proverbs:"Lisez le début du proverbe et complétez-le",
      inst_hangman:"Devinez le mot caché lettre par lettre",
      inst_recall:"Observez les objets, puis retrouvez-les dans le grand groupe",
    },
    de: {
      game_tf_title:"Wahr oder falsch", game_tf_desc:"Testen Sie Ihr Wissen — ist jede Aussage wahr oder falsch?",
      game_flags_title:"Flaggen-Quiz", game_flags_desc:"Erkennen Sie das Land an seiner Flagge.",
      game_proverbs_title:"Sprichwort vervollständigen", game_proverbs_desc:"Ergänzen Sie das fehlende Wort im Sprichwort.",
      game_hangman_title:"Galgenmännchen", game_hangman_desc:"Erraten Sie das versteckte Wort, bevor die Versuche ausgehen.",
      game_recall_title:"Bildergedächtnis", game_recall_desc:"Merken Sie sich die Gegenstände und wählen Sie sie danach aus.",
      game_tetris_title:"Tetris", game_tetris_desc:"Stapeln Sie die fallenden Formen zu vollen Reihen.",
      game_colormatch_title:"Farbe und Wort", game_colormatch_desc:"Tippen Sie auf die Schriftfarbe — nicht auf das Wort!",
      game_digitspan_title:"Zahlengedächtnis", game_digitspan_desc:"Merken Sie sich die Zahl und geben Sie sie ein.",
      game_clock_title:"Uhr lesen", game_clock_desc:"Wie spät ist es? Lesen Sie die Uhr.",
      game_counting_title:"Schnell zählen", game_counting_desc:"Zählen Sie die gesuchten Symbole im Raster.",
      game_category_title:"Kategorien", game_category_desc:"Wählen Sie das Wort, das zur Kategorie passt.",
      game_letters_title:"Fehlender Buchstabe", game_letters_desc:"Ergänzen Sie den fehlenden Buchstaben im Wort.",
      inst_tetris:"Bewegen: ← → | Drehen: ↑ | Fallen: ↓ | Touch: wischen oder Tasten tippen",
      inst_tf:"Lesen Sie die Aussage und wählen Sie: wahr oder falsch",
      inst_flags:"Sehen Sie die Flagge an und wählen Sie das richtige Land",
      inst_proverbs:"Lesen Sie den Anfang des Sprichworts und vervollständigen Sie es",
      inst_hangman:"Erraten Sie das versteckte Wort Buchstabe für Buchstabe",
      inst_recall:"Prägen Sie sich die Gegenstände ein und finden Sie sie dann wieder",
    },
    el: {
      game_tf_title:"Σωστό ή λάθος", game_tf_desc:"Δοκιμάστε τις γνώσεις σας — κάθε πρόταση είναι σωστή ή λάθος;",
      game_flags_title:"Κουίζ σημαιών", game_flags_desc:"Βρείτε τη χώρα από τη σημαία της.",
      game_proverbs_title:"Συμπληρώστε την παροιμία", game_proverbs_desc:"Βρείτε τη λέξη που λείπει από την παροιμία.",
      game_hangman_title:"Κρεμάλα", game_hangman_desc:"Μαντέψτε την κρυμμένη λέξη πριν τελειώσουν οι ευκαιρίες.",
      game_recall_title:"Οπτική μνήμη", game_recall_desc:"Θυμηθείτε τα αντικείμενα και μετά επιλέξτε τα.",
      game_tetris_title:"Τέτρις", game_tetris_desc:"Στοιβάξτε τα σχήματα που πέφτουν για να γεμίσετε σειρές.",
      game_colormatch_title:"Χρώμα και λέξη", game_colormatch_desc:"Πατήστε το χρώμα του μελανιού — όχι τη λέξη!",
      game_digitspan_title:"Μνήμη αριθμών", game_digitspan_desc:"Απομνημονεύστε τον αριθμό και πληκτρολογήστε τον.",
      game_clock_title:"Διαβάζοντας το ρολόι", game_clock_desc:"Τι ώρα είναι; Διαβάστε το ρολόι.",
      game_counting_title:"Γρήγορο μέτρημα", game_counting_desc:"Μετρήστε τα ζητούμενα σύμβολα στο πλέγμα.",
      game_category_title:"Κατηγορίες", game_category_desc:"Διαλέξτε τη λέξη που ταιριάζει στην κατηγορία.",
      game_letters_title:"Το γράμμα που λείπει", game_letters_desc:"Συμπληρώστε το γράμμα που λείπει στη λέξη.",
      inst_tetris:"Κίνηση: ← → | Περιστροφή: ↑ | Πτώση: ↓ | Αφή: σύρετε ή πατήστε τα κουμπιά",
      inst_tf:"Διαβάστε την πρόταση και επιλέξτε: σωστό ή λάθος",
      inst_flags:"Δείτε τη σημαία και επιλέξτε τη σωστή χώρα",
      inst_proverbs:"Διαβάστε την αρχή της παροιμίας και συμπληρώστε την",
      inst_hangman:"Μαντέψτε την κρυμμένη λέξη γράμμα-γράμμα",
      inst_recall:"Παρατηρήστε τα αντικείμενα και βρείτε τα στη μεγάλη ομάδα",
    },
  };
  for (const [lang, kv] of Object.entries(UI)) {
    if (i18nData[lang]) Object.assign(i18nData[lang], kv);
  }
})();
