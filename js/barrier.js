/* ಹೇಳು-ಕೇಳು — Kannada speaking games for two kids.
   Activities: barrier game, daily mission, parrot echo, ajji call, story time.
   Parent-recorded voice clips (IndexedDB, see record.html) override TTS audio. */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const CATS = {
    animals: {
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
    mode: null,          // barrier | mission | echo | ajji | story
    cat: null, pendingCat: null, slide: 0,
    round: 0, score: 0, speaker: "p1", secret: null, used: [], players: null,
    phase: null, answered: false,
    mIdx: 0, mission: null,                      // mission mode
    eQueue: [], eIdx: 0, eSames: 0, eBlob: null, // echo mode
    sIdx: 0, sWrong: 0,                          // story mode
    audio: null,
  };

  const todayStr = () => new Date().toLocaleDateString("sv");
  const yesterdayStr = () => new Date(Date.now() - 864e5).toLocaleDateString("sv");

  /* ---------------- parent-voice store (shared with record.html) ---------------- */

  const VDB = {
    db: null,
    open() {
      return new Promise((res) => {
        try {
          const r = indexedDB.open("hk-voice", 1);
          r.onupgradeneeded = (e) => e.target.result.createObjectStore("clips");
          r.onsuccess = (e) => { this.db = e.target.result; res(); };
          r.onerror = () => res();
        } catch (e) { res(); }
      });
    },
    get(id) {
      return new Promise((res) => {
        if (!this.db) return res(null);
        try {
          const t = this.db.transaction("clips").objectStore("clips").get(id);
          t.onsuccess = () => res(t.result || null);
          t.onerror = () => res(null);
        } catch (e) { res(null); }
      });
    },
  };

  /* ---------------- audio ---------------- */

  function play(src, next) {
    if (state.audio) state.audio.pause();
    const a = new Audio(src);
    state.audio = a;
    if (next) a.addEventListener("ended", next);
    a.play().catch(() => {});
    return a;
  }

  function playBlob(blob, next) {
    const url = URL.createObjectURL(blob);
    const a = play(url, () => {
      URL.revokeObjectURL(url);
      if (next) next();
    });
    return a;
  }

  // parent recording (by id) wins over the TTS file
  async function playOr(id, src, next) {
    const blob = await VDB.get(id);
    if (blob) playBlob(blob, next);
    else play(src, next);
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

  /* ---------------- microphone ---------------- */

  const mic = {
    rec: null, stream: null, chunks: [],
    supported: () => !!(navigator.mediaDevices && window.MediaRecorder),
    async start() {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.chunks = [];
      this.rec = new MediaRecorder(this.stream);
      this.rec.ondataavailable = (e) => this.chunks.push(e.data);
      this.rec.start();
    },
    stop() {
      return new Promise((res) => {
        this.rec.onstop = () => {
          this.stream.getTracks().forEach((t) => t.stop());
          res(new Blob(this.chunks));
        };
        this.rec.stop();
      });
    },
    recording() { return this.rec && this.rec.state === "recording"; },
  };

  /* ---------------- shared helpers ---------------- */

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
  const pname = (k) => (localStorage.getItem(`hk.${k}`) || "").trim().slice(0, 12) || (k === "p1" ? "Player 1" : "Player 2");

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

  function finale(title, sub, stars, praise = true) {
    $("final-title").textContent = title;
    $("final-stars").innerHTML =
      Array.from({ length: 3 }, (_, i) =>
        `<svg><use href="#${i < stars ? "ic-star" : "ic-star-empty"}"/></svg>`).join("");
    $("final-sub").textContent = sub;
    show("s-final");
    if (praise) play(praiseSrc());
  }

  /* ================= how-to comic ================= */

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

  /* ================= barrier game ================= */

  function startGame(cat) {
    state.mode = "barrier";
    state.cat = cat;
    state.players = readPlayers();
    state.round = 0;
    state.score = 0;
    state.used = [];
    state.speaker = Math.random() < 0.5 ? "p1" : "p2";
    nextRound();
  }

  function nextRound() {
    if (state.round >= ROUNDS) return barrierFinal();

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

    if (hit) playOr(state.secret.id, wordSrc(state.secret), () => play(praiseSrc()));
    else play(wordSrc(state.secret, true));
  }

  function barrierFinal() {
    const s = state.score;
    const { p1, p2 } = state.players;
    const stars = s >= 5 ? 3 : s >= 3 ? 2 : 1;
    finale(
      `Team ${p1.name} & ${p2.name}!`,
      `You got ${s} of ${ROUNDS} words across to each other. ` +
      (stars === 3 ? "Your Kannada made it every time — super team!"
        : stars === 2 ? "Great talking! One more game to beat it?"
        : "The words are warming up — go again!"),
      stars);
  }

  /* ================= daily mission ================= */

  const missionSrc = (m, slow) => `audio/missions/${m.id}${slow ? "_slow" : ""}.mp3`;

  function missionFor(pIdx) {
    const day = Math.floor(Date.now() / 864e5);
    return MISSIONS[(day + pIdx * 7) % MISSIONS.length];
  }

  function openMissionWho() {
    $("mw-name-p1").textContent = pname("p1");
    $("mw-name-p2").textContent = pname("p2");
    show("s-mission-who");
  }

  function openMission(pIdx) {
    state.mode = "mission";
    state.mIdx = pIdx;
    state.mission = missionFor(pIdx);
    const name = pname(pIdx === 0 ? "p1" : "p2");
    const done = localStorage.getItem(`hk.mdone.${pIdx}`) === todayStr();
    const streak = +(localStorage.getItem(`hk.mstreak.${pIdx}`) || 0);

    $("mission-title").textContent = `${name}'s mission today`;
    $("mission-streak").textContent = streak > 1 ? `mission streak: ${streak} days!` : "";
    $("mission-do").textContent = state.mission.do;
    $("mission-kn").textContent = state.mission.kn;
    $("mission-tr").textContent = state.mission.tr;
    $("mission-rec-label").textContent = "practice";
    $("mission-coach").textContent = done
      ? "Done for today — come back tomorrow for a new one!"
      : "Practice here, then go say it to a real person — for real!";
    $("mission-done-label").textContent = done ? "done for today!" : "grown-up: they said it!";
    $("btn-mission-done").disabled = done;
    show("s-mission");
    playOr(state.mission.id, missionSrc(state.mission));
  }

  function missionVerify() {
    const pIdx = state.mIdx;
    if (localStorage.getItem(`hk.mdone.${pIdx}`) === todayStr()) return;
    const prevDay = localStorage.getItem(`hk.mdone.${pIdx}`);
    const streak = prevDay === yesterdayStr()
      ? +(localStorage.getItem(`hk.mstreak.${pIdx}`) || 0) + 1 : 1;
    localStorage.setItem(`hk.mdone.${pIdx}`, todayStr());
    localStorage.setItem(`hk.mstreak.${pIdx}`, String(streak));
    sndGood();
    finale(
      `ಭೇಷ್, ${pname(pIdx === 0 ? "p1" : "p2")}!`,
      streak > 1
        ? `Mission done — that's ${streak} days in a row. Real Kannada, said to a real person!`
        : "Mission done — real Kannada, said to a real person. New mission tomorrow!",
      streak >= 3 ? 3 : streak === 2 ? 2 : 1);
  }

  async function missionPractice() {
    const label = $("mission-rec-label");
    if (!mic.supported()) { label.textContent = "no mic here"; return; }
    if (mic.recording()) {
      const blob = await mic.stop();
      label.textContent = "practice";
      playOr(state.mission.id, missionSrc(state.mission), () => playBlob(blob));
    } else {
      try {
        await mic.start();
        label.textContent = "stop";
      } catch (e) { label.textContent = "mic not allowed"; }
    }
  }

  /* ================= parrot echo ================= */

  const echoSrc = (e, slow) => `audio/echo/${e.id}${slow ? "_slow" : ""}.mp3`;

  function startEcho(lvl) {
    state.mode = "echo";
    state.eQueue = shuffle(ECHO.filter((e) => e.lvl === lvl)).slice(0, 3);
    state.eIdx = 0;
    state.eSames = 0;
    echoItem();
  }

  function echoItem() {
    const e = state.eQueue[state.eIdx];
    $("echo-count").textContent = `${state.eIdx + 1} of ${state.eQueue.length}`;
    $("echo-kn").textContent = e.kn;
    $("echo-tr").textContent = e.tr;
    $("echo-rec-label").textContent = "record me!";
    $("echo-note").textContent = "Listen first, then record yourself saying it.";
    $("echo-rate").hidden = true;
    show("s-echo");
    playOr(e.id, echoSrc(e));
  }

  async function echoRecord() {
    const e = state.eQueue[state.eIdx];
    const label = $("echo-rec-label");
    if (!mic.supported()) { $("echo-note").textContent = "No microphone here — just say it out loud!"; return; }
    if (mic.recording()) {
      state.eBlob = await mic.stop();
      label.textContent = "record again";
      $("echo-note").textContent = "The parrot… then you. Do you sound the same?";
      playOr(e.id, echoSrc(e), () => playBlob(state.eBlob, () => { $("echo-rate").hidden = false; }));
    } else {
      try {
        await mic.start();
        label.textContent = "stop";
        $("echo-note").textContent = "Recording… say it now, then tap stop.";
        $("echo-rate").hidden = true;
      } catch (err) { $("echo-note").textContent = "Mic not allowed — just say it out loud!"; }
    }
  }

  function echoRate(rate) {
    if (rate === "again") { $("echo-rate").hidden = true; return; }
    if (rate === "same") state.eSames++;
    sndGood();
    state.eIdx++;
    if (state.eIdx < state.eQueue.length) return echoItem();
    const stars = state.eSames === 3 ? 3 : state.eSames >= 1 ? 2 : 1;
    finale("ಗಿಣಿ ಭೇಷ್ ಅಂತು!",
      `You echoed ${state.eQueue.length} sentences out loud` +
      (state.eSames ? ` — and ${state.eSames} sounded just like the parrot!` : " — great practice!"),
      stars);
  }

  /* ================= ajji call ================= */

  const ajjiSrc = (a, slow) => `audio/ajji/${a.id}${slow ? "_slow" : ""}.mp3`;

  function openAjji() {
    state.mode = "ajji";
    const list = $("ajji-list");
    list.innerHTML = "";
    AJJI.forEach((a) => {
      const row = document.createElement("div");
      row.className = "ajji-row framed";
      row.innerHTML = `
        <button class="abtn a-play" aria-label="hear it"><svg><use href="#ic-sound"/></svg></button>
        <div class="a-txt">
          <div class="a-kn">${a.kn}</div>
          <div class="a-tr">${a.tr}</div>
          <div class="a-en">${a.en}</div>
        </div>
        <button class="abtn a-rec" aria-label="practice"><svg><use href="#ic-mic"/></svg></button>
        <button class="abtn a-tick" aria-label="I said it to ajji"><svg><use href="#ic-check"/></svg></button>`;
      row.querySelector(".a-play").addEventListener("click", () => playOr(a.id, ajjiSrc(a)));
      const recBtn = row.querySelector(".a-rec");
      recBtn.addEventListener("click", async () => {
        if (!mic.supported()) return;
        if (mic.recording()) {
          const blob = await mic.stop();
          recBtn.classList.remove("rec-on");
          playOr(a.id, ajjiSrc(a), () => playBlob(blob));
        } else {
          try { await mic.start(); recBtn.classList.add("rec-on"); } catch (e) { /* no mic */ }
        }
      });
      row.querySelector(".a-tick").addEventListener("click", (ev) => {
        const btn = ev.currentTarget;
        btn.classList.toggle("ticked");
        sndTap();
        const n = list.querySelectorAll(".a-tick.ticked").length;
        $("ajji-score").textContent = n ? `${n} of ${AJJI.length} said to ajji!` : "";
        if (n === AJJI.length) {
          finale("ಅಜ್ಜಿ ತುಂಬಾ ಖುಷಿ!",
            "All five — a whole conversation with ajji, in Kannada. That's the real thing!",
            3);
        }
      });
      list.appendChild(row);
    });
    $("ajji-score").textContent = "";
    show("s-ajji");
  }

  /* ================= story time ================= */

  const storySrc = (id) => `audio/story/${id}.mp3`;

  function startStory() {
    state.mode = "story";
    state.sIdx = 0;
    state.sWrong = 0;
    storyPart();
  }

  function storyPart() {
    const parts = STORY.parts;
    if (state.sIdx >= parts.length) {
      const stars = state.sWrong === 0 ? 3 : state.sWrong <= 2 ? 2 : 1;
      return finale("ಕಥೆ ಮುಗೀತು!",
        `"${STORY.title_en}" — the whole story, in Kannada! ` +
        (stars === 3 ? "You understood every question!" : "Listen again tomorrow — stories grow on you."),
        stars);
    }
    const p = parts[state.sIdx];
    $("story-count").textContent = `${STORY.title_kn} · ${state.sIdx + 1} of ${parts.length}`;

    if (p.type === "line") {
      $("story-card").style.display = "";
      setArt($("story-art"), `#pic-${p.art}`);
      $("story-kn").textContent = p.kn;
      $("story-en").textContent = p.en;
      $("story-opts").hidden = true;
      $("story-opts").innerHTML = "";
      $("btn-story-next").style.display = "";
    } else {
      $("story-card").style.display = "";
      setArt($("story-art"), "#art-parrot");
      $("story-kn").textContent = p.kn;
      $("story-en").textContent = "tap the right picture!";
      const box = $("story-opts");
      box.innerHTML = "";
      box.hidden = false;
      $("btn-story-next").style.display = "none";
      state.answered = false;
      shuffle(p.opts).forEach((optId) => {
        const b = document.createElement("button");
        b.className = "story-opt";
        b.innerHTML = `<svg><use href="#pic-${optId}"/></svg>`;
        b.addEventListener("click", () => {
          if (state.answered) return;
          if (optId === p.ans) {
            state.answered = true;
            b.classList.add("correct");
            sndGood();
            setTimeout(() => { state.sIdx++; storyPart(); }, 800);
          } else {
            state.sWrong++;
            b.classList.add("wrong");
            sndBad();
            setTimeout(() => b.classList.remove("wrong"), 500);
            play(storySrc(p.id));
          }
        });
        box.appendChild(b);
      });
    }
    show("s-story");
    play(storySrc(p.id));
  }

  /* ================= wire up ================= */

  // hub
  $("act-barrier").addEventListener("click", () => { sndTap(); show("s-cats"); });
  $("act-mission").addEventListener("click", () => { sndTap(); openMissionWho(); });
  $("act-echo").addEventListener("click", () => { sndTap(); show("s-echo-lvl"); });
  $("act-ajji").addEventListener("click", () => { sndTap(); openAjji(); });
  $("act-story").addEventListener("click", () => { sndTap(); startStory(); });
  $("btn-howto").addEventListener("click", () => { sndTap(); openHowto(null); });

  document.querySelectorAll(".back-home").forEach((b) =>
    b.addEventListener("click", () => {
      if (state.audio) state.audio.pause();
      if (mic.recording()) mic.stop();
      show("s-home");
    }));

  // barrier game
  document.querySelectorAll(".cat-card").forEach((el) =>
    el.addEventListener("click", () => {
      sndTap();
      state.pendingCat = el.dataset.cat;
      if (!localStorage.getItem("hk.intro")) openHowto(el.dataset.cat);
      else show("s-players");
    }));

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
  $("btn-result-hear").addEventListener("click", () => playOr(state.secret.id, wordSrc(state.secret)));
  $("btn-next").addEventListener("click", () => { sndTap(); nextRound(); });

  // final screen (shared)
  $("btn-again").addEventListener("click", () => {
    sndTap();
    if (state.mode === "barrier") startGame(state.cat);
    else if (state.mode === "echo") show("s-echo-lvl");
    else if (state.mode === "story") startStory();
    else if (state.mode === "ajji") openAjji();
    else show("s-home");
  });
  $("btn-home").addEventListener("click", () => show("s-home"));

  // mission
  $("mw-p1").addEventListener("click", () => { sndTap(); openMission(0); });
  $("mw-p2").addEventListener("click", () => { sndTap(); openMission(1); });
  $("btn-mission-hear").addEventListener("click", () => playOr(state.mission.id, missionSrc(state.mission)));
  $("btn-mission-slow").addEventListener("click", () => play(missionSrc(state.mission, true)));
  $("btn-mission-rec").addEventListener("click", missionPractice);
  $("btn-mission-done").addEventListener("click", missionVerify);

  // echo
  document.querySelectorAll(".lvl-card").forEach((el) =>
    el.addEventListener("click", () => { sndTap(); startEcho(+el.dataset.lvl); }));
  $("btn-echo-hear").addEventListener("click", () => {
    const e = state.eQueue[state.eIdx];
    playOr(e.id, echoSrc(e));
  });
  $("btn-echo-slow").addEventListener("click", () => play(echoSrc(state.eQueue[state.eIdx], true)));
  $("btn-echo-rec").addEventListener("click", echoRecord);
  document.querySelectorAll("#echo-rate [data-rate]").forEach((el) =>
    el.addEventListener("click", () => { sndTap(); echoRate(el.dataset.rate); }));

  // story
  $("btn-story-hear").addEventListener("click", () => play(storySrc(STORY.parts[state.sIdx].id)));
  $("btn-story-next").addEventListener("click", () => { sndTap(); state.sIdx++; storyPart(); });

  initNames();
  VDB.open();
})();
