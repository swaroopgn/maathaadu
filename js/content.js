// Content for missions, echo ladder, ajji call and story time.
// Audio lives at audio/<group>/<id>.mp3 (+ _slow variants).

const MISSIONS = [
  // tier E — single phrases
  { id: "m_neeru",     tier: 1, do: "Ask for water — in Kannada only!",            kn: "ನೀರು ಬೇಕು",                        tr: "neeru beku" },
  { id: "m_hasivu",    tier: 1, do: "Tell someone you're hungry",                  kn: "ನನಗೆ ಹಸಿವು",                       tr: "nanage hasivu" },
  { id: "m_baa",       tier: 1, do: "Call someone over to you",                    kn: "ಬಾ ಇಲ್ಲಿ",                          tr: "baa illi" },
  { id: "m_beda",      tier: 1, do: "Say no-thanks to something, the Kannada way", kn: "ಬೇಡ",                              tr: "beda" },
  { id: "m_innu",      tier: 1, do: "Ask for more of something you like",          kn: "ಇನ್ನೂ ಬೇಕು",                       tr: "innu beku" },
  { id: "m_hogona",    tier: 1, do: "Time to leave? You say it first",             kn: "ಹೋಗೋಣ!",                           tr: "hogona" },
  { id: "m_chennagide",tier: 1, do: "Say something is really nice",                kn: "ಚೆನ್ನಾಗಿದೆ!",                      tr: "chennagide" },
  { id: "m_goodnight", tier: 1, do: "Say good night in Kannada tonight",           kn: "ಶುಭರಾತ್ರಿ",                        tr: "shubharaatri" },
  { id: "m_thanks",    tier: 1, do: "Say thank you in Kannada today",              kn: "ಧನ್ಯವಾದ",                          tr: "dhanyavaada" },
  { id: "m_bartini",   tier: 1, do: "When someone calls you, answer in Kannada",   kn: "ಬರ್ತೀನಿ!",                         tr: "bartini" },
  { id: "m_appa_elli", tier: 1, do: "Ask where appa (or amma) is",                 kn: "ಅಪ್ಪ ಎಲ್ಲಿ?",                      tr: "appa elli" },
  { id: "m_elu",       tier: 1, do: "Wake somebody up — loudly!",                  kn: "ಏಳು!",                             tr: "elu" },
  // tier M — sentences
  { id: "m_ootakke",   tier: 2, do: "Ask what's for dinner",                       kn: "ಊಟಕ್ಕೆ ಏನು?",                      tr: "ootakke enu" },
  { id: "m_ruchi",     tier: 2, do: "Tell the cook the food is tasty",             kn: "ತುಂಬಾ ರುಚಿ ಇದೆ!",                  tr: "tumba ruchi ide" },
  { id: "m_horage",    tier: 2, do: "Ask if you can go outside",                   kn: "ಹೊರಗೆ ಹೋಗಲಾ?",                     tr: "horage hogala" },
  { id: "m_sahaaya",   tier: 2, do: "Ask someone for a little help",               kn: "ಸ್ವಲ್ಪ ಸಹಾಯ ಮಾಡು",                 tr: "svalpa sahaaya maadu" },
  { id: "m_count5",    tier: 2, do: "Count something out loud to five",            kn: "ಒಂದು, ಎರಡು, ಮೂರು, ನಾಲ್ಕು, ಐದು",     tr: "ondu, eradu, mooru, naalku, aidu" },
  { id: "m_love",      tier: 2, do: "Tell amma you love her — in Kannada",         kn: "ಅಮ್ಮ, ನೀನು ಅಂದ್ರೆ ನನಗೆ ಇಷ್ಟ",       tr: "amma, neenu andre nanage ishta" },
  // tier H — negotiation & open speech
  { id: "m_screentime",tier: 3, do: "Negotiate ten more minutes of screen time — Kannada only", kn: "ಇನ್ನೂ ಹತ್ತು ನಿಮಿಷ ಪ್ಲೀಸ್!", tr: "innu hattu nimisha please" },
  { id: "m_school",    tier: 3, do: "Tell one thing about your day — start like this and finish it yourself", kn: "ಇವತ್ತು ಶಾಲೆಯಲ್ಲಿ…", tr: "ivattu shaaleyalli…" },
  { id: "m_tindi",     tier: 3, do: "Ask for your snack with a full sentence",     kn: "ಅಮ್ಮ, ನನಗೆ ತಿಂಡಿ ಕೊಡು",             tr: "amma, nanage tindi kodu" },
];

const ECHO = [
  // level 1 — two words
  { id: "e_neeru",   lvl: 1, kn: "ನೀರು ಬೇಕು",                        tr: "neeru beku" },
  { id: "e_baa",     lvl: 1, kn: "ಬಾ ಇಲ್ಲಿ",                          tr: "baa illi" },
  { id: "e_amma",    lvl: 1, kn: "ಅಮ್ಮ ಎಲ್ಲಿ?",                       tr: "amma elli?" },
  { id: "e_naayi",   lvl: 1, kn: "ನಾಯಿ ನೋಡು!",                        tr: "naayi nodu!" },
  { id: "e_bekku",   lvl: 1, kn: "ಅದು ಬೆಕ್ಕು",                        tr: "adu bekku" },
  { id: "e_ishta",   lvl: 1, kn: "ನನಗೆ ಇಷ್ಟ",                         tr: "nanage ishta" },
  // level 2 — short sentences
  { id: "e_dose",    lvl: 2, kn: "ನನಗೆ ದೋಸೆ ಬೇಕು",                    tr: "nanage dose beku" },
  { id: "e_haalu",   lvl: 2, kn: "ಬೆಕ್ಕು ಹಾಲು ಕುಡಿಯುತ್ತೆ",             tr: "bekku haalu kudiyutte" },
  { id: "e_aane",    lvl: 2, kn: "ಆನೆ ತುಂಬಾ ದೊಡ್ಡದು",                  tr: "aane tumba doddadu" },
  { id: "e_shaale",  lvl: 2, kn: "ಇವತ್ತು ಶಾಲೆ ಇಲ್ಲ",                   tr: "ivattu shaale illa" },
  { id: "e_huli",    lvl: 2, kn: "ಹುಲಿ ಕಾಡಲ್ಲಿ ಇರುತ್ತೆ",               tr: "huli kaadalli irutte" },
  { id: "e_oota",    lvl: 2, kn: "ನಾನು ಊಟ ಮಾಡಿದೆ",                    tr: "naanu oota maadide" },
  // level 3 — big-kid sentences
  { id: "e_anna",    lvl: 3, kn: "ಅಮ್ಮ, ನನಗೆ ಇನ್ನೂ ಸ್ವಲ್ಪ ಅನ್ನ ಬೇಕು",   tr: "amma, nanage innu svalpa anna beku" },
  { id: "e_park",    lvl: 3, kn: "ನಾವು ಪಾರ್ಕ್‌ಗೆ ಹೋಗೋಣವಾ?",           tr: "naavu park-ge hogonavaa?" },
  { id: "e_ajji",    lvl: 3, kn: "ಅಜ್ಜಿ ಮನೆಗೆ ಯಾವಾಗ ಹೋಗ್ತೀವಿ?",        tr: "ajji manege yaavaaga hogtivi?" },
  { id: "e_kannada", lvl: 3, kn: "ನನಗೆ ಕನ್ನಡ ಮಾತಾಡೋಕೆ ಇಷ್ಟ",           tr: "nanage kannada maataadoke ishta" },
  { id: "e_nidde",   lvl: 3, kn: "ನನಗೆ ತುಂಬಾ ನಿದ್ದೆ ಬರ್ತಿದೆ",           tr: "nanage tumba nidde bartide" },
  { id: "e_naale",   lvl: 3, kn: "ನಾಳೆ ನಾವು ಏನು ಮಾಡೋಣ?",              tr: "naale naavu enu maadona?" },
];

const AJJI = [
  { id: "a_hegiddiya", kn: "ಅಜ್ಜಿ, ಹೇಗಿದ್ದೀಯಾ?",       tr: "ajji, hegiddiya?",        en: "Ajji, how are you?" },
  { id: "a_chennagi",  kn: "ನಾನು ಚೆನ್ನಾಗಿದ್ದೀನಿ!",     tr: "naanu chennagiddini!",    en: "I'm doing great!" },
  { id: "a_oota",      kn: "ಊಟ ಆಯ್ತಾ?",                tr: "oota aayta?",             en: "Did you eat?" },
  { id: "a_enu_maadide",kn: "ಇವತ್ತು ಏನು ಮಾಡಿದೆ?",      tr: "ivattu enu maadide?",     en: "What did you do today?" },
  { id: "a_bye",       kn: "ಮತ್ತೆ ಮಾತಾಡೋಣ, ಬೈ!",       tr: "matte maataadona, bye!",  en: "Let's talk again, bye!" },
];

// ಹಸಿದ ಬೆಕ್ಕು — The Hungry Cat. Uses only art the kids already know.
const STORY = {
  id: "hasida_bekku",
  title_kn: "ಹಸಿದ ಬೆಕ್ಕು",
  title_en: "The Hungry Cat",
  parts: [
    { type: "line", id: "s_1",  kn: "ಒಂದು ಊರಲ್ಲಿ ಒಂದು ಬೆಕ್ಕು ಇತ್ತು.",          en: "In a little town there was a cat.",      art: "bekku" },
    { type: "line", id: "s_2",  kn: "ಬೆಕ್ಕಿಗೆ ತುಂಬಾ ಹಸಿವು!",                    en: "The cat was very hungry!",               art: "bekku" },
    { type: "line", id: "s_3",  kn: "ಬೆಕ್ಕು ಒಂದು ಮನೆಗೆ ಹೋಯಿತು.",               en: "The cat went to a house.",               art: "bekku" },
    { type: "line", id: "s_4",  kn: "ಅಲ್ಲಿ ಒಂದು ದೊಡ್ಡ ದೋಸೆ ಇತ್ತು!",              en: "There was a big dosa there!",            art: "dose" },
    { type: "q",    id: "sq_1", kn: "ಮನೆಯಲ್ಲಿ ಏನು ಇತ್ತು — ದೋಸೆನಾ, ಬಾಳೆಹಣ್ಣಾ?",   opts: ["dose", "baalehannu"], ans: "dose" },
    { type: "line", id: "s_5",  kn: "ಆದರೆ ಅಲ್ಲಿ ಒಂದು ನಾಯಿ ಇತ್ತು.",              en: "But there was a dog there.",             art: "naayi" },
    { type: "q",    id: "sq_2", kn: "ಅಲ್ಲಿ ಯಾರು ಇತ್ತು — ನಾಯಿನಾ, ಹುಲಿನಾ?",        opts: ["naayi", "huli"], ans: "naayi" },
    { type: "line", id: "s_6",  kn: "ನಾಯಿ ಹೇಳಿತು: “ಬೌ ಬೌ! ಇದು ನನ್ನ ದೋಸೆ!”", en: "The dog said: Bow bow! This is my dosa!", art: "naayi" },
    { type: "line", id: "s_7",  kn: "ಬೆಕ್ಕು ಹೇಳಿತು: “ಮಿಯಾಂವ್! ನನಗೆ ತುಂಬಾ ಹಸಿವು!”", en: "The cat said: Miaow! I'm so hungry!", art: "bekku" },
    { type: "q",    id: "sq_3", kn: "ಯಾರಿಗೆ ಹಸಿವು — ಬೆಕ್ಕಿಗಾ, ಆನೆಗಾ?",           opts: ["bekku", "aane"], ans: "bekku" },
    { type: "line", id: "s_8",  kn: "ನಾಯಿ ಒಳ್ಳೆಯದು. ಅರ್ಧ ದೋಸೆ ಕೊಟ್ಟಿತು.",        en: "The dog was kind. It gave half the dosa.", art: "dose" },
    { type: "line", id: "s_9",  kn: "ಇಬ್ಬರೂ ದೋಸೆ ತಿಂದರು.",                      en: "They both ate the dosa.",                art: "dose" },
    { type: "line", id: "s_10", kn: "ಬೆಕ್ಕು ಮತ್ತು ನಾಯಿ ಫ್ರೆಂಡ್ಸ್ ಆದರು!",         en: "The cat and the dog became friends!",    art: "naayi" },
    { type: "q",    id: "sq_4", kn: "ಇಬ್ಬರೂ ಏನು ತಿಂದರು — ದೋಸೆನಾ, ಮೀನಾ?",         opts: ["dose", "meenu"], ans: "dose" },
  ],
};
