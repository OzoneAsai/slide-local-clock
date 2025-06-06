const { contextBridge, shell } = require('electron');
const path = require('path');
const os = require('os');

contextBridge.exposeInMainWorld('electronAPI', {
  openImagesFolder: async () => {
    const dir = path.join(os.homedir(), 'clocl_wallpapers');
    const err = await shell.openPath(dir);
    if (err) {
      console.error('Failed to open folder:', err);
    }
  }
});
