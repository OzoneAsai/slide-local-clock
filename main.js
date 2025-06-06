const { app, BrowserWindow } = require('electron');
const path = require('path');
const os = require('os');
const startServer = require('./server');

let mainWindow;
let serverInstance;

function createWindow() {
  const port = process.env.PORT || 3000;
  const appDir = path.join(__dirname, 'public');
  const staticDir = path.join(os.homedir(), 'clocl_wallpapers');
  serverInstance = startServer({ port, appDir, staticDir });

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.loadURL(`http://localhost:${port}`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverInstance) {
    serverInstance.close();
  }
});
