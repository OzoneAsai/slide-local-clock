
@echo off

rem Build a portable Electron app for Windows
set "CSC_IDENTITY_AUTO_DISCOVERY=false"

set "FONT_DIR=public\fonts"
set "FONT_FILE=%FONT_DIR%\KaiseiDecol-Regular.ttf"
set "FONT_URL=https://fonts.gstatic.com/s/kaiseidecol/v10/bMrwmSqP45sidWf3QmfFW6iyWw.ttf"

if not exist "%FONT_DIR%" mkdir "%FONT_DIR%"
if not exist "%FONT_FILE%" (
  echo Downloading Kaisei Decol font...
  powershell -Command "Invoke-WebRequest -Uri %FONT_URL% -OutFile %FONT_FILE%"
)

npm install

npx electron-builder --win portable

