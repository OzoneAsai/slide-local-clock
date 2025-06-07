
@echo off

rem Build a portable Electron app for Windows
set "CSC_IDENTITY_AUTO_DISCOVERY=false"

npm install

npx electron-builder --win portable

