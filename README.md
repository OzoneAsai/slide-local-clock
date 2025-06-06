# Local Clock Slideshow

This project shows a clock with a photo slideshow in the browser. The `index.html` uses JavaScript to rotate through images from the `public/static` directory.

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

Place any background images (jpg, png, gif) inside `public/static` and they will be included in the slideshow.

## Running with Electron

You can package this project as a standalone application that includes a
browser using Electron. When packaged, images are loaded from a `static`
directory located next to the executable so you can change them without
rebuilding.

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

After building, copy your images into the `static` folder beside the generated
executable.
