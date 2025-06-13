const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openImagesFolder: () => ipcRenderer.invoke('open-images-folder'),
  startOverlay: () => ipcRenderer.invoke('start-overlay'),
  startWallpaper: () => ipcRenderer.invoke('start-wallpaper'),
  stopDesktopMode: () => ipcRenderer.invoke('stop-desktop-mode')
});
