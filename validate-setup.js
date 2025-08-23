#!/usr/bin/env node

/**
 * Music Blocks Desktop - Installation Validator
 * Validates that all components are properly installed and configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎵 Music Blocks Desktop - Installation Validator\n');

let errors = 0;
let warnings = 0;

function checkFile(filePath, description) {
    try {
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${description}: ${filePath}`);
            return true;
        } else {
            console.log(`❌ ${description}: ${filePath} (MISSING)`);
            errors++;
            return false;
        }
    } catch (error) {
        console.log(`❌ ${description}: ${filePath} (ERROR: ${error.message})`);
        errors++;
        return false;
    }
}

function checkCommand(command, description) {
    try {
        execSync(command, { stdio: 'ignore' });
        console.log(`✅ ${description}: Available`);
        return true;
    } catch (error) {
        console.log(`❌ ${description}: Not available`);
        errors++;
        return false;
    }
}

function checkNodeModules() {
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const electronPkg = JSON.parse(fs.readFileSync('node_modules/electron/package.json', 'utf8'));
        console.log(`✅ Electron: v${electronPkg.version}`);
        
        const builderExists = fs.existsSync('node_modules/electron-builder');
        if (builderExists) {
            console.log(`✅ Electron Builder: Installed`);
        } else {
            console.log(`⚠️  Electron Builder: Not installed`);
            warnings++;
        }
        
        return true;
    } catch (error) {
        console.log(`❌ Node modules check failed: ${error.message}`);
        errors++;
        return false;
    }
}

function validatePackageJson() {
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Check main entry point
        if (packageJson.main === 'electron.js') {
            console.log(`✅ Package.json main entry: ${packageJson.main}`);
        } else {
            console.log(`❌ Package.json main entry: Expected 'electron.js', got '${packageJson.main}'`);
            errors++;
        }
        
        // Check scripts
        const requiredScripts = ['electron', 'electron-dev', 'dist'];
        requiredScripts.forEach(script => {
            if (packageJson.scripts && packageJson.scripts[script]) {
                console.log(`✅ Script '${script}': Available`);
            } else {
                console.log(`❌ Script '${script}': Missing`);
                errors++;
            }
        });
        
        // Check build configuration
        if (packageJson.build) {
            console.log(`✅ Build configuration: Present`);
        } else {
            console.log(`❌ Build configuration: Missing`);
            errors++;
        }
        
        return true;
    } catch (error) {
        console.log(`❌ Package.json validation failed: ${error.message}`);
        errors++;
        return false;
    }
}

// Main validation
console.log('🔍 Checking core files...');
checkFile('electron.js', 'Main Electron process');
checkFile('preload.js', 'Preload script');
checkFile('electron-integration.js', 'Integration layer');
checkFile('offline.html', 'Offline fallback page');
checkFile('sw.js', 'Service worker');

console.log('\n🔍 Checking build configuration...');
checkFile('package.json', 'Package configuration');
checkFile('build.sh', 'Unix build script');
checkFile('build.bat', 'Windows build script');
checkFile('build/entitlements.mac.plist', 'macOS entitlements');

console.log('\n🔍 Checking documentation...');
checkFile('ELECTRON-README.md', 'Desktop documentation');
checkFile('IMPLEMENTATION-SUMMARY.md', 'Implementation summary');

console.log('\n🔍 Checking system requirements...');
checkCommand('node --version', 'Node.js');
checkCommand('npm --version', 'npm');

console.log('\n🔍 Checking dependencies...');
if (fs.existsSync('node_modules')) {
    checkNodeModules();
} else {
    console.log(`❌ Node modules: Not installed (run 'npm install')`);
    errors++;
}

console.log('\n🔍 Validating configuration...');
validatePackageJson();

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
    console.log('🎉 ALL CHECKS PASSED! Music Blocks Desktop is ready to use.');
    console.log('\nNext steps:');
    console.log('  npm run electron-dev  # Start development mode');
    console.log('  npm run electron      # Run production build');
    console.log('  npm run dist          # Build distribution package');
} else {
    if (errors > 0) {
        console.log(`❌ ${errors} error(s) found. Please fix these issues before proceeding.`);
    }
    if (warnings > 0) {
        console.log(`⚠️  ${warnings} warning(s) found. These may not prevent the app from running.`);
    }
    
    if (errors > 0) {
        console.log('\nCommon fixes:');
        console.log('  npm install           # Install missing dependencies');
        console.log('  npm audit fix         # Fix security vulnerabilities');
        console.log('  npm run lint          # Check code style');
    }
}

console.log('\nFor help, see ELECTRON-README.md or visit:');
console.log('https://github.com/sugarlabs/musicblocks/issues');

process.exit(errors > 0 ? 1 : 0);
