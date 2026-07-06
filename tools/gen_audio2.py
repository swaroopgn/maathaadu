#!/usr/bin/env python3
"""Generate audio for all game content in js/content.js via edge-tts.

Emits (skipping files that already exist; --force to redo):
  audio/words/<id>.mp3 (+ _slow)      barrier words with grp == "words"
  audio/missions/<id>.mp3 (+ _slow)
  audio/echo/<id>.mp3 (+ _slow)
  audio/ajji/<id>.mp3 (+ _slow)       all packs
  audio/story/<id>.mp3                story lines & questions (normal only)

(animals/food word audio predates this script and lives in audio/animals|food/.)
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE = "kn-IN-SapnaNeural"
SLOW_RATE = "-35%"
FORCE = "--force" in sys.argv


def load_data():
    out = subprocess.check_output(
        ["node", "-e",
         "const fs=require('fs');"
         "eval(fs.readFileSync(process.argv[1],'utf8').replace(/^const /gm,'var '));"
         "console.log(JSON.stringify({BARRIER_CATS,MISSIONS,ECHO,AJJI_PACKS,STORIES}))",
         str(ROOT / "js/content.js")],
        text=True)
    return json.loads(out)


def tts(text, dest, rate=None):
    if dest.exists() and not FORCE:
        return False
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["uvx", "edge-tts", "--voice", VOICE, "--text", text,
           "--write-media", str(dest)]
    if rate:
        cmd += [f"--rate={rate}"]
    subprocess.run(cmd, check=True, capture_output=True)
    return True


def main():
    data = load_data()
    jobs = []
    for cat in data["BARRIER_CATS"]:
        for w in cat["items"]:
            if w["grp"] != "words":
                continue  # animals/food audio already exists elsewhere
            base = ROOT / "audio/words"
            jobs.append((w["kn"], base / f"{w['id']}.mp3", None))
            jobs.append((w["kn"], base / f"{w['id']}_slow.mp3", SLOW_RATE))
    for m in data["MISSIONS"]:
        base = ROOT / "audio/missions"
        jobs.append((m["kn"], base / f"{m['id']}.mp3", None))
        jobs.append((m["kn"], base / f"{m['id']}_slow.mp3", SLOW_RATE))
    for e in data["ECHO"]:
        base = ROOT / "audio/echo"
        jobs.append((e["kn"], base / f"{e['id']}.mp3", None))
        jobs.append((e["kn"], base / f"{e['id']}_slow.mp3", SLOW_RATE))
    for pack in data["AJJI_PACKS"]:
        for a in pack["items"]:
            base = ROOT / "audio/ajji"
            jobs.append((a["kn"], base / f"{a['id']}.mp3", None))
            jobs.append((a["kn"], base / f"{a['id']}_slow.mp3", SLOW_RATE))
    for story in data["STORIES"]:
        for p in story["parts"]:
            jobs.append((p["kn"], ROOT / "audio/story" / f"{p['id']}.mp3", None))

    made = 0
    for text, dest, rate in jobs:
        if tts(text, dest, rate):
            made += 1
            print(f"  {dest.relative_to(ROOT)}", flush=True)
    print(f"done: {made} generated, {len(jobs) - made} already present")


if __name__ == "__main__":
    main()
