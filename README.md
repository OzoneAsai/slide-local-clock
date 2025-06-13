# Local Clock Slideshow

This project shows a clock with a photo slideshow in the browser. The
`index.html` loads images from `~/clock_wallpapers` so you can easily update the
slideshow contents.

Everything is powered by Node.js (v14.18 or newer), so no Python runtime is required.

## Running (development)

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server:
   ```sh
   node server.js
   ```
   The page will be available at <http://127.0.0.1:3000>.
   By binding only to the local interface the Windows firewall prompt is
   avoided.

During development the app serves images from the folder `~/clock_wallpapers`.
If the directory does not exist it will be created automatically. Place any
background images (jpg, png or gif) there and they will be shown in the
slideshow. A button in the settings overlay opens this folder in your file
manager when running the Electron build. In a regular browser the button shows
an alert since the folder cannot be opened automatically.

User preferences such as font choice, slideshow timing and the clock display
format are saved to a `settings.json` file inside your system data directory
(`%APPDATA%` on Windows or `$XDG_DATA_HOME` on Linux/macOS). The first line of
the clock can use a custom format string like `HH:mm:ss`. The second line's date
language and format can be chosen from the settings overlay. Date format options
adjust to the UI language and show examples such as `6月8日(日)` when Japanese is
selected. The numeric style is the default. The text size can be adjusted with a
multiplier and the ratio between the time and date lines. These settings let the
app remember your preferences between runs.

## Running with Electron

You can package this project as a standalone application that includes a
browser using Electron. The packaged app also reads images from the
`~/clock_wallpapers` directory so you can update backgrounds without
rebuilding. Use the "Open Image Folder" button from the settings overlay to
quickly open that directory.

### Development preview

```
npm run electron
```

### Desktop overlay (Windows only)

You can place the clock above the desktop, hiding icons. Toggle this from the settings overlay or via the command line.

- **From the app:** open the settings overlay (⚙️) and click **Desktop Overlay**. The main window shrinks to a small controller. Use **Stop Desktop Mode** to revert.
- **From the CLI:**
  ```
  npm run electron -- --overlay
  ```

The overlay loads a tiny `setting.html` redirect (`index.html?control`) while
active so you can tweak settings.

### Building a single executable

Use the provided helper scripts to build a portable executable:

```
./compile.sh     # Linux/macOS (produces an AppImage)
```

On Windows run:

```
compile.bat      # Windows (produces a portable .exe)
```
`compile.bat` sets the environment variable `CSC_IDENTITY_AUTO_DISCOVERY=false`
so Electron Builder won't attempt code signing automatically.

After building, put your images into the `~/clock_wallpapers` directory to
change the slideshow without rebuilding.
Your saved settings will be read from the same data directory used in
development, so preferences carry over to the packaged app.

The build scripts also fetch the **Kaisei Decol** font automatically. This
font is bundled into `public/fonts` so the app can display text offline even if
Google Fonts is unreachable.

### Dependency notes

The build uses recent versions of Electron and electron-builder. Some
transitive packages were deprecated, so `package.json` overrides replace
`@npmcli/move-file` with `@npmcli/fs`. The lockfile was regenerated with
electron-builder 26.0.16 to minimize deprecation warnings when running the
compile scripts.
