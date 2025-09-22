# Deploy HidayahPath PWA ke GitHub Pages

## 🚀 Langkah-langkah Deploy

### 1. Setup Repository
```bash
# Di folder project
git add .
git commit -m "Add PWA features"
git push origin main
```

### 2. Enable GitHub Pages
1. Go to repository **Settings**
2. Scroll to **Pages** section
3. Source: **Deploy from a branch**
4. Branch: **main** atau **gh-pages**
5. Folder: **/ (root)**
6. Click **Save**

### 3. Konfigurasi untuk GitHub Pages

#### Update paths di manifest.json:
```json
{
  "start_url": "/hudaverse/",
  "scope": "/hudaverse/"
}
```

#### Update Service Worker paths di sw.js:
```javascript
const STATIC_FILES = [
  '/hudaverse/',
  '/hudaverse/index.html',
  '/hudaverse/alquran.html',
  // ... other files
];
```

### 4. Update Base URL di HTML
Tambahkan base tag di semua HTML files:
```html
<base href="/hudaverse/">
```

### 5. Fix Asset Paths
Update semua path yang absolute (/) menjadi relative:
- `/icons/` → `icons/`
- `/js/` → `js/`
- `/manifest.json` → `manifest.json`

## 🔧 Automation dengan GitHub Actions

### .github/workflows/deploy.yml:
```yaml
name: Deploy PWA to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Build PWA
      run: |
        # Add any build steps if needed
        echo "Building PWA..."
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## 🌐 URL Structure

Setelah deploy, aplikasi akan tersedia di:
```
https://idoo0.github.io/hudaverse/
```

## 📱 Testing Setelah Deploy

1. **PWA Test**: https://www.pwabuilder.com/
2. **Lighthouse Audit**: Chrome DevTools
3. **Install Test**: Chrome Android & Safari iOS
4. **Offline Test**: Disconnect internet

## ⚡ Optimasi untuk GitHub Pages

### 1. Enable Gzip Compression
GitHub Pages otomatis enable gzip untuk file text.

### 2. Optimize Images
- Kompres semua ikon
- Gunakan WebP jika perlu
- Lazy loading untuk images

### 3. Minify Assets
```bash
# Install minification tools
npm install -g html-minifier terser clean-css-cli

# Minify HTML
html-minifier --collapse-whitespace --remove-comments input.html -o output.html

# Minify JS
terser input.js -o output.min.js

# Minify CSS
cleancss input.css -o output.min.css
```

## 🔒 Security Headers

Tambahkan file `_headers` untuk Netlify atau `static.json` untuk Heroku:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## 📊 Analytics & Monitoring

### Google Analytics untuk PWA:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### PWA Analytics Events:
```javascript
// Track PWA installs
window.addEventListener('appinstalled', () => {
  gtag('event', 'pwa_install', {
    'event_category': 'PWA',
    'event_label': 'App Installed'
  });
});

// Track offline usage
window.addEventListener('offline', () => {
  gtag('event', 'pwa_offline', {
    'event_category': 'PWA',
    'event_label': 'Offline Mode'
  });
});
```

## 🎯 Performance Targets

Target untuk GitHub Pages:
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Cumulative Layout Shift**: < 0.1
- **PWA Score**: 90+

## 🚨 Common Issues & Solutions

### 1. MIME Type Issues
GitHub Pages otomatis handle MIME types untuk:
- `.json` → `application/json`
- `.js` → `text/javascript`
- `.css` → `text/css`

### 2. Cache Issues
Force cache refresh:
```javascript
// Update cache version di sw.js
const CACHE_NAME = 'hidayahpath-v1.0.1'; // increment version
```

### 3. Path Issues
Test semua links work dengan base URL:
```javascript
// Helper function untuk paths
function getBasePath() {
  return window.location.pathname.includes('/hudaverse/') ? '/hudaverse/' : '/';
}
```

## ✅ Checklist Deploy

- [ ] Repository pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Base URL updated
- [ ] All paths fixed
- [ ] Icons generated
- [ ] PWA tested locally
- [ ] HTTPS working
- [ ] Install prompt works
- [ ] Offline functionality works
- [ ] Performance optimized

## 📱 Post-Deploy Testing

1. **Desktop**: Test di Chrome, Firefox, Edge
2. **Mobile**: Test di Chrome Android, Safari iOS
3. **Install**: Test install flow
4. **Offline**: Test offline functionality
5. **Updates**: Test update notifications