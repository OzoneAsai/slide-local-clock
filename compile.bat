
@echo off

rem Build a portable Electron app for Windows

npm install

npx electron-builder --win portable

