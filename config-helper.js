// Configuration Helper - Switch between development and production mode

const fs = require('fs');
const path = require('path');

const HUDAVERSE_PATH = __dirname;
const HTML_FILES = ['index.html', 'fahmi.html', 'hasanah.html', 'alquran.html', 'studio.html'];
const SW_FILE = 'sw.js';
const AI_SERVICE_FILE = 'js/ai-service-manager.js';

// Development configuration (for local testing)
const DEV_CONFIG = {
    baseHref: '<!-- <base href="/hudaverse/"> (Commented for local development) -->',
    swPaths: {
        static: [
            '/',
            '/index.html',
            '/alquran.html', 
            // ... other files without /hudaverse/ prefix
        ]
    },
    showApiKey: true // API key visible in code
};

// Production configuration (for GitHub Pages)
const PROD_CONFIG = {
    baseHref: '<base href="/hudaverse/">',
    swPaths: {
        static: [
            '/hudaverse/',
            '/hudaverse/index.html',
            '/hudaverse/alquran.html',
            // ... other files with /hudaverse/ prefix
        ]
    },
    showApiKey: false // API key should be hidden/removed
};

function switchToProduction() {
    console.log('🚀 Switching to PRODUCTION mode...');
    
    // Update HTML files - uncomment base href
    HTML_FILES.forEach(file => {
        const filePath = path.join(HUDAVERSE_PATH, file);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace(
                /<!-- <base href="\/hudaverse\/"> \(Commented for local development\) -->/g,
                '<base href="/hudaverse/">'
            );
            fs.writeFileSync(filePath, content);
            console.log(`✅ Updated ${file} for production`);
        }
    });
    
    // Update service worker paths
    const swPath = path.join(HUDAVERSE_PATH, SW_FILE);
    if (fs.existsSync(swPath)) {
        let swContent = fs.readFileSync(swPath, 'utf8');
        // Add /hudaverse/ prefix to all paths
        swContent = swContent.replace(/'/\//g, "'/hudaverse/");
        swContent = swContent.replace("'/hudaverse/hudaverse/", "'/hudaverse/");
        fs.writeFileSync(swPath, swContent);
        console.log('✅ Updated service worker for production');
    }
    
    // Remove API key from AI service manager
    const aiServicePath = path.join(HUDAVERSE_PATH, AI_SERVICE_FILE);
    if (fs.existsSync(aiServicePath)) {
        let content = fs.readFileSync(aiServicePath, 'utf8');
        content = content.replace(
            /this\.defaultApiKey = ".*";/,
            'this.defaultApiKey = null; // Removed for production'
        );
        fs.writeFileSync(aiServicePath, content);
        console.log('✅ Removed API key from AI service manager');
    }
    
    console.log('🎉 Production mode activated! Ready for GitHub Pages deployment.');
}

function switchToDevelopment() {
    console.log('🔧 Switching to DEVELOPMENT mode...');
    
    // Update HTML files - comment base href
    HTML_FILES.forEach(file => {
        const filePath = path.join(HUDAVERSE_PATH, file);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace(
                /<base href="\/hudaverse\/">/g,
                '<!-- <base href="/hudaverse/"> (Commented for local development) -->'
            );
            fs.writeFileSync(filePath, content);
            console.log(`✅ Updated ${file} for development`);
        }
    });
    
    // Update service worker paths
    const swPath = path.join(HUDAVERSE_PATH, SW_FILE);
    if (fs.existsSync(swPath)) {
        let swContent = fs.readFileSync(swPath, 'utf8');
        // Remove /hudaverse/ prefix from paths
        swContent = swContent.replace(/'/hudaverse/g, "'");
        fs.writeFileSync(swPath, swContent);
        console.log('✅ Updated service worker for development');
    }
    
    // Add API key back to AI service manager
    const aiServicePath = path.join(HUDAVERSE_PATH, AI_SERVICE_FILE);
    if (fs.existsSync(aiServicePath)) {
        let content = fs.readFileSync(aiServicePath, 'utf8');
        content = content.replace(
            /this\.defaultApiKey = null; \/\/ Removed for production/,
            'this.defaultApiKey = "AIzaSyDP0pV_WldmEXII9PM5qgMDbsajTM3RSLk";'
        );
        fs.writeFileSync(aiServicePath, content);
        console.log('✅ Added API key to AI service manager');
    }
    
    console.log('🔧 Development mode activated! Ready for local testing.');
}

// Command line interface
const mode = process.argv[2];

if (mode === 'prod' || mode === 'production') {
    switchToProduction();
} else if (mode === 'dev' || mode === 'development') {
    switchToDevelopment();
} else {
    console.log(`
🔧 HudaVerse Configuration Helper

Usage:
  node config-helper.js dev    - Switch to development mode (local testing)
  node config-helper.js prod   - Switch to production mode (GitHub Pages)

Current mode: Check the base href in HTML files to determine current mode.
    `);
}