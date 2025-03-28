// This file will be executed in the renderer process

// Check if we're running in Electron
if (window.electronAPI) {
  console.log('Running in Electron version:', window.electronAPI.appVersion);
  console.log('Platform:', window.electronAPI.platform);
  
  // Add desktop-specific functionality here
  document.addEventListener('DOMContentLoaded', () => {
    // Add a custom stylesheet for desktop-specific styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .electron-app .desktop-only {
        display: block;
      }
      
      .electron-app .web-only {
        display: none;
      }
      
      /* Add desktop-specific styles */
      .electron-app {
        /* Add a subtle border to indicate desktop environment */
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
      
      /* Enhance desktop UI elements */
      .electron-app button, 
      .electron-app .btn {
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Add a desktop badge to the header
    const header = document.querySelector('header');
    if (header) {
      const desktopBadge = document.createElement('div');
      desktopBadge.className = 'desktop-badge';
      desktopBadge.textContent = 'Desktop Edition';
      desktopBadge.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #4f46e5, #818cf8);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
      `;
      header.appendChild(desktopBadge);
    }
  });
}