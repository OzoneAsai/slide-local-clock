const { contextBridge, shell } = require('electron');
const path = require('path');
const os = require('os');

contextBridge.exposeInMainWorld('electronAPI', {
  openImagesFolder: () => {
    const dir = path.join(os.homedir(), 'clocl_wallpapers');
    shell.openPath(dir);
  }
});
