#!/bin/sh
# Renders public/og.png (1200x630) from scripts/og/og.html with headless Chrome,
# and public/apple-touch-icon.png (180x180) from public/favicon.svg.
# Run from anywhere: sh scripts/og/render.sh
# Re-run the embed-prompt step afterwards (impeccable embed-prompt --scan public):
# a render replaces the PNG metadata that records where each file came from.
set -eu
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME" --headless=new --screenshot="$ROOT/public/og.png" \
  --window-size=1200,630 --hide-scrollbars --force-device-scale-factor=1 \
  --virtual-time-budget=3000 "file://$ROOT/scripts/og/og.html"

# The touch icon is the favicon on white, in a 180px page.
TMP="$(mktemp -d)"
printf '<!doctype html><meta charset="utf-8"><style>*{margin:0}html,body{width:180px;height:180px;background:#fff;overflow:hidden}img{display:block;width:180px;height:180px}</style><img src="file://%s/public/favicon.svg">' "$ROOT" > "$TMP/icon.html"
"$CHROME" --headless=new --screenshot="$ROOT/public/apple-touch-icon.png" \
  --window-size=180,180 --hide-scrollbars --force-device-scale-factor=1 \
  --virtual-time-budget=1000 "file://$TMP/icon.html"
rm -rf "$TMP"
