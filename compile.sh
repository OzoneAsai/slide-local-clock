#!/bin/sh
# Build a portable Electron app for Linux/macOS
set -e

# Download Kaisei Decol font for offline use if it isn't present
FONT_DIR="public/fonts"
FONT_FILE="$FONT_DIR/KaiseiDecol-Regular.ttf"
FONT_URL="https://fonts.gstatic.com/s/kaiseidecol/v10/bMrwmSqP45sidWf3QmfFW6iyWw.ttf"

mkdir -p "$FONT_DIR"
if [ ! -f "$FONT_FILE" ]; then
  echo "Downloading Kaisei Decol font..."
  curl -L -o "$FONT_FILE" "$FONT_URL"
fi

npm install
npx electron-builder --linux AppImage
