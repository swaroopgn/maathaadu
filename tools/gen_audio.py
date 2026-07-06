#!/usr/bin/env python3
"""Generate Kannada audio for Maathaadu! lessons via edge-tts.

Reads js/lessons.js (via node), emits audio/<lesson>/<id>.mp3 (+ _slow) and
audio/praise/<id>.mp3. Skips files that already exist; pass --force to redo.

Usage: python3 tools/gen_audio.py [--force]
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
         "console.log(JSON.stringify({LESSONS,PRAISE}))",
         str(ROOT / "js/lessons.js")],
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
    for lesson in data["LESSONS"]:
        for item in lesson["items"]:
            base = ROOT / "audio" / lesson["id"]
            jobs.append((item["kn"], base / f"{item['id']}.mp3", None))
            jobs.append((item["kn"], base / f"{item['id']}_slow.mp3", SLOW_RATE))
    for p in data["PRAISE"]:
        jobs.append((p["kn"], ROOT / "audio" / "praise" / f"{p['id']}.mp3", None))

    made = 0
    for text, dest, rate in jobs:
        if tts(text, dest, rate):
            made += 1
            print(f"  {dest.relative_to(ROOT)}")
    print(f"done: {made} generated, {len(jobs) - made} already present")


if __name__ == "__main__":
    main()
