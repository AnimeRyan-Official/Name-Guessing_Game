# Packaging the Windows Desktop Application

This document provides instructions for packaging the Student Name Quiz application into a Windows executable (.exe) file.

## Prerequisites

Before packaging the application, ensure you have the following installed:

1. Node.js (v14 or later)
2. npm (comes with Node.js)
3. Git (for version control)

## Steps to Package the Application

### 1. Install Dependencies

First, install all the necessary dependencies for both the main application and the Windows desktop version:

```bash
# Install main application dependencies
cd /path/to/student-name-quiz
npm install

# Install Windows app dependencies
cd windows-app
npm install
```

### 2. Build the Main Application

Before packaging the Windows app, you need to build the main application:

```bash
# In the root directory of the project
npm run build
```

This will create a `dist` directory with the bundled application.

### 3. Prepare Windows App for Packaging

The Windows app has a preparation script that copies necessary files from the main application:

```bash
# In the windows-app directory
npm run prepare-build
```

This will:
- Create necessary directories
- Copy server files from the main application
- Copy shared files
- Create an icon file for the application

### 4. Package the Application

Now you can create the Windows executable:

```bash
# In the windows-app directory
npm run make-exe
```

This command will:
1. Run the preparation script again to ensure all files are up to date
2. Use electron-builder to create both an installer (.exe) and a portable version
3. Place the resulting files in the `windows-app/dist` directory

## Output Files

After the packaging process is complete, you will find these files in the `windows-app/dist` directory:

1. `Student Name Quiz-1.0.0-Setup.exe` - Windows installer that will install the application
2. `Student Name Quiz-1.0.0-Portable.exe` - Portable version that can run without installation
3. Other supporting files and directories

## Installation

To install the application:

1. Run the `Student Name Quiz-1.0.0-Setup.exe` file
2. Follow the installation prompts
3. The application will be installed to the selected directory
4. A desktop shortcut will be created

## Portable Usage

The portable version (`Student Name Quiz-1.0.0-Portable.exe`) can be run directly without installation. This is useful for running the application from a USB drive or in environments where you don't have installation permissions.

## Troubleshooting

If you encounter issues during packaging:

1. Ensure all dependencies are installed correctly
2. Check that the main application builds successfully
3. Verify that the PostgreSQL database configuration is correct
4. Look for errors in the console output during the packaging process

## Updating the Application

To update the application:

1. Make your changes to the codebase
2. Increment the version number in `windows-app/package.json`
3. Follow the steps above to rebuild and repackage the application