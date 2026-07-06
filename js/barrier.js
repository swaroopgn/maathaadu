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
        { id: "sihi",       kn: "ಸಿಹಿ",      tr: "sihi",      en: "sweet" },
      ],
    },
  };

  const SLIDES = [
    { art: "#scene-1", cap: "This is a game for TWO players. Player 1 gets a secret Kannada word — say it out loud, in Kannada. Don't show the screen!" },
    { art: "#scene-2", cap: "Then pass the iPad over. Player 2 — ears open! You only get what your partner's Kannada tells you." },
    { art: "#scene-3", cap: "Player 2 taps the picture they heard. Got it right? A point for the team — you win together!" },
  ];

  const PRAISE_IDS = ["bhesh", "super", "chennagide", "sari"];
  const ROUNDS = 6;
  const GRID = 6;

  const state = {
    cat: null,
    pendingCat: null,
    slide: 0,
    round: 0,
    score: 0,
    speaker: "p1",
    secret: null,
    used: [],
    players: null,
    audio: null,
  };

  /* ---------------- players ---------------- */

  function readPlayers() {
    const clean = (v, fb) => (v || "").trim().slice(0, 12) || fb;
    return {
      p1: { name: clean($("name-p1").value, "Player 1"), av: "#av-p1" },
      p2: { name: clean($("name-p2").value, "Player 2"), av: "#av-p2" },
    };
  }

  function initNames() {
    $("name-p1").value = localStorage.getItem("hk.p1") || "";
    $("name-p2").value = localStorage.getItem("hk.p2") || "";
    $("name-p1").addEventListener("input", (e) => localStorage.setItem("hk.p1", e.target.value));
    $("name-p2").addEventListener("input", (e) => localStorage.setItem("hk.p2", e.target.value));
  }

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

  const other = (p) => (p === "p1" ? "p2" : "p1");
  const setArt = (el, ref) => el.querySelector("use").setAttribute("href", ref);
  const scoreText = () => `team score: ${state.score} of ${state.round}`;

  /* ---------------- how-to comic ---------------- */

  function openHowto(pendingCat) {
    state.pendingCat = pendingCat;
    state.slide = 0;
    renderSlide();
    show("s-howto");
  }

  function renderSlide() {
    const s = SLIDES[state.slide];
    setArt($("howto-scene"), s.art);
    $("howto-cap").textContent = s.cap;
    $("howto-dots").innerHTML = SLIDES
      .map((_, i) => `<i class="${i === state.slide ? "on" : ""}"></i>`).join("");
    $("btn-howto-next").textContent =
      state.slide < SLIDES.length - 1 ? "next" : (state.pendingCat ? "got it — let's play!" : "got it!");
  }

  /* ---------------- flow ---------------- */

  function startGame(cat) {
    state.cat = cat;
    state.players = readPlayers();
    state.round = 0;
    state.score = 0;
    state.used = [];
    state.speaker = Math.random() < 0.5 ? "p1" : "p2";
    nextRound();
  }

  function nextRound() {
    if (state.round >= ROUNDS) return showFinal();

    const pool = CATS[state.cat].items.filter((i) => !state.used.includes(i.id));
    state.secret = pool[Math.floor(Math.random() * pool.length)];
    state.used.push(state.secret.id);

    const sp = state.players[state.speaker];
    const li = state.players[other(state.speaker)];
    setArt($("pass-avatar-svg"), sp.av);
    $("pass-title").textContent = `Give the iPad to ${sp.name}`;
    $("pass-note-text").textContent = `${li.name} — look away and open your ears!`;
    $("pass-score").textContent = state.round ? scoreText() : "";
    state.phase = "speak";
    show("s-pass");
  }

  function showSpeak() {
    const sp = state.players[state.speaker];
    $("speak-title").textContent = `Your secret word, ${sp.name}:`;
    setArt($("secret-art"), `#pic-${state.secret.id}`);
    $("secret-kn").textContent = state.secret.kn;
    $("secret-tr").textContent = state.secret.tr;
    show("s-speak");
  }

  function showListenerPass() {
    const li = state.players[other(state.speaker)];
    setArt($("pass-avatar-svg"), li.av);
    $("pass-title").textContent = `Now pass it to ${li.name}`;
    $("pass-note-text").textContent = "Did you hear it? Time to find it!";
    $("pass-score").textContent = "";
    state.phase = "listen";
    show("s-pass");
  }

  function showGuess() {
    const sp = state.players[state.speaker];
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

    setArt($("result-art"), `#pic-${state.secret.id}`);
    $("result-kn").textContent = state.secret.kn;
    $("result-tr").textContent = `${state.secret.tr} · ${state.secret.en}`;
    $("result-score").textContent = scoreText();
    $("btn-next").textContent = state.round >= ROUNDS ? "see our score!" : "next round";
    show("s-result");

    if (hit) play(wordSrc(state.secret), () => play(praiseSrc()));
    else play(wordSrc(state.secret, true));
  }

  function showFinal() {
    const s = state.score;
    const { p1, p2 } = state.players;
    const stars = s >= 5 ? 3 : s >= 3 ? 2 : 1;
    $("final-title").textContent = `Team ${p1.name} & ${p2.name}!`;
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
    el.addEventListener("click", () => {
      sndTap();
      state.pendingCat = el.dataset.cat;
      if (!localStorage.getItem("hk.intro")) openHowto(el.dataset.cat);
      else show("s-players");
    }));

  $("btn-howto").addEventListener("click", () => { sndTap(); openHowto(null); });

  $("btn-howto-next").addEventListener("click", () => {
    sndTap();
    if (state.slide < SLIDES.length - 1) {
      state.slide++;
      renderSlide();
    } else {
      localStorage.setItem("hk.intro", "1");
      if (state.pendingCat) show("s-players");
      else show("s-home");
    }
  });

  $("btn-players-go").addEventListener("click", () => {
    sndTap();
    startGame(state.pendingCat || "animals");
  });

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

  initNames();
})();
