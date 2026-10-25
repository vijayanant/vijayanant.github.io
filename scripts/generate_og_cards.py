#!/usr/bin/env python3
"""
scripts/generate_og_cards.py
Generates 1200x630 JPEG social cards by snapshotting Hugo's rendered og-card.html.
Saves og.jpg directly into content/posts/ and content/series/ so images are tracked in git.
Fonts are cached in .cache/og-fonts/ (gitignored) on demand and injected into <style>.
Includes an automated in-engine preflight check to verify font loading at runtime.
Zero external dependencies; uses headless Chrome.
"""

import os
import re
import sys
import shutil
import base64
import urllib.request
import subprocess

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
CONTENT_DIR = os.path.join(PROJECT_ROOT, "content")
CACHE_DIR = os.path.join(PROJECT_ROOT, ".cache", "og-fonts")
SCAN_DIRS = [os.path.join(PUBLIC_DIR, sec) for sec in ["posts", "series"]]

FONT_URLS = {
    "newsreader": "https://fonts.gstatic.com/s/newsreader/v26/cY9AfjOCX1hbuyalUrK4397yjIJFJpc.woff2",
    "jetbrains_mono": "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwgknk-4.woff2"
}

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser"
]
CHROME = next((c for c in CHROME_CANDIDATES if (os.path.isfile(c) and os.access(c, os.X_OK)) or shutil.which(c)), None)
if not CHROME:
    sys.exit("Error: Chrome/Chromium binary not found.")

def get_font_css():
    os.makedirs(CACHE_DIR, exist_ok=True)
    rules = []
    for name, url in FONT_URLS.items():
        local_path = os.path.join(CACHE_DIR, f"{name}.woff2")
        if not os.path.exists(local_path):
            headers = {"User-Agent": "Mozilla/5.0"}
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as resp, open(local_path, "wb") as f:
                f.write(resp.read())
        with open(local_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
            fam = "Newsreader" if name == "newsreader" else "JetBrains Mono"
            rules.append(f'@font-face {{ font-family: "{fam}"; src: url("data:font/woff2;base64,{b64}") format("woff2"); font-weight: 300 600; }}')
    return "\n".join(rules)

def verify_fonts_preflight(chrome_bin, font_css):
    """Verifies inside headless Chrome that fonts decode and load cleanly."""
    preflight_html = f"""<!DOCTYPE html>
<html>
<head>
<style>
{font_css}
body {{ font-family: "Newsreader", serif; }}
code {{ font-family: "JetBrains Mono", monospace; }}
</style>
<script>
window.addEventListener("DOMContentLoaded", async () => {{
    await document.fonts.ready;
    const newsreader = Array.from(document.fonts).some(f => f.family === "Newsreader" && f.status === "loaded");
    const mono = Array.from(document.fonts).some(f => f.family === "JetBrains Mono" && f.status === "loaded");
    document.title = (newsreader && mono) ? "FONTS_VERIFIED" : "FONTS_FAILED";
}});
</script>
</head>
<body>Verify Newsreader <code>Mono</code></body>
</html>"""

    temp_path = os.path.join(CACHE_DIR, "preflight.html")
    with open(temp_path, "w", encoding="utf-8") as f:
        f.write(preflight_html)

    try:
        res = subprocess.run([
            chrome_bin, "--headless", "--disable-gpu", "--virtual-time-budget=2000",
            "--dump-dom", f"file://{os.path.abspath(temp_path)}"
        ], capture_output=True, text=True, check=True)
        if "<title>FONTS_VERIFIED</title>" not in res.stdout:
            sys.exit("Error: Preflight font verification failed! Chrome could not load Newsreader or JetBrains Mono.")
        print("✓ Preflight check: Newsreader & JetBrains Mono loaded cleanly in Chrome.")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def main():
    force = "--force" in sys.argv
    count = 0

    print("Building Hugo site to render card HTML...")
    subprocess.run(["hugo", "--minify"], check=True)

    font_css = get_font_css()
    verify_fonts_preflight(CHROME, font_css)

    for scan_dir in SCAN_DIRS:
        if not os.path.exists(scan_dir):
            continue

        for root, _, files in os.walk(scan_dir):
            if "og-card.html" in files:
                html_path = os.path.join(root, "og-card.html")
                if os.path.getsize(html_path) == 0:
                    continue

                with open(html_path, "r", encoding="utf-8") as f:
                    html_content = f.read()

                dir_match = re.search(r'<meta name="?content-dir"? content="?([^">]+)"?>', html_content[:2048])
                if dir_match:
                    rel_dir = dir_match.group(1).strip()
                    dest_dir = os.path.join(CONTENT_DIR, rel_dir)
                else:
                    rel = os.path.relpath(root, PUBLIC_DIR)
                    dest_dir = os.path.join(CONTENT_DIR, rel)

                if not os.path.exists(dest_dir):
                    continue

                out_jpg = os.path.join(dest_dir, "og.jpg")

                # Caching: only regenerate if markdown changed, or --force
                if not force and os.path.exists(out_jpg):
                    source_md = os.path.join(dest_dir, "index.md")
                    if not os.path.exists(source_md):
                        source_md = os.path.join(dest_dir, "_index.md")

                    if os.path.exists(source_md) and os.path.getmtime(out_jpg) >= os.path.getmtime(source_md):
                        continue

                # Inject cached base64 fonts at the beginning of <style>
                if "<style>" in html_content:
                    injected_html = html_content.replace("<style>", f"<style>\n{font_css}\n", 1)
                else:
                    injected_html = html_content.replace("<head>", f"<head><style>\n{font_css}\n</style>", 1)

                temp_html = os.path.join(root, "_temp_og.html")
                with open(temp_html, "w", encoding="utf-8") as f:
                    f.write(injected_html)

                try:
                    subprocess.run([
                        CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
                        "--window-size=1200,630",
                        f"--screenshot={out_jpg}", f"file://{os.path.abspath(temp_html)}"
                    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    count += 1
                    print(f"Generated: {os.path.relpath(out_jpg, PROJECT_ROOT)}")
                finally:
                    if os.path.exists(temp_html):
                        os.remove(temp_html)

    print(f"Social card generation complete. Generated/updated {count} cards.")

if __name__ == "__main__":
    main()
