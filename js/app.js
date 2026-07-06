/* Maathaadu! — game engine */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const screens = {
    home: $("screen-home"),
    lesson: $("screen-lesson"),
    complete: $("screen-complete"),
  };

  const RING_COLORS = ["#e8482f", "#ffb627", "#4fb35b", "#33bfb0", "#f0679e"];
  const store = {
    get player() { return localStorage.getItem("mt.player") || "anna"; },
    set player(v) { localStorage.setItem("mt.player", v); },
    stars(lessonId) { return +(localStorage.getItem(`mt.stars.${this.player}.${lessonId}`) || 0); },
    setStars(lessonId, n) {
      const key = `mt.stars.${this.player}.${lessonId}`;
      localStorage.setItem(key, Math.max(n, +(localStorage.getItem(key) || 0)));
    },
  };

  const state = {
    lesson: null,
    queue: [],
    idx: 0,
    mode: "type",       // "type" | "tap"
    wrongTotal: 0,
    wrongThis: 0,
    hintLevel: 0,
    answered: false,
    audio: null,
  };

  /* ---------------- audio ---------------- */

  function playFile(src, onend) {
    if (state.audio) { state.audio.pause(); }
    const a = new Audio(src);
    state.audio = a;
    const parrot = $("btn-parrot");
    parrot.classList.add("talking");
    a.addEventListener("ended", () => {
      parrot.classList.remove("talking");
      if (onend) onend();
    });
    a.addEventListener("error", () => parrot.classList.remove("talking"));
    a.play().catch(() => parrot.classList.remove("talking"));
  }

  const itemSrc = (item, slow) =>
    `audio/${state.lesson.id}/${item.id}${slow ? "_slow" : ""}.mp3`;

  function playItem(slow) {
    const item = state.queue[state.idx];
    if (item) playFile(itemSrc(item, slow));
  }

  function playPraise() {
    const p = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    playFile(`audio/praise/${p.id}.mp3`);
  }

  // tiny WebAudio chimes (no files needed)
  let actx;
  function beep(freqs, dur = 0.12, type = "sine", gain = 0.15) {
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
    } catch (e) { /* sound is decoration */ }
  }
  const sndGood = () => beep([660, 880, 1100], 0.11, "triangle");
  const sndBad = () => beep([220, 180], 0.16, "sawtooth", 0.07);
  const sndPlok = () => beep([300, 520], 0.07, "square", 0.08);

  /* ---------------- answer matching ---------------- */

  function norm(s) {
    return s.toLowerCase()
      .replace(/[^a-z]/g, "")
      .replace(/th/g, "t").replace(/dh/g, "d").replace(/bh/g, "b")
      .replace(/gh/g, "g").replace(/kh/g, "k").replace(/ph/g, "p")
      .replace(/sh/g, "s").replace(/w/g, "v").replace(/q/g, "k")
      .replace(/(.)\1+/g, "$1");
  }

  function lev(a, b) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 2) return 99;
    const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1,
          d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }

  // "good" | "close" | "bad"
  function judge(input, item) {
    const guess = norm(input);
    if (!guess) return "bad";
    const targets = [item.tr, ...(item.ok || [])].map(norm);
    if (targets.includes(guess)) return "good";
    const tol = item.tr.replace(/\s/g, "").length >= 8 ? 2 : 1;
    if (targets.some((t) => lev(guess, t) <= tol)) return "close";
    return "bad";
  }

  /* ---------------- home screen ---------------- */

  function renderHome() {
    document.querySelectorAll(".player").forEach((el) =>
      el.classList.toggle("selected", el.dataset.player === store.player));
    const shelves = $("shelves");
    shelves.innerHTML = "";
    for (let r = 0; r < LESSONS.length; r += 2) {
      const row = document.createElement("div");
      row.className = "shelf-row";
      LESSONS.slice(r, r + 2).forEach((lesson) => {
        const stars = store.stars(lesson.id);
        const btn = document.createElement("button");
        btn.className = `lesson-card ${lesson.color}`;
        btn.innerHTML = `
          <span class="licon">${lesson.icon}</span>
          <span class="lkn">${lesson.kn}</span>
          <span class="len">${lesson.title}</span>
          <span class="lstars">${stars ? "⭐".repeat(stars) : ""}</span>`;
        btn.addEventListener("click", () => startLesson(lesson));
        row.appendChild(btn);
      });
      shelves.appendChild(row);
    }
  }

  document.querySelectorAll(".player").forEach((el) =>
    el.addEventListener("click", () => {
      store.player = el.dataset.player;
      renderHome();
      sndPlok();
    }));

  /* ---------------- peg / ring progress ---------------- */

  function renderPeg(done, total) {
    const svg = $("peg");
    const parts = [
      `<rect x="30" y="106" width="100" height="12" rx="6" fill="#a86a34"/>`,
      `<rect x="76" y="14" width="8" height="96" rx="4" fill="#d99a5b"/>`,
    ];
    for (let i = 0; i < total; i++) {
      const y = 100 - i * 10.5;
      const rx = 42 - i * 2.4;
      if (i < done) {
        const c = RING_COLORS[i % RING_COLORS.length];
        const drop = i === done - 1 ? "ring drop" : "ring";
        parts.push(`<g class="${drop}">
          <ellipse cx="80" cy="${y}" rx="${rx}" ry="7" fill="${c}"/>
          <ellipse cx="80" cy="${y - 2}" rx="${rx * 0.8}" ry="3.4" fill="#fff" opacity=".22"/>
        </g>`);
      }
    }
    parts.push(`<text x="132" y="102" font-size="13" font-weight="700"
      fill="rgba(255,243,220,.5)" font-family="Nunito, sans-serif">${done}/${total}</text>`);
    if (done === total) {
      parts.push(`<g class="ring drop"><circle cx="80" cy="8" r="9" fill="#fff3dc"/>
        <circle cx="80" cy="-2" r="3.5" fill="#e8482f"/></g>`);
    }
    svg.innerHTML = parts.join("");
  }

  /* ---------------- lesson flow ---------------- */

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startLesson(lesson) {
    state.lesson = lesson;
    state.queue = shuffle(lesson.items);
    state.idx = 0;
    state.wrongTotal = 0;
    state.mode = store.player === "putta" ? "tap" : "type";
    $("lesson-name").textContent = `${lesson.kn} · ${lesson.title}`;
    show("lesson");
    nextItem(true);
  }

  function show(name) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
    window.scrollTo(0, 0);
  }

  function applyMode() {
    $("type-row").style.display = state.mode === "type" ? "" : "none";
    $("choices").style.display = state.mode === "tap" ? "" : "none";
    $("btn-mode").textContent = state.mode === "type" ? "⌨️" : "👆";
  }

  function nextItem(first) {
    if (!first) state.idx++;
    if (state.idx >= state.queue.length) return completeLesson();

    state.wrongThis = 0;
    state.hintLevel = 0;
    state.answered = false;
    $("feedback").textContent = "";
    $("feedback").className = "feedback";
    $("reveal-slot").innerHTML = "";
    $("answer-input").value = "";
    $("listen-hint").textContent = "tap the parrot to hear it 🔊";
    renderPeg(state.idx, state.queue.length);
    applyMode();
    if (state.mode === "tap") renderChoices();
    playItem(false);
    if (state.mode === "type" && window.innerWidth > 700) $("answer-input").focus();
  }

  function renderChoices() {
    const item = state.queue[state.idx];
    const others = shuffle(state.lesson.items.filter((i) => i.id !== item.id)).slice(0, 3);
    const opts = shuffle([item, ...others]);
    const box = $("choices");
    box.innerHTML = "";
    opts.forEach((opt) => {
      const b = document.createElement("button");
      b.className = "choice";
      b.textContent = opt.emoji;
      b.setAttribute("aria-label", opt.en);
      b.addEventListener("click", () => {
        if (state.answered) return;
        if (opt.id === item.id) {
          b.classList.add("correct");
          onCorrect();
        } else {
          b.classList.add("wrong");
          onWrong();
          setTimeout(() => b.classList.remove("wrong"), 500);
        }
      });
      box.appendChild(b);
    });
  }

  function onCorrect() {
    if (state.answered) return;
    state.answered = true;
    sndGood();
    const fb = $("feedback");
    fb.textContent = "";
    fb.className = "feedback";
    $("type-row").style.display = "none";
    $("choices").style.display = "none";
    renderPeg(state.idx + 1, state.queue.length);
    setTimeout(playPraise, 350);
    showReveal();
  }

  function onWrong() {
    state.wrongTotal++;
    state.wrongThis++;
    sndBad();
    const fb = $("feedback");
    if (state.wrongThis >= 2) {
      giveHint(true);
    } else {
      fb.textContent = "try again — listen once more! 🔊";
      fb.className = "feedback bad";
      playItem(true);
    }
  }

  function giveHint(auto) {
    const item = state.queue[state.idx];
    const fb = $("feedback");
    fb.className = "feedback close";
    if (state.mode === "tap") {
      fb.textContent = `hint: it means "${item.en}"`;
      return;
    }
    state.hintLevel = Math.min(state.hintLevel + 1, 2);
    if (state.hintLevel === 1) {
      fb.textContent = `${auto ? "hint: " : ""}${item.emoji} it means "${item.en}"`;
    } else {
      const first = item.tr.slice(0, Math.ceil(item.tr.length / 2));
      fb.textContent = `it starts with "${first}…"`;
    }
  }

  function checkTyped() {
    if (state.answered) return;
    const input = $("answer-input");
    const item = state.queue[state.idx];
    const verdict = judge(input.value, item);
    if (verdict === "good") {
      onCorrect();
    } else if (verdict === "close") {
      const fb = $("feedback");
      fb.textContent = "sooo close! check the spelling 🐢";
      fb.className = "feedback close";
      sndPlok();
      playItem(true);
    } else {
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 450);
      onWrong();
    }
  }

  /* ---------------- reveal card + echo ---------------- */

  let recorder = null, recChunks = [], echoUrl = null;

  function showReveal() {
    const item = state.queue[state.idx];
    const slot = $("reveal-slot");
    slot.innerHTML = `
      <div class="reveal">
        <div class="r-emoji">${item.emoji}</div>
        <div class="r-kn">${item.kn}</div>
        <div class="r-tr">${item.tr}</div>
        <div class="r-en">${item.en}</div>
        <div class="r-actions">
          <button class="toybtn turq small" id="r-play">🔊 hear it</button>
          <button class="toybtn pink small" id="r-echo">🎙️ now you say it!</button>
          <button class="toybtn green" id="r-next">next ➜</button>
        </div>
        <div class="echo-note" id="echo-note"></div>
      </div>`;
    $("r-play").addEventListener("click", () => playItem(false));
    $("r-next").addEventListener("click", () => nextItem(false));
    $("r-echo").addEventListener("click", toggleEcho);
    slot.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function toggleEcho() {
    const note = $("echo-note");
    const btn = $("r-echo");
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      return;
    }
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      note.textContent = "recording isn't available here — just say it out loud!";
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recChunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => recChunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (echoUrl) URL.revokeObjectURL(echoUrl);
        echoUrl = URL.createObjectURL(new Blob(recChunks));
        note.textContent = "listen to yourself… 🦜";
        note.classList.remove("recording");
        btn.textContent = "🎙️ say it again";
        const a = new Audio(echoUrl);
        a.play().catch(() => {});
      };
      recorder.start();
      note.textContent = "● recording — tap again to stop";
      note.classList.add("recording");
      btn.textContent = "⏹ stop";
    } catch (e) {
      note.textContent = "microphone not allowed — just say it out loud!";
    }
  }

  /* ---------------- completion ---------------- */

  function completeLesson() {
    const total = state.queue.length;
    const stars = state.wrongTotal <= 1 ? 3 : state.wrongTotal <= 4 ? 2 : 1;
    store.setStars(state.lesson.id, stars);
    $("done-sub").textContent =
      `${state.lesson.kn} — all ${total} done! ` +
      (stars === 3 ? "Perfect listening ears!" : stars === 2 ? "Great job!" : "You made it — play again for more stars!");
    $("done-stars").textContent = "⭐".repeat(stars);
    show("complete");
    confetti();
    playPraise();
  }

  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = $("confetti");
    box.innerHTML = "";
    for (let i = 0; i < 60; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = RING_COLORS[i % RING_COLORS.length];
      p.style.animationDuration = 2 + Math.random() * 2.5 + "s";
      p.style.animationDelay = Math.random() * 0.8 + "s";
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(p);
    }
    setTimeout(() => (box.innerHTML = ""), 6000);
  }

  /* ---------------- wire up ---------------- */

  $("btn-parrot").addEventListener("click", () => playItem(false));
  $("btn-again").addEventListener("click", () => playItem(false));
  $("btn-slow").addEventListener("click", () => playItem(true));
  $("btn-hint").addEventListener("click", () => giveHint(false));
  $("btn-check").addEventListener("click", checkTyped);
  $("answer-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkTyped();
  });
  $("btn-back").addEventListener("click", () => { renderHome(); show("home"); });
  $("btn-home").addEventListener("click", () => { renderHome(); show("home"); });
  $("btn-replay").addEventListener("click", () => startLesson(state.lesson));
  $("btn-mode").addEventListener("click", () => {
    state.mode = state.mode === "type" ? "tap" : "type";
    applyMode();
    if (state.mode === "tap" && !state.answered) renderChoices();
  });

  renderHome();
})();
