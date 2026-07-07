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
})();
