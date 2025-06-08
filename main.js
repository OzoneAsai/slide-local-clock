const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const startServer = require('./server');

let mainWindow;
let serverInstance;

function createWindow() {
  const port = process.env.PORT || 3000;
  const host = '127.0.0.1';
  const appDir = path.join(__dirname, 'public');
  const staticDir = path.join(os.homedir(), 'clock_wallpapers');
  serverInstance = startServer({ port, host, appDir, staticDir });

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.loadURL(`http://${host}:${port}`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('open-images-folder', async () => {
  const dir = path.join(os.homedir(), 'clock_wallpapers');
  const err = await shell.openPath(dir);
  if (err) {
    console.error('Failed to open folder:', err);
  }
});

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
