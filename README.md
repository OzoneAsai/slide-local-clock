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
