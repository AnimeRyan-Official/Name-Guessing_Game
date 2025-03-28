const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');

// Global reference to the mainWindow object
let mainWindow;
let serverProcess;
let serverPort = 5123; // Use a different port than the web app

// Determine if we're in development or production
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const resourcesPath = isDev ? path.join(__dirname, '..') : process.resourcesPath;

// Function to create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(resourcesPath, 'resources', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Set app name in the title bar
  mainWindow.setTitle('Student Name Quiz');

  // In development, load from the dev server
  if (isDev) {
    mainWindow.loadURL(`http://localhost:${serverPort}`);
    // Open DevTools in development mode
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the local server
    mainWindow.loadURL(`http://localhost:${serverPort}`);
  }

  // Handle window being closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Start the server
function startServer() {
  // Set environment variable to indicate desktop mode
  process.env.DESKTOP_MODE = 'true';
  process.env.PORT = serverPort;

  if (isDev) {
    // In development, start the server using node
    const serverPath = path.join(__dirname, '..', '..', 'server', 'index.js');
    console.log('Starting server in development mode from:', serverPath);
    serverProcess = spawn('node', [serverPath]);
  } else {
    // In production, start the server from the packaged resources
    const serverPath = path.join(resourcesPath, 'server', 'index.js');
    console.log('Starting server in production mode from:', serverPath);
    serverProcess = spawn('node', [serverPath]);
  }

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

// Create the main window when Electron is ready
app.on('ready', () => {
  startServer();
  
  // Wait a moment for the server to start before opening the window
  setTimeout(() => {
    createWindow();
  }, 1000);
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, it's common for applications to stay open
  // until the user explicitly quits with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create the window when the dock icon is clicked
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Clean up the server process before quitting
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});