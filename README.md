# Local Clock Slideshow

This project shows a clock with a photo slideshow in the browser. The
`index.html` loads images from `~/clocl_wallpapers` so you can easily update the
slideshow contents.

Everything is powered by Node.js, so no Python runtime is required.

## Running (development)

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server:
   ```sh
   node server.js
   ```
   The page will be available at <http://localhost:3000>.

During development the app serves images from the folder `~/clocl_wallpapers`.
If the directory does not exist it will be created automatically. Place any
background images (jpg, png or gif) there and they will be shown in the
slideshow. A button in the settings overlay opens this folder in your file
manager when running the Electron build. In a regular browser the button shows
an alert since the folder cannot be opened automatically.

User preferences such as font choice or slideshow timing are saved to a
`settings.json` file inside your system data directory (`%APPDATA%` on Windows
or `$XDG_DATA_HOME` on Linux/macOS). This allows the app to remember your
settings between runs.

## Running with Electron

You can package this project as a standalone application that includes a
browser using Electron. The packaged app also reads images from the
`~/clocl_wallpapers` directory so you can update backgrounds without
rebuilding. Use the "Open Image Folder" button from the settings overlay to
quickly open that directory.

### Development preview

```
npm run electron
```

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

After building, put your images into the `~/clocl_wallpapers` directory to
change the slideshow without rebuilding.
Your saved settings will be read from the same data directory used in
development, so preferences carry over to the packaged app.

### Dependency notes

The build uses recent versions of Electron and electron-builder. Some
transitive packages were deprecated, so `package.json` overrides replace
`@npmcli/move-file` with `@npmcli/fs`. The lockfile was regenerated with
electron-builder 26.0.16 to minimize deprecation warnings when running the
compile scripts.
