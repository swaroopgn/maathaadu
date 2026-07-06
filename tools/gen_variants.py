#!/usr/bin/env python3
"""Generate theme-variant HTML pages (arcade/pixel/comic/glass) from index.html.

Each variant shares js/ and audio/ and swaps stylesheet, fonts, copy and
ring colors. The pixel variant also swaps the parrot for a pixel-art sprite.

Usage: python3 tools/gen_variants.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "index.html").read_text()

FONT_BASE = "family=Baloo+Tamma+2:wght@500;700;800&family=Nunito:wght@600;700;800"

VARIANTS = {
    "arcade": {
        "css": "css/theme-arcade.css",
        "extra_font": "&family=Audiowide",
        "rings": "#00e5ff,#ff2ec4,#b6ff2e,#ffb02e,#8a7dff",
        "title": "ಮಾತಾಡು! · NEON ARCADE",
        "en_title": "SPEAK KANNADA",
        "shelf": "SELECT LEVEL",
        "theme_color": "#0a0e1f",
    },
    "pixel": {
        "css": "css/theme-pixel.css",
        "extra_font": "&family=Press+Start+2P",
        "rings": "#52b84e,#e5484d,#f5b301,#3aa0e8,#9d5ce5",
        "title": "ಮಾತಾಡು! · PIXEL QUEST",
        "en_title": "MAATHAADU!",
        "shelf": "CHOOSE YOUR QUEST",
        "theme_color": "#8fd3ff",
        "pixel_parrot": True,
    },
    "comic": {
        "css": "css/theme-comic.css",
        "extra_font": "&family=Bangers",
        "rings": "#ff3b3b,#ffd83b,#3b8bff,#2ecc71,#ff6fb0",
        "title": "ಮಾತಾಡು! · COMIC POP",
        "en_title": "The Talking Parrot!",
        "shelf": "PICK AN ADVENTURE!",
        "theme_color": "#fff8ea",
    },
    "glass": {
        "css": "css/theme-glass.css",
        "extra_font": "&family=Quicksand:wght@500;600;700",
        "rings": "#7dd8ff,#b89cff,#ffb3d9,#8affc9,#ffd9a0",
        "title": "ಮಾತಾಡು! · aurora glass",
        "en_title": "maathaadu · speak",
        "shelf": "CHOOSE A LESSON",
        "theme_color": "#171b33",
    },
}

# pixel parrot sprite: 13x14 grid, cell 14px, in the 200x200 viewBox
SPRITE = [
    ".....RRR.....",
    "....RRRRR....",
    "...GGGGGGG...",
    "..GGGGGGGGG..",
    "..GWWBGWWBG..",
    "..GWWBGWWBG..",
    "..GGPYYYPGG..",
    "CCDGGGGYGGG..",
    "CCDGGLLLLLGG.",
    ".CDGGLLLLLGG.",
    "..GGGLLLLGGG.",
    "..GGGGGGGGG..",
    "...GGGGGGG...",
    "...YY...YY...",
]
SPRITE_COLORS = {
    "R": "#e5484d", "G": "#52b84e", "D": "#2e8b2b", "L": "#c9f2d0",
    "W": "#ffffff", "B": "#1b2432", "Y": "#ff9d1f", "C": "#3aa0e8",
    "P": "#ff9ecb",
}


def pixel_parrot_svg():
    cell, x0, y0 = 14, 9, 2
    rects = []
    for r, row in enumerate(SPRITE):
        assert len(row) == 13, f"sprite row {r} has {len(row)} cols"
        for c, ch in enumerate(row):
            if ch != ".":
                rects.append(
                    f'<rect x="{x0 + c * cell}" y="{y0 + r * cell}" '
                    f'width="{cell}" height="{cell}" fill="{SPRITE_COLORS[ch]}"/>')
    return ('<svg viewBox="0 0 200 200" aria-hidden="true" shape-rendering="crispEdges">\n          '
            + "\n          ".join(rects) + "\n        </svg>")


def build(name, cfg):
    html = SRC
    html = html.replace('<link rel="stylesheet" href="css/style.css?v=3">',
                        f'<link rel="stylesheet" href="{cfg["css"]}?v=1">')
    html = html.replace(FONT_BASE, FONT_BASE + cfg["extra_font"])
    html = html.replace("<body>", f'<body data-ring-colors="{cfg["rings"]}">')
    html = re.sub(r"<title>.*?</title>", f"<title>{cfg['title']}</title>", html)
    html = html.replace('<meta name="theme-color" content="#fdf8f0">',
                        f'<meta name="theme-color" content="{cfg["theme_color"]}">')
    html = html.replace('<div class="en-title">maathaadu! · speak!</div>',
                        f'<div class="en-title">{cfg["en_title"]}</div>')
    html = html.replace('<h2 class="shelf-title">PICK A GAME</h2>',
                        f'<h2 class="shelf-title">{cfg["shelf"]}</h2>')
    if cfg.get("pixel_parrot"):
        html = re.sub(r'<svg viewBox="0 0 200 200" aria-hidden="true">.*?</svg>',
                      pixel_parrot_svg(), html, count=1, flags=re.S)
    out = ROOT / f"{name}.html"
    out.write_text(html)
    print(f"  {out.name}")


for name, cfg in VARIANTS.items():
    build(name, cfg)
print("done")
