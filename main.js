const { app, BrowserWindow } = require('electron');
const path = require('path');
const startServer = require('./server');

let mainWindow;
let serverInstance;

function createWindow() {
  const port = process.env.PORT || 3000;
  const appDir = path.join(__dirname, 'public');
  const staticDir = path.join(path.dirname(app.getPath('exe')), 'static');
  serverInstance = startServer({ port, appDir, staticDir });

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
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
