import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Determine shared directory path based on environment
let sharedPath = path.join(process.cwd(), 'shared');

// Check if running in Electron packaged mode
if (process.env.ELECTRON_RUN === '1') {
  log('Running in Electron mode');
  
  // In packaged Electron app, the shared folder is in resources
  // For TypeScript, use process.env for the resource path
  const resourcesPath = (process.env.ELECTRON_RESOURCES_PATH || '');
  if (resourcesPath) {
    sharedPath = path.join(resourcesPath, 'shared');
    log(`Using shared resources path: ${sharedPath}`);
  } else {
    log('Using development shared path for Electron');
  }
}

// Serve shared directory which contains student photos
app.use('/shared', express.static(sharedPath));

// Add renderer.js for desktop version
app.get('/desktop-renderer.js', (req, res) => {
  if (process.env.ELECTRON_RUN === '1') {
    // In Electron mode, serve the renderer script
    const resourcesPath = (process.env.ELECTRON_RESOURCES_PATH || '');
    if (resourcesPath) {
      // Packaged app
      res.sendFile(path.join(resourcesPath, 'src', 'renderer.js'));
    } else {
      // Development mode
      res.sendFile(path.join(process.cwd(), 'windows-app', 'src', 'renderer.js'));
    }
  } else {
    // In web mode, serve an empty script
    res.type('text/javascript').send('console.log("Web version running");');
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = parseInt(process.env.PORT || '5000');

  server.listen(PORT, () => {
    log(`serving on 0.0.0.0:${PORT}`);
    
    if (process.env.ELECTRON_RUN === '1') {
      log('Server started in Electron desktop mode');
    } else {
      log('Server started in web mode');
    }
  });
})();