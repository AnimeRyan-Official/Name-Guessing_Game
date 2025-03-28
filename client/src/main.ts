import { app, BrowserWindow } from "electron";
import * as path from "path";

let mainWindow: BrowserWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
});
