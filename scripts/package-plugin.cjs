const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
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

// 4. Copy essential runtime directories
const DIRS_TO_COPY = ['includes', 'dist'];
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

// 6. Zip using tar.exe (bsdtar) for standard POSIX forward-slash (/) paths
// Prevents WordPress ZipArchive backslash failure: "Could not copy file. zoventic-geo\assets\"
try {
  const stagingParent = path.join(ROOT_DIR, 'dist-package');
  execSync(`tar.exe -a -c -f "${ZIP_FILE}" zoventic-geo`, {
    cwd: stagingParent,
    stdio: 'inherit'
  });
  const zipStats = fs.statSync(ZIP_FILE);
  console.log(`SUCCESS! Plugin packaged cleanly into zoventic-geo.zip (${(zipStats.size / 1024).toFixed(1)} KB) with standard forward slashes.`);
} catch (err) {
  console.error('Error compressing archive with tar.exe:', err);
}
