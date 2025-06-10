const { app, BrowserWindow, ipcMain, shell, screen } = require('electron');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const startServer = require('./server');

let mainWindow;
let wallpaperWindow;
let serverInstance;
let host = '127.0.0.1';
let port = 3000;

function attachToWorkerW(win) {
  if (process.platform !== 'win32') return;
  const hwnd = win.getNativeWindowHandle().readInt32LE(0);
  const script = path.join(__dirname, 'attach-workerw.ps1');
  try {
    execFileSync('powershell.exe', [
      '-NoLogo',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      script,
      hwnd.toString(),
    ]);
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win.setBounds({ x: 0, y: 0, width, height });
  } catch (err) {
    console.error('Failed to attach wallpaper window', err);
  }
}

function createWindow() {
  const wallpaperMode = process.argv.includes('--wallpaper');
  port = process.env.PORT || 3000;
  host = '127.0.0.1';
  const appDir = path.join(__dirname, 'public');
  const staticDir = path.join(os.homedir(), 'clock_wallpapers');
  serverInstance = startServer({ port, host, appDir, staticDir });

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: wallpaperMode ? false : true,
    transparent: wallpaperMode,
    resizable: !wallpaperMode,
    skipTaskbar: wallpaperMode,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.loadURL(`http://${host}:${port}`);
  if (wallpaperMode) {
    attachToWorkerW(mainWindow);
  }
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createWallpaperWindow() {
  wallpaperWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  wallpaperWindow.loadURL(`http://${host}:${port}`);
  attachToWorkerW(wallpaperWindow);
  wallpaperWindow.on('closed', () => {
    wallpaperWindow = null;
  });
}

ipcMain.handle('open-images-folder', async () => {
  const dir = path.join(os.homedir(), 'clock_wallpapers');
  const err = await shell.openPath(dir);
  if (err) {
    console.error('Failed to open folder:', err);
  }
});

ipcMain.handle('start-wallpaper', () => {
  if (!wallpaperWindow) {
    createWallpaperWindow();
  }
  if (mainWindow) {
    mainWindow.setSize(480, 640);
    mainWindow.loadFile(path.join(__dirname, 'public', 'setting.html'));
  }
});

ipcMain.handle('stop-wallpaper', () => {
  if (wallpaperWindow) {
    wallpaperWindow.close();
    wallpaperWindow = null;
  }
  if (mainWindow) {
    mainWindow.setSize(800, 600);
    mainWindow.loadURL(`http://${host}:${port}`);
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
  if (wallpaperWindow) {
    wallpaperWindow.close();
    wallpaperWindow = null;
  }
});
