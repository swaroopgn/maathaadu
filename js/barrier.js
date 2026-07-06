/* ಹೇಳು-ಕೇಳು (Helu-Kelu) — sibling barrier game.
   One player sees a secret word and says it in Kannada out loud;
   the other finds the matching picture. Points go to the team. */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const CATS = {
    animals: {
      kn: "ಪ್ರಾಣಿಗಳು",
      items: [
        { id: "naayi",   kn: "ನಾಯಿ",    tr: "naayi",   en: "dog" },
        { id: "bekku",   kn: "ಬೆಕ್ಕು",   tr: "bekku",   en: "cat" },
        { id: "aane",    kn: "ಆನೆ",     tr: "aane",    en: "elephant" },
        { id: "huli",    kn: "ಹುಲಿ",    tr: "huli",    en: "tiger" },
        { id: "hasu",    kn: "ಹಸು",     tr: "hasu",    en: "cow" },
        { id: "kudure",  kn: "ಕುದುರೆ",  tr: "kudure",  en: "horse" },
        { id: "meenu",   kn: "ಮೀನು",    tr: "meenu",   en: "fish" },
        { id: "hakki",   kn: "ಹಕ್ಕಿ",   tr: "hakki",   en: "bird" },
      ],
    },
    food: {
      kn: "ತಿಂಡಿ ಊಟ",
      items: [
        { id: "anna_rice",  kn: "ಅನ್ನ",       tr: "anna",       en: "rice" },
        { id: "haalu",      kn: "ಹಾಲು",      tr: "haalu",      en: "milk" },
        { id: "neeru",      kn: "ನೀರು",      tr: "neeru",      en: "water" },
        { id: "hannu",      kn: "ಹಣ್ಣು",     tr: "hannu",      en: "fruit" },
        { id: "baalehannu", kn: "ಬಾಳೆಹಣ್ಣು", tr: "baalehannu", en: "banana" },
        { id: "dose",       kn: "ದೋಸೆ",      tr: "dose",       en: "dosa" },
        { id: "mosaru",     kn: "ಮೊಸರು",     tr: "mosaru",     en: "curd" },
        { id: "sihi",       kn: "ಸಿಹಿ",      tr: "sihi",       en: "sweet" },
      ],
    },
  };

  const PLAYERS = {
    anna:  { kn: "ಅಣ್ಣ",  name: "Anna",  av: "#av-anna" },
    putta: { kn: "ಪುಟ್ಟ", name: "Putta", av: "#av-putta" },
  };

  const PRAISE_IDS = ["bhesh", "super", "chennagide", "sari"];
  const ROUNDS = 6;
  const GRID = 6;

  const state = {
    cat: null,
    round: 0,
    score: 0,
    speaker: "anna",
    secret: null,
    used: [],
    audio: null,
  };

  /* ---------------- audio ---------------- */

  function play(src, next) {
    if (state.audio) state.audio.pause();
    const a = new Audio(src);
    state.audio = a;
    if (next) a.addEventListener("ended", next);
    a.play().catch(() => {});
  }
  const wordSrc = (item, slow) => `audio/${state.cat}/${item.id}${slow ? "_slow" : ""}.mp3`;
  const praiseSrc = () => `audio/praise/${PRAISE_IDS[Math.floor(Math.random() * PRAISE_IDS.length)]}.mp3`;

  let actx;
  function beep(freqs, dur = 0.12, type = "sine", gain = 0.12) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(gain, actx.currentTime + i * dur);
        g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + i * dur + dur);
        o.connect(g).connect(actx.destination);
        o.start(actx.currentTime + i * dur);
        o.stop(actx.currentTime + i * dur + dur);
      });
    } catch (e) { /* decorative */ }
  }
  const sndGood = () => beep([620, 830, 1050], 0.11, "triangle");
  const sndBad = () => beep([230, 180], 0.15, "sawtooth", 0.06);
  const sndTap = () => beep([420], 0.06, "square", 0.06);

  /* ---------------- helpers ---------------- */

  function show(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(id).classList.add("active");
    window.scrollTo(0, 0);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const other = (p) => (p === "anna" ? "putta" : "anna");
  const setArt = (el, id) => el.querySelector("use").setAttribute("href", `#pic-${id}`);
  const scoreText = () => `team score: ${state.score} of ${state.round}`;

  /* ---------------- flow ---------------- */

  function startGame(cat) {
    state.cat = cat;
    state.round = 0;
    state.score = 0;
    state.used = [];
    state.speaker = Math.random() < 0.5 ? "anna" : "putta";
    nextRound();
  }

  function nextRound() {
    if (state.round >= ROUNDS) return showFinal();

    const pool = CATS[state.cat].items.filter((i) => !state.used.includes(i.id));
    state.secret = pool[Math.floor(Math.random() * pool.length)];
    state.used.push(state.secret.id);

    const sp = PLAYERS[state.speaker];
    const li = PLAYERS[other(state.speaker)];
    $("pass-avatar-svg").querySelector("use").setAttribute("href", sp.av);
    $("pass-title").textContent = `Give the iPad to ${sp.kn} ${sp.name}`;
    $("pass-note-text").textContent = `${li.name} — look away and open your ears!`;
    $("pass-score").textContent = state.round ? scoreText() : "";
    show("s-pass");
  }

  function showSpeak() {
    const sp = PLAYERS[state.speaker];
    $("speak-title").textContent = `Your secret word, ${sp.name}:`;
    setArt($("secret-art"), state.secret.id);
    $("secret-kn").textContent = state.secret.kn;
    $("secret-tr").textContent = state.secret.tr;
    show("s-speak");
  }

  function showListenerPass() {
    const li = PLAYERS[other(state.speaker)];
    $("pass-avatar-svg").querySelector("use").setAttribute("href", li.av);
    $("pass-title").textContent = `Now pass it to ${li.kn} ${li.name}`;
    $("pass-note-text").textContent = "Did you hear it? Time to find it!";
    $("pass-score").textContent = "";
    // reuse the pass screen; the continue button routes by phase
    state.phase = "listen";
    show("s-pass");
  }

  function showGuess() {
    const sp = PLAYERS[state.speaker];
    $("guess-title").textContent = `What did ${sp.name} say? Tap it!`;
    const others = shuffle(CATS[state.cat].items.filter((i) => i.id !== state.secret.id)).slice(0, GRID - 1);
    const opts = shuffle([state.secret, ...others]);
    const grid = $("guess-grid");
    grid.innerHTML = "";
    opts.forEach((opt) => {
      const b = document.createElement("button");
      b.className = "guess-card";
      b.setAttribute("aria-label", "picture choice");
      b.innerHTML = `<svg><use href="#pic-${opt.id}"/></svg>`;
      b.addEventListener("click", () => {
        if (state.answered) return;
        state.answered = true;
        const hit = opt.id === state.secret.id;
        b.classList.add(hit ? "correct" : "wrong");
        setTimeout(() => showResult(hit), 550);
        if (hit) { sndGood(); } else { sndBad(); }
      });
      grid.appendChild(b);
    });
    state.answered = false;
    show("s-guess");
  }

  function showResult(hit) {
    state.round++;
    if (hit) state.score++;

    $("result-mark").innerHTML = hit
      ? `<svg><use href="#ic-check"/></svg>`
      : `<svg><use href="#ic-swap"/></svg>`;
    const title = $("result-title");
    title.textContent = hit ? "ಭೇಷ್! Team point!" : "Almost! It was —";
    title.classList.toggle("miss", !hit);

    setArt($("result-art"), state.secret.id);
    $("result-kn").textContent = state.secret.kn;
    $("result-tr").textContent = `${state.secret.tr} · ${state.secret.en}`;
    $("result-score").textContent = scoreText();
    $("btn-next").textContent = state.round >= ROUNDS ? "see our score!" : "next round";
    show("s-result");

    // reinforce: native audio, then a praise clip on a hit
    if (hit) play(wordSrc(state.secret), () => play(praiseSrc()));
    else play(wordSrc(state.secret, true));
  }

  function showFinal() {
    const s = state.score;
    const stars = s >= 5 ? 3 : s >= 3 ? 2 : 1;
    $("final-stars").innerHTML =
      Array.from({ length: 3 }, (_, i) =>
        `<svg><use href="#${i < stars ? "ic-star" : "ic-star-empty"}"/></svg>`).join("");
    $("final-sub").textContent =
      `You got ${s} of ${ROUNDS} words across to each other. ` +
      (stars === 3 ? "Your Kannada made it every time — super team!"
        : stars === 2 ? "Great talking! One more game to beat it?"
        : "The words are warming up — go again!");
    show("s-final");
    play(praiseSrc());
  }

  /* ---------------- wire up ---------------- */

  document.querySelectorAll(".cat-card").forEach((el) =>
    el.addEventListener("click", () => { sndTap(); startGame(el.dataset.cat); }));

  $("btn-pass-done").addEventListener("click", () => {
    sndTap();
    if (state.phase === "listen") { state.phase = null; showGuess(); }
    else showSpeak();
  });

  $("btn-remind").addEventListener("click", () => play(wordSrc(state.secret, true)));
  $("btn-said").addEventListener("click", () => { sndTap(); showListenerPass(); });
  $("btn-result-hear").addEventListener("click", () => play(wordSrc(state.secret)));
  $("btn-next").addEventListener("click", () => { sndTap(); nextRound(); });
  $("btn-again").addEventListener("click", () => { sndTap(); startGame(state.cat); });
  $("btn-home").addEventListener("click", () => show("s-home"));
})();
