const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openImagesFolder: () => ipcRenderer.invoke('open-images-folder'),
  startWallpaper: () => ipcRenderer.invoke('start-wallpaper'),
  stopWallpaper: () => ipcRenderer.invoke('stop-wallpaper')
});
