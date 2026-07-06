# Adding content to ಹೇಳು-ಕೇಳು

All content lives in **`js/content.js`**. Audio is generated from it. Art is
hand-drawn SVG symbols in **`index.html`**. Adding content is three steps:
edit data → run the audio script → (for new game words only) add a drawing.

## Add a mission (~2 min)

Append to `MISSIONS` in `js/content.js`:

```js
{ id: "m_myid", tier: 1, do: "English instruction shown to the kid",
  kn: "ಕನ್ನಡ ವಾಕ್ಯ", tr: "transliteration" },
```

- `tier`: 1 = single phrase, 2 = sentence, 3 = negotiation/open speech.
- Then: `python3 tools/gen_audio2.py` (only generates missing files).
- Deck rotates daily per kid (kid 2 offset by 7), so N missions ≈ N days.

## Add echo sentences (~2 min)

Append to `ECHO` with `lvl: 1|2|3`. Run the audio script. Sessions pick 3
random sentences per level, so more sentences = more variety automatically.

## Add an ajji-call pack (~5 min)

Append a pack to `AJJI_PACKS`: `{ id, title, items: [{id, kn, tr, en} × 5] }`.
Run the audio script. Packs rotate weekly and are switchable in-game.

## Add a story (~20 min)

Append to `STORIES`. Rules that keep it working:
- `parts` is a list of `{type: "line", id, kn, en, art}` and
  `{type: "q", id, kn, opts: [artId, artId], ans: artId}` entries.
- Keep lines short (5–8 words), reuse words the kids know from the games.
- `art` / `opts` must be existing `pic-*` symbol ids (any barrier word works).
- Question ids must be unique across ALL stories (prefix per story: s_, t_, u_, v_…).
- Run the audio script (story parts get normal-speed audio only).

## Add a barrier-game category (~30 min, needs art)

1. Append a category to `BARRIER_CATS`: 8 items `{id, kn, tr, en, grp: "words"}`
   (grp "words" → audio lands in `audio/words/`). Set the category `icon` to
   one of its item ids.
2. Draw 8 SVG symbols in `index.html` next to the existing ones:
   `<symbol id="pic-<itemid>" viewBox="0 0 120 120">` — copy an existing one
   as a template. House style: `stroke="#3a342b"` width 4, round caps, the
   `filter="url(#rough)"` wobble on the group, crayon fills from the palette
   (#d95d45 tomato, #e0a32e mustard, #7fa869 sage, #6f9bce blue, #eec9a5 skin,
   #e8c98f sand, #b5764a wood). Ask Claude to draw them from this template —
   it's how all 48 were made.
3. Run `python3 tools/gen_audio2.py`.
4. The category card, the mix mode, and record.html all pick it up automatically.

## Rules of thumb

- Ids are permanent (they're audio filenames and parent-recording keys) — never rename.
- Bump the `?v=` query on `content.js`/`barrier.js`/`barrier.css` in index.html
  whenever you change them, or iPads serve stale cached versions.
- Voice is `kn-IN-SapnaNeural` via edge-tts; `--force` regenerates everything.
- Test locally: `python3 -m http.server 8899` → http://localhost:8899
- Push to main → Render auto-deploys https://maathaadu.onrender.com

## Current inventory (2026-07-07)

48 barrier words in 6 categories + mix · 45 missions (≈6 weeks/kid) ·
45 echo sentences (15/level) · 4 ajji packs (monthly rotation) · 4 stories.
