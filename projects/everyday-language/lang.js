"use strict";
/* Everyday Language — the data, with no DOM code, so Node can check it.
   Three benches, all of them checked in test.cjs:
   - The family tree: the Indo-European family as parent/child nodes.
     Classifications follow the standard consensus (Glottolog/Ethnologue
     style): English descends Proto-Indo-European -> Germanic -> West
     Germanic -> Anglo-Frisian -> English. French and Spanish are cousins
     (Romance, from Latin), not ancestors; their words in English are
     borrowings, mostly from 1066 on.
   - The cognates bench: word families whose kinship is standard textbook
     material. Every form below is a genuine descendant of the starred
     Proto-Indo-European root (a star means "reconstructed, never written
     down"). Where a familiar language replaced the word, that is said in
     the watchOut note instead of a false form being listed.
   - The phrasebook: ten everyday phrases in six languages, hand-checked
     phrasebook basics. It is a phrasebook, not a translator.
   Speaker and language counts for the other great families are
   approximations from Ethnologue/Glottolog-style counts and are labelled
   approximate on the page. */

const TREE = [
 { id: "pie", parent: null, name: "Proto-Indo-European",
   langs: "Nobody speaks it today — it is reconstructed",
   fact: "Spoken roughly 6,000 years ago; most linguists place its home on the steppe north of the Black and Caspian seas. It was never written down, so every word we give it is rebuilt from its descendants and written with a star (*). Everything on this tree is one of its descendants." },
 { id: "anatolian", parent: "pie", name: "Anatolian",
   langs: "Hittite, Luwian — all extinct",
   fact: "Hittite, written in cuneiform from about 1650 BCE, is the earliest Indo-European language we can actually read. The whole branch died out in ancient times." },
 { id: "tocharian", parent: "pie", name: "Tocharian",
   langs: "Tocharian A and B — both extinct",
   fact: "The family's great geography surprise: this branch was spoken in what is now western China, farther east than any other early branch, and has been extinct for over a thousand years." },
 { id: "indo-iranian", parent: "pie", name: "Indo-Iranian",
   langs: "The family's largest branch by number of speakers",
   fact: "One parent, two famous children: the Indic languages of South Asia and the Iranian languages to their west. Together they hold more speakers than any other branch." },
 { id: "indic", parent: "indo-iranian", name: "Indic (Indo-Aryan)",
   langs: "Hindi, Bengali, Punjabi, Marathi, Urdu, Sinhala; Sanskrit is the classical ancestor",
   fact: "Sanskrit, preserved in hymns composed around 1500 BCE, is among the oldest attested languages anywhere — and its grammar helped Europeans first work out that this whole family exists." },
 { id: "iranian", parent: "indo-iranian", name: "Iranian",
   langs: "Persian (Farsi), Pashto, Kurdish, Tajik, Ossetian",
   fact: "Persian has been written in the Arabic script for over a thousand years, yet the language itself is Indo-European — a standing lesson that a writing system and a language family are two different things." },
 { id: "greek", parent: "pie", name: "Greek (Hellenic)",
   langs: "Greek — a branch with essentially one language in it",
   fact: "Greek has the longest continuous written record of any branch: Mycenaean Greek, written in the Linear B script around 1450 BCE, is already recognisably Greek." },
 { id: "italic", parent: "pie", name: "Italic",
   langs: "Latin, plus the extinct Oscan and Umbrian",
   fact: "Most of this branch vanished. One language of it — Latin, from a small region of Italy — went on to parent an entire sub-family and lend words to half the world." },
 { id: "romance", parent: "italic", name: "Romance",
   langs: "Spanish, Portuguese, French, Italian, Romanian, Catalan",
   fact: "All of these descend from the everyday spoken Latin of the Roman world, not the polished literary kind. Romanian, far to the east, kept pieces of Latin grammar its western cousins lost." },
 { id: "germanic", parent: "pie", name: "Germanic",
   langs: "The branch English belongs to",
   fact: "Germanic is defined by a sound shift (Grimm's law): the parent's p, t, k became f, th, h. That is why Latin pater matches English father, and Latin ped- matches English foot — the consonants moved, the words are the same." },
 { id: "north-germanic", parent: "germanic", name: "North Germanic",
   langs: "Swedish, Danish, Norwegian, Icelandic, Faroese",
   fact: "Icelandic has changed so slowly that Icelanders can still read their medieval sagas, written 800 years ago, with a little effort." },
 { id: "west-germanic", parent: "germanic", name: "West Germanic",
   langs: "The parent of English, German, Dutch, and Frisian",
   fact: "Three of the world's most-spoken languages grow from this one branch — and its speakers were once a cluster of tribes along the North Sea coast." },
 { id: "anglo-frisian", parent: "west-germanic", name: "Anglo-Frisian",
   langs: "English and Frisian (and Scots, from English's line)",
   fact: "Frisian, still spoken along the Dutch and German North Sea coast, is English's closest living relative. An old rhyme makes the point: 'Good butter and good cheese is good English and good Frise.'" },
 { id: "english", parent: "anglo-frisian", name: "English",
   langs: "English — about 380 million native speakers, and the world's most learned second language (counts approximate)",
   fact: "Here is the surprise this room is built on: English is a Germanic language. After 1066 it borrowed an enormous layer of French and Latin vocabulary — roughly half its dictionary — but its grammar and its everyday core words (I, you, water, father, foot, night) are Germanic through and through. The borrowings are a coat of paint; the house is Germanic." },
 { id: "german-dutch", parent: "west-germanic", name: "German, Dutch & kin",
   langs: "German, Dutch, Afrikaans, Yiddish, Low German",
   fact: "English's big siblings. Dutch and German kept far more of the old Germanic grammar than English did — compare German Vater and Dutch vader with father on the cognates bench below." },
 { id: "balto-slavic", parent: "pie", name: "Balto-Slavic",
   langs: "One parent for the Baltic and Slavic languages",
   fact: "Linguists group these together because Baltic and Slavic share deep features of sound and grammar found nowhere else in the family." },
 { id: "baltic", parent: "balto-slavic", name: "Baltic",
   langs: "Lithuanian, Latvian (and extinct Old Prussian)",
   fact: "Lithuanian is famously conservative: it keeps sounds and word-shapes unusually close to the reconstructed parent, so linguists study it the way biologists study a living fossil." },
 { id: "slavic", parent: "balto-slavic", name: "Slavic",
   langs: "Russian, Ukrainian, Polish, Czech, Slovak, Serbian, Croatian, Bulgarian",
   fact: "The largest group in Europe by native speakers. Russian mat' (mother) still shows the old family root almost undisguised — try the cognates bench." },
 { id: "celtic", parent: "pie", name: "Celtic",
   langs: "Irish, Welsh, Scottish Gaelic, Breton",
   fact: "Celtic languages were once spoken across most of Europe — ancient Gaul, modern France, was Celtic-speaking — before Latin, and later Germanic and Romance languages, spread over the map." },
 { id: "armenian", parent: "pie", name: "Armenian",
   langs: "Armenian — its own branch",
   fact: "A branch of one language, with an alphabet of its own created in 405 CE that Armenian still uses today." },
 { id: "albanian", parent: "pie", name: "Albanian",
   langs: "Albanian — its own branch",
   fact: "Another single-language branch. Its early history was debated for centuries, because Albanian borrowed so heavily from its neighbours that the family resemblance took real work to prove." },
];

function treeNode(id) { return TREE.find((n) => n.id === id) || null; }
function treeChildren(id) { return TREE.filter((n) => n.parent === id); }
/* Walk from a node up to the root; returns the chain root-first. */
function ancestryPath(id) {
 const chain = [];
 let node = treeNode(id);
 if (!node) return chain;
 while (node) { chain.unshift(node.id); node = node.parent ? treeNode(node.parent) : null; }
 return chain;
}

const COGNATES = [
 { word: "father", root: "*ph₂tḗr", rootGloss: "the reconstructed word for “father”",
   forms: [
    ["English", "Germanic", "father"], ["German", "Germanic", "Vater"], ["Dutch", "Germanic", "vader"],
    ["Latin", "Italic", "pater"], ["Spanish", "Romance", "padre"], ["French", "Romance", "père"],
    ["Greek", "Hellenic", "patēr"], ["Sanskrit", "Indo-Iranian", "pitā"],
   ],
   note: "Watch the first letter travel: Latin and Greek keep the p, Germanic turned p into f — that is Grimm's law at work — so pater becomes father.",
   watchOut: "Russian's word for father, отец (otéc), looks as if it should join this family but doesn't: it grew from a nursery word, and the old root was lost in Slavic. Resemblance is not always relationship." },
 { word: "mother", root: "*méh₂tēr", rootGloss: "the reconstructed word for “mother”",
   forms: [
    ["English", "Germanic", "mother"], ["German", "Germanic", "Mutter"], ["Dutch", "Germanic", "moeder"],
    ["Latin", "Italic", "māter"], ["Spanish", "Romance", "madre"], ["French", "Romance", "mère"],
    ["Greek", "Hellenic", "mḗtēr"], ["Russian", "Slavic", "matʹ (мать)"], ["Sanskrit", "Indo-Iranian", "mātā"],
   ],
   note: "One of the steadiest words in the whole family — nearly every branch kept it in a shape you can still recognise at a glance." },
 { word: "three", root: "*tréyes", rootGloss: "the reconstructed word for “three”",
   forms: [
    ["English", "Germanic", "three"], ["German", "Germanic", "drei"], ["Dutch", "Germanic", "drie"],
    ["Latin", "Italic", "trēs"], ["Spanish", "Romance", "tres"], ["French", "Romance", "trois"],
    ["Greek", "Hellenic", "treîs"], ["Russian", "Slavic", "tri (три)"], ["Sanskrit", "Indo-Iranian", "tráyas"],
   ],
   note: "Germanic softened the opening t into th — which is why English three stands apart from the tres-treîs-tri row behind it." },
 { word: "night", root: "*nókʷts", rootGloss: "the reconstructed word for “night”",
   forms: [
    ["English", "Germanic", "night"], ["German", "Germanic", "Nacht"], ["Dutch", "Germanic", "nacht"],
    ["Latin", "Italic", "nox (stem noct-)"], ["Spanish", "Romance", "noche"], ["French", "Romance", "nuit"],
    ["Greek", "Hellenic", "nýx"], ["Russian", "Slavic", "nochʹ (ночь)"], ["Lithuanian", "Baltic", "naktis"],
    ["Sanskrit", "Indo-Iranian", "nákta — a Vedic word for “by night”"],
   ],
   note: "English night and the noct- inside nocturnal are the same word in two costumes — one inherited, one borrowed back from Latin." },
 { word: "heart", root: "*ḱērd-", rootGloss: "the reconstructed root for “heart”",
   forms: [
    ["English", "Germanic", "heart"], ["German", "Germanic", "Herz"], ["Dutch", "Germanic", "hart"],
    ["Latin", "Italic", "cor (stem cord-)"], ["Spanish", "Romance", "corazón"], ["French", "Romance", "cœur"],
    ["Greek", "Hellenic", "kardiá"], ["Russian", "Slavic", "serdtse (сердце)"], ["Sanskrit", "Indo-Iranian", "hṛd"],
   ],
   note: "One k sound split three ways: Germanic h (heart), Latin c (cor — English borrowed it back in cordial), Greek k (kardiá — borrowed back in cardiac). The family resemblance includes the borrowings." },
 { word: "water", root: "*wódr̥", rootGloss: "from the root *wed-, “water”",
   forms: [
    ["English", "Germanic", "water"], ["German", "Germanic", "Wasser"], ["Dutch", "Germanic", "water"],
    ["Greek", "Hellenic", "hýdōr"], ["Russian", "Slavic", "voda (вода)"], ["Sanskrit", "Indo-Iranian", "udán — “water, wave”"],
   ],
   note: "Greek hýdōr is why English is full of hydro- words, and Russian voda is the same root with its vowels rearranged by centuries of sound change.",
   watchOut: "Spanish agua and Latin aqua look as if they belong here, but they descend from a different root entirely. Resemblance is not always relationship." },
 { word: "brother", root: "*bʰréh₂tēr", rootGloss: "the reconstructed word for “brother”",
   forms: [
    ["English", "Germanic", "brother"], ["German", "Germanic", "Bruder"], ["Dutch", "Germanic", "broer"],
    ["Latin", "Italic", "frāter"], ["Italian", "Romance", "fratello"], ["French", "Romance", "frère"],
    ["Greek", "Hellenic", "phrātḗr"], ["Russian", "Slavic", "brat (брат)"], ["Sanskrit", "Indo-Iranian", "bhrātā"],
   ],
   note: "In Greek the word drifted in meaning: phrātḗr came to mean a fellow member of a clan — a “brother” by membership rather than by birth.",
   watchOut: "Spanish hermano is not family: it comes from Latin germānus, “full brother”, a different word that replaced the old one in Spanish." },
 { word: "foot", root: "*pṓds", rootGloss: "stem *ped-, the reconstructed word for “foot”",
   forms: [
    ["English", "Germanic", "foot"], ["German", "Germanic", "Fuß"], ["Dutch", "Germanic", "voet"],
    ["Latin", "Italic", "pēs (stem ped-)"], ["Spanish", "Romance", "pie"], ["French", "Romance", "pied"],
    ["Greek", "Hellenic", "poús"], ["Sanskrit", "Indo-Iranian", "pā́t"],
   ],
   note: "Grimm's law again — p became f and d became t on the Germanic road to foot. The Latin cousin lives on inside English borrowings: pedal, pedestrian, centipede.",
   watchOut: "Russian's word for a leg or foot, нога (nogá), comes from a different root. Not every everyday word survives in every branch." },
 { word: "ten", root: "*déḱm̥", rootGloss: "the reconstructed word for “ten”",
   forms: [
    ["English", "Germanic", "ten"], ["German", "Germanic", "zehn"], ["Dutch", "Germanic", "tien"],
    ["Latin", "Italic", "decem"], ["Spanish", "Romance", "diez"], ["French", "Romance", "dix"],
    ["Greek", "Hellenic", "déka"], ["Russian", "Slavic", "desyatʹ (десять)"], ["Sanskrit", "Indo-Iranian", "dáśa"],
   ],
   note: "Latin decem lives on in English decimal — and in December, the tenth month of the old Roman year. Greek déka gives us decade." },
 { word: "new", root: "*néwos", rootGloss: "the reconstructed word for “new”",
   forms: [
    ["English", "Germanic", "new"], ["German", "Germanic", "neu"], ["Dutch", "Germanic", "nieuw"],
    ["Latin", "Italic", "novus"], ["Spanish", "Romance", "nuevo"], ["French", "Romance", "nouveau"],
    ["Greek", "Hellenic", "néos"], ["Russian", "Slavic", "novyj (новый)"], ["Sanskrit", "Indo-Iranian", "náva"],
   ],
   note: "French nouveau grew from a Latin diminutive of novus — “a nice new little one”. Russian novyj shows the old root almost undisguised." },
 { word: "name", root: "*h₁nómn̥", rootGloss: "the reconstructed word for “name”",
   forms: [
    ["English", "Germanic", "name"], ["German", "Germanic", "Name"], ["Dutch", "Germanic", "naam"],
    ["Latin", "Italic", "nōmen"], ["Spanish", "Romance", "nombre"], ["French", "Romance", "nom"],
    ["Greek", "Hellenic", "ónoma"], ["Russian", "Slavic", "imya (имя)"], ["Sanskrit", "Indo-Iranian", "nā́ma"],
   ],
   note: "Spanish nombre picked up an extra b on its journey from Latin nōmen. Russian imya hides the root best of all — its sounds moved and softened the most over the centuries." },
];

const PHRASES = [
 { id: "hello", en: "Hello" },
 { id: "goodbye", en: "Goodbye" },
 { id: "please", en: "Please" },
 { id: "thankyou", en: "Thank you" },
 { id: "yes", en: "Yes" },
 { id: "no", en: "No" },
 { id: "excuse", en: "Excuse me" },
 { id: "where", en: "Where is …?" },
 { id: "understand", en: "I don't understand" },
 { id: "cost", en: "How much does it cost?" },
];

const LANGS = [
 { id: "es", name: "Spanish" },
 { id: "fr", name: "French" },
 { id: "de", name: "German" },
 { id: "it", name: "Italian" },
 { id: "pt", name: "Portuguese" },
 { id: "nl", name: "Dutch" },
];

/* Every phrase, in every language. Phrasebook basics, hand-checked. */
const TRANSLATIONS = {
 hello:     { es: "Hola", fr: "Bonjour", de: "Hallo", it: "Ciao", pt: "Olá", nl: "Hallo" },
 goodbye:   { es: "Adiós", fr: "Au revoir", de: "Auf Wiedersehen", it: "Arrivederci", pt: "Adeus", nl: "Tot ziens" },
 please:    { es: "Por favor", fr: "S'il vous plaît", de: "Bitte", it: "Per favore", pt: "Por favor", nl: "Alsjeblieft" },
 thankyou:  { es: "Gracias", fr: "Merci", de: "Danke", it: "Grazie", pt: "Obrigado / obrigada", nl: "Dank je wel" },
 yes:       { es: "Sí", fr: "Oui", de: "Ja", it: "Sì", pt: "Sim", nl: "Ja" },
 no:        { es: "No", fr: "Non", de: "Nein", it: "No", pt: "Não", nl: "Nee" },
 excuse:    { es: "Perdón", fr: "Excusez-moi", de: "Entschuldigung", it: "Scusi", pt: "Com licença", nl: "Pardon" },
 where:     { es: "¿Dónde está…?", fr: "Où est… ?", de: "Wo ist…?", it: "Dov'è…?", pt: "Onde fica…?", nl: "Waar is…?" },
 understand:{ es: "No entiendo", fr: "Je ne comprends pas", de: "Ich verstehe nicht", it: "Non capisco", pt: "Não entendo", nl: "Ik begrijp het niet" },
 cost:      { es: "¿Cuánto cuesta?", fr: "Combien ça coûte ?", de: "Wie viel kostet das?", it: "Quanto costa?", pt: "Quanto custa?", nl: "Hoeveel kost het?" },
};

const PHRASE_NOTES = {
 thankyou: "Portuguese codes the speaker into the word: men say obrigado, women say obrigada — the language carries a little extra information about who is talking.",
 please: "German Bitte does double duty: it means both “please” and “you're welcome”. One word, two jobs — context does the decoding.",
};

function translate(phraseId, langId) {
 const row = TRANSLATIONS[phraseId];
 if (!row) return null;
 return Object.prototype.hasOwnProperty.call(row, langId) ? row[langId] : null;
}

/* The other great families. Counts are approximations from
   Ethnologue/Glottolog-style counts and are labelled approximate
   wherever they appear on the page. */
const FAMILIES = [
 { name: "Sino-Tibetan", size: "≈450 languages · ≈1.4 billion speakers",
   langs: "Mandarin Chinese, Cantonese, Burmese, Tibetan",
   fact: "Mandarin has more native speakers than any other language on Earth. This family covers China and much of mainland Southeast Asia." },
 { name: "Niger-Congo", size: "≈1,500 languages — the most of any family · ≈700 million speakers",
   langs: "Swahili, Yoruba, Igbo, Zulu, Shona",
   fact: "One of its sub-branches, the Bantu languages, spread with farming peoples across most of sub-Saharan Africa." },
 { name: "Afroasiatic", size: "≈380 languages · roughly 400–500 million speakers",
   langs: "Arabic, Hebrew, Amharic, Hausa, and Ancient Egyptian",
   fact: "The family with the longest written record of all: Egyptian hieroglyphs in this family are more than 5,000 years old." },
 { name: "Austronesian", size: "≈1,200 languages · ≈300 million speakers",
   langs: "Malay/Indonesian, Tagalog, Javanese, Hawaiian, Māori",
   fact: "Spread by boat across half the planet's surface: from Madagascar, off the coast of Africa, to Easter Island, off South America." },
 { name: "Trans-New Guinea", size: "≈480 languages · ≈3.5 million speakers",
   langs: "Enga, Melpa, Dani, and hundreds of highland languages of New Guinea",
   fact: "New Guinea is the most language-dense place on Earth: Papua New Guinea alone has more than 800 living languages." },
];

/* The link shelf. Every URL was checked live on 18 November 2026.
   Omniglot answers scripted checks with HTTP 403 but serves readers
   normally; it was verified by reading the page itself (the same
   treatment the Radio Room gives QRZ) and is recorded in COLLECTION.md. */
const LINKS = [
 { group: "Read deeper — Wikipedia", items: [
  ["Wikipedia — Language family", "https://en.wikipedia.org/wiki/Language_family", "What a language family is, how linguists prove one exists, and the world's major families mapped."],
  ["Wikipedia — Indo-European languages", "https://en.wikipedia.org/wiki/Indo-European_languages", "The tree on this page, in full: every branch, its history, and the evidence behind it."],
  ["Wikipedia — Germanic languages", "https://en.wikipedia.org/wiki/Germanic_languages", "English's own branch under the microscope, Grimm's law included."],
  ["Wikipedia — English language", "https://en.wikipedia.org/wiki/English_language", "How a Germanic language collected the world's largest vocabulary — borrowings and all."],
  ["Wikipedia — Cognate", "https://en.wikipedia.org/wiki/Cognate", "The cognates bench, defined properly: what counts as a true cognate and what is merely a lookalike."],
  ["Wikipedia — Proto-Indo-European language", "https://en.wikipedia.org/wiki/Proto-Indo-European_language", "The reconstructed parent: its sounds, its grammar, and how scholars rebuilt a language nobody ever wrote down."],
  ["Wikipedia — Broca's area", "https://en.wikipedia.org/wiki/Broca%27s_area", "The production area from the brain section: the 1861 patient, the evidence, and what modern scans add."],
  ["Wikipedia — Wernicke's area", "https://en.wikipedia.org/wiki/Wernicke%27s_area", "The comprehension area: fluent-but-empty speech, and what it taught us about meaning."],
 ] },
 { group: "The family's official records", items: [
  ["Glottolog", "https://glottolog.org/", "The scholarly catalogue of the world's languages and families — the reference linguists argue from, free to browse."],
  ["World Atlas of Language Structures (WALS)", "https://wals.info/", "Maps of how the world's languages differ: word order, sounds, and grammar features, plotted language by language."],
  ["Omniglot", "https://www.omniglot.com/", "The encyclopedia of writing systems: alphabets, syllabaries, and characters, with phrases in hundreds of languages."],
 ] },
 { group: "Real translators (the phrasebook's big siblings)", items: [
  ["Google Translate", "https://translate.google.com/", "Free machine translation for whole sentences and pages, in over 200 languages."],
  ["DeepL", "https://www.deepl.com/en/translator", "A translator known for natural phrasing in European languages — the one to try for letters and documents."],
 ] },
];

if (typeof module !== "undefined" && module.exports) {
 module.exports = { TREE, treeNode, treeChildren, ancestryPath, COGNATES, PHRASES, LANGS,
  TRANSLATIONS, PHRASE_NOTES, translate, FAMILIES, LINKS };
}
