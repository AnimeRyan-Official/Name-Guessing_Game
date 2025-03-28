# Student Name Quiz - Windows Desktop Edition

This is the Windows desktop version of the Student Name Quiz application. It allows teachers to learn and memorize their students' names through an interactive quiz game.

## Features

- Standalone Windows desktop application
- Uses the same database as the web version
- Local storage of student data
- Offline capability
- Native desktop experience

## Development

To run the application in development mode:

1. Make sure you have Node.js installed on your system
2. Install dependencies by running:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

This will launch an Electron window that loads the application.

## Building for Production

To build the application for Windows:

1. First build the web application:
   ```
   cd ..
   npm run build
   cd windows-app
   ```

2. Run the build script:
   ```
   node build-script.js
   ```

3. Create the Windows installer:
   ```
   npm run dist
   ```

The installer will be created in the `dist` directory.

## Architecture

The Windows desktop application uses Electron to wrap the web application in a desktop shell. The application runs a local Express server to serve the API endpoints, just like the web version. However, this server runs on a different port to avoid conflicts with the web version.

### Key Files

- `src/main.js`: The main Electron process file
- `src/preload.js`: Preload script for the Electron renderer process
- `src/renderer.js`: Renderer-specific code for the desktop version
- `build-script.js`: Script to build the application for distribution
- `package.json`: Configuration for the desktop application

## Distribution

The application is packaged using Electron Builder, which creates a Windows installer. The installer will install the application to the user's system and create a desktop shortcut.

## License

This project is licensed under the MIT License.