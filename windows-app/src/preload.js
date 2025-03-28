const { contextBridge, ipcRenderer } = require('electron');

// Expose environment information to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Flag to indicate we're running in Electron
  isElectron: true,
  // App version from package.json
  appVersion: process.env.npm_package_version || '1.0.0',
  // Platform information
  platform: process.platform
});

// Notify the renderer when the preload script has completed
window.addEventListener('DOMContentLoaded', () => {
  console.log('Preload script has loaded, running in Electron');
  
  // Add a class to the body to enable Electron-specific CSS
  document.body.classList.add('electron-app');
});