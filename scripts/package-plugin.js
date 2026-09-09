const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const STAGING_DIR = path.join(ROOT_DIR, 'dist-package', 'zoventic-geo');
const ZIP_FILE = path.join(ROOT_DIR, 'zoventic-geo.zip');

console.log('Packaging Zoventic GEO Production Distribution...');

// 1. Clean previous builds
if (fs.existsSync(path.join(ROOT_DIR, 'dist-package'))) {
  fs.rmSync(path.join(ROOT_DIR, 'dist-package'), { recursive: true, force: true });
}
if (fs.existsSync(ZIP_FILE)) {
  fs.unlinkSync(ZIP_FILE);
}

fs.mkdirSync(STAGING_DIR, { recursive: true });

// 2. Helper to copy recursive
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((child) => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 3. Copy essential plugin files
const FILES_TO_COPY = ['zoventic-geo.php', 'readme.txt', 'uninstall.php'];
FILES_TO_COPY.forEach((file) => {
  const src = path.join(ROOT_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(STAGING_DIR, file));
    console.log(`Copied file: ${file}`);
  }
});

// 4. Copy essential directories
const DIRS_TO_COPY = ['includes', 'dist', 'assets'];
DIRS_TO_COPY.forEach((dir) => {
  const src = path.join(ROOT_DIR, dir);
  if (fs.existsSync(src)) {
    copyRecursive(src, path.join(STAGING_DIR, dir));
    console.log(`Copied directory: ${dir}/`);
  }
});

// 5. Ensure languages folder
const langDir = path.join(STAGING_DIR, 'languages');
if (!fs.existsSync(langDir)) {
  fs.mkdirSync(langDir, { recursive: true });
  fs.writeFileSync(path.join(langDir, 'index.php'), '<?php // Silence is golden\n');
}

// 6. Zip using PowerShell Compress-Archive
try {
  const stagingParent = path.join(ROOT_DIR, 'dist-package');
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${stagingParent}\\zoventic-geo' -DestinationPath '${ZIP_FILE}' -Force"`, {
    stdio: 'inherit'
  });
  const zipStats = fs.statSync(ZIP_FILE);
  console.log(`SUCCESS! Plugin packaged cleanly into zoventic-geo.zip (${(zipStats.size / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error('Error compressing archive:', err);
}
