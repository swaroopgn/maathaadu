# ಮಾತಾಡು! Maathaadu!

A listening-and-speaking Kannada game for kids who *hear* Kannada at home but
don't speak it much yet. Built for iPads.

**Live**: https://swaroopgn.github.io/maathaadu/

## How it plays

- Pick a player: **ಅಣ್ಣ Anna** (listen & type — hear the word, type it in
  English letters) or **ಪುಟ್ಟ Putta** (listen & tap — hear the word, tap the
  matching picture; no reading needed).
- Tap the Channapatna parrot to hear native Kannada audio (🐢 slow replay
  available). Every correct answer stacks a lacquer ring on the toy peg;
  finish all 8 to complete the doll.
- After each answer, the reveal card shows the Kannada script, transliteration
  and meaning — with a 🎙️ "now you say it!" button that records the child and
  plays it back (speaking practice by echo).
- Typed answers are matched leniently: `nayi`, `naayi`, `naai` all count;
  near-misses get a "so close!" and a slow replay instead of a fail.

## Design

Visual world: **Channapatna toys** — Karnataka's lacquered wooden toys.
Vermilion, marigold, leaf green, lac pink and turquoise on turned ivory wood,
set on a deep teal toy-shop backdrop. Type is Baloo Tamma 2 (the Kannada
member of the Baloo family) + Nunito.

## Adding lessons

1. Add a lesson object in `js/lessons.js` (id, Kannada title, items with
   `id`, `kn`, `tr`, accepted `ok` variants, `en`, `emoji`).
2. Run `python3 tools/gen_audio.py` — generates missing audio via edge-tts
   (`kn-IN-SapnaNeural`, normal + slow) into `audio/<lesson>/`.
3. Commit and push; GitHub Pages serves it.

No build step, no dependencies — plain HTML/CSS/JS.
