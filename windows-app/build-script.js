const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

// Define paths
const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(__dirname, 'build');
const distDir = path.join(rootDir, 'dist');
const sharedDir = path.join(rootDir, 'shared');
const buildServerDir = path.join(buildDir, 'server');
const buildSharedDir = path.join(buildDir, 'shared');
const resourcesDir = path.join(__dirname, 'resources');

// Create build directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}
if (!fs.existsSync(buildServerDir)) {
  fs.mkdirSync(buildServerDir, { recursive: true });
}
if (!fs.existsSync(buildSharedDir)) {
  fs.mkdirSync(buildSharedDir, { recursive: true });
}
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// Build the main application
console.log('Building the main application...');
try {
  child_process.execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
} catch (error) {
  console.error('Failed to build the main application:', error);
  process.exit(1);
}

// Function to copy a directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Create a basic ICO file from our SVG
function createIconFile() {
  const svgPath = path.join(resourcesDir, 'icon.svg');
  const icoPath = path.join(resourcesDir, 'icon.ico');
  
  // Check if ICO file already exists
  if (fs.existsSync(icoPath)) {
    console.log('Icon file already exists, skipping creation');
    return;
  }
  
  // Check if SVG file exists
  if (!fs.existsSync(svgPath)) {
    console.error('SVG icon file does not exist at:', svgPath);
    return;
  }
  
  console.log('Creating basic ICO file...');
  try {
    // Create a minimal ICO file with a header
    const header = Buffer.from([
      0x00, 0x00,           // Reserved, must be 0
      0x01, 0x00,           // Image type: 1 for icon (.ICO)
      0x01, 0x00,           // Number of images in the file: 1
      0x10, 0x10,           // Width, height: 16x16 pixels
      0x00,                 // Color count (0 means 256 colors)
      0x00,                 // Reserved, must be 0
      0x01, 0x00,           // Color planes
      0x20, 0x00,           // Bits per pixel: 32
      0x28, 0x00, 0x00, 0x00, // Size of the BITMAPINFOHEADER structure
      0x10, 0x00, 0x00, 0x00, // Width: 16 pixels
      0x20, 0x00, 0x00, 0x00, // Height: 16 pixels x 2 (XOR + AND masks)
      0x01, 0x00,           // Color planes: 1
      0x20, 0x00,           // Bits per pixel: 32
      0x00, 0x00, 0x00, 0x00, // Compression: 0 (no compression)
      0x00, 0x00, 0x00, 0x00, // Image size: 0 (can be 0 for no compression)
      0x00, 0x00, 0x00, 0x00, // Horizontal resolution: 0 pixels per meter
      0x00, 0x00, 0x00, 0x00, // Vertical resolution: 0 pixels per meter
      0x00, 0x00, 0x00, 0x00, // Colors in color table: 0
      0x00, 0x00, 0x00, 0x00, // Important color count: 0
    ]);
    
    // Create pixels (purple color similar to our theme)
    const pixelData = Buffer.alloc(16 * 16 * 4);
    for (let i = 0; i < 16 * 16; i++) {
      const offset = i * 4;
      // BGRA format
      pixelData[offset] = 0xE5; // Blue
      pixelData[offset + 1] = 0x46; // Green
      pixelData[offset + 2] = 0x4F; // Red
      pixelData[offset + 3] = 0xff; // Alpha (fully opaque)
    }
    
    // Create the AND mask (all zeros for fully opaque icon)
    const andMask = Buffer.alloc(16 * 16 / 8, 0);
    
    // Combine all parts
    const iconData = Buffer.concat([header, pixelData, andMask]);
    
    // Write the icon file
    fs.writeFileSync(icoPath, iconData);
    console.log('Created a basic ICO file at:', icoPath);
  } catch (error) {
    console.error('Failed to create ICO file:', error);
  }
}

// Copy necessary files from dist to build/server
console.log('Copying server files...');
copyDir(distDir, buildServerDir);

// Copy shared files to build/shared
console.log('Copying shared files...');
copyDir(sharedDir, buildSharedDir);

// Create icon file
createIconFile();

console.log('Build completed successfully!');