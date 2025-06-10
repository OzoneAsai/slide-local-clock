const { app, BrowserWindow, ipcMain, shell, screen } = require('electron');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const startServer = require('./server');

let mainWindow;
let desktopWindow;
let desktopMode; // 'overlay' or 'wallpaper'
let serverInstance;
let host = '127.0.0.1';
let port = 3000;

function getWindowHandle(win) {
  const buf = win.getNativeWindowHandle();
  if (process.arch === 'ia32') {
    return buf.readUInt32LE(0);
  }
  return Number(buf.readBigUInt64LE(0));
}

function attachToWorkerW(win) {
  if (process.platform !== 'win32') return;
  const hwnd = getWindowHandle(win);
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

function attachToProgman(win) {
  if (process.platform !== 'win32') return;
  const hwnd = getWindowHandle(win);
  const script = path.join(__dirname, 'attach-overlay.ps1');
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
    console.error('Failed to attach overlay window', err);
  }
}

function createWindow() {
  port = process.env.PORT || 3000;
  host = '127.0.0.1';
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

function createDesktopWindow(mode) {
  desktopMode = mode;
  desktopWindow = new BrowserWindow({
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
  desktopWindow.loadURL(`http://${host}:${port}`);
  if (mode === 'wallpaper') {
    attachToWorkerW(desktopWindow);
  } else {
    attachToProgman(desktopWindow);
  }
  desktopWindow.on('closed', () => {
    desktopWindow = null;
    desktopMode = null;
  });
}

ipcMain.handle('open-images-folder', async () => {
  const dir = path.join(os.homedir(), 'clock_wallpapers');
  const err = await shell.openPath(dir);
  if (err) {
    console.error('Failed to open folder:', err);
  }
});

ipcMain.handle('start-overlay', () => {
  if (!desktopWindow) {
    createDesktopWindow('overlay');
  }
  if (mainWindow) {
    mainWindow.setSize(480, 640);
    mainWindow.loadFile(path.join(__dirname, 'public', 'setting.html'));
  }
});

ipcMain.handle('start-wallpaper', () => {
  if (!desktopWindow) {
    createDesktopWindow('wallpaper');
  }
  if (mainWindow) {
    mainWindow.setSize(480, 640);
    mainWindow.loadFile(path.join(__dirname, 'public', 'setting.html'));
  }
});

ipcMain.handle('stop-desktop-mode', () => {
  if (desktopWindow) {
    desktopWindow.close();
    desktopWindow = null;
    desktopMode = null;
  }
  if (mainWindow) {
    mainWindow.setSize(800, 600);
    mainWindow.loadURL(`http://${host}:${port}`);
  }
});

app.whenReady().then(() => {
  createWindow();
  if (process.argv.includes('--overlay')) {
    createDesktopWindow('overlay');
    if (mainWindow) {
      mainWindow.setSize(480, 640);
      mainWindow.loadFile(path.join(__dirname, 'public', 'setting.html'));
    }
  } else if (process.argv.includes('--wallpaper')) {
    createDesktopWindow('wallpaper');
    if (mainWindow) {
      mainWindow.setSize(480, 640);
      mainWindow.loadFile(path.join(__dirname, 'public', 'setting.html'));
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverInstance) {
    serverInstance.close();
  }
  if (desktopWindow) {
    desktopWindow.close();
    desktopWindow = null;
    desktopMode = null;
  }
});
