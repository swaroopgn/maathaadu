// Lesson data for Maathaadu!
// Each item: id (audio filename), kn (Kannada script), tr (canonical transliteration),
// ok (accepted variants), en (meaning), emoji.

const LESSONS = [
  {
    id: "animals",
    kn: "ಪ್ರಾಣಿಗಳು",
    title: "Animals",
    color: "red",
    icon: "🐘",
    items: [
      { id: "naayi",   kn: "ನಾಯಿ",    tr: "naayi",   ok: ["nayi", "naai"],          en: "dog",      emoji: "🐶" },
      { id: "bekku",   kn: "ಬೆಕ್ಕು",   tr: "bekku",   ok: ["beku"],                  en: "cat",      emoji: "🐱" },
      { id: "aane",    kn: "ಆನೆ",     tr: "aane",    ok: ["ane"],                   en: "elephant", emoji: "🐘" },
      { id: "huli",    kn: "ಹುಲಿ",    tr: "huli",    ok: ["hooli"],                 en: "tiger",    emoji: "🐯" },
      { id: "hasu",    kn: "ಹಸು",     tr: "hasu",    ok: ["hasoo"],                 en: "cow",      emoji: "🐮" },
      { id: "kudure",  kn: "ಕುದುರೆ",  tr: "kudure",  ok: ["kudre", "kudhure"],      en: "horse",    emoji: "🐴" },
      { id: "meenu",   kn: "ಮೀನು",    tr: "meenu",   ok: ["minu", "miinu"],         en: "fish",     emoji: "🐟" },
      { id: "hakki",   kn: "ಹಕ್ಕಿ",   tr: "hakki",   ok: ["haki"],                  en: "bird",     emoji: "🐦" }
    ]
  },
  {
    id: "food",
    kn: "ತಿಂಡಿ ಊಟ",
    title: "Food",
    color: "yellow",
    icon: "🍌",
    items: [
      { id: "anna_rice",  kn: "ಅನ್ನ",       tr: "anna",       ok: ["ana"],                        en: "rice",          emoji: "🍚" },
      { id: "haalu",      kn: "ಹಾಲು",      tr: "haalu",      ok: ["halu", "haloo"],              en: "milk",          emoji: "🥛" },
      { id: "neeru",      kn: "ನೀರು",      tr: "neeru",      ok: ["niru", "niiru"],              en: "water",         emoji: "💧" },
      { id: "hannu",      kn: "ಹಣ್ಣು",     tr: "hannu",      ok: ["hanu"],                       en: "fruit",         emoji: "🍎" },
      { id: "baalehannu", kn: "ಬಾಳೆಹಣ್ಣು", tr: "baalehannu", ok: ["balehannu", "baale hannu"],   en: "banana",        emoji: "🍌" },
      { id: "dose",       kn: "ದೋಸೆ",      tr: "dose",       ok: ["dosay", "dosae", "dosa"],     en: "dosa",          emoji: "🥞" },
      { id: "mosaru",     kn: "ಮೊಸರು",     tr: "mosaru",     ok: ["mosru"],                      en: "curd (yogurt)", emoji: "🥣" },
      { id: "sihi",       kn: "ಸಿಹಿ",      tr: "sihi",       ok: ["sihee", "seehee"],            en: "sweet",         emoji: "🍬" }
    ]
  },
  {
    id: "family",
    kn: "ಮನೆ ಜನ",
    title: "Family & Home",
    color: "green",
    icon: "🏠",
    items: [
      { id: "amma",    kn: "ಅಮ್ಮ",    tr: "amma",    ok: ["ama"],                 en: "mom",            emoji: "👩🏽" },
      { id: "appa",    kn: "ಅಪ್ಪ",    tr: "appa",    ok: ["apa"],                 en: "dad",            emoji: "👨🏽" },
      { id: "ajji",    kn: "ಅಜ್ಜಿ",   tr: "ajji",    ok: ["aji"],                 en: "grandma",        emoji: "👵🏽" },
      { id: "ajja",    kn: "ಅಜ್ಜ",    tr: "ajja",    ok: ["aja"],                 en: "grandpa",        emoji: "👴🏽" },
      { id: "anna_bro",kn: "ಅಣ್ಣ",    tr: "anna",    ok: ["ana"],                 en: "big brother",    emoji: "👦🏽" },
      { id: "thamma",  kn: "ತಮ್ಮ",    tr: "thamma",  ok: ["tamma", "tama"],       en: "little brother", emoji: "🧒🏽" },
      { id: "mane",    kn: "ಮನೆ",     tr: "mane",    ok: ["manay"],               en: "house",          emoji: "🏠" },
      { id: "baagilu", kn: "ಬಾಗಿಲು",  tr: "baagilu", ok: ["bagilu", "baglu"],     en: "door",           emoji: "🚪" }
    ]
  },
  {
    id: "phrases",
    kn: "ಮಾತಾಡು!",
    title: "Little Phrases",
    color: "pink",
    icon: "💬",
    items: [
      { id: "baa_illi",      kn: "ಬಾ ಇಲ್ಲಿ",     tr: "baa illi",      ok: ["ba illi", "bailli", "baa ili"],           en: "come here!",      emoji: "👋" },
      { id: "oota_aaytaa",   kn: "ಊಟ ಆಯ್ತಾ?",   tr: "oota aaytaa",   ok: ["uta ayta", "oota ayta", "oota aita"],     en: "did you eat?",    emoji: "🍽️" },
      { id: "nanage_hasivu", kn: "ನನಗೆ ಹಸಿವು",  tr: "nanage hasivu", ok: ["nange hasivu", "nanage hasvu"],           en: "I'm hungry",      emoji: "😋" },
      { id: "neeru_beku",    kn: "ನೀರು ಬೇಕು",   tr: "neeru beku",    ok: ["niru beku", "neeru beeku"],               en: "I want water",    emoji: "🥤" },
      { id: "malagu",        kn: "ಮಲಗು",        tr: "malagu",        ok: ["malgu", "malago"],                        en: "go to sleep",     emoji: "😴" },
      { id: "elu",           kn: "ಏಳು",         tr: "elu",           ok: ["eelu", "yelu", "aelu"],                   en: "wake up!",        emoji: "⏰" },
      { id: "hogona",        kn: "ಹೋಗೋಣ",       tr: "hogona",        ok: ["hogonna", "hoogoona", "hogoNa"],          en: "let's go!",       emoji: "🚗" },
      { id: "chennagide",    kn: "ಚೆನ್ನಾಗಿದೆ",  tr: "chennagide",    ok: ["chenagide", "channagide", "chennagidhe"], en: "it's nice!",      emoji: "👍" }
    ]
  }
];

// Praise clips played after a correct answer (audio/praise/<id>.mp3)
const PRAISE = [
  { id: "bhesh",      kn: "ಭೇಷ್!" },
  { id: "super",      kn: "ಸೂಪರ್!" },
  { id: "chennagide", kn: "ಚೆನ್ನಾಗಿದೆ!" },
  { id: "sari",       kn: "ಸರಿಯಾಗಿ ಹೇಳಿದೆ!" }
];
