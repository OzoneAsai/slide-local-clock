const { app, BrowserWindow, ipcMain, shell, screen } = require('electron');
const path = require('path');
const os = require('os');
const startServer = require('./server');
let ffi, ref;
if (process.platform === 'win32') {
  ffi = require('ffi-napi');
  ref = require('ref-napi');
}

let mainWindow;
let wallpaperWindow;
let serverInstance;
let host = '127.0.0.1';
let port = 3000;

function toLPCWSTR(str) {
  return Buffer.from(str + '\0', 'ucs2');
}

function getUser32() {
  if (process.platform !== 'win32') return null;
  return ffi.Library('user32', {
    FindWindowW: ['long', ['pointer', 'pointer']],
    SendMessageTimeoutW: [
      'ulong',
      ['long', 'uint', 'ulong', 'ulong', 'uint', 'uint', 'pointer'],
    ],
    EnumWindows: ['bool', ['pointer', 'long']],
    GetClassNameW: ['int', ['long', 'pointer', 'int']],
    FindWindowExW: ['long', ['long', 'long', 'pointer', 'pointer']],
    SetParent: ['long', ['long', 'long']],
  });
}

function findWorkerW(user32) {
  const progman = user32.FindWindowW(toLPCWSTR('Progman'), toLPCWSTR('Program Manager'));
  user32.SendMessageTimeoutW(progman, 0x052C, 0, 0, 0, 1000, ref.NULL);

  let worker = 0;
  const enumProc = ffi.Callback('bool', ['long', 'long'], (hwnd) => {
    const clsBuf = Buffer.alloc(256);
    user32.GetClassNameW(hwnd, clsBuf, 256);
    const cls = clsBuf.toString('ucs2').replace(/\0+$/, '');
    if (cls === 'WorkerW') {
      const child = user32.FindWindowExW(hwnd, 0, toLPCWSTR('SHELLDLL_DefView'), ref.NULL);
      if (child === 0) {
        worker = hwnd;
        return false;
      }
    }
    return true;
  });
  user32.EnumWindows(enumProc, 0);
  return worker;
}

function attachToWorkerW(win) {
  if (process.platform !== 'win32') return;
  const user32 = getUser32();
  const hwnd = win.getNativeWindowHandle().readInt32LE(0);
  const worker = findWorkerW(user32);
  if (worker && hwnd) {
    user32.SetParent(hwnd, worker);
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win.setBounds({ x: 0, y: 0, width, height });
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
