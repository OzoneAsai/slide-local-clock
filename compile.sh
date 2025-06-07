#!/bin/sh
# Build a portable Electron app for Linux/macOS
npm install
npx electron-builder --linux AppImage
